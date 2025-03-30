/**
 * Este serviço é responsável por criar tickets de exemplo para o ambiente de desenvolvimento
 */

import { organizations, supportTickets, ticketComments, users } from '@shared/schema';
import { db } from '../db';
import { eq, sql } from 'drizzle-orm';

// Interface para os tickets de exemplo com propriedade tempId
interface MockTicket {
  tempId: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  organizationId: number;
  createdById: number;
  assignedToId: number | null;
  resolvedAt?: Date;
  closedAt?: Date;
}

// Interface para os comentários de exemplo
interface MockComment {
  ticketId: number; // Referência ao tempId do ticket
  userId: number;
  content: string;
  isInternal?: boolean;
}

const mockTickets: MockTicket[] = [
  {
    tempId: 1, // ID temporário para referência dos comentários
    title: "Problema de login na plataforma",
    description: "Os usuários estão reportando falhas ao tentar fazer login na plataforma. O erro ocorre após o envio do formulário de login e exibe uma mensagem genérica de erro.",
    status: "novo",
    priority: "alta",
    category: "bug",
    organizationId: 1,
    createdById: 5, // admin
    assignedToId: null,
  },
  {
    tempId: 8, // ID temporário para referência dos comentários
    title: "Implementação do módulo de relatórios avançados",
    description: "Precisamos desenvolver um novo módulo que permita a geração de relatórios avançados com filtros personalizados e visualizações gráficas para análise de dados.",
    status: "em_desenvolvimento",
    priority: "alta",
    category: "desenvolvimento",
    organizationId: 1,
    createdById: 5, // admin
    assignedToId: 5,
  },
  {
    tempId: 2, // ID temporário para referência dos comentários
    title: "Solicitação de integração com sistema externo",
    description: "Nossa associação gostaria de integrar o sistema ComplyPay com nosso ERP existente para facilitar a gestão financeira. Podemos agendar uma reunião para discutir as possibilidades?",
    status: "em_analise",
    priority: "media", 
    category: "melhoria",
    organizationId: 1,
    createdById: 5, // admin
    assignedToId: 5, // admin
  },
  {
    tempId: 3, // ID temporário para referência dos comentários
    title: "Erro ao gerar relatório financeiro",
    description: "Ao tentar exportar o relatório financeiro mensal, o sistema apresenta uma tela de erro. O problema ocorre especificamente ao selecionar o período do último trimestre.",
    status: "em_desenvolvimento",
    priority: "critica",
    category: "bug",
    organizationId: 1,
    createdById: 5, // admin
    assignedToId: 5, // admin
  },
  {
    tempId: 4, // ID temporário para referência dos comentários
    title: "Dúvida sobre limites do plano",
    description: "Estamos próximos de atingir o limite de cadastros do nosso plano atual. O que acontece quando atingimos o limite? Quais são as opções para aumentar nossa capacidade?",
    status: "aguardando_resposta",
    priority: "baixa",
    category: "duvida",
    organizationId: 1,
    createdById: 5, // admin
    assignedToId: 5, // admin
  },
  {
    tempId: 5, // ID temporário para referência dos comentários
    title: "Problema com notificações por email",
    description: "As notificações por email para novos cadastros não estão sendo enviadas desde ontem. Já verificamos nossas configurações de email e tudo parece correto.",
    status: "resolvido",
    priority: "media",
    category: "bug",
    organizationId: 1,
    createdById: 5, // admin
    assignedToId: 5, // admin
    resolvedAt: new Date(),
  },
  {
    tempId: 6, // ID temporário para referência dos comentários
    title: "Sugestão de melhoria no dashboard",
    description: "Seria útil ter um gráfico comparativo de crescimento mês a mês no dashboard principal, permitindo visualizar melhor o progresso ao longo do tempo.",
    status: "fechado",
    priority: "baixa",
    category: "melhoria",
    organizationId: 1,
    createdById: 5, // admin
    assignedToId: 5, // admin
    resolvedAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 dias atrás
    closedAt: new Date(),
  },
  {
    tempId: 7, // ID temporário para referência dos comentários
    title: "Problema de segurança na API",
    description: "Identificamos uma possível vulnerabilidade na API de acesso a dados. É necessário verificar as permissões e autenticação dos endpoints públicos.",
    status: "novo",
    priority: "critica",
    category: "seguranca",
    organizationId: 1,
    createdById: 5, // admin
    assignedToId: null,
  },
];

const mockComments = [
  {
    ticketId: 8, // Para o ticket "Implementação do módulo de relatórios avançados"
    userId: 5, // admin
    content: "Desenvolvimento iniciado. Estamos na fase de planejamento do módulo e definição da arquitetura. Estimativa inicial é de 3 semanas para conclusão.",
    isInternal: true,
  },
  {
    ticketId: 2, // Para o ticket "Solicitação de integração com sistema externo"
    userId: 5, // admin
    content: "Estamos analisando as possibilidades de integração. Podemos agendar uma videochamada para a próxima semana?",
    isInternal: false,
  },
  {
    ticketId: 3, // Para o ticket "Erro ao gerar relatório financeiro"
    userId: 5, // admin
    content: "Conseguimos reproduzir o erro. Estamos trabalhando na correção que deve ser implementada até o final desta semana.",
    isInternal: false,
  },
  {
    ticketId: 3, // Outro comentário para o mesmo ticket
    userId: 5, // admin
    content: "Identificamos a causa do problema. É um erro na formatação de datas quando o relatório abrange múltiplos meses.",
    isInternal: true, // Comentário interno visível apenas para admins
  },
  {
    ticketId: 4, // Para o ticket "Dúvida sobre limites do plano"
    userId: 5, // admin
    content: "Quando o limite é atingido, o sistema não permite novos cadastros, mas todos os outros recursos continuam funcionando normalmente. Posso entrar em contato para discutirmos opções de upgrade?",
    isInternal: false,
  },
  {
    ticketId: 5, // Para o ticket "Problema com notificações por email"
    userId: 5, // admin
    content: "Identificamos um problema no servidor de emails. O serviço foi restaurado e as notificações já estão sendo enviadas novamente.",
    isInternal: false,
  },
  {
    ticketId: 5, // Outro comentário para o mesmo ticket
    userId: 5, // admin
    content: "Implementamos também um sistema de monitoramento para evitar que esse problema ocorra novamente no futuro.",
    isInternal: true, // Comentário interno visível apenas para admins
  },
];

/**
 * Inicializa tickets de exemplo no banco de dados
 */
export async function initializeMockTickets() {
  try {
    // Verificar se já existem tickets
    const result = await db.execute(sql`SELECT COUNT(*) AS count FROM support_tickets`);
    const existingTickets = result.rows && result.rows.length > 0 ? parseInt(result.rows[0].count) : 0;
    
    // Se não existirem tickets, criar os tickets de exemplo
    if (existingTickets === 0) {
      console.log("[Tickets Mock] Inicializando tickets de exemplo...");
      
      // Obter IDs das organizações existentes
      const orgs = await db.select({ id: organizations.id }).from(organizations);
      const orgIds = orgs.map(org => org.id);
      
      if (orgIds.length === 0) {
        console.error("[Tickets Mock] Nenhuma organização encontrada, não é possível criar tickets");
        return;
      }
      
      // Ajustar os IDs das organizações nos tickets mock para usar apenas organizações existentes
      mockTickets.forEach(ticket => {
        if (!orgIds.includes(ticket.organizationId)) {
          ticket.organizationId = orgIds[0]; // Usar a primeira organização se a original não existir
        }
      });
      
      // Criar tickets de exemplo
      for (const mockTicket of mockTickets) {
        try {
          const [ticket] = await db.insert(supportTickets)
            .values({
              title: mockTicket.title,
              description: mockTicket.description,
              status: mockTicket.status,
              priority: mockTicket.priority,
              category: mockTicket.category,
              organizationId: mockTicket.organizationId,
              createdById: mockTicket.createdById,
              assignedToId: mockTicket.assignedToId,
              createdAt: new Date(),
              resolvedAt: mockTicket.resolvedAt || null,
              closedAt: mockTicket.closedAt || null
            })
            .returning();
            
          console.log(`[Tickets Mock] Ticket criado: ${ticket.id} - ${ticket.title}`);
          
          // Criar comentários relacionados a este ticket
          const ticketCommentsMock = mockComments.filter(comment => comment.ticketId === mockTicket.tempId);
          
          for (const comment of ticketCommentsMock) {
            await db.insert(ticketComments)
              .values({
                ticketId: ticket.id,
                userId: comment.userId,
                content: comment.content,
                isInternal: comment.isInternal || false,
                createdAt: new Date()
              }).catch(err => {
                console.error(`[Tickets Mock] Erro ao inserir comentário: ${err.message}`);
              });
            try {
              console.log(`[Tickets Mock] Comentário adicionado ao ticket ${ticket.id}`);
            } catch (err) {
              // Ignora erros de log
            }
          }
        } catch (error) {
          console.error("[Tickets Mock] Erro ao criar ticket de exemplo:", error);
        }
      }
      
      console.log("[Tickets Mock] Tickets de exemplo inicializados com sucesso");
    } else {
      console.log("[Tickets Mock] Tickets já existem, pulando inicialização de dados mock");
    }
  } catch (error) {
    console.error("[Tickets Mock] Erro ao inicializar tickets de exemplo:", error);
  }
}

/**
 * Verifica se existem organizações antes de inicializar os tickets
 * Isso é importante pois os tickets dependem das organizações existentes
 */
export async function ensureOrganizationsExist() {
  try {
    const [orgCount] = await db.select({ count: sql`count(*)` }).from(organizations);
    
    if (orgCount.count === 0) {
      // Criar organizações de exemplo
      await db.insert(organizations)
        .values([
          {
            name: "Associação Canábica Medicinal",
            adminName: "João Silva",
            type: "Associação",
            cnpj: "12345678000100",
            website: "https://assoccannabis.com.br",
            planId: 1,
            planTier: "pro",
            status: "active",
            email: "contato@assoccannabis.com.br",
            adminCpf: "12345678900",
            password: "senha123", // Em produção, seria hasheada
            confirmPassword: "senha123",
            phone: "11999998888",
            address: "Rua das Flores, 123",
            city: "São Paulo",
            state: "SP",
            bankName: "Banco do Brasil",
            bankBranch: "0001",
            bankAccount: "123456-7",
            termsAccepted: true,
            orgCode: "ACM001",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: "Cannabis Terapêutica Brasil",
            adminName: "Maria Oliveira",
            type: "Associação",
            cnpj: "98765432000199",
            website: "https://cannabisterapeutica.com.br",
            planId: 2,
            planTier: "grow",
            status: "active",
            email: "contato@cannabisterapeutica.com.br",
            adminCpf: "98765432100",
            password: "senha123", // Em produção, seria hasheada
            confirmPassword: "senha123",
            phone: "11988887777",
            address: "Av. Paulista, 1000",
            city: "São Paulo",
            state: "SP",
            bankName: "Itaú",
            bankBranch: "0123",
            bankAccount: "654321-0",
            termsAccepted: true,
            orgCode: "CTB002",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: "Empresa de Cultivo Medicinal",
            adminName: "Roberto Mendes",
            type: "Empresa",
            cnpj: "45678912000188",
            website: "https://cultivomedicinal.com.br",
            planId: 3,
            planTier: "seed",
            status: "active",
            email: "contato@cultivomedicinal.com.br",
            adminCpf: "45678912300",
            password: "senha123", // Em produção, seria hasheada
            confirmPassword: "senha123",
            phone: "11977776666",
            address: "Rua dos Canabinóides, 420",
            city: "Rio de Janeiro",
            state: "RJ",
            bankName: "Santander",
            bankBranch: "4567",
            bankAccount: "789012-3",
            termsAccepted: true,
            orgCode: "ECM003",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
      
      console.log("[Tickets Mock] Organizações de exemplo criadas com sucesso");
    }
  } catch (error) {
    console.error("[Tickets Mock] Erro ao verificar ou criar organizações:", error);
  }
}

export async function ensureAdminUserExists() {
  try {
    // Verificar se já existe um usuário admin
    const adminUser = await db.select().from(users).where(eq(users.role, 'admin')).limit(1);
    
    if (adminUser.length === 0) {
      // Criar um usuário admin
      await db.insert(users)
        .values({
          id: 5, // ID fixo para referências
          username: "admin@comply.com",
          password: "$2b$10$5dwsS5snIRlKCnUkd5I/2um1GQta5nzaqjM9nP0WbRZb5HjJUXpLG", // "password" hasheado
          role: "admin",
          name: "Administrador",
          email: "admin@comply.com",
          createdAt: new Date(),
        });
      
      console.log("[Tickets Mock] Usuário admin criado com sucesso");
    }
  } catch (error) {
    console.error("[Tickets Mock] Erro ao verificar ou criar usuário admin:", error);
  }
}