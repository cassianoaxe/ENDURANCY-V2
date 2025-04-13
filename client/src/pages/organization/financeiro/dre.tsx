'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableFooter } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, BarChart2, FileBarChart, Printer, Share2 } from 'lucide-react';

// Dados de exemplo para o DRE
const DRE_DATA = {
  mes: {
    // Receitas operacionais
    receitas: 120000,
    descontos: 5000,
    impostos: 12000,
    receitaLiquida: 103000,

    // Custos operacionais
    custosProdutos: 35000,
    custoServicos: 15000,
    totalCustos: 50000,
    
    // Lucro bruto
    lucroBruto: 53000,
    
    // Despesas operacionais
    despesasAdministrativas: 22000,
    despesasComerciais: 8000,
    despesasRH: 16000,
    despesasFinanceiras: 5000,
    totalDespesas: 51000,
    
    // Resultado operacional
    resultadoOperacional: 2000,
    
    // Outras receitas e despesas
    receitasFinanceiras: 1500,
    outrasReceitas: 500,
    outrasDespesas: 800,
    
    // Resultado antes do IR/CS
    resultadoAntesImpostos: 3200,
    
    // Impostos sobre o lucro
    ir: 480,
    cs: 288,
    
    // Resultado líquido
    resultadoLiquido: 2432,
  },
  trimestre: {
    // Receitas operacionais
    receitas: 360000,
    descontos: 15000,
    impostos: 36000,
    receitaLiquida: 309000,

    // Custos operacionais
    custosProdutos: 105000,
    custoServicos: 45000,
    totalCustos: 150000,
    
    // Lucro bruto
    lucroBruto: 159000,
    
    // Despesas operacionais
    despesasAdministrativas: 66000,
    despesasComerciais: 24000,
    despesasRH: 48000,
    despesasFinanceiras: 15000,
    totalDespesas: 153000,
    
    // Resultado operacional
    resultadoOperacional: 6000,
    
    // Outras receitas e despesas
    receitasFinanceiras: 4500,
    outrasReceitas: 1500,
    outrasDespesas: 2400,
    
    // Resultado antes do IR/CS
    resultadoAntesImpostos: 9600,
    
    // Impostos sobre o lucro
    ir: 1440,
    cs: 864,
    
    // Resultado líquido
    resultadoLiquido: 7296,
  },
  ano: {
    // Receitas operacionais
    receitas: 1440000,
    descontos: 60000,
    impostos: 144000,
    receitaLiquida: 1236000,

    // Custos operacionais
    custosProdutos: 420000,
    custoServicos: 180000,
    totalCustos: 600000,
    
    // Lucro bruto
    lucroBruto: 636000,
    
    // Despesas operacionais
    despesasAdministrativas: 264000,
    despesasComerciais: 96000,
    despesasRH: 192000,
    despesasFinanceiras: 60000,
    totalDespesas: 612000,
    
    // Resultado operacional
    resultadoOperacional: 24000,
    
    // Outras receitas e despesas
    receitasFinanceiras: 18000,
    outrasReceitas: 6000,
    outrasDespesas: 9600,
    
    // Resultado antes do IR/CS
    resultadoAntesImpostos: 38400,
    
    // Impostos sobre o lucro
    ir: 5760,
    cs: 3456,
    
    // Resultado líquido
    resultadoLiquido: 29184,
  }
};

export default function DRE() {
  const [periodo, setPeriodo] = useState<'mes' | 'trimestre' | 'ano'>('mes');
  const [periodoTexto, setPeriodoTexto] = useState<string>('Abril 2025');
  
  // Formatar valores monetários
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0, // Sem casas decimais para valores grandes
    }).format(valor);
  };
  
  // Formatar porcentagens
  const formatarPorcentagem = (valor: number, total: number) => {
    if (total === 0) return '0,00%';
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor / total);
  };
  
  // Obter dados do período selecionado
  const dados = DRE_DATA[periodo];
  
  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">DRE - Demonstrativo de Resultados</h1>
            <p className="text-muted-foreground">
              Análise da performance financeira da sua organização
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={periodo} onValueChange={(value) => setPeriodo(value as 'mes' | 'trimestre' | 'ano')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mes">Mensal</SelectItem>
                <SelectItem value="trimestre">Trimestral</SelectItem>
                <SelectItem value="ano">Anual</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={periodoTexto} onValueChange={setPeriodoTexto}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Abril 2025">Abril 2025</SelectItem>
                <SelectItem value="1º Trimestre 2025">1º Trimestre 2025</SelectItem>
                <SelectItem value="2025">Ano 2025</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" className="gap-2">
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
            
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Receita Bruta</p>
                  <p className="text-2xl font-bold">{formatarMoeda(dados.receitas)}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileBarChart className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Lucro Bruto</p>
                  <p className="text-2xl font-bold">{formatarMoeda(dados.lucroBruto)}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <BarChart2 className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Resultado Líquido</p>
                  <p className="text-2xl font-bold">{formatarMoeda(dados.resultadoLiquido)}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <FileBarChart className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Demonstrativo de Resultados - {periodoTexto}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="resumido" className="space-y-4">
              <TabsList>
                <TabsTrigger value="resumido">Resumido</TabsTrigger>
                <TabsTrigger value="detalhado">Detalhado</TabsTrigger>
              </TabsList>
              
              <TabsContent value="resumido">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/2">Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>% Receita</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-bold">Receita Bruta</TableCell>
                      <TableCell>{formatarMoeda(dados.receitas)}</TableCell>
                      <TableCell>100,00%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>(-) Deduções da Receita</TableCell>
                      <TableCell>{formatarMoeda(dados.descontos + dados.impostos)}</TableCell>
                      <TableCell>{formatarPorcentagem(dados.descontos + dados.impostos, dados.receitas)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-bold">Receita Líquida</TableCell>
                      <TableCell>{formatarMoeda(dados.receitaLiquida)}</TableCell>
                      <TableCell>{formatarPorcentagem(dados.receitaLiquida, dados.receitas)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>(-) Custos Operacionais</TableCell>
                      <TableCell>{formatarMoeda(dados.totalCustos)}</TableCell>
                      <TableCell>{formatarPorcentagem(dados.totalCustos, dados.receitas)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-bold">Lucro Bruto</TableCell>
                      <TableCell>{formatarMoeda(dados.lucroBruto)}</TableCell>
                      <TableCell>{formatarPorcentagem(dados.lucroBruto, dados.receitas)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>(-) Despesas Operacionais</TableCell>
                      <TableCell>{formatarMoeda(dados.totalDespesas)}</TableCell>
                      <TableCell>{formatarPorcentagem(dados.totalDespesas, dados.receitas)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-bold">Resultado Operacional</TableCell>
                      <TableCell
                        className={dados.resultadoOperacional >= 0 ? "text-green-600" : "text-red-600"}
                      >
                        {formatarMoeda(dados.resultadoOperacional)}
                      </TableCell>
                      <TableCell>{formatarPorcentagem(dados.resultadoOperacional, dados.receitas)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Resultado Financeiro</TableCell>
                      <TableCell>{formatarMoeda(dados.receitasFinanceiras - dados.despesasFinanceiras)}</TableCell>
                      <TableCell>{formatarPorcentagem(dados.receitasFinanceiras - dados.despesasFinanceiras, dados.receitas)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Outras Receitas e Despesas</TableCell>
                      <TableCell>{formatarMoeda(dados.outrasReceitas - dados.outrasDespesas)}</TableCell>
                      <TableCell>{formatarPorcentagem(dados.outrasReceitas - dados.outrasDespesas, dados.receitas)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-bold">Resultado Antes dos Impostos</TableCell>
                      <TableCell>{formatarMoeda(dados.resultadoAntesImpostos)}</TableCell>
                      <TableCell>{formatarPorcentagem(dados.resultadoAntesImpostos, dados.receitas)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>(-) IR e CS</TableCell>
                      <TableCell>{formatarMoeda(dados.ir + dados.cs)}</TableCell>
                      <TableCell>{formatarPorcentagem(dados.ir + dados.cs, dados.receitas)}</TableCell>
                    </TableRow>
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell className="font-bold">Resultado Líquido do Período</TableCell>
                      <TableCell
                        className={dados.resultadoLiquido >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}
                      >
                        {formatarMoeda(dados.resultadoLiquido)}
                      </TableCell>
                      <TableCell>{formatarPorcentagem(dados.resultadoLiquido, dados.receitas)}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </TabsContent>
              
              <TabsContent value="detalhado">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/2">Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>% Receita</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Receitas */}
                    <TableRow className="bg-gray-50">
                      <TableCell className="font-bold">1. RECEITA BRUTA OPERACIONAL</TableCell>
                      <TableCell>{formatarMoeda(dados.receitas)}</TableCell>
                      <TableCell>100,00%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-8">(-) Descontos e Devoluções</TableCell>
                      <TableCell>{formatarMoeda(dados.descontos)}</TableCell>
                      <TableCell>{formatarPorcentagem(dados.descontos, dados.receitas)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-8">(-) Impostos sobre Vendas</TableCell>
                      <TableCell>{formatarMoeda(dados.impostos)}</TableCell>
                      <TableCell>{formatarPorcentagem(dados.impostos, dados.receitas)}</TableCell>
                    </TableRow>
                    <TableRow className="bg-gray-50">
                      <TableCell className="font-bold">2. RECEITA LÍQUIDA</TableCell>
                      <TableCell>{formatarMoeda(dados.receitaLiquida)}</TableCell>
                      <TableCell>{formatarPorcentagem(dados.receitaLiquida, dados.receitas)}</TableCell>
                    </TableRow>
                    
                    {/* Custos */}
                    <TableRow>
                      <TableCell className="pl-8">(-) Custos de Produtos</TableCell>
                      <TableCell>{formatarMoeda(dados.custosProdutos)}</TableCell>
                      <TableCell>{formatarPorcentagem(dados.custosProdutos, dados.receitas)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-8">(-) Custos de Serviços</TableCell>
                      <TableCell>{formatarMoeda(dados.custoServicos)}</TableCell>
                      <TableCell>{formatarPorcentagem(dados.custoServicos, dados.receitas)}</TableCell>
                    </TableRow>
                    <TableRow className="bg-gray-50">
                      <TableCell className="font-bold">3. LUCRO BRUTO</TableCell>
                      <TableCell>{formatarMoeda(dados.lucroBruto)}</TableCell>
                      <TableCell>{formatarPorcentagem(dados.lucroBruto, dados.receitas)}</TableCell>
                    </TableRow>
                    
                    {/* Despesas Operacionais */}
                    <TableRow>
                      <TableCell className="pl-8">(-) Despesas Administrativas</TableCell>
                      <TableCell>{formatarMoeda(dados.despesasAdministrativas)}</TableCell>
                      <TableCell>{formatarPorcentagem(dados.despesasAdministrativas, dados.receitas)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-8">(-) Despesas Comerciais</TableCell>
                      <TableCell>{formatarMoeda(dados.despesasComerciais)}</TableCell>
                      <TableCell>{formatarPorcentagem(dados.despesasComerciais, dados.receitas)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-8">(-) Despesas com Pessoal</TableCell>
                      <TableCell>{formatarMoeda(dados.despesasRH)}</TableCell>
                      <TableCell>{formatarPorcentagem(dados.despesasRH, dados.receitas)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-8">(-) Despesas Financeiras</TableCell>
                      <TableCell>{formatarMoeda(dados.despesasFinanceiras)}</TableCell>
                      <TableCell>{formatarPorcentagem(dados.despesasFinanceiras, dados.receitas)}</TableCell>
                    </TableRow>
                    <TableRow className="bg-gray-50">
                      <TableCell className="font-bold">4. RESULTADO OPERACIONAL</TableCell>
                      <TableCell
                        className={dados.resultadoOperacional >= 0 ? "text-green-600" : "text-red-600"}
                      >
                        {formatarMoeda(dados.resultadoOperacional)}
                      </TableCell>
                      <TableCell>{formatarPorcentagem(dados.resultadoOperacional, dados.receitas)}</TableCell>
                    </TableRow>
                    
                    {/* Resultados Não Operacionais */}
                    <TableRow>
                      <TableCell className="pl-8">(+) Receitas Financeiras</TableCell>
                      <TableCell>{formatarMoeda(dados.receitasFinanceiras)}</TableCell>
                      <TableCell>{formatarPorcentagem(dados.receitasFinanceiras, dados.receitas)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-8">(+) Outras Receitas</TableCell>
                      <TableCell>{formatarMoeda(dados.outrasReceitas)}</TableCell>
                      <TableCell>{formatarPorcentagem(dados.outrasReceitas, dados.receitas)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-8">(-) Outras Despesas</TableCell>
                      <TableCell>{formatarMoeda(dados.outrasDespesas)}</TableCell>
                      <TableCell>{formatarPorcentagem(dados.outrasDespesas, dados.receitas)}</TableCell>
                    </TableRow>
                    <TableRow className="bg-gray-50">
                      <TableCell className="font-bold">5. RESULTADO ANTES DOS IMPOSTOS</TableCell>
                      <TableCell>{formatarMoeda(dados.resultadoAntesImpostos)}</TableCell>
                      <TableCell>{formatarPorcentagem(dados.resultadoAntesImpostos, dados.receitas)}</TableCell>
                    </TableRow>
                    
                    {/* Impostos */}
                    <TableRow>
                      <TableCell className="pl-8">(-) Imposto de Renda</TableCell>
                      <TableCell>{formatarMoeda(dados.ir)}</TableCell>
                      <TableCell>{formatarPorcentagem(dados.ir, dados.receitas)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-8">(-) Contribuição Social</TableCell>
                      <TableCell>{formatarMoeda(dados.cs)}</TableCell>
                      <TableCell>{formatarPorcentagem(dados.cs, dados.receitas)}</TableCell>
                    </TableRow>
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell className="font-bold">6. RESULTADO LÍQUIDO DO PERÍODO</TableCell>
                      <TableCell
                        className={dados.resultadoLiquido >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}
                      >
                        {formatarMoeda(dados.resultadoLiquido)}
                      </TableCell>
                      <TableCell>{formatarPorcentagem(dados.resultadoLiquido, dados.receitas)}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
}