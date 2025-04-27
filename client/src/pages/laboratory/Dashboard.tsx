import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  ArrowRight,
  Beaker,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Clipboard,
  FileText,
  FlaskConical,
  Microscope,
  MoreHorizontal,
  PieChart,
  TrendingUp,
  User,
  Users,
  Wrench,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LaboratoryLayout from '@/components/layout/laboratory/LaboratoryLayout';
import { Progress } from '@/components/ui/progress';

export default function LaboratoryDashboard() {
  const { toast } = useToast();
  const [activePeriod, setActivePeriod] = useState('week');

  // Estatísticas gerais
  const stats = {
    pendingSamples: 12,
    completedToday: 8,
    equipmentMaintenance: 2,
    pendingReports: 5
  };

  // Dados para gráficos (simulados)
  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;

  // Lista de atividades recentes
  const recentActivities = [
    {
      id: 1,
      type: 'sample_received',
      title: 'Novas amostras recebidas',
      description: '5 amostras de CBD Brasil Cultivo',
      time: '10 minutos atrás',
      icon: <FlaskConical className="text-blue-500" />
    },
    {
      id: 2,
      type: 'test_completed',
      title: 'Teste finalizado',
      description: 'Perfil de canabinoides concluído para amostra SAMPLE-001-25',
      time: '1 hora atrás',
      icon: <Check className="text-green-500" />
    },
    {
      id: 3,
      type: 'equipment_maintenance',
      title: 'Manutenção requerida',
      description: 'HPLC-01 precisa de calibração em 3 dias',
      time: '3 horas atrás',
      icon: <Wrench className="text-yellow-500" />
    },
    {
      id: 4,
      type: 'report_generated',
      title: 'Relatório gerado',
      description: 'Relatório de teste para Associação MedCanna',
      time: '5 horas atrás',
      icon: <FileText className="text-purple-500" />
    }
  ];

  // Lista de amostras aguardando processamento
  const pendingSamples = [
    {
      id: 'SAMPLE-002-25',
      client: 'CBD Brasil Cultivo',
      type: 'Flor',
      tests: ['Perfil Canabinoide', 'Terpenos'],
      received: '2025-04-26',
      priority: 'high',
      status: 'awaiting_processing'
    },
    {
      id: 'SAMPLE-003-25',
      client: 'Associação MedCanna',
      type: 'Óleo',
      tests: ['Perfil Canabinoide', 'Metais Pesados', 'Resíduos'],
      received: '2025-04-25',
      priority: 'medium',
      status: 'awaiting_processing'
    },
    {
      id: 'SAMPLE-004-25',
      client: 'Farmácia Medigreen',
      type: 'Extrato',
      tests: ['Perfil Canabinoide', 'Microbiano'],
      received: '2025-04-24',
      priority: 'medium',
      status: 'in_preparation'
    }
  ];

  // Lidar com ações específicas
  const handleAction = (action: string, id: string) => {
    toast({
      title: 'Ação iniciada',
      description: `Executando ação ${action} para item ${id}`,
    });
  };

  // Render diferentes tipos de cartões de estatísticas
  const renderStatCard = (title: string, value: number, icon: React.ReactNode, description: string, action?: string) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
      {action && (
        <CardFooter>
          <Button variant="ghost" className="w-full justify-start p-0 text-xs text-blue-500">
            {action}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );

  return (
    <LaboratoryLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl font-bold">Dashboard do Laboratório</h1>
            <p className="text-gray-500">Bem-vindo de volta • {formattedDate}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Agenda
            </Button>
            <Button size="sm">
              <FlaskConical className="h-4 w-4 mr-2" />
              Nova Amostra
            </Button>
          </div>
        </div>

        {/* Visão geral de estatísticas */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {renderStatCard(
            "Amostras Pendentes", 
            stats.pendingSamples, 
            <FlaskConical />, 
            "Aguardando processamento",
            "Ver todas"
          )}
          {renderStatCard(
            "Testes Completados Hoje", 
            stats.completedToday, 
            <Check />, 
            "Comparado a 6 ontem",
            "Ver detalhes"
          )}
          {renderStatCard(
            "Manutenções Pendentes", 
            stats.equipmentMaintenance, 
            <Wrench />, 
            "Equipamentos requerem atenção",
            "Agendar"
          )}
          {renderStatCard(
            "Relatórios Pendentes", 
            stats.pendingReports, 
            <FileText />, 
            "Aguardando revisão final",
            "Revisar"
          )}
        </div>

        {/* Gráficos e atividades */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-7">
          {/* Gráficos */}
          <Card className="md:col-span-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Análises por Período</CardTitle>
                <Tabs value={activePeriod} onValueChange={setActivePeriod} className="h-9">
                  <TabsList className="grid w-[180px] grid-cols-3">
                    <TabsTrigger value="week">Semana</TabsTrigger>
                    <TabsTrigger value="month">Mês</TabsTrigger>
                    <TabsTrigger value="year">Ano</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <CardDescription>Visualize o volume de análises concluídas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center bg-gray-50 rounded border">
                <div className="text-center text-gray-700">
                  <PieChart className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p>Gráfico de tendências de análises realizadas</p>
                  <p className="text-sm text-gray-600">(Visualização seria renderizada aqui em um ambiente de produção)</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs">Total Análises</span>
                  <span className="font-bold text-xl">124</span>
                  <div className="mt-1 flex items-center text-xs text-green-500">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>12% ↑</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs">Tempo Médio</span>
                  <span className="font-bold text-xl">2.3d</span>
                  <div className="mt-1 flex items-center text-xs text-green-500">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>5% ↑</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs">Satisfação</span>
                  <span className="font-bold text-xl">98%</span>
                  <div className="mt-1 flex items-center text-xs text-green-500">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>3% ↑</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Atividades recentes */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>Atualizações das últimas 24h</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex gap-4 items-start">
                    <div className="rounded-full bg-gray-100 p-2">
                      {activity.icon}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-gray-700">{activity.description}</p>
                      <div className="flex items-center text-xs text-gray-600">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                Ver Todas as Atividades
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Amostras pendentes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Amostras Aguardando Processamento</CardTitle>
              <Button variant="outline" size="sm">
                Ver Todas
              </Button>
            </div>
            <CardDescription>Amostras recebidas aguardando análise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">ID</th>
                    <th className="text-left py-3 px-4 font-medium">Cliente</th>
                    <th className="text-left py-3 px-4 font-medium">Tipo</th>
                    <th className="text-left py-3 px-4 font-medium">Testes</th>
                    <th className="text-left py-3 px-4 font-medium">Recebido</th>
                    <th className="text-left py-3 px-4 font-medium">Prioridade</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingSamples.map((sample) => (
                    <tr key={sample.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-blue-600 font-medium">{sample.id}</td>
                      <td className="py-3 px-4">{sample.client}</td>
                      <td className="py-3 px-4">{sample.type}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {sample.tests.map((test, index) => (
                            <Badge key={index} variant="outline">{test}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">{new Date(sample.received).toLocaleDateString('pt-BR')}</td>
                      <td className="py-3 px-4">
                        <Badge className={
                          sample.priority === 'high' 
                            ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                            : sample.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }>
                          {sample.priority === 'high' ? 'Alta' : sample.priority === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="flex-1 mr-2">
                            <span className="text-xs text-gray-700 font-medium">
                              {sample.status === 'awaiting_processing' ? 'Aguardando' : 'Em Preparação'}
                            </span>
                            <Progress 
                              value={sample.status === 'awaiting_processing' ? 0 : 30} 
                              className="h-1.5 mt-1" 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleAction('process', sample.id)}
                        >
                          Processar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Avisos e alertas do sistema */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Microscope className="h-5 w-5 mr-2 text-blue-600" />
                Status dos Equipamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span>HPLC-01</span>
                  </div>
                  <Badge variant="outline" className="text-green-600">Operacional</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span>GC-MS-01</span>
                  </div>
                  <Badge variant="outline" className="text-green-600">Operacional</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                    <span>Balança Analítica</span>
                  </div>
                  <Badge variant="outline" className="text-yellow-600">Requer Calibração</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                    <span>ICP-MS</span>
                  </div>
                  <Badge variant="outline" className="text-red-600">Fora de Serviço</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Wrench className="h-4 w-4 mr-2" />
                Gerenciar Equipamentos
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Equipe do Laboratório
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Ana Silva</p>
                    <p className="text-xs text-gray-700">Analista Sênior - Em serviço</p>
                  </div>
                  <div className="ml-auto">
                    <Badge variant="outline" className="bg-green-50">Online</Badge>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Carlos Mendes</p>
                    <p className="text-xs text-gray-700">Supervisor - 3 relatórios pendentes</p>
                  </div>
                  <div className="ml-auto">
                    <Badge variant="outline" className="bg-green-50">Online</Badge>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Mariana Costa</p>
                    <p className="text-xs text-gray-700">Técnica - Em manutenção</p>
                  </div>
                  <div className="ml-auto">
                    <Badge variant="outline" className="bg-gray-50">Ausente</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <User className="h-4 w-4 mr-2" />
                Gerenciar Equipe
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Alertas do sistema */}
        <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            A calibração do equipamento "Balança Analítica" está programada para amanhã. Por favor, certifique-se de que o equipamento estará disponível.
          </AlertDescription>
        </Alert>
      </div>
    </LaboratoryLayout>
  );
}