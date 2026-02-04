'use client';

import { useState, useEffect } from 'react';
import { Task, Project, USERS } from '@/lib/types';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HistoryPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [tasksRes, projectsRes] = await Promise.all([
        fetch('/api/tasks?status=done'),
        fetch('/api/projects'),
      ]);
      const [tasksData, projectsData] = await Promise.all([
        tasksRes.json(),
        projectsRes.json(),
      ]);
      // Sort by closedAt descending
      tasksData.sort((a: Task, b: Task) => {
        if (!a.closedAt || !b.closedAt) return 0;
        return new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime();
      });
      setTasks(tasksData);
      setProjects(projectsData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleReopen = async (id: string) => {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'todo' }),
    });
    setTasks(tasks.filter(t => t.id !== id));
  };

  const getProject = (id: string) => projects.find(p => p.id === id);
  const getAssignee = (id: string) => USERS.find(u => u.id === id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-2xl animate-pulse">🦞</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-8">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-500 dark:text-gray-400">
            ← Назад
          </Link>
          <h1 className="text-xl font-bold dark:text-white">📜 Історія</h1>
        </div>
      </header>

      {/* Task list */}
      <div className="px-4 pt-4">
        {tasks.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-600">
            <div className="text-5xl mb-4">📭</div>
            <p>Немає завершених задач</p>
          </div>
        ) : (
          tasks.map((task, index) => {
            const project = getProject(task.projectId);
            const assignee = getAssignee(task.assigneeId);
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="mb-3 p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Project & Assignee */}
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <span className={`px-2 py-0.5 rounded-full bg-gradient-to-r ${project?.gradient} text-white text-xs`}>
                        {project?.emoji} {project?.name}
                      </span>
                      <span>{assignee?.emoji} {assignee?.name}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-medium dark:text-white line-through opacity-60">
                      {task.title}
                    </h3>

                    {/* Closed date */}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      ✅ {task.closedAt && new Date(task.closedAt).toLocaleString('uk-UA')}
                    </p>
                  </div>

                  {/* Reopen button */}
                  <button
                    onClick={() => handleReopen(task.id)}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    ↩️ Відкрити
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </main>
  );
}
