import OpenAI from "openai";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { 
  supportTickets as tickets, 
  ticketComments, 
  organizations, 
  users, 
  products, 
  patients, 
  financialTransactions 
} from "@shared/schema";

// O modelo mais recente da OpenAI é "gpt-4o", lançado em 13 de maio de 2024.
// Não altere este valor a menos que seja explicitamente solicitado pelo usuário
const AI_MODEL = "gpt-4o";

// Inicializando o cliente OpenAI com a chave da API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export enum ContextType {
  FINANCIAL = "financial",
  TICKETS = "tickets",
  INVENTORY = "inventory",
  PATIENTS = "patients",
  DOCUMENTS = "documents",
  ALL = "all"
}

// Interface principal para o Multi-Context Processing
export interface MCPRequest {
  query: string;
  contextTypes: ContextType[];
  organizationId: number;
  userId: number;
  additionalContext?: Record<string, any>;
}

// Funções para obter dados contextuais de diferentes fontes
async function getFinancialContext(organizationId: number) {
  const transactions = await db
    .select()
    .from(financialTransactions)
    .where(eq(financialTransactions.organizationId, organizationId))
    .limit(100);
  
  return {
    type: ContextType.FINANCIAL,
    data: transactions
  };
}

async function getTicketsContext(organizationId: number) {
  const allTickets = await db
    .select()
    .from(tickets)
    .where(eq(tickets.organizationId, organizationId))
    .limit(50);
    
  // Para cada ticket, obtemos os comentários relacionados
  const ticketsWithComments = await Promise.all(
    allTickets.map(async (ticket) => {
      const comments = await db
        .select()
        .from(ticketComments)
        .where(eq(ticketComments.ticketId, ticket.id));
        
      return {
        ...ticket,
        comments
      };
    })
  );
  
  return {
    type: ContextType.TICKETS,
    data: ticketsWithComments
  };
}

async function getInventoryContext(organizationId: number) {
  const inventory = await db
    .select()
    .from(products)
    .where(eq(products.organizationId, organizationId))
    .limit(100);
    
  return {
    type: ContextType.INVENTORY,
    data: inventory
  };
}

async function getPatientsContext(organizationId: number) {
  const patientsList = await db
    .select()
    .from(patients)
    .where(eq(patients.organizationId, organizationId))
    .limit(100);
    
  return {
    type: ContextType.PATIENTS,
    data: patientsList
  };
}

// Função para buscar contexto com base nos tipos solicitados
async function fetchContextByTypes(contextTypes: ContextType[], organizationId: number) {
  const contextPromises = [];
  
  if (contextTypes.includes(ContextType.ALL) || contextTypes.includes(ContextType.FINANCIAL)) {
    contextPromises.push(getFinancialContext(organizationId));
  }
  
  if (contextTypes.includes(ContextType.ALL) || contextTypes.includes(ContextType.TICKETS)) {
    contextPromises.push(getTicketsContext(organizationId));
  }
  
  if (contextTypes.includes(ContextType.ALL) || contextTypes.includes(ContextType.INVENTORY)) {
    contextPromises.push(getInventoryContext(organizationId));
  }
  
  if (contextTypes.includes(ContextType.ALL) || contextTypes.includes(ContextType.PATIENTS)) {
    contextPromises.push(getPatientsContext(organizationId));
  }
  
  const contextResults = await Promise.all(contextPromises);
  return contextResults;
}

// Função principal de processamento multi-contexto
export async function processMultiContext(request: MCPRequest) {
  try {
    // Buscar informações do usuário que fez a solicitação
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, request.userId))
      .limit(1);
      
    // Buscar informações da organização
    const organization = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, request.organizationId))
      .limit(1);
    
    // Buscar dados contextuais com base nos tipos solicitados
    const contextData = await fetchContextByTypes(request.contextTypes, request.organizationId);
    
    // Montar o prompt para a API da OpenAI
    const systemPrompt = `Você é um assistente de IA especializado para a plataforma Endurancy, focado no setor medicinal cannabidiol.
Você está acessando dados da organização "${organization[0]?.name || 'Organização'}" para responder à consulta do usuário "${user[0]?.username || 'Usuário'}".
Sua resposta deve ser objetiva, profissional e baseada apenas nos dados contextuais fornecidos.

DADOS CONTEXTUAIS:
${contextData.map(context => `=== ${context.type.toUpperCase()} ===\n${JSON.stringify(context.data, null, 2)}`).join('\n\n')}

${request.additionalContext ? `CONTEXTO ADICIONAL:\n${JSON.stringify(request.additionalContext, null, 2)}` : ''}

DIRETRIZES:
1. Forneça respostas precisas e úteis baseadas nos dados disponíveis
2. Se não possuir dados suficientes para responder, indique claramente
3. Proteja dados sensíveis e evite exposição desnecessária de informações
4. Priorize insights práticos e acionáveis
5. Use sempre português brasileiro formal`;

    // Chamada à API da OpenAI
    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: request.query }
      ],
      temperature: 0.5,
      max_tokens: 1000,
    });

    // Retornar a resposta processada
    return {
      success: true,
      response: response.choices[0].message.content,
      metadata: {
        usage: response.usage,
        model: response.model,
        contextTypes: request.contextTypes,
      }
    };
  } catch (error) {
    console.error("Erro no processamento MCP:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido no processamento",
      metadata: {
        contextTypes: request.contextTypes,
      }
    };
  }
}

// Função para análise automática de tickets
export async function analyzeTicket(ticketId: number, organizationId: number) {
  try {
    // Buscar os dados do ticket específico
    const ticketData = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, ticketId))
      .limit(1);
      
    if (!ticketData || ticketData.length === 0) {
      throw new Error("Ticket não encontrado");
    }
    
    // Buscar os comentários do ticket
    const comments = await db
      .select()
      .from(ticketComments)
      .where(eq(ticketComments.ticketId, ticketId));
    
    // Montar o prompt para análise
    const systemPrompt = `Você é um assistente especializado em análise de tickets de suporte para a plataforma Endurancy.
Sua tarefa é analisar o conteúdo deste ticket e fornecer:
1. Uma classificação sugerida por assunto (Técnico, Financeiro, Dúvida, Solicitação, Erro)
2. Uma sugestão de prioridade (Baixa, Média, Alta, Crítica)
3. Uma estimativa de tempo para resolução
4. Possíveis soluções baseadas no histórico de tickets similares

DADOS DO TICKET:
ID: ${ticketData[0].id}
Título: ${ticketData[0].title}
Descrição: ${ticketData[0].description}
Status Atual: ${ticketData[0].status}
Prioridade Atual: ${ticketData[0].priority}
Criado em: ${ticketData[0].createdAt}

COMENTÁRIOS (${comments.length}):
${comments.map(c => `- ${c.content} (por: ${c.userId}, em: ${c.createdAt})`).join('\n')}

Por favor, forneça sua análise em formato JSON com as seguintes chaves:
- suggestedCategory
- suggestedPriority
- estimatedTimeToResolve
- possibleSolutions (array)
- additionalInsights`;

    // Chamada à API da OpenAI
    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    // Parsear a resposta JSON
    const analysisResult = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      success: true,
      ticketId,
      analysis: analysisResult,
    };
  } catch (error) {
    console.error("Erro na análise de ticket:", error);
    return {
      success: false,
      ticketId,
      error: error instanceof Error ? error.message : "Erro desconhecido na análise",
    };
  }
}

// Função para geração de relatórios inteligentes
export async function generateReport(parameters: {
  reportType: string;
  timePeriod: { start: string; end: string };
  organizationId: number;
  filters?: Record<string, any>;
}) {
  try {
    const { reportType, timePeriod, organizationId, filters } = parameters;
    
    // Buscar dados contextuais com base no tipo de relatório
    let contextualData: { type: ContextType; data: any[] };
    
    switch (reportType.toLowerCase()) {
      case 'financial':
        contextualData = await getFinancialContext(organizationId);
        break;
      case 'patients':
        contextualData = await getPatientsContext(organizationId);
        break;
      case 'inventory':
        contextualData = await getInventoryContext(organizationId);
        break;
      case 'tickets':
        contextualData = await getTicketsContext(organizationId);
        break;
      default:
        throw new Error(`Tipo de relatório não suportado: ${reportType}`);
    }
    
    // Buscar informações da organização
    const organization = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);
    
    // Montar o prompt para geração do relatório
    const systemPrompt = `Você é um especialista em análise de dados da plataforma Endurancy.
Sua tarefa é gerar um relatório detalhado sobre ${reportType} para a organização "${organization[0]?.name || 'Organização'}"
para o período de ${timePeriod.start} a ${timePeriod.end}.

DADOS CONTEXTUAIS:
${JSON.stringify(contextualData.data, null, 2)}

${filters ? `FILTROS APLICADOS:\n${JSON.stringify(filters, null, 2)}` : ''}

Gere um relatório completo em português que inclua:
1. Resumo executivo com principais indicadores
2. Análise detalhada dos dados
3. Comparação com períodos anteriores (se dados disponíveis)
4. Tendências identificadas
5. Recomendações práticas

O relatório deve estar em formato markdown para fácil leitura e visualização.`;

    // Chamada à API da OpenAI
    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt }
      ],
      temperature: 0.4,
      max_tokens: 2000,
    });
    
    return {
      success: true,
      reportType,
      report: response.choices[0].message.content,
      metadata: {
        timePeriod,
        organization: organization[0]?.name,
        generatedAt: new Date().toISOString(),
      }
    };
  } catch (error) {
    console.error("Erro na geração de relatório:", error);
    return {
      success: false,
      reportType: parameters.reportType,
      error: error instanceof Error ? error.message : "Erro desconhecido na geração do relatório",
    };
  }
}

// Função para sugestões inteligentes baseadas em comportamento do usuário
export async function getSuggestions(userId: number, organizationId: number, context: string) {
  try {
    // Buscar informações do usuário
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
      
    if (!user || user.length === 0) {
      throw new Error("Usuário não encontrado");
    }
    
    // Determinar o tipo de sugestão baseado no contexto
    let contextualData: { type: ContextType; data: any[] }[] = [];
    
    if (context === 'dashboard') {
      // Para o dashboard, queremos sugerir visualizações e relatórios relevantes
      const financialContext = await getFinancialContext(organizationId);
      const ticketsContext = await getTicketsContext(organizationId);
      contextualData = [financialContext, ticketsContext];
    } else if (context === 'patient_management') {
      // Para gestão de pacientes, sugerimos ações relacionadas a pacientes
      const patientsContext = await getPatientsContext(organizationId);
      contextualData = [patientsContext];
    } else if (context === 'inventory') {
      // Para inventário, sugerimos ações de gerenciamento de estoque
      const inventoryContext = await getInventoryContext(organizationId);
      contextualData = [inventoryContext];
    }
    
    // Montar o prompt para geração de sugestões
    const systemPrompt = `Você é um assistente inteligente da plataforma Endurancy.
Sua tarefa é sugerir ações úteis para o usuário "${user[0].username}" que está atualmente na seção "${context}".

DADOS CONTEXTUAIS:
${contextualData.map(ctx => 
  `=== ${ctx.type.toUpperCase()} ===\n${JSON.stringify(ctx.data, null, 2)}`
).join('\n\n')}

Baseado no contexto atual do usuário e nos dados disponíveis, gere 3-5 sugestões acionáveis que sejam:
1. Relevantes para a seção atual (${context})
2. Personalizadas com base nos dados disponíveis
3. Práticas e específicas
4. Ordenadas por prioridade/relevância

Responda em formato JSON com um array de sugestões, cada uma contendo:
- title: título curto da sugestão
- description: descrição mais detalhada
- actionType: tipo de ação (view, create, edit, analyze)
- priority: prioridade (high, medium, low)
- resourceId: ID do recurso relacionado, se aplicável`;

    // Chamada à API da OpenAI
    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt }
      ],
      temperature: 0.4,
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });
    
    // Parsear a resposta JSON
    const suggestions = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      success: true,
      context,
      suggestions: suggestions.suggestions || [],
    };
  } catch (error) {
    console.error("Erro ao gerar sugestões:", error);
    return {
      success: false,
      context,
      error: error instanceof Error ? error.message : "Erro desconhecido ao gerar sugestões",
    };
  }
}