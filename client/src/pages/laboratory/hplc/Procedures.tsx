import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  FileText,
  Pencil,
  Plus,
  FileSignature,
  Filter,
  Search,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";

interface Procedure {
  id: number;
  title: string;
  documentNumber: string;
  version: string;
  effectiveDate: string;
  category: string;
  content: string;
  attachments?: any;
  createdAt: string;
  updatedAt: string;
}

export default function Procedures() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [isLoadingProcedures, setIsLoadingProcedures] = useState(true);
  const [filters, setFilters] = useState({
    category: "all",
    search: "",
  });

  // Categorias de procedimentos HPLC
  const procedureCategories = [
    "Operacional",
    "Manutenção",
    "Calibração",
    "Análise",
    "Validação",
    "Segurança",
    "Regulatório",
    "Outro"
  ];

  // Função para buscar procedimentos
  React.useEffect(() => {
    fetchProcedures();
  }, []);

  const fetchProcedures = async () => {
    setIsLoadingProcedures(true);
    try {
      const response = await fetch("/api/laboratory/hplc/procedures");
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setProcedures(data);
      } else {
        setProcedures([]);
      }
    } catch (error) {
      console.error("Erro ao buscar procedimentos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os procedimentos.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProcedures(false);
    }
  };

  // Função para criar procedimento
  const handleCreateProcedure = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const procedureData = {
      title: formData.get("title"),
      documentNumber: formData.get("documentNumber"),
      version: formData.get("version"),
      effectiveDate: formData.get("effectiveDate"),
      category: formData.get("category"),
      content: formData.get("content"),
      attachments: null, // Para implementação futura de upload de arquivos
    };

    try {
      const response = await fetch("/api/laboratory/hplc/procedures", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(procedureData),
      });

      if (response.ok) {
        setIsCreating(false);
        fetchProcedures();
        toast({
          title: "Sucesso",
          description: "Procedimento criado com sucesso.",
          variant: "default",
        });
        form.reset();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Erro ao criar procedimento");
      }
    } catch (error) {
      console.error("Erro ao criar procedimento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o procedimento.",
        variant: "destructive",
      });
    }
  };

  // Função para atualizar procedimento
  const handleUpdateProcedure = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProcedure) return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    const procedureData = {
      title: formData.get("title"),
      documentNumber: formData.get("documentNumber"),
      version: formData.get("version"),
      effectiveDate: formData.get("effectiveDate"),
      category: formData.get("category"),
      content: formData.get("content"),
      attachments: selectedProcedure.attachments,
    };

    try {
      const response = await fetch(`/api/laboratory/hplc/procedures/${selectedProcedure.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(procedureData),
      });

      if (response.ok) {
        setIsEditing(false);
        fetchProcedures();
        toast({
          title: "Sucesso",
          description: "Procedimento atualizado com sucesso.",
          variant: "default",
        });
        setSelectedProcedure(null);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Erro ao atualizar procedimento");
      }
    } catch (error) {
      console.error("Erro ao atualizar procedimento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o procedimento.",
        variant: "destructive",
      });
    }
  };

  // Função para excluir procedimento
  const handleDeleteProcedure = async () => {
    if (!selectedProcedure) return;

    try {
      const response = await fetch(`/api/laboratory/hplc/procedures/${selectedProcedure.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setIsDeleting(false);
        fetchProcedures();
        toast({
          title: "Sucesso",
          description: "Procedimento excluído com sucesso.",
          variant: "default",
        });
        setSelectedProcedure(null);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Erro ao excluir procedimento");
      }
    } catch (error) {
      console.error("Erro ao excluir procedimento:", error);
      toast({
        title: "Erro",
        description: 
          error instanceof Error ? error.message : "Não foi possível excluir o procedimento.",
        variant: "destructive",
      });
    }
  };

  // Função para aplicar filtros
  const applyFilters = (procedureList: Procedure[]): Procedure[] => {
    if (!procedureList) return [];

    return procedureList.filter((procedure) => {
      // Filtrar por categoria
      if (filters.category && filters.category !== "all" && procedure.category !== filters.category) {
        return false;
      }

      // Filtrar por termo de busca
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          procedure.title.toLowerCase().includes(searchTerm) ||
          procedure.documentNumber.toLowerCase().includes(searchTerm) ||
          procedure.content.toLowerCase().includes(searchTerm)
        );
      }

      return true;
    });
  };

  // Procedimentos filtrados
  const filteredProcedures = applyFilters(procedures);

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Procedimentos HPLC</h1>
          <p className="text-muted-foreground">
            Gerencie procedimentos operacionais padrão (SOPs) para HPLC
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Procedimento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <form onSubmit={handleCreateProcedure}>
              <DialogHeader>
                <DialogTitle>Novo Procedimento</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes para adicionar um novo procedimento operacional padrão (SOP).
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input id="title" name="title" placeholder="Ex: Operação do equipamento HPLC" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="documentNumber">Número do Documento</Label>
                    <Input id="documentNumber" name="documentNumber" placeholder="Ex: SOP-HPLC-001" required />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="version">Versão</Label>
                    <Input id="version" name="version" placeholder="Ex: 1.0" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="effectiveDate">Data de Vigência</Label>
                    <Input id="effectiveDate" name="effectiveDate" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select name="category" defaultValue="Operacional" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Categorias</SelectLabel>
                          {procedureCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Conteúdo do Procedimento</Label>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder="Descreva o procedimento em detalhes..."
                    className="min-h-[200px]"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsCreating(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Procedimento</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Refine a lista de procedimentos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category-filter">Categoria</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters({ ...filters, category: value })}
                >
                  <SelectTrigger id="category-filter">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {procedureCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="search-filter">Pesquisar</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-filter"
                    type="search"
                    placeholder="Buscar por título, número ou conteúdo..."
                    className="pl-8"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Lista de Procedimentos</CardTitle>
            <CardDescription>
              {filteredProcedures.length} procedimentos encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingProcedures ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProcedures.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Nenhum procedimento encontrado</h3>
                <p className="text-sm text-muted-foreground">
                  Não existem procedimentos com os filtros selecionados.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Número do Documento</TableHead>
                    <TableHead>Versão</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Data de Vigência</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProcedures.map((procedure) => (
                    <TableRow key={procedure.id}>
                      <TableCell className="font-medium">{procedure.title}</TableCell>
                      <TableCell>{procedure.documentNumber}</TableCell>
                      <TableCell>{procedure.version}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {procedure.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(procedure.effectiveDate), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setSelectedProcedure(procedure);
                              setIsEditing(true);
                            }}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setSelectedProcedure(procedure);
                              setIsDeleting(true);
                            }}
                            title="Excluir"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de edição */}
      <Dialog open={isEditing && !!selectedProcedure} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[700px]">
          {selectedProcedure && (
            <form onSubmit={handleUpdateProcedure}>
              <DialogHeader>
                <DialogTitle>Editar Procedimento</DialogTitle>
                <DialogDescription>
                  Atualize os detalhes do procedimento.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Título</Label>
                    <Input
                      id="edit-title"
                      name="title"
                      defaultValue={selectedProcedure.title}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-documentNumber">Número do Documento</Label>
                    <Input
                      id="edit-documentNumber"
                      name="documentNumber"
                      defaultValue={selectedProcedure.documentNumber}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-version">Versão</Label>
                    <Input
                      id="edit-version"
                      name="version"
                      defaultValue={selectedProcedure.version}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-effectiveDate">Data de Vigência</Label>
                    <Input
                      id="edit-effectiveDate"
                      name="effectiveDate"
                      type="date"
                      defaultValue={selectedProcedure.effectiveDate.split('T')[0]}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Categoria</Label>
                    <Select name="category" defaultValue={selectedProcedure.category}>
                      <SelectTrigger id="edit-category">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Categorias</SelectLabel>
                          {procedureCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-content">Conteúdo do Procedimento</Label>
                  <Textarea
                    id="edit-content"
                    name="content"
                    className="min-h-[200px]"
                    defaultValue={selectedProcedure.content}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Atualizar Procedimento</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de exclusão */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja excluir este procedimento? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleting(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProcedure}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}