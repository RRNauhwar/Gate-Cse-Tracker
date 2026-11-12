import React from 'react';
import {
  X,
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
  Layers,
  Flame
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  currentView,
  onNavigate
}) => {
  const { settings, mistakes, plannerTasks } = useAppState();

  if (!isOpen) return null;

  const unresolvedMistakesCount = mistakes.filter(m => !m.resolved).length;
  const pendingTasksToday = plannerTasks.filter(
    t => !t.completed && t.date <= new Date().toISOString().split('T')[0]
  ).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'syllabus', label: 'Syllabus Tracker', icon: ListChecks },
    { id: 'timer', label: 'Focus Timer', icon: Clock },
    { id: 'tests', label: 'Mock Tests & CBT', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'notes', label: 'Notes & Formulas', icon: FileText },
    {
      id: 'mistakes',
      label: 'Mistake Book',
      icon: AlertOctagon,
      badge: unresolvedMistakesCount > 0 ? unresolvedMistakesCount : undefined
    },
    { id: 'calculator', label: 'GATE Calculator', icon: Calculator },
    {
      id: 'planner',
      label: 'Study Planner',
      icon: Calendar,
      badge: pendingTasksToday > 0 ? pendingTasksToday : undefined
    },
    { id: 'settings', label: 'Data & Settings', icon: Settings }
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Slide-out Drawer */}
      <div className="relative w-72 max-w-[85%] bg-[#0e1118] border-r border-slate-800 h-full p-4 flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <Layers size={18} />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white">GateTrack</span>
              <p className="text-[10px] text-slate-400">Personal Suite</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-blue-400' : 'text-slate-500'} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-slate-800 text-xs text-slate-500">
          GATE {settings.targetExamYear} Preparation
        </div>
      </div>
    </div>
  );
};
