import React, { ComponentType } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Organization, OrganizationModule } from '@shared/schema';
import ModuleSubscriptionStatus, { ModuleStatus } from './ModuleSubscriptionStatus';

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
    
    // Busca dados da organização
    const { data: organization, isLoading: isOrgLoading } = useQuery<Organization>({
      queryKey: ['/api/organizations', user?.organizationId],
      enabled: !!user?.organizationId,
    });
    
    // Busca os módulos da organização
    const { data: organizationModules, isLoading: isModulesLoading } = useQuery<OrganizationModule[]>({
      queryKey: ['/api/organization-modules', user?.organizationId],
      enabled: !!user?.organizationId,
    });
    
    // Se estiver carregando, exibe um spinner
    if (isOrgLoading || isModulesLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
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
          </div>
        </div>
      );
    }
    
    // Determina o status do módulo
    let moduleStatus: ModuleStatus = "not_contracted";
    
    if (organizationModules) {
      const foundModule = organizationModules.find(m => m.moduleType === moduleType);
      
      if (foundModule) {
        if (foundModule.status === 'active') {
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
    return (
      <ModuleSubscriptionStatus
        moduleName={moduleName}
        moduleType={moduleType}
        moduleDescription={moduleDescription}
        modulePrice={modulePrice}
        moduleStatus={moduleStatus}
        organizationId={organization.id}
      />
    );
  };
};