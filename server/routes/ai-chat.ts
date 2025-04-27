import { Router, Request, Response } from 'express';
import { db } from '../db';
import OpenAI from 'openai';

const router = Router();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
    organizationId?: number;
  };
}

// Inicialização do cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware para verificar se o usuário está autenticado
function authenticate(req: AuthenticatedRequest, res: Response, next: Function) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: 'Não autenticado' });
  }
  next();
}

// Middleware para verificar se a organização tem acesso ao módulo de IA
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

// Rota para processar mensagens enviadas para o copilot
router.post('/chat', authenticate, checkAIModuleAccess, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Mensagem não fornecida' });
    }

    // Monta o histórico de mensagens para envio ao OpenAI
    const formattedHistory = Array.isArray(history) 
      ? history.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      : [];

    // Contexto do sistema para o assistente
    const systemMessage = {
      role: 'system',
      content: `Você é o Endurancy Copilot, um assistente de IA especializado em ajudar usuários do sistema Endurancy.
      O Endurancy é uma plataforma completa para gestão de organizações de saúde, com módulos para gestão de pacientes,
      produtos, prescrições, vendas, financeiro, entre outros.
      
      Ao ajudar o usuário:
      - Seja sempre cordial e profissional
      - Forneça respostas diretas e objetivas
      - Quando não souber a resposta, indique que essa funcionalidade está em desenvolvimento
      - O usuário atual é ${req.user?.username} com papel ${req.user?.role}
      - A organização do usuário tem ID ${req.user?.organizationId}
      
      Responda em português do Brasil.`
    };

    // Enviar requisição para a API da OpenAI
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o', // Usando o modelo mais recente
      messages: [
        systemMessage,
        ...formattedHistory,
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    // Registrar a interação no histórico
    await db.query(
      `INSERT INTO ai_interactions (user_id, organization_id, user_message, ai_response, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [
        req.user?.id, 
        req.user?.organizationId, 
        message, 
        chatCompletion.choices[0]?.message.content || 'Sem resposta'
      ]
    );

    // Retornar a resposta gerada
    return res.json({
      message: chatCompletion.choices[0]?.message.content,
      usage: chatCompletion.usage
    });
  } catch (error: any) {
    console.error('Erro ao processar requisição do copilot:', error);
    return res.status(500).json({ 
      message: 'Erro ao processar sua mensagem',
      error: error.message
    });
  }
});

export default router;