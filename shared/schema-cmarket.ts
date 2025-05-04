import { pgTable, serial, text, timestamp, integer, real, boolean, varchar, date, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users, organizations } from "./schema";

// Categorias de produtos no CMarket
export const cmarketCategoriesTable = pgTable('cmarket_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  icon: varchar('icon', { length: 50 }),
  parentId: integer('parent_id').references(() => cmarketCategoriesTable.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Tabela de produtos no CMarket
export const cmarketProductsTable = pgTable('cmarket_products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: real('price').notNull(),
  originalPrice: real('original_price'),
  discount: real('discount'),
  stock: integer('stock').default(0),
  sku: varchar('sku', { length: 50 }),
  images: json('images').$type<string[]>(),
  categoryId: integer('category_id').references(() => cmarketCategoriesTable.id),
  sellerId: integer('seller_id').notNull().references(() => users.id),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  featured: boolean('featured').default(false),
  condition: varchar('condition', { length: 20 }).notNull().default('new'),
  weight: real('weight'),
  dimensions: json('dimensions').$type<{length: number, width: number, height: number}>(),
  specifications: json('specifications').$type<Record<string, string>>(),
  minOrderQuantity: integer('min_order_quantity').default(1),
  shippingTime: varchar('shipping_time', { length: 50 }),
  returnPolicy: text('return_policy'),
  warrantyInfo: text('warranty_info'),
  viewCount: integer('view_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Editais de compra no CMarket
export const cmarketAnnouncementsTable = pgTable('cmarket_announcements', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  details: text('details'),
  requirements: text('requirements'),
  budget: real('budget'),
  deadline: date('deadline'),
  status: varchar('status', { length: 20 }).notNull().default('open'),
  categoryId: integer('category_id').references(() => cmarketCategoriesTable.id),
  creatorId: integer('creator_id').notNull().references(() => users.id),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  attachments: json('attachments').$type<string[]>(),
  quantity: integer('quantity'),
  unit: varchar('unit', { length: 20 }),
  deliveryLocation: varchar('delivery_location', { length: 255 }),
  deliveryDeadline: date('delivery_deadline'),
  technicalRequirements: text('technical_requirements'),
  qualificationRequirements: text('qualification_requirements'),
  selectionCriteria: json('selection_criteria').$type<{price: number, quality: number, deadline: number, other: number}>(),
  viewCount: integer('view_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  expirationDate: date('expiration_date')
});

// Propostas para os editais no CMarket
export const cmarketProposalsTable = pgTable('cmarket_proposals', {
  id: serial('id').primaryKey(),
  announcementId: integer('announcement_id').notNull().references(() => cmarketAnnouncementsTable.id),
  vendorId: integer('vendor_id').notNull().references(() => users.id),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  price: real('price').notNull(),
  description: text('description'),
  deliveryTime: integer('delivery_time'),
  attachments: json('attachments').$type<string[]>(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  termsAccepted: boolean('terms_accepted').notNull().default(false),
  message: text('message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Carrinho de compras
export const cmarketCartTable = pgTable('cmarket_cart', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Itens do carrinho
export const cmarketCartItemsTable = pgTable('cmarket_cart_items', {
  id: serial('id').primaryKey(),
  cartId: integer('cart_id').notNull().references(() => cmarketCartTable.id),
  productId: integer('product_id').notNull().references(() => cmarketProductsTable.id),
  quantity: integer('quantity').notNull().default(1),
  price: real('price').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Pedidos no CMarket
export const cmarketOrdersTable = pgTable('cmarket_orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  totalAmount: real('total_amount').notNull(),
  shippingAddress: text('shipping_address'),
  shippingMethod: varchar('shipping_method', { length: 50 }),
  shippingCost: real('shipping_cost'),
  paymentMethod: varchar('payment_method', { length: 50 }),
  paymentStatus: varchar('payment_status', { length: 20 }).notNull().default('pending'),
  notes: text('notes'),
  invoiceId: varchar('invoice_id', { length: 100 }),
  trackingNumber: varchar('tracking_number', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Itens do pedido
export const cmarketOrderItemsTable = pgTable('cmarket_order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => cmarketOrdersTable.id),
  productId: integer('product_id').notNull().references(() => cmarketProductsTable.id),
  quantity: integer('quantity').notNull(),
  price: real('price').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Avaliações de produtos
export const cmarketProductReviewsTable = pgTable('cmarket_product_reviews', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => cmarketProductsTable.id),
  userId: integer('user_id').notNull().references(() => users.id),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Avaliações de vendedores
export const cmarketVendorReviewsTable = pgTable('cmarket_vendor_reviews', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').notNull().references(() => users.id),
  reviewerId: integer('reviewer_id').notNull().references(() => users.id),
  orderId: integer('order_id').references(() => cmarketOrdersTable.id),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Mensagens trocadas entre comprador e vendedor
export const cmarketMessagesTable = pgTable('cmarket_messages', {
  id: serial('id').primaryKey(),
  senderId: integer('sender_id').notNull().references(() => users.id),
  receiverId: integer('receiver_id').notNull().references(() => users.id),
  productId: integer('product_id').references(() => cmarketProductsTable.id),
  announcementId: integer('announcement_id').references(() => cmarketAnnouncementsTable.id),
  proposalId: integer('proposal_id').references(() => cmarketProposalsTable.id),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Definição das relações entre as tabelas
export const cmarketCategoriesRelations = relations(cmarketCategoriesTable, ({ one, many }) => ({
  parent: one(cmarketCategoriesTable, {
    fields: [cmarketCategoriesTable.parentId],
    references: [cmarketCategoriesTable.id],
  }),
  subcategories: many(cmarketCategoriesTable),
  products: many(cmarketProductsTable),
  announcements: many(cmarketAnnouncementsTable),
}));

export const cmarketProductsRelations = relations(cmarketProductsTable, ({ one, many }) => ({
  category: one(cmarketCategoriesTable, {
    fields: [cmarketProductsTable.categoryId],
    references: [cmarketCategoriesTable.id],
  }),
  seller: one(users, {
    fields: [cmarketProductsTable.sellerId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [cmarketProductsTable.organizationId],
    references: [organizations.id],
  }),
  cartItems: many(cmarketCartItemsTable),
  orderItems: many(cmarketOrderItemsTable),
  reviews: many(cmarketProductReviewsTable),
  messages: many(cmarketMessagesTable),
}));

export const cmarketAnnouncementsRelations = relations(cmarketAnnouncementsTable, ({ one, many }) => ({
  category: one(cmarketCategoriesTable, {
    fields: [cmarketAnnouncementsTable.categoryId],
    references: [cmarketCategoriesTable.id],
  }),
  creator: one(users, {
    fields: [cmarketAnnouncementsTable.creatorId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [cmarketAnnouncementsTable.organizationId],
    references: [organizations.id],
  }),
  proposals: many(cmarketProposalsTable),
  messages: many(cmarketMessagesTable),
}));

export const cmarketProposalsRelations = relations(cmarketProposalsTable, ({ one, many }) => ({
  announcement: one(cmarketAnnouncementsTable, {
    fields: [cmarketProposalsTable.announcementId],
    references: [cmarketAnnouncementsTable.id],
  }),
  vendor: one(users, {
    fields: [cmarketProposalsTable.vendorId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [cmarketProposalsTable.organizationId],
    references: [organizations.id],
  }),
  messages: many(cmarketMessagesTable),
}));

export const cmarketCartRelations = relations(cmarketCartTable, ({ one, many }) => ({
  user: one(users, {
    fields: [cmarketCartTable.userId],
    references: [users.id],
  }),
  items: many(cmarketCartItemsTable),
}));

export const cmarketCartItemsRelations = relations(cmarketCartItemsTable, ({ one }) => ({
  cart: one(cmarketCartTable, {
    fields: [cmarketCartItemsTable.cartId],
    references: [cmarketCartTable.id],
  }),
  product: one(cmarketProductsTable, {
    fields: [cmarketCartItemsTable.productId],
    references: [cmarketProductsTable.id],
  }),
}));

export const cmarketOrdersRelations = relations(cmarketOrdersTable, ({ one, many }) => ({
  user: one(users, {
    fields: [cmarketOrdersTable.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [cmarketOrdersTable.organizationId],
    references: [organizations.id],
  }),
  items: many(cmarketOrderItemsTable),
  vendorReviews: many(cmarketVendorReviewsTable),
}));

export const cmarketOrderItemsRelations = relations(cmarketOrderItemsTable, ({ one }) => ({
  order: one(cmarketOrdersTable, {
    fields: [cmarketOrderItemsTable.orderId],
    references: [cmarketOrdersTable.id],
  }),
  product: one(cmarketProductsTable, {
    fields: [cmarketOrderItemsTable.productId],
    references: [cmarketProductsTable.id],
  }),
}));

export const cmarketProductReviewsRelations = relations(cmarketProductReviewsTable, ({ one }) => ({
  product: one(cmarketProductsTable, {
    fields: [cmarketProductReviewsTable.productId],
    references: [cmarketProductsTable.id],
  }),
  user: one(users, {
    fields: [cmarketProductReviewsTable.userId],
    references: [users.id],
  }),
}));

export const cmarketVendorReviewsRelations = relations(cmarketVendorReviewsTable, ({ one }) => ({
  vendor: one(users, {
    fields: [cmarketVendorReviewsTable.vendorId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [cmarketVendorReviewsTable.reviewerId],
    references: [users.id],
  }),
  order: one(cmarketOrdersTable, {
    fields: [cmarketVendorReviewsTable.orderId],
    references: [cmarketOrdersTable.id],
  }),
}));

export const cmarketMessagesRelations = relations(cmarketMessagesTable, ({ one }) => ({
  sender: one(users, {
    fields: [cmarketMessagesTable.senderId],
    references: [users.id],
  }),
  receiver: one(users, {
    fields: [cmarketMessagesTable.receiverId],
    references: [users.id],
  }),
  product: one(cmarketProductsTable, {
    fields: [cmarketMessagesTable.productId],
    references: [cmarketProductsTable.id],
  }),
  announcement: one(cmarketAnnouncementsTable, {
    fields: [cmarketMessagesTable.announcementId],
    references: [cmarketAnnouncementsTable.id],
  }),
  proposal: one(cmarketProposalsTable, {
    fields: [cmarketMessagesTable.proposalId],
    references: [cmarketProposalsTable.id],
  }),
}));

// Schemas Zod para validação
export const insertCmarketCategorySchema = createInsertSchema(cmarketCategoriesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const selectCmarketCategorySchema = createSelectSchema(cmarketCategoriesTable);
export type CmarketCategory = z.infer<typeof selectCmarketCategorySchema>;
export type InsertCmarketCategory = z.infer<typeof insertCmarketCategorySchema>;

export const insertCmarketProductSchema = createInsertSchema(cmarketProductsTable).omit({ id: true, createdAt: true, updatedAt: true, viewCount: true });
export const selectCmarketProductSchema = createSelectSchema(cmarketProductsTable);
export type CmarketProduct = z.infer<typeof selectCmarketProductSchema>;
export type InsertCmarketProduct = z.infer<typeof insertCmarketProductSchema>;

export const insertCmarketAnnouncementSchema = createInsertSchema(cmarketAnnouncementsTable).omit({ id: true, createdAt: true, updatedAt: true, viewCount: true });
export const selectCmarketAnnouncementSchema = createSelectSchema(cmarketAnnouncementsTable);
export type CmarketAnnouncement = z.infer<typeof selectCmarketAnnouncementSchema>;
export type InsertCmarketAnnouncement = z.infer<typeof insertCmarketAnnouncementSchema>;

export const insertCmarketProposalSchema = createInsertSchema(cmarketProposalsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const selectCmarketProposalSchema = createSelectSchema(cmarketProposalsTable);
export type CmarketProposal = z.infer<typeof selectCmarketProposalSchema>;
export type InsertCmarketProposal = z.infer<typeof insertCmarketProposalSchema>;

export const insertCmarketCartSchema = createInsertSchema(cmarketCartTable).omit({ id: true, createdAt: true, updatedAt: true });
export const selectCmarketCartSchema = createSelectSchema(cmarketCartTable);
export type CmarketCart = z.infer<typeof selectCmarketCartSchema>;
export type InsertCmarketCart = z.infer<typeof insertCmarketCartSchema>;

export const insertCmarketCartItemSchema = createInsertSchema(cmarketCartItemsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const selectCmarketCartItemSchema = createSelectSchema(cmarketCartItemsTable);
export type CmarketCartItem = z.infer<typeof selectCmarketCartItemSchema>;
export type InsertCmarketCartItem = z.infer<typeof insertCmarketCartItemSchema>;

export const insertCmarketOrderSchema = createInsertSchema(cmarketOrdersTable).omit({ id: true, createdAt: true, updatedAt: true });
export const selectCmarketOrderSchema = createSelectSchema(cmarketOrdersTable);
export type CmarketOrder = z.infer<typeof selectCmarketOrderSchema>;
export type InsertCmarketOrder = z.infer<typeof insertCmarketOrderSchema>;

export const insertCmarketOrderItemSchema = createInsertSchema(cmarketOrderItemsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const selectCmarketOrderItemSchema = createSelectSchema(cmarketOrderItemsTable);
export type CmarketOrderItem = z.infer<typeof selectCmarketOrderItemSchema>;
export type InsertCmarketOrderItem = z.infer<typeof insertCmarketOrderItemSchema>;

export const insertCmarketProductReviewSchema = createInsertSchema(cmarketProductReviewsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const selectCmarketProductReviewSchema = createSelectSchema(cmarketProductReviewsTable);
export type CmarketProductReview = z.infer<typeof selectCmarketProductReviewSchema>;
export type InsertCmarketProductReview = z.infer<typeof insertCmarketProductReviewSchema>;

export const insertCmarketVendorReviewSchema = createInsertSchema(cmarketVendorReviewsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const selectCmarketVendorReviewSchema = createSelectSchema(cmarketVendorReviewsTable);
export type CmarketVendorReview = z.infer<typeof selectCmarketVendorReviewSchema>;
export type InsertCmarketVendorReview = z.infer<typeof insertCmarketVendorReviewSchema>;

export const insertCmarketMessageSchema = createInsertSchema(cmarketMessagesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const selectCmarketMessageSchema = createSelectSchema(cmarketMessagesTable);
export type CmarketMessage = z.infer<typeof selectCmarketMessageSchema>;
export type InsertCmarketMessage = z.infer<typeof insertCmarketMessageSchema>;