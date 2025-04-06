/**
 * Serviço para configuração automática de organizações após pagamento
 */
import { db } from '../db';
import { schema } from '../../shared/schema';
import { generatePassword } from '../utils/password';
import { hashPassword } from '../utils/auth';
import { sendTemplateEmail } from './email';

const { users, organizations, modules, plans, organizationModules, planModules } = schema;

/**
 * Interface para mapeamento de nível de plano para valor numérico
 */
interface PlanLevelMap {
  [key: string]: number;
}

/**
 * Mapeia o nível do plano para um valor numérico para comparação
 * @param planTier O nível do plano (tier)
 * @returns O valor numérico correspondente
 */
export function getPlanLevel(planTier: string): number {
  const tierLevels: PlanLevelMap = {
    'freemium': 1,
    'básico': 1,
    'seed': 2,
    'grow': 3,
    'pro': 4,
    'professional': 4,
    'empresarial': 5,
    'enterprise': 5
  };
  
  return tierLevels[planTier.toLowerCase()] || 1;
}

/**
 * Configura os módulos para uma organização com base no plano
 * @param organizationId ID da organização
 * @param planId ID do plano
 */
export async function setupModulesForOrganization(organizationId: number, planId: number): Promise<boolean> {
  try {
    // 1. Obtém os detalhes do plano para saber o nível de acesso
    const planDetails = await db.query.plans.findFirst({
      where: (plans, { eq }) => eq(plans.id, planId)
    });
    
    if (!planDetails) {
      console.error(`Plano ID ${planId} não encontrado`);
      return false;
    }
    
    const planLevel = getPlanLevel(planDetails.tier);
    
    // 2. Obter todos os módulos disponíveis
    const allModules = await db.query.modules.findMany({
      where: (modules, { eq }) => eq(modules.is_active, true)
    });
    
    // 3. Determinar quais módulos devem ser ativados com base no nível do plano
    // Módulos para associar à organização
    const modulesToAssign = [];
    
    for (const module of allModules) {
      const moduleId = module.id;
      const moduleSlug = module.slug;
      
      // Verifica se o nível do plano é suficiente para o módulo
      const requiredLevel = determineModuleRequiredLevel(moduleId, moduleSlug);
      
      if (planLevel >= requiredLevel) {
        // Este módulo deve ser associado à organização
        modulesToAssign.push({
          moduleId,
          organizationId,
          name: module.name,
          planId,
          price: planDetails.price,
          status: 'active',
          active: true, 
          billingDay: new Date().getDate(),
          startDate: new Date(),
          expiryDate: null, // Assinatura contínua
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
    
    // 4. Associar os módulos à organização
    if (modulesToAssign.length > 0) {
      for (const moduleData of modulesToAssign) {
        await db.insert(organizationModules).values(moduleData);
      }
      console.log(`${modulesToAssign.length} módulos configurados para organização ${organizationId}`);
    } else {
      console.warn(`Nenhum módulo configurado para organização ${organizationId}`);
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao configurar módulos da organização:', error);
    return false;
  }
}

/**
 * Determina o nível de acesso necessário para um módulo específico
 * @param moduleId ID do módulo
 * @param moduleCode Código do módulo
 * @returns O nível de plano necessário (1=free, 2=seed, 3=grow, 4=pro)
 */
function determineModuleRequiredLevel(moduleId: number, moduleSlug?: string): number {
  // Mapeamento fixo de módulos básicos (disponíveis em todos os planos)
  const basicModules = ['dashboard', 'perfil', 'documentos'];
  
  if (moduleSlug && basicModules.includes(moduleSlug)) {
    return 1; // Disponível em todos os planos, incluindo o gratuito
  }
  
  // Módulos específicos por ID (caso não seja possível identificar pelo código)
  const moduleRequirements: { [key: number]: number } = {
    // Módulos do plano gratuito (nível 1)
    1: 1, // Dashboard
    2: 1, // Perfil
    8: 1, // Documentos
    
    // Módulos do plano Seed (nível 2)
    3: 2, // CRM básico
    9: 2, // Finanças básico
    14: 2, // Tarefas
    
    // Módulos do plano Grow (nível 3)
    4: 3, // Análises
    10: 3, // RH
    11: 3, // Vendas
    15: 3, // CRM avançado
    
    // Módulos do plano Pro (nível 4)
    5: 4, // Estoque
    6: 4, // Produção
    7: 4, // Logística
    12: 4, // Marketing
    13: 4, // Finanças avançado
    16: 4, // BI
    17: 4  // Integração
  };
  
  // Retorna o nível configurado para o módulo ou 4 (nível Pro) como padrão seguro
  return moduleRequirements[moduleId] || 4;
}

/**
 * Cria uma conta de usuário para o administrador da organização
 * @param organizationId ID da organização
 * @param name Nome do administrador
 * @param email Email do administrador
 * @param sendCredentials Se deve enviar as credenciais por email
 */
export async function createOrganizationAdminUser(
  organizationId: number,
  name: string,
  email: string,
  sendCredentials: boolean = true
): Promise<{ userId: number, username: string, password: string, success: boolean }> {
  try {
    // Verificar se o email já está em uso
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email)
    });
    
    if (existingUser) {
      console.log(`Usuário com email ${email} já existe`);
      return {
        userId: existingUser.id,
        username: existingUser.username,
        password: '',
        success: false
      };
    }
    
    // Gerar nome de usuário baseado no email
    const username = generateUsername(email);
    
    // Gerar senha aleatória
    const password = generatePassword(10);
    
    // Hash da senha para armazenamento
    const hashedPassword = await hashPassword(password);
    
    // Criar o usuário na base de dados
    const newUser = await db.insert(users).values({
      username,
      password: hashedPassword,
      email,
      name,
      role: 'org_admin',
      organizationId,
      createdAt: new Date()
    }).returning();
    
    if (!newUser || newUser.length === 0) {
      throw new Error('Falha ao criar usuário administrador');
    }
    
    const userId = newUser[0].id;
    
    // Atualizar a organização com o ID do administrador principal
    await db.update(organizations)
      .set({ adminUserId: userId })
      .where((organizations, { eq }) => eq(organizations.id, organizationId));
    
    // Enviar email com credenciais, se solicitado
    if (sendCredentials) {
      const organizationInfo = await db.query.organizations.findFirst({
        where: (organizations, { eq }) => eq(organizations.id, organizationId)
      });
      
      if (organizationInfo) {
        await sendTemplateEmail(
          email,
          'Credenciais de Acesso ao Endurancy',
          'new_admin_credentials',
          {
            adminName: name,
            organizationName: organizationInfo.name,
            username,
            password,
            accessLink: `${process.env.FRONTEND_URL || 'https://endurancy.app'}/login`,
            passwordResetLink: `${process.env.FRONTEND_URL || 'https://endurancy.app'}/reset-password`
          }
        );
      }
    }
    
    return {
      userId,
      username,
      password,
      success: true
    };
  } catch (error) {
    console.error('Erro ao criar usuário administrador:', error);
    return {
      userId: 0,
      username: '',
      password: '',
      success: false
    };
  }
}

/**
 * Gera um nome de usuário único baseado no email
 * @param email Email do usuário
 */
function generateUsername(email: string): string {
  // Remove a parte do domínio e quaisquer caracteres não alfanuméricos
  const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
  
  // Adiciona um número aleatório para evitar colisões
  const randomSuffix = Math.floor(Math.random() * 1000);
  
  return `${baseUsername}${randomSuffix}`;
}

/**
 * Completa o processo de ativação de uma organização após pagamento bem-sucedido
 * @param organizationId ID da organização
 * @param planId ID do plano
 */
export async function completeOrganizationActivation(
  organizationId: number,
  planId: number
): Promise<boolean> {
  try {
    // 1. Buscar informações da organização
    const organization = await db.query.organizations.findFirst({
      where: (organizations, { eq }) => eq(organizations.id, organizationId)
    });
    
    if (!organization) {
      console.error(`Organização ID ${organizationId} não encontrada`);
      return false;
    }
    
    // 2. Atualizar status da organização
    await db.update(organizations)
      .set({ 
        status: 'active', 
        planId, 
        activated: true,
        activatedAt: new Date(),
        updatedAt: new Date()
      })
      .where((organizations, { eq }) => eq(organizations.id, organizationId));
    
    // 3. Criar conta de administrador (caso não exista)
    if (!organization.adminUserId) {
      const adminResult = await createOrganizationAdminUser(
        organizationId,
        organization.adminName || organization.name,
        organization.adminEmail || '',
        true // Enviar credenciais por email
      );
      
      if (!adminResult.success) {
        console.warn(`Não foi possível criar usuário admin para organização ${organizationId}`);
      }
    }
    
    // 4. Configurar módulos baseados no plano
    const modulesSetup = await setupModulesForOrganization(organizationId, planId);
    
    if (!modulesSetup) {
      console.warn(`Falha ao configurar módulos para organização ${organizationId}`);
    }
    
    // 5. Enviar email de confirmação
    const planInfo = await db.query.plans.findFirst({
      where: (plans, { eq }) => eq(plans.id, planId)
    });
    
    if (organization.adminEmail) {
      await sendTemplateEmail(
        organization.adminEmail,
        'Organização Ativada com Sucesso!',
        'organization_activated',
        {
          adminName: organization.adminName || organization.name,
          organizationName: organization.name,
          planName: planInfo?.name || 'Premium',
          username: organization.adminEmail.split('@')[0], // Username provisório
          accessLink: `${process.env.FRONTEND_URL || 'https://endurancy.app'}/login`
        }
      );
    }
    
    console.log(`Organização ${organizationId} ativada com sucesso!`);
    return true;
  } catch (error) {
    console.error('Erro ao ativar organização:', error);
    return false;
  }
}

/**
 * Função para tratamento de falha no pagamento - acionar plano gratuito
 * @param organizationId ID da organização
 */
export async function handlePaymentFailure(organizationId: number): Promise<boolean> {
  try {
    console.log(`Ativando plano gratuito para organização ${organizationId} devido à falha no pagamento`);
    
    // 1. Buscar informações da organização
    const organization = await db.query.organizations.findFirst({
      where: (organizations, { eq }) => eq(organizations.id, organizationId)
    });
    
    if (!organization) {
      console.error(`Organização ID ${organizationId} não encontrada`);
      return false;
    }
    
    // 2. Buscar o plano gratuito (Freemium ou Básico)
    const freePlan = await db.query.plans.findFirst({
      where: (plans, { and }) => and(
        eq(plans.is_active, true),
        or(
          eq(plans.tier, 'freemium'),
          eq(plans.tier, 'Freemium'),
          eq(plans.tier, 'básico'),
          eq(plans.tier, 'Básico')
        )
      )
    });
    
    if (!freePlan) {
      console.error('Plano gratuito não encontrado no sistema');
      return false;
    }
    
    // 3. Atualizar organização com plano gratuito
    await db.update(organizations)
      .set({ 
        status: 'active', 
        planId: freePlan.id, 
        activated: true,
        activatedAt: new Date(),
        updatedAt: new Date()
      })
      .where((organizations, { eq }) => eq(organizations.id, organizationId));
    
    // 4. Criar conta de administrador (caso não exista)
    if (!organization.adminUserId) {
      const adminResult = await createOrganizationAdminUser(
        organizationId,
        organization.adminName || organization.name,
        organization.adminEmail || '',
        true // Enviar credenciais por email
      );
      
      if (!adminResult.success) {
        console.warn(`Não foi possível criar usuário admin para organização ${organizationId}`);
      }
    }
    
    // 5. Configurar módulos baseados no plano gratuito
    const modulesSetup = await setupModulesForOrganization(organizationId, freePlan.id);
    
    if (!modulesSetup) {
      console.warn(`Falha ao configurar módulos para organização ${organizationId}`);
    }
    
    // 6. Enviar email de notificação sobre ativação com plano gratuito
    if (organization.adminEmail) {
      await sendTemplateEmail(
        organization.adminEmail,
        'Organização Ativada com Plano Gratuito',
        'organization_activated_free',
        {
          adminName: organization.adminName || organization.name,
          organizationName: organization.name,
          planName: freePlan.name,
          username: organization.adminEmail.split('@')[0], // Username provisório
          accessLink: `${process.env.FRONTEND_URL || 'https://endurancy.app'}/login`,
          upgradePlanLink: `${process.env.FRONTEND_URL || 'https://endurancy.app'}/organization/meu-plano`
        }
      );
    }
    
    console.log(`Organização ${organizationId} ativada com plano gratuito após falha no pagamento`);
    return true;
  } catch (error) {
    console.error('Erro ao ativar organização com plano gratuito:', error);
    return false;
  }
}