import { Router, Request, Response } from 'express';
import { createAndSendPaymentLink, validatePaymentToken, processPaymentFromToken } from '../services/payment-links';
import { db } from '../db';
import { organizations, plans } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Criar router para as rotas de links de pagamento
const paymentLinksRouter = Router();

// Schema de validação para criação de link de pagamento
const createPaymentLinkSchema = z.object({
  organizationId: z.number().positive(),
  planId: z.number().positive(),
  email: z.string().email(),
});

// Rota para criar e enviar link de pagamento
paymentLinksRouter.post('/create', async (req: Request, res: Response) => {
  try {
    // Validar o corpo da requisição
    const validatedData = createPaymentLinkSchema.parse(req.body);
    
    // Buscar informações adicionais necessárias
    const [organization] = await db.select()
      .from(organizations)
      .where(eq(organizations.id, validatedData.organizationId));
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organização não encontrada'
      });
    }
    
    // Buscar detalhes do plano
    const [plan] = await db.select().from(plans).where(eq(plans.id, validatedData.planId));
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plano não encontrado'
      });
    }
    
    // Criar e enviar link de pagamento
    const result = await createAndSendPaymentLink({
      organizationId: validatedData.organizationId,
      planId: validatedData.planId,
      email: validatedData.email,
      adminName: organization.adminName || 'Administrador',
      organizationName: organization.name,
    });
    
    if (result) {
      return res.status(200).json({
        success: true,
        message: 'Link de pagamento enviado com sucesso'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Falha ao enviar link de pagamento'
      });
    }
  } catch (error: any) {
    console.error('Erro na rota de criação de link de pagamento:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors
      });
    }
    
    return res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
});

// Rota para verificar se um token é válido
paymentLinksRouter.get('/validate/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token não fornecido'
      });
    }
    
    const validation = await validatePaymentToken(token);
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }
    
    // Buscar detalhes do plano para retornar informações completas
    const [plan] = await db.select().from(plans).where(eq(plans.id, validation.planId!));
    const [organization] = await db.select().from(organizations).where(eq(organizations.id, validation.organizationId!));
    
    return res.status(200).json({
      success: true,
      message: 'Token válido',
      data: {
        organizationId: validation.organizationId,
        organizationName: organization?.name,
        planId: validation.planId,
        planName: plan?.name,
        planPrice: plan?.price,
      }
    });
  } catch (error: any) {
    console.error('Erro na rota de validação de token:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
});

// Schema de validação para processamento de pagamento
const processPaymentSchema = z.object({
  token: z.string(),
  paymentMethodId: z.string(),
});

// Rota para processar pagamento a partir de um token
paymentLinksRouter.post('/process', async (req: Request, res: Response) => {
  try {
    // Validar o corpo da requisição
    const validatedData = processPaymentSchema.parse(req.body);
    
    // Processar o pagamento
    const result = await processPaymentFromToken(
      validatedData.token,
      validatedData.paymentMethodId
    );
    
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    console.error('Erro na rota de processamento de pagamento:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors
      });
    }
    
    return res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
});

// Rota para criar um token de teste (apenas para desenvolvimento)
paymentLinksRouter.get('/create-test-token', async (req: Request, res: Response) => {
  try {
    // Verificar se estamos em ambiente de desenvolvimento
    if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
      return res.status(403).json({
        success: false,
        message: 'Esta rota só está disponível em ambiente de desenvolvimento'
      });
    }
    
    // Buscar um plano e uma organização para teste
    const [plan] = await db.select().from(plans).orderBy(plans.id);
    const [organization] = await db.select().from(organizations).orderBy(organizations.id);
    
    if (!plan || !organization) {
      return res.status(404).json({
        success: false,
        message: 'Não foi possível encontrar um plano ou organização para teste'
      });
    }
    
    // Criar o token único para este link de pagamento
    const token = uuidv4();
    const now = new Date();
    // Token expira em 1 hora
    const expiresAt = new Date(now.getTime() + (60 * 60 * 1000));
    
    // Armazenar o token temporariamente para testes (usando o mesmo mecanismo do serviço)
    // @ts-ignore - Acessando mecanismo interno para teste
    const paymentTokens = (await import('../services/payment-links')).paymentTokens;
    paymentTokens.push({
      token,
      organizationId: organization.id,
      planId: plan.id,
      email: organization.email || 'test@example.com',
      createdAt: now,
      expiresAt,
      used: false
    });
    
    return res.status(200).json({
      success: true,
      message: 'Token de teste criado com sucesso',
      token,
      paymentUrl: `/payment/${token}`,
      organization: {
        id: organization.id,
        name: organization.name
      },
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.price
      }
    });
  } catch (error: any) {
    console.error('Erro ao criar token de teste:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
});

export default paymentLinksRouter;