import React from "react";
import { Route, Router } from "wouter";
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
import Login from "@/pages/Login";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

// Wrapper component that handles authentication for protected pages
const ProtectedPage = ({ component: Component }: { component: React.ComponentType }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }
  
  return (
    <Layout>
      <Component />
    </Layout>
  );
};

// Simple router
const simpleRoutes = {
  "/": () => <ProtectedPage component={Dashboard} />,
  "/dashboard": () => <ProtectedPage component={Dashboard} />,
  "/analytics": () => <ProtectedPage component={Analytics} />,
  "/organizacoes": () => <ProtectedPage component={Organizations} />,
  "/organization-registration": () => <ProtectedPage component={OrganizationRegistration} />,
  "/templates-de-email": () => <ProtectedPage component={EmailTemplates} />,
  "/configuracoes": () => <ProtectedPage component={Settings} />,
  "/login": () => <Login />,
  "/:rest*": () => <NotFound />
};

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            {Object.entries(simpleRoutes).map(([path, Component]) => (
              <Route key={path} path={path} component={Component} />
            ))}
          </Router>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;