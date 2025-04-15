import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUp, ArrowDown, RefreshCw, WalletCards, AlertCircle, Clock } from 'lucide-react';

// Importações das subpáginas do módulo ComplyPay
import ComplyPayDashboard from './dashboard';
import ComplyPayFaturas from './faturas';
import ComplyPayTransacoes from './transacoes';
import ComplyPayConfiguracoes from './configuracoes';

export default function ComplyPay() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [, navigate] = useLocation();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ComplyPay</h1>
        <p className="text-muted-foreground">Sistema integrado de processamento de pagamentos</p>
      </div>

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="transacoes">Transações</TabsTrigger>
          <TabsTrigger value="faturas">Faturas</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <ComplyPayDashboard />
        </TabsContent>
        
        <TabsContent value="transacoes" className="space-y-6">
          <ComplyPayTransacoes />
        </TabsContent>
        
        <TabsContent value="faturas" className="space-y-6">
          <ComplyPayFaturas />
        </TabsContent>
        
        <TabsContent value="configuracoes" className="space-y-6">
          <ComplyPayConfiguracoes />
        </TabsContent>
      </Tabs>
    </div>
  );
}