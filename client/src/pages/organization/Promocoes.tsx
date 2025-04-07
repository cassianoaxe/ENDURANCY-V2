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
  Search, Filter, Download, Tag, Edit, Trash2, Plus,
  RefreshCw, ChevronLeft, ChevronRight, CalendarDays,
  Calendar, PercentIcon, Package, AlertCircle
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { useToast } from "@/hooks/use-toast";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

// Dados simulados das promoções
const promocoes = [
  {
    id: 1,
    nome: "Desconto de Verão",
    tipo: "Percentual",
    valor: 20,
    dataInicio: "01/04/2025",
    dataFim: "30/04/2025",
    status: "Ativa",
    produtos: [
      { id: 1, nome: "Óleo Essencial de Lavanda", precoNormal: 89.90, precoPromocional: 71.92 },
      { id: 2, nome: "Crème de CBD 500mg", precoNormal: 159.90, precoPromocional: 127.92 },
    ],
    codigoCupom: "VERAO20",
    restricoes: "Não cumulativo com outras promoções",
    descricao: "Desconto de 20% em produtos selecionados para o verão."
  },
  {
    id: 2,
    nome: "Compre 2, Leve 3",
    tipo: "Quantidade",
    valor: null,
    dataInicio: "05/04/2025",
    dataFim: "15/05/2025",
    status: "Ativa",
    produtos: [
      { id: 3, nome: "Chá de Camomila Orgânico", precoNormal: 28.50, precoPromocional: 28.50 },
    ],
    codigoCupom: null,
    restricoes: "Válido apenas para o produto Chá de Camomila Orgânico",
    descricao: "Na compra de 2 unidades, leve 3. Aplicado automaticamente no carrinho."
  },
  {
    id: 3,
    nome: "Frete Grátis",
    tipo: "Frete",
    valor: 0,
    dataInicio: "01/04/2025",
    dataFim: "01/06/2025",
    status: "Ativa",
    produtos: [],
    valorMinimo: 150.00,
    codigoCupom: "FRETEFREE",
    restricoes: "Válido para compras acima de R$ 150,00",
    descricao: "Frete grátis para compras acima de R$ 150,00 em todo o site."
  },
  {
    id: 4,
    nome: "Desconto Progressive",
    tipo: "Progressivo",
    valor: [10, 15, 20],
    dataInicio: "10/04/2025",
    dataFim: "10/05/2025",
    status: "Agendada",
    produtos: [],
    valorMinimo: 100.00,
    codigoCupom: null,
    restricoes: "O desconto aumenta conforme a quantidade de itens no carrinho",
    descricao: "10% de desconto para 1 item, 15% para 2 itens, 20% para 3 ou mais itens."
  },
  {
    id: 5,
    nome: "Black Friday 2024",
    tipo: "Percentual",
    valor: 50,
    dataInicio: "29/11/2024",
    dataFim: "02/12/2024",
    status: "Expirada",
    produtos: [
      { id: 1, nome: "Óleo Essencial de Lavanda", precoNormal: 89.90, precoPromocional: 44.95 },
      { id: 4, nome: "Proteína Vegana", precoNormal: 120.00, precoPromocional: 60.00 },
      { id: 5, nome: "Ômega 3 1000mg", precoNormal: 65.90, precoPromocional: 32.95 },
    ],
    codigoCupom: "BLACK50",
    restricoes: "Válido apenas para os produtos selecionados",
    descricao: "Descontos especiais para a Black Friday."
  },
  {
    id: 6,
    nome: "Valor Fixo",
    tipo: "Fixo",
    valor: 30.00,
    dataInicio: "15/04/2025",
    dataFim: "15/05/2025",
    status: "Agendada",
    produtos: [],
    valorMinimo: 200.00,
    codigoCupom: "MENOS30",
    restricoes: "Válido para compras acima de R$ 200,00",
    descricao: "Desconto de R$ 30,00 para compras acima de R$ 200,00."
  }
];

// Produtos disponíveis (para o formulário de adicionar/editar promoção)
const produtos = [
  { id: 1, nome: "Óleo Essencial de Lavanda", preco: 89.90, categoria: "Óleos Essenciais" },
  { id: 2, nome: "Crème de CBD 500mg", preco: 159.90, categoria: "Terapêuticos" },
  { id: 3, nome: "Chá de Camomila Orgânico", preco: 28.50, categoria: "Chás" },
  { id: 4, nome: "Proteína Vegana", preco: 120.00, categoria: "Suplementos" },
  { id: 5, nome: "Ômega 3 1000mg", preco: 65.90, categoria: "Suplementos" },
  { id: 6, nome: "Vitamina D3 2000UI", preco: 45.90, categoria: "Suplementos" },
  { id: 7, nome: "Óleo de Coco Extravirgem", preco: 39.90, categoria: "Óleos Essenciais" },
  { id: 8, nome: "Colágeno Hidrolisado", preco: 89.00, categoria: "Suplementos" }
];

export default function Promocoes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [tipoFilter, setTipoFilter] = useState("Todos");
  const [selectedPromocao, setSelectedPromocao] = useState<any | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Datas para o formulário
  const [dataInicio, setDataInicio] = useState<Date | undefined>(new Date());
  const [dataFim, setDataFim] = useState<Date | undefined>(new Date());
  const [selectedDateType, setSelectedDateType] = useState<'inicio' | 'fim'>('inicio');
  
  // Status para as badges de promoções
  const statusConfig: Record<string, { color: string }> = {
    "Ativa": { color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
    "Agendada": { color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
    "Expirada": { color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" }
  };

  // Tipos para as badges de promoções
  const tipoConfig: Record<string, { color: string, icon: React.ReactNode }> = {
    "Percentual": { 
      color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      icon: <PercentIcon className="h-3.5 w-3.5 mr-1" />
    },
    "Fixo": { 
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      icon: <Tag className="h-3.5 w-3.5 mr-1" />
    },
    "Quantidade": { 
      color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      icon: <Package className="h-3.5 w-3.5 mr-1" />
    },
    "Frete": { 
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      icon: <AlertCircle className="h-3.5 w-3.5 mr-1" />
    },
    "Progressivo": { 
      color: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300",
      icon: <Tag className="h-3.5 w-3.5 mr-1" />
    }
  };

  // Filtragem por termo de busca e status
  const filteredPromocoes = promocoes.filter(promocao => {
    const matchesTerm = searchTerm === "" || 
      promocao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (promocao.codigoCupom && promocao.codigoCupom.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "Todos" || promocao.status === statusFilter;
    const matchesTipo = tipoFilter === "Todos" || promocao.tipo === tipoFilter;
    
    return matchesTerm && matchesStatus && matchesTipo;
  });

  // Paginação
  const pageCount = Math.ceil(filteredPromocoes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPromocoes = filteredPromocoes.slice(startIndex, startIndex + itemsPerPage);

  // Abrir modal de formulário para adicionar/editar
  const handleEditPromocao = (promocao: any) => {
    setSelectedPromocao(promocao);
    setFormMode("edit");
    // Converter string para Date
    if (promocao.dataInicio) {
      const [day, month, year] = promocao.dataInicio.split('/');
      setDataInicio(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
    }
    if (promocao.dataFim) {
      const [day, month, year] = promocao.dataFim.split('/');
      setDataFim(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
    }
    setIsFormDialogOpen(true);
  };

  const handleAddPromocao = () => {
    setSelectedPromocao(null);
    setFormMode("add");
    setDataInicio(new Date());
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setDataFim(nextMonth);
    setIsFormDialogOpen(true);
  };

  // Abrir modal de confirmação de exclusão
  const handleDeleteConfirm = (promocao: any) => {
    setSelectedPromocao(promocao);
    setIsDeleteDialogOpen(true);
  };

  // Simular salvar promoção
  const handleSavePromocao = () => {
    toast({
      title: formMode === "add" ? "Promoção adicionada" : "Promoção atualizada",
      description: formMode === "add" 
        ? "A promoção foi adicionada com sucesso." 
        : "As alterações foram salvas com sucesso.",
      variant: "default",
    });
    setIsFormDialogOpen(false);
  };

  // Simular excluir promoção
  const handleDeletePromocao = () => {
    toast({
      title: "Promoção excluída",
      description: "A promoção foi excluída com sucesso.",
      variant: "destructive",
    });
    setIsDeleteDialogOpen(false);
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

  // Formatar valor da promoção
  const formatPromoValue = (promocao: any) => {
    if (promocao.tipo === 'Percentual') {
      return `${promocao.valor}%`;
    } else if (promocao.tipo === 'Fixo') {
      return `R$ ${promocao.valor.toFixed(2)}`;
    } else if (promocao.tipo === 'Frete') {
      return 'Frete Grátis';
    } else if (promocao.tipo === 'Quantidade') {
      return 'Compre X, Leve Y';
    } else if (promocao.tipo === 'Progressivo') {
      return `${promocao.valor[0]}% - ${promocao.valor[promocao.valor.length - 1]}%`;
    }
    return '-';
  };

  return (
    <OrganizationLayout>
      <div className="flex flex-col space-y-4 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Promoções</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie descontos, cupons e ofertas especiais
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button 
              className="h-9 bg-green-600 hover:bg-green-700"
              onClick={handleAddPromocao}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Promoção
            </Button>
          </div>
        </div>
        
        {/* Filtros e busca */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar promoção ou cupom..." 
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
                <SelectItem value="Todos">Todos os status</SelectItem>
                <SelectItem value="Ativa">Ativa</SelectItem>
                <SelectItem value="Agendada">Agendada</SelectItem>
                <SelectItem value="Expirada">Expirada</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos os tipos</SelectItem>
                <SelectItem value="Percentual">Percentual</SelectItem>
                <SelectItem value="Fixo">Valor Fixo</SelectItem>
                <SelectItem value="Frete">Frete Grátis</SelectItem>
                <SelectItem value="Quantidade">Quantidade</SelectItem>
                <SelectItem value="Progressivo">Progressivo</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" className="h-9" onClick={() => {
              setSearchTerm("");
              setStatusFilter("Todos");
              setTipoFilter("Todos");
            }}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          </div>
        </div>
        
        {/* Tabela de promoções */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome da Promoção</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="hidden md:table-cell">Cupom</TableHead>
                  <TableHead className="hidden md:table-cell">Período</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPromocoes.length > 0 ? (
                  paginatedPromocoes.map((promocao) => (
                    <TableRow key={promocao.id}>
                      <TableCell>
                        <div className="font-medium">{promocao.nome}</div>
                        <div className="text-sm text-muted-foreground hidden md:block line-clamp-1">
                          {promocao.descricao}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={`flex items-center ${tipoConfig[promocao.tipo]?.color}`}
                        >
                          {tipoConfig[promocao.tipo]?.icon}
                          {promocao.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatPromoValue(promocao)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {promocao.codigoCupom ? (
                          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                            {promocao.codigoCupom}
                          </code>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center">
                          <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                          <span className="text-sm">{promocao.dataInicio} a {promocao.dataFim}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={`${statusConfig[promocao.status]?.color}`}
                        >
                          {promocao.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditPromocao(promocao)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteConfirm(promocao)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center">
                        <Tag className="h-12 w-12 text-gray-300 mb-2" />
                        <h3 className="text-lg font-medium">Nenhuma promoção encontrada</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Tente ajustar os filtros ou adicione uma nova promoção.
                        </p>
                        <Button onClick={handleAddPromocao}>
                          <Plus className="mr-2 h-4 w-4" />
                          Nova Promoção
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          
          {/* Paginação */}
          {filteredPromocoes.length > itemsPerPage && (
            <CardFooter className="flex items-center justify-between px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Mostrando <span className="font-medium">{startIndex + 1}</span> a <span className="font-medium">
                  {Math.min(startIndex + itemsPerPage, filteredPromocoes.length)}
                </span> de <span className="font-medium">{filteredPromocoes.length}</span> promoções
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
      
      {/* Modal de Formulário - Adicionar/Editar Promoção */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{formMode === "add" ? "Nova Promoção" : "Editar Promoção"}</DialogTitle>
            <DialogDescription>
              {formMode === "add" 
                ? "Crie uma nova promoção, desconto ou cupom" 
                : "Atualize as informações da promoção"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <Tabs defaultValue="info-basicas">
              <TabsList className="w-full">
                <TabsTrigger value="info-basicas" className="flex-1">Informações Básicas</TabsTrigger>
                <TabsTrigger value="produtos" className="flex-1">Produtos</TabsTrigger>
                <TabsTrigger value="regras" className="flex-1">Regras e Restrições</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info-basicas" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-full">
                    <Label htmlFor="nome">Nome da Promoção</Label>
                    <Input 
                      id="nome" 
                      placeholder="Nome da promoção" 
                      defaultValue={selectedPromocao?.nome || ""} 
                    />
                  </div>
                  
                  <div className="col-span-full">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea 
                      id="descricao" 
                      placeholder="Descreva a promoção" 
                      defaultValue={selectedPromocao?.descricao || ""} 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tipo">Tipo de Promoção</Label>
                    <Select defaultValue={selectedPromocao?.tipo || "Percentual"}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Percentual">Desconto Percentual (%)</SelectItem>
                        <SelectItem value="Fixo">Valor Fixo (R$)</SelectItem>
                        <SelectItem value="Frete">Frete Grátis</SelectItem>
                        <SelectItem value="Quantidade">Quantidade (ex: leve 3, pague 2)</SelectItem>
                        <SelectItem value="Progressivo">Desconto Progressivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="valor">Valor do Desconto</Label>
                    <div className="flex">
                      <Input 
                        id="valor" 
                        type="number" 
                        placeholder="Valor" 
                        defaultValue={selectedPromocao?.valor || ""} 
                        className="rounded-r-none"
                      />
                      <div className="flex items-center justify-center px-3 border border-l-0 rounded-r-md bg-muted">
                        %
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Data de Início</Label>
                    <div className="grid gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {dataInicio ? (
                              format(dataInicio, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={dataInicio}
                            onSelect={(date) => setDataInicio(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Data de Término</Label>
                    <div className="grid gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {dataFim ? (
                              format(dataFim, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={dataFim}
                            onSelect={(date) => setDataFim(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div className="col-span-full">
                    <Label htmlFor="status">Status</Label>
                    <RadioGroup defaultValue={selectedPromocao?.status || "Ativa"} className="flex gap-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Ativa" id="status-ativa" />
                        <Label htmlFor="status-ativa" className="font-normal">Ativa</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Agendada" id="status-agendada" />
                        <Label htmlFor="status-agendada" className="font-normal">Agendada</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Expirada" id="status-expirada" />
                        <Label htmlFor="status-expirada" className="font-normal">Expirada</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="produtos" className="pt-4">
                <div className="grid gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <Label className="text-base">Aplicar a:</Label>
                      <div>
                        <RadioGroup defaultValue="produtos-especificos" className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="produtos-especificos" id="produtos-especificos" />
                            <Label htmlFor="produtos-especificos" className="font-normal">Produtos específicos</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="todas-categorias" id="todas-categorias" />
                            <Label htmlFor="todas-categorias" className="font-normal">Todas as categorias</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="todo-site" id="todo-site" />
                            <Label htmlFor="todo-site" className="font-normal">Todo o site</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <div className="mb-4">
                        <Label htmlFor="search-produtos">Buscar e adicionar produtos</Label>
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="search-produtos" 
                            placeholder="Digite para buscar produtos..." 
                            className="pl-9"
                          />
                        </div>
                      </div>
                      
                      <div className="grid gap-2 max-h-52 overflow-y-auto">
                        {produtos.map((produto) => (
                          <div key={produto.id} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex items-center gap-2">
                              <Checkbox id={`produto-${produto.id}`} />
                              <Label htmlFor={`produto-${produto.id}`} className="font-normal">
                                {produto.nome}
                              </Label>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              R$ {produto.preco.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {selectedPromocao?.produtos && selectedPromocao.produtos.length > 0 && (
                    <div>
                      <Label className="text-base mb-2 block">Produtos com desconto</Label>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Produto</TableHead>
                            <TableHead>Preço Normal</TableHead>
                            <TableHead>Preço Promocional</TableHead>
                            <TableHead>Desconto</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedPromocao.produtos.map((produto: any) => (
                            <TableRow key={produto.id}>
                              <TableCell>{produto.nome}</TableCell>
                              <TableCell>R$ {produto.precoNormal.toFixed(2)}</TableCell>
                              <TableCell>R$ {produto.precoPromocional.toFixed(2)}</TableCell>
                              <TableCell>
                                {((1 - produto.precoPromocional / produto.precoNormal) * 100).toFixed(0)}%
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="regras" className="pt-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="cupom">Código do Cupom (opcional)</Label>
                    <Input 
                      id="cupom" 
                      placeholder="Ex: VERAO20" 
                      defaultValue={selectedPromocao?.codigoCupom || ""} 
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Deixe em branco para aplicar automaticamente o desconto.
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="valor_minimo">Valor Mínimo de Compra (R$)</Label>
                    <Input 
                      id="valor_minimo" 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      defaultValue={selectedPromocao?.valorMinimo || ""} 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="restricoes">Restrições</Label>
                    <Textarea 
                      id="restricoes" 
                      placeholder="Descreva quaisquer restrições ou condições" 
                      defaultValue={selectedPromocao?.restricoes || ""} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Configurações Adicionais</Label>
                    <div className="flex items-center space-x-2">
                      <Switch id="cumulativo" />
                      <Label htmlFor="cumulativo" className="font-normal">Permitir uso cumulativo com outras promoções</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="limite_uso" />
                      <Label htmlFor="limite_uso" className="font-normal">Limitar número de usos por cliente</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="primeira_compra" />
                      <Label htmlFor="primeira_compra" className="font-normal">Aplicável apenas para primeira compra</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleSavePromocao}
            >
              {formMode === "add" ? "Criar Promoção" : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta promoção? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPromocao && (
            <div className="py-4">
              <h3 className="font-medium text-lg">{selectedPromocao.nome}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="outline"
                  className={`${tipoConfig[selectedPromocao.tipo]?.color}`}
                >
                  {selectedPromocao.tipo}
                </Badge>
                <Badge 
                  variant="outline"
                  className={`${statusConfig[selectedPromocao.status]?.color}`}
                >
                  {selectedPromocao.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{selectedPromocao.descricao}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeletePromocao}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir Promoção
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OrganizationLayout>
  );
}