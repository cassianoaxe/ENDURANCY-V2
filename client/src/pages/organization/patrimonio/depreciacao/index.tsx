'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Calculator, BarChart, ArrowUpRight } from 'lucide-react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Definição de colunas temporárias para depreciação
const columns = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'ativoNome',
    header: 'Ativo',
  },
  {
    accessorKey: 'valorOriginal',
    header: 'Valor Original',
  },
  {
    accessorKey: 'valorAtual',
    header: 'Valor Atual',
  },
  {
    accessorKey: 'taxaDepreciacao',
    header: 'Taxa de Depreciação',
  },
  {
    accessorKey: 'dataAquisicao',
    header: 'Data de Aquisição',
  },
];

export default function DepreciacaoPage() {
  const [view, setView] = useState<'table' | 'grid'>('table');
  
  // Consulta de depreciações
  const {
    data: depreciacoes,
    isLoading: isLoadingDepreciacoes
  } = useQuery({
    queryKey: ['/api/patrimonio/depreciacoes'],
  });

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        heading="Depreciação de Ativos"
        text="Acompanhe e calcule a depreciação dos seus ativos."
      >
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link to="/organization/patrimonio/depreciacao/calculadora">
              <Calculator className="mr-2 h-4 w-4" /> Calculadora de Depreciação
            </Link>
          </Button>
        </div>
      </PageHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Patrimonial</CardTitle>
            <CardDescription>Valor total dos ativos</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingDepreciacoes ? (
              <Skeleton className="h-12 w-24" />
            ) : (
              <div className="text-3xl font-bold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(500000)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Depreciação Acumulada</CardTitle>
            <CardDescription>Total depreciado até hoje</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingDepreciacoes ? (
              <Skeleton className="h-12 w-32" />
            ) : (
              <div className="text-3xl font-bold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(120000)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Atual</CardTitle>
            <CardDescription>Valor após depreciação</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingDepreciacoes ? (
              <Skeleton className="h-12 w-24" />
            ) : (
              <div className="text-3xl font-bold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(380000)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {isLoadingDepreciacoes ? (
        <div className="space-y-2 mt-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <DataTable columns={columns} data={depreciacoes || []} />
      )}
    </div>
  );
}