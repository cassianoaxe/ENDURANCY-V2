import { pgTable, serial, text, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { relations } from 'drizzle-orm';
import { users } from '../users';
import { organizations } from '../organizations';

// Enums
export const affiliateTypeEnum = pgEnum('affiliate_type', ['patient', 'organization', 'company', 'association']);
export const affiliateLevelEnum = pgEnum('affiliate_level', ['beginner', 'bronze', 'silver', 'gold', 'platinum']);
export const activityTypeEnum = pgEnum('activity_type', [
  'registration', 
  'referral_signup', 
  'referral_purchase', 
  'milestone', 
  'bonus', 
  'purchase', 
  'redemption'
]);
export const redemptionStatusEnum = pgEnum('redemption_status', ['pending', 'completed', 'failed', 'cancelled']);

// Tabela de afiliados
export const affiliates = pgTable('affiliates', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  organizationId: integer('organization_id'),
  affiliateCode: text('affiliate_code').notNull().unique(),
  type: affiliateTypeEnum('type').notNull(),
  level: affiliateLevelEnum('level').notNull().default('beginner'),
  points: integer('points').notNull().default(0),
  totalEarned: integer('total_earned').notNull().default(0),
  totalRedeemed: integer('total_redeemed').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relações de afiliados
export const affiliatesRelations = relations(affiliates, ({ one }) => ({
  user: one(users, {
    fields: [affiliates.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [affiliates.organizationId],
    references: [organizations.id],
  }),
}));

// Tabela de pontos de afiliados
export const affiliatePoints = pgTable('affiliate_points', {
  id: serial('id').primaryKey(),
  affiliateId: integer('affiliate_id').notNull(),
  points: integer('points').notNull(),
  activityType: activityTypeEnum('activity_type').notNull(),
  description: text('description').notNull(),
  referenceId: integer('reference_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relações de pontos
export const affiliatePointsRelations = relations(affiliatePoints, ({ one }) => ({
  affiliate: one(affiliates, {
    fields: [affiliatePoints.affiliateId],
    references: [affiliates.id],
  }),
}));

// Tabela de referências
export const affiliateReferrals = pgTable('affiliate_referrals', {
  id: serial('id').primaryKey(),
  referrerId: integer('referrer_id').notNull(),
  referredId: integer('referred_id').notNull(),
  referredUserId: integer('referred_user_id').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relações de referências
export const affiliateReferralsRelations = relations(affiliateReferrals, ({ one }) => ({
  referrer: one(affiliates, {
    fields: [affiliateReferrals.referrerId],
    references: [affiliates.id],
  }),
  referred: one(affiliates, {
    fields: [affiliateReferrals.referredId],
    references: [affiliates.id],
  }),
  referredUser: one(users, {
    fields: [affiliateReferrals.referredUserId],
    references: [users.id],
  }),
}));

// Tabela de recompensas
export const affiliateRewards = pgTable('affiliate_rewards', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  pointsCost: integer('points_cost').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  limitedQuantity: boolean('limited_quantity').notNull().default(false),
  quantityAvailable: integer('quantity_available'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relações de recompensas
export const affiliateRewardsRelations = relations(affiliateRewards, ({ one }) => ({
  organization: one(organizations, {
    fields: [affiliateRewards.organizationId],
    references: [organizations.id],
  }),
}));

// Tabela de resgates de recompensas
export const affiliateRedemptions = pgTable('affiliate_redemptions', {
  id: serial('id').primaryKey(),
  affiliateId: integer('affiliate_id').notNull(),
  rewardId: integer('reward_id').notNull(),
  pointsSpent: integer('points_spent').notNull(),
  status: redemptionStatusEnum('status').notNull().default('pending'),
  code: text('code'),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relações de resgates
export const affiliateRedemptionsRelations = relations(affiliateRedemptions, ({ one }) => ({
  affiliate: one(affiliates, {
    fields: [affiliateRedemptions.affiliateId],
    references: [affiliates.id],
  }),
  reward: one(affiliateRewards, {
    fields: [affiliateRedemptions.rewardId],
    references: [affiliateRewards.id],
  }),
}));

// Tabela de materiais promocionais
export const promotionalMaterials = pgTable('promotional_materials', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relações de materiais promocionais
export const promotionalMaterialsRelations = relations(promotionalMaterials, ({ one }) => ({
  organization: one(organizations, {
    fields: [promotionalMaterials.organizationId],
    references: [organizations.id],
  }),
}));

// Schemas de inserção e tipos
export const insertAffiliateSchema = createInsertSchema(affiliates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAffiliatePointSchema = createInsertSchema(affiliatePoints).omit({
  id: true,
  createdAt: true,
});

export const insertAffiliateReferralSchema = createInsertSchema(affiliateReferrals).omit({
  id: true,
  createdAt: true,
});

export const insertAffiliateRewardSchema = createInsertSchema(affiliateRewards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAffiliateRedemptionSchema = createInsertSchema(affiliateRedemptions).omit({
  id: true,
  createdAt: true,
});

export const insertPromotionalMaterialSchema = createInsertSchema(promotionalMaterials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Tipos de inserção
export type InsertAffiliate = z.infer<typeof insertAffiliateSchema>;
export type InsertAffiliatePoint = z.infer<typeof insertAffiliatePointSchema>;
export type InsertAffiliateReferral = z.infer<typeof insertAffiliateReferralSchema>;
export type InsertAffiliateReward = z.infer<typeof insertAffiliateRewardSchema>;
export type InsertAffiliateRedemption = z.infer<typeof insertAffiliateRedemptionSchema>;
export type InsertPromotionalMaterial = z.infer<typeof insertPromotionalMaterialSchema>;

// Tipos de seleção
export type Affiliate = typeof affiliates.$inferSelect;
export type AffiliatePoint = typeof affiliatePoints.$inferSelect;
export type AffiliateReferral = typeof affiliateReferrals.$inferSelect;
export type AffiliateReward = typeof affiliateRewards.$inferSelect;
export type AffiliateRedemption = typeof affiliateRedemptions.$inferSelect;
export type PromotionalMaterial = typeof promotionalMaterials.$inferSelect;