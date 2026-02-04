'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Task, Project, USERS } from '@/lib/types';

// Clear-style gradient based on position
function getGradient(index: number, total: number): string {
  const ratio = total > 1 ? index / (total - 1) : 0;
  
  if (ratio < 0.33) {
    // Red to Orange
    return `linear-gradient(135deg, hsl(${0 + ratio * 30}, 85%, 55%), hsl(${10 + ratio * 30}, 85%, 50%))`;
  } else if (ratio < 0.66) {
    // Orange to Yellow
    return `linear-gradient(135deg, hsl(${30 + (ratio - 0.33) * 60}, 85%, 55%), hsl(${40 + (ratio - 0.33) * 60}, 85%, 50%))`;
  } else {
    // Yellow to Green
    return `linear-gradient(135deg, hsl(${60 + (ratio - 0.66) * 80}, 70%, 50%), hsl(${80 + (ratio - 0.66) * 80}, 70%, 45%))`;
  }
}

interface ClearTaskProps {
  task: Task;
  index: number;
  total: number;
  project?: Project;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onTap: (id: string) => void;
}

function ClearTask({ task, index, total, project, onComplete, onDelete, onTap }: ClearTaskProps) {
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-150, 0, 150],
    ['#ef4444', getGradient(index, total), '#22c55e']
  );
  const assignee = USERS.find(u => u.id === task.assigneeId);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      onComplete(task.id);
    } else if (info.offset.x < -100) {
      onDelete(task.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
      className="relative overflow-hidden"
    >
      {/* Background indicators */}
      <div className="absolute inset-0 flex">
        <div className="flex-1 bg-green-500 flex items-center pl-4">
          <span className="text-white text-xl">✓</span>
        </div>
        <div className="flex-1 bg-red-500 flex items-center justify-end pr-4">
          <span className="text-white text-xl">✕</span>
        </div>
      </div>

      {/* Task card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        style={{ x, background: getGradient(index, total) }}
        onClick={() => onTap(task.id)}
        className="relative px-4 py-4 cursor-grab active:cursor-grabbing touch-pan-y"
      >
        {/* Project indicator - thin line on left */}
        {project && (
          <div 
            className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${project.gradient}`}
          />
        )}

        <div className="flex items-center justify-between">
          <span className="text-white font-medium text-lg flex-1 pr-2">
            {task.title}
          </span>
          
          {/* Assignee */}
          <span className="text-white/70 text-sm">
            {assignee?.emoji}
          </span>
        </div>

        {/* Deadline if exists */}
        {task.deadline && (
          <div className="text-white/60 text-xs mt-1">
            📅 {new Date(task.deadline).toLocaleDateString('uk-UA')}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

interface NewTaskInputProps {
  onSubmit: (title: string) => void;
  onCancel: () => void;
  autoFocus?: boolean;
}

function NewTaskInput({ onSubmit, onCancel, autoFocus }: NewTaskInputProps) {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit(title.trim());
      setTitle('');
    } else {
      onCancel();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="bg-gradient-to-r from-red-500 to-orange-500 px-4 py-4">
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
            if (e.key === 'Escape') onCancel();
          }}
          onBlur={handleSubmit}
          placeholder="Нова задача..."
          className="w-full bg-transparent text-white placeholder-white/50 text-lg font-medium outline-none"
        />
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const threshold = 60;

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

  // Pull-to-create
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0 && !isCreating) {
      startY.current = e.touches[0].clientY;
    }
  }, [isCreating]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isCreating) return;
    if (containerRef.current?.scrollTop !== 0) return;
    if (startY.current === 0) return;

    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.5, threshold * 1.5));
    }
  }, [isCreating]);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance >= threshold) {
      setIsCreating(true);
    }
    setPullDistance(0);
    startY.current = 0;
  }, [pullDistance]);

  const handleComplete = async (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' }),
    });
  };

  const handleDelete = async (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  };

  const handleCreateQuick = async (title: string) => {
    setIsCreating(false);
    const defaultProject = projects[0];
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description: '',
        assigneeId: USERS[0].id, // Default to first user (Pavlo)
        projectId: defaultProject?.id || '',
        deadline: null,
      }),
    });
    const newTask = await res.json();
    setTasks([newTask, ...tasks]);
  };

  const handleTap = (id: string) => {
    // Could open detail view
    window.location.href = `/task/${id}`;
  };

  const getProject = (id: string) => projects.find(p => p.id === id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-500 to-orange-500">
        <div className="text-4xl animate-pulse">🦞</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gray-900 overflow-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <motion.div
        className="flex items-center justify-center bg-gradient-to-r from-red-500 to-orange-500 overflow-hidden"
        animate={{ height: isCreating ? 0 : pullDistance }}
      >
        <motion.span
          className="text-white/80 text-sm"
          animate={{ opacity: pullDistance > threshold * 0.5 ? 1 : 0 }}
        >
          {pullDistance >= threshold ? '↓ Відпусти' : '↓ Потягни для нової задачі'}
        </motion.span>
      </motion.div>

      {/* New task input */}
      <AnimatePresence>
        {isCreating && (
          <NewTaskInput
            onSubmit={handleCreateQuick}
            onCancel={() => setIsCreating(false)}
            autoFocus
          />
        )}
      </AnimatePresence>

      {/* Header - minimal */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur px-4 py-3 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-white font-semibold text-lg">
          {tasks.length > 0 ? `${tasks.length} задач` : 'Inbox'}
        </h1>
        <a href="/history" className="text-gray-400 text-sm hover:text-white">
          Історія →
        </a>
      </div>

      {/* Task list */}
      <div className="divide-y divide-black/10">
        <AnimatePresence mode="popLayout">
          {tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 text-gray-500"
            >
              <div className="text-4xl mb-3">🎉</div>
              <p>Все зроблено!</p>
              <p className="text-sm mt-2 text-gray-600">Потягни вниз щоб додати задачу</p>
            </motion.div>
          ) : (
            tasks.map((task, index) => (
              <ClearTask
                key={task.id}
                task={task}
                index={index}
                total={tasks.length}
                project={getProject(task.projectId)}
                onComplete={handleComplete}
                onDelete={handleDelete}
                onTap={handleTap}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Hint at bottom */}
      {tasks.length > 0 && (
        <div className="text-center py-6 text-gray-600 text-xs">
          ← свайп видалити • свайп завершити →
        </div>
      )}
    </div>
  );
}
