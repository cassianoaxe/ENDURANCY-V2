import React, { ComponentType } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import ModuleSubscriptionStatus, { ModuleStatus } from './ModuleSubscriptionStatus';
import { Loader2 } from 'lucide-react';

// Interface para organização
interface Organization {
  id: number;
  name: string;
  type: string;
  adminName?: string;
  planTier?: string;
  planId?: number;
  status?: string;
  [key: string]: any;
}

// Interface para módulo de organização
interface OrganizationModule {
  id: number;
  name: string;
  status: 'active' | 'pending' | 'cancelled';
  moduleInfo?: {
    type?: string;
    slug?: string;
    [key: string]: any;
  };
  active?: boolean;
  [key: string]: any;
}

// Interface para as propriedades do HOC
interface WithModuleAccessProps {
  moduleType: string;
  moduleName: string;
  moduleDescription: string;
  modulePrice: number;
}

// HOC para verificar o acesso ao módulo
// Versão temporária do HOC que não verifica acesso ao módulo
export const bypassModuleAccess = <P extends object>(
  WrappedComponent: ComponentType<P>,
  _props: WithModuleAccessProps // mantemos o parâmetro apenas para compatibilidade
) => {
  return function BypassModuleAccessWrapper(props: P) {
    // Verificamos se o componente está sendo renderizado como um standalone
    // Se sim, simplesmente renderizamos o componente sem verificações adicionais
    try {
      // Tentando verificar se o contexto de autenticação está disponível
      // Se não estiver, isso gerará um erro que será capturado no catch
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { user } = useAuth();
      
      // Se usuário não estiver logado, exibimos uma mensagem de erro
      if (!user) {
        return (
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-amber-600">Modo de desenvolvimento</h2>
              <p className="mt-2 text-gray-600">
                Este componente está em modo de desenvolvimento e não requer autenticação para visualização.
              </p>
            </div>
          </div>
        );
      }
    } catch (e) {
      console.log("Executando em modo de bypass sem contexto de autenticação");
    }
    
    // No modo de bypass, renderizamos o componente independentemente do status do módulo
    return <WrappedComponent {...props} />;
  };
};
export const withModuleAccess = <P extends object>(
  WrappedComponent: ComponentType<P>,
  { moduleType, moduleName, moduleDescription, modulePrice }: WithModuleAccessProps
) => {
  // Componente de wrapper
  return function WithModuleAccessWrapper(props: P) {
    const { user } = useAuth();
    
    // Busca dados da organização com retry em caso de falha
    const { 
      data: organization, 
      isLoading: isOrgLoading,
      error: orgError,
      refetch: refetchOrg
    } = useQuery<Organization>({
      queryKey: ['/api/organizations/current'],
      queryFn: async () => {
        const response = await fetch('/api/organizations/current');
        if (!response.ok) throw new Error(`Erro ao buscar organização: ${response.statusText}`);
        return response.json();
      },
      enabled: !!user?.organizationId,
      retry: 1,
      retryDelay: 3000,
      staleTime: 60000, // Cache válido por 1 minuto
      refetchOnWindowFocus: false, // Não refaz a consulta ao focar a janela
      refetchOnMount: false // Não refaz a consulta ao montar o componente novamente
    });
    
    // Busca os módulos da organização
    const { 
      data: organizationModules, 
      isLoading: isModulesLoading,
      error: modulesError,
      refetch: refetchModules
    } = useQuery<OrganizationModule[]>({
      queryKey: ['/api/modules/organization', moduleType],

      queryFn: async () => {
        // Só busca os módulos se tiver a organização
        if (!organization?.id) {
          return [];
        }
        // Adiciona o parâmetro de consulta para ajudar o backend a identificar o módulo específico
        const response = await fetch(`/api/modules/organization?module=${moduleType}`);
        if (!response.ok) throw new Error(`Erro ao buscar módulos: ${response.statusText}`);
        return response.json();
      },
      enabled: !!organization?.id, // Só executa se tiver dados da organização
      retry: 1,
      retryDelay: 3000,
      staleTime: 60000, // Cache válido por 1 minuto
      refetchOnWindowFocus: false, // Não refaz a consulta ao focar a janela
      refetchOnMount: false // Não refaz a consulta ao montar o componente novamente
    });
    
    // Se estiver carregando, exibe um spinner
    if (isOrgLoading || isModulesLoading) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-green-500 mb-4" />
          <p className="text-gray-600">Carregando informações do módulo...</p>
        </div>
      );
    }
    
    // Trata erros de carregamento
    if (orgError || modulesError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">Erro ao carregar dados</h2>
            <p className="mt-2 text-gray-600">
              {orgError ? `Erro da organização: ${orgError.message}` : ''}
              {modulesError ? `Erro dos módulos: ${modulesError.message}` : ''}
            </p>
            <button 
              onClick={() => {
                refetchOrg();
                refetchModules();
              }}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }
    
    // Verifica se a organização existe
    if (!organization || !user?.organizationId) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">Organização não encontrada</h2>
            <p className="mt-2 text-gray-600">Não foi possível carregar os dados da organização.</p>
            <button 
              onClick={() => {
                refetchOrg();
                refetchModules();
              }}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }
    
    // Determina o status do módulo
    let moduleStatus: ModuleStatus = "not_contracted";
    
    if (organizationModules && Array.isArray(organizationModules)) {
      const foundModule = organizationModules.find((m: any) => {
        // Verificar se o moduleInfo existe e se o tipo corresponde
        return m.moduleInfo && (m.moduleInfo.type === moduleType || m.moduleInfo.slug === moduleType);
      });
      
      if (foundModule) {
        if (foundModule.status === 'active' || foundModule.active === true) {
          moduleStatus = "active";
        } else if (foundModule.status === 'pending') {
          moduleStatus = "pending_approval";
        }
      }
    }
    
    // Se o módulo estiver ativo, renderiza o componente normal
    if (moduleStatus === "active") {
      return <WrappedComponent {...props} />;
    }
    
    // Caso contrário, exibe o componente de status de assinatura
    const orgId = organization?.id;
    
    if (!orgId) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">Erro de configuração</h2>
            <p className="mt-2 text-gray-600">Não foi possível identificar a organização.</p>
            <button 
              onClick={() => {
                refetchOrg();
                refetchModules();
              }}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <ModuleSubscriptionStatus
        moduleName={moduleName}
        moduleType={moduleType}
        moduleDescription={moduleDescription}
        modulePrice={modulePrice}
        moduleStatus={moduleStatus}
        organizationId={orgId}
      />
    );
  };
};