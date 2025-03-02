"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Building2, Users, ArrowUpRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Organization } from "@shared/schema";
import OrganizationRegistrationDialog from "@/components/features/OrganizationRegistrationDialog";

export default function Organizations() {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const { data: organizations, isLoading } = useQuery<Organization[]>({
    queryKey: ['/api/organizations']
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Organizações</h1>
          <p className="text-gray-600">Gerencie todas as organizações da plataforma.</p>
        </div>
        <Button onClick={() => setIsRegistrationOpen(true)}>
          Adicionar Organização
        </Button>
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
            <CardTitle className="text-sm font-medium">Taxa de Crescimento</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15%</div>
            <p className="text-xs text-muted-foreground">
              +3% desde o último mês
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
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Nome</th>
                    <th className="px-6 py-3">Tipo</th>
                    <th className="px-6 py-3">Plano</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Criada em</th>
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
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          org.status === 'active' ? 'bg-green-100 text-green-800' :
                          org.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {org.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(org.createdAt).toLocaleDateString()}
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
        </CardContent>
      </Card>

      <OrganizationRegistrationDialog
        open={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
      />
    </div>
  );
}