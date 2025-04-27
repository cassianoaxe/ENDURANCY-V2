import { Express, Request, Response } from "express";
import { processMultiContext, ContextType, analyzeTicket, generateReport, getSuggestions } from "./services/ai-service";
import { z } from "zod";

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
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: "Não autenticado" });
  }
  next();
}

// Middleware para verificar se o usuário tem acesso ao módulo de IA
function checkAIModuleAccess(req: AuthenticatedRequest, res: Response, next: Function) {
  // Aqui você implementaria a lógica para verificar se o usuário tem acesso ao módulo de IA
  // Por exemplo, verificando em um banco de dados se a organização dele tem o módulo ativado
  
  // Para fins de demonstração, vamos permitir o acesso para todos os usuários autenticados
  next();
}

// Middleware combinado para autenticação e acesso ao módulo
const authenticateAndCheckAccess = [authenticate, checkAIModuleAccess];

// Função para registrar as rotas de IA
export function registerAIRoutes(app: Express) {
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