import { Request, Response } from 'express';
import { Express } from 'express';
import { db } from '../db';
import { eq, and, sql } from 'drizzle-orm';
import { plans, planModules, modules } from '@shared/schema';
import { authenticate } from '../routes';

export function registerPlanRoutes(app: Express) {
  // Obter todos os planos com seus módulos associados
  app.get('/api/plans', authenticate, async (req, res) => {
    try {
      const allPlans = await db.query.plans.findMany({
        with: {
          modules: {
            with: {
              module: true,
            }
          }
        }
      });

      // Reformatar os dados para o formato esperado pelo frontend
      const formattedPlans = allPlans.map(plan => ({
        ...plan,
        modules: plan.modules.map(pm => pm.module)
      }));

      res.json(formattedPlans);
    } catch (error: any) {
      console.error('Erro ao buscar planos:', error);
      res.status(500).json({ message: 'Erro ao buscar planos', error: error.message });
    }
  });

  // Obter estatísticas de planos
  app.get('/api/plans/stats', authenticate, async (req, res) => {
    try {
      const totalPlans = await db.select({ count: sql<number>`count(*)` })
        .from(plans)
        .then(result => result[0].count);

      // Estatísticas fictícias para demonstração
      res.json({
        totalPlans,
        activeSubscribers: "10", // Organizações com assinaturas ativas
        conversionRate: 75, // % de conversão de trial para assinante
        revenueMonthly: 14997, // Receita mensal recorrente
      });
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas de planos:', error);
      res.status(500).json({ message: 'Erro ao buscar estatísticas', error: error.message });
    }
  });

  // Obter detalhes de um plano específico
  app.get('/api/plans/:id', authenticate, async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const plan = await db.query.plans.findFirst({
        where: eq(plans.id, planId),
        with: {
          modules: {
            with: {
              module: true,
            }
          }
        }
      });

      if (!plan) {
        return res.status(404).json({ message: 'Plano não encontrado' });
      }

      // Reformatar os dados para o formato esperado pelo frontend
      const formattedPlan = {
        ...plan,
        modules: plan.modules.map(pm => pm.module)
      };

      res.json(formattedPlan);
    } catch (error: any) {
      console.error(`Erro ao buscar plano ${req.params.id}:`, error);
      res.status(500).json({ message: 'Erro ao buscar plano', error: error.message });
    }
  });

  // Obter módulos associados a um plano
  app.get('/api/plans/:id/modules', authenticate, async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const planModulesData = await db.query.planModules.findMany({
        where: eq(planModules.plan_id, planId),
        with: {
          module: true,
        }
      });

      if (!planModulesData) {
        return res.status(404).json({ message: 'Módulos do plano não encontrados' });
      }

      const modulesList = planModulesData.map(pm => pm.module);
      res.json(modulesList);
    } catch (error: any) {
      console.error(`Erro ao buscar módulos do plano ${req.params.id}:`, error);
      res.status(500).json({ message: 'Erro ao buscar módulos do plano', error: error.message });
    }
  });

  // Atualizar módulos de um plano
  app.post('/api/plans/:id/modules', authenticate, async (req, res) => {
    const transaction = async () => {
      try {
        const planId = parseInt(req.params.id);
        const { moduleIds } = req.body;

        if (!Array.isArray(moduleIds)) {
          return res.status(400).json({ message: 'moduleIds deve ser um array de IDs de módulos' });
        }

        // Verificar se o plano existe
        const planExists = await db.query.plans.findFirst({
          where: eq(plans.id, planId),
        });

        if (!planExists) {
          return res.status(404).json({ message: 'Plano não encontrado' });
        }

        // Remover todos os módulos atuais do plano
        await db.delete(planModules)
          .where(eq(planModules.plan_id, planId));

        // Adicionar os novos módulos ao plano
        const newModuleRelations = moduleIds.map(moduleId => ({
          plan_id: planId,
          module_id: moduleId,
        }));

        if (newModuleRelations.length > 0) {
          await db.insert(planModules)
            .values(newModuleRelations);
        }

        // Buscar o plano atualizado com seus módulos
        const updatedPlan = await db.query.plans.findFirst({
          where: eq(plans.id, planId),
          with: {
            modules: {
              with: {
                module: true,
              }
            }
          }
        });

        if (!updatedPlan) {
          return res.status(404).json({ message: 'Erro ao atualizar plano' });
        }

        // Reformatar os dados para o formato esperado pelo frontend
        const formattedPlan = {
          ...updatedPlan,
          modules: updatedPlan.modules.map(pm => pm.module)
        };

        res.json(formattedPlan);
      } catch (error: any) {
        console.error(`Erro ao atualizar módulos do plano ${req.params.id}:`, error);
        res.status(500).json({ message: 'Erro ao atualizar módulos do plano', error: error.message });
      }
    };

    await transaction();
  });

  // Obter todos os módulos disponíveis
  app.get('/api/modules', authenticate, async (req, res) => {
    try {
      const allModules = await db.select().from(modules);
      res.json(allModules);
    } catch (error: any) {
      console.error('Erro ao buscar módulos:', error);
      res.status(500).json({ message: 'Erro ao buscar módulos', error: error.message });
    }
  });
}