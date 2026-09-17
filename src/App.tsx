import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Code2,
  BookOpen,
  Bookmark,
  FileCode2,
  TrendingUp,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { AIGenerator } from "./components/AIGenerator";
import { CodeEditor } from "./components/CodeEditor";
import { TemplatesLibrary } from "./components/TemplatesLibrary";
import { MyLibrary } from "./components/MyLibrary";
import { QCSDocs } from "./components/QCSDocs";
import { SavedScript, QCSTemplate } from "./types";
import { QCS_TEMPLATES } from "./data/templates";

const STORAGE_KEY = "iq_qcs_saved_scripts_v1";

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "generator" | "editor" | "templates" | "library" | "docs"
  >("generator");

  // Current working script in the editor
  const [currentCode, setCurrentCode] = useState<string>(
    QCS_TEMPLATES[1].code // Elder Impulse System by default
  );

  const [savedScripts, setSavedScripts] = useState<SavedScript[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Seed initial favorites
    return [
      {
        id: "seed-elder",
        name: "Elder Impulse System (Oficial)",
        description: "Coloração de velas em verde, vermelho e cinza com MACD e EMA 13.",
        code: QCS_TEMPLATES[1].code,
        overlay: true,
        icon: "indicators:MA",
        tags: ["Oficial", "Coloração", "Elder"],
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 86400000,
        source: "template",
      },
      {
        id: "seed-orderflow",
        name: "Orderflow Delta Suite & CVD",
        description: "Cumulative Volume Delta, desequilíbrio e absorção institucional.",
        code: QCS_TEMPLATES[0].code,
        overlay: false,
        icon: "indicators:MACD",
        tags: ["Orderflow", "CVD", "Volume"],
        createdAt: Date.now() - 43200000,
        updatedAt: Date.now() - 43200000,
        source: "template",
      },
    ];
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedScripts));
    } catch (e) {
      console.error(e);
    }
  }, [savedScripts]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Open script in editor
  const handleOpenInEditor = (code: string, name?: string, _overlay?: boolean) => {
    setCurrentCode(code);
    setActiveTab("editor");
    showToast(`Script "${name || "Indicador"}" carregado no editor!`);
  };

  // Save script to personal library
  const handleSaveToLibrary = (code: string, name: string, overlay: boolean) => {
    const newScript: SavedScript = {
      id: "script-" + Date.now(),
      name: name || "Novo Indicador IQ Option",
      description: `Salvo em ${new Date().toLocaleDateString()} às ${new Date().toLocaleTimeString()}`,
      code,
      overlay,
      icon: overlay ? "indicators:MA" : "indicators:RSI",
      tags: [overlay ? "Overlay" : "Subjanela"],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      source: "custom",
    };

    setSavedScripts((prev) => [newScript, ...prev]);
    showToast(`"${name}" salvo com sucesso na sua biblioteca!`);
  };

  // Select template
  const handleSelectTemplate = (template: QCSTemplate) => {
    setCurrentCode(template.code);
    setActiveTab("editor");
    showToast(`Template "${template.title}" aberto no editor!`);
  };

  // Delete script
  const handleDeleteScript = (id: string) => {
    setSavedScripts((prev) => prev.filter((s) => s.id !== id));
    showToast("Script excluído da biblioteca.");
  };

  // Update script in library
  const handleUpdateScript = (updated: SavedScript) => {
    setSavedScripts((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
    showToast("Script atualizado com sucesso!");
  };

  // New blank script
  const handleNewScript = () => {
    const blank = `instrument {\n    name = "Novo Indicador IQ",\n    icon = "indicators:MA",\n    overlay = true\n}\n\ninput_group {\n    "Configurações",\n    period = input(14, "Período", input.integer, 1, 100)\n}\n\nmedia = sma(close, period)\nplot(media, "Média", "yellow", 2)\n`;
    setCurrentCode(blank);
    setActiveTab("editor");
    showToast("Novo script criado no editor.");
  };

  // Optimize with AI
  const handleOptimizeWithAI = async (code: string) => {
    setIsOptimizing(true);
    try {
      const response = await fetch("/api/optimize-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          instruction: "Garantir sintaxe QCS oficial, verificar overlay e otimizar sinais.",
        }),
      });

      const json = await response.json();
      if (response.ok && json.success && json.data?.script) {
        setCurrentCode(json.data.script);
        showToast("Script otimizado e corrigido com IA!");
      } else {
        throw new Error(json.error || "Falha ao otimizar");
      }
    } catch (e: any) {
      alert("Erro na otimização: " + (e.message || "Tente novamente."));
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div id="qcs-app-root" className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-2xl animate-fade-in border border-emerald-400/40">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-white tracking-tight">
                  IQ Option Script Studio
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  QCS • Lua 5.3
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Gerador de Scripts, Biblioteca de Estratégias &amp; Validador
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab("generator")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === "generator"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gerar com IA</span>
            </button>

            <button
              onClick={() => setActiveTab("editor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === "editor"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Editor &amp; Teste</span>
            </button>

            <button
              onClick={() => setActiveTab("templates")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === "templates"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Templates ({QCS_TEMPLATES.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("library")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === "library"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Minha Lib ({savedScripts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("docs")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === "docs"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Documentação QCS</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto flex flex-col">
        {activeTab === "generator" && (
          <AIGenerator
            onOpenInEditor={handleOpenInEditor}
            onSaveToLibrary={handleSaveToLibrary}
          />
        )}

        {activeTab === "editor" && (
          <div className="flex-1 min-h-[580px] flex flex-col">
            <CodeEditor
              code={currentCode}
              onChange={setCurrentCode}
              onSaveToLibrary={handleSaveToLibrary}
              onOptimizeWithAI={handleOptimizeWithAI}
              isOptimizing={isOptimizing}
            />
          </div>
        )}

        {activeTab === "templates" && (
          <TemplatesLibrary onSelectTemplate={handleSelectTemplate} />
        )}

        {activeTab === "library" && (
          <MyLibrary
            scripts={savedScripts}
            onSelectScript={(s) => handleOpenInEditor(s.code, s.name, s.overlay)}
            onDeleteScript={handleDeleteScript}
            onUpdateScript={handleUpdateScript}
            onNewScript={handleNewScript}
          />
        )}

        {activeTab === "docs" && <QCSDocs />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 px-4 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Compatibilidade 100% com o interpretador QuadCode Script da IQ Option</span>
          </div>
          <span>QuadCode Script Docs Reference • Lua 5.3 Engine</span>
        </div>
      </footer>
    </div>
  );
}
