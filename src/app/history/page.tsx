'use client';

import { useState, useEffect } from 'react';
import { Task, Project, USERS } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

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
    setTasks(tasks.filter(t => t.id !== id));
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'todo' }),
    });
  };

  const getProject = (id: string) => projects.find(p => p.id === id);
  const getAssignee = (id: string) => USERS.find(u => u.id === id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-4xl animate-pulse">🦞</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur px-4 py-3 flex justify-between items-center border-b border-gray-800">
        <a href="/" className="text-gray-400 hover:text-white">
          ← Назад
        </a>
        <h1 className="text-white font-semibold text-lg">
          Історія
        </h1>
        <div className="w-16" /> {/* Spacer */}
      </div>

      {/* Completed tasks */}
      <div>
        <AnimatePresence mode="popLayout">
          {tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 text-gray-500"
            >
              <div className="text-4xl mb-3">📭</div>
              <p>Немає завершених задач</p>
            </motion.div>
          ) : (
            tasks.map((task, index) => {
              const project = getProject(task.projectId);
              const assignee = getAssignee(task.assigneeId);
              
              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.03 }}
                  className="relative border-b border-gray-800"
                >
                  {/* Project indicator */}
                  {project && (
                    <div 
                      className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${project.gradient} opacity-50`}
                    />
                  )}

                  <div className="px-4 py-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-gray-400 line-through">
                          {task.title}
                        </span>
                        <span className="text-gray-600 text-sm">
                          {assignee?.emoji}
                        </span>
                      </div>
                      
                      {task.closedAt && (
                        <div className="text-gray-600 text-xs mt-1 ml-6">
                          {new Date(task.closedAt).toLocaleString('uk-UA')}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleReopen(task.id)}
                      className="text-gray-500 hover:text-white text-sm px-3 py-1 rounded hover:bg-gray-800 transition-colors"
                    >
                      ↩️
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
