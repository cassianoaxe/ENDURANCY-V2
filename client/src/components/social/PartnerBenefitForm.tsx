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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Calendar, 
  Heart, 
  Image, 
  Info, 
  PercentIcon, 
  Save, 
  Ticket, 
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

// Definir o esquema de validação
const formSchema = z.object({
  title: z.string().min(3, { message: 'O título deve ter pelo menos 3 caracteres' }),
  description: z.string().min(10, { message: 'Descrição muito curta' }),
  
  discountType: z.enum(['percentage', 'fixed_value', 'free_item'], { 
    required_error: 'Selecione um tipo de desconto' 
  }),
  discountValue: z.coerce.number().min(0, { message: 'Valor inválido' }),
  minimumPurchase: z.coerce.number().min(0, { message: 'Valor inválido' }).optional(),
  
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  
  membershipTypeRequired: z.string().optional(),
  termsAndConditions: z.string().optional(),
  redemptionInstructions: z.string().min(1, { message: 'Instruções de resgate obrigatórias' }),
  couponCode: z.string().optional(),
  
  maxUsesTotal: z.coerce.number().min(0, { message: 'Valor inválido' }).optional(),
  maxUsesPerMember: z.coerce.number().min(1, { message: 'Valor inválido' }),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface PartnerBenefitFormProps {
  organizationId: number;
  partnerId: number;
  partnerName?: string;
  benefit?: any; // Para modo de edição
  onSuccess?: () => void;
}

export function PartnerBenefitForm({ 
  organizationId, 
  partnerId, 
  partnerName,
  benefit, 
  onSuccess 
}: PartnerBenefitFormProps) {
  const { toast } = useToast();
  const isEditMode = !!benefit;
  
  // Estado para arquivo de imagem
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(benefit?.imageUrl || null);

  // Buscar dados do parceiro se o nome não foi fornecido
  const { data: partnerData, isLoading: isLoadingPartner } = useQuery({
    queryKey: ['/api/social/partners', partnerId],
    enabled: !partnerName && partnerId > 0,
    refetchOnWindowFocus: false,
  });

  // Formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: benefit ? {
      title: benefit.title,
      description: benefit.description,
      discountType: benefit.discountType,
      discountValue: benefit.discountValue,
      minimumPurchase: benefit.minimumPurchase || undefined,
      validFrom: benefit.validFrom ? new Date(benefit.validFrom).toISOString().slice(0, 10) : '',
      validUntil: benefit.validUntil ? new Date(benefit.validUntil).toISOString().slice(0, 10) : '',
      membershipTypeRequired: benefit.membershipTypeRequired || '',
      termsAndConditions: benefit.termsAndConditions || '',
      redemptionInstructions: benefit.redemptionInstructions || '',
      couponCode: benefit.couponCode || '',
      maxUsesTotal: benefit.maxUsesTotal || undefined,
      maxUsesPerMember: benefit.maxUsesPerMember || 1,
      isActive: benefit.isActive ?? true,
    } : {
      title: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      minimumPurchase: undefined,
      validFrom: new Date().toISOString().slice(0, 10),
      validUntil: '',
      membershipTypeRequired: '',
      termsAndConditions: '',
      redemptionInstructions: '',
      couponCode: '',
      maxUsesTotal: undefined,
      maxUsesPerMember: 1,
      isActive: true,
    },
  });

  // Observar o tipo de desconto para ajustar o label
  const discountType = form.watch('discountType');
  const discountValueLabel = 
    discountType === 'percentage' ? 'Percentual de Desconto (%)' :
    discountType === 'fixed_value' ? 'Valor de Desconto (R$)' :
    'Valor do Item Grátis (R$)';

  // Mutação para criar/atualizar benefício
  const benefitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const url = isEditMode 
        ? `/api/social/partners/benefits/${benefit.id}` 
        : `/api/social/partners/${partnerId}/benefits`;
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: data,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ao ${isEditMode ? 'atualizar' : 'criar'} benefício`);
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: `Benefício ${isEditMode ? 'atualizado' : 'cadastrado'} com sucesso!`,
        description: isEditMode 
          ? 'As informações do benefício foram atualizadas.' 
          : 'O benefício foi adicionado ao clube de descontos.',
      });
      
      // Invalidar queries para forçar a atualização dos dados
      queryClient.invalidateQueries({ queryKey: ['/api/social/partners', partnerId] });
      queryClient.invalidateQueries({ queryKey: ['/api/social/partners/benefits/active'] });
      
      // Redirecionar ou executar callback de sucesso
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = `/social/partners/${partnerId}`;
      }
    },
    onError: (error: Error) => {
      toast({
        title: `Erro ao ${isEditMode ? 'atualizar' : 'cadastrar'} benefício`,
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Manipulador para upload de imagem
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Verificar tamanho e tipo
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'A imagem deve ter no máximo 5MB',
          variant: 'destructive',
        });
        return;
      }
      
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
        toast({
          title: 'Formato inválido',
          description: 'A imagem deve ser nos formatos JPEG, JPG, PNG ou GIF',
          variant: 'destructive',
        });
        return;
      }
      
      setImageFile(file);
      
      // Exibir preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Enviar formulário
  const onSubmit = (values: FormValues) => {
    const formData = new FormData();
    
    // Adicionar campos do formulário
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value.toString());
      }
    });
    
    // Adicionar imagem, se selecionada
    if (imageFile) {
      formData.append('imageFile', imageFile);
    }
    
    // Enviar para a API
    benefitMutation.mutate(formData);
  };

  // Determinar nome do parceiro
  const displayPartnerName = partnerName || partnerData?.partner?.name || `Parceiro #${partnerId}`;

  // Verificar se está carregando parceiro
  if (!partnerName && isLoadingPartner) {
    return <div className="flex items-center justify-center p-8">Carregando dados do parceiro...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? 'Editar Benefício' : 'Novo Benefício'}</CardTitle>
            <CardDescription>
              {isEditMode 
                ? `Atualize as informações do benefício de ${displayPartnerName}` 
                : `Adicione um novo benefício para ${displayPartnerName}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informações básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Informações do Benefício
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Título */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Nome do benefício/desconto oferecido
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Tipo de desconto */}
                <FormField
                  control={form.control}
                  name="discountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Desconto</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de desconto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="percentage">Percentual (%)</SelectItem>
                          <SelectItem value="fixed_value">Valor Fixo (R$)</SelectItem>
                          <SelectItem value="free_item">Item Grátis</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Forma como o desconto será aplicado
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Valor do desconto */}
                <FormField
                  control={form.control}
                  name="discountValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{discountValueLabel}</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step={discountType === 'percentage' ? '1' : '0.01'} {...field} />
                      </FormControl>
                      <FormDescription>
                        {discountType === 'percentage' 
                          ? 'Percentual de desconto oferecido (0-100)'
                          : discountType === 'fixed_value'
                          ? 'Valor em reais do desconto'
                          : 'Valor estimado do item grátis'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Compra mínima */}
                <FormField
                  control={form.control}
                  name="minimumPurchase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Mínimo de Compra (R$)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          placeholder="Opcional" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Valor mínimo de compra para aplicar o desconto (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Descrição */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormDescription>
                      Descrição detalhada do benefício oferecido
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Período de validade */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Período de Validade
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Data inicial */}
                <FormField
                  control={form.control}
                  name="validFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Válido a partir de</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Data de início da validade do benefício
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Data final */}
                <FormField
                  control={form.control}
                  name="validUntil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Válido até</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>
                        Data final da validade (deixe em branco para sem limite)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Restrições e uso */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Ticket className="h-5 w-5 mr-2" />
                Restrições e Uso
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipo de associado requerido */}
                <FormField
                  control={form.control}
                  name="membershipTypeRequired"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Associado Requerido</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Qualquer tipo de associado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Qualquer tipo de associado</SelectItem>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="lifetime">Vitalício</SelectItem>
                          <SelectItem value="temporary">Temporário</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Restrição por tipo de associado (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Código do cupom */}
                <FormField
                  control={form.control}
                  name="couponCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código do Cupom</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Opcional" />
                      </FormControl>
                      <FormDescription>
                        Código promocional para resgatar o benefício (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Limite total de usos */}
                <FormField
                  control={form.control}
                  name="maxUsesTotal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limite Total de Usos</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          placeholder="Sem limite" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Número máximo de usos para todos os associados (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Limite por associado */}
                <FormField
                  control={form.control}
                  name="maxUsesPerMember"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limite de Usos por Associado</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Número máximo de usos por associado
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Termos e condições */}
              <FormField
                control={form.control}
                name="termsAndConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Termos e Condições</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} placeholder="Opcional" />
                    </FormControl>
                    <FormDescription>
                      Termos específicos para o uso deste benefício (opcional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Instruções de resgate */}
              <FormField
                control={form.control}
                name="redemptionInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instruções de Resgate</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormDescription>
                      Como o associado pode resgatar/utilizar este benefício
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Ativo */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Benefício Ativo</FormLabel>
                      <FormDescription>
                        Tornar este benefício visível e disponível para os associados
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
            </div>

            <Separator />

            {/* Imagem do benefício */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Image className="h-5 w-5 mr-2" />
                Imagem do Benefício
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <label 
                      htmlFor="image" 
                      className="cursor-pointer bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md flex items-center"
                    >
                      <Image className="w-4 h-4 mr-2" />
                      {imageFile ? 'Alterar Imagem' : 'Selecionar Imagem'}
                    </label>
                    <span className="text-sm text-muted-foreground">
                      {imageFile ? imageFile.name : 'Nenhuma imagem selecionada'}
                    </span>
                  </div>
                  <Input
                    id="image"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <p className="text-sm text-muted-foreground">
                    Imagem ilustrativa do benefício para exibição no clube de descontos.
                    Formatos: JPEG, JPG, PNG, GIF (máx. 5MB)
                  </p>
                </div>
                
                <div className="flex justify-center">
                  {imagePreview ? (
                    <div className="relative h-40 w-40 rounded-md overflow-hidden border">
                      <img
                        src={imagePreview}
                        alt="Preview da imagem"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-40 w-40 rounded-md bg-secondary flex items-center justify-center border">
                      <Heart className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button 
              type="submit" 
              disabled={benefitMutation.isPending}
            >
              {benefitMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 rounded-full border-2 border-primary border-t-transparent" />
                  {isEditMode ? 'Atualizando...' : 'Cadastrando...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditMode ? 'Atualizar Benefício' : 'Cadastrar Benefício'}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}