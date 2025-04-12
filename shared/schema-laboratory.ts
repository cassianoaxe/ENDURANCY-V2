import { relations } from "drizzle-orm";
import { boolean, decimal, integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { organizations, users } from "./schema";

// Enums para o Portal de Laboratório
export const testStatusEnum = pgEnum("test_status", [
  "pending", // Pendente - Amostra enviada, aguardando recebimento
  "received", // Recebida - Amostra recebida pelo laboratório
  "in_progress", // Em andamento - Análise em andamento
  "completed", // Completada - Análise finalizada
  "approved", // Aprovada - Resultados aprovados pelo controle de qualidade
  "rejected", // Rejeitada - Amostra rejeitada por problema de qualidade
  "canceled", // Cancelada - Teste cancelado
]);

export const testTypeEnum = pgEnum("test_type", [
  "cannabinoid_profile", // Perfil de canabinoides (teor)
  "terpene_profile", // Perfil de terpenos
  "heavy_metals", // Metais pesados
  "pesticides", // Pesticidas
  "microbials", // Microbiológicos
  "residual_solvents", // Solventes residuais
  "mycotoxins", // Micotoxinas
  "water_activity", // Atividade da água
  "moisture_content", // Teor de umidade
  "physical_visual", // Inspeção física/visual
  "stability", // Teste de estabilidade
  "full_panel", // Painel completo (todos os testes)
]);

export const sampleTypeEnum = pgEnum("sample_type", [
  "flower", // Flor
  "concentrate", // Concentrado
  "extract", // Extrato
  "edible", // Comestível
  "topical", // Tópico
  "tincture", // Tintura
  "oil", // Óleo
  "raw_material", // Matéria-prima
  "in_process", // Em processo de produção
  "finished_product", // Produto finalizado
  "other", // Outro
]);

// Tabelas para o Portal de Laboratório

// Tabela de Laboratórios
export const laboratoriesTable = pgTable("laboratories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 20 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  email: varchar("email", { length: 255 }).notNull(),
  website: varchar("website", { length: 255 }),
  licenseNumber: varchar("license_number", { length: 100 }),
  licenseExpiryDate: timestamp("license_expiry_date"),
  logoUrl: varchar("logo_url", { length: 500 }),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  organizationId: integer("organization_id").references(() => organizations.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de Técnicos de Laboratório
export const laboratoryTechniciansTable = pgTable("laboratory_technicians", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  laboratoryId: integer("laboratory_id").references(() => laboratoriesTable.id).notNull(),
  role: varchar("role", { length: 100 }), // Cargo ou função (e.g., "Técnico Químico", "Diretor Técnico")
  specialization: varchar("specialization", { length: 200 }), // Especialização (e.g., "Cromatografia", "Microbiologia")
  licenseNumber: varchar("license_number", { length: 100 }), // Número de licença profissional
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de Amostras
export const samplesTable = pgTable("samples", {
  id: serial("id").primaryKey(),
  trackingNumber: varchar("tracking_number", { length: 100 }).notNull().unique(), // Número de rastreio único
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  laboratoryId: integer("laboratory_id").references(() => laboratoriesTable.id).notNull(),
  productName: varchar("product_name", { length: 255 }),
  batchNumber: varchar("batch_number", { length: 100 }),
  productionDate: timestamp("production_date"),
  expirationDate: timestamp("expiration_date"),
  sampleType: sampleTypeEnum("sample_type").notNull(),
  sampleSize: varchar("sample_size", { length: 50 }), // Tamanho ou quantidade da amostra
  sampleUnit: varchar("sample_unit", { length: 20 }), // Unidade (g, ml, etc)
  requestedTests: text("requested_tests").array(), // Array de tipos de testes solicitados
  notes: text("notes"),
  receivedBy: integer("received_by").references(() => users.id),
  receivedAt: timestamp("received_at"),
  status: testStatusEnum("status").default("pending"),
  priority: boolean("priority").default(false), // Amostras prioritárias
  imageUrl: varchar("image_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de Testes
export const testsTable = pgTable("tests", {
  id: serial("id").primaryKey(),
  sampleId: integer("sample_id").references(() => samplesTable.id).notNull(),
  testType: testTypeEnum("test_type").notNull(),
  assignedTo: integer("assigned_to").references(() => users.id),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  status: testStatusEnum("status").default("pending"),
  method: varchar("method", { length: 255 }), // Método analítico utilizado
  equipment: varchar("equipment", { length: 255 }), // Equipamento utilizado
  results: text("results"), // Resultados em formato JSON
  reportUrl: varchar("report_url", { length: 500 }), // URL do relatório gerado
  notes: text("notes"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de Resultados de Canabinoides
export const cannabinoidResultsTable = pgTable("cannabinoid_results", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").references(() => testsTable.id).notNull(),
  thc: decimal("thc", { precision: 10, scale: 4 }),
  thca: decimal("thca", { precision: 10, scale: 4 }),
  cbd: decimal("cbd", { precision: 10, scale: 4 }),
  cbda: decimal("cbda", { precision: 10, scale: 4 }),
  cbn: decimal("cbn", { precision: 10, scale: 4 }),
  cbg: decimal("cbg", { precision: 10, scale: 4 }),
  cbga: decimal("cbga", { precision: 10, scale: 4 }),
  thcv: decimal("thcv", { precision: 10, scale: 4 }),
  cbdv: decimal("cbdv", { precision: 10, scale: 4 }),
  cbc: decimal("cbc", { precision: 10, scale: 4 }),
  totalTHC: decimal("total_thc", { precision: 10, scale: 4 }),
  totalCBD: decimal("total_cbd", { precision: 10, scale: 4 }),
  totalCannabinoids: decimal("total_cannabinoids", { precision: 10, scale: 4 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de Resultados de Terpenos
export const terpeneResultsTable = pgTable("terpene_results", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").references(() => testsTable.id).notNull(),
  alphaPinene: decimal("alpha_pinene", { precision: 10, scale: 4 }),
  betaPinene: decimal("beta_pinene", { precision: 10, scale: 4 }),
  myrcene: decimal("myrcene", { precision: 10, scale: 4 }),
  limonene: decimal("limonene", { precision: 10, scale: 4 }),
  caryophyllene: decimal("caryophyllene", { precision: 10, scale: 4 }),
  humulene: decimal("humulene", { precision: 10, scale: 4 }),
  linalool: decimal("linalool", { precision: 10, scale: 4 }),
  terpinolene: decimal("terpinolene", { precision: 10, scale: 4 }),
  bisabolol: decimal("bisabolol", { precision: 10, scale: 4 }),
  ocimene: decimal("ocimene", { precision: 10, scale: 4 }),
  terpineol: decimal("terpineol", { precision: 10, scale: 4 }),
  otherTerpenes: text("other_terpenes"), // Outros terpenos em formato JSON
  totalTerpenes: decimal("total_terpenes", { precision: 10, scale: 4 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de Resultados de Metais Pesados
export const heavyMetalsResultsTable = pgTable("heavy_metals_results", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").references(() => testsTable.id).notNull(),
  arsenic: decimal("arsenic", { precision: 10, scale: 4 }),
  cadmium: decimal("cadmium", { precision: 10, scale: 4 }),
  lead: decimal("lead", { precision: 10, scale: 4 }),
  mercury: decimal("mercury", { precision: 10, scale: 4 }),
  chromium: decimal("chromium", { precision: 10, scale: 4 }),
  nickel: decimal("nickel", { precision: 10, scale: 4 }),
  copper: decimal("copper", { precision: 10, scale: 4 }),
  antimony: decimal("antimony", { precision: 10, scale: 4 }),
  zinc: decimal("zinc", { precision: 10, scale: 4 }),
  cobalt: decimal("cobalt", { precision: 10, scale: 4 }),
  otherMetals: text("other_metals"), // Outros metais em formato JSON
  status: varchar("status", { length: 50 }).default("pass"), // pass, fail
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela para registro de changelog/auditoria do laboratório
export const laboratoryAuditLogsTable = pgTable("laboratory_audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  laboratoryId: integer("laboratory_id").references(() => laboratoriesTable.id),
  sampleId: integer("sample_id").references(() => samplesTable.id),
  testId: integer("test_id").references(() => testsTable.id),
  action: varchar("action", { length: 100 }).notNull(), // create, update, delete, status_change
  details: text("details"),
  previousValue: text("previous_value"),
  newValue: text("new_value"),
  performedAt: timestamp("performed_at").defaultNow(),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: varchar("user_agent", { length: 255 }),
});

// Relacionamentos

export const laboratoriesRelations = relations(laboratoriesTable, ({ many }) => ({
  technicians: many(laboratoryTechniciansTable),
  samples: many(samplesTable),
}));

export const laboratoryTechniciansRelations = relations(laboratoryTechniciansTable, ({ one }) => ({
  laboratory: one(laboratoriesTable, {
    fields: [laboratoryTechniciansTable.laboratoryId],
    references: [laboratoriesTable.id],
  }),
  user: one(users, {
    fields: [laboratoryTechniciansTable.userId],
    references: [users.id],
  }),
}));

export const samplesRelations = relations(samplesTable, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [samplesTable.organizationId],
    references: [organizations.id],
  }),
  laboratory: one(laboratoriesTable, {
    fields: [samplesTable.laboratoryId],
    references: [laboratoriesTable.id],
  }),
  tests: many(testsTable),
  receivedByUser: one(users, {
    fields: [samplesTable.receivedBy],
    references: [users.id],
  }),
}));

export const testsRelations = relations(testsTable, ({ one, many }) => ({
  sample: one(samplesTable, {
    fields: [testsTable.sampleId],
    references: [samplesTable.id],
  }),
  assignedToUser: one(users, {
    fields: [testsTable.assignedTo],
    references: [users.id],
  }),
  reviewedByUser: one(users, {
    fields: [testsTable.reviewedBy],
    references: [users.id],
  }),
  cannabinoidResults: many(cannabinoidResultsTable),
  terpeneResults: many(terpeneResultsTable),
  heavyMetalsResults: many(heavyMetalsResultsTable),
}));

export const cannabinoidResultsRelations = relations(cannabinoidResultsTable, ({ one }) => ({
  test: one(testsTable, {
    fields: [cannabinoidResultsTable.testId],
    references: [testsTable.id],
  }),
}));

export const terpeneResultsRelations = relations(terpeneResultsTable, ({ one }) => ({
  test: one(testsTable, {
    fields: [terpeneResultsTable.testId],
    references: [testsTable.id],
  }),
}));

export const heavyMetalsResultsRelations = relations(heavyMetalsResultsTable, ({ one }) => ({
  test: one(testsTable, {
    fields: [heavyMetalsResultsTable.testId],
    references: [testsTable.id],
  }),
}));

// Schemas Zod para inserção

export const insertLaboratorySchema = createInsertSchema(laboratoriesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLaboratoryTechnicianSchema = createInsertSchema(laboratoryTechniciansTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSampleSchema = createInsertSchema(samplesTable).omit({
  id: true,
  receivedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTestSchema = createInsertSchema(testsTable).omit({
  id: true,
  startedAt: true,
  completedAt: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCannabinoidResultsSchema = createInsertSchema(cannabinoidResultsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTerpeneResultsSchema = createInsertSchema(terpeneResultsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHeavyMetalsResultsSchema = createInsertSchema(heavyMetalsResultsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLaboratoryAuditLogSchema = createInsertSchema(laboratoryAuditLogsTable).omit({
  id: true,
  performedAt: true,
});

// Tipos para exportação

export type Laboratory = typeof laboratoriesTable.$inferSelect;
export type InsertLaboratory = z.infer<typeof insertLaboratorySchema>;

export type LaboratoryTechnician = typeof laboratoryTechniciansTable.$inferSelect;
export type InsertLaboratoryTechnician = z.infer<typeof insertLaboratoryTechnicianSchema>;

export type Sample = typeof samplesTable.$inferSelect;
export type InsertSample = z.infer<typeof insertSampleSchema>;

export type Test = typeof testsTable.$inferSelect;
export type InsertTest = z.infer<typeof insertTestSchema>;

export type CannabinoidResults = typeof cannabinoidResultsTable.$inferSelect;
export type InsertCannabinoidResults = z.infer<typeof insertCannabinoidResultsSchema>;

export type TerpeneResults = typeof terpeneResultsTable.$inferSelect;
export type InsertTerpeneResults = z.infer<typeof insertTerpeneResultsSchema>;

export type HeavyMetalsResults = typeof heavyMetalsResultsTable.$inferSelect;
export type InsertHeavyMetalsResults = z.infer<typeof insertHeavyMetalsResultsSchema>;

export type LaboratoryAuditLog = typeof laboratoryAuditLogsTable.$inferSelect;
export type InsertLaboratoryAuditLog = z.infer<typeof insertLaboratoryAuditLogSchema>;

// Exportar todo o schema para importação em db.ts
export const laboratorySchema = {
  laboratoriesTable,
  laboratoryTechniciansTable,
  samplesTable,
  testsTable,
  cannabinoidResultsTable,
  terpeneResultsTable,
  heavyMetalsResultsTable,
  laboratoryAuditLogsTable,
  // Relações
  laboratoriesRelations,
  laboratoryTechniciansRelations,
  samplesRelations,
  testsRelations,
  cannabinoidResultsRelations,
  terpeneResultsRelations,
  heavyMetalsResultsRelations,
};