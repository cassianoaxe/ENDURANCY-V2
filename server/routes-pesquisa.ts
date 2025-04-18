import { Express, Request, Response, NextFunction } from 'express';
import { db } from './db';
import { eq, and, desc, like, ilike, or, asc, sql, isNull, inArray } from 'drizzle-orm';
import {
  pesquisasTable,
  areasConhecimentoTable,
  pacientesPesquisaTable,
  pacientePesquisaParticipacaoTable,
  condicoesTable,
  gruposPesquisaTable,
  membroGrupoTable,
  protocolosTable,
  aprovacaoProtocoloTable,
  colaboracoesTable,
  colaboracaoPesquisaTable,
  publicacoesTable,
  eventosTable,
  insertPesquisaSchema,
  insertAreaConhecimentoSchema,
  insertPacientePesquisaSchema,
  insertPacientePesquisaParticipacaoSchema,
  insertCondicaoSchema,
  insertGrupoPesquisaSchema,
  insertMembroGrupoSchema,
  insertProtocoloSchema,
  insertAprovacaoProtocoloSchema,
  insertColaboracaoSchema,
  insertColaboracaoPesquisaSchema,
  insertPublicacaoSchema,
  insertEventoSchema
} from '@shared/schema-pesquisa';
import { z } from 'zod';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
    organizationId?: number;
  };
}

// Função de middleware para autenticação
const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autenticado' });
  }
  next();
};

// Funções auxiliares para adicionar dados de exemplo para desenvolvimento
async function seedPesquisas(organizationId: number) {
  const areaCount = await db.select({ count: sql<number>`count(*)` })
    .from(areasConhecimentoTable)
    .where(eq(areasConhecimentoTable.organizacaoId, organizationId));

  if (Number(areaCount[0].count) === 0) {
    // Inserir áreas de conhecimento
    const areas = [
      { nome: 'Neurologia', descricao: 'Estudos relacionados ao sistema nervoso', organizacaoId: organizationId },
      { nome: 'Dor Crônica', descricao: 'Estudos sobre manejo da dor crônica', organizacaoId: organizationId },
      { nome: 'Psiquiatria', descricao: 'Estudos relacionados a saúde mental', organizacaoId: organizationId },
      { nome: 'Oncologia', descricao: 'Estudos relacionados ao câncer', organizacaoId: organizationId },
    ];
    
    for (const area of areas) {
      await db.insert(areasConhecimentoTable).values(area);
    }
  }

  const pesquisaCount = await db.select({ count: sql<number>`count(*)` })
    .from(pesquisasTable)
    .where(eq(pesquisasTable.organizacaoId, organizationId));

  if (Number(pesquisaCount[0].count) === 0) {
    const areas = await db.select().from(areasConhecimentoTable)
      .where(eq(areasConhecimentoTable.organizacaoId, organizationId));
    
    if (areas.length > 0) {
      // Inserir pesquisas de exemplo
      const pesquisas = [
        {
          titulo: 'Eficácia do CBD no tratamento da epilepsia refratária',
          descricao: 'Estudo clínico randomizado sobre os efeitos do CBD em pacientes com epilepsia refratária.',
          tipo: 'clinico_randomizado',
          areaId: areas.find(a => a.nome === 'Neurologia')?.id || areas[0].id,
          status: 'em_andamento',
          dataInicio: new Date('2024-01-14'),
          dataPrevistaFim: new Date('2025-01-14'),
          organizacaoId: organizationId
        },
        {
          titulo: 'Efeitos da cannabis em pacientes com dor crônica',
          descricao: 'Estudo observacional sobre os efeitos da cannabis medicinal em pacientes com dor crônica.',
          tipo: 'observacional_prospectivo',
          areaId: areas.find(a => a.nome === 'Dor Crônica')?.id || areas[0].id,
          status: 'em_analise',
          dataInicio: new Date('2023-06-01'),
          dataPrevistaFim: new Date('2024-06-01'),
          organizacaoId: organizationId
        },
        {
          titulo: 'Estudo comparativo de diferentes cepas',
          descricao: 'Comparação da eficácia de diferentes cepas de cannabis no tratamento de condições neurológicas.',
          tipo: 'clinico_randomizado',
          areaId: areas.find(a => a.nome === 'Neurologia')?.id || areas[0].id,
          status: 'aprovada',
          dataInicio: new Date('2023-02-15'),
          dataPrevistaFim: new Date('2024-08-15'),
          organizacaoId: organizationId
        }
      ];

      for (const pesquisa of pesquisas) {
        await db.insert(pesquisasTable).values(pesquisa);
      }
    }
  }

  // Verificar e inserir pacientes de pesquisa de exemplo
  const pacienteCount = await db.select({ count: sql<number>`count(*)` })
    .from(pacientesPesquisaTable)
    .where(eq(pacientesPesquisaTable.organizacaoId, organizationId));

  if (Number(pacienteCount[0].count) === 0) {
    const pacientes = [
      {
        nome: 'Maria Silva',
        idade: 42,
        email: 'maria.silva@exemplo.com',
        telefone: '(11) 98765-4321',
        condicaoPrincipal: 'Epilepsia',
        status: 'ativo',
        organizacaoId: organizationId,
        numConsultas: 5,
        numPrescricoes: 3
      },
      {
        nome: 'João Oliveira',
        idade: 58,
        email: 'joao.oliveira@exemplo.com',
        telefone: '(11) 91234-5678',
        condicaoPrincipal: 'Dor crônica',
        status: 'ativo',
        organizacaoId: organizationId,
        numConsultas: 8,
        numPrescricoes: 5
      },
      {
        nome: 'Ana Santos',
        idade: 35,
        email: 'ana.santos@exemplo.com',
        telefone: '(11) 98888-7777',
        condicaoPrincipal: 'Ansiedade',
        status: 'ativo',
        organizacaoId: organizationId,
        numConsultas: 4,
        numPrescricoes: 2
      }
    ];

    for (const paciente of pacientes) {
      await db.insert(pacientesPesquisaTable).values(paciente);
    }
  }

  // Verificar e inserir condições de exemplo
  const condicaoCount = await db.select({ count: sql<number>`count(*)` })
    .from(condicoesTable)
    .where(eq(condicoesTable.organizacaoId, organizationId));

  if (Number(condicaoCount[0].count) === 0) {
    const condicoes = [
      {
        nome: 'Epilepsia',
        descricao: 'Distúrbio em que a atividade cerebral se torna anormal, causando convulsões ou períodos de comportamento e sensações incomuns.',
        cid: 'G40',
        area: 'neurologia',
        sintomas: ['Convulsões', 'Espasmos musculares', 'Perda de consciência'],
        tratamentosCannabis: ['CBD isolado', 'Espectro Completo'],
        eficaciaTratamentos: JSON.stringify({
          "CBD isolado": "Alta Eficácia",
          "Espectro Completo": "Eficácia Moderada"
        }),
        organizacaoId: organizationId
      },
      {
        nome: 'Dor crônica',
        descricao: 'Dor persistente ou recorrente que dura mais que o tempo normal de cura (geralmente 3 meses).',
        cid: 'R52',
        area: 'neurologia',
        sintomas: ['Dor persistente', 'Limitação de movimentos', 'Rigidez muscular'],
        tratamentosCannabis: ['THC:CBD balanceado', 'CBD predominante'],
        eficaciaTratamentos: JSON.stringify({
          "THC:CBD balanceado": "Alta Eficácia",
          "CBD predominante": "Eficácia Moderada"
        }),
        organizacaoId: organizationId
      },
      {
        nome: 'Esclerose Múltipla',
        descricao: 'Doença autoimune crônica que afeta o sistema nervoso central, danificando a bainha de mielina que protege os nervos.',
        cid: 'G35',
        area: 'neurologia',
        sintomas: ['Fadiga', 'Dificuldade de mobilidade', 'Problemas de coordenação', 'Espasmos musculares'],
        tratamentosCannabis: ['THC:CBD balanceado', 'CBD predominante'],
        eficaciaTratamentos: JSON.stringify({
          "THC:CBD balanceado": "Alta Eficácia",
          "CBD predominante": "Eficácia Moderada"
        }),
        organizacaoId: organizationId
      }
    ];

    for (const condicao of condicoes) {
      await db.insert(condicoesTable).values(condicao);
    }
  }

  // Verificar e inserir grupos de pesquisa
  const grupoCount = await db.select({ count: sql<number>`count(*)` })
    .from(gruposPesquisaTable)
    .where(eq(gruposPesquisaTable.organizacaoId, organizationId));

  if (Number(grupoCount[0].count) === 0) {
    const grupos = [
      {
        nome: 'Grupo de Pesquisa em Neurologia Clínica',
        descricao: 'Pesquisa focada em tratamentos inovadores para epilepsia e doenças neurodegenerativas',
        area: 'Neurologia',
        status: 'ativo',
        liderId: 1, // ID fictício, seria preenchido com um usuário real
        organizacaoId: organizationId
      },
      {
        nome: 'Grupo de Estudos em Dor Crônica',
        descricao: 'Investigação de novos protocolos para tratamento de dor crônica',
        area: 'Dor Crônica',
        status: 'ativo',
        liderId: 2, // ID fictício, seria preenchido com um usuário real
        organizacaoId: organizationId
      },
      {
        nome: 'Núcleo de Pesquisa em Psiquiatria',
        descricao: 'Estudos sobre tratamentos alternativos para transtornos de ansiedade e depressão',
        area: 'Psiquiatria',
        status: 'inativo',
        liderId: 3, // ID fictício, seria preenchido com um usuário real
        organizacaoId: organizationId
      }
    ];

    for (const grupo of grupos) {
      await db.insert(gruposPesquisaTable).values(grupo);
    }
  }

  // Verificar e inserir protocolos
  const protocoloCount = await db.select({ count: sql<number>`count(*)` })
    .from(protocolosTable)
    .where(eq(protocolosTable.organizacaoId, organizationId));

  if (Number(protocoloCount[0].count) === 0) {
    const protocolos = [
      {
        codigo: 'PROT-2023-001',
        titulo: 'Protocolo de Pesquisa: Eficácia do CBD no Tratamento da Epilepsia Refratária',
        autor: 'Dra. Maria Silva',
        metodologia: 'Estudo clínico randomizado',
        versao: '1.0',
        data: new Date('2023-05-14'),
        status: 'aprovado',
        organizacaoId: organizationId
      },
      {
        codigo: 'PROT-2023-002',
        titulo: 'Protocolo de Pesquisa: Cannabis Medicinal no Tratamento da Dor Crônica',
        autor: 'Dr. João Santos',
        metodologia: 'Estudo observacional prospectivo',
        versao: '2.1',
        data: new Date('2023-06-19'),
        status: 'em_revisao',
        organizacaoId: organizationId
      }
    ];

    for (const protocolo of protocolos) {
      await db.insert(protocolosTable).values(protocolo);
    }
  }

  // Verificar e inserir colaborações
  const colaboracaoCount = await db.select({ count: sql<number>`count(*)` })
    .from(colaboracoesTable)
    .where(eq(colaboracoesTable.organizacaoId, organizationId));

  if (Number(colaboracaoCount[0].count) === 0) {
    const colaboracoes = [
      {
        instituicao: 'Universidade Federal de São Paulo',
        descricao: 'Colaboração para pesquisa sobre efeitos da cannabis no tratamento de epilepsia',
        tipo: 'pesquisa',
        localizacao: 'São Paulo, SP',
        dataInicio: new Date('2023-01-14'),
        dataTermino: new Date('2024-01-14'),
        contatoNome: 'Dr. Ricardo Santos',
        contatoCargo: 'Coordenador de Pesquisa',
        status: 'ativa',
        organizacaoId: organizationId
      },
      {
        instituicao: 'Hospital Albert Einstein',
        descricao: 'Parceria para desenvolvimento de protocolos clínicos em dor crônica',
        tipo: 'clinica',
        localizacao: 'São Paulo, SP',
        dataInicio: new Date('2023-02-28'),
        dataTermino: new Date('2024-02-29'),
        contatoNome: 'Dra. Maria Oliveira',
        contatoCargo: 'Diretora Clínica',
        status: 'ativa',
        organizacaoId: organizationId
      }
    ];

    for (const colaboracao of colaboracoes) {
      await db.insert(colaboracoesTable).values(colaboracao);
    }
  }

  // Adicionar eventos
  const eventoCount = await db.select({ count: sql<number>`count(*)` })
    .from(eventosTable)
    .where(eq(eventosTable.organizacaoId, organizationId));

  if (Number(eventoCount[0].count) === 0) {
    const eventos = [
      {
        titulo: 'Reunião do Comitê de Ética',
        descricao: 'Avaliação de novos protocolos de pesquisa',
        data: new Date('2024-03-15'),
        hora: '14:00',
        local: 'Sala de Reuniões A',
        tipo: 'reunião',
        organizacaoId: organizationId
      },
      {
        titulo: 'Apresentação de Resultados Preliminares',
        descricao: 'Apresentação dos resultados preliminares do estudo de CBD em epilepsia',
        data: new Date('2024-03-20'),
        hora: '10:00',
        local: 'Auditório Principal',
        tipo: 'apresentação',
        organizacaoId: organizationId
      },
      {
        titulo: 'Workshop de Metodologia',
        descricao: 'Treinamento em metodologias de pesquisa clínica',
        data: new Date('2024-03-25'),
        hora: '09:00',
        local: 'Sala de Treinamento B',
        tipo: 'workshop',
        organizacaoId: organizationId
      }
    ];

    for (const evento of eventos) {
      await db.insert(eventosTable).values(evento);
    }
  }
}

// Registro das rotas da API
export function registerPesquisaCientificaRoutes(app: Express) {
  // Middleware para verificar se os dados de exemplo existem
  app.use('/api/pesquisa/*', authenticate, async (req: AuthenticatedRequest, res, next) => {
    if (req.user?.organizationId) {
      // Verificamos apenas na primeira request
      await seedPesquisas(req.user.organizationId);
    }
    next();
  });

  // === Dashboard ===
  app.get('/api/pesquisa/dashboard', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.organizationId) {
      return res.status(400).json({ message: 'ID da organização não encontrado' });
    }

    try {
      // Obter contagem de pesquisas ativas
      const pesquisasAtivas = await db
        .select({ count: sql<number>`count(*)` })
        .from(pesquisasTable)
        .where(and(
          eq(pesquisasTable.organizacaoId, req.user.organizationId),
          eq(pesquisasTable.status, 'em_andamento')
        ));

      // Obter contagem de novas pesquisas no mês atual
      const dataInicio = new Date();
      dataInicio.setDate(1); // Primeiro dia do mês
      const pesquisasNovas = await db
        .select({ count: sql<number>`count(*)` })
        .from(pesquisasTable)
        .where(and(
          eq(pesquisasTable.organizacaoId, req.user.organizationId),
          sql`${pesquisasTable.createdAt} >= ${dataInicio}`
        ));

      // Obter participantes
      const participantes = await db
        .select({ count: sql<number>`count(*)` })
        .from(pacientesPesquisaTable)
        .where(eq(pacientesPesquisaTable.organizacaoId, req.user.organizationId));

      // Número de estudos diferentes com participantes
      const estudosDiferentes = await db
        .select({ count: sql<number>`count(distinct ${pacientePesquisaParticipacaoTable.pesquisaId})` })
        .from(pacientePesquisaParticipacaoTable)
        .innerJoin(pesquisasTable, eq(pacientePesquisaParticipacaoTable.pesquisaId, pesquisasTable.id))
        .where(eq(pesquisasTable.organizacaoId, req.user.organizationId));

      // Publicações
      const publicacoes = await db
        .select({ count: sql<number>`count(*)` })
        .from(publicacoesTable)
        .where(eq(publicacoesTable.organizacaoId, req.user.organizationId));

      // Publicações em revisão
      const publicacoesRevisao = await db
        .select({ count: sql<number>`count(*)` })
        .from(publicacoesTable)
        .where(and(
          eq(publicacoesTable.organizacaoId, req.user.organizationId),
          eq(publicacoesTable.status, 'em_revisao')
        ));

      // Colaborações
      const colaboracoes = await db
        .select({ count: sql<number>`count(*)` })
        .from(colaboracoesTable)
        .where(and(
          eq(colaboracoesTable.organizacaoId, req.user.organizationId),
          eq(colaboracoesTable.status, 'ativa')
        ));

      // Instituições diferentes
      const instituicoesDiferentes = await db
        .select({ count: sql<number>`count(distinct ${colaboracoesTable.instituicao})` })
        .from(colaboracoesTable)
        .where(and(
          eq(colaboracoesTable.organizacaoId, req.user.organizationId),
          eq(colaboracoesTable.status, 'ativa')
        ));

      // Pesquisas recentes
      const pesquisasRecentes = await db
        .select({
          id: pesquisasTable.id,
          titulo: pesquisasTable.titulo,
          descricao: pesquisasTable.descricao,
          status: pesquisasTable.status,
          atualizadoEm: pesquisasTable.updatedAt
        })
        .from(pesquisasTable)
        .where(eq(pesquisasTable.organizacaoId, req.user.organizationId))
        .orderBy(desc(pesquisasTable.updatedAt))
        .limit(3);

      // Eventos próximos
      const hoje = new Date();
      const eventosFuturos = await db
        .select({
          id: eventosTable.id,
          titulo: eventosTable.titulo,
          data: eventosTable.data,
          tipo: eventosTable.tipo
        })
        .from(eventosTable)
        .where(and(
          eq(eventosTable.organizacaoId, req.user.organizationId),
          sql`${eventosTable.data} >= ${hoje}`
        ))
        .orderBy(asc(eventosTable.data))
        .limit(3);

      return res.json({
        pesquisasAtivas: Number(pesquisasAtivas[0].count),
        pesquisasNovasMes: Number(pesquisasNovas[0].count),
        participantes: {
          total: Number(participantes[0].count),
          estudos: Number(estudosDiferentes[0].count)
        },
        publicacoes: {
          total: Number(publicacoes[0].count),
          emRevisao: Number(publicacoesRevisao[0].count)
        },
        colaboracoes: {
          total: Number(colaboracoes[0].count),
          instituicoes: Number(instituicoesDiferentes[0].count)
        },
        pesquisasRecentes,
        eventosFuturos
      });
    } catch (error) {
      console.error('Erro ao obter dados do dashboard de pesquisa:', error);
      return res.status(500).json({ message: 'Erro ao buscar dados do dashboard' });
    }
  });

  // === Área de Conhecimento ===
  app.get('/api/pesquisa/areas', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.organizationId) {
      return res.status(400).json({ message: 'ID da organização não encontrado' });
    }

    try {
      const areas = await db
        .select()
        .from(areasConhecimentoTable)
        .where(eq(areasConhecimentoTable.organizacaoId, req.user.organizationId));

      return res.json(areas);
    } catch (error) {
      console.error('Erro ao buscar áreas de conhecimento:', error);
      return res.status(500).json({ message: 'Erro ao buscar áreas de conhecimento' });
    }
  });

  app.post('/api/pesquisa/areas', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.organizationId) {
      return res.status(400).json({ message: 'ID da organização não encontrado' });
    }

    try {
      const areaData = {
        ...req.body,
        organizacaoId: req.user.organizationId
      };
      
      const parseResult = insertAreaConhecimentoSchema.safeParse(areaData);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: 'Dados inválidos', errors: parseResult.error.errors });
      }

      const result = await db.insert(areasConhecimentoTable).values(parseResult.data).returning();
      return res.status(201).json(result[0]);
    } catch (error) {
      console.error('Erro ao criar área de conhecimento:', error);
      return res.status(500).json({ message: 'Erro ao criar área de conhecimento' });
    }
  });

  // === Pesquisas ===
  app.get('/api/pesquisa/pesquisas', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.organizationId) {
      return res.status(400).json({ message: 'ID da organização não encontrado' });
    }

    try {
      const query = req.query.q as string | undefined;
      const areaId = req.query.area ? Number(req.query.area) : undefined;
      const status = req.query.status as string | undefined;

      let conditions = and(eq(pesquisasTable.organizacaoId, req.user.organizationId));

      if (query) {
        conditions = and(conditions, ilike(pesquisasTable.titulo, `%${query}%`));
      }

      if (areaId) {
        conditions = and(conditions, eq(pesquisasTable.areaId, areaId));
      }

      if (status && status !== 'todos') {
        conditions = and(conditions, eq(pesquisasTable.status, status));
      }

      const pesquisas = await db
        .select({
          id: pesquisasTable.id,
          titulo: pesquisasTable.titulo,
          descricao: pesquisasTable.descricao,
          tipo: pesquisasTable.tipo,
          areaId: pesquisasTable.areaId,
          status: pesquisasTable.status,
          dataInicio: pesquisasTable.dataInicio,
          dataPrevistaFim: pesquisasTable.dataPrevistaFim,
          pesquisadorPrincipalId: pesquisasTable.pesquisadorPrincipalId,
          createdAt: pesquisasTable.createdAt,
          updatedAt: pesquisasTable.updatedAt,
          areaNome: areasConhecimentoTable.nome
        })
        .from(pesquisasTable)
        .leftJoin(areasConhecimentoTable, eq(pesquisasTable.areaId, areasConhecimentoTable.id))
        .where(conditions)
        .orderBy(desc(pesquisasTable.updatedAt));

      return res.json(pesquisas);
    } catch (error) {
      console.error('Erro ao buscar pesquisas:', error);
      return res.status(500).json({ message: 'Erro ao buscar pesquisas' });
    }
  });

  app.get('/api/pesquisa/pesquisas/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.organizationId) {
      return res.status(400).json({ message: 'ID da organização não encontrado' });
    }

    try {
      const id = Number(req.params.id);
      
      const [pesquisa] = await db
        .select({
          id: pesquisasTable.id,
          titulo: pesquisasTable.titulo,
          descricao: pesquisasTable.descricao,
          tipo: pesquisasTable.tipo,
          areaId: pesquisasTable.areaId,
          status: pesquisasTable.status,
          dataInicio: pesquisasTable.dataInicio,
          dataPrevistaFim: pesquisasTable.dataPrevistaFim,
          dataConclusao: pesquisasTable.dataConclusao,
          pesquisadorPrincipalId: pesquisasTable.pesquisadorPrincipalId,
          protocolo: pesquisasTable.protocolo,
          createdAt: pesquisasTable.createdAt,
          updatedAt: pesquisasTable.updatedAt,
          aprovadaPorId: pesquisasTable.aprovadaPorId,
          dataAprovacao: pesquisasTable.dataAprovacao,
          observacoes: pesquisasTable.observacoes,
          areaNome: areasConhecimentoTable.nome
        })
        .from(pesquisasTable)
        .leftJoin(areasConhecimentoTable, eq(pesquisasTable.areaId, areasConhecimentoTable.id))
        .where(and(
          eq(pesquisasTable.id, id),
          eq(pesquisasTable.organizacaoId, req.user.organizationId)
        ));

      if (!pesquisa) {
        return res.status(404).json({ message: 'Pesquisa não encontrada' });
      }
      
      // Buscar participantes
      const participantes = await db
        .select({
          id: pacientePesquisaParticipacaoTable.id,
          pacienteId: pacientePesquisaParticipacaoTable.pacienteId,
          dataEntrada: pacientePesquisaParticipacaoTable.dataEntrada,
          dataSaida: pacientePesquisaParticipacaoTable.dataSaida,
          consentimentoAssinado: pacientePesquisaParticipacaoTable.consentimentoAssinado,
          pacienteNome: pacientesPesquisaTable.nome
        })
        .from(pacientePesquisaParticipacaoTable)
        .innerJoin(pacientesPesquisaTable, eq(pacientePesquisaParticipacaoTable.pacienteId, pacientesPesquisaTable.id))
        .where(eq(pacientePesquisaParticipacaoTable.pesquisaId, id));
      
      // Buscar protocolos
      const protocolos = await db
        .select()
        .from(protocolosTable)
        .where(eq(protocolosTable.pesquisaId, id));
      
      // Buscar colaborações
      const colaboracoes = await db
        .select({
          id: colaboracoesTable.id,
          instituicao: colaboracoesTable.instituicao,
          descricao: colaboracoesTable.descricao,
          tipo: colaboracoesTable.tipo,
          status: colaboracoesTable.status,
          dataInicio: colaboracoesTable.dataInicio,
          dataTermino: colaboracoesTable.dataTermino
        })
        .from(colaboracaoPesquisaTable)
        .innerJoin(colaboracoesTable, eq(colaboracaoPesquisaTable.colaboracaoId, colaboracoesTable.id))
        .where(eq(colaboracaoPesquisaTable.pesquisaId, id));
      
      // Buscar publicações
      const publicacoes = await db
        .select()
        .from(publicacoesTable)
        .where(eq(publicacoesTable.pesquisaId, id));

      return res.json({
        ...pesquisa,
        participantes,
        protocolos,
        colaboracoes,
        publicacoes
      });
    } catch (error) {
      console.error('Erro ao buscar detalhes da pesquisa:', error);
      return res.status(500).json({ message: 'Erro ao buscar detalhes da pesquisa' });
    }
  });

  app.post('/api/pesquisa/pesquisas', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.organizationId) {
      return res.status(400).json({ message: 'ID da organização não encontrado' });
    }

    try {
      const pesquisaData = {
        ...req.body,
        organizacaoId: req.user.organizationId
      };
      
      const parseResult = insertPesquisaSchema.safeParse(pesquisaData);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: 'Dados inválidos', errors: parseResult.error.errors });
      }

      const result = await db.insert(pesquisasTable).values(parseResult.data).returning();
      return res.status(201).json(result[0]);
    } catch (error) {
      console.error('Erro ao criar pesquisa:', error);
      return res.status(500).json({ message: 'Erro ao criar pesquisa' });
    }
  });

  app.put('/api/pesquisa/pesquisas/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.organizationId) {
      return res.status(400).json({ message: 'ID da organização não encontrado' });
    }

    try {
      const id = Number(req.params.id);
      
      // Verificar se a pesquisa existe e pertence à organização
      const [pesquisaExistente] = await db
        .select()
        .from(pesquisasTable)
        .where(and(
          eq(pesquisasTable.id, id),
          eq(pesquisasTable.organizacaoId, req.user.organizationId)
        ));

      if (!pesquisaExistente) {
        return res.status(404).json({ message: 'Pesquisa não encontrada' });
      }

      // Atualizar a pesquisa
      const result = await db
        .update(pesquisasTable)
        .set(req.body)
        .where(eq(pesquisasTable.id, id))
        .returning();

      return res.json(result[0]);
    } catch (error) {
      console.error('Erro ao atualizar pesquisa:', error);
      return res.status(500).json({ message: 'Erro ao atualizar pesquisa' });
    }
  });

  app.delete('/api/pesquisa/pesquisas/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.organizationId) {
      return res.status(400).json({ message: 'ID da organização não encontrado' });
    }

    try {
      const id = Number(req.params.id);
      
      // Verificar se a pesquisa existe e pertence à organização
      const [pesquisaExistente] = await db
        .select()
        .from(pesquisasTable)
        .where(and(
          eq(pesquisasTable.id, id),
          eq(pesquisasTable.organizacaoId, req.user.organizationId)
        ));

      if (!pesquisaExistente) {
        return res.status(404).json({ message: 'Pesquisa não encontrada' });
      }

      // Deletar a pesquisa
      await db
        .delete(pesquisasTable)
        .where(eq(pesquisasTable.id, id));

      return res.json({ message: 'Pesquisa excluída com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir pesquisa:', error);
      return res.status(500).json({ message: 'Erro ao excluir pesquisa' });
    }
  });

  // === Pacientes ===
  app.get('/api/pesquisa/pacientes', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.organizationId) {
      return res.status(400).json({ message: 'ID da organização não encontrado' });
    }

    try {
      const query = req.query.q as string | undefined;
      const status = req.query.status as string | undefined;
      const condicao = req.query.condicao as string | undefined;

      let conditions = and(eq(pacientesPesquisaTable.organizacaoId, req.user.organizationId));

      if (query) {
        conditions = and(conditions, or(
          ilike(pacientesPesquisaTable.nome, `%${query}%`),
          ilike(pacientesPesquisaTable.email, `%${query}%`),
          ilike(pacientesPesquisaTable.cpf, `%${query}%`)
        ));
      }

      if (status && status !== 'todos') {
        conditions = and(conditions, eq(pacientesPesquisaTable.status, status));
      }

      if (condicao && condicao !== 'todas') {
        conditions = and(conditions, eq(pacientesPesquisaTable.condicaoPrincipal, condicao));
      }

      const pacientes = await db
        .select()
        .from(pacientesPesquisaTable)
        .where(conditions)
        .orderBy(desc(pacientesPesquisaTable.updatedAt));

      return res.json(pacientes);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      return res.status(500).json({ message: 'Erro ao buscar pacientes' });
    }
  });

  app.post('/api/pesquisa/pacientes', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.organizationId) {
      return res.status(400).json({ message: 'ID da organização não encontrado' });
    }

    try {
      const pacienteData = {
        ...req.body,
        organizacaoId: req.user.organizationId
      };
      
      const parseResult = insertPacientePesquisaSchema.safeParse(pacienteData);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: 'Dados inválidos', errors: parseResult.error.errors });
      }

      const result = await db.insert(pacientesPesquisaTable).values(parseResult.data).returning();
      return res.status(201).json(result[0]);
    } catch (error) {
      console.error('Erro ao criar paciente:', error);
      return res.status(500).json({ message: 'Erro ao criar paciente' });
    }
  });

  // === Condições ===
  app.get('/api/pesquisa/condicoes', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.organizationId) {
      return res.status(400).json({ message: 'ID da organização não encontrado' });
    }

    try {
      const query = req.query.q as string | undefined;
      const area = req.query.area as string | undefined;

      let conditions = and(eq(condicoesTable.organizacaoId, req.user.organizationId));

      if (query) {
        conditions = and(conditions, or(
          ilike(condicoesTable.nome, `%${query}%`),
          ilike(condicoesTable.cid, `%${query}%`)
        ));
      }

      if (area && area !== 'todas') {
        conditions = and(conditions, eq(condicoesTable.area, area));
      }

      const condicoes = await db
        .select()
        .from(condicoesTable)
        .where(conditions)
        .orderBy(asc(condicoesTable.nome));

      return res.json(condicoes);
    } catch (error) {
      console.error('Erro ao buscar condições:', error);
      return res.status(500).json({ message: 'Erro ao buscar condições' });
    }
  });

  app.post('/api/pesquisa/condicoes', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.organizationId) {
      return res.status(400).json({ message: 'ID da organização não encontrado' });
    }

    try {
      const condicaoData = {
        ...req.body,
        organizacaoId: req.user.organizationId
      };
      
      const parseResult = insertCondicaoSchema.safeParse(condicaoData);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: 'Dados inválidos', errors: parseResult.error.errors });
      }

      const result = await db.insert(condicoesTable).values(parseResult.data).returning();
      return res.status(201).json(result[0]);
    } catch (error) {
      console.error('Erro ao criar condição:', error);
      return res.status(500).json({ message: 'Erro ao criar condição' });
    }
  });

  // === Grupos de Pesquisa ===
  app.get('/api/pesquisa/grupos', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.organizationId) {
      return res.status(400).json({ message: 'ID da organização não encontrado' });
    }

    try {
      const query = req.query.q as string | undefined;
      const area = req.query.area as string | undefined;
      const status = req.query.status as string | undefined;

      let conditions = and(eq(gruposPesquisaTable.organizacaoId, req.user.organizationId));

      if (query) {
        conditions = and(conditions, ilike(gruposPesquisaTable.nome, `%${query}%`));
      }

      if (area && area !== 'todas') {
        conditions = and(conditions, eq(gruposPesquisaTable.area, area));
      }

      if (status && status !== 'todos') {
        conditions = and(conditions, eq(gruposPesquisaTable.status, status));
      }

      const grupos = await db
        .select()
        .from(gruposPesquisaTable)
        .where(conditions)
        .orderBy(asc(gruposPesquisaTable.nome));

      // Para cada grupo, buscar o número de membros e pesquisas ativas
      const gruposComDetalhes = await Promise.all(grupos.map(async (grupo) => {
        // Contar membros
        const membros = await db
          .select({ count: sql<number>`count(*)` })
          .from(membroGrupoTable)
          .where(and(
            eq(membroGrupoTable.grupoId, grupo.id),
            isNull(membroGrupoTable.dataSaida)
          ));

        // Pesquisas ativas
        const pesquisasAtivas = await db
          .select({ count: sql<number>`count(*)` })
          .from(pesquisasTable)
          .where(and(
            eq(pesquisasTable.organizacaoId, req.user!.organizationId),
            sql`EXISTS (SELECT 1 FROM json_array_elements_text(${pesquisasTable.grupoIds}) as grupo_id WHERE grupo_id = ${grupo.id.toString()})`
          ));

        // Publicações
        const publicacoes = await db
          .select({ count: sql<number>`count(*)` })
          .from(publicacoesTable)
          .where(and(
            eq(publicacoesTable.organizacaoId, req.user!.organizationId),
            sql`EXISTS (SELECT 1 FROM json_array_elements_text(${publicacoesTable.grupoIds}) as grupo_id WHERE grupo_id = ${grupo.id.toString()})`
          ));

        return {
          ...grupo,
          numMembros: Number(membros[0].count),
          numPesquisasAtivas: Number(pesquisasAtivas[0].count),
          numPublicacoes: Number(publicacoes[0].count)
        };
      }));

      return res.json(gruposComDetalhes);
    } catch (error) {
      console.error('Erro ao buscar grupos de pesquisa:', error);
      return res.status(500).json({ message: 'Erro ao buscar grupos de pesquisa' });
    }
  });

  app.post('/api/pesquisa/grupos', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.organizationId) {
      return res.status(400).json({ message: 'ID da organização não encontrado' });
    }

    try {
      const grupoData = {
        ...req.body,
        organizacaoId: req.user.organizationId
      };
      
      const parseResult = insertGrupoPesquisaSchema.safeParse(grupoData);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: 'Dados inválidos', errors: parseResult.error.errors });
      }

      const result = await db.insert(gruposPesquisaTable).values(parseResult.data).returning();
      return res.status(201).json(result[0]);
    } catch (error) {
      console.error('Erro ao criar grupo de pesquisa:', error);
      return res.status(500).json({ message: 'Erro ao criar grupo de pesquisa' });
    }
  });

  // === Protocolos ===
  app.get('/api/pesquisa/protocolos', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.organizationId) {
      return res.status(400).json({ message: 'ID da organização não encontrado' });
    }

    try {
      const query = req.query.q as string | undefined;
      const status = req.query.status as string | undefined;

      let conditions = and(eq(protocolosTable.organizacaoId, req.user.organizationId));

      if (query) {
        conditions = and(conditions, or(
          ilike(protocolosTable.titulo, `%${query}%`),
          ilike(protocolosTable.codigo, `%${query}%`)
        ));
      }

      if (status && status !== 'todos') {
        conditions = and(conditions, eq(protocolosTable.status, status));
      }

      const protocolos = await db
        .select()
        .from(protocolosTable)
        .where(conditions)
        .orderBy(desc(protocolosTable.data));

      return res.json(protocolos);
    } catch (error) {
      console.error('Erro ao buscar protocolos:', error);
      return res.status(500).json({ message: 'Erro ao buscar protocolos' });
    }
  });

  app.post('/api/pesquisa/protocolos', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.organizationId) {
      return res.status(400).json({ message: 'ID da organização não encontrado' });
    }

    try {
      const protocoloData = {
        ...req.body,
        organizacaoId: req.user.organizationId
      };
      
      const parseResult = insertProtocoloSchema.safeParse(protocoloData);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: 'Dados inválidos', errors: parseResult.error.errors });
      }

      const result = await db.insert(protocolosTable).values(parseResult.data).returning();
      return res.status(201).json(result[0]);
    } catch (error) {
      console.error('Erro ao criar protocolo:', error);
      return res.status(500).json({ message: 'Erro ao criar protocolo' });
    }
  });

  // === Colaborações ===
  app.get('/api/pesquisa/colaboracoes', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.organizationId) {
      return res.status(400).json({ message: 'ID da organização não encontrado' });
    }

    try {
      const query = req.query.q as string | undefined;
      const tipo = req.query.tipo as string | undefined;
      const status = req.query.status as string | undefined;

      let conditions = and(eq(colaboracoesTable.organizacaoId, req.user.organizationId));

      if (query) {
        conditions = and(conditions, or(
          ilike(colaboracoesTable.instituicao, `%${query}%`),
          ilike(colaboracoesTable.descricao, `%${query}%`)
        ));
      }

      if (tipo && tipo !== 'todos') {
        conditions = and(conditions, eq(colaboracoesTable.tipo, tipo));
      }

      if (status && status !== 'todos') {
        conditions = and(conditions, eq(colaboracoesTable.status, status));
      }

      const colaboracoes = await db
        .select()
        .from(colaboracoesTable)
        .where(conditions)
        .orderBy(desc(colaboracoesTable.dataInicio));

      // Para cada colaboração, obter as pesquisas relacionadas
      const colaboracoesComPesquisas = await Promise.all(colaboracoes.map(async (colaboracao) => {
        const pesquisas = await db
          .select({
            id: pesquisasTable.id,
            titulo: pesquisasTable.titulo
          })
          .from(colaboracaoPesquisaTable)
          .innerJoin(pesquisasTable, eq(colaboracaoPesquisaTable.pesquisaId, pesquisasTable.id))
          .where(eq(colaboracaoPesquisaTable.colaboracaoId, colaboracao.id));

        return {
          ...colaboracao,
          pesquisasRelacionadas: pesquisas
        };
      }));

      return res.json(colaboracoesComPesquisas);
    } catch (error) {
      console.error('Erro ao buscar colaborações:', error);
      return res.status(500).json({ message: 'Erro ao buscar colaborações' });
    }
  });

  app.post('/api/pesquisa/colaboracoes', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.organizationId) {
      return res.status(400).json({ message: 'ID da organização não encontrado' });
    }

    try {
      const colaboracaoData = {
        ...req.body,
        organizacaoId: req.user.organizationId
      };
      
      const parseResult = insertColaboracaoSchema.safeParse(colaboracaoData);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: 'Dados inválidos', errors: parseResult.error.errors });
      }

      const result = await db.insert(colaboracoesTable).values(parseResult.data).returning();
      
      // Associar a colaboração às pesquisas, se fornecidas
      if (req.body.pesquisaIds && Array.isArray(req.body.pesquisaIds)) {
        for (const pesquisaId of req.body.pesquisaIds) {
          await db.insert(colaboracaoPesquisaTable).values({
            colaboracaoId: result[0].id,
            pesquisaId
          });
        }
      }
      
      return res.status(201).json(result[0]);
    } catch (error) {
      console.error('Erro ao criar colaboração:', error);
      return res.status(500).json({ message: 'Erro ao criar colaboração' });
    }
  });

  // === Estatísticas ===
  app.get('/api/pesquisa/estatisticas', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.organizationId) {
      return res.status(400).json({ message: 'ID da organização não encontrado' });
    }

    try {
      const periodo = req.query.periodo as string || 'anual';
      
      // Total de pesquisas
      const totalPesquisas = await db
        .select({ count: sql<number>`count(*)` })
        .from(pesquisasTable)
        .where(eq(pesquisasTable.organizacaoId, req.user.organizationId));
      
      // Pacientes participantes
      const totalPacientes = await db
        .select({ count: sql<number>`count(*)` })
        .from(pacientesPesquisaTable)
        .where(eq(pacientesPesquisaTable.organizacaoId, req.user.organizationId));
      
      // Publicações científicas
      const totalPublicacoes = await db
        .select({ count: sql<number>`count(*)` })
        .from(publicacoesTable)
        .where(eq(publicacoesTable.organizacaoId, req.user.organizationId));
      
      // Taxa de eficácia (média das taxas de eficácia das pesquisas concluídas)
      const taxaEficacia = 75; // Valor simulado - numa implementação real, seria calculado
      
      // Evolução de pesquisas por mês no último ano
      const anoPassado = new Date();
      anoPassado.setFullYear(anoPassado.getFullYear() - 1);
      
      const evolucaoPesquisas = await db
        .select({
          mes: sql`to_char(${pesquisasTable.dataInicio}, 'MM')::integer`,
          count: sql<number>`count(*)`
        })
        .from(pesquisasTable)
        .where(and(
          eq(pesquisasTable.organizacaoId, req.user.organizationId),
          sql`${pesquisasTable.dataInicio} >= ${anoPassado}`
        ))
        .groupBy(sql`to_char(${pesquisasTable.dataInicio}, 'MM')::integer`)
        .orderBy(sql`to_char(${pesquisasTable.dataInicio}, 'MM')::integer`);
      
      // Pesquisas por condição
      const pesquisasPorCondicao = await db
        .select({
          condicao: condicoesTable.nome,
          count: sql<number>`count(*)`
        })
        .from(pesquisasTable)
        .innerJoin(condicoesTable, eq(pesquisasTable.condicaoId, condicoesTable.id))
        .where(eq(pesquisasTable.organizacaoId, req.user.organizationId))
        .groupBy(condicoesTable.nome)
        .orderBy(desc(sql<number>`count(*)`));
      
      // Dados demográficos (idade média, distribuição por gênero)
      const dadosDemograficos = {
        idadeMedia: 42,
        genero: {
          masculino: 45,
          feminino: 55
        }
      };
      
      // Tendências de tratamento
      const tendenciasTratamento = [
        { tratamento: 'CBD isolado', frequencia: 35 },
        { tratamento: 'Espectro completo', frequencia: 30 },
        { tratamento: 'THC:CBD balanceado', frequencia: 25 },
        { tratamento: 'Rico em THC', frequencia: 10 }
      ];
      
      // Lista de pesquisas recentes
      const pesquisasRecentes = await db
        .select({
          id: pesquisasTable.id,
          titulo: pesquisasTable.titulo,
          pesquisador: pesquisasTable.pesquisadorPrincipalId,
          status: pesquisasTable.status,
          pacientes: sql<number>`(SELECT COUNT(*) FROM ${pacientePesquisaParticipacaoTable} WHERE ${pacientePesquisaParticipacaoTable.pesquisaId} = ${pesquisasTable.id})`,
          dataInicio: pesquisasTable.dataInicio
        })
        .from(pesquisasTable)
        .where(eq(pesquisasTable.organizacaoId, req.user.organizationId))
        .orderBy(desc(pesquisasTable.dataInicio))
        .limit(10);

      return res.json({
        resumo: {
          totalPesquisas: Number(totalPesquisas[0].count),
          crescimentoPesquisas: 12, // Valor simulado
          totalPacientes: Number(totalPacientes[0].count),
          crescimentoPacientes: 8, // Valor simulado
          totalPublicacoes: Number(totalPublicacoes[0].count),
          crescimentoPublicacoes: 15, // Valor simulado
          taxaEficacia,
          crescimentoEficacia: 5 // Valor simulado
        },
        evolucaoPesquisas,
        pesquisasPorCondicao,
        dadosDemograficos,
        tendenciasTratamento,
        pesquisasRecentes
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return res.status(500).json({ message: 'Erro ao buscar estatísticas' });
    }
  });

  // === Eventos ===
  app.get('/api/pesquisa/eventos', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.organizationId) {
      return res.status(400).json({ message: 'ID da organização não encontrado' });
    }

    try {
      const dataInicio = req.query.inicio ? new Date(req.query.inicio as string) : undefined;
      const dataFim = req.query.fim ? new Date(req.query.fim as string) : undefined;
      
      let conditions = and(eq(eventosTable.organizacaoId, req.user.organizationId));
      
      if (dataInicio) {
        conditions = and(conditions, sql`${eventosTable.data} >= ${dataInicio}`);
      }
      
      if (dataFim) {
        conditions = and(conditions, sql`${eventosTable.data} <= ${dataFim}`);
      }
      
      const eventos = await db
        .select()
        .from(eventosTable)
        .where(conditions)
        .orderBy(asc(eventosTable.data));
      
      return res.json(eventos);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      return res.status(500).json({ message: 'Erro ao buscar eventos' });
    }
  });

  app.post('/api/pesquisa/eventos', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.organizationId) {
      return res.status(400).json({ message: 'ID da organização não encontrado' });
    }

    try {
      const eventoData = {
        ...req.body,
        organizacaoId: req.user.organizationId
      };
      
      const parseResult = insertEventoSchema.safeParse(eventoData);
      
      if (!parseResult.success) {
        return res.status(400).json({ message: 'Dados inválidos', errors: parseResult.error.errors });
      }

      const result = await db.insert(eventosTable).values(parseResult.data).returning();
      return res.status(201).json(result[0]);
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      return res.status(500).json({ message: 'Erro ao criar evento' });
    }
  });

  console.log('Rotas do módulo de pesquisa científica registradas com sucesso');
}