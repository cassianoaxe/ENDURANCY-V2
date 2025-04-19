'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
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
import { ArrowLeft, Building, Save } from 'lucide-react';

// Schema para validação do formulário de instalação
const instalacaoFormSchema = z.object({
  nome: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres' }),
  tipo: z.string().min(1, { message: 'Selecione o tipo de instalação' }),
  status: z.string().min(1, { message: 'Selecione o status da instalação' }),
  endereco: z.string().min(5, { message: 'Endereço deve ter pelo menos 5 caracteres' }),
  complemento: z.string().optional(),
  bairro: z.string().min(2, { message: 'Bairro é obrigatório' }),
  cidade: z.string().min(2, { message: 'Cidade é obrigatória' }),
  estado: z.string().length(2, { message: 'Use a sigla do estado com 2 letras' }),
  cep: z.string().min(8, { message: 'CEP inválido' }).max(9),
  metrosQuadrados: z.coerce.number().min(1, { message: 'Área deve ser maior que zero' }),
  dataAquisicao: z.string().optional(),
  valorAquisicao: z.coerce.number().optional(),
  observacoes: z.string().optional(),
});

type InstalacaoFormValues = z.infer<typeof instalacaoFormSchema>;

// Lista de tipos de instalação para o select
const tiposInstalacao = [
  { value: 'Laboratório', label: 'Laboratório' },
  { value: 'Escritório', label: 'Escritório' },
  { value: 'Armazém', label: 'Armazém' },
  { value: 'Fábrica', label: 'Fábrica' },
  { value: 'Cultivo', label: 'Cultivo' },
  { value: 'Centro de Pesquisa', label: 'Centro de Pesquisa' },
  { value: 'Clínica', label: 'Clínica' },
  { value: 'Ponto de Venda', label: 'Ponto de Venda' },
  { value: 'Outro', label: 'Outro' },
];

// Lista de status possíveis para uma instalação
const statusInstalacao = [
  { value: 'Ativo', label: 'Ativo' },
  { value: 'Em Reforma', label: 'Em Reforma' },
  { value: 'Em Construção', label: 'Em Construção' },
  { value: 'Inativo', label: 'Inativo' },
];

// Lista de estados brasileiros
const estadosBrasileiros = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

export default function NovaInstalacaoPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Definir valores padrão para o formulário
  const defaultValues: Partial<InstalacaoFormValues> = {
    tipo: '',
    status: 'Ativo',
    estado: '',
    metrosQuadrados: 0,
    valorAquisicao: 0,
    complemento: '',
    observacoes: '',
  };
  
  // Configurar o formulário com React Hook Form e validação Zod
  const form = useForm<InstalacaoFormValues>({
    resolver: zodResolver(instalacaoFormSchema),
    defaultValues,
  });
  
  // Mutation para enviar os dados ao servidor
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: InstalacaoFormValues) => {
      const response = await apiRequest('/api/patrimonio/instalacoes', { 
        method: 'POST', 
        data 
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar instalação');
      }
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Instalação criada com sucesso',
        description: `A instalação "${data.nome}" foi adicionada ao seu patrimônio.`,
      });
      
      // Invalidar consultas para forçar recarregamento dos dados
      queryClient.invalidateQueries({ queryKey: ['/api/patrimonio/instalacoes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/patrimonio/dashboard'] });
      
      // Redirecionar para a página de detalhes da instalação criada
      navigate(`/organization/patrimonio/instalacoes/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar instalação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Função para lidar com o envio do formulário
  function onSubmit(data: InstalacaoFormValues) {
    mutate(data);
  }
  
  return (
    <div className="container mx-auto py-6">
      <PageHeader
        heading="Nova Instalação"
        text="Cadastre uma nova instalação, imóvel ou espaço físico da sua organização."
      >
        <Button variant="outline" asChild>
          <Link to="/organization/patrimonio/instalacoes">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
      </PageHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" /> Informações Básicas
              </CardTitle>
              <CardDescription>
                Dados principais da instalação
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
                        <FormLabel>Nome da Instalação*</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Laboratório Central, Sede Administrativa, etc." {...field} />
                        </FormControl>
                        <FormDescription>
                          Nome que identifica esta instalação na sua organização.
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
                      <FormLabel>Tipo de Instalação*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tiposInstalacao.map((tipo) => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Classifica a finalidade principal desta instalação.
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
                          {statusInstalacao.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Situação atual da instalação.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Localização</CardTitle>
              <CardDescription>
                Endereço completo da instalação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                <div className="col-span-full">
                  <FormField
                    control={form.control}
                    name="endereco"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço*</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Av. Brasil, 1500" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="col-span-3 md:col-span-2">
                  <FormField
                    control={form.control}
                    name="complemento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complemento</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Bloco B, Sala 304" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="col-span-3 md:col-span-2">
                  <FormField
                    control={form.control}
                    name="bairro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro*</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Centro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="col-span-3 md:col-span-2">
                  <FormField
                    control={form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP*</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 00000-000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="col-span-3 md:col-span-3">
                  <FormField
                    control={form.control}
                    name="cidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade*</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: São Paulo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="col-span-3 md:col-span-3">
                  <FormField
                    control={form.control}
                    name="estado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {estadosBrasileiros.map((estado) => (
                              <SelectItem key={estado.value} value={estado.value}>
                                {estado.label} ({estado.value})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Detalhes Adicionais</CardTitle>
              <CardDescription>
                Informações complementares sobre a instalação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="metrosQuadrados"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área (m²)*</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormDescription>
                        Tamanho total da instalação em metros quadrados.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                        Data em que a instalação foi adquirida ou construída.
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
                        Valor pago pela instalação ou custo total da construção.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="observacoes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Informações adicionais sobre a instalação..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Características importantes, histórico ou outras informações relevantes.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-6">
              <Button variant="outline" asChild>
                <Link to="/organization/patrimonio/instalacoes">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>Salvando...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Salvar Instalação
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