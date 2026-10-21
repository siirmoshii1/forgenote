import React, { useState } from 'react';
import {
  Code2,
  FileCode,
  Copy,
  Check,
  Plus,
  Search,
  Trash2,
  Edit2,
  AlertCircle,
  FileDiff,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Snippet, SnippetLanguage } from '../../types.ts';

interface DevToolboxViewProps {
  snippets: Snippet[];
  onSaveSnippet: (snippet: Snippet) => void;
  onDeleteSnippet: (id: string) => void;
}

export const DevToolboxView: React.FC<DevToolboxViewProps> = ({
  snippets,
  onSaveSnippet,
  onDeleteSnippet,
}) => {
  const [activeTab, setActiveTab] = useState<'json' | 'diff' | 'snippets' | 'stats'>('json');

  // JSON Formatter state
  const [jsonInput, setJsonInput] = useState(`{
  "project": "DayForge",
  "status": "active",
  "features": ["local-first", "pwa", "developer-toolbox"],
  "metrics": {
    "latency": 0,
    "offlineReady": true
  }
}`);
  const [jsonOutput, setJsonOutput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copiedJSON, setCopiedJSON] = useState(false);

  // Text Diff state
  const [diffOriginal, setDiffOriginal] = useState(
`SELECT id, name, email 
FROM users 
WHERE status = 'active';`
  );
  const [diffModified, setDiffModified] = useState(
`SELECT id, name, email, role, created_at 
FROM users 
WHERE status = 'active'
ORDER BY created_at DESC;`
  );

  // Text Stats state
  const [statsText, setStatsText] = useState('');

  // Snippet search and filtering state
  const [snippetSearch, setSnippetSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [isSnippetModalOpen, setIsSnippetModalOpen] = useState(false);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  // JSON format actions
  const formatJSON = (indent = 2) => {
    try {
      setJsonError(null);
      const parsed = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsed, null, indent);
      setJsonOutput(formatted);
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON syntax');
      setJsonOutput('');
    }
  };

  const minifyJSON = () => {
    try {
      setJsonError(null);
      const parsed = JSON.parse(jsonInput);
      const minified = JSON.stringify(parsed);
      setJsonOutput(minified);
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON syntax');
      setJsonOutput('');
    }
  };

  const copyToClipboard = (text: string, onDone: () => void) => {
    navigator.clipboard.writeText(text);
    onDone();
  };

  // Compute text difference lines
  const computeDiff = () => {
    const origLines = diffOriginal.split('\n');
    const modLines = diffModified.split('\n');
    const maxLen = Math.max(origLines.length, modLines.length);
    const diff = [];

    for (let i = 0; i < maxLen; i++) {
      const o = origLines[i] ?? null;
      const m = modLines[i] ?? null;

      if (o === m) {
        diff.push({ type: 'unchanged', orig: o, mod: m, line: i + 1 });
      } else {
        diff.push({ type: 'changed', orig: o, mod: m, line: i + 1 });
      }
    }
    return diff;
  };

  // Text stats calculations
  const calculateStats = (text: string) => {
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s+/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split('\n').length : 0;
    const sentences = text ? (text.match(/[.!?]+(?:\s|$)/g) || []).length : 0;
    const bytes = new TextEncoder().encode(text).length;
    return { chars, charsNoSpaces, words, lines, sentences, bytes };
  };

  const stats = calculateStats(statsText);

  // Filter snippets
  const filteredSnippets = snippets.filter((s) => {
    if (selectedLanguage !== 'all' && s.language !== selectedLanguage) return false;
    if (snippetSearch.trim()) {
      const q = snippetSearch.toLowerCase();
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchDesc = s.description.toLowerCase().includes(q);
      const matchCode = s.code.toLowerCase().includes(q);
      const matchTags = s.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchCode && !matchTags) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Submodule Tabs */}
      <div className="flex items-center gap-1 sm:gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'json', label: 'JSON Formatter & Validator', icon: Code2 },
          { id: 'diff', label: 'Text Compare & Diff', icon: FileDiff },
          { id: 'snippets', label: 'SQL & Code Library', icon: FileCode },
          { id: 'stats', label: 'Word & Character Counter', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition ${
                isActive
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: JSON Formatter & Validator */}
      {activeTab === 'json' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => formatJSON(2)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition"
              >
                Beautify (2 Spaces)
              </button>
              <button
                onClick={() => formatJSON(4)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition"
              >
                4 Spaces
              </button>
              <button
                onClick={minifyJSON}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition"
              >
                Minify
              </button>
              <button
                onClick={() => {
                  setJsonInput('');
                  setJsonOutput('');
                  setJsonError(null);
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition"
              >
                Clear
              </button>
            </div>

            {jsonOutput && (
              <button
                onClick={() =>
                  copyToClipboard(jsonOutput, () => {
                    setCopiedJSON(true);
                    setTimeout(() => setCopiedJSON(false), 2000);
                  })
                }
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                {copiedJSON ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedJSON ? 'Copied!' : 'Copy Formatted JSON'}</span>
              </button>
            )}
          </div>

          {jsonError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-mono">{jsonError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[500px]">
            {/* Input Panel */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col overflow-hidden">
              <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 text-xs font-semibold text-zinc-500 flex items-center justify-between">
                <span>Input JSON</span>
                <span className="font-mono text-[11px]">{jsonInput.length} chars</span>
              </div>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Paste or type raw JSON here..."
                className="flex-1 p-4 bg-transparent font-mono text-xs leading-relaxed text-zinc-900 dark:text-zinc-100 outline-none resize-none"
              />
            </div>

            {/* Output Panel */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col overflow-hidden">
              <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 text-xs font-semibold text-zinc-500 flex items-center justify-between">
                <span>Formatted Result</span>
                <span className="font-mono text-[11px]">{jsonOutput.length} chars</span>
              </div>
              <textarea
                readOnly
                value={jsonOutput}
                placeholder="Formatted and validated JSON will render here..."
                className="flex-1 p-4 bg-transparent font-mono text-xs leading-relaxed text-zinc-900 dark:text-zinc-100 outline-none resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Text Diff */}
      {activeTab === 'diff' && (
        <div className="space-y-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Compare two versions of code, SQL queries, or document drafts side by side to review additions, removals, and changes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col h-48 overflow-hidden">
              <div className="px-4 py-1.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 text-xs font-semibold text-zinc-500">
                Original Text
              </div>
              <textarea
                value={diffOriginal}
                onChange={(e) => setDiffOriginal(e.target.value)}
                className="flex-1 p-3 bg-transparent font-mono text-xs text-zinc-900 dark:text-zinc-100 outline-none resize-none"
              />
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col h-48 overflow-hidden">
              <div className="px-4 py-1.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 text-xs font-semibold text-zinc-500">
                Modified Text
              </div>
              <textarea
                value={diffModified}
                onChange={(e) => setDiffModified(e.target.value)}
                className="flex-1 p-3 bg-transparent font-mono text-xs text-zinc-900 dark:text-zinc-100 outline-none resize-none"
              />
            </div>
          </div>

          {/* Diff Result Table */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden font-mono text-xs">
            <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 font-semibold text-zinc-500 flex items-center justify-between">
              <span>Line Comparison</span>
              <span className="text-[11px] font-mono">Changes highlighted below</span>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 max-h-96 overflow-y-auto">
              {computeDiff().map((row, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-12 py-1.5 px-3 ${
                    row.type === 'changed'
                      ? 'bg-amber-500/10 dark:bg-amber-500/15'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                  }`}
                >
                  <div className="col-span-1 text-zinc-400 select-none text-[11px] tabular-nums">
                    {row.line}
                  </div>
                  <div className="col-span-5 pr-2 truncate text-zinc-600 dark:text-zinc-400 border-r border-zinc-200 dark:border-zinc-800">
                    {row.orig ?? <span className="opacity-30">—</span>}
                  </div>
                  <div className="col-span-6 pl-3 truncate text-zinc-900 dark:text-zinc-100 font-medium">
                    {row.mod ?? <span className="opacity-30">—</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: SQL & Code Snippet Library */}
      {activeTab === 'snippets' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={snippetSearch}
                  onChange={(e) => setSnippetSearch(e.target.value)}
                  placeholder="Search code snippets, tags, language..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none"
                />
              </div>

              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 outline-none"
              >
                <option value="all">All Languages</option>
                <option value="sql">SQL</option>
                <option value="typescript">TypeScript</option>
                <option value="javascript">JavaScript</option>
                <option value="bash">Bash</option>
                <option value="json">JSON</option>
                <option value="python">Python</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button
              onClick={() => {
                setEditingSnippet({
                  id: '',
                  title: '',
                  description: '',
                  language: 'sql',
                  code: '',
                  tags: [],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                });
                setIsSnippetModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition self-end sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Snippet</span>
            </button>
          </div>

          {/* Snippets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSnippets.length === 0 ? (
              <div className="col-span-2 py-16 text-center text-xs text-zinc-500">
                No snippets found. Click "Save Snippet" to add your first reusable SQL or code block.
              </div>
            ) : (
              filteredSnippets.map((snip) => (
                <div
                  key={snip.id}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {snip.title}
                      </h4>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {snip.language}
                      </span>
                    </div>
                    {snip.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                        {snip.description}
                      </p>
                    )}
                    {snip.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {snip.tags.map((t) => (
                          <span key={t} className="text-[10px] font-mono text-zinc-400">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Code preview area */}
                  <div className="p-3 bg-zinc-950 font-mono text-[11px] text-zinc-200 overflow-x-auto max-h-48 leading-relaxed">
                    <pre>
                      <code>{snip.code}</code>
                    </pre>
                  </div>

                  {/* Snippet Card Footer */}
                  <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs bg-zinc-50/50 dark:bg-zinc-950/40">
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {snip.code.split('\n').length} lines
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          copyToClipboard(snip.code, () => {
                            setCopiedSnippetId(snip.id);
                            setTimeout(() => setCopiedSnippetId(null), 2000);
                          })
                        }
                        className="flex items-center gap-1 px-2.5 py-1 rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition font-medium"
                      >
                        {copiedSnippetId === snip.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditingSnippet(snip);
                          setIsSnippetModalOpen(true);
                        }}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                        title="Edit snippet"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteSnippet(snip.id)}
                        className="p-1 rounded text-zinc-400 hover:text-red-500"
                        title="Delete snippet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Word & Character Counter */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: 'Words', value: stats.words },
              { label: 'Characters', value: stats.chars },
              { label: 'No Spaces', value: stats.charsNoSpaces },
              { label: 'Lines', value: stats.lines },
              { label: 'Sentences', value: stats.sentences },
              { label: 'Size (Bytes)', value: stats.bytes },
            ].map((st) => (
              <div
                key={st.label}
                className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center"
              >
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  {st.label}
                </span>
                <span className="text-xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100 mt-1 block">
                  {st.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Paste or type text for instant statistics
            </label>
            <textarea
              rows={8}
              value={statsText}
              onChange={(e) => setStatsText(e.target.value)}
              placeholder="Paste article drafts, code, or logs here to measure exact counts..."
              className="w-full bg-transparent font-mono text-xs leading-relaxed text-zinc-900 dark:text-zinc-100 outline-none resize-none"
            />
          </div>
        </div>
      )}

      {/* Snippet Modal */}
      {isSnippetModalOpen && editingSnippet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {editingSnippet.id ? 'Edit Code Snippet' : 'New Code Snippet'}
              </h3>
              <button
                onClick={() => setIsSnippetModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editingSnippet.title.trim() || !editingSnippet.code.trim()) return;
                onSaveSnippet({
                  ...editingSnippet,
                  id: editingSnippet.id || `snip-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  updatedAt: new Date().toISOString(),
                });
                setIsSnippetModalOpen(false);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingSnippet.title}
                  onChange={(e) => setEditingSnippet({ ...editingSnippet, title: e.target.value })}
                  placeholder="e.g. PostgreSQL Batch UPSERT Query"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                    Language
                  </label>
                  <select
                    value={editingSnippet.language}
                    onChange={(e) =>
                      setEditingSnippet({ ...editingSnippet, language: e.target.value as SnippetLanguage })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none"
                  >
                    <option value="sql">SQL</option>
                    <option value="typescript">TypeScript</option>
                    <option value="javascript">JavaScript</option>
                    <option value="bash">Bash</option>
                    <option value="json">JSON</option>
                    <option value="python">Python</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={editingSnippet.tags.join(', ')}
                    onChange={(e) =>
                      setEditingSnippet({
                        ...editingSnippet,
                        tags: e.target.value.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
                      })
                    }
                    placeholder="database, index, auth"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editingSnippet.description}
                  onChange={(e) => setEditingSnippet({ ...editingSnippet, description: e.target.value })}
                  placeholder="When to use this snippet..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  Code *
                </label>
                <textarea
                  required
                  rows={6}
                  value={editingSnippet.code}
                  onChange={(e) => setEditingSnippet({ ...editingSnippet, code: e.target.value })}
                  placeholder="Paste snippet code here..."
                  className="w-full p-3 font-mono text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-950 text-zinc-100 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsSnippetModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-zinc-600 dark:text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Save Snippet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
