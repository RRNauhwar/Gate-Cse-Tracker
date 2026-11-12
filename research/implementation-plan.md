# G4Gate Personal Preparation Platform: Implementation Plan

**Target Application:** GateTrack (Personal GATE Preparation Platform)  
**Date:** 2026-10-28  
**Architecture:** Modern Client-Side Single Page Application (Vite + React 19 + TypeScript + Tailwind CSS + Local-First Store)  

---

## 1. Architecture & Technology Stack Selection

### Why Vite + React + TypeScript + Tailwind CSS?
1. **Ultra-Fast Development & Execution:** Instant hot module reloading, zero-config builds, and minimal overhead.
2. **Offline & Single-Device Resilience:** Unlike complex server-rendered setups requiring external database connections, a local-first client architecture works 100% offline, starts in milliseconds, and guarantees privacy.
3. **Exact Visual Alignment:** Tailwind CSS enables exact replication of the G4Gate design tokens (Geist font stack, dark slate `#0a0b0e` surfaces, premium shadows, and hairline borders).
4. **Strong Typing:** TypeScript guarantees full schema validation across tests, syllabus models, and timer records.

### Technology Inventory:
- **Build Tool:** Vite 6
- **UI Framework:** React 19 + TypeScript
- **Styling:** Tailwind CSS (configured with G4Gate dark theme palette)
- **Icons:** Lucide React (`lucide-react`)
- **State Management & Persistence:** LocalStorage + reactive state hooks with auto-sync and JSON export/import
- **Math & Calculator:** Custom mathematical parser + KaTeX rendering support
- **Charts & Progress:** Native SVG charts and visual progress bars with zero heavy dependencies

---

## 2. Application Component & Route Hierarchy

```
App (Router & Global State Provider)
│
├── TopNavigation / Header
│   ├── Logo & Brand ("GateTrack")
│   ├── Quick Exam Countdown Widget (Days to GATE)
│   ├── Global Search Bar / Command Palette
│   ├── Quick Timer Widget (Current Active Session)
│   └── Mobile Hamburger Menu Toggle
│
├── Main Layout (Sidebar + Content Area)
│   ├── Sidebar Navigation:
│   │   ├── Dashboard (/)
│   │   ├── Syllabus Tracker (/syllabus)
│   │   ├── Focus Timer (/timer)
│   │   ├── Mock Tests & Practice (/tests)
│   │   ├── Performance Analytics (/analytics)
│   │   ├── Notes & Formulas (/notes)
│   │   ├── Mistake Book (/mistakes)
│   │   ├── Scientific Calculator (/calculator)
│   │   ├── Study Planner (/planner)
│   │   └── Data & Settings (/settings)
│   │
│   └── Route Views (Lazy-Loaded)
│       ├── DashboardView
│       ├── SyllabusView
│       ├── TimerView
│       ├── TestsView (TestList + TestTakingScreen + ResultReview)
│       ├── AnalyticsView
│       ├── NotesView
│       ├── MistakeBookView
│       ├── CalculatorView
│       ├── PlannerView
│       └── SettingsView
│
└── Global Toast & Modal Providers (Confirmation Dialogs, Export/Import Modal)
```

---

## 3. Data Models (Domain Entities)

### A. Syllabus Topic
```typescript
export type TopicStatus = 'not_started' | 'in_progress' | 'completed' | 'needs_revision';

export interface Topic {
  id: string;
  name: string;
  status: TopicStatus;
  weightage?: 'high' | 'medium' | 'low';
  notes?: string;
  completedAt?: string;
  lastRevisedAt?: string;
}

export interface Unit {
  id: string;
  name: string;
  topics: Topic[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string; // e.g., 'blue', 'emerald', 'amber', 'purple'
  icon: string;
  units: Unit[];
}
```

### B. Study Session (Timer)
```typescript
export interface StudySession {
  id: string;
  subjectId: string;
  topicId?: string;
  subjectName: string;
  topicName?: string;
  durationSeconds: number;
  timestamp: string; // ISO date
  type: 'stopwatch' | 'pomodoro';
  notes?: string;
}
```

### C. Test Attempt & Questions
```typescript
export type QuestionType = 'MCQ' | 'MSQ' | 'NAT';

export interface Question {
  id: string;
  type: QuestionType;
  subjectId: string;
  topic: string;
  marks: number;
  negativeMarks: number;
  questionText: string;
  options?: { id: string; text: string }[];
  correctOptions?: string[]; // for MCQ and MSQ
  natRange?: { min: number; max: number }; // for NAT
  explanation: string;
}

export interface TestSeries {
  id: string;
  title: string;
  description: string;
  subjectId?: string;
  durationMinutes: number;
  totalMarks: number;
  questions: Question[];
}

export interface TestAttempt {
  id: string;
  testId: string;
  testTitle: string;
  startedAt: string;
  submittedAt: string;
  score: number;
  maxScore: number;
  accuracy: number; // percentage
  answers: Record<string, {
    selectedOptions?: string[];
    natValue?: number;
    isCorrect: boolean;
    marksAwarded: number;
    status: 'answered' | 'marked_review' | 'skipped';
    timeSpentSeconds: number;
  }>;
}
```

### D. Mistake Record
```typescript
export type MistakeCategory = 
  | 'Conceptual Gap'
  | 'Calculation Error'
  | 'Misread Question'
  | 'Formula Forgotten'
  | 'Time Management'
  | 'Guessing Error';

export interface MistakeRecord {
  id: string;
  questionText: string;
  subjectId: string;
  topicName: string;
  myAnswer: string;
  correctAnswer: string;
  explanation: string;
  category: MistakeCategory;
  dateAdded: string;
  lastReviewedAt?: string;
  resolved: boolean;
}
```

### E. Note / Formula
```typescript
export interface Note {
  id: string;
  title: string;
  content: string; // Markdown / KaTeX
  subjectId: string;
  topicName?: string;
  isPinned: boolean;
  isFormula: boolean;
  tags: string[];
  updatedAt: string;
}
```

### F. Planner Task
```typescript
export interface PlannerTask {
  id: string;
  title: string;
  subjectId?: string;
  topicId?: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}
```

---

## 4. Development Milestones

- **Milestone 1: Project Scaffolding & Design Foundation**
  - Initialize Vite React TypeScript project
  - Configure Tailwind with dark theme tokens, Geist fonts, and Lucide icons
  - Create global state store and LocalStorage persistence engine with seed data
- **Milestone 2: Navigation, Layout & Dashboard**
  - Implement responsive Header with Exam Countdown and Timer Pill
  - Implement Desktop Sidebar and Mobile Drawer Navigation
  - Build Dashboard with real-time progress calculations and quick actions
- **Milestone 3: Syllabus Tracker & Focus Timer**
  - Build hierarchical subject/unit/topic tree with status dropdowns
  - Implement persistent wall-clock study timer and Pomodoro mode
  - Wire session logging directly to Dashboard and Analytics
- **Milestone 4: Mock Test CBT Engine & Calculator**
  - Implement full GATE exam simulator (palette, timer, MCQ/MSQ/NAT, mark review)
  - Implement detailed post-test solution review and score diagnostics
  - Implement official virtual scientific calculator with all mathematical functions
- **Milestone 5: Notes, Mistake Book & Planner**
  - Implement Markdown/Formula editor with tagging and search
  - Implement categorized mistake error log with revision workflow
  - Implement daily/weekly task planner with auto-carryover
- **Milestone 6: Performance Analytics & Settings**
  - Implement charts for score progression, accuracy, and study time
  - Build JSON backup export and restore engine
  - Execute end-to-end acceptance tests across desktop and mobile

---

## 5. Verification & Acceptance Testing Protocol

1. **Syllabus Scenario:** Transition topic status -> verify aggregate % changes -> reload page -> verify state persists.
2. **Timer Scenario:** Start session -> switch pages -> reload -> verify continuous elapsed time -> stop and verify session in history.
3. **Test Simulator Scenario:** Attempt test with mixed MCQ, MSQ, NAT -> submit -> verify automated scoring & negative marking -> inspect mistake transfer.
4. **Notes & Formulas:** Create note with formula -> pin -> search -> edit -> verify persistence.
5. **Responsive Validation:** Test on desktop (1440x900) and mobile (390x844) viewports for zero horizontal overflow and seamless touch targets.
