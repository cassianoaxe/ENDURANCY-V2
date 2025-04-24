import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  FileText,
  Tag,
  User,
  MessageCircle,
  CheckCircle2,
  Search,
  Loader2,
  Lock,
  Send,
  Sparkles,
} from 'lucide-react';
import { TicketAiSuggestions } from '@/components/features/TicketAiSuggestions';

// Interfaces
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
}

interface Comment {
  id: number;
  ticketId: number;
  userId: number;
  content: string;
  isInternal: boolean;
  createdAt: string;
  user?: {
    name?: string;
    username: string;
    role?: string;
  };
}

interface AISuggestion {
  type: string;
  description: string;
  confidence: number;
  actions?: {
    label: string;
    value: string;
    action: string;
  }[];
}

// Form schemas
const commentSchema = z.object({
  content: z.string().min(1, { message: "O comentário não pode estar vazio" }),
  isInternal: z.boolean().default(false),
});

const updateTicketSchema = z.object({
  status: z.enum(['novo', 'em_analise', 'em_desenvolvimento', 'aguardando_resposta', 'resolvido', 'fechado', 'cancelado']),
  priority: z.enum(['baixa', 'media', 'alta', 'critica']),
  assignedToId: z.number().nullable().optional(),
});

type CommentFormValues = z.infer<typeof commentSchema>;
type UpdateTicketFormValues = z.infer<typeof updateTicketSchema>;

// Mapas de labels e cores
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

// Status icon function
const getStatusIcon = (status: string) => {
  switch(status) {
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

export default function TicketDetailPage() {
  const { id } = useParams();
  const ticketId = parseInt(id);
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("updates");
  const isAdmin = user?.role === 'admin' || user?.role === 'org_admin';
  
  // Formulário para comentários
  const commentForm = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: '',
      isInternal: false,
    },
  });
  
  // Formulário para atualização do ticket
  const updateForm = useForm<UpdateTicketFormValues>({
    resolver: zodResolver(updateTicketSchema),
  });
  
  // Consulta para obter detalhes do ticket
  const { 
    data: ticket, 
    isLoading: isLoadingTicket, 
    isError: isTicketError,
    refetch: refetchTicket,
  } = useQuery<Ticket>({
    queryKey: ['ticket', ticketId],
    enabled: !isNaN(ticketId),
  });
  
  // Consulta para obter comentários do ticket
  const { 
    data: comments = [], 
    isLoading: isLoadingComments,
    refetch: refetchComments,
  } = useQuery<Comment[]>({
    queryKey: ['ticket-comments', ticketId],
    enabled: !isNaN(ticketId),
  });
  
  // Consulta para obter sugestões de IA para o ticket
  const { 
    data: aiSuggestions = [],
    isLoading: isLoadingAiSuggestions,
  } = useQuery<AISuggestion[]>({
    queryKey: ['ticket-ai-suggestions', ticketId],
    enabled: isAdmin && !isNaN(ticketId),
  });
  
  // Consulta para obter usuários disponíveis para atribuição
  const { data: users = [] } = useQuery<{id: number, name: string}[]>({
    queryKey: ['organization-users'],
    enabled: isAdmin,
  });
  
  // Mutation para adicionar um comentário
  const addCommentMutation = useMutation({
    mutationFn: async (data: CommentFormValues) => {
      const response = await apiRequest('POST', `/api/tickets/${ticketId}/comments`, {
        ...data,
        ticketId,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao adicionar comentário');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Limpar o formulário
      commentForm.reset();
      
      // Atualizar os comentários
      refetchComments();
      
      // Exibir notificação de sucesso
      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi adicionado com sucesso.",
      });
    },
  });
  
  // Mutation para atualizar o ticket
  const updateTicketMutation = useMutation({
    mutationFn: async (data: UpdateTicketFormValues) => {
      const response = await apiRequest('PATCH', `/api/tickets/${ticketId}`, data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar ticket');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Atualizar o ticket
      refetchTicket();
      
      // Exibir notificação de sucesso
      toast({
        title: "Ticket atualizado",
        description: "As informações do ticket foram atualizadas com sucesso.",
      });
    },
  });
  
  // Mutation para aplicar uma ação sugerida pela IA
  const applySuggestionMutation = useMutation({
    mutationFn: async ({ action, value }: { action: string, value: string }) => {
      const response = await apiRequest('POST', `/api/tickets/${ticketId}/apply-suggestion`, {
        action,
        value,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao aplicar sugestão');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Atualizar o ticket e comentários
      refetchTicket();
      refetchComments();
      
      // Exibir notificação de sucesso
      toast({
        title: "Sugestão aplicada",
        description: "A sugestão da IA foi aplicada com sucesso.",
      });
    },
  });
  
  // Função para voltar à lista de tickets
  const handleBackClick = () => {
    navigate('/organization/tickets');
  };
  
  // Função para adicionar um comentário
  const onCommentSubmit = (values: CommentFormValues) => {
    addCommentMutation.mutate(values);
  };
  
  // Função para atualizar o ticket
  const onUpdateSubmit = (values: UpdateTicketFormValues) => {
    updateTicketMutation.mutate(values);
  };
  
  // Função para aplicar uma sugestão
  const handleApplySuggestion = (action: string, value: string) => {
    applySuggestionMutation.mutate({ action, value });
  };
  
  // Se o ticket estiver carregando, exibir estado de carregamento
  if (isLoadingTicket) {
    return (
      <OrganizationLayout>
        <div className="container mx-auto py-8 space-y-6">
          <div className="flex justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
          </div>
        </div>
      </OrganizationLayout>
    );
  }
  
  // Se ocorreu um erro ao carregar o ticket, exibir estado de erro
  if (isTicketError || !ticket) {
    return (
      <OrganizationLayout>
        <div className="container mx-auto py-8 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleBackClick}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <CardTitle>Ticket não encontrado</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 p-4 rounded-md text-red-800 text-center">
                <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
                <p>Não foi possível carregar o ticket solicitado.</p>
                <p className="text-sm mt-2">Verifique se o ID está correto ou tente novamente mais tarde.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleBackClick} className="mx-auto">
                Voltar para a lista de tickets
              </Button>
            </CardFooter>
          </Card>
        </div>
      </OrganizationLayout>
    );
  }
  
  // Quando o ticket é carregado, preencher os valores do formulário de atualização
  React.useEffect(() => {
    if (ticket) {
      updateForm.reset({
        status: ticket.status,
        priority: ticket.priority,
        assignedToId: ticket.assignedToId || null,
      });
    }
  }, [ticket, updateForm]);
  
  // Ordenar comentários por data de criação (mais recentes por último)
  const sortedComments = [...comments].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  
  return (
    <OrganizationLayout>
      <div className="container mx-auto py-8 space-y-6">
        {/* Cabeçalho do ticket */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="icon" onClick={handleBackClick} className="h-7 w-7">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                #{ticket.id} {ticket.title}
              </CardTitle>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusColors[ticket.status]}>
                {getStatusIcon(ticket.status)}
                <span className="ml-1">{statusLabels[ticket.status]}</span>
              </Badge>
              <Badge className={priorityColors[ticket.priority]}>
                {priorityLabels[ticket.priority]}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" />
                <span>{categoryLabels[ticket.category] || ticket.category}</span>
              </Badge>
              <div className="text-sm text-gray-500 ml-auto">
                Criado em {format(parseISO(ticket.createdAt), 'dd MMM yyyy, HH:mm', { locale: ptBR })}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-md mb-4 whitespace-pre-wrap">
              {ticket.description}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-500">Criado por</div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{ticket.createdByName || `Usuário #${ticket.createdById}`}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-gray-500">Atribuído a</div>
                <div className="flex items-center gap-2">
                  {ticket.assignedToId ? (
                    <>
                      <User className="h-4 w-4 text-gray-500" />
                      <span>{ticket.assignedToName || `Usuário #${ticket.assignedToId}`}</span>
                    </>
                  ) : (
                    <span className="text-gray-400">Não atribuído</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Área de administração de ticket (só visível para admins) */}
        {isAdmin && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Gerenciar Ticket</CardTitle>
              <CardDescription>
                Atualizar status, prioridade e atribuição
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...updateForm}>
                <form 
                  onSubmit={updateForm.handleSubmit(onUpdateSubmit)} 
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <FormField
                    control={updateForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(statusLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={updateForm.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prioridade</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma prioridade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(priorityLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={updateForm.control}
                    name="assignedToId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Atribuir a</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                          defaultValue={field.value?.toString() || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um responsável" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Sem atribuição</SelectItem>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id.toString()}>
                                {user.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="md:col-span-3 flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={updateTicketMutation.isPending || !updateForm.formState.isDirty}
                    >
                      {updateTicketMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Atualizando...
                        </>
                      ) : 'Atualizar Ticket'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
        
        {/* Abas para comentários e sugestões */}
        <Card>
          <CardHeader className="pb-3">
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="updates">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Comentários e Atualizações
                </TabsTrigger>
                
                {isAdmin && (
                  <TabsTrigger value="ai-suggestions">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Sugestões de IA
                  </TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="updates" className="mt-4">
                <div className="space-y-4">
                  {isLoadingComments ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : sortedComments.length === 0 ? (
                    <div className="bg-gray-50 p-6 rounded-md text-center">
                      <MessageCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 mb-2">Nenhum comentário ainda</p>
                      <p className="text-sm text-gray-500">Seja o primeiro a comentar neste ticket.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sortedComments.map((comment) => (
                        <div 
                          key={comment.id}
                          className={`p-4 rounded-md ${
                            comment.isInternal 
                              ? 'bg-amber-50 border border-amber-100' 
                              : 'bg-gray-50 border border-gray-100'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">
                                {comment.user?.name || comment.user?.username || `Usuário #${comment.userId}`}
                              </span>
                              {comment.isInternal && (
                                <Badge variant="outline" className="flex items-center gap-1 text-amber-600 bg-amber-50">
                                  <Lock className="h-3 w-3" />
                                  <span>Interno</span>
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {format(parseISO(comment.createdAt), 'dd MMM yyyy, HH:mm', { locale: ptBR })}
                            </span>
                          </div>
                          <div className="whitespace-pre-wrap">{comment.content}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <Separator className="my-4" />
                
                {/* Formulário para adicionar um comentário */}
                <Form {...commentForm}>
                  <form onSubmit={commentForm.handleSubmit(onCommentSubmit)} className="space-y-4">
                    <FormField
                      control={commentForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea 
                              placeholder="Escreva um comentário..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {isAdmin && (
                      <FormField
                        control={commentForm.control}
                        name="isInternal"
                        render={({ field }) => (
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="isInternal"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 rounded text-green-600"
                            />
                            <label htmlFor="isInternal" className="text-sm text-gray-600">
                              Comentário interno (visível apenas para administradores)
                            </label>
                          </div>
                        )}
                      />
                    )}
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={addCommentMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        {addCommentMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Enviar Comentário
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
              
              {isAdmin && (
                <TabsContent value="ai-suggestions" className="mt-4">
                  {isLoadingAiSuggestions ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-2">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                      <p className="text-sm text-gray-500">Analisando ticket e gerando sugestões...</p>
                    </div>
                  ) : aiSuggestions.length === 0 ? (
                    <div className="bg-gray-50 p-6 rounded-md text-center">
                      <Sparkles className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 mb-2">Nenhuma sugestão disponível</p>
                      <p className="text-sm text-gray-500">A IA ainda não gerou sugestões para este ticket.</p>
                    </div>
                  ) : (
                    <TicketAiSuggestions
                      suggestions={aiSuggestions}
                      onApplySuggestion={handleApplySuggestion}
                    />
                  )}
                </TabsContent>
              )}
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </OrganizationLayout>
  );
}