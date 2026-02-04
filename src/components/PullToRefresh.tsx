'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const threshold = 80;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (refreshing) return;
    if (containerRef.current?.scrollTop !== 0) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0 && startY.current > 0) {
      // Apply resistance
      setPullDistance(Math.min(diff * 0.4, threshold * 1.5));
    }
  }, [refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true);
      setPullDistance(threshold);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
    startY.current = 0;
  }, [pullDistance, refreshing, onRefresh]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen overflow-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <motion.div
        className="flex items-center justify-center overflow-hidden"
        animate={{ height: pullDistance }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <motion.div
          animate={{ 
            rotate: refreshing ? 360 : (pullDistance / threshold) * 180,
            scale: Math.min(pullDistance / threshold, 1),
          }}
          transition={{ 
            rotate: refreshing ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : { duration: 0 },
          }}
          className="text-2xl"
        >
          {refreshing ? '🔄' : '⬇️'}
        </motion.div>
      </motion.div>

      {children}
    </div>
  );
}
