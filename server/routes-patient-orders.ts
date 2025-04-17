/**
 * Rotas para gerenciamento de pedidos de pacientes
 */
import { Express, Request, Response } from 'express';
import { db } from './db';
import { authenticate } from './routes';
import { orders } from '../shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { z } from 'zod';

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
      const newOrder = await db.insert(orders).values({
        customerName: orderData.customerName,
        status: 'pending',
        total: orderData.total,
        items: orderData.items.map(item => JSON.stringify(item)),
        organizationId: orderData.organizationId,
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
        })
      }).returning();
      
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
      
      // Buscar pedidos da organização
      let organizationOrders;
      
      if (req.user.role === 'admin' && !organizationId) {
        // Admin pode ver todos os pedidos
        organizationOrders = await db.select().from(orders);
      } else {
        // Outros usuários veem apenas pedidos da sua organização
        organizationOrders = await db.select().from(orders)
          .where(eq(orders.organizationId as any, organizationId as number));
      }
      
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