"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InboxIcon, Clock, CheckCircle, XCircle, Search, Loader2, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Organization } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// Interface para as solicitações de mudança de plano
interface PlanChangeRequest {
  id: number;
  name: string;
  type: string;
  email: string;
  currentPlanId: number;
  requestedPlanId: number;
  currentPlanName: string;
  requestedPlanName: string;
  status: string;
  requestDate: string;
  updatedAt: string;
}

export default function Requests() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all organizations with pending registrations
  const { data: organizations, isLoading: isLoadingOrganizations } = useQuery<Organization[]>({
    queryKey: ['/api/organizations'],
    refetchOnWindowFocus: false,
  });
  
  // Fetch all plan change requests
  const { data: planChangeData, isLoading: isLoadingPlanChanges } = useQuery<{
    success: boolean;
    totalRequests: number;
    requests: PlanChangeRequest[];
  }>({
    queryKey: ['/api/plan-change-requests'],
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      console.log("Dados de solicitações de mudança de plano recebidos:", data);
    },
    onError: (error) => {
      console.error("Erro ao buscar solicitações de mudança de plano:", error);
    }
  });
  
  // Calculate statistics
  const allOrganizations = organizations || [];
  const pendingRegistrations = allOrganizations.filter(org => org.status === "pending");
  const approvedRequests = allOrganizations.filter(org => org.status === "approved");
  const rejectedRequests = allOrganizations.filter(org => org.status === "rejected");
  
  // Extrair as solicitações de mudança de plano
  const pendingPlanChanges: PlanChangeRequest[] = planChangeData?.requests || [];
  
  // Total de solicitações (registros + mudanças de plano)
  const totalRequests = pendingRegistrations.length + pendingPlanChanges.length;
  
  // Calculate new requests in the last 24 hours
  const last24Hours = new Date();
  last24Hours.setHours(last24Hours.getHours() - 24);
  
  const newRequests = allOrganizations.filter(org => {
    const createdAt = new Date(org.createdAt || Date.now());
    return createdAt > last24Hours;
  });
  
  // Usando createdAt como referência já que não temos updatedAt ainda
  const newApproved = approvedRequests.filter(org => {
    const createdAt = new Date(org.createdAt || Date.now());
    return createdAt > last24Hours;
  });
  
  // Todos os pedidos pendentes (registros + mudanças de plano)
  const allPendingRequests = [
    ...pendingRegistrations.map(org => ({
      id: org.id,
      name: org.name,
      type: org.type,
      email: org.email,
      status: org.status,
      requestType: 'registration',
      date: org.createdAt
    }))
  ];
  
  // Log detalhado das solicitações de plano
  console.log("Todas as solicitações de plano recebidas:", pendingPlanChanges);
  
  // Adicionar solicitações de plano se existirem
  if (pendingPlanChanges && pendingPlanChanges.length > 0) {
    pendingPlanChanges.forEach(req => {
      console.log("Mapeando requisição de plano:", req);
      // Garantir que o objeto tenha todos os campos necessários
      allPendingRequests.push({
        id: req.id,
        name: req.name || 'Organização sem nome',
        type: req.type || 'Organização',
        email: req.email || 'sem-email@example.com',
        status: 'pending',
        requestType: 'plan_change',
        date: req.requestDate || new Date(),
        currentPlanId: req.currentPlanId,
        requestedPlanId: req.requestedPlanId,
        currentPlanName: req.currentPlanName || 'Plano não informado',
        requestedPlanName: req.requestedPlanName || 'Plano não informado'
      });
    });
  } else {
    console.log("Não há solicitações de plano pendentes.");
  }
  
  // Filter requests based on search
  const filteredRequests = allPendingRequests.filter(req => 
    req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(req.id).includes(searchTerm)
  );
  
  // Approve organization registration mutation
  const approveOrganization = useMutation({
    mutationFn: async (orgId: number) => {
      const res = await apiRequest("PATCH", `/api/organizations/${orgId}`, { status: "approved" });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/organizations'] });
      
      const orgCode = data.orgCode;
      
      toast({
        title: "Organização aprovada com sucesso!",
        description: orgCode 
          ? `Código de acesso gerado: ${orgCode}`
          : "A organização foi aprovada e seus administradores foram notificados.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao aprovar organização",
        description: "Ocorreu um erro ao tentar aprovar a organização.",
        variant: "destructive",
      });
    },
  });
  
  // Reject organization registration mutation
  const rejectOrganization = useMutation({
    mutationFn: async (orgId: number) => {
      const res = await apiRequest("PATCH", `/api/organizations/${orgId}`, { status: "rejected" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organizations'] });
      toast({
        title: "Organização rejeitada",
        description: "A organização foi rejeitada e seus administradores foram notificados.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao rejeitar organização",
        description: "Ocorreu um erro ao tentar rejeitar a organização.",
        variant: "destructive",
      });
    },
  });
  
  // Approve plan change mutation
  const approvePlanChange = useMutation({
    mutationFn: async (orgId: number) => {
      // Buscar informações do plano solicitado
      console.log(`Aprovando mudança de plano para organização ${orgId}`);
      const requestData = planChangeData?.requests.find(req => req.id === orgId);
      console.log("Dados da solicitação:", requestData);
      
      // Adicionar mais logs para depuração
      console.log("URL da chamada:", "/api/plan-change-requests/approve");
      console.log("Payload da requisição:", { 
        organizationId: orgId,
        planId: requestData?.requestedPlanId
      });
      
      // Usar endpoint nas rotas definidas em plan-changes.ts
      console.log("Usando rota de aprovação em /api/plan-change-requests/approve");
      const res = await apiRequest("POST", `/api/plan-change-requests/approve`, { 
        organizationId: orgId,
        planId: requestData?.requestedPlanId 
      });
      
      // Tentar interpretar a resposta para debug
      const responseText = await res.text();
      console.log("Resposta bruta:", responseText);
      
      try {
        return JSON.parse(responseText);
      } catch (e) {
        console.error("Erro ao parsear resposta JSON:", e);
        throw new Error(`Falha na resposta da API: ${responseText}`);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/plan-change-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/organizations'] });
      
      toast({
        title: "Mudança de plano aprovada!",
        description: "A solicitação de mudança de plano foi aprovada com sucesso e um e-mail de confirmação foi enviado ao usuário.",
      });
      
      // Mostrar detalhes adicionais se disponíveis na resposta
      if (data?.modulesAdded) {
        toast({
          title: "Módulos configurados",
          description: `${data.modulesAdded} módulos foram adicionados à organização de acordo com o plano escolhido.`,
          variant: "default"
        });
      }
      
      // Informar sobre o redirecionamento para o login
      setTimeout(() => {
        toast({
          title: "Sistema reiniciado",
          description: "O usuário precisará fazer login novamente para acessar os novos recursos.",
          variant: "default"
        });
      }, 1000);
    },
    onError: (error) => {
      console.error("Erro ao aprovar mudança de plano:", error);
      toast({
        title: "Erro ao aprovar mudança de plano",
        description: "Ocorreu um erro ao processar a aprovação.",
        variant: "destructive",
      });
    },
  });
  
  // Reject plan change mutation
  const rejectPlanChange = useMutation({
    mutationFn: async (orgId: number) => {
      console.log(`Rejeitando mudança de plano para organização ${orgId}`);
      const requestData = planChangeData?.requests.find(req => req.id === orgId);
      console.log("Dados da solicitação:", requestData);
      
      // Adicionar mais logs para depuração
      console.log("URL da chamada:", "/api/plan-change-requests/reject");
      console.log("Payload da requisição:", { 
        organizationId: orgId 
      });
      
      const res = await apiRequest("POST", `/api/plan-change-requests/reject`, { 
        organizationId: orgId 
      });
      
      // Tentar interpretar a resposta para debug
      const responseText = await res.text();
      console.log("Resposta bruta de rejeição:", responseText);
      
      try {
        return JSON.parse(responseText);
      } catch (e) {
        console.error("Erro ao parsear resposta JSON na rejeição:", e);
        throw new Error(`Falha na resposta da API de rejeição: ${responseText}`);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/plan-change-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/organizations'] });
      
      toast({
        title: "Mudança de plano rejeitada",
        description: "A solicitação de mudança de plano foi rejeitada e um e-mail de notificação foi enviado ao usuário.",
      });
      
      // Informar sobre o redirecionamento para o login
      setTimeout(() => {
        toast({
          title: "Sistema atualizado",
          description: "O usuário foi notificado e precisará fazer login novamente para continuar usando o sistema.",
          variant: "default"
        });
      }, 1000);
    },
    onError: (error) => {
      console.error("Erro ao rejeitar mudança de plano:", error);
      toast({
        title: "Erro ao rejeitar mudança de plano",
        description: "Ocorreu um erro ao processar a rejeição.",
        variant: "destructive",
      });
    },
  });
  
  // Format date for display
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Solicitações</h1>
      <p className="text-gray-600 mb-8">Gerencie todas as solicitações recebidas na plataforma.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Solicitações</CardTitle>
            <InboxIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              {newRequests.length > 0 ? `+${newRequests.length} novas hoje` : "Nenhuma nova hoje"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              {totalRequests > 0 
                ? `${pendingRegistrations.length} registros, ${pendingPlanChanges.length} planos` 
                : "Nenhuma pendente"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mudanças de Plano</CardTitle>
            <RefreshCcw className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPlanChanges.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingPlanChanges.length > 0 
                ? `${pendingPlanChanges.length} aguardando aprovação` 
                : "Nenhuma mudança pendente"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Novos Registros</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-purple-500">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRegistrations.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingRegistrations.length > 0 
                ? `${pendingRegistrations.length} organizações aguardando` 
                : "Nenhum registro pendente"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Solicitações</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input 
                placeholder="Buscar solicitações..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingOrganizations || isLoadingPlanChanges ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? "Nenhuma solicitação encontrada com os critérios de busca." : "Não há solicitações pendentes no momento."}
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">ID</th>
                      <th className="px-6 py-3">Organização</th>
                      <th className="px-6 py-3">Tipo</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Data</th>
                      <th className="px-6 py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((req) => {
                      // Verifica se é requisição de mudança de plano ou registro
                      const isPlanChangeRequest = req.requestType === 'plan_change';
                      const requestTypeDisplay = isPlanChangeRequest 
                        ? "Alteração de Plano" 
                        : "Novo Registro";
                      
                      return (
                        <tr key={`${req.requestType}-${req.id}`} className="bg-white border-b">
                          <td className="px-6 py-4">#{req.id}</td>
                          <td className="px-6 py-4 font-medium">{req.name}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${isPlanChangeRequest 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'}`}
                            >
                              {requestTypeDisplay}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                              Pendente
                            </span>
                          </td>
                          <td className="px-6 py-4">{formatDate(req.date)}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 flex-wrap">
                              {!isPlanChangeRequest ? (
                                // Botões para solicitações de registro
                                <>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => approveOrganization.mutate(req.id)}
                                    disabled={approveOrganization.isPending}
                                    className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" /> Aprovar
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => rejectOrganization.mutate(req.id)}
                                    disabled={rejectOrganization.isPending}
                                    className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                  >
                                    <XCircle className="h-4 w-4 mr-1" /> Rejeitar
                                  </Button>
                                </>
                              ) : (
                                // Botões para solicitações de mudança de plano
                                <>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => approvePlanChange.mutate(req.id)}
                                    disabled={approvePlanChange.isPending}
                                    className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" /> Aprovar
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => rejectPlanChange.mutate(req.id)}
                                    disabled={rejectPlanChange.isPending}
                                    className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                  >
                                    <XCircle className="h-4 w-4 mr-1" /> Rejeitar
                                  </Button>
                                  <div className="w-full mt-1 text-xs text-gray-500">
                                    {isPlanChangeRequest && (
                                      <span>
                                        {req.currentPlanName} → {req.requestedPlanName}
                                      </span>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}