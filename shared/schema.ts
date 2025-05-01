import { pgTable, text, serial, timestamp, decimal, integer, boolean, pgEnum, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import * as patrimonioSchema from './schema-patrimonio';
import * as pesquisaSchema from './schema-pesquisa';
import * as socialSchema from './schema-social';

// Define a role enum para os diferentes tipos de usuário
export const roleEnum = pgEnum('role_type', ['admin', 'org_admin', 'doctor', 'patient', 'manager', 'employee', 'pharmacist', 'laboratory', 'researcher']);

// Enum para o status de licença de farmacêutico
export const pharmacistStatusEnum = pgEnum('pharmacist_status', ['active', 'inactive', 'suspended', 'pending']);

// Enum para o status de convites
export const invitationStatusEnum = pgEnum('invitation_status', ['pending', 'accepted', 'expired']);

// Enum para o status de documentos
export const documentStatusEnum = pgEnum('document_status', ['pending', 'approved', 'rejected']);

// Enum para categorias de documentos
export const documentCategoryEnum = pgEnum('document_category', ['identity', 'medical', 'prescription', 'insurance', 'other']);

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

export const planTierEnum = pgEnum('plan_tier', ['free', 'seed', 'grow', 'pro', 'enterprise']);

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
  plan: text("plan").notNull().default('Básico'), // Nome do plano (texto)
  planId: integer("plan_id").notNull(), // ID do plano contratado
  planTier: planTierEnum("plan_tier").default("free"), // Nível do plano (free, seed, grow, pro)
  planHistory: json("plan_history").default('[]'), // Histórico de alterações de plano
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
  patientPortalUrl: text("patient_portal_url"), // URL do portal do paciente
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
  updatedAt: timestamp("updated_at"),
  items: text("items").array().notNull(),
  
  // Campos para pagamentos por email
  organizationId: integer("organization_id"),
  planId: integer("plan_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  paymentMethod: text("payment_method"),
  paymentToken: text("payment_token").unique(),
  description: text("description"),
});

// Enum para os tipos de profissionais de saúde permitidos pela ANVISA
export const doctorTypeEnum = pgEnum('doctor_type', ['general', 'dentist', 'veterinarian', 'pharmacist']);

export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  organizationId: integer("organization_id").notNull(),
  doctorType: doctorTypeEnum("doctor_type").notNull().default("general"), // Tipo de médico (médico geral, dentista, veterinário)
  specialization: text("specialization").notNull(),
  crm: text("crm").notNull(),
  crmState: text("crm_state").notNull(), // Estado onde o CRM foi emitido
  bio: text("bio"),
  available: boolean("available").default(true),
  approved: boolean("approved").default(false), // Se o médico foi aprovado pelo admin da organização
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

// Tabela para documentos de pacientes (prescrições, receitas, laudos, etc.)
export const patientDocuments = pgTable("patient_documents", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  organizationId: integer("organization_id").notNull(),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  filePath: text("file_path").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  category: documentCategoryEnum("category").notNull(),
  status: documentStatusEnum("status").notNull().default("pending"),
  uploadDate: timestamp("upload_date").defaultNow().notNull(),
  reviewedById: integer("reviewed_by_id"), // ID do farmacêutico que revisou o documento
  reviewDate: timestamp("review_date"),
  reviewNotes: text("review_notes"),
});

// Tabela para farmacêuticos responsáveis técnicos (RT)
export const pharmacists = pgTable("pharmacists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  organizationId: integer("organization_id").notNull(),
  name: text("name").notNull(),
  crf: text("crf").notNull(), // Número do Conselho Regional de Farmácia
  crfState: text("crf_state").notNull(), // Estado do CRF
  cpf: text("cpf").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  status: pharmacistStatusEnum("status").notNull().default("pending"),
  licenseNumber: text("license_number"), // Número da licença de RT
  licenseExpiryDate: timestamp("license_expiry_date"),
  specializations: text("specializations").array(),
  isResponsibleTechnician: boolean("is_responsible_technician").default(false), // Se é o RT principal
  certificationUrl: text("certification_url"), // URL do certificado/documento
  appointmentDate: timestamp("appointment_date"), // Data de nomeação como RT
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enum para as áreas de especialização dos pesquisadores
export const researchAreaEnum = pgEnum('research_area', [
  'cannabis_medicinal', 'neurodegenerativas', 'dor_cronica', 'psiquiatria', 
  'oncologia', 'epilepsia', 'autismo', 'geriatria', 'pediatria', 
  'imunologia', 'farmacologia', 'outra'
]);

// Tabela para pesquisadores científicos
export const researchers = pgTable("researchers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  organizationId: integer("organization_id"), // Pode ser nulo para pesquisadores independentes
  name: text("name").notNull(),
  cpf: text("cpf").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  lattes: text("lattes"), // Link para currículo Lattes
  orcid: text("orcid"), // Identificador ORCID
  institution: text("institution"), // Instituição principal
  department: text("department"), // Departamento ou setor
  position: text("position"), // Cargo ou posição (professor, pesquisador, etc.)
  degree: text("degree"), // Titulação (doutor, mestre, etc.)
  bio: text("bio"), // Biografia resumida
  researchAreas: researchAreaEnum("research_areas").array(), // Áreas de pesquisa
  mainArea: researchAreaEnum("main_area"), // Área principal de pesquisa
  website: text("website"), // Site pessoal ou institucional
  socialMedia: json("social_media"), // Links para redes sociais profissionais
  profilePhoto: text("profile_photo"), // Foto de perfil
  documentUrl: text("document_url"), // URL para documentos de identificação
  verified: boolean("verified").default(false), // Se o pesquisador foi verificado
  publicProfile: boolean("public_profile").default(true), // Se o perfil deve ser público
  allowContactByEmail: boolean("allow_contact_by_email").default(true), // Permissão para contato
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  'compras', 'dispensario', 'patrimonio', 'comunicacao', 'pesquisa_cientifica', 'educacao_paciente', 'fiscal', 'saude' // Add-ons
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
  sales_count: integer("sales_count").default(0), // contagem de vendas do módulo
  subscriptions_count: integer("subscriptions_count").default(0), // contagem de assinaturas ativas
  monthly_revenue: decimal("monthly_revenue", { precision: 10, scale: 2 }).default("0"), // receita mensal do módulo
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
  plan_id: integer("plan_id").notNull().references(() => plans.id, { onDelete: "cascade" }),
  module_id: integer("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
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
  organizationId: true,
  planId: true,
  amount: true,
  paymentMethod: true,
  paymentToken: true,
  description: true,
  updatedAt: true,
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
    patientPortalUrl: true,
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
  doctorType: true,
  specialization: true,
  crm: true,
  crmState: true,
  bio: true,
  available: true,
  approved: true,
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

export const insertPatientDocumentSchema = createInsertSchema(patientDocuments).pick({
  patientId: true,
  organizationId: true,
  fileName: true,
  originalName: true,
  filePath: true,
  fileType: true,
  fileSize: true,
  category: true,
  status: true,
});

// Schema para criação de pesquisador
export const insertResearcherSchema = createInsertSchema(researchers).pick({
  userId: true,
  organizationId: true,
  name: true,
  cpf: true,
  email: true,
  phone: true,
  lattes: true,
  orcid: true,
  institution: true,
  department: true,
  position: true,
  degree: true,
  bio: true,
  researchAreas: true,
  mainArea: true,
  website: true,
  socialMedia: true,
  profilePhoto: true,
  documentUrl: true,
  verified: true,
  publicProfile: true,
  allowContactByEmail: true,
});

// Schema para criação de farmacêutico
export const insertPharmacistSchema = createInsertSchema(pharmacists).pick({
  userId: true,
  organizationId: true,
  name: true,
  crf: true,
  crfState: true,
  cpf: true,
  email: true,
  phone: true,
  status: true,
  licenseNumber: true,
  licenseExpiryDate: true,
  specializations: true,
  isResponsibleTechnician: true,
  certificationUrl: true,
  appointmentDate: true,
  notes: true,
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
// Tipo base do plano
export type Plan = typeof plans.$inferSelect & {
  modules?: Module[];
};

// Relações entre tabelas
export const planRelations = relations(plans, ({ many }) => ({
  planModules: many(planModules),
}));

export const moduleRelations = relations(modules, ({ many }) => ({
  planModules: many(planModules),
}));

export const planModuleRelations = relations(planModules, ({ one }) => ({
  plan: one(plans, {
    fields: [planModules.plan_id],
    references: [plans.id],
  }),
  module: one(modules, {
    fields: [planModules.module_id],
    references: [modules.id],
  }),
}));
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
export type PatientDocument = typeof patientDocuments.$inferSelect;
export type InsertPatientDocument = z.infer<typeof insertPatientDocumentSchema>;
export type Researcher = typeof researchers.$inferSelect;
export type InsertResearcher = z.infer<typeof insertResearcherSchema>;
export type Pharmacist = typeof pharmacists.$inferSelect;
export type InsertPharmacist = z.infer<typeof insertPharmacistSchema>;

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

// Enums para o módulo fiscal
export const invoiceTypeEnum = pgEnum('invoice_type', ['nfe', 'nfce', 'cupom_fiscal', 'nfse']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['rascunho', 'emitida', 'cancelada', 'rejeitada', 'inutilizada']);

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

// Tabelas para o módulo fiscal
export const fiscalConfigs = pgTable("fiscal_configs", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  legalName: text("legal_name").notNull(),
  tradeName: text("trade_name"),
  cnpj: text("cnpj").notNull(),
  stateRegistration: text("state_registration"),
  municipalRegistration: text("municipal_registration"),
  address: text("address").notNull(),
  number: text("number").notNull(),
  complement: text("complement"),
  district: text("district").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  certificateFile: text("certificate_file"), // Caminho para o certificado digital
  certificatePassword: text("certificate_password"), // Senha do certificado (armazenada de forma segura)
  certificateExpiration: timestamp("certificate_expiration"),
  fiscalRegime: text("fiscal_regime").notNull(), // Simples Nacional, Lucro Presumido, etc.
  cnae: text("cnae").notNull(), // Código CNAE principal
  defaultSeries: text("default_series").default("1"), // Série padrão para documentos fiscais
  nextInvoiceNumber: integer("next_invoice_number").default(1), // Próximo número de documento
  printerModel: text("printer_model"), // Modelo da impressora fiscal (Bematech, etc.)
  printerPort: text("printer_port"), // Porta da impressora fiscal (COM1, USB, etc.)
  isTestEnvironment: boolean("is_test_environment").default(true), // Ambiente de testes ou produção
  apiToken: text("api_token"), // Token para API de emissão de NF (se aplicável)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const fiscalDocuments = pgTable("fiscal_documents", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  orderId: integer("order_id"), // Pedido relacionado (pode ser nulo para documentos manuais)
  documentNumber: text("document_number").notNull(), // Número do documento fiscal
  series: text("series").notNull().default("1"), // Série do documento
  type: invoiceTypeEnum("type").notNull(), // NFe, NFCe, Cupom, NFSe
  status: invoiceStatusEnum("status").notNull().default("rascunho"),
  customerName: text("customer_name").notNull(),
  customerDocument: text("customer_document"), // CPF ou CNPJ
  customerEmail: text("customer_email"),
  issuedAt: timestamp("issued_at"),
  canceledAt: timestamp("canceled_at"),
  cancelReason: text("cancel_reason"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  totalTax: decimal("total_tax", { precision: 10, scale: 2 }).default("0"),
  xmlContent: text("xml_content"), // Conteúdo XML do documento emitido
  pdfUrl: text("pdf_url"), // URL para o PDF do documento
  accessKey: text("access_key"), // Chave de acesso do documento (NFe/NFCe)
  authorizationProtocol: text("authorization_protocol"), // Protocolo de autorização
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const fiscalDocumentItems = pgTable("fiscal_document_items", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull(),
  productId: integer("product_id").notNull(),
  code: text("code").notNull(), // Código ou SKU do produto
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  unitOfMeasure: text("unit_of_measure").notNull().default("UN"),
  ncm: text("ncm"), // Código NCM para produtos
  cfop: text("cfop"), // Código CFOP
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  icmsRate: decimal("icms_rate", { precision: 5, scale: 2 }),
  pisRate: decimal("pis_rate", { precision: 5, scale: 2 }),
  cofinsRate: decimal("cofins_rate", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fiscalPrinters = pgTable("fiscal_printers", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  name: text("name").notNull(),
  model: text("model").notNull(), // Bematech, Epson, etc.
  serialNumber: text("serial_number"),
  port: text("port").notNull(), // COM1, USB, TCP/IP, etc.
  ipAddress: text("ip_address"), // Para impressoras em rede
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  lastMaintenance: timestamp("last_maintenance"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schemas para inserção de documentos fiscais
export const insertFiscalConfigSchema = createInsertSchema(fiscalConfigs).pick({
  organizationId: true,
  legalName: true,
  tradeName: true,
  cnpj: true,
  stateRegistration: true,
  municipalRegistration: true,
  address: true,
  number: true,
  complement: true,
  district: true,
  city: true,
  state: true,
  zipCode: true,
  certificateFile: true,
  certificatePassword: true,
  certificateExpiration: true,
  fiscalRegime: true,
  cnae: true,
  defaultSeries: true,
  nextInvoiceNumber: true,
  printerModel: true,
  printerPort: true,
  isTestEnvironment: true,
  apiToken: true,
});

export const insertFiscalDocumentSchema = createInsertSchema(fiscalDocuments).pick({
  organizationId: true,
  orderId: true,
  documentNumber: true,
  series: true,
  type: true,
  status: true,
  customerName: true,
  customerDocument: true,
  customerEmail: true,
  issuedAt: true,
  canceledAt: true,
  cancelReason: true,
  totalAmount: true,
  totalTax: true,
  xmlContent: true,
  pdfUrl: true,
  accessKey: true,
  authorizationProtocol: true,
});

export const insertFiscalDocumentItemSchema = createInsertSchema(fiscalDocumentItems).pick({
  documentId: true,
  productId: true,
  code: true,
  description: true,
  quantity: true,
  unitPrice: true,
  totalPrice: true,
  unitOfMeasure: true,
  ncm: true,
  cfop: true,
  taxAmount: true,
  icmsRate: true,
  pisRate: true,
  cofinsRate: true,
});

export const insertFiscalPrinterSchema = createInsertSchema(fiscalPrinters).pick({
  organizationId: true,
  name: true,
  model: true,
  serialNumber: true,
  port: true,
  ipAddress: true,
  isDefault: true,
  isActive: true,
  lastMaintenance: true,
  notes: true,
});

// Tipos para o módulo fiscal
export type FiscalConfig = typeof fiscalConfigs.$inferSelect;
export type InsertFiscalConfig = z.infer<typeof insertFiscalConfigSchema>;
export type FiscalDocument = typeof fiscalDocuments.$inferSelect;
export type InsertFiscalDocument = z.infer<typeof insertFiscalDocumentSchema>;
export type FiscalDocumentItem = typeof fiscalDocumentItems.$inferSelect;
export type InsertFiscalDocumentItem = z.infer<typeof insertFiscalDocumentItemSchema>;
export type FiscalPrinter = typeof fiscalPrinters.$inferSelect;
export type InsertFiscalPrinter = z.infer<typeof insertFiscalPrinterSchema>;

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

// Re-exportar schemas do módulo de patrimônio para inclusão na migração
export * from './schema-patrimonio';

// Importações dos schemas de equipamentos de laboratório para combinar todos os schemas
import {
  labEquipments,
  equipmentMaintenances,
  equipmentCertificates,
  equipmentStatusEnum as labEquipmentStatusEnum,
  maintenanceTypeEnum as labMaintenanceTypeEnum,
  maintenanceStatusEnum as labMaintenanceStatusEnum,
  insertLabEquipmentSchema,
  insertEquipmentMaintenanceSchema,
  insertEquipmentCertificateSchema,
  LabEquipment,
  EquipmentMaintenance,
  EquipmentCertificate,
  InsertLabEquipment,
  InsertEquipmentMaintenance,
  InsertEquipmentCertificate,
  labEquipmentsRelations,
  equipmentMaintenancesRelations,
  equipmentCertificatesRelations
} from './schema-lab-equipment';

// O módulo de patrimônio já está sendo importado via 'export * from' acima