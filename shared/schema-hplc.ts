import { pgTable, serial, integer, varchar, text, boolean, date, timestamp, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Tipos para equipamentos HPLC
export const hplcEquipmentStatusEnum = pgEnum('hplc_equipment_status', [
  'operational',
  'maintenance',
  'out_of_service'
]);

// Tipos para manutenções HPLC
export const hplcMaintenanceTypeEnum = pgEnum('hplc_maintenance_type', [
  'preventive',
  'corrective',
  'calibration',
  'qualification',
  'verification',
  'cleaning'
]);

export const hplcMaintenanceStatusEnum = pgEnum('hplc_maintenance_status', [
  'scheduled',
  'in_progress',
  'completed',
  'cancelled'
]);

// Definição da tabela de equipamentos HPLC
export const hplcEquipments = pgTable('hplc_equipments', {
  id: serial('id').primaryKey(),
  laboratoryId: integer('laboratory_id').notNull(),
  name: text('name').notNull(),
  model: text('model').notNull(),
  serialNumber: text('serial_number').notNull(),
  manufacturer: text('manufacturer').notNull(),
  acquisitionDate: date('acquisition_date'),
  installationDate: date('installation_date'),
  status: hplcEquipmentStatusEnum('status').default('operational'),
  location: text('location'),
  documents: json('documents'),
  specifications: json('specifications'),
  warrantyExpiration: date('warranty_expiration'),
  nextCalibrationDate: date('next_calibration_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Definição da tabela de manutenções HPLC
export const hplcMaintenances = pgTable('hplc_maintenances', {
  id: serial('id').primaryKey(),
  equipmentId: integer('equipment_id').notNull(),
  description: text('description').notNull(),
  maintenanceType: hplcMaintenanceTypeEnum('maintenance_type').notNull(),
  scheduledDate: date('scheduled_date').notNull(),
  completionDate: date('completion_date'),
  performedBy: integer('performed_by'),
  cost: integer('cost'),
  status: hplcMaintenanceStatusEnum('status').default('scheduled'),
  serviceProvider: text('service_provider'),
  contactInfo: text('contact_info'),
  workOrderNumber: text('work_order_number'),
  notes: text('notes'),
  attachments: json('attachments'),
  followUpDate: date('follow_up_date'),
  createdBy: integer('created_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Tipos para consumíveis HPLC
export const hplcConsumableTypeEnum = pgEnum('hplc_consumable_type', [
  'mobile_phase',
  'column',
  'vial',
  'filter',
  'standard',
  'reagent',
  'solvent',
  'other'
]);

// Definição da tabela de consumíveis HPLC
export const hplcConsumables = pgTable('hplc_consumables', {
  id: serial('id').primaryKey(),
  laboratoryId: integer('laboratory_id').notNull(),
  name: text('name').notNull(),
  type: hplcConsumableTypeEnum('type').notNull(),
  initialQuantity: integer('initial_quantity').notNull(),
  currentQuantity: integer('current_quantity').notNull(),
  unit: varchar('unit', { length: 50 }).notNull(),
  minimumQuantity: integer('minimum_quantity').notNull(),
  catalogNumber: text('catalog_number'),
  manufacturer: text('manufacturer'),
  lotNumber: text('lot_number'),
  receivedDate: date('received_date').notNull(),
  expiryDate: date('expiry_date'),
  storageLocation: text('storage_location'),
  price: integer('price'),
  supplier: text('supplier'),
  storageConditions: text('storage_conditions'),
  createdBy: integer('created_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Definição da tabela de logs de consumo de consumíveis
export const hplcConsumptionLogs = pgTable('hplc_consumption_logs', {
  id: serial('id').primaryKey(),
  consumableId: integer('consumable_id').notNull(),
  quantity: integer('quantity').notNull(),
  unitUsed: varchar('unit_used', { length: 50 }).notNull(),
  runId: integer('run_id'),
  usedBy: integer('used_by').notNull(),
  usedAt: timestamp('used_at').notNull().defaultNow(),
  reason: text('reason').notNull(),
  notes: text('notes')
});

// Tipos para corridas HPLC
export const hplcRunStatusEnum = pgEnum('hplc_run_status', [
  'scheduled',
  'in_progress',
  'completed',
  'aborted',
  'failed'
]);

// Definição da tabela de corridas HPLC
export const hplcRuns = pgTable('hplc_runs', {
  id: serial('id').primaryKey(),
  equipmentId: integer('equipment_id').notNull(),
  columnId: integer('column_id'),
  runName: text('run_name').notNull(),
  method: text('method').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  analyst: integer('analyst').notNull(),
  sampleCount: integer('sample_count').notNull(),
  status: hplcRunStatusEnum('status').default('in_progress'),
  mobilePhase: text('mobile_phase'),
  flowRate: text('flow_rate'),
  detectionWavelength: text('detection_wavelength'),
  injectionVolume: text('injection_volume'),
  temperature: text('temperature'),
  notes: text('notes'),
  result: json('result'),
  processingDetails: json('processing_details'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Definição da tabela de procedimentos/SOPs HPLC
export const hplcProcedures = pgTable('hplc_procedures', {
  id: serial('id').primaryKey(),
  laboratoryId: integer('laboratory_id').notNull(),
  title: text('title').notNull(),
  documentNumber: text('document_number').notNull(),
  version: text('version').notNull(),
  effectiveDate: date('effective_date').notNull(),
  category: text('category').notNull(),
  content: text('content').notNull(),
  attachments: json('attachments'),
  createdBy: integer('created_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Tipos para validações de métodos HPLC
export const hplcMethodValidationStatusEnum = pgEnum('hplc_method_validation_status', [
  'submitted',
  'in_progress',
  'completed',
  'rejected'
]);

// Definição da tabela de validações de métodos HPLC
export const hplcMethodValidations = pgTable('hplc_method_validations', {
  id: serial('id').primaryKey(),
  laboratoryId: integer('laboratory_id').notNull(),
  methodName: text('method_name').notNull(),
  version: text('version').notNull(),
  status: hplcMethodValidationStatusEnum('status').default('submitted'),
  validationParameters: json('validation_parameters'),
  protocol: text('protocol').notNull(),
  reports: json('reports'),
  conclusion: text('conclusion'),
  requestedBy: integer('requested_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Tipos para treinamentos de usuários HPLC
export const hplcTrainingTypeEnum = pgEnum('hplc_training_type', [
  'inicial',
  'recorrente',
  'específico'
]);

export const hplcTrainingStatusEnum = pgEnum('hplc_training_status', [
  'scheduled',
  'in_progress',
  'completed',
  'failed'
]);

// Definição da tabela de treinamentos de usuários HPLC
export const hplcUserTrainings = pgTable('hplc_user_trainings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  procedureId: integer('procedure_id'),
  equipmentId: integer('equipment_id'),
  trainingTitle: text('training_title').notNull(),
  trainingType: hplcTrainingTypeEnum('training_type').notNull(),
  startDate: date('start_date').notNull(),
  completionDate: date('completion_date'),
  trainedBy: integer('trained_by').notNull(),
  status: hplcTrainingStatusEnum('status').default('scheduled'),
  assessmentScore: integer('assessment_score'),
  certificateIssued: boolean('certificate_issued').default(false),
  comments: text('comments'),
  attachments: json('attachments'),
  createdBy: integer('created_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Relacionamentos
export const hplcEquipmentRelations = relations(hplcEquipments, ({ many }) => ({
  maintenances: many(hplcMaintenances),
  runs: many(hplcRuns),
  trainings: many(hplcUserTrainings)
}));

export const hplcMaintenanceRelations = relations(hplcMaintenances, ({ one }) => ({
  equipment: one(hplcEquipments, {
    fields: [hplcMaintenances.equipmentId],
    references: [hplcEquipments.id]
  })
}));

export const hplcConsumableRelations = relations(hplcConsumables, ({ one, many }) => ({
  consumptionLogs: many(hplcConsumptionLogs)
}));

export const hplcConsumptionLogRelations = relations(hplcConsumptionLogs, ({ one, many }) => ({
  consumable: one(hplcConsumables, {
    fields: [hplcConsumptionLogs.consumableId],
    references: [hplcConsumables.id]
  }),
  run: one(hplcRuns, {
    fields: [hplcConsumptionLogs.runId],
    references: [hplcRuns.id]
  })
}));

export const hplcRunRelations = relations(hplcRuns, ({ one }) => ({
  equipment: one(hplcEquipments, {
    fields: [hplcRuns.equipmentId],
    references: [hplcEquipments.id]
  }),
  column: one(hplcConsumables, {
    fields: [hplcRuns.columnId],
    references: [hplcConsumables.id]
  })
}));

// Schemas de inserção para validação
export const insertHplcEquipmentSchema = createInsertSchema(hplcEquipments).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertHplcMaintenanceSchema = createInsertSchema(hplcMaintenances).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertHplcConsumableSchema = createInsertSchema(hplcConsumables).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertHplcConsumptionLogSchema = createInsertSchema(hplcConsumptionLogs).omit({ 
  id: true
});

export const insertHplcRunSchema = createInsertSchema(hplcRuns).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertHplcProcedureSchema = createInsertSchema(hplcProcedures).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertHplcMethodValidationSchema = createInsertSchema(hplcMethodValidations).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertHplcUserTrainingSchema = createInsertSchema(hplcUserTrainings).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

// Tipos de inserção
export type InsertHplcEquipment = z.infer<typeof insertHplcEquipmentSchema>;
export type InsertHplcMaintenance = z.infer<typeof insertHplcMaintenanceSchema>;
export type InsertHplcConsumable = z.infer<typeof insertHplcConsumableSchema>;
export type InsertHplcConsumptionLog = z.infer<typeof insertHplcConsumptionLogSchema>;
export type InsertHplcRun = z.infer<typeof insertHplcRunSchema>;
export type InsertHplcProcedure = z.infer<typeof insertHplcProcedureSchema>;
export type InsertHplcMethodValidation = z.infer<typeof insertHplcMethodValidationSchema>;
export type InsertHplcUserTraining = z.infer<typeof insertHplcUserTrainingSchema>;

// Tipos de seleção
export type HplcEquipment = typeof hplcEquipments.$inferSelect;
export type HplcMaintenance = typeof hplcMaintenances.$inferSelect;
export type HplcConsumable = typeof hplcConsumables.$inferSelect;
export type HplcConsumptionLog = typeof hplcConsumptionLogs.$inferSelect;
export type HplcRun = typeof hplcRuns.$inferSelect;
export type HplcProcedure = typeof hplcProcedures.$inferSelect;
export type HplcMethodValidation = typeof hplcMethodValidations.$inferSelect;
export type HplcUserTraining = typeof hplcUserTrainings.$inferSelect;