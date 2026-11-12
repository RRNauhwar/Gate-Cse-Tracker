import React, { useState, useMemo } from 'react';
import {
  AlertOctagon,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  RotateCcw,
  Trash2,
  Check,
  Tag,
  BookOpen
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { MistakeRecord, MistakeCategory } from '../types';
import { MathRenderer } from '../components/common/MathRenderer';
import { Modal } from '../components/common/Modal';

const MISTAKE_CATEGORIES: MistakeCategory[] = [
  'Conceptual Gap',
  'Calculation Error',
  'Misread Question',
  'Formula Forgotten',
  'Time Management',
  'Guessing Error'
];

export const MistakeBookView: React.FC = () => {
  const { mistakes, subjects, addMistake, toggleMistakeResolved, deleteMistake } = useAppState();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [resolutionFilter, setResolutionFilter] = useState<'all' | 'unresolved' | 'resolved'>('all');

  // New Mistake Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formQuestion, setFormQuestion] = useState('');
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || '');
  const [formTopicName, setFormTopicName] = useState('');
  const [formMyAnswer, setFormMyAnswer] = useState('');
  const [formCorrectAnswer, setFormCorrectAnswer] = useState('');
  const [formExplanation, setFormExplanation] = useState('');
  const [formCategory, setFormCategory] = useState<MistakeCategory>('Conceptual Gap');

  const openNewModal = () => {
    setFormQuestion('');
    setFormSubjectId(subjects[0]?.id || '');
    setFormTopicName('');
    setFormMyAnswer('');
    setFormCorrectAnswer('');
    setFormExplanation('');
    setFormCategory('Conceptual Gap');
    setIsModalOpen(true);
  };

  const handleSaveMistake = () => {
    if (!formQuestion.trim()) return;
    const subject = subjects.find(s => s.id === formSubjectId);

    addMistake({
      questionText: formQuestion.trim(),
      subjectId: formSubjectId,
      subjectName: subject?.name || 'General',
      topicName: formTopicName.trim() || 'General Topic',
      myAnswer: formMyAnswer.trim(),
      correctAnswer: formCorrectAnswer.trim(),
      explanation: formExplanation.trim(),
      category: formCategory,
      resolved: false
    });

    setIsModalOpen(false);
  };

  const filteredMistakes = useMemo(() => {
    return mistakes.filter(m => {
      const matchesSubject = selectedSubject === 'all' || m.subjectId === selectedSubject;
      const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
      const matchesResolution =
        resolutionFilter === 'all' ||
        (resolutionFilter === 'resolved' && m.resolved) ||
        (resolutionFilter === 'unresolved' && !m.resolved);
      const matchesQuery =
        m.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.topicName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSubject && matchesCategory && matchesResolution && matchesQuery;
    });
  }, [mistakes, selectedSubject, selectedCategory, resolutionFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#11141c] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <AlertOctagon className="text-amber-500" size={24} />
            <span>Mistake Book & Error Analysis</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Categorize and systematically resolve every question answered incorrectly during mock tests.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 transition shrink-0"
        >
          <Plus size={16} />
          <span>Log New Mistake</span>
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
            placeholder="Search questions, topics, or explanations..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 outline-none focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {MISTAKE_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={resolutionFilter}
            onChange={e => setResolutionFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 outline-none focus:border-blue-500"
          >
            <option value="all">All States</option>
            <option value="unresolved">Unresolved Only</option>
            <option value="resolved">Resolved Only</option>
          </select>
        </div>
      </div>

      {/* Mistakes List */}
      {mistakes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#11141c] border border-slate-800 text-slate-400 text-xs space-y-3">
          <AlertOctagon size={32} className="mx-auto text-amber-500/60 mb-2" />
          <p className="font-semibold text-slate-300 text-sm">Mistake Book is Clean</p>
          <p className="max-w-md mx-auto text-slate-500">
            No mistakes recorded yet. As you solve test questions or practice problems, log incorrect questions here to review and eliminate gaps.
          </p>
          <button
            onClick={openNewModal}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-md shadow-amber-600/20"
          >
            <Plus size={14} /> Log a Tricky Problem
          </button>
        </div>
      ) : filteredMistakes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#11141c] border border-slate-800 text-slate-500 text-xs">
          No mistakes recorded matching your filters.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMistakes.map(mistake => (
            <div
              key={mistake.id}
              className={`p-6 rounded-2xl border transition ${
                mistake.resolved
                  ? 'bg-slate-900/40 border-slate-800/80 opacity-70'
                  : 'bg-[#11141c] border-slate-800 shadow-md'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                      {mistake.subjectName}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      • {mistake.topicName}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/60">
                      {mistake.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-relaxed">
                    {mistake.questionText}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleMistakeResolved(mistake.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      mistake.resolved
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800 hover:bg-emerald-900/60'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <CheckCircle2 size={15} />
                    <span>{mistake.resolved ? 'Resolved' : 'Mark Fixed'}</span>
                  </button>
                  <button
                    onClick={() => deleteMistake(mistake.id)}
                    className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                    title="Delete mistake"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Answers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs font-mono">
                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-300">
                  <span className="font-bold text-[10px] uppercase block mb-1 text-rose-400">My Answer:</span>
                  <span>{mistake.myAnswer || 'Left blank'}</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-emerald-300">
                  <span className="font-bold text-[10px] uppercase block mb-1 text-emerald-400">Verified Correct Answer:</span>
                  <span>{mistake.correctAnswer}</span>
                </div>
              </div>

              {/* Explanation */}
              {mistake.explanation && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 text-xs text-slate-300 leading-relaxed font-mono">
                  <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">
                    Analysis & Resolution:
                  </span>
                  <MathRenderer content={mistake.explanation} />
                </div>
              )}

              <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                <span>Added: {mistake.dateAdded}</span>
                {mistake.lastReviewedAt && <span>Last Reviewed: {mistake.lastReviewedAt}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Mistake Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log a Mistake / Difficult Question"
        maxWidth="xl"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Question / Problem Statement</label>
            <textarea
              value={formQuestion}
              onChange={e => setFormQuestion(e.target.value)}
              rows={3}
              placeholder="Paste or write the question that tripped you up..."
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Subject</label>
              <select
                value={formSubjectId}
                onChange={e => setFormSubjectId(e.target.value)}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-blue-500"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Topic Name</label>
              <input
                type="text"
                value={formTopicName}
                onChange={e => setFormTopicName(e.target.value)}
                placeholder="e.g. Master Theorem"
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Mistake Category</label>
              <select
                value={formCategory}
                onChange={e => setFormCategory(e.target.value as MistakeCategory)}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-blue-500"
              >
                {MISTAKE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-rose-400 block mb-1">My Attempted Answer</label>
              <input
                type="text"
                value={formMyAnswer}
                onChange={e => setFormMyAnswer(e.target.value)}
                placeholder="What did you choose / calculate?"
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-emerald-400 block mb-1">Verified Correct Answer</label>
              <input
                type="text"
                value={formCorrectAnswer}
                onChange={e => setFormCorrectAnswer(e.target.value)}
                placeholder="What was the actual answer?"
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Why did you make this mistake? (Detailed Explanation)
            </label>
            <textarea
              value={formExplanation}
              onChange={e => setFormExplanation(e.target.value)}
              rows={4}
              placeholder="e.g. Forgot that Coffman conditions require non-preemption rather than preemption..."
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveMistake}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30"
            >
              Save to Mistake Book
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
