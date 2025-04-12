import { Express, Request, Response, NextFunction, Router } from "express";
import { db } from "../db";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { authenticate } from "../routes";
import * as schema from "@shared/schema-production";
import { organizationModules } from "@shared/schema";
import { randomUUID } from "crypto";
import { format } from "date-fns";

export const productionRouter = Router();

export async function registerProductionRoutes(app: Express) {
  // Registrar o router com as rotas do módulo de produção
  app.use('/api/production', productionRouter);

// Middleware para verificar acesso ao módulo de produção
const checkProductionAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.session?.user?.organizationId) {
      return res.status(401).json({ message: "Acesso não autorizado" });
    }

    const organizationId = req.session.user.organizationId;
    
    // Verificar se a organização tem acesso ao módulo de produção
    const moduleAccess = await db.query.organizationModules.findFirst({
      where: and(
        eq(organizationModules.organizationId, organizationId),
        eq(organizationModules.moduleId, 9), // ID do módulo de produção
        eq(organizationModules.active, true)
      )
    });

    if (!moduleAccess) {
      return res.status(403).json({ 
        message: "Sua organização não possui acesso ao módulo de Produção Industrial",
        module: "production"
      });
    }

    next();
  } catch (error) {
    console.error("Erro ao verificar acesso ao módulo de produção:", error);
    return res.status(500).json({ message: "Erro ao verificar acesso ao módulo" });
  }
};

// Função para gerar código de referência com base no tipo de item
function generateReferenceCode(type: string, prefix: string): string {
  // Obter ano e mês atual
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  
  // Gerar sequência alfanumérica aleatória de 4 caracteres
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  // Retornar código formatado: PREFIX-ANO-MES-XXXX
  return `${prefix}-${year}-${month}-${randomPart}`;
}

// Função para registrar evento na trilha de auditoria
async function logAuditTrail(
  organizationId: number, 
  userId: number, 
  username: string,
  type: string,
  category: string,
  entity: string,
  entityId: string,
  entityName: string,
  action: string,
  details: string,
  changes: any = null,
  relatedBatch: string | null = null,
  relatedIds: string[] | null = null,
  userIp: string = "127.0.0.1"
) {
  try {
    await db.insert(schema.auditTrailTable).values({
      id: randomUUID(),
      timestamp: new Date(),
      type,
      category,
      entity,
      entityId,
      entityName,
      action,
      details,
      userId,
      username,
      userIp,
      changes,
      relatedBatch,
      relatedIds,
      organizationId
    });
  } catch (error) {
    console.error("Erro ao registrar trilha de auditoria:", error);
  }
}

// Rotas para gestão de estoque (Inventory)
// Aplicar o middleware de autenticação e verificação de acesso a todas as rotas
productionRouter.use(authenticate);
productionRouter.use(checkProductionAccess);

productionRouter.get('/inventory', async (req: Request, res: Response) => {
  try {
    const organizationId = req.session.user!.organizationId!;
    
    const inventory = await db.query.inventoryTable.findMany({
      where: eq(schema.inventoryTable.organizationId, organizationId),
      orderBy: [desc(schema.inventoryTable.createdAt)]
    });
    
    return res.status(200).json(inventory);
  } catch (error) {
    console.error("Erro ao buscar estoque:", error);
    return res.status(500).json({ message: "Erro ao buscar itens do estoque" });
  }
});

productionRouter.post('/inventory', async (req: Request, res: Response) => {
  try {
    const organizationId = req.session.user!.organizationId!;
    const userId = req.session.user!.id;
    const username = req.session.user!.username;
    const data = req.body;
    
    // Gerar código para o item
    let prefix;
    if (data.type === "raw_material") prefix = "MP";
    else if (data.type === "in_process") prefix = "PP";
    else if (data.type === "finished_product") prefix = "PA";
    else if (data.type === "packaging") prefix = "EMB";
    else prefix = "IT";
    
    const code = generateReferenceCode(data.type, prefix);
    
    // Criar item no estoque
    const [newItem] = await db.insert(schema.inventoryTable).values({
      ...data,
      code,
      organizationId
    }).returning();
    
    // Registrar na trilha de auditoria
    await logAuditTrail(
      organizationId,
      userId,
      username,
      "create",
      "inventory",
      "inventory",
      newItem.code,
      newItem.name,
      "Criação de Item de Estoque",
      `Item ${newItem.name} adicionado ao estoque com código ${newItem.code}`
    );
    
    return res.status(201).json(newItem);
  } catch (error) {
    console.error("Erro ao criar item de estoque:", error);
    return res.status(500).json({ message: "Erro ao criar item de estoque" });
  }
});

productionRouter.get('/inventory/:id', async (req: Request, res: Response) => {
  try {
    const organizationId = req.session.user!.organizationId!;
    const { id } = req.params;
    
    const item = await db.query.inventoryTable.findFirst({
      where: and(
        eq(schema.inventoryTable.id, parseInt(id)),
        eq(schema.inventoryTable.organizationId, organizationId)
      )
    });
    
    if (!item) {
      return res.status(404).json({ message: "Item não encontrado" });
    }
    
    return res.status(200).json(item);
  } catch (error) {
    console.error("Erro ao buscar item de estoque:", error);
    return res.status(500).json({ message: "Erro ao buscar item de estoque" });
  }
});

productionRouter.put('/inventory/:id', async (req: Request, res: Response) => {
  try {
    const organizationId = req.session.user!.organizationId!;
    const userId = req.session.user!.id;
    const username = req.session.user!.username;
    const { id } = req.params;
    const data = req.body;
    
    // Buscar item atual para comparar alterações
    const existingItem = await db.query.inventoryTable.findFirst({
      where: and(
        eq(schema.inventoryTable.id, parseInt(id)),
        eq(schema.inventoryTable.organizationId, organizationId)
      )
    });
    
    if (!existingItem) {
      return res.status(404).json({ message: "Item não encontrado" });
    }
    
    // Atualizar o item
    const [updatedItem] = await db.update(schema.inventoryTable)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(schema.inventoryTable.id, parseInt(id)),
          eq(schema.inventoryTable.organizationId, organizationId)
        )
      )
      .returning();
    
    // Criar objeto com as alterações feitas
    const changes: Record<string, { before: any, after: any }> = {};
    
    Object.keys(data).forEach(key => {
      if (data[key] !== existingItem[key as keyof typeof existingItem]) {
        changes[key] = {
          before: existingItem[key as keyof typeof existingItem],
          after: data[key]
        };
      }
    });
    
    // Registrar na trilha de auditoria se houve alterações
    if (Object.keys(changes).length > 0) {
      await logAuditTrail(
        organizationId,
        userId,
        username,
        "update",
        "inventory",
        "inventory",
        updatedItem.code,
        updatedItem.name,
        "Atualização de Item de Estoque",
        `Item ${updatedItem.name} (${updatedItem.code}) foi atualizado`,
        changes,
        updatedItem.batchNumber || null
      );
    }
    
    return res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Erro ao atualizar item de estoque:", error);
    return res.status(500).json({ message: "Erro ao atualizar item de estoque" });
  }
});

// Rotas para movimentações (Movements)
productionRouter.get('/movements', async (req: Request, res: Response) => {
  try {
    const organizationId = req.session.user!.organizationId!;
    
    const movements = await db.query.movementsTable.findMany({
      where: eq(schema.movementsTable.organizationId, organizationId),
      orderBy: [desc(schema.movementsTable.date)]
    });
    
    // Buscar informações complementares dos itens
    const result = await Promise.all(movements.map(async (movement) => {
      const item = await db.query.inventoryTable.findFirst({
        where: eq(schema.inventoryTable.id, movement.itemId)
      });
      
      return {
        ...movement,
        itemName: item?.name || "Item não encontrado",
        itemCode: item?.code || "---"
      };
    }));
    
    return res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao buscar movimentações:", error);
    return res.status(500).json({ message: "Erro ao buscar movimentações" });
  }
});

productionRouter.post('/movements', async (req: Request, res: Response) => {
  try {
    const organizationId = req.session.user!.organizationId!;
    const userId = req.session.user!.id;
    const username = req.session.user!.username;
    const data = req.body;
    
    // Gerar código para a movimentação
    let prefix;
    if (data.type === "in") prefix = "ENT";
    else if (data.type === "out") prefix = "SAI";
    else if (data.type === "transfer") prefix = "TRF";
    else if (data.type === "adjustment") prefix = "AJU";
    else if (data.type === "consumption") prefix = "CON";
    else if (data.type === "production") prefix = "PRD";
    else prefix = "MOV";
    
    const code = generateReferenceCode(data.type, prefix);
    
    // Buscar informações do item
    const item = await db.query.inventoryTable.findFirst({
      where: eq(schema.inventoryTable.id, data.itemId)
    });
    
    if (!item) {
      return res.status(404).json({ message: "Item de estoque não encontrado" });
    }
    
    // Criar movimentação
    const [newMovement] = await db.insert(schema.movementsTable).values({
      ...data,
      code,
      createdById: userId,
      organizationId
    }).returning();
    
    // Atualizar estoque conforme tipo de movimentação
    const quantityChange = data.type === "in" || data.type === "production" 
      ? data.quantity 
      : data.type === "out" || data.type === "consumption" 
        ? -data.quantity 
        : 0;
    
    if (quantityChange !== 0) {
      const currentQuantity = parseFloat(item.quantity.toString());
      const newQuantity = currentQuantity + quantityChange;
      
      await db.update(schema.inventoryTable)
        .set({ 
          quantity: newQuantity.toString(),
          updatedAt: new Date()
        })
        .where(eq(schema.inventoryTable.id, data.itemId));
    }
    
    // Registrar na trilha de auditoria
    await logAuditTrail(
      organizationId,
      userId,
      username,
      data.type,
      "inventory",
      "movement",
      newMovement.code,
      "Movimentação de Estoque",
      "Registro de Movimentação",
      `${data.type === "in" ? "Entrada" : data.type === "out" ? "Saída" : data.type === "transfer" ? "Transferência" : data.type === "adjustment" ? "Ajuste" : data.type === "consumption" ? "Consumo" : "Produção"} de ${data.quantity} ${data.unit} de ${item.name}`,
      null,
      data.batchNumber || null
    );
    
    return res.status(201).json({
      ...newMovement,
      itemName: item.name,
      itemCode: item.code
    });
  } catch (error) {
    console.error("Erro ao criar movimentação:", error);
    return res.status(500).json({ message: "Erro ao registrar movimentação" });
  }
});

productionRouter.get('/movements/:id', async (req: Request, res: Response) => {
  try {
    const organizationId = req.session.user!.organizationId!;
    const { id } = req.params;
    
    const movement = await db.query.movementsTable.findFirst({
      where: and(
        eq(schema.movementsTable.id, parseInt(id)),
        eq(schema.movementsTable.organizationId, organizationId)
      )
    });
    
    if (!movement) {
      return res.status(404).json({ message: "Movimentação não encontrada" });
    }
    
    // Buscar informações complementares do item
    const item = await db.query.inventoryTable.findFirst({
      where: eq(schema.inventoryTable.id, movement.itemId)
    });
    
    return res.status(200).json({
      ...movement,
      itemName: item?.name || "Item não encontrado",
      itemCode: item?.code || "---"
    });
  } catch (error) {
    console.error("Erro ao buscar movimentação:", error);
    return res.status(500).json({ message: "Erro ao buscar movimentação" });
  }
});

// Rotas para ordens de produção (Production Orders)
productionRouter.get('/orders', async (req: Request, res: Response) => {
  try {
    const organizationId = req.session.user!.organizationId!;
    
    const productionOrders = await db.query.productionOrdersTable.findMany({
      where: eq(schema.productionOrdersTable.organizationId, organizationId),
      orderBy: [desc(schema.productionOrdersTable.createdAt)]
    });
    
    // Buscar informações complementares dos produtos
    const result = await Promise.all(productionOrders.map(async (order) => {
      const product = await db.query.productsTable.findFirst({
        where: eq(schema.productsTable.id, order.productId)
      });
      
      // Buscar etapas da ordem de produção
      const steps = await db.query.productionStepsTable.findMany({
        where: eq(schema.productionStepsTable.productionOrderId, order.id),
        orderBy: [schema.productionStepsTable.sortOrder]
      });
      
      // Buscar materiais da ordem de produção
      const materials = await db.query.productionMaterialsTable.findMany({
        where: eq(schema.productionMaterialsTable.productionOrderId, order.id)
      });
      
      // Enriquecer os materiais com informações dos itens de estoque
      const materialsWithDetails = await Promise.all(materials.map(async (material) => {
        const inventoryItem = await db.query.inventoryTable.findFirst({
          where: eq(schema.inventoryTable.id, material.inventoryId)
        });
        
        return {
          ...material,
          name: inventoryItem?.name || "Material não encontrado",
          code: inventoryItem?.code || "---",
          batchNumber: inventoryItem?.batchNumber || "---"
        };
      }));
      
      return {
        ...order,
        product: product?.name || "Produto não encontrado",
        productCode: product?.sku || "---",
        steps,
        materials: materialsWithDetails
      };
    }));
    
    return res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao buscar ordens de produção:", error);
    return res.status(500).json({ message: "Erro ao buscar ordens de produção" });
  }
});

// Adicione aqui as demais rotas para ordens de produção (POST, GET/:id, PUT/:id)

// Rotas para produtos (Products)
productionRouter.get('/products', async (req: Request, res: Response) => {
  try {
    const organizationId = req.session.user!.organizationId!;
    
    const products = await db.query.productsTable.findMany({
      where: eq(schema.productsTable.organizationId, organizationId),
      orderBy: [desc(schema.productsTable.createdAt)]
    });
    
    return res.status(200).json(products);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return res.status(500).json({ message: "Erro ao buscar produtos" });
  }
});

// Rotas para descartes (Disposals)
productionRouter.get('/disposals', async (req: Request, res: Response) => {
  try {
    const organizationId = req.session.user!.organizationId!;
    
    const disposals = await db.query.disposalsTable.findMany({
      where: eq(schema.disposalsTable.organizationId, organizationId),
      orderBy: [desc(schema.disposalsTable.dateRequested)]
    });
    
    // Buscar informações complementares dos itens
    const result = await Promise.all(disposals.map(async (disposal) => {
      const item = await db.query.inventoryTable.findFirst({
        where: eq(schema.inventoryTable.id, disposal.inventoryId)
      });
      
      return {
        ...disposal,
        itemName: item?.name || "Item não encontrado",
        itemCode: item?.code || "---",
        itemType: item?.type || "unknown"
      };
    }));
    
    return res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao buscar descartes:", error);
    return res.status(500).json({ message: "Erro ao buscar descartes" });
  }
});

// Rotas para trilha de auditoria (AuditTrail)
productionRouter.get('/audit-trail', async (req: Request, res: Response) => {
  try {
    const organizationId = req.session.user!.organizationId!;
    
    const auditTrail = await db.query.auditTrailTable.findMany({
      where: eq(schema.auditTrailTable.organizationId, organizationId),
      orderBy: [desc(schema.auditTrailTable.timestamp)],
      limit: 1000 // Limitar para não sobrecarregar a resposta
    });
    
    return res.status(200).json(auditTrail);
  } catch (error) {
    console.error("Erro ao buscar trilha de auditoria:", error);
    return res.status(500).json({ message: "Erro ao buscar trilha de auditoria" });
  }
});

productionRouter.get('/audit-trail/batch/:batchNumber', async (req: Request, res: Response) => {
  try {
    const organizationId = req.session.user!.organizationId!;
    const { batchNumber } = req.params;
    
    if (!batchNumber) {
      return res.status(400).json({ message: "Número do lote é obrigatório" });
    }
    
    const auditTrail = await db.query.auditTrailTable.findMany({
      where: and(
        eq(schema.auditTrailTable.organizationId, organizationId),
        eq(schema.auditTrailTable.relatedBatch, batchNumber)
      ),
      orderBy: [schema.auditTrailTable.timestamp]
    });
    
    return res.status(200).json(auditTrail);
  } catch (error) {
    console.error("Erro ao buscar trilha de auditoria para o lote:", error);
    return res.status(500).json({ message: "Erro ao buscar trilha de auditoria para o lote" });
  }
});

  // Fim da função registerProductionRoutes
}

export default productionRouter;