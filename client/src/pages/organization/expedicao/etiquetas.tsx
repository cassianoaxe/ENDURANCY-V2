import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  Truck,
  ArrowUpDown,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Printer,
  ClipboardList,
  FileText,
  Box,
  PackageCheck,
  MoreHorizontal,
  ArrowRight,
  ChevronDown,
  Settings,
  DownloadCloud,
  Share2,
  Tag,
  TagsIcon,
  LayoutGrid,
  Grid3X3
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Modelos simulados de etiquetas
const modelosEtiquetas = [
  { id: 1, nome: "Etiqueta Padrão (CORREIOS)", tamanho: "10x15cm", formato: "PDF" },
  { id: 2, nome: "Etiqueta NF-e", tamanho: "10x15cm", formato: "PDF" },
  { id: 3, nome: "Etiqueta Pequena", tamanho: "5x7cm", formato: "PDF" },
  { id: 4, nome: "Etiqueta Transportadora", tamanho: "15x20cm", formato: "PDF" },
  { id: 5, nome: "Etiqueta Mercado Livre", tamanho: "10x15cm", formato: "PDF" },
  { id: 6, nome: "Etiqueta Shopee", tamanho: "10x15cm", formato: "PDF" },
];

// Pedidos simulados
const pedidosPendentes = [
  { id: "PED-12345", cliente: "João Silva", transportadora: "Correios", data: "2025-04-07", status: "pendente" },
  { id: "PED-12346", cliente: "Maria Oliveira", transportadora: "Jadlog", data: "2025-04-07", status: "pendente" },
  { id: "PED-12347", cliente: "Carlos Eduardo", transportadora: "Correios", data: "2025-04-07", status: "pendente" },
  { id: "PED-12348", cliente: "Ana Carolina", transportadora: "Sequoia", data: "2025-04-07", status: "pendente" },
  { id: "PED-12349", cliente: "Roberto Santos", transportadora: "Mercado Envios", data: "2025-04-07", status: "pendente" },
  { id: "PED-12350", cliente: "Juliana Mendes", transportadora: "Correios", data: "2025-04-07", status: "pendente" },
  { id: "PED-12351", cliente: "Fernando Costa", transportadora: "Jadlog", data: "2025-04-06", status: "pendente" },
  { id: "PED-12352", cliente: "Daniela Lima", transportadora: "Shopee Logística", data: "2025-04-06", status: "pendente" }
];

export default function Etiquetas() {
  const [modeloSelecionado, setModeloSelecionado] = useState<number>(1);
  const [tipoImpressao, setTipoImpressao] = useState<string>("todos");
  const [pedidosSelecionados, setPedidosSelecionados] = useState<string[]>([]);
  const [transportadoraFiltro, setTransportadoraFiltro] = useState<string>("");
  const [termoBusca, setTermoBusca] = useState<string>("");
  
  // Filtragem de pedidos
  const pedidosFiltrados = pedidosPendentes.filter(pedido => {
    // Filtro por transportadora
    if (transportadoraFiltro && pedido.transportadora !== transportadoraFiltro) {
      return false;
    }
    
    // Filtro de busca
    if (termoBusca && !pedido.id.toLowerCase().includes(termoBusca.toLowerCase()) && 
        !pedido.cliente.toLowerCase().includes(termoBusca.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Todas as transportadoras únicas
  const transportadoras = Array.from(new Set(pedidosPendentes.map(p => p.transportadora)));
  
  // Função para alternar seleção de pedido
  const togglePedidoSelecionado = (id: string) => {
    if (pedidosSelecionados.includes(id)) {
      setPedidosSelecionados(pedidosSelecionados.filter(p => p !== id));
    } else {
      setPedidosSelecionados([...pedidosSelecionados, id]);
    }
  };
  
  // Selecionar/desmarcar todos os pedidos
  const toggleSelecionarTodos = () => {
    if (pedidosSelecionados.length === pedidosFiltrados.length) {
      setPedidosSelecionados([]);
    } else {
      setPedidosSelecionados(pedidosFiltrados.map(p => p.id));
    }
  };

  return (
    <OrganizationLayout>
      <div className="container py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Impressão de Etiquetas</h1>
            <p className="text-muted-foreground mt-1">
              Gere e imprima etiquetas para pedidos e malotes
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
            <Button variant="outline" size="sm">
              <DownloadCloud className="w-4 h-4 mr-2" />
              Baixar Modelo
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <Printer className="w-4 h-4 mr-2" />
              Imprimir Selecionados
            </Button>
          </div>
        </div>
        
        {/* Área de configuração da impressão */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Impressão</CardTitle>
            <CardDescription>Escolha o modelo e as configurações para impressão de etiquetas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Seleção de Modelo */}
              <div className="space-y-3">
                <Label htmlFor="modelo">Modelo de Etiqueta</Label>
                <Select
                  value={modeloSelecionado.toString()}
                  onValueChange={(value) => setModeloSelecionado(parseInt(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    {modelosEtiquetas.map((modelo) => (
                      <SelectItem key={modelo.id} value={modelo.id.toString()}>
                        {modelo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Detalhes do modelo selecionado */}
                {modeloSelecionado && (
                  <div className="mt-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                    <p className="text-sm font-medium">Detalhes do modelo:</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Tamanho:</span>{' '}
                        {modelosEtiquetas.find(m => m.id === modeloSelecionado)?.tamanho}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Formato:</span>{' '}
                        {modelosEtiquetas.find(m => m.id === modeloSelecionado)?.formato}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Tipo de Impressão */}
              <div className="space-y-3">
                <Label>Tipo de Impressão</Label>
                <RadioGroup
                  value={tipoImpressao}
                  onValueChange={setTipoImpressao}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="todos" id="todos" />
                    <Label htmlFor="todos" className="font-normal">
                      Imprimir todos selecionados (juntos)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="separados" id="separados" />
                    <Label htmlFor="separados" className="font-normal">
                      Separar por transportadora
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="individuais" id="individuais" />
                    <Label htmlFor="individuais" className="font-normal">
                      Arquivos individuais por pedido
                    </Label>
                  </div>
                </RadioGroup>
                
                {/* Botões rápidos para layouts comuns */}
                <div className="mt-4">
                  <Label className="mb-2 block">Layout Rápido</Label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-9">
                      <TagsIcon className="h-4 w-4 mr-2" />
                      2 por página
                    </Button>
                    <Button variant="outline" size="sm" className="h-9">
                      <TagsIcon className="h-4 w-4 mr-2" />
                      4 por página
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Seleção de Pedidos */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-semibold">Pedidos Pendentes</h2>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar pedido ou cliente..."
                  className="pl-8"
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                />
              </div>
              
              <Select
                value={transportadoraFiltro}
                onValueChange={setTransportadoraFiltro}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Transportadora" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {transportadoras.map((transportadora) => (
                    <SelectItem key={transportadora} value={transportadora}>
                      {transportadora}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox 
                      checked={pedidosSelecionados.length === pedidosFiltrados.length && pedidosFiltrados.length > 0}
                      onCheckedChange={toggleSelecionarTodos}
                    />
                  </TableHead>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Transportadora</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      Nenhum pedido encontrado com os filtros selecionados
                    </TableCell>
                  </TableRow>
                ) : (
                  pedidosFiltrados.map((pedido) => (
                    <TableRow key={pedido.id}>
                      <TableCell>
                        <Checkbox 
                          checked={pedidosSelecionados.includes(pedido.id)}
                          onCheckedChange={() => togglePedidoSelecionado(pedido.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{pedido.id}</TableCell>
                      <TableCell>{pedido.cliente}</TableCell>
                      <TableCell>{pedido.transportadora}</TableCell>
                      <TableCell>{pedido.data}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Printer className="h-4 w-4 mr-2" />
                          Imprimir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {pedidosSelecionados.length} pedidos selecionados de {pedidosFiltrados.length} exibidos
            </div>
            
            {pedidosSelecionados.length > 0 && (
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir {pedidosSelecionados.length} {pedidosSelecionados.length === 1 ? 'Etiqueta' : 'Etiquetas'}
              </Button>
            )}
          </div>
        </div>
        
        {/* Visualização prévia */}
        {pedidosSelecionados.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Visualização Prévia</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 border rounded-md">
              <div className="text-center">
                <Tag className="h-10 w-10 mb-2 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">
                  {pedidosSelecionados.length} {pedidosSelecionados.length === 1 ? 'etiqueta selecionada' : 'etiquetas selecionadas'}
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Visualizar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </OrganizationLayout>
  );
}