/**
 * DayForge Type Definitions
 */

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  category: string;
  dueDate?: string; // YYYY-MM-DD
  completed: boolean;
  isRoutine: boolean; // Daily recurring habit/routine
  recurrence: Recurrence;
  createdAt: string;
  completedAt?: string;
}

export type NoteCategory = 'Work' | 'Personal' | 'Bible Study' | 'Music' | 'Programming';

export interface Note {
  id: string;
  title: string;
  content: string; // Markdown text
  category: NoteCategory;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SnippetLanguage = 'sql' | 'json' | 'typescript' | 'javascript' | 'bash' | 'python' | 'html' | 'css' | 'other';

export interface Snippet {
  id: string;
  title: string;
  description: string;
  language: SnippetLanguage;
  code: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'planning' | 'in_progress' | 'review' | 'completed' | 'paused';

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  deadline?: string;
  nextAction: string;
  category: string;
  progress: number; // 0 - 100
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 'draft' | 'invoiced' | 'paid' | 'overdue';

export interface IncomeItem {
  id: string;
  title: string;
  client: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  isExpense: boolean;
  date: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
}

export type StudyType = 'sermon_outline' | 'scripture_study' | 'song_idea' | 'music_arrangement';

export interface StudySection {
  id: string;
  heading: string;
  notes: string;
  scriptureOrChords?: string;
}

export interface StudyTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface StudyItem {
  id: string;
  type: StudyType;
  title: string;
  subtitleOrKey?: string; // e.g. "Romans 8:1-11" or "Key of G Major · 72 BPM"
  themeOrGenre?: string; // e.g. "Assurance in Christ" or "Acoustic Contemporary"
  sections: StudySection[];
  actionItems: StudyTask[];
  updatedAt: string;
  createdAt: string;
}

export interface DayForgeExportData {
  version: number;
  exportedAt: string;
  tasks: Task[];
  notes: Note[];
  snippets: Snippet[];
  projects: Project[];
  income: IncomeItem[];
  studyItems: StudyItem[];
}

export type ActiveModule = 'dashboard' | 'tasks' | 'notes' | 'toolbox' | 'projects' | 'study';
