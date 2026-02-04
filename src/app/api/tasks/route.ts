import { NextRequest, NextResponse } from 'next/server';
import { getTasks, createTask } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as 'todo' | 'done' | null;
  const tasks = await getTasks(status || undefined);
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, description, assigneeId, projectId, deadline } = body;

  if (!title || !assigneeId || !projectId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const task = await createTask({ title, description, assigneeId, projectId, deadline });
  return NextResponse.json(task, { status: 201 });
}
