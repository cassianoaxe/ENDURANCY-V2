import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Book,
  Code,
  Database,
  FileJson,
  LayoutDashboard,
  Lock,
  Server,
  CreditCard,
  MessageSquare,
  Bell,
  User,
  PanelLeft,
  Webhook,
  BrainCircuit,
  ListChecks,
  TabletSmartphone,
  Settings,
  FileText
} from "lucide-react";

export default function Documentation() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold mb-2">Documentação do Endurancy</h1>
        <p className="text-gray-600 mb-8">
          Documentação técnica e guias para desenvolvedores do sistema Endurancy SaaS
        </p>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 flex flex-wrap h-auto p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Visão geral
            </TabsTrigger>
            <TabsTrigger value="architecture" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <PanelLeft className="h-4 w-4 mr-2" />
              Arquitetura
            </TabsTrigger>
            <TabsTrigger value="frontend" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <TabletSmartphone className="h-4 w-4 mr-2" />
              Frontend
            </TabsTrigger>
            <TabsTrigger value="backend" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Server className="h-4 w-4 mr-2" />
              Backend
            </TabsTrigger>
            <TabsTrigger value="database" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Database className="h-4 w-4 mr-2" />
              Banco de dados
            </TabsTrigger>
            <TabsTrigger value="auth" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Lock className="h-4 w-4 mr-2" />
              Autenticação
            </TabsTrigger>
            <TabsTrigger value="payment" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CreditCard className="h-4 w-4 mr-2" />
              Sistema de pagamento
            </TabsTrigger>
            <TabsTrigger value="tickets" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MessageSquare className="h-4 w-4 mr-2" />
              Sistema de tickets
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Bell className="h-4 w-4 mr-2" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="multitenancy" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <User className="h-4 w-4 mr-2" />
              Multi-tenancy
            </TabsTrigger>
            <TabsTrigger value="apis" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Webhook className="h-4 w-4 mr-2" />
              APIs
            </TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BrainCircuit className="h-4 w-4 mr-2" />
              Integração com IA
            </TabsTrigger>
            <TabsTrigger value="deployment" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ListChecks className="h-4 w-4 mr-2" />
              Deployment
            </TabsTrigger>
          </TabsList>

          {/* Conteúdo das tabs */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Book className="h-5 w-5 mr-2" />
                  Visão geral do Endurancy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <section>
                  <h3 className="text-lg font-medium mb-2">Sobre o Endurancy</h3>
                  <p className="text-gray-700">
                    O Endurancy é uma plataforma SaaS (Software as a Service) completa desenvolvida para gestão de organizações
                    com foco em modularidade, escalabilidade e usabilidade. O sistema oferece diferentes níveis de assinatura
                    e módulos complementares que podem ser adquiridos conforme a necessidade de cada organização.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Funcionalidades principais</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Dashboard administrativo com métricas e KPIs</li>
                    <li>Gestão de múltiplas organizações com sistema multi-tenant</li>
                    <li>Sistema de planos e assinaturas com cobrança recorrente</li>
                    <li>Módulos complementares adquiríveis individualmente</li>
                    <li>Sistema avançado de suporte com tickets, categorias e prioridades</li>
                    <li>Gestão financeira completa com relatórios e análises</li>
                    <li>Integração com IA para sugestões e automações</li>
                    <li>Sistema de notificações em tempo real</li>
                    <li>APIs para integração com sistemas externos</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Estrutura de Planos</h3>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Limite</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Módulos</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">Free (Trial)</td>
                        <td className="px-6 py-4 whitespace-nowrap">Gratuito</td>
                        <td className="px-6 py-4 whitespace-nowrap">15 dias</td>
                        <td className="px-6 py-4 whitespace-nowrap">Básicos</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">Seed</td>
                        <td className="px-6 py-4 whitespace-nowrap">R$ 499/mês</td>
                        <td className="px-6 py-4 whitespace-nowrap">1.000 cadastros</td>
                        <td className="px-6 py-4 whitespace-nowrap">Básicos</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">Grow</td>
                        <td className="px-6 py-4 whitespace-nowrap">R$ 999/mês</td>
                        <td className="px-6 py-4 whitespace-nowrap">5.000 cadastros</td>
                        <td className="px-6 py-4 whitespace-nowrap">Básicos + Cultivo + Produção</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">Pro</td>
                        <td className="px-6 py-4 whitespace-nowrap">R$ 2.999/mês</td>
                        <td className="px-6 py-4 whitespace-nowrap">10.000 cadastros</td>
                        <td className="px-6 py-4 whitespace-nowrap">Básicos + Cultivo + Produção</td>
                      </tr>
                    </tbody>
                  </table>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Módulos disponíveis</h3>
                  <p className="mb-4">
                    <strong>Módulos básicos</strong> (incluídos em todos os planos): Onboarding, Analytics, Dashboard, Associados, Vendas, Financeiro, ComplyPay
                  </p>
                  <p className="mb-4">
                    <strong>Módulos adicionais</strong> (R$ 99/mês cada): Tarefas, CRM, Social, RH, Jurídico, Transparência, IA, Compras, Dispensário, Patrimônio, Comunicação, Pesquisa Científica, Educação do Paciente
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Stack tecnológica</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Frontend: React, TypeScript, Tailwind CSS, ShadCN UI</li>
                    <li>Backend: Node.js, Express</li>
                    <li>Banco de dados: PostgreSQL</li>
                    <li>ORM: Drizzle</li>
                    <li>Autenticação: Express Session, Passport.js</li>
                    <li>Gerenciamento de estado: TanStack Query (React Query)</li>
                    <li>Processamento de pagamentos: Stripe</li>
                    <li>Email: Nodemailer</li>
                  </ul>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="architecture" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PanelLeft className="h-5 w-5 mr-2" />
                  Arquitetura do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <section>
                  <h3 className="text-lg font-medium mb-2">Visão Geral da Arquitetura</h3>
                  <p className="text-gray-700 mb-4">
                    O Endurancy segue uma arquitetura modular baseada em serviços, com uma clara separação entre 
                    frontend, backend e banco de dados. A aplicação é projetada com foco em escalabilidade e 
                    manutenibilidade, utilizando padrões modernos de desenvolvimento.
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm">
                      {`
┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐
│                     │       │                     │       │                     │
│  Frontend           │       │  Backend            │       │  Banco de Dados     │
│  React + TypeScript │◄────►│  Node.js + Express  │◄────►│  PostgreSQL         │
│  TanStack Query     │       │  API RESTful        │       │  Drizzle ORM        │
│                     │       │                     │       │                     │
└─────────────────────┘       └─────────────────────┘       └─────────────────────┘
          │                             │                             │
          │                             │                             │
          ▼                             ▼                             ▼
┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐
│                     │       │                     │       │                     │
│  Componentes UI     │       │  Serviços Externos  │       │  Serviços           │
│  ShadCN UI          │       │  Stripe             │       │  Autenticação       │
│  Tailwind CSS       │       │  Email              │       │  Notificações       │
│                     │       │                     │       │  Pagamentos         │
└─────────────────────┘       └─────────────────────┘       └─────────────────────┘
                      `}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Estrutura de Diretórios</h3>
                  <p className="text-gray-700 mb-4">
                    A organização do código segue um padrão modular e intuitivo:
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm">
                      {`
├── client/                   # Frontend React
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   │   ├── layout/       # Componentes de layout (Sidebar, Header, etc)
│   │   │   ├── features/     # Componentes específicos de features
│   │   │   └── ui/           # Componentes básicos de UI (ShadCN)
│   │   ├── contexts/         # Contextos React
│   │   ├── hooks/            # Hooks customizados
│   │   ├── lib/              # Utilitários e configurações 
│   │   ├── pages/            # Páginas da aplicação
│   │   └── App.tsx           # Componente principal
│   ├── index.html            # HTML de entrada
│   └── package.json          # Dependências do frontend
│
├── server/                   # Backend
│   ├── db.ts                 # Configuração do banco de dados
│   ├── index.ts              # Ponto de entrada do servidor
│   ├── routes.ts             # Definição de rotas da API
│   ├── storage.ts            # Interface de acesso a dados
│   ├── vite.ts               # Configuração do Vite para desenvolvimento
│   └── services/             # Serviços do backend
│       ├── aiSuggestions.ts  # Sugestões de IA
│       ├── email.ts          # Serviço de email
│       ├── notifications.ts  # Serviço de notificações
│       ├── payments.ts       # Processamento de pagamentos
│       ├── stripe.ts         # Integração com Stripe
│       └── ticketsMockData.ts # Geração de dados de exemplo para tickets
│
├── shared/                   # Código compartilhado
│   └── schema.ts             # Definição do esquema do banco (Drizzle)
│
├── uploads/                  # Arquivos enviados pelos usuários
│
└── drizzle.config.ts         # Configuração do Drizzle ORM
                      `}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Fluxo de comunicação</h3>
                  <p className="text-gray-700 mb-4">
                    O diagrama abaixo demonstra o fluxo de comunicação entre as camadas do sistema:
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm">
                      {`
1. Cliente (Browser) ──► API React/TanStack Query ──► Servidor Express
2. Servidor Express ──► Serviços ──► Camada de Persistência (Drizzle ORM) ──► PostgreSQL
3. Servidor Express ──► Integrações Externas (Stripe, Email, etc.)
4. Servidor Express ──► Cliente (Browser) com resposta da API
                      `}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Multi-tenancy</h3>
                  <p className="text-gray-700">
                    O Endurancy implementa multi-tenancy baseado em ID de organização, onde cada
                    organização tem seus próprios usuários, dados e configurações isolados, porém 
                    compartilhando a mesma infraestrutura. O esquema de banco de dados inclui 
                    relações com organizationId para segregar os dados.
                  </p>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="frontend" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TabletSmartphone className="h-5 w-5 mr-2" />
                  Frontend
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <section>
                  <h3 className="text-lg font-medium mb-2">Visão Geral do Frontend</h3>
                  <p className="text-gray-700 mb-4">
                    O frontend do Endurancy é construído com React e TypeScript, utilizando o Vite como
                    bundler. A interface de usuário é baseada em componentes reutilizáveis, com estilização
                    via Tailwind CSS e biblioteca de componentes ShadCN UI.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Componentes principais</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>App.tsx:</strong> Componente raiz que configura roteamento e contextos</li>
                    <li><strong>Sidebar.tsx:</strong> Menu lateral de navegação</li>
                    <li><strong>Páginas:</strong> Componentes para cada rota principal</li>
                    <li><strong>UI Components:</strong> Componentes básicos reutilizáveis (botões, cards, etc.)</li>
                    <li><strong>Features:</strong> Componentes específicos para funcionalidades (TicketAiSuggestions, etc.)</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Gerenciamento de estado</h3>
                  <p className="text-gray-700 mb-4">
                    O Endurancy utiliza TanStack Query (React Query) para gerenciamento de estado relacionado 
                    a dados da API, com hooks customizados para autenticação e outras funcionalidades.
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm language-javascript">
                      {`
// Exemplo de hook usando React Query
import { useQuery } from '@tanstack/react-query';

export function useOrganizations() {
  return useQuery({
    queryKey: ['/api/organizations'],
    // queryFn já configurado globalmente
  });
}

// Exemplo de mutação
const mutation = useMutation({
  mutationFn: async (data) => {
    const response = await apiRequest("POST", "/api/resource", data);
    return response.json();
  },
  onSuccess: () => {
    // Invalidar queries para atualizar dados
    queryClient.invalidateQueries({ queryKey: ['/api/resource'] });
  }
});
                      `}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Roteamento</h3>
                  <p className="text-gray-700 mb-4">
                    O roteamento é implementado usando uma combinação de wouter e navegação manual
                    via manipulação de histórico para suportar o layout com sidebar persistente.
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm language-javascript">
                      {`
// Navegação manual via history API
const navigate = (path: string) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new Event('popstate'));
};

// Ou usando wouter
const [location, setLocation] = useLocation();
                      `}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Formulários</h3>
                  <p className="text-gray-700 mb-4">
                    Os formulários utilizam react-hook-form com validação via Zod e resolvers específicos.
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm language-javascript">
                      {`
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertResourceSchema } from "@shared/schema";

// Dentro do componente
const form = useForm({
  resolver: zodResolver(insertResourceSchema),
  defaultValues: { name: "", description: "" }
});
                      `}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Boas práticas</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Utilizar componentes separados para responsabilidades diferentes</li>
                    <li>Criar hooks customizados para lógica reutilizável</li>
                    <li>Manter tipos em sincronia com o backend via schema compartilhado</li>
                    <li>Utilizar TanStack Query para cache automático de dados e revalidação</li>
                    <li>Separar lógica de UI da lógica de negócios</li>
                    <li>Implementar tratamento de erros consistente</li>
                  </ul>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backend" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="h-5 w-5 mr-2" />
                  Backend
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <section>
                  <h3 className="text-lg font-medium mb-2">Visão Geral do Backend</h3>
                  <p className="text-gray-700 mb-4">
                    O backend do Endurancy é construído com Node.js e Express, seguindo uma arquitetura 
                    baseada em serviços com endpoints RESTful. A camada de dados utiliza Drizzle ORM
                    para interação com o PostgreSQL.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Estrutura de API</h3>
                  <p className="text-gray-700 mb-4">
                    As rotas da API seguem um padrão RESTful, organizadas por recursos:
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm">
                      {`
• GET    /api/organizations               # Listar organizações
• GET    /api/organizations/:id           # Detalhes de uma organização
• POST   /api/organizations               # Criar organização
• PATCH  /api/organizations/:id           # Atualizar organização

• GET    /api/tickets                     # Listar tickets
• GET    /api/tickets/:id                 # Detalhes de um ticket
• POST   /api/tickets                     # Criar ticket
• PATCH  /api/tickets/:id/status          # Atualizar status do ticket
• PATCH  /api/tickets/:id/priority        # Atualizar prioridade do ticket
• PATCH  /api/tickets/:id/assign          # Atribuir ticket
• POST   /api/tickets/:id/comments        # Adicionar comentário

• GET    /api/modules                     # Listar módulos
• GET    /api/organizations/:id/modules   # Módulos de uma organização
• POST   /api/organizations/:id/modules   # Adicionar módulo a uma organização

• GET    /api/plans                       # Listar planos
• POST   /api/checkout                    # Processar checkout
• GET    /api/module-plans                # Listar planos de módulos

• GET    /api/notifications               # Listar notificações
• PATCH  /api/notifications/:id/read      # Marcar notificação como lida

• GET    /api/support/stats               # Estatísticas de suporte
• GET    /api/tickets/:id/suggestions     # Sugestões de IA para ticket
                      `}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Middleware de autenticação</h3>
                  <p className="text-gray-700 mb-4">
                    O Endurancy utiliza middleware de autenticação para proteger rotas:
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm language-javascript">
                      {`
// Middleware de autenticação
const authenticate = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
};

// Middleware de verificação de permissões
const requireAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

// Uso nos endpoints
app.get('/api/admin-resource', authenticate, requireAdmin, (req, res) => {
  // Handler para admin
});
                      `}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Serviços principais</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Email (email.ts):</strong> Gerencia envio de emails usando Nodemailer com templates para diferentes finalidades</li>
                    <li><strong>Pagamentos (payments.ts):</strong> Integração com Stripe para processamento de pagamentos e assinaturas</li>
                    <li><strong>Notificações (notifications.ts):</strong> Sistema de notificações para usuários</li>
                    <li><strong>IA (aiSuggestions.ts):</strong> Fornece sugestões contextuais baseadas em IA para tickets</li>
                    <li><strong>Mock Data (ticketsMockData.ts):</strong> Geração de dados de exemplo para desenvolvimento e testes</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Padrões de resposta</h3>
                  <p className="text-gray-700 mb-4">
                    A API segue padrões consistentes para formatação de respostas:
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm">
                      {`
// Respostas de sucesso
{
  ...data  // Dados da resposta diretamente
}

// Respostas de erro
{
  "message": "Mensagem de erro amigável",
  "error": "Detalhes técnicos do erro (apenas em ambiente de desenvolvimento)"
}
                      `}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Boas práticas</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Validar input do usuário usando schemas do Zod</li>
                    <li>Usar tratamento de erros consistente</li>
                    <li>Implementar middleware para funcionalidades transversais</li>
                    <li>Seguir princípios RESTful para APIs</li>
                    <li>Utilizar tipos compartilhados com o frontend</li>
                    <li>Manter serviços em módulos separados e reutilizáveis</li>
                  </ul>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Banco de Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <section>
                  <h3 className="text-lg font-medium mb-2">Visão Geral do Banco de Dados</h3>
                  <p className="text-gray-700 mb-4">
                    O Endurancy utiliza PostgreSQL como banco de dados relacional, com Drizzle ORM para
                    definição de schema, migrações e queries. O esquema é definido em TypeScript com
                    tipagem forte.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Principais entidades</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>users:</strong> Usuários do sistema com diferentes roles</li>
                    <li><strong>organizations:</strong> Organizações/clientes da plataforma</li>
                    <li><strong>plans:</strong> Planos de assinatura disponíveis</li>
                    <li><strong>modules:</strong> Módulos do sistema</li>
                    <li><strong>organizationModules:</strong> Relação de módulos por organização</li>
                    <li><strong>modulePlans:</strong> Planos específicos para módulos adicionais</li>
                    <li><strong>supportTickets:</strong> Tickets de suporte</li>
                    <li><strong>ticketComments:</strong> Comentários em tickets</li>
                    <li><strong>ticketAttachments:</strong> Anexos em tickets</li>
                    <li><strong>notifications:</strong> Notificações para usuários</li>
                    <li><strong>financialTransactions:</strong> Transações financeiras</li>
                    <li><strong>employees:</strong> Funcionários (para módulo RH)</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Diagrama ER simplificado</h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm">
                      {`
users ────────┐
              │
organizations ┼─── organizationModules ─── modules
              │           │
              │           │
supportTickets┼───ticketComments
              │           
              │           
notifications ┘           
                      `}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Exemplo de definição de schema (Drizzle)</h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm language-typescript">
                      {`
// Enums
export const roleEnum = pgEnum('role_type', ['admin', 'org_admin', 'doctor', 'patient']);
export const planTierEnum = pgEnum('plan_tier', ['free', 'seed', 'grow', 'pro']);

// Tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: roleEnum("role").notNull().default('patient'),
  organizationId: integer("organization_id").references(() => organizations.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  logo: text("logo"),
  orgCode: text("org_code").unique(),
  status: text("status").notNull().default('pending'),
  planId: integer("plan_id").references(() => plans.id),
  planTier: planTierEnum("plan_tier").notNull().default('free'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
  approvedAt: timestamp("approved_at"),
  expiresAt: timestamp("expires_at"),
});
                      `}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Migrações e schema</h3>
                  <p className="text-gray-700 mb-4">
                    O Endurancy utiliza o comando <code>db:push</code> para sincronizar o schema com o banco de dados:
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm">
                      {`
# Sincronizar schema com o banco
npm run db:push

# Configuração do Drizzle (drizzle.config.ts)
export default {
  schema: "./shared/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
};
                      `}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Queries com Drizzle</h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm language-typescript">
                      {`
// Consulta simples
const allUsers = await db.select().from(users);

// Consulta com filtro
const orgUsers = await db
  .select()
  .from(users)
  .where(eq(users.organizationId, orgId));

// Join
const ticketsWithOrgs = await db
  .select({
    ticketId: supportTickets.id,
    title: supportTickets.title,
    orgName: organizations.name
  })
  .from(supportTickets)
  .leftJoin(organizations, eq(supportTickets.organizationId, organizations.id));

// Inserção
const newUser = await db
  .insert(users)
  .values({
    username: 'novousuario',
    password: 'senhaencriptada',
    name: 'Novo Usuário',
    email: 'usuario@exemplo.com',
    role: 'admin',
  })
  .returning();
                      `}
                    </pre>
                  </div>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auth" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Autenticação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <section>
                  <h3 className="text-lg font-medium mb-2">Sistema de Autenticação</h3>
                  <p className="text-gray-700 mb-4">
                    O Endurancy implementa autenticação baseada em sessão usando Express Session e Passport.js,
                    com diferentes níveis de acesso baseados em roles.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Roles e Permissões</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>admin:</strong> Acesso completo à plataforma, todas as organizações e configurações</li>
                    <li><strong>org_admin:</strong> Acesso administrativo dentro da própria organização</li>
                    <li><strong>doctor:</strong> Acesso específico para médicos dentro de uma organização</li>
                    <li><strong>patient:</strong> Acesso limitado como paciente</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Implementação da autenticação</h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm language-javascript">
                      {`
// Configuração do Passport.js e Session
passport.use(
  new LocalStrategy(async (username, password, done) => {
    const user = await storage.getUserByUsername(username);
    if (!user || !(await comparePasswords(password, user.password))) {
      return done(null, false);
    } else {
      return done(null, user);
    }
  }),
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id: number, done) => {
  const user = await storage.getUser(id);
  done(null, user);
});

// Endpoints de autenticação
app.post("/api/login", passport.authenticate("local"), (req, res) => {
  res.status(200).json(req.user);
});

app.post("/api/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.sendStatus(200);
  });
});

app.get("/api/user", (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  res.json(req.user);
});
                      `}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Segurança de senhas</h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm language-javascript">
                      {`
// Hash da senha usando scrypt
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return \`\${buf.toString("hex")}.\${salt}\`;
}

// Comparação segura de senhas
async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
                      `}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Autenticação no Frontend</h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm language-javascript">
                      {`
// Hook de autenticação (useAuth)
export function useAuth() {
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
    },
  });

  // Outros mutations...

  return {
    user: user ?? null,
    isLoading,
    error,
    loginMutation,
    logoutMutation,
    registerMutation,
  };
}

// ProtectedRoute para proteger rotas que exigem autenticação
export function ProtectedRoute({ path, component: Component }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return <Component />;
}
                      `}
                    </pre>
                  </div>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Sistema de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <section>
                  <h3 className="text-lg font-medium mb-2">Visão Geral do Sistema de Pagamento</h3>
                  <p className="text-gray-700 mb-4">
                    O Endurancy utiliza a API do Stripe para processar pagamentos de assinaturas e
                    módulos adicionais. A integração permite cobranças recorrentes, checkout personalizado,
                    e gerenciamento de planos.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Fluxo de checkout</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Usuário seleciona um plano ou módulo</li>
                    <li>Sistema cria uma PaymentIntent ou Subscription no Stripe</li>
                    <li>Cliente confirma pagamento usando Stripe Elements no frontend</li>
                    <li>Webhook do Stripe confirma o pagamento</li>
                    <li>Sistema atualiza o status da assinatura/plano da organização</li>
                  </ol>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Implementação do Stripe no Backend</h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm language-javascript">
                      {`
// Inicialização do cliente Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

// Endpoint para criar um PaymentIntent (pagamento único)
app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Converter para centavos
      currency: "brl",
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    res.status(500).json({ message: "Erro ao criar pagamento: " + error.message });
  }
});

// Endpoint para criar ou recuperar uma assinatura
app.post('/api/get-or-create-subscription', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.sendStatus(401);
  }

  let user = req.user;

  if (user.stripeSubscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    res.send({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice?.payment_intent.client_secret,
    });
    return;
  }
  
  // Criar novo cliente Stripe e assinatura
  try {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.username,
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price: process.env.STRIPE_PRICE_ID,
      }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    // Atualizar informações do usuário
    await storage.updateUserStripeInfo(user.id, {
      stripeCustomerId: customer.id, 
      stripeSubscriptionId: subscription.id
    });

    res.send({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice?.payment_intent.client_secret,
    });
  } catch (error: any) {
    return res.status(400).send({ error: { message: error.message } });
  }
});
                      `}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Componente de checkout no Frontend</h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm language-javascript">
                      {`
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Carregamento do Stripe fora do componente para evitar recriação
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Pagamento Falhou",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button>Pagar</button>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    // Criar PaymentIntent quando a página carregar
    apiRequest("POST", "/api/create-payment-intent", { 
      amount: 321 // Valor em reais
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret)
      });
  }, []);

  if (!clientSecret) {
    return <LoadingSpinner />;
  }
  
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm />
    </Elements>
  );
};
                      `}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Webhook do Stripe</h3>
                  <p className="text-gray-700 mb-4">
                    O sistema implementa webhooks para processar eventos assíncronos do Stripe:
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm language-javascript">
                      {`
// Endpoint para webhooks do Stripe
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(\`Webhook Error: \${err.message}\`);
  }
  
  // Processar eventos específicos
  switch (event.type) {
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      await handleSuccessfulPayment(invoice);
      break;
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      await handleSubscriptionUpdate(subscription);
      break;
    case 'customer.subscription.deleted':
      const canceledSubscription = event.data.object;
      await handleSubscriptionCancellation(canceledSubscription);
      break;
    default:
      console.log(\`Unhandled event type \${event.type}\`);
  }
  
  res.json({ received: true });
});
                      `}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Testes e Sandbox</h3>
                  <p className="text-gray-700 mb-4">
                    Para testes, o Stripe oferece cartões de crédito de teste:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>4242 4242 4242 4242:</strong> Pagamento bem-sucedido</li>
                    <li><strong>4000 0000 0000 0002:</strong> Pagamento recusado</li>
                    <li><strong>4000 0025 0000 3155:</strong> Pagamento que requer autenticação</li>
                  </ul>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Sistema de Tickets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <section>
                  <h3 className="text-lg font-medium mb-2">Visão Geral do Sistema de Tickets</h3>
                  <p className="text-gray-700 mb-4">
                    O Endurancy implementa um sistema completo de tickets de suporte, permitindo
                    comunicação entre usuários e administradores, com categorização, priorização, 
                    atribuições e integração de IA para sugestões contextuais.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Fluxo de trabalho de tickets</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Usuário cria um ticket com título, descrição, categoria e anexos opcionais</li>
                    <li>O ticket é registrado com status inicial "novo" e dados da organização</li>
                    <li>Administrador recebe notificação de novo ticket</li>
                    <li>Administrador pode atribuir, categorizar, priorizar e responder ao ticket</li>
                    <li>O sistema fornece sugestões de IA para agilizar o atendimento</li>
                    <li>Usuário e administrador trocam mensagens até a resolução</li>
                    <li>O ticket é marcado como resolvido/fechado quando finalizado</li>
                  </ol>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Estados e transições de tickets</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>novo:</strong> Ticket recém-criado</li>
                    <li><strong>em_analise:</strong> Administrador está analisando o ticket</li>
                    <li><strong>em_desenvolvimento:</strong> Equipe está trabalhando na solução</li>
                    <li><strong>aguardando_resposta:</strong> Esperando resposta do usuário</li>
                    <li><strong>resolvido:</strong> Problema foi resolvido</li>
                    <li><strong>fechado:</strong> Ticket encerrado após resolução</li>
                    <li><strong>cancelado:</strong> Ticket foi cancelado</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Níveis de prioridade</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>baixa:</strong> Pode ser atendido quando houver disponibilidade</li>
                    <li><strong>media:</strong> Deve ser atendido em tempo razoável</li>
                    <li><strong>alta:</strong> Requer atenção rápida</li>
                    <li><strong>critica:</strong> Problema grave que exige atenção imediata</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Categorias de tickets</h3>
                  <ul className="list-disc pl-6 space-y-3">
                    <li><strong>bug:</strong> Problema técnico/erro no sistema</li>
                    <li><strong>melhoria:</strong> Sugestão de nova funcionalidade ou melhoria</li>
                    <li><strong>duvida:</strong> Questionamento sobre uso do sistema</li>
                    <li><strong>financeiro:</strong> Questões relacionadas a pagamentos</li>
                    <li><strong>acesso:</strong> Problemas de login ou permissões</li>
                    <li><strong>seguranca:</strong> Questões de segurança ou privacidade</li>
                    <li><strong>performance:</strong> Problemas de desempenho</li>
                    <li><strong>desenvolvimento:</strong> Customizações ou desenvolvimentos específicos</li>
                    <li><strong>outros:</strong> Outras categorias não especificadas</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Implementação no banco de dados</h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm language-typescript">
                      {`
export const ticketStatusEnum = pgEnum('ticket_status', [
  'novo', 'em_analise', 'em_desenvolvimento', 'aguardando_resposta', 'resolvido', 'fechado', 'cancelado'
]);

export const ticketPriorityEnum = pgEnum('ticket_priority', ['baixa', 'media', 'alta', 'critica']);

export const ticketCategoryEnum = pgEnum('ticket_category', [
  'bug', 'melhoria', 'duvida', 'financeiro', 'acesso', 'seguranca', 'performance', 'desenvolvimento', 'outros'
]);

export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: ticketStatusEnum("status").notNull().default('novo'),
  priority: ticketPriorityEnum("priority").notNull().default('media'),
  category: ticketCategoryEnum("category").notNull(),
  organizationId: integer("organization_id").notNull(),
  createdById: integer("created_by_id").notNull(),
  assignedToId: integer("assigned_to_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  closedAt: timestamp("closed_at"),
});

export const ticketComments = pgTable("ticket_comments", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => supportTickets.id),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  isInternal: boolean("is_internal").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ticketAttachments = pgTable("ticket_attachments", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => supportTickets.id),
  commentId: integer("comment_id").references(() => ticketComments.id),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadedById: integer("uploaded_by_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
                      `}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Integração com IA para sugestões</h3>
                  <p className="text-gray-700 mb-4">
                    O Endurancy implementa um serviço de sugestões contextuais baseado em IA:
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm language-typescript">
                      {`
// Tipos de sugestões
export type SuggestionType = 
  | 'status_change' 
  | 'priority_change' 
  | 'assignment' 
  | 'response'
  | 'related_tickets'
  | 'documentation';

// Interface de sugestões
export interface AISuggestion {
  type: SuggestionType;
  description: string;
  confidence: number; // 0 a 1
  actions?: {
    label: string;
    value: string;
    action: string;
  }[];
  relatedTickets?: number[];
  responseTemplate?: string;
}

// Geração de sugestões para um ticket
export async function generateTicketSuggestions(ticketId: number): Promise<AISuggestion[]> {
  // Buscar ticket e dados relacionados
  const ticket = await getTicketById(ticketId);
  if (!ticket) return [];
  
  const comments = await getTicketComments(ticketId);
  
  // Combinar diferentes tipos de sugestões
  const suggestions: AISuggestion[] = [
    ...generateStatusSuggestions(ticket, comments),
    ...generatePrioritySuggestions(ticket, comments),
    ...generateAssignmentSuggestions(ticket),
    ...generateResponseSuggestions(ticket, comments),
  ];
  
  // Encontrar tickets relacionados
  const relatedTickets = await findRelatedTickets(ticket);
  
  if (relatedTickets.length > 0) {
    suggestions.push({
      type: 'related_tickets',
      description: 'Tickets possivelmente relacionados',
      confidence: 0.8,
      relatedTickets: relatedTickets.map(t => t.id)
    });
  }
  
  return suggestions;
}

// Endpoint para obter sugestões
app.get('/api/tickets/:id/suggestions', authenticate, async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const suggestions = await generateTicketSuggestions(ticketId);
    
    res.json({
      ticketId,
      suggestions
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erro ao gerar sugestões",
      error: error.message 
    });
  }
});
                      `}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Dashboard de suporte com métricas</h3>
                  <p className="text-gray-700">
                    O Endurancy oferece um dashboard completo de suporte com KPIs e métricas:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Tempo médio de resposta: 4.2 horas (meta: &lt; 4 horas)</li>
                    <li>Tempo médio de resolução: 36.5 horas (meta: &lt; 48 horas)</li>
                    <li>Distribuição de tickets por categoria e prioridade</li>
                    <li>Taxa de resolução de tickets no primeiro contato</li>
                    <li>Histórico de atividades e tendências</li>
                    <li>Desempenho de agentes de suporte</li>
                  </ul>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Sistema de Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <section>
                  <h3 className="text-lg font-medium mb-2">Visão Geral do Sistema de Notificações</h3>
                  <p className="text-gray-700 mb-4">
                    O Endurancy implementa um sistema completo de notificações em tempo real para
                    alertar usuários sobre eventos importantes, atualizações em tickets, limites de uso
                    e outras informações relevantes.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Tipos de notificações</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>info:</strong> Informações gerais e avisos</li>
                    <li><strong>warning:</strong> Alertas e avisos de atenção</li>
                    <li><strong>success:</strong> Confirmações e sucessos</li>
                    <li><strong>error:</strong> Erros e falhas</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Eventos que geram notificações</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Criação de novo ticket de suporte</li>
                    <li>Atualização de status/prioridade em tickets</li>
                    <li>Novos comentários em tickets</li>
                    <li>Aproximação de limites de uso (cadastros, armazenamento)</li>
                    <li>Processamentos de pagamentos (sucesso/falha)</li>
                    <li>Novos módulos disponíveis</li>
                    <li>Atualizações e manutenções no sistema</li>
                    <li>Expiração iminente de assinatura</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Implementação no banco de dados</h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm language-typescript">
                      {`
export const notificationTypeEnum = pgEnum('notification_type', ['info', 'warning', 'success', 'error']);

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: notificationTypeEnum("type").notNull().default('info'),
  userId: integer("user_id").notNull(),
  organizationId: integer("organization_id"),
  isRead: boolean("is_read").notNull().default(false),
  relatedEntityType: text("related_entity_type"),
  relatedEntityId: integer("related_entity_id"),
  ticketId: integer("ticket_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
                      `}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Serviço de notificações</h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm language-typescript">
                      {`
// Criação de notificação
export async function createNotification({
  title,
  message,
  type = 'info',
  userId,
  organizationId,
  relatedEntityType,
  relatedEntityId,
  ticketId
}: CreateNotificationParams): Promise<Notification> {
  try {
    const [notification] = await db
      .insert(notifications)
      .values({
        title,
        message,
        type,
        userId,
        organizationId,
        relatedEntityType,
        relatedEntityId,
        ticketId,
        isRead: false
      })
      .returning();
    
    return notification;
  } catch (error) {
    console.error("Erro ao criar notificação:", error);
    throw new Error("Falha ao criar notificação");
  }
}

// Buscar notificações de um usuário
export async function getUserNotifications(userId: number): Promise<Notification[]> {
  try {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    return [];
  }
}

// Marcar notificação como lida
export async function markNotificationAsRead(id: number): Promise<boolean> {
  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
    return true;
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error);
    return false;
  }
}

// Notificar usuário sobre novo ticket
export async function notifyNewTicket(ticket: SupportTicket, adminIds: number[]): Promise<void> {
  // Notificar cada administrador
  for (const adminId of adminIds) {
    await createNotification({
      title: "Novo ticket crítico",
      message: \`Ticket #\${ticket.id}: \${ticket.title}\`,
      type: ticket.priority === 'critica' ? 'error' : 'info',
      userId: adminId,
      ticketId: ticket.id,
      relatedEntityType: 'ticket',
      relatedEntityId: ticket.id
    });
  }
  
  // Notificar o criador
  await createNotification({
    title: "Ticket criado com sucesso",
    message: \`Seu ticket #\${ticket.id} foi criado e será analisado em breve\`,
    type: 'success',
    userId: ticket.createdById,
    ticketId: ticket.id,
    relatedEntityType: 'ticket',
    relatedEntityId: ticket.id
  });
}
                      `}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Componente de notificações no Frontend</h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm language-javascript">
                      {`
// Hook de notificações
export function useNotifications() {
  const { data, isLoading, error, refetch } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });
  
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", \`/api/notifications/\${id}/read\`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });
  
  const unreadCount = useMemo(() => {
    if (!data) return 0;
    return data.filter(n => !n.isRead).length;
  }, [data]);
  
  return {
    notifications: data || [],
    isLoading,
    error,
    unreadCount,
    refetch,
    markAsRead: markAsReadMutation.mutate
  };
}

// Componente de notificações
export function NotificationsPopover() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4 border-b">
          <h3 className="font-medium">Notificações</h3>
        </div>
        <div className="max-h-96 overflow-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Nenhuma notificação
            </div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={\`p-4 border-b \${!notification.isRead ? 'bg-gray-50' : ''}\`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-2">
                  {notification.type === 'error' && <AlertCircle className="text-red-500 h-5 w-5 mt-0.5" />}
                  {notification.type === 'warning' && <AlertTriangle className="text-amber-500 h-5 w-5 mt-0.5" />}
                  {notification.type === 'success' && <CheckCircle className="text-green-500 h-5 w-5 mt-0.5" />}
                  {notification.type === 'info' && <Info className="text-blue-500 h-5 w-5 mt-0.5" />}
                  <div>
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <p className="text-xs text-gray-600">{notification.message}</p>
                    <span className="text-xs text-gray-400 mt-1 block">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
                      `}
                    </pre>
                  </div>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="multitenancy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Multi-tenancy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <section>
                  <h3 className="text-lg font-medium mb-2">Visão Geral de Multi-tenancy</h3>
                  <p className="text-gray-700 mb-4">
                    O Endurancy implementa um sistema multi-tenant onde múltiplas organizações compartilham
                    a mesma instância do aplicativo, mas têm seus dados isolados. Cada organização pode ter
                    múltiplos usuários, módulos e configurações específicas.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Abordagem de Multi-tenancy</h3>
                  <p className="text-gray-700 mb-4">
                    O Endurancy implementa multi-tenancy via discriminador no banco de dados. Cada tabela
                    de dados específicos de organização contém uma coluna <code>organization_id</code> que
                    estabelece a qual organização aquele dado pertence.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Implementação no banco de dados</h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm language-typescript">
                      {`
// Organizations como entidade central
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  // Outros campos...
});

// Usuários associados a organizações
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  // Outros campos...
  organizationId: integer("organization_id").references(() => organizations.id),
});

// Dados do tenant
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  // Outros campos...
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
});

// Mais exemplos de tabelas com discriminador de tenant
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  // Outros campos...
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
});

export const plants = pgTable("plants", {
  id: serial("id").primaryKey(),
  // Outros campos...
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
});
                      `}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Autorização baseada em tenants</h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm language-javascript">
                      {`
// Middleware para garantir que usuário só acesse dados de sua própria organização
const ensureTenantAccess = (req, res, next) => {
  const requestedOrgId = parseInt(req.params.organizationId);
  
  // Admins podem acessar qualquer tenant
  if (req.session.user.role === 'admin') {
    return next();
  }
  
  // Usuários normais só podem acessar seu próprio tenant
  if (req.session.user.organizationId !== requestedOrgId) {
    return res.status(403).json({ message: "Acesso não autorizado a esta organização" });
  }
  
  next();
};

// Uso em endpoints
app.get('/api/organizations/:organizationId/patients', authenticate, ensureTenantAccess, async (req, res) => {
  const organizationId = parseInt(req.params.organizationId);
  
  const patients = await db
    .select()
    .from(patients)
    .where(eq(patients.organizationId, organizationId));
    
  res.json(patients);
});

// Filtro automático de tenant nos queries
function addTenantFilter(query, user, tableRef) {
  // Admin pode ver tudo
  if (user.role === 'admin') {
    return query;
  }
  
  // Outros usuários só veem dados de sua organização
  return query.where(eq(tableRef.organizationId, user.organizationId));
}

// Exemplo de uso do filtro automático
app.get('/api/appointments', authenticate, async (req, res) => {
  let query = db.select().from(appointments);
  
  // Aplicar filtro de tenant automaticamente
  query = addTenantFilter(query, req.session.user, appointments);
  
  const results = await query;
  res.json(results);
});
                      `}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Subdomínios e URLs para tenants</h3>
                  <p className="text-gray-700 mb-4">
                    Cada organização pode ter um código único (orgCode) que pode ser usado para acessar a plataforma:
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm">
                      {`
// URL base
https://endurancy.com/login

// URL com código de organização para login direto
https://endurancy.com/login/{orgCode}

// Exemplo
https://endurancy.com/login/org123
                      `}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Boas práticas para multi-tenancy</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Sempre incluir o filtro de tenant em todas as consultas ao banco</li>
                    <li>Implementar autorização em nível de tenant e não apenas em nível de usuário</li>
                    <li>Evitar configuração compartilhada que afete todos os tenants</li>
                    <li>Validar propriedade de recursos antes de permitir operações</li>
                    <li>Implementar limites de uso por tenant conforme o plano</li>
                    <li>Garantir que notificações sejam específicas para cada tenant</li>
                    <li>Monitorar uso de recursos por tenant para identificar gargalos</li>
                  </ul>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="apis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Webhook className="h-5 w-5 mr-2" />
                  APIs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <section>
                  <h3 className="text-lg font-medium mb-2">Visão Geral das APIs</h3>
                  <p className="text-gray-700 mb-4">
                    O Endurancy disponibiliza uma API RESTful completa para integração com sistemas externos
                    e desenvolvimento de extensões. A API é utilizada tanto pelo frontend quanto pode ser 
                    consumida por aplicações de terceiros com a devida autenticação.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Autenticação da API</h3>
                  <p className="text-gray-700 mb-4">
                    A API utiliza autenticação por sessão e cookies para o frontend, e pode ser estendida
                    para suportar autenticação via tokens JWT para integrações de terceiros.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Endpoints principais</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-4 py-2 text-left">Endpoint</th>
                          <th className="border border-gray-200 px-4 py-2 text-left">Método</th>
                          <th className="border border-gray-200 px-4 py-2 text-left">Descrição</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-200 px-4 py-2 font-mono text-sm">/api/auth/me</td>
                          <td className="border border-gray-200 px-4 py-2">GET</td>
                          <td className="border border-gray-200 px-4 py-2">Obter usuário autenticado</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-200 px-4 py-2 font-mono text-sm">/api/login</td>
                          <td className="border border-gray-200 px-4 py-2">POST</td>
                          <td className="border border-gray-200 px-4 py-2">Autenticar usuário</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-200 px-4 py-2 font-mono text-sm">/api/logout</td>
                          <td className="border border-gray-200 px-4 py-2">POST</td>
                          <td className="border border-gray-200 px-4 py-2">Encerrar sessão</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-200 px-4 py-2 font-mono text-sm">/api/organizations</td>
                          <td className="border border-gray-200 px-4 py-2">GET</td>
                          <td className="border border-gray-200 px-4 py-2">Listar organizações</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-200 px-4 py-2 font-mono text-sm">/api/organizations/:id</td>
                          <td className="border border-gray-200 px-4 py-2">GET</td>
                          <td className="border border-gray-200 px-4 py-2">Obter detalhes de organização</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-200 px-4 py-2 font-mono text-sm">/api/tickets</td>
                          <td className="border border-gray-200 px-4 py-2">GET</td>
                          <td className="border border-gray-200 px-4 py-2">Listar tickets</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-200 px-4 py-2 font-mono text-sm">/api/tickets/:id</td>
                          <td className="border border-gray-200 px-4 py-2">GET</td>
                          <td className="border border-gray-200 px-4 py-2">Obter detalhes de ticket</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-200 px-4 py-2 font-mono text-sm">/api/tickets/:id/comments</td>
                          <td className="border border-gray-200 px-4 py-2">POST</td>
                          <td className="border border-gray-200 px-4 py-2">Adicionar comentário</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-200 px-4 py-2 font-mono text-sm">/api/tickets/:id/suggestions</td>
                          <td className="border border-gray-200 px-4 py-2">GET</td>
                          <td className="border border-gray-200 px-4 py-2">Obter sugestões de IA</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-200 px-4 py-2 font-mono text-sm">/api/plans</td>
                          <td className="border border-gray-200 px-4 py-2">GET</td>
                          <td className="border border-gray-200 px-4 py-2">Listar planos</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-200 px-4 py-2 font-mono text-sm">/api/modules</td>
                          <td className="border border-gray-200 px-4 py-2">GET</td>
                          <td className="border border-gray-200 px-4 py-2">Listar módulos</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-200 px-4 py-2 font-mono text-sm">/api/checkout</td>
                          <td className="border border-gray-200 px-4 py-2">POST</td>
                          <td className="border border-gray-200 px-4 py-2">Criar checkout</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-200 px-4 py-2 font-mono text-sm">/api/notifications</td>
                          <td className="border border-gray-200 px-4 py-2">GET</td>
                          <td className="border border-gray-200 px-4 py-2">Listar notificações</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-200 px-4 py-2 font-mono text-sm">/api/support/stats</td>
                          <td className="border border-gray-200 px-4 py-2">GET</td>
                          <td className="border border-gray-200 px-4 py-2">Estatísticas de suporte</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Formato de resposta</h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm">
                      {`
// Resposta de sucesso
HTTP/1.1 200 OK
Content-Type: application/json

{
  // Dados da resposta diretamente
}

// Resposta de erro
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "message": "Descrição do erro em linguagem amigável",
  "error": "Detalhes técnicos (apenas em desenvolvimento)"
}

// Resposta de paginação
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": [...], // Array com os itens
  "pagination": {
    "total": 150,      // Total de itens
    "page": 2,         // Página atual
    "pageSize": 20,    // Itens por página
    "totalPages": 8    // Total de páginas
  }
}
                      `}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Consumindo a API no frontend</h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm language-javascript">
                      {`
// Configuração do cliente React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      queryFn: getQueryFn(),
    },
  },
});

// Função padrão para consultas
export function getQueryFn(options: QueryFnOptions = {}) {
  return async ({ queryKey }: { queryKey: string | string[] }) => {
    const path = Array.isArray(queryKey) ? queryKey[0] : queryKey;
    
    try {
      const response = await fetch(path);
      
      if (response.status === 401 && options.on401 === "returnNull") {
        return null;
      }
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Ocorreu um erro");
      }
      
      return response.json();
    } catch (error) {
      throw error;
    }
  };
}

// Função para requisições POST, PATCH, DELETE
export async function apiRequest(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  url: string,
  data?: object
) {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Ocorreu um erro na requisição");
  }
  
  return response;
}

// Uso em componentes
function MyComponent() {
  // Query para obter dados
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/resource'],
  });
  
  // Mutation para enviar dados
  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/resource", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resource'] });
    },
  });
  
  // ...
}
                      `}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Boas práticas para APIs</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Validar todos os inputs com schemas Zod</li>
                    <li>Implementar tratamento de erros consistente</li>
                    <li>Usar códigos HTTP apropriados para cada situação</li>
                    <li>Documentar todas as rotas e parâmetros</li>
                    <li>Utilizar paginação para listas longas</li>
                    <li>Implementar rate limiting para prevenir abusos</li>
                    <li>Versionar a API quando houver mudanças incompatíveis</li>
                    <li>Seguir princípios RESTful para nomes de recursos e verbos HTTP</li>
                  </ul>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BrainCircuit className="h-5 w-5 mr-2" />
                  Integração com IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <section>
                  <h3 className="text-lg font-medium mb-2">Visão Geral da Integração com IA</h3>
                  <p className="text-gray-700 mb-4">
                    O Endurancy implementa funcionalidades de inteligência artificial para aprimorar
                    a experiência do usuário e aumentar a eficiência do sistema, com destaque para
                    o sistema de sugestões contextuais para tickets de suporte.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Sugestões de IA para tickets</h3>
                  <p className="text-gray-700 mb-4">
                    O serviço de sugestões analisa o contexto de um ticket de suporte e fornece
                    recomendações inteligentes para agilizar o atendimento:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Sugestões de mudança de status:</strong> Recomenda alterações de status com base no contexto</li>
                    <li><strong>Sugestões de prioridade:</strong> Analisa a descrição e sugere o nível de prioridade adequado</li>
                    <li><strong>Sugestões de atribuição:</strong> Recomenda o agente mais adequado para resolver o problema</li>
                    <li><strong>Templates de resposta:</strong> Fornece modelos de resposta baseados em casos similares</li>
                    <li><strong>Tickets relacionados:</strong> Identifica tickets similares que podem ajudar na resolução</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Implementação do serviço de IA</h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm language-typescript">
                      {`
/**
 * Serviço para geração de sugestões de ações com IA contextual para tickets de suporte
 */

export type SuggestionType = 
  | 'status_change' 
  | 'priority_change' 
  | 'assignment' 
  | 'response'
  | 'related_tickets'
  | 'documentation';

export interface AISuggestion {
  type: SuggestionType;
  description: string;
  confidence: number; // 0 a 1
  actions?: {
    label: string;
    value: string;
    action: string;
  }[];
  relatedTickets?: number[];
  responseTemplate?: string;
}

/**
 * Analisa um ticket e gera sugestões de ações baseadas no contexto
 */
export async function generateTicketSuggestions(ticketId: number): Promise<AISuggestion[]> {
  // Buscar dados completos do ticket
  const ticket = await getTicketById(ticketId);
  if (!ticket) return [];
  
  const comments = await getTicketComments(ticketId);
  
  // Gerar sugestões de diferentes tipos
  let suggestions: AISuggestion[] = [];
  
  // Adicionar sugestões de cada tipo
  suggestions = [
    ...generateStatusSuggestions(ticket, comments),
    ...generatePrioritySuggestions(ticket, comments),
    ...generateAssignmentSuggestions(ticket),
    ...generateResponseSuggestions(ticket, comments)
  ];
  
  // Encontrar tickets relacionados se aplicável
  const relatedTickets = await findRelatedTickets(ticket);
  if (relatedTickets.length > 0) {
    suggestions.push({
      type: 'related_tickets',
      description: 'Tickets possivelmente relacionados',
      confidence: 0.85,
      relatedTickets: relatedTickets.map(t => t.id)
    });
  }
  
  return suggestions;
}

/**
 * Gera sugestões de mudança de status com base no contexto do ticket
 */
function generateStatusSuggestions(ticket: SupportTicket, comments: TicketComment[]): AISuggestion[] {
  const suggestions: AISuggestion[] = [];
  
  // Análise baseada em regras para demonstração
  // (em produção, poderia usar modelos de ML/NLP)
  
  // Ticket novo que precisa ser analisado
  if (ticket.status === 'novo' && ticket.priority !== 'baixa') {
    suggestions.push({
      type: 'status_change',
      description: 'Este ticket tem prioridade significativa e deve ser analisado',
      confidence: 0.9,
      actions: [
        {
          label: 'Iniciar análise',
          value: 'em_analise',
          action: 'status_update'
        }
      ]
    });
  }
  
  // Ticket aguardando resposta há mais de 2 dias
  if (ticket.status === 'aguardando_resposta') {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    if (new Date(ticket.updatedAt) < twoDaysAgo) {
      suggestions.push({
        type: 'status_change',
        description: 'Ticket aguardando resposta há mais de 2 dias',
        confidence: 0.85,
        actions: [
          {
            label: 'Enviar lembrete',
            value: 'send_reminder',
            action: 'custom_action'
          },
          {
            label: 'Retomar análise',
            value: 'em_analise',
            action: 'status_update'
          }
        ]
      });
    }
  }
  
  // Implementação semelhante para outras regras...
  
  return suggestions;
}

/**
 * Endpoint para obter sugestões
 */
app.get('/api/tickets/:id/suggestions', authenticate, async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const suggestions = await generateTicketSuggestions(ticketId);
    
    res.json({
      ticketId,
      suggestions
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erro ao gerar sugestões",
      error: error.message 
    });
  }
});
                      `}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Componente de IA no Frontend</h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm language-javascript">
                      {`
// Componente de sugestões de IA
export function TicketAiSuggestions({ 
  ticketId,
  onAddComment,
  onUpdateStatus,
  onUpdatePriority
}: {
  ticketId: number,
  onAddComment: (comment: string) => void,
  onUpdateStatus: (status: string) => void,
  onUpdatePriority: (priority: string) => void
}) {
  // Buscar sugestões de IA
  const { data, isLoading, error } = useQuery({
    queryKey: [\`/api/tickets/\${ticketId}/suggestions\`],
    enabled: !!ticketId,
  });
  
  const suggestions = data?.suggestions || [];
  
  // Renderização condicional com base no estado
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-md flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <span>Sugestões de IA</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error || !data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-md flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <span>Sugestões de IA</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <p>Não foi possível carregar as sugestões.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (suggestions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-md flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <span>Sugestões de IA</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <p>Nenhuma sugestão disponível para este ticket no momento.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Renderizar as sugestões
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-md flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <span>Sugestões de IA</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="bg-muted p-3 rounded-md">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium">{suggestion.description}</div>
                <Badge variant="outline" className="text-xs">
                  {Math.round(suggestion.confidence * 100)}% confiança
                </Badge>
              </div>
              
              {suggestion.type === 'response' && suggestion.responseTemplate && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-1">Template de resposta:</p>
                  <div className="bg-background p-2 rounded-md text-sm border border-input">
                    {suggestion.responseTemplate}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => onAddComment(suggestion.responseTemplate!)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Usar template
                  </Button>
                </div>
              )}
              
              {suggestion.actions && suggestion.actions.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {suggestion.actions.map((action, actionIndex) => (
                    <Button
                      key={actionIndex}
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        if (action.action === 'status_update') {
                          onUpdateStatus(action.value);
                        } else if (action.action === 'priority_update') {
                          onUpdatePriority(action.value);
                        }
                        // Outras ações...
                      }}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
                      `}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Outras aplicações de IA no sistema</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Análise financeira:</strong> Insights e previsões para dados financeiros</li>
                    <li><strong>Detecção de anomalias:</strong> Identificação de padrões incomuns e possíveis fraudes</li>
                    <li><strong>Recomendação de módulos:</strong> Sugestões personalizadas de módulos para cada organização</li>
                    <li><strong>Previsão de limite de uso:</strong> Alertas antecipados de aproximação de limites do plano</li>
                    <li><strong>Classificação automatizada:</strong> Categorização de tickets e documentos</li>
                  </ul>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deployment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ListChecks className="h-5 w-5 mr-2" />
                  Deployment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <section>
                  <h3 className="text-lg font-medium mb-2">Ambiente de produção</h3>
                  <p className="text-gray-700 mb-4">
                    O Endurancy é implantado utilizando o Replit, que fornece a infraestrutura para
                    execução do servidor Node.js, frontend React e banco de dados PostgreSQL.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Processo de deployment</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Garantir que todos os testes estão passando</li>
                    <li>Aplicar migrações de banco de dados (npm run db:push)</li>
                    <li>Construir o frontend para produção (npm run build)</li>
                    <li>Configurar variáveis de ambiente necessárias</li>
                    <li>Iniciar o servidor em modo de produção</li>
                  </ol>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Variáveis de ambiente necessárias</h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm">
                      {`
# Conexão com banco de dados
DATABASE_URL=postgresql://username:password@host:port/database

# Configuração do Stripe
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Configuração de e-mail
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=noreply@example.com
EMAIL_PASSWORD=your_password

# Segurança
SESSION_SECRET=your_secret_key
                      `}
                    </pre>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Monitoramento e logging</h3>
                  <p className="text-gray-700 mb-4">
                    O Endurancy implementa logs detalhados para monitoramento de:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Uso de APIs e endpoints</li>
                    <li>Erros e exceções</li>
                    <li>Performance e tempos de resposta</li>
                    <li>Operações em banco de dados</li>
                    <li>Autenticação e autorização</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Estratégia de backup</h3>
                  <p className="text-gray-700 mb-4">
                    O sistema realiza backups regulares do banco de dados, implementando:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Backups diários completos</li>
                    <li>Backups incrementais a cada 6 horas</li>
                    <li>Retenção de 30 dias de histórico</li>
                    <li>Exportação para armazenamento externo</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Boas práticas de segurança</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Manter todas as dependências atualizadas</li>
                    <li>Utilizar HTTPS para todas as comunicações</li>
                    <li>Implementar proteção contra CSRF</li>
                    <li>Sanitizar todas as entradas de usuário</li>
                    <li>Limitar taxas de requisição para prevenir abusos</li>
                    <li>Armazenar senhas com hashing seguro</li>
                    <li>Implementar autenticação de dois fatores</li>
                    <li>Realizar auditorias de segurança regularmente</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-2">Atualizações e manutenção</h3>
                  <p className="text-gray-700 mb-4">
                    A manutenção do sistema segue estas práticas:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Atualizações de segurança aplicadas imediatamente</li>
                    <li>Novas funcionalidades liberadas em janelas de manutenção programadas</li>
                    <li>Comunicação prévia aos usuários sobre atualizações significativas</li>
                    <li>Testes rigorosos em ambiente de staging antes do deploy em produção</li>
                    <li>Capacidade de rollback rápido em caso de problemas</li>
                  </ul>
                </section>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}