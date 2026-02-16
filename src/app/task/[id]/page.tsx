'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Task } from '@/lib/types';

const PROJECT_OPTIONS = [
  'CDS',
  'EXPEDITE',
  'CDT',
  'Suntrans Expedite',
  'LAX Freight',
  'Logity Tech',
  'Logity Digital',
  'Logity',
  'Landstar',
  'TMA',
  'LBOARD',
  'NTL',
  'APEX',
  'AETNA',
  'CDD',
  'Truxx.AI',
];

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
      <div className="min-h-screen bg-[linear-gradient(180deg,hsl(0,85%,50%)_0%,hsl(45,80%,55%)_100%)] flex items-center justify-center">
        <div className="text-white text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,hsl(0,85%,50%)_0%,hsl(45,80%,55%)_100%)]">
      {/* Header */}
      <div className="px-5 pt-[calc(2.5rem+env(safe-area-inset-top))] pb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-white text-4xl leading-none"
        >
          ←
        </button>
        <h1 className="text-white text-[32px] font-extrabold flex-1 leading-tight">Task</h1>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="text-white text-xl font-bold"
          >
            Edit
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="text-white text-xl font-extrabold"
          >
            Save
          </button>
        )}
      </div>

      {/* Task details */}
      <div className="px-5 pb-8 space-y-6">
        {/* Name */}
        <div>
          <label className="text-white/60 text-base mb-2 block font-semibold">Name</label>
          {editing ? (
            <input
              type="text"
              value={editedTask.name || ''}
              onChange={(e) => setEditedTask({ ...editedTask, name: e.target.value })}
              className="w-full bg-white/10 text-white text-[22px] font-semibold placeholder-white/50 px-4 py-3 rounded-xl border-none outline-none"
            />
          ) : (
            <div className="text-white text-[24px] font-bold">{task.name}</div>
          )}
        </div>

        {/* Priority */}
        <div>
          <label className="text-white/60 text-base mb-2 block font-semibold">Priority</label>
          {editing ? (
            <select
              value={editedTask.priority || ''}
              onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as any })}
              className="w-full bg-white/10 text-white text-[20px] font-semibold px-4 py-3 rounded-xl border-none outline-none"
            >
              <option value="">None</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          ) : (
            <div className="text-white text-[20px] font-semibold">{task.priority || 'None'}</div>
          )}
        </div>

        {/* Project */}
        <div>
          <label className="text-white/60 text-base mb-2 block font-semibold">Project</label>
          {editing ? (
            <select
              value={editedTask.project || ''}
              onChange={(e) => setEditedTask({ ...editedTask, project: e.target.value })}
              className="w-full bg-white/10 text-white text-[20px] font-semibold px-4 py-3 rounded-xl border-none outline-none"
            >
              <option value="">None</option>
              {PROJECT_OPTIONS.map((project) => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-white text-[20px] font-semibold">{task.project || 'None'}</div>
          )}
        </div>

        {/* Deadline */}
        <div>
          <label className="text-white/60 text-base mb-2 block font-semibold">Deadline</label>
          {editing ? (
            <input
              type="date"
              value={editedTask.deadline || ''}
              onChange={(e) => setEditedTask({ ...editedTask, deadline: e.target.value })}
              className="w-full bg-white/10 text-white text-[20px] font-semibold px-4 py-3 rounded-xl border-none outline-none"
            />
          ) : (
            <div className="text-white text-[20px] font-semibold">{task.deadline || 'None'}</div>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="text-white/60 text-base mb-2 block font-semibold">Status</label>
          <div className="text-white text-[20px] font-semibold">{task.status || 'None'}</div>
        </div>

        {/* Description */}
        <div>
          <label className="text-white/60 text-base mb-2 block font-semibold">Description</label>
          {editing ? (
            <textarea
              value={editedTask.description || ''}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              className="w-full bg-white/10 text-white text-[18px] font-medium placeholder-white/50 px-4 py-3 rounded-xl border-none outline-none min-h-[120px]"
            />
          ) : (
            <div className="text-white text-[18px] font-medium whitespace-pre-wrap">{task.description || 'None'}</div>
          )}
        </div>

        {/* Group */}
        <div>
          <label className="text-white/60 text-base mb-2 block font-semibold">List</label>
          <div className="text-white text-[20px] font-semibold">{task.groupTitle}</div>
        </div>
      </div>
    </div>
  );
}
