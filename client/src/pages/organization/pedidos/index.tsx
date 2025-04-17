'use client';

import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import OrganizationLayout from '@/components/layout/OrganizationLayout';

/**
 * Componente de redirecionamento para a nova página de pedidos unificada
 * Mantém a compatibilidade com links antigos
 */
export default function RedirectToPedidosUnificados() {
  const [, navigate] = useLocation();
  
  useEffect(() => {
    // Redirecionamento para a página unificada
    const timer = setTimeout(() => {
      navigate('/organization/vendas/pedidos', { replace: true });
    }, 800);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return (
    <OrganizationLayout>
      <div className="container flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">Redirecionando...</h2>
        <p className="text-muted-foreground text-center">
          Esta página foi movida para o novo gerenciador unificado de pedidos.
          <br />
          Você será redirecionado automaticamente.
        </p>
      </div>
    </OrganizationLayout>
  );
}