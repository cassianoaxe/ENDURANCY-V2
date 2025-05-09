import React from 'react';
import { cn } from '@/lib/utils';

interface TabsContextProps {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextProps | undefined>(undefined);

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export const Tabs = ({
  defaultValue,
  value,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) => {
  const [tabValue, setTabValue] = React.useState(defaultValue);
  
  const actualValue = value !== undefined ? value : tabValue;
  const handleValueChange = onValueChange || setTabValue;
  
  return (
    <TabsContext.Provider value={{ value: actualValue, onValueChange: handleValueChange }}>
      <div className={cn('', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

export const TabsList = ({ className, children, ...props }: TabsListProps) => {
  return (
    <div
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export const TabsTrigger = ({
  value,
  className,
  disabled,
  children,
  ...props
}: TabsTriggerProps) => {
  const context = React.useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs component');
  }
  
  const { value: selectedValue, onValueChange } = context;
  const isActive = value === selectedValue;
  
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabs-content-${value}`}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isActive
          ? 'bg-background text-foreground shadow-sm'
          : 'hover:bg-background/50 hover:text-foreground',
        className
      )}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export const TabsContent = ({
  value,
  className,
  children,
  ...props
}: TabsContentProps) => {
  const context = React.useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsContent must be used within a Tabs component');
  }
  
  const { value: selectedValue } = context;
  const isActive = value === selectedValue;
  
  if (!isActive) return null;
  
  return (
    <div
      role="tabpanel"
      id={`tabs-content-${value}`}
      className={cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', className)}
      {...props}
    >
      {children}
    </div>
  );
};
