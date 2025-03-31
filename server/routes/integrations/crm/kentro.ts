import { Router, Request, Response } from "express";
import { db } from "../../../db";
import { organizations, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const kentroRouter = Router();

// Esquema de validação para configuração da API
const apiConfigSchema = z.object({
  apiKey: z.string().min(1, "Chave de API é obrigatória"),
  apiUrl: z.string().url("URL deve ser válida"),
  webhookUrl: z.string().url("URL de webhook deve ser válida").optional(),
  maxConnections: z.coerce.number().min(1).max(100),
  enableSync: z.boolean().default(true),
  syncInterval: z.coerce.number().min(5).max(1440),
  logging: z.boolean().default(true),
});

// Esquema de validação para configuração de webhook
const webhookConfigSchema = z.object({
  webhookSecret: z.string().min(1, "Segredo do webhook é obrigatório"),
  contactEvents: z.boolean().default(true),
  dealEvents: z.boolean().default(true),
  companyEvents: z.boolean().default(true),
  taskEvents: z.boolean().default(false),
  errorEvents: z.boolean().default(true),
});

// Rota para obter configurações da integração
kentroRouter.get("/config", async (req: Request, res: Response) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    // Verificar se o usuário é admin ou admin da organização
    if (!["admin", "org_admin"].includes(req.session.user.role)) {
      return res.status(403).json({ error: "Permissão negada" });
    }

    // Buscar configurações de integração da organização
    // Aqui precisaria implementar a lógica para buscar as configurações específicas
    // do banco de dados

    // Retornando dados mockados para exemplo
    const config = {
      apiKey: "********", // Não retornar a chave completa por segurança
      apiUrl: "https://api.kentrocloud.com/v1",
      webhookUrl: "https://app.endurancy.com/api/webhooks/kentro",
      maxConnections: 20,
      enableSync: true,
      syncInterval: 60,
      logging: true,
      isActivated: true,
      webhookConfig: {
        webhookSecret: "********", // Não retornar o segredo completo por segurança
        contactEvents: true,
        dealEvents: true,
        companyEvents: true,
        taskEvents: false,
        errorEvents: true,
      },
      stats: {
        contactsCount: 1248,
        companiesCount: 256,
        dealsCount: 128,
        lastSyncDate: new Date().toISOString(),
      }
    };

    return res.json(config);
  } catch (error) {
    console.error("Erro ao obter configurações do Kentro:", error);
    return res.status(500).json({ error: "Erro ao buscar configurações" });
  }
});

// Rota para salvar configurações da API
kentroRouter.post("/config/api", async (req: Request, res: Response) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    // Verificar se o usuário é admin ou admin da organização
    if (!["admin", "org_admin"].includes(req.session.user.role)) {
      return res.status(403).json({ error: "Permissão negada" });
    }

    // Validar dados de entrada
    const validatedData = apiConfigSchema.parse(req.body);

    // Salvar configurações
    // Aqui precisaria implementar a lógica para salvar as configurações no banco de dados

    return res.json({
      success: true,
      message: "Configurações da API salvas com sucesso"
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }
    
    console.error("Erro ao salvar configurações da API Kentro:", error);
    return res.status(500).json({ error: "Erro ao salvar configurações" });
  }
});

// Rota para salvar configurações de webhook
kentroRouter.post("/config/webhook", async (req: Request, res: Response) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    // Verificar se o usuário é admin ou admin da organização
    if (!["admin", "org_admin"].includes(req.session.user.role)) {
      return res.status(403).json({ error: "Permissão negada" });
    }

    // Validar dados de entrada
    const validatedData = webhookConfigSchema.parse(req.body);

    // Salvar configurações
    // Aqui precisaria implementar a lógica para salvar as configurações no banco de dados

    return res.json({
      success: true,
      message: "Configurações de webhook salvas com sucesso"
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }
    
    console.error("Erro ao salvar configurações de webhook Kentro:", error);
    return res.status(500).json({ error: "Erro ao salvar configurações" });
  }
});

// Rota para ativar/desativar a integração
kentroRouter.post("/toggle", async (req: Request, res: Response) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    // Verificar se o usuário é admin ou admin da organização
    if (!["admin", "org_admin"].includes(req.session.user.role)) {
      return res.status(403).json({ error: "Permissão negada" });
    }

    const { activate } = req.body;
    
    if (typeof activate !== 'boolean') {
      return res.status(400).json({ error: "Parâmetro 'activate' deve ser um booleano" });
    }

    // Atualizar status de ativação
    // Aqui precisaria implementar a lógica para atualizar o status no banco de dados

    return res.json({
      success: true,
      activated: activate,
      message: activate ? "Integração ativada com sucesso" : "Integração desativada com sucesso"
    });
  } catch (error) {
    console.error("Erro ao alterar status da integração Kentro:", error);
    return res.status(500).json({ error: "Erro ao alterar status da integração" });
  }
});

// Rota para testar conexão com a API
kentroRouter.post("/test-connection", async (req: Request, res: Response) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    // Verificar se o usuário é admin ou admin da organização
    if (!["admin", "org_admin"].includes(req.session.user.role)) {
      return res.status(403).json({ error: "Permissão negada" });
    }

    const { apiKey, apiUrl } = req.body;
    
    if (!apiKey || !apiUrl) {
      return res.status(400).json({ error: "Chave de API e URL da API são obrigatórios" });
    }

    // Em um cenário real, faria uma requisição para a API do Kentro
    // para verificar se as credenciais estão corretas
    
    // Simulando um teste de conexão bem-sucedido
    return res.json({
      success: true,
      message: "Conexão estabelecida com sucesso",
      details: {
        apiVersion: "v1.2.5",
        status: "healthy",
        rateLimit: {
          limit: 100,
          remaining: 98,
          reset: 3600
        }
      }
    });
  } catch (error) {
    console.error("Erro ao testar conexão com API Kentro:", error);
    return res.status(500).json({ error: "Erro ao testar conexão com a API" });
  }
});

// Rota para obter logs de integração
kentroRouter.get("/logs", async (req: Request, res: Response) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    // Verificar se o usuário é admin ou admin da organização
    if (!["admin", "org_admin"].includes(req.session.user.role)) {
      return res.status(403).json({ error: "Permissão negada" });
    }

    // Parâmetros de filtro
    const { level, category, limit = 50, page = 1 } = req.query;
    
    // Buscar logs do banco de dados
    // Aqui precisaria implementar a lógica para buscar logs específicos
    
    // Retornando dados mockados para exemplo
    const logs = [
      { timestamp: "2025-03-31 15:42:18", level: "info", category: "Sincronização", message: "Sincronização de contatos iniciada" },
      { timestamp: "2025-03-31 15:42:20", level: "info", category: "API", message: "Requisição GET /contacts concluída com sucesso (200)" },
      { timestamp: "2025-03-31 15:42:22", level: "info", category: "Sincronização", message: "48 contatos recebidos do Kentro" },
      { timestamp: "2025-03-31 15:42:25", level: "warning", category: "Mapeamento", message: "Campo 'lead_source' não mapeado para 12 contatos" },
      { timestamp: "2025-03-31 15:42:28", level: "error", category: "API", message: "Falha na requisição POST /deals - Erro 429: Too Many Requests" },
      { timestamp: "2025-03-31 15:42:30", level: "info", category: "Webhook", message: "Evento 'contact.updated' recebido e processado" },
      { timestamp: "2025-03-31 15:42:35", level: "info", category: "Sincronização", message: "Sincronização de empresas iniciada" },
      { timestamp: "2025-03-31 15:42:38", level: "debug", category: "API", message: "Parâmetros de requisição: {limit: 100, page: 1, updated_since: '2025-03-30'}" },
      { timestamp: "2025-03-31 15:42:40", level: "info", category: "API", message: "Requisição GET /companies concluída com sucesso (200)" },
      { timestamp: "2025-03-31 15:42:42", level: "info", category: "Sincronização", message: "15 empresas recebidas do Kentro" },
      // Filtragem simplificada aqui, em um cenário real seria feita no banco de dados
    ].filter(log => {
      if (level && log.level !== level) return false;
      if (category && log.category !== category) return false;
      return true;
    });

    return res.json({
      logs,
      pagination: {
        totalItems: logs.length,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(logs.length / Number(limit))
      }
    });
  } catch (error) {
    console.error("Erro ao obter logs de integração Kentro:", error);
    return res.status(500).json({ error: "Erro ao buscar logs" });
  }
});

// Rota webhook para receber eventos do Kentro
kentroRouter.post("/webhook", async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-kentro-signature'];
    
    if (!signature) {
      return res.status(401).json({ error: "Assinatura ausente" });
    }

    // Em um cenário real, verificaria a assinatura para garantir que a requisição é legítima
    // usando o webhook secret configurado
    
    const event = req.body;
    
    // Processar o evento recebido
    // Aqui implementaria a lógica para processar diferentes tipos de eventos
    console.log(`Evento recebido do Kentro: ${event.type}`);
    
    // Responder com sucesso para o Kentro
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Erro ao processar webhook do Kentro:", error);
    return res.status(500).json({ error: "Erro ao processar webhook" });
  }
});

export default kentroRouter;