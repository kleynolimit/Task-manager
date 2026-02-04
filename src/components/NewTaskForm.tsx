'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, USERS } from '@/lib/types';

interface NewTaskFormProps {
  projects: Project[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: {
    title: string;
    description: string;
    assigneeId: string;
    projectId: string;
    deadline: string | null;
  }) => void;
}

export default function NewTaskForm({ projects, isOpen, onClose, onSubmit }: NewTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState(USERS[0].id);
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      assigneeId,
      projectId,
      deadline: deadline || null,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setDeadline('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Form panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl z-50 p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-6" />
            
            <h2 className="text-xl font-bold mb-4 dark:text-white">➕ Нова задача</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <input
                type="text"
                placeholder="Що потрібно зробити?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                className="w-full p-4 rounded-xl bg-gray-100 dark:bg-gray-800 dark:text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Description */}
              <textarea
                placeholder="Опис (опціонально)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full p-4 rounded-xl bg-gray-100 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                          : 'bg-gray-100 dark:bg-gray-800 dark:text-white'}
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
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => setProjectId(project.id)}
                      className={`
                        px-4 py-2 rounded-xl transition-all
                        ${projectId === project.id 
                          ? `bg-gradient-to-r ${project.gradient} text-white` 
                          : 'bg-gray-100 dark:bg-gray-800 dark:text-white'}
                      `}
                    >
                      {project.emoji} {project.name}
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
                  className="w-full p-4 rounded-xl bg-gray-100 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!title.trim()}
                className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Створити ✨
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
