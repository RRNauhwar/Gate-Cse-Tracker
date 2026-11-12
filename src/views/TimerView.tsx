import React, { useMemo } from 'react';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Clock,
  Sparkles,
  BookOpen,
  Coffee,
  CheckCircle2,
  Calendar,
  Flame
} from 'lucide-react';
import { useTimer } from '../context/TimerContext';
import { useAppState } from '../context/AppStateContext';
import { ProgressBar } from '../components/common/ProgressBar';

export const TimerView: React.FC = () => {
  const {
    isRunning,
    isPaused,
    elapsedSeconds,
    totalSeconds,
    mode,
    pomodoroPhase,
    selectedSubjectId,
    selectedTopicId,
    sessionNotes,
    setMode,
    setSelectedSubjectId,
    setSelectedTopicId,
    setSessionNotes,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer
  } = useTimer();

  const { subjects, studySessions, settings } = useAppState();

  // Find topics for the selected subject
  const currentSubject = subjects.find(s => s.id === selectedSubjectId);
  const availableTopics = currentSubject ? currentSubject.units.flatMap(u => u.topics) : [];

  // Format Elapsed Time: HH:MM:SS
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Today's logged study time
  const todaySeconds = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return studySessions
      .filter(s => s.timestamp.startsWith(today))
      .reduce((sum, s) => sum + s.durationSeconds, 0);
  }, [studySessions]);

  const targetHours = settings.dailyGoalHours || 4.5;
  const todayHours = (todaySeconds / 3600).toFixed(1);
  const goalPercent = Math.min(100, Math.round(((todaySeconds / 3600) / targetHours) * 100));

  // Pomodoro circular / linear progress
  const pomodoroProgress = mode === 'pomodoro' && totalSeconds > 0
    ? Math.min(100, (elapsedSeconds / totalSeconds) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="p-6 rounded-2xl bg-[#11141c] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Clock className="text-blue-500" size={24} />
            <span>Focus Study Timer & Pomodoro</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track uninterrupted deep work sessions and log study hours directly against syllabus subjects.
          </p>
        </div>

        {/* Daily Goal Badge */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4 w-full md:w-auto justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Flame size={14} className="text-amber-400" />
              <span>Today's Progress</span>
            </div>
            <p className="text-sm font-bold text-white mt-0.5">
              {todayHours}h <span className="text-xs text-slate-500 font-normal">/ {targetHours}h goal</span>
            </p>
          </div>
          <div className="w-24">
            <ProgressBar value={goalPercent} color="emerald" height="sm" />
          </div>
        </div>
      </div>

      {/* Main Timer Console */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#141824] to-[#0e111a] border border-slate-800 shadow-2xl text-center relative overflow-hidden">
        {/* Glow ambient background effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Mode Selector Tabs */}
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 mb-8 relative z-10">
          <button
            onClick={() => {
              if (!isRunning) setMode('stopwatch');
            }}
            disabled={isRunning}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
              mode === 'stopwatch'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'text-slate-400 hover:text-white disabled:opacity-50'
            }`}
          >
            Open Stopwatch
          </button>
          <button
            onClick={() => {
              if (!isRunning) setMode('pomodoro');
            }}
            disabled={isRunning}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
              mode === 'pomodoro'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'text-slate-400 hover:text-white disabled:opacity-50'
            }`}
          >
            Pomodoro (25/5)
          </button>
        </div>

        {/* Pomodoro Phase Pill */}
        {mode === 'pomodoro' && (
          <div className="flex justify-center mb-4">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                pomodoroPhase === 'work'
                  ? 'bg-blue-950/80 text-blue-400 border-blue-800'
                  : 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
              }`}
            >
              {pomodoroPhase === 'work' ? (
                <>
                  <Sparkles size={13} /> Focus Interval
                </>
              ) : (
                <>
                  <Coffee size={13} /> Break Time
                </>
              )}
            </span>
          </div>
        )}

        {/* Digital Clock Readout */}
        <div className="my-6 relative z-10">
          <span className="text-6xl sm:text-8xl font-mono font-extrabold text-white tracking-tighter drop-shadow-md">
            {formatTime(elapsedSeconds)}
          </span>
          {mode === 'pomodoro' && (
            <p className="text-xs text-slate-400 font-mono mt-2">
              Target: {formatTime(totalSeconds)}
            </p>
          )}
        </div>

        {/* Pomodoro Linear Progress */}
        {mode === 'pomodoro' && (
          <div className="max-w-md mx-auto mb-8 relative z-10">
            <ProgressBar value={pomodoroProgress} color="blue" height="sm" />
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 relative z-10">
          {!isRunning ? (
            <button
              onClick={startTimer}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Play size={20} fill="currentColor" />
              <span>Start Session</span>
            </button>
          ) : isPaused ? (
            <>
              <button
                onClick={resumeTimer}
                className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition"
              >
                <Play size={18} fill="currentColor" />
                <span>Resume</span>
              </button>
              <button
                onClick={stopTimer}
                className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition"
              >
                <Square size={18} fill="currentColor" />
                <span>Stop & Log</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={pauseTimer}
                className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-600/30 transition"
              >
                <Pause size={18} fill="currentColor" />
                <span>Pause</span>
              </button>
              <button
                onClick={stopTimer}
                className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition"
              >
                <Square size={18} fill="currentColor" />
                <span>Stop & Log</span>
              </button>
            </>
          )}

          {elapsedSeconds > 0 && !isRunning && (
            <button
              onClick={resetTimer}
              className="p-3.5 rounded-2xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              title="Reset Timer"
            >
              <RotateCcw size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Session Assignment Form */}
      <div className="p-6 rounded-2xl bg-[#11141c] border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <BookOpen size={18} className="text-blue-400" />
          <span>Assign Study Session</span>
        </h3>
        <p className="text-xs text-slate-400">
          Selected subject and topic will automatically be credited upon completing this session.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={e => {
                setSelectedSubjectId(e.target.value);
                setSelectedTopicId('');
              }}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Topic (Optional)</label>
            <select
              value={selectedTopicId}
              onChange={e => setSelectedTopicId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-blue-500"
            >
              <option value="">General Subject Practice</option>
              {availableTopics.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1.5">Session Reflection / Notes</label>
          <input
            type="text"
            value={sessionNotes}
            onChange={e => setSessionNotes(e.target.value)}
            placeholder="e.g. Solved 12 PYQs on Cache mapping and pipeline hazard stalls..."
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Session History Table */}
      <div className="p-6 rounded-2xl bg-[#11141c] border border-slate-800 w-full max-w-full overflow-hidden">
        <h3 className="text-base font-bold text-white mb-4">Logged Focus History</h3>
        {studySessions.length === 0 ? (
          <p className="text-xs text-slate-500 py-8 text-center">
            No study sessions recorded yet. Start the timer to log your first deep-work block!
          </p>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="pb-3">Subject & Topic</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Notes</th>
                  <th className="pb-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {studySessions.slice(0, 10).map(sess => (
                  <tr key={sess.id} className="text-xs hover:bg-slate-900/40 transition">
                    <td className="py-3 font-medium text-white">
                      {sess.subjectName}
                      {sess.topicName && (
                        <span className="block text-[11px] text-slate-400 font-normal">
                          {sess.topicName}
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className="capitalize px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold text-[10px]">
                        {sess.type}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-bold text-blue-400">
                      {Math.floor(sess.durationSeconds / 60)}m {sess.durationSeconds % 60}s
                    </td>
                    <td className="py-3 text-slate-400 italic max-w-xs truncate">
                      {sess.notes || '—'}
                    </td>
                    <td className="py-3 text-slate-500 text-right">
                      {new Date(sess.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
