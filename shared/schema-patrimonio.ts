import { pgTable, text, serial, timestamp, decimal, integer, boolean, pgEnum, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enum para tipo de instalação
export const installationTypeEnum = pgEnum('installation_type', [
  'sede', 'laboratório', 'centro_pesquisa', 'cultivo', 'produção', 'armazém', 'dispensário', 'escritório', 'outro'
]);

// Enum para status de instalação
export const installationStatusEnum = pgEnum('installation_status', [
  'ativo', 'inativo', 'em_manutenção', 'em_construção', 'desativado'
]);

// Enum para tipo de equipamento
export const assetTypeEnum = pgEnum('asset_type', [
  'cultivo', 'laboratório', 'produção', 'escritório', 'tecnologia', 'segurança', 'refrigeração', 'energia', 'outro'
]);

// Enum para status de equipamento
export const assetStatusEnum = pgEnum('asset_status', [
  'ativo', 'inativo', 'em_manutenção', 'quebrado', 'em_garantia', 'obsoleto'
]);

// Enum para tipo de manutenção
export const assetMaintenanceTypeEnum = pgEnum('asset_maintenance_type', [
  'preventiva', 'corretiva', 'preditiva', 'calibração', 'inspeção'
]);

// Enum para status de manutenção
export const assetMaintenanceStatusEnum = pgEnum('asset_maintenance_status', [
  'agendada', 'em_execução', 'concluída', 'cancelada', 'planejada'
]);

// Enum para prioridade de manutenção
export const assetMaintenancePriorityEnum = pgEnum('asset_maintenance_priority', [
  'baixa', 'média', 'alta', 'crítica'
]);

// Enum para método de depreciação
export const depreciationMethodEnum = pgEnum('depreciation_method', [
  'linear', 'saldo_decrescente', 'soma_dos_digitos', 'unidades_producao', 'horas_uso'
]);

// Tabela para instalações
export const installations = pgTable("installations", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  name: text("name").notNull(),
  type: installationTypeEnum("type").notNull(),
  status: installationStatusEnum("status").notNull().default("ativo"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code"),
  totalArea: decimal("total_area", { precision: 10, scale: 2 }),
  capacity: integer("capacity"),
  occupancyRate: decimal("occupancy_rate", { precision: 5, scale: 2 }),
  acquisitionValue: decimal("acquisition_value", { precision: 15, scale: 2 }),
  monthlyExpenses: decimal("monthly_expenses", { precision: 12, scale: 2 }),
  lastMaintenanceDate: timestamp("last_maintenance_date"),
  nextMaintenanceDate: timestamp("next_maintenance_date"),
  responsibleId: integer("responsible_id"),
  notes: text("notes"),
  images: text("images").array(),
  documents: text("documents").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela para ativos (equipamentos, veículos, móveis, etc.)
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  installationId: integer("installation_id"),
  name: text("name").notNull(),
  description: text("description"),
  serialNumber: text("serial_number"),
  model: text("model"),
  manufacturer: text("manufacturer"),
  type: assetTypeEnum("type").notNull(),
  category: text("category").notNull(),
  status: assetStatusEnum("status").notNull().default("ativo"),
  purchaseDate: timestamp("purchase_date"),
  purchaseValue: decimal("purchase_value", { precision: 15, scale: 2 }),
  currentValue: decimal("current_value", { precision: 15, scale: 2 }),
  depreciationMethod: depreciationMethodEnum("depreciation_method").default("linear"),
  depreciationRate: decimal("depreciation_rate", { precision: 5, scale: 2 }),
  lifespan: integer("lifespan"), // Em meses
  salvageValue: decimal("salvage_value", { precision: 15, scale: 2 }),
  lastCalculationDate: timestamp("last_calculation_date"),
  warrantySartDate: timestamp("warranty_start_date"),
  warrantyEndDate: timestamp("warranty_end_date"),
  supplierName: text("supplier_name"),
  supplierContact: text("supplier_contact"),
  location: text("location"), // Localização específica dentro da instalação
  barcode: text("barcode"),
  invoiceNumber: text("invoice_number"),
  notes: text("notes"),
  responsibleId: integer("responsible_id"),
  images: text("images").array(),
  documents: text("documents").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela para manutenções de ativos
export const assetMaintenances = pgTable("asset_maintenances", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  assetId: integer("asset_id"),
  installationId: integer("installation_id"),
  code: text("code").notNull(), // Código da manutenção (ex: MAN-2023-001)
  title: text("title").notNull(),
  description: text("description"),
  type: assetMaintenanceTypeEnum("type").notNull(),
  status: assetMaintenanceStatusEnum("status").notNull().default("agendada"),
  priority: assetMaintenancePriorityEnum("priority").notNull().default("média"),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  cost: decimal("cost", { precision: 12, scale: 2 }),
  invoiceNumber: text("invoice_number"),
  technician: text("technician"),
  technicianContact: text("technician_contact"),
  supplierCompany: text("supplier_company"),
  responsibleId: integer("responsible_id"),
  executorId: integer("executor_id"),
  notes: text("notes"),
  findings: text("findings"),
  recommendations: text("recommendations"),
  documents: text("documents").array(),
  images: text("images").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela para cálculos de depreciação
export const assetDepreciations = pgTable("asset_depreciations", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  assetId: integer("asset_id").notNull(),
  year: integer("year").notNull(), // ano de referência
  month: integer("month").notNull(), // mês de referência (1-12)
  depreciationAmount: decimal("depreciation_amount", { precision: 15, scale: 2 }).notNull(),
  accumulatedDepreciation: decimal("accumulated_depreciation", { precision: 15, scale: 2 }).notNull(),
  remainingValue: decimal("remaining_value", { precision: 15, scale: 2 }).notNull(),
  calculationDate: timestamp("calculation_date").defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relações para instalações
export const installationsRelations = relations(installations, ({ many }) => ({
  assets: many(assets),
  maintenances: many(assetMaintenances),
}));

// Relações para ativos
export const assetsRelations = relations(assets, ({ one, many }) => ({
  installation: one(installations, {
    fields: [assets.installationId],
    references: [installations.id],
  }),
  maintenances: many(assetMaintenances),
  depreciations: many(assetDepreciations),
}));

// Relações para manutenções
export const assetMaintenancesRelations = relations(assetMaintenances, ({ one }) => ({
  asset: one(assets, {
    fields: [assetMaintenances.assetId],
    references: [assets.id],
  }),
  installation: one(installations, {
    fields: [assetMaintenances.installationId],
    references: [installations.id],
  }),
}));

// Relações para depreciações
export const assetDepreciationsRelations = relations(assetDepreciations, ({ one }) => ({
  asset: one(assets, {
    fields: [assetDepreciations.assetId],
    references: [assets.id],
  }),
}));

// Schemas de inserção
export const insertInstallationSchema = createInsertSchema(installations).pick({
  organizationId: true,
  name: true,
  type: true,
  status: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  totalArea: true,
  capacity: true,
  occupancyRate: true,
  acquisitionValue: true,
  monthlyExpenses: true,
  lastMaintenanceDate: true,
  nextMaintenanceDate: true,
  responsibleId: true,
  notes: true,
  images: true,
  documents: true,
});

export const insertAssetSchema = createInsertSchema(assets).pick({
  organizationId: true,
  installationId: true,
  name: true,
  description: true,
  serialNumber: true,
  model: true,
  manufacturer: true,
  type: true,
  category: true,
  status: true,
  purchaseDate: true,
  purchaseValue: true,
  currentValue: true,
  depreciationMethod: true,
  depreciationRate: true,
  lifespan: true,
  salvageValue: true,
  warrantySartDate: true,
  warrantyEndDate: true,
  supplierName: true,
  supplierContact: true,
  location: true,
  barcode: true,
  invoiceNumber: true,
  notes: true,
  responsibleId: true,
  images: true,
  documents: true,
});

export const insertAssetMaintenanceSchema = createInsertSchema(assetMaintenances).pick({
  organizationId: true,
  assetId: true,
  installationId: true,
  code: true,
  title: true,
  description: true,
  type: true,
  status: true,
  priority: true,
  scheduledDate: true,
  completedDate: true,
  cost: true,
  invoiceNumber: true,
  technician: true,
  technicianContact: true,
  supplierCompany: true,
  responsibleId: true,
  executorId: true,
  notes: true,
  findings: true,
  recommendations: true,
  documents: true,
  images: true,
});

export const insertAssetDepreciationSchema = createInsertSchema(assetDepreciations).pick({
  organizationId: true,
  assetId: true,
  year: true,
  month: true,
  depreciationAmount: true,
  accumulatedDepreciation: true,
  remainingValue: true,
  notes: true,
});

// Tipos de exportação
export type Installation = typeof installations.$inferSelect;
export type InsertInstallation = z.infer<typeof insertInstallationSchema>;

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;

export type AssetMaintenance = typeof assetMaintenances.$inferSelect;
export type InsertAssetMaintenance = z.infer<typeof insertAssetMaintenanceSchema>;

export type AssetDepreciation = typeof assetDepreciations.$inferSelect;
export type InsertAssetDepreciation = z.infer<typeof insertAssetDepreciationSchema>;