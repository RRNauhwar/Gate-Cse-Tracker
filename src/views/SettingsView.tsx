import React, { useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Database,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  ShieldCheck
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportDataJSON,
    importDataJSON,
    resetAllData,
    loadSampleSeedData,
    subjects,
    studySessions,
    testAttempts,
    notes,
    mistakes,
    plannerTasks
  } = useAppState();

  const [userName, setUserName] = useState(settings.userName);
  const [dailyGoalHours, setDailyGoalHours] = useState(String(settings.dailyGoalHours));
  const [examDate, setExamDate] = useState(settings.examDate);
  const [targetYear, setTargetYear] = useState(String(settings.targetExamYear));
  const [pomodoroWork, setPomodoroWork] = useState(String(settings.pomodoroWorkMinutes));
  const [pomodoroBreak, setPomodoroBreak] = useState(String(settings.pomodoroBreakMinutes));
  const [saveMessage, setSaveMessage] = useState('');

  const handleSavePreferences = () => {
    updateSettings({
      userName: userName.trim() || 'Aspirant',
      dailyGoalHours: parseFloat(dailyGoalHours) || 4.5,
      examDate,
      targetExamYear: parseInt(targetYear) || 2027,
      pomodoroWorkMinutes: parseInt(pomodoroWork) || 25,
      pomodoroBreakMinutes: parseInt(pomodoroBreak) || 5
    });
    setSaveMessage('Preferences successfully saved!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleExport = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gatetrack_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importDataJSON(content);
        if (ok) {
          alert('Backup restored successfully!');
        } else {
          alert('Failed to parse backup file. Please verify it is a valid GateTrack JSON export.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#11141c] border border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Settings className="text-blue-500" size={24} />
            <span>Preferences & Data Management</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure preparation targets, customize timers, and backup/restore your study records.
          </p>
        </div>
      </div>

      {/* Target & Schedule Preferences */}
      <div className="p-6 rounded-2xl bg-[#11141c] border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Calendar size={18} className="text-blue-400" />
          <span>GATE Exam & Focus Targets</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Your Name / Aspirant Handle</label>
            <input
              type="text"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Target Exam Year</label>
            <input
              type="number"
              value={targetYear}
              onChange={e => setTargetYear(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Estimated Exam Date</label>
            <input
              type="date"
              value={examDate}
              onChange={e => setExamDate(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Daily Study Target (Hours)</label>
            <input
              type="number"
              step="0.5"
              value={dailyGoalHours}
              onChange={e => setDailyGoalHours(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Pomodoro Work Duration (Minutes)</label>
            <input
              type="number"
              value={pomodoroWork}
              onChange={e => setPomodoroWork(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Pomodoro Break Duration (Minutes)</label>
            <input
              type="number"
              value={pomodoroBreak}
              onChange={e => setPomodoroBreak(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          {saveMessage && <span className="text-xs text-emerald-400 font-semibold">{saveMessage}</span>}
          <button
            onClick={handleSavePreferences}
            className="ml-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition"
          >
            Save Preferences
          </button>
        </div>
      </div>

      {/* Local Storage Data Health & Stats */}
      <div className="p-6 rounded-2xl bg-[#11141c] border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Database size={18} className="text-blue-400" />
          <span>Local Data Inventory</span>
        </h3>
        <p className="text-xs text-slate-400">
          GateTrack stores all your records directly in your local browser engine. Zero telemetry, zero external trackers.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-slate-500 font-semibold">Subjects</p>
            <p className="text-base font-extrabold text-white mt-1">{subjects.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-slate-500 font-semibold">Study Sessions</p>
            <p className="text-base font-extrabold text-blue-400 mt-1">{studySessions.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-slate-500 font-semibold">Mock Tests</p>
            <p className="text-base font-extrabold text-emerald-400 mt-1">{testAttempts.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-slate-500 font-semibold">Mistakes Logged</p>
            <p className="text-base font-extrabold text-amber-400 mt-1">{mistakes.length}</p>
          </div>
        </div>
      </div>

      {/* Backup, Restore & Reset */}
      <div className="p-6 rounded-2xl bg-[#11141c] border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-400" />
          <span>Backup, Restore & Reset</span>
        </h3>
        <p className="text-xs text-slate-400">
          Save JSON copies of your study progress for safekeeping or restore from previous checkpoints.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs border border-slate-700 transition"
          >
            <Download size={15} />
            <span>Export JSON Backup</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-700 cursor-pointer transition">
            <Upload size={15} />
            <span>Restore from File</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (confirm('Reload seed data? Your current records will be re-initialized with the full sample suite.')) {
                loadSampleSeedData();
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-700 transition"
          >
            <RotateCcw size={15} />
            <span>Reload Seed Dataset</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Warning: This will clear all logged study sessions, test attempts, notes, and mistakes. Continue?')) {
                resetAllData();
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-400 font-semibold text-xs border border-rose-900/60 transition ml-auto"
          >
            <Trash2 size={15} />
            <span>Reset All Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
