import { Router, Request, Response } from 'express';
import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import { organizations, organizationModules, users } from '@shared/schema';
import { authenticate } from '../routes';

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
      .where(
        and(
          eq(organizationModules.organizationId, organizationId),
          eq(organizationModules.moduleType, 'farmacia')
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
farmaciaRouter.get('/modules/farmacia/status', authenticate, checkFarmaciaModuleAccess, async (req, res) => {
  try {
    const { organizationId } = req.session.user;
    
    const moduleData = await db.select()
      .from(organizationModules)
      .where(
        and(
          eq(organizationModules.organizationId, organizationId),
          eq(organizationModules.moduleType, 'farmacia')
        )
      )
      .limit(1);
    
    if (moduleData.length === 0) {
      return res.status(404).json({ message: 'Módulo de farmácia não encontrado' });
    }
    
    // Retornar dados do módulo
    res.json({
      id: moduleData[0].id,
      active: moduleData[0].active,
      settings: moduleData[0].settings || {
        allowPharmacistRegistration: false,
        requirePharmacistApproval: true
      }
    });
  } catch (error) {
    console.error('Erro ao obter status do módulo de farmácia:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Alternar status do módulo (ativar/desativar)
farmaciaRouter.put('/modules/farmacia/toggle', authenticate, checkFarmaciaModuleAccess, async (req, res) => {
  try {
    const { organizationId } = req.session.user;
    const { active } = req.body;
    
    // Verificar se o valor de "active" foi fornecido
    if (active === undefined) {
      return res.status(400).json({ message: 'Status do módulo não especificado' });
    }
    
    // Obter o módulo
    const moduleData = await db.select()
      .from(organizationModules)
      .where(
        and(
          eq(organizationModules.organizationId, organizationId),
          eq(organizationModules.moduleType, 'farmacia')
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
farmaciaRouter.put('/modules/farmacia/settings', authenticate, checkFarmaciaModuleAccess, async (req, res) => {
  try {
    const { organizationId } = req.session.user;
    const settings = req.body;
    
    // Verificar se as configurações foram fornecidas
    if (!settings) {
      return res.status(400).json({ message: 'Configurações não especificadas' });
    }
    
    // Obter o módulo
    const moduleData = await db.select()
      .from(organizationModules)
      .where(
        and(
          eq(organizationModules.organizationId, organizationId),
          eq(organizationModules.moduleType, 'farmacia')
        )
      )
      .limit(1);
    
    if (moduleData.length === 0) {
      return res.status(404).json({ message: 'Módulo de farmácia não encontrado' });
    }
    
    // Atualizar as configurações do módulo
    await db.update(organizationModules)
      .set({ settings })
      .where(eq(organizationModules.id, moduleData[0].id));
    
    // Retornar as novas configurações
    res.json({ id: moduleData[0].id, settings });
  } catch (error) {
    console.error('Erro ao atualizar configurações do módulo de farmácia:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter métricas do módulo de farmácia (mock para testes)
farmaciaRouter.get('/modules/farmacia/metrics', authenticate, checkFarmaciaModuleAccess, async (req, res) => {
  try {
    // Retornar dados mock para teste da interface
    res.json({
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

// Obter lista de farmacêuticos RT (mock para testes)
farmaciaRouter.get('/farmacistas', authenticate, checkFarmaciaModuleAccess, async (req, res) => {
  try {
    // Retornar dados mock para teste da interface
    res.json([]);
  } catch (error) {
    console.error('Erro ao obter lista de farmacêuticos RT:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Adicionar farmacêutico RT
farmaciaRouter.post('/farmacistas', authenticate, checkFarmaciaModuleAccess, async (req, res) => {
  try {
    // Implementar adição de farmacêutico RT
    const { name, email, license } = req.body;
    
    if (!name || !email || !license) {
      return res.status(400).json({ message: 'Dados incompletos. Nome, email e CRF são obrigatórios' });
    }
    
    // Mock de resposta para testes
    res.status(201).json({
      id: 1,
      name,
      email,
      license,
      isActive: true
    });
  } catch (error) {
    console.error('Erro ao adicionar farmacêutico RT:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export { farmaciaRouter };