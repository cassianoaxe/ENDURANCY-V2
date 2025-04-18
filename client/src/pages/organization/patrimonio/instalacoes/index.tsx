'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Building, MapPin } from 'lucide-react';
import { Link } from 'wouter';
import { columns } from '../columns/installation-columns';

export default function InstalacoesPage() {
  const [view, setView] = useState<'table' | 'grid'>('table');
  
  // Consulta de instalações
  const {
    data: instalacoes,
    isLoading: isLoadingInstalacoes
  } = useQuery({
    queryKey: ['/api/patrimonio/instalacoes'],
  });

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        heading="Instalações"
        text="Gerencie todas as suas instalações e localidades."
      >
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link to="/organization/patrimonio/instalacoes/nova">
              <Plus className="mr-2 h-4 w-4" /> Nova Instalação
            </Link>
          </Button>
        </div>
      </PageHeader>
      
      {isLoadingInstalacoes ? (
        <div className="space-y-2 mt-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <DataTable columns={columns} data={instalacoes || []} />
      )}
    </div>
  );
}