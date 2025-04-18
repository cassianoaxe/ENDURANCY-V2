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
import { MoreHorizontal, Edit, Trash, Eye, Map, ImageIcon } from 'lucide-react';
import { Link } from 'wouter';

// Tipo das instalações
export type Installation = {
  id: number;
  nome: string;
  tipo: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  metrosQuadrados: number;
  dataAquisicao?: string;
  valorAquisicao?: number;
  status: string;
};

export const columns: ColumnDef<Installation>[] = [
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
    accessorKey: 'endereco',
    header: 'Endereço',
    cell: ({ row }) => <div>{row.getValue('endereco')}</div>,
  },
  {
    accessorKey: 'cidade',
    header: 'Cidade',
    cell: ({ row }) => <div>{row.getValue('cidade')}</div>,
  },
  {
    accessorKey: 'estado',
    header: 'Estado',
    cell: ({ row }) => <div>{row.getValue('estado')}</div>,
  },
  {
    accessorKey: 'metrosQuadrados',
    header: 'Tamanho (m²)',
    cell: ({ row }) => {
      const size = parseFloat(row.getValue('metrosQuadrados'));
      return <div>{size} m²</div>;
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
              : status === 'Em Reforma'
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
    id: 'actions',
    cell: ({ row }) => {
      const installation = row.original;
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
              <Link to={`/organization/patrimonio/instalacoes/${installation.id}`}>
                <Eye className="mr-2 h-4 w-4" /> Visualizar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link to={`/organization/patrimonio/instalacoes/editar/${installation.id}`}>
                <Edit className="mr-2 h-4 w-4" /> Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link to={`/organization/patrimonio/instalacoes/${installation.id}/fotos`}>
                <ImageIcon className="mr-2 h-4 w-4" /> Gerenciar Fotos
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link to={`/organization/patrimonio/instalacoes/${installation.id}/mapa`}>
                <Map className="mr-2 h-4 w-4" /> Ver no Mapa
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