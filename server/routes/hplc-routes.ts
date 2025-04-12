import { Express, Request, Response } from "express";
import { db } from "../db";
import { pool } from "../db";
import { eq, desc, and, lt, gt, gte, lte, count, sum, sql } from "drizzle-orm";
import { formatDate, truncateString } from "../utils";
import { authenticate } from "../routes";
import { 
  hplcEquipments, 
  hplcMaintenances, 
  hplcConsumables, 
  hplcRuns, 
  hplcConsumptionLogs,
  hplcProcedures,
  hplcMethodValidations,
  hplcUserTrainings
} from "../../shared/schema-hplc";

/**
 * Implementação das rotas relacionadas ao gerenciamento HPLC
 * Incluindo equipamentos, manutenções, consumíveis, corridas, 
 * procedimentos, validações de métodos e treinamentos
 */
export async function registerHplcRoutes(app: Express) {
  // Middleware para verificar acesso ao módulo HPLC
  const checkHplcAccess = async (req: Request, res: Response, next: Function) => {
    try {
      // Verificar se o usuário está autenticado e tem acesso ao módulo HPLC
      // Para este exemplo, permitimos admin e role laboratory
      if (req.session?.user.role !== 'admin' && req.session?.user.role !== 'laboratory') {
        return res.status(403).json({ message: "Acesso negado ao módulo HPLC" });
      }
      
      // Se for laboratório, verificar se tem ID de laboratório associado
      if (req.session?.user.role === 'laboratory') {
        const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
        if (!laboratoryId) {
          return res.status(403).json({ message: "Laboratório não encontrado" });
        }
      }
      
      next();
    } catch (error) {
      console.error("Erro ao verificar acesso ao HPLC:", error);
      res.status(500).json({ message: "Erro ao verificar permissões" });
    }
  };

  /**
   * Rota para o dashboard do HPLC
   * Retorna estatísticas gerais para o dashboard HPLC
   */
  app.get('/api/laboratory/hplc/dashboard', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
      const timeRange = req.query.timeRange as string || '30d';
      
      // Calcular a data de início com base no intervalo de tempo
      const startDate = getStartDateFromTimeRange(timeRange);
      
      // Obter estatísticas de equipamentos
      const equipmentStats = await getEquipmentStats(laboratoryId);
      
      // Obter manutenções pendentes
      const pendingMaintenances = await getPendingMaintenances(laboratoryId);
      
      // Obter corridas por mês
      const runsByMonth = await getRunsByMonth(laboratoryId, startDate);
      
      // Obter consumíveis com estoque baixo
      const lowStock = await getLowStockConsumables(laboratoryId);
      
      // Obter validações de métodos pendentes
      const pendingValidations = await getPendingValidations(laboratoryId);
      
      // Obter consumo por tipo de consumível
      const consumptionByType = await getConsumptionByType(laboratoryId, startDate);
      
      // Obter status das corridas
      const runStatus = await getRunStatus(laboratoryId, startDate);
      
      // Retornar todos os dados para o dashboard
      res.json({
        equipment: equipmentStats,
        pendingMaintenances,
        runsByMonth,
        lowStock,
        pendingValidations,
        consumptionByType,
        runStatus
      });
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard HPLC:", error);
      res.status(500).json({ message: "Erro ao buscar dados do dashboard" });
    }
  });

  /**
   * API de Equipamentos HPLC
   */
  app.get('/api/laboratory/hplc/equipments', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
      
      let query = db.select().from(hplcEquipments);
      
      // Filtrar por ID de laboratório
      if (laboratoryId) {
        query = query.where(eq(hplcEquipments.laboratoryId, laboratoryId));
      }
      
      // Filtrar por status se fornecido
      if (req.query.status) {
        query = query.where(eq(hplcEquipments.status, String(req.query.status)));
      }
      
      // Ordenar por nome
      query = query.orderBy(hplcEquipments.name);
      
      const equipments = await query;
      res.json(equipments);
    } catch (error) {
      console.error("Erro ao buscar equipamentos HPLC:", error);
      res.status(500).json({ message: "Erro ao buscar equipamentos" });
    }
  });

  app.get('/api/laboratory/hplc/equipments/:id', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
      
      // Buscar o equipamento pelo ID
      const equipment = await db.select()
        .from(hplcEquipments)
        .where(eq(hplcEquipments.id, Number(id)))
        .limit(1);
      
      if (!equipment.length) {
        return res.status(404).json({ message: "Equipamento não encontrado" });
      }
      
      // Verificar se o equipamento pertence ao laboratório do usuário
      if (laboratoryId && equipment[0].laboratoryId !== laboratoryId) {
        return res.status(403).json({ message: "Acesso negado a este equipamento" });
      }
      
      // Buscar manutenções relacionadas
      const maintenances = await db.select()
        .from(hplcMaintenances)
        .where(eq(hplcMaintenances.equipmentId, Number(id)))
        .orderBy(desc(hplcMaintenances.scheduledDate));
      
      // Buscar corridas relacionadas
      const runs = await db.select()
        .from(hplcRuns)
        .where(eq(hplcRuns.equipmentId, Number(id)))
        .orderBy(desc(hplcRuns.startTime))
        .limit(10);
      
      // Retornar equipamento com dados relacionados
      res.json({
        ...equipment[0],
        maintenances,
        runs
      });
    } catch (error) {
      console.error("Erro ao buscar detalhes do equipamento HPLC:", error);
      res.status(500).json({ message: "Erro ao buscar detalhes do equipamento" });
    }
  });

  app.post('/api/laboratory/hplc/equipments', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
      
      if (!laboratoryId) {
        return res.status(400).json({ message: "Laboratório não encontrado" });
      }
      
      // Dados do equipamento
      const equipmentData = {
        name: req.body.name,
        laboratoryId,
        model: req.body.model,
        serialNumber: req.body.serialNumber,
        manufacturer: req.body.manufacturer,
        acquisitionDate: req.body.acquisitionDate ? new Date(req.body.acquisitionDate) : null,
        installationDate: req.body.installationDate ? new Date(req.body.installationDate) : null,
        status: req.body.status || 'operational',
        location: req.body.location || null,
        documents: req.body.documents || null,
        specifications: req.body.specifications || null,
        warrantyExpiration: req.body.warrantyExpiration ? new Date(req.body.warrantyExpiration) : null,
        nextCalibrationDate: req.body.nextCalibrationDate ? new Date(req.body.nextCalibrationDate) : null,
        notes: req.body.notes || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Inserir equipamento
      const [newEquipment] = await db.insert(hplcEquipments).values(equipmentData).returning();
      
      res.status(201).json(newEquipment);
    } catch (error) {
      console.error("Erro ao criar equipamento HPLC:", error);
      res.status(500).json({ message: "Erro ao criar equipamento" });
    }
  });

  app.put('/api/laboratory/hplc/equipments/:id', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
      
      // Verificar se o equipamento existe e pertence ao laboratório
      const existingEquipment = await db.select()
        .from(hplcEquipments)
        .where(eq(hplcEquipments.id, Number(id)))
        .limit(1);
      
      if (!existingEquipment.length) {
        return res.status(404).json({ message: "Equipamento não encontrado" });
      }
      
      if (laboratoryId && existingEquipment[0].laboratoryId !== laboratoryId) {
        return res.status(403).json({ message: "Acesso negado a este equipamento" });
      }
      
      // Dados atualizados do equipamento
      const updateData = {
        name: req.body.name !== undefined ? req.body.name : existingEquipment[0].name,
        model: req.body.model !== undefined ? req.body.model : existingEquipment[0].model,
        serialNumber: req.body.serialNumber !== undefined ? req.body.serialNumber : existingEquipment[0].serialNumber,
        manufacturer: req.body.manufacturer !== undefined ? req.body.manufacturer : existingEquipment[0].manufacturer,
        acquisitionDate: req.body.acquisitionDate !== undefined ? new Date(req.body.acquisitionDate) : existingEquipment[0].acquisitionDate,
        installationDate: req.body.installationDate !== undefined ? new Date(req.body.installationDate) : existingEquipment[0].installationDate,
        status: req.body.status !== undefined ? req.body.status : existingEquipment[0].status,
        location: req.body.location !== undefined ? req.body.location : existingEquipment[0].location,
        documents: req.body.documents !== undefined ? req.body.documents : existingEquipment[0].documents,
        specifications: req.body.specifications !== undefined ? req.body.specifications : existingEquipment[0].specifications,
        warrantyExpiration: req.body.warrantyExpiration !== undefined ? new Date(req.body.warrantyExpiration) : existingEquipment[0].warrantyExpiration,
        nextCalibrationDate: req.body.nextCalibrationDate !== undefined ? new Date(req.body.nextCalibrationDate) : existingEquipment[0].nextCalibrationDate,
        notes: req.body.notes !== undefined ? req.body.notes : existingEquipment[0].notes,
        updatedAt: new Date()
      };
      
      // Atualizar equipamento
      const [updatedEquipment] = await db.update(hplcEquipments)
        .set(updateData)
        .where(eq(hplcEquipments.id, Number(id)))
        .returning();
      
      res.json(updatedEquipment);
    } catch (error) {
      console.error("Erro ao atualizar equipamento HPLC:", error);
      res.status(500).json({ message: "Erro ao atualizar equipamento" });
    }
  });

  /**
   * API de Manutenções HPLC
   */
  app.get('/api/laboratory/hplc/maintenances', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
      
      // Query base para buscar todas as manutenções
      const query = `
        SELECT m.*, e.name as equipment_name, e.model as equipment_model, e.serial_number 
        FROM hplc_maintenances m
        JOIN hplc_equipments e ON m.equipment_id = e.id
        WHERE e.laboratory_id = $1
      `;
      
      // Adicionar filtros conforme necessário
      let filterQuery = query;
      const params: any[] = [laboratoryId];
      
      if (req.query.status) {
        filterQuery += ` AND m.status = $${params.length + 1}`;
        params.push(req.query.status);
      }
      
      if (req.query.maintenanceType) {
        filterQuery += ` AND m.maintenance_type = $${params.length + 1}`;
        params.push(req.query.maintenanceType);
      }
      
      // Ordenar manutenções por data agendada
      filterQuery += ` ORDER BY m.scheduled_date DESC`;
      
      const result = await pool.query(filterQuery, params);
      
      res.json(result.rows);
    } catch (error) {
      console.error("Erro ao buscar manutenções HPLC:", error);
      res.status(500).json({ message: "Erro ao buscar manutenções" });
    }
  });

  app.post('/api/laboratory/hplc/maintenances', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
      
      // Verificar se o equipamento existe e pertence ao laboratório
      const equipment = await db.select()
        .from(hplcEquipments)
        .where(eq(hplcEquipments.id, req.body.equipmentId))
        .limit(1);
      
      if (!equipment.length) {
        return res.status(404).json({ message: "Equipamento não encontrado" });
      }
      
      if (laboratoryId && equipment[0].laboratoryId !== laboratoryId) {
        return res.status(403).json({ message: "Acesso negado a este equipamento" });
      }
      
      // Dados da manutenção
      const maintenanceData = {
        createdBy: req.session.user.id,
        description: req.body.description,
        equipmentId: req.body.equipmentId,
        maintenanceType: req.body.maintenanceType,
        scheduledDate: new Date(req.body.scheduledDate),
        completionDate: req.body.completionDate ? new Date(req.body.completionDate) : null,
        performedBy: req.body.performedBy || null,
        cost: req.body.cost || null,
        status: req.body.status || 'scheduled',
        serviceProvider: req.body.serviceProvider || null,
        contactInfo: req.body.contactInfo || null,
        workOrderNumber: req.body.workOrderNumber || null,
        notes: req.body.notes || null,
        attachments: req.body.attachments || null,
        followUpDate: req.body.followUpDate ? new Date(req.body.followUpDate) : null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Inserir manutenção
      const [newMaintenance] = await db.insert(hplcMaintenances).values(maintenanceData).returning();
      
      // Se o status for 'in_progress', atualizar status do equipamento
      if (maintenanceData.status === 'in_progress') {
        await db.update(hplcEquipments)
          .set({ status: 'maintenance', updatedAt: new Date() })
          .where(eq(hplcEquipments.id, req.body.equipmentId));
      }
      
      res.status(201).json(newMaintenance);
    } catch (error) {
      console.error("Erro ao criar manutenção HPLC:", error);
      res.status(500).json({ message: "Erro ao criar manutenção" });
    }
  });

  app.put('/api/laboratory/hplc/maintenances/:id', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
      
      // Verificar se a manutenção existe
      const maintenance = await db.select()
        .from(hplcMaintenances)
        .where(eq(hplcMaintenances.id, Number(id)))
        .limit(1);
      
      if (!maintenance.length) {
        return res.status(404).json({ message: "Manutenção não encontrada" });
      }
      
      // Verificar se o equipamento pertence ao laboratório
      const equipment = await db.select()
        .from(hplcEquipments)
        .where(eq(hplcEquipments.id, maintenance[0].equipmentId))
        .limit(1);
      
      if (!equipment.length) {
        return res.status(404).json({ message: "Equipamento não encontrado" });
      }
      
      if (laboratoryId && equipment[0].laboratoryId !== laboratoryId) {
        return res.status(403).json({ message: "Acesso negado a este equipamento" });
      }
      
      // Dados atualizados da manutenção
      const updateData: any = {
        updatedAt: new Date()
      };
      
      // Atualizar apenas os campos fornecidos
      const fields = [
        'description', 'maintenanceType', 'scheduledDate', 'completionDate',
        'performedBy', 'cost', 'status', 'serviceProvider', 'contactInfo',
        'workOrderNumber', 'notes', 'attachments', 'followUpDate'
      ];
      
      fields.forEach(field => {
        if (req.body[field] !== undefined) {
          if (['scheduledDate', 'completionDate', 'followUpDate'].includes(field) && req.body[field]) {
            updateData[field] = new Date(req.body[field]);
          } else {
            updateData[field] = req.body[field];
          }
        }
      });
      
      // Atualizar manutenção
      const [updatedMaintenance] = await db.update(hplcMaintenances)
        .set(updateData)
        .where(eq(hplcMaintenances.id, Number(id)))
        .returning();
      
      // Atualizar status do equipamento se necessário
      if (updateData.status === 'completed' && maintenance[0].status !== 'completed') {
        await db.update(hplcEquipments)
          .set({ status: 'operational', updatedAt: new Date() })
          .where(eq(hplcEquipments.id, maintenance[0].equipmentId));
      } else if (updateData.status === 'in_progress' && maintenance[0].status !== 'in_progress') {
        await db.update(hplcEquipments)
          .set({ status: 'maintenance', updatedAt: new Date() })
          .where(eq(hplcEquipments.id, maintenance[0].equipmentId));
      }
      
      res.json(updatedMaintenance);
    } catch (error) {
      console.error("Erro ao atualizar manutenção HPLC:", error);
      res.status(500).json({ message: "Erro ao atualizar manutenção" });
    }
  });

  /**
   * API de Consumíveis HPLC
   */
  app.get('/api/laboratory/hplc/consumables', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
      
      // Query para buscar todos os consumíveis
      let query = db.select().from(hplcConsumables);
      
      // Filtrar por ID do laboratório
      if (laboratoryId) {
        query = query.where(eq(hplcConsumables.laboratoryId, laboratoryId));
      }
      
      // Filtrar por tipo se fornecido
      if (req.query.type) {
        query = query.where(eq(hplcConsumables.type, String(req.query.type)));
      }
      
      // Filtrar por estoque baixo se solicitado
      if (req.query.lowStock === 'true') {
        query = query.where(lte(hplcConsumables.currentQuantity, hplcConsumables.minimumQuantity));
      }
      
      // Ordenar por nome
      query = query.orderBy(hplcConsumables.name);
      
      const consumables = await query;
      res.json(consumables);
    } catch (error) {
      console.error("Erro ao buscar consumíveis HPLC:", error);
      res.status(500).json({ message: "Erro ao buscar consumíveis" });
    }
  });

  app.post('/api/laboratory/hplc/consumables', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
      
      if (!laboratoryId) {
        return res.status(400).json({ message: "Laboratório não encontrado" });
      }
      
      // Dados do consumível
      const consumableData = {
        name: req.body.name,
        type: req.body.type,
        laboratoryId,
        unit: req.body.unit,
        createdBy: req.session.user.id,
        initialQuantity: req.body.initialQuantity,
        currentQuantity: req.body.initialQuantity, // Inicialmente igual à quantidade inicial
        minimumQuantity: req.body.minimumQuantity,
        catalogNumber: req.body.catalogNumber || null,
        manufacturer: req.body.manufacturer || null,
        lotNumber: req.body.lotNumber || null,
        receivedDate: req.body.receivedDate ? new Date(req.body.receivedDate) : new Date(),
        expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : null,
        storageLocation: req.body.storageLocation || null,
        price: req.body.price || null,
        supplier: req.body.supplier || null,
        storageConditions: req.body.storageConditions || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Inserir consumível
      const [newConsumable] = await db.insert(hplcConsumables).values(consumableData).returning();
      
      res.status(201).json(newConsumable);
    } catch (error) {
      console.error("Erro ao criar consumível HPLC:", error);
      res.status(500).json({ message: "Erro ao criar consumível" });
    }
  });

  app.put('/api/laboratory/hplc/consumables/:id', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
      
      // Verificar se o consumível existe e pertence ao laboratório
      const consumable = await db.select()
        .from(hplcConsumables)
        .where(eq(hplcConsumables.id, Number(id)))
        .limit(1);
      
      if (!consumable.length) {
        return res.status(404).json({ message: "Consumível não encontrado" });
      }
      
      if (laboratoryId && consumable[0].laboratoryId !== laboratoryId) {
        return res.status(403).json({ message: "Acesso negado a este consumível" });
      }
      
      // Dados atualizados do consumível
      const updateData: any = {
        updatedAt: new Date()
      };
      
      // Atualizar apenas os campos fornecidos
      const fields = [
        'name', 'type', 'unit', 'currentQuantity', 'minimumQuantity',
        'catalogNumber', 'manufacturer', 'lotNumber', 'receivedDate',
        'expiryDate', 'storageLocation', 'price', 'supplier', 'storageConditions'
      ];
      
      fields.forEach(field => {
        if (req.body[field] !== undefined) {
          if (['receivedDate', 'expiryDate'].includes(field) && req.body[field]) {
            updateData[field] = new Date(req.body[field]);
          } else {
            updateData[field] = req.body[field];
          }
        }
      });
      
      // Atualizar consumível
      const [updatedConsumable] = await db.update(hplcConsumables)
        .set(updateData)
        .where(eq(hplcConsumables.id, Number(id)))
        .returning();
      
      res.json(updatedConsumable);
    } catch (error) {
      console.error("Erro ao atualizar consumível HPLC:", error);
      res.status(500).json({ message: "Erro ao atualizar consumível" });
    }
  });

  app.post('/api/laboratory/hplc/consumables/:id/usage', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
      
      // Verificar se o consumível existe e pertence ao laboratório
      const consumable = await db.select()
        .from(hplcConsumables)
        .where(eq(hplcConsumables.id, Number(id)))
        .limit(1);
      
      if (!consumable.length) {
        return res.status(404).json({ message: "Consumível não encontrado" });
      }
      
      if (laboratoryId && consumable[0].laboratoryId !== laboratoryId) {
        return res.status(403).json({ message: "Acesso negado a este consumível" });
      }
      
      // Verificar se a quantidade disponível é suficiente
      if (consumable[0].currentQuantity < req.body.quantity) {
        return res.status(400).json({ message: "Quantidade insuficiente disponível" });
      }
      
      // Registrar o uso do consumível
      const usageData = {
        consumableId: Number(id),
        quantity: req.body.quantity,
        unitUsed: req.body.unitUsed || consumable[0].unit,
        runId: req.body.runId || undefined,
        usedBy: req.session.user.id,
        usedAt: new Date(),
        reason: req.body.reason,
        notes: req.body.notes || undefined
      };
      
      // Inserir registro de uso
      const [newUsage] = await db.insert(hplcConsumptionLogs).values(usageData).returning();
      
      // Atualizar a quantidade atual do consumível
      const newQuantity = consumable[0].currentQuantity - req.body.quantity;
      await db.update(hplcConsumables)
        .set({ 
          currentQuantity: newQuantity,
          updatedAt: new Date()
        })
        .where(eq(hplcConsumables.id, Number(id)));
      
      res.status(201).json({
        usage: newUsage,
        currentQuantity: newQuantity
      });
    } catch (error) {
      console.error("Erro ao registrar uso de consumível HPLC:", error);
      res.status(500).json({ message: "Erro ao registrar uso do consumível" });
    }
  });

  /**
   * API de Corridas HPLC
   */
  app.get('/api/laboratory/hplc/runs', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
      
      // Query base para buscar corridas
      const query = `
        SELECT r.*, e.name as equipment_name, u.name as analyst_name,
               c.name as column_name
        FROM hplc_runs r
        JOIN hplc_equipments e ON r.equipment_id = e.id
        LEFT JOIN users u ON r.analyst = u.id
        LEFT JOIN hplc_consumables c ON r.column_id = c.id
        WHERE e.laboratory_id = $1
      `;
      
      // Adicionar filtros conforme necessário
      let filterQuery = query;
      const params: any[] = [laboratoryId];
      
      if (req.query.status) {
        filterQuery += ` AND r.status = $${params.length + 1}`;
        params.push(req.query.status);
      }
      
      if (req.query.equipmentId) {
        filterQuery += ` AND r.equipment_id = $${params.length + 1}`;
        params.push(req.query.equipmentId);
      }
      
      if (req.query.startDate) {
        filterQuery += ` AND r.start_time >= $${params.length + 1}`;
        params.push(req.query.startDate);
      }
      
      if (req.query.endDate) {
        filterQuery += ` AND r.start_time <= $${params.length + 1}`;
        params.push(req.query.endDate);
      }
      
      // Ordenar por data de início (mais recentes primeiro)
      filterQuery += ` ORDER BY r.start_time DESC`;
      
      const result = await pool.query(filterQuery, params);
      
      res.json(result.rows);
    } catch (error) {
      console.error("Erro ao buscar corridas HPLC:", error);
      res.status(500).json({ message: "Erro ao buscar corridas" });
    }
  });

  app.post('/api/laboratory/hplc/runs', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
      
      // Verificar se o equipamento existe e pertence ao laboratório
      const equipment = await db.select()
        .from(hplcEquipments)
        .where(eq(hplcEquipments.id, req.body.equipmentId))
        .limit(1);
      
      if (!equipment.length) {
        return res.status(404).json({ message: "Equipamento não encontrado" });
      }
      
      if (laboratoryId && equipment[0].laboratoryId !== laboratoryId) {
        return res.status(403).json({ message: "Acesso negado a este equipamento" });
      }
      
      // Dados da corrida
      const runData = {
        method: req.body.method,
        equipmentId: req.body.equipmentId,
        runName: req.body.runName,
        startTime: new Date(req.body.startTime || new Date()),
        endTime: req.body.endTime ? new Date(req.body.endTime) : null,
        analyst: req.body.analyst || req.session.user.id,
        sampleCount: req.body.sampleCount,
        columnId: req.body.columnId || null,
        mobilePhase: req.body.mobilePhase || null,
        result: req.body.result || null,
        status: req.body.status || 'in_progress',
        notes: req.body.notes || null,
        flowRate: req.body.flowRate || null,
        detectionWavelength: req.body.detectionWavelength || null,
        injectionVolume: req.body.injectionVolume || null,
        temperature: req.body.temperature || null,
        processingDetails: req.body.processingDetails || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Inserir corrida
      const [newRun] = await db.insert(hplcRuns).values(runData).returning();
      
      res.status(201).json(newRun);
    } catch (error) {
      console.error("Erro ao criar corrida HPLC:", error);
      res.status(500).json({ message: "Erro ao criar corrida" });
    }
  });

  app.get('/api/laboratory/hplc/runs/:id', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
      
      // Buscar detalhes da corrida
      const queryRun = `
        SELECT r.*, e.name as equipment_name, e.model as equipment_model, 
               u.name as analyst_name, c.name as column_name
        FROM hplc_runs r
        JOIN hplc_equipments e ON r.equipment_id = e.id
        LEFT JOIN users u ON r.analyst = u.id
        LEFT JOIN hplc_consumables c ON r.column_id = c.id
        WHERE r.id = $1 AND e.laboratory_id = $2
      `;
      
      const runResult = await pool.query(queryRun, [id, laboratoryId]);
      
      if (!runResult.rows.length) {
        return res.status(404).json({ message: "Corrida não encontrada" });
      }
      
      // Buscar consumíveis usados nesta corrida
      const consumptionQuery = `
        SELECT cl.*, c.name as consumable_name, c.type as consumable_type,
               u.name as used_by_name
        FROM hplc_consumption_logs cl
        JOIN hplc_consumables c ON cl.consumable_id = c.id
        LEFT JOIN users u ON cl.used_by = u.id
        WHERE cl.run_id = $1 AND c.laboratory_id = $2
        ORDER BY cl.used_at DESC
      `;
      
      const consumptionResult = await pool.query(consumptionQuery, [id, laboratoryId]);
      
      // Retornar corrida com detalhes dos consumíveis utilizados
      res.json({
        ...runResult.rows[0],
        consumables: consumptionResult.rows
      });
    } catch (error) {
      console.error("Erro ao buscar detalhes da corrida HPLC:", error);
      res.status(500).json({ message: "Erro ao buscar detalhes da corrida" });
    }
  });

  app.put('/api/laboratory/hplc/runs/:id', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
      
      // Verificar se a corrida existe
      const run = await db.select().from(hplcRuns).where(eq(hplcRuns.id, Number(id))).limit(1);
      
      if (!run.length) {
        return res.status(404).json({ message: "Corrida não encontrada" });
      }
      
      // Verificar se o equipamento pertence ao laboratório do usuário
      const equipment = await db.select()
        .from(hplcEquipments)
        .where(eq(hplcEquipments.id, run[0].equipmentId))
        .limit(1);
      
      if (!equipment.length) {
        return res.status(404).json({ message: "Equipamento não encontrado" });
      }
      
      if (laboratoryId && equipment[0].laboratoryId !== laboratoryId) {
        return res.status(403).json({ message: "Acesso negado a esta corrida" });
      }
      
      // Dados atualizados da corrida
      const updateData: any = {
        updatedAt: new Date()
      };
      
      // Atualizar apenas os campos fornecidos
      const fields = [
        'method', 'runName', 'startTime', 'endTime', 'analyst', 'sampleCount',
        'columnId', 'mobilePhase', 'result', 'status', 'notes', 'flowRate',
        'detectionWavelength', 'injectionVolume', 'temperature', 'processingDetails'
      ];
      
      fields.forEach(field => {
        if (req.body[field] !== undefined) {
          if (['startTime', 'endTime'].includes(field) && req.body[field]) {
            updateData[field] = new Date(req.body[field]);
          } else {
            updateData[field] = req.body[field];
          }
        }
      });
      
      // Atualizar corrida
      const [updatedRun] = await db.update(hplcRuns)
        .set(updateData)
        .where(eq(hplcRuns.id, Number(id)))
        .returning();
      
      res.json(updatedRun);
    } catch (error) {
      console.error("Erro ao atualizar corrida HPLC:", error);
      res.status(500).json({ message: "Erro ao atualizar corrida" });
    }
  });

  // Função auxiliar para obter o ID do laboratório a partir do ID do usuário
  async function getLaboratoryId(userId: number, role: string): Promise<number | null> {
    try {
      // Se for admin, retorna null para permitir acesso a todos os laboratórios
      if (role === 'admin') {
        return null;
      }
      
      // Para usuários de laboratório, buscar o ID do laboratório associado
      const query = `
        SELECT l.id FROM laboratories l
        JOIN users u ON l.id = u.laboratory_id
        WHERE u.id = $1
      `;
      
      const result = await pool.query(query, [userId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0].id;
    } catch (error) {
      console.error("Erro ao obter ID do laboratório:", error);
      return null;
    }
  }

  // Função auxiliar para obter a data de início baseada no intervalo de tempo
  function getStartDateFromTimeRange(timeRange: string): Date {
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '365d':
        startDate.setDate(now.getDate() - 365);
        break;
      default:
        startDate.setDate(now.getDate() - 30); // Padrão: 30 dias
    }
    
    return startDate;
  }

  // Função auxiliar para obter estatísticas de equipamentos
  async function getEquipmentStats(laboratoryId: number | null): Promise<any> {
    try {
      let query;
      let params = [];
      
      if (laboratoryId) {
        query = `
          SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'operational' THEN 1 END) as operational,
            COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as in_maintenance,
            COUNT(CASE WHEN status = 'out_of_service' THEN 1 END) as out_of_service
          FROM hplc_equipments
          WHERE laboratory_id = $1
        `;
        params = [laboratoryId];
      } else {
        query = `
          SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'operational' THEN 1 END) as operational,
            COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as in_maintenance,
            COUNT(CASE WHEN status = 'out_of_service' THEN 1 END) as out_of_service
          FROM hplc_equipments
        `;
      }
      
      const result = await pool.query(query, params);
      
      return {
        total: parseInt(result.rows[0].total) || 0,
        operational: parseInt(result.rows[0].operational) || 0,
        inMaintenance: parseInt(result.rows[0].in_maintenance) || 0,
        outOfService: parseInt(result.rows[0].out_of_service) || 0
      };
    } catch (error) {
      console.error("Erro ao obter estatísticas de equipamentos:", error);
      return {
        total: 0,
        operational: 0,
        inMaintenance: 0,
        outOfService: 0
      };
    }
  }

  // Função auxiliar para obter manutenções pendentes
  async function getPendingMaintenances(laboratoryId: number | null): Promise<number> {
    try {
      let query;
      let params = [];
      
      if (laboratoryId) {
        query = `
          SELECT COUNT(*) as count
          FROM hplc_maintenances m
          JOIN hplc_equipments e ON m.equipment_id = e.id
          WHERE e.laboratory_id = $1
          AND (m.status = 'scheduled' OR m.status = 'in_progress')
          AND m.scheduled_date <= CURRENT_DATE + INTERVAL '7 days'
        `;
        params = [laboratoryId];
      } else {
        query = `
          SELECT COUNT(*) as count
          FROM hplc_maintenances m
          WHERE (m.status = 'scheduled' OR m.status = 'in_progress')
          AND m.scheduled_date <= CURRENT_DATE + INTERVAL '7 days'
        `;
      }
      
      const result = await pool.query(query, params);
      
      return parseInt(result.rows[0].count) || 0;
    } catch (error) {
      console.error("Erro ao obter manutenções pendentes:", error);
      return 0;
    }
  }

  /**
   * API de Procedimentos HPLC (SOPs)
   */
  app.get('/api/laboratory/hplc/procedures', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
      
      // Query para buscar todos os procedimentos
      let query = db.select().from(hplcProcedures);
      
      // Filtrar por ID de laboratório
      if (laboratoryId) {
        query = query.where(eq(hplcProcedures.laboratoryId, laboratoryId));
      }
      
      // Filtrar por categoria se fornecida
      if (req.query.category) {
        query = query.where(eq(hplcProcedures.category, String(req.query.category)));
      }
      
      // Ordenar por título
      query = query.orderBy(hplcProcedures.title);
      
      const procedures = await query;
      res.json(procedures);
    } catch (error) {
      console.error("Erro ao buscar procedimentos HPLC:", error);
      res.status(500).json({ message: "Erro ao buscar procedimentos" });
    }
  });
  
  app.get('/api/laboratory/hplc/procedures/:id', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
      
      // Buscar o procedimento pelo ID
      const procedure = await db.select()
        .from(hplcProcedures)
        .where(eq(hplcProcedures.id, Number(id)))
        .limit(1);
      
      if (!procedure.length) {
        return res.status(404).json({ message: "Procedimento não encontrado" });
      }
      
      // Verificar se o procedimento pertence ao laboratório do usuário
      if (laboratoryId && procedure[0].laboratoryId !== laboratoryId) {
        return res.status(403).json({ message: "Acesso negado a este procedimento" });
      }
      
      res.json(procedure[0]);
    } catch (error) {
      console.error("Erro ao buscar detalhes do procedimento HPLC:", error);
      res.status(500).json({ message: "Erro ao buscar detalhes do procedimento" });
    }
  });
  
  app.post('/api/laboratory/hplc/procedures', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
      
      if (!laboratoryId) {
        return res.status(400).json({ message: "Laboratório não encontrado" });
      }
      
      // Dados do procedimento
      const procedureData = {
        title: req.body.title,
        documentNumber: req.body.documentNumber,
        version: req.body.version,
        effectiveDate: new Date(req.body.effectiveDate),
        category: req.body.category,
        content: req.body.content,
        attachments: req.body.attachments || null,
        laboratoryId,
        createdBy: req.session.user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Inserir procedimento
      const [newProcedure] = await db.insert(hplcProcedures).values(procedureData).returning();
      
      res.status(201).json(newProcedure);
    } catch (error) {
      console.error("Erro ao criar procedimento HPLC:", error);
      res.status(500).json({ message: "Erro ao criar procedimento" });
    }
  });
  
  app.put('/api/laboratory/hplc/procedures/:id', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
      
      // Verificar se o procedimento existe
      const procedure = await db.select()
        .from(hplcProcedures)
        .where(eq(hplcProcedures.id, Number(id)))
        .limit(1);
      
      if (!procedure.length) {
        return res.status(404).json({ message: "Procedimento não encontrado" });
      }
      
      // Verificar se o procedimento pertence ao laboratório do usuário
      if (laboratoryId && procedure[0].laboratoryId !== laboratoryId) {
        return res.status(403).json({ message: "Acesso negado a este procedimento" });
      }
      
      // Dados atualizados do procedimento
      const updateData: any = {
        updatedAt: new Date()
      };
      
      // Atualizar apenas os campos fornecidos
      const fields = [
        'title', 'documentNumber', 'version', 'effectiveDate',
        'category', 'content', 'attachments'
      ];
      
      fields.forEach(field => {
        if (req.body[field] !== undefined) {
          if (field === 'effectiveDate' && req.body[field]) {
            updateData[field] = new Date(req.body[field]);
          } else {
            updateData[field] = req.body[field];
          }
        }
      });
      
      // Atualizar procedimento
      const [updatedProcedure] = await db.update(hplcProcedures)
        .set(updateData)
        .where(eq(hplcProcedures.id, Number(id)))
        .returning();
      
      res.json(updatedProcedure);
    } catch (error) {
      console.error("Erro ao atualizar procedimento HPLC:", error);
      res.status(500).json({ message: "Erro ao atualizar procedimento" });
    }
  });
  
  app.delete('/api/laboratory/hplc/procedures/:id', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
      
      // Verificar se o procedimento existe
      const procedure = await db.select()
        .from(hplcProcedures)
        .where(eq(hplcProcedures.id, Number(id)))
        .limit(1);
      
      if (!procedure.length) {
        return res.status(404).json({ message: "Procedimento não encontrado" });
      }
      
      // Verificar se o procedimento pertence ao laboratório do usuário
      if (laboratoryId && procedure[0].laboratoryId !== laboratoryId) {
        return res.status(403).json({ message: "Acesso negado a este procedimento" });
      }
      
      // Verificar se há treinamentos associados a este procedimento
      const associatedTrainings = await db.select({ count: count() })
        .from(hplcUserTrainings)
        .where(eq(hplcUserTrainings.procedureId, Number(id)));
      
      if (associatedTrainings[0].count > 0) {
        return res.status(400).json({ 
          message: "Este procedimento possui treinamentos associados e não pode ser excluído" 
        });
      }
      
      // Excluir procedimento
      await db.delete(hplcProcedures)
        .where(eq(hplcProcedures.id, Number(id)));
      
      res.status(200).json({ message: "Procedimento excluído com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir procedimento HPLC:", error);
      res.status(500).json({ message: "Erro ao excluir procedimento" });
    }
  });
  
  /**
   * API de Validações de Métodos HPLC
   */
  app.get('/api/laboratory/hplc/validations', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
      
      // Query para buscar todas as validações
      let query = db.select().from(hplcMethodValidations);
      
      // Filtrar por ID de laboratório
      if (laboratoryId) {
        query = query.where(eq(hplcMethodValidations.laboratoryId, laboratoryId));
      }
      
      // Filtrar por status se fornecido
      if (req.query.status) {
        query = query.where(eq(hplcMethodValidations.status, String(req.query.status)));
      }
      
      // Ordenar por data de criação (mais recentes primeiro)
      query = query.orderBy(desc(hplcMethodValidations.createdAt));
      
      const validations = await query;
      res.json(validations);
    } catch (error) {
      console.error("Erro ao buscar validações de métodos HPLC:", error);
      res.status(500).json({ message: "Erro ao buscar validações de métodos" });
    }
  });
  
  app.get('/api/laboratory/hplc/validations/:id', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
      
      // Buscar a validação pelo ID
      const validation = await db.select()
        .from(hplcMethodValidations)
        .where(eq(hplcMethodValidations.id, Number(id)))
        .limit(1);
      
      if (!validation.length) {
        return res.status(404).json({ message: "Validação de método não encontrada" });
      }
      
      // Verificar se a validação pertence ao laboratório do usuário
      if (laboratoryId && validation[0].laboratoryId !== laboratoryId) {
        return res.status(403).json({ message: "Acesso negado a esta validação de método" });
      }
      
      res.json(validation[0]);
    } catch (error) {
      console.error("Erro ao buscar detalhes da validação de método HPLC:", error);
      res.status(500).json({ message: "Erro ao buscar detalhes da validação de método" });
    }
  });
  
  app.post('/api/laboratory/hplc/validations', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
      
      if (!laboratoryId) {
        return res.status(400).json({ message: "Laboratório não encontrado" });
      }
      
      // Dados da validação de método
      const validationData = {
        methodName: req.body.methodName,
        version: req.body.version,
        status: req.body.status || 'submitted',
        validationParameters: req.body.validationParameters || null,
        protocol: req.body.protocol,
        reports: req.body.reports || null,
        conclusion: req.body.conclusion || null,
        laboratoryId,
        requestedBy: req.session.user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Inserir validação de método
      const [newValidation] = await db.insert(hplcMethodValidations).values(validationData).returning();
      
      res.status(201).json(newValidation);
    } catch (error) {
      console.error("Erro ao criar validação de método HPLC:", error);
      res.status(500).json({ message: "Erro ao criar validação de método" });
    }
  });
  
  app.put('/api/laboratory/hplc/validations/:id', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
      
      // Verificar se a validação existe
      const validation = await db.select()
        .from(hplcMethodValidations)
        .where(eq(hplcMethodValidations.id, Number(id)))
        .limit(1);
      
      if (!validation.length) {
        return res.status(404).json({ message: "Validação de método não encontrada" });
      }
      
      // Verificar se a validação pertence ao laboratório do usuário
      if (laboratoryId && validation[0].laboratoryId !== laboratoryId) {
        return res.status(403).json({ message: "Acesso negado a esta validação de método" });
      }
      
      // Dados atualizados da validação
      const updateData: any = {
        updatedAt: new Date()
      };
      
      // Atualizar apenas os campos fornecidos
      const fields = [
        'methodName', 'version', 'status', 'validationParameters',
        'protocol', 'reports', 'conclusion'
      ];
      
      fields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });
      
      // Atualizar validação
      const [updatedValidation] = await db.update(hplcMethodValidations)
        .set(updateData)
        .where(eq(hplcMethodValidations.id, Number(id)))
        .returning();
      
      res.json(updatedValidation);
    } catch (error) {
      console.error("Erro ao atualizar validação de método HPLC:", error);
      res.status(500).json({ message: "Erro ao atualizar validação de método" });
    }
  });
  
  /**
   * API de Treinamentos HPLC
   */
  app.get('/api/laboratory/hplc/trainings', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
      
      // Query para buscar todos os treinamentos
      // Usando SQL bruto para fazer joins mais complexos
      const query = `
        SELECT t.*, u.name as user_name, u.email as user_email,
               tb.name as trainer_name, tb.email as trainer_email,
               e.name as equipment_name, p.title as procedure_title
        FROM hplc_user_trainings t
        LEFT JOIN users u ON t.user_id = u.id
        LEFT JOIN users tb ON t.trained_by = tb.id
        LEFT JOIN hplc_equipments e ON t.equipment_id = e.id
        LEFT JOIN hplc_procedures p ON t.procedure_id = p.id
        WHERE ($1::int IS NULL OR e.laboratory_id = $1)
      `;
      
      // Adicionar filtros conforme necessário
      let filterQuery = query;
      const params: any[] = [laboratoryId];
      
      if (req.query.status) {
        filterQuery += ` AND t.status = $${params.length + 1}`;
        params.push(req.query.status);
      }
      
      if (req.query.userId) {
        filterQuery += ` AND t.user_id = $${params.length + 1}`;
        params.push(req.query.userId);
      }
      
      if (req.query.equipmentId) {
        filterQuery += ` AND t.equipment_id = $${params.length + 1}`;
        params.push(req.query.equipmentId);
      }
      
      if (req.query.procedureId) {
        filterQuery += ` AND t.procedure_id = $${params.length + 1}`;
        params.push(req.query.procedureId);
      }
      
      // Ordenar treinamentos por data de início
      filterQuery += ` ORDER BY t.start_date DESC`;
      
      const result = await pool.query(filterQuery, params);
      
      res.json(result.rows);
    } catch (error) {
      console.error("Erro ao buscar treinamentos HPLC:", error);
      res.status(500).json({ message: "Erro ao buscar treinamentos" });
    }
  });
  
  app.get('/api/laboratory/hplc/trainings/:id', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
      
      // Query para buscar o treinamento específico com informações relacionadas
      const query = `
        SELECT t.*, u.name as user_name, u.email as user_email,
               tb.name as trainer_name, tb.email as trainer_email,
               e.name as equipment_name, p.title as procedure_title
        FROM hplc_user_trainings t
        LEFT JOIN users u ON t.user_id = u.id
        LEFT JOIN users tb ON t.trained_by = tb.id
        LEFT JOIN hplc_equipments e ON t.equipment_id = e.id
        LEFT JOIN hplc_procedures p ON t.procedure_id = p.id
        WHERE t.id = $1 AND ($2::int IS NULL OR e.laboratory_id = $2)
        LIMIT 1
      `;
      
      const result = await pool.query(query, [id, laboratoryId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Treinamento não encontrado" });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Erro ao buscar detalhes do treinamento HPLC:", error);
      res.status(500).json({ message: "Erro ao buscar detalhes do treinamento" });
    }
  });
  
  app.post('/api/laboratory/hplc/trainings', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
      
      // Verificar se o equipamento (se fornecido) pertence ao laboratório
      if (req.body.equipmentId) {
        const equipment = await db.select()
          .from(hplcEquipments)
          .where(eq(hplcEquipments.id, req.body.equipmentId))
          .limit(1);
        
        if (!equipment.length) {
          return res.status(404).json({ message: "Equipamento não encontrado" });
        }
        
        if (laboratoryId && equipment[0].laboratoryId !== laboratoryId) {
          return res.status(403).json({ message: "Acesso negado a este equipamento" });
        }
      }
      
      // Verificar se o procedimento (se fornecido) pertence ao laboratório
      if (req.body.procedureId) {
        const procedure = await db.select()
          .from(hplcProcedures)
          .where(eq(hplcProcedures.id, req.body.procedureId))
          .limit(1);
        
        if (!procedure.length) {
          return res.status(404).json({ message: "Procedimento não encontrado" });
        }
        
        if (laboratoryId && procedure[0].laboratoryId !== laboratoryId) {
          return res.status(403).json({ message: "Acesso negado a este procedimento" });
        }
      }
      
      // Verificar se o usuário a ser treinado existe
      const user = await db.execute(sql`SELECT id FROM users WHERE id = ${req.body.userId}`);
      if (!user.rowCount) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // Dados do treinamento
      const trainingData = {
        userId: req.body.userId,
        procedureId: req.body.procedureId || null,
        equipmentId: req.body.equipmentId || null,
        trainingTitle: req.body.trainingTitle,
        trainingType: req.body.trainingType,
        startDate: new Date(req.body.startDate),
        completionDate: req.body.completionDate ? new Date(req.body.completionDate) : null,
        trainedBy: req.session.user.id,
        status: req.body.status || 'scheduled',
        assessmentScore: req.body.assessmentScore || null,
        certificateIssued: req.body.certificateIssued || false,
        comments: req.body.comments || null,
        attachments: req.body.attachments || null,
        createdBy: req.session.user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Inserir treinamento
      const [newTraining] = await db.insert(hplcUserTrainings).values(trainingData).returning();
      
      res.status(201).json(newTraining);
    } catch (error) {
      console.error("Erro ao criar treinamento HPLC:", error);
      res.status(500).json({ message: "Erro ao criar treinamento" });
    }
  });
  
  app.put('/api/laboratory/hplc/trainings/:id', authenticate, checkHplcAccess, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const laboratoryId = await getLaboratoryId(req.session.user.id, req.session.user.role);
      
      // Buscar o treinamento
      const query = `
        SELECT t.*, e.laboratory_id
        FROM hplc_user_trainings t
        LEFT JOIN hplc_equipments e ON t.equipment_id = e.id
        WHERE t.id = $1
        LIMIT 1
      `;
      
      const trainingResult = await pool.query(query, [id]);
      
      if (trainingResult.rows.length === 0) {
        return res.status(404).json({ message: "Treinamento não encontrado" });
      }
      
      // Verificar se o treinamento está associado ao laboratório do usuário
      if (laboratoryId && trainingResult.rows[0].laboratory_id && 
          trainingResult.rows[0].laboratory_id !== laboratoryId) {
        return res.status(403).json({ message: "Acesso negado a este treinamento" });
      }
      
      // Dados atualizados do treinamento
      const updateData: any = {
        updatedAt: new Date()
      };
      
      // Atualizar apenas os campos fornecidos
      const fields = [
        'userId', 'procedureId', 'equipmentId', 'trainingTitle', 'trainingType',
        'startDate', 'completionDate', 'trainedBy', 'status', 'assessmentScore',
        'certificateIssued', 'comments', 'attachments'
      ];
      
      fields.forEach(field => {
        if (req.body[field] !== undefined) {
          if (['startDate', 'completionDate'].includes(field) && req.body[field]) {
            updateData[field] = new Date(req.body[field]);
          } else {
            updateData[field] = req.body[field];
          }
        }
      });
      
      // Atualizar treinamento
      const [updatedTraining] = await db.update(hplcUserTrainings)
        .set(updateData)
        .where(eq(hplcUserTrainings.id, Number(id)))
        .returning();
      
      res.json(updatedTraining);
    } catch (error) {
      console.error("Erro ao atualizar treinamento HPLC:", error);
      res.status(500).json({ message: "Erro ao atualizar treinamento" });
    }
  });

  // Função auxiliar para obter corridas por mês
  async function getRunsByMonth(laboratoryId: number | null, startDate: Date): Promise<any[]> {
    try {
      let query;
      let params = [];
      
      if (laboratoryId) {
        query = `
          SELECT TO_CHAR(r.start_time, 'YYYY-MM') as month, COUNT(*) as count
          FROM hplc_runs r
          JOIN hplc_equipments e ON r.equipment_id = e.id
          WHERE e.laboratory_id = $1
          AND r.start_time >= $2
          GROUP BY TO_CHAR(r.start_time, 'YYYY-MM')
          ORDER BY month
        `;
        params = [laboratoryId, startDate];
      } else {
        query = `
          SELECT TO_CHAR(r.start_time, 'YYYY-MM') as month, COUNT(*) as count
          FROM hplc_runs r
          WHERE r.start_time >= $1
          GROUP BY TO_CHAR(r.start_time, 'YYYY-MM')
          ORDER BY month
        `;
        params = [startDate];
      }
      
      const result = await pool.query(query, params);
      
      return result.rows;
    } catch (error) {
      console.error("Erro ao obter corridas por mês:", error);
      return [];
    }
  }

  // Função auxiliar para obter consumíveis com estoque baixo
  async function getLowStockConsumables(laboratoryId: number | null): Promise<number> {
    try {
      let query;
      let params = [];
      
      if (laboratoryId) {
        query = `
          SELECT COUNT(*) as count
          FROM hplc_consumables
          WHERE laboratory_id = $1
          AND current_quantity <= minimum_quantity
        `;
        params = [laboratoryId];
      } else {
        query = `
          SELECT COUNT(*) as count
          FROM hplc_consumables
          WHERE current_quantity <= minimum_quantity
        `;
      }
      
      const result = await pool.query(query, params);
      
      return parseInt(result.rows[0].count) || 0;
    } catch (error) {
      console.error("Erro ao obter consumíveis com estoque baixo:", error);
      return 0;
    }
  }

  // Função auxiliar para obter validações de métodos pendentes
  async function getPendingValidations(laboratoryId: number | null): Promise<number> {
    try {
      let query;
      let params = [];
      
      if (laboratoryId) {
        query = `
          SELECT COUNT(*) as count
          FROM hplc_method_validations
          WHERE laboratory_id = $1
          AND status IN ('submitted', 'in_progress')
        `;
        params = [laboratoryId];
      } else {
        query = `
          SELECT COUNT(*) as count
          FROM hplc_method_validations
          WHERE status IN ('submitted', 'in_progress')
        `;
      }
      
      const result = await pool.query(query, params);
      
      return parseInt(result.rows[0].count) || 0;
    } catch (error) {
      console.error("Erro ao obter validações de métodos pendentes:", error);
      return 0;
    }
  }

  // Função auxiliar para obter consumo por tipo de consumível
  async function getConsumptionByType(laboratoryId: number | null, startDate: Date): Promise<any[]> {
    try {
      let query;
      let params = [];
      
      if (laboratoryId) {
        query = `
          SELECT c.type, SUM(cl.quantity) as quantity
          FROM hplc_consumption_logs cl
          JOIN hplc_consumables c ON cl.consumable_id = c.id
          WHERE c.laboratory_id = $1
          AND cl.used_at >= $2
          GROUP BY c.type
          ORDER BY quantity DESC
        `;
        params = [laboratoryId, startDate];
      } else {
        query = `
          SELECT c.type, SUM(cl.quantity) as quantity
          FROM hplc_consumption_logs cl
          JOIN hplc_consumables c ON cl.consumable_id = c.id
          WHERE cl.used_at >= $1
          GROUP BY c.type
          ORDER BY quantity DESC
        `;
        params = [startDate];
      }
      
      const result = await pool.query(query, params);
      
      return result.rows;
    } catch (error) {
      console.error("Erro ao obter consumo por tipo:", error);
      return [];
    }
  }

  // Função auxiliar para obter status das corridas
  async function getRunStatus(laboratoryId: number | null, startDate: Date): Promise<any[]> {
    try {
      let query;
      let params = [];
      
      if (laboratoryId) {
        query = `
          SELECT r.status, COUNT(*) as count
          FROM hplc_runs r
          JOIN hplc_equipments e ON r.equipment_id = e.id
          WHERE e.laboratory_id = $1
          AND r.start_time >= $2
          GROUP BY r.status
          ORDER BY count DESC
        `;
        params = [laboratoryId, startDate];
      } else {
        query = `
          SELECT r.status, COUNT(*) as count
          FROM hplc_runs r
          WHERE r.start_time >= $1
          GROUP BY r.status
          ORDER BY count DESC
        `;
        params = [startDate];
      }
      
      const result = await pool.query(query, params);
      
      return result.rows;
    } catch (error) {
      console.error("Erro ao obter status das corridas:", error);
      return [];
    }
  }
}