'use client';

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Truck, Package, Filter, MoreHorizontal, Eye, ClipboardEdit, Star, Phone, Mail, ShoppingCart } from "lucide-react";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { NovoFornecedorDialog } from "@/components/compras/NovoFornecedorDialog";

// Dados mockados para demonstração
const fornecedores = [
  {
    id: 1,
    nome: "CannabTech Distribuidora",
    cnpj: "12.345.678/0001-90",
    tipo: "Distribuidor",
    contato: {
      nome: "João Silva",
      email: "contato@cannabtech.com.br"
    },
    avaliacao: 4.8,
    status: "ativo",
    ultimaCompra: "2023-06-20",
    iniciais: "CA"
  },
  {
    id: 2,
    nome: "Insumos Farmacêuticos SA",
    cnpj: "98.765.432/0001-10",
    tipo: "Fabricante",
    contato: {
      nome: "Maria Oliveira",
      email: "comercial@insumosfarmaceuticos.com.br"
    },
    avaliacao: 4.9,
    status: "ativo",
    ultimaCompra: "2023-06-15",
    iniciais: "IN"
  },
  {
    id: 3,
    nome: "Insumos Naturais Ltda",
    cnpj: "87.654.321/0001-20",
    tipo: "Distribuidor",
    contato: {
      nome: "Carlos Santos",
      email: "vendas@insumosnaturais.com.br"
    },
    avaliacao: 4.2,
    status: "ativo",
    ultimaCompra: "2023-05-30",
    iniciais: "IN"
  },
  {
    id: 4,
    nome: "GlassPack Embalagens",
    cnpj: "76.543.210/0001-30",
    tipo: "Fabricante",
    contato: {
      nome: "Ana Costa",
      email: "contato@glasspack.com.br"
    },
    avaliacao: 4.5,
    status: "ativo",
    ultimaCompra: "2023-06-25",
    iniciais: "GL"
  },
  {
    id: 5,
    nome: "LabelPrint Rótulos",
    cnpj: "65.432.109/0001-40",
    tipo: "Fabricante",
    contato: {
      nome: "Roberto Almeida",
      email: "comercial@labelprint.com.br"
    },
    avaliacao: 4.3,
    status: "ativo",
    ultimaCompra: "2023-06-10",
    iniciais: "LA"
  }
];

// Componente para renderizar as estrelas de avaliação
function AvaliacaoEstrelas({ pontuacao }: { pontuacao: number }) {
  return (
    <div className="flex items-center">
      <div className="flex items-center mr-1">
        {[1, 2, 3, 4, 5].map((valor) => (
          <Star
            key={valor}
            className={`h-4 w-4 ${
              valor <= pontuacao
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-medium">{pontuacao.toFixed(1)}</span>
    </div>
  );
}

// Função para renderizar o badge de status
function StatusBadge({ status }: { status: string }) {
  const configs = {
    ativo: {
      label: 'Ativo',
      variant: 'default',
      className: 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200'
    },
    inativo: {
      label: 'Inativo',
      variant: 'default',
      className: 'bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200'
    },
    bloqueado: {
      label: 'Bloqueado',
      variant: 'default',
      className: 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200'
    }
  };

  const config = configs[status as keyof typeof configs] || configs.inativo;

  return (
    <Badge 
      variant={config.variant as any} 
      className={config.className}
    >
      {config.label}
    </Badge>
  );
}

// Função para formatar a data
function formatarData(dataString: string): string {
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export default function Fornecedores() {
  const [termoBusca, setTermoBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [abaAtiva, setAbaAtiva] = useState("fornecedores");
  const [dialogNovoFornecedorAberto, setDialogNovoFornecedorAberto] = useState(false);

  // Filtra fornecedores com base no termo de busca, tipo e status
  const fornecedoresFiltrados = fornecedores.filter(f => {
    // Filtro por status
    if (statusFiltro !== "todos" && f.status !== statusFiltro) return false;
    
    // Filtro por tipo
    if (tipoFiltro !== "todos" && f.tipo.toLowerCase() !== tipoFiltro) return false;
    
    // Filtro por termo de busca
    if (termoBusca) {
      const termoLower = termoBusca.toLowerCase();
      return (
        f.nome.toLowerCase().includes(termoLower) ||
        f.cnpj.toLowerCase().includes(termoLower) ||
        f.contato.nome.toLowerCase().includes(termoLower) ||
        f.contato.email.toLowerCase().includes(termoLower)
      );
    }
    
    return true;
  });

  return (
    <OrganizationLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Fornecedores</h1>
              <p className="text-muted-foreground">
                Gestão de fornecedores e compras
              </p>
            </div>
          </div>
          <Button onClick={() => setDialogNovoFornecedorAberto(true)} className="gap-2">
            <Truck className="h-4 w-4" />
            Novo Fornecedor
          </Button>
        </div>

        <Tabs defaultValue="fornecedores" value={abaAtiva} onValueChange={setAbaAtiva} className="space-y-4">
          <TabsList>
            <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
            <TabsTrigger value="pedidos">Pedidos de Compra</TabsTrigger>
            <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
          </TabsList>

          <TabsContent value="fornecedores" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar fornecedores..."
                  className="pl-8"
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                />
              </div>

              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value)}
              >
                <option value="todos">Todos os Status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="bloqueado">Bloqueado</option>
              </select>

              <select
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
              >
                <option value="todos">Todos os Tipos</option>
                <option value="distribuidor">Distribuidor</option>
                <option value="fabricante">Fabricante</option>
                <option value="prestador_servico">Prestador de Serviço</option>
                <option value="representante">Representante</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">Fornecedor</th>
                        <th className="py-3 px-4 text-left font-medium">Tipo</th>
                        <th className="py-3 px-4 text-left font-medium">Contato</th>
                        <th className="py-3 px-4 text-left font-medium">Avaliação</th>
                        <th className="py-3 px-4 text-left font-medium">Status</th>
                        <th className="py-3 px-4 text-left font-medium">Última Compra</th>
                        <th className="py-3 px-4 text-left font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fornecedoresFiltrados.map((fornecedor) => (
                        <tr key={fornecedor.id} className="border-b">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-primary/10">
                                  {fornecedor.iniciais}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium">{fornecedor.nome}</span>
                                <span className="text-xs text-muted-foreground">{fornecedor.cnpj}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {fornecedor.tipo}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span>{fornecedor.contato.nome}</span>
                              <span className="text-xs text-blue-600">{fornecedor.contato.email}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <AvaliacaoEstrelas pontuacao={fornecedor.avaliacao} />
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={fornecedor.status} />
                          </td>
                          <td className="py-3 px-4">
                            {formatarData(fornecedor.ultimaCompra)}
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
                                  <ClipboardEdit className="h-4 w-4" /> Editar fornecedor
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2">
                                  <ShoppingCart className="h-4 w-4" /> Novo pedido
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2">
                                  <Star className="h-4 w-4" /> Avaliar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="gap-2">
                                  <Phone className="h-4 w-4" /> Contato telefônico
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2">
                                  <Mail className="h-4 w-4" /> Enviar e-mail
                                </DropdownMenuItem>
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
          </TabsContent>

          <TabsContent value="pedidos">
            <Card>
              <CardContent className="p-6">
                <p>A aba de pedidos de compra será implementada em breve.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="avaliacoes">
            <Card>
              <CardContent className="p-6">
                <p>A aba de avaliações de fornecedores será implementada em breve.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <NovoFornecedorDialog 
        open={dialogNovoFornecedorAberto} 
        onOpenChange={setDialogNovoFornecedorAberto} 
      />
    </OrganizationLayout>
  );
}