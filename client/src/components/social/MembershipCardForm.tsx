import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CreditCard, QrCode, Upload, Lock, UserSquare, X } from "lucide-react";

// Interface para o beneficiário (associado)
interface Beneficiary {
  id: number;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  birthDate: string;
  address: string;
  city: string;
  state: string;
  membershipType?: string;
}

// Esquema de validação para o formulário
const formSchema = z.object({
  beneficiaryId: z.number({
    required_error: "Selecione um associado"
  }),
  cardType: z.enum(["digital", "physical", "both"], {
    required_error: "Selecione o tipo de carteirinha"
  }),
  physicalCardRequested: z.boolean().default(false),
  generatePin: z.boolean().default(true),
  notes: z.string().optional(),
});

// Tipo para valores do formulário com base no esquema Zod
type FormValues = z.infer<typeof formSchema>;

interface MembershipCardFormProps {
  cardId?: number; // Se fornecido, estamos editando uma carteirinha existente
  onSuccess?: () => void;
}

export function MembershipCardForm({ cardId, onSuccess }: MembershipCardFormProps) {
  const { toast } = useToast();
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);

  // Configurar o formulário com Zod e React Hook Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardType: "digital",
      physicalCardRequested: false,
      generatePin: true,
      notes: "",
    }
  });

  // Buscar dados do cartão se estivermos editando
  const { data: cardData, isLoading: isLoadingCard } = useQuery({
    queryKey: ['/api/social/membership-cards', cardId],
    queryFn: async () => {
      if (!cardId) return null;
      try {
        const response = await fetch(`/api/social/membership-cards/${cardId}`);
        if (!response.ok) throw new Error('Falha ao carregar dados da carteirinha');
        return await response.json();
      } catch (error) {
        console.error('Erro ao carregar carteirinha:', error);
        return null;
      }
    },
    enabled: !!cardId
  });

  // Buscar configurações das carteirinhas
  const { data: cardSettings } = useQuery({
    queryKey: ['/api/social/membership-card-settings'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/social/membership-card-settings');
        if (!response.ok) throw new Error('Falha ao carregar configurações');
        return await response.json();
      } catch (error) {
        console.error('Erro ao buscar configurações de carteirinha:', error);
        return null;
      }
    }
  });

  // Buscar lista de beneficiários (associados) para o select
  const { data: beneficiaries, isLoading: isLoadingBeneficiaries } = useQuery({
    queryKey: ['/api/social/beneficiaries'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/social/beneficiaries');
        if (!response.ok) throw new Error('Falha ao carregar associados');
        return await response.json();
      } catch (error) {
        console.error('Erro ao buscar associados:', error);
        return [];
      }
    }
  });

  // Preencher o formulário se estamos editando uma carteirinha existente
  useEffect(() => {
    if (cardData) {
      form.reset({
        beneficiaryId: cardData.beneficiaryId,
        cardType: cardData.cardType,
        physicalCardRequested: cardData.physicalCardRequested,
        generatePin: cardData.pin ? false : true, // Se já existe um PIN, não gerar um novo
        notes: cardData.notes || "",
      });

      if (cardData.photoUrl) {
        setPreviewPhoto(cardData.photoUrl);
      }
    }
  }, [cardData, form]);

  // Mutation para criar/editar carteirinha
  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const url = cardId 
        ? `/api/social/membership-cards/${cardId}` 
        : '/api/social/membership-cards';
      
      const method = cardId ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: data
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao salvar carteirinha');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: cardId ? "Carteirinha atualizada" : "Carteirinha criada",
        description: cardId 
          ? "As alterações foram salvas com sucesso"
          : "A carteirinha foi criada com sucesso",
      });

      // Invalidar queries para atualizar os dados
      queryClient.invalidateQueries({ queryKey: ['/api/social/membership-cards'] });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao salvar a carteirinha",
        variant: "destructive",
      });
    }
  });

  // Lidar com o envio do formulário
  const onSubmit = async (values: FormValues) => {
    const formData = new FormData();
    
    // Adicionar todos os campos do formulário
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
    
    // Adicionar a foto se foi enviada
    if (uploadedPhoto) {
      formData.append('photo', uploadedPhoto);
    }
    
    // Enviar o formulário
    mutation.mutate(formData);
  };

  // Lidar com o upload de foto
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar tipo e tamanho
    if (!file.type.includes('image/')) {
      toast({
        title: "Formato inválido",
        description: "Por favor, envie apenas arquivos de imagem",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 5MB",
        variant: "destructive",
      });
      return;
    }

    // Criar URL para preview
    const fileUrl = URL.createObjectURL(file);
    setPreviewPhoto(fileUrl);
    setUploadedPhoto(file);
  };

  // Remover foto
  const removePhoto = () => {
    setPreviewPhoto(null);
    setUploadedPhoto(null);
  };

  // Mockup para beneficiários enquanto não temos a API
  const mockBeneficiaries: Beneficiary[] = [
    {
      id: 1,
      name: "Maria Silva",
      email: "maria@example.com",
      cpf: "123.456.789-00",
      phone: "(11) 98765-4321",
      birthDate: "1985-05-15",
      address: "Rua das Flores, 123",
      city: "São Paulo",
      state: "SP",
      membershipType: "regular"
    },
    {
      id: 2,
      name: "João Santos",
      email: "joao@example.com",
      cpf: "987.654.321-00",
      phone: "(11) 91234-5678",
      birthDate: "1990-10-20",
      address: "Av. Paulista, 1000",
      city: "São Paulo",
      state: "SP",
      membershipType: "premium"
    },
    {
      id: 3,
      name: "Pedro Oliveira",
      email: "pedro@example.com",
      cpf: "456.789.123-00",
      phone: "(11) 94567-8901",
      birthDate: "1978-03-25",
      address: "Rua Augusta, 500",
      city: "São Paulo",
      state: "SP",
      membershipType: "regular"
    }
  ];

  // Usar os dados reais ou o mockup
  const displayBeneficiaries = beneficiaries || mockBeneficiaries;

  // Obter dados do beneficiário selecionado
  const selectedBeneficiary = form.watch('beneficiaryId') 
    ? displayBeneficiaries.find(b => b.id === form.watch('beneficiaryId'))
    : null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna 1: Informações básicas */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados da Carteirinha</CardTitle>
                <CardDescription>
                  Defina as informações básicas da carteirinha
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="beneficiaryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Associado</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um associado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingBeneficiaries ? (
                            <SelectItem value="loading" disabled>
                              Carregando associados...
                            </SelectItem>
                          ) : displayBeneficiaries.length === 0 ? (
                            <SelectItem value="empty" disabled>
                              Nenhum associado encontrado
                            </SelectItem>
                          ) : (
                            displayBeneficiaries.map((beneficiary) => (
                              <SelectItem 
                                key={beneficiary.id} 
                                value={beneficiary.id.toString()}
                              >
                                {beneficiary.name} - {beneficiary.cpf}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Selecione o associado para quem a carteirinha será emitida
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cardType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Tipo de Carteirinha</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="digital" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Digital (QR Code)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="physical" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Física (Impressa)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="both" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Digital + Física
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(form.watch('cardType') === 'physical' || form.watch('cardType') === 'both') && (
                  <FormField
                    control={form.control}
                    name="physicalCardRequested"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Solicitar carteirinha física</FormLabel>
                          <FormDescription>
                            Será cobrada uma taxa de {cardSettings?.physicalCardPrice || 'R$ 25,00'} para emissão e envio
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

                <FormField
                  control={form.control}
                  name="generatePin"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Gerar PIN de segurança</FormLabel>
                        <FormDescription>
                          Gera um código PIN de {cardSettings?.pinDigits || 6} dígitos para acesso seguro
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={!!cardData?.pin}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Adicione observações sobre esta carteirinha"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Coluna 2: Foto do associado e upload */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Foto e Documento</CardTitle>
                <CardDescription>
                  Adicione a foto do associado para a carteirinha
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg">
                  {previewPhoto ? (
                    <div className="relative">
                      <img 
                        src={previewPhoto} 
                        alt="Preview da foto" 
                        className="w-48 h-48 object-cover rounded-lg" 
                      />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                        aria-label="Remover foto"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <UserSquare className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Arraste uma imagem ou clique para fazer upload
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Formatos aceitos: PNG, JPG ou JPEG (máx. 5MB)
                      </p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="w-full max-w-xs"
                      />
                    </>
                  )}
                </div>

                <Separator />

                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Requisitos da foto:</h3>
                  <ul className="text-sm space-y-1 list-disc pl-5 text-muted-foreground">
                    <li>Fundo branco ou claro</li>
                    <li>Rosto centralizado e visível</li>
                    <li>Sem óculos escuros ou chapéus</li>
                    <li>Boa iluminação frontal</li>
                    <li>Expressão neutra</li>
                    <li>Formato 3x4 ou quadrado</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna 3: Dados do associado selecionado */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados do Associado</CardTitle>
                <CardDescription>
                  Informações do associado selecionado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedBeneficiary ? (
                  <div className="text-center p-4 text-muted-foreground">
                    Selecione um associado para visualizar os dados
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Nome completo</p>
                      <p className="text-sm border p-2 rounded-md bg-muted/20">
                        {selectedBeneficiary.name}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">CPF</p>
                        <p className="text-sm border p-2 rounded-md bg-muted/20">
                          {selectedBeneficiary.cpf}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Data de Nascimento</p>
                        <p className="text-sm border p-2 rounded-md bg-muted/20">
                          {new Date(selectedBeneficiary.birthDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm border p-2 rounded-md bg-muted/20">
                          {selectedBeneficiary.email}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Telefone</p>
                        <p className="text-sm border p-2 rounded-md bg-muted/20">
                          {selectedBeneficiary.phone}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Endereço</p>
                      <p className="text-sm border p-2 rounded-md bg-muted/20">
                        {selectedBeneficiary.address}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Cidade</p>
                        <p className="text-sm border p-2 rounded-md bg-muted/20">
                          {selectedBeneficiary.city}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Estado</p>
                        <p className="text-sm border p-2 rounded-md bg-muted/20">
                          {selectedBeneficiary.state}
                        </p>
                      </div>
                    </div>
                    
                    {selectedBeneficiary.membershipType && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Tipo de Associado</p>
                        <p className="text-sm border p-2 rounded-md bg-muted/20">
                          {selectedBeneficiary.membershipType === 'regular' && 'Regular'}
                          {selectedBeneficiary.membershipType === 'premium' && 'Premium'}
                          {selectedBeneficiary.membershipType === 'lifetime' && 'Vitalício'}
                          {selectedBeneficiary.membershipType === 'temporary' && 'Temporário'}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoadingCard || mutation.isPending}>
            {mutation.isPending && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {cardId ? 'Atualizar Carteirinha' : 'Criar Carteirinha'}
          </Button>
        </div>
      </form>
    </Form>
  );
}