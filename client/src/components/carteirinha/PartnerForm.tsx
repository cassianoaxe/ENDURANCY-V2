import React from 'react';
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
import { useAuth } from '@/contexts/AuthContext';
import { queryClient } from '@/lib/queryClient';
import { Upload, Globe, MapPin, Phone, Mail, User, Store } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Esquema de validação para o formulário
const formSchema = z.object({
  organizationId: z.number(),
  name: z.string().min(3, {
    message: 'O nome deve ter pelo menos 3 caracteres',
  }),
  type: z.string().min(2, {
    message: 'Selecione um tipo de parceiro',
  }),
  description: z.string().min(10, {
    message: 'A descrição deve ter pelo menos 10 caracteres',
  }),
  logoUrl: z.string().optional(),
  websiteUrl: z.string().url({
    message: 'URL inválido. Inclua http:// ou https://',
  }).optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email({
    message: 'Email inválido',
  }).optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  discountRange: z.string().optional(),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface PartnerFormProps {
  partnerId?: number;
  onSuccess?: () => string | void;
}

export function PartnerForm({ partnerId, onSuccess }: PartnerFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  // Buscar dados do parceiro existente se estiver editando
  const { data: existingPartner, isLoading: isLoadingPartner } = useQuery({
    queryKey: ['/api/carteirinha/partners', partnerId],
    queryFn: async () => {
      try {
        if (!partnerId) return null;
        const response = await fetch(`/api/carteirinha/partners/${partnerId}`);
        if (!response.ok) throw new Error('Falha ao carregar dados do parceiro');
        return await response.json();
      } catch (error) {
        console.error('Erro ao buscar parceiro:', error);
        return null;
      }
    },
    enabled: !!partnerId
  });

  // Formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationId: user?.organizationId || 0,
      name: '',
      type: 'commerce',
      description: '',
      logoUrl: '',
      websiteUrl: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      discountRange: '',
      isActive: true,
    }
  });

  // Preencher o formulário quando os dados do parceiro forem carregados
  React.useEffect(() => {
    if (existingPartner) {
      form.reset({
        organizationId: user?.organizationId || 0,
        name: existingPartner.name,
        type: existingPartner.type,
        description: existingPartner.description,
        logoUrl: existingPartner.logoUrl || '',
        websiteUrl: existingPartner.websiteUrl || '',
        address: existingPartner.address || '',
        city: existingPartner.city || '',
        state: existingPartner.state || '',
        zipCode: existingPartner.zipCode || '',
        contactName: existingPartner.contactName || '',
        contactEmail: existingPartner.contactEmail || '',
        contactPhone: existingPartner.contactPhone || '',
        discountRange: existingPartner.discountRange || '',
        isActive: existingPartner.isActive,
      });
    }
  }, [existingPartner, form, user?.organizationId]);

  // Mutation para salvar o parceiro
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const url = partnerId 
        ? `/api/carteirinha/partners/${partnerId}` 
        : `/api/carteirinha/partners`;
      
      const method = partnerId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao salvar parceiro');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: partnerId ? 'Parceiro atualizado' : 'Parceiro criado',
        description: partnerId 
          ? 'O parceiro foi atualizado com sucesso.' 
          : 'O parceiro foi adicionado com sucesso.',
      });
      
      // Invalidar queries para atualizar os dados
      queryClient.invalidateQueries({ queryKey: ['/api/carteirinha/partners'] });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao salvar o parceiro',
        variant: 'destructive',
      });
    }
  });

  // Função para lidar com o envio do formulário
  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  // Mostrar loading enquanto carrega dados existentes
  if (partnerId && isLoadingPartner) {
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
            <CardTitle>Informações do Parceiro</CardTitle>
            <CardDescription>
              Cadastre um parceiro para o programa de benefícios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Parceiro</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nome da empresa parceira" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Nome comercial do parceiro
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Parceiro</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de parceiro" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="commerce">Comércio</SelectItem>
                        <SelectItem value="service">Serviço</SelectItem>
                        <SelectItem value="health">Saúde</SelectItem>
                        <SelectItem value="education">Educação</SelectItem>
                        <SelectItem value="food">Alimentação</SelectItem>
                        <SelectItem value="entertainment">Entretenimento</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Categoria principal do parceiro
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva detalhes sobre o parceiro e seus benefícios" 
                      className="resize-none min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Breve descrição sobre o parceiro
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Logo</FormLabel>
                  <FormControl>
                    <div className="flex">
                      <Input 
                        placeholder="https://exemplo.com/logo.png" 
                        {...field} 
                        value={field.value || ''}
                      />
                      {field.value && (
                        <div className="ml-2 h-10 w-10 border rounded flex items-center justify-center overflow-hidden">
                          <img 
                            src={field.value} 
                            alt="Logo do parceiro"
                            className="max-h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/40x40?text=Logo';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    URL da imagem do logo (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="websiteUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                        <Globe className="h-4 w-4" />
                      </span>
                      <Input 
                        className="rounded-l-none" 
                        placeholder="https://www.empresa.com.br" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Site oficial do parceiro (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Endereço</h3>
              <p className="text-sm text-muted-foreground">
                Informações de localização do parceiro
              </p>
            </div>
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <Input 
                        className="rounded-l-none" 
                        placeholder="Rua dos Exemplos, 123" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Endereço principal do parceiro (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="São Paulo" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AC">Acre</SelectItem>
                        <SelectItem value="AL">Alagoas</SelectItem>
                        <SelectItem value="AP">Amapá</SelectItem>
                        <SelectItem value="AM">Amazonas</SelectItem>
                        <SelectItem value="BA">Bahia</SelectItem>
                        <SelectItem value="CE">Ceará</SelectItem>
                        <SelectItem value="DF">Distrito Federal</SelectItem>
                        <SelectItem value="ES">Espírito Santo</SelectItem>
                        <SelectItem value="GO">Goiás</SelectItem>
                        <SelectItem value="MA">Maranhão</SelectItem>
                        <SelectItem value="MT">Mato Grosso</SelectItem>
                        <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                        <SelectItem value="MG">Minas Gerais</SelectItem>
                        <SelectItem value="PA">Pará</SelectItem>
                        <SelectItem value="PB">Paraíba</SelectItem>
                        <SelectItem value="PR">Paraná</SelectItem>
                        <SelectItem value="PE">Pernambuco</SelectItem>
                        <SelectItem value="PI">Piauí</SelectItem>
                        <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                        <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                        <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                        <SelectItem value="RO">Rondônia</SelectItem>
                        <SelectItem value="RR">Roraima</SelectItem>
                        <SelectItem value="SC">Santa Catarina</SelectItem>
                        <SelectItem value="SP">São Paulo</SelectItem>
                        <SelectItem value="SE">Sergipe</SelectItem>
                        <SelectItem value="TO">Tocantins</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="00000-000" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Contato</h3>
              <p className="text-sm text-muted-foreground">
                Informações de contato do responsável
              </p>
            </div>
            
            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Contato</FormLabel>
                  <FormControl>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                        <User className="h-4 w-4" />
                      </span>
                      <Input 
                        className="rounded-l-none" 
                        placeholder="Nome do responsável" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Nome da pessoa responsável (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                          <Mail className="h-4 w-4" />
                        </span>
                        <Input 
                          className="rounded-l-none" 
                          placeholder="contato@empresa.com.br" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Email para contato (opcional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                          <Phone className="h-4 w-4" />
                        </span>
                        <Input 
                          className="rounded-l-none" 
                          placeholder="(00) 00000-0000" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Telefone para contato (opcional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator className="my-4" />
            
            <FormField
              control={form.control}
              name="discountRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faixa de Desconto</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma faixa de desconto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="até 10%">Até 10%</SelectItem>
                      <SelectItem value="de 10% a 20%">De 10% a 20%</SelectItem>
                      <SelectItem value="de 20% a 30%">De 20% a 30%</SelectItem>
                      <SelectItem value="de 30% a 40%">De 30% a 40%</SelectItem>
                      <SelectItem value="acima de 40%">Acima de 40%</SelectItem>
                      <SelectItem value="valor fixo">Valor Fixo</SelectItem>
                      <SelectItem value="brindes">Brindes/Itens Grátis</SelectItem>
                      <SelectItem value="variável">Variável (por produto/serviço)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Faixa de desconto típica oferecida (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Ativo</FormLabel>
                    <FormDescription>
                      Determina se este parceiro está ativo no programa
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
                if (existingPartner) {
                  form.reset({
                    organizationId: user?.organizationId || 0,
                    name: existingPartner.name,
                    type: existingPartner.type,
                    description: existingPartner.description,
                    logoUrl: existingPartner.logoUrl || '',
                    websiteUrl: existingPartner.websiteUrl || '',
                    address: existingPartner.address || '',
                    city: existingPartner.city || '',
                    state: existingPartner.state || '',
                    zipCode: existingPartner.zipCode || '',
                    contactName: existingPartner.contactName || '',
                    contactEmail: existingPartner.contactEmail || '',
                    contactPhone: existingPartner.contactPhone || '',
                    discountRange: existingPartner.discountRange || '',
                    isActive: existingPartner.isActive,
                  });
                } else {
                  form.reset({
                    organizationId: user?.organizationId || 0,
                    name: '',
                    type: 'commerce',
                    description: '',
                    logoUrl: '',
                    websiteUrl: '',
                    address: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    contactName: '',
                    contactEmail: '',
                    contactPhone: '',
                    discountRange: '',
                    isActive: true,
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
                partnerId ? 'Atualizar Parceiro' : 'Criar Parceiro'
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}