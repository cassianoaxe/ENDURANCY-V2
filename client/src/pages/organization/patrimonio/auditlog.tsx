import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  CalendarIcon, 
  Search, 
  Filter, 
  Clock, 
  User, 
  Activity, 
  AlertTriangle, 
  Check, 
  InfoIcon, 
  FileText, 
  Building2,
  Clipboard,
  DollarSign,
  Calculator,
  Package
} from "lucide-react";

import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

// Tipos para o sistema de AuditLog
type EventType = 'info' | 'warning' | 'critical' | 'success';
type EventArea = 'registro' | 'depreciacao' | 'manutencao' | 'movimentacao' | 'baixa' | 'configuracao' | 'system';

interface AuditLogEvent {
  id: number;
  timestamp: string;
  userId: number;
  userName: string;
  userRole: string;
  userPhoto?: string;
  eventType: EventType;
  eventArea: EventArea;
  message: string;
  details?: string;
  relatedEntityId?: number;
  relatedEntityType?: string;
}

// Função para renderizar o ícone correto baseado no tipo de evento
const getEventIcon = (eventType: EventType) => {
  switch (eventType) {
    case 'info':
      return <InfoIcon className="h-5 w-5 text-blue-500" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case 'critical':
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case 'success':
      return <Check className="h-5 w-5 text-green-500" />;
    default:
      return <Activity className="h-5 w-5 text-gray-500" />;
  }
};

// Função para renderizar a badge correta baseada no tipo de evento
const getEventBadge = (eventType: EventType) => {
  switch (eventType) {
    case 'info':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Informação</Badge>;
    case 'warning':
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Alerta</Badge>;
    case 'critical':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Crítico</Badge>;
    case 'success':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Sucesso</Badge>;
    default:
      return <Badge variant="outline">Desconhecido</Badge>;
  }
};

// Função para renderizar a área do evento
const getEventArea = (eventArea: EventArea) => {
  switch (eventArea) {
    case 'registro':
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Registro</Badge>;
    case 'depreciacao':
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Depreciação</Badge>;
    case 'manutencao':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Manutenção</Badge>;
    case 'movimentacao':
      return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Movimentação</Badge>;
    case 'baixa':
      return <Badge variant="secondary" className="bg-red-100 text-red-800">Baixa</Badge>;
    case 'configuracao':
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Configuração</Badge>;
    case 'system':
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Sistema</Badge>;
    default:
      return <Badge variant="secondary">Desconhecido</Badge>;
  }
};

// Componente para o Log de Auditoria de Patrimônio
const PatrimonioAuditLogPage: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<EventType | 'all'>('all');
  const [eventAreaFilter, setEventAreaFilter] = useState<EventArea | 'all'>('all');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [currentTab, setCurrentTab] = useState('todos');

  // Função para gerar dados de exemplo para o log de auditoria
  function getMockAuditLogs(): AuditLogEvent[] {
    // Usuários de exemplo
    const users = [
      { 
        id: 1, 
        name: 'Carlos Mendes', 
        role: 'Gerente de Patrimônio',
        photo: 'https://randomuser.me/api/portraits/men/12.jpg'
      },
      { 
        id: 2, 
        name: 'Amanda Silva', 
        role: 'Analista de Ativos',
        photo: 'https://randomuser.me/api/portraits/women/23.jpg'
      },
      { 
        id: 3, 
        name: 'Roberto Ferreira', 
        role: 'Técnico de Manutenção',
        photo: 'https://randomuser.me/api/portraits/men/32.jpg'
      },
      { 
        id: 4, 
        name: 'Fernanda Costa', 
        role: 'Coordenadora Financeira',
        photo: 'https://randomuser.me/api/portraits/women/45.jpg'
      },
      { 
        id: 5, 
        name: 'Marcelo Almeida', 
        role: 'Administrador',
        photo: 'https://randomuser.me/api/portraits/men/54.jpg'
      }
    ];
    
    // Ações de exemplo para cada área
    const actions = {
      registro: [
        { 
          message: 'Registrou novo ativo no sistema', 
          details: 'Adicionado equipamento "Microscópio Óptico Olympus BX53" no valor de R$ 38.500,00.',
          type: 'info'
        },
        { 
          message: 'Editou informações de ativo', 
          details: 'Atualizada a localização do ativo #1028 de "Laboratório 3" para "Laboratório 5".',
          type: 'info'
        },
        { 
          message: 'Registrou aquisição em lote', 
          details: 'Importados 15 novos itens de mobiliário para o setor administrativo via planilha.',
          type: 'success'
        },
        { 
          message: 'Corrigiu valor de aquisição', 
          details: 'Ajustado valor do Cromatógrafo HPLC de R$ 125.000,00 para R$ 127.500,00 após nota fiscal.',
          type: 'info'
        },
        { 
          message: 'Vinculou documentos ao ativo', 
          details: 'Anexada nota fiscal, certificado de garantia e manual ao ativo #1045 (Estufa de Secagem).',
          type: 'info'
        }
      ],
      depreciacao: [
        { 
          message: 'Atualizou taxa de depreciação', 
          details: 'Alterada taxa de depreciação anual da categoria "Equipamentos de Informática" de 20% para 25%.',
          type: 'warning'
        },
        { 
          message: 'Executou cálculo mensal de depreciação', 
          details: 'Processada a depreciação de 184 ativos para o mês de Maio/2025.',
          type: 'success'
        },
        { 
          message: 'Corrigiu valor residual de ativos', 
          details: 'Ajustado valor residual de 12 equipamentos da categoria "Maquinário Agrícola".',
          type: 'info'
        },
        { 
          message: 'Identificou erro no cálculo de depreciação', 
          details: 'Sistema detectou inconsistência nos valores residuais de 3 ativos. Correção manual necessária.',
          type: 'critical'
        },
        { 
          message: 'Gerou relatório de projeção de depreciação', 
          details: 'Criado relatório com projeção de depreciação para os próximos 5 anos.',
          type: 'success'
        }
      ],
      manutencao: [
        { 
          message: 'Registrou manutenção preventiva', 
          details: 'Agendada manutenção preventiva para 5 equipamentos do setor de cultivo.',
          type: 'info'
        },
        { 
          message: 'Reportou necessidade de manutenção corretiva', 
          details: 'Solicitada manutenção urgente para o sistema de climatização do setor de processamento.',
          type: 'warning'
        },
        { 
          message: 'Concluiu manutenção de equipamento', 
          details: 'Finalizada a manutenção do Extrator #2 com sucesso. Equipamento liberado para operação.',
          type: 'success'
        },
        { 
          message: 'Atualizou histórico de manutenção', 
          details: 'Incluídas 8 novas entradas no histórico de manutenção do ativo #1036.',
          type: 'info'
        },
        { 
          message: 'Cancelou manutenção programada', 
          details: 'Cancelada manutenção preventiva dos equipamentos de refrigeração por indisponibilidade técnica.',
          type: 'warning'
        }
      ],
      movimentacao: [
        { 
          message: 'Transferiu ativo entre departamentos', 
          details: 'Transferido Notebook Dell XPS (Patrimônio #1056) do setor Administrativo para o setor de P&D.',
          type: 'info'
        },
        { 
          message: 'Realizou inventário físico', 
          details: 'Concluído inventário físico do setor Laboratório com 98% de precisão.',
          type: 'success'
        },
        { 
          message: 'Detectou divergência em inventário', 
          details: 'Encontrada diferença de 3 itens entre o inventário físico e o registro no sistema. Auditoria iniciada.',
          type: 'warning'
        },
        { 
          message: 'Empréstimo temporário de equipamento', 
          details: 'Registrado empréstimo do Microscópio #1028 para o departamento de Pesquisa por 30 dias.',
          type: 'info'
        },
        { 
          message: 'Atualização de localização em massa', 
          details: 'Atualizadas localizações de 27 itens após reorganização do departamento de produção.',
          type: 'info'
        }
      ],
      baixa: [
        { 
          message: 'Registrou baixa de ativo por obsolescência', 
          details: 'Realizada baixa do ativo #1015 (Computador Desktop) por obsolescência tecnológica após 6 anos de uso.',
          type: 'info'
        },
        { 
          message: 'Baixa por perda/extravio', 
          details: 'Registrada baixa do Tablet Samsung (Patrimônio #1062) por extravio. Processo de sindicância iniciado.',
          type: 'warning'
        },
        { 
          message: 'Aprovou pedido de baixa coletiva', 
          details: 'Aprovada a baixa de 12 itens de mobiliário danificados após vistoria técnica.',
          type: 'success'
        },
        { 
          message: 'Baixa por venda de ativos', 
          details: 'Registrada venda de 3 veículos usados da frota corporativa, com atualização do valor residual.',
          type: 'info'
        },
        { 
          message: 'Cancelou processo de baixa', 
          details: 'Cancelada a baixa do equipamento #1089 após decisão de reparo e reaproveitamento.',
          type: 'info'
        }
      ],
      configuracao: [
        { 
          message: 'Criou nova categoria de ativos', 
          details: 'Adicionada categoria "Equipamentos de Cultivo Indoor" com parâmetros específicos de depreciação.',
          type: 'info'
        },
        { 
          message: 'Atualizou parâmetros contábeis', 
          details: 'Ajustados parâmetros de contabilização de depreciação conforme nova legislação fiscal.',
          type: 'warning'
        },
        { 
          message: 'Modificou estrutura hierárquica', 
          details: 'Reorganizada a estrutura de departamentos e centros de custo para alocação de ativos.',
          type: 'info'
        },
        { 
          message: 'Configurou integração com sistema financeiro', 
          details: 'Estabelecida integração automática com o módulo financeiro para contabilização de depreciação.',
          type: 'success'
        },
        { 
          message: 'Alterou política de aprovação de baixas', 
          details: 'Modificado fluxo de aprovação para baixa de ativos acima de R$ 10.000,00, exigindo aprovação da diretoria.',
          type: 'info'
        }
      ],
      system: [
        { 
          message: 'Sistema realizou backup dos dados patrimoniais', 
          details: 'Backup completo das informações de ativos e histórico de movimentações realizado com sucesso.',
          type: 'info'
        },
        { 
          message: 'Falha na integração com sistema contábil', 
          details: 'Detectado erro na sincronização de valores de depreciação com o sistema contábil. Correção necessária.',
          type: 'critical'
        },
        { 
          message: 'Atualização do módulo de patrimônio', 
          details: 'Sistema atualizado para a versão 2.5.3 com novos recursos de gestão de ativos.',
          type: 'success'
        },
        { 
          message: 'Manutenção programada do sistema', 
          details: 'Módulo de patrimônio ficará indisponível das 23h às 5h para manutenção do banco de dados.',
          type: 'warning'
        },
        { 
          message: 'Geração automática de relatórios mensais', 
          details: 'Sistema gerou automaticamente os relatórios de patrimônio do mês de Abril/2025.',
          type: 'info'
        }
      ]
    };
    
    // Criar registros de auditoria de exemplo
    const mockLogs: AuditLogEvent[] = [];
    const areas: EventArea[] = ['registro', 'depreciacao', 'manutencao', 'movimentacao', 'baixa', 'configuracao', 'system'];
    const types: EventType[] = ['info', 'warning', 'critical', 'success'];
    
    // Data atual para referência
    const now = new Date();
    
    // Gerar 50 registros aleatórios
    for (let i = 1; i <= 50; i++) {
      // Selecionar área aleatória
      const area = areas[Math.floor(Math.random() * areas.length)] as EventArea;
      
      // Selecionar ação aleatória da área específica
      const actionIndex = Math.floor(Math.random() * actions[area].length);
      const action = actions[area][actionIndex];
      
      // Selecionar usuário aleatório
      const user = users[Math.floor(Math.random() * users.length)];
      
      // Gerar timestamp aleatório nos últimos 30 dias
      const timestamp = new Date(now);
      timestamp.setDate(now.getDate() - Math.floor(Math.random() * 30));
      timestamp.setHours(Math.floor(Math.random() * 24));
      timestamp.setMinutes(Math.floor(Math.random() * 60));
      
      // Criar o registro
      mockLogs.push({
        id: i,
        timestamp: timestamp.toISOString(),
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        userPhoto: user.photo,
        eventType: action.type as EventType,
        eventArea: area,
        message: action.message,
        details: action.details,
        relatedEntityId: Math.floor(Math.random() * 1000) + 1000,
        relatedEntityType: area === 'registro' ? 'ativo' : 
                          area === 'depreciacao' ? 'calculo' : 
                          area === 'manutencao' ? 'manutencao' : 
                          area === 'movimentacao' ? 'movimentacao' : 
                          area === 'baixa' ? 'baixa' : 'configuracao'
      });
    }
    
    // Ordenar por timestamp (mais recente primeiro)
    mockLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return mockLogs;
  }

  // Consulta para buscar os logs de auditoria
  const { data: auditLogs, isLoading, error } = useQuery({
    queryKey: ['patrimonioAuditLogs', eventTypeFilter, eventAreaFilter, dateRange],
    queryFn: async () => {
      try {
        // Construindo os parâmetros de consulta baseados nos filtros
        const params = new URLSearchParams();
        if (eventTypeFilter !== 'all') params.append('eventType', eventTypeFilter);
        if (eventAreaFilter !== 'all') params.append('eventArea', eventAreaFilter);
        if (dateRange.from) params.append('from', dateRange.from.toISOString());
        if (dateRange.to) params.append('to', dateRange.to.toISOString());

        const response = await fetch(`/api/patrimonio/auditlog?${params.toString()}`);
        
        // Se não temos a API implementada ainda, retornar dados de exemplo
        if (!response.ok) {
          // Dados de exemplo para demonstração da UI
          return getMockAuditLogs();
        }
        
        return await response.json();
      } catch (error) {
        console.error("Erro ao buscar logs de auditoria do patrimônio:", error);
        toast({
          title: "Erro ao carregar registros",
          description: "Não foi possível carregar os logs de auditoria do patrimônio. Tente novamente mais tarde.",
          variant: "default"
        });
        // Retornar dados de exemplo para garantir que a UI tenha algo para mostrar
        return getMockAuditLogs();
      }
    }
  });

  // Filtrando os logs baseado no termo de busca
  const filteredLogs = auditLogs?.filter((log: AuditLogEvent) => {
    return (
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Função para limpar os filtros
  const clearFilters = () => {
    setSearchTerm('');
    setEventTypeFilter('all');
    setEventAreaFilter('all');
    setDateRange({ from: undefined, to: undefined });
  };

  // Renderizar o esqueleto de carregamento
  const renderSkeletons = () => {
    return Array(5).fill(0).map((_, index) => (
      <div key={index} className="flex space-x-4 items-start p-4 border-b">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-5/6" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
    ));
  };

  return (
    <OrganizationLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Log de Auditoria - Patrimônio</h1>
            <p className="text-muted-foreground">
              Monitore todas as atividades realizadas no módulo de patrimônio
            </p>
          </div>
        </div>

        <Tabs 
          defaultValue="todos" 
          value={currentTab}
          onValueChange={setCurrentTab}
          className="space-y-4"
        >
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="todos">Todos os Eventos</TabsTrigger>
              <TabsTrigger value="registro">Registro</TabsTrigger>
              <TabsTrigger value="depreciacao">Depreciação</TabsTrigger>
              <TabsTrigger value="manutencao">Manutenção</TabsTrigger>
              <TabsTrigger value="baixa">Baixa</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center h-8 px-2 gap-1">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span>
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd/MM/yy")} - {format(dateRange.to, "dd/MM/yy")}
                          </>
                        ) : (
                          format(dateRange.from, "dd/MM/yy")
                        )
                      ) : (
                        "Filtrar por data"
                      )}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={setDateRange as any}
                    numberOfMonths={2}
                    locale={ptBR}
                  />
                  <div className="flex items-center justify-between p-3 border-t">
                    <Button
                      variant="ghost"
                      onClick={() => setDateRange({ from: undefined, to: undefined })}
                    >
                      Limpar
                    </Button>
                    <Button
                      onClick={() => {
                        // Fechar o popover
                        document.body.click();
                      }}
                    >
                      Aplicar
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <Select
                value={eventTypeFilter}
                onValueChange={(value) => setEventTypeFilter(value as EventType | 'all')}
              >
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue placeholder="Tipo de evento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="info">Informação</SelectItem>
                  <SelectItem value="warning">Alerta</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar nos registros..."
                  className="w-full bg-white pl-8 h-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Button variant="ghost" size="icon" onClick={clearFilters}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="todos" className="space-y-4">
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-xl">Registros de atividades de Patrimônio</CardTitle>
                <CardDescription>
                  Visualize todas as ações realizadas no módulo de patrimônio por usuários e sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  renderSkeletons()
                ) : error ? (
                  <div className="p-8 text-center">
                    <p className="text-red-500">Erro ao carregar os registros de auditoria.</p>
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.reload()} 
                      className="mt-2"
                    >
                      Tentar novamente
                    </Button>
                  </div>
                ) : filteredLogs?.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">Nenhum registro encontrado com os filtros atuais.</p>
                    <Button 
                      variant="outline" 
                      onClick={clearFilters} 
                      className="mt-2"
                    >
                      Limpar filtros
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredLogs?.map((log: AuditLogEvent) => (
                      <div key={log.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-10 w-10 border">
                            <AvatarImage src={log.userPhoto} alt={log.userName} />
                            <AvatarFallback>
                              {log.userName.split(' ').map(name => name[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 space-y-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div>
                                <span className="font-medium">{log.userName}</span>
                                <span className="text-gray-500 text-sm ml-2">{log.userRole}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {getEventArea(log.eventArea)}
                                {getEventBadge(log.eventType)}
                              </div>
                            </div>
                            
                            <p className="text-gray-700">{log.message}</p>
                            
                            {log.details && (
                              <p className="text-sm text-gray-500">{log.details}</p>
                            )}
                            
                            <div className="flex items-center text-sm text-gray-500 pt-1">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              <span>
                                {format(new Date(log.timestamp), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {['registro', 'depreciacao', 'manutencao', 'baixa', 'sistema'].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-xl">Registros de {tab}</CardTitle>
                  <CardDescription>
                    Visualize as atividades específicas da área de {tab}.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    renderSkeletons()
                  ) : (
                    <div className="divide-y">
                      {filteredLogs
                        ?.filter((log: AuditLogEvent) => 
                          tab === 'sistema' ? log.eventArea === 'system' || log.eventArea === 'configuracao' : log.eventArea === tab as EventArea
                        )
                        .map((log: AuditLogEvent) => (
                          <div key={log.id} className="p-4 hover:bg-gray-50">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-10 w-10 border">
                                <AvatarImage src={log.userPhoto} alt={log.userName} />
                                <AvatarFallback>
                                  {log.userName.split(' ').map(name => name[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 space-y-1">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                  <div>
                                    <span className="font-medium">{log.userName}</span>
                                    <span className="text-gray-500 text-sm ml-2">{log.userRole}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {getEventArea(log.eventArea)}
                                    {getEventBadge(log.eventType)}
                                  </div>
                                </div>
                                
                                <p className="text-gray-700">{log.message}</p>
                                
                                {log.details && (
                                  <p className="text-sm text-gray-500">{log.details}</p>
                                )}
                                
                                <div className="flex items-center text-sm text-gray-500 pt-1">
                                  <Clock className="h-3.5 w-3.5 mr-1" />
                                  <span>
                                    {format(new Date(log.timestamp), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </OrganizationLayout>
  );
};

export default PatrimonioAuditLogPage;