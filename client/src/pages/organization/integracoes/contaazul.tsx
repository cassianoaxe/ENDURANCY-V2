"use client";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Check, 
  RefreshCw, 
  Info, 
  AlertCircle, 
  RotateCw, 
  ExternalLink,
  Key,
  Lock,
  Shield
} from "lucide-react";
import OrganizationLayout from "@/components/layout/OrganizationLayout";

export default function ContaAzulIntegracao() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("config");
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>("2025-04-15T08:30:00");
  
  // Estado para os dados de configuração
  const [configData, setConfigData] = useState({
    apiKey: "****************************",
    apiSecret: "****************************",
    clientId: "contaazul_client_12345",
    redirectUrl: "https://endurancy25.replit.app/api/integracoes/contaazul/callback",
    environment: "production",
    autoSync: true,
    syncInterval: "hourly",
    syncItems: {
      invoices: true,
      transactions: true,
      customers: true,
      products: true,
      categories: true
    }
  });
  
  // Alternar a integração
  const [integrationActive, setIntegrationActive] = useState(true);
  
  // Estado para os logs
  const [syncLogs, setSyncLogs] = useState([
    { id: 1, date: "2025-04-15T08:30:00", status: "success", message: "Sincronização concluída com sucesso. 42 registros atualizados." },
    { id: 2, date: "2025-04-14T16:45:00", status: "success", message: "Sincronização concluída com sucesso. 18 registros atualizados." },
    { id: 3, date: "2025-04-13T12:15:00", status: "warning", message: "Sincronização parcial. 15 registros atualizados, 3 com erros." },
    { id: 4, date: "2025-04-12T09:00:00", status: "error", message: "Falha na sincronização. Erro de autenticação com a API." },
    { id: 5, date: "2025-04-11T14:30:00", status: "success", message: "Sincronização concluída com sucesso. 27 registros atualizados." },
  ]);
  
  // Estado para as métricas
  const [metrics, setMetrics] = useState({
    totalSyncedInvoices: 128,
    totalSyncedTransactions: 243,
    lastSuccessfulSync: "2025-04-15T08:30:00",
    syncSuccessRate: 93,
    averageSyncTime: "1m 42s"
  });
  
  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Simular tempo decorrido
  const getElapsedTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins} min atrás`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours} ${hours === 1 ? 'hora' : 'horas'} atrás`;
    } else {
      const days = Math.floor(diffMins / 1440);
      return `${days} ${days === 1 ? 'dia' : 'dias'} atrás`;
    }
  };
  
  // Simular salvamento de configurações
  const saveConfig = () => {
    setIsSaving(true);
    
    // Simular um delay na API
    setTimeout(() => {
      setIsSaving(false);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações da integração foram atualizadas com sucesso.",
      });
    }, 1500);
  };
  
  // Simular teste de conexão
  const testConnection = () => {
    setIsTestingConnection(true);
    
    // Simular um delay na API
    setTimeout(() => {
      setIsTestingConnection(false);
      
      toast({
        title: "Conexão realizada com sucesso",
        description: "A conexão com ContaAzul foi estabelecida e autenticada corretamente.",
      });
    }, 2000);
  };
  
  // Simular sincronização manual
  const syncNow = () => {
    // Adicionar um novo log de sincronização
    const newLog = {
      id: syncLogs.length + 1,
      date: new Date().toISOString(),
      status: "success",
      message: "Sincronização manual concluída. 12 registros atualizados."
    };
    
    setSyncLogs([newLog, ...syncLogs]);
    setLastSync(newLog.date);
    
    toast({
      title: "Sincronização iniciada",
      description: "A sincronização manual foi iniciada com sucesso.",
    });
  };
  
  // Alternar o status da integração
  const toggleIntegration = () => {
    const newStatus = !integrationActive;
    setIntegrationActive(newStatus);
    
    toast({
      title: newStatus ? "Integração ativada" : "Integração desativada",
      description: newStatus 
        ? "A integração com ContaAzul foi ativada com sucesso." 
        : "A integração com ContaAzul foi desativada."
    });
  };
  
  // Simular desconexão e remoção da integração
  const disconnectIntegration = () => {
    if (confirm("Tem certeza que deseja desconectar esta integração? Todos os dados de configuração serão perdidos.")) {
      toast({
        title: "Integração desconectada",
        description: "A integração com ContaAzul foi desconectada com sucesso.",
        variant: "destructive"
      });
      
      setTimeout(() => {
        navigate("/organization/integracoes");
      }, 1500);
    }
  };
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate("/organization/integracoes")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        <h1 className="text-3xl font-bold">ContaAzul</h1>
        <Badge className={integrationActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
          {integrationActive ? "Ativa" : "Inativa"}
        </Badge>
      </div>
      <p className="text-muted-foreground">Envie suas faturas e transações diretamente para o ContaAzul</p>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Card className="w-full md:w-2/3">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Status da Integração</CardTitle>
              <div className="flex items-center gap-2">
                <Label htmlFor="integration-status" className={integrationActive ? "text-green-600" : "text-gray-500"}>
                  {integrationActive ? "Ativa" : "Inativa"}
                </Label>
                <Switch
                  id="integration-status"
                  checked={integrationActive}
                  onCheckedChange={toggleIntegration}
                />
              </div>
            </div>
            <CardDescription>
              Gerencie o status da integração e as configurações de sincronização
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Última sincronização</h3>
                  <p className="text-sm text-muted-foreground">
                    {lastSync ? `${formatDate(lastSync)} (${getElapsedTime(lastSync)})` : "Nunca sincronizado"}
                  </p>
                </div>
                <Button 
                  onClick={syncNow} 
                  disabled={!integrationActive}
                  className="gap-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  Sincronizar Agora
                </Button>
              </div>
              
              <Separator />
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-800 mb-1">Faturas Sincronizadas</h3>
                  <p className="text-2xl font-bold text-blue-900">{metrics.totalSyncedInvoices}</p>
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <h3 className="font-medium text-green-800 mb-1">Taxa de Sucesso</h3>
                  <p className="text-2xl font-bold text-green-900">{metrics.syncSuccessRate}%</p>
                </div>
                
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <h3 className="font-medium text-purple-800 mb-1">Tempo Médio</h3>
                  <p className="text-2xl font-bold text-purple-900">{metrics.averageSyncTime}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="w-full md:w-1/3">
          <CardHeader className="pb-3">
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Operações comuns para gerenciar a integração
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={testConnection}
                disabled={isTestingConnection || !integrationActive}
              >
                {isTestingConnection ? (
                  <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Testar Conexão
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.open("https://app.contaazul.com", "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Acessar ContaAzul
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={disconnectIntegration}
              >
                <Shield className="h-4 w-4 mr-2" />
                Revogar Acesso
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="config" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="config">Configurações</TabsTrigger>
          <TabsTrigger value="logs">Logs de Sincronização</TabsTrigger>
          <TabsTrigger value="mapping">Mapeamento de Dados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Credenciais de API</CardTitle>
              <CardDescription>
                Configure as credenciais necessárias para conectar ao ContaAzul
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Informação</AlertTitle>
                  <AlertDescription>
                    Para obter suas credenciais, acesse o portal de desenvolvedores do ContaAzul e registre uma nova aplicação.
                  </AlertDescription>
                </Alert>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <div className="relative">
                      <Input 
                        id="api-key" 
                        type="password" 
                        value={configData.apiKey} 
                        onChange={(e) => setConfigData({...configData, apiKey: e.target.value})}
                      />
                      <Key className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="api-secret">API Secret</Label>
                    <div className="relative">
                      <Input 
                        id="api-secret" 
                        type="password" 
                        value={configData.apiSecret} 
                        onChange={(e) => setConfigData({...configData, apiSecret: e.target.value})}
                      />
                      <Lock className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="client-id">Client ID</Label>
                    <Input 
                      id="client-id" 
                      value={configData.clientId} 
                      onChange={(e) => setConfigData({...configData, clientId: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="redirect-url">URL de Redirecionamento</Label>
                    <Input 
                      id="redirect-url" 
                      value={configData.redirectUrl} 
                      onChange={(e) => setConfigData({...configData, redirectUrl: e.target.value})}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Sincronização</CardTitle>
              <CardDescription>
                Defina como e quando os dados serão sincronizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="auto-sync" 
                    checked={configData.autoSync} 
                    onCheckedChange={(checked) => 
                      setConfigData({...configData, autoSync: checked as boolean})
                    }
                  />
                  <label
                    htmlFor="auto-sync"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Sincronização automática
                  </label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sync-interval">Intervalo de Sincronização</Label>
                  <select 
                    id="sync-interval"
                    className="w-full p-2 border rounded-md"
                    value={configData.syncInterval}
                    onChange={(e) => setConfigData({...configData, syncInterval: e.target.value})}
                    disabled={!configData.autoSync}
                  >
                    <option value="hourly">A cada hora</option>
                    <option value="twice_daily">Duas vezes ao dia</option>
                    <option value="daily">Uma vez ao dia</option>
                    <option value="weekly">Semanalmente</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label className="mb-2 block">Dados a sincronizar</Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="sync-invoices" 
                        checked={configData.syncItems.invoices} 
                        onCheckedChange={(checked) => {
                          setConfigData({
                            ...configData, 
                            syncItems: {
                              ...configData.syncItems,
                              invoices: checked as boolean
                            }
                          });
                        }}
                      />
                      <label
                        htmlFor="sync-invoices"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Faturas
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="sync-transactions" 
                        checked={configData.syncItems.transactions} 
                        onCheckedChange={(checked) => {
                          setConfigData({
                            ...configData, 
                            syncItems: {
                              ...configData.syncItems,
                              transactions: checked as boolean
                            }
                          });
                        }}
                      />
                      <label
                        htmlFor="sync-transactions"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Transações
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="sync-customers" 
                        checked={configData.syncItems.customers} 
                        onCheckedChange={(checked) => {
                          setConfigData({
                            ...configData, 
                            syncItems: {
                              ...configData.syncItems,
                              customers: checked as boolean
                            }
                          });
                        }}
                      />
                      <label
                        htmlFor="sync-customers"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Clientes
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="sync-products" 
                        checked={configData.syncItems.products} 
                        onCheckedChange={(checked) => {
                          setConfigData({
                            ...configData, 
                            syncItems: {
                              ...configData.syncItems,
                              products: checked as boolean
                            }
                          });
                        }}
                      />
                      <label
                        htmlFor="sync-products"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Produtos
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="sync-categories" 
                        checked={configData.syncItems.categories} 
                        onCheckedChange={(checked) => {
                          setConfigData({
                            ...configData, 
                            syncItems: {
                              ...configData.syncItems,
                              categories: checked as boolean
                            }
                          });
                        }}
                      />
                      <label
                        htmlFor="sync-categories"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Categorias
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate("/organization/integracoes")}>
                Cancelar
              </Button>
              <Button onClick={saveConfig} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Configurações"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Sincronização</CardTitle>
              <CardDescription>
                Visualize o histórico de sincronizações e possíveis erros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {syncLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className={`p-4 rounded-lg border ${
                      log.status === 'success' 
                        ? 'bg-green-50 border-green-200' 
                        : log.status === 'warning'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-2">
                        {log.status === 'success' ? (
                          <Check className="h-5 w-5 text-green-600 mt-0.5" />
                        ) : log.status === 'warning' ? (
                          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        )}
                        <div>
                          <p className={`font-medium ${
                            log.status === 'success' 
                              ? 'text-green-800' 
                              : log.status === 'warning'
                                ? 'text-yellow-800'
                                : 'text-red-800'
                          }`}>
                            {log.status === 'success' 
                              ? 'Sincronização bem-sucedida' 
                              : log.status === 'warning'
                                ? 'Sincronização parcial'
                                : 'Falha na sincronização'}
                          </p>
                          <p className="text-sm">{log.message}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{formatDate(log.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Carregar Mais</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="mapping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mapeamento de Dados</CardTitle>
              <CardDescription>
                Configure como os dados são convertidos entre os sistemas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Mapeamento Automático</AlertTitle>
                  <AlertDescription>
                    O sistema irá mapear automaticamente os campos padrão entre Endurancy e ContaAzul. 
                    Use esta seção para personalizar mapeamentos específicos.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Mapeamento de Status de Faturas</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="border rounded-md p-3">
                      <p className="text-sm font-medium mb-2">Endurancy: Aguardando Pagamento</p>
                      <select className="w-full p-2 border rounded-md">
                        <option value="pending">ContaAzul: Pendente</option>
                        <option value="waiting">ContaAzul: Aguardando</option>
                        <option value="open">ContaAzul: Aberto</option>
                      </select>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <p className="text-sm font-medium mb-2">Endurancy: Pago</p>
                      <select className="w-full p-2 border rounded-md">
                        <option value="paid">ContaAzul: Pago</option>
                        <option value="completed">ContaAzul: Concluído</option>
                        <option value="settled">ContaAzul: Liquidado</option>
                      </select>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <p className="text-sm font-medium mb-2">Endurancy: Cancelado</p>
                      <select className="w-full p-2 border rounded-md">
                        <option value="canceled">ContaAzul: Cancelado</option>
                        <option value="void">ContaAzul: Anulado</option>
                      </select>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <p className="text-sm font-medium mb-2">Endurancy: Reembolsado</p>
                      <select className="w-full p-2 border rounded-md">
                        <option value="refunded">ContaAzul: Reembolsado</option>
                        <option value="canceled">ContaAzul: Cancelado</option>
                        <option value="returned">ContaAzul: Devolvido</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-medium">Mapeamento de Categorias Financeiras</h3>
                  <Textarea 
                    className="font-mono text-sm"
                    rows={8}
                    value={`// Formato JSON para mapeamento de categorias
{
  "receitas": {
    "assinaturas": "Assinaturas",
    "vendas_produtos": "Vendas > Produtos",
    "servicos": "Receitas > Serviços"
  },
  "despesas": {
    "operacionais": "Despesas > Operacionais",
    "marketing": "Despesas > Marketing",
    "impostos": "Impostos"
  }
}`}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate("/organization/integracoes")}>
                Cancelar
              </Button>
              <Button onClick={saveConfig} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Configurações"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}