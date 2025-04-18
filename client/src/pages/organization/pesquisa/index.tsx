import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  AreaChart,
  Badge,
  BarChart,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  FilePlus,
  Flask,
  FlaskConical,
  GraduationCap,
  Microscope,
  PieChart,
  Plus,
  RefreshCcw,
  Users,
} from "lucide-react";

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

// Componente para dados estatísticos
const StatCard = ({ title, value, icon, description, footer, trend, color = "bg-primary" }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          <div className={`rounded-md p-2 ${color}`}>
            {React.cloneElement(icon, { className: "h-4 w-4 text-white" })}
          </div>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={`text-xs font-medium flex items-center ${trend.color}`}>
            {trend.icon}
            <span className="ml-1">{trend.text}</span>
          </p>
        )}
      </CardContent>
      {footer && (
        <CardFooter className="pt-0">
          <p className="text-xs text-muted-foreground">{footer}</p>
        </CardFooter>
      )}
    </Card>
  );
};

// Formatador de data
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

// Componente de status para pesquisa
const StatusBadge = ({ status }) => {
  const statusConfig = {
    em_andamento: { label: "Em andamento", variant: "default" },
    aprovada: { label: "Aprovada", variant: "success" },
    concluida: { label: "Concluída", variant: "secondary" },
    suspensa: { label: "Suspensa", variant: "destructive" },
    em_analise: { label: "Em análise", variant: "warning" },
    rascunho: { label: "Rascunho", variant: "outline" },
  };

  const config = statusConfig[status] || { label: status.replace('_', ' '), variant: "default" };
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
};

export default function PesquisaCientificaDashboard() {
  const { toast } = useToast();
  
  // Buscar dados do dashboard
  const { data, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['/api/pesquisa/dashboard'],
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
  });

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível obter as estatísticas da pesquisa científica.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Pesquisa Científica</h2>
            <p className="text-muted-foreground">
              Gerencie seus estudos científicos, publicações e colaborações
            </p>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b py-3">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card className="col-span-3">
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b py-3">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Dados fictícios para caso a API não retorne dados (isso seria substituído pelos dados reais)
  const fallbackData: DashboardStats = {
    pesquisasAtivas: 0,
    pesquisasNovasMes: 0,
    participantes: {
      total: 0,
      estudos: 0,
    },
    publicacoes: {
      total: 0,
      emRevisao: 0,
    },
    colaboracoes: {
      total: 0,
      instituicoes: 0,
    },
    pesquisasRecentes: [],
    eventosFuturos: [],
  };

  // Use dados da API ou fallback
  const stats = data || fallbackData;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pesquisa Científica</h2>
          <p className="text-muted-foreground">
            Gerencie seus estudos científicos, publicações e colaborações acadêmicas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/organization/pesquisa/estudos">
              <a className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>Listar Estudos</span>
              </a>
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/organization/pesquisa/estudos/novo">
              <a className="flex items-center gap-1">
                <FilePlus className="h-4 w-4" />
                <span>Nova Pesquisa</span>
              </a>
            </Link>
          </Button>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pesquisas Ativas"
          value={stats.pesquisasAtivas}
          icon={<Microscope />}
          description="Total de estudos em andamento"
          footer="Acompanhe o progresso em tempo real"
          color="bg-blue-500"
        />
        
        <StatCard
          title="Participantes"
          value={stats.participantes.total}
          icon={<Users />}
          description={`Em ${stats.participantes.estudos} estudos diferentes`}
          footer="Controle detalhado de cada participante"
          color="bg-emerald-500"
        />
        
        <StatCard
          title="Publicações"
          value={stats.publicacoes.total}
          icon={<BookOpen />}
          description={`${stats.publicacoes.emRevisao} em revisão`}
          footer="Acompanhe o impacto científico"
          color="bg-purple-500"
        />
        
        <StatCard
          title="Colaborações"
          value={stats.colaboracoes.total}
          icon={<GraduationCap />}
          description={`Com ${stats.colaboracoes.instituicoes} instituições`}
          footer="Parcerias acadêmicas e institucionais"
          color="bg-amber-500"
        />
      </div>

      {/* Conteúdo Principal */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        {/* Lista de Pesquisas Recentes */}
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pesquisas Recentes</CardTitle>
              <CardDescription>
                Estudos atualizados ou criados recentemente
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/organization/pesquisa/estudos">
                <a>Ver todos</a>
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {stats.pesquisasRecentes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <FlaskConical className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma pesquisa científica ainda.
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href="/organization/pesquisa/estudos/novo">
                      <a className="flex items-center gap-1">
                        <Plus className="h-4 w-4" />
                        <span>Criar nova pesquisa</span>
                      </a>
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.pesquisasRecentes.map((pesquisa) => (
                    <div
                      key={pesquisa.id}
                      className="flex flex-col sm:flex-row sm:items-start justify-between border-b pb-4"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <Link href={`/organization/pesquisa/estudos/${pesquisa.id}`}>
                            <a className="font-medium hover:underline">{pesquisa.titulo}</a>
                          </Link>
                          <StatusBadge status={pesquisa.status} />
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                          {pesquisa.descricao}
                        </p>
                      </div>
                      <div className="flex items-center mt-2 sm:mt-0">
                        <p className="text-sm text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(pesquisa.atualizadoEm)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Próximos Eventos e Indicadores Adicionais */}
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Agenda de Pesquisa</CardTitle>
            <CardDescription>Próximos eventos e acompanhamentos</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {stats.eventosFuturos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum evento agendado.
                  </p>
                  <Button className="mt-4" variant="outline" asChild>
                    <Link href="/organization/pesquisa/eventos/novo">
                      <a className="flex items-center gap-1">
                        <Plus className="h-4 w-4" />
                        <span>Agendar evento</span>
                      </a>
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.eventosFuturos.map((evento) => (
                    <div
                      key={evento.id}
                      className="flex items-start justify-between border-b pb-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-normal">
                            {evento.tipo}
                          </Badge>
                        </div>
                        <p className="font-medium">{evento.titulo}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge variant="secondary" className="mb-1">
                          {formatDate(evento.data)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para análises */}
      <Tabs defaultValue="publicacoes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="publicacoes">Análise de Publicações</TabsTrigger>
          <TabsTrigger value="participantes">Dados de Participantes</TabsTrigger>
          <TabsTrigger value="recursos">Utilização de Recursos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="publicacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Produção Científica</CardTitle>
              <CardDescription>
                Estatísticas e métricas de publicações científicas
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="w-full max-w-3xl h-[300px] flex items-center justify-center">
                {stats.publicacoes.total === 0 ? (
                  <div className="text-center">
                    <PieChart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Sem dados de publicações para análise.
                    </p>
                    <Button className="mt-4" variant="outline" size="sm" asChild>
                      <Link href="/organization/pesquisa/publicacoes/nova">
                        <a>Adicionar publicação</a>
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <BarChart className="h-16 w-16 text-primary/60 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Representação gráfica em desenvolvimento.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="participantes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados Demográficos de Participantes</CardTitle>
              <CardDescription>
                Informações estatísticas sobre os participantes de pesquisa
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="w-full max-w-3xl h-[300px] flex items-center justify-center">
                {stats.participantes.total === 0 ? (
                  <div className="text-center">
                    <Users className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Sem dados de participantes para análise.
                    </p>
                    <Button className="mt-4" variant="outline" size="sm">
                      Adicionar participantes
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <AreaChart className="h-16 w-16 text-primary/60 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Representação gráfica em desenvolvimento.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recursos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Utilização de Recursos</CardTitle>
              <CardDescription>
                Alocação de recursos por projeto e área de pesquisa
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="w-full max-w-3xl h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <Flask className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Módulo de alocação de recursos em desenvolvimento.
                  </p>
                  <Button className="mt-4" variant="outline" size="sm">
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Verificar novamente
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