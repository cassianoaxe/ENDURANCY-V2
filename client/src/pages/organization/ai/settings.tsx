import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Settings, Info, Database, Cpu, Key, Shield, Save } from 'lucide-react';
import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Interface para configurações de IA
interface AISettings {
  enabled: boolean;
  model: string;
  apiKey?: string;
  features: {
    chat: boolean;
    contextProcessing: boolean;
    documentAnalysis: boolean;
    ticketAnalysis: boolean;
    reportGeneration: boolean;
    dataVisualization: boolean;
  };
  limits: {
    maxTokens: number;
    requestsPerDay: number;
    contextsPerRequest: number;
  };
  security: {
    dataRetentionDays: number;
    logRequests: boolean;
    personalDataAccess: boolean;
  };
}

// Página de configurações de IA
const AISettingsPage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  
  // Mock da consulta às configurações - em um cenário real, viria do backend
  const { data: settings, isLoading } = useQuery<AISettings>({
    queryKey: ['/api/ai/settings'],
    queryFn: async () => {
      try {
        // Simulação de uma chamada API
        return {
          enabled: true,
          model: 'gpt-4o',
          features: {
            chat: true,
            contextProcessing: true,
            documentAnalysis: true,
            ticketAnalysis: true,
            reportGeneration: true,
            dataVisualization: false,
          },
          limits: {
            maxTokens: 4000,
            requestsPerDay: 500,
            contextsPerRequest: 5,
          },
          security: {
            dataRetentionDays: 30,
            logRequests: true,
            personalDataAccess: false,
          }
        };
      } catch (error) {
        console.error('Erro ao carregar configurações de IA:', error);
        throw new Error('Não foi possível carregar as configurações de IA');
      }
    }
  });
  
  // Estado local para configurações editáveis
  const [localSettings, setLocalSettings] = useState<Partial<AISettings>>({});
  
  // Atualizar configurações locais quando as configurações do servidor forem carregadas
  React.useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);
  
  // Mutação para salvar configurações
  const updateMutation = useMutation({
    mutationFn: async (newSettings: Partial<AISettings>) => {
      // Simulação de uma chamada API
      await new Promise(resolve => setTimeout(resolve, 1000));
      return newSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/settings'] });
      toast({
        title: 'Configurações salvas',
        description: 'As configurações de IA foram atualizadas com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Handler para salvar configurações
  const handleSaveSettings = () => {
    updateMutation.mutate(localSettings);
  };
  
  // Atualizar configuração local
  const updateSetting = (path: string[], value: any) => {
    setLocalSettings(prev => {
      const newSettings = { ...prev };
      let current = newSettings as any;
      
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {};
        }
        current = current[path[i]];
      }
      
      current[path[path.length - 1]] = value;
      return newSettings;
    });
  };
  
  // Renderizar esqueleto de carregamento
  const renderLoading = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
  
  if (isLoading) {
    return (
      <OrganizationLayout>
        <div className="container mx-auto py-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Configurações de IA</h1>
            <Skeleton className="h-10 w-[150px]" />
          </div>
          {renderLoading()}
        </div>
      </OrganizationLayout>
    );
  }
  
  return (
    <OrganizationLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Configurações de IA</h1>
          <Button 
            disabled={updateMutation.isPending} 
            onClick={handleSaveSettings}
            className="flex items-center gap-2"
          >
            {updateMutation.isPending ? (
              <>Salvando...</>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Salvar configurações</span>
              </>
            )}
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Geral</span>
            </TabsTrigger>
            <TabsTrigger value="models" className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              <span>Modelos</span>
            </TabsTrigger>
            <TabsTrigger value="limits" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>Limites</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Segurança</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>
                  Configure as opções gerais do módulo de inteligência artificial
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ai-enabled">Ativar Inteligência Artificial</Label>
                    <p className="text-sm text-muted-foreground">
                      Habilita ou desabilita todos os recursos de IA na plataforma
                    </p>
                  </div>
                  <Switch 
                    id="ai-enabled" 
                    checked={localSettings.enabled} 
                    onCheckedChange={(value) => updateSetting(['enabled'], value)}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <Label htmlFor="api-key">Chave da API (OpenAI)</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="api-key"
                        type={isKeyVisible ? "text" : "password"}
                        placeholder="sk-..."
                        value={localSettings.apiKey || ''}
                        onChange={(e) => updateSetting(['apiKey'], e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setIsKeyVisible(!isKeyVisible)}
                      >
                        {isKeyVisible ? 'Ocultar' : 'Mostrar'}
                      </Button>
                    </div>
                    <Button variant="outline">Verificar</Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Esta chave é usada para acessar a API da OpenAI. Se não for fornecida, o sistema usará a chave padrão.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recursos</CardTitle>
                <CardDescription>
                  Ative ou desative recursos específicos de IA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="feature-chat" className="flex-1">Assistente de Chat</Label>
                    <Switch 
                      id="feature-chat" 
                      checked={localSettings.features?.chat} 
                      onCheckedChange={(value) => updateSetting(['features', 'chat'], value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="feature-context" className="flex-1">Processamento Multi-Contexto</Label>
                    <Switch 
                      id="feature-context" 
                      checked={localSettings.features?.contextProcessing} 
                      onCheckedChange={(value) => updateSetting(['features', 'contextProcessing'], value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="feature-document" className="flex-1">Análise de Documentos</Label>
                    <Switch 
                      id="feature-document" 
                      checked={localSettings.features?.documentAnalysis} 
                      onCheckedChange={(value) => updateSetting(['features', 'documentAnalysis'], value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="feature-ticket" className="flex-1">Análise de Tickets</Label>
                    <Switch 
                      id="feature-ticket" 
                      checked={localSettings.features?.ticketAnalysis} 
                      onCheckedChange={(value) => updateSetting(['features', 'ticketAnalysis'], value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="feature-report" className="flex-1">Geração de Relatórios</Label>
                    <Switch 
                      id="feature-report" 
                      checked={localSettings.features?.reportGeneration} 
                      onCheckedChange={(value) => updateSetting(['features', 'reportGeneration'], value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="feature-visualization" className="flex-1">Visualização de Dados</Label>
                    <Switch 
                      id="feature-visualization" 
                      checked={localSettings.features?.dataVisualization} 
                      onCheckedChange={(value) => updateSetting(['features', 'dataVisualization'], value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="models" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Modelo de IA</CardTitle>
                <CardDescription>
                  Configure qual modelo de IA será utilizado para processamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-model">Modelo Padrão</Label>
                  <Select 
                    value={localSettings.model} 
                    onValueChange={(value) => updateSetting(['model'], value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                      <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                      <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    O modelo selecionado será usado para todas as operações de IA
                  </p>
                </div>
                
                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Sobre os modelos</AlertTitle>
                  <AlertDescription>
                    Modelos mais avançados (como GPT-4o e Claude 3 Opus) oferecem melhor qualidade, mas consomem mais tokens e podem ter custo maior.
                  </AlertDescription>
                </Alert>
                
                <div className="mt-6 space-y-4">
                  <h3 className="text-sm font-medium">Comparativo de modelos</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-muted p-2 rounded">
                      <p className="font-medium">GPT-3.5 Turbo</p>
                      <p className="text-muted-foreground">Rápido, econômico, bom para tarefas simples</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="font-medium">GPT-4o</p>
                      <p className="text-muted-foreground">Multimodal, alta qualidade, melhor raciocínio</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="font-medium">Claude 3 Haiku</p>
                      <p className="text-muted-foreground">Rápido, bom para tarefas cotidianas</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="font-medium">Claude 3 Sonnet</p>
                      <p className="text-muted-foreground">Equilibrado em velocidade e qualidade</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="font-medium">Claude 3 Opus</p>
                      <p className="text-muted-foreground">Máxima qualidade, melhor para tarefas complexas</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="limits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Limites e Consumo</CardTitle>
                <CardDescription>
                  Configure limites de uso para os recursos de IA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="max-tokens">Limite de tokens por solicitação</Label>
                  <Input
                    id="max-tokens"
                    type="number"
                    value={localSettings.limits?.maxTokens || 0}
                    onChange={(e) => updateSetting(['limits', 'maxTokens'], parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Número máximo de tokens que podem ser processados em uma única solicitação
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="requests-per-day">Solicitações por dia</Label>
                  <Input
                    id="requests-per-day"
                    type="number"
                    value={localSettings.limits?.requestsPerDay || 0}
                    onChange={(e) => updateSetting(['limits', 'requestsPerDay'], parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Limite diário de solicitações à API de IA
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contexts-per-request">Contextos por solicitação</Label>
                  <Input
                    id="contexts-per-request"
                    type="number"
                    value={localSettings.limits?.contextsPerRequest || 0}
                    onChange={(e) => updateSetting(['limits', 'contextsPerRequest'], parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Número máximo de contextos diferentes que podem ser processados em uma única solicitação
                  </p>
                </div>
                
                <Alert className="mt-4 bg-amber-50">
                  <Info className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800">Atenção ao uso</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    O consumo excessivo de recursos de IA pode impactar seus custos. Configure limites adequados ao seu plano.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Uso</CardTitle>
                <CardDescription>
                  Visualize o uso atual dos recursos de IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tokens usados (mês atual)</span>
                    <Badge variant="outline">438,291 / 1,000,000</Badge>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div className="w-[43%] h-full bg-primary rounded-full"></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Solicitações feitas hoje</span>
                    <Badge variant="outline">127 / 500</Badge>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div className="w-[25%] h-full bg-primary rounded-full"></div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Distribuição de uso por recurso</h4>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Chat (45%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Análise (30%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                        <span>Relatórios (15%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span>Tickets (5%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                        <span>Outros (5%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Segurança</CardTitle>
                <CardDescription>
                  Configure opções de segurança e privacidade para o módulo de IA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="data-retention">Retenção de dados (dias)</Label>
                  <Input
                    id="data-retention"
                    type="number"
                    value={localSettings.security?.dataRetentionDays || 0}
                    onChange={(e) => updateSetting(['security', 'dataRetentionDays'], parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Período em dias que os dados de solicitações de IA são armazenados antes de serem automaticamente excluídos
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="log-requests">Registrar solicitações</Label>
                    <p className="text-sm text-muted-foreground">
                      Armazena um log de todas as solicitações feitas à API de IA
                    </p>
                  </div>
                  <Switch 
                    id="log-requests" 
                    checked={localSettings.security?.logRequests} 
                    onCheckedChange={(value) => updateSetting(['security', 'logRequests'], value)}
                  />
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="personal-data">Acesso a dados pessoais</Label>
                    <p className="text-sm text-muted-foreground">
                      Permite que a IA acesse dados pessoais de pacientes e funcionários
                    </p>
                  </div>
                  <Switch 
                    id="personal-data" 
                    checked={localSettings.security?.personalDataAccess} 
                    onCheckedChange={(value) => updateSetting(['security', 'personalDataAccess'], value)}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Prompt de Conformidade</CardTitle>
                <CardDescription>
                  Configure o prompt de sistema para garantir conformidade com políticas da empresa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="min-h-[200px]"
                  placeholder="Digite aqui o prompt de sistema que será incluído em todas as solicitações para garantir conformidade..."
                  defaultValue="Você é um assistente da Endurancy, uma plataforma de gestão para empresas do setor medicinal. Respeite sempre as normas da ANVISA e LGPD. Não forneça conselhos médicos definitivos. Sempre indique que suas respostas são sugestões e que decisões médicas devem ser tomadas por profissionais qualificados. Mantenha confidencialidade absoluta sobre dados de pacientes."
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Este prompt será incluído em todas as solicitações à API de IA para garantir que as respostas estejam em conformidade com as políticas da empresa e regulamentações aplicáveis.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
};

export default AISettingsPage;