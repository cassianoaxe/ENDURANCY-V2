import { relations } from 'drizzle-orm';
import { 
  pgTable, 
  serial, 
  integer, 
  text, 
  timestamp, 
  boolean, 
  pgEnum, 
  numeric, 
  date,
  uuid
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users, organizations } from './schema';

// Enumerações para o módulo financeiro
export const tipoContaEnum = pgEnum('tipo_conta', [
  'RECEITA',
  'DESPESA',
  'INVESTIMENTO',
  'TRANSFERENCIA'
]);

export const statusContaEnum = pgEnum('status_conta', [
  'PENDENTE',
  'PAGO',
  'VENCIDO',
  'CANCELADO',
  'PARCELADO'
]);

export const recorrenciaEnum = pgEnum('recorrencia', [
  'UNICA',
  'DIARIA',
  'SEMANAL',
  'QUINZENAL',
  'MENSAL',
  'BIMESTRAL',
  'TRIMESTRAL',
  'SEMESTRAL',
  'ANUAL'
]);

export const tipoFluxoEnum = pgEnum('tipo_fluxo', [
  'ENTRADA',
  'SAIDA'
]);

// Tabelas principais
export const categoriasFinanceirasTable = pgTable('categorias_financeiras', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  nome: text('nome').notNull(),
  descricao: text('descricao'),
  tipo: tipoContaEnum('tipo').notNull(),
  cor: text('cor').default('#3b82f6'),
  icone: text('icone'),
  ativo: boolean('ativo').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const contasReceberTable = pgTable('contas_receber', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  categoriaId: integer('categoria_id').references(() => categoriasFinanceirasTable.id),
  descricao: text('descricao').notNull(),
  valor: numeric('valor', { precision: 10, scale: 2 }).notNull(),
  dataEmissao: date('data_emissao').notNull(),
  dataVencimento: date('data_vencimento').notNull(),
  dataPagamento: date('data_pagamento'),
  status: statusContaEnum('status').notNull().default('PENDENTE'),
  recorrencia: recorrenciaEnum('recorrencia').default('UNICA'),
  observacoes: text('observacoes'),
  anexo: text('anexo'),
  clienteNome: text('cliente_nome'),
  clienteId: integer('cliente_id'),
  numeroDocumento: text('numero_documento'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const contasPagarTable = pgTable('contas_pagar', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  categoriaId: integer('categoria_id').references(() => categoriasFinanceirasTable.id),
  descricao: text('descricao').notNull(),
  valor: numeric('valor', { precision: 10, scale: 2 }).notNull(),
  dataEmissao: date('data_emissao').notNull(),
  dataVencimento: date('data_vencimento').notNull(),
  dataPagamento: date('data_pagamento'),
  status: statusContaEnum('status').notNull().default('PENDENTE'),
  recorrencia: recorrenciaEnum('recorrencia').default('UNICA'),
  observacoes: text('observacoes'),
  anexo: text('anexo'),
  fornecedorNome: text('fornecedor_nome'),
  fornecedorId: integer('fornecedor_id'),
  numeroDocumento: text('numero_documento'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const contasBancariasTable = pgTable('contas_bancarias', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  nome: text('nome').notNull(),
  tipo: text('tipo').notNull(), // corrente, poupança, investimento
  banco: text('banco'),
  agencia: text('agencia'),
  conta: text('conta'),
  saldoInicial: numeric('saldo_inicial', { precision: 10, scale: 2 }).default('0'),
  saldoAtual: numeric('saldo_atual', { precision: 10, scale: 2 }).default('0'),
  ativo: boolean('ativo').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const movimentosFinanceirosTable = pgTable('movimentos_financeiros', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  contaBancariaId: integer('conta_bancaria_id').references(() => contasBancariasTable.id),
  categoriaId: integer('categoria_id').references(() => categoriasFinanceirasTable.id),
  tipo: tipoFluxoEnum('tipo').notNull(),
  descricao: text('descricao').notNull(),
  valor: numeric('valor', { precision: 10, scale: 2 }).notNull(),
  data: date('data').notNull(),
  observacoes: text('observacoes'),
  reconciliado: boolean('reconciliado').default(false),
  contaOrigemId: integer('conta_origem_id'),
  contaPagarId: integer('conta_pagar_id').references(() => contasPagarTable.id),
  contaReceberId: integer('conta_receber_id').references(() => contasReceberTable.id),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const orcamentosTable = pgTable('orcamentos', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  nome: text('nome').notNull(),
  descricao: text('descricao'),
  dataInicio: date('data_inicio').notNull(),
  dataFim: date('data_fim').notNull(),
  ativo: boolean('ativo').default(true),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const itensOrcamentoTable = pgTable('itens_orcamento', {
  id: serial('id').primaryKey(),
  orcamentoId: integer('orcamento_id').notNull().references(() => orcamentosTable.id, { onDelete: 'cascade' }),
  categoriaId: integer('categoria_id').references(() => categoriasFinanceirasTable.id),
  tipo: tipoFluxoEnum('tipo').notNull(),
  descricao: text('descricao').notNull(),
  valorPrevisto: numeric('valor_previsto', { precision: 10, scale: 2 }).notNull(),
  valorRealizado: numeric('valor_realizado', { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Relacionamentos
export const categoriasFinanceirasRelations = relations(categoriasFinanceirasTable, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [categoriasFinanceirasTable.organizationId],
    references: [organizations.id]
  }),
  contasReceber: many(contasReceberTable),
  contasPagar: many(contasPagarTable),
  movimentos: many(movimentosFinanceirosTable),
  itensOrcamento: many(itensOrcamentoTable)
}));

export const contasReceberRelations = relations(contasReceberTable, ({ one }) => ({
  organization: one(organizations, {
    fields: [contasReceberTable.organizationId],
    references: [organizations.id]
  }),
  categoria: one(categoriasFinanceirasTable, {
    fields: [contasReceberTable.categoriaId],
    references: [categoriasFinanceirasTable.id]
  }),
  createdByUser: one(users, {
    fields: [contasReceberTable.createdBy],
    references: [users.id]
  })
}));

export const contasPagarRelations = relations(contasPagarTable, ({ one }) => ({
  organization: one(organizations, {
    fields: [contasPagarTable.organizationId],
    references: [organizations.id]
  }),
  categoria: one(categoriasFinanceirasTable, {
    fields: [contasPagarTable.categoriaId],
    references: [categoriasFinanceirasTable.id]
  }),
  createdByUser: one(users, {
    fields: [contasPagarTable.createdBy],
    references: [users.id]
  })
}));

export const contasBancariasRelations = relations(contasBancariasTable, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [contasBancariasTable.organizationId],
    references: [organizations.id]
  }),
  movimentos: many(movimentosFinanceirosTable)
}));

export const movimentosFinanceirosRelations = relations(movimentosFinanceirosTable, ({ one }) => ({
  organization: one(organizations, {
    fields: [movimentosFinanceirosTable.organizationId],
    references: [organizations.id]
  }),
  contaBancaria: one(contasBancariasTable, {
    fields: [movimentosFinanceirosTable.contaBancariaId],
    references: [contasBancariasTable.id]
  }),
  categoria: one(categoriasFinanceirasTable, {
    fields: [movimentosFinanceirosTable.categoriaId],
    references: [categoriasFinanceirasTable.id]
  }),
  contaPagar: one(contasPagarTable, {
    fields: [movimentosFinanceirosTable.contaPagarId],
    references: [contasPagarTable.id]
  }),
  contaReceber: one(contasReceberTable, {
    fields: [movimentosFinanceirosTable.contaReceberId],
    references: [contasReceberTable.id]
  }),
  createdByUser: one(users, {
    fields: [movimentosFinanceirosTable.createdBy],
    references: [users.id]
  })
}));

export const orcamentosRelations = relations(orcamentosTable, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [orcamentosTable.organizationId],
    references: [organizations.id]
  }),
  itens: many(itensOrcamentoTable),
  createdByUser: one(users, {
    fields: [orcamentosTable.createdBy],
    references: [users.id]
  })
}));

export const itensOrcamentoRelations = relations(itensOrcamentoTable, ({ one }) => ({
  orcamento: one(orcamentosTable, {
    fields: [itensOrcamentoTable.orcamentoId],
    references: [orcamentosTable.id]
  }),
  categoria: one(categoriasFinanceirasTable, {
    fields: [itensOrcamentoTable.categoriaId],
    references: [categoriasFinanceirasTable.id]
  })
}));

// Schemas para validação e tipagem

// Categorias Financeiras
export const insertCategoriaFinanceiraSchema = createInsertSchema(categoriasFinanceirasTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type InsertCategoriaFinanceira = z.infer<typeof insertCategoriaFinanceiraSchema>;
export type CategoriaFinanceira = typeof categoriasFinanceirasTable.$inferSelect;

// Contas a Receber
export const insertContaReceberSchema = createInsertSchema(contasReceberTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type InsertContaReceber = z.infer<typeof insertContaReceberSchema>;
export type ContaReceber = typeof contasReceberTable.$inferSelect;

// Contas a Pagar
export const insertContaPagarSchema = createInsertSchema(contasPagarTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type InsertContaPagar = z.infer<typeof insertContaPagarSchema>;
export type ContaPagar = typeof contasPagarTable.$inferSelect;

// Contas Bancárias
export const insertContaBancariaSchema = createInsertSchema(contasBancariasTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type InsertContaBancaria = z.infer<typeof insertContaBancariaSchema>;
export type ContaBancaria = typeof contasBancariasTable.$inferSelect;

// Movimentos Financeiros
export const insertMovimentoFinanceiroSchema = createInsertSchema(movimentosFinanceirosTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type InsertMovimentoFinanceiro = z.infer<typeof insertMovimentoFinanceiroSchema>;
export type MovimentoFinanceiro = typeof movimentosFinanceirosTable.$inferSelect;

// Orçamentos
export const insertOrcamentoSchema = createInsertSchema(orcamentosTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type InsertOrcamento = z.infer<typeof insertOrcamentoSchema>;
export type Orcamento = typeof orcamentosTable.$inferSelect;

// Itens de Orçamento
export const insertItemOrcamentoSchema = createInsertSchema(itensOrcamentoTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type InsertItemOrcamento = z.infer<typeof insertItemOrcamentoSchema>;
export type ItemOrcamento = typeof itensOrcamentoTable.$inferSelect;