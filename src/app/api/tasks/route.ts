import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getTasksInGroup, createTask } from '@/lib/monday';
import { parseTask } from '@/lib/types';

export async function GET(request: Request) {
  // Check auth (session or API key)
  const session = await auth();
  const apiKey = request.headers.get('x-api-key');
  const expectedKey = process.env.API_SECRET_KEY;

  if (!session && !(apiKey && apiKey === expectedKey)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('group');

    if (!groupId) {
      return NextResponse.json(
        { error: 'Missing group parameter' },
        { status: 400 }
      );
    }

    const mondayTasks = await getTasksInGroup(groupId);
    const tasks = mondayTasks.map(parseTask);

    return NextResponse.json(tasks);
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Check auth (session or API key)
  const session = await auth();
  const apiKey = request.headers.get('x-api-key');
  const expectedKey = process.env.API_SECRET_KEY;

  if (!session && !(apiKey && apiKey === expectedKey)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, groupId, priority, project, deadline } = body;

    if (!name || !groupId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, groupId' },
        { status: 400 }
      );
    }

    // Build column values
    const columnValues: Record<string, any> = {};

    if (priority) {
      // Priority mapping: High=0, Medium=1, Low=2
      const priorityIndex = priority === 'High' ? 0 : priority === 'Medium' ? 1 : 2;
      columnValues.color_mm0mx10q = { index: priorityIndex };
    }

    if (project) {
      columnValues.color_mm0mv81k = { label: project };
    }

    if (deadline) {
      columnValues.date4 = { date: deadline };
    }

    const mondayTask = await createTask(name, groupId, columnValues);
    const task = parseTask(mondayTask);

    return NextResponse.json(task);
  } catch (error: any) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create task' },
      { status: 500 }
    );
  }
}
