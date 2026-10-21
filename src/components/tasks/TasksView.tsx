import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Search,
  Calendar as CalendarIcon,
  List as ListIcon,
  Trash2,
  Edit2,
  Repeat,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Priority, Task } from '../../types.ts';

interface TasksViewProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onOpenTaskModal: (task?: Task) => void;
  onDeleteTask: (id: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onToggleTask,
  onOpenTaskModal,
  onDeleteTask,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [filterTab, setFilterTab] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'completed'>('all');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calendar month state
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());

  const todayStr = new Date().toISOString().split('T')[0];

  // Categories list derived from tasks
  const categories = Array.from(new Set(tasks.map((t) => t.category).filter(Boolean)));

  // Filter logic
  const filteredTasks = tasks.filter((task) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchCat = task.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }

    // Priority filter
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && task.category !== selectedCategory) {
      return false;
    }

    // Tab filter
    if (filterTab === 'today') {
      return !task.completed && task.dueDate === todayStr;
    }
    if (filterTab === 'upcoming') {
      return !task.completed && task.dueDate && task.dueDate > todayStr;
    }
    if (filterTab === 'overdue') {
      return !task.completed && task.dueDate && task.dueDate < todayStr;
    }
    if (filterTab === 'completed') {
      return task.completed;
    }

    return true;
  });

  // Calendar grid calculations
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'urgent':
        return 'text-red-600 dark:text-red-400 font-bold';
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
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, categories, descriptions..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* View switcher & New Task action */}
        <div className="flex items-center gap-2 sm:gap-3 self-end md:self-auto">
          {/* List / Calendar Segmented toggle */}
          <div className="flex items-center p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
            <button
              onClick={() => setViewMode('list')}
              aria-label="List View"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                viewMode === 'list'
                  ? 'bg-white text-zinc-950 dark:bg-zinc-800 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              aria-label="Calendar View"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                viewMode === 'calendar'
                  ? 'bg-white text-zinc-950 dark:bg-zinc-800 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          </div>

          <button
            onClick={() => onOpenTaskModal()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs sm:text-sm font-medium hover:opacity-90 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Dropdowns */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Tasks', count: tasks.length },
            { id: 'today', label: 'Today', count: tasks.filter((t) => !t.completed && t.dueDate === todayStr).length },
            { id: 'upcoming', label: 'Upcoming', count: tasks.filter((t) => !t.completed && t.dueDate && t.dueDate > todayStr).length },
            { id: 'overdue', label: 'Overdue', count: tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < todayStr).length },
            { id: 'completed', label: 'Done', count: tasks.filter((t) => t.completed).length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as typeof filterTab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition ${
                filterTab === tab.id
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className="ml-1.5 font-mono text-[11px] opacity-70 tabular-nums">
                ({tab.count})
              </span>
            </button>
          ))}
        </div>

        {/* Priority & Category filter dropdowns */}
        <div className="flex items-center gap-2">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as Priority | 'all')}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area: List View vs Calendar View */}
      {viewMode === 'list' ? (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {filteredTasks.length === 0 ? (
              <div className="py-16 text-center text-zinc-500 dark:text-zinc-400 space-y-3">
                <AlertCircle className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-600" />
                <p className="text-sm">No tasks match your criteria.</p>
                <button
                  onClick={() => onOpenTaskModal()}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Create a task
                </button>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const isOverdue = !task.completed && task.dueDate && task.dueDate < todayStr;
                return (
                  <div
                    key={task.id}
                    className="p-4 sm:px-6 flex items-start justify-between gap-4 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition group"
                  >
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <button
                        onClick={() => onToggleTask(task.id)}
                        aria-label={`Toggle task completion for ${task.title}`}
                        className="mt-0.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-medium ${
                            task.completed
                              ? 'line-through text-zinc-400 dark:text-zinc-500'
                              : 'text-zinc-900 dark:text-zinc-100'
                          }`}
                        >
                          {task.title}
                        </p>

                        {task.description && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                          <span className={getPriorityBadge(task.priority)}>
                            {task.priority.toUpperCase()}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{task.category}</span>

                          {task.dueDate && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span
                                className={`font-mono tabular-nums ${
                                  isOverdue ? 'text-amber-600 dark:text-amber-400 font-semibold' : ''
                                }`}
                              >
                                {isOverdue ? `Overdue (${task.dueDate})` : `Due ${task.dueDate}`}
                              </span>
                            </>
                          )}

                          {task.isRoutine && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="flex items-center gap-1 text-zinc-400">
                                <Repeat className="w-3 h-3" /> Routine
                              </span>
                            </>
                          )}

                          {task.recurrence !== 'none' && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="capitalize">{task.recurrence}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onOpenTaskModal(task)}
                        aria-label="Edit task"
                        className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        aria-label="Delete task"
                        className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Calendar View */
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-6 space-y-4">
          {/* Calendar Header Month Navigation */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {monthNames[month]} {year}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                aria-label="Previous month"
                className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentMonthDate(new Date())}
                className="px-2.5 py-1 text-xs font-medium rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                aria-label="Next month"
                className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-zinc-400 dark:text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 auto-rows-fr">
            {/* Blank offset days */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[72px] sm:min-h-[96px] p-1 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/30 opacity-40" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isToday = dateStr === todayStr;
              const dayTasks = tasks.filter((t) => t.dueDate === dateStr);

              return (
                <div
                  key={dateStr}
                  onClick={() => {
                    onOpenTaskModal({
                      id: '',
                      title: '',
                      priority: 'medium',
                      category: 'Work',
                      dueDate: dateStr,
                      completed: false,
                      isRoutine: false,
                      recurrence: 'none',
                      createdAt: new Date().toISOString(),
                    });
                  }}
                  className={`min-h-[72px] sm:min-h-[96px] p-1.5 sm:p-2 rounded-lg border border-zinc-100 dark:border-zinc-800/80 transition cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 flex flex-col justify-between ${
                    isToday ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-400/50' : 'bg-white dark:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono tabular-nums ${
                        isToday
                          ? 'font-bold text-blue-600 dark:text-blue-400'
                          : 'text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-mono text-zinc-400">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map((dt) => (
                      <div
                        key={dt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenTaskModal(dt);
                        }}
                        className={`text-[10px] sm:text-[11px] truncate px-1 py-0.5 rounded ${
                          dt.completed
                            ? 'line-through text-zinc-400 bg-zinc-100 dark:bg-zinc-800'
                            : 'text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 font-medium'
                        }`}
                      >
                        {dt.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <span className="text-[10px] text-zinc-400 font-mono block pl-1">
                        +{dayTasks.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
