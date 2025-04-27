/**
 * mcpClient.js
 * 
 * Este arquivo implementa o cliente MCP (Multi-Context Processing) que se conecta
 * a servidores MCP locais e remotos, gerenciando a comunicação entre diferentes
 * contextos e fontes de dados.
 */

import OpenAI from 'openai';
import axios from 'axios';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Configuração do cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class MCPClient {
  constructor() {
    // Configuração dos servidores MCP
    this.servers = {
      localA: process.env.MCP_LOCAL_SERVER_A,
      localB: process.env.MCP_LOCAL_SERVER_B,
      remote: process.env.MCP_REMOTE_API
    };

    // Configuração das fontes de dados locais
    this.dataSources = {
      localA: process.env.LOCAL_DATA_SOURCE_A,
      localB: process.env.LOCAL_DATA_SOURCE_B
    };

    // Configuração da API remota
    this.remoteApi = {
      endpoint: process.env.REMOTE_API_ENDPOINT,
      key: process.env.REMOTE_API_KEY
    };

    console.log('MCP Client inicializado com sucesso!');
    console.log(`Servidores conectados: ${Object.keys(this.servers).length}`);
    console.log(`Fontes de dados locais: ${Object.keys(this.dataSources).length}`);
  }

  /**
   * Conecta-se a um servidor MCP específico
   * @param {string} serverKey - Chave do servidor (localA, localB, remote)
   * @returns {boolean} - Status da conexão
   */
  async connectToServer(serverKey) {
    if (!this.servers[serverKey]) {
      console.error(`Servidor não encontrado: ${serverKey}`);
      return false;
    }

    try {
      console.log(`Conectando ao servidor MCP: ${this.servers[serverKey]}`);
      
      // Simulação de conexão com o servidor MCP
      // Em um caso real, aqui seria implementada a lógica específica do protocolo MCP
      const response = await axios.get(`${this.servers[serverKey]}/health`, {
        timeout: 5000
      });
      
      console.log(`Conexão estabelecida com o servidor ${serverKey}`);
      return response.status === 200;
    } catch (error) {
      console.error(`Erro ao conectar ao servidor ${serverKey}:`, error.message);
      return false;
    }
  }

  /**
   * Processa uma consulta através do MCP usando OpenAI
   * @param {string} query - Consulta do usuário
   * @param {object} options - Opções para processamento (fontes de dados a usar, etc)
   * @returns {object} - Resposta processada
   */
  async processQuery(query, options = {}) {
    console.log(`Processando consulta MCP: "${query}"`);
    
    try {
      // Coletando dados do contexto de diferentes fontes, se especificado nas opções
      const contextData = await this.gatherContextData(options);
      
      // Processando a consulta com o modelo de IA com contexto aumentado
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // o modelo mais recente da OpenAI é "gpt-4o" que foi lançado em 13 de maio de 2024
        messages: [
          { 
            role: "system", 
            content: "Você é um assistente de processamento multi-contexto que analisa informações de múltiplas fontes para fornecer respostas abrangentes." 
          },
          ...this.formatContextAsMessages(contextData),
          { role: "user", content: query }
        ],
        temperature: 0.7,
      });
      
      return {
        response: completion.choices[0].message.content,
        sources: this.summarizeSources(contextData),
        processingDetails: {
          model: "gpt-4o",
          tokensUsed: completion.usage?.total_tokens || 0,
          dataSources: Object.keys(contextData)
        }
      };
    } catch (error) {
      console.error('Erro ao processar consulta MCP:', error.message);
      throw new Error(`Falha no processamento MCP: ${error.message}`);
    }
  }

  /**
   * Coleta dados de contexto de múltiplas fontes
   * @param {object} options - Opções especificando quais fontes de dados usar
   * @returns {object} - Dados de contexto coletados
   */
  async gatherContextData(options) {
    const contextData = {};
    
    try {
      // Coletando dados de fontes locais se especificado
      if (options.useLocalA !== false) {
        contextData.localA = await this.fetchLocalData('localA');
      }
      
      if (options.useLocalB !== false) {
        contextData.localB = await this.fetchLocalData('localB');
      }
      
      // Coletando dados de API remota se especificado
      if (options.useRemoteApi !== false) {
        contextData.remoteApi = await this.fetchRemoteData(options.remoteParams);
      }
      
      return contextData;
    } catch (error) {
      console.error('Erro ao coletar dados de contexto:', error.message);
      return contextData; // Retorne o que conseguiu obter mesmo com erros
    }
  }

  /**
   * Busca dados de uma fonte local
   * @param {string} sourceKey - Chave da fonte de dados (localA, localB)
   * @returns {object} - Dados obtidos
   */
  async fetchLocalData(sourceKey) {
    if (!this.dataSources[sourceKey]) {
      console.error(`Fonte de dados não encontrada: ${sourceKey}`);
      return null;
    }
    
    try {
      console.log(`Buscando dados da fonte local: ${this.dataSources[sourceKey]}`);
      
      // Simulação de busca de dados local
      // Em uma implementação real, isso pode ser uma consulta a um banco de dados,
      // leitura de arquivos, ou outra fonte local
      const response = await axios.get(this.dataSources[sourceKey], {
        timeout: 3000
      });
      
      console.log(`Dados obtidos com sucesso da fonte ${sourceKey}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar dados da fonte ${sourceKey}:`, error.message);
      
      // Se não conseguir conectar, simule alguns dados
      // Este é apenas para fins de demonstração - em produção, trataria o erro adequadamente
      return {
        error: true,
        message: `Não foi possível obter dados da fonte ${sourceKey}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Busca dados de uma API remota
   * @param {object} params - Parâmetros para a consulta da API
   * @returns {object} - Dados obtidos
   */
  async fetchRemoteData(params = {}) {
    try {
      console.log(`Buscando dados da API remota: ${this.remoteApi.endpoint}`);
      
      // Configurando a requisição com autenticação
      const config = {
        headers: {
          'Authorization': `Bearer ${this.remoteApi.key}`,
          'Content-Type': 'application/json'
        },
        params: params,
        timeout: 5000
      };
      
      const response = await axios.get(this.remoteApi.endpoint, config);
      
      console.log('Dados remotos obtidos com sucesso');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados remotos:', error.message);
      
      // Se não conseguir conectar, simule alguns dados
      // Este é apenas para fins de demonstração - em produção, trataria o erro adequadamente
      return {
        error: true,
        message: 'Não foi possível obter dados da API remota',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Formata os dados de contexto como mensagens para o modelo de IA
   * @param {object} contextData - Dados de contexto coletados
   * @returns {array} - Array de mensagens formatadas
   */
  formatContextAsMessages(contextData) {
    const messages = [];
    
    // Adiciona cada fonte de dados como uma mensagem separada
    Object.entries(contextData).forEach(([source, data]) => {
      if (data) {
        messages.push({
          role: "system",
          content: `Contexto da fonte "${source}": ${JSON.stringify(data)}`
        });
      }
    });
    
    return messages;
  }

  /**
   * Cria um resumo das fontes de dados utilizadas
   * @param {object} contextData - Dados de contexto coletados
   * @returns {array} - Resumo das fontes
   */
  summarizeSources(contextData) {
    return Object.entries(contextData).map(([source, data]) => {
      // Verifica se os dados têm um erro
      const hasError = data && data.error === true;
      
      return {
        name: source,
        status: hasError ? 'error' : 'success',
        timestamp: data?.timestamp || new Date().toISOString()
      };
    });
  }
}

export { MCPClient };