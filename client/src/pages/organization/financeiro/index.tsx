'use client';

import React from 'react';
import CardValor from '@/components/financeiro/CardValor';
import GraficoLinhas from '@/components/financeiro/GraficoLinhas';
import GraficoPorCategoria from '@/components/financeiro/GraficoPorCategoria';
import TabelaContasRecentes from '@/components/financeiro/TabelaContasRecentes';
import { Button } from '@/components/ui/button';
import { CalendarRange, Download, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DashboardFinanceiro() {
  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Financeiro</h1>
            <p className="text-muted-foreground">
              Visão geral das finanças da sua organização
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <CalendarRange className="h-4 w-4" />
              Abril 2025
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardValor 
            titulo="Receita Total" 
            valor={120000} 
            porcentagem={12}
            tipo="receita" 
          />
          <CardValor 
            titulo="Despesa Total" 
            valor={95000} 
            porcentagem={8}
            tipo="despesa" 
          />
          <CardValor 
            titulo="Saldo Líquido" 
            valor={25000} 
            porcentagem={18}
            tipo="receita" 
          />
          <CardValor 
            titulo="Contas a Pagar (30 dias)" 
            valor={45000} 
            tipo="neutro" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GraficoLinhas titulo="Evolução Financeira" />
          </div>

          <div className="lg:col-span-1">
            <GraficoPorCategoria titulo="Receitas/Despesas por Categoria" />
          </div>
        </div>

        <Tabs defaultValue="contas-pagar" className="space-y-4">
          <TabsList>
            <TabsTrigger value="contas-pagar">Contas a Pagar</TabsTrigger>
            <TabsTrigger value="contas-receber">Contas a Receber</TabsTrigger>
          </TabsList>
          <TabsContent value="contas-pagar">
            <TabelaContasRecentes titulo="Contas a Pagar Recentes" limiteItens={5} />
          </TabsContent>
          <TabsContent value="contas-receber">
            <TabelaContasRecentes titulo="Contas a Receber Recentes" limiteItens={5} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}