import React from 'react';
import { PartnerForm } from '@/components/social/PartnerForm';
import { DashboardShell } from '@/components/shell';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';

export default function PartnerEditPage() {
  const { user } = useAuth();
  const organizationId = user?.organizationId;
  const { id } = useParams();
  
  // Buscar dados do parceiro
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/social/partners', id],
    enabled: !!id && !!organizationId,
    refetchOnWindowFocus: false,
  });

  if (!organizationId) {
    return (
      <DashboardShell>
        <div className="p-4 border rounded-lg bg-orange-50 text-orange-700">
          <h2 className="text-lg font-semibold">Organização não encontrada</h2>
          <p>Você precisa estar vinculado a uma organização para acessar esta funcionalidade.</p>
        </div>
      </DashboardShell>
    );
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-2">Carregando dados do parceiro...</span>
        </div>
      </DashboardShell>
    );
  }

  if (error || !data) {
    return (
      <DashboardShell>
        <div className="p-4 border rounded-lg bg-red-50 text-red-700">
          <h2 className="text-lg font-semibold">Erro ao carregar parceiro</h2>
          <p>{error?.message || 'Não foi possível encontrar os dados do parceiro'}</p>
          <button 
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
            onClick={() => window.history.back()}
          >
            Voltar
          </button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <PartnerForm 
        organizationId={organizationId} 
        partner={data.partner} 
        onSuccess={() => window.location.href = '/social/partners'}
      />
    </DashboardShell>
  );
}