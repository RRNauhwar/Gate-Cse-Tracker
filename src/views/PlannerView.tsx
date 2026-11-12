import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  CheckCircle2,
  Circle,
  RotateCcw,
  Trash2,
  Clock,
  Sparkles,
  ArrowRight,
  Flame
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { PlannerTask } from '../types';
import { Modal } from '../components/common/Modal';

export const PlannerView: React.FC = () => {
  const { plannerTasks, subjects, addPlannerTask, togglePlannerTask, deletePlannerTask, carryForwardUnfinishedTasks } = useAppState();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || '');
  const [formTopicName, setFormTopicName] = useState('');
  const [formDuration, setFormDuration] = useState('60');
  const [formPriority, setFormPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const openNewTaskModal = (presetDate?: string) => {
    setFormTitle('');
    setFormSubjectId(subjects[0]?.id || '');
    setFormTopicName('');
    setFormDuration('60');
    setFormPriority('medium');
    setFormDate(presetDate || todayStr);
    setIsModalOpen(true);
  };

  const handleCreateTask = () => {
    if (!formTitle.trim()) return;
    const subject = subjects.find(s => s.id === formSubjectId);

    addPlannerTask({
      title: formTitle.trim(),
      subjectId: formSubjectId,
      subjectName: subject?.name || 'General',
      topicName: formTopicName.trim() || undefined,
      date: formDate,
      durationMinutes: parseInt(formDuration) || 60,
      priority: formPriority,
      completed: false
    });

    setIsModalOpen(false);
  };

  // Group tasks
  const todayTasks = plannerTasks.filter(t => t.date === todayStr);
  const tomorrowTasks = plannerTasks.filter(t => t.date === tomorrowStr);
  const upcomingTasks = plannerTasks.filter(t => t.date > tomorrowStr);
  const pastUnfinishedTasks = plannerTasks.filter(t => !t.completed && t.date < todayStr);

  const totalPlannedMinutesToday = todayTasks.reduce((sum, t) => sum + t.durationMinutes, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#11141c] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Calendar className="text-blue-500" size={24} />
            <span>Daily & Weekly Study Planner</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Organize high-priority revision and problem-solving targets by date with auto carryover.
          </p>
        </div>

        <button
          onClick={() => openNewTaskModal()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 transition shrink-0"
        >
          <Plus size={16} />
          <span>Add Study Goal</span>
        </button>
      </div>

      {/* Overdue / Carryover Banner if any */}
      {pastUnfinishedTasks.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <RotateCcw className="text-amber-400 shrink-0" size={18} />
            <p className="text-xs text-amber-200">
              You have <span className="font-bold text-white">{pastUnfinishedTasks.length}</span> uncompleted goal{pastUnfinishedTasks.length === 1 ? '' : 's'} from previous days.
            </p>
          </div>
          <button
            onClick={carryForwardUnfinishedTasks}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition shrink-0"
          >
            Carry Over to Today
          </button>
        </div>
      )}

      {/* Main Task Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Today */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Today</span>
              <span className="text-xs text-slate-500">({todayStr})</span>
            </div>
            <span className="text-xs text-blue-400 font-mono font-bold">
              {Math.round(totalPlannedMinutesToday / 60)}h {totalPlannedMinutesToday % 60}m planned
            </span>
          </div>

          {todayTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 rounded-xl bg-[#11141c] border border-slate-800/80">
              No tasks scheduled for today.
              <button
                onClick={() => openNewTaskModal(todayStr)}
                className="block mx-auto mt-2 text-blue-400 hover:underline"
              >
                + Add goal for today
              </button>
            </div>
          ) : (
            todayTasks.map(task => (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition ${
                  task.completed
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                    : 'bg-[#11141c] border-slate-800 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    onClick={() => togglePlannerTask(task.id)}
                    className="flex items-start gap-2.5 cursor-pointer min-w-0"
                  >
                    <button className="mt-0.5 text-blue-400">
                      {task.completed ? (
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      ) : (
                        <Circle size={18} className="text-slate-600" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold leading-relaxed ${task.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span>{task.subjectName}</span>
                        <span>•</span>
                        <span>{task.durationMinutes}m</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deletePlannerTask(task.id)}
                    className="p-1 text-slate-600 hover:text-rose-400 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Column 2: Tomorrow */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Tomorrow</span>
              <span className="text-xs text-slate-500">({tomorrowStr})</span>
            </div>
            <button
              onClick={() => openNewTaskModal(tomorrowStr)}
              className="text-xs text-blue-400 hover:underline font-semibold"
            >
              + Add
            </button>
          </div>

          {tomorrowTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 rounded-xl bg-[#11141c] border border-slate-800/80">
              No tasks scheduled for tomorrow yet.
            </div>
          ) : (
            tomorrowTasks.map(task => (
              <div
                key={task.id}
                className="p-4 rounded-xl bg-[#11141c] border border-slate-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white leading-relaxed">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span>{task.subjectName}</span>
                      <span>•</span>
                      <span>{task.durationMinutes}m</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deletePlannerTask(task.id)}
                    className="p-1 text-slate-600 hover:text-rose-400 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Column 3: Upcoming This Week */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-white text-sm">Upcoming Goals</span>
            <button
              onClick={() => openNewTaskModal()}
              className="text-xs text-blue-400 hover:underline font-semibold"
            >
              + Add
            </button>
          </div>

          {upcomingTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 rounded-xl bg-[#11141c] border border-slate-800/80">
              No upcoming tasks scheduled further out.
            </div>
          ) : (
            upcomingTasks.map(task => (
              <div
                key={task.id}
                className="p-4 rounded-xl bg-[#11141c] border border-slate-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white leading-relaxed">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span>Due: {task.date}</span>
                      <span>•</span>
                      <span>{task.durationMinutes}m</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deletePlannerTask(task.id)}
                    className="p-1 text-slate-600 hover:text-rose-400 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Study Goal"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Target / Goal Description</label>
            <input
              type="text"
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              placeholder="e.g. Solve 15 PYQs on Relational Algebra & SQL..."
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <label className="text-xs font-semibold text-slate-400 block mb-1">Due Date</label>
              <input
                type="date"
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Estimated Duration (Minutes)</label>
              <input
                type="number"
                value={formDuration}
                onChange={e => setFormDuration(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Priority</label>
              <select
                value={formPriority}
                onChange={e => setFormPriority(e.target.value as any)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-blue-500"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTask}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30"
            >
              Add to Schedule
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
