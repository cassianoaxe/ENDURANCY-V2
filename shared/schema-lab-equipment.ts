import { relations } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, date, integer, pgEnum, boolean, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enum para status de equipamentos
export const equipmentStatusEnum = pgEnum('equipment_status', [
  'operational',      // Operacional
  'maintenance',      // Em manutenção
  'calibration',      // Em calibração
  'out_of_service',   // Fora de serviço
  'validation',       // Em validação
  'retired'           // Aposentado/Descontinuado
]);

// Tabela principal de equipamentos
export const labEquipments = pgTable('lab_equipments', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  laboratoryId: integer('laboratory_id').notNull(),
  model: text('model').notNull(),
  serialNumber: text('serial_number').notNull(),
  manufacturer: text('manufacturer').notNull(),
  acquisitionDate: date('acquisition_date'),
  installationDate: date('installation_date'),
  status: equipmentStatusEnum('status').default('operational'),
  location: text('location'),
  description: text('description'),
  maintenanceFrequency: integer('maintenance_frequency'), // Em dias
  calibrationFrequency: integer('calibration_frequency'), // Em dias
  validationFrequency: integer('validation_frequency'), // Em dias
  lastMaintenanceDate: date('last_maintenance_date'),
  nextMaintenanceDate: date('next_maintenance_date'),
  lastCalibrationDate: date('last_calibration_date'),
  nextCalibrationDate: date('next_calibration_date'),
  lastValidationDate: date('last_validation_date'),
  nextValidationDate: date('next_validation_date'),
  responsibleUserId: integer('responsible_user_id'),
  documents: text('documents').array(), // URLs para documentos
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Enum para tipos de manutenção
export const maintenanceTypeEnum = pgEnum('maintenance_type', [
  'preventive',       // Manutenção preventiva
  'corrective',       // Manutenção corretiva
  'calibration',      // Calibração
  'validation',       // Validação/Qualificação
  'verification',     // Verificação
  'installation',     // Instalação
  'upgrade',          // Atualização
  'other'             // Outro
]);

// Enum para status de manutenção
export const maintenanceStatusEnum = pgEnum('maintenance_status', [
  'scheduled',        // Agendada
  'in_progress',      // Em andamento
  'completed',        // Concluída
  'canceled',         // Cancelada
  'delayed'           // Atrasada
]);

// Tabela de registro de manutenções
export const equipmentMaintenances = pgTable('equipment_maintenances', {
  id: serial('id').primaryKey(),
  equipmentId: integer('equipment_id').notNull(),
  maintenanceType: maintenanceTypeEnum('maintenance_type').notNull(),
  description: text('description').notNull(),
  scheduledDate: date('scheduled_date').notNull(),
  completionDate: date('completion_date'),
  performedBy: text('performed_by'),
  cost: text('cost'),
  status: maintenanceStatusEnum('status').default('scheduled'),
  serviceProvider: text('service_provider'),
  notes: text('notes'),
  attachments: text('attachments').array(), // URLs para anexos
  resultsSummary: text('results_summary'),
  approvedBy: integer('approved_by'),
  followUpRequired: boolean('follow_up_required').default(false),
  followUpDate: date('follow_up_date'),
  createdBy: integer('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela de certificados de equipamentos
export const equipmentCertificates = pgTable('equipment_certificates', {
  id: serial('id').primaryKey(),
  equipmentId: integer('equipment_id').notNull(),
  certificateNumber: text('certificate_number').notNull(),
  certificateType: text('certificate_type').notNull(), // Calibração, Validação, etc.
  issueDate: date('issue_date').notNull(),
  expiryDate: date('expiry_date'),
  issuedBy: text('issued_by').notNull(),
  status: text('status').notNull(), // Válido, Expirado, etc.
  documentUrl: text('document_url'), // URL para o documento
  notes: text('notes'),
  createdBy: integer('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relações
export const labEquipmentsRelations = relations(labEquipments, ({ many }) => ({
  maintenances: many(equipmentMaintenances),
  certificates: many(equipmentCertificates),
}));

export const equipmentMaintenancesRelations = relations(equipmentMaintenances, ({ one }) => ({
  equipment: one(labEquipments, {
    fields: [equipmentMaintenances.equipmentId],
    references: [labEquipments.id],
  }),
}));

export const equipmentCertificatesRelations = relations(equipmentCertificates, ({ one }) => ({
  equipment: one(labEquipments, {
    fields: [equipmentCertificates.equipmentId],
    references: [labEquipments.id],
  }),
}));

// Schemas para inserção
export const insertLabEquipmentSchema = createInsertSchema(labEquipments).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEquipmentMaintenanceSchema = createInsertSchema(equipmentMaintenances).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEquipmentCertificateSchema = createInsertSchema(equipmentCertificates).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Tipos para inserção
export type InsertLabEquipment = z.infer<typeof insertLabEquipmentSchema>;
export type InsertEquipmentMaintenance = z.infer<typeof insertEquipmentMaintenanceSchema>;
export type InsertEquipmentCertificate = z.infer<typeof insertEquipmentCertificateSchema>;

// Tipos inferidos
export type LabEquipment = typeof labEquipments.$inferSelect;
export type EquipmentMaintenance = typeof equipmentMaintenances.$inferSelect;
export type EquipmentCertificate = typeof equipmentCertificates.$inferSelect;