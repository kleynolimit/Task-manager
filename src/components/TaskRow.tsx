'use client';

import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Task } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
  const [isDragging, setIsDragging] = useState(false);
  
  const baseColor = getHeatColor(index, totalTasks);
  const backgroundColor = useTransform(x, 
    [-150, -50, 0, 50, 150], 
    ['hsl(0, 85%, 50%)', baseColor, baseColor, baseColor, 'hsl(120, 70%, 45%)']
  );

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    setIsDragging(false);
    
    if (info.offset.x > threshold) {
      // Swipe right = done
      onDone(task.id);
    } else if (info.offset.x < -threshold) {
      // Swipe left = cancel
      onCancel(task.id);
    }
  };

  const handleClick = () => {
    if (!isDragging) {
      router.push(`/task/${task.id}`);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background reveal indicators */}
      <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
        <motion.div
          className="text-white text-2xl font-bold flex items-center gap-2"
          style={{ opacity: useTransform(x, [0, 120], [0, 1]) }}
        >
          <span className="text-3xl">✓</span>
        </motion.div>
        <motion.div
          className="text-white text-2xl font-bold flex items-center gap-2"
          style={{ opacity: useTransform(x, [-120, 0], [1, 0]) }}
        >
          <span className="text-3xl">✕</span>
        </motion.div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        style={{ x, backgroundColor }}
        className="relative min-h-[80px] px-5 py-6 flex items-center cursor-pointer"
        whileTap={{ scale: isDragging ? 1 : 0.98 }}
      >
        <div className="flex items-center gap-3 flex-1 relative z-10">
          <span className="text-white text-[26px] font-semibold flex-1 leading-tight">{task.name}</span>
        </div>
      </motion.div>
    </div>
  );
}

// Helper function to generate vibrant red → orange/yellow colors like Clear
function getHeatColor(index: number, total: number): string {
  const ratio = index / Math.max(total - 1, 1);
  const hue = 0 + ratio * 45; // 0 (red) -> 45 (orange/yellow)
  const sat = 85;
  const light = 50;
  return `hsl(${hue}, ${sat}%, ${light}%)`;
}
