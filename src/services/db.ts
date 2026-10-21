/**
 * DayForge IndexedDB Local-First Database Service
 */

import {
  DayForgeExportData,
  IncomeItem,
  Note,
  Project,
  Snippet,
  StudyItem,
  Task,
} from '../types.ts';

const DB_NAME = 'DayForgeDB';
const DB_VERSION = 1;

export type StoreName = 'tasks' | 'notes' | 'snippets' | 'projects' | 'income' | 'study_items';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('notes')) {
        db.createObjectStore('notes', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('snippets')) {
        db.createObjectStore('snippets', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('income')) {
        db.createObjectStore('income', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('study_items')) {
        db.createObjectStore('study_items', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllFromStore<T>(storeName: StoreName): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

export async function putInStore<T extends { id: string }>(
  storeName: StoreName,
  item: T
): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => resolve(item);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteFromStore(storeName: StoreName, id: string): Promise<boolean> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

export async function clearStore(storeName: StoreName): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function bulkPutInStore<T extends { id: string }>(
  storeName: StoreName,
  items: T[]
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    items.forEach((item) => store.put(item));

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function exportAllData(): Promise<DayForgeExportData> {
  const [tasks, notes, snippets, projects, income, studyItems] = await Promise.all([
    getAllFromStore<Task>('tasks'),
    getAllFromStore<Note>('notes'),
    getAllFromStore<Snippet>('snippets'),
    getAllFromStore<Project>('projects'),
    getAllFromStore<IncomeItem>('income'),
    getAllFromStore<StudyItem>('study_items'),
  ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks,
    notes,
    snippets,
    projects,
    income,
    studyItems,
  };
}

export async function importAllData(
  data: DayForgeExportData,
  mode: 'replace' | 'merge' = 'replace'
): Promise<{ success: boolean; counts: Record<string, number> }> {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid backup file format.');
  }

  const tasks = Array.isArray(data.tasks) ? data.tasks : [];
  const notes = Array.isArray(data.notes) ? data.notes : [];
  const snippets = Array.isArray(data.snippets) ? data.snippets : [];
  const projects = Array.isArray(data.projects) ? data.projects : [];
  const income = Array.isArray(data.income) ? data.income : [];
  const studyItems = Array.isArray(data.studyItems) ? data.studyItems : [];

  if (mode === 'replace') {
    await Promise.all([
      clearStore('tasks'),
      clearStore('notes'),
      clearStore('snippets'),
      clearStore('projects'),
      clearStore('income'),
      clearStore('study_items'),
    ]);
  }

  await Promise.all([
    bulkPutInStore('tasks', tasks),
    bulkPutInStore('notes', notes),
    bulkPutInStore('snippets', snippets),
    bulkPutInStore('projects', projects),
    bulkPutInStore('income', income),
    bulkPutInStore('study_items', studyItems),
  ]);

  return {
    success: true,
    counts: {
      tasks: tasks.length,
      notes: notes.length,
      snippets: snippets.length,
      projects: projects.length,
      income: income.length,
      studyItems: studyItems.length,
    },
  };
}

/**
 * Seed realistic starter data on first run
 */
export async function seedInitialDataIfEmpty(): Promise<boolean> {
  const existingTasks = await getAllFromStore<Task>('tasks');
  if (existingTasks.length > 0) {
    return false; // Already seeded
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const starterTasks: Task[] = [
    {
      id: 'task-1',
      title: 'Review production service worker cache config',
      description: 'Audit precache asset patterns and ensure dynamic /api routes are excluded from service worker cache.',
      priority: 'urgent',
      category: 'Work',
      dueDate: todayStr,
      completed: false,
      isRoutine: false,
      recurrence: 'none',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      title: 'Morning routine: Standup notes & daily priorities',
      description: 'Identify top 3 outcomes for the day and check blockers.',
      priority: 'high',
      category: 'Personal',
      dueDate: todayStr,
      completed: true,
      isRoutine: true,
      recurrence: 'daily',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    },
    {
      id: 'task-3',
      title: 'Audit client billing invoice #2026-04',
      description: 'Verify tracked hours for backend refactoring and send payment reminder to client.',
      priority: 'high',
      category: 'Freelance',
      dueDate: todayStr,
      completed: false,
      isRoutine: false,
      recurrence: 'none',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-4',
      title: 'Quarterly database indexing optimization',
      description: 'Analyze slow query logs on PostgreSQL read replicas and add composite indexes.',
      priority: 'medium',
      category: 'Dev',
      dueDate: yesterday, // Overdue task demo
      completed: false,
      isRoutine: false,
      recurrence: 'none',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'task-5',
      title: 'Practice chord voicings for weekend service',
      description: 'Focus on 2-5-1 passing progressions in Eb and transitions into bridge.',
      priority: 'medium',
      category: 'Music',
      dueDate: tomorrow,
      completed: false,
      isRoutine: true,
      recurrence: 'weekly',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-6',
      title: 'Outline Romans 8 study notes on perseverance',
      description: 'Draft structural cross-references and discussion questions.',
      priority: 'low',
      category: 'Study',
      dueDate: nextWeek,
      completed: false,
      isRoutine: false,
      recurrence: 'none',
      createdAt: new Date().toISOString(),
    },
  ];

  const starterNotes: Note[] = [
    {
      id: 'note-1',
      title: 'PWA Architecture & Offline-First Strategy',
      content: `# PWA Architecture & Offline-First Strategy

## Principles
- **Local-First Core**: Local client state in IndexedDB is the source of truth for immediate operations.
- **Service Worker Lifecycle**: Cache only invariant static assets (HTML shell, CSS bundles, JS modules, web fonts). Never cache mutating \`/api/*\` network responses.
- **Safe-Area Insets**: Respect \`env(safe-area-inset-bottom)\` on mobile notched viewports.

\`\`\`typescript
// Registration check
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
\`\`\`

## Offline Checklist
- [x] IndexedDB persistence
- [x] Standalone display mode in manifest
- [x] Offline connectivity banner
- [ ] Background sync queue
`,
      category: 'Programming',
      tags: ['pwa', 'architecture', 'typescript', 'indexeddb'],
      isPinned: true,
      isArchived: false,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'note-2',
      title: 'Expository Study: Romans 8 — Living in the Spirit',
      content: `# Expository Study: Romans 8

**Text**: Romans 8:1-17  
**Central Theme**: Freedom from condemnation and life governed by the Spirit of God.

### Structural Breakdown
1. **The Affirmation (v. 1-4)**: No condemnation for those in Christ Jesus; what the law was powerless to do, God did by sending His Son.
2. **The Contrast (v. 5-11)**: The mind governed by the flesh vs. the mind governed by the Spirit; life, peace, and resurrection power.
3. **The Adoption (v. 12-17)**: We have received the Spirit of adoption as children, calling out "Abba, Father".

### Hermeneutical Notes & Context
- Connects back to the struggle in chapter 7.
- Notice the triune work: Father initiating, Son executing atonement, Spirit applying and indwelling.
`,
      category: 'Bible Study',
      tags: ['theology', 'romans', 'expository', 'study'],
      isPinned: true,
      isArchived: false,
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'note-3',
      title: 'Acoustic Hymn Arrangement — Voicings & Modulations',
      content: `# Acoustic Hymn Arrangement — Voicings & Modulations

### Song Structure
- **Tempo**: 68 BPM (3/4 time signature)
- **Key**: C Major modulating to D Major on Verse 4
- **Instruments**: Acoustic Guitar (Drop D capo 2), Upright Bass, Cello, Piano

### Chord Chart Excerpt
\`\`\`
Verse 1 (Quiet fingerpicking):
| C  .  . | G/B .  . | Am7 . . | Fsus2 . . |
| C/E . . | F . .    | Gsus4 . . | C . . |

Interlude (Cello melody):
| Am7 . . | Fmaj7 . . | C . . | G . . |
\`\`\`

### Production Notes
- Keep verse 2 dynamic low; bring in gentle upright bass bow on Verse 3.
`,
      category: 'Music',
      tags: ['arrangement', 'guitar', 'music-theory'],
      isPinned: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ];

  const starterSnippets: Snippet[] = [
    {
      id: 'snip-1',
      title: 'PostgreSQL Recursive CTE for Hierarchical Trees',
      description: 'Retrieve nested organizational units or category trees with depth calculation.',
      language: 'sql',
      code: `WITH RECURSIVE category_tree AS (
  -- Anchor member: root categories
  SELECT 
    id, 
    name, 
    parent_id, 
    1 AS depth, 
    ARRAY[name] AS path
  FROM categories
  WHERE parent_id IS NULL

  UNION ALL

  -- Recursive member
  SELECT 
    c.id, 
    c.name, 
    c.parent_id, 
    ct.depth + 1, 
    ct.path || c.name
  FROM categories c
  JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT 
  id, 
  REPEAT('  ', depth - 1) || name AS indented_name, 
  depth, 
  path
FROM category_tree
ORDER BY path;`,
      tags: ['postgres', 'sql', 'cte', 'hierarchy'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'snip-2',
      title: 'TypeScript Safe JSON Parse Helper',
      description: 'Parse JSON strings safely without throwing exceptions, returning a typed Result tuple.',
      language: 'typescript',
      code: `export function safeJsonParse<T>(
  jsonString: string, 
  fallback: T
): { ok: true; data: T } | { ok: false; error: string; data: T } {
  try {
    const parsed = JSON.parse(jsonString) as T;
    return { ok: true, data: parsed };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown JSON syntax error';
    return { ok: false, error: errorMsg, data: fallback };
  }
}`,
      tags: ['typescript', 'json', 'utility'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'snip-3',
      title: 'Bash Safe Script Header (Unofficial Strict Mode)',
      description: 'Fail immediately on errors, unset variables, and pipeline failures with clean error traps.',
      language: 'bash',
      code: `#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\\n\\t'

trap 'echo "Error on line $LINENO: command $BASH_COMMAND failed with exit code $?" >&2' ERR

echo "Executing safe automated script..."`,
      tags: ['bash', 'devops', 'scripts'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const starterProjects: Project[] = [
    {
      id: 'proj-1',
      title: 'DayForge Desktop & Mobile PWA',
      description: 'Build local-first, privacy-respecting personal productivity engine with offline IndexedDB.',
      status: 'in_progress',
      deadline: nextWeek,
      nextAction: 'Finalize PWA service worker caching and cross-device JSON export verification.',
      category: 'Software',
      progress: 85,
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'proj-2',
      title: 'SaaS Client Billing Platform Integration',
      description: 'Stripe webhook processor and automated invoice generation for enterprise client.',
      status: 'review',
      deadline: tomorrow,
      nextAction: 'Deploy staging build for client QA team review.',
      category: 'Client Work',
      progress: 92,
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'proj-3',
      title: 'Sermon Series: The Architecture of Grace',
      description: 'Four-part expository study on Paul’s epistle to the Ephesians.',
      status: 'planning',
      deadline: '2026-11-15',
      nextAction: 'Draft introductory outline and Greek word study on Ephesians 2:8-10.',
      category: 'Ministry',
      progress: 30,
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const starterIncome: IncomeItem[] = [
    {
      id: 'inc-1',
      title: 'Frontend PWA Refactor & Performance Optimization',
      client: 'Meridian Labs LLC',
      amount: 3200,
      currency: 'USD',
      status: 'paid',
      isExpense: false,
      date: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0],
      notes: 'Completed ahead of milestone schedule. Paid via direct wire.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'inc-2',
      title: 'API Proxy & Auth Middleware Delivery',
      client: 'Acme Cloudworks',
      amount: 2450,
      currency: 'USD',
      status: 'invoiced',
      isExpense: false,
      date: todayStr,
      notes: 'Invoice #2026-04 sent. Payment terms Net 15.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'inc-3',
      title: 'Database Schema Audit & Index Tuning',
      client: 'Apex Fintech',
      amount: 1800,
      currency: 'USD',
      status: 'overdue',
      isExpense: false,
      date: new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0],
      notes: 'Followed up with accounting team yesterday.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'inc-4',
      title: 'Cloud Development VPS & SSL Certs',
      client: 'DayForge Infrastructure',
      amount: 68,
      currency: 'USD',
      status: 'paid',
      isExpense: true,
      date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
      notes: 'Development and testing servers.',
      createdAt: new Date().toISOString(),
    },
  ];

  const starterStudyItems: StudyItem[] = [
    {
      id: 'study-1',
      type: 'sermon_outline',
      title: 'The Anchor in the Tempest',
      subtitleOrKey: 'Hebrews 6:13-20',
      themeOrGenre: 'Expository Sermon Outline',
      sections: [
        {
          id: 'sec-1',
          heading: 'Introduction: The Need for Sure Foundations',
          notes: 'Open with the reality of cultural turbulence and uncertainty. The human soul seeks an unyielding anchor.',
          scriptureOrChords: 'Hebrews 6:13-15',
        },
        {
          id: 'sec-2',
          heading: 'Point 1: God’s Immutable Oath',
          notes: 'God bound Himself by two unchangeable things in which it is impossible for God to lie: His promise and His oath.',
          scriptureOrChords: 'Hebrews 6:16-18',
        },
        {
          id: 'sec-3',
          heading: 'Point 2: The Anchor Behind the Curtain',
          notes: 'Our hope is not cast into shifting seas, but upward into the heavenly sanctuary where Jesus has entered on our behalf.',
          scriptureOrChords: 'Hebrews 6:19-20',
        },
        {
          id: 'sec-4',
          heading: 'Conclusion & Practical Application',
          notes: 'Hold fast to the hope set before us. Live with boldness and endurance in daily trials.',
          scriptureOrChords: 'Hebrews 10:23',
        },
      ],
      actionItems: [
        { id: 'act-1', text: 'Select complementary hymns of assurance', completed: true },
        { id: 'act-2', text: 'Prepare pastoral prayer points for congregants facing hardship', completed: false },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'study-2',
      type: 'song_idea',
      title: 'Everlasting Rock',
      subtitleOrKey: 'Key of D Major · 74 BPM (4/4)',
      themeOrGenre: 'Contemporary Acoustic / Folk',
      sections: [
        {
          id: 'sec-m1',
          heading: 'Verse 1: Wandering in the Shadows',
          notes: 'Gentle acoustic picking. Focus on finding refuge when other grounds falter.',
          scriptureOrChords: '| D  .  .  . | G/D .  .  . | Bm7 .  .  . | Asus4 . A . |',
        },
        {
          id: 'sec-m2',
          heading: 'Chorus: You Stand Unmoved',
          notes: 'Full rhythm strumming with warm upright bass. Strong melodic lift.',
          scriptureOrChords: '| G  .  .  . | D/F# . .  . | Bm7 .  .  . | A . . . |',
        },
        {
          id: 'sec-m3',
          heading: 'Bridge: Build on This Solid Ground',
          notes: 'Building dynamic, tom accents, four-on-the-floor kick.',
          scriptureOrChords: '| Em7 . . . | D/F# . . . | G . . . | A . . . |',
        },
      ],
      actionItems: [
        { id: 'act-m1', text: 'Record acoustic demo on voice memo', completed: true },
        { id: 'act-m2', text: 'Write bridge lyric variation 2', completed: false },
        { id: 'act-m3', text: 'Sheet music chord chart export for accompanist', completed: false },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  await Promise.all([
    bulkPutInStore('tasks', starterTasks),
    bulkPutInStore('notes', starterNotes),
    bulkPutInStore('snippets', starterSnippets),
    bulkPutInStore('projects', starterProjects),
    bulkPutInStore('income', starterIncome),
    bulkPutInStore('study_items', starterStudyItems),
  ]);

  return true;
}
