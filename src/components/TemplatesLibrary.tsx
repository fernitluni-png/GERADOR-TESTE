import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  Filter,
  Check,
  Copy,
  Code2,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";
import { QCS_TEMPLATES } from "../data/templates";
import { QCSTemplate } from "../types";

interface TemplatesLibraryProps {
  onSelectTemplate: (template: QCSTemplate) => void;
}

export function TemplatesLibrary({ onSelectTemplate }: TemplatesLibraryProps) {
  const [search, setSearch] = useState("");
  const [filterOverlay, setFilterOverlay] = useState<"all" | "overlay" | "subwindow">("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredTemplates = useMemo(() => {
    return QCS_TEMPLATES.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

      const matchOverlay =
        filterOverlay === "all"
          ? true
          : filterOverlay === "overlay"
          ? t.overlay === true
          : t.overlay === false;

      const matchDiff =
        filterDifficulty === "all" ? true : t.difficulty === filterDifficulty;

      return matchSearch && matchOverlay && matchDiff;
    });
  }, [search, filterOverlay, filterDifficulty]);

  const handleCopy = async (code: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="templates-library-module" className="space-y-6 max-w-6xl mx-auto">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, estratégia (ex: CVD, Elder, MACD, Bollinger, RSI)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterOverlay}
              onChange={(e) => setFilterOverlay(e.target.value as any)}
              className="bg-transparent text-slate-300 outline-none cursor-pointer"
            >
              <option value="all">Todos os Modos</option>
              <option value="overlay">Gráfico (overlay = true)</option>
              <option value="subwindow">Painel Separado (overlay = false)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="bg-transparent text-slate-300 outline-none cursor-pointer"
            >
              <option value="all">Todas Dificuldades</option>
              <option value="Iniciante">Iniciante</option>
              <option value="Intermediário">Intermediário</option>
              <option value="Avançado">Avançado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => {
          const isCopied = copiedId === template.id;

          return (
            <div
              key={template.id}
              className="flex flex-col justify-between bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-md transition-all hover:shadow-xl hover:translate-y-[-2px] group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      template.overlay
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : "bg-blue-950 text-blue-300 border border-blue-800"
                    }`}
                  >
                    {template.overlay ? "overlay = true" : "overlay = false"}
                  </span>

                  <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {template.difficulty}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors mb-2">
                  {template.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3">
                  {template.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {template.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-950/80 text-[10px] text-slate-400 border border-slate-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={(e) => handleCopy(template.code, template.id, e)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isCopied
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  }`}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {isCopied ? "Copiado!" : "Copiar"}
                </button>

                <button
                  onClick={() => onSelectTemplate(template)}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow transition-all"
                >
                  <Code2 className="w-3.5 h-3.5" /> Abrir no Editor
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-xl">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">
            Nenhum template encontrado com os filtros atuais.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Tente buscar com outro termo ou redefinir os filtros.
          </p>
        </div>
      )}
    </div>
  );
}
