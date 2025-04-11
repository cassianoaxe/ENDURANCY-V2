import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Filter,
  PackageOpen,
  Package,
  BarChart,
  AlertTriangle,
  Search,
  ArrowUpDown,
  Plus,
  FileText,
  Printer,
  Download,
} from "lucide-react";

// Tipos de dados
type InventoryItem = {
  id: string;
  code: string;
  name: string;
  type: "materia-prima" | "em-processamento" | "produto-acabado";
  quantity: number;
  unit: string;
  location: string;
  batchNumber: string;
  status: "disponível" | "em uso" | "em quarentena" | "aprovado" | "reprovado";
  createdAt: Date;
  expiryDate: Date | null;
  notes: string;
  minQuantity: number;
  maxQuantity: number;
  category: string;
};

export default function EstoquePage() {
  const [activeTab, setActiveTab] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);

  const { toast } = useToast();

  // Consulta de dados (simulado por enquanto)
  const { data: inventory, isLoading } = useQuery({
    queryKey: ["/api/production/inventory"],
    queryFn: async () => {
      // Simulando dados para demonstração
      return [
        {
          id: "1",
          code: "MP-00123",
          name: "CBD Isolado",
          type: "materia-prima",
          quantity: 5000,
          unit: "g",
          location: "Almoxarifado A - Prateleira 3",
          batchNumber: "LOTE-2025-0012",
          status: "disponível",
          createdAt: new Date("2025-03-15"),
          expiryDate: new Date("2026-03-15"),
          notes: "Fornecedor: ExtracTech",
          minQuantity: 1000,
          maxQuantity: 10000,
          category: "Canabinoides",
        },
        {
          id: "2",
          code: "MP-00245",
          name: "Óleo de Coco Fracionado",
          type: "materia-prima",
          quantity: 25000,
          unit: "ml",
          location: "Almoxarifado B - Prateleira 1",
          batchNumber: "LOTE-2025-0015",
          status: "disponível",
          createdAt: new Date("2025-03-10"),
          expiryDate: new Date("2026-06-10"),
          notes: "Fornecedor: NaturalOils Inc.",
          minQuantity: 5000,
          maxQuantity: 50000,
          category: "Veículos",
        },
        {
          id: "3",
          code: "PP-00056",
          name: "Tintura CBD 10% - Em Processamento",
          type: "em-processamento",
          quantity: 5000,
          unit: "ml",
          location: "Área de Produção - Tanque 2",
          batchNumber: "LOTE-2025-0018",
          status: "em uso",
          createdAt: new Date("2025-04-01"),
          expiryDate: null,
          notes: "Em processo de mistura e homogeneização",
          minQuantity: 0,
          maxQuantity: 10000,
          category: "Produtos Líquidos",
        },
        {
          id: "4",
          code: "PA-00189",
          name: "Óleo CBD 5% 30ml",
          type: "produto-acabado",
          quantity: 500,
          unit: "unidades",
          location: "Armazém de Produtos - Setor C",
          batchNumber: "LOTE-2025-0022",
          status: "aprovado",
          createdAt: new Date("2025-04-02"),
          expiryDate: new Date("2027-04-02"),
          notes: "Pronto para distribuição",
          minQuantity: 100,
          maxQuantity: 1000,
          category: "Óleos",
        },
        {
          id: "5",
          code: "PA-00190",
          name: "Óleo CBD 10% 30ml",
          type: "produto-acabado",
          quantity: 350,
          unit: "unidades",
          location: "Armazém de Produtos - Setor C",
          batchNumber: "LOTE-2025-0023",
          status: "aprovado",
          createdAt: new Date("2025-04-02"),
          expiryDate: new Date("2027-04-02"),
          notes: "Pronto para distribuição",
          minQuantity: 100,
          maxQuantity: 1000,
          category: "Óleos",
        },
        {
          id: "6",
          code: "MP-00126",
          name: "Terpenos Naturais",
          type: "materia-prima",
          quantity: 500,
          unit: "ml",
          location: "Almoxarifado A - Prateleira 4",
          batchNumber: "LOTE-2025-0026",
          status: "em quarentena",
          createdAt: new Date("2025-04-05"),
          expiryDate: new Date("2026-04-05"),
          notes: "Aguardando análise de qualidade",
          minQuantity: 200,
          maxQuantity: 1000,
          category: "Adjuvantes",
        },
      ] as InventoryItem[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const filteredItems = React.useMemo(() => {
    if (!inventory) return [];

    let filtered = [...inventory];

    // Filtrar por tipo
    if (activeTab !== "todos") {
      filtered = filtered.filter((item) => item.type === activeTab);
    }

    // Pesquisa
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.code.toLowerCase().includes(term) ||
          item.batchNumber.toLowerCase().includes(term) ||
          item.location.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [inventory, activeTab, searchTerm]);

  // Verificar itens com baixo estoque
  const lowStockItems = React.useMemo(() => {
    if (!inventory) return [];
    return inventory.filter((item) => item.quantity <= item.minQuantity);
  }, [inventory]);

  // Verificar itens em quarentena
  const quarantineItems = React.useMemo(() => {
    if (!inventory) return [];
    return inventory.filter((item) => item.status === "em quarentena");
  }, [inventory]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "disponível":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "em uso":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "em quarentena":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "aprovado":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "reprovado":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "materia-prima":
        return "Matéria-Prima";
      case "em-processamento":
        return "Em Processamento";
      case "produto-acabado":
        return "Produto Acabado";
      default:
        return type;
    }
  };

  const handleShowDetails = (item: InventoryItem) => {
    setCurrentItem(item);
    setOpenDetailsModal(true);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar adição de item
    toast({
      title: "Item adicionado com sucesso",
      description: "O item foi adicionado ao estoque.",
    });
    setOpenAddModal(false);
  };

  return (
    <OrganizationLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestão de Estoque</h1>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setOpenAddModal(true)}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Item
            </Button>
            <Button variant="outline" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Relatório
            </Button>
            <Button variant="outline" className="flex items-center">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="outline" className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Itens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inventory ? inventory.length : 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Todos os itens em estoque
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">
                Itens em Alerta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {lowStockItems.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Itens com estoque abaixo do mínimo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-600">
                Em Quarentena
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {quarantineItems.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Itens aguardando liberação
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-lg border shadow-sm">
          <div className="p-4 border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <Tabs
                defaultValue="todos"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full md:w-auto"
              >
                <TabsList>
                  <TabsTrigger value="todos" className="text-xs md:text-sm">
                    Todos
                  </TabsTrigger>
                  <TabsTrigger
                    value="materia-prima"
                    className="text-xs md:text-sm"
                  >
                    Matérias-Primas
                  </TabsTrigger>
                  <TabsTrigger
                    value="em-processamento"
                    className="text-xs md:text-sm"
                  >
                    Em Processamento
                  </TabsTrigger>
                  <TabsTrigger
                    value="produto-acabado"
                    className="text-xs md:text-sm"
                  >
                    Produtos Acabados
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Buscar no estoque..."
                    className="w-full pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  title="Filtros avançados"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-24">
                      Carregando dados...
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-24">
                      Nenhum item encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.code}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{getTypeLabel(item.type)}</TableCell>
                      <TableCell className="text-right">
                        {item.quantity} {item.unit}
                        {item.quantity <= item.minQuantity && (
                          <span
                            className="ml-2 inline-flex"
                            title="Estoque abaixo do mínimo"
                          >
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{item.batchNumber}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusColor(item.status)}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {item.location}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="link"
                          className="h-8 px-2"
                          onClick={() => handleShowDetails(item)}
                        >
                          Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={openDetailsModal} onOpenChange={setOpenDetailsModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Item</DialogTitle>
            <DialogDescription>
              Informações completas sobre o item de estoque
            </DialogDescription>
          </DialogHeader>

          {currentItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code" className="text-muted-foreground">
                    Código
                  </Label>
                  <div id="code" className="font-medium">
                    {currentItem.code}
                  </div>
                </div>
                <div>
                  <Label htmlFor="status" className="text-muted-foreground">
                    Status
                  </Label>
                  <div>
                    <Badge
                      variant="outline"
                      className={getStatusColor(currentItem.status)}
                    >
                      {currentItem.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="name" className="text-muted-foreground">
                  Nome
                </Label>
                <div id="name" className="font-medium">
                  {currentItem.name}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type" className="text-muted-foreground">
                    Tipo
                  </Label>
                  <div id="type">{getTypeLabel(currentItem.type)}</div>
                </div>
                <div>
                  <Label htmlFor="category" className="text-muted-foreground">
                    Categoria
                  </Label>
                  <div id="category">{currentItem.category}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="quantity" className="text-muted-foreground">
                    Quantidade
                  </Label>
                  <div id="quantity">
                    {currentItem.quantity} {currentItem.unit}
                  </div>
                </div>
                <div>
                  <Label htmlFor="min" className="text-muted-foreground">
                    Mínimo
                  </Label>
                  <div id="min">
                    {currentItem.minQuantity} {currentItem.unit}
                  </div>
                </div>
                <div>
                  <Label htmlFor="max" className="text-muted-foreground">
                    Máximo
                  </Label>
                  <div id="max">
                    {currentItem.maxQuantity} {currentItem.unit}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="location" className="text-muted-foreground">
                  Localização
                </Label>
                <div id="location">{currentItem.location}</div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="batchNumber" className="text-muted-foreground">
                    Número do Lote
                  </Label>
                  <div id="batchNumber">{currentItem.batchNumber}</div>
                </div>
                <div>
                  <Label htmlFor="createdAt" className="text-muted-foreground">
                    Data de Registro
                  </Label>
                  <div id="createdAt">
                    {currentItem.createdAt.toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <Label htmlFor="expiryDate" className="text-muted-foreground">
                    Validade
                  </Label>
                  <div id="expiryDate">
                    {currentItem.expiryDate
                      ? currentItem.expiryDate.toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="text-muted-foreground">
                  Observações
                </Label>
                <div id="notes">{currentItem.notes || "Nenhuma observação"}</div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setOpenDetailsModal(false)}>
              Fechar
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline">Editar</Button>
              <Button variant="outline">Movimentar</Button>
              <Button variant="outline">Histórico</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Adicionar Item */}
      <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Item</DialogTitle>
            <DialogDescription>
              Preencha os dados para adicionar um novo item ao estoque
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddItem}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="code">Código</Label>
                  <Input id="code" placeholder="Ex: MP-00123" required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select required defaultValue="materia-prima">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="materia-prima">Matéria-Prima</SelectItem>
                      <SelectItem value="em-processamento">Em Processamento</SelectItem>
                      <SelectItem value="produto-acabado">Produto Acabado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" placeholder="Nome do item" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input id="category" placeholder="Ex: Canabinoides" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="batchNumber">Número do Lote</Label>
                  <Input id="batchNumber" placeholder="Ex: LOTE-2025-0001" required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="unit">Unidade</Label>
                  <Select required defaultValue="g">
                    <SelectTrigger>
                      <SelectValue placeholder="Unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">Gramas (g)</SelectItem>
                      <SelectItem value="kg">Quilogramas (kg)</SelectItem>
                      <SelectItem value="ml">Mililitros (ml)</SelectItem>
                      <SelectItem value="l">Litros (l)</SelectItem>
                      <SelectItem value="unidades">Unidades</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select required defaultValue="disponível">
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disponível">Disponível</SelectItem>
                      <SelectItem value="em uso">Em Uso</SelectItem>
                      <SelectItem value="em quarentena">Em Quarentena</SelectItem>
                      <SelectItem value="aprovado">Aprovado</SelectItem>
                      <SelectItem value="reprovado">Reprovado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="minQuantity">Quantidade Mínima</Label>
                  <Input
                    id="minQuantity"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="maxQuantity">Quantidade Máxima</Label>
                  <Input
                    id="maxQuantity"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  placeholder="Ex: Almoxarifado A - Prateleira 3"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="expiryDate">Data de Validade</Label>
                <Input id="expiryDate" type="date" />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Informações adicionais sobre o item"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenAddModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">Adicionar Item</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </OrganizationLayout>
  );
}