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
  Search,
  Filter,
  FileText,
  FilePlus,
  FileCheck,
  FileWarning,
  Truck,
  Package,
  Printer,
  Download,
  Upload,
  Copy,
  MoreHorizontal,
  BarChart,
  ArrowUpDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

// Dados simulados de documentos
const documentos = [
  {
    id: 1,
    pedido: "PED-12345",
    tipo: "nfe",
    numero: "1234567890",
    emissao: "2025-04-07T10:15:00",
    status: "aprovado",
    cliente: "João Silva",
    transportadora: "Correios",
    anexos: 2
  },
  {
    id: 2,
    pedido: "PED-12346",
    tipo: "nfe",
    numero: "1234567891",
    emissao: "2025-04-07T09:30:00",
    status: "pendente",
    cliente: "Maria Oliveira",
    transportadora: "Jadlog",
    anexos: 1
  },
  {
    id: 3,
    pedido: "PED-12347",
    tipo: "nfce",
    numero: "9876543210",
    emissao: "2025-04-07T08:45:00",
    status: "aprovado",
    cliente: "Carlos Eduardo",
    transportadora: "Correios",
    anexos: 3
  },
  {
    id: 4,
    pedido: "PED-12348",
    tipo: "nfce",
    numero: "9876543211",
    emissao: "2025-04-07T08:15:00",
    status: "erro",
    cliente: "Ana Carolina",
    transportadora: "Sequoia",
    anexos: 1
  },
  {
    id: 5,
    pedido: "PED-12349",
    tipo: "nfe",
    numero: "1234567892",
    emissao: "2025-04-06T15:40:00",
    status: "aprovado",
    cliente: "Roberto Santos",
    transportadora: "Mercado Envios",
    anexos: 2
  },
  {
    id: 6,
    pedido: "PED-12350",
    tipo: "cte",
    numero: "5555555550",
    emissao: "2025-04-06T14:10:00",
    status: "pendente",
    cliente: "Juliana Mendes",
    transportadora: "Correios",
    anexos: 0
  },
  {
    id: 7,
    pedido: "PED-12351",
    tipo: "nfe",
    numero: "1234567893",
    emissao: "2025-04-06T12:20:00",
    status: "aprovado",
    cliente: "Fernando Costa",
    transportadora: "Jadlog",
    anexos: 3
  },
  {
    id: 8,
    pedido: "PED-12352",
    tipo: "nfce",
    numero: "9876543212",
    emissao: "2025-04-06T10:05:00",
    status: "aprovado",
    cliente: "Daniela Lima",
    transportadora: "Shopee Logística",
    anexos: 1
  }
];

export default function DocumentacaoExpedicao() {
  const [filtro, setFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [termoBusca, setTermoBusca] = useState("");
  
  // Função para filtrar documentos
  const documentosFiltrados = documentos.filter(doc => {
    // Filtro de tipo
    if (tipoFiltro && doc.tipo !== tipoFiltro) {
      return false;
    }
    
    // Filtro de status
    if (statusFiltro && doc.status !== statusFiltro) {
      return false;
    }
    
    // Filtro de busca
    if (termoBusca && 
        !doc.pedido.toLowerCase().includes(termoBusca.toLowerCase()) && 
        !doc.numero.toLowerCase().includes(termoBusca.toLowerCase()) &&
        !doc.cliente.toLowerCase().includes(termoBusca.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Formatar a data
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pendente':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'erro':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  // Obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <CheckCircle className="h-3.5 w-3.5 mr-1" />;
      case 'pendente':
        return <Clock className="h-3.5 w-3.5 mr-1" />;
      case 'erro':
        return <AlertTriangle className="h-3.5 w-3.5 mr-1" />;
      default:
        return <FileText className="h-3.5 w-3.5 mr-1" />;
    }
  };
  
  // Obter ícone do tipo de documento
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'nfe':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'nfce':
        return <FileText className="h-5 w-5 text-green-600" />;
      case 'cte':
        return <Truck className="h-5 w-5 text-purple-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };
  
  // Obter nome do tipo de documento
  const getTipoNome = (tipo: string) => {
    switch (tipo) {
      case 'nfe':
        return 'NF-e';
      case 'nfce':
        return 'NFC-e';
      case 'cte':
        return 'CT-e';
      default:
        return tipo.toUpperCase();
    }
  };

  return (
    <OrganizationLayout>
      <div className="container py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Documentação</h1>
            <p className="text-muted-foreground mt-1">
              Gerenciamento de documentos fiscais e de transporte
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <FilePlus className="w-4 h-4 mr-2" />
              Novo Documento
            </Button>
          </div>
        </div>
        
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Total de Documentos</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-3xl font-bold">{documentos.length}</span>
                  <span className="p-2 bg-blue-100 rounded-full text-blue-600">
                    <FileText className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">NF-e Aprovadas</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-3xl font-bold">
                    {documentos.filter(d => d.tipo === 'nfe' && d.status === 'aprovado').length}
                  </span>
                  <span className="p-2 bg-green-100 rounded-full text-green-600">
                    <FileCheck className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Pendentes</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-3xl font-bold">
                    {documentos.filter(d => d.status === 'pendente').length}
                  </span>
                  <span className="p-2 bg-amber-100 rounded-full text-amber-600">
                    <Clock className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Com Erro</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-3xl font-bold">
                    {documentos.filter(d => d.status === 'erro').length}
                  </span>
                  <span className="p-2 bg-red-100 rounded-full text-red-600">
                    <FileWarning className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Filtros e busca */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex flex-1 w-full md:w-auto items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por pedido, documento ou cliente..."
                className="pl-8"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
            </div>
            
            <Select
              value={tipoFiltro}
              onValueChange={setTipoFiltro}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="nfe">NF-e</SelectItem>
                <SelectItem value="nfce">NFC-e</SelectItem>
                <SelectItem value="cte">CT-e</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={statusFiltro}
              onValueChange={setStatusFiltro}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="aprovado">Aprovados</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="erro">Com erro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Exibindo {documentosFiltrados.length} de {documentos.length} documentos
          </div>
        </div>
        
        {/* Tabela de documentos */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Número</TableHead>
                <TableHead>Emissão</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Transportadora</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Anexos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                    Nenhum documento encontrado com os filtros selecionados
                  </TableCell>
                </TableRow>
              ) : (
                documentosFiltrados.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.pedido}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-md bg-gray-100 flex items-center justify-center">
                          {getTipoIcon(doc.tipo)}
                        </div>
                        <span>{getTipoNome(doc.tipo)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{doc.numero}</TableCell>
                    <TableCell>{formatarData(doc.emissao)}</TableCell>
                    <TableCell>{doc.cliente}</TableCell>
                    <TableCell>{doc.transportadora}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`flex w-fit items-center ${getStatusColor(doc.status)}`}>
                        {getStatusIcon(doc.status)}
                        <span>
                          {doc.status === 'aprovado' ? 'Aprovado' :
                           doc.status === 'pendente' ? 'Pendente' :
                           doc.status === 'erro' ? 'Erro' : doc.status}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">{doc.anexos}</span>
                        {doc.anexos > 0 && (
                          <Badge variant="outline" className="ml-2 h-5 bg-gray-100">
                            <FileText className="h-3 w-3 mr-1" />
                            {doc.anexos}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimir
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Copiar número
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Gráficos simples */}
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas de Documentos</CardTitle>
            <CardDescription>Resumo dos documentos por tipo e status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gráfico por tipo */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Documentos por Tipo</h3>
                
                <div className="space-y-3">
                  {/* NFe */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">NF-e</span>
                      <span className="text-sm font-medium">
                        {documentos.filter(d => d.tipo === 'nfe').length} documentos
                      </span>
                    </div>
                    <Progress 
                      value={(documentos.filter(d => d.tipo === 'nfe').length / documentos.length) * 100} 
                      className="h-2 bg-blue-600"
                    />
                  </div>
                  
                  {/* NFCe */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">NFC-e</span>
                      <span className="text-sm font-medium">
                        {documentos.filter(d => d.tipo === 'nfce').length} documentos
                      </span>
                    </div>
                    <Progress 
                      value={(documentos.filter(d => d.tipo === 'nfce').length / documentos.length) * 100} 
                      className="h-2 bg-green-600"
                    />
                  </div>
                  
                  {/* CTe */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">CT-e</span>
                      <span className="text-sm font-medium">
                        {documentos.filter(d => d.tipo === 'cte').length} documentos
                      </span>
                    </div>
                    <Progress 
                      value={(documentos.filter(d => d.tipo === 'cte').length / documentos.length) * 100} 
                      className="h-2 bg-purple-600"
                    />
                  </div>
                </div>
              </div>
              
              {/* Gráfico por status */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Documentos por Status</h3>
                
                <div className="space-y-3">
                  {/* Aprovados */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Aprovados</span>
                      <span className="text-sm font-medium">
                        {documentos.filter(d => d.status === 'aprovado').length} documentos
                      </span>
                    </div>
                    <Progress 
                      value={(documentos.filter(d => d.status === 'aprovado').length / documentos.length) * 100} 
                      className="h-2 bg-green-600"
                    />
                  </div>
                  
                  {/* Pendentes */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Pendentes</span>
                      <span className="text-sm font-medium">
                        {documentos.filter(d => d.status === 'pendente').length} documentos
                      </span>
                    </div>
                    <Progress 
                      value={(documentos.filter(d => d.status === 'pendente').length / documentos.length) * 100} 
                      className="h-2 bg-amber-600"
                    />
                  </div>
                  
                  {/* Com erro */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Com erro</span>
                      <span className="text-sm font-medium">
                        {documentos.filter(d => d.status === 'erro').length} documentos
                      </span>
                    </div>
                    <Progress 
                      value={(documentos.filter(d => d.status === 'erro').length / documentos.length) * 100} 
                      className="h-2 bg-red-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </OrganizationLayout>
  );
}