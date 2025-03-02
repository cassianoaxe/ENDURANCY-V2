"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Shield, Activity, Search } from "lucide-react";

export default function Administrators() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Administradores</h1>
      <p className="text-gray-600 mb-8">Gerencie os administradores do sistema e suas permissões.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Admins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              +1 novo admin este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Admins Ativos</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">
              2 inativos
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Administradores</CardTitle>
            <div className="flex gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input placeholder="Buscar administradores..." className="pl-10" />
              </div>
              <Button>Adicionar Admin</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Nome</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Função</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Último Acesso</th>
                  <th className="px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white border-b">
                  <td className="px-6 py-4 font-medium">John Doe</td>
                  <td className="px-6 py-4">john@example.com</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      Super Admin
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Ativo
                    </span>
                  </td>
                  <td className="px-6 py-4">Há 2 horas</td>
                  <td className="px-6 py-4">
                    <Button variant="ghost" size="sm">...</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
