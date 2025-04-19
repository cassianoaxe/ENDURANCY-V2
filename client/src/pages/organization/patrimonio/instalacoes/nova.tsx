'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, ArrowLeft, Save, Map, Home } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Schema para validação do formulário de instalação
const instalacaoSchema = z.object({
  nome: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres' }),
  tipo: z.string().min(1, { message: 'Selecione um tipo de instalação' }),
  endereco: z.string().min(5, { message: 'O endereço deve ter pelo menos 5 caracteres' }),
  complemento: z.string().optional(),
  bairro: z.string().min(2, { message: 'O bairro deve ter pelo menos 2 caracteres' }),
  cidade: z.string().min(2, { message: 'A cidade deve ter pelo menos 2 caracteres' }),
  estado: z.string().min(2, { message: 'Selecione um estado' }),
  cep: z.string().min(8, { message: 'CEP inválido' }).max(9, { message: 'CEP inválido' }),
  metrosQuadrados: z.coerce.number().positive({ message: 'O tamanho deve ser maior que zero' }),
  valorAquisicao: z.coerce.number().nonnegative({ message: 'O valor deve ser maior ou igual a zero' }).optional(),
  dataAquisicao: z.string().optional(),
  observacoes: z.string().optional(),
  status: z.string().min(1, { message: 'Selecione um status' }),
});

type InstalacaoFormValues = z.infer<typeof instalacaoSchema>;

export default function NovaInstalacaoPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  // Definindo valores padrão para o formulário
  const defaultValues: Partial<InstalacaoFormValues> = {
    tipo: '',
    status: 'Ativo',
    metrosQuadrados: 0,
    valorAquisicao: 0,
    dataAquisicao: new Date().toISOString().substring(0, 10),
  };

  // Configuração do formulário com React Hook Form
  const form = useForm<InstalacaoFormValues>({
    resolver: zodResolver(instalacaoSchema),
    defaultValues,
  });

  // Mutação para criar a instalação
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: InstalacaoFormValues) => {
      const response = await fetch('/api/patrimonio/instalacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Falha ao cadastrar instalação');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Instalação cadastrada',
        description: 'A instalação foi cadastrada com sucesso!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/patrimonio/instalacoes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/patrimonio/dashboard'] });
      navigate('/organization/patrimonio/instalacoes');
    },
    onError: (error) => {
      toast({
        title: 'Erro ao cadastrar instalação',
        description: error.message || 'Ocorreu um erro ao cadastrar a instalação. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Função para lidar com o envio do formulário
  function onSubmit(data: InstalacaoFormValues) {
    mutate(data);
  }

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        heading="Nova Instalação"
        text="Cadastre uma nova instalação ou unidade física."
      >
        <Button variant="outline" asChild>
          <a href="/organization/patrimonio/instalacoes">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </a>
        </Button>
      </PageHeader>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="mr-2 h-5 w-5" /> Dados da Instalação
          </CardTitle>
          <CardDescription>
            Preencha os dados da nova instalação. Os campos marcados com * são obrigatórios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome da instalação */}
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Instalação *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Laboratório Central" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tipo de instalação */}
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Instalação *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Laboratório">Laboratório</SelectItem>
                          <SelectItem value="Escritório">Escritório</SelectItem>
                          <SelectItem value="Produção">Área de Produção</SelectItem>
                          <SelectItem value="Armazém">Armazém</SelectItem>
                          <SelectItem value="Estoque">Estoque</SelectItem>
                          <SelectItem value="Campo">Área de Cultivo</SelectItem>
                          <SelectItem value="Loja">Loja/Ponto de Venda</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Endereço */}
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="endereco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Rua das Flores, 123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Complemento */}
                <FormField
                  control={form.control}
                  name="complemento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Sala 101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bairro */}
                <FormField
                  control={form.control}
                  name="bairro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Centro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {/* Cidade */}
                <FormField
                  control={form.control}
                  name="cidade"
                  render={({ field }) => (
                    <FormItem className="col-span-2 md:col-span-2">
                      <FormLabel>Cidade *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: São Paulo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Estado */}
                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="UF" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {estados.map((estado) => (
                            <SelectItem key={estado} value={estado}>
                              {estado}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* CEP */}
                <FormField
                  control={form.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 12345-678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Metros quadrados */}
                <FormField
                  control={form.control}
                  name="metrosQuadrados"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tamanho (m²) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ex: 150"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Área total em metros quadrados</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Valor de aquisição */}
                <FormField
                  control={form.control}
                  name="valorAquisicao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor de Aquisição (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ex: 500000"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Valor pago ou estimado</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Data de aquisição */}
                <FormField
                  control={form.control}
                  name="dataAquisicao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Aquisição</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Data de compra ou início de uso</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Em Reforma">Em Reforma</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                        <SelectItem value="Em Construção">Em Construção</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Situação atual da instalação</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Observações */}
              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Insira observações ou informações adicionais sobre a instalação"
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Informações adicionais sobre a instalação</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CardFooter className="flex justify-between px-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/organization/patrimonio/instalacoes')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Cancelar
                </Button>
                <div className="space-x-2">
                  <Button type="submit" disabled={isPending}>
                    <Save className="mr-2 h-4 w-4" /> Salvar Instalação
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Map className="mr-2 h-4 w-4" /> Mapa e Localização
            </CardTitle>
            <CardDescription>
              Após cadastrar a instalação, você poderá visualizá-la no mapa e gerenciar sua localização.
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Home className="mr-2 h-4 w-4" /> Fotos e Documentos
            </CardTitle>
            <CardDescription>
              Após cadastrar a instalação, você poderá adicionar fotos e documentos relacionados.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}