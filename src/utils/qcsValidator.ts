import { QCSValidationResult, QCSValidationMessage } from "../types";

export function validateQCSCode(code: string): QCSValidationResult {
  const messages: QCSValidationMessage[] = [];
  const lines = code.split("\n");
  const trimmedCode = code.trim();

  if (!trimmedCode) {
    return {
      isValid: false,
      hasOverlay: false,
      messages: [
        {
          type: "warning",
          message: "O editor está vazio. Digite um script ou gere com IA.",
        },
      ],
    };
  }

  // 1. Check for instrument block
  const instrumentMatch = code.match(/instrument\s*\{([^}]+)\}/);
  let instrumentName: string | undefined;
  let overlayType: boolean | undefined;
  let hasOverlay = false;

  if (!instrumentMatch) {
    messages.push({
      type: "error",
      message: "Falta o bloco obrigatório 'instrument { name = \"...\", icon = \"...\", overlay = boolean }'.",
      suggestion:
        'Adicione na primeira linha: instrument { name = "Meu Indicador", icon = "indicators:MA", overlay = true }',
      fixable: true,
    });
  } else {
    const instrumentBody = instrumentMatch[1];
    
    // Extract name
    const nameMatch = instrumentBody.match(/name\s*=\s*["']([^"']+)["']/);
    if (nameMatch) {
      instrumentName = nameMatch[1];
    } else {
      messages.push({
        type: "warning",
        message: "O bloco 'instrument' deve conter um 'name = \"...\"'.",
      });
    }

    // Extract overlay
    const overlayMatch = instrumentBody.match(/overlay\s*=\s*(true|false)/);
    if (overlayMatch) {
      hasOverlay = true;
      overlayType = overlayMatch[1] === "true";
      messages.push({
        type: "info",
        message: overlayType
          ? "Modo Overlay ATIVO: O indicador será renderizado diretamente sobre o gráfico de velas."
          : "Modo Subjanela ATIVO: O indicador será renderizado em painel separado abaixo do gráfico.",
      });
    } else {
      messages.push({
        type: "error",
        message:
          "Parâmetro 'overlay' ausente no instrument! O indicador ficará transparente ou invisível na IQ Option.",
        suggestion:
          "Defina 'overlay = true' (para gráfico de velas) ou 'overlay = false' (para painel separado como RSI/MACD).",
        fixable: true,
      });
    }
  }

  // 2. Check for PineScript / TradingView leaks
  if (/ta\.(ema|sma|rsi|macd|supertrend|atr)/i.test(code)) {
    messages.push({
      type: "error",
      message:
        "Detectada sintaxe de PineScript (ex: ta.ema, ta.rsi). Na IQ Option use funções nativas diretas: ema(close, 14), rsi(close, 14).",
      suggestion: "Substitua prefixos 'ta.' pelas funções globais QCS.",
    });
  }
  if (/plotshape\s*\(/i.test(code)) {
    messages.push({
      type: "error",
      message: "Detectado 'plotshape' (PineScript). Na IQ Option use 'plot_shape(...)'.",
      suggestion: "Mude 'plotshape' para 'plot_shape'.",
      fixable: true,
    });
  }
  if (/input\.int\s*\(/i.test(code) || /input\.float\s*\(/i.test(code)) {
    messages.push({
      type: "error",
      message: "Detectado 'input.int' ou 'input.float' (PineScript). No QCS use 'input.integer' ou 'input.double'.",
    });
  }

  // 3. Check for MQL4/MQL5 leaks
  if (/iRSI|iMA|iBands|iCustom|OnInit|OnCalculate/i.test(code)) {
    messages.push({
      type: "error",
      message: "Detectado código MetaTrader (MQL). O QCS é baseado em Lua 5.3 e não suporta funções iRSI/iMA.",
    });
  }

  // 4. Check for obsolete or fake QCS syntax
  if (/function\s+update\s*\(/i.test(code) || /output\.line\s*\(/i.test(code)) {
    messages.push({
      type: "error",
      message:
        "Detectada função 'update()' ou 'output.line()' de mocks antigos. O QCS é reativo e usa funções de plotagem no escopo raiz.",
    });
  }

  // 5. Check for Plot outputs
  const hasPlot =
    /plot\s*\(|plot_shape\s*\(|plot_candle\s*\(|hline\s*\(|rect\s*\{|fill\s*\(/.test(
      code
    );
  if (!hasPlot) {
    messages.push({
      type: "warning",
      message:
        "Nenhuma função de saída gráfica encontrada (plot, plot_shape, plot_candle, hline, rect, fill). O script pode não desenhar nada na tela.",
    });
  }

  // 6. Check Lua if / end balance
  let ifCount = 0;
  let endCount = 0;
  lines.forEach((line, idx) => {
    // Strip comments
    const cleanLine = line.replace(/--.*$/, "").trim();
    if (/\bif\b/.test(cleanLine)) ifCount++;
    if (/\bend\b/.test(cleanLine)) endCount++;
  });

  if (ifCount !== endCount) {
    messages.push({
      type: "error",
      message: `Desbalanceamento de blocos condicionais: ${ifCount} 'if' encontrado(s) contra ${endCount} 'end'.`,
      suggestion: "Verifique se todos os 'if ... then' possuem um 'end' correspondente.",
    });
  }

  // 7. Check shape_style constants
  if (/plot_shape/i.test(code) && !/shape_style\./i.test(code)) {
    messages.push({
      type: "warning",
      message:
        "Em plot_shape, use constantes shape_style (ex: shape_style.triangleup, shape_style.triangledown, shape_style.arrowup).",
    });
  }

  const hasErrors = messages.some((m) => m.type === "error");

  if (!hasErrors) {
    messages.unshift({
      type: "success",
      message: "Sintaxe e estrutura QuadCode Script (QCS) válidas! Pronto para uso na IQ Option.",
    });
  }

  return {
    isValid: !hasErrors,
    hasOverlay,
    overlayType,
    instrumentName,
    messages,
  };
}

export function autoFixQCSCode(code: string): string {
  let fixed = code;

  // Fix PineScript plotshape -> plot_shape
  fixed = fixed.replace(/plotshape\s*\(/g, "plot_shape(");

  // Fix ta.ema -> ema, ta.rsi -> rsi, ta.sma -> sma
  fixed = fixed.replace(/ta\.(ema|sma|rsi|macd|atr|wma|rma)/gi, "$1");

  // Fix input.int -> input.integer, input.float -> input.double
  fixed = fixed.replace(/input\.int\b/g, "input.integer");
  fixed = fixed.replace(/input\.float\b/g, "input.double");

  // If missing instrument entirely, prepend template
  if (!/instrument\s*\{/.test(fixed)) {
    fixed = `instrument {\n    name = "Meu Indicador IQ",\n    icon = "indicators:MA",\n    overlay = true\n}\n\n` + fixed;
  } else {
    // If instrument exists but missing overlay
    if (/instrument\s*\{[^}]+\}/.test(fixed) && !/overlay\s*=\s*(true|false)/.test(fixed)) {
      fixed = fixed.replace(/(instrument\s*\{[^}]+)/, `$1,\n    overlay = true`);
    }
  }

  return fixed;
}
