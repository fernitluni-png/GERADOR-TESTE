import React, { useState } from "react";
import {
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Code,
  Layers,
  Sparkles,
  Sliders,
  ExternalLink,
  ChevronRight,
  Info,
  Check,
  Copy,
} from "lucide-react";

export function QCSDocs() {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div id="qcs-documentation-module" className="space-y-8 max-w-5xl mx-auto text-slate-200">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
          <BookOpen className="w-4 h-4" /> Documentação Oficial QuadCode Script (QCS)
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Manual Completo de Desenvolvimento para IQ Option
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          A corretora IQ Option utiliza o interpretador <strong>QuadCode Script (QCS)</strong>, uma linguagem proprietária de alta performance baseada em <strong>Lua 5.3</strong>. Os scripts rodam em tempo real, calculando vela por vela de forma reativa.
        </p>
      </div>

      {/* Step by step: How to paste into IQ Option */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          Como Instalar Qualquer Script na IQ Option em 4 Passos
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center text-sm mb-3">
                1
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Abra os Indicadores</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Na plataforma IQ Option, clique no ícone de <strong>Indicadores</strong> no canto inferior esquerdo do gráfico.
              </p>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center text-sm mb-3">
                2
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Aba Scripts</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Selecione a aba <strong>Scripts</strong> e depois clique no botão verde <strong>"Adicionar novo script"</strong>.
              </p>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center text-sm mb-3">
                3
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Cole o Código</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Apague todo o texto padrão do editor da IQ Option e cole o código gerado pelo nosso Studio. Clique em <strong>Salvar</strong>.
              </p>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center text-sm mb-3">
                4
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Aplique ao Gráfico</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Na lista de Scripts Salvos, clique no seu indicador, ajuste os parâmetros se desejar e clique em <strong>Aplicar</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Rule: The Overlay Rule */}
      <div className="bg-amber-950/20 border border-amber-500/40 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
          <AlertTriangle className="w-4 h-4" /> A Regra Crítica do Overlay (Evite o Indicador Invisível!)
        </div>
        <h3 className="text-lg font-bold text-white mb-3">
          Por que alguns scripts ficam transparentes ou não aparecem?
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          Na IQ Option, a propriedade <code className="text-amber-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded">overlay</code> dentro do cabeçalho <code className="text-amber-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded">instrument</code> é <strong>estritamente obrigatória</strong>:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950/80 rounded-xl border border-emerald-500/30">
            <span className="text-xs font-bold text-emerald-400 block mb-1">
              overlay = true (Sobre o Gráfico)
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
              Utilize para qualquer indicador que precisa desenhar sobre as velas: Médias Móveis (EMA, SMA), Bandas de Bollinger, Canais, Suporte/Resistência, Parabolic SAR, e <strong>plot_candle</strong> (coloração de velas).
            </p>
            <div className="bg-slate-900 p-2 rounded font-mono text-[11px] text-slate-200">
              instrument &#123; name = "Minhas EMAs", icon = "indicators:MA", overlay = true &#125;
            </div>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-xl border border-blue-500/30">
            <span className="text-xs font-bold text-sky-400 block mb-1">
              overlay = false (Painel Separado)
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
              Utilize para osciladores que possuem escala própria diferente do preço: RSI, MACD, Estocástico, Histograma, CVD (Cumulative Volume Delta) e Volume.
            </p>
            <div className="bg-slate-900 p-2 rounded font-mono text-[11px] text-slate-200">
              instrument &#123; name = "Meu RSI", icon = "indicators:RSI", overlay = false &#125;
            </div>
          </div>
        </div>
      </div>

      {/* Inputs Reference */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-emerald-400" />
          Como Definir Entradas e Parâmetros (input &amp; input_group)
        </h3>

        <p className="text-xs text-slate-300 leading-relaxed">
          Os inputs permitem que o trader altere períodos, cores e opções na janela de configuração da IQ Option:
        </p>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 space-y-2 overflow-x-auto relative">
          <button
            onClick={() =>
              copyCode(
                `input_group {\n    "Configurações",\n    period = input(14, "Período", input.integer, 1, 100),\n    multiplier = input(2.0, "Desvio", input.double, 0.1, 10.0),\n    show_arrows = input(true, "Exibir Setas", input.boolean)\n}\n\ninput_group {\n    "Cores",\n    c_up = input { default = "#2CAC40", type = input.color },\n    c_dn = input { default = "#DB4931", type = input.color }\n}`,
                "inputs"
              )
            }
            className="absolute top-3 right-3 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center gap-1"
          >
            {copiedSnippet === "inputs" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copiedSnippet === "inputs" ? "Copiado" : "Copiar"}
          </button>
          <pre>{`input_group {
    "Configurações",
    period = input(14, "Período", input.integer, 1, 100),
    multiplier = input(2.0, "Desvio", input.double, 0.1, 10.0),
    show_arrows = input(true, "Exibir Setas", input.boolean)
}

input_group {
    "Cores",
    c_up = input { default = "#2CAC40", type = input.color },
    c_dn = input { default = "#DB4931", type = input.color }
}`}</pre>
        </div>
      </div>

      {/* Built-in Functions & Shapes Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Code className="w-5 h-5 text-emerald-400" />
          Tabela de Funções Nativas do QuadCode Script
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                <th className="p-3 font-semibold">Função / Série</th>
                <th className="p-3 font-semibold">Descrição</th>
                <th className="p-3 font-semibold">Exemplo de Uso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="p-3 font-mono text-emerald-400">ema(source, period)</td>
                <td className="p-3">Média Móvel Exponencial rápida e responsiva.</td>
                <td className="p-3 font-mono text-slate-400">media_9 = ema(close, 9)</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-emerald-400">sma(source, period)</td>
                <td className="p-3">Média Móvel Simples aritmética.</td>
                <td className="p-3 font-mono text-slate-400">media_20 = sma(close, 20)</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-emerald-400">rsi(source, period)</td>
                <td className="p-3">Índice de Força Relativa nativo (0 a 100).</td>
                <td className="p-3 font-mono text-slate-400">rsi_val = rsi(close, 14)</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-emerald-400">crossover(a, b)</td>
                <td className="p-3">Retorna true no momento exato em que a série A cruza para CIMA de B.</td>
                <td className="p-3 font-mono text-slate-400">buy = crossover(ema9, ema21)</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-emerald-400">crossunder(a, b)</td>
                <td className="p-3">Retorna true no momento exato em que a série A cruza para BAIXO de B.</td>
                <td className="p-3 font-mono text-slate-400">sell = crossunder(ema9, ema21)</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-emerald-400">plot_shape(...)</td>
                <td className="p-3">Desenha setas, triângulos e sinais de CALL/PUT no gráfico.</td>
                <td className="p-3 font-mono text-slate-400">plot_shape(buy, "CALL", shape_style.triangleup, ...)</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-emerald-400">plot_candle(...)</td>
                <td className="p-3">Altera dinamicamente as cores dos candles (estilo Elder Impulse).</td>
                <td className="p-3 font-mono text-slate-400">plot_candle(open, high, low, close, "Velas", cor)</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-emerald-400">iff(cond, val_true, val_false)</td>
                <td className="p-3">Operador ternário inline rápido.</td>
                <td className="p-3 font-mono text-slate-400">cor = iff(close &gt; open, "green", "red")</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-emerald-400">nz(val, fallback)</td>
                <td className="p-3">Protege contra valores nil / NaN no início do gráfico.</td>
                <td className="p-3 font-mono text-slate-400">total = nz(total[1]) + delta</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
