import express from 'express';
import { db } from '../db';
import { eq, desc, and, like, ne, sql, count } from 'drizzle-orm';
import {
  cmarketCategoriesTable,
  cmarketAnnouncementsTable,
  cmarketProposalsTable,
  cmarketProductsTable,
  insertCmarketAnnouncementSchema,
  insertCmarketProposalSchema,
  insertCmarketProductSchema,
  insertCmarketCategorySchema
} from '@shared/schema-cmarket';
import { organizations } from '@shared/schema';

export const router = express.Router();

// Middleware para garantir que o usuário está autenticado
const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Não autenticado' });
};

// Middleware para verificar se é um fornecedor ou admin
const isSupplierOrAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.isAuthenticated() && (req.user.role === 'supplier' || req.user.role === 'org_admin' || req.user.role === 'admin')) {
    return next();
  }
  return res.status(403).json({ message: 'Acesso não autorizado' });
};

// Rota para obter todas as categorias
router.get('/categories', async (req, res) => {
  try {
    const categories = await db.select().from(cmarketCategoriesTable).orderBy(cmarketCategoriesTable.name);
    return res.json(categories);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return res.status(500).json({ message: 'Erro ao buscar categorias' });
  }
});

// Rota para criar uma nova categoria
router.post('/categories', isSupplierOrAdmin, async (req, res) => {
  try {
    const validatedData = insertCmarketCategorySchema.parse(req.body);
    const [category] = await db.insert(cmarketCategoriesTable).values(validatedData).returning();
    return res.status(201).json(category);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return res.status(400).json({ message: 'Erro ao criar categoria', error });
  }
});

// Rota para obter anúncios de compra (com paginação e filtros)
router.get('/announcements', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, status = 'open' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = db.select({
      announcement: cmarketAnnouncementsTable,
      organization: {
        id: organizations.id,
        name: organizations.name,
        logo: organizations.logo,
      }
    })
    .from(cmarketAnnouncementsTable)
    .leftJoin(organizations, eq(cmarketAnnouncementsTable.organizationId, organizations.id))
    .orderBy(desc(cmarketAnnouncementsTable.createdAt))
    .limit(Number(limit))
    .offset(offset);
    
    // Aplicar filtros se fornecidos
    if (category) {
      query = query.where(eq(cmarketAnnouncementsTable.categoryId, Number(category)));
    }
    
    if (search) {
      query = query.where(
        like(cmarketAnnouncementsTable.title, `%${search}%`)
      );
    }
    
    if (status) {
      query = query.where(eq(cmarketAnnouncementsTable.status, String(status)));
    }
    
    const announcements = await query;
    
    // Contar total para paginação
    const countQuery = db.select({ count: count() })
      .from(cmarketAnnouncementsTable);
    
    if (category) {
      countQuery.where(eq(cmarketAnnouncementsTable.categoryId, Number(category)));
    }
    
    if (search) {
      countQuery.where(like(cmarketAnnouncementsTable.title, `%${search}%`));
    }
    
    if (status) {
      countQuery.where(eq(cmarketAnnouncementsTable.status, String(status)));
    }
    
    const [{ count: total }] = await countQuery;
    
    return res.json({
      data: announcements,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar anúncios:', error);
    return res.status(500).json({ message: 'Erro ao buscar anúncios' });
  }
});

// Rota para obter detalhes de um anúncio específico
router.get('/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Incrementar contador de visualizações
    await db.update(cmarketAnnouncementsTable)
      .set({ viewCount: sql`${cmarketAnnouncementsTable.viewCount} + 1` })
      .where(eq(cmarketAnnouncementsTable.id, Number(id)));
    
    const [announcement] = await db.select({
      announcement: cmarketAnnouncementsTable,
      organization: {
        id: organizations.id,
        name: organizations.name,
        logo: organizations.logo,
        address: organizations.address,
        city: organizations.city,
        state: organizations.state,
      },
      category: {
        id: cmarketCategoriesTable.id,
        name: cmarketCategoriesTable.name,
      }
    })
    .from(cmarketAnnouncementsTable)
    .leftJoin(organizations, eq(cmarketAnnouncementsTable.organizationId, organizations.id))
    .leftJoin(cmarketCategoriesTable, eq(cmarketAnnouncementsTable.categoryId, cmarketCategoriesTable.id))
    .where(eq(cmarketAnnouncementsTable.id, Number(id)));
    
    if (!announcement) {
      return res.status(404).json({ message: 'Anúncio não encontrado' });
    }
    
    // Obter propostas para este anúncio (se o usuário for o criador ou um administrador)
    let proposals = [];
    if (req.isAuthenticated() && 
        (req.user.role === 'admin' || 
         req.user.organizationId === announcement.announcement.organizationId)) {
      proposals = await db.select()
        .from(cmarketProposalsTable)
        .where(eq(cmarketProposalsTable.announcementId, Number(id)))
        .orderBy(desc(cmarketProposalsTable.createdAt));
    }
    
    // Verificar se o usuário logado já enviou uma proposta
    let userProposal = null;
    if (req.isAuthenticated()) {
      const [proposal] = await db.select()
        .from(cmarketProposalsTable)
        .where(and(
          eq(cmarketProposalsTable.announcementId, Number(id)),
          eq(cmarketProposalsTable.vendorId, req.user.id)
        ));
      
      userProposal = proposal || null;
    }
    
    return res.json({
      ...announcement,
      proposals,
      userProposal
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes do anúncio:', error);
    return res.status(500).json({ message: 'Erro ao buscar detalhes do anúncio' });
  }
});

// Rota para criar um novo anúncio
router.post('/announcements', isAuthenticated, async (req, res) => {
  try {
    const validatedData = insertCmarketAnnouncementSchema.parse({
      ...req.body,
      creatorId: req.user.id,
      organizationId: req.user.organizationId
    });
    
    const [announcement] = await db.insert(cmarketAnnouncementsTable)
      .values(validatedData)
      .returning();
    
    return res.status(201).json(announcement);
  } catch (error) {
    console.error('Erro ao criar anúncio:', error);
    return res.status(400).json({ message: 'Erro ao criar anúncio', error });
  }
});

// Rota para atualizar um anúncio
router.put('/announcements/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o anúncio existe e pertence ao usuário ou organização
    const [existingAnnouncement] = await db.select()
      .from(cmarketAnnouncementsTable)
      .where(eq(cmarketAnnouncementsTable.id, Number(id)));
    
    if (!existingAnnouncement) {
      return res.status(404).json({ message: 'Anúncio não encontrado' });
    }
    
    // Verificar se o usuário é o criador ou um administrador
    if (existingAnnouncement.creatorId !== req.user.id && 
        existingAnnouncement.organizationId !== req.user.organizationId && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Sem permissão para editar este anúncio' });
    }
    
    const validatedData = insertCmarketAnnouncementSchema.partial().parse(req.body);
    
    const [updatedAnnouncement] = await db.update(cmarketAnnouncementsTable)
      .set(validatedData)
      .where(eq(cmarketAnnouncementsTable.id, Number(id)))
      .returning();
    
    return res.json(updatedAnnouncement);
  } catch (error) {
    console.error('Erro ao atualizar anúncio:', error);
    return res.status(400).json({ message: 'Erro ao atualizar anúncio', error });
  }
});

// Rota para enviar uma proposta para um anúncio
router.post('/announcements/:id/proposals', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o anúncio existe
    const [announcement] = await db.select()
      .from(cmarketAnnouncementsTable)
      .where(eq(cmarketAnnouncementsTable.id, Number(id)));
    
    if (!announcement) {
      return res.status(404).json({ message: 'Anúncio não encontrado' });
    }
    
    // Verificar se o anúncio está aberto
    if (announcement.status !== 'open') {
      return res.status(400).json({ message: 'Este anúncio não está mais aceitando propostas' });
    }
    
    // Verificar se o usuário já enviou uma proposta
    const [existingProposal] = await db.select()
      .from(cmarketProposalsTable)
      .where(and(
        eq(cmarketProposalsTable.announcementId, Number(id)),
        eq(cmarketProposalsTable.vendorId, req.user.id)
      ));
    
    if (existingProposal) {
      return res.status(400).json({ message: 'Você já enviou uma proposta para este anúncio' });
    }
    
    const validatedData = insertCmarketProposalSchema.parse({
      ...req.body,
      announcementId: Number(id),
      vendorId: req.user.id,
      organizationId: req.user.organizationId
    });
    
    const [proposal] = await db.insert(cmarketProposalsTable)
      .values(validatedData)
      .returning();
    
    return res.status(201).json(proposal);
  } catch (error) {
    console.error('Erro ao enviar proposta:', error);
    return res.status(400).json({ message: 'Erro ao enviar proposta', error });
  }
});

// Rota para atualizar o status de uma proposta (aceitar/rejeitar)
router.patch('/proposals/:id/status', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status inválido' });
    }
    
    // Verificar se a proposta existe
    const [proposal] = await db.select({
      proposal: cmarketProposalsTable,
      announcement: {
        id: cmarketAnnouncementsTable.id,
        creatorId: cmarketAnnouncementsTable.creatorId,
        organizationId: cmarketAnnouncementsTable.organizationId
      }
    })
    .from(cmarketProposalsTable)
    .leftJoin(cmarketAnnouncementsTable, eq(cmarketProposalsTable.announcementId, cmarketAnnouncementsTable.id))
    .where(eq(cmarketProposalsTable.id, Number(id)));
    
    if (!proposal) {
      return res.status(404).json({ message: 'Proposta não encontrada' });
    }
    
    // Verificar se o usuário é o criador do anúncio ou um administrador
    if (proposal.announcement.creatorId !== req.user.id && 
        proposal.announcement.organizationId !== req.user.organizationId && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Sem permissão para atualizar esta proposta' });
    }
    
    const [updatedProposal] = await db.update(cmarketProposalsTable)
      .set({ status })
      .where(eq(cmarketProposalsTable.id, Number(id)))
      .returning();
    
    // Se a proposta foi aceita, atualizar o status do anúncio para fechado
    if (status === 'accepted') {
      await db.update(cmarketAnnouncementsTable)
        .set({ status: 'closed' })
        .where(eq(cmarketAnnouncementsTable.id, proposal.announcement.id));
      
      // Rejeitar todas as outras propostas para este anúncio
      await db.update(cmarketProposalsTable)
        .set({ status: 'rejected' })
        .where(and(
          eq(cmarketProposalsTable.announcementId, proposal.announcement.id),
          ne(cmarketProposalsTable.id, Number(id))
        ));
    }
    
    return res.json(updatedProposal);
  } catch (error) {
    console.error('Erro ao atualizar status da proposta:', error);
    return res.status(400).json({ message: 'Erro ao atualizar status da proposta', error });
  }
});

export const registerCMarketRoutes = (app: express.Express) => {
  app.use('/api/cmarket', router);
  console.log('Rotas do CMarket registradas com sucesso');
};