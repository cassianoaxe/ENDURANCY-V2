'use client';

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Package2, MoreHorizontal, Eye, Download, Clock, Check, ShoppingBag, Calendar } from "lucide-react";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import NovaSolicitacaoDialog from "@/components/compras/NovaSolicitacaoDialog";

// Dados mockados para pedidos de compra
const pedidos = [
  {
    id: 1,
    codigo: "PC-2023-0001",
    data: "10/06/2023",
    solicitante: {
      nome: "Carlos Mendes",
      departamento: "Laboratório"
    },
    fornecedor: "Sigma Aldrich",
    valorTotal: "R$ 7.250,30",
    status: "aprovado",
    previsaoEntrega: "19/06/2023"
  },
  {
    id: 2,
    codigo: "PC-2023-0002",
    data: "12/06/2023",
    solicitante: {
      nome: "Ana Silva",
      departamento: "Produção"
    },
    fornecedor: "EmbalaFarma",
    valorTotal: "R$ 3.850,00",
    status: "aguardando_entrega",
    previsaoEntrega: "21/06/2023"
  },
  {
    id: 3,
    codigo: "PC-2023-0003",
    data: "15/06/2023",
    solicitante: {
      nome: "Paulo Sousa",
      departamento: "TI"
    },
    fornecedor: "Dell Computadores",
    valorTotal: "R$ 10.400,00",
    status: "pendente",
    previsaoEntrega: null
  }
];

// Componentes de Status
function StatusBadge({ status }: { status: string }) {
  const configs = {
    pendente: {
      label: 'Pendente',
      variant: 'default',
      className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200'
    },
    aprovado: {
      label: 'Aprovado',
      variant: 'default',
      className: 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200'
    },
    aguardando_entrega: {
      label: 'Aguardando Entrega',
      variant: 'default',
      className: 'bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200'
    },
    recebido: {
      label: 'Recebido',
      variant: 'default',
      className: 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200'
    },
    cancelado: {
      label: 'Cancelado',
      variant: 'default',
      className: 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200'
    }
  };

  const config = configs[status as keyof typeof configs] || configs.pendente;

  return (
    <Badge 
      variant={config.variant as any} 
      className={config.className}
    >
      {config.label}
    </Badge>
  );
}

export default function PedidosCompra() {
  const [statusAtivo, setStatusAtivo] = useState<string>("em_andamento");
  const [termoBusca, setTermoBusca] = useState<string>("");
  const [dialogNovoAberto, setDialogNovoAberto] = useState<boolean>(false);

  // Filtra pedidos com base no status e termo de busca
  const pedidosFiltrados = pedidos.filter(pedido => {
    // Filtro por status
    if (statusAtivo === "em_andamento" && (pedido.status === "recebido" || pedido.status === "cancelado")) {
      return false;
    }
    if (statusAtivo === "recebidos" && pedido.status !== "recebido") {
      return false;
    }
    if (statusAtivo === "rejeitados" && pedido.status !== "cancelado") {
      return false;
    }
    
    // Filtro por termo de busca
    if (termoBusca) {
      const termo = termoBusca.toLowerCase();
      return (
        pedido.codigo.toLowerCase().includes(termo) ||
        pedido.solicitante.nome.toLowerCase().includes(termo) ||
        pedido.fornecedor.toLowerCase().includes(termo)
      );
    }
    
    return true;
  });

  return (
    <OrganizationLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pedidos de Compra</h1>
            <p className="text-muted-foreground">
              Gerencie os pedidos de compra da organização
            </p>
          </div>
          <Button onClick={() => setDialogNovoAberto(true)} className="gap-2">
            <Package2 className="h-4 w-4" />
            Nova Solicitação
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button 
            variant={statusAtivo === "em_andamento" ? "default" : "outline"}
            className="gap-2"
            onClick={() => setStatusAtivo("em_andamento")}
          >
            <Clock className="h-4 w-4" /> Em Andamento
          </Button>
          <Button 
            variant={statusAtivo === "recebidos" ? "default" : "outline"}
            className="gap-2"
            onClick={() => setStatusAtivo("recebidos")}
          >
            <Check className="h-4 w-4" /> Recebidos
          </Button>
          <Button 
            variant={statusAtivo === "rejeitados" ? "default" : "outline"}
            className="gap-2"
            onClick={() => setStatusAtivo("rejeitados")}
          >
            <Check className="h-4 w-4" /> Rejeitados
          </Button>
          <Button 
            variant={statusAtivo === "todos" ? "default" : "outline"}
            className="gap-2"
            onClick={() => setStatusAtivo("todos")}
          >
            <ShoppingBag className="h-4 w-4" /> Todos
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Pedidos de Compra</h2>
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar pedidos..."
                    className="pl-8"
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                  />
                </div>
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="pendente">Pendente</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="aguardando_entrega">Aguardando Entrega</option>
                  <option value="recebido">Recebido</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 text-left font-medium">Número</th>
                    <th className="py-3 px-4 text-left font-medium">Data</th>
                    <th className="py-3 px-4 text-left font-medium">Solicitante</th>
                    <th className="py-3 px-4 text-left font-medium">Fornecedor</th>
                    <th className="py-3 px-4 text-left font-medium">Valor Total</th>
                    <th className="py-3 px-4 text-left font-medium">Status</th>
                    <th className="py-3 px-4 text-left font-medium">Previsão de Entrega</th>
                    <th className="py-3 px-4 text-left font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidosFiltrados.map((pedido) => (
                    <tr key={pedido.id} className="border-b">
                      <td className="py-3 px-4 font-medium">
                        {pedido.codigo}
                      </td>
                      <td className="py-3 px-4">
                        {pedido.data}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span>{pedido.solicitante.nome}</span>
                          <span className="text-xs text-muted-foreground">{pedido.solicitante.departamento}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {pedido.fornecedor}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {pedido.valorTotal}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={pedido.status} />
                      </td>
                      <td className="py-3 px-4">
                        {pedido.previsaoEntrega || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem className="gap-2">
                                <Eye className="h-4 w-4" /> Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Download className="h-4 w-4" /> Exportar PDF
                              </DropdownMenuItem>
                              {pedido.status === "pendente" && (
                                <DropdownMenuItem className="gap-2">
                                  <Check className="h-4 w-4" /> Aprovar pedido
                                </DropdownMenuItem>
                              )}
                              {pedido.status === "aguardando_entrega" && (
                                <DropdownMenuItem className="gap-2">
                                  <Calendar className="h-4 w-4" /> Atualizar previsão
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <NovaSolicitacaoDialog 
        open={dialogNovoAberto} 
        onOpenChange={setDialogNovoAberto} 
      />
    </OrganizationLayout>
  );
}