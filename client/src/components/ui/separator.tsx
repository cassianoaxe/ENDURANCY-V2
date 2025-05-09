import React from 'react';
import { cn } from '@/lib/utils';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Separator = ({ 
  orientation = 'horizontal', 
  className, 
  ...props 
}: SeparatorProps & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className
      )}
      {...props}
    />
  );
};
