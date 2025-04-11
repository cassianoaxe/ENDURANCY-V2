import { pgTable, text, timestamp, integer, serial, boolean, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Tabela principal para afiliações entre médicos e organizações
export const doctorOrganizationsTable = pgTable('doctor_organizations', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull(),
  doctorId: integer('doctor_id'),  // null se o convite não foi aceito ainda
  name: text('name'),              // nome do médico convidado
  email: text('email').notNull(),  // email do médico convidado
  specialty: text('specialty'),    // especialidade do médico
  crm: text('crm'),                // número do CRM
  crmState: text('crm_state'),     // estado do CRM
  status: text('status').notNull().default('pending'), // pending, active, denied, expired, cancelled, left, removed
  inviteToken: text('invite_token'), // token para confirmar o convite
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at'), // data em que o convite expira
  respondedAt: timestamp('responded_at'), // data em que o convite foi respondido
  updatedAt: timestamp('updated_at'),
  isDefault: boolean('is_default').default(false), // indica se esta é a organização padrão do médico
});

// Tabela de prescrições médicas
export const prescriptionsTable = pgTable('prescriptions', {
  id: serial('id').primaryKey(),
  doctorId: integer('doctor_id').notNull(),
  patientId: integer('patient_id').notNull(),
  organizationId: integer('organization_id').notNull(),
  content: text('content').notNull(),
  status: text('status').notNull().default('pending'), // pending, approved, rejected, cancelled
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
  expireAt: timestamp('expire_at'),
  approvedById: integer('approved_by_id'),
  approvedAt: timestamp('approved_at'),
  notes: text('notes'),
  documentUrl: text('document_url'),
});

// Referência para outras tabelas do esquema original para manter relações
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  // outros campos conforme o esquema original
});

export const organizationsTable = pgTable('organizations', {
  id: serial('id').primaryKey(),
  // outros campos conforme o esquema original
});

export const patientsTable = pgTable('patients', {
  id: serial('id').primaryKey(),
  // outros campos conforme o esquema original
});

export const productsTable = pgTable('products', {
  id: serial('id').primaryKey(),
  // outros campos conforme o esquema original
});

// Definição de relações entre as tabelas
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
  doctor: one(usersTable, {
    fields: [prescriptionsTable.doctorId],
    references: [usersTable.id],
  }),
  patient: one(patientsTable, {
    fields: [prescriptionsTable.patientId],
    references: [patientsTable.id],
  }),
  organization: one(organizationsTable, {
    fields: [prescriptionsTable.organizationId],
    references: [organizationsTable.id],
  }),
  approvedBy: one(usersTable, {
    fields: [prescriptionsTable.approvedById],
    references: [usersTable.id],
  }),
}));

// Esquemas Zod para validação
export const insertDoctorOrganizationSchema = createInsertSchema(doctorOrganizationsTable).omit({ 
  id: true, 
  createdAt: true,
  respondedAt: true,
  updatedAt: true
});

export const insertPrescriptionSchema = createInsertSchema(prescriptionsTable).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true,
  approvedAt: true
});

// Tipos exportados para uso em outras partes da aplicação
export type InsertDoctorOrganization = z.infer<typeof insertDoctorOrganizationSchema>;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;

export type DoctorOrganization = typeof doctorOrganizationsTable.$inferSelect;
export type Prescription = typeof prescriptionsTable.$inferSelect;