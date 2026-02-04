import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getProject, deleteProject } from '@/lib/db';

type Params = Promise<{ id: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  const project = await getProject(id);
  
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }
  
  return NextResponse.json(project);
}

export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = await params;
  const deleted = await deleteProject(id);
  
  if (!deleted) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }
  
  return NextResponse.json({ success: true });
}
