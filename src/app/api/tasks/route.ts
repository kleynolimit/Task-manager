import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getTasks, createTask } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as 'todo' | 'done' | null;
  const projectId = searchParams.get('projectId');
  
  const tasks = await getTasks(status || undefined, projectId || undefined, userId);
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  
  const body = await request.json();
  const { title, description, assigneeId, projectId, deadline } = body;

  if (!title || !assigneeId || !projectId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const task = await createTask({ title, description, assigneeId, projectId, deadline }, userId);
  return NextResponse.json(task, { status: 201 });
}
