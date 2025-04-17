/**
 * Rotas para gerenciamento de pedidos de pacientes e integração com o sistema de vendas/expedição
 */
import { Express, Request, Response } from 'express';
import { db } from './db';
import { authenticate } from './routes';
import { orders } from '../shared/schema';
import { eq, and, sql, or, like, ilike, desc, asc } from 'drizzle-orm';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Define nossa própria interface para solicitações autenticadas
interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    username: string;
    role: string;
    organizationId?: number;
  };
}

// Schema de validação para novos pedidos
const orderSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    discountPrice: z.number().optional(),
    quantity: z.number(),
    image: z.string().optional(),
  })),
  customerName: z.string(),
  customerEmail: z.string().email(),
  total: z.number(),
  deliveryMethod: z.enum(['standard', 'express', 'pickup']),
  shippingAddress: z.object({
    street: z.string(),
    number: z.string(),
    complement: z.string().optional(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
  }).optional(),
  paymentMethod: z.enum(['credit', 'pix', 'bankslip']),
  paymentDetails: z.object({
    cardLastDigits: z.string().optional(),
    installments: z.string().optional(),
  }).optional(),
  organizationId: z.number().optional(),
  notes: z.string().optional(),
  requiredPrescription: z.boolean().optional(),
  prescriptionId: z.string().optional(),
});

type OrderData = z.infer<typeof orderSchema>;

export function registerPatientOrdersRoutes(app: Express) {
  // Endpoint para criar um novo pedido
  app.post('/api/patient/orders', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Verificar permissões
      if (req.user.role !== 'patient') {
        return res.status(403).json({
          error: 'Apenas pacientes podem fazer pedidos'
        });
      }

      // Validar dados do pedido
      const orderData = orderSchema.parse(req.body);
      
      // Gerar número do pedido com prefixo e data
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      
      // Contar pedidos existentes para incrementar o número sequencial
      const existingOrdersCount = await db.select({ count: db.fn.count() }).from(orders);
      const orderCount = parseInt(existingOrdersCount[0].count.toString() || '0') + 1;
      const orderNumber = `PED-${year}${month}-${String(orderCount).padStart(5, '0')}`;
      
      // Preparar itens do pedido como JSON para armazenamento
      const itemsJson = JSON.stringify(orderData.items);
      
      // Inserir o pedido no banco de dados
      // Definir o status inicial do pedido
      const initialStatus = 'pending';
      
      // Garantir que temos uma organização correta para o pedido
      const targetOrganizationId = orderData.organizationId || req.user.organizationId || 1;
      
      const newOrder = await db.insert(orders).values({
        customerName: orderData.customerName,
        status: initialStatus,
        total: orderData.total,
        items: orderData.items.map(item => JSON.stringify(item)),
        organizationId: targetOrganizationId,
        paymentMethod: orderData.paymentMethod,
        description: JSON.stringify({
          deliveryMethod: orderData.deliveryMethod,
          shippingAddress: orderData.shippingAddress,
          paymentDetails: orderData.paymentDetails,
          notes: orderData.notes,
          orderNumber,
          requiredPrescription: orderData.requiredPrescription,
          prescriptionId: orderData.prescriptionId,
          userId: req.user?.id,
          customerEmail: orderData.customerEmail,
          // Campos adicionais para integração com sistemas de vendas e expedição
          isPatientOrder: true, // Marca como pedido de paciente para filtragem
          orderType: 'patient_purchase', // Tipo do pedido para classificação
          paymentStatus: 'pending', // Status do pagamento
          shippingStatus: null, // Status do envio
          trackingCode: null, // Código de rastreio
          expeditionStatus: null, // Status na expedição
          stockProcessed: false, // Se já foi processado no estoque
          itemCount: orderData.items.length // Quantidade de itens no pedido
        })
      }).returning();
      
      console.log(`Novo pedido de paciente criado: ${orderNumber} (ID: ${newOrder[0].id}) para organização ${targetOrganizationId}`);
      
      // Enviar resposta com o pedido criado
      res.status(201).json({
        order: {
          ...newOrder[0],
          orderNumber,
        },
        message: 'Pedido criado com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao criar pedido:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: error.errors
        });
      }
      
      res.status(500).json({
        error: 'Erro ao processar pedido',
        message: error.message
      });
    }
  });

  // Endpoint para listar pedidos do paciente logado
  app.get('/api/patient/orders', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Verificar permissões
      if (req.user.role !== 'patient') {
        return res.status(403).json({
          error: 'Acesso não autorizado'
        });
      }

      // Buscar pedidos do paciente atual
      const patientOrders = await db.select().from(orders)
        .where(
          // Procurar na descrição JSON por pedidos que contenham o ID do usuário
          // Esta é uma solução temporária até termos um campo dedicado
          db.sql`CAST(${orders.description} AS TEXT) LIKE ${'%"userId":' + req.user.id + '%'}`
        );
      
      // Processar resultados para extrair o número do pedido e outras informações adicionais da descrição
      const processedOrders = patientOrders.map(order => {
        let additionalInfo = {};
        let orderNumber = '';
        
        try {
          if (order.description) {
            const descriptionObj = JSON.parse(order.description as string);
            additionalInfo = descriptionObj;
            orderNumber = descriptionObj.orderNumber || '';
          }
        } catch (e) {
          console.error('Erro ao processar descrição do pedido:', e);
        }
        
        return {
          ...order,
          orderNumber,
          additionalInfo
        };
      });
      
      res.json(processedOrders);
    } catch (error: any) {
      console.error('Erro ao buscar pedidos:', error);
      res.status(500).json({
        error: 'Erro ao buscar pedidos',
        message: error.message
      });
    }
  });

  // Endpoint para buscar detalhes de um pedido específico
  app.get('/api/patient/orders/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const orderId = parseInt(req.params.id);
      
      if (isNaN(orderId)) {
        return res.status(400).json({
          error: 'ID de pedido inválido'
        });
      }
      
      // Verificar permissões
      if (req.user.role !== 'patient') {
        return res.status(403).json({
          error: 'Acesso não autorizado'
        });
      }
      
      // Buscar o pedido
      const order = await db.select().from(orders)
        .where(
          and(
            eq(orders.id, orderId),
            // Garantir que o pedido pertence ao paciente logado
            db.sql`CAST(${orders.description} AS TEXT) LIKE ${'%"userId":' + req.user.id + '%'}`
          )
        );
      
      if (!order.length) {
        return res.status(404).json({
          error: 'Pedido não encontrado'
        });
      }
      
      // Processar informações adicionais
      let additionalInfo = {};
      let orderNumber = '';
      
      try {
        if (order[0].description) {
          const descriptionObj = JSON.parse(order[0].description as string);
          additionalInfo = descriptionObj;
          orderNumber = descriptionObj.orderNumber || '';
        }
      } catch (e) {
        console.error('Erro ao processar descrição do pedido:', e);
      }
      
      // Enviar resposta com detalhes completos
      res.json({
        ...order[0],
        orderNumber,
        additionalInfo
      });
    } catch (error: any) {
      console.error('Erro ao buscar detalhes do pedido:', error);
      res.status(500).json({
        error: 'Erro ao buscar detalhes do pedido',
        message: error.message
      });
    }
  });

  // Endpoint para atualizar o status de um pedido
  app.patch('/api/organization/orders/:id/status', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Verificar permissões
      if (!['org_admin', 'admin', 'pharmacist', 'expedition'].includes(req.user.role)) {
        return res.status(403).json({
          error: 'Acesso não autorizado'
        });
      }
      
      const orderId = parseInt(req.params.id);
      
      if (isNaN(orderId)) {
        return res.status(400).json({
          error: 'ID de pedido inválido'
        });
      }
      
      // Validar dados da atualização
      const { status, trackingCode, notes } = req.body;
      
      if (!status) {
        return res.status(400).json({
          error: 'Status é obrigatório'
        });
      }
      
      // Verificar se o status é válido
      const validStatuses = [
        'pending',           // Pendente (inicial)
        'approved',          // Aprovado
        'payment_confirmed', // Pagamento confirmado
        'in_preparation',    // Em preparação
        'shipped',           // Enviado
        'delivered',         // Entregue
        'cancelled',         // Cancelado
        'refunded'           // Reembolsado
      ];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: 'Status inválido',
          validStatuses
        });
      }
      
      // Buscar o pedido atual
      const order = await db.select().from(orders).where(eq(orders.id, orderId));
      
      if (!order.length) {
        return res.status(404).json({
          error: 'Pedido não encontrado'
        });
      }
      
      // Se for um usuário da organização, verificar se o pedido pertence à organização
      if (req.user.role !== 'admin' && req.user.organizationId) {
        if (order[0].organizationId !== req.user.organizationId) {
          return res.status(403).json({
            error: 'Este pedido não pertence à sua organização'
          });
        }
      }
      
      // Extrair informações adicionais do pedido
      let additionalInfo = {};
      try {
        if (order[0].description) {
          additionalInfo = JSON.parse(order[0].description as string);
        }
      } catch (e) {
        console.error('Erro ao processar descrição do pedido:', e);
      }
      
      // Atualizar informações adicionais
      const updatedInfo = {
        ...additionalInfo,
        lastStatusUpdate: new Date().toISOString(),
        statusHistory: [
          ...(additionalInfo?.statusHistory || []),
          {
            status,
            date: new Date().toISOString(),
            userId: req.user.id,
            notes: notes || undefined
          }
        ]
      };
      
      // Se foi fornecido um código de rastreio, adicionar às informações
      if (trackingCode) {
        updatedInfo.trackingCode = trackingCode;
        updatedInfo.shippingStatus = 'shipped';
      }
      
      // Atualizar o pedido
      await db.update(orders)
        .set({
          status,
          updatedAt: new Date(),
          description: JSON.stringify(updatedInfo)
        })
        .where(eq(orders.id, orderId));
      
      // Se o pedido foi atualizado para um status que requer atualização de estoque
      if (status === 'payment_confirmed' && !updatedInfo.stockProcessed) {
        try {
          // Aqui adicionaríamos a lógica para reservar os itens no estoque
          // Isso será implementado quando tivermos o módulo de estoque completo
          console.log(`Reservando itens do pedido ${orderId} no estoque`);
          
          // Marcar que o estoque foi processado
          updatedInfo.stockProcessed = true;
          await db.update(orders)
            .set({
              description: JSON.stringify(updatedInfo)
            })
            .where(eq(orders.id, orderId));
        } catch (stockError) {
          console.error('Erro ao processar estoque:', stockError);
          // Continuamos mesmo se houver erro no estoque, mas logamos
        }
      }
      
      // Enviar resposta com o pedido atualizado
      res.json({
        id: orderId,
        status,
        message: 'Status do pedido atualizado com sucesso',
        trackingCode: updatedInfo.trackingCode
      });
    } catch (error: any) {
      console.error('Erro ao atualizar status do pedido:', error);
      res.status(500).json({
        error: 'Erro ao atualizar status do pedido',
        message: error.message
      });
    }
  });
  
  // Endpoint para listar pedidos que precisam ser expedidos
  app.get('/api/organization/orders/expedition', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Verificar permissões
      if (!['org_admin', 'admin', 'expedition', 'pharmacist'].includes(req.user.role)) {
        return res.status(403).json({
          error: 'Acesso não autorizado'
        });
      }
      
      const organizationId = req.user.organizationId;
      
      if (!organizationId && req.user.role !== 'admin') {
        return res.status(400).json({
          error: 'Organização não especificada'
        });
      }
      
      // Buscar pedidos que estão prontos para expedição
      // Isso inclui pedidos com status 'payment_confirmed' ou 'in_preparation'
      let expeditionOrders = await db.select().from(orders)
        .where(
          and(
            // Filtrar por organização
            eq(orders.organizationId as any, organizationId as number),
            // Apenas pedidos com status que precisam ser expedidos
            or(
              eq(orders.status as any, 'payment_confirmed'),
              eq(orders.status as any, 'in_preparation')
            )
          )
        )
        .orderBy(desc(orders.createdAt as any));
      
      // Processar resultados para extrair informações adicionais
      const processedOrders = expeditionOrders.map(order => {
        let additionalInfo = {};
        let orderNumber = '';
        let isPatientOrder = false;
        
        try {
          if (order.description) {
            const descriptionObj = JSON.parse(order.description as string);
            additionalInfo = descriptionObj;
            orderNumber = descriptionObj.orderNumber || '';
            isPatientOrder = descriptionObj.isPatientOrder || false;
          }
        } catch (e) {
          console.error('Erro ao processar descrição do pedido:', e);
        }
        
        return {
          ...order,
          orderNumber,
          isPatientOrder,
          additionalInfo
        };
      });
      
      res.json(processedOrders);
    } catch (error: any) {
      console.error('Erro ao buscar pedidos para expedição:', error);
      res.status(500).json({
        error: 'Erro ao buscar pedidos para expedição',
        message: error.message
      });
    }
  });
  
  // Endpoint para listar os pedidos de uma organização
  app.get('/api/organization/orders', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Verificar permissões
      if (!['org_admin', 'admin', 'pharmacist'].includes(req.user.role)) {
        return res.status(403).json({
          error: 'Acesso não autorizado'
        });
      }
      
      const organizationId = req.user.organizationId;
      
      if (!organizationId && req.user.role !== 'admin') {
        return res.status(400).json({
          error: 'Organização não especificada'
        });
      }
      
      // Parâmetros de filtro da consulta
      const { type, status, date_start, date_end, search } = req.query;
      
      // Construir consulta com filtros
      let query = db.select().from(orders);
      
      // Adicionar filtro de organização
      if (req.user.role !== 'admin' || organizationId) {
        query = query.where(eq(orders.organizationId as any, organizationId as number));
      }
      
      // Adicionar filtro por tipo de pedido (patient ou sales)
      if (type === 'patient') {
        // Apenas pedidos marcados como patient
        query = query.where(
          db.sql`CAST(${orders.description} AS TEXT) LIKE ${'%"isPatientOrder":true%'}`
        );
      } else if (type === 'sales') {
        // Apenas pedidos que não são de pacientes
        query = query.where(
          db.sql`(CAST(${orders.description} AS TEXT) NOT LIKE ${'%"isPatientOrder"%'} OR CAST(${orders.description} AS TEXT) LIKE ${'%"isPatientOrder":false%'})`
        );
      }
      
      // Adicionar filtro por status
      if (status) {
        query = query.where(eq(orders.status as any, status as string));
      }
      
      // Adicionar filtro por data
      if (date_start) {
        const startDate = new Date(date_start as string);
        if (!isNaN(startDate.getTime())) {
          query = query.where(
            db.sql`${orders.createdAt} >= ${startDate.toISOString()}`
          );
        }
      }
      
      if (date_end) {
        const endDate = new Date(date_end as string);
        if (!isNaN(endDate.getTime())) {
          // Adicionar 1 dia para incluir pedidos feitos no próprio dia final
          endDate.setDate(endDate.getDate() + 1);
          query = query.where(
            db.sql`${orders.createdAt} < ${endDate.toISOString()}`
          );
        }
      }
      
      // Adicionar filtro por termo de busca
      if (search) {
        const searchTerm = `%${search}%`;
        query = query.where(
          or(
            db.sql`CAST(${orders.customerName} AS TEXT) ILIKE ${searchTerm}`,
            db.sql`CAST(${orders.description} AS TEXT) ILIKE ${searchTerm}`
          )
        );
      }
      
      // Executar a consulta
      const organizationOrders = await query;
      
      // Processar resultados
      const processedOrders = organizationOrders.map(order => {
        let additionalInfo = {};
        let orderNumber = '';
        
        try {
          if (order.description) {
            const descriptionObj = JSON.parse(order.description as string);
            additionalInfo = descriptionObj;
            orderNumber = descriptionObj.orderNumber || '';
          }
        } catch (e) {
          console.error('Erro ao processar descrição do pedido:', e);
        }
        
        return {
          ...order,
          orderNumber,
          additionalInfo
        };
      });
      
      res.json(processedOrders);
    } catch (error: any) {
      console.error('Erro ao buscar pedidos da organização:', error);
      res.status(500).json({
        error: 'Erro ao buscar pedidos da organização',
        message: error.message
      });
    }
  });
}