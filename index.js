/**
 * index.js
 * 
 * Arquivo principal do cliente MCP (Multi-Context Processing) da OpenAI.
 * Este arquivo inicia o cliente MCP e demonstra diferentes cenários de comunicação
 * através do protocolo MCP.
 */

import { MCPClient } from './mcpClient.js';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Banner de início
console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║       CLIENTE MCP OPENAI - DEMONSTRAÇÃO           ║
║                                                   ║
║   Multi-Context Processing para integração de     ║
║   dados locais e remotos com processamento de IA  ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
`);

// Inicializa o cliente MCP
const mcpClient = new MCPClient();

/**
 * Função principal que executa demonstrações de processamento MCP
 */
async function main() {
  try {
    console.log('\n[INICIANDO DEMONSTRAÇÕES MCP]\n');
    
    // Verificando conexão com servidores MCP
    await testServerConnections();
    
    // Demonstração 1: Host local → Servidor MCP → Fonte de dados local A
    await demoLocalDataSourceA();
    
    // Demonstração 2: Host local → Servidor MCP → Fonte de dados local B
    await demoLocalDataSourceB();
    
    // Demonstração 3: Host local → Servidor MCP → Ambas fontes locais
    await demoMultipleLocalSources();
    
    // Demonstração 4: Host local → Servidor MCP → Serviço remoto (API Web)
    await demoRemoteAPI();
    
    // Demonstração 5: Host local → Servidor MCP → Combinação de todas fontes
    await demoFullIntegration();
    
    console.log('\n[DEMONSTRAÇÕES MCP CONCLUÍDAS]\n');
    
  } catch (error) {
    console.error('\n❌ ERRO DURANTE EXECUÇÃO:', error.message);
  }
}

/**
 * Testa conexões com os servidores MCP configurados
 */
async function testServerConnections() {
  console.log('\n📡 Testando conexões com servidores MCP...');
  
  // Tentar conectar ao servidor local A
  const localAConnected = await mcpClient.connectToServer('localA');
  console.log(`Servidor Local A: ${localAConnected ? '✅ Conectado' : '❌ Falha na conexão'}`);
  
  // Tentar conectar ao servidor local B
  const localBConnected = await mcpClient.connectToServer('localB');
  console.log(`Servidor Local B: ${localBConnected ? '✅ Conectado' : '❌ Falha na conexão'}`);
  
  // Tentar conectar ao servidor remoto
  const remoteConnected = await mcpClient.connectToServer('remote');
  console.log(`Servidor Remoto: ${remoteConnected ? '✅ Conectado' : '❌ Falha na conexão'}`);
  
  console.log('\nObservação: Para uma demonstração completa, serão simuladas conexões mesmo se os servidores estiverem indisponíveis.\n');
}

/**
 * Demonstração 1: Processando dados da fonte local A
 */
async function demoLocalDataSourceA() {
  console.log('\n🔄 DEMONSTRAÇÃO 1: Host local → Servidor MCP → Fonte de dados local A');
  
  try {
    // Consulta usando apenas fonte de dados local A
    const result = await mcpClient.processQuery(
      "Analise os dados do sistema local A e resuma as informações principais",
      { useLocalB: false, useRemoteApi: false }
    );
    
    // Exibindo resultados
    console.log('\n📊 Resultado da análise:');
    console.log('-'.repeat(50));
    console.log(result.response);
    console.log('-'.repeat(50));
    console.log('Fontes utilizadas:', result.sources);
    console.log('Tokens usados:', result.processingDetails.tokensUsed);
    
  } catch (error) {
    console.error('❌ Erro na Demonstração 1:', error.message);
  }
}

/**
 * Demonstração 2: Processando dados da fonte local B
 */
async function demoLocalDataSourceB() {
  console.log('\n🔄 DEMONSTRAÇÃO 2: Host local → Servidor MCP → Fonte de dados local B');
  
  try {
    // Consulta usando apenas fonte de dados local B
    const result = await mcpClient.processQuery(
      "Avalie os dados do sistema local B e identifique padrões relevantes",
      { useLocalA: false, useRemoteApi: false }
    );
    
    // Exibindo resultados
    console.log('\n📊 Resultado da análise:');
    console.log('-'.repeat(50));
    console.log(result.response);
    console.log('-'.repeat(50));
    console.log('Fontes utilizadas:', result.sources);
    console.log('Tokens usados:', result.processingDetails.tokensUsed);
    
  } catch (error) {
    console.error('❌ Erro na Demonstração 2:', error.message);
  }
}

/**
 * Demonstração 3: Processando dados de múltiplas fontes locais
 */
async function demoMultipleLocalSources() {
  console.log('\n🔄 DEMONSTRAÇÃO 3: Host local → Servidor MCP → Múltiplas fontes locais (A + B)');
  
  try {
    // Consulta usando ambas as fontes de dados locais
    const result = await mcpClient.processQuery(
      "Compare os dados dos sistemas locais A e B, e identifique discrepâncias ou complementaridades",
      { useRemoteApi: false }
    );
    
    // Exibindo resultados
    console.log('\n📊 Resultado da análise comparativa:');
    console.log('-'.repeat(50));
    console.log(result.response);
    console.log('-'.repeat(50));
    console.log('Fontes utilizadas:', result.sources);
    console.log('Tokens usados:', result.processingDetails.tokensUsed);
    
  } catch (error) {
    console.error('❌ Erro na Demonstração 3:', error.message);
  }
}

/**
 * Demonstração 4: Processando dados de uma API remota
 */
async function demoRemoteAPI() {
  console.log('\n🔄 DEMONSTRAÇÃO 4: Host local → Servidor MCP → Serviço remoto (API Web)');
  
  try {
    // Consulta usando apenas a API remota
    const result = await mcpClient.processQuery(
      "Analise os dados da API remota e forneça insights sobre as tendências atuais",
      { 
        useLocalA: false, 
        useLocalB: false,
        remoteParams: { limit: 5, sort: 'recent' } // Parâmetros específicos para a API
      }
    );
    
    // Exibindo resultados
    console.log('\n📊 Resultado da análise de dados remotos:');
    console.log('-'.repeat(50));
    console.log(result.response);
    console.log('-'.repeat(50));
    console.log('Fontes utilizadas:', result.sources);
    console.log('Tokens usados:', result.processingDetails.tokensUsed);
    
  } catch (error) {
    console.error('❌ Erro na Demonstração 4:', error.message);
  }
}

/**
 * Demonstração 5: Processando dados de todas as fontes integradas
 */
async function demoFullIntegration() {
  console.log('\n🔄 DEMONSTRAÇÃO 5: Host local → Servidor MCP → Integração completa (Local A + Local B + API Remota)');
  
  try {
    // Consulta completa usando todas as fontes de dados disponíveis
    const result = await mcpClient.processQuery(
      "Integre os dados dos sistemas locais A e B com informações da API remota para uma análise holística. " +
      "Identifique padrões, correlações e insights que só seriam visíveis com a combinação de todas essas fontes.",
      { 
        remoteParams: { limit: 10, include_details: true } 
      }
    );
    
    // Exibindo resultados
    console.log('\n📊 Resultado da análise integrada:');
    console.log('-'.repeat(50));
    console.log(result.response);
    console.log('-'.repeat(50));
    console.log('Fontes utilizadas:', result.sources);
    console.log('Dados processados de:', result.processingDetails.dataSources);
    console.log('Tokens usados:', result.processingDetails.tokensUsed);
    
  } catch (error) {
    console.error('❌ Erro na Demonstração 5:', error.message);
  }
}

// Executa a função principal
main().then(() => {
  console.log('Programa finalizado!');
}).catch(error => {
  console.error('Erro fatal:', error);
  process.exit(1);
});