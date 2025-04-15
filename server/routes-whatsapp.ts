/**
 * Rotas para integração com WhatsApp via WAHA API
 */

import { Express, Request, Response } from 'express';
import { authenticate } from './routes';
// Importando da versão TypeScript do módulo
import { WahaWhatsAppAPI, setupWahaWebhook } from './waha-whatsapp';

// Armazena instâncias da API WAHA por organização
const wahaInstances: Record<number, WahaWhatsAppAPI> = {};

// Função para obter ou criar uma instância WAHA para uma organização
function getWahaInstance(organizationId: number, apiUrl?: string, apiKey?: string, instanceName?: string): WahaWhatsAppAPI {
  if (!wahaInstances[organizationId]) {
    wahaInstances[organizationId] = new WahaWhatsAppAPI(
      apiUrl,
      apiKey,
      instanceName || `org-${organizationId}`
    );
  }
  
  return wahaInstances[organizationId];
}

// Processador de mensagens recebidas
function processIncomingMessage(message: any, organizationId: number) {
  console.log(`[Org ${organizationId}] Nova mensagem recebida:`, message);
  
  // Aqui você implementaria a lógica para processar as mensagens
  // Por exemplo: salvar no banco de dados, gerar respostas automáticas, etc.
  
  // Exemplo de resposta automática simples (não implementado)
  /*
  const { from, body } = message;
  const wahaApi = getWahaInstance(organizationId);
  
  if (body.toLowerCase().includes('horário') || body.toLowerCase().includes('atendimento')) {
    wahaApi.sendTextMessage(from, "Nosso horário de atendimento é de segunda a sexta, das 8h às 18h.");
  }
  */
}

export function registerWhatsAppRoutes(app: Express) {
  // Configurar webhook para receber mensagens da API WAHA
  setupWahaWebhook(app, (message: any) => {
    // Precisamos identificar a qual organização esta mensagem pertence
    // Normalmente isso seria feito pelo número de telefone ou pelo ID da instância
    // Para esse exemplo, estamos assumindo que está nos metadados da mensagem
    const organizationId = message.organizationId || 1; // Fallback para organização padrão
    
    processIncomingMessage(message, organizationId);
  });
  
  // Rota para iniciar uma sessão WhatsApp (gerar QR code)
  app.post('/api/whatsapp/session/start', authenticate, async (req: Request, res: Response) => {
    try {
      const { apiUrl, apiKey, instanceName } = req.body;
      const organizationId = req.session?.user?.organizationId || 1;
      
      if (!apiKey) {
        return res.status(400).json({ error: 'Chave da API WAHA não informada' });
      }
      
      const wahaApi = getWahaInstance(
        organizationId,
        apiUrl,
        apiKey,
        instanceName || `org-${organizationId}`
      );
      
      const qrCode = await wahaApi.startSession();
      
      res.json({ success: true, qrCode });
    } catch (error: any) {
      console.error('Erro ao iniciar sessão WhatsApp:', error);
      res.status(500).json({ 
        error: 'Erro ao iniciar sessão WhatsApp', 
        message: error.message 
      });
    }
  });
  
  // Rota para verificar status da sessão
  app.get('/api/whatsapp/session/status', authenticate, async (req: Request, res: Response) => {
    try {
      const organizationId = req.session?.user?.organizationId || 1;
      
      if (!wahaInstances[organizationId]) {
        return res.status(404).json({ error: 'Sessão não encontrada para esta organização' });
      }
      
      const status = await wahaInstances[organizationId].checkSessionStatus();
      
      res.json({ success: true, status });
    } catch (error: any) {
      console.error('Erro ao verificar status da sessão WhatsApp:', error);
      res.status(500).json({ 
        error: 'Erro ao verificar status da sessão WhatsApp', 
        message: error.message 
      });
    }
  });
  
  // Rota para enviar mensagem de texto
  app.post('/api/whatsapp/send', authenticate, async (req: Request, res: Response) => {
    try {
      const { to, text } = req.body;
      const organizationId = req.session?.user?.organizationId || 1;
      
      if (!wahaInstances[organizationId]) {
        return res.status(404).json({ error: 'Sessão não encontrada para esta organização' });
      }
      
      if (!to || !text) {
        return res.status(400).json({ error: 'Destinatário e texto são obrigatórios' });
      }
      
      const result = await wahaInstances[organizationId].sendTextMessage(to, text);
      
      res.json({ success: true, messageId: result.id });
    } catch (error: any) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      res.status(500).json({ 
        error: 'Erro ao enviar mensagem WhatsApp', 
        message: error.message 
      });
    }
  });
  
  // Rota para enviar arquivo (imagem, documento, etc)
  app.post('/api/whatsapp/send-file', authenticate, async (req: Request, res: Response) => {
    try {
      const { to, fileUrl, caption, type } = req.body;
      const organizationId = req.session?.user?.organizationId || 1;
      
      if (!wahaInstances[organizationId]) {
        return res.status(404).json({ error: 'Sessão não encontrada para esta organização' });
      }
      
      if (!to || !fileUrl) {
        return res.status(400).json({ error: 'Destinatário e URL do arquivo são obrigatórios' });
      }
      
      const result = await wahaInstances[organizationId].sendFileMessage(to, fileUrl, caption, type);
      
      res.json({ success: true, messageId: result.id });
    } catch (error: any) {
      console.error('Erro ao enviar arquivo via WhatsApp:', error);
      res.status(500).json({ 
        error: 'Erro ao enviar arquivo via WhatsApp', 
        message: error.message 
      });
    }
  });
  
  // Rota para encerrar sessão
  app.post('/api/whatsapp/session/stop', authenticate, async (req: Request, res: Response) => {
    try {
      const organizationId = req.session?.user?.organizationId || 1;
      
      if (!wahaInstances[organizationId]) {
        return res.status(404).json({ error: 'Sessão não encontrada para esta organização' });
      }
      
      const result = await wahaInstances[organizationId].logout();
      
      // Remove a instância do cache
      delete wahaInstances[organizationId];
      
      res.json({ success: true, message: 'Sessão encerrada com sucesso' });
    } catch (error: any) {
      console.error('Erro ao encerrar sessão WhatsApp:', error);
      res.status(500).json({ 
        error: 'Erro ao encerrar sessão WhatsApp', 
        message: error.message 
      });
    }
  });
  
  console.log('Rotas WhatsApp registradas com sucesso');
}