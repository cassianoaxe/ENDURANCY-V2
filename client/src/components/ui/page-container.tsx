import React, { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`p-4 md:p-6 lg:p-8 max-w-7xl mx-auto ${className}`}>
      {children}
    </div>
  );
}