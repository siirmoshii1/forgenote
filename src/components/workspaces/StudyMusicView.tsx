import React, { useState } from 'react';
import {
  BookOpen,
  Music,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  FolderOpen,
  Tag,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { StudyItem, StudyType } from '../../types.ts';

interface StudyMusicViewProps {
  studyItems: StudyItem[];
  onSaveStudyItem: (item: StudyItem) => void;
  onDeleteStudyItem: (id: string) => void;
}

export const StudyMusicView: React.FC<StudyMusicViewProps> = ({
  studyItems,
  onSaveStudyItem,
  onDeleteStudyItem,
}) => {
  const [activeTab, setActiveTab] = useState<'study' | 'music'>('study');
  const [editingItem, setEditingItem] = useState<StudyItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const bibleItems = studyItems.filter(
    (i) => i.type === 'sermon_outline' || i.type === 'scripture_study'
  );
  const musicItems = studyItems.filter(
    (i) => i.type === 'song_idea' || i.type === 'music_arrangement'
  );

  const currentList = activeTab === 'study' ? bibleItems : musicItems;

  const toggleTaskCompleted = (itemId: string, taskId: string) => {
    const target = studyItems.find((i) => i.id === itemId);
    if (!target) return;
    const updatedTasks = target.actionItems.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    onSaveStudyItem({ ...target, actionItems: updatedTasks, updatedAt: new Date().toISOString() });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Segmented Tabs & Action */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('study')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition ${
              activeTab === 'study'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Bible Study & Sermon Outlines ({bibleItems.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('music')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition ${
              activeTab === 'music'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Music & Song Arrangements ({musicItems.length})</span>
          </button>
        </div>

        <button
          onClick={() => {
            setEditingItem({
              id: '',
              type: activeTab === 'study' ? 'sermon_outline' : 'song_idea',
              title: '',
              subtitleOrKey: '',
              themeOrGenre: '',
              sections: [
                {
                  id: `sec-${Date.now()}-1`,
                  heading: activeTab === 'study' ? 'Introduction' : 'Verse 1',
                  notes: '',
                  scriptureOrChords: '',
                },
              ],
              actionItems: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{activeTab === 'study' ? 'New Study Outline' : 'New Music Project'}</span>
        </button>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {activeTab === 'study'
          ? 'Structured workspace for organizing scripture study points, sermon structures, and teaching action items.'
          : 'Structured workspace for song ideas, arrangement chord charts, tempo cues, and rehearsal checklists.'}
      </p>

      {/* Grid of Workspaces */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentList.length === 0 ? (
          <div className="col-span-2 py-16 text-center text-xs text-zinc-400">
            No entries found in this workspace. Create an outline or project to get started.
          </div>
        ) : (
          currentList.map((item) => {
            const isExpanded = expandedItemId === item.id;
            const completedCount = item.actionItems.filter((a) => a.completed).length;

            return (
              <div
                key={item.id}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col justify-between"
              >
                {/* Header */}
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.title}
                      </h3>
                      {item.subtitleOrKey && (
                        <p className="text-xs font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                          {item.subtitleOrKey}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {item.type.replace('_', ' ')}
                    </span>
                  </div>

                  {item.themeOrGenre && (
                    <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                      <Tag className="w-3 h-3 text-zinc-400" />
                      <span>{item.themeOrGenre}</span>
                    </div>
                  )}
                </div>

                {/* Section Structure Content */}
                <div className="p-4 space-y-3 flex-1">
                  {item.sections.map((sec, idx) => (
                    <div
                      key={sec.id || idx}
                      className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-950/40 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {sec.heading}
                        </span>
                        {sec.scriptureOrChords && (
                          <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                            {sec.scriptureOrChords}
                          </span>
                        )}
                      </div>
                      {sec.notes && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          {sec.notes}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* Action Items / Tasks Checklist */}
                  {item.actionItems && item.actionItems.length > 0 && (
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
                        <span>Checklist & Action Tasks</span>
                        <span className="font-mono tabular-nums text-[11px]">
                          {completedCount}/{item.actionItems.length}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {item.actionItems.map((task) => (
                          <button
                            key={task.id}
                            onClick={() => toggleTaskCompleted(item.id, task.id)}
                            className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-left text-xs"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            )}
                            <span
                              className={`truncate ${
                                task.completed ? 'line-through text-zinc-400' : 'text-zinc-700 dark:text-zinc-300'
                              }`}
                            >
                              {task.text}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-mono text-[11px]">
                    Updated {new Date(item.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setIsModalOpen(true);
                      }}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                      title="Edit outline"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteStudyItem(item.id)}
                      className="p-1 rounded text-zinc-400 hover:text-red-500"
                      title="Delete outline"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Workspace Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {editingItem.id ? 'Edit Workspace Outline' : 'New Workspace Outline'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editingItem.title.trim()) return;
                onSaveStudyItem({
                  ...editingItem,
                  id: editingItem.id || `study-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  updatedAt: new Date().toISOString(),
                });
                setIsModalOpen(false);
              }}
              className="p-6 space-y-4 overflow-y-auto text-xs"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase text-zinc-500 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    placeholder="e.g. The Power of the Resurrection"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-zinc-500 mb-1">Type</label>
                  <select
                    value={editingItem.type}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, type: e.target.value as StudyType })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none"
                  >
                    <option value="sermon_outline">Sermon Outline</option>
                    <option value="scripture_study">Scripture Study</option>
                    <option value="song_idea">Song Idea</option>
                    <option value="music_arrangement">Music Arrangement</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase text-zinc-500 mb-1">
                    Scripture Passage or Key / Tempo
                  </label>
                  <input
                    type="text"
                    value={editingItem.subtitleOrKey || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, subtitleOrKey: e.target.value })}
                    placeholder="e.g. Romans 8:1-11 or Key of G · 74 BPM"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-zinc-500 mb-1">
                    Theme / Musical Genre
                  </label>
                  <input
                    type="text"
                    value={editingItem.themeOrGenre || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, themeOrGenre: e.target.value })}
                    placeholder="e.g. Grace & Faith or Contemporary Folk"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none"
                  />
                </div>
              </div>

              {/* Sections Editor */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold uppercase text-zinc-500">
                    Structural Sections & Notes
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingItem({
                        ...editingItem,
                        sections: [
                          ...editingItem.sections,
                          {
                            id: `sec-${Date.now()}`,
                            heading: `Section ${editingItem.sections.length + 1}`,
                            notes: '',
                            scriptureOrChords: '',
                          },
                        ],
                      })
                    }
                    className="text-xs text-blue-600 dark:text-blue-400 font-medium"
                  >
                    + Add Section
                  </button>
                </div>

                {editingItem.sections.map((sec, sIdx) => (
                  <div
                    key={sec.id || sIdx}
                    className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={sec.heading}
                        onChange={(e) => {
                          const updated = [...editingItem.sections];
                          updated[sIdx].heading = e.target.value;
                          setEditingItem({ ...editingItem, sections: updated });
                        }}
                        placeholder="Section Heading (e.g. Point 1 / Verse 1)"
                        className="flex-1 px-2.5 py-1 text-xs rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none font-semibold"
                      />
                      <input
                        type="text"
                        value={sec.scriptureOrChords || ''}
                        onChange={(e) => {
                          const updated = [...editingItem.sections];
                          updated[sIdx].scriptureOrChords = e.target.value;
                          setEditingItem({ ...editingItem, sections: updated });
                        }}
                        placeholder="Passage or Chords"
                        className="w-1/3 px-2.5 py-1 text-xs rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = editingItem.sections.filter((_, i) => i !== sIdx);
                          setEditingItem({ ...editingItem, sections: updated });
                        }}
                        className="p-1 text-zinc-400 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={sec.notes}
                      onChange={(e) => {
                        const updated = [...editingItem.sections];
                        updated[sIdx].notes = e.target.value;
                        setEditingItem({ ...editingItem, sections: updated });
                      }}
                      placeholder="Expository observations, application points, or rehearsal notes..."
                      className="w-full p-2 text-xs rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none resize-none"
                    />
                  </div>
                ))}
              </div>

              {/* Action Items Editor */}
              <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center justify-between">
                  <span className="font-semibold uppercase text-zinc-500">
                    Checklist & Action Tasks
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingItem({
                        ...editingItem,
                        actionItems: [
                          ...editingItem.actionItems,
                          { id: `act-${Date.now()}`, text: '', completed: false },
                        ],
                      })
                    }
                    className="text-xs text-blue-600 dark:text-blue-400 font-medium"
                  >
                    + Add Task
                  </button>
                </div>

                {editingItem.actionItems.map((act, aIdx) => (
                  <div key={act.id || aIdx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={act.text}
                      onChange={(e) => {
                        const updated = [...editingItem.actionItems];
                        updated[aIdx].text = e.target.value;
                        setEditingItem({ ...editingItem, actionItems: updated });
                      }}
                      placeholder="e.g. Schedule rehearsal with vocalists"
                      className="flex-1 px-2.5 py-1 text-xs rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = editingItem.actionItems.filter((_, i) => i !== aIdx);
                        setEditingItem({ ...editingItem, actionItems: updated });
                      }}
                      className="text-zinc-400 hover:text-red-500 p-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-zinc-600 dark:text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Save Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
