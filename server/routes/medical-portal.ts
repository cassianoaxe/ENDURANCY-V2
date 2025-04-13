import express, { Request, Response } from 'express';
import { db } from '../db';
import { 
  modules, 
  organizationModules,
  organizations,
  moduleTypeEnum
} from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { authenticate } from '../routes';

const router = express.Router();

// Middleware para verificar se o usuário pertence à organização
const isOrgMember = async (req: Request, res: Response, next: express.NextFunction) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: 'Não autenticado' });
  }

  const userId = req.session.user.id;
  const userOrgId = req.session.user.organizationId;

  if (!userOrgId) {
    return res.status(403).json({ message: 'Usuário não pertence a nenhuma organização' });
  }

  // Se o usuário for admin ou org_admin, permitir acesso
  if (req.session.user.role === 'admin' || req.session.user.role === 'org_admin') {
    return next();
  }

  return res.status(403).json({ message: 'Permissão negada' });
};

/**
 * Retorna o status do módulo para a organização do usuário
 */
router.get('/api/organization/modules/medical-portal/status', authenticate, async (req: Request, res: Response) => {
  try {
    const organizationId = req.session?.user?.organizationId;

    if (!organizationId) {
      return res.status(403).json({ message: 'Usuário não pertence a nenhuma organização' });
    }

    // Buscar ID do módulo médico (usando 'saude' que é o type de módulo médico)
    const medicalModule = await db.select()
      .from(modules)
      .where(sql`${modules.type} = 'saude'`)
      .limit(1);

    if (medicalModule.length === 0) {
      return res.status(404).json({ message: 'Módulo médico não encontrado' });
    }

    const moduleId = medicalModule[0].id;

    // Buscar status do módulo para a organização
    const moduleStatus = await db.select()
      .from(organizationModules)
      .where(
        and(
          eq(organizationModules.organizationId, organizationId),
          eq(organizationModules.moduleId, moduleId)
        )
      )
      .limit(1);

    // Se não existir, retornar status padrão
    if (moduleStatus.length === 0) {
      return res.json({
        id: 0,
        active: false,
        // Adicionando objeto de configurações padrão
        moduleSettings: {
          allowPatientRegistration: false,
          allowDoctorRegistration: false,
          requirePharmacistApproval: true,
          autoApproveVerifiedDoctors: false
        }
      });
    }

    // Retornar informações do módulo
    return res.json({
      id: moduleStatus[0].id,
      active: moduleStatus[0].active,
      // Adicionando objeto de configurações
      moduleSettings: {
        allowPatientRegistration: false,
        allowDoctorRegistration: false,
        requirePharmacistApproval: true,
        autoApproveVerifiedDoctors: false
      }
    });
  } catch (error) {
    console.error('Erro ao buscar status do módulo médico:', error);
    res.status(500).json({ message: 'Erro ao buscar status do módulo médico' });
  }
});

/**
 * Atualiza as configurações do módulo médico
 */
router.put('/api/organization/modules/medical-portal/settings', authenticate, isOrgMember, async (req: Request, res: Response) => {
  try {
    const organizationId = req.session?.user?.organizationId;
    const settings = req.body;

    // Validar configurações
    if (!settings) {
      return res.status(400).json({ message: 'Configurações inválidas' });
    }

    // Buscar ID do módulo médico (usando 'saude' que é o type de módulo médico)
    const medicalModule = await db.select()
      .from(modules)
      .where(sql`${modules.type} = 'saude'`)
      .limit(1);

    if (medicalModule.length === 0) {
      return res.status(404).json({ message: 'Módulo médico não encontrado' });
    }

    const moduleId = medicalModule[0].id;

    // Verificar se o módulo já está ativado para a organização
    const existingModule = await db.select()
      .from(organizationModules)
      .where(
        and(
          eq(organizationModules.organizationId, organizationId!),
          eq(organizationModules.moduleId, moduleId)
        )
      )
      .limit(1);

    // Se não existir, criar um novo registro
    if (existingModule.length === 0) {
      const newModule = await db.insert(organizationModules)
        .values({
          organizationId: organizationId!,
          moduleId: moduleId,
          active: false,
          name: "Portal Médico",
          price: "299.90",
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      // Retornar o novo módulo com as configurações padrão
      return res.json({
        id: newModule[0].id,
        active: newModule[0].active,
        moduleSettings: {
          allowPatientRegistration: false,
          allowDoctorRegistration: false,
          requirePharmacistApproval: true,
          autoApproveVerifiedDoctors: false
        }
      });
    }

    // Atualizar o registro sem modificar settings que não existe na tabela
    const updatedModule = await db.update(organizationModules)
      .set({
        updatedAt: new Date()
      })
      .where(eq(organizationModules.id, existingModule[0].id))
      .returning();

    // Retornar o módulo atualizado com as configurações
    return res.json({
      id: updatedModule[0].id,
      active: updatedModule[0].active,
      moduleSettings: {
        allowPatientRegistration: settings.allowPatientRegistration || false,
        allowDoctorRegistration: settings.allowDoctorRegistration || false,
        requirePharmacistApproval: settings.requirePharmacistApproval || true,
        autoApproveVerifiedDoctors: settings.autoApproveVerifiedDoctors || false
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações do módulo médico:', error);
    res.status(500).json({ message: 'Erro ao atualizar configurações do módulo médico' });
  }
});

/**
 * Ativa ou desativa o módulo médico
 */
router.put('/api/organization/modules/medical-portal/toggle', authenticate, isOrgMember, async (req: Request, res: Response) => {
  try {
    const organizationId = req.session?.user?.organizationId;
    const { active } = req.body;

    if (typeof active !== 'boolean') {
      return res.status(400).json({ message: 'O status deve ser um booleano' });
    }

    // Buscar ID do módulo médico (usando 'saude' que é o type de módulo médico)
    const medicalModule = await db.select()
      .from(modules)
      .where(sql`${modules.type} = 'saude'`)
      .limit(1);

    if (medicalModule.length === 0) {
      return res.status(404).json({ message: 'Módulo médico não encontrado' });
    }

    const moduleId = medicalModule[0].id;

    // Verificar se o módulo já está ativado para a organização
    const existingModule = await db.select()
      .from(organizationModules)
      .where(
        and(
          eq(organizationModules.organizationId, organizationId!),
          eq(organizationModules.moduleId, moduleId)
        )
      )
      .limit(1);

    // Se não existir, criar um novo registro
    if (existingModule.length === 0) {
      const newModule = await db.insert(organizationModules)
        .values({
          organizationId: organizationId!,
          moduleId: moduleId,
          active,
          name: "Portal Médico",
          price: "299.90",
          status: active ? "active" : "pending",
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      // Retornar o novo módulo com as configurações padrão
      return res.json({
        id: newModule[0].id,
        active: newModule[0].active,
        moduleSettings: {
          allowPatientRegistration: false,
          allowDoctorRegistration: false,
          requirePharmacistApproval: true,
          autoApproveVerifiedDoctors: false
        }
      });
    }

    // Atualizar o status
    const updatedModule = await db.update(organizationModules)
      .set({
        active,
        status: active ? "active" : "pending",
        updatedAt: new Date()
      })
      .where(eq(organizationModules.id, existingModule[0].id))
      .returning();

    // Retornar o módulo atualizado com as configurações
    return res.json({
      id: updatedModule[0].id,
      active: updatedModule[0].active,
      moduleSettings: {
        allowPatientRegistration: false,
        allowDoctorRegistration: false,
        requirePharmacistApproval: true,
        autoApproveVerifiedDoctors: false
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar status do módulo médico:', error);
    res.status(500).json({ message: 'Erro ao atualizar status do módulo médico' });
  }
});

/**
 * Retorna métricas do portal médico
 */
router.get('/api/organization/modules/medical-portal/metrics', authenticate, isOrgMember, async (req: Request, res: Response) => {
  try {
    // Dados mockados para métricas
    return res.json({
      patients: {
        total: 45,
        active: 38,
        new: 12
      },
      doctors: {
        total: 8,
        active: 7,
        pending: 1
      },
      prescriptions: {
        total: 156,
        monthly: 34,
        weekly: 8
      },
      consultations: {
        total: 203,
        monthly: 42,
        weekly: 9
      }
    });
  } catch (error) {
    console.error('Erro ao buscar métricas do módulo médico:', error);
    res.status(500).json({ message: 'Erro ao buscar métricas do módulo médico' });
  }
});

/**
 * Retorna planos de assinatura do portal médico
 */
router.get('/api/organization/modules/medical-portal/plans', authenticate, isOrgMember, async (req: Request, res: Response) => {
  try {
    // Dados mockados para planos
    return res.json([
      {
        id: 1,
        name: "Plano Básico",
        price: 299.90,
        interval: "monthly",
        features: [
          "Acesso ao portal médico",
          "Até 5 médicos",
          "Até 100 pacientes",
          "Prescrições ilimitadas",
          "Suporte por email"
        ],
        maxDoctors: 5,
        maxPatients: 100,
        popular: false
      },
      {
        id: 2,
        name: "Plano Profissional",
        price: 499.90,
        interval: "monthly",
        features: [
          "Acesso ao portal médico",
          "Até 15 médicos",
          "Até 500 pacientes",
          "Prescrições ilimitadas",
          "Agendamento de consultas",
          "Suporte prioritário",
          "Relatórios avançados"
        ],
        maxDoctors: 15,
        maxPatients: 500,
        popular: true
      },
      {
        id: 3,
        name: "Plano Enterprise",
        price: 999.90,
        interval: "monthly",
        features: [
          "Acesso ao portal médico",
          "Médicos ilimitados",
          "Pacientes ilimitados",
          "Prescrições ilimitadas",
          "Agendamento de consultas",
          "Suporte VIP",
          "Relatórios avançados",
          "Integrações personalizadas",
          "Treinamento exclusivo"
        ],
        maxDoctors: null,
        maxPatients: null,
        popular: false
      }
    ]);
  } catch (error) {
    console.error('Erro ao buscar planos do módulo médico:', error);
    res.status(500).json({ message: 'Erro ao buscar planos do módulo médico' });
  }
});

/**
 * Retorna assinaturas ativas do portal médico
 */
router.get('/api/organization/modules/medical-portal/subscriptions', authenticate, isOrgMember, async (req: Request, res: Response) => {
  try {
    // Dados mockados para assinaturas
    return res.json([
      {
        id: 1,
        planName: "Plano Profissional",
        planTier: "pro",
        startDate: "2025-03-15",
        endDate: "2025-04-15",
        status: "active",
        autoRenew: true,
        paymentMethod: "credit_card",
        lastPayment: {
          amount: 499.90,
          date: "2025-03-15",
          status: "paid"
        }
      }
    ]);
  } catch (error) {
    console.error('Erro ao buscar assinaturas do módulo médico:', error);
    res.status(500).json({ message: 'Erro ao buscar assinaturas do módulo médico' });
  }
});

export default router;