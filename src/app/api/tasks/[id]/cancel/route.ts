import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { moveTaskToGroup } from '@/lib/monday';

const CANCELED_GROUP_ID = 'group_mm0m3wrz'; // ❌ Canceled

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
    await moveTaskToGroup(id, CANCELED_GROUP_ID);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error canceling task:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel task' },
      { status: 500 }
    );
  }
}
