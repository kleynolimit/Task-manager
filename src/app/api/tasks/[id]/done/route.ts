import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { moveTaskToGroup } from '@/lib/monday';

const DONE_GROUP_ID = 'new_group_mkmkw2gr'; // ✅ Done Pavlo

export async function POST(
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
    await moveTaskToGroup(id, DONE_GROUP_ID);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error marking task as done:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to mark task as done' },
      { status: 500 }
    );
  }
}
