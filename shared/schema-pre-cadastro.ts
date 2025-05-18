import { pgTable, serial, varchar, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Schema da tabela de pré-cadastros
export const preCadastros = pgTable('pre_cadastros', {
  id: serial('id').primaryKey(),
  nome: varchar('nome', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  organizacao: varchar('organizacao', { length: 255 }).notNull(),
  tipo_organizacao: varchar('tipo_organizacao', { length: 100 }),
  telefone: varchar('telefone', { length: 50 }),
  cargo: varchar('cargo', { length: 100 }),
  interesse: text('interesse'),
  comentarios: text('comentarios'),
  modulos: jsonb('modulos').default([]), // Lista dos módulos de interesse
  aceita_termos: boolean('aceita_termos').default(false),
  status: varchar('status', { length: 50 }).default('novo'),
  observacoes: text('observacoes'),
  ip: varchar('ip', { length: 50 }),
  user_agent: text('user_agent'),
  created_at: timestamp('created_at').defaultNow(),
  contatado_em: timestamp('contatado_em'),
  convertido_em: timestamp('convertido_em'),
});

// Schema Zod para validação de inserção
export const insertPreCadastroSchema = createInsertSchema(preCadastros).omit({ 
  id: true,
  created_at: true,
  contatado_em: true,
  convertido_em: true
});

// Schema para atualização do status de pré-cadastro
export const updatePreCadastroStatusSchema = z.object({
  id: z.number(),
  status: z.enum(['novo', 'contatado', 'convertido', 'descartado']),
  observacoes: z.string().optional(),
});

// Tipos inferidos a partir dos schemas
export type PreCadastro = typeof preCadastros.$inferSelect;
export type InsertPreCadastro = z.infer<typeof insertPreCadastroSchema>;
export type UpdatePreCadastroStatus = z.infer<typeof updatePreCadastroStatusSchema>;