'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import GroupRow from '@/components/GroupRow';
import { Group } from '@/lib/types';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchGroups();
    }
  }, [status]);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups');
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,hsl(210,85%,35%)_0%,hsl(210,85%,55%)_100%)] flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,hsl(210,85%,35%)_0%,hsl(210,85%,55%)_100%)]">
      <div className="min-h-screen">
        <div className="px-5 pt-12 pb-6">
          <h1 className="text-white text-[28px] font-bold leading-tight">My Lists</h1>
        </div>

        {groups.map((group, index) => (
          <GroupRow
            key={group.id}
            group={group}
            index={index}
            totalGroups={groups.length}
          />
        ))}
      </div>
    </div>
  );
}
