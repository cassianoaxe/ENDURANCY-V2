import { Router, Request, Response } from "express";
import { db } from "../../db";
import { z } from "zod";

const zoopRouter = Router();

// Tipo para configurações da Zoop
const zoopConfigSchema = z.object({
  apiKey: z.string().min(1, "Chave da API é obrigatória"),
  marketplaceId: z.string().min(1, "ID do Marketplace é obrigatório"),
  sellerId: z.string().min(1, "ID do Vendedor é obrigatório"),
  environment: z.enum(["sandbox", "production"], {
    required_error: "Ambiente é obrigatório",
  }),
  webhookToken: z.string().min(1, "Token do webhook é obrigatório"),
  notificationUrl: z.string().url("URL de notificação inválida"),
  isActive: z.boolean().default(true),
});

const webhookConfigSchema = z.object({
  enabled: z.boolean().default(true),
  transactionCreated: z.boolean().default(true),
  transactionPaid: z.boolean().default(true),
  transactionFailed: z.boolean().default(true),
  transactionCanceled: z.boolean().default(true),
  subscriptionCreated: z.boolean().default(true),
  subscriptionUpdated: z.boolean().default(true),
  subscriptionCanceled: z.boolean().default(true),
  splitCreated: z.boolean().default(false),
  splitSettled: z.boolean().default(false),
});

const splitConfigSchema = z.object({
  enabled: z.boolean().default(false),
  percentage: z.number().min(0).max(100).default(0),
  fixedAmount: z.number().min(0).default(0),
  recipientId: z.string().optional(),
});

/**
 * Middleware de autenticação para as rotas da Zoop 
 * Toda rota abaixo deste middleware requer autenticação
 */
zoopRouter.use((req: Request, res: Response, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({
      error: "Não autorizado. É necessário estar autenticado para acessar esta API."
    });
  }

  // Se o usuário não for admin ou admin da organização, negar acesso
  if (req.user && req.user.role !== 'admin' && req.user.role !== 'org_admin') {
    return res.status(403).json({
      error: "Acesso negado. É necessário ser administrador para gerenciar integrações."
    });
  }

  next();
});

// Rota para obter a configuração atual da Zoop
zoopRouter.get("/config", async (req: Request, res: Response) => {
  try {
    // Verificar se existe configuração para a organização do usuário
    // Em uma implementação real, buscaríamos os dados na tabela de configurações
    const organizationId = req.user?.organizationId;
    
    // Dados de exemplo para demonstração
    const mockConfig = {
      apiKey: "zp_test_**********",
      marketplaceId: "3249875634895728937",
      sellerId: "0923847509234875",
      environment: "sandbox",
      webhookToken: "6a7f8d9e0c1b2a3f4d5e6a7f8d9e0c1b",
      notificationUrl: `${req.protocol}://${req.get('host')}/api/integrations/pagamentos/zoop/webhook`,
      isActive: true,
      webhooks: {
        enabled: true,
        transactionCreated: true,
        transactionPaid: true,
        transactionFailed: true,
        transactionCanceled: true,
        subscriptionCreated: true,
        subscriptionUpdated: true,
        subscriptionCanceled: true,
        splitCreated: false,
        splitSettled: false
      },
      split: {
        enabled: false,
        percentage: 10,
        fixedAmount: 0,
        recipientId: ""
      }
    };
    
    // Retornar a configuração
    // Em uma implementação real, retornaríamos os dados do banco de dados
    res.json(mockConfig);
  } catch (error) {
    console.error("Erro ao buscar configuração da Zoop:", error);
    res.status(500).json({ error: "Erro ao buscar configuração da Zoop" });
  }
});

// Rota para salvar configuração da API da Zoop
zoopRouter.post("/config", async (req: Request, res: Response) => {
  try {
    // Validar os dados recebidos
    const validatedData = zoopConfigSchema.parse(req.body);
    
    // Em uma implementação real, salvaríamos os dados no banco de dados
    // Exemplo:
    // await db.insert(zoopConfigurations)
    //  .values({
    //    ...validatedData,
    //    organizationId: req.user.organizationId,
    //    updatedAt: new Date()
    //  })
    //  .onConflictDoUpdate({
    //    target: [zoopConfigurations.organizationId],
    //    set: {
    //      ...validatedData,
    //      updatedAt: new Date()
    //    }
    //  });
    
    // Responder com sucesso
    res.status(200).json({
      message: "Configuração da Zoop salva com sucesso",
      config: validatedData
    });
  } catch (error) {
    console.error("Erro ao salvar configuração da Zoop:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Dados inválidos", details: error.errors });
    } else {
      res.status(500).json({ error: "Erro ao salvar configuração da Zoop" });
    }
  }
});

// Rota para salvar configuração de webhooks
zoopRouter.post("/webhooks/config", async (req: Request, res: Response) => {
  try {
    // Validar os dados recebidos
    const validatedData = webhookConfigSchema.parse(req.body);
    
    // Em uma implementação real, salvaríamos os dados no banco de dados
    
    // Responder com sucesso
    res.status(200).json({
      message: "Configuração de webhooks salva com sucesso",
      config: validatedData
    });
  } catch (error) {
    console.error("Erro ao salvar configuração de webhooks:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Dados inválidos", details: error.errors });
    } else {
      res.status(500).json({ error: "Erro ao salvar configuração de webhooks" });
    }
  }
});

// Rota para salvar configuração de split de pagamento
zoopRouter.post("/split/config", async (req: Request, res: Response) => {
  try {
    // Validar os dados recebidos
    const validatedData = splitConfigSchema.parse(req.body);
    
    // Em uma implementação real, salvaríamos os dados no banco de dados
    
    // Responder com sucesso
    res.status(200).json({
      message: "Configuração de split de pagamento salva com sucesso",
      config: validatedData
    });
  } catch (error) {
    console.error("Erro ao salvar configuração de split:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Dados inválidos", details: error.errors });
    } else {
      res.status(500).json({ error: "Erro ao salvar configuração de split" });
    }
  }
});

// Rota para webhook de recebimento de eventos da Zoop
zoopRouter.post("/webhook", async (req: Request, res: Response) => {
  try {
    const event = req.body;
    console.log("Evento recebido da Zoop:", JSON.stringify(event, null, 2));
    
    // Verificar token de autenticação do webhook (deve ser enviado no header)
    const token = req.headers['x-zoop-webhook-token'];
    if (!token) {
      return res.status(401).json({ error: "Token de autenticação não fornecido" });
    }
    
    // Em uma implementação real, verificaríamos o token contra o armazenado no banco
    // E processaríamos o evento de acordo com seu tipo
    
    // Processar o evento de acordo com seu tipo
    switch (event.type) {
      case 'transaction.created':
        // Lógica para transação criada
        break;
      case 'transaction.paid':
        // Lógica para transação paga
        break;
      case 'transaction.failed':
        // Lógica para transação falhou
        break;
      case 'transaction.canceled':
        // Lógica para transação cancelada
        break;
      case 'subscription.created':
        // Lógica para assinatura criada
        break;
      case 'subscription.updated':
        // Lógica para assinatura atualizada
        break;
      case 'subscription.canceled':
        // Lógica para assinatura cancelada
        break;
      case 'split.created':
        // Lógica para split criado
        break;
      case 'split.settled':
        // Lógica para split liquidado
        break;
      default:
        console.warn(`Evento desconhecido recebido: ${event.type}`);
    }
    
    // Responder com sucesso para evitar reenvios
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Erro ao processar webhook da Zoop:", error);
    res.status(500).json({ error: "Erro ao processar webhook" });
  }
});

// Rota para listar transações
zoopRouter.get("/transactions", async (req: Request, res: Response) => {
  try {
    // Em uma implementação real, buscaríamos os dados na API da Zoop
    // ou do nosso banco local sincronizado
    
    // Dados de exemplo para demonstração
    const transactions = [
      {
        id: "a57e1e7bb8d641a1af7d95d1103c5681",
        date: "2025-03-30",
        customer: "Pedro Almeida",
        amount: "R$ 299,90",
        method: "CREDIT",
        status: "PAID",
        dueDate: "2025-03-30",
        description: "Assinatura mensal - Plano Pro"
      },
      {
        id: "b8d64c5751a1af7d95d1103c56817e7b",
        date: "2025-03-29",
        customer: "Fernanda Lima",
        amount: "R$ 120,00",
        method: "PIX",
        status: "PAID",
        dueDate: "2025-03-29",
        description: "Consulta médica - Clínica Bem Estar"
      },
      {
        id: "7d95d1103c5681a57e1e7bb8d641a1af",
        date: "2025-03-28",
        customer: "Ricardo Souza",
        amount: "R$ 149,90",
        method: "BOLETO",
        status: "PENDING",
        dueDate: "2025-04-05",
        description: "Assinatura mensal - Plano Intermediário"
      },
      {
        id: "95d1103c5681a57e1e7bb8d641a1af7d",
        date: "2025-03-27",
        customer: "Juliana Neves",
        amount: "R$ 249,90",
        method: "CREDIT",
        status: "AUTHORIZED",
        dueDate: "2025-03-27",
        description: "Assinatura anual - Plano Básico"
      },
      {
        id: "1e7bb8d641a1af7d95d1103c5681a57e",
        date: "2025-03-26",
        customer: "Gabriel Costa",
        amount: "R$ 99,90",
        method: "BOLETO",
        status: "EXPIRED",
        dueDate: "2025-03-25",
        description: "Assinatura mensal - Plano Básico"
      }
    ];
    
    res.json(transactions);
  } catch (error) {
    console.error("Erro ao listar transações:", error);
    res.status(500).json({ error: "Erro ao listar transações" });
  }
});

// Rota para buscar estatísticas para o dashboard
zoopRouter.get("/dashboard", async (req: Request, res: Response) => {
  try {
    // Em uma implementação real, buscaríamos os dados na API da Zoop
    // ou calcularíamos a partir do nosso banco local sincronizado
    
    // Dados de exemplo para demonstração
    const dashboardData = {
      totalReceived: { positive: true, value: "R$ 9.845,20" },
      totalPending: { positive: false, value: "R$ 2.187,50" },
      successRate: { positive: true, value: "92,3%" },
      transactionCount: "128",
      splitAmount: { positive: true, value: "R$ 1.205,10" },
    };
    
    res.json(dashboardData);
  } catch (error) {
    console.error("Erro ao buscar estatísticas do dashboard:", error);
    res.status(500).json({ error: "Erro ao buscar estatísticas do dashboard" });
  }
});

// Exportar router
export default zoopRouter;