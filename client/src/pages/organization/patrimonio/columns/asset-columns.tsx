'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash, Calculator, Eye } from 'lucide-react';
import { Link } from 'wouter';

// Tipo dos ativos
export type Asset = {
  id: number;
  nome: string;
  tipo: string;
  numeroSerie?: string;
  marca?: string;
  modelo?: string;
  dataAquisicao: string;
  valorAquisicao: number;
  vidaUtilAnos: number;
  status: string;
  localizacao?: string;
  departamento?: string;
};

export const columns: ColumnDef<Asset>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar todos"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecionar linha"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <div className="text-xs">{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'nome',
    header: 'Nome',
    cell: ({ row }) => <div className="font-medium">{row.getValue('nome')}</div>,
  },
  {
    accessorKey: 'tipo',
    header: 'Tipo',
    cell: ({ row }) => <div>{row.getValue('tipo')}</div>,
  },
  {
    accessorKey: 'dataAquisicao',
    header: 'Data Aquisição',
    cell: ({ row }) => {
      const date = new Date(row.getValue('dataAquisicao'));
      return <div>{date.toLocaleDateString('pt-BR')}</div>;
    },
  },
  {
    accessorKey: 'valorAquisicao',
    header: 'Valor Aquisição',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('valorAquisicao'));
      const formatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge
          variant={
            status === 'Ativo'
              ? 'default'
              : status === 'Em Manutenção'
              ? 'warning'
              : status === 'Inativo'
              ? 'destructive'
              : 'secondary'
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'localizacao',
    header: 'Localização',
    cell: ({ row }) => <div>{row.getValue('localizacao')}</div>,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const asset = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem>
              <Link to={`/organization/patrimonio/ativos/${asset.id}`}>
                <Eye className="mr-2 h-4 w-4" /> Visualizar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link to={`/organization/patrimonio/ativos/editar/${asset.id}`}>
                <Edit className="mr-2 h-4 w-4" /> Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link to={`/organization/patrimonio/ativos/${asset.id}/calcular-depreciacao`}>
                <Calculator className="mr-2 h-4 w-4" /> Calcular Depreciação
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash className="mr-2 h-4 w-4" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];