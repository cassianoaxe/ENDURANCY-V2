import React, { useState } from "react";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Printer,
  ArrowDown,
  ChevronDown,
  FileText
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

// Dados simulados para a tabela de pedidos
const pedidosData = [
  {
    id: "P12345",
    cliente: "Maria Silva",
    endereco: "Rua das Flores, 123 - São Paulo, SP - 01234-567",
    metodo: "Correios - PAC",
    status: "aguardando"
  },
  {
    id: "P12346",
    cliente: "João Pereira",
    endereco: "Av. Paulista, 1000 - São Paulo, SP - 01310-100",
    metodo: "Correios - SEDEX",
    status: "etiquetaImpressa"
  },
  {
    id: "P12347",
    cliente: "Ana Costa",
    endereco: "Rua Direita, 45 - Rio de Janeiro, RJ - 20000-001",
    metodo: "Transportadora",
    status: "aguardando"
  },
  {
    id: "P12350",
    cliente: "Roberto Almeida",
    endereco: "Rua das Margaridas, 78 - Belo Horizonte, MG - 30000-100",
    metodo: "Correios - PAC",
    status: "aguardando"
  },
  {
    id: "P12351",
    cliente: "Lucia Ferreira",
    endereco: "Av. Brasil, 500 - Curitiba, PR - 80000-000",
    metodo: "Correios - SEDEX",
    status: "aguardando"
  }
];

export default function DocumentosEnvio() {
  const [filtroTab, setFiltroTab] = useState("todos");
  const [termoBusca, setTermoBusca] = useState("");
  const [pedidosSelecionados, setPedidosSelecionados] = useState<string[]>([]);
  const [tipoDocumento, setTipoDocumento] = useState("etiqueta");
  
  // Filtrar pedidos com base na aba e termo de busca
  const pedidosFiltrados = pedidosData.filter(pedido => {
    // Filtro de tab
    if (filtroTab === "preparando" && pedido.status !== "aguardando") {
      return false;
    }
    
    if (filtroTab === "etiquetas" && pedido.status !== "etiquetaImpressa") {
      return false;
    }
    
    if (filtroTab === "enviados" && pedido.status !== "enviado") {
      return false;
    }
    
    // Filtro de busca
    if (termoBusca && 
        !pedido.id.toLowerCase().includes(termoBusca.toLowerCase()) && 
        !pedido.cliente.toLowerCase().includes(termoBusca.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Selecionar/deselecionar todos os pedidos
  const toggleSelectAll = () => {
    if (pedidosSelecionados.length === pedidosFiltrados.length) {
      setPedidosSelecionados([]);
    } else {
      setPedidosSelecionados(pedidosFiltrados.map(p => p.id));
    }
  };
  
  // Selecionar/deselecionar pedido individual
  const togglePedido = (id: string) => {
    if (pedidosSelecionados.includes(id)) {
      setPedidosSelecionados(pedidosSelecionados.filter(pid => pid !== id));
    } else {
      setPedidosSelecionados([...pedidosSelecionados, id]);
    }
  };
  
  // Função para renderizar o status do pedido
  const renderStatus = (status: string) => {
    if (status === "aguardando") {
      return (
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
          Aguardando
        </div>
      );
    } else if (status === "etiquetaImpressa") {
      return (
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
          Etiqueta Impressa
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          Enviado
        </div>
      );
    }
  };

  return (
    <OrganizationLayout>
      <div className="container py-6">
        <div className="flex flex-col space-y-6">
          {/* Cabeçalho */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Documentos de Envio</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gere e imprima etiquetas, prescrições e declarações para seus pedidos
              </p>
            </div>
            
            <Button className="gap-2 bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-800">
              <Printer className="h-4 w-4" />
              Imprimir Selecionados ({pedidosSelecionados.length})
            </Button>
          </div>
          
          {/* Tabs */}
          <Tabs 
            defaultValue="documentos" 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="documentos">Documentos de Envio</TabsTrigger>
              <TabsTrigger value="prescricoes">Prescrições</TabsTrigger>
              <TabsTrigger value="declaracoes">Declarações de Conteúdo</TabsTrigger>
            </TabsList>
            
            <TabsContent value="documentos" className="pt-4">
              <div className="flex flex-col space-y-6">
                {/* Barra de pesquisa e filtros */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar pedido por ID, cliente..."
                      className="pl-8"
                      value={termoBusca}
                      onChange={(e) => setTermoBusca(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      size="sm"
                    >
                      <Filter className="h-4 w-4" />
                      Filtrar
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      size="sm"
                    >
                      <ArrowDown className="h-4 w-4" />
                      Exportar
                    </Button>
                  </div>
                </div>
                
                {/* Tabs de status */}
                <div className="grid grid-cols-4 gap-1 border-b">
                  <Button 
                    variant={filtroTab === "todos" ? "secondary" : "ghost"} 
                    className="rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary h-9 px-4"
                    onClick={() => setFiltroTab("todos")}
                    data-state={filtroTab === "todos" ? "active" : "inactive"}
                  >
                    Todos
                  </Button>
                  <Button 
                    variant={filtroTab === "preparando" ? "secondary" : "ghost"} 
                    className="rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary h-9 px-4"
                    onClick={() => setFiltroTab("preparando")}
                    data-state={filtroTab === "preparando" ? "active" : "inactive"}
                  >
                    Preparando
                  </Button>
                  <Button 
                    variant={filtroTab === "etiquetas" ? "secondary" : "ghost"} 
                    className="rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary h-9 px-4"
                    onClick={() => setFiltroTab("etiquetas")}
                    data-state={filtroTab === "etiquetas" ? "active" : "inactive"}
                  >
                    Etiquetas Impressas
                  </Button>
                  <Button 
                    variant={filtroTab === "enviados" ? "secondary" : "ghost"} 
                    className="rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary h-9 px-4"
                    onClick={() => setFiltroTab("enviados")}
                    data-state={filtroTab === "enviados" ? "active" : "inactive"}
                  >
                    Enviados
                  </Button>
                </div>
                
                {/* Tabela de Pedidos */}
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox 
                            checked={pedidosFiltrados.length > 0 && pedidosSelecionados.length === pedidosFiltrados.length}
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Pedido</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Endereço</TableHead>
                        <TableHead>Método de Envio</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pedidosFiltrados.map((pedido) => (
                        <TableRow key={pedido.id}>
                          <TableCell>
                            <Checkbox 
                              checked={pedidosSelecionados.includes(pedido.id)}
                              onCheckedChange={() => togglePedido(pedido.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{pedido.id}</TableCell>
                          <TableCell>{pedido.cliente}</TableCell>
                          <TableCell className="text-sm">{pedido.endereco}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {pedido.metodo}
                              
                              {pedido.status === "etiquetaImpressa" && (
                                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                  Etiqueta Impressa
                                </div>
                              )}
                              
                              {pedido.metodo.includes("Correios") && pedido.status === "aguardando" && (
                                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                  Aguardando
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="prescricoes">
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <p>Conteúdo da aba Prescrições</p>
              </div>
            </TabsContent>
            
            <TabsContent value="declaracoes">
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <p>Conteúdo da aba Declarações de Conteúdo</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Painel de Configurações */}
        <div className="fixed right-0 top-[60px] bottom-0 w-[320px] border-l bg-background p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-6">
            Configurações de Impressão
          </h2>
          
          <div className="space-y-6">
            {/* Tipo de Documento */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Tipo de Documento</h3>
              <RadioGroup 
                value={tipoDocumento}
                onValueChange={setTipoDocumento}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="etiqueta" id="etiqueta" />
                  <Label htmlFor="etiqueta" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Etiqueta de Envio
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="prescricao" id="prescricao" />
                  <Label htmlFor="prescricao" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Prescrição Médica
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="declaracao" id="declaracao" />
                  <Label htmlFor="declaracao" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Declaração de Conteúdo
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Transportadora */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Transportadora</h3>
              <Select defaultValue="correios">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a transportadora" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="correios">Correios</SelectItem>
                  <SelectItem value="jadlog">Jadlog</SelectItem>
                  <SelectItem value="transportadora">Transportadora</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Formato da Etiqueta */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Formato da Etiqueta</h3>
              <Select defaultValue="a4-2">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a4-2">A4 (2 etiquetas)</SelectItem>
                  <SelectItem value="a4-4">A4 (4 etiquetas)</SelectItem>
                  <SelectItem value="termica">Térmica 10x15cm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Documentação Adicional */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Adicionar Documentação</h3>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="prescricao-check" />
                  <Label htmlFor="prescricao-check">
                    Incluir prescrição médica
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="declaracao-check" />
                  <Label htmlFor="declaracao-check">
                    Declaração de conteúdo para Correios
                  </Label>
                </div>
              </div>
            </div>
            
            {/* Configurações Avançadas */}
            <Button variant="outline" className="w-full flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Configurações Avançadas
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </OrganizationLayout>
  );
}