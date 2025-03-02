"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { FileText, Search } from "lucide-react";

export default function ActivityLog() {
  // Mock data - would be replaced with real data from API
  const activities = [
    {
      id: 1,
      action: "Login",
      user: "admin@endurancy.com",
      timestamp: "2024-03-02 13:45:23",
      details: "Login bem-sucedido",
    },
    {
      id: 2,
      action: "Organização Criada",
      user: "admin@endurancy.com",
      timestamp: "2024-03-02 13:40:12",
      details: "Nova organização: Tech Solutions",
    },
    // Add more mock activities as needed
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Registro de Atividades</h1>
      <p className="text-gray-600 mb-8">Monitore todas as ações realizadas na plataforma.</p>

      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input placeholder="Buscar atividades..." className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ação</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>{activity.action}</TableCell>
                  <TableCell>{activity.user}</TableCell>
                  <TableCell>{activity.timestamp}</TableCell>
                  <TableCell>{activity.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
