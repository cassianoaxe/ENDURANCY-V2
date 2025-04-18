'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { queryClient } from '@/lib/queryClient';

// Define o esquema de validação do formulário
const assetFormSchema = z.object({
  nome: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres' }),
  tipo: z.string().min(1, { message: 'O tipo é obrigatório' }),
  numeroSerie: z.string().optional(),
  marca: z.string().min(1, { message: 'A marca é obrigatória' }),
  modelo: z.string().min(1, { message: 'O modelo é obrigatório' }),
  dataAquisicao: z.string().min(1, { message: 'A data de aquisição é obrigatória' }),
  valorAquisicao: z.string().min(1, { message: 'O valor de aquisição é obrigatório' }),
  vidaUtilAnos: z.number().min(1, { message: 'A vida útil deve ser de pelo menos 1 ano' }),
  localizacao: z.string().min(1, { message: 'A localização é obrigatória' }),
  departamento: z.string().min(1, { message: 'O departamento é obrigatório' }),
  observacoes: z.string().optional(),
});

type AssetFormValues = z.infer<typeof assetFormSchema>;

export default function NovoAtivoPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Configuração do formulário com react-hook-form e validação zod
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      nome: '',
      tipo: '',
      numeroSerie: '',
      marca: '',
      modelo: '',
      dataAquisicao: new Date().toISOString().split('T')[0],
      valorAquisicao: '',
      vidaUtilAnos: 5,
      localizacao: '',
      departamento: '',
      observacoes: '',
    },
  });

  // Mutation para salvar o ativo
  const saveMutation = useMutation({
    mutationFn: async (data: AssetFormValues) => {
      // Converte o valor de aquisição para número
      const parsedData = {
        ...data,
        valorAquisicao: parseFloat(data.valorAquisicao)
      };
      
      // Faz a requisição para a API
      const response = await fetch('/api/patrimonio/ativos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedData),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao salvar ativo');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalida o cache da consulta para recarregar a lista
      queryClient.invalidateQueries({ queryKey: ['/api/patrimonio/ativos'] });
      
      // Exibe mensagem de sucesso
      toast({
        title: 'Ativo cadastrado com sucesso',
        description: 'O novo ativo foi adicionado ao inventário',
        variant: 'default',
      });
      
      // Redireciona para a lista de ativos
      navigate('/organization/patrimonio/ativos');
    },
    onError: (error) => {
      // Exibe mensagem de erro
      toast({
        title: 'Erro ao cadastrar ativo',
        description: error.message || 'Ocorreu um erro ao salvar o ativo',
        variant: 'destructive',
      });
    },
  });

  // Handler para envio do formulário
  const onSubmit = (data: AssetFormValues) => {
    saveMutation.mutate(data);
  };

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        heading="Adicionar Novo Ativo"
        text="Cadastre um novo equipamento, máquina ou ativo no sistema"
      >
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/organization/patrimonio/ativos">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Link>
          </Button>
        </div>
      </PageHeader>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Ativo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Equipamento HPLC Agilent" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nome que identifica o ativo no sistema
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de ativo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="laboratório">Equipamento de Laboratório</SelectItem>
                          <SelectItem value="cultivo">Equipamento de Cultivo</SelectItem>
                          <SelectItem value="produção">Equipamento de Produção</SelectItem>
                          <SelectItem value="refrigeração">Sistema de Refrigeração</SelectItem>
                          <SelectItem value="tecnologia">Equipamento de TI</SelectItem>
                          <SelectItem value="móveis">Mobiliário</SelectItem>
                          <SelectItem value="veículo">Veículo</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Categoria do ativo para relatórios e análises
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
                        <Input placeholder="Ex: Agilent" {...field} />
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
                        <Input placeholder="Ex: 1260 Infinity II" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numeroSerie"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Série</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: AG12345678" {...field} />
                      </FormControl>
                      <FormDescription>
                        Número de série ou identificação única do fabricante
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
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="Ex: 150000" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Valor pago pelo ativo na aquisição (em reais)
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
                      <FormLabel>Vida Útil (anos)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="50" 
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Tempo estimado de vida útil para cálculo de depreciação
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="localizacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localização</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Laboratório Central" {...field} />
                      </FormControl>
                      <FormDescription>
                        Local físico onde o ativo está instalado/armazenado
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="departamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o departamento responsável" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Pesquisa">Pesquisa</SelectItem>
                          <SelectItem value="Produção">Produção</SelectItem>
                          <SelectItem value="Controle de Qualidade">Controle de Qualidade</SelectItem>
                          <SelectItem value="Cultivo">Cultivo</SelectItem>
                          <SelectItem value="Logística">Logística</SelectItem>
                          <SelectItem value="Administrativo">Administrativo</SelectItem>
                          <SelectItem value="TI">TI</SelectItem>
                          <SelectItem value="Financeiro">Financeiro</SelectItem>
                          <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Departamento responsável pelo ativo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>

              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Informações adicionais sobre o ativo..." 
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Detalhes adicionais, condições especiais de uso, histórico relevante, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/organization/patrimonio/ativos')}
                >
                  <X className="mr-2 h-4 w-4" /> Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={saveMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" /> Salvar Ativo
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}