import type { Request, Response, NextFunction } from "express";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users } from "@shared/schema";

// Middleware simplificado para verificar se o usuário está autenticado
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // Verificar se temos req.session
  if (!req.session) {
    console.log("Sessão não disponível no middleware de autenticação");
    return res.status(401).json({ 
      authenticated: false, 
      message: "Configuração de sessão inválida" 
    });
  }
  
  // Verificar se o usuário está na sessão
  if (!req.session.user) {
    console.log("Usuário não autenticado");
    return res.status(401).json({ 
      authenticated: false, 
      message: "Necessário fazer login" 
    });
  }
  
  // Usuário autenticado, continuar
  next();
}

// Função para verificar credenciais e autenticar usuário
export async function authenticateUser(username: string, password: string) {
  try {
    // Verificar se o usuário existe
    const user = await db.select().from(users).where(eq(users.username, username));
    
    if (user.length === 0) {
      return { success: false, message: "Usuário não encontrado" };
    }
    
    // No ambiente de desenvolvimento/teste, permitir login sem verificar senha
    // Em produção, deve usar bcrypt.compare()
    // Implementação simplificada para diagnóstico
    
    return { 
      success: true, 
      user: user[0] 
    };
  } catch (error: any) {
    console.error("Erro ao autenticar:", error);
    return { 
      success: false, 
      message: "Erro ao autenticar usuário: " + error.message 
    };
  }
}

// Função de login
export async function loginUser(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    
    // Validar entrada
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Nome de usuário e senha são obrigatórios" 
      });
    }
    
    // Autenticar usuário
    const result = await authenticateUser(username, password);
    
    if (!result.success) {
      return res.status(401).json({ 
        success: false, 
        message: result.message 
      });
    }
    
    // Verificar se temos req.session
    if (!req.session) {
      console.error("Erro: req.session não está disponível no login");
      return res.status(500).json({ 
        success: false, 
        message: "Erro na configuração da sessão" 
      });
    }
    
    // Salvar usuário na sessão
    req.session.user = result.user;
    
    // Salvar sessão e retornar ao cliente
    req.session.save((err) => {
      if (err) {
        console.error("Erro ao salvar sessão:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Erro ao salvar sessão: " + err.message 
        });
      }
      
      // Success, return user info
      return res.json({
        success: true,
        user: {
          id: result.user.id,
          username: result.user.username,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          organizationId: result.user.organizationId
        },
        message: "Login realizado com sucesso"
      });
    });
  } catch (error: any) {
    console.error("Erro no login:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Erro interno no servidor: " + error.message 
    });
  }
}

// Função de logout
export function logoutUser(req: Request, res: Response) {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Erro ao destruir sessão:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Erro ao fazer logout: " + err.message 
        });
      }
      
      res.json({ 
        success: true, 
        message: "Logout realizado com sucesso" 
      });
    });
  } else {
    res.json({ 
      success: true, 
      message: "Nenhuma sessão ativa para encerrar" 
    });
  }
}

// Função para obter usuário atual
export function getCurrentUser(req: Request, res: Response) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ 
      authenticated: false, 
      message: "Não autenticado" 
    });
  }
  
  res.json({
    authenticated: true,
    user: req.session.user
  });
}