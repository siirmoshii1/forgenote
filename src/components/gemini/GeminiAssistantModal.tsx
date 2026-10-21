import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  PlusCircle,
  ListTodo,
  FileText,
  PenTool,
  Lightbulb,
  WifiOff,
  Settings,
  Server,
} from 'lucide-react';
import { Task } from '../../types.ts';
import { useOnlineStatus } from '../../hooks/useOnlineStatus.ts';

interface GeminiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  initialTitle?: string;
  onImportTasks?: (tasks: Task[]) => void;
}

type CopilotMode = 'breakdown' | 'summarize' | 'polish' | 'brainstorm';

export const GeminiAssistantModal: React.FC<GeminiAssistantModalProps> = ({
  isOpen,
  onClose,
  initialPrompt = '',
  initialTitle = '',
  onImportTasks,
}) => {
  const isOnline = useOnlineStatus();
  const [mode, setMode] = useState<CopilotMode>('breakdown');
  const [prompt, setPrompt] = useState(initialPrompt);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [imported, setImported] = useState(false);

  // Optional backend server URL for users hosting the static PWA on GitHub Pages
  const [backendUrl, setBackendUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dayforge_backend_url') || '';
    }
    return '';
  });
  const [showSettings, setShowSettings] = useState(false);

  React.useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  if (!isOpen) return null;

  const handleSaveBackendUrl = (url: string) => {
    setBackendUrl(url);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dayforge_backend_url', url.trim());
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!isOnline) {
      setError('You are currently offline. Gemini AI assistance requires an active internet connection.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setImported(false);

    let systemInstruction = '';
    if (mode === 'breakdown') {
      systemInstruction =
        'You are an executive personal productivity coach. The user will provide a goal or task. Break it down into 3-6 clear, actionable, high-impact sub-tasks with estimated priority (Urgent, High, Medium, Low). Format each task as: "[Priority] Task description". Keep each line concise and immediately executable.';
    } else if (mode === 'summarize') {
      systemInstruction =
        'You are an expert executive summarizer. Read the user input and produce: 1) A concise 2-sentence executive summary. 2) 3-5 bulleted key takeaways or findings. Maintain crisp professional clarity.';
    } else if (mode === 'polish') {
      systemInstruction =
        'You are a professional editor. Improve the clarity, structure, and tone of the user’s text. Remove fluff and improve flow while preserving the original intent. Provide the improved version directly, followed by 2 bullet points explaining the improvements.';
    } else {
      systemInstruction =
        'You are a creative brainstorming partner. Propose 5 inventive, practical ideas or next angles to pursue for the user’s problem. Keep recommendations grounded, specific, and realistic.';
    }

    try {
      const cleanBase = backendUrl.trim().replace(/\/+$/, '');
      const endpoint = cleanBase ? `${cleanBase}/api/gemini/generate` : '/api/gemini/generate';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction }),
      });

      // Validate that response is JSON rather than an HTML 404 page from static hosts
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const isGitHubPages =
          typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');

        if (res.status === 404 || contentType.includes('text/html')) {
          if (isGitHubPages) {
            throw new Error(
              'GitHub Pages only hosts static files and does not execute backend Node.js code (/api/*). To use Gemini AI, deploy server.ts to a backend provider (Cloud Run, Render, Railway, VPS) with your GEMINI_API_KEY and configure its URL in Copilot Settings (⚙️ above), or run DayForge locally via "npm run dev". All other DayForge tools continue functioning 100% offline.'
            );
          } else {
            throw new Error(
              'The backend proxy (/api/gemini/generate) returned HTML instead of JSON. Ensure your server.ts is running with GEMINI_API_KEY.'
            );
          }
        }
        const rawText = await res.text();
        throw new Error(rawText || `Server returned HTTP ${res.status}`);
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server responded with status ${res.status}`);
      }

      setResult(data.text || 'No response generated.');
    } catch (err: any) {
      console.error('Gemini copilot error:', err);
      setError(err.message || 'Failed to reach AI assistant. Please verify server connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse breakdown result into DayForge tasks
  const handleImportAsTasks = () => {
    if (!result || !onImportTasks) return;
    const lines = result.split('\n').filter((l) => l.trim().length > 0);
    const todayStr = new Date().toISOString().split('T')[0];

    const extractedTasks: Task[] = [];
    lines.forEach((line) => {
      const clean = line.replace(/^[-*•\d.]+\s*/, '').trim();
      if (!clean) return;

      let priority: Task['priority'] = 'medium';
      if (/urgent/i.test(clean)) priority = 'urgent';
      else if (/high/i.test(clean)) priority = 'high';
      else if (/low/i.test(clean)) priority = 'low';

      const titleClean = clean.replace(/\[(urgent|high|medium|low)\]/gi, '').trim();

      if (titleClean) {
        extractedTasks.push({
          id: `task-ai-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: titleClean,
          priority,
          category: 'Work',
          dueDate: todayStr,
          completed: false,
          isRoutine: false,
          recurrence: 'none',
          createdAt: new Date().toISOString(),
        });
      }
    });

    if (extractedTasks.length > 0) {
      onImportTasks(extractedTasks);
      setImported(true);
      setTimeout(() => setImported(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Gemini Productivity Copilot
              </h3>
              <span className="text-[11px] text-zinc-500 font-mono">
                {backendUrl ? 'Connected to custom backend' : 'Server proxy (/api/gemini/generate)'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSettings(!showSettings)}
              aria-label="Copilot backend settings"
              className={`p-1.5 rounded-md transition ${
                showSettings
                  ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                  : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
              title="Configure Backend Server Endpoint"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              aria-label="Close copilot"
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Settings Drawer (for configuring custom backend URL when hosted on GitHub Pages) */}
          {showSettings && (
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 space-y-2.5 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                <Server className="w-4 h-4 text-blue-500" />
                <span>Backend Server Endpoint (For Static Hosting / GitHub Pages)</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                GitHub Pages hosts static files and cannot execute server-side Node.js code. If you deployed your backend (`server.ts`) to Google Cloud Run, Render, or Railway, enter your service URL below. Leave blank to use the default relative server.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={backendUrl}
                  onChange={(e) => handleSaveBackendUrl(e.target.value)}
                  placeholder="https://my-dayforge-backend.run.app"
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none font-mono"
                />
                {backendUrl && (
                  <button
                    onClick={() => handleSaveBackendUrl('')}
                    className="px-2.5 py-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'breakdown', label: 'Break Down Task', icon: ListTodo },
              { id: 'summarize', label: 'Summarize Notes', icon: FileText },
              { id: 'polish', label: 'Refine & Polish', icon: PenTool },
              { id: 'brainstorm', label: 'Brainstorm Next', icon: Lightbulb },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id as CopilotMode)}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-lg text-xs font-medium border transition ${
                    isSelected
                      ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{m.label}</span>
                </button>
              );
            })}
          </div>

          {!isOnline && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
              <WifiOff className="w-4 h-4 shrink-0" />
              <span>
                Offline Mode: Cloud AI requests require an internet connection. Other DayForge modules continue working locally.
              </span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">Copilot Request Failed</span>
                <span className="block leading-relaxed">{error}</span>
              </div>
            </div>
          )}

          {/* Prompt Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
              <span>{initialTitle ? `Context: ${initialTitle}` : 'Input Prompt or Context'}</span>
              <span className="font-mono text-[11px]">{prompt.length} chars</span>
            </div>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                mode === 'breakdown'
                  ? 'e.g. Plan the architectural migration from monolithic database to read-write replicas...'
                  : mode === 'summarize'
                  ? 'Paste raw notes or outlines here for a structured summary...'
                  : mode === 'polish'
                  ? 'Paste rough writing, sermon draft, or email here to elevate tone...'
                  : 'Describe your current project or challenge to brainstorm next actions...'
              }
              className="w-full p-3 text-xs sm:text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 outline-none resize-none font-sans leading-relaxed"
            />
          </div>

          {/* Generate Button */}
          <div className="flex items-center justify-end">
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim() || !isOnline}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs sm:text-sm font-medium hover:opacity-90 disabled:opacity-40 transition"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Generate with Gemini</span>
                </>
              )}
            </button>
          </div>

          {/* AI Result Area */}
          {result && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>AI Suggestions</span>
                </span>
                <div className="flex items-center gap-2">
                  {mode === 'breakdown' && onImportTasks && (
                    <button
                      onClick={handleImportAsTasks}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      {imported ? <Check className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
                      <span>{imported ? 'Imported to Tasks!' : 'Add to DayForge Tasks'}</span>
                    </button>
                  )}
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans">
                {result}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
