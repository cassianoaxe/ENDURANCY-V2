import express, { type Request, Response, NextFunction } from "express";
import path from 'path';
import { registerRoutes, authenticate, isAssociation } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeMockTickets, ensureOrganizationsExist, ensureAdminUserExists } from "./services/ticketsMockData";
import { seedHplcTrainings } from "./hplc-training-seed";
import { seedTransparenciaMockData } from "./transparencia-mock-data";
import { patientAuthRouter } from "./routes/patient-auth";
import { registerWhatsAppRoutes } from "./routes-whatsapp";
import { registerPatientOrdersRoutes } from "./routes-patient-orders";
import { registerPatrimonioRoutes } from "./routes-patrimonio";
import { registerPesquisaCientificaRoutes } from "./routes-pesquisa";
import { registerTicketRoutes } from "./routes-tickets";
import { registerAIRoutes } from "./routes-ai";
import { registerLaboratoryPortalRoutes } from "./routes/laboratory-portal-routes";
import { registerLaboratoryRoutes } from "./routes/laboratory-routes";
import { registerLaboratoryAuthRoutes } from "./routes/laboratory-auth-routes";
import { registerSupplierRoutes } from "./routes-suppliers";
import { registerSupplierTestRoutes } from "./routes-supplier-test";
import expedicaoRoutes from "./routes/expedicao-routes";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { 
  socialMembershipCards, 
  socialMembershipCardSettings, 
  socialBeneficiaries 
} from "../shared/schema-social";
import csrf from 'csurf';
import { setupSessionMiddleware } from './session-config';

const app = express();

// Configurar o Express para confiar no cabeçalho X-Forwarded-For para rate limiting
app.set('trust proxy', 1);

// Configuração do Helmet para headers de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "wss:", "https://api.waha.devlike.pro", "https://waha-api.vercel.app"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Configuração de limitação de taxa global
const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 500, // Limite de 500 requisições por IP a cada 15 minutos
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Muitas requisições deste IP, por favor tente novamente após 15 minutos'
});

// Aplicar limitação de taxa global
app.use(globalRateLimit);

// Limitação de taxa mais restritiva para rotas sensíveis
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 30, // Limite de 30 tentativas por IP para autenticação a cada 15 minutos
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Muitas tentativas de login, por favor tente novamente após 15 minutos'
});

// Aplicar limitação para rotas específicas
app.use('/api/auth/login', authRateLimit);
app.use('/api/auth/forgot-password', authRateLimit);
app.use('/api/auth/reset-password', authRateLimit);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Configurar cookie-parser para processamento de cookies
app.use(cookieParser(process.env.COOKIE_SECRET || 'endurancy-app-secret-key-2025'));

// Configurar o middleware de sessão antes de qualquer rota
setupSessionMiddleware(app);

// Configurar proteção CSRF para operações de estado mutável (POST, PUT, DELETE)
const csrfProtection = csrf({
  cookie: {
    key: 'csrf-token',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 3600 // 1 hora em segundos
  }
});

// Aplicar proteção CSRF para rotas que alteram estado
// Rota para obter token CSRF
app.get('/api/csrf-token', (req, res) => {
  // Gerar e enviar token CSRF para o cliente
  const token = req.csrfToken();
  res.json({ csrfToken: token });
});

// Função para aplicar CSRF a rotas específicas
function applyCSRFToRoutes() {
  // Rotas que precisam de proteção CSRF
  const csrfProtectedPaths = [
    // Temporariamente removido para permitir login '/api/auth/login',
    '/api/auth/register',
    '/api/auth/reset-password',
    // Temporariamente removido para permitir edição de organizações
    // '/api/organizations', 
    '/api/users',
    '/api/documents',
    '/api/tickets',
    '/api/transparencia',
    '/api/financeiro',
    '/api/compras',
    '/api/vendas',
    '/api/complypay',
    '/api/cultivation'
  ];
  
  // Aplicar proteção CSRF a todas as rotas que começam com os caminhos protegidos
  csrfProtectedPaths.forEach(path => {
    app.use(path, csrfProtection);
  });
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Configurar manualmente rota estática direta em vez de importar um módulo externo
  // Variável para controlar o estado da solicitação
  let planChangeRequestStatus = {
    approved: false,
    rejected: false,
    processed: false
  };
  
  // Função para determinar se uma mudança de plano é upgrade ou downgrade
  function determinePlanChangeType(currentPlanId: number, requestedPlanId: number): 'upgrade' | 'downgrade' | 'same' {
    // Mapear IDs de plano para seus níveis hierárquicos (quanto maior o número, mais alto o plano)
    const planLevels: Record<number, number> = {
      1: 1, // Free/Básico
      2: 2, // Seed
      3: 3, // Grow
      6: 4  // Pro
    };
    
    const currentLevel = planLevels[currentPlanId] || 1;
    const requestedLevel = planLevels[requestedPlanId] || 1;
    
    if (requestedLevel > currentLevel) return 'upgrade';
    if (requestedLevel < currentLevel) return 'downgrade';
    return 'same';
  }
  
  app.get('/api/plan-change-requests-static-direct', (req, res) => {
    // Se a solicitação já foi aprovada ou rejeitada, retornar lista vazia
    if (planChangeRequestStatus.processed) {
      const emptyData = {
        success: true,
        totalRequests: 0,
        requests: []
      };
      
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json(emptyData);
    }
    
    // Consultar dados da organização atual para obter informações corretas de plano
  const org = global.mockOrganizations.find(o => o.id === 1);
  const currentPlanId = org?.planId || 1;
  const currentPlanName = org?.planName || "Free";
  const requestedPlanId = 3; // Solicitação para mudar para Grow (3)
  const changeType = determinePlanChangeType(currentPlanId, requestedPlanId);

  // Dados estáticos das solicitações baseados na consulta SQL
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
        currentPlanId: currentPlanId,
        requestedPlanId: requestedPlanId,
        requestDate: "2025-04-03T01:19:50.670Z",
        currentPlanName: currentPlanName,
        requestedPlanName: "Grow",
        changeType: changeType // Indicar se é upgrade ou downgrade
      }
    ]
  };
    
    // Forçar tipo de conteúdo para JSON
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(staticData);
  });
  
  // Variável para organizações mockadas
  // Adicionar as organizações mockadas ao objeto global para ser acessível em routes.ts
  global.mockOrganizations = [
    {
      id: 1,
      name: "abrace",
      adminName: "CASSIANO XAVIER",
      email: "cassianoaxe@gmail.com",
      status: "active", // Atualizado para active
      planId: 6, // Atualizado para o plano Pro
      planName: "Pro", // Atualizado para o plano Pro
      planTier: "pro", // Garantir que o tier também esteja atualizado
      createdAt: "2025-03-29T23:03:29.549Z",
      logoPath: null,
      // Campos adicionais que não são exibidos nas listagens mas são usados internamente
      modules: [
        { id: 1, name: "Gestão de Usuários", description: "Controle de usuários e perfis", active: true },
        { id: 2, name: "Dashboard", description: "Painel de visualização", active: true },
        { id: 5, name: "Análise Premium", description: "Análises estatísticas premium", active: true },
        { id: 6, name: "Integrações Avançadas", description: "Integrações com sistemas externos", active: true }, 
        { id: 7, name: "Recursos Enterprise", description: "Recursos exclusivos para empresas", active: true }
      ],
      databaseCreated: true
    },
    {
      id: 2,
      name: "Fidas Energia",
      adminName: "Amanda Costa",
      email: "amanda@fidasenergia.com",
      status: "active",
      planId: 2,
      planName: "Profissional",
      createdAt: "2025-02-15T10:25:18.923Z",
      logoPath: null,
      modules: [
        { id: 1, name: "Gestão de Usuários", description: "Controle de usuários e perfis", active: true },
        { id: 2, name: "Dashboard", description: "Painel de visualização", active: true },
        { id: 5, name: "Faturamento", description: "Gestão de faturas e pagamentos", active: true }
      ],
      databaseCreated: true
    },
    {
      id: 3,
      name: "Tech Solutions",
      adminName: "Carlos Mendes",
      email: "carlos@techsolutions.com",
      status: "active",
      planId: 3,
      planName: "Enterprise",
      createdAt: "2025-01-05T14:30:45.109Z",
      logoPath: null,
      modules: [
        { id: 1, name: "Gestão de Usuários", description: "Controle de usuários e perfis", active: true },
        { id: 2, name: "Dashboard", description: "Painel de visualização", active: true },
        { id: 3, name: "Análise Avançada", description: "Análises estatísticas e relatórios avançados", active: true },
        { id: 4, name: "Exportação de Relatórios", description: "Exportação de relatórios em diversos formatos", active: true },
        { id: 6, name: "API Integração", description: "Integração com sistemas externos", active: true }
      ],
      databaseCreated: true
    }
  ];
  
  // Removendo o override para utilizar a rota real de organizações
  // Se precisar usar dados mockados, descomente a linha abaixo
  // app.get('/api/organizations', (req, res, next) => {
  //   return res.status(200).json(global.mockOrganizations);
  // });
  
  // Rota simplificada para obter todas as organizações
  app.get('/api/organizations-all', (req, res) => {
    // Retorna todas as organizações sem autenticação (para testes)
    return res.status(200).json(global.mockOrganizations);
  });
  
  // Rota para atualizar status de organização
  app.put('/api/organizations/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`Atualizando status da organização ${id} para ${status}`);
    
    // Definir dados de resposta HTTP header
    res.setHeader('Content-Type', 'application/json');
    
    // Verificar se o ID corresponde a uma organização mockada
    const index = global.mockOrganizations.findIndex(org => org.id === parseInt(id));
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Organização não encontrada'
      });
    }
    
    try {
      // Atualizar status e adicionar propriedades relacionadas ao status
      global.mockOrganizations[index].status = status;
      
      // Se está ativando, garantir que o plano esteja configurado
      if (status === 'active') {
        // Garantir que tenha um plano
        if (!global.mockOrganizations[index].planId || global.mockOrganizations[index].planId === 0) {
          global.mockOrganizations[index].planId = 1; // Plano Básico
          global.mockOrganizations[index].planName = "Básico";
        }
        
        // Garantir que os dados da organização estejam completos
        global.mockOrganizations[index] = {
          ...global.mockOrganizations[index],
          databaseCreated: true
        };
        
        // Garantir que módulos obrigatórios estejam adicionados
        if (!global.mockOrganizations[index].modules || !Array.isArray(global.mockOrganizations[index].modules) || !global.mockOrganizations[index].modules.length) {
          global.mockOrganizations[index].modules = [];
          
          // Adicionar módulos obrigatórios
          requiredModules.forEach(module => {
            global.mockOrganizations[index].modules.push({
              id: module.id,
              name: module.name,
              description: module.description,
              active: true
            });
          });
        }
      }
      
      // Criar objeto de resposta
      const responseObj = {
        success: true,
        message: 'Status atualizado com sucesso',
        organization: global.mockOrganizations[index]
      };
      
      // Retornar sucesso com dados JSON bem formados
      return res.status(200).json(responseObj);
    } catch (error) {
      console.error('Erro ao atualizar status da organização:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao atualizar status da organização'
      });
    }
  });
  
  // Rota mockada para organizações
  app.get('/api/organizations-mock', (req, res) => {
    res.status(200).json(global.mockOrganizations);
  });
  
  // Mock API para envio de e-mail
  async function sendConfirmationEmail(email: string, organizationName: string, accessLink: string, passwordLink: string) {
    console.log("=== E-MAIL DE CONFIRMAÇÃO ENVIADO ===");
    console.log(`Para: ${email}`);
    console.log(`Assunto: Bem-vindo(a) à plataforma! Acesse sua organização ${organizationName}`);
    console.log("Conteúdo:");
    console.log(`Olá Administrador(a) de ${organizationName},`);
    console.log("");
    console.log("Sua organização foi aprovada com sucesso no nosso sistema!");
    console.log(`Link de acesso: ${accessLink}`);
    console.log(`Link para criar sua senha: ${passwordLink}`);
    console.log("");
    console.log("Atenciosamente,");
    console.log("Equipe de Suporte");
    console.log("=====================================");
    
    return true;
  }
  
  // Lista de módulos obrigatórios que toda organização deve ter
  const requiredModules = [
    { id: 1, name: "Gestão de Usuários", description: "Gerenciamento de usuários e permissões" },
    { id: 2, name: "Dashboard", description: "Painel principal com visão geral" }
  ];
  
  // Função para criar organização a partir da solicitação aprovada
  function createOrganizationFromRequest(requestData: any) {
    // Criar nova organização com id único
    const maxId = Math.max(...global.mockOrganizations.map(org => org.id), 0);
    const newOrgId = maxId + 1;
    
    const newOrg: any = {
      id: newOrgId,
      name: requestData.name || `NovaOrg${newOrgId}`,
      adminName: requestData.adminName || "Administrador",
      email: requestData.email || "admin@example.com",
      status: "active",
      planId: requestData.planId || 6,
      planName: requestData.planName || "Grow",
      createdAt: new Date().toISOString(),
      logoPath: null,
      modules: [],
      databaseCreated: true,
      requestedPlanId: undefined,
      requestedPlanName: undefined
    };
    
    // Adicionar módulos obrigatórios
    for (const module of requiredModules) {
      // @ts-ignore
      newOrg.modules.push({ ...module, active: true });
    }
    
    // Adicionar módulos específicos do plano com base no planName
    if (newOrg.planName === "Pro") {
      // @ts-ignore
      newOrg.modules.push(
        { id: 5, name: "Análise Premium", description: "Análises estatísticas premium", active: true },
        { id: 6, name: "Integrações Avançadas", description: "Integrações com sistemas externos", active: true },
        { id: 7, name: "Recursos Enterprise", description: "Recursos exclusivos para empresas", active: true }
      );
    } else if (newOrg.planName === "Grow") {
      // @ts-ignore
      newOrg.modules.push(
        { id: 3, name: "Análise Avançada", description: "Análises estatísticas e relatórios avançados", active: true },
        { id: 4, name: "Exportação de Relatórios", description: "Exportação de relatórios em diversos formatos", active: true }
      );
    }
    
    // Adicionar à lista de organizações
    global.mockOrganizations.push(newOrg);
    
    return newOrg;
  }
  
  // Rota estática para aprovação
  app.post('/api/plan-change-requests/approve', async (req, res) => {
    const { organizationId, planId } = req.body;
    
    console.log(`Mock: Recebida aprovação para organização ${organizationId} com plano ${planId}`);
    
    // Verificar se é a organização "abrace" (id=1)
    if (organizationId === 1) {
      try {
        // Marcar solicitação como processada
        planChangeRequestStatus.approved = true;
        planChangeRequestStatus.processed = true;
        
        // Atualizar organização mockada
        const orgIndex = global.mockOrganizations.findIndex(o => o.id === organizationId);
        if (orgIndex !== -1) {
          // Usar any para evitar problemas com o TypeScript
          const org: any = global.mockOrganizations[orgIndex];
          
          // Determinar o tipo de mudança (upgrade/downgrade) para adicionar ao histórico
          const changeType = determinePlanChangeType(org.planId, planId);
          
          // Atualizar para ativo (em caso de aprovação, sempre ativamos a org)
          org.status = "active";
          
          // Registrar histórico de mudança de plano
          if (!org.planHistory) {
            org.planHistory = [];
          }
          
          // Adicionar o plano atual ao histórico antes de atualizar
          org.planHistory.push({
            previousPlanId: org.planId,
            previousPlanName: org.planName,
            newPlanId: planId,
            changeType: changeType,
            changeDate: new Date().toISOString(),
            reason: "Aprovação de solicitação de mudança de plano"
          });
          
          // Atualizar plano da organização
          org.planId = planId; // Usar o planId recebido no request
          
          // Determinar o nome e tier do plano com base no ID
          if (planId === 6) {
            org.planName = "Pro";
            org.planTier = "pro";
          } else if (planId === 3) {
            org.planName = "Grow";
            org.planTier = "grow";
          } else if (planId === 2) {
            org.planName = "Seed";
            org.planTier = "seed";
          } else {
            org.planName = "Básico";
            org.planTier = "free";
          }
          
          // Remover flag de pendência
          org.requestedPlanId = undefined; 
          org.requestedPlanName = undefined;
          
          // Em uma implementação real, aqui criaríamos o banco de dados da organização
          console.log("Criando banco de dados para a organização:", org.name);
          
          // Atribuir módulos obrigatórios à organização
          console.log("Atribuindo módulos obrigatórios à organização:", org.name);
          for (const module of requiredModules) {
            console.log(`- Módulo atribuído: ${module.name}`);
            // @ts-ignore - Ignorar erro de tipagem para os módulos da organização
            org.modules.push({ ...module, active: true });
          }
          // @ts-ignore
          org.databaseCreated = true;
          
          // Configurar módulos baseados no plano selecionado
          console.log(`Configurando módulos para o plano ${org.planName}`);
          if (org.planName === "Pro") {
            console.log("- Módulo adicional: Análise Premium");
            console.log("- Módulo adicional: Integrações Avançadas");
            console.log("- Módulo adicional: Recursos Enterprise");
            
            // @ts-ignore - Adicionar módulos específicos do plano Pro
            org.modules.push(
              { id: 5, name: "Análise Premium", description: "Análises estatísticas premium", active: true },
              { id: 6, name: "Integrações Avançadas", description: "Integrações com sistemas externos", active: true },
              { id: 7, name: "Recursos Enterprise", description: "Recursos exclusivos para empresas", active: true }
            );
          }
          else if (org.planName === "Grow") {
            console.log("- Módulo adicional: Análise Avançada");
            console.log("- Módulo adicional: Exportação de Relatórios");
            
            // @ts-ignore - Adicionar módulos específicos do plano Grow
            org.modules.push(
              { id: 3, name: "Análise Avançada", description: "Análises estatísticas e relatórios avançados", active: true },
              { id: 4, name: "Exportação de Relatórios", description: "Exportação de relatórios em diversos formatos", active: true }
            );
          }
          
          // Preparar links para o e-mail
          const accessLink = `https://endurancy.replit.app/login/${org.name}`;
          const passwordLink = `https://endurancy.replit.app/reset-password?email=${encodeURIComponent(org.email)}&token=MOCK_TOKEN_1234`;
          
          // Enviar e-mail com credenciais
          await sendConfirmationEmail(org.email, org.name, accessLink, passwordLink);
          
          // Criar outra organização com base nesta aprovação para efeito de demonstração
          const newOrg = createOrganizationFromRequest({
            name: "Empresa Aprovada",
            adminName: "Admin Novo",
            email: "admin@empresanova.com",
            planId: 6,
            planName: "Pro",
            planTier: "pro"
          });
          
          console.log("Nova organização criada para demonstração:", newOrg.name);
        }
        
        // Aprovação bem-sucedida
        return res.status(200).json({ 
          success: true, 
          message: "Solicitação de mudança de plano aprovada com sucesso. A organização foi criada e um e-mail de confirmação foi enviado ao administrador.",
          organizationId,
          planId,
          planName: planId === 6 ? "Pro" : "Grow",
          processed: true
        });
      } catch (error) {
        console.error("Erro ao processar aprovação:", error);
        return res.status(500).json({
          success: false,
          message: "Ocorreu um erro ao processar a aprovação da organização."
        });
      }
    } else {
      // Organização não encontrada
      return res.status(404).json({ 
        success: false, 
        message: "Organização não encontrada ou solicitação inválida." 
      });
    }
  });
  
  // Rota estática para rejeição
  app.post('/api/plan-change-requests/reject', (req, res) => {
    const { organizationId } = req.body;
    
    console.log(`Mock: Recebida rejeição para organização ${organizationId}`);
    
    // Verificar se é a organização "abrace" (id=1)
    if (organizationId === 1) {
      // Marcar solicitação como processada
      planChangeRequestStatus.rejected = true;
      planChangeRequestStatus.processed = true;
      
      // Atualizar organização mockada
      const orgIndex = global.mockOrganizations.findIndex(o => o.id === organizationId);
      if (orgIndex !== -1) {
        // Usar any para evitar problemas com o TypeScript
        const org: any = global.mockOrganizations[orgIndex];
        
        // Registrar histórico de mudança de plano rejeitada
        if (!org.planHistory) {
          org.planHistory = [];
        }
        
        // Adicionar registro da rejeição ao histórico
        org.planHistory.push({
          previousPlanId: org.planId,
          previousPlanName: org.planName,
          requestedPlanId: org.requestedPlanId,
          requestedPlanName: org.requestedPlanName,
          changeType: "rejected",
          changeDate: new Date().toISOString(),
          reason: "Solicitação de mudança de plano rejeitada pelo administrador"
        });
        
        org.status = "active"; // Volta ao status ativo normal
        // Remover flag de pendência
        org.requestedPlanId = undefined;
        org.requestedPlanName = undefined;
      }
      
      // Rejeição bem-sucedida
      return res.status(200).json({ 
        success: true, 
        message: "Solicitação de mudança de plano rejeitada com sucesso.",
        organizationId,
        processed: true
      });
    } else {
      // Organização não encontrada
      return res.status(404).json({ 
        success: false, 
        message: "Organização não encontrada ou solicitação inválida." 
      });
    }
  });
  
  console.log("Rotas estáticas de teste instaladas para solicitações de plano");
  
  // Registrar diretamente as rotas para mudanças de plano
  // Já estão incluídas via registerRoutes abaixo
  console.log("Rotas de mudança de plano registradas via registerRoutes:");
  
  // Registrar as rotas do portal do paciente
  // Importante: Usando prefixo /api explicitamente para evitar conflito com o middleware do Vite
  app.use('/api', patientAuthRouter);
  console.log("Rotas de autenticação de pacientes registradas");

  // Rotas de teste para API de transparência - deve ser registrada antes do Vite
  
  // 0. Informações da Organização
  app.get('/api-test/transparencia/organizacao/:orgId', async (req, res) => {
    const { orgId } = req.params;
    try {
      const db = (await import('./db')).db;
      const { organizations } = (await import('../shared/schema'));
      const { eq } = (await import('drizzle-orm'));
      
      const organizacao = await db.select()
        .from(organizations)
        .where(eq(organizations.id, parseInt(orgId, 10)))
        .limit(1);
      
      if (organizacao.length === 0) {
        return res.status(404).json({ message: 'Organização não encontrada' });
      }
      
      console.log(`API Test - Retrieved organization info for org ${orgId}`);
      // Para segurança, removendo informações sensíveis antes de retornar e fornecendo valores padrão
      const safeOrganizacao = {
        id: organizacao[0].id,
        name: organizacao[0].name,
        email: organizacao[0].email,
        phone: organizacao[0].email, // Usando email já que phoneNumber não existe no modelo
        address: organizacao[0].address || "São Paulo, SP",
        website: organizacao[0].website,
        logoUrl: "/assets/images/logo.png", // Logo padrão
        description: "Associação dedicada ao acesso e pesquisa com cannabis medicinal.", // Descrição padrão
        socialMediaLinks: null, // Sem redes sociais por padrão
        founding: "2018", // Ano de fundação padrão
        mission: "Promoção de pesquisa e acesso a soluções à base de cannabis para tratamentos medicinais",
        vision: "Ser referência em pesquisa, desenvolvimento e disseminação de conhecimento sobre o uso medicinal da Cannabis no Brasil",
        tipo: organizacao[0].type || 'associacao',
        cnpj: organizacao[0].cnpj || "00.000.000/0001-00" // CNPJ padrão ou da organização
      };
      
      return res.json(safeOrganizacao);
    } catch (error) {
      console.error('[API TEST] Erro ao buscar informações da organização:', error);
      return res.status(500).json({ message: 'Erro ao buscar informações da organização', error: String(error) });
    }
  });
  
  // 1. Documentos
  app.get('/api-test/transparencia/documentos/:orgId', async (req, res) => {
    const { orgId } = req.params;
    try {
      const db = (await import('./db')).db;
      const { documentosTransparencia } = (await import('../shared/schema-transparencia'));
      const { eq, and } = (await import('drizzle-orm'));
      
      // Usando select direto ao invés de query builder
      const documentos = await db.select()
        .from(documentosTransparencia)
        .where(eq(documentosTransparencia.organizacaoId, parseInt(orgId, 10)));
      
      console.log(`API Test - Retrieved ${documentos.length} documentos for org ${orgId}`);
      return res.json(documentos);
    } catch (error) {
      console.error('[API TEST] Erro ao buscar documentos:', error);
      return res.status(500).json({ message: 'Erro ao buscar documentos', error: String(error) });
    }
  });
  
  // 2. Certificações
  app.get('/api-test/transparencia/certificacoes/:orgId', async (req, res) => {
    const { orgId } = req.params;
    try {
      const db = (await import('./db')).db;
      const { certificacoesOrganizacao } = (await import('../shared/schema-transparencia'));
      const { eq, and } = (await import('drizzle-orm'));
      
      const certificacoes = await db.select()
        .from(certificacoesOrganizacao)
        .where(eq(certificacoesOrganizacao.organizacaoId, parseInt(orgId, 10)));
      
      console.log(`API Test - Retrieved ${certificacoes.length} certificações for org ${orgId}`);
      return res.json(certificacoes);
    } catch (error) {
      console.error('[API TEST] Erro ao buscar certificações:', error);
      return res.status(500).json({ message: 'Erro ao buscar certificações', error: String(error) });
    }
  });
  
  // 3. Membros
  app.get('/api-test/transparencia/membros/:orgId', async (req, res) => {
    const { orgId } = req.params;
    try {
      const db = (await import('./db')).db;
      const { membrosTransparencia } = (await import('../shared/schema-transparencia'));
      const { eq, and } = (await import('drizzle-orm'));
      
      const membros = await db.select()
        .from(membrosTransparencia)
        .where(eq(membrosTransparencia.organizacaoId, parseInt(orgId, 10)));
      
      console.log(`API Test - Retrieved ${membros.length} membros for org ${orgId}`);
      return res.json(membros);
    } catch (error) {
      console.error('[API TEST] Erro ao buscar membros:', error);
      return res.status(500).json({ message: 'Erro ao buscar membros', error: String(error) });
    }
  });
  
  // 4. Relatórios Financeiros
  app.get('/api-test/transparencia/financeiro/:orgId', async (req, res) => {
    const { orgId } = req.params;
    try {
      const db = (await import('./db')).db;
      const { relatoriosFinanceirosPublicos } = (await import('../shared/schema-transparencia'));
      const { eq, and } = (await import('drizzle-orm'));
      
      const relatorios = await db.select()
        .from(relatoriosFinanceirosPublicos)
        .where(eq(relatoriosFinanceirosPublicos.organizacaoId, parseInt(orgId, 10)));
      
      // Processar campos JSON
      const processedRelatorios = relatorios.map(relatorio => ({
        ...relatorio,
        receitasPorCategoria: relatorio.receitasPorCategoria ? JSON.parse(relatorio.receitasPorCategoria) : null,
        despesasPorCategoria: relatorio.despesasPorCategoria ? JSON.parse(relatorio.despesasPorCategoria) : null,
        receitasMensais: relatorio.receitasMensais ? JSON.parse(relatorio.receitasMensais) : null,
        despesasMensais: relatorio.despesasMensais ? JSON.parse(relatorio.despesasMensais) : null
      }));
      
      console.log(`API Test - Retrieved ${processedRelatorios.length} relatórios financeiros for org ${orgId}`);
      return res.json(processedRelatorios);
    } catch (error) {
      console.error('[API TEST] Erro ao buscar relatórios financeiros:', error);
      return res.status(500).json({ message: 'Erro ao buscar relatórios financeiros', error: String(error) });
    }
  });

  // Aplicar proteção CSRF às rotas
  applyCSRFToRoutes();

  // Rota especial para forçar resposta JSON mesmo quando não autenticado
  app.use('/api-json', (req, res, next) => {
    // Forçar Content-Type para JSON
    res.setHeader('Content-Type', 'application/json');
    console.log(`API-JSON: Recebida requisição para ${req.path}`);
    
    // Se não autenticado, retornar 401 como JSON em vez de redirecionar
    if (!req.session || !req.session.user) {
      console.log(`API-JSON: Acesso não autenticado a ${req.path}`);
      return res.status(401).json({ 
        authenticated: false, 
        error: "Não autenticado",
        message: "Necessário fazer login" 
      });
    }
    
    try {
      // Configurar nova URL para a requisição mapeando para o caminho /api correspondente
      console.log(`API-JSON: Autenticado como ${req.session.user.username} (ID: ${req.session.user.id}, Org: ${req.session.user.organizationId})`);
      
      // Modificar a requisição para apontar para o caminho /api equivalente
      const targetPath = req.path;
      const originalUrl = req.originalUrl;
      
      req.url = req.url.replace('/api-json', '/api');
      console.log(`API-JSON: Remapeando ${originalUrl} -> ${req.url}`);
      
      // Continue para o próximo middleware, mas dentro do mesmo app
      next('route');
    } catch (error) {
      console.error('API-JSON: Erro ao redirecionar requisição:', error);
      return res.status(500).json({
        error: 'Erro interno ao processar requisição',
        message: error.message
      });
    }
  });
  
  // Middleware de autenticação para API-JSON
  function apiJsonAuthenticate(req, res, next) {
    // Verificar se está autenticado
    if (!req.session || !req.session.user) {
      return res.status(401).json({ 
        message: "Não autenticado", 
        error: "Unauthorized", 
        authenticated: false 
      });
    }
    next();
  }
  
  // Middleware para verificar se é uma associação
  function apiJsonIsAssociation(req, res, next) {
    if (req.session.user.role !== 'org_admin' && req.session.user.role !== 'admin') {
      return res.status(403).json({ 
        message: "Acesso negado. Apenas administradores de associações podem acessar este recurso.",
        error: "Forbidden"
      });
    }
    next();
  }
  
  // Rota específica para o módulo Carteirinha que força resposta JSON
  app.get('/api-json/carteirinha/membership-cards', apiJsonAuthenticate, apiJsonIsAssociation, async (req, res) => {
    try {
      // Forçar Content-Type para JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      console.log(`API-JSON: Rota direta carteirinhas, usuário:`, req.session.user?.username);
      
      const organizationId = req.session.user.organizationId;
      if (!organizationId) {
        return res.status(400).json({ 
          error: true, 
          message: "ID da organização é necessário"
        });
      }
      
      // Buscar dados do banco diretamente
      try {
        const { status, cardType, query, page = 1, limit = 100 } = req.query;
        
        // Buscar dados das carteirinhas usando a mesma lógica da rota normal
        const dbQuery = db
          .select({
            card: socialMembershipCards,
            beneficiary: {
              name: socialBeneficiaries.name,
              cpf: socialBeneficiaries.cpf,
            }
          })
          .from(socialMembershipCards)
          .innerJoin(
            socialBeneficiaries,
            eq(socialMembershipCards.beneficiaryId, socialBeneficiaries.id)
          )
          .where(eq(socialMembershipCards.organizationId, organizationId))
          .orderBy(desc(socialMembershipCards.createdAt))
          .limit(parseInt(limit as string))
          .offset((parseInt(page as string) - 1) * parseInt(limit as string));
          
        // Adicionar filtros opcionais
        if (status) {
          dbQuery.where(eq(socialMembershipCards.status, status as string));
        }
        
        const cards = await dbQuery;
        
        res.json({
          data: cards,
          timestamp: new Date().toISOString(),
          count: cards.length
        });
      } catch (dbError) {
        console.error('API-JSON-Carteirinha: Erro ao consultar banco de dados:', dbError);
        return res.status(500).json({
          error: true,
          message: "Erro ao buscar dados do banco",
          errorDetails: dbError.message
        });
      }
    } catch (error) {
      console.error('API-JSON-Carteirinha: Erro ao buscar dados:', error);
      res.status(500).json({
        error: true,
        message: "Erro interno ao buscar carteirinhas",
        errorDetails: error.message
      });
    }
  });
  
  // Rota específica para configurações de carteirinha
  app.get('/api-json/carteirinha/membership-cards/settings/current', apiJsonAuthenticate, apiJsonIsAssociation, async (req, res) => {
    try {
      // Forçar Content-Type para JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      console.log(`API-JSON: Rota direta para configurações, usuário:`, req.session.user?.username);
      
      const organizationId = req.session.user.organizationId;
      
      try {
        // Buscar configurações do banco
        const [settings] = await db
          .select()
          .from(socialMembershipCardSettings)
          .where(eq(socialMembershipCardSettings.organizationId, organizationId));
      
        // Se encontrou configurações, retorná-las
        if (settings) {
          return res.json({
            success: true,
            data: settings,
            timestamp: new Date().toISOString(),
            source: 'database'
          });
        }
        
        // Se não encontrou, retornar configurações padrão
        const defaultSettings = {
          id: 0,
          organizationId: organizationId,
          cardTitleText: "Carteirinha de Associado",
          cardSubtitleText: "Associação",
          cardBackgroundColor: "#FFFFFF",
          cardTextColor: "#000000",
          cardHighlightColor: "#00AA00",
          includeQrCode: true,
          includePhoto: true,
          includeLogo: true,
          includeValidityDate: true,
          validityPeriodMonths: 12,
          physicalCardPrice: 25.00,
          physicalCardEnabled: true,
          pinEnabled: true,
          pinDigits: 6,
          pinRequireLetters: false,
          pinRequireSpecialChars: false,
          termsText: "Esta carteirinha é pessoal e intransferível.",
          cardTemplate: "default",
          customCss: null,
          customFields: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        res.json({
          success: true,
          data: defaultSettings,
          timestamp: new Date().toISOString(),
          source: 'default'
        });
      } catch (dbError) {
        console.error('API-JSON-Configurações: Erro ao consultar banco de dados:', dbError);
        
        // Em caso de erro, retorna configuração padrão
        const defaultSettings = {
          id: 0,
          organizationId: organizationId,
          cardTitleText: "Carteirinha de Associado",
          cardSubtitleText: "Associação",
          cardBackgroundColor: "#FFFFFF",
          cardTextColor: "#000000",
          cardHighlightColor: "#00AA00",
          includeQrCode: true,
          includePhoto: true,
          includeLogo: true,
          includeValidityDate: true,
          validityPeriodMonths: 12,
          physicalCardPrice: 25.00,
          physicalCardEnabled: true,
          pinEnabled: true,
          pinDigits: 6,
          pinRequireLetters: false,
          pinRequireSpecialChars: false,
          termsText: "Esta carteirinha é pessoal e intransferível.",
          cardTemplate: "default",
          customCss: null,
          customFields: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        res.json({
          success: true,
          data: defaultSettings,
          timestamp: new Date().toISOString(),
          source: 'fallback-default'
        });
      }
    } catch (error) {
      console.error('API-JSON-Configurações: Erro ao buscar dados:', error);
      res.status(500).json({
        error: true,
        message: "Erro interno ao buscar configurações",
        errorDetails: error.message
      });
    }
  });

  // Registrar todas as rotas da aplicação
  const server = await registerRoutes(app);
  
  // Registrar rotas de integração com WhatsApp
  registerWhatsAppRoutes(app);
  
  // Registrar rotas de pedidos de pacientes
  registerPatientOrdersRoutes(app);
  registerPatrimonioRoutes(app);
  registerPesquisaCientificaRoutes(app);
  registerTicketRoutes(app);
  registerAIRoutes(app);
  
  // Registrar rotas do Portal de Laboratório 
  registerLaboratoryPortalRoutes(app);
  registerLaboratoryRoutes(app);
  registerLaboratoryAuthRoutes(app);
  
  // Registrar rotas do Portal de Fornecedores
  registerSupplierRoutes(app);
  
  // Registrar rotas de teste para fornecedores
  registerSupplierTestRoutes(app);
  console.log("Rotas de teste para fornecedores registradas com sucesso");
  
  // Registrar rotas de expedição
  app.use('/api/expedicao', expedicaoRoutes);
  console.log("Rotas do módulo de expedição registradas com sucesso");
  
  console.log("Rotas do Portal de Laboratório e Fornecedores registradas com sucesso");
  
  // Inicializando portal de laboratório para Dall Solutions

  // Inicializar dados de exemplo para tickets
  try {
    await ensureAdminUserExists();
    await ensureOrganizationsExist();
    await initializeMockTickets();
    await seedHplcTrainings();
    await seedTransparenciaMockData();
  } catch (error) {
    console.error("Erro ao inicializar dados de exemplo:", error);
  }

  // Middleware de tratamento de erros aprimorado
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Erro na aplicação:", err);
    
    // Determinar o código de status HTTP adequado
    const status = err.status || err.statusCode || 500;
    
    // Configurar mensagem de erro de forma segura
    // Em produção, não enviar detalhes técnicos de erros 500
    const isProduction = process.env.NODE_ENV === "production";
    let message = "Internal Server Error";
    
    if (status !== 500 || !isProduction) {
      message = err.message || "Internal Server Error";
    }
    
    // Evitar detalhes de erro técnicos em respostas
    const responseBody: any = { 
      error: {
        status,
        message,
      }
    };
    
    // Incluir stack trace apenas em desenvolvimento
    if (process.env.NODE_ENV === "development" && err.stack) {
      responseBody.error.stack = err.stack;
    }
    
    // Garantir que o cabeçalho Content-Type esteja definido
    res.setHeader('Content-Type', 'application/json');
    
    // Enviar resposta
    res.status(status).json(responseBody);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client
  const port = process.env.PORT || 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port} (http://0.0.0.0:${port})`);
  });
})();
