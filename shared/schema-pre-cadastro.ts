import { pgTable, text, serial, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tabela para armazenar pré-cadastros do sistema Endurancy
export const preCadastros = pgTable("pre_cadastros", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  email: text("email").notNull(),
  telefone: text("telefone"),
  organizacao: text("organizacao").notNull(),
  cargo: text("cargo"),
  tipoOrganizacao: text("tipo_organizacao").notNull(),
  comentarios: text("comentarios"),
  interesse: text("interesse").notNull(),
  modulos: json("modulos").notNull(),
  aceitaTermos: boolean("aceita_termos").notNull().default(true),
  status: text("status").notNull().default("novo"), // novo, contatado, convertido, descartado
  contatadoEm: timestamp("contatado_em"),
  convertidoEm: timestamp("convertido_em"),
  organizacaoId: serial("organizacao_id"), // Se convertido em organização
  observacoes: text("observacoes"),
  ip: text("ip"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schema para inserção de pré-cadastros
export const insertPreCadastroSchema = createInsertSchema(preCadastros, {
  modulos: z.any(),
}).omit({ 
  id: true, 
  status: true, 
  contatadoEm: true, 
  convertidoEm: true, 
  organizacaoId: true, 
  observacoes: true,
  ip: true,
  userAgent: true,
  createdAt: true,
  updatedAt: true
});

// Tipos para uso no código
export type PreCadastro = typeof preCadastros.$inferSelect;
export type InsertPreCadastro = z.infer<typeof insertPreCadastroSchema>;