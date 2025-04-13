'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableFooter } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileBarChart, Plus, Search, Pencil, Trash2, Filter, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Dados mockados para demonstração
const ORCAMENTOS = [
  { 
    id: 1, 
    categoria: 'Vendas e Marketing',
    orcadoAnual: 120000, 
    realizadoAnual: 118500,
    orcadoMensal: 10000,
    realizadoMensal: 9875,
    variacao: -1.25,
  },
  { 
    id: 2, 
    categoria: 'Pessoal',
    orcadoAnual: 450000, 
    realizadoAnual: 442000,
    orcadoMensal: 37500,
    realizadoMensal: 36833,
    variacao: -1.78,
  },
  { 
    id: 3, 
    categoria: 'Operações',
    orcadoAnual: 180000, 
    realizadoAnual: 195000,
    orcadoMensal: 15000,
    realizadoMensal: 16250,
    variacao: 8.33,
  },
  { 
    id: 4, 
    categoria: 'Tecnologia',
    orcadoAnual: 85000, 
    realizadoAnual: 82000,
    orcadoMensal: 7083,
    realizadoMensal: 6833,
    variacao: -3.53,
  },
  { 
    id: 5, 
    categoria: 'Infraestrutura',
    orcadoAnual: 72000, 
    realizadoAnual: 74500,
    orcadoMensal: 6000,
    realizadoMensal: 6208,
    variacao: 3.47,
  },
  { 
    id: 6, 
    categoria: 'Treinamento',
    orcadoAnual: 35000, 
    realizadoAnual: 28000,
    orcadoMensal: 2917,
    realizadoMensal: 2333,
    variacao: -20.02,
  },
];

export default function Orcamento() {
  const [anoAtual, setAnoAtual] = useState<string>('2025');
  const [mesSelecionado, setMesSelecionado] = useState<string>('abril');
  const [termoBusca, setTermoBusca] = useState('');
  
  // Formatar valores monetários
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(valor);
  };
  
  // Calcular o percentual de realização
  const calcularPercentualRealizacao = (realizado: number, orcado: number) => {
    return (realizado / orcado) * 100;
  };
  
  // Cálculo de totais
  const totalOrcadoAnual = ORCAMENTOS.reduce((sum, item) => sum + item.orcadoAnual, 0);
  const totalRealizadoAnual = ORCAMENTOS.reduce((sum, item) => sum + item.realizadoAnual, 0);
  const totalOrcadoMensal = ORCAMENTOS.reduce((sum, item) => sum + item.orcadoMensal, 0);
  const totalRealizadoMensal = ORCAMENTOS.reduce((sum, item) => sum + item.realizadoMensal, 0);
  
  // Filtrar orçamentos
  const orcamentosFiltrados = ORCAMENTOS.filter((orcamento) => {
    if (termoBusca && !orcamento.categoria.toLowerCase().includes(termoBusca.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orçamento</h1>
            <p className="text-muted-foreground">
              Gerenciamento e acompanhamento do orçamento
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={anoAtual} onValueChange={setAnoAtual}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="janeiro">Janeiro</SelectItem>
                <SelectItem value="fevereiro">Fevereiro</SelectItem>
                <SelectItem value="marco">Março</SelectItem>
                <SelectItem value="abril">Abril</SelectItem>
                <SelectItem value="maio">Maio</SelectItem>
                <SelectItem value="junho">Junho</SelectItem>
                <SelectItem value="julho">Julho</SelectItem>
                <SelectItem value="agosto">Agosto</SelectItem>
                <SelectItem value="setembro">Setembro</SelectItem>
                <SelectItem value="outubro">Outubro</SelectItem>
                <SelectItem value="novembro">Novembro</SelectItem>
                <SelectItem value="dezembro">Dezembro</SelectItem>
              </SelectContent>
            </Select>
            
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Orçamento
            </Button>
            
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Visão Geral do Orçamento Anual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Orçado: {formatarMoeda(totalOrcadoAnual)}</span>
                  <span className="text-muted-foreground">Realizado: {formatarMoeda(totalRealizadoAnual)} ({((totalRealizadoAnual / totalOrcadoAnual) * 100).toFixed(1)}%)</span>
                </div>
                <Progress 
                  value={calcularPercentualRealizacao(totalRealizadoAnual, totalOrcadoAnual)} 
                  className="h-2" 
                />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Variação</p>
                    <p className={`text-2xl font-bold ${totalRealizadoAnual - totalOrcadoAnual < 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatarMoeda(totalRealizadoAnual - totalOrcadoAnual)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Percentual</p>
                    <p className={`text-2xl font-bold ${totalRealizadoAnual - totalOrcadoAnual < 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {((totalRealizadoAnual - totalOrcadoAnual) / totalOrcadoAnual * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Visão Mensal ({mesSelecionado.charAt(0).toUpperCase() + mesSelecionado.slice(1)})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Orçado: {formatarMoeda(totalOrcadoMensal)}</span>
                  <span className="text-muted-foreground">Realizado: {formatarMoeda(totalRealizadoMensal)} ({((totalRealizadoMensal / totalOrcadoMensal) * 100).toFixed(1)}%)</span>
                </div>
                <Progress 
                  value={calcularPercentualRealizacao(totalRealizadoMensal, totalOrcadoMensal)} 
                  className="h-2" 
                />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Variação</p>
                    <p className={`text-2xl font-bold ${totalRealizadoMensal - totalOrcadoMensal < 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatarMoeda(totalRealizadoMensal - totalOrcadoMensal)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Percentual</p>
                    <p className={`text-2xl font-bold ${totalRealizadoMensal - totalOrcadoMensal < 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {((totalRealizadoMensal - totalOrcadoMensal) / totalOrcadoMensal * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Detalhamento por Categoria</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar categoria..."
                className="pl-8"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Análise
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="anual" className="space-y-4">
          <TabsList>
            <TabsTrigger value="anual">Visão Anual</TabsTrigger>
            <TabsTrigger value="mensal">Visão Mensal</TabsTrigger>
          </TabsList>
          
          <TabsContent value="anual">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Orçado (Anual)</TableHead>
                      <TableHead className="text-right">Realizado (Anual)</TableHead>
                      <TableHead className="text-right">% Realização</TableHead>
                      <TableHead className="text-right">Variação</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orcamentosFiltrados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          Nenhuma categoria encontrada com os filtros selecionados
                        </TableCell>
                      </TableRow>
                    ) : (
                      orcamentosFiltrados.map((orcamento) => (
                        <TableRow key={orcamento.id}>
                          <TableCell className="font-medium">{orcamento.categoria}</TableCell>
                          <TableCell className="text-right">{formatarMoeda(orcamento.orcadoAnual)}</TableCell>
                          <TableCell className="text-right">{formatarMoeda(orcamento.realizadoAnual)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <span className={orcamento.variacao > 0 ? 'text-red-500' : 'text-green-500'}>
                                {calcularPercentualRealizacao(orcamento.realizadoAnual, orcamento.orcadoAnual).toFixed(1)}%
                              </span>
                              <Progress 
                                value={calcularPercentualRealizacao(orcamento.realizadoAnual, orcamento.orcadoAnual)} 
                                className="h-2 w-24" 
                              />
                            </div>
                          </TableCell>
                          <TableCell className={`text-right ${orcamento.variacao > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {orcamento.variacao > 0 ? '+' : ''}{orcamento.variacao.toFixed(2)}%
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  Ações
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="cursor-pointer">
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                  <FileBarChart className="mr-2 h-4 w-4" />
                                  Ver Detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell className="font-bold">Total</TableCell>
                      <TableCell className="text-right font-bold">{formatarMoeda(totalOrcadoAnual)}</TableCell>
                      <TableCell className="text-right font-bold">{formatarMoeda(totalRealizadoAnual)}</TableCell>
                      <TableCell className="text-right font-bold">
                        {((totalRealizadoAnual / totalOrcadoAnual) * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell className={`text-right font-bold ${totalRealizadoAnual > totalOrcadoAnual ? 'text-red-500' : 'text-green-500'}`}>
                        {((totalRealizadoAnual - totalOrcadoAnual) / totalOrcadoAnual * 100).toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-right"></TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="mensal">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Orçado (Mensal)</TableHead>
                      <TableHead className="text-right">Realizado (Mensal)</TableHead>
                      <TableHead className="text-right">% Realização</TableHead>
                      <TableHead className="text-right">Variação</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orcamentosFiltrados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          Nenhuma categoria encontrada com os filtros selecionados
                        </TableCell>
                      </TableRow>
                    ) : (
                      orcamentosFiltrados.map((orcamento) => (
                        <TableRow key={orcamento.id}>
                          <TableCell className="font-medium">{orcamento.categoria}</TableCell>
                          <TableCell className="text-right">{formatarMoeda(orcamento.orcadoMensal)}</TableCell>
                          <TableCell className="text-right">{formatarMoeda(orcamento.realizadoMensal)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <span className={orcamento.variacao > 0 ? 'text-red-500' : 'text-green-500'}>
                                {calcularPercentualRealizacao(orcamento.realizadoMensal, orcamento.orcadoMensal).toFixed(1)}%
                              </span>
                              <Progress 
                                value={calcularPercentualRealizacao(orcamento.realizadoMensal, orcamento.orcadoMensal)} 
                                className="h-2 w-24" 
                              />
                            </div>
                          </TableCell>
                          <TableCell className={`text-right ${orcamento.variacao > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {orcamento.variacao > 0 ? '+' : ''}{orcamento.variacao.toFixed(2)}%
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  Ações
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="cursor-pointer">
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                  <FileBarChart className="mr-2 h-4 w-4" />
                                  Ver Detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell className="font-bold">Total</TableCell>
                      <TableCell className="text-right font-bold">{formatarMoeda(totalOrcadoMensal)}</TableCell>
                      <TableCell className="text-right font-bold">{formatarMoeda(totalRealizadoMensal)}</TableCell>
                      <TableCell className="text-right font-bold">
                        {((totalRealizadoMensal / totalOrcadoMensal) * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell className={`text-right font-bold ${totalRealizadoMensal > totalOrcadoMensal ? 'text-red-500' : 'text-green-500'}`}>
                        {((totalRealizadoMensal - totalOrcadoMensal) / totalOrcadoMensal * 100).toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-right"></TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}