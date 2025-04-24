import React, { useState, useEffect, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/Layout";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import DoctorLayout from "@/components/layout/doctor/DoctorLayout";
import PharmacistLayout from "@/components/layout/pharmacist/PharmacistLayout";
import LaboratoryLayout from "@/components/layout/laboratory/LaboratoryLayout";
import HplcLayout from "@/components/layout/laboratory/HplcLayout";
import ResearcherLayout from "@/components/layout/researcher/ResearcherLayout";
import LaboratoryDashboard from "@/pages/laboratory/Dashboard";
import LaboratorySamples from "@/pages/laboratory/Samples";
import SampleDetail from "@/pages/laboratory/SampleDetail";
import TestDetail from "@/pages/laboratory/TestDetail";
import LaboratoryReports from "@/pages/laboratory/Reports";
import LaboratoryTeam from "@/pages/laboratory/Team";
import LaboratorySettings from "@/pages/laboratory/Settings";
import HplcDashboard from "@/pages/laboratory/hplc/Dashboard";
import HplcEquipments from "@/pages/laboratory/hplc/Equipments";
import HplcMaintenances from "@/pages/laboratory/hplc/Maintenances";
import HplcConsumables from "@/pages/laboratory/hplc/Consumables";
import HplcRuns from "@/pages/laboratory/hplc/Runs";
import HplcProcedures from "@/pages/laboratory/hplc/Procedures";
import HplcProcedureDetail from "@/pages/laboratory/hplc/ProcedureDetail";
import HplcValidations from "@/pages/laboratory/hplc/Validations";
import HplcValidationDetail from "@/pages/laboratory/hplc/ValidationDetail";
import HplcTrainings from "@/pages/laboratory/hplc/Trainings";
import LabEquipments from "@/pages/laboratory/equipment/Equipments";
import EquipmentDetail from "@/pages/laboratory/equipment/EquipmentDetail";
import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import Organizations from "@/pages/Organizations";
import OrganizationRegistration from "@/pages/OrganizationRegistration";
import OrganizationConfirmation from "@/pages/OrganizationConfirmation";
import EmailTemplates from "@/pages/EmailTemplates";
import RoutesList from "@/pages/RoutesList";
import AdminSettings from "@/pages/Settings";
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
import VendasAdmin from "@/pages/Vendas";
import Cadastro from "@/pages/Cadastro";
import Financial from "@/pages/Financial";
import Administrators from "@/pages/Administrators";
import ResearcherDashboard from "@/pages/researcher/dashboard";
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
// Importar novas páginas de pagamento por email
import PaymentConfirmar from "@/pages/pagamento/confirmar";
import PaymentConfirmacao from "@/pages/pagamento/confirmacao";

// Importar páginas do módulo Financeiro
import DashboardFinanceiro from "@/pages/organization/financeiro/index";
import ContasAPagar from "@/pages/organization/financeiro/contas-a-pagar";
import ContasAReceber from "@/pages/organization/financeiro/contas-a-receber";
import DRE from "@/pages/organization/financeiro/dre";
import Orcamento from "@/pages/organization/financeiro/orcamento";
import FluxoDeCaixa from "@/pages/organization/financeiro/fluxo-de-caixa";
import CalendarioFinanceiro from "@/pages/organization/financeiro/calendario";
import ConciliacaoBancaria from "@/pages/organization/financeiro/conciliacao";
import AnaliseFinanceira from "@/pages/organization/financeiro/analise";
import ConfiguracaoFinanceira from "@/pages/organization/financeiro/configuracao";
import AnaliseIA from "@/pages/organization/financeiro/analise-ia";
// Importar páginas do portal de laboratório
// Importar páginas do portal do paciente
import PatientLogin from "@/pages/PatientLogin";
// Importar página de cadastro de médicos
import DoctorRegistration from "@/pages/DoctorRegistration";
import PatientDashboardPage from "@/pages/patient/Dashboard";
// Importar página de mapa do site
import Sitemap from "@/pages/Sitemap";
// Importar landing page
import LandingPage from "@/pages/LandingPage";
// Importar páginas de transparência
import TransparenciaPublica from "@/pages/organization/transparencia";
import GerenciarTransparencia from "@/pages/organization/transparencia/gerenciar";
import PatrimonioIndex from "@/pages/organization/patrimonio/index";
import DepreciacaoCalculadora from "@/pages/organization/patrimonio/depreciacao/calculadora";
// Importar página de teste para transparência
import TransparenciaTest from "@/pages/TransparenciaTest";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
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
import DoctorDashboard from "@/pages/doctor/Dashboard";
import PatientDashboard from "@/pages/dashboards/PatientDashboard";
import OrganizationDashboard from "@/pages/organization/Dashboard";
import Onboarding from "@/pages/organization/Onboarding";
import OrganizationProfile from "@/pages/organization/profile";
import MeuPlano from "@/pages/organization/MeuPlano";
import OrganizationSettings from "@/pages/organization/settings";
import Cadastros from "@/pages/organization/Cadastros";
import DataImport from "@/pages/DataImport";

// Import module pages
import CultivationModule from "@/pages/organization/cultivation";
import PlantioPage from "@/pages/organization/cultivation/plantio";
import ColheitaPage from "@/pages/organization/cultivation/colheita";
import AnalysisModule from "@/pages/organization/cultivation/analises";
import ProductionModule from "@/pages/organization/production";
import ProducaoIndustrialDashboard from "@/pages/organization/producao-industrial";
import GarantiaQualidadePage from "@/pages/organization/producao-industrial/garantia-qualidade";
import ControleQualidadePage from "@/pages/organization/producao-industrial/controle-qualidade";
import TrilhaAuditoriaPage from "@/pages/organization/producao-industrial/trilha-auditoria";
import ExtracaoPage from "@/pages/organization/producao-industrial/extracao";
import DiluicaoPage from "@/pages/organization/producao-industrial/diluicao";
import EnvasePage from "@/pages/organization/producao-industrial/envase";
import RotulagemPage from "@/pages/organization/producao-industrial/rotulagem";
import EstoqueDistribuicaoPage from "@/pages/organization/producao-industrial/estoque-distribuicao";
import EstoquePage from "@/pages/organization/producao-industrial/estoque";
import MovimentacoesPage from "@/pages/organization/producao-industrial/movimentacoes";
import OrdensProducaoPage from "@/pages/organization/producao-industrial/ordens-producao";
import DescartesPage from "@/pages/organization/producao-industrial/descartes";
import RastreabilidadePage from "@/pages/organization/producao-industrial/rastreabilidade";
import CatalogoProdutosPage from "@/pages/organization/producao-industrial/catalogo-produtos";
import MedicalPortal from "@/pages/organization/medical-portal";

// Importações do módulo de Gerenciamento de Médicos
import DoctorManagement from "@/pages/organization/doctor-management";
import DoctorManagementDoctors from "@/pages/organization/doctor-management/doctors";
import DoctorManagementAppointments from "@/pages/organization/doctor-management/appointments";
import DoctorManagementStatistics from "@/pages/organization/doctor-management/statistics";
import DoctorManagementDocuments from "@/pages/organization/doctor-management/documents";
import DoctorManagementAffiliation from "@/pages/organization/doctor-management/afiliacao";
import FarmaciaModule from "@/pages/organization/farmacia";

// Importações do módulo Jurídico
import DashboardJuridico from "@/pages/organization/juridico";
import AcoesJudiciais from "@/pages/organization/juridico/acoes-judiciais";
import DocumentosJuridicos from "@/pages/organization/juridico/documentos";
import Compliance from "@/pages/organization/juridico/compliance";

// Importações do módulo RH
import DashboardRH from "@/pages/organization/rh";
import Colaboradores from "@/pages/organization/rh/colaboradores";
import DocumentosRH from "@/pages/organization/rh/documentos";
import EscalasTrabalho from "@/pages/organization/rh/escalas";

// Importações do módulo Tarefas
import DashboardTarefas from "@/pages/organization/tarefas";
import QuadroKanban from "@/pages/organization/tarefas/quadro";
import MinhasTarefas from "@/pages/organization/tarefas/minhas-tarefas";
import ConfiguracoesTarefas from "@/pages/organization/tarefas/configuracoes";

// Importações do módulo Compras e Estoque
import ComprasDashboard from "@/pages/organization/compras";
import SolicitacoesCompra from "@/pages/organization/compras/solicitacoes";
import Fornecedores from "@/pages/organization/compras/fornecedores";
import Estoque from "@/pages/organization/compras/estoque";
import PedidosCompra from "@/pages/organization/compras/pedidos";

// Módulo de Patrimônio
import PatrimonioPage from "@/pages/organization/patrimonio";
import AtivosPage from "@/pages/organization/patrimonio/ativos";
import InstalacoesPage from "@/pages/organization/patrimonio/instalacoes";
import ManutencoesPage from "@/pages/organization/patrimonio/manutencoes";
import DepreciacaoPage from "@/pages/organization/patrimonio/depreciacao";
import CalculadoraDepreciacaoPage from "@/pages/organization/patrimonio/depreciacao/calculadora";

// Import pharmacist pages
import PharmacistDashboard from "@/pages/pharmacist/Dashboard";
import PharmacistPrescricoes from "@/pages/pharmacist/Prescricoes";
import PharmacistEstoque from "@/pages/pharmacist/Estoque";
import PharmacistCaixa from "@/pages/pharmacist/Caixa";
import PharmacistProdutos from "@/pages/pharmacist/Produtos";
import PharmacistAgenda from "@/pages/pharmacist/Agenda";
import PharmacistPacientes from "@/pages/pharmacist/Pacientes";
import PharmacistPedidos from "@/pages/pharmacist/Pedidos";
import PharmacistRelatorios from "@/pages/pharmacist/Relatorios";
import PharmacistFinanceiro from "@/pages/pharmacist/Financeiro";
import PharmacistAjuda from "@/pages/pharmacist/Ajuda";
import PharmacistPerfil from "@/pages/pharmacist/Perfil";
import PharmacistConfiguracoes from "@/pages/pharmacist/Configuracoes";
import Expedicao from "@/pages/organization/Expedicao";
import PreparacaoPedidos from "@/pages/organization/expedicao/pedidos";
import Etiquetas from "@/pages/organization/expedicao/etiquetas";
import CodigosExpedicao from "@/pages/organization/expedicao/codigos";
import DocumentacaoExpedicao from "@/pages/organization/expedicao/documentacao";
import JuncaoPedidos from "@/pages/organization/expedicao/juncao";
import RegistroMalotes from "@/pages/organization/expedicao/malotes";
import AtualizacaoRastreios from "@/pages/organization/expedicao/rastreios";
import EstoqueExpedicao from "@/pages/organization/expedicao/estoque";
import GerenciarPacientes from "@/pages/organization/GerenciarPacientes";
import GerenciarProdutos from "@/pages/organization/GerenciarProdutos";
import VendasOrg from "@/pages/organization/Vendas";
import RelatorioVendas from "@/pages/organization/RelatorioVendas";
import DashboardVendas from "@/pages/organization/DashboardVendas";
import Pedidos from "@/pages/organization/Pedidos";
import Produtos from "@/pages/organization/Produtos";
import Promocoes from "@/pages/organization/Promocoes";
import Rastreamento from "@/pages/organization/Rastreamento";

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

// Import organization integration pages
import IntegracaoContaAzul from "@/pages/organization/integracoes/contaazul";
import IntegracaoNFSe from "@/pages/organization/integracoes/nfse";
import IntegracaoWooCommerce from "@/pages/organization/integracoes/woocommerce";
import IntegracaoCOMPLYCHAT from "@/pages/organization/integracoes/complychat";
import IntegracaoMelhorEnvio from "@/pages/organization/integracoes/melhor-envio";
import IntegracaoWhatsApp from "@/pages/organization/integracoes/whatsapp";
import IntegracaoCorreios from "@/pages/organization/integracoes/correios";
import IntegracaoNFe from "@/pages/organization/integracoes/nfe";
import PipefyIntegracao from "@/pages/organization/integracoes/pipefy";
import IntegracaoShopify from "@/pages/organization/integracoes/shopify";
import RDStationIntegracao from "@/pages/organization/integracoes/rdstation";

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
      const newPath = window.location.pathname;
      console.log(`App.tsx: Mudança detectada de rota de ${currentPath} para ${newPath}`);
      setCurrentPath(newPath);
    };

    // Ouvir evento popstate (navegação pelo histórico)
    window.addEventListener('popstate', handlePathChange);
    
    // Ouvir evento customizado para navegação manual
    const handleCustomNavigation = () => {
      const newPath = window.location.pathname;
      console.log(`App.tsx: Navegação manual detectada para ${newPath}`);
      setCurrentPath(newPath);
    };
    
    window.addEventListener('navigation', handleCustomNavigation);
    
    return () => {
      window.removeEventListener('popstate', handlePathChange);
      window.removeEventListener('navigation', handleCustomNavigation);
    };
  }, [currentPath]);

  // Check if user is authenticated - redirect to login if not
  useEffect(() => {
    // Permitir acesso a páginas públicas mesmo quando não autenticado
    const publicPaths = ['/', '/login', '/organization-registration', '/forgot-password', '/accept-invitation', '/payment', '/payment-test', '/pagamento/confirmar', '/pagamento/confirmacao', '/patient-login', '/patient/login', '/patient/dashboard', '/patient/produtos', '/patient/prescricoes/nova', '/patient/pedidos/rastreamento', '/patient/pagamentos', '/patient/checkout', '/cadastrodemedicos', '/sitemap', '/transparencia-test', '/organization/transparencia'];
    const isPublicPath = publicPaths.some(path => currentPath.startsWith(path));
    
    // Só redirecionamos se não estiver carregando, não estiver autenticado,
    // não for uma página pública e não estiver já na página de login
    if (!isLoading && !isAuthenticated && !isPublicPath && currentPath !== '/login') {
      console.log("Redirecionando usuário não autenticado para o login");
      window.history.pushState({}, '', '/login');
      setCurrentPath('/login');
    }
  }, [isLoading, isAuthenticated, currentPath]);
  
  // Se o usuário acessar a raiz, redirecionar para a página correta baseada no papel do usuário
  useEffect(() => {
    if (currentPath === '/') {
      // Se o usuário já estiver autenticado, redireciona para a dashboard apropriada
      if (isAuthenticated) {
        if (userRole === 'admin') {
          window.history.pushState({}, '', '/dashboard');
          setCurrentPath('/dashboard');
        } else if (userRole === 'org_admin') {
          window.history.pushState({}, '', '/organization/dashboard');
          setCurrentPath('/organization/dashboard');
        } else if (userRole === 'doctor') {
          window.history.pushState({}, '', '/doctor/dashboard');
          setCurrentPath('/doctor/dashboard');
        } else if (userRole === 'patient') {
          window.history.pushState({}, '', '/patient/dashboard');
          setCurrentPath('/patient/dashboard');
        } else if (userRole === 'pharmacist') {
          window.history.pushState({}, '', '/pharmacist/dashboard');
          setCurrentPath('/pharmacist/dashboard');
        } else {
          window.history.pushState({}, '', '/login');
          setCurrentPath('/login');
        }
      } else {
        // Usuário não autenticado na rota raiz, mostrar landing page
        // Não redirecionamos, apenas deixamos a landing page ser renderizada no caso abaixo
      }
    }
  }, [currentPath, isAuthenticated, userRole]);

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
  
  // Verificar se é uma rota de confirmação de pagamento por email
  const paymentConfirmacaoMatch = currentPath.match(/^\/pagamento\/confirmacao\/([^\/]+)$/);
  if (paymentConfirmacaoMatch) {
    const token = paymentConfirmacaoMatch[1];
    // Esta rota não precisa de autenticação
    return <PaymentConfirmacao />;
  }
  
  // Verificar se é uma rota para confirmar pagamento por email
  const paymentConfirmarMatch = currentPath.match(/^\/pagamento\/confirmar\/([^\/]+)$/);
  if (paymentConfirmarMatch) {
    const token = paymentConfirmarMatch[1];
    // Esta rota não precisa de autenticação
    return <PaymentConfirmar />;
  }
  
  // Rota para a página de geração de links de pagamento
  if (currentPath === '/pagamento/confirmar') {
    return <PaymentConfirmar />;
  }

  // If not authenticated, handle login pages and public pages
  if (!isAuthenticated) {
    // Página inicial / landing page
    if (currentPath === '/') {
      return <LandingPage />;
    }
    
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
    
    // Login de paciente - tratar todas as variações de URL
    if (currentPath === '/patient-login') {
      // Extrair organizationId do query parameter
      const url = new URL(window.location.href);
      const orgId = url.searchParams.get('orgId') || url.searchParams.get('organizationId');
      
      if (orgId) {
        console.log("Login de paciente via /patient-login com ID de organização via query param:", orgId);
        return <PatientLogin organizationId={orgId} />;
      }
      
      return <PatientLogin />;
    }
    
    // Login de paciente com ID da organização no path
    const patientOrgLoginMatch = currentPath.match(/^\/patient-login\/([^\/]+)$/);
    if (patientOrgLoginMatch) {
      const orgId = patientOrgLoginMatch[1];
      console.log("Login de paciente com ID de organização no path:", orgId);
      return <PatientLogin organizationId={orgId} />;
    }
    
    // Página de teste de pagamento (públicamente acessível para testes)
    if (currentPath === '/payment-test') {
      return <PaymentTest />;
    }
    
    // Organization registration page (público)
    if (currentPath === '/organization-registration') {
      return <OrganizationRegistration />;
    }
    
    // Cadastro de médicos (com ID da organização)
    const doctorRegMatch = currentPath.match(/^\/cadastrodemedicos\/([^\/]+)$/);
    if (doctorRegMatch) {
      const orgId = doctorRegMatch[1];
      console.log("Cadastro de médico para organização com ID:", orgId);
      return <DoctorRegistration />;
    }
    
    // Cadastro de médicos (com query parameter)
    if (currentPath === '/cadastrodemedicos') {
      return <DoctorRegistration />;
    }
    
    // Página de sitemap (público)
    if (currentPath === '/sitemap') {
      return <Sitemap />;
    }
    
    // Página de teste para transparência (público)
    if (currentPath === '/transparencia-test') {
      return <TransparenciaTest />;
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
    // Permitir acesso público ao portal de transparência mesmo sem login
    const transparenciaMatch = currentPath.match(/^\/organization\/transparencia\/(\d+)(?:\/([a-z]+))?$/);
    if (transparenciaMatch) {
      return <TransparenciaPublica />;
    }
    
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
    
    if (currentPath === '/organization/settings' || currentPath === '/organization/settings/integracoes') {
      return <OrganizationSettings />;
    }
    
    if (currentPath === '/organization/cadastros') {
      return <Cadastros />;
    }

    // Módulos específicos da organização
    if (currentPath === '/organization/cultivation') {
      return <CultivationModule />;
    }
    
    if (currentPath === '/organization/cultivation/plantio') {
      return <PlantioPage />;
    }
    
    if (currentPath === '/organization/cultivation/colheita') {
      return <ColheitaPage />;
    }
    
    if (currentPath === '/organization/cultivation/analises') {
      return <AnalysisModule />;
    }

    if (currentPath === '/organization/production') {
      return <ProductionModule />;
    }
    
    if (currentPath === '/organization/producao-industrial') {
      return <ProducaoIndustrialDashboard />;
    }
    
    if (currentPath === '/organization/producao-industrial/garantia-qualidade') {
      return <GarantiaQualidadePage />;
    }
    
    if (currentPath === '/organization/producao-industrial/controle-qualidade') {
      return <ControleQualidadePage />;
    }
    
    if (currentPath === '/organization/producao-industrial/trilha-auditoria') {
      return <TrilhaAuditoriaPage />;
    }
    
    if (currentPath === '/organization/producao-industrial/extracao') {
      return <ExtracaoPage />;
    }
    
    if (currentPath === '/organization/producao-industrial/diluicao') {
      return <DiluicaoPage />;
    }
    
    if (currentPath === '/organization/producao-industrial/envase') {
      return <EnvasePage />;
    }
    
    if (currentPath === '/organization/producao-industrial/rotulagem') {
      return <RotulagemPage />;
    }
    
    if (currentPath === '/organization/producao-industrial/estoque-distribuicao') {
      return <EstoqueDistribuicaoPage />;
    }
    
    if (currentPath === '/organization/producao-industrial/estoque') {
      return <EstoquePage />;
    }
    
    if (currentPath === '/organization/producao-industrial/movimentacoes') {
      return <MovimentacoesPage />;
    }
    
    if (currentPath === '/organization/producao-industrial/ordens-producao') {
      return <OrdensProducaoPage />;
    }
    
    if (currentPath === '/organization/producao-industrial/descartes') {
      return <DescartesPage />;
    }
    
    if (currentPath === '/organization/producao-industrial/rastreabilidade') {
      return <RastreabilidadePage />;
    }
    
    if (currentPath === '/organization/producao-industrial/catalogo-produtos') {
      return <CatalogoProdutosPage />;
    }

    // Módulo Jurídico
    if (currentPath === '/organization/juridico') {
      return <OrganizationLayout>
        <DashboardJuridico />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/juridico/acoes-judiciais') {
      return <OrganizationLayout>
        <AcoesJudiciais />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/juridico/documentos') {
      return <OrganizationLayout>
        <DocumentosJuridicos />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/juridico/compliance') {
      return <OrganizationLayout>
        <Compliance />
      </OrganizationLayout>;
    }
    
    // Rotas do módulo RH
    if (currentPath === '/organization/rh') {
      return <OrganizationLayout>
        <DashboardRH />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/rh/colaboradores') {
      return <OrganizationLayout>
        <Colaboradores />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/rh/documentos') {
      return <OrganizationLayout>
        <DocumentosRH />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/rh/escalas') {
      return <OrganizationLayout>
        <EscalasTrabalho />
      </OrganizationLayout>;
    }
    
    // Rotas do módulo Financeiro
    if (currentPath === '/organization/financeiro') {
      return <OrganizationLayout>
        <DashboardFinanceiro />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/financeiro/contas-a-pagar') {
      return <OrganizationLayout>
        <ContasAPagar />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/financeiro/contas-a-receber') {
      return <OrganizationLayout>
        <ContasAReceber />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/financeiro/dre') {
      return <OrganizationLayout>
        <DRE />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/financeiro/orcamento') {
      return <OrganizationLayout>
        <Orcamento />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/financeiro/fluxo-de-caixa') {
      return <OrganizationLayout>
        <FluxoDeCaixa />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/financeiro/calendario') {
      return <OrganizationLayout>
        <CalendarioFinanceiro />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/financeiro/conciliacao') {
      return <OrganizationLayout>
        <ConciliacaoBancaria />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/financeiro/analise') {
      return <OrganizationLayout>
        <AnaliseFinanceira />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/financeiro/configuracao') {
      return <OrganizationLayout>
        <ConfiguracaoFinanceira />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/financeiro/analise-ia') {
      return <OrganizationLayout>
        <AnaliseIA />
      </OrganizationLayout>;
    }

    // Rotas do módulo de Patrimônio
    if (currentPath === '/organization/patrimonio') {
      return <OrganizationLayout>
        <PatrimonioIndex />
      </OrganizationLayout>;
    }

    if (currentPath === '/organization/patrimonio/depreciacao/calculadora') {
      return <OrganizationLayout>
        <DepreciacaoCalculadora />
      </OrganizationLayout>;
    }

    // Removido código duplicado de tratamento do portal de transparência
    // (já está implementado no início do bloco de rotas da organização)

    if (currentPath === '/organization/transparencia/gerenciar') {
      return <GerenciarTransparencia />;
    }

    // Rotas do módulo de Compras e Estoque
    if (currentPath === '/organization/compras') {
      return <OrganizationLayout>
        <ComprasDashboard />
      </OrganizationLayout>;
    }

    if (currentPath === '/organization/compras/solicitacoes') {
      return <OrganizationLayout>
        <SolicitacoesCompra />
      </OrganizationLayout>;
    }

    if (currentPath === '/organization/compras/fornecedores') {
      return <OrganizationLayout>
        <Fornecedores />
      </OrganizationLayout>;
    }

    if (currentPath === '/organization/compras/estoque') {
      return <OrganizationLayout>
        <Estoque />
      </OrganizationLayout>;
    }

    if (currentPath === '/organization/compras/pedidos') {
      return <OrganizationLayout>
        <PedidosCompra />
      </OrganizationLayout>;
    }
    
    // Rotas do módulo Tarefas
    if (currentPath === '/organization/tarefas') {
      return <OrganizationLayout>
        <DashboardTarefas />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/tarefas/quadro') {
      return <OrganizationLayout>
        <QuadroKanban />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/tarefas/minhas-tarefas') {
      return <OrganizationLayout>
        <MinhasTarefas />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/tarefas/configuracoes') {
      return <OrganizationLayout>
        <ConfiguracoesTarefas />
      </OrganizationLayout>;
    }

    if (currentPath === '/organization/expedicao') {
      return <OrganizationLayout>
        <Expedicao />
      </OrganizationLayout>;
    }
    
    // Subpáginas de Expedição
    if (currentPath === '/organization/expedicao/pedidos') {
      return <OrganizationLayout>
        <PreparacaoPedidos />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/expedicao/etiquetas') {
      return <OrganizationLayout>
        <Etiquetas />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/expedicao/codigos') {
      return <OrganizationLayout>
        <CodigosExpedicao />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/expedicao/documentacao') {
      return <OrganizationLayout>
        <DocumentacaoExpedicao />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/expedicao/juncao') {
      return <OrganizationLayout>
        <JuncaoPedidos />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/expedicao/malotes') {
      return <OrganizationLayout>
        <RegistroMalotes />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/expedicao/rastreios') {
      return <OrganizationLayout>
        <AtualizacaoRastreios />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/expedicao/estoque') {
      return <OrganizationLayout>
        <EstoqueExpedicao />
      </OrganizationLayout>;
    }

    if (currentPath === '/organization/gerenciar-pacientes') {
      return <GerenciarPacientes />;
    }

    if (currentPath === '/organization/gerenciar-produtos') {
      return <GerenciarProdutos />;
    }

    // Módulo de Vendas - Estrutura antiga (mantida para compatibilidade)
    if (currentPath === '/organization/vendas') {
      return <OrganizationLayout>
        <VendasOrg />
      </OrganizationLayout>;
    }

    if (currentPath === '/organization/relatorio-vendas') {
      return <OrganizationLayout>
        <RelatorioVendas />
      </OrganizationLayout>;
    }
    
    // Redirecionar as antigas URLs para as novas URLs no padrão /organization/vendas/...
    if (currentPath === '/organization/dashboard-vendas') {
      // Redirecionar para a nova URL
      useEffect(() => {
        window.history.pushState({}, '', '/organization/vendas/dashboard');
        window.dispatchEvent(new Event('navigation'));
      }, []);
      
      return <OrganizationLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </OrganizationLayout>;
    }
    
    // Nova estrutura para o módulo de Vendas
    if (currentPath === '/organization/vendas/dashboard' || currentPath === '/organization/vendas') {
      const DashboardVendasNovo = React.lazy(() => import('./pages/organization/vendas/index'));
      return <OrganizationLayout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>}>
          <DashboardVendasNovo />
        </Suspense>
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/vendas/pedidos') {
      const PedidosVendas = React.lazy(() => import('./pages/organization/vendas/pedidos'));
      return <OrganizationLayout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>}>
          <PedidosVendas />
        </Suspense>
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/vendas/produtos') {
      const ProdutosVendas = React.lazy(() => import('./pages/organization/vendas/produtos'));
      return <OrganizationLayout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>}>
          <ProdutosVendas />
        </Suspense>
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/vendas/promocoes') {
      const PromocoesVendas = React.lazy(() => import('./pages/organization/vendas/promocoes'));
      return <OrganizationLayout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>}>
          <PromocoesVendas />
        </Suspense>
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/vendas/rastreamento') {
      const RastreamentoVendas = React.lazy(() => import('./pages/organization/vendas/rastreamento'));
      return <OrganizationLayout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>}>
          <RastreamentoVendas />
        </Suspense>
      </OrganizationLayout>;
    }
    
    // Rotas do módulo ComplyPay
    if (currentPath === '/organization/complypay' || currentPath === '/organization/complypay/dashboard') {
      const ComplyPay = React.lazy(() => import('./pages/organization/complypay'));
      return <OrganizationLayout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>}>
          <ComplyPay />
        </Suspense>
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/complypay/faturas') {
      const ComplyPayFaturas = React.lazy(() => import('./pages/organization/complypay/faturas'));
      return <OrganizationLayout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>}>
          <ComplyPayFaturas />
        </Suspense>
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/complypay/transacoes') {
      const ComplyPayTransacoes = React.lazy(() => import('./pages/organization/complypay/transacoes'));
      return <OrganizationLayout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>}>
          <ComplyPayTransacoes />
        </Suspense>
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/complypay/assinaturas') {
      const ComplyPayAssinaturas = React.lazy(() => import('./pages/organization/complypay/assinaturas'));
      return <OrganizationLayout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>}>
          <ComplyPayAssinaturas />
        </Suspense>
      </OrganizationLayout>;
    }
    
    // Redirecionamento direto para a página de integrações unificada
    if (currentPath.includes('/organization/complypay/integracoes')) {
      window.history.pushState({}, '', '/organization/integracoes');
      window.dispatchEvent(new Event('popstate'));
      return null;
    }
    
    if (currentPath === '/organization/integracoes') {
      const Integracoes = React.lazy(() => import('./pages/organization/integracoes'));
      return <OrganizationLayout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>}>
          <Integracoes />
        </Suspense>
      </OrganizationLayout>;
    }
    
    // Rotas específicas para as integrações
    if (currentPath === '/organization/integracoes/contaazul') {
      return <OrganizationLayout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>}>
          <IntegracaoContaAzul />
        </Suspense>
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/integracoes/nfse') {
      return <OrganizationLayout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>}>
          <IntegracaoNFSe />
        </Suspense>
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/integracoes/woocommerce') {
      return <OrganizationLayout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>}>
          <IntegracaoWooCommerce />
        </Suspense>
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/integracoes/complychat') {
      return <OrganizationLayout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>}>
          <IntegracaoCOMPLYCHAT />
        </Suspense>
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/integracoes/melhor-envio') {
      return <OrganizationLayout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>}>
          <IntegracaoMelhorEnvio />
        </Suspense>
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/integracoes/whatsapp') {
      return <OrganizationLayout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>}>
          <IntegracaoWhatsApp />
        </Suspense>
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/integracoes/correios') {
      return <OrganizationLayout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>}>
          <IntegracaoCorreios />
        </Suspense>
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/integracoes/nfe') {
      return <OrganizationLayout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>}>
          <IntegracaoNFe />
        </Suspense>
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/integracoes/shopify') {
      return <OrganizationLayout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>}>
          <IntegracaoShopify />
        </Suspense>
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/integracoes/pipefy') {
      return <OrganizationLayout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>}>
          <PipefyIntegracao />
        </Suspense>
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/integracoes/rdstation') {
      return <OrganizationLayout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>}>
          <RDStationIntegracao />
        </Suspense>
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/complypay/configuracoes') {
      const ComplyPayConfiguracoes = React.lazy(() => import('./pages/organization/complypay/configuracoes'));
      return <OrganizationLayout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>}>
          <ComplyPayConfiguracoes />
        </Suspense>
      </OrganizationLayout>;
    }
    
    // Rotas para compatibilidade com a estrutura antiga - redirecionamentos
    if (currentPath === '/organization/pedidos') {
      // Redirecionar para a nova URL
      useEffect(() => {
        window.history.pushState({}, '', '/organization/vendas/pedidos');
        window.dispatchEvent(new Event('navigation'));
      }, []);
      
      return <OrganizationLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/produtos') {
      // Redirecionar para a nova URL
      useEffect(() => {
        window.history.pushState({}, '', '/organization/vendas/produtos');
        window.dispatchEvent(new Event('navigation'));
      }, []);
      
      return <OrganizationLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/promocoes') {
      // Redirecionar para a nova URL
      useEffect(() => {
        window.history.pushState({}, '', '/organization/vendas/promocoes');
        window.dispatchEvent(new Event('navigation'));
      }, []);
      
      return <OrganizationLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/rastreamento') {
      // Redirecionar para a nova URL
      useEffect(() => {
        window.history.pushState({}, '', '/organization/vendas/rastreamento');
        window.dispatchEvent(new Event('navigation'));
      }, []);
      
      return <OrganizationLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </OrganizationLayout>;
    }
    
    // Rota para o Portal Médico
    if (currentPath === '/organization/medical-portal') {
      return <MedicalPortal />;
    }

    // Rotas para o módulo de Gerenciamento de Médicos
    if (currentPath === '/organization/doctor-management') {
      return <DoctorManagement />;
    }
    
    if (currentPath === '/organization/doctor-management/doctors') {
      return <DoctorManagementDoctors />;
    }

    if (currentPath === '/organization/doctor-management/appointments') {
      return <DoctorManagementAppointments />;
    }

    if (currentPath === '/organization/doctor-management/statistics') {
      return <DoctorManagementStatistics />;
    }

    if (currentPath === '/organization/doctor-management/documents') {
      return <DoctorManagementDocuments />;
    }

    if (currentPath === '/organization/doctor-management/afiliacao') {
      return <DoctorManagementAffiliation />;
    }

    if (currentPath === '/organization/farmacia') {
      return <FarmaciaModule />;
    }
    
    // Rotas do módulo de Patrimônio
    if (currentPath === '/organization/patrimonio') {
      return <OrganizationLayout>
        <PatrimonioPage />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/patrimonio/ativos') {
      return <OrganizationLayout>
        <AtivosPage />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/patrimonio/ativos/novo') {
      const NovoAtivoPage = React.lazy(() => import('./pages/organization/patrimonio/ativos/novo'));
      return <OrganizationLayout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>}>
          <NovoAtivoPage />
        </Suspense>
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/patrimonio/instalacoes') {
      return <OrganizationLayout>
        <InstalacoesPage />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/patrimonio/manutencoes') {
      return <OrganizationLayout>
        <ManutencoesPage />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/patrimonio/depreciacao') {
      return <OrganizationLayout>
        <DepreciacaoPage />
      </OrganizationLayout>;
    }
    
    if (currentPath === '/organization/patrimonio/depreciacao/calculadora') {
      return <OrganizationLayout>
        <CalculadoraDepreciacaoPage />
      </OrganizationLayout>;
    }
    
    // Rotas de integração da organização - redirecionamento de várias rotas para a central
    if (currentPath.startsWith('/organization/integrations/') || 
        currentPath.startsWith('/organization/settings/integracoes') ||
        currentPath.includes('/organization/complypay/integracoes')) {
      // Redirecionar para a nova página de integrações
      window.history.pushState({}, '', '/organization/integracoes');
      window.dispatchEvent(new Event('popstate'));
      return null;
    }
    
    return <NotFound />;
  }
  
  // Handle pharmacist-specific routes
  if (currentPath.startsWith('/pharmacist/')) {
    // Temporariamente permitindo acesso com role "doctor" para simular farmacêutico
    // No futuro, adicionar o role "pharmacist" ao enum role_type no banco de dados
    if (userRole !== 'pharmacist' && userRole !== 'doctor') {
      return (
        <Layout>
          <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
            <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
            <p className="text-gray-500 mb-4">
              Você não tem permissão para acessar esta área. Este portal é exclusivo para farmacêuticos.
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
    
    // Dashboard do farmacêutico
    if (currentPath === '/pharmacist/dashboard') {
      return (
        <PharmacistLayout>
          <PharmacistDashboard />
        </PharmacistLayout>
      );
    }
    
    // Página de prescrições
    if (currentPath === '/pharmacist/prescricoes') {
      return (
        <PharmacistLayout>
          <PharmacistPrescricoes />
        </PharmacistLayout>
      );
    }
    
    // Página de estoque
    if (currentPath === '/pharmacist/estoque') {
      return (
        <PharmacistLayout>
          <PharmacistEstoque />
        </PharmacistLayout>
      );
    }
    
    // Página de caixa (PDV)
    if (currentPath === '/pharmacist/caixa') {
      return (
        <PharmacistLayout>
          <PharmacistCaixa />
        </PharmacistLayout>
      );
    }
    
    // Página de financeiro
    if (currentPath === '/pharmacist/financeiro') {
      return (
        <PharmacistLayout>
          <PharmacistFinanceiro />
        </PharmacistLayout>
      );
    }
    
    // Página de produtos
    if (currentPath === '/pharmacist/produtos') {
      return (
        <PharmacistLayout>
          <PharmacistProdutos />
        </PharmacistLayout>
      );
    }
    
    // Página de agenda
    if (currentPath === '/pharmacist/agenda') {
      return (
        <PharmacistLayout>
          <PharmacistAgenda />
        </PharmacistLayout>
      );
    }
    
    // Página de pacientes
    if (currentPath === '/pharmacist/pacientes') {
      return (
        <PharmacistLayout>
          <PharmacistPacientes />
        </PharmacistLayout>
      );
    }
    
    // Página de pedidos
    if (currentPath === '/pharmacist/pedidos') {
      return (
        <PharmacistLayout>
          <PharmacistPedidos />
        </PharmacistLayout>
      );
    }
    
    // Página de relatórios
    if (currentPath === '/pharmacist/relatorios') {
      return (
        <PharmacistLayout>
          <PharmacistRelatorios />
        </PharmacistLayout>
      );
    }
    
    // Página de ajuda e suporte
    if (currentPath === '/pharmacist/ajuda') {
      return (
        <PharmacistLayout>
          <PharmacistAjuda />
        </PharmacistLayout>
      );
    }
    
    // Página de perfil do farmacêutico
    if (currentPath === '/pharmacist/perfil') {
      return (
        <PharmacistLayout>
          <PharmacistPerfil />
        </PharmacistLayout>
      );
    }
    
    // Página de configurações do farmacêutico
    if (currentPath === '/pharmacist/configuracoes') {
      return (
        <PharmacistLayout>
          <PharmacistConfiguracoes />
        </PharmacistLayout>
      );
    }
    
    // NotFound para outras rotas de farmacêutico não reconhecidas
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
      return <DoctorLayout>
        <DoctorDashboard />
      </DoctorLayout>;
    }
    
    // Rotas específicas do portal médico
    if (currentPath.startsWith('/doctor/')) {
      // Verificar o papel do usuário
      if (userRole !== 'doctor') {
        return (
          <Layout>
            <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
              <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
              <p className="text-gray-500 mb-4">
                Você não tem permissão para acessar esta área. Este portal é exclusivo para médicos.
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
      
      // Rotas específicas para médicos
      if (currentPath === '/doctor/agenda') {
        const Agenda = React.lazy(() => import('./pages/doctor/Agenda'));
        return (
          <DoctorLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>}>
              <Agenda />
            </Suspense>
          </DoctorLayout>
        );
      }
      
      if (currentPath === '/doctor/pacientes') {
        const Pacientes = React.lazy(() => import('./pages/doctor/Pacientes'));
        return (
          <DoctorLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>}>
              <Pacientes />
            </Suspense>
          </DoctorLayout>
        );
      }
      
      if (currentPath === '/doctor/prontuarios') {
        const Prontuarios = React.lazy(() => import('./pages/doctor/Prontuarios'));
        return (
          <DoctorLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>}>
              <Prontuarios />
            </Suspense>
          </DoctorLayout>
        );
      }
      
      if (currentPath === '/doctor/prescricoes') {
        const Prescricoes = React.lazy(() => import('./pages/doctor/Prescricoes'));
        return (
          <DoctorLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>}>
              <Prescricoes />
            </Suspense>
          </DoctorLayout>
        );
      }
      
      if (currentPath === '/doctor/afiliacao') {
        const Afiliacao = React.lazy(() => import('./pages/doctor/Afiliacao'));
        return (
          <DoctorLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>}>
              <Afiliacao />
            </Suspense>
          </DoctorLayout>
        );
      }
      
      // Página de consultas
      if (currentPath === '/doctor/consultas') {
        const Consultas = React.lazy(() => import('./pages/doctor/Consultas'));
        return (
          <DoctorLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>}>
              <Consultas />
            </Suspense>
          </DoctorLayout>
        );
      }
      
      // Página de relatórios
      if (currentPath === '/doctor/relatorios') {
        const Relatorios = React.lazy(() => import('./pages/doctor/Relatorios'));
        return (
          <DoctorLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>}>
              <Relatorios />
            </Suspense>
          </DoctorLayout>
        );
      }
      
      // Página de perfil
      if (currentPath === '/doctor/perfil') {
        const Perfil = React.lazy(() => import('./pages/doctor/Perfil'));
        return (
          <DoctorLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>}>
              <Perfil />
            </Suspense>
          </DoctorLayout>
        );
      }
      
      // Página da biblioteca
      if (currentPath === '/doctor/biblioteca') {
        const Biblioteca = React.lazy(() => import('./pages/doctor/Biblioteca'));
        return (
          <DoctorLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>}>
              <Biblioteca />
            </Suspense>
          </DoctorLayout>
        );
      }
      
      // Página de configurações
      if (currentPath === '/doctor/configuracoes') {
        const Configuracoes = React.lazy(() => import('./pages/doctor/Configuracoes'));
        return (
          <DoctorLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>}>
              <Configuracoes />
            </Suspense>
          </DoctorLayout>
        );
      }
      
      // Página de ajuda e suporte
      if (currentPath === '/doctor/ajuda') {
        const Ajuda = React.lazy(() => import('./pages/doctor/Ajuda'));
        return (
          <DoctorLayout>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>}>
              <Ajuda />
            </Suspense>
          </DoctorLayout>
        );
      }
      
      // Fallback para rotas não encontradas
      return <NotFound />;
    }
    
    return <NotFound />;
  }
  
  // Handle patient-specific routes
  // Check for laboratory routes
  if (currentPath.startsWith('/laboratory/')) {
    // Verificando se o usuário tem permissão para acessar
    // Permitimos acesso de admin, org_admin e usuários do tipo laboratory
    if (userRole !== 'admin' && userRole !== 'org_admin' && userRole !== 'laboratory') {
      return (
        <Layout>
          <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
            <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
            <p className="text-gray-500 mb-4">
              Você não tem permissão para acessar o portal do laboratório. Esta área é reservada para administradores de laboratório.
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
    
    // Rotas específicas do laboratório
    if (currentPath === '/laboratory/dashboard') {
      return (
        <LaboratoryLayout>
          <LaboratoryDashboard />
        </LaboratoryLayout>
      );
    }
    
    if (currentPath === '/laboratory/samples') {
      return (
        <LaboratoryLayout>
          <LaboratorySamples />
        </LaboratoryLayout>
      );
    }
    
    if (currentPath === '/laboratory/reports') {
      return (
        <LaboratoryLayout>
          <LaboratoryReports />
        </LaboratoryLayout>
      );
    }
    
    if (currentPath === '/laboratory/team') {
      return (
        <LaboratoryLayout>
          <LaboratoryTeam />
        </LaboratoryLayout>
      );
    }
    
    if (currentPath === '/laboratory/settings') {
      return (
        <LaboratoryLayout>
          <LaboratorySettings />
        </LaboratoryLayout>
      );
    }
    
    // Detalhes da amostra
    const sampleDetailMatch = currentPath.match(/^\/laboratory\/samples\/(\d+)$/);
    if (sampleDetailMatch) {
      return (
        <LaboratoryLayout>
          <SampleDetail />
        </LaboratoryLayout>
      );
    }
    
    // Detalhes do teste
    const testDetailMatch = currentPath.match(/^\/laboratory\/tests\/(\d+)$/);
    if (testDetailMatch) {
      return (
        <LaboratoryLayout>
          <TestDetail />
        </LaboratoryLayout>
      );
    }
    
    // Rotas do módulo de Equipamentos
    if (currentPath === '/laboratory/equipment') {
      return (
        <LaboratoryLayout>
          <LabEquipments />
        </LaboratoryLayout>
      );
    }
    
    // Detalhes do equipamento
    const equipmentDetailMatch = currentPath.match(/^\/laboratory\/equipment\/(\d+)$/);
    if (equipmentDetailMatch) {
      return (
        <LaboratoryLayout>
          <EquipmentDetail />
        </LaboratoryLayout>
      );
    }
    
    // Rotas do módulo HPLC
    console.log(`App.tsx: Rota atual: ${currentPath}`);
    
    // Sistema de roteamento para HPLC - mais simplificado e centralizado
    if (currentPath.startsWith('/laboratory/hplc/')) {
      // Mapear componentes HPLC baseados na rota
      const getHplcComponent = () => {
        console.log('Determinando o componente HPLC para:', currentPath);
        
        // Dashboard HPLC
        if (currentPath === '/laboratory/hplc/dashboard') {
          console.log('Retornando o componente Dashboard HPLC');
          return <HplcDashboard />;
        }
        
        // Equipamentos
        if (currentPath === '/laboratory/hplc/equipments') {
          return <HplcEquipments />;
        }
        
        // Manutenções
        if (currentPath === '/laboratory/hplc/maintenances') {
          return <HplcMaintenances />;
        }
        
        // Consumíveis
        if (currentPath === '/laboratory/hplc/consumables') {
          return <HplcConsumables />;
        }
        
        // Corridas
        if (currentPath === '/laboratory/hplc/runs') {
          return <HplcRuns />;
        }
        
        // Nova corrida
        if (currentPath === '/laboratory/hplc/runs/new') {
          return (
            <div className="p-6">
              <h1 className="text-xl font-bold mb-4">Nova Corrida HPLC</h1>
              <p className="text-muted-foreground">Esta funcionalidade será implementada em breve.</p>
            </div>
          );
        }
        
        // Procedimentos
        if (currentPath === '/laboratory/hplc/procedures') {
          return <HplcProcedures />;
        }
        
        // Detalhes do Procedimento
        const procedureDetailMatch = currentPath.match(/^\/laboratory\/hplc\/procedures\/(\d+)$/);
        if (procedureDetailMatch) {
          return <HplcProcedureDetail />;
        }
        
        // Validações
        if (currentPath === '/laboratory/hplc/validations') {
          return <HplcValidations />;
        }
        
        // Detalhes da Validação
        const validationDetailMatch = currentPath.match(/^\/laboratory\/hplc\/validations\/(\d+)$/);
        if (validationDetailMatch) {
          return <HplcValidationDetail />;
        }
        
        // Treinamentos
        if (currentPath === '/laboratory/hplc/trainings') {
          return <HplcTrainings />;
        }
        
        // Rota não reconhecida, mostrar dashboard
        console.log(`Rota HPLC não reconhecida: ${currentPath}, mostrando dashboard HPLC`);
        return <HplcDashboard />;
      };
      
      // Renderizar o layout do Laboratório com o componente HPLC apropriado
      console.log('Renderizando LaboratoryLayout com componente HPLC apropriado');
      return (
        <LaboratoryLayout>
          {getHplcComponent()}
        </LaboratoryLayout>
      );
    }

    // Se nenhuma rota específica for encontrada, mas o caminho começa com /laboratory/
    // redirecionar para o dashboard do laboratório
    window.history.pushState({}, '', '/laboratory/dashboard');
    window.dispatchEvent(new Event('popstate'));
    return (
      <LaboratoryLayout>
        <LaboratoryDashboard />
      </LaboratoryLayout>
    );
  }
  
  if (currentPath.startsWith('/patient/')) {
    // Para a dashboard e outras páginas do portal do paciente
    if (currentPath === '/patient/dashboard') {
      // Verificação de autenticação agora é feita no componente
      // Isto permite o acesso mesmo vindo de qualquer rota de login
      return <PatientDashboardPage />;
    }
    
    // Rota de perfil do paciente
    if (currentPath === '/patient/profile') {
      const ProfilePage = React.lazy(() => import('@/pages/patient/profile/index'));
      return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
          <ProfilePage />
        </Suspense>
      );
    }
    
    // Rota de configurações do paciente
    if (currentPath === '/patient/settings') {
      const SettingsPage = React.lazy(() => import('@/pages/patient/settings/index'));
      return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
          <SettingsPage />
        </Suspense>
      );
    }
    
    // Rota de suporte do paciente
    if (currentPath === '/patient/suporte') {
      const SuportePage = React.lazy(() => import('@/pages/patient/suporte/index'));
      return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
          <SuportePage />
        </Suspense>
      );
    }
    
    // Rotas de produtos e pedidos
    if (currentPath === '/patient/produtos') {
      const ProdutosRedirector = React.lazy(() => import('@/pages/patient/produtos'));
      return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
          <ProdutosRedirector />
        </Suspense>
      );
    }
    
    if (currentPath.startsWith('/patient/produtos/')) {
      const ProdutosPage = React.lazy(() => import('@/pages/patient/produtos/index'));
      return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
          <ProdutosPage />
        </Suspense>
      );
    }
    
    // Rota de prescrições
    if (currentPath.startsWith('/patient/prescricoes/nova')) {
      const NovaPrescricaoPage = React.lazy(() => import('@/pages/patient/prescricoes/nova'));
      return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
          <NovaPrescricaoPage />
        </Suspense>
      );
    }
    
    // Rota de rastreamento de pedidos
    if (currentPath.startsWith('/patient/pedidos/rastreamento')) {
      const RastreamentoPedidosPage = React.lazy(() => import('@/pages/patient/pedidos/rastreamento'));
      return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
          <RastreamentoPedidosPage />
        </Suspense>
      );
    }
    
    // Rota de pagamentos
    if (currentPath.startsWith('/patient/pagamentos')) {
      const PagamentosPage = React.lazy(() => import('@/pages/patient/pagamentos'));
      return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
          <PagamentosPage />
        </Suspense>
      );
    }
    
    // Rota de checkout
    if (currentPath.startsWith('/patient/checkout')) {
      const CheckoutPage = React.lazy(() => import('@/pages/patient/checkout'));
      return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
          <CheckoutPage />
        </Suspense>
      );
    }
    
    // Primeiro verificar se é a página de login do paciente (acessível sem autenticação)
    if (currentPath === '/patient/login') {
      const PatientLoginPage = React.lazy(() => import('@/pages/patient/login'));
      return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full"></div></div>}>
          <PatientLoginPage />
        </Suspense>
      );
    }
    
    // Este código não será alcançado após o retorno acima, então podemos remover
    if (false) {
      // Extrair organizationId do query parameter 
      const url = new URL(window.location.href);
      const orgId = url.searchParams.get('orgId') || url.searchParams.get('organizationId');
      
      if (orgId) {
        console.log("SPECIFIC HANDLER: Login de paciente com organizationId:", orgId);
        return <PatientLogin organizationId={orgId} />;
      }
      
      // Sem organizationId, apenas mostrar a página de login normal
      return <PatientLogin />;
    }
    
    // Para outras páginas do paciente, exigir autenticação e role correto
    if (userRole !== 'patient') {
      return (
        <Layout>
          <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
            <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
            <p className="text-gray-500 mb-4">
              Você não tem permissão para acessar esta área. Este portal é exclusivo para pacientes.
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
    
    return <NotFound />;
  }
  
  // Check for researcher routes
  if (currentPath.startsWith('/researcher/')) {
    // Verificando se o usuário tem permissão para acessar
    // Permitimos acesso de admin, org_admin e usuários do tipo researcher
    if (userRole !== 'admin' && userRole !== 'org_admin' && userRole !== 'researcher') {
      return (
        <Layout>
          <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
            <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
            <p className="text-gray-500 mb-4">
              Você não tem permissão para acessar o portal do pesquisador. Esta área é reservada para pesquisadores cadastrados.
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
    
    // Rotas específicas do pesquisador
    if (currentPath === '/researcher/dashboard') {
      return (
        <ResearcherLayout>
          <ResearcherDashboard />
        </ResearcherLayout>
      );
    }
    
    if (currentPath.startsWith('/researcher/estudos')) {
      return (
        <ResearcherLayout>
          {currentPath === '/researcher/estudos' ? (
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Estudos Científicos</h1>
              <p className="text-gray-500 mb-6">Lista de todos os seus estudos científicos e colaborações</p>
              <div className="border rounded-lg p-10 text-center">
                <p className="text-gray-500">Esta página está em desenvolvimento.</p>
                <button 
                  onClick={() => navigate('/researcher/dashboard')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Voltar para o Dashboard
                </button>
              </div>
            </div>
          ) : currentPath === '/researcher/estudos/novo' ? (
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Novo Estudo Científico</h1>
              <p className="text-gray-500 mb-6">Cadastre um novo estudo ou projeto de pesquisa</p>
              <div className="border rounded-lg p-10 text-center">
                <p className="text-gray-500">Este formulário está em desenvolvimento.</p>
                <button 
                  onClick={() => navigate('/researcher/dashboard')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Voltar para o Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Detalhes do Estudo</h1>
              <p className="text-gray-500 mb-6">Visualizando detalhes do estudo</p>
              <div className="border rounded-lg p-10 text-center">
                <p className="text-gray-500">Esta página está em desenvolvimento.</p>
                <button 
                  onClick={() => navigate('/researcher/dashboard')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Voltar para o Dashboard
                </button>
              </div>
            </div>
          )}
        </ResearcherLayout>
      );
    }
    
    if (currentPath === '/researcher/plantas' || currentPath === '/researcher/plantas/novo') {
      return (
        <ResearcherLayout>
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Registro de Plantas</h1>
            <p className="text-gray-500 mb-6">Cadastro e gerenciamento de cepas para pesquisa</p>
            <div className="border rounded-lg p-10 text-center">
              <p className="text-gray-500">Esta página está em desenvolvimento.</p>
              <button 
                onClick={() => navigate('/researcher/dashboard')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Voltar para o Dashboard
              </button>
            </div>
          </div>
        </ResearcherLayout>
      );
    }
    
    if (currentPath === '/researcher/organizacoes') {
      return (
        <ResearcherLayout>
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Organizações Colaboradoras</h1>
            <p className="text-gray-500 mb-6">Gerencie suas parcerias e encontre novas instituições</p>
            <div className="border rounded-lg p-10 text-center">
              <p className="text-gray-500">Esta página está em desenvolvimento.</p>
              <button 
                onClick={() => navigate('/researcher/dashboard')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Voltar para o Dashboard
              </button>
            </div>
          </div>
        </ResearcherLayout>
      );
    }
    
    // Se nenhuma rota específica for encontrada, retorne NotFound
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
      case '/sitemap': Component = Sitemap; break;
      case '/modules-table': Component = ModulesTable; break;
      case '/organization-modules': Component = OrganizationModules; break;
      case '/organizations': 
        // Redirecionar para /cadastro para evitar duplicidade
        window.history.pushState({}, '', '/cadastro');
        window.dispatchEvent(new Event('popstate'));
        Component = Cadastro; 
        break;
      case '/organization-registration': Component = OrganizationRegistration; break;
      case '/vendas': Component = VendasAdmin; break;
      case '/cadastro': Component = Cadastro; break;
      case '/email-templates': Component = EmailTemplates; break;
      case '/routes-list': Component = RoutesList; break;
      case '/administrators': Component = Administrators; break;
      case '/settings': Component = AdminSettings; break;
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
  // O ThemeProvider já foi adicionado no main.tsx para envolver toda a aplicação
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