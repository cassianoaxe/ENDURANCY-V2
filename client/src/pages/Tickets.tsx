import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, RefreshCw, Search, Filter, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Tipo para o ticket
interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'novo' | 'em_analise' | 'em_desenvolvimento' | 'aguardando_resposta' | 'resolvido' | 'fechado' | 'cancelado';
  priority: 'baixa' | 'media' | 'alta' | 'critica';
  category: 'bug' | 'melhoria' | 'duvida' | 'financeiro' | 'acesso' | 'seguranca' | 'performance' | 'desenvolvimento' | 'outros';
  organizationId: number;
  organization?: string;
  createdAt: string;
  updatedAt: string;
}

// Cores de status
const statusColors: Record<string, string> = {
  novo: 'bg-gray-100 text-gray-800',
  em_analise: 'bg-blue-100 text-blue-800',
  em_desenvolvimento: 'bg-indigo-100 text-indigo-800',
  aguardando_resposta: 'bg-yellow-100 text-yellow-800',
  resolvido: 'bg-green-100 text-green-800',
  fechado: 'bg-gray-100 text-gray-500',
  cancelado: 'bg-red-100 text-red-800',
};

// Cores de prioridade
const priorityColors: Record<string, string> = {
  baixa: 'bg-green-100 text-green-800',
  media: 'bg-blue-100 text-blue-800',
  alta: 'bg-orange-100 text-orange-800',
  critica: 'bg-red-100 text-red-800',
};

// Formatador de data/hora
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Formatador de status
const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ');
};

export default function TicketsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Estado para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Buscar tickets
  const { data: tickets, isLoading, error, refetch } = useQuery<Ticket[]>({
    queryKey: [user?.role === 'admin' ? '/api/tickets' : `/api/organizations/${user?.organizationId}/tickets`],
    enabled: !!user,
  });

  // Filtrar tickets
  const filteredTickets = tickets?.filter(ticket => {
    const matchesSearch = searchTerm === '' || 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.organization && ticket.organization.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Manipular erro
  useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar tickets",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao carregar os tickets.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tickets de Suporte</CardTitle>
              <CardDescription>
                Gerencie e acompanhe os tickets de suporte do sistema
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
                onClick={() => setLocation('/tickets/new')}
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
                placeholder="Buscar por título ou organização..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex gap-4">
              <div className="w-40">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="novo">Novo</SelectItem>
                    <SelectItem value="em_analise">Em Análise</SelectItem>
                    <SelectItem value="em_desenvolvimento">Em Desenvolvimento</SelectItem>
                    <SelectItem value="aguardando_resposta">Aguardando Resposta</SelectItem>
                    <SelectItem value="resolvido">Resolvido</SelectItem>
                    <SelectItem value="fechado">Fechado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-40">
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Prioridade" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as prioridades</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="critica">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTickets && filteredTickets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead className="w-[300px]">Título</TableHead>
                  {user?.role === 'admin' && <TableHead>Organização</TableHead>}
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead>Última Atualização</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setLocation(`/tickets/${ticket.id}`)}>
                    <TableCell className="font-medium">{ticket.id}</TableCell>
                    <TableCell>{ticket.title}</TableCell>
                    {user?.role === 'admin' && <TableCell>{ticket.organization || '-'}</TableCell>}
                    <TableCell>
                      <Badge className={statusColors[ticket.status] || 'bg-gray-100'}>
                        {formatStatus(ticket.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityColors[ticket.priority] || 'bg-gray-100'}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                    <TableCell>{formatDate(ticket.updatedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="text-muted-foreground mb-4">Nenhum ticket encontrado</div>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPriorityFilter('all');
              }}>
                Limpar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}