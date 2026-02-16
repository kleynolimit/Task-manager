'use client';

import { useState, useRef } from 'react';
import { motion, PanInfo, useMotionValue } from 'framer-motion';

interface PullToCreateProps {
  onCreateTask: (name: string) => void;
  children: React.ReactNode;
}

export default function PullToCreate({ onCreateTask, children }: PullToCreateProps) {
  const [showInput, setShowInput] = useState(false);
  const [taskName, setTaskName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const y = useMotionValue(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.y > 80 && scrollRef.current?.scrollTop === 0) {
      // Pulled down far enough at top
      setShowInput(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskName.trim()) {
      onCreateTask(taskName.trim());
      setTaskName('');
      setShowInput(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setTaskName('');
      setShowInput(false);
    }
  };

  return (
    <div ref={scrollRef} className="relative h-full overflow-auto">
      {showInput && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="sticky top-0 left-0 right-0 z-50 bg-[hsl(0,85%,48%)] px-5 py-4"
        >
          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                setTimeout(() => {
                  if (!taskName.trim()) setShowInput(false);
                }, 150);
              }}
              placeholder="New task..."
              className="w-full bg-white/10 text-white text-[22px] font-semibold placeholder-white/50 px-4 py-3 rounded-xl border-none outline-none"
            />
          </form>
        </motion.div>
      )}

      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="touch-pan-y"
      >
        {children}
      </motion.div>
    </div>
  );
}
