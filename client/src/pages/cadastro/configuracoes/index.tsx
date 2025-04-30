import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Building,
  Lock,
  PanelLeft,
  Workflow,
  FileCode,
  DollarSign,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Importação dos subcomponentes de configuração
import DomainSettings from "./DomainSettings";
import OrganizationTypesConfig from "./OrganizationTypesConfig";

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
          <p className="text-gray-600">Personalize as configurações do sistema de cadastro e ativação de organizações</p>
        </div>
        <Button onClick={saveSettings} className="gap-1.5">
          <Save className="h-4 w-4" /> Salvar Alterações
        </Button>
      </div>

      <Tabs defaultValue="geral" value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <div className="bg-card border rounded-md">
          <ScrollArea className="max-w-full">
            <div className="flex p-1">
              <TabsList className="p-0 bg-transparent flex h-12">
                <TabsTrigger value="geral" className="rounded-sm gap-1.5 h-10">
                  <Settings className="h-4 w-4" /> Geral
                </TabsTrigger>
                <TabsTrigger value="empresas-associacoes" className="rounded-sm gap-1.5 h-10">
                  <Building className="h-4 w-4" /> Empresas/Associações
                </TabsTrigger>
                <TabsTrigger value="formularios" className="rounded-sm gap-1.5 h-10">
                  <FileText className="h-4 w-4" /> Formulários
                </TabsTrigger>
                <TabsTrigger value="dominios" className="rounded-sm gap-1.5 h-10">
                  <Globe className="h-4 w-4" /> Domínios
                </TabsTrigger>
                <TabsTrigger value="emails" className="rounded-sm gap-1.5 h-10">
                  <Mail className="h-4 w-4" /> Emails
                </TabsTrigger>
                <TabsTrigger value="campos-personalizados" className="rounded-sm gap-1.5 h-10">
                  <Database className="h-4 w-4" /> Campos
                </TabsTrigger>
                <TabsTrigger value="planos" className="rounded-sm gap-1.5 h-10">
                  <DollarSign className="h-4 w-4" /> Planos
                </TabsTrigger>
                <TabsTrigger value="fluxos" className="rounded-sm gap-1.5 h-10">
                  <Workflow className="h-4 w-4" /> Fluxos
                </TabsTrigger>
                <TabsTrigger value="permissoes" className="rounded-sm gap-1.5 h-10">
                  <Lock className="h-4 w-4" /> Permissões
                </TabsTrigger>
                <TabsTrigger value="avancado" className="rounded-sm gap-1.5 h-10">
                  <Shield className="h-4 w-4" /> Avançado
                </TabsTrigger>
              </TabsList>
            </div>
          </ScrollArea>
        </div>

        <TabsContent value="geral" className="mt-6 space-y-6">
          <Card>
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
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Interface de Cadastro</CardTitle>
              <CardDescription>
                Configure a aparência e comportamento da interface de cadastro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="logo-url">URL do Logo</Label>
                  <Input 
                    id="logo-url" 
                    placeholder="https://exemplo.com/logo.png" 
                  />
                  <p className="text-xs text-muted-foreground">
                    Logo que aparecerá no topo da página de cadastro
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="hero-image">Imagem de Fundo</Label>
                  <Input 
                    id="hero-image" 
                    placeholder="https://exemplo.com/background.jpg" 
                  />
                  <p className="text-xs text-muted-foreground">
                    Imagem exibida na lateral do formulário de cadastro
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="welcome-title">Título de Boas-Vindas</Label>
                  <Input 
                    id="welcome-title" 
                    placeholder="Bem-vindo ao Endurancy!" 
                    defaultValue="Bem-vindo à Plataforma Endurancy!"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="welcome-subtitle">Subtítulo</Label>
                  <Input 
                    id="welcome-subtitle" 
                    placeholder="Faça seu cadastro para começar" 
                    defaultValue="Crie sua conta para acessar todas as funcionalidades"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="empresas-associacoes" className="mt-6 space-y-6">
          <OrganizationTypesConfig />
        </TabsContent>

        <TabsContent value="formularios" className="mt-6 space-y-6">
          <Card>
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
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Etapas de Cadastro</CardTitle>
              <CardDescription>
                Configure as etapas do processo de cadastro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-medium">Etapas Atuais</h3>
                  <p className="text-sm text-muted-foreground">
                    Sequência de etapas do processo de cadastro
                  </p>
                </div>
                <Button variant="outline" className="gap-1">
                  <Plus className="h-4 w-4" /> Adicionar Etapa
                </Button>
              </div>
              
              <div className="border rounded-md divide-y">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium">1</div>
                    <div>
                      <p className="font-medium">Informações Básicas</p>
                      <p className="text-sm text-muted-foreground">Nome, Email, Senha</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium">2</div>
                    <div>
                      <p className="font-medium">Detalhes da Organização</p>
                      <p className="text-sm text-muted-foreground">Tipo, CNPJ, Endereço</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium">3</div>
                    <div>
                      <p className="font-medium">Documentação</p>
                      <p className="text-sm text-muted-foreground">Envio de documentos</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium">4</div>
                    <div>
                      <p className="font-medium">Plano e Pagamento</p>
                      <p className="text-sm text-muted-foreground">Seleção de plano e forma de pagamento</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium">5</div>
                    <div>
                      <p className="font-medium">Confirmação</p>
                      <p className="text-sm text-muted-foreground">Revisão e confirmação</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dominios" className="mt-6">
          <DomainSettings />
        </TabsContent>

        <TabsContent value="emails" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Email</CardTitle>
              <CardDescription>
                Configure os emails enviados durante o processo de cadastro
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
              
              <div className="space-y-3">
                <Label htmlFor="admin-emails">Emails dos administradores</Label>
                <Input 
                  id="admin-emails" 
                  placeholder="admin@exemplo.com, suporte@exemplo.com" 
                />
                <p className="text-xs text-muted-foreground">
                  Emails que receberão notificações de novos cadastros (separados por vírgula)
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-base font-medium mb-4">Modelos de Email</h3>
                
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">Email de Boas-vindas</h4>
                        <p className="text-sm text-muted-foreground">Enviado após o cadastro</p>
                      </div>
                      <Button variant="outline" size="sm">Editar</Button>
                    </div>
                    <div className="bg-muted rounded-md p-3 text-sm">
                      <p>Assunto: Bem-vindo à Plataforma Endurancy!</p>
                      <p className="mt-2">Olá {{nome}},</p>
                      <p className="mt-1">Seja bem-vindo(a) à Plataforma Endurancy! Seu cadastro para {{organizacao}} foi recebido com sucesso.</p>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">Confirmação de Email</h4>
                        <p className="text-sm text-muted-foreground">Enviado para verificar o email</p>
                      </div>
                      <Button variant="outline" size="sm">Editar</Button>
                    </div>
                    <div className="bg-muted rounded-md p-3 text-sm">
                      <p>Assunto: Confirme seu email na Plataforma Endurancy</p>
                      <p className="mt-2">Olá {{nome}},</p>
                      <p className="mt-1">Por favor, confirme seu endereço de email clicando no link abaixo:</p>
                      <p className="mt-1">{{confirmationLink}}</p>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">Aprovação de Cadastro</h4>
                        <p className="text-sm text-muted-foreground">Enviado quando o cadastro é aprovado</p>
                      </div>
                      <Button variant="outline" size="sm">Editar</Button>
                    </div>
                    <div className="bg-muted rounded-md p-3 text-sm">
                      <p>Assunto: Cadastro Aprovado - Bem-vindo à Plataforma Endurancy</p>
                      <p className="mt-2">Olá {{nome}},</p>
                      <p className="mt-1">Temos o prazer de informar que seu cadastro para {{organizacao}} foi aprovado!</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campos-personalizados" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campos Personalizados</CardTitle>
              <CardDescription>
                Adicione campos personalizados ao formulário de cadastro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-medium">Campos Atuais</h3>
                  <p className="text-sm text-muted-foreground">
                    Campos personalizados definidos para o cadastro
                  </p>
                </div>
                <Button variant="outline" className="gap-1">
                  <Plus className="h-4 w-4" /> Adicionar Campo
                </Button>
              </div>
              
              <div className="border rounded-md divide-y">
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Website</p>
                    <p className="text-sm text-muted-foreground">Campo de texto para URL do site</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Opcional</Badge>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Setor de Atuação</p>
                    <p className="text-sm text-muted-foreground">Lista de seleção com setores</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Opcional</Badge>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Logo da Organização</p>
                    <p className="text-sm text-muted-foreground">Upload de imagem</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      Obrigatório
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planos" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Planos</CardTitle>
              <CardDescription>
                Configure os planos disponíveis no cadastro de organizações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-medium">Planos Disponíveis no Cadastro</h3>
                  <p className="text-sm text-muted-foreground">
                    Planos que estarão disponíveis durante o processo de cadastro
                  </p>
                </div>
                <Button variant="outline" className="gap-1">
                  <Plus className="h-4 w-4" /> Adicionar Plano
                </Button>
              </div>
              
              <div className="border rounded-md divide-y">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-md">
                      <Zap className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Freemium</p>
                      <p className="text-sm text-muted-foreground">Plano gratuito com recursos básicos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                      Gratuito
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-md">
                      <Zap className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Seed</p>
                      <p className="text-sm text-muted-foreground">Plano inicial para pequenas organizações</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">R$ 97/mês</Badge>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-md">
                      <Zap className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Grow</p>
                      <p className="text-sm text-muted-foreground">Plano para organizações em crescimento</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">R$ 197/mês</Badge>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 p-2 rounded-md">
                      <Zap className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium">Pro</p>
                      <p className="text-sm text-muted-foreground">Plano completo para grandes organizações</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">R$ 297/mês</Badge>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fluxos" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fluxos de Cadastro</CardTitle>
              <CardDescription>
                Configure os fluxos de trabalho para o processo de cadastro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-create-org" className="text-base">Criação Automática de Organização</Label>
                  <p className="text-sm text-muted-foreground">
                    Criar organização automaticamente após o preenchimento dos dados básicos
                  </p>
                </div>
                <Switch id="auto-create-org" defaultChecked={true} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-create-domain" className="text-base">Criação Automática de Domínio</Label>
                  <p className="text-sm text-muted-foreground">
                    Criar subdomínio automaticamente com base no nome da organização
                  </p>
                </div>
                <Switch id="auto-create-domain" defaultChecked={true} />
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <Label>Eventos de Gatilho</Label>
                <div className="border rounded-md divide-y">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex gap-3 items-center">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <FileCode className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Após Cadastro</p>
                        <p className="text-sm text-muted-foreground">Ações executadas imediatamente após o cadastro</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Configurar</Button>
                  </div>
                  
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex gap-3 items-center">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <FileCode className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Após Aprovação</p>
                        <p className="text-sm text-muted-foreground">Ações executadas quando um cadastro é aprovado</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Configurar</Button>
                  </div>
                  
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex gap-3 items-center">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <FileCode className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Após Pagamento</p>
                        <p className="text-sm text-muted-foreground">Ações executadas quando um pagamento é confirmado</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Configurar</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissoes" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Permissões de Cadastro</CardTitle>
              <CardDescription>
                Defina quais usuários podem gerenciar cadastros
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Administradores</p>
                      <p className="text-sm text-muted-foreground">Acesso total ao módulo de cadastro</p>
                    </div>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Gerentes</p>
                      <p className="text-sm text-muted-foreground">Podem aprovar cadastros e editar configurações</p>
                    </div>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Atendentes</p>
                      <p className="text-sm text-muted-foreground">Podem visualizar e editar cadastros</p>
                    </div>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Visualizadores</p>
                      <p className="text-sm text-muted-foreground">Podem apenas visualizar cadastros</p>
                    </div>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="avancado" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Avançadas</CardTitle>
              <CardDescription>
                Opções avançadas para o sistema de cadastro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="api-access" className="text-base">Acesso via API</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir cadastro através da API REST
                  </p>
                </div>
                <Switch id="api-access" defaultChecked={true} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ip-restriction" className="text-base">Restrição por IP</Label>
                  <p className="text-sm text-muted-foreground">
                    Limitar tentativas de cadastro por endereço IP
                  </p>
                </div>
                <Switch id="ip-restriction" defaultChecked={true} />
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <Label htmlFor="rate-limit">Limite de Tentativas</Label>
                <Input 
                  id="rate-limit" 
                  type="number" 
                  defaultValue="5" 
                  min="1" 
                  max="100"
                />
                <p className="text-xs text-muted-foreground">
                  Número máximo de tentativas de cadastro por IP em um período de 10 minutos
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="captcha" className="text-base">CAPTCHA</Label>
                  <p className="text-sm text-muted-foreground">
                    Exigir verificação CAPTCHA durante o cadastro
                  </p>
                </div>
                <Switch id="captcha" defaultChecked={true} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance" className="text-base">Modo de Manutenção</Label>
                  <p className="text-sm text-muted-foreground">
                    Desabilitar novos cadastros temporariamente
                  </p>
                </div>
                <Switch id="maintenance" defaultChecked={false} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}