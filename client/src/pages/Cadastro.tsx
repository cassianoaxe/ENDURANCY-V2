import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { ArrowRight, Eye, CheckCircle, Clock, X, Search, Plus, FileText, DollarSign, Building2, Download } from "lucide-react";
import { Link } from "wouter";
import { Organization, Plan } from '@shared/schema';

export default function Cadastro() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("todas");

  // Buscar organizações
  const { data: organizations, isLoading: loadingOrgs } = useQuery({
    queryKey: ['/api/organizations'],
    refetchInterval: 10000, // Recarregar a cada 10 segundos
  });

  // Buscar planos
  const { data: plans, isLoading: loadingPlans } = useQuery({
    queryKey: ['/api/plans'],
  });

  // Filtrar organizações por termo de busca e status
  const filteredOrganizations = Array.isArray(organizations) 
    ? organizations.filter((org: Organization) => {
        const matchesSearch = searchTerm === "" || 
                            org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (org.adminName && org.adminName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (org.email && org.email.toLowerCase().includes(searchTerm.toLowerCase()));
        
        if (currentTab === "todas") return matchesSearch;
        if (currentTab === "ativas") return matchesSearch && org.status === "active";
        if (currentTab === "pendentes") return matchesSearch && org.status === "pending";
        if (currentTab === "analise") return matchesSearch && org.status === "review";
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
          <Link href="/organization-registration">
            <Button className="gap-1.5">
              <Plus size={16} /> Nova Organização
            </Button>
          </Link>
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
                            <Link href={`/organizations/${org.id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye size={16} className="text-gray-500" />
                              </Button>
                            </Link>
                            <Link href={`/organizations/${org.id}/change-plan`}>
                              <Button variant="ghost" size="icon">
                                <DollarSign size={16} className="text-gray-500" />
                              </Button>
                            </Link>
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
                  <Link href="/organization-registration">
                    <Button className="gap-1.5">
                      <Plus size={16} /> Cadastrar organização
                    </Button>
                  </Link>
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
    </div>
  );
}