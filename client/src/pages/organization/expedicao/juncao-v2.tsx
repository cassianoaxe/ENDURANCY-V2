import React, { useState } from "react";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  Eye,
  Package,
  Plus
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Dados simulados dos clientes e seus pedidos
const clientesPedidos = [
  {
    id: 1,
    nome: "João Silva",
    email: "joao@exemplo.com",
    telefone: "(11) 99999-1234",
    pedidos: [
      {
        numero: "PED-12345",
        data: "15/11/2023, 09:45",
        itens: 2,
        frete: "SEDEX (R$ 25.00)",
        total: "R$ 295.00",
        status: "Em Preparação"
      },
      {
        numero: "PED-12346",
        data: "16/11/2023, 10:30",
        itens: 1,
        frete: "SEDEX (R$ 25.00)",
        total: "R$ 105.00",
        status: "Em Preparação"
      }
    ]
  },
  {
    id: 2,
    nome: "Maria Oliveira",
    email: "maria@exemplo.com",
    telefone: "(11) 99999-5678",
    pedidos: [
      {
        numero: "PED-12347",
        data: "15/11/2023, 11:15",
        itens: 2,
        frete: "PAC (R$ 20.00)",
        total: "R$ 360.00",
        status: "Em Preparação"
      },
      {
        numero: "PED-12348",
        data: "15/11/2023, 14:20",
        itens: 1,
        frete: "PAC (R$ 20.00)",
        total: "R$ 80.00",
        status: "Aguardando Separação"
      }
    ]
  }
];

export default function JuncaoPedidosV2() {
  const [termoBusca, setTermoBusca] = useState("");
  const [pedidosSelecionados, setPedidosSelecionados] = useState<string[]>([]);
  const [abaSelecionada, setAbaSelecionada] = useState("candidatos");
  
  // Filtragem de clientes com base no termo de busca
  const clientesFiltrados = clientesPedidos.filter(cliente => {
    if (!termoBusca) return true;
    
    return cliente.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
           cliente.email.toLowerCase().includes(termoBusca.toLowerCase()) ||
           cliente.pedidos.some(pedido => pedido.numero.toLowerCase().includes(termoBusca.toLowerCase()));
  });
  
  // Toggle de seleção de pedido
  const togglePedido = (numeroPedido: string) => {
    setPedidosSelecionados(prev => 
      prev.includes(numeroPedido)
        ? prev.filter(num => num !== numeroPedido)
        : [...prev, numeroPedido]
    );
  };
  
  // Função para obter as iniciais do nome
  const getIniciais = (nome: string) => {
    const partes = nome.split(' ');
    if (partes.length >= 2) {
      return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  };

  return (
    <OrganizationLayout>
      <div className="container py-6 space-y-6">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Junção de Pedidos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Junte pedidos do mesmo cliente para economizar em frete e otimizar a expedição
            </p>
          </div>
          
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Nova Junção
          </Button>
        </div>
        
        {/* Abas */}
        <Tabs 
          defaultValue="candidatos" 
          value={abaSelecionada}
          onValueChange={setAbaSelecionada}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="candidatos">Candidatos à Junção</TabsTrigger>
            <TabsTrigger value="historico">Histórico de Junções</TabsTrigger>
          </TabsList>
          
          <TabsContent value="candidatos" className="space-y-6 pt-4">
            {/* Barra de busca */}
            <div className="flex items-center justify-between">
              <div className="relative w-96">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por pedido ou cliente..."
                  className="pl-8"
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                />
              </div>
              
              <Button variant="outline" size="icon" className="rounded-md">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Lista de clientes e seus pedidos */}
            <div className="space-y-6">
              {clientesFiltrados.map((cliente) => (
                <div key={cliente.id} className="border rounded-lg overflow-hidden">
                  {/* Cabeçalho do cliente */}
                  <div className="bg-gray-50 p-4 flex items-center">
                    <Avatar className="h-10 w-10 mr-4">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {getIniciais(cliente.nome)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="font-medium">{cliente.nome}</div>
                      <div className="text-sm text-gray-500">{cliente.email} • {cliente.telefone}</div>
                    </div>
                    
                    <div className="ml-auto">
                      <span className="text-sm font-medium text-green-600">
                        {cliente.pedidos.length} pedidos disponíveis
                      </span>
                    </div>
                  </div>
                  
                  {/* Tabela de pedidos do cliente */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]"></TableHead>
                        <TableHead>Número</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Itens</TableHead>
                        <TableHead>Frete</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    
                    <TableBody>
                      {cliente.pedidos.map((pedido) => (
                        <TableRow key={pedido.numero}>
                          <TableCell>
                            <Checkbox
                              checked={pedidosSelecionados.includes(pedido.numero)}
                              onCheckedChange={() => togglePedido(pedido.numero)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{pedido.numero}</TableCell>
                          <TableCell>{pedido.data}</TableCell>
                          <TableCell>{pedido.itens} {pedido.itens === 1 ? 'item' : 'itens'}</TableCell>
                          <TableCell>{pedido.frete}</TableCell>
                          <TableCell>{pedido.total}</TableCell>
                          <TableCell>
                            <span 
                              className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                pedido.status === "Em Preparação" 
                                  ? "bg-blue-50 text-blue-700" 
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {pedido.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
              
              {clientesFiltrados.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Package className="h-12 w-12 mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Nenhum pedido encontrado</p>
                  <p className="text-sm max-w-md mt-2">
                    Não foram encontrados pedidos elegíveis para junção com os filtros atuais
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="historico">
            <div className="flex items-center justify-center h-64 border rounded-lg mt-4">
              <div className="text-center text-muted-foreground">
                <p>Histórico de junções realizadas</p>
                <p className="text-sm mt-2">Esta seção mostra um histórico das junções de pedidos realizadas anteriormente</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
}