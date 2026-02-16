import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getTask, updateTask, deleteTask, moveTaskToGroup } from '@/lib/monday';
import { parseTask } from '@/lib/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const apiKey = request.headers.get('x-api-key');
  const expectedKey = process.env.API_SECRET_KEY;

  if (!session && !(apiKey && apiKey === expectedKey)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const mondayTask = await getTask(id);
    const task = parseTask(mondayTask);
    return NextResponse.json(task);
  } catch (error: any) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const apiKey = request.headers.get('x-api-key');
  const expectedKey = process.env.API_SECRET_KEY;

  if (!session && !(apiKey && apiKey === expectedKey)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, priority, project, deadline, status, description, moveToGroup } = body;

    // Handle moving to a different group
    if (moveToGroup) {
      await moveTaskToGroup(id, moveToGroup);
    }

    // Build column values for update
    const columnValues: Record<string, any> = {};

    if (name !== undefined) {
      columnValues.name = name;
    }

    if (priority !== undefined) {
      const priorityIndex = priority === 'High' ? 0 : priority === 'Medium' ? 1 : 2;
      columnValues.color_mm0mx10q = { index: priorityIndex };
    }

    if (project !== undefined) {
      columnValues.color_mm0mv81k = { label: project };
    }

    if (deadline !== undefined) {
      columnValues.date4 = { date: deadline };
    }

    if (status !== undefined) {
      columnValues.status = { label: status };
    }

    if (description !== undefined) {
      columnValues.text_mkqzaznf = description;
    }

    // Only update if there are column values to change
    if (Object.keys(columnValues).length > 0) {
      const mondayTask = await updateTask(id, columnValues);
      const task = parseTask(mondayTask);
      return NextResponse.json(task);
    }

    // If only moving group, fetch and return the task
    const mondayTask = await getTask(id);
    const task = parseTask(mondayTask);
    return NextResponse.json(task);
  } catch (error: any) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const apiKey = request.headers.get('x-api-key');
  const expectedKey = process.env.API_SECRET_KEY;

  if (!session && !(apiKey && apiKey === expectedKey)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await deleteTask(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete task' },
      { status: 500 }
    );
  }
}
