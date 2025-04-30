import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ConverterParaBeneficiarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Schema para validação do formulário
const converterSchema = z.object({
  tipoBusca: z.enum(['email']), // Removido 'cpf' porque o schema de users não tem esse campo
  valorBusca: z.string().min(1, 'Campo obrigatório'),
  beneficioId: z.string().optional(),
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
  const [usuarioEncontrado, setUsuarioEncontrado] = useState<any>(null);
  const [buscaRealizada, setBuscaRealizada] = useState(false);

  // Form para busca e conversão
  const form = useForm<ConverterFormValues>({
    resolver: zodResolver(converterSchema),
    defaultValues: {
      tipoBusca: 'email',
      valorBusca: '',
      recorrente: false,
      observacoes: '',
    },
  });

  // Query para buscar lista de benefícios disponíveis
  const { data: beneficios, isLoading: loadingBeneficios } = useQuery({
    queryKey: ['/api/social/beneficios'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/social/beneficios');
      return await res.json();
    },
    enabled: open, // Só carrega quando o modal estiver aberto
  });

  // Mutation para buscar usuário por email ou CPF
  const buscarUsuarioMutation = useMutation({
    mutationFn: async (data: { tipo: string, valor: string }) => {
      const res = await apiRequest('POST', '/api/social/beneficios/usuarios/pesquisar', data);
      return await res.json();
    },
    onSuccess: (data) => {
      setBuscaRealizada(true);
      if (data.usuario) {
        setUsuarioEncontrado(data.usuario);
        // Se o usuário já for beneficiário, exibe alerta
        if (data.usuario.isBeneficiario) {
          toast({
            title: 'Usuário já é beneficiário',
            description: 'Este usuário já está cadastrado como beneficiário no sistema.',
            variant: 'destructive',
          });
        }
      } else {
        setUsuarioEncontrado(null);
        toast({
          title: 'Usuário não encontrado',
          description: 'Não foi possível encontrar um usuário com os dados informados.',
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao buscar usuário',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation para converter usuário em beneficiário
  const converterMutation = useMutation({
    mutationFn: async (data: ConverterFormValues) => {
      const payload = {
        usuarioId: usuarioEncontrado.id,
        beneficioId: parseInt(data.beneficioId || '0'),
        recorrente: data.recorrente,
        dataValidade: data.dataValidade || null,
        observacoes: data.observacoes,
      };

      const res = await apiRequest('POST', '/api/social/beneficios/beneficiarios/converter', payload);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Conversão realizada com sucesso',
        description: 'O usuário foi convertido em beneficiário com sucesso.',
      });
      
      // Limpar estado e fechar modal
      form.reset();
      setUsuarioEncontrado(null);
      setBuscaRealizada(false);
      onOpenChange(false);
      
      // Invalidar queries relevantes para atualizar dados
      queryClient.invalidateQueries({ queryKey: ['/api/social/beneficiaries'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao converter usuário',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle busca de usuário
  const onBuscarUsuario = () => {
    const tipoBusca = form.getValues('tipoBusca');
    const valorBusca = form.getValues('valorBusca');
    
    if (!valorBusca) {
      toast({
        title: 'Campo obrigatório',
        description: 'Informe um email ou CPF para buscar o usuário.',
        variant: 'destructive',
      });
      return;
    }
    
    buscarUsuarioMutation.mutate({
      tipo: tipoBusca,
      valor: valorBusca,
    });
  };

  // Handle submit do formulário completo
  const onSubmit = (values: ConverterFormValues) => {
    if (!usuarioEncontrado) {
      toast({
        title: 'Nenhum usuário selecionado',
        description: 'Você precisa buscar e selecionar um usuário primeiro.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!values.beneficioId) {
      toast({
        title: 'Benefício não selecionado',
        description: 'Selecione um benefício para continuar.',
        variant: 'destructive',
      });
      return;
    }
    
    converterMutation.mutate(values);
  };

  // Reset ao fechar o modal
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setUsuarioEncontrado(null);
      setBuscaRealizada(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Converter para Beneficiário</DialogTitle>
          <DialogDescription>
            Busque um usuário do sistema e converta-o para beneficiário com acesso a benefícios específicos.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Seção de busca de usuário */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Buscar Usuário</h3>
              
              <FormField
                control={form.control}
                name="tipoBusca"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Buscar por</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-row space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="email" id="email" />
                          <Label htmlFor="email">Email</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex space-x-2">
                <FormField
                  control={form.control}
                  name="valorBusca"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Valor da busca</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="email@exemplo.com"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="button" 
                  onClick={onBuscarUsuario}
                  className="mt-8"
                  disabled={buscarUsuarioMutation.isPending}
                >
                  {buscarUsuarioMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Buscar
                </Button>
              </div>
            </div>
            
            {/* Resultado da busca e detalhes do usuário encontrado */}
            {buscaRealizada && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Resultado da Busca</h3>
                
                {usuarioEncontrado ? (
                  <div className="border rounded-md p-4 bg-muted/50">
                    <h4 className="font-medium mb-2">Usuário Encontrado</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Nome:</span> {usuarioEncontrado.name}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {usuarioEncontrado.email}
                      </div>
                      {usuarioEncontrado.cpf && (
                        <div>
                          <span className="font-medium">CPF:</span> {usuarioEncontrado.cpf}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Status:</span> {usuarioEncontrado.isBeneficiario ? (
                          <span className="text-red-500">Já é beneficiário</span>
                        ) : (
                          <span className="text-green-500">Elegível para conversão</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <AlertTitle>Usuário não encontrado</AlertTitle>
                    <AlertDescription>
                      Não foi possível encontrar um usuário com os dados informados. Verifique e tente novamente.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
            
            {/* Seção de benefícios (apenas se o usuário for encontrado e não for beneficiário) */}
            {usuarioEncontrado && !usuarioEncontrado.isBeneficiario && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Detalhes do Benefício</h3>
                
                <FormField
                  control={form.control}
                  name="beneficioId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Benefício</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um benefício" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loadingBeneficios ? (
                            <div className="flex justify-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : (
                            beneficios?.map((beneficio: any) => (
                              <SelectItem key={beneficio.id} value={beneficio.id.toString()}>
                                {beneficio.nome} - {beneficio.descricao}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Selecione o benefício que será concedido ao usuário.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="recorrente"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Benefício Recorrente</FormLabel>
                        <FormDescription>
                          Ative para conceder o benefício de forma recorrente.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {form.watch('recorrente') && (
                  <FormField
                    control={form.control}
                    name="dataValidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Validade</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>
                          Data limite para o benefício recorrente (opcional).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Observações sobre a concessão do benefício" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleOpenChange(false)}
              >
                Cancelar
              </Button>
              
              {usuarioEncontrado && !usuarioEncontrado.isBeneficiario && (
                <Button 
                  type="submit" 
                  disabled={converterMutation.isPending}
                >
                  {converterMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Converter para Beneficiário
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}