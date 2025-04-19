'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, Package, Save, Building, Calculator } from 'lucide-react';

// Schema para validação do formulário de ativo
const ativoFormSchema = z.object({
  nome: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres' }),
  tipo: z.string().min(1, { message: 'Selecione o tipo de ativo' }),
  status: z.string().min(1, { message: 'Selecione o status do ativo' }),
  codigo: z.string().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  numeroSerie: z.string().optional(),
  dataAquisicao: z.string().optional(),
  valorAquisicao: z.coerce.number().optional(),
  vidaUtilAnos: z.coerce.number().min(1, { message: 'A vida útil deve ser pelo menos 1 ano' }),
  valorResidual: z.coerce.number().min(0, { message: 'O valor residual não pode ser negativo' }),
  instalacaoId: z.string().optional(),
  observacoes: z.string().optional(),
});

type AtivoFormValues = z.infer<typeof ativoFormSchema>;

// Lista de tipos de ativos para o select
const tiposAtivo = [
  { value: 'Equipamento Laboratório', label: 'Equipamento de Laboratório' },
  { value: 'Equipamento Cultivo', label: 'Equipamento de Cultivo' },
  { value: 'Mobiliário', label: 'Mobiliário' },
  { value: 'Tecnologia', label: 'Tecnologia' },
  { value: 'Veículo', label: 'Veículo' },
  { value: 'Ferramenta', label: 'Ferramenta' },
  { value: 'Outro', label: 'Outro' },
];

// Lista de status possíveis para um ativo
const statusAtivo = [
  { value: 'Ativo', label: 'Ativo' },
  { value: 'Em Manutenção', label: 'Em Manutenção' },
  { value: 'Em Garantia', label: 'Em Garantia' },
  { value: 'Inativo', label: 'Inativo' },
  { value: 'Baixado', label: 'Baixado' },
];

export default function NovoAtivoPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Carregar lista de instalações para associar ao ativo
  const { data: instalacoes, isLoading: isLoadingInstalacoes } = useQuery({
    queryKey: ['/api/patrimonio/instalacoes'],
  });
  
  // Definir valores padrão para o formulário
  const defaultValues: Partial<AtivoFormValues> = {
    tipo: '',
    status: 'Ativo',
    instalacaoId: '',
    vidaUtilAnos: 5,
    valorResidual: 0,
    valorAquisicao: 0,
    observacoes: '',
  };
  
  // Configurar o formulário com React Hook Form e validação Zod
  const form = useForm<AtivoFormValues>({
    resolver: zodResolver(ativoFormSchema),
    defaultValues,
  });
  
  // Mutation para enviar os dados ao servidor
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: AtivoFormValues) => {
      const response = await apiRequest('/api/patrimonio/ativos', { 
        method: 'POST', 
        data 
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar ativo');
      }
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Ativo criado com sucesso',
        description: `O ativo "${data.nome}" foi adicionado ao seu patrimônio.`,
      });
      
      // Invalidar consultas para forçar recarregamento dos dados
      queryClient.invalidateQueries({ queryKey: ['/api/patrimonio/ativos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/patrimonio/dashboard'] });
      
      // Redirecionar para a página de detalhes do ativo criado
      navigate(`/organization/patrimonio/ativos/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar ativo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Função para lidar com o envio do formulário
  function onSubmit(data: AtivoFormValues) {
    mutate(data);
  }
  
  return (
    <div className="container mx-auto py-6">
      <PageHeader
        heading="Novo Ativo"
        text="Cadastre um novo equipamento, mobiliário ou bem no patrimônio da sua organização."
      >
        <Button variant="outline" asChild>
          <Link to="/organization/patrimonio">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
      </PageHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" /> Informações Básicas
              </CardTitle>
              <CardDescription>
                Dados principais do ativo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Ativo*</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Microscópio Digital, Computador Dell, etc." {...field} />
                        </FormControl>
                        <FormDescription>
                          Nome que identifica este ativo na sua organização.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Ativo*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tiposAtivo.map((tipo) => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Categoria que melhor descreve este ativo.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusAtivo.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Situação atual do ativo.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="codigo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código/Patrimônio</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: PAT-001234" {...field} />
                      </FormControl>
                      <FormDescription>
                        Código interno de identificação.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="marca"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Dell, Samsung, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="modelo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Inspiron 15 5000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="numeroSerie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Série</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: SN12345678" {...field} />
                    </FormControl>
                    <FormDescription>
                      Número de série do fabricante, quando aplicável.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="instalacaoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instalação</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a instalação..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Nenhuma instalação</SelectItem>
                        {instalacoes?.map((instalacao: any) => (
                          <SelectItem key={instalacao.id} value={instalacao.id.toString()}>
                            {instalacao.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Local onde este ativo está atualmente alocado.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="mr-2 h-5 w-5" /> Valores e Depreciação
              </CardTitle>
              <CardDescription>
                Informações para cálculo de depreciação contábil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="dataAquisicao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Aquisição</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Data em que o ativo foi adquirido.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="valorAquisicao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor de Aquisição (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormDescription>
                        Valor pago na compra do ativo.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="vidaUtilAnos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vida Útil (anos)*</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Tempo estimado de uso do ativo.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="valorResidual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Residual (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription>
                      Valor estimado de revenda após o fim da vida útil.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="bg-muted/50 p-4 rounded-md border">
                <h4 className="font-medium mb-2">Informações sobre Depreciação</h4>
                <p className="text-sm text-muted-foreground">
                  A depreciação é calculada utilizando o método linear, com base nos valores de aquisição, residual e vida útil.
                  <br />O sistema calculará automaticamente a depreciação mensal e o valor atual do ativo.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
              <CardDescription>
                Informações adicionais sobre o ativo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Informações adicionais sobre este ativo..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Detalhes importantes, histórico ou outras informações relevantes.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between pt-6">
              <Button variant="outline" asChild>
                <Link to="/organization/patrimonio">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>Salvando...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Salvar Ativo
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}