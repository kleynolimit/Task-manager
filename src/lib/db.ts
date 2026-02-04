import Database from 'better-sqlite3';
import path from 'path';
import { DEFAULT_PROJECTS, type Project, type Task } from './types';
import { randomUUID } from 'crypto';

// Database file in the project root
const dbPath = path.join(process.cwd(), 'tasks.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL,
    gradient TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    assigneeId TEXT NOT NULL,
    projectId TEXT NOT NULL,
    deadline TEXT,
    status TEXT DEFAULT 'todo',
    createdAt TEXT NOT NULL,
    closedAt TEXT,
    FOREIGN KEY (projectId) REFERENCES projects(id)
  );
`);

// Seed default projects if empty
const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number };
if (projectCount.count === 0) {
  const insertProject = db.prepare('INSERT INTO projects (id, name, emoji, gradient) VALUES (?, ?, ?, ?)');
  for (const p of DEFAULT_PROJECTS) {
    insertProject.run(randomUUID(), p.name, p.emoji, p.gradient);
  }
}

// Project queries
export function getProjects(): Project[] {
  return db.prepare('SELECT * FROM projects').all() as Project[];
}

export function createProject(project: Omit<Project, 'id'>): Project {
  const id = randomUUID();
  db.prepare('INSERT INTO projects (id, name, emoji, gradient) VALUES (?, ?, ?, ?)')
    .run(id, project.name, project.emoji, project.gradient);
  return { id, ...project };
}

// Task queries
export function getTasks(status?: 'todo' | 'done'): Task[] {
  if (status) {
    return db.prepare('SELECT * FROM tasks WHERE status = ? ORDER BY createdAt DESC').all(status) as Task[];
  }
  return db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC').all() as Task[];
}

export function getTask(id: string): Task | undefined {
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task | undefined;
}

export function createTask(task: Omit<Task, 'id' | 'createdAt' | 'closedAt' | 'status'>): Task {
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  db.prepare(`
    INSERT INTO tasks (id, title, description, assigneeId, projectId, deadline, status, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, 'todo', ?)
  `).run(id, task.title, task.description || '', task.assigneeId, task.projectId, task.deadline || null, createdAt);
  return { id, ...task, description: task.description || '', status: 'todo', createdAt, closedAt: null };
}

export function updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Task | undefined {
  const task = getTask(id);
  if (!task) return undefined;

  const fields: string[] = [];
  const values: unknown[] = [];

  if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
  if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
  if (updates.assigneeId !== undefined) { fields.push('assigneeId = ?'); values.push(updates.assigneeId); }
  if (updates.projectId !== undefined) { fields.push('projectId = ?'); values.push(updates.projectId); }
  if (updates.deadline !== undefined) { fields.push('deadline = ?'); values.push(updates.deadline); }
  if (updates.status !== undefined) {
    fields.push('status = ?');
    values.push(updates.status);
    if (updates.status === 'done' && !task.closedAt) {
      fields.push('closedAt = ?');
      values.push(new Date().toISOString());
    } else if (updates.status === 'todo') {
      fields.push('closedAt = ?');
      values.push(null);
    }
  }
  if (updates.closedAt !== undefined) { fields.push('closedAt = ?'); values.push(updates.closedAt); }

  if (fields.length === 0) return task;

  values.push(id);
  db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return getTask(id);
}

export function deleteTask(id: string): boolean {
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return result.changes > 0;
}

export default db;
