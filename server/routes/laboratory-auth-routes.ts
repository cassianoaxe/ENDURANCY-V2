import { Express, Request, Response } from "express";
import bcrypt from "bcrypt";
import { db } from "../db";
import { users } from "@shared/schema";
import { laboratories } from "@shared/schema-laboratory";
import { eq, and } from "drizzle-orm";

export function registerLaboratoryAuthRoutes(app: Express) {
  // Rota para login específico de laboratório
  app.post("/api/auth/laboratory/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Nome de usuário e senha são obrigatórios" });
      }

      // Buscar usuário pelo username
      const user = await db.query.users.findFirst({
        where: eq(users.username, username),
        with: {
          laboratory: true
        }
      });

      if (!user) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      // Verificar se o usuário tem papel de laboratório
      if (user.role !== "laboratory") {
        return res.status(403).json({ message: "Acesso negado. Conta não é do tipo laboratório" });
      }

      // Verificar senha
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      // Buscar laboratório relacionado
      const laboratory = await db.query.laboratories.findFirst({
        where: eq(laboratories.userId, user.id)
      });

      if (!laboratory) {
        return res.status(404).json({ message: "Laboratório não encontrado para este usuário" });
      }

      // Verificar se o laboratório está ativo
      if (laboratory.status !== "active") {
        return res.status(403).json({ 
          message: "Sua conta de laboratório ainda não foi ativada ou está suspensa. Entre em contato com o suporte."
        });
      }

      // Estabelecer sessão para usuário de laboratório
      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        organizationId: null,
        labId: laboratory.id
      };

      // Retornar dados do usuário e laboratório (sem senha)
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        ...userWithoutPassword,
        laboratory
      });
    } catch (error) {
      console.error("Erro no login de laboratório:", error);
      res.status(500).json({ message: "Erro ao processar a autenticação" });
    }
  });

  // Endpoint para registro de laboratório
  app.post("/api/auth/laboratory/register", async (req: Request, res: Response) => {
    try {
      const { username, password, name, email, phone, licenseNumber } = req.body;

      // Validações básicas
      if (!username || !password || !name) {
        return res.status(400).json({ message: "Dados incompletos para cadastro" });
      }

      // Verificar se o username já existe
      const existingUser = await db.query.users.findFirst({
        where: eq(users.username, username)
      });

      if (existingUser) {
        return res.status(409).json({ message: "Nome de usuário já existe" });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Criar usuário com papel de laboratório
      const [newUser] = await db.insert(users)
        .values({
          username,
          password: hashedPassword,
          role: "laboratory",
          email: email || username, // Se não houver email separado, usar o username
          name: name
        })
        .returning();

      // Criar registro de laboratório
      const [newLaboratory] = await db.insert(laboratories)
        .values({
          name,
          userId: newUser.id,
          email: email || username,
          phone,
          licenseNumber,
          status: "pending" // Pendente de aprovação por padrão
        })
        .returning();

      // Retornar sucesso com dados (sem senha)
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json({
        ...userWithoutPassword,
        laboratory: newLaboratory,
        message: "Cadastro realizado com sucesso! Aguarde aprovação."
      });
    } catch (error) {
      console.error("Erro no registro de laboratório:", error);
      res.status(500).json({ message: "Erro ao processar o cadastro" });
    }
  });

  // Verificar status de autenticação para laboratório
  app.get("/api/auth/laboratory/me", async (req: Request, res: Response) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const { id, role } = req.session.user;

      // Verificar se é um usuário de laboratório
      if (role !== "laboratory") {
        return res.status(403).json({ message: "Não é um usuário de laboratório" });
      }

      // Buscar usuário e laboratório relacionado
      const user = await db.query.users.findFirst({
        where: eq(users.id, id),
        with: {
          laboratory: true
        }
      });

      if (!user) {
        // Sessão inválida, limpar
        req.session.destroy((err) => {
          if (err) console.error("Erro ao destruir sessão:", err);
        });
        return res.status(401).json({ message: "Usuário não encontrado" });
      }

      // Verificar se o laboratório está ativo
      if (user.laboratory?.status !== "active") {
        return res.status(403).json({ 
          message: "Sua conta de laboratório está pendente de aprovação ou suspensa"
        });
      }

      // Retornar dados sem senha
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Erro ao verificar autenticação de laboratório:", error);
      res.status(500).json({ message: "Erro ao verificar autenticação" });
    }
  });

  // Logout para laboratório
  app.post("/api/auth/laboratory/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Erro ao fazer logout:", err);
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logout realizado com sucesso" });
    });
  });
}