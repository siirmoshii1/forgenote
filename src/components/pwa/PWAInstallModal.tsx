import React from 'react';
import { Download, X, Share, PlusSquare, Monitor, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall.ts';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Install DayForge PWA
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs sm:text-sm">
          {isInstalled ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-semibold text-xs">Application Installed</p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  DayForge is already installed and running as a standalone progressive web app.
                </p>
              </div>
            </div>
          ) : isInstallable ? (
            <div className="space-y-4">
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-xs">
                Install DayForge to your device home screen or desktop application dock for instant offline access and a distraction-free window.
              </p>
              <button
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-sm text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Install DayForge Now</span>
              </button>
            </div>
          ) : isIOS ? (
            <div className="space-y-4">
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-xs">
                To install DayForge on your iPhone or iPad:
              </p>
              <div className="space-y-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-mono font-bold text-[11px] shrink-0">
                    1
                  </div>
                  <div>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      Tap the Share button
                    </span>
                    <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                      Located in Safari's bottom toolbar (<Share className="w-3.5 h-3.5 inline" />).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-mono font-bold text-[11px] shrink-0">
                    2
                  </div>
                  <div>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      Select "Add to Home Screen"
                    </span>
                    <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                      Scroll down the share sheet and tap <PlusSquare className="w-3.5 h-3.5 inline" />.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-mono font-bold text-[11px] shrink-0">
                    3
                  </div>
                  <div>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      Tap "Add" in the top right
                    </span>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      DayForge will appear as a standalone icon with offline caching.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-xs">
                To install on desktop (Chrome, Edge, Brave):
              </p>
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-xs space-y-2">
                <div className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-100">
                  <Monitor className="w-4 h-4 text-zinc-500" />
                  <span>Browser Address Bar Installation</span>
                </div>
                <p className="text-zinc-500 text-[11px] leading-relaxed">
                  Look for the <strong>Install DayForge</strong> icon in your browser URL address bar (a computer monitor or '+' symbol), or choose <strong>Install DayForge</strong> from the browser settings menu (⋮).
                </p>
              </div>
            </div>
          )}

          <div className="space-y-1.5 text-[11px] text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <p>• Offline capability powered by Service Worker & IndexedDB</p>
            <p>• Zero network requests required for notes, planner, or local ledger</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
