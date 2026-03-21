import React from 'react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className, variant = 'dark', size = 'md' }) => {
  const isDark = variant === 'dark';
  
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const barClasses = {
    sm: 'h-0.5 mb-0.5',
    md: 'h-1 mb-1',
    lg: 'h-1.5 mb-1.5',
  };

  return (
    <div className={cn("flex flex-col items-start font-sans", className)}>
      <div className={cn("bg-[#FF6B00] w-full", barClasses[size])} />
      <div className={cn(
        "font-black tracking-tighter leading-none flex items-baseline gap-1",
        sizeClasses[size],
        isDark ? "text-[#0A192F]" : "text-white"
      )}>
        <span>GH</span>
        <span className="font-light">DUTOS</span>
      </div>
    </div>
  );
};

export default Logo;
