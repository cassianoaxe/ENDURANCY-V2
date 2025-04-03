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
  app.get('/api/plan-change-requests-static-direct', (req, res) => {
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
  
  console.log("Rota estática de teste instalada em /api/plan-change-requests-static-direct");
  
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
