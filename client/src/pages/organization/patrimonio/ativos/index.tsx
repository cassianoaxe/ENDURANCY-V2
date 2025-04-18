'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Wrench, Building, Package } from 'lucide-react';
import { Link } from 'wouter';
import { columns } from '../columns/asset-columns';

export default function AtivosPage() {
  const [view, setView] = useState<'table' | 'grid'>('table');
  
  // Consulta de ativos
  const {
    data: ativos,
    isLoading: isLoadingAtivos
  } = useQuery({
    queryKey: ['/api/patrimonio/ativos'],
  });

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        heading="Ativos e Equipamentos"
        text="Gerencie todos os seus ativos e equipamentos."
      >
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link to="/organization/patrimonio/ativos/novo">
              <Plus className="mr-2 h-4 w-4" /> Novo Ativo
            </Link>
          </Button>
        </div>
      </PageHeader>
      
      {isLoadingAtivos ? (
        <div className="space-y-2 mt-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <DataTable columns={columns} data={ativos || []} />
      )}
    </div>
  );
}