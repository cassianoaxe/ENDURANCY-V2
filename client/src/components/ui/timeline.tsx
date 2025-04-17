'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TimelineProps {
  children: React.ReactNode;
  className?: string;
}

interface TimelineItemProps {
  children: React.ReactNode;
  className?: string;
}

interface TimelineConnectorProps {
  className?: string;
}

interface TimelineHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface TimelineIconProps {
  children: React.ReactNode;
  className?: string;
}

interface TimelineContentProps {
  children: React.ReactNode;
  className?: string;
}

interface TimelineBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function Timeline({ children, className }: TimelineProps) {
  return (
    <ol className={cn('relative border-l border-gray-200 dark:border-gray-700', className)}>
      {children}
    </ol>
  );
}

export function TimelineItem({ children, className }: TimelineItemProps) {
  return (
    <li className={cn('mb-6 ml-6', className)}>
      {children}
    </li>
  );
}

export function TimelineConnector({ className }: TimelineConnectorProps) {
  return (
    <span 
      className={cn(
        'absolute -left-[calc(0.5rem+1px)] h-full w-1 transform translate-x-[3px]',
        className || 'bg-gray-200 dark:bg-gray-700'
      )}
    />
  );
}

export function TimelineHeader({ children, className }: TimelineHeaderProps) {
  return (
    <div className={cn('flex items-start', className)}>
      {children}
    </div>
  );
}

export function TimelineIcon({ children, className }: TimelineIconProps) {
  return (
    <span 
      className={cn(
        'absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full border bg-white dark:bg-gray-900', 
        className || 'border-gray-200 dark:border-gray-700'
      )}
    >
      {children}
    </span>
  );
}

export function TimelineContent({ children, className }: TimelineContentProps) {
  return (
    <div className={cn('ml-3 pb-2', className)}>
      {children}
    </div>
  );
}

export function TimelineBody({ children, className }: TimelineBodyProps) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
}