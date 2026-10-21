/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ActiveModule, IncomeItem, Note, Project, Snippet, StudyItem, Task } from './types.ts';
import {
  deleteFromStore,
  getAllFromStore,
  putInStore,
  seedInitialDataIfEmpty,
} from './services/db.ts';
import { useTheme } from './hooks/useTheme.ts';
import { useOnlineStatus } from './hooks/useOnlineStatus.ts';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { Header } from './components/layout/Header.tsx';
import { MobileNav } from './components/layout/MobileNav.tsx';
import { DashboardView } from './components/dashboard/DashboardView.tsx';
import { TasksView } from './components/tasks/TasksView.tsx';
import { NotesView } from './components/notes/NotesView.tsx';
import { DevToolboxView } from './components/toolbox/DevToolboxView.tsx';
import { ProjectsIncomeView } from './components/projects/ProjectsIncomeView.tsx';
import { StudyMusicView } from './components/workspaces/StudyMusicView.tsx';
import { TaskModal } from './components/tasks/TaskModal.tsx';
import { GeminiAssistantModal } from './components/gemini/GeminiAssistantModal.tsx';
import { BackupModal } from './components/modals/BackupModal.tsx';
import { PWAInstallModal } from './components/pwa/PWAInstallModal.tsx';
import { WifiOff, Loader2 } from 'lucide-react';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const isOnline = useOnlineStatus();

  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // Entities loaded from IndexedDB
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [income, setIncome] = useState<IncomeItem[]>([]);
  const [studyItems, setStudyItems] = useState<StudyItem[]>([]);

  // Modals state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const [isGeminiOpen, setIsGeminiOpen] = useState(false);
  const [geminiContext, setGeminiContext] = useState<{ prompt: string; title: string }>({
    prompt: '',
    title: '',
  });

  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isPWAInstallOpen, setIsPWAInstallOpen] = useState(false);

  // Load database on mount
  const loadDatabase = async () => {
    try {
      setIsLoading(true);
      await seedInitialDataIfEmpty();

      const [loadedTasks, loadedNotes, loadedSnippets, loadedProjects, loadedIncome, loadedStudy] =
        await Promise.all([
          getAllFromStore<Task>('tasks'),
          getAllFromStore<Note>('notes'),
          getAllFromStore<Snippet>('snippets'),
          getAllFromStore<Project>('projects'),
          getAllFromStore<IncomeItem>('income'),
          getAllFromStore<StudyItem>('study_items'),
        ]);

      setTasks(loadedTasks);
      setNotes(loadedNotes);
      setSnippets(loadedSnippets);
      setProjects(loadedProjects);
      setIncome(loadedIncome);
      setStudyItems(loadedStudy);
    } catch (err) {
      console.error('Failed to initialize IndexedDB:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDatabase();
  }, []);

  // Task Handlers
  const handleToggleTask = async (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;
    const isNowCompleted = !target.completed;
    const updated: Task = {
      ...target,
      completed: isNowCompleted,
      completedAt: isNowCompleted ? new Date().toISOString() : undefined,
    };
    await putInStore('tasks', updated);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
  };

  const handleSaveTask = async (task: Task) => {
    await putInStore('tasks', task);
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === task.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = task;
        return next;
      }
      return [task, ...prev];
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteFromStore('tasks', taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleImportTasks = async (newTasks: Task[]) => {
    for (const t of newTasks) {
      await putInStore('tasks', t);
    }
    setTasks((prev) => [...newTasks, ...prev]);
  };

  // Note Handlers
  const handleSaveNote = async (note: Note) => {
    await putInStore('notes', note);
    setNotes((prev) => {
      const idx = prev.findIndex((n) => n.id === note.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = note;
        return next;
      }
      return [note, ...prev];
    });
  };

  const handleDeleteNote = async (noteId: string) => {
    await deleteFromStore('notes', noteId);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  // Snippet Handlers
  const handleSaveSnippet = async (snippet: Snippet) => {
    await putInStore('snippets', snippet);
    setSnippets((prev) => {
      const idx = prev.findIndex((s) => s.id === snippet.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = snippet;
        return next;
      }
      return [snippet, ...prev];
    });
  };

  const handleDeleteSnippet = async (id: string) => {
    await deleteFromStore('snippets', id);
    setSnippets((prev) => prev.filter((s) => s.id !== id));
  };

  // Project Handlers
  const handleSaveProject = async (project: Project) => {
    await putInStore('projects', project);
    setProjects((prev) => {
      const idx = prev.findIndex((p) => p.id === project.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = project;
        return next;
      }
      return [project, ...prev];
    });
  };

  const handleDeleteProject = async (id: string) => {
    await deleteFromStore('projects', id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // Income Handlers
  const handleSaveIncome = async (item: IncomeItem) => {
    await putInStore('income', item);
    setIncome((prev) => {
      const idx = prev.findIndex((i) => i.id === item.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = item;
        return next;
      }
      return [item, ...prev];
    });
  };

  const handleDeleteIncome = async (id: string) => {
    await deleteFromStore('income', id);
    setIncome((prev) => prev.filter((i) => i.id !== id));
  };

  // Study & Music Handlers
  const handleSaveStudyItem = async (item: StudyItem) => {
    await putInStore('study_items', item);
    setStudyItems((prev) => {
      const idx = prev.findIndex((s) => s.id === item.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = item;
        return next;
      }
      return [item, ...prev];
    });
  };

  const handleDeleteStudyItem = async (id: string) => {
    await deleteFromStore('study_items', id);
    setStudyItems((prev) => prev.filter((s) => s.id !== id));
  };

  // Quick action modal trigger
  const handleQuickAdd = () => {
    if (activeModule === 'tasks' || activeModule === 'dashboard') {
      setSelectedTask(null);
      setIsTaskModalOpen(true);
    } else if (activeModule === 'notes') {
      const newNote: Note = {
        id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: 'Untitled Note',
        content: '',
        category: 'Work',
        tags: [],
        isPinned: false,
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      handleSaveNote(newNote);
    } else if (activeModule === 'toolbox') {
      setActiveModule('toolbox');
    } else if (activeModule === 'projects') {
      setActiveModule('projects');
    } else {
      setSelectedTask(null);
      setIsTaskModalOpen(true);
    }
  };

  const openGeminiWithContext = (prompt: string, title: string) => {
    setGeminiContext({ prompt, title });
    setIsGeminiOpen(true);
  };

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Desktop Sidebar */}
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        openGemini={() => {
          setGeminiContext({ prompt: '', title: '' });
          setIsGeminiOpen(true);
        }}
        openBackup={() => setIsBackupOpen(true)}
        openPWAInstallGuide={() => setIsPWAInstallOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
        pendingTasksCount={pendingTasksCount}
      />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          activeModule={activeModule}
          onQuickAdd={handleQuickAdd}
          openGemini={() => {
            setGeminiContext({ prompt: '', title: '' });
            setIsGeminiOpen(true);
          }}
          openBackup={() => setIsBackupOpen(true)}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        {/* Scrollable Main Workspace Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
              <p className="text-xs font-mono">Initializing DayForge Local Engine...</p>
            </div>
          ) : (
            <>
              {activeModule === 'dashboard' && (
                <DashboardView
                  tasks={tasks}
                  notes={notes}
                  projects={projects}
                  income={income}
                  onToggleTask={handleToggleTask}
                  onOpenTaskModal={(t) => {
                    setSelectedTask(t || null);
                    setIsTaskModalOpen(true);
                  }}
                  setActiveModule={setActiveModule}
                  openGemini={() => {
                    setGeminiContext({ prompt: '', title: '' });
                    setIsGeminiOpen(true);
                  }}
                />
              )}

              {activeModule === 'tasks' && (
                <TasksView
                  tasks={tasks}
                  onToggleTask={handleToggleTask}
                  onOpenTaskModal={(t) => {
                    setSelectedTask(t || null);
                    setIsTaskModalOpen(true);
                  }}
                  onDeleteTask={handleDeleteTask}
                />
              )}

              {activeModule === 'notes' && (
                <NotesView
                  notes={notes}
                  onSaveNote={handleSaveNote}
                  onDeleteNote={handleDeleteNote}
                  openGeminiWithContext={openGeminiWithContext}
                />
              )}

              {activeModule === 'toolbox' && (
                <DevToolboxView
                  snippets={snippets}
                  onSaveSnippet={handleSaveSnippet}
                  onDeleteSnippet={handleDeleteSnippet}
                />
              )}

              {activeModule === 'projects' && (
                <ProjectsIncomeView
                  projects={projects}
                  income={income}
                  onSaveProject={handleSaveProject}
                  onDeleteProject={handleDeleteProject}
                  onSaveIncome={handleSaveIncome}
                  onDeleteIncome={handleDeleteIncome}
                />
              )}

              {activeModule === 'study' && (
                <StudyMusicView
                  studyItems={studyItems}
                  onSaveStudyItem={handleSaveStudyItem}
                  onDeleteStudyItem={handleDeleteStudyItem}
                />
              )}
            </>
          )}
        </main>

        {/* Mobile Fixed Bottom Navigation */}
        <MobileNav
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          openGemini={() => {
            setGeminiContext({ prompt: '', title: '' });
            setIsGeminiOpen(true);
          }}
          pendingTasksCount={pendingTasksCount}
        />
      </div>

      {/* Global Modals */}
      <TaskModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
      />

      <GeminiAssistantModal
        isOpen={isGeminiOpen}
        onClose={() => setIsGeminiOpen(false)}
        initialPrompt={geminiContext.prompt}
        initialTitle={geminiContext.title}
        onImportTasks={handleImportTasks}
      />

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onDataReload={loadDatabase}
      />

      <PWAInstallModal
        isOpen={isPWAInstallOpen}
        onClose={() => setIsPWAInstallOpen(false)}
      />

      {/* Non-intrusive Offline Toast Banner when offline */}
      {!isOnline && (
        <div className="fixed bottom-16 sm:bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-500 text-zinc-950 px-3 py-1.5 text-xs font-medium shadow-lg animate-in slide-in-from-bottom-2">
          <WifiOff className="w-4 h-4" />
          <span>Offline Mode — All changes persist in local IndexedDB.</span>
        </div>
      )}
    </div>
  );
}
