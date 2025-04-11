import { Express, Request as ExpressRequest, Response, Router } from 'express';
import { db } from '../db';
import { eq, and, desc, sql } from 'drizzle-orm';
import { authenticate } from '../routes';
import { organizationModules } from '../../shared/schema';
import { 
  cultivationBatchesTable, 
  extractionProcessesTable,
  qualityTestsTable,
  rawMaterialBatchesTable,
  batchTraceabilityTable,
  productionOrdersTable,
  finishedProductBatchesTable,
  CultivationBatch,
  InsertCultivationBatch
} from '../../shared/schema-production';

// Extend Express Request to include authenticated user
interface Request extends ExpressRequest {
  user?: {
    id: number;
    username: string;
    organizationId: number | null;
    role: string;
  };
}

// Function to verify if organization has the production module active
async function verifyProductionModuleAccess(organizationId: number) {
  const hasModule = await db.query.organizationModules.findFirst({
    where: and(
      eq(organizationModules.organizationId, organizationId),
      eq(organizationModules.moduleId, 6), // ID do módulo de produção
      eq(organizationModules.status, 'active')
    )
  });
  return !!hasModule;
}

export async function registerProductionRoutes(app: Express) {
  const productionRouter = Router();
  
  // Endpoint de teste para verificar a disponibilidade das tabelas do módulo de produção
  productionRouter.get('/status', async (_req: Request, res: Response) => {
    try {
      // Verificar se as tabelas do módulo de produção estão acessíveis
      const tables = [
        'cultivationBatchesTable', 
        'extractionProcessesTable',
        'qualityTestsTable',
        'rawMaterialBatchesTable',
        'batchTraceabilityTable',
        'finishedProductBatchesTable'
      ];
      
      const tablesStatus = {};
      
      for (const tableName of tables) {
        try {
          // Verificar se a tabela está definida no schema combinado
          const tableExists = db.query[tableName] !== undefined;
          tablesStatus[tableName] = {
            exists: tableExists,
            status: tableExists ? 'disponível' : 'não disponível'
          };
        } catch (tableError) {
          tablesStatus[tableName] = {
            exists: false,
            status: 'erro ao verificar',
            error: tableError.message
          };
        }
      }
      
      return res.status(200).json({
        status: 'Verificação de módulo de produção concluída',
        tablesStatus,
        combinedSchemaStatus: 'ativo'
      });
    } catch (error) {
      console.error('Erro ao verificar status do módulo de produção:', error);
      return res.status(500).json({ 
        message: 'Erro ao verificar status do módulo de produção',
        error: error.message
      });
    }
  });
  
  // Endpoint para listar lotes de cultivo
  productionRouter.get('/cultivation-batches', authenticate, async (req: Request, res: Response) => {
    try {
      const organizationId = req.user?.organizationId;

      if (!organizationId) {
        return res.status(403).json({ message: 'Acesso não autorizado' });
      }

      // Verificar se a organização tem acesso ao módulo de produção
      const hasAccess = await verifyProductionModuleAccess(organizationId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Módulo de produção não ativo para esta organização' });
      }

      const batches = await db.query.cultivationBatchesTable.findMany({
        where: eq(cultivationBatchesTable.organizationId, organizationId),
        orderBy: [desc(cultivationBatchesTable.createdAt)]
      });

      return res.status(200).json(batches);
    } catch (error) {
      console.error('Erro ao listar lotes de cultivo:', error);
      return res.status(500).json({ message: 'Erro ao listar lotes de cultivo' });
    }
  });

  // Endpoint para buscar um lote de cultivo específico
  productionRouter.get('/cultivation-batches/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const organizationId = req.user?.organizationId;

      if (!organizationId) {
        return res.status(403).json({ message: 'Acesso não autorizado' });
      }

      // Verificar se a organização tem acesso ao módulo de produção
      const hasAccess = await verifyProductionModuleAccess(organizationId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Módulo de produção não ativo para esta organização' });
      }

      const batch = await db.query.cultivationBatchesTable.findFirst({
        where: and(
          eq(cultivationBatchesTable.id, parseInt(id)),
          eq(cultivationBatchesTable.organizationId, organizationId)
        )
      });

      if (!batch) {
        return res.status(404).json({ message: 'Lote de cultivo não encontrado' });
      }

      return res.status(200).json(batch);
    } catch (error) {
      console.error('Erro ao buscar lote de cultivo:', error);
      return res.status(500).json({ message: 'Erro ao buscar lote de cultivo' });
    }
  });

  // Endpoint para criar um novo lote de cultivo
  productionRouter.post('/cultivation-batches', authenticate, async (req: Request, res: Response) => {
    try {
      const organizationId = req.user?.organizationId;

      if (!organizationId) {
        return res.status(403).json({ message: 'Acesso não autorizado' });
      }

      // Verificar se a organização tem acesso ao módulo de produção
      const hasAccess = await verifyProductionModuleAccess(organizationId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Módulo de produção não ativo para esta organização' });
      }

      const batchData: InsertCultivationBatch = {
        ...req.body,
        organizationId,
        responsibleUserId: req.user?.id || 0 // Fallback to 0 if user is somehow undefined
      };

      const newBatch = await db.insert(cultivationBatchesTable).values(batchData).returning();

      return res.status(201).json(newBatch[0]);
    } catch (error) {
      console.error('Erro ao criar lote de cultivo:', error);
      return res.status(500).json({ message: 'Erro ao criar lote de cultivo' });
    }
  });

  // Endpoint para atualizar um lote de cultivo
  productionRouter.put('/cultivation-batches/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const organizationId = req.user?.organizationId;

      if (!organizationId) {
        return res.status(403).json({ message: 'Acesso não autorizado' });
      }

      // Verificar se a organização tem acesso ao módulo de produção
      const hasAccess = await verifyProductionModuleAccess(organizationId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Módulo de produção não ativo para esta organização' });
      }

      // Verificar se o lote existe e pertence à organização
      const existingBatch = await db.query.cultivationBatchesTable.findFirst({
        where: and(
          eq(cultivationBatchesTable.id, parseInt(id)),
          eq(cultivationBatchesTable.organizationId, organizationId)
        )
      });

      if (!existingBatch) {
        return res.status(404).json({ message: 'Lote de cultivo não encontrado' });
      }

      const updatedBatch = await db.update(cultivationBatchesTable)
        .set({
          ...req.body,
          updatedAt: new Date()
        })
        .where(and(
          eq(cultivationBatchesTable.id, parseInt(id)),
          eq(cultivationBatchesTable.organizationId, organizationId)
        ))
        .returning();

      return res.status(200).json(updatedBatch[0]);
    } catch (error) {
      console.error('Erro ao atualizar lote de cultivo:', error);
      return res.status(500).json({ message: 'Erro ao atualizar lote de cultivo' });
    }
  });

  // Endpoint para buscar a rastreabilidade completa (seed to counter)
  productionRouter.get('/traceability/:batchId', authenticate, async (req: Request, res: Response) => {
    try {
      const { batchId } = req.params;
      const organizationId = req.user?.organizationId;

      if (!organizationId) {
        return res.status(403).json({ message: 'Acesso não autorizado' });
      }

      // Verificar se a organização tem acesso ao módulo de produção
      const hasAccess = await verifyProductionModuleAccess(organizationId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Módulo de produção não ativo para esta organização' });
      }

      // Buscar lote de produto acabado
      const finishedBatch = await db.query.finishedProductBatchesTable.findFirst({
        where: and(
          eq(finishedProductBatchesTable.id, parseInt(batchId)),
          eq(finishedProductBatchesTable.organizationId, organizationId)
        )
      });

      if (!finishedBatch) {
        return res.status(404).json({ message: 'Lote de produto acabado não encontrado' });
      }

      // Buscar informações de rastreabilidade
      const traceabilityRecords = await db.query.batchTraceabilityTable.findMany({
        where: eq(batchTraceabilityTable.finishedProductBatchId, parseInt(batchId))
      });

      // Montar estrutura de rastreabilidade completa
      const cultivationBatchIds = traceabilityRecords
        .filter((record: { cultivationBatchId?: number }) => record.cultivationBatchId)
        .map((record: { cultivationBatchId?: number }) => record.cultivationBatchId as number);

      const rawMaterialBatchIds = traceabilityRecords
        .filter((record: { rawMaterialBatchId?: number }) => record.rawMaterialBatchId)
        .map((record: { rawMaterialBatchId?: number }) => record.rawMaterialBatchId as number);

      // Buscar lotes de cultivo relacionados
      const cultivationBatches = cultivationBatchIds.length > 0 
        ? await db.query.cultivationBatchesTable.findMany({
            where: sql`id IN (${cultivationBatchIds.join(',')})`
          })
        : [];

      // Buscar lotes de matéria-prima relacionados
      const rawMaterialBatches = rawMaterialBatchIds.length > 0
        ? await db.query.rawMaterialBatchesTable.findMany({
            where: sql`id IN (${rawMaterialBatchIds.join(',')})`
          })
        : [];

      // Buscar testes de qualidade associados
      const qualityTests = await db.query.qualityTestsTable.findMany({
        where: eq(qualityTestsTable.finishedProductBatchId, parseInt(batchId))
      });

      // Buscar processos de extração associados às matérias-primas ou lotes de cultivo
      const extractionProcesses = await db.query.extractionProcessesTable.findMany({
        where: sql`
          production_order_id = ${finishedBatch.productionOrderId} OR
          cultivation_batch_id IN (${cultivationBatchIds.join(',')}) OR
          raw_material_batch_id IN (${rawMaterialBatchIds.join(',')})
        `
      });

      // Montar o objeto de resposta com a rastreabilidade completa
      const traceabilityData = {
        finishedBatch,
        cultivationBatches,
        rawMaterialBatches,
        qualityTests,
        extractionProcesses,
        traceabilityRecords
      };

      return res.status(200).json(traceabilityData);
    } catch (error) {
      console.error('Erro ao buscar rastreabilidade:', error);
      return res.status(500).json({ message: 'Erro ao buscar rastreabilidade' });
    }
  });

  // Endpoint para associar um lote de cultivo a um processo de extração
  productionRouter.post('/link-cultivation/:cultivationBatchId/extraction/:extractionProcessId', authenticate, async (req: Request, res: Response) => {
    try {
      const { cultivationBatchId, extractionProcessId } = req.params;
      const organizationId = req.user?.organizationId;

      if (!organizationId) {
        return res.status(403).json({ message: 'Acesso não autorizado' });
      }

      // Verificar se a organização tem acesso ao módulo de produção
      const hasAccess = await verifyProductionModuleAccess(organizationId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Módulo de produção não ativo para esta organização' });
      }

      // Verificar se o lote de cultivo existe
      const cultivationBatch = await db.query.cultivationBatchesTable.findFirst({
        where: and(
          eq(cultivationBatchesTable.id, parseInt(cultivationBatchId)),
          eq(cultivationBatchesTable.organizationId, organizationId)
        )
      });

      if (!cultivationBatch) {
        return res.status(404).json({ message: 'Lote de cultivo não encontrado' });
      }

      // Verificar se o processo de extração existe
      const extractionProcess = await db.query.extractionProcessesTable.findFirst({
        where: and(
          eq(extractionProcessesTable.id, parseInt(extractionProcessId)),
          eq(extractionProcessesTable.organizationId, organizationId)
        )
      });

      if (!extractionProcess) {
        return res.status(404).json({ message: 'Processo de extração não encontrado' });
      }

      // Atualizar o processo de extração com a referência ao lote de cultivo
      const updatedExtraction = await db.update(extractionProcessesTable)
        .set({
          cultivationBatchId: parseInt(cultivationBatchId),
          updatedAt: new Date()
        })
        .where(and(
          eq(extractionProcessesTable.id, parseInt(extractionProcessId)),
          eq(extractionProcessesTable.organizationId, organizationId)
        ))
        .returning();

      return res.status(200).json(updatedExtraction[0]);
    } catch (error) {
      console.error('Erro ao associar lote de cultivo ao processo de extração:', error);
      return res.status(500).json({ message: 'Erro ao associar lote de cultivo ao processo de extração' });
    }
  });

  // Endpoint para buscar testes de qualidade relacionados a um lote de cultivo
  productionRouter.get('/cultivation-batches/:id/quality-tests', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const organizationId = req.user?.organizationId;

      if (!organizationId) {
        return res.status(403).json({ message: 'Acesso não autorizado' });
      }

      // Verificar se a organização tem acesso ao módulo de produção
      const hasAccess = await verifyProductionModuleAccess(organizationId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Módulo de produção não ativo para esta organização' });
      }

      // Verificar se o lote existe e pertence à organização
      const batch = await db.query.cultivationBatchesTable.findFirst({
        where: and(
          eq(cultivationBatchesTable.id, parseInt(id)),
          eq(cultivationBatchesTable.organizationId, organizationId)
        )
      });

      if (!batch) {
        return res.status(404).json({ message: 'Lote de cultivo não encontrado' });
      }

      // Buscar testes de qualidade associados ao lote de cultivo
      const qualityTests = await db.query.qualityTestsTable.findMany({
        where: and(
          eq(qualityTestsTable.cultivationBatchId, parseInt(id)),
          eq(qualityTestsTable.organizationId, organizationId)
        ),
        orderBy: [desc(qualityTestsTable.testDate)]
      });

      return res.status(200).json(qualityTests);
    } catch (error) {
      console.error('Erro ao buscar testes de qualidade:', error);
      return res.status(500).json({ message: 'Erro ao buscar testes de qualidade' });
    }
  });

  // Return the router instead of the app
  return productionRouter;
}