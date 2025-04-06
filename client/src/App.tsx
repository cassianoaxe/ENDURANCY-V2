import React, { useState, useEffect, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import Organizations from "@/pages/Organizations";
import OrganizationRegistration from "@/pages/OrganizationRegistration";
import OrganizationConfirmation from "@/pages/OrganizationConfirmation";
import EmailTemplates from "@/pages/EmailTemplates";
import RoutesList from "@/pages/RoutesList";
import Settings from "@/pages/Settings";
import OrderView from "@/pages/OrderView";
import Login from "@/pages/Login";
import ActivityLog from "@/pages/ActivityLog";
import Backups from "@/pages/Backups";
import Emergencies from "@/pages/Emergencies";
import Plans from "@/pages/Plans";
import PlanSettings from "@/pages/plans/settings";
import CreatePlan from "@/pages/plans/create";
import EditPlan from "@/pages/plans/edit";
import Modules from "@/pages/Modules";
import Modulos from "@/pages/Modulos";
import ModulesTable from "@/pages/ModulesTable";
import OrganizationModules from "@/pages/OrganizationModules";
import OrganizationDetail from "@/pages/Organization";
import Vendas from "@/pages/Vendas";
import Cadastro from "@/pages/Cadastro";
import Financial from "@/pages/Financial";
import Administrators from "@/pages/Administrators";
import Tickets from "@/pages/Tickets";
import TicketDetail from "@/pages/TicketDetail";
import CreateTicket from "@/pages/CreateTicket";
import SupportDashboard from "@/pages/SupportDashboard";
import Documentation from "@/pages/Documentation";
import UserProfile from "@/pages/UserProfile";
import UserGroups from "@/pages/UserGroups";
import UserInvitations from "@/pages/UserInvitations";
import AcceptInvitation from "@/pages/AcceptInvitation";
import ModuleSubscriptionSales from "@/pages/ModuleSubscriptionSales";
import Payment from "@/pages/Payment";
import PaymentTest from "@/pages/PaymentTest";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TourGuide from "@/components/features/TourGuide";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Import role-specific dashboards
import AdminDashboard from "@/pages/dashboards/AdminDashboard";
import OrgAdminDashboard from "@/pages/dashboards/OrgAdminDashboard";
import DoctorDashboard from "@/pages/dashboards/DoctorDashboard";
import PatientDashboard from "@/pages/dashboards/PatientDashboard";
import OrganizationDashboard from "@/pages/organization/Dashboard";
import Onboarding from "@/pages/organization/Onboarding";
import OrganizationProfile from "@/pages/organization/profile";
import MeuPlano from "@/pages/organization/MeuPlano";
import DataImport from "@/pages/DataImport";

// Import module pages
import CultivationModule from "@/pages/organization/cultivation";
import ProductionModule from "@/pages/organization/production";

// Import onboarding course pages
import GettingStarted from "@/pages/organization/onboarding/GettingStarted";
import Cultivation from "@/pages/organization/onboarding/Cultivation";
import Production from "@/pages/organization/onboarding/Production";

// Import integrations
import Integracoes from "@/pages/integracoes";
// Import specific integrations
import WhatsAppIntegration from "@/pages/integracoes/comunicacao/whatsapp";
import AsaasIntegration from "@/pages/integracoes/pagamentos/asaas";
import ZoopIntegration from "@/pages/integracoes/pagamentos/zoop";
import MelhorEnvioIntegration from "@/pages/integracoes/logistica/melhor-envio";
import AzulCargoIntegration from "@/pages/integracoes/logistica/azul-cargo";
import CorreiosIntegration from "@/pages/integracoes/logistica/correios";
import ChatGPTIntegration from "@/pages/integracoes/ia/chatgpt";
import ClaudeIntegration from "@/pages/integracoes/ia/claude";
import KentroIntegration from "@/pages/integracoes/crm/kentro";

// Simple AppContent component with no external routing library
function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const userRole = user?.role;
  
  // Log para depuração
  useEffect(() => {
    console.log("Caminho atual:", currentPath);
    console.log("Usuário autenticado:", isAuthenticated);
    console.log("Papel do usuário:", userRole);
  }, [currentPath, isAuthenticated, userRole]);

  // Listen for path changes
  useEffect(() => {
    const handlePathChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePathChange);
    
    return () => {
      window.removeEventListener('popstate', handlePathChange);
    };
  }, []);

  // Check if user is authenticated - redirect to login if not
  useEffect(() => {
    // Permitir acesso a páginas públicas mesmo quando não autenticado
    const publicPaths = ['/login', '/organization-registration', '/forgot-password', '/accept-invitation', '/payment', '/payment-test'];
    const isPublicPath = publicPaths.some(path => currentPath.startsWith(path));
    
    if (!isLoading && !isAuthenticated && !isPublicPath) {
      window.history.pushState({}, '', '/login');
      setCurrentPath('/login');
    }
  }, [isLoading, isAuthenticated, currentPath]);
  
  // Se o usuário acessar a raiz, redirecionar para login
  useEffect(() => {
    if (currentPath === '/') {
      window.history.pushState({}, '', '/login');
      setCurrentPath('/login');
    }
  }, [currentPath]);

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Verificar se é uma rota de convite antes de verificar autenticação
  const acceptInvitationMatch = currentPath.match(/^\/accept-invitation\/([^\/]+)$/);
  if (acceptInvitationMatch) {
    const token = acceptInvitationMatch[1];
    // Esta rota não precisa de autenticação e deve estar acessível para usuários não logados
    return <AcceptInvitation />;
  }
  
  // Verificar se é uma rota de pagamento com token
  const paymentMatch = currentPath.match(/^\/payment\/([^\/]+)$/);
  if (paymentMatch) {
    const token = paymentMatch[1];
    // Esta rota não precisa de autenticação e deve estar acessível para usuários não logados
    return <Payment />;
  }

  // If not authenticated, handle login pages and public pages
  if (!isAuthenticated) {
    // Check if this is an organization-specific login URL (e.g., /login/ORG-123-ABC)
    const orgLoginMatch = currentPath.match(/^\/login\/([^\/]+)$/);
    if (orgLoginMatch) {
      // The orgCode will be extracted in the Login component
      return <Login />;
    }
    
    // Regular login
    if (currentPath === '/login') {
      return <Login />;
    }
    
    // Página de teste de pagamento (públicamente acessível para testes)
    if (currentPath === '/payment-test') {
      return <PaymentTest />;
    }
    
    // Organization registration page (público)
    if (currentPath === '/organization-registration') {
      return <OrganizationRegistration />;
    }
    
    // Página esqueceu a senha (público)
    if (currentPath === '/forgot-password') {
      // Aqui você pode substituir isso pelo seu componente real de recuperação de senha
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Recuperação de Senha</CardTitle>
              <CardDescription>
                Insira seu email para receber instruções de recuperação de senha
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Esta página está em desenvolvimento</p>
              <Button 
                className="w-full mt-4" 
                onClick={() => {
                  window.history.pushState({}, '', '/login');
                  window.dispatchEvent(new Event('popstate'));
                }}
              >
                Voltar para o login
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    // Redirect to login for any other path
    window.history.pushState({}, '', '/login');
    setCurrentPath('/login');
    return <Login />;
  }

  // Se autenticado, mantenha acesso à página de login (não redirecione)
  // Isso permite deslogar e ficar na página de login como solicitado

  // Check if the path matches an order view pattern (/orders/123)
  if (currentPath.startsWith('/orders/')) {
    return (
      <Layout>
        <OrderView />
      </Layout>
    );
  }
  
  // Check if the path matches organization detail patterns (/organizations/123, /organizations/123/edit, /organizations/123/change-plan)
  const orgDetailMatch = currentPath.match(/^\/organizations\/(\d+)$/);
  const orgEditMatch = currentPath.match(/^\/organizations\/(\d+)\/edit$/);
  const orgChangePlanMatch = currentPath.match(/^\/organizations\/(\d+)\/change-plan$/);
  
  if ((orgDetailMatch || orgEditMatch || orgChangePlanMatch) && userRole === 'admin') {
    return (
      <Layout>
        <OrganizationDetail />
      </Layout>
    );
  }
  
  // Tratamento especial para rotas dinâmicas de planos
  // Verificamos isso antes porque é um padrão dinâmico que não se encaixa nas rotas fixas
  
  // Verificar rota de edição de planos (/plans/123/edit)
  const planEditMatch = currentPath.match(/^\/plans\/(\d+)\/edit$/);
  if (planEditMatch && userRole === 'admin') {
    const planId = planEditMatch[1];
    console.log("Editando plano com ID:", planId);
    return (
      <Layout>
        <EditPlan />
      </Layout>
    );
  }
  
  // Verificar rota de detalhes de planos (/plans/123)
  const planDetailMatch = currentPath.match(/^\/plans\/(\d+)$/);
  if (planDetailMatch && userRole === 'admin') {
    const planId = planDetailMatch[1];
    console.log("Visualizando detalhes do plano:", planId);
    // Redirecionar para edição do plano
    window.history.pushState({}, '', `/plans/${planId}/edit`);
    window.dispatchEvent(new Event('popstate'));
    return (
      <Layout>
        <EditPlan />
      </Layout>
    );
  }
  
  // Handle ticket routes
  if (currentPath.startsWith('/tickets')) {
    // Check if the path is for creating a new ticket
    if (currentPath === '/tickets/new') {
      return (
        <Layout>
          <CreateTicket />
        </Layout>
      );
    }
    
    // Check if the path matches a ticket view pattern (/tickets/123)
    const ticketMatch = currentPath.match(/^\/tickets\/(\d+)$/);
    if (ticketMatch) {
      const ticketId = ticketMatch[1];
      console.log("Visualizando ticket com ID:", ticketId);
      return (
        <Layout>
          <TicketDetail params={{ id: ticketId }} />
        </Layout>
      );
    }
    
    // Default tickets list
    if (currentPath === '/tickets') {
      console.log("Acessando lista de tickets");
      return (
        <Layout>
          <Tickets />
        </Layout>
      );
    }
  }
  
  // Role-specific dashboards
  if (currentPath === '/dashboard') {
    let DashboardComponent = Dashboard;
    
    if (userRole === 'admin') {
      DashboardComponent = AdminDashboard;
    } else if (userRole === 'org_admin') {
      DashboardComponent = OrgAdminDashboard;
    } else if (userRole === 'doctor') {
      DashboardComponent = DoctorDashboard;
    } else if (userRole === 'patient') {
      DashboardComponent = PatientDashboard;
    }
    
    return (
      <Layout>
        <DashboardComponent />
      </Layout>
    );
  }
  
  // Handle organization-specific routes
  if (currentPath.startsWith('/organization/')) {
    if (userRole !== 'org_admin') {
      return (
        <Layout>
          <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
            <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
            <p className="text-gray-500 mb-4">
              Você não tem permissão para acessar esta área. Este painel é apenas para administradores de organizações.
            </p>
            <button 
              onClick={() => {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new Event('popstate'));
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Voltar para a página inicial
            </button>
          </div>
        </Layout>
      );
    }
    
    if (currentPath === '/organization/dashboard') {
      console.log("Renderizando o Dashboard da Organização com ícone Leaf");
      // Forçar recarregamento do componente
      const DashboardWithKey = () => <OrganizationDashboard key={Date.now()} />;
      return <DashboardWithKey />;
    }
    
    if (currentPath === '/organization/onboarding') {
      return <Onboarding />;
    }
    
    if (currentPath === '/organization/onboarding/GettingStarted') {
      return <GettingStarted />;
    }
    
    if (currentPath === '/organization/onboarding/Cultivation') {
      return <Cultivation />;
    }
    
    if (currentPath === '/organization/onboarding/Production') {
      return <Production />;
    }
    
    if (currentPath === '/organization/profile') {
      return <OrganizationProfile />;
    }

    if (currentPath === '/organization/meu-plano') {
      return <MeuPlano />;
    }

    // Módulos específicos da organização
    if (currentPath === '/organization/cultivation') {
      return <CultivationModule />;
    }

    if (currentPath === '/organization/production') {
      return <ProductionModule />;
    }
    
    return <NotFound />;
  }
  
  // Handle doctor-specific routes
  if (currentPath.startsWith('/doctor/')) {
    if (userRole !== 'doctor') {
      return (
        <Layout>
          <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
            <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
            <p className="text-gray-500 mb-4">
              Você não tem permissão para acessar esta área.
            </p>
            <button 
              onClick={() => {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new Event('popstate'));
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Voltar para a página inicial
            </button>
          </div>
        </Layout>
      );
    }
    
    if (currentPath === '/doctor/dashboard') {
      return (
        <Layout>
          <DoctorDashboard />
        </Layout>
      );
    }
    
    return <NotFound />;
  }
  
  // Handle patient-specific routes
  if (currentPath.startsWith('/patient/')) {
    if (userRole !== 'patient') {
      return (
        <Layout>
          <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
            <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
            <p className="text-gray-500 mb-4">
              Você não tem permissão para acessar esta área.
            </p>
            <button 
              onClick={() => {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new Event('popstate'));
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Voltar para a página inicial
            </button>
          </div>
        </Layout>
      );
    }
    
    if (currentPath === '/patient/dashboard') {
      return (
        <Layout>
          <PatientDashboard />
        </Layout>
      );
    }
    
    return <NotFound />;
  }
  
  // Organization confirmation page
  if (currentPath === '/organization-confirmation') {
    return <OrganizationConfirmation />;
  }
  
  // User profile page
  if (currentPath === '/profile') {
    return (
      <Layout>
        <UserProfile />
      </Layout>
    );
  }

  // Admin-specific routes require admin privileges
  // Lista de rotas administrativas
  const adminRoutes = [
    '/analytics', '/activity-log', '/backups', '/emergencies', 
    '/plans', '/plans/create', '/plans/settings',
    '/modules', '/modules-table', '/organization-modules', '/organizations', '/organization-registration', 
    '/vendas', '/cadastro', '/financial', '/email-templates', '/routes-list',
    '/administrators', '/settings', '/support-dashboard', '/documentation', '/data-import',
    '/user-groups', '/user-invitations', '/module-subscription-sales',
    '/integracoes', '/integracoes/comunicacao/whatsapp', 
    '/integracoes/pagamentos/asaas', '/integracoes/pagamentos/zoop',
    '/integracoes/logistica/melhor-envio', '/integracoes/logistica/azul-cargo', '/integracoes/logistica/correios',
    '/integracoes/ia/chatgpt', '/integracoes/ia/claude', '/integracoes/crm/kentro'
  ];
  
  // Lista de rotas do módulo financeiro
  const financialRoutes = [
    '/financial', '/financial/cashflow', '/financial/employees',
    '/financial/payroll', '/financial/vacations', '/financial/reports',
    '/financial/payables', '/financial/receivables', '/financial/calendar',
    '/financial/bankreconciliation', '/financial/aianalysis', '/financial/settings',
    '/financial/dre'
  ];
  
  // Verifica se o caminho atual é uma rota administrativa
  if (adminRoutes.includes(currentPath) || currentPath.startsWith('/financial/')) {
    
    if (userRole !== 'admin') {
      return (
        <Layout>
          <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
            <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
            <p className="text-gray-500 mb-4">
              Você não tem permissão para acessar esta área.
            </p>
            <button 
              onClick={() => {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new Event('popstate'));
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Voltar para a página inicial
            </button>
          </div>
        </Layout>
      );
    }
    
    let Component = NotFound;
    switch (currentPath) {
      // Rotas gerais administrativas
      case '/analytics': Component = Analytics; break;
      case '/activity-log': Component = ActivityLog; break;
      case '/backups': Component = Backups; break;
      case '/emergencies': Component = Emergencies; break;
      case '/plans': Component = Plans; break;
      case '/plans/create': Component = CreatePlan; break;
      case '/plans/settings': Component = PlanSettings; break;
      case '/modules': Component = Modules; break;
      case '/modulos': Component = Modulos; break;
      case '/modules-table': Component = ModulesTable; break;
      case '/organization-modules': Component = OrganizationModules; break;
      case '/organizations': Component = Organizations; break;
      case '/organization-registration': Component = OrganizationRegistration; break;
      case '/vendas': Component = Vendas; break;
      case '/cadastro': Component = Cadastro; break;
      case '/email-templates': Component = EmailTemplates; break;
      case '/routes-list': Component = RoutesList; break;
      case '/administrators': Component = Administrators; break;
      case '/settings': Component = Settings; break;
      case '/support-dashboard': Component = SupportDashboard; break;
      case '/documentation': Component = Documentation; break;
      case '/data-import': Component = DataImport; break;
      case '/user-groups': Component = UserGroups; break;
      case '/user-invitations': Component = UserInvitations; break;
      case '/module-subscription-sales': Component = ModuleSubscriptionSales; break;
      case '/payment-test': Component = PaymentTest; break;
      
      // Rotas de integracoes
      case '/integracoes': Component = Integracoes; break;
      case '/integracoes/comunicacao/whatsapp': Component = WhatsAppIntegration; break;
      case '/integracoes/pagamentos/asaas': Component = AsaasIntegration; break;
      case '/integracoes/pagamentos/zoop': Component = ZoopIntegration; break;
      case '/integracoes/logistica/melhor-envio': Component = MelhorEnvioIntegration; break;
      case '/integracoes/logistica/azul-cargo': Component = AzulCargoIntegration; break;
      case '/integracoes/logistica/correios': Component = CorreiosIntegration; break;
      case '/integracoes/ia/chatgpt': Component = ChatGPTIntegration; break;
      case '/integracoes/ia/claude': Component = ClaudeIntegration; break;
      case '/integracoes/crm/kentro': Component = KentroIntegration; break;
      
      // Rotas do módulo financeiro
      case '/financial': Component = Financial; break;
      case '/financial/cashflow': Component = Financial; break;
      case '/financial/employees': Component = Financial; break;
      case '/financial/payroll': Component = Financial; break;
      case '/financial/vacations': Component = Financial; break;
      case '/financial/reports': Component = Financial; break;
      case '/financial/payables': Component = Financial; break;
      case '/financial/receivables': Component = Financial; break;
      case '/financial/calendar': Component = Financial; break;
      case '/financial/bankreconciliation': Component = Financial; break;
      case '/financial/aianalysis': Component = Financial; break;
      case '/financial/settings': Component = Financial; break;
      case '/financial/dre': Component = Financial; break;
    }
    
    return (
      <Layout>
        {Component && (typeof Component === 'function' ? <Component /> : Component)}
      </Layout>
    );
  }
  
  // Default case for unrecognized paths
  return (
    <Layout>
      <NotFound />
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
        <Toaster />
        <TourGuide />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;