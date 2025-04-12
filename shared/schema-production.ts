import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  varchar,
  text,
  date,
  timestamp,
  numeric,
  integer,
  boolean,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tipos de estoque
export type StockItemType = "raw_material" | "in_process" | "finished_product" | "packaging";
export type StockItemStatus = "available" | "reserved" | "in_use" | "quarantine" | "approved" | "rejected";

// Tipos de movimentação
export type MovementType = "in" | "out" | "transfer" | "adjustment" | "consumption" | "production";
export type MovementStatus = "pending" | "approved" | "completed" | "documented" | "canceled";

// Tipos de ordem de produção
export type ProductionOrderStatus = "planned" | "in_progress" | "paused" | "completed" | "canceled";
export type ProductionOrderPriority = "low" | "medium" | "high" | "urgent";

// Tipos de descarte
export type DisposalReason = "expired" | "damaged" | "contaminated" | "out_of_spec" | "quality_test" | "production_error" | "other";
export type DisposalMethod = "incineration" | "recycling" | "chemical_treatment" | "special_disposal" | "other";
export type DisposalStatus = "pending" | "approved" | "completed" | "documented" | "canceled";

// Tabela de Estoque (Inventory)
export const inventoryTable = pgTable("inventory", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 20 }).notNull().$type<StockItemType>(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull().default("0"),
  unit: varchar("unit", { length: 20 }).notNull(),
  location: varchar("location", { length: 255 }),
  batchNumber: varchar("batch_number", { length: 50 }),
  status: varchar("status", { length: 20 }).notNull().$type<StockItemStatus>().default("available"),
  minQuantity: numeric("min_quantity", { precision: 10, scale: 2 }),
  maxQuantity: numeric("max_quantity", { precision: 10, scale: 2 }),
  category: varchar("category", { length: 100 }),
  expiryDate: date("expiry_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  organizationId: integer("organization_id").notNull(),
});

// Tabela de Movimentações (Movements)
export const movementsTable = pgTable("movements", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  type: varchar("type", { length: 20 }).notNull().$type<MovementType>(),
  date: timestamp("date").notNull().defaultNow(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 20 }).notNull(),
  itemId: integer("item_id").notNull(),
  batchNumber: varchar("batch_number", { length: 50 }),
  origin: varchar("origin", { length: 255 }).notNull(),
  destination: varchar("destination", { length: 255 }).notNull(),
  reason: text("reason").notNull(),
  notes: text("notes"),
  reference: varchar("reference", { length: 100 }),
  status: varchar("status", { length: 20 }).notNull().$type<MovementStatus>().default("pending"),
  processedById: integer("processed_by_id"),
  processedAt: timestamp("processed_at"),
  createdById: integer("created_by_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  organizationId: integer("organization_id").notNull(),
});

// Tabela de Ordens de Produção (Production Orders)
export const productionOrdersTable = pgTable("production_orders", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  productId: integer("product_id").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 20 }).notNull(),
  batchNumber: varchar("batch_number", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().$type<ProductionOrderStatus>().default("planned"),
  priority: varchar("priority", { length: 20 }).notNull().$type<ProductionOrderPriority>().default("medium"),
  progress: integer("progress").notNull().default(0),
  startDate: timestamp("start_date"),
  dueDate: timestamp("due_date").notNull(),
  completionDate: timestamp("completion_date"),
  responsiblePersonId: integer("responsible_person_id").notNull(),
  notes: text("notes"),
  createdById: integer("created_by_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  organizationId: integer("organization_id").notNull(),
});

// Tabela de Etapas de Produção (Production Steps)
export const productionStepsTable = pgTable("production_steps", {
  id: serial("id").primaryKey(),
  productionOrderId: integer("production_order_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  startDate: timestamp("start_date"),
  completionDate: timestamp("completion_date"),
  duration: integer("duration").default(0),
  responsiblePersonId: integer("responsible_person_id").notNull(),
  notes: text("notes"),
  sortOrder: integer("sort_order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela de Materiais de Produção (Production Materials)
export const productionMaterialsTable = pgTable("production_materials", {
  id: serial("id").primaryKey(),
  productionOrderId: integer("production_order_id").notNull(),
  inventoryId: integer("inventory_id").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 20 }).notNull(),
  allocated: boolean("allocated").notNull().default(false),
  movementId: integer("movement_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela de Descartes (Disposals)
export const disposalsTable = pgTable("disposals", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  inventoryId: integer("inventory_id").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 20 }).notNull(),
  dateRequested: timestamp("date_requested").notNull().defaultNow(),
  dateProcessed: timestamp("date_processed"),
  reason: varchar("reason", { length: 50 }).notNull().$type<DisposalReason>(),
  details: text("details").notNull(),
  method: varchar("method", { length: 50 }).notNull().$type<DisposalMethod>(),
  status: varchar("status", { length: 20 }).notNull().$type<DisposalStatus>().default("pending"),
  requestedById: integer("requested_by_id").notNull(),
  approvedById: integer("approved_by_id"),
  processedById: integer("processed_by_id"),
  location: varchar("location", { length: 255 }).notNull(),
  disposalCertificate: varchar("disposal_certificate", { length: 100 }),
  images: jsonb("images").default([]),
  cost: numeric("cost", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  organizationId: integer("organization_id").notNull(),
});

// Tabela de Trilha de Auditoria (Audit Trail)
export const auditTrailTable = pgTable("audit_trail", {
  id: uuid("id").primaryKey().defaultRandom(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  type: varchar("type", { length: 50 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  entity: varchar("entity", { length: 50 }).notNull(),
  entityId: varchar("entity_id", { length: 255 }).notNull(),
  entityName: varchar("entity_name", { length: 255 }).notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  details: text("details"),
  userId: integer("user_id").notNull(),
  username: varchar("username", { length: 100 }).notNull(),
  userIp: varchar("user_ip", { length: 50 }).notNull(),
  changes: jsonb("changes"),
  relatedBatch: varchar("related_batch", { length: 50 }),
  relatedIds: jsonb("related_ids"),
  organizationId: integer("organization_id").notNull(),
});

// Tabela de Produtos (Products)
export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  sku: varchar("sku", { length: 50 }).notNull().unique(),
  barcode: varchar("barcode", { length: 50 }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  isVisible: boolean("is_visible").notNull().default(true),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  cost: numeric("cost", { precision: 10, scale: 2 }).notNull(),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).notNull(),
  weight: numeric("weight", { precision: 10, scale: 2 }).notNull(),
  dimensions: jsonb("dimensions").notNull(),
  ingredients: jsonb("ingredients").notNull(),
  cannabinoids: jsonb("cannabinoids").notNull(),
  images: jsonb("images").default([]),
  features: jsonb("features").default([]),
  variants: jsonb("variants").default([]),
  documents: jsonb("documents").default([]),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  organizationId: integer("organization_id").notNull(),
});

// Definir relações
export const inventoryRelations = relations(inventoryTable, ({ many }) => ({
  movements: many(movementsTable),
  disposals: many(disposalsTable),
  productionMaterials: many(productionMaterialsTable),
}));

export const movementsRelations = relations(movementsTable, ({ one, many }) => ({
  inventory: one(inventoryTable, {
    fields: [movementsTable.itemId],
    references: [inventoryTable.id],
  }),
  productionMaterials: many(productionMaterialsTable),
}));

export const productionOrdersRelations = relations(productionOrdersTable, ({ one, many }) => ({
  product: one(productsTable, {
    fields: [productionOrdersTable.productId],
    references: [productsTable.id],
  }),
  steps: many(productionStepsTable),
  materials: many(productionMaterialsTable),
}));

export const productionStepsRelations = relations(productionStepsTable, ({ one }) => ({
  productionOrder: one(productionOrdersTable, {
    fields: [productionStepsTable.productionOrderId],
    references: [productionOrdersTable.id],
  }),
}));

export const productionMaterialsRelations = relations(productionMaterialsTable, ({ one }) => ({
  productionOrder: one(productionOrdersTable, {
    fields: [productionMaterialsTable.productionOrderId],
    references: [productionOrdersTable.id],
  }),
  inventory: one(inventoryTable, {
    fields: [productionMaterialsTable.inventoryId],
    references: [inventoryTable.id],
  }),
  movement: one(movementsTable, {
    fields: [productionMaterialsTable.movementId],
    references: [movementsTable.id],
  }),
}));

export const disposalsRelations = relations(disposalsTable, ({ one }) => ({
  inventory: one(inventoryTable, {
    fields: [disposalsTable.inventoryId],
    references: [inventoryTable.id],
  }),
}));

// Schemas para validação e inserção
export const insertInventorySchema = createInsertSchema(inventoryTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMovementSchema = createInsertSchema(movementsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  processedAt: true,
});

export const insertProductionOrderSchema = createInsertSchema(productionOrdersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completionDate: true,
  progress: true,
});

export const insertProductionStepSchema = createInsertSchema(productionStepsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completionDate: true,
});

export const insertProductionMaterialSchema = createInsertSchema(productionMaterialsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDisposalSchema = createInsertSchema(disposalsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  dateProcessed: true,
  approvedById: true,
  processedById: true,
  disposalCertificate: true,
  cost: true,
});

export const insertAuditTrailSchema = createInsertSchema(auditTrailTable).omit({
  id: true,
  timestamp: true,
});

export const insertProductSchema = createInsertSchema(productsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Tipos para TypeScript
export type Inventory = typeof inventoryTable.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;

export type Movement = typeof movementsTable.$inferSelect;
export type InsertMovement = z.infer<typeof insertMovementSchema>;

export type ProductionOrder = typeof productionOrdersTable.$inferSelect;
export type InsertProductionOrder = z.infer<typeof insertProductionOrderSchema>;

export type ProductionStep = typeof productionStepsTable.$inferSelect;
export type InsertProductionStep = z.infer<typeof insertProductionStepSchema>;

export type ProductionMaterial = typeof productionMaterialsTable.$inferSelect;
export type InsertProductionMaterial = z.infer<typeof insertProductionMaterialSchema>;

export type Disposal = typeof disposalsTable.$inferSelect;
export type InsertDisposal = z.infer<typeof insertDisposalSchema>;

export type AuditTrail = typeof auditTrailTable.$inferSelect;
export type InsertAuditTrail = z.infer<typeof insertAuditTrailSchema>;

export type Product = typeof productsTable.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

// Schema combinado para exportação
export const productionSchema = {
  inventoryTable,
  movementsTable,
  productionOrdersTable,
  productionStepsTable,
  productionMaterialsTable,
  disposalsTable,
  auditTrailTable,
  productsTable,
  inventoryRelations,
  movementsRelations,
  productionOrdersRelations,
  productionStepsRelations,
  productionMaterialsRelations,
  disposalsRelations,
};