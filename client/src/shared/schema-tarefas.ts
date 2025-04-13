import { boolean, index, integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums para status e prioridade de tarefas
export const StatusTarefa = {
  BACKLOG: "BACKLOG",
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  REVIEW: "REVIEW",
  DONE: "DONE"
} as const;

export const PrioridadeTarefa = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT"
} as const;

export const statusTarefaEnum = pgEnum('status_tarefa', [
  StatusTarefa.BACKLOG,
  StatusTarefa.TODO,
  StatusTarefa.IN_PROGRESS,
  StatusTarefa.REVIEW,
  StatusTarefa.DONE
]);

export const prioridadeTarefaEnum = pgEnum('prioridade_tarefa', [
  PrioridadeTarefa.LOW,
  PrioridadeTarefa.MEDIUM,
  PrioridadeTarefa.HIGH,
  PrioridadeTarefa.URGENT
]);

// Tabela de tarefas
export const tarefas = pgTable('tarefas', {
  id: serial('id').primaryKey(),
  titulo: varchar('titulo', { length: 255 }).notNull(),
  descricao: text('descricao'),
  status: statusTarefaEnum('status').notNull().default(StatusTarefa.TODO),
  prioridade: prioridadeTarefaEnum('prioridade').notNull().default(PrioridadeTarefa.MEDIUM),
  dataCriacao: timestamp('data_criacao').defaultNow().notNull(),
  dataVencimento: timestamp('data_vencimento'),
  dataConclusao: timestamp('data_conclusao'),
  responsavelId: integer('responsavel_id').references(() => usuarios.id),
  organizacaoId: integer('organizacao_id').notNull(),
  departamentoId: integer('departamento_id'),
  projetoId: integer('projeto_id'),
  criadorId: integer('criador_id').notNull(),
  arquivada: boolean('arquivada').default(false).notNull()
}, (table) => {
  return {
    idxStatus: index('idx_tarefas_status').on(table.status),
    idxPrioridade: index('idx_tarefas_prioridade').on(table.prioridade),
    idxResponsavel: index('idx_tarefas_responsavel').on(table.responsavelId),
    idxOrganizacao: index('idx_tarefas_organizacao').on(table.organizacaoId),
    idxDataVencimento: index('idx_tarefas_data_vencimento').on(table.dataVencimento)
  };
});

// Comentários de tarefas
export const comentariosTarefas = pgTable('comentarios_tarefas', {
  id: serial('id').primaryKey(),
  tarefaId: integer('tarefa_id').notNull().references(() => tarefas.id),
  usuarioId: integer('usuario_id').notNull(),
  conteudo: text('conteudo').notNull(),
  dataCriacao: timestamp('data_criacao').defaultNow().notNull()
}, (table) => {
  return {
    idxTarefa: index('idx_comentarios_tarefa').on(table.tarefaId),
    idxUsuario: index('idx_comentarios_usuario').on(table.usuarioId)
  };
});

// Etiquetas para tarefas
export const etiquetasTarefas = pgTable('etiquetas_tarefas', {
  id: serial('id').primaryKey(),
  nome: varchar('nome', { length: 50 }).notNull(),
  cor: varchar('cor', { length: 7 }).notNull(),
  organizacaoId: integer('organizacao_id').notNull()
}, (table) => {
  return {
    idxOrganizacao: index('idx_etiquetas_organizacao').on(table.organizacaoId)
  };
});

// Tabela de relacionamento entre tarefas e etiquetas
export const tarefasEtiquetas = pgTable('tarefas_etiquetas', {
  tarefaId: integer('tarefa_id').notNull().references(() => tarefas.id),
  etiquetaId: integer('etiqueta_id').notNull().references(() => etiquetasTarefas.id)
}, (table) => {
  return {
    pk: index('pk_tarefas_etiquetas').on(table.tarefaId, table.etiquetaId)
  };
});

// Histórico de alterações de tarefas
export const historicoTarefas = pgTable('historico_tarefas', {
  id: serial('id').primaryKey(),
  tarefaId: integer('tarefa_id').notNull().references(() => tarefas.id),
  usuarioId: integer('usuario_id').notNull(),
  campo: varchar('campo', { length: 50 }).notNull(),
  valorAntigo: text('valor_antigo'),
  valorNovo: text('valor_novo'),
  dataAlteracao: timestamp('data_alteracao').defaultNow().notNull()
}, (table) => {
  return {
    idxTarefa: index('idx_historico_tarefa').on(table.tarefaId),
    idxUsuario: index('idx_historico_usuario').on(table.usuarioId)
  };
});

// Tabela de anexos de tarefas
export const anexosTarefas = pgTable('anexos_tarefas', {
  id: serial('id').primaryKey(),
  tarefaId: integer('tarefa_id').notNull().references(() => tarefas.id),
  usuarioId: integer('usuario_id').notNull(),
  nomeArquivo: varchar('nome_arquivo', { length: 255 }).notNull(),
  caminhoArquivo: varchar('caminho_arquivo', { length: 512 }).notNull(),
  tipoArquivo: varchar('tipo_arquivo', { length: 50 }).notNull(),
  tamanhoArquivo: integer('tamanho_arquivo').notNull(),
  dataCriacao: timestamp('data_criacao').defaultNow().notNull()
}, (table) => {
  return {
    idxTarefa: index('idx_anexos_tarefa').on(table.tarefaId),
    idxUsuario: index('idx_anexos_usuario').on(table.usuarioId)
  };
});

// Referência à tabela de usuários que já deve existir
const usuarios = pgTable('users', {
  id: serial('id').primaryKey()
});

// Schemas para inserção de dados usando Zod
export const insertTarefaSchema = createInsertSchema(tarefas)
  .omit({ id: true, dataCriacao: true, dataConclusao: true, arquivada: true });

export const insertComentarioTarefaSchema = createInsertSchema(comentariosTarefas)
  .omit({ id: true, dataCriacao: true });

export const insertEtiquetaTarefaSchema = createInsertSchema(etiquetasTarefas)
  .omit({ id: true });

export const insertAnexoTarefaSchema = createInsertSchema(anexosTarefas)
  .omit({ id: true, dataCriacao: true });

// Types de inserção
export type InsertTarefa = z.infer<typeof insertTarefaSchema>;
export type InsertComentarioTarefa = z.infer<typeof insertComentarioTarefaSchema>;
export type InsertEtiquetaTarefa = z.infer<typeof insertEtiquetaTarefaSchema>;
export type InsertAnexoTarefa = z.infer<typeof insertAnexoTarefaSchema>;

// Types de seleção
export type Tarefa = typeof tarefas.$inferSelect;
export type ComentarioTarefa = typeof comentariosTarefas.$inferSelect;
export type EtiquetaTarefa = typeof etiquetasTarefas.$inferSelect;
export type AnexoTarefa = typeof anexosTarefas.$inferSelect;