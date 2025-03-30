import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, Send, RefreshCw, Clock, AlertCircle, Tag, 
  User, Briefcase, MessageCircle, Paperclip, CheckCircle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';

// Tipos
interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'novo' | 'em_analise' | 'em_desenvolvimento' | 'aguardando_resposta' | 'resolvido' | 'fechado' | 'cancelado';
  priority: 'baixa' | 'media' | 'alta' | 'critica';
  category: 'bug' | 'melhoria' | 'duvida' | 'financeiro' | 'acesso' | 'seguranca' | 'performance' | 'desenvolvimento' | 'outros';
  organizationId: number;
  organization?: string;
  createdById: number;
  assignedToId?: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
}

interface TicketComment {
  id: number;
  content: string;
  isInternal: boolean;
  createdAt: string;
  userId: number;
  userName: string;
}

interface TicketAttachment {
  id: number;
  fileName: string;
  fileType: string;
  filePath: string;
  fileSize: number;
  uploadedById: number;
  createdAt: string;
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

// Formatador de tamanho de arquivo
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Componente para obter iniciais do nome
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Estados
  const [comment, setComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [statusValue, setStatusValue] = useState<string>('');
  const [priorityValue, setPriorityValue] = useState<string>('');
  const [assignToValue, setAssignToValue] = useState<string>('');

  // Buscar detalhes do ticket
  const { 
    data: ticketData, 
    isLoading: isLoadingTicket, 
    error: ticketError,
    refetch 
  } = useQuery<{
    ticket: Ticket;
    comments: TicketComment[];
    attachments: TicketAttachment[];
  }>({
    queryKey: [`/api/tickets/${id}`],
    enabled: !!id && !!user,
  });

  // Atualizar estados quando o ticket for carregado
  useEffect(() => {
    if (ticketData?.ticket) {
      setStatusValue(ticketData.ticket.status);
      setPriorityValue(ticketData.ticket.priority);
      setAssignToValue(ticketData.ticket.assignedToId?.toString() || 'none');
    }
  }, [ticketData]);

  // Mutação para adicionar comentário
  const commentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/tickets/${id}/comments`, {
        content: comment,
        isInternal
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Comentário adicionado com sucesso",
        duration: 3000,
      });
      setComment('');
      queryClient.invalidateQueries({ queryKey: [`/api/tickets/${id}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao adicionar comentário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutação para atualizar status
  const statusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const res = await apiRequest("PATCH", `/api/tickets/${id}/status`, {
        status: newStatus
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Status atualizado com sucesso",
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/tickets/${id}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutação para atualizar prioridade
  const priorityMutation = useMutation({
    mutationFn: async (newPriority: string) => {
      const res = await apiRequest("PATCH", `/api/tickets/${id}/priority`, {
        priority: newPriority
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Prioridade atualizada com sucesso",
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/tickets/${id}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar prioridade",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutação para atribuir ticket
  const assignMutation = useMutation({
    mutationFn: async (assignToId: string) => {
      const res = await apiRequest("PATCH", `/api/tickets/${id}/assign`, {
        assignToId: assignToId !== 'none' ? parseInt(assignToId) : null
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Ticket atribuído com sucesso",
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/tickets/${id}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atribuir ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Manipular erro
  useEffect(() => {
    if (ticketError) {
      toast({
        title: "Erro ao carregar detalhes do ticket",
        description: ticketError instanceof Error ? ticketError.message : "Ocorreu um erro ao carregar os detalhes do ticket.",
        variant: "destructive",
      });
    }
  }, [ticketError, toast]);

  // Verificar se o usuário é admin para mostrar controles de admin
  const isAdmin = user?.role === 'admin';

  // Verificar se o ticket está resolvido ou fechado
  const isTicketClosed = ticketData?.ticket?.status === 'resolvido' || ticketData?.ticket?.status === 'fechado' || ticketData?.ticket?.status === 'cancelado';

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation('/tickets')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Tickets
        </Button>
      </div>

      {isLoadingTicket ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : ticketData?.ticket ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coluna principal - Detalhes do ticket e comentários */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-bold">#{ticketData.ticket.id}: {ticketData.ticket.title}</CardTitle>
                    <CardDescription className="mt-2">
                      <span className="flex items-center">
                        <Tag className="h-4 w-4 mr-1" /> 
                        Categoria: {ticketData.ticket.category}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={statusColors[ticketData.ticket.status]}>
                      {formatStatus(ticketData.ticket.status)}
                    </Badge>
                    <Badge className={priorityColors[ticketData.ticket.priority]}>
                      Prioridade: {ticketData.ticket.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Descrição</h3>
                    <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                      {ticketData.ticket.description}
                    </div>
                  </div>
                  
                  {ticketData.attachments && ticketData.attachments.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Anexos</h3>
                      <div className="bg-muted p-4 rounded-md">
                        <ul className="space-y-2">
                          {ticketData.attachments.map(attachment => (
                            <li key={attachment.id} className="flex items-center">
                              <Paperclip className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="flex-1 truncate">{attachment.fileName}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {formatFileSize(attachment.fileSize)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de Comunicação</CardTitle>
                <CardDescription>
                  {ticketData.comments.length} {ticketData.comments.length === 1 ? 'comentário' : 'comentários'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {ticketData.comments.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      Nenhum comentário ainda. Seja o primeiro a comentar!
                    </div>
                  ) : (
                    ticketData.comments.map(comment => (
                      <div key={comment.id} className={`flex gap-4 ${comment.isInternal ? 'opacity-70' : ''}`}>
                        <Avatar>
                          <AvatarFallback>{getInitials(comment.userName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <div className="font-medium">{comment.userName}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(comment.createdAt)}
                              {comment.isInternal && (
                                <Badge variant="outline" className="ml-2 text-xs">Interno</Badge>
                              )}
                            </div>
                          </div>
                          <div className="bg-muted p-3 rounded-md whitespace-pre-wrap">
                            {comment.content}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
              <CardFooter>
                {!isTicketClosed && (
                  <div className="w-full space-y-4">
                    <Textarea
                      placeholder="Adicione um comentário..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-between items-center">
                      {isAdmin && (
                        <div className="flex items-center space-x-2">
                          <label className="text-sm font-medium">
                            <input
                              type="checkbox"
                              checked={isInternal}
                              onChange={() => setIsInternal(!isInternal)}
                              className="mr-2"
                            />
                            Comentário interno (apenas visível para administradores)
                          </label>
                        </div>
                      )}
                      <Button
                        onClick={() => commentMutation.mutate()}
                        disabled={!comment.trim() || commentMutation.isPending}
                      >
                        {commentMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Enviar Comentário
                      </Button>
                    </div>
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>

          {/* Coluna lateral - Informações e ações */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Datas</h3>
                    <ul className="mt-2 space-y-2">
                      <li className="text-sm flex justify-between">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          Criado em:
                        </span>
                        <span>{formatDate(ticketData.ticket.createdAt)}</span>
                      </li>
                      <li className="text-sm flex justify-between">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          Atualizado em:
                        </span>
                        <span>{formatDate(ticketData.ticket.updatedAt)}</span>
                      </li>
                      {ticketData.ticket.resolvedAt && (
                        <li className="text-sm flex justify-between">
                          <span className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            Resolvido em:
                          </span>
                          <span>{formatDate(ticketData.ticket.resolvedAt)}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Organização</h3>
                    <p className="mt-2 text-sm flex items-center">
                      <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                      {ticketData.ticket.organization || 'Não especificada'}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Atribuído a</h3>
                    <p className="mt-2 text-sm flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      {ticketData.ticket.assignedToId 
                        ? "ID: " + ticketData.ticket.assignedToId 
                        : 'Não atribuído'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ações administrativas - Apenas para admin */}
            {isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle>Ações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <Select
                        value={statusValue}
                        onValueChange={(value) => {
                          setStatusValue(value);
                          statusMutation.mutate(value);
                        }}
                        disabled={statusMutation.isPending}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
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

                    <div>
                      <label className="text-sm font-medium">Prioridade</label>
                      <Select
                        value={priorityValue}
                        onValueChange={(value) => {
                          setPriorityValue(value);
                          priorityMutation.mutate(value);
                        }}
                        disabled={priorityMutation.isPending}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="critica">Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Atribuir a (ID do usuário)</label>
                      <Select
                        value={assignToValue}
                        onValueChange={(value) => {
                          setAssignToValue(value);
                          assignMutation.mutate(value);
                        }}
                        disabled={assignMutation.isPending}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um usuário" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Não atribuído</SelectItem>
                          {/* Idealmente, buscaríamos uma lista de administradores aqui */}
                          <SelectItem value={user?.id?.toString() || ''}>Eu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => {
                        if (confirm("Tem certeza que deseja cancelar este ticket?")) {
                          statusMutation.mutate("cancelado");
                        }
                      }}
                      disabled={statusValue === "cancelado" || statusMutation.isPending}
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Cancelar Ticket
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-lg font-medium">Ticket não encontrado</div>
          <p className="text-muted-foreground mt-2">
            O ticket solicitado não existe ou você não tem permissão para acessá-lo.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => setLocation('/tickets')}>
            Voltar para Tickets
          </Button>
        </div>
      )}
    </div>
  );
}