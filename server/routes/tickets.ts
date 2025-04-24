import { Request, Response, Router, NextFunction } from 'express';
import { db } from '../db';
import { eq, and, desc, asc, isNull, sql } from 'drizzle-orm';
import { supportTickets, ticketComments, users } from '../../shared/schema';
import { authenticate } from '../routes';
import { generateTicketAiSuggestions } from '../services/ticketAiService';

// Estender o tipo Request para incluir propriedades personalizadas
declare global {
  namespace Express {
    interface Request {
      ticket?: any;
    }
  }
}

const router = Router();

// Middleware para verificar se o ticket pertence à organização do usuário
const ensureTicketAccess = async (req: Request, res: Response, next: Function) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autorizado' });
    }

    const ticketId = parseInt(req.params.id);
    if (isNaN(ticketId)) {
      return res.status(400).json({ message: 'ID de ticket inválido' });
    }

    const [ticket] = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.id, ticketId));

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket não encontrado' });
    }

    // Verificar se o usuário pertence à organização do ticket
    if (req.user.organizationId !== ticket.organizationId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado a este ticket' });
    }

    // Adiciona o ticket ao objeto de requisição para uso posterior
    req.ticket = ticket;
    next();
  } catch (error) {
    console.error('Erro ao verificar acesso ao ticket:', error);
    res.status(500).json({ message: 'Erro ao verificar acesso ao ticket' });
  }
};

// Obter todos os tickets da organização
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    // Se for admin, pode ver todos os tickets (com paginação)
    // Se for usuário normal, só vê tickets da sua organização
    const organizationId = req.user.organizationId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    // Adicionar contagem de comentários para cada ticket
    const ticketsWithComments = await db.execute(sql`
      SELECT t.*, 
        u_created.name as created_by_name,
        u_assigned.name as assigned_to_name,
        COUNT(DISTINCT c.id) as comment_count
      FROM "support_tickets" t
      LEFT JOIN "users" u_created ON t.created_by_id = u_created.id
      LEFT JOIN "users" u_assigned ON t.assigned_to_id = u_assigned.id
      LEFT JOIN "ticket_comments" c ON t.id = c.ticket_id
      WHERE t.organization_id = ${organizationId}
      GROUP BY t.id, u_created.name, u_assigned.name
      ORDER BY t.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    res.json(ticketsWithComments.rows);
  } catch (error) {
    console.error('Erro ao buscar tickets:', error);
    res.status(500).json({ message: 'Erro ao buscar tickets' });
  }
});

// Obter um ticket específico
router.get('/:id', authenticate, ensureTicketAccess, async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id);

    // Buscar informações detalhadas do ticket incluindo nomes
    const [ticketWithDetails] = await db.execute(sql`
      SELECT t.*, 
        u_created.name as created_by_name,
        u_assigned.name as assigned_to_name,
        o.name as organization_name
      FROM "support_tickets" t
      LEFT JOIN "users" u_created ON t.created_by_id = u_created.id
      LEFT JOIN "users" u_assigned ON t.assigned_to_id = u_assigned.id
      LEFT JOIN "organizations" o ON t.organization_id = o.id
      WHERE t.id = ${ticketId}
    `);

    if (!ticketWithDetails.rows.length) {
      return res.status(404).json({ message: 'Ticket não encontrado' });
    }

    res.json(ticketWithDetails.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar detalhes do ticket:', error);
    res.status(500).json({ message: 'Erro ao buscar detalhes do ticket' });
  }
});

// Criar um novo ticket
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { title, description, category, priority, organizationId } = req.body;

    // Verificar se o usuário pertence à organização
    if (req.user.organizationId !== organizationId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Você não pode criar tickets para esta organização' });
    }

    // Criar novo ticket
    const [newTicket] = await db
      .insert(supportTickets)
      .values({
        title,
        description,
        category,
        priority,
        organizationId,
        createdById: req.user.id,
        status: 'novo',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Log para acompanhamento
    console.log(`Novo ticket criado: ${newTicket.id} - ${newTicket.title}`);

    res.status(201).json(newTicket);
  } catch (error) {
    console.error('Erro ao criar ticket:', error);
    res.status(500).json({ message: 'Erro ao criar ticket' });
  }
});

// Atualizar um ticket
router.patch('/:id', authenticate, ensureTicketAccess, async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id);
    const { status, priority, assignedToId } = req.body;

    // Preparar dados para atualização
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (status) {
      updateData.status = status;
      
      // Se o status mudou para resolvido, adicionar data de resolução
      if (status === 'resolvido' && req.ticket.status !== 'resolvido') {
        updateData.resolvedAt = new Date();
      }
      
      // Se o status mudou para fechado, adicionar data de fechamento
      if (status === 'fechado' && req.ticket.status !== 'fechado') {
        updateData.closedAt = new Date();
      }
    }

    if (priority) {
      updateData.priority = priority;
    }

    // assignedToId pode ser null (para remover atribuição)
    if (assignedToId !== undefined) {
      updateData.assignedToId = assignedToId;
    }

    // Atualizar o ticket
    const [updatedTicket] = await db
      .update(supportTickets)
      .set(updateData)
      .where(eq(supportTickets.id, ticketId))
      .returning();

    res.json(updatedTicket);
  } catch (error) {
    console.error('Erro ao atualizar ticket:', error);
    res.status(500).json({ message: 'Erro ao atualizar ticket' });
  }
});

// Obter comentários de um ticket
router.get('/:id/comments', authenticate, ensureTicketAccess, async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id);
    const isAdmin = req.user.role === 'admin' || req.user.role === 'org_admin';

    // Preparar a consulta base
    let query = db
      .select({
        comment: ticketComments,
        user: {
          name: users.name,
          username: users.username,
          role: users.role,
        },
      })
      .from(ticketComments)
      .leftJoin(users, eq(ticketComments.userId, users.id))
      .where(eq(ticketComments.ticketId, ticketId));

    // Se não for admin, filtrar comentários internos
    if (!isAdmin) {
      query = query.where(eq(ticketComments.isInternal, false));
    }

    // Executar a consulta
    const commentsWithUsers = await query.orderBy(asc(ticketComments.createdAt));

    // Formatar resposta
    const formattedComments = commentsWithUsers.map(({ comment, user }) => ({
      id: comment.id,
      ticketId: comment.ticketId,
      userId: comment.userId,
      content: comment.content,
      isInternal: comment.isInternal,
      createdAt: comment.createdAt,
      user: {
        name: user.name,
        username: user.username,
        role: user.role,
      },
    }));

    res.json(formattedComments);
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    res.status(500).json({ message: 'Erro ao buscar comentários' });
  }
});

// Adicionar comentário a um ticket
router.post('/:id/comments', authenticate, ensureTicketAccess, async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id);
    const { content, isInternal = false } = req.body;

    // Verificar permissão para comentários internos
    const isAdmin = req.user.role === 'admin' || req.user.role === 'org_admin';
    if (isInternal && !isAdmin) {
      return res.status(403).json({ message: 'Apenas administradores podem criar comentários internos' });
    }

    // Criar novo comentário
    const [newComment] = await db
      .insert(ticketComments)
      .values({
        ticketId,
        userId: req.user.id,
        content,
        isInternal,
        createdAt: new Date(),
      })
      .returning();

    // Atualizar o status do ticket se não for interno
    if (!isInternal) {
      const currentTicket = req.ticket;
      
      // Se o ticket está aguardando resposta e o usuário não é o criador, marcar como resolvido
      if (currentTicket.status === 'aguardando_resposta' && currentTicket.createdById !== req.user.id) {
        await db
          .update(supportTickets)
          .set({ 
            status: 'resolvido',
            resolvedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(supportTickets.id, ticketId));
      }
      
      // Se o ticket está em análise/desenvolvimento e o usuário é o criador, marcar como aguardando resposta
      if (['em_analise', 'em_desenvolvimento'].includes(currentTicket.status) && currentTicket.createdById === req.user.id) {
        await db
          .update(supportTickets)
          .set({ 
            status: 'aguardando_resposta',
            updatedAt: new Date(),
          })
          .where(eq(supportTickets.id, ticketId));
      }
    }

    // Log para acompanhamento
    console.log(`Comentário adicionado ao ticket ${ticketId}`);

    // Buscar o comentário com dados do usuário
    const [commentWithUser] = await db
      .select({
        comment: ticketComments,
        user: {
          name: users.name,
          username: users.username,
          role: users.role,
        },
      })
      .from(ticketComments)
      .leftJoin(users, eq(ticketComments.userId, users.id))
      .where(and(
        eq(ticketComments.id, newComment.id),
        eq(ticketComments.ticketId, ticketId)
      ));

    // Formatar resposta
    const formattedComment = {
      ...commentWithUser.comment,
      user: commentWithUser.user,
    };

    res.status(201).json(formattedComment);
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    res.status(500).json({ message: 'Erro ao adicionar comentário' });
  }
});

// Obter sugestões de IA para um ticket
router.get('/:id/ai-suggestions', authenticate, ensureTicketAccess, async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id);
    
    // Verificar se o usuário é admin
    const isAdmin = req.user.role === 'admin' || req.user.role === 'org_admin';
    if (!isAdmin) {
      return res.status(403).json({ message: 'Acesso negado às sugestões de IA' });
    }

    // Buscar comentários do ticket para contexto
    const comments = await db
      .select()
      .from(ticketComments)
      .where(eq(ticketComments.ticketId, ticketId))
      .orderBy(asc(ticketComments.createdAt));

    // Ticket já foi buscado pelo middleware ensureTicketAccess
    const ticket = req.ticket;

    // Gerar sugestões baseadas no ticket e comentários
    const suggestions = await generateTicketAiSuggestions(ticket, comments);

    res.json(suggestions);
  } catch (error) {
    console.error('Erro ao gerar sugestões de IA:', error);
    res.status(500).json({ message: 'Erro ao gerar sugestões de IA' });
  }
});

// Aplicar sugestão de IA
router.post('/:id/apply-suggestion', authenticate, ensureTicketAccess, async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id);
    const { action, value } = req.body;
    
    // Verificar se o usuário é admin
    const isAdmin = req.user.role === 'admin' || req.user.role === 'org_admin';
    if (!isAdmin) {
      return res.status(403).json({ message: 'Acesso negado para aplicar sugestões de IA' });
    }

    let result;

    // Aplicar a ação baseada no tipo
    switch (action) {
      case 'change_status':
        const [updatedTicket] = await db
          .update(supportTickets)
          .set({ 
            status: value,
            updatedAt: new Date(),
            ...(value === 'resolvido' ? { resolvedAt: new Date() } : {}),
            ...(value === 'fechado' ? { closedAt: new Date() } : {}),
          })
          .where(eq(supportTickets.id, ticketId))
          .returning();
        
        result = updatedTicket;
        break;
        
      case 'change_priority':
        const [priorityUpdated] = await db
          .update(supportTickets)
          .set({ 
            priority: value,
            updatedAt: new Date(),
          })
          .where(eq(supportTickets.id, ticketId))
          .returning();
        
        result = priorityUpdated;
        break;
        
      case 'assign_user':
        const assigneeId = parseInt(value);
        const [assignmentUpdated] = await db
          .update(supportTickets)
          .set({ 
            assignedToId: assigneeId,
            updatedAt: new Date(),
          })
          .where(eq(supportTickets.id, ticketId))
          .returning();
        
        result = assignmentUpdated;
        break;
        
      case 'add_comment':
        const [newComment] = await db
          .insert(ticketComments)
          .values({
            ticketId,
            userId: req.user.id,
            content: value,
            isInternal: false,
            createdAt: new Date(),
          })
          .returning();
        
        result = newComment;
        break;
        
      default:
        return res.status(400).json({ message: 'Ação de sugestão não reconhecida' });
    }

    res.json({ 
      success: true, 
      message: 'Sugestão aplicada com sucesso',
      result
    });
  } catch (error) {
    console.error('Erro ao aplicar sugestão de IA:', error);
    res.status(500).json({ message: 'Erro ao aplicar sugestão de IA' });
  }
});

export default router;