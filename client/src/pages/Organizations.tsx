import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Building2, Users, ArrowUpRight, Copy, Check, Settings, Database, CreditCard, Leaf } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Organization, Plan } from "@shared/schema";

export default function Organizations() {
  // Navigation function to replace wouter
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };
  
  const { toast } = useToast();
  const [copiedOrgCode, setCopiedOrgCode] = useState<string | null>(null);
  
  const { data: allOrganizations, isLoading } = useQuery<Organization[]>({
    queryKey: ['/api/organizations']
  });
  
  const { data: plans } = useQuery<Plan[]>({
    queryKey: ['/api/plans']
  });
  
  // Filtrar apenas organizações aprovadas para exibição nesta página
  const organizations = allOrganizations?.filter(org => 
    org.status === 'approved' || org.status === 'active'
  );
  
  // Função para obter o nome do plano com base no planId da organização
  const getPlanName = (planId: number | null) => {
    if (!planId || !plans) return "Não definido";
    const plan = plans.find(p => p.id === planId);
    return plan?.name || "Não definido";
  };
  
  // Função para copiar o link de acesso
  const copyAccessLink = (orgCode: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/login/${orgCode}`);
    setCopiedOrgCode(orgCode);
    toast({
      title: 'Link copiado!',
      description: `URL de acesso para ${orgCode} foi copiado para a área de transferência.`,
    });
    setTimeout(() => setCopiedOrgCode(null), 3000);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Leaf className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Organizações</h1>
            <p className="text-gray-600">Gerencie todas as organizações aprovadas na plataforma. As organizações pendentes estão disponíveis em "Solicitações".</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate('/requests')}
          >
            Ver Solicitações
          </Button>
          <Button 
            onClick={() => navigate('/organization-registration')}
            className="add-organization-button"
          >
            Adicionar Organização
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizations?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              +2 novas organizações no último mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations?.filter(org => org.status === 'active').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +1 ativação no último mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Planos Pro</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations?.filter(org => org.planTier === 'pro').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +1 upgrade no último mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal Estimada</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations && plans ? 
                `R$ ${organizations.reduce((acc: number, org) => {
                  const plan = plans.find(p => p.id === org.planId);
                  const price = typeof plan?.price === 'string' ? parseFloat(plan.price) : (plan?.price || 0);
                  return acc + price;
                }, 0).toLocaleString('pt-BR')}` : 
                'Calculando...'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              +R$ 3.500 desde o último mês
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Organizações</CardTitle>
            <div className="flex gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input placeholder="Buscar organizações..." className="pl-10" />
              </div>
              <Button variant="outline">Exportar</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            {isLoading ? (
              <p className="text-center py-4">Carregando...</p>
            ) : (
              <table className="w-full text-sm text-left organizations-table">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Nome</th>
                    <th className="px-6 py-3">Tipo</th>
                    <th className="px-6 py-3">Plano</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Código</th>
                    <th className="px-6 py-3">Criada em</th>
                    <th className="px-6 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {organizations?.map((org) => (
                    <tr key={org.id} className="bg-white border-b">
                      <td className="px-6 py-4 font-medium">{org.name}</td>
                      <td className="px-6 py-4">{org.type}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          org.planTier === 'pro' ? 'bg-purple-100 text-purple-800' :
                          org.planTier === 'grow' ? 'bg-blue-100 text-blue-800' :
                          org.planTier === 'seed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {getPlanName(org.planId)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          org.status === 'active' ? 'bg-green-100 text-green-800' :
                          org.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {org.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {org.orgCode ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs bg-gray-100 py-1 px-2 rounded">{org.orgCode}</span>
                            <button 
                              onClick={() => copyAccessLink(org.orgCode!)}
                              className="flex items-center gap-1 text-xs rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1"
                            >
                              {copiedOrgCode === org.orgCode ? (
                                <>
                                  <Check className="h-3 w-3" /> Copiado
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" /> Copiar URL
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400">Não disponível</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {org.createdAt ? new Date(org.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => navigate(`/organization-modules/${org.id}`)}
                          >
                            <Settings className="h-3 w-3" />
                            Módulos
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => navigate(`/organization/${org.id}`)}
                          >
                            <Database className="h-3 w-3" />
                            Detalhes
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}