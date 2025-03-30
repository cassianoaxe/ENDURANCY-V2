import { pgTable, text, serial, timestamp, decimal, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define a role enum para os diferentes tipos de usuário
export const roleEnum = pgEnum('role_type', ['admin', 'org_admin', 'doctor', 'patient']);

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
  isModulePlan: boolean("is_module_plan").default(false), // Indica se o plano está associado a um módulo específico
  moduleId: integer("module_id"), // Referência ao módulo (apenas se for um plano de módulo)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// Define o enum para tipos de módulos
export const moduleTypeEnum = pgEnum('module_type', [
  'compras', 'cultivo', 'producao', 'crm', 'rh', 
  'juridico', 'social', 'transparencia', 'inteligencia_artificial'
]);

// Tabela de módulos disponíveis no sistema
export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon_name: text("icon_name").notNull(), // ícone do módulo
  slug: text("slug").notNull().unique(), // identificador único para o módulo (ex: "compras", "crm")
  is_active: boolean("is_active").default(true), // se o módulo está disponível para contratação
  type: moduleTypeEnum("type").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Tabela de planos específicos para módulos
export const modulePlans = pgTable("module_plans", {
  id: serial("id").primaryKey(),
  module_id: integer("module_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  billing_cycle: text("billing_cycle").notNull().default('monthly'),
  features: text("features").array().notNull(),
  max_users: integer("max_users").notNull().default(5),
  is_popular: boolean("is_popular").default(false),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Tabela de associação entre organizações e módulos contratados
export const organizationModules = pgTable("organization_modules", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  moduleId: integer("module_id").notNull(),
  planId: integer("plan_id"), // plano contratado para este módulo
  active: boolean("active").default(true), // se o módulo está ativo para esta organização
  billingDay: integer("billing_day"), // dia de cobrança da assinatura
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
  isModulePlan: true,
  moduleId: true,
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

export const insertModuleSchema = createInsertSchema(modules).pick({
  name: true,
  description: true,
  icon_name: true,
  slug: true,
  is_active: true,
  type: true,
});

export const insertModulePlanSchema = createInsertSchema(modulePlans).pick({
  module_id: true,
  name: true,
  description: true,
  price: true,
  billing_cycle: true,
  features: true,
  max_users: true,
  is_popular: true,
  is_active: true,
});

export const insertOrganizationModuleSchema = createInsertSchema(organizationModules).pick({
  organizationId: true,
  moduleId: true,
  planId: true,
  active: true,
  billingDay: true,
});

export type Module = typeof modules.$inferSelect;
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type ModulePlan = typeof modulePlans.$inferSelect;
export type InsertModulePlan = z.infer<typeof insertModulePlanSchema>;
export type OrganizationModule = typeof organizationModules.$inferSelect;
export type InsertOrganizationModule = z.infer<typeof insertOrganizationModuleSchema>;