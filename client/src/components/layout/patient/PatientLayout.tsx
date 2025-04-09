import React, { useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { PatientSidebar } from './PatientSidebar';
import { useToast } from '@/hooks/use-toast';

export function PatientLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [, params] = useRoute('/patient/:rest*');
  
  // Check if user is authenticated and has patient role
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  useEffect(() => {
    // If not authenticated or not a patient, redirect to login
    if (!isLoading && (!user || user.role !== 'patient')) {
      toast({
        title: 'Acesso restrito',
        description: 'Você não tem permissão para acessar esta página',
        variant: 'destructive',
      });
      setLocation('/login');
    }
  }, [user, isLoading, setLocation, toast]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only render children if authenticated and has correct role
  if (user && user.role === 'patient') {
    return (
      <div className="flex min-h-screen bg-background">
        <PatientSidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 pt-16">{children}</main>
        </div>
      </div>
    );
  }

  // Placeholder while redirecting
  return (
    <div className="flex h-screen items-center justify-center">
      <div>Redirecionando...</div>
    </div>
  );
}