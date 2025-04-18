'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Wrench, Clock, Calendar } from 'lucide-react';
import { Link } from 'wouter';

// Definição de colunas temporárias para manutenções
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
    accessorKey: 'tipoManutencao',
    header: 'Tipo',
  },
  {
    accessorKey: 'dataAgendada',
    header: 'Data Agendada',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'responsavel',
    header: 'Responsável',
  },
];

export default function ManutencoesPage() {
  const [view, setView] = useState<'table' | 'grid'>('table');
  
  // Consulta de manutenções
  const {
    data: manutencoes,
    isLoading: isLoadingManutencoes
  } = useQuery({
    queryKey: ['/api/patrimonio/manutencoes'],
  });

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        heading="Manutenções"
        text="Gerencie todas as manutenções programadas e realizadas."
      >
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link to="/organization/patrimonio/manutencoes/nova">
              <Plus className="mr-2 h-4 w-4" /> Nova Manutenção
            </Link>
          </Button>
        </div>
      </PageHeader>
      
      {isLoadingManutencoes ? (
        <div className="space-y-2 mt-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <DataTable columns={columns} data={manutencoes || []} />
      )}
    </div>
  );
}