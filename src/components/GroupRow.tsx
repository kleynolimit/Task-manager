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
  const heatGradient = getHeatGradient(index, totalGroups);

  return (
    <motion.div
      className="min-h-[80px] px-5 py-6 flex items-center justify-between cursor-pointer"
      style={{ backgroundColor: heatGradient }}
      onClick={() => router.push(`/group/${group.id}`)}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{group.emoji}</span>
        <span className="text-white text-xl md:text-2xl font-semibold leading-tight">{group.title}</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-white/80 text-lg font-medium">{group.taskCount}</span>
      </div>
    </motion.div>
  );
}

function getHeatGradient(index: number, total: number): string {
  const ratio = index / Math.max(total - 1, 1);
  const hue = 0 + ratio * 45; // red -> orange/yellow
  return `hsl(${hue}, 92%, 56%)`;
}
