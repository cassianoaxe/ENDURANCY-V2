import React, { useState, useEffect } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, User, CheckCircle2, Search } from 'lucide-react';

interface ConverterParaBeneficiarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Schema para validação do formulário
const converterSchema = z.object({
  email: z.string().email('Email inválido').or(z.string().length(0)),
  cpf: z.string().min(11, 'CPF inválido').or(z.string().length(0)),
  beneficioId: z.string().min(1, 'Selecione um benefício'),
  recorrente: z.boolean().default(false),
  dataValidade: z.string().optional(),
  observacoes: z.string().optional(),
});

type ConverterFormValues = z.infer<typeof converterSchema>;

export default function ConverterParaBeneficiarioModal({ 
  open, 
  onOpenChange 
}: ConverterParaBeneficiarioModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'email' | 'cpf'>('email');
  const [pesquisaRealizada, setPesquisaRealizada] = useState(false);
  const [usuarioEncontrado, setUsuarioEncontrado] = useState<any>(null);

  // Form para pesquisa e conversão
  const form = useForm<ConverterFormValues>({
    resolver: zodResolver(converterSchema),
    defaultValues: {
      email: '',
      cpf: '',
      beneficioId: '',
      recorrente: false,
      observacoes: '',
    },
  });

  // Buscar lista de benefícios disponíveis
  const { data: beneficios, isLoading: carregandoBeneficios } = useQuery({
    queryKey: ['/api/social/beneficios'],
    enabled: open,
  });

  // Mutation para pesquisar usuário
  const pesquisarUsuarioMutation = useMutation({
    mutationFn: async (values: { tipo: 'email' | 'cpf', valor: string }) => {
      return apiRequest('/api/social/usuarios/pesquisar', {
        method: 'POST',
        data: values,
      });
    },
    onSuccess: (data) => {
      if (data.usuario) {
        setUsuarioEncontrado(data.usuario);
        toast({
          title: 'Usuário encontrado',
          description: `Usuário ${data.usuario.name} encontrado com sucesso.`,
        });
      } else {
        setUsuarioEncontrado(null);
        toast({
          title: 'Usuário não encontrado',
          description: 'Nenhum usuário encontrado com os dados informados.',
          variant: 'destructive',
        });
      }
      setPesquisaRealizada(true);
    },
    onError: (error: any) => {
      setUsuarioEncontrado(null);
      setPesquisaRealizada(true);
      toast({
        title: 'Erro ao pesquisar',
        description: error.message || 'Ocorreu um erro ao pesquisar o usuário.',
        variant: 'destructive',
      });
    },
  });

  // Mutation para converter usuário em beneficiário
  const converterUsuarioMutation = useMutation({
    mutationFn: async (values: any) => {
      return apiRequest('/api/social/beneficiarios/converter', {
        method: 'POST',
        data: values,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social/beneficiarios'] });
      toast({
        title: 'Conversão realizada',
        description: 'Usuário convertido em beneficiário com sucesso.',
      });
      handleCloseModal();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro na conversão',
        description: error.message || 'Ocorreu um erro ao converter o usuário.',
        variant: 'destructive',
      });
    },
  });

  // Efeito para limpar o formulário quando o modal é aberto
  useEffect(() => {
    if (open) {
      form.reset({
        email: '',
        cpf: '',
        beneficioId: '',
        recorrente: false,
        observacoes: '',
      });
      setPesquisaRealizada(false);
      setUsuarioEncontrado(null);
    }
  }, [open, form]);

  // Fechar o modal e limpar o estado
  const handleCloseModal = () => {
    form.reset();
    setPesquisaRealizada(false);
    setUsuarioEncontrado(null);
    onOpenChange(false);
  };

  // Pesquisar usuário por email ou CPF
  const handlePesquisar = () => {
    const valor = tab === 'email' ? form.getValues('email') : form.getValues('cpf');
    
    if (!valor || valor.length === 0) {
      toast({
        title: 'Campo obrigatório',
        description: `O campo ${tab === 'email' ? 'email' : 'CPF'} é obrigatório para a pesquisa.`,
        variant: 'destructive',
      });
      return;
    }

    pesquisarUsuarioMutation.mutate({ tipo: tab, valor });
  };

  // Converter usuário em beneficiário
  const onSubmit = (values: ConverterFormValues) => {
    if (!usuarioEncontrado) {
      toast({
        title: 'Usuário não encontrado',
        description: 'É necessário encontrar um usuário válido antes de convertê-lo.',
        variant: 'destructive',
      });
      return;
    }

    const dadosConversao = {
      usuarioId: usuarioEncontrado.id,
      beneficioId: values.beneficioId,
      recorrente: values.recorrente,
      dataValidade: values.dataValidade || null,
      observacoes: values.observacoes || '',
    };

    converterUsuarioMutation.mutate(dadosConversao);
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseModal}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Converter Usuário em Beneficiário</DialogTitle>
          <DialogDescription>
            Converta um usuário registrado no sistema em um beneficiário com acesso a benefícios específicos.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 overflow-auto py-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">1. Localizar Usuário</h3>
              
              <Tabs value={tab} onValueChange={(value) => setTab(value as 'email' | 'cpf')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email">Buscar por Email</TabsTrigger>
                  <TabsTrigger value="cpf">Buscar por CPF</TabsTrigger>
                </TabsList>
                
                <TabsContent value="email" className="mt-4">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        placeholder="exemplo@email.com"
                        {...form.register('email')}
                      />
                    </div>
                    <Button 
                      type="button" 
                      onClick={handlePesquisar}
                      disabled={pesquisarUsuarioMutation.isPending}
                    >
                      {pesquisarUsuarioMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      Pesquisar
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="cpf" className="mt-4">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        placeholder="123.456.789-00"
                        {...form.register('cpf')}
                      />
                    </div>
                    <Button 
                      type="button" 
                      onClick={handlePesquisar}
                      disabled={pesquisarUsuarioMutation.isPending}
                    >
                      {pesquisarUsuarioMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      Pesquisar
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              {pesquisaRealizada && (
                <div className={`p-4 border rounded-md ${usuarioEncontrado ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  {usuarioEncontrado ? (
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 rounded-full p-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Usuário encontrado</h4>
                        <p className="text-sm text-muted-foreground">
                          Nome: <span className="font-medium">{usuarioEncontrado.name}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Email: {usuarioEncontrado.email}
                        </p>
                        {usuarioEncontrado.cpf && (
                          <p className="text-sm text-muted-foreground">
                            CPF: {usuarioEncontrado.cpf}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="bg-red-100 rounded-full p-2">
                        <Search className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Usuário não encontrado</h4>
                        <p className="text-sm text-muted-foreground">
                          Nenhum usuário encontrado com os dados informados.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {usuarioEncontrado && (
              <div className="space-y-4 pt-2">
                <h3 className="text-lg font-medium">2. Definir Benefício</h3>
                
                <FormField
                  control={form.control}
                  name="beneficioId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Benefício</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um benefício" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {carregandoBeneficios ? (
                            <div className="flex items-center justify-center py-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : (
                            Array.isArray(beneficios) && beneficios.map((beneficio: any) => (
                              <SelectItem 
                                key={beneficio.id} 
                                value={beneficio.id.toString()}
                              >
                                {beneficio.nome}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recorrente"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Benefício Recorrente</FormLabel>
                        <FormDescription>
                          O beneficiário receberá este benefício regularmente
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataValidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Validade (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          placeholder="Data até quando o benefício é válido"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Deixe em branco para benefícios sem data de expiração
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Informações adicionais sobre o benefício"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <DialogFooter className="pt-4 flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                type="button"
              >
                Cancelar
              </Button>
              
              {usuarioEncontrado && (
                <Button
                  type="submit"
                  disabled={converterUsuarioMutation.isPending}
                >
                  {converterUsuarioMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Converter em Beneficiário
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}