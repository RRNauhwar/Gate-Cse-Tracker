import React from 'react';
import {
  ListChecks,
  Clock,
  BarChart3,
  Flame,
  TrendingUp,
  AlertOctagon,
  Calendar,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Sparkles,
  Play
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { subjects, studySessions, testAttempts, plannerTasks, mistakes, settings } = useAppState();

  // 1. Calculate Syllabus Statistics
  const { totalTopics, completedTopics, inProgressTopics, syllabusPercentage } = React.useMemo(() => {
    let total = 0;
    let completed = 0;
    let inProgress = 0;
    for (const sub of subjects) {
      for (const u of sub.units) {
        for (const t of u.topics) {
          total++;
          if (t.status === 'completed') completed++;
          if (t.status === 'in_progress') inProgress++;
        }
      }
    }
    const pct = total > 0 ? (completed / total) * 100 : 0;
    return {
      totalTopics: total,
      completedTopics: completed,
      inProgressTopics: inProgress,
      syllabusPercentage: Math.round(pct)
    };
  }, [subjects]);

  // 2. Study Time Statistics
  const { todayStudySeconds, totalStudyHours } = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    let todaySec = 0;
    let totalSec = 0;

    for (const s of studySessions) {
      totalSec += s.durationSeconds;
      if (s.timestamp.startsWith(today)) {
        todaySec += s.durationSeconds;
      }
    }

    return {
      todayStudySeconds: todaySec,
      totalStudyHours: (totalSec / 3600).toFixed(1)
    };
  }, [studySessions]);

  const todayHours = (todayStudySeconds / 3600).toFixed(1);
  const dailyTargetHours = settings.dailyGoalHours || 4.5;
  const dailyGoalPct = Math.min(100, Math.round(((todayStudySeconds / 3600) / dailyTargetHours) * 100));

  // 3. Test Series Averages
  const { averageScore, averageAccuracy, recentAttempt } = React.useMemo(() => {
    if (testAttempts.length === 0) {
      return { averageScore: 0, averageAccuracy: 0, recentAttempt: null };
    }
    const totalAcc = testAttempts.reduce((sum, a) => sum + a.accuracy, 0);
    return {
      averageScore: (testAttempts.reduce((sum, a) => sum + (a.score / a.maxScore) * 100, 0) / testAttempts.length).toFixed(0),
      averageAccuracy: Math.round(totalAcc / testAttempts.length),
      recentAttempt: testAttempts[0]
    };
  }, [testAttempts]);

  // 4. Pending Tasks Today
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = plannerTasks.filter(t => t.date === todayStr);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/30 via-slate-900 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              GATE {settings.targetExamYear} Aspirant
            </span>
            <span className="text-xs text-slate-500">Personal Mission Control</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {settings.userName || 'Aspirant'}
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Track topics, log focused deep-work hours, practice CBT questions, and review mistakes with zero distractions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('timer')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition"
          >
            <Play size={16} />
            <span>Start Focus Session</span>
          </button>
          <button
            onClick={() => onNavigate('tests')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition"
          >
            <BarChart3 size={16} />
            <span>Mock Tests</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Syllabus Progress */}
        <div
          onClick={() => onNavigate('syllabus')}
          className="p-5 rounded-2xl bg-[#11141c] border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Syllabus Covered</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
              <ListChecks size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-white">{syllabusPercentage}%</span>
            <span className="text-xs text-slate-400 font-medium">
              ({completedTopics}/{totalTopics} topics)
            </span>
          </div>
          <ProgressBar value={syllabusPercentage} color="blue" height="sm" />
          <div className="flex justify-between items-center mt-2.5 text-[11px] text-slate-500">
            <span>{inProgressTopics} in progress</span>
            <span className="text-blue-400 font-medium flex items-center gap-1 group-hover:underline">
              View syllabus <ArrowRight size={12} />
            </span>
          </div>
        </div>

        {/* Card 2: Today's Study Goal */}
        <div
          onClick={() => onNavigate('timer')}
          className="p-5 rounded-2xl bg-[#11141c] border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Today's Focus Time</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <Clock size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-white">{todayHours}h</span>
            <span className="text-xs text-slate-400 font-medium">/ {dailyTargetHours}h goal</span>
          </div>
          <ProgressBar value={dailyGoalPct} color="emerald" height="sm" />
          <div className="flex justify-between items-center mt-2.5 text-[11px] text-slate-500">
            <span>Total: {totalStudyHours}h all-time</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1 group-hover:underline">
              {dailyGoalPct >= 100 ? 'Goal met! 🎉' : `${Math.max(0, parseFloat((dailyTargetHours - Number(todayHours)).toFixed(1)))}h remaining`}
            </span>
          </div>
        </div>

        {/* Card 3: Test Accuracy */}
        <div
          onClick={() => onNavigate('analytics')}
          className="p-5 rounded-2xl bg-[#11141c] border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Mock Accuracy</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-white">
              {testAttempts.length > 0 ? `${averageAccuracy}%` : '—'}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ({testAttempts.length} test{testAttempts.length === 1 ? '' : 's'})
            </span>
          </div>
          <ProgressBar value={testAttempts.length > 0 ? averageAccuracy : 0} color="purple" height="sm" />
          <div className="flex justify-between items-center mt-2.5 text-[11px] text-slate-500">
            <span>{testAttempts.length > 0 ? `Avg score: ${averageScore}%` : 'No tests taken yet'}</span>
            <span className="text-purple-400 font-medium flex items-center gap-1 group-hover:underline">
              Analytics <ArrowRight size={12} />
            </span>
          </div>
        </div>

        {/* Card 4: Mistake Book */}
        <div
          onClick={() => onNavigate('mistakes')}
          className="p-5 rounded-2xl bg-[#11141c] border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Unresolved Mistakes</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <AlertOctagon size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-white">
              {mistakes.filter(m => !m.resolved).length}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              / {mistakes.length} total logged
            </span>
          </div>
          <ProgressBar
            value={mistakes.length > 0 ? (mistakes.filter(m => m.resolved).length / mistakes.length) * 100 : 0}
            color="amber"
            height="sm"
          />
          <div className="flex justify-between items-center mt-2.5 text-[11px] text-slate-500">
            <span>{mistakes.filter(m => m.resolved).length} reviewed & fixed</span>
            <span className="text-amber-400 font-medium flex items-center gap-1 group-hover:underline">
              Error log <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </div>

      {/* Middle Row: Subject Mastery & Today's Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Progress Overview */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#11141c] border border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-white">Subject-wise Syllabus Progress</h3>
              <p className="text-xs text-slate-400">Breakdown of topics completed across core subjects</p>
            </div>
            <button
              onClick={() => onNavigate('syllabus')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              All Subjects <ArrowRight size={13} />
            </button>
          </div>

          <div className="space-y-4">
            {subjects.slice(0, 5).map(sub => {
              const subTopics = sub.units.flatMap(u => u.topics);
              const done = subTopics.filter(t => t.status === 'completed').length;
              const inProg = subTopics.filter(t => t.status === 'in_progress').length;
              const pct = subTopics.length > 0 ? Math.round((done / subTopics.length) * 100) : 0;

              return (
                <div key={sub.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-semibold text-slate-200">{sub.name}</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-400">{done}/{subTopics.length} done</span>
                      <span className="font-bold text-blue-400">{pct}%</span>
                    </div>
                  </div>
                  <ProgressBar value={pct} color="blue" height="sm" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Planner Tasks */}
        <div className="p-6 rounded-2xl bg-[#11141c] border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Today's Study Plan</h3>
                <p className="text-xs text-slate-400">
                  {todayTasks.filter(t => t.completed).length}/{todayTasks.length} completed
                </p>
              </div>
              <button
                onClick={() => onNavigate('planner')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
              >
                Planner
              </button>
            </div>

            {todayTasks.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No tasks planned for today yet.
                <button
                  onClick={() => onNavigate('planner')}
                  className="block mx-auto mt-2 text-blue-400 hover:underline font-medium"
                >
                  + Add today's goals
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayTasks.slice(0, 4).map(task => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border transition ${
                      task.completed
                        ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2
                        size={17}
                        className={`mt-0.5 shrink-0 ${task.completed ? 'text-emerald-500' : 'text-slate-600'}`}
                      />
                      <div className="min-w-0">
                        <p className={`text-xs font-medium leading-snug ${task.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                          {task.title}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {task.subjectName} • {task.durationMinutes}m
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('planner')}
            className="w-full mt-4 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-medium transition"
          >
            Manage Study Schedule
          </button>
        </div>
      </div>

      {/* Bottom Row: Recent Study Sessions & Recent Mock Test */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Study Sessions */}
        <div className="p-6 rounded-2xl bg-[#11141c] border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Recent Focus Sessions</h3>
            <button
              onClick={() => onNavigate('timer')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              View Timer
            </button>
          </div>

          {studySessions.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No focus sessions recorded yet.</p>
          ) : (
            <div className="space-y-2.5">
              {studySessions.slice(0, 3).map(sess => (
                <div
                  key={sess.id}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-white">{sess.subjectName}</p>
                    <p className="text-[11px] text-slate-400">{sess.topicName || 'General Topic'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-blue-400">
                      {Math.floor(sess.durationSeconds / 60)} mins
                    </span>
                    <p className="text-[10px] text-slate-500">
                      {new Date(sess.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Test Score */}
        <div className="p-6 rounded-2xl bg-[#11141c] border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Latest Mock Test Result</h3>
            <button
              onClick={() => onNavigate('tests')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              Test Center
            </button>
          </div>

          {recentAttempt ? (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div>
                <p className="text-sm font-bold text-white">{recentAttempt.testTitle}</p>
                <p className="text-xs text-slate-400">
                  Submitted {new Date(recentAttempt.submittedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Score</p>
                  <p className="text-base font-extrabold text-blue-400">
                    {recentAttempt.score} / {recentAttempt.maxScore}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Accuracy</p>
                  <p className="text-base font-extrabold text-emerald-400">{recentAttempt.accuracy}%</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Attempted</p>
                  <p className="text-base font-extrabold text-slate-200">
                    {Object.keys(recentAttempt.answers).length} Qs
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-xs">
              No tests submitted yet. Take your first mini mock to view detailed analytics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
