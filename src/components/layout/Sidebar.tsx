import React from 'react';
import {
  LayoutDashboard,
  ListChecks,
  Clock,
  BarChart3,
  LineChart,
  FileText,
  AlertOctagon,
  Calculator,
  Calendar,
  Settings,
  Flame,
  ChevronRight
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { studySessions, mistakes, plannerTasks, subjects } = useAppState();

  // Compute active study streak
  const streakDays = React.useMemo(() => {
    if (studySessions.length === 0) return 0;
    const sessionDates = Array.from(
      new Set(studySessions.map(s => s.timestamp.split('T')[0]))
    ).sort().reverse();

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (!sessionDates.includes(today) && !sessionDates.includes(yesterday)) {
      return 0;
    }

    let count = 0;
    let checkDate = new Date(sessionDates[0]);

    for (const d of sessionDates) {
      const cur = new Date(d);
      const diff = Math.round((checkDate.getTime() - cur.getTime()) / (1000 * 3600 * 24));
      if (diff <= 1) {
        count++;
        checkDate = cur;
      } else {
        break;
      }
    }
    return count;
  }, [studySessions]);

  // Total topics completed / total
  const { completedTopics, totalTopics } = React.useMemo(() => {
    let completed = 0;
    let total = 0;
    for (const sub of subjects) {
      for (const u of sub.units) {
        for (const t of u.topics) {
          total++;
          if (t.status === 'completed') completed++;
        }
      }
    }
    return { completedTopics: completed, totalTopics: total };
  }, [subjects]);

  const unresolvedMistakesCount = mistakes.filter(m => !m.resolved).length;
  const pendingTasksToday = plannerTasks.filter(
    t => !t.completed && t.date <= new Date().toISOString().split('T')[0]
  ).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'syllabus',
      label: 'Syllabus Tracker',
      icon: ListChecks,
      badge: `${completedTopics}/${totalTopics}`
    },
    { id: 'timer', label: 'Focus Timer', icon: Clock },
    { id: 'tests', label: 'Mock Tests & CBT', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'notes', label: 'Notes & Formulas', icon: FileText },
    {
      id: 'mistakes',
      label: 'Mistake Book',
      icon: AlertOctagon,
      badge: unresolvedMistakesCount > 0 ? unresolvedMistakesCount : undefined,
      badgeColor: 'amber'
    },
    { id: 'calculator', label: 'GATE Calculator', icon: Calculator },
    {
      id: 'planner',
      label: 'Study Planner',
      icon: Calendar,
      badge: pendingTasksToday > 0 ? pendingTasksToday : undefined,
      badgeColor: 'blue'
    },
    { id: 'settings', label: 'Data & Settings', icon: Settings }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#0a0b0e] border-r border-slate-800/80 p-4 h-[calc(100vh-4rem)] sticky top-16 select-none">
      {/* Study Streak Banner */}
      <div className="p-3 mb-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
            <Flame size={18} className="animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Study Streak</p>
            <p className="text-[11px] text-amber-400/90 font-medium">
              {streakDays} Day{streakDays === 1 ? '' : 's'} on track
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition group ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={18}
                  className={isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    item.badgeColor === 'amber'
                      ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                      : item.badgeColor === 'blue'
                      ? 'bg-blue-950/80 text-blue-400 border-blue-800'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="pt-4 mt-auto border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
        <span>GATE Preparation</span>
        <span>v1.0.0</span>
      </div>
    </aside>
  );
};
