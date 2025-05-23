/**
 * Serviço de notificações
 * 
 * Este serviço gerencia o envio e a recuperação de notificações no sistema
 * Inclui sistema de cache em memória para reduzir consultas ao banco de dados
 */

import { db } from "../db";
import { eq, and, desc, sql } from "drizzle-orm";
import { notifications, insertNotificationSchema, supportTickets, organizations, users } from "@shared/schema";
import { InsertNotification, Notification } from "@shared/schema";

/**
 * Sistema de cache para notificações
 * Armazena notificações e estatísticas por um curto período para melhorar desempenho
 */
interface NotificationCache {
  [userId: number]: {
    notifications: Notification[];
    unread: Notification[];
    stats: {
      total: number;
      unread: number;
      byType: { [key: string]: number };
    };
    timestamp: number;
  }
}

// Cache de notificações - expira em 30 segundos
const notificationsCache: NotificationCache = {};
const CACHE_TTL = 30 * 1000; // 30 segundos em milissegundos

// Função para limpar entradas expiradas do cache (chamada periodicamente)
function cleanupExpiredCache() {
  const now = Date.now();
  Object.keys(notificationsCache).forEach(key => {
    const userId = parseInt(key);
    if (now - notificationsCache[userId].timestamp > CACHE_TTL) {
      delete notificationsCache[userId];
    }
  });
}

// Limpar cache a cada minuto
setInterval(cleanupExpiredCache, 60 * 1000);

/**
 * Criar uma notificação para um usuário e invalidar o cache
 */
export async function createNotification(notificationData: InsertNotification): Promise<Notification> {
  const [notification] = await db.insert(notifications)
    .values(notificationData)
    .returning();
  
  // Invalidar o cache para este usuário se houver
  if (notificationData.userId && notificationsCache[notificationData.userId]) {
    delete notificationsCache[notificationData.userId];
  }
  
  return notification;
}

/**
 * Criar uma notificação para um ticket de suporte e invalidar o cache
 */
export async function createTicketNotification(
  ticketId: number, 
  type: 'info' | 'warning' | 'success' | 'error',
  title: string,
  message: string,
  userId: number
): Promise<Notification> {
  // Buscar o ticket para obter a organização
  const [ticket] = await db.select()
    .from(supportTickets)
    .where(eq(supportTickets.id, ticketId))
    .limit(1);

  if (!ticket) {
    throw new Error(`Ticket com ID ${ticketId} não encontrado`);
  }

  // Criar a notificação
  const [notification] = await db.insert(notifications)
    .values({
      title,
      message,
      type,
      userId,
      ticketId,
      organizationId: ticket.organizationId,
      isRead: false,
    })
    .returning();
  
  // Invalidar o cache para este usuário
  if (notificationsCache[userId]) {
    delete notificationsCache[userId];
  }
  
  return notification;
}

/**
 * Buscar notificações de um usuário (com cache)
 */
export async function getUserNotifications(userId: number): Promise<Notification[]> {
  // Verificar se há dados em cache válidos
  if (notificationsCache[userId] && 
      Date.now() - notificationsCache[userId].timestamp < CACHE_TTL) {
    return notificationsCache[userId].notifications;
  }
  
  // Se não houver cache ou estiver expirado, buscar do banco
  const userNotifications = await db.select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));
  
  // Inicializar o cache para este usuário se não existir
  if (!notificationsCache[userId]) {
    notificationsCache[userId] = {
      notifications: [],
      unread: [],
      stats: { total: 0, unread: 0, byType: {} },
      timestamp: Date.now()
    };
  }
  
  // Atualizar o cache
  notificationsCache[userId].notifications = userNotifications;
  notificationsCache[userId].timestamp = Date.now();
  
  return userNotifications;
}

/**
 * Buscar notificações não lidas de um usuário (com cache)
 */
export async function getUnreadNotifications(userId: number): Promise<Notification[]> {
  // Verificar se há dados em cache válidos
  if (notificationsCache[userId] && 
      notificationsCache[userId].unread &&
      Date.now() - notificationsCache[userId].timestamp < CACHE_TTL) {
    return notificationsCache[userId].unread;
  }
  
  // Se não houver cache ou estiver expirado, buscar do banco
  const unreadNotifications = await db.select()
    .from(notifications)
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, false)
    ))
    .orderBy(desc(notifications.createdAt));
  
  // Inicializar o cache para este usuário se não existir
  if (!notificationsCache[userId]) {
    notificationsCache[userId] = {
      notifications: [],
      unread: [],
      stats: { total: 0, unread: 0, byType: {} },
      timestamp: Date.now()
    };
  }
  
  // Atualizar o cache
  notificationsCache[userId].unread = unreadNotifications;
  notificationsCache[userId].timestamp = Date.now();
  
  return unreadNotifications;
}

/**
 * Marcar uma notificação como lida
 */
export async function markNotificationAsRead(notificationId: number): Promise<Notification> {
  const [notification] = await db.update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId))
    .returning();
  
  if (!notification) {
    throw new Error(`Notificação com ID ${notificationId} não encontrada`);
  }
  
  // Invalidar o cache para o usuário da notificação
  if (notification.userId && notificationsCache[notification.userId]) {
    delete notificationsCache[notification.userId];
  }
  
  return notification;
}

/**
 * Marcar todas as notificações de um usuário como lidas
 */
export async function markAllNotificationsAsRead(userId: number): Promise<number> {
  const result = await db.update(notifications)
    .set({ isRead: true })
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, false)
    ))
    .returning({ id: notifications.id });
  
  // Invalidar o cache para este usuário
  if (notificationsCache[userId]) {
    delete notificationsCache[userId];
  }
  
  return result.length;
}

/**
 * Buscar estatísticas de notificações para um usuário (com cache)
 */
export async function getNotificationStats(userId: number): Promise<{
  total: number;
  unread: number;
  byType: { [key: string]: number };
}> {
  // Verificar se há dados em cache válidos
  if (notificationsCache[userId] && 
      notificationsCache[userId].stats &&
      Date.now() - notificationsCache[userId].timestamp < CACHE_TTL) {
    return notificationsCache[userId].stats;
  }
  
  // Total de notificações
  const [totalResult] = await db.select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(eq(notifications.userId, userId));
  
  // Notificações não lidas
  const [unreadResult] = await db.select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, false)
    ));
  
  // Contagem por tipo
  const typeCountsResult = await db.select({
    type: notifications.type,
    count: sql<number>`count(*)`
  })
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .groupBy(notifications.type);
  
  const byType: { [key: string]: number } = {};
  typeCountsResult.forEach(item => {
    byType[item.type] = Number(item.count);
  });
  
  const stats = {
    total: Number(totalResult.count),
    unread: Number(unreadResult.count),
    byType
  };
  
  // Inicializar o cache para este usuário se não existir
  if (!notificationsCache[userId]) {
    notificationsCache[userId] = {
      notifications: [],
      unread: [],
      stats,
      timestamp: Date.now()
    };
  } else {
    // Atualizar apenas as estatísticas no cache
    notificationsCache[userId].stats = stats;
    notificationsCache[userId].timestamp = Date.now();
  }
  
  return stats;
}

/**
 * Excluir notificações antigas (mais de 30 dias)
 * Para manter o sistema limpo e eficiente
 */
export async function cleanupOldNotifications(): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Primeiro obter IDs de usuários afetados para limpar o cache
  const affectedUsers = await db.select({ userId: notifications.userId })
    .from(notifications)
    .where(sql`${notifications.createdAt} < ${thirtyDaysAgo}`)
    .groupBy(notifications.userId);
  
  // Excluir as notificações antigas
  const result = await db.delete(notifications)
    .where(sql`${notifications.createdAt} < ${thirtyDaysAgo}`)
    .returning({ id: notifications.id });
  
  // Limpar o cache para usuários afetados
  affectedUsers.forEach(user => {
    if (user.userId && notificationsCache[user.userId]) {
      delete notificationsCache[user.userId];
    }
  });
  
  return result.length;
}

/**
 * Criar dados simulados de notificações para admins
 * (Usado apenas em ambiente de desenvolvimento)
 */
export async function createMockNotifications(): Promise<void> {
  // Verificar se já existem notificações
  const [notificationCount] = await db.select({ count: sql<number>`count(*)` })
    .from(notifications);
  
  if (Number(notificationCount.count) > 0) {
    console.log("[Notifications] Notificações já existem, pulando criação de mock data");
    return;
  }
  
  // Obter IDs de admins
  const adminUsers = await db.select()
    .from(users)
    .where(eq(users.role, 'admin'));
  
  if (adminUsers.length === 0) {
    console.log("[Notifications] Nenhum usuário admin encontrado, pulando criação de notificações");
    return;
  }
  
  // Obter tickets existentes
  const tickets = await db.select()
    .from(supportTickets)
    .limit(5);
  
  if (tickets.length === 0) {
    console.log("[Notifications] Nenhum ticket encontrado, pulando criação de notificações");
    return;
  }
  
  const mockNotifications = [
    {
      title: 'Novo ticket crítico',
      message: 'Um novo ticket com prioridade crítica foi criado.',
      type: 'warning',
      ticketId: tickets[0].id,
      createdAt: new Date()
    },
    {
      title: 'Prazo de resposta excedido',
      message: 'Um ticket está aguardando resposta há mais de 24 horas.',
      type: 'error',
      ticketId: tickets[1].id,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      title: 'Ticket resolvido',
      message: 'Um ticket foi marcado como resolvido.',
      type: 'success',
      ticketId: tickets[2].id,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Ticket de desenvolvimento atualizado',
      message: 'Um ticket de desenvolvimento recebeu um novo comentário.',
      type: 'info',
      ticketId: tickets[3].id,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
    }
  ];
  
  for (const user of adminUsers) {
    for (const notif of mockNotifications) {
      try {
        await db.insert(notifications)
          .values({
            title: notif.title,
            message: notif.message,
            type: notif.type as any,
            userId: user.id,
            isRead: Math.random() > 0.7, // Algumas lidas, outras não
            ticketId: notif.ticketId,
            organizationId: tickets[0].organizationId,
            createdAt: notif.createdAt
          });
      } catch (error) {
        console.error("[Notifications] Erro ao criar notificação mock:", error);
      }
    }
  }
  
  console.log("[Notifications] Notificações mock criadas com sucesso");
}

/**
 * Gerar notificações de sistema, como alertas de tickets críticos ou expiração de prazos
 * Esta função seria chamada periodicamente por um job
 */
export async function generateSystemNotifications(): Promise<void> {
  // Verificar tickets críticos sem resposta por mais de 2 horas
  const criticalTickets = await db.select({
    id: supportTickets.id,
    title: supportTickets.title,
    organizationId: supportTickets.organizationId
  })
    .from(supportTickets)
    .where(and(
      eq(supportTickets.priority, 'critica'),
      eq(supportTickets.status, 'novo'),
      sql`${supportTickets.createdAt} < ${new Date(Date.now() - 2 * 60 * 60 * 1000)}`
    ));
  
  // Obter admins para notificar
  const adminUsers = await db.select()
    .from(users)
    .where(eq(users.role, 'admin'));
  
  // Notificar admins sobre tickets críticos sem resposta
  for (const ticket of criticalTickets) {
    // Obter nome da organização
    const [org] = await db.select({ name: organizations.name })
      .from(organizations)
      .where(eq(organizations.id, ticket.organizationId))
      .limit(1);
    
    const orgName = org ? org.name : 'Sem nome';
    
    for (const admin of adminUsers) {
      try {
        await createNotification({
          title: 'Alerta: Ticket crítico sem resposta',
          message: `O ticket crítico "${ticket.title}" da organização "${orgName}" está sem resposta há mais de 2 horas.`,
          type: 'error',
          userId: admin.id,
          ticketId: ticket.id,
          organizationId: ticket.organizationId,
          isRead: false
        });
      } catch (error) {
        console.error("[Notifications] Erro ao criar notificação de sistema:", error);
      }
    }
  }
}