import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Subject,
  StudySession,
  TestSeries,
  TestAttempt,
  MistakeRecord,
  Note,
  PlannerTask,
  UserSettings,
  TopicStatus
} from '../types';
import { defaultSubjects } from '../data/defaultSyllabus';
import { sampleTests } from '../data/sampleTests';
import { sampleNotes } from '../data/sampleNotes';
import { sampleMistakes } from '../data/sampleMistakes';
import { samplePlannerTasks } from '../data/samplePlanner';

export interface AppState {
  schemaVersion: number;
  subjects: Subject[];
  studySessions: StudySession[];
  testSeries: TestSeries[];
  testAttempts: TestAttempt[];
  mistakes: MistakeRecord[];
  notes: Note[];
  plannerTasks: PlannerTask[];
  settings: UserSettings;
}

export interface AppContextType extends AppState {
  storageError: string | null;
  storageWriteError: string | null;
  migrationLog: string[];
  clearStorageErrors: () => void;

  // Syllabus mutations
  updateTopicStatus: (subjectId: string, topicId: string, status: TopicStatus) => void;
  updateTopicNotes: (subjectId: string, topicId: string, notes: string) => void;
  addSubject: (subject: Subject) => void;
  addTopic: (subjectId: string, unitId: string, topicName: string) => void;

  // Study Session mutations
  addStudySession: (session: Omit<StudySession, 'id'>) => void;

  // Test Series & Attempts mutations
  saveTestAttempt: (attempt: TestAttempt) => void;

  // Notes mutations
  addNote: (note: Omit<Note, 'id' | 'updatedAt'>) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  // Mistakes mutations
  addMistake: (mistake: Omit<MistakeRecord, 'id' | 'dateAdded'>) => void;
  toggleMistakeResolved: (id: string) => void;
  deleteMistake: (id: string) => void;

  // Planner mutations
  addPlannerTask: (task: Omit<PlannerTask, 'id'>) => void;
  togglePlannerTask: (id: string) => void;
  deletePlannerTask: (id: string) => void;
  carryForwardUnfinishedTasks: () => void;

  // Settings & Management
  updateSettings: (settings: Partial<UserSettings>) => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => boolean;
  resetAllData: () => void;
  loadSampleSeedData: () => void;
}

export const STORAGE_KEY = 'gatetrack_personal_v1';
export const CURRENT_SCHEMA_VERSION = 2;

// Demo fixture identifiers positively confirmed as fabricated demo activity
const DEMO_SESSION_IDS = new Set(['sess-1', 'sess-2', 'sess-3', 'sess-test-auto']);
const DEMO_ATTEMPT_IDS = new Set(['att-1', 'attempt-test-auto']);
const DEMO_MISTAKE_IDS = new Set(['err-1', 'err-2', 'err-3']);
const DEMO_NOTE_IDS = new Set(['note-1', 'note-2', 'note-3', 'note-test-auto']);
const DEMO_TASK_IDS = new Set(['task-1', 'task-2', 'task-3', 'task-4']);

export const defaultSettings: UserSettings = {
  targetExamYear: 2027,
  examDate: '2027-02-06',
  dailyGoalHours: 4.5,
  userName: 'Aspirant',
  pomodoroWorkMinutes: 25,
  pomodoroBreakMinutes: 5
};

// Pure clean baseline state: 0% completion, 0 hours, 0 attempts, 0 tasks, 0 notes, 0 mistakes
export const createCleanState = (): AppState => ({
  schemaVersion: CURRENT_SCHEMA_VERSION,
  subjects: defaultSubjects.map(s => ({
    ...s,
    units: s.units.map(u => ({
      ...u,
      topics: u.topics.map(t => ({
        ...t,
        status: 'not_started' as TopicStatus,
        completedAt: undefined,
        lastRevisedAt: undefined,
        notes: undefined
      }))
    }))
  })),
  studySessions: [],
  testSeries: sampleTests,
  testAttempts: [],
  mistakes: [],
  notes: [],
  plannerTasks: [],
  settings: defaultSettings
});

export const initialSampleSessions: StudySession[] = [
  {
    id: 'sess-1',
    subjectId: 'algo',
    subjectName: 'Algorithms',
    topicId: 'algo-1',
    topicName: 'Asymptotic Notations',
    durationSeconds: 3600,
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    type: 'pomodoro',
    notes: 'Covered Master Theorem Cases 1 and 2.'
  },
  {
    id: 'sess-2',
    subjectId: 'dm',
    subjectName: 'Discrete Mathematics',
    topicId: 'dm-1',
    topicName: 'Propositional Logic',
    durationSeconds: 5400,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    type: 'stopwatch',
    notes: 'Finished 15 truth table and equivalence PYQs.'
  },
  {
    id: 'sess-3',
    subjectId: 'dld',
    subjectName: 'Digital Logic Design',
    topicId: 'dld-2',
    topicName: 'K-Map Simplification',
    durationSeconds: 4200,
    timestamp: new Date().toISOString(),
    type: 'pomodoro',
    notes: 'Practiced prime implicant grouping.'
  }
];

export const initialSampleAttempts: TestAttempt[] = [
  {
    id: 'att-1',
    testId: 'test-cs-mini-1',
    testTitle: 'GATE CS Mini Mock 1: Core Fundamentals',
    startedAt: new Date(Date.now() - 86400000).toISOString(),
    submittedAt: new Date(Date.now() - 86400000 + 1200000).toISOString(),
    score: 7.0,
    maxScore: 9.0,
    accuracy: 80,
    answers: {
      q1: { selectedOptions: ['B'], isCorrect: true, marksAwarded: 1, status: 'answered', timeSpentSeconds: 140 },
      q2: { selectedOptions: ['A', 'C', 'D'], isCorrect: true, marksAwarded: 2, status: 'answered', timeSpentSeconds: 180 },
      q3: { natValue: 2, isCorrect: true, marksAwarded: 2, status: 'answered', timeSpentSeconds: 260 },
      q4: { selectedOptions: ['C'], isCorrect: true, marksAwarded: 2, status: 'answered', timeSpentSeconds: 150 },
      q5: { natValue: 6, isCorrect: false, marksAwarded: 0, status: 'answered', timeSpentSeconds: 210 }
    }
  }
];

/**
 * Migration & Storage Loader
 * Safely parses saved localStorage data, executes an idempotent migration that strips
 * fabricated demo activity while strictly preserving verified user-created progress.
 */
export function loadAndMigrateStorage(rawJson: string | null): {
  state: AppState;
  changes: string[];
  readError: string | null;
} {
  const changes: string[] = [];

  // Case 1: Fresh installation
  if (!rawJson) {
    changes.push('Fresh installation: Initialized clean baseline state (0% syllabus, 0 hours, 0 attempts).');
    return {
      state: createCleanState(),
      changes,
      readError: null
    };
  }

  // Case 2: Parse saved data
  let parsed: any;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err: any) {
    const errorMsg = `Corrupted storage JSON: ${err?.message || 'SyntaxError'}. Preserving existing storage without overwriting.`;
    console.error(errorMsg);
    return {
      state: createCleanState(),
      changes: ['Storage read failed; fallback loaded without touching storage.'],
      readError: errorMsg
    };
  }

  // Check if data is already on current schema version
  if (parsed && typeof parsed === 'object' && parsed.schemaVersion >= CURRENT_SCHEMA_VERSION) {
    return {
      state: {
        schemaVersion: parsed.schemaVersion,
        subjects: Array.isArray(parsed.subjects) ? parsed.subjects : defaultSubjects,
        studySessions: Array.isArray(parsed.studySessions) ? parsed.studySessions : [],
        testSeries: Array.isArray(parsed.testSeries) ? parsed.testSeries : sampleTests,
        testAttempts: Array.isArray(parsed.testAttempts) ? parsed.testAttempts : [],
        mistakes: Array.isArray(parsed.mistakes) ? parsed.mistakes : [],
        notes: Array.isArray(parsed.notes) ? parsed.notes : [],
        plannerTasks: Array.isArray(parsed.plannerTasks) ? parsed.plannerTasks : [],
        settings: { ...defaultSettings, ...(parsed.settings || {}) }
      },
      changes: ['Existing clean schema (v2) verified; no migration required.'],
      readError: null
    };
  }

  // Case 3: Migration from v1 (which contained fabricated demo data)
  // Step A: Backup pre-cleanup raw data to localStorage
  try {
    if (typeof localStorage !== 'undefined' && !localStorage.getItem('gatetrack_backup_pre_cleanup_v1')) {
      localStorage.setItem('gatetrack_backup_pre_cleanup_v1', rawJson);
      changes.push('Pre-cleanup backup saved to localStorage (key: gatetrack_backup_pre_cleanup_v1).');
    }
  } catch (e) {
    console.warn('Could not save pre-cleanup backup to localStorage', e);
  }

  // Step B: Sanitize syllabus topics
  let resetTopicCount = 0;
  let preservedTopicCount = 0;
  const rawSubjects = Array.isArray(parsed.subjects) ? parsed.subjects : defaultSubjects;
  const migratedSubjects: Subject[] = rawSubjects.map((s: Subject) => ({
    ...s,
    units: s.units.map(u => ({
      ...u,
      topics: u.topics.map(t => {
        // A topic is preserved if the user interacted with it:
        // Has a valid completedAt timestamp, lastRevisedAt timestamp, or personal notes
        const hasUserInteraction = Boolean(
          (t.completedAt && t.completedAt.length > 0) ||
          (t.lastRevisedAt && t.lastRevisedAt.length > 0) ||
          (t.notes && t.notes.trim().length > 0)
        );

        if (hasUserInteraction) {
          preservedTopicCount++;
          return t;
        }

        // Demo seed had topics pre-marked completed/in_progress without user interaction
        if (t.status !== 'not_started') {
          resetTopicCount++;
        }

        return {
          ...t,
          status: 'not_started' as TopicStatus,
          completedAt: undefined,
          lastRevisedAt: undefined
        };
      })
    }))
  }));

  // Step C: Filter out demo sessions, preserve real user sessions
  const rawSessions = Array.isArray(parsed.studySessions) ? parsed.studySessions : [];
  const migratedSessions: StudySession[] = rawSessions.filter(
    (s: StudySession) => !DEMO_SESSION_IDS.has(s.id)
  );
  const removedSessions = rawSessions.length - migratedSessions.length;

  // Step D: Filter out demo test attempts, preserve real user attempts
  const rawAttempts = Array.isArray(parsed.testAttempts) ? parsed.testAttempts : [];
  const migratedAttempts: TestAttempt[] = rawAttempts.filter(
    (a: TestAttempt) => !DEMO_ATTEMPT_IDS.has(a.id)
  );
  const removedAttempts = rawAttempts.length - migratedAttempts.length;

  // Step E: Filter out demo mistakes, preserve user mistakes
  const rawMistakes = Array.isArray(parsed.mistakes) ? parsed.mistakes : [];
  const migratedMistakes: MistakeRecord[] = rawMistakes.filter(
    (m: MistakeRecord) => !DEMO_MISTAKE_IDS.has(m.id)
  );
  const removedMistakes = rawMistakes.length - migratedMistakes.length;

  // Step F: Filter out demo notes, preserve user notes
  const rawNotes = Array.isArray(parsed.notes) ? parsed.notes : [];
  const migratedNotes: Note[] = rawNotes.filter(
    (n: Note) => !DEMO_NOTE_IDS.has(n.id)
  );
  const removedNotes = rawNotes.length - migratedNotes.length;

  // Step G: Filter out demo planner tasks, preserve user tasks
  const rawTasks = Array.isArray(parsed.plannerTasks) ? parsed.plannerTasks : [];
  const migratedTasks: PlannerTask[] = rawTasks.filter(
    (t: PlannerTask) => !DEMO_TASK_IDS.has(t.id)
  );
  const removedTasks = rawTasks.length - migratedTasks.length;

  changes.push(
    `Migration v2 applied: Reset ${resetTopicCount} demo topic statuses to not_started (${preservedTopicCount} user topics preserved). ` +
    `Removed ${removedSessions} demo study sessions, ${removedAttempts} demo test attempts, ${removedMistakes} demo mistakes, ` +
    `${removedNotes} demo notes, ${removedTasks} demo planner tasks.`
  );

  const migratedState: AppState = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    subjects: migratedSubjects,
    studySessions: migratedSessions,
    testSeries: Array.isArray(parsed.testSeries) ? parsed.testSeries : sampleTests,
    testAttempts: migratedAttempts,
    mistakes: migratedMistakes,
    notes: migratedNotes,
    plannerTasks: migratedTasks,
    settings: { ...defaultSettings, ...(parsed.settings || {}) }
  };

  // Immediately persist migrated state to localStorage
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedState));
    }
  } catch (e) {
    console.warn('Could not immediately persist migrated state to localStorage', e);
  }

  return {
    state: migratedState,
    changes,
    readError: null
  };
}

const AppContext = createContext<AppContextType | null>(null);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [migrationLog, setMigrationLog] = useState<string[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [storageWriteError, setStorageWriteError] = useState<string | null>(null);

  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      const result = loadAndMigrateStorage(saved);
      if (result.readError) {
        setStorageError(result.readError);
      }
      if (result.changes.length > 0) {
        console.info('[GateTrack Migration]', ...result.changes);
      }
      return result.state;
    } catch (e: any) {
      console.error('Fatal initialization error in AppStateProvider', e);
      setStorageError(`Initialization error: ${e?.message || 'Unknown error'}`);
      return createCleanState();
    }
  });

  // Track initial render to avoid double-write or writing corrupted state
  const isInitialMount = useRef(true);

  // Auto-persist state to localStorage on state changes
  useEffect(() => {
    if (storageError) {
      console.warn('GateTrack: Persistence paused because storage read error is active to prevent data loss.');
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (storageWriteError) setStorageWriteError(null);
    } catch (e: any) {
      console.error('GateTrack: Failed to save state to localStorage', e);
      setStorageWriteError(e?.message || 'Storage write failed (e.g. storage quota exceeded).');
    }
    isInitialMount.current = false;
  }, [state, storageError]);

  const clearStorageErrors = () => {
    setStorageError(null);
    setStorageWriteError(null);
  };

  // 1. Topic Status Update (saves completedAt timestamp to distinguish user progress)
  const updateTopicStatus = (subjectId: string, topicId: string, status: TopicStatus) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          units: s.units.map(u => ({
            ...u,
            topics: u.topics.map(t => {
              if (t.id !== topicId) return t;
              return {
                ...t,
                status,
                completedAt: status === 'completed' ? (t.completedAt || new Date().toISOString()) : undefined,
                lastRevisedAt: status === 'needs_revision' ? new Date().toISOString() : t.lastRevisedAt
              };
            })
          }))
        };
      })
    }));
  };

  // 2. Topic Personal Notes Update
  const updateTopicNotes = (subjectId: string, topicId: string, notes: string) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          units: s.units.map(u => ({
            ...u,
            topics: u.topics.map(t => (t.id === topicId ? { ...t, notes } : t))
          }))
        };
      })
    }));
  };

  // 3. Subject & Topic Additions
  const addSubject = (subject: Subject) => {
    setState(prev => ({ ...prev, subjects: [...prev.subjects, subject] }));
  };

  const addTopic = (subjectId: string, unitId: string, topicName: string) => {
    const newTopicId = `topic-${Date.now()}`;
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          units: s.units.map(u => {
            if (u.id !== unitId) return u;
            return {
              ...u,
              topics: [
                ...u.topics,
                { id: newTopicId, name: topicName, status: 'not_started', weightage: 'medium' }
              ]
            };
          })
        };
      })
    }));
  };

  // 4. Study Session Mutation (prevents duplicate sessions with unique timestamps)
  const addStudySession = (session: Omit<StudySession, 'id'>) => {
    const newSession: StudySession = {
      ...session,
      id: `sess-${Date.now()}`
    };
    setState(prev => ({
      ...prev,
      studySessions: [newSession, ...prev.studySessions]
    }));
  };

  // 5. Test Attempt Mutation
  const saveTestAttempt = (attempt: TestAttempt) => {
    setState(prev => {
      // Prevent duplicate saving of the exact same attempt ID
      if (prev.testAttempts.some(a => a.id === attempt.id)) {
        return prev;
      }
      return {
        ...prev,
        testAttempts: [attempt, ...prev.testAttempts]
      };
    });
  };

  // 6. Notes Mutations
  const addNote = (note: Omit<Note, 'id' | 'updatedAt'>) => {
    const newNote: Note = {
      ...note,
      id: `note-${Date.now()}`,
      updatedAt: new Date().toISOString()
    };
    setState(prev => ({ ...prev, notes: [newNote, ...prev.notes] }));
  };

  const updateNote = (id: string, noteUpdate: Partial<Note>) => {
    setState(prev => ({
      ...prev,
      notes: prev.notes.map(n =>
        n.id === id ? { ...n, ...noteUpdate, updatedAt: new Date().toISOString() } : n
      )
    }));
  };

  const deleteNote = (id: string) => {
    setState(prev => ({
      ...prev,
      notes: prev.notes.filter(n => n.id !== id)
    }));
  };

  // 7. Mistakes Mutations
  const addMistake = (mistake: Omit<MistakeRecord, 'id' | 'dateAdded'>) => {
    const newMistake: MistakeRecord = {
      ...mistake,
      id: `err-${Date.now()}`,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    setState(prev => ({ ...prev, mistakes: [newMistake, ...prev.mistakes] }));
  };

  const toggleMistakeResolved = (id: string) => {
    setState(prev => ({
      ...prev,
      mistakes: prev.mistakes.map(m =>
        m.id === id ? { ...m, resolved: !m.resolved, lastReviewedAt: new Date().toISOString().split('T')[0] } : m
      )
    }));
  };

  const deleteMistake = (id: string) => {
    setState(prev => ({
      ...prev,
      mistakes: prev.mistakes.filter(m => m.id !== id)
    }));
  };

  // 8. Planner Mutations
  const addPlannerTask = (task: Omit<PlannerTask, 'id'>) => {
    const newTask: PlannerTask = {
      ...task,
      id: `task-${Date.now()}`
    };
    setState(prev => ({ ...prev, plannerTasks: [newTask, ...prev.plannerTasks] }));
  };

  const togglePlannerTask = (id: string) => {
    setState(prev => ({
      ...prev,
      plannerTasks: prev.plannerTasks.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    }));
  };

  const deletePlannerTask = (id: string) => {
    setState(prev => ({
      ...prev,
      plannerTasks: prev.plannerTasks.filter(t => t.id !== id)
    }));
  };

  const carryForwardUnfinishedTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    setState(prev => ({
      ...prev,
      plannerTasks: prev.plannerTasks.map(t => {
        if (!t.completed && t.date < today) {
          return { ...t, date: today };
        }
        return t;
      })
    }));
  };

  // 9. Preferences Mutation
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  };

  // 10. Data Backup & Import
  const exportDataJSON = () => {
    return JSON.stringify(state, null, 2);
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && Array.isArray(parsed.subjects)) {
        setState({
          schemaVersion: CURRENT_SCHEMA_VERSION,
          subjects: parsed.subjects,
          studySessions: Array.isArray(parsed.studySessions) ? parsed.studySessions : [],
          testSeries: Array.isArray(parsed.testSeries) ? parsed.testSeries : sampleTests,
          testAttempts: Array.isArray(parsed.testAttempts) ? parsed.testAttempts : [],
          mistakes: Array.isArray(parsed.mistakes) ? parsed.mistakes : [],
          notes: Array.isArray(parsed.notes) ? parsed.notes : [],
          plannerTasks: Array.isArray(parsed.plannerTasks) ? parsed.plannerTasks : [],
          settings: { ...defaultSettings, ...(parsed.settings || {}) }
        });
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON file for import', e);
    }
    return false;
  };

  // 11. Reset All Data: Re-initializes clean baseline with 0% progress and preserves clean state in localStorage
  const resetAllData = () => {
    const cleanState = createCleanState();
    setState(cleanState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanState));
    } catch (e) {
      console.error('Failed to save clean reset state to localStorage', e);
    }
  };

  // 12. Explicit manual seed dataset loading (only when user opts in from Settings)
  const loadSampleSeedData = () => {
    setState({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      subjects: defaultSubjects,
      studySessions: initialSampleSessions,
      testSeries: sampleTests,
      testAttempts: initialSampleAttempts,
      mistakes: sampleMistakes,
      notes: sampleNotes,
      plannerTasks: samplePlannerTasks,
      settings: defaultSettings
    });
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        storageError,
        storageWriteError,
        migrationLog,
        clearStorageErrors,
        updateTopicStatus,
        updateTopicNotes,
        addSubject,
        addTopic,
        addStudySession,
        saveTestAttempt,
        addNote,
        updateNote,
        deleteNote,
        addMistake,
        toggleMistakeResolved,
        deleteMistake,
        addPlannerTask,
        togglePlannerTask,
        deletePlannerTask,
        carryForwardUnfinishedTasks,
        updateSettings,
        exportDataJSON,
        importDataJSON,
        resetAllData,
        loadSampleSeedData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
