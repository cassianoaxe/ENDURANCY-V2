import { pgTable, text, serial, timestamp, decimal, integer, boolean, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema";

// Enum para status de amostras
export const sampleStatusEnum = pgEnum('sample_status', ['pending', 'received', 'in_progress', 'completed', 'approved', 'rejected', 'canceled']);

// Enum para tipos de amostras
export const sampleTypeEnum = pgEnum('sample_type', ['flower', 'concentrate', 'extract', 'edible', 'topical', 'tincture', 'oil', 'raw_material', 'in_process', 'finished_product', 'other']);

// Enum para tipos de testes
export const testTypeEnum = pgEnum('test_type', [
  'cannabinoid_profile', 
  'terpene_profile', 
  'heavy_metals', 
  'pesticides', 
  'microbials', 
  'residual_solvents', 
  'mycotoxins', 
  'water_activity', 
  'moisture_content', 
  'foreign_matter', 
  'visual_inspection',
  'full_panel'
]);

// Tabela de laboratórios
export const laboratories = pgTable("laboratories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  licenseNumber: text("license_number").notNull(),
  licenseExpiryDate: timestamp("license_expiry_date"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  contactPerson: text("contact_person"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de amostras
export const samples = pgTable("samples", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  organizationId: integer("organization_id").notNull(),
  laboratoryId: integer("laboratory_id").notNull().references(() => laboratories.id),
  sampleType: sampleTypeEnum("sample_type").notNull(),
  status: sampleStatusEnum("status").notNull().default("pending"),
  batchNumber: text("batch_number"),
  collectionDate: timestamp("collection_date"),
  receivedDate: timestamp("received_date"),
  completedDate: timestamp("completed_date"),
  notes: text("notes"),
  amount: text("amount"),
  unit: text("unit"),
  trackingNumber: text("tracking_number"),
  sampleDescription: text("sample_description"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de testes
export const tests = pgTable("tests", {
  id: serial("id").primaryKey(),
  sampleId: integer("sample_id").notNull().references(() => samples.id),
  laboratoryId: integer("laboratory_id").notNull().references(() => laboratories.id),
  testType: testTypeEnum("test_type").notNull(),
  status: sampleStatusEnum("status").notNull().default("pending"),
  resultDate: timestamp("result_date"),
  resultData: jsonb("result_data"),
  technicianId: integer("technician_id").references(() => users.id),
  approvedBy: integer("approved_by").references(() => users.id),
  approvalDate: timestamp("approval_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de resultados de cannabinóides
export const cannabinoidResults = pgTable("cannabinoid_results", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").notNull().references(() => tests.id),
  thc: decimal("thc", { precision: 10, scale: 4 }),
  thca: decimal("thca", { precision: 10, scale: 4 }),
  d9Thc: decimal("d9_thc", { precision: 10, scale: 4 }),
  d8Thc: decimal("d8_thc", { precision: 10, scale: 4 }),
  thcv: decimal("thcv", { precision: 10, scale: 4 }),
  cbd: decimal("cbd", { precision: 10, scale: 4 }),
  cbda: decimal("cbda", { precision: 10, scale: 4 }),
  cbg: decimal("cbg", { precision: 10, scale: 4 }),
  cbga: decimal("cbga", { precision: 10, scale: 4 }),
  cbn: decimal("cbn", { precision: 10, scale: 4 }),
  cbc: decimal("cbc", { precision: 10, scale: 4 }),
  totalCannabinoids: decimal("total_cannabinoids", { precision: 10, scale: 4 }),
  totalThc: decimal("total_thc", { precision: 10, scale: 4 }),
  totalCbd: decimal("total_cbd", { precision: 10, scale: 4 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de resultados de terpenos
export const terpeneResults = pgTable("terpene_results", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").notNull().references(() => tests.id),
  resultData: jsonb("result_data"),
  totalTerpenes: decimal("total_terpenes", { precision: 10, scale: 4 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schemas para inserção
export const insertLaboratorySchema = createInsertSchema(laboratories).pick({
  name: true,
  userId: true,
  licenseNumber: true,
  licenseExpiryDate: true,
  address: true,
  city: true,
  state: true,
  postalCode: true,
  phone: true,
  email: true,
  website: true,
  contactPerson: true,
  contactPhone: true,
  contactEmail: true,
  status: true,
});

export const insertSampleSchema = createInsertSchema(samples).pick({
  code: true,
  organizationId: true,
  laboratoryId: true,
  sampleType: true,
  status: true,
  batchNumber: true,
  collectionDate: true,
  receivedDate: true,
  completedDate: true,
  notes: true,
  amount: true,
  unit: true,
  trackingNumber: true,
  sampleDescription: true,
  createdBy: true,
});

export const insertTestSchema = createInsertSchema(tests).pick({
  sampleId: true,
  laboratoryId: true,
  testType: true,
  status: true,
  resultDate: true,
  resultData: true,
  technicianId: true,
  approvedBy: true,
  approvalDate: true,
  notes: true,
});

export const insertCannabinoidResultSchema = createInsertSchema(cannabinoidResults).pick({
  testId: true,
  thc: true,
  thca: true,
  d9Thc: true,
  d8Thc: true,
  thcv: true,
  cbd: true,
  cbda: true,
  cbg: true,
  cbga: true,
  cbn: true,
  cbc: true,
  totalCannabinoids: true,
  totalThc: true,
  totalCbd: true,
});

export const insertTerpeneResultSchema = createInsertSchema(terpeneResults).pick({
  testId: true,
  resultData: true,
  totalTerpenes: true,
});

// Types
export type Laboratory = typeof laboratories.$inferSelect;
export type InsertLaboratory = z.infer<typeof insertLaboratorySchema>;

export type Sample = typeof samples.$inferSelect;
export type InsertSample = z.infer<typeof insertSampleSchema>;

export type Test = typeof tests.$inferSelect;
export type InsertTest = z.infer<typeof insertTestSchema>;

export type CannabinoidResult = typeof cannabinoidResults.$inferSelect;
export type InsertCannabinoidResult = z.infer<typeof insertCannabinoidResultSchema>;

export type TerpeneResult = typeof terpeneResults.$inferSelect;
export type InsertTerpeneResult = z.infer<typeof insertTerpeneResultSchema>;