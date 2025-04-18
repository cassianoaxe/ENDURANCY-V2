import { relations } from 'drizzle-orm';
import { 
  pgTable, 
  serial, 
  varchar, 
  timestamp, 
  text, 
  integer, 
  boolean, 
  date,
  numeric,
  pgEnum,
  uuid,
  unique
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { usuariosTable } from './schema';

// Enums financeiros
export const tipoTransacaoEnum = pgEnum('tipo_transacao', [
  'receita',
  'despesa',
  'transferencia'
]);

export const statusTransacaoEnum = pgEnum('status_transacao', [
  'pendente',
  'pago',
  'atrasado',
  'cancelado',
  'estornado'
]);

export const recorrenciaEnum = pgEnum('recorrencia', [
  'unica',
  'diaria',
  'semanal',
  'quinzenal',
  'mensal',
  'bimestral',
  'trimestral',
  'semestral',
  'anual'
]);

export const tipoCategoriaEnum = pgEnum('tipo_categoria', [
  'receita',
  'despesa',
  'ambos'
]);

export const tipoContaEnum = pgEnum('tipo_conta', [
  'corrente',
  'poupanca',
  'investimento',
  'cartao_credito',
  'cartao_debito',
  'dinheiro',
  'outros'
]);

// Tabelas financeiras
export const contasFinanceirasTable = pgTable('contas_financeiras', {
  id: serial('id').primaryKey(),
  organizacaoId: integer('organizacao_id').notNull(),
  nome: varchar('nome', { length: 100 }).notNull(),
  tipo: tipoContaEnum('tipo').notNull(),
  banco: varchar('banco', { length: 100 }),
  agencia: varchar('agencia', { length: 20 }),
  conta: varchar('conta', { length: 30 }),
  saldoInicial: numeric('saldo_inicial', { precision: 10, scale: 2 }).notNull().default('0'),
  saldoAtual: numeric('saldo_atual', { precision: 10, scale: 2 }).notNull().default('0'),
  cor: varchar('cor', { length: 20 }).default('#3B82F6'),
  ativo: boolean('ativo').notNull().default(true),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
});

export const categoriasFinanceirasTable = pgTable('categorias_financeiras', {
  id: serial('id').primaryKey(),
  organizacaoId: integer('organizacao_id').notNull(),
  nome: varchar('nome', { length: 100 }).notNull(),
  tipo: tipoCategoriaEnum('tipo').notNull(),
  cor: varchar('cor', { length: 20 }).default('#3B82F6'),
  icone: varchar('icone', { length: 50 }),
  categoriaParentId: integer('categoria_parent_id'),
  ativo: boolean('ativo').notNull().default(true),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
});

export const centrosCustoTable = pgTable('centros_custo', {
  id: serial('id').primaryKey(),
  organizacaoId: integer('organizacao_id').notNull(),
  nome: varchar('nome', { length: 100 }).notNull(),
  descricao: text('descricao'),
  cor: varchar('cor', { length: 20 }).default('#3B82F6'),
  ativo: boolean('ativo').notNull().default(true),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
});

export const transacoesFinanceirasTable = pgTable('transacoes_financeiras', {
  id: serial('id').primaryKey(),
  organizacaoId: integer('organizacao_id').notNull(),
  tipo: tipoTransacaoEnum('tipo').notNull(),
  descricao: varchar('descricao', { length: 200 }).notNull(),
  valor: numeric('valor', { precision: 10, scale: 2 }).notNull(),
  dataEmissao: date('data_emissao').notNull(),
  dataVencimento: date('data_vencimento').notNull(),
  dataPagamento: date('data_pagamento'),
  status: statusTransacaoEnum('status').notNull().default('pendente'),
  recorrencia: recorrenciaEnum('recorrencia').notNull().default('unica'),
  observacoes: text('observacoes'),
  anexo: text('anexo'),
  contaId: integer('conta_id').notNull().references(() => contasFinanceirasTable.id),
  categoriaId: integer('categoria_id').references(() => categoriasFinanceirasTable.id),
  centroCustoId: integer('centro_custo_id').references(() => centrosCustoTable.id),
  transacaoParentId: integer('transacao_parent_id').references(() => transacoesFinanceirasTable.id),
  // Em caso de transferência, essa é a conta destino
  contaDestinoId: integer('conta_destino_id').references(() => contasFinanceirasTable.id),
  // Para contas a pagar/receber:
  fornecedorClienteId: integer('fornecedor_cliente_id'),
  fornecedorClienteNome: varchar('fornecedor_cliente_nome', { length: 100 }),
  // Controle financeiro
  reconciliado: boolean('reconciliado').notNull().default(false),
  criadoPor: integer('criado_por'),
  atualizadoPor: integer('atualizado_por'),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
});

export const orcamentosTable = pgTable('orcamentos', {
  id: serial('id').primaryKey(),
  organizacaoId: integer('organizacao_id').notNull(),
  nome: varchar('nome', { length: 100 }).notNull(),
  descricao: text('descricao'),
  anoReferencia: integer('ano_referencia').notNull(),
  mesReferencia: integer('mes_referencia'),
  valorTotal: numeric('valor_total', { precision: 10, scale: 2 }).notNull().default('0'),
  ativo: boolean('ativo').notNull().default(true),
  criadoPor: integer('criado_por'),
  atualizadoPor: integer('atualizado_por'),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
});

export const orcamentosCategoriasTable = pgTable('orcamentos_categorias', {
  id: serial('id').primaryKey(),
  orcamentoId: integer('orcamento_id').notNull().references(() => orcamentosTable.id),
  categoriaId: integer('categoria_id').notNull().references(() => categoriasFinanceirasTable.id),
  valor: numeric('valor', { precision: 10, scale: 2 }).notNull(),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),

  // Garante que cada categoria apareça apenas uma vez por orçamento
  uniqueCategoriaOrcamento: unique('unique_categoria_orcamento'),
});

// Tabela para conciliação bancária
export const extratosBancariosTable = pgTable('extratos_bancarios', {
  id: serial('id').primaryKey(),
  organizacaoId: integer('organizacao_id').notNull(),
  contaId: integer('conta_id').notNull().references(() => contasFinanceirasTable.id),
  dataImportacao: timestamp('data_importacao').defaultNow().notNull(),
  dataInicio: date('data_inicio').notNull(),
  dataFim: date('data_fim').notNull(),
  saldoInicial: numeric('saldo_inicial', { precision: 10, scale: 2 }).notNull(),
  saldoFinal: numeric('saldo_final', { precision: 10, scale: 2 }).notNull(),
  arquivoOriginal: text('arquivo_original'),
  importadoPor: integer('importado_por'),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
});

export const extratoTransacoesTable = pgTable('extrato_transacoes', {
  id: serial('id').primaryKey(),
  extratoId: integer('extrato_id').notNull().references(() => extratosBancariosTable.id),
  dataTransacao: date('data_transacao').notNull(),
  descricao: varchar('descricao', { length: 200 }).notNull(),
  valor: numeric('valor', { precision: 10, scale: 2 }).notNull(),
  tipo: tipoTransacaoEnum('tipo').notNull(),
  identificadorBanco: varchar('identificador_banco', { length: 100 }),
  reconciliado: boolean('reconciliado').notNull().default(false),
  transacaoId: integer('transacao_id').references(() => transacoesFinanceirasTable.id),
  categoriaId: integer('categoria_id').references(() => categoriasFinanceirasTable.id),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
});

// Tabela para análise financeira
export const relatoriosFinanceirosTable = pgTable('relatorios_financeiros', {
  id: serial('id').primaryKey(),
  organizacaoId: integer('organizacao_id').notNull(),
  nome: varchar('nome', { length: 100 }).notNull(),
  tipo: varchar('tipo', { length: 50 }).notNull(), // 'fluxo_caixa', 'dre', 'balanco', etc
  parametros: text('parametros'), // JSON com parâmetros do relatório
  dataInicio: date('data_inicio').notNull(),
  dataFim: date('data_fim').notNull(),
  geradoPor: integer('gerado_por'),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
});

// Definindo relações
export const contasFinanceirasRelations = relations(contasFinanceirasTable, ({ many }) => ({
  transacoes: many(transacoesFinanceirasTable, { relationName: 'conta_transacoes' }),
  transacoesDestino: many(transacoesFinanceirasTable, { relationName: 'conta_destino_transacoes' }),
  extratos: many(extratosBancariosTable)
}));

export const categoriasFinanceirasRelations = relations(categoriasFinanceirasTable, ({ many, one }) => ({
  transacoes: many(transacoesFinanceirasTable),
  orcamentos: many(orcamentosCategoriasTable),
  extratoTransacoes: many(extratoTransacoesTable),
  categoriaParent: one(categoriasFinanceirasTable, {
    fields: [categoriasFinanceirasTable.categoriaParentId],
    references: [categoriasFinanceirasTable.id]
  }),
  subcategorias: many(categoriasFinanceirasTable, { relationName: 'subcategorias' })
}));

export const centrosCustoRelations = relations(centrosCustoTable, ({ many }) => ({
  transacoes: many(transacoesFinanceirasTable)
}));

export const transacoesFinanceirasRelations = relations(transacoesFinanceirasTable, ({ one, many }) => ({
  conta: one(contasFinanceirasTable, { 
    fields: [transacoesFinanceirasTable.contaId],
    references: [contasFinanceirasTable.id],
    relationName: 'conta_transacoes'
  }),
  contaDestino: one(contasFinanceirasTable, { 
    fields: [transacoesFinanceirasTable.contaDestinoId],
    references: [contasFinanceirasTable.id],
    relationName: 'conta_destino_transacoes'
  }),
  categoria: one(categoriasFinanceirasTable, { 
    fields: [transacoesFinanceirasTable.categoriaId],
    references: [categoriasFinanceirasTable.id]
  }),
  centroCusto: one(centrosCustoTable, { 
    fields: [transacoesFinanceirasTable.centroCustoId],
    references: [centrosCustoTable.id]
  }),
  transacaoParent: one(transacoesFinanceirasTable, {
    fields: [transacoesFinanceirasTable.transacaoParentId],
    references: [transacoesFinanceirasTable.id]
  }),
  transacoesFilhas: many(transacoesFinanceirasTable, { relationName: 'transacoes_filhas' }),
  extratoTransacoes: many(extratoTransacoesTable)
}));

export const orcamentosRelations = relations(orcamentosTable, ({ many }) => ({
  categorias: many(orcamentosCategoriasTable)
}));

export const orcamentosCategoriasRelations = relations(orcamentosCategoriasTable, ({ one }) => ({
  orcamento: one(orcamentosTable, { 
    fields: [orcamentosCategoriasTable.orcamentoId],
    references: [orcamentosTable.id]
  }),
  categoria: one(categoriasFinanceirasTable, { 
    fields: [orcamentosCategoriasTable.categoriaId],
    references: [categoriasFinanceirasTable.id]
  })
}));

export const extratosBancariosRelations = relations(extratosBancariosTable, ({ one, many }) => ({
  conta: one(contasFinanceirasTable, { 
    fields: [extratosBancariosTable.contaId],
    references: [contasFinanceirasTable.id]
  }),
  transacoes: many(extratoTransacoesTable)
}));

export const extratoTransacoesRelations = relations(extratoTransacoesTable, ({ one }) => ({
  extrato: one(extratosBancariosTable, { 
    fields: [extratoTransacoesTable.extratoId],
    references: [extratosBancariosTable.id]
  }),
  transacao: one(transacoesFinanceirasTable, { 
    fields: [extratoTransacoesTable.transacaoId],
    references: [transacoesFinanceirasTable.id]
  }),
  categoria: one(categoriasFinanceirasTable, { 
    fields: [extratoTransacoesTable.categoriaId],
    references: [categoriasFinanceirasTable.id]
  })
}));

// Schemas para inserção com validação Zod
export const insertContaFinanceiraSchema = createInsertSchema(contasFinanceirasTable).omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true
});

export const insertCategoriaFinanceiraSchema = createInsertSchema(categoriasFinanceirasTable).omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true
});

export const insertCentroCustoSchema = createInsertSchema(centrosCustoTable).omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true
});

export const insertTransacaoFinanceiraSchema = createInsertSchema(transacoesFinanceirasTable).omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true
});

export const insertOrcamentoSchema = createInsertSchema(orcamentosTable).omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true
});

export const insertOrcamentoCategoriaSchema = createInsertSchema(orcamentosCategoriasTable).omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true
});

export const insertExtratoBancarioSchema = createInsertSchema(extratosBancariosTable).omit({
  id: true,
  criadoEm: true
});

export const insertExtratoTransacaoSchema = createInsertSchema(extratoTransacoesTable).omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true
});

export const insertRelatorioFinanceiroSchema = createInsertSchema(relatoriosFinanceirosTable).omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true
});

// Types para inserção
export type InsertContaFinanceira = z.infer<typeof insertContaFinanceiraSchema>;
export type InsertCategoriaFinanceira = z.infer<typeof insertCategoriaFinanceiraSchema>;
export type InsertCentroCusto = z.infer<typeof insertCentroCustoSchema>;
export type InsertTransacaoFinanceira = z.infer<typeof insertTransacaoFinanceiraSchema>;
export type InsertOrcamento = z.infer<typeof insertOrcamentoSchema>;
export type InsertOrcamentoCategoria = z.infer<typeof insertOrcamentoCategoriaSchema>;
export type InsertExtratoBancario = z.infer<typeof insertExtratoBancarioSchema>;
export type InsertExtratoTransacao = z.infer<typeof insertExtratoTransacaoSchema>;
export type InsertRelatorioFinanceiro = z.infer<typeof insertRelatorioFinanceiroSchema>;

// Types para seleção
export type ContaFinanceira = typeof contasFinanceirasTable.$inferSelect;
export type CategoriaFinanceira = typeof categoriasFinanceirasTable.$inferSelect;
export type CentroCusto = typeof centrosCustoTable.$inferSelect;
export type TransacaoFinanceira = typeof transacoesFinanceirasTable.$inferSelect;
export type Orcamento = typeof orcamentosTable.$inferSelect;
export type OrcamentoCategoria = typeof orcamentosCategoriasTable.$inferSelect;
export type ExtratoBancario = typeof extratosBancariosTable.$inferSelect;
export type ExtratoTransacao = typeof extratoTransacoesTable.$inferSelect;
export type RelatorioFinanceiro = typeof relatoriosFinanceirosTable.$inferSelect;