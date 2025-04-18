import express, { Express, Request, Response } from 'express';
import { db } from './db';
import * as schema from '../shared/schema-patrimonio';
import { eq, and, desc, sql } from 'drizzle-orm';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from './routes';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    organizationId: number;
    role: string;
    username: string;
  };
}

// Configuração do Multer para upload de imagens e documentos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Diretório base para uploads
    const baseDir = './uploads/patrimonio';
    
    // Verifica se o diretório existe, se não, cria
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    
    cb(null, baseDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

const router = express.Router();

// Middleware para verificar autenticação
const isAuthenticated = (req: AuthenticatedRequest, res: Response, next: express.NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autenticado' });
  }
  next();
};

// Middleware para verificar permissões
const hasModuleAccess = async (req: AuthenticatedRequest, res: Response, next: express.NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autenticado' });
  }

  try {
    // Verificar se a organização tem acesso ao módulo de patrimônio
    const orgId = req.user.organizationId;
    
    // Obter todos os módulos ativos da organização
    const modules = await db.query.organizationModules.findMany({
      where: and(
        eq(schema.organizationModules.organizationId, orgId),
        eq(schema.organizationModules.active, true)
      )
    });
    
    // Verificar se o módulo de patrimônio está ativo
    const hasAccess = modules.some(m => m.moduleId === 'patrimonio' || m.name === 'Patrimônio');
    
    if (!hasAccess) {
      return res.status(403).json({ 
        message: 'A organização não tem acesso ao módulo de patrimônio. Entre em contato com o suporte para ativar este módulo.' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Erro ao verificar acesso ao módulo:', error);
    return res.status(500).json({ message: 'Erro ao verificar permissões' });
  }
};

// ===== INSTALAÇÕES =====

// Listar todas as instalações da organização
router.get('/instalacoes', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    
    const instalacoes = await db.select().from(schema.installations).where(eq(schema.installations.organizationId, orgId));
    
    return res.json(instalacoes);
  } catch (error) {
    console.error('Erro ao buscar instalações:', error);
    return res.status(500).json({ message: 'Erro ao buscar instalações' });
  }
});

// Obter uma instalação específica
router.get('/instalacoes/:id', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    const id = parseInt(req.params.id);
    
    const [instalacao] = await db.select()
      .from(schema.installations)
      .where(and(
        eq(schema.installations.organizationId, orgId),
        eq(schema.installations.id, id)
      ));
    
    if (!instalacao) {
      return res.status(404).json({ message: 'Instalação não encontrada' });
    }
    
    return res.json(instalacao);
  } catch (error) {
    console.error('Erro ao buscar instalação:', error);
    return res.status(500).json({ message: 'Erro ao buscar instalação' });
  }
});

// Criar uma nova instalação
router.post('/instalacoes', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    const instalacaoData = {
      ...req.body,
      organizationId: orgId
    };
    
    const [instalacao] = await db.insert(schema.installations).values(instalacaoData).returning();
    
    return res.status(201).json(instalacao);
  } catch (error) {
    console.error('Erro ao criar instalação:', error);
    return res.status(500).json({ message: 'Erro ao criar instalação' });
  }
});

// Atualizar uma instalação existente
router.put('/instalacoes/:id', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    const id = parseInt(req.params.id);
    
    // Verificar se a instalação existe e pertence à organização
    const [instalacaoExistente] = await db.select()
      .from(schema.installations)
      .where(and(
        eq(schema.installations.organizationId, orgId),
        eq(schema.installations.id, id)
      ));
    
    if (!instalacaoExistente) {
      return res.status(404).json({ message: 'Instalação não encontrada' });
    }
    
    // Remover campos que não devem ser atualizados
    const { id: _, organizationId: __, createdAt: ___, ...updateData } = req.body;
    
    // Atualizar a instalação
    const [instalacaoAtualizada] = await db.update(schema.installations)
      .set({ 
        ...updateData,
        updatedAt: new Date()
      })
      .where(and(
        eq(schema.installations.organizationId, orgId),
        eq(schema.installations.id, id)
      ))
      .returning();
    
    return res.json(instalacaoAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar instalação:', error);
    return res.status(500).json({ message: 'Erro ao atualizar instalação' });
  }
});

// Excluir uma instalação
router.delete('/instalacoes/:id', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    const id = parseInt(req.params.id);
    
    // Verificar se a instalação existe e pertence à organização
    const [instalacaoExistente] = await db.select()
      .from(schema.installations)
      .where(and(
        eq(schema.installations.organizationId, orgId),
        eq(schema.installations.id, id)
      ));
    
    if (!instalacaoExistente) {
      return res.status(404).json({ message: 'Instalação não encontrada' });
    }
    
    // Verificar se existem ativos vinculados a esta instalação
    const ativos = await db.select()
      .from(schema.assets)
      .where(eq(schema.assets.installationId, id));
    
    if (ativos.length > 0) {
      return res.status(400).json({ 
        message: 'Não é possível excluir esta instalação pois existem ativos vinculados a ela. Remova ou transfira os ativos primeiro.' 
      });
    }
    
    // Excluir a instalação
    await db.delete(schema.installations)
      .where(and(
        eq(schema.installations.organizationId, orgId),
        eq(schema.installations.id, id)
      ));
    
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir instalação:', error);
    return res.status(500).json({ message: 'Erro ao excluir instalação' });
  }
});

// ===== ATIVOS (EQUIPAMENTOS) =====

// Listar todos os ativos da organização
router.get('/ativos', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    const { instalacaoId, tipo, status } = req.query;
    
    let query = db.select().from(schema.assets).where(eq(schema.assets.organizationId, orgId));
    
    // Filtrar por instalação se fornecido
    if (instalacaoId) {
      query = query.where(eq(schema.assets.installationId, parseInt(instalacaoId as string)));
    }
    
    // Filtrar por tipo se fornecido
    if (tipo) {
      query = query.where(eq(schema.assets.type, tipo as any));
    }
    
    // Filtrar por status se fornecido
    if (status) {
      query = query.where(eq(schema.assets.status, status as any));
    }
    
    const ativos = await query;
    
    return res.json(ativos);
  } catch (error) {
    console.error('Erro ao buscar ativos:', error);
    return res.status(500).json({ message: 'Erro ao buscar ativos' });
  }
});

// Obter um ativo específico
router.get('/ativos/:id', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    const id = parseInt(req.params.id);
    
    const [ativo] = await db.select()
      .from(schema.assets)
      .where(and(
        eq(schema.assets.organizationId, orgId),
        eq(schema.assets.id, id)
      ));
    
    if (!ativo) {
      return res.status(404).json({ message: 'Ativo não encontrado' });
    }
    
    return res.json(ativo);
  } catch (error) {
    console.error('Erro ao buscar ativo:', error);
    return res.status(500).json({ message: 'Erro ao buscar ativo' });
  }
});

// Criar um novo ativo
router.post('/ativos', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    const ativoData = {
      ...req.body,
      organizationId: orgId
    };
    
    const [ativo] = await db.insert(schema.assets).values(ativoData).returning();
    
    return res.status(201).json(ativo);
  } catch (error) {
    console.error('Erro ao criar ativo:', error);
    return res.status(500).json({ message: 'Erro ao criar ativo' });
  }
});

// Atualizar um ativo existente
router.put('/ativos/:id', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    const id = parseInt(req.params.id);
    
    // Verificar se o ativo existe e pertence à organização
    const [ativoExistente] = await db.select()
      .from(schema.assets)
      .where(and(
        eq(schema.assets.organizationId, orgId),
        eq(schema.assets.id, id)
      ));
    
    if (!ativoExistente) {
      return res.status(404).json({ message: 'Ativo não encontrado' });
    }
    
    // Remover campos que não devem ser atualizados
    const { id: _, organizationId: __, createdAt: ___, ...updateData } = req.body;
    
    // Atualizar o ativo
    const [ativoAtualizado] = await db.update(schema.assets)
      .set({ 
        ...updateData,
        updatedAt: new Date()
      })
      .where(and(
        eq(schema.assets.organizationId, orgId),
        eq(schema.assets.id, id)
      ))
      .returning();
    
    return res.json(ativoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar ativo:', error);
    return res.status(500).json({ message: 'Erro ao atualizar ativo' });
  }
});

// Excluir um ativo
router.delete('/ativos/:id', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    const id = parseInt(req.params.id);
    
    // Verificar se o ativo existe e pertence à organização
    const [ativoExistente] = await db.select()
      .from(schema.assets)
      .where(and(
        eq(schema.assets.organizationId, orgId),
        eq(schema.assets.id, id)
      ));
    
    if (!ativoExistente) {
      return res.status(404).json({ message: 'Ativo não encontrado' });
    }
    
    // Verificar se existem manutenções vinculadas a este ativo
    const manutencoes = await db.select()
      .from(schema.assetMaintenances)
      .where(eq(schema.assetMaintenances.assetId, id));
    
    if (manutencoes.length > 0) {
      return res.status(400).json({ 
        message: 'Não é possível excluir este ativo pois existem manutenções vinculadas a ele. Remova as manutenções primeiro.' 
      });
    }
    
    // Excluir as depreciações do ativo
    await db.delete(schema.assetDepreciations)
      .where(eq(schema.assetDepreciations.assetId, id));
    
    // Excluir o ativo
    await db.delete(schema.assets)
      .where(and(
        eq(schema.assets.organizationId, orgId),
        eq(schema.assets.id, id)
      ));
    
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir ativo:', error);
    return res.status(500).json({ message: 'Erro ao excluir ativo' });
  }
});

// ===== MANUTENÇÕES =====

// Listar todas as manutenções da organização
router.get('/manutencoes', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    const { ativoId, instalacaoId, status, tipo, prioridade } = req.query;
    
    let query = db.select().from(schema.assetMaintenances).where(eq(schema.assetMaintenances.organizationId, orgId));
    
    // Filtrar por ativo se fornecido
    if (ativoId) {
      query = query.where(eq(schema.assetMaintenances.assetId, parseInt(ativoId as string)));
    }
    
    // Filtrar por instalação se fornecido
    if (instalacaoId) {
      query = query.where(eq(schema.assetMaintenances.installationId, parseInt(instalacaoId as string)));
    }
    
    // Filtrar por status se fornecido
    if (status) {
      query = query.where(eq(schema.assetMaintenances.status, status as any));
    }
    
    // Filtrar por tipo se fornecido
    if (tipo) {
      query = query.where(eq(schema.assetMaintenances.type, tipo as any));
    }
    
    // Filtrar por prioridade se fornecido
    if (prioridade) {
      query = query.where(eq(schema.assetMaintenances.priority, prioridade as any));
    }
    
    // Ordenar por data agendada ou data de criação
    query = query.orderBy(desc(schema.assetMaintenances.scheduledDate));
    
    const manutencoes = await query;
    
    return res.json(manutencoes);
  } catch (error) {
    console.error('Erro ao buscar manutenções:', error);
    return res.status(500).json({ message: 'Erro ao buscar manutenções' });
  }
});

// Obter uma manutenção específica
router.get('/manutencoes/:id', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    const id = parseInt(req.params.id);
    
    const [manutencao] = await db.select()
      .from(schema.assetMaintenances)
      .where(and(
        eq(schema.assetMaintenances.organizationId, orgId),
        eq(schema.assetMaintenances.id, id)
      ));
    
    if (!manutencao) {
      return res.status(404).json({ message: 'Manutenção não encontrada' });
    }
    
    return res.json(manutencao);
  } catch (error) {
    console.error('Erro ao buscar manutenção:', error);
    return res.status(500).json({ message: 'Erro ao buscar manutenção' });
  }
});

// Criar uma nova manutenção
router.post('/manutencoes', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    
    // Gerar código para a manutenção (ex: MAN-2023-001)
    const ano = new Date().getFullYear();
    
    // Contar manutenções do ano atual para gerar o número sequencial
    const count = await db.select({ count: sql`count(*)` })
      .from(schema.assetMaintenances)
      .where(and(
        eq(schema.assetMaintenances.organizationId, orgId),
        sql`EXTRACT(YEAR FROM ${schema.assetMaintenances.createdAt}) = ${ano}`
      ));
    
    const sequencial = (count[0]?.count || 0) + 1;
    const codigo = `MAN-${ano}-${String(sequencial).padStart(3, '0')}`;
    
    const manutencaoData = {
      ...req.body,
      organizationId: orgId,
      code: codigo
    };
    
    const [manutencao] = await db.insert(schema.assetMaintenances).values(manutencaoData).returning();
    
    return res.status(201).json(manutencao);
  } catch (error) {
    console.error('Erro ao criar manutenção:', error);
    return res.status(500).json({ message: 'Erro ao criar manutenção' });
  }
});

// Atualizar uma manutenção existente
router.put('/manutencoes/:id', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    const id = parseInt(req.params.id);
    
    // Verificar se a manutenção existe e pertence à organização
    const [manutencaoExistente] = await db.select()
      .from(schema.assetMaintenances)
      .where(and(
        eq(schema.assetMaintenances.organizationId, orgId),
        eq(schema.assetMaintenances.id, id)
      ));
    
    if (!manutencaoExistente) {
      return res.status(404).json({ message: 'Manutenção não encontrada' });
    }
    
    // Remover campos que não devem ser atualizados
    const { id: _, organizationId: __, createdAt: ___, code: ____, ...updateData } = req.body;
    
    // Atualizar a manutenção
    const [manutencaoAtualizada] = await db.update(schema.assetMaintenances)
      .set({ 
        ...updateData,
        updatedAt: new Date()
      })
      .where(and(
        eq(schema.assetMaintenances.organizationId, orgId),
        eq(schema.assetMaintenances.id, id)
      ))
      .returning();
    
    return res.json(manutencaoAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar manutenção:', error);
    return res.status(500).json({ message: 'Erro ao atualizar manutenção' });
  }
});

// Excluir uma manutenção
router.delete('/manutencoes/:id', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    const id = parseInt(req.params.id);
    
    // Verificar se a manutenção existe e pertence à organização
    const [manutencaoExistente] = await db.select()
      .from(schema.assetMaintenances)
      .where(and(
        eq(schema.assetMaintenances.organizationId, orgId),
        eq(schema.assetMaintenances.id, id)
      ));
    
    if (!manutencaoExistente) {
      return res.status(404).json({ message: 'Manutenção não encontrada' });
    }
    
    // Excluir a manutenção
    await db.delete(schema.assetMaintenances)
      .where(and(
        eq(schema.assetMaintenances.organizationId, orgId),
        eq(schema.assetMaintenances.id, id)
      ));
    
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir manutenção:', error);
    return res.status(500).json({ message: 'Erro ao excluir manutenção' });
  }
});

// ===== DEPRECIAÇÕES =====

// Calcular depreciação para um ativo
router.post('/ativos/:id/calcular-depreciacao', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    const id = parseInt(req.params.id);
    
    // Verificar se o ativo existe e pertence à organização
    const [ativo] = await db.select()
      .from(schema.assets)
      .where(and(
        eq(schema.assets.organizationId, orgId),
        eq(schema.assets.id, id)
      ));
    
    if (!ativo) {
      return res.status(404).json({ message: 'Ativo não encontrado' });
    }
    
    // Verificar se o ativo tem os dados necessários para calcular depreciação
    if (!ativo.purchaseDate || !ativo.purchaseValue || !ativo.lifespan) {
      return res.status(400).json({ 
        message: 'Este ativo não possui todos os dados necessários para calcular a depreciação (data de compra, valor de compra e vida útil)' 
      });
    }
    
    // Pegar informações do corpo da requisição
    const { dataReferencia } = req.body;
    const dataRef = dataReferencia ? new Date(dataReferencia) : new Date();
    
    // Converter para valores numéricos
    const valorCompra = Number(ativo.purchaseValue);
    const valorResidual = Number(ativo.salvageValue || 0);
    const vidaUtil = Number(ativo.lifespan);
    const dataCompra = new Date(ativo.purchaseDate);
    
    // Calcular valor depreciável total
    const valorDepreciavel = valorCompra - valorResidual;
    
    // Calcular taxa de depreciação anual e mensal
    const taxaAnual = 100 / vidaUtil; // em percentual
    const taxaMensal = taxaAnual / 12;
    
    // Calcular número de meses entre a data de compra e a data de referência
    const diferencaMeses = (
      (dataRef.getFullYear() - dataCompra.getFullYear()) * 12 + 
      (dataRef.getMonth() - dataCompra.getMonth())
    );
    
    // Verificar se a diferença de meses é válida
    if (diferencaMeses < 0) {
      return res.status(400).json({ 
        message: 'A data de referência não pode ser anterior à data de compra do ativo' 
      });
    }
    
    // Calcular depreciação acumulada
    let depreciacao;
    let depreciaoAcumulada;
    
    // Método de depreciação linear (padrão)
    if (!ativo.depreciationMethod || ativo.depreciationMethod === 'linear') {
      // Calcular depreciação mensal
      const depreciacaoMensal = valorDepreciavel * (taxaMensal / 100);
      
      // Calcular depreciação para o mês atual
      depreciacao = depreciacaoMensal;
      
      // Calcular depreciação acumulada até a data de referência
      // Limitar aos meses de vida útil do ativo
      const mesesEfetivos = Math.min(diferencaMeses, vidaUtil * 12);
      depreciaoAcumulada = depreciacaoMensal * mesesEfetivos;
    } else if (ativo.depreciationMethod === 'saldo_decrescente') {
      // Método de saldo decrescente (taxa dobrada)
      const taxaDecrescente = (taxaAnual / 100) * 2;
      
      // Calcular o valor atual após depreciar até o mês anterior
      let valorAtual = valorCompra;
      let depreciacaoAcumuladaTemp = 0;
      
      for (let i = 0; i < diferencaMeses; i++) {
        const depreciacaoMensal = valorAtual * (taxaDecrescente / 12);
        valorAtual -= depreciacaoMensal;
        depreciacaoAcumuladaTemp += depreciacaoMensal;
        
        // Se chegou ao valor residual, parar a depreciação
        if (valorAtual <= valorResidual) {
          valorAtual = valorResidual;
          break;
        }
      }
      
      // A depreciação do mês atual é a diferença entre o valor original e o valor atual
      depreciacao = valorAtual * (taxaDecrescente / 12);
      depreciaoAcumulada = depreciacaoAcumuladaTemp;
    }
    
    // Calcular valor remanescente
    const valorRemanescente = valorCompra - depreciaoAcumulada;
    
    // Criar registro de depreciação no banco de dados
    const [depreciationRecord] = await db.insert(schema.assetDepreciations).values({
      organizationId: orgId,
      assetId: id,
      year: dataRef.getFullYear(),
      month: dataRef.getMonth() + 1, // +1 porque os meses em JS são base 0
      depreciationAmount: depreciacao,
      accumulatedDepreciation: depreciaoAcumulada,
      remainingValue: valorRemanescente,
      calculationDate: new Date(),
      notes: `Cálculo de depreciação para ${dataRef.toLocaleDateString('pt-BR')}`
    }).returning();
    
    // Atualizar o valor atual do ativo
    await db.update(schema.assets)
      .set({ 
        currentValue: valorRemanescente,
        lastCalculationDate: new Date()
      })
      .where(eq(schema.assets.id, id));
    
    return res.status(201).json({
      ...depreciationRecord,
      details: {
        metodo: ativo.depreciationMethod || 'linear',
        valorOriginal: valorCompra,
        valorResidual: valorResidual,
        valorDepreciavel: valorDepreciavel,
        vidaUtilMeses: vidaUtil * 12,
        taxaAnual: taxaAnual,
        taxaMensal: taxaMensal,
        mesesDecorridos: diferencaMeses,
        valorDepreciadoMesAtual: depreciacao,
        valorDepreciadoAcumulado: depreciaoAcumulada,
        valorRemanescente: valorRemanescente
      }
    });
  } catch (error) {
    console.error('Erro ao calcular depreciação:', error);
    return res.status(500).json({ message: 'Erro ao calcular depreciação' });
  }
});

// Listar histórico de depreciações para um ativo
router.get('/ativos/:id/depreciacoes', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    const id = parseInt(req.params.id);
    
    // Verificar se o ativo existe e pertence à organização
    const [ativo] = await db.select()
      .from(schema.assets)
      .where(and(
        eq(schema.assets.organizationId, orgId),
        eq(schema.assets.id, id)
      ));
    
    if (!ativo) {
      return res.status(404).json({ message: 'Ativo não encontrado' });
    }
    
    // Buscar histórico de depreciações do ativo
    const depreciacoes = await db.select()
      .from(schema.assetDepreciations)
      .where(eq(schema.assetDepreciations.assetId, id))
      .orderBy(desc(schema.assetDepreciations.calculationDate));
    
    return res.json(depreciacoes);
  } catch (error) {
    console.error('Erro ao buscar histórico de depreciações:', error);
    return res.status(500).json({ message: 'Erro ao buscar histórico de depreciações' });
  }
});

// Relatórios de depreciação por período
router.get('/relatorios/depreciacao', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    const { ano, mes } = req.query;
    
    let query = db.select().from(schema.assetDepreciations).where(eq(schema.assetDepreciations.organizationId, orgId));
    
    // Filtrar por ano se fornecido
    if (ano) {
      query = query.where(eq(schema.assetDepreciations.year, parseInt(ano as string)));
    }
    
    // Filtrar por mês se fornecido
    if (mes) {
      query = query.where(eq(schema.assetDepreciations.month, parseInt(mes as string)));
    }
    
    // Ordenar por data de cálculo
    query = query.orderBy(desc(schema.assetDepreciations.calculationDate));
    
    const depreciacoes = await query;
    
    // Calcular totais
    const totalDepreciacao = depreciacoes.reduce((sum, d) => sum + Number(d.depreciationAmount), 0);
    const totalAcumulado = depreciacoes.reduce((sum, d) => sum + Number(d.accumulatedDepreciation), 0);
    const totalRemanescente = depreciacoes.reduce((sum, d) => sum + Number(d.remainingValue), 0);
    
    return res.json({
      items: depreciacoes,
      totais: {
        depreciacao: totalDepreciacao,
        acumulado: totalAcumulado,
        remanescente: totalRemanescente
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de depreciação:', error);
    return res.status(500).json({ message: 'Erro ao gerar relatório de depreciação' });
  }
});

// ===== ENDPOINTS DE UPLOAD =====

// Upload de imagens para instalação
router.post('/instalacoes/:id/imagens', isAuthenticated, upload.array('imagens', 5), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    const id = parseInt(req.params.id);
    const files = req.files as Express.Multer.File[];
    
    // Verificar se a instalação existe e pertence à organização
    const [instalacao] = await db.select()
      .from(schema.installations)
      .where(and(
        eq(schema.installations.organizationId, orgId),
        eq(schema.installations.id, id)
      ));
    
    if (!instalacao) {
      return res.status(404).json({ message: 'Instalação não encontrada' });
    }
    
    // Adicionar imagens ao array existente
    const imagensSalvas = files.map(file => `/uploads/patrimonio/${file.filename}`);
    const imagensAtuais = instalacao.images || [];
    const todasImagens = [...imagensAtuais, ...imagensSalvas];
    
    // Atualizar a instalação com as novas imagens
    const [instalacaoAtualizada] = await db.update(schema.installations)
      .set({ 
        images: todasImagens,
        updatedAt: new Date()
      })
      .where(eq(schema.installations.id, id))
      .returning();
    
    return res.json({ 
      message: 'Imagens enviadas com sucesso',
      images: instalacaoAtualizada.images
    });
  } catch (error) {
    console.error('Erro ao enviar imagens:', error);
    return res.status(500).json({ message: 'Erro ao enviar imagens' });
  }
});

// Upload de imagens para ativos
router.post('/ativos/:id/imagens', isAuthenticated, upload.array('imagens', 5), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    const id = parseInt(req.params.id);
    const files = req.files as Express.Multer.File[];
    
    // Verificar se o ativo existe e pertence à organização
    const [ativo] = await db.select()
      .from(schema.assets)
      .where(and(
        eq(schema.assets.organizationId, orgId),
        eq(schema.assets.id, id)
      ));
    
    if (!ativo) {
      return res.status(404).json({ message: 'Ativo não encontrado' });
    }
    
    // Adicionar imagens ao array existente
    const imagensSalvas = files.map(file => `/uploads/patrimonio/${file.filename}`);
    const imagensAtuais = ativo.images || [];
    const todasImagens = [...imagensAtuais, ...imagensSalvas];
    
    // Atualizar o ativo com as novas imagens
    const [ativoAtualizado] = await db.update(schema.assets)
      .set({ 
        images: todasImagens,
        updatedAt: new Date()
      })
      .where(eq(schema.assets.id, id))
      .returning();
    
    return res.json({ 
      message: 'Imagens enviadas com sucesso',
      images: ativoAtualizado.images
    });
  } catch (error) {
    console.error('Erro ao enviar imagens:', error);
    return res.status(500).json({ message: 'Erro ao enviar imagens' });
  }
});

// ===== DASHBOARD =====

// Dados para dashboard
router.get('/dashboard', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    
    // Total de instalações
    const totalInstalacoes = await db.select({ count: sql`count(*)` })
      .from(schema.installations)
      .where(eq(schema.installations.organizationId, orgId));
    
    // Total de equipamentos
    const totalEquipamentos = await db.select({ count: sql`count(*)` })
      .from(schema.assets)
      .where(eq(schema.assets.organizationId, orgId));
    
    // Total de manutenções pendentes
    const manutencoesPendentes = await db.select({ count: sql`count(*)` })
      .from(schema.assetMaintenances)
      .where(and(
        eq(schema.assetMaintenances.organizationId, orgId),
        sql`${schema.assetMaintenances.status} IN ('agendada', 'planejada')`
      ));
    
    // Valor total do patrimônio
    const valorTotalPatrimonio = await db.select({ total: sql`SUM(current_value)` })
      .from(schema.assets)
      .where(eq(schema.assets.organizationId, orgId));
    
    // Distribuição de equipamentos por categoria
    const equipamentosPorCategoria = await db.select({
      categoria: schema.assets.category,
      count: sql`count(*)`,
      valor: sql`sum(current_value)`
    })
      .from(schema.assets)
      .where(eq(schema.assets.organizationId, orgId))
      .groupBy(schema.assets.category);
    
    // Status dos equipamentos
    const statusEquipamentos = await db.select({
      status: schema.assets.status,
      count: sql`count(*)`,
      valor: sql`sum(current_value)`
    })
      .from(schema.assets)
      .where(eq(schema.assets.organizationId, orgId))
      .groupBy(schema.assets.status);
    
    // Depreciação mensal
    const now = new Date();
    const depreciacao6Meses = await db.select({
      ano: schema.assetDepreciations.year,
      mes: schema.assetDepreciations.month,
      valor: sql`sum(depreciation_amount)`
    })
      .from(schema.assetDepreciations)
      .where(and(
        eq(schema.assetDepreciations.organizationId, orgId),
        sql`(${schema.assetDepreciations.year} * 12 + ${schema.assetDepreciations.month}) > ((${now.getFullYear()} * 12 + ${now.getMonth() + 1}) - 6)`
      ))
      .groupBy(schema.assetDepreciations.year, schema.assetDepreciations.month)
      .orderBy(schema.assetDepreciations.year, schema.assetDepreciations.month);
    
    return res.json({
      totais: {
        instalacoes: totalInstalacoes[0]?.count || 0,
        equipamentos: totalEquipamentos[0]?.count || 0,
        manutencoesPendentes: manutencoesPendentes[0]?.count || 0,
        valorPatrimonio: valorTotalPatrimonio[0]?.total || 0
      },
      equipamentosPorCategoria,
      statusEquipamentos,
      depreciacao6Meses
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    return res.status(500).json({ message: 'Erro ao buscar dados do dashboard' });
  }
});

// Função para registrar as rotas no app
export function registerPatrimonioRoutes(app: Express) {
  // Usar o middleware de autenticação para todas as rotas
  app.use('/api/patrimonio', authenticate, router);

  console.log('Rotas do módulo de patrimônio registradas com sucesso');
}

export default router;