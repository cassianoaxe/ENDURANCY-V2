/**
 * routes-supplier-auth.ts
 * 
 * Este arquivo implementa a integração entre o sistema de autenticação geral
 * e o sistema específico de fornecedores.
 */

import { Request, Response, NextFunction } from "express";
import { bridgeSupplierAuth } from './auth-bridge';
import { pool } from './db';

/**
 * Middleware para verificar a autenticação do fornecedor
 */
export async function verifySupplierAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Aplicar o middleware de ponte para tentar converter usuário logado em fornecedor
    await bridgeSupplierAuth(req, res, () => {
      // Verificar se alguma das condições de autenticação foi satisfeita
      if (!req.session?.supplierId && !req.session?.supplier && !(req.session?.user?.role === 'supplier')) {
        console.log("Fornecedor não autenticado - nenhuma sessão encontrada");
        return res.status(401).json({
          success: false,
          error: "Não autenticado",
          message: "Faça login como fornecedor para continuar"
        });
      }

      // Continuar com a próxima etapa
      next();
    });
  } catch (error) {
    console.error("Erro ao verificar autenticação do fornecedor:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
      message: "Erro ao verificar autenticação do fornecedor"
    });
  }
}

/**
 * Rota para obter os dados do fornecedor autenticado
 */
export async function getSupplierMe(req: Request, res: Response) {
  try {
    console.log("Acessando rota /me para obter dados do fornecedor autenticado");

    // Obter ID do fornecedor da sessão
    const supplierId = req.session?.supplierId;
    
    if (!supplierId) {
      console.log("ID do fornecedor inválido ou não encontrado na sessão");
      return res.status(401).json({
        success: false,
        error: "Sessão inválida",
        message: "ID do fornecedor não encontrado na sessão"
      });
    }
    
    // Buscar dados do fornecedor no banco de dados
    const result = await pool.query(`
      SELECT 
        id, name, email, phone, description, status, 
        created_at, updated_at, logo, website, trading_name, 
        cnpj, address, city, state, zip_code,
        contact_name, contact_email, contact_phone,
        verified, rating, rating_count
      FROM suppliers 
      WHERE id = $1
    `, [supplierId]);
    
    if (!result.rows || result.rows.length === 0) {
      console.log("Fornecedor não encontrado com ID:", supplierId);
      return res.status(404).json({
        success: false,
        error: "Fornecedor não encontrado",
        message: "Não foi possível encontrar seus dados. Por favor, contate o suporte."
      });
    }
    
    const supplier = result.rows[0];
    
    // Retornar dados do fornecedor sem expor informações sensíveis
    res.json({
      success: true,
      data: {
        id: supplier.id,
        name: supplier.name,
        tradingName: supplier.trading_name || supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        description: supplier.description,
        status: supplier.status,
        logo: supplier.logo,
        website: supplier.website,
        cnpj: supplier.cnpj,
        address: supplier.address,
        city: supplier.city,
        state: supplier.state,
        zipCode: supplier.zip_code,
        contactName: supplier.contact_name,
        contactEmail: supplier.contact_email,
        contactPhone: supplier.contact_phone,
        verified: supplier.verified,
        rating: supplier.rating,
        ratingCount: supplier.rating_count,
        createdAt: supplier.created_at,
        updatedAt: supplier.updated_at
      }
    });
  } catch (error) {
    console.error("Erro ao buscar dados do fornecedor:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno",
      message: "Não foi possível recuperar os dados do fornecedor"
    });
  }
}

/**
 * Rota de login específica para fornecedores
 */
export async function loginSupplier(req: Request, res: Response) {
  try {
    console.log("Tentativa de login específico de fornecedor");
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Dados inválidos",
        message: "E-mail e senha são obrigatórios"
      });
    }
    
    // Buscar fornecedor pelo email
    const result = await pool.query('SELECT id, name, email, password_hash FROM suppliers WHERE email = $1', [email]);
    
    if (!result.rows || result.rows.length === 0) {
      console.log("Fornecedor não encontrado para o email:", email);
      return res.status(401).json({
        success: false,
        error: "Não autorizado",
        message: "Credenciais inválidas"
      });
    }
    
    const supplier = result.rows[0];
    
    // Para fins de simplificação do teste, comparamos a senha diretamente com password_hash
    // Em produção, você deve usar bcrypt para comparar senhas
    if (supplier.password_hash !== password) {
      console.log("Senha inválida para o fornecedor:", email);
      return res.status(401).json({
        success: false,
        error: "Não autorizado",
        message: "Credenciais inválidas"
      });
    }
    
    // Armazenar dados na sessão
    req.session.supplierId = supplier.id;
    req.session.supplier = {
      id: supplier.id,
      name: supplier.name,
      email: supplier.email,
      role: 'supplier'
    };
    
    // Responder com sucesso
    return res.status(200).json({
      success: true,
      message: "Login realizado com sucesso",
      data: {
        id: supplier.id,
        name: supplier.name,
        email: supplier.email
      }
    });
  } catch (error) {
    console.error("Erro no login de fornecedor:", error);
    return res.status(500).json({
      success: false,
      error: "Erro interno",
      message: "Erro ao processar login de fornecedor"
    });
  }
}

/**
 * Configurar as rotas de autenticação do fornecedor
 */
export function setupSupplierAuthRoutes(app: any) {
  // Rota para obter dados do fornecedor autenticado
  app.get("/api/suppliers/me", verifySupplierAuth, getSupplierMe);
  
  // Rota para login específico de fornecedor
  app.post("/api/suppliers/login", loginSupplier);
  
  // Logout específico para fornecedor
  app.post("/api/suppliers/logout", (req: Request, res: Response) => {
    if (req.session) {
      // Limpar apenas os dados do fornecedor, mantendo usuário se existir
      delete req.session.supplierId;
      delete req.session.supplier;
      
      return res.status(200).json({
        success: true,
        message: "Logout de fornecedor realizado com sucesso"
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Não havia sessão de fornecedor para encerrar"
    });
  });
  
  console.log("Rotas de autenticação de fornecedor configuradas");
}