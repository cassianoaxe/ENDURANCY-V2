import { db } from '../db';
import { plans, modulePlans, modules, organizations, organizationModules, financialTransactions } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Registra uma transação financeira para um pagamento confirmado
 */
async function registerFinancialTransaction(
  organizationId: number, 
  amount: number, 
  description: string, 
  category: string,
  referenceId: string
): Promise<void> {
  try {
    // Registrar a transação financeira como receita
    await db.insert(financialTransactions).values({
      organizationId,
      description,
      type: 'receita',
      category,
      amount: amount.toString(),
      status: 'pago',
      dueDate: new Date(),
      paymentDate: new Date(),
      documentNumber: referenceId,
      paymentMethod: 'boleto/pix/transferência',
      notes: `Pagamento manual (Ref: ${referenceId})`,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log(`Transação financeira registrada para pagamento: ${referenceId}`);
  } catch (error) {
    // Log do erro, mas não interromper o fluxo principal
    console.error('Erro ao registrar transação financeira:', error);
  }
}