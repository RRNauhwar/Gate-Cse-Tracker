import React, { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  Clock,
  CalendarClock,
  Pause,
  Play,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';
import { useTimer } from '../../context/TimerContext';
import { CommandPalette } from './CommandPalette';

interface HeaderProps {
  onToggleMobileNav: () => void;
  onNavigate: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileNav, onNavigate }) => {
  const { settings } = useAppState();
  const { isRunning, isPaused, elapsedSeconds, pauseTimer, resumeTimer } = useTimer();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // GATE Exam Countdown Calculation
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const calcTime = () => {
      const target = new Date(settings.examDate).getTime();
      const now = Date.now();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setCountdown({ days, hours, minutes });
    };

    calcTime();
    const interval = setInterval(calcTime, 60000);
    return () => clearInterval(interval);
  }, [settings.examDate]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-[#0a0b0e]/90 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-4 lg:px-8 flex items-center justify-between max-w-full overflow-hidden">
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
          <button
            onClick={onToggleMobileNav}
            className="lg:hidden p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} />
          </button>

          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 cursor-pointer group min-w-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Layers size={17} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white truncate">GateTrack</span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {settings.targetExamYear}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden md:block -mt-0.5">Personal Preparation Suite</p>
            </div>
          </div>
        </div>

        {/* Center: Search Trigger (Cmd + K) */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200 transition text-sm group"
          >
            <span className="flex items-center gap-2.5">
              <Search size={16} className="text-slate-500 group-hover:text-slate-400" />
              <span>Search syllabus, notes, mistakes...</span>
            </span>
            <kbd className="text-[10px] font-semibold bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Countdown & Active Timer Pill */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Exam Countdown Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <CalendarClock size={15} className="text-amber-400 animate-pulse" />
            <span className="text-slate-400">Exam:</span>
            <span className="font-bold text-white tracking-wide">
              {countdown.days}d {countdown.hours}h left
            </span>
          </div>

          {/* Active Timer Status Pill */}
          {isRunning ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-blue-950/70 border border-blue-700/80 shadow-md shadow-blue-950">
              <div
                onClick={() => onNavigate('timer')}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <Clock size={14} className="text-blue-400 animate-spin" style={{ animationDuration: '3s' }} />
                <span className="font-mono font-bold text-xs text-blue-200">
                  {formatTimer(elapsedSeconds)}
                </span>
              </div>
              <button
                onClick={isPaused ? resumeTimer : pauseTimer}
                className="p-1 rounded-md text-blue-300 hover:bg-blue-800/60 transition"
                title={isPaused ? "Resume Timer" : "Pause Timer"}
              >
                {isPaused ? <Play size={12} /> : <Pause size={12} />}
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('timer')}
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition"
              title="Open Study Timer"
            >
              <Clock size={14} className="text-slate-400" />
              <span className="hidden sm:inline">Start Timer</span>
            </button>
          )}

          {/* Mobile Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Open search"
          >
            <Search size={18} />
          </button>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={onNavigate}
      />
    </>
  );
};
