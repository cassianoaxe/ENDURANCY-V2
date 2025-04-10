import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DoctorSidebar from './DoctorSidebar';
// import Header from '@/components/layout/Header';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface DoctorLayoutProps {
  children: ReactNode;
}

export default function DoctorLayout({ children }: DoctorLayoutProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Se estiver carregando, mostrar um indicador de carregamento
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se não estiver autenticado, redirecionar para o login
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
          <p className="text-gray-600">Você precisa estar logado para acessar esta página</p>
        </div>
        <Button 
          onClick={() => window.location.href = '/login'}
          size="lg"
        >
          Ir para o login
        </Button>
      </div>
    );
  }

  // Se o usuário não for médico, mostrar mensagem de acesso negado
  if (user?.role !== 'doctor') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para acessar o portal médico</p>
        </div>
        <Button 
          onClick={() => window.location.href = '/'}
          size="lg"
        >
          Voltar para a página inicial
        </Button>
      </div>
    );
  }

  // Layout normal com sidebar do médico
  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorSidebar />
      <div className="ml-[240px] min-h-screen pb-8">
        <main>
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}