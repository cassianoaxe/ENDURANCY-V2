import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Database,
  FileText,
  Bell,
  UserCog,
  Save,
  RefreshCw,
  HelpCircle,
  Shield,
  Globe,
  Mail,
  Check,
  Zap,
  CloudUpload,
  Plus,
  Edit,
  User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CadastroConfiguracoes() {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("geral");
  
  // Estados para configurações
  const [autoSave, setAutoSave] = useState(true);
  const [notifyNewRegistrations, setNotifyNewRegistrations] = useState(true);
  const [requireDocuments, setRequireDocuments] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);
  const [defaultLanguage, setDefaultLanguage] = useState("pt-BR");
  const [defaultPlan, setDefaultPlan] = useState("1");
  const [emailOptIn, setEmailOptIn] = useState(true);
  const [termsText, setTermsText] = useState("Ao se cadastrar nesta plataforma, você concorda com os termos de uso e políticas de privacidade.");

  // Salvar configurações
  const saveSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "Suas configurações de cadastro foram atualizadas com sucesso.",
      variant: "default",
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Configurações de Cadastro</h1>
          <p className="text-gray-600">Personalize as configurações do sistema de cadastro</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-3">
          <Card>
            <CardContent className="p-4">
              <Tabs orientation="vertical" value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="flex flex-col items-start h-auto space-y-1 bg-transparent p-0">
                  <TabsTrigger 
                    value="geral" 
                    className="w-full justify-start gap-2 px-3 py-2"
                  >
                    <Settings className="h-4 w-4" /> Geral
                  </TabsTrigger>
                  <TabsTrigger 
                    value="formularios" 
                    className="w-full justify-start gap-2 px-3 py-2"
                  >
                    <FileText className="h-4 w-4" /> Formulários
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notificacoes" 
                    className="w-full justify-start gap-2 px-3 py-2"
                  >
                    <Bell className="h-4 w-4" /> Notificações
                  </TabsTrigger>
                  <TabsTrigger 
                    value="campos" 
                    className="w-full justify-start gap-2 px-3 py-2"
                  >
                    <Database className="h-4 w-4" /> Campos Personalizados
                  </TabsTrigger>
                  <TabsTrigger 
                    value="permissoes" 
                    className="w-full justify-start gap-2 px-3 py-2"
                  >
                    <UserCog className="h-4 w-4" /> Permissões
                  </TabsTrigger>
                  <TabsTrigger 
                    value="avancado" 
                    className="w-full justify-start gap-2 px-3 py-2"
                  >
                    <Shield className="h-4 w-4" /> Configurações Avançadas
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col p-4 pt-0 space-y-4 text-xs text-gray-500">
              <p>
                Estas configurações se aplicam apenas ao módulo de cadastro e suas funcionalidades.
              </p>
              <div className="flex items-center justify-start gap-1">
                <HelpCircle className="h-3 w-3" />
                <span>Precisa de ajuda? <a href="#" className="text-primary hover:underline">Acesse o guia</a></span>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Conteúdo principal */}
        <div className="col-span-9">
          <Card>
            <TabsContent value="geral" className="p-0 m-0">
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>
                  Configure as preferências básicas do sistema de cadastro
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-save" className="text-base">Auto-salvar</Label>
                      <p className="text-sm text-muted-foreground">
                        Salvar automaticamente formulários de cadastro incompletos
                      </p>
                    </div>
                    <Switch 
                      id="auto-save" 
                      checked={autoSave} 
                      onCheckedChange={setAutoSave}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <Label htmlFor="language">Idioma Padrão</Label>
                    <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Selecione um idioma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (United States)</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="plan">Plano Padrão</Label>
                    <Select value={defaultPlan} onValueChange={setDefaultPlan}>
                      <SelectTrigger id="plan">
                        <SelectValue placeholder="Selecione um plano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Básico (Gratuito)</SelectItem>
                        <SelectItem value="5">Seed</SelectItem>
                        <SelectItem value="6">Grow</SelectItem>
                        <SelectItem value="7">Pro</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Este plano será selecionado automaticamente no formulário de cadastro
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="require-docs" className="text-base">Documentos Obrigatórios</Label>
                      <p className="text-sm text-muted-foreground">
                        Exigir documentos para concluir o cadastro
                      </p>
                    </div>
                    <Switch 
                      id="require-docs" 
                      checked={requireDocuments} 
                      onCheckedChange={setRequireDocuments}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-approve" className="text-base">Aprovação Automática</Label>
                      <p className="text-sm text-muted-foreground">
                        Aprovar automaticamente novos cadastros
                      </p>
                    </div>
                    <Switch 
                      id="auto-approve" 
                      checked={autoApprove} 
                      onCheckedChange={setAutoApprove}
                    />
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="formularios" className="p-0 m-0">
              <CardHeader>
                <CardTitle>Configurações de Formulários</CardTitle>
                <CardDescription>
                  Personalize os formulários de cadastro e suas opções
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="terms">Termos e Condições</Label>
                  <Textarea 
                    id="terms" 
                    placeholder="Digite os termos e condições padrão" 
                    value={termsText}
                    onChange={(e) => setTermsText(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Este texto será exibido nos formulários de cadastro como termos de aceitação
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <Label>Campos Obrigatórios</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="gap-1">
                      <Check className="h-3 w-3" /> Nome
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Check className="h-3 w-3" /> Email
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Check className="h-3 w-3" /> Senha
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Check className="h-3 w-3" /> CNPJ/CPF
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Check className="h-3 w-3" /> Tipo de Organização
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-optin" className="text-base">Permitir Opt-in de Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Adicionar opção para receber emails de marketing
                    </p>
                  </div>
                  <Switch 
                    id="email-optin" 
                    checked={emailOptIn} 
                    onCheckedChange={setEmailOptIn}
                  />
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="notificacoes" className="p-0 m-0">
              <CardHeader>
                <CardTitle>Configurações de Notificações</CardTitle>
                <CardDescription>
                  Gerencie como e quando as notificações são enviadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notify-new" className="text-base">Notificar novos cadastros</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificação quando um novo cadastro for realizado
                    </p>
                  </div>
                  <Switch 
                    id="notify-new" 
                    checked={notifyNewRegistrations} 
                    onCheckedChange={setNotifyNewRegistrations}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <Label htmlFor="notification-email">Email para Notificações</Label>
                  <Input 
                    id="notification-email" 
                    placeholder="admin@organizacao.com" 
                    type="email"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label>Eventos para Notificação</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="event-new" defaultChecked />
                      <Label htmlFor="event-new">Novo cadastro</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="event-approved" defaultChecked />
                      <Label htmlFor="event-approved">Cadastro aprovado</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="event-rejected" defaultChecked />
                      <Label htmlFor="event-rejected">Cadastro rejeitado</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="event-changed" defaultChecked />
                      <Label htmlFor="event-changed">Alteração de plano</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="campos" className="p-0 m-0">
              <CardHeader>
                <CardTitle>Campos Personalizados</CardTitle>
                <CardDescription>
                  Adicione campos personalizados ao formulário de cadastro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm">
                    Configure campos personalizados para coletar informações específicas durante o cadastro.
                  </p>
                  
                  <div className="border rounded-md p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Campos Ativos</h3>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Plus className="h-3.5 w-3.5" /> Adicionar Campo
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
                          <div>
                            <p className="font-medium">Setor de Atuação</p>
                            <p className="text-xs text-muted-foreground">Tipo: Seleção</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge>Obrigatório</Badge>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
                          <div>
                            <p className="font-medium">Site</p>
                            <p className="text-xs text-muted-foreground">Tipo: URL</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Opcional</Badge>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
                          <div>
                            <p className="font-medium">Número de Funcionários</p>
                            <p className="text-xs text-muted-foreground">Tipo: Número</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Opcional</Badge>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="permissoes" className="p-0 m-0">
              <CardHeader>
                <CardTitle>Permissões</CardTitle>
                <CardDescription>
                  Configure quem pode acessar e gerenciar cadastros
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-3">Funções com acesso</h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          <span>Administradores</span>
                        </div>
                        <Badge className="bg-primary">Acesso Total</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
                        <div className="flex items-center gap-2">
                          <UserCog className="h-4 w-4 text-blue-500" />
                          <span>Gerentes</span>
                        </div>
                        <Badge className="bg-blue-500">Editar/Visualizar</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-green-500" />
                          <span>Atendentes</span>
                        </div>
                        <Badge className="bg-green-500">Visualizar</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-3">Permissões específicas</h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Aprovar novos cadastros</span>
                        <Select defaultValue="admin">
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Apenas Admin</SelectItem>
                            <SelectItem value="manager">Gerentes</SelectItem>
                            <SelectItem value="all">Todos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Excluir cadastros</span>
                        <Select defaultValue="admin">
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Apenas Admin</SelectItem>
                            <SelectItem value="manager">Gerentes</SelectItem>
                            <SelectItem value="all">Todos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Alterar planos</span>
                        <Select defaultValue="admin">
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Apenas Admin</SelectItem>
                            <SelectItem value="manager">Gerentes</SelectItem>
                            <SelectItem value="all">Todos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="avancado" className="p-0 m-0">
              <CardHeader>
                <CardTitle>Configurações Avançadas</CardTitle>
                <CardDescription>
                  Configurações avançadas para o sistema de cadastro
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border rounded-md p-4 bg-yellow-50">
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-100 p-2 rounded-full mt-1">
                      <HelpCircle className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-yellow-800">Atenção</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        As configurações nesta seção são avançadas e podem afetar o funcionamento do sistema.
                        Recomendamos que apenas administradores experientes façam alterações.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="api-access" className="text-base">Acesso à API</Label>
                      <p className="text-sm text-muted-foreground">
                        Permitir acesso externo à API de cadastro
                      </p>
                    </div>
                    <Switch id="api-access" />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <Label htmlFor="api-key">Chave da API</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="api-key" 
                        value="sk_test_KGzf8O5TlJVXJYasd723lKzxyz"
                        readOnly
                        type="password"
                      />
                      <Button variant="outline">Mostrar</Button>
                      <Button variant="outline">Regenerar</Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <Label htmlFor="integration">Integrações</Label>
                    <Select defaultValue="none">
                      <SelectTrigger id="integration">
                        <SelectValue placeholder="Selecione uma integração" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        <SelectItem value="salesforce">Salesforce</SelectItem>
                        <SelectItem value="zapier">Zapier</SelectItem>
                        <SelectItem value="hubspot">HubSpot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <Label htmlFor="data-export" className="text-base">Exportação Automática</Label>
                      <p className="text-sm text-muted-foreground">
                        Exportar dados automaticamente para o sistema configurado
                      </p>
                    </div>
                    <Switch id="data-export" />
                  </div>
                </div>
                
                <div className="border rounded-md p-4 space-y-3">
                  <h3 className="font-medium">Cache e Desempenho</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="cache" className="text-base">Armazenamento em Cache</Label>
                      <p className="text-sm text-muted-foreground">
                        Armazenar dados em cache para melhorar o desempenho
                      </p>
                    </div>
                    <Switch id="cache" defaultChecked />
                  </div>
                  
                  <div className="pt-2">
                    <Button variant="outline" className="gap-1.5">
                      <RefreshCw className="h-4 w-4" /> Limpar Cache
                    </Button>
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            <CardFooter className="border-t p-6 flex justify-end gap-3">
              <Button variant="outline">Cancelar</Button>
              <Button onClick={saveSettings} className="gap-1.5">
                <Save className="h-4 w-4" /> Salvar Configurações
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}