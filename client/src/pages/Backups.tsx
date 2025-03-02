"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Database, Clock, AlertCircle } from "lucide-react";

export default function Backups() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Backups</h1>
      <p className="text-gray-600 mb-8">Gerencie os backups do sistema e configure a política de retenção.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Último Backup</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 horas atrás</div>
            <p className="text-xs text-muted-foreground">
              02/03/2024 10:45
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tamanho Total</CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">256 GB</div>
            <p className="text-xs text-muted-foreground">
              +2.3 GB desde ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <AlertCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Saudável</div>
            <p className="text-xs text-muted-foreground">
              Todos sistemas operacionais
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Histórico de Backups</CardTitle>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Fazer Backup Agora
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Data</th>
                  <th className="px-6 py-3">Tamanho</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white border-b">
                  <td className="px-6 py-4">02/03/2024 10:45</td>
                  <td className="px-6 py-4">1.2 GB</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Completo
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Button variant="ghost" size="sm">Restaurar</Button>
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
