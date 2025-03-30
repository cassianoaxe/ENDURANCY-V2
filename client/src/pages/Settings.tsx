"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Globe, Bell, Key, Mail, AlertCircle } from "lucide-react";
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
  
  // Carregar o estado do modo de teste quando o componente for montado
  useEffect(() => {
    // Poderíamos buscar o estado atual do servidor, mas por ora vamos iniciar como true (modo de teste)
    setTestMode(true);
  }, []);
  
  const handleToggleTestMode = async () => {
    setIsTogglingMode(true);
    try {
      const response = await apiRequest('POST', '/api/email/toggle-test-mode', {});
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
                    <Input defaultValue="Endurancy" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">URL</label>
                    <Input defaultValue="https://endurancy.com" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Configurações Regionais</h3>
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium">Fuso Horário</label>
                    <Input defaultValue="America/Sao_Paulo" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Formato de Data</label>
                    <Input defaultValue="DD/MM/YYYY" />
                  </div>
                </div>
              </div>

              <Button>Salvar Alterações</Button>
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

        {/* Other tab contents would be similar */}
      </Tabs>
    </div>
  );
}
