import { Router } from "express";
import axios from "axios";
import { db } from "../../../db";
import { organizations } from "@shared/schema";
import { eq } from "drizzle-orm";

const melhorEnvioRouter = Router();

interface MelhorEnvioCredentials {
  clientId: string;
  clientSecret: string;
  accessToken: string;
  environment: 'sandbox' | 'production';
}

// Obter credenciais do Melhor Envio para uma organização
const getMelhorEnvioCredentials = async (organizationId: number): Promise<MelhorEnvioCredentials | null> => {
  try {
    // Aqui você buscaria as credenciais da organização no banco de dados
    // Esta é uma implementação de exemplo
    const [organization] = await db.select({
      id: organizations.id,
      name: organizations.name,
      // Aqui seriam os campos específicos da integração com o Melhor Envio
      // melhorEnvioClientId: organizations.melhorEnvioClientId,
      // melhorEnvioClientSecret: organizations.melhorEnvioClientSecret,
      // melhorEnvioAccessToken: organizations.melhorEnvioAccessToken,
      // melhorEnvioEnvironment: organizations.melhorEnvioEnvironment,
    })
    .from(organizations)
    .where(eq(organizations.id, organizationId));

    if (!organization) {
      return null;
    }

    // Credenciais de exemplo para desenvolvimento
    return {
      clientId: "me_client_id_123456",
      clientSecret: "me_client_secret_abcdef",
      accessToken: "me_access_token_example_12345",
      environment: "sandbox"
    };
  } catch (error) {
    console.error("Erro ao obter credenciais do Melhor Envio:", error);
    return null;
  }
};

// Base URL da API do Melhor Envio
const getMelhorEnvioApiBaseUrl = (environment: 'sandbox' | 'production'): string => {
  return environment === 'production'
    ? 'https://api.melhorenvio.com.br/v2'
    : 'https://sandbox.melhorenvio.com.br/v2';
};

// Rota para calcular frete
melhorEnvioRouter.post("/calculate", async (req, res) => {
  try {
    if (!req.session?.user?.id) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const organizationId = req.body.organizationId || req.session.user.organizationId;
    
    if (!organizationId) {
      return res.status(400).json({ error: "ID da organização não informado" });
    }

    const credentials = await getMelhorEnvioCredentials(organizationId);
    
    if (!credentials) {
      return res.status(404).json({ error: "Credenciais do Melhor Envio não encontradas" });
    }

    const { accessToken } = credentials;
    const baseUrl = getMelhorEnvioApiBaseUrl(credentials.environment);

    const response = await axios.post(
      `${baseUrl}/me/shipment/calculate`, 
      req.body.shipmentData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Erro ao calcular frete:", error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: "Erro ao calcular frete",
      details: error.response?.data || error.message
    });
  }
});

// Rota para gerar etiqueta de envio
melhorEnvioRouter.post("/generate-tag", async (req, res) => {
  try {
    if (!req.session?.user?.id) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const organizationId = req.body.organizationId || req.session.user.organizationId;
    
    if (!organizationId) {
      return res.status(400).json({ error: "ID da organização não informado" });
    }

    const credentials = await getMelhorEnvioCredentials(organizationId);
    
    if (!credentials) {
      return res.status(404).json({ error: "Credenciais do Melhor Envio não encontradas" });
    }

    const { accessToken } = credentials;
    const baseUrl = getMelhorEnvioApiBaseUrl(credentials.environment);

    // 1. Criar o carinho de compras (cart)
    const cartResponse = await axios.post(
      `${baseUrl}/me/cart`, 
      req.body.orderData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    // 2. Comprar a etiqueta
    const purchaseResponse = await axios.post(
      `${baseUrl}/me/shipment/checkout`, 
      { orders: [cartResponse.data.id] },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    // 3. Gerar etiqueta
    const tagResponse = await axios.post(
      `${baseUrl}/me/shipment/generate`, 
      { orders: [purchaseResponse.data.id] },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    return res.status(200).json(tagResponse.data);
  } catch (error: any) {
    console.error("Erro ao gerar etiqueta:", error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: "Erro ao gerar etiqueta",
      details: error.response?.data || error.message
    });
  }
});

// Rota para rastrear envio
melhorEnvioRouter.get("/track/:trackingCode", async (req, res) => {
  try {
    if (!req.session?.user?.id) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const organizationId = req.query.organizationId as string || req.session.user.organizationId;
    
    if (!organizationId) {
      return res.status(400).json({ error: "ID da organização não informado" });
    }

    const credentials = await getMelhorEnvioCredentials(Number(organizationId));
    
    if (!credentials) {
      return res.status(404).json({ error: "Credenciais do Melhor Envio não encontradas" });
    }

    const { accessToken } = credentials;
    const baseUrl = getMelhorEnvioApiBaseUrl(credentials.environment);
    const trackingCode = req.params.trackingCode;

    const response = await axios.get(
      `${baseUrl}/me/shipment/tracking/${trackingCode}`, 
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Erro ao rastrear envio:", error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: "Erro ao rastrear envio",
      details: error.response?.data || error.message
    });
  }
});

// Rota para obter transportadoras disponíveis
melhorEnvioRouter.get("/companies", async (req, res) => {
  try {
    if (!req.session?.user?.id) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const organizationId = req.query.organizationId as string || req.session.user.organizationId;
    
    if (!organizationId) {
      return res.status(400).json({ error: "ID da organização não informado" });
    }

    const credentials = await getMelhorEnvioCredentials(Number(organizationId));
    
    if (!credentials) {
      return res.status(404).json({ error: "Credenciais do Melhor Envio não encontradas" });
    }

    const { accessToken } = credentials;
    const baseUrl = getMelhorEnvioApiBaseUrl(credentials.environment);

    const response = await axios.get(
      `${baseUrl}/me/shipment/companies`, 
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Erro ao buscar transportadoras:", error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: "Erro ao buscar transportadoras",
      details: error.response?.data || error.message
    });
  }
});

// Rota para cancelar uma etiqueta
melhorEnvioRouter.post("/cancel/:orderId", async (req, res) => {
  try {
    if (!req.session?.user?.id) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const organizationId = req.body.organizationId || req.session.user.organizationId;
    
    if (!organizationId) {
      return res.status(400).json({ error: "ID da organização não informado" });
    }

    const credentials = await getMelhorEnvioCredentials(organizationId);
    
    if (!credentials) {
      return res.status(404).json({ error: "Credenciais do Melhor Envio não encontradas" });
    }

    const { accessToken } = credentials;
    const baseUrl = getMelhorEnvioApiBaseUrl(credentials.environment);
    const orderId = req.params.orderId;

    const response = await axios.post(
      `${baseUrl}/me/shipment/cancel`, 
      { orders: [orderId] },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Erro ao cancelar etiqueta:", error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: "Erro ao cancelar etiqueta",
      details: error.response?.data || error.message
    });
  }
});

// Webhook para receber notificações do Melhor Envio
melhorEnvioRouter.post("/webhook", async (req, res) => {
  try {
    console.log("Webhook do Melhor Envio recebido:", JSON.stringify(req.body));
    
    // Processar o evento de acordo com o tipo
    // Implementar lógica aqui para atualizar status de envios, etc.
    
    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("Erro ao processar webhook do Melhor Envio:", error);
    return res.status(500).json({ error: "Erro ao processar webhook" });
  }
});

export default melhorEnvioRouter;