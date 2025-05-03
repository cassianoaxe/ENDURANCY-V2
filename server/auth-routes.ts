import type { Express, Request, Response } from "express";
import { loginUser, logoutUser, getCurrentUser, isAuthenticated } from "./auth-middleware";

// Função para registrar rotas de autenticação
export function registerAuthRoutes(app: Express) {
  console.log("Registrando rotas de autenticação simplificadas");

  // Rota de login
  app.post("/api/auth/simple-login", (req: Request, res: Response) => {
    return loginUser(req, res);
  });

  // Rota de logout
  app.post("/api/auth/simple-logout", (req: Request, res: Response) => {
    return logoutUser(req, res);
  });

  // Rota para obter usuário atual
  app.get("/api/auth/simple-me", (req: Request, res: Response) => {
    return getCurrentUser(req, res);
  });

  // Rota protegida de exemplo
  app.get("/api/auth/protected", isAuthenticated, (req: Request, res: Response) => {
    res.json({ 
      message: "Esta é uma rota protegida", 
      user: req.session?.user 
    });
  });

  // Rota para verificar status do sistema de autenticação
  app.get("/api/auth/status", (req: Request, res: Response) => {
    res.json({
      sessionAvailable: !!req.session,
      authenticated: !!req.session?.user,
      sessionID: req.sessionID || "não disponível",
      timestamp: new Date().toISOString()
    });
  });
}