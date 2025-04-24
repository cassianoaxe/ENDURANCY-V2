import { db } from '../db';
import { eq, asc, sql } from 'drizzle-orm';
import { supportTickets, ticketComments, users, SupportTicket } from '../../shared/schema';

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

/**
 * Gera sugestões baseadas no conteúdo do ticket e seus comentários
 */
export async function generateTicketAiSuggestions(
  ticket: SupportTicket,
  comments?: any[]
): Promise<AISuggestion[]> {
  try {
    // Verificar se já temos comentários ou precisamos buscá-los
    if (!comments) {
      comments = await db
        .select()
        .from(ticketComments)
        .where(eq(ticketComments.ticketId, ticket.id))
        .orderBy(asc(ticketComments.createdAt));
    }

    // Array para armazenar todas as sugestões
    const suggestions: AISuggestion[] = [];

    // Gerar sugestões de status
    const statusSuggestions = await generateStatusSuggestions(ticket, comments);
    if (statusSuggestions) suggestions.push(statusSuggestions);

    // Gerar sugestões de prioridade
    const prioritySuggestions = await generatePrioritySuggestions(ticket, comments);
    if (prioritySuggestions) suggestions.push(prioritySuggestions);

    // Gerar sugestões de atribuição
    const assignmentSuggestions = await generateAssignmentSuggestions(ticket, comments);
    if (assignmentSuggestions) suggestions.push(assignmentSuggestions);

    // Gerar templates de resposta
    const responseSuggestions = await generateResponseSuggestions(ticket, comments);
    if (responseSuggestions) suggestions.push(responseSuggestions);

    // Buscar tickets relacionados
    const relatedTicketsSuggestions = await generateRelatedTicketsSuggestions(ticket);
    if (relatedTicketsSuggestions) suggestions.push(relatedTicketsSuggestions);

    return suggestions;
  } catch (error) {
    console.error('Erro ao gerar sugestões de IA:', error);
    return [];
  }
}

/**
 * Gera sugestões de mudança de status para o ticket
 */
async function generateStatusSuggestions(
  ticket: SupportTicket,
  comments: any[]
): Promise<AISuggestion | null> {
  try {
    const currentStatus = ticket.status;
    
    // Lógica para determinar se o ticket deve mudar de status com base no conteúdo
    // e nos comentários recentes
    
    // Verificar se existem comentários recentes do usuário sem resposta
    const hasUserCommentWithoutResponse = comments.length > 0 && 
      comments[comments.length - 1].userId === ticket.createdById &&
      currentStatus !== 'aguardando_resposta';
    
    // Verificar se o último comentário é do suporte e aguarda resposta do usuário
    const hasStaffCommentWaitingResponse = comments.length > 0 && 
      comments[comments.length - 1].userId !== ticket.createdById &&
      currentStatus !== 'respondido';
    
    // Verificar se o ticket está sem atividade há mais de 7 dias
    const lastActivity = comments.length > 0 
      ? new Date(comments[comments.length - 1].createdAt)
      : new Date(ticket.createdAt);
    
    const daysSinceLastActivity = Math.floor(
      (new Date().getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const isInactive = daysSinceLastActivity > 7 && currentStatus !== 'fechado';
    
    // Criar sugestões com base nas condições
    let suggestedStatus = '';
    let confidence = 0;
    let description = '';
    
    if (hasUserCommentWithoutResponse) {
      suggestedStatus = 'aguardando_resposta';
      confidence = 0.85;
      description = 'O cliente deixou um comentário recente que precisa de resposta.';
    } else if (hasStaffCommentWaitingResponse) {
      suggestedStatus = 'respondido';
      confidence = 0.80;
      description = 'A equipe respondeu, aguardando feedback do cliente.';
    } else if (isInactive) {
      suggestedStatus = 'fechado';
      confidence = 0.70;
      description = `Sem atividade por ${daysSinceLastActivity} dias. Considere fechar o ticket.`;
    }
    
    // Se não temos uma sugestão, retornar null
    if (!suggestedStatus) return null;
    
    // Construir ações disponíveis
    const actions = [{
      label: `Alterar status para "${suggestedStatus}"`,
      value: suggestedStatus,
      action: 'updateStatus'
    }];
    
    // Adicionar mais opções se apropriado
    if (suggestedStatus === 'fechado') {
      actions.push({
        label: 'Reabrir ticket',
        value: 'aberto',
        action: 'updateStatus'
      });
    } else if (suggestedStatus === 'aguardando_resposta') {
      actions.push({
        label: 'Marcar como resolvido',
        value: 'resolvido',
        action: 'updateStatus'
      });
    }
    
    // Construir e retornar a sugestão
    return {
      type: 'status',
      description,
      confidence,
      actions
    };
  } catch (error) {
    console.error('Erro ao gerar sugestões de status:', error);
    return null;
  }
}

/**
 * Gera sugestões de mudança de prioridade para o ticket
 */
async function generatePrioritySuggestions(
  ticket: SupportTicket,
  comments: any[]
): Promise<AISuggestion | null> {
  try {
    const currentPriority = ticket.priority;
    
    // Análise simples de keywords para determinar a prioridade
    const ticketText = [
      ticket.title, 
      ticket.description,
      ...comments.map(c => c.content)
    ].join(' ').toLowerCase();
    
    // Palavras-chave para cada nível de prioridade
    const highPriorityKeywords = [
      'urgente', 'crítico', 'emergência', 'erro grave', 'falha crítica',
      'bloqueado', 'impede', 'crucial', 'produção afetada', 'perda de dados'
    ];
    
    const mediumPriorityKeywords = [
      'importante', 'afetando', 'problema', 'bug', 'inconsistência',
      'funcionamento incorreto', 'lentidão'
    ];
    
    const lowPriorityKeywords = [
      'sugestão', 'melhoria', 'aprimoramento', 'quando possível', 'dúvida',
      'questão simples', 'ajuste menor'
    ];
    
    // Contar ocorrências das palavras-chave
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    
    highPriorityKeywords.forEach(keyword => {
      if (ticketText.includes(keyword)) highCount++;
    });
    
    mediumPriorityKeywords.forEach(keyword => {
      if (ticketText.includes(keyword)) mediumCount++;
    });
    
    lowPriorityKeywords.forEach(keyword => {
      if (ticketText.includes(keyword)) lowCount++;
    });
    
    // Determinar a prioridade sugerida com base nas contagens
    let suggestedPriority = '';
    let confidence = 0;
    let description = '';
    
    if (highCount > 0 && highCount >= mediumCount && highCount >= lowCount) {
      suggestedPriority = 'alta';
      confidence = 0.5 + (highCount * 0.1);
      description = 'Detectadas palavras-chave indicando problema de alta prioridade.';
    } else if (mediumCount > 0 && mediumCount >= lowCount) {
      suggestedPriority = 'media';
      confidence = 0.4 + (mediumCount * 0.08);
      description = 'Detectadas palavras-chave indicando problema de média prioridade.';
    } else if (lowCount > 0) {
      suggestedPriority = 'baixa';
      confidence = 0.3 + (lowCount * 0.06);
      description = 'Detectadas palavras-chave indicando problema de baixa prioridade.';
    } else {
      // Se não encontrarmos palavras-chave específicas, não sugerir mudança
      return null;
    }
    
    // Limitar confiança a 0.95
    confidence = Math.min(confidence, 0.95);
    
    // Se a prioridade sugerida for igual à atual, não sugerir mudança
    if (suggestedPriority === currentPriority) return null;
    
    // Construir ações disponíveis
    const actions = [{
      label: `Alterar prioridade para "${suggestedPriority}"`,
      value: suggestedPriority,
      action: 'updatePriority'
    }];
    
    // Adicionar outras opções
    if (suggestedPriority !== 'alta') {
      actions.push({
        label: 'Prioridade alta',
        value: 'alta',
        action: 'updatePriority'
      });
    }
    
    if (suggestedPriority !== 'media') {
      actions.push({
        label: 'Prioridade média',
        value: 'media',
        action: 'updatePriority'
      });
    }
    
    if (suggestedPriority !== 'baixa') {
      actions.push({
        label: 'Prioridade baixa',
        value: 'baixa',
        action: 'updatePriority'
      });
    }
    
    // Construir e retornar a sugestão
    return {
      type: 'priority',
      description,
      confidence,
      actions
    };
  } catch (error) {
    console.error('Erro ao gerar sugestões de prioridade:', error);
    return null;
  }
}

/**
 * Gera sugestões de atribuição para o ticket
 */
async function generateAssignmentSuggestions(
  ticket: SupportTicket,
  comments: any[]
): Promise<AISuggestion | null> {
  try {
    // Se o ticket já está atribuído, não fazer sugestão
    if (ticket.assignedToId) return null;
    
    // Obter uma lista de usuários da organização que podem receber tickets
    const orgUsers = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        role: users.role
      })
      .from(users)
      .where(eq(users.organizationId, ticket.organizationId));
    
    // Para este exemplo simples, apenas sugerir um usuário administrativo
    // Em um sistema real, seria baseado em análise de carga, especialidades, etc.
    const eligibleUsers = orgUsers.filter(user => 
      user.role === 'admin' || user.role === 'org_admin' || user.role === 'staff'
    );
    
    if (eligibleUsers.length === 0) return null;
    
    // Escolher um usuário elegível (em um sistema real, poderia ser baseado em algoritmos mais complexos)
    const suggestedUser = eligibleUsers[Math.floor(Math.random() * eligibleUsers.length)];
    
    const assignmentSuggestion: AISuggestion = {
      type: 'assignment',
      description: `Sugestão de atribuição para ${suggestedUser.name} com base na disponibilidade.`,
      confidence: 0.65,
      actions: [
        {
          label: `Atribuir para ${suggestedUser.name}`,
          value: String(suggestedUser.id),
          action: 'assignUser'
        },
        {
          label: 'Não atribuir a ninguém',
          value: 'null',
          action: 'assignUser'
        }
      ]
    };
    
    return assignmentSuggestion;
  } catch (error) {
    console.error('Erro ao gerar sugestões de atribuição:', error);
    return null;
  }
}

/**
 * Gera templates de resposta para o ticket
 */
async function generateResponseSuggestions(
  ticket: SupportTicket,
  comments: any[]
): Promise<AISuggestion | null> {
  try {
    const templates = [];
    
    // Template básico de resposta inicial
    if (comments.length === 0 || 
        (comments.length === 1 && comments[0].userId === ticket.createdById)) {
      templates.push(`Olá,\n\nObrigado por entrar em contato com o suporte. Estamos analisando sua solicitação sobre "${ticket.title}" e responderemos em breve.\n\nAtenciosamente,\nEquipe de Suporte`);
    }
    
    // Template de solicitação de mais informações
    if (ticket.status === 'aguardando_informacoes') {
      templates.push(`Olá,\n\nPara que possamos continuar a análise do seu caso, precisamos de mais informações:\n\n1. Poderia detalhar melhor quando o problema ocorre?\n2. É possível enviar uma captura de tela do erro?\n\nAguardamos seu retorno.\n\nAtenciosamente,\nEquipe de Suporte`);
    }
    
    // Template de resolução para problemas comuns
    if (ticket.category === 'acesso' || ticket.description.toLowerCase().includes('senha') || ticket.description.toLowerCase().includes('login')) {
      templates.push(`Olá,\n\nVerificamos seu problema de acesso ao sistema. Para resolver:\n\n1. Limpe o cache do navegador\n2. Utilize o link "Esqueci minha senha" na página de login\n3. Verifique se seu e-mail está correto no cadastro\n\nSe o problema persistir, por favor nos informe.\n\nAtenciosamente,\nEquipe de Suporte`);
    }
    
    // Template de fechamento de ticket
    if (ticket.status === 'resolvido') {
      templates.push(`Olá,\n\nConfirmamos que sua solicitação foi atendida e seu ticket será fechado.\n\nCaso tenha alguma dúvida adicional, sinta-se à vontade para abrir um novo chamado ou responder a esta mensagem.\n\nAgradecemos seu contato.\n\nAtenciosamente,\nEquipe de Suporte`);
    }
    
    // Se não temos templates, não retornar sugestão
    if (templates.length === 0) return null;
    
    // Construir ações para cada template
    const actions = templates.map((template, index) => ({
      label: `Modelo de resposta ${index + 1}`,
      value: `template_${index}`,
      action: 'useTemplate'
    }));
    
    return {
      type: 'response',
      description: 'Modelos de resposta sugeridos com base no contexto do ticket.',
      confidence: 0.75,
      actions,
      responseTemplate: templates.join('\n\n---\n\n')
    };
  } catch (error) {
    console.error('Erro ao gerar templates de resposta:', error);
    return null;
  }
}

/**
 * Busca tickets relacionados ao ticket atual
 */
async function generateRelatedTicketsSuggestions(
  ticket: SupportTicket
): Promise<AISuggestion | null> {
  try {
    // Buscar tickets com título ou descrição similar
    // Usando uma consulta simples para demonstração
    // Em produção, usar vetores de embedding e similaridade seria mais eficiente
    
    const words = [...new Set(
      [ticket.title, ticket.description]
        .join(' ')
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3)
    )];
    
    if (words.length === 0) return null;
    
    // Construir uma consulta SQL para buscar tickets similares
    const query = await db.execute(sql`
      SELECT id, title, description, status, priority, created_at, updated_at
      FROM support_tickets 
      WHERE 
        id != ${ticket.id} AND
        organization_id = ${ticket.organizationId} AND
        (
          ${words.map(word => `LOWER(title) LIKE '%${word}%'`).join(' OR ')} OR
          ${words.map(word => `LOWER(description) LIKE '%${word}%'`).join(' OR ')}
        )
      ORDER BY updated_at DESC
      LIMIT 5
    `);
    
    const relatedTickets = query.rows as any[];
    
    if (relatedTickets.length === 0) return null;
    
    const relatedTicketIds = relatedTickets.map(t => Number(t.id));
    
    return {
      type: 'relatedTickets',
      description: `Encontramos ${relatedTickets.length} tickets que podem estar relacionados.`,
      confidence: 0.6 + (relatedTickets.length * 0.05),
      relatedTickets: relatedTicketIds,
      relatedTicketsDetails: relatedTickets
    };
  } catch (error) {
    console.error('Erro ao buscar tickets relacionados:', error);
    return null;
  }
}