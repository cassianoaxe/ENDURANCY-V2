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
import Modules from "@/pages/Modules";
import ModulesTable from "@/pages/ModulesTable";
import OrganizationModules from "@/pages/OrganizationModules";
import Requests from "@/pages/Requests";
import Financial from "@/pages/Financial";
import Administrators from "@/pages/Administrators";
import Tickets from "@/pages/Tickets";
import TicketDetail from "@/pages/TicketDetail";
import CreateTicket from "@/pages/CreateTicket";
import SupportDashboard from "@/pages/SupportDashboard";
import Documentation from "@/pages/Documentation";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import TourGuide from "@/components/features/TourGuide";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Import role-specific dashboards
import AdminDashboard from "@/pages/dashboards/AdminDashboard";
import OrgAdminDashboard from "@/pages/dashboards/OrgAdminDashboard";
import DoctorDashboard from "@/pages/dashboards/DoctorDashboard";
import PatientDashboard from "@/pages/dashboards/PatientDashboard";
import OrganizationDashboard from "@/pages/organization/Dashboard";
import Onboarding from "@/pages/organization/Onboarding";
import DataImport from "@/pages/DataImport";

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

// Simple AppContent component with no external routing library
function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const userRole = user?.role;

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
    if (!isLoading && !isAuthenticated && currentPath !== '/login') {
      window.history.pushState({}, '', '/login');
      setCurrentPath('/login');
    }
  }, [isLoading, isAuthenticated, currentPath]);

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, handle login pages
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
    // Redirect to login for any other path
    window.history.pushState({}, '', '/login');
    setCurrentPath('/login');
    return <Login />;
  }

  // If authenticated and trying to access login, redirect to dashboard
  if (isAuthenticated && currentPath === '/login') {
    window.history.pushState({}, '', '/');
    setCurrentPath('/');
  }

  // Check if the path matches an order view pattern (/orders/123)
  if (currentPath.startsWith('/orders/')) {
    return (
      <Layout>
        <OrderView />
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
  if (currentPath === '/dashboard' || currentPath === '/') {
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
      return <OrganizationDashboard />;
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

  // Admin-specific routes require admin privileges
  // Lista de rotas administrativas
  const adminRoutes = [
    '/analytics', '/activity-log', '/backups', '/emergencies', 
    '/plans', '/modules', '/modules-table', '/organization-modules', '/organizations', '/organization-registration', 
    '/requests', '/financial', '/email-templates', '/routes-list',
    '/administrators', '/settings', '/support-dashboard', '/documentation', '/data-import',
    '/integracoes', '/integracoes/comunicacao/whatsapp', 
    '/integracoes/pagamentos/asaas', '/integracoes/pagamentos/zoop',
    '/integracoes/logistica/melhor-envio', '/integracoes/logistica/azul-cargo', '/integracoes/logistica/correios'
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
      case '/modules': Component = Modules; break;
      case '/modules-table': Component = ModulesTable; break;
      case '/organization-modules': Component = OrganizationModules; break;
      case '/organizations': Component = Organizations; break;
      case '/organization-registration': Component = OrganizationRegistration; break;
      case '/requests': Component = Requests; break;
      case '/email-templates': Component = EmailTemplates; break;
      case '/routes-list': Component = RoutesList; break;
      case '/administrators': Component = Administrators; break;
      case '/settings': Component = Settings; break;
      case '/support-dashboard': Component = SupportDashboard; break;
      case '/documentation': Component = Documentation; break;
      case '/data-import': Component = DataImport; break;
      
      // Rotas de integracoes
      case '/integracoes': Component = Integracoes; break;
      case '/integracoes/comunicacao/whatsapp': Component = WhatsAppIntegration; break;
      case '/integracoes/pagamentos/asaas': Component = AsaasIntegration; break;
      case '/integracoes/pagamentos/zoop': Component = ZoopIntegration; break;
      case '/integracoes/logistica/melhor-envio': Component = MelhorEnvioIntegration; break;
      case '/integracoes/logistica/azul-cargo': Component = AzulCargoIntegration; break;
      case '/integracoes/logistica/correios': Component = CorreiosIntegration; break;
      
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
        <Component />
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