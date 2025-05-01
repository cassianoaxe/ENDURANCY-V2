import { pgTable, text, serial, timestamp, decimal, integer, boolean, pgEnum, json, varchar, date, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users, organizations } from "./schema";

// Enum para status de fornecedor
export const supplierStatusEnum = pgEnum('supplier_status', ['pending', 'active', 'suspended', 'inactive']);

// Enum para status de produto
export const productStatusEnum = pgEnum('product_status', ['draft', 'active', 'out_of_stock', 'discontinued']);

// Enum para status de pedido
export const orderStatusEnum = pgEnum('order_status', ['draft', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']);

// Enum para tipo de licitação
export const tenderTypeEnum = pgEnum('tender_type', ['open', 'selective', 'direct']);

// Enum para status de proposta
export const proposalStatusEnum = pgEnum('proposal_status', ['draft', 'submitted', 'under_review', 'accepted', 'rejected', 'cancelled']);

// Tabela de Fornecedores
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  tradingName: text("trading_name"),
  cnpj: text("cnpj").notNull().unique(),
  stateRegistration: text("state_registration"),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  website: text("website"),
  logo: text("logo"),
  status: supplierStatusEnum("status").default("pending"),
  verified: boolean("verified").default(false),
  description: text("description"),
  socialMedia: json("social_media").$type<{
    facebook?: string,
    instagram?: string,
    twitter?: string,
    linkedin?: string
  }>(),
  bankInfo: json("bank_info").$type<{
    bank?: string,
    agency?: string,
    account?: string,
    accountType?: string
  }>(),
  documentationCompleted: boolean("documentation_completed").default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  ratingCount: integer("rating_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

// Relações da tabela de fornecedores
export const suppliersRelations = relations(suppliers, ({ many, one }) => ({
  products: many(products),
  categories: many(supplierCategories),
  documents: many(supplierDocuments),
  users: many(supplierUsers),
  organizationLinks: many(supplierOrganizationLinks),
  creator: one(users, {
    fields: [suppliers.createdBy],
    references: [users.id],
  }),
}));

// Tabela de Usuários do Fornecedor
export const supplierUsers = pgTable("supplier_users", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  userId: integer("user_id").notNull().references(() => users.id),
  role: text("role").notNull().default("member"), // admin, manager, member
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    supplierUserUnique: uniqueIndex("supplier_user_unique").on(table.supplierId, table.userId),
  };
});

// Relações da tabela de usuários do fornecedor
export const supplierUsersRelations = relations(supplierUsers, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierUsers.supplierId],
    references: [suppliers.id],
  }),
  user: one(users, {
    fields: [supplierUsers.userId],
    references: [users.id],
  }),
}));

// Tabela de Categorias de Fornecedor
export const supplierCategories = pgTable("supplier_categories", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relações da tabela de categorias de fornecedor
export const supplierCategoriesRelations = relations(supplierCategories, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierCategories.supplierId],
    references: [suppliers.id],
  }),
}));

// Tabela de Documentos do Fornecedor
export const supplierDocuments = pgTable("supplier_documents", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // contract, certificate, license, tax_document, other
  fileUrl: text("file_url").notNull(),
  description: text("description"),
  expiryDate: date("expiry_date"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  verifiedBy: integer("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
});

// Relações da tabela de documentos do fornecedor
export const supplierDocumentsRelations = relations(supplierDocuments, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierDocuments.supplierId],
    references: [suppliers.id],
  }),
  verifier: one(users, {
    fields: [supplierDocuments.verifiedBy],
    references: [users.id],
  }),
}));

// Tabela de Links Organização-Fornecedor
export const supplierOrganizationLinks = pgTable("supplier_organization_links", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  isPreferred: boolean("is_preferred").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
}, (table) => {
  return {
    supplierOrgUnique: uniqueIndex("supplier_org_unique").on(table.supplierId, table.organizationId),
  };
});

// Relações da tabela de links organização-fornecedor
export const supplierOrganizationLinksRelations = relations(supplierOrganizationLinks, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierOrganizationLinks.supplierId],
    references: [suppliers.id],
  }),
  organization: one(organizations, {
    fields: [supplierOrganizationLinks.organizationId],
    references: [organizations.id],
  }),
  creator: one(users, {
    fields: [supplierOrganizationLinks.createdBy],
    references: [users.id],
  }),
}));

// Tabela de Produtos
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  name: text("name").notNull(),
  sku: text("sku"),
  barcode: text("barcode"),
  description: text("description"),
  shortDescription: text("short_description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0"),
  weight: decimal("weight", { precision: 8, scale: 3 }),
  weightUnit: text("weight_unit").default("g"),
  dimensions: json("dimensions").$type<{
    length?: number,
    width?: number,
    height?: number,
    unit?: string
  }>(),
  inventory: integer("inventory").default(0),
  lowInventoryThreshold: integer("low_inventory_threshold").default(5),
  status: productStatusEnum("status").default("draft"),
  isFeatured: boolean("is_featured").default(false),
  isVirtual: boolean("is_virtual").default(false),
  requiresPrescription: boolean("requires_prescription").default(false),
  tags: text("tags").array(),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

// Relações da tabela de produtos
export const productsRelations = relations(products, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [products.supplierId],
    references: [suppliers.id],
  }),
  images: many(productImages),
  categories: many(productCategoryLinks),
  variants: many(productVariants),
  creator: one(users, {
    fields: [products.createdBy],
    references: [users.id],
  }),
}));

// Tabela de Imagens de Produto
export const productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  url: text("url").notNull(),
  alt: text("alt"),
  position: integer("position").default(0),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relações da tabela de imagens de produto
export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

// Tabela de Categorias de Produto
export const productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  parentId: integer("parent_id").references(() => productCategories.id),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  position: integer("position").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

// Relações da tabela de categorias de produto
export const productCategoriesRelations = relations(productCategories, ({ one, many }) => ({
  parent: one(productCategories, {
    fields: [productCategories.parentId],
    references: [productCategories.id],
  }),
  children: many(productCategories),
  products: many(productCategoryLinks),
  creator: one(users, {
    fields: [productCategories.createdBy],
    references: [users.id],
  }),
}));

// Tabela de Links Produto-Categoria
export const productCategoryLinks = pgTable("product_category_links", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  categoryId: integer("category_id").notNull().references(() => productCategories.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    productCategoryUnique: uniqueIndex("product_category_unique").on(table.productId, table.categoryId),
  };
});

// Relações da tabela de links produto-categoria
export const productCategoryLinksRelations = relations(productCategoryLinks, ({ one }) => ({
  product: one(products, {
    fields: [productCategoryLinks.productId],
    references: [products.id],
  }),
  category: one(productCategories, {
    fields: [productCategoryLinks.categoryId],
    references: [productCategories.id],
  }),
}));

// Tabela de Variantes de Produto
export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  name: text("name").notNull(),
  sku: text("sku"),
  barcode: text("barcode"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
  inventory: integer("inventory").default(0),
  attributes: json("attributes").notNull(),
  imageUrl: text("image_url"),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relações da tabela de variantes de produto
export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));

// Tabela de Licitações
export const tenders = pgTable("tenders", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: tenderTypeEnum("type").default("open"),
  status: text("status").notNull().default("draft"), // draft, open, under_review, awarded, cancelled, completed
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  budget: decimal("budget", { precision: 12, scale: 2 }),
  requirements: text("requirements"),
  attachments: json("attachments"),
  termsAndConditions: text("terms_and_conditions"),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  awardedTo: integer("awarded_to").references(() => suppliers.id),
  awardedAt: timestamp("awarded_at"),
  completedAt: timestamp("completed_at"),
});

// Relações da tabela de licitações
export const tendersRelations = relations(tenders, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [tenders.organizationId],
    references: [organizations.id],
  }),
  proposals: many(tenderProposals),
  creator: one(users, {
    fields: [tenders.createdBy],
    references: [users.id],
  }),
  awardedSupplier: one(suppliers, {
    fields: [tenders.awardedTo],
    references: [suppliers.id],
  }),
}));

// Tabela de Propostas de Licitação
export const tenderProposals = pgTable("tender_proposals", {
  id: serial("id").primaryKey(),
  tenderId: integer("tender_id").notNull().references(() => tenders.id),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  deliveryTime: text("delivery_time"),
  status: proposalStatusEnum("status").default("draft"),
  documents: json("documents"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  submittedAt: timestamp("submitted_at"),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
}, (table) => {
  return {
    tenderSupplierUnique: uniqueIndex("tender_supplier_unique").on(table.tenderId, table.supplierId),
  };
});

// Relações da tabela de propostas de licitação
export const tenderProposalsRelations = relations(tenderProposals, ({ one }) => ({
  tender: one(tenders, {
    fields: [tenderProposals.tenderId],
    references: [tenders.id],
  }),
  supplier: one(suppliers, {
    fields: [tenderProposals.supplierId],
    references: [suppliers.id],
  }),
  reviewer: one(users, {
    fields: [tenderProposals.reviewedBy],
    references: [users.id],
  }),
}));

// Tabela de Pedidos
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  orderNumber: text("order_number").notNull().unique(),
  status: orderStatusEnum("status").default("draft"),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).default("0"),
  shippingAmount: decimal("shipping_amount", { precision: 12, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status").default("pending"), // pending, paid, failed, refunded
  shippingAddress: json("shipping_address"),
  billingAddress: json("billing_address"),
  notes: text("notes"),
  internalNotes: text("internal_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  confirmedAt: timestamp("confirmed_at"),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  cancelledAt: timestamp("cancelled_at"),
  cancelledBy: integer("cancelled_by").references(() => users.id),
  cancelReason: text("cancel_reason"),
  trackingNumber: text("tracking_number"),
  trackingUrl: text("tracking_url"),
  estimatedDeliveryDate: date("estimated_delivery_date"),
});

// Relações da tabela de pedidos
export const ordersRelations = relations(orders, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [orders.organizationId],
    references: [organizations.id],
  }),
  supplier: one(suppliers, {
    fields: [orders.supplierId],
    references: [suppliers.id],
  }),
  items: many(orderItems),
  creator: one(users, {
    fields: [orders.createdBy],
    references: [users.id],
  }),
  canceller: one(users, {
    fields: [orders.cancelledBy],
    references: [users.id],
  }),
}));

// Tabela de Itens de Pedido
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  productId: integer("product_id").notNull().references(() => products.id),
  variantId: integer("variant_id").references(() => productVariants.id),
  name: text("name").notNull(),
  sku: text("sku"),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relações da tabela de itens de pedido
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
}));

// Schemas Zod para validação e inserção

// Schema de Fornecedor
export const insertSupplierSchema = createInsertSchema(suppliers)
  .extend({
    email: z.string().email("Email inválido"),
    cnpj: z.string().min(14, "CNPJ deve ter pelo menos 14 caracteres"),
  });
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

// Schema de Produto
export const insertProductSchema = createInsertSchema(products);
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Schema de Categoria de Produto
export const insertProductCategorySchema = createInsertSchema(productCategories);
export type InsertProductCategory = z.infer<typeof insertProductCategorySchema>;
export type ProductCategory = typeof productCategories.$inferSelect;

// Schema de Licitação
export const insertTenderSchema = createInsertSchema(tenders);
export type InsertTender = z.infer<typeof insertTenderSchema>;
export type Tender = typeof tenders.$inferSelect;

// Schema de Pedido
export const insertOrderSchema = createInsertSchema(orders);
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;