import { createClient } from '@libsql/client';
import { type Project, type Task } from './types';
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

let initPromise: Promise<void> | null = null;

async function init() {
  // Projects table with userId
  await client.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL,
      gradient TEXT NOT NULL,
      userId TEXT
    )
  `);

  // Tasks table with userId
  await client.execute(`
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
      userId TEXT,
      FOREIGN KEY (projectId) REFERENCES projects(id)
    )
  `);

  // Add userId column if it doesn't exist (migration)
  try {
    await client.execute('ALTER TABLE projects ADD COLUMN userId TEXT');
  } catch (e) {
    // Column already exists
  }
  
  try {
    await client.execute('ALTER TABLE tasks ADD COLUMN userId TEXT');
  } catch (e) {
    // Column already exists
  }

  console.log('[db] Initialized successfully');
}

async function ensureInit() {
  if (!initPromise) {
    initPromise = init();
  }
  await initPromise;
}

// Project queries
export async function getProjects(userId?: string): Promise<Project[]> {
  await ensureInit();
  if (userId) {
    const { rows } = await client.execute({
      sql: 'SELECT * FROM projects WHERE userId = ? ORDER BY name',
      args: [userId],
    });
    return rows as unknown as Project[];
  }
  const { rows } = await client.execute('SELECT * FROM projects ORDER BY name');
  return rows as unknown as Project[];
}

export async function getProject(id: string): Promise<Project | undefined> {
  await ensureInit();
  const { rows } = await client.execute({
    sql: 'SELECT * FROM projects WHERE id = ? LIMIT 1',
    args: [id],
  });
  return (rows[0] as unknown as Project) || undefined;
}

export async function createProject(project: Omit<Project, 'id'>, userId?: string): Promise<Project> {
  await ensureInit();
  const id = randomUUID();
  await client.execute({
    sql: 'INSERT INTO projects (id, name, emoji, gradient, userId) VALUES (?, ?, ?, ?, ?)',
    args: [id, project.name, project.emoji, project.gradient, userId || null],
  });
  return { id, ...project };
}

export async function deleteProject(id: string): Promise<boolean> {
  await ensureInit();
  // First delete all tasks in this project
  await client.execute({
    sql: 'DELETE FROM tasks WHERE projectId = ?',
    args: [id],
  });
  const result = await client.execute({
    sql: 'DELETE FROM projects WHERE id = ?',
    args: [id],
  });
  return (result.rowsAffected ?? 0) > 0;
}

// Task queries
export async function getTasks(status?: 'todo' | 'done', projectId?: string, userId?: string): Promise<Task[]> {
  await ensureInit();
  
  let sql = 'SELECT * FROM tasks WHERE 1=1';
  const args: (string | null)[] = [];
  
  if (status) {
    sql += ' AND status = ?';
    args.push(status);
  }
  if (projectId) {
    sql += ' AND projectId = ?';
    args.push(projectId);
  }
  if (userId) {
    sql += ' AND userId = ?';
    args.push(userId);
  }
  
  sql += ' ORDER BY createdAt DESC';
  
  const { rows } = await client.execute({ sql, args });
  return rows as unknown as Task[];
}

export async function getTask(id: string): Promise<Task | undefined> {
  await ensureInit();
  const { rows } = await client.execute({
    sql: 'SELECT * FROM tasks WHERE id = ? LIMIT 1',
    args: [id],
  });
  return (rows[0] as unknown as Task) || undefined;
}

export async function createTask(
  task: Omit<Task, 'id' | 'createdAt' | 'closedAt' | 'status'>,
  userId?: string
): Promise<Task> {
  await ensureInit();
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  await client.execute({
    sql: `
      INSERT INTO tasks (id, title, description, assigneeId, projectId, deadline, status, createdAt, userId)
      VALUES (?, ?, ?, ?, ?, ?, 'todo', ?, ?)
    `,
    args: [id, task.title, task.description || '', task.assigneeId, task.projectId, task.deadline || null, createdAt, userId || null],
  });
  return { id, ...task, description: task.description || '', status: 'todo', createdAt, closedAt: null };
}

export async function updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task | undefined> {
  await ensureInit();
  const task = await getTask(id);
  if (!task) return undefined;

  const fields: string[] = [];
  const values: (string | null)[] = [];

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
    values,
  );
  return await getTask(id);
}

export async function deleteTask(id: string): Promise<boolean> {
  await ensureInit();
  const result = await client.execute({
    sql: 'DELETE FROM tasks WHERE id = ?',
    args: [id],
  });
  return (result.rowsAffected ?? 0) > 0;
}

export default client;
