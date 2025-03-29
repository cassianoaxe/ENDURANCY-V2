import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import Organizations from "@/pages/Organizations";
import OrganizationRegistration from "@/pages/OrganizationRegistration";
import EmailTemplates from "@/pages/EmailTemplates";
import Settings from "@/pages/Settings";
import OrderView from "@/pages/OrderView";
import Login from "@/pages/Login";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

// Simple AppContent component with no external routing library
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

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

  // If not authenticated, only show login page
  if (!isAuthenticated) {
    return <Login />;
  }

  // If authenticated and trying to access login, redirect to dashboard
  if (isAuthenticated && currentPath === '/login') {
    window.history.pushState({}, '', '/');
    setCurrentPath('/');
  }

  // Render the appropriate component based on the current path
  const renderContent = () => {
    // Check if the path matches an order view pattern (/orders/123)
    if (currentPath.startsWith('/orders/')) {
      return <OrderView />;
    }
    
    switch (currentPath) {
      case '/':
      case '/dashboard':
        return <Dashboard />;
      case '/analytics':
        return <Analytics />;
      case '/organizations':
        return <Organizations />;
      case '/organization-registration':
        return <OrganizationRegistration />;
      case '/email-templates':
        return <EmailTemplates />;
      case '/settings':
        return <Settings />;
      default:
        return <NotFound />;
    }
  };

  // Return the app content
  return (
    <Layout>
      {renderContent()}
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;