import React, { useState } from "react";
import {
  Sparkles,
  Zap,
  ArrowRight,
  Code2,
  Copy,
  Check,
  BookmarkPlus,
  Compass,
  Sliders,
  Layers,
  HelpCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { AIGeneratedData } from "../types";

interface AIGeneratorProps {
  onOpenInEditor: (code: string, name: string, overlay: boolean) => void;
  onSaveToLibrary: (code: string, name: string, overlay: boolean) => void;
}

const QUICK_PROMPTS = [
  {
    title: "RSI Reversão com Vela de Confirmação",
    desc: "Sinal de CALL quando RSI cruza 30 para cima e vela fecha verde. PUT quando cruza 70 para baixo e vela fecha vermelha.",
    timeframe: "1M / 5M",
    style: "Sinais com Setas",
  },
  {
    title: "Elder Impulse System (Coloração)",
    desc: "Colorir velas em verde (impulso de alta), vermelho (impulso de baixa) e cinza (neutralidade) usando EMA 13 e MACD.",
    timeframe: "1M / 5M",
    style: "Coloração de Velas",
  },
  {
    title: "Order Flow Delta & Imbalance",
    desc: "Cálculo de delta aproximado por volume, CVD acumulado e detecção de desequilíbrios de agressão com histograma bicolor.",
    timeframe: "1M / 5M",
    style: "Painel Oscilador",
  },
  {
    title: "Cruzamento Triplo EMA 9/21/50 + Alerta",
    desc: "Cruzamento rápido das médias móveis com filtro direcional da EMA 50 e setas acima/abaixo das velas com texto CALL e PUT.",
    timeframe: "5M",
    style: "Sinais com Setas",
  },
  {
    title: "Bandas de Bollinger + Rompimento Reversão",
    desc: "Bandas com canal sombreado e sinal de reversão quando a vela fecha fora da banda e a próxima fecha de volta para dentro.",
    timeframe: "1M",
    style: "Canais e Sinais",
  },
  {
    title: "MACD Histograma Bicolor & Sinais Zero",
    desc: "Linha MACD, Signal, histograma com cores dinâmicas e marcações nos cruzamentos da linha zero e da linha de sinal.",
    timeframe: "1M / 5M",
    style: "Painel Oscilador",
  },
];

export function AIGenerator({ onOpenInEditor, onSaveToLibrary }: AIGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [timeframe, setTimeframe] = useState("1M");
  const [targetStyle, setTargetStyle] = useState("Sinais com Setas");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedData, setGeneratedData] = useState<AIGeneratedData | null>(null);
  const [copied, setCopied] = useState(false);

  // Refine prompt
  const [refineText, setRefineText] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  const handleGenerate = async (customPrompt?: string) => {
    const textToUse = customPrompt || prompt;
    if (!textToUse.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToUse,
          timeframe,
          targetStyle,
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || "Erro ao conectar com o serviço de IA.");
      }

      setGeneratedData(json.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro ao gerar o script. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!refineText.trim() || !generatedData) return;

    setIsRefining(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: refineText,
          timeframe,
          targetStyle,
          currentCode: generatedData.script,
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || "Erro ao refinar script.");
      }

      setGeneratedData(json.data);
      setRefineText("");
    } catch (err: any) {
      setError(err.message || "Erro ao refinar script.");
    } finally {
      setIsRefining(false);
    }
  };

  const handleCopyCode = async () => {
    if (!generatedData) return;
    try {
      await navigator.clipboard.writeText(generatedData.script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div id="ai-generator-module" className="space-y-6 max-w-5xl mx-auto">
      {/* Hero card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48 text-emerald-400" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Zap className="w-3.5 h-3.5" /> IA Treinada com Sintaxe Oficial QuadCode Script
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            O que você deseja que seu indicador faça?
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            Descreva suas regras de entrada, médias, cruzamentos ou filtros. A IA gera código QCS (.lua) 100% testado, com <code className="text-emerald-300 font-mono">overlay</code> configurado corretamente para não ficar transparente nem invisível.
          </p>
        </div>

        {/* Input area */}
        <div className="relative z-10 bg-slate-950/90 border border-slate-800 rounded-xl p-4 shadow-inner">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="Exemplo: Quero um indicador para 1 minuto que use RSI 14 e duas médias EMA 9 e 21. Quando a EMA 9 cruzar para cima da 21 e o RSI estiver acima de 50, dar sinal com seta verde de CALL..."
            className="w-full bg-transparent text-white placeholder-slate-500 text-sm outline-none resize-none leading-relaxed"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-2 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Timeframe */}
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Timeframe:</span>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-emerald-500"
                >
                  <option value="1M">1 Minuto (M1)</option>
                  <option value="5M">5 Minutos (M5)</option>
                  <option value="15M">15 Minutos (M15)</option>
                  <option value="1H">1 Hora (H1)</option>
                </select>
              </div>

              {/* Style */}
              <div className="flex items-center gap-1.5 text-slate-400">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>Estilo Visual:</span>
                <select
                  value={targetStyle}
                  onChange={(e) => setTargetStyle(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-emerald-500"
                >
                  <option value="Sinais com Setas">Setas CALL / PUT (plot_shape)</option>
                  <option value="Coloração de Velas">Coloração de Velas (plot_candle)</option>
                  <option value="Painel Oscilador">Subjanela com Oscilador (overlay=false)</option>
                  <option value="Canais e Bandas">Canais com Preenchimento (fill)</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => handleGenerate()}
              disabled={isLoading || !prompt.trim()}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
                isLoading || !prompt.trim()
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/50 hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "Compilando Script QCS..." : "Gerar Script IQ Option"}
            </button>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mt-4 p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Erro ao processar:</span> {error}
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts Chips */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Compass className="w-4 h-4 text-emerald-400" />
          Sugestões Rápidas de Estratégias Populares
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(qp.desc);
                setTimeframe(qp.timeframe.includes("1M") ? "1M" : "5M");
                setTargetStyle(qp.style);
                handleGenerate(qp.desc);
              }}
              className="group text-left p-3.5 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 rounded-xl transition-all shadow-sm hover:shadow-emerald-950/20"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200 group-hover:text-emerald-300 mb-1">
                <span>{qp.title}</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {qp.desc}
              </p>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                <span>⏱️ {qp.timeframe}</span>
                <span>•</span>
                <span>🎨 {qp.style}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Generated Result Display */}
      {generatedData && (
        <div id="ai-generated-result-card" className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-0">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-5 bg-slate-950 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  Script Gerado com Sucesso
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                    generatedData.overlay
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : "bg-blue-950 text-blue-300 border border-blue-800"
                  }`}
                >
                  {generatedData.overlay ? "overlay = true (Gráfico)" : "overlay = false (Subjanela)"}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">{generatedData.name}</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  copied
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copiado!" : "Copiar"}
              </button>

              <button
                onClick={() =>
                  onSaveToLibrary(
                    generatedData.script,
                    generatedData.name,
                    generatedData.overlay
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all"
              >
                <BookmarkPlus className="w-3.5 h-3.5 text-amber-400" />
                Salvar na Lib
              </button>

              <button
                onClick={() =>
                  onOpenInEditor(
                    generatedData.script,
                    generatedData.name,
                    generatedData.overlay
                  )
                }
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow transition-all"
              >
                <Code2 className="w-3.5 h-3.5" /> Abrir no Editor
              </button>
            </div>
          </div>

          {/* Operational guide & features */}
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/60 border-b border-slate-800 text-xs text-slate-300">
            <div className="space-y-2">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                Como Operar com este Indicador:
              </span>
              <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                {generatedData.howToTrade}
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                Destaques e Lógica:
              </span>
              <ul className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                {generatedData.keyFeatures?.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Code preview block */}
          <div className="relative font-mono text-xs bg-[#090d16] p-4 max-h-80 overflow-auto text-slate-200 border-b border-slate-800">
            <pre>{generatedData.script}</pre>
          </div>

          {/* Refine with AI bar */}
          <div className="p-4 bg-slate-950 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={refineText}
              onChange={(e) => setRefineText(e.target.value)}
              placeholder="Refinar com IA: ex: Adicionar filtro de média 200, diminuir período do RSI..."
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleRefine}
              disabled={isRefining || !refineText.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isRefining ? "animate-spin" : ""}`} />
              {isRefining ? "Refinando..." : "Refinar com IA"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
