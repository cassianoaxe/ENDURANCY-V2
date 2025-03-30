import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { db } from "./db";
import { 
  organizations, organizationDocuments, users, plans, modules, modulePlans, organizationModules,
  // Imports para o módulo financeiro
  financialTransactions, financialCategories, employees, payroll, vacations, financialReports,
  insertFinancialTransactionSchema, insertFinancialCategorySchema, insertEmployeeSchema,
  insertPayrollSchema, insertVacationSchema, insertFinancialReportSchema 
} from "@shared/schema";
import { z } from "zod";
import { eq, and, sql, desc, asc, gte, lte } from "drizzle-orm";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { pool } from "./db";
import { initializePlans } from "./services/stripe";
import { sendTemplateEmail, EmailTemplate } from "./services/email";
import { 
  createPlanPaymentIntent, 
  createModulePaymentIntent, 
  processPlanPayment, 
  processModulePayment, 
  checkPaymentStatus 
} from "./services/payments";

// Extend express-session with custom user property
declare module 'express-session' {
  interface SessionData {
    user: {
      id: number;
      username: string;
      role: 'admin' | 'org_admin' | 'doctor' | 'patient';
      name: string;
      email: string;
      organizationId: number | null;
    };
  }
}

// Session store setup
const PostgresStore = pgSession(session);

// Authentication middleware
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads',
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  }),
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(
    session({
      store: new PostgresStore({
        pool,
        tableName: 'session', // Table to store sessions
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || 'super-secret-key', // Use a strong secret in production
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
      },
    })
  );
  
  // Initialize user table with an admin user if it doesn't exist
  const initializeAdmin = async () => {
    try {
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
    } catch (error) {
      console.error('Error initializing admin user:', error);
    }
  };
  
  // Initialize admin user
  initializeAdmin();
  
  // Initialize sample plans
  initializePlans();
  
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
  
  // Auth Routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password, userType, orgCode } = req.body;
      
      console.log("Login attempt:", { username, userType, hasOrgCode: !!orgCode });
      
      // Se temos um código de organização, verificar se é válido
      if (orgCode) {
        const orgsFound = await db.select().from(organizations).where(eq(organizations.orgCode, orgCode));
        
        // Se o código não foi encontrado ou a organização não está ativa, rejeitar o login
        if (orgsFound.length === 0 || orgsFound[0].status !== 'active') {
          console.log("Invalid organization code:", orgCode);
          return res.status(401).json({ message: "Invalid organization code" });
        }
        
        console.log("Valid organization code:", { code: orgCode, orgId: orgsFound[0].id });
        
        // Aqui poderia ser feita a conexão com o banco de dados específico da organização
        // Por enquanto, vamos buscar no banco de dados principal
        
        // Buscar usuário pelo nome de usuário e organizationId
        const usersFound = await db.select().from(users)
          .where(and(
            eq(users.username, username),
            eq(users.organizationId, orgsFound[0].id)
          ));
        
        if (usersFound.length === 0) {
          console.log("User not found in organization:", { username, orgId: orgsFound[0].id });
          return res.status(401).json({ message: "Invalid credentials" });
        }
        
        const user = usersFound[0];
        
        // Verificar a senha
        if (user.password !== password) {
          console.log("Invalid password for:", username);
          return res.status(401).json({ message: "Invalid credentials" });
        }
        
        // Remove password from user object before sending to client
        const { password: _, ...userWithoutPassword } = user;
        
        // Set user in session
        req.session.user = userWithoutPassword;
        
        console.log("Login successful for:", { username, role: user.role, orgId: orgsFound[0].id });
        res.json(userWithoutPassword);
        return;
      }
      
      // Login normal sem código de organização
      // Primeiro, buscar usuário pelo nome de usuário
      const usersFound = await db.select().from(users).where(eq(users.username, username));
      
      if (usersFound.length === 0) {
        console.log("User not found:", username);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Se temos um user type, verificar se o usuário tem a role correspondente
      const user = usersFound[0];
      
      if (userType && user.role !== userType && !(userType === 'admin' && username === 'admin')) {
        console.log("Role mismatch:", { requestedRole: userType, actualRole: user.role });
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Verificar a senha
      if (user.password !== password) { // In production, use proper password hashing
        console.log("Invalid password for:", username);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Remove password from user object before sending to client
      const { password: _, ...userWithoutPassword } = user;
      
      // Set user in session
      req.session.user = userWithoutPassword;
      
      console.log("Login successful for:", { username, role: user.role });
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/me", (req, res) => {
    if (req.session.user) {
      res.json(req.session.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
  
  // Protected Routes - Organizations
  app.get("/api/organizations", authenticate, async (_req, res) => {
    try {
      const organizationsList = await db.select().from(organizations);
      res.json(organizationsList);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      res.status(500).json({ message: "Failed to fetch organizations" });
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

  app.post("/api/organizations", upload.single('document'), async (req, res) => {
    try {
      const organizationData = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "Document file is required" });
      }

      // Create organization
      const [organization] = await db.insert(organizations)
        .values({
          ...organizationData,
          status: 'pending',
          createdAt: new Date()
        })
        .returning();

      // Store document information
      await db.insert(organizationDocuments)
        .values({
          organizationId: organization.id,
          documentType: organizationData.type === 'Empresa' ? 'contrato_social' : 'estatuto',
          documentUrl: file.path,
        });

      // Enviar e-mail de confirmação de registro
      try {
        await sendTemplateEmail(
          organizationData.email,
          "Registro de Organização Recebido - Endurancy",
          "organization_registration",
          {
            organizationName: organizationData.name,
            adminName: organizationData.adminName || "Administrador",
          }
        );
        console.log(`Confirmation email sent to ${organizationData.email}`);
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
        // Não interromper o fluxo se o e-mail falhar
      }

      res.status(201).json(organization);
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
          // E-mail de aprovação
          const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
          const loginUrl = `${baseUrl}/login?org=${orgCode}`;
          
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
  app.get("/api/plans", async (_req, res) => {
    try {
      const plansList = await db.select().from(plans);
      res.json(plansList);
    } catch (error) {
      console.error("Error fetching plans:", error);
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });
  
  // Payment Routes
  app.post("/api/payments/create-intent", async (req, res) => {
    try {
      const { planId } = req.body;
      
      if (!planId) {
        return res.status(400).json({ message: "Plan ID is required" });
      }
      
      const clientSecret = await createPlanPaymentIntent(planId);
      res.json({ clientSecret });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });
  
  app.post("/api/payments/confirm", async (req, res) => {
    try {
      const { paymentIntentId, organizationId } = req.body;
      
      if (!paymentIntentId || !organizationId) {
        return res.status(400).json({ message: "Payment intent ID and organization ID are required" });
      }
      
      // Verify payment was successful
      const paymentIntent = await checkPaymentStatus(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        // Buscar organização antes de atualizar
        const [organization] = await db.select()
          .from(organizations)
          .where(eq(organizations.id, organizationId));
          
        if (!organization) {
          return res.status(404).json({ message: "Organization not found" });
        }
        
        // Update organization status to active
        const [updatedOrg] = await db.update(organizations)
          .set({ status: 'active' })
          .where(eq(organizations.id, organizationId))
          .returning();
        
        // Enviar e-mail de confirmação de pagamento e ativação da conta
        try {
          if (organization.email) {
            const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
            const loginUrl = `${baseUrl}/login?org=${organization.orgCode}`;
            
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
          status: paymentIntent.status
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

  app.get("/api/module-plans", async (_req, res) => {
    try {
      const plansList = await db.select().from(modulePlans);
      res.json(plansList);
    } catch (error) {
      console.error("Error fetching module plans:", error);
      res.status(500).json({ message: "Failed to fetch module plans" });
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
  
  // Rota para buscar todos os módulos por organização com dados combinados
  app.get("/api/organization-modules/all", authenticate, async (req, res) => {
    try {
      const results = await db.execute(sql`
        SELECT 
          om.id, 
          om."organizationId", 
          o.name as "organizationName",
          om."moduleId",
          m.name as "moduleName",
          m.type as "moduleType",
          om."planId",
          mp.name as "planName",
          mp.price,
          mp.billing_cycle as "billingCycle",
          o.status,
          om.active,
          om."createdAt"
        FROM organization_modules om
        JOIN organizations o ON om."organizationId" = o.id
        JOIN modules m ON om."moduleId" = m.id
        JOIN module_plans mp ON om."planId" = mp.id
        ORDER BY o.name, m.name
      `);
      
      res.json(results.rows);
    } catch (error) {
      console.error("Error fetching organization modules:", error);
      res.status(500).json({ message: "Failed to fetch organization modules" });
    }
  });

  app.get("/api/organization-modules/:orgId", authenticate, async (req, res) => {
    try {
      const { orgId } = req.params;
      
      const organizationModulesList = await db.select()
        .from(organizationModules)
        .where(eq(organizationModules.organizationId, parseInt(orgId)));
      
      res.json(organizationModulesList);
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
      const { planId } = req.body;
      
      if (!planId) {
        return res.status(400).json({ message: "Plan ID is required" });
      }
      
      const clientSecret = await createPlanPaymentIntent(Number(planId));
      res.json({ clientSecret });
    } catch (error) {
      console.error("Error creating plan payment intent:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });
  
  app.post("/api/payments/create-module-intent", authenticate, async (req, res) => {
    try {
      const { modulePlanId, organizationId } = req.body;
      
      if (!modulePlanId) {
        return res.status(400).json({ message: "Module plan ID is required" });
      }
      
      const clientSecret = await createModulePaymentIntent(
        Number(modulePlanId), 
        organizationId ? Number(organizationId) : undefined
      );
      
      res.json({ clientSecret });
    } catch (error) {
      console.error("Error creating module payment intent:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
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
        'module_status_update'
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

  const httpServer = createServer(app);
  return httpServer;
}