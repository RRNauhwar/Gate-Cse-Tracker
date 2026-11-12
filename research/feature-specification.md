# G4Gate Feature Specification: Personal GATE Preparation Platform

**Project:** Personal GATE Preparation Platform (Codename: *GateTrack*)  
**Reference Target:** `https://g4gate.com/` (Reverse-Engineered via REA)  
**Author:** Full-Stack Architect & Technical Project Lead  
**Date:** 2026-10-28  

---

## 1. Scope & Primary Objectives

The objective is to build an independent, fully functional personal GATE preparation application informed by the design language, structure, and feature catalog of G4Gate, engineered specifically for a single personal learner without any commercial paywalls or payment gateways.

### Strict Non-Commercial Boundary:
- **NO Payments:** Zero integration of Cashfree, Razorpay, UPI, billing dashboards, or paywalled tiers.
- **100% Unlocked:** All 22 features identified in the reference platform's server action catalog are available directly to the user.
- **Zero Authentication Overhead:** No forced login walls or external OAuth dependencies needed for personal study on a local device.

---

## 2. Feature Classification Matrix

| Feature | Category | Reference Status | Personal Implementation Strategy |
|---|---|---|---|
| **1. Dashboard** | Necessary | Reference protected behind login | Real-time aggregate view: Syllabus completion %, daily study streak & target, recent sessions, upcoming tasks, mock accuracy, quick resume |
| **2. Syllabus Tracker** | Necessary | Reference was "Pro" tier (`/syllabus`) | Hierarchical tree: Subjects -> Units -> Topics. Statuses: Not Started, In Progress, Completed, Needs Revision. Search, filtering, progress calculation |
| **3. Study Timer & Pomodoro** | Necessary | Reference was "Pro" tier (`/timer`) | Dual mode: Standard Stopwatch + Pomodoro (25/5 or custom). Persists across route navigation & reloads via timestamp delta. Logged against subject & topic |
| **4. Mock Tests & Practice Engine** | Necessary | Reference was Free/Pro (`/tests`) | Full GATE exam CBT interface: Question palette, MCQ (single-choice), MSQ (multiple-select), NAT (numerical answer), Mark for Review, Negative marking, Instant evaluation & explanation review |
| **5. Performance Analytics** | Necessary | Reference was Pro (`/leaderboard`) | Visual charts: Accuracy trends, score progression, subject-wise weakness radar, study hours distribution, topic revision urgency |
| **6. Notes & Formula Book** | Necessary | Reference was "Free" tier (`/notes`) | Rich markdown & formula editor with KaTeX math rendering, subject/topic tagging, pin/favorite, revision checklist |
| **7. Mistake Book (Error Log)** | Necessary | Reference was "Pro" tier (`/ctr`) | Detailed error journal: question, my answer, correct answer, mistake categorization (Conceptual, Calculation, Misread, Formula, Time, Guess), revision tracking |
| **8. GATE Scientific Calculator** | Necessary | Reference was "Pro" tier (`/calculator`) | Replica of official GATE Virtual Calculator: Degree/Radian modes, Trigonometric, Inverse, Hyperbolic, Log/Ln, Powers/Roots, Factorial, Memory (M+, M-, MR, MC) |
| **9. Study Planner & Daily Tasks** | Necessary | Reference was Free (`/`) | Daily and weekly task scheduler, planned vs actual study time, carry-forward incomplete tasks, priority tagging |
| **10. Global Search & Navigation** | Necessary | Reference used client routing | Universal Command Palette (`Cmd+K` / Search bar) indexing all subjects, topics, notes, formulas, tasks, and mistakes |
| **11. Data Management & Backup** | Necessary | Reference held state server-side | Local-First persistence using LocalStorage & IndexedDB with JSON export/import, automated backup timestamps, and preloaded sample GATE CS dataset |
| **12. Exam Countdown** | Optional / Included | Reference was "Pro" (`/countdown`) | Persistent header widget displaying days, hours, minutes to GATE exam date |
| **13. Motivational Quote Studio** | Optional / Included | Reference was "Pro" (`/quotes`) | Curated focus quotes with rotating display and customization |

---

## 3. Detailed Specification by Module

### Module 1: Dashboard (`/`)
- **Key Metrics Cards:**
  - Total Syllabus Progress (% completed, topics done / in-progress / pending)
  - Today's Study Target (Progress bar: e.g. 3.5 hrs / 5.0 hrs goal)
  - Active Study Streak (consecutive study days counter)
  - Average Test Accuracy (% across completed mock tests)
- **Quick Action Bar:** "Resume Last Topic", "Start Focus Timer", "Attempt Quick Quiz", "Log a Mistake"
- **Recent Activity Feed:** Chronological table of study sessions and test attempts
- **Upcoming Deadlines & Planner Preview:** Tasks due today/this week with quick toggle

### Module 2: Syllabus Tracker (`/syllabus`)
- **Hierarchy:**
  - Subjects (e.g. Engineering Mathematics, Discrete Math, Digital Logic, COA, DSA, TOC, Compiler, OS, DBMS, Computer Networks)
  - Units / Chapters (e.g., Graph Theory, Combinatorics, Mathematical Logic under Discrete Math)
  - Topics (atomic items with status, revision flag, notes snippet, weightage indicator)
- **Status State Machine:**
  - `not_started` (Slate badge)
  - `in_progress` (Blue badge)
  - `completed` (Emerald badge)
  - `needs_revision` (Amber badge)
- **Dynamic Filtering:** Filter by Subject, Status, or Keyword query.
- **Rollup Aggregations:** Subject completion automatically recomputes when any topic status transitions.

### Module 3: Study Timer (`/timer`)
- **Timer Modes:**
  - **Stopwatch Mode:** Open-ended focus session.
  - **Pomodoro Mode:** Configurable work interval (default 25m), short break (5m), long break (15m).
- **Persistence Guarantee:**
  - Timer records `startTimestamp` and `accumulatedElapsedMs`.
  - When user switches tabs or navigates away, timer calculates elapsed time based on wall clock (`Date.now() - startTimestamp`) rather than an easily frozen `setInterval`.
  - Survives browser reloads without double-counting or reset.
- **Session Logging:**
  - Prompts for session reflection notes, subject, and topic on Stop.
  - Adds session record to centralized database: `{ id, subjectId, topicId, durationSeconds, timestamp, notes }`.

### Module 4: Mock Test & Practice Engine (`/tests`)
- **GATE Exam Modes Supported:**
  1. **MCQ (Multiple Choice Question):** Exactly 1 correct option. Scoring: +1 or +2 marks; Negative: -1/3 or -2/3 marks.
  2. **MSQ (Multiple Select Question):** 1 or more correct options. Scoring: Full marks if all correct and no wrong chosen; No negative marking; No partial marks (per official GATE standard).
  3. **NAT (Numerical Answer Type):** User enters a floating-point or integer value into a numerical keypad. Evaluated against an accepted range `[min, max]`. No negative marking.
- **Exam CBT Features:**
  - Question status palette: Not Visited (Gray), Not Answered (Red), Answered (Green), Marked for Review (Purple), Answered & Marked for Review (Purple with small green dot).
  - Countdown exam timer with auto-submit on zero.
  - Clear Response, Save & Next, Mark for Review & Next buttons.
  - Post-Submission Diagnostics: Score, rank prediction, accuracy, question-by-question solution review with detailed explanations.

### Module 5: Performance Analytics (`/analytics`)
- **Score Trend Chart:** Test date vs percentage score progression.
- **Accuracy Breakdown:** Attempted vs unattempted, correct vs incorrect ratio.
- **Subject Mastery Radar / Progress Bars:** Accuracy % per subject to pinpoint weak areas.
- **Study Time Allocation:** Doughnut chart of study hours per subject.
- **Revision Urgency List:** Automatically highlights topics completed >14 days ago without revision.

### Module 6: Notes & Formula Book (`/notes`)
- **Organization:** Filterable by Subject, Unit, and Tags (`#formula`, `#trick`, `#pyq-key`).
- **Editor:** Markdown editor with live preview supporting formatted code, tables, and KaTeX math expressions (e.g. `$O(n \log n)$`, `$\sum_{i=1}^n i$`).
- **Quick Cards:** "Pin to Top" capability for rapid formula revision before tests.

### Module 7: Mistake Book (`/mistakes`)
- **Data Schema:**
  - `questionText`: Problem statement & diagram/latex.
  - `subjectId`, `topicId`
  - `myAnswer`: What I answered during practice.
  - `correctAnswer`: The verified correct option/value.
  - `explanation`: Detailed resolution.
  - `mistakeCategory`: Enum:
    - `Conceptual Gap`
    - `Calculation Error`
    - `Misread Question`
    - `Formula Forgotten`
    - `Time Management`
    - `Wild Guess`
  - `reviewedCount`: Number of times revisited.
  - `resolved`: Boolean flag.

### Module 8: GATE Virtual Scientific Calculator (`/calculator`)
- **Exact Layout Replica:**
  - Standard top display with primary expression and evaluated result.
  - Mode toggle: Degrees (`deg`) vs Radians (`rad`).
  - Functions: `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `sinh`, `cosh`, `tanh`, `log10`, `ln`, `e^x`, `10^x`, `x^y`, `x^2`, `x^3`, `sqrt`, `cbrt`, `1/x`, `n!`, `pi`, `e`.
  - Memory: `MC`, `MR`, `MS`, `M+`, `M-`.
  - Full keyboard event listener support matching desktop usage.

### Module 9: Study Planner & Daily Tasks (`/planner`)
- **Tasks List:** Tasks organized into "Today", "Tomorrow", and "Upcoming".
- **Fields:** Title, Subject, Topic, Estimated Minutes, Priority (`high`, `medium`, `low`), Completed (`boolean`).
- **Carry-Over Utility:** Button to auto-carry uncompleted yesterday tasks to today with one click.

### Module 10: Data Management & Export (`/settings`)
- **Local-First Architecture:** Zero network latency, instant saves.
- **Import / Export:** One-click JSON backup of all subjects, progress, timer sessions, notes, mistakes, and test history.
- **Restore & Reset:** Clean state reset or restore from file.
- **Sample Data Seed:** Toggle to load realistic GATE Computer Science syllabus and sample mock tests.

---

## 4. Inaccessible Parts of Reference Website & Design Decisions

1. **Private Backend / Database Schema:**
   - *Reference reality:* Protected behind authenticated sessions.
   - *Design decision:* Modeled an open, strongly-typed TypeScript domain schema matching real GATE examination demands.
2. **Third-Party Services (Cashfree, Razorpay, WhatsApp):**
   - *Design decision:* Completely removed per the project objective.
3. **Multi-Tenant Complexity:**
   - *Design decision:* Simplified to a single-user local-first architecture with optional profile customization.
