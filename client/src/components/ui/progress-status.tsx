import React from 'react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

interface ProgressStatusProps {
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress?: number; // 0-100
  message?: string;
  className?: string;
}

export function ProgressStatus({
  status,
  progress = 0,
  message,
  className,
}: ProgressStatusProps) {
  return (
    <div className={cn('w-full space-y-2', className)}>
      <div className="rounded-md border p-4 bg-muted/20">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">
              {status === 'idle' && 'Aguardando iniciar...'}
              {status === 'processing' && 'Processando...'}
              {status === 'completed' && 'Concluído!'}
              {status === 'error' && 'Erro'}
            </div>
            {status === 'processing' && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          
          <Progress 
            value={status === 'completed' ? 100 : progress} 
            className="h-2"
          />
          
          {message && (
            <p className="text-xs text-muted-foreground mt-1">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}