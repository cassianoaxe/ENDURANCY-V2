import { pgTable, text, serial, timestamp, decimal, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  features: text("features").array().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  adminName: text("admin_name").notNull(),
  type: text("type").notNull(), // 'Empresa' or 'Associação'
  cnpj: text("cnpj").notNull(),
  website: text("website").notNull().default(''),
  plan: text("plan").notNull(),
  status: text("status").notNull(), // 'active', 'pending', 'rejected'
  email: text("email").notNull(),
  adminCpf: text("admin_cpf").notNull(),
  password: text("password").notNull(),
  confirmPassword: text("confirm_password").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  bankName: text("bank_name").notNull(),
  bankBranch: text("bank_branch").notNull(),
  bankAccount: text("bank_account").notNull(),
  termsAccepted: boolean("terms_accepted").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const organizationDocuments = pgTable("organization_documents", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  documentType: text("document_type").notNull(), // 'estatuto' or 'contrato_social'
  documentUrl: text("document_url").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  status: text("status").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  items: text("items").array().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  customerName: true,
  status: true,
  total: true,
  items: true,
});

export const insertPlanSchema = createInsertSchema(plans).pick({
  name: true,
  description: true,
  price: true,
  features: true,
});

export const insertOrganizationSchema = createInsertSchema(organizations)
  .pick({
    name: true,
    adminName: true,
    type: true,
    cnpj: true,
    website: true,
    plan: true,
    status: true,
    email: true,
    adminCpf: true,
    password: true,
    confirmPassword: true,
    phone: true,
    address: true,
    city: true,
    state: true,
    bankName: true,
    bankBranch: true,
    bankAccount: true,
    termsAccepted: true,
  })
  .extend({
    // Custom validation to ensure passwords match
    confirmPassword: z.string()
      .min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const insertOrganizationDocumentSchema = createInsertSchema(organizationDocuments).pick({
  organizationId: true,
  documentType: true,
  documentUrl: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Plan = typeof plans.$inferSelect;
export type OrganizationDocument = typeof organizationDocuments.$inferSelect;
export type InsertOrganizationDocument = z.infer<typeof insertOrganizationDocumentSchema>;