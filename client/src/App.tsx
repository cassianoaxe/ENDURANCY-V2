import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import ActivityLog from "@/pages/ActivityLog";
import Backups from "@/pages/Backups";
import Emergencies from "@/pages/Emergencies";
import Plans from "@/pages/Plans";
import Organizations from "@/pages/Organizations";
import Requests from "@/pages/Requests";
import Financial from "@/pages/Financial";
import EmailTemplates from "@/pages/EmailTemplates";
import Administrators from "@/pages/Administrators";
import Settings from "@/pages/Settings";


function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/registro-de-atividades" component={ActivityLog} />
        <Route path="/backups" component={Backups} />
        <Route path="/emergencias" component={Emergencies} />
        <Route path="/planos" component={Plans} />
        <Route path="/organizacoes" component={Organizations} />
        <Route path="/solicitacoes" component={Requests} />
        <Route path="/financeiro" component={Financial} />
        <Route path="/templates-de-email" component={EmailTemplates} />
        <Route path="/administradores" component={Administrators} />
        <Route path="/configuracoes" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster />
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;