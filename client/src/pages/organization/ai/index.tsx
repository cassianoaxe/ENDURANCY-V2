import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Send, BrainCircuit, Search, FileBarChart, Lightbulb, MessageSquare, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Definindo o enum para os tipos de contexto
enum ContextType {
  FINANCIAL = "financial",
  TICKETS = "tickets",
  INVENTORY = "inventory",
  PATIENTS = "patients",
  DOCUMENTS = "documents",
  ALL = "all"
}

// Interface para as solicitações de IA
interface AIRequest {
  query: string;
  contextTypes: ContextType[];
  additionalContext?: Record<string, any>;
}

// Interface para as respostas de IA
interface AIResponse {
  success: boolean;
  response?: string;
  error?: string;
  metadata?: {
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
    model?: string;
    contextTypes?: ContextType[];
  };
}

// Interface para análise de tickets
interface TicketAnalysis {
  success: boolean;
  ticketId: number;
  analysis?: {
    suggestedCategory: string;
    suggestedPriority: string;
    estimatedTimeToResolve: string;
    possibleSolutions: string[];
    additionalInsights: string;
  };
  error?: string;
}

// Interface para o status do módulo de IA
interface AIStatus {
  enabled: boolean;
  model: string;
  features: string[];
}

const AIModulePage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('chat');
  const [query, setQuery] = useState('');
  const [selectedContexts, setSelectedContexts] = useState<ContextType[]>([ContextType.ALL]);
  const [ticketId, setTicketId] = useState<string>('');
  const [reportType, setReportType] = useState<string>('financial');

  // Verificar o status do módulo de IA
  const { data: aiStatus, isLoading: statusLoading } = useQuery<AIStatus>({
    queryKey: ['/api/ai/status'],
    queryFn: async () => {
      try {
        const res = await apiRequest('/api/ai/status');
        return res;
      } catch (error) {
        console.error('Erro ao verificar status do módulo de IA:', error);
        return { enabled: false, model: 'Indisponível', features: [] };
      }
    }
  });

  // Mutação para processar consultas de IA
  const processMutation = useMutation({
    mutationFn: async (requestData: AIRequest) => {
      const res = await apiRequest('/api/ai/process', { 
        method: 'POST',
        data: requestData 
      });
      return res as AIResponse;
    },
    onSuccess: () => {
      toast({
        title: 'Consulta processada',
        description: 'A resposta foi gerada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro no processamento',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutação para analisar tickets
  const analyzeTicketMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest(`/api/ai/analyze-ticket/${id}`);
      return res as TicketAnalysis;
    },
    onSuccess: () => {
      toast({
        title: 'Ticket analisado',
        description: 'A análise do ticket foi concluída com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro na análise',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutação para gerar relatórios
  const generateReportMutation = useMutation({
    mutationFn: async (data: { reportType: string; timePeriod: { start: string; end: string } }) => {
      const res = await apiRequest('/api/ai/generate-report', { 
        method: 'POST', 
        data 
      });
      return res;
    },
    onSuccess: () => {
      toast({
        title: 'Relatório gerado',
        description: 'O relatório foi gerado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro na geração',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Handler para enviar consulta
  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast({
        title: 'Consulta vazia',
        description: 'Por favor, digite sua pergunta ou solicitação.',
        variant: 'destructive',
      });
      return;
    }

    processMutation.mutate({
      query,
      contextTypes: selectedContexts
    });
  };

  // Handler para analisar ticket
  const handleAnalyzeTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(ticketId);
    if (isNaN(id) || id <= 0) {
      toast({
        title: 'ID inválido',
        description: 'Por favor, forneça um ID de ticket válido.',
        variant: 'destructive',
      });
      return;
    }

    analyzeTicketMutation.mutate(id);
  };

  // Handler para gerar relatório
  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    // Definindo o período como os últimos 30 dias
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    generateReportMutation.mutate({
      reportType,
      timePeriod: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      }
    });
  };

  // Renderizar o status do módulo
  const renderStatus = () => {
    if (statusLoading) {
      return (
        <div className="flex items-center space-x-4 mb-6">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-start gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
        <BrainCircuit className="h-10 w-10 text-primary" />
        <div>
          <h2 className="text-xl font-semibold">Módulo de IA</h2>
          <p className="text-muted-foreground">
            Status: {aiStatus?.enabled ? 
              <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">Ativo</Badge> : 
              <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100">Inativo</Badge>
            }
          </p>
          <p className="text-sm text-muted-foreground">Modelo: {aiStatus?.model || 'Não disponível'}</p>
          <div className="mt-2">
            <p className="text-sm font-medium">Recursos disponíveis:</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {aiStatus?.features?.map((feature, index) => (
                <Badge key={index} variant="secondary">{feature}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <OrganizationLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Inteligência Artificial</h1>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="flex items-center gap-2">
              <a href="/organization/ai/settings">
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </a>
            </Button>
            <Button asChild variant="default" className="flex items-center gap-2">
              <a href="/organization/ai/assistant">
                <MessageSquare className="h-4 w-4" />
                <span>Abrir Assistente</span>
              </a>
            </Button>
          </div>
        </div>
        
        {renderStatus()}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              <span>Processamento</span>
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span>Análise de Tickets</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileBarChart className="h-4 w-4" />
              <span>Relatórios</span>
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span>Sugestões</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Multi-Context Processing</CardTitle>
                <CardDescription>
                  Faça perguntas ou solicite análises baseadas em múltiplos contextos da sua organização
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleQuerySubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contexts">Contextos a serem consultados</Label>
                    <Select 
                      value={selectedContexts.includes(ContextType.ALL) ? ContextType.ALL : selectedContexts[0]}
                      onValueChange={(value) => setSelectedContexts([value as ContextType])}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione os contextos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ContextType.ALL}>Todos os contextos</SelectItem>
                        <SelectItem value={ContextType.FINANCIAL}>Financeiro</SelectItem>
                        <SelectItem value={ContextType.TICKETS}>Tickets de Suporte</SelectItem>
                        <SelectItem value={ContextType.INVENTORY}>Inventário</SelectItem>
                        <SelectItem value={ContextType.PATIENTS}>Pacientes</SelectItem>
                        <SelectItem value={ContextType.DOCUMENTS}>Documentos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="query">Sua pergunta ou solicitação</Label>
                    <Textarea
                      id="query"
                      placeholder="Ex: Análise a evolução financeira do último trimestre e sugira áreas para otimização"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setQuery('')}>Limpar</Button>
                <Button 
                  type="submit" 
                  onClick={handleQuerySubmit}
                  disabled={processMutation.isPending || !query.trim() || !aiStatus?.enabled}
                >
                  {processMutation.isPending ? 'Processando...' : 'Processar consulta'}
                </Button>
              </CardFooter>
            </Card>
            
            {processMutation.data && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Resposta</CardTitle>
                  <CardDescription>
                    Informações processadas com base nos contextos selecionados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {processMutation.data.success ? (
                      <div className="whitespace-pre-wrap p-4 bg-muted rounded-md">
                        {processMutation.data.response}
                      </div>
                    ) : (
                      <div className="text-red-500 p-4 bg-red-50 rounded-md">
                        Erro: {processMutation.data.error}
                      </div>
                    )}
                    
                    {processMutation.data.metadata && (
                      <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                        <p>Modelo: {processMutation.data.metadata.model}</p>
                        {processMutation.data.metadata.usage && (
                          <p>Tokens utilizados: {processMutation.data.metadata.usage.total_tokens}</p>
                        )}
                        <p>Contextos consultados: {processMutation.data.metadata.contextTypes?.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Tickets</CardTitle>
                <CardDescription>
                  Utilize IA para analisar tickets e obter insights sobre prioridade, categoria e possíveis soluções
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAnalyzeTicket} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ticketId">ID do Ticket</Label>
                    <Input
                      id="ticketId"
                      placeholder="Ex: 12345"
                      value={ticketId}
                      onChange={(e) => setTicketId(e.target.value)}
                    />
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setTicketId('')}>Limpar</Button>
                <Button 
                  type="submit" 
                  onClick={handleAnalyzeTicket}
                  disabled={analyzeTicketMutation.isPending || !ticketId.trim() || !aiStatus?.enabled}
                >
                  {analyzeTicketMutation.isPending ? 'Analisando...' : 'Analisar ticket'}
                </Button>
              </CardFooter>
            </Card>
            
            {analyzeTicketMutation.data && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Análise do Ticket #{analyzeTicketMutation.data.ticketId}</CardTitle>
                  <CardDescription>
                    Insights gerados por IA sobre o ticket solicitado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analyzeTicketMutation.data.success && analyzeTicketMutation.data.analysis ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-muted-foreground">Categoria Sugerida</h4>
                          <Badge variant="outline" className="text-base font-normal">
                            {analyzeTicketMutation.data.analysis.suggestedCategory}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-muted-foreground">Prioridade Sugerida</h4>
                          <Badge 
                            variant="outline" 
                            className={`text-base font-normal ${
                              analyzeTicketMutation.data.analysis.suggestedPriority.toLowerCase() === 'alta' || 
                              analyzeTicketMutation.data.analysis.suggestedPriority.toLowerCase() === 'crítica' 
                                ? 'bg-red-50 text-red-700' 
                                : analyzeTicketMutation.data.analysis.suggestedPriority.toLowerCase() === 'média'
                                  ? 'bg-yellow-50 text-yellow-700'
                                  : 'bg-green-50 text-green-700'
                            }`}
                          >
                            {analyzeTicketMutation.data.analysis.suggestedPriority}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-muted-foreground">Tempo Estimado para Resolução</h4>
                        <p>{analyzeTicketMutation.data.analysis.estimatedTimeToResolve}</p>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-muted-foreground">Possíveis Soluções</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {analyzeTicketMutation.data.analysis.possibleSolutions.map((solution, index) => (
                            <li key={index}>{solution}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-muted-foreground">Insights Adicionais</h4>
                        <p className="whitespace-pre-wrap">{analyzeTicketMutation.data.analysis.additionalInsights}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-500 p-4 bg-red-50 rounded-md">
                      Erro: {analyzeTicketMutation.data.error}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Geração de Relatórios</CardTitle>
                <CardDescription>
                  Gere relatórios detalhados com insights baseados em dados da sua organização
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerateReport} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reportType">Tipo de Relatório</Label>
                    <Select 
                      value={reportType}
                      onValueChange={setReportType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de relatório" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="financial">Financeiro</SelectItem>
                        <SelectItem value="patients">Pacientes</SelectItem>
                        <SelectItem value="inventory">Inventário</SelectItem>
                        <SelectItem value="tickets">Tickets de Suporte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    O relatório será gerado considerando os últimos 30 dias de dados.
                  </p>
                </form>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  type="submit" 
                  onClick={handleGenerateReport}
                  disabled={generateReportMutation.isPending || !aiStatus?.enabled}
                >
                  {generateReportMutation.isPending ? 'Gerando...' : 'Gerar relatório'}
                </Button>
              </CardFooter>
            </Card>
            
            {generateReportMutation.data && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Relatório: {generateReportMutation.data.reportType}</CardTitle>
                  <CardDescription>
                    {generateReportMutation.data.metadata?.timePeriod && (
                      <>
                        Período: {new Date(generateReportMutation.data.metadata.timePeriod.start).toLocaleDateString()} 
                        {' a '} 
                        {new Date(generateReportMutation.data.metadata.timePeriod.end).toLocaleDateString()}
                      </>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {generateReportMutation.data.success ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {/* A resposta é em formato markdown, então idealmente deveria ser processada com um parser markdown */}
                      <div className="whitespace-pre-wrap">{generateReportMutation.data.report}</div>
                    </div>
                  ) : (
                    <div className="text-red-500 p-4 bg-red-50 rounded-md">
                      Erro: {generateReportMutation.data.error}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  Relatório gerado em: {generateReportMutation.data.metadata?.generatedAt && 
                    new Date(generateReportMutation.data.metadata.generatedAt).toLocaleString()}
                </CardFooter>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sugestões Inteligentes</CardTitle>
                <CardDescription>
                  Receba sugestões personalizadas para otimizar a gestão da sua organização
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>
                    Esta funcionalidade fornece sugestões contextuais com base em diferentes áreas da sua organização.
                    Selecione um contexto para receber sugestões personalizadas.
                  </p>
                  
                  <div className="flex flex-wrap gap-4 mt-4">
                    <Button variant="outline" className="flex items-center gap-2">
                      <FileBarChart className="h-4 w-4" />
                      Dashboard
                    </Button>
                    
                    <Button variant="outline" className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Pacientes
                    </Button>
                    
                    <Button variant="outline" className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Inventário
                    </Button>
                    
                    <Button variant="outline" className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Financeiro
                    </Button>
                  </div>
                  
                  <div className="mt-8 p-4 bg-muted rounded-lg">
                    <p className="text-center text-muted-foreground">
                      Selecione um contexto para receber sugestões personalizadas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
};

export default AIModulePage;