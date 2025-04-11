import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  BarChart,
  Factory,
  ShieldCheck,
  Microscope,
  Network,
  FileSearch,
  Beaker,
  Droplet,
  PackageOpen,
  Tag,
  Package,
  ClipboardList,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Clock,
  LayoutDashboard,
  Leaf
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function ProducaoIndustrialDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState('visao-geral');

  // Dados simulados para a dashboard
  const processosProdutivos = [
    { id: 1, nome: 'Lote #23451', fase: 'Extração', progresso: 75, responsavel: 'Carlos Silva', status: 'em_andamento', iniciado: '2025-04-05', previsao: '2025-04-15' },
    { id: 2, nome: 'Lote #23452', fase: 'Diluição', progresso: 30, responsavel: 'Maria Santos', status: 'em_andamento', iniciado: '2025-04-08', previsao: '2025-04-18' },
    { id: 3, nome: 'Lote #23449', fase: 'Envase', progresso: 90, responsavel: 'João Oliveira', status: 'em_andamento', iniciado: '2025-03-28', previsao: '2025-04-12' },
    { id: 4, nome: 'Lote #23447', fase: 'Rotulação', progresso: 95, responsavel: 'Ana Costa', status: 'em_andamento', iniciado: '2025-03-25', previsao: '2025-04-11' },
    { id: 5, nome: 'Lote #23445', fase: 'Finalizado', progresso: 100, responsavel: 'Lucas Moreira', status: 'concluido', iniciado: '2025-03-15', previsao: '2025-04-05' }
  ];

  const estatisticas = {
    lotesEmProducao: 4,
    lotesConcluidos: 12,
    produtosProcessados: 820,
    capacidadeUtilizada: 65,
    testesQualidade: 38,
    testesQualidadeAprovados: 36,
    eficienciaProducao: 91
  };

  return (
    <OrganizationLayout>
      <div className="container px-6 py-4">
        <div className="flex flex-col gap-6">
          {/* Cabeçalho */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Produção Industrial</h1>
              <p className="text-gray-500 mt-1">
                Gerenciamento de produção com rastreamento completo da semente ao balcão
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <ClipboardList size={16} />
                Relatórios
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                <Factory size={16} />
                Novo Lote de Produção
              </Button>
            </div>
          </div>

          {/* Tabs de navegação */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-transparent border-b w-full rounded-none p-0 h-auto space-x-8">
              <TabsTrigger 
                value="visao-geral" 
                className="border-b-2 rounded-none px-1 py-2 text-base border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
              >
                Visão Geral
              </TabsTrigger>
              <TabsTrigger 
                value="ativo" 
                className="border-b-2 rounded-none px-1 py-2 text-base border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
              >
                Produção Ativa
              </TabsTrigger>
              <TabsTrigger 
                value="qualidade" 
                className="border-b-2 rounded-none px-1 py-2 text-base border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
              >
                Controle de Qualidade
              </TabsTrigger>
              <TabsTrigger 
                value="rastreabilidade" 
                className="border-b-2 rounded-none px-1 py-2 text-base border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
              >
                Rastreabilidade
              </TabsTrigger>
            </TabsList>

            {/* Conteúdo da aba Visão Geral */}
            <TabsContent value="visao-geral" className="pt-4 space-y-6">
              {/* Cards de estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Lotes em Produção</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-semibold">{estatisticas.lotesEmProducao}</div>
                      <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <Factory size={24} />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      <span className="text-green-600 font-medium">+2 lotes</span> comparado ao mês anterior
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Lotes Concluídos (mês)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-semibold">{estatisticas.lotesConcluidos}</div>
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <CheckCircle size={24} />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      <span className="text-blue-600 font-medium">95% taxa</span> de finalização
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Eficiência de Produção</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-semibold">{estatisticas.eficienciaProducao}%</div>
                      <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                        <BarChart size={24} />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      <span className="text-purple-600 font-medium">+3%</span> comparado ao mês anterior
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Qualidade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-semibold">{(estatisticas.testesQualidadeAprovados / estatisticas.testesQualidade * 100).toFixed(1)}%</div>
                      <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                        <ShieldCheck size={24} />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      <span className="text-amber-600 font-medium">{estatisticas.testesQualidadeAprovados}/{estatisticas.testesQualidade}</span> testes aprovados
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Processos produtivos em andamento */}
              <Card>
                <CardHeader>
                  <CardTitle>Processos Produtivos em Andamento</CardTitle>
                  <CardDescription>Monitoramento dos lotes de produção ativos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {processosProdutivos
                      .filter(p => p.status === 'em_andamento')
                      .slice(0, 3)
                      .map(processo => (
                        <div key={processo.id} className="border p-4 rounded-lg">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
                            <div>
                              <h3 className="font-semibold flex items-center gap-2">
                                {processo.nome}
                                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                                  {processo.fase}
                                </Badge>
                              </h3>
                              <p className="text-sm text-gray-500">Responsável: {processo.responsavel}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                                <Clock size={14} />
                                Previsão: {processo.previsao}
                              </Badge>
                              <Button variant="ghost" size="sm" className="text-gray-500">
                                <ArrowRight size={16} />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>Progresso</span>
                              <span>{processo.progresso}%</span>
                            </div>
                            <Progress value={processo.progresso} className="h-2" />
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-4">
                  <Button variant="outline">Ver Todos os Processos</Button>
                </CardFooter>
              </Card>

              {/* Fluxo de Produção */}
              <Card>
                <CardHeader>
                  <CardTitle>Fluxo de Produção</CardTitle>
                  <CardDescription>Rastreamento completo da semente ao balcão</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4">
                    <div className="flex-1 border rounded-lg p-4 text-center">
                      <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-2">
                        <Leaf size={24} />
                      </div>
                      <h3 className="font-medium">Cultivo</h3>
                      <p className="text-sm text-gray-500">8 lotes ativos</p>
                    </div>
                    <div className="flex-1 border rounded-lg p-4 text-center">
                      <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mx-auto mb-2">
                        <Beaker size={24} />
                      </div>
                      <h3 className="font-medium">Extração</h3>
                      <p className="text-sm text-gray-500">3 lotes ativos</p>
                    </div>
                    <div className="flex-1 border rounded-lg p-4 text-center">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-2">
                        <Droplet size={24} />
                      </div>
                      <h3 className="font-medium">Diluição</h3>
                      <p className="text-sm text-gray-500">2 lotes ativos</p>
                    </div>
                    <div className="flex-1 border rounded-lg p-4 text-center">
                      <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-2">
                        <PackageOpen size={24} />
                      </div>
                      <h3 className="font-medium">Envase</h3>
                      <p className="text-sm text-gray-500">1 lote ativo</p>
                    </div>
                    <div className="flex-1 border rounded-lg p-4 text-center">
                      <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-2">
                        <Tag size={24} />
                      </div>
                      <h3 className="font-medium">Rotulação</h3>
                      <p className="text-sm text-gray-500">1 lote ativo</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-4">
                  <Button variant="outline">Análise Detalhada do Fluxo</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Conteúdo das outras abas (vazio por enquanto) */}
            <TabsContent value="ativo" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Produção Ativa</CardTitle>
                  <CardDescription>Informações detalhadas sobre lotes de produção em andamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Factory className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Conteúdo em Desenvolvimento</h3>
                    <p className="text-gray-500 max-w-md">
                      Esta página está sendo implementada. Aqui você poderá acompanhar em tempo real todos os processos de produção ativos.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="qualidade" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Controle de Qualidade</CardTitle>
                  <CardDescription>Monitoramento de testes de qualidade e certificações</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <ShieldCheck className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Conteúdo em Desenvolvimento</h3>
                    <p className="text-gray-500 max-w-md">
                      Esta página está sendo implementada. Aqui você poderá acompanhar todos os testes de qualidade e certificações de produto.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rastreabilidade" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Rastreabilidade</CardTitle>
                  <CardDescription>Rastreamento completo da origem ao destino</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <FileSearch className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Conteúdo em Desenvolvimento</h3>
                    <p className="text-gray-500 max-w-md">
                      Esta página está sendo implementada. Aqui você poderá visualizar a cadeia completa de rastreabilidade, 
                      desde a semente até o balcão.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </OrganizationLayout>
  );
}