import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  Terminal,
  Briefcase,
  BookOpen,
  Sparkles,
  Download,
  Database,
  Sun,
  Moon,
  WifiOff,
} from 'lucide-react';
import { ActiveModule } from '../../types.ts';
import { usePWAInstall } from '../../hooks/usePWAInstall.ts';
import { useOnlineStatus } from '../../hooks/useOnlineStatus.ts';

interface SidebarProps {
  activeModule: ActiveModule;
  setActiveModule: (m: ActiveModule) => void;
  openGemini: () => void;
  openBackup: () => void;
  openPWAInstallGuide: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  pendingTasksCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  setActiveModule,
  openGemini,
  openBackup,
  openPWAInstallGuide,
  theme,
  toggleTheme,
  pendingTasksCount,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const isOnline = useOnlineStatus();

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      openPWAInstallGuide();
    }
  };

  const navItems: { id: ActiveModule; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Planner & Tasks', icon: CheckSquare, badge: pendingTasksCount },
    { id: 'notes', label: 'Notes & Knowledge', icon: FileText },
    { id: 'toolbox', label: 'Dev Toolbox', icon: Terminal },
    { id: 'projects', label: 'Projects & Income', icon: Briefcase },
    { id: 'study', label: 'Study & Music', icon: BookOpen },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900 font-bold text-sm shadow-sm">
          D
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-base tracking-tight text-zinc-900 dark:text-zinc-50">
            DayForge
          </span>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
            Personal PWA
          </span>
        </div>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
          Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                isActive
                  ? 'bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-white font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="font-mono text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 px-3 pb-2 text-[11px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
          Productivity Tools
        </div>

        <button
          onClick={openGemini}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>AI Copilot</span>
          </div>
          <span className="text-[10px] uppercase font-mono text-blue-600 dark:text-blue-400">
            Assistant
          </span>
        </button>

        <button
          onClick={openBackup}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Database className="w-4 h-4 text-zinc-400" />
            <span>Backup & Export</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">JSON</span>
        </button>
      </nav>

      {/* Footer / Controls */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
        {/* PWA Install Trigger */}
        {!isInstalled && (
          <button
            onClick={handleInstallClick}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isIOS ? 'Install on iOS' : 'Install DayForge PWA'}</span>
          </button>
        )}

        {/* Connectivity and Theme bar */}
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-1">
          <div className="flex items-center gap-1.5">
            {!isOnline ? (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span>Local-first</span>
              </span>
            )}
          </div>

          <button
            onClick={toggleTheme}
            aria-label="Toggle visual theme"
            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
};
