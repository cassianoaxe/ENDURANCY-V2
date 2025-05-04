import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { db } from "./db";
import { registerDoctorRoutes } from './routes/doctor-routes';
import { registerPatientPrescriptionRoutes } from './routes/patient-prescription-routes';
import { registerPharmacistRoutes } from './routes/pharmacist-routes';
import { registerDoctorRegistrationRoutes } from './routes/doctor-registration';
import * as fiscalRoutes from './routes/fiscal-routes';
import { registerDocumentRoutes } from './routes/document-routes';
import { registerProductionRoutes } from './routes/production-routes';
import { registerDoctorAffiliationRoutes } from './routes/doctor-affiliation-routes';
import { registerLaboratoryRoutes } from './routes/laboratory-routes';
import { registerLaboratorySamplesRoutes } from './routes/laboratory-samples';
import { registerHplcRoutes } from './routes/hplc-routes';
import { registerHplcValidationRoutes } from './routes/hplc-validation-routes';
import { registerHplcTrainingRoutes } from './routes/hplc-training-routes';
import { registerTrainerRoutes } from './routes/trainer-routes';
import equipmentRoutes from './routes/equipment-routes';
import aiChatRouter from './routes/ai-chat';
import { registerPlanRoutes } from './routes/plans';
import socialRoutes from './routes/social-routes';
import { registerFinanceiroRoutes } from './routes-financeiro';
import { registerTransparenciaRoutes } from './routes-transparencia';
import expedicaoRoutes from './routes/expedicao-routes';
import { 
  organizations, organizationDocuments, users, plans, modules, modulePlans, organizationModules,
  planModules, insertPlanModuleSchema, patients,
  // Imports para o módulo financeiro
  financialTransactions, financialCategories, employees, payroll, vacations, financialReports,
  insertFinancialTransactionSchema, insertFinancialCategorySchema, insertEmployeeSchema,
  insertPayrollSchema, insertVacationSchema, insertFinancialReportSchema,
  // Imports para o sistema de tickets
  supportTickets, ticketComments, ticketAttachments,
  insertSupportTicketSchema, insertTicketCommentSchema, insertTicketAttachmentSchema,
  // Imports para o sistema de notificações
  notifications, insertNotificationSchema,
  // Imports para perfil de usuário
  updateProfileSchema, updatePasswordSchema
} from "@shared/schema";
import { inArray, and, eq, sql, desc, asc, gte, lte, like, ilike, not, notExists } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

// Criar schemas de inserção para validação dos planos
const insertPlanSchema = createInsertSchema(plans);
// Importar rotas administrativas
import adminRouter from "./routes/admin";
// Importar rotas de integração
import zoopRouter from './routes/integrations/zoop';
import integrationsRouter from './routes/integrations/index';
// Já importamos o aiChatRouter acima
// Importar rotas de links de pagamento
import paymentLinksRouter from './routes/payment-links';
// Importar rotas de pagamento por email
import { paymentEmailRouter } from './routes/payment-email';
// Importar rotas de grupos de usuários, permissões e convites
import { registerUserGroupRoutes } from './routes/user-groups';
import { registerUserInvitationsRoutes } from './routes/user-invitations';
// Importar rotas de autenticação de pacientes
import { patientAuthRouter } from './routes/patient-auth';
// Importar rotas para gerenciamento de planos
import planChangesRouter from './routes/plan-changes';
// Importar rotas para gerenciamento de módulos
import modulesRouter from './routes/modules';
import medicalPortalRouter from './routes/medical-portal';
// Importar rotas do módulo de farmácia
import { dispensarioRouter } from './routes/dispensario-routes';
import * as notificationService from "./services/notificationService";
import { generateTicketSuggestions, getTicketSuggestionsWithDetails } from "./services/aiSuggestions";
import { z } from "zod";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { pool } from "./db";
import { sendMail, isEmailServiceConfigured, sendTemplateEmail, EmailTemplate } from "./services/email";
import { updateOrganizationPlan, cancelPlan, getOrganizationPlanDetails } from './services/subscriptions';
import { handlePaymentNotification } from './services/webhooks';
import { validatePaymentToken, processPaymentFromToken, handlePaymentFailure } from './services/payment-links';
import { initializePlans, processPlanPayment, createPlanPaymentIntent, createModulePaymentIntent, getTransactionDetails, checkPaymentStatus } from './services/payment';
import { initializePlanModules } from './initialize-plan-modules';

// Extend express-session with custom user property
declare module 'express-session' {
  interface SessionData {
    user: {
      id: number;
      username: string;
      role: 'admin' | 'org_admin' | 'doctor' | 'patient' | 'manager' | 'employee' | 'pharmacist' | 'laboratory';
      name: string;
      email: string;
      organizationId: number | null;
      profilePhoto?: string | null;
      phoneNumber?: string | null;
      bio?: string | null;
      lastPasswordChange?: Date | null;
      createdAt?: Date;
    };
  }
}

// Session store setup
const PostgresStore = pgSession(session);

// Authentication middleware
// Enhanced authentication middleware with session verification and detailed logging
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Para a rota /api/auth/me e outras rotas frequentes, não logamos todas as informações
    // para reduzir a sobrecarga no servidor e melhorar o desempenho
    const isFrequentRoute = req.path === '/api/auth/me' || 
                           req.path === '/api/notifications' || 
                           req.path === '/api/organizations';
    
    // Determinar se a rota é da API com base no path
    const isApiRoute = req.path.startsWith('/api/');
    
    // Verificar se é uma rota do módulo carteirinha
    const isCarteirinhaRoute = req.path.includes('/carteirinha/') || req.path.startsWith('/api/carteirinha');
    
    // Forçar Content-Type para JSON em rotas de carteirinha
    if (isCarteirinhaRoute) {
      res.setHeader('Content-Type', 'application/json');
    }
    
    // Sempre verificar se o usuário está autenticado
    if (!req.session || !req.session.user) {
      // Registrar a tentativa de acesso para depuração (exceto rotas frequentes)
      if (!isFrequentRoute) {
        console.log(`GET ${req.path}: Requisição sem cookie de sessão`);
      }
      
      // Para qualquer rota de API ou carteirinha, sempre retornar um erro JSON formatado
      if (isApiRoute || isCarteirinhaRoute) {
        // Garantir que o Content-Type seja application/json
        res.setHeader('Content-Type', 'application/json');
        return res.status(401).json({ 
          message: "Não autenticado", 
          error: "Unauthorized", 
          authenticated: false 
        });
      } else {
        // Para requisições de página, retornar para a página de login
        return res.redirect('/auth');
      }
    }
    
    // Update the session cookie to ensure it doesn't expire
    // mas apenas para rotas não frequentes para evitar sobrecarga
    if (!isFrequentRoute) {
      req.session.touch();
      
      // Registramos o acesso autenticado apenas para rotas não frequentes
      console.log("Authenticated access:", {
        userID: req.session.user.id,
        role: req.session.user.role,
        path: req.path
      });
    }
    
    // Continue to the next function/route
    next();
  } catch (error) {
    console.error("Error in authentication middleware:", error);
    // Sempre responder com JSON para erros em rotas da API
    res.status(500).json({ message: "Authentication error" });
  }
};

// Configure multer para uploads com destinos dinâmicos
const documentUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      // Determinar o destino com base no campo de arquivo
      if (file.fieldname === 'document') {
        cb(null, './uploads/documents');
      } else if (file.fieldname === 'logo') {
        cb(null, './uploads/logos');
      } else if (file.fieldname === 'profile') {
        cb(null, './uploads/profile-photos');
      } else if (file.fieldname === 'attachments') {
        cb(null, './uploads/attachments');
      } else {
        cb(null, './uploads/misc');
      }
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  }),
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'document') {
      // Validação para documentos organizacionais
      const allowedTypes = ['.pdf', '.doc', '.docx'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedTypes.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Apenas arquivos PDF, DOC ou DOCX são permitidos para documentos'));
      }
    } else if (file.fieldname === 'logo') {
      // Validação para logos
      const allowedTypes = ['.jpg', '.jpeg', '.png', '.svg', '.gif'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedTypes.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Apenas arquivos JPG, PNG, SVG ou GIF são permitidos para logos'));
      }
    } else {
      // Para outros tipos de arquivos, permitir sem validação específica
      cb(null, true);
    }
  }
});

// Configure multer for profile photo uploads
const profilePhotoUpload = multer({
  storage: multer.diskStorage({
    destination: './uploads/profile-photos',
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  }),
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo inválido. Apenas imagens (jpg, jpeg, png, gif) são permitidas.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // limita a 5MB
  }
});

// Configure multer for organization logo uploads
const logoUpload = multer({
  storage: multer.diskStorage({
    destination: './uploads/logos',
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
    }
  }),
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.svg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo inválido. Apenas imagens (jpg, jpeg, png, gif, svg) são permitidas.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // limita a 5MB
  }
});

// Importar rotas de teste e autenticação simplificada
import { addTestAuthRoutes } from './test-auth';
import { registerAuthRoutes } from './auth-routes';

export async function registerRoutes(app: Express): Promise<Server> {
  // Adicionar rotas de teste para diagnóstico de autenticação
  addTestAuthRoutes(app);
  
  // Adicionar rotas de autenticação simplificadas
  registerAuthRoutes(app);
  const server = createServer(app);
  
  // A sessão já foi configurada em index.ts via setupSessionMiddleware
  
  // Remover middleware de debug que estava causando muitos logs
  // Isso evita sobrecarga no servidor e reduz o número de requisições
  
  // Initialize user table with admin and other default users if they don't exist
  const initializeDefaultUsers = async () => {
    try {
      // Check if admin user exists
      const existingAdmin = await db.select().from(users).where(eq(users.username, 'admin'));
      if (existingAdmin.length === 0) {
        await db.insert(users).values({
          username: 'admin',
          password: 'admin123', // In production, this should be hashed
          role: 'admin',
          name: 'Administrador do Sistema',
          email: 'admin@endurancy.com',
        });
        console.log('Admin user created');
      }

      // Check if pharmacist user exists (temporarily using "doctor" role)
      const existingPharmacist = await db.select().from(users).where(eq(users.email, 'farmaceutico@endurancy.com'));
      if (existingPharmacist.length === 0) {
        await db.insert(users).values({
          username: 'farmaceutico',
          password: 'farmacia123', // In production, this should be hashed
          role: 'doctor', // Temporariamente usando "doctor" até atualizarmos o banco
          name: 'Farmacêutico Demo',
          email: 'farmaceutico@endurancy.com',
        });
        console.log('Pharmacist user created (using doctor role)');
      }
      
      // Check if laboratory user exists
      const existingLaboratory = await db.select().from(users).where(eq(users.email, 'admin@laboratorio.com'));
      if (existingLaboratory.length === 0) {
        await db.insert(users).values({
          username: 'laboratorio',
          password: 'lab123', // In production, this should be hashed
          role: 'laboratory',
          name: 'Laboratório Demo',
          email: 'admin@laboratorio.com',
        });
        console.log('Laboratory user created');
      }
      
      // Check if doctor user exists
      const existingDoctor = await db.select().from(users).where(eq(users.email, 'medico@endurancy.com'));
      if (existingDoctor.length === 0) {
        await db.insert(users).values({
          username: 'medico',
          password: 'medico123', // In production, this should be hashed
          role: 'doctor',
          name: 'Médico Demo',
          email: 'medico@endurancy.com',
        });
        console.log('Doctor user created');
      }
    } catch (error) {
      console.error('Error initializing default users:', error);
    }
  };
  
  // Initialize default users
  initializeDefaultUsers();
  
  // Initialize sample plans
  import('./services/payment').then(({ initializePlans }) => {
    initializePlans().then(() => {
      // Depois de inicializar os planos, inicializar os módulos dos planos
      initializePlanModules().catch(err => {
        console.error("Error initializing plan modules:", err);
      });
    });
  }).catch(err => {
    console.error("Error importing and initializing plans:", err);
  });
  
  // Function to initialize sample modules
  const initializeModules = async () => {
    try {
      // Check if modules already exist
      const existingModules = await db.select().from(modules);
      if (existingModules.length > 0) {
        console.log('Modules already initialized');
        return;
      }
      
      // Sample modules
      const sampleModules = [
        {
          name: 'Compras',
          description: 'Gerenciamento de compras e fornecedores',
          icon_name: 'ShoppingCart',
          slug: 'compras',
          is_active: true,
          type: 'logistica'
        },
        {
          name: 'Cultivo',
          description: 'Gerenciamento de plantio e monitoramento',
          icon_name: 'Leaf',
          slug: 'cultivo',
          is_active: true,
          type: 'producao'
        },
        {
          name: 'Análises',
          description: 'Relatórios e análises de desempenho',
          icon_name: 'LineChart',
          slug: 'analises',
          is_active: true,
          type: 'administrativo'
        },
        {
          name: 'Médico',
          description: 'Gerenciamento de pacientes e consultas',
          icon_name: 'Heart',
          slug: 'medico',
          is_active: true,
          type: 'saude'
        },
        {
          name: 'Jurídico',
          description: 'Gestão de processos e documentos legais',
          icon_name: 'Scale',
          slug: 'juridico',
          is_active: false,
          type: 'administrativo'
        }
      ];
      
      // Insert modules
      for (const moduleData of sampleModules) {
        const [createdModule] = await db.insert(modules)
          .values({
            ...moduleData,
            created_at: new Date(),
            updated_at: new Date()
          })
          .returning();
          
        console.log(`Created module: ${createdModule.name}`);
        
        // Create sample plans for each module
        const plans = [
          {
            module_id: createdModule.id,
            name: 'Básico',
            description: 'Acesso às funcionalidades essenciais',
            price: 149.90,
            billing_cycle: 'mensal',
            features: ['Funcionalidade básica 1', 'Funcionalidade básica 2', 'Suporte por email'],
            max_users: 5,
            is_popular: false,
            is_active: true
          },
          {
            module_id: createdModule.id,
            name: 'Profissional',
            description: 'Recursos avançados para equipes maiores',
            price: 289.90,
            billing_cycle: 'mensal',
            features: ['Todas as funcionalidades do plano Básico', 'Funcionalidade avançada 1', 'Funcionalidade avançada 2', 'Suporte prioritário'],
            max_users: 15,
            is_popular: true,
            is_active: true
          },
          {
            module_id: createdModule.id,
            name: 'Enterprise',
            description: 'Solução completa para grandes empresas',
            price: 599.90,
            billing_cycle: 'mensal',
            features: ['Todas as funcionalidades do plano Profissional', 'Funcionalidade enterprise 1', 'Suporte 24/7', 'Implementação personalizada'],
            max_users: 50,
            is_popular: false,
            is_active: true
          }
        ];
        
        for (const planData of plans) {
          await db.insert(modulePlans)
            .values({
              ...planData,
              created_at: new Date()
            });
        }
        
        console.log(`Created plans for module: ${createdModule.name}`);
      }
      
      console.log('All modules and plans initialized');
    } catch (error) {
      console.error('Error initializing modules:', error);
    }
  };
  
  // Initialize sample modules
  initializeModules();
  
  // Initialize notifications
  notificationService.createMockNotifications()
    .then(() => console.log("Mock notifications initialized"))
    .catch(err => console.error("Error initializing notifications:", err));
  
  // Auth Routes
  // Autenticação de usuários
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password, userType, orgCode, email } = req.body;
      
      console.log("Login attempt:", { 
        username, 
        email, 
        userType, 
        hasOrgCode: !!orgCode, 
        sessionID: req.sessionID,
        headers: {
          'user-agent': req.headers['user-agent'],
          'content-type': req.headers['content-type'],
          'cookie': !!req.headers.cookie // Apenas logar presença do cookie, não seu valor
        }
      });
      
      // Se temos um código de organização, verificar se é válido
      if (orgCode) {
        const orgsFound = await db.select().from(organizations).where(eq(organizations.orgCode, orgCode));
        
        // Se o código não foi encontrado ou a organização não está ativa, rejeitar o login
        if (orgsFound.length === 0 || orgsFound[0].status !== 'active') {
          console.log("Invalid organization code:", orgCode);
          return res.status(401).json({ message: "Código de organização inválido" });
        }
        
        console.log("Valid organization code:", { code: orgCode, orgId: orgsFound[0].id });
        
        // Buscar usuário pelo nome de usuário ou email e organizationId
        let usersFound = [];
        
        if (email) {
          // Se temos email, usar para buscar o usuário
          usersFound = await db.select().from(users)
            .where(and(
              eq(users.email, email),
              eq(users.organizationId, orgsFound[0].id)
            ));
          
          // Se não encontrou com email exato, e o email tem formato válido
          if (usersFound.length === 0 && email.includes('@')) {
            // Extrair a parte de usuário do email (antes do @)
            const emailBase = email.split('@')[0].toLowerCase();
            
            // Tentar encontrar por username contendo emailBase
            usersFound = await db.select().from(users)
              .where(and(
                like(users.username, `${emailBase}%`),
                eq(users.organizationId, orgsFound[0].id)
              ));
            
            console.log(`Tentativa de login com base "${emailBase}" na organização ${orgsFound[0].id}. Encontrados: ${usersFound.length}`);
          }
        } else if (username) {
          // Se temos username, verificar se deve ser buscado exatamente ou usar o formato username+id
          const possibleGeneratedUsername = username.split('@')[0].toLowerCase() + orgsFound[0].id;
          
          // Primeiro tentar com o username exato
          usersFound = await db.select().from(users)
            .where(and(
              eq(users.username, username),
              eq(users.organizationId, orgsFound[0].id)
            ));
            
          // Se não encontrar, tentar com o possível username gerado
          if (usersFound.length === 0) {
            usersFound = await db.select().from(users)
              .where(and(
                eq(users.username, possibleGeneratedUsername),
                eq(users.organizationId, orgsFound[0].id)
              ));
          }
        }
        
        if (usersFound.length === 0) {
          console.log("User not found in organization:", { username, email, orgId: orgsFound[0].id });
          return res.status(401).json({ message: "Credenciais inválidas" });
        }
        
        const user = usersFound[0];
        
        // Verificar a senha - compatível com senhas antigas e novas com hash
        let passwordValid = false;
        
        // Se a senha parece ser um hash bcrypt (começa com $2a$, $2b$, etc), usar bcrypt.compare
        if (user.password && user.password.startsWith('$2')) {
          passwordValid = await bcrypt.compare(password, user.password);
        } else {
          // Compatibilidade com senhas antigas (comparação direta)
          passwordValid = (user.password === password);
        }
        
        if (!passwordValid) {
          console.log("Invalid password for:", username || email);
          return res.status(401).json({ message: "Credenciais inválidas" });
        }
        
        // Remove password from user object before sending to client
        const { password: _, ...userWithoutPassword } = user;
        
        // Set user in session
        req.session.user = userWithoutPassword;
        
        // Salvar explicitamente a sessão
        try {
          await new Promise<void>((resolve, reject) => {
            req.session.save((err) => {
              if (err) {
                console.error("Error saving session:", err);
                reject(err);
              } else {
                resolve();
              }
            });
          });
          console.log("Login successful, sessionID:", req.sessionID);
        } catch (error) {
          console.error("Erro ao salvar sessão:", error);
        }
        
        // Determinar a rota correta com base no papel do usuário
        let redirectUrl = '/dashboard'; // Padrão
        
        // Definir destino específico baseado no papel do usuário
        switch(user.role) {
          case 'laboratory':
            redirectUrl = '/laboratory/dashboard';
            break;
          case 'doctor':
            redirectUrl = '/doctor/dashboard';
            break;
          case 'patient':
            redirectUrl = '/patient/dashboard';
            break;
          case 'pharmacist':
            redirectUrl = '/pharmacist/dashboard';
            break;
          case 'researcher':
            redirectUrl = '/researcher/dashboard';
            break;
          case 'supplier':
            redirectUrl = '/supplier/dashboard';
            break;
          case 'org_admin':
            redirectUrl = `/organization/${orgsFound[0].id}/dashboard`;
            break;
          case 'admin':
            redirectUrl = '/admin/dashboard';
            break;
          default:
            redirectUrl = '/dashboard';
        }
        
        console.log("Login successful for:", { 
          username: user.username, 
          email: user.email, 
          role: user.role, 
          orgId: orgsFound[0].id, 
          sessionID: req.sessionID,
          redirectUrl
        });
        
        // Incluir a URL de redirecionamento na resposta para o cliente
        res.json({
          ...userWithoutPassword,
          redirectUrl
        });
        return;
      }
      
      // Login normal sem código de organização
      // Buscar usuário pelo email ou nome de usuário
      let usersFound = [];
      
      if (email) {
        // Se temos email, usar para buscar o usuário exato primeiro
        usersFound = await db.select().from(users).where(eq(users.email, email));
        
        // Se não encontrou com email exato, tentar busca mais ampla para org_admin
        if (usersFound.length === 0 && email.includes('@')) {
          const emailBase = email.split('@')[0].toLowerCase();
          
          // Buscar apenas usuários que sejam org_admin, limitando a consulta para ser mais eficiente
          usersFound = await db.select().from(users)
            .where(and(
              eq(users.role, 'org_admin'),
              like(users.username, `${emailBase}%`)
            ));
          
          console.log(`Tentativa de login com email base "${emailBase}" como org_admin. Usuários encontrados:`, 
            usersFound.length > 0 ? usersFound.map(u => ({ id: u.id, username: u.username, email: u.email })) : 'Nenhum'
          );
        }
      } else if (username) {
        // Se temos username, buscar pelo username
        usersFound = await db.select().from(users).where(eq(users.username, username));
      }
      
      if (usersFound.length === 0) {
        console.log("User not found:", username || email);
        return res.status(401).json({ message: "Credenciais inválidas" });
      }
      
      // Se temos um user type, verificar se o usuário tem a role correspondente
      const user = usersFound[0];
      
      // Se userType for association_admin ou company_admin e o usuário for org_admin, permitir o login
      if (userType && user.role !== userType && 
          !((userType === 'admin' && (username === 'admin' || email === 'admin@exemplo.com')) || 
            ((userType === 'association_admin' || userType === 'company_admin') && user.role === 'org_admin'))) {
        console.log("Role mismatch:", { requestedRole: userType, actualRole: user.role });
        return res.status(401).json({ message: "Credenciais inválidas" });
      }
      
      // Verificar a senha - compatível com senhas antigas e novas com hash
      let passwordValid = false;
      
      // Se a senha parece ser um hash bcrypt (começa com $2a$, $2b$, etc), usar bcrypt.compare
      if (user.password && user.password.startsWith('$2')) {
        passwordValid = await bcrypt.compare(password, user.password);
      } else {
        // Compatibilidade com senhas antigas (comparação direta)
        passwordValid = (user.password === password);
      }
      
      if (!passwordValid) {
        console.log("Invalid password for:", username || email);
        return res.status(401).json({ message: "Credenciais inválidas" });
      }
      
      // Remove password from user object before sending to client
      const { password: _, ...userWithoutPassword } = user;
      
      // Set user in session
      req.session.user = userWithoutPassword;
      
      // Salvar explicitamente a sessão
      try {
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) {
              console.error("Error saving session:", err);
              reject(err);
            } else {
              resolve();
            }
          });
        });
        console.log("Login successful, sessionID:", req.sessionID);
      } catch (error) {
        console.error("Erro ao salvar sessão:", error);
      }
      
      // Determinar a rota correta com base no papel do usuário
      let redirectUrl = '/dashboard'; // Padrão
      
      // Definir destino específico baseado no papel do usuário
      switch(user.role) {
        case 'laboratory':
          redirectUrl = '/laboratory/dashboard';
          break;
        case 'doctor':
          redirectUrl = '/doctor/dashboard';
          break;
        case 'patient':
          redirectUrl = '/patient/dashboard';
          break;
        case 'pharmacist':
          redirectUrl = '/pharmacist/dashboard';
          break;
        case 'researcher':
          redirectUrl = '/researcher/dashboard';
          break;
        case 'supplier':
          redirectUrl = '/supplier/dashboard';
          break;
        case 'org_admin':
          redirectUrl = `/organization/${user.organizationId}/dashboard`;
          break;
        case 'admin':
          redirectUrl = '/admin/dashboard';
          break;
        default:
          redirectUrl = '/dashboard';
      }
      
      console.log("Login successful for:", { 
        username: user.username, 
        email: user.email, 
        role: user.role, 
        sessionID: req.sessionID,
        redirectUrl
      });
      
      // Incluir a URL de redirecionamento na resposta para o cliente
      res.json({
        ...userWithoutPassword,
        redirectUrl
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Falha no login. Tente novamente." });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('connect.sid', { path: '/' });
      res.json({ message: "Logged out successfully" });
    });
  });
  
  // Rota para login como administrador de uma organização
  app.post("/api/auth/login-as-admin", authenticate, async (req: Request, res: Response) => {
    const { organizationId } = req.body;
    
    try {
      // Verificar se o usuário atual é um administrador do sistema
      if (req.session.user?.role !== 'admin') {
        return res.status(403).json({ 
          success: false,
          message: "Apenas administradores do sistema podem usar essa funcionalidade"
        });
      }
      
      // Buscar a organização
      const organization = await db.query.organizations.findFirst({
        where: eq(organizations.id, organizationId)
      });
      
      if (!organization) {
        return res.status(404).json({
          success: false,
          message: "Organização não encontrada"
        });
      }
      
      // Buscar o administrador da organização ou criar um usuário de sessão temporário
      let adminUser = await db.query.users.findFirst({
        where: and(
          eq(users.organizationId, organizationId),
          eq(users.role, 'org_admin')
        )
      });
      
      if (!adminUser) {
        // Se não existir um administrador, criar um objeto de sessão baseado na organização
        const sessionUser = {
          id: -1, // ID especial para indicar usuário temporário
          username: `admin@${organization.name.toLowerCase().replace(/\s+/g, '-')}.com`,
          role: 'org_admin' as const,
          name: `Admin ${organization.name}`,
          email: organization.email || `admin@${organization.name.toLowerCase().replace(/\s+/g, '-')}.com`,
          organizationId: organization.id,
          profilePhoto: null,
          phoneNumber: organization.phone || null,
          bio: null,
          lastPasswordChange: null,
          createdAt: new Date()
        };
        
        // Salvar na sessão
        req.session.user = sessionUser;
        req.session.originalAdmin = req.session.user;
        
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) {
              console.error("Erro ao salvar sessão:", err);
              reject(err);
            } else {
              resolve();
            }
          });
        });
        
        return res.status(200).json({
          success: true,
          message: "Login como administrador temporário realizado com sucesso",
          user: sessionUser
        });
      } else {
        // Salvar o usuário admin atual para poder restaurar depois
        req.session.originalAdmin = req.session.user;
        
        // Criar sessão como o admin da organização
        const sessionUser = {
          id: adminUser.id,
          username: adminUser.username,
          role: adminUser.role,
          name: adminUser.name,
          email: adminUser.email,
          organizationId: adminUser.organizationId,
          profilePhoto: adminUser.profilePhoto,
          phoneNumber: adminUser.phoneNumber,
          bio: adminUser.bio,
          lastPasswordChange: adminUser.lastPasswordChange,
          createdAt: adminUser.createdAt
        };
        
        req.session.user = sessionUser;
        
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) {
              console.error("Erro ao salvar sessão:", err);
              reject(err);
            } else {
              resolve();
            }
          });
        });
        
        return res.status(200).json({
          success: true,
          message: "Login como administrador realizado com sucesso",
          user: sessionUser
        });
      }
    } catch (error) {
      console.error("Erro ao acessar como administrador:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao processar a solicitação"
      });
    }
  });
  
  // Rota para voltar ao login de administrador original
  app.post("/api/auth/return-to-admin", authenticate, async (req: Request, res: Response) => {
    try {
      // Verificar se existe um administrador original na sessão
      if (!req.session.originalAdmin) {
        return res.status(400).json({
          success: false,
          message: "Não há administrador original para retornar"
        });
      }
      
      // Restaurar o administrador original
      req.session.user = req.session.originalAdmin;
      
      // Remover o originalAdmin para evitar uso indevido
      delete req.session.originalAdmin;
      
      // Salvar a sessão
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error("Erro ao salvar sessão:", err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
      
      return res.status(200).json({
        success: true,
        message: "Retornado para conta de administrador",
        user: req.session.user
      });
    } catch (error) {
      console.error("Erro ao retornar para administrador:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao processar a solicitação"
      });
    }
  });
  
  app.get("/api/auth/me", (req, res) => {
    // Adicionar headers para prevenir caching, importante para autenticação
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Verificar se há cookie de sessão
    if (!req.headers.cookie) {
      console.log("GET /api/auth/me: Requisição sem cookie de sessão");
      return res.status(401).json({ message: "Não autenticado" });
    }

    // Verificar sessão e usuário
    if (!req.session) {
      console.log("GET /api/auth/me: Requisição sem objeto de sessão");
      return res.status(401).json({ message: "Não autenticado" });
    }

    // Logar o sessionID e estado
    console.log(`GET /api/auth/me: Verificando sessão ${req.sessionID}`, {
      hasSessionObject: !!req.session,
      hasUserObject: !!req.session.user,
      userRole: req.session.user?.role || 'sem_role'
    });
    
    if (req.session.user) {
      // Tocar na sessão para renovar tempo de expiração (adicionar isso pode ajudar a manter a sessão ativa)
      req.session.touch();
      res.json(req.session.user);
    } else {
      res.status(401).json({ message: "Não autenticado" });
    }
  });
  
  // Rotas para gerenciamento de pacientes (associados)
  
  // Listar pacientes para a organização atual
  app.get('/api/patients', authenticate, async (req: Request, res: Response) => {
    try {
      // Verificar se o usuário está autenticado e tem uma organização associada
      if (!req.session.user?.organizationId) {
        return res.status(403).json({ 
          success: false, 
          message: "Usuário não está associado a uma organização" 
        });
      }
      
      const organizationId = req.session.user.organizationId;
      
      // Buscar pacientes da organização
      const patientsList = await db.select({
        id: patients.id,
        userId: patients.userId,
        name: users.name,
        email: users.email,
        phone: patients.phone,
        cpf: patients.cpf,
        dateOfBirth: patients.dateOfBirth,
        gender: patients.gender,
        address: patients.address,
        emergencyContact: patients.emergencyContact,
        healthInsurance: patients.healthInsurance,
        healthInsuranceNumber: patients.healthInsuranceNumber,
        isActive: patients.isActive,
        createdAt: patients.createdAt
      })
      .from(patients)
      .leftJoin(users, eq(patients.userId, users.id))
      .where(eq(patients.organizationId, organizationId));
      
      console.log(`Encontrados ${patientsList.length} pacientes para a organização ${organizationId}`);
      
      res.json(patientsList);
    } catch (error: any) {
      console.error("Erro ao listar pacientes:", error);
      res.status(500).json({ 
        success: false, 
        message: error.message || "Erro ao buscar lista de pacientes" 
      });
    }
  });
  
  // Criar novo paciente
  app.post('/api/patients', authenticate, async (req: Request, res: Response) => {
    try {
      // Verificar se o usuário está autenticado e tem uma organização associada
      if (!req.session.user?.organizationId) {
        return res.status(403).json({ 
          success: false, 
          message: "Usuário não está associado a uma organização" 
        });
      }
      
      const organizationId = req.session.user.organizationId;
      const { name, email, cpf, gender, dateOfBirth, phone, address, emergencyContact, healthInsurance, healthInsuranceNumber } = req.body;
      
      // Validar dados obrigatórios
      if (!name || !cpf || !gender || !dateOfBirth) {
        return res.status(400).json({
          success: false,
          message: "Campos obrigatórios: nome, CPF, gênero e data de nascimento"
        });
      }
      
      // Gerar senha padrão para o usuário (pode ser alterada depois)
      const defaultPassword = "paciente123";
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      // Gerar nome de usuário único baseado no e-mail ou CPF
      const usernameBase = email ? email.split('@')[0].toLowerCase() : cpf.replace(/\D/g, '');
      const timestamp = Date.now().toString().slice(-4);
      const username = `${usernameBase}_${timestamp}`;
      
      // Primeiro criar o usuário na tabela users
      const [newUser] = await db.insert(users).values({
        username,
        name,
        email: email || `${cpf}@placeholder.com`,
        password: hashedPassword,
        role: 'patient',
        organizationId,
        createdAt: new Date()
      }).returning();
      
      if (!newUser) {
        throw new Error("Falha ao criar registro de usuário");
      }
      
      // Depois criar o registro de paciente
      const [newPatient] = await db.insert(patients).values({
        userId: newUser.id,
        organizationId,
        cpf,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        phone,
        address,
        emergencyContact,
        healthInsurance,
        healthInsuranceNumber,
        isActive: true,
        createdAt: new Date()
      }).returning();
      
      res.status(201).json({
        success: true,
        message: "Paciente cadastrado com sucesso",
        patient: {
          ...newPatient,
          name: newUser.name,
          email: newUser.email
        }
      });
    } catch (error: any) {
      console.error("Erro ao criar paciente:", error);
      res.status(500).json({ 
        success: false, 
        message: error.message || "Erro ao cadastrar paciente" 
      });
    }
  });
  
  // Excluir paciente
  app.delete('/api/patients/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Verificar se o usuário está autenticado e tem uma organização associada
      if (!req.session.user?.organizationId) {
        return res.status(403).json({ 
          success: false, 
          message: "Usuário não está associado a uma organização" 
        });
      }
      
      const organizationId = req.session.user.organizationId;
      
      // Buscar o paciente para garantir que pertence à organização
      const patient = await db.query.patients.findFirst({
        where: and(
          eq(patients.id, parseInt(id)),
          eq(patients.organizationId, organizationId)
        )
      });
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Paciente não encontrado"
        });
      }
      
      // Excluir o paciente
      await db.delete(patients).where(eq(patients.id, parseInt(id)));
      
      // Opcionalmente excluir também o usuário correspondente
      if (patient.userId) {
        await db.delete(users).where(eq(users.id, patient.userId));
      }
      
      res.json({
        success: true,
        message: "Paciente excluído com sucesso"
      });
    } catch (error: any) {
      console.error("Erro ao excluir paciente:", error);
      res.status(500).json({ 
        success: false, 
        message: error.message || "Erro ao excluir paciente" 
      });
    }
  });
  
  /* 
  // Rota para obter informações básicas de uma organização (nome, etc.) - acesso público para portal de paciente
  app.get('/api/organizations/:id/info', async (req, res) => {
    try {
      const organizationId = req.params.id;
      
      // Consultar o banco de dados para obter informações da organização
      const result = await db.query.organizations.findFirst({
        where: eq(organizations.id, parseInt(organizationId)),
        columns: {
          id: true,
          name: true,
          status: true,
          type: true,
          email: true,
          phone: true,
          website: true,
          city: true,
          state: true,
          patientPortalUrl: true
        }
      });
      
      if (!result) {
        return res.status(404).json({ message: "Organização não encontrada" });
      }
      
      // Buscar informações do plano da organização
      let planInfo = null;
      try {
        planInfo = await getOrganizationPlanDetails(parseInt(organizationId));
      } catch (planError) {
        console.error('Erro ao buscar informações do plano:', planError);
        // Não retornamos erro, apenas continuamos sem as informações do plano
      }
      
      // Retornar informações combinadas
      res.json({
        ...result,
        plan: planInfo
      });
    } catch (error) {
      console.error('Erro ao buscar informações da organização:', error);
      res.status(500).json({ message: "Erro ao buscar informações da organização" });
    }
  });
  */
  
  // Protected Routes - Organizations
  app.get("/api/organizations", authenticate, async (_req, res) => {
    try {
      console.log("Obtendo lista de organizações (método simplificado)...");
      
      // Usar o método select() para consultar as organizações
      const orgResults = await db.select()
        .from(organizations)
        .orderBy(desc(organizations.id));
      
      console.log(`Método db.select() encontrou ${orgResults.length} organizações`);
      
      if (orgResults.length > 0) {
        console.log(`Primeiras organizações: ${orgResults.slice(0, 3).map(org => org.id).join(', ')}`);
      }
      
      res.json(orgResults);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      res.status(500).json({ message: "Failed to fetch organizations" });
    }
  });
  
  // Get users associated with an organization
  app.get("/api/organizations/:id/users", async (req, res) => {
    try {
      const organizationId = parseInt(req.params.id);
      if (isNaN(organizationId)) {
        return res.status(400).json({ message: "Invalid organization ID" });
      }
      
      const orgUsers = await db
        .select()
        .from(users)
        .where(eq(users.organizationId, organizationId));
      
      res.json(orgUsers);
    } catch (error) {
      console.error("Error fetching organization users:", error);
      res.status(500).json({ message: "Failed to fetch organization users" });
    }
  });
  
  // Rota para detalhe de uma organização específica
  app.get("/api/organizations/:id", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Buscando detalhes da organização com ID: ${id}`);
      
      const [organization] = await db.select()
        .from(organizations)
        .where(eq(organizations.id, parseInt(id)));
      
      if (!organization) {
        console.log(`Organização com ID ${id} não encontrada`);
        return res.status(404).json({ message: "Organization not found" });
      }
      
      console.log(`Organização encontrada: ${organization.name}`);
      res.json(organization);
    } catch (error) {
      console.error("Error fetching organization details:", error);
      res.status(500).json({ message: "Failed to fetch organization details" });
    }
  });
  
  // Rota para visualizar o documento de uma organização
  app.get("/api/organizations/:id/document", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Buscar o documento da organização
      const [document] = await db.select()
        .from(organizationDocuments)
        .where(eq(organizationDocuments.organizationId, parseInt(id)));
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Em um ambiente real, isso seria um link para o documento armazenado
      // ou seria retornado diretamente como um arquivo
      res.json({ 
        documentUrl: document.documentUrl,
        documentType: document.documentType,
        message: "Em um ambiente de produção, o documento seria exibido ou baixado aqui."
      });
    } catch (error) {
      console.error("Error fetching organization document:", error);
      res.status(500).json({ message: "Failed to fetch organization document" });
    }
  });

  // Modificando para permitir upload de documento e logo simultaneamente
  app.post("/api/organizations", documentUpload.fields([
    { name: 'document', maxCount: 1 },
    { name: 'logo', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const organizationData = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Verificar se o documento principal foi enviado
      // NOTA: Para o fluxo de cadastro rápido, podemos tornar o documento opcional
      // Se precisarmos validar o documento novamente, remova o comentário desta validação
      /*
      if (!files || !files.document || files.document.length === 0) {
        return res.status(400).json({ message: "Document file is required" });
      }
      */
      
      const documentFile = files.document[0];
      const logoFile = files.logo && files.logo.length > 0 ? files.logo[0] : null;

      // Create organization
      // Remover campos que poderiam ter valores nulos
      const { plan, ...restOrgData } = organizationData;
      
      // Garantir que o campo planId está presente e definido corretamente
      const planId = organizationData.planId ? parseInt(organizationData.planId.toString()) : 0;
      
      // Buscar o nome do plano com base no planId, se disponível
      let planName = 'Básico';
      if (planId > 0) {
        try {
          const planDetails = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
          if (planDetails && planDetails.length > 0) {
            planName = planDetails[0].name;
          }
        } catch (err) {
          console.log("Erro ao buscar detalhes do plano:", err);
          // Em caso de erro, manter o valor padrão
        }
      }
      
      // Criar objeto de dados limpo para inserção
      const cleanOrgData = {
        ...restOrgData,
        plan: planName || 'Básico', // Garantir valor não nulo para o campo plan
        planId: planId, 
        status: 'active', // Definido como ativo por padrão para aparecer imediatamente na listagem
        planHistory: JSON.stringify([{
          planId: planId,
          planName: planName || 'Básico',
          date: new Date(),
          action: "inicial",
          userId: null,
          status: "pendente"
        }]),
        createdAt: new Date()
      };

      // Verificar se plan está realmente definido antes de inserir
      if (!cleanOrgData.plan) {
        cleanOrgData.plan = 'Básico';
      }

      console.log("Dados da organização para inserção:", JSON.stringify({
        ...cleanOrgData,
        password: '****', // Não logar senha
        confirmPassword: '****' // Não logar senha
      }, null, 2));
      
      // Criar a organização com dados limpos e garantir que plan e planId estão definidos
      const [organization] = await db.insert(organizations)
        .values(cleanOrgData)
        .returning();

      // Store document information
      await db.insert(organizationDocuments)
        .values({
          organizationId: organization.id,
          documentType: organizationData.type === 'Empresa' ? 'contrato_social' : 'estatuto',
          documentUrl: documentFile.path,
        });
        
      // Se tiver logo, salvar o caminho
      if (logoFile) {
        try {
          console.log("Logo file information:", JSON.stringify({
            filename: logoFile.filename,
            path: logoFile.path,
            mimetype: logoFile.mimetype,
            size: logoFile.size
          }, null, 2));
          
          // Atualizar a organização com o caminho do logo
          await db.update(organizations)
            .set({ logo: `/uploads/logos/${logoFile.filename}` })
            .where(eq(organizations.id, organization.id));
        } catch (error) {
          console.error("Erro ao processar logo da organização:", error);
          // Em caso de erro, usar logo padrão mas não falhar o processo
          await db.update(organizations)
            .set({ logo: '/uploads/logos/default-logo.svg' })
            .where(eq(organizations.id, organization.id));
        }
      } else {
        // Usar logo padrão
        await db.update(organizations)
          .set({ logo: '/uploads/logos/default-logo.svg' })
          .where(eq(organizations.id, organization.id));
      }

      // Gerar código único para a organização
      const orgCode = `ORG-${organization.id}-${Date.now().toString(36).toUpperCase()}`;
      
      // Gerar link do portal do paciente (usando URLs relativas)
      // Verificar se estamos em ambiente de produção (Replit)
      const isProduction = process.env.NODE_ENV === 'production' || (process.env.BASE_URL && process.env.BASE_URL.includes('replit.app'));
      
      // Usar formato adequado para cada ambiente, com URLs relativas
      const patientPortalUrl = isProduction
        ? `/patient-login?organizationId=${organization.id}`
        : `/patient/login?orgId=${organization.id}`;
      
      // Atualizar organização com o código e link do portal
      await db.update(organizations)
        .set({ 
          orgCode,
          patientPortalUrl 
        })
        .where(eq(organizations.id, organization.id));
      
      // Criar usuário administrador automaticamente
      try {
        // Hash da senha fornecida
        const hashedPassword = await bcrypt.hash(organizationData.password || 'changeme', 10);
        
        // Criar usuário com perfil de org_admin
        const [adminUser] = await db.insert(users)
          .values({
            username: organizationData.email.split('@')[0].toLowerCase() + organization.id,
            email: organizationData.email,
            password: hashedPassword,
            name: organizationData.adminName || 'Administrador',
            role: 'org_admin',
            organizationId: organization.id,
            bio: `Administrador da organização ${organizationData.name}`,
            lastPasswordChange: new Date(),
            createdAt: new Date(),
          })
          .returning();
          
        console.log(`Usuário administrador criado: ${adminUser.username}`);
        
        // Construir os links de acesso (usando URLs relativas)
        // Para links enviados por e-mail, ainda precisamos do domínio completo
        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
        // Mas usamos caminhos relativos para maximizar compatibilidade
        const accessLink = new URL('/login', baseUrl).toString();
        const passwordLink = new URL(`/reset-password?code=${orgCode}`, baseUrl).toString();
        
        // Importar o serviço estruturado de links de pagamento
        const { createAndSendPaymentLink } = await import('./services/payment-links');
        
        // Criar e enviar link de pagamento utilizando o serviço estruturado
        const paymentLinkSent = await createAndSendPaymentLink({
          organizationId: organization.id,
          planId: planId,
          email: organizationData.email,
          adminName: organizationData.adminName || 'Administrador',
          organizationName: organizationData.name
        });
        
        console.log(`Link de pagamento enviado: ${paymentLinkSent ? 'Sucesso' : 'Falha'}`);
        
        // Se falhar o envio com o serviço estruturado, tenta método alternativo
        if (!paymentLinkSent) {
          console.log("Tentando método alternativo de envio de link de pagamento...");
          
          // Buscar mais detalhes do plano selecionado
          const [planDetails] = await db.select().from(plans).where(eq(plans.id, planId));
          
          // Gerar um token para o link de pagamento (método alternativo)
          const paymentToken = uuidv4();
          
          // Construir a URL de pagamento
          const paymentLink = new URL(`/payment?token=${paymentToken}&org=${organization.id}&plan=${planId}`, baseUrl).toString();
          
          // Enviar e-mail com link de pagamento pelo método alternativo
          await sendTemplateEmail(
            organizationData.email,
            "Finalizar Pagamento - Endurancy",
            "payment_link",
            {
              organizationName: organizationData.name,
              adminName: organizationData.adminName || "Administrador",
              planName: planDetails ? planDetails.name : 'Padrão',
              paymentLink: paymentLink,
              username: adminUser.username
            }
          );
        }
        
        // Também enviar e-mail para administração sobre nova organização registrada
        await sendMail({
          to: process.env.ADMIN_EMAIL || 'admin@endurancy.app',
          subject: `Nova organização registrada: ${organizationData.name}`,
          html: `
            <h1>Nova organização registrada</h1>
            <p><strong>Nome:</strong> ${organizationData.name}</p>
            <p><strong>Administrador:</strong> ${organizationData.adminName}</p>
            <p><strong>Email:</strong> ${organizationData.email}</p>
            <p><strong>Plano selecionado:</strong> ${planDetails ? planDetails.name : 'Padrão'}</p>
            <p><strong>ID da organização:</strong> ${organization.id}</p>
            <p>Link de aprovação manual: <a href="${baseUrl}/admin/organizations/${organization.id}">Ver Detalhes</a></p>
          `
        });
        
        console.log(`E-mail com link de pagamento enviado para ${organizationData.email}`);
      } catch (userError) {
        console.error("Erro ao criar usuário admin:", userError);
        // Não interromper o fluxo se a criação do usuário ou envio de e-mail falhar
      }

      // Atribuir módulos com base no plano selecionado
      try {
        if (planId > 0) {
          console.log(`Atribuindo módulos para organização ${organization.id} com planId ${planId}`);
          
          // Buscar módulos disponíveis para este plano
          const planModulesList = await db.select()
            .from(planModules)
            .where(eq(planModules.planId, planId));
            
          console.log(`Encontrados ${planModulesList.length} módulos para o plano ${planId}`);
          
          // Para cada módulo do plano, criar uma relação com a organização
          for (const planModule of planModulesList) {
            await db.insert(organizationModules)
              .values({
                organization_id: organization.id,
                module_id: planModule.module_id,
                status: 'active',
                start_date: new Date(),
                // Módulos adicionados via criação de organização têm validade de 30 dias para testes
                expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                created_at: new Date(),
                updated_at: new Date()
              });
              
            console.log(`Módulo ${planModule.module_id} atribuído à organização ${organization.id}`);
          }
        } else {
          console.log(`Organização ${organization.id} cadastrada com plano básico, nenhum módulo premium atribuído.`);
        }
      } catch (moduleError) {
        console.error("Erro ao atribuir módulos:", moduleError);
        // Não interromper o fluxo se a atribuição de módulos falhar
      }

      // Retornar a organização com campos adicionais
      res.status(201).json({
        ...organization,
        orgCode,
        status: 'active',
        message: "Organização criada com sucesso. Verifique seu email para finalizar o pagamento."
      });
    } catch (error) {
      console.error("Error creating organization:", error);
      res.status(500).json({ message: "Failed to create organization" });
    }
  });
  
  // Update organization status
  app.patch("/api/organizations/:id", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;
      
      if (!status || !['pending', 'approved', 'rejected', 'active'].includes(status)) {
        return res.status(400).json({ message: "Valid status is required" });
      }
      
      // Check if the organization exists
      const existingOrg = await db.select()
        .from(organizations)
        .where(eq(organizations.id, parseInt(id)));
        
      if (existingOrg.length === 0) {
        return res.status(404).json({ message: "Organization not found" });
      }
      
      // Gerar um código único para a organização se estiver sendo aprovada
      let orgCode = null;
      if (status === 'approved') {
        // Gerar um código único baseado no ID e em um timestamp
        orgCode = `ORG-${id}-${Date.now().toString(36).toUpperCase()}`;
        
        // Verificar se já existe uma organização com este código (por segurança)
        const existingWithCode = await db.select()
          .from(organizations)
          .where(eq(organizations.orgCode, orgCode));
        
        if (existingWithCode.length > 0) {
          // Se por acaso houver colisão, regenerar o código
          orgCode = `ORG-${id}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
        }
        
        console.log(`Organization ${id} approved with code: ${orgCode}`);
        
        // Aqui seria o lugar para criar um banco de dados específico para a organização
        // Por enquanto, vamos apenas registrar o código único
      }
      
      // Update the organization status and code if applicable
      const [updatedOrg] = await db.update(organizations)
        .set({ 
          status: status,
          ...(orgCode ? { orgCode } : {})
        })
        .where(eq(organizations.id, parseInt(id)))
        .returning();
      
      // Enviar e-mail de acordo com o status atualizado
      try {
        const organization = existingOrg[0];
        
        if (status === 'approved') {
          // E-mail de aprovação (usando URL relativa)
          const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
          // Construir URL completa para e-mail usando URL relativa
          const loginUrl = new URL(`/login?org=${orgCode}`, baseUrl).toString();
          
          await sendTemplateEmail(
            organization.email,
            "Organização Aprovada - Endurancy",
            "organization_approved",
            {
              organizationName: organization.name,
              adminName: organization.adminName || "Administrador",
              orgCode,
              loginUrl
            }
          );
          console.log(`Approval email sent to ${organization.email}`);
        } 
        else if (status === 'rejected') {
          // E-mail de rejeição
          await sendTemplateEmail(
            organization.email,
            "Solicitação Não Aprovada - Endurancy",
            "organization_rejected",
            {
              organizationName: organization.name,
              adminName: organization.adminName || "Administrador",
              rejectionReason: rejectionReason || "A solicitação não atendeu aos requisitos necessários."
            }
          );
          console.log(`Rejection email sent to ${organization.email}`);
        }
      } catch (emailError) {
        console.error("Error sending status update email:", emailError);
        // Não interromper o fluxo se o e-mail falhar
      }
      
      res.json(updatedOrg);
    } catch (error) {
      console.error("Error updating organization:", error);
      res.status(500).json({ message: "Failed to update organization" });
    }
  });
  
  // Plans Routes
  app.get("/api/plans", authenticate, async (req, res) => {
    try {
      // Primeiro buscar todos os planos
      const plansList = await db.select().from(plans);
      
      // Para cada plano, buscar os módulos associados
      const plansWithModules = await Promise.all(plansList.map(async (plan) => {
        // Buscar todas as associações plano-módulo para este plano
        const planModulesList = await db.select()
          .from(planModules)
          .where(eq(planModules.plan_id, plan.id));
        
        // Buscar detalhes dos módulos
        const moduleDetails = [];
        if (planModulesList.length > 0) {
          for (const pm of planModulesList) {
            const moduleInfo = await db.select()
              .from(modules)
              .where(eq(modules.id, pm.module_id));
            
            if (moduleInfo.length > 0) {
              moduleDetails.push(moduleInfo[0]);
            }
          }
        }
        
        // Retornar o plano com a lista de módulos
        return {
          ...plan,
          modules: moduleDetails
        };
      }));
      
      res.json(plansWithModules);
    } catch (error) {
      console.error("Error fetching plans with modules:", error);
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });
  
  // Rota pública para planos (usado no cadastro de organização)
  app.get("/api/public/plans", async (req, res) => {
    try {
      console.log("Acessando rota pública de planos para registro");
      // Buscar todos os planos
      const plansList = await db.select().from(plans);
      
      // Filtrar para garantir que o plano freemium (tier: free) esteja incluído
      const filteredPlans = plansList.filter(plan => 
        ['free', 'seed', 'grow', 'pro'].includes(plan.tier)
      );
      
      // Para cada plano, buscar os módulos associados
      const plansWithModules = await Promise.all(filteredPlans.map(async (plan) => {
        // Buscar todas as associações plano-módulo para este plano
        const planModulesList = await db.select()
          .from(planModules)
          .where(eq(planModules.plan_id, plan.id));
        
        // Buscar detalhes dos módulos
        const moduleDetails = [];
        if (planModulesList.length > 0) {
          for (const pm of planModulesList) {
            const moduleInfo = await db.select()
              .from(modules)
              .where(eq(modules.id, pm.module_id));
            
            if (moduleInfo.length > 0) {
              moduleDetails.push(moduleInfo[0]);
            }
          }
        }
        
        // Retornar o plano com a lista de módulos
        return {
          ...plan,
          modules: moduleDetails
        };
      }));
      
      // Log para depuração
      console.log(`Retornando ${plansWithModules.length} planos para cadastro, incluindo tiers:`, 
        plansWithModules.map(p => p.tier).join(', '));
      
      res.json(plansWithModules);
    } catch (error) {
      console.error("Error fetching public plans:", error);
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });
  
  // Rota para estatísticas dos planos
  app.get("/api/plans/stats", authenticate, async (req, res) => {
    try {
      // Verificar se o usuário é um administrador
      if (req.session.user?.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem acessar estatísticas." });
      }
      
      // Buscar todos os planos
      const allPlans = await db.select().from(plans);
      
      // Buscar organizações com planos pagos (não free)
      const activeSubscribers = await db.select({ count: sql<number>`count(*)` })
        .from(organizations)
        .where(
          and(
            notExists(
              db.select().from(plans)
                .where(
                  and(
                    eq(plans.id, organizations.planId),
                    eq(plans.tier, 'free')
                  )
                )
            ),
            eq(organizations.status, 'active')
          )
        );
      
      // Calculando a receita mensal
      let revenueMonthly = 0;
      
      // Obter todas as organizações com seus planos
      const orgsWithPlans = await db.select({
        organization: organizations,
        plan: plans
      })
      .from(organizations)
      .leftJoin(plans, eq(organizations.planId, plans.id))
      .where(eq(organizations.status, 'active'));
      
      // Somar a receita de cada organização ativa
      for (const item of orgsWithPlans) {
        if (item.plan && item.plan.tier !== 'free') {
          revenueMonthly += parseFloat(item.plan.price.toString());
        }
      }
      
      // Total de organizações
      const totalOrgs = await db.select({ count: sql<number>`count(*)` })
        .from(organizations);
      
      // Taxa de conversão (assinantes pagos / total de organizações)
      const conversionRate = totalOrgs[0].count > 0 
        ? Math.round((activeSubscribers[0].count / totalOrgs[0].count) * 100) 
        : 0;
      
      res.json({
        totalPlans: allPlans.length,
        activeSubscribers: activeSubscribers[0].count,
        conversionRate,
        revenueMonthly
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas dos planos:", error);
      res.status(500).json({ message: "Erro ao buscar estatísticas dos planos" });
    }
  });
  
  // Rota para criar um novo plano (apenas administradores)
  app.post("/api/plans", authenticate, async (req: Request, res: Response) => {
    try {
      // Verificar se o usuário é um administrador
      if (req.session.user?.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem criar planos." });
      }
      
      // Validar o body usando o schema de inserção
      const planData = insertPlanSchema.safeParse(req.body);
      
      if (!planData.success) {
        return res.status(400).json({ 
          message: "Dados do plano inválidos", 
          errors: planData.error.errors 
        });
      }
      
      // Criar o novo plano
      const [newPlan] = await db.insert(plans)
        .values(planData.data)
        .returning();
      
      console.log(`Novo plano "${newPlan.name}" criado pelo administrador ${req.session.user?.username}`);
      
      return res.status(201).json(newPlan);
    } catch (error) {
      console.error("Erro ao criar plano:", error);
      return res.status(500).json({ message: "Erro ao criar plano. Tente novamente mais tarde." });
    }
  });
  
  // Rota para atualizar um plano existente (apenas administradores)
  app.put("/api/plans/:id", authenticate, async (req: Request, res: Response) => {
    try {
      // Verificar se o usuário é um administrador
      if (req.session.user?.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem atualizar planos." });
      }
      
      const planId = parseInt(req.params.id);
      
      if (isNaN(planId)) {
        return res.status(400).json({ message: "ID de plano inválido" });
      }
      
      // Verificar se o plano existe
      const existingPlan = await db.select()
        .from(plans)
        .where(eq(plans.id, planId));
      
      if (existingPlan.length === 0) {
        return res.status(404).json({ message: "Plano não encontrado" });
      }
      
      // Validar o body usando o schema de inserção
      const planData = insertPlanSchema.safeParse(req.body);
      
      if (!planData.success) {
        return res.status(400).json({ 
          message: "Dados do plano inválidos", 
          errors: planData.error.errors 
        });
      }
      
      // Atualizar o plano
      const [updatedPlan] = await db.update(plans)
        .set(planData.data)
        .where(eq(plans.id, planId))
        .returning();
      
      console.log(`Plano ID ${planId} atualizado pelo administrador ${req.session.user?.username}`);
      
      return res.status(200).json(updatedPlan);
    } catch (error) {
      console.error("Erro ao atualizar plano:", error);
      return res.status(500).json({ message: "Erro ao atualizar plano. Tente novamente mais tarde." });
    }
  });
  
  // Rota para deletar um plano (apenas para administradores)
  app.delete("/api/plans/:id", authenticate, async (req: Request, res: Response) => {
    try {
      // Verificar se o usuário é um administrador
      if (req.session.user?.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem deletar planos." });
      }
      
      const planId = parseInt(req.params.id);
      
      if (isNaN(planId)) {
        return res.status(400).json({ message: "ID de plano inválido" });
      }
      
      // Verificar se há organizações usando este plano
      const organizationsWithPlan = await db.select()
        .from(organizations)
        .where(eq(organizations.planId, planId));
      
      if (organizationsWithPlan.length > 0) {
        return res.status(400).json({ 
          message: "Não é possível excluir este plano pois está sendo utilizado por uma ou mais organizações",
          organizationsCount: organizationsWithPlan.length 
        });
      }
      
      // Verificar se há solicitações de mudança de plano pendentes para este plano
      const pendingRequests = await db.select()
        .from(organizations)
        .where(
          and(
            eq(organizations.requestedPlanId, planId),
            eq(organizations.status, 'pending_plan_change')
          )
        );
      
      if (pendingRequests.length > 0) {
        return res.status(400).json({ 
          message: "Não é possível excluir este plano pois há solicitações de mudança pendentes",
          requestsCount: pendingRequests.length 
        });
      }
      
      // Excluir o plano
      await db.delete(plans).where(eq(plans.id, planId));
      
      // Registrar log de auditoria (opcional)
      console.log(`Plano ID ${planId} excluído pelo administrador ${req.session.user?.username}`);
      
      return res.status(200).json({ 
        success: true, 
        message: "Plano excluído com sucesso" 
      });
    } catch (error) {
      console.error("Erro ao excluir plano:", error);
      return res.status(500).json({ 
        message: "Erro ao excluir plano. Tente novamente mais tarde." 
      });
    }
  });
  
  // Payment Routes
  app.post("/api/payments/create-intent", async (req, res) => {
    try {
      const { planId, organizationId } = req.body;
      
      console.log("Recebido request para criar payment intent:", { planId, organizationId });
      
      if (!planId) {
        console.error("Erro: planId não foi fornecido na requisição");
        return res.status(400).json({ 
          success: false, 
          message: "ID do plano é obrigatório"
        });
      }
      
      // Validar planId
      const numericPlanId = Number(planId);
      if (isNaN(numericPlanId) || numericPlanId <= 0) {
        console.error("Erro: planId inválido:", planId);
        return res.status(400).json({
          success: false,
          message: "ID do plano inválido"
        });
      }
      
      // Validar organizationId se fornecido
      let numericOrgId = undefined;
      if (organizationId !== undefined) {
        numericOrgId = Number(organizationId);
        if (isNaN(numericOrgId) || numericOrgId <= 0) {
          console.error("Erro: organizationId inválido:", organizationId);
          return res.status(400).json({
            success: false,
            message: "ID da organização inválido"
          });
        }
      }
      
      console.log("Criando payment intent com valores validados:", { 
        planId: numericPlanId, 
        organizationId: numericOrgId 
      });
      
      // Para o registro inicial de organização, marcamos isNewOrganization como true
      // e passamos o organizationId se disponível (pode ser de uma organização recém-criada)
      try {
        // Utilizando a função importada de createPlanPaymentIntent
        const clientSecret = await createPlanPaymentIntent(
          numericPlanId, 
          numericOrgId,
          { isNewOrganization: true } // metadata
        );
        
        if (!clientSecret) {
          console.error("Falha ao gerar client secret para planId:", planId);
          return res.status(500).json({ 
            success: false, 
            message: "Não foi possível gerar o token de pagamento. Tente novamente mais tarde."
          });
        }
        
        console.log("Client Secret gerado com sucesso (primeiros 10 caracteres):", clientSecret.substring(0, 10));
        return res.json({ success: true, clientSecret });
      } catch (error: any) {
        console.error("Erro ao criar payment intent:", error);
        return res.status(500).json({ 
          success: false, 
          message: error.message || "Falha ao criar intent de pagamento",
          error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
        });
      }
    } catch (error: any) {
      console.error("Erro ao processar requisição:", error);
      return res.status(500).json({ 
        success: false, 
        message: error.message || "Erro interno do servidor",
        error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      });
    }
  });
  
  app.post("/api/payments/confirm", async (req, res) => {
    try {
      const { paymentIntentId, organizationId } = req.body;
      
      console.log("Recebida solicitação para confirmar pagamento:", { 
        paymentIntentId, 
        organizationId,
        organizationIdType: typeof organizationId 
      });
      
      if (!paymentIntentId) {
        console.error("paymentIntentId é obrigatório");
        return res.status(400).json({ 
          success: false,
          message: "ID do intent de pagamento é obrigatório" 
        });
      }
      
      if (!organizationId) {
        console.error("organizationId é obrigatório");
        return res.status(400).json({ 
          success: false,
          message: "ID da organização é obrigatório" 
        });
      }
      
      // Converter para número
      const numericOrgId = Number(organizationId);
      if (isNaN(numericOrgId) || numericOrgId <= 0) {
        console.error("organizationId inválido:", organizationId);
        return res.status(400).json({ 
          success: false,
          message: "ID da organização inválido" 
        });
      }
      
      // Verify payment was successful
      console.log("Verificando status do pagamento:", paymentIntentId);
      // Utilizando a função checkPaymentStatus importada
      const paymentStatus = await checkPaymentStatus(paymentIntentId);
      console.log("Status do pagamento:", paymentStatus);
      
      if (paymentStatus === 'approved' || paymentStatus === 'succeeded') {
        // Buscar organização antes de atualizar
        const [organization] = await db.select()
          .from(organizations)
          .where(eq(organizations.id, organizationId));
          
        if (!organization) {
          return res.status(404).json({ message: "Organization not found" });
        }
        
        // Buscar informações do plano através do paymentStatus
        // Obter as informações do status retornado pela API Zoop
        const paymentData = await getTransactionDetails(paymentIntentId);
        const planId = parseInt(paymentData.metadata?.planId || '0', 10);
        
        if (planId <= 0) {
          return res.status(400).json({ message: "ID do plano não encontrado nos metadados do pagamento" });
        }
        
        const [plan] = await db.select().from(plans).where(eq(plans.id, planId));
        
        if (!plan) {
          return res.status(404).json({ message: "Plano não encontrado" });
        }
        
        // Processar o pagamento para atribuir o plano e configurar os dados financeiros
        const paymentProcessed = await processPlanPayment(paymentIntentId, organizationId);
        
        if (!paymentProcessed) {
          return res.status(500).json({ message: "Erro ao processar o pagamento" });
        }
        
        // Gerar um código da organização, se ainda não tiver
        let orgCode = organization.orgCode;
        if (!orgCode) {
          // Gerar um código único baseado no ID e em um timestamp
          orgCode = `ORG-${organizationId}-${Date.now().toString(36).toUpperCase()}`;
        }
        
        // Update organization status to active e configurar código
        const [updatedOrg] = await db.update(organizations)
          .set({ 
            status: 'active',
            orgCode,
            // Garantir que o plano está atualizado
            planId: planId,
            planTier: plan.tier
          })
          .where(eq(organizations.id, organizationId))
          .returning();
          
        // Associar os módulos do plano à organização
        try {
          // Buscar módulos associados ao plano
          const planModulesList = await db.select()
            .from(planModules)
            .where(eq(planModules.plan_id, planId));
          
          console.log(`Encontrados ${planModulesList.length} módulos para o plano ${planId}`);
          
          // Inserir os módulos para a organização
          for (const planModule of planModulesList) {
            // Verificar se já existe este módulo para a organização
            const existingModule = await db.select()
              .from(organizationModules)
              .where(
                and(
                  eq(organizationModules.organization_id, organizationId),
                  eq(organizationModules.module_id, planModule.module_id)
                )
              );
            
            if (existingModule.length === 0) {
              // Inserir apenas se não existir
              await db.insert(organizationModules).values({
                organization_id: organizationId,
                module_id: planModule.module_id,
                plan_id: planId, // Associar ao plano também
                active: true,
                status: 'active',
                start_date: new Date(),
                expiry_date: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 dias
                billing_day: new Date().getDate(), // Para cobrança recorrente
                created_at: new Date(),
                updated_at: new Date()
              });
              
              console.log(`Módulo ${planModule.module_id} associado à organização ${organizationId}`);
            }
          }
        } catch (moduleError) {
          console.error("Erro ao configurar módulos da organização:", moduleError);
          // Continuar mesmo com erro nos módulos para não bloquear a ativação
        }
        
        // Enviar e-mail de confirmação de pagamento e ativação da conta
        try {
          if (organization.email) {
            const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
            // Usar URL relativa para e-mail de confirmação de pagamento
            const loginUrl = new URL(`/login?org=${organization.orgCode}`, baseUrl).toString();
            
            await sendTemplateEmail(
              organization.email,
              "Pagamento Confirmado - Sua Organização Está Ativa!",
              "organization_approved", // Reutilizando o template de aprovação
              {
                organizationName: organization.name,
                adminName: organization.adminName || "Administrador",
                orgCode: organization.orgCode,
                loginUrl
              }
            );
            console.log(`Payment confirmation email sent to ${organization.email}`);
          }
        } catch (emailError) {
          console.error("Error sending payment confirmation email:", emailError);
          // Não interromper o fluxo se o e-mail falhar
        }
        
        res.json({ success: true, organization: updatedOrg });
      } else {
        res.status(400).json({ 
          success: false, 
          message: "Payment not completed",
          status: paymentStatus
        });
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });

  // Rota para alternar o modo de teste de email
  app.post("/api/email/toggle-test-mode", authenticate, async (req, res) => {
    try {
      // Esta rota apenas simula a alternância entre modos de teste/produção
      // Na implementação real, alteraria uma variável de ambiente ou configuração
      const currentMode = process.env.EMAIL_TEST_MODE === 'true';
      // Inverte o modo atual
      process.env.EMAIL_TEST_MODE = (!currentMode).toString();
      
      res.json({ 
        success: true, 
        testMode: process.env.EMAIL_TEST_MODE === 'true',
        message: `Modo de teste ${process.env.EMAIL_TEST_MODE === 'true' ? 'ativado' : 'desativado'} com sucesso.`
      });
    } catch (error) {
      console.error("Erro ao alternar modo de teste:", error);
      res.status(500).json({ success: false, message: "Erro ao alternar modo de teste" });
    }
  });

// Rota de teste para o envio de e-mail (apenas para desenvolvimento)
  app.post("/api/email/test", authenticate, async (req, res) => {
    try {
      const { email, template } = req.body;
      
      if (!email || !template) {
        return res.status(400).json({ 
          message: "Email and template are required",
          availableTemplates: [
            'organization_registration',
            'organization_approved',
            'organization_rejected',
            'user_welcome',
            'password_reset'
          ]
        });
      }
      
      // Dados de teste para cada tipo de template
      const testData: Record<string, any> = {
        organization_registration: {
          organizationName: "Organização de Teste",
          adminName: "Administrador de Teste",
        },
        organization_approved: {
          organizationName: "Organização de Teste",
          adminName: "Administrador de Teste",
          orgCode: "ORG-TEST-123",
          loginUrl: "http://localhost:5000/login?org=ORG-TEST-123"
        },
        organization_rejected: {
          organizationName: "Organização de Teste",
          adminName: "Administrador de Teste",
          rejectionReason: "Este é apenas um e-mail de teste."
        },
        user_welcome: {
          userName: "Usuário de Teste",
          organizationName: "Organização de Teste",
          loginUrl: "http://localhost:5000/login"
        },
        password_reset: {
          userName: "Usuário de Teste",
          resetLink: "http://localhost:5000/reset-password?token=123456",
          expirationTime: "24 horas"
        }
      };
      
      const success = await sendTemplateEmail(
        email,
        `Teste de E-mail - ${template}`,
        template as any,
        testData[template] || {}
      );
      
      if (success) {
        res.json({ success: true, message: `E-mail de teste enviado para ${email}` });
      } else {
        res.status(500).json({ success: false, message: "Erro ao enviar e-mail de teste" });
      }
    } catch (error) {
      console.error("Erro ao testar envio de e-mail:", error);
      res.status(500).json({ message: "Erro ao testar envio de e-mail" });
    }
  });
  
  // Module Management Routes
  app.get("/api/modules", async (_req, res) => {
    try {
      const modulesList = await db.select().from(modules);
      res.json(modulesList);
    } catch (error) {
      console.error("Error fetching modules:", error);
      res.status(500).json({ message: "Failed to fetch modules" });
    }
  });
  
  // Módulos com estatísticas
  app.get("/api/modules/stats", async (_req, res) => {
    try {
      const modulesList = await db.select().from(modules);
      
      // Cálculo de estatísticas
      const totalSales = modulesList.reduce((sum, module) => sum + (module.sales_count || 0), 0);
      const totalSubscriptions = modulesList.reduce((sum, module) => sum + (module.subscriptions_count || 0), 0);
      const totalRevenue = modulesList.reduce((sum, module) => sum + Number(module.monthly_revenue || 0), 0);
      const topModules = [...modulesList].sort((a, b) => Number(b.monthly_revenue || 0) - Number(a.monthly_revenue || 0)).slice(0, 5);
      
      res.json({
        modules: modulesList,
        stats: {
          totalSales,
          totalSubscriptions,
          totalRevenue,
          topModules
        }
      });
    } catch (error) {
      console.error("Error fetching modules stats:", error);
      res.status(500).json({ message: "Failed to fetch modules statistics" });
    }
  });
  
  // Endpoint de estatísticas de assinaturas
  app.get("/api/module-subscriptions/stats", async (req, res) => {
    try {
      const period = req.query.period || '30'; // Dias por padrão
      
      // Obter módulos com estatísticas
      const modulesList = await db.select().from(modules);
      const subscriptions = await db.select().from(organizationModules);
      
      // Calcular estatísticas de acordo com o período
      const totalRevenue = modulesList.reduce((sum, module) => sum + Number(module.monthly_revenue || 0), 0);
      const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;
      const mrr = totalRevenue; // Monthly Recurring Revenue (igual ao total de receita mensal)
      
      // Identificar módulo mais popular por número de assinaturas
      const moduleSubscriptionCounts = {};
      subscriptions.forEach(sub => {
        if (moduleSubscriptionCounts[sub.moduleId]) {
          moduleSubscriptionCounts[sub.moduleId]++;
        } else {
          moduleSubscriptionCounts[sub.moduleId] = 1;
        }
      });
      
      // Encontrar o módulo mais popular
      let mostPopularModuleId = 0;
      let maxCount = 0;
      
      Object.entries(moduleSubscriptionCounts).forEach(([moduleId, count]) => {
        if (Number(count) > maxCount) {
          mostPopularModuleId = Number(moduleId);
          maxCount = Number(count);
        }
      });
      
      // Buscar os detalhes do módulo mais popular
      const mostPopularModule = modulesList.find(m => m.id === mostPopularModuleId)?.name || 'Não disponível';
      
      // Calcular média de módulos por organização
      const organizationIds = [...new Set(subscriptions.map(sub => sub.organizationId))];
      const averageModulesPerOrg = organizationIds.length > 0 
        ? (subscriptions.length / organizationIds.length).toFixed(1) 
        : 0;
      
      // Taxa de conversão (mockada)
      const conversionRate = 12.5;
      
      res.json({
        totalRevenue,
        activeSubscriptions,
        conversionRate,
        averageModulesPerOrg,
        mostPopularModule,
        mrr
      });
    } catch (error) {
      console.error("Error fetching module subscription stats:", error);
      res.status(500).json({ message: "Failed to fetch subscription statistics" });
    }
  });

  app.get("/api/module-plans", async (_req, res) => {
    try {
      const plansList = await db.select().from(modulePlans);
      res.json(plansList);
    } catch (error) {
      console.error("Error fetching module plans:", error);
      res.status(500).json({ message: "Failed to fetch module plans" });
    }
  });
  
  // Plan-Modules (Relações entre Planos e Módulos)
  app.get("/api/plan-modules", async (_req, res) => {
    try {
      const planModulesList = await db.select().from(planModules);
      res.json(planModulesList);
    } catch (error) {
      console.error("Error fetching plan modules:", error);
      res.status(500).json({ message: "Failed to fetch plan modules" });
    }
  });
  
  app.post("/api/plan-modules", authenticate, async (req, res) => {
    try {
      const validation = insertPlanModuleSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors: validation.error.errors 
        });
      }

      // Verificar se já existe uma relação entre este plano e módulo
      const existingRelation = await db
        .select()
        .from(planModules)
        .where(
          and(
            eq(planModules.plan_id, validation.data.plan_id),
            eq(planModules.module_id, validation.data.module_id)
          )
        );
      
      if (existingRelation.length > 0) {
        return res.status(400).json({ 
          message: 'Esta relação plano-módulo já existe' 
        });
      }

      const newPlanModule = await db
        .insert(planModules)
        .values(validation.data)
        .returning();
      
      res.status(201).json(newPlanModule[0]);
    } catch (error) {
      console.error('Erro ao criar relação plano-módulo:', error);
      res.status(500).json({ message: 'Falha ao criar relação plano-módulo' });
    }
  });
  
  app.delete("/api/plan-modules/:id", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      
      const deletedPlanModule = await db
        .delete(planModules)
        .where(eq(planModules.id, parseInt(id)))
        .returning();
      
      if (deletedPlanModule.length === 0) {
        return res.status(404).json({ message: 'Relação plano-módulo não encontrada' });
      }
      
      res.json({ message: 'Relação plano-módulo removida com sucesso' });
    } catch (error) {
      console.error('Erro ao remover relação plano-módulo:', error);
      res.status(500).json({ message: 'Falha ao remover relação plano-módulo' });
    }
  });

  app.put("/api/modules/:id/status", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      if (isActive === undefined) {
        return res.status(400).json({ message: "isActive status is required" });
      }
      
      // Update module status
      const [updatedModule] = await db.update(modules)
        .set({ is_active: isActive })
        .where(eq(modules.id, parseInt(id)))
        .returning();
      
      if (!updatedModule) {
        return res.status(404).json({ message: "Module not found" });
      }
      
      res.json(updatedModule);
    } catch (error) {
      console.error("Error updating module status:", error);
      res.status(500).json({ message: "Failed to update module status" });
    }
  });
  
  // Rota para editar um módulo
  app.put("/api/modules/:id", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, icon_name, type, status } = req.body;
      
      // Validar os campos obrigatórios
      if (!name) {
        return res.status(400).json({ message: "Nome do módulo é obrigatório" });
      }
      
      // Verificar se o módulo existe
      const existingModule = await db.select()
        .from(modules)
        .where(eq(modules.id, parseInt(id)))
        .limit(1);
        
      if (existingModule.length === 0) {
        return res.status(404).json({ message: "Módulo não encontrado" });
      }
      
      // Atualizar o módulo
      const [updatedModule] = await db.update(modules)
        .set({
          name,
          description: description || null,
          icon_name: icon_name || null,
          type: type || 'core',
          status: status || 'active',
          updated_at: new Date()
        })
        .where(eq(modules.id, parseInt(id)))
        .returning();
      
      res.json(updatedModule);
    } catch (error) {
      console.error("Error updating module:", error);
      res.status(500).json({ message: "Falha ao atualizar o módulo" });
    }
  });
  
  // Rota para buscar todos os módulos por organização com dados combinados
  app.get("/api/organization-modules/all", authenticate, async (req, res) => {
    try {
      const results = await db.execute(sql`
        SELECT 
          om.id, 
          om.organization_id as "organizationId", 
          o.name as "organizationName",
          om.module_id as "moduleId",
          m.name as "moduleName",
          m.type as "moduleType",
          om.plan_id as "planId",
          mp.name as "planName",
          mp.price,
          mp.billing_cycle as "billingCycle",
          o.status,
          om.active,
          om.created_at as "createdAt"
        FROM organization_modules om
        JOIN organizations o ON om.organization_id = o.id
        JOIN modules m ON om.module_id = m.id
        JOIN module_plans mp ON om.plan_id = mp.id
        ORDER BY o.name, m.name
      `);
      
      res.json(results.rows);
    } catch (error) {
      console.error("Error fetching organization modules:", error);
      res.status(500).json({ message: "Failed to fetch organization modules" });
    }
  });


  // Rota para buscar os módulos de uma organização específica
  app.get("/api/organization-modules/:organizationId", async (req, res) => {
    try {
      const { organizationId } = req.params;
      const orgId = parseInt(organizationId);
      
      console.log("Buscando módulos para organização:", orgId);
      
      // Verificar primeiro se temos um mock em server/index.ts
      if (global.mockOrganizations) {
        // @ts-ignore - mockOrganizations é adicionado ao objeto global em server/index.ts
        const mockOrg = global.mockOrganizations.find(o => o.id === orgId);
        if (mockOrg && mockOrg.modules) {
          console.log(`Retornando ${mockOrg.modules.length} módulos mockados para organização ${orgId}`);
          return res.json(mockOrg.modules);
        }
      }
      
      // Buscar módulos da organização
      const orgModules = await db.select()
        .from(organizationModules)
        .where(eq(organizationModules.organizationId, orgId));
      
      console.log(`${orgModules.length} módulos encontrados para organização ${orgId}`);
      
      if (!orgModules.length) {
        console.log("Nenhum módulo encontrado para esta organização");
        return res.json([]);
      }
      
      // Buscar informações dos módulos associados
      const moduleIds = orgModules.map(om => om.moduleId);
      
      // Usar SQL direta para evitar o problema do nome da coluna
      const moduleDetails = await db.execute(
        sql`SELECT 
          "id", 
          "name", 
          "description", 
          "type", 
          "icon_name", 
          "is_active", 
          "slug", 
          "created_at", 
          "updated_at" 
        FROM "modules" 
        WHERE "id" IN (${sql.join(moduleIds, sql`, `)})`
      );
      
      // Verificar se temos as informações dos módulos
      if (!moduleDetails.rows || moduleDetails.rows.length === 0) {
        console.log("Nenhum detalhe de módulo encontrado para os IDs:", moduleIds);
        return res.json([]);
      }
      
      console.log("Detalhes dos módulos encontrados:", moduleDetails.rows.length);
      
      // Combinar os dados para ter informações completas
      const results = orgModules.map(orgModule => {
        const moduleInfo = moduleDetails.rows.find((m: any) => m.id === orgModule.moduleId) || {
          name: `Módulo ${orgModule.moduleId}`,
          description: "Descrição não disponível"
        };
        return {
          id: orgModule.id,
          organizationId: orgModule.organizationId, 
          moduleId: orgModule.moduleId,
          planId: orgModule.planId,
          status: orgModule.status,
          active: orgModule.active,
          startDate: orgModule.startDate,
          expiryDate: orgModule.expiryDate,
          createdAt: orgModule.createdAt,
          updatedAt: orgModule.updatedAt,
          // Adicionamos as propriedades do módulo explicitamente no objeto retornado
          name: moduleInfo?.name || 'Módulo desconhecido',
          description: moduleInfo?.description || 'Sem descrição',
          icon_name: moduleInfo?.icon_name || 'Box',
          type: moduleInfo?.type || 'unknown',
          is_active: moduleInfo?.is_active ?? true,
          moduleInfo: moduleInfo || null
        };
      });
      
      res.json(results);
    } catch (error) {
      console.error("Error fetching organization modules:", error);
      res.status(500).json({ message: "Failed to fetch organization modules" });
    }
  });

  app.post("/api/organization-modules", authenticate, async (req, res) => {
    try {
      const { organizationId, moduleId, planId, active = true } = req.body;
      
      if (!organizationId || !moduleId || !planId) {
        return res.status(400).json({ message: "organizationId, moduleId, and planId are required" });
      }
      
      // Check if this organization already has this module
      const existingModules = await db.select()
        .from(organizationModules)
        .where(and(
          eq(organizationModules.organizationId, organizationId),
          eq(organizationModules.moduleId, moduleId)
        ));
      
      if (existingModules.length > 0) {
        return res.status(400).json({ message: "This organization already has this module" });
      }
      
      // Create new organization module entry
      const [orgModule] = await db.insert(organizationModules)
        .values({
          organizationId,
          moduleId,
          planId,
          active,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      res.status(201).json(orgModule);
    } catch (error) {
      console.error("Error adding module to organization:", error);
      res.status(500).json({ message: "Failed to add module to organization" });
    }
  });

  app.delete("/api/organization-modules/:id", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Delete the organization module entry
      await db.delete(organizationModules)
        .where(eq(organizationModules.id, parseInt(id)));
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing module from organization:", error);
      res.status(500).json({ message: "Failed to remove module from organization" });
    }
  });
  
  // Endpoint para solicitar um novo módulo para a organização
  app.post("/api/organization-modules/request", async (req, res) => {
    try {
      const { moduleType, organizationId } = req.body;
      
      console.log("Solicitando novo módulo:", moduleType, "para organização:", organizationId);
      
      if (!moduleType || !organizationId) {
        return res.status(400).json({ message: "Tipo de módulo e ID da organização são obrigatórios" });
      }
      
      // Buscar o módulo pelo tipo
      const [moduleData] = await db.select().from(modules).where(eq(modules.type, moduleType));
      
      if (!moduleData) {
        console.log("Módulo não encontrado:", moduleType);
        return res.status(404).json({ message: "Módulo não encontrado" });
      }
      
      console.log("Módulo encontrado:", moduleData);
      
      // Verificar se este módulo já está associado à organização
      // Não podemos usar moduleType já que não existe na tabela
      const existingModules = await db.select()
        .from(organizationModules)
        .where(and(
          eq(organizationModules.organizationId, parseInt(organizationId)),
          eq(organizationModules.moduleId, moduleData.id)
        ));
      
      if (existingModules.length > 0) {
        console.log("Módulo já existe para esta organização:", existingModules[0]);
        return res.status(400).json({ message: "Este módulo já está associado a esta organização" });
      }
      
      // Adicionar o módulo à organização com status pendente
      const [newOrgModule] = await db.insert(organizationModules)
        .values({
          organizationId: parseInt(organizationId),
          moduleId: moduleData.id,
          status: 'pending',
          active: false,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      console.log("Novo módulo adicionado com sucesso:", newOrgModule);
      res.status(201).json(newOrgModule);
    } catch (error) {
      console.error("Erro ao solicitar módulo:", error);
      res.status(500).json({ message: "Falha ao solicitar módulo" });
    }
  });
  
  // Rota para alternar o status ativo/inativo de um módulo
  app.put("/api/organization-modules/:id/toggle", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      const { active } = req.body;
      
      if (typeof active !== 'boolean') {
        return res.status(400).json({ message: "Active status must be a boolean" });
      }
      
      const [updated] = await db.update(organizationModules)
        .set({ 
          active, 
          updatedAt: new Date() 
        })
        .where(eq(organizationModules.id, parseInt(id)))
        .returning();
      
      if (!updated) {
        return res.status(404).json({ message: "Organization module not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error toggling module status:", error);
      res.status(500).json({ message: "Failed to toggle module status" });
    }
  });
  
  // Payment Routes
  app.post("/api/payments/create-plan-intent", authenticate, async (req, res) => {
    try {
      const { planId, organizationId } = req.body;
      
      if (!planId) {
        return res.status(400).json({ success: false, message: "Plan ID is required" });
      }
      
      // Para mudança de plano de uma organização existente (isNewOrganization = false)
      const clientSecret = await createPlanPaymentIntent(
        Number(planId),
        false, // isNewOrganization = false para esta rota (mudança de plano)
        organizationId ? Number(organizationId) : undefined
      );
      
      if (!clientSecret) {
        console.error("Falha ao gerar client secret para mudança de plano. planId:", planId);
        return res.status(500).json({ 
          success: false, 
          message: "Não foi possível gerar o token de pagamento. Tente novamente mais tarde."
        });
      }
      
      console.log("Client Secret para mudança de plano gerado com sucesso (primeiros 10 caracteres):", clientSecret.substring(0, 10));
      res.json({ success: true, clientSecret });
    } catch (error: any) {
      console.error("Error creating plan payment intent:", error);
      res.status(500).json({ 
        success: false, 
        message: error.message || "Falha ao criar intent de pagamento para mudança de plano",
        error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      });
    }
  });
  
  app.post("/api/payments/create-module-intent", authenticate, async (req, res) => {
    try {
      const { modulePlanId, organizationId } = req.body;
      
      if (!modulePlanId) {
        return res.status(400).json({ success: false, message: "Module plan ID is required" });
      }
      
      const clientSecret = await createModulePaymentIntent(
        Number(modulePlanId), 
        organizationId ? Number(organizationId) : undefined
      );
      
      if (!clientSecret) {
        console.error("Falha ao gerar client secret para módulo. modulePlanId:", modulePlanId);
        return res.status(500).json({ 
          success: false, 
          message: "Não foi possível gerar o token de pagamento para o módulo. Tente novamente mais tarde."
        });
      }
      
      console.log("Client Secret para módulo gerado com sucesso (primeiros 10 caracteres):", clientSecret.substring(0, 10));
      res.json({ success: true, clientSecret });
    } catch (error: any) {
      console.error("Error creating module payment intent:", error);
      res.status(500).json({ 
        success: false, 
        message: error.message || "Falha ao criar intent de pagamento para módulo",
        error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      });
    }
  });

  // API para gerenciamento de links de pagamento
  app.post("/api/payment-links/send", authenticate, async (req, res) => {
    try {
      // Verificar se o usuário é admin do sistema
      if (req.session.user?.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: "Apenas administradores podem enviar links de pagamento"
        });
      }
      
      const { organizationId } = req.body;
      
      if (!organizationId) {
        return res.status(400).json({ 
          success: false, 
          message: "ID da organização é obrigatório"
        });
      }
      
      // Importar o serviço de links de pagamento
      const { sendPaymentLinkFromAdmin } = await import('./services/payment-links');
      
      // Enviar o link de pagamento
      const result = await sendPaymentLinkFromAdmin(Number(organizationId));
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.json(result);
    } catch (error: any) {
      console.error("Erro ao enviar link de pagamento:", error);
      res.status(500).json({ 
        success: false, 
        message: error.message || "Falha ao enviar link de pagamento",
        error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      });
    }
  });
  
  // API para gerenciamento de organizações e planos
  
  // Rota para obter dados da organização atual
  app.get("/api/organizations/current", authenticate, async (req, res) => {
    try {
      console.log("Acessando organização atual. Dados da sessão:", req.session?.user?.id, req.session?.user?.role);
      
      if (!req.session || !req.session.user || !req.session.user.organizationId) {
        return res.status(401).json({ message: "Organização não disponível" });
      }
      
      const organizationId = req.session.user.organizationId;
      
      // Verificar se o ID da organização é válido
      if (typeof organizationId !== 'number' || isNaN(organizationId)) {
        console.error(`ID de organização inválido: ${organizationId}, tipo: ${typeof organizationId}`);
        return res.status(400).json({ message: "ID de organização inválido" });
      }
      
      console.log(`Buscando organização atual com ID: ${organizationId}`);
      
      // Buscar organização
      const [organization] = await db.select()
        .from(organizations)
        .where(eq(organizations.id, organizationId));
      
      if (!organization) {
        console.error(`Organização não encontrada para o ID: ${organizationId}`);
        return res.status(404).json({ message: "Organização não encontrada" });
      }
      
      console.log(`Organização atual encontrada: ${organization.name}`);
      res.json(organization);
    } catch (error) {
      console.error("Erro ao buscar organização atual:", error);
      res.status(500).json({ 
        message: "Falha ao buscar dados da organização",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Rota para obter módulos da organização do usuário atual
  app.get("/api/modules/organization", authenticate, async (req, res) => {
    try {
      console.log("Requisição para /api/modules/organization recebida");
      
      // Verificar autenticação
      if (!req.session) {
        console.log("Erro: Sessão não encontrada");
        return res.status(401).json({ message: "Sessão não encontrada" });
      }

      if (!req.session.user) {
        console.log("Erro: Usuário não encontrado na sessão");
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      if (!req.session.user.organizationId) {
        console.log("Erro: ID da organização não encontrado para o usuário");
        return res.status(401).json({ message: "Organização não disponível" });
      }
      
      const organizationId = req.session.user.organizationId;
      
      // Verificar se o ID da organização é válido
      if (typeof organizationId !== 'number' || isNaN(organizationId)) {
        console.error(`ID de organização inválido em /api/modules/organization: ${organizationId}, tipo: ${typeof organizationId}`);
        return res.status(400).json({ message: "ID de organização inválido" });
      }
      
      console.log(`Buscando módulos para organização ${organizationId} do usuário atual (ID: ${req.session.user.id}, Role: ${req.session.user.role})`);
      
      // Verificar se a tabela organization_modules existe
      try {
        // Buscar módulos da organização
        const orgModules = await db.select()
          .from(organizationModules)
          .where(eq(organizationModules.organizationId, organizationId));
        
        console.log(`Encontrados ${orgModules.length} módulos para a organização ${organizationId}`);
        
        if (!orgModules.length) {
          console.log("Nenhum módulo encontrado para esta organização, retornando array vazio");
          return res.json([]);
        }
        
        // Buscar informações detalhadas dos módulos
        const moduleIds = orgModules.map(om => om.moduleId);
        console.log(`IDs dos módulos encontrados: ${moduleIds.join(', ')}`);
        
        const modulesData = await db.select()
          .from(modules)
          .where(inArray(modules.id, moduleIds));
        
        console.log(`Dados de ${modulesData.length} módulos recuperados do banco de dados`);
        
        // Combinar os dados
        const result = orgModules.map(om => {
          const moduleInfo = modulesData.find(m => m.id === om.moduleId);
          return {
            ...om,
            moduleInfo: moduleInfo || { 
              id: om.moduleId,
              name: "Módulo não encontrado",
              type: "unknown" 
            }
          };
        });
        
        console.log(`Retornando ${result.length} módulos combinados para a UI`);
        res.json(result);
      } catch (dbError) {
        console.error("Erro no banco de dados ao buscar módulos:", dbError);
        
        // Para ambiente de desenvolvimento, verificar se o módulo de cultivo existe
        const cultivationModule = {
          id: 9999,
          organizationId: organizationId,
          moduleId: 9999,
          active: true,
          status: "active",
          moduleInfo: {
            id: 9999,
            name: "Cultivo",
            type: "cultivation",
            description: "Módulo de gestão de cultivo"
          }
        };
        
        console.log("Verificando se o usuário está requisitando especificamente o módulo de cultivo");
        // Se o erro for com o banco de dados, vamos criar um registro fictício para cultivo
        const requestedModule = req.query.module;
        if (requestedModule === "cultivation") {
          console.log("Retornando módulo de cultivo padrão para ambiente de desenvolvimento");
          return res.json([cultivationModule]);
        }
        
        throw dbError;
      }
    } catch (error) {
      console.error("Erro ao buscar módulos da organização:", error);
      res.status(500).json({ 
        message: "Falha ao buscar módulos da organização",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Rota alternativa sem autenticação para obter dados de uma organização
  app.get("/api/organizations-direct/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      // Verificar se temos um mock em server/index.ts
      if (global.mockOrganizations) {
        // @ts-ignore
        const mockOrg = global.mockOrganizations.find(o => o.id === id);
        if (mockOrg) {
          console.log("Retornando organização mockada (rota direta):", mockOrg.name);
          return res.json(mockOrg);
        }
      }
      
      return res.status(404).json({ message: "Organização não encontrada" });
    } catch (error) {
      console.error("Erro na rota direta de organizações:", error);
      return res.status(500).json({ message: "Erro interno" });
    }
  });
  
  // Rota para obter informações básicas da organização para o portal do paciente (sem autenticação)
  app.get("/api/organizations/:id/info", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      console.log(`Buscando informações básicas da organização com ID: ${id} para portal do paciente`);
      
      // Verificar se temos um mock em server/index.ts
      if (global.mockOrganizations) {
        // @ts-ignore
        const mockOrg = global.mockOrganizations.find(o => o.id === id);
        if (mockOrg) {
          console.log("Retornando informações básicas da organização mockada:", mockOrg.name);
          return res.json({ 
            id: mockOrg.id, 
            name: mockOrg.name, 
            type: mockOrg.type,
            patientPortalUrl: mockOrg.patientPortalUrl
          });
        }
      }
      
      // Buscar do banco de dados
      const organization = await db.query.organizations.findFirst({
        where: eq(organizations.id, id),
        columns: {
          id: true,
          name: true,
          type: true,
          status: true,
          logo: true,
          patientPortalUrl: true
        }
      });
      
      if (!organization) {
        return res.status(404).json({ message: "Organização não encontrada" });
      }
      
      if (organization.status !== 'active') {
        return res.status(403).json({ message: "Esta organização não está ativa" });
      }
      
      // Se a organização não tiver um logo, definir o caminho para o logo padrão
      const logoPath = organization.logo 
        ? `/uploads/logos/${organization.logo}` 
        : '/uploads/logos/default-logo.svg';
      
      // Usar URLs relativas para evitar problemas com localhost em produção
      let patientPortalUrl = organization.patientPortalUrl;
      
      // Verificar se estamos em ambiente de produção (Replit)
      const isProduction = process.env.NODE_ENV === 'production' || (process.env.BASE_URL && process.env.BASE_URL.includes('replit.app'));
      
      // Se o patientPortalUrl não existir, estiver no formato antigo, ou contém localhost
      if (!patientPortalUrl || 
          patientPortalUrl.includes('/patient/login?orgId=') || 
          patientPortalUrl.includes('localhost') ||
          patientPortalUrl.includes('http://')) {
        
        // Usar formato adequado para cada ambiente, mas com URLs relativas
        patientPortalUrl = isProduction
          ? `/patient-login?organizationId=${organization.id}`
          : `/patient/login?orgId=${organization.id}`;
          
        // Atualizar o valor no banco de dados
        await db.update(organizations)
          .set({ patientPortalUrl })
          .where(eq(organizations.id, organization.id));
          
        console.log(`URL do portal do paciente atualizada para: ${patientPortalUrl}`);
      }
      
      return res.json({
        id: organization.id,
        name: organization.name,
        type: organization.type,
        logo: logoPath,
        patientPortalUrl: patientPortalUrl
      });
    } catch (error) {
      console.error("Erro ao buscar informações da organização:", error);
      return res.status(500).json({ message: "Erro interno" });
    }
  });

  // Rota para obter dados de uma organização específica
  app.get("/api/organizations/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      console.log(`Buscando detalhes da organização com ID: ${id}`);
      
      // Verificar permissão
      if (req.session?.user?.role !== 'admin' && 
          req.session?.user?.role !== 'org_admin' && 
          req.session?.user?.organizationId !== id) {
        return res.status(403).json({ message: "Sem permissão para acessar esta organização" });
      }
      
      // Verificar se temos um mock em server/index.ts
      if (global.mockOrganizations) {
        // @ts-ignore - mockOrganizations é adicionado ao objeto global em server/index.ts
        const mockOrg = global.mockOrganizations.find(o => o.id === id);
        if (mockOrg) {
          console.log("Retornando organização mockada:", mockOrg.name);
          return res.json(mockOrg);
        }
      }
      
      // Buscar organização
      const [organization] = await db.select()
        .from(organizations)
        .where(eq(organizations.id, id));
      
      if (!organization) {
        return res.status(404).json({ message: "Organização não encontrada" });
      }
      
      console.log(`Organização encontrada no banco: ${organization.name}`);
      
      // Se a organização não tiver um logo, definir o caminho para o logo padrão
      if (!organization.logo) {
        organization.logo = '/uploads/logos/default-logo.svg';
      }
      
      res.json(organization);
    } catch (error) {
      console.error("Erro ao buscar organização:", error);
      res.status(500).json({ message: "Falha ao buscar dados da organização" });
    }
  });
  
  // Rota para atualizar dados de uma organização
  app.put("/api/organizations/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      // Verificar permissão
      if (req.session?.user?.role !== 'admin' && 
          (req.session?.user?.role !== 'org_admin' || req.session?.user?.organizationId !== id)) {
        return res.status(403).json({ message: "Sem permissão para atualizar esta organização" });
      }
      
      const { 
        name, legalName, cnpj, email, phoneNumber, 
        address, city, state, zipCode, website, description 
      } = req.body;
      
      // Verificar campos obrigatórios
      if (!name) {
        return res.status(400).json({ message: "Nome da organização é obrigatório" });
      }
      
      // Validar formato do e-mail
      if (email && !email.includes('@')) {
        return res.status(400).json({ message: "Formato de e-mail inválido" });
      }
      
      // Atualizar organização
      const [updatedOrganization] = await db.update(organizations)
        .set({
          name,
          legalName,
          cnpj,
          email,
          phoneNumber,
          address,
          city,
          state,
          zipCode,
          website,
          description,
          updatedAt: new Date()
        })
        .where(eq(organizations.id, id))
        .returning();
      
      if (!updatedOrganization) {
        return res.status(404).json({ message: "Organização não encontrada" });
      }
      
      res.json(updatedOrganization);
    } catch (error) {
      console.error("Erro ao atualizar organização:", error);
      res.status(500).json({ message: "Falha ao atualizar dados da organização" });
    }
  });
  
  // Rota para alterar o status de uma organização
  app.put("/api/organizations/:id/status", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      // Apenas admin pode alterar o status de uma organização
      if (req.session?.user?.role !== 'admin') {
        return res.status(403).json({ message: "Apenas administradores podem alterar o status de uma organização" });
      }
      
      const { status, reason } = req.body;
      
      // Validar o status recebido
      if (!status || !['active', 'suspended', 'blocked', 'pending', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Status inválido. Valores aceitos: active, suspended, blocked, pending, rejected" });
      }
      
      // Registrar o motivo da suspensão/bloqueio, se fornecido
      const updateData: any = { 
        status, 
        updatedAt: new Date() 
      };
      
      if ((status === 'suspended' || status === 'blocked' || status === 'rejected') && reason) {
        updateData.statusReason = reason;
      }
      
      const [updatedOrganization] = await db.update(organizations)
        .set(updateData)
        .where(eq(organizations.id, id))
        .returning();
      
      if (!updatedOrganization) {
        return res.status(404).json({ message: "Organização não encontrada" });
      }
      
      // Log da operação
      console.log(`Status da organização ${id} alterado para ${status} por ${req.session?.user?.id}`);
      
      // Enviar e-mail para organização informando a mudança de status
      // Isso poderia ser implementado aqui ou chamando um serviço separado
      
      res.json(updatedOrganization);
    } catch (error) {
      console.error("Erro ao atualizar status da organização:", error);
      res.status(500).json({ message: "Falha ao atualizar status da organização" });
    }
  });
  
  // Rota para upload de logo da organização
  app.post("/api/organizations/:id/logo", authenticate, logoUpload.single('logo'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      // Verificar permissão
      if (req.session?.user?.role !== 'admin' && 
          (req.session?.user?.role !== 'org_admin' || req.session?.user?.organizationId !== id)) {
        return res.status(403).json({ message: "Sem permissão para atualizar esta organização" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
      }
      
      // Salvar apenas o nome do arquivo
      const filename = req.file.filename;
      
      // Atualizar caminho do logo na organização
      const [updatedOrganization] = await db.update(organizations)
        .set({
          logo: filename,
          updatedAt: new Date()
        })
        .where(eq(organizations.id, id))
        .returning();
      
      if (!updatedOrganization) {
        return res.status(404).json({ message: "Organização não encontrada" });
      }
      
      res.json({ 
        message: "Logo atualizado com sucesso",
        logoUrl: `/uploads/logos/${filename}`
      });
    } catch (error) {
      console.error("Erro ao fazer upload de logo:", error);
      res.status(500).json({ message: "Falha ao fazer upload do logo da organização" });
    }
  });
  
  // Rota para obter todas as solicitações de mudança de plano (apenas para administradores)
  // REMOVER - Rota duplicada (usar a versão PRINCIPAL em linha 1704)
  /* 
  app.get("/api/plan-change-requests", authenticate, async (req, res) => {
    // Código removido para evitar duplicação de rotas
  });
  */
  
  // Rota para aprovar ou rejeitar solicitação de mudança de plano (DESATIVADA - usar /api/plan-change-requests/:action)
  /* app.put("/api/plan-change-requests/:orgId", authenticate, async (req, res) => {
    try {
      if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
        return res.status(401).json({ message: "Não autorizado. Apenas administradores podem aprovar solicitações." });
      }
      
      const { orgId } = req.params;
      const { action } = req.body; // 'approve' ou 'reject'
      
      if (!action || (action !== 'approve' && action !== 'reject')) {
        return res.status(400).json({ message: "Ação inválida. Use 'approve' ou 'reject'." });
      }
      
      // Buscar a organização
      const [organization] = await db.select().from(organizations).where(eq(organizations.id, parseInt(orgId, 10)));
      
      if (!organization) {
        return res.status(404).json({ message: "Organização não encontrada" });
      }
      
      if (organization.status !== 'pending_plan_change') {
        return res.status(400).json({ message: "Esta organização não possui uma solicitação de mudança de plano pendente." });
      }
      
      if (action === 'approve') {
        // Aprovar a mudança de plano
        await db.update(organizations)
          .set({
            planId: organization.requestedPlanId,
            status: 'active',
            requestedPlanId: null,
            updatedAt: new Date()
          })
          .where(eq(organizations.id, parseInt(orgId, 10)));
          
        // Buscar o plano para notificação
        const [plan] = await db.select().from(plans).where(eq(plans.id, organization.requestedPlanId || 0));
        
        // Criar notificação para o usuário
        await db.insert(notifications).values({
          userId: null, // Notificação para toda a organização
          organizationId: parseInt(orgId, 10),
          title: "Solicitação de mudança de plano aprovada",
          message: `Sua solicitação para mudar para o plano ${plan?.name || 'solicitado'} foi aprovada!`,
          type: "success",
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        res.status(200).json({
          success: true,
          message: `Solicitação de mudança de plano da organização ${organization.name} foi aprovada com sucesso.`
        });
      } else {
        // Rejeitar a mudança de plano
        await db.update(organizations)
          .set({
            status: 'active',
            requestedPlanId: null,
            updatedAt: new Date()
          })
          .where(eq(organizations.id, parseInt(orgId, 10)));
          
        // Criar notificação para o usuário
        await db.insert(notifications).values({
          userId: null, // Notificação para toda a organização
          organizationId: parseInt(orgId, 10),
          title: "Solicitação de mudança de plano rejeitada",
          message: "Sua solicitação para mudança de plano foi rejeitada.",
          type: "warning",
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        res.status(200).json({
          success: true,
          message: `Solicitação de mudança de plano da organização ${organization.name} foi rejeitada.`
        });
      }
    } catch (error) {
      console.error("Erro ao processar solicitação de mudança de plano:", error);
      res.status(500).json({ message: "Erro ao processar solicitação de mudança de plano." });
    }
  });
    
  // Rota para criar solicitação de mudança de plano
  app.post("/api/plan-change-requests", authenticate, async (req, res) => {
    try {
      console.log("Recebendo solicitação de mudança de plano:", req.body);
      console.log("Sessão do usuário:", req.session?.user);
      console.log("Headers da requisição:", req.headers);
      console.log("Cookie da requisição:", req.headers.cookie);
      
      if (!req.session || !req.session.user || !req.session.user.organizationId) {
        console.log("Erro de autorização: usuário sem organizationId");
        return res.status(401).json({ message: "Não autorizado. Você precisa estar vinculado a uma organização." });
      }
      
      const { planId } = req.body;
      const organizationId = req.session.user.organizationId;
      
      console.log("Dados da solicitação:", { planId, organizationId });
      
      if (!planId) {
        return res.status(400).json({ message: "ID do plano é obrigatório" });
      }
      
      // Verificar se o plano existe
      const [plan] = await db.select().from(plans).where(eq(plans.id, planId));
      
      if (!plan) {
        console.log("Plano não encontrado:", planId);
        return res.status(404).json({ message: "Plano não encontrado" });
      }
      
      console.log("Plano encontrado:", plan);
      
      // Buscar organização
      const [organization] = await db.select().from(organizations).where(eq(organizations.id, organizationId));
      if (!organization) {
        return res.status(404).json({ message: "Organização não encontrada" });
      }
      
      console.log("Plano atual:", organization.planId, "Plano solicitado:", planId);
      
      // Verificar se está tentando mudar para o mesmo plano
      if (organization.planId === planId) {
        return res.status(400).json({ 
          message: "O plano solicitado é o mesmo que você já possui" 
        });
      }
      
      // Atualizar a organização para status 'pending_plan_change' e armazenar o plano solicitado
      await db.update(organizations)
        .set({
          status: 'pending_plan_change', // Status específico para mudança de plano
          requestedPlanId: planId, // Armazenar o ID do plano solicitado
          updatedAt: new Date()
        })
        .where(eq(organizations.id, organizationId));
        
      // Criar uma notificação para administradores
      // Buscar um usuário admin para enviar a notificação
      const [adminUser] = await db.select().from(users).where(eq(users.role, 'admin'));
      
      console.log("Criando solicitação de mudança de plano para organização:", organizationId, "para plano:", planId);
      console.log("Status da organização atualizado para: pending_plan_change");

      if (adminUser) {
        try {
          await db.insert(notifications).values({
            userId: adminUser.id, // Notificação para administrador
            title: "Nova solicitação de mudança de plano",
            message: `Organização ${organization.name} solicitou mudança para o plano ${plan.name}`,
            type: "info",
            isRead: false,
            createdAt: new Date()
          });
          console.log("Notificação criada para o administrador:", adminUser.id);
        } catch (e) {
          console.error("Erro ao criar notificação:", e);
        }
      }
        
      res.status(200).json({ 
        success: true, 
        message: "Solicitação de mudança de plano enviada com sucesso. Aguarde aprovação." 
      });
    } catch (error) {
      console.error("Erro ao solicitar mudança de plano:", error);
      res.status(500).json({ message: "Erro ao solicitar mudança de plano. Tente novamente mais tarde." });
    }
  });
  
  // Nova rota estática para contornar problemas com MIME Type/Content-Type
  app.get("/api/plan-change-requests-static", (req, res) => {
    // Retornando dados estáticos baseados na consulta SQL que verificamos
    const staticData = {
      success: true,
      totalRequests: 1,
      requests: [
        {
          id: 1,
          name: "abrace",
          type: "Associação",
          email: "cassianoaxe@gmail.com",
          status: "pending_plan_change",
          currentPlanId: null,
          requestedPlanId: 6,
          requestDate: "2025-04-03T01:19:50.670Z",
          currentPlanName: "Free",
          requestedPlanName: "Pro"
        }
      ]
    };
    
    // Forçar tipo de conteúdo para JSON
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(staticData);
  });
  
  // Nova rota somente para teste das solicitações
  app.get("/api/plan-change-requests-test", async (req, res) => {
    try {
      console.log("==== TESTE DE API - SEM AUTENTICAÇÃO ====");
      
      // Buscar organizações com solicitações de mudança de plano
      const query = `
        SELECT 
          o.id, 
          o.name, 
          o.type, 
          o.email, 
          o.status, 
          o.plan_id as "currentPlanId", 
          o.requested_plan_id as "requestedPlanId", 
          o.updated_at as "requestDate",
          COALESCE(cp.name, 'Sem plano') as "currentPlanName",
          COALESCE(rp.name, 'Plano não encontrado') as "requestedPlanName"
        FROM organizations o
        LEFT JOIN plans cp ON o.plan_id = cp.id
        LEFT JOIN plans rp ON o.requested_plan_id = rp.id
        WHERE o.status = 'pending_plan_change'
      `;
      
      const result = await pool.query(query);
      console.log("Teste - Resultado bruto:", result.rows);
      
      // Formatação especial para depuração
      const requests = result.rows.map(req => ({
        id: req.id,
        name: req.name || 'Nome não encontrado',
        type: req.type || 'Tipo não especificado',
        email: req.email || 'Email não especificado',
        status: 'pending_plan_change',
        currentPlanId: req.currentPlanId || null,
        requestedPlanId: req.requestedPlanId || null,
        requestDate: req.requestDate || new Date(),
        currentPlanName: req.currentPlanName || 'Plano não especificado',
        requestedPlanName: req.requestedPlanName || 'Plano não especificado'
      }));
      
      // Forçar conteúdo JSON (não HTML)
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json({
        success: true,
        totalRequests: requests.length,
        requests: requests,
        message: "API de teste - Sem autenticação"
      });
    } catch (error) {
      console.error("Erro no teste:", error);
      res.setHeader('Content-Type', 'application/json');
      return res.status(500).json({ 
        success: false, 
        message: "Falha no teste" 
      });
    }
  });

  // Função para atualizar arquivo JSON com lista de solicitações
  async function updatePlanChangeRequestsFile() {
    try {
      // Buscar organizações com solicitações de mudança de plano pendentes
      const pendingRequestsQuery = `
        SELECT 
          o.id, 
          o.name, 
          o.type, 
          o.email, 
          o.status, 
          o.plan_id as "currentPlanId", 
          CASE 
            WHEN o.status = 'pending' THEN o.plan_id
            ELSE o.requested_plan_id 
          END as "requestedPlanId", 
          o.updated_at as "requestDate",
          COALESCE(cp.name, 'Sem plano') as "currentPlanName",
          COALESCE(
            CASE 
              WHEN o.status = 'pending' THEN cp.name
              ELSE rp.name 
            END, 
            'Plano não encontrado'
          ) as "requestedPlanName",
          CASE 
            WHEN o.status = 'pending' THEN 'nova_organizacao'
            ELSE 'mudanca_plano' 
          END as "requestType"
        FROM organizations o
        LEFT JOIN plans cp ON o.plan_id = cp.id
        LEFT JOIN plans rp ON o.requested_plan_id = rp.id
        WHERE o.status = 'pending_plan_change' OR o.status = 'pending'
      `;
      
      const pendingRequestsResult = await pool.query(pendingRequestsQuery);
      const requests = pendingRequestsResult.rows;
      
      console.log("Gerando arquivo JSON de solicitações. Total:", requests.length);
      
      // Formatar as requisições para garantir todos os campos
      const enhancedRequests = requests.map(req => ({
        ...req,
        id: req.id,
        name: req.name || 'Nome não encontrado',
        type: req.type || 'Tipo não especificado',
        email: req.email || 'Email não especificado',
        status: req.status || 'pending_plan_change',
        requestType: req.requestType || 'mudanca_plano',
        currentPlanId: req.currentPlanId || null,
        requestedPlanId: req.requestedPlanId || null,
        requestDate: req.requestDate || new Date(),
        currentPlanName: req.currentPlanName || 'Plano não especificado',
        requestedPlanName: req.requestedPlanName || 'Plano não especificado'
      }));
      
      const response = {
        success: true,
        totalRequests: enhancedRequests.length,
        requests: enhancedRequests,
        updateTime: new Date()
      };
      
      // Salvar em arquivo
      const fs = require('fs').promises;
      await fs.writeFile(
        './uploads/data/plan_change_requests.json', 
        JSON.stringify(response, null, 2),
        'utf8'
      );
      console.log("Arquivo de solicitações de plano atualizado com sucesso");
      
      return true;
    } catch (error) {
      console.error("Erro ao atualizar arquivo de solicitações:", error);
      return false;
    }
  }
  
  // Atualizar arquivo de solicitações a cada 30 segundos
  setInterval(updatePlanChangeRequestsFile, 30000);
  
  // Atualizar imediatamente na inicialização
  updatePlanChangeRequestsFile();
  
  // Rota alternativa para obter solicitações de mudança de plano (para contornar problemas com o Vite)
  app.get("/get_plan_change_requests.json", async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    try {
      console.log("==== ACESSANDO ROTA DIRETA DE SOLICITAÇÕES DE PLANO ====");
      
      if (!req.session?.user || req.session.user.role !== 'admin') {
        return res.status(401).json({ 
          message: "Não autorizado. Apenas administradores podem visualizar solicitações de mudança de plano.",
          userRole: req.session?.user?.role || "sem_role" 
        });
      }
      
      // Buscar organizações com solicitações de mudança de plano pendentes
      const pendingRequestsQuery = `
        SELECT 
          o.id, 
          o.name, 
          o.type, 
          o.email, 
          o.status, 
          o.plan_id as "currentPlanId", 
          CASE 
            WHEN o.status = 'pending' THEN o.plan_id
            ELSE o.requested_plan_id 
          END as "requestedPlanId", 
          o.updated_at as "requestDate",
          COALESCE(cp.name, 'Sem plano') as "currentPlanName",
          COALESCE(
            CASE 
              WHEN o.status = 'pending' THEN cp.name
              ELSE rp.name 
            END, 
            'Plano não encontrado'
          ) as "requestedPlanName",
          CASE 
            WHEN o.status = 'pending' THEN 'nova_organizacao'
            ELSE 'mudanca_plano' 
          END as "requestType"
        FROM organizations o
        LEFT JOIN plans cp ON o.plan_id = cp.id
        LEFT JOIN plans rp ON o.requested_plan_id = rp.id
        WHERE o.status = 'pending_plan_change' OR o.status = 'pending'
      `;
      
      const pendingRequestsResult = await pool.query(pendingRequestsQuery);
      const requests = pendingRequestsResult.rows;
      
      console.log("Solicitações de mudança de plano encontradas:", requests.length);
      
      // Para depuração, garantir que todos os campos estejam presentes
      const enhancedRequests = requests.map(req => ({
        ...req,
        id: req.id,
        name: req.name || 'Nome não encontrado',
        type: req.type || 'Tipo não especificado',
        email: req.email || 'Email não especificado',
        status: req.status || 'pending_plan_change',
        requestType: req.requestType || 'mudanca_plano',
        currentPlanId: req.currentPlanId || null,
        requestedPlanId: req.requestedPlanId || null,
        requestDate: req.requestDate || new Date(),
        currentPlanName: req.currentPlanName || 'Plano não especificado',
        requestedPlanName: req.requestedPlanName || 'Plano não especificado'
      }));
      
      const response = {
        success: true,
        totalRequests: enhancedRequests.length,
        requests: enhancedRequests
      };
      
      return res.status(200).json(response);
    } catch (error) {
      console.error("Erro ao obter solicitações de mudança de plano:", error);
      res.status(500).json({ message: "Falha ao obter solicitações de mudança de plano." });
    }
  });
  
  // Rota para obter solicitações de mudança de plano (para administradores) - PRINCIPAL
  app.get("/api/plan-change-requests", authenticate, async (req, res) => {
    // Forçar o content-type para JSON
    res.setHeader('Content-Type', 'application/json');
    
    try {
      console.log("==== ACESSANDO ROTA DE SOLICITAÇÕES DE PLANO ====");
      console.log("Sessão:", req.session);
      console.log("Usuário:", req.session?.user);
      
      if (!req.session?.user || req.session.user.role !== 'admin') {
        return res.status(401).json({ 
          message: "Não autorizado. Apenas administradores podem visualizar solicitações de mudança de plano.",
          userRole: req.session?.user?.role || "sem_role" 
        });
      }
      
      console.log("Buscando solicitações de mudança de plano...");
      console.log("Usuário autenticado:", req.session.user);
      
      // Buscar organizações com solicitações de mudança de plano pendentes usando SQL bruto para depuração - corrigido
      // Nota: Mudamos a consulta para incluir email e outros campos que podem estar faltando na resposta
      // Também incluímos organizações com status 'pending' (novas organizações) para aparecerem na mesma listagem
      const pendingRequestsQuery = `
        SELECT 
          o.id, 
          o.name, 
          o.type, 
          o.email, 
          o.status, 
          o.plan_id as "currentPlanId", 
          CASE 
            WHEN o.status = 'pending' THEN o.plan_id
            ELSE o.requested_plan_id 
          END as "requestedPlanId", 
          o.updated_at as "requestDate",
          COALESCE(cp.name, 'Sem plano') as "currentPlanName",
          COALESCE(
            CASE 
              WHEN o.status = 'pending' THEN cp.name
              ELSE rp.name 
            END, 
            'Plano não encontrado'
          ) as "requestedPlanName",
          CASE 
            WHEN o.status = 'pending' THEN 'nova_organizacao'
            ELSE 'mudanca_plano' 
          END as "requestType"
        FROM organizations o
        LEFT JOIN plans cp ON o.plan_id = cp.id
        LEFT JOIN plans rp ON o.requested_plan_id = rp.id
        WHERE o.status = 'pending_plan_change' OR o.status = 'pending'
      `;
      
      // Query para diagnosticar organizações com status inconsistente
      const diagnosticQuery = `
        SELECT id, name, status, plan_id, requested_plan_id, email, type 
        FROM organizations 
        WHERE status = 'pending_plan_change' OR requested_plan_id IS NOT NULL
      `;
      const diagnosticResult = await pool.query(diagnosticQuery);
      console.log("Diagnóstico de organizações com mudança de plano:", diagnosticResult.rows);
      
      const pendingRequestsResult = await pool.query(pendingRequestsQuery);
      const requests = pendingRequestsResult.rows;
      
      console.log("Solicitações de mudança de plano encontradas:", requests.length);
      
      // Log detalhado para depuração
      if (requests.length > 0) {
        requests.forEach(req => {
          console.log(`Solicitação: Organização ${req.id} (${req.name}) quer mudar de ${req.currentPlanName} (${req.currentPlanId}) para ${req.requestedPlanName} (${req.requestedPlanId})`);
        });
      } else {
        console.log("Nenhuma solicitação de mudança de plano encontrada.");
        
        // Verificação adicional - listar todas as organizações para diagnóstico
        console.log("Executando consulta adicional para diagnóstico...");
        const allOrgsResult = await pool.query(`
          SELECT id, name, status, plan_id, requested_plan_id
          FROM organizations 
          LIMIT 5
        `);
        console.log("Primeiras 5 organizações no sistema:", allOrgsResult.rows);
      }
      
      // Para depuração, certificar que todos os campos estão presentes
      const enhancedRequests = requests.map(req => ({
        ...req,
        // Garantir que campos essenciais não estejam faltando
        id: req.id,
        name: req.name || 'Nome não encontrado',
        type: req.type || 'Tipo não especificado',
        email: req.email || 'Email não especificado',
        status: req.status || 'pending_plan_change',
        requestType: req.requestType || 'mudanca_plano', // Tipo de solicitação (nova org ou mudança)
        currentPlanId: req.currentPlanId || null,
        requestedPlanId: req.requestedPlanId || null,
        requestDate: req.requestDate || new Date(),
        currentPlanName: req.currentPlanName || 'Plano não especificado',
        requestedPlanName: req.requestedPlanName || 'Plano não especificado'
      }));
      
      const response = {
        success: true,
        totalRequests: enhancedRequests.length,
        requests: enhancedRequests
      };
      
      console.log("Resposta final enviada:", JSON.stringify(response, null, 2));
      
      // Forçar conteúdo JSON (não HTML)
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json(response);
    } catch (error) {
      console.error("Erro ao obter solicitações de mudança de plano:", error);
      res.status(500).json({ message: "Falha ao obter solicitações de mudança de plano." });
    }
  });
  
  // Rota para gerenciar solicitações de mudança de plano (aprovar/rejeitar)
  app.post("/api/plan-change-requests/:action", authenticate, async (req, res) => {
    try {
      if (!req.session?.user || req.session.user.role !== 'admin') {
        return res.status(401).json({ 
          message: "Não autorizado. Apenas administradores podem gerenciar solicitações de mudança de plano." 
        });
      }
      
      const { organizationId, planId } = req.body;
      const { action } = req.params;
      
      if (!organizationId || (action === 'approve' && !planId)) {
        return res.status(400).json({ message: "Dados insuficientes para processar a solicitação." });
      }
      
      if (action !== 'approve' && action !== 'reject') {
        return res.status(400).json({ message: "Ação inválida. Use 'approve' ou 'reject'." });
      }
      
      // Buscar a organização
      const [organization] = await db.select().from(organizations).where(eq(organizations.id, organizationId));
      
      if (!organization) {
        return res.status(404).json({ message: "Organização não encontrada." });
      }
      
      // Aceitar tanto organizações com mudança de plano pendente quanto organizações novas
      if (organization.status !== 'pending_plan_change' && organization.status !== 'pending') {
        return res.status(400).json({ message: "Esta organização não possui uma solicitação pendente." });
      }
      
      // Buscar informações do plano solicitado
      const [requestedPlan] = await db.select().from(plans).where(eq(plans.id, organization.requestedPlanId || 0));
      
      if (action === 'approve') {
        // Buscar plano aprovado (pode ser diferente do solicitado, se o admin decidir)
        const [planToApply] = await db.select().from(plans).where(eq(plans.id, planId));
        
        if (!planToApply) {
          return res.status(404).json({ message: "Plano não encontrado." });
        }
        
        // Dependendo do tipo de solicitação (mudança de plano ou nova organização)
        // teremos diferentes comportamentos
        const isNewOrganization = organization.status === 'pending';
        
        // Buscar plano atual para registrar no histórico
        // Para novas organizações, o plano atual pode ser nulo
        const [currentPlan] = organization.planId 
          ? await db.select().from(plans).where(eq(plans.id, organization.planId))
          : [];
        
        // Preparar o histórico de planos para atualização
        let planHistory = [];
        try {
          // Tentar fazer parse do histórico existente ou iniciar um array vazio
          planHistory = organization.planHistory ? JSON.parse(organization.planHistory as string) : [];
        } catch (error) {
          console.error("Erro ao analisar planHistory:", error);
          planHistory = [];
        }
        
        // Registrar a mudança no histórico
        const historyEntry = {
          date: new Date(),
          previousPlanId: organization.planId,
          previousPlanName: currentPlan?.name || 'Nenhum plano (nova organização)',
          newPlanId: planToApply.id,
          newPlanName: planToApply.name,
          action: isNewOrganization ? "initial_plan" : "upgrade",
          approvedById: req.session.user.id,
          approvedByName: req.session.user.name,
          status: "approved"
        };
        
        planHistory.push(historyEntry);
        
        console.log(`Aprovando mudança de plano para organização ${organizationId}, novo plano: ${planId}`);
        
        // Atualizar a organização com o novo plano e o histórico de planos
        await db.update(organizations)
          .set({
            planId: planId,
            plan: planToApply.name, // Atualizar também o nome do plano
            planTier: planToApply.tier,
            status: 'active', // Voltar ao status normal
            requestedPlanId: null, // Limpar solicitação
            planHistory: JSON.stringify(planHistory), // Atualizar o histórico de planos
            updatedAt: new Date()
          })
          .where(eq(organizations.id, organizationId));
          
        // Criar notificação para a organização
        await db.insert(notifications).values({
          title: isNewOrganization ? "Organização aprovada" : "Mudança de plano aprovada",
          message: isNewOrganization 
            ? `Sua organização foi aprovada com o plano ${planToApply.name}.` 
            : `Sua solicitação para mudar para o plano ${planToApply.name} foi aprovada.`,
          type: "success",
          organizationId: organizationId,
          isRead: false,
          createdAt: new Date()
        });
        
        res.status(200).json({ 
          success: true, 
          message: isNewOrganization
            ? `Organização aprovada com plano ${planToApply.name} com sucesso.`
            : `Solicitação de mudança para o plano ${planToApply.name} aprovada com sucesso.` 
        });
      } else {
        // Rejeitar a solicitação
        console.log(`Rejeitando ${organization.status === 'pending' ? 'organização' : 'mudança de plano'} para organização ${organizationId}`);
        
        // Dependendo do tipo de solicitação (mudança de plano ou nova organização)
        const isNewOrganization = organization.status === 'pending';
        
        // Buscar plano atual para registrar no histórico
        // Para novas organizações, o plano atual pode ser nulo
        const [currentPlan] = organization.planId 
          ? await db.select().from(plans).where(eq(plans.id, organization.planId))
          : [];
        
        // Preparar o histórico de planos para atualização
        let planHistory = [];
        try {
          // Tentar fazer parse do histórico existente ou iniciar um array vazio
          planHistory = organization.planHistory ? JSON.parse(organization.planHistory as string) : [];
        } catch (error) {
          console.error("Erro ao analisar planHistory:", error);
          planHistory = [];
        }
        
        // Registrar a rejeição no histórico
        const historyEntry = {
          date: new Date(),
          previousPlanId: organization.planId,
          previousPlanName: currentPlan?.name || 'Desconhecido',
          requestedPlanId: organization.requestedPlanId,
          requestedPlanName: requestedPlan?.name || 'Desconhecido',
          action: "rejected",
          rejectedById: req.session.user.id,
          rejectedByName: req.session.user.name,
          status: "rejected",
          reason: req.body.rejectionReason || "Solicitação rejeitada pelo administrador"
        };
        
        planHistory.push(historyEntry);
        
        await db.update(organizations)
          .set({
            status: 'active', // Voltar ao status normal
            requestedPlanId: null, // Limpar solicitação
            planHistory: JSON.stringify(planHistory), // Atualizar o histórico de planos
            updatedAt: new Date()
          })
          .where(eq(organizations.id, organizationId));
          
        // Criar notificação para a organização
        await db.insert(notifications).values({
          title: isNewOrganization ? "Organização rejeitada" : "Mudança de plano rejeitada",
          message: isNewOrganization
            ? `Sua solicitação de organização foi rejeitada.`
            : `Sua solicitação para mudar para o plano ${requestedPlan?.name || 'solicitado'} foi rejeitada.`,
          type: "error",
          organizationId: organizationId,
          isRead: false,
          createdAt: new Date()
        });
        
        res.status(200).json({ 
          success: true, 
          message: isNewOrganization
            ? "Solicitação de organização rejeitada com sucesso."
            : "Solicitação de mudança de plano rejeitada com sucesso." 
        });
      }
    } catch (error) {
      console.error("Erro ao processar solicitação:", error);
      res.status(500).json({ message: "Falha ao processar a solicitação." });
    }
  });
  
  // Rota para trocar o plano da organização
  app.post("/api/organizations/change-plan", authenticate, async (req, res) => {
    try {
      if (!req.session || !req.session.user || !req.session.user.organizationId) {
        return res.status(401).json({ message: "Não autorizado" });
      }
      
      // Verificar se o usuário é admin da organização
      if (req.session.user.role !== 'admin' && req.session.user.role !== 'org_admin') {
        return res.status(403).json({ message: "Permissão negada. Apenas administradores podem alterar o plano." });
      }
      
      const { planId } = req.body;
      const organizationId = req.session.user.organizationId;
      
      if (!planId) {
        return res.status(400).json({ message: "ID do plano é obrigatório" });
      }
      
      // Verificar se o plano existe
      const [plan] = await db.select().from(plans).where(eq(plans.id, planId));
      
      if (!plan) {
        return res.status(404).json({ message: "Plano não encontrado" });
      }

      // Buscar organização para obter o plano atual
      const [organization] = await db.select().from(organizations).where(eq(organizations.id, organizationId));
      
      if (!organization) {
        return res.status(404).json({ message: "Organização não encontrada" });
      }
      
      // Buscar detalhes do plano atual
      const [currentPlan] = await db.select().from(plans).where(eq(plans.id, organization.planId));
      
      // Preparar o histórico de planos para atualização
      let planHistory = [];
      try {
        // Tentar fazer parse do histórico existente ou iniciar um array vazio
        planHistory = organization.planHistory ? JSON.parse(organization.planHistory as string) : [];
      } catch (error) {
        console.error("Erro ao analisar planHistory:", error);
        planHistory = [];
      }
      
      // Registrar a mudança direta no histórico (sem aprovação admin)
      const historyEntry = {
        date: new Date(),
        previousPlanId: organization.planId,
        previousPlanName: currentPlan?.name || 'Desconhecido',
        newPlanId: plan.id,
        newPlanName: plan.name,
        action: "direct_change",
        changedById: req.session.user.id,
        changedByName: req.session.user.name,
        status: "completed"
      };
      
      planHistory.push(historyEntry);
      
      // Atualizar o plano da organização com histórico
      await db.update(organizations)
        .set({ 
          planId: planId,
          plan: plan.name,
          planTier: plan.tier,
          planHistory: JSON.stringify(planHistory),
          updatedAt: new Date()
        })
        .where(eq(organizations.id, organizationId));
      
      // Criar um registro de transação financeira
      await db.insert(financialTransactions).values({
        organizationId: organizationId,
        type: 'receita',
        amount: plan.price.toString(),
        description: `Upgrade de plano para ${plan.name}`,
        status: 'pago',
        categoryId: 1, // ID da categoria de receitas de assinaturas
        date: new Date(),
        notes: `Alteração de plano realizada pelo usuário ${req.session.user.name} (ID: ${req.session.user.id})`,
      });
      
      // Buscar organização atualizada
      const [updatedOrganization] = await db.select()
        .from(organizations)
        .where(eq(organizations.id, organizationId));
      
      res.json(updatedOrganization);
    } catch (error) {
      console.error("Erro ao trocar plano:", error);
      res.status(500).json({ message: "Falha ao trocar o plano da organização" });
    }
  });
  
  // Rota para buscar módulos ativos da organização
  // Buscar todos os módulos de uma organização (ativos e inativos)
  // Esta rota foi movida para a linha ~1820 para evitar duplicação de rota
  app.get("/api/organization-modules/v2/:organizationId", async (req, res) => {
    try {
      const organizationId = parseInt(req.params.organizationId);
      
      if (isNaN(organizationId)) {
        return res.status(400).json({ message: "ID da organização inválido" });
      }
      
      console.log("Buscando módulos para organização:", organizationId);
      
      // Verificar se a tabela existe
      const tableExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'organization_modules'
        );
      `);
      
      console.log("Tabela organization_modules existe:", tableExists);
      
      // Verificar as colunas disponíveis
      const columnsQuery = await pool.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'organization_modules';
      `);
      
      const columns = columnsQuery.rows.map(row => row.column_name);
      console.log("Colunas disponíveis:", columns);
      
      // Buscar todos os módulos da organização
      const query = `
        SELECT om.*, 
               m.id as module_id, 
               m.name as module_name, 
               m.type as module_type,
               m.description as module_description, 
               mp.id as plan_id,
               mp.name as plan_name,
               mp.price as plan_price, 
               mp.billing_cycle as billing_cycle
        FROM organization_modules om
        LEFT JOIN modules m ON om.module_id = m.id
        LEFT JOIN module_plans mp ON om.plan_id = mp.id
        WHERE om.organization_id = $1
      `;
      
      const result = await pool.query(query, [organizationId]);
      
      if (!result.rows.length) {
        return res.json([]);
      }
      
      // Adaptar os dados para manter compatibilidade com a API atual
      const formattedResults = result.rows.map(row => {
        return {
          id: row.id,
          organizationId: row.organization_id,
          moduleId: row.module_id,
          planId: row.plan_id,
          active: row.active,
          status: row.status,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          startDate: row.start_date,
          expiryDate: row.expiry_date,
          billingDay: row.billing_day,
          
          // Informações do módulo e plano
          moduleName: row.module_name,
          planName: row.plan_name,
          billingCycle: row.billing_cycle,
          price: row.plan_price,
          
          // Adicionar moduleInfo para compatibilidade
          moduleInfo: {
            id: row.module_id,
            name: row.module_name,
            type: row.module_type,
            description: row.module_description
          }
        };
      });
      
      res.json(formattedResults);
    } catch (error) {
      console.error("Error fetching organization modules:", error);
      res.status(500).json({ message: "Failed to fetch organization modules" });
    }
  });
  
  app.get("/api/organizations/modules/active", authenticate, async (req, res) => {
    try {
      if (!req.session || !req.session.user || !req.session.user.organizationId) {
        return res.status(401).json({ message: "Não autorizado" });
      }
      
      const organizationId = req.session.user.organizationId;
      
      // Buscar os módulos ativos com informações completas verificando as colunas disponíveis
      const columnsQuery = await pool.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'modules'
      `);
      
      const moduleColumns = columnsQuery.rows.map(row => row.column_name);
      console.log("Colunas disponíveis em modules:", moduleColumns);
      
      // Montar consulta SQL baseada nas colunas existentes
      let selectClause = 'SELECT om.id, om.organization_id, om.module_id, om.active, om.status';
      
      // Adicionar seleção dinâmica de colunas da tabela modules
      if (moduleColumns.includes('name')) {
        selectClause += ', m.name';
      }
      if (moduleColumns.includes('description')) {
        selectClause += ', m.description';
      }
      if (moduleColumns.includes('type')) {
        selectClause += ', m.type';
      }
      if (moduleColumns.includes('icon_name')) {
        selectClause += ', m.icon_name';
      }
      if (moduleColumns.includes('is_active')) {
        selectClause += ', m.is_active';
      }
      
      const query = `
        ${selectClause}
        FROM organization_modules om
        JOIN modules m ON om.module_id = m.id
        WHERE om.organization_id = $1 AND om.active = true
      `;
      
      console.log("Consulta SQL para módulos ativos:", query);
      const result = await pool.query(query, [organizationId]);
      
      res.json(result.rows);
    } catch (error) {
      console.error("Erro ao buscar módulos ativos:", error);
      res.status(500).json({ message: "Falha ao buscar módulos ativos da organização" });
    }
  });
  
  // Rota para adicionar um módulo à organização
  app.post("/api/organizations/modules/add", authenticate, async (req, res) => {
    try {
      if (!req.session || !req.session.user || !req.session.user.organizationId) {
        return res.status(401).json({ message: "Não autorizado" });
      }
      
      // Verificar se o usuário é admin da organização
      if (req.session.user.role !== 'admin' && req.session.user.role !== 'org_admin') {
        return res.status(403).json({ message: "Permissão negada. Apenas administradores podem adicionar módulos." });
      }
      
      const { moduleId, planId } = req.body;
      const organizationId = req.session.user.organizationId;
      
      if (!moduleId) {
        return res.status(400).json({ message: "ID do módulo é obrigatório" });
      }
      
      // Verificar se o módulo existe
      const [module] = await db.select().from(modules).where(eq(modules.id, moduleId));
      
      if (!module) {
        return res.status(404).json({ message: "Módulo não encontrado" });
      }
      
      // Verificar se a organização já tem este módulo
      const [existingModule] = await db.select()
        .from(organizationModules)
        .where(and(
          eq(organizationModules.organization_id, organizationId),
          eq(organizationModules.module_id, moduleId)
        ));
      
      if (existingModule) {
        // Se o módulo já existe mas está inativo, apenas reativar
        if (!existingModule.active) {
          await db.update(organizationModules)
            .set({ 
              active: true,
              updated_at: new Date()
            })
            .where(eq(organizationModules.id, existingModule.id));
          
          res.json({ message: "Módulo reativado com sucesso" });
        } else {
          return res.status(400).json({ message: "Este módulo já está ativo para esta organização" });
        }
      } else {
        // Adicionar o novo módulo
        await db.insert(organizationModules).values({
          organization_id: organizationId,
          module_id: moduleId,
          planId: planId || null,
          active: true,
        });
        
        // Criar um registro de transação financeira
        await db.insert(financialTransactions).values({
          organizationId: organizationId,
          type: 'receita',
          amount: '99.00', // Preço padrão do módulo
          description: `Adição do módulo ${module.name}`,
          status: 'pago',
          categoryId: 1, // ID da categoria de receitas de assinaturas
          date: new Date(),
          notes: `Adição de módulo realizada pelo usuário ${req.session.user.name} (ID: ${req.session.user.id})`,
        });
        
        res.json({ message: "Módulo adicionado com sucesso" });
      }
    } catch (error) {
      console.error("Erro ao adicionar módulo:", error);
      res.status(500).json({ message: "Falha ao adicionar módulo à organização" });
    }
  });

  // API de Assinaturas
  app.post('/api/subscriptions/create', authenticate, async (req, res) => {
    try {
      const { planId, organizationId } = req.body;
      
      console.log(`API subscriptions/create - Recebido: planId=${planId}, organizationId=${organizationId}`);
      
      if (!planId || !organizationId) {
        return res.status(400).json({ 
          success: false, 
          message: "Plan ID and organization ID are required" 
        });
      }
      
      // Verificar se a organização existe antes de tentar criar a assinatura
      console.log(`Verificando organização com ID ${organizationId}`);
      const orgs = await db.select().from(organizations).where(eq(organizations.id, organizationId));
      console.log(`Consulta retornou ${orgs.length} organizações`);
      
      if (!orgs || orgs.length === 0) {
        console.error(`Organização com ID ${organizationId} não encontrada no banco de dados`);
        return res.status(404).json({
          success: false,
          message: "Organização não encontrada"
        });
      }
      
      const organization = orgs[0];
      console.log(`Organização encontrada: ${organization.name} (ID: ${organization.id})`);
      
      console.log(`Chamando createSubscription(${organizationId}, ${planId})`);
      const result = await createSubscription(organizationId, planId);
      res.json(result);
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to create subscription",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.post('/api/subscriptions/cancel', authenticate, async (req, res) => {
    try {
      const { subscriptionId } = req.body;
      
      if (!subscriptionId) {
        return res.status(400).json({ 
          success: false, 
          message: "Subscription ID is required" 
        });
      }
      
      const result = await cancelSubscription(subscriptionId);
      res.json(result);
    } catch (error) {
      console.error("Error canceling subscription:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to cancel subscription",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.post('/api/subscriptions/update', authenticate, async (req, res) => {
    try {
      const { subscriptionId, planId } = req.body;
      
      if (!subscriptionId || !planId) {
        return res.status(400).json({ 
          success: false, 
          message: "Subscription ID and plan ID are required" 
        });
      }
      
      const result = await updateSubscriptionPlan(subscriptionId, planId);
      res.json(result);
    } catch (error) {
      console.error("Error updating subscription plan:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to update subscription plan",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.get('/api/subscriptions/:organizationId', authenticate, async (req, res) => {
    try {
      const organizationId = parseInt(req.params.organizationId);
      
      if (isNaN(organizationId)) {
        return res.status(400).json({ 
          success: false, 
          message: "Valid organization ID is required" 
        });
      }
      
      // Buscar assinatura da organização
      const organization = await db.select()
        .from(organizations)
        .where(eq(organizations.id, organizationId))
        .limit(1);
      
      if (organization.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: "Organization not found" 
        });
      }
      
      const org = organization[0];
      
      if (!org.stripeCustomerId || !org.stripeSubscriptionId) {
        return res.status(404).json({ 
          success: false, 
          message: "Organization does not have an active subscription" 
        });
      }
      
      // Buscar detalhes da assinatura no Stripe
      const subscriptionDetails = await getSubscriptionDetails(org.stripeSubscriptionId);
      
      res.json({
        success: true,
        subscription: subscriptionDetails
      });
    } catch (error) {
      console.error("Error fetching subscription details:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch subscription details",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.post("/api/payments/confirm-plan-payment", authenticate, async (req, res) => {
    try {
      const { paymentIntentId, organizationId } = req.body;
      
      if (!paymentIntentId || !organizationId) {
        return res.status(400).json({ message: "Payment intent ID and organization ID are required" });
      }
      
      const success = await processPlanPayment(paymentIntentId, Number(organizationId));
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(400).json({ message: "Payment processing failed" });
      }
    } catch (error) {
      console.error("Error confirming plan payment:", error);
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });
  
  app.post("/api/payments/confirm-module-payment", authenticate, async (req, res) => {
    try {
      const { paymentIntentId } = req.body;
      
      if (!paymentIntentId) {
        return res.status(400).json({ message: "Payment intent ID is required" });
      }
      
      const success = await processModulePayment(paymentIntentId);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(400).json({ message: "Payment processing failed" });
      }
    } catch (error) {
      console.error("Error confirming module payment:", error);
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });
  
  app.get("/api/payments/check-status/:paymentIntentId", authenticate, async (req, res) => {
    try {
      const { paymentIntentId } = req.params;
      
      if (!paymentIntentId) {
        return res.status(400).json({ message: "Payment intent ID is required" });
      }
      
      const paymentIntent = await checkPaymentStatus(paymentIntentId);
      res.json({ status: paymentIntent.status });
    } catch (error) {
      console.error("Error checking payment status:", error);
      res.status(500).json({ message: "Failed to check payment status" });
    }
  });
  
  // Serviços de assinatura já importados do topo do arquivo
  
  // Webhook do Stripe
  app.post('/api/webhooks/payment', async (req, res) => {
    try {
      await handlePaymentNotification(req, res);
    } catch (error) {
      console.error("Error handling payment notification:", error);
      res.status(500).json({ message: "Failed to handle payment notification" });
    }
  });

  // Endpoint para sincronizar pagamentos com transações financeiras
  app.post('/api/payments/sync-with-financial', authenticate, async (req: Request & {user?: any}, res) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Apenas administradores podem sincronizar pagamentos'
        });
      }
      
      // Lista todos os planos para referência
      const plansData = await db.select().from(plans);
      const modulesData = await db.select().from(modules);
      const modulePlansData = await db.select().from(modulePlans);
      
      // Lista as organizações ativas
      const orgs = await db.select().from(organizations)
        .where(eq(organizations.status, 'active'));
      
      let syncedCount = 0;
      
      // Para cada organização, criar transação para o plano atual se tem pagamento
      for (const org of orgs) {
        if (!org.planId) continue;
        
        const planDetails = plansData.find(p => p.id === org.planId);
        if (!planDetails) continue;
        
        // Verifica se já existe uma transação para este plano
        const existingTransaction = await db.select()
          .from(financialTransactions)
          .where(and(
            eq(financialTransactions.organizationId, org.id),
            eq(financialTransactions.category, 'Assinaturas'),
            eq(financialTransactions.status, 'pago')
          ))
          .orderBy(desc(financialTransactions.createdAt))
          .limit(1);
        
        // Se não existe transação ou a última foi há mais de 25 dias
        const shouldCreateTransaction = existingTransaction.length === 0 || 
          (existingTransaction.length > 0 && 
           new Date().getTime() - new Date(existingTransaction[0].createdAt).getTime() > 25 * 24 * 60 * 60 * 1000);
        
        if (shouldCreateTransaction) {
          // Criar transação financeira para o plano
          await db.insert(financialTransactions).values({
            organizationId: org.id,
            description: `Assinatura do plano ${planDetails.name}`,
            type: 'receita',
            category: 'Assinaturas',
            amount: planDetails.price,
            status: 'pago',
            dueDate: new Date(),
            paymentDate: new Date(),
            documentNumber: `PLANO-${org.id}-${Date.now()}`,
            paymentMethod: 'cartão de crédito',
            notes: 'Transação gerada automaticamente pela sincronização de pagamentos',
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          syncedCount++;
        }
        
        // Processa os módulos add-on da organização
        const orgModules = await db.select()
          .from(organizationModules)
          .where(eq(organizationModules.organization_id, org.id));
        
        for (const orgModule of orgModules) {
          const modulePlanDetails = modulePlansData.find(mp => mp.id === orgModule.plan_id);
          if (!modulePlanDetails) continue;
          
          const moduleDetails = modulesData.find(m => m.id === orgModule.module_id);
          if (!moduleDetails) continue;
          
          // Verifica se já existe uma transação para este módulo
          const existingModuleTransaction = await db.select()
            .from(financialTransactions)
            .where(and(
              eq(financialTransactions.organizationId, org.id),
              eq(financialTransactions.category, 'Módulos Add-on'),
              eq(financialTransactions.status, 'pago'),
              sql`${financialTransactions.description} LIKE ${`%${moduleDetails.name}%`}`
            ))
            .orderBy(desc(financialTransactions.createdAt))
            .limit(1);
          
          // Se não existe transação ou a última foi há mais de 25 dias
          const shouldCreateModuleTransaction = existingModuleTransaction.length === 0 || 
            (existingModuleTransaction.length > 0 && 
             new Date().getTime() - new Date(existingModuleTransaction[0].createdAt).getTime() > 25 * 24 * 60 * 60 * 1000);
          
          if (shouldCreateModuleTransaction) {
            // Criar transação financeira para o módulo
            await db.insert(financialTransactions).values({
              organizationId: org.id,
              description: `Assinatura do módulo ${moduleDetails.name} - Plano ${modulePlanDetails.name}`,
              type: 'receita',
              category: 'Módulos Add-on',
              amount: modulePlanDetails.price,
              status: 'pago',
              dueDate: new Date(),
              paymentDate: new Date(),
              documentNumber: `MODULO-${org.id}-${orgModule.module_id}-${Date.now()}`,
              paymentMethod: 'cartão de crédito',
              notes: 'Transação gerada automaticamente pela sincronização de pagamentos',
              createdAt: new Date(),
              updatedAt: new Date()
            });
            
            syncedCount++;
          }
        }
      }
      
      res.json({ 
        success: true,
        syncedCount,
        message: `${syncedCount} transações financeiras sincronizadas com sucesso.`
      });
      
    } catch (error) {
      console.error('Erro ao sincronizar pagamentos com o financeiro:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao sincronizar pagamentos com o financeiro',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Endpoint para testar envio de e-mails
  app.post('/api/email/test', authenticate, async (req, res) => {
    try {
      const { template, email, data } = req.body;
      
      if (!template || !email) {
        return res.status(400).json({ 
          success: false, 
          message: "Template e e-mail são obrigatórios" 
        });
      }
      
      // Verificar se o template é válido
      const validTemplates: EmailTemplate[] = [
        'organization_registration',
        'organization_approved',
        'organization_rejected',
        'user_welcome',
        'password_reset',
        'plan_purchase_confirmation',
        'module_purchase_confirmation',
        'payment_failed',
        'subscription_expiring',
        'limit_warning',
        'new_module_available',
        'module_status_update',
        'ticket_creation',
        'ticket_update',
        'ticket_status_update',
        'ticket_resolved'
      ];
      
      if (!validTemplates.includes(template as EmailTemplate)) {
        return res.status(400).json({ 
          success: false, 
          message: "Template inválido",
          validTemplates 
        });
      }
      
      // Dados de mock para os templates caso não sejam fornecidos
      const mockData: Record<EmailTemplate, Record<string, any>> = {
        'organization_registration': {
          organizationName: "Organização Exemplo",
          adminName: "Administrador Teste"
        },
        'organization_approved': {
          organizationName: "Organização Exemplo",
          adminName: "Administrador Teste",
          orgCode: "ORG-TEST-123456",
          loginUrl: "https://endurancy.com/login"
        },
        'organization_rejected': {
          organizationName: "Organização Exemplo",
          adminName: "Administrador Teste",
          rejectionReason: "Documentação incompleta ou inválida"
        },
        'user_welcome': {
          userName: "Usuário Teste",
          organizationName: "Organização Exemplo",
          loginUrl: "https://endurancy.com/login"
        },
        'password_reset': {
          userName: "Usuário Teste",
          resetLink: "https://endurancy.com/reset-password?token=abc123",
          expirationTime: "24 horas"
        },
        'plan_purchase_confirmation': {
          userName: "Usuário Teste",
          organizationName: "Organização Exemplo",
          planName: "Plano Pro",
          planPrice: 2999.00,
          planDetails: ["Até 10.000 registros", "Suporte prioritário", "Todos os módulos básicos"],
          startDate: new Date().toISOString(),
          nextBillingDate: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
          orderNumber: "ORD-" + Date.now(),
          accountUrl: "https://endurancy.com/account"
        },
        'module_purchase_confirmation': {
          userName: "Usuário Teste",
          organizationName: "Organização Exemplo",
          moduleName: "Módulo CRM",
          modulePrice: 99.00,
          startDate: new Date().toISOString(),
          billingCycle: "mensal",
          orderNumber: "ORD-" + Date.now(),
          accountUrl: "https://endurancy.com/modules"
        },
        'payment_failed': {
          userName: "Usuário Teste",
          organizationName: "Organização Exemplo",
          planOrModuleName: "Plano Pro",
          attemptDate: new Date().toISOString(),
          paymentMethod: "Cartão de crédito terminando em 4242",
          amount: 2999.00,
          reason: "Cartão recusado pela operadora",
          updatePaymentUrl: "https://endurancy.com/payment-update"
        },
        'subscription_expiring': {
          userName: "Usuário Teste",
          organizationName: "Organização Exemplo",
          planName: "Plano Pro",
          expirationDate: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
          renewalPrice: 2999.00,
          renewUrl: "https://endurancy.com/renew",
          daysLeft: 7
        },
        'limit_warning': {
          userName: "Usuário Teste",
          organizationName: "Organização Exemplo",
          limitType: "cadastros",
          currentUsage: 9200,
          totalLimit: 10000,
          percentageUsed: 92,
          upgradeUrl: "https://endurancy.com/upgrade"
        },
        'new_module_available': {
          userName: "Usuário Teste",
          organizationName: "Organização Exemplo",
          moduleName: "Módulo CRM Avançado",
          moduleDescription: "Uma solução completa para gestão de relacionamento com clientes, com recursos de automação e análise de dados.",
          modulePrice: 199.00,
          billingCycle: "mensal",
          features: [
            "Gestão de leads e oportunidades",
            "Automação de campanhas",
            "Relatórios personalizados",
            "Integração com outros módulos"
          ],
          moduleUrl: "https://endurancy.com/modules/crm-avancado"
        },
        'module_status_update': {
          userName: "Usuário Teste",
          organizationName: "Organização Exemplo",
          moduleName: "Módulo Portal do Médico",
          oldStatus: "Em teste",
          newStatus: "Ativo",
          updateDetails: "O módulo foi completamente testado e validado, e agora está disponível para uso em produção.",
          updateDate: new Date().toISOString(),
          moduleUrl: "https://endurancy.com/modules/portal-medico"
        },
        'ticket_creation': {
          ticketId: 123,
          ticketTitle: "Problema de Login no Sistema",
          priority: "alta",
          organizationName: "Organização Exemplo",
          description: "Estamos enfrentando problemas ao tentar fazer login no sistema. A página carrega, mas ao submeter as credenciais, nada acontece."
        },
        'ticket_update': {
          ticketId: 123,
          ticketTitle: "Problema de Login no Sistema",
          commentContent: "Verificamos o problema e identificamos que pode estar relacionado com uma atualização recente no servidor. Estamos trabalhando na solução.",
          commentAuthor: "Suporte Técnico",
          organizationName: "Organização Exemplo"
        },
        'ticket_status_update': {
          ticketId: 123,
          ticketTitle: "Problema de Login no Sistema",
          oldStatus: "novo",
          newStatus: "em_analise"
        },
        'ticket_resolved': {
          ticketId: 123,
          ticketTitle: "Problema de Login no Sistema",
          resolution: "O problema foi resolvido através de uma atualização no servidor de autenticação. Todos os usuários já devem conseguir fazer login normalmente.",
          resolutionDate: new Date().toISOString()
        }
      };
      
      // Usar os dados fornecidos ou os dados de mock
      const templateData = data || mockData[template as EmailTemplate];
      
      // Enviar o e-mail de teste
      const subject = `[TESTE] - ${template.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}`;
      const result = await sendTemplateEmail(
        email,
        subject,
        template as EmailTemplate,
        templateData
      );
      
      if (result) {
        res.status(200).json({
          success: true,
          message: `E-mail de teste enviado com sucesso para ${email} usando o template "${template}"`,
          templateData
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Erro ao enviar e-mail de teste"
        });
      }
    } catch (error) {
      console.error('Erro ao enviar e-mail de teste:', error);
      res.status(500).json({ 
        success: false, 
        message: "Erro ao enviar e-mail de teste",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Endpoint para alternar modo de e-mail (teste ou produção)
  app.post('/api/email/toggle-test-mode', authenticate, async (req: Request & {user?: any}, res) => {
    try {
      // Certificar que é um admin
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: "Apenas administradores podem alterar esta configuração"
        });
      }
      
      // Este seria um valor armazenado no banco ou variável de sistema
      // Para simplificar, vamos apenas retornar que foi alternado
      const newTestMode = !req.body.currentTestMode;
      
      res.status(200).json({
        success: true,
        testMode: newTestMode,
        message: newTestMode ? 
          "Modo de teste de e-mail ativado. E-mails não serão enviados para destinatários reais." :
          "Modo de produção de e-mail ativado. E-mails serão enviados para destinatários reais."
      });
    } catch (error) {
      console.error('Erro ao alternar modo de e-mail:', error);
      res.status(500).json({
        success: false,
        message: "Erro ao alternar modo de teste de e-mail",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Endpoint para salvar configurações gerais
  app.post('/api/settings/general', authenticate, async (req: Request & {user?: any}, res) => {
    try {
      // Certificar que é um admin
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: "Apenas administradores podem alterar estas configurações"
        });
      }
      
      const { platformName, platformUrl, timezone, dateFormat } = req.body;
      
      // Validar dados recebidos
      if (!platformName || !platformUrl) {
        return res.status(400).json({
          success: false,
          message: "Nome da plataforma e URL são obrigatórios"
        });
      }
      
      // Em um sistema real, salvaríamos esses dados no banco
      // Para este protótipo, apenas retornamos sucesso
      
      res.status(200).json({
        success: true,
        message: "Configurações gerais salvas com sucesso",
        settings: {
          platformName,
          platformUrl,
          timezone,
          dateFormat
        }
      });
    } catch (error) {
      console.error('Erro ao salvar configurações gerais:', error);
      res.status(500).json({
        success: false,
        message: "Erro ao salvar configurações gerais",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Endpoint para salvar configurações de segurança
  app.post('/api/settings/security', authenticate, async (req: Request & {user?: any}, res) => {
    try {
      // Certificar que é um admin
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: "Apenas administradores podem alterar estas configurações"
        });
      }
      
      const { 
        passwordPolicy, 
        sessionTimeout, 
        twoFactorAuthRequired,
        ipRestrictions 
      } = req.body;
      
      // Em um sistema real, salvaríamos esses dados no banco
      // Para este protótipo, apenas retornamos sucesso
      
      res.status(200).json({
        success: true,
        message: "Configurações de segurança salvas com sucesso",
        settings: {
          passwordPolicy, 
          sessionTimeout, 
          twoFactorAuthRequired,
          ipRestrictions
        }
      });
    } catch (error) {
      console.error('Erro ao salvar configurações de segurança:', error);
      res.status(500).json({
        success: false,
        message: "Erro ao salvar configurações de segurança",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // ========== ENDPOINTS DO MÓDULO FINANCEIRO ==========
  
  // === CONTAS A PAGAR E RECEBER ===
  
  // Listar transações financeiras
  app.get('/api/financial/transactions', authenticate, async (req: Request & {user?: any}, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Não autenticado' });
      }
      
      const organizationId = req.query.organizationId ? parseInt(req.query.organizationId as string) : req.user.organizationId;
      
      if (!organizationId && req.user.role !== 'admin') {
        return res.status(400).json({ success: false, message: 'ID da organização é obrigatório' });
      }
      
      const type = req.query.type as string;
      const status = req.query.status as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      let query = db.select().from(financialTransactions);
      
      // Aplicar filtros
      if (organizationId) {
        query = query.where(eq(financialTransactions.organizationId, organizationId));
      }
      
      if (type) {
        query = query.where(eq(financialTransactions.type, type as any));
      }
      
      if (status) {
        query = query.where(eq(financialTransactions.status, status as any));
      }
      
      if (startDate) {
        query = query.where(gte(financialTransactions.dueDate, new Date(startDate)));
      }
      
      if (endDate) {
        query = query.where(lte(financialTransactions.dueDate, new Date(endDate)));
      }
      
      const transactions = await query.orderBy(desc(financialTransactions.dueDate));
      
      res.json({ success: true, transactions });
    } catch (error) {
      console.error('Erro ao buscar transações financeiras:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar transações financeiras',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Obter transação financeira pelo ID
  app.get('/api/financial/transactions/:id', authenticate, async (req: Request & {user?: any}, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Não autenticado' });
      }
      
      const id = parseInt(req.params.id);
      
      const transaction = await db.query.financialTransactions.findFirst({
        where: eq(financialTransactions.id, id),
      });
      
      if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transação não encontrada' });
      }
      
      // Verificar se o usuário tem acesso a esta transação
      if (req.user.role !== 'admin' && transaction.organizationId !== req.user.organizationId) {
        return res.status(403).json({ success: false, message: 'Sem permissão para acessar esta transação' });
      }
      
      res.json({ success: true, transaction });
    } catch (error) {
      console.error('Erro ao buscar transação financeira:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar transação financeira',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Criar transação financeira
  app.post('/api/financial/transactions', authenticate, async (req: Request & {user?: any}, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Não autenticado' });
      }
      
      // Validar os dados recebidos
      const validatedData = insertFinancialTransactionSchema.parse(req.body);
      
      // Inserir transação
      const [transaction] = await db.insert(financialTransactions).values(validatedData).returning();
      
      res.status(201).json({ success: true, transaction, message: 'Transação criada com sucesso' });
    } catch (error) {
      console.error('Erro ao criar transação financeira:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: 'Dados inválidos',
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao criar transação financeira',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Atualizar transação financeira
  app.put('/api/financial/transactions/:id', authenticate, async (req: Request & {user?: any}, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Não autenticado' });
      }
      
      const id = parseInt(req.params.id);
      
      // Verificar se a transação existe
      const existingTransaction = await db.query.financialTransactions.findFirst({
        where: eq(financialTransactions.id, id),
      });
      
      if (!existingTransaction) {
        return res.status(404).json({ success: false, message: 'Transação não encontrada' });
      }
      
      // Verificar se o usuário tem permissão para atualizar esta transação
      if (req.user.role !== 'admin' && existingTransaction.organizationId !== req.user.organizationId) {
        return res.status(403).json({ success: false, message: 'Sem permissão para atualizar esta transação' });
      }
      
      // Atualizar transação
      await db.update(financialTransactions)
        .set({
          ...req.body,
          updatedAt: new Date(),
        })
        .where(eq(financialTransactions.id, id));
      
      // Buscar a transação atualizada
      const updatedTransaction = await db.query.financialTransactions.findFirst({
        where: eq(financialTransactions.id, id),
      });
      
      res.json({ 
        success: true, 
        transaction: updatedTransaction, 
        message: 'Transação atualizada com sucesso' 
      });
    } catch (error) {
      console.error('Erro ao atualizar transação financeira:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: 'Dados inválidos',
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao atualizar transação financeira',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Deletar transação financeira
  app.delete('/api/financial/transactions/:id', authenticate, async (req: Request & {user?: any}, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Não autenticado' });
      }
      
      const id = parseInt(req.params.id);
      
      // Verificar se a transação existe
      const existingTransaction = await db.query.financialTransactions.findFirst({
        where: eq(financialTransactions.id, id),
      });
      
      if (!existingTransaction) {
        return res.status(404).json({ success: false, message: 'Transação não encontrada' });
      }
      
      // Verificar se o usuário tem permissão para deletar esta transação
      if (req.user.role !== 'admin' && existingTransaction.organizationId !== req.user.organizationId) {
        return res.status(403).json({ success: false, message: 'Sem permissão para deletar esta transação' });
      }
      
      // Deletar transação
      await db.delete(financialTransactions).where(eq(financialTransactions.id, id));
      
      res.json({ success: true, message: 'Transação deletada com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar transação financeira:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao deletar transação financeira',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // === COLABORADORES / FUNCIONÁRIOS ===
  
  // Listar colaboradores
  app.get('/api/employees', authenticate, async (req: Request & {user?: any}, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Não autenticado' });
      }
      
      const organizationId = req.query.organizationId ? parseInt(req.query.organizationId as string) : req.user.organizationId;
      
      if (!organizationId && req.user.role !== 'admin') {
        return res.status(400).json({ success: false, message: 'ID da organização é obrigatório' });
      }
      
      let query = db.select().from(employees);
      
      if (organizationId) {
        query = query.where(eq(employees.organizationId, organizationId));
      }
      
      // Filtrar por departamento se especificado
      if (req.query.department) {
        query = query.where(eq(employees.department, req.query.department as any));
      }
      
      // Filtrar por status se especificado
      if (req.query.status) {
        query = query.where(eq(employees.status, req.query.status as any));
      }
      
      const employeesList = await query.orderBy(asc(employees.name));
      
      res.json({ success: true, employees: employeesList });
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar colaboradores',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Obter colaborador pelo ID
  app.get('/api/employees/:id', authenticate, async (req: Request & {user?: any}, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Não autenticado' });
      }
      
      const id = parseInt(req.params.id);
      
      const employee = await db.query.employees.findFirst({
        where: eq(employees.id, id),
      });
      
      if (!employee) {
        return res.status(404).json({ success: false, message: 'Colaborador não encontrado' });
      }
      
      // Verificar se o usuário tem acesso a este colaborador
      if (req.user.role !== 'admin' && employee.organizationId !== req.user.organizationId) {
        return res.status(403).json({ success: false, message: 'Sem permissão para acessar este colaborador' });
      }
      
      res.json({ success: true, employee });
    } catch (error) {
      console.error('Erro ao buscar colaborador:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar colaborador',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Criar colaborador
  app.post('/api/employees', authenticate, async (req: Request & {user?: any}, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Não autenticado' });
      }
      
      // Validar os dados recebidos
      const validatedData = insertEmployeeSchema.parse(req.body);
      
      // Inserir colaborador
      const [employee] = await db.insert(employees).values(validatedData).returning();
      
      res.status(201).json({ success: true, employee, message: 'Colaborador criado com sucesso' });
    } catch (error) {
      console.error('Erro ao criar colaborador:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: 'Dados inválidos',
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao criar colaborador',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Atualizar colaborador
  app.put('/api/employees/:id', authenticate, async (req: Request & {user?: any}, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Não autenticado' });
      }
      
      const id = parseInt(req.params.id);
      
      // Verificar se o colaborador existe
      const existingEmployee = await db.query.employees.findFirst({
        where: eq(employees.id, id),
      });
      
      if (!existingEmployee) {
        return res.status(404).json({ success: false, message: 'Colaborador não encontrado' });
      }
      
      // Verificar se o usuário tem permissão para atualizar este colaborador
      if (req.user.role !== 'admin' && existingEmployee.organizationId !== req.user.organizationId) {
        return res.status(403).json({ success: false, message: 'Sem permissão para atualizar este colaborador' });
      }
      
      // Atualizar colaborador
      await db.update(employees)
        .set({
          ...req.body,
          updatedAt: new Date(),
        })
        .where(eq(employees.id, id));
      
      // Buscar o colaborador atualizado
      const updatedEmployee = await db.query.employees.findFirst({
        where: eq(employees.id, id),
      });
      
      res.json({ 
        success: true, 
        employee: updatedEmployee, 
        message: 'Colaborador atualizado com sucesso' 
      });
    } catch (error) {
      console.error('Erro ao atualizar colaborador:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: 'Dados inválidos',
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao atualizar colaborador',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // === FOLHA DE PAGAMENTO ===
  
  // Listar registros de folha de pagamento
  app.get('/api/payroll', authenticate, async (req: Request & {user?: any}, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Não autenticado' });
      }
      
      const organizationId = req.query.organizationId ? parseInt(req.query.organizationId as string) : req.user.organizationId;
      
      if (!organizationId && req.user.role !== 'admin') {
        return res.status(400).json({ success: false, message: 'ID da organização é obrigatório' });
      }
      
      const month = req.query.month ? parseInt(req.query.month as string) : null;
      const year = req.query.year ? parseInt(req.query.year as string) : null;
      const employeeId = req.query.employeeId ? parseInt(req.query.employeeId as string) : null;
      
      let query = db.select().from(payroll);
      
      if (organizationId) {
        query = query.where(eq(payroll.organizationId, organizationId));
      }
      
      if (month !== null) {
        query = query.where(eq(payroll.month, month));
      }
      
      if (year !== null) {
        query = query.where(eq(payroll.year, year));
      }
      
      if (employeeId !== null) {
        query = query.where(eq(payroll.employeeId, employeeId));
      }
      
      const payrollRecords = await query.orderBy(desc(payroll.year), desc(payroll.month));
      
      res.json({ success: true, payroll: payrollRecords });
    } catch (error) {
      console.error('Erro ao buscar folha de pagamento:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar folha de pagamento',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Criar registro de folha de pagamento
  app.post('/api/payroll', authenticate, async (req: Request & {user?: any}, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Não autenticado' });
      }
      
      // Validar os dados recebidos
      const validatedData = insertPayrollSchema.parse(req.body);
      
      // Inserir registro de folha de pagamento
      const [record] = await db.insert(payroll).values(validatedData).returning();
      
      res.status(201).json({ success: true, record, message: 'Registro de folha de pagamento criado com sucesso' });
    } catch (error) {
      console.error('Erro ao criar registro de folha de pagamento:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: 'Dados inválidos',
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao criar registro de folha de pagamento',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // === CONTROLE DE FÉRIAS ===
  
  // Listar registros de férias
  app.get('/api/vacations', authenticate, async (req: Request & {user?: any}, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Não autenticado' });
      }
      
      const organizationId = req.query.organizationId ? parseInt(req.query.organizationId as string) : req.user.organizationId;
      
      if (!organizationId && req.user.role !== 'admin') {
        return res.status(400).json({ success: false, message: 'ID da organização é obrigatório' });
      }
      
      const employeeId = req.query.employeeId ? parseInt(req.query.employeeId as string) : null;
      const status = req.query.status as string;
      
      let query = db.select().from(vacations);
      
      if (organizationId) {
        query = query.where(eq(vacations.organizationId, organizationId));
      }
      
      if (employeeId !== null) {
        query = query.where(eq(vacations.employeeId, employeeId));
      }
      
      if (status) {
        query = query.where(eq(vacations.status, status as any));
      }
      
      // Ordenar por data de início mais recente
      const vacationRecords = await query.orderBy(desc(vacations.startDate));
      
      res.json({ success: true, vacations: vacationRecords });
    } catch (error) {
      console.error('Erro ao buscar férias:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar férias',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Criar registro de férias
  app.post('/api/vacations', authenticate, async (req: Request & {user?: any}, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Não autenticado' });
      }
      
      // Validar os dados recebidos
      const validatedData = insertVacationSchema.parse(req.body);
      
      // Inserir registro de férias
      const [vacation] = await db.insert(vacations).values(validatedData).returning();
      
      res.status(201).json({ success: true, vacation, message: 'Registro de férias criado com sucesso' });
    } catch (error) {
      console.error('Erro ao criar registro de férias:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: 'Dados inválidos',
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao criar registro de férias',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Aprovar ou rejeitar férias
  app.put('/api/vacations/:id/status', authenticate, async (req: Request & {user?: any}, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Não autenticado' });
      }
      
      const id = parseInt(req.params.id);
      const { status, notes } = req.body;
      
      if (!status || !['aprovada', 'negada', 'cancelada'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Status inválido' });
      }
      
      // Verificar se o registro de férias existe
      const existingVacation = await db.query.vacations.findFirst({
        where: eq(vacations.id, id),
      });
      
      if (!existingVacation) {
        return res.status(404).json({ success: false, message: 'Registro de férias não encontrado' });
      }
      
      // Verificar se o usuário tem permissão para atualizar este registro
      if (req.user.role !== 'admin' && existingVacation.organizationId !== req.user.organizationId) {
        return res.status(403).json({ success: false, message: 'Sem permissão para atualizar este registro' });
      }
      
      // Atualizar registro de férias
      await db.update(vacations)
        .set({
          status: status as any,
          approvedBy: req.user.id,
          approvalDate: new Date(),
          notes: notes || existingVacation.notes,
          updatedAt: new Date(),
        })
        .where(eq(vacations.id, id));
      
      // Buscar o registro atualizado
      const updatedVacation = await db.query.vacations.findFirst({
        where: eq(vacations.id, id),
      });
      
      res.json({ 
        success: true, 
        vacation: updatedVacation, 
        message: `Férias ${status === 'aprovada' ? 'aprovadas' : status === 'negada' ? 'negadas' : 'canceladas'} com sucesso` 
      });
    } catch (error) {
      console.error('Erro ao atualizar status das férias:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao atualizar status das férias',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // === RELATÓRIOS FINANCEIROS (DRE) ===
  
  // Listar relatórios financeiros
  app.get('/api/financial/reports', authenticate, async (req: Request & {user?: any}, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Não autenticado' });
      }
      
      const organizationId = req.query.organizationId ? parseInt(req.query.organizationId as string) : req.user.organizationId;
      
      if (!organizationId && req.user.role !== 'admin') {
        return res.status(400).json({ success: false, message: 'ID da organização é obrigatório' });
      }
      
      const type = req.query.type as string;
      const year = req.query.year ? parseInt(req.query.year as string) : null;
      const quarter = req.query.quarter ? parseInt(req.query.quarter as string) : null;
      
      let query = db.select().from(financialReports);
      
      if (organizationId) {
        query = query.where(eq(financialReports.organizationId, organizationId));
      }
      
      if (type) {
        query = query.where(eq(financialReports.type, type));
      }
      
      if (year !== null) {
        query = query.where(eq(financialReports.year, year));
      }
      
      if (quarter !== null) {
        query = query.where(eq(financialReports.quarter, quarter));
      }
      
      // Ordenar por data de geração mais recente
      const reports = await query.orderBy(desc(financialReports.generatedAt));
      
      res.json({ success: true, reports });
    } catch (error) {
      console.error('Erro ao buscar relatórios financeiros:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar relatórios financeiros',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Criar relatório financeiro
  app.post('/api/financial/reports', authenticate, async (req: Request & {user?: any}, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Não autenticado' });
      }
      
      // Validar os dados recebidos
      const validatedData = insertFinancialReportSchema.parse(req.body);
      
      // Inserir relatório financeiro
      const [report] = await db.insert(financialReports).values(validatedData).returning();
      
      res.status(201).json({ success: true, report, message: 'Relatório financeiro criado com sucesso' });
    } catch (error) {
      console.error('Erro ao criar relatório financeiro:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: 'Dados inválidos',
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao criar relatório financeiro',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Rotas Administrativas
  app.use('/api/admin', adminRouter);
  
  // Rotas para gestão de planos e solicitações
  app.use('/api', planChangesRouter);
  
  // Rotas para gestão de módulos e relações com planos
  app.use('/api', modulesRouter);
  
  // Rotas de links de pagamento
  app.use('/api/payment-links', paymentLinksRouter);
  
  // Rotas de pagamento por email
  app.use('/api/payment-email', paymentEmailRouter);
  
  // Rotas do módulo de dispensário
  app.use('/api/organization/dispensario', dispensarioRouter);
  
  // Rotas do portal médico
  app.use(medicalPortalRouter);
  
  // Rotas de autenticação de pacientes
  app.use('/api', patientAuthRouter);
  
  // Rotas de AI Chat
  app.use('/api/ai', aiChatRouter);
  
  // Register doctor, pharmacist, patient prescription, and document routes
  const doctorRoutes = await registerDoctorRoutes(app);
  const pharmacistRoutes = await registerPharmacistRoutes(app);
  const patientPrescriptionRoutes = await registerPatientPrescriptionRoutes(app);
  const documentRoutes = await registerDocumentRoutes(app);
  
  // Register production routes (seed to counter traceability)
  const productionRoutes = await registerProductionRoutes(app);
  app.use('/api/production', productionRoutes);
  
  // Registrar rotas de afiliação de médicos
  registerDoctorAffiliationRoutes(app);
  
  // Registrar rotas de laboratório
  await registerLaboratoryRoutes(app);
  
  // Registrar rotas de HPLC (High Performance Liquid Chromatography)
  await registerHplcRoutes(app);
  
  // Registrar rotas de validação de métodos HPLC
  await registerHplcValidationRoutes(app);
  
  // Registrar rotas de treinamentos HPLC
  await registerHplcTrainingRoutes(app);
  
  // Registrar rotas de treinamentos HPLC alternativas
  await registerTrainerRoutes(app);
  
  // Registrar rotas de equipamentos de laboratório
  console.log("Registrando rotas de equipamentos de laboratório");
  app.use('/api/laboratory', equipmentRoutes);
  console.log("Rotas de equipamentos registradas");
  
  // Registrar rotas do módulo financeiro
  console.log("Registrando rotas do módulo financeiro");
  registerFinanceiroRoutes(app);
  
  // Registrar rotas do módulo de planos
  registerPlanRoutes(app);
  console.log("Rotas do módulo financeiro registradas");
  
  // Registrar rotas do portal de transparência
  console.log("Registrando rotas do portal de transparência");
  registerTransparenciaRoutes(app);
  console.log("Rotas do portal de transparência registradas");
  
  // Registrar rotas do módulo de expedição
  registerExpedicaoRoutes(app);
  console.log("Rotas do módulo de expedição registradas com sucesso");
  
  // Rota de teste direta para contornar o middleware do Vite
  app.get('/api/laboratory-test', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      message: "API de equipamentos de laboratório funcionando!",
      timestamp: new Date(),
      success: true
    });
  });
  
  console.log("Doctor routes registered:", doctorRoutes);
  console.log("Pharmacist routes registered:", pharmacistRoutes);
  console.log("Patient prescription routes registered:", patientPrescriptionRoutes);
  console.log("Document routes registered:", documentRoutes);
  console.log("Production routes registered:", productionRoutes);
  console.log("Doctor affiliation routes registered");
  
  // Rotas de integrações
  app.use("/api/integrations", integrationsRouter);
  
  // Rotas de grupos de usuários e permissões
  // User group routes are registered directly via registerUserGroupRoutes(app);
  
  // Middleware para interceptar TODAS as requisições API antes do Vite
  app.use((req, res, next) => {
    const isApiRoute = req.path.startsWith('/api/');
    const isCarteirinhaRoute = req.path.includes('/carteirinha/') || req.path.startsWith('/api/carteirinha');
    
    // Se for uma rota de API, definir o Content-Type para JSON
    if (isApiRoute || isCarteirinhaRoute) {
      res.setHeader('Content-Type', 'application/json');
      
      // Interceptar requisições não autenticadas para rotas protegidas
      if ((!req.session || !req.session.user) && 
          (isCarteirinhaRoute || req.path.includes('/partners'))) {
        return res.status(401).json({
          message: "Não autenticado",
          error: "Unauthorized",
          authenticated: false
        });
      }
    }
    
    next();
  });
  
  // Rotas do módulo Social (para associações)
  app.use("/api", socialRoutes);
  console.log("Rotas do módulo Social registradas com sucesso");
  
  const httpServer = createServer(app);

  // =========================================================
  // SISTEMA DE NOTIFICAÇÕES
  // =========================================================
  
  // Rota para buscar notificações do usuário
  app.get("/api/notifications", authenticate, async (req, res) => {
    try {
      const notifications = await notificationService.getUserNotifications(req.session.user.id);
      res.json(notifications);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
      res.status(500).json({ message: "Falha ao buscar notificações" });
    }
  });

  // Rota para buscar estatísticas de notificações
  app.get("/api/notifications/stats", authenticate, async (req, res) => {
    try {
      const stats = await notificationService.getNotificationStats(req.session.user.id);
      res.json(stats);
    } catch (error) {
      console.error("Erro ao buscar estatísticas de notificações:", error);
      res.status(500).json({ message: "Falha ao buscar estatísticas de notificações" });
    }
  });

  // Rota para marcar uma notificação como lida
  app.patch("/api/notifications/:id/read", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await notificationService.markNotificationAsRead(parseInt(id));
      res.json(notification);
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
      res.status(500).json({ message: "Falha ao marcar notificação como lida" });
    }
  });
  
  // Rota para marcar todas as notificações como lidas
  app.post("/api/notifications/mark-all-read", authenticate, async (req, res) => {
    try {
      const count = await notificationService.markAllNotificationsAsRead(req.session.user.id);
      res.json({ count, message: `${count} notificações marcadas como lidas` });
    } catch (error) {
      console.error("Erro ao marcar todas notificações como lidas:", error);
      res.status(500).json({ message: "Falha ao marcar notificações como lidas" });
    }
  });

  // Rota para criar uma notificação (apenas admin)
  app.post("/api/notifications", authenticate, async (req, res) => {
    try {
      // Verificar se o usuário é administrador
      if (req.session.user.role !== 'admin') {
        return res.status(403).json({ message: "Apenas administradores podem criar notificações" });
      }
      
      // Validar o corpo da requisição
      const validatedData = insertNotificationSchema.parse(req.body);
      
      // Criar a notificação
      const notification = await notificationService.createNotification(validatedData);
      res.status(201).json(notification);
    } catch (error) {
      console.error("Erro ao criar notificação:", error);
      res.status(500).json({ message: "Falha ao criar notificação" });
    }
  });

  // Rota para buscar estatísticas para o dashboard de suporte
  app.get("/api/support/stats", authenticate, async (req, res) => {
    try {
      // Verificar se o usuário é administrador
      if (req.session.user.role !== 'admin') {
        return res.status(403).json({ message: "Apenas administradores podem acessar estas estatísticas" });
      }
      
      const { timeRange = '7d', organization = 'all' } = req.query;
      
      // Calcular datas para o filtro
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
      
      // Construir a query base
      let ticketsQuery = db.select()
        .from(supportTickets)
        .where(gte(supportTickets.createdAt, startDate));
      
      // Filtrar por organização se especificado
      if (organization !== 'all') {
        ticketsQuery = ticketsQuery.where(eq(supportTickets.organizationId, parseInt(organization as string)));
      }
      
      // Executar a query
      const tickets = await ticketsQuery;
      
      // Calcular estatísticas
      const total = tickets.length;
      const open = tickets.filter(t => ['novo', 'em_analise', 'em_desenvolvimento', 'aguardando_resposta'].includes(t.status)).length;
      const resolved = tickets.filter(t => t.status === 'resolvido').length;
      const inProgress = tickets.filter(t => ['em_analise', 'em_desenvolvimento'].includes(t.status)).length;
      const critical = tickets.filter(t => t.priority === 'critica').length;
      
      // Calcular tempo médio de resposta e resolução (em horas)
      // Aqui estamos simulando esses valores, em uma implementação completa
      // seriam calculados com base nas datas reais de primeira resposta e resolução
      const responseTime = 4.2; // Média de tempo até primeira resposta
      const resolutionTime = 36.5; // Média de tempo até resolução
      
      // Contagem por categoria
      const byCategoryCount: Record<string, number> = {};
      tickets.forEach(ticket => {
        byCategoryCount[ticket.category] = (byCategoryCount[ticket.category] || 0) + 1;
      });
      
      // Contagem por status
      const byStatusCount: Record<string, number> = {};
      tickets.forEach(ticket => {
        byStatusCount[ticket.status] = (byStatusCount[ticket.status] || 0) + 1;
      });
      
      // Contagem por organização
      const byOrganizationCount: Record<string, number> = {};
      tickets.forEach(ticket => {
        byOrganizationCount[ticket.organizationId.toString()] = (byOrganizationCount[ticket.organizationId.toString()] || 0) + 1;
      });
      
      // Obter dados de atividade recente
      const recentActivity = tickets
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 10);
      
      // Retornar as estatísticas compiladas
      res.json({
        total,
        open,
        resolved,
        inProgress,
        critical,
        responseTime,
        resolutionTime,
        byCategoryCount,
        byStatusCount,
        byOrganizationCount,
        recentActivity
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas de suporte:", error);
      res.status(500).json({ message: "Falha ao buscar estatísticas de suporte" });
    }
  });

  // =========================================================
  // SISTEMA DE TICKETS DE SUPORTE
  // =========================================================
  
  // Rota para listar todos os tickets (apenas admin)
  app.get("/api/tickets", authenticate, async (req, res) => {
    try {
      // Verificar se o usuário é administrador
      if (req.session.user.role !== 'admin') {
        return res.status(403).json({ message: "Acesso permitido apenas para administradores" });
      }
      
      // Buscar todos os tickets
      const tickets = await db.select({
        id: supportTickets.id,
        title: supportTickets.title,
        status: supportTickets.status,
        priority: supportTickets.priority,
        category: supportTickets.category,
        organizationId: supportTickets.organizationId,
        organization: organizations.name,
        createdAt: supportTickets.createdAt,
        updatedAt: supportTickets.updatedAt
      })
      .from(supportTickets)
      .leftJoin(organizations, eq(supportTickets.organizationId, organizations.id))
      .orderBy(desc(supportTickets.createdAt));
      
      res.json(tickets);
    } catch (error) {
      console.error("Erro ao buscar tickets:", error);
      res.status(500).json({ message: "Falha ao buscar tickets" });
    }
  });
  
  // Rota para listar tickets de uma organização específica
  app.get("/api/organizations/:orgId/tickets", authenticate, async (req, res) => {
    try {
      const { orgId } = req.params;
      
      // Verificar se o usuário tem permissão para acessar os tickets desta organização
      if (req.session.user.role !== 'admin' && 
          (req.session.user.role !== 'org_admin' || req.session.user.organizationId !== parseInt(orgId))) {
        return res.status(403).json({ message: "Sem permissão para acessar tickets desta organização" });
      }
      
      // Buscar tickets da organização
      const tickets = await db.select()
        .from(supportTickets)
        .where(eq(supportTickets.organizationId, parseInt(orgId)))
        .orderBy(desc(supportTickets.createdAt));
      
      res.json(tickets);
    } catch (error) {
      console.error("Erro ao buscar tickets da organização:", error);
      res.status(500).json({ message: "Falha ao buscar tickets da organização" });
    }
  });
  
  // Rota para obter detalhes de um ticket específico com comentários
  app.get("/api/tickets/:id", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Buscar o ticket
      const [ticket] = await db.select()
        .from(supportTickets)
        .where(eq(supportTickets.id, parseInt(id)));
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket não encontrado" });
      }
      
      // Verificar se o usuário tem permissão para ver este ticket
      if (req.session.user.role !== 'admin' && 
          (req.session.user.role !== 'org_admin' || req.session.user.organizationId !== ticket.organizationId)) {
        return res.status(403).json({ message: "Sem permissão para acessar este ticket" });
      }
      
      // Buscar comentários
      const comments = await db.select({
        id: ticketComments.id,
        content: ticketComments.content,
        isInternal: ticketComments.isInternal,
        createdAt: ticketComments.createdAt,
        userId: ticketComments.userId,
        userName: users.name
      })
      .from(ticketComments)
      .leftJoin(users, eq(ticketComments.userId, users.id))
      .where(eq(ticketComments.ticketId, parseInt(id)))
      .orderBy(asc(ticketComments.createdAt));
      
      // Filtrar comentários internos se não for admin
      const filteredComments = req.session.user.role === 'admin' 
        ? comments 
        : comments.filter(comment => !comment.isInternal);
      
      // Buscar apenas anexos vinculados diretamente ao ticket (não a comentários)
      const attachments = await db.select({
        id: ticketAttachments.id,
        ticketId: ticketAttachments.ticketId,
        fileName: ticketAttachments.fileName,
        fileType: ticketAttachments.fileType,
        filePath: ticketAttachments.filePath,
        fileSize: ticketAttachments.fileSize,
        uploadedById: ticketAttachments.uploadedById,
        createdAt: ticketAttachments.createdAt
      })
        .from(ticketAttachments)
        .where(eq(ticketAttachments.ticketId, parseInt(id)));
      
      // Retornar ticket com comentários e anexos
      res.json({
        ...ticket,
        comments: filteredComments,
        attachments
      });
    } catch (error) {
      console.error("Erro ao buscar detalhes do ticket:", error);
      res.status(500).json({ message: "Falha ao buscar detalhes do ticket" });
    }
  });
  
  // Rota para criar um novo ticket
  app.post("/api/tickets", authenticate, documentUpload.array('attachments'), async (req, res) => {
    try {
      // Obter e validar dados do ticket
      const ticketData = insertSupportTicketSchema.parse({
        ...req.body,
        createdById: req.session.user.id,
        organizationId: req.body.organizationId || req.session.user.organizationId
      });
      
      // Verificar se o usuário tem permissão para criar ticket para esta organização
      if (req.session.user.role !== 'admin' && 
          req.session.user.organizationId !== ticketData.organizationId) {
        return res.status(403).json({ message: "Sem permissão para criar ticket para esta organização" });
      }
      
      // Criar ticket
      const [ticket] = await db.insert(supportTickets)
        .values({
          ...ticketData,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      // Se temos arquivos anexados
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const attachmentPromises = req.files.map(async (file: any) => {
          return db.insert(ticketAttachments)
            .values({
              ticketId: ticket.id,
              fileName: file.originalname,
              fileType: file.mimetype,
              filePath: file.path,
              fileSize: file.size,
              uploadedById: req.session.user.id,
              createdAt: new Date()
            });
        });
        
        await Promise.all(attachmentPromises);
      }
      
      // Enviar notificação por e-mail para os administradores
      if (req.session.user.role !== 'admin') {
        try {
          const admins = await db.select()
            .from(users)
            .where(eq(users.role, 'admin'));
          
          for (const admin of admins) {
            if (admin.email) {
              await sendTemplateEmail(
                admin.email,
                "Novo Ticket de Suporte Criado",
                "ticket_creation" as EmailTemplate,
                {
                  ticketId: ticket.id,
                  ticketTitle: ticket.title,
                  priority: ticket.priority,
                  organizationName: req.body.organizationName || "Organização",
                  description: ticket.description
                }
              );
            }
          }
        } catch (emailError) {
          console.error("Erro ao enviar notificação de ticket:", emailError);
          // Não interromper o fluxo se o e-mail falhar
        }
      }
      
      res.status(201).json(ticket);
    } catch (error) {
      console.error("Erro ao criar ticket:", error);
      res.status(500).json({ message: "Falha ao criar ticket" });
    }
  });
  
  // Rota para adicionar comentário a um ticket
  app.post("/api/tickets/:id/comments", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Buscar o ticket
      const [ticket] = await db.select()
        .from(supportTickets)
        .where(eq(supportTickets.id, parseInt(id)));
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket não encontrado" });
      }
      
      // Verificar se o usuário tem permissão para comentar neste ticket
      if (req.session.user.role !== 'admin' && 
          (req.session.user.role !== 'org_admin' || req.session.user.organizationId !== ticket.organizationId)) {
        return res.status(403).json({ message: "Sem permissão para comentar neste ticket" });
      }
      
      // Validar dados do comentário
      const commentData = {
        ticketId: parseInt(id),
        userId: req.session.user.id,
        content: req.body.content,
        // Apenas admins podem criar comentários internos
        isInternal: req.session.user.role === 'admin' ? !!req.body.isInternal : false
      };
      
      // Criar comentário
      const [comment] = await db.insert(ticketComments)
        .values({
          ...commentData,
          createdAt: new Date()
        })
        .returning();
      
      // Atualizar data de atualização do ticket
      await db.update(supportTickets)
        .set({
          updatedAt: new Date()
        })
        .where(eq(supportTickets.id, parseInt(id)));
      
      // Notificar sobre o novo comentário
      if (commentData.isInternal === false) {
        try {
          // Se é um comentário do admin, notificar o org_admin
          if (req.session.user.role === 'admin') {
            const orgAdmins = await db.select()
              .from(users)
              .where(and(
                eq(users.organizationId, ticket.organizationId),
                eq(users.role, 'org_admin')
              ));
            
            for (const orgAdmin of orgAdmins) {
              if (orgAdmin.email) {
                await sendTemplateEmail(
                  orgAdmin.email,
                  "Resposta em seu Ticket de Suporte",
                  "ticket_update" as EmailTemplate,
                  {
                    ticketId: ticket.id,
                    ticketTitle: ticket.title,
                    commentContent: commentData.content,
                    commentAuthor: req.session.user.name
                  }
                );
              }
            }
          } 
          // Se é um comentário do org_admin, notificar os admins
          else if (req.session.user.role === 'org_admin') {
            const admins = await db.select()
              .from(users)
              .where(eq(users.role, 'admin'));
            
            for (const admin of admins) {
              if (admin.email) {
                await sendTemplateEmail(
                  admin.email,
                  "Novo Comentário em Ticket de Suporte",
                  "ticket_update" as EmailTemplate,
                  {
                    ticketId: ticket.id,
                    ticketTitle: ticket.title,
                    commentContent: commentData.content,
                    commentAuthor: req.session.user.name,
                    organizationName: req.body.organizationName || "Organização"
                  }
                );
              }
            }
          }
        } catch (emailError) {
          console.error("Erro ao enviar notificação de comentário:", emailError);
          // Não interromper o fluxo se o e-mail falhar
        }
      }
      
      res.status(201).json(comment);
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      res.status(500).json({ message: "Falha ao adicionar comentário" });
    }
  });
  
  // Rota para atualizar status de um ticket
  app.patch("/api/tickets/:id/status", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Validar o novo status
      if (!status || !['novo', 'em_analise', 'em_desenvolvimento', 'aguardando_resposta', 'resolvido', 'fechado', 'cancelado'].includes(status)) {
        return res.status(400).json({ message: "Status inválido" });
      }
      
      // Buscar o ticket
      const [ticket] = await db.select()
        .from(supportTickets)
        .where(eq(supportTickets.id, parseInt(id)));
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket não encontrado" });
      }
      
      // Apenas admins podem atualizar o status
      if (req.session.user.role !== 'admin') {
        return res.status(403).json({ message: "Apenas administradores podem atualizar o status do ticket" });
      }
      
      // Atualizar campos com base no novo status
      const updateData: any = {
        status,
        updatedAt: new Date()
      };
      
      // Se status for resolvido, atualizar o campo resolvedAt
      if (status === 'resolvido') {
        updateData.resolvedAt = new Date();
      }
      
      // Se status for fechado, atualizar o campo closedAt
      if (status === 'fechado') {
        updateData.closedAt = new Date();
      }
      
      // Atualizar ticket
      const [updatedTicket] = await db.update(supportTickets)
        .set(updateData)
        .where(eq(supportTickets.id, parseInt(id)))
        .returning();
      
      // Adicionar um comentário automático sobre a mudança de status
      await db.insert(ticketComments)
        .values({
          ticketId: parseInt(id),
          userId: req.session.user.id,
          content: `Status alterado para: ${status}`,
          isInternal: false,
          createdAt: new Date()
        });
      
      // Notificar administradores da organização sobre a mudança de status
      try {
        const orgAdmins = await db.select()
          .from(users)
          .where(and(
            eq(users.organizationId, ticket.organizationId),
            eq(users.role, 'org_admin')
          ));
        
        for (const orgAdmin of orgAdmins) {
          if (orgAdmin.email) {
            await sendTemplateEmail(
              orgAdmin.email,
              "Atualização de Status em Ticket de Suporte",
              "ticket_status_update" as EmailTemplate,
              {
                ticketId: ticket.id,
                ticketTitle: ticket.title,
                oldStatus: ticket.status,
                newStatus: status
              }
            );
          }
        }
      } catch (emailError) {
        console.error("Erro ao enviar notificação de mudança de status:", emailError);
        // Não interromper o fluxo se o e-mail falhar
      }
      
      res.json(updatedTicket);
    } catch (error) {
      console.error("Erro ao atualizar status do ticket:", error);
      res.status(500).json({ message: "Falha ao atualizar status do ticket" });
    }
  });
  
  // Rota para atualizar prioridade de um ticket
  app.patch("/api/tickets/:id/priority", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      const { priority } = req.body;
      
      // Validar a nova prioridade
      if (!priority || !['baixa', 'media', 'alta', 'critica'].includes(priority)) {
        return res.status(400).json({ message: "Prioridade inválida" });
      }
      
      // Buscar o ticket
      const [ticket] = await db.select()
        .from(supportTickets)
        .where(eq(supportTickets.id, parseInt(id)));
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket não encontrado" });
      }
      
      // Apenas admins podem atualizar a prioridade
      if (req.session.user.role !== 'admin') {
        return res.status(403).json({ message: "Apenas administradores podem atualizar a prioridade do ticket" });
      }
      
      // Atualizar ticket
      const [updatedTicket] = await db.update(supportTickets)
        .set({
          priority,
          updatedAt: new Date()
        })
        .where(eq(supportTickets.id, parseInt(id)))
        .returning();
      
      // Adicionar um comentário automático sobre a mudança de prioridade
      await db.insert(ticketComments)
        .values({
          ticketId: parseInt(id),
          userId: req.session.user.id,
          content: `Prioridade alterada para: ${priority}`,
          isInternal: true,
          createdAt: new Date()
        });
      
      res.json(updatedTicket);
    } catch (error) {
      console.error("Erro ao atualizar prioridade do ticket:", error);
      res.status(500).json({ message: "Falha ao atualizar prioridade do ticket" });
    }
  });
  
  // Rota para atribuir ticket a um administrador
  app.patch("/api/tickets/:id/assign", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      const { assignedToId } = req.body;
      
      // Buscar o ticket
      const [ticket] = await db.select()
        .from(supportTickets)
        .where(eq(supportTickets.id, parseInt(id)));
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket não encontrado" });
      }
      
      // Apenas admins podem atribuir tickets
      if (req.session.user.role !== 'admin') {
        return res.status(403).json({ message: "Apenas administradores podem atribuir tickets" });
      }
      
      // Verificar se o usuário atribuído existe e é um administrador
      if (assignedToId) {
        const [assignedUser] = await db.select()
          .from(users)
          .where(and(
            eq(users.id, assignedToId),
            eq(users.role, 'admin')
          ));
        
        if (!assignedUser) {
          return res.status(400).json({ message: "Usuário atribuído inválido" });
        }
      }
      
      // Atualizar ticket
      const [updatedTicket] = await db.update(supportTickets)
        .set({
          assignedToId: assignedToId || null,
          updatedAt: new Date()
        })
        .where(eq(supportTickets.id, parseInt(id)))
        .returning();
      
      // Adicionar um comentário automático sobre a atribuição
      await db.insert(ticketComments)
        .values({
          ticketId: parseInt(id),
          userId: req.session.user.id,
          content: assignedToId 
            ? `Ticket atribuído ao administrador ID: ${assignedToId}` 
            : "Ticket removido de atribuição",
          isInternal: true,
          createdAt: new Date()
        });
      
      res.json(updatedTicket);
    } catch (error) {
      console.error("Erro ao atribuir ticket:", error);
      res.status(500).json({ message: "Falha ao atribuir ticket" });
    }
  });

  // API de sugestões baseadas em IA para tickets
  app.get("/api/tickets/:id/suggestions", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar se o ticket existe
      const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, parseInt(id)));
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket não encontrado" });
      }
      
      // Gerar sugestões de IA com detalhes relacionados
      const suggestions = await getTicketSuggestionsWithDetails(parseInt(id));
      
      res.json({
        ticketId: parseInt(id),
        suggestions
      });
    } catch (error) {
      console.error("Erro ao gerar sugestões de IA:", error);
      res.status(500).json({ message: "Falha ao gerar sugestões para o ticket" });
    }
  });

  // Rotas de perfil de usuário
  
  // Rota para obter perfil do usuário
  app.get("/api/profile", authenticate, async (req: Request, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      
      const userId = req.session.user.id;
      
      // Buscar dados atualizados do usuário
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // Remover senha e outros dados sensíveis
      const { password, ...userInfo } = user;
      
      res.json(userInfo);
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
      res.status(500).json({ message: "Falha ao buscar dados do perfil" });
    }
  });
  
  // Rota para atualizar dados do perfil do usuário
  app.put("/api/profile", authenticate, async (req: Request, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      
      const userId = req.session.user.id;
      const userRole = req.session.user.role;
      
      // Validar os dados recebidos
      const profileData = req.body;
      
      // Remove campos que não devem ser atualizados pelo usuário
      delete profileData.id;
      delete profileData.password;
      delete profileData.role;
      delete profileData.username;
      delete profileData.organizationId;
      
      // Verificar se o usuário está tentando alterar o e-mail e não tem permissão
      if (
        profileData.email && 
        profileData.email !== req.session.user.email && 
        userRole !== 'admin' && 
        userRole !== 'org_admin'
      ) {
        // Remove o e-mail do objeto de atualização se o usuário não tem permissão
        delete profileData.email;
        console.log(`Usuário ${userId} tentou modificar seu e-mail, mas não tem permissão.`);
      }
      
      // Atualizar o perfil
      const updatedUser = await storage.updateUserProfile(userId, profileData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // Remover senha e outros dados sensíveis
      const { password, ...userInfo } = updatedUser;
      
      // Atualizar os dados na sessão
      req.session.user = { ...req.session.user, ...userInfo };
      
      res.json(userInfo);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      res.status(500).json({ message: "Falha ao atualizar perfil" });
    }
  });
  
  // Rota para alterar senha
  app.post("/api/profile/change-password", authenticate, async (req: Request, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      
      const userId = req.session.user.id;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Senha atual e nova senha são obrigatórias" });
      }
      
      // Buscar usuário para verificar a senha atual
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // Verificar se a senha atual está correta (em produção, usar hash)
      if (user.password !== currentPassword) {
        return res.status(400).json({ message: "Senha atual incorreta" });
      }
      
      // Atualizar a senha
      const success = await storage.updateUserPassword(userId, newPassword);
      
      if (!success) {
        return res.status(500).json({ message: "Falha ao atualizar senha" });
      }
      
      res.json({ message: "Senha alterada com sucesso" });
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      res.status(500).json({ message: "Falha ao alterar senha" });
    }
  });
  
  // Rota para upload de foto de perfil
  app.post("/api/profile/photo", authenticate, profilePhotoUpload.single('photo'), async (req: Request, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      
      const userId = req.session.user.id;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "Nenhuma foto enviada" });
      }
      
      // Atualizar o caminho da foto no banco de dados
      const updatedUser = await storage.updateUserPhoto(userId, file.path);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // Remover senha e outros dados sensíveis
      const { password, ...userInfo } = updatedUser;
      
      // Atualizar os dados na sessão
      req.session.user = { ...req.session.user, ...userInfo };
      
      res.json({ 
        message: "Foto de perfil atualizada com sucesso",
        profilePhoto: file.path,
        user: userInfo
      });
    } catch (error) {
      console.error("Erro ao fazer upload de foto:", error);
      res.status(500).json({ message: "Falha ao fazer upload de foto" });
    }
  });
  
  // Rota para a API da Zoop
  
  // Register user groups and invitations routes
  registerUserGroupRoutes(app);
  registerUserInvitationsRoutes(app);
  
  // Registrar rotas de pagamento por email
  // Não adicionar paymentEmailRouter aqui - já foi adicionado acima
  
  // A rota para solicitações de mudança de plano já está implementada acima
  // Removida duplicação da rota plan-change-requests
  
  // REMOVER - Rota duplicada (já existe na linha 1492) - comentada para evitar conflitos
  /*
  app.put("/api/plan-change-requests/:orgId", authenticate, async (req, res) => {
    try {
      if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
        return res.status(401).json({ message: "Não autorizado. Apenas administradores podem aprovar solicitações." });
      }
      
      const { orgId } = req.params;
      const { action } = req.body; // 'approve' ou 'reject'
      
      if (!action || (action !== 'approve' && action !== 'reject')) {
        return res.status(400).json({ message: "Ação inválida. Use 'approve' ou 'reject'." });
      }
      
      // Buscar a organização
      const [organization] = await db.select().from(organizations).where(eq(organizations.id, parseInt(orgId, 10)));
      
      if (!organization) {
        return res.status(404).json({ message: "Organização não encontrada" });
      }
      
      if (organization.status !== 'pending_plan_change') {
        return res.status(400).json({ message: "Esta organização não possui uma solicitação de mudança de plano pendente." });
      }
      
      if (action === 'approve') {
        // Aprovar a mudança de plano
        await db.update(organizations)
          .set({
            planId: organization.requestedPlanId,
            status: 'active',
            requestedPlanId: null,
            updatedAt: new Date()
          })
          .where(eq(organizations.id, parseInt(orgId, 10)));
          
        // Buscar o plano para notificação
        const [plan] = await db.select().from(plans).where(eq(plans.id, organization.requestedPlanId || 0));
        
        // Criar notificação para o usuário
        await db.insert(notifications).values({
          organizationId: parseInt(orgId, 10),
          title: "Solicitação de mudança de plano aprovada",
          message: `Sua solicitação para mudar para o plano ${plan?.name || 'solicitado'} foi aprovada!`,
          type: "success",
          isRead: false,
          createdAt: new Date()
        });
        
        res.status(200).json({
          success: true,
          message: `Solicitação de mudança de plano da organização ${organization.name} foi aprovada com sucesso.`
        });
      } else {
        // Rejeitar a mudança de plano
        await db.update(organizations)
          .set({
            status: 'active',
            requestedPlanId: null,
            updatedAt: new Date()
          })
          .where(eq(organizations.id, parseInt(orgId, 10)));
          
        // Criar notificação para o usuário
        await db.insert(notifications).values({
          organizationId: parseInt(orgId, 10),
          title: "Solicitação de mudança de plano rejeitada",
          message: "Sua solicitação de mudança de plano foi rejeitada. Entre em contato com o suporte para mais informações.",
          type: "error",
          isRead: false,
          createdAt: new Date()
        });
        
        res.status(200).json({
          success: true,
          message: `Solicitação de mudança de plano da organização ${organization.name} foi rejeitada.`
        });
      }
    } catch (error) {
      console.error("Erro ao processar solicitação de mudança de plano:", error);
      res.status(500).json({ message: "Erro ao processar solicitação de mudança de plano." });
    }
  });
  
  // Fechar a rota PUT duplicada que foi comentada acima
  */
  
  // === RELATÓRIOS DE VENDAS ===

  // Rota para obter dados dos últimos 12 meses de vendas
  app.get('/api/reports/sales/monthly', authenticate, async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ success: false, message: 'Não autenticado' });
      }
      
      const organizationId = req.session.user.organizationId;
      const userRole = req.session.user.role;
      
      // Se for admin sem organização, pedir o id da organização
      if (!organizationId && userRole !== 'admin') {
        return res.status(400).json({ success: false, message: 'ID da organização é obrigatório' });
      }
      
      // Pegar os últimos 12 meses
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setMonth(startDate.getMonth() - 11); // Ir 11 meses para trás (para ter 12 meses no total)
      
      // Dados simulados para demonstração
      // Em uma implementação real, buscaríamos esses dados do banco
      const monthlyData = [
        { name: 'Abr', vendas: 42000, meta: 45000 },
        { name: 'Mai', vendas: 38900, meta: 45000 },
        { name: 'Jun', vendas: 42500, meta: 45000 },
        { name: 'Jul', vendas: 49800, meta: 45000 },
        { name: 'Ago', vendas: 52000, meta: 45000 },
        { name: 'Set', vendas: 47500, meta: 45000 },
        { name: 'Out', vendas: 58200, meta: 45000 },
        { name: 'Nov', vendas: 54800, meta: 45000 },
        { name: 'Dez', vendas: 62000, meta: 45000 },
        { name: 'Jan', vendas: 49000, meta: 45000 },
        { name: 'Fev', vendas: 38500, meta: 45000 },
        { name: 'Mar', vendas: 42300, meta: 45000 },
      ];
      
      res.json({ success: true, data: monthlyData });
    } catch (error) {
      console.error('Erro ao buscar dados de vendas mensais:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar dados de vendas mensais',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Rota para obter dados de vendas por canal
  app.get('/api/reports/sales/by-channel', authenticate, async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ success: false, message: 'Não autenticado' });
      }
      
      const organizationId = req.session.user.organizationId;
      const userRole = req.session.user.role;
      
      // Se for admin sem organização, pedir o id da organização
      if (!organizationId && userRole !== 'admin') {
        return res.status(400).json({ success: false, message: 'ID da organização é obrigatório' });
      }
      
      // Dados simulados para demonstração
      const channelData = [
        { name: 'Site Próprio', value: 55 },
        { name: 'Marketplace', value: 25 },
        { name: 'Loja Física', value: 15 },
        { name: 'Vendedores', value: 5 },
      ];
      
      res.json({ success: true, data: channelData });
    } catch (error) {
      console.error('Erro ao buscar dados de vendas por canal:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar dados de vendas por canal',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Rota para obter dados de vendas diárias
  app.get('/api/reports/sales/daily', authenticate, async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ success: false, message: 'Não autenticado' });
      }
      
      const organizationId = req.session.user.organizationId;
      const userRole = req.session.user.role;
      
      // Se for admin sem organização, pedir o id da organização
      if (!organizationId && userRole !== 'admin') {
        return res.status(400).json({ success: false, message: 'ID da organização é obrigatório' });
      }
      
      // Pegar a semana atual
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - 6); // 7 dias atrás
      
      // Dados simulados para demonstração
      const dailyData = [
        { name: '01/04', vendas: 4200 },
        { name: '02/04', vendas: 3800 },
        { name: '03/04', vendas: 4500 },
        { name: '04/04', vendas: 5200 },
        { name: '05/04', vendas: 4800 },
        { name: '06/04', vendas: 3200 },
        { name: '07/04', vendas: 3900 },
      ];
      
      res.json({ success: true, data: dailyData });
    } catch (error) {
      console.error('Erro ao buscar dados de vendas diárias:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar dados de vendas diárias',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Rota para obter produtos mais vendidos
  app.get('/api/reports/sales/top-products', authenticate, async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ success: false, message: 'Não autenticado' });
      }
      
      const organizationId = req.session.user.organizationId;
      const userRole = req.session.user.role;
      
      // Se for admin sem organização, pedir o id da organização
      if (!organizationId && userRole !== 'admin') {
        return res.status(400).json({ success: false, message: 'ID da organização é obrigatório' });
      }
      
      // Dados simulados para demonstração
      const topProducts = [
        { name: 'Óleo CBD 500mg', vendas: 245, porcentagem: 22, crescimento: 8.5 },
        { name: 'Creme Terapêutico', vendas: 187, porcentagem: 16, crescimento: 12.3 },
        { name: 'Cápsulas CBD 300mg', vendas: 165, porcentagem: 14, crescimento: -3.2 },
        { name: 'Spray Oral CBD', vendas: 132, porcentagem: 12, crescimento: 5.7 },
        { name: 'Kit Bem-estar', vendas: 98, porcentagem: 9, crescimento: 15.4 },
      ];
      
      res.json({ success: true, data: topProducts });
    } catch (error) {
      console.error('Erro ao buscar produtos mais vendidos:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar produtos mais vendidos',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Rota para obter métricas de vendas
  app.get('/api/reports/sales/metrics', authenticate, async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ success: false, message: 'Não autenticado' });
      }
      
      const organizationId = req.session.user.organizationId;
      const userRole = req.session.user.role;
      
      // Se for admin sem organização, pedir o id da organização
      if (!organizationId && userRole !== 'admin') {
        return res.status(400).json({ success: false, message: 'ID da organização é obrigatório' });
      }
      
      // Dados simulados para demonstração
      const metrics = [
        { id: 1, nome: 'Número de Pedidos', valor: 587, crescimento: 12.4, periodo: 'vs mês anterior' },
        { id: 2, nome: 'Valor Médio de Pedido', valor: 'R$ 243,50', crescimento: 5.2, periodo: 'vs mês anterior' },
        { id: 3, nome: 'Taxa de Conversão', valor: '4.2%', crescimento: -0.8, periodo: 'vs mês anterior' },
        { id: 4, nome: 'Clientes Novos', valor: 112, crescimento: 18.7, periodo: 'vs mês anterior' },
      ];
      
      res.json({ success: true, data: metrics });
    } catch (error) {
      console.error('Erro ao buscar métricas de vendas:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar métricas de vendas',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // ========= Rotas do Módulo Fiscal =========
  // Configurações fiscais
  app.get('/api/fiscal/config/:organizationId', authenticate, fiscalRoutes.getFiscalConfig);
  app.post('/api/fiscal/config/:organizationId', authenticate, fiscalRoutes.createFiscalConfig);
  app.put('/api/fiscal/config/:organizationId', authenticate, fiscalRoutes.updateFiscalConfig);
  
  // Documentos fiscais
  app.get('/api/fiscal/documents/:organizationId', authenticate, fiscalRoutes.getDocuments);
  app.get('/api/fiscal/documents/detail/:id', authenticate, fiscalRoutes.getDocumentById);
  app.post('/api/fiscal/documents', authenticate, fiscalRoutes.createDocument);
  app.put('/api/fiscal/documents/:id/cancel', authenticate, fiscalRoutes.cancelDocument);
  
  // Impressoras e operações
  app.post('/api/fiscal/printer/test', authenticate, fiscalRoutes.testPrinter);
  app.post('/api/fiscal/cash-drawer/:organizationId/open', authenticate, fiscalRoutes.openCashDrawer);
  app.post('/api/fiscal/reports/:organizationId/daily', authenticate, fiscalRoutes.printDailyReport);
  
  // ========= Rotas de Afiliação de Médicos =========
  registerDoctorAffiliationRoutes(app);
  
  // ========= Rotas do Portal de Laboratório =========
  registerLaboratoryRoutes(app);
  registerLaboratorySamplesRoutes(app);
  
  return server;
}