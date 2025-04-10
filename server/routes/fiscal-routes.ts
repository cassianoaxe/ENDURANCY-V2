import { Request, Response } from 'express';
import { db } from '../db';
import { 
  fiscalConfigs, 
  fiscalDocuments, 
  fiscalDocumentItems, 
  fiscalPrinters,
  insertFiscalConfigSchema,
  insertFiscalDocumentSchema,
  insertFiscalDocumentItemSchema,
  insertFiscalPrinterSchema
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import printerService from '../services/fiscalPrinter';

// Gerenciador de configurações fiscais
export async function getFiscalConfig(req: Request, res: Response) {
  try {
    const organizationId = parseInt(req.params.organizationId);
    
    const config = await db.query.fiscalConfigs.findFirst({
      where: eq(fiscalConfigs.organizationId, organizationId)
    });

    if (!config) {
      return res.status(404).json({ message: 'Configuração fiscal não encontrada' });
    }

    return res.status(200).json(config);
  } catch (error) {
    console.error('Erro ao buscar configuração fiscal:', error);
    return res.status(500).json({ message: 'Erro ao buscar configuração fiscal' });
  }
}

export async function createFiscalConfig(req: Request, res: Response) {
  try {
    const result = insertFiscalConfigSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ message: 'Dados inválidos', errors: result.error.format() });
    }

    const data = result.data;
    
    // Verifica se já existe configuração para essa organização
    const existingConfig = await db.query.fiscalConfigs.findFirst({
      where: eq(fiscalConfigs.organizationId, data.organizationId)
    });

    if (existingConfig) {
      return res.status(400).json({ message: 'Já existe uma configuração fiscal para esta organização' });
    }

    const newConfig = await db.insert(fiscalConfigs).values(data).returning();
    
    return res.status(201).json(newConfig[0]);
  } catch (error) {
    console.error('Erro ao criar configuração fiscal:', error);
    return res.status(500).json({ message: 'Erro ao criar configuração fiscal' });
  }
}

export async function updateFiscalConfig(req: Request, res: Response) {
  try {
    const organizationId = parseInt(req.params.organizationId);
    
    const result = insertFiscalConfigSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ message: 'Dados inválidos', errors: result.error.format() });
    }

    const data = result.data;
    
    const config = await db.query.fiscalConfigs.findFirst({
      where: eq(fiscalConfigs.organizationId, organizationId)
    });

    if (!config) {
      return res.status(404).json({ message: 'Configuração fiscal não encontrada' });
    }

    const updatedConfig = await db.update(fiscalConfigs)
      .set(data)
      .where(eq(fiscalConfigs.organizationId, organizationId))
      .returning();
    
    return res.status(200).json(updatedConfig[0]);
  } catch (error) {
    console.error('Erro ao atualizar configuração fiscal:', error);
    return res.status(500).json({ message: 'Erro ao atualizar configuração fiscal' });
  }
}

// Gerenciador de documentos fiscais
export async function getDocuments(req: Request, res: Response) {
  try {
    const organizationId = parseInt(req.params.organizationId);
    
    const documents = await db.query.fiscalDocuments.findMany({
      where: eq(fiscalDocuments.organizationId, organizationId),
      orderBy: (fiscalDocuments, { desc }) => [desc(fiscalDocuments.createdAt)]
    });

    return res.status(200).json(documents);
  } catch (error) {
    console.error('Erro ao buscar documentos fiscais:', error);
    return res.status(500).json({ message: 'Erro ao buscar documentos fiscais' });
  }
}

export async function getDocumentById(req: Request, res: Response) {
  try {
    const documentId = parseInt(req.params.id);
    
    const document = await db.query.fiscalDocuments.findFirst({
      where: eq(fiscalDocuments.id, documentId),
      with: {
        items: true
      }
    });

    if (!document) {
      return res.status(404).json({ message: 'Documento fiscal não encontrado' });
    }

    return res.status(200).json(document);
  } catch (error) {
    console.error('Erro ao buscar documento fiscal:', error);
    return res.status(500).json({ message: 'Erro ao buscar documento fiscal' });
  }
}

export async function createDocument(req: Request, res: Response) {
  try {
    const result = insertFiscalDocumentSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ message: 'Dados inválidos', errors: result.error.format() });
    }

    const data = result.data;
    
    // Gera o número do documento
    // Na prática, isto seria obtido da sequência da configuração fiscal
    const nextNumber = await getNextDocumentNumber(data.organizationId);
    
    // Cria o documento fiscal
    const documentData = {
      ...data,
      documentNumber: nextNumber.toString().padStart(6, '0'),
      issuedAt: new Date(),
      accessKey: uuidv4(), // Na prática, este seria gerado pela SEFAZ
      authorizationProtocol: `${Date.now()}${Math.floor(Math.random() * 10000)}`, // Simulação
    };

    const newDocument = await db.insert(fiscalDocuments).values(documentData).returning();
    const documentId = newDocument[0].id;
    
    // Insere os itens do documento se houver
    if (req.body.items && Array.isArray(req.body.items) && req.body.items.length > 0) {
      const items = req.body.items.map((item: any) => ({
        documentId,
        productId: item.id,
        code: item.code || item.id.toString(),
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        unitOfMeasure: item.unitOfMeasure || 'UN',
        ncm: item.ncm || '00000000', // NCM padrão
        cfop: item.cfop || '5102', // CFOP padrão para venda
        taxAmount: item.taxAmount || 0,
      }));

      await db.insert(fiscalDocumentItems).values(items);
    }

    // Busca configuração fiscal para obter dados da impressora
    const config = await db.query.fiscalConfigs.findFirst({
      where: eq(fiscalConfigs.organizationId, data.organizationId)
    });

    // Impressão de documento fiscal usando o serviço da impressora
    let printResult = null;
    if (config && config.printerModel) {
      // Preparar os itens para impressão
      const fiscalItems = req.body.items.map((item: any) => ({
        code: item.code || item.id.toString(),
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        unitOfMeasure: item.unitOfMeasure || 'UN',
        taxRate: item.taxAmount ? (item.taxAmount / item.totalPrice) * 100 : 0
      }));
      
      // Criar o objeto de recibo fiscal
      const receipt = {
        documentNumber: documentData.documentNumber,
        items: fiscalItems,
        customerName: documentData.customerName,
        customerDocument: documentData.customerDocument,
        paymentMethod: documentData.paymentMethod,
        totalAmount: documentData.totalAmount,
        issuedAt: documentData.issuedAt
      };
      
      // Escolher o método de impressão adequado
      if (data.type === 'nfce') {
        printResult = printerService.printNFCe(receipt);
      } else {
        printResult = printerService.printFiscalReceipt(receipt);
      }
    }
    
    // Atualiza o número do próximo documento na configuração fiscal
    if (config) {
      await db.update(fiscalConfigs)
        .set({ nextInvoiceNumber: config.nextInvoiceNumber + 1 })
        .where(eq(fiscalConfigs.id, config.id));
    }

    return res.status(201).json({
      document: newDocument[0],
      printResult
    });
  } catch (error) {
    console.error('Erro ao criar documento fiscal:', error);
    return res.status(500).json({ message: 'Erro ao criar documento fiscal' });
  }
}

export async function cancelDocument(req: Request, res: Response) {
  try {
    const documentId = parseInt(req.params.id);
    const { cancelReason } = req.body;
    
    if (!cancelReason) {
      return res.status(400).json({ message: 'O motivo do cancelamento é obrigatório' });
    }

    const document = await db.query.fiscalDocuments.findFirst({
      where: eq(fiscalDocuments.id, documentId)
    });

    if (!document) {
      return res.status(404).json({ message: 'Documento fiscal não encontrado' });
    }

    // Verifica se o documento pode ser cancelado (prazo geralmente é de 24h)
    const issuedAt = document.issuedAt;
    if (issuedAt) {
      const now = new Date();
      const diff = now.getTime() - issuedAt.getTime();
      const diffHours = diff / (1000 * 60 * 60);
      
      if (diffHours > 24) {
        return res.status(400).json({ 
          message: 'Não é possível cancelar documentos com mais de 24 horas após a emissão' 
        });
      }
    }

    // Atualiza o status do documento para cancelado
    const updatedDocument = await db.update(fiscalDocuments)
      .set({ 
        status: 'cancelada', 
        canceledAt: new Date(),
        cancelReason
      })
      .where(eq(fiscalDocuments.id, documentId))
      .returning();
    
    return res.status(200).json(updatedDocument[0]);
  } catch (error) {
    console.error('Erro ao cancelar documento fiscal:', error);
    return res.status(500).json({ message: 'Erro ao cancelar documento fiscal' });
  }
}

// Funções de impressora
export async function testPrinter(req: Request, res: Response) {
  try {
    const { printerModel, printerPort } = req.body;
    
    if (!printerModel || !printerPort) {
      return res.status(400).json({ message: 'Modelo e porta da impressora são obrigatórios' });
    }

    // Teste de conexão com a impressora usando o serviço
    // Por enquanto, nosso serviço só suporta Bematech
    let testResult = null;
    if (printerModel.toLowerCase().includes('bematech')) {
      // Primeiro conecta
      testResult = printerService.connect();
      
      // Depois verifica o status
      if (testResult.success) {
        testResult = printerService.checkStatus();
      }
      
      // Imprime uma página de teste se conectado com sucesso
      if (testResult.success) {
        testResult = printerService.printTestPage();
      }
    } else {
      // Implementar para outros modelos quando necessário
      testResult = { 
        success: false, 
        code: 99,
        message: 'Modelo de impressora não suportado' 
      };
    }

    return res.status(200).json(testResult);
  } catch (error) {
    console.error('Erro ao testar impressora fiscal:', error);
    return res.status(500).json({ message: 'Erro ao testar impressora fiscal' });
  }
}

export async function openCashDrawer(req: Request, res: Response) {
  try {
    const { organizationId } = req.params;
    
    // Busca configuração fiscal para obter dados da impressora
    const config = await db.query.fiscalConfigs.findFirst({
      where: eq(fiscalConfigs.organizationId, parseInt(organizationId))
    });

    if (!config || !config.printerModel || !config.printerPort) {
      return res.status(400).json({ message: 'Impressora não configurada' });
    }

    // Abertura da gaveta usando o serviço da impressora
    let result = null;
    if (config.printerModel.toLowerCase().includes('bematech')) {
      // Primeiro conecta com a impressora
      const connectResult = printerService.connect();
      
      // Se conectou com sucesso, tenta abrir a gaveta
      if (connectResult.success) {
        result = printerService.openCashDrawer();
      } else {
        result = connectResult;
      }
    } else {
      // Implementar para outros modelos quando necessário
      result = { 
        success: false, 
        code: 99,
        message: 'Modelo de impressora não suportado' 
      };
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Erro ao abrir gaveta de dinheiro:', error);
    return res.status(500).json({ message: 'Erro ao abrir gaveta de dinheiro' });
  }
}

export async function printDailyReport(req: Request, res: Response) {
  try {
    const { organizationId } = req.params;
    
    // Busca configuração fiscal para obter dados da impressora
    const config = await db.query.fiscalConfigs.findFirst({
      where: eq(fiscalConfigs.organizationId, parseInt(organizationId))
    });

    if (!config || !config.printerModel || !config.printerPort) {
      return res.status(400).json({ message: 'Impressora não configurada' });
    }

    // Busca documentos do dia
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const documents = await db.query.fiscalDocuments.findMany({
      where: and(
        eq(fiscalDocuments.organizationId, parseInt(organizationId)),
        eq(fiscalDocuments.status, 'emitida')
      )
    });

    // Calcula totais
    const total = documents.reduce((acc, doc) => acc + Number(doc.totalAmount), 0);
    const count = documents.length;

    // Impressão do relatório usando o serviço da impressora
    let result = null;
    if (config.printerModel.toLowerCase().includes('bematech')) {
      // Primeiro conecta com a impressora
      const connectResult = printerService.connect();
      
      // Se conectou com sucesso, imprime o relatório diário
      if (connectResult.success) {
        result = printerService.printDailySalesReport(
          new Date(),  // Data atual
          total,       // Valor total das vendas
          count        // Quantidade de vendas
        );
      } else {
        result = connectResult;
      }
    } else {
      // Implementar para outros modelos quando necessário
      result = { 
        success: false, 
        code: 99,
        message: 'Modelo de impressora não suportado' 
      };
    }

    return res.status(200).json({
      report: {
        date: new Date(),
        totalAmount: total,
        documentCount: count
      },
      printResult: result
    });
  } catch (error) {
    console.error('Erro ao imprimir relatório diário:', error);
    return res.status(500).json({ message: 'Erro ao imprimir relatório diário' });
  }
}

// Funções auxiliares
async function getNextDocumentNumber(organizationId: number): Promise<number> {
  // Busca a configuração fiscal da organização
  const config = await db.query.fiscalConfigs.findFirst({
    where: eq(fiscalConfigs.organizationId, organizationId)
  });

  if (config && config.nextInvoiceNumber) {
    return config.nextInvoiceNumber;
  }

  // Se não existir configuração, começa do 1
  return 1;
}