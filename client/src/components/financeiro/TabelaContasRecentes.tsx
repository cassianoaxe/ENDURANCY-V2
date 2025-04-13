'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Dados mockados para demonstração
const CONTAS_RECENTES = [
  { 
    id: 1, 
    descricao: 'Pagamento de fornecedor', 
    valor: 3250.50, 
    vencimento: '15/04/2025',
    status: 'pendente',
    tipo: 'despesa' 
  },
  { 
    id: 2, 
    descricao: 'Recebimento de cliente ABC', 
    valor: 5750.00, 
    vencimento: '20/04/2025',
    status: 'pendente',
    tipo: 'receita' 
  },
  { 
    id: 3, 
    descricao: 'Aluguel imóvel', 
    valor: 2800.00, 
    vencimento: '10/04/2025',
    status: 'pago',
    tipo: 'despesa' 
  },
  { 
    id: 4, 
    descricao: 'Folha de pagamento', 
    valor: 35000.00, 
    vencimento: '05/04/2025',
    status: 'pago',
    tipo: 'despesa' 
  },
  { 
    id: 5, 
    descricao: 'Recebimento de cliente XYZ', 
    valor: 8450.00, 
    vencimento: '25/04/2025',
    status: 'pendente',
    tipo: 'receita' 
  },
];

interface TabelaContasRecentesProps {
  titulo: string;
  limiteItens?: number;
}

export default function TabelaContasRecentes({ titulo, limiteItens = 5 }: TabelaContasRecentesProps) {
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const cores = {
    receita: 'text-green-600',
    despesa: 'text-red-600'
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'vencido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">
          {titulo}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {CONTAS_RECENTES.slice(0, limiteItens).map((conta) => (
              <TableRow key={conta.id}>
                <TableCell className="font-medium">{conta.descricao}</TableCell>
                <TableCell className={cores[conta.tipo as keyof typeof cores]}>
                  {formatter.format(conta.valor)}
                </TableCell>
                <TableCell>{conta.vencimento}</TableCell>
                <TableCell>
                  <Badge className={getBadgeVariant(conta.status)}>
                    {conta.status.charAt(0).toUpperCase() + conta.status.slice(1)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}