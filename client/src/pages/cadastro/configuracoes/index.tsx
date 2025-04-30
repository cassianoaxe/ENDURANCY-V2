import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Check,
  Plus,
  Edit,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
        {/* Sidebar de navegação */}
        <div className="col-span-3">
          <Card>
            <CardContent className="p-4">
              <nav className="flex flex-col space-y-1">
                <button 
                  onClick={() => setCurrentTab("geral")}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${currentTab === "geral" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <Settings className="h-4 w-4" /> Geral
                </button>
                <button 
                  onClick={() => setCurrentTab("formularios")}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${currentTab === "formularios" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <FileText className="h-4 w-4" /> Formulários
                </button>
                <button 
                  onClick={() => setCurrentTab("notificacoes")}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${currentTab === "notificacoes" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <Bell className="h-4 w-4" /> Notificações
                </button>
                <button 
                  onClick={() => setCurrentTab("campos")}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${currentTab === "campos" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <Database className="h-4 w-4" /> Campos Personalizados
                </button>
                <button 
                  onClick={() => setCurrentTab("permissoes")}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${currentTab === "permissoes" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <UserCog className="h-4 w-4" /> Permissões
                </button>
                <button 
                  onClick={() => setCurrentTab("avancado")}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${currentTab === "avancado" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <Shield className="h-4 w-4" /> Configurações Avançadas
                </button>
              </nav>
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
            {currentTab === "geral" && (
              <>
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
              </>
            )}

            {currentTab === "formularios" && (
              <>
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
              </>
            )}

            {currentTab === "notificacoes" && (
              <>
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
              </>
            )}

            {currentTab === "campos" && (
              <>
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
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {/* Botões de ação */}
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