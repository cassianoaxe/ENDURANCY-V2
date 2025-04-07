"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Settings as SettingsIcon, 
  Globe, 
  Bell, 
  Key, 
  Mail, 
  AlertCircle, 
  Plug, 
  CreditCard, 
  MessageSquare,
  Brain,
  Truck,
  Link as Link2 
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const { toast } = useToast();
  const [emailTestData, setEmailTestData] = useState({
    email: "",
    template: "organization_registration",
  });
  const [isSending, setIsSending] = useState(false);
  const [testMode, setTestMode] = useState(true);
  const [isTogglingMode, setIsTogglingMode] = useState(false);
  const [isSavingGeneralSettings, setIsSavingGeneralSettings] = useState(false);
  const [isSavingSecuritySettings, setIsSavingSecuritySettings] = useState(false);
  
  // Estado para as configurações gerais
  const [generalSettings, setGeneralSettings] = useState({
    platformName: "Endurancy",
    platformUrl: "https://endurancy.com",
    timezone: "America/Sao_Paulo",
    dateFormat: "DD/MM/YYYY"
  });
  
  // Estado para as configurações de segurança
  const [securitySettings, setSecuritySettings] = useState({
    passwordPolicy: "medium",
    sessionTimeout: "30",
    twoFactorAuthRequired: false,
    ipRestrictions: ""
  });
  
  // Carregar o estado do modo de teste quando o componente for montado
  useEffect(() => {
    // Poderíamos buscar o estado atual do servidor, mas por ora vamos iniciar como true (modo de teste)
    setTestMode(true);
  }, []);
  
  const handleToggleTestMode = async () => {
    setIsTogglingMode(true);
    try {
      const response = await apiRequest('POST', '/api/email/toggle-test-mode', {
        currentTestMode: testMode
      });
      const result = await response.json();
      
      if (result.success) {
        setTestMode(result.testMode);
        toast({
          title: "Modo alterado",
          description: result.message,
        });
      } else {
        throw new Error(result.message || "Erro ao alternar modo de teste");
      }
    } catch (error) {
      console.error("Erro ao alternar modo de teste:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alternar o modo de teste. Verifique os logs para mais detalhes.",
        variant: "destructive",
      });
    } finally {
      setIsTogglingMode(false);
    }
  };
  
  const handleSaveGeneralSettings = async () => {
    setIsSavingGeneralSettings(true);
    
    try {
      const response = await apiRequest('POST', '/api/settings/general', generalSettings);
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Configurações salvas",
          description: "As configurações gerais foram salvas com sucesso.",
        });
      } else {
        throw new Error(result.message || "Erro ao salvar configurações");
      }
    } catch (error) {
      console.error("Erro ao salvar configurações gerais:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações. Verifique os logs para mais detalhes.",
        variant: "destructive",
      });
    } finally {
      setIsSavingGeneralSettings(false);
    }
  };
  
  const handleSaveSecuritySettings = async () => {
    setIsSavingSecuritySettings(true);
    
    try {
      const response = await apiRequest('POST', '/api/settings/security', securitySettings);
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Configurações salvas",
          description: "As configurações de segurança foram salvas com sucesso.",
        });
      } else {
        throw new Error(result.message || "Erro ao salvar configurações");
      }
    } catch (error) {
      console.error("Erro ao salvar configurações de segurança:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações. Verifique os logs para mais detalhes.",
        variant: "destructive",
      });
    } finally {
      setIsSavingSecuritySettings(false);
    }
  };

  const handleTestEmail = async () => {
    if (!emailTestData.email) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe um endereço de e-mail válido.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      const response = await apiRequest('POST', '/api/email/test', emailTestData);
      const result = await response.json();

      if (result.success) {
        toast({
          title: "E-mail enviado",
          description: `E-mail de teste enviado para ${emailTestData.email}`,
        });
      } else {
        throw new Error(result.message || "Erro ao enviar e-mail");
      }
    } catch (error) {
      console.error("Erro ao testar e-mail:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o e-mail de teste. Verifique os logs para mais detalhes.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      <p className="text-gray-600 mb-8">Configure as preferências gerais do sistema.</p>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="email">E-mail</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informações da Plataforma</h3>
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium">Nome da Plataforma</label>
                    <Input 
                      value={generalSettings.platformName} 
                      onChange={(e) => setGeneralSettings({...generalSettings, platformName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">URL</label>
                    <Input 
                      value={generalSettings.platformUrl} 
                      onChange={(e) => setGeneralSettings({...generalSettings, platformUrl: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Configurações Regionais</h3>
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium">Fuso Horário</label>
                    <Select 
                      value={generalSettings.timezone} 
                      onValueChange={(value) => setGeneralSettings({...generalSettings, timezone: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um fuso horário" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Sao_Paulo">America/Sao_Paulo</SelectItem>
                        <SelectItem value="America/New_York">America/New_York</SelectItem>
                        <SelectItem value="Europe/London">Europe/London</SelectItem>
                        <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Formato de Data</label>
                    <Select 
                      value={generalSettings.dateFormat} 
                      onValueChange={(value) => setGeneralSettings({...generalSettings, dateFormat: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um formato de data" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSaveGeneralSettings}
                disabled={isSavingGeneralSettings}
              >
                {isSavingGeneralSettings ? "Salvando..." : "Salvar Alterações"}
              </Button>
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
              <p className="text-sm text-gray-500">
                Gerencie todas as integrações do sistema em um único lugar. As integrações configuradas aqui serão aplicadas a todas as organizações.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Link href="/integracoes/pagamentos/asaas" className="block">
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <CreditCard className="h-8 w-8 text-primary mr-3" />
                          <div>
                            <h3 className="font-medium">Asaas</h3>
                            <p className="text-sm text-gray-500">Pagamentos</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Ativo</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">Processe pagamentos via cartão, boleto, e PIX e gerencie cobranças recorrentes</p>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link href="/integracoes/pagamentos/zoop" className="block">
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <CreditCard className="h-8 w-8 text-primary mr-3" />
                          <div>
                            <h3 className="font-medium">Zoop</h3>
                            <p className="text-sm text-gray-500">Pagamentos</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Ativo</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">Plataforma de pagamentos com taxas competitivas e múltiplas opções</p>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link href="/integracoes/comunicacao/whatsapp" className="block">
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <MessageSquare className="h-8 w-8 text-primary mr-3" />
                          <div>
                            <h3 className="font-medium">WhatsApp</h3>
                            <p className="text-sm text-gray-500">Comunicação</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Ativo</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">Envie mensagens automáticas e notificações via WhatsApp para pacientes e clientes</p>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link href="/integracoes/ia/chatgpt" className="block">
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Brain className="h-8 w-8 text-primary mr-3" />
                          <div>
                            <h3 className="font-medium">ChatGPT</h3>
                            <p className="text-sm text-gray-500">Inteligência Artificial</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Inativo</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">Utilize o ChatGPT para automação de atendimento e análise de dados</p>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link href="/integracoes/ia/claude" className="block">
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Brain className="h-8 w-8 text-primary mr-3" />
                          <div>
                            <h3 className="font-medium">Claude (Anthropic)</h3>
                            <p className="text-sm text-gray-500">Inteligência Artificial</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Inativo</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">Assistente de IA avançado para análises complexas e automação</p>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link href="/integracoes/logistica/melhor-envio" className="block">
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Truck className="h-8 w-8 text-primary mr-3" />
                          <div>
                            <h3 className="font-medium">Melhor Envio</h3>
                            <p className="text-sm text-gray-500">Logística</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Inativo</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">Calcule fretes e gerencie envios com as principais transportadoras</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
              <div className="flex justify-center mt-6">
                <Link href="/integracoes" className="flex items-center gap-2 text-primary hover:underline">
                  <Link2 className="h-4 w-4" /> Ver todas as integrações disponíveis
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="h-5 w-5 mr-2" />
                Configurações de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Política de Senhas</h3>
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium">Política de Complexidade</label>
                    <Select 
                      value={securitySettings.passwordPolicy} 
                      onValueChange={(value) => setSecuritySettings({...securitySettings, passwordPolicy: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma política" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa (min. 6 caracteres)</SelectItem>
                        <SelectItem value="medium">Média (min. 8 caracteres, letras e números)</SelectItem>
                        <SelectItem value="high">Alta (min. 10 caracteres, letras, números e símbolos)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tempo de Sessão (minutos)</label>
                    <Input 
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Autenticação de Dois Fatores</h3>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={securitySettings.twoFactorAuthRequired}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorAuthRequired: checked})}
                  />
                  <span>Exigir autenticação de dois fatores para todos os administradores</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Restrições de IP</h3>
                <p className="text-sm text-gray-500">
                  Liste os endereços IP permitidos para acesso administrativo (separados por vírgula). Deixe em branco para permitir todos.
                </p>
                <Input 
                  placeholder="Ex: 192.168.1.1, 10.0.0.1"
                  value={securitySettings.ipRestrictions}
                  onChange={(e) => setSecuritySettings({...securitySettings, ipRestrictions: e.target.value})}
                />
              </div>

              <Button 
                onClick={handleSaveSecuritySettings}
                disabled={isSavingSecuritySettings}
              >
                {isSavingSecuritySettings ? "Salvando..." : "Salvar Configurações de Segurança"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Configurações de E-mail
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Configuração SMTP</h3>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Modo de Produção</span>
                    <Switch 
                      checked={!testMode} 
                      onCheckedChange={handleToggleTestMode} 
                    />
                    <span className="text-sm font-medium">Modo de Teste</span>
                  </div>
                </div>
                <Alert className={`mb-4 ${testMode ? "bg-yellow-50 border-yellow-200" : "bg-green-50 border-green-200"}`}>
                  <AlertCircle className={`h-4 w-4 ${testMode ? "text-yellow-500" : "text-green-500"}`} />
                  <AlertTitle>{testMode ? "Modo de Teste Ativado" : "Modo de Produção Ativado"}</AlertTitle>
                  <AlertDescription>
                    {testMode ? 
                      "O sistema está operando em modo de teste para e-mails. Neste modo, os e-mails não são realmente enviados, mas são exibidos no console do servidor para fins de depuração." :
                      "O sistema está operando em modo de produção para e-mails. Neste modo, os e-mails são realmente enviados aos destinatários usando as configurações SMTP definidas."
                    }
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Servidor SMTP</label>
                    <Input disabled value="mail.endurancy.com.br" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Porta</label>
                    <Input disabled value="465" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Servidor IMAP</label>
                    <Input disabled value="mail.endurancy.com.br" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Porta IMAP</label>
                    <Input disabled value="993" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">E-mail de Envio</label>
                    <Input disabled value="E-mail configurado nas variáveis de ambiente" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Segurança</label>
                    <Input disabled value="SSL/TLS" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Testar Envio de E-mail</h3>
                <p className="text-sm text-gray-500">
                  Utilize este formulário para testar o envio de e-mails utilizando os diferentes templates disponíveis.
                </p>
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium">E-mail de Destino</label>
                    <Input 
                      value={emailTestData.email}
                      onChange={(e) => setEmailTestData({...emailTestData, email: e.target.value})}
                      placeholder="Digite o e-mail para teste"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Template</label>
                    <Select 
                      value={emailTestData.template}
                      onValueChange={(value) => setEmailTestData({...emailTestData, template: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="organization_registration">Cadastro de Organização</SelectItem>
                        <SelectItem value="organization_approved">Organização Aprovada</SelectItem>
                        <SelectItem value="organization_rejected">Organização Rejeitada</SelectItem>
                        <SelectItem value="user_welcome">Boas-vindas ao Usuário</SelectItem>
                        <SelectItem value="password_reset">Redefinição de Senha</SelectItem>
                        <SelectItem value="plan_purchase_confirmation">Confirmação de Compra de Plano</SelectItem>
                        <SelectItem value="module_purchase_confirmation">Confirmação de Compra de Módulo</SelectItem>
                        <SelectItem value="payment_failed">Falha no Pagamento</SelectItem>
                        <SelectItem value="subscription_expiring">Assinatura Expirando</SelectItem>
                        <SelectItem value="limit_warning">Aviso de Limite</SelectItem>
                        <SelectItem value="new_module_available">Novo Módulo Disponível</SelectItem>
                        <SelectItem value="module_status_update">Atualização de Status do Módulo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={handleTestEmail} 
                  disabled={isSending}
                  className="mt-2"
                >
                  {isSending ? "Enviando..." : "Enviar E-mail de Teste"}
                </Button>
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
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notificações do Sistema</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Configure quais eventos geram notificações no sistema.
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Novas organizações</h4>
                      <p className="text-sm text-gray-500">Notificar quando uma nova organização se registrar</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Pagamentos</h4>
                      <p className="text-sm text-gray-500">Notificar sobre pagamentos bem-sucedidos e falhos</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Uso de limite</h4>
                      <p className="text-sm text-gray-500">Notificar quando organizações estiverem próximas do limite de cadastros</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Segurança</h4>
                      <p className="text-sm text-gray-500">Notificar sobre tentativas de login suspeitas</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <Button className="mt-4">
                  Salvar Preferências de Notificação
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Configurações de API
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Chaves de API</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Gerencie as chaves de API para integração com outros sistemas.
                </p>
                
                <div className="border rounded-md p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Chave de API Principal</h4>
                    <div className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">Ativa</div>
                  </div>
                  <div className="flex mb-2">
                    <Input value="••••••••••••••••••••••••••••••" className="mr-2" disabled />
                    <Button variant="outline" size="sm">Mostrar</Button>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Criada em: 01/03/2024</span>
                    <span>Última utilização: Hoje</span>
                  </div>
                </div>
                
                <Button>
                  Gerar Nova Chave de API
                </Button>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Limites e Restrições</h3>
                  
                  <div className="grid gap-4">
                    <div>
                      <label className="text-sm font-medium">Taxa de Requisições (por minuto)</label>
                      <Input type="number" defaultValue="100" />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Domínios Permitidos</label>
                      <Input placeholder="Ex: api.exemplo.com, *.meudominio.com" />
                      <p className="text-xs text-gray-500 mt-1">Deixe em branco para permitir de qualquer origem</p>
                    </div>
                  </div>
                  
                  <Button className="mt-4">
                    Salvar Configurações de API
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
