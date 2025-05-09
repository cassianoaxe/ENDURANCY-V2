import { Express, Request, Response } from "express";
import { processMultiContext, ContextType, analyzeTicket, generateReport, getSuggestions } from "./services/ai-service";
import { z } from "zod";
import aiChatRouter from './routes/ai-chat';
import { db } from './db';

// Interface estendida do Request com informações do usuário autenticado
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
    organizationId?: number;
  };
}

// Middleware para verificar se o usuário está autenticado
function authenticate(req: AuthenticatedRequest, res: Response, next: Function) {
  // Verificar se o usuário está autenticado (verificando se o objeto user existe)
  if (!req.user) {
    return res.status(401).json({ message: "Não autenticado" });
  }
  next();
}

// Middleware para verificar se o usuário tem acesso ao módulo de IA
async function checkAIModuleAccess(req: AuthenticatedRequest, res: Response, next: Function) {
  if (!req.user?.organizationId) {
    return res.status(403).json({ message: 'Acesso negado: usuário não pertence a uma organização' });
  }

  try {
    // Verifica se a organização possui acesso ao módulo de IA
    const organizationModules = await db.query(
      `SELECT * FROM organization_modules 
       WHERE organization_id = $1 AND module_id = (SELECT id FROM modules WHERE code = 'ai')`,
      [req.user.organizationId]
    );

    if (organizationModules.rowCount === 0) {
      return res.status(403).json({ 
        message: 'Sua organização não possui acesso ao módulo de Inteligência Artificial',
        module: 'ai',
        type: 'access_denied'
      });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar acesso ao módulo de IA:', error);
    return res.status(500).json({ message: 'Erro interno ao verificar permissões' });
  }
}

// Middleware combinado para autenticação e acesso ao módulo
const authenticateAndCheckAccess = [authenticate, checkAIModuleAccess];

// Função para registrar as rotas de IA
export function registerAIRoutes(app: Express) {
  // Registrando o router de chat AI
  app.use('/api/ai', aiChatRouter);
  
  // Log para debug
  console.log("Router de chat AI registrado com sucesso em /api/ai");
  
  // Rota para processamento multi-contexto
  app.post('/api/ai/process', authenticateAndCheckAccess, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Validação do corpo da requisição
      const requestSchema = z.object({
        query: z.string().min(1).max(1000),
        contextTypes: z.array(
          z.enum([
            ContextType.FINANCIAL, 
            ContextType.TICKETS, 
            ContextType.INVENTORY, 
            ContextType.PATIENTS, 
            ContextType.DOCUMENTS, 
            ContextType.ALL
          ])
        ),
        additionalContext: z.record(z.any()).optional(),
      });
      
      const validationResult = requestSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: validationResult.error.errors 
        });
      }
      
      // Verificar se o usuário tem um organizationId
      if (!req.user?.organizationId) {
        return res.status(400).json({ 
          message: "Usuário não está associado a uma organização" 
        });
      }
      
      const result = await processMultiContext({
        query: validationResult.data.query,
        contextTypes: validationResult.data.contextTypes,
        organizationId: req.user.organizationId,
        userId: req.user.id,
        additionalContext: validationResult.data.additionalContext,
      });
      
      return res.json(result);
    } catch (error) {
      console.error("Erro na rota /api/ai/process:", error);
      return res.status(500).json({ 
        message: "Erro no processamento da solicitação de IA",
        error: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });
  
  // Rota para análise de tickets
  app.get('/api/ai/analyze-ticket/:ticketId', authenticateAndCheckAccess, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const ticketId = parseInt(req.params.ticketId);
      
      if (isNaN(ticketId)) {
        return res.status(400).json({ message: "ID do ticket inválido" });
      }
      
      // Verificar se o usuário tem um organizationId
      if (!req.user?.organizationId) {
        return res.status(400).json({ 
          message: "Usuário não está associado a uma organização" 
        });
      }
      
      const result = await analyzeTicket(ticketId, req.user.organizationId);
      return res.json(result);
    } catch (error) {
      console.error("Erro na rota /api/ai/analyze-ticket:", error);
      return res.status(500).json({ 
        message: "Erro na análise do ticket",
        error: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });
  
  // Rota para geração de relatórios
  app.post('/api/ai/generate-report', authenticateAndCheckAccess, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Validação do corpo da requisição
      const reportSchema = z.object({
        reportType: z.string().min(1),
        timePeriod: z.object({
          start: z.string(),
          end: z.string()
        }),
        filters: z.record(z.any()).optional()
      });
      
      const validationResult = reportSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: validationResult.error.errors 
        });
      }
      
      // Verificar se o usuário tem um organizationId
      if (!req.user?.organizationId) {
        return res.status(400).json({ 
          message: "Usuário não está associado a uma organização" 
        });
      }
      
      const result = await generateReport({
        ...validationResult.data,
        organizationId: req.user.organizationId
      });
      
      return res.json(result);
    } catch (error) {
      console.error("Erro na rota /api/ai/generate-report:", error);
      return res.status(500).json({ 
        message: "Erro na geração do relatório",
        error: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });
  
  // Rota para obter sugestões inteligentes
  app.get('/api/ai/suggestions/:context', authenticateAndCheckAccess, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const context = req.params.context;
      
      if (!context) {
        return res.status(400).json({ message: "Contexto não especificado" });
      }
      
      // Verificar se o usuário tem um organizationId
      if (!req.user?.organizationId) {
        return res.status(400).json({ 
          message: "Usuário não está associado a uma organização" 
        });
      }
      
      const result = await getSuggestions(req.user.id, req.user.organizationId, context);
      return res.json(result);
    } catch (error) {
      console.error("Erro na rota /api/ai/suggestions:", error);
      return res.status(500).json({ 
        message: "Erro ao gerar sugestões",
        error: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });
  
  // Rota para verificar o status do módulo de IA
  app.get('/api/ai/status', authenticate, (req: AuthenticatedRequest, res: Response) => {
    try {
      // Verificar se a API key da OpenAI está configurada
      const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
      
      return res.json({
        enabled: hasOpenAIKey,
        model: "gpt-4o",
        features: [
          "Multi-Context Processing",
          "Análise de Tickets",
          "Geração de Relatórios",
          "Sugestões Inteligentes"
        ]
      });
    } catch (error) {
      console.error("Erro na rota /api/ai/status:", error);
      return res.status(500).json({ 
        message: "Erro ao verificar status do módulo de IA",
        error: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });
}