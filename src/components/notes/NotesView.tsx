import React, { useState } from 'react';
import {
  Plus,
  Search,
  Pin,
  Archive,
  Trash2,
  Edit3,
  Eye,
  Sparkles,
  Tag,
  Check,
  Folder,
} from 'lucide-react';
import { Note, NoteCategory } from '../../types.ts';

interface NotesViewProps {
  notes: Note[];
  onSaveNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  openGeminiWithContext: (prompt: string, title: string) => void;
}

const CATEGORIES: NoteCategory[] = [
  'Work',
  'Personal',
  'Bible Study',
  'Music',
  'Programming',
];

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  onSaveNote,
  onDeleteNote,
  openGeminiWithContext,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // Active note in editor
  const [activeNoteId, setActiveNoteId] = useState<string | null>(() => {
    return notes.length > 0 ? notes[0].id : null;
  });

  const [editorMode, setEditorMode] = useState<'write' | 'preview' | 'split'>('split');

  // Form states for active note
  const currentNote = notes.find((n) => n.id === activeNoteId);
  const [title, setTitle] = useState(currentNote?.title || '');
  const [content, setContent] = useState(currentNote?.content || '');
  const [category, setCategory] = useState<NoteCategory>(currentNote?.category || 'Work');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(currentNote?.tags || []);
  const [isPinned, setIsPinned] = useState(currentNote?.isPinned || false);
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  // Sync editor when activeNoteId changes
  React.useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
      setCategory(currentNote.category);
      setTags(currentNote.tags);
      setIsPinned(currentNote.isPinned);
    }
  }, [activeNoteId, currentNote]);

  // All tags across visible notes
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags).filter(Boolean)));

  // Filter notes list
  const filteredNotes = notes.filter((note) => {
    if (note.isArchived !== showArchived) return false;
    if (selectedCategory !== 'All' && note.category !== selectedCategory) return false;
    if (selectedTag && !note.tags.includes(selectedTag)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = note.title.toLowerCase().includes(q);
      const matchContent = note.content.toLowerCase().includes(q);
      const matchTags = note.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchTags) return false;
    }
    return true;
  });

  // Sort pinned first, then updated recently
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const handleCreateNewNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: 'Untitled Note',
      content: '',
      category: selectedCategory === 'All' ? 'Work' : selectedCategory,
      tags: [],
      isPinned: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSaveNote(newNote);
    setActiveNoteId(newNote.id);
  };

  const handleSaveCurrentNote = () => {
    if (!currentNote) return;
    const updated: Note = {
      ...currentNote,
      title: title.trim() || 'Untitled Note',
      content,
      category,
      tags,
      isPinned,
      updatedAt: new Date().toISOString(),
    };
    onSaveNote(updated);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2000);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '').toLowerCase();
      if (clean && !tags.includes(clean)) {
        const next = [...tags, clean];
        setTags(next);
        if (currentNote) {
          onSaveNote({ ...currentNote, tags: next, updatedAt: new Date().toISOString() });
        }
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const next = tags.filter((t) => t !== tagToRemove);
    setTags(next);
    if (currentNote) {
      onSaveNote({ ...currentNote, tags: next, updatedAt: new Date().toISOString() });
    }
  };

  const handleTogglePin = () => {
    if (!currentNote) return;
    const next = !isPinned;
    setIsPinned(next);
    onSaveNote({ ...currentNote, isPinned: next, updatedAt: new Date().toISOString() });
  };

  const handleToggleArchive = () => {
    if (!currentNote) return;
    const next = !currentNote.isArchived;
    onSaveNote({ ...currentNote, isArchived: next, updatedAt: new Date().toISOString() });
  };

  const handleAIAction = (mode: 'summary' | 'takeaways') => {
    if (!content.trim()) return;
    if (mode === 'summary') {
      openGeminiWithContext(
        `Please provide an executive summary of the following notes:\n\nTitle: ${title}\n\n${content}`,
        `Summary of: ${title}`
      );
    } else {
      openGeminiWithContext(
        `Please extract 3-5 high-priority action items and key takeaways from these notes:\n\nTitle: ${title}\n\n${content}`,
        `Action Items from: ${title}`
      );
    }
  };

  // Metrics
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Basic Markdown Renderer for Preview
  const renderMarkdown = (text: string) => {
    if (!text.trim()) {
      return <p className="text-zinc-400 italic">Empty note. Start typing on the left...</p>;
    }

    const lines = text.split('\n');
    return (
      <div className="space-y-3 prose dark:prose-invert max-w-none text-sm text-zinc-800 dark:text-zinc-200">
        {lines.map((line, idx) => {
          if (line.startsWith('# ')) {
            return (
              <h1 key={idx} className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white pt-2 border-b border-zinc-200 dark:border-zinc-800 pb-1">
                {line.replace('# ', '')}
              </h1>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 pt-2">
                {line.replace('## ', '')}
              </h2>
            );
          }
          if (line.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-base font-medium tracking-tight text-zinc-900 dark:text-zinc-100 pt-1">
                {line.replace('### ', '')}
              </h3>
            );
          }
          if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
            const checked = line.startsWith('- [x] ');
            const label = line.replace(/- \[[ x]\] /, '');
            return (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <input type="checkbox" readOnly checked={checked} className="rounded accent-blue-600" />
                <span className={checked ? 'line-through text-zinc-400' : ''}>{label}</span>
              </div>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <li key={idx} className="ml-4 list-disc text-xs sm:text-sm">
                {line.replace(/^[-*]\s+/, '')}
              </li>
            );
          }
          if (line.startsWith('```')) {
            return (
              <pre key={idx} className="p-3 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto">
                <code>{line.replace(/```[a-z]*/, '')}</code>
              </pre>
            );
          }
          if (line.trim() === '') {
            return <div key={idx} className="h-1" />;
          }
          return (
            <p key={idx} className="text-xs sm:text-sm leading-relaxed">
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Category Tabs & Archive toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition ${
              selectedCategory === 'All'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            All Notes
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition ${
              showArchived
                ? 'border-zinc-900 bg-zinc-100 text-zinc-900 dark:border-zinc-100 dark:bg-zinc-800 dark:text-white'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {showArchived ? 'Viewing Archived' : 'Show Archive'}
          </button>
          <button
            onClick={handleCreateNewNote}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Split Layout: Note List Sidebar + Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-14rem)] min-h-[550px]">
        {/* Left Column: Note List (4 cols on lg) */}
        <div className="lg:col-span-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col overflow-hidden">
          {/* Note Search & Tag filter */}
          <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes or tags..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 outline-none"
              />
            </div>

            {/* Tag Quick Selector */}
            {allTags.length > 0 && (
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="text-[10px] px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-mono"
                  >
                    Clear Tag
                  </button>
                )}
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`text-[10px] px-2 py-0.5 rounded font-mono transition ${
                      selectedTag === tag
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notes Scrollable Feed */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {sortedNotes.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400 space-y-2">
                <Folder className="w-6 h-6 mx-auto text-zinc-300 dark:text-zinc-700" />
                <p>No notes in this view.</p>
              </div>
            ) : (
              sortedNotes.map((note) => {
                const isActive = note.id === activeNoteId;
                return (
                  <button
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className={`w-full text-left p-3.5 transition flex flex-col gap-1.5 ${
                      isActive
                        ? 'bg-zinc-100/80 dark:bg-zinc-800/80'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {note.title || 'Untitled'}
                      </span>
                      {note.isPinned && (
                        <Pin className="w-3 h-3 text-blue-500 fill-blue-500 shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {note.content.replace(/[#*`_]/g, '') || 'Empty note...'}
                    </p>

                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono pt-1">
                      <span>{note.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Editor & Preview Workspace (8 cols on lg) */}
        <div className="lg:col-span-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col overflow-hidden">
          {currentNote ? (
            <>
              {/* Note Header & Action Controls */}
              <div className="p-3 sm:px-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <select
                    value={category}
                    onChange={(e) => {
                      const newCat = e.target.value as NoteCategory;
                      setCategory(newCat);
                      onSaveNote({ ...currentNote, category: newCat, updatedAt: new Date().toISOString() });
                    }}
                    className="text-xs px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <button
                    onClick={handleTogglePin}
                    className={`p-1.5 rounded-md text-xs font-medium transition ${
                      isPinned
                        ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400'
                        : 'text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                    title={isPinned ? 'Unpin note' : 'Pin note'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleToggleArchive}
                    className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
                    title={currentNote.isArchived ? 'Unarchive note' : 'Archive note'}
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteNote(currentNote.id)}
                    className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition"
                    title="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* AI Copilot Tools */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleAIAction('summary')}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition"
                      title="Summarize with Gemini"
                    >
                      <Sparkles className="w-3 h-3 text-blue-500" />
                      <span>Summarize</span>
                    </button>
                    <button
                      onClick={() => handleAIAction('takeaways')}
                      className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition"
                      title="Extract Action Items with Gemini"
                    >
                      <Sparkles className="w-3 h-3 text-blue-500" />
                      <span>Takeaways</span>
                    </button>
                  </div>

                  {/* Mode switcher (Write / Preview / Split) */}
                  <div className="flex items-center p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-xs">
                    <button
                      onClick={() => setEditorMode('write')}
                      className={`px-2 py-1 rounded ${editorMode === 'write' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500'}`}
                    >
                      Write
                    </button>
                    <button
                      onClick={() => setEditorMode('preview')}
                      className={`px-2 py-1 rounded ${editorMode === 'preview' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500'}`}
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => setEditorMode('split')}
                      className={`hidden md:block px-2 py-1 rounded ${editorMode === 'split' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500'}`}
                    >
                      Split
                    </button>
                  </div>

                  <button
                    onClick={handleSaveCurrentNote}
                    className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition"
                  >
                    {isSavedRecently ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <span>Save</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Title & Tag input row */}
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleSaveCurrentNote}
                  placeholder="Note Title..."
                  className="w-full text-lg sm:text-xl font-bold bg-transparent text-zinc-900 dark:text-zinc-100 outline-none"
                />

                {/* Tag Chips & Input */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-zinc-400" />
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-1"
                    >
                      #{tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add tag + Enter..."
                    className="text-xs bg-transparent text-zinc-700 dark:text-zinc-300 outline-none placeholder:text-zinc-400 font-mono"
                  />
                </div>
              </div>

              {/* Body: Write, Preview, or Split */}
              <div className="flex-1 flex overflow-hidden">
                {(editorMode === 'write' || editorMode === 'split') && (
                  <div className={`flex-1 p-4 overflow-y-auto ${editorMode === 'split' ? 'border-r border-zinc-200 dark:border-zinc-800' : ''}`}>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onBlur={handleSaveCurrentNote}
                      placeholder="Write Markdown here... Use # for headings, - for lists, ``` for code blocks."
                      className="w-full h-full bg-transparent text-sm leading-relaxed text-zinc-900 dark:text-zinc-100 outline-none resize-none font-mono"
                    />
                  </div>
                )}

                {(editorMode === 'preview' || editorMode === 'split') && (
                  <div className="flex-1 p-4 overflow-y-auto bg-zinc-50/40 dark:bg-zinc-950/20">
                    {renderMarkdown(content)}
                  </div>
                )}
              </div>

              {/* Word & Character count status bar */}
              <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <div className="flex items-center gap-3">
                  <span>{wordCount} words</span>
                  <span>·</span>
                  <span>{charCount} characters</span>
                  <span>·</span>
                  <span>~{readingTimeMinutes} min read</span>
                </div>
                <span>Markdown enabled</span>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-400 space-y-3">
              <Folder className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
              <p className="text-sm">Select a note or create a new one to begin writing.</p>
              <button
                onClick={handleCreateNewNote}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                Create Note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
