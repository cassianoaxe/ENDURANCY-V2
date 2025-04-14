import { pgTable, serial, text, timestamp, boolean, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { organizations } from "./schema";

/**
 * Enums para as categorias de documentos de transparência
 */
export const documentoCategoriaEnum = pgEnum('documento_categoria', [
  'financeiro',
  'governanca',
  'legal',
  'membros', 
  'relatorios',
  'certificacao'
]);

/**
 * Enums para as visibilidades dos documentos
 */
export const documentoVisibilidadeEnum = pgEnum('documento_visibilidade', [
  'publico',
  'privado'
]);

/**
 * Tabela de documentos de transparência
 */
export const documentosTransparencia = pgTable('documentos_transparencia', {
  id: serial('id').primaryKey(),
  titulo: text('titulo').notNull(),
  descricao: text('descricao'),
  categoria: documentoCategoriaEnum('categoria').notNull(),
  organizacaoId: integer('organizacao_id').references(() => organizations.id).notNull(),
  arquivoUrl: text('arquivo_url').notNull(),
  arquivoTipo: text('arquivo_tipo').notNull(), // PDF, XLSX, etc
  arquivoTamanho: text('arquivo_tamanho'), // "1.2 MB"
  visibilidade: documentoVisibilidadeEnum('visibilidade').default('publico'),
  tags: text('tags'),
  dataDocumento: timestamp('data_documento'), // Data do documento (pode ser diferente da criação)
  criadoPor: integer('criado_por'),
  atualizadoPor: integer('atualizado_por'),
  criadoEm: timestamp('criado_em').defaultNow(),
  atualizadoEm: timestamp('atualizado_em').defaultNow()
});

/**
 * Schema para inserção de documentos de transparência
 */
export const insertDocumentoTransparenciaSchema = createInsertSchema(documentosTransparencia)
  .omit({ id: true, criadoEm: true, atualizadoEm: true });

/**
 * Tipos derivados dos schemas para facilitar o uso na aplicação
 */
export type DocumentoTransparencia = typeof documentosTransparencia.$inferSelect;
export type InsertDocumentoTransparencia = z.infer<typeof insertDocumentoTransparenciaSchema>;

/**
 * Enums para tipos de certificações
 */
export const certificacaoTipoEnum = pgEnum('certificacao_tipo', [
  'cultivo', 
  'financeiro',
  'regulatorio',
  'governanca',
  'qualidade',
  'organico',
  'gmp', // Good Manufacturing Practices
  'outro'
]);

/**
 * Enums para status de certificações
 */
export const certificacaoStatusEnum = pgEnum('certificacao_status', [
  'ativo',
  'pendente',
  'expirado',
  'revogado'
]);

/**
 * Tabela de certificações da organização
 */
export const certificacoesOrganizacao = pgTable('certificacoes_organizacao', {
  id: serial('id').primaryKey(),
  titulo: text('titulo').notNull(),
  descricao: text('descricao'),
  tipo: certificacaoTipoEnum('tipo').notNull(),
  entidadeCertificadora: text('entidade_certificadora').notNull(),
  organizacaoId: integer('organizacao_id').references(() => organizations.id).notNull(),
  arquivoUrl: text('arquivo_url'),
  status: certificacaoStatusEnum('status').default('ativo'),
  dataEmissao: timestamp('data_emissao').notNull(),
  dataValidade: timestamp('data_validade'), // Pode ser null para certificações sem prazo
  visibilidade: documentoVisibilidadeEnum('visibilidade').default('publico'),
  criadoPor: integer('criado_por'),
  atualizadoPor: integer('atualizado_por'),
  criadoEm: timestamp('criado_em').defaultNow(),
  atualizadoEm: timestamp('atualizado_em').defaultNow()
});

/**
 * Schema para inserção de certificações
 */
export const insertCertificacaoSchema = createInsertSchema(certificacoesOrganizacao)
  .omit({ id: true, criadoEm: true, atualizadoEm: true });

/**
 * Tipos derivados dos schemas para certificações
 */
export type CertificacaoOrganizacao = typeof certificacoesOrganizacao.$inferSelect;
export type InsertCertificacaoOrganizacao = z.infer<typeof insertCertificacaoSchema>;

/**
 * Enums para tipos de membros
 */
export const membroTipoEnum = pgEnum('membro_tipo', [
  'diretoria',
  'efetivo',
  'contribuinte',
  'conselho', 
  'honorario'
]);

/**
 * Tabela de membros para transparência
 */
export const membrosTransparencia = pgTable('membros_transparencia', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull(),
  email: text('email'),
  tipo: membroTipoEnum('tipo').notNull(),
  cargo: text('cargo'),
  organizacaoId: integer('organizacao_id').references(() => organizations.id).notNull(),
  dataIngresso: timestamp('data_ingresso'),
  status: boolean('status').default(true), // ativo/inativo
  visibilidade: documentoVisibilidadeEnum('visibilidade').default('publico'),
  criadoPor: integer('criado_por'),
  atualizadoPor: integer('atualizado_por'),
  criadoEm: timestamp('criado_em').defaultNow(),
  atualizadoEm: timestamp('atualizado_em').defaultNow()
});

/**
 * Schema para inserção de membros
 */
export const insertMembroTransparenciaSchema = createInsertSchema(membrosTransparencia)
  .omit({ id: true, criadoEm: true, atualizadoEm: true });

/**
 * Tipos derivados dos schemas para membros
 */
export type MembroTransparencia = typeof membrosTransparencia.$inferSelect;
export type InsertMembroTransparencia = z.infer<typeof insertMembroTransparenciaSchema>;

/**
 * Tabela para relatórios financeiros públicos
 */
export const relatoriosFinanceirosPublicos = pgTable('relatorios_financeiros_publicos', {
  id: serial('id').primaryKey(),
  ano: integer('ano').notNull(),
  mes: integer('mes'),
  organizacaoId: integer('organizacao_id').references(() => organizations.id).notNull(),
  
  // Valores totais
  receitaTotal: integer('receita_total').notNull(),
  despesaTotal: integer('despesa_total').notNull(),
  saldo: integer('saldo').notNull(),
  
  // Dados detalhados em JSON (para flexibilidade)
  receitasPorCategoria: text('receitas_por_categoria'), // JSON
  despesasPorCategoria: text('despesas_por_categoria'), // JSON
  receitasMensais: text('receitas_mensais'), // JSON
  despesasMensais: text('despesas_mensais'), // JSON

  // Metadados
  visibilidade: documentoVisibilidadeEnum('visibilidade').default('publico'),
  publicado: boolean('publicado').default(false),
  criadoPor: integer('criado_por'),
  atualizadoPor: integer('atualizado_por'),
  criadoEm: timestamp('criado_em').defaultNow(),
  atualizadoEm: timestamp('atualizado_em').defaultNow()
});

/**
 * Schema para inserção de relatórios financeiros
 */
export const insertRelatorioFinanceiroPublicoSchema = createInsertSchema(relatoriosFinanceirosPublicos)
  .omit({ id: true, criadoEm: true, atualizadoEm: true });

/**
 * Tipos derivados dos schemas para relatórios financeiros
 */
export type RelatorioFinanceiroPublico = typeof relatoriosFinanceirosPublicos.$inferSelect;
export type InsertRelatorioFinanceiroPublico = z.infer<typeof insertRelatorioFinanceiroPublicoSchema>;