/**
 * auth-bridge.ts
 * 
 * Este arquivo serve como uma ponte entre os diferentes sistemas de autenticação 
 * da aplicação: o sistema geral de autenticação e o sistema específico para fornecedores.
 * 
 * Ele resolve situações em que um usuário é autenticado via sistema geral com role="supplier"
 * mas precisa ser reconhecido pelo sistema específico de fornecedores.
 */

import { Request, Response, NextFunction } from "express";
import { pool } from "./db";

/**
 * Middleware que verifica se um usuário autenticado via sistema principal
 * com papel 'supplier' pode ser associado a um fornecedor existente pelo email.
 * 
 * Adiciona o ID do fornecedor à sessão para uso posterior pelo sistema de fornecedores.
 */
export async function bridgeSupplierAuth(req: Request, res: Response, next: NextFunction) {
  try {
    console.log("[AUTH-BRIDGE] Verificando ponte de autenticação para fornecedor");
    
    // Se já existe um ID de fornecedor na sessão, não precisamos fazer nada
    if (req.session?.supplierId) {
      console.log("[AUTH-BRIDGE] ID do fornecedor já existe na sessão:", req.session.supplierId);
      return next();
    }
    
    // Se o usuário está autenticado pelo sistema principal como 'supplier'
    if (req.session?.user && req.session.user.role === 'supplier') {
      console.log("[AUTH-BRIDGE] Usuário autenticado como 'supplier' no sistema principal");
      const email = req.session.user.email;
      
      if (!email) {
        console.log("[AUTH-BRIDGE] Usuário não possui email, não é possível fazer a ponte");
        return next();
      }
      
      // Buscar fornecedor com este email
      try {
        console.log("[AUTH-BRIDGE] Buscando fornecedor pelo email:", email);
        const result = await pool.query('SELECT id, name, email, status FROM suppliers WHERE email = $1', [email]);
        
        if (result.rows && result.rows.length > 0) {
          const supplier = result.rows[0];
          console.log("[AUTH-BRIDGE] Fornecedor encontrado:", supplier);
          
          // Armazenar ID do fornecedor na sessão
          req.session.supplierId = supplier.id;
          console.log("[AUTH-BRIDGE] ID do fornecedor armazenado na sessão:", supplier.id);
        } else {
          console.log("[AUTH-BRIDGE] Nenhum fornecedor encontrado com o email:", email);
        }
      } catch (dbError) {
        console.error("[AUTH-BRIDGE] Erro ao buscar fornecedor pelo email:", dbError);
      }
    }
    
    // Continuar com o fluxo normal
    next();
  } catch (error) {
    console.error("[AUTH-BRIDGE] Erro ao tentar fazer ponte de autenticação:", error);
    next();
  }
}

/**
 * Middleware que verifica se um usuário tem autenticação de fornecedor válida,
 * seja pelo sistema de fornecedores ou pelo sistema principal com papel 'supplier'.
 */
export async function ensureSupplierAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Aplicar o middleware de ponte primeiro
    await bridgeSupplierAuth(req, res, () => {
      // Verificar se há alguma forma de autenticação de fornecedor
      if (!req.session?.supplierId && !req.session?.supplier && !(req.session?.user?.role === 'supplier')) {
        console.log("[AUTH-BRIDGE] Fornecedor não autenticado");
        return res.status(401).json({
          success: false,
          error: "Não autenticado",
          message: "Faça login como fornecedor para continuar"
        });
      }
      
      // Se chegou aqui, o fornecedor está autenticado de alguma forma
      next();
    });
  } catch (error) {
    console.error("[AUTH-BRIDGE] Erro ao verificar autenticação de fornecedor:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
      message: "Erro ao verificar autenticação de fornecedor"
    });
  }
}