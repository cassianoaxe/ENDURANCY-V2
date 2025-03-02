import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/organizations", async (_req, res) => {
    try {
      const organizations = await db.query.organizations.findMany();
      res.json(organizations);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      res.status(500).json({ message: "Failed to fetch organizations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}