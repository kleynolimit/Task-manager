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
      <div className="flex items-center gap-4">
        <span className="text-3xl">{group.emoji}</span>
        <span className="text-white text-[28px] font-bold leading-tight">{group.title}</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-white/60 text-[22px] font-semibold">{group.taskCount}</span>
      </div>
    </motion.div>
  );
}

function getHeatGradient(index: number, total: number): string {
  const ratio = index / Math.max(total - 1, 1);
  const baseHue = 210;
  const baseSat = 85;
  const baseLightStart = 45;
  const baseLightEnd = 60;
  
  // Gradually lighten from top to bottom
  const lightness = baseLightStart + (ratio * (baseLightEnd - baseLightStart));
  return `hsl(${baseHue}, ${baseSat}%, ${lightness}%)`;
}
