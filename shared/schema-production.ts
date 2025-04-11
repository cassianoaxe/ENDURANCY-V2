import { pgTable, serial, text, timestamp, integer, real, boolean, date, json, uniqueIndex, pgEnum } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { organizationsTable, usersTable } from './schema-doctor-affiliation';

// Importamos ou declaramos aqui as tabelas de cultivo para manter a rastreabilidade completa
// Se as tabelas já existem em outro schema, elas devem ser importadas aqui
export const cultivationBatchesTable = pgTable('cultivation_batches', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizationsTable.id),
  batchNumber: text('batch_number').notNull(),
  strainName: text('strain_name').notNull(),
  sourceType: text('source_type').notNull(), // 'seed', 'clone', 'tissue_culture', etc.
  sourceId: text('source_id'), // Rastreamento da origem (lote de sementes, planta mãe, etc.)
  plantCount: integer('plant_count').notNull(),
  plantingDate: timestamp('planting_date').notNull(),
  growingMethod: text('growing_method'), // 'indoor', 'outdoor', 'greenhouse'
  location: text('location'),
  status: text('status').notNull().default('active'),
  harvestDate: timestamp('harvest_date'),
  harvestedQuantity: real('harvested_quantity'),
  harvestUnit: text('harvest_unit'),
  dryingCompleteDate: timestamp('drying_complete_date'),
  trimCompleteDate: timestamp('trim_complete_date'),
  cureCompleteDate: timestamp('cure_complete_date'),
  finalYield: real('final_yield'),
  finalYieldUnit: text('final_yield_unit'),
  thcPercentage: real('thc_percentage'),
  cbdPercentage: real('cbd_percentage'),
  otherCannabinoids: json('other_cannabinoids'),
  terpeneProfile: json('terpene_profile'),
  testResults: json('test_results'),
  notes: text('notes'),
  responsibleUserId: integer('responsible_user_id').references(() => usersTable.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de plantas individuais para rastreamento detalhado
export const plantsTable = pgTable('plants', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizationsTable.id),
  cultivationBatchId: integer('cultivation_batch_id').references(() => cultivationBatchesTable.id),
  plantTag: text('plant_tag').notNull(),
  strain: text('strain').notNull(),
  motherPlantId: integer('mother_plant_id'), // Auto-referência para plantas mãe
  plantingDate: timestamp('planting_date').notNull(),
  vegetativeStartDate: timestamp('vegetative_start_date'),
  floweringStartDate: timestamp('flowering_start_date'),
  harvestDate: timestamp('harvest_date'),
  dryWeight: real('dry_weight'),
  status: text('status').notNull().default('seedling'),
  location: text('location'),
  growthNotes: json('growth_notes'),
  healthIssues: json('health_issues'),
  treatmentsApplied: json('treatments_applied'),
  responsibleUserId: integer('responsible_user_id').references(() => usersTable.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Enums para status de produção, qualidade, etc.
export const productionStatusEnum = pgEnum('production_status', [
  'planejado', 'em_andamento', 'em_espera', 'concluido', 'cancelado', 'em_analise_qa', 'aprovado_qa', 'reprovado_qa'
]);

export const qualityStatusEnum = pgEnum('quality_status', [
  'pendente', 'em_analise', 'aprovado', 'reprovado', 'em_quarentena', 'liberado', 'destruido'
]);

export const auditTypeEnum = pgEnum('audit_type', [
  'criacao', 'atualizacao', 'delecao', 'aprovacao', 'reprovacao', 'inspecao', 'inicio_producao', 'fim_producao'
]);

// Tabela de matérias-primas
export const rawMaterialsTable = pgTable('raw_materials', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizationsTable.id),
  name: text('name').notNull(),
  code: text('code').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  supplier: text('supplier'),
  supplierCode: text('supplier_code'),
  stockQuantity: real('stock_quantity').notNull().default(0),
  unit: text('unit').notNull(),
  minStockLevel: real('min_stock_level'),
  specifications: json('specifications'),
  batchTracking: boolean('batch_tracking').notNull().default(true),
  shelfLife: integer('shelf_life'), // Em dias
  storageConditions: text('storage_conditions'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de lotes de matérias-primas
export const rawMaterialBatchesTable = pgTable('raw_material_batches', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizationsTable.id),
  rawMaterialId: integer('raw_material_id').notNull().references(() => rawMaterialsTable.id),
  batchNumber: text('batch_number').notNull(),
  quantity: real('quantity').notNull(),
  receivedDate: timestamp('received_date').notNull(),
  expiryDate: timestamp('expiry_date'),
  supplierBatchNumber: text('supplier_batch_number'),
  coaDocument: text('coa_document'), // URL do documento de análise (COA)
  status: qualityStatusEnum('status').notNull().default('pendente'),
  storageLocation: text('storage_location'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de fornecedores
export const suppliersTable = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizationsTable.id),
  name: text('name').notNull(),
  code: text('code').notNull(),
  cnpj: text('cnpj'),
  contactName: text('contact_name'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  category: text('category'),
  certifications: json('certifications'),
  performanceRating: integer('performance_rating'),
  active: boolean('active').notNull().default(true),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Ordens de produção
export const productionOrdersTable = pgTable('production_orders', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizationsTable.id),
  orderNumber: text('order_number').notNull(),
  productName: text('product_name').notNull(),
  productCode: text('product_code'),
  batchNumber: text('batch_number').notNull(),
  quantity: real('quantity').notNull(),
  unit: text('unit').notNull(),
  plannedStartDate: timestamp('planned_start_date'),
  plannedEndDate: timestamp('planned_end_date'),
  actualStartDate: timestamp('actual_start_date'),
  actualEndDate: timestamp('actual_end_date'),
  status: productionStatusEnum('status').notNull().default('planejado'),
  responsibleUserId: integer('responsible_user_id').references(() => usersTable.id),
  priority: integer('priority').default(2), // 1-alta, 2-média, 3-baixa
  notes: text('notes'),
  formula: json('formula'), // Fórmula completa com ingredientes e instruções
  batchSize: real('batch_size').notNull(),
  actualYield: real('actual_yield'),
  qualityStatus: qualityStatusEnum('quality_status').default('pendente'),
  approvedBy: integer('approved_by').references(() => usersTable.id),
  approvalDate: timestamp('approval_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de etapas de produção
export const productionStepsTable = pgTable('production_steps', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizationsTable.id),
  productionOrderId: integer('production_order_id').notNull().references(() => productionOrdersTable.id),
  stepNumber: integer('step_number').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  instructions: text('instructions'),
  duration: integer('duration'), // Em minutos
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  status: productionStatusEnum('status').notNull().default('planejado'),
  responsibleUserId: integer('responsible_user_id').references(() => usersTable.id),
  notes: text('notes'),
  equipmentNeeded: json('equipment_needed'),
  criticalStep: boolean('critical_step').default(false),
  checkpoints: json('checkpoints'), // Lista de verificações/critérios 
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de parâmetros de qualidade
export const qualityParametersTable = pgTable('quality_parameters', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizationsTable.id),
  name: text('name').notNull(),
  description: text('description'),
  parameterType: text('parameter_type').notNull(), // físico, químico, microbiológico, etc.
  unit: text('unit'),
  minValue: real('min_value'),
  maxValue: real('max_value'),
  targetValue: real('target_value'),
  testMethod: text('test_method'),
  category: text('category'), // para agrupar parâmetros
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de testes de qualidade
export const qualityTestsTable = pgTable('quality_tests', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizationsTable.id),
  productionOrderId: integer('production_order_id').references(() => productionOrdersTable.id),
  rawMaterialBatchId: integer('raw_material_batch_id').references(() => rawMaterialBatchesTable.id),
  cultivationBatchId: integer('cultivation_batch_id').references(() => cultivationBatchesTable.id),
  finishedProductBatchId: integer('finished_product_batch_id'),
  testType: text('test_type').notNull(), // matéria-prima, processo, cultivo, produto final
  sourceType: text('source_type').notNull().default('raw_material'), // 'raw_material', 'cultivation', 'production', 'finished_product'
  testDate: timestamp('test_date').notNull(),
  testedBy: integer('tested_by').references(() => usersTable.id),
  status: qualityStatusEnum('status').notNull().default('pendente'),
  reviewedBy: integer('reviewed_by').references(() => usersTable.id),
  reviewDate: timestamp('review_date'),
  notes: text('notes'),
  attachmentUrls: json('attachment_urls'), // Lista de URLs para documentos/imagens
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de resultados de testes de qualidade
export const qualityTestResultsTable = pgTable('quality_test_results', {
  id: serial('id').primaryKey(),
  qualityTestId: integer('quality_test_id').notNull().references(() => qualityTestsTable.id),
  parameterId: integer('parameter_id').notNull().references(() => qualityParametersTable.id),
  result: real('result'),
  resultText: text('result_text'),
  compliant: boolean('compliant'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de produtos finalizados
export const finishedProductsTable = pgTable('finished_products', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizationsTable.id),
  name: text('name').notNull(),
  code: text('code').notNull(),
  description: text('description'),
  productType: text('product_type').notNull(),
  formula: json('formula'), // Fórmula padrão
  packaging: text('packaging'),
  shelfLife: integer('shelf_life'), // Em dias
  storageConditions: text('storage_conditions'),
  active: boolean('active').notNull().default(true),
  approved: boolean('approved').notNull().default(false),
  approvedBy: integer('approved_by').references(() => usersTable.id),
  approvalDate: timestamp('approval_date'),
  registrationNumber: text('registration_number'), // Número de registro regulatório
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de lotes de produtos finalizados
export const finishedProductBatchesTable = pgTable('finished_product_batches', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizationsTable.id),
  finishedProductId: integer('finished_product_id').notNull().references(() => finishedProductsTable.id),
  productionOrderId: integer('production_order_id').notNull().references(() => productionOrdersTable.id),
  batchNumber: text('batch_number').notNull(),
  manufacturingDate: timestamp('manufacturing_date').notNull(),
  expiryDate: timestamp('expiry_date').notNull(),
  quantity: real('quantity').notNull(),
  unit: text('unit').notNull(),
  status: qualityStatusEnum('status').notNull().default('pendente'),
  stockLocation: text('stock_location'),
  notes: text('notes'),
  qualityApproved: boolean('quality_approved').default(false),
  approvedBy: integer('approved_by').references(() => usersTable.id),
  approvalDate: timestamp('approval_date'),
  releaseDate: timestamp('release_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de rastreabilidade entre lotes e matérias-primas/cultivo
export const batchTraceabilityTable = pgTable('batch_traceability', {
  id: serial('id').primaryKey(),
  finishedProductBatchId: integer('finished_product_batch_id').notNull().references(() => finishedProductBatchesTable.id),
  rawMaterialBatchId: integer('raw_material_batch_id').references(() => rawMaterialBatchesTable.id),
  cultivationBatchId: integer('cultivation_batch_id').references(() => cultivationBatchesTable.id),
  quantity: real('quantity').notNull(),
  unit: text('unit').notNull(),
  type: text('type').notNull().default('raw_material'), // 'raw_material' ou 'cultivation'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabela de cálculos de diluição
export const dilutionCalculationsTable = pgTable('dilution_calculations', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizationsTable.id),
  productionOrderId: integer('production_order_id').notNull().references(() => productionOrdersTable.id),
  calculationDate: timestamp('calculation_date').notNull(),
  calculatedBy: integer('calculated_by').references(() => usersTable.id),
  initialConcentration: real('initial_concentration').notNull(),
  targetConcentration: real('target_concentration').notNull(),
  initialVolume: real('initial_volume'),
  targetVolume: real('target_volume'),
  solventType: text('solvent_type'),
  solventAmount: real('solvent_amount'),
  notes: text('notes'),
  formula: text('formula'), // Detalhes da fórmula usada
  result: real('result'),
  verified: boolean('verified').default(false),
  verifiedBy: integer('verified_by').references(() => usersTable.id),
  verificationDate: timestamp('verification_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de processo de extração
export const extractionProcessesTable = pgTable('extraction_processes', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizationsTable.id),
  productionOrderId: integer('production_order_id').notNull().references(() => productionOrdersTable.id),
  extractionDate: timestamp('extraction_date').notNull(),
  method: text('method').notNull(), // Método de extração
  rawMaterialBatchId: integer('raw_material_batch_id').references(() => rawMaterialBatchesTable.id),
  cultivationBatchId: integer('cultivation_batch_id').references(() => cultivationBatchesTable.id),
  inputQuantity: real('input_quantity').notNull(),
  solventType: text('solvent_type'),
  solventQuantity: real('solvent_quantity'),
  extractionParameters: json('extraction_parameters'), // Temperatura, pressão, etc.
  duration: integer('duration'), // Em minutos
  outputQuantity: real('output_quantity'),
  yield: real('yield'),
  operatorId: integer('operator_id').references(() => usersTable.id),
  notes: text('notes'),
  status: productionStatusEnum('status').notNull().default('em_andamento'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de envase
export const fillingProcessesTable = pgTable('filling_processes', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizationsTable.id),
  productionOrderId: integer('production_order_id').notNull().references(() => productionOrdersTable.id),
  fillingDate: timestamp('filling_date').notNull(),
  batchNumber: text('batch_number').notNull(),
  productId: integer('product_id').references(() => finishedProductsTable.id),
  containerType: text('container_type').notNull(),
  containerSize: text('container_size').notNull(),
  containerUnit: text('container_unit').notNull(),
  quantityFilled: real('quantity_filled').notNull(),
  numberOfUnits: integer('number_of_units').notNull(),
  fillingLine: text('filling_line'),
  operatorId: integer('operator_id').references(() => usersTable.id),
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  status: productionStatusEnum('status').notNull().default('em_andamento'),
  qualityChecked: boolean('quality_checked').default(false),
  checkedBy: integer('checked_by').references(() => usersTable.id),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de rotulagem
export const labelingProcessesTable = pgTable('labeling_processes', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizationsTable.id),
  fillingProcessId: integer('filling_process_id').notNull().references(() => fillingProcessesTable.id),
  labelingDate: timestamp('labeling_date').notNull(),
  labelTemplate: text('label_template').notNull(),
  labelBatchNumber: text('label_batch_number'),
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  quantityLabeled: integer('quantity_labeled').notNull(),
  operatorId: integer('operator_id').references(() => usersTable.id),
  qualityChecked: boolean('quality_checked').default(false),
  checkedBy: integer('checked_by').references(() => usersTable.id),
  notes: text('notes'),
  status: productionStatusEnum('status').notNull().default('em_andamento'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de distribuição para rastreamento
export const productDistributionTable = pgTable('product_distribution', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizationsTable.id),
  finishedProductBatchId: integer('finished_product_batch_id').notNull().references(() => finishedProductBatchesTable.id),
  distributionDate: timestamp('distribution_date').notNull(),
  quantity: real('quantity').notNull(),
  unit: text('unit').notNull(),
  destination: text('destination').notNull(), // Nome da farmácia, paciente, etc.
  destinationType: text('destination_type').notNull(), // 'pharmacy', 'patient', etc.
  destinationId: integer('destination_id'), // ID da farmácia ou paciente no sistema
  shippingMethod: text('shipping_method'),
  trackingNumber: text('tracking_number'),
  receivedDate: timestamp('received_date'),
  receivedBy: text('received_by'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de dispensação para pacientes (para rastreamento de recall)
export const patientDispensationTable = pgTable('patient_dispensation', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizationsTable.id),
  pharmacyId: integer('pharmacy_id'), // ID da farmácia que dispensou
  finishedProductBatchId: integer('finished_product_batch_id').notNull().references(() => finishedProductBatchesTable.id),
  patientId: integer('patient_id').notNull(), // ID do paciente
  dispensationDate: timestamp('dispensation_date').notNull(),
  quantity: real('quantity').notNull(),
  unit: text('unit').notNull(),
  prescriptionId: text('prescription_id'), // Referência da prescrição
  dispensedBy: integer('dispensed_by').references(() => usersTable.id),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabela de audit log para rastreabilidade
export const productionAuditLogTable = pgTable('production_audit_log', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizationsTable.id),
  userId: integer('user_id').references(() => usersTable.id),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  action: auditTypeEnum('action').notNull(),
  entityType: text('entity_type').notNull(), // 'production_order', 'quality_test', etc.
  entityId: integer('entity_id').notNull(),
  details: json('details'),
  ipAddress: text('ip_address'),
});

// Tabela de recall simulado
export const recallSimulationsTable = pgTable('recall_simulations', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizationsTable.id),
  finishedProductBatchId: integer('finished_product_batch_id').notNull().references(() => finishedProductBatchesTable.id),
  simulationDate: timestamp('simulation_date').notNull(),
  initiatedBy: integer('initiated_by').references(() => usersTable.id),
  reason: text('reason').notNull(),
  affectedUnits: integer('affected_units'),
  tracedUnits: integer('traced_units'),
  recallEfficiency: real('recall_efficiency'), // Porcentagem de unidades encontradas
  completionTime: integer('completion_time'), // Em minutos
  patientsNotified: integer('patients_notified'),
  pharmaciesNotified: integer('pharmacies_notified'),
  notes: text('notes'),
  report: text('report'), // URL para relatório detalhado
  status: text('status').notNull().default('em_andamento'),
  completionDate: timestamp('completion_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de configurações do módulo de produção
export const productionConfigTable = pgTable('production_config', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizationsTable.id).unique(),
  moduleEnabled: boolean('module_enabled').notNull().default(false),
  batchNumberFormat: text('batch_number_format').default('YY-MM-{SEQ}'),
  autoQualityControl: boolean('auto_quality_control').default(true),
  requireDoubleVerification: boolean('require_double_verification').default(true),
  shelfLifeWarningDays: integer('shelf_life_warning_days').default(30),
  lowStockThreshold: real('low_stock_threshold').default(10), // Porcentagem
  qualityParameterSets: json('quality_parameter_sets'), // Conjuntos pré-configurados
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Definição de relações

export const cultivationBatchesRelations = relations(cultivationBatchesTable, ({ many, one }) => ({
  organization: one(organizationsTable, {
    fields: [cultivationBatchesTable.organizationId],
    references: [organizationsTable.id],
  }),
  responsibleUser: one(usersTable, {
    fields: [cultivationBatchesTable.responsibleUserId],
    references: [usersTable.id],
  }),
  qualityTests: many(qualityTestsTable),
  extractionProcesses: many(extractionProcessesTable),
  batchTraceability: many(batchTraceabilityTable),
}));

export const rawMaterialsRelations = relations(rawMaterialsTable, ({ many, one }) => ({
  organization: one(organizationsTable, {
    fields: [rawMaterialsTable.organizationId],
    references: [organizationsTable.id],
  }),
  batches: many(rawMaterialBatchesTable),
}));

export const rawMaterialBatchesRelations = relations(rawMaterialBatchesTable, ({ one, many }) => ({
  rawMaterial: one(rawMaterialsTable, {
    fields: [rawMaterialBatchesTable.rawMaterialId],
    references: [rawMaterialsTable.id],
  }),
  organization: one(organizationsTable, {
    fields: [rawMaterialBatchesTable.organizationId],
    references: [organizationsTable.id],
  }),
  qualityTests: many(qualityTestsTable),
  batchTraceability: many(batchTraceabilityTable),
}));

export const suppliersRelations = relations(suppliersTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [suppliersTable.organizationId],
    references: [organizationsTable.id],
  }),
}));

export const productionOrdersRelations = relations(productionOrdersTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [productionOrdersTable.organizationId],
    references: [organizationsTable.id],
  }),
  steps: many(productionStepsTable),
  responsibleUser: one(usersTable, {
    fields: [productionOrdersTable.responsibleUserId],
    references: [usersTable.id],
  }),
  approvedByUser: one(usersTable, {
    fields: [productionOrdersTable.approvedBy],
    references: [usersTable.id],
  }),
  finishedProductBatches: many(finishedProductBatchesTable),
  extractionProcesses: many(extractionProcessesTable),
  fillingProcesses: many(fillingProcessesTable),
  dilutionCalculations: many(dilutionCalculationsTable),
  qualityTests: many(qualityTestsTable),
}));

export const productionStepsRelations = relations(productionStepsTable, ({ one }) => ({
  productionOrder: one(productionOrdersTable, {
    fields: [productionStepsTable.productionOrderId],
    references: [productionOrdersTable.id],
  }),
  organization: one(organizationsTable, {
    fields: [productionStepsTable.organizationId],
    references: [organizationsTable.id],
  }),
  responsibleUser: one(usersTable, {
    fields: [productionStepsTable.responsibleUserId],
    references: [usersTable.id],
  }),
}));

export const qualityParametersRelations = relations(qualityParametersTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [qualityParametersTable.organizationId],
    references: [organizationsTable.id],
  }),
  testResults: many(qualityTestResultsTable),
}));

export const qualityTestsRelations = relations(qualityTestsTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [qualityTestsTable.organizationId],
    references: [organizationsTable.id],
  }),
  productionOrder: one(productionOrdersTable, {
    fields: [qualityTestsTable.productionOrderId],
    references: [productionOrdersTable.id],
    relationName: 'production_order_tests',
  }),
  rawMaterialBatch: one(rawMaterialBatchesTable, {
    fields: [qualityTestsTable.rawMaterialBatchId],
    references: [rawMaterialBatchesTable.id],
    relationName: 'raw_material_tests',
  }),
  cultivationBatch: one(cultivationBatchesTable, {
    fields: [qualityTestsTable.cultivationBatchId],
    references: [cultivationBatchesTable.id],
    relationName: 'cultivation_tests',
  }),
  tester: one(usersTable, {
    fields: [qualityTestsTable.testedBy],
    references: [usersTable.id],
    relationName: 'tester_user',
  }),
  reviewer: one(usersTable, {
    fields: [qualityTestsTable.reviewedBy],
    references: [usersTable.id],
    relationName: 'reviewer_user',
  }),
  results: many(qualityTestResultsTable),
}));

export const qualityTestResultsRelations = relations(qualityTestResultsTable, ({ one }) => ({
  qualityTest: one(qualityTestsTable, {
    fields: [qualityTestResultsTable.qualityTestId],
    references: [qualityTestsTable.id],
  }),
  parameter: one(qualityParametersTable, {
    fields: [qualityTestResultsTable.parameterId],
    references: [qualityParametersTable.id],
  }),
}));

export const finishedProductsRelations = relations(finishedProductsTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [finishedProductsTable.organizationId],
    references: [organizationsTable.id],
  }),
  approvedByUser: one(usersTable, {
    fields: [finishedProductsTable.approvedBy],
    references: [usersTable.id],
  }),
  batches: many(finishedProductBatchesTable),
}));

export const finishedProductBatchesRelations = relations(finishedProductBatchesTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [finishedProductBatchesTable.organizationId],
    references: [organizationsTable.id],
  }),
  finishedProduct: one(finishedProductsTable, {
    fields: [finishedProductBatchesTable.finishedProductId],
    references: [finishedProductsTable.id],
  }),
  productionOrder: one(productionOrdersTable, {
    fields: [finishedProductBatchesTable.productionOrderId],
    references: [productionOrdersTable.id],
  }),
  approvedByUser: one(usersTable, {
    fields: [finishedProductBatchesTable.approvedBy],
    references: [usersTable.id],
  }),
  traceability: many(batchTraceabilityTable),
  distribution: many(productDistributionTable),
  dispensation: many(patientDispensationTable),
  recallSimulations: many(recallSimulationsTable),
}));

export const batchTraceabilityRelations = relations(batchTraceabilityTable, ({ one }) => ({
  finishedProductBatch: one(finishedProductBatchesTable, {
    fields: [batchTraceabilityTable.finishedProductBatchId],
    references: [finishedProductBatchesTable.id],
  }),
  rawMaterialBatch: one(rawMaterialBatchesTable, {
    fields: [batchTraceabilityTable.rawMaterialBatchId],
    references: [rawMaterialBatchesTable.id],
  }),
  cultivationBatch: one(cultivationBatchesTable, {
    fields: [batchTraceabilityTable.cultivationBatchId],
    references: [cultivationBatchesTable.id],
  }),
}));

export const dilutionCalculationsRelations = relations(dilutionCalculationsTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [dilutionCalculationsTable.organizationId],
    references: [organizationsTable.id],
  }),
  productionOrder: one(productionOrdersTable, {
    fields: [dilutionCalculationsTable.productionOrderId],
    references: [productionOrdersTable.id],
  }),
  calculatedByUser: one(usersTable, {
    fields: [dilutionCalculationsTable.calculatedBy],
    references: [usersTable.id],
    relationName: 'calculator_user',
  }),
  verifiedByUser: one(usersTable, {
    fields: [dilutionCalculationsTable.verifiedBy],
    references: [usersTable.id],
    relationName: 'verifier_user',
  }),
}));

export const extractionProcessesRelations = relations(extractionProcessesTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [extractionProcessesTable.organizationId],
    references: [organizationsTable.id],
  }),
  productionOrder: one(productionOrdersTable, {
    fields: [extractionProcessesTable.productionOrderId],
    references: [productionOrdersTable.id],
  }),
  rawMaterialBatch: one(rawMaterialBatchesTable, {
    fields: [extractionProcessesTable.rawMaterialBatchId],
    references: [rawMaterialBatchesTable.id],
  }),
  cultivationBatch: one(cultivationBatchesTable, {
    fields: [extractionProcessesTable.cultivationBatchId],
    references: [cultivationBatchesTable.id],
  }),
  operator: one(usersTable, {
    fields: [extractionProcessesTable.operatorId],
    references: [usersTable.id],
  }),
}));

export const fillingProcessesRelations = relations(fillingProcessesTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [fillingProcessesTable.organizationId],
    references: [organizationsTable.id],
  }),
  productionOrder: one(productionOrdersTable, {
    fields: [fillingProcessesTable.productionOrderId],
    references: [productionOrdersTable.id],
  }),
  product: one(finishedProductsTable, {
    fields: [fillingProcessesTable.productId],
    references: [finishedProductsTable.id],
  }),
  operator: one(usersTable, {
    fields: [fillingProcessesTable.operatorId],
    references: [usersTable.id],
    relationName: 'filling_operator',
  }),
  qualityChecker: one(usersTable, {
    fields: [fillingProcessesTable.checkedBy],
    references: [usersTable.id],
    relationName: 'filling_checker',
  }),
  labelingProcesses: many(labelingProcessesTable),
}));

export const labelingProcessesRelations = relations(labelingProcessesTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [labelingProcessesTable.organizationId],
    references: [organizationsTable.id],
  }),
  fillingProcess: one(fillingProcessesTable, {
    fields: [labelingProcessesTable.fillingProcessId],
    references: [fillingProcessesTable.id],
  }),
  operator: one(usersTable, {
    fields: [labelingProcessesTable.operatorId],
    references: [usersTable.id],
    relationName: 'labeling_operator',
  }),
  qualityChecker: one(usersTable, {
    fields: [labelingProcessesTable.checkedBy],
    references: [usersTable.id],
    relationName: 'labeling_checker',
  }),
}));

export const productDistributionRelations = relations(productDistributionTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [productDistributionTable.organizationId],
    references: [organizationsTable.id],
  }),
  finishedProductBatch: one(finishedProductBatchesTable, {
    fields: [productDistributionTable.finishedProductBatchId],
    references: [finishedProductBatchesTable.id],
  }),
}));

export const patientDispensationRelations = relations(patientDispensationTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [patientDispensationTable.organizationId],
    references: [organizationsTable.id],
  }),
  finishedProductBatch: one(finishedProductBatchesTable, {
    fields: [patientDispensationTable.finishedProductBatchId],
    references: [finishedProductBatchesTable.id],
  }),
  dispensedByUser: one(usersTable, {
    fields: [patientDispensationTable.dispensedBy],
    references: [usersTable.id],
  }),
}));

export const productionAuditLogRelations = relations(productionAuditLogTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [productionAuditLogTable.organizationId],
    references: [organizationsTable.id],
  }),
  user: one(usersTable, {
    fields: [productionAuditLogTable.userId],
    references: [usersTable.id],
  }),
}));

export const recallSimulationsRelations = relations(recallSimulationsTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [recallSimulationsTable.organizationId],
    references: [organizationsTable.id],
  }),
  finishedProductBatch: one(finishedProductBatchesTable, {
    fields: [recallSimulationsTable.finishedProductBatchId],
    references: [finishedProductBatchesTable.id],
  }),
  initiator: one(usersTable, {
    fields: [recallSimulationsTable.initiatedBy],
    references: [usersTable.id],
  }),
}));

export const productionConfigRelations = relations(productionConfigTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [productionConfigTable.organizationId],
    references: [organizationsTable.id],
  }),
}));

// Schema de inserção
export const insertCultivationBatchSchema = createInsertSchema(cultivationBatchesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRawMaterialSchema = createInsertSchema(rawMaterialsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRawMaterialBatchSchema = createInsertSchema(rawMaterialBatchesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSupplierSchema = createInsertSchema(suppliersTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProductionOrderSchema = createInsertSchema(productionOrdersTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProductionStepSchema = createInsertSchema(productionStepsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertQualityParameterSchema = createInsertSchema(qualityParametersTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertQualityTestSchema = createInsertSchema(qualityTestsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertQualityTestResultSchema = createInsertSchema(qualityTestResultsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFinishedProductSchema = createInsertSchema(finishedProductsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFinishedProductBatchSchema = createInsertSchema(finishedProductBatchesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBatchTraceabilitySchema = createInsertSchema(batchTraceabilityTable).omit({ id: true, createdAt: true });
export const insertDilutionCalculationSchema = createInsertSchema(dilutionCalculationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertExtractionProcessSchema = createInsertSchema(extractionProcessesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFillingProcessSchema = createInsertSchema(fillingProcessesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLabelingProcessSchema = createInsertSchema(labelingProcessesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProductDistributionSchema = createInsertSchema(productDistributionTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPatientDispensationSchema = createInsertSchema(patientDispensationTable).omit({ id: true, createdAt: true });
export const insertProductionAuditLogSchema = createInsertSchema(productionAuditLogTable).omit({ id: true });
export const insertRecallSimulationSchema = createInsertSchema(recallSimulationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProductionConfigSchema = createInsertSchema(productionConfigTable).omit({ id: true, createdAt: true, updatedAt: true });

// Types de inserção
export type InsertCultivationBatch = z.infer<typeof insertCultivationBatchSchema>;
export type InsertRawMaterial = z.infer<typeof insertRawMaterialSchema>;
export type InsertRawMaterialBatch = z.infer<typeof insertRawMaterialBatchSchema>;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type InsertProductionOrder = z.infer<typeof insertProductionOrderSchema>;
export type InsertProductionStep = z.infer<typeof insertProductionStepSchema>;
export type InsertQualityParameter = z.infer<typeof insertQualityParameterSchema>;
export type InsertQualityTest = z.infer<typeof insertQualityTestSchema>;
export type InsertQualityTestResult = z.infer<typeof insertQualityTestResultSchema>;
export type InsertFinishedProduct = z.infer<typeof insertFinishedProductSchema>;
export type InsertFinishedProductBatch = z.infer<typeof insertFinishedProductBatchSchema>;
export type InsertBatchTraceability = z.infer<typeof insertBatchTraceabilitySchema>;
export type InsertDilutionCalculation = z.infer<typeof insertDilutionCalculationSchema>;
export type InsertExtractionProcess = z.infer<typeof insertExtractionProcessSchema>;
export type InsertFillingProcess = z.infer<typeof insertFillingProcessSchema>;
export type InsertLabelingProcess = z.infer<typeof insertLabelingProcessSchema>;
export type InsertProductDistribution = z.infer<typeof insertProductDistributionSchema>;
export type InsertPatientDispensation = z.infer<typeof insertPatientDispensationSchema>;
export type InsertProductionAuditLog = z.infer<typeof insertProductionAuditLogSchema>;
export type InsertRecallSimulation = z.infer<typeof insertRecallSimulationSchema>;
export type InsertProductionConfig = z.infer<typeof insertProductionConfigSchema>;

// Types de seleção
export type CultivationBatch = typeof cultivationBatchesTable.$inferSelect;
export type RawMaterial = typeof rawMaterialsTable.$inferSelect;
export type RawMaterialBatch = typeof rawMaterialBatchesTable.$inferSelect;
export type Supplier = typeof suppliersTable.$inferSelect;
export type ProductionOrder = typeof productionOrdersTable.$inferSelect;
export type ProductionStep = typeof productionStepsTable.$inferSelect;
export type QualityParameter = typeof qualityParametersTable.$inferSelect;
export type QualityTest = typeof qualityTestsTable.$inferSelect;
export type QualityTestResult = typeof qualityTestResultsTable.$inferSelect;
export type FinishedProduct = typeof finishedProductsTable.$inferSelect;
export type FinishedProductBatch = typeof finishedProductBatchesTable.$inferSelect;
export type BatchTraceability = typeof batchTraceabilityTable.$inferSelect;
export type DilutionCalculation = typeof dilutionCalculationsTable.$inferSelect;
export type ExtractionProcess = typeof extractionProcessesTable.$inferSelect;
export type FillingProcess = typeof fillingProcessesTable.$inferSelect;
export type LabelingProcess = typeof labelingProcessesTable.$inferSelect;
export type ProductDistribution = typeof productDistributionTable.$inferSelect;
export type PatientDispensation = typeof patientDispensationTable.$inferSelect;
export type ProductionAuditLog = typeof productionAuditLogTable.$inferSelect;
export type RecallSimulation = typeof recallSimulationsTable.$inferSelect;
export type ProductionConfig = typeof productionConfigTable.$inferSelect;