import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, MessageSquare, Clock, AlertTriangle, Tag, User, RefreshCw, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

// Tipo das sugestões geradas pela IA
type SuggestionType = 
  | 'status_change' 
  | 'priority_change' 
  | 'assignment' 
  | 'response'
  | 'related_tickets'
  | 'documentation';

interface AISuggestion {
  type: SuggestionType;
  description: string;
  confidence: number; // 0 a 1
  actions?: {
    label: string;
    value: string;
    action: string;
  }[];
  relatedTickets?: number[];
  relatedTicketsDetails?: any[];
  responseTemplate?: string;
}

interface TicketSuggestions {
  ticketId: number;
  suggestions: AISuggestion[];
}

const SUGGESTION_ICONS = {
  status_change: <Clock className="h-4 w-4" />,
  priority_change: <AlertTriangle className="h-4 w-4" />,
  assignment: <User className="h-4 w-4" />,
  response: <MessageSquare className="h-4 w-4" />,
  related_tickets: <ExternalLink className="h-4 w-4" />,
  documentation: <Tag className="h-4 w-4" />
};

const SUGGESTION_NAMES = {
  status_change: "Mudança de Status",
  priority_change: "Mudança de Prioridade",
  assignment: "Atribuição",
  response: "Resposta Sugerida",
  related_tickets: "Tickets Relacionados",
  documentation: "Documentação"
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.9) return "bg-green-100 text-green-800";
  if (confidence >= 0.7) return "bg-blue-100 text-blue-800";
  if (confidence >= 0.5) return "bg-yellow-100 text-yellow-800";
  return "bg-gray-100 text-gray-800";
};

interface TicketAiSuggestionsProps {
  ticketId: number;
  onAddComment?: (comment: string) => void;
  onUpdateStatus?: (status: string) => void;
  onUpdatePriority?: (priority: string) => void;
  onAssignSelf?: () => void;
  onViewTicket?: (ticketId: number) => void;
}

export default function TicketAiSuggestions({
  ticketId,
  onAddComment,
  onUpdateStatus,
  onUpdatePriority,
  onAssignSelf,
  onViewTicket
}: TicketAiSuggestionsProps) {
  const [commentValue, setCommentValue] = useState("");

  // Buscar sugestões da IA para o ticket
  const { data, isLoading, error, refetch } = useQuery<TicketSuggestions>({
    queryKey: ['/api/tickets', ticketId, 'suggestions'],
    queryFn: async () => {
      return await apiRequest(`/api/tickets/${ticketId}/suggestions`, {
        method: 'GET'
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutos (as sugestões não mudam frequentemente)
  });

  const handleActionClick = (suggestion: AISuggestion, action: { label: string, value: string, action: string }) => {
    switch (action.action) {
      case 'status_change':
        onUpdateStatus?.(action.value);
        toast({
          title: "Status atualizado",
          description: `Ticket atualizado para status: ${action.value}`,
        });
        break;
      
      case 'priority_change':
        onUpdatePriority?.(action.value);
        toast({
          title: "Prioridade atualizada",
          description: `Prioridade do ticket atualizada para: ${action.value}`,
        });
        break;
        
      case 'assign_self':
        onAssignSelf?.();
        toast({
          title: "Ticket atribuído",
          description: "Ticket atribuído a você com sucesso",
        });
        break;
        
      default:
        console.log("Ação não implementada:", action);
        break;
    }
    
    // Revalidar as sugestões após uma ação
    setTimeout(() => refetch(), 1000);
  };

  const handleUseTemplate = (template: string) => {
    setCommentValue(template);
  };

  const handleSubmitComment = () => {
    if (commentValue.trim()) {
      onAddComment?.(commentValue);
      setCommentValue("");
      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi adicionado com sucesso",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-md flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <span>Carregando sugestões...</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-md flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <span>Sugestões de IA</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-500 mb-2">Erro ao carregar sugestões de IA</p>
            <Button size="sm" variant="outline" onClick={() => refetch()} className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const suggestions = data?.suggestions || [];

  if (suggestions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-md flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <span>Sugestões de IA</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <p>Nenhuma sugestão disponível para este ticket no momento</p>
            <Button size="sm" variant="outline" onClick={() => refetch()} className="mt-2 flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Atualizar sugestões
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <span>Sugestões baseadas em IA</span>
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto h-8 w-8 p-0"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.type}-${index}`}
                className="border rounded-md p-3 bg-card overflow-hidden"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      {SUGGESTION_ICONS[suggestion.type]}
                    </div>
                    <span className="font-medium text-sm">
                      {SUGGESTION_NAMES[suggestion.type]}
                    </span>
                  </div>
                  <Badge 
                    variant="outline"
                    className={`${getConfidenceColor(suggestion.confidence)}`}
                  >
                    {Math.floor(suggestion.confidence * 100)}%
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {suggestion.description}
                </p>
                
                {suggestion.actions && suggestion.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {suggestion.actions.map((action, idx) => (
                      <Button
                        key={idx}
                        size="sm"
                        variant="outline"
                        onClick={() => handleActionClick(suggestion, action)}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
                
                {suggestion.responseTemplate && (
                  <div className="mt-3">
                    <div className="bg-muted p-2 rounded-md text-xs text-muted-foreground mb-2 max-h-24 overflow-y-auto">
                      <pre className="whitespace-pre-wrap font-sans">
                        {suggestion.responseTemplate}
                      </pre>
                    </div>
                    <div className="flex justify-between">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUseTemplate(suggestion.responseTemplate!)}
                      >
                        Usar este modelo
                      </Button>
                    </div>
                  </div>
                )}
                
                {suggestion.relatedTicketsDetails && suggestion.relatedTicketsDetails.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-1">Tickets relacionados:</p>
                    <div className="space-y-2">
                      {suggestion.relatedTicketsDetails.map((relatedTicket) => (
                        <div 
                          key={relatedTicket.id}
                          className="bg-muted p-2 rounded-md text-sm flex justify-between items-center"
                        >
                          <div>
                            <span className="font-medium">#{relatedTicket.id}:</span> {relatedTicket.title || relatedTicket.description.substring(0, 30) + '...'}
                          </div>
                          {onViewTicket && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onViewTicket(relatedTicket.id)}
                            >
                              Ver
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {commentValue && (
              <div className="border rounded-md p-3 mt-4">
                <p className="text-sm font-medium mb-2">Seu comentário:</p>
                <Textarea
                  value={commentValue}
                  onChange={(e) => setCommentValue(e.target.value)}
                  className="min-h-[100px]"
                  placeholder="Edite o comentário conforme necessário..."
                />
                <div className="flex justify-end mt-2">
                  <Button onClick={handleSubmitComment}>
                    Adicionar comentário
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}