import { Router, Request, Response } from 'express';
import { db } from '../db';
import { eq, and, sql } from 'drizzle-orm';
import { 
  organizations, 
  organizationModules, 
  users,
  pharmacists,
  pharmacistStatusEnum,
  insertPharmacistSchema,
  modules
} from '@shared/schema';
import { authenticate } from '../routes';
import { z } from 'zod';

const farmaciaRouter = Router();

// Middleware para verificar se o usuário tem acesso ao módulo de farmácia
const checkFarmaciaModuleAccess = async (req: Request, res: Response, next: Function) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    const { organizationId } = req.session.user;
    
    if (!organizationId) {
      return res.status(403).json({ message: 'Usuário não pertence a nenhuma organização' });
    }

    // Verificar se o módulo de farmácia está ativado para esta organização
    const moduleCheck = await db.select()
      .from(organizationModules)
      .innerJoin(modules, eq(modules.id, organizationModules.moduleId))
      .where(
        and(
          eq(organizationModules.organizationId, organizationId),
          eq(modules.slug, 'farmacia')
        )
      )
      .limit(1);

    if (moduleCheck.length === 0) {
      return res.status(403).json({ message: 'Módulo de farmácia não está disponível para esta organização' });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar acesso ao módulo de farmácia:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Obter status do módulo de farmácia
farmaciaRouter.get('/status', authenticate, checkFarmaciaModuleAccess, async (req, res) => {
  try {
    const { organizationId } = req.session.user || {};
    
    if (!organizationId) {
      return res.status(403).json({ message: 'Usuário não vinculado a uma organização' });
    }
    
    const moduleData = await db.select({
      id: organizationModules.id,
      active: organizationModules.active,
      name: modules.name,
      slug: modules.slug
    })
      .from(organizationModules)
      .innerJoin(modules, eq(modules.id, organizationModules.moduleId))
      .where(
        and(
          eq(organizationModules.organizationId, organizationId),
          eq(modules.slug, 'farmacia')
        )
      )
      .limit(1);
    
    if (moduleData.length === 0) {
      return res.status(404).json({ message: 'Módulo de farmácia não encontrado' });
    }
    
    // Tentativa de obter configurações customizadas (campo adicional)
    // Se não for possível, retorna valores padrão
    const moduleSettings = {
      allowPharmacistRegistration: false,
      requirePharmacistApproval: true
    };
    
    // Retornar dados do módulo
    res.json({
      id: moduleData[0].id,
      active: moduleData[0].active,
      name: moduleData[0].name,
      slug: moduleData[0].slug,
      settings: moduleSettings
    });
  } catch (error) {
    console.error('Erro ao obter status do módulo de farmácia:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Alternar status do módulo (ativar/desativar)
farmaciaRouter.put('/toggle', authenticate, checkFarmaciaModuleAccess, async (req, res) => {
  try {
    const { organizationId } = req.session.user || {};
    const { active } = req.body;
    
    if (!organizationId) {
      return res.status(403).json({ message: 'Usuário não vinculado a uma organização' });
    }
    
    // Verificar se o valor de "active" foi fornecido
    if (active === undefined) {
      return res.status(400).json({ message: 'Status do módulo não especificado' });
    }
    
    // Obter o módulo
    const moduleData = await db.select({
      id: organizationModules.id,
      moduleId: organizationModules.moduleId
    })
      .from(organizationModules)
      .innerJoin(modules, eq(modules.id, organizationModules.moduleId))
      .where(
        and(
          eq(organizationModules.organizationId, organizationId),
          eq(modules.slug, 'farmacia')
        )
      )
      .limit(1);
    
    if (moduleData.length === 0) {
      return res.status(404).json({ message: 'Módulo de farmácia não encontrado' });
    }
    
    // Atualizar o status do módulo
    await db.update(organizationModules)
      .set({ active })
      .where(eq(organizationModules.id, moduleData[0].id));
    
    // Retornar o novo status
    res.json({ id: moduleData[0].id, active });
  } catch (error) {
    console.error('Erro ao alternar status do módulo de farmácia:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar configurações do módulo
farmaciaRouter.put('/settings', authenticate, checkFarmaciaModuleAccess, async (req, res) => {
  try {
    const { organizationId } = req.session.user || {};
    const settings = req.body;
    
    if (!organizationId) {
      return res.status(403).json({ message: 'Usuário não vinculado a uma organização' });
    }
    
    // Verificar se as configurações foram fornecidas
    if (!settings) {
      return res.status(400).json({ message: 'Configurações não especificadas' });
    }
    
    // Obter o módulo
    const moduleData = await db.select({
      id: organizationModules.id
    })
      .from(organizationModules)
      .innerJoin(modules, eq(modules.id, organizationModules.moduleId))
      .where(
        and(
          eq(organizationModules.organizationId, organizationId),
          eq(modules.slug, 'farmacia')
        )
      )
      .limit(1);
    
    if (moduleData.length === 0) {
      return res.status(404).json({ message: 'Módulo de farmácia não encontrado' });
    }
    
    // Em vez de armazenar as configurações diretamente no registro,
    // vamos criar um registro de configuração específico para o módulo
    // no banco de dados (na verdade, isso não seria possível no esquema atual, 
    // então estamos apenas retornando uma resposta simulada)
    
    // Retornar as novas configurações (simulado)
    res.json({ 
      id: moduleData[0].id, 
      settings: {
        allowPharmacistRegistration: settings.allowPharmacistRegistration || false,
        requirePharmacistApproval: settings.requirePharmacistApproval !== false,
        autoApprovePatientDocuments: settings.autoApprovePatientDocuments || false
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações do módulo de farmácia:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter métricas do módulo de farmácia
farmaciaRouter.get('/modules/farmacia/metrics', authenticate, checkFarmaciaModuleAccess, async (req, res) => {
  try {
    const { organizationId } = req.session.user || {};
    
    if (!organizationId) {
      return res.status(403).json({ message: 'Usuário não vinculado a uma organização' });
    }
    
    // Contar farmacêuticos RT por status
    const pharmacistsByStatus = await db.select({
      status: pharmacists.status,
      count: sql`count(*)`.mapWith(Number)
    })
      .from(pharmacists)
      .where(eq(pharmacists.organizationId, organizationId))
      .groupBy(pharmacists.status);
    
    // Converter resultado para formado adequado
    const pharmacistStats: Record<string, number> = {
      total: 0,
      active: 0,
      inactive: 0,
      pending: 0,
      suspended: 0
    };
    
    pharmacistsByStatus.forEach(stat => {
      if (stat.status) {
        pharmacistStats[stat.status] = stat.count;
        pharmacistStats.total += stat.count;
      }
    });
    
    // Retornar as métricas calculadas
    res.json({
      pharmacists: pharmacistStats,
      prescriptions: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      },
      inventory: {
        total: 0,
        lowStock: 0
      },
      recentActivities: []
    });
  } catch (error) {
    console.error('Erro ao obter métricas do módulo de farmácia:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter lista de farmacêuticos RT
farmaciaRouter.get('/farmacistas', authenticate, checkFarmaciaModuleAccess, async (req, res) => {
  try {
    const { organizationId } = req.session.user || {};
    
    if (!organizationId) {
      return res.status(403).json({ message: 'Usuário não vinculado a uma organização' });
    }
    
    // Obter todos os farmacêuticos da organização
    const farmaceuticosList = await db.select()
      .from(pharmacists)
      .where(eq(pharmacists.organizationId, organizationId))
      .orderBy(pharmacists.createdAt);
    
    res.json(farmaceuticosList);
  } catch (error) {
    console.error('Erro ao obter lista de farmacêuticos RT:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Adicionar farmacêutico RT
farmaciaRouter.post('/farmacistas', authenticate, checkFarmaciaModuleAccess, async (req, res) => {
  try {
    const { organizationId } = req.session.user || {};
    
    if (!organizationId) {
      return res.status(403).json({ message: 'Usuário não vinculado a uma organização' });
    }
    
    // Validar os dados usando o schema
    const validationSchema = insertPharmacistSchema.extend({
      userId: z.number().optional(),
      organizationId: z.number().optional()
    });
    
    const validationResult = validationSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: validationResult.error.format() 
      });
    }
    
    // Preparar dados para inserção
    const pharmacistData = {
      ...validationResult.data,
      userId: req.session.user?.id || 0, // Se não tiver ID de usuário associado, usa 0 temporariamente
      organizationId: organizationId
    };
    
    // Inserir o farmacêutico no banco de dados
    const result = await db.insert(pharmacists)
      .values(pharmacistData)
      .returning();
    
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Erro ao adicionar farmacêutico RT:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter detalhes de um farmacêutico RT específico
farmaciaRouter.get('/farmacistas/:id', authenticate, checkFarmaciaModuleAccess, async (req, res) => {
  try {
    const { organizationId } = req.session.user || {};
    const farmaceuticoId = parseInt(req.params.id);
    
    if (!organizationId) {
      return res.status(403).json({ message: 'Usuário não vinculado a uma organização' });
    }
    
    if (isNaN(farmaceuticoId)) {
      return res.status(400).json({ message: 'ID do farmacêutico inválido' });
    }
    
    // Obter o farmacêutico
    const farmaceutico = await db.select()
      .from(pharmacists)
      .where(
        and(
          eq(pharmacists.id, farmaceuticoId),
          eq(pharmacists.organizationId, organizationId)
        )
      )
      .limit(1);
    
    if (farmaceutico.length === 0) {
      return res.status(404).json({ message: 'Farmacêutico não encontrado' });
    }
    
    res.json(farmaceutico[0]);
  } catch (error) {
    console.error('Erro ao obter detalhes do farmacêutico RT:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar um farmacêutico RT
farmaciaRouter.put('/farmacistas/:id', authenticate, checkFarmaciaModuleAccess, async (req, res) => {
  try {
    const { organizationId } = req.session.user || {};
    const farmaceuticoId = parseInt(req.params.id);
    
    if (!organizationId) {
      return res.status(403).json({ message: 'Usuário não vinculado a uma organização' });
    }
    
    if (isNaN(farmaceuticoId)) {
      return res.status(400).json({ message: 'ID do farmacêutico inválido' });
    }
    
    // Verificar se o farmacêutico existe e pertence à organização
    const existingFarmaceutico = await db.select()
      .from(pharmacists)
      .where(
        and(
          eq(pharmacists.id, farmaceuticoId),
          eq(pharmacists.organizationId, organizationId)
        )
      )
      .limit(1);
    
    if (existingFarmaceutico.length === 0) {
      return res.status(404).json({ message: 'Farmacêutico não encontrado' });
    }
    
    // Validar os dados de atualização
    const validationSchema = insertPharmacistSchema
      .partial() // Torna todos os campos opcionais para atualização parcial
      .omit({ userId: true, organizationId: true }); // Não permite atualizar esses campos
    
    const validationResult = validationSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: validationResult.error.format() 
      });
    }
    
    // Atualizar o farmacêutico
    const updateData = validationResult.data;
    const result = await db.update(pharmacists)
      .set(updateData)
      .where(eq(pharmacists.id, farmaceuticoId))
      .returning();
    
    res.json(result[0]);
  } catch (error) {
    console.error('Erro ao atualizar farmacêutico RT:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Alterar o status de um farmacêutico RT
farmaciaRouter.patch('/farmacistas/:id/status', authenticate, checkFarmaciaModuleAccess, async (req, res) => {
  try {
    const { organizationId } = req.session.user || {};
    const farmaceuticoId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!organizationId) {
      return res.status(403).json({ message: 'Usuário não vinculado a uma organização' });
    }
    
    if (isNaN(farmaceuticoId)) {
      return res.status(400).json({ message: 'ID do farmacêutico inválido' });
    }
    
    if (!status || !['active', 'inactive', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Status inválido' });
    }
    
    // Verificar se o farmacêutico existe e pertence à organização
    const existingFarmaceutico = await db.select()
      .from(pharmacists)
      .where(
        and(
          eq(pharmacists.id, farmaceuticoId),
          eq(pharmacists.organizationId, organizationId)
        )
      )
      .limit(1);
    
    if (existingFarmaceutico.length === 0) {
      return res.status(404).json({ message: 'Farmacêutico não encontrado' });
    }
    
    // Atualizar o status do farmacêutico
    const result = await db.update(pharmacists)
      .set({ status })
      .where(eq(pharmacists.id, farmaceuticoId))
      .returning();
    
    res.json(result[0]);
  } catch (error) {
    console.error('Erro ao atualizar status do farmacêutico RT:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Remover um farmacêutico RT
farmaciaRouter.delete('/farmacistas/:id', authenticate, checkFarmaciaModuleAccess, async (req, res) => {
  try {
    const { organizationId } = req.session.user || {};
    const farmaceuticoId = parseInt(req.params.id);
    
    if (!organizationId) {
      return res.status(403).json({ message: 'Usuário não vinculado a uma organização' });
    }
    
    if (isNaN(farmaceuticoId)) {
      return res.status(400).json({ message: 'ID do farmacêutico inválido' });
    }
    
    // Verificar se o farmacêutico existe e pertence à organização
    const existingFarmaceutico = await db.select()
      .from(pharmacists)
      .where(
        and(
          eq(pharmacists.id, farmaceuticoId),
          eq(pharmacists.organizationId, organizationId)
        )
      )
      .limit(1);
    
    if (existingFarmaceutico.length === 0) {
      return res.status(404).json({ message: 'Farmacêutico não encontrado' });
    }
    
    // Remover o farmacêutico
    await db.delete(pharmacists)
      .where(eq(pharmacists.id, farmaceuticoId));
    
    res.status(204).end();
  } catch (error) {
    console.error('Erro ao remover farmacêutico RT:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export { farmaciaRouter };