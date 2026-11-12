import React, { useMemo } from 'react';
import {
  LineChart,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PieChart,
  BarChart2,
  Calendar,
  Layers
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { ProgressBar } from '../components/common/ProgressBar';

export const AnalyticsView: React.FC = () => {
  const { testAttempts, studySessions, subjects } = useAppState();

  // 1. Overall Test Statistics
  const { totalTests, avgScorePct, avgAccuracy, totalQuestionsAttempted, totalCorrect } = useMemo(() => {
    if (testAttempts.length === 0) {
      return { totalTests: 0, avgScorePct: 0, avgAccuracy: 0, totalQuestionsAttempted: 0, totalCorrect: 0 };
    }

    let sumScorePct = 0;
    let sumAcc = 0;
    let attempted = 0;
    let correct = 0;

    for (const a of testAttempts) {
      sumScorePct += (a.score / a.maxScore) * 100;
      sumAcc += a.accuracy;
      for (const ans of Object.values(a.answers)) {
        if (ans.status !== 'skipped') attempted++;
        if (ans.isCorrect) correct++;
      }
    }

    return {
      totalTests: testAttempts.length,
      avgScorePct: Math.round(sumScorePct / testAttempts.length),
      avgAccuracy: Math.round(sumAcc / testAttempts.length),
      totalQuestionsAttempted: attempted,
      totalCorrect: correct
    };
  }, [testAttempts]);

  // 2. Study Time per Subject
  const studyBySubject = useMemo(() => {
    const map: Record<string, number> = {};
    for (const sess of studySessions) {
      map[sess.subjectName] = (map[sess.subjectName] || 0) + sess.durationSeconds;
    }
    const totalSec = Object.values(map).reduce((a, b) => a + b, 0);

    return Object.entries(map).map(([name, sec]) => ({
      name,
      hours: (sec / 3600).toFixed(1),
      percentage: totalSec > 0 ? Math.round((sec / totalSec) * 100) : 0
    })).sort((a, b) => Number(b.hours) - Number(a.hours));
  }, [studySessions]);

  // 3. Needs Revision Topics
  const needsRevisionTopics = useMemo(() => {
    const list: Array<{ subjectName: string; topicName: string }> = [];
    for (const s of subjects) {
      for (const u of s.units) {
        for (const t of u.topics) {
          if (t.status === 'needs_revision') {
            list.push({ subjectName: s.name, topicName: t.name });
          }
        }
      }
    }
    return list;
  }, [subjects]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#11141c] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <LineChart className="text-blue-500" size={24} />
            <span>Preparation Performance & Diagnostics</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Data-backed insights derived from your test attempts, study timer sessions, and syllabus checklist.
          </p>
        </div>
      </div>

      {/* Top 3 Diagnostic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#11141c] border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Average Mock Score</span>
            <TrendingUp size={16} className="text-blue-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">
            {totalTests > 0 ? `${avgScorePct}%` : '—'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {totalTests > 0 ? `Computed across ${totalTests} completed mock exams` : 'No mock exams taken yet'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#11141c] border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Overall Accuracy</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">
            {totalQuestionsAttempted > 0 ? `${avgAccuracy}%` : '—'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {totalQuestionsAttempted > 0
              ? `${totalCorrect} correct of ${totalQuestionsAttempted} attempted questions`
              : 'No questions attempted yet'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#11141c] border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Revision Backlog</span>
            <AlertTriangle size={16} className="text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{needsRevisionTopics.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Topics flagged for immediate revision</p>
        </div>
      </div>

      {totalTests === 0 && studySessions.length === 0 && (
        <div className="p-5 rounded-2xl bg-blue-950/20 border border-blue-900/40 flex items-center gap-3">
          <LineChart size={20} className="text-blue-400 shrink-0" />
          <p className="text-xs text-blue-200">
            <strong>Ready for tracking:</strong> Diagnostic charts, score progressions, and study allocation percentages will automatically appear here as soon as you log focus sessions or submit practice tests.
          </p>
        </div>
      )}

      {/* Charts & Subject Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Time Allocation by Subject */}
        <div className="p-6 rounded-2xl bg-[#11141c] border border-slate-800">
          <h3 className="text-base font-bold text-white mb-1">Study Hours by Subject</h3>
          <p className="text-xs text-slate-400 mb-5">Where your deep work focus time is going</p>

          {studyBySubject.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No focus sessions recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {studyBySubject.map(item => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-200">{item.name}</span>
                    <span className="text-slate-400 font-mono">
                      {item.hours}h ({item.percentage}%)
                    </span>
                  </div>
                  <ProgressBar value={item.percentage} color="blue" height="sm" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revision Urgency Queue */}
        <div className="p-6 rounded-2xl bg-[#11141c] border border-slate-800">
          <h3 className="text-base font-bold text-white mb-1">Topics Needing Revision</h3>
          <p className="text-xs text-slate-400 mb-4">High-priority topics flagged during study or tests</p>

          {needsRevisionTopics.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              <CheckCircle2 size={28} className="text-emerald-500 mx-auto mb-2 opacity-80" />
              <p>No revision backlog! All completed topics are in order.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {needsRevisionTopics.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-white">{item.topicName}</span>
                  <span className="text-slate-400 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                    {item.subjectName}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
