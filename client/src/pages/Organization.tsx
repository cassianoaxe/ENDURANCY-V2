import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Loader2, Upload, User, Building, Mail, Phone, Globe, MapPin, 
  CreditCard, Tag, Package, Users, Check, AlertTriangle, 
  Calendar, Puzzle, PlusCircle, UserPlus, Star, ArrowRight,
  X, SendHorizonal, Shield, ChevronLeft, Power, Ban, PenLine
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Organization, Plan, Module, ModulePlan, OrganizationModule } from "@shared/schema";

export default function OrganizationDetail() {
  // Navigation function to replace wouter
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("informacoes");
  const [orgId, setOrgId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  
  // Estados para os diálogos
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isAddModuleDialogOpen, setIsAddModuleDialogOpen] = useState(false);
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);
  
  // Estados para formulários
  const [suspendReason, setSuspendReason] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [selectedModulePlan, setSelectedModulePlan] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    legalName: '',
    cnpj: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    website: '',
    description: '',
  });
  
  // Extrair o ID da organização da URL
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/organizations\/(\d+)/);
    if (match && match[1]) {
      setOrgId(Number(match[1]));
    } else {
      // Redirecionar para a lista de organizações se não houver ID válido
      navigate('/organizations');
    }
  }, []);

  // Buscar detalhes da organização
  const { 
    data: organization, 
    isLoading: isOrgLoading, 
    error: orgError 
  } = useQuery<Organization>({
    queryKey: ['/api/organizations-direct', orgId],
    queryFn: async () => {
      if (!orgId) throw new Error("ID da organização não disponível");
      // Usar a nova rota direta que não requer autenticação e sempre retorna os dados mockados
      const response = await fetch(`/api/organizations-direct/${orgId}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar organização: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!orgId,
  });

  // Buscar planos disponíveis
  const { data: plans = [] } = useQuery<Plan[]>({
    queryKey: ['/api/plans'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/plans");
      return response.json();
    },
  });

  // Buscar módulos disponíveis
  const { data: modules = [] } = useQuery<Module[]>({
    queryKey: ['/api/modules'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/modules");
      return response.json();
    },
  });

  // Buscar planos de módulos
  const { data: modulePlans = [] } = useQuery<ModulePlan[]>({
    queryKey: ['/api/module-plans'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/module-plans");
      return response.json();
    },
  });

  // Buscar módulos ativos da organização
  const { 
    data: orgModules = [], 
    isLoading: isOrgModulesLoading 
  } = useQuery<OrganizationModule[]>({
    queryKey: ['/api/organization-modules', orgId],
    queryFn: async () => {
      if (!orgId) throw new Error("ID da organização não disponível");
      const response = await apiRequest("GET", `/api/organization-modules/${orgId}`);
      return response.json();
    },
    enabled: !!orgId,
  });

  // Atualizar formulário quando os dados da organização estiverem disponíveis
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        legalName: organization.legalName || '',
        cnpj: organization.cnpj || '',
        email: organization.email || '',
        phoneNumber: organization.phoneNumber || '',
        address: organization.address || '',
        city: organization.city || '',
        state: organization.state || '',
        zipCode: organization.zipCode || '',
        website: organization.website || '',
        description: organization.description || '',
      });
    }
  }, [organization]);

  // Mutation para editar os dados da organização
  const updateOrgMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!orgId) throw new Error("ID da organização não disponível");
      const response = await apiRequest("PUT", `/api/organizations/${orgId}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Organização atualizada",
        description: "Dados da organização foram atualizados com sucesso",
      });
      setIsEditDialogOpen(false);
      // Recarregar dados
      queryClient.invalidateQueries({ queryKey: ['/api/organizations-direct', orgId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Falha ao atualizar organização: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Mutation para upload de logo
  const uploadLogoMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!orgId) throw new Error("ID da organização não disponível");
      
      const response = await fetch(`/api/organizations/${orgId}/logo`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao fazer upload da logo');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Logo atualizada",
        description: "Logo da organização foi atualizada com sucesso",
      });
      setIsLogoDialogOpen(false);
      setLogoFile(null);
      setIsUploadingLogo(false);
      // Recarregar dados
      queryClient.invalidateQueries({ queryKey: ['/api/organizations-direct', orgId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Falha ao atualizar logo: ${error.message}`,
        variant: "destructive"
      });
      setIsUploadingLogo(false);
    }
  });

  // Mutation para suspender/reativar organização
  const toggleOrgStatusMutation = useMutation({
    mutationFn: async ({ status, reason }: { status: string, reason?: string }) => {
      if (!orgId) throw new Error("ID da organização não disponível");
      const response = await apiRequest('PUT', `/api/organizations/${orgId}/status`, { status, reason });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status atualizado",
        description: organization?.status === "active" 
          ? "Organização suspensa com sucesso" 
          : "Organização reativada com sucesso",
      });
      setIsSuspendDialogOpen(false);
      setSuspendReason('');
      // Recarregar dados
      queryClient.invalidateQueries({ queryKey: ['/api/organizations-direct', orgId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Falha ao atualizar status: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Mutation para enviar email de boas-vindas
  const sendWelcomeEmailMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!orgId) throw new Error("ID da organização não disponível");
      const response = await apiRequest('POST', `/api/organizations/${orgId}/send-welcome-email`, { message });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email enviado",
        description: "Email de boas-vindas enviado com sucesso",
      });
      setIsEmailDialogOpen(false);
      setEmailMessage('');
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Falha ao enviar email: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Mutation para adicionar módulo
  const addModuleMutation = useMutation({
    mutationFn: async ({ moduleId, modulePlanId }: { moduleId: number, modulePlanId: number | null }) => {
      if (!orgId) throw new Error("ID da organização não disponível");
      const response = await apiRequest("POST", "/api/organization-modules", {
        organizationId: orgId,
        moduleId,
        modulePlanId
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Módulo adicionado",
        description: "Módulo adicionado com sucesso à organização",
      });
      setIsAddModuleDialogOpen(false);
      setSelectedModule(null);
      setSelectedModulePlan(null);
      // Recarregar módulos
      queryClient.invalidateQueries({ queryKey: ['/api/organization-modules', orgId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Falha ao adicionar módulo: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Função para obter o nome do plano
  const getPlanName = (planId?: number | null) => {
    if (!planId) return "Sem plano";
    const plan = plans.find(p => p.id === planId);
    return plan ? plan.name : "Plano desconhecido";
  };

  // Função para formatar data
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  // Função para obter nome do módulo
  const getModuleName = (moduleId: number) => {
    const module = modules.find(m => m.id === moduleId);
    return module ? module.name : "Módulo desconhecido";
  };

  // Função para obter nome do plano do módulo
  const getModulePlanName = (planId: number | null) => {
    if (!planId) return "Plano básico";
    const plan = modulePlans.find(p => p.id === planId);
    return plan ? plan.name : "Plano desconhecido";
  };

  // Handler para mudança nos campos do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handler para submissão do formulário de edição
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrgMutation.mutate(formData);
  };

  // Handler para suspensão/reativação
  const handleToggleStatus = () => {
    const newStatus = organization?.status === "active" ? "suspended" : "active";
    const data: { status: string, reason?: string } = { status: newStatus };
    
    if (newStatus === "suspended" && suspendReason) {
      data.reason = suspendReason;
    }
    
    toggleOrgStatusMutation.mutate(data);
  };

  // Handler para envio de email
  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    sendWelcomeEmailMutation.mutate(emailMessage);
  };
  
  // Handler para upload de logo
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validar tipo de arquivo
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif'];
    if (!acceptedTypes.includes(file.type)) {
      toast({
        title: "Formato de arquivo inválido",
        description: "Por favor, selecione uma imagem nos formatos JPG, PNG, SVG ou GIF.",
        variant: "destructive"
      });
      return;
    }
    
    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 5MB.",
        variant: "destructive"
      });
      return;
    }
    
    setLogoFile(file);
  };
  
  const handleLogoUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoFile) {
      toast({
        title: "Selecione um arquivo",
        description: "Por favor, selecione uma imagem para fazer o upload",
        variant: "destructive",
      });
      return;
    }
    
    // Criar FormData para o upload
    const formData = new FormData();
    formData.append('logo', logoFile);
    
    setIsUploadingLogo(true);
    uploadLogoMutation.mutate(formData);
  };

  // Handler para adicionar módulo
  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule) {
      toast({
        title: "Selecione um módulo",
        description: "Por favor, selecione um módulo para continuar",
        variant: "destructive",
      });
      return;
    }
    
    addModuleMutation.mutate({ 
      moduleId: selectedModule, 
      modulePlanId: selectedModulePlan 
    });
  };

  // Filtragem de módulos ainda não adicionados
  const availableModules = modules.filter(module => 
    !orgModules.some(om => om.moduleId === module.id)
  );

  // Filtragem de planos para o módulo selecionado
  const availableModulePlans = selectedModule 
    ? modulePlans.filter(plan => plan.module_id === selectedModule)
    : [];

  if (isOrgLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (orgError || !organization) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Erro ao carregar organização</h2>
        <p className="text-muted-foreground mb-4">
          {orgError instanceof Error ? orgError.message : "Ocorreu um erro ao carregar os dados da organização"}
        </p>
        <Button onClick={() => navigate('/organizations')}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Voltar para lista
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Cabeçalho com ações */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/organizations')}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" /> Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{organization.name}</h1>
            <p className="text-muted-foreground">
              ID: {organization.id} • Criada em: {formatDate(organization.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsEmailDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" /> Enviar Email
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsEditDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <PenLine className="h-4 w-4" /> Editar
          </Button>
          <Button 
            variant={organization.status === "active" ? "destructive" : "default"}
            onClick={() => setIsSuspendDialogOpen(true)}
            className="flex items-center gap-2"
          >
            {organization.status === "active" 
              ? <><Ban className="h-4 w-4" /> Suspender</> 
              : <><Power className="h-4 w-4" /> Reativar</>}
          </Button>
        </div>
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-2">
        <Badge 
          variant={organization.status === "active" ? "success" : "destructive"}
          className="text-xs py-0 px-2"
        >
          {organization.status === "active" ? "Ativa" : "Suspensa"}
        </Badge>
        <p className="text-sm text-muted-foreground">
          Plano atual: <span className="font-medium text-primary">{getPlanName(organization.planId)}</span>
        </p>
      </div>

      {/* Tabs de conteúdo */}
      <Tabs defaultValue="informacoes" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 md:w-[600px]">
          <TabsTrigger value="informacoes">Informações</TabsTrigger>
          <TabsTrigger value="modulos">Módulos</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
        </TabsList>

        {/* Tab de Informações */}
        <TabsContent value="informacoes" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card de Logo da Organização */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Logo da Organização
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="flex flex-col items-center">
                  <Avatar className="h-32 w-32 rounded-md border">
                    <AvatarImage 
                      src={organization.logo ? `/uploads/logos/${organization.logo}` : ''} 
                      alt={organization.name} 
                    />
                    <AvatarFallback className="text-2xl bg-muted rounded-md">
                      {organization.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setIsLogoDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" /> Alterar Logo
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Dados Gerais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Nome</Label>
                    <p className="text-base font-medium">{organization.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Razão Social</Label>
                    <p className="text-base font-medium">{organization.legalName || "Não informada"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">CNPJ</Label>
                    <p className="text-base font-medium">{organization.cnpj || "Não informado"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Data de Criação</Label>
                    <p className="text-base font-medium">{formatDate(organization.createdAt)}</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <Label className="text-muted-foreground">Descrição</Label>
                  <p className="text-base">{organization.description || "Sem descrição"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="text-base font-medium">{organization.email || "Não informado"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Telefone</Label>
                    <p className="text-base font-medium">{organization.phoneNumber || "Não informado"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Website</Label>
                    <p className="text-base font-medium">
                      {organization.website ? (
                        <a 
                          href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          {organization.website} <Globe className="h-3 w-3" />
                        </a>
                      ) : (
                        "Não informado"
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-base font-medium">{organization.address || "Endereço não informado"}</p>
                  {(organization.city || organization.state) && (
                    <p className="text-base">
                      {organization.city || ""}{organization.city && organization.state ? ', ' : ''}
                      {organization.state || ""}
                      {organization.zipCode && ` - CEP: ${organization.zipCode}`}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Acesso da Organização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Link de Login</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      readOnly 
                      value={`${window.location.origin}/login/${organization.id}`} 
                      className="bg-muted"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab de Módulos */}
        <TabsContent value="modulos" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Módulos da Organização</h2>
            <Button 
              onClick={() => setIsAddModuleDialogOpen(true)}
              disabled={availableModules.length === 0}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" /> Adicionar Módulo
            </Button>
          </div>

          {isOrgModulesLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orgModules.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Puzzle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Nenhum módulo ativado</p>
                <p className="text-muted-foreground text-center max-w-md mt-2">
                  Esta organização ainda não possui módulos ativos. 
                  Adicione módulos para expandir as funcionalidades disponíveis.
                </p>
                <Button 
                  onClick={() => setIsAddModuleDialogOpen(true)} 
                  className="mt-4"
                  disabled={availableModules.length === 0}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Adicionar Módulo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orgModules.map((orgModule) => {
                const module = modules.find(m => m.id === orgModule.moduleId);
                const plan = orgModule.modulePlanId 
                  ? modulePlans.find(p => p.id === orgModule.modulePlanId) 
                  : null;
                
                return (
                  <Card key={orgModule.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getModuleName(orgModule.moduleId)}
                        </CardTitle>
                        <Badge variant={orgModule.status === "active" ? "success" : "default"} className="text-xs">
                          {orgModule.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <CardDescription>
                        Plano: {getModulePlanName(orgModule.modulePlanId)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" /> 
                        <span>Ativado em: {formatDate(orgModule.startDate)}</span>
                      </div>
                      {orgModule.endDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" /> 
                          <span>Expira em: {formatDate(orgModule.endDate)}</span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="border-t pt-4 flex justify-between">
                      <Button variant="link" size="sm" className="px-0">
                        Gerenciar plano
                      </Button>
                      <Switch
                        checked={orgModule.status === "active"}
                        // Implementar toggle de ativação/desativação
                        // onCheckedChange={checked => handleToggleModuleStatus(orgModule.id, checked)}
                      />
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab de Usuários */}
        <TabsContent value="usuarios" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Usuários da Organização</h2>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" /> Convidar Usuário
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Gestão de Usuários</h3>
                <p className="text-muted-foreground max-w-md mx-auto mt-2">
                  A gestão completa de usuários desta organização está disponível na seção de Convites de Usuários.
                </p>
                <Button 
                  onClick={() => navigate('/user-invitations')} 
                  className="mt-4"
                >
                  Ir para Gestão de Usuários
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Pagamentos */}
        <TabsContent value="pagamentos" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Informações de Pagamento</h2>
            <Button className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Gerenciar Pagamentos
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Plano Atual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">{getPlanName(organization.planId)}</h3>
                  {organization.planId && (
                    <p className="text-muted-foreground">
                      {plans.find(p => p.id === organization.planId)?.description || ""}
                    </p>
                  )}
                </div>
                <Button variant="outline">Alterar Plano</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Histórico de Pagamentos</h3>
                <p className="text-muted-foreground max-w-md mx-auto mt-2">
                  A visualização completa do histórico de pagamentos e faturamentos está disponível no módulo financeiro.
                </p>
                <Button 
                  onClick={() => navigate('/financial')} 
                  className="mt-4"
                >
                  Ir para Módulo Financeiro
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para editar a organização */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Organização</DialogTitle>
            <DialogDescription>
              Atualize as informações da organização. Os campos marcados com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="legalName">Razão Social</Label>
                <Input
                  id="legalName"
                  name="legalName"
                  value={formData.legalName}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Telefone</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateOrgMutation.isPending}>
                {updateOrgMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para suspender/reativar */}
      <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {organization.status === "active" ? "Suspender Organização" : "Reativar Organização"}
            </DialogTitle>
            <DialogDescription>
              {organization.status === "active"
                ? "Isso irá suspender o acesso de todos os usuários da organização."
                : "Isso irá reativar o acesso de todos os usuários da organização."}
            </DialogDescription>
          </DialogHeader>
          
          {organization.status === "active" && (
            <div className="space-y-2">
              <Label htmlFor="suspendReason">Motivo da Suspensão</Label>
              <Textarea
                id="suspendReason"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Informe o motivo da suspensão..."
                rows={3}
              />
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSuspendDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant={organization.status === "active" ? "destructive" : "default"}
              onClick={handleToggleStatus}
              disabled={toggleOrgStatusMutation.isPending}
            >
              {toggleOrgStatusMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {organization.status === "active" ? "Suspender" : "Reativar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para enviar email */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Email de Boas-vindas</DialogTitle>
            <DialogDescription>
              Envie um email personalizado para o administrador da organização.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSendEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailDestination">Destinatário</Label>
              <Input
                id="emailDestination"
                value={organization.email || ""}
                readOnly
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emailMessage">Mensagem</Label>
              <Textarea
                id="emailMessage"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Escreva sua mensagem personalizada..."
                rows={6}
                required
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={sendWelcomeEmailMutation.isPending || !emailMessage.trim()}
              >
                {sendWelcomeEmailMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Enviar Email
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para adicionar módulo */}
      <Dialog open={isAddModuleDialogOpen} onOpenChange={setIsAddModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Módulo</DialogTitle>
            <DialogDescription>
              Selecione um módulo e um plano para adicionar à organização.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddModule} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="moduleSelect">Módulo *</Label>
              <Select
                value={selectedModule?.toString() || ""}
                onValueChange={(value) => setSelectedModule(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um módulo" />
                </SelectTrigger>
                <SelectContent>
                  {availableModules.map((module) => (
                    <SelectItem key={module.id} value={module.id.toString()}>
                      {module.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="modulePlanSelect">Plano do Módulo</Label>
              <Select
                value={selectedModulePlan?.toString() || ""}
                onValueChange={(value) => setSelectedModulePlan(Number(value))}
                disabled={!selectedModule || availableModulePlans.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um plano (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Plano Básico (Padrão)</SelectItem>
                  {availableModulePlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id.toString()}>
                      {plan.name} - R$ {plan.price.toFixed(2)}/{plan.billing_cycle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddModuleDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={addModuleMutation.isPending || !selectedModule}
              >
                {addModuleMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Adicionar Módulo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para upload de logo */}
      <Dialog open={isLogoDialogOpen} onOpenChange={setIsLogoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Logo da Organização</DialogTitle>
            <DialogDescription>
              Faça upload de uma nova logo para a organização {organization?.name}.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleLogoUpload} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="logo">Logo</Label>
              <Input
                id="logo"
                name="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: JPG, PNG, SVG. Tamanho máximo: 2MB.
              </p>
            </div>
            
            {logoFile && (
              <div className="flex justify-center py-2">
                <Avatar className="h-24 w-24 rounded-md">
                  <AvatarImage 
                    src={URL.createObjectURL(logoFile)} 
                    alt="Preview" 
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-md">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
            
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setIsLogoDialogOpen(false);
                  setLogoFile(null);
                }}
                disabled={isUploadingLogo}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={!logoFile || isUploadingLogo}
              >
                {isUploadingLogo ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>Enviar Logo</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}