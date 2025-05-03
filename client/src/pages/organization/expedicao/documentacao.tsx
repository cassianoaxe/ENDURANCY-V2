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
  MoreHorizontal,
  Check,
  X,
  Share,
  Mail,
  Copy,
  Archive,
  EyeIcon,
  AlertCircle,
  CheckCircle2
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

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

// Dados de exemplo de pedidos para selecionar ao criar documentos
const mockOrders = [
  { id: "PED-12345", cliente: "Carlos Silva", status: "Em Preparação", data: "07/04/2025", itens: 5 },
  { id: "PED-12346", cliente: "Maria Oliveira", status: "Pronto para Envio", data: "07/04/2025", itens: 3 },
  { id: "PED-12347", cliente: "João Santos", status: "Em Preparação", data: "06/04/2025", itens: 2 },
  { id: "PED-12348", cliente: "Ana Pereira", status: "Aguardando Confirmação", data: "06/04/2025", itens: 4 },
  { id: "PED-12349", cliente: "Roberto Almeida", status: "Pronto para Envio", data: "05/04/2025", itens: 7 },
  { id: "PED-12350", cliente: "Fernanda Costa", status: "Em Preparação", data: "05/04/2025", itens: 1 }
];

// Exemplo de conteúdo para cada tipo de documento
const documentoExemplo = {
  "nota-fiscal": `
NOTA FISCAL ELETRÔNICA - NF-e
Nº 000.000.001
SÉRIE: 001

EMITENTE: ENDURANCY LOGISTICS S.A.
CNPJ: 00.000.000/0001-00
INSCRIÇÃO ESTADUAL: 000.000.000.000

DESTINATÁRIO:
NOME: CARLOS SILVA
CPF/CNPJ: 000.000.000-00
ENDEREÇO: AV. BRASIL, 1500
BAIRRO: CENTRO
CIDADE: SÃO PAULO - SP
CEP: 00000-000

ITENS:
1. PRODUTO A - QTD: 2 - VALOR UNIT: R$ S00,00 - VALOR TOTAL: R$ 1.000,00
2. PRODUTO B - QTD: 1 - VALOR UNIT: R$ 300,00 - VALOR TOTAL: R$ 300,00
3. PRODUTO C - QTD: 3 - VALOR UNIT: R$ 200,00 - VALOR TOTAL: R$ 600,00

VALOR TOTAL DA NOTA: R$ 1.900,00
VALOR DO IMPOSTO: R$ 342,00

DATA DE EMISSÃO: 07/04/2025
CHAVE DE ACESSO: 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000
  `,
  "manifesto": `
MANIFESTO ELETRÔNICO DE DOCUMENTOS FISCAIS
MDF-e Nº 000000001
SÉRIE: 001

EMITENTE: ENDURANCY LOGISTICS S.A.
CNPJ: 00.000.000/0001-00

INFORMAÇÕES DA CARGA:
TIPO DE CARGA: PRODUTOS DIVERSOS
PESO BRUTO: 120,00 KG
VALOR TOTAL DA CARGA: R$ 10.500,00

MODAL DE TRANSPORTE: RODOVIÁRIO
VEÍCULO: PLACA ABC-1234
MOTORISTA: JOÃO SILVA - CPF: 000.000.000-00

DOCUMENTOS VINCULADOS:
- NF-e 000.000.001 - DESTINATÁRIO: CARLOS SILVA
- NF-e 000.000.002 - DESTINATÁRIO: MARIA OLIVEIRA
- NF-e 000.000.003 - DESTINATÁRIO: JOÃO SANTOS

ROTA:
ORIGEM: SÃO PAULO - SP
DESTINO: RIO DE JANEIRO - RJ
PREVISÃO DE ENTREGA: 09/04/2025

OBSERVAÇÕES:
CARGA CONTÉM PRODUTOS FRÁGEIS. MANUSEAR COM CUIDADO.
  `,
  "recibo": `
RECIBO DE ENTREGA
Nº 00001

DECLARAMOS QUE RECEBEMOS OS PRODUTOS CONSTANTES DA 
NOTA FISCAL Nº 000.000.001 EMITIDA POR ENDURANCY LOGISTICS S.A.

NOME DO RECEBEDOR: CARLOS SILVA
DOCUMENTO: 000.000.000-00
DATA/HORA DO RECEBIMENTO: 09/04/2025 - 14:30h

CONDIÇÃO DOS PRODUTOS:
[X] EMBALAGEM ÍNTEGRA
[X] QUANTIDADE CORRETA
[X] SEM AVARIAS VISÍVEIS

OBSERVAÇÕES DO RECEBEDOR:
Produtos recebidos em perfeito estado.

__________________________
ASSINATURA DO RECEBEDOR
  `,
  "lista-embalagem": `
LISTA DE EMBALAGEM (PACKING LIST)
PEDIDO: PED-12345
CLIENTE: CARLOS SILVA

VOLUME 1 DE 2:
- PRODUTO A - QTD: 2 - PESO: 5 KG
- PRODUTO B - QTD: 1 - PESO: 3 KG
PESO TOTAL: 8 KG
DIMENSÕES: 40 x 30 x 20 cm

VOLUME 2 DE 2:
- PRODUTO C - QTD: 3 - PESO: 6 KG
PESO TOTAL: 6 KG
DIMENSÕES: 35 x 25 x 15 cm

PESO TOTAL DA REMESSA: 14 KG
TOTAL DE VOLUMES: 2
CUBAGEM TOTAL: 0,042 m³

OBSERVAÇÕES:
ARMAZENAR EM LOCAL SECO. 
NÃO EMPILHAR MAIS DE 3 CAIXAS.
  `,
  "conhecimento": `
CONHECIMENTO DE TRANSPORTE ELETRÔNICO
CT-e Nº 000000001
SÉRIE: 001

TRANSPORTADOR: ENDURANCY LOGISTICS S.A.
CNPJ: 00.000.000/0001-00
INSCRIÇÃO ESTADUAL: 000.000.000.000

REMETENTE:
ENDURANCY LOGISTICS S.A.
CNPJ: 00.000.000/0001-00
ENDEREÇO: RUA INDUSTRIAL, 1000 - SÃO PAULO - SP

DESTINATÁRIO:
CARLOS SILVA
CPF: 000.000.000-00
ENDEREÇO: AV. BRASIL, 1500 - RIO DE JANEIRO - RJ

DOCUMENTOS VINCULADOS:
- NF-e 000.000.001

INFORMAÇÕES DA CARGA:
VOLUMES: 2
PESO BRUTO: 14 KG
VALOR TOTAL: R$ 1.900,00
PREVISÃO DE ENTREGA: 09/04/2025

VALOR DO FRETE: R$ 150,00
VALOR DO SEGURO: R$ 95,00
VALOR TOTAL DO CT-e: R$ 245,00

DATA DE EMISSÃO: 07/04/2025
CHAVE DE ACESSO: 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000
  `
};

export default function DocumentacaoExpedicao() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("");
  const [selectedFormato, setSelectedFormato] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
  const [isDocSuccessModalOpen, setIsDocSuccessModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedDocType, setSelectedDocType] = useState("");
  const [observations, setObservations] = useState("");
  const [newDocId, setNewDocId] = useState("");

  // Função para navegação entre páginas
  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
  };

  // Função para abrir a visualização do documento
  const openDocumentPreview = (doc: any) => {
    setSelectedDocument(doc);
    setIsPreviewOpen(true);
  };

  // Função para baixar documento
  const downloadDocument = (docId: string) => {
    toast({
      title: "Download iniciado",
      description: `O documento ${docId} está sendo baixado`,
      variant: "default",
    });
  };

  // Função para imprimir documento
  const printDocument = (docId: string) => {
    toast({
      title: "Enviado para impressão",
      description: `O documento ${docId} foi enviado para impressão`,
      variant: "default",
    });
  };

  // Função para enviar documento por e-mail
  const sendDocumentByEmail = (docId: string) => {
    toast({
      title: "E-mail enviado",
      description: `O documento ${docId} foi enviado por e-mail com sucesso`,
      variant: "default",
    });
  };

  // Função para gerar novo documento
  const generateDocument = () => {
    if (!selectedOrderId || !selectedDocType) {
      toast({
        title: "Dados incompletos",
        description: "Selecione o pedido e o tipo de documento",
        variant: "destructive",
      });
      return;
    }

    // Lógica de geração de documento (simulação)
    const newDocumentId = `DOC-${Math.floor(10000 + Math.random() * 90000)}`;
    setNewDocId(newDocumentId);
    setIsNewDocModalOpen(false);
    setIsDocSuccessModalOpen(true);
    
    // Limpar formulário
    setSelectedOrderId("");
    setSelectedDocType("");
    setObservations("");
  };

  // Função para filtrar documentos com base na guia selecionada e no termo de pesquisa
  const filteredDocuments = mockDocuments.filter(doc => {
    // Filtro de status
    if (selectedTab === "pendentes" && doc.status !== "pendente") return false;
    if (selectedTab === "gerados" && doc.status !== "gerado") return false;
    if (selectedTab === "impressos" && doc.status !== "impresso") return false;
    
    // Filtro de tipo
    if (selectedTipo && selectedTipo !== "all" && doc.tipo !== selectedTipo) return false;
    
    // Filtro de formato
    if (selectedFormato && selectedFormato !== "all" && doc.formato !== selectedFormato) return false;
    
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
            <Button onClick={() => setIsNewDocModalOpen(true)}>
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
                <SelectItem value="all">Todos os tipos</SelectItem>
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
                <SelectItem value="all">Todos os formatos</SelectItem>
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
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    toast({
                                      title: "Documento gerado com sucesso",
                                      description: `O documento ${doc.id} foi gerado e está pronto para uso`,
                                      variant: "default",
                                    });
                                    
                                    // Na implementação real, isso atualizaria o status no banco de dados
                                    // Aqui apenas abrimos a visualização do documento com um mock atualizado
                                    const updatedDoc = {...doc, status: "gerado"};
                                    setTimeout(() => {
                                      setSelectedDocument(updatedDoc);
                                      setIsPreviewOpen(true);
                                    }, 500);
                                  }}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Gerar
                                </Button>
                              ) : (
                                <>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => downloadDocument(doc.id)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => printDocument(doc.id)}
                                  >
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => openDocumentPreview(doc)}>
                                        <EyeIcon className="h-4 w-4 mr-2" />
                                        Visualizar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => sendDocumentByEmail(doc.id)}>
                                        <Mail className="h-4 w-4 mr-2" />
                                        Enviar por e-mail
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Duplicar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Archive className="h-4 w-4 mr-2" />
                                        Arquivar
                                      </DropdownMenuItem>
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

        {/* Modal de Visualização de Documento */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {selectedDocument && (
                  <>
                    Documento {selectedDocument.id}
                    <Badge 
                      variant="outline" 
                      className={`ml-3 ${
                        selectedDocument.status === "pendente" ? "bg-amber-50 text-amber-700" : 
                        selectedDocument.status === "gerado" ? "bg-blue-50 text-blue-700" : 
                        "bg-green-50 text-green-700"
                      }`}
                    >
                      {selectedDocument.status === "pendente" ? "Pendente" : 
                      selectedDocument.status === "gerado" ? "Gerado" : "Impresso"}
                    </Badge>
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {selectedDocument && (
                  <span className="text-sm">
                    Pedido <span className="font-medium">{selectedDocument.pedido}</span> • 
                    Cliente <span className="font-medium">{selectedDocument.cliente}</span>
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            
            {selectedDocument && (
              <>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium">Informações do Documento</h3>
                    </div>
                    <div className="bg-muted rounded-md overflow-hidden">
                      <div className="grid grid-cols-2 gap-2 text-xs p-3">
                        <div>
                          <span className="text-muted-foreground">Tipo:</span>
                          <span className="font-medium ml-1">
                            {documentTypes.find(type => type.id === selectedDocument.tipo)?.nome || selectedDocument.tipo}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Data de Emissão:</span>
                          <span className="font-medium ml-1">{selectedDocument.data}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Formato:</span>
                          <span className="font-medium ml-1">{selectedDocument.formato}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tamanho:</span>
                          <span className="font-medium ml-1">{selectedDocument.tamanho}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Última Atualização:</span>
                          <span className="font-medium ml-1">{selectedDocument.data} às 14:30</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium">Detalhes do Pedido</h3>
                    </div>
                    <div className="bg-muted rounded-md overflow-hidden">
                      <div className="grid grid-cols-2 gap-2 text-xs p-3">
                        <div>
                          <span className="text-muted-foreground">Pedido:</span>
                          <span className="font-medium ml-1">{selectedDocument.pedido}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Data do Pedido:</span>
                          <span className="font-medium ml-1">{selectedDocument.data}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cliente:</span>
                          <span className="font-medium ml-1">{selectedDocument.cliente}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">E-mail:</span>
                          <span className="font-medium ml-1">{selectedDocument.cliente.toLowerCase().replace(/\s/g, ".") + "@exemplo.com"}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Endereço:</span>
                          <span className="font-medium ml-1">Av. Brasil, 1500 - São Paulo, SP</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex flex-col space-y-2">
                  <h3 className="text-sm font-medium mb-1">Pré-visualização do Documento</h3>
                  <Card className="border border-gray-200">
                    <CardContent className="p-3">
                      <pre className="text-xs whitespace-pre-wrap font-mono overflow-auto max-h-80 bg-slate-50 p-4 rounded-md">
                        {documentoExemplo[selectedDocument.tipo as keyof typeof documentoExemplo]}
                      </pre>
                    </CardContent>
                  </Card>
                </div>
                
                <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:gap-0">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(false)}>
                      <X className="h-4 w-4 mr-1" />
                      Fechar
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        downloadDocument(selectedDocument.id);
                        setIsPreviewOpen(false);
                      }}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Baixar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        printDocument(selectedDocument.id);
                        setIsPreviewOpen(false);
                      }}
                    >
                      <Printer className="h-4 w-4 mr-1" />
                      Imprimir
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        sendDocumentByEmail(selectedDocument.id);
                        setIsPreviewOpen(false);
                      }}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Enviar por E-mail
                    </Button>
                  </div>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal para criar novo documento */}
        <Dialog open={isNewDocModalOpen} onOpenChange={setIsNewDocModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FilePlus className="h-5 w-5" />
                Gerar Novo Documento
              </DialogTitle>
              <DialogDescription>
                Selecione o pedido e o tipo de documento que deseja gerar.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="order">Pedido</Label>
                <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um pedido" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockOrders.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.id} - {order.cliente}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedOrderId && (
                  <div className="mt-2 p-2 bg-slate-50 rounded-md text-xs border">
                    <div className="font-medium mb-1 text-gray-700">Detalhes do Pedido:</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <div><span className="text-gray-500">Cliente:</span> {mockOrders.find(o => o.id === selectedOrderId)?.cliente}</div>
                      <div><span className="text-gray-500">Status:</span> {mockOrders.find(o => o.id === selectedOrderId)?.status}</div>
                      <div><span className="text-gray-500">Data:</span> {mockOrders.find(o => o.id === selectedOrderId)?.data}</div>
                      <div><span className="text-gray-500">Itens:</span> {mockOrders.find(o => o.id === selectedOrderId)?.itens}</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="doc-type">Tipo de Documento</Label>
                <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de documento" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedDocType && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    {documentTypes.find(type => type.id === selectedDocType)?.icone}
                    <span>{documentTypes.find(type => type.id === selectedDocType)?.descricao}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="observations">Observações (opcional)</Label>
                <Textarea
                  id="observations"
                  placeholder="Adicione informações ou instruções especiais para este documento"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewDocModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={generateDocument}>
                Gerar Documento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Modal de sucesso ao gerar documento */}
        <Dialog open={isDocSuccessModalOpen} onOpenChange={setIsDocSuccessModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                Documento Gerado com Sucesso
              </DialogTitle>
              <DialogDescription>
                O documento foi gerado e está pronto para ser utilizado.
              </DialogDescription>
            </DialogHeader>
            
            <div className="bg-green-50 p-4 rounded-md border border-green-100 my-2">
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-md p-2 border border-green-200">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">{newDocId}</h4>
                  <p className="text-xs text-gray-500">Gerado em {new Date().toLocaleDateString()} às {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  className="flex-1 sm:flex-auto"
                  variant="outline" 
                  onClick={() => setIsDocSuccessModalOpen(false)}
                >
                  <Check className="h-4 w-4 mr-1" />
                  OK
                </Button>
                <Button 
                  className="flex-1 sm:flex-auto"
                  variant="outline" 
                  onClick={() => {
                    setIsDocSuccessModalOpen(false);
                    setTimeout(() => {
                      const mockDoc = {
                        id: newDocId,
                        pedido: selectedOrderId,
                        cliente: mockOrders.find(o => o.id === selectedOrderId)?.cliente || "",
                        data: new Date().toLocaleDateString('pt-BR'),
                        tipo: selectedDocType,
                        formato: "PDF",
                        tamanho: `${Math.floor(100 + Math.random() * 400)} KB`,
                        status: "gerado"
                      };
                      setSelectedDocument(mockDoc);
                      setIsPreviewOpen(true);
                    }, 100);
                  }}
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  Visualizar
                </Button>
                <Button 
                  className="flex-1 sm:flex-auto"
                  variant="default" 
                  onClick={() => {
                    downloadDocument(newDocId);
                    setIsDocSuccessModalOpen(false);
                  }}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Baixar
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}