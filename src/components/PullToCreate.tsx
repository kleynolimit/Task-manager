'use client';

import { useState, useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';

interface PullToCreateProps {
  onCreateTask: (name: string) => void;
  children: React.ReactNode;
}

export default function PullToCreate({ onCreateTask, children }: PullToCreateProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [taskName, setTaskName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.y > 100) {
      // Pulled down far enough
      setShowInput(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    setIsPulling(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskName.trim()) {
      onCreateTask(taskName.trim());
      setTaskName('');
      setShowInput(false);
    }
  };

  return (
    <div className="relative h-full">
      {showInput && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 left-0 right-0 z-50 bg-blue-600 p-4"
        >
          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              onBlur={() => {
                if (!taskName.trim()) setShowInput(false);
              }}
              placeholder="New task..."
              className="w-full bg-white/20 text-white placeholder-white/60 px-4 py-3 rounded-lg border-none outline-none"
            />
          </form>
        </motion.div>
      )}

      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragStart={() => setIsPulling(true)}
        onDragEnd={handleDragEnd}
        className="h-full"
      >
        {isPulling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-4 left-0 right-0 text-center text-white/60 text-sm"
          >
            Pull to create new task
          </motion.div>
        )}
        {children}
      </motion.div>
    </div>
  );
}
