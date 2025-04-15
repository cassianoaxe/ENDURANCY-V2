/**
 * Este arquivo contém a implementação da integração com a API WAHA para WhatsApp
 * Documentação: https://waha.devlike.pro/docs/integrations/javascript/
 */

const axios = require('axios');
const express = require('express');

/**
 * Classe para interagir com a API WAHA para WhatsApp
 */
class WahaWhatsAppAPI {
  constructor(apiUrl, apiKey, instanceName) {
    this.apiUrl = apiUrl || 'https://api.waha.devlike.pro';
    this.apiKey = apiKey;
    this.instanceName = instanceName || 'default';
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };
  }

  /**
   * Inicia uma sessão no WhatsApp e retorna o QR code para escaneamento
   * @returns {Promise<string>} URL da imagem do QR code
   */
  async startSession() {
    try {
      const response = await axios.post(
        `${this.apiUrl}/sessions/start`, 
        { name: this.instanceName },
        { headers: this.headers }
      );
      
      if (response.data && response.data.qrcode) {
        return response.data.qrcode;
      }
      
      throw new Error('QR code não gerado');
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error);
      throw error;
    }
  }

  /**
   * Verifica o status da sessão
   * @returns {Promise<string>} Status da sessão
   */
  async checkSessionStatus() {
    try {
      const response = await axios.get(
        `${this.apiUrl}/sessions/status/${this.instanceName}`,
        { headers: this.headers }
      );
      
      return response.data.status;
    } catch (error) {
      console.error('Erro ao verificar status da sessão:', error);
      throw error;
    }
  }

  /**
   * Envia uma mensagem de texto pelo WhatsApp
   * @param {string} to Número de telefone no formato internacional (com @ e sufixo .us)
   * @param {string} text Texto da mensagem
   * @returns {Promise<object>} Resposta da API
   */
  async sendTextMessage(to, text) {
    try {
      // Se o número não estiver no formato correto, tentamos formatá-lo
      if (!to.includes('@')) {
        // Remove caracteres não numéricos e adiciona sufixo para formato WAHA
        to = to.replace(/\D/g, '') + '@c.us';
      }
      
      const data = {
        session: this.instanceName,
        chatId: to,
        text: text
      };
      
      const response = await axios.post(
        `${this.apiUrl}/api/sendText`,
        data,
        { headers: this.headers }
      );
      
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  /**
   * Envia uma mensagem com arquivo (imagem, documento, etc)
   * @param {string} to Número do destinatário
   * @param {string} fileUrl URL do arquivo
   * @param {string} caption Legenda do arquivo (opcional)
   * @param {string} type Tipo de mídia: image, document, video, audio
   * @returns {Promise<object>} Resposta da API
   */
  async sendFileMessage(to, fileUrl, caption = '', type = 'image') {
    try {
      if (!to.includes('@')) {
        to = to.replace(/\D/g, '') + '@c.us';
      }
      
      const data = {
        session: this.instanceName,
        chatId: to,
        body: fileUrl,
        caption: caption,
        type: type
      };
      
      const endpoint = {
        'image': 'sendImage',
        'document': 'sendFile',
        'video': 'sendVideo',
        'audio': 'sendAudio'
      }[type] || 'sendFile';
      
      const response = await axios.post(
        `${this.apiUrl}/api/${endpoint}`,
        data,
        { headers: this.headers }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Erro ao enviar ${type}:`, error);
      throw error;
    }
  }

  /**
   * Encerra a sessão do WhatsApp
   * @returns {Promise<object>} Resposta da API
   */
  async logout() {
    try {
      const response = await axios.post(
        `${this.apiUrl}/sessions/stop/${this.instanceName}`,
        {},
        { headers: this.headers }
      );
      
      return response.data;
    } catch (error) {
      console.error('Erro ao encerrar sessão:', error);
      throw error;
    }
  }
}

/**
 * Configura a rota de webhook para receber mensagens da API WAHA
 * @param {object} app Express app
 * @param {function} messageHandler Função que processa as mensagens recebidas
 */
function setupWahaWebhook(app, messageHandler) {
  app.post("/api/webhooks/whatsapp", express.json(), (req, res) => {
    const data = req.body;
    
    // Log para debug
    console.log("Webhook WhatsApp recebido:", JSON.stringify(data));
    
    // Verifica se é uma mensagem
    if (data.event === "message") {
      try {
        // Chama o handler passando os dados da mensagem
        messageHandler(data.payload);
        res.status(200).send("OK");
      } catch (error) {
        console.error("Erro ao processar mensagem:", error);
        res.status(500).send("Erro ao processar mensagem");
      }
    } else {
      // Outros eventos como status de conexão, etc
      console.log(`Evento ${data.event} recebido:`, data);
      res.status(200).send("OK");
    }
  });
  
  console.log("Webhook WAHA configurado em /api/webhooks/whatsapp");
}

/**
 * Exemplo de processador de mensagens
 * @param {object} message Mensagem recebida
 */
function exampleMessageProcessor(message) {
  // Extrai informações da mensagem
  const { from, body, fromMe, type } = message;
  
  console.log(`Nova mensagem ${fromMe ? 'enviada' : 'recebida'}: ${body}`);
  
  // Lógica para processar a mensagem de acordo com o tipo
  if (!fromMe && type === 'chat') {
    // Exemplo: salvar no banco de dados, notificar usuários, etc
    
    // Exemplo: respostas automáticas baseadas em palavras-chave
    if (body.toLowerCase().includes('preço') || body.toLowerCase().includes('valor')) {
      // Aqui você poderia enviar uma resposta automática
      // wahaApi.sendTextMessage(from, "Para informações sobre preços, acesse: https://...");
    }
  }
}

// Exportando a classe e funções
module.exports = {
  WahaWhatsAppAPI,
  setupWahaWebhook,
  exampleMessageProcessor
};