import React from 'react';
import { 
  AlertTriangle, Bell, Clock, ExternalLink, 
  MessageSquare, Tag, User, CheckCircle2, AlertCircle,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export interface AISuggestion {
  type: string;
  description: string;
  confidence: number;
  actions?: {
    label: string;
    value: string;
    action: string;
  }[];
  relatedTickets?: number[];
  responseTemplate?: string;
  relatedTicketsDetails?: any[];
}

interface TicketAiSuggestionsProps {
  suggestions: AISuggestion[];
  onApplySuggestion: (action: string, value: string) => void;
}

const SUGGESTION_ICONS: Record<string, React.ReactNode> = {
  status_change: <Clock className="h-4 w-4" />,
  priority_change: <AlertTriangle className="h-4 w-4" />,
  assignment: <User className="h-4 w-4" />,
  response: <MessageSquare className="h-4 w-4" />,
  related_tickets: <ExternalLink className="h-4 w-4" />,
  documentation: <Tag className="h-4 w-4" />,
  // Novos tipos de sugestões do backend
  status: <Clock className="h-4 w-4" />,
  priority: <AlertTriangle className="h-4 w-4" />,
  relatedTickets: <ExternalLink className="h-4 w-4" />
};

const SUGGESTION_NAMES: Record<string, string> = {
  status_change: "Mudança de Status",
  priority_change: "Mudança de Prioridade",
  assignment: "Atribuição",
  response: "Resposta Sugerida",
  related_tickets: "Tickets Relacionados",
  documentation: "Documentação",
  // Novos tipos de sugestões do backend
  status: "Mudança de Status",
  priority: "Mudança de Prioridade",
  relatedTickets: "Tickets Relacionados"
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.9) return "bg-green-100 text-green-800";
  if (confidence >= 0.7) return "bg-blue-100 text-blue-800";
  if (confidence >= 0.5) return "bg-yellow-100 text-yellow-800";
  return "bg-gray-100 text-gray-800";
};
function TicketAiSuggestions({ suggestions, onApplySuggestion }: TicketAiSuggestionsProps) {
  const { toast } = useToast();
  
  const handleApplySuggestion = (action: string, value: string) => {
    onApplySuggestion(action, value);
    
    toast({
      title: "Sugestão aplicada",
      description: "A ação foi aplicada com sucesso.",
    });
  };
  
  // Ordenar sugestões por confiança (mais alta primeiro)
  const sortedSuggestions = [...suggestions].sort((a, b) => b.confidence - a.confidence);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-5 w-5 text-purple-500" />
        <h3 className="text-lg font-medium">Sugestões de IA</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedSuggestions.map((suggestion, index) => (
          <Card key={index} className="border-l-4 border-l-purple-400">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="bg-purple-100 p-1.5 rounded-md">
                    {SUGGESTION_ICONS[suggestion.type] || <Sparkles className="h-4 w-4 text-purple-500" />}
                  </div>
                  <CardTitle className="text-base">
                    {SUGGESTION_NAMES[suggestion.type] || suggestion.type}
                  </CardTitle>
                </div>
                <Badge className={getConfidenceColor(suggestion.confidence)}>
                  {Math.round(suggestion.confidence * 100)}% confiança
                </Badge>
              </div>
              <CardDescription>
                {suggestion.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {suggestion.type === 'response' && suggestion.responseTemplate && (
                <div className="bg-gray-50 p-3 rounded-md text-sm whitespace-pre-wrap border border-gray-200">
                  {suggestion.responseTemplate}
                </div>
              )}
              
              {suggestion.type === 'related_tickets' && suggestion.relatedTicketsDetails && (
                <div className="space-y-2">
                  {suggestion.relatedTicketsDetails.map((ticket) => (
                    <div key={ticket.id} className="bg-gray-50 p-2 rounded-md border border-gray-200">
                      <div className="font-medium text-sm">#{ticket.id} {ticket.title}</div>
                      <div className="text-xs text-gray-500 truncate">{ticket.description}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {suggestion.type === 'relatedTickets' && suggestion.relatedTicketsDetails && (
                <div className="space-y-2">
                  {suggestion.relatedTicketsDetails.map((ticket) => (
                    <div key={ticket.id} className="bg-gray-50 p-2 rounded-md border border-gray-200">
                      <div className="font-medium text-sm">#{ticket.id} {ticket.title}</div>
                      <div className="text-xs text-gray-500 truncate">{ticket.description}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {suggestion.type === 'documentation' && (
                <div className="bg-blue-50 p-3 rounded-md text-sm border border-blue-200">
                  <p className="text-blue-800 mb-1">Documentação recomendada para este caso:</p>
                  <a 
                    href="#" 
                    className="text-blue-600 hover:underline flex items-center gap-1"
                    onClick={(e) => e.preventDefault()}
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Guia de Resolução de Problemas</span>
                  </a>
                </div>
              )}
            </CardContent>
            
            {suggestion.actions && suggestion.actions.length > 0 && (
              <CardFooter className="pt-0 flex flex-wrap gap-2">
                {suggestion.actions.map((action, actionIndex) => (
                  <Button
                    key={actionIndex}
                    size="sm"
                    variant="outline"
                    className="bg-white"
                    onClick={() => handleApplySuggestion(action.action, action.value)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    {action.label}
                  </Button>
                ))}
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
      
      {suggestions.length === 0 && (
        <div className="bg-gray-50 p-6 rounded-md text-center">
          <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 mb-2">Nenhuma sugestão disponível</p>
          <p className="text-sm text-gray-500">
            A IA ainda não gerou sugestões para este ticket ou não há sugestões relevantes no momento.
          </p>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500 flex items-start gap-1.5">
        <AlertCircle className="h-3.5 w-3.5 text-gray-400 mt-0.5" />
        <p>
          As sugestões são geradas automaticamente com base no conteúdo e contexto do ticket. 
          Avalie cada sugestão cuidadosamente antes de aplicá-la.
        </p>
      </div>
    </div>
  );
}

export default TicketAiSuggestions;
export { TicketAiSuggestions };
