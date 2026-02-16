'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TaskRow from '@/components/TaskRow';
import PullToCreate from '@/components/PullToCreate';
import { Task } from '@/lib/types';

export default function GroupPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupTitle, setGroupTitle] = useState('');

  useEffect(() => {
    fetchTasks();
  }, [groupId]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/tasks?group=${groupId}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
        if (data.length > 0) {
          setGroupTitle(data[0].groupTitle);
        } else {
          const groupsResponse = await fetch('/api/groups');
          if (groupsResponse.ok) {
            const groups = await groupsResponse.json();
            const group = groups.find((g: any) => g.id === groupId);
            if (group) setGroupTitle(group.title);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (name: string) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, groupId }),
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleDone = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/done`, {
        method: 'POST',
      });

      if (response.ok) {
        setTasks(tasks.filter((t) => t.id !== taskId));
      }
    } catch (error) {
      console.error('Error marking task as done:', error);
    }
  };

  const handleCancel = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/cancel`, {
        method: 'POST',
      });

      if (response.ok) {
        setTasks(tasks.filter((t) => t.id !== taskId));
      }
    } catch (error) {
      console.error('Error canceling task:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,hsl(0,92%,50%)_0%,hsl(45,92%,56%)_100%)] flex items-center justify-center">
        <div className="text-white text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,hsl(0,92%,50%)_0%,hsl(45,92%,56%)_100%)]">
      <PullToCreate onCreateTask={handleCreateTask}>
        <div className="min-h-screen">
          <div className="min-h-[104px] px-5 pt-10 pb-6 flex items-center gap-4">
            <button onClick={() => router.push('/')} className="text-white text-3xl leading-none" aria-label="Back">
              ←
            </button>
            <h1 className="text-white text-3xl md:text-4xl font-semibold flex-1 leading-tight">{groupTitle}</h1>
            <span className="text-white/80 text-xl font-semibold">{tasks.length}</span>
          </div>

          {tasks.map((task, index) => (
            <TaskRow
              key={task.id}
              task={task}
              index={index}
              totalTasks={tasks.length}
              onDone={handleDone}
              onCancel={handleCancel}
            />
          ))}

          {tasks.length === 0 && <div className="text-center py-20 text-white/70 text-lg">No tasks yet. Pull down to create one!</div>}
        </div>
      </PullToCreate>
    </div>
  );
}
