"use client";
import { useState, useEffect } from "react";
// Usando window.location.href em vez de useLocation para navegação
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

export default function PipefyIntegracao() {
  // Usando window.location.href para navegação
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("config");
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>("2025-04-15T09:30:00");
  
  // Estado para os dados de configuração
  const [configData, setConfigData] = useState({
    apiToken: "****************************",
    organizationId: "93587",
    refreshToken: "****************************",
    webhookUrl: "https://endurancy25.replit.app/api/integracoes/pipefy/webhook",
    environment: "production",
    autoSync: true,
    syncInterval: "hourly",
    syncItems: {
      cards: true,
      pipes: true,
      phases: true,
      fields: true,
      members: true
    }
  });
  
  // Alternar a integração
  const [integrationActive, setIntegrationActive] = useState(true);
  
  // Estado para os logs
  const [syncLogs, setSyncLogs] = useState([
    { id: 1, date: "2025-04-15T09:30:00", status: "success", message: "Sincronização concluída com sucesso. 28 cards atualizados." },
    { id: 2, date: "2025-04-14T15:45:00", status: "success", message: "Sincronização concluída com sucesso. 12 cards atualizados." },
    { id: 3, date: "2025-04-13T11:15:00", status: "warning", message: "Sincronização parcial. 10 cards atualizados, 2 com erros." },
    { id: 4, date: "2025-04-12T08:00:00", status: "error", message: "Falha na sincronização. Erro de autenticação com a API." },
    { id: 5, date: "2025-04-11T14:30:00", status: "success", message: "Sincronização concluída com sucesso. 15 cards atualizados." },
  ]);
  
  // Estado para as métricas
  const [metrics, setMetrics] = useState({
    totalSyncedCards: 218,
    totalSyncedPipes: 12,
    lastSuccessfulSync: "2025-04-15T09:30:00",
    syncSuccessRate: 95,
    averageSyncTime: "1m 28s"
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
        description: "A conexão com Pipefy foi estabelecida e autenticada corretamente.",
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
      message: "Sincronização manual concluída. 8 cards atualizados."
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
        ? "A integração com Pipefy foi ativada com sucesso." 
        : "A integração com Pipefy foi desativada."
    });
  };
  
  // Simular desconexão e remoção da integração
  const disconnectIntegration = () => {
    if (confirm("Tem certeza que deseja desconectar esta integração? Todos os dados de configuração serão perdidos.")) {
      toast({
        title: "Integração desconectada",
        description: "A integração com Pipefy foi desconectada com sucesso.",
        variant: "destructive"
      });
      
      setTimeout(() => {
        window.location.href = "/organization/integracoes";
      }, 1500);
    }
  };
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.location.href = "/organization/integracoes"}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        <h1 className="text-3xl font-bold">Pipefy</h1>
        <Badge className={integrationActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
          {integrationActive ? "Ativa" : "Inativa"}
        </Badge>
      </div>
      <p className="text-muted-foreground">Gerencie fluxos de trabalho e processos através do Pipefy</p>
      
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
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <h3 className="font-medium text-purple-800 mb-1">Cards Sincronizados</h3>
                  <p className="text-2xl font-bold text-purple-900">{metrics.totalSyncedCards}</p>
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <h3 className="font-medium text-green-800 mb-1">Taxa de Sucesso</h3>
                  <p className="text-2xl font-bold text-green-900">{metrics.syncSuccessRate}%</p>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-800 mb-1">Tempo Médio</h3>
                  <p className="text-2xl font-bold text-blue-900">{metrics.averageSyncTime}</p>
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
                onClick={() => window.open("https://app.pipefy.com", "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Acessar Pipefy
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
                Configure as credenciais necessárias para conectar ao Pipefy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Informação</AlertTitle>
                  <AlertDescription>
                    Para obter suas credenciais, acesse o portal de desenvolvedores do Pipefy e gere um novo token de API.
                  </AlertDescription>
                </Alert>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="api-token">API Token</Label>
                    <div className="relative">
                      <Input 
                        id="api-token" 
                        type="password" 
                        value={configData.apiToken} 
                        onChange={(e) => setConfigData({...configData, apiToken: e.target.value})}
                      />
                      <Key className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="org-id">ID da Organização</Label>
                    <div className="relative">
                      <Input 
                        id="org-id" 
                        value={configData.organizationId} 
                        onChange={(e) => setConfigData({...configData, organizationId: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="refresh-token">Refresh Token</Label>
                    <div className="relative">
                      <Input 
                        id="refresh-token" 
                        type="password" 
                        value={configData.refreshToken} 
                        onChange={(e) => setConfigData({...configData, refreshToken: e.target.value})}
                      />
                      <Lock className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">URL de Webhook</Label>
                    <Input 
                      id="webhook-url" 
                      value={configData.webhookUrl} 
                      onChange={(e) => setConfigData({...configData, webhookUrl: e.target.value})}
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
                        id="sync-cards" 
                        checked={configData.syncItems.cards} 
                        onCheckedChange={(checked) => {
                          setConfigData({
                            ...configData, 
                            syncItems: {
                              ...configData.syncItems,
                              cards: checked as boolean
                            }
                          });
                        }}
                      />
                      <label
                        htmlFor="sync-cards"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Cards
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="sync-pipes" 
                        checked={configData.syncItems.pipes} 
                        onCheckedChange={(checked) => {
                          setConfigData({
                            ...configData, 
                            syncItems: {
                              ...configData.syncItems,
                              pipes: checked as boolean
                            }
                          });
                        }}
                      />
                      <label
                        htmlFor="sync-pipes"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Pipes
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="sync-phases" 
                        checked={configData.syncItems.phases} 
                        onCheckedChange={(checked) => {
                          setConfigData({
                            ...configData, 
                            syncItems: {
                              ...configData.syncItems,
                              phases: checked as boolean
                            }
                          });
                        }}
                      />
                      <label
                        htmlFor="sync-phases"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Fases
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="sync-fields" 
                        checked={configData.syncItems.fields} 
                        onCheckedChange={(checked) => {
                          setConfigData({
                            ...configData, 
                            syncItems: {
                              ...configData.syncItems,
                              fields: checked as boolean
                            }
                          });
                        }}
                      />
                      <label
                        htmlFor="sync-fields"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Campos
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="sync-members" 
                        checked={configData.syncItems.members} 
                        onCheckedChange={(checked) => {
                          setConfigData({
                            ...configData, 
                            syncItems: {
                              ...configData.syncItems,
                              members: checked as boolean
                            }
                          });
                        }}
                      />
                      <label
                        htmlFor="sync-members"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Membros
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveConfig} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>Salvar Configurações</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Sincronização</CardTitle>
              <CardDescription>
                Histórico das sincronizações realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {syncLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className={`p-3 rounded-md border ${
                      log.status === 'success' ? 'bg-green-50 border-green-200' : 
                      log.status === 'warning' ? 'bg-yellow-50 border-yellow-200' : 
                      'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{formatDate(log.date)}</span>
                      <Badge className={
                        log.status === 'success' ? 'bg-green-100 text-green-800' : 
                        log.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }>
                        {log.status === 'success' ? 'Sucesso' : 
                         log.status === 'warning' ? 'Parcial' : 
                         'Erro'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm">
                      {log.message}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mapping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mapeamento de Dados</CardTitle>
              <CardDescription>
                Configure como os dados são mapeados entre os sistemas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Importante</AlertTitle>
                  <AlertDescription>
                    O mapeamento correto dos campos garante a integridade dos dados sincronizados.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Mapeamento de Campos</h3>
                  
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-2">Campo do Pipefy</th>
                          <th className="text-left p-2">Campo do Sistema</th>
                          <th className="text-left p-2">Tipo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="p-2">Title</td>
                          <td className="p-2">Nome do Registro</td>
                          <td className="p-2">Texto</td>
                        </tr>
                        <tr>
                          <td className="p-2">Due Date</td>
                          <td className="p-2">Data de Vencimento</td>
                          <td className="p-2">Data</td>
                        </tr>
                        <tr>
                          <td className="p-2">Assignee</td>
                          <td className="p-2">Responsável</td>
                          <td className="p-2">Usuário</td>
                        </tr>
                        <tr>
                          <td className="p-2">Labels</td>
                          <td className="p-2">Etiquetas</td>
                          <td className="p-2">Múltipla Escolha</td>
                        </tr>
                        <tr>
                          <td className="p-2">Phase</td>
                          <td className="p-2">Status</td>
                          <td className="p-2">Lista</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="custom-mapping">Mapeamento Personalizado (JSON)</Label>
                  <Textarea 
                    id="custom-mapping" 
                    className="font-mono text-sm h-32"
                    placeholder='{
  "fields": [
    {"pipefy": "card_field_1", "system": "product_name", "type": "text"},
    {"pipefy": "card_field_2", "system": "product_price", "type": "number"}
  ]
}'
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveConfig} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>Salvar Mapeamento</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}