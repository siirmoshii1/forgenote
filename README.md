# DayForge — My Personal Productivity PWA

DayForge is a production-grade, local-first personal productivity Progressive Web App designed for desktop, tablet, and mobile browsers. It unifies daily priority planning, Markdown knowledge notes, developer utilities, project/freelance income tracking, and structured study/music workspaces with an optional server-side Gemini AI copilot.

---

## 1. Key Implemented Features

### A. Dashboard & Daily Planner
- **Task Management**: Create, edit, complete, delete, reprioritize (Urgent, High, Medium, Low), and categorize tasks.
- **Due Dates & Recurrence**: Schedule tasks with due dates, filter upcoming/overdue tasks, and configure recurrence rules (Daily, Weekly, Monthly).
- **Daily Routine Checklist**: Track daily habits (morning standup, prayer, code reviews) with visual strike-through and completion progress.
- **Dual View Modes**: Seamless switching between high-density List View and full monthly Calendar View.
- **Overdue Attention Callout**: Automatic alert banner highlighting overdue deliverables.

### B. Notes & Knowledge Base
- **Markdown Workspace**: Full Markdown support with split live preview, headings, code blocks, lists, and checklists.
- **Categorization & Tagging**: Organize notes into Work, Personal, Bible Study, Music, and Programming categories with interactive `#tag` filtering.
- **Pinning & Archiving**: Pin mission-critical notes to top; archive finished research notes.
- **Writing Telemetry**: Live word counter, character counter, and estimated reading time calculator.
- **AI Integrations**: One-click note summarization and action item extraction via Gemini.

### C. Developer Toolbox
- **JSON Formatter & Validator**: Beautify (2 or 4 spaces), minify, clear, validate syntax errors with line indicators, and copy to clipboard.
- **Text Diff & Compare**: Side-by-side or line comparison highlighting additions, deletions, and modifications between two revisions.
- **SQL & Code Snippet Library**: Store, search, and copy reusable SQL queries, TypeScript helpers, bash strict mode scripts, and Python routines.
- **Text Statistics**: Compute words, characters with/without spaces, line count, sentence count, and UTF-8 byte sizes.

### D. Project & Freelance Income Tracker
- **Project Initiatives**: Track project milestones, status (Planning, In Progress, Review, Completed, Paused), deadlines, and immediate next actions.
- **Freelance Ledger**: Record client invoices and business expenses with agreed amounts, currency, and payment status (Draft, Invoiced, Paid, Overdue).
- **Mathematical Integrity**: Accurate financial totals computed from stored data—Total Invoiced, Cash Received, Outstanding Receivables, Deductible Expenses, and Net Profit.

### E. Study & Music Workspaces
- **Bible Study & Sermon Outlines**: Structure expository sermon outlines, research points, scripture references, and ministry action checklists (purely organizational; no invented scriptures).
- **Music & Composition Notebook**: Track song arrangements, chord charts, musical keys, BPM tempos, and rehearsal checklists.

### F. Optional Gemini Productivity Copilot
- **Server-Side Security**: All Gemini calls run through server endpoints (`/api/gemini/generate`) using `GEMINI_API_KEY`. API keys are never exposed to browser bundles or network tabs.
- **Model**: Powered by `gemini-3.8-flash` with `User-Agent: aistudio-build`.
- **4 Productivity Modes**:
  1. *Task Breakdown*: Convert intimidating goals into actionable sub-tasks with **1-click direct import into DayForge tasks**.
  2. *Note Summarizer*: Produce executive summaries and takeaways.
  3. *Writing Polisher*: Refine tone and structure.
  4. *Brainstormer*: Overcome stuck projects with practical next actions.
- **Resilience**: Gracefully informs the user if offline or if the server key is missing without breaking the rest of the app.

### G. Local-First Privacy & PWA
- **100% Offline Capability**: Uses browser IndexedDB (`DayForgeDB`) for all user data.
- **PWA Installable**: Standalone display mode, web app manifest, maskable and standard PNG icons, and Apple touch icon.
- **In-App Installation Guide**: Seamless install trigger on Chromium browsers and step-by-step "Add to Home Screen" instructions for iOS Safari.
- **Portable JSON Backup**: Export and import complete snapshots with merge or replace options.

---

## 2. Environment Variables

Create or configure `.env` based on `.env.example`:

```bash
# GEMINI_API_KEY: Required for server-side Gemini AI assistance.
# Automatically injected in AI Studio.
GEMINI_API_KEY="your-gemini-api-key"

# PORT: Server port (defaults to 3000)
PORT=3000

# NODE_ENV: Set to 'production' for production builds
NODE_ENV=development
```

---

## 3. Development & Build Instructions

### Installation
```bash
npm install
```

### Running Locally (Full-Stack Dev Server)
Starts Express with Vite middleware on port 3000:
```bash
npm run dev
```

### Building for Production
Builds the client SPA with Vite and compiles the PWA service worker into `/dist`:
```bash
npm run build
```

### Production Run
```bash
npm start
```

### Linting & TypeScript Check
```bash
npm run lint
```

---

## 4. PWA Installation

### Android / Chrome / Edge / Brave
1. Open DayForge in your browser.
2. Click **Install DayForge PWA** in the sidebar or bottom menu, or tap the install icon in your browser URL address bar.
3. Confirm installation. The app will launch in a standalone, borderless window with offline caching.

### iPhone / iPad (iOS Safari)
1. Open the app in Safari.
2. Tap the **Share** button in Safari's bottom toolbar.
3. Scroll down and select **Add to Home Screen**.
4. Tap **Add**.

---

## 5. Known Limitations
- **Cross-Device Sync**: In accordance with local-first privacy, DayForge does not automatically sync across devices without manual JSON export/import. (Cloud synchronization with authentication can be layered in future releases).
- **AI Offline Requirement**: Gemini Copilot requests require an active internet connection and a configured `GEMINI_API_KEY`. When offline, all local tasks, notes, snippets, and tools remain completely functional.
