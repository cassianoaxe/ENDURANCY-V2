import { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import { plans, planModules, modules, organizations } from '@shared/schema';

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
  if (req.session && req.session.user) {
    // Se temos o objeto user na sessão, então o usuário está autenticado
    return next();
  }
  return res.status(401).json({ message: 'Não autenticado' });
}

// Middleware para verificar acesso ao módulo de IA
async function checkAIModuleAccess(req: AuthenticatedRequest, res: Response, next: Function) {
  try {
    if (!req.session || !req.session.user || !req.session.user.organizationId) {
      return res.status(403).json({ message: 'Acesso negado ao módulo de IA' });
    }

    // Atribuir o usuário da sessão ao req.user para usar no resto do código
    req.user = req.session.user;

    // Verificar se a organização tem acesso ao módulo de IA através de seu plano
    const organizationId = req.user.organizationId;
    
    // Buscar o plano atual da organização
    const organization = await db.query.organizations.findFirst({
      where: eq(organizations.id, organizationId),
      columns: {
        planId: true
      }
    });

    if (!organization || !organization.planId) {
      return res.status(403).json({ message: 'Organização sem plano ativo' });
    }

    // Verificar se o plano inclui o módulo de IA
    const moduleAccess = await db.query.planModules.findFirst({
      where: (planModules, { and, eq }) => and(
        eq(planModules.planId, organization.planId),
        eq(planModules.moduleId, 19) // ID do módulo de IA
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
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rota de chat com o assistente de IA
router.post('/chat', authenticate, checkAIModuleAccess, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Mensagem não fornecida' });
    }
    
    console.log(`Processando mensagem do usuário: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
    
    const userContext = {
      organizationId: req.user?.organizationId,
      username: req.user?.username,
      role: req.user?.role
    };
    
    // Chamada à API do OpenAI
    try {
      console.log("Iniciando chamada para a API do OpenAI...");
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // o modelo mais recente da OpenAI
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
      
      console.log("Resposta do OpenAI recebida com sucesso");
      
      if (completion && completion.choices && completion.choices.length > 0 && completion.choices[0].message) {
        const responseText = completion.choices[0].message.content || 
          "Desculpe, não consegui processar sua solicitação no momento.";
          
        console.log(`Enviando resposta: "${responseText.substring(0, 50)}${responseText.length > 50 ? '...' : ''}"`);
        
        return res.json({ 
          success: true,
          response: responseText 
        });
      } else {
        console.error("Resposta da OpenAI não contém choices ou mensagem válida:", completion);
        return res.json({ 
          success: false,
          response: "Desculpe, ocorreu um erro ao processar sua solicitação." 
        });
      }
    } catch (openaiError) {
      console.error("Erro específico da API OpenAI:", openaiError);
      return res.json({ 
        success: false,
        response: "O serviço de IA está temporariamente indisponível. Por favor, tente novamente mais tarde." 
      });
    }
  } catch (error) {
    console.error('Erro geral na API de chat:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Erro ao processar resposta do assistente',
      response: "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde."
    });
  }
});

export default router;