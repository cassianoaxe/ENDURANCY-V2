"use client";
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Scale, Search } from "lucide-react";

// Dados fictícios para visualização
const acoes = [
  {
    id: '001',
    numero: '0123456-78.2023.8.26.0100',
    tipo: 'Ação Civil Pública',
    autor: 'Ministério Público',
    reu: 'Endurancy',
    tribunal: 'TJSP',
    valor: 'R$ 100.000,00',
    status: 'Em andamento',
    dataCriacao: '15/03/2023',
    ultimaAtualizacao: '05/08/2023'
  },
  {
    id: '002',
    numero: '9876543-21.2023.8.26.0100',
    tipo: 'Ação de Indenização',
    autor: 'João da Silva',
    reu: 'Endurancy',
    tribunal: 'TJSP',
    valor: 'R$ 50.000,00',
    status: 'Procedente',
    dataCriacao: '10/01/2023',
    ultimaAtualizacao: '30/07/2023'
  },
  {
    id: '003',
    numero: '5432109-87.2023.8.26.0100',
    tipo: 'Mandado de Segurança',
    autor: 'Endurancy',
    reu: 'ANVISA',
    tribunal: 'TRF3',
    valor: 'R$ 0,00',
    status: 'Procedente Parcial',
    dataCriacao: '05/05/2023',
    ultimaAtualizacao: '01/08/2023'
  },
  {
    id: '004',
    numero: '1357908-64.2023.8.26.0100',
    tipo: 'Ação Trabalhista',
    autor: 'Maria Oliveira',
    reu: 'Endurancy',
    tribunal: 'TRT2',
    valor: 'R$ 75.000,00',
    status: 'Improcedente',
    dataCriacao: '20/02/2023',
    ultimaAtualizacao: '15/07/2023'
  },
  {
    id: '005',
    numero: '2468013-57.2023.8.26.0100',
    tipo: 'Ação Regulatória',
    autor: 'Endurancy',
    reu: 'Agência Reguladora',
    tribunal: 'TJSP',
    valor: 'R$ 200.000,00',
    status: 'Em andamento',
    dataCriacao: '10/04/2023',
    ultimaAtualizacao: '20/07/2023'
  }
];

export default function AcoesJudiciais() {
  const [filtro, setFiltro] = useState('Todos');
  const [busca, setBusca] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em andamento':
        return 'bg-blue-100 text-blue-800';
      case 'Procedente':
        return 'bg-green-100 text-green-800';
      case 'Procedente Parcial':
        return 'bg-amber-100 text-amber-800';
      case 'Improcedente':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const acoesFiltradas = acoes.filter(acao => {
    // Primeiro aplicar filtro de status
    if (filtro !== 'Todos' && acao.status !== filtro) {
      return false;
    }
    
    // Depois aplicar busca
    if (busca) {
      const termoBusca = busca.toLowerCase();
      return (
        acao.numero.toLowerCase().includes(termoBusca) ||
        acao.tipo.toLowerCase().includes(termoBusca) ||
        acao.autor.toLowerCase().includes(termoBusca) ||
        acao.reu.toLowerCase().includes(termoBusca) ||
        acao.tribunal.toLowerCase().includes(termoBusca)
      );
    }
    
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-emerald-600" />
          <h1 className="text-2xl font-bold">Ações Judiciais</h1>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Nova Ação</span>
        </Button>
      </div>
      
      <p className="text-gray-600 mb-8">Gerencie todas as ações judiciais da organização</p>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <CardTitle>Lista de Ações</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar ações..."
                  className="pl-8"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
              <Select value={filtro} onValueChange={setFiltro}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Em andamento">Em andamento</SelectItem>
                  <SelectItem value="Procedente">Procedente</SelectItem>
                  <SelectItem value="Procedente Parcial">Procedente Parcial</SelectItem>
                  <SelectItem value="Improcedente">Improcedente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número do Processo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Réu</TableHead>
                  <TableHead>Tribunal</TableHead>
                  <TableHead>Valor da Causa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Atualização</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {acoesFiltradas.length > 0 ? (
                  acoesFiltradas.map((acao) => (
                    <TableRow key={acao.id}>
                      <TableCell className="font-medium">{acao.numero}</TableCell>
                      <TableCell>{acao.tipo}</TableCell>
                      <TableCell>{acao.autor}</TableCell>
                      <TableCell>{acao.reu}</TableCell>
                      <TableCell>{acao.tribunal}</TableCell>
                      <TableCell>{acao.valor}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(acao.status)}>
                          {acao.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{acao.ultimaAtualizacao}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                      {busca || filtro !== 'Todos' 
                        ? 'Nenhuma ação encontrada com os filtros aplicados'
                        : 'Nenhuma ação judicial cadastrada'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-500">
              Mostrando {acoesFiltradas.length} de {acoes.length} ações
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Anterior</Button>
              <Button variant="outline" size="sm" disabled>Próxima</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}