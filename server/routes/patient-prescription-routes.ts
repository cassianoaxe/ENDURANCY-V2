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
    patientId?: number; // Para usuários com role 'patient'
  };
}

// Middleware para verificar se o usuário é paciente
const isPatientMiddleware = (req: AuthenticatedRequest, res: Response, next: Function) => {
  if (!req.user || req.user.role !== 'patient') {
    return res.status(403).json({ message: 'Acesso negado. Apenas pacientes podem acessar este recurso.' });
  }
  next();
};

export async function registerPatientPrescriptionRoutes(app: Express) {
  // Rota para obter prescrições do paciente
  app.get('/api/patient/prescriptions', isPatientMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Para pacientes, o patientId deve ser obtido da sessão/autenticação
      const patientData = await db.select().from(patientsTable).where(eq(patientsTable.userId, req.user?.id as number));
      
      if (patientData.length === 0) {
        return res.status(404).json({ message: 'Perfil de paciente não encontrado' });
      }
      
      const patientId = patientData[0].id;
      
      // Buscar apenas prescrições aprovadas
      const prescriptions = await db
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
          productDescription: productsTable.description,
          productPrice: productsTable.price,
          productImage: productsTable.image,
          dosage: prescriptionsTable.dosage,
          instructions: prescriptionsTable.instructions,
          duration: prescriptionsTable.duration,
          status: prescriptionsTable.status,
          createdAt: prescriptionsTable.createdAt,
          approvalDate: prescriptionsTable.approvalDate
        })
        .from(prescriptionsTable)
        .innerJoin(patientsTable, eq(prescriptionsTable.patientId, patientsTable.id))
        .innerJoin(usersTable, eq(prescriptionsTable.doctorId, usersTable.id))
        .innerJoin(organizationsTable, eq(prescriptionsTable.organizationId, organizationsTable.id))
        .innerJoin(productsTable, eq(prescriptionsTable.productId, productsTable.id))
        .where(
          and(
            eq(prescriptionsTable.patientId, patientId),
            eq(prescriptionsTable.status, 'approved')
          )
        );
      
      res.json(prescriptions);
    } catch (error) {
      console.error('Erro ao buscar prescrições do paciente:', error);
      res.status(500).json({ message: 'Erro ao buscar prescrições' });
    }
  });
  
  // Rota para obter detalhes de uma prescrição específica
  app.get('/api/patient/prescriptions/:id', isPatientMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const prescriptionId = parseInt(req.params.id);
      
      // Para pacientes, o patientId deve ser obtido da sessão/autenticação
      const patientData = await db.select().from(patientsTable).where(eq(patientsTable.userId, req.user?.id as number));
      
      if (patientData.length === 0) {
        return res.status(404).json({ message: 'Perfil de paciente não encontrado' });
      }
      
      const patientId = patientData[0].id;
      
      // Buscar apenas prescrições aprovadas
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
          productDescription: productsTable.description,
          productPrice: productsTable.price,
          productImage: productsTable.image,
          dosage: prescriptionsTable.dosage,
          instructions: prescriptionsTable.instructions,
          duration: prescriptionsTable.duration,
          status: prescriptionsTable.status,
          createdAt: prescriptionsTable.createdAt,
          approvalDate: prescriptionsTable.approvalDate
        })
        .from(prescriptionsTable)
        .innerJoin(patientsTable, eq(prescriptionsTable.patientId, patientsTable.id))
        .innerJoin(usersTable, eq(prescriptionsTable.doctorId, usersTable.id))
        .innerJoin(organizationsTable, eq(prescriptionsTable.organizationId, organizationsTable.id))
        .innerJoin(productsTable, eq(prescriptionsTable.productId, productsTable.id))
        .where(
          and(
            eq(prescriptionsTable.id, prescriptionId),
            eq(prescriptionsTable.patientId, patientId),
            eq(prescriptionsTable.status, 'approved')
          )
        );
      
      if (prescription.length === 0) {
        return res.status(404).json({ message: 'Prescrição não encontrada ou não aprovada' });
      }
      
      res.json(prescription[0]);
    } catch (error) {
      console.error('Erro ao buscar detalhes da prescrição:', error);
      res.status(500).json({ message: 'Erro ao buscar detalhes da prescrição' });
    }
  });
  
  // Rota para adicionar produto de uma prescrição ao carrinho
  app.post('/api/patient/prescriptions/:id/add-to-cart', isPatientMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const prescriptionId = parseInt(req.params.id);
      const { quantity } = req.body;
      
      // Para pacientes, o patientId deve ser obtido da sessão/autenticação
      const patientData = await db.select().from(patientsTable).where(eq(patientsTable.userId, req.user?.id as number));
      
      if (patientData.length === 0) {
        return res.status(404).json({ message: 'Perfil de paciente não encontrado' });
      }
      
      const patientId = patientData[0].id;
      
      // Verificar se a prescrição existe, pertence ao paciente e está aprovada
      const prescription = await db
        .select({
          id: prescriptionsTable.id,
          productId: prescriptionsTable.productId,
          organizationId: prescriptionsTable.organizationId,
          status: prescriptionsTable.status
        })
        .from(prescriptionsTable)
        .where(
          and(
            eq(prescriptionsTable.id, prescriptionId),
            eq(prescriptionsTable.patientId, patientId),
            eq(prescriptionsTable.status, 'approved')
          )
        );
      
      if (prescription.length === 0) {
        return res.status(404).json({ message: 'Prescrição não encontrada ou não aprovada' });
      }
      
      // Obter informações do produto
      const product = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.id, prescription[0].productId));
      
      if (product.length === 0) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }
      
      // Aqui você adicionaria o produto ao carrinho
      // Como não temos uma tabela de carrinho implementada, retornaremos apenas uma simulação
      
      res.json({
        message: 'Produto adicionado ao carrinho com sucesso',
        cartItem: {
          prescriptionId,
          productId: product[0].id,
          productName: product[0].name,
          price: product[0].price,
          quantity: quantity || 1,
          organizationId: prescription[0].organizationId
        }
      });
    } catch (error) {
      console.error('Erro ao adicionar produto ao carrinho:', error);
      res.status(500).json({ message: 'Erro ao adicionar produto ao carrinho' });
    }
  });
  
  // Retornar as rotas registradas para debugging
  return [
    "/api/patient/prescriptions",
    "/api/patient/prescriptions/:id",
    "/api/patient/prescriptions/:id/add-to-cart"
  ];
}