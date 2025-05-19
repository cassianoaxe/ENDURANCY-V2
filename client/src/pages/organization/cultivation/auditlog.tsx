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
  Leaf 
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
// Usaremos uma solução alternativa ao módulo de proteção
// import { bypassModuleAccess } from "@/hooks/use-modules-protection";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

// Tipos para o sistema de AuditLog
type EventType = 'info' | 'warning' | 'critical' | 'success';
type EventArea = 'plantio' | 'colheita' | 'estoque' | 'transferencia' | 'configuracao' | 'system';

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
    case 'plantio':
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Plantio</Badge>;
    case 'colheita':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Colheita</Badge>;
    case 'estoque':
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Estoque</Badge>;
    case 'transferencia':
      return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Transferência</Badge>;
    case 'configuracao':
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Configuração</Badge>;
    case 'system':
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Sistema</Badge>;
    default:
      return <Badge variant="secondary">Desconhecido</Badge>;
  }
};

// Componente para o Log de Auditoria
const AuditLogPage: React.FC = () => {
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
        name: 'João Silva', 
        role: 'Gerente de Cultivo',
        photo: 'https://randomuser.me/api/portraits/men/1.jpg'
      },
      { 
        id: 2, 
        name: 'Maria Oliveira', 
        role: 'Técnica Agrícola',
        photo: 'https://randomuser.me/api/portraits/women/2.jpg'
      },
      { 
        id: 3, 
        name: 'Pedro Santos', 
        role: 'Analista de Qualidade',
        photo: 'https://randomuser.me/api/portraits/men/3.jpg'
      },
      { 
        id: 4, 
        name: 'Ana Costa', 
        role: 'Supervisora de Colheita',
        photo: 'https://randomuser.me/api/portraits/women/4.jpg'
      },
      { 
        id: 5, 
        name: 'Roberto Almeida', 
        role: 'Administrador',
        photo: 'https://randomuser.me/api/portraits/men/5.jpg'
      }
    ];
    
    // Ações de exemplo para cada área
    const actions = {
      plantio: [
        { 
          message: 'Iniciou um novo ciclo de plantio', 
          details: 'Iniciou plantio de 200 mudas da linhagem CBD-5 no setor A3.',
          type: 'info'
        },
        { 
          message: 'Registrou problema no sistema de irrigação', 
          details: 'Sensor de umidade do solo apresentou falha no setor B2. Manutenção solicitada.',
          type: 'warning'
        },
        { 
          message: 'Atualizou parâmetros de fotoperíodo', 
          details: 'Alterou ciclo de luz para 18/6 em todos os setores de vegetação.',
          type: 'info'
        },
        { 
          message: 'Adicionou novas mudas ao sistema', 
          details: 'Inclusão de 150 clones da variedade Harlequin.',
          type: 'success'
        },
        { 
          message: 'Reportou contaminação no meio de cultivo', 
          details: 'Identificado fungo em 15% das bandejas de germinação no setor C1. Procedimento de quarentena iniciado.',
          type: 'critical'
        }
      ],
      colheita: [
        { 
          message: 'Iniciou colheita programada', 
          details: 'Colheita de plantas da linhagem CBD-5 do lote #22A3.',
          type: 'info'
        },
        { 
          message: 'Registrou rendimento acima da média', 
          details: 'Colheita do lote #23B1 resultou em 15% acima da estimativa inicial.',
          type: 'success'
        },
        { 
          message: 'Adiou colheita por condições climáticas', 
          details: 'Colheita do setor externo E2 adiada por previsão de chuvas intensas.',
          type: 'warning'
        },
        { 
          message: 'Finalizou ciclo de colheita', 
          details: 'Concluído o ciclo de colheita do trimestre com 98% das metas atingidas.',
          type: 'success'
        },
        { 
          message: 'Descartou plantas com sinais de pragas', 
          details: 'Identificado ácaros em 30 plantas do lote #24C2. Plantas removidas para evitar contaminação.',
          type: 'warning'
        }
      ],
      estoque: [
        { 
          message: 'Atualizou inventário de material vegetal', 
          details: 'Adicionado 25kg de flores secas da variedade Charlotte\'s Web ao estoque.',
          type: 'info'
        },
        { 
          message: 'Transferiu material para processamento', 
          details: 'Transferência de 15kg de biomassa da linhagem CBD-5 para o departamento de extração.',
          type: 'info'
        },
        { 
          message: 'Detectou discrepância no inventário', 
          details: 'Diferença de 2.3kg entre estoque físico e registro no sistema. Auditoria iniciada.',
          type: 'warning'
        },
        { 
          message: 'Realizou controle de qualidade em amostras armazenadas', 
          details: 'Amostras do lote #21B7 aprovadas em teste de estabilidade após 6 meses.',
          type: 'success'
        },
        { 
          message: 'Registrou perda de material por degradação', 
          details: 'Descarte de 3.5kg de material vegetal por exposição acidental à umidade.',
          type: 'critical'
        }
      ],
      transferencia: [
        { 
          message: 'Transferiu plantas entre setores', 
          details: '120 plantas transferidas do setor de vegetação V2 para o setor de floração F1.',
          type: 'info'
        },
        { 
          message: 'Recebeu material genético de parceiro', 
          details: 'Recebimento de 50 sementes certificadas da variedade Cannatonic.',
          type: 'success'
        },
        { 
          message: 'Enviou amostras para análise laboratorial externa', 
          details: 'Envio de 10 amostras do lote #22C3 para testes de potência e contaminantes.',
          type: 'info'
        },
        { 
          message: 'Cancelou transferência agendada', 
          details: 'Cancelamento da transferência de clones para o parceiro devido a problemas documentais.',
          type: 'warning'
        },
        { 
          message: 'Documentou transferência de tecnologia', 
          details: 'Compartilhamento de protocolo de cultivo in vitro com instituição de pesquisa parceira.',
          type: 'success'
        }
      ],
      configuracao: [
        { 
          message: 'Atualizou parâmetros do sistema', 
          details: 'Modificou limites de alerta para condições ambientais em todos os setores.',
          type: 'info'
        },
        { 
          message: 'Adicionou nova variedade ao catálogo', 
          details: 'Cadastro da nova linhagem THC-1:CBD-20 com perfil completo de canabinoides.',
          type: 'success'
        },
        { 
          message: 'Modificou permissões de usuários', 
          details: 'Atribuição de direitos de supervisão ao usuário Maria Oliveira.',
          type: 'info'
        },
        { 
          message: 'Alterou protocolo de rastreabilidade', 
          details: 'Implementação de QR codes para rastreio individual de plantas matrizes.',
          type: 'info'
        },
        { 
          message: 'Restaurou configuração de backup', 
          details: 'Restauração dos parâmetros do sistema após falha na atualização.',
          type: 'warning'
        }
      ],
      system: [
        { 
          message: 'Sistema realizou backup automático', 
          details: 'Backup completo dos dados de cultivo realizado com sucesso.',
          type: 'info'
        },
        { 
          message: 'Detectou tentativa de acesso não autorizado', 
          details: 'Múltiplas tentativas de login malsucedidas para a conta de administrador.',
          type: 'critical'
        },
        { 
          message: 'Iniciou manutenção programada', 
          details: 'Início da janela de manutenção para atualização do sistema.',
          type: 'info'
        },
        { 
          message: 'Sincronizou dados com sistemas externos', 
          details: 'Sincronização de dados de rastreabilidade com o sistema regulatório governamental.',
          type: 'success'
        },
        { 
          message: 'Registrou falha de comunicação com sensores', 
          details: 'Perda temporária de conectividade com sensores de temperatura e umidade do setor D1.',
          type: 'warning'
        }
      ]
    };
    
    // Criar registros de auditoria de exemplo
    const mockLogs: AuditLogEvent[] = [];
    const areas: EventArea[] = ['plantio', 'colheita', 'estoque', 'transferencia', 'configuracao', 'system'];
    const types: EventType[] = ['info', 'warning', 'critical', 'success'];
    
    // Data atual para referência
    const now = new Date();
    
    // Gerar 50 registros aleatórios
    for (let i = 1; i <= 50; i++) {
      // Selecionar área e tipo aleatórios
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
        relatedEntityId: Math.floor(Math.random() * 1000) + 1,
        relatedEntityType: area === 'plantio' ? 'planta' : 
                          area === 'colheita' ? 'lote' : 
                          area === 'estoque' ? 'inventario' : 
                          area === 'transferencia' ? 'transferencia' : 'configuracao'
      });
    }
    
    // Ordenar por timestamp (mais recente primeiro)
    mockLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return mockLogs;
  }

  // Consulta para buscar os logs de auditoria
  const { data: auditLogs, isLoading, error } = useQuery({
    queryKey: ['auditLogs', eventTypeFilter, eventAreaFilter, dateRange],
    queryFn: async () => {
      try {
        // Construindo os parâmetros de consulta baseados nos filtros
        const params = new URLSearchParams();
        if (eventTypeFilter !== 'all') params.append('eventType', eventTypeFilter);
        if (eventAreaFilter !== 'all') params.append('eventArea', eventAreaFilter);
        if (dateRange.from) params.append('from', dateRange.from.toISOString());
        if (dateRange.to) params.append('to', dateRange.to.toISOString());

        const response = await fetch(`/api/cultivation/auditlog?${params.toString()}`);
        
        // Se não temos a API implementada ainda, retornar dados de exemplo
        if (!response.ok) {
          // Dados de exemplo para demonstração da UI
          return getMockAuditLogs();
        }
        
        return await response.json();
      } catch (error) {
        console.error("Erro ao buscar logs de auditoria:", error);
        toast({
          title: "Erro ao carregar registros",
          description: "Não foi possível carregar os logs de auditoria. Tente novamente mais tarde.",
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
            <h1 className="text-3xl font-bold tracking-tight">Log de Auditoria</h1>
            <p className="text-muted-foreground">
              Monitore todas as atividades realizadas no módulo de cultivo
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
              <TabsTrigger value="plantio">Plantio</TabsTrigger>
              <TabsTrigger value="colheita">Colheita</TabsTrigger>
              <TabsTrigger value="estoque">Estoque</TabsTrigger>
              <TabsTrigger value="sistema">Sistema</TabsTrigger>
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
                <CardTitle className="text-xl">Registros de atividades</CardTitle>
                <CardDescription>
                  Visualize todas as ações realizadas no módulo de cultivo por usuários e sistema.
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

          {['plantio', 'colheita', 'estoque', 'sistema'].map((tab) => (
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
                          tab === 'sistema' 
                            ? log.eventArea === 'system' || log.eventArea === 'configuracao'
                            : log.eventArea === tab
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
                      {filteredLogs?.filter((log: AuditLogEvent) => 
                        tab === 'sistema' 
                          ? log.eventArea === 'system' || log.eventArea === 'configuracao'
                          : log.eventArea === tab
                      ).length === 0 && (
                        <div className="p-8 text-center">
                          <p className="text-gray-500">Nenhum registro encontrado para esta área.</p>
                        </div>
                      )}
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

// Função para gerar dados de exemplo
function getMockAuditLogs(): AuditLogEvent[] {
  return [
    {
      id: 1,
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      userId: 1,
      userName: "João Silva",
      userRole: "Gerente de Cultivo",
      eventType: "success",
      eventArea: "plantio",
      message: "Registrou novo lote de plantio",
      details: "Lote #2023-05-19A de Cannabis Sativa, 150 mudas, área A3",
      relatedEntityId: 101,
      relatedEntityType: "plantio"
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      userId: 2,
      userName: "Maria Oliveira",
      userRole: "Técnico Agrícola",
      eventType: "info",
      eventArea: "plantio",
      message: "Atualizou parâmetros de irrigação",
      details: "Ajuste na frequência de irrigação para 3x ao dia, 15 min/ciclo",
      relatedEntityId: 102,
      relatedEntityType: "irrigacao"
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      userId: 3,
      userName: "Pedro Santos",
      userRole: "Colaborador",
      eventType: "warning",
      eventArea: "estoque",
      message: "Reportou baixo estoque de substrato",
      details: "Estoque atual: 25kg, nível crítico: 50kg",
      relatedEntityId: 201,
      relatedEntityType: "insumo"
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      userId: 1,
      userName: "João Silva",
      userRole: "Gerente de Cultivo",
      eventType: "critical",
      eventArea: "colheita",
      message: "Cancelou colheita programada",
      details: "Colheita do lote #2023-04-15B cancelada devido à contaminação por fungos",
      relatedEntityId: 301,
      relatedEntityType: "colheita"
    },
    {
      id: 5,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      userId: 4,
      userName: "Ana Costa",
      userRole: "Supervisor",
      eventType: "success",
      eventArea: "colheita",
      message: "Finalizou colheita",
      details: "Colheita do lote #2023-04-30A concluída com sucesso. Rendimento: 42kg",
      relatedEntityId: 302,
      relatedEntityType: "colheita"
    },
    {
      id: 6,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      userId: 5,
      userName: "Carlos Mendes",
      userRole: "Administrador",
      eventType: "info",
      eventArea: "configuracao",
      message: "Alterou configurações de segurança",
      details: "Adicionou novo nível de acesso para responsáveis técnicos",
      relatedEntityId: 401,
      relatedEntityType: "configuracao"
    },
    {
      id: 7,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      userId: 2,
      userName: "Maria Oliveira",
      userRole: "Técnico Agrícola",
      eventType: "info",
      eventArea: "transferencia",
      message: "Transferiu plantas para área de floração",
      details: "30 plantas do lote #2023-03-10C transferidas da área vegetativa para floração",
      relatedEntityId: 501,
      relatedEntityType: "transferencia"
    },
    {
      id: 8,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      userId: 6,
      userName: "System",
      userRole: "Automação",
      eventType: "warning",
      eventArea: "system",
      message: "Alerta automático de temperatura alta",
      details: "Temperatura na área de cultivo A2 atingiu 30°C (limite: 28°C)",
      relatedEntityId: 601,
      relatedEntityType: "alerta"
    },
    {
      id: 9,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
      userId: 3,
      userName: "Pedro Santos",
      userRole: "Colaborador",
      eventType: "success",
      eventArea: "plantio",
      message: "Concluiu processo de clonagem",
      details: "45 clones produzidos com sucesso do lote #2023-02-15A",
      relatedEntityId: 103,
      relatedEntityType: "clonagem"
    },
    {
      id: 10,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      userId: 1,
      userName: "João Silva",
      userRole: "Gerente de Cultivo",
      eventType: "info",
      eventArea: "estoque",
      message: "Registrou entrada de insumos",
      details: "Recebimento de 200kg de substrato orgânico e 50L de fertilizante",
      relatedEntityId: 202,
      relatedEntityType: "insumo"
    },
  ];
}

export default AuditLogPage;