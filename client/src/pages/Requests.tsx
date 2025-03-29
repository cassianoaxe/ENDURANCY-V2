"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InboxIcon, Clock, CheckCircle, XCircle, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Organization } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Requests() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all organizations
  const { data: organizations, isLoading } = useQuery<Organization[]>({
    queryKey: ['/api/organizations'],
    refetchOnWindowFocus: false,
  });
  
  // Calculate statistics
  const allRequests = organizations || [];
  const pendingRequests = allRequests.filter(org => org.status === "pending");
  const approvedRequests = allRequests.filter(org => org.status === "approved");
  const rejectedRequests = allRequests.filter(org => org.status === "rejected");
  
  // Calculate new requests in the last 24 hours
  const last24Hours = new Date();
  last24Hours.setHours(last24Hours.getHours() - 24);
  
  const newRequests = allRequests.filter(org => {
    const createdAt = new Date(org.createdAt || Date.now());
    return createdAt > last24Hours;
  });
  
  // Usando createdAt como referência já que não temos updatedAt ainda
  const newApproved = approvedRequests.filter(org => {
    const createdAt = new Date(org.createdAt || Date.now());
    return createdAt > last24Hours;
  });
  
  // Filter organizations based on search
  const filteredOrganizations = pendingRequests.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(org.id).includes(searchTerm)
  );
  
  // Approve organization mutation
  const approveOrganization = useMutation({
    mutationFn: async (orgId: number) => {
      const res = await apiRequest("PATCH", `/api/organizations/${orgId}`, { status: "approved" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organizations'] });
      toast({
        title: "Organização aprovada com sucesso!",
        description: "A organização foi aprovada e seus administradores foram notificados.",
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
  
  // Reject organization mutation
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
            <div className="text-2xl font-bold">{allRequests.length}</div>
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
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingRequests.length > 0 ? `${pendingRequests.length} aguardando aprovação` : "Nenhuma pendente"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedRequests.length}</div>
            <p className="text-xs text-muted-foreground">
              {newApproved.length > 0 ? `+${newApproved.length} nas últimas 24h` : "Nenhuma nova hoje"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rejeitadas</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedRequests.length}</div>
            <p className="text-xs text-muted-foreground">
              Total de organizações rejeitadas
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
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              {filteredOrganizations.length === 0 ? (
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
                    {filteredOrganizations.map((org) => (
                      <tr key={org.id} className="bg-white border-b">
                        <td className="px-6 py-4">#{org.id}</td>
                        <td className="px-6 py-4 font-medium">{org.name}</td>
                        <td className="px-6 py-4">{org.type}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                            Pendente
                          </span>
                        </td>
                        <td className="px-6 py-4">{formatDate(org.createdAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => approveOrganization.mutate(org.id)}
                              disabled={approveOrganization.isPending}
                            >
                              {approveOrganization.isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : null}
                              Aprovar
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => rejectOrganization.mutate(org.id)}
                              disabled={rejectOrganization.isPending}
                            >
                              {rejectOrganization.isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : null}
                              Rejeitar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
