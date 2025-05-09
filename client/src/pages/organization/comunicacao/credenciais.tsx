import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
// Removendo import do OrganizationLayout para evitar a renderização duplicada
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  Mail,
  MessageSquare,
  Smartphone,
  Key,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  Info,
  Settings,
  LinkIcon,
  RotateCw
} from "lucide-react";

export default function CredenciaisPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("email");
  
  // Estados para gerenciar visibilidade de credenciais
  const [showEmailApiKey, setShowEmailApiKey] = useState(false);
  const [showSmsApiKey, setShowSmsApiKey] = useState(false);
  const [showWhatsAppApiKey, setShowWhatsAppApiKey] = useState(false);

  // Função simulada para copiar para o clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Em uma implementação real, mostraria um toast ou feedback
    alert("Copiado para a área de transferência!");
  };

  // Função simulada para gerar novo token/API key
  const regenerateToken = (service: string) => {
    // Em uma implementação real, faria uma chamada à API para gerar um novo token
    alert(`Token para ${service} regenerado com sucesso!`);
  };

  return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Credenciais</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie as credenciais de API para serviços de comunicação
            </p>
          </div>
        </div>

        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Informação importante</AlertTitle>
          <AlertDescription>
            As credenciais são necessárias para integrar serviços externos de comunicação.
            Mantenha suas chaves de API seguras e nunca compartilhe com terceiros.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="email" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <span>SMS</span>
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>WhatsApp</span>
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              <span>Webhooks</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Credenciais de Email</CardTitle>
                  <CardDescription>
                    Configure as credenciais para envio de emails através de provedores externos
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Provedor de Serviço</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-md p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-bold">SG</span>
                          </div>
                          <div>
                            <div className="font-medium">SendGrid</div>
                            <div className="text-xs text-muted-foreground">Serviço recomendado</div>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50">
                          <span className="text-green-600">Ativo</span>
                        </Badge>
                      </div>

                      <div className="border rounded-md p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-md bg-amber-100 flex items-center justify-center mr-3">
                            <span className="text-amber-600 font-bold">SES</span>
                          </div>
                          <div>
                            <div className="font-medium">Amazon SES</div>
                            <div className="text-xs text-muted-foreground">Alternativa</div>
                          </div>
                        </div>
                        <Badge variant="outline">Inativo</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Chave de API do SendGrid</h3>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar Nova Chave
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Adicionar Nova Chave API</DialogTitle>
                            <DialogDescription>
                              Adicione uma nova chave de API para o serviço de email
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="api-name">Nome da Chave</Label>
                              <Input id="api-name" placeholder="Ex: SendGrid Production" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="api-key">Chave de API</Label>
                              <Input id="api-key" placeholder="SG.xxxxxxxx" />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button>Salvar</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">SendGrid Production</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Adicionada em 10/04/2025
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-green-50">
                            <span className="text-green-600">Ativa</span>
                          </Badge>
                        </div>

                        <div className="mt-4 p-2 bg-muted rounded-md flex items-center justify-between">
                          <div className="font-mono text-sm">
                            {showEmailApiKey ? "SG.1A2B3C4D5E6F7G8H9I0J.KLMNOPQRSTUVWXYZ12345" : "••••••••••••••••••••••••••••••••••••••••••"}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => setShowEmailApiKey(!showEmailApiKey)}>
                              {showEmailApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard("SG.1A2B3C4D5E6F7G8H9I0J.KLMNOPQRSTUVWXYZ12345")}>
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => regenerateToken("SendGrid")}>
                              <RotateCw className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                          <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                            Revogar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Configurações de Email</CardTitle>
                  <CardDescription>
                    Configure as opções de envio de email
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Email do Remetente</h3>
                    <Input placeholder="noreply@suaempresa.com" defaultValue="noreply@minhaorganizacao.com" />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Nome do Remetente</h3>
                    <Input placeholder="Nome da Sua Empresa" defaultValue="Minha Organização" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-tracking">Rastreamento de Aberturas</Label>
                      <Switch id="email-tracking" defaultChecked />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="click-tracking">Rastreamento de Cliques</Label>
                      <Switch id="click-tracking" defaultChecked />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sandbox-mode">Modo Sandbox</Label>
                      <Switch id="sandbox-mode" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      No modo sandbox, os emails não são realmente enviados, mas você pode testar a integração.
                    </p>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button className="w-full">Salvar Configurações</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sms">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Credenciais de SMS</CardTitle>
                  <CardDescription>
                    Configure as credenciais para envio de SMS através de provedores externos
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Provedor de Serviço</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-md p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-md bg-red-100 flex items-center justify-center mr-3">
                            <span className="text-red-600 font-bold">TW</span>
                          </div>
                          <div>
                            <div className="font-medium">Twilio</div>
                            <div className="text-xs text-muted-foreground">Serviço recomendado</div>
                          </div>
                        </div>
                        <Badge variant="outline">Inativo</Badge>
                      </div>

                      <div className="border rounded-md p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-md bg-purple-100 flex items-center justify-center mr-3">
                            <span className="text-purple-600 font-bold">ZP</span>
                          </div>
                          <div>
                            <div className="font-medium">Zenvia</div>
                            <div className="text-xs text-muted-foreground">Alternativa</div>
                          </div>
                        </div>
                        <Badge variant="outline">Inativo</Badge>
                      </div>
                    </div>
                  </div>

                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Configuração Pendente</AlertTitle>
                    <AlertDescription>
                      Você ainda não configurou nenhum provedor de SMS. Configure um provedor para enviar mensagens SMS.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Configurar Provedor de SMS
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Configurar Provedor de SMS</DialogTitle>
                          <DialogDescription>
                            Adicione as credenciais do seu provedor de SMS para começar a enviar mensagens.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="sms-provider">Provedor</Label>
                            <select className="w-full px-3 py-2 border rounded-md">
                              <option value="twilio">Twilio</option>
                              <option value="zenvia">Zenvia</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="account-sid">Account SID</Label>
                            <Input id="account-sid" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="auth-token">Auth Token</Label>
                            <Input id="auth-token" type="password" placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone-number">Número de Telefone</Label>
                            <Input id="phone-number" placeholder="+5511999999999" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button>Salvar Configurações</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Configurações de SMS</CardTitle>
                  <CardDescription>
                    Configure as opções de envio de SMS
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Configuração Necessária</AlertTitle>
                    <AlertDescription>
                      Configure um provedor de SMS primeiro para poder acessar as configurações avançadas.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3 opacity-50 pointer-events-none">
                    <h3 className="text-sm font-medium">Nome do Remetente</h3>
                    <Input placeholder="Nome da Sua Empresa" />
                  </div>

                  <div className="space-y-3 opacity-50 pointer-events-none">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="delivery-receipts">Confirmação de Entrega</Label>
                      <Switch id="delivery-receipts" />
                    </div>
                  </div>

                  <div className="space-y-3 opacity-50 pointer-events-none">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="test-mode">Modo de Teste</Label>
                      <Switch id="test-mode" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      No modo de teste, os SMS não são realmente enviados, mas você pode testar a integração.
                    </p>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button className="w-full" disabled>Salvar Configurações</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="whatsapp">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Credenciais de WhatsApp</CardTitle>
                  <CardDescription>
                    Configure as credenciais para envio de mensagens via WhatsApp
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Provedor de Serviço</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-md p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-md bg-green-100 flex items-center justify-center mr-3">
                            <span className="text-green-600 font-bold">WA</span>
                          </div>
                          <div>
                            <div className="font-medium">WhatsApp Business API</div>
                            <div className="text-xs text-muted-foreground">Integração oficial</div>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50">
                          <span className="text-green-600">Ativo</span>
                        </Badge>
                      </div>

                      <div className="border rounded-md p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-bold">ZP</span>
                          </div>
                          <div>
                            <div className="font-medium">Zenvia WhatsApp</div>
                            <div className="text-xs text-muted-foreground">Alternativa</div>
                          </div>
                        </div>
                        <Badge variant="outline">Inativo</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Token de Acesso do WhatsApp</h3>
                      <Button variant="outline" size="sm" onClick={() => regenerateToken("WhatsApp")}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerar Token
                      </Button>
                    </div>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">WhatsApp Business API</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Atualizado em 05/04/2025
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-green-50">
                            <span className="text-green-600">Ativo</span>
                          </Badge>
                        </div>

                        <div className="mt-4 p-2 bg-muted rounded-md flex items-center justify-between">
                          <div className="font-mono text-sm">
                            {showWhatsAppApiKey ? "EAABz9Wk5ZCGsBALxHbDFbBP0IJGU1V7ZCGZAngdKZC..." : "••••••••••••••••••••••••••••••••••••••••••"}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => setShowWhatsAppApiKey(!showWhatsAppApiKey)}>
                              {showWhatsAppApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard("EAABz9Wk5ZCGsBALxHbDFbBP0IJGU1V7ZCGZAngdKZC...")}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="font-medium mb-2 text-sm">Webhook URL</div>
                          <div className="p-2 bg-muted rounded-md flex items-center justify-between">
                            <div className="font-mono text-sm truncate">
                              https://sua-organizacao.com/api/webhooks/whatsapp
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard("https://sua-organizacao.com/api/webhooks/whatsapp")}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                          <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                            Revogar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Configurações do WhatsApp</CardTitle>
                  <CardDescription>
                    Configure as opções de envio de mensagens via WhatsApp
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Número do WhatsApp</h3>
                    <Input placeholder="+5511999999999" defaultValue="+5511987654321" />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Nome do Perfil de Negócios</h3>
                    <Input placeholder="Nome da Sua Empresa" defaultValue="Minha Organização" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="read-receipts">Confirmação de Leitura</Label>
                      <Switch id="read-receipts" defaultChecked />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-reply">Resposta Automática</Label>
                      <Switch id="auto-reply" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Envia respostas automáticas para mensagens recebidas fora do horário comercial.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Status da Verificação</h3>
                    <div className="p-2 rounded-md bg-green-50 text-green-700 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm">Conta verificada</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button className="w-full">Salvar Configurações</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="webhooks">
            <Card>
              <CardHeader>
                <CardTitle>Configuração de Webhooks</CardTitle>
                <CardDescription>
                  Configure webhooks para receber eventos de comunicação em tempo real
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Sobre Webhooks</AlertTitle>
                  <AlertDescription>
                    Webhooks permitem que você receba notificações em tempo real sobre eventos como 
                    entregas de email, mensagens de WhatsApp, etc. Configure URLs para cada evento 
                    que deseja monitorar.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">Email Webhooks</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email-delivered">Email Entregue</Label>
                        <Input 
                          id="email-delivered" 
                          placeholder="https://seu-site.com/api/webhooks/email/delivered" 
                          defaultValue="https://minha-organizacao.com/api/webhooks/email/delivered"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email-opened">Email Aberto</Label>
                        <Input 
                          id="email-opened" 
                          placeholder="https://seu-site.com/api/webhooks/email/opened"
                          defaultValue="https://minha-organizacao.com/api/webhooks/email/opened"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email-clicked">Link Clicado</Label>
                        <Input 
                          id="email-clicked" 
                          placeholder="https://seu-site.com/api/webhooks/email/clicked"
                          defaultValue="https://minha-organizacao.com/api/webhooks/email/clicked"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email-bounced">Email Devolvido</Label>
                        <Input 
                          id="email-bounced" 
                          placeholder="https://seu-site.com/api/webhooks/email/bounced"
                          defaultValue="https://minha-organizacao.com/api/webhooks/email/bounced"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">WhatsApp Webhooks</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="whatsapp-message">Mensagem Recebida</Label>
                        <Input 
                          id="whatsapp-message" 
                          placeholder="https://seu-site.com/api/webhooks/whatsapp/message"
                          defaultValue="https://minha-organizacao.com/api/webhooks/whatsapp/message"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="whatsapp-status">Status de Mensagem</Label>
                        <Input 
                          id="whatsapp-status" 
                          placeholder="https://seu-site.com/api/webhooks/whatsapp/status"
                          defaultValue="https://minha-organizacao.com/api/webhooks/whatsapp/status"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="whatsapp-template">Aprovação de Template</Label>
                        <Input 
                          id="whatsapp-template" 
                          placeholder="https://seu-site.com/api/webhooks/whatsapp/template"
                          defaultValue="https://minha-organizacao.com/api/webhooks/whatsapp/template"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Chave Secreta de Webhook</h3>
                    <Button variant="outline" size="sm" onClick={() => regenerateToken("Webhook")}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Regenerar Chave
                    </Button>
                  </div>

                  <div className="p-2 bg-muted rounded-md flex items-center justify-between">
                    <div className="font-mono text-sm">
                      whsec_8BnJLNriMwNV4KXuMUNuCiuFx9JFdQHz
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard("whsec_8BnJLNriMwNV4KXuMUNuCiuFx9JFdQHz")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Esta chave é usada para verificar que os webhooks recebidos são realmente do nosso serviço.
                  </p>
                </div>
              </CardContent>

              <CardFooter>
                <Button className="w-full">Salvar Configurações de Webhook</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
}