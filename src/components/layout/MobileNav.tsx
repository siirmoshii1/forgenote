import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  Terminal,
  Briefcase,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { ActiveModule } from '../../types.ts';

interface MobileNavProps {
  activeModule: ActiveModule;
  setActiveModule: (m: ActiveModule) => void;
  openGemini: () => void;
  pendingTasksCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeModule,
  setActiveModule,
  openGemini,
  pendingTasksCount,
}) => {
  const navTabs: { id: ActiveModule; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: pendingTasksCount },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'toolbox', label: 'Tools', icon: Terminal },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'study', label: 'Study', icon: BookOpen },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 pb-safe">
      <div className="grid grid-cols-7 items-center h-14 px-1">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeModule === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveModule(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors relative ${
                isActive
                  ? 'text-zinc-950 dark:text-white font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-[9px] font-mono px-1 rounded-full leading-none py-0.5">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[48px]">
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* Gemini Trigger on mobile tab */}
        <button
          onClick={openGemini}
          aria-label="Open AI Copilot"
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-blue-600 dark:text-blue-400"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Copilot</span>
        </button>
      </div>
    </nav>
  );
};
