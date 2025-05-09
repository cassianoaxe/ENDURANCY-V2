import express, { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { 
  affiliates, 
  affiliatePoints, 
  affiliateReferrals, 
  affiliateRewards, 
  affiliateRedemptions,
  promotionalMaterials,
  InsertAffiliate,
  InsertAffiliatePoint,
  InsertAffiliateReferral,
  InsertAffiliateRedemption
} from '@shared/schema/affiliates';
import { eq, and, desc } from 'drizzle-orm';
import { randomBytes } from 'crypto';

// Middlewares
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  next();
}

// Gerar código aleatório para resgates
function generateRedemptionCode(length = 8): string {
  return randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .toUpperCase()
    .slice(0, length);
}

// Criar router para os endpoints de afiliados
export const affiliatesRouter = express.Router();

// Obter dados do afiliado atual
affiliatesRouter.get('/my-affiliate', isAuthenticated, async (req, res) => {
  try {
    // Verificar se o usuário já é um afiliado
    const [affiliate] = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.userId, req.user.id));

    if (!affiliate) {
      return res.status(404).json({ error: 'Afiliado não encontrado' });
    }

    return res.json(affiliate);
  } catch (error) {
    console.error('Erro ao buscar dados do afiliado:', error);
    return res.status(500).json({ error: 'Erro ao buscar dados do afiliado' });
  }
});

// Registrar um novo afiliado
affiliatesRouter.post('/register', isAuthenticated, async (req, res) => {
  try {
    // Verificar se o usuário já é um afiliado
    const [existingAffiliate] = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.userId, req.user.id));

    if (existingAffiliate) {
      return res.status(409).json({ error: 'Usuário já é um afiliado' });
    }

    // Gerar código de afiliado único
    const affiliateCode = `${req.user.username.substring(0, 3).toUpperCase()}${Date.now().toString().substring(7)}`;

    // Registrar novo afiliado
    const [affiliate] = await db
      .insert(affiliates)
      .values({
        userId: req.user.id,
        organizationId: req.user.organizationId,
        affiliateCode,
        type: req.user.role === 'patient' ? 'patient' : 'organization',
        isActive: true
      })
      .returning();

    // Adicionar pontos iniciais
    await db
      .insert(affiliatePoints)
      .values({
        affiliateId: affiliate.id,
        points: 10,
        activityType: 'registration',
        description: 'Bônus de inscrição no programa'
      });

    return res.status(201).json(affiliate);
  } catch (error) {
    console.error('Erro ao registrar afiliado:', error);
    return res.status(500).json({ error: 'Erro ao registrar afiliado' });
  }
});

// Histórico de pontos do afiliado
affiliatesRouter.get('/points-history', isAuthenticated, async (req, res) => {
  try {
    // Buscar o afiliado do usuário atual
    const [affiliate] = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.userId, req.user.id));

    if (!affiliate) {
      return res.status(404).json({ error: 'Afiliado não encontrado' });
    }

    // Buscar histórico de pontos
    const pointsHistory = await db
      .select()
      .from(affiliatePoints)
      .where(eq(affiliatePoints.affiliateId, affiliate.id))
      .orderBy(desc(affiliatePoints.createdAt));

    return res.json(pointsHistory);
  } catch (error) {
    console.error('Erro ao buscar histórico de pontos:', error);
    return res.status(500).json({ error: 'Erro ao buscar histórico de pontos' });
  }
});

// Listar referências do afiliado
affiliatesRouter.get('/referrals', isAuthenticated, async (req, res) => {
  try {
    // Buscar o afiliado do usuário atual
    const [affiliate] = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.userId, req.user.id));

    if (!affiliate) {
      return res.status(404).json({ error: 'Afiliado não encontrado' });
    }

    // Buscar referências
    const referrals = await db
      .select()
      .from(affiliateReferrals)
      .where(eq(affiliateReferrals.referrerId, affiliate.id))
      .orderBy(desc(affiliateReferrals.createdAt));

    return res.json(referrals);
  } catch (error) {
    console.error('Erro ao buscar referências:', error);
    return res.status(500).json({ error: 'Erro ao buscar referências' });
  }
});

// Listar recompensas disponíveis
affiliatesRouter.get('/rewards', isAuthenticated, async (req, res) => {
  try {
    // Buscar recompensas ativas
    const rewards = await db
      .select()
      .from(affiliateRewards)
      .where(eq(affiliateRewards.isActive, true));

    return res.json(rewards);
  } catch (error) {
    console.error('Erro ao buscar recompensas:', error);
    return res.status(500).json({ error: 'Erro ao buscar recompensas' });
  }
});

// Resgatar recompensa
affiliatesRouter.post('/redeem-reward', isAuthenticated, async (req, res) => {
  try {
    const { rewardId } = req.body;

    if (!rewardId) {
      return res.status(400).json({ error: 'ID da recompensa não fornecido' });
    }

    // Buscar o afiliado
    const [affiliate] = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.userId, req.user.id));

    if (!affiliate) {
      return res.status(404).json({ error: 'Afiliado não encontrado' });
    }

    // Buscar a recompensa
    const [reward] = await db
      .select()
      .from(affiliateRewards)
      .where(and(
        eq(affiliateRewards.id, rewardId),
        eq(affiliateRewards.isActive, true)
      ));

    if (!reward) {
      return res.status(404).json({ error: 'Recompensa não encontrada ou inativa' });
    }

    // Verificar pontos suficientes
    if (affiliate.points < reward.pointsCost) {
      return res.status(400).json({ error: 'Pontos insuficientes para resgatar esta recompensa' });
    }

    // Verificar disponibilidade de quantidades limitadas
    if (reward.limitedQuantity && reward.quantityAvailable !== null && reward.quantityAvailable <= 0) {
      return res.status(400).json({ error: 'Recompensa esgotada' });
    }

    // Gerar código de resgate
    const redemptionCode = generateRedemptionCode();

    // Criar resgate
    const [redemption] = await db
      .insert(affiliateRedemptions)
      .values({
        affiliateId: affiliate.id,
        rewardId: reward.id,
        pointsSpent: reward.pointsCost,
        status: 'pending',
        code: redemptionCode
      })
      .returning();

    // Atualizar pontos do afiliado
    await db
      .update(affiliates)
      .set({ 
        points: affiliate.points - reward.pointsCost,
        totalRedeemed: affiliate.totalRedeemed + reward.pointsCost
      })
      .where(eq(affiliates.id, affiliate.id));

    // Registrar atividade de resgate no histórico de pontos
    await db
      .insert(affiliatePoints)
      .values({
        affiliateId: affiliate.id,
        points: -reward.pointsCost,
        activityType: 'redemption',
        description: `Resgate de recompensa: ${reward.name}`,
        referenceId: redemption.id
      });

    // Atualizar quantidade disponível da recompensa, se aplicável
    if (reward.limitedQuantity && reward.quantityAvailable !== null) {
      await db
        .update(affiliateRewards)
        .set({ quantityAvailable: reward.quantityAvailable - 1 })
        .where(eq(affiliateRewards.id, reward.id));
    }

    return res.json({ 
      success: true, 
      message: 'Resgate realizado com sucesso',
      code: redemptionCode
    });
  } catch (error) {
    console.error('Erro ao resgatar recompensa:', error);
    return res.status(500).json({ error: 'Erro ao resgatar recompensa' });
  }
});

// Registrar referência de afiliado
affiliatesRouter.post('/register-referral', isAuthenticated, async (req, res) => {
  try {
    const { referralCode, userId } = req.body;

    if (!referralCode || !userId) {
      return res.status(400).json({ error: 'Código de referência e ID de usuário são obrigatórios' });
    }

    // Buscar o afiliado referente (pelo código)
    const [referrer] = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.affiliateCode, referralCode));

    if (!referrer) {
      return res.status(404).json({ error: 'Código de afiliado inválido' });
    }

    // Verificar se o usuário a ser referido já é um afiliado
    const [existingReferredAffiliate] = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.userId, userId));

    // Se não for, registrar como afiliado primeiro
    if (!existingReferredAffiliate) {
      // Lógica para registrar o novo afiliado
      return res.status(400).json({ error: 'O usuário referido precisa se registrar como afiliado primeiro' });
    }

    // Verificar se a referência já existe
    const [existingReferral] = await db
      .select()
      .from(affiliateReferrals)
      .where(and(
        eq(affiliateReferrals.referrerId, referrer.id),
        eq(affiliateReferrals.referredId, existingReferredAffiliate.id)
      ));

    if (existingReferral) {
      return res.status(409).json({ error: 'Esta referência já foi registrada' });
    }

    // Criar nova referência
    const [referral] = await db
      .insert(affiliateReferrals)
      .values({
        referrerId: referrer.id,
        referredId: existingReferredAffiliate.id,
        referredUserId: userId,
        isActive: true
      })
      .returning();

    // Adicionar pontos ao afiliado referente
    const pointsToAdd = 25;
    await db
      .update(affiliates)
      .set({ 
        points: referrer.points + pointsToAdd,
        totalEarned: referrer.totalEarned + pointsToAdd 
      })
      .where(eq(affiliates.id, referrer.id));

    // Registrar atividade no histórico de pontos
    await db
      .insert(affiliatePoints)
      .values({
        affiliateId: referrer.id,
        points: pointsToAdd,
        activityType: 'referral_signup',
        description: 'Indicação cadastrada com sucesso',
        referenceId: referral.id
      });

    return res.json({ 
      success: true, 
      message: 'Referência registrada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao registrar referência:', error);
    return res.status(500).json({ error: 'Erro ao registrar referência' });
  }
});

// Listar materiais promocionais
affiliatesRouter.get('/promotional-materials', isAuthenticated, async (req, res) => {
  try {
    const organizationId = req.user.organizationId || 1; // Default para id 1 se não tiver organização

    // Buscar materiais promocionais
    const materials = await db
      .select()
      .from(promotionalMaterials)
      .where(and(
        eq(promotionalMaterials.isActive, true),
        eq(promotionalMaterials.organizationId, organizationId)
      ));

    return res.json(materials);
  } catch (error) {
    console.error('Erro ao buscar materiais promocionais:', error);
    return res.status(500).json({ error: 'Erro ao buscar materiais promocionais' });
  }
});

// Atualizar dados do afiliado
affiliatesRouter.put('/update', isAuthenticated, async (req, res) => {
  try {
    // Buscar o afiliado
    const [affiliate] = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.userId, req.user.id));

    if (!affiliate) {
      return res.status(404).json({ error: 'Afiliado não encontrado' });
    }

    // Atualizar dados
    const [updatedAffiliate] = await db
      .update(affiliates)
      .set({ 
        ...req.body,
        updatedAt: new Date() 
      })
      .where(eq(affiliates.id, affiliate.id))
      .returning();

    return res.json(updatedAffiliate);
  } catch (error) {
    console.error('Erro ao atualizar afiliado:', error);
    return res.status(500).json({ error: 'Erro ao atualizar afiliado' });
  }
});

// Registrar as rotas no app principal
export function registerAffiliatesRoutes(app: express.Express) {
  app.use('/api/affiliates', affiliatesRouter);
  console.log('Rotas de afiliados registradas com sucesso');
}