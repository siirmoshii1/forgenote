import React from 'react';
import { Plus, Sparkles, Database, Sun, Moon, WifiOff } from 'lucide-react';
import { ActiveModule } from '../../types.ts';
import { useOnlineStatus } from '../../hooks/useOnlineStatus.ts';

interface HeaderProps {
  activeModule: ActiveModule;
  onQuickAdd: () => void;
  openGemini: () => void;
  openBackup: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  onQuickAdd,
  openGemini,
  openBackup,
  theme,
  toggleTheme,
}) => {
  const isOnline = useOnlineStatus();

  const getModuleTitle = () => {
    switch (activeModule) {
      case 'dashboard':
        return 'Overview & Routine';
      case 'tasks':
        return 'Planner & Tasks';
      case 'notes':
        return 'Knowledge Base';
      case 'toolbox':
        return 'Developer Toolbox';
      case 'projects':
        return 'Projects & Ledger';
      case 'study':
        return 'Study & Music';
      default:
        return 'DayForge';
    }
  };

  return (
    <header className="h-14 sm:h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Zone 1: Breadcrumb / Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <span className="text-xs uppercase tracking-wider font-mono text-zinc-400 dark:text-zinc-500 hidden sm:inline">
          DayForge
        </span>
        <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">/</span>
        <h1 className="text-sm sm:text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
          {getModuleTitle()}
        </h1>
      </div>

      {/* Zone 2: Status & Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {!isOnline && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium">
            <WifiOff className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Offline Mode</span>
          </div>
        )}

        <button
          onClick={openGemini}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Copilot</span>
        </button>

        <button
          onClick={openBackup}
          aria-label="Open Backup & Export"
          className="lg:hidden p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          title="Backup & Restore"
        >
          <Database className="w-4 h-4" />
        </button>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="lg:hidden p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Primary Action Button */}
        <button
          onClick={onQuickAdd}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity text-xs sm:text-sm font-medium shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="whitespace-nowrap">New</span>
        </button>
      </div>
    </header>
  );
};
