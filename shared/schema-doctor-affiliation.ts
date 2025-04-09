import { relations } from 'drizzle-orm';
import { pgTable, serial, integer, timestamp, varchar, text, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Tabela que relaciona médicos a organizações (muitos para muitos)
export const doctorOrganizationsTable = pgTable('doctor_organizations', {
  id: serial('id').primaryKey(),
  doctorId: integer('doctor_id').notNull().references(() => usersTable.id), 
  organizationId: integer('organization_id').notNull().references(() => organizationsTable.id),
  status: varchar('status', { length: 20 }).notNull().default('active'), // active, inactive, pending
  isDefault: boolean('is_default').default(false), // Organização padrão do médico
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Tabela para prescrições médicas
export const prescriptionsTable = pgTable('prescriptions', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').notNull().references(() => patientsTable.id),
  doctorId: integer('doctor_id').notNull().references(() => usersTable.id),
  organizationId: integer('organization_id').notNull().references(() => organizationsTable.id),
  productId: integer('product_id').references(() => productsTable.id),
  dosage: varchar('dosage', { length: 100 }),
  instructions: text('instructions'),
  duration: varchar('duration', { length: 100 }),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, approved, rejected
  approvedById: integer('approved_by_id').references(() => usersTable.id), // ID do farmacêutico
  notes: text('notes'),
  approvalDate: timestamp('approval_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Referências às tabelas existentes para as relações
// (Estas são simplificadas - você deve usar suas tabelas reais)
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  // outros campos necessários
});

export const organizationsTable = pgTable('organizations', {
  id: serial('id').primaryKey(),
  // outros campos necessários
});

export const patientsTable = pgTable('patients', {
  id: serial('id').primaryKey(),
  // outros campos necessários
});

export const productsTable = pgTable('products', {
  id: serial('id').primaryKey(),
  // outros campos necessários
});

// Definir as relações
export const doctorOrganizationsRelations = relations(doctorOrganizationsTable, ({ one }) => ({
  doctor: one(usersTable, {
    fields: [doctorOrganizationsTable.doctorId],
    references: [usersTable.id],
  }),
  organization: one(organizationsTable, {
    fields: [doctorOrganizationsTable.organizationId],
    references: [organizationsTable.id],
  }),
}));

export const prescriptionsRelations = relations(prescriptionsTable, ({ one }) => ({
  patient: one(patientsTable, {
    fields: [prescriptionsTable.patientId],
    references: [patientsTable.id],
  }),
  doctor: one(usersTable, {
    fields: [prescriptionsTable.doctorId],
    references: [usersTable.id],
  }),
  organization: one(organizationsTable, {
    fields: [prescriptionsTable.organizationId],
    references: [organizationsTable.id],
  }),
  product: one(productsTable, {
    fields: [prescriptionsTable.productId],
    references: [productsTable.id],
  }),
  approvedBy: one(usersTable, {
    fields: [prescriptionsTable.approvedById],
    references: [usersTable.id],
  }),
}));

// Schemas para criação/validação
export const insertDoctorOrganizationSchema = createInsertSchema(doctorOrganizationsTable).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true 
});

export const insertPrescriptionSchema = createInsertSchema(prescriptionsTable).omit({ 
  id: true, 
  status: true,
  approvedById: true,
  approvalDate: true,
  createdAt: true,
  updatedAt: true 
});

// Tipos de inserção
export type InsertDoctorOrganization = z.infer<typeof insertDoctorOrganizationSchema>;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;

// Tipos de seleção
export type DoctorOrganization = typeof doctorOrganizationsTable.$inferSelect;
export type Prescription = typeof prescriptionsTable.$inferSelect;