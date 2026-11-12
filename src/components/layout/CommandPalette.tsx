import React, { useState, useEffect, useMemo } from 'react';
import { Search, BookOpen, Clock, FileText, AlertTriangle, Calendar, X } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (viewId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const { subjects, notes, mistakes, plannerTasks } = useAppState();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search Results
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const matches: Array<{
      id: string;
      title: string;
      subtitle: string;
      category: 'Topic' | 'Note' | 'Mistake' | 'Task';
      view: string;
    }> = [];

    // 1. Search Topics
    for (const sub of subjects) {
      for (const unit of sub.units) {
        for (const topic of unit.topics) {
          if (topic.name.toLowerCase().includes(q) || sub.name.toLowerCase().includes(q)) {
            matches.push({
              id: topic.id,
              title: topic.name,
              subtitle: `${sub.name} • ${topic.status.replace('_', ' ')}`,
              category: 'Topic',
              view: 'syllabus'
            });
          }
        }
      }
    }

    // 2. Search Notes
    for (const note of notes) {
      if (note.title.toLowerCase().includes(q) || note.content.toLowerCase().includes(q)) {
        matches.push({
          id: note.id,
          title: note.title,
          subtitle: `${note.subjectName} • ${note.isFormula ? 'Formula' : 'Note'}`,
          category: 'Note',
          view: 'notes'
        });
      }
    }

    // 3. Search Mistakes
    for (const mis of mistakes) {
      if (mis.questionText.toLowerCase().includes(q) || mis.explanation.toLowerCase().includes(q)) {
        matches.push({
          id: mis.id,
          title: mis.questionText.slice(0, 60) + '...',
          subtitle: `${mis.subjectName} • ${mis.category}`,
          category: 'Mistake',
          view: 'mistakes'
        });
      }
    }

    // 4. Search Tasks
    for (const task of plannerTasks) {
      if (task.title.toLowerCase().includes(q)) {
        matches.push({
          id: task.id,
          title: task.title,
          subtitle: `Planner • Due ${task.date}`,
          category: 'Task',
          view: 'planner'
        });
      }
    }

    return matches.slice(0, 8);
  }, [query, subjects, notes, mistakes, plannerTasks]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Palette box */}
      <div className="relative w-full max-w-xl bg-[#11141c] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800">
          <Search className="text-slate-400 mr-3" size={20} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search syllabus topics, notes, formulas, mistakes, tasks..."
            className="w-full bg-transparent text-white placeholder-slate-500 text-sm outline-none"
            autoFocus
          />
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        {/* Results list */}
        <div className="p-2 max-h-96 overflow-y-auto">
          {query.trim() === '' ? (
            <div className="p-6 text-center text-sm text-slate-500">
              Type to search across your GATE syllabus, notes, formulas, and planner tasks.
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              No matching records found for "{query}".
            </div>
          ) : (
            results.map(r => (
              <button
                key={r.id}
                onClick={() => {
                  onNavigate(r.view);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/70 transition text-left group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-slate-800/80 text-blue-400 group-hover:bg-blue-600/20 group-hover:text-blue-300">
                    {r.category === 'Topic' && <BookOpen size={16} />}
                    {r.category === 'Note' && <FileText size={16} />}
                    {r.category === 'Mistake' && <AlertTriangle size={16} />}
                    {r.category === 'Task' && <Calendar size={16} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{r.title}</p>
                    <p className="text-xs text-slate-400 truncate">{r.subtitle}</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full ml-3">
                  {r.category}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
