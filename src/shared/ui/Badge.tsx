import React from 'react';
import { cn } from '../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'cyan' | 'green' | 'amber' | 'red' | 'purple' | 'slate';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'blue',
  dot = false,
  children,
  ...props
}) => {
  const variantStyles = {
    blue: "bg-blue-50 text-blue-700 border-blue-200/80",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-200/80",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    amber: "bg-amber-50 text-amber-700 border-amber-200/80",
    red: "bg-rose-50 text-rose-700 border-rose-200/80",
    purple: "bg-purple-50 text-purple-700 border-purple-200/80",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const dotColors = {
    blue: "bg-blue-500",
    cyan: "bg-cyan-500",
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-rose-500",
    purple: "bg-purple-500",
    slate: "bg-slate-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])} />}
      {children}
    </span>
  );
};

