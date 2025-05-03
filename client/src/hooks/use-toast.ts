import { useState, useCallback } from 'react';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastState extends ToastProps {
  id: string;
  visible: boolean;
}

// Global toast state and function for direct imports
let toastFn: (props: ToastProps) => string = () => '';
const defaultToast = (props: ToastProps) => {
  return toastFn(props);
};

export const toast = defaultToast;

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const toastFunction = useCallback(
    ({ title, description, variant = 'default', duration = 5000 }: ToastProps) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastState = {
        id,
        title,
        description,
        variant,
        duration,
        visible: true,
      };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: false } : t)));
        
        // Remover completamente após a animação de saída
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 300);
      }, duration);

      return id;
    },
    []
  );

  // Set the global toast function to use our implementation
  toastFn = toastFunction;

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: false } : t)));
    
    // Remover completamente após a animação de saída
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  return { toast: toastFunction, toasts, dismissToast };
}