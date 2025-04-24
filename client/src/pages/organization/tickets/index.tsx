import React, { useState } from 'react';
import { 
  PlusCircle, Search, FilterX, RefreshCw, FileText, Calendar, 
  AlertTriangle, CheckCircle2, MessageCircle, Clock, Tag, User, Loader2 
} from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import OrganizationLayout from '@/components/layout/OrganizationLayout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SheetNewTicket } from '../../../components/SheetNewTicket';

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'novo' | 'em_analise' | 'em_desenvolvimento' | 'aguardando_resposta' | 'resolvido' | 'fechado' | 'cancelado';
  priority: 'baixa' | 'media' | 'alta' | 'critica';
  category: string;
  organizationId: number;
  createdById: number;
  assignedToId?: number | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  closedAt?: string | null;
  createdByName?: string;
  assignedToName?: string;
  organizationName?: string;
  commentCount?: number;
}

const statusLabels: Record<string, string> = {
  'novo': 'Novo',
  'em_analise': 'Em Análise',
  'em_desenvolvimento': 'Em Desenvolvimento',
  'aguardando_resposta': 'Aguardando Resposta',
  'resolvido': 'Resolvido',
  'fechado': 'Fechado',
  'cancelado': 'Cancelado'
};

const statusColors: Record<string, string> = {
  'novo': 'bg-blue-100 text-blue-800',
  'em_analise': 'bg-purple-100 text-purple-800',
  'em_desenvolvimento': 'bg-amber-100 text-amber-800',
  'aguardando_resposta': 'bg-gray-100 text-gray-800',
  'resolvido': 'bg-green-100 text-green-800',
  'fechado': 'bg-slate-100 text-slate-800',
  'cancelado': 'bg-red-100 text-red-800'
};

const priorityLabels: Record<string, string> = {
  'baixa': 'Baixa',
  'media': 'Média',
  'alta': 'Alta',
  'critica': 'Crítica'
};

const priorityColors: Record<string, string> = {
  'baixa': 'bg-green-100 text-green-800',
  'media': 'bg-blue-100 text-blue-800',
  'alta': 'bg-amber-100 text-amber-800',
  'critica': 'bg-red-100 text-red-800'
};

const categoryLabels: Record<string, string> = {
  'bug': 'Bug',
  'melhoria': 'Melhoria',
  'duvida': 'Dúvida',
  'financeiro': 'Financeiro',
  'acesso': 'Acesso',
  'seguranca': 'Segurança',
  'performance': 'Performance',
  'desenvolvimento': 'Desenvolvimento',
  'outros': 'Outros'
};

export default function TicketsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showNewTicketSheet, setShowNewTicketSheet] = useState(false);
  const { toast } = useToast();

  // Consulta para buscar tickets
  const { 
    data: tickets = [], 
    isLoading, 
    isError, 
    refetch 
  } = useQuery<Ticket[]>({
    queryKey: ['organization-tickets'],
    refetchOnWindowFocus: false,
  });

  // Função para filtrar tickets com base nos critérios atuais
  const getFilteredTickets = () => {
    return tickets.filter(ticket => {
      // Aplicar filtro de pesquisa (título)
      if (searchTerm && !ticket.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Aplicar filtro de status
      if (statusFilter && ticket.status !== statusFilter) {
        return false;
      }

      // Aplicar filtro de prioridade
      if (priorityFilter && ticket.priority !== priorityFilter) {
        return false;
      }

      // Aplicar filtro de categoria
      if (categoryFilter && ticket.category !== categoryFilter) {
        return false;
      }

      // Aplicar filtro de aba
      if (selectedTab === 'open' && ['resolvido', 'fechado', 'cancelado'].includes(ticket.status)) {
        return false;
      }
      if (selectedTab === 'closed' && !['resolvido', 'fechado', 'cancelado'].includes(ticket.status)) {
        return false;
      }
      if (selectedTab === 'critical' && ticket.priority !== 'critica') {
        return false;
      }
      if (selectedTab === 'assigned' && !ticket.assignedToId) {
        return false;
      }
      if (selectedTab === 'unassigned' && ticket.assignedToId) {
        return false;
      }

      return true;
    });
  };

  const filteredTickets = getFilteredTickets();

  // Função para limpar todos os filtros
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter(null);
    setPriorityFilter(null);
    setCategoryFilter(null);
  };

  // Função para definir o tema da aplicação
  const getTicketIcon = (ticket: Ticket) => {
    switch(ticket.status) {
      case 'novo':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'em_analise':
        return <Search className="h-4 w-4 text-purple-500" />;
      case 'em_desenvolvimento':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'aguardando_resposta':
        return <MessageCircle className="h-4 w-4 text-gray-500" />;
      case 'resolvido':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'fechado':
        return <FileText className="h-4 w-4 text-slate-500" />;
      case 'cancelado':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  // Função para navegar para a página de detalhes do ticket
  const navigateToTicket = (ticketId: number) => {
    window.location.href = `/organization/tickets/${ticketId}`;
  };

  // Função para criar um novo ticket
  const handleTicketCreated = () => {
    refetch();
    setShowNewTicketSheet(false);
    toast({
      title: "Ticket criado com sucesso",
      description: "Seu ticket foi registrado e será analisado em breve.",
    });
  };

  return (
    <OrganizationLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tickets de Suporte</CardTitle>
                <CardDescription>
                  Gerencie e acompanhe seus tickets de suporte
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowNewTicketSheet(true)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Novo Ticket
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex gap-2 flex-col sm:flex-row">
                <Select value={statusFilter || ''} onValueChange={(value) => setStatusFilter(value || null)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os Status</SelectItem>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={priorityFilter || ''} onValueChange={(value) => setPriorityFilter(value || null)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as Prioridades</SelectItem>
                    {Object.entries(priorityLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={clearFilters} size="icon" className="min-w-[40px]">
                  <FilterX className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
              <TabsList className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-6">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="open">Abertos</TabsTrigger>
                <TabsTrigger value="closed">Fechados</TabsTrigger>
                <TabsTrigger value="critical">Críticos</TabsTrigger>
                <TabsTrigger value="assigned">Atribuídos</TabsTrigger>
                <TabsTrigger value="unassigned">Não Atribuídos</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : isError ? (
                  <div className="bg-red-50 p-4 rounded-md text-red-800 text-center">
                    Erro ao carregar tickets. Por favor, tente novamente.
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div className="bg-gray-50 p-8 rounded-md text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum ticket encontrado</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm || statusFilter || priorityFilter || categoryFilter
                        ? "Nenhum ticket corresponde aos critérios de filtro atuais."
                        : "Não há tickets para exibir nesta categoria."}
                    </p>
                    {(searchTerm || statusFilter || priorityFilter || categoryFilter) && (
                      <Button variant="outline" onClick={clearFilters} size="sm">
                        <FilterX className="h-4 w-4 mr-2" />
                        Limpar Filtros
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="bg-white border rounded-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 text-xs text-gray-500">
                            <th className="px-4 py-3 text-left font-medium">ID</th>
                            <th className="px-4 py-3 text-left font-medium">Título</th>
                            <th className="px-4 py-3 text-left font-medium">Status</th>
                            <th className="px-4 py-3 text-left font-medium">Prioridade</th>
                            <th className="px-4 py-3 text-left font-medium">Categoria</th>
                            <th className="px-4 py-3 text-left font-medium">Responsável</th>
                            <th className="px-4 py-3 text-left font-medium">Data</th>
                            <th className="px-4 py-3 text-left font-medium">Comentários</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {filteredTickets.map((ticket) => (
                            <tr 
                              key={ticket.id} 
                              className="hover:bg-gray-50 cursor-pointer"
                              onClick={() => navigateToTicket(ticket.id)}
                            >
                              <td className="px-4 py-3 text-gray-700">#{ticket.id}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-start gap-2">
                                  {getTicketIcon(ticket)}
                                  <div>
                                    <div className="font-medium text-gray-900">{ticket.title}</div>
                                    <div className="text-xs text-gray-500 truncate max-w-xs">{ticket.description}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Badge className={statusColors[ticket.status]}>
                                  {statusLabels[ticket.status]}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <Badge className={priorityColors[ticket.priority]}>
                                  {priorityLabels[ticket.priority]}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  <Tag className="h-3.5 w-3.5 text-gray-500 mr-1.5" />
                                  <span className="text-sm">{categoryLabels[ticket.category] || ticket.category}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {ticket.assignedToName ? (
                                  <div className="flex items-center">
                                    <User className="h-3.5 w-3.5 text-gray-500 mr-1.5" />
                                    <span className="text-sm">{ticket.assignedToName}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-500">Não atribuído</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  <Calendar className="h-3.5 w-3.5 text-gray-500 mr-1.5" />
                                  <span className="text-sm">{format(parseISO(ticket.createdAt), 'dd/MM/yyyy', { locale: ptBR })}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  <MessageCircle className="h-3.5 w-3.5 text-gray-500 mr-1.5" />
                                  <span className="text-sm">{ticket.commentCount || 0}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Sheet para criar novo ticket */}
      <SheetNewTicket 
        open={showNewTicketSheet} 
        onOpenChange={setShowNewTicketSheet}
        onTicketCreated={handleTicketCreated}
      />
    </OrganizationLayout>
  );
}