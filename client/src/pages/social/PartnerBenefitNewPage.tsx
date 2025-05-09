import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { OrganizationShell } from "@/components/shell";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { queryClient } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";

// Interface do parceiro
interface Partner {
  id: number;
  name: string;
  // Outros campos do parceiro conforme necessário
}

// Esquema de validação para o formulário de benefício
const benefitFormSchema = z.object({
  title: z.string().min(5, {
    message: "O título deve ter pelo menos 5 caracteres.",
  }),
  description: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres.",
  }),
  discountType: z.enum(["percentage", "fixed_value", "free_item"], {
    required_error: "Selecione o tipo de desconto.",
  }),
  discountValue: z.coerce.number().min(0, {
    message: "O valor do desconto deve ser positivo.",
  }),
  minimumPurchase: z.coerce.number().min(0, {
    message: "O valor mínimo de compra deve ser positivo.",
  }).optional(),
  validFrom: z.date({
    required_error: "A data de início da validade é obrigatória.",
  }),
  validUntil: z.date().optional(),
  termsAndConditions: z.string().optional(),
  redemptionInstructions: z.string().optional(),
  couponCode: z.string().optional(),
});

type BenefitFormValues = z.infer<typeof benefitFormSchema>;

export default function PartnerBenefitNewPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [match, params] = useRoute("/social/partners/:id/benefit/new");

  // ID do parceiro da URL
  const partnerId = match ? parseInt(params.id) : null;

  // Buscar detalhes do parceiro
  const { data: partner, isLoading: isLoadingPartner } = useQuery({
    queryKey: ['/api/social/partners', partnerId],
    queryFn: async () => {
      if (!partnerId) return null;
      
      const response = await fetch(`/api/social/partners/${partnerId}`);
      if (!response.ok) throw new Error('Falha ao carregar dados do parceiro');
      
      return await response.json();
    },
    enabled: !!partnerId
  });

  // Configurar o formulário
  const form = useForm<BenefitFormValues>({
    resolver: zodResolver(benefitFormSchema),
    defaultValues: {
      title: "",
      description: "",
      discountType: "percentage",
      discountValue: 0,
      minimumPurchase: undefined,
      validFrom: new Date(),
      validUntil: undefined,
      termsAndConditions: "",
      redemptionInstructions: "",
      couponCode: "",
    },
  });

  // Mutation para criar benefício
  const mutation = useMutation({
    mutationFn: async (values: BenefitFormValues) => {
      if (!partnerId || !user?.organizationId) {
        throw new Error("ID do parceiro ou da organização não encontrado");
      }

      const response = await fetch('/api/social/partner-benefits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          partnerId,
          organizationId: user.organizationId,
          // Converter datas para ISO string
          validFrom: values.validFrom.toISOString(),
          validUntil: values.validUntil ? values.validUntil.toISOString() : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao criar benefício");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Benefício criado com sucesso",
        description: "O benefício foi adicionado ao parceiro",
      });
      
      // Invalidar cache
      queryClient.invalidateQueries({ queryKey: ['/api/social/partners'] });
      queryClient.invalidateQueries({ queryKey: ['/api/social/partner-benefits'] });
      
      // Redirecionar para página do parceiro
      if (partnerId) {
        navigate(`/social/partners/${partnerId}`);
      } else {
        navigate("/social/partners");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar benefício",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Enviar formulário
  const onSubmit = (values: BenefitFormValues) => {
    mutation.mutate(values);
  };

  // Se não tiver ID do parceiro, mostrar mensagem de erro
  if (!partnerId) {
    return (
      <OrganizationShell title="">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">Erro</h2>
          </div>
          <p>ID do parceiro não encontrado.</p>
          <Link href="/social/partners">
            <Button>Voltar para lista de parceiros</Button>
          </Link>
        </div>
      </OrganizationShell>
    );
  }

  return (
    <OrganizationShell title="">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href={`/social/partners/${partnerId}`}>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h2 className="text-3xl font-bold">Novo Benefício</h2>
              {partner && <p className="text-muted-foreground">Para {partner.name}</p>}
            </div>
          </div>
        </div>

        {isLoadingPartner ? (
          <div className="flex justify-center p-8">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações do Benefício</CardTitle>
                    <CardDescription>Defina as informações básicas do benefício</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 20% de desconto em produtos" {...field} />
                          </FormControl>
                          <FormDescription>
                            Um título claro e direto para o benefício
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
                              placeholder="Detalhe o benefício oferecido" 
                              className="resize-none" 
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discountType"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Tipo de Desconto</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="percentage" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Porcentagem
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="fixed_value" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Valor Fixo
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="free_item" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Item Grátis
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discountValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor do Desconto</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder={field.value === "percentage" ? "Ex: 20 (para 20%)" : "Ex: 50.00"} 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            {form.watch("discountType") === "percentage" 
                              ? "Valor em porcentagem (ex: 20 para 20%)" 
                              : form.watch("discountType") === "fixed_value" 
                                ? "Valor fixo em reais" 
                                : "Quantidade de itens grátis"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="minimumPurchase"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Mínimo de Compra (opcional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Ex: 100.00" 
                              {...field} 
                              value={field.value === undefined ? "" : field.value.toString()}
                              onChange={e => {
                                const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Valor mínimo de compra para aplicar o desconto (opcional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Validade e Instruções</CardTitle>
                    <CardDescription>Define o período de validade e instruções de uso</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="validFrom"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Válido a partir de</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={
                                    "w-full pl-3 text-left font-normal"
                                  }
                                >
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: ptBR })
                                  ) : (
                                    <span>Selecione uma data</span>
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
                                disabled={(date) =>
                                  date < new Date()
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="validUntil"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Válido até (opcional)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={
                                    "w-full pl-3 text-left font-normal"
                                  }
                                >
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: ptBR })
                                  ) : (
                                    <span>Selecione uma data</span>
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
                                disabled={(date) =>
                                  date < form.watch("validFrom")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Se não especificado, o benefício terá validade indeterminada
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="termsAndConditions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Termos e Condições (opcional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Exemplo: Não cumulativo com outras promoções" 
                              className="resize-none" 
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="redemptionInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instruções de Resgate (opcional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Como os membros podem utilizar este benefício" 
                              className="resize-none" 
                              rows={2}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="couponCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código do Cupom (opcional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: ASSOC2025" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Código que o associado deve informar para obter o desconto
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end space-x-4">
                <Link href={`/social/partners/${partnerId}`}>
                  <Button variant="outline" type="button">Cancelar</Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={mutation.isPending || isLoadingPartner}
                >
                  {mutation.isPending && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  Adicionar Benefício
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </OrganizationShell>
  );
}