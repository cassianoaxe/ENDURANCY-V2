import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { 
  plans, orders, organizations, modules, organizationModules, 
  users, requests, notifications
} from "@shared/schema";
import { eq, and, count, desc, asc } from 'drizzle-orm';
import { notificationService } from '../services/notificationService';

const organizationRouter = Router();

// Middleware para verificar se é admin de organização
const isOrgAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Não autenticado" });
  }
  
  if (req.session.user.role !== 'org_admin') {
    return res.status(403).json({ message: "Acesso restrito para administradores de organização" });
  }
  
  next();
};

// Rota para obter informações sobre o plano atual da organização
organizationRouter.get('/plan', isOrgAdmin, async (req: Request, res: Response) => {
  try {
    if (!req.session.user?.organizationId) {
      return res.status(400).json({ message: "Usuário não está associado a uma organização" });
    }

    const organizationId = req.session.user.organizationId;
    
    // Buscar a organização com seu plano
    const organization = await db.query.organizations.findFirst({
      where: eq(organizations.id, organizationId),
      with: {
        plan: true
      }
    });

    if (!organization) {
      return res.status(404).json({ message: "Organização não encontrada" });
    }

    // Buscar módulos ativos da organização
    const activeOrgModules = await db.query.organizationModules.findMany({
      where: and(
        eq(organizationModules.organizationId, organizationId),
        eq(organizationModules.active, true)
      ),
      with: {
        module: true
      }
    });

    // Buscar quantidade de cadastros (usuários) da organização
    const [registrationsResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.organizationId, organizationId));

    const registrationsUsed = registrationsResult?.count || 0;

    // Formatar os dados para retornar
    const response = {
      plan: {
        ...organization.plan,
        features: [
          `Até ${organization.plan.maxRecords.toLocaleString()} cadastros`,
          "Módulos básicos incluídos: Onboarding, Analytics, Dashboard, Associados, Vendas, Financeiro, ComplyPay",
          "Acesso à API de integração",
          "Suporte por e-mail",
          organization.plan.tier === 'grow' || organization.plan.tier === 'pro' ? "Módulos Cultivo e Produção inclusos" : undefined,
          organization.plan.tier === 'pro' ? "Suporte prioritário" : undefined,
          organization.plan.tier === 'pro' ? "API avançada com maior limite de requisições" : undefined
        ].filter(Boolean) as string[]
      },
      expiresAt: organization.planExpiresAt?.toISOString() || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      registrationsUsed,
      registrationsTotal: organization.plan.maxRecords,
      activeModules: activeOrgModules.map(orgModule => ({
        ...orgModule.module,
        features: getModuleFeatures(orgModule.module.type)
      }))
    };

    res.json(response);
  } catch (error) {
    console.error("Erro ao obter plano da organização:", error);
    res.status(500).json({ message: "Falha ao obter informações do plano" });
  }
});

// Rota para solicitar mudança de plano
organizationRouter.post('/request-plan-change', isOrgAdmin, async (req: Request, res: Response) => {
  try {
    if (!req.session.user?.organizationId) {
      return res.status(400).json({ message: "Usuário não está associado a uma organização" });
    }

    const { planId } = req.body;
    if (!planId) {
      return res.status(400).json({ message: "ID do plano é obrigatório" });
    }

    // Verificar se o plano existe
    const plan = await db.query.plans.findFirst({
      where: eq(plans.id, planId)
    });

    if (!plan) {
      return res.status(404).json({ message: "Plano não encontrado" });
    }

    const organizationId = req.session.user.organizationId;
    
    // Verificar se já existe uma solicitação pendente
    const pendingRequest = await db.query.requests.findFirst({
      where: and(
        eq(requests.organizationId, organizationId),
        eq(requests.status, 'pendente'),
        eq(requests.type, 'plano')
      )
    });

    if (pendingRequest) {
      return res.status(400).json({ message: "Já existe uma solicitação de mudança de plano pendente" });
    }

    // Criar solicitação de mudança de plano
    const [newRequest] = await db.insert(requests).values({
      type: 'plano',
      organizationId,
      data: JSON.stringify({ planId, previousPlanId: req.session.user.organizationId }),
      status: 'pendente',
      createdById: req.session.user.id,
      description: `Solicitação de upgrade para o plano ${plan.name}`,
    }).returning();

    // Criar notificação para administradores do sistema
    await notificationService.createNotification({
      title: "Nova solicitação de plano",
      message: `A organização ${req.session.user.id} solicitou upgrade para o plano ${plan.name}`,
      type: "info",
      isRead: false,
      link: `/requests/${newRequest.id}`,
      userId: null, // Notificação para todos os admins
      role: "admin",
      organizationId: null
    });

    res.status(201).json({ 
      message: "Solicitação de mudança de plano enviada com sucesso", 
      requestId: newRequest.id 
    });
  } catch (error) {
    console.error("Erro ao solicitar mudança de plano:", error);
    res.status(500).json({ message: "Falha ao processar solicitação de mudança de plano" });
  }
});

// Rota para solicitar ativação de módulo
organizationRouter.post('/request-module-activation', isOrgAdmin, async (req: Request, res: Response) => {
  try {
    if (!req.session.user?.organizationId) {
      return res.status(400).json({ message: "Usuário não está associado a uma organização" });
    }

    const { moduleId } = req.body;
    if (!moduleId) {
      return res.status(400).json({ message: "ID do módulo é obrigatório" });
    }

    // Verificar se o módulo existe
    const module = await db.query.modules.findFirst({
      where: eq(modules.id, moduleId)
    });

    if (!module) {
      return res.status(404).json({ message: "Módulo não encontrado" });
    }

    const organizationId = req.session.user.organizationId;
    
    // Verificar se o módulo já está ativo para a organização
    const existingOrgModule = await db.query.organizationModules.findFirst({
      where: and(
        eq(organizationModules.organizationId, organizationId),
        eq(organizationModules.moduleId, moduleId)
      )
    });

    if (existingOrgModule && existingOrgModule.active) {
      return res.status(400).json({ message: "Módulo já está ativo para esta organização" });
    }

    // Verificar se já existe uma solicitação pendente para este módulo
    const pendingRequest = await db.query.requests.findFirst({
      where: and(
        eq(requests.organizationId, organizationId),
        eq(requests.status, 'pendente'),
        eq(requests.type, 'módulo'),
        eq(requests.data, JSON.stringify({ moduleId }))
      )
    });

    if (pendingRequest) {
      return res.status(400).json({ message: "Já existe uma solicitação pendente para este módulo" });
    }

    // Criar solicitação de ativação de módulo
    const [newRequest] = await db.insert(requests).values({
      type: 'módulo',
      organizationId,
      data: JSON.stringify({ moduleId }),
      status: 'pendente',
      createdById: req.session.user.id,
      description: `Solicitação de ativação do módulo ${module.name}`,
    }).returning();

    // Criar notificação para administradores do sistema
    await notificationService.createNotification({
      title: "Nova solicitação de módulo",
      message: `A organização ${req.session.user.id} solicitou ativação do módulo ${module.name}`,
      type: "info",
      isRead: false,
      link: `/requests/${newRequest.id}`,
      userId: null, // Notificação para todos os admins
      role: "admin",
      organizationId: null
    });

    res.status(201).json({ 
      message: "Solicitação de ativação de módulo enviada com sucesso", 
      requestId: newRequest.id 
    });
  } catch (error) {
    console.error("Erro ao solicitar ativação de módulo:", error);
    res.status(500).json({ message: "Falha ao processar solicitação de ativação de módulo" });
  }
});

// Função auxiliar para obter os recursos específicos de cada tipo de módulo
function getModuleFeatures(moduleType: string): string[] {
  const featuresByType: Record<string, string[]> = {
    'crm': [
      'Gestão de contatos e leads',
      'Pipeline de vendas personalizado',
      'Automação de follow-up',
      'Integração com e-mail e WhatsApp'
    ],
    'social': [
      'Gestão de redes sociais',
      'Programação de posts',
      'Análise de performance',
      'Monitoramento de menções'
    ],
    'tarefas': [
      'Gestão de tarefas e projetos',
      'Quadros Kanban personalizados',
      'Automação de fluxos de trabalho',
      'Gestão de prazos e lembretes'
    ],
    'rh': [
      'Gestão de colaboradores',
      'Controle de férias e licenças',
      'Avaliações de desempenho',
      'Recrutamento e seleção'
    ],
    'juridico': [
      'Gestão de processos jurídicos',
      'Controle de prazos legais',
      'Biblioteca de modelos de documentos',
      'Análise de riscos legais'
    ],
    'transparencia': [
      'Portal de transparência',
      'Relatórios públicos',
      'Gestão de dados abertos',
      'Compliance regulatório'
    ],
    'ia': [
      'Assistente virtual IA',
      'Análise preditiva de dados',
      'Automação de processos com IA',
      'Insights de negócio avançados'
    ],
    'compras': [
      'Gestão de fornecedores',
      'Cotações automáticas',
      'Aprovações de compras',
      'Controle de estoque'
    ],
    'dispensario': [
      'Controle de dispensação',
      'Gestão de inventário',
      'Rastreabilidade de produto',
      'Compliance regulatório'
    ],
    'patrimonio': [
      'Gestão de ativos',
      'Depreciação automatizada',
      'Manutenção preventiva',
      'Alocação de recursos'
    ],
    'comunicacao': [
      'Central de comunicações',
      'Templates personalizados',
      'Automação de mensagens',
      'Métricas de engajamento'
    ],
    'pesquisa': [
      'Gestão de estudos clínicos',
      'Coleta e análise de dados',
      'Publicações científicas',
      'Relatórios de pesquisa'
    ],
    'educacao': [
      'Portal educacional',
      'Cursos e treinamentos',
      'Biblioteca de materiais',
      'Certificados personalizados'
    ],
    'onboarding': [
      'Processo de boas-vindas',
      'Tutoriais interativos',
      'Checklists de configuração',
      'Suporte guiado'
    ],
    'analytics': [
      'Painéis personalizáveis',
      'Relatórios detalhados',
      'Métricas de performance',
      'Análise de tendências'
    ],
    'dashboard': [
      'Visão geral do negócio',
      'Indicadores-chave em tempo real',
      'Alertas personalizados',
      'Exportação de relatórios'
    ],
    'associados': [
      'Gestão de membros/pacientes',
      'Perfis detalhados',
      'Histórico completo',
      'Segmentação avançada'
    ],
    'vendas': [
      'Gestão de pedidos',
      'Processamento de pagamentos',
      'Controle de entregas',
      'Relatórios de vendas'
    ],
    'financeiro': [
      'Gestão financeira completa',
      'Contas a pagar e receber',
      'Fluxo de caixa',
      'DRE e relatórios fiscais'
    ],
    'complypay': [
      'Gateway de pagamento integrado',
      'Assinaturas e recorrência',
      'Split de pagamentos',
      'Antifraude automático'
    ],
    'cultivo': [
      'Gestão de ciclos de cultivo',
      'Rastreabilidade completa',
      'Controle de qualidade',
      'Relatórios de produção'
    ],
    'producao': [
      'Gestão da cadeia produtiva',
      'Controle de lotes e rastreabilidade',
      'Gestão de formulações',
      'Controle de qualidade'
    ]
  };
  
  return featuresByType[moduleType] || [
    'Recursos personalizados',
    'Integração com módulos existentes',
    'Painéis de controle',
    'Relatórios avançados'
  ];
}

export default organizationRouter;