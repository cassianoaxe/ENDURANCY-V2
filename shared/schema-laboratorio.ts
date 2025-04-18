import { pgTable, text, serial, timestamp, decimal, integer, boolean, pgEnum, json, date, time } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema";

// Enums para laboratório
export const amostraStatusEnum = pgEnum('amostra_status', [
  'aguardando', 'em_analise', 'concluida', 'cancelada'
]);

export const amostraTipoEnum = pgEnum('amostra_tipo', [
  'flor', 'oleo', 'extrato', 'tintura', 'resina', 'isolado', 'outro'
]);

export const equipamentoStatusEnum = pgEnum('equipamento_status', [
  'disponivel', 'em_uso', 'manutencao', 'indisponivel'
]);

export const equipamentoTipoEnum = pgEnum('equipamento_tipo', [
  'hplc', 'gc', 'gcms', 'lcms', 'uplc', 'ftir', 'uv', 'vis', 'espectrofotometro', 'microscopio', 'outro'
]);

export const resultadoStatusEnum = pgEnum('resultado_status', [
  'pendente', 'em_andamento', 'concluido', 'invalidado'
]);

export const resultadoTipoEnum = pgEnum('resultado_tipo', [
  'canabinoides', 'terpenos', 'solventes', 'metais_pesados', 'microbiologico', 'pesticidas', 'outro'
]);

// Tabelas
export const amostras = pgTable("lab_amostras", {
  id: serial("id").primaryKey(),
  codigo: text("codigo").notNull().unique(),
  nome: text("nome").notNull(),
  tipo: amostraTipoEnum("tipo").notNull(),
  status: amostraStatusEnum("status").notNull().default('aguardando'),
  dataEnvio: date("data_envio").notNull(),
  dataRecebimento: date("data_recebimento"),
  organizacaoId: integer("organizacao_id"),
  pesquisadorId: integer("pesquisador_id").notNull(),
  origem: text("origem"),
  lote: text("lote"),
  descricao: text("descricao"),
  observacoes: text("observacoes"),
  metadados: json("metadados"),
  arquivada: boolean("arquivada").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const equipamentos = pgTable("lab_equipamentos", {
  id: serial("id").primaryKey(),
  codigo: text("codigo").notNull().unique(),
  nome: text("nome").notNull(),
  tipo: equipamentoTipoEnum("tipo").notNull(),
  status: equipamentoStatusEnum("status").notNull().default('disponivel'),
  modelo: text("modelo"),
  fabricante: text("fabricante"),
  numeroSerie: text("numero_serie"),
  localizacao: text("localizacao").notNull(),
  responsavelId: integer("responsavel_id"),
  dataAquisicao: date("data_aquisicao"),
  ultimaCalibracao: date("ultima_calibracao"),
  proximaCalibracao: date("proxima_calibracao"),
  ultimaManutencao: date("ultima_manutencao"),
  proximaManutencao: date("proxima_manutencao"),
  observacoes: text("observacoes"),
  metadados: json("metadados"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const resultados = pgTable("lab_resultados", {
  id: serial("id").primaryKey(),
  codigo: text("codigo").notNull().unique(),
  amostraId: integer("amostra_id").notNull(),
  tipo: resultadoTipoEnum("tipo").notNull(),
  status: resultadoStatusEnum("status").notNull().default('pendente'),
  dataAnalise: date("data_analise"),
  horaInicio: time("hora_inicio"),
  horaFim: time("hora_fim"),
  equipamentoId: integer("equipamento_id"),
  analista: text("analista"),
  metodo: text("metodo"),
  resultadosDados: json("resultados_dados"),
  observacoes: text("observacoes"),
  relatorioPdf: text("relatorio_pdf"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const amostraImages = pgTable("lab_amostra_imagens", {
  id: serial("id").primaryKey(),
  amostraId: integer("amostra_id").notNull(),
  url: text("url").notNull(),
  descricao: text("descricao"),
  tipo: text("tipo").default("image/jpeg"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const agendamentos = pgTable("lab_agendamentos", {
  id: serial("id").primaryKey(),
  equipamentoId: integer("equipamento_id").notNull(),
  pesquisadorId: integer("pesquisador_id").notNull(),
  data: date("data").notNull(),
  horaInicio: time("hora_inicio").notNull(),
  horaFim: time("hora_fim").notNull(),
  proposito: text("proposito").notNull(),
  status: text("status").notNull().default("confirmado"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schemas Zod
export const insertAmostraSchema = createInsertSchema(amostras, {
  tipo: z.enum(['flor', 'oleo', 'extrato', 'tintura', 'resina', 'isolado', 'outro']),
  status: z.enum(['aguardando', 'em_analise', 'concluida', 'cancelada']).default('aguardando'),
  dataEnvio: z.coerce.date(),
  dataRecebimento: z.coerce.date().optional(),
  metadados: z.any().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertEquipamentoSchema = createInsertSchema(equipamentos, {
  tipo: z.enum(['hplc', 'gc', 'gcms', 'lcms', 'uplc', 'ftir', 'uv', 'vis', 'espectrofotometro', 'microscopio', 'outro']),
  status: z.enum(['disponivel', 'em_uso', 'manutencao', 'indisponivel']).default('disponivel'),
  dataAquisicao: z.coerce.date().optional(),
  ultimaCalibracao: z.coerce.date().optional(),
  proximaCalibracao: z.coerce.date().optional(),
  ultimaManutencao: z.coerce.date().optional(),
  proximaManutencao: z.coerce.date().optional(),
  metadados: z.any().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertResultadoSchema = createInsertSchema(resultados, {
  tipo: z.enum(['canabinoides', 'terpenos', 'solventes', 'metais_pesados', 'microbiologico', 'pesticidas', 'outro']),
  status: z.enum(['pendente', 'em_andamento', 'concluido', 'invalidado']).default('pendente'),
  dataAnalise: z.coerce.date().optional(),
  horaInicio: z.string().optional(),
  horaFim: z.string().optional(),
  resultadosDados: z.any().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertAmostraImageSchema = createInsertSchema(amostraImages, {}).omit({ id: true, createdAt: true });

export const insertAgendamentoSchema = createInsertSchema(agendamentos, {
  data: z.coerce.date(),
  horaInicio: z.string(),
  horaFim: z.string(),
}).omit({ id: true, createdAt: true });

// Tipos para inserção
export type InsertAmostra = z.infer<typeof insertAmostraSchema>;
export type InsertEquipamento = z.infer<typeof insertEquipamentoSchema>;
export type InsertResultado = z.infer<typeof insertResultadoSchema>;
export type InsertAmostraImage = z.infer<typeof insertAmostraImageSchema>;
export type InsertAgendamento = z.infer<typeof insertAgendamentoSchema>;

// Tipos para seleção
export type Amostra = typeof amostras.$inferSelect;
export type Equipamento = typeof equipamentos.$inferSelect;
export type Resultado = typeof resultados.$inferSelect;
export type AmostraImage = typeof amostraImages.$inferSelect;
export type Agendamento = typeof agendamentos.$inferSelect;