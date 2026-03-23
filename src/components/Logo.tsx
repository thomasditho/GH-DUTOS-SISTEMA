import React from 'react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className, variant = 'dark', size = 'md' }) => {
  const isDark = variant === 'dark';
  const navy = '#000040';
  const gray = '#E5E7EB';
  
  const sizeClasses = {
    sm: { container: 'scale-50', text: 'text-lg', sub: 'text-[6px]' },
    md: { container: 'scale-75', text: 'text-2xl', sub: 'text-[8px]' },
    lg: { container: 'scale-100', text: 'text-4xl', sub: 'text-[10px]' },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={cn("flex flex-col items-center font-sans", className, currentSize.container)}>
      <div className="relative flex items-center justify-center">
        {/* Diamond Grid Pattern */}
        <div className="absolute w-24 h-24 rotate-45 border border-brand-gray/50 flex items-center justify-center overflow-hidden">
          <div className="grid grid-cols-6 grid-rows-6 w-full h-full opacity-30">
            {[...Array(36)].map((_, i) => (
              <div key={i} className="border-[0.5px] border-brand-gray" />
            ))}
          </div>
        </div>
        
        {/* Logo Text */}
        <div className="relative z-10 flex items-baseline gap-2">
          <span className={cn("font-black tracking-tighter", currentSize.text, isDark ? "text-brand-navy" : "text-white")}>GH</span>
          <span className={cn("font-light tracking-widest", currentSize.text, isDark ? "text-brand-navy" : "text-white")}>DUTOS</span>
        </div>
      </div>
      
      {/* Subtitle */}
      <div className={cn(
        "mt-1 font-medium uppercase tracking-[0.4em] border-t border-brand-navy/20 pt-1",
        currentSize.sub,
        isDark ? "text-brand-navy" : "text-white"
      )}>
        Instalação & Manutenção
      </div>
    </div>
  );
};

export default Logo;
