import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { queryClient } from '@/lib/queryClient';
import { 
  BadgePercent, 
  Calendar, 
  DollarSign, 
  Gift, 
  Info, 
  Percent, 
  ShieldQuestion, 
  Tag 
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { DatePicker } from '@/components/ui/date-picker';
import { format, addDays, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Esquema de validação para o formulário
const formSchema = z.object({
  partnerId: z.number().int(),
  title: z.string().min(3, {
    message: 'O título deve ter pelo menos 3 caracteres',
  }),
  description: z.string().min(10, {
    message: 'A descrição deve ter pelo menos 10 caracteres',
  }),
  discountType: z.enum(['percentage', 'value', 'freebie']),
  discountValue: z.number().min(0, {
    message: 'O valor do desconto deve ser maior ou igual a zero',
  }),
  minPurchaseValue: z.number().min(0).optional(),
  validFrom: z.date().optional(),
  validUntil: z.date().optional(),
  isActive: z.boolean().default(true),
  termsAndConditions: z.string().optional(),
  code: z.string().optional(),
}).refine(data => {
  // Verifica se a data final é maior que a data inicial
  if (data.validFrom && data.validUntil) {
    return data.validUntil > data.validFrom;
  }
  return true;
}, {
  message: "A data de validade deve ser posterior à data de início",
  path: ["validUntil"],
});

type FormValues = z.infer<typeof formSchema>;

interface PartnerBenefitFormProps {
  partnerId?: string | number;
  benefitId?: number;
  onSuccess?: () => string | void;
}

export function PartnerBenefitForm({ partnerId, benefitId, onSuccess }: PartnerBenefitFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isShowingAdvancedOptions, setIsShowingAdvancedOptions] = useState(false);
  
  // Converte partnerId para número
  const numericPartnerId = partnerId ? Number(partnerId) : undefined;

  // Buscar dados do parceiro
  const { data: partner } = useQuery({
    queryKey: ['/api/carteirinha/partners', numericPartnerId],
    queryFn: async () => {
      try {
        if (!numericPartnerId) return null;
        
        const response = await fetch(`/api/carteirinha/partners/${numericPartnerId}`);
        if (!response.ok) throw new Error('Falha ao carregar dados do parceiro');
        
        return response.json();
      } catch (error) {
        console.error('Erro ao buscar parceiro:', error);
        return null;
      }
    },
    enabled: !!numericPartnerId
  });

  // Buscar dados do benefício existente se estiver editando
  const { data: existingBenefit, isLoading: isLoadingBenefit } = useQuery({
    queryKey: ['/api/carteirinha/partner-benefits', benefitId],
    queryFn: async () => {
      try {
        if (!benefitId) return null;
        
        const response = await fetch(`/api/carteirinha/partner-benefits/${benefitId}`);
        if (!response.ok) throw new Error('Falha ao carregar dados do benefício');
        
        return response.json();
      } catch (error) {
        console.error('Erro ao buscar benefício:', error);
        return null;
      }
    },
    enabled: !!benefitId
  });

  // Formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      partnerId: numericPartnerId || 0,
      title: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      minPurchaseValue: undefined,
      validFrom: undefined,
      validUntil: undefined,
      isActive: true,
      termsAndConditions: '',
      code: '',
    }
  });
  
  // Atualizar valores padrão quando o partnerId mudar
  React.useEffect(() => {
    if (numericPartnerId) {
      form.setValue('partnerId', numericPartnerId);
    }
  }, [numericPartnerId, form]);

  // Preencher o formulário quando os dados do benefício forem carregados
  React.useEffect(() => {
    if (existingBenefit) {
      form.reset({
        partnerId: existingBenefit.partnerId,
        title: existingBenefit.title,
        description: existingBenefit.description,
        discountType: existingBenefit.discountType,
        discountValue: existingBenefit.discountValue,
        minPurchaseValue: existingBenefit.minPurchaseValue || undefined,
        validFrom: existingBenefit.validFrom ? new Date(existingBenefit.validFrom) : undefined,
        validUntil: existingBenefit.validUntil ? new Date(existingBenefit.validUntil) : undefined,
        isActive: existingBenefit.isActive,
        termsAndConditions: existingBenefit.termsAndConditions || '',
        code: existingBenefit.code || '',
      });
      
      // Se existem datas ou termos, mostrar opções avançadas
      if (existingBenefit.validFrom || existingBenefit.validUntil || existingBenefit.termsAndConditions) {
        setIsShowingAdvancedOptions(true);
      }
    }
  }, [existingBenefit, form]);

  // Mutation para salvar o benefício
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const url = benefitId 
        ? `/api/carteirinha/partner-benefits/${benefitId}` 
        : `/api/carteirinha/partner-benefits`;
      
      const method = benefitId ? 'PUT' : 'POST';
      
      // Formatar datas se existirem
      const formattedValues = {
        ...values,
        validFrom: values.validFrom ? format(values.validFrom, 'yyyy-MM-dd') : null,
        validUntil: values.validUntil ? format(values.validUntil, 'yyyy-MM-dd') : null,
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedValues),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao salvar benefício');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: benefitId ? 'Benefício atualizado' : 'Benefício criado',
        description: benefitId 
          ? 'O benefício foi atualizado com sucesso.' 
          : 'O benefício foi adicionado com sucesso.',
      });
      
      // Invalidar queries para atualizar os dados
      queryClient.invalidateQueries({ queryKey: ['/api/carteirinha/partner-benefits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/carteirinha/partners', numericPartnerId] });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao salvar o benefício',
        variant: 'destructive',
      });
    }
  });

  // Função para lidar com o envio do formulário
  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  // Mostrar loading enquanto carrega dados existentes
  if (benefitId && isLoadingBenefit) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Benefício</CardTitle>
            <CardDescription>
              Cadastre um benefício ou desconto para o programa de parceiros
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {partner && (
              <div className="bg-muted p-4 rounded mb-6">
                <h3 className="font-medium mb-1">Parceiro: {partner.name}</h3>
                <p className="text-sm text-muted-foreground">{partner.description}</p>
              </div>
            )}
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Benefício</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Desconto de 15% em produtos" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Nome do benefício ou desconto oferecido
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva detalhes sobre o benefício ou desconto" 
                      className="resize-none min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Detalhes sobre o que o associado recebe
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Desconto</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de desconto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">
                          <div className="flex items-center">
                            <Percent className="h-4 w-4 mr-2 text-green-500" />
                            <span>Percentual</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="value">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-blue-500" />
                            <span>Valor Fixo</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="freebie">
                          <div className="flex items-center">
                            <Gift className="h-4 w-4 mr-2 text-purple-500" />
                            <span>Brinde/Item Grátis</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Como o desconto será aplicado
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="discountValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {form.watch('discountType') === 'percentage' ? 'Percentual de Desconto' : 
                       form.watch('discountType') === 'value' ? 'Valor do Desconto (R$)' : 
                       'Valor do Brinde (R$)'}
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                          {form.watch('discountType') === 'percentage' ? (
                            <Percent className="h-4 w-4" />
                          ) : (
                            <DollarSign className="h-4 w-4" />
                          )}
                        </span>
                        <Input 
                          type="number"
                          step={form.watch('discountType') === 'percentage' ? "1" : "0.01"}
                          min="0"
                          className="rounded-l-none" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          value={field.value || 0}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      {form.watch('discountType') === 'percentage' ? 'Porcentagem de desconto (0-100)' : 
                       form.watch('discountType') === 'value' ? 'Valor monetário do desconto' : 
                       'Valor estimado do item gratuito'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="minPurchaseValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Mínimo de Compra (opcional)</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                      </span>
                      <Input 
                        type="number"
                        step="0.01"
                        min="0"
                        className="rounded-l-none" 
                        placeholder="0.00"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Valor mínimo de compra para o desconto ser aplicado
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código Promocional (opcional)</FormLabel>
                  <FormControl>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                        <Tag className="h-4 w-4" />
                      </span>
                      <Input 
                        className="rounded-l-none uppercase" 
                        placeholder="DESCONTO15" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Código para obter o desconto (se aplicável)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsShowingAdvancedOptions(!isShowingAdvancedOptions)}
                className="px-0 font-normal text-sm text-muted-foreground"
              >
                {isShowingAdvancedOptions ? 'Ocultar' : 'Mostrar'} opções avançadas
              </Button>
            </div>
            
            {isShowingAdvancedOptions && (
              <>
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Período de Validade</h3>
                  <p className="text-sm text-muted-foreground">
                    Defina quando o benefício estará disponível
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="validFrom"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de Início</FormLabel>
                        <FormControl>
                          <DatePicker
                            selected={field.value}
                            onSelect={field.onChange}
                            locale={ptBR}
                            disabled={(date) => date < new Date()}
                            iconLeft={<Calendar className="h-4 w-4" />}
                          />
                        </FormControl>
                        <FormDescription>
                          Quando o desconto começa a valer
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="validUntil"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de Término</FormLabel>
                        <FormControl>
                          <DatePicker
                            selected={field.value}
                            onSelect={field.onChange}
                            locale={ptBR}
                            disabled={(date) => date < (form.watch('validFrom') || new Date())}
                            iconLeft={<Calendar className="h-4 w-4" />}
                          />
                        </FormControl>
                        <FormDescription>
                          Quando o desconto expira
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="text-xs"
                    onClick={() => {
                      const today = new Date();
                      form.setValue('validFrom', today);
                      form.setValue('validUntil', addMonths(today, 3));
                    }}
                  >
                    3 meses
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-xs"
                    onClick={() => {
                      const today = new Date();
                      form.setValue('validFrom', today);
                      form.setValue('validUntil', addMonths(today, 6));
                    }}
                  >
                    6 meses
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-xs"
                    onClick={() => {
                      const today = new Date();
                      form.setValue('validFrom', today);
                      form.setValue('validUntil', addMonths(today, 12));
                    }}
                  >
                    1 ano
                  </Button>
                </div>
                
                <Separator className="my-4" />
                
                <FormField
                  control={form.control}
                  name="termsAndConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Termos e Condições</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva os termos, restrições ou condições para uso do benefício" 
                          className="resize-none min-h-[100px]" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Regras específicas, limitações ou exceções
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Ativo</FormLabel>
                    <FormDescription>
                      Determina se este benefício está disponível para os associados
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
            
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (existingBenefit) {
                  form.reset({
                    partnerId: existingBenefit.partnerId,
                    title: existingBenefit.title,
                    description: existingBenefit.description,
                    discountType: existingBenefit.discountType,
                    discountValue: existingBenefit.discountValue,
                    minPurchaseValue: existingBenefit.minPurchaseValue || undefined,
                    validFrom: existingBenefit.validFrom ? new Date(existingBenefit.validFrom) : undefined,
                    validUntil: existingBenefit.validUntil ? new Date(existingBenefit.validUntil) : undefined,
                    isActive: existingBenefit.isActive,
                    termsAndConditions: existingBenefit.termsAndConditions || '',
                    code: existingBenefit.code || '',
                  });
                } else {
                  form.reset({
                    partnerId: numericPartnerId || 0,
                    title: '',
                    description: '',
                    discountType: 'percentage',
                    discountValue: 0,
                    minPurchaseValue: undefined,
                    validFrom: undefined,
                    validUntil: undefined,
                    isActive: true,
                    termsAndConditions: '',
                    code: '',
                  });
                }
              }}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  Salvando...
                </>
              ) : (
                benefitId ? 'Atualizar Benefício' : 'Criar Benefício'
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}