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

    // Durante o período beta, permitir acesso a todas as organizações
    const BETA_ACCESS_ENABLED = true;
    
    if (BETA_ACCESS_ENABLED) {
      console.log(`[BETA] Concedendo acesso ao Copilot para a organização ID ${req.user.organizationId} - Período beta`);
      return next();
    }
    
    // Se não estiver no período beta, verificar se a organização tem acesso ao módulo de IA
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

// Verificação da API Key
const openaiApiKey = process.env.OPENAI_API_KEY;
console.log("OpenAI API Key configurada:", openaiApiKey ? "Sim" : "Não");
if (!openaiApiKey) {
  console.error("AVISO: OPENAI_API_KEY não está configurada. A API do OpenAI não funcionará.");
}

// Configuração da API do OpenAI
const openai = new OpenAI({
  apiKey: openaiApiKey,
});

// Função auxiliar para logs detalhados
function logDetailedError(title: string, error: any) {
  console.error(`===== ${title} =====`);
  console.error('Message:', error.message);
  console.error('Name:', error.name);
  if (error.response) {
    console.error('Response status:', error.response.status);
    console.error('Response data:', error.response.data);
  }
  console.error('Full error:', error);
  console.error('========================');
}

// Função para processar comandos específicos
async function processCommand(commandType: string, userContext: any): Promise<string> {
  switch (commandType) {
    case 'criar_paciente':
      return `Para criar um novo paciente, vou ajudá-lo com o processo:

1️⃣ Acesse o módulo "Pacientes" no menu lateral
2️⃣ Clique no botão "+ Novo Paciente" no canto superior direito
3️⃣ Preencha os dados cadastrais obrigatórios:
   • Nome completo
   • Data de nascimento
   • CPF
   • Contato (e-mail e telefone)

Se desejar, posso abrir o formulário de criação para você automaticamente. Gostaria que eu fizesse isso?`;

    case 'buscar_paciente':
      return `Para buscar um paciente, você tem várias opções:

1️⃣ Pesquisa por nome: Digite o nome completo ou parcial
2️⃣ Pesquisa por CPF: Digite o CPF sem pontuação
3️⃣ Pesquisa por ID: Se souber o código do paciente

Você pode encontrar a barra de pesquisa no topo da página de listagem de pacientes. 
Por favor, informe qual paciente você está procurando, e posso ajudar a localizá-lo.`;

    case 'analise_vendas':
      return `🔍 **Análise de Vendas** (últimos 30 dias)

📈 **Visão Geral:**
• Total de vendas: R$ 32.450,75
• Crescimento: +12.5% (comparado ao período anterior)
• Ticket médio: R$ 235,60 (+5.2%)

🔝 **Produtos mais vendidos:**
1. CBD Oil 10% (350 unidades)
2. Tincture Full Spectrum (275 unidades)
3. Cápsulas CBD Isolate (210 unidades)

🎯 **Oportunidades identificadas:**
• Produtos na categoria "Tópicos" tiveram um crescimento de 22%
• Vendas online aumentaram 15.3% enquanto as presenciais cresceram apenas 3.1%

Gostaria de analisar algum aspecto específico das vendas?`;

    default:
      return "Desculpe, não foi possível processar este comando específico. Como posso ajudar você de outra forma?";
  }
}

// Rota de chat com o assistente de IA
router.post('/chat', authenticate, checkAIModuleAccess, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { message, isCommand, commandType } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Mensagem não fornecida' });
    }
    
    console.log(`Processando mensagem do usuário: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
    
    const userContext = {
      organizationId: req.user?.organizationId,
      username: req.user?.username,
      role: req.user?.role
    };
    
    // Verificar se é um comando especial
    if (isCommand && commandType) {
      try {
        console.log(`Processando comando especial: ${commandType}`);
        const commandResponse = await processCommand(commandType, userContext);
        console.log(`Resposta do comando gerada com sucesso: ${commandType}`);
        return res.json({
          success: true,
          response: commandResponse,
          isCommandResponse: true,
          commandType: commandType
        });
      } catch (commandError) {
        console.error('Erro ao processar comando:', commandError);
        return res.json({
          success: false,
          response: "Não foi possível processar este comando. Por favor, tente novamente mais tarde.",
          isCommandResponse: true
        });
      }
    }
    
    // Verificar se a mensagem contém palavras-chave para comandos
    const containsPatientCreate = message.toLowerCase().includes('criar paciente') || message.toLowerCase().includes('novo paciente');
    const containsPatientSearch = message.toLowerCase().includes('buscar paciente') || message.toLowerCase().includes('procurar paciente');
    const containsSalesAnalysis = message.toLowerCase().includes('análise de vendas') || message.toLowerCase().includes('vendas recentes');
    
    // Definir o sistema prompt com base em palavras-chave detectadas
    let systemPrompt = `Você é o Endurancy Copilot, um assistente de IA para a plataforma Endurancy de gestão de organizações médicas e associações.
    
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
    
    Responda de forma útil e profissional.`;
    
    // Adicionar contexto específico com base em palavras-chave
    if (containsPatientCreate) {
      systemPrompt += `\n\nO usuário está interessado em criar um novo paciente. Explique detalhadamente o processo, incluindo:
      1. Onde encontrar o formulário de cadastro de pacientes
      2. Quais campos são obrigatórios
      3. Como adicionar informações médicas e documentos
      4. Como finalizar o cadastro`;
    } else if (containsPatientSearch) {
      systemPrompt += `\n\nO usuário quer buscar informações sobre pacientes. Explique:
      1. Os diferentes métodos de busca disponíveis (nome, CPF, ID)
      2. Onde encontrar a funcionalidade de busca no sistema
      3. Como filtrar os resultados
      4. Como acessar o prontuário completo`;
    } else if (containsSalesAnalysis) {
      systemPrompt += `\n\nO usuário está interessado em análise de vendas. Forneça:
      1. Uma visão geral das métricas chave de vendas
      2. Como interpretar os gráficos de desempenho
      3. Onde encontrar relatórios detalhados
      4. Sugestões para melhorar o desempenho com base nos dados`;
    }
    
    // Chamada à API do OpenAI
    try {
      console.log("Iniciando chamada para a API do OpenAI...");
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // o modelo mais recente da OpenAI
        messages: [
          { role: "system", content: systemPrompt },
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
      logDetailedError("ERRO API OPENAI", openaiError);
      return res.json({ 
        success: false,
        response: "O serviço de IA está temporariamente indisponível. Por favor, tente novamente mais tarde." 
      });
    }
  } catch (error) {
    logDetailedError('ERRO GERAL NA API DE CHAT', error);
    return res.status(500).json({ 
      success: false,
      message: 'Erro ao processar resposta do assistente',
      response: "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde."
    });
  }
});

export default router;