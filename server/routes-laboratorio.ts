import { Express, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { eq, and, desc, like, or, sql } from "drizzle-orm";
import * as laboratorioSchema from "@shared/schema-laboratorio";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/laboratorio');
    // Criar diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniquePrefix = `${Date.now()}-${uuidv4()}`;
    cb(null, `${uniquePrefix}-${file.originalname}`);
  }
});

// Limitar uploads a imagens e PDFs
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado. Envie apenas imagens (JPG, PNG, WEBP) ou PDF.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
  fileFilter
});

// Interface para requisições autenticadas
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
    username: string;
    organizationId?: number;
  };
}

// Middleware para verificar autenticação
const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: "Não autenticado" });
  }
  next();
};

// Middleware para verificar se o usuário é um pesquisador
const isResearcher = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "researcher") {
    return res.status(403).json({ error: "Acesso permitido apenas para pesquisadores" });
  }
  next();
};

// Função para gerar códigos de identificação
function generateCode(prefix: string, id: number): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const paddedId = id.toString().padStart(3, '0');
  return `${prefix}${year}${month}-${paddedId}`;
}

export function registerLaboratorioRoutes(app: Express) {
  // Rotas de amostras
  app.get('/api/laboratorio/amostras', authenticate, isResearcher, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const pesquisadorId = req.user?.id;
      
      // Obter parâmetros de filtro e paginação
      const { status, tipo, data_inicio, data_fim, arquivada, busca, page = 1, limit = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      // Construir consulta base
      let query = db.select().from(laboratorioSchema.amostras)
        .where(eq(laboratorioSchema.amostras.pesquisadorId, pesquisadorId as number))
        .orderBy(desc(laboratorioSchema.amostras.dataEnvio));
      
      // Aplicar filtros
      if (status) {
        query = query.where(eq(laboratorioSchema.amostras.status, status as string));
      }
      
      if (tipo) {
        query = query.where(eq(laboratorioSchema.amostras.tipo, tipo as any));
      }
      
      if (data_inicio && data_fim) {
        const dataInicio = new Date(data_inicio as string);
        const dataFim = new Date(data_fim as string);
        query = query.where(
          and(
            sql`${laboratorioSchema.amostras.dataEnvio} >= ${dataInicio}`,
            sql`${laboratorioSchema.amostras.dataEnvio} <= ${dataFim}`
          )
        );
      }
      
      if (arquivada !== undefined) {
        const isArquivada = arquivada === 'true';
        query = query.where(eq(laboratorioSchema.amostras.arquivada, isArquivada));
      }
      
      if (busca) {
        query = query.where(
          or(
            like(laboratorioSchema.amostras.nome, `%${busca}%`),
            like(laboratorioSchema.amostras.codigo, `%${busca}%`),
            like(laboratorioSchema.amostras.lote, `%${busca}%`)
          )
        );
      }
      
      // Executar consulta com paginação
      const amostras = await query.limit(Number(limit)).offset(offset);
      
      // Obter contagem total para paginação
      const [{ count }] = await db.select({ 
        count: sql<number>`count(*)` 
      }).from(laboratorioSchema.amostras)
        .where(eq(laboratorioSchema.amostras.pesquisadorId, pesquisadorId as number));
      
      // Adicionando imagens às amostras
      const amostrasComImagens = await Promise.all(amostras.map(async (amostra) => {
        const imagens = await db.select().from(laboratorioSchema.amostraImages)
          .where(eq(laboratorioSchema.amostraImages.amostraId, amostra.id));
        
        return { ...amostra, imagens };
      }));
      
      // Retornar resultados com metadados de paginação
      res.json({
        data: amostrasComImagens,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(count / Number(limit))
        }
      });
    } catch (error) {
      console.error('Erro ao buscar amostras:', error);
      res.status(500).json({ error: "Erro ao buscar amostras" });
    }
  });

  app.get('/api/laboratorio/amostras/:id', authenticate, isResearcher, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const pesquisadorId = req.user?.id;

      // Verificar se o ID é numérico ou um código
      let query;
      if (isNaN(Number(id))) {
        // É um código
        query = db.select().from(laboratorioSchema.amostras)
          .where(and(
            eq(laboratorioSchema.amostras.codigo, id),
            eq(laboratorioSchema.amostras.pesquisadorId, pesquisadorId as number)
          ));
      } else {
        // É um ID numérico
        query = db.select().from(laboratorioSchema.amostras)
          .where(and(
            eq(laboratorioSchema.amostras.id, Number(id)),
            eq(laboratorioSchema.amostras.pesquisadorId, pesquisadorId as number)
          ));
      }

      const [amostra] = await query;

      if (!amostra) {
        return res.status(404).json({ error: "Amostra não encontrada" });
      }

      // Buscar imagens da amostra
      const imagens = await db.select().from(laboratorioSchema.amostraImages)
        .where(eq(laboratorioSchema.amostraImages.amostraId, amostra.id));

      // Buscar resultados relacionados à amostra
      const resultados = await db.select().from(laboratorioSchema.resultados)
        .where(eq(laboratorioSchema.resultados.amostraId, amostra.id))
        .orderBy(desc(laboratorioSchema.resultados.updatedAt));

      // Combinar tudo
      const amostraCompleta = {
        ...amostra,
        imagens,
        resultados
      };

      res.json(amostraCompleta);
    } catch (error) {
      console.error('Erro ao buscar detalhes da amostra:', error);
      res.status(500).json({ error: "Erro ao buscar detalhes da amostra" });
    }
  });

  app.post('/api/laboratorio/amostras', authenticate, isResearcher, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const pesquisadorId = req.user?.id;
      const amostraData = laboratorioSchema.insertAmostraSchema.parse({
        ...req.body,
        pesquisadorId
      });

      // Inserir a amostra no banco
      const [amostra] = await db.insert(laboratorioSchema.amostras)
        .values(amostraData)
        .returning();

      // Gerar e atualizar o código da amostra
      const codigo = generateCode('AM', amostra.id);
      const [amostraAtualizada] = await db.update(laboratorioSchema.amostras)
        .set({ codigo })
        .where(eq(laboratorioSchema.amostras.id, amostra.id))
        .returning();

      res.status(201).json(amostraAtualizada);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados de amostra inválidos", details: error.format() });
      }
      console.error('Erro ao criar amostra:', error);
      res.status(500).json({ error: "Erro ao criar amostra" });
    }
  });

  app.put('/api/laboratorio/amostras/:id', authenticate, isResearcher, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const pesquisadorId = req.user?.id;

      // Verificar se a amostra existe e pertence ao pesquisador
      const [amostraExistente] = await db.select().from(laboratorioSchema.amostras)
        .where(and(
          eq(laboratorioSchema.amostras.id, Number(id)),
          eq(laboratorioSchema.amostras.pesquisadorId, pesquisadorId as number)
        ));

      if (!amostraExistente) {
        return res.status(404).json({ error: "Amostra não encontrada ou não pertence ao pesquisador" });
      }

      // Validar dados de atualização, mantendo o ID do pesquisador
      const amostraData = laboratorioSchema.insertAmostraSchema.parse({
        ...req.body,
        pesquisadorId
      });

      // Atualizar amostra
      const [amostraAtualizada] = await db.update(laboratorioSchema.amostras)
        .set({
          ...amostraData,
          updatedAt: new Date()
        })
        .where(eq(laboratorioSchema.amostras.id, Number(id)))
        .returning();

      res.json(amostraAtualizada);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados de amostra inválidos", details: error.format() });
      }
      console.error('Erro ao atualizar amostra:', error);
      res.status(500).json({ error: "Erro ao atualizar amostra" });
    }
  });

  app.delete('/api/laboratorio/amostras/:id', authenticate, isResearcher, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const pesquisadorId = req.user?.id;

      // Verificar se a amostra existe e pertence ao pesquisador
      const [amostraExistente] = await db.select().from(laboratorioSchema.amostras)
        .where(and(
          eq(laboratorioSchema.amostras.id, Number(id)),
          eq(laboratorioSchema.amostras.pesquisadorId, pesquisadorId as number)
        ));

      if (!amostraExistente) {
        return res.status(404).json({ error: "Amostra não encontrada ou não pertence ao pesquisador" });
      }

      // Verificar se existem resultados para esta amostra
      const [resultado] = await db.select({ count: sql<number>`count(*)` })
        .from(laboratorioSchema.resultados)
        .where(eq(laboratorioSchema.resultados.amostraId, Number(id)));

      if (resultado.count > 0) {
        // Se existem resultados, apenas marcar como arquivada
        await db.update(laboratorioSchema.amostras)
          .set({ 
            arquivada: true,
            updatedAt: new Date()
          })
          .where(eq(laboratorioSchema.amostras.id, Number(id)));
        
        return res.json({ message: "Amostra arquivada com sucesso", archived: true });
      }

      // Se não existem resultados, deletar as imagens relacionadas
      await db.delete(laboratorioSchema.amostraImages)
        .where(eq(laboratorioSchema.amostraImages.amostraId, Number(id)));

      // E então deletar a amostra
      await db.delete(laboratorioSchema.amostras)
        .where(eq(laboratorioSchema.amostras.id, Number(id)));

      res.json({ message: "Amostra removida com sucesso", archived: false });
    } catch (error) {
      console.error('Erro ao remover amostra:', error);
      res.status(500).json({ error: "Erro ao remover amostra" });
    }
  });

  // Upload de imagens de amostras
  app.post('/api/laboratorio/amostras/:id/imagens', authenticate, isResearcher, upload.array('imagens', 5), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const pesquisadorId = req.user?.id;
      const files = req.files as Express.Multer.File[];

      // Verificar se a amostra existe e pertence ao pesquisador
      const [amostraExistente] = await db.select().from(laboratorioSchema.amostras)
        .where(and(
          eq(laboratorioSchema.amostras.id, Number(id)),
          eq(laboratorioSchema.amostras.pesquisadorId, pesquisadorId as number)
        ));

      if (!amostraExistente) {
        // Remover arquivos enviados
        files.forEach(file => {
          fs.unlinkSync(file.path);
        });
        
        return res.status(404).json({ error: "Amostra não encontrada ou não pertence ao pesquisador" });
      }

      if (!files || files.length === 0) {
        return res.status(400).json({ error: "Nenhuma imagem enviada" });
      }

      // Processar cada arquivo
      const imagens = await Promise.all(files.map(async (file) => {
        // URL relativa do arquivo
        const urlRelativa = `/uploads/laboratorio/${path.basename(file.path)}`;
        
        // Inserir na tabela de imagens
        const [imagem] = await db.insert(laboratorioSchema.amostraImages)
          .values({
            amostraId: Number(id),
            url: urlRelativa,
            tipo: file.mimetype,
            descricao: req.body.descricao || `Imagem da amostra ${amostraExistente.codigo}`
          })
          .returning();
          
        return imagem;
      }));

      // Atualizar timestamp da amostra
      await db.update(laboratorioSchema.amostras)
        .set({ updatedAt: new Date() })
        .where(eq(laboratorioSchema.amostras.id, Number(id)));

      res.status(201).json(imagens);
    } catch (error) {
      console.error('Erro ao enviar imagens:', error);
      res.status(500).json({ error: "Erro ao enviar imagens" });
    }
  });

  // Rotas de equipamentos
  app.get('/api/laboratorio/equipamentos', authenticate, isResearcher, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Obter parâmetros de filtro e paginação
      const { status, tipo, busca, page = 1, limit = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      // Construir consulta base
      let query = db.select().from(laboratorioSchema.equipamentos)
        .orderBy(laboratorioSchema.equipamentos.nome);
      
      // Aplicar filtros
      if (status) {
        query = query.where(eq(laboratorioSchema.equipamentos.status, status as string));
      }
      
      if (tipo) {
        query = query.where(eq(laboratorioSchema.equipamentos.tipo, tipo as any));
      }
      
      if (busca) {
        query = query.where(
          or(
            like(laboratorioSchema.equipamentos.nome, `%${busca}%`),
            like(laboratorioSchema.equipamentos.codigo, `%${busca}%`),
            like(laboratorioSchema.equipamentos.modelo, `%${busca}%`),
            like(laboratorioSchema.equipamentos.fabricante, `%${busca}%`),
            like(laboratorioSchema.equipamentos.numeroSerie, `%${busca}%`),
            like(laboratorioSchema.equipamentos.localizacao, `%${busca}%`)
          )
        );
      }
      
      // Executar consulta com paginação
      const equipamentos = await query.limit(Number(limit)).offset(offset);
      
      // Obter contagem total para paginação
      const [{ count }] = await db.select({ 
        count: sql<number>`count(*)` 
      }).from(laboratorioSchema.equipamentos);
      
      // Retornar resultados com metadados de paginação
      res.json({
        data: equipamentos,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(count / Number(limit))
        }
      });
    } catch (error) {
      console.error('Erro ao buscar equipamentos:', error);
      res.status(500).json({ error: "Erro ao buscar equipamentos" });
    }
  });

  app.get('/api/laboratorio/equipamentos/:id', authenticate, isResearcher, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;

      // Verificar se o ID é numérico ou um código
      let query;
      if (isNaN(Number(id))) {
        // É um código
        query = db.select().from(laboratorioSchema.equipamentos)
          .where(eq(laboratorioSchema.equipamentos.codigo, id));
      } else {
        // É um ID numérico
        query = db.select().from(laboratorioSchema.equipamentos)
          .where(eq(laboratorioSchema.equipamentos.id, Number(id)));
      }

      const [equipamento] = await query;

      if (!equipamento) {
        return res.status(404).json({ error: "Equipamento não encontrado" });
      }

      // Buscar agendamentos futuros para este equipamento
      const hoje = new Date();
      const agendamentos = await db.select().from(laboratorioSchema.agendamentos)
        .where(and(
          eq(laboratorioSchema.agendamentos.equipamentoId, equipamento.id),
          sql`${laboratorioSchema.agendamentos.data} >= ${hoje}`
        ))
        .orderBy(laboratorioSchema.agendamentos.data, laboratorioSchema.agendamentos.horaInicio);

      // Combinar tudo
      const equipamentoCompleto = {
        ...equipamento,
        agendamentos
      };

      res.json(equipamentoCompleto);
    } catch (error) {
      console.error('Erro ao buscar detalhes do equipamento:', error);
      res.status(500).json({ error: "Erro ao buscar detalhes do equipamento" });
    }
  });

  // Rotas de resultados
  app.get('/api/laboratorio/resultados', authenticate, isResearcher, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const pesquisadorId = req.user?.id;
      
      // Obter parâmetros de filtro e paginação
      const { status, tipo, amostraId, page = 1, limit = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      // Primeiro precisamos buscar as amostras do pesquisador
      const amostras = await db.select({ id: laboratorioSchema.amostras.id })
        .from(laboratorioSchema.amostras)
        .where(eq(laboratorioSchema.amostras.pesquisadorId, pesquisadorId as number));
      
      const amostraIds = amostras.map(a => a.id);
      
      if (amostraIds.length === 0) {
        return res.json({
          data: [],
          pagination: {
            total: 0,
            page: Number(page),
            limit: Number(limit),
            totalPages: 0
          }
        });
      }
      
      // Construir consulta base para resultados daquelas amostras
      let query = db.select({
        resultado: laboratorioSchema.resultados,
        amostra: {
          id: laboratorioSchema.amostras.id,
          codigo: laboratorioSchema.amostras.codigo,
          nome: laboratorioSchema.amostras.nome,
          tipo: laboratorioSchema.amostras.tipo
        }
      })
      .from(laboratorioSchema.resultados)
      .innerJoin(
        laboratorioSchema.amostras,
        eq(laboratorioSchema.resultados.amostraId, laboratorioSchema.amostras.id)
      )
      .where(sql`${laboratorioSchema.resultados.amostraId} IN (${amostraIds.join(',')})`)
      .orderBy(desc(laboratorioSchema.resultados.updatedAt));
      
      // Aplicar filtros
      if (status) {
        query = query.where(eq(laboratorioSchema.resultados.status, status as string));
      }
      
      if (tipo) {
        query = query.where(eq(laboratorioSchema.resultados.tipo, tipo as any));
      }
      
      if (amostraId) {
        query = query.where(eq(laboratorioSchema.resultados.amostraId, Number(amostraId)));
      }
      
      // Executar consulta com paginação
      const resultadosRaw = await query.limit(Number(limit)).offset(offset);
      
      // Formatar resultados
      const resultados = resultadosRaw.map(item => ({
        ...item.resultado,
        amostra: item.amostra
      }));
      
      // Obter contagem total para paginação
      const [{ count }] = await db.select({ 
        count: sql<number>`count(*)` 
      })
      .from(laboratorioSchema.resultados)
      .where(sql`${laboratorioSchema.resultados.amostraId} IN (${amostraIds.join(',')})`);
      
      // Retornar resultados com metadados de paginação
      res.json({
        data: resultados,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(count / Number(limit))
        }
      });
    } catch (error) {
      console.error('Erro ao buscar resultados:', error);
      res.status(500).json({ error: "Erro ao buscar resultados" });
    }
  });

  app.get('/api/laboratorio/resultados/:id', authenticate, isResearcher, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const pesquisadorId = req.user?.id;

      // Primeiro buscar o resultado
      let resultadoQuery;
      if (isNaN(Number(id))) {
        // É um código
        resultadoQuery = db.select().from(laboratorioSchema.resultados)
          .where(eq(laboratorioSchema.resultados.codigo, id));
      } else {
        // É um ID numérico
        resultadoQuery = db.select().from(laboratorioSchema.resultados)
          .where(eq(laboratorioSchema.resultados.id, Number(id)));
      }

      const [resultado] = await resultadoQuery;

      if (!resultado) {
        return res.status(404).json({ error: "Resultado não encontrado" });
      }

      // Verificar se a amostra pertence ao pesquisador
      const [amostra] = await db.select().from(laboratorioSchema.amostras)
        .where(and(
          eq(laboratorioSchema.amostras.id, resultado.amostraId),
          eq(laboratorioSchema.amostras.pesquisadorId, pesquisadorId as number)
        ));

      if (!amostra) {
        return res.status(403).json({ error: "Você não tem permissão para acessar este resultado" });
      }

      // Buscar equipamento relacionado, se houver
      let equipamento = null;
      if (resultado.equipamentoId) {
        const [equip] = await db.select().from(laboratorioSchema.equipamentos)
          .where(eq(laboratorioSchema.equipamentos.id, resultado.equipamentoId));
        
        equipamento = equip;
      }

      // Combinar tudo
      const resultadoCompleto = {
        ...resultado,
        amostra,
        equipamento
      };

      res.json(resultadoCompleto);
    } catch (error) {
      console.error('Erro ao buscar detalhes do resultado:', error);
      res.status(500).json({ error: "Erro ao buscar detalhes do resultado" });
    }
  });

  // Rota para agendar uso de equipamento
  app.post('/api/laboratorio/agendamentos', authenticate, isResearcher, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const pesquisadorId = req.user?.id;
      const agendamentoData = laboratorioSchema.insertAgendamentoSchema.parse({
        ...req.body,
        pesquisadorId
      });

      // Verificar se o equipamento existe
      const [equipamento] = await db.select().from(laboratorioSchema.equipamentos)
        .where(eq(laboratorioSchema.equipamentos.id, agendamentoData.equipamentoId));

      if (!equipamento) {
        return res.status(404).json({ error: "Equipamento não encontrado" });
      }

      // Verificar se o equipamento está disponível
      if (equipamento.status !== 'disponivel' && equipamento.status !== 'em_uso') {
        return res.status(400).json({ 
          error: "Equipamento não disponível para agendamento",
          status: equipamento.status 
        });
      }

      // Verificar conflitos de horário
      const dataAgendamento = new Date(agendamentoData.data);
      const horaInicio = agendamentoData.horaInicio;
      const horaFim = agendamentoData.horaFim;

      const agendamentosExistentes = await db.select().from(laboratorioSchema.agendamentos)
        .where(and(
          eq(laboratorioSchema.agendamentos.equipamentoId, agendamentoData.equipamentoId),
          eq(laboratorioSchema.agendamentos.data, dataAgendamento)
        ));

      // Verificar conflitos de horário
      const conflito = agendamentosExistentes.some(a => {
        // Verificar se existe sobreposição de horários
        return (
          (horaInicio >= a.horaInicio && horaInicio < a.horaFim) ||
          (horaFim > a.horaInicio && horaFim <= a.horaFim) ||
          (horaInicio <= a.horaInicio && horaFim >= a.horaFim)
        );
      });

      if (conflito) {
        return res.status(400).json({ 
          error: "Conflito de horário com agendamento existente",
          conflitos: agendamentosExistentes 
        });
      }

      // Inserir o agendamento
      const [agendamento] = await db.insert(laboratorioSchema.agendamentos)
        .values(agendamentoData)
        .returning();

      // Se for um agendamento para hoje ou amanhã, atualizar o status do equipamento
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);

      if (
        (dataAgendamento.getTime() === hoje.getTime() || 
         dataAgendamento.getTime() === amanha.getTime()) &&
        equipamento.status === 'disponivel'
      ) {
        await db.update(laboratorioSchema.equipamentos)
          .set({ 
            status: 'em_uso',
            updatedAt: new Date()
          })
          .where(eq(laboratorioSchema.equipamentos.id, agendamentoData.equipamentoId));
      }

      res.status(201).json(agendamento);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados de agendamento inválidos", details: error.format() });
      }
      console.error('Erro ao agendar equipamento:', error);
      res.status(500).json({ error: "Erro ao agendar equipamento" });
    }
  });

  // Estatísticas do laboratório para dashboard
  app.get('/api/laboratorio/dashboard/stats', authenticate, isResearcher, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const pesquisadorId = req.user?.id;

      // Estatísticas de amostras
      const totalAmostras = await db.select({ count: sql<number>`count(*)` })
        .from(laboratorioSchema.amostras)
        .where(eq(laboratorioSchema.amostras.pesquisadorId, pesquisadorId as number));

      const amostrasPorStatus = await db.select({
        status: laboratorioSchema.amostras.status,
        count: sql<number>`count(*)`
      })
      .from(laboratorioSchema.amostras)
      .where(eq(laboratorioSchema.amostras.pesquisadorId, pesquisadorId as number))
      .groupBy(laboratorioSchema.amostras.status);

      // Amostras recentes
      const amostrasRecentes = await db.select().from(laboratorioSchema.amostras)
        .where(eq(laboratorioSchema.amostras.pesquisadorId, pesquisadorId as number))
        .orderBy(desc(laboratorioSchema.amostras.createdAt))
        .limit(5);

      // Estatísticas de resultados
      const totalResultados = await db.select({ count: sql<number>`count(*)` })
        .from(laboratorioSchema.resultados)
        .innerJoin(
          laboratorioSchema.amostras,
          eq(laboratorioSchema.resultados.amostraId, laboratorioSchema.amostras.id)
        )
        .where(eq(laboratorioSchema.amostras.pesquisadorId, pesquisadorId as number));

      const resultadosPorStatus = await db.select({
        status: laboratorioSchema.resultados.status,
        count: sql<number>`count(*)`
      })
      .from(laboratorioSchema.resultados)
      .innerJoin(
        laboratorioSchema.amostras,
        eq(laboratorioSchema.resultados.amostraId, laboratorioSchema.amostras.id)
      )
      .where(eq(laboratorioSchema.amostras.pesquisadorId, pesquisadorId as number))
      .groupBy(laboratorioSchema.resultados.status);

      // Agendamentos futuros
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const agendamentosFuturos = await db.select({
        agendamento: laboratorioSchema.agendamentos,
        equipamento: {
          id: laboratorioSchema.equipamentos.id,
          nome: laboratorioSchema.equipamentos.nome,
          tipo: laboratorioSchema.equipamentos.tipo
        }
      })
      .from(laboratorioSchema.agendamentos)
      .innerJoin(
        laboratorioSchema.equipamentos,
        eq(laboratorioSchema.agendamentos.equipamentoId, laboratorioSchema.equipamentos.id)
      )
      .where(and(
        eq(laboratorioSchema.agendamentos.pesquisadorId, pesquisadorId as number),
        sql`${laboratorioSchema.agendamentos.data} >= ${hoje}`
      ))
      .orderBy(laboratorioSchema.agendamentos.data, laboratorioSchema.agendamentos.horaInicio)
      .limit(5);

      // Formatar agendamentos
      const agendamentos = agendamentosFuturos.map(ag => ({
        ...ag.agendamento,
        equipamento: ag.equipamento
      }));

      // Retornar todas as estatísticas
      res.json({
        amostras: {
          total: totalAmostras[0].count,
          porStatus: amostrasPorStatus,
          recentes: amostrasRecentes
        },
        resultados: {
          total: totalResultados[0].count,
          porStatus: resultadosPorStatus,
        },
        agendamentos: {
          proximos: agendamentos
        }
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas do laboratório:', error);
      res.status(500).json({ error: "Erro ao buscar estatísticas do laboratório" });
    }
  });

  console.log("Rotas do módulo de laboratório registradas com sucesso");
}