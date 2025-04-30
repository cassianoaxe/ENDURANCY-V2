import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, Search, UserPlus } from 'lucide-react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ConverterParaBeneficiarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Schema de validação para conversão
const converterSchema = z.object({
  usuarioId: z.number({
    required_error: "Selecione um usuário para converter",
  }),
  beneficioId: z.number({
    required_error: "Selecione um benefício a ser concedido",
  }),
  recorrente: z.boolean().default(false),
  dataValidade: z.date().optional(),
  observacoes: z.string().optional(),
});

type ConverterFormValues = z.infer<typeof converterSchema>;

export default function ConverterParaBeneficiarioModal({ 
  open, 
  onOpenChange 
}: ConverterParaBeneficiarioModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pesquisando, setPesquisando] = useState(false);
  const [valorPesquisa, setValorPesquisa] = useState('');
  const [tipoPesquisa, setTipoPesquisa] = useState<'email' | 'cpf'>('email');
  const [usuarioEncontrado, setUsuarioEncontrado] = useState<any>(null);
  const [pesquisaRealizada, setPesquisaRealizada] = useState(false);

  // Consultar benefícios disponíveis
  const { data: beneficios, isLoading: carregandoBeneficios } = useQuery({
    queryKey: ['/api/social/beneficios'],
    enabled: open,
  });

  // Form para conversão
  const form = useForm<ConverterFormValues>({
    resolver: zodResolver(converterSchema),
    defaultValues: {
      recorrente: false,
    },
  });

  // Mutation para pesquisar usuário
  const pesquisarUsuarioMutation = useMutation({
    mutationFn: async () => {
      setPesquisando(true);
      const res = await apiRequest('POST', '/api/social/beneficios/usuarios/pesquisar', {
        tipo: tipoPesquisa,
        valor: valorPesquisa
      });
      return await res.json();
    },
    onSuccess: (data) => {
      setPesquisaRealizada(true);
      if (data.usuario) {
        setUsuarioEncontrado(data.usuario);
        form.setValue('usuarioId', data.usuario.id);
      } else {
        setUsuarioEncontrado(null);
        form.setValue('usuarioId', undefined as any);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao pesquisar usuário",
        description: error.message,
        variant: "destructive",
      });
      setUsuarioEncontrado(null);
    },
    onSettled: () => {
      setPesquisando(false);
    }
  });

  // Mutation para converter usuário em beneficiário
  const converterMutation = useMutation({
    mutationFn: async (data: ConverterFormValues) => {
      const res = await apiRequest('POST', '/api/social/beneficios/beneficiarios/converter', data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Usuário convertido com sucesso",
        description: "O usuário agora é um beneficiário e receberá os benefícios configurados.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/social/beneficiaries'] });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao converter usuário",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Reset form quando o modal é fechado
  const handleClose = () => {
    form.reset();
    setValorPesquisa('');
    setUsuarioEncontrado(null);
    setPesquisaRealizada(false);
    onOpenChange(false);
  };

  // Lidar com envio do formulário
  const onSubmit = (values: ConverterFormValues) => {
    converterMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Converter Usuário em Beneficiário</DialogTitle>
          <DialogDescription>
            Pesquise um usuário pelo e-mail ou CPF e associe-o a um benefício para convertê-lo em beneficiário.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {/* Pesquisa de usuário */}
            <div className="space-y-2">
              <Label>Pesquisar usuário por:</Label>
              <div className="flex gap-2 mb-2">
                <Button 
                  type="button" 
                  variant={tipoPesquisa === 'email' ? 'default' : 'outline'} 
                  onClick={() => setTipoPesquisa('email')}
                  className="flex-1"
                >
                  E-mail
                </Button>
                <Button 
                  type="button" 
                  variant={tipoPesquisa === 'cpf' ? 'default' : 'outline'} 
                  onClick={() => setTipoPesquisa('cpf')}
                  className="flex-1"
                >
                  CPF
                </Button>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={tipoPesquisa === 'email' ? "Digite o e-mail..." : "Digite o CPF..."}
                    value={valorPesquisa}
                    onChange={(e) => setValorPesquisa(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button 
                  type="button" 
                  onClick={() => pesquisarUsuarioMutation.mutate()}
                  disabled={!valorPesquisa || pesquisando}
                >
                  {pesquisando ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                  Pesquisar
                </Button>
              </div>
            </div>

            {/* Resultado da pesquisa */}
            {pesquisaRealizada && (
              <div className="py-2">
                {usuarioEncontrado ? (
                  <Alert className={usuarioEncontrado.isBeneficiario ? "border-yellow-500 bg-yellow-50" : "border-green-500 bg-green-50"}>
                    <div className="flex items-center gap-3">
                      {usuarioEncontrado.isBeneficiario ? (
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                      <div>
                        <AlertTitle className="text-sm font-medium">
                          {usuarioEncontrado.isBeneficiario ? "Usuário já é beneficiário" : "Usuário encontrado"}
                        </AlertTitle>
                        <AlertDescription className="text-sm">
                          <strong>Nome:</strong> {usuarioEncontrado.name}<br />
                          <strong>E-mail:</strong> {usuarioEncontrado.email}<br />
                          {usuarioEncontrado.cpf && <><strong>CPF:</strong> {usuarioEncontrado.cpf}<br /></>}
                          {usuarioEncontrado.isBeneficiario && (
                            <Badge className="mt-1 bg-yellow-500">Este usuário já é um beneficiário registrado</Badge>
                          )}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Usuário não encontrado</AlertTitle>
                    <AlertDescription>
                      Nenhum usuário encontrado com este {tipoPesquisa === 'email' ? 'e-mail' : 'CPF'}.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Seleção de benefício */}
            {usuarioEncontrado && !usuarioEncontrado.isBeneficiario && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="beneficioId">Benefício a ser concedido</Label>
                  <Select
                    onValueChange={(value) => form.setValue('beneficioId', parseInt(value))}
                    value={form.watch('beneficioId')?.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um benefício" />
                    </SelectTrigger>
                    <SelectContent>
                      {carregandoBeneficios ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : beneficios && beneficios.length > 0 ? (
                        beneficios.map((beneficio: any) => (
                          <SelectItem key={beneficio.id} value={beneficio.id.toString()}>
                            {beneficio.nome}
                            {beneficio.valor > 0 && ` - ${beneficio.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-center text-muted-foreground">
                          Nenhum benefício disponível
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.beneficioId && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.beneficioId.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="recorrente"
                    checked={form.watch('recorrente')}
                    onCheckedChange={(checked) => form.setValue('recorrente', checked)}
                  />
                  <Label htmlFor="recorrente" className="cursor-pointer">
                    Benefício recorrente
                  </Label>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="dataValidade">Data de validade</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !form.watch('dataValidade') && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.watch('dataValidade') ? (
                          format(form.watch('dataValidade'), "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione a data de validade</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={form.watch('dataValidade')}
                        onSelect={(date) => form.setValue('dataValidade', date)}
                        initialFocus
                        locale={ptBR}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Observações sobre a concessão do benefício..."
                    {...form.register('observacoes')}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            {usuarioEncontrado && !usuarioEncontrado.isBeneficiario && (
              <Button 
                type="submit" 
                disabled={converterMutation.isPending || !form.watch('beneficioId')}
              >
                {converterMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Converter em Beneficiário
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}