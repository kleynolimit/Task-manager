'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Task, Project, USERS } from '@/lib/types';
import { motion } from 'framer-motion';

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    async function fetchData() {
      const [taskRes, projectsRes] = await Promise.all([
        fetch(`/api/tasks/${id}`),
        fetch('/api/projects'),
      ]);
      
      if (!taskRes.ok) {
        router.push('/');
        return;
      }

      const [taskData, projectsData] = await Promise.all([
        taskRes.json(),
        projectsRes.json(),
      ]);

      setTask(taskData);
      setProjects(projectsData);
      setTitle(taskData.title);
      setDescription(taskData.description || '');
      setAssigneeId(taskData.assigneeId);
      setProjectId(taskData.projectId);
      setDeadline(taskData.deadline || '');
      setLoading(false);
    }
    fetchData();
  }, [id, router]);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        assigneeId,
        projectId,
        deadline: deadline || null,
      }),
    });
    setSaving(false);
    router.push('/');
  };

  const handleComplete = async () => {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' }),
    });
    router.push('/');
  };

  const handleDelete = async () => {
    if (confirm('Видалити задачу?')) {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      router.push('/');
    }
  };

  const project = projects.find(p => p.id === projectId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-4xl animate-pulse">🦞</div>
      </div>
    );
  }

  if (!task) return null;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-900"
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${project?.gradient || 'from-gray-600 to-gray-700'} px-4 py-4`}>
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="text-white/80 hover:text-white"
          >
            ← Назад
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleComplete}
              className="text-white/80 hover:text-white text-xl"
            >
              ✓
            </button>
            <button
              onClick={handleDelete}
              className="text-white/80 hover:text-red-300 text-xl"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 space-y-6">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Назва задачі"
          className="w-full bg-transparent text-white text-2xl font-semibold outline-none border-b border-gray-800 pb-2 focus:border-gray-600"
        />

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Опис..."
          rows={3}
          className="w-full bg-transparent text-gray-300 outline-none resize-none border-b border-gray-800 pb-2 focus:border-gray-600"
        />

        {/* Assignee */}
        <div>
          <label className="text-gray-500 text-sm mb-2 block">Виконавець</label>
          <div className="flex gap-2">
            {USERS.map((user) => (
              <button
                key={user.id}
                onClick={() => setAssigneeId(user.id)}
                className={`flex-1 py-3 rounded-lg text-center transition-all ${
                  assigneeId === user.id 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {user.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Project */}
        <div>
          <label className="text-gray-500 text-sm mb-2 block">Проект</label>
          <div className="flex flex-wrap gap-2">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => setProjectId(p.id)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  projectId === p.id 
                    ? `bg-gradient-to-r ${p.gradient} text-white` 
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {p.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Deadline */}
        <div>
          <label className="text-gray-500 text-sm mb-2 block">Дедлайн</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full bg-gray-800 text-white rounded-lg p-3 outline-none focus:ring-1 focus:ring-gray-600"
          />
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="w-full py-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold disabled:opacity-50"
        >
          {saving ? 'Зберігаю...' : 'Зберегти'}
        </button>
      </div>
    </motion.main>
  );
}
