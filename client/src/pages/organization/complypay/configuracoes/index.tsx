import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { 
  AlertCircle, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Info, 
  Key, 
  Lock, 
  Settings2, 
  CogIcon, 
  Save 
} from 'lucide-react';

export default function ComplyPayConfiguracoes() {
  const [activeTab, setActiveTab] = useState('geral');
  const { toast } = useToast();
  
  // Estados para as configurações
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [sandboxMode, setSandboxMode] = useState(true);
  const [automaticCapture, setAutomaticCapture] = useState(true);
  const [pixEnabled, setPixEnabled] = useState(true);
  const [boletoEnabled, setBoletoEnabled] = useState(true);
  const [creditCardEnabled, setCreditCardEnabled] = useState(true);
  
  // No futuro, podemos usar React Query para buscar dados reais da API
  const { data: configData, isLoading } = useQuery({
    queryKey: ['/api/complypay/configuracoes'],
    enabled: false, // Desabilitado temporariamente pois estamos usando dados de exemplo
  });

  const handleSaveSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações foram salvas com sucesso",
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="pagamentos">Métodos de Pagamento</TabsTrigger>
          <TabsTrigger value="integracao">Integração</TabsTrigger>
        </TabsList>
        
        {/* Aba de Configurações Gerais */}
        <TabsContent value="geral" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Configure as opções gerais do sistema de pagamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 lg:grid-cols-2 lg:gap-x-6">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Nome da Empresa</Label>
                  <Input id="business-name" placeholder="Nome da sua empresa" defaultValue="Minha Empresa" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="business-document">CNPJ</Label>
                  <Input id="business-document" placeholder="00.000.000/0000-00" defaultValue="12.345.678/0001-90" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact-email">E-mail de Contato</Label>
                  <Input id="contact-email" type="email" placeholder="seu@email.com" defaultValue="contato@minhaempresa.com.br" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Telefone de Contato</Label>
                  <Input id="contact-phone" placeholder="(00) 00000-0000" defaultValue="(11) 98765-4321" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sandbox-mode">Modo Sandbox</Label>
                    <p className="text-sm text-muted-foreground">
                      Execute transações em ambiente de teste
                    </p>
                  </div>
                  <Switch
                    id="sandbox-mode"
                    checked={sandboxMode}
                    onCheckedChange={setSandboxMode}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="automatic-capture">Captura Automática</Label>
                    <p className="text-sm text-muted-foreground">
                      Capturar automaticamente pagamentos pré-autorizados
                    </p>
                  </div>
                  <Switch
                    id="automatic-capture"
                    checked={automaticCapture}
                    onCheckedChange={setAutomaticCapture}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>
                Configure as notificações de pagamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 lg:grid-cols-2 lg:gap-x-6">
                <div className="space-y-2">
                  <Label htmlFor="notification-email">E-mail para Notificações</Label>
                  <Input id="notification-email" type="email" placeholder="notificacoes@email.com" defaultValue="financeiro@minhaempresa.com.br" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notification-frequency">Frequência de Relatórios</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger id="notification-frequency">
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba de Métodos de Pagamento */}
        <TabsContent value="pagamentos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pagamento</CardTitle>
              <CardDescription>
                Configure quais métodos de pagamento estarão disponíveis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <div className="space-y-0.5">
                      <Label htmlFor="credit-card-enabled">Cartão de Crédito</Label>
                      <p className="text-sm text-muted-foreground">
                        Aceitar pagamentos via cartão de crédito
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="credit-card-enabled"
                    checked={creditCardEnabled}
                    onCheckedChange={setCreditCardEnabled}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Banknote className="h-5 w-5" />
                    <div className="space-y-0.5">
                      <Label htmlFor="boleto-enabled">Boleto Bancário</Label>
                      <p className="text-sm text-muted-foreground">
                        Aceitar pagamentos via boleto bancário
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="boleto-enabled"
                    checked={boletoEnabled}
                    onCheckedChange={setBoletoEnabled}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <QrCode className="h-5 w-5" />
                    <div className="space-y-0.5">
                      <Label htmlFor="pix-enabled">PIX</Label>
                      <p className="text-sm text-muted-foreground">
                        Aceitar pagamentos via PIX
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="pix-enabled"
                    checked={pixEnabled}
                    onCheckedChange={setPixEnabled}
                  />
                </div>
              </div>
              
              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">Configurações de Cartão de Crédito</h3>
                
                <div className="grid grid-cols-1 gap-y-6 lg:grid-cols-2 lg:gap-x-6">
                  <div className="space-y-2">
                    <Label htmlFor="card-brands">Bandeiras Aceitas</Label>
                    <Select defaultValue="all">
                      <SelectTrigger id="card-brands">
                        <SelectValue placeholder="Selecione as bandeiras" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as bandeiras</SelectItem>
                        <SelectItem value="visa-master">Visa e Mastercard</SelectItem>
                        <SelectItem value="visa-master-amex">Visa, Mastercard e Amex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="installments">Parcelamento Máximo</Label>
                    <Select defaultValue="12">
                      <SelectTrigger id="installments">
                        <SelectValue placeholder="Selecione o número de parcelas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">À vista</SelectItem>
                        <SelectItem value="3">Até 3x</SelectItem>
                        <SelectItem value="6">Até 6x</SelectItem>
                        <SelectItem value="12">Até 12x</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="interest-rate">Taxa de Juros</Label>
                    <Input id="interest-rate" placeholder="0.00" defaultValue="1.99" />
                    <p className="text-xs text-muted-foreground">% ao mês para parcelamentos</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="min-installment-value">Valor Mínimo de Parcela</Label>
                    <Input id="min-installment-value" placeholder="0.00" defaultValue="50.00" />
                    <p className="text-xs text-muted-foreground">Valor mínimo para cada parcela</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Aba de Integração */}
        <TabsContent value="integracao" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chaves de API</CardTitle>
              <CardDescription>
                Configure suas chaves de API para integração com o gateway de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 lg:grid-cols-2 lg:gap-x-6">
                <div className="space-y-2">
                  <Label htmlFor="api-key-production">Chave de Produção</Label>
                  <div className="flex">
                    <Input id="api-key-production" type="password" defaultValue="pk_live_12345678901234567890" className="rounded-r-none" />
                    <Button variant="outline" className="rounded-l-none">
                      Mostrar
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="api-key-sandbox">Chave de Sandbox</Label>
                  <div className="flex">
                    <Input id="api-key-sandbox" type="password" defaultValue="pk_test_12345678901234567890" className="rounded-r-none" />
                    <Button variant="outline" className="rounded-l-none">
                      Mostrar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Webhook</CardTitle>
              <CardDescription>
                Configure o URL de callback para receber notificações de eventos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="webhook-enabled">Habilitar Webhook</Label>
                  <Switch
                    id="webhook-enabled"
                    checked={webhookEnabled}
                    onCheckedChange={setWebhookEnabled}
                  />
                </div>
              </div>
              
              {webhookEnabled && (
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">URL do Webhook</Label>
                    <Input 
                      id="webhook-url" 
                      placeholder="https://seusite.com/webhook/complypay" 
                      defaultValue="https://api.minhaempresa.com.br/webhooks/pagamentos" 
                    />
                    <p className="text-xs text-muted-foreground">
                      URL que receberá as notificações de eventos
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="webhook-secret">Segredo do Webhook</Label>
                    <div className="flex">
                      <Input id="webhook-secret" type="password" defaultValue="whsec_12345678901234567890" className="rounded-r-none" />
                      <Button variant="outline" className="rounded-l-none">
                        Mostrar
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Utilizado para verificar a autenticidade das notificações
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="webhook-events">Eventos</Label>
                    <Select defaultValue="all">
                      <SelectTrigger id="webhook-events">
                        <SelectValue placeholder="Selecione os eventos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os eventos</SelectItem>
                        <SelectItem value="payments">Apenas pagamentos</SelectItem>
                        <SelectItem value="refunds">Apenas reembolsos</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings}>
          <Save className="mr-2 h-4 w-4" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}