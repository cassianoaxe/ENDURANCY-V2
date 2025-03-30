/**
 * Serviço para geração de sugestões de ações com IA contextual para tickets de suporte
 */
import { db } from "../db";
import { supportTickets, ticketComments, users, SupportTicket, TicketComment } from "../../shared/schema";
import { eq, desc, and } from "drizzle-orm";

// Tipos de sugestões que a IA pode fornecer
export type SuggestionType = 
  | 'status_change' 
  | 'priority_change' 
  | 'assignment' 
  | 'response'
  | 'related_tickets'
  | 'documentation';

// Interface para as sugestões geradas
export interface AISuggestion {
  type: SuggestionType;
  description: string;
  confidence: number; // 0 a 1
  actions?: {
    label: string;
    value: string;
    action: string;
  }[];
  relatedTickets?: number[];
  responseTemplate?: string;
}

/**
 * Analisa um ticket e gera sugestões de ações baseadas no contexto
 */
export async function generateTicketSuggestions(ticketId: number): Promise<AISuggestion[]> {
  try {
    // Buscar ticket completo com comentários
    const [ticket] = await db.select()
      .from(supportTickets)
      .where(eq(supportTickets.id, ticketId));
    
    if (!ticket) {
      throw new Error('Ticket não encontrado');
    }
    
    // Buscar comentários ordenados por data
    const comments = await db.select()
      .from(ticketComments)
      .where(eq(ticketComments.ticketId, ticketId))
      .orderBy(desc(ticketComments.createdAt));
    
    // Análise de contexto e geração de sugestões
    const suggestions: AISuggestion[] = [];
    
    // Adicionar sugestões com base no status atual
    suggestions.push(...generateStatusSuggestions(ticket, comments));
    
    // Adicionar sugestões de prioridade
    suggestions.push(...generatePrioritySuggestions(ticket, comments));
    
    // Adicionar sugestões de atribuição
    suggestions.push(...generateAssignmentSuggestions(ticket));
    
    // Adicionar sugestões de resposta
    suggestions.push(...generateResponseSuggestions(ticket, comments));
    
    // Buscar tickets relacionados
    const relatedTickets = await findRelatedTickets(ticket);
    if (relatedTickets.length > 0) {
      suggestions.push({
        type: 'related_tickets',
        description: 'Tickets similares encontrados que podem estar relacionados a este problema',
        confidence: 0.75,
        relatedTickets: relatedTickets.map(t => t.id)
      });
    }
    
    // Ordenar sugestões por confiança (mais confiáveis primeiro)
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  } catch (error) {
    console.error('Erro ao gerar sugestões de IA:', error);
    return [];
  }
}

/**
 * Gera sugestões de mudança de status com base no contexto do ticket
 */
function generateStatusSuggestions(ticket: SupportTicket, comments: TicketComment[]): AISuggestion[] {
  const suggestions: AISuggestion[] = [];
  
  // Se o ticket está novo e tem prioridade alta/crítica, sugerir mudar para "em_analise"
  if (ticket.status === 'novo' && (ticket.priority === 'alta' || ticket.priority === 'critica')) {
    suggestions.push({
      type: 'status_change',
      description: 'Este ticket tem prioridade alta e deve ser analisado imediatamente',
      confidence: 0.9,
      actions: [
        {
          label: 'Iniciar Análise',
          value: 'em_analise',
          action: 'status_change'
        }
      ]
    });
  }
  
  // Se o ticket está em análise há mais de 24h, sugerir mover para desenvolvimento ou aguardando resposta
  if (ticket.status === 'em_analise') {
    const hoursInAnalysis = (new Date().getTime() - new Date(ticket.updatedAt).getTime()) / (1000 * 60 * 60);
    if (hoursInAnalysis > 24) {
      suggestions.push({
        type: 'status_change',
        description: 'Este ticket está em análise há mais de 24 horas',
        confidence: 0.8,
        actions: [
          {
            label: 'Mover para Desenvolvimento',
            value: 'em_desenvolvimento',
            action: 'status_change'
          },
          {
            label: 'Aguardar Resposta do Cliente',
            value: 'aguardando_resposta',
            action: 'status_change'
          }
        ]
      });
    }
  }
  
  // Se o último comentário é do cliente e estamos aguardando resposta, sugerir retomar a análise
  if (ticket.status === 'aguardando_resposta' && comments.length > 0) {
    const lastComment = comments[0];
    // Verificar se o último comentário não é de um admin (assume-se que é do cliente)
    if (!lastComment.isInternal) {
      suggestions.push({
        type: 'status_change',
        description: 'O cliente respondeu ao ticket que estava aguardando resposta',
        confidence: 0.95,
        actions: [
          {
            label: 'Retomar Análise',
            value: 'em_analise',
            action: 'status_change'
          }
        ]
      });
    }
  }
  
  // Se o ticket está em desenvolvimento há mais de 72h, sugerir uma atualização
  if (ticket.status === 'em_desenvolvimento') {
    const hoursInDevelopment = (new Date().getTime() - new Date(ticket.updatedAt).getTime()) / (1000 * 60 * 60);
    if (hoursInDevelopment > 72) {
      suggestions.push({
        type: 'response',
        description: 'Este ticket está em desenvolvimento há mais de 72 horas sem atualizações',
        confidence: 0.85,
        responseTemplate: 'Gostaríamos de atualizar sobre o progresso deste ticket. Estamos trabalhando na solução e estimamos que estará pronta em [PRAZO ESTIMADO]. Agradecemos sua paciência.'
      });
    }
  }
  
  return suggestions;
}

/**
 * Gera sugestões de mudança de prioridade com base no contexto do ticket
 */
function generatePrioritySuggestions(ticket: SupportTicket, comments: TicketComment[]): AISuggestion[] {
  const suggestions: AISuggestion[] = [];
  
  // Detectar palavras-chave de urgência no título ou descrição
  const urgentKeywords = ['urgente', 'crítico', 'imediato', 'grave', 'bloqueio', 'parado', 'erro fatal'];
  const ticketText = (ticket.title + ' ' + ticket.description).toLowerCase();
  
  const hasUrgentKeywords = urgentKeywords.some(keyword => ticketText.includes(keyword));
  
  // Se o ticket tem palavras de urgência mas prioridade baixa/média, sugerir aumentar
  if (hasUrgentKeywords && (ticket.priority === 'baixa' || ticket.priority === 'media')) {
    suggestions.push({
      type: 'priority_change',
      description: 'Este ticket contém palavras que indicam urgência, mas está com prioridade baixa/média',
      confidence: 0.85,
      actions: [
        {
          label: 'Aumentar para Alta',
          value: 'alta',
          action: 'priority_change'
        },
        {
          label: 'Aumentar para Crítica',
          value: 'critica',
          action: 'priority_change'
        }
      ]
    });
  }
  
  // Se muitos comentários em pouco tempo, sugerir aumentar prioridade
  if (comments.length >= 5) {
    const firstComment = new Date(comments[comments.length - 1].createdAt);
    const lastComment = new Date(comments[0].createdAt);
    const hoursBetweenComments = (lastComment.getTime() - firstComment.getTime()) / (1000 * 60 * 60);
    
    if (hoursBetweenComments < 24 && ticket.priority !== 'critica') {
      suggestions.push({
        type: 'priority_change',
        description: 'Este ticket tem alta atividade de comentários nas últimas 24 horas',
        confidence: 0.8,
        actions: [
          {
            label: 'Aumentar Prioridade',
            value: 'critica',
            action: 'priority_change'
          }
        ]
      });
    }
  }
  
  return suggestions;
}

/**
 * Gera sugestões de atribuição do ticket com base no contexto
 */
function generateAssignmentSuggestions(ticket: SupportTicket): AISuggestion[] {
  const suggestions: AISuggestion[] = [];
  
  // Se o ticket não está atribuído e tem prioridade alta/crítica
  if (!ticket.assignedToId && (ticket.priority === 'alta' || ticket.priority === 'critica')) {
    suggestions.push({
      type: 'assignment',
      description: 'Este ticket de alta prioridade não está atribuído a nenhum administrador',
      confidence: 0.9,
      actions: [
        {
          label: 'Atribuir a Mim',
          value: 'self',
          action: 'assign_self'
        }
      ]
    });
  }
  
  return suggestions;
}

/**
 * Gera sugestões de resposta com base no contexto do ticket
 */
function generateResponseSuggestions(ticket: SupportTicket, comments: TicketComment[]): AISuggestion[] {
  const suggestions: AISuggestion[] = [];
  
  // Se não há comentários ainda, sugerir resposta inicial
  if (comments.length === 0) {
    suggestions.push({
      type: 'response',
      description: 'Este ticket ainda não recebeu nenhuma resposta',
      confidence: 0.95,
      responseTemplate: 'Olá,\n\nObrigado por entrar em contato com nossa equipe de suporte. Estamos analisando sua solicitação e retornaremos em breve com mais informações.\n\nAtenciosamente,\nEquipe de Suporte'
    });
  }
  
  // Se o último comentário é do cliente e sem resposta há mais de 4 horas
  if (comments.length > 0 && !comments[0].isInternal) {
    const lastComment = comments[0];
    const hoursSinceLastComment = (new Date().getTime() - new Date(lastComment.createdAt).getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLastComment > 4) {
      suggestions.push({
        type: 'response',
        description: 'O último comentário do cliente está sem resposta há mais de 4 horas',
        confidence: 0.9,
        responseTemplate: 'Olá,\n\nAgradecemos seu comentário. Estamos trabalhando em sua solicitação e forneceremos uma atualização o mais breve possível.\n\nAtenciosamente,\nEquipe de Suporte'
      });
    }
  }
  
  // Se o ticket está prestes a estourar o SLA (assumindo SLA de 24h para resposta)
  const ticketAge = (new Date().getTime() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60);
  if (ticketAge > 20 && ticketAge < 24 && comments.length === 0) {
    suggestions.push({
      type: 'response',
      description: 'Este ticket está se aproximando do prazo de SLA sem resposta',
      confidence: 0.95,
      responseTemplate: 'Olá,\n\nEstamos trabalhando em sua solicitação e gostaríamos de informar que precisaremos de mais algumas horas para fornecer uma resposta completa. Agradecemos sua paciência.\n\nAtenciosamente,\nEquipe de Suporte'
    });
  }
  
  return suggestions;
}

/**
 * Encontra tickets que podem estar relacionados ao ticket atual
 */
async function findRelatedTickets(ticket: SupportTicket): Promise<SupportTicket[]> {
  // Buscar tickets com a mesma categoria da mesma organização
  const relatedTickets = await db.select()
    .from(supportTickets)
    .where(
      and(
        eq(supportTickets.organizationId, ticket.organizationId),
        eq(supportTickets.category, ticket.category)
      )
    )
    .limit(3);
  
  // Filtrando o ticket atual e ordenando por relevância
  return relatedTickets.filter(t => t.id !== ticket.id);
}

/**
 * Busca sugestões completas para o ticket, incluindo dados relacionados
 */
export async function getTicketSuggestionsWithDetails(ticketId: number): Promise<any[]> {
  const suggestions = await generateTicketSuggestions(ticketId);
  
  // Enriquecer sugestões com dados adicionais
  const enhancedSuggestions = await Promise.all(
    suggestions.map(async (suggestion) => {
      // Se tem tickets relacionados, buscar detalhes
      if (suggestion.type === 'related_tickets' && suggestion.relatedTickets?.length) {
        const relatedTicketsDetails = await Promise.all(
          suggestion.relatedTickets.map(async (id) => {
            const [ticketDetail] = await db.select()
              .from(supportTickets)
              .where(eq(supportTickets.id, id));
            return ticketDetail;
          })
        );
        
        return {
          ...suggestion,
          relatedTicketsDetails: relatedTicketsDetails.filter(Boolean)
        };
      }
      
      return suggestion;
    })
  );
  
  return enhancedSuggestions;
}