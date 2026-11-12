import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Circle,
  Plus,
  ChevronDown,
  ChevronRight,
  FileText,
  BookOpen
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { TopicStatus, Subject } from '../types';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const SyllabusView: React.FC = () => {
  const { subjects, updateTopicStatus, updateTopicNotes, addTopic } = useAppState();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});

  // Active modal for topic notes editing
  const [activeNotesTopic, setActiveNotesTopic] = useState<{
    subjectId: string;
    topicId: string;
    topicName: string;
    notes: string;
  } | null>(null);

  // New topic modal
  const [newTopicModal, setNewTopicModal] = useState<{
    subjectId: string;
    unitId: string;
  } | null>(null);
  const [newTopicName, setNewTopicName] = useState('');

  // Expand / collapse unit toggle
  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  // Filtered Subjects and Topics
  const filteredSubjects = useMemo(() => {
    return subjects
      .filter(s => selectedSubjectId === 'all' || s.id === selectedSubjectId)
      .map(s => {
        const units = s.units.map(u => {
          const topics = u.topics.filter(t => {
            const matchesQuery =
              t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              u.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
            return matchesQuery && matchesStatus;
          });
          return { ...u, topics };
        }).filter(u => u.topics.length > 0 || !searchQuery);

        return { ...s, units };
      }).filter(s => s.units.some(u => u.topics.length > 0) || !searchQuery);
  }, [subjects, selectedSubjectId, statusFilter, searchQuery]);

  // Overall statistics
  const { total, completed, inProgress, needsRevision } = useMemo(() => {
    let tot = 0, comp = 0, inProg = 0, rev = 0;
    for (const s of subjects) {
      for (const u of s.units) {
        for (const t of u.topics) {
          tot++;
          if (t.status === 'completed') comp++;
          if (t.status === 'in_progress') inProg++;
          if (t.status === 'needs_revision') rev++;
        }
      }
    }
    return { total: tot, completed: comp, inProgress: inProg, needsRevision: rev };
  }, [subjects]);

  const handleSaveNotes = () => {
    if (!activeNotesTopic) return;
    updateTopicNotes(activeNotesTopic.subjectId, activeNotesTopic.topicId, activeNotesTopic.notes);
    setActiveNotesTopic(null);
  };

  const handleCreateTopic = () => {
    if (!newTopicModal || !newTopicName.trim()) return;
    addTopic(newTopicModal.subjectId, newTopicModal.unitId, newTopicName.trim());
    setNewTopicName('');
    setNewTopicModal(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Overall Progress */}
      <div className="p-6 rounded-2xl bg-[#11141c] border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="text-blue-500" size={24} />
            <span>Official GATE CS Syllabus Tracker</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete hierarchical topic tree with status transitions, revision tracking, and personal notes.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right">
            <span className="text-2xl font-extrabold text-white">
              {total > 0 ? Math.round((completed / total) * 100) : 0}%
            </span>
            <p className="text-xs text-slate-400">{completed} of {total} topics completed</p>
          </div>
          <div className="w-32">
            <ProgressBar value={total > 0 ? (completed / total) * 100 : 0} color="blue" height="md" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-[#11141c] border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search topics (e.g. Master Theorem, K-Map, Paging)..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
          />
        </div>

        {/* Subject Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 outline-none focus:border-blue-500"
          >
            <option value="all">All Subjects ({subjects.length})</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="needs_revision">Needs Revision</option>
          </select>
        </div>
      </div>

      {/* Subject Tree Accordions */}
      <div className="space-y-4">
        {filteredSubjects.map(sub => {
          const allTopics = sub.units.flatMap(u => u.topics);
          const done = allTopics.filter(t => t.status === 'completed').length;
          const pct = allTopics.length > 0 ? Math.round((done / allTopics.length) * 100) : 0;

          return (
            <div key={sub.id} className="rounded-2xl bg-[#11141c] border border-slate-800 overflow-hidden">
              {/* Subject Header */}
              <div className="p-4 sm:p-5 bg-slate-900/50 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
                    {sub.code}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight">{sub.name}</h2>
                    <p className="text-xs text-slate-400">
                      {sub.units.length} Units • {allTopics.length} Topics
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-28 hidden sm:block">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Covered</span>
                      <span className="font-bold text-white">{pct}%</span>
                    </div>
                    <ProgressBar value={pct} color="blue" height="sm" />
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {done}/{allTopics.length} done
                  </span>
                </div>
              </div>

              {/* Units & Topics */}
              <div className="divide-y divide-slate-800/60">
                {sub.units.map(unit => {
                  const isExpanded = expandedUnits[unit.id] !== false; // Default expanded
                  const unitTopics = unit.topics;
                  const unitDone = unitTopics.filter(t => t.status === 'completed').length;

                  return (
                    <div key={unit.id} className="p-4">
                      {/* Unit Title Bar */}
                      <div
                        onClick={() => toggleUnit(unit.id)}
                        className="flex items-center justify-between cursor-pointer select-none group py-1"
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown size={16} className="text-slate-400" />
                          ) : (
                            <ChevronRight size={16} className="text-slate-400" />
                          )}
                          <span className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition">
                            {unit.name}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            ({unitDone}/{unitTopics.length})
                          </span>
                        </div>

                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setNewTopicModal({ subjectId: sub.id, unitId: unit.id });
                          }}
                          className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <Plus size={13} /> Add Topic
                        </button>
                      </div>

                      {/* Topic Rows */}
                      {isExpanded && (
                        <div className="mt-3 pl-6 space-y-2">
                          {unitTopics.map(topic => (
                            <div
                              key={topic.id}
                              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/70 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {topic.status === 'completed' ? (
                                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                                ) : topic.status === 'in_progress' ? (
                                  <Clock size={18} className="text-blue-400 shrink-0" />
                                ) : topic.status === 'needs_revision' ? (
                                  <AlertTriangle size={18} className="text-amber-400 shrink-0" />
                                ) : (
                                  <Circle size={18} className="text-slate-600 shrink-0" />
                                )}

                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-slate-200 truncate">
                                    {topic.name}
                                  </p>
                                  {topic.notes && (
                                    <p className="text-xs text-slate-400 italic truncate max-w-md">
                                      Note: {topic.notes}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {/* Weightage indicator */}
                                {topic.weightage === 'high' && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-950/60 text-rose-400 border border-rose-900/60">
                                    High Yield
                                  </span>
                                )}

                                {/* Notes button */}
                                <button
                                  onClick={() =>
                                    setActiveNotesTopic({
                                      subjectId: sub.id,
                                      topicId: topic.id,
                                      topicName: topic.name,
                                      notes: topic.notes || ''
                                    })
                                  }
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                  title="Add/Edit Topic Notes"
                                >
                                  <FileText size={15} />
                                </button>

                                {/* Status Selector */}
                                <select
                                  value={topic.status}
                                  onChange={e =>
                                    updateTopicStatus(sub.id, topic.id, e.target.value as TopicStatus)
                                  }
                                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border outline-none cursor-pointer ${
                                    topic.status === 'completed'
                                      ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800'
                                      : topic.status === 'in_progress'
                                      ? 'bg-blue-950/70 text-blue-400 border-blue-800'
                                      : topic.status === 'needs_revision'
                                      ? 'bg-amber-950/70 text-amber-400 border-amber-800'
                                      : 'bg-slate-900 text-slate-400 border-slate-700'
                                  }`}
                                >
                                  <option value="not_started">Not Started</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="completed">Completed</option>
                                  <option value="needs_revision">Needs Revision</option>
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Topic Notes Modal */}
      <Modal
        isOpen={!!activeNotesTopic}
        onClose={() => setActiveNotesTopic(null)}
        title={`Notes: ${activeNotesTopic?.topicName || ''}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Write formula reminders, important exceptions, or references for this topic.
          </p>
          <textarea
            value={activeNotesTopic?.notes || ''}
            onChange={e =>
              setActiveNotesTopic(prev => (prev ? { ...prev, notes: e.target.value } : null))
            }
            rows={5}
            placeholder="E.g. Remember Master Theorem fails when f(n) = n / log n..."
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setActiveNotesTopic(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNotes}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30"
            >
              Save Note
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Topic Modal */}
      <Modal
        isOpen={!!newTopicModal}
        onClose={() => setNewTopicModal(null)}
        title="Add New Topic"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Topic Name</label>
            <input
              type="text"
              value={newTopicName}
              onChange={e => setNewTopicName(e.target.value)}
              placeholder="e.g. Master Theorem Case 3 Regularity"
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setNewTopicModal(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTopic}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white"
            >
              Add to Syllabus
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
