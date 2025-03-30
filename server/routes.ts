import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { db } from "./db";
import { 
  organizations, 
  organizationDocuments, 
  users, 
  plans, 
  modules, 
  modulePlans, 
  organizationModules,
  insertModuleSchema, 
  insertModulePlanSchema, 
  insertOrganizationModuleSchema 
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { pool } from "./db";
import { createPaymentIntent, retrievePaymentIntent, initializePlans } from "./services/stripe";
import { initializeModules } from "./services/modules";
import { sendTemplateEmail } from "./services/email";

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
  
  // Initialize modules and plans
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
      
      const clientSecret = await createPaymentIntent(planId);
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
      const paymentIntent = await retrievePaymentIntent(paymentIntentId);
      
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
  
  // ======== API de Módulos ========
  
  // Listar todos os módulos
  app.get("/api/modules", async (req, res) => {
    try {
      const modulesList = await db.select().from(modules);
      res.json(modulesList);
    } catch (error) {
      console.error("Erro ao buscar módulos:", error);
      res.status(500).json({ message: "Erro ao buscar módulos" });
    }
  });
  
  // Obter um módulo específico
  app.get("/api/modules/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const [module] = await db.select().from(modules).where(eq(modules.id, parseInt(id)));
      
      if (!module) {
        return res.status(404).json({ message: "Módulo não encontrado" });
      }
      
      res.json(module);
    } catch (error) {
      console.error("Erro ao buscar módulo:", error);
      res.status(500).json({ message: "Erro ao buscar módulo" });
    }
  });
  
  // Criar um novo módulo (apenas admin)
  app.post("/api/modules", authenticate, async (req, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem criar módulos." });
      }
      
      const moduleData = insertModuleSchema.parse(req.body);
      const [newModule] = await db.insert(modules).values(moduleData).returning();
      
      res.status(201).json(newModule);
    } catch (error) {
      console.error("Erro ao criar módulo:", error);
      res.status(500).json({ message: "Erro ao criar módulo" });
    }
  });
  
  // Atualizar um módulo (apenas admin)
  app.put("/api/modules/:id", authenticate, async (req, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem atualizar módulos." });
      }
      
      const { id } = req.params;
      const moduleData = insertModuleSchema.parse(req.body);
      
      const [updatedModule] = await db
        .update(modules)
        .set(moduleData)
        .where(eq(modules.id, parseInt(id)))
        .returning();
      
      if (!updatedModule) {
        return res.status(404).json({ message: "Módulo não encontrado" });
      }
      
      res.json(updatedModule);
    } catch (error) {
      console.error("Erro ao atualizar módulo:", error);
      res.status(500).json({ message: "Erro ao atualizar módulo" });
    }
  });
  
  // ======== API de Planos de Módulos ========
  
  // Listar todos os planos de um módulo
  app.get("/api/modules/:moduleId/plans", async (req, res) => {
    try {
      const { moduleId } = req.params;
      const plansList = await db
        .select()
        .from(modulePlans)
        .where(eq(modulePlans.moduleId, parseInt(moduleId)));
      
      res.json(plansList);
    } catch (error) {
      console.error("Erro ao buscar planos:", error);
      res.status(500).json({ message: "Erro ao buscar planos" });
    }
  });
  
  // Obter um plano específico
  app.get("/api/module-plans/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const [plan] = await db
        .select()
        .from(modulePlans)
        .where(eq(modulePlans.id, parseInt(id)));
      
      if (!plan) {
        return res.status(404).json({ message: "Plano não encontrado" });
      }
      
      res.json(plan);
    } catch (error) {
      console.error("Erro ao buscar plano:", error);
      res.status(500).json({ message: "Erro ao buscar plano" });
    }
  });
  
  // Criar um novo plano para um módulo (apenas admin)
  app.post("/api/module-plans", authenticate, async (req, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem criar planos." });
      }
      
      const planData = insertModulePlanSchema.parse(req.body);
      const [newPlan] = await db.insert(modulePlans).values(planData).returning();
      
      res.status(201).json(newPlan);
    } catch (error) {
      console.error("Erro ao criar plano:", error);
      res.status(500).json({ message: "Erro ao criar plano" });
    }
  });
  
  // Atualizar um plano (apenas admin)
  app.put("/api/module-plans/:id", authenticate, async (req, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem atualizar planos." });
      }
      
      const { id } = req.params;
      const planData = insertModulePlanSchema.parse(req.body);
      
      const [updatedPlan] = await db
        .update(modulePlans)
        .set(planData)
        .where(eq(modulePlans.id, parseInt(id)))
        .returning();
      
      if (!updatedPlan) {
        return res.status(404).json({ message: "Plano não encontrado" });
      }
      
      res.json(updatedPlan);
    } catch (error) {
      console.error("Erro ao atualizar plano:", error);
      res.status(500).json({ message: "Erro ao atualizar plano" });
    }
  });
  
  // ======== API de Módulos de Organizações ========
  
  // Listar todos os módulos de uma organização
  app.get("/api/organizations/:organizationId/modules", authenticate, async (req, res) => {
    try {
      const { organizationId } = req.params;
      
      // Verificar permissão: admin ou admin da organização
      if (req.user?.role !== 'admin' && 
         (req.user?.role !== 'org_admin' || req.user?.organizationId !== parseInt(organizationId))) {
        return res.status(403).json({ message: "Acesso negado." });
      }
      
      const orgModules = await db
        .select({
          id: organizationModules.id,
          organizationId: organizationModules.organizationId,
          moduleId: organizationModules.moduleId,
          planId: organizationModules.planId,
          startDate: organizationModules.startDate,
          expiryDate: organizationModules.expiryDate,
          status: organizationModules.status,
          moduleName: modules.name,
          moduleType: modules.type,
          moduleDescription: modules.description,
          moduleIconName: modules.iconName,
          planName: modulePlans.name,
          planPrice: modulePlans.price,
          planBillingCycle: modulePlans.billingCycle,
          planMaxUsers: modulePlans.maxUsers,
        })
        .from(organizationModules)
        .innerJoin(modules, eq(organizationModules.moduleId, modules.id))
        .innerJoin(modulePlans, eq(organizationModules.planId, modulePlans.id))
        .where(eq(organizationModules.organizationId, parseInt(organizationId)));
      
      res.json(orgModules);
    } catch (error) {
      console.error("Erro ao buscar módulos da organização:", error);
      res.status(500).json({ message: "Erro ao buscar módulos da organização" });
    }
  });
  
  // Adicionar um módulo para uma organização
  app.post("/api/organizations/:organizationId/modules", authenticate, async (req, res) => {
    try {
      const { organizationId } = req.params;
      
      // Verificar permissão: admin ou admin da organização
      if (req.user?.role !== 'admin' && 
         (req.user?.role !== 'org_admin' || req.user?.organizationId !== parseInt(organizationId))) {
        return res.status(403).json({ message: "Acesso negado." });
      }
      
      const moduleData = insertOrganizationModuleSchema.parse({
        ...req.body,
        organizationId: parseInt(organizationId)
      });
      
      const [newOrgModule] = await db
        .insert(organizationModules)
        .values(moduleData)
        .returning();
      
      res.status(201).json(newOrgModule);
    } catch (error) {
      console.error("Erro ao adicionar módulo à organização:", error);
      res.status(500).json({ message: "Erro ao adicionar módulo à organização" });
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
  
  const httpServer = createServer(app);
  return httpServer;
}