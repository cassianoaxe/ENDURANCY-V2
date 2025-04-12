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
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  Pencil,
  Plus,
  Search,
  AlertCircle,
  XCircle,
  Beaker,
  Layers
} from "lucide-react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useNavigate } from "wouter";

interface ValidationParameter {
  name: string;
  criteria: string;
  value?: string;
}

interface MethodValidation {
  id: number;
  methodName: string;
  version: string;
  status: "submitted" | "in_progress" | "completed" | "rejected";
  validationParameters?: ValidationParameter[];
  protocol: string;
  reports?: any;
  conclusion?: string;
  createdAt: string;
  updatedAt: string;
}

export default function Validations() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [selectedValidation, setSelectedValidation] = useState<MethodValidation | null>(null);
  const [validations, setValidations] = useState<MethodValidation[]>([]);
  const [isLoadingValidations, setIsLoadingValidations] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  });

  // Parâmetros comuns para validação de métodos HPLC
  const commonValidationParameters = [
    { name: "Linearidade", criteria: "R² > 0.99" },
    { name: "Precisão", criteria: "RSD < 2.0%" },
    { name: "Exatidão", criteria: "Recuperação 98-102%" },
    { name: "Limite de detecção", criteria: "Sinal/Ruído > 3" },
    { name: "Limite de quantificação", criteria: "Sinal/Ruído > 10" },
    { name: "Especificidade", criteria: "Sem interferências" },
    { name: "Robustez", criteria: "Variação < 2.0%" },
  ];

  // Função para buscar validações
  React.useEffect(() => {
    fetchValidations();
  }, []);

  const fetchValidations = async () => {
    setIsLoadingValidations(true);
    try {
      const response = await fetch("/api/laboratory/hplc/validations");
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setValidations(data);
      } else {
        setValidations([]);
      }
    } catch (error) {
      console.error("Erro ao buscar validações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as validações de métodos.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingValidations(false);
    }
  };

  // Função para criar validação
  const handleCreateValidation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Preparar parâmetros de validação
    const selectedParams = commonValidationParameters.filter((_, idx) => 
      formData.get(`param_${idx}`) === "on"
    );

    const validationData = {
      methodName: formData.get("methodName"),
      version: formData.get("version"),
      status: "submitted",
      validationParameters: selectedParams,
      protocol: formData.get("protocol"),
      conclusion: "",
      reports: null,
    };

    try {
      const response = await fetch("/api/laboratory/hplc/validations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validationData),
      });

      if (response.ok) {
        setIsCreating(false);
        fetchValidations();
        toast({
          title: "Sucesso",
          description: "Validação de método criada com sucesso.",
          variant: "default",
        });
        form.reset();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Erro ao criar validação de método");
      }
    } catch (error) {
      console.error("Erro ao criar validação de método:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a validação de método.",
        variant: "destructive",
      });
    }
  };

  // Função para atualizar validação
  const handleUpdateValidation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedValidation) return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    const validationData = {
      status: formData.get("status"),
      conclusion: formData.get("conclusion"),
    };

    try {
      const response = await fetch(`/api/laboratory/hplc/validations/${selectedValidation.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validationData),
      });

      if (response.ok) {
        setIsEditing(false);
        fetchValidations();
        toast({
          title: "Sucesso",
          description: "Status da validação atualizado com sucesso.",
          variant: "default",
        });
        setSelectedValidation(null);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Erro ao atualizar status da validação");
      }
    } catch (error) {
      console.error("Erro ao atualizar validação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da validação.",
        variant: "destructive",
      });
    }
  };

  // Função para aplicar filtros
  const applyFilters = (validationList: MethodValidation[]): MethodValidation[] => {
    if (!validationList) return [];

    return validationList.filter((validation) => {
      // Filtrar por status
      if (filters.status && filters.status !== "all" && validation.status !== filters.status) {
        return false;
      }

      // Filtrar por termo de busca
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          validation.methodName.toLowerCase().includes(searchTerm) ||
          validation.version.toLowerCase().includes(searchTerm) ||
          (validation.protocol && validation.protocol.toLowerCase().includes(searchTerm))
        );
      }

      return true;
    });
  };

  // Validações filtradas
  const filteredValidations = applyFilters(validations);

  // Renderizar badge de status com cor apropriada
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Clock className="mr-1 h-3 w-3" /> Submetido
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Beaker className="mr-1 h-3 w-3" /> Em Andamento
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Concluído
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="mr-1 h-3 w-3" /> Rejeitado
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Validações de Métodos HPLC</h1>
          <p className="text-muted-foreground">
            Gerencie validações de métodos analíticos
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nova Validação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <form onSubmit={handleCreateValidation}>
              <DialogHeader>
                <DialogTitle>Nova Validação de Método</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes para iniciar um novo processo de validação de método.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="methodName">Nome do Método</Label>
                    <Input id="methodName" name="methodName" placeholder="Ex: Quantificação de THC" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="version">Versão</Label>
                    <Input id="version" name="version" placeholder="Ex: 1.0" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protocol">Protocolo de Validação</Label>
                  <Textarea
                    id="protocol"
                    name="protocol"
                    placeholder="Descreva o protocolo de validação..."
                    className="min-h-[100px]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Parâmetros de Validação</Label>
                  <div className="grid grid-cols-2 gap-2 border rounded-md p-3">
                    {commonValidationParameters.map((param, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id={`param_${idx}`} 
                          name={`param_${idx}`} 
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label htmlFor={`param_${idx}`} className="text-sm">
                          {param.name} ({param.criteria})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsCreating(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Iniciar Validação</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Refine a lista de validações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="submitted">Submetido</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="rejected">Rejeitado</SelectItem>
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
                    placeholder="Buscar por nome do método..."
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
            <CardTitle>Lista de Validações</CardTitle>
            <CardDescription>
              {filteredValidations.length} validações encontradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingValidations ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredValidations.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Nenhuma validação encontrada</h3>
                <p className="text-sm text-muted-foreground">
                  Não existem validações com os filtros selecionados.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Método</TableHead>
                    <TableHead>Versão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead>Última Atualização</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredValidations.map((validation) => (
                    <TableRow key={validation.id}>
                      <TableCell className="font-medium">{validation.methodName}</TableCell>
                      <TableCell>{validation.version}</TableCell>
                      <TableCell>{renderStatusBadge(validation.status)}</TableCell>
                      <TableCell>
                        {format(new Date(validation.createdAt), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        {format(new Date(validation.updatedAt), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setSelectedValidation(validation);
                              setIsViewingDetails(true);
                            }}
                            title="Ver Detalhes"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setSelectedValidation(validation);
                              setIsEditing(true);
                            }}
                            title="Atualizar Status"
                          >
                            <Pencil className="h-4 w-4" />
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

      {/* Modal de visualização de detalhes */}
      <Dialog open={isViewingDetails && !!selectedValidation} onOpenChange={setIsViewingDetails}>
        <DialogContent className="sm:max-w-[700px]">
          {selectedValidation && (
            <>
              <DialogHeader>
                <DialogTitle>Detalhes da Validação</DialogTitle>
                <DialogDescription>
                  Informações detalhadas sobre a validação do método.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Nome do Método</h3>
                    <p className="mt-1">{selectedValidation.methodName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Versão</h3>
                    <p className="mt-1">{selectedValidation.version}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Status</h3>
                  <p className="mt-1">{renderStatusBadge(selectedValidation.status)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Protocolo</h3>
                  <p className="mt-1 text-sm whitespace-pre-line">{selectedValidation.protocol}</p>
                </div>
                {selectedValidation.validationParameters && selectedValidation.validationParameters.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium">Parâmetros de Validação</h3>
                    <div className="mt-2 border rounded-md p-3">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Parâmetro</TableHead>
                            <TableHead>Critério</TableHead>
                            <TableHead>Resultado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedValidation.validationParameters.map((param, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{param.name}</TableCell>
                              <TableCell>{param.criteria}</TableCell>
                              <TableCell>{param.value || "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
                {selectedValidation.conclusion && (
                  <div>
                    <h3 className="text-sm font-medium">Conclusão</h3>
                    <p className="mt-1 text-sm whitespace-pre-line">{selectedValidation.conclusion}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={() => setIsViewingDetails(false)}>Fechar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de edição de status */}
      <Dialog open={isEditing && !!selectedValidation} onOpenChange={setIsEditing}>
        <DialogContent>
          {selectedValidation && (
            <form onSubmit={handleUpdateValidation}>
              <DialogHeader>
                <DialogTitle>Atualizar Status da Validação</DialogTitle>
                <DialogDescription>
                  Atualize o status da validação e adicione uma conclusão se necessário.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={selectedValidation.status}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="submitted">Submetido</SelectItem>
                        <SelectItem value="in_progress">Em Andamento</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                        <SelectItem value="rejected">Rejeitado</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conclusion">Conclusão</Label>
                  <Textarea
                    id="conclusion"
                    name="conclusion"
                    placeholder="Descreva a conclusão da validação..."
                    className="min-h-[100px]"
                    defaultValue={selectedValidation.conclusion || ""}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Atualizar</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}