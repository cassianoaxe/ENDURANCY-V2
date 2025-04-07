import React, { useState } from "react";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search, Filter, Download, Eye, CheckCircle, 
  PackageOpen, TruckIcon, XCircle, Clock, RefreshCw,
  ChevronLeft, ChevronRight, Plus, FileText
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { useToast } from "@/hooks/use-toast";

// Dados simulados dos pedidos
const pedidos = [
  {
    id: "PED-39845",
    cliente: {
      nome: "Marina Silva",
      email: "marina.silva@email.com",
      telefone: "(11) 98765-4321"
    },
    data: "07/04/2025",
    valor: 289.80,
    pagamento: "Cartão de Crédito",
    status: "Concluído",
    itens: [
      { id: 1, nome: "Óleo Essencial de Lavanda", quantidade: 2, preco: 89.90 },
      { id: 2, nome: "Crème de CBD 500mg", quantidade: 1, preco: 110.00 }
    ]
  },
  {
    id: "PED-39844",
    cliente: {
      nome: "Ricardo Santos",
      email: "ricardo.santos@email.com",
      telefone: "(21) 97654-3210"
    },
    data: "07/04/2025",
    valor: 159.90,
    pagamento: "PIX",
    status: "Em processamento",
    itens: [
      { id: 2, nome: "Crème de CBD 500mg", quantidade: 1, preco: 159.90 }
    ]
  },
  {
    id: "PED-39843",
    cliente: {
      nome: "Carla Mendes",
      email: "carla.mendes@email.com",
      telefone: "(31) 99876-5432"
    },
    data: "06/04/2025",
    valor: 198.50,
    pagamento: "Boleto",
    status: "Enviado",
    itens: [
      { id: 3, nome: "Chá de Camomila Orgânico (50g)", quantidade: 2, preco: 28.50 },
      { id: 4, nome: "Proteína Vegana (500g)", quantidade: 1, preco: 120.00 },
      { id: 5, nome: "Ômega 3 1000mg (60 caps)", quantidade: 1, preco: 65.90 }
    ]
  },
  {
    id: "PED-39842",
    cliente: {
      nome: "Marcos Oliveira",
      email: "marcos.oliveira@email.com",
      telefone: "(41) 98761-2345"
    },
    data: "06/04/2025",
    valor: 345.70,
    pagamento: "Cartão de Crédito",
    status: "Concluído",
    itens: [
      { id: 4, nome: "Proteína Vegana (500g)", quantidade: 2, preco: 240.00 },
      { id: 5, nome: "Ômega 3 1000mg (60 caps)", quantidade: 1, preco: 65.90 },
      { id: 3, nome: "Chá de Camomila Orgânico (50g)", quantidade: 1, preco: 28.50 }
    ]
  },
  {
    id: "PED-39841",
    cliente: {
      nome: "Ana Pereira",
      email: "ana.pereira@email.com",
      telefone: "(51) 98765-1234"
    },
    data: "05/04/2025",
    valor: 87.90,
    pagamento: "PIX",
    status: "Cancelado",
    itens: [
      { id: 1, nome: "Óleo Essencial de Lavanda", quantidade: 1, preco: 87.90 }
    ]
  },
  {
    id: "PED-39840",
    cliente: {
      nome: "Lucas Martins",
      email: "lucas.martins@email.com",
      telefone: "(11) 98732-5431"
    },
    data: "05/04/2025",
    valor: 176.80,
    pagamento: "Cartão de Crédito",
    status: "Pendente",
    itens: [
      { id: 3, nome: "Chá de Camomila Orgânico (50g)", quantidade: 3, preco: 85.50 },
      { id: 5, nome: "Ômega 3 1000mg (60 caps)", quantidade: 1, preco: 65.90 },
      { id: 6, nome: "Vitamina D3 (30 caps)", quantidade: 1, preco: 25.40 }
    ]
  },
  {
    id: "PED-39839",
    cliente: {
      nome: "Fernanda Sousa",
      email: "fernanda.sousa@email.com",
      telefone: "(21) 99845-6723"
    },
    data: "04/04/2025",
    valor: 267.90,
    pagamento: "Boleto",
    status: "Enviado",
    itens: [
      { id: 2, nome: "Crème de CBD 500mg", quantidade: 1, preco: 159.90 },
      { id: 7, nome: "Colágeno Hidrolisado (300g)", quantidade: 1, preco: 89.00 },
      { id: 8, nome: "Óleo de Coco Extra Virgem (200ml)", quantidade: 1, preco: 19.00 }
    ]
  }
];

export default function Pedidos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [selectedPedido, setSelectedPedido] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Status para as badges de pedidos
  const statusConfig: Record<string, { color: string, icon: React.ReactNode }> = {
    "Concluído": { 
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300", 
      icon: <CheckCircle className="h-3.5 w-3.5 mr-1" /> 
    },
    "Em processamento": { 
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300", 
      icon: <PackageOpen className="h-3.5 w-3.5 mr-1" /> 
    },
    "Enviado": { 
      color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300", 
      icon: <TruckIcon className="h-3.5 w-3.5 mr-1" /> 
    },
    "Cancelado": { 
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300", 
      icon: <XCircle className="h-3.5 w-3.5 mr-1" /> 
    },
    "Pendente": { 
      color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300", 
      icon: <Clock className="h-3.5 w-3.5 mr-1" /> 
    }
  };

  // Filtragem por termo de busca e status
  const filteredPedidos = pedidos.filter(pedido => {
    const matchesTerm = searchTerm === "" || 
      pedido.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.cliente.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || statusFilter === "todos" || pedido.status === statusFilter;
    
    return matchesTerm && matchesStatus;
  });

  // Paginação
  const pageCount = Math.ceil(filteredPedidos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPedidos = filteredPedidos.slice(startIndex, startIndex + itemsPerPage);

  // Abrir modal de detalhes
  const handleViewPedido = (pedido: any) => {
    setSelectedPedido(pedido);
    setIsDialogOpen(true);
  };

  // Navegar pelas páginas
  const nextPage = () => {
    if (currentPage < pageCount) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <OrganizationLayout>
      <div className="flex flex-col space-y-4 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Pedidos</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie seus pedidos e acompanhe o status de cada um
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9">
              <FileText className="mr-2 h-4 w-4" />
              Relatório
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button className="h-9 bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Novo Pedido
            </Button>
          </div>
        </div>
        
        {/* Filtros e busca */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar pedido, cliente ou email..." 
              className="pl-9 h-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="Concluído">Concluído</SelectItem>
                <SelectItem value="Em processamento">Em processamento</SelectItem>
                <SelectItem value="Enviado">Enviado</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" className="h-9" onClick={() => {
              setSearchTerm("");
              setStatusFilter("todos");
            }}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          </div>
        </div>
        
        {/* Tabela de pedidos */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Data</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="hidden md:table-cell">Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPedidos.length > 0 ? (
                  paginatedPedidos.map((pedido) => (
                    <TableRow key={pedido.id}>
                      <TableCell>
                        <div className="font-medium">{pedido.id}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{pedido.cliente.nome}</div>
                        <div className="text-sm text-muted-foreground hidden md:block">{pedido.cliente.email}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{pedido.data}</TableCell>
                      <TableCell className="text-right font-medium">R$ {pedido.valor.toFixed(2)}</TableCell>
                      <TableCell className="hidden md:table-cell">{pedido.pagamento}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={`flex items-center w-fit ${statusConfig[pedido.status]?.color}`}
                        >
                          {statusConfig[pedido.status]?.icon}
                          {pedido.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleViewPedido(pedido)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="ml-1">
                                <Filter className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Editar pedido</DropdownMenuItem>
                              <DropdownMenuItem>Marcar como enviado</DropdownMenuItem>
                              <DropdownMenuItem>Gerar nota fiscal</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">Cancelar pedido</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center">
                        <PackageOpen className="h-12 w-12 text-gray-300 mb-2" />
                        <h3 className="text-lg font-medium">Nenhum pedido encontrado</h3>
                        <p className="text-sm text-muted-foreground">
                          Tente ajustar os filtros ou criar um novo pedido.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          
          {/* Paginação */}
          {filteredPedidos.length > itemsPerPage && (
            <CardFooter className="flex items-center justify-between px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Mostrando <span className="font-medium">{startIndex + 1}</span> a <span className="font-medium">
                  {Math.min(startIndex + itemsPerPage, filteredPedidos.length)}
                </span> de <span className="font-medium">{filteredPedidos.length}</span> pedidos
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextPage}
                  disabled={currentPage === pageCount}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
      
      {/* Modal de Detalhes do Pedido */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
            <DialogDescription>
              Informações completas sobre o pedido {selectedPedido?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPedido && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium text-sm mb-1">Informações do Pedido</h3>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Código:</span>
                      <span className="text-sm font-medium">{selectedPedido.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Data:</span>
                      <span className="text-sm">{selectedPedido.data}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge 
                        variant="outline"
                        className={`flex items-center w-fit ${statusConfig[selectedPedido.status]?.color}`}
                      >
                        {statusConfig[selectedPedido.status]?.icon}
                        {selectedPedido.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Pagamento:</span>
                      <span className="text-sm">{selectedPedido.pagamento}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm mb-1">Cliente</h3>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Nome:</span>
                      <span className="text-sm font-medium">{selectedPedido.cliente.nome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Email:</span>
                      <span className="text-sm">{selectedPedido.cliente.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Telefone:</span>
                      <span className="text-sm">{selectedPedido.cliente.telefone}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm mb-1">Resumo</h3>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Subtotal:</span>
                      <span className="text-sm">R$ {selectedPedido.valor.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Frete:</span>
                      <span className="text-sm">R$ 0.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Descontos:</span>
                      <span className="text-sm">R$ 0.00</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-sm">Total:</span>
                      <span className="text-sm">R$ {selectedPedido.valor.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-sm mb-2">Itens do Pedido</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-center">Quantidade</TableHead>
                      <TableHead className="text-right">Preço Unit.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPedido.itens.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.nome}</TableCell>
                        <TableCell className="text-center">{item.quantidade}</TableCell>
                        <TableCell className="text-right">R$ {item.preco.toFixed(2)}</TableCell>
                        <TableCell className="text-right">R$ {(item.quantidade * item.preco).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Fechar
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              Imprimir Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OrganizationLayout>
  );
}