import React from 'react';
import { cn } from '../utils/cn';

export interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  valueDisplay?: string | number;
  description?: string;
}

export const Slider: React.FC<SliderProps> = ({
  className,
  label,
  valueDisplay,
  description,
  ...props
}) => {
  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {(label || valueDisplay !== undefined) && (
        <div className="flex items-center justify-between text-xs">
          {label && <label className="font-medium text-slate-700">{label}</label>}
          {valueDisplay !== undefined && (
            <span className="font-semibold text-blue-600 font-mono px-1.5 py-0.5 bg-blue-50 rounded">
              {valueDisplay}
            </span>
          )}
        </div>
      )}
      <input
        type="range"
        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
        {...props}
      />
      {description && <p className="text-[11px] text-slate-400">{description}</p>}
    </div>
  );
};

