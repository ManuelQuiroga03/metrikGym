import React from 'react';

interface PulseLoaderProps {
  color?: 'emerald' | 'cyan' | 'amber';
  label?: string;
  className?: string;
}

export const PulseLoader: React.FC<PulseLoaderProps> = ({
  color = 'emerald',
  label,
  className = '',
}) => {
  const colorClass = color === 'cyan' ? 'loader-cyan' : color === 'amber' ? 'loader-amber' : '';

  return (
    <div className={`flex flex-col items-center justify-center p-6 text-center ${className}`}>
      <span className={`pulse-loader ${colorClass}`} />
      {label && (
        <p className="mt-5 text-xs font-bold text-gray-300 tracking-wide animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
};
