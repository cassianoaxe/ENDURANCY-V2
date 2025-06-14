import { Router } from "express";
import { db } from "./db";
import { 
  exemptionPurchases, 
  socialBeneficiaries, 
  organizationDonations, 
  transparencyIndexes 
} from "@shared/schema-social";
import { eq, and, gte, lte, sum, count, desc } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// Validation schemas
const createExemptionPurchaseSchema = z.object({
  organizationId: z.number(),
  beneficiaryId: z.number(),
  exemptionType: z.enum(['exemption_25', 'exemption_50', 'exemption_100', 'anuidade_only']),
  originalValue: z.number().positive(),
  exemptionValue: z.number().positive(),
  finalValue: z.number().min(0),
  description: z.string().optional()
});

const createDonationSchema = z.object({
  organizationId: z.number(),
  donorName: z.string().min(1),
  donorEmail: z.string().email().optional(),
  donorPhone: z.string().optional(),
  donationType: z.enum(['money', 'goods', 'real_estate', 'services', 'other']),
  amount: z.number().positive().optional(),
  description: z.string()
});

// Get exemption statistics
router.get("/api/social/exemptions/stats", async (req, res) => {
  try {
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    // Total exemptions by type this month
    const exemptionStats = await db
      .select({
        exemptionType: exemptionPurchases.exemptionType,
        count: count(),
        totalSaved: sum(exemptionPurchases.exemptionValue)
      })
      .from(exemptionPurchases)
      .where(
        and(
          gte(exemptionPurchases.createdAt, startOfMonth),
          lte(exemptionPurchases.createdAt, endOfMonth)
        )
      )
      .groupBy(exemptionPurchases.exemptionType);

    // Active beneficiaries count
    const activeBeneficiaries = await db
      .select({ count: count() })
      .from(socialBeneficiaries)
      .where(eq(socialBeneficiaries.status, 'active'));

    // Total donations this month
    const totalDonations = await db
      .select({ 
        count: count(),
        totalAmount: sum(organizationDonations.amount)
      })
      .from(organizationDonations)
      .where(
        and(
          gte(organizationDonations.createdAt, startOfMonth),
          lte(organizationDonations.createdAt, endOfMonth)
        )
      );

    res.json({
      exemptionStats,
      activeBeneficiaries: activeBeneficiaries[0]?.count || 0,
      totalDonations: totalDonations[0] || { count: 0, totalAmount: 0 }
    });
  } catch (error) {
    console.error('Error fetching exemption stats:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get all exemption purchases with pagination
router.get("/api/social/exemptions/purchases", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const purchases = await db
      .select({
        id: exemptionPurchases.id,
        exemptionType: exemptionPurchases.exemptionType,
        originalValue: exemptionPurchases.originalValue,
        exemptionValue: exemptionPurchases.exemptionValue,
        finalValue: exemptionPurchases.finalValue,
        description: exemptionPurchases.description,
        status: exemptionPurchases.status,
        createdAt: exemptionPurchases.createdAt,
        purchaseDate: exemptionPurchases.purchaseDate,
        beneficiaryName: socialBeneficiaries.name,
        beneficiaryCpf: socialBeneficiaries.cpf
      })
      .from(exemptionPurchases)
      .leftJoin(socialBeneficiaries, eq(exemptionPurchases.beneficiaryId, socialBeneficiaries.id))
      .orderBy(desc(exemptionPurchases.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ count: count() })
      .from(exemptionPurchases);

    res.json({
      purchases,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching exemption purchases:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Create new exemption purchase
router.post("/api/social/exemptions/purchases", async (req, res) => {
  try {
    const validatedData = createExemptionPurchaseSchema.parse(req.body);
    
    // Check if beneficiary exists and is active
    const beneficiary = await db
      .select()
      .from(socialBeneficiaries)
      .where(
        and(
          eq(socialBeneficiaries.id, validatedData.beneficiaryId),
          eq(socialBeneficiaries.status, 'active')
        )
      )
      .limit(1);

    if (!beneficiary.length) {
      return res.status(400).json({ error: 'Beneficiário não encontrado ou inativo' });
    }

    // Check monthly usage limits based on exemption type
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const monthlyUsage = await db
      .select({ count: count() })
      .from(exemptionPurchases)
      .where(
        and(
          eq(exemptionPurchases.beneficiaryId, validatedData.beneficiaryId),
          eq(exemptionPurchases.exemptionType, validatedData.exemptionType),
          gte(exemptionPurchases.purchaseDate, startOfMonth),
          lte(exemptionPurchases.purchaseDate, endOfMonth)
        )
      );

    const usageCount = monthlyUsage[0]?.count || 0;
    const limits = {
      'exemption_100': 1,
      'exemption_50': 2,
      'exemption_25': 5,
      'anuidade_only': 12
    };

    if (usageCount >= limits[validatedData.exemptionType]) {
      return res.status(400).json({ 
        error: `Limite mensal excedido para ${validatedData.exemptionType}` 
      });
    }

    const [newPurchase] = await db
      .insert(exemptionPurchases)
      .values({
        organizationId: validatedData.organizationId,
        beneficiaryId: validatedData.beneficiaryId,
        exemptionType: validatedData.exemptionType,
        originalValue: validatedData.originalValue.toString(),
        exemptionValue: validatedData.exemptionValue.toString(),
        finalValue: validatedData.finalValue.toString(),
        description: validatedData.description
      })
      .returning();

    res.status(201).json(newPurchase);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    console.error('Error creating exemption purchase:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get donations with pagination
router.get("/api/social/donations", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const donations = await db
      .select()
      .from(organizationDonations)
      .orderBy(desc(organizationDonations.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ count: count() })
      .from(organizationDonations);

    res.json({
      donations,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Create new donation
router.post("/api/social/donations", async (req, res) => {
  try {
    const validatedData = createDonationSchema.parse(req.body);
    
    const [newDonation] = await db
      .insert(organizationDonations)
      .values({
        organizationId: validatedData.organizationId,
        donorName: validatedData.donorName,
        donorEmail: validatedData.donorEmail,
        donorPhone: validatedData.donorPhone,
        donationType: validatedData.donationType,
        amount: validatedData.amount?.toString(),
        description: validatedData.description
      })
      .returning();

    res.status(201).json(newDonation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    console.error('Error creating donation:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get transparency index data
router.get("/api/social/transparency", async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    const transparencyData = await db
      .select()
      .from(transparencyIndexes)
      .where(
        and(
          eq(transparencyIndexes.year, currentYear),
          eq(transparencyIndexes.month, currentMonth)
        )
      )
      .orderBy(desc(transparencyIndexes.month))
      .limit(1);

    if (!transparencyData.length) {
      // Calculate transparency index for current month
      const totalDonations = await db
        .select({ sum: sum(organizationDonations.amount) })
        .from(organizationDonations)
        .where(
          and(
            gte(organizationDonations.donationDate, new Date(currentYear, currentMonth - 1, 1)),
            lte(organizationDonations.donationDate, new Date(currentYear, currentMonth, 0))
          )
        );

      const totalExemptions = await db
        .select({ sum: sum(exemptionPurchases.exemptionValue) })
        .from(exemptionPurchases)
        .where(
          and(
            gte(exemptionPurchases.purchaseDate, new Date(currentYear, currentMonth - 1, 1)),
            lte(exemptionPurchases.purchaseDate, new Date(currentYear, currentMonth, 0))
          )
        );

      const donations = Number(totalDonations[0]?.sum || 0);
      const exemptions = Number(totalExemptions[0]?.sum || 0);
      const total = donations + exemptions;
      
      const transparencyScore = total > 0 ? Math.min(95, Math.max(60, (donations / total) * 100)) : 0;

      const [newIndex] = await db
        .insert(transparencyIndexes)
        .values({
          organizationId: 1, // Default organization
          month: currentMonth,
          year: currentYear,
          totalDonations: donations.toString(),
          totalExemptions: exemptions.toString()
        })
        .returning();

      return res.json(newIndex);
    }

    res.json(transparencyData[0]);
  } catch (error) {
    console.error('Error fetching transparency data:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;