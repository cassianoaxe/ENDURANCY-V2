import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface PlanModulesProps {
  planId?: string;
}
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertCircle,
  ArrowLeft,
  Package,
  Save,
  Check,
  X,
  Search,
  FilterX,
  Sliders,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Interfaces
interface Module {
  id: number;
  name: string;
  type: string;
  description: string;
  price: string;
  status: 'active' | 'inactive';
}

interface Plan {
  id: number;
  name: string;
  description: string;
  price: string;
  tier: 'free' | 'seed' | 'grow' | 'pro' | 'enterprise';
  features?: string[];
  maxUsers?: number;
  maxProjects?: number;
  maxStorage?: number;
  isPopular?: boolean;
  modules?: Module[];
}

export default function PlanModules({ planId: propPlanId }: PlanModulesProps) {
  const params = useParams<{ planId: string }>();
  // Usar o planId de props se fornecido, caso contrário, usar o da URL
  const planId = propPlanId ? parseInt(propPlanId) : params?.planId ? parseInt(params.planId) : NaN;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("todos");
  const [selectedModules, setSelectedModules] = useState<number[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
  
  // Verificar se o usuário está autenticado e é um admin
  useEffect(() => {
    // Não fazer nada se ainda estiver carregando a autenticação
    if (authLoading) return;
    
    // Se o usuário não está autenticado, redirecionar para login
    if (!user) {
      toast({
        title: "Acesso restrito",
        description: "Você precisa estar logado como administrador para acessar esta página",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    // Se o usuário não é admin, redirecionar para página principal
    if (user.role !== 'admin') {
      toast({
        title: "Permissão negada",
        description: "Apenas administradores podem gerenciar planos e módulos",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
  }, [user, authLoading, navigate, toast]);

  // Buscar detalhes do plano
  const {
    data: plan,
    isLoading: planLoading,
    error: planError,
  } = useQuery<Plan>({
    queryKey: [`/api/plans/${planId}`],
    queryFn: async () => {
      if (isNaN(planId)) {
        throw new Error("ID do plano inválido");
      }
      
      console.log("Iniciando busca pelo plano ID:", planId);
      
      try {
        // Adicionar um pequeno delay para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const response = await fetch(`/api/plans/${planId}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include', // Incluir cookies de autenticação
          cache: 'no-store' // Evitar cache para sempre obter dados atualizados
        });
        
        if (!response.ok) {
          // Verificar se a resposta contém texto HTML (erro comum em redireções para login)
          const contentType = response.headers.get('content-type');
          console.log("Tipo de conteúdo recebido:", contentType);
          
          if (contentType && contentType.includes('text/html')) {
            // Caso seja HTML, provavelmente é uma página de login
            if (response.status === 401) {
              console.error("Erro 401: Sessão expirada");
              throw new Error('Sessão expirada. Faça login novamente.');
            } else if (response.status === 429) {
              console.error("Erro 429: Muitas requisições");
              throw new Error('Muitas requisições. Aguarde um momento e tente novamente.');
            } else {
              console.error(`Erro de autenticação. Status: ${response.status}`);
              throw new Error(`Erro de autenticação. Status: ${response.status}`);
            }
          }
          
          console.error(`Erro ao carregar plano: ${response.statusText}`);
          throw new Error(`Erro ao carregar plano: ${response.statusText}`);
        }
        
        // Verificar o tipo de conteúdo antes de tentar parsear como JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Resposta do servidor não está no formato JSON esperado');
          throw new Error('Resposta do servidor não está no formato JSON esperado');
        }
        
        const data = await response.json();
        console.log("Dados do plano recebidos com sucesso:", data.id);
        return data;
      } catch (error) {
        console.error('Erro ao buscar/processar plano:', error);
        throw error;
      }
    },
    enabled: !isNaN(planId), // Só executar a query se planId for um número válido
    retry: 2, // Tentar novamente até 2 vezes em caso de erro
    retryDelay: 1000 // Aguardar 1 segundo entre as tentativas
  });

  // Buscar todos os módulos disponíveis
  const {
    data: allModules = [],
    isLoading: modulesLoading,
    error: modulesError,
  } = useQuery<Module[]>({
    queryKey: ['/api/modules'],
    queryFn: async () => {
      const response = await fetch('/api/modules', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Incluir cookies de autenticação
      });
      
      if (!response.ok) {
        // Verificar se a resposta contém texto HTML (erro comum em redireções para login)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          // Caso seja HTML, provavelmente é uma página de login
          if (response.status === 401) {
            throw new Error('Sessão expirada. Faça login novamente.');
          } else {
            throw new Error(`Erro de autenticação. Status: ${response.status}`);
          }
        }
        
        throw new Error(`Erro ao carregar módulos: ${response.statusText}`);
      }
      
      // Verificar o tipo de conteúdo antes de tentar parsear como JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Resposta do servidor não está no formato JSON esperado');
      }
      
      try {
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Erro ao parsear resposta JSON:', error);
        throw new Error('Falha ao processar resposta do servidor');
      }
    },
  });

  // Inicializar os módulos selecionados quando o plano for carregado
  useEffect(() => {
    if (plan?.modules) {
      setSelectedModules(plan.modules.map(m => m.id));
    }
  }, [plan]);

  // Mutation para salvar as alterações nos módulos do plano
  const saveModulesMutation = useMutation({
    mutationFn: async (moduleIds: number[]) => {
      if (isNaN(planId)) {
        throw new Error("ID do plano inválido");
      }
      
      const response = await fetch(`/api/plans/${planId}/modules`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Incluir cookies de autenticação
        body: JSON.stringify({ moduleIds }),
      });

      // Verificar se a resposta contém texto HTML (erro comum em redireções para login)
      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        if (contentType && contentType.includes('text/html')) {
          // Caso seja HTML, provavelmente é uma página de login
          if (response.status === 401) {
            throw new Error('Sessão expirada. Faça login novamente.');
          } else {
            throw new Error(`Erro de autenticação. Status: ${response.status}`);
          }
        }
        
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erro ao salvar módulos');
        } catch (jsonError) {
          throw new Error('Erro ao salvar módulos');
        }
      }

      // Verificar o tipo de conteúdo antes de tentar parsear como JSON
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Resposta do servidor não está no formato JSON esperado');
      }
      
      try {
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Erro ao parsear resposta JSON:', error);
        throw new Error('Falha ao processar resposta do servidor');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/plans/${planId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/plans'] });
      
      toast({
        title: "Módulos atualizados",
        description: "As alterações foram salvas com sucesso",
        variant: "default",
      });
      
      setHasChanges(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar módulos",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Verificar se um módulo está incluído no plano
  const isModuleSelected = (moduleId: number) => {
    return selectedModules.includes(moduleId);
  };

  // Alternar seleção de um módulo
  const toggleModule = (moduleId: number) => {
    setSelectedModules(prev => {
      const newSelected = prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId];
      
      setHasChanges(true);
      return newSelected;
    });
  };

  // Filtrar módulos com base na pesquisa e no tipo selecionado
  const getFilteredModules = () => {
    return allModules.filter(module => {
      const matchesSearch = 
        module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === "todos" || module.type === filterType;
      
      return matchesSearch && matchesType;
    });
  };

  // Salvar as alterações
  const saveChanges = () => {
    saveModulesMutation.mutate(selectedModules);
  };

  // Cancelar alterações e voltar para a página de planos
  const cancelChanges = () => {
    if (hasChanges) {
      setConfirmDialogOpen(true);
    } else {
      navigate("/plans");
    }
  };

  // Obter todos os tipos de módulos disponíveis
  const getAvailableModuleTypes = () => {
    const types = new Set<string>();
    allModules.forEach(module => types.add(module.type));
    return Array.from(types);
  };

  const isLoading = planLoading || modulesLoading;
  const error = planError || modulesError;

  // Mostrar tela de carregamento enquanto verifica autenticação
  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </Layout>
    );
  }
  
  // Se o usuário não estiver autenticado ou não for admin, não renderiza o conteúdo
  // (O useEffect já lida com o redirecionamento)
  if (!user || user.role !== 'admin') {
    return null;
  }
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-destructive/15 border border-destructive text-destructive p-4 rounded-md mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <h3 className="font-semibold">Erro:</h3>
            </div>
            <p className="mt-2">{(error as Error).message}</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              className="mr-3"
              onClick={cancelChanges}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {planLoading ? "Carregando plano..." : `Configurar Módulos: ${plan?.name}`}
              </h1>
              <p className="text-muted-foreground">
                Selecione os módulos que serão incluídos neste plano
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={cancelChanges}
              disabled={saveModulesMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={saveChanges}
              disabled={!hasChanges || saveModulesMutation.isPending}
            >
              {saveModulesMutation.isPending ? (
                <div className="flex items-center">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Salvando...
                </div>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </div>

        {plan && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </div>
                <Badge
                  className={`${
                    plan.tier === 'free' ? 'bg-gray-500' : 
                    plan.tier === 'seed' ? 'bg-green-500' : 
                    plan.tier === 'grow' ? 'bg-blue-500' : 
                    plan.tier === 'pro' ? 'bg-indigo-500' : 
                    'bg-red-600'
                  } hover:${
                    plan.tier === 'free' ? 'bg-gray-600' : 
                    plan.tier === 'seed' ? 'bg-green-600' : 
                    plan.tier === 'grow' ? 'bg-blue-600' : 
                    plan.tier === 'pro' ? 'bg-indigo-600' : 
                    'bg-red-700'
                  }`}
                >
                  {plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1)}
                </Badge>
              </div>
              <div className="mt-4 text-3xl font-bold">
                {plan.tier === 'free' ? 'Grátis' : `R$ ${Number(plan.price).toLocaleString('pt-BR')}/mês`}
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">Módulos selecionados</div>
                <Badge variant="outline">
                  {selectedModules.length} de {allModules.length} módulos
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Módulos Disponíveis</CardTitle>
              <div className="flex items-center space-x-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <Sliders className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    {getAvailableModuleTypes().map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar módulos..."
                    className="pl-8 w-[220px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      <FilterX className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-center">Incluir</TableHead>
                      <TableHead>Nome do Módulo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Preço Individual</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredModules().length > 0 ? (
                      getFilteredModules().map((module) => (
                        <TableRow key={module.id}>
                          <TableCell className="text-center">
                            <Checkbox
                              checked={isModuleSelected(module.id)}
                              onCheckedChange={() => toggleModule(module.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            {module.name}
                            {module.status === 'inactive' && (
                              <Badge variant="outline" className="ml-2 text-amber-500 border-amber-500">
                                Inativo
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {module.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{module.description}</TableCell>
                          <TableCell className="text-right">
                            {module.price ? `R$ ${Number(module.price).toLocaleString('pt-BR')}` : 'Grátis'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <X className="h-8 w-8 mb-2" />
                            <p>Nenhum módulo encontrado para os filtros selecionados.</p>
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setSearchTerm("");
                                setFilterType("todos");
                              }}
                              className="mt-2"
                            >
                              Limpar filtros
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between pt-6">
            <div className="text-sm text-muted-foreground">
              {selectedModules.length === 0 ? (
                "Nenhum módulo selecionado"
              ) : (
                <>
                  <span className="font-medium text-foreground">{selectedModules.length}</span> módulos selecionados 
                  {hasChanges && " (não salvo)"}
                </>
              )}
            </div>
            <Button
              disabled={!hasChanges || saveModulesMutation.isPending}
              onClick={saveChanges}
            >
              <Check className="mr-2 h-4 w-4" />
              Salvar Configuração
            </Button>
          </CardFooter>
        </Card>
      </div>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem alterações não salvas. Se continuar, todas as modificações serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                setConfirmDialogOpen(false);
                navigate("/plans");
              }}
            >
              Descartar e sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}