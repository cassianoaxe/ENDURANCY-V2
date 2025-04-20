import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Loader2, 
  AlertCircle, 
  Shield, 
  AlertTriangle, 
  ArrowLeft, 
  Save, 
  Search, 
  FilterX, 
  X, 
  Check, 
  Package, 
  Sliders,
  Info
} from "lucide-react";

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
} from "@/components/ui/alert-dialog";

interface PlanModulesProps {
  planId?: string;
}

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
  const [loadingPlanModules, setLoadingPlanModules] = useState(true);
  const [planModulesError, setPlanModulesError] = useState<Error | null>(null);
  
  // IDs dos módulos padrão que não podem ser desmarcados
  // Estes módulos estarão presentes em todos os planos: financeiro, complypay, vendas online, expedição, integrações e comunicação
  const standardModuleTypes = ["financeiro", "complypay", "vendas", "expedição", "integracoes", "comunicacao"];
  
  // Verificar se o usuário está autenticado e é um admin
  useEffect(() => {
    console.log("Verificando autenticação:", { 
      authLoading, 
      userExists: !!user, 
      userRole: user?.role 
    });
    
    // Não fazer nada se ainda estiver carregando a autenticação
    if (authLoading) return;
    
    // Se o usuário não está autenticado, redirecionar para login
    if (!user) {
      console.log("Usuário não autenticado, redirecionando para login");
      toast({
        title: "Acesso restrito",
        description: "Você precisa estar logado como administrador para acessar esta página",
        variant: "destructive",
      });
      // Usar window.location para garantir um redirecionamento completo
      window.location.href = "/login";
      return;
    }
    
    // Se o usuário não é admin, redirecionar para página principal
    if (user.role !== 'admin') {
      console.log("Usuário não é admin, redirecionando para home");
      toast({
        title: "Permissão negada",
        description: "Apenas administradores podem gerenciar planos e módulos",
        variant: "destructive",
      });
      // Usar window.location para garantir um redirecionamento completo
      window.location.href = "/";
      return;
    }
    
    console.log("Usuário autenticado como admin, carregando dados do plano");
    // Se chegou aqui, o usuário está autenticado como admin
    // Chamar fetchPlanModules para garantir que os dados serão carregados
    if (planId && !isNaN(planId)) {
      fetchPlanModules();
    }
  }, [user, authLoading, toast, planId]);

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

  // Estado para armazenar os módulos obtidos manualmente
  const [planModules, setPlanModules] = useState<Module[]>([]);
  
  // Função para buscar manualmente os módulos do plano - versão simplificada
  async function fetchPlanModules() {
    if (isNaN(planId) || !user) {
      console.log("Não carregando módulos: ID plano inválido ou usuário não autenticado");
      return;
    }
    
    setLoadingPlanModules(true);
    setPlanModulesError(null);
    
    try {
      console.log(`Iniciando busca manual dos módulos do plano ${planId}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
      
      const response = await fetch(`/api/plans/${planId}/modules`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error("Erro 401: Não autenticado ao buscar módulos");
          throw new Error('Autenticação necessária. Faça login novamente.');
        } else if (response.status === 429) {
          console.error("Erro 429: Muitas requisições ao buscar módulos");
          throw new Error('Muitas requisições. Aguarde alguns minutos.');
        } else {
          console.error(`Erro ${response.status} ao buscar módulos: ${response.statusText}`);
          throw new Error(`Erro ao carregar dados: ${response.statusText}`);
        }
      }
      
      const modules = await response.json();
      console.log(`Módulos do plano ${planId} recebidos:`, modules.length);
      setPlanModules(modules);
      
      // Inicializar os módulos selecionados
      if (modules && modules.length > 0) {
        setSelectedModules(modules.map((m: Module) => m.id));
      }
    } catch (error) {
      console.error(`Erro ao buscar módulos do plano ${planId}:`, error);
      if (error instanceof DOMException && error.name === 'AbortError') {
        setPlanModulesError(new Error('Tempo limite excedido. A solicitação foi cancelada.'));
      } else {
        setPlanModulesError(error as Error);
      }
    } finally {
      setLoadingPlanModules(false);
    }
  }
  
  // Inicializar os módulos selecionados quando o plano for carregado
  useEffect(() => {
    if (plan?.modules) {
      setSelectedModules(plan.modules.map(m => m.id));
    }
    
    // Buscar os módulos do plano manualmente
    if (planId && !isNaN(planId) && user && user.role === 'admin') {
      fetchPlanModules();
    }
  }, [plan, planId, user]);

  // Mutation para salvar os módulos do plano
  const saveModulesMutation = useMutation({
    mutationFn: async (moduleIds: number[]) => {
      try {
        const response = await fetch(`/api/plans/${planId}/modules`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ moduleIds }),
        });
        
        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
          } else {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
        }
        
        return await response.json();
      } catch (error) {
        console.error('Erro ao salvar módulos:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Módulos do plano atualizados com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/plans/${planId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/plans/${planId}/modules`] });
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

  // Filtrar módulos baseado no termo de busca e tipo selecionado
  const getFilteredModules = () => {
    return allModules.filter((module) => {
      const matchesTerm =
        searchTerm === "" ||
        module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === "todos" || module.type === filterType;
      
      return matchesTerm && matchesType;
    });
  };

  // Verificar se um módulo é um dos módulos padrão
  const isStandardModule = (moduleType: string) => {
    return standardModuleTypes.includes(moduleType);
  };

  // Verificar se um módulo está selecionado
  const isModuleSelected = (moduleId: number) => {
    return selectedModules.includes(moduleId);
  };

  // Adicionar ou remover um módulo da seleção
  const toggleModule = (moduleId: number) => {
    // Buscar o módulo pelo ID para verificar o tipo
    const module = allModules.find(m => m.id === moduleId);
    
    // Se for um módulo padrão e já está selecionado, não permitir desmarcar
    if (module && isStandardModule(module.type) && isModuleSelected(moduleId)) {
      toast({
        title: "Módulo padrão",
        description: "Este módulo é padrão e não pode ser removido do plano.",
        variant: "default",
      });
      return;
    }
    
    setSelectedModules((prev) => {
      const isSelected = prev.includes(moduleId);
      const newSelection = isSelected
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId];
      
      setHasChanges(true);
      return newSelection;
    });
  };

  // Salvar as alterações
  const saveChanges = () => {
    saveModulesMutation.mutate(selectedModules);
  };

  // Cancelar as alterações e voltar para a página de planos
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

  const isLoading = planLoading || modulesLoading || loadingPlanModules;
  const error = planError || modulesError || planModulesError;

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
  
  // Se o usuário não estiver autenticado ou não for admin, mostrar mensagem clara de erro
  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="bg-destructive/15 border border-destructive text-destructive p-6 rounded-lg max-w-md w-full">
            <AlertCircle className="h-10 w-10 mb-4" />
            <h2 className="text-xl font-bold mb-2">Sessão expirada</h2>
            <p className="mb-4">Você precisa estar autenticado para acessar esta página.</p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => window.location.href = '/login'}>
                Fazer login
              </Button>
              <Button variant="destructive" onClick={() => window.location.href = '/'}>
                Voltar ao início
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Verificar se o usuário tem permissão de admin
  if (user.role !== 'admin') {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-6 rounded-lg max-w-md w-full">
            <Shield className="h-10 w-10 mb-4" />
            <h2 className="text-xl font-bold mb-2">Acesso restrito</h2>
            <p className="mb-4">Esta página está disponível apenas para administradores do sistema.</p>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Voltar ao início
            </Button>
          </div>
        </div>
      </Layout>
    );
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

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Configuração de Módulos</CardTitle>
            <CardDescription>
              Configure os módulos que estarão disponíveis neste plano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
              <div className="flex">
                <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-700 mb-1">Módulos Padrão (Obrigatórios)</h4>
                  <p className="text-blue-600 text-sm mb-2">
                    Os seguintes módulos são padrão e estarão presentes em todos os planos:
                  </p>
                  <ul className="list-disc pl-5 text-sm text-blue-600 space-y-1">
                    <li>Financeiro - Gerenciamento financeiro básico da organização</li>
                    <li>ComplyPay - Sistema de processamento de pagamentos</li>
                    <li>Vendas - Módulo básico de vendas online</li>
                    <li>Expedição - Gerenciamento de envio de produtos</li>
                    <li>Integrações - APIs e conectores para sistemas externos</li>
                    <li>Comunicação - Gestão de e-mails, notificações e arquivos</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
                        <TableRow 
                          key={module.id}
                          className={isStandardModule(module.type) ? "bg-blue-50/50" : ""}
                        >
                          <TableCell className="text-center">
                            <Checkbox
                              checked={isModuleSelected(module.id)}
                              onCheckedChange={() => toggleModule(module.id)}
                              disabled={isStandardModule(module.type)}
                            />
                          </TableCell>
                          <TableCell className="font-medium flex items-center gap-2">
                            <Package className={`h-4 w-4 ${isStandardModule(module.type) ? 'text-blue-500' : 'text-muted-foreground'}`} />
                            {module.name}
                            {module.status === 'inactive' && (
                              <Badge variant="outline" className="ml-2 text-amber-500 border-amber-500">
                                Inativo
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {module.type}
                              </Badge>
                              {isStandardModule(module.type) && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">
                                  Padrão
                                </Badge>
                              )}
                            </div>
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