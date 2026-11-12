import { PlannerTask } from '../types';

const todayStr = new Date().toISOString().split('T')[0];
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = tomorrow.toISOString().split('T')[0];

export const samplePlannerTasks: PlannerTask[] = [
  {
    id: 'task-1',
    title: 'Solve 20 PYQs on Binary Search Trees & AVL rotations',
    subjectId: 'dsa',
    subjectName: 'Programming & Data Structures',
    topicName: 'Binary Search Trees',
    date: todayStr,
    durationMinutes: 90,
    priority: 'high',
    completed: false
  },
  {
    id: 'task-2',
    title: 'Revise Coffman Deadlock Conditions & Banker Algorithm',
    subjectId: 'os',
    subjectName: 'Operating Systems',
    topicName: 'Deadlocks',
    date: todayStr,
    durationMinutes: 45,
    priority: 'medium',
    completed: false
  },
  {
    id: 'task-3',
    title: 'Practice 4-variable K-Map minimization with don’t care conditions',
    subjectId: 'dld',
    subjectName: 'Digital Logic Design',
    topicName: 'K-Map Simplification',
    date: todayStr,
    durationMinutes: 60,
    priority: 'high',
    completed: false
  },
  {
    id: 'task-4',
    title: 'Review Discrete Math Graph Connectivity & Euler planar formula',
    subjectId: 'dm',
    subjectName: 'Discrete Mathematics',
    topicName: 'Graph Theory',
    date: tomorrowStr,
    durationMinutes: 60,
    priority: 'medium',
    completed: false
  }
];
