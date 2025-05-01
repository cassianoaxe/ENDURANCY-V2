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
    queryKey: ['/api/carteirinha/membership-cards', cardId],
    queryFn: async () => {
      if (!cardId) return null;
      try {
        const response = await fetch(`/api/carteirinha/membership-cards/${cardId}`);
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
    queryKey: ['/api/carteirinha/membership-card-settings'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/carteirinha/membership-card-settings');
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
    queryKey: ['/api/carteirinha/beneficiaries'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/carteirinha/beneficiaries');
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
        ? `/api/carteirinha/membership-cards/${cardId}` 
        : '/api/carteirinha/membership-cards';
      
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
      queryClient.invalidateQueries({ queryKey: ['/api/carteirinha/membership-cards'] });
      
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

          {/* Coluna 2: Foto do Associado */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Foto do Associado</CardTitle>
                <CardDescription>
                  Faça upload da foto do associado para a carteirinha
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center justify-center">
                  {previewPhoto ? (
                    <div className="relative w-48 h-48 mb-4">
                      <img
                        src={previewPhoto}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                        onClick={removePhoto}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-48 h-48 mb-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      <UserSquare className="h-16 w-16 text-gray-400" />
                    </div>
                  )}

                  <div className="flex justify-center">
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <div className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md flex items-center">
                        <Upload className="h-4 w-4 mr-2" />
                        <span>{previewPhoto ? 'Trocar foto' : 'Enviar foto'}</span>
                      </div>
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </label>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground text-center mt-2">
                  <p>Recomendações:</p>
                  <ul className="list-disc list-inside text-left mt-1">
                    <li>Formato 3x4 ou quadrado</li>
                    <li>Fundo branco ou claro</li>
                    <li>Boa iluminação</li>
                    <li>Tamanho máximo: 5MB</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna 3: Pré-visualização e Dados do Associado */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pré-visualização</CardTitle>
                <CardDescription>
                  Como a carteirinha ficará após ser gerada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg overflow-hidden border">
                  <div className="bg-primary p-4 text-primary-foreground">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold">Carteira de Associado</h3>
                        <p className="text-xs opacity-90">Válida até: {cardData?.expiryDate ? new Date(cardData.expiryDate).toLocaleDateString('pt-BR') : '01/01/2026'}</p>
                      </div>
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-1">
                        <img
                          src={cardSettings?.organizationLogo || "https://via.placeholder.com/40"}
                          alt="Logo"
                          className="max-w-full max-h-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex">
                    <div className="mr-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-md overflow-hidden">
                        {previewPhoto ? (
                          <img src={previewPhoto} alt="Foto" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UserSquare className="h-10 w-10 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1">
                      <h4 className="font-bold">
                        {selectedBeneficiary?.name || "Nome do Associado"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Nº Associado: {selectedBeneficiary?.membershipType || "A12345"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        CPF: {selectedBeneficiary?.cpf || "123.456.789-00"}
                      </p>
                      
                      <div className="mt-2 flex items-center space-x-2 text-sm text-muted-foreground">
                        <QrCode className="h-4 w-4" />
                        <span>QR Code disponível após aprovação</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedBeneficiary && (
              <Card>
                <CardHeader>
                  <CardTitle>Dados do Associado</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <dt className="font-medium">Nome:</dt>
                    <dd>{selectedBeneficiary.name}</dd>
                    
                    <dt className="font-medium">Email:</dt>
                    <dd>{selectedBeneficiary.email}</dd>
                    
                    <dt className="font-medium">CPF:</dt>
                    <dd>{selectedBeneficiary.cpf}</dd>
                    
                    <dt className="font-medium">Telefone:</dt>
                    <dd>{selectedBeneficiary.phone}</dd>
                    
                    <dt className="font-medium">Endereço:</dt>
                    <dd>{selectedBeneficiary.address}</dd>
                    
                    <dt className="font-medium">Cidade/UF:</dt>
                    <dd>{selectedBeneficiary.city}/{selectedBeneficiary.state}</dd>
                  </dl>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess?.()}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            disabled={mutation.isPending}
            className="min-w-[120px]"
          >
            {mutation.isPending ? (
              <div className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                Salvando...
              </div>
            ) : cardId ? "Atualizar" : "Criar Carteirinha"}
          </Button>
        </div>
      </form>
    </Form>
  );
}