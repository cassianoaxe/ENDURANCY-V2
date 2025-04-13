import { Request, Response, Router } from 'express';
import { db } from '../db';
import { 
  labEquipments, 
  equipmentMaintenances, 
  equipmentCertificates, 
  equipmentStatusEnum, 
  maintenanceTypeEnum, 
  maintenanceStatusEnum 
} from '../../shared/schema-lab-equipment';
import { eq, and, desc, sql } from 'drizzle-orm';
import { authenticate } from '../routes';

const router = Router();

// Verificar se o usuário tem permissão (laboratório)
const checkLabPermission = (req: Request, res: Response, next: Function) => {
  try {
    const user = req.session.user;
    
    if (!user) {
      console.log("Usuário não autenticado no checkLabPermission");
      return res.status(401).json({ message: "Não autenticado" });
    }
    
    // Corrigido para aceitar 'laboratory' e 'labor' como tipos válidos de usuário de laboratório
    if (user.role !== 'laboratory' && user.role !== 'labor') {
      console.log(`Usuário com role inválida: ${user.role}`);
      return res.status(403).json({ message: "Acesso negado. Apenas usuários do laboratório podem acessar este recurso" });
    }
    
    console.log(`Usuário ${user.username} (${user.role}) autorizado a acessar recurso de laboratório`);
    next();
  } catch (error) {
    console.error("Erro ao verificar permissão:", error);
    return res.status(500).json({ message: "Erro ao verificar permissão" });
  }
};

// GET - Listar todos os equipamentos
router.get('/equipments', authenticate, checkLabPermission, async (req: Request, res: Response) => {
  try {
    const equipments = await db.query.labEquipments.findMany({
      orderBy: [desc(labEquipments.id)]
    });
    
    return res.json({ equipments });
  } catch (error) {
    console.error("Erro ao buscar equipamentos:", error);
    return res.status(500).json({ message: "Erro ao buscar equipamentos" });
  }
});

// GET - Listar todos os equipamentos (endpoint alternativo para uso do cliente)
router.get('/equipment/list', authenticate, checkLabPermission, async (req: Request, res: Response) => {
  try {
    const equipments = await db.query.labEquipments.findMany({
      orderBy: [desc(labEquipments.id)]
    });
    
    return res.json({ equipments });
  } catch (error) {
    console.error("Erro ao buscar equipamentos:", error);
    return res.status(500).json({ message: "Erro ao buscar equipamentos" });
  }
});

// GET - Buscar equipamento por ID
router.get('/equipments/:id', authenticate, checkLabPermission, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const equipment = await db.query.labEquipments.findFirst({
      where: eq(labEquipments.id, parseInt(id)),
    });
    
    if (!equipment) {
      return res.status(404).json({ message: "Equipamento não encontrado" });
    }
    
    // Buscar manutenções associadas
    const maintenances = await db.query.equipmentMaintenances.findMany({
      where: eq(equipmentMaintenances.equipmentId, parseInt(id)),
      orderBy: [desc(equipmentMaintenances.scheduledDate)]
    });
    
    // Buscar certificados associados
    const certificates = await db.query.equipmentCertificates.findMany({
      where: eq(equipmentCertificates.equipmentId, parseInt(id)),
      orderBy: [desc(equipmentCertificates.issueDate)]
    });
    
    return res.json({ 
      equipment,
      maintenances,
      certificates
    });
  } catch (error) {
    console.error("Erro ao buscar detalhes do equipamento:", error);
    return res.status(500).json({ message: "Erro ao buscar detalhes do equipamento" });
  }
});

// POST - Adicionar novo equipamento
router.post('/equipments', authenticate, checkLabPermission, async (req: Request, res: Response) => {
  try {
    const {
      name,
      model,
      serialNumber,
      manufacturer,
      acquisitionDate,
      installationDate,
      status,
      location,
      description,
      maintenanceFrequency,
      calibrationFrequency,
      validationFrequency,
      lastMaintenanceDate,
      nextMaintenanceDate,
      lastCalibrationDate,
      nextCalibrationDate,
      lastValidationDate,
      nextValidationDate,
      documents,
    } = req.body;
    
    const laboratoryId = req.session.user!.organizationId || req.session.user!.id;
    
    // Definindo responsável - usuário atual
    const responsibleUserId = req.session.user!.id;
    
    // Inserindo o novo equipamento
    const result = await db.insert(labEquipments).values({
      name,
      laboratoryId,
      model,
      serialNumber,
      manufacturer,
      acquisitionDate: acquisitionDate ? new Date(acquisitionDate) : null,
      installationDate: installationDate ? new Date(installationDate) : null,
      status: status || 'operational',
      location,
      description,
      maintenanceFrequency,
      calibrationFrequency,
      validationFrequency,
      lastMaintenanceDate: lastMaintenanceDate ? new Date(lastMaintenanceDate) : null,
      nextMaintenanceDate: nextMaintenanceDate ? new Date(nextMaintenanceDate) : null,
      lastCalibrationDate: lastCalibrationDate ? new Date(lastCalibrationDate) : null,
      nextCalibrationDate: nextCalibrationDate ? new Date(nextCalibrationDate) : null,
      lastValidationDate: lastValidationDate ? new Date(lastValidationDate) : null,
      nextValidationDate: nextValidationDate ? new Date(nextValidationDate) : null,
      responsibleUserId,
      documents: documents || [],
    }).returning();
    
    return res.status(201).json({ 
      message: "Equipamento adicionado com sucesso", 
      equipment: result[0] 
    });
  } catch (error) {
    console.error("Erro ao adicionar equipamento:", error);
    return res.status(500).json({ message: "Erro ao adicionar equipamento" });
  }
});

// PUT - Atualizar equipamento
router.put('/equipments/:id', authenticate, checkLabPermission, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const {
      name,
      model,
      serialNumber,
      manufacturer,
      acquisitionDate,
      installationDate,
      status,
      location,
      description,
      maintenanceFrequency,
      calibrationFrequency,
      validationFrequency,
      lastMaintenanceDate,
      nextMaintenanceDate,
      lastCalibrationDate,
      nextCalibrationDate,
      lastValidationDate,
      nextValidationDate,
      responsibleUserId,
      documents,
    } = req.body;
    
    // Verificar se o equipamento existe
    const existingEquipment = await db.query.labEquipments.findFirst({
      where: eq(labEquipments.id, parseInt(id)),
    });
    
    if (!existingEquipment) {
      return res.status(404).json({ message: "Equipamento não encontrado" });
    }
    
    // Atualizando o equipamento
    const result = await db.update(labEquipments)
      .set({
        name,
        model,
        serialNumber,
        manufacturer,
        acquisitionDate: acquisitionDate ? new Date(acquisitionDate) : existingEquipment.acquisitionDate,
        installationDate: installationDate ? new Date(installationDate) : existingEquipment.installationDate,
        status: status || existingEquipment.status,
        location,
        description,
        maintenanceFrequency,
        calibrationFrequency,
        validationFrequency,
        lastMaintenanceDate: lastMaintenanceDate ? new Date(lastMaintenanceDate) : existingEquipment.lastMaintenanceDate,
        nextMaintenanceDate: nextMaintenanceDate ? new Date(nextMaintenanceDate) : existingEquipment.nextMaintenanceDate,
        lastCalibrationDate: lastCalibrationDate ? new Date(lastCalibrationDate) : existingEquipment.lastCalibrationDate,
        nextCalibrationDate: nextCalibrationDate ? new Date(nextCalibrationDate) : existingEquipment.nextCalibrationDate,
        lastValidationDate: lastValidationDate ? new Date(lastValidationDate) : existingEquipment.lastValidationDate,
        nextValidationDate: nextValidationDate ? new Date(nextValidationDate) : existingEquipment.nextValidationDate,
        responsibleUserId,
        documents: documents || existingEquipment.documents,
        updatedAt: new Date(),
      })
      .where(eq(labEquipments.id, parseInt(id)))
      .returning();
    
    return res.json({ 
      message: "Equipamento atualizado com sucesso", 
      equipment: result[0] 
    });
  } catch (error) {
    console.error("Erro ao atualizar equipamento:", error);
    return res.status(500).json({ message: "Erro ao atualizar equipamento" });
  }
});

// DELETE - Remover equipamento
router.delete('/equipments/:id', authenticate, checkLabPermission, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se o equipamento existe
    const existingEquipment = await db.query.labEquipments.findFirst({
      where: eq(labEquipments.id, parseInt(id)),
    });
    
    if (!existingEquipment) {
      return res.status(404).json({ message: "Equipamento não encontrado" });
    }
    
    // Excluir todas as manutenções associadas
    await db.delete(equipmentMaintenances)
      .where(eq(equipmentMaintenances.equipmentId, parseInt(id)));
    
    // Excluir todos os certificados associados
    await db.delete(equipmentCertificates)
      .where(eq(equipmentCertificates.equipmentId, parseInt(id)));
    
    // Excluir o equipamento
    await db.delete(labEquipments)
      .where(eq(labEquipments.id, parseInt(id)));
    
    return res.json({ message: "Equipamento removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover equipamento:", error);
    return res.status(500).json({ message: "Erro ao remover equipamento" });
  }
});

// POST - Adicionar manutenção ao equipamento
router.post('/equipments/:id/maintenances', authenticate, checkLabPermission, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const {
      maintenanceType,
      description,
      scheduledDate,
      completionDate,
      performedBy,
      cost,
      status,
      serviceProvider,
      notes,
      attachments,
      resultsSummary,
      approvedBy,
      followUpRequired,
      followUpDate,
    } = req.body;
    
    // Verificar se o equipamento existe
    const equipment = await db.query.labEquipments.findFirst({
      where: eq(labEquipments.id, parseInt(id)),
    });
    
    if (!equipment) {
      return res.status(404).json({ message: "Equipamento não encontrado" });
    }
    
    // Usuário atual como criador da manutenção
    const createdBy = req.session.user!.id;
    
    // Inserindo a nova manutenção
    const result = await db.insert(equipmentMaintenances).values({
      equipmentId: parseInt(id),
      maintenanceType,
      description,
      scheduledDate: new Date(scheduledDate),
      completionDate: completionDate ? new Date(completionDate) : null,
      performedBy,
      cost,
      status: status || 'scheduled',
      serviceProvider,
      notes,
      attachments: attachments || [],
      resultsSummary,
      approvedBy,
      followUpRequired: followUpRequired || false,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      createdBy,
    }).returning();
    
    // Se for manutenção concluída, atualizar a data da última manutenção no equipamento
    if (status === 'completed' && completionDate) {
      if (maintenanceType === 'calibration') {
        await db.update(labEquipments)
          .set({
            lastCalibrationDate: new Date(completionDate),
            updatedAt: new Date(),
          })
          .where(eq(labEquipments.id, parseInt(id)));
      } else if (maintenanceType === 'validation') {
        await db.update(labEquipments)
          .set({
            lastValidationDate: new Date(completionDate),
            updatedAt: new Date(),
          })
          .where(eq(labEquipments.id, parseInt(id)));
      } else {
        await db.update(labEquipments)
          .set({
            lastMaintenanceDate: new Date(completionDate),
            updatedAt: new Date(),
          })
          .where(eq(labEquipments.id, parseInt(id)));
      }
    }
    
    return res.status(201).json({ 
      message: "Manutenção adicionada com sucesso", 
      maintenance: result[0] 
    });
  } catch (error) {
    console.error("Erro ao adicionar manutenção:", error);
    return res.status(500).json({ message: "Erro ao adicionar manutenção" });
  }
});

// PUT - Atualizar manutenção
router.put('/maintenances/:id', authenticate, checkLabPermission, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const {
      maintenanceType,
      description,
      scheduledDate,
      completionDate,
      performedBy,
      cost,
      status,
      serviceProvider,
      notes,
      attachments,
      resultsSummary,
      approvedBy,
      followUpRequired,
      followUpDate,
    } = req.body;
    
    // Verificar se a manutenção existe
    const existingMaintenance = await db.query.equipmentMaintenances.findFirst({
      where: eq(equipmentMaintenances.id, parseInt(id)),
    });
    
    if (!existingMaintenance) {
      return res.status(404).json({ message: "Manutenção não encontrada" });
    }
    
    // Atualizar a manutenção
    const result = await db.update(equipmentMaintenances)
      .set({
        maintenanceType: maintenanceType || existingMaintenance.maintenanceType,
        description,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : existingMaintenance.scheduledDate,
        completionDate: completionDate ? new Date(completionDate) : existingMaintenance.completionDate,
        performedBy,
        cost,
        status: status || existingMaintenance.status,
        serviceProvider,
        notes,
        attachments: attachments || existingMaintenance.attachments,
        resultsSummary,
        approvedBy,
        followUpRequired: followUpRequired !== undefined ? followUpRequired : existingMaintenance.followUpRequired,
        followUpDate: followUpDate ? new Date(followUpDate) : existingMaintenance.followUpDate,
        updatedAt: new Date(),
      })
      .where(eq(equipmentMaintenances.id, parseInt(id)))
      .returning();
    
    // Se a manutenção foi concluída, atualizar a data da última manutenção no equipamento
    if (status === 'completed' && completionDate && existingMaintenance.status !== 'completed') {
      const equipmentId = existingMaintenance.equipmentId;
      
      if (maintenanceType === 'calibration') {
        await db.update(labEquipments)
          .set({
            lastCalibrationDate: new Date(completionDate),
            updatedAt: new Date(),
          })
          .where(eq(labEquipments.id, equipmentId));
      } else if (maintenanceType === 'validation') {
        await db.update(labEquipments)
          .set({
            lastValidationDate: new Date(completionDate),
            updatedAt: new Date(),
          })
          .where(eq(labEquipments.id, equipmentId));
      } else {
        await db.update(labEquipments)
          .set({
            lastMaintenanceDate: new Date(completionDate),
            updatedAt: new Date(),
          })
          .where(eq(labEquipments.id, equipmentId));
      }
    }
    
    return res.json({ 
      message: "Manutenção atualizada com sucesso", 
      maintenance: result[0] 
    });
  } catch (error) {
    console.error("Erro ao atualizar manutenção:", error);
    return res.status(500).json({ message: "Erro ao atualizar manutenção" });
  }
});

// DELETE - Remover manutenção
router.delete('/maintenances/:id', authenticate, checkLabPermission, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se a manutenção existe
    const existingMaintenance = await db.query.equipmentMaintenances.findFirst({
      where: eq(equipmentMaintenances.id, parseInt(id)),
    });
    
    if (!existingMaintenance) {
      return res.status(404).json({ message: "Manutenção não encontrada" });
    }
    
    // Excluir a manutenção
    await db.delete(equipmentMaintenances)
      .where(eq(equipmentMaintenances.id, parseInt(id)));
    
    return res.json({ message: "Manutenção removida com sucesso" });
  } catch (error) {
    console.error("Erro ao remover manutenção:", error);
    return res.status(500).json({ message: "Erro ao remover manutenção" });
  }
});

// POST - Adicionar certificado ao equipamento
router.post('/equipments/:id/certificates', authenticate, checkLabPermission, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const {
      certificateNumber,
      certificateType,
      issueDate,
      expiryDate,
      issuedBy,
      status,
      documentUrl,
      notes,
    } = req.body;
    
    // Verificar se o equipamento existe
    const equipment = await db.query.labEquipments.findFirst({
      where: eq(labEquipments.id, parseInt(id)),
    });
    
    if (!equipment) {
      return res.status(404).json({ message: "Equipamento não encontrado" });
    }
    
    // Usuário atual como criador do certificado
    const createdBy = req.session.user!.id;
    
    // Inserindo o novo certificado
    const result = await db.insert(equipmentCertificates).values({
      equipmentId: parseInt(id),
      certificateNumber,
      certificateType,
      issueDate: new Date(issueDate),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      issuedBy,
      status,
      documentUrl,
      notes,
      createdBy,
    }).returning();
    
    return res.status(201).json({ 
      message: "Certificado adicionado com sucesso", 
      certificate: result[0] 
    });
  } catch (error) {
    console.error("Erro ao adicionar certificado:", error);
    return res.status(500).json({ message: "Erro ao adicionar certificado" });
  }
});

// PUT - Atualizar certificado
router.put('/certificates/:id', authenticate, checkLabPermission, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const {
      certificateNumber,
      certificateType,
      issueDate,
      expiryDate,
      issuedBy,
      status,
      documentUrl,
      notes,
    } = req.body;
    
    // Verificar se o certificado existe
    const existingCertificate = await db.query.equipmentCertificates.findFirst({
      where: eq(equipmentCertificates.id, parseInt(id)),
    });
    
    if (!existingCertificate) {
      return res.status(404).json({ message: "Certificado não encontrado" });
    }
    
    // Atualizar o certificado
    const result = await db.update(equipmentCertificates)
      .set({
        certificateNumber,
        certificateType,
        issueDate: issueDate ? new Date(issueDate) : existingCertificate.issueDate,
        expiryDate: expiryDate ? new Date(expiryDate) : existingCertificate.expiryDate,
        issuedBy,
        status,
        documentUrl,
        notes,
        updatedAt: new Date(),
      })
      .where(eq(equipmentCertificates.id, parseInt(id)))
      .returning();
    
    return res.json({ 
      message: "Certificado atualizado com sucesso", 
      certificate: result[0] 
    });
  } catch (error) {
    console.error("Erro ao atualizar certificado:", error);
    return res.status(500).json({ message: "Erro ao atualizar certificado" });
  }
});

// DELETE - Remover certificado
router.delete('/certificates/:id', authenticate, checkLabPermission, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar se o certificado existe
    const existingCertificate = await db.query.equipmentCertificates.findFirst({
      where: eq(equipmentCertificates.id, parseInt(id)),
    });
    
    if (!existingCertificate) {
      return res.status(404).json({ message: "Certificado não encontrado" });
    }
    
    // Excluir o certificado
    await db.delete(equipmentCertificates)
      .where(eq(equipmentCertificates.id, parseInt(id)));
    
    return res.json({ message: "Certificado removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover certificado:", error);
    return res.status(500).json({ message: "Erro ao remover certificado" });
  }
});

// GET - Obter estatísticas de equipamentos
router.get('/equipment-stats', authenticate, checkLabPermission, async (req: Request, res: Response) => {
  try {
    // Contar equipamentos por status
    const laboratoryId = req.session.user!.organizationId || req.session.user!.id;
    
    const equipmentStatusCounts = await db.select({
      status: labEquipments.status,
      count: sql<number>`COUNT(*)::int`
    })
    .from(labEquipments)
    .where(eq(labEquipments.laboratoryId, laboratoryId))
    .groupBy(labEquipments.status);
    
    // Contar manutenções por tipo
    const maintenanceTypeCounts = await db.select({
      type: equipmentMaintenances.maintenanceType,
      count: sql<number>`COUNT(*)::int`
    })
    .from(equipmentMaintenances)
    .innerJoin(
      labEquipments,
      eq(equipmentMaintenances.equipmentId, labEquipments.id)
    )
    .where(eq(labEquipments.laboratoryId, laboratoryId))
    .groupBy(equipmentMaintenances.maintenanceType);
    
    // Contar manutenções por status
    const maintenanceStatusCounts = await db.select({
      status: equipmentMaintenances.status,
      count: sql<number>`COUNT(*)::int`
    })
    .from(equipmentMaintenances)
    .innerJoin(
      labEquipments,
      eq(equipmentMaintenances.equipmentId, labEquipments.id)
    )
    .where(eq(labEquipments.laboratoryId, laboratoryId))
    .groupBy(equipmentMaintenances.status);
    
    // Encontrar manutenções programadas nos próximos 30 dias
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const upcomingMaintenances = await db.select()
    .from(equipmentMaintenances)
    .innerJoin(
      labEquipments,
      eq(equipmentMaintenances.equipmentId, labEquipments.id)
    )
    .where(
      and(
        eq(labEquipments.laboratoryId, laboratoryId),
        eq(equipmentMaintenances.status, 'scheduled'),
        sql`${equipmentMaintenances.scheduledDate} <= ${thirtyDaysFromNow}`,
        sql`${equipmentMaintenances.scheduledDate} >= CURRENT_DATE`
      )
    )
    .orderBy(equipmentMaintenances.scheduledDate)
    .limit(10);
    
    // Encontrar equipamentos que precisam de calibração/manutenção/validação em breve
    const equipmentsNeedingAttention = await db.select()
    .from(labEquipments)
    .where(
      and(
        eq(labEquipments.laboratoryId, laboratoryId),
        sql`(
          ${labEquipments.nextMaintenanceDate} IS NOT NULL AND
          ${labEquipments.nextMaintenanceDate} <= ${thirtyDaysFromNow}
        ) OR (
          ${labEquipments.nextCalibrationDate} IS NOT NULL AND
          ${labEquipments.nextCalibrationDate} <= ${thirtyDaysFromNow}
        ) OR (
          ${labEquipments.nextValidationDate} IS NOT NULL AND
          ${labEquipments.nextValidationDate} <= ${thirtyDaysFromNow}
        )`
      )
    )
    .orderBy(sql`LEAST(
      COALESCE(${labEquipments.nextMaintenanceDate}, '9999-12-31'),
      COALESCE(${labEquipments.nextCalibrationDate}, '9999-12-31'),
      COALESCE(${labEquipments.nextValidationDate}, '9999-12-31')
    )`)
    .limit(10);
    
    return res.json({
      equipmentStatusCounts,
      maintenanceTypeCounts,
      maintenanceStatusCounts,
      upcomingMaintenances,
      equipmentsNeedingAttention
    });
  } catch (error) {
    console.error("Erro ao obter estatísticas de equipamentos:", error);
    return res.status(500).json({ message: "Erro ao obter estatísticas de equipamentos" });
  }
});

export default router;