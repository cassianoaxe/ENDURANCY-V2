import { Express, Request, Response } from 'express';
import { sendTemplateEmail, EmailTemplate } from '../email';
import { z } from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Schema para validação de solicitação de amostra
const sampleRequestSchema = z.object({
  companyName: z.string().min(2, 'Nome da empresa é obrigatório'),
  contactName: z.string().min(2, 'Nome do contato é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  sampleType: z.string().min(2, 'Tipo de amostra é obrigatório'),
  analysisType: z.string().min(2, 'Tipo de análise é obrigatório'),
  sampleQuantity: z.number().min(1, 'Quantidade de amostras deve ser pelo menos 1'),
  samplePreservation: z.string().optional(),
  observations: z.string().optional(),
  priority: z.enum(['normal', 'urgente']),
  needsCollection: z.boolean().default(false),
  address: z.object({
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
  }).optional(),
});

// Tipo para solicitação de amostra
type SampleRequest = z.infer<typeof sampleRequestSchema>;

// Gerador simples de ID para amostras
function generateSampleId(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ALAB-${timestamp}${random}`;
}

// Formatador de data
function formatDate(date: Date): string {
  return format(date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
}

// Mock de armazenamento para solicitações de amostras
const sampleRequests: Record<string, any> = {};

export function registerLaboratorySamplesRoutes(app: Express) {
  // Enviar nova solicitação de amostra
  app.post('/api/laboratory/samples/request', async (req: Request, res: Response) => {
    try {
      const validatedData = sampleRequestSchema.parse(req.body);
      const requestId = generateSampleId();
      const submissionDate = new Date();
      
      // Armazenar a solicitação
      sampleRequests[requestId] = {
        ...validatedData,
        id: requestId,
        status: 'pendente',
        createdAt: submissionDate,
        updatedAt: submissionDate,
      };
      
      // Enviar email de confirmação
      const portalUrl = `${req.protocol}://${req.get('host')}/laboratory/portaldeamostras`;
      
      await sendTemplateEmail(
        validatedData.email,
        `Confirmação de Solicitação de Análise #${requestId}`,
        EmailTemplate.SAMPLE_REQUEST_CONFIRMATION,
        {
          requestId,
          companyName: validatedData.companyName,
          contactName: validatedData.contactName,
          sampleType: validatedData.sampleType,
          analysisType: validatedData.analysisType,
          submissionDate: formatDate(submissionDate),
          portalUrl
        }
      );
      
      res.status(201).json({
        success: true,
        message: 'Solicitação de amostra registrada com sucesso',
        data: {
          requestId,
          submissionDate: formatDate(submissionDate)
        }
      });
    } catch (error) {
      console.error('Erro ao processar solicitação de amostra:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos na solicitação',
          errors: error.errors
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro ao processar solicitação de amostra'
      });
    }
  });
  
  // Buscar amostra por ID
  app.get('/api/laboratory/samples/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (!sampleRequests[id]) {
      return res.status(404).json({
        success: false,
        message: 'Amostra não encontrada'
      });
    }
    
    res.json({
      success: true,
      data: sampleRequests[id]
    });
  });
  
  // Atualizar status de amostra e enviar notificação
  app.post('/api/laboratory/samples/:id/update-status', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, trackingCode } = req.body;
      
      if (!sampleRequests[id]) {
        return res.status(404).json({
          success: false,
          message: 'Amostra não encontrada'
        });
      }
      
      const sample = sampleRequests[id];
      const oldStatus = sample.status;
      
      // Atualizar status
      sample.status = status;
      sample.updatedAt = new Date();
      
      if (trackingCode) {
        sample.trackingCode = trackingCode;
      }
      
      // Verificar se precisa enviar email de notificação
      const portalUrl = `${req.protocol}://${req.get('host')}/laboratory/portaldeamostras`;
      
      // Se o status mudou para "recebida", enviar email de confirmação de recebimento
      if (status === 'recebida' && oldStatus !== 'recebida') {
        const estimatedCompletionDate = new Date();
        estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + 7);
        
        await sendTemplateEmail(
          sample.email,
          `Amostra #${id} Recebida`,
          EmailTemplate.SAMPLE_RECEIVED_NOTIFICATION,
          {
            requestId: id,
            companyName: sample.companyName,
            contactName: sample.contactName,
            sampleType: sample.sampleType,
            receivedDate: formatDate(new Date()),
            estimatedCompletionDate: formatDate(estimatedCompletionDate),
            portalUrl
          }
        );
      }
      
      // Se o status mudou para "concluida", enviar email de análise completa
      if (status === 'concluida' && oldStatus !== 'concluida') {
        const reportUrl = `${req.protocol}://${req.get('host')}/laboratory/samples/${id}/report`;
        
        await sendTemplateEmail(
          sample.email,
          `Análise da Amostra #${id} Concluída`,
          EmailTemplate.SAMPLE_ANALYSIS_COMPLETE,
          {
            requestId: id,
            companyName: sample.companyName,
            contactName: sample.contactName,
            sampleType: sample.sampleType,
            completionDate: formatDate(new Date()),
            portalUrl,
            reportUrl
          }
        );
      }
      
      res.json({
        success: true,
        message: 'Status da amostra atualizado com sucesso',
        data: {
          id,
          status,
          updatedAt: formatDate(sample.updatedAt)
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar status da amostra:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar status da amostra'
      });
    }
  });
  
  // Listar amostras (com filtros opcionais)
  app.get('/api/laboratory/samples', (req: Request, res: Response) => {
    const { status, sampleType, dateStart, dateEnd } = req.query;
    
    let filteredSamples = Object.values(sampleRequests);
    
    // Aplicar filtros
    if (status) {
      filteredSamples = filteredSamples.filter(sample => sample.status === status);
    }
    
    if (sampleType) {
      filteredSamples = filteredSamples.filter(sample => sample.sampleType === sampleType);
    }
    
    if (dateStart) {
      const startDate = new Date(dateStart as string);
      filteredSamples = filteredSamples.filter(sample => new Date(sample.createdAt) >= startDate);
    }
    
    if (dateEnd) {
      const endDate = new Date(dateEnd as string);
      filteredSamples = filteredSamples.filter(sample => new Date(sample.createdAt) <= endDate);
    }
    
    // Ordenar por data de criação (mais recente primeiro)
    filteredSamples.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.json({
      success: true,
      data: filteredSamples
    });
  });
}