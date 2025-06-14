import { pgTable, text, serial, timestamp, decimal, integer, boolean, pgEnum, date, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ==================== ENUMS ====================
// Enum para o status dos beneficiários
export const beneficiaryStatusEnum = pgEnum('beneficiary_status', ['active', 'inactive', 'pending', 'rejected']);

// Enum para os tipos de isenção
export const exemptionTypeEnum = pgEnum('exemption_type', ['exemption_25', 'exemption_50', 'exemption_100', 'anuidade_only']);

// Enum para tipos de doação
export const donationTypeEnum = pgEnum('donation_type', ['money', 'goods', 'real_estate', 'services', 'other']);

// Enum para status de compra de isenção
export const exemptionPurchaseStatusEnum = pgEnum('exemption_purchase_status', ['pending', 'approved', 'used', 'expired', 'cancelled']);

// Enum para o tipo de associado
export const membershipTypeEnum = pgEnum('membership_type', ['regular', 'premium', 'lifetime', 'temporary']);

// Enum para o status da carteirinha
export const membershipCardStatusEnum = pgEnum('membership_card_status', ['pending', 'approved', 'printed', 'delivered', 'expired', 'cancelled']);

// Enum para o tipo de carteirinha
export const membershipCardTypeEnum = pgEnum('membership_card_type', ['digital', 'physical', 'both']);

// Enum para a categoria do parceiro
export const partnerCategoryEnum = pgEnum('partner_category', ['health', 'pharmacy', 'food', 'education', 'services', 'retail', 'other']);

// Enum para o status do parceiro
export const partnerStatusEnum = pgEnum('partner_status', ['active', 'inactive', 'pending']);

// ==================== TABELAS ====================
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
  // Campos para associados
  membershipType: membershipTypeEnum("membership_type"),
  membershipStartDate: date("membership_start_date"),
  membershipEndDate: date("membership_end_date"),
  // Campos para programa de isenção
  exemptionType: exemptionTypeEnum("exemption_type"),
  monthlyUsageLimit: integer("monthly_usage_limit").default(0), // Quantas vezes pode usar por mês
  criteriaRank: decimal("criteria_rank", { precision: 10, scale: 2 }).default("0"), // Rank de critério
  exemptionValue: decimal("exemption_value", { precision: 10, scale: 2 }).default("0"), // Valor de isenção gerado
  isImportedFromOrganization: boolean("is_imported_from_organization").default(false),
  membershipCode: text("membership_code"), // Código único para o associado (usado no QR)
  membershipRules: json("membership_rules"), // Regras, direitos e deveres específicos
  documentFront: text("document_front"), // URL da foto do documento (frente)
  documentBack: text("document_back"), // URL da foto do documento (verso)
  proofOfIncome: text("proof_of_income"), // URL do comprovante de renda
  proofOfResidence: text("proof_of_residence"), // URL do comprovante de residência
  medicalReport: text("medical_report"), // URL do laudo médico
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

// Tabela de benefícios disponíveis
export const socialBeneficios = pgTable("social_beneficios", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  nome: text("nome").notNull(),
  descricao: text("descricao").notNull(),
  tipo: text("tipo").notNull(), // "medicamento", "consulta", "exame", "outro"
  valorEstimado: decimal("valor_estimado", { precision: 10, scale: 2 }),
  coberturaPorcentagem: integer("cobertura_porcentagem").default(100),
  limiteQuantidadeMes: integer("limite_quantidade_mes"),
  requerAprovacao: boolean("requer_aprovacao").default(true),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de benefícios concedidos aos beneficiários
export const socialBeneficios_Beneficiarios = pgTable("social_beneficios_beneficiarios", {
  id: serial("id").primaryKey(),
  beneficiarioId: integer("beneficiario_id").notNull(),
  beneficioId: integer("beneficio_id").notNull(),
  organizationId: integer("organization_id").notNull(),
  recorrente: boolean("recorrente").default(false),
  quantidadeConcedida: integer("quantidade_concedida").default(1),
  dataConcessao: timestamp("data_concessao").defaultNow(),
  dataValidade: timestamp("data_validade"),
  observacoes: text("observacoes"),
  status: text("status").notNull().default("ativo"), // "ativo", "suspenso", "encerrado"
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

// Tabela para o módulo de carteirinha de associado
export const socialMembershipCards = pgTable("social_membership_cards", {
  id: serial("id").primaryKey(),
  beneficiaryId: integer("beneficiary_id").notNull(), // Associação com o beneficiário
  organizationId: integer("organization_id").notNull(),
  cardType: membershipCardTypeEnum("card_type").notNull().default("digital"),
  status: membershipCardStatusEnum("status").notNull().default("pending"),
  cardNumber: text("card_number").notNull(), // Número único da carteirinha
  qrCodeUrl: text("qr_code_url"), // URL do QR code gerado
  issueDate: timestamp("issue_date").defaultNow(),
  expiryDate: timestamp("expiry_date").notNull(), // 1 ano da geração
  pin: text("pin"), // PIN criptografado para acesso seguro
  pinSetupCompleted: boolean("pin_setup_completed").default(false),
  lastPinChangeDate: timestamp("last_pin_change_date"),
  photoUrl: text("photo_url"), // URL da foto do associado
  cardImageUrl: text("card_image_url"), // URL da imagem da carteirinha gerada
  printedAt: timestamp("printed_at"), // Quando foi impressa
  deliveredAt: timestamp("delivered_at"), // Quando foi entregue
  physicalCardRequested: boolean("physical_card_requested").default(false),
  physicalCardPaymentStatus: text("physical_card_payment_status").default("pending"), // "pending", "paid", "failed"
  physicalCardPaymentId: text("physical_card_payment_id"), // ID da transação de pagamento
  physicalCardPaymentAmount: decimal("physical_card_payment_amount", { precision: 10, scale: 2 }).default("25.00"),
  physicalCardTrackingNumber: text("physical_card_tracking_number"), // Número de rastreamento para entrega
  physicalCardShippingAddress: text("physical_card_shipping_address"), // Endereço de entrega
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela para configurações do módulo de carteirinha
export const socialMembershipCardSettings = pgTable("social_membership_card_settings", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().unique(), // Uma configuração por organização
  cardTitleText: text("card_title_text").default("Carteirinha de Associado"),
  cardSubtitleText: text("card_subtitle_text").default("Associação de Pacientes"),
  cardBackgroundColor: text("card_background_color").default("#FFFFFF"),
  cardTextColor: text("card_text_color").default("#000000"),
  cardHighlightColor: text("card_highlight_color").default("#00AA00"),
  includeQrCode: boolean("include_qr_code").default(true),
  includePhoto: boolean("include_photo").default(true),
  includeLogo: boolean("include_logo").default(true),
  includeValidityDate: boolean("include_validity_date").default(true),
  validityPeriodMonths: integer("validity_period_months").default(12), // Período de validade em meses
  physicalCardPrice: decimal("physical_card_price", { precision: 10, scale: 2 }).default("25.00"),
  physicalCardEnabled: boolean("physical_card_enabled").default(true),
  pinEnabled: boolean("pin_enabled").default(true),
  pinDigits: integer("pin_digits").default(6),
  pinRequireLetters: boolean("pin_require_letters").default(false),
  pinRequireSpecialChars: boolean("pin_require_special_chars").default(false),
  termsText: text("terms_text").default("Esta carteirinha é pessoal e intransferível. Em caso de perda ou roubo, comunique imediatamente."),
  cardTemplate: text("card_template").default("default"), // "default", "premium", "simple"
  customCss: text("custom_css"), // CSS personalizado para o template
  customFields: json("custom_fields"), // Campos personalizados a serem exibidos
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de histórico de acesso à carteirinha
export const socialMembershipCardAccessLogs = pgTable("social_membership_card_access_logs", {
  id: serial("id").primaryKey(),
  cardId: integer("card_id").notNull(),
  organizationId: integer("organization_id").notNull(),
  accessDate: timestamp("access_date").defaultNow(),
  accessIp: text("access_ip"),
  accessUserAgent: text("access_user_agent"),
  accessMethod: text("access_method").notNull(), // "qr_scan", "direct_link", "portal"
  pinVerified: boolean("pin_verified").default(false),
  prescriptionViewed: boolean("prescription_viewed").default(false),
  medicalReportViewed: boolean("medical_report_viewed").default(false),
  locationLat: text("location_lat"),
  locationLng: text("location_lng"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabela para parceiros do clube de benefícios/descontos
export const socialPartners = pgTable("social_partners", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  name: text("name").notNull(),
  cnpj: text("cnpj").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  contactPerson: text("contact_person"),
  category: partnerCategoryEnum("category").notNull().default("other"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  website: text("website"),
  status: partnerStatusEnum("status").notNull().default("pending"),
  description: text("description").notNull(),
  logoUrl: text("logo_url"),
  bannerUrl: text("banner_url"),
  contractUrl: text("contract_url"), // URL do contrato assinado
  contractStartDate: timestamp("contract_start_date"),
  contractEndDate: timestamp("contract_end_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela para os benefícios oferecidos pelos parceiros
export const socialPartnerBenefits = pgTable("social_partner_benefits", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull(),
  organizationId: integer("organization_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  discountType: text("discount_type").notNull(), // "percentage", "fixed_value", "free_item"
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  minimumPurchase: decimal("minimum_purchase", { precision: 10, scale: 2 }),
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  membershipTypeRequired: membershipTypeEnum("membership_type_required"),
  termsAndConditions: text("terms_and_conditions"),
  redemptionInstructions: text("redemption_instructions"),
  couponCode: text("coupon_code"),
  imageUrl: text("image_url"),
  maxUsesTotal: integer("max_uses_total"),
  maxUsesPerMember: integer("max_uses_per_member").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela para acompanhar o uso de benefícios por associados
export const socialBenefitUsage = pgTable("social_benefit_usage", {
  id: serial("id").primaryKey(),
  benefitId: integer("benefit_id").notNull(),
  beneficiaryId: integer("beneficiary_id").notNull(),
  organizationId: integer("organization_id").notNull(),
  cardId: integer("card_id"),
  usageDate: timestamp("usage_date").defaultNow(),
  usageValue: decimal("usage_value", { precision: 10, scale: 2 }),
  verificationCode: text("verification_code"),
  usageMethod: text("usage_method").notNull(), // "qr_code", "coupon", "in_store"
  status: text("status").notNull().default("completed"), // "completed", "cancelled", "pending_verification"
  partnerFeedback: text("partner_feedback"),
  beneficiaryFeedback: text("beneficiary_feedback"),
  beneficiaryRating: integer("beneficiary_rating"), // 1-5 stars
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabela de Compras de Isenção
export const exemptionPurchases = pgTable("exemption_purchases", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  beneficiaryId: integer("beneficiary_id").notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow(),
  exemptionType: exemptionTypeEnum("exemption_type").notNull(),
  originalValue: decimal("original_value", { precision: 10, scale: 2 }).notNull(),
  exemptionValue: decimal("exemption_value", { precision: 10, scale: 2 }).notNull(),
  finalValue: decimal("final_value", { precision: 10, scale: 2 }).notNull(),
  status: exemptionPurchaseStatusEnum("status").default("pending"),
  usageCount: integer("usage_count").default(0),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Tabela de Doações Expandida
export const organizationDonations = pgTable("organization_donations", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  donorName: text("donor_name").notNull(),
  donorCpfCnpj: text("donor_cpf_cnpj"),
  donorEmail: text("donor_email"),
  donorPhone: text("donor_phone"),
  donationType: donationTypeEnum("donation_type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  description: text("description").notNull(),
  donationDate: timestamp("donation_date").defaultNow(),
  location: text("location"), // Para imóveis
  estimatedValue: decimal("estimated_value", { precision: 10, scale: 2 }), // Para bens
  receiptNumber: text("receipt_number"),
  isAnonymous: boolean("is_anonymous").default(false),
  attachments: json("attachments"), // URLs de documentos/fotos
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Tabela de Índices de Transparência (Agregados mensais)
export const transparencyIndexes = pgTable("transparency_indexes", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  totalExemptions: decimal("total_exemptions", { precision: 12, scale: 2 }).default("0"),
  exemptions25Count: integer("exemptions_25_count").default(0),
  exemptions50Count: integer("exemptions_50_count").default(0),
  exemptions100Count: integer("exemptions_100_count").default(0),
  totalDonations: decimal("total_donations", { precision: 12, scale: 2 }).default("0"),
  moneyDonations: decimal("money_donations", { precision: 12, scale: 2 }).default("0"),
  goodsDonations: decimal("goods_donations", { precision: 12, scale: 2 }).default("0"),
  realEstateDonations: decimal("real_estate_donations", { precision: 12, scale: 2 }).default("0"),
  servicesDonations: decimal("services_donations", { precision: 12, scale: 2 }).default("0"),
  activeBeneficiariesCount: integer("active_beneficiaries_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ==================== SCHEMAS ====================
// Schemas para inserção de dados com validação Zod
export const insertSocialBeneficiarySchema = createInsertSchema(socialBeneficiaries);

export const insertSocialDonationSchema = createInsertSchema(socialDonations);
export const insertSocialExpenseSchema = createInsertSchema(socialExpenses);
export const insertSocialCampaignSchema = createInsertSchema(socialCampaigns);
export const insertSocialVolunteerSchema = createInsertSchema(socialVolunteers);
export const insertSocialPortalSettingsSchema = createInsertSchema(socialPortalSettings);
export const insertSocialBeneficiaryHistorySchema = createInsertSchema(socialBeneficiaryHistory);
export const insertSocialBeneficioSchema = createInsertSchema(socialBeneficios);
export const insertSocialBeneficio_BeneficiarioSchema = createInsertSchema(socialBeneficios_Beneficiarios);

// Schemas para módulo de isenções e doações
export const insertExemptionPurchaseSchema = createInsertSchema(exemptionPurchases);
export const insertOrganizationDonationSchema = createInsertSchema(organizationDonations);
export const insertTransparencyIndexSchema = createInsertSchema(transparencyIndexes);

// Schemas para módulo de carteirinha
export const insertSocialMembershipCardSchema = createInsertSchema(socialMembershipCards);
export const insertSocialMembershipCardSettingsSchema = createInsertSchema(socialMembershipCardSettings);
export const insertSocialMembershipCardAccessLogSchema = createInsertSchema(socialMembershipCardAccessLogs);

// Schemas para módulo de parceiros e benefícios
export const insertSocialPartnerSchema = createInsertSchema(socialPartners);
export const insertSocialPartnerBenefitSchema = createInsertSchema(socialPartnerBenefits);
export const insertSocialBenefitUsageSchema = createInsertSchema(socialBenefitUsage);

// ==================== TIPOS ====================
// Tipos para inserção
export type InsertSocialBeneficiary = z.infer<typeof insertSocialBeneficiarySchema>;
export type InsertSocialDonation = z.infer<typeof insertSocialDonationSchema>;
export type InsertSocialExpense = z.infer<typeof insertSocialExpenseSchema>;
export type InsertSocialCampaign = z.infer<typeof insertSocialCampaignSchema>;
export type InsertSocialVolunteer = z.infer<typeof insertSocialVolunteerSchema>;
export type InsertSocialPortalSettings = z.infer<typeof insertSocialPortalSettingsSchema>;
export type InsertSocialBeneficiaryHistory = z.infer<typeof insertSocialBeneficiaryHistorySchema>;
export type InsertSocialBeneficio = z.infer<typeof insertSocialBeneficioSchema>;
export type InsertSocialBeneficioBeneficiario = z.infer<typeof insertSocialBeneficio_BeneficiarioSchema>;

// Tipos para inserção do módulo de carteirinha
export type InsertSocialMembershipCard = z.infer<typeof insertSocialMembershipCardSchema>;
export type InsertSocialMembershipCardSettings = z.infer<typeof insertSocialMembershipCardSettingsSchema>;
export type InsertSocialMembershipCardAccessLog = z.infer<typeof insertSocialMembershipCardAccessLogSchema>;

// Tipos para inserção do módulo de parceiros e benefícios
export type InsertSocialPartner = z.infer<typeof insertSocialPartnerSchema>;
export type InsertSocialPartnerBenefit = z.infer<typeof insertSocialPartnerBenefitSchema>;
export type InsertSocialBenefitUsage = z.infer<typeof insertSocialBenefitUsageSchema>;

// Tipos para seleção
export type SocialBeneficiary = typeof socialBeneficiaries.$inferSelect;
export type SocialDonation = typeof socialDonations.$inferSelect;
export type SocialExpense = typeof socialExpenses.$inferSelect;
export type SocialCampaign = typeof socialCampaigns.$inferSelect;
export type SocialVolunteer = typeof socialVolunteers.$inferSelect;
export type SocialPortalSettings = typeof socialPortalSettings.$inferSelect;
export type SocialBeneficiaryHistory = typeof socialBeneficiaryHistory.$inferSelect;
export type SocialBeneficio = typeof socialBeneficios.$inferSelect;
export type SocialBeneficioBeneficiario = typeof socialBeneficios_Beneficiarios.$inferSelect;

// Tipos para seleção do módulo de carteirinha
export type SocialMembershipCard = typeof socialMembershipCards.$inferSelect;
export type SocialMembershipCardSettings = typeof socialMembershipCardSettings.$inferSelect;
export type SocialMembershipCardAccessLog = typeof socialMembershipCardAccessLogs.$inferSelect;

// Tipos para seleção do módulo de parceiros e benefícios
export type SocialPartner = typeof socialPartners.$inferSelect;
export type SocialPartnerBenefit = typeof socialPartnerBenefits.$inferSelect;
export type SocialBenefitUsage = typeof socialBenefitUsage.$inferSelect;

// ==================== RELAÇÕES ====================
// Relações para beneficiários
export const socialBeneficiariesRelations = relations(socialBeneficiaries, ({ many }) => ({
  history: many(socialBeneficiaryHistory),
  beneficiosRecebidos: many(socialBeneficios_Beneficiarios),
  membershipCards: many(socialMembershipCards),
}));

export const socialBeneficiosRelations = relations(socialBeneficios, ({ many }) => ({
  beneficiarios: many(socialBeneficios_Beneficiarios),
}));

export const socialBeneficios_BeneficiariosRelations = relations(socialBeneficios_Beneficiarios, ({ one }) => ({
  beneficiario: one(socialBeneficiaries, {
    fields: [socialBeneficios_Beneficiarios.beneficiarioId],
    references: [socialBeneficiaries.id],
  }),
  beneficio: one(socialBeneficios, {
    fields: [socialBeneficios_Beneficiarios.beneficioId],
    references: [socialBeneficios.id],
  }),
}));

export const socialBeneficiaryHistoryRelations = relations(socialBeneficiaryHistory, ({ one }) => ({
  beneficiary: one(socialBeneficiaries, {
    fields: [socialBeneficiaryHistory.beneficiaryId],
    references: [socialBeneficiaries.id],
  }),
}));

// Relações para o módulo de carteirinha
export const socialMembershipCardsRelations = relations(socialMembershipCards, ({ one, many }) => ({
  beneficiary: one(socialBeneficiaries, {
    fields: [socialMembershipCards.beneficiaryId],
    references: [socialBeneficiaries.id],
  }),
  accessLogs: many(socialMembershipCardAccessLogs),
  benefitUsages: many(socialBenefitUsage),
}));

export const socialMembershipCardAccessLogsRelations = relations(socialMembershipCardAccessLogs, ({ one }) => ({
  card: one(socialMembershipCards, {
    fields: [socialMembershipCardAccessLogs.cardId],
    references: [socialMembershipCards.id],
  }),
}));

// Relações para parceiros e benefícios
export const socialPartnersRelations = relations(socialPartners, ({ many }) => ({
  benefits: many(socialPartnerBenefits),
}));

export const socialPartnerBenefitsRelations = relations(socialPartnerBenefits, ({ one, many }) => ({
  partner: one(socialPartners, {
    fields: [socialPartnerBenefits.partnerId],
    references: [socialPartners.id],
  }),
  usages: many(socialBenefitUsage),
}));

export const socialBenefitUsageRelations = relations(socialBenefitUsage, ({ one }) => ({
  benefit: one(socialPartnerBenefits, {
    fields: [socialBenefitUsage.benefitId],
    references: [socialPartnerBenefits.id],
  }),
  beneficiary: one(socialBeneficiaries, {
    fields: [socialBenefitUsage.beneficiaryId],
    references: [socialBeneficiaries.id],
  }),
  card: one(socialMembershipCards, {
    fields: [socialBenefitUsage.cardId],
    references: [socialMembershipCards.id],
  }),
}));