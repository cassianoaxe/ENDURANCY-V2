import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  FileText, 
  ChevronRight, 
  Building, 
  FilePlus, 
  FileSearch,
  Database,
  Activity,
  ArrowUpRight,
  Calendar,
  Users,
  Clipboard,
  ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ResearcherLayout from '@/components/layout/researcher/ResearcherLayout';
import { useToast } from "@/hooks/use-toast";
import { useLocation } from 'wouter';

interface StatusBadgeProps {
  status: 'Em Andamento' | 'Em Análise' | 'Aprovada' | string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  let bgColor = '';
  let textColor = '';

  switch (status) {
    case 'Em Andamento':
      bgColor = 'bg-black';
      textColor = 'text-white';
      break;
    case 'Em Análise':
      bgColor = 'bg-amber-100';
      textColor = 'text-amber-700';
      break;
    case 'Aprovada':
      bgColor = 'bg-green-100';
      textColor = 'text-green-700';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-700';
  }

  return (
    <Badge className={`${bgColor} ${textColor} hover:${bgColor}`}>{status}</Badge>
  );
};

interface DashboardCardProps {
  title: string;
  value: number;
  subtext: string;
  className?: string;
}

const DashboardCard = ({ title, value, subtext, className = '' }: DashboardCardProps) => (
  <div className={`bg-white p-4 rounded-lg shadow-sm border border-gray-100 ${className}`}>
    <p className="text-gray-500 text-sm">{title}</p>
    <h2 className="text-3xl font-bold mt-1">{value}</h2>
    <p className="text-xs text-gray-500 mt-1">{subtext}</p>
  </div>
);

export default function ResearcherDashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    pesquisasAtivas: 0,
    participantes: 0,
    publicacoes: 0,
    colaboracoes: 0,
    novasPesquisas: 0,
    estudosDiferentes: 0,
    emRevisao: 0,
    instituicoesDiferentes: 0
  });

  const [pesquisasRecentes, setPesquisasRecentes] = useState<Array<{
    id: number;
    title: string;
    status: 'Em Andamento' | 'Em Análise' | 'Aprovada';
    updatedText: string;
  }>>([]);

  const [proximosEventos, setProximosEventos] = useState<Array<{
    id: number;
    title: string;
    formattedDate: string;
  }>>([]);
  
  useEffect(() => {
    // Simulação de carregamento para demonstração
    const timer = setTimeout(() => {
      // Dados de exemplo para demonstração
      setDashboardData({
        pesquisasAtivas: 12,
        participantes: 248,
        publicacoes: 18,
        colaboracoes: 5,
        novasPesquisas: 2,
        estudosDiferentes: 8,
        emRevisao: 3,
        instituicoesDiferentes: 3
      });
      
      setPesquisasRecentes([
        { 
          id: 1, 
          title: 'Eficácia do CBD na epilepsia refratária',
          status: 'Em Andamento',
          updatedText: 'Atualizado Hoje'
        },
        { 
          id: 2, 
          title: 'Efeitos da cannabis em pacientes com dor crônica',
          status: 'Em Análise',
          updatedText: 'Atualizado Ontem'
        },
        { 
          id: 3, 
          title: 'Estudo comparativo de diferentes cepas',
          status: 'Aprovada',
          updatedText: 'Atualizado 2 dias atrás'
        }
      ]);
      
      setProximosEventos([
        {
          id: 1,
          title: 'Reunião do Comitê de Ética',
          formattedDate: '15/03/2024'
        },
        {
          id: 2,
          title: 'Apresentação de Resultados Preliminares',
          formattedDate: '20/03/2024'
        },
        {
          id: 3,
          title: 'Workshop de Metodologia',
          formattedDate: '25/03/2024'
        }
      ]);
      
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <ResearcherLayout>
      <div className="container mx-auto p-6">
        <div className="flex flex-col space-y-6">
          {/* Cabeçalho */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Dashboard de Pesquisa Científica</h1>
              <p className="text-gray-500">Acompanhe e gerencie todas as atividades de pesquisa</p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => setLocation('/researcher/nova-pesquisa')}>
              <FilePlus className="h-4 w-4 mr-2" />
              Nova Pesquisa
            </Button>
          </div>

          {/* Cards de estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <DashboardCard 
              title="Pesquisas Ativas" 
              value={dashboardData.pesquisasAtivas} 
              subtext={`+${dashboardData.novasPesquisas} novas este mês`} 
            />
            <DashboardCard 
              title="Participantes" 
              value={dashboardData.participantes} 
              subtext={`Em ${dashboardData.estudosDiferentes} estudos diferentes`} 
            />
            <DashboardCard 
              title="Publicações" 
              value={dashboardData.publicacoes} 
              subtext={`${dashboardData.emRevisao} em processo de revisão`} 
            />
            <DashboardCard 
              title="Colaborações" 
              value={dashboardData.colaboracoes} 
              subtext={`Com ${dashboardData.instituicoesDiferentes} instituições diferentes`} 
            />
          </div>

          {/* Conteúdo do dashboard em 3 colunas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Coluna 1: Acesso Rápido */}
            <Card>
              <CardHeader>
                <CardTitle>Acesso Rápido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-gray-700" 
                  onClick={() => setLocation('/researcher/catalogo')}
                >
                  <FileSearch className="h-4 w-4 mr-3" />
                  Catálogo de Pesquisas
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-gray-700" 
                  onClick={() => setLocation('/researcher/pacientes')}
                >
                  <Database className="h-4 w-4 mr-3" />
                  Banco de Pacientes
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-gray-700" 
                  onClick={() => setLocation('/researcher/doencas')}
                >
                  <Activity className="h-4 w-4 mr-3" />
                  Doenças e Condições
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-gray-700" 
                  onClick={() => setLocation('/researcher/estatisticas')}
                >
                  <BarChart className="h-4 w-4 mr-3" />
                  Estatísticas
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-gray-700" 
                  onClick={() => setLocation('/researcher/grupos')}
                >
                  <Users className="h-4 w-4 mr-3" />
                  Grupos de Pesquisa
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-gray-700" 
                  onClick={() => setLocation('/researcher/protocolos')}
                >
                  <Clipboard className="h-4 w-4 mr-3" />
                  Protocolos
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-gray-700" 
                  onClick={() => setLocation('/researcher/colaboracoes')}
                >
                  <Building className="h-4 w-4 mr-3" />
                  Colaborações
                </Button>
              </CardContent>
            </Card>

            {/* Coluna 2: Pesquisas Recentes */}
            <Card>
              <CardHeader>
                <CardTitle>Pesquisas Recentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-5 bg-gray-200 rounded-full w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded-full w-1/3 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded-full w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {pesquisasRecentes.map((pesquisa) => (
                      <div key={pesquisa.id} className="space-y-2" onClick={() => setLocation(`/researcher/catalogo/${pesquisa.id}`)} style={{cursor: 'pointer'}}>
                        <h3 className="font-medium">{pesquisa.title}</h3>
                        <div className="flex justify-between items-center">
                          <StatusBadge status={pesquisa.status} />
                          <span className="text-sm text-gray-500">{pesquisa.updatedText}</span>
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="ghost" 
                      className="w-full text-gray-700" 
                      onClick={() => setLocation('/researcher/catalogo')}
                    >
                      Ver todas as pesquisas
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Coluna 3: Próximos Eventos */}
            <Card>
              <CardHeader>
                <CardTitle>Próximos Eventos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-5 bg-gray-200 rounded-full w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded-full w-1/4"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {proximosEventos.map((evento) => (
                      <div key={evento.id} className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{evento.title}</h3>
                          <p className="text-sm text-gray-500">{evento.formattedDate}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setLocation(`/researcher/eventos/${evento.id}`)}
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ResearcherLayout>
  );
}