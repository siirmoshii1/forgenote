# DayForge — My Personal Productivity PWA

DayForge is a production-grade, local-first personal productivity Progressive Web App designed for desktop, tablet, and mobile. It brings daily task planning, markdown knowledge management, a developer toolbox, project/income tracking, personal study and music arrangement workspaces, and an optional server-side Gemini copilot into a unified, high-performance interface.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following key decisions have been aligned based on user clarification and design requirements:

- **Visual Theme & Aesthetic Direction**: Confirmed **Black & White** minimalist theme with high-contrast surfaces, razor-sharp typography, and subtle muted blue accent tokens (`#2563EB` / `#3B82F6` accents with deep slate blacks `#09090B` and crisp whites `#FFFFFF`).
- **Initial Data Seeding**: Confirmed preloading **realistic starter data** across all modules (tasks across priority tiers, categorized markdown notes, developer code snippets, client projects and income ledger items, and sample study/song outlines) so the application is rich, demonstrable, and immediately useful on first boot.
- **Gemini Copilot Focus**: Confirmed **multi-purpose productivity copilot** providing contextual assistance (daily task breakdown, note summarization & key takeaway extraction, writing outlines, and quick brainstorming) powered securely through server-side endpoints without exposing API keys.
- **Offline & Persistence Contract**: 100% functional offline using native **IndexedDB** for structured entities and `localStorage` for visual preferences. Zero fake sync indicators; transparent export/import via validated JSON.

---

## 1. Overview & Core Concept

### What It Does
DayForge unites six essential workflows for developers, creators, and thinkers:
1. **Daily Planner & Task Engine**: Priority-tiered task manager supporting due dates, recurring tasks, daily routine checklists, filter/search, and dual List/Calendar views.
2. **Notes & Knowledge Base**: Full Markdown note-taking workspace with tag filtering, pinning, archiving, and structured category folders (Work, Personal, Bible Study, Music, Programming).
3. **Developer Toolbox**: Utilities including JSON formatter/validator, SQL & code snippet library with syntax copying, side-by-side text difference/comparison, and word/character counter.
4. **Project & Income Tracker**: Milestone tracker for personal initiatives combined with a freelance income ledger calculating gross agreed amounts, payment statuses (Draft, Invoiced, Paid, Overdue), and expense deductions with accurate mathematical summaries.
5. **Study & Music Workspaces**: Structured organizational boards for sermon/study outlines, scriptural research notes, song composition logs, arrangement trackers, and chord/tempo references (strictly organizational, respecting copyright and sacred content).
6. **Gemini Productivity Copilot**: Server-side AI assistant using `gemini-3.8-flash` to break down overwhelming tasks, summarize long notes, polish writing, and brainstorm next actions. Completely resilient if offline or if the API key is not configured.

### Target Audience & Persona
Power users, software engineers, independent creators, and students who demand zero bloat, instant keyboard-driven speed, offline reliability, and an uncluttered workspace.

### Key Value
- **Zero latency**: Instant local IndexedDB queries with zero network dependencies for core work.
- **Cross-platform PWA**: Seamless installation on Android, iOS Safari, macOS, and Windows with touch targets $\ge 44\text{px}$ and desktop sidebar navigation.
- **Privacy by default**: Personal thoughts and financial data remain on the user's device until explicitly exported.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Morning Routine & Planning Flow**:
   - Launch app (or open PWA standalone) $\rightarrow$ View Dashboard with Today's Priorities, Overdue alerts, and Routine Checklist $\rightarrow$ Mark routine items done $\rightarrow$ Add or reprioritize tasks with inline quick-add (`Enter` key submission).
2. **Knowledge Capture & Markdown Editing Flow**:
   - Navigate to Notes $\rightarrow$ Filter by category or search $\rightarrow$ Create note with live split Markdown preview, code block formatting, and tag assignment $\rightarrow$ Pin to top.
3. **Developer Utilities Flow**:
   - Open Developer Toolbox $\rightarrow$ Paste JSON to format, validate, or minify $\rightarrow$ Switch to Text Diff to compare two text revisions $\rightarrow$ Save reusable SQL query snippet to the local snippet library.
4. **Project & Financial Management Flow**:
   - Open Projects & Income $\rightarrow$ Track project milestones $\rightarrow$ Log freelance invoice $\rightarrow$ Status automatically recomputes gross billings, received cash, and pending balances in real-time.
5. **Data Backup & Restore Flow**:
   - Access Settings modal $\rightarrow$ Export entire database as single timestamped `.json` file $\rightarrow$ Restore or migrate on another device with pre-flight schema validation and preview.

### Visual Identity & Theme
- **Aesthetic Direction**: High-contrast, minimalist utilitarian architecture inspired by physical toolkits and Swiss typography. Clean black and white baseline with subtle muted slate-blue functional accents.
- **Color Tokens**:
  - Light Mode: Canvas `#FFFFFF`, Surfaces `#F8FAFC` and `#F1F5F9`, Hairline Borders `#E2E8F0`, Text `#0F172A`, Muted Text `#64748B`, Accent `#2563EB`.
  - Dark Mode: Canvas `#09090B`, Surfaces `#18181B` and `#27272A`, Hairline Borders `#27272A`, Text `#F4F4F5`, Muted Text `#A1A1AA`, Accent `#3B82F6`.
- **Anti-Slop Discipline**:
  - No purple neon glows, floating decorative cards, or arbitrary circular scorecards.
  - Zero-pill metadata: Tags, categories, timestamps, and counts rendered as clean unboxed text with typographic separators (`·`, `/`).
  - No decorative status dots; icons used exclusively for functional affordances.
  - Tabular numerals (`font-mono tabular-nums`) applied to all financial sums, dates, timers, and line counts.
- **Responsive Layout**:
  - **Desktop ($\ge 1024\text{px}$)**: Fixed collapsible sidebar ($260\text{px}$) with primary module links, PWA status, quick keyboard shortcuts, and active workspace views.
  - **Mobile ($< 1024\text{px}$)**: Fixed ergonomic bottom navigation bar ($56\text{px}$) with touch targets $\ge 44\text{px}$, combined with a compact top bar providing contextual title, search toggle, and global quick-add.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Local-First IndexedDB vs. Remote Storage
- *Chosen Approach*: Native client-side IndexedDB database (`DayForgeDB`) wrapping tasks, notes, snippets, projects, income items, and study entries.
- *Why*: Eliminates latency, guarantees 100% offline functionality, and respects user privacy.
- *Trade-Off*: Cross-device syncing requires manual JSON backup/restore; no automatic cloud sync is simulated or misrepresented.

### Decision 2: PWA Installation Architecture
- *Chosen Approach*: `vite-plugin-pwa` with custom manifest, service worker caching safe static app shell assets (HTML, CSS, JS, icons), and a dedicated `usePWAInstall` hook handling `beforeinstallprompt` on Android/Chromium, along with an iOS Safari "Add to Home Screen" guided sheet.
- *Why*: Provides real browser-native standalone application capability across all target platforms.
- *Safety*: Service worker strictly bypasses `/api/*` endpoints to ensure dynamic AI requests and server queries are never stale.

### Decision 3: Server-Side Gemini API Proxy
- *Chosen Approach*: Lightweight server proxy endpoint (`/api/gemini/generate`) running on Node.js using `@google/genai` with `gemini-3.8-flash`.
- *Why*: Keeps the `GEMINI_API_KEY` secure on the server, avoiding any client-side exposure in JavaScript bundles or network tabs.
- *Graceful Degradation*: The client tests connection status; if offline or if the API key is not set, AI buttons provide clear, helpful feedback while all other modules remain fully operational.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                       DayForge PWA (Browser Client)                     │
│                                                                        │
│  ┌──────────────────────┐  ┌────────────────────────────────────────┐  │
│  │ Desktop Sidebar /    │  │ Active Workspace Router & Views        │  │
│  │ Mobile Bottom Bar    │  │  - Dashboard & Daily Planner           │  │
│  │ - PWA Install Action │  │  - Notes & Knowledge Base (Markdown)   │  │
│  │ - Theme Toggle (B&W) │  │  - Developer Toolbox (JSON, SQL, Diff) │  │
│  │ - Offline Indicator  │  │  - Projects & Income Ledger            │  │
│  └──────────┬───────────┘  │  - Study & Music Workspaces            │  │
│             │              │  - Backup & JSON Export/Import         │  │
│             │              └───────────────────┬────────────────────┘  │
│             ▼                                  ▼                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │               DayForge IndexedDB Repository (Local-First)         │  │
│  │  - tasks | notes | snippets | projects | income | study_items   │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │ Dynamic /api calls only
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Node.js / Express Server API                       │
│                                                                        │
│   POST /api/gemini/generate                                            │
│   - Reads process.env.GEMINI_API_KEY                                   │
│   - Uses @google/genai SDK with gemini-3.8-flash                       │
│   - User-Agent: aistudio-build                                         │
│   - Task breakdown, note summaries, writing assistance                 │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Entities & Schema (`DayForgeDB`)
- **`Task`**: `id`, `title`, `description`, `priority` (low, medium, high, urgent), `category`, `dueDate`, `completed`, `isRoutine`, `recurrence` (none, daily, weekly, monthly), `createdAt`, `completedAt`.
- **`Note`**: `id`, `title`, `content` (Markdown), `category` (Work, Personal, Bible Study, Music, Programming), `tags` (`string[]`), `isPinned`, `isArchived`, `updatedAt`, `createdAt`.
- **`Snippet`**: `id`, `title`, `description`, `language` (sql, json, typescript, bash, python, etc.), `code`, `tags` (`string[]`), `createdAt`.
- **`Project`**: `id`, `title`, `description`, `status` (active, paused, completed), `deadline`, `nextAction`, `createdAt`.
- **`IncomeItem`**: `id`, `title`, `client`, `amount` (`number`), `currency`, `status` (draft, invoiced, paid, overdue), `isExpense`, `date`, `notes`.
- **`StudyItem`**: `id`, `type` (`sermon_outline`, `scripture_study`, `song_idea`, `music_arrangement`), `title`, `referenceOrKey`, `structure` (`string`), `tasks` (`string[]`), `updatedAt`.

---

## 5. Implementation Sequence & Milestones

1. **PWA & Build Setup**:
   - Configure `vite.config.ts` with `vite-plugin-pwa` (standalone display, auto-update, safe asset caching).
   - Generate standards-compliant manifest, web app icons, and `<head>` tags in `index.html`.
   - Update `metadata.json` with app title and description.
2. **Server-Side Gemini Proxy**:
   - Implement `/api/gemini/generate` in Node.js server with `@google/genai` and model `gemini-3.8-flash`.
   - Verify server startup and environment variable handling.
3. **Core Local-First Storage & Seeding**:
   - Build typed IndexedDB wrapper with comprehensive initial sample data.
   - Implement validated JSON backup export and import with conflict handling.
4. **Shell, Navigation & Theme System**:
   - Implement Black & White theme engine (light/dark with persistent preference).
   - Build responsive shell: Desktop Sidebar with keyboard shortcuts + Mobile Bottom Navigation with safe touch hitboxes.
   - Integrate in-app PWA install button and online/offline status bar.
5. **Dashboard & Daily Planner**:
   - Today's priority stack, overdue task alerts, routine checklist, calendar view, and quick task creation modal.
6. **Notes & Knowledge Base**:
   - Markdown editor with live preview, category tabs, tag search, pinning, and archive management.
7. **Developer Toolbox**:
   - Interactive JSON formatter/validator/minifier, side-by-side text diff, character/word counter, and searchable snippet library with one-click clipboard copying.
8. **Projects & Freelance Income Tracker**:
   - Project milestone manager and financial ledger computing gross invoiced, paid income, pending receivables, and net profit.
9. **Study & Music Workspaces**:
   - Specialized outline builders for sermons/studies and song arrangement checklists.
10. **Gemini Copilot Modal**:
    - Floating action sheet providing task breakdown, note summary, and writing assistant connected to `/api/gemini/generate`.
11. **Verification & Quality Assurance**:
    - Run `compile_applet` and `lint_applet` to verify clean build without TypeScript errors.
    - Validate responsive states on desktop, tablet, and mobile.
