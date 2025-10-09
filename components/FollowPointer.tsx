'use client';

import { stringToRandomColor } from '@/helpers/stringToHash';
import { motion } from 'framer-motion';
import { MousePointer2 } from 'lucide-react';
import React from 'react';

function FollowPointer({ info, x, y }: { info: { name: string, avatar: string }, x: number | undefined, y: number | undefined }) {
  const color = stringToRandomColor(info.name || 'Krishna');
  console.log(info);


  if (x === undefined || y === undefined) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, x, y }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute pointer-events-none flex items-center gap-2"
      style={{ color }}
    >
      <MousePointer2 size={20} />
      <span className="text-sm font-medium">{info.name}</span>
    </motion.div>
  );
}

export default FollowPointer;
