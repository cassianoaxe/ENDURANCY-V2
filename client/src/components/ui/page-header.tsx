import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, description, icon, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b mb-6">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="hidden md:flex">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      
      {actions && (
        <div className="mt-4 md:mt-0 w-full md:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
}