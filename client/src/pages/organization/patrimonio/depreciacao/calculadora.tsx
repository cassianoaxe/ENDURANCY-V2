'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, FileDown, ArrowLeft, Calendar, Printer } from 'lucide-react';
import { Link } from 'wouter';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader, PageSubHeader } from '@/components/page-header';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Schema para validação do formulário
const formSchema = z.object({
  assetId: z.string().optional(),
  valorInicial: z.string().transform((val) => parseFloat(val.replace('.', '').replace(',', '.'))),
  vidaUtil: z.string().transform((val) => parseInt(val)),
  taxaDepreciacao: z.string().transform((val) => parseFloat(val.replace(',', '.'))),
  dataInicio: z.string(),
  metodoDepreciacao: z.enum(['linear', 'soma_digitos', 'saldo_decrescente', 'unidades_produzidas', 'horas_trabalho']),
  valorResidual: z.string().transform((val) => parseFloat(val.replace('.', '').replace(',', '.'))),
  salvarHistorico: z.boolean().default(false),
  unidadesProduzidas: z.string().transform((val) => parseInt(val)).optional(),
  horasTrabalho: z.string().transform((val) => parseInt(val)).optional(),
  taxaSaldoDecrescente: z.string().transform((val) => parseFloat(val.replace(',', '.'))).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CalculadoraDepreciacao() {
  const { toast } = useToast();
  const [resultados, setResultados] = useState<any[]>([]);
  const [anos, setAnos] = useState<number[]>([]);
  const [calculoRealizado, setCalculoRealizado] = useState(false);
  const [metodoAtual, setMetodoAtual] = useState<string>('linear');
  
  // Consulta de ativos para o select
  const {
    data: ativos,
    isLoading: isLoadingAtivos
  } = useQuery({
    queryKey: ['/api/patrimonio/ativos'],
  });

  // Formulário com validação
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      valorInicial: '',
      vidaUtil: '10',
      taxaDepreciacao: '10',
      dataInicio: new Date().toISOString().split('T')[0],
      metodoDepreciacao: 'linear',
      valorResidual: '0',
      salvarHistorico: false,
      unidadesProduzidas: '',
      horasTrabalho: '',
      taxaSaldoDecrescente: '20'
    },
  });

  // Lidar com mudança no método de depreciação
  const metodoDepreciacao = form.watch('metodoDepreciacao');
  if (metodoDepreciacao !== metodoAtual) {
    setMetodoAtual(metodoDepreciacao);
  }
  
  // Lidar com a seleção de um ativo existente
  const handleAssetSelection = (assetId: string) => {
    const selectedAsset = ativos?.find((asset: any) => asset.id.toString() === assetId);
    if (selectedAsset) {
      form.setValue('valorInicial', selectedAsset.acquisitionValue?.toString() || '0');
      form.setValue('vidaUtil', selectedAsset.usefulLifeYears?.toString() || '10');
      form.setValue('taxaDepreciacao', selectedAsset.depreciationRate?.toString() || '10');
      form.setValue('valorResidual', selectedAsset.residualValue?.toString() || '0');
      form.setValue('dataInicio', selectedAsset.acquisitionDate?.split('T')[0] || new Date().toISOString().split('T')[0]);
      form.setValue('metodoDepreciacao', selectedAsset.depreciationMethod || 'linear');
    }
  };

  // Mutation para salvar o histórico de depreciação
  const salvarHistoricoMutation = useMutation({
    mutationFn: async (data: any) => {
      return fetch('/api/patrimonio/depreciacao/salvar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then(response => {
        if (!response.ok) {
          throw new Error('Falha ao salvar histórico');
        }
        return response.json();
      });
    },
    onSuccess: () => {
      toast({
        title: 'Histórico de depreciação salvo com sucesso!',
        description: 'Os valores de depreciação foram salvos no banco de dados.',
      });
      
      // Invalidar as queries para recarregar os dados depois
      // No ambiente de produção teria integração com queryClient
    },
    onError: (error) => {
      toast({
        title: 'Erro ao salvar histórico de depreciação',
        description: 'Ocorreu um erro ao tentar salvar os valores de depreciação.',
        variant: 'destructive'
      });
      console.error('Erro ao salvar depreciação:', error);
    }
  });

  // Função que calcula a depreciação
  const calcularDepreciacao = (values: FormValues) => {
    const {
      valorInicial,
      vidaUtil,
      taxaDepreciacao,
      dataInicio,
      metodoDepreciacao,
      valorResidual,
      unidadesProduzidas,
      horasTrabalho,
      taxaSaldoDecrescente
    } = values;

    const valorDepreciavel = valorInicial - valorResidual;
    const depreciacao = [];
    const anosArray = [];
    const dataInicioObj = new Date(dataInicio);
    const anoInicio = dataInicioObj.getFullYear();
    const mesInicio = dataInicioObj.getMonth();
    
    // Fator para cálculo proporcional no primeiro ano (meses restantes / 12)
    const fatorPrimeiroAno = (12 - mesInicio) / 12;

    let valorAtual = valorInicial;
    let depreciacionAcumulada = 0;

    switch (metodoDepreciacao) {
      case 'linear':
        // Deprecração linear (valor depreciável / vida útil)
        for (let i = 0; i <= vidaUtil; i++) {
          const ano = anoInicio + i;
          anosArray.push(ano);
          
          if (i === 0) {
            // Ano de aquisição (sem depreciação)
            depreciacao.push({
              ano,
              valorInicial: valorInicial.toFixed(2),
              depreciacaoAnual: '0.00',
              depreciacaoAcumulada: '0.00',
              valorContabil: valorInicial.toFixed(2)
            });
          } else {
            let valorDepreciado;
            
            if (i === 1) {
              // Primeiro ano - depreciação proporcional
              valorDepreciado = (valorDepreciavel / vidaUtil) * fatorPrimeiroAno;
            } else if (i === vidaUtil + 1 - Math.floor(fatorPrimeiroAno)) {
              // Último ano - ajuste para completar o valor depreciável
              valorDepreciado = valorDepreciavel - depreciacionAcumulada;
            } else {
              // Anos completos
              valorDepreciado = valorDepreciavel / vidaUtil;
            }
            
            depreciacionAcumulada += valorDepreciado;
            valorAtual = valorInicial - depreciacionAcumulada;
            
            // Garantir que não deprecie abaixo do valor residual
            if (valorAtual < valorResidual) {
              valorAtual = valorResidual;
              depreciacionAcumulada = valorInicial - valorResidual;
            }
            
            depreciacao.push({
              ano,
              valorInicial: valorInicial.toFixed(2),
              depreciacaoAnual: valorDepreciado.toFixed(2),
              depreciacaoAcumulada: depreciacionAcumulada.toFixed(2),
              valorContabil: valorAtual.toFixed(2)
            });
          }
          
          // Parar quando atingir o valor residual
          if (valorAtual <= valorResidual) break;
        }
        break;
        
      case 'soma_digitos':
        // Método da soma dos dígitos dos anos
        const somaDigitos = (vidaUtil * (vidaUtil + 1)) / 2;
        let digitosRestantes = vidaUtil;
        
        for (let i = 0; i <= vidaUtil; i++) {
          const ano = anoInicio + i;
          anosArray.push(ano);
          
          if (i === 0) {
            // Ano de aquisição (sem depreciação)
            depreciacao.push({
              ano,
              valorInicial: valorInicial.toFixed(2),
              depreciacaoAnual: '0.00',
              depreciacaoAcumulada: '0.00',
              valorContabil: valorInicial.toFixed(2)
            });
          } else {
            let valorDepreciado;
            
            if (i === 1) {
              // Primeiro ano - proporcional
              valorDepreciado = (valorDepreciavel * (digitosRestantes / somaDigitos)) * fatorPrimeiroAno;
            } else {
              // Anos seguintes
              digitosRestantes--;
              valorDepreciado = valorDepreciavel * (digitosRestantes / somaDigitos);
            }
            
            depreciacionAcumulada += valorDepreciado;
            valorAtual = valorInicial - depreciacionAcumulada;
            
            // Garantir que não deprecie abaixo do valor residual
            if (valorAtual < valorResidual) {
              valorAtual = valorResidual;
              depreciacionAcumulada = valorInicial - valorResidual;
            }
            
            depreciacao.push({
              ano,
              valorInicial: valorInicial.toFixed(2),
              depreciacaoAnual: valorDepreciado.toFixed(2),
              depreciacaoAcumulada: depreciacionAcumulada.toFixed(2),
              valorContabil: valorAtual.toFixed(2)
            });
          }
          
          // Parar quando atingir o valor residual
          if (valorAtual <= valorResidual) break;
        }
        break;
        
      case 'saldo_decrescente':
        // Método do saldo decrescente
        const taxa = taxaSaldoDecrescente ? taxaSaldoDecrescente / 100 : 0.2; // Taxa padrão de 20%
        
        for (let i = 0; i <= vidaUtil * 2; i++) { // Multiplicamos por 2 pois pode demorar mais para depreciar totalmente
          const ano = anoInicio + i;
          anosArray.push(ano);
          
          if (i === 0) {
            // Ano de aquisição (sem depreciação)
            depreciacao.push({
              ano,
              valorInicial: valorInicial.toFixed(2),
              depreciacaoAnual: '0.00',
              depreciacaoAcumulada: '0.00',
              valorContabil: valorInicial.toFixed(2)
            });
          } else {
            let valorDepreciado;
            
            if (i === 1) {
              // Primeiro ano - proporcional
              valorDepreciado = valorAtual * taxa * fatorPrimeiroAno;
            } else {
              // Anos seguintes - aplica-se a taxa sobre o valor contábil atual
              valorDepreciado = valorAtual * taxa;
            }
            
            depreciacionAcumulada += valorDepreciado;
            valorAtual = valorInicial - depreciacionAcumulada;
            
            // Garantir que não deprecie abaixo do valor residual
            if (valorAtual < valorResidual) {
              valorAtual = valorResidual;
              depreciacionAcumulada = valorInicial - valorResidual;
            }
            
            depreciacao.push({
              ano,
              valorInicial: valorInicial.toFixed(2),
              depreciacaoAnual: valorDepreciado.toFixed(2),
              depreciacaoAcumulada: depreciacionAcumulada.toFixed(2),
              valorContabil: valorAtual.toFixed(2)
            });
          }
          
          // Parar quando atingir o valor residual
          if (valorAtual <= valorResidual || i > 30) break; // Limite de 30 anos para evitar loops infinitos
        }
        break;
        
      case 'unidades_produzidas':
        // Método das unidades produzidas
        if (!unidadesProduzidas) break;
        
        const depreciacaoPorUnidade = valorDepreciavel / unidadesProduzidas;
        const unidadesPorAno = Math.ceil(unidadesProduzidas / vidaUtil); // Distribuição uniforme como exemplo
        
        for (let i = 0; i <= vidaUtil; i++) {
          const ano = anoInicio + i;
          anosArray.push(ano);
          
          if (i === 0) {
            // Ano de aquisição (sem depreciação)
            depreciacao.push({
              ano,
              valorInicial: valorInicial.toFixed(2),
              depreciacaoAnual: '0.00',
              depreciacaoAcumulada: '0.00',
              valorContabil: valorInicial.toFixed(2),
              unidades: 0
            });
          } else {
            // Unidades no período atual (pode variar por ano em um caso real)
            const unidadesNoPeriodo = i === 1 
              ? Math.ceil(unidadesPorAno * fatorPrimeiroAno) 
              : unidadesPorAno;
              
            const valorDepreciado = depreciacaoPorUnidade * unidadesNoPeriodo;
            
            depreciacionAcumulada += valorDepreciado;
            valorAtual = valorInicial - depreciacionAcumulada;
            
            // Garantir que não deprecie abaixo do valor residual
            if (valorAtual < valorResidual) {
              valorAtual = valorResidual;
              depreciacionAcumulada = valorInicial - valorResidual;
            }
            
            depreciacao.push({
              ano,
              valorInicial: valorInicial.toFixed(2),
              depreciacaoAnual: valorDepreciado.toFixed(2),
              depreciacaoAcumulada: depreciacionAcumulada.toFixed(2),
              valorContabil: valorAtual.toFixed(2),
              unidades: unidadesNoPeriodo
            });
          }
          
          // Parar quando atingir o valor residual
          if (valorAtual <= valorResidual) break;
        }
        break;
        
      case 'horas_trabalho':
        // Método das horas de trabalho
        if (!horasTrabalho) break;
        
        const depreciacaoPorHora = valorDepreciavel / horasTrabalho;
        const horasPorAno = Math.ceil(horasTrabalho / vidaUtil); // Distribuição uniforme como exemplo
        
        for (let i = 0; i <= vidaUtil; i++) {
          const ano = anoInicio + i;
          anosArray.push(ano);
          
          if (i === 0) {
            // Ano de aquisição (sem depreciação)
            depreciacao.push({
              ano,
              valorInicial: valorInicial.toFixed(2),
              depreciacaoAnual: '0.00',
              depreciacaoAcumulada: '0.00',
              valorContabil: valorInicial.toFixed(2),
              horas: 0
            });
          } else {
            // Horas no período atual (pode variar por ano em um caso real)
            const horasNoPeriodo = i === 1 
              ? Math.ceil(horasPorAno * fatorPrimeiroAno) 
              : horasPorAno;
              
            const valorDepreciado = depreciacaoPorHora * horasNoPeriodo;
            
            depreciacionAcumulada += valorDepreciado;
            valorAtual = valorInicial - depreciacionAcumulada;
            
            // Garantir que não deprecie abaixo do valor residual
            if (valorAtual < valorResidual) {
              valorAtual = valorResidual;
              depreciacionAcumulada = valorInicial - valorResidual;
            }
            
            depreciacao.push({
              ano,
              valorInicial: valorInicial.toFixed(2),
              depreciacaoAnual: valorDepreciado.toFixed(2),
              depreciacaoAcumulada: depreciacionAcumulada.toFixed(2),
              valorContabil: valorAtual.toFixed(2),
              horas: horasNoPeriodo
            });
          }
          
          // Parar quando atingir o valor residual
          if (valorAtual <= valorResidual) break;
        }
        break;
    }

    setResultados(depreciacao);
    setAnos(anosArray);
    setCalculoRealizado(true);
  };
  
  // Handler para submissão do formulário
  const onSubmit = (values: FormValues) => {
    calcularDepreciacao(values);
    
    toast({
      title: 'Cálculo de depreciação realizado',
      description: 'A depreciação foi calculada com sucesso!',
    });

    // Se a opção de salvar histórico estiver marcada e um ativo selecionado
    if (values.salvarHistorico && values.assetId) {
      // Vai ser implementado quando a API estiver pronta
      toast({
        title: 'Salvamento de histórico',
        description: 'Esta funcionalidade estará disponível em breve.',
      });
    }
  };
  
  // Função para exportar a tabela como CSV
  const exportarCSV = () => {
    if (resultados.length === 0) return;
    
    // Cabeçalhos do CSV
    let csv = 'Ano,Valor Inicial,Depreciação Anual,Depreciação Acumulada,Valor Contábil\n';
    
    // Dados 
    resultados.forEach(item => {
      csv += `${item.ano},${item.valorInicial},${item.depreciacaoAnual},${item.depreciacaoAcumulada},${item.valorContabil}\n`;
    });
    
    // Criar um blob e download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `depreciacao_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };
  
  // Função para imprimir a tabela
  const imprimir = () => {
    const conteudo = document.getElementById('tabela-depreciacao');
    if (!conteudo) return;
    
    const janelaImpressao = window.open('', '_blank');
    if (!janelaImpressao) return;
    
    janelaImpressao.document.write(`
      <html>
      <head>
        <title>Depreciação Anual</title>
        <style>
          body { font-family: Arial, sans-serif; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          h1 { text-align: center; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Relatório de Depreciação Anual</h1>
        <p>Método de depreciação: ${metodoAtual}</p>
        <p>Data de cálculo: ${new Date().toLocaleDateString('pt-BR')}</p>
        ${conteudo.outerHTML}
        <div class="footer">
          <p>Relatório gerado em ${new Date().toLocaleString('pt-BR')}</p>
        </div>
      </body>
      </html>
    `);
    
    janelaImpressao.document.close();
    janelaImpressao.focus();
    janelaImpressao.print();
  };

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        heading="Calculadora de Depreciação"
        text="Calcule a depreciação anual dos seus ativos por diferentes métodos."
      >
        <Button variant="outline" asChild>
          <Link to="/organization/patrimonio/depreciacao">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Parâmetros de Cálculo</CardTitle>
            <CardDescription>
              Preencha os dados para calcular a depreciação do ativo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="assetId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ativo (opcional)</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleAssetSelection(value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um ativo existente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Novo cálculo manual</SelectItem>
                          {!isLoadingAtivos &&
                            ativos?.map((ativo: any) => (
                              <SelectItem key={ativo.id} value={ativo.id.toString()}>
                                {ativo.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Selecione um ativo para preencher automaticamente ou deixe em branco para cálculo manual
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metodoDepreciacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de Depreciação</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o método" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="linear">Método Linear</SelectItem>
                          <SelectItem value="soma_digitos">Soma dos Dígitos</SelectItem>
                          <SelectItem value="saldo_decrescente">Saldo Decrescente</SelectItem>
                          <SelectItem value="unidades_produzidas">Unidades Produzidas</SelectItem>
                          <SelectItem value="horas_trabalho">Horas de Trabalho</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Escolha o método de cálculo da depreciação
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valorInicial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Inicial (R$)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0,00"
                          {...field}
                          onChange={(e) => {
                            // Formatar como moeda
                            let value = e.target.value.replace(/\D/g, '');
                            if (value) {
                              value = (parseInt(value) / 100).toFixed(2);
                              value = value.replace('.', ',');
                              value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                            }
                            field.onChange(value || '');
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Valor de aquisição do ativo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valorResidual"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Residual (R$)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0,00"
                          {...field}
                          onChange={(e) => {
                            // Formatar como moeda
                            let value = e.target.value.replace(/\D/g, '');
                            if (value) {
                              value = (parseInt(value) / 100).toFixed(2);
                              value = value.replace('.', ',');
                              value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                            }
                            field.onChange(value || '');
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Valor estimado ao final da vida útil
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vidaUtil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vida Útil (anos)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="10"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Período estimado de utilização do ativo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataInicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Início</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Data de aquisição ou início da depreciação
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {metodoAtual === 'unidades_produzidas' && (
                  <FormField
                    control={form.control}
                    name="unidadesProduzidas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total de Unidades</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="10000"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Estimativa total de unidades a serem produzidas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {metodoAtual === 'horas_trabalho' && (
                  <FormField
                    control={form.control}
                    name="horasTrabalho"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total de Horas</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="20000"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Estimativa total de horas de operação
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {metodoAtual === 'saldo_decrescente' && (
                  <FormField
                    control={form.control}
                    name="taxaSaldoDecrescente"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taxa Saldo Decrescente (%)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="20,00"
                            {...field}
                            onChange={(e) => {
                              // Formatar como percentual
                              let value = e.target.value.replace(/[^0-9,]/g, '');
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Taxa aplicada anualmente sobre o valor contábil atual
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {form.watch('assetId') && (
                  <FormField
                    control={form.control}
                    name="salvarHistorico"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Salvar Histórico
                          </FormLabel>
                          <FormDescription>
                            Salvar o histórico de depreciação deste ativo no banco de dados
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                )}

                <Button type="submit" className="w-full">
                  <Calculator className="mr-2 h-4 w-4" />
                  Calcular Depreciação
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Tabela de Depreciação Anual</CardTitle>
                <CardDescription>
                  Resultado do cálculo de depreciação ao longo dos anos
                </CardDescription>
              </div>
              {calculoRealizado && (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={exportarCSV}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                  <Button variant="outline" size="sm" onClick={imprimir}>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!calculoRealizado ? (
              <div className="text-center py-12">
                <Calculator className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Preencha os parâmetros e clique em "Calcular Depreciação" para ver os resultados
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table id="tabela-depreciacao">
                  <TableCaption>Depreciação calculada pelo método {
                    metodoAtual === 'linear' ? 'Linear' :
                    metodoAtual === 'soma_digitos' ? 'Soma dos Dígitos' :
                    metodoAtual === 'saldo_decrescente' ? 'Saldo Decrescente' :
                    metodoAtual === 'unidades_produzidas' ? 'Unidades Produzidas' :
                    'Horas de Trabalho'
                  }</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ano</TableHead>
                      <TableHead>Valor Inicial (R$)</TableHead>
                      <TableHead>Depreciação Anual (R$)</TableHead>
                      <TableHead>Depreciação Acumulada (R$)</TableHead>
                      <TableHead>Valor Contábil (R$)</TableHead>
                      {metodoAtual === 'unidades_produzidas' && <TableHead>Unidades</TableHead>}
                      {metodoAtual === 'horas_trabalho' && <TableHead>Horas</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultados.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{item.ano}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(item.valorInicial))}
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(item.depreciacaoAnual))}
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(item.depreciacaoAcumulada))}
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(item.valorContabil))}
                        </TableCell>
                        {metodoAtual === 'unidades_produzidas' && <TableCell>{item.unidades || 0}</TableCell>}
                        {metodoAtual === 'horas_trabalho' && <TableCell>{item.horas || 0}</TableCell>}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {calculoRealizado && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informações Adicionais</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="info">
              <TabsList>
                <TabsTrigger value="info">Resumo</TabsTrigger>
                <TabsTrigger value="metodo">Sobre o Método</TabsTrigger>
                <TabsTrigger value="notas">Notas Fiscais</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium mb-2">Valor Total Depreciado</h3>
                    <p className="text-2xl font-bold">
                      {resultados.length > 0 ? 
                        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(resultados[resultados.length - 1].depreciacaoAcumulada)) : 
                        'R$ 0,00'}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium mb-2">Percentual Depreciado</h3>
                    <p className="text-2xl font-bold">
                      {resultados.length > 0 && form.getValues('valorInicial') ?
                        `${((parseFloat(resultados[resultados.length - 1].depreciacaoAcumulada) / parseFloat(form.getValues('valorInicial').replace('.', '').replace(',', '.'))) * 100).toFixed(2)}%` :
                        '0%'}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium mb-2">Vida Útil Restante</h3>
                    <p className="text-2xl font-bold">
                      {resultados.length > 0 ?
                        `${Math.max(0, form.getValues('vidaUtil') - (resultados.length - 1))} anos` :
                        '0 anos'}
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="metodo">
                <div className="p-4">
                  <h3 className="font-medium text-lg mb-2">
                    {metodoAtual === 'linear' ? 'Sobre o Método Linear' :
                     metodoAtual === 'soma_digitos' ? 'Sobre o Método Soma dos Dígitos' :
                     metodoAtual === 'saldo_decrescente' ? 'Sobre o Método Saldo Decrescente' :
                     metodoAtual === 'unidades_produzidas' ? 'Sobre o Método Unidades Produzidas' :
                     'Sobre o Método Horas de Trabalho'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {metodoAtual === 'linear' ? 
                      'O método linear (ou método das quotas constantes) pressupõe que o bem se deprecia por valores iguais durante toda a sua vida útil. É o método mais comum e de fácil aplicação.' :
                     metodoAtual === 'soma_digitos' ? 
                      'O método da soma dos dígitos dos anos aplica uma fração decrescente ao valor depreciável. Essa fração tem como numerador os anos restantes de vida útil e como denominador a soma dos dígitos dos anos de vida útil.' :
                     metodoAtual === 'saldo_decrescente' ? 
                      'O método do saldo decrescente aplica um percentual constante sobre o valor contábil do bem. Esse percentual é geralmente o dobro da taxa linear. O valor residual não é deduzido do custo no cálculo inicial.' :
                     metodoAtual === 'unidades_produzidas' ? 
                      'O método das unidades produzidas relaciona a depreciação com a utilização ou produção esperada do ativo. A vida útil é determinada pela produção esperada.' :
                     'O método das horas de trabalho baseia-se nas horas de operação do ativo. É especialmente útil para máquinas e equipamentos cuja deterioração está diretamente ligada ao uso.'}
                  </p>
                  
                  <h4 className="font-medium mt-4">Fórmula de Cálculo:</h4>
                  <div className="bg-muted p-3 rounded-md mt-2 font-mono text-sm">
                    {metodoAtual === 'linear' ? 
                      'Depreciação Anual = (Valor Inicial - Valor Residual) / Vida Útil' :
                     metodoAtual === 'soma_digitos' ? 
                      'Fração = Anos restantes / Soma dos dígitos\nDepreciação = (Valor Inicial - Valor Residual) × Fração' :
                     metodoAtual === 'saldo_decrescente' ? 
                      'Taxa = 2 × (1 / Vida Útil)\nDepreciação = Valor Contábil × Taxa' :
                     metodoAtual === 'unidades_produzidas' ? 
                      'Taxa por unidade = (Valor Inicial - Valor Residual) / Total de Unidades\nDepreciação = Taxa por unidade × Unidades Produzidas no período' :
                     'Taxa por hora = (Valor Inicial - Valor Residual) / Total de Horas\nDepreciação = Taxa por hora × Horas Trabalhadas no período'}
                  </div>
                  
                  <h4 className="font-medium mt-4">Melhor Uso:</h4>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    {metodoAtual === 'linear' ? (
                      <>
                        <li>Ativos que se depreciam de maneira uniforme ao longo do tempo</li>
                        <li>Móveis, edifícios e instalações</li>
                        <li>Quando a simplicidade de cálculo é prioritária</li>
                      </>
                    ) : metodoAtual === 'soma_digitos' ? (
                      <>
                        <li>Ativos que perdem utilidade mais rapidamente nos primeiros anos</li>
                        <li>Veículos e equipamentos eletrônicos</li>
                        <li>Quando se busca uma aproximação mais realista da perda de valor</li>
                      </>
                    ) : metodoAtual === 'saldo_decrescente' ? (
                      <>
                        <li>Ativos que perdem valor rapidamente nos primeiros anos</li>
                        <li>Equipamentos de tecnologia e software</li>
                        <li>Quando se deseja uma depreciação acelerada para fins fiscais</li>
                      </>
                    ) : metodoAtual === 'unidades_produzidas' ? (
                      <>
                        <li>Máquinas industriais cuja vida útil depende da produção</li>
                        <li>Equipamentos de mineração e veículos comerciais</li>
                        <li>Quando o desgaste está diretamente relacionado à produção</li>
                      </>
                    ) : (
                      <>
                        <li>Equipamentos pesados cuja vida útil é medida em horas de operação</li>
                        <li>Máquinas como tratores, escavadeiras e geradores</li>
                        <li>Quando o desgaste está diretamente relacionado ao tempo de uso</li>
                      </>
                    )}
                  </ul>
                </div>
              </TabsContent>
              <TabsContent value="notas">
                <div className="p-4">
                  <h3 className="font-medium mb-2">Registro Contábil da Depreciação</h3>
                  <p className="text-muted-foreground mb-4">
                    A depreciação precisa ser registrada na contabilidade através de lançamentos que afetam o resultado do exercício e o valor contábil do ativo.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <h4 className="font-medium">Lançamento Contábil</h4>
                      <p className="text-sm text-muted-foreground mt-1 mb-2">
                        Modelo de lançamento mensal/anual para registro da depreciação:
                      </p>
                      <div className="bg-muted p-3 rounded-md mt-2 font-mono text-sm">
                        D - Despesa de Depreciação (Resultado)<br />
                        C - Depreciação Acumulada (Ativo - Redutora)
                      </div>
                    </div>
                    
                    <div className="rounded-lg border p-4">
                      <h4 className="font-medium">Notas Fiscais e Documentação</h4>
                      <p className="text-sm text-muted-foreground mt-1 mb-2">
                        Para fins de dedutibilidade fiscal, é importante anexar aos registros contábeis:
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Nota fiscal de aquisição do bem</li>
                        <li>Laudo técnico de vida útil (quando diferente das taxas da Receita Federal)</li>
                        <li>Memória de cálculo da depreciação</li>
                        <li>Ficha de controle do ativo</li>
                      </ul>
                    </div>
                    
                    <div className="rounded-lg border p-4">
                      <h4 className="font-medium">Taxas Fiscais vs. Contábeis</h4>
                      <p className="text-sm text-muted-foreground mt-1 mb-2">
                        Caso utilize taxas de depreciação diferentes das aceitas pelo Fisco, será necessário:
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Manter controle auxiliar para depreciação conforme as taxas fiscais</li>
                        <li>Realizar ajustes no LALUR (Livro de Apuração do Lucro Real)</li>
                        <li>Registrar as diferenças temporárias para fins de cálculo de impostos diferidos</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}