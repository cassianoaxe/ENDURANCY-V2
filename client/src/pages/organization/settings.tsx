"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Users
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
  
  // Estado para aba selecionada atualmente
  const [activeTab, setActiveTab] = useState("information");

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
                    <Select defaultValue="system">
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
                    <Select defaultValue="America/Sao_Paulo">
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
                    <Select defaultValue="dd/MM/yyyy">
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
                    <Select defaultValue="pt-BR">
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
                    <Button>Salvar Preferências</Button>
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
                <Button size="sm">
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
}