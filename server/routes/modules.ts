import express, { Request, Response } from 'express';
import { db } from '../db';
import { 
  modules, 
  modulePlans, 
  insertModuleSchema, 
  insertModulePlanSchema 
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';

const router = express.Router();

// Middleware para verificar se o usuário é admin
const isAdmin = (req: Request, res: Response, next: express.NextFunction) => {
  if (!req.session?.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado: permissão de administrador necessária' });
  }
  next();
};

/**
 * Retorna todos os módulos
 */
router.get('/api/modules', async (req: Request, res: Response) => {
  try {
    const allModules = await db.select().from(modules);
    res.json(allModules);
  } catch (error) {
    console.error('Erro ao buscar módulos:', error);
    res.status(500).json({ message: 'Erro ao buscar módulos' });
  }
});

/**
 * Retorna um módulo específico
 */
router.get('/api/modules/:id', async (req: Request, res: Response) => {
  try {
    const moduleId = Number(req.params.id);
    const module = await db.select().from(modules).where(eq(modules.id, moduleId)).limit(1);
    
    if (module.length === 0) {
      return res.status(404).json({ message: 'Módulo não encontrado' });
    }
    
    res.json(module[0]);
  } catch (error) {
    console.error('Erro ao buscar módulo:', error);
    res.status(500).json({ message: 'Erro ao buscar módulo' });
  }
});

/**
 * Cria um novo módulo (apenas admin)
 */
router.post('/api/modules', isAdmin, async (req: Request, res: Response) => {
  try {
    const validation = insertModuleSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: validation.error.errors 
      });
    }

    const newModule = await db.insert(modules).values(validation.data).returning();
    res.status(201).json(newModule[0]);
  } catch (error) {
    console.error('Erro ao criar módulo:', error);
    res.status(500).json({ message: 'Erro ao criar módulo' });
  }
});

/**
 * Atualiza um módulo existente (apenas admin)
 */
router.put('/api/modules/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const moduleId = Number(req.params.id);
    const validation = insertModuleSchema.partial().safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: validation.error.errors 
      });
    }

    const updatedModule = await db
      .update(modules)
      .set(validation.data)
      .where(eq(modules.id, moduleId))
      .returning();
    
    if (updatedModule.length === 0) {
      return res.status(404).json({ message: 'Módulo não encontrado' });
    }
    
    res.json(updatedModule[0]);
  } catch (error) {
    console.error('Erro ao atualizar módulo:', error);
    res.status(500).json({ message: 'Erro ao atualizar módulo' });
  }
});

/**
 * Exclui um módulo (apenas admin)
 */
router.delete('/api/modules/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const moduleId = Number(req.params.id);
    
    // Primeiro, verificamos se existem relações com planos
    const moduleRelations = await db
      .select()
      .from(modulePlans)
      .where(eq(modulePlans.module_id, moduleId));
    
    // Se houver relações, excluímos todas primeiro
    if (moduleRelations.length > 0) {
      await db
        .delete(modulePlans)
        .where(eq(modulePlans.module_id, moduleId));
    }
    
    // Depois, excluímos o módulo
    const deleted = await db
      .delete(modules)
      .where(eq(modules.id, moduleId))
      .returning();
    
    if (deleted.length === 0) {
      return res.status(404).json({ message: 'Módulo não encontrado' });
    }
    
    res.json({ message: 'Módulo excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir módulo:', error);
    res.status(500).json({ message: 'Erro ao excluir módulo' });
  }
});

/**
 * Retorna todas as relações módulo-plano
 */
router.get('/api/module-plans', async (req: Request, res: Response) => {
  try {
    const allModulePlans = await db.select().from(modulePlans);
    res.json(allModulePlans);
  } catch (error) {
    console.error('Erro ao buscar relações módulo-plano:', error);
    res.status(500).json({ message: 'Erro ao buscar relações módulo-plano' });
  }
});

/**
 * Cria uma nova relação módulo-plano (apenas admin)
 */
router.post('/api/module-plans', isAdmin, async (req: Request, res: Response) => {
  try {
    const validation = insertModulePlanSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Dados inválidos', 
        errors: validation.error.errors 
      });
    }

    // Verificar se já existe um plano com este nome para este módulo
    const existingRelation = await db
      .select()
      .from(modulePlans)
      .where(
        and(
          eq(modulePlans.module_id, validation.data.module_id),
          eq(modulePlans.name, validation.data.name)
        )
      );
    
    if (existingRelation.length > 0) {
      return res.status(400).json({ 
        message: 'Esta relação módulo-plano já existe' 
      });
    }

    const newModulePlan = await db
      .insert(modulePlans)
      .values(validation.data)
      .returning();
    
    res.status(201).json(newModulePlan[0]);
  } catch (error) {
    console.error('Erro ao criar relação módulo-plano:', error);
    res.status(500).json({ message: 'Erro ao criar relação módulo-plano' });
  }
});

/**
 * Exclui uma relação módulo-plano (apenas admin)
 */
router.delete('/api/module-plans/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const relationId = Number(req.params.id);
    
    const deleted = await db
      .delete(modulePlans)
      .where(eq(modulePlans.id, relationId))
      .returning();
    
    if (deleted.length === 0) {
      return res.status(404).json({ message: 'Relação módulo-plano não encontrada' });
    }
    
    res.json({ message: 'Relação módulo-plano excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir relação módulo-plano:', error);
    res.status(500).json({ message: 'Erro ao excluir relação módulo-plano' });
  }
});

export default router;