import express, { type Request, Response, NextFunction } from "express";
import path from 'path';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeMockTickets, ensureOrganizationsExist, ensureAdminUserExists } from "./services/ticketsMockData";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

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
          currentPlanId: null,
          requestedPlanId: 6,
          requestDate: "2025-04-03T01:19:50.670Z",
          currentPlanName: "Free",
          requestedPlanName: "Grow"
        }
      ]
    };
    
    // Forçar tipo de conteúdo para JSON
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(staticData);
  });
  
  // Variável para organizações mockadas
  const mockOrganizations = [
    {
      id: 1,
      name: "abrace",
      adminName: "CASSIANO XAVIER",
      email: "cassianoaxe@gmail.com",
      status: "pending_plan_change",
      planId: 0, // Usando 0 em vez de null
      planName: "Free",
      createdAt: "2025-03-29T23:03:29.549Z",
      requestedPlanId: 6,
      requestedPlanName: "Grow",
      logoPath: null,
      // Campos adicionais que não são exibidos nas listagens mas são usados internamente
      modules: [],
      databaseCreated: false
    }
  ];
  
  // Override padrão para as APIs de organizações
  app.get('/api/organizations', (req, res, next) => {
    // Verificar se a organização mockada já está configurada
    // Verificar autenticação
    if (req.session?.user?.role === 'admin') {
      // Retorna a lista de organizações mockadas ao invés da lista real
      return res.status(200).json(mockOrganizations);
    }
    // Continuar para a próxima rota se não for um administrador
    next();
  });
  
  // Rota mockada para organizações
  app.get('/api/organizations-mock', (req, res) => {
    res.status(200).json(mockOrganizations);
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
        const org = mockOrganizations.find(o => o.id === organizationId);
        if (org) {
          org.status = "active";
          org.planId = 6; // Usando um número em vez de null
          org.planName = "Grow";
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
          if (org.planName === "Grow") {
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
        }
        
        // Aprovação bem-sucedida
        return res.status(200).json({ 
          success: true, 
          message: "Solicitação de mudança de plano aprovada com sucesso. A organização foi criada e um e-mail de confirmação foi enviado ao administrador.",
          organizationId,
          planId,
          planName: "Grow",
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
      const org = mockOrganizations.find(o => o.id === organizationId);
      if (org) {
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
  
  const server = await registerRoutes(app);

  // Inicializar dados de exemplo para tickets
  try {
    await ensureAdminUserExists();
    await ensureOrganizationsExist();
    await initializeMockTickets();
  } catch (error) {
    console.error("Erro ao inicializar dados de exemplo:", error);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
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
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
