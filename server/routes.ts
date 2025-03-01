import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";

export async function registerRoutes(app: Express): Promise<Server> {
  // Rota de teste para o banco de dados
  app.get("/api/test-db", async (_req, res) => {
    try {
      // Tenta fazer uma consulta simples
      const result = await db.query.users.findMany();
      res.json({ success: true, message: "Conexão com o banco de dados funcionando!", users: result });
    } catch (error) {
      console.error("Erro ao conectar com o banco de dados:", error);
      res.status(500).json({ success: false, message: "Erro ao conectar com o banco de dados", error: String(error) });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}