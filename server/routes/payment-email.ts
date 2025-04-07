import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { eq, desc, sql } from 'drizzle-orm';
import { plans, organizations, orders, users } from '@shared/schema';
import { generatePaymentLink, sendPaymentEmail, processPaymentConfirmation } from '../services/emailPaymentService';

export const paymentEmailRouter = Router();

/**
 * Rota para gerar um link de pagamento e enviar por email
 */
paymentEmailRouter.post("/api/payment-email/generate", async (req: Request, res: Response) => {
  const schema = z.object({
    organizationId: z.number(),
    planId: z.number(),
    email: z.string().email(),
    name: z.string()
  });

  try {
    const { organizationId, planId, email, name } = schema.parse(req.body);
    
    // Verificar se a organização existe
    const [organization] = await db.select().from(organizations)
      .where(eq(organizations.id, organizationId));
    
    if (!organization) {
      return res.status(404).json({ success: false, message: "Organização não encontrada" });
    }
    
    // Verificar se o plano existe
    const [plan] = await db.select().from(plans)
      .where(eq(plans.id, planId));
    
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plano não encontrado" });
    }
    
    // Gerar link de pagamento
    const paymentLink = await generatePaymentLink(organizationId, planId);
    
    // Enviar email com o link de pagamento
    await sendPaymentEmail(email, name, organization.name, plan.name, parseFloat(plan.price), paymentLink);
    
    // Registrar o pedido no banco de dados
    await db.insert(orders).values({
      organizationId,
      planId,
      status: 'pending',
      customerName: name,
      customerEmail: email,
      total: plan.price,
      details: JSON.stringify({
        planName: plan.name,
        planDescription: plan.description,
        organizationName: organization.name
      }),
      paymentMethod: 'email',
      paymentToken: paymentLink.split('/').pop(), // Extrair o token do link
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.json({
      success: true,
      message: `Link de pagamento enviado para ${email} com sucesso.`
    });
  } catch (error) {
    console.error('Erro ao gerar link de pagamento:', error);
    res.status(500).json({
      success: false,
      message: "Erro ao gerar link de pagamento. Por favor, tente novamente."
    });
  }
});

/**
 * Rota para confirmar um pagamento através do token
 */
paymentEmailRouter.post("/api/payment-email/confirm", async (req: Request, res: Response) => {
  const schema = z.object({
    token: z.string()
  });

  try {
    const { token } = schema.parse(req.body);
    
    // Processar a confirmação do pagamento
    const result = await processPaymentConfirmation(token);
    
    if (result.success) {
      res.json({
        success: true,
        message: "Pagamento confirmado com sucesso!",
        order: result.order
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error);
    res.status(500).json({
      success: false,
      message: "Erro ao processar confirmação de pagamento. Por favor, tente novamente."
    });
  }
});

/**
 * Rota para obter detalhes de um pagamento pelo token
 */
paymentEmailRouter.get("/api/payment-email/details/:token", async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    // Buscar o pedido pelo token
    const [order] = await db.select().from(orders)
      .where(eq(orders.paymentToken, token))
      .orderBy(desc(orders.createdAt))
      .limit(1);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pedido não encontrado. O token pode ser inválido ou expirado."
      });
    }
    
    // Buscar organização
    const [organization] = await db.select().from(organizations)
      .where(eq(organizations.id, order.organizationId));
    
    // Buscar plano
    const [plan] = await db.select().from(plans)
      .where(eq(plans.id, order.planId));
    
    // Adicionar detalhes do plano e da organização
    const orderDetails = {
      ...order,
      planName: plan?.name || 'Plano não encontrado',
      organizationName: organization?.name || 'Organização não encontrada'
    };
    
    res.json({
      success: true,
      order: orderDetails
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes do pagamento:', error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar detalhes do pagamento. Por favor, tente novamente."
    });
  }
});