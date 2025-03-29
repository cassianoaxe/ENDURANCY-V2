"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronUp, Users, Building2, Clock } from "lucide-react";
import type { Organization } from "@shared/schema";

export default function Dashboard() {
  const { data: organizations, isLoading } = useQuery<Organization[]>({
    queryKey: ['/api/organizations']
  });

  const stats = {
    totalOrgs: organizations?.length || 0,
    activeOrgs: organizations?.filter(org => org.status === 'active').length || 0,
    pendingOrgs: organizations?.filter(org => org.status === 'pending').length || 0,
    totalUsers: 47 // Placeholder
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <p className="text-gray-600 mb-8">Gerencie todas as organizações e usuários da plataforma.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8 dashboard-stats">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Organizações</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrgs}</div>
            <p className="text-xs text-muted-foreground">
              +2 novas organizações no último mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Organizações Ativas</CardTitle>
            <ChevronUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrgs}</div>
            <p className="text-xs text-muted-foreground">
              +1 ativação no último mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Solicitações Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrgs}</div>
            <p className="text-xs text-muted-foreground">
              2 novas solicitações esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +8 novos usuários no último mês
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Organizações</h2>
            <Button variant="outline">Exportar</Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="p-6">
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="active">Ativas</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="rejected">Rejeitadas</TabsTrigger>
          </TabsList>

          <div className="my-4">
            <Input placeholder="Buscar organizações..." className="max-w-sm" />
          </div>

          <div className="relative overflow-x-auto">
            {isLoading ? (
              <p className="text-center py-4">Carregando...</p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Organização</th>
                    <th className="px-6 py-3">Tipo</th>
                    <th className="px-6 py-3">Plano</th>
                    <th className="px-6 py-3">Criada em</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {organizations?.map((org) => (
                    <tr key={org.id} className="bg-white border-b">
                      <td className="px-6 py-4 font-medium">{org.name}</td>
                      <td className="px-6 py-4">{org.type}</td>
                      <td className="px-6 py-4">{org.plan}</td>
                      <td className="px-6 py-4">
                        {new Date(org.createdAt).toLocaleDateString()}
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
                        <Button variant="ghost" size="sm">...</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
