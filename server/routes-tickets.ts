import { Express } from "express";
import ticketsRouter from "./routes/tickets";

export function registerTicketRoutes(app: Express) {
  // Registrar rotas do sistema de tickets
  app.use('/api/tickets', ticketsRouter);
  
  console.log("Rotas do sistema de tickets registradas com sucesso");
}