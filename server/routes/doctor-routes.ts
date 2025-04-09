import { Request, Response } from 'express';
import { Express } from 'express';
import { db } from '../db';
import { eq, and, inArray } from 'drizzle-orm';
import { 
  doctorOrganizationsTable, 
  prescriptionsTable,
  insertDoctorOrganizationSchema,
  insertPrescriptionSchema
} from '../../shared/schema-doctor-affiliation';
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

// Middleware para verificar se o usuário é médico
const isDoctorMiddleware = (req: AuthenticatedRequest, res: Response, next: Function) => {
  if (!req.user || req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Acesso negado. Apenas médicos podem acessar este recurso.' });
  }
  next();
};

export async function registerDoctorRoutes(app: Express) {
  // Rota para obter as organizações vinculadas a um médico
  app.get('/api/doctor/organizations', isDoctorMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const doctorId = req.user?.id;
      
      const affiliations = await db
        .select({
          id: doctorOrganizationsTable.id,
          doctorId: doctorOrganizationsTable.doctorId,
          organizationId: doctorOrganizationsTable.organizationId,
          organizationName: organizationsTable.name,
          status: doctorOrganizationsTable.status,
          isDefault: doctorOrganizationsTable.isDefault,
          createdAt: doctorOrganizationsTable.createdAt,
          // Adicionar outros campos da organização conforme necessário
          address: organizationsTable.address,
          email: organizationsTable.email,
          phone: organizationsTable.phone,
          city: organizationsTable.city,
          state: organizationsTable.state,
          website: organizationsTable.website
        })
        .from(doctorOrganizationsTable)
        .innerJoin(
          organizationsTable, 
          eq(doctorOrganizationsTable.organizationId, organizationsTable.id)
        )
        .where(eq(doctorOrganizationsTable.doctorId, doctorId as number));
      
      res.json(affiliations);
    } catch (error) {
      console.error('Erro ao buscar organizações do médico:', error);
      res.status(500).json({ message: 'Erro ao buscar organizações vinculadas' });
    }
  });
  
  // Rota para afiliar-se a uma organização usando código de convite
  app.post('/api/doctor/organizations/join', isDoctorMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { inviteCode } = req.body;
      const doctorId = req.user?.id;
      
      if (!inviteCode) {
        return res.status(400).json({ message: 'Código de convite é obrigatório' });
      }
      
      // Simulação de verificação de código de convite
      // Em produção, você teria uma tabela para armazenar e validar códigos
      const dummyOrganizationId = 2; // Simulação: código sempre associa à organização 2
      
      // Verificar se já existe uma afiliação
      const existingAffiliation = await db
        .select()
        .from(doctorOrganizationsTable)
        .where(
          and(
            eq(doctorOrganizationsTable.doctorId, doctorId as number),
            eq(doctorOrganizationsTable.organizationId, dummyOrganizationId)
          )
        );
      
      if (existingAffiliation.length > 0) {
        return res.status(400).json({ message: 'Médico já está afiliado a esta organização' });
      }
      
      // Criar nova afiliação
      const newAffiliation = await db.insert(doctorOrganizationsTable).values({
        doctorId: doctorId as number,
        organizationId: dummyOrganizationId,
        status: 'pending', // Pendente de aprovação pela organização
        isDefault: false
      }).returning();
      
      res.status(201).json({
        message: 'Solicitação de afiliação enviada com sucesso',
        affiliation: newAffiliation[0]
      });
    } catch (error) {
      console.error('Erro ao processar afiliação:', error);
      res.status(500).json({ message: 'Erro ao processar solicitação de afiliação' });
    }
  });
  
  // Rota para definir uma organização como padrão
  app.patch('/api/doctor/organizations/:id/set-default', isDoctorMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const affiliationId = parseInt(req.params.id);
      const doctorId = req.user?.id;
      
      // Verificar se a afiliação pertence ao médico
      const affiliation = await db
        .select()
        .from(doctorOrganizationsTable)
        .where(
          and(
            eq(doctorOrganizationsTable.id, affiliationId),
            eq(doctorOrganizationsTable.doctorId, doctorId as number)
          )
        );
      
      if (affiliation.length === 0) {
        return res.status(404).json({ message: 'Afiliação não encontrada' });
      }
      
      // Remover o status de padrão de todas as afiliações do médico
      await db
        .update(doctorOrganizationsTable)
        .set({ isDefault: false })
        .where(eq(doctorOrganizationsTable.doctorId, doctorId as number));
      
      // Definir a afiliação selecionada como padrão
      await db
        .update(doctorOrganizationsTable)
        .set({ isDefault: true })
        .where(eq(doctorOrganizationsTable.id, affiliationId));
      
      res.json({ message: 'Organização definida como padrão com sucesso' });
    } catch (error) {
      console.error('Erro ao definir organização padrão:', error);
      res.status(500).json({ message: 'Erro ao definir organização padrão' });
    }
  });
  
  // Rota para deixar uma organização
  app.delete('/api/doctor/organizations/:id', isDoctorMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const affiliationId = parseInt(req.params.id);
      const doctorId = req.user?.id;
      
      // Verificar se a afiliação pertence ao médico
      const affiliation = await db
        .select()
        .from(doctorOrganizationsTable)
        .where(
          and(
            eq(doctorOrganizationsTable.id, affiliationId),
            eq(doctorOrganizationsTable.doctorId, doctorId as number)
          )
        );
      
      if (affiliation.length === 0) {
        return res.status(404).json({ message: 'Afiliação não encontrada' });
      }
      
      // Verificar se há prescrições ativas vinculadas a esta afiliação
      const prescriptions = await db
        .select()
        .from(prescriptionsTable)
        .where(
          and(
            eq(prescriptionsTable.doctorId, doctorId as number),
            eq(prescriptionsTable.organizationId, affiliation[0].organizationId)
          )
        );
      
      if (prescriptions.length > 0) {
        return res.status(400).json({ 
          message: 'Não é possível deixar esta organização pois existem prescrições vinculadas',
          prescriptionsCount: prescriptions.length
        });
      }
      
      // Remover a afiliação
      await db
        .delete(doctorOrganizationsTable)
        .where(eq(doctorOrganizationsTable.id, affiliationId));
      
      res.json({ message: 'Afiliação removida com sucesso' });
    } catch (error) {
      console.error('Erro ao remover afiliação:', error);
      res.status(500).json({ message: 'Erro ao remover afiliação' });
    }
  });
  
  // Rota para obter pacientes de uma organização específica
  app.get('/api/doctor/organizations/:orgId/patients', isDoctorMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const organizationId = parseInt(req.params.orgId);
      const doctorId = req.user?.id;
      
      // Verificar se o médico tem permissão para acessar esta organização
      const affiliation = await db
        .select()
        .from(doctorOrganizationsTable)
        .where(
          and(
            eq(doctorOrganizationsTable.organizationId, organizationId),
            eq(doctorOrganizationsTable.doctorId, doctorId as number),
            eq(doctorOrganizationsTable.status, 'active')
          )
        );
      
      if (affiliation.length === 0) {
        return res.status(403).json({ message: 'Médico não possui uma afiliação ativa com esta organização' });
      }
      
      // Buscar pacientes da organização
      const patients = await db
        .select({
          id: patientsTable.id,
          name: patientsTable.name,
          email: patientsTable.email,
          dateOfBirth: patientsTable.dateOfBirth,
          gender: patientsTable.gender,
          phone: patientsTable.phone,
          cpf: patientsTable.cpf,
          address: patientsTable.address,
          organizationId: patientsTable.organizationId,
          createdAt: patientsTable.createdAt
        })
        .from(patientsTable)
        .where(eq(patientsTable.organizationId, organizationId));
      
      res.json(patients);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      res.status(500).json({ message: 'Erro ao buscar pacientes da organização' });
    }
  });
  
  // Rota para obter produtos de uma organização específica
  app.get('/api/doctor/organizations/:orgId/products', isDoctorMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const organizationId = parseInt(req.params.orgId);
      const doctorId = req.user?.id;
      
      // Verificar se o médico tem permissão para acessar esta organização
      const affiliation = await db
        .select()
        .from(doctorOrganizationsTable)
        .where(
          and(
            eq(doctorOrganizationsTable.organizationId, organizationId),
            eq(doctorOrganizationsTable.doctorId, doctorId as number),
            eq(doctorOrganizationsTable.status, 'active')
          )
        );
      
      if (affiliation.length === 0) {
        return res.status(403).json({ message: 'Médico não possui uma afiliação ativa com esta organização' });
      }
      
      // Buscar produtos da organização
      const products = await db
        .select({
          id: productsTable.id,
          name: productsTable.name,
          description: productsTable.description,
          price: productsTable.price,
          category: productsTable.category,
          sku: productsTable.sku,
          stock: productsTable.stock,
          image: productsTable.image,
          organizationId: productsTable.organizationId
        })
        .from(productsTable)
        .where(eq(productsTable.organizationId, organizationId));
      
      res.json(products);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      res.status(500).json({ message: 'Erro ao buscar produtos da organização' });
    }
  });
  
  // Rota para criar uma nova prescrição
  app.post('/api/doctor/prescriptions', isDoctorMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const doctorId = req.user?.id;
      const {
        patientId,
        organizationId,
        productId,
        dosage,
        instructions,
        duration,
        notes
      } = req.body;
      
      // Validar entradas
      if (!patientId || !organizationId || !productId) {
        return res.status(400).json({ message: 'Dados insuficientes para criar prescrição' });
      }
      
      // Verificar se o médico tem permissão para esta organização
      const affiliation = await db
        .select()
        .from(doctorOrganizationsTable)
        .where(
          and(
            eq(doctorOrganizationsTable.organizationId, organizationId),
            eq(doctorOrganizationsTable.doctorId, doctorId as number),
            eq(doctorOrganizationsTable.status, 'active')
          )
        );
      
      if (affiliation.length === 0) {
        return res.status(403).json({ message: 'Médico não possui uma afiliação ativa com esta organização' });
      }
      
      // Criar a prescrição
      const newPrescription = await db.insert(prescriptionsTable).values({
        patientId,
        doctorId: doctorId as number,
        organizationId,
        productId,
        dosage,
        instructions,
        duration,
        notes,
        status: 'pending' // Sempre começa como pendente, aguardando aprovação
      }).returning();
      
      res.status(201).json({
        message: 'Prescrição criada com sucesso',
        prescription: newPrescription[0]
      });
    } catch (error) {
      console.error('Erro ao criar prescrição:', error);
      res.status(500).json({ message: 'Erro ao criar prescrição' });
    }
  });
  
  // Rota para obter prescrições do médico
  app.get('/api/doctor/prescriptions', isDoctorMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const doctorId = req.user?.id;
      const organizationId = req.query.organizationId ? parseInt(req.query.organizationId as string) : undefined;
      const status = req.query.status as string;
      
      // Construir a consulta base
      let query = db
        .select({
          id: prescriptionsTable.id,
          patientId: prescriptionsTable.patientId,
          patientName: patientsTable.name,
          doctorId: prescriptionsTable.doctorId,
          doctorName: usersTable.name,
          organizationId: prescriptionsTable.organizationId,
          organizationName: organizationsTable.name,
          productId: prescriptionsTable.productId,
          productName: productsTable.name,
          dosage: prescriptionsTable.dosage,
          instructions: prescriptionsTable.instructions,
          duration: prescriptionsTable.duration,
          status: prescriptionsTable.status,
          notes: prescriptionsTable.notes,
          approvedById: prescriptionsTable.approvedById,
          approvalDate: prescriptionsTable.approvalDate,
          createdAt: prescriptionsTable.createdAt
        })
        .from(prescriptionsTable)
        .innerJoin(patientsTable, eq(prescriptionsTable.patientId, patientsTable.id))
        .innerJoin(usersTable, eq(prescriptionsTable.doctorId, usersTable.id))
        .innerJoin(organizationsTable, eq(prescriptionsTable.organizationId, organizationsTable.id))
        .innerJoin(productsTable, eq(prescriptionsTable.productId, productsTable.id))
        .where(eq(prescriptionsTable.doctorId, doctorId as number));
      
      // Filtrar por organização se especificado
      if (organizationId) {
        query = query.where(eq(prescriptionsTable.organizationId, organizationId));
      }
      
      // Filtrar por status se especificado
      if (status && ['pending', 'approved', 'rejected'].includes(status)) {
        query = query.where(eq(prescriptionsTable.status, status));
      }
      
      const prescriptions = await query;
      
      res.json(prescriptions);
    } catch (error) {
      console.error('Erro ao buscar prescrições:', error);
      res.status(500).json({ message: 'Erro ao buscar prescrições' });
    }
  });
  
  // Rota para obter detalhes de uma prescrição específica
  app.get('/api/doctor/prescriptions/:id', isDoctorMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const prescriptionId = parseInt(req.params.id);
      const doctorId = req.user?.id;
      
      const prescription = await db
        .select({
          id: prescriptionsTable.id,
          patientId: prescriptionsTable.patientId,
          patientName: patientsTable.name,
          doctorId: prescriptionsTable.doctorId,
          doctorName: usersTable.name,
          organizationId: prescriptionsTable.organizationId,
          organizationName: organizationsTable.name,
          productId: prescriptionsTable.productId,
          productName: productsTable.name,
          dosage: prescriptionsTable.dosage,
          instructions: prescriptionsTable.instructions,
          duration: prescriptionsTable.duration,
          status: prescriptionsTable.status,
          notes: prescriptionsTable.notes,
          approvedById: prescriptionsTable.approvedById,
          approvalDate: prescriptionsTable.approvalDate,
          createdAt: prescriptionsTable.createdAt
        })
        .from(prescriptionsTable)
        .innerJoin(patientsTable, eq(prescriptionsTable.patientId, patientsTable.id))
        .innerJoin(usersTable, eq(prescriptionsTable.doctorId, usersTable.id))
        .innerJoin(organizationsTable, eq(prescriptionsTable.organizationId, organizationsTable.id))
        .innerJoin(productsTable, eq(prescriptionsTable.productId, productsTable.id))
        .where(
          and(
            eq(prescriptionsTable.id, prescriptionId),
            eq(prescriptionsTable.doctorId, doctorId as number)
          )
        );
      
      if (prescription.length === 0) {
        return res.status(404).json({ message: 'Prescrição não encontrada' });
      }
      
      res.json(prescription[0]);
    } catch (error) {
      console.error('Erro ao buscar detalhes da prescrição:', error);
      res.status(500).json({ message: 'Erro ao buscar detalhes da prescrição' });
    }
  });
  
  // Rota para atualizar uma prescrição (apenas se estiver com status rejected)
  app.patch('/api/doctor/prescriptions/:id', isDoctorMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const prescriptionId = parseInt(req.params.id);
      const doctorId = req.user?.id;
      const {
        dosage,
        instructions,
        duration,
        notes
      } = req.body;
      
      // Verificar se a prescrição existe e pertence ao médico
      const prescription = await db
        .select()
        .from(prescriptionsTable)
        .where(
          and(
            eq(prescriptionsTable.id, prescriptionId),
            eq(prescriptionsTable.doctorId, doctorId as number)
          )
        );
      
      if (prescription.length === 0) {
        return res.status(404).json({ message: 'Prescrição não encontrada' });
      }
      
      // Verificar se a prescrição está rejeitada (apenas prescrições rejeitadas podem ser atualizadas)
      if (prescription[0].status !== 'rejected') {
        return res.status(400).json({ 
          message: 'Apenas prescrições rejeitadas podem ser atualizadas',
          status: prescription[0].status
        });
      }
      
      // Atualizar a prescrição
      await db
        .update(prescriptionsTable)
        .set({
          dosage,
          instructions,
          duration,
          notes,
          status: 'pending', // Volta para pendente para nova avaliação
          approvedById: null,
          approvalDate: null
        })
        .where(eq(prescriptionsTable.id, prescriptionId));
      
      res.json({ 
        message: 'Prescrição atualizada com sucesso',
        prescriptionId
      });
    } catch (error) {
      console.error('Erro ao atualizar prescrição:', error);
      res.status(500).json({ message: 'Erro ao atualizar prescrição' });
    }
  });
  
  // Retornar as rotas registradas para debugging
  return [
    "/api/doctor/organizations",
    "/api/doctor/organizations/join",
    "/api/doctor/organizations/:id/set-default",
    "/api/doctor/organizations/:id",
    "/api/doctor/organizations/:orgId/patients",
    "/api/doctor/organizations/:orgId/products",
    "/api/doctor/prescriptions",
    "/api/doctor/prescriptions/:id"
  ];
}