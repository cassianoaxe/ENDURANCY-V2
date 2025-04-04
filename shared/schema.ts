import { pgTable, text, serial, timestamp, decimal, integer, boolean, pgEnum, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define a role enum para os diferentes tipos de usuário
export const roleEnum = pgEnum('role_type', ['admin', 'org_admin', 'doctor', 'patient', 'manager', 'employee']);

// Enum para o status de convites
export const invitationStatusEnum = pgEnum('invitation_status', ['pending', 'accepted', 'expired']);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull().default("patient"),
  name: text("name").notNull().default(""),
  email: text("email").notNull().default(""),
  organizationId: integer("organization_id"),
  profilePhoto: text("profile_photo"),
  phoneNumber: text("phone_number"),
  bio: text("bio"),
  lastPasswordChange: timestamp("last_password_change"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const planTierEnum = pgEnum('plan_tier', ['free', 'seed', 'grow', 'pro']);

export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  tier: planTierEnum("tier").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  features: text("features").array().notNull(),
  maxRecords: integer("max_records").notNull(), // Limite de registros (pacientes/plantas)
  trialDays: integer("trial_days").default(0), // Dias de teste (15 para freemium)
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
  planId: integer("plan_id").notNull(), // ID do plano contratado
  planTier: planTierEnum("plan_tier").default("free"), // Nível do plano (free, seed, grow, pro)
  status: text("status").notNull(), // 'active', 'pending', 'rejected', 'pending_plan_change'
  requestedPlanId: integer("requested_plan_id"), // ID do plano solicitado em caso de upgrade/downgrade
  recordCount: integer("record_count").default(0), // Contagem de registros (pacientes/plantas)
  planStartDate: timestamp("plan_start_date").defaultNow(), // Data de início do plano
  planExpiryDate: timestamp("plan_expiry_date"), // Data de expiração do trial ou plano
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
  logo: text("logo"), // Caminho para o arquivo de logo
  stripeCustomerId: text("stripe_customer_id"), // ID do cliente no Stripe
  stripeSubscriptionId: text("stripe_subscription_id"), // ID da assinatura no Stripe
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
  isActive: boolean("is_active").default(true), // Se o registro está ativo (conta para limite do plano)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabela para plantas de cannabis
export const plants = pgTable("plants", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  strain: text("strain").notNull(), // Variedade/cepa
  status: text("status").notNull(), // semente, muda, vegetativa, floração, colheita
  plantedDate: timestamp("planted_date").notNull(),
  harvestDate: timestamp("harvest_date"),
  location: text("location").notNull(), // Local de cultivo (indoor, outdoor, estufa)
  thcContent: decimal("thc_content", { precision: 5, scale: 2 }),
  cbdContent: decimal("cbd_content", { precision: 5, scale: 2 }),
  notes: text("notes"),
  batchId: text("batch_id"), // Lote
  isActive: boolean("is_active").default(true), // Se o registro está ativo (conta para limite do plano)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  'onboarding', 'analytics', 'dashboard', 'associados', 'vendas', 'financeiro', 'complypay', // Módulos básicos
  'cultivo', 'producao', // Módulos de planos mais avançados
  'tarefas', 'crm', 'social', 'rh', 'juridico', 'transparencia', 'inteligencia_artificial', 
  'compras', 'dispensario', 'patrimonio', 'comunicacao', 'pesquisa_cientifica', 'educacao_paciente' // Add-ons
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

// Tabela de associação entre planos e módulos
export const planModules = pgTable("plan_modules", {
  id: serial("id").primaryKey(),
  plan_id: integer("plan_id").notNull(),
  module_id: integer("module_id").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Tabela de associação entre organizações e módulos contratados
export const moduleStatusEnum = pgEnum('module_status', ['active', 'pending', 'cancelled']);

// Alterado para refletir a estrutura real do banco de dados (sem coluna module_type)
export const organizationModules = pgTable("organization_modules", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  moduleId: integer("module_id").notNull(),
  name: text("name").notNull().default(""), // nome do módulo para exibição
  planId: integer("plan_id"), // plano contratado para este módulo
  price: decimal("price", { precision: 10, scale: 2 }).notNull().default("99.00"), // preço da assinatura
  status: moduleStatusEnum("status").notNull().default("pending"), // status da ativação do módulo
  active: boolean("active").default(false), // se o módulo está ativo para esta organização
  billingDay: integer("billing_day"), // dia de cobrança da assinatura
  requestDate: timestamp("request_date").defaultNow().notNull(), // data da solicitação
  activationDate: timestamp("activation_date"), // data da ativação
  startDate: timestamp("start_date"),         // data de início do módulo
  expiryDate: timestamp("expiry_date"),       // data de expiração do módulo
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
  profilePhoto: true,
  phoneNumber: true,
  bio: true,
});

export const updateProfileSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  phoneNumber: true,
  bio: true,
  profilePhoto: true,
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "A senha atual é obrigatória"),
  newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(1, "A confirmação de senha é obrigatória"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
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
    planId: true,
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
    logo: true,
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
  isActive: true,
});

export const insertPlantSchema = createInsertSchema(plants).pick({
  organizationId: true,
  strain: true,
  status: true,
  plantedDate: true,
  harvestDate: true,
  location: true,
  thcContent: true,
  cbdContent: true,
  notes: true,
  batchId: true,
  isActive: true,
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
export type Plant = typeof plants.$inferSelect;
export type InsertPlant = z.infer<typeof insertPlantSchema>;
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
  name: true,
  planId: true,
  price: true,
  status: true,
  active: true,
  billingDay: true,
  requestDate: true,
  activationDate: true,
  startDate: true,
  expiryDate: true,
});

export const insertPlanModuleSchema = createInsertSchema(planModules).pick({
  plan_id: true,
  module_id: true,
});

export type Module = typeof modules.$inferSelect;
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type ModulePlan = typeof modulePlans.$inferSelect;
export type InsertModulePlan = z.infer<typeof insertModulePlanSchema>;
export type OrganizationModule = typeof organizationModules.$inferSelect;
export type InsertOrganizationModule = z.infer<typeof insertOrganizationModuleSchema>;
export type PlanModule = typeof planModules.$inferSelect;
export type InsertPlanModule = z.infer<typeof insertPlanModuleSchema>;

// Enums para o módulo financeiro
export const transactionTypeEnum = pgEnum('transaction_type', ['receita', 'despesa']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pendente', 'pago', 'atrasado', 'cancelado']);
export const employeeStatusEnum = pgEnum('employee_status', ['ativo', 'férias', 'licença', 'desligado']);
export const departmentEnum = pgEnum('department_type', ['desenvolvimento', 'design', 'marketing', 'vendas', 'suporte', 'administrativo', 'rh', 'financeiro', 'diretoria']);
export const vacationStatusEnum = pgEnum('vacation_status', ['pendente', 'aprovada', 'negada', 'cancelada', 'em_andamento', 'concluída']);

// Transações financeiras (contas a pagar e receber)
export const financialTransactions = pgTable("financial_transactions", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  description: text("description").notNull(),
  type: transactionTypeEnum("type").notNull(), // receita ou despesa
  category: text("category").notNull(), // categoria da transação (salários, impostos, vendas, etc)
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: transactionStatusEnum("status").notNull().default("pendente"),
  dueDate: timestamp("due_date").notNull(),
  paymentDate: timestamp("payment_date"),
  documentNumber: text("document_number"), // número da nota fiscal ou documento
  paymentMethod: text("payment_method"), // método de pagamento
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Categorias financeiras
export const financialCategories = pgTable("financial_categories", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  name: text("name").notNull(),
  type: transactionTypeEnum("type").notNull(), // receita ou despesa
  description: text("description"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Centros de custo
export const costCenters = pgTable("cost_centers", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  description: text("description"),
  budget: decimal("budget", { precision: 15, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  parentId: integer("parent_id"), // Para centros de custo hierárquicos
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Colaboradores (funcionários)
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  cpf: text("cpf").notNull(),
  position: text("position").notNull(), // cargo
  department: departmentEnum("department").notNull(),
  salaryBase: decimal("salary_base", { precision: 10, scale: 2 }).notNull(),
  hireDate: timestamp("hire_date").notNull(),
  birthDate: timestamp("birth_date").notNull(),
  status: employeeStatusEnum("status").notNull().default("ativo"),
  address: text("address"),
  phone: text("phone"),
  bankName: text("bank_name"),
  bankBranch: text("bank_branch"),
  bankAccount: text("bank_account"),
  pixKey: text("pix_key"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Folha de pagamento
export const payroll = pgTable("payroll", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  employeeId: integer("employee_id").notNull(),
  month: integer("month").notNull(), // mês de referência
  year: integer("year").notNull(), // ano de referência
  baseSalary: decimal("base_salary", { precision: 10, scale: 2 }).notNull(),
  benefits: decimal("benefits", { precision: 10, scale: 2 }).default("0"),
  bonuses: decimal("bonuses", { precision: 10, scale: 2 }).default("0"),
  inssDiscount: decimal("inss_discount", { precision: 10, scale: 2 }).default("0"),
  irrfDiscount: decimal("irrf_discount", { precision: 10, scale: 2 }).default("0"),
  otherDiscounts: decimal("other_discounts", { precision: 10, scale: 2 }).default("0"),
  netSalary: decimal("net_salary", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date"),
  status: transactionStatusEnum("status").notNull().default("pendente"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Controle de férias
export const vacations = pgTable("vacations", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  employeeId: integer("employee_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalDays: integer("total_days").notNull(),
  periodStart: timestamp("period_start").notNull(), // início do período aquisitivo
  periodEnd: timestamp("period_end").notNull(), // fim do período aquisitivo
  requestDate: timestamp("request_date").defaultNow().notNull(),
  approvedBy: integer("approved_by"), // ID do usuário que aprovou
  approvalDate: timestamp("approval_date"),
  status: vacationStatusEnum("status").notNull().default("pendente"),
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// DRE - Demonstração do Resultado do Exercício
export const financialReports = pgTable("financial_reports", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  type: text("type").notNull(), // 'dre', 'balanco', etc
  month: integer("month"),
  year: integer("year").notNull(),
  quarter: integer("quarter"),
  revenue: decimal("revenue", { precision: 15, scale: 2 }).notNull(),
  cogs: decimal("cogs", { precision: 15, scale: 2 }).notNull(), // custo dos serviços prestados
  grossProfit: decimal("gross_profit", { precision: 15, scale: 2 }).notNull(),
  operatingExpenses: decimal("operating_expenses", { precision: 15, scale: 2 }).notNull(),
  ebitda: decimal("ebitda", { precision: 15, scale: 2 }).notNull(),
  depreciation: decimal("depreciation", { precision: 15, scale: 2 }).default("0"),
  ebit: decimal("ebit", { precision: 15, scale: 2 }).notNull(),
  financialExpenses: decimal("financial_expenses", { precision: 15, scale: 2 }).default("0"),
  financialRevenue: decimal("financial_revenue", { precision: 15, scale: 2 }).default("0"),
  profitBeforeTax: decimal("profit_before_tax", { precision: 15, scale: 2 }).notNull(),
  incomeTax: decimal("income_tax", { precision: 15, scale: 2 }).default("0"),
  netProfit: decimal("net_profit", { precision: 15, scale: 2 }).notNull(),
  notes: text("notes"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schemas de inserção para os novos modelos
export const insertFinancialTransactionSchema = createInsertSchema(financialTransactions).pick({
  organizationId: true,
  description: true,
  type: true,
  category: true,
  amount: true,
  status: true,
  dueDate: true,
  paymentDate: true,
  documentNumber: true,
  paymentMethod: true,
  notes: true,
});

export const insertFinancialCategorySchema = createInsertSchema(financialCategories).pick({
  organizationId: true,
  name: true,
  type: true,
  description: true,
  isDefault: true,
});

export const insertCostCenterSchema = createInsertSchema(costCenters).pick({
  organizationId: true,
  name: true,
  code: true,
  description: true,
  budget: true,
  isActive: true,
  parentId: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).pick({
  organizationId: true,
  name: true,
  email: true,
  cpf: true,
  position: true,
  department: true,
  salaryBase: true,
  hireDate: true,
  birthDate: true,
  status: true,
  address: true,
  phone: true,
  bankName: true,
  bankBranch: true,
  bankAccount: true,
  pixKey: true,
});

export const insertPayrollSchema = createInsertSchema(payroll).pick({
  organizationId: true,
  employeeId: true,
  month: true,
  year: true,
  baseSalary: true,
  benefits: true,
  bonuses: true,
  inssDiscount: true,
  irrfDiscount: true,
  otherDiscounts: true,
  netSalary: true,
  paymentDate: true,
  status: true,
  notes: true,
});

export const insertVacationSchema = createInsertSchema(vacations).pick({
  organizationId: true,
  employeeId: true,
  startDate: true,
  endDate: true,
  totalDays: true,
  periodStart: true,
  periodEnd: true,
  requestDate: true,
  approvedBy: true,
  approvalDate: true,
  status: true,
  paymentAmount: true,
  notes: true,
});

export const insertFinancialReportSchema = createInsertSchema(financialReports).pick({
  organizationId: true,
  type: true,
  month: true,
  year: true,
  quarter: true,
  revenue: true,
  cogs: true,
  grossProfit: true,
  operatingExpenses: true,
  ebitda: true,
  depreciation: true,
  ebit: true,
  financialExpenses: true,
  financialRevenue: true,
  profitBeforeTax: true,
  incomeTax: true,
  netProfit: true,
  notes: true,
});

// Tipos para o módulo financeiro
export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type InsertFinancialTransaction = z.infer<typeof insertFinancialTransactionSchema>;
export type FinancialCategory = typeof financialCategories.$inferSelect;
export type InsertFinancialCategory = z.infer<typeof insertFinancialCategorySchema>;
export type CostCenter = typeof costCenters.$inferSelect;
export type InsertCostCenter = z.infer<typeof insertCostCenterSchema>;
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Payroll = typeof payroll.$inferSelect;
export type InsertPayroll = z.infer<typeof insertPayrollSchema>;
export type Vacation = typeof vacations.$inferSelect;
export type InsertVacation = z.infer<typeof insertVacationSchema>;
export type FinancialReport = typeof financialReports.$inferSelect;
export type InsertFinancialReport = z.infer<typeof insertFinancialReportSchema>;

// Enums para o sistema de tickets de suporte
export const ticketStatusEnum = pgEnum('ticket_status', [
  'novo', 'em_analise', 'em_desenvolvimento', 'aguardando_resposta', 'resolvido', 'fechado', 'cancelado'
]);

export const ticketPriorityEnum = pgEnum('ticket_priority', ['baixa', 'media', 'alta', 'critica']);

export const ticketCategoryEnum = pgEnum('ticket_category', [
  'bug', 'melhoria', 'duvida', 'financeiro', 'acesso', 'seguranca', 'performance', 'desenvolvimento', 'outros'
]);

// Tabela de tickets de suporte
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: ticketStatusEnum("status").notNull().default("novo"),
  priority: ticketPriorityEnum("priority").notNull().default("media"),
  category: ticketCategoryEnum("category").notNull(),
  organizationId: integer("organization_id").notNull(),
  createdById: integer("created_by_id").notNull(),
  assignedToId: integer("assigned_to_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
  closedAt: timestamp("closed_at")
});

// Tabela de comentários em tickets
export const ticketComments = pgTable("ticket_comments", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  isInternal: boolean("is_internal").default(false), // Se true, só visível para admins
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Tabela de anexos em tickets
export const ticketAttachments = pgTable("ticket_attachments", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull(),
  commentId: integer("comment_id"),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(), // tamanho em bytes
  uploadedById: integer("uploaded_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Schemas para inserção
export const insertSupportTicketSchema = createInsertSchema(supportTickets).pick({
  title: true, 
  description: true,
  status: true,
  priority: true,
  category: true,
  organizationId: true,
  createdById: true,
  assignedToId: true
});

export const insertTicketCommentSchema = createInsertSchema(ticketComments).pick({
  ticketId: true,
  userId: true,
  content: true,
  isInternal: true
});

export const insertTicketAttachmentSchema = createInsertSchema(ticketAttachments).pick({
  ticketId: true,
  commentId: true,
  fileName: true,
  fileType: true,
  filePath: true,
  fileSize: true,
  uploadedById: true
});

// Tipos para o sistema de tickets
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type TicketComment = typeof ticketComments.$inferSelect;
export type InsertTicketComment = z.infer<typeof insertTicketCommentSchema>;
export type TicketAttachment = typeof ticketAttachments.$inferSelect;
export type InsertTicketAttachment = z.infer<typeof insertTicketAttachmentSchema>;

// Enums para o sistema de notificações
export const notificationTypeEnum = pgEnum('notification_type', ['info', 'warning', 'success', 'error']);

// Tabela de notificações
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: notificationTypeEnum("type").notNull().default("info"),
  userId: integer("user_id"),
  isRead: boolean("is_read").default(false),
  ticketId: integer("ticket_id"),
  organizationId: integer("organization_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schema para inserção de notificações
export const insertNotificationSchema = createInsertSchema(notifications).pick({
  title: true,
  message: true,
  type: true,
  userId: true,
  isRead: true,
  ticketId: true,
  organizationId: true
});

// Tipos para o sistema de notificações
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Enum para definir o status do produto
export const productStatusEnum = pgEnum('product_status', ['ativo', 'inativo', 'em_falta', 'descontinuado']);

// Tabela de produtos
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  sku: text("sku").notNull(),
  barcode: text("barcode"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }),
  stock: integer("stock").default(0),
  minStock: integer("min_stock").default(0),
  category: text("category"),
  brand: text("brand"),
  supplier: text("supplier"),
  weight: decimal("weight", { precision: 10, scale: 3 }),
  dimensions: text("dimensions"),
  imageUrl: text("image_url"),
  hasVariants: boolean("has_variants").default(false),
  status: productStatusEnum("status").default("ativo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema para inserção de produtos
export const insertProductSchema = createInsertSchema(products).pick({
  organizationId: true,
  name: true, 
  description: true,
  sku: true,
  barcode: true,
  price: true,
  cost: true,
  taxRate: true,
  stock: true,
  minStock: true,
  category: true,
  brand: true,
  supplier: true,
  weight: true,
  dimensions: true,
  imageUrl: true,
  hasVariants: true,
  status: true
});

// Tipos para o sistema de produtos
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

// Enum para tipo de conta no plano de contas
export const accountTypeEnum = pgEnum('account_type', ['ativo', 'passivo', 'receita', 'despesa', 'patrimonio']);

// Tabela de plano de contas
export const chartOfAccounts = pgTable("chart_of_accounts", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  code: text("code").notNull(), // Código da conta (ex: 1.1.01.001)
  name: text("name").notNull(),
  description: text("description"),
  type: accountTypeEnum("type").notNull(), // Tipo da conta (ativo, passivo, receita, despesa, patrimônio)
  parentId: integer("parent_id"), // ID da conta pai (para contas hierárquicas)
  isActive: boolean("is_active").default(true),
  level: integer("level").notNull(), // Nível hierárquico (1, 2, 3, etc)
  isAnalytical: boolean("is_analytical").default(false), // Se é uma conta analítica (pode receber lançamentos)
  additionalData: json("additional_data"), // Dados adicionais específicos de cada organização
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema para inserção no plano de contas
export const insertChartOfAccountsSchema = createInsertSchema(chartOfAccounts).pick({
  organizationId: true,
  code: true,
  name: true,
  description: true,
  type: true,
  parentId: true,
  isActive: true,
  level: true,
  isAnalytical: true,
  additionalData: true
});

// Tipos para o sistema de plano de contas
export type ChartOfAccount = typeof chartOfAccounts.$inferSelect;
export type InsertChartOfAccount = z.infer<typeof insertChartOfAccountsSchema>;

// Enums para grupos de usuários e permissões
export const permissionTypeEnum = pgEnum('permission_type', [
  'view', 'edit', 'create', 'delete', 'approve', 'full_access'
]);

// Tabela de grupos de usuários (templates de permissão)
export const userGroups = pgTable("user_groups", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de permissões por grupo
export const groupPermissions = pgTable("group_permissions", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  moduleId: integer("module_id").notNull(),
  permissionType: permissionTypeEnum("permission_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabela para associar usuários a grupos
export const userGroupMemberships = pgTable("user_group_memberships", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  groupId: integer("group_id").notNull(),
  assignedBy: integer("assigned_by").notNull(), // ID do usuário que atribuiu o grupo
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
});

// Tabelas para convites de usuários
export const userInvitations = pgTable("user_invitations", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  email: text("email").notNull(),
  role: roleEnum("role").notNull(),
  groupId: integer("group_id"), // Grupo ao qual o usuário será associado (opcional)
  invitedBy: integer("invited_by").notNull(), // ID do usuário que enviou o convite
  token: text("token").notNull().unique(), // Token único para o convite
  status: text("status").notNull().default("pending"), // pending, accepted, expired
  expiresAt: timestamp("expires_at").notNull(), // Data de expiração do convite
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schemas para inserção
export const insertUserGroupSchema = createInsertSchema(userGroups).pick({
  organizationId: true,
  name: true,
  description: true,
  isDefault: true,
});

export const insertGroupPermissionSchema = createInsertSchema(groupPermissions).pick({
  groupId: true,
  moduleId: true,
  permissionType: true,
});

export const insertUserGroupMembershipSchema = createInsertSchema(userGroupMemberships).pick({
  userId: true,
  groupId: true,
  assignedBy: true,
});

export const insertUserInvitationSchema = createInsertSchema(userInvitations).pick({
  organizationId: true,
  email: true,
  role: true,
  groupId: true,
  invitedBy: true,
  token: true,
  status: true,
  expiresAt: true,
});

// Tipos para grupos e permissões
export type UserGroup = typeof userGroups.$inferSelect;
export type InsertUserGroup = z.infer<typeof insertUserGroupSchema>;
export type GroupPermission = typeof groupPermissions.$inferSelect;
export type InsertGroupPermission = z.infer<typeof insertGroupPermissionSchema>;
export type UserGroupMembership = typeof userGroupMemberships.$inferSelect;
export type InsertUserGroupMembership = z.infer<typeof insertUserGroupMembershipSchema>;
export type UserInvitation = typeof userInvitations.$inferSelect;
export type InsertUserInvitation = z.infer<typeof insertUserInvitationSchema>;