// Types for Task Manager

export interface User {
  id: string;
  name: string;
  emoji: string;
}

export interface Project {
  id: string;
  name: string;
  emoji: string;
  gradient: string; // Tailwind gradient classes
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  projectId: string;
  deadline: string | null; // ISO date string
  status: 'todo' | 'done';
  createdAt: string; // ISO datetime
  closedAt: string | null; // ISO datetime
}

// Default users
export const USERS: User[] = [
  { id: 'pavlo', name: 'Павло', emoji: '👨‍💼' },
  { id: 'dan', name: 'Даня', emoji: '🧑‍💻' },
  { id: 'anastasia', name: 'Анастасія', emoji: '👩‍💼' },
];

// Default projects with gradients
export const DEFAULT_PROJECTS: Omit<Project, 'id'>[] = [
  { name: 'Logity', emoji: '🚚', gradient: 'from-orange-400 to-red-500' },
  { name: 'Truxx.AI', emoji: '🤖', gradient: 'from-blue-400 to-purple-500' },
  { name: 'LBOARD', emoji: '📊', gradient: 'from-green-400 to-teal-500' },
  { name: 'Personal', emoji: '🏠', gradient: 'from-pink-400 to-rose-500' },
  { name: 'Other', emoji: '📌', gradient: 'from-gray-400 to-slate-500' },
];
