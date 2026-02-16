'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Task } from '@/lib/types';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`);
      if (response.ok) {
        const data = await response.json();
        setTask(data);
        setEditedTask(data);
      }
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedTask),
      });

      if (response.ok) {
        const updated = await response.json();
        setTask(updated);
        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  if (loading || !task) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-500 to-purple-700 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-500 to-purple-700">
      {/* Header */}
      <div className="bg-purple-600/50 backdrop-blur-sm border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-white text-2xl"
        >
          ←
        </button>
        <h1 className="text-white text-2xl font-bold flex-1">Task Details</h1>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="text-white text-lg"
          >
            Edit
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="text-white text-lg font-bold"
          >
            Save
          </button>
        )}
      </div>

      {/* Task details */}
      <div className="p-6 space-y-6">
        {/* Name */}
        <div>
          <label className="text-white/70 text-sm mb-2 block">Name</label>
          {editing ? (
            <input
              type="text"
              value={editedTask.name || ''}
              onChange={(e) => setEditedTask({ ...editedTask, name: e.target.value })}
              className="w-full bg-white/20 text-white px-4 py-3 rounded-lg border-none outline-none"
            />
          ) : (
            <div className="text-white text-xl font-medium">{task.name}</div>
          )}
        </div>

        {/* Priority */}
        <div>
          <label className="text-white/70 text-sm mb-2 block">Priority</label>
          {editing ? (
            <select
              value={editedTask.priority || ''}
              onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as any })}
              className="w-full bg-white/20 text-white px-4 py-3 rounded-lg border-none outline-none"
            >
              <option value="">None</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          ) : (
            <div className="text-white text-lg">{task.priority || 'None'}</div>
          )}
        </div>

        {/* Project */}
        <div>
          <label className="text-white/70 text-sm mb-2 block">Project</label>
          {editing ? (
            <input
              type="text"
              value={editedTask.project || ''}
              onChange={(e) => setEditedTask({ ...editedTask, project: e.target.value })}
              className="w-full bg-white/20 text-white px-4 py-3 rounded-lg border-none outline-none"
            />
          ) : (
            <div className="text-white text-lg">{task.project || 'None'}</div>
          )}
        </div>

        {/* Deadline */}
        <div>
          <label className="text-white/70 text-sm mb-2 block">Deadline</label>
          {editing ? (
            <input
              type="date"
              value={editedTask.deadline || ''}
              onChange={(e) => setEditedTask({ ...editedTask, deadline: e.target.value })}
              className="w-full bg-white/20 text-white px-4 py-3 rounded-lg border-none outline-none"
            />
          ) : (
            <div className="text-white text-lg">{task.deadline || 'None'}</div>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="text-white/70 text-sm mb-2 block">Status</label>
          <div className="text-white text-lg">{task.status || 'None'}</div>
        </div>

        {/* Description */}
        <div>
          <label className="text-white/70 text-sm mb-2 block">Description</label>
          {editing ? (
            <textarea
              value={editedTask.description || ''}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              className="w-full bg-white/20 text-white px-4 py-3 rounded-lg border-none outline-none min-h-[100px]"
            />
          ) : (
            <div className="text-white text-lg whitespace-pre-wrap">{task.description || 'None'}</div>
          )}
        </div>

        {/* Group */}
        <div>
          <label className="text-white/70 text-sm mb-2 block">List</label>
          <div className="text-white text-lg">{task.groupTitle}</div>
        </div>
      </div>
    </div>
  );
}
