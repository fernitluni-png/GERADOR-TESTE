import React, { useState } from "react";
import {
  Bookmark,
  Search,
  Trash2,
  Download,
  Copy,
  Check,
  Code2,
  Edit2,
  Calendar,
  Sparkles,
  Plus,
} from "lucide-react";
import { SavedScript } from "../types";

interface MyLibraryProps {
  scripts: SavedScript[];
  onSelectScript: (script: SavedScript) => void;
  onDeleteScript: (id: string) => void;
  onUpdateScript: (script: SavedScript) => void;
  onNewScript: () => void;
}

export function MyLibrary({
  scripts,
  onSelectScript,
  onDeleteScript,
  onUpdateScript,
  onNewScript,
}: MyLibraryProps) {
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const filtered = scripts.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase())
  );

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

  const handleDownload = (script: SavedScript, e: React.MouseEvent) => {
    e.stopPropagation();
    const filename = `${script.name.toLowerCase().replace(/[^a-z0-9]/g, "_") || "meu_script"}.lua`;
    const blob = new Blob([script.code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const startRename = (script: SavedScript, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(script.id);
    setEditName(script.name);
  };

  const saveRename = (script: SavedScript, e: React.FormEvent) => {
    e.preventDefault();
    if (editName.trim()) {
      onUpdateScript({ ...script, name: editName.trim(), updatedAt: Date.now() });
    }
    setEditingId(null);
  };

  return (
    <div id="my-library-module" className="space-y-6 max-w-5xl mx-auto">
      {/* Top bar with search and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar nos seus scripts salvos..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewScript}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg shadow transition-all"
          >
            <Plus className="w-4 h-4" /> Criar Novo Script
          </button>
        </div>
      </div>

      {/* Grid of Saved Scripts */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((script) => {
            const isCopied = copiedId === script.id;
            const isEditing = editingId === script.id;

            return (
              <div
                key={script.id}
                className="flex flex-col justify-between bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        script.overlay
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : "bg-blue-950 text-blue-300 border border-blue-800"
                      }`}
                    >
                      {script.overlay ? "overlay = true" : "overlay = false"}
                    </span>

                    <span className="flex items-center gap-1 text-[10px] text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(script.updatedAt || script.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {isEditing ? (
                    <form onSubmit={(e) => saveRename(script, e)} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                        className="flex-1 px-2 py-1 bg-slate-950 border border-emerald-500 rounded text-xs text-white outline-none"
                      />
                      <button
                        type="submit"
                        className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-semibold"
                      >
                        OK
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {script.name}
                      </h3>
                      <button
                        onClick={(e) => startRename(script, e)}
                        title="Renomear"
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-white text-slate-400 transition-opacity"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {script.description || "Script personalizado para IQ Option."}
                  </p>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleCopy(script.code, script.id, e)}
                      title="Copiar código"
                      className={`p-1.5 rounded-lg border text-xs transition-all ${
                        isCopied
                          ? "bg-emerald-500 text-slate-950 border-emerald-500"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={(e) => handleDownload(script, e)}
                      title="Baixar .lua"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                    >
                      <Download className="w-3.5 h-3.5 text-sky-400" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Excluir script "${script.name}"?`)) {
                          onDeleteScript(script.id);
                        }
                      }}
                      title="Excluir"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-700 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectScript(script)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow transition-all"
                  >
                    <Code2 className="w-3.5 h-3.5" /> Abrir no Editor
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200 mb-1">
            {search ? "Nenhum script corresponde à busca" : "Sua biblioteca pessoal está vazia"}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
            Gere scripts sob medida com a IA ou abra qualquer template pronto e clique em "Salvar" para guardar seus indicadores favoritos aqui.
          </p>
          <button
            onClick={onNewScript}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow"
          >
            <Sparkles className="w-4 h-4" /> Criar Meu Primeiro Script
          </button>
        </div>
      )}
    </div>
  );
}
