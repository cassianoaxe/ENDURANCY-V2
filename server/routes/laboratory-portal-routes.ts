import type { Express, Request, Response } from "express";
import { db } from "../db";
import { eq, and, desc, sql } from "drizzle-orm";
import { 
  laboratories, 
  labEquipments, 
  samples, 
  tests, 
  laboratoryClients 
} from "@shared/schema-laboratory";

// Middleware para garantir autenticação para o portal de laboratório
function authenticate(req: Request, res: Response, next: Function) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  // Permitir acesso para administradores e usuários do tipo laboratório
  if (req.session.user.role !== 'laboratory' && req.session.user.role !== 'admin') {
    return res.status(403).json({ error: "Acesso não autorizado para o portal de laboratório" });
  }

  next();
}

// Função para registrar as rotas do portal de laboratório
export function registerLaboratoryPortalRoutes(app: Express) {
  // Rota para obter dados gerais do dashboard do laboratório
  app.get('/api/laboratory-portal/dashboard', authenticate, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user!.id;
      
      // Obter informações do laboratório associado ao usuário
      const [laboratoryInfo] = await db
        .select()
        .from(laboratories)
        .where(eq(laboratories.userId, userId))
        .limit(1);
      
      if (!laboratoryInfo) {
        return res.status(404).json({ error: "Laboratório não encontrado para este usuário" });
      }
      
      const laboratoryId = laboratoryInfo.id;
      
      // Estatísticas de amostras por status
      const sampleStats = await db
        .select({
          status: samples.status,
          count: sql`COUNT(*)`.as('count')
        })
        .from(samples)
        .where(eq(samples.laboratoryId, laboratoryId))
        .groupBy(samples.status);
      
      // Estatísticas de testes por tipo
      const testStats = await db
        .select({
          type: tests.testType,
          count: sql`COUNT(*)`.as('count')
        })
        .from(tests)
        .where(eq(tests.laboratoryId, laboratoryId))
        .groupBy(tests.testType);
      
      // Amostras recentes
      const recentSamples = await db
        .select()
        .from(samples)
        .where(eq(samples.laboratoryId, laboratoryId))
        .orderBy(desc(samples.createdAt))
        .limit(5);
      
      // Total de equipamentos
      const [equipmentCount] = await db
        .select({
          count: sql`COUNT(*)`.as('count')
        })
        .from(labEquipments)
        .where(eq(labEquipments.laboratoryId, laboratoryId));
      
      // Equipamentos que precisam de manutenção
      const currentDate = new Date();
      const [maintenanceNeededCount] = await db
        .select({
          count: sql`COUNT(*)`.as('count')
        })
        .from(labEquipments)
        .where(
          and(
            eq(labEquipments.laboratoryId, laboratoryId),
            sql`${labEquipments.nextMaintenanceDate} <= ${currentDate}`
          )
        );
      
      // Total de clientes
      const [clientCount] = await db
        .select({
          count: sql`COUNT(*)`.as('count')
        })
        .from(laboratoryClients)
        .where(eq(laboratoryClients.laboratoryId, laboratoryId));
      
      return res.json({
        laboratory: laboratoryInfo,
        sampleStats,
        testStats,
        recentSamples,
        equipmentCount: equipmentCount?.count || 0,
        maintenanceNeededCount: maintenanceNeededCount?.count || 0,
        clientCount: clientCount?.count || 0
      });
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard do laboratório:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota para listar todas as amostras do laboratório
  app.get('/api/laboratory-portal/samples', authenticate, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user!.id;
      
      // Obter laboratório associado ao usuário
      const [laboratoryInfo] = await db
        .select()
        .from(laboratories)
        .where(eq(laboratories.userId, userId))
        .limit(1);
      
      if (!laboratoryInfo) {
        return res.status(404).json({ error: "Laboratório não encontrado para este usuário" });
      }
      
      const laboratoryId = laboratoryInfo.id;
      
      // Buscar amostras com paginação
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      
      const allSamples = await db
        .select({
          id: samples.id,
          code: samples.code,
          sampleType: samples.sampleType,
          status: samples.status,
          receivedDate: samples.receivedDate,
          completedDate: samples.completedDate,
          organizationId: samples.organizationId,
          batchNumber: samples.batchNumber
        })
        .from(samples)
        .where(eq(samples.laboratoryId, laboratoryId))
        .orderBy(desc(samples.createdAt))
        .limit(limit)
        .offset(offset);
      
      // Contar total de amostras para paginação
      const [countResult] = await db
        .select({ count: sql`COUNT(*)`.as('count') })
        .from(samples)
        .where(eq(samples.laboratoryId, laboratoryId));
      
      return res.json({
        samples: allSamples,
        pagination: {
          total: countResult?.count || 0,
          page,
          limit,
          totalPages: Math.ceil((countResult?.count || 0) / limit)
        }
      });
    } catch (error) {
      console.error("Erro ao buscar amostras do laboratório:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota para obter detalhes de uma amostra específica
  app.get('/api/laboratory-portal/samples/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user!.id;
      const sampleId = parseInt(req.params.id);
      
      if (isNaN(sampleId)) {
        return res.status(400).json({ error: "ID de amostra inválido" });
      }
      
      // Verificar laboratório do usuário
      const [laboratoryInfo] = await db
        .select()
        .from(laboratories)
        .where(eq(laboratories.userId, userId))
        .limit(1);
      
      if (!laboratoryInfo) {
        return res.status(404).json({ error: "Laboratório não encontrado para este usuário" });
      }
      
      // Buscar detalhes da amostra
      const [sampleDetails] = await db
        .select()
        .from(samples)
        .where(
          and(
            eq(samples.id, sampleId),
            eq(samples.laboratoryId, laboratoryInfo.id)
          )
        );
      
      if (!sampleDetails) {
        return res.status(404).json({ error: "Amostra não encontrada" });
      }
      
      // Buscar testes associados à amostra
      const sampleTests = await db
        .select()
        .from(tests)
        .where(eq(tests.sampleId, sampleId));
      
      return res.json({
        sample: sampleDetails,
        tests: sampleTests
      });
    } catch (error) {
      console.error("Erro ao buscar detalhes da amostra:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota para listar equipamentos do laboratório
  app.get('/api/laboratory-portal/equipments', authenticate, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user!.id;
      
      // Obter laboratório associado ao usuário
      const [laboratoryInfo] = await db
        .select()
        .from(laboratories)
        .where(eq(laboratories.userId, userId))
        .limit(1);
      
      if (!laboratoryInfo) {
        return res.status(404).json({ error: "Laboratório não encontrado para este usuário" });
      }
      
      const laboratoryId = laboratoryInfo.id;
      
      // Buscar equipamentos do laboratório
      const equipments = await db
        .select()
        .from(labEquipments)
        .where(eq(labEquipments.laboratoryId, laboratoryId))
        .orderBy(desc(labEquipments.createdAt));
      
      return res.json({ equipments });
    } catch (error) {
      console.error("Erro ao buscar equipamentos do laboratório:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rota para listar clientes do laboratório
  app.get('/api/laboratory-portal/clients', authenticate, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user!.id;
      
      // Obter laboratório associado ao usuário
      const [laboratoryInfo] = await db
        .select()
        .from(laboratories)
        .where(eq(laboratories.userId, userId))
        .limit(1);
      
      if (!laboratoryInfo) {
        return res.status(404).json({ error: "Laboratório não encontrado para este usuário" });
      }
      
      const laboratoryId = laboratoryInfo.id;
      
      // Buscar clientes do laboratório
      const clients = await db
        .select()
        .from(laboratoryClients)
        .where(eq(laboratoryClients.laboratoryId, laboratoryId))
        .orderBy(laboratoryClients.name);
      
      return res.json({ clients });
    } catch (error) {
      console.error("Erro ao buscar clientes do laboratório:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  
  // Rota para obter informações de perfil do laboratório
  app.get('/api/laboratory-portal/profile', authenticate, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user!.id;
      
      // Obter informações do laboratório
      const [laboratory] = await db
        .select()
        .from(laboratories)
        .where(eq(laboratories.userId, userId));
      
      if (!laboratory) {
        return res.status(404).json({ error: "Perfil de laboratório não encontrado" });
      }
      
      return res.json({ laboratory });
    } catch (error) {
      console.error("Erro ao buscar perfil do laboratório:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  console.log("Rotas do Portal de Laboratório registradas com sucesso");
  return app;
}