import React, { useState, useEffect } from 'react';
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
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  QrCode, 
  Upload, 
  User, 
  AlertCircle, 
  CalendarRange, 
  Save, 
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { format, addYears } from 'date-fns';

// Definir o esquema de validação
const formSchema = z.object({
  beneficiaryId: z.string().min(1, { message: 'Selecione um beneficiário' }),
  cardType: z.enum(['digital', 'physical', 'both'], { 
    required_error: 'Selecione o tipo de carteirinha' 
  }),
  physicalCardRequested: z.boolean().default(false),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MembershipCardFormProps {
  organizationId: number;
  onSuccess?: () => void;
}

export function MembershipCardForm({ organizationId, onSuccess }: MembershipCardFormProps) {
  const { toast } = useToast();
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Buscar beneficiários elegíveis (status='active')
  const { data: beneficiaries, isLoading: isLoadingBeneficiaries } = useQuery({
    queryKey: ['/api/social/beneficiaries', { status: 'active' }],
    refetchOnWindowFocus: false,
  });

  // Buscar configurações atuais das carteirinhas
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['/api/social/membership-cards/settings/current'],
    refetchOnWindowFocus: false,
  });

  // Formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardType: 'digital',
      physicalCardRequested: false,
      notes: '',
    },
  });

  // Efeito para atualizar o tipo de carteirinha quando o physicalCardRequested mudar
  useEffect(() => {
    const physicalRequested = form.watch('physicalCardRequested');
    const currentType = form.watch('cardType');
    
    if (physicalRequested && currentType === 'digital') {
      form.setValue('cardType', 'both');
    } else if (!physicalRequested && currentType === 'both') {
      form.setValue('cardType', 'digital');
    }
  }, [form.watch('physicalCardRequested')]);

  // Efeito para atualizar physicalCardRequested quando o tipo de carteirinha mudar
  useEffect(() => {
    const currentType = form.watch('cardType');
    
    if (currentType === 'physical' || currentType === 'both') {
      form.setValue('physicalCardRequested', true);
    } else {
      form.setValue('physicalCardRequested', false);
    }
  }, [form.watch('cardType')]);

  // Mutação para criar nova carteirinha
  const createCardMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/social/membership-cards', {
        method: 'POST',
        body: data,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar carteirinha');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Carteirinha criada com sucesso!',
        description: 'A carteirinha foi criada e está com status pendente para aprovação.',
      });
      
      // Invalidar queries para forçar a atualização dos dados
      queryClient.invalidateQueries({ queryKey: ['/api/social/membership-cards'] });
      
      // Redirecionar ou executar callback de sucesso
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = `/social/membership-cards/${data.card.id}`;
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar carteirinha',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Selecionar foto do associado
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Verificar tamanho e tipo
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'A foto deve ter no máximo 5MB',
          variant: 'destructive',
        });
        return;
      }
      
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        toast({
          title: 'Formato inválido',
          description: 'A foto deve ser nos formatos JPEG, JPG ou PNG',
          variant: 'destructive',
        });
        return;
      }
      
      setSelectedPhoto(file);
      
      // Exibir preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Enviar formulário
  const onSubmit = (values: FormValues) => {
    const formData = new FormData();
    
    // Adicionar dados do formulário
    formData.append('beneficiaryId', values.beneficiaryId);
    formData.append('cardType', values.cardType);
    formData.append('physicalCardRequested', values.physicalCardRequested.toString());
    
    if (values.notes) {
      formData.append('notes', values.notes);
    }
    
    // Adicionar foto, se selecionada
    if (selectedPhoto) {
      formData.append('photoFile', selectedPhoto);
    }
    
    // Enviar para a API
    createCardMutation.mutate(formData);
  };

  // Verificar se está carregando
  if (isLoadingBeneficiaries || isLoadingSettings) {
    return <div className="flex items-center justify-center p-8">Carregando...</div>;
  }

  // Verificar se existem beneficiários elegíveis
  const eligibleBeneficiaries = beneficiaries || [];
  
  if (eligibleBeneficiaries.length === 0) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-destructive" />
            Nenhum beneficiário elegível
          </CardTitle>
          <CardDescription>
            Não existem beneficiários ativos para emissão de carteirinha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Para criar uma carteirinha, é necessário que o associado tenha status "ativo" no sistema.
            Verifique a lista de beneficiários e certifique-se de que pelo menos um esteja com status ativo.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => window.location.href = '/social/beneficiaries'}>
            Gerenciar Beneficiários
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Nova Carteirinha de Associado</CardTitle>
            <CardDescription>
              Crie uma nova carteirinha digital ou física para um associado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Seleção de beneficiário */}
            <FormField
              control={form.control}
              name="beneficiaryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beneficiário</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um beneficiário" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eligibleBeneficiaries.map((beneficiary) => (
                        <SelectItem 
                          key={beneficiary.id} 
                          value={beneficiary.id.toString()}
                        >
                          {beneficiary.name} - CPF: {beneficiary.cpf}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Selecione o associado para quem a carteirinha será emitida
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Tipo de carteirinha */}
            <FormField
              control={form.control}
              name="cardType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Carteirinha</FormLabel>
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
                      <SelectItem value="digital">
                        <div className="flex items-center">
                          <QrCode className="w-4 h-4 mr-2" />
                          Digital (QR Code)
                        </div>
                      </SelectItem>
                      <SelectItem value="physical">
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Física (Impressa)
                        </div>
                      </SelectItem>
                      <SelectItem value="both">
                        <div className="flex items-center">
                          <QrCode className="w-4 h-4 mr-2" />
                          <CreditCard className="w-4 h-4 mr-2" />
                          Digital e Física
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    A carteirinha digital é gratuita e permite acesso via QR Code. 
                    A carteirinha física é enviada por correio e possui um custo adicional.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Carteirinha física */}
            {settings?.physicalCardEnabled && (
              <FormField
                control={form.control}
                name="physicalCardRequested"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Solicitar Carteirinha Física</FormLabel>
                      <FormDescription>
                        Custo adicional de R$ {settings.physicalCardPrice?.toFixed(2)} 
                        (será gerado um link de pagamento)
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
            )}

            <Separator />

            {/* Upload de foto */}
            <div className="space-y-2">
              <Label>Foto do Associado</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label 
                      htmlFor="photo" 
                      className="cursor-pointer bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md flex items-center"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {selectedPhoto ? 'Alterar Foto' : 'Selecionar Foto'}
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {selectedPhoto ? selectedPhoto.name : 'Nenhuma foto selecionada'}
                    </span>
                  </div>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <p className="text-sm text-muted-foreground">
                    A foto deve estar no formato JPEG, JPG ou PNG e ter no máximo 5MB.
                    Recomendamos uma foto 3x4 com fundo branco.
                  </p>
                </div>
                <div className="flex justify-center">
                  {photoPreview ? (
                    <div className="relative h-40 w-40 rounded-md overflow-hidden border">
                      <img
                        src={photoPreview}
                        alt="Preview da foto"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-40 w-40 rounded-md bg-secondary flex items-center justify-center border">
                      <User className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Validade */}
            <div className="space-y-2">
              <Label>Validade da Carteirinha</Label>
              <div className="flex items-center space-x-2 text-sm">
                <CalendarRange className="h-4 w-4 text-muted-foreground" />
                <span>
                  A carteirinha terá validade de {settings?.validityPeriodMonths || 12} meses a partir da data de emissão.
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Após aprovada, a carteirinha expirará em {format(addYears(new Date(), 1), 'dd/MM/yyyy')}
              </p>
            </div>

            {/* Observações */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Observações adicionais sobre a carteirinha (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              disabled={createCardMutation.isPending}
            >
              {createCardMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 rounded-full border-2 border-primary border-t-transparent" />
                  Criando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Criar Carteirinha
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}