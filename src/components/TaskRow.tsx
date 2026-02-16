'use client';

import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Task } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface TaskRowProps {
  task: Task;
  index: number;
  totalTasks: number;
  onDone: (taskId: string) => void;
  onCancel: (taskId: string) => void;
}

export default function TaskRow({ task, index, totalTasks, onDone, onCancel }: TaskRowProps) {
  const router = useRouter();
  const x = useMotionValue(0);
  
  // Create color gradient based on position
  const heatGradient = useTransform(x, [-200, 0, 200], [
    'rgb(239, 68, 68)', // red for left swipe (cancel)
    getHeatColor(index, totalTasks),
    'rgb(34, 197, 94)', // green for right swipe (done)
  ]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      // Swipe right = done
      onDone(task.id);
    } else if (info.offset.x < -threshold) {
      // Swipe left = cancel
      onCancel(task.id);
    }
  };

  const getPriorityColor = (priority?: string) => {
    if (priority === 'High') return 'bg-red-500';
    if (priority === 'Medium') return 'bg-yellow-500';
    if (priority === 'Low') return 'bg-green-500';
    return 'bg-gray-400';
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      style={{ x, backgroundColor: heatGradient }}
      className="relative h-16 px-4 flex items-center cursor-pointer border-b border-white/10"
      onClick={() => router.push(`/task/${task.id}`)}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3 flex-1">
        {/* Priority dot */}
        {task.priority && (
          <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
        )}
        
        {/* Task name */}
        <span className="text-white font-medium flex-1">{task.name}</span>
        
        {/* Deadline */}
        {task.deadline && (
          <span className="text-white/60 text-sm">{task.deadline}</span>
        )}
      </div>

      {/* Swipe indicators */}
      <motion.div
        className="absolute left-4 text-white font-bold"
        style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
      >
        ✓ Done
      </motion.div>
      <motion.div
        className="absolute right-4 text-white font-bold"
        style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
      >
        ✗ Cancel
      </motion.div>
    </motion.div>
  );
}

// Helper function to generate heat gradient colors (red-orange gradient like Clear)
function getHeatColor(index: number, total: number): string {
  const ratio = index / Math.max(total - 1, 1);
  
  // Red to Orange gradient
  const r = Math.round(220 + (35 * ratio)); // 220 -> 255
  const g = Math.round(38 + (127 * ratio)); // 38 -> 165
  const b = Math.round(38 + (0 * ratio)); // 38 -> 38
  
  return `rgb(${r}, ${g}, ${b})`;
}
