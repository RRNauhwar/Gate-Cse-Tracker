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
  color: string; // e.g., 'blue', 'emerald', 'amber', 'purple', 'rose', 'cyan'
  icon: string;
  units: Unit[];
}

export interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  topicId?: string;
  topicName?: string;
  durationSeconds: number;
  timestamp: string; // ISO string
  type: 'stopwatch' | 'pomodoro';
  notes?: string;
}

export type QuestionType = 'MCQ' | 'MSQ' | 'NAT';

export interface Question {
  id: string;
  type: QuestionType;
  subjectId: string;
  subjectName: string;
  topic: string;
  marks: number;
  negativeMarks: number;
  questionText: string;
  options?: { id: string; text: string }[];
  correctOptions?: string[]; // IDs for MCQ and MSQ
  natRange?: { min: number; max: number }; // min and max for numerical answer
  explanation: string;
}

export interface TestSeries {
  id: string;
  title: string;
  description: string;
  subjectName: string;
  durationMinutes: number;
  totalMarks: number;
  questions: Question[];
}

export interface TestAttemptAnswer {
  selectedOptions?: string[];
  natValue?: number;
  isCorrect: boolean;
  marksAwarded: number;
  status: 'answered' | 'marked_review' | 'skipped';
  timeSpentSeconds: number;
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
  answers: Record<string, TestAttemptAnswer>;
}

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
  subjectName: string;
  topicName: string;
  myAnswer: string;
  correctAnswer: string;
  explanation: string;
  category: MistakeCategory;
  dateAdded: string;
  lastReviewedAt?: string;
  resolved: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string; // Markdown / KaTeX formulas
  subjectId: string;
  subjectName: string;
  topicName?: string;
  isPinned: boolean;
  isFormula: boolean;
  tags: string[];
  updatedAt: string;
}

export interface PlannerTask {
  id: string;
  title: string;
  subjectId?: string;
  subjectName?: string;
  topicName?: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

export interface UserSettings {
  targetExamYear: number;
  examDate: string; // YYYY-MM-DD
  dailyGoalHours: number;
  userName: string;
  pomodoroWorkMinutes: number;
  pomodoroBreakMinutes: number;
}
