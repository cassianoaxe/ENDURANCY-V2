import React from 'react';
import { cn } from '@/lib/utils';

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'card' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Box = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  ...props
}: BoxProps) => {
  return (
    <div
      className={cn(
        'rounded-lg',
        {
          'bg-background shadow': variant === 'default',
          'bg-card text-card-foreground shadow-sm': variant === 'card',
          'border border-border': variant === 'outlined',
          'p-0': padding === 'none',
          'p-3': padding === 'sm',
          'p-5': padding === 'md',
          'p-8': padding === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};