"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DollarSign, 
  Users, 
  Building2, 
  Package, 
  Search, 
  Loader2, 
  RefreshCcw,
  CheckCircle,
  ArrowUpRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Organization } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function Vendas() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'pending', 'approved'

  // Buscar organizações
  const { data: organizations, isLoading: isLoadingOrganizations } = useQuery<Organization[]>({
    queryKey: ['/api/organizations'],
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  // Filtrar organizações
  const filteredOrganizations = organizations ? organizations.filter((org: Organization) => {
    // Filtrar pelo status
    if (statusFilter !== "all" && org.status !== statusFilter) {
      return false;
    }
    
    // Filtrar pelo termo de busca
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        (org.name?.toLowerCase().includes(searchTermLower) || 
        org.adminName?.toLowerCase().includes(searchTermLower) || 
        org.email?.toLowerCase().includes(searchTermLower))
      );
    }
    
    return true;
  }) : [];

  // Organizações aprovadas e pendentes
  const approvedOrganizations = organizations ? organizations.filter((org: Organization) => org.status === "approved") : [];
  const pendingRegistrations = organizations ? organizations.filter((org: Organization) => org.status === "pending") : [];
  const totalSales = organizations ? organizations.length : 0;

  // Vendas recentes (últimos 30 dias)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentSales = organizations ? organizations.filter((org: Organization) => {
    if (!org.createdAt) return false;
    const creationDate = new Date(org.createdAt);
    return creationDate > thirtyDaysAgo;
  }) : [];

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
  
  // A ativação de organização agora é totalmente automática após o pagamento

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Vendas</h1>
      <p className="text-gray-600 mb-8">Gerencie todas as vendas e contratos da plataforma.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground">
              {recentSales.length > 0 ? `+${recentSales.length} nos últimos 30 dias` : "Nenhuma recente"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedOrganizations.length}</div>
            <p className="text-xs text-muted-foreground">
              {approvedOrganizations.length > 0 
                ? `${Math.round((approvedOrganizations.length / totalSales) * 100)}% do total` 
                : "Nenhum contrato ativo"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendentes de Ativação</CardTitle>
            <RefreshCcw className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRegistrations.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingRegistrations.length > 0 
                ? `${pendingRegistrations.length} aguardando ativação` 
                : "Nenhuma pendente"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <Package className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 39.850</div>
            <p className="text-xs text-muted-foreground">
              {`+12% em relação ao mês anterior`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Contratos</CardTitle>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input 
                  placeholder="Buscar contratos..." 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="approved">Ativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingOrganizations ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              {sortedOrganizations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? "Nenhum contrato encontrado com os critérios de busca." 
                    : "Não há contratos registrados no momento."}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Organização</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedOrganizations.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">{org.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{org.name}</div>
                            <div className="text-sm text-muted-foreground">{org.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {org.plan || 'Básico'}
                        </TableCell>
                        <TableCell>
                          {formatDate(org.createdAt?.toString())}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            org.status === 'approved' ? 'bg-green-100 text-green-800' : 
                            org.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }>
                            {org.status === 'approved' ? 'Ativo' : 
                             org.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                window.history.pushState({}, '', `/organizations/${org.id}`);
                                window.dispatchEvent(new Event('popstate'));
                              }}
                            >
                              <ArrowUpRight className="h-3 w-3 mr-1" />
                              Detalhes
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}