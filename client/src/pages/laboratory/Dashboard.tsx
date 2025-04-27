import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Archive, CheckCircle2, ChevronRight, Dot, ExternalLink, FlaskConical, List, Microscope, Calendar, FileCheck } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Tipo para os dados resumidos do dashboard
interface DashboardData {
  totalSamples: number;
  pendingSamples: number;
  inProgressSamples: number;
  completedSamples: number;
  recentSamples: SampleSummary[];
  upcomingTests: TestSummary[];
  equipmentAlerts: EquipmentAlert[];
}

// Tipos para os dados de resumo
interface SampleSummary {
  id: number;
  code: string;
  type: string;
  client: string;
  status: string;
  receivedDate: string;
}

interface TestSummary {
  id: number;
  sampleCode: string;
  type: string;
  dueDate: string;
  technician: string;
}

interface EquipmentAlert {
  id: number;
  name: string;
  alertType: 'maintenance' | 'calibration' | 'validation';
  dueDate: string;
}

export default function LaboratoryDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  // Buscar dados do dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest({
          method: 'GET',
          url: '/api/laboratory/dashboard'
        });
        
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        } else {
          throw new Error('Erro ao buscar dados do dashboard');
        }
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do dashboard.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  // Função para obter a cor do status da amostra
  const getSampleStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      registered: 'bg-gray-200',
      collected: 'bg-blue-200',
      received: 'bg-blue-500',
      in_progress: 'bg-yellow-500',
      pending_approval: 'bg-orange-500',
      completed: 'bg-green-500',
      rejected: 'bg-red-500',
      archived: 'bg-gray-500'
    };
    return statusMap[status] || 'bg-gray-300';
  };

  // Função para traduzir o status da amostra
  const translateSampleStatus = (status: string) => {
    const statusTranslation: Record<string, string> = {
      registered: 'Registrada',
      collected: 'Coletada',
      received: 'Recebida',
      in_progress: 'Em Análise',
      pending_approval: 'Aguardando Aprovação',
      completed: 'Concluída',
      rejected: 'Rejeitada', 
      archived: 'Arquivada'
    };
    return statusTranslation[status] || status;
  };

  // Função para traduzir o tipo de alerta
  const translateAlertType = (type: string) => {
    const alertTranslation: Record<string, string> = {
      maintenance: 'Manutenção',
      calibration: 'Calibração',
      validation: 'Validação'
    };
    return alertTranslation[type] || type;
  };

  // Renderização condicional para carregamento
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <FlaskConical className="h-12 w-12 animate-pulse text-blue-500 mb-2" />
          <p className="text-lg text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Dados fictícios para visualização (apenas para desenvolvimento)
  const mockData: DashboardData = {
    totalSamples: 248,
    pendingSamples: 34,
    inProgressSamples: 18,
    completedSamples: 196,
    recentSamples: [
      { id: 1, code: 'SAMPLE-001', type: 'plant', client: 'Cultivador ABC', status: 'in_progress', receivedDate: '2025-04-25' },
      { id: 2, code: 'SAMPLE-002', type: 'oil', client: 'Farmácia XYZ', status: 'received', receivedDate: '2025-04-26' },
      { id: 3, code: 'SAMPLE-003', type: 'extract', client: 'Processadora 123', status: 'pending_approval', receivedDate: '2025-04-24' },
      { id: 4, code: 'SAMPLE-004', type: 'consumable', client: 'Loja CBD', status: 'completed', receivedDate: '2025-04-23' },
      { id: 5, code: 'SAMPLE-005', type: 'plant', client: 'Associação Cura', status: 'registered', receivedDate: '2025-04-27' }
    ],
    upcomingTests: [
      { id: 1, sampleCode: 'SAMPLE-001', type: 'cannabinoid_profile', dueDate: '2025-04-28', technician: 'João Silva' },
      { id: 2, sampleCode: 'SAMPLE-002', type: 'terpenes', dueDate: '2025-04-29', technician: 'Maria Santos' },
      { id: 3, sampleCode: 'SAMPLE-003', type: 'potency', dueDate: '2025-04-28', technician: 'Pedro Oliveira' }
    ],
    equipmentAlerts: [
      { id: 1, name: 'HPLC-01', alertType: 'calibration', dueDate: '2025-04-30' },
      { id: 2, name: 'GC-MS-02', alertType: 'maintenance', dueDate: '2025-05-02' },
      { id: 3, name: 'Balança Analítica', alertType: 'validation', dueDate: '2025-04-29' }
    ]
  };

  // Usar dados reais do dashboard ou dados fictícios para visualização
  const data = dashboardData || mockData;

  // Cálculo de métricas
  const completionRate = Math.round((data.completedSamples / data.totalSamples) * 100);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard do Laboratório</h1>
        <div>
          <Button variant="outline" size="sm" className="mr-2">
            <Calendar className="h-4 w-4 mr-2" />
            Relatórios
          </Button>
          <Button size="sm">
            <FileCheck className="h-4 w-4 mr-2" />
            Nova Amostra
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="samples">Amostras</TabsTrigger>
          <TabsTrigger value="equipment">Equipamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Cards de estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Archive className="h-4 w-4 mr-2 text-blue-500" />
                  Amostras Totais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.totalSamples}</div>
                <div className="text-sm text-gray-500 mt-1">Último mês: +32 amostras</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Microscope className="h-4 w-4 mr-2 text-yellow-500" />
                  Em Análise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.inProgressSamples}</div>
                <div className="text-sm text-gray-500 mt-1">Prazo médio: 3 dias</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  Taxa de Conclusão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="text-3xl font-bold">{completionRate}%</div>
                  <Progress value={completionRate} className="h-2 w-20" />
                </div>
                <div className="text-sm text-gray-500 mt-1">{data.completedSamples} amostras concluídas</div>
              </CardContent>
            </Card>
          </div>

          {/* Amostras recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Amostras Recentes</CardTitle>
              <CardDescription>
                Últimas amostras recebidas para análise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentSamples.map(sample => (
                  <div key={sample.id} className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${getSampleStatusColor(sample.status)} mr-3`}></div>
                      <div>
                        <div className="font-medium">{sample.code}</div>
                        <div className="text-sm text-gray-500">{sample.client}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-4 text-right">
                        <div className="text-sm font-medium">{translateSampleStatus(sample.status)}</div>
                        <div className="text-xs text-gray-500">Recebido: {new Date(sample.receivedDate).toLocaleDateString('pt-BR')}</div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                Ver todas as amostras
              </Button>
            </CardFooter>
          </Card>

          {/* Linha inferior com alertas e testes pendentes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Testes Programados</CardTitle>
                <CardDescription>
                  Próximos testes para realização
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.upcomingTests.map(test => (
                    <div key={test.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{test.sampleCode}</div>
                        <div className="text-sm text-gray-500">
                          {test.type === 'cannabinoid_profile' 
                            ? 'Perfil de Canabinoides' 
                            : test.type === 'terpenes' 
                              ? 'Análise de Terpenos' 
                              : 'Teste de Potência'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {new Date(test.dueDate).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-xs text-gray-500">{test.technician}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alertas de Equipamentos</CardTitle>
                <CardDescription>
                  Próximas manutenções e calibrações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.equipmentAlerts.map(alert => (
                    <div key={alert.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${
                          alert.alertType === 'maintenance' 
                            ? 'bg-yellow-500' 
                            : alert.alertType === 'calibration' 
                              ? 'bg-blue-500' 
                              : 'bg-purple-500'
                        } mr-2`}></div>
                        <div>
                          <div className="font-medium">{alert.name}</div>
                          <div className="text-sm text-gray-500">{translateAlertType(alert.alertType)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {new Date(alert.dueDate).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(alert.dueDate) < new Date() 
                            ? 'Atrasado' 
                            : 'Programado'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="samples">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Amostras</CardTitle>
              <CardDescription>
                Visualize, adicione e gerencie amostras de laboratório
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <div className="flex flex-col items-center text-center">
                  <List className="h-10 w-10 text-blue-500 mb-2" />
                  <h3 className="text-lg font-medium">Acesse a Lista Completa de Amostras</h3>
                  <p className="text-gray-500 max-w-md mt-1">
                    Para visualizar e gerenciar todas as amostras, acesse a página específica de amostras
                  </p>
                  <Button className="mt-4">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ir para Amostras
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Equipamentos</CardTitle>
              <CardDescription>
                Monitore e gerencie equipamentos de laboratório
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <div className="flex flex-col items-center text-center">
                  <FlaskConical className="h-10 w-10 text-blue-500 mb-2" />
                  <h3 className="text-lg font-medium">Acesse a Lista de Equipamentos</h3>
                  <p className="text-gray-500 max-w-md mt-1">
                    Para visualizar o status, programar manutenções e gerenciar calibrações, acesse a página específica de equipamentos
                  </p>
                  <Button className="mt-4">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ir para Equipamentos
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