import type { Express, Request, Response } from "express";

// Adiciona rotas de teste para autenticação
export function addTestAuthRoutes(app: Express) {
  console.log("Adicionando rotas de teste para autenticação");

  // Rota de status/heartbeat
  app.get("/api/test-status", (req: Request, res: Response) => {
    return res.json({ 
      status: "online", 
      timestamp: new Date().toISOString(),
      session: req.sessionID || 'não definida'
    });
  });

  // Login simplificado para testes (sem consulta ao banco)
  app.post("/api/test-login", (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      console.log("Test login attempt:", { username });
      
      // Verificações básicas
      if (!username || !password) {
        return res.status(400).json({ message: "Credenciais incompletas" });
      }
      
      // Aceitar qualquer combinação para teste
      // Usar tipagem específica para compatibilidade
      const testUser = {
        id: 999,
        username,
        name: "Usuário de Teste",
        email: username.includes('@') ? username : `${username}@test.com`,
        role: "admin" as "admin" | "org_admin" | "doctor" | "patient" | "manager" | "employee" | "pharmacist" | "laboratory",
        organizationId: null,
        createdAt: new Date()
      };
      
      // Verificar se temos req.session
      if (!req.session) {
        console.error("Erro: req.session não está disponível");
        return res.status(500).json({ 
          message: "Erro na configuração da sessão", 
          sessionAvailable: false 
        });
      }
      
      // Estabelecer sessão
      req.session.user = testUser;
      
      console.log("Test login successful", { 
        sessionID: req.sessionID,
        user: testUser.username
      });
      
      // Garantir que os dados sejam salvos na sessão antes de responder
      req.session.save((err) => {
        if (err) {
          console.error("Erro ao salvar sessão:", err);
          return res.status(500).json({ 
            message: "Erro ao salvar sessão", 
            sessionError: err.message 
          });
        }
        
        return res.json({
          ...testUser,
          sessionID: req.sessionID,
          redirectUrl: "/dashboard"
        });
      });
    } catch (error: any) {
      console.error("Erro no teste de login:", error);
      return res.status(500).json({ 
        message: "Erro interno no servidor", 
        error: error.message
      });
    }
  });

  // Verificação de autenticação para teste
  app.get("/api/test-me", (req: Request, res: Response) => {
    // Adicionar headers para prevenir caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Verificar estado da sessão
    console.log("Verificando sessão de teste:", {
      sessionID: req.sessionID || 'sem ID',
      hasSession: !!req.session,
      hasUser: !!req.session?.user,
      cookie: !!req.headers.cookie,
      user: req.session?.user ? {
        username: req.session.user.username,
        role: req.session.user.role
      } : 'não autenticado'
    });
    
    // Se tiver usuário na sessão, retornar
    if (req.session?.user) {
      return res.json({
        user: req.session.user,
        sessionID: req.sessionID
      });
    }
    
    return res.status(401).json({ 
      message: "Não autenticado",
      sessionID: req.sessionID || 'não definida',
      hasSession: !!req.session,
      cookiePresent: !!req.headers.cookie
    });
  });

  // Logout para teste
  app.post("/api/test-logout", (req: Request, res: Response) => {
    if (req.session) {
      console.log("Encerrando sessão de teste:", {
        sessionID: req.sessionID,
        user: req.session.user?.username || 'desconhecido'
      });
      
      req.session.destroy((err) => {
        if (err) {
          console.error("Erro ao destruir sessão:", err);
          return res.status(500).json({ message: "Erro ao fazer logout" });
        }
        
        res.json({ message: "Logout realizado com sucesso" });
      });
    } else {
      res.json({ message: "Nenhuma sessão ativa para logout" });
    }
  });
}