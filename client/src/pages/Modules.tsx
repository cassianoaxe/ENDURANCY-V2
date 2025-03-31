import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, Leaf, LineChart, Heart, Briefcase, Scale, Eye, Brain,
  Edit, Save, X 
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Definição dos tipos
interface Module {
  id: number;
  name: string;
  description: string;
  icon_name: string;
  slug: string;
  is_active: boolean;
  type: string;
  status: string; // 'active', 'test', 'development'
  created_at: string;
  updated_at: string;
}

interface ModulePlan {
  id: number;
  module_id: number;
  name: string;
  description: string;
  price: number;
  billing_cycle: string;
  features: string[];
  max_users: number;
  is_popular: boolean;
  is_active: boolean;
  created_at: string;
}

// Helper para renderizar o ícone correto com base no nome do ícone
const getModuleIcon = (iconName: string, className: string = "h-5 w-5") => {
  switch (iconName) {
    case 'ShoppingCart': return <ShoppingCart className={className} />;
    case 'Leaf': return <Leaf className={className} />;
    case 'LineChart': return <LineChart className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'Briefcase': return <Briefcase className={className} />;
    case 'Scale': return <Scale className={className} />;
    case 'Eye': return <Eye className={className} />;
    case 'Brain': return <Brain className={className} />;
    default: return <ShoppingCart className={className} />;
  }
};

export default function Modules() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('todos');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    icon_name: '',
    type: '',
    status: ''
  });
  const [newModuleData, setNewModuleData] = useState({
    name: '',
    description: '',
    icon_name: 'Layers',
    type: 'core',
    status: 'active',
    is_active: true
  });

  // Consulta para buscar todos os módulos
  const { data: modules = [], isLoading: isLoadingModules } = useQuery<Module[]>({
    queryKey: ['/api/modules'],
    queryFn: async () => {
      const response = await fetch('/api/modules');
      if (!response.ok) throw new Error('Falha ao carregar módulos');
      return response.json();
    }
  });

  // Consulta para buscar todos os planos de módulos
  const { data: modulePlans = [], isLoading: isLoadingPlans } = useQuery<ModulePlan[]>({
    queryKey: ['/api/module-plans'],
    queryFn: async () => {
      const response = await fetch('/api/module-plans');
      if (!response.ok) throw new Error('Falha ao carregar planos');
      return response.json();
    }
  });

  // Mutação para atualizar o status de um módulo (ativo/inativo)
  const updateModuleStatusMutation = useMutation({
    mutationFn: async ({ moduleId, isActive }: { moduleId: number, isActive: boolean }) => {
      const response = await fetch(`/api/modules/${moduleId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });
      
      if (!response.ok) throw new Error('Falha ao atualizar status do módulo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/modules'] });
      toast({
        title: 'Módulo atualizado',
        description: 'O status do módulo foi atualizado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Mutação para editar um módulo
  const editModuleMutation = useMutation({
    mutationFn: async (moduleData: {id: number, data: any}) => {
      const response = await fetch(`/api/modules/${moduleData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moduleData.data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao editar módulo');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/modules'] });
      setIsEditDialogOpen(false);
      toast({
        title: 'Módulo atualizado',
        description: 'O módulo foi atualizado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Mutação para adicionar um novo módulo
  const addModuleMutation = useMutation({
    mutationFn: async (moduleData: any) => {
      const response = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moduleData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao criar módulo');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/modules'] });
      setIsAddDialogOpen(false);
      setNewModuleData({
        name: '',
        description: '',
        icon_name: 'Layers',
        type: 'core',
        status: 'active',
        is_active: true
      });
      toast({
        title: 'Módulo adicionado',
        description: 'O novo módulo foi criado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Mutação para excluir um módulo
  const deleteModuleMutation = useMutation({
    mutationFn: async (moduleId: number) => {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao excluir módulo');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/modules'] });
      setIsDeleteDialogOpen(false);
      setSelectedModule(null);
      toast({
        title: 'Módulo excluído',
        description: 'O módulo foi excluído com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Filtrar módulos com base na tab ativa
  // Status do módulo - usando a coluna 'status' para filtrar
  const filteredModules = modules.filter(module => {
    if (activeTab === 'todos') return true;
    if (activeTab === 'ativos') return module.is_active && module.status === 'active';
    if (activeTab === 'inativos') return !module.is_active;
    if (activeTab === 'em_teste') return module.is_active && module.status === 'test';
    if (activeTab === 'em_desenvolvimento') return module.is_active && module.status === 'development';
    return true;
  });

  // Agrupar planos por módulo
  const getPlansByModuleId = (moduleId: number) => {
    return modulePlans.filter(plan => plan.module_id === moduleId);
  };

  // Determinar plano popular para um módulo
  const getPopularPlan = (moduleId: number) => {
    return modulePlans.find(plan => plan.module_id === moduleId && plan.is_popular);
  };
  
  // Função para abrir o diálogo de edição
  const openEditDialog = (module: Module) => {
    setSelectedModule(module);
    setEditFormData({
      name: module.name,
      description: module.description,
      icon_name: module.icon_name,
      type: module.type,
      status: module.status
    });
    setIsEditDialogOpen(true);
  };
  
  // Função para abrir o diálogo de exclusão
  const openDeleteDialog = (module: Module) => {
    setSelectedModule(module);
    setIsDeleteDialogOpen(true);
  };
  
  // Função para abrir o diálogo de detalhes
  const openDetailsDialog = (module: Module) => {
    setSelectedModule(module);
    setIsDetailsDialogOpen(true);
  };

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Gerenciamento de Módulos</h1>
        <p className="text-gray-600 mb-6">Gerencie os módulos e funcionalidades disponíveis na plataforma.</p>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <CardTitle>Módulos Disponíveis</CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      window.history.pushState({}, '', '/modules-table');
                      window.dispatchEvent(new Event('popstate'));
                    }}
                  >
                    Ver em tabela
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <span className="hidden sm:inline mr-2">Adicionar</span> Módulo
                  </Button>
                </div>
              </div>
              
              <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="hidden sm:grid grid-cols-5 w-full">
                  <TabsTrigger value="todos">Todos</TabsTrigger>
                  <TabsTrigger value="ativos">Ativos</TabsTrigger>
                  <TabsTrigger value="inativos">Inativos</TabsTrigger>
                  <TabsTrigger value="em_teste">Em teste</TabsTrigger>
                  <TabsTrigger value="em_desenvolvimento">Em desenvolvimento</TabsTrigger>
                </TabsList>
                
                <TabsList className="grid sm:hidden grid-cols-2 gap-1 w-full mb-2">
                  <TabsTrigger value="todos">Todos</TabsTrigger>
                  <TabsTrigger value="ativos">Ativos</TabsTrigger>
                </TabsList>
                <TabsList className="grid sm:hidden grid-cols-3 gap-1 w-full">
                  <TabsTrigger value="inativos">Inativos</TabsTrigger>
                  <TabsTrigger value="em_teste">Em teste</TabsTrigger>
                  <TabsTrigger value="em_desenvolvimento">Em desenv.</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoadingModules || isLoadingPlans ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredModules.map((module) => {
                  const plans = getPlansByModuleId(module.id);
                  const popularPlan = getPopularPlan(module.id);
                  
                  // Definir cor de borda baseada no status do módulo
                  const getBorderColor = () => {
                    if (!module.is_active) return 'border-t-gray-300';
                    if (module.status === 'test') return 'border-t-amber-500';
                    if (module.status === 'development') return 'border-t-blue-500';
                    return 'border-t-green-500';
                  };
                  
                  return (
                    <Card key={module.id} className={`overflow-hidden border-t-4 ${getBorderColor()}`}>
                      <CardHeader className="relative pb-2">
                        <div className="absolute right-4 top-4">
                          <Switch 
                            id={`module-status-${module.id}`}
                            checked={module.is_active} 
                            onCheckedChange={(isActive) => updateModuleStatusMutation.mutate({ moduleId: module.id, isActive })}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          {getModuleIcon(module.icon_name, "h-6 w-6 text-primary")}
                          <CardTitle>{module.name}</CardTitle>
                        </div>
                        
                        {/* Status badge */}
                        {module.is_active && module.status === 'test' && (
                          <Badge variant="outline" className="absolute right-16 top-4 border-amber-500 text-amber-700">
                            Em teste
                          </Badge>
                        )}
                        {module.is_active && module.status === 'development' && (
                          <Badge variant="outline" className="absolute right-16 top-4 border-blue-500 text-blue-700">
                            Em desenvolvimento
                          </Badge>
                        )}
                        
                        <CardDescription className="mt-2">{module.description}</CardDescription>
                      </CardHeader>
                      
                      <Separator />
                      
                      <CardContent className="pt-4">
                        <h3 className="font-semibold text-sm mb-3">Planos disponíveis:</h3>
                        <div className="space-y-3">
                          {plans.map((plan) => (
                            <div key={plan.id} className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{plan.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {plan.max_users} usuários
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">R$ {Number(plan.price).toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">/{plan.billing_cycle}</p>
                              </div>
                              {plan.is_popular && (
                                <Badge className="absolute -right-1 -top-1 bg-primary text-white px-2 py-0.5 rounded-bl text-xs transform rotate-45">
                                  Popular
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      
                      <CardFooter className="flex justify-between">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openDetailsDialog(module)}
                          >
                            Detalhes
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditDialog(module)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openDeleteDialog(module)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
            
            {filteredModules.length === 0 && !isLoadingModules && (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-lg text-muted-foreground">Nenhum módulo encontrado nesta categoria.</p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Diálogo de Edição de Módulo */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Módulo</DialogTitle>
            <DialogDescription>
              Edite as informações do módulo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="module-name">Nome</Label>
              <Input 
                id="module-name" 
                value={editFormData.name} 
                onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="module-description">Descrição</Label>
              <Textarea 
                id="module-description" 
                value={editFormData.description} 
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="module-icon">Ícone</Label>
              <Select 
                value={editFormData.icon_name}
                onValueChange={(value) => setEditFormData({...editFormData, icon_name: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um ícone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ShoppingCart">Carrinho de Compras</SelectItem>
                  <SelectItem value="Leaf">Folha</SelectItem>
                  <SelectItem value="LineChart">Gráfico</SelectItem>
                  <SelectItem value="Heart">Coração</SelectItem>
                  <SelectItem value="Briefcase">Maleta</SelectItem>
                  <SelectItem value="Scale">Balança</SelectItem>
                  <SelectItem value="Eye">Olho</SelectItem>
                  <SelectItem value="Brain">Cérebro</SelectItem>
                  <SelectItem value="Layers">Camadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="module-type">Tipo</Label>
              <Select 
                value={editFormData.type}
                onValueChange={(value) => setEditFormData({...editFormData, type: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="core">Principal</SelectItem>
                  <SelectItem value="adicional">Adicional</SelectItem>
                  <SelectItem value="integracao">Integração</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="module-status">Status</Label>
              <Select 
                value={editFormData.status}
                onValueChange={(value) => setEditFormData({...editFormData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="test">Em teste</SelectItem>
                  <SelectItem value="development">Em desenvolvimento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                if (selectedModule) {
                  editModuleMutation.mutate({
                    id: selectedModule.id,
                    data: editFormData
                  });
                }
              }}
              disabled={editModuleMutation.isPending || !editFormData.name}
            >
              {editModuleMutation.isPending ? 
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"/>
                  Salvando...
                </div> 
                : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de Adição de Módulo */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Módulo</DialogTitle>
            <DialogDescription>
              Digite as informações do novo módulo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-module-name">Nome</Label>
              <Input 
                id="new-module-name" 
                value={newModuleData.name} 
                onChange={(e) => setNewModuleData({...newModuleData, name: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="new-module-description">Descrição</Label>
              <Textarea 
                id="new-module-description" 
                value={newModuleData.description} 
                onChange={(e) => setNewModuleData({...newModuleData, description: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="new-module-icon">Ícone</Label>
              <Select 
                value={newModuleData.icon_name}
                onValueChange={(value) => setNewModuleData({...newModuleData, icon_name: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um ícone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ShoppingCart">Carrinho de Compras</SelectItem>
                  <SelectItem value="Leaf">Folha</SelectItem>
                  <SelectItem value="LineChart">Gráfico</SelectItem>
                  <SelectItem value="Heart">Coração</SelectItem>
                  <SelectItem value="Briefcase">Maleta</SelectItem>
                  <SelectItem value="Scale">Balança</SelectItem>
                  <SelectItem value="Eye">Olho</SelectItem>
                  <SelectItem value="Brain">Cérebro</SelectItem>
                  <SelectItem value="Layers">Camadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="new-module-type">Tipo</Label>
              <Select 
                value={newModuleData.type}
                onValueChange={(value) => setNewModuleData({...newModuleData, type: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="core">Principal</SelectItem>
                  <SelectItem value="adicional">Adicional</SelectItem>
                  <SelectItem value="integracao">Integração</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="new-module-status">Status</Label>
              <Select 
                value={newModuleData.status}
                onValueChange={(value) => setNewModuleData({...newModuleData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="test">Em teste</SelectItem>
                  <SelectItem value="development">Em desenvolvimento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch 
                id="new-module-active"
                checked={newModuleData.is_active}
                onCheckedChange={(checked) => setNewModuleData({...newModuleData, is_active: checked})}
              />
              <Label htmlFor="new-module-active">Módulo ativo</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => addModuleMutation.mutate(newModuleData)}
              disabled={addModuleMutation.isPending || !newModuleData.name}
            >
              {addModuleMutation.isPending ? 
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"/>
                  Adicionando...
                </div> 
                : 'Adicionar Módulo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de Exclusão de Módulo */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja excluir este módulo? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {selectedModule && (
            <div className="py-4">
              <div className="flex items-center gap-2 mb-2">
                {getModuleIcon(selectedModule.icon_name, "h-5 w-5 text-primary")}
                <span className="font-semibold">{selectedModule.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">{selectedModule.description}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (selectedModule) {
                  deleteModuleMutation.mutate(selectedModule.id);
                }
              }}
              disabled={deleteModuleMutation.isPending}
            >
              {deleteModuleMutation.isPending ? 
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"/>
                  Excluindo...
                </div> 
                : 'Excluir Módulo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de Detalhes do Módulo */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Módulo</DialogTitle>
          </DialogHeader>
          
          {selectedModule && (
            <div className="py-4">
              <div className="flex items-center gap-2 mb-4">
                {getModuleIcon(selectedModule.icon_name, "h-8 w-8 text-primary")}
                <div>
                  <h3 className="text-xl font-bold">{selectedModule.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedModule.is_active ? 
                      (selectedModule.status === 'active' ? 'Ativo' : 
                       selectedModule.status === 'test' ? 'Em teste' : 'Em desenvolvimento') : 
                      'Inativo'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Descrição</h4>
                  <p className="mt-1">{selectedModule.description || 'Sem descrição'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Slug</h4>
                  <p className="mt-1 font-mono text-sm bg-muted p-1 rounded">{selectedModule.slug}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Tipo</h4>
                  <p className="mt-1">
                    {selectedModule.type === 'core' ? 'Principal' : 
                     selectedModule.type === 'adicional' ? 'Adicional' : 'Integração'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Criado em</h4>
                    <p className="mt-1 text-sm">
                      {new Date(selectedModule.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Atualizado em</h4>
                    <p className="mt-1 text-sm">
                      {new Date(selectedModule.updated_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Planos Disponíveis</h4>
                  <div className="mt-2 space-y-2">
                    {getPlansByModuleId(selectedModule.id).length > 0 ? (
                      getPlansByModuleId(selectedModule.id).map(plan => (
                        <div key={plan.id} className="flex justify-between p-2 bg-muted rounded">
                          <div>
                            <p className="font-medium">{plan.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Até {plan.max_users} usuários
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">R$ {Number(plan.price).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">/{plan.billing_cycle}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhum plano disponível</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsDetailsDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}