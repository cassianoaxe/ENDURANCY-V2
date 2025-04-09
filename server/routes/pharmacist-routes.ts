import { Request, Response } from 'express';
import { Express } from 'express';
import { db } from '../db';
import { eq, and, inArray } from 'drizzle-orm';
import { prescriptionsTable } from '../../shared/schema-doctor-affiliation';
import { users as usersTable } from '../../shared/schema';
import { patients as patientsTable } from '../../shared/schema';
import { products as productsTable } from '../../shared/schema';
import { organizations as organizationsTable } from '../../shared/schema';

// Tipos para autenticação
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
    name: string;
    email: string;
    organizationId: number | null;
  };
}

// Middleware para verificar se o usuário é farmacêutico
const isPharmacistMiddleware = (req: AuthenticatedRequest, res: Response, next: Function) => {
  // Assumindo que o papel do farmacêutico é 'pharmacist'
  if (!req.user || req.user.role !== 'pharmacist') {
    return res.status(403).json({ message: 'Acesso negado. Apenas farmacêuticos podem acessar este recurso.' });
  }
  
  // Verificar se o farmacêutico está associado a uma organização
  if (!req.user.organizationId) {
    return res.status(403).json({ message: 'Farmacêutico não está associado a nenhuma organização' });
  }
  
  next();
};

export async function registerPharmacistRoutes(app: Express) {
  // Rota para obter prescrições pendentes para análise
  app.get('/api/pharmacist/prescriptions/pending', isPharmacistMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const organizationId = req.user?.organizationId;
      
      // Buscar prescrições pendentes da organização do farmacêutico
      const prescriptions = await db
        .select({
          id: prescriptionsTable.id,
          patientId: prescriptionsTable.patientId,
          patientName: patientsTable.name,
          doctorId: prescriptionsTable.doctorId,
          doctorName: usersTable.name,
          organizationId: prescriptionsTable.organizationId,
          productId: prescriptionsTable.productId,
          productName: productsTable.name,
          dosage: prescriptionsTable.dosage,
          instructions: prescriptionsTable.instructions,
          duration: prescriptionsTable.duration,
          status: prescriptionsTable.status,
          notes: prescriptionsTable.notes,
          createdAt: prescriptionsTable.createdAt
        })
        .from(prescriptionsTable)
        .innerJoin(patientsTable, eq(prescriptionsTable.patientId, patientsTable.id))
        .innerJoin(usersTable, eq(prescriptionsTable.doctorId, usersTable.id))
        .innerJoin(productsTable, eq(prescriptionsTable.productId, productsTable.id))
        .where(
          and(
            eq(prescriptionsTable.organizationId, organizationId as number),
            eq(prescriptionsTable.status, 'pending')
          )
        );
      
      res.json(prescriptions);
    } catch (error) {
      console.error('Erro ao buscar prescrições pendentes:', error);
      res.status(500).json({ message: 'Erro ao buscar prescrições pendentes' });
    }
  });
  
  // Rota para aprovar uma prescrição
  app.post('/api/pharmacist/prescriptions/:id/approve', isPharmacistMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const prescriptionId = parseInt(req.params.id);
      const pharmacistId = req.user?.id;
      const organizationId = req.user?.organizationId;
      const { notes } = req.body;
      
      // Verificar se a prescrição existe e pertence à organização do farmacêutico
      const prescription = await db
        .select()
        .from(prescriptionsTable)
        .where(
          and(
            eq(prescriptionsTable.id, prescriptionId),
            eq(prescriptionsTable.organizationId, organizationId as number)
          )
        );
      
      if (prescription.length === 0) {
        return res.status(404).json({ message: 'Prescrição não encontrada' });
      }
      
      // Verificar se a prescrição está pendente
      if (prescription[0].status !== 'pending') {
        return res.status(400).json({ 
          message: 'Esta prescrição já foi processada',
          status: prescription[0].status
        });
      }
      
      // Aprovar a prescrição
      await db
        .update(prescriptionsTable)
        .set({
          status: 'approved',
          approvedById: pharmacistId,
          approvalDate: new Date(),
          notes: notes || prescription[0].notes
        })
        .where(eq(prescriptionsTable.id, prescriptionId));
      
      res.json({ 
        message: 'Prescrição aprovada com sucesso',
        prescriptionId
      });
    } catch (error) {
      console.error('Erro ao aprovar prescrição:', error);
      res.status(500).json({ message: 'Erro ao aprovar prescrição' });
    }
  });
  
  // Rota para rejeitar uma prescrição
  app.post('/api/pharmacist/prescriptions/:id/reject', isPharmacistMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const prescriptionId = parseInt(req.params.id);
      const pharmacistId = req.user?.id;
      const organizationId = req.user?.organizationId;
      const { notes } = req.body;
      
      if (!notes) {
        return res.status(400).json({ message: 'É necessário fornecer um motivo para a rejeição' });
      }
      
      // Verificar se a prescrição existe e pertence à organização do farmacêutico
      const prescription = await db
        .select()
        .from(prescriptionsTable)
        .where(
          and(
            eq(prescriptionsTable.id, prescriptionId),
            eq(prescriptionsTable.organizationId, organizationId as number)
          )
        );
      
      if (prescription.length === 0) {
        return res.status(404).json({ message: 'Prescrição não encontrada' });
      }
      
      // Verificar se a prescrição está pendente
      if (prescription[0].status !== 'pending') {
        return res.status(400).json({ 
          message: 'Esta prescrição já foi processada',
          status: prescription[0].status
        });
      }
      
      // Rejeitar a prescrição
      await db
        .update(prescriptionsTable)
        .set({
          status: 'rejected',
          approvedById: pharmacistId, // Mesmo sendo rejeição, registramos quem rejeitou
          approvalDate: new Date(),
          notes: notes
        })
        .where(eq(prescriptionsTable.id, prescriptionId));
      
      res.json({ 
        message: 'Prescrição rejeitada com sucesso',
        prescriptionId
      });
    } catch (error) {
      console.error('Erro ao rejeitar prescrição:', error);
      res.status(500).json({ message: 'Erro ao rejeitar prescrição' });
    }
  });
  
  // Rota para obter histórico de prescrições processadas
  app.get('/api/pharmacist/prescriptions/history', isPharmacistMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const organizationId = req.user?.organizationId;
      const status = req.query.status as string; // 'approved' ou 'rejected'
      
      // Construir a consulta base
      let query = db
        .select({
          id: prescriptionsTable.id,
          patientId: prescriptionsTable.patientId,
          patientName: patientsTable.name,
          doctorId: prescriptionsTable.doctorId,
          doctorName: usersTable.name,
          organizationId: prescriptionsTable.organizationId,
          productId: prescriptionsTable.productId,
          productName: productsTable.name,
          dosage: prescriptionsTable.dosage,
          instructions: prescriptionsTable.instructions,
          duration: prescriptionsTable.duration,
          status: prescriptionsTable.status,
          notes: prescriptionsTable.notes,
          approvedById: prescriptionsTable.approvedById,
          pharmacistName: usersTable.name, // Nome do farmacêutico que aprovou/rejeitou
          approvalDate: prescriptionsTable.approvalDate,
          createdAt: prescriptionsTable.createdAt
        })
        .from(prescriptionsTable)
        .innerJoin(patientsTable, eq(prescriptionsTable.patientId, patientsTable.id))
        .innerJoin(usersTable, eq(prescriptionsTable.doctorId, usersTable.id))
        .innerJoin(productsTable, eq(prescriptionsTable.productId, productsTable.id))
        .where(
          and(
            eq(prescriptionsTable.organizationId, organizationId as number),
            inArray(prescriptionsTable.status, ['approved', 'rejected'])
          )
        );
      
      // Filtrar por status específico se fornecido
      if (status && ['approved', 'rejected'].includes(status)) {
        query = query.where(eq(prescriptionsTable.status, status));
      }
      
      // Ordenar por data de aprovação/rejeição (mais recentes primeiro)
      // query = query.orderBy(desc(prescriptionsTable.approvalDate));
      
      const prescriptions = await query;
      
      res.json(prescriptions);
    } catch (error) {
      console.error('Erro ao buscar histórico de prescrições:', error);
      res.status(500).json({ message: 'Erro ao buscar histórico de prescrições' });
    }
  });
  
  // Retornar as rotas registradas para debugging
  return [
    "/api/pharmacist/prescriptions/pending",
    "/api/pharmacist/prescriptions/:id/approve",
    "/api/pharmacist/prescriptions/:id/reject",
    "/api/pharmacist/prescriptions/history"
  ];
}