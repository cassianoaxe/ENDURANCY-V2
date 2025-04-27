import { Express, Request, Response } from "express";
import { db } from "../db";
import { eq, and, desc, asc, gte, lte, like, sql } from "drizzle-orm";
import { 
  laboratories, 
  samples, 
  tests, 
  cannabinoidResults, 
  terpeneResults, 
  insertLaboratorySchema, 
  insertSampleSchema, 
  insertTestSchema, 
  insertCannabinoidResultSchema, 
  insertTerpeneResultSchema 
} from "../../shared/schema-laboratory";
import { formatDate, generateRandomString } from "../utils";
import { z } from "zod";
import { users } from "../../shared/schema";
import { authenticate } from "../routes";

export async function registerLaboratoryRoutes(app: Express) {
  // Rota alternativa para contornar o problema do middleware Vite
  app.get('/api/lab-dashboard', authenticate, async (req: Request, res: Response) => {
    try {
      if (!req.session.user || (req.session.user.role !== 'laboratory' && req.session.user.role !== 'admin')) {
        return res.status(403).json({ message: "Acesso não autorizado" });
      }

      const userId = req.session.user.id;
      let laboratoryId: number | null = null;

      // Obter o laboratório associado ao usuário
      const userLaboratory = await db.select().from(laboratories).where(eq(laboratories.userId, userId)).limit(1);
      
      if (userLaboratory.length > 0) {
        laboratoryId = userLaboratory[0].id;
      } else if (req.session.user.role === 'admin') {
        // Administradores podem visualizar dados de qualquer laboratório
        // Para simplificar, vamos pegar o primeiro
        const allLaboratories = await db.select().from(laboratories).limit(1);
        if (allLaboratories.length > 0) {
          laboratoryId = allLaboratories[0].id;
        }
      }

      if (!laboratoryId) {
        return res.status(404).json({ message: "Laboratório não encontrado" });
      }

      // Estatísticas de amostras por status
      const samplesByStatusResult = await db.execute(sql`
        SELECT status, COUNT(*) as count
        FROM samples
        WHERE laboratory_id = ${laboratoryId}
        GROUP BY status
      `);

      // Amostras recebidas por dia (últimos 30 dias)
      const samplesReceivedByDayResult = await db.execute(sql`
        SELECT DATE(received_date) as date, COUNT(*) as count
        FROM samples
        WHERE laboratory_id = ${laboratoryId}
          AND received_date IS NOT NULL
          AND received_date >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(received_date)
        ORDER BY date
      `);

      // Tempo médio de processamento por tipo de teste
      const avgProcessingTimeByTestTypeResult = await db.execute(sql`
        SELECT test_type, 
               AVG(EXTRACT(EPOCH FROM (result_date - received_date))/3600)::numeric(10,2) as avg_hours
        FROM tests t
        JOIN samples s ON t.sample_id = s.id
        WHERE t.laboratory_id = ${laboratoryId}
          AND s.received_date IS NOT NULL
          AND t.result_date IS NOT NULL
        GROUP BY test_type
        ORDER BY avg_hours DESC
      `);

      // Amostras pendentes há muito tempo (mais de 7 dias)
      const samplesPendingTooLongResult = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM samples
        WHERE laboratory_id = ${laboratoryId}
          AND status = 'pending'
          AND created_at < NOW() - INTERVAL '7 days'
      `);

      // Formatar os dados para um formato que o frontend espera
      const samplesByStatus = samplesByStatusResult.rows || [];
      const samplesReceivedByDay = samplesReceivedByDayResult.rows || [];
      const avgProcessingTimeByTestType = avgProcessingTimeByTestTypeResult.rows || [];
      const samplesPendingTooLong = parseInt(samplesPendingTooLongResult.rows?.[0]?.count || '0');

      // Dashboard completo
      const dashboardData = {
        samplesByStatus,
        samplesReceivedByDay,
        avgProcessingTimeByTestType,
        samplesPendingTooLong,
        // Adicione mais estatísticas conforme necessário
      };

      res.json(dashboardData);
    } catch (error) {
      console.error("Erro ao obter dados do dashboard do laboratório:", error);
      res.status(500).json({ message: "Erro ao processar a solicitação" });
    }
  });

  // Rota para obter os dados do dashboard do laboratório
  // Rota original
  app.get('/api/laboratory/dashboard', authenticate, async (req: Request, res: Response) => {
    try {
      if (!req.session.user || (req.session.user.role !== 'laboratory' && req.session.user.role !== 'admin')) {
        return res.status(403).json({ message: "Acesso não autorizado" });
      }

      const userId = req.session.user.id;
      let laboratoryId: number | null = null;

      // Obter o laboratório associado ao usuário
      const userLaboratory = await db.select().from(laboratories).where(eq(laboratories.userId, userId)).limit(1);
      
      if (userLaboratory.length > 0) {
        laboratoryId = userLaboratory[0].id;
      } else if (req.session.user.role === 'admin') {
        // Administradores podem visualizar dados de qualquer laboratório
        // Para simplificar, vamos pegar o primeiro
        const allLaboratories = await db.select().from(laboratories).limit(1);
        if (allLaboratories.length > 0) {
          laboratoryId = allLaboratories[0].id;
        }
      }

      if (!laboratoryId) {
        return res.status(404).json({ message: "Laboratório não encontrado" });
      }

      // Estatísticas de amostras por status
      const samplesByStatusResult = await db.execute(sql`
        SELECT status, COUNT(*) as count
        FROM samples
        WHERE laboratory_id = ${laboratoryId}
        GROUP BY status
      `);

      // Amostras recebidas por dia (últimos 30 dias)
      const samplesReceivedByDayResult = await db.execute(sql`
        SELECT DATE(received_date) as date, COUNT(*) as count
        FROM samples
        WHERE laboratory_id = ${laboratoryId}
          AND received_date IS NOT NULL
          AND received_date >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(received_date)
        ORDER BY date
      `);

      // Tempo médio de processamento por tipo de teste
      const avgProcessingTimeByTestTypeResult = await db.execute(sql`
        SELECT test_type, 
               AVG(EXTRACT(EPOCH FROM (result_date - received_date))/3600)::numeric(10,2) as avg_hours
        FROM tests t
        JOIN samples s ON t.sample_id = s.id
        WHERE t.laboratory_id = ${laboratoryId}
          AND s.received_date IS NOT NULL
          AND t.result_date IS NOT NULL
        GROUP BY test_type
        ORDER BY avg_hours DESC
      `);

      // Amostras pendentes há muito tempo (mais de 7 dias)
      const samplesPendingTooLongResult = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM samples
        WHERE laboratory_id = ${laboratoryId}
          AND status = 'pending'
          AND created_at < NOW() - INTERVAL '7 days'
      `);

      // Formatar os dados para um formato que o frontend espera
      const samplesByStatus = samplesByStatusResult.rows || [];
      const samplesReceivedByDay = samplesReceivedByDayResult.rows || [];
      const avgProcessingTimeByTestType = avgProcessingTimeByTestTypeResult.rows || [];
      const samplesPendingTooLong = parseInt(samplesPendingTooLongResult.rows?.[0]?.count || '0');

      // Dashboard completo
      const dashboardData = {
        samplesByStatus,
        samplesReceivedByDay,
        avgProcessingTimeByTestType,
        samplesPendingTooLong,
        // Adicione mais estatísticas conforme necessário
      };

      res.json(dashboardData);
    } catch (error) {
      console.error("Erro ao obter dados do dashboard do laboratório:", error);
      res.status(500).json({ message: "Erro ao processar a solicitação" });
    }
  });

  // Rota para listar as amostras do laboratório
  app.get('/api/laboratory/samples', authenticate, async (req: Request, res: Response) => {
    try {
      if (!req.session.user || (req.session.user.role !== 'laboratory' && req.session.user.role !== 'admin')) {
        return res.status(403).json({ message: "Acesso não autorizado" });
      }

      const userId = req.session.user.id;
      let laboratoryId: number | null = null;

      // Obter o laboratório associado ao usuário
      const userLaboratory = await db.select().from(laboratories).where(eq(laboratories.userId, userId)).limit(1);
      
      if (userLaboratory.length > 0) {
        laboratoryId = userLaboratory[0].id;
      } else if (req.session.user.role === 'admin') {
        // Para admin, verificar se foi passado um ID específico de laboratório
        const requestedLaboratoryId = req.query.laboratoryId ? Number(req.query.laboratoryId) : null;
        if (requestedLaboratoryId) {
          const lab = await db.select().from(laboratories).where(eq(laboratories.id, requestedLaboratoryId)).limit(1);
          if (lab.length > 0) {
            laboratoryId = lab[0].id;
          }
        } else {
          // Pegar o primeiro laboratório para exibição
          const allLaboratories = await db.select().from(laboratories).limit(1);
          if (allLaboratories.length > 0) {
            laboratoryId = allLaboratories[0].id;
          }
        }
      }

      if (!laboratoryId) {
        return res.status(404).json({ message: "Laboratório não encontrado" });
      }

      // Parâmetros de filtro e paginação
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = (page - 1) * limit;
      
      const status = req.query.status as string || null;
      const sampleType = req.query.sampleType as string || null;
      const searchTerm = req.query.search as string || null;

      // Construir a consulta SQL
      let query = sql`
        SELECT s.*, o.name as organization_name, u.name as created_by_name, 
               (SELECT COUNT(*) FROM tests WHERE sample_id = s.id) as tests_count
        FROM samples s
        LEFT JOIN organizations o ON s.organization_id = o.id
        LEFT JOIN users u ON s.created_by = u.id
        WHERE s.laboratory_id = ${laboratoryId}
      `;

      // Adicionar filtros
      if (status) {
        query = sql`${query} AND s.status = ${status}`;
      }
      
      if (sampleType) {
        query = sql`${query} AND s.sample_type = ${sampleType}`;
      }
      
      if (searchTerm) {
        query = sql`${query} AND (
          s.code ILIKE ${`%${searchTerm}%`} OR 
          s.batch_number ILIKE ${`%${searchTerm}%`} OR
          o.name ILIKE ${`%${searchTerm}%`}
        )`;
      }
      
      // Contar total de resultados para paginação
      const countQuery = sql`SELECT COUNT(*) FROM (${query}) AS count_query`;
      const countResult = await db.execute(countQuery);
      const totalCount = parseInt(countResult.rows[0]?.count || '0');
      
      // Adicionar ordenação e limites
      query = sql`${query} ORDER BY s.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      
      const samples = await db.execute(query);
      
      // Retornar resultados com metadados de paginação
      res.json({
        data: samples.rows,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      console.error("Erro ao listar amostras do laboratório:", error);
      res.status(500).json({ message: "Erro ao processar a solicitação" });
    }
  });

  // Rota para obter detalhes de uma amostra específica
  app.get('/api/laboratory/samples/:id', authenticate, async (req: Request, res: Response) => {
    try {
      if (!req.session.user || (req.session.user.role !== 'laboratory' && req.session.user.role !== 'admin')) {
        return res.status(403).json({ message: "Acesso não autorizado" });
      }

      const sampleId = parseInt(req.params.id);
      const userId = req.session.user.id;
      
      // Verificar se o laboratório tem acesso a esta amostra
      const sample = await db.execute(sql`
        SELECT s.*, o.name as organization_name, u.name as created_by_name,
               l.name as laboratory_name
        FROM samples s
        LEFT JOIN organizations o ON s.organization_id = o.id
        LEFT JOIN users u ON s.created_by = u.id
        LEFT JOIN laboratories l ON s.laboratory_id = l.id
        WHERE s.id = ${sampleId}
      `);

      if (sample.length === 0) {
        return res.status(404).json({ message: "Amostra não encontrada" });
      }

      // Verificar se o usuário tem acesso a esta amostra
      if (req.session.user.role !== 'admin') {
        const laboratoryResult = await db.select().from(laboratories)
          .where(eq(laboratories.userId, userId))
          .limit(1);
          
        if (laboratoryResult.length === 0 || laboratoryResult[0].id !== sample[0].laboratory_id) {
          return res.status(403).json({ message: "Você não tem permissão para acessar esta amostra" });
        }
      }

      // Obter os testes associados à amostra
      const sampleTests = await db.execute(sql`
        SELECT t.*, 
               u1.name as technician_name,
               u2.name as approved_by_name
        FROM tests t
        LEFT JOIN users u1 ON t.technician_id = u1.id
        LEFT JOIN users u2 ON t.approved_by = u2.id
        WHERE t.sample_id = ${sampleId}
        ORDER BY t.created_at DESC
      `);

      // Para cada teste, obter os resultados detalhados
      const testsWithResults = await Promise.all(sampleTests.map(async (test: any) => {
        let results = null;
        
        if (test.test_type === 'cannabinoid_profile') {
          const cannabinoidResult = await db.select()
            .from(cannabinoidResults)
            .where(eq(cannabinoidResults.testId, test.id))
            .limit(1);
            
          if (cannabinoidResult.length > 0) {
            results = cannabinoidResult[0];
          }
        } else if (test.test_type === 'terpene_profile') {
          const terpeneResult = await db.select()
            .from(terpeneResults)
            .where(eq(terpeneResults.testId, test.id))
            .limit(1);
            
          if (terpeneResult.length > 0) {
            results = terpeneResult[0];
          }
        } else {
          // Para outros tipos de teste, usar os dados JSON genéricos
          results = test.result_data;
        }
        
        return {
          ...test,
          results
        };
      }));

      // Retornar dados completos da amostra com seus testes
      res.json({
        sample: sample[0],
        tests: testsWithResults,
      });
    } catch (error) {
      console.error("Erro ao obter detalhes da amostra:", error);
      res.status(500).json({ message: "Erro ao processar a solicitação" });
    }
  });

  // Rota para atualizar o status de uma amostra
  app.put('/api/laboratory/samples/:id/status', authenticate, async (req: Request, res: Response) => {
    try {
      if (!req.session.user || (req.session.user.role !== 'laboratory' && req.session.user.role !== 'admin')) {
        return res.status(403).json({ message: "Acesso não autorizado" });
      }

      const sampleId = parseInt(req.params.id);
      const userId = req.session.user.id;
      
      // Validar o novo status
      const updateSchema = z.object({
        status: z.enum(['pending', 'received', 'in_progress', 'completed', 'approved', 'rejected', 'canceled']),
        notes: z.string().optional(),
      });
      
      const validationResult = updateSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Dados inválidos", errors: validationResult.error.errors });
      }
      
      const { status, notes } = validationResult.data;
      
      // Verificar se o laboratório tem acesso a esta amostra
      if (req.session.user.role !== 'admin') {
        const laboratoryResult = await db.select().from(laboratories)
          .where(eq(laboratories.userId, userId))
          .limit(1);
          
        if (laboratoryResult.length === 0) {
          return res.status(403).json({ message: "Você não tem permissão para atualizar esta amostra" });
        }
        
        const laboratoryId = laboratoryResult[0].id;
        
        const sampleCheck = await db.select()
          .from(samples)
          .where(and(
            eq(samples.id, sampleId),
            eq(samples.laboratoryId, laboratoryId)
          ))
          .limit(1);
          
        if (sampleCheck.length === 0) {
          return res.status(403).json({ message: "Você não tem permissão para atualizar esta amostra" });
        }
      }
      
      // Atualizar campos específicos de acordo com o novo status
      const updateData: any = {
        status,
      };
      
      if (notes) {
        updateData.notes = notes;
      }
      
      // Atualizar campos de data com base no status
      if (status === 'received') {
        updateData.receivedDate = new Date();
      } else if (status === 'completed' || status === 'approved') {
        updateData.completedDate = new Date();
      }
      
      // Atualizar a amostra
      await db.update(samples)
        .set(updateData)
        .where(eq(samples.id, sampleId));
      
      // Obter a amostra atualizada
      const updatedSample = await db.select()
        .from(samples)
        .where(eq(samples.id, sampleId))
        .limit(1);
      
      res.json({
        message: "Status da amostra atualizado com sucesso",
        sample: updatedSample[0]
      });
    } catch (error) {
      console.error("Erro ao atualizar status da amostra:", error);
      res.status(500).json({ message: "Erro ao processar a solicitação" });
    }
  });
  
  // Rota para listar todos os testes
  app.get('/api/laboratory/tests', authenticate, async (req: Request, res: Response) => {
    try {
      if (!req.session.user || (req.session.user.role !== 'laboratory' && req.session.user.role !== 'admin')) {
        return res.status(403).json({ message: "Acesso não autorizado" });
      }

      const userId = req.session.user.id;
      let laboratoryId: number | null = null;

      // Obter o laboratório associado ao usuário
      const userLaboratory = await db.select().from(laboratories).where(eq(laboratories.userId, userId)).limit(1);
      
      if (userLaboratory.length > 0) {
        laboratoryId = userLaboratory[0].id;
      } else if (req.session.user.role === 'admin') {
        // Para admin, verificar se foi passado um ID específico de laboratório
        const requestedLaboratoryId = req.query.laboratoryId ? Number(req.query.laboratoryId) : null;
        if (requestedLaboratoryId) {
          const lab = await db.select().from(laboratories).where(eq(laboratories.id, requestedLaboratoryId)).limit(1);
          if (lab.length > 0) {
            laboratoryId = lab[0].id;
          }
        } else {
          // Pegar o primeiro laboratório para exibição
          const allLaboratories = await db.select().from(laboratories).limit(1);
          if (allLaboratories.length > 0) {
            laboratoryId = allLaboratories[0].id;
          }
        }
      }

      if (!laboratoryId) {
        return res.status(404).json({ message: "Laboratório não encontrado" });
      }

      // Parâmetros de filtro e paginação
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const offset = (page - 1) * limit;
      
      const status = req.query.status as string || null;
      const testType = req.query.testType as string || null;
      const sampleId = req.query.sampleId ? parseInt(req.query.sampleId as string) : null;

      // Construir a consulta SQL
      let query = sql`
        SELECT t.*, s.code as sample_code, s.sample_type,
               u1.name as technician_name, u2.name as approved_by_name
        FROM tests t
        JOIN samples s ON t.sample_id = s.id
        LEFT JOIN users u1 ON t.technician_id = u1.id
        LEFT JOIN users u2 ON t.approved_by = u2.id
        WHERE t.laboratory_id = ${laboratoryId}
      `;

      // Adicionar filtros
      if (status) {
        query = sql`${query} AND t.status = ${status}`;
      }
      
      if (testType) {
        query = sql`${query} AND t.test_type = ${testType}`;
      }
      
      if (sampleId) {
        query = sql`${query} AND t.sample_id = ${sampleId}`;
      }
      
      // Contar total de resultados para paginação
      const countQuery = sql`SELECT COUNT(*) FROM (${query}) AS count_query`;
      const countResult = await db.execute(countQuery);
      const totalCount = parseInt(countResult.rows[0]?.count || '0');
      
      // Adicionar ordenação e limites
      query = sql`${query} ORDER BY t.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      
      const testsResult = await db.execute(query);
      
      // Retornar resultados com metadados de paginação
      res.json({
        data: testsResult.rows,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      console.error("Erro ao listar testes do laboratório:", error);
      res.status(500).json({ message: "Erro ao processar a solicitação" });
    }
  });

  // Rota para adicionar um novo teste a uma amostra
  app.post('/api/laboratory/samples/:id/tests', authenticate, async (req: Request, res: Response) => {
    try {
      if (!req.session.user || (req.session.user.role !== 'laboratory' && req.session.user.role !== 'admin')) {
        return res.status(403).json({ message: "Acesso não autorizado" });
      }

      const sampleId = parseInt(req.params.id);
      const userId = req.session.user.id;
      
      // Validar os dados do teste
      const testSchema = z.object({
        testType: z.enum([
          'cannabinoid_profile', 'terpene_profile', 'heavy_metals', 'pesticides', 
          'microbials', 'residual_solvents', 'mycotoxins', 'water_activity', 
          'moisture_content', 'foreign_matter', 'visual_inspection', 'full_panel'
        ]),
        notes: z.string().optional(),
      });
      
      const validationResult = testSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Dados inválidos", errors: validationResult.error.errors });
      }
      
      const { testType, notes } = validationResult.data;
      
      // Verificar se a amostra existe e pertence ao laboratório do usuário
      let laboratoryId: number | null = null;
      
      if (req.session.user.role === 'laboratory') {
        const laboratoryResult = await db.select().from(laboratories)
          .where(eq(laboratories.userId, userId))
          .limit(1);
          
        if (laboratoryResult.length === 0) {
          return res.status(403).json({ message: "Você não tem um laboratório associado" });
        }
        
        laboratoryId = laboratoryResult[0].id;
        
        // Verificar se a amostra pertence a este laboratório
        const sampleCheck = await db.select()
          .from(samples)
          .where(and(
            eq(samples.id, sampleId),
            eq(samples.laboratoryId, laboratoryId)
          ))
          .limit(1);
          
        if (sampleCheck.length === 0) {
          return res.status(403).json({ message: "Amostra não encontrada ou não pertence ao seu laboratório" });
        }
      } else {
        // Para administradores, apenas verificar se a amostra existe
        const sampleCheck = await db.select()
          .from(samples)
          .where(eq(samples.id, sampleId))
          .limit(1);
          
        if (sampleCheck.length === 0) {
          return res.status(404).json({ message: "Amostra não encontrada" });
        }
        
        laboratoryId = sampleCheck[0].laboratoryId;
      }
      
      // Criar o novo teste
      const newTest = await db.insert(tests)
        .values({
          sampleId,
          laboratoryId,
          testType,
          status: 'pending',
          technicianId: userId,
          notes: notes || null,
        })
        .returning();
      
      // Atualizar o status da amostra para 'in_progress' se ainda estiver pendente
      const sampleResult = await db.select()
        .from(samples)
        .where(eq(samples.id, sampleId))
        .limit(1);
        
      if (sampleResult.length > 0 && sampleResult[0].status === 'pending') {
        await db.update(samples)
          .set({ status: 'in_progress' })
          .where(eq(samples.id, sampleId));
      }
      
      res.status(201).json({
        message: "Teste adicionado com sucesso",
        test: newTest[0]
      });
    } catch (error) {
      console.error("Erro ao adicionar teste à amostra:", error);
      res.status(500).json({ message: "Erro ao processar a solicitação" });
    }
  });

  // Rota para atualizar os resultados de um teste
  app.put('/api/laboratory/tests/:id/results', authenticate, async (req: Request, res: Response) => {
    try {
      if (!req.session.user || (req.session.user.role !== 'laboratory' && req.session.user.role !== 'admin')) {
        return res.status(403).json({ message: "Acesso não autorizado" });
      }

      const testId = parseInt(req.params.id);
      const userId = req.session.user.id;
      
      // Obter informações do teste
      const testResult = await db.select()
        .from(tests)
        .where(eq(tests.id, testId))
        .limit(1);
      
      if (testResult.length === 0) {
        return res.status(404).json({ message: "Teste não encontrado" });
      }
      
      const test = testResult[0];
      
      // Verificar se o usuário tem permissão para atualizar este teste
      if (req.session.user.role !== 'admin') {
        const laboratoryResult = await db.select().from(laboratories)
          .where(eq(laboratories.userId, userId))
          .limit(1);
          
        if (laboratoryResult.length === 0 || laboratoryResult[0].id !== test.laboratoryId) {
          return res.status(403).json({ message: "Você não tem permissão para atualizar este teste" });
        }
      }
      
      // Validar os dados específicos de acordo com o tipo de teste
      let validationSchema: z.ZodType<any>;
      const testType = test.testType;
      
      if (testType === 'cannabinoid_profile') {
        validationSchema = z.object({
          status: z.enum(['pending', 'in_progress', 'completed', 'approved', 'rejected']),
          thc: z.number().optional(),
          thca: z.number().optional(),
          d9Thc: z.number().optional(),
          d8Thc: z.number().optional(),
          thcv: z.number().optional(),
          cbd: z.number().optional(),
          cbda: z.number().optional(),
          cbg: z.number().optional(),
          cbga: z.number().optional(),
          cbn: z.number().optional(),
          cbc: z.number().optional(),
          totalCannabinoids: z.number().optional(),
          totalThc: z.number().optional(),
          totalCbd: z.number().optional(),
          notes: z.string().optional(),
        });
      } else if (testType === 'terpene_profile') {
        validationSchema = z.object({
          status: z.enum(['pending', 'in_progress', 'completed', 'approved', 'rejected']),
          resultData: z.record(z.string(), z.number()).optional(),
          totalTerpenes: z.number().optional(),
          notes: z.string().optional(),
        });
      } else {
        // Para outros tipos de teste, usar um schema genérico
        validationSchema = z.object({
          status: z.enum(['pending', 'in_progress', 'completed', 'approved', 'rejected']),
          resultData: z.record(z.string(), z.any()).optional(),
          notes: z.string().optional(),
        });
      }
      
      const validationResult = validationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Dados inválidos", errors: validationResult.error.errors });
      }
      
      const { status, notes, ...resultData } = validationResult.data;
      
      // Iniciar uma transação para atualizar os dados
      try {
        // Atualizar o teste
        const updateData: any = {
          status,
          notes: notes || test.notes,
        };
        
        // Se o status mudou para completed ou approved, definir a data do resultado
        if ((status === 'completed' || status === 'approved') && !test.resultDate) {
          updateData.resultDate = new Date();
        }
        
        // Se o status mudou para approved, definir quem aprovou
        if (status === 'approved' && !test.approvedBy) {
          updateData.approvedBy = userId;
          updateData.approvalDate = new Date();
        }
        
        await db.update(tests)
          .set(updateData)
          .where(eq(tests.id, testId));
        
        // Atualizar os dados de resultado específicos por tipo de teste
        if (testType === 'cannabinoid_profile') {
          const { thc, thca, d9Thc, d8Thc, thcv, cbd, cbda, cbg, cbga, cbn, cbc, totalCannabinoids, totalThc, totalCbd } = resultData;
          
          // Verificar se já existe um resultado para este teste
          const existingResult = await db.select()
            .from(cannabinoidResults)
            .where(eq(cannabinoidResults.testId, testId))
            .limit(1);
          
          if (existingResult.length > 0) {
            // Atualizar resultado existente
            await db.update(cannabinoidResults)
              .set({
                thc: thc !== undefined ? thc : existingResult[0].thc,
                thca: thca !== undefined ? thca : existingResult[0].thca,
                d9Thc: d9Thc !== undefined ? d9Thc : existingResult[0].d9Thc,
                d8Thc: d8Thc !== undefined ? d8Thc : existingResult[0].d8Thc,
                thcv: thcv !== undefined ? thcv : existingResult[0].thcv,
                cbd: cbd !== undefined ? cbd : existingResult[0].cbd,
                cbda: cbda !== undefined ? cbda : existingResult[0].cbda,
                cbg: cbg !== undefined ? cbg : existingResult[0].cbg,
                cbga: cbga !== undefined ? cbga : existingResult[0].cbga,
                cbn: cbn !== undefined ? cbn : existingResult[0].cbn,
                cbc: cbc !== undefined ? cbc : existingResult[0].cbc,
                totalCannabinoids: totalCannabinoids !== undefined ? totalCannabinoids : existingResult[0].totalCannabinoids,
                totalThc: totalThc !== undefined ? totalThc : existingResult[0].totalThc,
                totalCbd: totalCbd !== undefined ? totalCbd : existingResult[0].totalCbd,
                updatedAt: new Date(),
              })
              .where(eq(cannabinoidResults.id, existingResult[0].id));
          } else {
            // Criar novo resultado
            await db.insert(cannabinoidResults)
              .values({
                testId,
                thc,
                thca,
                d9Thc,
                d8Thc,
                thcv,
                cbd,
                cbda,
                cbg,
                cbga,
                cbn,
                cbc,
                totalCannabinoids,
                totalThc,
                totalCbd,
              });
          }
        } else if (testType === 'terpene_profile') {
          const { resultData: terpeneData, totalTerpenes } = resultData;
          
          // Verificar se já existe um resultado para este teste
          const existingResult = await db.select()
            .from(terpeneResults)
            .where(eq(terpeneResults.testId, testId))
            .limit(1);
          
          if (existingResult.length > 0) {
            // Atualizar resultado existente
            await db.update(terpeneResults)
              .set({
                resultData: terpeneData !== undefined ? terpeneData : existingResult[0].resultData,
                totalTerpenes: totalTerpenes !== undefined ? totalTerpenes : existingResult[0].totalTerpenes,
                updatedAt: new Date(),
              })
              .where(eq(terpeneResults.id, existingResult[0].id));
          } else {
            // Criar novo resultado
            await db.insert(terpeneResults)
              .values({
                testId,
                resultData: terpeneData,
                totalTerpenes,
              });
          }
        } else {
          // Para outros tipos de teste, atualizar apenas o campo resultData
          await db.update(tests)
            .set({
              resultData: resultData.resultData || test.resultData,
            })
            .where(eq(tests.id, testId));
        }
        
        // Se todos os testes estiverem concluídos, atualizar o status da amostra
        if (status === 'completed' || status === 'approved') {
          const sampleTests = await db.select()
            .from(tests)
            .where(eq(tests.sampleId, test.sampleId));
          
          const allTestsCompleted = sampleTests.every(t => 
            t.status === 'completed' || t.status === 'approved' || t.status === 'rejected'
          );
          
          if (allTestsCompleted) {
            await db.update(samples)
              .set({ status: 'completed', completedDate: new Date() })
              .where(eq(samples.id, test.sampleId));
          }
        }
        
        // Obter o teste atualizado com resultados
        const updatedTest = await db.select()
          .from(tests)
          .where(eq(tests.id, testId))
          .limit(1);
        
        // Obter os resultados específicos
        let results = null;
        
        if (testType === 'cannabinoid_profile') {
          const cannabinoidResult = await db.select()
            .from(cannabinoidResults)
            .where(eq(cannabinoidResults.testId, testId))
            .limit(1);
            
          if (cannabinoidResult.length > 0) {
            results = cannabinoidResult[0];
          }
        } else if (testType === 'terpene_profile') {
          const terpeneResult = await db.select()
            .from(terpeneResults)
            .where(eq(terpeneResults.testId, testId))
            .limit(1);
            
          if (terpeneResult.length > 0) {
            results = terpeneResult[0];
          }
        } else {
          // Para outros tipos de teste, usar os dados JSON genéricos
          results = updatedTest[0].resultData;
        }
        
        res.json({
          message: "Resultados do teste atualizados com sucesso",
          test: {
            ...updatedTest[0],
            results
          }
        });
      } catch (error) {
        console.error("Erro na transação de atualização de resultados:", error);
        throw error;
      }
    } catch (error) {
      console.error("Erro ao atualizar resultados do teste:", error);
      res.status(500).json({ message: "Erro ao processar a solicitação" });
    }
  });

  // Rota alternativa para listar amostras (para depuração) - Usamos /lab-samples para evitar intercepção do middleware vite
  app.get('/api/lab-samples', async (req: Request, res: Response) => {
    try {
      // Parâmetros de filtro e paginação
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = (page - 1) * limit;
      
      const status = req.query.status as string || null;
      const sampleType = req.query.sampleType as string || null;
      const searchTerm = req.query.search as string || null;
      const labId = req.query.labId ? parseInt(req.query.labId as string) : 1; // Default para o primeiro laboratório
      
      // Construir a consulta SQL
      let query = sql`
        SELECT s.*, o.name as organization_name, u.name as created_by_name, 
               (SELECT COUNT(*) FROM tests WHERE sample_id = s.id) as tests_count
        FROM samples s
        LEFT JOIN organizations o ON s.organization_id = o.id
        LEFT JOIN users u ON s.created_by = u.id
        WHERE s.laboratory_id = ${labId}
      `;

      // Adicionar filtros
      if (status) {
        query = sql`${query} AND s.status = ${status}`;
      }
      
      if (sampleType) {
        query = sql`${query} AND s.sample_type = ${sampleType}`;
      }
      
      if (searchTerm) {
        query = sql`${query} AND (
          s.code ILIKE ${`%${searchTerm}%`} OR 
          s.batch_number ILIKE ${`%${searchTerm}%`} OR
          o.name ILIKE ${`%${searchTerm}%`}
        )`;
      }
      
      // Contar total de resultados para paginação
      const countQuery = sql`SELECT COUNT(*) FROM (${query}) AS count_query`;
      const countResult = await db.execute(countQuery);
      const totalCount = parseInt(countResult.rows[0]?.count || '0');
      
      // Adicionar ordenação e limites
      query = sql`${query} ORDER BY s.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      
      const samples = await db.execute(query);
      
      // Retornar resultados com metadados de paginação
      res.json({
        data: samples.rows,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      console.error("Erro ao listar amostras do laboratório:", error);
      res.status(500).json({ message: "Erro ao processar a solicitação" });
    }
  });
  
  // Rota para registrar um novo laboratório (para admins)
  app.post('/api/laboratory/register', authenticate, async (req: Request, res: Response) => {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ message: "Apenas administradores podem registrar laboratórios" });
      }
      
      // Validar os dados do novo laboratório e usuário
      const registrationSchema = z.object({
        laboratoryName: z.string().min(3),
        licenseNumber: z.string().min(3),
        licenseExpiryDate: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email(),
        website: z.string().optional(),
        contactPerson: z.string().optional(),
        contactPhone: z.string().optional(),
        contactEmail: z.string().email().optional(),
        
        // Dados do usuário associado
        username: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(3),
      });
      
      const validationResult = registrationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Dados inválidos", errors: validationResult.error.errors });
      }
      
      const {
        laboratoryName, licenseNumber, licenseExpiryDate, address, city, state,
        postalCode, phone, email, website, contactPerson, contactPhone, contactEmail,
        username, password, name
      } = validationResult.data;
      
      // Verificar se já existe um usuário com o mesmo username
      const existingUser = await db.select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);
      
      if (existingUser.length > 0) {
        return res.status(400).json({ message: "Já existe um usuário com este e-mail" });
      }
      
      // Processar a data de expiração da licença, se fornecida
      let parsedLicenseExpiryDate = null;
      if (licenseExpiryDate) {
        parsedLicenseExpiryDate = new Date(licenseExpiryDate);
      }
      
      try {
        // Criar o usuário do laboratório
        const newUser = await db.insert(users)
          .values({
            username,
            password, // Na prática, você deve usar hash de senha
            role: 'laboratory',
            name,
            email,
            phoneNumber: contactPhone || phone,
          })
          .returning();
        
        // Criar o registro do laboratório
        const newLaboratory = await db.insert(laboratories)
          .values({
            name: laboratoryName,
            userId: newUser[0].id,
            licenseNumber,
            licenseExpiryDate: parsedLicenseExpiryDate,
            address,
            city,
            state,
            postalCode,
            phone,
            email,
            website,
            contactPerson,
            contactPhone,
            contactEmail,
          })
          .returning();
        
        res.status(201).json({
          message: "Laboratório registrado com sucesso",
          laboratory: newLaboratory[0],
          user: {
            id: newUser[0].id,
            username: newUser[0].username,
            name: newUser[0].name,
            role: newUser[0].role,
          }
        });
      } catch (error) {
        console.error("Erro na transação de registro de laboratório:", error);
        throw error;
      }
    } catch (error) {
      console.error("Erro ao registrar laboratório:", error);
      res.status(500).json({ message: "Erro ao processar a solicitação" });
    }
  });
}