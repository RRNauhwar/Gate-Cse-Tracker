import React from 'react';
import { TopicStatus } from '../../types';

interface BadgeProps {
  status?: TopicStatus;
  label?: string;
  variant?: 'slate' | 'blue' | 'emerald' | 'amber' | 'rose' | 'purple';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, label, variant, size = 'sm' }) => {
  let text = label;
  let colorClass = 'bg-slate-800 text-slate-300 border-slate-700';

  if (status) {
    switch (status) {
      case 'not_started':
        text = 'Not Started';
        colorClass = 'bg-slate-900/80 text-slate-400 border-slate-700/60';
        break;
      case 'in_progress':
        text = 'In Progress';
        colorClass = 'bg-blue-950/60 text-blue-400 border-blue-800/60';
        break;
      case 'completed':
        text = 'Completed';
        colorClass = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60';
        break;
      case 'needs_revision':
        text = 'Needs Revision';
        colorClass = 'bg-amber-950/60 text-amber-400 border-amber-800/60';
        break;
    }
  } else if (variant) {
    switch (variant) {
      case 'emerald':
        colorClass = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60';
        break;
      case 'amber':
        colorClass = 'bg-amber-950/60 text-amber-400 border-amber-800/60';
        break;
      case 'rose':
        colorClass = 'bg-rose-950/60 text-rose-400 border-rose-800/60';
        break;
      case 'blue':
        colorClass = 'bg-blue-950/60 text-blue-400 border-blue-800/60';
        break;
      case 'purple':
        colorClass = 'bg-purple-950/60 text-purple-400 border-purple-800/60';
        break;
      case 'slate':
      default:
        colorClass = 'bg-slate-900/80 text-slate-400 border-slate-700/60';
        break;
    }
  }

  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${sizeClass} ${colorClass}`}>
      {text}
    </span>
  );
};
