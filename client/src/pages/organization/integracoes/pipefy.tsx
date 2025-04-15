"use client";
import { useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Check, 
  RefreshCw, 
  Info, 
  AlertCircle, 
  RotateCw, 
  ListChecks,
  Copy,
  ExternalLink,
  Key,
  Lock,
  Plus,
  Trash2
} from "lucide-react";

export default function PipefyIntegracao() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("config");
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  // Estado para os dados de configuração
  const [configData, setConfigData] = useState({
    apiKey: "",
    organizationId: "",
    webhookUrl: "https://endurancy.replit.app/api/webhooks/pipefy",
    pipeIds: ["301928", "301929"],
    syncInterval: "hourly",
    notifyOnCardUpdate: true,
    notifyOnCardCreation: true,
    notifyOnCardMovement: true,
    notifyOnCommentCreation: false
  });
  
  // Estado para o mapeamento de campos
  const [fieldMappings, setFieldMappings] = useState([
    { pipefyField: "title", systemField: "nome", required: true },
    { pipefyField: "email", systemField: "email", required: true },
    { pipefyField: "phone", systemField: "telefone", required: false },
    { pipefyField: "company", systemField: "empresa", required: false }
  ]);
  
  // Estado para automações
  const [automations, setAutomations] = useState([
    { 
      id: 1,
      name: "Novo lead",
      trigger: "card.create",
      pipe: "301928",
      phase: "Novos Leads",
      action: "Enviar notificação por email",
      enabled: true
    },
    { 
      id: 2,
      name: "Lead convertido", 
      trigger: "card.move",
      pipe: "301928",
      phase: "Convertido",
      action: "Adicionar tag 'cliente'",
      enabled: true
    },
    { 
      id: 3,
      name: "Reunião agendada", 
      trigger: "field.update",
      pipe: "301928",
      field: "meeting_date",
      action: "Enviar evento para Google Calendar",
      enabled: false
    }
  ]);
  
  // Função para salvar configuração
  const saveConfig = () => {
    setIsSaving(true);
    
    // Simulando um atraso na API
    setTimeout(() => {
      setIsSaving(false);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações da integração foram salvas com sucesso."
      });
    }, 1500);
  };
  
  // Função para testar conexão
  const testConnection = () => {
    if (!configData.apiKey) {
      toast({
        title: "Chave API não definida",
        description: "Por favor, insira sua chave API do Pipefy para testar a conexão.",
        variant: "destructive"
      });
      return;
    }
    
    setIsTesting(true);
    
    // Simulando um atraso na API
    setTimeout(() => {
      setIsTesting(false);
      setIsConnected(true);
      
      toast({
        title: "Conexão bem-sucedida",
        description: "A conexão com o Pipefy foi estabelecida com sucesso."
      });
    }, 2000);
  };
  
  // Função para adicionar mapeamento de campo
  const addFieldMapping = () => {
    setFieldMappings([
      ...fieldMappings,
      { pipefyField: "", systemField: "", required: false }
    ]);
  };
  
  // Função para remover mapeamento de campo
  const removeFieldMapping = (index: number) => {
    const updatedMappings = [...fieldMappings];
    updatedMappings.splice(index, 1);
    setFieldMappings(updatedMappings);
  };
  
  // Função para adicionar automação
  const addAutomation = () => {
    const newId = automations.length > 0 ? Math.max(...automations.map(a => a.id)) + 1 : 1;
    
    setAutomations([
      ...automations,
      {
        id: newId,
        name: "Nova automação",
        trigger: "card.create",
        pipe: "301928",
        phase: "",
        action: "Enviar notificação por email",
        enabled: false
      }
    ]);
  };
  
  // Função para remover automação
  const removeAutomation = (id: number) => {
    const updatedAutomations = automations.filter(automation => automation.id !== id);
    setAutomations(updatedAutomations);
  };
  
  // Função para atualizar uma automação
  const updateAutomation = (id: number, field: string, value: any) => {
    const updatedAutomations = automations.map(automation => {
      if (automation.id === id) {
        return { ...automation, [field]: value };
      }
      return automation;
    });
    
    setAutomations(updatedAutomations);
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
        <Badge className={isConnected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
          {isConnected ? "Conectado" : "Não conectado"}
        </Badge>
      </div>
      <p className="text-muted-foreground">Integre sua gestão de processos e automações com o Pipefy</p>
      
      <Tabs defaultValue="config" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="fields">Mapeamento de Campos</TabsTrigger>
          <TabsTrigger value="automations">Automações</TabsTrigger>
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
                  <AlertTitle>Acesso à API</AlertTitle>
                  <AlertDescription>
                    Para obter sua chave API, acesse o Pipefy, vá para Configurações &gt; Chaves de API e gere uma nova chave.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <Label htmlFor="api-key">Chave API</Label>
                  <div className="relative">
                    <Input 
                      id="api-key" 
                      type="password"
                      value={configData.apiKey}
                      onChange={(e) => setConfigData({...configData, apiKey: e.target.value})}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    />
                    <Key className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="organization-id">ID da Organização (opcional)</Label>
                  <Input 
                    id="organization-id" 
                    value={configData.organizationId}
                    onChange={(e) => setConfigData({...configData, organizationId: e.target.value})}
                    placeholder="123456"
                  />
                  <p className="text-xs text-muted-foreground">
                    Se não for fornecido, usaremos a organização padrão associada à chave API.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">URL do Webhook</Label>
                  <div className="flex">
                    <Input 
                      id="webhook-url" 
                      value={configData.webhookUrl}
                      readOnly
                      className="font-mono text-xs flex-1 rounded-r-none"
                    />
                    <Button 
                      variant="outline" 
                      className="rounded-l-none"
                      onClick={() => {
                        navigator.clipboard.writeText(configData.webhookUrl);
                        toast({
                          title: "URL copiada",
                          description: "URL do webhook copiada para a área de transferência."
                        });
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Configure este webhook no Pipefy para receber atualizações em tempo real.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>IDs dos Pipes</Label>
                  <div className="space-y-2">
                    {configData.pipeIds.map((pipeId, index) => (
                      <div key={index} className="flex gap-2">
                        <Input 
                          value={pipeId}
                          onChange={(e) => {
                            const newPipeIds = [...configData.pipeIds];
                            newPipeIds[index] = e.target.value;
                            setConfigData({...configData, pipeIds: newPipeIds});
                          }}
                          placeholder="ID do pipe"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => {
                            const newPipeIds = configData.pipeIds.filter((_, i) => i !== index);
                            setConfigData({...configData, pipeIds: newPipeIds});
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        setConfigData({
                          ...configData, 
                          pipeIds: [...configData.pipeIds, ""]
                        });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar Pipe
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="sync-interval">Intervalo de Sincronização</Label>
                  <select 
                    id="sync-interval"
                    className="w-full p-2 border rounded-md"
                    value={configData.syncInterval}
                    onChange={(e) => setConfigData({...configData, syncInterval: e.target.value})}
                  >
                    <option value="realtime">Tempo real (via webhook)</option>
                    <option value="hourly">A cada hora</option>
                    <option value="daily">Diariamente</option>
                    <option value="manual">Apenas manual</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label className="block mb-2">Notificações</Label>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-update" className="flex-1">Notificar atualização de cards</Label>
                    <Switch 
                      id="notify-update"
                      checked={configData.notifyOnCardUpdate}
                      onCheckedChange={(checked) => 
                        setConfigData({...configData, notifyOnCardUpdate: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-creation" className="flex-1">Notificar criação de cards</Label>
                    <Switch 
                      id="notify-creation"
                      checked={configData.notifyOnCardCreation}
                      onCheckedChange={(checked) => 
                        setConfigData({...configData, notifyOnCardCreation: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-movement" className="flex-1">Notificar movimentação de cards</Label>
                    <Switch 
                      id="notify-movement"
                      checked={configData.notifyOnCardMovement}
                      onCheckedChange={(checked) => 
                        setConfigData({...configData, notifyOnCardMovement: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-comment" className="flex-1">Notificar novos comentários</Label>
                    <Switch 
                      id="notify-comment"
                      checked={configData.notifyOnCommentCreation}
                      onCheckedChange={(checked) => 
                        setConfigData({...configData, notifyOnCommentCreation: checked})
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={testConnection} 
                disabled={isTesting}
              >
                {isTesting ? (
                  <>
                    <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                    Testando...
                  </>
                ) : (
                  <>Testar Conexão</>
                )}
              </Button>
              
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Documentação</CardTitle>
                <CardDescription>
                  Recursos úteis para a integração
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open("https://developers.pipefy.com/", "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Documentação da API
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open("https://pipefy.com/help/", "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Centro de Ajuda
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Status da Integração</CardTitle>
                <CardDescription>
                  Informações sobre o estado atual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Saúde da Conexão</span>
                      <span className="text-sm font-medium">
                        {isConnected ? "100%" : "0%"}
                      </span>
                    </div>
                    <Progress value={isConnected ? 100 : 0} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Acesso à API:</span>
                    <Badge className={isConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {isConnected ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Webhook:</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Não verificado
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Pipes monitorados:</span>
                    <span className="font-medium">{configData.pipeIds.filter(id => id).length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="fields" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mapeamento de Campos</CardTitle>
              <CardDescription>
                Configure como os campos do Pipefy são mapeados para o sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Importante</AlertTitle>
                  <AlertDescription>
                    O mapeamento correto dos campos é essencial para que os dados sejam sincronizados adequadamente entre os sistemas.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  {fieldMappings.map((mapping, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-5 space-y-1">
                        <Label htmlFor={`pipefy-field-${index}`}>Campo no Pipefy</Label>
                        <Input 
                          id={`pipefy-field-${index}`}
                          value={mapping.pipefyField}
                          onChange={(e) => {
                            const newMappings = [...fieldMappings];
                            newMappings[index].pipefyField = e.target.value;
                            setFieldMappings(newMappings);
                          }}
                          placeholder="Ex: title, email, phone"
                        />
                      </div>
                      
                      <div className="col-span-5 space-y-1">
                        <Label htmlFor={`system-field-${index}`}>Campo no Sistema</Label>
                        <Input 
                          id={`system-field-${index}`}
                          value={mapping.systemField}
                          onChange={(e) => {
                            const newMappings = [...fieldMappings];
                            newMappings[index].systemField = e.target.value;
                            setFieldMappings(newMappings);
                          }}
                          placeholder="Ex: nome, email, telefone"
                        />
                      </div>
                      
                      <div className="col-span-1 pt-7">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`required-${index}`}
                            checked={mapping.required}
                            onCheckedChange={(checked) => {
                              const newMappings = [...fieldMappings];
                              newMappings[index].required = checked as boolean;
                              setFieldMappings(newMappings);
                            }}
                          />
                          <Label htmlFor={`required-${index}`} className="text-xs">Obrigatório</Label>
                        </div>
                      </div>
                      
                      <div className="col-span-1 pt-7">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFieldMapping(index)}
                          disabled={index < 2} // Não permitir remover os dois primeiros mapeamentos
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={addFieldMapping}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Campo
                  </Button>
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
        
        <TabsContent value="automations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automações</CardTitle>
              <CardDescription>
                Configure ações automáticas baseadas em eventos do Pipefy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <ListChecks className="h-4 w-4" />
                  <AlertTitle>Automações</AlertTitle>
                  <AlertDescription>
                    As automações permitem que você defina ações a serem executadas quando determinados eventos ocorrem no Pipefy.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  {automations.map((automation) => (
                    <div key={automation.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{automation.name}</h3>
                          <Badge className={automation.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {automation.enabled ? "Ativa" : "Inativa"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={automation.enabled}
                            onCheckedChange={(checked) => 
                              updateAutomation(automation.id, 'enabled', checked)
                            }
                          />
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeAutomation(automation.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor={`automation-name-${automation.id}`}>Nome da Automação</Label>
                          <Input 
                            id={`automation-name-${automation.id}`}
                            value={automation.name}
                            onChange={(e) => updateAutomation(automation.id, 'name', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label htmlFor={`automation-trigger-${automation.id}`}>Tipo de Gatilho</Label>
                          <select 
                            id={`automation-trigger-${automation.id}`}
                            className="w-full p-2 border rounded-md"
                            value={automation.trigger}
                            onChange={(e) => updateAutomation(automation.id, 'trigger', e.target.value)}
                          >
                            <option value="card.create">Criação de Card</option>
                            <option value="card.move">Movimentação de Card</option>
                            <option value="field.update">Atualização de Campo</option>
                            <option value="card.expired">Card Expirado</option>
                            <option value="comment.create">Novo Comentário</option>
                          </select>
                        </div>
                        
                        <div className="space-y-1">
                          <Label htmlFor={`automation-pipe-${automation.id}`}>Pipe</Label>
                          <select 
                            id={`automation-pipe-${automation.id}`}
                            className="w-full p-2 border rounded-md"
                            value={automation.pipe}
                            onChange={(e) => updateAutomation(automation.id, 'pipe', e.target.value)}
                          >
                            {configData.pipeIds.map((pipeId, index) => (
                              <option key={index} value={pipeId}>
                                {pipeId || `Pipe ${index + 1}`}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {automation.trigger === 'card.move' && (
                          <div className="space-y-1">
                            <Label htmlFor={`automation-phase-${automation.id}`}>Fase do Card</Label>
                            <Input 
                              id={`automation-phase-${automation.id}`}
                              value={automation.phase}
                              onChange={(e) => updateAutomation(automation.id, 'phase', e.target.value)}
                              placeholder="Nome ou ID da fase"
                            />
                          </div>
                        )}
                        
                        {automation.trigger === 'field.update' && (
                          <div className="space-y-1">
                            <Label htmlFor={`automation-field-${automation.id}`}>Campo</Label>
                            <Input 
                              id={`automation-field-${automation.id}`}
                              value={automation.field || ''}
                              onChange={(e) => updateAutomation(automation.id, 'field', e.target.value)}
                              placeholder="ID ou nome do campo"
                            />
                          </div>
                        )}
                        
                        <div className="space-y-1 md:col-span-2">
                          <Label htmlFor={`automation-action-${automation.id}`}>Ação</Label>
                          <select 
                            id={`automation-action-${automation.id}`}
                            className="w-full p-2 border rounded-md"
                            value={automation.action}
                            onChange={(e) => updateAutomation(automation.id, 'action', e.target.value)}
                          >
                            <option value="Enviar notificação por email">Enviar notificação por email</option>
                            <option value="Adicionar tag 'cliente'">Adicionar tag</option>
                            <option value="Atualizar campo no sistema">Atualizar campo no sistema</option>
                            <option value="Criar tarefa no sistema">Criar tarefa no sistema</option>
                            <option value="Enviar evento para Google Calendar">Enviar evento para Google Calendar</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    onClick={addAutomation}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Automação
                  </Button>
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
                  <>Salvar Automações</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}