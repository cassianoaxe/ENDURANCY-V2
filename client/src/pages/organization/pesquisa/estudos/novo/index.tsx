import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ChevronLeft, Calendar as CalendarIcon } from "lucide-react";
import { ptBR } from 'date-fns/locale';
import { apiRequest } from '@lib/queryClient';

// Schema para validação do formulário
const pesquisaSchema = z.object({
  titulo: z.string().min(3, {
    message: "O título deve ter pelo menos 3 caracteres.",
  }),
  descricao: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres.",
  }),
  tipo: z.enum(["clinico_randomizado", "observacional_prospectivo", "observacional_retrospectivo", "revisao_sistematica", "translacional", "outro"], {
    required_error: "Por favor selecione um tipo de pesquisa.",
  }),
  areaId: z.coerce.number({
    required_error: "Por favor selecione uma área de conhecimento.",
  }),
  status: z.enum(["rascunho", "em_analise", "aprovada", "em_andamento", "suspensa", "concluida"], {
    required_error: "Por favor selecione um status.",
  }).default("rascunho"),
  dataInicio: z.date().optional(),
  dataPrevistaFim: z.date().optional(),
  observacoes: z.string().optional(),
});

type FormValues = z.infer<typeof pesquisaSchema>;

export default function NovaPesquisa() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Recuperar áreas de conhecimento para o select
  const { data: areas = [], isLoading: areasLoading } = useQuery({
    queryKey: ['/api/pesquisa/areas'],
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Hook do formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(pesquisaSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
      status: "rascunho",
      observacoes: "",
    },
  });

  // Mutation para criar pesquisa
  const createPesquisa = useMutation({
    mutationFn: async (values: FormValues) => {
      return apiRequest('/api/pesquisa/pesquisas', {
        method: 'POST',
        body: JSON.stringify(values),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Pesquisa criada com sucesso",
        description: "A nova pesquisa científica foi registrada no sistema.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pesquisa/pesquisas'] });
      navigate(`/organization/pesquisa/estudos/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar pesquisa",
        description: "Ocorreu um erro ao registrar a pesquisa. Tente novamente.",
        variant: "destructive",
      });
      console.error('Erro ao criar pesquisa:', error);
    }
  });

  // Handler do formulário
  const onSubmit = (values: FormValues) => {
    createPesquisa.mutate(values);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb e cabeçalho */}
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/organization/pesquisa">
                Pesquisa Científica
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/organization/pesquisa/estudos">
                Estudos
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Nova Pesquisa</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <h2 className="text-2xl font-bold tracking-tight">Nova Pesquisa Científica</h2>
          <p className="text-muted-foreground">
            Cadastre um novo estudo científico na plataforma
          </p>
        </div>
      </div>

      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Pesquisa</CardTitle>
          <CardDescription>
            Preencha as informações abaixo para registrar uma nova pesquisa científica
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Título */}
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título da Pesquisa</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Eficácia do CBD no tratamento da epilepsia refratária" {...field} />
                      </FormControl>
                      <FormDescription>
                        Informe um título claro e descritivo para a pesquisa
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Descrição */}
                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva os objetivos e metodologia da pesquisa..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Forneça uma descrição detalhada dos objetivos e metodologia da pesquisa
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tipo e Área */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Estudo</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo de estudo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="clinico_randomizado">Clínico Randomizado</SelectItem>
                            <SelectItem value="observacional_prospectivo">Observacional Prospectivo</SelectItem>
                            <SelectItem value="observacional_retrospectivo">Observacional Retrospectivo</SelectItem>
                            <SelectItem value="revisao_sistematica">Revisão Sistemática</SelectItem>
                            <SelectItem value="translacional">Translacional</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Selecione o tipo de metodologia utilizada
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="areaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área de Conhecimento</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value?.toString()}
                          disabled={areasLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a área de conhecimento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {areas.map((area) => (
                              <SelectItem key={area.id} value={area.id.toString()}>
                                {area.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Escolha a área de conhecimento relacionada à pesquisa
                        </FormDescription>
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
                      <FormLabel>Status Inicial</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status inicial" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="rascunho">Rascunho</SelectItem>
                          <SelectItem value="em_analise">Em Análise</SelectItem>
                          <SelectItem value="aprovada">Aprovada</SelectItem>
                          <SelectItem value="em_andamento">Em Andamento</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Define o status inicial da pesquisa
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Datas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dataInicio"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de Início</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy", { locale: ptBR })
                                ) : (
                                  <span>Selecione a data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              locale={ptBR}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Data de início prevista para a pesquisa
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dataPrevistaFim"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Previsão de Término</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy", { locale: ptBR })
                                ) : (
                                  <span>Selecione a data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              fromDate={form.watch("dataInicio") || undefined}
                              locale={ptBR}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Data prevista para a conclusão da pesquisa
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Observações */}
                <FormField
                  control={form.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Informações adicionais sobre a pesquisa..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Informações complementares ou observações sobre o estudo (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button variant="outline" type="button" asChild>
                <Link href="/organization/pesquisa/estudos">
                  <a className="flex items-center">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Cancelar
                  </a>
                </Link>
              </Button>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => {
                    form.reset({
                      ...form.getValues(),
                      status: "rascunho"
                    });
                    form.handleSubmit(onSubmit)();
                  }}
                >
                  Salvar como rascunho
                </Button>
                <Button type="submit" disabled={createPesquisa.isPending}>
                  {createPesquisa.isPending ? "Salvando..." : "Salvar pesquisa"}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}