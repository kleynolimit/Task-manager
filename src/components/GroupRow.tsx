'use client';

import { motion } from 'framer-motion';
import { Group } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface GroupRowProps {
  group: Group;
  index: number;
  totalGroups: number;
}

export default function GroupRow({ group, index, totalGroups }: GroupRowProps) {
  const router = useRouter();
  
  // Blue gradient (like Clear's My Lists)
  const blueGradient = getBlueGradient(index, totalGroups);

  return (
    <motion.div
      className="h-20 px-6 flex items-center justify-between cursor-pointer border-b border-white/10"
      style={{ backgroundColor: blueGradient }}
      onClick={() => router.push(`/group/${group.id}`)}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{group.emoji}</span>
        <span className="text-white text-lg font-medium">{group.title}</span>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-white/70 text-lg">{group.taskCount}</span>
        <svg className="w-6 h-6 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </motion.div>
  );
}

// Helper function to generate blue gradient colors (like Clear)
function getBlueGradient(index: number, total: number): string {
  const ratio = index / Math.max(total - 1, 1);
  
  // Light blue to darker blue gradient
  const r = Math.round(59 - (20 * ratio)); // 59 -> 39
  const g = Math.round(130 - (40 * ratio)); // 130 -> 90
  const b = Math.round(246 - (60 * ratio)); // 246 -> 186
  
  return `rgb(${r}, ${g}, ${b})`;
}
