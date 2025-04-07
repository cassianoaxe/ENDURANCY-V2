"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Settings as SettingsIcon, 
  Globe, 
  Bell, 
  Key, 
  Mail, 
  Info, 
  Plug, 
  CreditCard, 
  MessageSquare,
  Brain,
  Truck,
  Link as Link2,
  Send,
  Mailbox,
  Plane,
  Leaf,
  UserPlus,
  UserCog,
  Shield,
  Users,
  Loader2,
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import OrganizationLayout from "@/components/layout/OrganizationLayout";

export default function OrganizationSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const organizationId = user?.organizationId;
  
  // Estados para controle da interface
  const [activeTab, setActiveTab] = useState("information");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  
  // Importação do contexto de tema
  const { theme, setTheme } = useTheme();
  
  // Estados para preferências
  const [preferences, setPreferences] = useState<{
    theme: 'light' | 'dark' | 'system';
    timezone: string;
    dateFormat: string;
    language: string;
  }>({
    theme: theme as 'light' | 'dark' | 'system',
    timezone: "America/Sao_Paulo",
    dateFormat: "dd/MM/yyyy",
    language: "pt-BR"
  });
  
  // Atualizar preferências quando o tema global mudar
  useEffect(() => {
    setPreferences(prev => ({
      ...prev,
      theme: theme as 'light' | 'dark' | 'system'
    }));
  }, [theme]);
  
  // Estado para controlar salvamento
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  // Função para salvar as preferências
  const savePreferences = async () => {
    setIsSaving(true);
    
    try {
      // Aqui seria a chamada para a API para salvar as preferências
      // await apiRequest('/api/organizations/preferences', { method: 'POST', data: preferences });
      
      // Aplicar o tema selecionado usando nosso novo contexto ThemeContext
      setTheme(preferences.theme as 'light' | 'dark' | 'system');
      
      // Simular um pequeno delay para feedback visual
      setTimeout(() => {
        setSavedSuccess(true);
        toast({
          title: "Preferências salvas com sucesso!",
          description: "Suas preferências foram atualizadas."
        });
        setIsSaving(false);
        
        // Reset do estado de sucesso após 3 segundos
        setTimeout(() => {
          setSavedSuccess(false);
        }, 3000);
      }, 500);
    } catch (error) {
      console.error("Erro ao salvar preferências:", error);
      toast({
        title: "Erro ao salvar preferências",
        description: "Ocorreu um erro ao tentar salvar suas preferências. Tente novamente.",
        variant: "destructive"
      });
      setIsSaving(false);
    }
  };
  
  // Estados para formulários
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'employee',
    groupId: '',
    message: '',
  });
  
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });
  
  // Template de grupos pré-definidos
  const groupTemplates = [
    {
      id: 'gerente-farmaceutico',
      name: 'Gerente Farmacêutico',
      description: 'Responsável pela gestão da farmácia e produtos farmacêuticos',
      permissions: ['view_inventory', 'edit_inventory', 'view_patients', 'edit_prescriptions']
    },
    {
      id: 'gerente-cultivo',
      name: 'Gerente de Cultivo',
      description: 'Responsável pelo gerenciamento do cultivo de plantas',
      permissions: ['view_cultivation', 'edit_cultivation', 'view_inventory', 'edit_inventory']
    },
    {
      id: 'gerente-atendimento',
      name: 'Gerente de Atendimento',
      description: 'Responsável pelo atendimento a pacientes e clientes',
      permissions: ['view_patients', 'edit_patients', 'view_appointments', 'edit_appointments']
    },
    {
      id: 'gerente-rh',
      name: 'Gerente de RH',
      description: 'Responsável pela gestão de recursos humanos',
      permissions: ['view_employees', 'edit_employees', 'view_payroll', 'edit_payroll']
    },
    {
      id: 'gerente-vendas',
      name: 'Gerente de Vendas',
      description: 'Responsável pela gestão de vendas e marketing',
      permissions: ['view_sales', 'edit_sales', 'view_marketing', 'edit_marketing']
    },
    {
      id: 'gerente-financeiro',
      name: 'Gerente Financeiro',
      description: 'Responsável pela gestão financeira da organização',
      permissions: ['view_financial', 'edit_financial', 'view_reports', 'edit_reports']
    },
    {
      id: 'gerente-juridico',
      name: 'Gerente Jurídico',
      description: 'Responsável pelos assuntos jurídicos e regulatórios',
      permissions: ['view_legal', 'edit_legal', 'view_compliance', 'edit_compliance']
    },
    {
      id: 'gerente-social',
      name: 'Gerente de Assistência Social',
      description: 'Responsável pelos programas sociais e assistência a pacientes',
      permissions: ['view_patients', 'edit_patients', 'view_social', 'edit_social']
    },
    {
      id: 'gerente-expedicao',
      name: 'Gerente de Expedição',
      description: 'Responsável pela expedição e logística de produtos',
      permissions: ['view_shipping', 'edit_shipping', 'view_inventory', 'edit_inventory']
    },
    {
      id: 'gerente-comunicacao',
      name: 'Gerente de Comunicação',
      description: 'Responsável pela comunicação interna e externa',
      permissions: ['view_communication', 'edit_communication', 'view_marketing', 'edit_marketing']
    },
    {
      id: 'auditoria',
      name: 'Auditoria',
      description: 'Responsável pela auditoria interna',
      permissions: ['view_all', 'view_reports', 'view_financial', 'view_compliance']
    },
    {
      id: 'controladoria',
      name: 'Controladoria',
      description: 'Responsável pelo controle financeiro e contábil',
      permissions: ['view_financial', 'edit_financial', 'view_reports', 'edit_reports']
    },
    {
      id: 'contador',
      name: 'Contador',
      description: 'Responsável pela contabilidade da organização',
      permissions: ['view_financial', 'view_reports', 'edit_reports']
    }
  ];

  // Integrations data for the organization
  const integrations = [
    {
      id: "complychat",
      name: "COMPLYCHAT",
      category: "Comunicação",
      description: "Integração com canal de chat para comunicação interna e externa",
      icon: <MessageSquare size={24} className="text-primary" />,
      href: "/organization/integrations/complychat",
      active: true
    },
    {
      id: "whatsapp",
      name: "WHATSAPP",
      category: "Comunicação",
      description: "Envie mensagens automáticas e notificações para pacientes e clientes",
      icon: <MessageSquare size={24} className="text-primary" />,
      href: "/organization/integrations/whatsapp",
      active: false
    },
    {
      id: "melhor-envio",
      name: "MELHOR ENVIO",
      category: "Logística",
      description: "Calcule fretes e gerencie envios com as principais transportadoras",
      icon: <Send size={24} className="text-primary" />,
      href: "/organization/integrations/melhor-envio",
      active: false
    },
    {
      id: "azul-cargo",
      name: "AZUL CARGO",
      category: "Logística",
      description: "Integração direta com a Azul Cargo para envios aéreos rápidos",
      icon: <Plane size={24} className="text-primary" />,
      href: "/organization/integrations/azul-cargo", 
      active: false
    },
    {
      id: "correios",
      name: "CORREIOS",
      category: "Logística",
      description: "Integração com os Correios para cálculo de fretes e rastreamento",
      icon: <Mailbox size={24} className="text-primary" />,
      href: "/organization/integrations/correios",
      active: false
    }
  ];
  
  // Agrupar integrações por categoria
  const groupedIntegrations = integrations.reduce((acc: Record<string, any[]>, integration) => {
    const category = integration.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(integration);
    return acc;
  }, {});

  return (
    <OrganizationLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Configurações da Organização</h1>
        <p className="text-gray-600 mb-8">Configure preferências e integrações para sua organização.</p>

        <Tabs defaultValue="information" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="information">Informações</TabsTrigger>
            <TabsTrigger value="preferences">Preferências</TabsTrigger>
            <TabsTrigger value="integrations">Integrações</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
          </TabsList>

          <TabsContent value="information">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Organização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-gray-500">
                  Aqui você pode visualizar as informações básicas de sua organização.
                  Para alterá-las, entre em contato com o suporte.
                </p>
                
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">Verificação Pendente</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    Alguns documentos da sua organização ainda precisam ser validados. Acesse a seção "Documentos" para enviá-los.
                  </AlertDescription>
                </Alert>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Nome da Organização</h3>
                    <p className="font-medium">Abraçe Esperança - HempMeds</p>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">CNPJ</h3>
                    <p className="font-medium">12.345.678/0001-90</p>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="font-medium">abraceesperanca@gmail.com</p>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Telefone</h3>
                    <p className="font-medium">(11) 98765-4321</p>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Endereço</h3>
                    <p className="font-medium">Av. Paulista, 1000 - Bela Vista</p>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Cidade/Estado</h3>
                    <p className="font-medium">São Paulo, SP</p>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">CEP</h3>
                    <p className="font-medium">01310-100</p>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Website</h3>
                    <p className="font-medium">www.abraceesperanca.org.br</p>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Data de Registro</h3>
                    <p className="font-medium">06/04/2025</p>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <div>
                      <Badge className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                        Ativo
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Logo da Organização</h3>
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-md bg-green-50 flex items-center justify-center">
                      <Leaf className="h-10 w-10 text-green-600" />
                    </div>
                    <Button variant="outline" size="sm">
                      Solicitar alteração de logo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferências</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6">
                  <div>
                    <Label htmlFor="theme" className="text-sm font-medium mb-2 block">Tema</Label>
                    <Select 
                      value={preferences.theme}
                      onValueChange={(value: 'light' | 'dark' | 'system') => setPreferences({...preferences, theme: value})}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o tema" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="dark">Escuro</SelectItem>
                        <SelectItem value="system">Sistema</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 mt-1">
                      Define a aparência visual do sistema
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="timezone" className="text-sm font-medium mb-2 block">Fuso Horário</Label>
                    <Select 
                      value={preferences.timezone}
                      onValueChange={(value) => setPreferences({...preferences, timezone: value})}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o fuso horário" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                        <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                        <SelectItem value="America/Rio_Branco">Rio Branco (GMT-5)</SelectItem>
                        <SelectItem value="America/Noronha">Fernando de Noronha (GMT-2)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 mt-1">
                      Define o fuso horário para exibição de datas e agendamentos
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="date-format" className="text-sm font-medium mb-2 block">Formato de Data</Label>
                    <Select 
                      value={preferences.dateFormat}
                      onValueChange={(value) => setPreferences({...preferences, dateFormat: value})}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o formato de data" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dd/MM/yyyy">DD/MM/AAAA (31/12/2025)</SelectItem>
                        <SelectItem value="MM/dd/yyyy">MM/DD/AAAA (12/31/2025)</SelectItem>
                        <SelectItem value="yyyy-MM-dd">AAAA-MM-DD (2025-12-31)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 mt-1">
                      Define como as datas são exibidas no sistema
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="language" className="text-sm font-medium mb-2 block">Idioma</Label>
                    <Select 
                      value={preferences.language}
                      onValueChange={(value) => setPreferences({...preferences, language: value})}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o idioma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">Inglês (EUA)</SelectItem>
                        <SelectItem value="es-ES">Espanhol</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 mt-1">
                      Define o idioma da interface do sistema
                    </p>
                  </div>
                  
                  <div className="pt-4">
                    <h3 className="text-sm font-medium mb-2">Notificações por Email</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-updates" className="text-sm font-medium">Atualizações do Sistema</Label>
                          <p className="text-xs text-gray-500">Receber emails sobre atualizações e novidades</p>
                        </div>
                        <Switch id="email-updates" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-security" className="text-sm font-medium">Alertas de Segurança</Label>
                          <p className="text-xs text-gray-500">Receber emails sobre atividades suspeitas</p>
                        </div>
                        <Switch id="email-security" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-marketing" className="text-sm font-medium">Marketing</Label>
                          <p className="text-xs text-gray-500">Receber emails sobre promoções e ofertas</p>
                        </div>
                        <Switch id="email-marketing" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <Button 
                      onClick={savePreferences}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : savedSuccess ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Salvo!
                        </>
                      ) : (
                        'Salvar Preferências'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plug className="h-5 w-5 mr-2" />
                  Integrações
                </CardTitle>
                <p className="text-sm text-gray-500 mt-2">
                  Configure integrações com serviços externos para aumentar a produtividade da sua organização.
                </p>
              </CardHeader>
              <CardContent className="space-y-8">
                {Object.entries(groupedIntegrations).map(([category, categoryIntegrations]) => (
                  <div key={category} className="space-y-4">
                    <h3 className="text-lg font-medium">{category}</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {categoryIntegrations.map((integration) => (
                        <Card key={integration.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center">
                                {integration.icon}
                                <div className="ml-3">
                                  <h4 className="font-medium">{integration.name}</h4>
                                  <p className="text-xs text-gray-500">{category}</p>
                                </div>
                              </div>
                              <Badge 
                                variant={integration.active ? "outline" : "secondary"}
                                className={integration.active ? "bg-green-50 text-green-700" : ""}
                              >
                                {integration.active ? "Ativo" : "Inativo"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
                            <div className="flex justify-end">
                              <Button 
                                variant="outline" 
                                size="sm"
                                asChild
                              >
                                <Link href={integration.href}>Configurar</Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Usuários e Permissões
                </CardTitle>
                <Button size="sm" onClick={() => setShowInviteModal(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Convidar Usuário
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-gray-500">
                  Gerencie usuários da sua organização e suas permissões de acesso ao sistema.
                </p>
                
                <div className="grid gap-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Usuários Ativos</h3>
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Função</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2 text-primary">
                                  CA
                                </div>
                                Carol Araújo
                              </div>
                            </TableCell>
                            <TableCell>abraceesperanca@gmail.com</TableCell>
                            <TableCell>
                              <Badge className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                                Administrador
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <UserCog className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2 text-primary">
                                  RS
                                </div>
                                Roberto Silva
                              </div>
                            </TableCell>
                            <TableCell>roberto.silva@abraceesperanca.org.br</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                Doutor
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <UserCog className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2 text-primary">
                                  ML
                                </div>
                                Marina Lima
                              </div>
                            </TableCell>
                            <TableCell>marina.lima@abraceesperanca.org.br</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                Gerente
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <UserCog className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-3">Convites Pendentes</h3>
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Função</TableHead>
                            <TableHead>Data do Convite</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>ana.santos@abraceesperanca.org.br</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                Funcionário
                              </Badge>
                            </TableCell>
                            <TableCell>06/04/2025</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <Mail className="h-4 w-4 mr-1" />
                                Reenviar
                              </Button>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-3">Grupos de Usuários</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <Shield className="h-5 w-5 text-primary" />
                              <div className="ml-3">
                                <h4 className="font-medium">Administradores</h4>
                                <p className="text-xs text-gray-500">3 usuários</p>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">Acesso completo a todas as configurações e funcionalidades.</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <Shield className="h-5 w-5 text-primary" />
                              <div className="ml-3">
                                <h4 className="font-medium">Doutores</h4>
                                <p className="text-xs text-gray-500">5 usuários</p>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">Acesso a cadastro de pacientes e prescrições médicas.</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <Shield className="h-5 w-5 text-primary" />
                              <div className="ml-3">
                                <h4 className="font-medium">Funcionários</h4>
                                <p className="text-xs text-gray-500">12 usuários</p>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">Acesso limitado a funções operacionais específicas.</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Configurações de Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-gray-500">
                  Configure como e quando deseja receber notificações do sistema.
                </p>
                
                <div className="grid gap-6">
                  <div>
                    <h3 className="text-base font-medium mb-3">Notificações do Sistema</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="notif-all" className="text-sm font-medium">Receber todas as notificações</Label>
                          <p className="text-xs text-gray-500">Ative para receber todos os tipos de notificações</p>
                        </div>
                        <Switch id="notif-all" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="notif-browser" className="text-sm font-medium">Notificações no navegador</Label>
                          <p className="text-xs text-gray-500">Mostrar notificações no navegador enquanto o sistema estiver aberto</p>
                        </div>
                        <Switch id="notif-browser" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="notif-sound" className="text-sm font-medium">Sons de notificação</Label>
                          <p className="text-xs text-gray-500">Reproduzir sons ao receber notificações importantes</p>
                        </div>
                        <Switch id="notif-sound" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="text-base font-medium mb-3">Tipos de Notificações</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="notif-system" className="text-sm font-medium">Atualizações do Sistema</Label>
                          <p className="text-xs text-gray-500">Informações sobre novas funcionalidades e atualizações</p>
                        </div>
                        <Switch id="notif-system" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="notif-security" className="text-sm font-medium">Segurança</Label>
                          <p className="text-xs text-gray-500">Alertas de segurança e atividades suspeitas</p>
                        </div>
                        <Switch id="notif-security" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="notif-tasks" className="text-sm font-medium">Tarefas e Lembretes</Label>
                          <p className="text-xs text-gray-500">Lembretes de tarefas e prazos pendentes</p>
                        </div>
                        <Switch id="notif-tasks" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="notif-messages" className="text-sm font-medium">Mensagens</Label>
                          <p className="text-xs text-gray-500">Novas mensagens de outros usuários</p>
                        </div>
                        <Switch id="notif-messages" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="notif-modules" className="text-sm font-medium">Módulos</Label>
                          <p className="text-xs text-gray-500">Atualizações relacionadas aos módulos utilizados</p>
                        </div>
                        <Switch id="notif-modules" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="notif-marketing" className="text-sm font-medium">Marketing e Promoções</Label>
                          <p className="text-xs text-gray-500">Promoções, ofertas especiais e eventos</p>
                        </div>
                        <Switch id="notif-marketing" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="text-base font-medium mb-3">Canais de Notificação</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="channel-email" className="text-sm font-medium">Email</Label>
                          <p className="text-xs text-gray-500">Receber notificações por email</p>
                        </div>
                        <Switch id="channel-email" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="channel-sms" className="text-sm font-medium">SMS</Label>
                          <p className="text-xs text-gray-500">Receber notificações por SMS</p>
                        </div>
                        <Switch id="channel-sms" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="channel-whatsapp" className="text-sm font-medium">WhatsApp</Label>
                          <p className="text-xs text-gray-500">Receber notificações por WhatsApp</p>
                        </div>
                        <Switch id="channel-whatsapp" defaultChecked />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-2">
                    <Button>Salvar Configurações</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );

  // Modais de interface
  return (
    <>
      {/* Modal de convite de usuário */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Convidar Usuário</DialogTitle>
            <DialogDescription>
              Envie um convite para um novo usuário entrar na sua organização.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@exemplo.com.br"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="role">Função</Label>
              <Select
                value={inviteForm.role}
                onValueChange={(value) => setInviteForm({...inviteForm, role: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="doctor">Doutor</SelectItem>
                  <SelectItem value="employee">Funcionário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="group">Grupo de Usuário</Label>
              <Select
                value={inviteForm.groupId}
                onValueChange={(value) => setInviteForm({...inviteForm, groupId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Administradores</SelectItem>
                  <SelectItem value="2">Doutores</SelectItem>
                  <SelectItem value="3">Funcionários</SelectItem>
                  <SelectItem value="4">Gerente Farmacêutico</SelectItem>
                  <SelectItem value="5">Gerente de Cultivo</SelectItem>
                  <SelectItem value="6">Gerente de Vendas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="message">Mensagem personalizada (opcional)</Label>
              <Textarea
                id="message"
                placeholder="Escreva uma mensagem pessoal para o convite..."
                value={inviteForm.message}
                onChange={(e) => setInviteForm({...inviteForm, message: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                toast({
                  title: "Convite enviado",
                  description: `Um convite foi enviado para ${inviteForm.email}`,
                });
                setShowInviteModal(false);
              }}
            >
              Enviar Convite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de edição de usuário */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações e permissões do usuário.
            </DialogDescription>
          </DialogHeader>
          
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {/* Extraindo iniciais do nome para o avatar */}
                  {editingUser.name.split(' ').reduce((initials: string, namePart: string) => 
                    initials + (namePart.charAt(0) || ''), '').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{editingUser.name}</p>
                  <p className="text-sm text-gray-500">{editingUser.email}</p>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Função</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) => setEditingUser({...editingUser, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="doctor">Doutor</SelectItem>
                    <SelectItem value="employee">Funcionário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-group">Grupo de Usuário</Label>
                <Select
                  value={editingUser.groupId}
                  onValueChange={(value) => setEditingUser({...editingUser, groupId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Administradores</SelectItem>
                    <SelectItem value="2">Doutores</SelectItem>
                    <SelectItem value="3">Funcionários</SelectItem>
                    <SelectItem value="4">Gerente Farmacêutico</SelectItem>
                    <SelectItem value="5">Gerente de Cultivo</SelectItem>
                    <SelectItem value="6">Gerente de Vendas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label className="font-medium mb-1">Permissões Avançadas</Label>
                <div className="border rounded-md p-4 space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox id="perm-view" checked={true} />
                    <div className="grid gap-1.5">
                      <Label htmlFor="perm-view">Visualizar módulos</Label>
                      <p className="text-sm text-gray-500">Permite acesso de visualização a todos os módulos do sistema</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox id="perm-edit" checked={editingUser.role === 'admin' || editingUser.role === 'manager'} />
                    <div className="grid gap-1.5">
                      <Label htmlFor="perm-edit">Editar informações</Label>
                      <p className="text-sm text-gray-500">Permite editar informações em todos os módulos acessíveis</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox id="perm-admin" checked={editingUser.role === 'admin'} disabled={editingUser.role !== 'admin'} />
                    <div className="grid gap-1.5">
                      <Label htmlFor="perm-admin">Acesso administrativo</Label>
                      <p className="text-sm text-gray-500">Controle total sobre todas as configurações do sistema</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserModal(false)}>Cancelar</Button>
            <Button variant="destructive" className="mr-auto">Remover Usuário</Button>
            <Button
              onClick={() => {
                toast({
                  title: "Usuário atualizado",
                  description: `As informações de ${editingUser?.name} foram atualizadas com sucesso`,
                });
                setShowUserModal(false);
              }}
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de grupo de usuários */}
      <Dialog open={showGroupModal} onOpenChange={setShowGroupModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingGroup ? "Editar Grupo" : "Novo Grupo de Usuários"}</DialogTitle>
            <DialogDescription>
              {editingGroup 
                ? "Modifique as informações e permissões do grupo." 
                : "Crie um novo grupo com permissões específicas."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="group-name">Nome do Grupo</Label>
              <Input
                id="group-name"
                placeholder="Ex: Equipe de Marketing"
                value={groupForm.name}
                onChange={(e) => setGroupForm({...groupForm, name: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="group-description">Descrição</Label>
              <Textarea
                id="group-description"
                placeholder="Descreva a função deste grupo..."
                value={groupForm.description}
                onChange={(e) => setGroupForm({...groupForm, description: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label className="font-medium mb-1">Permissões</Label>
              <ScrollArea className="h-[200px] border rounded-md p-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Gerais</h4>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="perm-dashboard" />
                        <Label htmlFor="perm-dashboard">Dashboard</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="perm-reports" />
                        <Label htmlFor="perm-reports">Relatórios</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-2 border-t">
                    <h4 className="text-sm font-medium">Pacientes</h4>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="perm-patients-view" />
                        <Label htmlFor="perm-patients-view">Visualizar pacientes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="perm-patients-edit" />
                        <Label htmlFor="perm-patients-edit">Editar pacientes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="perm-medical-records" />
                        <Label htmlFor="perm-medical-records">Prontuários médicos</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-2 border-t">
                    <h4 className="text-sm font-medium">Inventário</h4>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="perm-inventory-view" />
                        <Label htmlFor="perm-inventory-view">Visualizar estoque</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="perm-inventory-edit" />
                        <Label htmlFor="perm-inventory-edit">Gerenciar estoque</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-2 border-t">
                    <h4 className="text-sm font-medium">Financeiro</h4>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="perm-financial-view" />
                        <Label htmlFor="perm-financial-view">Visualizar finanças</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="perm-financial-edit" />
                        <Label htmlFor="perm-financial-edit">Gerenciar finanças</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-2 border-t">
                    <h4 className="text-sm font-medium">Configurações</h4>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="perm-settings-view" />
                        <Label htmlFor="perm-settings-view">Visualizar configurações</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="perm-settings-edit" />
                        <Label htmlFor="perm-settings-edit">Editar configurações</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
            
            <div className="grid gap-2">
              <Label className="font-medium mb-1">Usar Template</Label>
              <Select
                onValueChange={(value) => {
                  const template = groupTemplates.find(t => t.id === value);
                  if (template) {
                    setGroupForm({
                      name: template.name,
                      description: template.description,
                      permissions: template.permissions
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  {groupTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Aplique um template pré-configurado para este grupo
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGroupModal(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                toast({
                  title: editingGroup ? "Grupo atualizado" : "Grupo criado",
                  description: editingGroup
                    ? `O grupo ${groupForm.name} foi atualizado com sucesso`
                    : `O grupo ${groupForm.name} foi criado com sucesso`,
                });
                setShowGroupModal(false);
              }}
            >
              {editingGroup ? "Salvar Alterações" : "Criar Grupo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}