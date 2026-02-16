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
      className="min-h-[80px] px-5 py-6 flex items-center justify-between cursor-pointer border-b border-white/10"
      style={{ backgroundColor: heatGradient }}
      onClick={() => router.push(`/group/${group.id}`)}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <span className="text-white text-[28px] font-bold leading-tight">
        {group.emoji} {group.title}
      </span>

      <span className="text-white/70 text-[22px] font-semibold">{group.taskCount}</span>
    </motion.div>
  );
}

function getHeatGradient(index: number, total: number): string {
  const ratio = index / Math.max(total - 1, 1);
  const hue = 3 + ratio * 22;
  const sat = 85;
  const lightness = 46 + ratio * 10;
  return `hsl(${hue}, ${sat}%, ${lightness}%)`;
}
