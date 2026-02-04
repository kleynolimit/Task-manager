import { NextRequest, NextResponse } from 'next/server';
import { getTask, updateTask, deleteTask } from '@/lib/db';

type Params = Promise<{ id: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  const task = getTask(id);
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }
  return NextResponse.json(task);
}

export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  const body = await request.json();
  const task = updateTask(id, body);
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }
  return NextResponse.json(task);
}

export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  const deleted = deleteTask(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
