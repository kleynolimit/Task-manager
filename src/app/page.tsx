'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Project } from '@/lib/types';

// Blue gradient for lists (like Clear's My Lists)
function getBlueGradient(index: number, total: number): string {
  const ratio = total > 1 ? index / (total - 1) : 0;
  const hue = 210; // Blue
  const lightness = 45 + ratio * 15; // Darker at top, lighter at bottom
  return `hsl(${hue}, 85%, ${lightness}%)`;
}

interface ListItemProps {
  project: Project;
  index: number;
  total: number;
  taskCount: number;
  onTap: (id: string) => void;
  onDelete: (id: string) => void;
}

function ListItem({ project, index, total, taskCount, onTap, onDelete }: ListItemProps) {
  const [dragX, setDragX] = useState(0);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -100) {
      onDelete(project.id);
    }
    setDragX(0);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="relative overflow-hidden"
    >
      {/* Delete background */}
      <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-6">
        <span className="text-white text-xl">✕</span>
      </div>

      {/* List item */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.3}
        onDrag={(_, info) => setDragX(info.offset.x)}
        onDragEnd={handleDragEnd}
        animate={{ x: dragX < -100 ? -100 : 0 }}
        onClick={() => onTap(project.id)}
        style={{ backgroundColor: getBlueGradient(index, total) }}
        className="relative px-5 py-5 cursor-pointer active:opacity-90"
      >
        <div className="flex items-center justify-between">
          <span className="text-white font-semibold text-xl">
            {project.name}
          </span>
          {taskCount > 0 && (
            <span className="text-white/60 text-lg">
              {taskCount}
            </span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
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
    
    // Count tasks per project
    const counts: Record<string, number> = {};
    tasksData.forEach((task: any) => {
      counts[task.projectId] = (counts[task.projectId] || 0) + 1;
    });
    
    setProjects(projectsData);
    setTaskCounts(counts);
    setLoading(false);
  }, []);

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

  const handleCreateProject = async () => {
    if (newName.trim()) {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          emoji: '📋',
          gradient: 'from-blue-400 to-blue-600',
        }),
      });
      const newProject = await res.json();
      setProjects([newProject, ...projects]);
    }
    setNewName('');
    setIsCreating(false);
  };

  const handleDeleteProject = async (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    // Note: In production, you'd also delete associated tasks
  };

  const handleTapProject = (id: string) => {
    window.location.href = `/project/${id}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'hsl(210, 85%, 50%)' }}>
        <div className="text-4xl animate-pulse text-white">●●●</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen overflow-auto"
      style={{ backgroundColor: 'hsl(210, 85%, 55%)' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <motion.div
        className="flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: 'hsl(210, 85%, 40%)' }}
        animate={{ height: isCreating ? 0 : pullDistance }}
      >
        <span className="text-white/70 text-sm">
          {pullDistance >= threshold ? 'Відпусти' : 'Потягни вниз'}
        </span>
      </motion.div>

      {/* New project input */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ backgroundColor: 'hsl(210, 85%, 40%)' }}
            className="px-5 py-5"
          >
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateProject();
                if (e.key === 'Escape') { setIsCreating(false); setNewName(''); }
              }}
              onBlur={handleCreateProject}
              placeholder="Новий список..."
              className="w-full bg-transparent text-white placeholder-white/50 text-xl font-semibold outline-none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <h1 className="text-white font-bold text-4xl">My Lists</h1>
      </div>

      {/* Project list */}
      <div>
        <AnimatePresence mode="popLayout">
          {projects.map((project, index) => (
            <ListItem
              key={project.id}
              project={project}
              index={index}
              total={projects.length}
              taskCount={taskCounts[project.id] || 0}
              onTap={handleTapProject}
              onDelete={handleDeleteProject}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom padding */}
      <div className="h-20" />
    </div>
  );
}
