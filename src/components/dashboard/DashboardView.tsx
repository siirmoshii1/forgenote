import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileText,
  Briefcase,
  CheckSquare,
  Repeat,
} from 'lucide-react';
import { ActiveModule, IncomeItem, Note, Project, Task } from '../../types.ts';

interface DashboardViewProps {
  tasks: Task[];
  notes: Note[];
  projects: Project[];
  income: IncomeItem[];
  onToggleTask: (taskId: string) => void;
  onOpenTaskModal: (task?: Task) => void;
  setActiveModule: (module: ActiveModule) => void;
  openGemini: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  notes,
  projects,
  income,
  onToggleTask,
  onOpenTaskModal,
  setActiveModule,
  openGemini,
}) => {
  const [quickInput, setQuickInput] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculations
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedToday = tasks.filter((t) => t.completed && t.completedAt?.startsWith(todayStr));
  
  const overdueTasks = tasks.filter(
    (t) => !t.completed && t.dueDate && t.dueDate < todayStr
  );

  const todaysTasks = tasks.filter(
    (t) => !t.completed && (t.dueDate === todayStr || (!t.dueDate && t.priority === 'urgent'))
  );

  const routineHabits = tasks.filter((t) => t.isRoutine);
  const routineDone = routineHabits.filter((t) => t.completed).length;

  // Financial summary
  const paidIncome = income
    .filter((i) => !i.isExpense && i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0);
  const pendingReceivables = income
    .filter((i) => !i.isExpense && (i.status === 'invoiced' || i.status === 'overdue'))
    .reduce((sum, i) => sum + i.amount, 0);

  const activeProjects = projects.filter((p) => p.status === 'in_progress');

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onOpenTaskModal({
      id: '',
      title: quickInput.trim(),
      priority: 'high',
      category: 'Work',
      dueDate: todayStr,
      completed: false,
      isRoutine: false,
      recurrence: 'none',
      createdAt: new Date().toISOString(),
    });
    setQuickInput('');
  };

  const getPriorityStyle = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 dark:text-red-400 font-semibold';
      case 'high':
        return 'text-amber-600 dark:text-amber-400 font-medium';
      case 'medium':
        return 'text-blue-600 dark:text-blue-400';
      case 'low':
        return 'text-zinc-500';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium flex items-center justify-between">
            <span>Pending Tasks</span>
            <CheckSquare className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
              {pendingTasks.length}
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              / {completedToday.length} done today
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium flex items-center justify-between">
            <span>Daily Routines</span>
            <Repeat className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
              {routineDone}/{routineHabits.length}
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              {routineHabits.length > 0 ? `${Math.round((routineDone / routineHabits.length) * 100)}%` : '0%'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium flex items-center justify-between">
            <span>Active Projects</span>
            <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
              {activeProjects.length}
            </span>
            <span className="text-xs text-zinc-500">
              in flight
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium flex items-center justify-between">
            <span>Collected Income</span>
            <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
              ${paidIncome.toLocaleString()}
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              +${pendingReceivables.toLocaleString()} pend
            </span>
          </div>
        </div>
      </div>

      {/* Overdue Warning Callout (if any overdue) */}
      {overdueTasks.length > 0 && (
        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>{overdueTasks.length} Overdue {overdueTasks.length === 1 ? 'Task' : 'Tasks'} Require Attention</span>
          </div>
          <div className="mt-3 divide-y divide-amber-200/60 dark:divide-amber-900/30">
            {overdueTasks.map((task) => (
              <div key={task.id} className="py-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => onToggleTask(task.id)}
                    aria-label={`Mark ${task.title} complete`}
                    className="text-amber-600 hover:text-amber-700 shrink-0"
                  >
                    <Circle className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono shrink-0 text-amber-700 dark:text-amber-400">
                  <span>Due {task.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Priorities & Quick Add */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Task Input Form */}
          <form
            onSubmit={handleQuickAddSubmit}
            className="flex items-center gap-2 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
          >
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Quick add task for today... (Press Enter to detail)"
              className="flex-1 px-3 py-2 text-sm bg-transparent outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
            />
            <button
              type="submit"
              disabled={!quickInput.trim()}
              className="px-3.5 py-2 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 disabled:opacity-30 transition"
            >
              Add Task
            </button>
          </form>

          {/* Today's Priority Queue */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Today's Priority Agenda
                </h2>
              </div>
              <button
                onClick={() => setActiveModule('tasks')}
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 font-medium"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {todaysTasks.length === 0 ? (
                <div className="p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  No immediate tasks due today. You are caught up!
                </div>
              ) : (
                todaysTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 sm:px-4 flex items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => onToggleTask(task.id)}
                        aria-label={`Mark task ${task.title} complete`}
                        className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => onOpenTaskModal(task)}
                        className="text-left min-w-0"
                      >
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          <span className={getPriorityStyle(task.priority)}>
                            {task.priority.toUpperCase()}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{task.category}</span>
                          {task.isRoutine && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="flex items-center gap-1 text-zinc-400">
                                <Repeat className="w-3 h-3" /> Routine
                              </span>
                            </>
                          )}
                        </div>
                      </button>
                    </div>

                    <button
                      onClick={() => onOpenTaskModal(task)}
                      className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Edit
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Projects Snapshot */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Key Initiatives & Next Actions
              </h3>
              <button
                onClick={() => setActiveModule('projects')}
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 font-medium"
              >
                <span>Projects Tracker</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {projects.slice(0, 3).map((proj) => (
                <div
                  key={proj.id}
                  className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {proj.title}
                    </span>
                    <span className="font-mono text-zinc-500 dark:text-zinc-400 tabular-nums">
                      {proj.progress}%
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                    <span className="truncate">Next: {proj.nextAction}</span>
                    {proj.deadline && <span className="font-mono shrink-0">{proj.deadline}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Routines & Quick Notes */}
        <div className="space-y-6">
          {/* Daily Routines Checklist */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-zinc-500" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Daily Routines
                </h3>
              </div>
              <span className="text-xs font-mono text-zinc-500 tabular-nums">
                {routineDone}/{routineHabits.length}
              </span>
            </div>

            <div className="space-y-1.5">
              {routineHabits.length === 0 ? (
                <p className="text-xs text-zinc-500 py-3 text-center">
                  No routine habits set. Mark tasks with "Routine" to track daily habits here.
                </p>
              ) : (
                routineHabits.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onToggleTask(item.id)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition text-left"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-400 shrink-0" />
                    )}
                    <span
                      className={`text-xs font-medium truncate ${
                        item.completed
                          ? 'line-through text-zinc-400 dark:text-zinc-500'
                          : 'text-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      {item.title}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Quick AI Assistant Card */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 space-y-3">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>Productivity Copilot</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Break down challenging objectives, summarize lengthy meeting or sermon notes, or brainstorm next actions.
            </p>
            <button
              onClick={openGemini}
              className="w-full py-2 px-3 text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-700/80 transition flex items-center justify-center gap-2"
            >
              <span>Launch Assistant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pinned Notes Quick Access */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-500" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Pinned Notes
                </h3>
              </div>
              <button
                onClick={() => setActiveModule('notes')}
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                All
              </button>
            </div>

            <div className="space-y-2">
              {notes
                .filter((n) => n.isPinned && !n.isArchived)
                .slice(0, 3)
                .map((note) => (
                  <button
                    key={note.id}
                    onClick={() => setActiveModule('notes')}
                    className="w-full text-left p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition block"
                  >
                    <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {note.title}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5">
                      <span>{note.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{note.tags.slice(0, 2).join(', ')}</span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
