import { pgTable, text, integer, timestamp, pgEnum, serial, date, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const pesquisaStatusEnum = pgEnum("pesquisa_status", [
  "em_andamento", 
  "aprovada", 
  "concluida", 
  "suspensa", 
  "em_analise", 
  "rascunho"
]);

export const pesquisaTipoEnum = pgEnum("pesquisa_tipo", [
  "clinico_randomizado", 
  "observacional_prospectivo", 
  "observacional_retrospectivo", 
  "revisao_sistematica", 
  "translacional",
  "outro"
]);

export const colaboracaoTipoEnum = pgEnum("colaboracao_tipo", [
  "pesquisa", 
  "clinica", 
  "financiamento", 
  "consultoria", 
  "outro"
]);

export const colaboracaoStatusEnum = pgEnum("colaboracao_status", [
  "ativa", 
  "em_negociacao", 
  "concluida", 
  "cancelada"
]);

export const protocoloStatusEnum = pgEnum("protocolo_status", [
  "rascunho", 
  "em_revisao", 
  "aprovado", 
  "reprovado", 
  "necessita_ajustes"
]);

export const grupoStatusEnum = pgEnum("grupo_status", [
  "ativo", 
  "inativo"
]);

// Tabelas
export const pesquisasTable = pgTable("pesquisas", {
  id: serial("id").primaryKey(),
  titulo: text("titulo").notNull(),
  descricao: text("descricao").notNull(),
  tipo: pesquisaTipoEnum("tipo").notNull(),
  areaId: integer("area_id").notNull(),
  status: pesquisaStatusEnum("status").notNull().default("rascunho"),
  dataInicio: date("data_inicio"),
  dataPrevistaFim: date("data_prevista_fim"),
  dataConclusao: date("data_conclusao"),
  organizacaoId: integer("organizacao_id").notNull(),
  pesquisadorPrincipalId: integer("pesquisador_principal_id"),
  protocolo: text("protocolo"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  aprovadaPorId: integer("aprovada_por_id"),
  dataAprovacao: timestamp("data_aprovacao"),
  observacoes: text("observacoes")
});

export const areasConhecimentoTable = pgTable("areas_conhecimento", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  organizacaoId: integer("organizacao_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const pacientesPesquisaTable = pgTable("pacientes_pesquisa", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  idade: integer("idade").notNull(),
  email: text("email"),
  telefone: text("telefone"),
  cpf: text("cpf"),
  condicaoPrincipal: text("condicao_principal"),
  status: text("status").notNull().default("ativo"),
  organizacaoId: integer("organizacao_id").notNull(),
  ultimaAtualizacao: timestamp("ultima_atualizacao").defaultNow(),
  numConsultas: integer("num_consultas").default(0),
  numPrescricoes: integer("num_prescricoes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const pacientePesquisaParticipacaoTable = pgTable("paciente_pesquisa_participacao", {
  id: serial("id").primaryKey(),
  pacienteId: integer("paciente_id").notNull(),
  pesquisaId: integer("pesquisa_id").notNull(),
  dataEntrada: date("data_entrada").notNull(),
  dataSaida: date("data_saida"),
  motivoSaida: text("motivo_saida"),
  consentimentoAssinado: boolean("consentimento_assinado").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const condicoesTable = pgTable("condicoes", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  descricao: text("descricao").notNull(),
  cid: text("cid"),
  area: text("area").notNull(),
  sintomas: text("sintomas").array(),
  tratamentosCannabis: text("tratamentos_cannabis").array(),
  eficaciaTratamentos: json("eficacia_tratamentos"),
  organizacaoId: integer("organizacao_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const gruposPesquisaTable = pgTable("grupos_pesquisa", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  descricao: text("descricao").notNull(),
  area: text("area").notNull(),
  liderId: integer("lider_id"),
  status: grupoStatusEnum("status").notNull().default("ativo"),
  organizacaoId: integer("organizacao_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const membroGrupoTable = pgTable("membro_grupo", {
  id: serial("id").primaryKey(),
  grupoId: integer("grupo_id").notNull(),
  usuarioId: integer("usuario_id").notNull(),
  funcao: text("funcao"),
  dataEntrada: date("data_entrada").notNull(),
  dataSaida: date("data_saida"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const protocolosTable = pgTable("protocolos", {
  id: serial("id").primaryKey(),
  codigo: text("codigo").notNull(),
  titulo: text("titulo").notNull(),
  autor: text("autor").notNull(),
  metodologia: text("metodologia").notNull(),
  versao: text("versao").notNull(),
  data: date("data").notNull(),
  status: protocoloStatusEnum("status").notNull().default("rascunho"),
  pesquisaId: integer("pesquisa_id"),
  documentoUrl: text("documento_url"),
  organizacaoId: integer("organizacao_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const aprovacaoProtocoloTable = pgTable("aprovacao_protocolo", {
  id: serial("id").primaryKey(),
  protocoloId: integer("protocolo_id").notNull(),
  comite: text("comite").notNull(),
  dataAprovacao: date("data_aprovacao").notNull(),
  observacoes: text("observacoes"),
  documentoUrl: text("documento_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const colaboracoesTable = pgTable("colaboracoes", {
  id: serial("id").primaryKey(),
  instituicao: text("instituicao").notNull(),
  descricao: text("descricao").notNull(),
  tipo: colaboracaoTipoEnum("tipo").notNull(),
  localizacao: text("localizacao"),
  dataInicio: date("data_inicio").notNull(),
  dataTermino: date("data_termino"),
  contatoNome: text("contato_nome"),
  contatoCargo: text("contato_cargo"),
  status: colaboracaoStatusEnum("status").notNull().default("ativa"),
  organizacaoId: integer("organizacao_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const colaboracaoPesquisaTable = pgTable("colaboracao_pesquisa", {
  id: serial("id").primaryKey(),
  colaboracaoId: integer("colaboracao_id").notNull(),
  pesquisaId: integer("pesquisa_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const publicacoesTable = pgTable("publicacoes", {
  id: serial("id").primaryKey(),
  titulo: text("titulo").notNull(),
  autores: text("autores").notNull(),
  revista: text("revista"),
  doi: text("doi"),
  dataPublicacao: date("data_publicacao"),
  resumo: text("resumo"),
  status: text("status").notNull(),
  pesquisaId: integer("pesquisa_id").notNull(),
  organizacaoId: integer("organizacao_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const eventosTable = pgTable("eventos", {
  id: serial("id").primaryKey(),
  titulo: text("titulo").notNull(),
  descricao: text("descricao"),
  data: date("data").notNull(),
  hora: text("hora"),
  local: text("local"),
  tipo: text("tipo").notNull(),
  organizacaoId: integer("organizacao_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Schemas
export const insertPesquisaSchema = createInsertSchema(pesquisasTable).omit({ id: true, createdAt: true, updatedAt: true });
export const selectPesquisaSchema = createSelectSchema(pesquisasTable);
export type Pesquisa = z.infer<typeof selectPesquisaSchema>;
export type InsertPesquisa = z.infer<typeof insertPesquisaSchema>;

export const insertAreaConhecimentoSchema = createInsertSchema(areasConhecimentoTable).omit({ id: true, createdAt: true, updatedAt: true });
export const selectAreaConhecimentoSchema = createSelectSchema(areasConhecimentoTable);
export type AreaConhecimento = z.infer<typeof selectAreaConhecimentoSchema>;
export type InsertAreaConhecimento = z.infer<typeof insertAreaConhecimentoSchema>;

export const insertPacientePesquisaSchema = createInsertSchema(pacientesPesquisaTable).omit({ id: true, createdAt: true, updatedAt: true });
export const selectPacientePesquisaSchema = createSelectSchema(pacientesPesquisaTable);
export type PacientePesquisa = z.infer<typeof selectPacientePesquisaSchema>;
export type InsertPacientePesquisa = z.infer<typeof insertPacientePesquisaSchema>;

export const insertPacientePesquisaParticipacaoSchema = createInsertSchema(pacientePesquisaParticipacaoTable).omit({ id: true, createdAt: true, updatedAt: true });
export const selectPacientePesquisaParticipacaoSchema = createSelectSchema(pacientePesquisaParticipacaoTable);
export type PacientePesquisaParticipacao = z.infer<typeof selectPacientePesquisaParticipacaoSchema>;
export type InsertPacientePesquisaParticipacao = z.infer<typeof insertPacientePesquisaParticipacaoSchema>;

export const insertCondicaoSchema = createInsertSchema(condicoesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const selectCondicaoSchema = createSelectSchema(condicoesTable);
export type Condicao = z.infer<typeof selectCondicaoSchema>;
export type InsertCondicao = z.infer<typeof insertCondicaoSchema>;

export const insertGrupoPesquisaSchema = createInsertSchema(gruposPesquisaTable).omit({ id: true, createdAt: true, updatedAt: true });
export const selectGrupoPesquisaSchema = createSelectSchema(gruposPesquisaTable);
export type GrupoPesquisa = z.infer<typeof selectGrupoPesquisaSchema>;
export type InsertGrupoPesquisa = z.infer<typeof insertGrupoPesquisaSchema>;

export const insertMembroGrupoSchema = createInsertSchema(membroGrupoTable).omit({ id: true, createdAt: true, updatedAt: true });
export const selectMembroGrupoSchema = createSelectSchema(membroGrupoTable);
export type MembroGrupo = z.infer<typeof selectMembroGrupoSchema>;
export type InsertMembroGrupo = z.infer<typeof insertMembroGrupoSchema>;

export const insertProtocoloSchema = createInsertSchema(protocolosTable).omit({ id: true, createdAt: true, updatedAt: true });
export const selectProtocoloSchema = createSelectSchema(protocolosTable);
export type Protocolo = z.infer<typeof selectProtocoloSchema>;
export type InsertProtocolo = z.infer<typeof insertProtocoloSchema>;

export const insertAprovacaoProtocoloSchema = createInsertSchema(aprovacaoProtocoloTable).omit({ id: true, createdAt: true, updatedAt: true });
export const selectAprovacaoProtocoloSchema = createSelectSchema(aprovacaoProtocoloTable);
export type AprovacaoProtocolo = z.infer<typeof selectAprovacaoProtocoloSchema>;
export type InsertAprovacaoProtocolo = z.infer<typeof insertAprovacaoProtocoloSchema>;

export const insertColaboracaoSchema = createInsertSchema(colaboracoesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const selectColaboracaoSchema = createSelectSchema(colaboracoesTable);
export type Colaboracao = z.infer<typeof selectColaboracaoSchema>;
export type InsertColaboracao = z.infer<typeof insertColaboracaoSchema>;

export const insertColaboracaoPesquisaSchema = createInsertSchema(colaboracaoPesquisaTable).omit({ id: true, createdAt: true, updatedAt: true });
export const selectColaboracaoPesquisaSchema = createSelectSchema(colaboracaoPesquisaTable);
export type ColaboracaoPesquisa = z.infer<typeof selectColaboracaoPesquisaSchema>;
export type InsertColaboracaoPesquisa = z.infer<typeof insertColaboracaoPesquisaSchema>;

export const insertPublicacaoSchema = createInsertSchema(publicacoesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const selectPublicacaoSchema = createSelectSchema(publicacoesTable);
export type Publicacao = z.infer<typeof selectPublicacaoSchema>;
export type InsertPublicacao = z.infer<typeof insertPublicacaoSchema>;

export const insertEventoSchema = createInsertSchema(eventosTable).omit({ id: true, createdAt: true, updatedAt: true });
export const selectEventoSchema = createSelectSchema(eventosTable);
export type Evento = z.infer<typeof selectEventoSchema>;
export type InsertEvento = z.infer<typeof insertEventoSchema>;