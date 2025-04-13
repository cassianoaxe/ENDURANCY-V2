'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Download, 
  FileBarChart, 
  MessageSquare, 
  LineChart as LineChartIcon,
  Sparkles, 
  Brain, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  Search,
  ChevronRight,
  LightbulbIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const LineChartPlaceholder = ({ data }: { data: any }) => (
  <div className="w-full h-64 bg-muted/20 rounded-md border flex items-center justify-center">
    <div className="text-center">
      <LineChartIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
      <p className="text-muted-foreground">Gráfico de Linha</p>
      <p className="text-xs text-muted-foreground mt-1">
        Visualização de tendências
      </p>
    </div>
  </div>
);

// Dados mockados para análise financeira com IA
const TENDENCIAS_DETECTADAS = [
  { 
    id: 1, 
    titulo: 'Aumento nas vendas em dias úteis', 
    descricao: 'Os dados indicam um padrão de aumento nas vendas durante dias úteis, especialmente nas terças e quartas-feiras.',
    confianca: 89,
    impacto: 'alto',
    categoria: 'vendas',
    acao: 'Considerar promoções especiais nas segundas e quintas para equilibrar as vendas ao longo da semana.'
  },
  { 
    id: 2, 
    titulo: 'Despesas não categorizadas crescentes', 
    descricao: 'Há um aumento consistente em despesas classificadas como "Outros" nos últimos 3 meses.',
    confianca: 92,
    impacto: 'médio',
    categoria: 'despesas',
    acao: 'Revisar e recategorizar despesas para melhor análise e controle orçamentário.'
  },
  { 
    id: 3, 
    titulo: 'Sazonalidade nas receitas', 
    descricao: 'A análise detectou um padrão sazonal nas receitas com picos nos meses de março, julho e novembro.',
    confianca: 87,
    impacto: 'alto',
    categoria: 'receitas',
    acao: 'Planejar estoque e marketing considerando estes períodos de pico.'
  },
  { 
    id: 4, 
    titulo: 'Fluxo de caixa negativo projetado', 
    descricao: 'Com base nas tendências atuais, há indicação de possível fluxo de caixa negativo no próximo trimestre.',
    confianca: 78,
    impacto: 'crítico',
    categoria: 'fluxo de caixa',
    acao: 'Revisar cronograma de pagamentos e considerar antecipação de recebíveis.'
  },
  { 
    id: 5, 
    titulo: 'Eficiência em marketing digital', 
    descricao: 'Campanhas digitais mostram ROI 23% maior que campanhas tradicionais nos últimos 6 meses.',
    confianca: 94,
    impacto: 'médio',
    categoria: 'marketing',
    acao: 'Avaliar realocação de orçamento para canais digitais mais eficientes.'
  }
];

const ANOMALIAS_DETECTADAS = [
  {
    id: 1,
    titulo: 'Pico de despesas inexplicado',
    descricao: 'Detectamos um aumento anormal de 42% nas despesas operacionais em 15/04/2025.',
    data: '2025-04-15',
    confianca: 96,
    categoria: 'despesas',
    status: 'não verificada'
  },
  {
    id: 2,
    titulo: 'Queda brusca em recebimentos',
    descricao: 'Houve uma redução atípica de 38% nos recebimentos na última semana de março.',
    data: '2025-03-25',
    confianca: 88,
    categoria: 'receitas',
    status: 'verificada'
  },
  {
    id: 3,
    titulo: 'Transações duplicadas',
    descricao: 'Identificamos possíveis pagamentos duplicados para o fornecedor "Tech Solutions".',
    data: '2025-04-10',
    confianca: 89,
    categoria: 'pagamentos',
    status: 'não verificada'
  }
];

const SIMULACOES = [
  {
    id: 1,
    cenario: 'Aumento de preços em 10%',
    impactoReceita: '+15%',
    impactoLucro: '+22%',
    riscoClientes: 'Médio',
    recomendacao: 'Considerar aumento seletivo apenas em produtos premium.'
  },
  {
    id: 2,
    cenario: 'Redução em custos operacionais',
    impactoReceita: '0%',
    impactoLucro: '+8%',
    riscoClientes: 'Baixo',
    recomendacao: 'Identificar áreas específicas para otimização sem afetar qualidade.'
  },
  {
    id: 3,
    cenario: 'Expansão para novo mercado',
    impactoReceita: '+25%',
    impactoLucro: '+12%',
    riscoClientes: 'Médio',
    recomendacao: 'Iniciar com investimento controlado e monitorar métricas de aquisição.'
  }
];

// Formatar valores monetários
const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(valor);
};

export default function AnaliseIA() {
  const [periodoAnalise, setPeriodoAnalise] = useState('6-meses');
  const [perguntaIA, setPerguntaIA] = useState('');
  const [conversaIA, setConversaIA] = useState<{tipo: 'usuario' | 'ia', mensagem: string}[]>([
    {tipo: 'ia', mensagem: 'Olá! Sou seu assistente financeiro. Como posso ajudar com a análise dos seus dados financeiros hoje?'}
  ]);
  const [filtroTendencias, setFiltroTendencias] = useState('todas');
  
  // Simulação de resposta da IA
  const enviarPergunta = () => {
    if (!perguntaIA.trim()) return;
    
    // Adicionar pergunta do usuário à conversa
    setConversaIA(prev => [...prev, {tipo: 'usuario', mensagem: perguntaIA}]);
    
    // Simular resposta da IA
    setTimeout(() => {
      let resposta = '';
      
      // Respostas predefinidas baseadas em palavras-chave
      if (perguntaIA.toLowerCase().includes('fluxo de caixa')) {
        resposta = 'Analisando seus dados de fluxo de caixa, observo que há uma tendência de melhoria gradual nos últimos 3 meses, com um aumento de 12% na liquidez. Recomendo manter as políticas atuais de gestão de contas a receber para continuar esta tendência positiva.';
      } else if (perguntaIA.toLowerCase().includes('reduzir custos') || perguntaIA.toLowerCase().includes('redução de custos')) {
        resposta = 'Com base na análise dos seus custos operacionais, identifiquei três áreas com potencial para redução: (1) Despesas com fornecedores de material de escritório, que estão 15% acima do benchmark do setor; (2) Serviços terceirizados de TI, onde há possibilidade de renegociação; (3) Custos energéticos, que poderiam ser reduzidos com medidas de eficiência.';
      } else if (perguntaIA.toLowerCase().includes('previsão') || perguntaIA.toLowerCase().includes('próximo trimestre')) {
        resposta = 'A previsão para o próximo trimestre, com base nos dados históricos e tendências sazonais, indica um crescimento provável de receitas entre 8-12%. Os principais contribuintes serão os setores de produtos premium e serviços recorrentes. Recomendo preparar o estoque e equipe de atendimento para este aumento projetado.';
      } else {
        resposta = 'Analisando os dados financeiros relacionados à sua pergunta, posso destacar algumas observações importantes: (1) O desempenho atual está alinhado com as metas anuais estabelecidas; (2) Há oportunidades de otimização em algumas categorias de despesas; (3) As projeções indicam uma tendência positiva para os próximos meses, desde que as condições de mercado se mantenham estáveis.';
      }
      
      setConversaIA(prev => [...prev, {tipo: 'ia', mensagem: resposta}]);
    }, 1000);
    
    // Limpar campo de pergunta
    setPerguntaIA('');
  };
  
  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Análise Financeira com IA</h1>
            <p className="text-muted-foreground">
              Obtenha insights e previsões avançadas utilizando inteligência artificial
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={periodoAnalise} onValueChange={setPeriodoAnalise}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período de análise" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3-meses">Últimos 3 meses</SelectItem>
                <SelectItem value="6-meses">Últimos 6 meses</SelectItem>
                <SelectItem value="12-meses">Últimos 12 meses</SelectItem>
                <SelectItem value="ano-atual">Ano atual</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="gap-2">
              <FileBarChart className="h-4 w-4" />
              Exportar Relatório
            </Button>
            
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="insights" className="space-y-4">
          <TabsList>
            <TabsTrigger value="insights">Insights Inteligentes</TabsTrigger>
            <TabsTrigger value="tendencias">Tendências Detectadas</TabsTrigger>
            <TabsTrigger value="anomalias">Anomalias</TabsTrigger>
            <TabsTrigger value="simulacao">Simulações</TabsTrigger>
            <TabsTrigger value="chat">Assistente Financeiro</TabsTrigger>
          </TabsList>
          
          <TabsContent value="insights">
            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-medium text-blue-700">
                        <div className="flex items-center">
                          <Sparkles className="h-5 w-5 mr-2 text-blue-500" />
                          Resumo de Insights
                        </div>
                      </CardTitle>
                      <CardDescription className="text-blue-600">
                        Análise baseada em seus dados financeiros dos últimos 6 meses
                      </CardDescription>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                      IA Avançada
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-white p-4 shadow-sm">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 rounded-full bg-green-100 p-2">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium">Oportunidades de Crescimento</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            A análise de padrões indica potencial de crescimento em 3 áreas principais que representam aproximadamente 24% da sua receita atual.
                          </p>
                          <div className="mt-2">
                            <Button variant="link" className="h-auto p-0 text-blue-600">
                              <span>Ver detalhes</span>
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-white p-4 shadow-sm">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 rounded-full bg-red-100 p-2">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium">Alertas de Risco</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Identificamos 2 tendências preocupantes que merecem atenção imediata, incluindo possível problema de liquidez no próximo trimestre.
                          </p>
                          <div className="mt-2">
                            <Button variant="link" className="h-auto p-0 text-blue-600">
                              <span>Ver detalhes</span>
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-white p-4 shadow-sm">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 rounded-full bg-amber-100 p-2">
                          <LightbulbIcon className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium">Recomendações de Otimização</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Nossa análise sugere 5 ações concretas para otimizar seus resultados financeiros, com potencial impacto de aumento de 8-11% na lucratividade.
                          </p>
                          <div className="mt-2">
                            <Button variant="link" className="h-auto p-0 text-blue-600">
                              <span>Ver detalhes</span>
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Previsão de Fluxo de Caixa</CardTitle>
                    <CardDescription>
                      Projeção inteligente para os próximos 3 meses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LineChartPlaceholder data={{}} />
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Confiança da previsão</span>
                        <span className="font-medium">87%</span>
                      </div>
                      <Progress value={87} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">
                        Baseado em padrões históricos, sazonalidade e condições de mercado atuais
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Insights Comparativos</CardTitle>
                    <CardDescription>
                      Comparação com médias do setor e concorrentes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-sm">Margem de Lucro</span>
                          </div>
                          <span className="text-sm font-medium text-green-500">+4.2% acima da média</span>
                        </div>
                        <Progress value={75} className="h-2 bg-muted" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Sua empresa: 22.8%</span>
                          <span>Média do setor: 18.6%</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                            <span className="text-sm">Ciclo de Conversão de Caixa</span>
                          </div>
                          <span className="text-sm font-medium text-red-500">12 dias acima da média</span>
                        </div>
                        <Progress value={40} className="h-2 bg-muted" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Sua empresa: 45 dias</span>
                          <span>Média do setor: 33 dias</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                            <span className="text-sm">Crescimento de Receita</span>
                          </div>
                          <span className="text-sm font-medium text-amber-500">Dentro da média</span>
                        </div>
                        <Progress value={60} className="h-2 bg-muted" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Sua empresa: 12.5%</span>
                          <span>Média do setor: 13.1%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tendencias">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">Tendências Detectadas pela IA</h2>
                <p className="text-sm text-muted-foreground">Padrões e tendências identificados nos seus dados financeiros</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar tendências..."
                    className="pl-8"
                  />
                </div>
                
                <Select value={filtroTendencias} onValueChange={setFiltroTendencias}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as categorias</SelectItem>
                    <SelectItem value="vendas">Vendas</SelectItem>
                    <SelectItem value="despesas">Despesas</SelectItem>
                    <SelectItem value="receitas">Receitas</SelectItem>
                    <SelectItem value="fluxo de caixa">Fluxo de Caixa</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              {TENDENCIAS_DETECTADAS.map((tendencia) => (
                <Card key={tendencia.id} className="overflow-hidden">
                  <div className={`h-1 ${
                    tendencia.impacto === 'crítico' ? 'bg-red-500' :
                    tendencia.impacto === 'alto' ? 'bg-amber-500' :
                    'bg-blue-500'
                  }`}></div>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium">{tendencia.titulo}</h3>
                          <Badge variant="outline" className="capitalize">
                            {tendencia.categoria}
                          </Badge>
                          <Badge className={`${
                            tendencia.impacto === 'crítico' ? 'bg-red-100 text-red-800' :
                            tendencia.impacto === 'alto' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            Impacto {tendencia.impacto}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{tendencia.descricao}</p>
                        <div className="pt-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Brain className="h-4 w-4 text-purple-500" />
                            <span className="text-sm font-medium">Sugestão da IA:</span>
                          </div>
                          <p className="text-sm pl-6">{tendencia.acao}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-24 h-24 relative">
                          <div 
                            className="w-24 h-24 rounded-full border-4 border-muted flex items-center justify-center" 
                            style={{
                              background: `conic-gradient(#818cf8 ${tendencia.confianca}%, transparent 0)`
                            }}
                          >
                            <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center">
                              <span className="text-xl font-bold">{tendencia.confianca}%</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground mt-2">Confiança da análise</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="anomalias">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Anomalias Financeiras Detectadas</h2>
                  <p className="text-sm text-muted-foreground">Transações e padrões incomuns identificados pela IA</p>
                </div>
                <Button className="gap-2">
                  <Search className="h-4 w-4" />
                  Analisar Novamente
                </Button>
              </div>
              
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {ANOMALIAS_DETECTADAS.map((anomalia) => (
                      <div key={anomalia.id} className="flex items-start border-b pb-4 last:border-b-0 last:pb-0 pt-2">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          </div>
                        </div>
                        <div className="ml-4 flex-grow">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{anomalia.titulo}</h3>
                            <div className="flex items-center gap-2">
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(anomalia.data), 'dd/MM/yyyy')}
                              </div>
                              <Badge variant={anomalia.status === 'verificada' ? 'default' : 'secondary'}>
                                {anomalia.status}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{anomalia.descricao}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center">
                              <Badge className="bg-blue-100 text-blue-800 mr-2">
                                {anomalia.categoria}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Confiança: {anomalia.confianca}%
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Ignorar
                              </Button>
                              <Button size="sm">
                                Investigar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="simulacao">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Simulações Financeiras</h2>
                  <p className="text-sm text-muted-foreground">Projeções de diferentes cenários para tomada de decisão</p>
                </div>
                <Button className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Nova Simulação
                </Button>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-4 font-medium">Cenário</th>
                          <th className="text-left p-4 font-medium">Impacto na Receita</th>
                          <th className="text-left p-4 font-medium">Impacto no Lucro</th>
                          <th className="text-left p-4 font-medium">Risco para Clientes</th>
                          <th className="text-left p-4 font-medium">Recomendação</th>
                          <th className="text-right p-4 font-medium">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {SIMULACOES.map((simulacao, index) => (
                          <tr key={simulacao.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                            <td className="p-4 font-medium">{simulacao.cenario}</td>
                            <td className="p-4">
                              <span className={`font-medium ${
                                simulacao.impactoReceita.startsWith('+') ? 'text-green-600' : 
                                simulacao.impactoReceita.startsWith('-') ? 'text-red-600' : 
                                'text-blue-600'
                              }`}>
                                {simulacao.impactoReceita}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`font-medium ${
                                simulacao.impactoLucro.startsWith('+') ? 'text-green-600' : 
                                simulacao.impactoLucro.startsWith('-') ? 'text-red-600' : 
                                'text-blue-600'
                              }`}>
                                {simulacao.impactoLucro}
                              </span>
                            </td>
                            <td className="p-4">
                              <Badge className={
                                simulacao.riscoClientes === 'Baixo' ? 'bg-green-100 text-green-800' :
                                simulacao.riscoClientes === 'Médio' ? 'bg-amber-100 text-amber-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {simulacao.riscoClientes}
                              </Badge>
                            </td>
                            <td className="p-4 text-sm">{simulacao.recomendacao}</td>
                            <td className="p-4 text-right">
                              <Button variant="outline" size="sm">
                                Detalhar
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">
                    Criar Nova Simulação
                  </CardTitle>
                  <CardDescription>
                    Defina parâmetros para calcular impactos financeiros
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cenario">Nome do Cenário</Label>
                        <Input id="cenario" placeholder="Ex: Expansão para novo mercado" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo de Simulação</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="receita">Impacto na Receita</SelectItem>
                            <SelectItem value="custo">Redução de Custos</SelectItem>
                            <SelectItem value="investimento">Novo Investimento</SelectItem>
                            <SelectItem value="preco">Mudança de Preços</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="descricao">Descrição do Cenário</Label>
                      <Textarea 
                        id="descricao" 
                        placeholder="Descreva os detalhes do cenário a ser simulado..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="variacao">Variação Percentual (%)</Label>
                        <Input id="variacao" type="number" placeholder="Ex: 10" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="periodo">Período de Análise</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o período" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3-meses">3 meses</SelectItem>
                            <SelectItem value="6-meses">6 meses</SelectItem>
                            <SelectItem value="12-meses">12 meses</SelectItem>
                            <SelectItem value="2-anos">2 anos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confianca">Nível de Confiança</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o nível" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="conservador">Conservador (90%)</SelectItem>
                            <SelectItem value="moderado">Moderado (80%)</SelectItem>
                            <SelectItem value="agressivo">Agressivo (70%)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="pt-2 flex justify-end">
                      <Button className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        Executar Simulação
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="chat">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-240px)]">
              <div className="col-span-2 flex flex-col">
                <Card className="flex-grow overflow-hidden flex flex-col">
                  <CardHeader className="pb-2 border-b">
                    <div className="flex items-center">
                      <Brain className="mr-2 h-5 w-5 text-purple-500" />
                      <CardTitle className="text-base font-medium">Assistente Financeiro</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 overflow-auto flex-grow">
                    <div className="p-4 space-y-4">
                      {conversaIA.map((mensagem, index) => (
                        <div 
                          key={index} 
                          className={`flex ${mensagem.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[80%] rounded-lg p-3 ${
                              mensagem.tipo === 'usuario' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{mensagem.mensagem}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Faça uma pergunta sobre seus dados financeiros..." 
                        value={perguntaIA}
                        onChange={(e) => setPerguntaIA(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && enviarPergunta()}
                      />
                      <Button 
                        className="shrink-0" 
                        onClick={enviarPergunta}
                        disabled={!perguntaIA.trim()}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Enviar
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div>
                <Card className="h-full overflow-hidden flex flex-col">
                  <CardHeader className="pb-2 border-b">
                    <CardTitle className="text-base font-medium">Sugestões de Perguntas</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 overflow-auto flex-grow">
                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left h-auto py-3 px-4"
                        onClick={() => {
                          setPerguntaIA('Quais são as tendências de fluxo de caixa para os próximos 3 meses?');
                          enviarPergunta();
                        }}
                      >
                        <span>Quais são as tendências de fluxo de caixa para os próximos 3 meses?</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left h-auto py-3 px-4"
                        onClick={() => {
                          setPerguntaIA('Como posso reduzir custos operacionais sem impactar a qualidade?');
                          enviarPergunta();
                        }}
                      >
                        <span>Como posso reduzir custos operacionais sem impactar a qualidade?</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left h-auto py-3 px-4"
                        onClick={() => {
                          setPerguntaIA('Qual é a previsão de receita para o próximo trimestre?');
                          enviarPergunta();
                        }}
                      >
                        <span>Qual é a previsão de receita para o próximo trimestre?</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left h-auto py-3 px-4"
                        onClick={() => {
                          setPerguntaIA('Identifique oportunidades para melhorar a margem de lucro.');
                          enviarPergunta();
                        }}
                      >
                        <span>Identifique oportunidades para melhorar a margem de lucro.</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left h-auto py-3 px-4"
                        onClick={() => {
                          setPerguntaIA('Quais são os riscos financeiros mais significativos que estou enfrentando?');
                          enviarPergunta();
                        }}
                      >
                        <span>Quais são os riscos financeiros mais significativos que estou enfrentando?</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left h-auto py-3 px-4"
                        onClick={() => {
                          setPerguntaIA('Compare meu desempenho financeiro com o benchmark do setor.');
                          enviarPergunta();
                        }}
                      >
                        <span>Compare meu desempenho financeiro com o benchmark do setor.</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}