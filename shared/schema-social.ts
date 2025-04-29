import { pgTable, text, serial, timestamp, decimal, integer, boolean, pgEnum, date, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enum para o status dos beneficiários
export const beneficiaryStatusEnum = pgEnum('beneficiary_status', ['active', 'inactive', 'pending', 'rejected']);

// Enum para os tipos de isenção
export const exemptionTypeEnum = pgEnum('exemption_type', ['exemption_25', 'exemption_50', 'exemption_75', 'exemption_100']);

// Tabela de Beneficiários
export const socialBeneficiaries = pgTable("social_beneficiaries", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  name: text("name").notNull(),
  cpf: text("cpf").notNull().unique(),
  rg: text("rg"),
  birthDate: date("birth_date").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  addressNumber: text("address_number"),
  addressComplement: text("address_complement"),
  neighborhood: text("neighborhood").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  status: beneficiaryStatusEnum("status").notNull().default("pending"),
  documentFront: text("document_front"), // URL da foto do documento (frente)
  documentBack: text("document_back"), // URL da foto do documento (verso)
  proofOfIncome: text("proof_of_income"), // URL do comprovante de renda
  proofOfResidence: text("proof_of_residence"), // URL do comprovante de residência
  medicalReport: text("medical_report"), // URL do laudo médico
  exemptionType: exemptionTypeEnum("exemption_type").notNull().default("exemption_25"),
  exemptionValue: decimal("exemption_value", { precision: 10, scale: 2 }).notNull().default("25"),
  monthlyIncome: decimal("monthly_income", { precision: 10, scale: 2 }),
  familyMembers: integer("family_members"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de Doações
export const socialDonations = pgTable("social_donations", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  donorName: text("donor_name"),
  donorEmail: text("donor_email"),
  donorCpfCnpj: text("donor_cpf_cnpj"),
  donorPhone: text("donor_phone"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  transactionId: text("transaction_id"),
  isAnonymous: boolean("is_anonymous").default(false),
  isRecurring: boolean("is_recurring").default(false),
  donationDate: timestamp("donation_date").defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabela de Despesas do Programa Social
export const socialExpenses = pgTable("social_expenses", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  beneficiaryId: integer("beneficiary_id"), // Opcional, caso a despesa esteja associada a um beneficiário
  documentUrl: text("document_url"), // URL do comprovante da despesa
  expenseDate: timestamp("expense_date").defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabela de Campanhas Sociais
export const socialCampaigns = pgTable("social_campaigns", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  goal: decimal("goal", { precision: 10, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de Voluntários
export const socialVolunteers = pgTable("social_volunteers", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  cpf: text("cpf"),
  skills: text("skills"),
  availability: text("availability"),
  status: text("status").notNull().default("pending"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabela de configurações do portal social
export const socialPortalSettings = pgTable("social_portal_settings", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().unique(),
  title: text("title").notNull().default("Programa Social"),
  subtitle: text("subtitle").notNull().default("Cuidando de quem mais precisa"),
  mission: text("mission").notNull().default("Nosso programa social tem como objetivo principal garantir acesso ao tratamento com cannabis medicinal para pacientes em situação de vulnerabilidade socioeconômica."),
  enableDonations: boolean("enable_donations").default(true),
  enableVolunteers: boolean("enable_volunteers").default(true),
  enableBeneficiaryRequest: boolean("enable_beneficiary_request").default(true),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("#000000"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de histórico de atendimentos
export const socialBeneficiaryHistory = pgTable("social_beneficiary_history", {
  id: serial("id").primaryKey(),
  beneficiaryId: integer("beneficiary_id").notNull(),
  organizationId: integer("organization_id").notNull(),
  eventType: text("event_type").notNull(), // "subsidy_granted", "consultation", "medication_delivery"
  eventDate: timestamp("event_date").defaultNow(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdBy: integer("created_by"), // ID do usuário que registrou o evento
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas para inserção de dados com validação Zod
export const insertSocialBeneficiarySchema = createInsertSchema(socialBeneficiaries, {
  cpf: (schema) => schema.cpf.regex(/^\d{11}$/, "CPF deve conter 11 dígitos"),
  email: (schema) => schema.email.email("Email inválido"),
  phone: (schema) => schema.phone.regex(/^\d{10,11}$/, "Telefone deve conter 10 ou 11 dígitos"),
  zipCode: (schema) => schema.zipCode.regex(/^\d{8}$/, "CEP deve conter 8 dígitos"),
});

export const insertSocialDonationSchema = createInsertSchema(socialDonations);
export const insertSocialExpenseSchema = createInsertSchema(socialExpenses);
export const insertSocialCampaignSchema = createInsertSchema(socialCampaigns);
export const insertSocialVolunteerSchema = createInsertSchema(socialVolunteers);
export const insertSocialPortalSettingsSchema = createInsertSchema(socialPortalSettings);
export const insertSocialBeneficiaryHistorySchema = createInsertSchema(socialBeneficiaryHistory);

// Tipos para inserção
export type InsertSocialBeneficiary = z.infer<typeof insertSocialBeneficiarySchema>;
export type InsertSocialDonation = z.infer<typeof insertSocialDonationSchema>;
export type InsertSocialExpense = z.infer<typeof insertSocialExpenseSchema>;
export type InsertSocialCampaign = z.infer<typeof insertSocialCampaignSchema>;
export type InsertSocialVolunteer = z.infer<typeof insertSocialVolunteerSchema>;
export type InsertSocialPortalSettings = z.infer<typeof insertSocialPortalSettingsSchema>;
export type InsertSocialBeneficiaryHistory = z.infer<typeof insertSocialBeneficiaryHistorySchema>;

// Tipos para seleção
export type SocialBeneficiary = typeof socialBeneficiaries.$inferSelect;
export type SocialDonation = typeof socialDonations.$inferSelect;
export type SocialExpense = typeof socialExpenses.$inferSelect;
export type SocialCampaign = typeof socialCampaigns.$inferSelect;
export type SocialVolunteer = typeof socialVolunteers.$inferSelect;
export type SocialPortalSettings = typeof socialPortalSettings.$inferSelect;
export type SocialBeneficiaryHistory = typeof socialBeneficiaryHistory.$inferSelect;

// Relações
export const socialBeneficiariesRelations = relations(socialBeneficiaries, ({ many }) => ({
  history: many(socialBeneficiaryHistory),
}));

export const socialBeneficiaryHistoryRelations = relations(socialBeneficiaryHistory, ({ one }) => ({
  beneficiary: one(socialBeneficiaries, {
    fields: [socialBeneficiaryHistory.beneficiaryId],
    references: [socialBeneficiaries.id],
  }),
}));