import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getGroups, getTasksInGroup } from '@/lib/monday';
import { groupIdToEmoji } from '@/lib/types';

export async function GET(request: Request) {
  // Check auth (session or API key)
  const session = await auth();
  const apiKey = request.headers.get('x-api-key');
  const expectedKey = process.env.API_SECRET_KEY;

  if (!session && !(apiKey && apiKey === expectedKey)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const groups = await getGroups();
    
    // Get task counts for each group
    const groupsWithCounts = await Promise.all(
      groups.map(async (group) => {
        const tasks = await getTasksInGroup(group.id);
        return {
          id: group.id,
          title: group.title,
          color: group.color,
          emoji: groupIdToEmoji(group.id),
          taskCount: tasks.length,
        };
      })
    );

    return NextResponse.json(groupsWithCounts);
  } catch (error: any) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}
