import { Request, Response } from 'express';
import { Express } from 'express';
import { db } from '../db';
import bcrypt from 'bcrypt';
import { eq, and } from 'drizzle-orm';
import { 
  users, 
  doctors, 
  insertUserSchema, 
  insertDoctorSchema,
  doctorTypeEnum,
  organizations
} from '../../shared/schema';
import { z } from 'zod';

// Schema para validação do cadastro de médico
const doctorRegistrationSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  doctorType: z.enum(['general', 'dentist', 'veterinarian'], {
    required_error: 'Selecione o tipo de médico',
  }),
  specialization: z.string().min(1, 'Especialização é obrigatória'),
  crm: z.string().min(1, 'CRM/CRO/CRMV é obrigatório'),
  crmState: z.string().min(1, 'Estado do registro é obrigatório'),
  bio: z.string().optional(),
  organizationId: z.number({ required_error: 'ID da organização é obrigatório' }),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type DoctorRegistrationData = z.infer<typeof doctorRegistrationSchema>;

export async function registerDoctorRegistrationRoutes(app: Express) {
  // Rota para registro de médicos
  app.post('/api/register-doctor', async (req: Request, res: Response) => {
    try {
      // Validar dados de entrada
      const validationResult = doctorRegistrationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          success: false, 
          message: 'Dados inválidos', 
          errors: validationResult.error.format() 
        });
      }
      
      const data = validationResult.data;
      
      // Verificar se o email já está em uso
      const existingUser = await db.select().from(users).where(eq(users.email, data.email));
      
      if (existingUser.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Este email já está registrado no sistema' 
        });
      }
      
      // Verificar se a organização existe
      const organizationExists = await db.query.organizations.findFirst({
        where: eq(organizations.id, data.organizationId)
      });
      
      if (!organizationExists) {
        return res.status(400).json({ 
          success: false, 
          message: 'Organização não encontrada' 
        });
      }
      
      // Gerar hash da senha
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(data.password, saltRounds);
      
      // Iniciar transação para garantir que o usuário e o médico sejam criados juntos
      // ou nenhum deles seja criado em caso de erro
      const result = await db.transaction(async (tx) => {
        // Criar usuário com role 'doctor'
        const username = `${data.email.split('@')[0].toLowerCase()}${data.organizationId}`;
        
        const newUser = await tx.insert(users).values({
          username,
          password: passwordHash,
          role: 'doctor',
          name: data.name,
          email: data.email,
          organizationId: data.organizationId,
          bio: data.bio || null,
        }).returning();
        
        if (!newUser || newUser.length === 0) {
          throw new Error('Falha ao criar usuário');
        }
        
        // Criar registro de médico
        const newDoctor = await tx.insert(doctors).values({
          userId: newUser[0].id,
          organizationId: data.organizationId,
          doctorType: data.doctorType,
          specialization: data.specialization,
          crm: data.crm,
          crmState: data.crmState,
          bio: data.bio || null,
          available: true,
          approved: false, // Médico precisa ser aprovado pelo admin da organização
        }).returning();
        
        return { user: newUser[0], doctor: newDoctor[0] };
      });
      
      // Remover a senha do objeto de resposta
      const { password, ...userWithoutPassword } = result.user;
      
      res.status(201).json({
        success: true,
        message: 'Médico registrado com sucesso! Aguardando aprovação pelo administrador da organização.',
        user: userWithoutPassword,
        doctor: result.doctor
      });
      
    } catch (error) {
      console.error('Erro ao registrar médico:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao processar o registro. Por favor, tente novamente.'
      });
    }
  });
  
  // Rota para verificar nome da organização a partir do ID (útil para o frontend mostrar o nome da organização)
  app.get('/api/organizations/:id/name', async (req: Request, res: Response) => {
    try {
      const organizationId = parseInt(req.params.id);
      
      const organization = await db.query.organizations.findFirst({
        where: eq(organizations.id, organizationId),
        columns: { id: true, name: true }
      });
      
      if (!organization) {
        return res.status(404).json({ 
          success: false, 
          message: 'Organização não encontrada' 
        });
      }
      
      res.json({
        success: true,
        name: organization.name,
        id: organization.id
      });
      
    } catch (error) {
      console.error('Erro ao buscar nome da organização:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar informações da organização' 
      });
    }
  });
  
  // Rota para listar médicos de uma organização (para o painel de admin)
  app.get('/api/organizations/:id/doctors', async (req: Request, res: Response) => {
    try {
      const organizationId = parseInt(req.params.id);
      const doctorType = req.query.type as string; // Filtra por tipo de médico (opcional)
      
      // Verificar autenticação (admin ou org_admin)
      if (!req.session?.user || (req.session.user.role !== 'admin' && req.session.user.role !== 'org_admin')) {
        return res.status(403).json({ 
          success: false, 
          message: 'Acesso negado. Apenas administradores podem listar médicos.' 
        });
      }
      
      // Se for org_admin, verificar se pertence à organização
      if (req.session.user.role === 'org_admin' && req.session.user.organizationId !== organizationId) {
        return res.status(403).json({ 
          success: false, 
          message: 'Acesso negado. Você não tem permissão para acessar esta organização.' 
        });
      }
      
      // Construir a consulta base
      let query = db
        .select({
          id: doctors.id,
          userId: doctors.userId,
          name: users.name,
          email: users.email,
          doctorType: doctors.doctorType,
          specialization: doctors.specialization,
          crm: doctors.crm,
          crmState: doctors.crmState,
          bio: doctors.bio,
          available: doctors.available,
          approved: doctors.approved,
          createdAt: doctors.createdAt
        })
        .from(doctors)
        .innerJoin(users, eq(doctors.userId, users.id))
        .where(eq(doctors.organizationId, organizationId));
      
      // Filtrar por tipo de médico se especificado
      if (doctorType && ['general', 'dentist', 'veterinarian'].includes(doctorType)) {
        query = query.where(eq(doctors.doctorType, doctorType as any));
      }
      
      const doctorsList = await query;
      
      res.json({
        success: true,
        doctors: doctorsList,
        count: doctorsList.length
      });
      
    } catch (error) {
      console.error('Erro ao listar médicos:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar lista de médicos' 
      });
    }
  });
  
  // Rota para aprovar/rejeitar um médico (admin da organização)
  app.patch('/api/organizations/:orgId/doctors/:doctorId/approve', async (req: Request, res: Response) => {
    try {
      const organizationId = parseInt(req.params.orgId);
      const doctorId = parseInt(req.params.doctorId);
      const { approved } = req.body;
      
      // Verificar autenticação (admin ou org_admin)
      if (!req.session?.user || (req.session.user.role !== 'admin' && req.session.user.role !== 'org_admin')) {
        return res.status(403).json({ 
          success: false, 
          message: 'Acesso negado. Apenas administradores podem aprovar médicos.' 
        });
      }
      
      // Se for org_admin, verificar se pertence à organização
      if (req.session.user.role === 'org_admin' && req.session.user.organizationId !== organizationId) {
        return res.status(403).json({ 
          success: false, 
          message: 'Acesso negado. Você não tem permissão para gerenciar esta organização.' 
        });
      }
      
      // Verificar se o médico existe e pertence à organização
      const doctor = await db.query.doctors.findFirst({
        where: and(
          eq(doctors.id, doctorId),
          eq(doctors.organizationId, organizationId)
        )
      });
      
      if (!doctor) {
        return res.status(404).json({ 
          success: false, 
          message: 'Médico não encontrado nesta organização' 
        });
      }
      
      // Atualizar o status de aprovação
      await db.update(doctors)
        .set({ approved: approved === true })
        .where(eq(doctors.id, doctorId));
      
      res.json({
        success: true,
        message: approved ? 'Médico aprovado com sucesso' : 'Médico rejeitado',
        status: approved ? 'approved' : 'rejected'
      });
      
    } catch (error) {
      console.error('Erro ao aprovar/rejeitar médico:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao processar a solicitação' 
      });
    }
  });
}