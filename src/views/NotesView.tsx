import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Pin,
  Trash2,
  Edit2,
  Tag,
  BookOpen,
  Sparkles,
  Check
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { Note } from '../types';
import { MathRenderer } from '../components/common/MathRenderer';
import { Modal } from '../components/common/Modal';

export const NotesView: React.FC = () => {
  const { notes, subjects, addNote, updateNote, deleteNote } = useAppState();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [showFormulaOnly, setShowFormulaOnly] = useState<boolean>(false);

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || '');
  const [formTopicName, setFormTopicName] = useState('');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formIsFormula, setFormIsFormula] = useState(false);
  const [formTagsString, setFormTagsString] = useState('');

  const openNewNoteModal = () => {
    setEditingNoteId(null);
    setFormTitle('');
    setFormContent('');
    setFormSubjectId(subjects[0]?.id || '');
    setFormTopicName('');
    setFormIsPinned(false);
    setFormIsFormula(false);
    setFormTagsString('#high-yield');
    setIsEditorOpen(true);
  };

  const openEditModal = (note: Note) => {
    setEditingNoteId(note.id);
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormSubjectId(note.subjectId);
    setFormTopicName(note.topicName || '');
    setFormIsPinned(note.isPinned);
    setFormIsFormula(note.isFormula);
    setFormTagsString(note.tags.join(' '));
    setIsEditorOpen(true);
  };

  const handleSaveNote = () => {
    if (!formTitle.trim()) return;
    const subject = subjects.find(s => s.id === formSubjectId);
    const tags = formTagsString.split(/\s+/).filter(t => t.startsWith('#'));

    if (editingNoteId) {
      updateNote(editingNoteId, {
        title: formTitle.trim(),
        content: formContent.trim(),
        subjectId: formSubjectId,
        subjectName: subject?.name || 'General',
        topicName: formTopicName.trim() || undefined,
        isPinned: formIsPinned,
        isFormula: formIsFormula,
        tags
      });
    } else {
      addNote({
        title: formTitle.trim(),
        content: formContent.trim(),
        subjectId: formSubjectId,
        subjectName: subject?.name || 'General',
        topicName: formTopicName.trim() || undefined,
        isPinned: formIsPinned,
        isFormula: formIsFormula,
        tags
      });
    }

    setIsEditorOpen(false);
  };

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter(n => {
        const matchesSubject = selectedSubject === 'all' || n.subjectId === selectedSubject;
        const matchesFormula = !showFormulaOnly || n.isFormula;
        const matchesQuery =
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSubject && matchesFormula && matchesQuery;
      })
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [notes, selectedSubject, showFormulaOnly, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#11141c] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="text-blue-500" size={24} />
            <span>Notes & Formula Book</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Maintain high-yield revision cards, formulas with LaTeX math, and shortcut tricks.
          </p>
        </div>

        <button
          onClick={openNewNoteModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 transition shrink-0"
        >
          <Plus size={16} />
          <span>New Note / Formula</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#11141c] border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search notes, formulas, or tags (e.g. #divide-conquer)..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 outline-none focus:border-blue-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowFormulaOnly(prev => !prev)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              showFormulaOnly
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Formulas Only
          </button>
        </div>
      </div>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#11141c] border border-slate-800 text-slate-400 text-xs space-y-3">
          <BookOpen size={32} className="mx-auto text-slate-600 mb-2" />
          <p className="font-semibold text-slate-300 text-sm">Your Formula Book & Notes are Empty</p>
          <p className="max-w-md mx-auto text-slate-500">
            Jot down high-yield formulas, key theorems, and revision summaries with live LaTeX math rendering.
          </p>
          <button
            onClick={openNewNoteModal}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/20"
          >
            <Plus size={14} /> Create First Note / Formula
          </button>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#11141c] border border-slate-800 text-slate-500 text-xs">
          No notes or formulas match your filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              className={`p-6 rounded-2xl border transition flex flex-col justify-between ${
                note.isPinned
                  ? 'bg-slate-900/90 border-blue-600/40 shadow-md shadow-blue-950/40'
                  : 'bg-[#11141c] border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                        {note.subjectName}
                      </span>
                      {note.topicName && (
                        <span className="text-[11px] text-slate-400 font-medium">
                          • {note.topicName}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white leading-snug">{note.title}</h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => updateNote(note.id, { isPinned: !note.isPinned })}
                      className={`p-1.5 rounded-lg transition ${
                        note.isPinned ? 'text-blue-400 hover:text-blue-300' : 'text-slate-600 hover:text-slate-400'
                      }`}
                      title={note.isPinned ? 'Unpin' : 'Pin to top'}
                    >
                      <Pin size={16} />
                    </button>
                    <button
                      onClick={() => openEditModal(note)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
                      title="Edit note"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition"
                      title="Delete note"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Content with KaTeX Math Rendering */}
                <div className="my-4 text-xs">
                  <MathRenderer content={note.content} />
                </div>
              </div>

              {/* Tags & Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
                <div className="flex flex-wrap items-center gap-1.5">
                  {note.isFormula && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-400 border border-purple-800/60 font-semibold">
                      Formula
                    </span>
                  )}
                  {note.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-full bg-slate-800/70 text-slate-400 border border-slate-700/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note Editor Modal */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingNoteId ? 'Edit Note / Formula' : 'Create Note or Formula Card'}
        maxWidth="xl"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Title</label>
            <input
              type="text"
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              placeholder="e.g. Master Theorem for Divide and Conquer"
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Subject</label>
              <select
                value={formSubjectId}
                onChange={e => setFormSubjectId(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-blue-500"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Topic Name (Optional)</label>
              <input
                type="text"
                value={formTopicName}
                onChange={e => setFormTopicName(e.target.value)}
                placeholder="e.g. Graph Theory"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Content (Supports Markdown & LaTeX formulas like <code className="text-blue-400">$...$</code> and <code className="text-blue-400">$$...$$</code>)
            </label>
            <textarea
              value={formContent}
              onChange={e => setFormContent(e.target.value)}
              rows={8}
              placeholder="Write formulas, proofs, and tricks here..."
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Tags (Space-separated with #)</label>
              <input
                type="text"
                value={formTagsString}
                onChange={e => setFormTagsString(e.target.value)}
                placeholder="#formula #pyq-trick"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-6 pt-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
                <input
                  type="checkbox"
                  checked={formIsFormula}
                  onChange={e => setFormIsFormula(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-blue-600"
                />
                Formula Card
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
                <input
                  type="checkbox"
                  checked={formIsPinned}
                  onChange={e => setFormIsPinned(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-blue-600"
                />
                Pin to Top
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => setIsEditorOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNote}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30"
            >
              Save Note
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
