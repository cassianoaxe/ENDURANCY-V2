import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Search, PlusCircle, Building, Package, Tag, Check, X } from "lucide-react";
import { Organization, OrganizationModule } from "@shared/schema";

// Interface para os dados combinados que mostraremos na UI
interface OrganizationModuleView {
  id: number;
  organizationId: number;
  organizationName: string;
  moduleId: number;
  moduleName: string;
  moduleType: string;
  planId: number;
  planName: string;
  price: number;
  billingCycle: string;
  status: string;
  active: boolean;
  createdAt: string;
}

// Interfaces para os dados que recebemos das APIs
interface Module {
  id: number;
  name: string;
  description: string;
  icon_name: string;
  slug: string;
  is_active: boolean;
  type: string;
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

export default function OrganizationModules() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<string>("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newModule, setNewModule] = useState({
    organizationId: 0,
    moduleId: 0,
    planId: 0,
  });

  // Buscar todas as organizações
  const { data: organizations } = useQuery({
    queryKey: ['/api/organizations'],
  });

  // Buscar todos os módulos
  const { data: modules } = useQuery({
    queryKey: ['/api/modules'],
  });

  // Buscar todos os planos de módulos
  const { data: modulePlans } = useQuery({
    queryKey: ['/api/module-plans'],
  });

  // Buscar todas as associações de módulos com organizações
  const { data: organizationModules, isLoading } = useQuery({
    queryKey: ['/api/organization-modules/all'],
    queryFn: async () => {
      const response = await fetch('/api/organization-modules/all');
      if (!response.ok) throw new Error('Falha ao carregar módulos das organizações');
      return response.json();
    }
  });

  // Função para adicionar um módulo a uma organização
  const addModuleMutation = useMutation({
    mutationFn: async (data: { organizationId: number, moduleId: number, planId: number }) => {
      const response = await fetch('/api/organization-modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao adicionar módulo');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organization-modules/all'] });
      toast({
        title: 'Módulo adicionado',
        description: 'O módulo foi adicionado à organização com sucesso.',
      });
      setAddDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Função para remover um módulo de uma organização
  const removeModuleMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/organization-modules/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Falha ao remover módulo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organization-modules/all'] });
      toast({
        title: 'Módulo removido',
        description: 'O módulo foi removido da organização com sucesso.',
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

  // Função para ativar/desativar um módulo
  const toggleModuleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number, active: boolean }) => {
      const response = await fetch(`/api/organization-modules/${id}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active })
      });
      
      if (!response.ok) throw new Error('Falha ao atualizar status do módulo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organization-modules/all'] });
      toast({
        title: 'Status atualizado',
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

  // Reset form após submissão
  const resetForm = () => {
    setNewModule({
      organizationId: 0,
      moduleId: 0,
      planId: 0,
    });
  };

  // Filtrar planos pelo módulo selecionado
  const filteredPlans = modulePlans?.filter(plan => plan.module_id === newModule.moduleId) || [];

  // Filtrar módulos e organizações com base na busca
  const filteredOrganizationModules = organizationModules?.filter(orgModule => {
    const matchesSearch = 
      orgModule.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orgModule.moduleName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOrgFilter = selectedOrg === "all" || orgModule.organizationId.toString() === selectedOrg;
    
    return matchesSearch && matchesOrgFilter;
  });

  // Submissão do formulário de adição de módulo
  const handleAddModule = () => {
    if (!newModule.organizationId || !newModule.moduleId || !newModule.planId) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    addModuleMutation.mutate(newModule);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Módulos por Organização</h1>
            <p className="text-muted-foreground mt-1">Gerencie os módulos contratados pelas organizações</p>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Módulo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Módulo a uma Organização</DialogTitle>
                <DialogDescription>
                  Atribua um módulo e plano específico a uma organização.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Organização</label>
                  <Select 
                    value={newModule.organizationId.toString()} 
                    onValueChange={(value) => setNewModule({...newModule, organizationId: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma organização" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations?.filter(org => org.status === 'active')
                        .map((org) => (
                          <SelectItem key={org.id} value={org.id.toString()}>
                            {org.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Módulo</label>
                  <Select 
                    value={newModule.moduleId.toString()} 
                    onValueChange={(value) => setNewModule({...newModule, moduleId: parseInt(value), planId: 0})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um módulo" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules?.filter(mod => mod.is_active)
                        .map((mod) => (
                          <SelectItem key={mod.id} value={mod.id.toString()}>
                            {mod.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Plano</label>
                  <Select 
                    value={newModule.planId.toString()} 
                    onValueChange={(value) => setNewModule({...newModule, planId: parseInt(value)})}
                    disabled={!newModule.moduleId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={!newModule.moduleId ? "Selecione um módulo primeiro" : "Selecione um plano"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredPlans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          {plan.name} - R$ {Number(plan.price).toFixed(2)}/{plan.billing_cycle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleAddModule} disabled={addModuleMutation.isPending}>
                  {addModuleMutation.isPending ? "Adicionando..." : "Adicionar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Buscar por organização ou módulo..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedOrg} onValueChange={setSelectedOrg}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Filtrar por organização" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as organizações</SelectItem>
              {organizations?.map((org) => (
                <SelectItem key={org.id} value={org.id.toString()}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrganizationModules?.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum módulo encontrado</h3>
                  <p className="text-muted-foreground text-center mb-6 max-w-md">
                    Não existem módulos atribuídos a organizações que correspondam aos filtros atuais. Tente mudar os critérios de busca ou adicione um novo módulo.
                  </p>
                  <Button onClick={() => setAddDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Módulo
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredOrganizationModules?.map((orgModule) => (
                  <Card key={orgModule.id} className={`border-l-4 ${orgModule.active ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <Building className="h-5 w-5 text-muted-foreground" />
                            <CardTitle className="text-lg">{orgModule.organizationName}</CardTitle>
                          </div>
                          <CardDescription>Organização ID: {orgModule.organizationId}</CardDescription>
                        </div>
                        <div>
                          {orgModule.active ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Check className="mr-1 h-3 w-3" /> Ativo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                              <X className="mr-1 h-3 w-3" /> Inativo
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="text-sm font-semibold mb-1 flex items-center gap-1">
                            <Package className="h-4 w-4 text-primary" /> Módulo
                          </h4>
                          <p>{orgModule.moduleName}</p>
                          <p className="text-xs text-muted-foreground mt-1">Tipo: {orgModule.moduleType}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold mb-1 flex items-center gap-1">
                            <Tag className="h-4 w-4 text-primary" /> Plano
                          </h4>
                          <p>{orgModule.planName}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            R$ {Number(orgModule.price).toFixed(2)}/{orgModule.billingCycle}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold mb-1">Data de Contratação</h4>
                          <p>{new Date(orgModule.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => toggleModuleActiveMutation.mutate({ id: orgModule.id, active: !orgModule.active })}
                        disabled={toggleModuleActiveMutation.isPending}
                      >
                        {orgModule.active ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          if (confirm('Tem certeza que deseja remover este módulo da organização?')) {
                            removeModuleMutation.mutate(orgModule.id);
                          }
                        }}
                        disabled={removeModuleMutation.isPending}
                      >
                        Remover
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}