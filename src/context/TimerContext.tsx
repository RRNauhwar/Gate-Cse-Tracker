import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAppState } from './AppStateContext';

export type TimerMode = 'stopwatch' | 'pomodoro';
export type PomodoroPhase = 'work' | 'break';

interface TimerContextType {
  isRunning: boolean;
  isPaused: boolean;
  elapsedSeconds: number;
  totalSeconds: number; // for pomodoro target
  mode: TimerMode;
  pomodoroPhase: PomodoroPhase;
  selectedSubjectId: string;
  selectedTopicId: string;
  sessionNotes: string;
  setMode: (mode: TimerMode) => void;
  setSelectedSubjectId: (id: string) => void;
  setSelectedTopicId: (id: string) => void;
  setSessionNotes: (notes: string) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

const TIMER_STORAGE_KEY = 'gatetrack_active_timer_v1';

const TimerContext = createContext<TimerContextType | null>(null);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { subjects, addStudySession, settings } = useAppState();

  const [mode, setMode] = useState<TimerMode>('stopwatch');
  const [pomodoroPhase, setPomodoroPhase] = useState<PomodoroPhase>('work');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');

  // References to keep wall-clock accurate timing across tabs & reloads
  const startTimeRef = useRef<number | null>(null);
  const accumulatedMsRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const isStoppingRef = useRef<boolean>(false);

  const workSeconds = (settings.pomodoroWorkMinutes || 25) * 60;
  const breakSeconds = (settings.pomodoroBreakMinutes || 5) * 60;
  const targetSeconds = mode === 'pomodoro' ? (pomodoroPhase === 'work' ? workSeconds : breakSeconds) : 0;

  // Restore active timer state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(TIMER_STORAGE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        setMode(p.mode || 'stopwatch');
        setPomodoroPhase(p.pomodoroPhase || 'work');
        setSelectedSubjectId(p.selectedSubjectId || (subjects[0]?.id || ''));
        setSelectedTopicId(p.selectedTopicId || '');
        setSessionNotes(p.sessionNotes || '');

        if (p.isRunning) {
          if (p.isPaused) {
            setIsRunning(true);
            setIsPaused(true);
            accumulatedMsRef.current = p.accumulatedMs || 0;
            setElapsedSeconds(Math.floor(p.accumulatedMs / 1000));
          } else {
            // Running: compute elapsed time from wall clock
            setIsRunning(true);
            setIsPaused(false);
            startTimeRef.current = p.startTime;
            accumulatedMsRef.current = p.accumulatedMs || 0;
            const now = Date.now();
            const totalElapsed = (p.accumulatedMs || 0) + (now - p.startTime);
            setElapsedSeconds(Math.floor(totalElapsed / 1000));
          }
        }
      }
    } catch (e) {
      console.error('Failed to restore active timer', e);
    }
  }, []);

  // Sync to localStorage
  const persistTimer = (running: boolean, paused: boolean) => {
    try {
      localStorage.setItem(
        TIMER_STORAGE_KEY,
        JSON.stringify({
          mode,
          pomodoroPhase,
          isRunning: running,
          isPaused: paused,
          startTime: startTimeRef.current,
          accumulatedMs: accumulatedMsRef.current,
          selectedSubjectId,
          selectedTopicId,
          sessionNotes
        })
      );
    } catch (e) {
      console.error('Failed to persist active timer', e);
    }
  };

  // Ticking loop using requestAnimationFrame + wall clock
  useEffect(() => {
    if (!isRunning || isPaused) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const updateTick = () => {
      if (!startTimeRef.current) return;
      const now = Date.now();
      const currentElapsedMs = accumulatedMsRef.current + (now - startTimeRef.current);
      const currentSeconds = Math.floor(currentElapsedMs / 1000);

      setElapsedSeconds(currentSeconds);

      // Pomodoro completion check
      if (mode === 'pomodoro' && currentSeconds >= targetSeconds) {
        // Switch phase
        if (pomodoroPhase === 'work') {
          // Log completed work session
          saveCurrentSession(currentSeconds);
          setPomodoroPhase('break');
          accumulatedMsRef.current = 0;
          startTimeRef.current = Date.now();
          setElapsedSeconds(0);
        } else {
          setPomodoroPhase('work');
          accumulatedMsRef.current = 0;
          startTimeRef.current = Date.now();
          setElapsedSeconds(0);
        }
      }

      animationFrameRef.current = requestAnimationFrame(updateTick);
    };

    animationFrameRef.current = requestAnimationFrame(updateTick);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isRunning, isPaused, mode, pomodoroPhase, targetSeconds]);

  const startTimer = () => {
    startTimeRef.current = Date.now();
    accumulatedMsRef.current = 0;
    setIsRunning(true);
    setIsPaused(false);
    setElapsedSeconds(0);
    persistTimer(true, false);
  };

  const pauseTimer = () => {
    if (!isRunning || isPaused) return;
    if (startTimeRef.current) {
      accumulatedMsRef.current += Date.now() - startTimeRef.current;
      startTimeRef.current = null;
    }
    setIsPaused(true);
    persistTimer(true, true);
  };

  const resumeTimer = () => {
    if (!isRunning || !isPaused) return;
    startTimeRef.current = Date.now();
    setIsPaused(false);
    persistTimer(true, false);
  };

  const saveCurrentSession = (secondsToLog: number) => {
    if (secondsToLog < 5) return; // avoid logging accidental sub-5s clicks
    const subject = subjects.find(s => s.id === selectedSubjectId);
    let topicName: string | undefined;
    if (subject && selectedTopicId) {
      for (const u of subject.units) {
        const found = u.topics.find(t => t.id === selectedTopicId);
        if (found) {
          topicName = found.name;
          break;
        }
      }
    }

    addStudySession({
      subjectId: selectedSubjectId || 'general',
      subjectName: subject?.name || 'General GATE Prep',
      topicId: selectedTopicId || undefined,
      topicName,
      durationSeconds: secondsToLog,
      timestamp: new Date().toISOString(),
      type: mode,
      notes: sessionNotes.trim() || undefined
    });
  };

  const stopTimer = () => {
    if (isStoppingRef.current || !isRunning) return;
    isStoppingRef.current = true;
    try {
      let finalMs = accumulatedMsRef.current;
      if (isRunning && !isPaused && startTimeRef.current) {
        finalMs += Date.now() - startTimeRef.current;
      }
      const finalSeconds = Math.floor(finalMs / 1000);

      saveCurrentSession(finalSeconds);

      setIsRunning(false);
      setIsPaused(false);
      setElapsedSeconds(0);
      startTimeRef.current = null;
      accumulatedMsRef.current = 0;
      setSessionNotes('');
      try {
        localStorage.removeItem(TIMER_STORAGE_KEY);
      } catch (e) {
        console.error(e);
      }
    } finally {
      isStoppingRef.current = false;
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    startTimeRef.current = null;
    accumulatedMsRef.current = 0;
    try {
      localStorage.removeItem(TIMER_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <TimerContext.Provider
      value={{
        isRunning,
        isPaused,
        elapsedSeconds,
        totalSeconds: targetSeconds,
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
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
