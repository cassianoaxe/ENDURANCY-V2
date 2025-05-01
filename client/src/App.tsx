import React, { useState, useEffect, Suspense } from "react";
import { useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/Layout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Cadastro from "@/pages/Cadastro";
import CadastroDashboard from "@/pages/cadastro/dashboard";
import CadastroFormularios from "@/pages/cadastro/formularios";
import CadastroFormulariosNovo from "@/pages/cadastro/formularios/novo";
import CadastroConfiguracoes from "@/pages/cadastro/configuracoes";
import OrganizationRegistration from "@/pages/OrganizationRegistration";
import Login from "@/pages/Login";
import AdminDashboard from "@/pages/dashboards/AdminDashboard";
import CarteirinhaPage from "@/pages/CarteirinhaPage";
import VerificarCarteirinha from "@/pages/carteirinha/VerificarCarteirinha";
import TourGuide from "@/components/features/TourGuide";

// Importar outros componentes conforme necessário
// Esta versão simplificada foca apenas nas rotas de cadastro

function AppContent() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const { isLoading, isAuthenticated, user, userRole, logout } = useAuth();
  const [, setLocation] = useLocation();

  // Listen for path changes
  useEffect(() => {
    const handlePathChange = () => {
      let newPath = window.location.pathname;
      
      // Normalizar URLs entre /organization/ e /organizations/
      if (newPath.match(/^\/organization\/\d+\/dashboard\/?$/)) {
        // Redirecionar automaticamente para a versão plural do caminho
        const newPluralPath = newPath.replace('/organization/', '/organizations/');
        console.log("Normalizando URL:", newPath, "->", newPluralPath);
        
        // Atualizar URL sem recarregar a página
        window.history.replaceState(null, '', newPluralPath);
        newPath = newPluralPath;
      }
      
      console.log("Navegação detectada para:", newPath);
      setCurrentPath(newPath);
    };

    // Ouvir evento popstate (navegação pelo histórico)
    window.addEventListener('popstate', handlePathChange);
    
    // Ouvir evento customizado para navegação manual
    const handleCustomNavigation = () => {
      let newPath = window.location.pathname;
      
      // Normalizar URLs entre /organization/ e /organizations/
      if (newPath.match(/^\/organization\/\d+\/dashboard\/?$/)) {
        // Redirecionar automaticamente para a versão plural do caminho
        const newPluralPath = newPath.replace('/organization/', '/organizations/');
        console.log("Normalizando URL:", newPath, "->", newPluralPath);
        
        // Atualizar URL sem recarregar a página
        window.history.replaceState(null, '', newPluralPath);
        newPath = newPluralPath;
      }
      
      console.log("Navegação customizada para:", newPath);
      setCurrentPath(newPath);
    };
    
    window.addEventListener('navigation', handleCustomNavigation);
    
    return () => {
      window.removeEventListener('popstate', handlePathChange);
      window.removeEventListener('navigation', handleCustomNavigation);
    };
  }, []);

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-gray-500">Carregando...</p>
      </div>
    );
  }

  // Componente principal para renderização baseada em rota
  // Esta versão simplificada lida principalmente com rotas /cadastro
  let Component = NotFound;
  
  // Importação dinâmica para o dashboard da organização
  const OrgAdminDashboard = React.lazy(() => import('./pages/dashboards/OrgAdminDashboard'));

  // Rotas específicas que queremos tratar
  // Rotas de autenticação
  if (currentPath === '/login' || currentPath === '/login/' || 
      currentPath.startsWith('/login/') || 
      currentPath === '/auth' || currentPath === '/auth/') {
    Component = Login;
  }
  else if (currentPath === '/cadastro') {
    Component = Cadastro;
  } 
  else if (currentPath === '/cadastro/dashboard') {
    Component = CadastroDashboard;
  }
  else if (currentPath === '/cadastro/formularios') {
    console.log("Renderizando componente CadastroFormularios");
    Component = CadastroFormularios;
  }
  else if (currentPath === '/cadastro/formularios/novo') {
    console.log("Renderizando componente CadastroFormulariosNovo");
    Component = CadastroFormulariosNovo;
  }
  else if (currentPath === '/cadastro/configuracoes') {
    Component = CadastroConfiguracoes;
  }
  else if (currentPath === '/organization-registration') {
    Component = OrganizationRegistration;
  }
  else if (currentPath === '/admin/dashboard') {
    Component = AdminDashboard;
  }
  else if (currentPath === '/carteirinha') {
    Component = CarteirinhaPage;
  }
  else if (currentPath.startsWith('/carteirinha/verificar/')) {
    Component = VerificarCarteirinha;
  }
  // Adicionar suporte para rotas de dashboard de organizações
  else if (currentPath.match(/^\/organizations\/\d+\/dashboard\/?$/)) {
    console.log("Renderizando dashboard de organização:", currentPath);
    Component = () => (
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <OrgAdminDashboard />
      </Suspense>
    );
  }
  // Rota antiga (para compatibilidade)
  else if (currentPath.match(/^\/organization\/\d+\/dashboard\/?$/)) {
    console.log("Renderizando dashboard de organização (compat):", currentPath);
    Component = () => (
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <OrgAdminDashboard />
      </Suspense>
    );
  }

  // Se for página de login ou registro, não usar o Layout padrão
  if (Component === Login || Component === OrganizationRegistration) {
    return <Component />;
  }
  
  return (
    <Layout>
      {typeof Component === 'function' ? <Component /> : <NotFound />}
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