import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft,
  Search,
  Package,
  ArrowUpDown,
  QrCode,
  FileText,
  FileArchive,
  Truck,
  Calculator,
  MoreHorizontal,
  Plus,
  Calendar
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Dados de exemplo para malotes
const mockPackages = [
  { 
    id: "MAL-12345", 
    dataCriacao: "07/04/2025", 
    status: "processando", 
    transportadora: "Correios", 
    rastreio: "JO123456789BR",
    peso: "2.5 kg",
    volume: "30x20x15 cm",
    pedidos: 5,
    destino: "São Paulo, SP",
    valorDeclarado: "R$ 1.245,00"
  },
  { 
    id: "MAL-12346", 
    dataCriacao: "07/04/2025", 
    status: "pendente", 
    transportadora: "JADLOG", 
    rastreio: null,
    peso: "1.8 kg",
    volume: "25x20x10 cm",
    pedidos: 3,
    destino: "Rio de Janeiro, RJ",
    valorDeclarado: "R$ 785,00"
  },
  { 
    id: "MAL-12347", 
    dataCriacao: "06/04/2025", 
    status: "enviado", 
    transportadora: "LATAM Cargo", 
    rastreio: "LA987654321BR",
    peso: "4.2 kg",
    volume: "40x30x20 cm",
    pedidos: 8,
    destino: "Belo Horizonte, MG",
    valorDeclarado: "R$ 2.350,00"
  },
  { 
    id: "MAL-12348", 
    dataCriacao: "06/04/2025", 
    status: "entregue", 
    transportadora: "Correios", 
    rastreio: "JO567891234BR",
    peso: "1.2 kg",
    volume: "20x15x10 cm",
    pedidos: 2,
    destino: "Curitiba, PR",
    valorDeclarado: "R$ 430,00"
  },
  { 
    id: "MAL-12349", 
    dataCriacao: "05/04/2025", 
    status: "enviado", 
    transportadora: "Transportadora Própria", 
    rastreio: "TP123456",
    peso: "5.7 kg",
    volume: "50x40x30 cm",
    pedidos: 12,
    destino: "Porto Alegre, RS",
    valorDeclarado: "R$ 3.850,00"
  },
  { 
    id: "MAL-12350", 
    dataCriacao: "05/04/2025", 
    status: "pendente", 
    transportadora: null,
    rastreio: null,
    peso: "2.1 kg",
    volume: "30x25x15 cm",
    pedidos: 4,
    destino: "Salvador, BA",
    valorDeclarado: "R$ 980,00"
  }
];

// Transportadoras disponíveis
const transportadoras = [
  "Correios",
  "JADLOG",
  "LATAM Cargo",
  "Transportadora Própria",
  "GFL",
  "DHL",
  "UPS",
  "FedEx"
];

export default function RegistroMalotes() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransportadora, setSelectedTransportadora] = useState("");

  // Função para navegação entre páginas
  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
  };

  // Função para filtrar malotes com base na guia selecionada e no termo de pesquisa
  const filteredPackages = mockPackages.filter(pkg => {
    // Filtro de status
    if (selectedTab === "pendentes" && pkg.status !== "pendente") return false;
    if (selectedTab === "processando" && pkg.status !== "processando") return false;
    if (selectedTab === "enviados" && pkg.status !== "enviado") return false;
    if (selectedTab === "entregues" && pkg.status !== "entregue") return false;
    
    // Filtro de transportadora
    if (selectedTransportadora && pkg.transportadora !== selectedTransportadora) return false;
    
    // Filtro de pesquisa
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        pkg.id.toLowerCase().includes(searchLower) ||
        pkg.destino.toLowerCase().includes(searchLower) ||
        (pkg.rastreio && pkg.rastreio.toLowerCase().includes(searchLower)) ||
        (pkg.transportadora && pkg.transportadora.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  // Calcular totais
  const totalPedidos = filteredPackages.reduce((acc, pkg) => acc + pkg.pedidos, 0);
  const totalPeso = filteredPackages.reduce((acc, pkg) => acc + parseFloat(pkg.peso.replace('kg', '').trim()), 0).toFixed(1);
  const mediaPeso = filteredPackages.length > 0 ? (parseFloat(totalPeso) / filteredPackages.length).toFixed(1) : '0.0';

  return (
    <OrganizationLayout>
      <div className="container py-6 space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mb-2"
              onClick={() => navigateTo("/organization/expedicao")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Registro de Malotes</h1>
            <p className="text-muted-foreground mt-1">
              Gerenciamento de malotes para envio de pedidos agrupados
            </p>
          </div>
          <div className="flex space-x-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Malote
            </Button>
          </div>
        </div>

        {/* Estatísticas de Malotes */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Total de Malotes</span>
                <div className="mt-1">
                  <span className="text-3xl font-bold">{mockPackages.length}</span>
                </div>
                <div className="mt-4 text-blue-600 text-xs">
                  <Package className="h-3 w-3 inline mr-1" />
                  {totalPedidos} pedidos em {mockPackages.length} malotes
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Malotes Pendentes</span>
                <div className="mt-1">
                  <span className="text-3xl font-bold">
                    {mockPackages.filter(pkg => pkg.status === "pendente").length}
                  </span>
                </div>
                <div className="mt-4 text-amber-600 text-xs">
                  <ArrowUpDown className="h-3 w-3 inline mr-1" />
                  Aguardando processamento
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Malotes Enviados</span>
                <div className="mt-1">
                  <span className="text-3xl font-bold">
                    {mockPackages.filter(pkg => pkg.status === "enviado" || pkg.status === "entregue").length}
                  </span>
                </div>
                <div className="mt-4 text-green-600 text-xs">
                  <Truck className="h-3 w-3 inline mr-1" />
                  Em trânsito ou entregues
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Peso Total</span>
                <div className="mt-1">
                  <span className="text-3xl font-bold">
                    {totalPeso} kg
                  </span>
                </div>
                <div className="mt-4 text-blue-600 text-xs">
                  <Calculator className="h-3 w-3 inline mr-1" />
                  Média de {mediaPeso} kg por malote
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barra de pesquisa e filtros */}
        <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por malote, destino ou rastreio..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedTransportadora} onValueChange={setSelectedTransportadora}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Transportadora" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as transportadoras</SelectItem>
                {transportadoras.map((transp) => (
                  <SelectItem key={transp} value={transp}>{transp}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="whitespace-nowrap">
              <Calendar className="h-4 w-4 mr-2" />
              Filtrar por Data
            </Button>
          </div>
        </div>

        {/* Tabs de categorias */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="todos">Todos os Malotes</TabsTrigger>
            <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
            <TabsTrigger value="processando">Em Processamento</TabsTrigger>
            <TabsTrigger value="enviados">Enviados</TabsTrigger>
            <TabsTrigger value="entregues">Entregues</TabsTrigger>
          </TabsList>
          
          <TabsContent value={selectedTab} className="space-y-4">
            {/* Tabela de malotes */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Malote</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Transportadora</TableHead>
                      <TableHead>Rastreio</TableHead>
                      <TableHead>Pedidos</TableHead>
                      <TableHead>Peso</TableHead>
                      <TableHead>Destino</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPackages.length > 0 ? (
                      filteredPackages.map((pkg) => (
                        <TableRow key={pkg.id}>
                          <TableCell className="font-medium">{pkg.id}</TableCell>
                          <TableCell>{pkg.dataCriacao}</TableCell>
                          <TableCell>{pkg.transportadora || "Não definida"}</TableCell>
                          <TableCell>{pkg.rastreio || "-"}</TableCell>
                          <TableCell>{pkg.pedidos}</TableCell>
                          <TableCell>{pkg.peso}</TableCell>
                          <TableCell>{pkg.destino}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`
                                ${pkg.status === "pendente" ? "bg-amber-50 text-amber-700 hover:bg-amber-50" : ""}
                                ${pkg.status === "processando" ? "bg-blue-50 text-blue-700 hover:bg-blue-50" : ""}
                                ${pkg.status === "enviado" ? "bg-purple-50 text-purple-700 hover:bg-purple-50" : ""}
                                ${pkg.status === "entregue" ? "bg-green-50 text-green-700 hover:bg-green-50" : ""}
                              `}
                            >
                              {pkg.status === "pendente" ? "Pendente" : 
                              pkg.status === "processando" ? "Em Processamento" : 
                              pkg.status === "enviado" ? "Enviado" :
                              "Entregue"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Gerar documentos
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <QrCode className="h-4 w-4 mr-2" />
                                    Gerar etiqueta
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Truck className="h-4 w-4 mr-2" />
                                    Atualizar status
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <FileArchive className="h-4 w-4 mr-2" />
                                    Arquivar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-4">
                          Nenhum malote encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <div className="text-xs text-muted-foreground">
                  Mostrando {filteredPackages.length} de {mockPackages.length} malotes
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled={filteredPackages.length === 0}>
                    Anterior
                  </Button>
                  <Button variant="outline" size="sm" disabled={filteredPackages.length === 0}>
                    Próximo
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Cartões de ações comuns */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Criar Novo Malote</h3>
                  <p className="text-xs text-muted-foreground">Registrar um novo malote para envio</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <QrCode className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Imprimir Etiquetas</h3>
                  <p className="text-xs text-muted-foreground">Gerar etiquetas para malotes</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Gerar Documentação</h3>
                  <p className="text-xs text-muted-foreground">Criar documentos para transporte</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
                  <Calculator className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Calcular Frete</h3>
                  <p className="text-xs text-muted-foreground">Estimativa de custos de envio</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </OrganizationLayout>
  );
}