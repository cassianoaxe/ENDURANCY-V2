import { Express, Request, Response, Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { authenticate } from "../routes";
import { generateRandomString } from "../utils";
import {
  laboratoriesTable,
  laboratoryTechniciansTable,
  samplesTable,
  testsTable,
  cannabinoidResultsTable,
  terpeneResultsTable,
  heavyMetalsResultsTable,
  insertLaboratorySchema,
  insertSampleSchema,
  insertTestSchema,
  insertCannabinoidResultsSchema,
  insertTerpeneResultsSchema,
  insertHeavyMetalsResultsSchema,
  sampleTypeEnum,
  testTypeEnum,
  testStatusEnum,
  laboratoryAuditLogsTable
} from "@shared/schema-laboratory";
import { and, eq, ne, like, desc, asc, sql, isNull, isNotNull } from "drizzle-orm";
import { organizationModules } from "@shared/schema";

// Gerador de número de rastreio
function generateTrackingNumber(): string {
  const prefix = "LAB";
  const timestamp = Date.now().toString().slice(-6);
  const random = generateRandomString(4).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Middleware para verificar acesso ao módulo de laboratório
function verifyLaboratoryAccess(req: Request, res: Response, next: Function) {
  const userId = req.session?.user?.id;
  const organizationId = req.session?.user?.organizationId;
  const userRole = req.session?.user?.role;

  // Admins têm acesso completo
  if (userRole === 'admin') {
    return next();
  }

  // Verifica se o usuário tem acesso ao módulo de laboratório
  if (organizationId) {
    db.select()
      .from(organizationModules)
      .where(
        and(
          eq(organizationModules.organizationId, organizationId),
          eq(organizationModules.moduleId, 20), // ID do módulo de laboratório
          eq(organizationModules.active, true)
        )
      )
      .then((modules) => {
        if (modules.length > 0) {
          next();
        } else {
          res.status(403).json({ error: "Organização não tem acesso ao módulo de laboratório" });
        }
      })
      .catch((error) => {
        console.error("Erro ao verificar acesso ao módulo de laboratório:", error);
        res.status(500).json({ error: "Erro ao verificar permissões" });
      });
  } else {
    res.status(403).json({ error: "Acesso negado" });
  }
}

// Adicionar registro de auditoria
async function addAuditLog(
  userId: number | null,
  laboratoryId: number | null,
  sampleId: number | null,
  testId: number | null,
  action: string,
  details: string,
  previousValue?: any,
  newValue?: any,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    await db.insert(laboratoryAuditLogsTable).values({
      userId,
      laboratoryId,
      sampleId,
      testId,
      action,
      details,
      previousValue: previousValue ? JSON.stringify(previousValue) : null,
      newValue: newValue ? JSON.stringify(newValue) : null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    });
  } catch (error) {
    console.error("Erro ao adicionar log de auditoria:", error);
  }
}

// Registrar as rotas do laboratório
export async function registerLaboratoryRoutes(app: Express) {
  const router = Router();

  // Aplicar middleware de autenticação a todas as rotas
  router.use(authenticate);
  router.use(verifyLaboratoryAccess);

  // ===== LABORATÓRIOS =====

  // Listar laboratórios
  router.get("/laboratories", async (req: Request, res: Response) => {
    try {
      // Filtros opcionais
      const name = req.query.name as string | undefined;
      const state = req.query.state as string | undefined;
      const active = req.query.active !== undefined ? req.query.active === 'true' : undefined;

      let query = db.select().from(laboratoriesTable);

      // Aplicar filtros se fornecidos
      if (name) {
        query = query.where(like(laboratoriesTable.name, `%${name}%`));
      }
      if (state) {
        query = query.where(eq(laboratoriesTable.state, state));
      }
      if (active !== undefined) {
        query = query.where(eq(laboratoriesTable.isActive, active));
      }

      // Ordenar por nome
      query = query.orderBy(asc(laboratoriesTable.name));

      const laboratories = await query;
      res.json(laboratories);
    } catch (error) {
      console.error("Erro ao listar laboratórios:", error);
      res.status(500).json({ error: "Erro ao listar laboratórios" });
    }
  });

  // Obter laboratório por ID
  router.get("/laboratories/:id", async (req: Request, res: Response) => {
    try {
      const laboratoryId = parseInt(req.params.id);
      
      const [laboratory] = await db
        .select()
        .from(laboratoriesTable)
        .where(eq(laboratoriesTable.id, laboratoryId));

      if (!laboratory) {
        return res.status(404).json({ error: "Laboratório não encontrado" });
      }

      res.json(laboratory);
    } catch (error) {
      console.error("Erro ao obter laboratório:", error);
      res.status(500).json({ error: "Erro ao obter laboratório" });
    }
  });

  // Criar laboratório
  router.post("/laboratories", async (req: Request, res: Response) => {
    try {
      const parsedData = insertLaboratorySchema.parse(req.body);
      
      const [createdLaboratory] = await db
        .insert(laboratoriesTable)
        .values(parsedData)
        .returning();

      // Registrar na auditoria
      await addAuditLog(
        req.session.user?.id || null,
        createdLaboratory.id,
        null,
        null,
        "create",
        "Laboratório criado",
        null,
        parsedData,
        req.ip,
        req.headers["user-agent"]
      );

      res.status(201).json(createdLaboratory);
    } catch (error) {
      console.error("Erro ao criar laboratório:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Erro ao criar laboratório" });
    }
  });

  // Atualizar laboratório
  router.put("/laboratories/:id", async (req: Request, res: Response) => {
    try {
      const laboratoryId = parseInt(req.params.id);
      
      // Buscar laboratório existente
      const [existingLaboratory] = await db
        .select()
        .from(laboratoriesTable)
        .where(eq(laboratoriesTable.id, laboratoryId));

      if (!existingLaboratory) {
        return res.status(404).json({ error: "Laboratório não encontrado" });
      }

      const parsedData = insertLaboratorySchema.parse(req.body);
      
      const [updatedLaboratory] = await db
        .update(laboratoriesTable)
        .set({
          ...parsedData,
          updatedAt: new Date()
        })
        .where(eq(laboratoriesTable.id, laboratoryId))
        .returning();

      // Registrar na auditoria
      await addAuditLog(
        req.session.user?.id || null,
        laboratoryId,
        null,
        null,
        "update",
        "Laboratório atualizado",
        existingLaboratory,
        updatedLaboratory,
        req.ip,
        req.headers["user-agent"]
      );

      res.json(updatedLaboratory);
    } catch (error) {
      console.error("Erro ao atualizar laboratório:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Erro ao atualizar laboratório" });
    }
  });

  // ===== TÉCNICOS DE LABORATÓRIO =====

  // Listar técnicos de um laboratório
  router.get("/laboratories/:id/technicians", async (req: Request, res: Response) => {
    try {
      const laboratoryId = parseInt(req.params.id);
      
      const technicians = await db
        .select({
          id: laboratoryTechniciansTable.id,
          userId: laboratoryTechniciansTable.userId,
          laboratoryId: laboratoryTechniciansTable.laboratoryId,
          role: laboratoryTechniciansTable.role,
          specialization: laboratoryTechniciansTable.specialization,
          licenseNumber: laboratoryTechniciansTable.licenseNumber,
          isActive: laboratoryTechniciansTable.isActive,
          createdAt: laboratoryTechniciansTable.createdAt,
          updatedAt: laboratoryTechniciansTable.updatedAt,
          name: sql<string>`users.name`,
          email: sql<string>`users.email`,
          profilePhoto: sql<string>`users.profile_photo`,
        })
        .from(laboratoryTechniciansTable)
        .innerJoin('users', eq(laboratoryTechniciansTable.userId, sql`users.id`))
        .where(eq(laboratoryTechniciansTable.laboratoryId, laboratoryId));

      res.json(technicians);
    } catch (error) {
      console.error("Erro ao listar técnicos do laboratório:", error);
      res.status(500).json({ error: "Erro ao listar técnicos do laboratório" });
    }
  });

  // Adicionar técnico ao laboratório
  router.post("/laboratories/:id/technicians", async (req: Request, res: Response) => {
    try {
      const laboratoryId = parseInt(req.params.id);
      
      // Verificar se o laboratório existe
      const [laboratory] = await db
        .select()
        .from(laboratoriesTable)
        .where(eq(laboratoriesTable.id, laboratoryId));

      if (!laboratory) {
        return res.status(404).json({ error: "Laboratório não encontrado" });
      }

      // Verificar se o usuário existe
      const [user] = await db
        .select()
        .from('users')
        .where(eq('users.id', req.body.userId));

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const [createdTechnician] = await db
        .insert(laboratoryTechniciansTable)
        .values({
          userId: req.body.userId,
          laboratoryId,
          role: req.body.role,
          specialization: req.body.specialization,
          licenseNumber: req.body.licenseNumber,
          isActive: req.body.isActive ?? true,
        })
        .returning();

      // Registrar na auditoria
      await addAuditLog(
        req.session.user?.id || null,
        laboratoryId,
        null,
        null,
        "create",
        "Técnico adicionado ao laboratório",
        null,
        createdTechnician,
        req.ip,
        req.headers["user-agent"]
      );

      res.status(201).json(createdTechnician);
    } catch (error) {
      console.error("Erro ao adicionar técnico:", error);
      res.status(500).json({ error: "Erro ao adicionar técnico ao laboratório" });
    }
  });

  // ===== AMOSTRAS =====

  // Listar amostras
  router.get("/samples", async (req: Request, res: Response) => {
    try {
      // Filtros opcionais
      const organizationId = req.query.organizationId ? parseInt(req.query.organizationId as string) : undefined;
      const laboratoryId = req.query.laboratoryId ? parseInt(req.query.laboratoryId as string) : undefined;
      const status = req.query.status as string | undefined;
      const trackingNumber = req.query.trackingNumber as string | undefined;
      const sampleType = req.query.sampleType as string | undefined;
      const priority = req.query.priority !== undefined ? req.query.priority === 'true' : undefined;

      let query = db.select({
        id: samplesTable.id,
        trackingNumber: samplesTable.trackingNumber,
        organizationId: samplesTable.organizationId,
        laboratoryId: samplesTable.laboratoryId,
        productName: samplesTable.productName,
        batchNumber: samplesTable.batchNumber,
        productionDate: samplesTable.productionDate,
        expirationDate: samplesTable.expirationDate,
        sampleType: samplesTable.sampleType,
        status: samplesTable.status,
        priority: samplesTable.priority,
        requestedTests: samplesTable.requestedTests,
        receivedAt: samplesTable.receivedAt,
        createdAt: samplesTable.createdAt,
        updatedAt: samplesTable.updatedAt,
        organizationName: sql<string>`organizations.name`,
        laboratoryName: sql<string>`laboratories.name`,
      })
      .from(samplesTable)
      .leftJoin('organizations', eq(samplesTable.organizationId, sql`organizations.id`))
      .leftJoin(laboratoriesTable, eq(samplesTable.laboratoryId, laboratoriesTable.id));

      // Aplicar filtros se fornecidos
      if (organizationId) {
        query = query.where(eq(samplesTable.organizationId, organizationId));
      }
      if (laboratoryId) {
        query = query.where(eq(samplesTable.laboratoryId, laboratoryId));
      }
      if (status) {
        query = query.where(eq(samplesTable.status, status));
      }
      if (trackingNumber) {
        query = query.where(like(samplesTable.trackingNumber, `%${trackingNumber}%`));
      }
      if (sampleType) {
        query = query.where(eq(samplesTable.sampleType, sampleType));
      }
      if (priority !== undefined) {
        query = query.where(eq(samplesTable.priority, priority));
      }

      // Ordenar por data de criação (mais recentes primeiro)
      query = query.orderBy(desc(samplesTable.createdAt));

      const samples = await query;
      res.json(samples);
    } catch (error) {
      console.error("Erro ao listar amostras:", error);
      res.status(500).json({ error: "Erro ao listar amostras" });
    }
  });

  // Obter amostra por ID
  router.get("/samples/:id", async (req: Request, res: Response) => {
    try {
      const sampleId = parseInt(req.params.id);
      
      const [sample] = await db
        .select({
          id: samplesTable.id,
          trackingNumber: samplesTable.trackingNumber,
          organizationId: samplesTable.organizationId,
          laboratoryId: samplesTable.laboratoryId,
          productName: samplesTable.productName,
          batchNumber: samplesTable.batchNumber,
          productionDate: samplesTable.productionDate,
          expirationDate: samplesTable.expirationDate,
          sampleType: samplesTable.sampleType,
          sampleSize: samplesTable.sampleSize,
          sampleUnit: samplesTable.sampleUnit,
          status: samplesTable.status,
          priority: samplesTable.priority,
          requestedTests: samplesTable.requestedTests,
          notes: samplesTable.notes,
          receivedBy: samplesTable.receivedBy,
          receivedAt: samplesTable.receivedAt,
          imageUrl: samplesTable.imageUrl,
          createdAt: samplesTable.createdAt,
          updatedAt: samplesTable.updatedAt,
          organizationName: sql<string>`organizations.name`,
          laboratoryName: sql<string>`laboratories.name`,
        })
        .from(samplesTable)
        .leftJoin('organizations', eq(samplesTable.organizationId, sql`organizations.id`))
        .leftJoin(laboratoriesTable, eq(samplesTable.laboratoryId, laboratoriesTable.id))
        .where(eq(samplesTable.id, sampleId));

      if (!sample) {
        return res.status(404).json({ error: "Amostra não encontrada" });
      }

      const tests = await db
        .select()
        .from(testsTable)
        .where(eq(testsTable.sampleId, sampleId));

      res.json({ ...sample, tests });
    } catch (error) {
      console.error("Erro ao obter amostra:", error);
      res.status(500).json({ error: "Erro ao obter amostra" });
    }
  });

  // Criar amostra
  router.post("/samples", async (req: Request, res: Response) => {
    try {
      const organizationId = req.body.organizationId ?? req.session.user?.organizationId;
      
      if (!organizationId) {
        return res.status(400).json({ error: "ID da organização é obrigatório" });
      }

      // Gerar número de rastreio único se não fornecido
      const trackingNumber = req.body.trackingNumber || generateTrackingNumber();

      const sampleData = {
        ...req.body,
        trackingNumber,
        organizationId,
      };

      const parsedData = insertSampleSchema.parse(sampleData);
      
      const [createdSample] = await db
        .insert(samplesTable)
        .values(parsedData)
        .returning();

      // Para cada tipo de teste solicitado, criar um registro de teste
      if (parsedData.requestedTests && parsedData.requestedTests.length > 0) {
        const testPromises = parsedData.requestedTests.map(testType => {
          return db.insert(testsTable).values({
            sampleId: createdSample.id,
            testType: testType as any,
            status: "pending",
          });
        });

        await Promise.all(testPromises);
      }

      // Registrar na auditoria
      await addAuditLog(
        req.session.user?.id || null,
        parsedData.laboratoryId,
        createdSample.id,
        null,
        "create",
        "Amostra criada",
        null,
        createdSample,
        req.ip,
        req.headers["user-agent"]
      );

      res.status(201).json(createdSample);
    } catch (error) {
      console.error("Erro ao criar amostra:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Erro ao criar amostra" });
    }
  });

  // Atualizar status da amostra
  router.patch("/samples/:id/status", async (req: Request, res: Response) => {
    try {
      const sampleId = parseInt(req.params.id);
      const { status, notes } = req.body;
      
      if (!status || !Object.values(testStatusEnum.enumValues).includes(status)) {
        return res.status(400).json({ error: "Status inválido" });
      }

      // Buscar amostra existente
      const [existingSample] = await db
        .select()
        .from(samplesTable)
        .where(eq(samplesTable.id, sampleId));

      if (!existingSample) {
        return res.status(404).json({ error: "Amostra não encontrada" });
      }

      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      // Adicionar notas se fornecidas
      if (notes) {
        updateData.notes = notes;
      }

      // Se o status for "received", registrar quem recebeu e quando
      if (status === "received") {
        updateData.receivedBy = req.session.user?.id;
        updateData.receivedAt = new Date();
      }

      const [updatedSample] = await db
        .update(samplesTable)
        .set(updateData)
        .where(eq(samplesTable.id, sampleId))
        .returning();

      // Se a amostra foi definida como "rejected" ou "canceled", atualizar todos os testes também
      if (status === "rejected" || status === "canceled") {
        await db
          .update(testsTable)
          .set({
            status: status,
            updatedAt: new Date()
          })
          .where(eq(testsTable.sampleId, sampleId));
      }

      // Registrar na auditoria
      await addAuditLog(
        req.session.user?.id || null,
        existingSample.laboratoryId,
        sampleId,
        null,
        "status_change",
        `Status da amostra alterado de ${existingSample.status} para ${status}`,
        { status: existingSample.status },
        { status },
        req.ip,
        req.headers["user-agent"]
      );

      res.json(updatedSample);
    } catch (error) {
      console.error("Erro ao atualizar status da amostra:", error);
      res.status(500).json({ error: "Erro ao atualizar status da amostra" });
    }
  });

  // ===== TESTES =====

  // Listar testes
  router.get("/tests", async (req: Request, res: Response) => {
    try {
      // Filtros opcionais
      const sampleId = req.query.sampleId ? parseInt(req.query.sampleId as string) : undefined;
      const status = req.query.status as string | undefined;
      const testType = req.query.testType as string | undefined;
      const assignedTo = req.query.assignedTo ? parseInt(req.query.assignedTo as string) : undefined;

      let query = db.select({
        id: testsTable.id,
        sampleId: testsTable.sampleId,
        testType: testsTable.testType,
        status: testsTable.status,
        assignedTo: testsTable.assignedTo,
        startedAt: testsTable.startedAt,
        completedAt: testsTable.completedAt,
        method: testsTable.method,
        equipment: testsTable.equipment,
        reportUrl: testsTable.reportUrl,
        reviewedBy: testsTable.reviewedBy,
        reviewedAt: testsTable.reviewedAt,
        createdAt: testsTable.createdAt,
        updatedAt: testsTable.updatedAt,
        trackingNumber: samplesTable.trackingNumber,
        productName: samplesTable.productName,
        laboratoryId: samplesTable.laboratoryId,
        organizationId: samplesTable.organizationId,
      })
      .from(testsTable)
      .innerJoin(samplesTable, eq(testsTable.sampleId, samplesTable.id));

      // Aplicar filtros se fornecidos
      if (sampleId) {
        query = query.where(eq(testsTable.sampleId, sampleId));
      }
      if (status) {
        query = query.where(eq(testsTable.status, status));
      }
      if (testType) {
        query = query.where(eq(testsTable.testType, testType));
      }
      if (assignedTo) {
        query = query.where(eq(testsTable.assignedTo, assignedTo));
      }

      // Ordenar por data de criação (mais recentes primeiro)
      query = query.orderBy(desc(testsTable.createdAt));

      const tests = await query;
      res.json(tests);
    } catch (error) {
      console.error("Erro ao listar testes:", error);
      res.status(500).json({ error: "Erro ao listar testes" });
    }
  });

  // Obter teste por ID
  router.get("/tests/:id", async (req: Request, res: Response) => {
    try {
      const testId = parseInt(req.params.id);
      
      const [test] = await db
        .select({
          id: testsTable.id,
          sampleId: testsTable.sampleId,
          testType: testsTable.testType,
          status: testsTable.status,
          assignedTo: testsTable.assignedTo,
          startedAt: testsTable.startedAt,
          completedAt: testsTable.completedAt,
          method: testsTable.method,
          equipment: testsTable.equipment,
          results: testsTable.results,
          reportUrl: testsTable.reportUrl,
          notes: testsTable.notes,
          reviewedBy: testsTable.reviewedBy,
          reviewedAt: testsTable.reviewedAt,
          createdAt: testsTable.createdAt,
          updatedAt: testsTable.updatedAt,
          trackingNumber: samplesTable.trackingNumber,
          productName: samplesTable.productName,
          laboratoryId: samplesTable.laboratoryId,
          organizationId: samplesTable.organizationId,
        })
        .from(testsTable)
        .innerJoin(samplesTable, eq(testsTable.sampleId, samplesTable.id))
        .where(eq(testsTable.id, testId));

      if (!test) {
        return res.status(404).json({ error: "Teste não encontrado" });
      }

      // Obter resultados do teste específico baseado no tipo
      let results = null;

      if (test.testType === "cannabinoid_profile") {
        [results] = await db
          .select()
          .from(cannabinoidResultsTable)
          .where(eq(cannabinoidResultsTable.testId, testId));
      } else if (test.testType === "terpene_profile") {
        [results] = await db
          .select()
          .from(terpeneResultsTable)
          .where(eq(terpeneResultsTable.testId, testId));
      } else if (test.testType === "heavy_metals") {
        [results] = await db
          .select()
          .from(heavyMetalsResultsTable)
          .where(eq(heavyMetalsResultsTable.testId, testId));
      }

      res.json({ ...test, detailedResults: results });
    } catch (error) {
      console.error("Erro ao obter teste:", error);
      res.status(500).json({ error: "Erro ao obter teste" });
    }
  });

  // Atribuir teste a um técnico
  router.patch("/tests/:id/assign", async (req: Request, res: Response) => {
    try {
      const testId = parseInt(req.params.id);
      const { assignedTo } = req.body;
      
      if (!assignedTo) {
        return res.status(400).json({ error: "ID do técnico é obrigatório" });
      }

      // Buscar teste existente
      const [existingTest] = await db
        .select()
        .from(testsTable)
        .where(eq(testsTable.id, testId));

      if (!existingTest) {
        return res.status(404).json({ error: "Teste não encontrado" });
      }

      // Verificar se o técnico existe
      const [technician] = await db
        .select()
        .from('users')
        .where(eq('users.id', assignedTo));

      if (!technician) {
        return res.status(404).json({ error: "Técnico não encontrado" });
      }

      const [updatedTest] = await db
        .update(testsTable)
        .set({
          assignedTo,
          updatedAt: new Date()
        })
        .where(eq(testsTable.id, testId))
        .returning();

      // Registrar na auditoria
      await addAuditLog(
        req.session.user?.id || null,
        null,
        existingTest.sampleId,
        testId,
        "assign",
        `Teste atribuído ao técnico ${technician.name}`,
        { assignedTo: existingTest.assignedTo },
        { assignedTo },
        req.ip,
        req.headers["user-agent"]
      );

      res.json(updatedTest);
    } catch (error) {
      console.error("Erro ao atribuir teste:", error);
      res.status(500).json({ error: "Erro ao atribuir teste ao técnico" });
    }
  });

  // Atualizar status do teste
  router.patch("/tests/:id/status", async (req: Request, res: Response) => {
    try {
      const testId = parseInt(req.params.id);
      const { status, notes } = req.body;
      
      if (!status || !Object.values(testStatusEnum.enumValues).includes(status)) {
        return res.status(400).json({ error: "Status inválido" });
      }

      // Buscar teste existente
      const [existingTest] = await db
        .select()
        .from(testsTable)
        .where(eq(testsTable.id, testId));

      if (!existingTest) {
        return res.status(404).json({ error: "Teste não encontrado" });
      }

      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      // Adicionar notas se fornecidas
      if (notes) {
        updateData.notes = notes;
      }

      // Registrar início ou conclusão do teste
      if (status === "in_progress" && !existingTest.startedAt) {
        updateData.startedAt = new Date();
      }
      
      if (status === "completed" && !existingTest.completedAt) {
        updateData.completedAt = new Date();
      }

      if (status === "approved") {
        updateData.reviewedBy = req.session.user?.id;
        updateData.reviewedAt = new Date();
      }

      const [updatedTest] = await db
        .update(testsTable)
        .set(updateData)
        .where(eq(testsTable.id, testId))
        .returning();

      // Verificar se todos os testes da amostra estão completos e aprovados
      if (status === "approved" || status === "completed") {
        const [sample] = await db
          .select()
          .from(samplesTable)
          .where(eq(samplesTable.id, existingTest.sampleId));

        const allTests = await db
          .select()
          .from(testsTable)
          .where(eq(testsTable.sampleId, existingTest.sampleId));

        const allCompleted = allTests.every(test => 
          test.status === "completed" || test.status === "approved");
        
        const allApproved = allTests.every(test => test.status === "approved");

        // Se todos os testes estiverem completos, atualizar a amostra para "completed"
        if (allCompleted && sample.status !== "completed" && sample.status !== "approved") {
          await db
            .update(samplesTable)
            .set({ 
              status: "completed",
              updatedAt: new Date()
            })
            .where(eq(samplesTable.id, existingTest.sampleId));
        }

        // Se todos os testes estiverem aprovados, atualizar a amostra para "approved"
        if (allApproved && sample.status !== "approved") {
          await db
            .update(samplesTable)
            .set({ 
              status: "approved",
              updatedAt: new Date()
            })
            .where(eq(samplesTable.id, existingTest.sampleId));
        }
      }

      // Registrar na auditoria
      await addAuditLog(
        req.session.user?.id || null,
        null,
        existingTest.sampleId,
        testId,
        "status_change",
        `Status do teste alterado de ${existingTest.status} para ${status}`,
        { status: existingTest.status },
        { status },
        req.ip,
        req.headers["user-agent"]
      );

      res.json(updatedTest);
    } catch (error) {
      console.error("Erro ao atualizar status do teste:", error);
      res.status(500).json({ error: "Erro ao atualizar status do teste" });
    }
  });

  // Registrar resultados de canabinoides
  router.post("/tests/:id/cannabinoid-results", async (req: Request, res: Response) => {
    try {
      const testId = parseInt(req.params.id);
      
      // Buscar teste existente
      const [existingTest] = await db
        .select()
        .from(testsTable)
        .where(eq(testsTable.id, testId));

      if (!existingTest) {
        return res.status(404).json({ error: "Teste não encontrado" });
      }

      // Verificar se o tipo de teste é compatível
      if (existingTest.testType !== "cannabinoid_profile") {
        return res.status(400).json({ error: "Tipo de teste incompatível com resultados de canabinoides" });
      }

      // Verificar se já existem resultados
      const existingResults = await db
        .select()
        .from(cannabinoidResultsTable)
        .where(eq(cannabinoidResultsTable.testId, testId));

      let result;

      if (existingResults.length > 0) {
        // Atualizar resultados existentes
        const [updatedResult] = await db
          .update(cannabinoidResultsTable)
          .set({
            ...req.body,
            updatedAt: new Date()
          })
          .where(eq(cannabinoidResultsTable.testId, testId))
          .returning();
        
        result = updatedResult;
      } else {
        // Criar novo registro de resultados
        const [newResult] = await db
          .insert(cannabinoidResultsTable)
          .values({
            testId,
            ...req.body
          })
          .returning();
        
        result = newResult;
      }

      // Atualizar status do teste para completed se não estiver
      if (existingTest.status === "in_progress" || existingTest.status === "pending") {
        await db
          .update(testsTable)
          .set({ 
            status: "completed", 
            completedAt: new Date(),
            results: JSON.stringify(result),
            updatedAt: new Date()
          })
          .where(eq(testsTable.id, testId));
      }

      // Registrar na auditoria
      await addAuditLog(
        req.session.user?.id || null,
        null,
        existingTest.sampleId,
        testId,
        existingResults.length > 0 ? "update" : "create",
        "Resultados de canabinoides registrados",
        existingResults.length > 0 ? existingResults[0] : null,
        result,
        req.ip,
        req.headers["user-agent"]
      );

      res.status(existingResults.length > 0 ? 200 : 201).json(result);
    } catch (error) {
      console.error("Erro ao registrar resultados de canabinoides:", error);
      res.status(500).json({ error: "Erro ao registrar resultados de canabinoides" });
    }
  });

  // Registrar resultados de terpenos
  router.post("/tests/:id/terpene-results", async (req: Request, res: Response) => {
    try {
      const testId = parseInt(req.params.id);
      
      // Buscar teste existente
      const [existingTest] = await db
        .select()
        .from(testsTable)
        .where(eq(testsTable.id, testId));

      if (!existingTest) {
        return res.status(404).json({ error: "Teste não encontrado" });
      }

      // Verificar se o tipo de teste é compatível
      if (existingTest.testType !== "terpene_profile") {
        return res.status(400).json({ error: "Tipo de teste incompatível com resultados de terpenos" });
      }

      // Verificar se já existem resultados
      const existingResults = await db
        .select()
        .from(terpeneResultsTable)
        .where(eq(terpeneResultsTable.testId, testId));

      let result;

      if (existingResults.length > 0) {
        // Atualizar resultados existentes
        const [updatedResult] = await db
          .update(terpeneResultsTable)
          .set({
            ...req.body,
            updatedAt: new Date()
          })
          .where(eq(terpeneResultsTable.testId, testId))
          .returning();
        
        result = updatedResult;
      } else {
        // Criar novo registro de resultados
        const [newResult] = await db
          .insert(terpeneResultsTable)
          .values({
            testId,
            ...req.body
          })
          .returning();
        
        result = newResult;
      }

      // Atualizar status do teste para completed se não estiver
      if (existingTest.status === "in_progress" || existingTest.status === "pending") {
        await db
          .update(testsTable)
          .set({ 
            status: "completed", 
            completedAt: new Date(),
            results: JSON.stringify(result),
            updatedAt: new Date()
          })
          .where(eq(testsTable.id, testId));
      }

      // Registrar na auditoria
      await addAuditLog(
        req.session.user?.id || null,
        null,
        existingTest.sampleId,
        testId,
        existingResults.length > 0 ? "update" : "create",
        "Resultados de terpenos registrados",
        existingResults.length > 0 ? existingResults[0] : null,
        result,
        req.ip,
        req.headers["user-agent"]
      );

      res.status(existingResults.length > 0 ? 200 : 201).json(result);
    } catch (error) {
      console.error("Erro ao registrar resultados de terpenos:", error);
      res.status(500).json({ error: "Erro ao registrar resultados de terpenos" });
    }
  });

  // Registrar resultados de metais pesados
  router.post("/tests/:id/heavy-metals-results", async (req: Request, res: Response) => {
    try {
      const testId = parseInt(req.params.id);
      
      // Buscar teste existente
      const [existingTest] = await db
        .select()
        .from(testsTable)
        .where(eq(testsTable.id, testId));

      if (!existingTest) {
        return res.status(404).json({ error: "Teste não encontrado" });
      }

      // Verificar se o tipo de teste é compatível
      if (existingTest.testType !== "heavy_metals") {
        return res.status(400).json({ error: "Tipo de teste incompatível com resultados de metais pesados" });
      }

      // Verificar se já existem resultados
      const existingResults = await db
        .select()
        .from(heavyMetalsResultsTable)
        .where(eq(heavyMetalsResultsTable.testId, testId));

      let result;

      if (existingResults.length > 0) {
        // Atualizar resultados existentes
        const [updatedResult] = await db
          .update(heavyMetalsResultsTable)
          .set({
            ...req.body,
            updatedAt: new Date()
          })
          .where(eq(heavyMetalsResultsTable.testId, testId))
          .returning();
        
        result = updatedResult;
      } else {
        // Criar novo registro de resultados
        const [newResult] = await db
          .insert(heavyMetalsResultsTable)
          .values({
            testId,
            ...req.body
          })
          .returning();
        
        result = newResult;
      }

      // Atualizar status do teste para completed se não estiver
      if (existingTest.status === "in_progress" || existingTest.status === "pending") {
        await db
          .update(testsTable)
          .set({ 
            status: "completed", 
            completedAt: new Date(),
            results: JSON.stringify(result),
            updatedAt: new Date()
          })
          .where(eq(testsTable.id, testId));
      }

      // Registrar na auditoria
      await addAuditLog(
        req.session.user?.id || null,
        null,
        existingTest.sampleId,
        testId,
        existingResults.length > 0 ? "update" : "create",
        "Resultados de metais pesados registrados",
        existingResults.length > 0 ? existingResults[0] : null,
        result,
        req.ip,
        req.headers["user-agent"]
      );

      res.status(existingResults.length > 0 ? 200 : 201).json(result);
    } catch (error) {
      console.error("Erro ao registrar resultados de metais pesados:", error);
      res.status(500).json({ error: "Erro ao registrar resultados de metais pesados" });
    }
  });

  // Rastreamento de amostra por número de rastreio
  router.get("/track/:trackingNumber", async (req: Request, res: Response) => {
    try {
      const { trackingNumber } = req.params;
      
      const [sample] = await db
        .select({
          id: samplesTable.id,
          trackingNumber: samplesTable.trackingNumber,
          productName: samplesTable.productName,
          batchNumber: samplesTable.batchNumber,
          sampleType: samplesTable.sampleType,
          status: samplesTable.status,
          receivedAt: samplesTable.receivedAt,
          createdAt: samplesTable.createdAt,
          updatedAt: samplesTable.updatedAt,
          organizationName: sql<string>`organizations.name`,
          laboratoryName: sql<string>`laboratories.name`,
        })
        .from(samplesTable)
        .leftJoin('organizations', eq(samplesTable.organizationId, sql`organizations.id`))
        .leftJoin(laboratoriesTable, eq(samplesTable.laboratoryId, laboratoriesTable.id))
        .where(eq(samplesTable.trackingNumber, trackingNumber));

      if (!sample) {
        return res.status(404).json({ error: "Amostra não encontrada" });
      }

      const tests = await db
        .select({
          id: testsTable.id,
          testType: testsTable.testType,
          status: testsTable.status,
          startedAt: testsTable.startedAt,
          completedAt: testsTable.completedAt,
          reportUrl: testsTable.reportUrl,
        })
        .from(testsTable)
        .where(eq(testsTable.sampleId, sample.id));

      // Obter detalhes de auditoria para criar timeline
      const auditLogs = await db
        .select({
          action: laboratoryAuditLogsTable.action,
          details: laboratoryAuditLogsTable.details,
          performedAt: laboratoryAuditLogsTable.performedAt,
          userName: sql<string>`users.name`,
        })
        .from(laboratoryAuditLogsTable)
        .leftJoin('users', eq(laboratoryAuditLogsTable.userId, sql`users.id`))
        .where(
          eq(laboratoryAuditLogsTable.sampleId, sample.id)
        )
        .orderBy(desc(laboratoryAuditLogsTable.performedAt));

      res.json({
        sample,
        tests,
        timeline: auditLogs
      });
    } catch (error) {
      console.error("Erro ao rastrear amostra:", error);
      res.status(500).json({ error: "Erro ao rastrear amostra" });
    }
  });

  // Dashboard e estatísticas
  router.get("/dashboard", async (req: Request, res: Response) => {
    try {
      // Obtém o ID do laboratório baseado no usuário ou query parameter
      const laboratoryId = req.query.laboratoryId ? 
        parseInt(req.query.laboratoryId as string) : 
        (req.session.user?.organizationId || null);

      // Estatísticas de amostras por status
      const samplesByStatus = await db
        .select({
          status: samplesTable.status,
          count: sql<number>`count(*)`,
        })
        .from(samplesTable)
        .where(laboratoryId ? eq(samplesTable.laboratoryId, laboratoryId) : sql`1=1`)
        .groupBy(samplesTable.status);

      // Estatísticas de testes por status
      const testsByStatus = await db
        .select({
          status: testsTable.status,
          count: sql<number>`count(*)`,
        })
        .from(testsTable)
        .innerJoin(samplesTable, eq(testsTable.sampleId, samplesTable.id))
        .where(laboratoryId ? eq(samplesTable.laboratoryId, laboratoryId) : sql`1=1`)
        .groupBy(testsTable.status);

      // Amostras recebidas por dia (últimos 30 dias)
      const samplesReceivedByDay = await db
        .select({
          date: sql<string>`date_trunc('day', ${samplesTable.receivedAt})::date`,
          count: sql<number>`count(*)`,
        })
        .from(samplesTable)
        .where(
          and(
            isNotNull(samplesTable.receivedAt),
            sql`${samplesTable.receivedAt} >= now() - interval '30 days'`,
            laboratoryId ? eq(samplesTable.laboratoryId, laboratoryId) : sql`1=1`
          )
        )
        .groupBy(sql`date_trunc('day', ${samplesTable.receivedAt})::date`)
        .orderBy(sql`date_trunc('day', ${samplesTable.receivedAt})::date`);

      // Tempo médio de processamento (em horas) por tipo de teste
      const avgProcessingTimeByTestType = await db
        .select({
          testType: testsTable.testType,
          avgTime: sql<number>`avg(extract(epoch from (${testsTable.completedAt} - ${testsTable.startedAt})) / 3600)`,
        })
        .from(testsTable)
        .innerJoin(samplesTable, eq(testsTable.sampleId, samplesTable.id))
        .where(
          and(
            isNotNull(testsTable.completedAt),
            isNotNull(testsTable.startedAt),
            laboratoryId ? eq(samplesTable.laboratoryId, laboratoryId) : sql`1=1`
          )
        )
        .groupBy(testsTable.testType);

      // Amostras por tipo
      const samplesByType = await db
        .select({
          sampleType: samplesTable.sampleType,
          count: sql<number>`count(*)`,
        })
        .from(samplesTable)
        .where(laboratoryId ? eq(samplesTable.laboratoryId, laboratoryId) : sql`1=1`)
        .groupBy(samplesTable.sampleType);

      // Testes por tipo
      const testsByType = await db
        .select({
          testType: testsTable.testType,
          count: sql<number>`count(*)`,
        })
        .from(testsTable)
        .innerJoin(samplesTable, eq(testsTable.sampleId, samplesTable.id))
        .where(laboratoryId ? eq(samplesTable.laboratoryId, laboratoryId) : sql`1=1`)
        .groupBy(testsTable.testType);

      // Amostras aguardando análise (por mais de 3 dias)
      const samplesPendingTooLong = await db
        .select({
          id: samplesTable.id,
          trackingNumber: samplesTable.trackingNumber,
          productName: samplesTable.productName,
          createdAt: samplesTable.createdAt,
          status: samplesTable.status,
          organizationName: sql<string>`organizations.name`,
          waitingDays: sql<number>`extract(day from (now() - ${samplesTable.createdAt}))`,
        })
        .from(samplesTable)
        .leftJoin('organizations', eq(samplesTable.organizationId, sql`organizations.id`))
        .where(
          and(
            sql`${samplesTable.createdAt} < now() - interval '3 days'`,
            sql`${samplesTable.status} in ('pending', 'received')`,
            laboratoryId ? eq(samplesTable.laboratoryId, laboratoryId) : sql`1=1`
          )
        )
        .orderBy(desc(sql`extract(day from (now() - ${samplesTable.createdAt}))`))
        .limit(10);

      res.json({
        samplesByStatus,
        testsByStatus,
        samplesReceivedByDay,
        avgProcessingTimeByTestType,
        samplesByType,
        testsByType,
        samplesPendingTooLong,
      });
    } catch (error) {
      console.error("Erro ao obter estatísticas do dashboard:", error);
      res.status(500).json({ error: "Erro ao obter estatísticas do dashboard" });
    }
  });

  // Registrar as rotas no app
  app.use("/api/laboratory", router);
  
  console.log("Rotas do módulo de laboratório registradas");
  return app;
}