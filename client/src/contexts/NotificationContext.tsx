/**
 * Notification context for centralized toast and alert management
 * 
 * This context provides a standardized way to display notifications
 * across the application with consistent styling and behavior.
 */
import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { toast, ToastOptions } from '../components/ui/toaster';
import { useToast } from '../hooks/use-toast';

// Notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// Notification object structure
export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
}

// Notification context state and methods
interface NotificationContextType {
  // Show a success notification
  showSuccess: (message: string, title?: string, options?: ToastOptions) => void;
  // Show an error notification
  showError: (message: string, title?: string, options?: ToastOptions) => void;
  // Show a warning notification
  showWarning: (message: string, title?: string, options?: ToastOptions) => void;
  // Show an info notification
  showInfo: (message: string, title?: string, options?: ToastOptions) => void;
  // Dismiss a specific notification by id
  dismiss: (id: string) => void;
  // Dismiss all active notifications
  dismissAll: () => void;
}

// Create notification context
const NotificationContext = createContext<NotificationContextType | null>(null);

/**
 * Hook to use the notification context
 */
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
};

// Props for NotificationProvider
interface NotificationProviderProps {
  children: ReactNode;
}

/**
 * Provider component for notification functionality
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  // Use the toast hook from shadcn
  const { toast, dismiss } = useToast();
  
  // Show a success notification
  const showSuccess = useCallback((message: string, title?: string, options?: ToastOptions) => {
    toast({
      title: title || 'Sucesso',
      description: message,
      variant: 'default',
      ...options
    });
  }, [toast]);
  
  // Show an error notification
  const showError = useCallback((message: string, title?: string, options?: ToastOptions) => {
    toast({
      title: title || 'Erro',
      description: message,
      variant: 'destructive',
      ...options
    });
  }, [toast]);
  
  // Show a warning notification
  const showWarning = useCallback((message: string, title?: string, options?: ToastOptions) => {
    toast({
      title: title || 'Atenção',
      description: message,
      variant: 'warning',
      ...options
    });
  }, [toast]);
  
  // Show an info notification
  const showInfo = useCallback((message: string, title?: string, options?: ToastOptions) => {
    toast({
      title: title || 'Informação',
      description: message,
      variant: 'default',
      ...options
    });
  }, [toast]);
  
  // Dismiss all notifications
  const dismissAll = useCallback(() => {
    // This is a custom function that would need to be implemented based on
    // the specifics of the toast library being used
    // If the library doesn't provide this, we can track toast IDs ourselves
    document.querySelectorAll('[data-toast-container] [data-toast]').forEach((el) => {
      const toastId = el.getAttribute('data-toast');
      if (toastId) dismiss(toastId);
    });
  }, [dismiss]);
  
  // Context value
  const value = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismiss,
    dismissAll
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;