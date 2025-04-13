'use client';

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Package2, Filter, MoreHorizontal, Eye, ClipboardEdit, Check, Clock, ShoppingCart, Package, X } from "lucide-react";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { NovaSolicitacaoDialog } from "@/components/compras/NovaSolicitacaoDialog";

// Dados mockados para demonstração
const solicitacoes = [
  {
    id: 1,
    codigo: "#SOL-2023-0145",
    titulo: "Reagentes para testes de qualidade",
    solicitante: "Carlos Silva",
    setor: "Laboratório",
    data: "28/06/2023, 11:30",
    urgencia: "alta",
    valor: "R$ 3.450,80",
    status: "pendente"
  },
  {
    id: 2,
    codigo: "#SOL-2023-0144",
    titulo: "Materiais de embalagem - lote mensal",
    solicitante: "Ana Oliveira",
    setor: "Produção",
    data: "27/06/2023, 07:15",
    urgencia: "media",
    valor: "R$ 7.820,25",
    status: "em_cotacao"
  },
  {
    id: 3,
    codigo: "#SOL-2023-0143",
    titulo: "Licenças de software e equipamentos",
    solicitante: "Ricardo Mendes",
    setor: "TI",
    data: "26/06/2023, 13:45",
    urgencia: "baixa",
    valor: "R$ 12.450,00",
    status: "aprovada"
  },
  {
    id: 4,
    codigo: "#SOL-2023-0142",
    titulo: "Material de escritório trimestral",
    solicitante: "Juliana Costa",
    setor: "Administrativo",
    data: "25/06/2023, 06:20",
    urgencia: "baixa",
    valor: "R$ 1.890,75",
    status: "aprovada"
  },
  {
    id: 5,
    codigo: "#SOL-2023-0141",
    titulo: "Vidrarias e equipamentos de precisão",
    solicitante: "Pedro Santos",
    setor: "Laboratório",
    data: "24/06/2023, 12:10",
    urgencia: "media",
    valor: "R$ 9.320,50",
    status: "aguardando_entrega"
  },
  {
    id: 6,
    codigo: "#SOL-2023-0140",
    titulo: "Material para feira setorial",
    solicitante: "Mariana Alves",
    setor: "Marketing",
    data: "23/06/2023, 08:30",
    urgencia: "media",
    valor: "R$ 4.500,00",
    status: "recebida"
  }
];

// Função para renderizar o ícone de status
function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'pendente':
      return <Clock className="h-4 w-4 text-amber-500" />;
    case 'em_cotacao':
      return <ShoppingCart className="h-4 w-4 text-blue-500" />;
    case 'aprovada':
      return <Check className="h-4 w-4 text-emerald-500" />;
    case 'aguardando_entrega':
      return <Package className="h-4 w-4 text-purple-500" />;
    case 'recebida':
      return <Check className="h-4 w-4 text-green-500" />;
    case 'rejeitada':
      return <X className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
}

// Função para renderizar o badge de status
function StatusBadge({ status }: { status: string }) {
  const configs = {
    pendente: {
      label: 'Pendente',
      variant: 'outline'
    },
    em_cotacao: {
      label: 'Em Cotação',
      variant: 'default',
      className: 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200'
    },
    aprovada: {
      label: 'Aprovada',
      variant: 'default',
      className: 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200'
    },
    aguardando_entrega: {
      label: 'Aguardando Entrega',
      variant: 'default',
      className: 'bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200'
    },
    recebida: {
      label: 'Recebida',
      variant: 'default',
      className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
    },
    rejeitada: {
      label: 'Rejeitada',
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

// Função para renderizar o badge de urgência
function UrgenciaBadge({ urgencia }: { urgencia: string }) {
  const configs = {
    baixa: {
      label: 'Baixa',
      variant: 'default',
      className: 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200'
    },
    media: {
      label: 'Média',
      variant: 'default',
      className: 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200'
    },
    alta: {
      label: 'Alta',
      variant: 'default',
      className: 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200'
    }
  };

  const config = configs[urgencia as keyof typeof configs] || configs.media;

  return (
    <Badge 
      variant={config.variant as any} 
      className={config.className}
    >
      {config.label}
    </Badge>
  );
}

export default function SolicitacoesCompra() {
  const [termoBusca, setTermoBusca] = useState("");
  const [statusAtivo, setStatusAtivo] = useState("todas");
  const [dialogNovaSolicitacaoAberto, setDialogNovaSolicitacaoAberto] = useState(false);

  // Filtra solicitações com base no termo de busca e status ativo
  const solicitacoesFiltradas = solicitacoes.filter(sol => {
    // Filtro por status
    if (statusAtivo !== "todas") {
      if (statusAtivo === "pendentes" && sol.status !== "pendente") return false;
      if (statusAtivo === "em_cotacao" && sol.status !== "em_cotacao") return false;
      if (statusAtivo === "aprovadas" && sol.status !== "aprovada") return false;
      if (statusAtivo === "aguardando_entrega" && sol.status !== "aguardando_entrega") return false;
      if (statusAtivo === "recebidas" && sol.status !== "recebida") return false;
    }
    
    // Filtro por termo de busca
    if (termoBusca) {
      const termoLower = termoBusca.toLowerCase();
      return (
        sol.titulo.toLowerCase().includes(termoLower) ||
        sol.solicitante.toLowerCase().includes(termoLower) ||
        sol.setor.toLowerCase().includes(termoLower) ||
        sol.codigo.toLowerCase().includes(termoLower)
      );
    }
    
    return true;
  });

  return (
    <OrganizationLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Solicitações de Compra</h1>
            <p className="text-muted-foreground">
              Gerencie todas as solicitações de compra da organização
            </p>
          </div>
          <Button onClick={() => setDialogNovaSolicitacaoAberto(true)} className="gap-2">
            <Package2 className="h-4 w-4" />
            Nova Solicitação
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar solicitações..."
              className="pl-8"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <div className="flex-shrink-0">
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
              defaultValue="recentes"
            >
              <option value="recentes">Mais recentes</option>
              <option value="antigas">Mais antigas</option>
              <option value="valor_maior">Maior valor</option>
              <option value="valor_menor">Menor valor</option>
            </select>
          </div>
        </div>

        <Tabs defaultValue="todas" value={statusAtivo} onValueChange={setStatusAtivo} className="space-y-4">
          <TabsList>
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
            <TabsTrigger value="em_cotacao">Em Cotação</TabsTrigger>
            <TabsTrigger value="aprovadas">Aprovadas</TabsTrigger>
            <TabsTrigger value="aguardando_entrega">Aguardando Entrega</TabsTrigger>
            <TabsTrigger value="recebidas">Recebidas</TabsTrigger>
          </TabsList>

          <Card>
            <CardContent className="p-0">
              <div className="rounded-md overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium">Status</th>
                      <th className="py-3 px-4 text-left font-medium">Solicitação</th>
                      <th className="py-3 px-4 text-left font-medium">Solicitante</th>
                      <th className="py-3 px-4 text-left font-medium">Setor</th>
                      <th className="py-3 px-4 text-left font-medium">Data</th>
                      <th className="py-3 px-4 text-left font-medium">Urgência</th>
                      <th className="py-3 px-4 text-left font-medium">Valor</th>
                      <th className="py-3 px-4 text-left font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitacoesFiltradas.map((sol) => (
                      <tr key={sol.id} className="border-b">
                        <td className="py-3 px-4">
                          <StatusIcon status={sol.status} />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-medium">{sol.titulo}</span>
                            <span className="text-xs text-muted-foreground">{sol.codigo}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {sol.solicitante}
                        </td>
                        <td className="py-3 px-4">
                          {sol.setor}
                        </td>
                        <td className="py-3 px-4">
                          {sol.data}
                        </td>
                        <td className="py-3 px-4">
                          <UrgenciaBadge urgencia={sol.urgencia} />
                        </td>
                        <td className="py-3 px-4">
                          {sol.valor}
                        </td>
                        <td className="py-3 px-4">
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
                                <ClipboardEdit className="h-4 w-4" /> Editar
                              </DropdownMenuItem>
                              {sol.status === "pendente" && (
                                <>
                                  <DropdownMenuItem className="gap-2">
                                    <Check className="h-4 w-4" /> Aprovar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2 text-red-600">
                                    <X className="h-4 w-4" /> Rejeitar
                                  </DropdownMenuItem>
                                </>
                              )}
                              {sol.status === "em_cotacao" && (
                                <DropdownMenuItem className="gap-2">
                                  <ShoppingCart className="h-4 w-4" /> Gerar pedido
                                </DropdownMenuItem>
                              )}
                              {sol.status === "aguardando_entrega" && (
                                <DropdownMenuItem className="gap-2">
                                  <Package className="h-4 w-4" /> Marcar como recebido
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </Tabs>
      </div>

      <NovaSolicitacaoDialog 
        open={dialogNovaSolicitacaoAberto} 
        onOpenChange={setDialogNovaSolicitacaoAberto} 
      />
    </OrganizationLayout>
  );
}