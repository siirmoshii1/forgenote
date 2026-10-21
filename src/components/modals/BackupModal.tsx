import React, { useState } from 'react';
import {
  Download,
  Upload,
  X,
  AlertTriangle,
  CheckCircle2,
  Database,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { DayForgeExportData } from '../../types.ts';
import { exportAllData, importAllData } from '../../services/db.ts';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReload: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onDataReload,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setFeedback(null);
      const data = await exportAllData();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `dayforge-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setFeedback({
        type: 'success',
        message: `Export successful! Saved ${data.tasks.length} tasks, ${data.notes.length} notes, ${data.snippets.length} snippets, ${data.projects.length} projects, and ${data.income.length} ledger items.`,
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to export database.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setIsImporting(true);
        setFeedback(null);
        const text = event.target?.result as string;
        const parsed: DayForgeExportData = JSON.parse(text);

        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Selected file is not a valid JSON document.');
        }

        const res = await importAllData(parsed, importMode);
        onDataReload();
        setFeedback({
          type: 'success',
          message: `Restore complete (${importMode} mode)! Loaded ${res.counts.tasks} tasks, ${res.counts.notes} notes, and ${res.counts.projects} projects.`,
        });
      } catch (err: any) {
        setFeedback({
          type: 'error',
          message: `Import error: ${err.message || 'Corrupt or incompatible backup JSON.'}`,
        });
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Data Backup & Portable JSON
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs sm:text-sm">
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-xs">
            DayForge operates <strong>local-first</strong> by default. Your data lives securely in your browser's IndexedDB and is never transmitted to third parties. Use manual JSON backups to archive your data or migrate between devices.
          </p>

          {feedback && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Export Section */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Export Snapshot
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Downloads all tasks, markdown notes, code snippets, projects, and ledger records into a single JSON file.
                </p>
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Exporting...' : 'Export Complete Backup (.json)'}</span>
            </button>
          </div>

          {/* Import Section */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-3">
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Restore / Migrate Data
            </h4>

            {/* Merge vs Replace selector */}
            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="accent-blue-600"
                />
                <span className="text-zinc-700 dark:text-zinc-300">Merge with existing</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="accent-red-600"
                />
                <span className="text-zinc-700 dark:text-zinc-300">Replace entire database</span>
              </label>
            </div>

            {importMode === 'replace' && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                Warning: "Replace" will overwrite current browser data with the uploaded backup.
              </p>
            )}

            <label className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 transition cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>{isImporting ? 'Restoring...' : 'Upload Backup JSON File'}</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
