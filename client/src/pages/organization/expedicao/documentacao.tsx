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
  FileText,
  Search,
  Download,
  Filter,
  FilePlus,
  Printer,
  File,
  ClipboardList,
  FileSpreadsheet,
  MoreHorizontal
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

// Dados de exemplo para documentos
const mockDocuments = [
  { 
    id: "DOC-12345", 
    pedido: "PED-12345",
    cliente: "Carlos Silva", 
    data: "07/04/2025", 
    tipo: "nota-fiscal", 
    formato: "PDF",
    tamanho: "234 KB",
    status: "gerado"
  },
  { 
    id: "DOC-12346", 
    pedido: "PED-12346",
    cliente: "Maria Oliveira", 
    data: "07/04/2025", 
    tipo: "manifesto", 
    formato: "PDF",
    tamanho: "512 KB",
    status: "pendente"
  },
  { 
    id: "DOC-12347", 
    pedido: "PED-12347",
    cliente: "João Santos", 
    data: "06/04/2025", 
    tipo: "recibo", 
    formato: "PDF",
    tamanho: "128 KB",
    status: "gerado"
  },
  { 
    id: "DOC-12348", 
    pedido: "PED-12348",
    cliente: "Ana Pereira", 
    data: "06/04/2025", 
    tipo: "lista-embalagem", 
    formato: "PDF",
    tamanho: "198 KB",
    status: "impresso"
  },
  { 
    id: "DOC-12349", 
    pedido: "PED-12349", 
    cliente: "Roberto Almeida", 
    data: "05/04/2025", 
    tipo: "nota-fiscal", 
    formato: "PDF",
    tamanho: "245 KB",
    status: "impresso"
  },
  { 
    id: "DOC-12350", 
    pedido: "PED-12350",
    cliente: "Fernanda Costa", 
    data: "05/04/2025", 
    tipo: "conhecimento", 
    formato: "PDF",
    tamanho: "320 KB",
    status: "gerado"
  }
];

// Tipos de documentos e suas descrições
const documentTypes = [
  { 
    id: "nota-fiscal", 
    nome: "Nota Fiscal", 
    descricao: "Documento fiscal obrigatório para transporte de mercadorias",
    icone: <FileText size={20} />
  },
  { 
    id: "manifesto", 
    nome: "Manifesto de Carga", 
    descricao: "Documento que detalha toda a carga transportada em um veículo",
    icone: <ClipboardList size={20} />
  },
  { 
    id: "recibo", 
    nome: "Recibo de Entrega", 
    descricao: "Comprovante de entrega para o destinatário",
    icone: <File size={20} />
  },
  { 
    id: "lista-embalagem", 
    nome: "Lista de Embalagem", 
    descricao: "Detalhamento de itens contidos em cada embalagem",
    icone: <FileSpreadsheet size={20} />
  },
  { 
    id: "conhecimento", 
    nome: "Conhecimento de Transporte", 
    descricao: "Documento fiscal para o transporte de cargas",
    icone: <FileText size={20} />
  }
];

export default function DocumentacaoExpedicao() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("");
  const [selectedFormato, setSelectedFormato] = useState("");

  // Função para navegação entre páginas
  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
  };

  // Função para filtrar documentos com base na guia selecionada e no termo de pesquisa
  const filteredDocuments = mockDocuments.filter(doc => {
    // Filtro de status
    if (selectedTab === "pendentes" && doc.status !== "pendente") return false;
    if (selectedTab === "gerados" && doc.status !== "gerado") return false;
    if (selectedTab === "impressos" && doc.status !== "impresso") return false;
    
    // Filtro de tipo
    if (selectedTipo && doc.tipo !== selectedTipo) return false;
    
    // Filtro de formato
    if (selectedFormato && doc.formato !== selectedFormato) return false;
    
    // Filtro de pesquisa
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        doc.id.toLowerCase().includes(searchLower) ||
        doc.pedido.toLowerCase().includes(searchLower) ||
        doc.cliente.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

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
            <h1 className="text-2xl font-bold tracking-tight">Documentação</h1>
            <p className="text-muted-foreground mt-1">
              Gere, gerencie e imprima documentos para seus pedidos
            </p>
          </div>
          <div className="flex space-x-2">
            <Button>
              <FilePlus className="h-4 w-4 mr-2" />
              Novo Documento
            </Button>
          </div>
        </div>

        {/* Estatísticas de Documentos */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Total de Documentos</span>
                <div className="mt-1">
                  <span className="text-3xl font-bold">{mockDocuments.length}</span>
                </div>
                <div className="mt-4 text-blue-600 text-xs">
                  <FileText className="h-3 w-3 inline mr-1" />
                  {mockDocuments.reduce((acc, doc) => acc + parseFloat(doc.tamanho), 0).toFixed(0)} KB no total
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Documentos Pendentes</span>
                <div className="mt-1">
                  <span className="text-3xl font-bold">
                    {mockDocuments.filter(doc => doc.status === "pendente").length}
                  </span>
                </div>
                <div className="mt-4 text-amber-600 text-xs">
                  <FileText className="h-3 w-3 inline mr-1" />
                  Aguardando geração
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Documentos Gerados</span>
                <div className="mt-1">
                  <span className="text-3xl font-bold">
                    {mockDocuments.filter(doc => doc.status === "gerado").length}
                  </span>
                </div>
                <div className="mt-4 text-blue-600 text-xs">
                  <FileText className="h-3 w-3 inline mr-1" />
                  Prontos para impressão
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Documentos Impressos</span>
                <div className="mt-1">
                  <span className="text-3xl font-bold">
                    {mockDocuments.filter(doc => doc.status === "impresso").length}
                  </span>
                </div>
                <div className="mt-4 text-green-600 text-xs">
                  <Printer className="h-3 w-3 inline mr-1" />
                  Prontos para expedição
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
              placeholder="Buscar por documento, pedido ou cliente..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedTipo} onValueChange={setSelectedTipo}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo de Documento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                <SelectItem value="nota-fiscal">Nota Fiscal</SelectItem>
                <SelectItem value="manifesto">Manifesto de Carga</SelectItem>
                <SelectItem value="recibo">Recibo de Entrega</SelectItem>
                <SelectItem value="lista-embalagem">Lista de Embalagem</SelectItem>
                <SelectItem value="conhecimento">Conhecimento de Transporte</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedFormato} onValueChange={setSelectedFormato}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os formatos</SelectItem>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="XML">XML</SelectItem>
                <SelectItem value="CSV">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs de categorias */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="todos">Todos os Documentos</TabsTrigger>
            <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
            <TabsTrigger value="gerados">Gerados</TabsTrigger>
            <TabsTrigger value="impressos">Impressos</TabsTrigger>
          </TabsList>
          
          <TabsContent value={selectedTab} className="space-y-4">
            {/* Tabela de documentos */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Documento</TableHead>
                      <TableHead>Nº Pedido</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Formato</TableHead>
                      <TableHead>Tamanho</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.length > 0 ? (
                      filteredDocuments.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.id}</TableCell>
                          <TableCell>{doc.pedido}</TableCell>
                          <TableCell>{doc.cliente}</TableCell>
                          <TableCell>{doc.data}</TableCell>
                          <TableCell>
                            {documentTypes.find(type => type.id === doc.tipo)?.nome || doc.tipo}
                          </TableCell>
                          <TableCell>{doc.formato}</TableCell>
                          <TableCell>{doc.tamanho}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`
                                ${doc.status === "pendente" ? "bg-amber-50 text-amber-700 hover:bg-amber-50" : ""}
                                ${doc.status === "gerado" ? "bg-blue-50 text-blue-700 hover:bg-blue-50" : ""}
                                ${doc.status === "impresso" ? "bg-green-50 text-green-700 hover:bg-green-50" : ""}
                              `}
                            >
                              {doc.status === "pendente" ? "Pendente" : 
                              doc.status === "gerado" ? "Gerado" : 
                              "Impresso"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {doc.status === "pendente" ? (
                                <Button variant="outline" size="sm">
                                  <FileText className="h-4 w-4 mr-2" />
                                  Gerar
                                </Button>
                              ) : (
                                <>
                                  <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>Visualizar</DropdownMenuItem>
                                      <DropdownMenuItem>Enviar por e-mail</DropdownMenuItem>
                                      <DropdownMenuItem>Duplicar</DropdownMenuItem>
                                      <DropdownMenuItem>Arquivar</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-4">
                          Nenhum documento encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <div className="text-xs text-muted-foreground">
                  Mostrando {filteredDocuments.length} de {mockDocuments.length} documentos
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled={filteredDocuments.length === 0}>
                    Anterior
                  </Button>
                  <Button variant="outline" size="sm" disabled={filteredDocuments.length === 0}>
                    Próximo
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Tipos de Documentos */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Tipos de Documentos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {documentTypes.map((tipo, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                    {React.cloneElement(tipo.icone, { className: "text-green-600" })}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">{tipo.nome}</h3>
                    <p className="text-xs text-muted-foreground">{tipo.descricao}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </OrganizationLayout>
  );
}