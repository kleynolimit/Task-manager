import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getProjects, createProject } from '@/lib/db';

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  
  const projects = await getProjects(userId);
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  
  const body = await request.json();
  const { name, emoji, gradient } = body;

  if (!name || !emoji || !gradient) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const project = await createProject({ name, emoji, gradient }, userId);
  return NextResponse.json(project, { status: 201 });
}
