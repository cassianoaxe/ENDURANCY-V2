import { Router } from "express";
import axios from "axios";
import { db } from "../../db";
import { users, organizations } from "@shared/schema";
import { eq } from "drizzle-orm";

const zoopRouter = Router();

interface ZoopCredentials {
  apiKey: string;
  marketplaceId: string;
  sellerId: string;
  environment: 'sandbox' | 'production';
}

// Obter credenciais da Zoop para uma organização
const getZoopCredentials = async (organizationId: number): Promise<ZoopCredentials | null> => {
  try {
    // Aqui você buscaria as credenciais da organização no banco de dados
    // Esta é uma implementação de exemplo
    const [organization] = await db.select({
      id: organizations.id,
      name: organizations.name,
      // Aqui seriam os campos específicos da integração com a Zoop
      // zoopApiKey: organizations.zoopApiKey,
      // zoopMarketplaceId: organizations.zoopMarketplaceId,
      // zoopSellerId: organizations.zoopSellerId,
      // zoopEnvironment: organizations.zoopEnvironment,
    })
    .from(organizations)
    .where(eq(organizations.id, organizationId));

    if (!organization) {
      return null;
    }

    // Credenciais de exemplo para desenvolvimento
    return {
      apiKey: "zpk_test_1234567890abcdef",
      marketplaceId: "123e4567-e89b-12d3-a456-426614174000",
      sellerId: "123e4567-e89b-12d3-a456-426614174001",
      environment: "sandbox"
    };
  } catch (error) {
    console.error("Erro ao obter credenciais da Zoop:", error);
    return null;
  }
};

// Base URL da API da Zoop
const getZoopApiBaseUrl = (environment: 'sandbox' | 'production'): string => {
  return environment === 'production'
    ? 'https://api.zoop.ws/v1'
    : 'https://api.zoop.ws/v1/sandbox';
};

// Rota para criar um comprador (buyer) na Zoop
zoopRouter.post("/buyers", async (req, res) => {
  try {
    if (!req.session?.user?.id) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const organizationId = req.body.organizationId || req.session.user.organizationId;
    
    if (!organizationId) {
      return res.status(400).json({ error: "ID da organização não informado" });
    }

    const credentials = await getZoopCredentials(organizationId);
    
    if (!credentials) {
      return res.status(404).json({ error: "Credenciais da Zoop não encontradas" });
    }

    const { marketplaceId, apiKey } = credentials;
    const baseUrl = getZoopApiBaseUrl(credentials.environment);

    const response = await axios.post(
      `${baseUrl}/marketplaces/${marketplaceId}/buyers`, 
      req.body.buyerData,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(apiKey + ":").toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.status(201).json(response.data);
  } catch (error: any) {
    console.error("Erro ao criar comprador na Zoop:", error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: "Erro ao criar comprador na Zoop",
      details: error.response?.data || error.message
    });
  }
});

// Rota para criar uma transação de cartão de crédito na Zoop
zoopRouter.post("/transactions/credit", async (req, res) => {
  try {
    if (!req.session?.user?.id) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const organizationId = req.body.organizationId || req.session.user.organizationId;
    
    if (!organizationId) {
      return res.status(400).json({ error: "ID da organização não informado" });
    }

    const credentials = await getZoopCredentials(organizationId);
    
    if (!credentials) {
      return res.status(404).json({ error: "Credenciais da Zoop não encontradas" });
    }

    const { marketplaceId, apiKey } = credentials;
    const baseUrl = getZoopApiBaseUrl(credentials.environment);

    // Preparar dados da transação
    const transactionData = {
      ...req.body.transactionData,
      on_behalf_of: credentials.sellerId // ID do vendedor para quem a transação está sendo realizada
    };

    // Adicionar regras de split se especificadas
    if (req.body.splitData) {
      transactionData.split_rules = req.body.splitData;
    }

    const response = await axios.post(
      `${baseUrl}/marketplaces/${marketplaceId}/transactions`, 
      transactionData,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(apiKey + ":").toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.status(201).json(response.data);
  } catch (error: any) {
    console.error("Erro ao criar transação na Zoop:", error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: "Erro ao criar transação na Zoop",
      details: error.response?.data || error.message
    });
  }
});

// Rota para criar um boleto na Zoop
zoopRouter.post("/transactions/boleto", async (req, res) => {
  try {
    if (!req.session?.user?.id) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const organizationId = req.body.organizationId || req.session.user.organizationId;
    
    if (!organizationId) {
      return res.status(400).json({ error: "ID da organização não informado" });
    }

    const credentials = await getZoopCredentials(organizationId);
    
    if (!credentials) {
      return res.status(404).json({ error: "Credenciais da Zoop não encontradas" });
    }

    const { marketplaceId, apiKey } = credentials;
    const baseUrl = getZoopApiBaseUrl(credentials.environment);

    // Preparar dados do boleto
    const boletoData = {
      ...req.body.boletoData,
      payment_type: "boleto",
      on_behalf_of: credentials.sellerId
    };

    // Adicionar regras de split se especificadas
    if (req.body.splitData) {
      boletoData.split_rules = req.body.splitData;
    }

    const response = await axios.post(
      `${baseUrl}/marketplaces/${marketplaceId}/transactions`, 
      boletoData,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(apiKey + ":").toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.status(201).json(response.data);
  } catch (error: any) {
    console.error("Erro ao criar boleto na Zoop:", error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: "Erro ao criar boleto na Zoop",
      details: error.response?.data || error.message
    });
  }
});

// Rota para criar uma transação PIX na Zoop
zoopRouter.post("/transactions/pix", async (req, res) => {
  try {
    if (!req.session?.user?.id) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const organizationId = req.body.organizationId || req.session.user.organizationId;
    
    if (!organizationId) {
      return res.status(400).json({ error: "ID da organização não informado" });
    }

    const credentials = await getZoopCredentials(organizationId);
    
    if (!credentials) {
      return res.status(404).json({ error: "Credenciais da Zoop não encontradas" });
    }

    const { marketplaceId, apiKey } = credentials;
    const baseUrl = getZoopApiBaseUrl(credentials.environment);

    // Preparar dados do PIX
    const pixData = {
      ...req.body.pixData,
      payment_type: "pix",
      on_behalf_of: credentials.sellerId
    };

    // Adicionar regras de split se especificadas
    if (req.body.splitData) {
      pixData.split_rules = req.body.splitData;
    }

    const response = await axios.post(
      `${baseUrl}/marketplaces/${marketplaceId}/transactions`, 
      pixData,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(apiKey + ":").toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.status(201).json(response.data);
  } catch (error: any) {
    console.error("Erro ao criar PIX na Zoop:", error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: "Erro ao criar PIX na Zoop",
      details: error.response?.data || error.message
    });
  }
});

// Rota para verificar status de uma transação
zoopRouter.get("/transactions/:transactionId", async (req, res) => {
  try {
    if (!req.session?.user?.id) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const organizationId = req.query.organizationId as string || req.session.user.organizationId;
    
    if (!organizationId) {
      return res.status(400).json({ error: "ID da organização não informado" });
    }

    const credentials = await getZoopCredentials(Number(organizationId));
    
    if (!credentials) {
      return res.status(404).json({ error: "Credenciais da Zoop não encontradas" });
    }

    const { marketplaceId, apiKey } = credentials;
    const baseUrl = getZoopApiBaseUrl(credentials.environment);
    const transactionId = req.params.transactionId;

    const response = await axios.get(
      `${baseUrl}/marketplaces/${marketplaceId}/transactions/${transactionId}`, 
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(apiKey + ":").toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Erro ao verificar status da transação:", error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: "Erro ao verificar status da transação",
      details: error.response?.data || error.message
    });
  }
});

// Rota para capturar uma transação pré-autorizada
zoopRouter.post("/transactions/:transactionId/capture", async (req, res) => {
  try {
    if (!req.session?.user?.id) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const organizationId = req.body.organizationId || req.session.user.organizationId;
    
    if (!organizationId) {
      return res.status(400).json({ error: "ID da organização não informado" });
    }

    const credentials = await getZoopCredentials(organizationId);
    
    if (!credentials) {
      return res.status(404).json({ error: "Credenciais da Zoop não encontradas" });
    }

    const { marketplaceId, apiKey } = credentials;
    const baseUrl = getZoopApiBaseUrl(credentials.environment);
    const transactionId = req.params.transactionId;

    // Dados para captura (pode incluir valor parcial)
    const captureData = req.body.captureData || {};

    const response = await axios.post(
      `${baseUrl}/marketplaces/${marketplaceId}/transactions/${transactionId}/capture`, 
      captureData,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(apiKey + ":").toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Erro ao capturar transação:", error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: "Erro ao capturar transação",
      details: error.response?.data || error.message
    });
  }
});

// Rota para cancelar/estornar uma transação
zoopRouter.post("/transactions/:transactionId/void", async (req, res) => {
  try {
    if (!req.session?.user?.id) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const organizationId = req.body.organizationId || req.session.user.organizationId;
    
    if (!organizationId) {
      return res.status(400).json({ error: "ID da organização não informado" });
    }

    const credentials = await getZoopCredentials(organizationId);
    
    if (!credentials) {
      return res.status(404).json({ error: "Credenciais da Zoop não encontradas" });
    }

    const { marketplaceId, apiKey } = credentials;
    const baseUrl = getZoopApiBaseUrl(credentials.environment);
    const transactionId = req.params.transactionId;

    // Dados para estorno (pode incluir valor parcial)
    const voidData = req.body.voidData || {};

    const response = await axios.post(
      `${baseUrl}/marketplaces/${marketplaceId}/transactions/${transactionId}/void`, 
      voidData,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(apiKey + ":").toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Erro ao cancelar/estornar transação:", error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: "Erro ao cancelar/estornar transação",
      details: error.response?.data || error.message
    });
  }
});

// Rota para listar transações
zoopRouter.get("/transactions", async (req, res) => {
  try {
    if (!req.session?.user?.id) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const organizationId = req.query.organizationId as string || req.session.user.organizationId;
    
    if (!organizationId) {
      return res.status(400).json({ error: "ID da organização não informado" });
    }

    const credentials = await getZoopCredentials(Number(organizationId));
    
    if (!credentials) {
      return res.status(404).json({ error: "Credenciais da Zoop não encontradas" });
    }

    const { marketplaceId, apiKey, sellerId } = credentials;
    const baseUrl = getZoopApiBaseUrl(credentials.environment);

    // Parâmetros de consulta
    const { 
      limit = '10', 
      offset = '0', 
      date_range, 
      date_created_gte, 
      date_created_lte,
      status
    } = req.query;

    // Construir a URL com os parâmetros
    let url = `${baseUrl}/marketplaces/${marketplaceId}/transactions?limit=${limit}&offset=${offset}&on_behalf_of=${sellerId}`;
    
    if (date_range) url += `&date_range=${date_range}`;
    if (date_created_gte) url += `&date_created_gte=${date_created_gte}`;
    if (date_created_lte) url += `&date_created_lte=${date_created_lte}`;
    if (status) url += `&status=${status}`;

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Basic ${Buffer.from(apiKey + ":").toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Erro ao listar transações:", error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: "Erro ao listar transações",
      details: error.response?.data || error.message
    });
  }
});

// Webhook para receber notificações da Zoop
zoopRouter.post("/webhook", async (req, res) => {
  try {
    console.log("Webhook da Zoop recebido:", JSON.stringify(req.body));
    
    // Verificar a assinatura do webhook (se aplicável)
    // Implementar lógica de verificação do token
    
    // Processar o evento
    const event = req.body;
    
    // Implementar o processamento do evento de acordo com o tipo
    // event.type - Tipo do evento (transaction.created, transaction.paid, etc.)
    // event.data - Dados do evento
    
    // Retornar sucesso para que a Zoop saiba que recebemos o evento
    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("Erro ao processar webhook da Zoop:", error);
    return res.status(500).json({ error: "Erro ao processar webhook" });
  }
});

export default zoopRouter;