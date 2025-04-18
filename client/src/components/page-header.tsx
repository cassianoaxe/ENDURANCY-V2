import React from 'react';

interface PageHeaderProps {
  heading: string;
  text?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  heading,
  text,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
        {text && <p className="text-muted-foreground">{text}</p>}
      </div>
      {children}
    </div>
  );
}

export function PageSubHeader({
  heading,
  text,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">{heading}</h2>
        {text && <p className="text-muted-foreground text-sm">{text}</p>}
      </div>
      {children}
    </div>
  );
}