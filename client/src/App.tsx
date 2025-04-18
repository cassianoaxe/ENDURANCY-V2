import React, { useState, useEffect, Suspense } from "react";
import { useLocation } from "wouter";
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
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import TourGuide from "@/components/features/TourGuide";

// Importando todas as páginas necessárias
import LaboratoryDashboard from "@/pages/laboratory/Dashboard";
import Analytics from "@/pages/Analytics";
import Organizations from "@/pages/Organizations";
import OrganizationRegistration from "@/pages/OrganizationRegistration";
import OrganizationConfirmation from "@/pages/OrganizationConfirmation";
import EmailTemplates from "@/pages/EmailTemplates";
import RoutesList from "@/pages/RoutesList";
import AdminSettings from "@/pages/Settings";
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
import PaymentConfirmar from "@/pages/pagamento/confirmar";
import PaymentConfirmacao from "@/pages/pagamento/confirmacao";
import Sitemap from "@/pages/Sitemap";
import DataImport from "@/pages/DataImport";

// Importações específicas para o módulo de laboratório
import LaboratorySamples from "@/pages/laboratory/Samples";
import SampleDetail from "@/pages/laboratory/SampleDetail";
import TestDetail from "@/pages/laboratory/TestDetail";
import LaboratoryReports from "@/pages/laboratory/Reports";
import LaboratoryTeam from "@/pages/laboratory/Team";
import LaboratorySettings from "@/pages/laboratory/Settings";

// Integrations
import Integracoes from "@/pages/integracoes/index";
import WhatsAppIntegration from "@/pages/integracoes/comunicacao/whatsapp";
import AsaasIntegration from "@/pages/integracoes/pagamentos/asaas";
import ZoopIntegration from "@/pages/integracoes/pagamentos/zoop";
import MelhorEnvioIntegration from "@/pages/integracoes/logistica/melhor-envio";
import AzulCargoIntegration from "@/pages/integracoes/logistica/azul-cargo";
import CorreiosIntegration from "@/pages/integracoes/logistica/correios";
import ChatGPTIntegration from "@/pages/integracoes/ia/chatgpt";
import ClaudeIntegration from "@/pages/integracoes/ia/claude";
import KentroIntegration from "@/pages/integracoes/crm/kentro";

// Importando os componentes específicos do laboratório do pesquisador
const LaboratorioPage = React.lazy(() => import('./pages/researcher/laboratorio/index'));
const AmostrasList = React.lazy(() => import('./pages/researcher/laboratorio/amostras/index'));
const EquipamentosList = React.lazy(() => import('./pages/researcher/laboratorio/equipamentos/index'));
const ResultadosList = React.lazy(() => import('./pages/researcher/laboratorio/resultados/index'));

function AppContent() {
  const [location, setLocation] = useLocation();
  const { user, userRole } = useAuth();
  
  const currentPath = location;
  
  // Verificar autenticação para rotas que exigem login
  // ... (código de autenticação, se necessário)
  
  // Rotas do módulo de laboratório do pesquisador
  if (currentPath === '/researcher/laboratorio') {
    return (
      <ResearcherLayout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>}>
          <LaboratorioPage />
        </Suspense>
      </ResearcherLayout>
    );
  }

  if (currentPath === '/researcher/laboratorio/amostras') {
    return (
      <ResearcherLayout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>}>
          <AmostrasList />
        </Suspense>
      </ResearcherLayout>
    );
  }

  if (currentPath === '/researcher/laboratorio/equipamentos') {
    return (
      <ResearcherLayout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>}>
          <EquipamentosList />
        </Suspense>
      </ResearcherLayout>
    );
  }

  if (currentPath === '/researcher/laboratorio/resultados') {
    return (
      <ResearcherLayout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>}>
          <ResultadosList />
        </Suspense>
      </ResearcherLayout>
    );
  }

  // Outras rotas do pesquisador
  if (currentPath === '/researcher/dashboard') {
    return (
      <ResearcherLayout>
        <ResearcherDashboard />
      </ResearcherLayout>
    );
  }

  // Caso nenhuma rota específica tenha sido encontrada
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