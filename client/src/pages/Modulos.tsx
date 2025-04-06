import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Check, 
  X, 
  Plus, 
  PlusCircle, 
  Settings, 
  Box, 
  Zap, 
  Smartphone,
  FileSpreadsheet,
  BarChartBig,
  Users,
  CreditCard,
  Leaf, 
  Sprout,
  ClipboardList, 
  ShieldCheck,
  AlertCircle,
  BookOpen,
  Laptop, 
  MessageSquare,
  Loader2,
  Calendar,
  Mail
} from 'lucide-react';

// Definição do tipo de módulo
interface Module {
  id: number;
  name: string;
  description: string;
  type: string;
  icon_name: string;
  is_active: boolean;
  slug: string;
  created_at: string;
  updated_at: string | null;
}

// Definição do tipo de plano de módulo
interface ModulePlan {
  id: number;
  module_id: number;
  name: string;
  description: string;
  price: string;
  billing_cycle: string;
  features: string[];
  max_users: number;
  is_popular: boolean;
  is_active: boolean;
  created_at: string;
}

// Definição do tipo de módulo da organização
interface OrganizationModule {
  id: number;
  organizationId: number;
  moduleId: number;
  name: string;
  description: string;
  type: string;
  icon_name: string;
  status: 'active' | 'pending' | 'cancelled';
  active: boolean;
  startDate: string | null;
  expiryDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// Componente de ícone do módulo
const ModuleIcon = ({ iconName }: { iconName: string }) => {
  const icons: Record<string, React.ReactNode> = {
    'Box': <Box className="h-5 w-5" />,
    'Zap': <Zap className="h-5 w-5" />,
    'Smartphone': <Smartphone className="h-5 w-5" />,
    'FileSpreadsheet': <FileSpreadsheet className="h-5 w-5" />,
    'BarChartBig': <BarChartBig className="h-5 w-5" />,
    'Users': <Users className="h-5 w-5" />,
    'CreditCard': <CreditCard className="h-5 w-5" />,
    'Leaf': <Leaf className="h-5 w-5" />,
    'Sprout': <Sprout className="h-5 w-5" />,
    'ClipboardList': <ClipboardList className="h-5 w-5" />,
    'ShieldCheck': <ShieldCheck className="h-5 w-5" />,
    'AlertCircle': <AlertCircle className="h-5 w-5" />,
    'BookOpen': <BookOpen className="h-5 w-5" />,
    'Laptop': <Laptop className="h-5 w-5" />,
    'MessageSquare': <MessageSquare className="h-5 w-5" />,
    'Calendar': <Calendar className="h-5 w-5" />,
    'Mail': <Mail className="h-5 w-5" />,
  };

  return <div className="rounded-full bg-primary-100 p-2">{icons[iconName] || <Box className="h-5 w-5" />}</div>;
};

// Status do módulo com cor
const ModuleStatus = ({ status }: { status: 'active' | 'pending' | 'cancelled' }) => {
  const statusData = {
    active: { color: 'success', label: 'Ativo' },
    pending: { color: 'warning', label: 'Pendente' },
    cancelled: { color: 'destructive', label: 'Cancelado' }
  };

  const data = statusData[status];

  return (
    <Badge variant={data.color === 'success' ? 'default' : data.color === 'warning' ? 'outline' : 'destructive'}>
      {data.label}
    </Badge>
  );
};

// Componente principal
export default function Modulos() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  // Consulta para buscar todos os módulos
  const { 
    data: modules = [], 
    isLoading: modulesLoading,
    error: modulesError,
    refetch: refetchModules
  } = useQuery({
    queryKey: ['/api/modules'],
    queryFn: () => apiRequest<Module[]>('/api/modules'),
  });

  // Consulta para buscar todos os planos de módulos
  const { 
    data: modulePlans = [], 
    isLoading: plansLoading,
    error: plansError,
    refetch: refetchPlans
  } = useQuery({
    queryKey: ['/api/module-plans'],
    queryFn: () => apiRequest<ModulePlan[]>('/api/module-plans'),
  });

  // Consulta para buscar módulos da organização atual
  const { 
    data: organizationModules = [], 
    isLoading: orgModulesLoading,
    error: orgModulesError,
    refetch: refetchOrgModules
  } = useQuery({
    queryKey: ['/api/organization-modules/all'],
    queryFn: () => apiRequest<OrganizationModule[]>('/api/organization-modules/all'),
  });

  // Função para agrupar os planos de módulos por módulo
  const moduleIdToPlans = modulePlans.reduce((acc, plan) => {
    if (!acc[plan.module_id]) {
      acc[plan.module_id] = [];
    }
    acc[plan.module_id].push(plan);
    return acc;
  }, {} as Record<number, ModulePlan[]>);

  // Estado de carregamento
  const isLoading = modulesLoading || plansLoading || orgModulesLoading;

  // Função para solicitar um novo módulo
  const requestModule = async (moduleType: string) => {
    try {
      // Aqui deveria usar organizationId do usuário logado
      const response = await apiRequest('/api/organization-modules/request', {
        method: 'POST',
        data: {
          moduleType,
          organizationId: 1 // Exemplo - deveria vir do contexto de autenticação
        }
      });

      toast({
        title: "Solicitação enviada",
        description: "O módulo foi solicitado com sucesso e está aguardando aprovação",
      });

      // Atualizar a lista de módulos da organização
      refetchOrgModules();
    } catch (error: any) {
      toast({
        title: "Erro na solicitação",
        description: error.message || "Não foi possível solicitar o módulo",
        variant: "destructive"
      });
    }
  };

  // Renderização de esqueletos durante carregamento
  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="space-y-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-6 w-full max-w-md" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Renderização em caso de erro
  if (modulesError || plansError || orgModulesError) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader className="bg-destructive text-white">
            <CardTitle>Erro ao carregar módulos</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p>Ocorreu um erro ao carregar os dados dos módulos.</p>
            <p>Tente novamente mais tarde ou entre em contato com o suporte.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => {
              refetchModules();
              refetchPlans();
              refetchOrgModules();
            }}>
              Tentar novamente
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Módulos</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os módulos disponíveis no sistema e seus planos associados.
          </p>
        </div>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Novo Módulo
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todos os Módulos</TabsTrigger>
          <TabsTrigger value="active">Módulos Ativos</TabsTrigger>
          <TabsTrigger value="organization">Módulos da Organização</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        {/* Aba de todos os módulos */}
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map(module => (
              <Card key={module.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex items-center gap-2">
                    <ModuleIcon iconName={module.icon_name} />
                    <CardTitle className="text-lg">{module.name}</CardTitle>
                  </div>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Tipo:</span>
                      <span className="text-sm">{module.type}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge variant={module.is_active ? 'default' : 'destructive'}>
                        {module.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Planos:</span>
                      <span className="text-sm">{moduleIdToPlans[module.id]?.length || 0} planos</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/20 px-6 py-4">
                  <div className="flex justify-between w-full">
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedModule(module);
                      setIsDialogOpen(true);
                    }}>
                      Detalhes
                    </Button>
                    <Button variant={module.is_active ? "default" : "secondary"} size="sm">
                      {module.is_active ? 'Editar' : 'Ativar'}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Aba de módulos ativos */}
        <TabsContent value="active">
          <Table>
            <TableCaption>Lista de módulos ativos no sistema</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Planos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules
                .filter(module => module.is_active)
                .map(module => (
                  <TableRow key={module.id}>
                    <TableCell className="font-medium">{module.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ModuleIcon iconName={module.icon_name} />
                        <span>{module.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{module.type}</TableCell>
                    <TableCell className="text-right">{moduleIdToPlans[module.id]?.length || 0}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="mr-2">
                        <Settings className="h-4 w-4 mr-1" />
                        Configurar
                      </Button>
                      <Button variant="default" size="sm">
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Plano
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Aba de módulos da organização */}
        <TabsContent value="organization">
          {organizationModules.length > 0 ? (
            <Table>
              <TableCaption>Módulos associados à sua organização</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Ativação</TableHead>
                  <TableHead>Data de Expiração</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizationModules.map(orgModule => (
                  <TableRow key={orgModule.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ModuleIcon iconName={orgModule.icon_name} />
                        <span>{orgModule.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ModuleStatus status={orgModule.status} />
                    </TableCell>
                    <TableCell>
                      {orgModule.startDate ? 
                        new Date(orgModule.startDate).toLocaleDateString('pt-BR') : 
                        '-'}
                    </TableCell>
                    <TableCell>
                      {orgModule.expiryDate ? 
                        new Date(orgModule.expiryDate).toLocaleDateString('pt-BR') : 
                        '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant={orgModule.active ? "outline" : "default"} 
                        size="sm"
                        onClick={() => {
                          // Lógica para alternar o status de atividade do módulo
                        }}
                      >
                        {orgModule.active ? 'Desativar' : 'Ativar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Nenhum Módulo Associado</CardTitle>
                <CardDescription>
                  Sua organização ainda não possui módulos associados.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Os módulos fornecem funcionalidades adicionais para sua organização.
                  Solicite novos módulos para expandir os recursos disponíveis.
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Solicitar Módulo
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        {/* Aba de configurações */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Módulos</CardTitle>
              <CardDescription>
                Gerencie as configurações gerais de módulos e planos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <h3 className="text-lg font-semibold">Regras de Ativação</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure as regras para ativação automática de módulos.
                  </p>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <h3 className="text-lg font-semibold">Permissões de Módulos</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure quais tipos de usuários têm acesso a cada módulo.
                  </p>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <h3 className="text-lg font-semibold">Integração com Planos</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure quais módulos estão incluídos em cada plano do sistema.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="mr-2">
                Redefinir
              </Button>
              <Button>
                Salvar Alterações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo para solicitar/visualizar módulo */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedModule ? `Detalhes do Módulo: ${selectedModule.name}` : 'Solicitar Novo Módulo'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedModule ? 
                selectedModule.description : 
                'Escolha um módulo para adicionar à sua organização. Após a solicitação, o administrador do sistema precisará aprovar sua requisição.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {selectedModule ? (
            <div className="py-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium">Tipo</h4>
                    <p className="text-sm">{selectedModule.type}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Status</h4>
                    <Badge variant={selectedModule.is_active ? 'default' : 'destructive'}>
                      {selectedModule.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Criado em</h4>
                    <p className="text-sm">{new Date(selectedModule.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Última atualização</h4>
                    <p className="text-sm">
                      {selectedModule.updated_at ? 
                        new Date(selectedModule.updated_at).toLocaleDateString('pt-BR') : 
                        'Nunca'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Planos disponíveis</h4>
                  {moduleIdToPlans[selectedModule.id]?.length > 0 ? (
                    <div className="space-y-2">
                      {moduleIdToPlans[selectedModule.id].map(plan => (
                        <div key={plan.id} className="p-3 border rounded-md">
                          <div className="flex justify-between">
                            <h5 className="font-medium">{plan.name}</h5>
                            <p className="font-bold">R$ {plan.price}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                          <div className="mt-2">
                            <Button size="sm" variant={plan.is_popular ? 'default' : 'outline'} className="w-full">
                              {plan.is_popular ? 'Plano Recomendado' : 'Selecionar Plano'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Não há planos disponíveis para este módulo.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {modules.map(module => (
                  <div 
                    key={module.id} 
                    className="p-4 border rounded-md cursor-pointer hover:border-primary hover:bg-muted/20 transition-colors"
                    onClick={() => requestModule(module.type)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <ModuleIcon iconName={module.icon_name} />
                      <h3 className="font-medium">{module.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            {selectedModule && (
              <AlertDialogAction
                onClick={() => requestModule(selectedModule.type)}
              >
                Solicitar Módulo
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}