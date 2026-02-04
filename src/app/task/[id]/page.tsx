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

  // Form state
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-2xl animate-pulse">🦞</div>
      </div>
    );
  }

  if (!task) return null;

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-950"
    >
      {/* Header */}
      <header className={`bg-gradient-to-r ${project?.gradient || 'from-gray-400 to-gray-500'} p-4 pt-12`}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="text-white text-lg">
            ← Назад
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleComplete}
              className="px-4 py-2 bg-white/20 rounded-xl text-white"
            >
              ✅ Done
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500/50 rounded-xl text-white"
            >
              🗑️
            </button>
          </div>
        </div>
        <div className="text-white/80 text-sm">
          {project?.emoji} {project?.name}
        </div>
      </header>

      {/* Form */}
      <div className="p-4 space-y-4">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Заголовок"
          className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 dark:text-white text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Опис задачі..."
          rows={4}
          className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />

        {/* Assignee */}
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            👤 Виконавець
          </label>
          <div className="flex gap-2">
            {USERS.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => setAssigneeId(user.id)}
                className={`
                  flex-1 p-3 rounded-xl text-center transition-all
                  ${assigneeId === user.id 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white dark:bg-gray-800 dark:text-white'}
                `}
              >
                {user.emoji} {user.name}
              </button>
            ))}
          </div>
        </div>

        {/* Project */}
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            📁 Проект
          </label>
          <div className="flex flex-wrap gap-2">
            {projects.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProjectId(p.id)}
                className={`
                  px-4 py-2 rounded-xl transition-all
                  ${projectId === p.id 
                    ? `bg-gradient-to-r ${p.gradient} text-white` 
                    : 'bg-white dark:bg-gray-800 dark:text-white'}
                `}
              >
                {p.emoji} {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            📅 Дедлайн
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Metadata */}
        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p>📆 Створено: {new Date(task.createdAt).toLocaleString('uk-UA')}</p>
          {task.closedAt && (
            <p>✅ Закрито: {new Date(task.closedAt).toLocaleString('uk-UA')}</p>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Зберігаю...' : 'Зберегти 💾'}
        </button>
      </div>
    </motion.main>
  );
}
