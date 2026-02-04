'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TaskCard from '@/components/TaskCard';
import NewTaskForm from '@/components/NewTaskForm';
import { Task, Project, USERS } from '@/lib/types';
import Link from 'next/link';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterAssignee, setFilterAssignee] = useState<string | null>(null);
  const [filterProject, setFilterProject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [tasksRes, projectsRes] = await Promise.all([
      fetch('/api/tasks?status=todo'),
      fetch('/api/projects'),
    ]);
    const [tasksData, projectsData] = await Promise.all([
      tasksRes.json(),
      projectsRes.json(),
    ]);
    setTasks(tasksData);
    setProjects(projectsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleComplete = async (id: string) => {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' }),
    });
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleCreate = async (taskData: {
    title: string;
    description: string;
    assigneeId: string;
    projectId: string;
    deadline: string | null;
  }) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    const newTask = await res.json();
    setTasks([newTask, ...tasks]);
  };

  const filteredTasks = tasks.filter(task => {
    if (filterAssignee && task.assigneeId !== filterAssignee) return false;
    if (filterProject && task.projectId !== filterProject) return false;
    return true;
  });

  const getProject = (id: string) => projects.find(p => p.id === id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-2xl animate-pulse">🦞</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold dark:text-white">📥 Inbox</h1>
            <Link 
              href="/history" 
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              📜 Історія
            </Link>
          </div>

          {/* Assignee filter */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterAssignee(null)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                filterAssignee === null 
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' 
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Усі
            </button>
            {USERS.map(user => (
              <button
                key={user.id}
                onClick={() => setFilterAssignee(filterAssignee === user.id ? null : user.id)}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                  filterAssignee === user.id 
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' 
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {user.emoji} {user.name}
              </button>
            ))}
          </div>

          {/* Project filter */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterProject(null)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                filterProject === null 
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' 
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Усі проекти
            </button>
            {projects.map(project => (
              <button
                key={project.id}
                onClick={() => setFilterProject(filterProject === project.id ? null : project.id)}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                  filterProject === project.id 
                    ? `bg-gradient-to-r ${project.gradient} text-white` 
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {project.emoji} {project.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Task list */}
      <div className="px-4 pt-4">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 text-gray-400 dark:text-gray-600"
            >
              <div className="text-5xl mb-4">🎉</div>
              <p>Усі задачі виконано!</p>
            </motion.div>
          ) : (
            filteredTasks.map(task => {
              const project = getProject(task.projectId);
              if (!project) return null;
              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 300 }}
                >
                  <TaskCard
                    task={task}
                    project={project}
                    onComplete={handleComplete}
                    onDelete={handleDelete}
                  />
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* FAB */}
      <button
        onClick={() => setIsFormOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl shadow-lg active:scale-95 transition-transform z-30"
      >
        +
      </button>

      {/* New task form */}
      <NewTaskForm
        projects={projects}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreate}
      />
    </main>
  );
}
