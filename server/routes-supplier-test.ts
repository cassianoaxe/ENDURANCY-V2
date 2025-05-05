import express from 'express';
import { db } from './db';
import { sql } from 'drizzle-orm';

// Criar um novo router para testes
const router = express.Router();

// Rota para teste básico sem banco de dados - apenas retorna dados estáticos
router.get("/hello", (req, res) => {
  res.json({
    success: true,
    message: "API de teste de fornecedores funcionando",
    timestamp: new Date().toISOString(),
    data: {
      id: 1,
      name: "Teste Diagnóstico",
      version: "1.0.0"
    }
  });
});

// Rota para testar a sessão atual
router.get("/session", (req, res) => {
  try {
    // Retornamos apenas informações seguras da sessão
    res.json({
      success: true,
      hasSession: req.session ? true : false,
      sessionID: req.sessionID || null,
      cookie: req.session?.cookie ? {
        maxAge: req.session.cookie.maxAge,
        expires: req.session.cookie.expires,
        secure: req.session.cookie.secure,
        httpOnly: req.session.cookie.httpOnly
      } : null,
      supplier: req.session?.supplier ? {
        id: req.session.supplier.id,
        // Não incluir outras informações sensíveis aqui
        hasSupplier: true
      } : null,
      supplierIdProperty: req.session?.supplierId || null
    });
  } catch (error) {
    console.error('Erro ao obter dados da sessão:', error);
    res.status(500).json({
      success: false,
      error: "Erro ao obter dados da sessão",
      message: error instanceof Error ? error.message : "Erro desconhecido"
    });
  }
});

// Rota para testar conexão com banco de dados
router.get("/db-test", async (req, res) => {
  try {
    // Executar uma consulta simples no banco de dados
    const startTime = Date.now();
    const result = await db.execute(sql`SELECT NOW() as server_time`);
    const endTime = Date.now();
    
    res.json({
      success: true,
      message: "Conexão com banco de dados OK",
      timeTaken: `${endTime - startTime}ms`,
      dbServerTime: result[0]?.server_time || null
    });
  } catch (error) {
    console.error('Erro ao testar conexão com banco de dados:', error);
    res.status(500).json({
      success: false,
      error: "Erro ao testar conexão com banco de dados",
      message: error instanceof Error ? error.message : "Erro desconhecido"
    });
  }
});

// Rota para testar busca de fornecedor por ID diretamente via SQL
router.get("/supplier/:id", async (req, res) => {
  try {
    const supplierId = parseInt(req.params.id, 10);
    
    if (isNaN(supplierId)) {
      return res.status(400).json({
        success: false,
        error: "ID de fornecedor inválido",
        message: "O ID do fornecedor deve ser um número"
      });
    }
    
    // Consulta direta via SQL para evitar problemas com ORM
    const queryResult = await db.execute(
      sql`SELECT id, name, email, status, created_at FROM suppliers WHERE id = ${supplierId}`
    );
    
    console.log('Resultado da consulta SQL para fornecedor:', JSON.stringify(queryResult, null, 2));
    
    // Verificar se há linhas no resultado
    if (!queryResult || !queryResult.rows || queryResult.rows.length === 0 || queryResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Fornecedor não encontrado",
        message: `Não foi encontrado fornecedor com ID ${supplierId}`,
        queryInfo: {
          rowCount: queryResult?.rowCount || 0,
          hasRows: Array.isArray(queryResult?.rows),
          rowsLength: queryResult?.rows?.length || 0
        }
      });
    }
    
    // Usar os dados da maneira correta
    const firstRow = queryResult.rows && queryResult.rows.length > 0 ? queryResult.rows[0] : null;
    
    res.json({
      success: true,
      message: "Fornecedor encontrado com SQL direto",
      data: firstRow,
      rawResult: {
        rowCount: queryResult.rowCount,
        rows: queryResult.rows || []
      }
    });
  } catch (error) {
    console.error(`Erro ao buscar fornecedor por ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: "Erro ao buscar fornecedor",
      message: error instanceof Error ? error.message : "Erro desconhecido"
    });
  }
});

export function registerSupplierTestRoutes(app: express.Express) {
  app.use("/api/supplier-test", router);
  console.log("Rotas de teste para fornecedores registradas com sucesso");
}