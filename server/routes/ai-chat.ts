import { Router, Request, Response } from 'express';
import { Configuration, OpenAIApi } from 'openai';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { planos, planosModulos, modulosTable } from '@shared/schema';

const router = Router();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
    organizationId?: number;
  };
}

// Middleware para autenticação
function authenticate(req: AuthenticatedRequest, res: Response, next: Function) {
  if (req.session && req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Não autenticado' });
}

// Middleware para verificar acesso ao módulo de IA
async function checkAIModuleAccess(req: AuthenticatedRequest, res: Response, next: Function) {
  try {
    if (!req.user || !req.user.organizationId) {
      return res.status(403).json({ message: 'Acesso negado ao módulo de IA' });
    }

    // Verificar se a organização tem acesso ao módulo de IA através de seu plano
    const organizationId = req.user.organizationId;
    
    // Buscar o plano atual da organização
    const organization = await db.query.organizations.findFirst({
      where: eq(db.query.organizations.id, organizationId),
      columns: {
        planId: true
      }
    });

    if (!organization || !organization.planId) {
      return res.status(403).json({ message: 'Organização sem plano ativo' });
    }

    // Verificar se o plano inclui o módulo de IA
    const moduleAccess = await db.query.planosModulos.findFirst({
      where: (planosModulos, { and, eq }) => and(
        eq(planosModulos.planoId, organization.planId),
        eq(planosModulos.moduloId, 19) // ID do módulo de IA
      )
    });

    if (!moduleAccess) {
      return res.status(403).json({ 
        message: 'Seu plano atual não inclui acesso ao módulo de Inteligência Artificial' 
      });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar acesso ao módulo de IA:', error);
    return res.status(500).json({ message: 'Erro ao verificar permissões' });
  }
}

// Configuração da API do OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Rota de chat com o assistente de IA
router.post('/chat', authenticate, checkAIModuleAccess, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Mensagem não fornecida' });
    }
    
    const userContext = {
      organizationId: req.user?.organizationId,
      username: req.user?.username,
      role: req.user?.role
    };
    
    // Chamada à API do OpenAI
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: `Você é o Endurancy Copilot, um assistente de IA para a plataforma Endurancy de gestão de organizações médicas e associações.
          
          Diretivas importantes:
          - Seja conciso e direto em suas respostas.
          - Responda sempre em português do Brasil.
          - Você é experiente em todos os módulos da plataforma: Financeiro, Administrativo, Estoque, Vendas, ComplyPay, Importação, Cultivo, Transparência, etc.
          - Você pode ajudar com fluxos de trabalho, navegação, recursos disponíveis e boas práticas.
          - Não invente recursos que não existem na plataforma.
          - Não forneça aconselhamento médico, jurídico ou financeiro específico.
          - Evite respostas muito longas, preferindo uma abordagem direta e prática.
          
          Contexto do usuário:
          - Organização ID: ${userContext.organizationId}
          - Nome de usuário: ${userContext.username}
          - Papel: ${userContext.role}
          
          Responda de forma útil e profissional.`
        },
        { role: "user", content: message }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });
    
    const response = completion.data.choices[0].message?.content || 
      "Desculpe, não consegui processar sua solicitação no momento.";
    
    return res.json({ response });
    
  } catch (error) {
    console.error('Erro na API de chat:', error);
    return res.status(500).json({ message: 'Erro ao processar resposta do assistente' });
  }
});

export default router;