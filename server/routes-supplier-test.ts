import express from 'express';
import { db } from './db';
import { sql } from 'drizzle-orm';

// Criar um novo router para testes
const router = express.Router();

// Interface simplificada para fornecedores
interface Supplier {
  id: number;
  name: string;
  email: string;
  status?: string;
  created_at?: Date;
}

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

// Rota para listar todos os fornecedores
router.get("/suppliers", async (req, res) => {
  try {
    // Consulta direta via SQL para evitar problemas com ORM
    const queryResult = await db.execute(
      sql`SELECT id, name, email, status, created_at FROM suppliers ORDER BY id LIMIT 100`
    );
    
    console.log('Resultado da consulta SQL para LISTAR fornecedores:', 
      JSON.stringify({
        rowCount: queryResult.rowCount,
        rowsLength: queryResult.rows?.length || 0,
        hasRows: Array.isArray(queryResult.rows)
      }, null, 2)
    );
    
    // Extrair e converter dados
    const suppliers: Supplier[] = queryResult.rows?.map(row => ({
      id: row.id as number,
      name: row.name as string,
      email: row.email as string,
      status: row.status as string,
      created_at: row.created_at ? new Date(row.created_at as string) : undefined
    })) || [];
    
    res.json({
      success: true,
      message: "Lista de fornecedores obtida com sucesso",
      count: suppliers.length,
      data: suppliers,
      queryInfo: {
        rowCount: queryResult?.rowCount || 0,
        hasRows: Array.isArray(queryResult?.rows),
        rowsLength: queryResult?.rows?.length || 0
      }
    });
  } catch (error) {
    console.error('Erro ao listar fornecedores:', error);
    res.status(500).json({
      success: false,
      error: "Erro ao listar fornecedores",
      message: error instanceof Error ? error.message : "Erro desconhecido"
    });
  }
});

// Rota para testar a autenticação seguida de acesso à rota original /api/suppliers/me
router.get("/test-auth-and-original-me", async (req, res) => {
  try {
    if (!req.session) {
      return res.status(401).json({
        success: false,
        error: "Sessão não iniciada",
        message: "Não existe sessão ativa"
      });
    }
    
    // Configurar manualmente uma sessão de teste com o fornecedor ID 2 que sabemos que existe
    req.session.supplier = {
      id: 2, // Usar ID 2 que existe no banco
      name: "Fornecedor Teste 2",
      email: "teste2@fornecedor.com",
      role: "supplier"
    };
    
    // Adicionar também o ID diretamente na sessão
    req.session.supplierId = 2;
    
    // Salvar a sessão
    await new Promise<void>((resolve, reject) => {
      req.session.save(err => {
        if (err) {
          console.error("Erro ao salvar sessão:", err);
          reject(err);
        } else {
          console.log("Sessão salva com sucesso para teste");
          resolve();
        }
      });
    });
    
    // Fazer uma requisição HTTP para a rota original /api/suppliers/me
    try {
      const axios = await import('axios');
      
      console.log("Usando session ID:", req.sessionID);
      console.log("Session completa:", req.session);
      
      const response = await axios.default.get('http://localhost:5000/api/suppliers/me', {
        headers: {
          Cookie: `connect.sid=${req.sessionID}`
        }
      });
      
      res.json({
        success: true,
        message: "Autenticação simulada e acesso à rota original /api/suppliers/me bem-sucedido",
        sessionData: {
          supplier: req.session.supplier,
          supplierId: req.session.supplierId,
          sessionID: req.sessionID
        },
        originalRouteResponse: response.data
      });
    } catch (apiError: any) {
      console.error("Erro ao acessar rota original /api/suppliers/me:", apiError.message);
      
      // Capturar detalhes do erro para diagnóstico
      let errorDetails = {
        message: apiError.message
      };
      
      // Capturar resposta do servidor se disponível
      if (apiError.response) {
        errorDetails = {
          ...errorDetails,
          status: apiError.response.status,
          statusText: apiError.response.statusText,
          data: apiError.response.data
        };
      }
      
      return res.status(500).json({
        success: false,
        error: "Erro ao acessar rota original /api/suppliers/me",
        message: apiError.message,
        details: errorDetails,
        sessionData: {
          supplier: req.session.supplier,
          supplierId: req.session.supplierId,
          sessionID: req.sessionID
        }
      });
    }
  } catch (error) {
    console.error("Erro ao testar autenticação + original /me:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao testar autenticação",
      message: error instanceof Error ? error.message : "Erro desconhecido"
    });
  }
});

// Rota para testar a autenticação seguida de obtenção de dados do fornecedor
router.get("/test-auth-and-me", async (req, res) => {
  try {
    if (!req.session) {
      return res.status(401).json({
        success: false,
        error: "Sessão não iniciada",
        message: "Não existe sessão ativa"
      });
    }
    
    // Configurar manualmente uma sessão de teste com o fornecedor ID 2 que sabemos que existe
    req.session.supplier = {
      id: 2, // Usar ID 2 que existe no banco
      name: "Fornecedor Teste 2",
      email: "teste2@fornecedor.com",
      role: "supplier"
    };
    
    // Adicionar também o ID diretamente na sessão
    req.session.supplierId = 2;
    
    // Salvar a sessão
    await new Promise<void>((resolve, reject) => {
      req.session.save(err => {
        if (err) {
          console.error("Erro ao salvar sessão:", err);
          reject(err);
        } else {
          console.log("Sessão salva com sucesso para teste");
          resolve();
        }
      });
    });
    
    // Fazer uma solicitação para a rota /me para verificar se conseguimos obter os dados do fornecedor
    const { pool } = await import('./db');
    const result = await pool.query('SELECT id, name, trading_name as "tradingName", email, phone, contact_name as "contactName", logo, status, verified, description FROM suppliers WHERE id = $1', [2]);
    
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Fornecedor não encontrado na verificação"
      });
    }
    
    const supplier = result.rows[0];
    
    res.json({
      success: true,
      message: "Autenticação simulada e dados do fornecedor obtidos com sucesso",
      sessionData: {
        supplier: req.session.supplier,
        supplierId: req.session.supplierId,
        sessionID: req.sessionID
      },
      supplierData: supplier
    });
  } catch (error) {
    console.error("Erro ao testar autenticação + /me:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao testar autenticação",
      message: error instanceof Error ? error.message : "Erro desconhecido"
    });
  }
});

// Rota para testar a autenticação de um fornecedor específico
router.get("/test-auth", async (req, res) => {
  try {
    if (!req.session) {
      return res.status(401).json({
        success: false,
        error: "Sessão não iniciada",
        message: "Não existe sessão ativa"
      });
    }
    
    // Configurar manualmente uma sessão de teste com o fornecedor ID 2 que sabemos que existe
    req.session.supplier = {
      id: 2, // Usar ID 2 que existe no banco
      name: "Fornecedor Teste 2",
      email: "teste2@fornecedor.com",
      role: "supplier"
    };
    
    // Adicionar também o ID diretamente na sessão
    req.session.supplierId = 2;
    
    // Forçar salvamento da sessão
    await new Promise<void>((resolve, reject) => {
      req.session.save(err => {
        if (err) {
          console.error("Erro ao salvar sessão:", err);
          reject(err);
        } else {
          console.log("Sessão salva com sucesso para teste");
          resolve();
        }
      });
    });
    
    res.json({
      success: true,
      message: "Autenticação de fornecedor simulada com sucesso",
      sessionData: {
        supplier: req.session.supplier,
        supplierId: req.session.supplierId,
        sessionID: req.sessionID
      }
    });
  } catch (error) {
    console.error("Erro ao testar autenticação:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao testar autenticação",
      message: error instanceof Error ? error.message : "Erro desconhecido"
    });
  }
});

export function registerSupplierTestRoutes(app: express.Express) {
  app.use("/api/supplier-test", router);
  console.log("Rotas de teste para fornecedores registradas com sucesso");
}