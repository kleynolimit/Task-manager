import { createClient } from '@libsql/client';
import { DEFAULT_PROJECTS, type Project, type Task } from './types';
import { randomUUID } from 'crypto';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.warn('[db] TURSO_DATABASE_URL or TURSO_AUTH_TOKEN is not set');
}

const client = createClient({
  url: url || 'file:local.db',
  authToken: authToken || undefined,
});

async function init() {
  await client.execute(`
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

  const { rows } = await client.execute('SELECT COUNT(*) as count FROM projects');
  const row = rows[0] as unknown as { count: number } | undefined;
  const count = row ? Number(row.count) : 0;
  if (count === 0) {
    for (const p of DEFAULT_PROJECTS) {
      await client.execute({
        sql: 'INSERT INTO projects (id, name, emoji, gradient) VALUES (?, ?, ?, ?)',
        args: [randomUUID(), p.name, p.emoji, p.gradient],
      });
    }
  }
}

// Run init once at module load (fire and forget)
init().catch((err) => {
  console.error('[db] init error', err);
});

// Project queries
export async function getProjects(): Promise<Project[]> {
  const { rows } = await client.execute('SELECT * FROM projects');
  return rows as unknown as Project[];
}

export async function createProject(project: Omit<Project, 'id'>): Promise<Project> {
  const id = randomUUID();
  await client.execute({
    sql: 'INSERT INTO projects (id, name, emoji, gradient) VALUES (?, ?, ?, ?)',
    args: [id, project.name, project.emoji, project.gradient],
  });
  return { id, ...project };
}

// Task queries
export async function getTasks(status?: 'todo' | 'done'): Promise<Task[]> {
  const result = status
    ? await client.execute({
        sql: 'SELECT * FROM tasks WHERE status = ? ORDER BY createdAt DESC',
        args: [status],
      })
    : await client.execute('SELECT * FROM tasks ORDER BY createdAt DESC');

  return result.rows as unknown as Task[];
}

export async function getTask(id: string): Promise<Task | undefined> {
  const { rows } = await client.execute({
    sql: 'SELECT * FROM tasks WHERE id = ? LIMIT 1',
    args: [id],
  });
  return (rows[0] as unknown as Task) || undefined;
}

export async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'closedAt' | 'status'>): Promise<Task> {
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  await client.execute({
    sql: `
      INSERT INTO tasks (id, title, description, assigneeId, projectId, deadline, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, 'todo', ?)
    `,
    args: [id, task.title, task.description || '', task.assigneeId, task.projectId, task.deadline || null, createdAt],
  });
  return { id, ...task, description: task.description || '', status: 'todo', createdAt, closedAt: null };
}

export async function updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task | undefined> {
  const task = await getTask(id);
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
  await client.execute(
    `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`,
    values as any,
  );
  return await getTask(id);
}

export async function deleteTask(id: string): Promise<boolean> {
  const result = await client.execute({
    sql: 'DELETE FROM tasks WHERE id = ?',
    args: [id],
  });
  return (result.rowsAffected ?? 0) > 0;
}

export default client;
