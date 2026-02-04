'use client';

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Task, Project, User, USERS } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface TaskCardProps {
  task: Task;
  project: Project;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, project, onComplete, onDelete }: TaskCardProps) {
  const router = useRouter();
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-150, 0, 150],
    ['#ef4444', 'transparent', '#22c55e']
  );
  const leftIconOpacity = useTransform(x, [-150, -50, 0], [1, 0.5, 0]);
  const rightIconOpacity = useTransform(x, [0, 50, 150], [0, 0.5, 1]);

  const assignee = USERS.find(u => u.id === task.assigneeId);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100) {
      onComplete(task.id);
    } else if (info.offset.x < -100) {
      onDelete(task.id);
    }
  };

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Сьогодні';
    if (date.toDateString() === tomorrow.toDateString()) return 'Завтра';
    return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
  };

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status === 'todo';

  return (
    <div className="relative overflow-hidden rounded-2xl mb-3">
      {/* Background indicators */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-between px-6"
        style={{ background }}
      >
        <motion.span style={{ opacity: leftIconOpacity }} className="text-2xl">
          🗑️
        </motion.span>
        <motion.span style={{ opacity: rightIconOpacity }} className="text-2xl">
          ✅
        </motion.span>
      </motion.div>

      {/* Card content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        onDragEnd={handleDragEnd}
        style={{ x }}
        onClick={() => router.push(`/task/${task.id}`)}
        className={`
          relative cursor-pointer
          bg-gradient-to-r ${project.gradient}
          p-4 rounded-2xl
          text-white shadow-lg
          active:scale-[0.98] transition-transform
        `}
      >
        {/* Project badge */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm opacity-90">
            {project.emoji} {project.name}
          </span>
          {assignee && (
            <span className="text-sm opacity-90">
              {assignee.emoji} {assignee.name}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold mb-1">{task.title}</h3>

        {/* Deadline */}
        {task.deadline && (
          <div className={`text-sm ${isOverdue ? 'text-red-200 font-bold' : 'opacity-75'}`}>
            📅 {formatDeadline(task.deadline)}
            {isOverdue && ' ⚠️'}
          </div>
        )}
      </motion.div>
    </div>
  );
}
