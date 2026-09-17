import React, { useState, useMemo } from "react";
import {
  Copy,
  Check,
  Download,
  BookmarkPlus,
  Wand2,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Code2,
  Wrench,
  HelpCircle,
} from "lucide-react";
import { validateQCSCode, autoFixQCSCode } from "../utils/qcsValidator";
import { ChartSimulator } from "./ChartSimulator";

interface CodeEditorProps {
  code: string;
  onChange: (newCode: string) => void;
  onSaveToLibrary?: (code: string, name: string, overlay: boolean) => void;
  onOptimizeWithAI?: (code: string) => void;
  isOptimizing?: boolean;
}

export function CodeEditor({
  code,
  onChange,
  onSaveToLibrary,
  onOptimizeWithAI,
  isOptimizing = false,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [scriptTitle, setScriptTitle] = useState("");

  const validation = useMemo(() => validateQCSCode(code), [code]);

  // Extract name for display
  const detectedName = validation.instrumentName || "Indicador IQ Option";
  const overlay = validation.overlayType ?? true;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Falha ao copiar:", err);
    }
  };

  const handleDownload = () => {
    const filename = `${detectedName.toLowerCase().replace(/[^a-z0-9]/g, "_") || "script_iqoption"}.lua`;
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAutoFix = () => {
    const fixed = autoFixQCSCode(code);
    onChange(fixed);
  };

  const openSaveModal = () => {
    setScriptTitle(detectedName);
    setSaveModalOpen(true);
  };

  const confirmSave = () => {
    if (onSaveToLibrary) {
      onSaveToLibrary(code, scriptTitle || detectedName, overlay);
    }
    setSaveModalOpen(false);
  };

  const lines = code.split("\n");

  return (
    <div id="qcs-editor-container" className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Editor Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab("code")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activeTab === "code"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" /> Código QCS
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activeTab === "preview"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Simulação Visual
            </button>
          </div>

          <span className="hidden sm:inline-block text-xs font-mono text-slate-400 bg-slate-950/60 px-2 py-1 rounded border border-slate-800/80">
            {detectedName}
          </span>
        </div>

        {/* Actions buttons */}
        <div className="flex items-center gap-2">
          {onOptimizeWithAI && (
            <button
              onClick={() => onOptimizeWithAI(code)}
              disabled={isOptimizing}
              title="Analisar e Otimizar com IA"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/40 rounded-lg transition-all"
            >
              <Wand2 className={`w-3.5 h-3.5 ${isOptimizing ? "animate-spin" : ""}`} />
              {isOptimizing ? "Otimizando..." : "Otimizar IA"}
            </button>
          )}

          <button
            onClick={openSaveModal}
            title="Salvar na Minha Biblioteca"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-amber-400" />
            Salvar
          </button>

          <button
            onClick={handleDownload}
            title="Baixar arquivo .lua"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            .lua
          </button>

          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all shadow-sm ${
              copied
                ? "bg-emerald-500 text-slate-950 font-bold"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" /> Copiado!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copiar Script
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content: Code vs Preview */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {activeTab === "code" ? (
          <div className="flex-1 flex overflow-hidden font-mono text-xs">
            {/* Line numbers */}
            <div className="select-none py-4 px-3 bg-slate-950/80 border-r border-slate-800/80 text-slate-600 text-right font-mono min-w-[44px]">
              {lines.map((_, i) => (
                <div key={i} className="leading-6">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Editable code textarea */}
            <textarea
              id="qcs-code-textarea"
              value={code}
              onChange={(e) => onChange(e.target.value)}
              spellCheck={false}
              className="flex-1 p-4 bg-[#090d16] text-slate-100 resize-none outline-none leading-6 font-mono selection:bg-emerald-500/30 overflow-auto whitespace-pre tab-[4]"
              placeholder="Cole ou digite seu script QCS (.lua) aqui..."
            />
          </div>
        ) : (
          <div className="p-4 flex-1 overflow-auto bg-[#070a12]">
            <ChartSimulator
              code={code}
              overlay={overlay}
              scriptName={detectedName}
            />
          </div>
        )}
      </div>

      {/* Validation & Diagnostics Footer Bar */}
      <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {validation.isValid ? (
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Sintaxe QCS 100% Válida</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-rose-400 font-medium">
              <AlertTriangle className="w-4 h-4" />
              <span>Atenção na Sintaxe / Estrutura</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 ml-2">
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                overlay
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                  : "bg-blue-950 text-blue-300 border border-blue-800"
              }`}
            >
              overlay: {overlay ? "true (gráfico)" : "false (painel)"}
            </span>
          </div>

          {validation.messages.find((m) => m.type === "error") && (
            <span className="text-rose-300 text-[11px] truncate max-w-md">
              {validation.messages.find((m) => m.type === "error")?.message}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {validation.messages.some((m) => m.fixable) && (
            <button
              onClick={handleAutoFix}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 rounded transition-all"
            >
              <Wrench className="w-3 h-3" /> Auto-Corrigir
            </button>
          )}

          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-slate-500" />
            <span>Cole no IQ Option &gt; Indicadores &gt; Scripts &gt; Adicionar Novo</span>
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-md w-full shadow-2xl text-slate-200">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <BookmarkPlus className="w-5 h-5 text-amber-400" /> Salvar na Minha Biblioteca
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              O script ficará salvo no armazenamento local do seu navegador para acesso rápido e exportação.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome do Indicador
                </label>
                <input
                  type="text"
                  value={scriptTitle}
                  onChange={(e) => setScriptTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-emerald-500"
                  placeholder="Ex: Minha Estratégia RSI + EMA"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="font-semibold text-slate-300">Modo de Exibição:</span>
                <span className="text-emerald-400">
                  {overlay ? "Overlay no Gráfico Principal" : "Painel Separado (Subjanela)"}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSaveModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmSave}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow transition-all"
              >
                Confirmar e Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
