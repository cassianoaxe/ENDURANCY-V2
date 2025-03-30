import { pgTable, text, serial, timestamp, decimal, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define a role enum para os diferentes tipos de usuário
export const roleEnum = pgEnum('role_type', ['admin', 'org_admin', 'doctor', 'patient']);

// Enum para os tipos de módulos disponíveis
export const moduleTypeEnum = pgEnum('module_type', [
  'compras', 
  'cultivo', 
  'producao', 
  'crm', 
  'rh', 
  'juridico', 
  'social', 
  'transparencia', 
  'inteligencia_artificial'
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull().default("patient"),
  name: text("name").notNull().default(""),
  email: text("email").notNull().default(""),
  organizationId: integer("organization_id"),
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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  orgCode: text("org_code").unique(),
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

export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  organizationId: integer("organization_id").notNull(),
  specialization: text("specialization").notNull(),
  crm: text("crm").notNull(),
  bio: text("bio"),
  available: boolean("available").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  organizationId: integer("organization_id").notNull(),
  cpf: text("cpf").notNull(),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  gender: text("gender").notNull(),
  address: text("address"),
  phone: text("phone"),
  emergencyContact: text("emergency_contact"),
  healthInsurance: text("health_insurance"),
  healthInsuranceNumber: text("health_insurance_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").notNull(),
  patientId: integer("patient_id").notNull(),
  date: timestamp("date").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabela de módulos
export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: moduleTypeEnum("type").notNull(),
  description: text("description").notNull(),
  iconName: text("icon_name").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabela de planos para cada módulo
export const modulePlans = pgTable("module_plans", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  billingCycle: text("billing_cycle").notNull(), // 'monthly', 'quarterly', 'yearly'
  features: text("features").array().notNull(),
  maxUsers: integer("max_users").notNull(),
  isPopular: boolean("is_popular").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabela para armazenar os módulos contratados pelas organizações
export const organizationModules = pgTable("organization_modules", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  moduleId: integer("module_id").notNull(),
  planId: integer("plan_id").notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  expiryDate: timestamp("expiry_date"),
  status: text("status").notNull().default("active"), // 'active', 'suspended', 'expired'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  name: true,
  email: true,
  organizationId: true,
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

export const insertDoctorSchema = createInsertSchema(doctors).pick({
  userId: true,
  organizationId: true,
  specialization: true,
  crm: true,
  bio: true,
  available: true,
});

export const insertPatientSchema = createInsertSchema(patients).pick({
  userId: true,
  organizationId: true,
  cpf: true,
  dateOfBirth: true,
  gender: true,
  address: true,
  phone: true,
  emergencyContact: true,
  healthInsurance: true,
  healthInsuranceNumber: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).pick({
  doctorId: true,
  patientId: true,
  date: true,
  status: true,
  notes: true,
});

// Schemas para as novas tabelas
export const insertModuleSchema = createInsertSchema(modules).pick({
  name: true,
  type: true,
  description: true,
  iconName: true,
  isActive: true,
});

export const insertModulePlanSchema = createInsertSchema(modulePlans).pick({
  moduleId: true,
  name: true,
  description: true,
  price: true,
  billingCycle: true,
  features: true,
  maxUsers: true,
  isPopular: true,
  isActive: true,
});

export const insertOrganizationModuleSchema = createInsertSchema(organizationModules).pick({
  organizationId: true,
  moduleId: true,
  planId: true,
  startDate: true,
  expiryDate: true,
  status: true,
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
export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Module = typeof modules.$inferSelect;
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type ModulePlan = typeof modulePlans.$inferSelect;
export type InsertModulePlan = z.infer<typeof insertModulePlanSchema>;
export type OrganizationModule = typeof organizationModules.$inferSelect;
export type InsertOrganizationModule = z.infer<typeof insertOrganizationModuleSchema>;