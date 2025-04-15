import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUp, ArrowDown, RefreshCw, AlertCircle, Clock } from 'lucide-react';

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
          <TabsTrigger value="dashboard" onClick={() => navigate('/organization/complypay')}>Dashboard</TabsTrigger>
          <TabsTrigger value="transacoes" onClick={() => navigate('/organization/complypay/transacoes')}>Transações</TabsTrigger>
          <TabsTrigger value="faturas" onClick={() => navigate('/organization/complypay/faturas')}>Faturas</TabsTrigger>
          <TabsTrigger value="configuracoes" onClick={() => navigate('/organization/complypay/configuracoes')}>Configurações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Card de Receita Total */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-2xl font-bold tracking-tight">R$ 45.750,00</h3>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      <ArrowUp className="mr-1 h-3 w-3" />
                      +12% este mês
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card de Reembolsos */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Reembolsos</p>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-2xl font-bold tracking-tight">R$ 750,00</h3>
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                      <ArrowDown className="mr-1 h-3 w-3" />
                      4% das transações
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card de Receita Pendente */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Receita Pendente</p>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-2xl font-bold tracking-tight">R$ 3.450,00</h3>
                  </div>
                  <p className="text-xs text-amber-600 flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    2 transações aguardando
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Card de Faturas Vencidas */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Faturas Vencidas</p>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-2xl font-bold tracking-tight">1</h3>
                  </div>
                  <p className="text-xs text-red-600 flex items-center">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Ação necessária
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Sistema em Desenvolvimento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                O sistema de pagamentos ComplyPay está em fase de implementação. Aqui você poderá gerenciar todas as transações, faturas e configurações de pagamento.
              </p>
              
              <h3 className="text-lg font-medium mt-4 mb-2">Recursos em desenvolvimento:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Processamento de pagamentos com cartão de crédito, boleto e PIX</li>
                <li>Geração e gerenciamento de faturas</li>
                <li>Assinaturas e pagamentos recorrentes</li>
                <li>Relatórios financeiros detalhados</li>
                <li>Integração com serviços de contabilidade</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}