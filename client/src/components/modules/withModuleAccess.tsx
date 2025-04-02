import React, { ComponentType, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Organization, OrganizationModule } from '@shared/schema';
import ModuleSubscriptionStatus, { ModuleStatus } from './ModuleSubscriptionStatus';
import { Loader2 } from 'lucide-react';

// Interface para as propriedades do HOC
interface WithModuleAccessProps {
  moduleType: string;
  moduleName: string;
  moduleDescription: string;
  modulePrice: number;
}

// HOC para verificar o acesso ao módulo
export const withModuleAccess = <P extends object>(
  WrappedComponent: ComponentType<P>,
  { moduleType, moduleName, moduleDescription, modulePrice }: WithModuleAccessProps
) => {
  // Componente de wrapper
  return function WithModuleAccessWrapper(props: P) {
    const { user } = useAuth();
    const [retryCount, setRetryCount] = useState(0);
    
    // Efeito para tentar novamente em caso de falha nas requisições
    useEffect(() => {
      if (retryCount > 0) {
        const timer = setTimeout(() => {
          console.log(`Tentando carregar dados novamente (tentativa ${retryCount})...`);
        }, 500);
        return () => clearTimeout(timer);
      }
    }, [retryCount]);
    
    // Busca dados da organização com retry em caso de falha
    const { 
      data: organization, 
      isLoading: isOrgLoading,
      error: orgError,
      refetch: refetchOrg
    } = useQuery<Organization>({
      queryKey: ['/api/organizations', user?.organizationId],
      enabled: !!user?.organizationId,
      retry: 3,
      retryDelay: 1000,
      onError: (error) => {
        console.error("Erro ao carregar dados da organização:", error);
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => refetchOrg(), 1500);
        }
      }
    });
    
    // Busca os módulos da organização
    const { 
      data: organizationModules, 
      isLoading: isModulesLoading,
      error: modulesError,
      refetch: refetchModules
    } = useQuery<OrganizationModule[]>({
      queryKey: [`/api/organization-modules/${user?.organizationId}`],
      enabled: !!user?.organizationId,
      retry: 3,
      retryDelay: 1000,
      onError: (error) => {
        console.error("Erro ao carregar módulos da organização:", error);
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => refetchModules(), 1500);
        }
      }
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
    if ((orgError || modulesError) && retryCount >= 3) {
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
                setRetryCount(0);
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
    
    // Quando não há organização mas o usuário tem um ID de organização, estamos enfrentando um problema
    // de cookies ou sessão. Vamos tratar especificamente este caso.
    if (!organization && user?.organizationId) {
      console.log("Organizacao não encontrada, mas usuário tem organizationId:", user.organizationId);
      
      // Tenta obter a organização diretamente via fetch em vez de usar o React Query
      if (retryCount < 3) {
        // Incrementa o contador de tentativas
        setRetryCount(prev => prev + 1);
        
        // Tenta novamente com as queries
        setTimeout(() => {
          refetchOrg();
          refetchModules();
        }, 1000);
        
        return (
          <div className="min-h-screen flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-green-500 mb-4" />
            <p className="text-gray-600">Carregando informações do módulo (tentativa {retryCount}/3)...</p>
          </div>
        );
      }
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
                setRetryCount(0);
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
      console.log("Verificando módulos disponíveis:", organizationModules);
      const foundModule = organizationModules.find((m: any) => {
        // Verificar se o moduleInfo existe e se o tipo corresponde
        return m.moduleInfo && m.moduleInfo.type === moduleType;
      });
      
      if (foundModule) {
        console.log("Módulo encontrado:", foundModule);
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
    console.log("Renderizando ModuleSubscriptionStatus com organizationId:", organization?.id);
    
    // Vamos garantir que o ID da organização seja passado corretamente
    const orgId = organization?.id;
    
    if (!orgId) {
      console.error("Erro: ID da organização não disponível:", organization);
      
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">Erro de configuração</h2>
            <p className="mt-2 text-gray-600">Não foi possível identificar a organização.</p>
            <button 
              onClick={() => {
                setRetryCount(0);
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