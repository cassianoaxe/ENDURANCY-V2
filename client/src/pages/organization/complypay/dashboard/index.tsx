import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ArrowUp, ArrowDown, RefreshCw, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

// Dados de exemplo para o painel
const dashboardData = {
  receitaTotal: {
    valor: 45750.00,
    percentual: 12,
    comparativo: 'este mês'
  },
  reembolsos: {
    valor: 750.00,
    percentual: 4,
    comparativo: 'das transações'
  },
  receitaPendente: {
    valor: 3450.00,
    transacoes: 2,
    status: 'aguardando'
  },
  faturasVencidas: {
    quantidade: 1,
    status: 'Ação necessária'
  }
};

export default function ComplyPayDashboard() {
  // No futuro, podemos usar React Query para buscar dados reais da API
  const { data: dashboardInfo, isLoading } = useQuery({
    queryKey: ['/api/complypay/dashboard'],
    enabled: false, // Desabilitado temporariamente pois estamos usando dados de exemplo
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card de Receita Total */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
              <div className="flex items-center space-x-2">
                <h3 className="text-2xl font-bold tracking-tight">R$ {dashboardData.receitaTotal.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  <ArrowUp className="mr-1 h-3 w-3" />
                  +{dashboardData.receitaTotal.percentual}% {dashboardData.receitaTotal.comparativo}
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
                <h3 className="text-2xl font-bold tracking-tight">R$ {dashboardData.reembolsos.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                  <ArrowDown className="mr-1 h-3 w-3" />
                  {dashboardData.reembolsos.percentual}% {dashboardData.reembolsos.comparativo}
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
                <h3 className="text-2xl font-bold tracking-tight">R$ {dashboardData.receitaPendente.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
              </div>
              <p className="text-xs text-amber-600 flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                {dashboardData.receitaPendente.transacoes} transações {dashboardData.receitaPendente.status}
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
                <h3 className="text-2xl font-bold tracking-tight">{dashboardData.faturasVencidas.quantidade}</h3>
              </div>
              <p className="text-xs text-red-600 flex items-center">
                <AlertCircle className="mr-1 h-3 w-3" />
                {dashboardData.faturasVencidas.status}
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
    </div>
  );
}