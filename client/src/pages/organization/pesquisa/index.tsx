import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Users,
  FileText,
  Building2,
  TrendingUp,
  Calendar,
  Microscope,
  ClipboardList
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Tipos
interface DashboardStats {
  pesquisasAtivas: number;
  pesquisasNovasMes: number;
  participantes: {
    total: number;
    estudos: number;
  };
  publicacoes: {
    total: number;
    emRevisao: number;
  };
  colaboracoes: {
    total: number;
    instituicoes: number;
  };
  pesquisasRecentes: Array<{
    id: number;
    titulo: string;
    descricao: string;
    status: string;
    atualizadoEm: string;
  }>;
  eventosFuturos: Array<{
    id: number;
    titulo: string;
    data: string;
    tipo: string;
  }>;
}

// Componente de estatística no card
const StatItem = ({ icon, title, value, subtitle, loading = false, className = "" }) => {
  const Icon = icon;
  return (
    <div className={`flex items-start space-x-4 ${className}`}>
      <div className="rounded-lg p-2 bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="space-y-0.5">
        {loading ? (
          <>
            <Skeleton className="h-6 w-16 mb-1" />
            <Skeleton className="h-4 w-24" />
          </>
        ) : (
          <>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold mr-1">{value}</span>
              {subtitle && <span className="text-muted-foreground text-xs">{subtitle}</span>}
            </div>
            <p className="text-sm text-muted-foreground">{title}</p>
          </>
        )}
      </div>
    </div>
  );
};

// Componente para lista de pesquisas recentes
const RecentResearchList = ({ pesquisas, loading }) => {
  if (loading) {
    return Array(3)
      .fill(0)
      .map((_, i) => (
        <div key={i} className="mb-4">
          <Skeleton className="h-5 w-3/4 mb-1" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ));
  }

  return (
    <div className="space-y-4">
      {pesquisas.map((pesquisa) => (
        <div key={pesquisa.id} className="border-b pb-3 last:border-0">
          <Link href={`/organization/pesquisa/estudos/${pesquisa.id}`}>
            <a className="group">
              <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                {pesquisa.titulo}
              </h4>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-muted-foreground line-clamp-1 max-w-[70%]">
                  {pesquisa.descricao}
                </span>
                <StatusBadge status={pesquisa.status} />
              </div>
            </a>
          </Link>
        </div>
      ))}
      {pesquisas.length === 0 && (
        <div className="text-center py-4 text-muted-foreground text-sm">
          Nenhuma pesquisa recente
        </div>
      )}
    </div>
  );
};

// Componente para badge de status
const StatusBadge = ({ status }) => {
  const statusMap = {
    em_andamento: { label: "Em andamento", color: "bg-blue-100 text-blue-700" },
    aprovada: { label: "Aprovada", color: "bg-green-100 text-green-700" },
    concluida: { label: "Concluída", color: "bg-purple-100 text-purple-700" },
    suspensa: { label: "Suspensa", color: "bg-red-100 text-red-700" },
    em_analise: { label: "Em análise", color: "bg-amber-100 text-amber-700" },
    rascunho: { label: "Rascunho", color: "bg-gray-100 text-gray-700" },
  };

  const { label, color } = statusMap[status] || 
    { label: status, color: "bg-gray-100 text-gray-700" };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${color}`}>
      {label}
    </span>
  );
};

// Componente para lista de eventos próximos
const UpcomingEventsList = ({ eventos, loading }) => {
  if (loading) {
    return Array(3)
      .fill(0)
      .map((_, i) => (
        <div key={i} className="mb-4">
          <Skeleton className="h-5 w-3/4 mb-1" />
          <Skeleton className="h-4 w-1/4 mb-1" />
        </div>
      ));
  }

  return (
    <div className="space-y-4">
      {eventos.map((evento) => (
        <div key={evento.id} className="border-b pb-3 last:border-0">
          <h4 className="font-medium text-sm">{evento.titulo}</h4>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-muted-foreground">
              {new Date(evento.data).toLocaleDateString('pt-BR')}
            </span>
            <EventTypeBadge tipo={evento.tipo} />
          </div>
        </div>
      ))}
      {eventos.length === 0 && (
        <div className="text-center py-4 text-muted-foreground text-sm">
          Nenhum evento programado
        </div>
      )}
    </div>
  );
};

// Componente para badge de tipo de evento
const EventTypeBadge = ({ tipo }) => {
  const typeMap = {
    'reunião': { label: "Reunião", color: "bg-blue-100 text-blue-700" },
    'apresentação': { label: "Apresentação", color: "bg-purple-100 text-purple-700" },
    'workshop': { label: "Workshop", color: "bg-amber-100 text-amber-700" },
    'conferência': { label: "Conferência", color: "bg-green-100 text-green-700" },
    'entrevista': { label: "Entrevista", color: "bg-indigo-100 text-indigo-700" },
  };

  const { label, color } = typeMap[tipo.toLowerCase()] || 
    { label: tipo, color: "bg-gray-100 text-gray-700" };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${color}`}>
      {label}
    </span>
  );
};

// Componente principal do dashboard
export default function PesquisaCientificaDashboard() {
  const { toast } = useToast();

  // Carregar os dados do dashboard
  const { data, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['/api/pesquisa/dashboard'],
    retry: 1,
    staleTime: 60 * 1000, // 1 minuto
  });

  // Mostrar mensagem de erro se a query falhar
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível obter os dados do dashboard de pesquisa.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Períodos para filtro
  const [periodo, setPeriodo] = React.useState("ultimos30dias");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-1">Pesquisa Científica</h2>
          <p className="text-muted-foreground">
            Acompanhe seus estudos, colaborações e publicações científicas
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="ultimos7dias">Últimos 7 dias</SelectItem>
              <SelectItem value="ultimos30dias">Últimos 30 dias</SelectItem>
              <SelectItem value="este_ano">Este ano</SelectItem>
              <SelectItem value="todos">Todo o período</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild>
            <Link href="/organization/pesquisa/estudos/novo">
              <a>Novo estudo</a>
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="visao_geral">
        <TabsList className="mb-4">
          <TabsTrigger value="visao_geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="estudos">Estudos</TabsTrigger>
          <TabsTrigger value="participantes">Participantes</TabsTrigger>
          <TabsTrigger value="publicacoes">Publicações</TabsTrigger>
        </TabsList>

        <TabsContent value="visao_geral" className="space-y-6">
          {/* Cards de estatísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Pesquisas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <StatItem
                  icon={Microscope}
                  title="Pesquisas ativas"
                  value={data?.pesquisasAtivas || 0}
                  loading={isLoading}
                />
                <StatItem
                  icon={Activity}
                  title="Novas neste mês"
                  value={data?.pesquisasNovasMes || 0}
                  loading={isLoading}
                />
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/organization/pesquisa/estudos">
                      <a>Ver todas as pesquisas</a>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Participantes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <StatItem
                  icon={Users}
                  title="Participantes ativos"
                  value={data?.participantes.total || 0}
                  loading={isLoading}
                />
                <StatItem
                  icon={ClipboardList}
                  title="Em diferentes estudos"
                  value={data?.participantes.estudos || 0}
                  loading={isLoading}
                />
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/organization/pesquisa/participantes">
                      <a>Gerenciar participantes</a>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Colaborações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <StatItem
                  icon={Building2}
                  title="Instituições parceiras"
                  value={data?.colaboracoes.instituicoes || 0}
                  loading={isLoading}
                />
                <StatItem
                  icon={FileText}
                  title="Publicações científicas"
                  value={data?.publicacoes.total || 0}
                  subtitle={data?.publicacoes.emRevisao ? 
                    `${data.publicacoes.emRevisao} em revisão` : undefined}
                  loading={isLoading}
                />
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/organization/pesquisa/colaboracoes">
                      <a>Ver colaborações</a>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pesquisas recentes e Eventos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Pesquisas recentes</CardTitle>
                <CardDescription>
                  Últimas atualizações em pesquisas científicas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentResearchList 
                  pesquisas={data?.pesquisasRecentes || []} 
                  loading={isLoading} 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Próximos eventos</CardTitle>
                <CardDescription>
                  Reuniões e eventos agendados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UpcomingEventsList 
                  eventos={data?.eventosFuturos || []} 
                  loading={isLoading} 
                />
                <div className="pt-4">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/organization/pesquisa/eventos">
                      <a>Ver calendário completo</a>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="estudos">
          <Card>
            <CardHeader>
              <CardTitle>Estudos em Andamento</CardTitle>
              <CardDescription>
                Acompanhe o status de todos os seus estudos científicos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Link href="/organization/pesquisa/estudos">
                  <a>
                    <Button>Ver todos os estudos</Button>
                  </a>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participantes">
          <Card>
            <CardHeader>
              <CardTitle>Participantes de Pesquisa</CardTitle>
              <CardDescription>
                Gerenciamento de participantes em estudos clínicos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Link href="/organization/pesquisa/participantes">
                  <a>
                    <Button>Gerenciar participantes</Button>
                  </a>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publicacoes">
          <Card>
            <CardHeader>
              <CardTitle>Publicações Científicas</CardTitle>
              <CardDescription>
                Artigos, resumos e outras publicações relacionadas às pesquisas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Link href="/organization/pesquisa/publicacoes">
                  <a>
                    <Button>Ver publicações</Button>
                  </a>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}