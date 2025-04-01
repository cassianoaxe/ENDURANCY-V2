import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Building2, Users, ArrowUpRight, Copy, Check, Settings, 
  Database, CreditCard, Leaf, Ban, Power, Mail, PenLine, MoreHorizontal
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Organization, Plan } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function Organizations() {
  // Navigation function to replace wouter
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };
  
  const { toast } = useToast();
  const [copiedOrgCode, setCopiedOrgCode] = useState<string | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
  });
  
  const { data: allOrganizations, isLoading, refetch } = useQuery<Organization[]>({
    queryKey: ['/api/organizations']
  });
  
  const { data: plans } = useQuery<Plan[]>({
    queryKey: ['/api/plans']
  });
  
  // Mutation para suspender/reativar organizações
  const toggleOrgStatusMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: number, status: string, reason?: string }) => {
      const response = await apiRequest('PUT', `/api/organizations/${id}/status`, { status, reason });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status atualizado",
        description: selectedOrg?.status === "active" 
          ? "Organização suspensa com sucesso" 
          : "Organização reativada com sucesso",
      });
      setIsSuspendDialogOpen(false);
      setSuspendReason('');
      setSelectedOrg(null);
      // Recarregar dados
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao atualizar status: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Mutation para editar organização
  const updateOrgMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const response = await apiRequest('PUT', `/api/organizations/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Organização atualizada",
        description: "Dados da organização foram atualizados com sucesso",
      });
      setIsEditDialogOpen(false);
      setSelectedOrg(null);
      // Recarregar dados
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao atualizar organização: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Mutation para enviar email de boas-vindas
  const sendWelcomeEmailMutation = useMutation({
    mutationFn: async ({ id, message }: { id: number, message: string }) => {
      const response = await apiRequest('POST', `/api/organizations/${id}/send-welcome-email`, { message });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email enviado",
        description: "Email de boas-vindas enviado com sucesso",
      });
      setIsEmailDialogOpen(false);
      setEmailMessage('');
      setSelectedOrg(null);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao enviar email: ${error.message}`,
        variant: "destructive"
      });
    }
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

  // Funções para lidar com alterações em formulários
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSuspendSubmit = () => {
    if (selectedOrg) {
      toggleOrgStatusMutation.mutate({
        id: selectedOrg.id,
        status: 'suspended',
        reason: suspendReason
      });
    }
  };

  const handleEditSubmit = () => {
    if (selectedOrg) {
      updateOrgMutation.mutate({
        id: selectedOrg.id,
        data: formData
      });
    }
  };

  const handleEmailSubmit = () => {
    if (selectedOrg) {
      sendWelcomeEmailMutation.mutate({
        id: selectedOrg.id,
        message: emailMessage
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#e6f7e6] rounded-lg">
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
                      <td className="px-6 py-4 font-medium">
                        <button
                          onClick={() => navigate(`/organizations/${org.id}`)}
                          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                        >
                          {org.name}
                          <ArrowUpRight className="h-3 w-3 ml-1" />
                        </button>
                      </td>
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="flex items-center gap-1">
                                <MoreHorizontal className="h-3 w-3" />
                                Ações
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px]">
                              <DropdownMenuLabel>Gerenciar organização</DropdownMenuLabel>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedOrg(org);
                                  setFormData({
                                    name: org.name || '',
                                    email: org.email || '',
                                    phone: org.phone || '',
                                    website: org.website || '',
                                    address: org.address || '',
                                    city: org.city || '',
                                    state: org.state || '',
                                  });
                                  setIsEditDialogOpen(true);
                                }}
                                className="cursor-pointer"
                              >
                                <PenLine className="mr-2 h-4 w-4" />
                                Editar dados
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedOrg(org);
                                  setIsEmailDialogOpen(true);
                                  setEmailMessage(`Olá ${org.adminName || 'Administrador'},\n\nSeja bem-vindo ao Endurancy! Seu acesso à plataforma foi configurado e você já pode acessar o sistema.\n\nDados de acesso:\n- URL: ${window.location.origin}/login/${org.orgCode}\n- Usuário: ${org.email || 'seu e-mail cadastrado'}\n\nAcesse agora mesmo e configure sua senha de acesso no primeiro login.\n\nAtenciosamente,\nEquipe Endurancy.`);
                                }}
                                className="cursor-pointer"
                              >
                                <Mail className="mr-2 h-4 w-4" />
                                Enviar email de boas-vindas
                              </DropdownMenuItem>
                              {org.status === 'active' ? (
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedOrg(org);
                                    setIsSuspendDialogOpen(true);
                                  }}
                                  className="cursor-pointer text-red-600"
                                >
                                  <Ban className="mr-2 h-4 w-4" />
                                  Suspender
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedOrg(org);
                                    toggleOrgStatusMutation.mutate({ 
                                      id: org.id, 
                                      status: 'active' 
                                    });
                                  }}
                                  className="cursor-pointer text-green-600"
                                >
                                  <Power className="mr-2 h-4 w-4" />
                                  Reativar
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                            onClick={() => navigate(`/organizations/${org.id}`)}
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