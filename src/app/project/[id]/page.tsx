'use client';

import { useState, useEffect, useCallback, useRef, use } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Task, Project, USERS } from '@/lib/types';

// Red-orange gradient for tasks (like Clear's task list)
function getHeatGradient(index: number, total: number): string {
  const ratio = total > 1 ? index / (total - 1) : 0;
  // Red (0) -> Orange (30) -> Yellow-Orange (45)
  const hue = ratio * 45;
  const saturation = 85 - ratio * 10;
  const lightness = 50 + ratio * 5;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

interface TaskItemProps {
  task: Task;
  index: number;
  total: number;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onTap: (id: string) => void;
}

function TaskItem({ task, index, total, onComplete, onDelete, onTap }: TaskItemProps) {
  const [dragX, setDragX] = useState(0);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      onComplete(task.id);
    } else if (info.offset.x < -100) {
      onDelete(task.id);
    }
    setDragX(0);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
      className="relative overflow-hidden"
    >
      {/* Swipe backgrounds */}
      <div className="absolute inset-0 flex">
        <div className="flex-1 bg-green-500 flex items-center pl-6">
          <span className="text-white text-xl">✓</span>
        </div>
        <div className="flex-1 bg-red-600 flex items-center justify-end pr-6">
          <span className="text-white text-xl">✕</span>
        </div>
      </div>

      {/* Task item */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        onDrag={(_, info) => setDragX(info.offset.x)}
        onDragEnd={handleDragEnd}
        onClick={() => onTap(task.id)}
        style={{ backgroundColor: getHeatGradient(index, total) }}
        className="relative px-5 py-5 cursor-grab active:cursor-grabbing"
      >
        <span className="text-white font-medium text-lg">
          {task.title}
        </span>
      </motion.div>
    </motion.div>
  );
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const threshold = 60;

  const fetchData = useCallback(async () => {
    const [projectsRes, tasksRes] = await Promise.all([
      fetch('/api/projects'),
      fetch('/api/tasks?status=todo'),
    ]);
    const [projectsData, tasksData] = await Promise.all([
      projectsRes.json(),
      tasksRes.json(),
    ]);
    
    const currentProject = projectsData.find((p: Project) => p.id === id);
    const projectTasks = tasksData.filter((t: Task) => t.projectId === id);
    
    setProject(currentProject || null);
    setTasks(projectTasks);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  // Pull-to-create
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop <= 0 && !isCreating) {
      startY.current = e.touches[0].clientY;
    }
  }, [isCreating]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isCreating || startY.current === 0) return;
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop > 0) return;

    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) {
      e.preventDefault();
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

  const handleCreateTask = async () => {
    if (newTitle.trim() && project) {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: '',
          assigneeId: USERS[0].id,
          projectId: project.id,
          deadline: null,
        }),
      });
      const newTask = await res.json();
      setTasks([newTask, ...tasks]);
    }
    setNewTitle('');
    setIsCreating(false);
  };

  const handleComplete = async (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' }),
    });
  };

  const handleDelete = async (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
  };

  const handleTapTask = (taskId: string) => {
    window.location.href = `/task/${taskId}`;
  };

  const handleBack = () => {
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'hsl(15, 85%, 50%)' }}>
        <div className="text-4xl animate-pulse text-white">●●●</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Проект не знайдено</div>
      </div>
    );
  }

  const bgColor = tasks.length > 0 ? getHeatGradient(tasks.length - 1, tasks.length) : 'hsl(0, 85%, 50%)';

  return (
    <div
      ref={containerRef}
      className="min-h-screen overflow-auto"
      style={{ backgroundColor: bgColor }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <motion.div
        className="flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: 'hsl(0, 85%, 45%)' }}
        animate={{ height: isCreating ? 0 : pullDistance }}
      >
        <span className="text-white/70 text-sm">
          {pullDistance >= threshold ? 'Відпусти' : 'Потягни вниз'}
        </span>
      </motion.div>

      {/* New task input */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ backgroundColor: 'hsl(0, 85%, 45%)' }}
            className="px-5 py-5"
          >
            <input
              ref={inputRef}
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateTask();
                if (e.key === 'Escape') { setIsCreating(false); setNewTitle(''); }
              }}
              onBlur={handleCreateTask}
              placeholder="Нова задача..."
              className="w-full bg-transparent text-white placeholder-white/50 text-xl font-medium outline-none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <button onClick={handleBack} className="text-white/70 text-sm mb-2 block">
          ← My Lists
        </button>
        <h1 className="text-white font-bold text-4xl">{project.name}</h1>
      </div>

      {/* Task list */}
      <div>
        <AnimatePresence mode="popLayout">
          {tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 text-white/50"
            >
              <p>Потягни вниз щоб додати задачу</p>
            </motion.div>
          ) : (
            tasks.map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                index={index}
                total={tasks.length}
                onComplete={handleComplete}
                onDelete={handleDelete}
                onTap={handleTapTask}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Hint */}
      {tasks.length > 0 && (
        <div className="text-center py-6 text-white/40 text-xs">
          ← видалити • завершити →
        </div>
      )}

      {/* Bottom padding */}
      <div className="h-20" style={{ backgroundColor: 'hsl(0, 0%, 5%)' }} />
    </div>
  );
}
