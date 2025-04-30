import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { db } from '../db'; 
import { eq } from 'drizzle-orm';
import { socialBeneficiaries } from '@shared/schema-social';

export const socialBeneficiariesBatchRouter = Router();

// Estender a interface IStorage para adicionar os métodos necessários
declare module '../storage' {
  interface IStorage {
    getBeneficiaryByCpf: (organizationId: number, cpf: string) => Promise<any | undefined>;
    createBeneficiary: (data: any) => Promise<any>;
  }
}

// Implementar os métodos necessários na classe storage (singleton)
storage.getBeneficiaryByCpf = async (organizationId: number, cpf: string) => {
  const [beneficiary] = await db
    .select()
    .from(socialBeneficiaries)
    .where(
      eq(socialBeneficiaries.cpf, cpf)
    );
  
  return beneficiary;
};

storage.createBeneficiary = async (data: any) => {
  const [newBeneficiary] = await db
    .insert(socialBeneficiaries)
    .values(data)
    .returning();
  
  return newBeneficiary;
};

// Esquema de validação para importação em lote
const beneficiaryImportSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().min(1, "CPF é obrigatório"),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  address: z.string().min(1, "Endereço é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  // Campos opcionais
  rg: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  phone: z.string().optional(),
  addressNumber: z.string().optional(),
  addressComplement: z.string().optional(),
  neighborhood: z.string().optional(),
  zipCode: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
  occupation: z.string().optional(),
  familyIncome: z.number().optional(),
  housingStatus: z.string().optional(),
  needsCategory: z.array(z.string()).optional(),
  gender: z.string().optional()
});

const batchImportSchema = z.object({
  beneficiaries: z.array(beneficiaryImportSchema)
});

// Rota para importação em lote de beneficiários
socialBeneficiariesBatchRouter.post('/batch-import', async (req, res) => {
  if (!req.isAuthenticated() || req.user.role !== 'org_admin') {
    return res.status(403).json({ 
      message: 'Você não tem permissão para acessar este recurso' 
    });
  }

  const organizationId = req.user.organizationId;
  if (!organizationId) {
    return res.status(400).json({ message: 'ID da organização não encontrado' });
  }

  try {
    // Validar os dados de entrada
    const validationResult = batchImportSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos no arquivo',
        errors: validationResult.error.format()
      });
    }

    const { beneficiaries } = validationResult.data;

    // Preparar resultado da importação
    const result = {
      total: beneficiaries.length,
      success: 0,
      errors: [] as Array<{ row: number; message: string }>,
    };

    // Verificar CPFs duplicados na importação
    const cpfs = new Set<string>();
    const duplicatedCpfs = new Set<string>();

    beneficiaries.forEach((beneficiary) => {
      if (cpfs.has(beneficiary.cpf)) {
        duplicatedCpfs.add(beneficiary.cpf);
      } else {
        cpfs.add(beneficiary.cpf);
      }
    });

    // Verificar CPFs já existentes no banco
    for (const cpf of cpfs) {
      const existingBeneficiary = await storage.getBeneficiaryByCpf(organizationId, cpf);
      if (existingBeneficiary) {
        duplicatedCpfs.add(cpf);
      }
    }

    // Processar cada beneficiário
    for (let i = 0; i < beneficiaries.length; i++) {
      const beneficiary = beneficiaries[i];
      
      try {
        // Verificar duplicação de CPF
        if (duplicatedCpfs.has(beneficiary.cpf)) {
          result.errors.push({
            row: i,
            message: `CPF ${beneficiary.cpf} duplicado na importação ou já existente no sistema`
          });
          continue;
        }

        // Garantir que o beneficiário pertence à organização correta
        const processedBeneficiary = {
          ...beneficiary,
          organizationId
        };

        // Criar o beneficiário
        await storage.createBeneficiary(processedBeneficiary);
        result.success++;
      } catch (error: any) {
        // Registrar erro para esta linha
        result.errors.push({
          row: i,
          message: error.message || 'Erro ao processar beneficiário'
        });
      }
    }

    // Retornar resultado
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Erro na importação em lote de beneficiários:', error);
    return res.status(500).json({ 
      message: 'Erro ao processar importação',
      error: error.message
    });
  }
});