'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calculator, ArrowLeft, Download } from 'lucide-react';
import { Link } from 'wouter';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

// Tipos de métodos de depreciação disponíveis
type DepreciationMethod = 'linear' | 'acelerada' | 'soma-digitos';

// Estrutura para armazenar os resultados da depreciação
interface DepreciationResult {
  ano: number;
  valorInicial: number;
  depreciacao: number;
  valorAcumulado: number;
  valorFinal: number;
}

export default function CalculadoraDepreciacaoPage() {
  // Estados para os inputs do formulário
  const [valorInicial, setValorInicial] = useState<number>(0);
  const [vidaUtil, setVidaUtil] = useState<number>(5);
  const [valorResidual, setValorResidual] = useState<number>(0);
  const [metodo, setMetodo] = useState<DepreciationMethod>('linear');
  const [taxaDepreciacao, setTaxaDepreciacao] = useState<number>(20);
  
  // Estado para os resultados calculados
  const [resultados, setResultados] = useState<DepreciationResult[]>([]);
  const [calculado, setCalculado] = useState<boolean>(false);

  // Calculadora de depreciação
  const calcularDepreciacao = () => {
    const resultadosCalculados: DepreciationResult[] = [];
    
    // Valor depreciável (valor inicial - valor residual)
    const valorDepreciavel = valorInicial - valorResidual;
    
    // Método linear (valor constante por período)
    if (metodo === 'linear') {
      const depreciacaoAnual = valorDepreciavel / vidaUtil;
      
      for (let ano = 1; ano <= vidaUtil; ano++) {
        const valorInicialAno = ano === 1 ? valorInicial : resultadosCalculados[ano - 2].valorFinal;
        const depreciacao = depreciacaoAnual;
        const valorAcumulado = ano * depreciacaoAnual;
        const valorFinal = valorInicial - valorAcumulado;
        
        resultadosCalculados.push({
          ano,
          valorInicial: valorInicialAno,
          depreciacao,
          valorAcumulado,
          valorFinal
        });
      }
    }
    // Método acelerado (percentual sobre o valor residual)
    else if (metodo === 'acelerada') {
      const taxa = taxaDepreciacao / 100;
      
      for (let ano = 1; ano <= vidaUtil; ano++) {
        const valorInicialAno = ano === 1 ? valorInicial : resultadosCalculados[ano - 2].valorFinal;
        const depreciacao = valorInicialAno * taxa;
        const valorAcumulado = ano === 1 ? depreciacao : resultadosCalculados[ano - 2].valorAcumulado + depreciacao;
        const valorFinal = valorInicialAno - depreciacao;
        
        resultadosCalculados.push({
          ano,
          valorInicial: valorInicialAno,
          depreciacao,
          valorAcumulado,
          valorFinal
        });
      }
    }
    // Método da soma dos dígitos
    else if (metodo === 'soma-digitos') {
      // Calcula a soma dos dígitos dos anos
      const somaDigitos = (vidaUtil * (vidaUtil + 1)) / 2;
      
      for (let ano = 1; ano <= vidaUtil; ano++) {
        const fator = (vidaUtil - ano + 1) / somaDigitos;
        const depreciacao = valorDepreciavel * fator;
        const valorAcumulado = ano === 1 ? depreciacao : resultadosCalculados[ano - 2].valorAcumulado + depreciacao;
        const valorInicialAno = ano === 1 ? valorInicial : resultadosCalculados[ano - 2].valorFinal;
        const valorFinal = valorInicialAno - depreciacao;
        
        resultadosCalculados.push({
          ano,
          valorInicial: valorInicialAno,
          depreciacao,
          valorAcumulado,
          valorFinal
        });
      }
    }
    
    setResultados(resultadosCalculados);
    setCalculado(true);
  };

  // Função para formatar valores monetários
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        heading="Calculadora de Depreciação"
        text="Calcule a depreciação de ativos com diferentes métodos."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/organization/patrimonio/depreciacao">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Link>
          </Button>
        </div>
      </PageHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Parâmetros de Cálculo</CardTitle>
            <CardDescription>
              Defina os valores para calcular a depreciação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="valorInicial">Valor Inicial (R$)</Label>
              <Input
                id="valorInicial"
                type="number"
                min="0"
                step="100"
                value={valorInicial}
                onChange={(e) => setValorInicial(Number(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="valorResidual">Valor Residual (R$)</Label>
              <Input
                id="valorResidual"
                type="number"
                min="0"
                step="100"
                value={valorResidual}
                onChange={(e) => setValorResidual(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Valor estimado do bem ao final de sua vida útil
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vidaUtil">Vida Útil (anos)</Label>
              <Input
                id="vidaUtil"
                type="number"
                min="1"
                max="50"
                value={vidaUtil}
                onChange={(e) => setVidaUtil(Number(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="metodo">Método de Depreciação</Label>
              <Select 
                value={metodo} 
                onValueChange={(value) => setMetodo(value as DepreciationMethod)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">Linear (Linha Reta)</SelectItem>
                  <SelectItem value="acelerada">Saldo Decrescente</SelectItem>
                  <SelectItem value="soma-digitos">Soma dos Dígitos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {metodo === 'acelerada' && (
              <div className="space-y-2">
                <Label htmlFor="taxaDepreciacao">Taxa de Depreciação (%)</Label>
                <Input
                  id="taxaDepreciacao"
                  type="number"
                  min="1"
                  max="100"
                  value={taxaDepreciacao}
                  onChange={(e) => setTaxaDepreciacao(Number(e.target.value))}
                />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={calcularDepreciacao} className="w-full">
              <Calculator className="mr-2 h-4 w-4" /> Calcular Depreciação
            </Button>
          </CardFooter>
        </Card>
      
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
            <CardDescription>
              Depreciação calculada ao longo da vida útil
            </CardDescription>
          </CardHeader>
          <CardContent>
            {calculado ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="text-sm font-medium">Valor Depreciável</h4>
                    <p className="text-2xl font-bold">{formatarMoeda(valorInicial - valorResidual)}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="text-sm font-medium">Depreciação Total</h4>
                    <p className="text-2xl font-bold">{formatarMoeda(resultados[resultados.length - 1].valorAcumulado)}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="text-sm font-medium">Valor Final</h4>
                    <p className="text-2xl font-bold">{formatarMoeda(resultados[resultados.length - 1].valorFinal)}</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableCaption>Tabela de depreciação anual</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ano</TableHead>
                        <TableHead>Valor Inicial</TableHead>
                        <TableHead>Depreciação</TableHead>
                        <TableHead>Depreciação Acumulada</TableHead>
                        <TableHead>Valor Final</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resultados.map((resultado) => (
                        <TableRow key={resultado.ano}>
                          <TableCell>{resultado.ano}</TableCell>
                          <TableCell>{formatarMoeda(resultado.valorInicial)}</TableCell>
                          <TableCell>{formatarMoeda(resultado.depreciacao)}</TableCell>
                          <TableCell>{formatarMoeda(resultado.valorAcumulado)}</TableCell>
                          <TableCell>{formatarMoeda(resultado.valorFinal)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Exportar para Excel
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Sem resultados para exibir</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Preencha os campos ao lado e clique em "Calcular Depreciação"
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}