import { pgTable, serial, text, varchar, pgEnum, timestamp, numeric, integer, boolean, real, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enum para status de solicitações de compra
export const statusSolicitacaoEnum = pgEnum('status_solicitacao', [
  'pendente',
  'em_cotacao',
  'aprovada',
  'aguardando_entrega',
  'recebida',
  'rejeitada'
]);

// Enum para níveis de urgência
export const urgenciaEnum = pgEnum('urgencia', [
  'baixa',
  'media',
  'alta'
]);

// Enum para status de fornecedores
export const statusFornecedorEnum = pgEnum('status_fornecedor', [
  'ativo',
  'inativo',
  'bloqueado'
]);

// Enum para tipos de fornecedores
export const tipoFornecedorEnum = pgEnum('tipo_fornecedor', [
  'distribuidor',
  'fabricante',
  'prestador_servico',
  'representante',
  'outro'
]);

// Enum para categorias de estoque
export const categoriaEstoqueEnum = pgEnum('categoria_estoque', [
  'materia_prima_ativos',
  'materia_prima_excipientes',
  'embalagens',
  'rotulos',
  'produto_acabado',
  'produto_quarentena',
  'material_laboratorio',
  'material_escritorio',
  'equipamentos',
  'outros'
]);

// Tabela de solicitações de compra
export const solicitacoesCompraTable = pgTable('solicitacoes_compra', {
  id: serial('id').primaryKey(),
  codigo: varchar('codigo', { length: 20 }).notNull().unique(),
  descricao: text('descricao').notNull(),
  solicitanteId: integer('solicitante_id').notNull().references(() => usersTable.id),
  setorId: integer('setor_id').notNull(),
  datasolicitacao: timestamp('data_solicitacao').defaultNow().notNull(),
  urgencia: urgenciaEnum('urgencia').default('media').notNull(),
  status: statusSolicitacaoEnum('status').default('pendente').notNull(),
  valorEstimado: numeric('valor_estimado', { precision: 10, scale: 2 }),
  valorAprovado: numeric('valor_aprovado', { precision: 10, scale: 2 }),
  dataCotacao: timestamp('data_cotacao'),
  dataAprovacao: timestamp('data_aprovacao'),
  responsavelAprovacaoId: integer('responsavel_aprovacao_id').references(() => usersTable.id),
  observacoes: text('observacoes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Tabela de itens de solicitação de compra
export const itensSolicitacaoTable = pgTable('itens_solicitacao', {
  id: serial('id').primaryKey(),
  solicitacaoId: integer('solicitacao_id').notNull().references(() => solicitacoesCompraTable.id),
  descricao: text('descricao').notNull(),
  quantidade: integer('quantidade').notNull(),
  unidade: varchar('unidade', { length: 10 }).notNull(),
  valorUnitario: numeric('valor_unitario', { precision: 10, scale: 2 }),
  valorTotal: numeric('valor_total', { precision: 10, scale: 2 }),
  observacoes: text('observacoes'),
  itemEstoqueId: integer('item_estoque_id').references(() => itensEstoqueTable.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Tabela de fornecedores
export const fornecedoresTable = pgTable('fornecedores', {
  id: serial('id').primaryKey(),
  nome: varchar('nome', { length: 100 }).notNull(),
  razaoSocial: varchar('razao_social', { length: 100 }).notNull(),
  cnpj: varchar('cnpj', { length: 20 }).notNull().unique(),
  tipo: tipoFornecedorEnum('tipo').notNull(),
  status: statusFornecedorEnum('status').default('ativo').notNull(),
  contatoNome: varchar('contato_nome', { length: 100 }),
  contatoEmail: varchar('contato_email', { length: 100 }),
  contatoTelefone: varchar('contato_telefone', { length: 20 }),
  endereco: text('endereco'),
  cidade: varchar('cidade', { length: 100 }),
  estado: varchar('estado', { length: 2 }),
  cep: varchar('cep', { length: 10 }),
  website: varchar('website', { length: 100 }),
  avaliacao: real('avaliacao'),
  ultimaCompra: timestamp('ultima_compra'),
  observacoes: text('observacoes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Tabela de pedidos de compra
export const pedidosCompraTable = pgTable('pedidos_compra', {
  id: serial('id').primaryKey(),
  codigo: varchar('codigo', { length: 20 }).notNull().unique(),
  solicitacaoId: integer('solicitacao_id').references(() => solicitacoesCompraTable.id),
  fornecedorId: integer('fornecedor_id').notNull().references(() => fornecedoresTable.id),
  dataPedido: timestamp('data_pedido').defaultNow().notNull(),
  solicitanteId: integer('solicitante_id').notNull().references(() => usersTable.id),
  setorId: integer('setor_id').notNull(),
  valorTotal: numeric('valor_total', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  previsaoEntrega: timestamp('previsao_entrega'),
  dataEntrega: timestamp('data_entrega'),
  formaPagamento: varchar('forma_pagamento', { length: 50 }),
  condicaoPagamento: varchar('condicao_pagamento', { length: 50 }),
  observacoes: text('observacoes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Tabela de itens de pedido de compra
export const itensPedidoTable = pgTable('itens_pedido', {
  id: serial('id').primaryKey(),
  pedidoId: integer('pedido_id').notNull().references(() => pedidosCompraTable.id),
  itemSolicitacaoId: integer('item_solicitacao_id').references(() => itensSolicitacaoTable.id),
  descricao: text('descricao').notNull(),
  quantidade: integer('quantidade').notNull(),
  unidade: varchar('unidade', { length: 10 }).notNull(),
  valorUnitario: numeric('valor_unitario', { precision: 10, scale: 2 }).notNull(),
  valorTotal: numeric('valor_total', { precision: 10, scale: 2 }).notNull(),
  observacoes: text('observacoes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Tabela de itens de estoque
export const itensEstoqueTable = pgTable('itens_estoque', {
  id: serial('id').primaryKey(),
  codigo: varchar('codigo', { length: 20 }).notNull().unique(),
  nome: varchar('nome', { length: 100 }).notNull(),
  descricao: text('descricao'),
  categoria: categoriaEstoqueEnum('categoria').notNull(),
  unidade: varchar('unidade', { length: 10 }).notNull(),
  quantidadeAtual: integer('quantidade_atual').default(0).notNull(),
  quantidadeMinima: integer('quantidade_minima').default(0).notNull(),
  quantidadeIdeal: integer('quantidade_ideal').default(0).notNull(),
  localizacao: varchar('localizacao', { length: 100 }),
  lote: varchar('lote', { length: 50 }),
  dataValidade: timestamp('data_validade'),
  ultimaEntrada: timestamp('ultima_entrada'),
  ultimaSaida: timestamp('ultima_saida'),
  valorUnitario: numeric('valor_unitario', { precision: 10, scale: 2 }),
  fornecedorPreferidoId: integer('fornecedor_preferido_id').references(() => fornecedoresTable.id),
  temAlerta: boolean('tem_alerta').default(false).notNull(),
  observacoes: text('observacoes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Tabela de movimentações de estoque
export const movimentacoesEstoqueTable = pgTable('movimentacoes_estoque', {
  id: serial('id').primaryKey(),
  itemEstoqueId: integer('item_estoque_id').notNull().references(() => itensEstoqueTable.id),
  tipo: varchar('tipo', { length: 10 }).notNull(), // entrada ou saida
  quantidade: integer('quantidade').notNull(),
  data: timestamp('data').defaultNow().notNull(),
  responsavelId: integer('responsavel_id').notNull().references(() => usersTable.id),
  pedidoCompraId: integer('pedido_compra_id').references(() => pedidosCompraTable.id),
  motivo: text('motivo').notNull(),
  observacoes: text('observacoes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Tabela de avaliações de fornecedores
export const avaliacoesFornecedorTable = pgTable('avaliacoes_fornecedor', {
  id: serial('id').primaryKey(),
  fornecedorId: integer('fornecedor_id').notNull().references(() => fornecedoresTable.id),
  pedidoId: integer('pedido_id').references(() => pedidosCompraTable.id),
  avaliadorId: integer('avaliador_id').notNull().references(() => usersTable.id),
  pontuacao: real('pontuacao').notNull(),
  criterioQualidade: real('criterio_qualidade'),
  criterioPrazo: real('criterio_prazo'),
  criterioPreco: real('criterio_preco'),
  criterioAtendimento: real('criterio_atendimento'),
  comentarios: text('comentarios'),
  dataAvaliacao: timestamp('data_avaliacao').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Referência à tabela de usuários
import { usersTable } from './schema-doctor-affiliation';

// Relações de tabelas
export const solicitacoesCompraRelations = relations(solicitacoesCompraTable, ({ one, many }) => ({
  solicitante: one(usersTable, {
    fields: [solicitacoesCompraTable.solicitanteId],
    references: [usersTable.id],
  }),
  responsavelAprovacao: one(usersTable, {
    fields: [solicitacoesCompraTable.responsavelAprovacaoId],
    references: [usersTable.id],
  }),
  itens: many(itensSolicitacaoTable),
  pedido: one(pedidosCompraTable, {
    fields: [solicitacoesCompraTable.id],
    references: [pedidosCompraTable.solicitacaoId],
  }),
}));

export const itensSolicitacaoRelations = relations(itensSolicitacaoTable, ({ one, many }) => ({
  solicitacao: one(solicitacoesCompraTable, {
    fields: [itensSolicitacaoTable.solicitacaoId],
    references: [solicitacoesCompraTable.id],
  }),
  itemEstoque: one(itensEstoqueTable, {
    fields: [itensSolicitacaoTable.itemEstoqueId],
    references: [itensEstoqueTable.id],
  }),
  itensPedido: many(itensPedidoTable),
}));

export const fornecedoresRelations = relations(fornecedoresTable, ({ many }) => ({
  pedidos: many(pedidosCompraTable),
  avaliacoes: many(avaliacoesFornecedorTable),
  itensEstoquePreferidos: many(itensEstoqueTable),
}));

export const pedidosCompraRelations = relations(pedidosCompraTable, ({ one, many }) => ({
  solicitacao: one(solicitacoesCompraTable, {
    fields: [pedidosCompraTable.solicitacaoId],
    references: [solicitacoesCompraTable.id],
  }),
  fornecedor: one(fornecedoresTable, {
    fields: [pedidosCompraTable.fornecedorId],
    references: [fornecedoresTable.id],
  }),
  solicitante: one(usersTable, {
    fields: [pedidosCompraTable.solicitanteId],
    references: [usersTable.id],
  }),
  itens: many(itensPedidoTable),
  movimentacoes: many(movimentacoesEstoqueTable),
}));

export const itensPedidoRelations = relations(itensPedidoTable, ({ one }) => ({
  pedido: one(pedidosCompraTable, {
    fields: [itensPedidoTable.pedidoId],
    references: [pedidosCompraTable.id],
  }),
  itemSolicitacao: one(itensSolicitacaoTable, {
    fields: [itensPedidoTable.itemSolicitacaoId],
    references: [itensSolicitacaoTable.id],
  }),
}));

export const itensEstoqueRelations = relations(itensEstoqueTable, ({ one, many }) => ({
  fornecedorPreferido: one(fornecedoresTable, {
    fields: [itensEstoqueTable.fornecedorPreferidoId],
    references: [fornecedoresTable.id],
  }),
  movimentacoes: many(movimentacoesEstoqueTable),
  itensSolicitacao: many(itensSolicitacaoTable),
}));

export const movimentacoesEstoqueRelations = relations(movimentacoesEstoqueTable, ({ one }) => ({
  itemEstoque: one(itensEstoqueTable, {
    fields: [movimentacoesEstoqueTable.itemEstoqueId],
    references: [itensEstoqueTable.id],
  }),
  responsavel: one(usersTable, {
    fields: [movimentacoesEstoqueTable.responsavelId],
    references: [usersTable.id],
  }),
  pedidoCompra: one(pedidosCompraTable, {
    fields: [movimentacoesEstoqueTable.pedidoCompraId],
    references: [pedidosCompraTable.id],
  }),
}));

export const avaliacoesFornecedorRelations = relations(avaliacoesFornecedorTable, ({ one }) => ({
  fornecedor: one(fornecedoresTable, {
    fields: [avaliacoesFornecedorTable.fornecedorId],
    references: [fornecedoresTable.id],
  }),
  pedido: one(pedidosCompraTable, {
    fields: [avaliacoesFornecedorTable.pedidoId],
    references: [pedidosCompraTable.id],
  }),
  avaliador: one(usersTable, {
    fields: [avaliacoesFornecedorTable.avaliadorId],
    references: [usersTable.id],
  }),
}));

// Schemas para inserção
export const insertSolicitacaoCompraSchema = createInsertSchema(solicitacoesCompraTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertItemSolicitacaoSchema = createInsertSchema(itensSolicitacaoTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertFornecedorSchema = createInsertSchema(fornecedoresTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertPedidoCompraSchema = createInsertSchema(pedidosCompraTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertItemPedidoSchema = createInsertSchema(itensPedidoTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertItemEstoqueSchema = createInsertSchema(itensEstoqueTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertMovimentacaoEstoqueSchema = createInsertSchema(movimentacoesEstoqueTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertAvaliacaoFornecedorSchema = createInsertSchema(avaliacoesFornecedorTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Tipos para inserção
export type InsertSolicitacaoCompra = z.infer<typeof insertSolicitacaoCompraSchema>;
export type InsertItemSolicitacao = z.infer<typeof insertItemSolicitacaoSchema>;
export type InsertFornecedor = z.infer<typeof insertFornecedorSchema>;
export type InsertPedidoCompra = z.infer<typeof insertPedidoCompraSchema>;
export type InsertItemPedido = z.infer<typeof insertItemPedidoSchema>;
export type InsertItemEstoque = z.infer<typeof insertItemEstoqueSchema>;
export type InsertMovimentacaoEstoque = z.infer<typeof insertMovimentacaoEstoqueSchema>;
export type InsertAvaliacaoFornecedor = z.infer<typeof insertAvaliacaoFornecedorSchema>;

// Tipos para select
export type SolicitacaoCompra = typeof solicitacoesCompraTable.$inferSelect;
export type ItemSolicitacao = typeof itensSolicitacaoTable.$inferSelect;
export type Fornecedor = typeof fornecedoresTable.$inferSelect;
export type PedidoCompra = typeof pedidosCompraTable.$inferSelect;
export type ItemPedido = typeof itensPedidoTable.$inferSelect;
export type ItemEstoque = typeof itensEstoqueTable.$inferSelect;
export type MovimentacaoEstoque = typeof movimentacoesEstoqueTable.$inferSelect;
export type AvaliacaoFornecedor = typeof avaliacoesFornecedorTable.$inferSelect;