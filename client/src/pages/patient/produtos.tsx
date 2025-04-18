'use client';

import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Este componente serve como redirecionador
export default function ProdutosRedirector() {
  const { toast } = useToast();
  
  useEffect(() => {
    // Redirecionar para a página correta de produtos
    window.location.href = '/patient/produtos';
    
    // Mostrar notificação de redirecionamento
    toast({
      title: "Redirecionando...",
      description: "Indo para a página de produtos.",
    });
  }, [toast]);
  
  // Renderizar um componente de carregamento enquanto redireciona
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg">Carregando página de produtos...</p>
      </div>
    </div>
  );
}