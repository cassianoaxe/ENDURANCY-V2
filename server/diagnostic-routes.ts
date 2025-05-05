import express from 'express';
import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * Módulo especial para rotas de diagnóstico que precisam ser montadas
 * DEPOIS de todas as rotas da API, mas ANTES do middleware do Vite
 * para garantir que não sejam interceptadas pelo Vite.
 */

const router = express.Router();

// Rota para verificar se o sistema está respondendo
router.get('/status', (req, res) => {
  console.log('Acessando rota de diagnóstico /api-diagnostic/status');
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    service: 'API Server',
    status: 'online'
  });
});

// Rota para verificar a conexão com o banco de dados
router.get('/db-check', async (req, res) => {
  try {
    console.log('Testando conexão com banco de dados');
    
    // Executar uma consulta simples
    const result = await db.execute(sql`SELECT 1 as test`);
    
    res.json({
      success: true,
      message: 'Conexão com banco de dados bem-sucedida',
      timestamp: new Date().toISOString(),
      dbResult: result
    });
  } catch (error) {
    console.error('Erro ao testar conexão com banco de dados:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao testar conexão com banco de dados',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Rota para testar autenticação da sessão
router.get('/session-check', (req, res) => {
  console.log('Verificando dados da sessão');
  
  try {
    // Verificar se a sessão existe
    const hasSession = !!req.session;
    
    // Dados da sessão (se existir)
    const sessionData = req.session ? {
      id: req.session.id,
      cookie: req.session.cookie,
      user: req.session.user,
      authenticated: req.isAuthenticated?.() || false,
      supplier: req.session.supplier,
      supplierId: req.session.supplierId
    } : null;
    
    res.json({
      success: true,
      hasSession,
      sessionData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar sessão',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Rota para testar acesso aos fornecedores
router.get('/supplier-check', async (req, res) => {
  console.log('Verificando acesso à tabela de fornecedores');
  
  try {
    // Executar uma consulta simples para contar fornecedores
    const result = await db.execute(sql`SELECT COUNT(*) as total FROM suppliers`);
    
    // Tentar buscar o fornecedor com ID 2 (que sabemos que existe)
    const supplierResult = await db.execute(sql`SELECT id, name, email, status FROM suppliers WHERE id = 2`);
    
    res.json({
      success: true,
      message: 'Consulta de fornecedores bem-sucedida',
      timestamp: new Date().toISOString(),
      supplierCount: result,
      supplierData: supplierResult
    });
  } catch (error) {
    console.error('Erro ao acessar fornecedores:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao acessar fornecedores',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

export function registerDiagnosticRoutes(app: express.Express) {
  // Montar as rotas em um prefixo especial que não será capturado pelo Vite
  app.use('/api-diagnostic', router);
  console.log('Rotas de diagnóstico especiais registradas em /api-diagnostic');
}