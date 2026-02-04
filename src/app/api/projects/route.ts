import { NextRequest, NextResponse } from 'next/server';
import { getProjects, createProject } from '@/lib/db';

export async function GET() {
  const projects = getProjects();
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, emoji, gradient } = body;

  if (!name || !emoji || !gradient) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const project = createProject({ name, emoji, gradient });
  return NextResponse.json(project, { status: 201 });
}
