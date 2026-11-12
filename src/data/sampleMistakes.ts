import { MistakeRecord } from '../types';

export const sampleMistakes: MistakeRecord[] = [
  {
    id: 'err-1',
    questionText: 'What is the tight bound of T(n) = 2T(n/2) + n log n?',
    subjectId: 'algo',
    subjectName: 'Algorithms',
    topicName: 'Recurrence Relations',
    myAnswer: 'Θ(n log n)',
    correctAnswer: 'Θ(n log² n)',
    explanation: 'Substituted Master Theorem standard Case 2 without adding the extra power of log. When f(n) matches n^(log_b a) multiplied by log^k n, the result gains an additional logarithmic factor (k+1), giving n log² n.',
    category: 'Formula Forgotten',
    dateAdded: '2026-10-25',
    lastReviewedAt: '2026-10-27',
    resolved: false
  },
  {
    id: 'err-2',
    questionText: 'Which Coffman condition relates to resources being non-shareable?',
    subjectId: 'os',
    subjectName: 'Operating Systems',
    topicName: 'Deadlock Conditions',
    myAnswer: 'Hold and Wait',
    correctAnswer: 'Mutual Exclusion',
    explanation: 'Misread the definition. Hold and wait means a process holding resources waits for more. Mutual exclusion specifically means at least one resource is held in non-shareable mode.',
    category: 'Misread Question',
    dateAdded: '2026-10-26',
    lastReviewedAt: '2026-10-27',
    resolved: true
  },
  {
    id: 'err-3',
    questionText: 'Direct-mapped cache TAG bits calculation with 64 lines, 32B block, 16-bit address.',
    subjectId: 'coa',
    subjectName: 'Computer Organization & Architecture',
    topicName: 'Cache Addressing',
    myAnswer: '6 bits',
    correctAnswer: '5 bits',
    explanation: 'Did 16 - (5 + 5) instead of 16 - (6 + 5). 64 cache lines is 2^6, requiring 6 index bits, leaving 5 tag bits.',
    category: 'Calculation Error',
    dateAdded: '2026-10-27',
    resolved: false
  }
];
