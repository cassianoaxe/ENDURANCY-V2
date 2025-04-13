import { pgTable, serial, text, timestamp, integer, uuid, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const StatusTarefa = {
  BACKLOG: "backlog",
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  REVIEW: "review",
  DONE: "done"
} as const;

export const PrioridadeTarefa = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent"
} as const;

// Tabela de tarefas
export const tarefas = pgTable("tarefas", {
  id: serial("id").primaryKey(),
  titulo: text("titulo").notNull(),
  descricao: text("descricao"),
  status: text("status").notNull().default(StatusTarefa.BACKLOG),
  prioridade: text("prioridade").notNull().default(PrioridadeTarefa.MEDIUM),
  dataVencimento: timestamp("data_vencimento"),
  dataCriacao: timestamp("data_criacao").defaultNow().notNull(),
  dataAtualizacao: timestamp("data_atualizacao").defaultNow().notNull(),
  dataConclusao: timestamp("data_conclusao"),
  responsavelId: integer("responsavel_id"),
  criadorId: integer("criador_id").notNull(),
  organizacaoId: integer("organizacao_id").notNull(),
  projetoId: integer("projeto_id"),
  tags: text("tags").array(),
  arquivada: boolean("arquivada").default(false).notNull()
});

// Tabela de comentários
export const comentariosTarefa = pgTable("comentarios_tarefa", {
  id: serial("id").primaryKey(),
  tarefaId: integer("tarefa_id").notNull(),
  usuarioId: integer("usuario_id").notNull(),
  conteudo: text("conteudo").notNull(),
  dataCriacao: timestamp("data_criacao").defaultNow().notNull(),
});

// Tabela de anexos
export const anexosTarefa = pgTable("anexos_tarefa", {
  id: serial("id").primaryKey(),
  tarefaId: integer("tarefa_id").notNull(),
  usuarioId: integer("usuario_id").notNull(),
  nomeArquivo: text("nome_arquivo").notNull(),
  caminhoArquivo: text("caminho_arquivo").notNull(),
  tamanhoBytes: integer("tamanho_bytes").notNull(),
  tipoArquivo: text("tipo_arquivo").notNull(),
  dataCriacao: timestamp("data_criacao").defaultNow().notNull(),
});

// Schemas para inserção
export const insertTarefaSchema = createInsertSchema(tarefas, {
  titulo: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  descricao: z.string().optional(),
  status: z.enum([
    StatusTarefa.BACKLOG, 
    StatusTarefa.TODO, 
    StatusTarefa.IN_PROGRESS, 
    StatusTarefa.REVIEW, 
    StatusTarefa.DONE
  ]),
  prioridade: z.enum([
    PrioridadeTarefa.LOW, 
    PrioridadeTarefa.MEDIUM, 
    PrioridadeTarefa.HIGH, 
    PrioridadeTarefa.URGENT
  ]),
  dataVencimento: z.date().optional(),
  tags: z.array(z.string()).optional()
}).omit({ id: true, dataCriacao: true, dataAtualizacao: true, dataConclusao: true });

export const insertComentarioTarefaSchema = createInsertSchema(comentariosTarefa, {
  conteudo: z.string().min(1, "O comentário não pode estar vazio"),
}).omit({ id: true, dataCriacao: true });

export const insertAnexoTarefaSchema = createInsertSchema(anexosTarefa).omit({ 
  id: true, 
  dataCriacao: true 
});

// Tipos para uso na aplicação
export type Tarefa = typeof tarefas.$inferSelect;
export type InsertTarefa = z.infer<typeof insertTarefaSchema>;
export type ComentarioTarefa = typeof comentariosTarefa.$inferSelect;
export type InsertComentarioTarefa = z.infer<typeof insertComentarioTarefaSchema>;
export type AnexoTarefa = typeof anexosTarefa.$inferSelect;
export type InsertAnexoTarefa = z.infer<typeof insertAnexoTarefaSchema>;