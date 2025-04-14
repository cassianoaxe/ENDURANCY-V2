import { Express, Request, Response } from "express";
import { db } from "./db";
import { authenticate } from "./routes";
import { eq, and, or, desc, gte, lte, isNull, sql } from "drizzle-orm";
import { ZodError } from "zod";
import { zodErrorToReadableMessages } from "./utils";
import { format } from 'date-fns';
import { 
  insertContaFinanceiraSchema,
  insertCategoriaFinanceiraSchema,
  insertCentroCustoSchema,
  insertTransacaoFinanceiraSchema,
  insertOrcamentoSchema,
  insertOrcamentoCategoriaSchema,
  insertExtratoBancarioSchema,
  insertExtratoTransacaoSchema,
  contasFinanceirasTable,
  categoriasFinanceirasTable,
  centrosCustoTable,
  transacoesFinanceirasTable,
  orcamentosTable,
  orcamentosCategoriasTable,
  extratosBancariosTable,
  extratoTransacoesTable,
  relatoriosFinanceirosTable,
  statusTransacaoEnum,
} from "../shared/schema-financeiro";

export function registerFinanceiroRoutes(app: Express) {
  /**
   * ===== ROTAS DE CONTAS FINANCEIRAS =====
   */

  // Listar todas as contas financeiras da organização
  app.get('/api/financeiro/contas', authenticate, async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.session.user!;
      
      if (!organizationId) {
        return res.status(403).json({ message: "Acesso negado: organização não disponível" });
      }

      // Parâmetros opcionais de filtro
      const { ativo } = req.query;
      
      let query = db.select().from(contasFinanceirasTable).where(
        eq(contasFinanceirasTable.organizacaoId, organizationId)
      );
      
      // Aplicar filtro de status ativo/inativo se especificado
      if (ativo !== undefined) {
        query = query.where(eq(contasFinanceirasTable.ativo, ativo === 'true' || ativo === '1'));
      }
      
      const contas = await query.orderBy(contasFinanceirasTable.nome);
      
      return res.status(200).json(contas);
    } catch (error) {
      console.error("[Financeiro API] Erro ao listar contas:", error);
      return res.status(500).json({ message: "Erro ao listar contas financeiras", error });
    }
  });

  // Obter detalhes de uma conta específica
  app.get('/api/financeiro/contas/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.session.user!;
      const contaId = parseInt(req.params.id);
      
      if (!organizationId) {
        return res.status(403).json({ message: "Acesso negado: organização não disponível" });
      }
      
      if (isNaN(contaId)) {
        return res.status(400).json({ message: "ID de conta inválido" });
      }
      
      const conta = await db.select().from(contasFinanceirasTable).where(
        and(
          eq(contasFinanceirasTable.id, contaId),
          eq(contasFinanceirasTable.organizacaoId, organizationId)
        )
      ).limit(1);
      
      if (!conta || conta.length === 0) {
        return res.status(404).json({ message: "Conta financeira não encontrada" });
      }
      
      return res.status(200).json(conta[0]);
    } catch (error) {
      console.error("[Financeiro API] Erro ao buscar conta:", error);
      return res.status(500).json({ message: "Erro ao obter detalhes da conta", error });
    }
  });

  // Criar nova conta financeira
  app.post('/api/financeiro/contas', authenticate, async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.session.user!;
      
      if (!organizationId) {
        return res.status(403).json({ message: "Acesso negado: organização não disponível" });
      }
      
      // Validar dados com o schema Zod
      const dadosConta = insertContaFinanceiraSchema.parse({
        ...req.body,
        organizacaoId: organizationId
      });
      
      // Inserir no banco de dados
      const novaConta = await db.insert(contasFinanceirasTable)
        .values(dadosConta)
        .returning();
      
      return res.status(201).json(novaConta[0]);
    } catch (error) {
      console.error("[Financeiro API] Erro ao criar conta:", error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: zodErrorToReadableMessages(error)
        });
      }
      
      return res.status(500).json({ message: "Erro ao criar conta financeira", error });
    }
  });

  // Atualizar conta financeira
  app.put('/api/financeiro/contas/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.session.user!;
      const contaId = parseInt(req.params.id);
      
      if (!organizationId) {
        return res.status(403).json({ message: "Acesso negado: organização não disponível" });
      }
      
      if (isNaN(contaId)) {
        return res.status(400).json({ message: "ID de conta inválido" });
      }
      
      // Verificar se a conta existe e pertence à organização
      const contaExistente = await db.select().from(contasFinanceirasTable).where(
        and(
          eq(contasFinanceirasTable.id, contaId),
          eq(contasFinanceirasTable.organizacaoId, organizationId)
        )
      ).limit(1);
      
      if (!contaExistente || contaExistente.length === 0) {
        return res.status(404).json({ message: "Conta financeira não encontrada" });
      }
      
      // Validar dados com o schema Zod, omitindo campos que não devem ser alterados
      const dadosAtualizacao = insertContaFinanceiraSchema.partial().parse({
        ...req.body,
        organizacaoId: organizationId,
        atualizadoEm: new Date()
      });
      
      // Atualizar no banco de dados
      const contaAtualizada = await db.update(contasFinanceirasTable)
        .set(dadosAtualizacao)
        .where(
          and(
            eq(contasFinanceirasTable.id, contaId),
            eq(contasFinanceirasTable.organizacaoId, organizationId)
          )
        )
        .returning();
      
      return res.status(200).json(contaAtualizada[0]);
    } catch (error) {
      console.error("[Financeiro API] Erro ao atualizar conta:", error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: zodErrorToReadableMessages(error)
        });
      }
      
      return res.status(500).json({ message: "Erro ao atualizar conta financeira", error });
    }
  });

  // Excluir conta financeira (soft delete)
  app.delete('/api/financeiro/contas/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.session.user!;
      const contaId = parseInt(req.params.id);
      
      if (!organizationId) {
        return res.status(403).json({ message: "Acesso negado: organização não disponível" });
      }
      
      if (isNaN(contaId)) {
        return res.status(400).json({ message: "ID de conta inválido" });
      }
      
      // Verificar se há transações utilizando esta conta
      const transacoesRelacionadas = await db.select({ count: sql`count(*)` }).from(transacoesFinanceirasTable).where(
        and(
          eq(transacoesFinanceirasTable.organizacaoId, organizationId),
          or(
            eq(transacoesFinanceirasTable.contaId, contaId),
            eq(transacoesFinanceirasTable.contaDestinoId, contaId)
          )
        )
      );
      
      // Se houver transações, fazer soft delete (marcar como inativa)
      if (transacoesRelacionadas[0].count > 0) {
        const contaAtualizada = await db.update(contasFinanceirasTable)
          .set({ 
            ativo: false,
            atualizadoEm: new Date()
          })
          .where(
            and(
              eq(contasFinanceirasTable.id, contaId),
              eq(contasFinanceirasTable.organizacaoId, organizationId)
            )
          )
          .returning();
        
        if (!contaAtualizada || contaAtualizada.length === 0) {
          return res.status(404).json({ message: "Conta financeira não encontrada" });
        }
        
        return res.status(200).json({ 
          message: "Conta financeira desativada com sucesso. Existem transações associadas a esta conta.", 
          softDelete: true 
        });
      } else {
        // Se não houver transações, excluir permanentemente
        const contaExcluida = await db.delete(contasFinanceirasTable)
          .where(
            and(
              eq(contasFinanceirasTable.id, contaId),
              eq(contasFinanceirasTable.organizacaoId, organizationId)
            )
          )
          .returning();
        
        if (!contaExcluida || contaExcluida.length === 0) {
          return res.status(404).json({ message: "Conta financeira não encontrada" });
        }
        
        return res.status(200).json({ message: "Conta financeira excluída com sucesso" });
      }
    } catch (error) {
      console.error("[Financeiro API] Erro ao excluir conta:", error);
      return res.status(500).json({ message: "Erro ao excluir conta financeira", error });
    }
  });

  /**
   * ===== ROTAS DE CATEGORIAS FINANCEIRAS =====
   */

  // Listar todas as categorias da organização
  app.get('/api/financeiro/categorias', authenticate, async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.session.user!;
      
      if (!organizationId) {
        return res.status(403).json({ message: "Acesso negado: organização não disponível" });
      }

      // Parâmetros opcionais de filtro
      const { ativo, tipo } = req.query;
      
      let query = db.select().from(categoriasFinanceirasTable).where(
        eq(categoriasFinanceirasTable.organizacaoId, organizationId)
      );
      
      // Aplicar filtro de status ativo/inativo se especificado
      if (ativo !== undefined) {
        query = query.where(eq(categoriasFinanceirasTable.ativo, ativo === 'true' || ativo === '1'));
      }
      
      // Aplicar filtro de tipo (receita, despesa, ambos)
      if (tipo && ['receita', 'despesa', 'ambos'].includes(tipo as string)) {
        query = query.where(eq(categoriasFinanceirasTable.tipo, tipo as any));
      }
      
      const categorias = await query.orderBy(categoriasFinanceirasTable.nome);
      
      return res.status(200).json(categorias);
    } catch (error) {
      console.error("[Financeiro API] Erro ao listar categorias:", error);
      return res.status(500).json({ message: "Erro ao listar categorias financeiras", error });
    }
  });

  // Obter detalhes de uma categoria específica
  app.get('/api/financeiro/categorias/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.session.user!;
      const categoriaId = parseInt(req.params.id);
      
      if (!organizationId) {
        return res.status(403).json({ message: "Acesso negado: organização não disponível" });
      }
      
      if (isNaN(categoriaId)) {
        return res.status(400).json({ message: "ID de categoria inválido" });
      }
      
      const categoria = await db.select().from(categoriasFinanceirasTable).where(
        and(
          eq(categoriasFinanceirasTable.id, categoriaId),
          eq(categoriasFinanceirasTable.organizacaoId, organizationId)
        )
      ).limit(1);
      
      if (!categoria || categoria.length === 0) {
        return res.status(404).json({ message: "Categoria financeira não encontrada" });
      }
      
      return res.status(200).json(categoria[0]);
    } catch (error) {
      console.error("[Financeiro API] Erro ao buscar categoria:", error);
      return res.status(500).json({ message: "Erro ao obter detalhes da categoria", error });
    }
  });

  // Criar nova categoria financeira
  app.post('/api/financeiro/categorias', authenticate, async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.session.user!;
      
      if (!organizationId) {
        return res.status(403).json({ message: "Acesso negado: organização não disponível" });
      }
      
      // Validar dados com o schema Zod
      const dadosCategoria = insertCategoriaFinanceiraSchema.parse({
        ...req.body,
        organizacaoId: organizationId
      });
      
      // Verificar categoria pai, se informada
      if (dadosCategoria.categoriaParentId) {
        const categoriaParent = await db.select().from(categoriasFinanceirasTable).where(
          and(
            eq(categoriasFinanceirasTable.id, dadosCategoria.categoriaParentId),
            eq(categoriasFinanceirasTable.organizacaoId, organizationId)
          )
        ).limit(1);
        
        if (!categoriaParent || categoriaParent.length === 0) {
          return res.status(404).json({ message: "Categoria pai não encontrada" });
        }
      }
      
      // Inserir no banco de dados
      const novaCategoria = await db.insert(categoriasFinanceirasTable)
        .values(dadosCategoria)
        .returning();
      
      return res.status(201).json(novaCategoria[0]);
    } catch (error) {
      console.error("[Financeiro API] Erro ao criar categoria:", error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: zodErrorToReadableMessages(error)
        });
      }
      
      return res.status(500).json({ message: "Erro ao criar categoria financeira", error });
    }
  });

  // Atualizar categoria financeira
  app.put('/api/financeiro/categorias/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.session.user!;
      const categoriaId = parseInt(req.params.id);
      
      if (!organizationId) {
        return res.status(403).json({ message: "Acesso negado: organização não disponível" });
      }
      
      if (isNaN(categoriaId)) {
        return res.status(400).json({ message: "ID de categoria inválido" });
      }
      
      // Verificar se a categoria existe e pertence à organização
      const categoriaExistente = await db.select().from(categoriasFinanceirasTable).where(
        and(
          eq(categoriasFinanceirasTable.id, categoriaId),
          eq(categoriasFinanceirasTable.organizacaoId, organizationId)
        )
      ).limit(1);
      
      if (!categoriaExistente || categoriaExistente.length === 0) {
        return res.status(404).json({ message: "Categoria financeira não encontrada" });
      }
      
      // Verificar ciclos na hierarquia de categorias (categoria não pode ser subcategoria dela mesma)
      if (req.body.categoriaParentId && req.body.categoriaParentId !== categoriaExistente[0].categoriaParentId) {
        const novaCategoriaPai = parseInt(req.body.categoriaParentId);
        
        // Verificar se a categoria pai existe
        const categoriaPai = await db.select().from(categoriasFinanceirasTable).where(
          and(
            eq(categoriasFinanceirasTable.id, novaCategoriaPai),
            eq(categoriasFinanceirasTable.organizacaoId, organizationId)
          )
        ).limit(1);
        
        if (!categoriaPai || categoriaPai.length === 0) {
          return res.status(404).json({ message: "Categoria pai não encontrada" });
        }
        
        // Verificar ciclo (categoria não pode ser subcategoria dela mesma)
        if (novaCategoriaPai === categoriaId) {
          return res.status(400).json({ message: "Uma categoria não pode ser subcategoria dela mesma" });
        }
        
        // Verificar ciclos mais profundos (avós, bisavós, etc.)
        let categoriaAtual = categoriaPai[0];
        while (categoriaAtual.categoriaParentId) {
          if (categoriaAtual.categoriaParentId === categoriaId) {
            return res.status(400).json({ message: "Ciclo detectado na hierarquia de categorias" });
          }
          
          const categoriaSuperior = await db.select().from(categoriasFinanceirasTable).where(
            eq(categoriasFinanceirasTable.id, categoriaAtual.categoriaParentId)
          ).limit(1);
          
          if (!categoriaSuperior || categoriaSuperior.length === 0) {
            break;
          }
          
          categoriaAtual = categoriaSuperior[0];
        }
      }
      
      // Validar dados com o schema Zod, omitindo campos que não devem ser alterados
      const dadosAtualizacao = insertCategoriaFinanceiraSchema.partial().parse({
        ...req.body,
        organizacaoId: organizationId,
        atualizadoEm: new Date()
      });
      
      // Atualizar no banco de dados
      const categoriaAtualizada = await db.update(categoriasFinanceirasTable)
        .set(dadosAtualizacao)
        .where(
          and(
            eq(categoriasFinanceirasTable.id, categoriaId),
            eq(categoriasFinanceirasTable.organizacaoId, organizationId)
          )
        )
        .returning();
      
      return res.status(200).json(categoriaAtualizada[0]);
    } catch (error) {
      console.error("[Financeiro API] Erro ao atualizar categoria:", error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: zodErrorToReadableMessages(error)
        });
      }
      
      return res.status(500).json({ message: "Erro ao atualizar categoria financeira", error });
    }
  });

  // Excluir categoria financeira (soft delete)
  app.delete('/api/financeiro/categorias/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.session.user!;
      const categoriaId = parseInt(req.params.id);
      
      if (!organizationId) {
        return res.status(403).json({ message: "Acesso negado: organização não disponível" });
      }
      
      if (isNaN(categoriaId)) {
        return res.status(400).json({ message: "ID de categoria inválido" });
      }
      
      // Verificar se há subcategorias
      const subcategorias = await db.select().from(categoriasFinanceirasTable).where(
        and(
          eq(categoriasFinanceirasTable.categoriaParentId, categoriaId),
          eq(categoriasFinanceirasTable.organizacaoId, organizationId)
        )
      );
      
      if (subcategorias.length > 0) {
        return res.status(400).json({ 
          message: "Não é possível excluir esta categoria pois existem subcategorias vinculadas",
          subcategorias: subcategorias.map(s => s.nome)
        });
      }
      
      // Verificar se há transações utilizando esta categoria
      const transacoesRelacionadas = await db.select({ count: sql`count(*)` }).from(transacoesFinanceirasTable).where(
        and(
          eq(transacoesFinanceirasTable.organizacaoId, organizationId),
          eq(transacoesFinanceirasTable.categoriaId, categoriaId)
        )
      );
      
      // Se houver transações, fazer soft delete (marcar como inativa)
      if (transacoesRelacionadas[0].count > 0) {
        const categoriaAtualizada = await db.update(categoriasFinanceirasTable)
          .set({ 
            ativo: false,
            atualizadoEm: new Date()
          })
          .where(
            and(
              eq(categoriasFinanceirasTable.id, categoriaId),
              eq(categoriasFinanceirasTable.organizacaoId, organizationId)
            )
          )
          .returning();
        
        if (!categoriaAtualizada || categoriaAtualizada.length === 0) {
          return res.status(404).json({ message: "Categoria financeira não encontrada" });
        }
        
        return res.status(200).json({ 
          message: "Categoria financeira desativada com sucesso. Existem transações associadas a esta categoria.", 
          softDelete: true 
        });
      } else {
        // Se não houver transações, excluir permanentemente
        const categoriaExcluida = await db.delete(categoriasFinanceirasTable)
          .where(
            and(
              eq(categoriasFinanceirasTable.id, categoriaId),
              eq(categoriasFinanceirasTable.organizacaoId, organizationId)
            )
          )
          .returning();
        
        if (!categoriaExcluida || categoriaExcluida.length === 0) {
          return res.status(404).json({ message: "Categoria financeira não encontrada" });
        }
        
        return res.status(200).json({ message: "Categoria financeira excluída com sucesso" });
      }
    } catch (error) {
      console.error("[Financeiro API] Erro ao excluir categoria:", error);
      return res.status(500).json({ message: "Erro ao excluir categoria financeira", error });
    }
  });

  /**
   * ===== ROTAS DE CENTROS DE CUSTO =====
   */

  // Listar todos os centros de custo da organização
  app.get('/api/financeiro/centros-custo', authenticate, async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.session.user!;
      
      if (!organizationId) {
        return res.status(403).json({ message: "Acesso negado: organização não disponível" });
      }

      // Parâmetros opcionais de filtro
      const { ativo } = req.query;
      
      let query = db.select().from(centrosCustoTable).where(
        eq(centrosCustoTable.organizacaoId, organizationId)
      );
      
      // Aplicar filtro de status ativo/inativo se especificado
      if (ativo !== undefined) {
        query = query.where(eq(centrosCustoTable.ativo, ativo === 'true' || ativo === '1'));
      }
      
      const centrosCusto = await query.orderBy(centrosCustoTable.nome);
      
      return res.status(200).json(centrosCusto);
    } catch (error) {
      console.error("[Financeiro API] Erro ao listar centros de custo:", error);
      return res.status(500).json({ message: "Erro ao listar centros de custo", error });
    }
  });

  // Obter detalhes de um centro de custo específico
  app.get('/api/financeiro/centros-custo/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.session.user!;
      const centroCustoId = parseInt(req.params.id);
      
      if (!organizationId) {
        return res.status(403).json({ message: "Acesso negado: organização não disponível" });
      }
      
      if (isNaN(centroCustoId)) {
        return res.status(400).json({ message: "ID de centro de custo inválido" });
      }
      
      const centroCusto = await db.select().from(centrosCustoTable).where(
        and(
          eq(centrosCustoTable.id, centroCustoId),
          eq(centrosCustoTable.organizacaoId, organizationId)
        )
      ).limit(1);
      
      if (!centroCusto || centroCusto.length === 0) {
        return res.status(404).json({ message: "Centro de custo não encontrado" });
      }
      
      return res.status(200).json(centroCusto[0]);
    } catch (error) {
      console.error("[Financeiro API] Erro ao buscar centro de custo:", error);
      return res.status(500).json({ message: "Erro ao obter detalhes do centro de custo", error });
    }
  });

  // Criar novo centro de custo
  app.post('/api/financeiro/centros-custo', authenticate, async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.session.user!;
      
      if (!organizationId) {
        return res.status(403).json({ message: "Acesso negado: organização não disponível" });
      }
      
      // Validar dados com o schema Zod
      const dadosCentroCusto = insertCentroCustoSchema.parse({
        ...req.body,
        organizacaoId: organizationId
      });
      
      // Inserir no banco de dados
      const novoCentroCusto = await db.insert(centrosCustoTable)
        .values(dadosCentroCusto)
        .returning();
      
      return res.status(201).json(novoCentroCusto[0]);
    } catch (error) {
      console.error("[Financeiro API] Erro ao criar centro de custo:", error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: zodErrorToReadableMessages(error)
        });
      }
      
      return res.status(500).json({ message: "Erro ao criar centro de custo", error });
    }
  });

  // Atualizar centro de custo
  app.put('/api/financeiro/centros-custo/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.session.user!;
      const centroCustoId = parseInt(req.params.id);
      
      if (!organizationId) {
        return res.status(403).json({ message: "Acesso negado: organização não disponível" });
      }
      
      if (isNaN(centroCustoId)) {
        return res.status(400).json({ message: "ID de centro de custo inválido" });
      }
      
      // Verificar se o centro de custo existe e pertence à organização
      const centroCustoExistente = await db.select().from(centrosCustoTable).where(
        and(
          eq(centrosCustoTable.id, centroCustoId),
          eq(centrosCustoTable.organizacaoId, organizationId)
        )
      ).limit(1);
      
      if (!centroCustoExistente || centroCustoExistente.length === 0) {
        return res.status(404).json({ message: "Centro de custo não encontrado" });
      }
      
      // Validar dados com o schema Zod, omitindo campos que não devem ser alterados
      const dadosAtualizacao = insertCentroCustoSchema.partial().parse({
        ...req.body,
        organizacaoId: organizationId,
        atualizadoEm: new Date()
      });
      
      // Atualizar no banco de dados
      const centroCustoAtualizado = await db.update(centrosCustoTable)
        .set(dadosAtualizacao)
        .where(
          and(
            eq(centrosCustoTable.id, centroCustoId),
            eq(centrosCustoTable.organizacaoId, organizationId)
          )
        )
        .returning();
      
      return res.status(200).json(centroCustoAtualizado[0]);
    } catch (error) {
      console.error("[Financeiro API] Erro ao atualizar centro de custo:", error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: zodErrorToReadableMessages(error)
        });
      }
      
      return res.status(500).json({ message: "Erro ao atualizar centro de custo", error });
    }
  });

  // Excluir centro de custo (soft delete)
  app.delete('/api/financeiro/centros-custo/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.session.user!;
      const centroCustoId = parseInt(req.params.id);
      
      if (!organizationId) {
        return res.status(403).json({ message: "Acesso negado: organização não disponível" });
      }
      
      if (isNaN(centroCustoId)) {
        return res.status(400).json({ message: "ID de centro de custo inválido" });
      }
      
      // Verificar se há transações utilizando este centro de custo
      const transacoesRelacionadas = await db.select({ count: sql`count(*)` }).from(transacoesFinanceirasTable).where(
        and(
          eq(transacoesFinanceirasTable.organizacaoId, organizationId),
          eq(transacoesFinanceirasTable.centroCustoId, centroCustoId)
        )
      );
      
      // Se houver transações, fazer soft delete (marcar como inativo)
      if (transacoesRelacionadas[0].count > 0) {
        const centroCustoAtualizado = await db.update(centrosCustoTable)
          .set({ 
            ativo: false,
            atualizadoEm: new Date()
          })
          .where(
            and(
              eq(centrosCustoTable.id, centroCustoId),
              eq(centrosCustoTable.organizacaoId, organizationId)
            )
          )
          .returning();
        
        if (!centroCustoAtualizado || centroCustoAtualizado.length === 0) {
          return res.status(404).json({ message: "Centro de custo não encontrado" });
        }
        
        return res.status(200).json({ 
          message: "Centro de custo desativado com sucesso. Existem transações associadas a este centro de custo.", 
          softDelete: true 
        });
      } else {
        // Se não houver transações, excluir permanentemente
        const centroCustoExcluido = await db.delete(centrosCustoTable)
          .where(
            and(
              eq(centrosCustoTable.id, centroCustoId),
              eq(centrosCustoTable.organizacaoId, organizationId)
            )
          )
          .returning();
        
        if (!centroCustoExcluido || centroCustoExcluido.length === 0) {
          return res.status(404).json({ message: "Centro de custo não encontrado" });
        }
        
        return res.status(200).json({ message: "Centro de custo excluído com sucesso" });
      }
    } catch (error) {
      console.error("[Financeiro API] Erro ao excluir centro de custo:", error);
      return res.status(500).json({ message: "Erro ao excluir centro de custo", error });
    }
  });

  /**
   * ===== ROTAS DE TRANSAÇÕES FINANCEIRAS =====
   */

  // Listar transações financeiras com filtros
  app.get('/api/financeiro/transacoes', authenticate, async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.session.user!;
      
      if (!organizationId) {
        return res.status(403).json({ message: "Acesso negado: organização não disponível" });
      }

      // Parâmetros de filtro
      const { 
        tipo, status, dataInicio, dataFim, contaId, categoriaId, 
        centroCustoId, limit, offset, sort, order, 
        reconciliado, recorrencia
      } = req.query;
      
      let query = db.select({
        ...transacoesFinanceirasTable,
        contaNome: contasFinanceirasTable.nome,
        categoriaNome: categoriasFinanceirasTable.nome,
        centroCustoNome: centrosCustoTable.nome
      })
      .from(transacoesFinanceirasTable)
      .leftJoin(
        contasFinanceirasTable,
        eq(transacoesFinanceirasTable.contaId, contasFinanceirasTable.id)
      )
      .leftJoin(
        categoriasFinanceirasTable,
        eq(transacoesFinanceirasTable.categoriaId, categoriasFinanceirasTable.id)
      )
      .leftJoin(
        centrosCustoTable,
        eq(transacoesFinanceirasTable.centroCustoId, centrosCustoTable.id)
      )
      .where(
        eq(transacoesFinanceirasTable.organizacaoId, organizationId)
      );
      
      // Filtro por tipo (receita, despesa, transferencia)
      if (tipo && ['receita', 'despesa', 'transferencia'].includes(tipo as string)) {
        query = query.where(eq(transacoesFinanceirasTable.tipo, tipo as any));
      }
      
      // Filtro por status
      if (status && ['pendente', 'pago', 'atrasado', 'cancelado', 'estornado'].includes(status as string)) {
        query = query.where(eq(transacoesFinanceirasTable.status, status as any));
      }
      
      // Filtro por data
      if (dataInicio) {
        query = query.where(gte(transacoesFinanceirasTable.dataVencimento, new Date(dataInicio as string)));
      }
      
      if (dataFim) {
        query = query.where(lte(transacoesFinanceirasTable.dataVencimento, new Date(dataFim as string)));
      }
      
      // Filtro por conta
      if (contaId && !isNaN(parseInt(contaId as string))) {
        query = query.where(eq(transacoesFinanceirasTable.contaId, parseInt(contaId as string)));
      }
      
      // Filtro por categoria
      if (categoriaId && !isNaN(parseInt(categoriaId as string))) {
        query = query.where(eq(transacoesFinanceirasTable.categoriaId, parseInt(categoriaId as string)));
      }
      
      // Filtro por centro de custo
      if (centroCustoId && !isNaN(parseInt(centroCustoId as string))) {
        query = query.where(eq(transacoesFinanceirasTable.centroCustoId, parseInt(centroCustoId as string)));
      }
      
      // Filtro por status de reconciliação
      if (reconciliado !== undefined) {
        query = query.where(eq(transacoesFinanceirasTable.reconciliado, reconciliado === 'true' || reconciliado === '1'));
      }
      
      // Filtro por tipo de recorrência
      if (recorrencia && ['unica', 'diaria', 'semanal', 'quinzenal', 'mensal', 'bimestral', 'trimestral', 'semestral', 'anual'].includes(recorrencia as string)) {
        query = query.where(eq(transacoesFinanceirasTable.recorrencia, recorrencia as any));
      }
      
      // Ordenação
      if (sort && ['dataVencimento', 'dataPagamento', 'valor', 'descricao', 'dataEmissao'].includes(sort as string)) {
        if (order === 'asc') {
          query = query.orderBy(transacoesFinanceirasTable[sort as keyof typeof transacoesFinanceirasTable]);
        } else {
          query = query.orderBy(desc(transacoesFinanceirasTable[sort as keyof typeof transacoesFinanceirasTable]));
        }
      } else {
        // Ordenação padrão por data de vencimento (mais recente primeiro)
        query = query.orderBy(desc(transacoesFinanceirasTable.dataVencimento));
      }
      
      // Paginação
      const limitNum = limit ? parseInt(limit as string) : 50;
      const offsetNum = offset ? parseInt(offset as string) : 0;
      
      query = query.limit(limitNum).offset(offsetNum);
      
      const transacoes = await query;
      
      // Contar total de registros para paginação
      const countQuery = db.select({ count: sql`count(*)` })
        .from(transacoesFinanceirasTable)
        .where(eq(transacoesFinanceirasTable.organizacaoId, organizationId));
      
      // Aplicar os mesmos filtros na contagem
      if (tipo && ['receita', 'despesa', 'transferencia'].includes(tipo as string)) {
        countQuery.where(eq(transacoesFinanceirasTable.tipo, tipo as any));
      }
      
      if (status && ['pendente', 'pago', 'atrasado', 'cancelado', 'estornado'].includes(status as string)) {
        countQuery.where(eq(transacoesFinanceirasTable.status, status as any));
      }
      
      if (dataInicio) {
        countQuery.where(gte(transacoesFinanceirasTable.dataVencimento, new Date(dataInicio as string)));
      }
      
      if (dataFim) {
        countQuery.where(lte(transacoesFinanceirasTable.dataVencimento, new Date(dataFim as string)));
      }
      
      if (contaId && !isNaN(parseInt(contaId as string))) {
        countQuery.where(eq(transacoesFinanceirasTable.contaId, parseInt(contaId as string)));
      }
      
      if (categoriaId && !isNaN(parseInt(categoriaId as string))) {
        countQuery.where(eq(transacoesFinanceirasTable.categoriaId, parseInt(categoriaId as string)));
      }
      
      if (centroCustoId && !isNaN(parseInt(centroCustoId as string))) {
        countQuery.where(eq(transacoesFinanceirasTable.centroCustoId, parseInt(centroCustoId as string)));
      }
      
      if (reconciliado !== undefined) {
        countQuery.where(eq(transacoesFinanceirasTable.reconciliado, reconciliado === 'true' || reconciliado === '1'));
      }
      
      if (recorrencia && ['unica', 'diaria', 'semanal', 'quinzenal', 'mensal', 'bimestral', 'trimestral', 'semestral', 'anual'].includes(recorrencia as string)) {
        countQuery.where(eq(transacoesFinanceirasTable.recorrencia, recorrencia as any));
      }
      
      const totalCount = await countQuery;
      
      return res.status(200).json({
        data: transacoes,
        pagination: {
          total: Number(totalCount[0].count),
          limit: limitNum,
          offset: offsetNum,
          pages: Math.ceil(Number(totalCount[0].count) / limitNum)
        }
      });
    } catch (error) {
      console.error("[Financeiro API] Erro ao listar transações:", error);
      return res.status(500).json({ message: "Erro ao listar transações financeiras", error });
    }
  });

  // Obter detalhes de uma transação específica
  app.get('/api/financeiro/transacoes/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.session.user!;
      const transacaoId = parseInt(req.params.id);
      
      if (!organizationId) {
        return res.status(403).json({ message: "Acesso negado: organização não disponível" });
      }
      
      if (isNaN(transacaoId)) {
        return res.status(400).json({ message: "ID de transação inválido" });
      }
      
      const transacao = await db.select({
        ...transacoesFinanceirasTable,
        contaNome: contasFinanceirasTable.nome,
        categoriaNome: categoriasFinanceirasTable.nome,
        centroCustoNome: centrosCustoTable.nome,
        contaDestinoNome: sql`(SELECT nome FROM contas_financeiras WHERE id = ${transacoesFinanceirasTable.contaDestinoId})`
      })
      .from(transacoesFinanceirasTable)
      .leftJoin(
        contasFinanceirasTable,
        eq(transacoesFinanceirasTable.contaId, contasFinanceirasTable.id)
      )
      .leftJoin(
        categoriasFinanceirasTable,
        eq(transacoesFinanceirasTable.categoriaId, categoriasFinanceirasTable.id)
      )
      .leftJoin(
        centrosCustoTable,
        eq(transacoesFinanceirasTable.centroCustoId, centrosCustoTable.id)
      )
      .where(
        and(
          eq(transacoesFinanceirasTable.id, transacaoId),
          eq(transacoesFinanceirasTable.organizacaoId, organizationId)
        )
      ).limit(1);
      
      if (!transacao || transacao.length === 0) {
        return res.status(404).json({ message: "Transação financeira não encontrada" });
      }
      
      // Verificar se é uma transação pai e buscar transações filhas se for o caso
      if (transacao[0].recorrencia !== 'unica' && transacao[0].transacaoParentId === null) {
        const transacoesFilhas = await db.select({
          id: transacoesFinanceirasTable.id,
          dataVencimento: transacoesFinanceirasTable.dataVencimento,
          dataPagamento: transacoesFinanceirasTable.dataPagamento,
          valor: transacoesFinanceirasTable.valor,
          status: transacoesFinanceirasTable.status
        })
        .from(transacoesFinanceirasTable)
        .where(
          and(
            eq(transacoesFinanceirasTable.transacaoParentId, transacaoId),
            eq(transacoesFinanceirasTable.organizacaoId, organizationId)
          )
        )
        .orderBy(transacoesFinanceirasTable.dataVencimento);
        
        return res.status(200).json({
          ...transacao[0],
          transacoesFilhas
        });
      }
      
      return res.status(200).json(transacao[0]);
    } catch (error) {
      console.error("[Financeiro API] Erro ao buscar transação:", error);
      return res.status(500).json({ message: "Erro ao obter detalhes da transação", error });
    }
  });

  // Criar nova transação financeira
  app.post('/api/financeiro/transacoes', authenticate, async (req: Request, res: Response) => {
    try {
      const { organizationId, id: userId } = req.session.user!;
      
      if (!organizationId) {
        return res.status(403).json({ message: "Acesso negado: organização não disponível" });
      }
      
      // Validar dados com o schema Zod
      const dadosTransacao = insertTransacaoFinanceiraSchema.parse({
        ...req.body,
        organizacaoId: organizationId,
        criadoPor: userId
      });
      
      // Verificar se a conta existe e pertence à organização
      const contaExistente = await db.select().from(contasFinanceirasTable).where(
        and(
          eq(contasFinanceirasTable.id, dadosTransacao.contaId),
          eq(contasFinanceirasTable.organizacaoId, organizationId)
        )
      ).limit(1);
      
      if (!contaExistente || contaExistente.length === 0) {
        return res.status(404).json({ message: "Conta financeira não encontrada" });
      }
      
      // Se for transferência, verificar se a conta destino existe
      if (dadosTransacao.tipo === 'transferencia') {
        if (!dadosTransacao.contaDestinoId) {
          return res.status(400).json({ message: "Conta destino é obrigatória para transferências" });
        }
        
        const contaDestinoExistente = await db.select().from(contasFinanceirasTable).where(
          and(
            eq(contasFinanceirasTable.id, dadosTransacao.contaDestinoId),
            eq(contasFinanceirasTable.organizacaoId, organizationId)
          )
        ).limit(1);
        
        if (!contaDestinoExistente || contaDestinoExistente.length === 0) {
          return res.status(404).json({ message: "Conta destino não encontrada" });
        }
        
        if (dadosTransacao.contaId === dadosTransacao.contaDestinoId) {
          return res.status(400).json({ message: "Conta origem e destino não podem ser iguais" });
        }
      }
      
      // Se houver categoria, verificar se ela existe
      if (dadosTransacao.categoriaId) {
        const categoriaExistente = await db.select().from(categoriasFinanceirasTable).where(
          and(
            eq(categoriasFinanceirasTable.id, dadosTransacao.categoriaId),
            eq(categoriasFinanceirasTable.organizacaoId, organizationId)
          )
        ).limit(1);
        
        if (!categoriaExistente || categoriaExistente.length === 0) {
          return res.status(404).json({ message: "Categoria financeira não encontrada" });
        }
        
        // Verificar se o tipo da categoria é compatível com o tipo da transação
        if (
          categoriaExistente[0].tipo !== 'ambos' && 
          dadosTransacao.tipo !== 'transferencia' && 
          categoriaExistente[0].tipo !== dadosTransacao.tipo
        ) {
          return res.status(400).json({ 
            message: `Categoria do tipo "${categoriaExistente[0].tipo}" não pode ser usada em transação do tipo "${dadosTransacao.tipo}"` 
          });
        }
      }
      
      // Se houver centro de custo, verificar se ele existe
      if (dadosTransacao.centroCustoId) {
        const centroCustoExistente = await db.select().from(centrosCustoTable).where(
          and(
            eq(centrosCustoTable.id, dadosTransacao.centroCustoId),
            eq(centrosCustoTable.organizacaoId, organizationId)
          )
        ).limit(1);
        
        if (!centroCustoExistente || centroCustoExistente.length === 0) {
          return res.status(404).json({ message: "Centro de custo não encontrado" });
        }
      }
      
      // Se dataPagamento estiver preenchida, status deve ser pago ou estornado
      if (dadosTransacao.dataPagamento && !['pago', 'estornado'].includes(dadosTransacao.status)) {
        return res.status(400).json({ 
          message: "Status deve ser 'pago' ou 'estornado' quando data de pagamento estiver preenchida" 
        });
      }
      
      // Iniciar transação para garantir consistência de dados
      const result = await db.transaction(async (tx) => {
        // Inserir a transação principal no banco de dados
        const novaTransacao = await tx.insert(transacoesFinanceirasTable)
          .values(dadosTransacao)
          .returning();
        
        // Se for transação recorrente, criar as transações filhas
        const transacoesFilhas = [];
        if (dadosTransacao.recorrencia !== 'unica') {
          // Quantidade de parcelas a gerar (padrão: 12)
          const numeroParcelas = req.body.numeroParcelas || 12;
          
          // Data base para cálculo das próximas datas
          const dataBase = new Date(dadosTransacao.dataVencimento);
          
          for (let i = 1; i <= numeroParcelas; i++) {
            const proximaData = calcularProximaData(dataBase, dadosTransacao.recorrencia, i);
            
            // Criar transação filha
            const dadosTransacaoFilha = {
              ...dadosTransacao,
              descricao: `${dadosTransacao.descricao} (${i + 1}/${numeroParcelas + 1})`,
              dataVencimento: proximaData,
              dataPagamento: null, // Parcelas futuras não estão pagas
              status: 'pendente', // Parcelas futuras estão pendentes
              transacaoParentId: novaTransacao[0].id, // Referência à transação pai
              recorrencia: 'unica' // Transações filhas não são recorrentes
            };
            
            const novaTransacaoFilha = await tx.insert(transacoesFinanceirasTable)
              .values(dadosTransacaoFilha)
              .returning();
            
            transacoesFilhas.push(novaTransacaoFilha[0]);
          }
          
          // Atualizar descrição da transação pai para indicar que é a primeira
          await tx.update(transacoesFinanceirasTable)
            .set({ 
              descricao: `${dadosTransacao.descricao} (1/${numeroParcelas + 1})` 
            })
            .where(eq(transacoesFinanceirasTable.id, novaTransacao[0].id));
          
          // Atualizar objeto novaTransacao com a descrição atualizada
          novaTransacao[0].descricao = `${dadosTransacao.descricao} (1/${numeroParcelas + 1})`;
        }
        
        // Se já estiver paga, atualizar o saldo da conta
        if (dadosTransacao.status === 'pago' && dadosTransacao.dataPagamento) {
          if (dadosTransacao.tipo === 'receita') {
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} + ${dadosTransacao.valor}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, dadosTransacao.contaId));
          }
          else if (dadosTransacao.tipo === 'despesa') {
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} - ${dadosTransacao.valor}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, dadosTransacao.contaId));
          }
          else if (dadosTransacao.tipo === 'transferencia' && dadosTransacao.contaDestinoId) {
            // Diminuir na conta origem
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} - ${dadosTransacao.valor}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, dadosTransacao.contaId));
            
            // Aumentar na conta destino
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} + ${dadosTransacao.valor}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, dadosTransacao.contaDestinoId));
          }
        }
        
        return {
          transacao: novaTransacao[0],
          transacoesFilhas
        };
      });
      
      return res.status(201).json(result);
    } catch (error) {
      console.error("[Financeiro API] Erro ao criar transação:", error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: zodErrorToReadableMessages(error)
        });
      }
      
      return res.status(500).json({ message: "Erro ao criar transação financeira", error });
    }
  });

  // Atualizar transação financeira
  app.put('/api/financeiro/transacoes/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { organizationId, id: userId } = req.session.user!;
      const transacaoId = parseInt(req.params.id);
      
      if (!organizationId) {
        return res.status(403).json({ message: "Acesso negado: organização não disponível" });
      }
      
      if (isNaN(transacaoId)) {
        return res.status(400).json({ message: "ID de transação inválido" });
      }
      
      // Verificar se a transação existe e pertence à organização
      const transacaoExistente = await db.select().from(transacoesFinanceirasTable).where(
        and(
          eq(transacoesFinanceirasTable.id, transacaoId),
          eq(transacoesFinanceirasTable.organizacaoId, organizationId)
        )
      ).limit(1);
      
      if (!transacaoExistente || transacaoExistente.length === 0) {
        return res.status(404).json({ message: "Transação financeira não encontrada" });
      }
      
      // Validar dados com o schema Zod, omitindo campos que não devem ser alterados
      const dadosAtualizacao = insertTransacaoFinanceiraSchema.partial().parse({
        ...req.body,
        organizacaoId: organizationId,
        atualizadoPor: userId,
        atualizadoEm: new Date()
      });
      
      // Se mudou a conta, verificar se a nova conta existe
      if (dadosAtualizacao.contaId && dadosAtualizacao.contaId !== transacaoExistente[0].contaId) {
        const contaExistente = await db.select().from(contasFinanceirasTable).where(
          and(
            eq(contasFinanceirasTable.id, dadosAtualizacao.contaId),
            eq(contasFinanceirasTable.organizacaoId, organizationId)
          )
        ).limit(1);
        
        if (!contaExistente || contaExistente.length === 0) {
          return res.status(404).json({ message: "Conta financeira não encontrada" });
        }
      }
      
      // Se for transferência, verificar se a conta destino existe
      if (
        (dadosAtualizacao.tipo === 'transferencia' || transacaoExistente[0].tipo === 'transferencia') &&
        dadosAtualizacao.contaDestinoId && 
        dadosAtualizacao.contaDestinoId !== transacaoExistente[0].contaDestinoId
      ) {
        const contaDestinoExistente = await db.select().from(contasFinanceirasTable).where(
          and(
            eq(contasFinanceirasTable.id, dadosAtualizacao.contaDestinoId),
            eq(contasFinanceirasTable.organizacaoId, organizationId)
          )
        ).limit(1);
        
        if (!contaDestinoExistente || contaDestinoExistente.length === 0) {
          return res.status(404).json({ message: "Conta destino não encontrada" });
        }
        
        if (dadosAtualizacao.contaId && dadosAtualizacao.contaId === dadosAtualizacao.contaDestinoId) {
          return res.status(400).json({ message: "Conta origem e destino não podem ser iguais" });
        }
      }
      
      // Se mudou a categoria, verificar se a nova categoria existe
      if (dadosAtualizacao.categoriaId && dadosAtualizacao.categoriaId !== transacaoExistente[0].categoriaId) {
        const categoriaExistente = await db.select().from(categoriasFinanceirasTable).where(
          and(
            eq(categoriasFinanceirasTable.id, dadosAtualizacao.categoriaId),
            eq(categoriasFinanceirasTable.organizacaoId, organizationId)
          )
        ).limit(1);
        
        if (!categoriaExistente || categoriaExistente.length === 0) {
          return res.status(404).json({ message: "Categoria financeira não encontrada" });
        }
        
        // Verificar se o tipo da categoria é compatível com o tipo da transação
        const tipoTransacao = dadosAtualizacao.tipo || transacaoExistente[0].tipo;
        if (
          categoriaExistente[0].tipo !== 'ambos' && 
          tipoTransacao !== 'transferencia' && 
          categoriaExistente[0].tipo !== tipoTransacao
        ) {
          return res.status(400).json({ 
            message: `Categoria do tipo "${categoriaExistente[0].tipo}" não pode ser usada em transação do tipo "${tipoTransacao}"` 
          });
        }
      }
      
      // Se mudou o centro de custo, verificar se o novo centro de custo existe
      if (dadosAtualizacao.centroCustoId && dadosAtualizacao.centroCustoId !== transacaoExistente[0].centroCustoId) {
        const centroCustoExistente = await db.select().from(centrosCustoTable).where(
          and(
            eq(centrosCustoTable.id, dadosAtualizacao.centroCustoId),
            eq(centrosCustoTable.organizacaoId, organizationId)
          )
        ).limit(1);
        
        if (!centroCustoExistente || centroCustoExistente.length === 0) {
          return res.status(404).json({ message: "Centro de custo não encontrado" });
        }
      }
      
      // Validar regra de data de pagamento x status
      const statusFinal = dadosAtualizacao.status || transacaoExistente[0].status;
      const dataPagamentoFinal = dadosAtualizacao.dataPagamento !== undefined ? 
        dadosAtualizacao.dataPagamento : transacaoExistente[0].dataPagamento;
      
      if (dataPagamentoFinal && !['pago', 'estornado'].includes(statusFinal)) {
        return res.status(400).json({ 
          message: "Status deve ser 'pago' ou 'estornado' quando data de pagamento estiver preenchida" 
        });
      }
      
      // Iniciar transação para garantir consistência de dados
      const result = await db.transaction(async (tx) => {
        // Calcular ajustes de saldo se necessário
        if (
          transacaoExistente[0].status !== 'pago' && 
          statusFinal === 'pago' &&
          dataPagamentoFinal
        ) {
          // Transação estava não paga e passou a ser paga
          if (transacaoExistente[0].tipo === 'receita') {
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} + ${dadosAtualizacao.valor || transacaoExistente[0].valor}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, dadosAtualizacao.contaId || transacaoExistente[0].contaId));
          }
          else if (transacaoExistente[0].tipo === 'despesa') {
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} - ${dadosAtualizacao.valor || transacaoExistente[0].valor}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, dadosAtualizacao.contaId || transacaoExistente[0].contaId));
          }
          else if (transacaoExistente[0].tipo === 'transferencia') {
            // Diminuir na conta origem
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} - ${dadosAtualizacao.valor || transacaoExistente[0].valor}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, dadosAtualizacao.contaId || transacaoExistente[0].contaId));
            
            // Aumentar na conta destino
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} + ${dadosAtualizacao.valor || transacaoExistente[0].valor}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, dadosAtualizacao.contaDestinoId || transacaoExistente[0].contaDestinoId!));
          }
        }
        else if (
          transacaoExistente[0].status === 'pago' && 
          (statusFinal !== 'pago' || !dataPagamentoFinal)
        ) {
          // Transação estava paga e passou a não ser paga
          if (transacaoExistente[0].tipo === 'receita') {
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} - ${transacaoExistente[0].valor}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, transacaoExistente[0].contaId));
          }
          else if (transacaoExistente[0].tipo === 'despesa') {
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} + ${transacaoExistente[0].valor}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, transacaoExistente[0].contaId));
          }
          else if (transacaoExistente[0].tipo === 'transferencia' && transacaoExistente[0].contaDestinoId) {
            // Aumentar na conta origem
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} + ${transacaoExistente[0].valor}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, transacaoExistente[0].contaId));
            
            // Diminuir na conta destino
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} - ${transacaoExistente[0].valor}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, transacaoExistente[0].contaDestinoId));
          }
        }
        else if (
          transacaoExistente[0].status === 'pago' && 
          statusFinal === 'pago' &&
          (
            (dadosAtualizacao.valor && dadosAtualizacao.valor !== transacaoExistente[0].valor) ||
            (dadosAtualizacao.contaId && dadosAtualizacao.contaId !== transacaoExistente[0].contaId) ||
            (dadosAtualizacao.contaDestinoId && dadosAtualizacao.contaDestinoId !== transacaoExistente[0].contaDestinoId) ||
            (dadosAtualizacao.tipo && dadosAtualizacao.tipo !== transacaoExistente[0].tipo)
          )
        ) {
          // Transação estava paga e continua paga, mas mudaram dados relevantes para o saldo
          
          // Primeiro, reverter os lançamentos originais
          if (transacaoExistente[0].tipo === 'receita') {
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} - ${transacaoExistente[0].valor}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, transacaoExistente[0].contaId));
          }
          else if (transacaoExistente[0].tipo === 'despesa') {
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} + ${transacaoExistente[0].valor}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, transacaoExistente[0].contaId));
          }
          else if (transacaoExistente[0].tipo === 'transferencia' && transacaoExistente[0].contaDestinoId) {
            // Aumentar na conta origem original
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} + ${transacaoExistente[0].valor}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, transacaoExistente[0].contaId));
            
            // Diminuir na conta destino original
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} - ${transacaoExistente[0].valor}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, transacaoExistente[0].contaDestinoId));
          }
          
          // Em seguida, aplicar os novos lançamentos
          const tipoAtualizado = dadosAtualizacao.tipo || transacaoExistente[0].tipo;
          const valorAtualizado = dadosAtualizacao.valor || transacaoExistente[0].valor;
          const contaAtualizada = dadosAtualizacao.contaId || transacaoExistente[0].contaId;
          const contaDestinoAtualizada = dadosAtualizacao.contaDestinoId !== undefined ? 
            dadosAtualizacao.contaDestinoId : transacaoExistente[0].contaDestinoId;
          
          if (tipoAtualizado === 'receita') {
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} + ${valorAtualizado}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, contaAtualizada));
          }
          else if (tipoAtualizado === 'despesa') {
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} - ${valorAtualizado}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, contaAtualizada));
          }
          else if (tipoAtualizado === 'transferencia' && contaDestinoAtualizada) {
            // Diminuir na conta origem
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} - ${valorAtualizado}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, contaAtualizada));
            
            // Aumentar na conta destino
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} + ${valorAtualizado}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, contaDestinoAtualizada));
          }
        }
        
        // Atualizar no banco de dados
        const transacaoAtualizada = await tx.update(transacoesFinanceirasTable)
          .set(dadosAtualizacao)
          .where(
            and(
              eq(transacoesFinanceirasTable.id, transacaoId),
              eq(transacoesFinanceirasTable.organizacaoId, organizationId)
            )
          )
          .returning();
        
        return transacaoAtualizada[0];
      });
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("[Financeiro API] Erro ao atualizar transação:", error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: zodErrorToReadableMessages(error)
        });
      }
      
      return res.status(500).json({ message: "Erro ao atualizar transação financeira", error });
    }
  });

  // Excluir transação financeira
  app.delete('/api/financeiro/transacoes/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.session.user!;
      const transacaoId = parseInt(req.params.id);
      
      if (!organizationId) {
        return res.status(403).json({ message: "Acesso negado: organização não disponível" });
      }
      
      if (isNaN(transacaoId)) {
        return res.status(400).json({ message: "ID de transação inválido" });
      }
      
      // Verificar se a transação existe e pertence à organização
      const transacaoExistente = await db.select().from(transacoesFinanceirasTable).where(
        and(
          eq(transacoesFinanceirasTable.id, transacaoId),
          eq(transacoesFinanceirasTable.organizacaoId, organizationId)
        )
      ).limit(1);
      
      if (!transacaoExistente || transacaoExistente.length === 0) {
        return res.status(404).json({ message: "Transação financeira não encontrada" });
      }
      
      // Verificar se é uma transação pai com filhas
      const transacoesFilhas = await db.select().from(transacoesFinanceirasTable).where(
        and(
          eq(transacoesFinanceirasTable.transacaoParentId, transacaoId),
          eq(transacoesFinanceirasTable.organizacaoId, organizationId)
        )
      );
      
      // Iniciar transação para garantir consistência de dados
      await db.transaction(async (tx) => {
        // Se for uma transação paga, reverter o saldo
        if (transacaoExistente[0].status === 'pago') {
          if (transacaoExistente[0].tipo === 'receita') {
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} - ${transacaoExistente[0].valor}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, transacaoExistente[0].contaId));
          }
          else if (transacaoExistente[0].tipo === 'despesa') {
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} + ${transacaoExistente[0].valor}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, transacaoExistente[0].contaId));
          }
          else if (transacaoExistente[0].tipo === 'transferencia' && transacaoExistente[0].contaDestinoId) {
            // Aumentar na conta origem
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} + ${transacaoExistente[0].valor}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, transacaoExistente[0].contaId));
            
            // Diminuir na conta destino
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} - ${transacaoExistente[0].valor}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, transacaoExistente[0].contaDestinoId));
          }
        }
        
        // Excluir transações filhas, se houver
        if (transacoesFilhas.length > 0) {
          for (const transacaoFilha of transacoesFilhas) {
            // Se for uma transação filha paga, reverter o saldo
            if (transacaoFilha.status === 'pago') {
              if (transacaoFilha.tipo === 'receita') {
                await tx.update(contasFinanceirasTable)
                  .set({ 
                    saldoAtual: sql`${contasFinanceirasTable.saldoAtual} - ${transacaoFilha.valor}`,
                    atualizadoEm: new Date()
                  })
                  .where(eq(contasFinanceirasTable.id, transacaoFilha.contaId));
              }
              else if (transacaoFilha.tipo === 'despesa') {
                await tx.update(contasFinanceirasTable)
                  .set({ 
                    saldoAtual: sql`${contasFinanceirasTable.saldoAtual} + ${transacaoFilha.valor}`,
                    atualizadoEm: new Date()
                  })
                  .where(eq(contasFinanceirasTable.id, transacaoFilha.contaId));
              }
              else if (transacaoFilha.tipo === 'transferencia' && transacaoFilha.contaDestinoId) {
                // Aumentar na conta origem
                await tx.update(contasFinanceirasTable)
                  .set({ 
                    saldoAtual: sql`${contasFinanceirasTable.saldoAtual} + ${transacaoFilha.valor}`,
                    atualizadoEm: new Date()
                  })
                  .where(eq(contasFinanceirasTable.id, transacaoFilha.contaId));
                
                // Diminuir na conta destino
                await tx.update(contasFinanceirasTable)
                  .set({ 
                    saldoAtual: sql`${contasFinanceirasTable.saldoAtual} - ${transacaoFilha.valor}`,
                    atualizadoEm: new Date()
                  })
                  .where(eq(contasFinanceirasTable.id, transacaoFilha.contaDestinoId));
              }
            }
            
            // Excluir a transação filha
            await tx.delete(transacoesFinanceirasTable)
              .where(
                and(
                  eq(transacoesFinanceirasTable.id, transacaoFilha.id),
                  eq(transacoesFinanceirasTable.organizacaoId, organizationId)
                )
              );
          }
        }
        
        // Excluir a transação principal
        await tx.delete(transacoesFinanceirasTable)
          .where(
            and(
              eq(transacoesFinanceirasTable.id, transacaoId),
              eq(transacoesFinanceirasTable.organizacaoId, organizationId)
            )
          );
      });
      
      return res.status(200).json({ 
        message: "Transação financeira excluída com sucesso",
        transacoesFilhasExcluidas: transacoesFilhas.length
      });
    } catch (error) {
      console.error("[Financeiro API] Erro ao excluir transação:", error);
      return res.status(500).json({ message: "Erro ao excluir transação financeira", error });
    }
  });

  // Pagar/estornar transação
  app.patch('/api/financeiro/transacoes/:id/pagar', authenticate, async (req: Request, res: Response) => {
    try {
      const { organizationId, id: userId } = req.session.user!;
      const transacaoId = parseInt(req.params.id);
      
      if (!organizationId) {
        return res.status(403).json({ message: "Acesso negado: organização não disponível" });
      }
      
      if (isNaN(transacaoId)) {
        return res.status(400).json({ message: "ID de transação inválido" });
      }
      
      // Verificar se a transação existe e pertence à organização
      const transacaoExistente = await db.select().from(transacoesFinanceirasTable).where(
        and(
          eq(transacoesFinanceirasTable.id, transacaoId),
          eq(transacoesFinanceirasTable.organizacaoId, organizationId)
        )
      ).limit(1);
      
      if (!transacaoExistente || transacaoExistente.length === 0) {
        return res.status(404).json({ message: "Transação financeira não encontrada" });
      }
      
      // Validar os dados da requisição
      const { dataPagamento = new Date(), pagar = true, valor } = req.body;
      
      // Verificar se já está no status desejado
      if (pagar && transacaoExistente[0].status === 'pago') {
        return res.status(400).json({ message: "Transação já está paga" });
      }
      
      if (!pagar && transacaoExistente[0].status !== 'pago') {
        return res.status(400).json({ message: "Não é possível estornar uma transação que não está paga" });
      }
      
      // Iniciar transação para garantir consistência de dados
      const result = await db.transaction(async (tx) => {
        const valorPagamento = valor || transacaoExistente[0].valor;
        
        if (pagar) {
          // Pagar a transação
          
          // Atualizar saldo da conta
          if (transacaoExistente[0].tipo === 'receita') {
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} + ${valorPagamento}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, transacaoExistente[0].contaId));
          }
          else if (transacaoExistente[0].tipo === 'despesa') {
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} - ${valorPagamento}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, transacaoExistente[0].contaId));
          }
          else if (transacaoExistente[0].tipo === 'transferencia' && transacaoExistente[0].contaDestinoId) {
            // Diminuir na conta origem
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} - ${valorPagamento}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, transacaoExistente[0].contaId));
            
            // Aumentar na conta destino
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} + ${valorPagamento}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, transacaoExistente[0].contaDestinoId));
          }
          
          // Atualizar transação
          const transacaoAtualizada = await tx.update(transacoesFinanceirasTable)
            .set({ 
              status: 'pago' as any, // Drizzle não reconhece o enum diretamente
              dataPagamento: new Date(dataPagamento),
              valor: valorPagamento,
              atualizadoPor: userId,
              atualizadoEm: new Date()
            })
            .where(
              and(
                eq(transacoesFinanceirasTable.id, transacaoId),
                eq(transacoesFinanceirasTable.organizacaoId, organizationId)
              )
            )
            .returning();
          
          return {
            message: "Transação paga com sucesso",
            transacao: transacaoAtualizada[0]
          };
        } else {
          // Estornar a transação
          
          // Atualizar saldo da conta
          if (transacaoExistente[0].tipo === 'receita') {
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} - ${transacaoExistente[0].valor}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, transacaoExistente[0].contaId));
          }
          else if (transacaoExistente[0].tipo === 'despesa') {
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} + ${transacaoExistente[0].valor}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, transacaoExistente[0].contaId));
          }
          else if (transacaoExistente[0].tipo === 'transferencia' && transacaoExistente[0].contaDestinoId) {
            // Aumentar na conta origem
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} + ${transacaoExistente[0].valor}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, transacaoExistente[0].contaId));
            
            // Diminuir na conta destino
            await tx.update(contasFinanceirasTable)
              .set({ 
                saldoAtual: sql`${contasFinanceirasTable.saldoAtual} - ${transacaoExistente[0].valor}`,
                atualizadoEm: new Date()
              })
              .where(eq(contasFinanceirasTable.id, transacaoExistente[0].contaDestinoId));
          }
          
          // Atualizar transação
          const transacaoAtualizada = await tx.update(transacoesFinanceirasTable)
            .set({ 
              status: 'estornado' as any,
              atualizadoPor: userId,
              atualizadoEm: new Date()
            })
            .where(
              and(
                eq(transacoesFinanceirasTable.id, transacaoId),
                eq(transacoesFinanceirasTable.organizacaoId, organizationId)
              )
            )
            .returning();
          
          return {
            message: "Transação estornada com sucesso",
            transacao: transacaoAtualizada[0]
          };
        }
      });
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("[Financeiro API] Erro ao pagar/estornar transação:", error);
      return res.status(500).json({ message: "Erro ao pagar/estornar transação financeira", error });
    }
  });

  /**
   * ===== ROTAS DE DASHBOARD FINANCEIRO =====
   */

  // Resumo financeiro (saldos, receitas, despesas, etc.)
  app.get('/api/financeiro/dashboard/resumo', authenticate, async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.session.user!;
      
      if (!organizationId) {
        return res.status(403).json({ message: "Acesso negado: organização não disponível" });
      }

      // Parâmetros opcionais
      const { periodo = '30' } = req.query;
      
      // Definir data de início com base no período
      let dataInicio = new Date();
      const dataFim = new Date();
      
      if (periodo === '7') {
        dataInicio.setDate(dataInicio.getDate() - 7);
      } else if (periodo === '30') {
        dataInicio.setDate(dataInicio.getDate() - 30);
      } else if (periodo === '90') {
        dataInicio.setDate(dataInicio.getDate() - 90);
      } else if (periodo === '180') {
        dataInicio.setDate(dataInicio.getDate() - 180);
      } else if (periodo === '365') {
        dataInicio.setDate(dataInicio.getDate() - 365);
      } else {
        // Período personalizado
        const dataInicioParam = req.query.dataInicio;
        if (dataInicioParam) {
          dataInicio = new Date(dataInicioParam as string);
        } else {
          dataInicio.setDate(dataInicio.getDate() - 30); // Padrão: 30 dias
        }
        
        const dataFimParam = req.query.dataFim;
        if (dataFimParam) {
          dataFim.setTime(new Date(dataFimParam as string).getTime());
        }
      }
      
      // Formatar para ISO string (YYYY-MM-DD)
      const dataInicioFormatada = dataInicio.toISOString().split('T')[0];
      const dataFimFormatada = dataFim.toISOString().split('T')[0];
      
      // 1. Buscar saldo total em todas as contas
      const contas = await db.select({
        id: contasFinanceirasTable.id,
        nome: contasFinanceirasTable.nome,
        tipo: contasFinanceirasTable.tipo,
        saldoAtual: contasFinanceirasTable.saldoAtual
      })
      .from(contasFinanceirasTable)
      .where(
        and(
          eq(contasFinanceirasTable.organizacaoId, organizationId),
          eq(contasFinanceirasTable.ativo, true)
        )
      );
      
      const saldoTotal = contas.reduce((acc, conta) => acc + Number(conta.saldoAtual), 0);
      
      // 2. Buscar total de receitas no período
      const receitasTotal = await db.select({
        total: sql`sum(${transacoesFinanceirasTable.valor})`
      })
      .from(transacoesFinanceirasTable)
      .where(
        and(
          eq(transacoesFinanceirasTable.organizacaoId, organizationId),
          eq(transacoesFinanceirasTable.tipo, 'receita'),
          eq(transacoesFinanceirasTable.status, 'pago'),
          gte(transacoesFinanceirasTable.dataPagamento, dataInicioFormatada),
          lte(transacoesFinanceirasTable.dataPagamento, dataFimFormatada)
        )
      );
      
      // 3. Buscar total de despesas no período
      const despesasTotal = await db.select({
        total: sql`sum(${transacoesFinanceirasTable.valor})`
      })
      .from(transacoesFinanceirasTable)
      .where(
        and(
          eq(transacoesFinanceirasTable.organizacaoId, organizationId),
          eq(transacoesFinanceirasTable.tipo, 'despesa'),
          eq(transacoesFinanceirasTable.status, 'pago'),
          gte(transacoesFinanceirasTable.dataPagamento, dataInicioFormatada),
          lte(transacoesFinanceirasTable.dataPagamento, dataFimFormatada)
        )
      );
      
      // 4. Buscar total a receber
      const contasReceber = await db.select({
        total: sql`sum(${transacoesFinanceirasTable.valor})`
      })
      .from(transacoesFinanceirasTable)
      .where(
        and(
          eq(transacoesFinanceirasTable.organizacaoId, organizationId),
          eq(transacoesFinanceirasTable.tipo, 'receita'),
          eq(transacoesFinanceirasTable.status, 'pendente'),
          gte(transacoesFinanceirasTable.dataVencimento, new Date().toISOString().split('T')[0])
        )
      );
      
      // 5. Buscar total a pagar
      const contasPagar = await db.select({
        total: sql`sum(${transacoesFinanceirasTable.valor})`
      })
      .from(transacoesFinanceirasTable)
      .where(
        and(
          eq(transacoesFinanceirasTable.organizacaoId, organizationId),
          eq(transacoesFinanceirasTable.tipo, 'despesa'),
          eq(transacoesFinanceirasTable.status, 'pendente'),
          gte(transacoesFinanceirasTable.dataVencimento, new Date().toISOString().split('T')[0])
        )
      );
      
      // 6. Buscar contas atrasadas
      const contasAtrasadas = await db.select({
        total: sql`sum(${transacoesFinanceirasTable.valor})`
      })
      .from(transacoesFinanceirasTable)
      .where(
        and(
          eq(transacoesFinanceirasTable.organizacaoId, organizationId),
          eq(transacoesFinanceirasTable.tipo, 'despesa'),
          or(
            eq(transacoesFinanceirasTable.status, 'pendente'), 
            eq(transacoesFinanceirasTable.status, 'atrasado')
          ),
          lt(transacoesFinanceirasTable.dataVencimento, new Date().toISOString().split('T')[0])
        )
      );
      
      // 7. Buscar receitas por categoria
      const receitasPorCategoria = await db.select({
        categoriaId: transacoesFinanceirasTable.categoriaId,
        categoriaNome: categoriasFinanceirasTable.nome,
        categoriaCor: categoriasFinanceirasTable.cor,
        total: sql`sum(${transacoesFinanceirasTable.valor})`
      })
      .from(transacoesFinanceirasTable)
      .leftJoin(
        categoriasFinanceirasTable,
        eq(transacoesFinanceirasTable.categoriaId, categoriasFinanceirasTable.id)
      )
      .where(
        and(
          eq(transacoesFinanceirasTable.organizacaoId, organizationId),
          eq(transacoesFinanceirasTable.tipo, 'receita'),
          eq(transacoesFinanceirasTable.status, 'pago'),
          gte(transacoesFinanceirasTable.dataPagamento, dataInicioFormatada),
          lte(transacoesFinanceirasTable.dataPagamento, dataFimFormatada),
          isNull(transacoesFinanceirasTable.categoriaId).not()
        )
      )
      .groupBy(
        transacoesFinanceirasTable.categoriaId,
        categoriasFinanceirasTable.nome,
        categoriasFinanceirasTable.cor
      )
      .orderBy(desc(sql`sum(${transacoesFinanceirasTable.valor})`));
      
      // 8. Buscar despesas por categoria
      const despesasPorCategoria = await db.select({
        categoriaId: transacoesFinanceirasTable.categoriaId,
        categoriaNome: categoriasFinanceirasTable.nome,
        categoriaCor: categoriasFinanceirasTable.cor,
        total: sql`sum(${transacoesFinanceirasTable.valor})`
      })
      .from(transacoesFinanceirasTable)
      .leftJoin(
        categoriasFinanceirasTable,
        eq(transacoesFinanceirasTable.categoriaId, categoriasFinanceirasTable.id)
      )
      .where(
        and(
          eq(transacoesFinanceirasTable.organizacaoId, organizationId),
          eq(transacoesFinanceirasTable.tipo, 'despesa'),
          eq(transacoesFinanceirasTable.status, 'pago'),
          gte(transacoesFinanceirasTable.dataPagamento, dataInicioFormatada),
          lte(transacoesFinanceirasTable.dataPagamento, dataFimFormatada),
          isNull(transacoesFinanceirasTable.categoriaId).not()
        )
      )
      .groupBy(
        transacoesFinanceirasTable.categoriaId,
        categoriasFinanceirasTable.nome,
        categoriasFinanceirasTable.cor
      )
      .orderBy(desc(sql`sum(${transacoesFinanceirasTable.valor})`));
      
      // 9. Buscar eventos financeiros recentes
      const transacoesRecentes = await db.select({
        id: transacoesFinanceirasTable.id,
        descricao: transacoesFinanceirasTable.descricao,
        valor: transacoesFinanceirasTable.valor,
        dataVencimento: transacoesFinanceirasTable.dataVencimento,
        dataPagamento: transacoesFinanceirasTable.dataPagamento,
        status: transacoesFinanceirasTable.status,
        tipo: transacoesFinanceirasTable.tipo,
        contaNome: contasFinanceirasTable.nome,
        categoriaNome: categoriasFinanceirasTable.nome
      })
      .from(transacoesFinanceirasTable)
      .leftJoin(
        contasFinanceirasTable,
        eq(transacoesFinanceirasTable.contaId, contasFinanceirasTable.id)
      )
      .leftJoin(
        categoriasFinanceirasTable,
        eq(transacoesFinanceirasTable.categoriaId, categoriasFinanceirasTable.id)
      )
      .where(
        and(
          eq(transacoesFinanceirasTable.organizacaoId, organizationId),
          or(
            and(
              gte(transacoesFinanceirasTable.dataVencimento, dataInicioFormatada),
              lte(transacoesFinanceirasTable.dataVencimento, dataFimFormatada)
            ),
            and(
              gte(transacoesFinanceirasTable.dataPagamento, dataInicioFormatada),
              lte(transacoesFinanceirasTable.dataPagamento, dataFimFormatada)
            )
          )
        )
      )
      .orderBy(desc(transacoesFinanceirasTable.criadoEm))
      .limit(10);
      
      // 10. Buscar evolução do saldo
      const evolucaoSaldo = await calcularEvolucaoSaldo(
        organizationId,
        dataInicio,
        dataFim
      );
      
      return res.status(200).json({
        saldoTotal,
        contas,
        receitas: {
          total: Number(receitasTotal[0].total) || 0,
          porCategoria: receitasPorCategoria
        },
        despesas: {
          total: Number(despesasTotal[0].total) || 0,
          porCategoria: despesasPorCategoria
        },
        contasReceber: Number(contasReceber[0].total) || 0,
        contasPagar: Number(contasPagar[0].total) || 0,
        contasAtrasadas: Number(contasAtrasadas[0].total) || 0,
        transacoesRecentes,
        evolucaoSaldo,
        periodo: {
          dataInicio: dataInicioFormatada,
          dataFim: dataFimFormatada
        }
      });
    } catch (error) {
      console.error("[Financeiro API] Erro ao buscar resumo financeiro:", error);
      return res.status(500).json({ message: "Erro ao buscar resumo financeiro", error });
    }
  });

  /**
   * ===== FUNÇÕES AUXILIARES =====
   */

  // Função para calcular a próxima data com base na recorrência
  function calcularProximaData(dataBase: Date, recorrencia: string, multiplicador: number): Date {
    const novaData = new Date(dataBase);
    
    switch (recorrencia) {
      case 'diaria':
        novaData.setDate(novaData.getDate() + (1 * multiplicador));
        break;
      case 'semanal':
        novaData.setDate(novaData.getDate() + (7 * multiplicador));
        break;
      case 'quinzenal':
        novaData.setDate(novaData.getDate() + (15 * multiplicador));
        break;
      case 'mensal':
        novaData.setMonth(novaData.getMonth() + (1 * multiplicador));
        break;
      case 'bimestral':
        novaData.setMonth(novaData.getMonth() + (2 * multiplicador));
        break;
      case 'trimestral':
        novaData.setMonth(novaData.getMonth() + (3 * multiplicador));
        break;
      case 'semestral':
        novaData.setMonth(novaData.getMonth() + (6 * multiplicador));
        break;
      case 'anual':
        novaData.setFullYear(novaData.getFullYear() + (1 * multiplicador));
        break;
      default:
        // Para recorrência 'unica' ou qualquer outro valor não esperado
        break;
    }
    
    return novaData;
  }

  // Função para calcular a evolução do saldo ao longo do tempo
  async function calcularEvolucaoSaldo(
    organizationId: number,
    dataInicio: Date,
    dataFim: Date
  ) {
    // Obter saldo inicial (considerar o saldo no dia anterior ao início do período)
    const dataInicioSaldo = new Date(dataInicio);
    dataInicioSaldo.setDate(dataInicioSaldo.getDate() - 1);
    
    // Buscar saldo inicial em todas as contas
    const contas = await db.select({
      id: contasFinanceirasTable.id,
      nome: contasFinanceirasTable.nome,
      saldoInicial: contasFinanceirasTable.saldoInicial,
      criadoEm: contasFinanceirasTable.criadoEm
    })
    .from(contasFinanceirasTable)
    .where(
      and(
        eq(contasFinanceirasTable.organizacaoId, organizationId),
        eq(contasFinanceirasTable.ativo, true)
      )
    );
    
    // Calcular saldo inicial
    let saldoInicial = contas.reduce((acc, conta) => {
      // Se a conta foi criada depois da data de início, não considerar seu saldo inicial
      if (new Date(conta.criadoEm) > dataInicioSaldo) {
        return acc;
      }
      return acc + Number(conta.saldoInicial);
    }, 0);
    
    // Buscar todas as transações pagas até a data de início
    const transacoesAnteriores = await db.select({
      valor: transacoesFinanceirasTable.valor,
      tipo: transacoesFinanceirasTable.tipo
    })
    .from(transacoesFinanceirasTable)
    .where(
      and(
        eq(transacoesFinanceirasTable.organizacaoId, organizationId),
        eq(transacoesFinanceirasTable.status, 'pago'),
        lt(transacoesFinanceirasTable.dataPagamento, dataInicio.toISOString().split('T')[0]),
        or(
          eq(transacoesFinanceirasTable.tipo, 'receita'),
          eq(transacoesFinanceirasTable.tipo, 'despesa')
        )
      )
    );
    
    // Ajustar saldo inicial com base nas transações anteriores
    for (const transacao of transacoesAnteriores) {
      if (transacao.tipo === 'receita') {
        saldoInicial += Number(transacao.valor);
      } else if (transacao.tipo === 'despesa') {
        saldoInicial -= Number(transacao.valor);
      }
    }
    
    // Buscar todas as transações pagas no período
    const transacoesPeriodo = await db.select({
      valor: transacoesFinanceirasTable.valor,
      tipo: transacoesFinanceirasTable.tipo,
      dataPagamento: transacoesFinanceirasTable.dataPagamento
    })
    .from(transacoesFinanceirasTable)
    .where(
      and(
        eq(transacoesFinanceirasTable.organizacaoId, organizationId),
        eq(transacoesFinanceirasTable.status, 'pago'),
        gte(transacoesFinanceirasTable.dataPagamento, dataInicio.toISOString().split('T')[0]),
        lte(transacoesFinanceirasTable.dataPagamento, dataFim.toISOString().split('T')[0]),
        or(
          eq(transacoesFinanceirasTable.tipo, 'receita'),
          eq(transacoesFinanceirasTable.tipo, 'despesa')
        )
      )
    )
    .orderBy(transacoesFinanceirasTable.dataPagamento);
    
    // Inicializar o array de evolução do saldo
    const evolucaoSaldo = [];
    
    // Criar um mapa para agrupar transações por data
    const transacoesPorData = new Map();
    
    for (const transacao of transacoesPeriodo) {
      const dataFormatada = format(new Date(transacao.dataPagamento!), 'yyyy-MM-dd');
      
      if (!transacoesPorData.has(dataFormatada)) {
        transacoesPorData.set(dataFormatada, {
          receitas: 0,
          despesas: 0
        });
      }
      
      const dadosData = transacoesPorData.get(dataFormatada);
      
      if (transacao.tipo === 'receita') {
        dadosData.receitas += Number(transacao.valor);
      } else if (transacao.tipo === 'despesa') {
        dadosData.despesas += Number(transacao.valor);
      }
    }
    
    // Calcular saldo para cada dia do período
    let saldoAcumulado = saldoInicial;
    let dataAtual = new Date(dataInicio);
    
    while (dataAtual <= dataFim) {
      const dataFormatada = format(dataAtual, 'yyyy-MM-dd');
      
      let receitasDia = 0;
      let despesasDia = 0;
      
      if (transacoesPorData.has(dataFormatada)) {
        const dadosData = transacoesPorData.get(dataFormatada);
        receitasDia = dadosData.receitas;
        despesasDia = dadosData.despesas;
      }
      
      saldoAcumulado = saldoAcumulado + receitasDia - despesasDia;
      
      evolucaoSaldo.push({
        data: dataFormatada,
        saldo: saldoAcumulado,
        receitas: receitasDia,
        despesas: despesasDia
      });
      
      // Avançar para o próximo dia
      dataAtual.setDate(dataAtual.getDate() + 1);
    }
    
    return evolucaoSaldo;
  }
}