import { Request, Response } from 'express';
import { db } from '../db';
import { organizations, plans } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { handlePaymentFailure } from './payment-links';

/**
 * Processar notificações de pagamento 
 * Esta função serve como ponto central para processar notificações de pagamento
 * de diferentes provedores (bancos, gateways, etc)
 */
export async function handlePaymentNotification(req: Request, res: Response) {
  try {
    const { type, organizationId, status, reference } = req.body;

    if (!type || !organizationId) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros inválidos. É necessário informar o tipo de notificação e o ID da organização.'
      });
    }

    // Buscar a organização
    const [organization] = await db.select().from(organizations).where(eq(organizations.id, organizationId));
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: `Organização com ID ${organizationId} não encontrada`
      });
    }

    // Processar diferentes tipos de notificações
    switch (type) {
      case 'payment_confirmation':
        // Lógica para confirmar pagamento manualmente
        // Já implementada no processPaymentFromToken da payment-links.ts
        console.log(`Confirmação de pagamento recebida para organização ${organizationId}`);
        return res.json({ 
          success: true,
          message: 'Notificação de confirmação de pagamento recebida'
        });
        
      case 'payment_failure':
        // Processar falha de pagamento - acionar plano gratuito
        try {
          await handlePaymentFailure(organizationId);
          console.log(`Organização ${organizationId} configurada com plano Freemium após falha no pagamento`);
          return res.json({ 
            success: true,
            message: 'Organização atualizada para o plano gratuito'
          });
        } catch (error) {
          console.error(`Erro ao processar fallback para plano gratuito: ${error}`);
          return res.status(500).json({
            success: false,
            message: 'Erro ao processar fallback para plano gratuito'
          });
        }
      
      default:
        // Tipo de notificação não reconhecido
        console.log(`Tipo de notificação não reconhecido: ${type}`);
        return res.status(400).json({
          success: false,
          message: `Tipo de notificação não reconhecido: ${type}`
        });
    }
  } catch (error: any) {
    console.error(`Erro ao processar notificação de pagamento:`, error);
    return res.status(500).json({
      success: false,
      message: `Erro ao processar notificação: ${error.message}`
    });
  }
}