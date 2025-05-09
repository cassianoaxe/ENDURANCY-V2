import { pgTable, serial, text, timestamp, integer, boolean, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema";

// Enums específicos para o Portal de Laboratório
export const equipmentStatusEnum = pgEnum("equipment_status", [
  "operational",
  "maintenance",
  "calibration", 
  "out_of_service",
  "validation"
]);

export const sampleTypeEnum = pgEnum("sample_type", [
  "blood",
  "urine",
  "tissue",
  "saliva",
  "swab",
  "plant",
  "extract",
  "oil",
  "consumable",
  "other"
]);

export const sampleStatusEnum = pgEnum("sample_status", [
  "registered",
  "collected",
  "received",
  "in_progress",
  "pending_approval",
  "completed",
  "rejected",
  "archived"
]);

export const testTypeEnum = pgEnum("test_type", [
  "chemical_profile",
  "microbial",
  "pesticides",
  "heavy_metals",
  "terpenes",
  "cannabinoid_profile",
  "residual_solvents",
  "potency",
  "stability",
  "custom"
]);

export const testStatusEnum = pgEnum("test_status", [
  "pending",
  "in_progress",
  "review",
  "approved",
  "rejected",
  "canceled"
]);

// Tabela de laboratórios
export const laboratories = pgTable("laboratories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").references(() => users.id),
  licenseNumber: text("license_number"),
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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Relações para laboratórios
export const laboratoriesRelations = relations(laboratories, ({ one, many }) => ({
  user: one(users, {
    fields: [laboratories.userId],
    references: [users.id]
  }),
  equipments: many(labEquipments),
  samples: many(samples)
}));

// Tabela de equipamentos de laboratório
export const labEquipments = pgTable("lab_equipments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  laboratoryId: integer("laboratory_id").references(() => laboratories.id),
  model: text("model"),
  serialNumber: text("serial_number"),
  manufacturer: text("manufacturer"),
  acquisitionDate: timestamp("acquisition_date", { mode: 'date' }),
  installationDate: timestamp("installation_date", { mode: 'date' }),
  status: equipmentStatusEnum("status").default("operational"),
  location: text("location"),
  description: text("description"),
  maintenanceFrequency: integer("maintenance_frequency"), // em dias
  calibrationFrequency: integer("calibration_frequency"), // em dias
  validationFrequency: integer("validation_frequency"), // em dias
  lastMaintenanceDate: timestamp("last_maintenance_date", { mode: 'date' }),
  nextMaintenanceDate: timestamp("next_maintenance_date", { mode: 'date' }),
  lastCalibrationDate: timestamp("last_calibration_date", { mode: 'date' }),
  nextCalibrationDate: timestamp("next_calibration_date", { mode: 'date' }),
  lastValidationDate: timestamp("last_validation_date", { mode: 'date' }),
  nextValidationDate: timestamp("next_validation_date", { mode: 'date' }),
  responsibleUserId: integer("responsible_user_id").references(() => users.id),
  documents: text("documents").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Relações para equipamentos
export const labEquipmentsRelations = relations(labEquipments, ({ one }) => ({
  laboratory: one(laboratories, {
    fields: [labEquipments.laboratoryId],
    references: [laboratories.id]
  }),
  responsibleUser: one(users, {
    fields: [labEquipments.responsibleUserId],
    references: [users.id]
  })
}));

// Tabela de amostras
export const samples = pgTable("samples", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  organizationId: integer("organization_id"),
  laboratoryId: integer("laboratory_id").references(() => laboratories.id),
  sampleType: sampleTypeEnum("sample_type").notNull(),
  status: sampleStatusEnum("status").default("registered"),
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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Relações para amostras
export const samplesRelations = relations(samples, ({ one, many }) => ({
  laboratory: one(laboratories, {
    fields: [samples.laboratoryId],
    references: [laboratories.id]
  }),
  creator: one(users, {
    fields: [samples.createdBy],
    references: [users.id]
  }),
  tests: many(tests)
}));

// Tabela de testes
export const tests = pgTable("tests", {
  id: serial("id").primaryKey(),
  sampleId: integer("sample_id").references(() => samples.id),
  laboratoryId: integer("laboratory_id").references(() => laboratories.id),
  testType: testTypeEnum("test_type").notNull(),
  status: testStatusEnum("status").default("pending"),
  resultDate: timestamp("result_date"),
  resultData: jsonb("result_data"),
  technicianId: integer("technician_id").references(() => users.id),
  approvedBy: integer("approved_by").references(() => users.id),
  approvalDate: timestamp("approval_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Tabela de resultados de canabinoides
export const cannabinoidResults = pgTable("cannabinoid_results", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").references(() => tests.id),
  thc: text("thc"),
  cbd: text("cbd"),
  cbn: text("cbn"),
  cbg: text("cbg"),
  thca: text("thca"),
  cbda: text("cbda"),
  cbga: text("cbga"),
  thcv: text("thcv"),
  cbdv: text("cbdv"),
  cbc: text("cbc"),
  totalCannabinoids: text("total_cannabinoids"),
  otherCannabinoids: jsonb("other_cannabinoids"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Relações para resultados de canabinoides
export const cannabinoidResultsRelations = relations(cannabinoidResults, ({ one }) => ({
  test: one(tests, {
    fields: [cannabinoidResults.testId],
    references: [tests.id]
  })
}));

// Tabela de resultados de terpenos
export const terpeneResults = pgTable("terpene_results", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").references(() => tests.id),
  myrcene: text("myrcene"),
  limonene: text("limonene"),
  pinene: text("pinene"),
  linalool: text("linalool"),
  caryophyllene: text("caryophyllene"),
  humulene: text("humulene"),
  terpinolene: text("terpinolene"),
  ocimene: text("ocimene"),
  terpineol: text("terpineol"),
  totalTerpenes: text("total_terpenes"),
  otherTerpenes: jsonb("other_terpenes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Relações para resultados de terpenos
export const terpeneResultsRelations = relations(terpeneResults, ({ one }) => ({
  test: one(tests, {
    fields: [terpeneResults.testId],
    references: [tests.id]
  })
}));

// Relações para testes
export const testsRelations = relations(tests, ({ one, many }) => ({
  sample: one(samples, {
    fields: [tests.sampleId],
    references: [samples.id]
  }),
  laboratory: one(laboratories, {
    fields: [tests.laboratoryId],
    references: [laboratories.id]
  }),
  technician: one(users, {
    fields: [tests.technicianId],
    references: [users.id]
  }),
  approver: one(users, {
    fields: [tests.approvedBy],
    references: [users.id]
  }),
  cannabinoidResult: one(cannabinoidResults, {
    fields: [tests.id],
    references: [cannabinoidResults.testId]
  }),
  terpeneResult: one(terpeneResults, {
    fields: [tests.id],
    references: [terpeneResults.testId]
  })
}));

// Clientes do laboratório 
export const laboratoryClients = pgTable("laboratory_clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  laboratoryId: integer("laboratory_id").references(() => laboratories.id),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Relações para clientes do laboratório
export const laboratoryClientsRelations = relations(laboratoryClients, ({ one }) => ({
  laboratory: one(laboratories, {
    fields: [laboratoryClients.laboratoryId],
    references: [laboratories.id]
  })
}));

// Esquemas Zod para inserção
export const insertLaboratorySchema = createInsertSchema(laboratories).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertLabEquipmentSchema = createInsertSchema(labEquipments).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertSampleSchema = createInsertSchema(samples).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertTestSchema = createInsertSchema(tests).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertLaboratoryClientSchema = createInsertSchema(laboratoryClients).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertCannabinoidResultSchema = createInsertSchema(cannabinoidResults).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertTerpeneResultSchema = createInsertSchema(terpeneResults).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Tipos para inserção
export type InsertLaboratory = z.infer<typeof insertLaboratorySchema>;
export type InsertLabEquipment = z.infer<typeof insertLabEquipmentSchema>;
export type InsertSample = z.infer<typeof insertSampleSchema>;
export type InsertTest = z.infer<typeof insertTestSchema>;
export type InsertLaboratoryClient = z.infer<typeof insertLaboratoryClientSchema>;
export type InsertCannabinoidResult = z.infer<typeof insertCannabinoidResultSchema>;
export type InsertTerpeneResult = z.infer<typeof insertTerpeneResultSchema>;

// Tipos para seleção
export type Laboratory = typeof laboratories.$inferSelect;
export type LabEquipment = typeof labEquipments.$inferSelect;
export type Sample = typeof samples.$inferSelect;
export type Test = typeof tests.$inferSelect;
export type LaboratoryClient = typeof laboratoryClients.$inferSelect;
export type CannabinoidResult = typeof cannabinoidResults.$inferSelect;
export type TerpeneResult = typeof terpeneResults.$inferSelect;
