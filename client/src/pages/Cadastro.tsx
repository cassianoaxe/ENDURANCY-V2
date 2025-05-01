import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowRight, Eye, CheckCircle, Clock, X, Search, Plus, FileText, 
  DollarSign, Building2, Download, Edit, User, Power, Lock, Shield, 
  MoreVertical, Trash2, AlertTriangle, LucideIcon
} from "lucide-react";
import { Link } from "wouter";
import { Organization, Plan } from '@shared/schema';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Cadastro() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("todas");
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Função de navegação que funciona com o sistema do App.tsx
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  // Buscar organizações
  const { data: organizations, isLoading: loadingOrgs } = useQuery({
    queryKey: ['/api/organizations'],
    refetchInterval: 10000, // Recarregar a cada 10 segundos
    queryFn: async () => {
      console.log("Fazendo requisição explícita para /api/organizations");
      try {
        const response = await apiRequest('/api/organizations', { method: 'GET' });
        console.log("Resposta da API de organizações:", response);
        return response;
      } catch (error) {
        console.error("Erro explícito ao buscar organizações:", error);
        throw error;
      }
    }
  });

  // Buscar planos
  const { data: plans, isLoading: loadingPlans } = useQuery({
    queryKey: ['/api/plans'],
    queryFn: async () => {
      return await apiRequest('/api/plans', {
        method: 'GET'
      });
    },
    onSuccess: (data) => {
      console.log("Planos carregados com sucesso:", data);
    },
    onError: (error) => {
      console.error("Erro ao carregar planos:", error);
    }
  });
  
  // Mutação para atualizar status da organização
  const updateOrgStatus = useMutation({
    mutationFn: async ({ id, status, reason }: { id: number, status: string, reason?: string }) => {
      console.log(`Alterando status da organização ${id} para ${status}${reason ? ` com motivo: ${reason}` : ''}`);
      // Usando apiRequest com formato atualizado e proteção CSRF
      return await apiRequest(`/api/organizations/${id}/status`, {
        method: 'PUT',
        data: { status, reason }
      });
    },
    onSuccess: (data) => {
      console.log("Status atualizado com sucesso:", data);
      toast({
        title: "Organização atualizada",
        description: "O status da organização foi alterado com sucesso.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/organizations'] });
      setShowStatusDialog(false);
    },
    onError: (error) => {
      console.error("Erro ao atualizar status da organização:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da organização.",
        variant: "destructive",
      });
    },
  });
  

  
  // Mutação para excluir organização
  const deleteOrganization = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/organizations/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: "Organização excluída",
        description: "A organização foi excluída com sucesso.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/organizations'] });
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      console.error("Erro ao excluir organização:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a organização.",
        variant: "destructive",
      });
    },
  });
  
  // Mutação para enviar link de pagamento
  const sendPaymentLinkMutation = useMutation({
    mutationFn: async (organizationId: number) => {
      return await apiRequest('/api/payment-links/send', {
        method: 'POST',
        data: { organizationId }
      });
    },
    onSuccess: () => {
      toast({
        title: "Link enviado",
        description: "Link de pagamento enviado com sucesso.",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Erro ao enviar link:", error);
      toast({
        title: "Erro ao enviar link",
        description: "Não foi possível enviar o link de pagamento.",
        variant: "destructive",
      });
    },
  });

  // Função wrapper para enviar link de pagamento
  const sendPaymentLink = (organizationId: number) => {
    sendPaymentLinkMutation.mutate(organizationId);
  };

  // Mutação para entrar como administrador da organização
  const loginAsAdminMutation = useMutation({
    mutationFn: async (organizationId: number) => {
      return await apiRequest('/api/auth/login-as-admin', {
        method: 'POST',
        data: { organizationId }
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Login bem-sucedido",
        description: "Você está acessando como administrador da organização.",
        variant: "default",
      });
      
      // Atualizar o contexto de autenticação
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      // Redirecionar para o dashboard da organização (caminho específico para org_admin)
      navigate('/organization/dashboard');
    },
    onError: (error) => {
      console.error("Erro ao fazer login como admin:", error);
      toast({
        title: "Erro de autenticação",
        description: "Não foi possível acessar como administrador.",
        variant: "destructive",
      });
    },
  });
  
  // Função wrapper para login como admin
  const loginAsAdmin = (organizationId: number) => {
    loginAsAdminMutation.mutate(organizationId);
  };

  // Filtrar organizações por termo de busca e status
  const filteredOrganizations = Array.isArray(organizations) 
    ? organizations.filter((org: Organization) => {
        console.log("Organização sendo filtrada:", org.id, org.name, "status:", org.status);
        
        const matchesSearch = searchTerm === "" || 
                            org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (org.adminName && org.adminName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (org.email && org.email.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Mostrar todas as organizações na aba "Todas", independente do status
        if (currentTab === "todas") return matchesSearch;
        if (currentTab === "ativas") {
          const matches = matchesSearch && org.status === "active";
          if (matches) console.log(`Organização ${org.id} (${org.name}) corresponde ao filtro 'ativas'`);
          return matches;
        }
        if (currentTab === "pendentes") {
          const matches = matchesSearch && org.status === "pending";
          if (matches) console.log(`Organização ${org.id} (${org.name}) corresponde ao filtro 'pendentes'`);
          return matches;
        }
        if (currentTab === "analise") {
          const matches = matchesSearch && org.status === "review";
          if (matches) console.log(`Organização ${org.id} (${org.name}) corresponde ao filtro 'analise'`);
          return matches;
        }
        return false;
      }) 
    : [];

  // Ordenar organizações por data (mais recentes primeiro)
  const sortedOrganizations = [...filteredOrganizations].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return dateB.getTime() - dateA.getTime();
  });
  
  // Formatador de data
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "N/A";
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Obter nome do plano de uma organização
  const getPlanName = (planId?: number) => {
    if (!planId || !plans) return 'Nenhum';
    const plansArray = Array.isArray(plans) ? plans : [];
    const plan = plansArray.find((p: Plan) => p.id === planId);
    return plan ? plan.name : 'Desconhecido';
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Cadastro de Organizações</h1>
      <p className="text-gray-600 mb-8">
        Gerencie organizações, vendas e contratos da plataforma em um só lugar.
      </p>

      <div className="flex gap-4 mb-8">
        <Card className="w-1/4 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total de Organizações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{Array.isArray(organizations) ? organizations.length : 0}</p>
            <p className="text-sm text-muted-foreground">
              {sortedOrganizations.filter(o => {
                const date = new Date(o.createdAt || 0);
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                return date > oneMonthAgo;
              }).length}+ novos no último mês
            </p>
          </CardContent>
        </Card>

        <Card className="w-1/4 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Organizações Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {sortedOrganizations.filter(o => o.status === 'active').length}
            </p>
            <p className="text-sm text-muted-foreground">
              Recebendo acesso automático
            </p>
          </CardContent>
        </Card>

        <Card className="w-1/4 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Resumo de Planos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {Array.isArray(plans) ? plans.length : 0} planos
            </p>
            <p className="text-sm text-muted-foreground">
              Disponíveis para organizações
            </p>
          </CardContent>
        </Card>

        <Card className="w-1/4 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Plano mais popular</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              Pro
            </p>
            <p className="text-sm text-muted-foreground">
              70% das organizações
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-1/3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            type="text" 
            placeholder="Buscar organização..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download size={16} /> Exportar
          </Button>
          <a 
            href="/organization-registration" 
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, '', '/organization-registration');
              window.dispatchEvent(new Event('popstate'));
            }}
          >
            <Button className="gap-1.5">
              <Plus size={16} /> Nova Organização
            </Button>
          </a>
        </div>
      </div>

      <Tabs defaultValue="todas" onValueChange={setCurrentTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="ativas">Ativas</TabsTrigger>
          <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
          <TabsTrigger value="analise">Em Análise</TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="p-0">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {loadingOrgs ? (
                <div className="flex justify-center items-center p-8">
                  <Spinner size="lg" />
                </div>
              ) : sortedOrganizations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Organização</TableHead>
                      <TableHead>Administrador</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Data de Registro</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedOrganizations.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">
                          {org.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-gray-400" />
                            {org.name}
                          </div>
                        </TableCell>
                        <TableCell>{org.adminName || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {getPlanName(org.planId)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(org.createdAt)}</TableCell>
                        <TableCell>
                          {org.status === 'active' && (
                            <Badge variant="outline" className="gap-1 bg-green-50 text-green-600 border-green-200">
                              <CheckCircle size={12} /> Ativo
                            </Badge>
                          )}
                          {org.status === 'pending' && (
                            <Badge variant="outline" className="gap-1 bg-yellow-50 text-yellow-600 border-yellow-200">
                              <Clock size={12} /> Pendente
                            </Badge>
                          )}
                          {org.status === 'blocked' && (
                            <Badge variant="destructive" className="gap-1">
                              <X size={12} /> Bloqueado
                            </Badge>
                          )}
                          {org.status === 'review' && (
                            <Badge variant="secondary" className="gap-1">
                              <FileText size={12} /> Em análise
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Visualizar detalhes"
                              onClick={() => {
                                setSelectedOrg(org);
                                // Usar navigate em vez de window.location para manter o estado
                                navigate(`/organizations/${org.id}`);
                              }}
                            >
                              <Eye size={16} className="text-gray-500" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Alterar plano"
                              onClick={() => {
                                setSelectedOrg(org);
                                // Usar navigate em vez de window.location para manter o estado
                                navigate(`/organizations/${org.id}/change-plan`);
                              }}
                            >
                              <DollarSign size={16} className="text-gray-500" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical size={16} className="text-gray-500" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() => {
                                    setSelectedOrg(org);
                                    // Usar navigate em vez de window.location para manter o estado
                                    navigate(`/organizations/${org.id}/edit`);
                                  }}
                                >
                                  <Edit size={14} className="mr-2" /> Editar
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() => {
                                    loginAsAdmin(org.id);
                                  }}
                                >
                                  <User size={14} className="mr-2" /> Entrar como Admin
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() => {
                                    sendPaymentLink(org.id);
                                  }}
                                >
                                  <DollarSign size={14} className="mr-2" /> Enviar link de pagamento
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                                
                                {org.status === 'active' ? (
                                  <DropdownMenuItem
                                    className="cursor-pointer text-amber-600"
                                    onClick={() => {
                                      setSelectedOrg(org);
                                      setShowStatusDialog(true);
                                    }}
                                  >
                                    <Lock size={14} className="mr-2" /> Suspender
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    className="cursor-pointer text-green-600"
                                    onClick={() => {
                                      setSelectedOrg(org);
                                      updateOrgStatus.mutate({ id: org.id, status: 'active' });
                                    }}
                                  >
                                    <Power size={14} className="mr-2" /> Ativar
                                  </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuItem
                                  className="cursor-pointer text-red-600"
                                  onClick={() => {
                                    setSelectedOrg(org);
                                    setShowDeleteDialog(true);
                                  }}
                                >
                                  <Trash2 size={14} className="mr-2" /> Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Building2 size={48} className="mb-2 text-gray-300" />
                  <h3 className="text-lg font-medium mb-1">Nenhuma organização encontrada</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Não existem organizações cadastradas ou que correspondam aos filtros aplicados.
                  </p>
                  <a 
                    href="/organization-registration" 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/organization-registration');
                    }}
                  >
                    <Button className="gap-1.5">
                      <Plus size={16} /> Cadastrar organização
                    </Button>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Os outros TabsContent são similares, apenas com filtros diferentes */}
        <TabsContent value="ativas" className="p-0">
          {/* Conteúdo similar ao de "todas", mas com organizações ativas */}
        </TabsContent>
        <TabsContent value="pendentes" className="p-0">
          {/* Conteúdo similar ao de "todas", mas com organizações pendentes */}
        </TabsContent>
        <TabsContent value="analise" className="p-0">
          {/* Conteúdo similar ao de "todas", mas com organizações em análise */}
        </TabsContent>
      </Tabs>

      {/* Diálogo de confirmação para excluir organização */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle size={18} /> Confirmar exclusão
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a organização <strong>{selectedOrg?.name}</strong>?
              Esta ação é irreversível e removerá todos os dados associados.
            </DialogDescription>
          </DialogHeader>
          <div className="border rounded-md p-4 bg-red-50 text-red-700 text-sm mb-4">
            <p className="flex items-center gap-2">
              <AlertTriangle size={14} className="shrink-0" />
              <span>
                Serão excluídos todos os módulos, usuários e dados cadastrados para esta organização.
              </span>
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={() => deleteOrganization.mutate(selectedOrg?.id!)}
              disabled={deleteOrganization.isPending}
            >
              {deleteOrganization.isPending ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Excluindo...
                </>
              ) : (
                'Confirmar exclusão'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmação para alterar status */}
      <Dialog open={showStatusDialog} onOpenChange={(open) => {
        setShowStatusDialog(open);
        if (!open) setBlockReason("");
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <Lock size={18} /> Suspender organização
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja suspender o acesso da organização <strong>{selectedOrg?.name}</strong>?
              Os usuários não poderão acessar a plataforma enquanto estiver suspensa.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-3">
            <Label htmlFor="block-reason" className="mb-2 block">Motivo da suspensão</Label>
            <Textarea 
              id="block-reason" 
              placeholder="Informe o motivo da suspensão (opcional)"
              value={blockReason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBlockReason(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              variant="default" 
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => updateOrgStatus.mutate({ 
                id: selectedOrg?.id!, 
                status: 'blocked',
                reason: blockReason || 'Suspensão administrativa' 
              })}
              disabled={updateOrgStatus.isPending}
            >
              {updateOrgStatus.isPending ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Processando...
                </>
              ) : (
                'Suspender acesso'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}