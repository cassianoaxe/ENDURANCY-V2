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
  Calendar, 
  CreditCard, 
  QrCode, 
  Search, 
  Smartphone, 
  User, 
  Printer,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { DatePicker } from '@/components/ui/date-picker';
import { format, addDays, addMonths, addYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

// Esquema de validação para o formulário
const formSchema = z.object({
  beneficiaryId: z.number().int().positive({
    message: 'Selecione um associado válido',
  }),
  cardNumber: z.string().optional(),
  issueDate: z.date(),
  expiryDate: z.date(),
  digitalOnly: z.boolean().default(true),
  physicalCardRequested: z.boolean().default(false),
  notes: z.string().optional(),
  photo: z.string().optional(),
}).refine(data => {
  // Verifica se a data de validade é posterior à data de emissão
  return data.expiryDate > data.issueDate;
}, {
  message: "A data de validade deve ser posterior à data de emissão",
  path: ["expiryDate"],
});

type FormValues = z.infer<typeof formSchema>;

interface MembershipCardFormProps {
  cardId?: number;
  onSuccess?: () => string | void;
}

export function MembershipCardForm({ cardId, onSuccess }: MembershipCardFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  // Buscar configurações de carteirinha para obter template, etc.
  const { data: settings } = useQuery({
    queryKey: ['/api/carteirinha/membership-cards/settings/current'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/carteirinha/membership-cards/settings/current');
        if (!response.ok) throw new Error('Falha ao carregar configurações');
        
        return await response.json();
      } catch (error) {
        console.error('Erro ao buscar configurações:', error);
        return {
          template: 'standard',
          validityPeriod: 12,
          physicalCardPrice: 25.00,
          organizationLogoUrl: '',
          physicalCardsEnabled: true,
          primaryColor: '#1E40AF',
          secondaryColor: '#60A5FA',
        };
      }
    }
  });
  
  // Buscar beneficiários/associados que podem receber carteirinha
  const { data: beneficiaries, isLoading: isLoadingBeneficiaries } = useQuery({
    queryKey: ['/api/carteirinha/beneficiaries'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/carteirinha/beneficiaries');
        if (!response.ok) throw new Error('Falha ao carregar beneficiários');
        
        return await response.json();
      } catch (error) {
        console.error('Erro ao buscar beneficiários:', error);
        return [];
      }
    }
  });
  
  // Buscar dados da carteirinha existente se estiver editando
  const { data: existingCard, isLoading: isLoadingCard } = useQuery({
    queryKey: ['/api/carteirinha/membership-cards', cardId],
    queryFn: async () => {
      try {
        if (!cardId) return null;
        
        const response = await fetch(`/api/carteirinha/membership-cards/${cardId}`);
        if (!response.ok) throw new Error('Falha ao carregar dados da carteirinha');
        
        return await response.json();
      } catch (error) {
        console.error('Erro ao buscar carteirinha:', error);
        return null;
      }
    },
    enabled: !!cardId
  });

  // Formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      beneficiaryId: 0,
      cardNumber: '',
      issueDate: new Date(),
      expiryDate: addYears(new Date(), 1), // Validade padrão de 1 ano
      digitalOnly: true,
      physicalCardRequested: false,
      notes: '',
      photo: ''
    }
  });
  
  // Atualizar data de expiração quando as configurações forem carregadas
  React.useEffect(() => {
    if (settings && !cardId) {
      const issueDate = new Date();
      const expiryDate = addMonths(issueDate, settings.validityPeriod || 12);
      form.setValue('issueDate', issueDate);
      form.setValue('expiryDate', expiryDate);
    }
  }, [settings, form, cardId]);

  // Preencher o formulário quando os dados da carteirinha forem carregados
  React.useEffect(() => {
    if (existingCard) {
      form.reset({
        beneficiaryId: existingCard.beneficiaryId,
        cardNumber: existingCard.cardNumber,
        issueDate: new Date(existingCard.issueDate),
        expiryDate: new Date(existingCard.expiryDate),
        digitalOnly: existingCard.digitalOnly,
        physicalCardRequested: existingCard.physicalCardStatus !== null,
        notes: existingCard.notes || '',
        photo: existingCard.photo || ''
      });
      
      setSelectedBeneficiary(existingCard.beneficiary);
      if (existingCard.photo) {
        setPhotoPreview(existingCard.photo);
      }
    }
  }, [existingCard, form]);

  // Função para filtrar beneficiários
  const filterBeneficiaries = (data = []) => {
    if (!searchTerm) return data.slice(0, 50);
    
    const searchLower = searchTerm.toLowerCase();
    return data.filter(b => 
      b.name.toLowerCase().includes(searchLower) ||
      b.cpf.includes(searchTerm) ||
      b.email?.toLowerCase().includes(searchLower)
    ).slice(0, 20);
  };
  
  // Beneficiários filtrados para exibição
  const filteredBeneficiaries = filterBeneficiaries(beneficiaries);
  
  // Mutation para salvar a carteirinha
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const url = cardId 
        ? `/api/carteirinha/membership-cards/${cardId}` 
        : `/api/carteirinha/membership-cards`;
      
      const method = cardId ? 'PUT' : 'POST';
      
      // Formatar datas
      const formattedValues = {
        ...values,
        issueDate: format(values.issueDate, 'yyyy-MM-dd'),
        expiryDate: format(values.expiryDate, 'yyyy-MM-dd'),
        // Determinar status da carteirinha física
        physicalCardStatus: values.physicalCardRequested ? 'pending' : null,
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
        throw new Error(errorData.message || 'Falha ao salvar carteirinha');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: cardId ? 'Carteirinha atualizada' : 'Carteirinha emitida',
        description: cardId 
          ? 'A carteirinha foi atualizada com sucesso.' 
          : 'A carteirinha foi emitida com sucesso.',
      });
      
      // Invalidar queries para atualizar os dados
      queryClient.invalidateQueries({ queryKey: ['/api/carteirinha/membership-cards'] });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao salvar a carteirinha',
        variant: 'destructive',
      });
    }
  });

  // Função para lidar com o envio do formulário
  const onSubmit = (values: FormValues) => {
    if (values.beneficiaryId === 0) {
      toast({
        title: 'Erro',
        description: 'Selecione um associado para emitir a carteirinha',
        variant: 'destructive',
      });
      return;
    }
    
    mutation.mutate(values);
  };
  
  // Função para gerar número da carteirinha
  const generateCardNumber = () => {
    const prefix = 'ASC';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const cardNumber = `${prefix}${timestamp}${random}`;
    form.setValue('cardNumber', cardNumber);
  };
  
  // Função para simular upload de foto
  const handlePhotoUpload = (e) => {
    // Simulação de upload - em produção, use upload real
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const photoUrl = event.target.result as string;
        setPhotoPreview(photoUrl);
        form.setValue('photo', photoUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Mostrar loading enquanto carrega dados existentes
  if (cardId && isLoadingCard) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="info" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Informações Básicas</span>
            </TabsTrigger>
            <TabsTrigger value="photo" className="flex items-center">
              <Smartphone className="mr-2 h-4 w-4" />
              <span>Foto e Personalização</span>
            </TabsTrigger>
            <TabsTrigger value="physical" className="flex items-center">
              <Printer className="mr-2 h-4 w-4" />
              <span>Carteirinha Física</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Carteirinha</CardTitle>
                <CardDescription>
                  {cardId ? 'Edite os dados da carteirinha' : 'Preencha os dados para emitir uma nova carteirinha'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="beneficiaryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Associado</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <div className="relative">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Pesquisar por nome, CPF ou email"
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                disabled={!!cardId}
                              />
                            </div>
                            
                            {isLoadingBeneficiaries ? (
                              <div className="p-2 text-center">
                                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full inline-block mr-2"></div>
                                <span>Carregando associados...</span>
                              </div>
                            ) : searchTerm && filteredBeneficiaries.length === 0 ? (
                              <div className="p-4 border rounded-md text-center">
                                <p className="text-muted-foreground">Nenhum associado encontrado com esses critérios</p>
                              </div>
                            ) : searchTerm && filteredBeneficiaries.length > 0 ? (
                              <Card className="border">
                                <ScrollArea className="h-48">
                                  <div className="p-1">
                                    {filteredBeneficiaries.map(beneficiary => (
                                      <div
                                        key={beneficiary.id}
                                        className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-accent ${
                                          field.value === beneficiary.id ? 'bg-accent' : ''
                                        }`}
                                        onClick={() => {
                                          if (!cardId) {
                                            field.onChange(beneficiary.id);
                                            setSelectedBeneficiary(beneficiary);
                                            setSearchTerm('');
                                          }
                                        }}
                                      >
                                        <Avatar className="h-8 w-8 mr-2">
                                          <AvatarFallback>{beneficiary.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                          <p className="text-sm font-medium">{beneficiary.name}</p>
                                          <p className="text-xs text-muted-foreground">
                                            CPF: {beneficiary.cpf} • {beneficiary.email}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </Card>
                            ) : selectedBeneficiary ? (
                              <div className="p-3 border rounded-md">
                                <div className="flex items-center">
                                  <Avatar className="h-10 w-10 mr-3">
                                    <AvatarFallback>{selectedBeneficiary.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{selectedBeneficiary.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      CPF: {selectedBeneficiary.cpf}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {selectedBeneficiary.email} • {selectedBeneficiary.phone}
                                    </p>
                                  </div>
                                  {!cardId && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="ml-auto"
                                      onClick={() => {
                                        field.onChange(0);
                                        setSelectedBeneficiary(null);
                                      }}
                                    >
                                      Alterar
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 border rounded-md text-center">
                                <p className="text-muted-foreground">Pesquise e selecione um associado</p>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex flex-col md:flex-row gap-4">
                    <FormField
                      control={form.control}
                      name="cardNumber"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Número da Carteirinha</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <Input 
                                placeholder="ASC123456789" 
                                {...field} 
                                value={field.value || ''}
                                className="rounded-r-none"
                              />
                              <Button
                                type="button"
                                variant="secondary"
                                className="rounded-l-none"
                                onClick={generateCardNumber}
                                disabled={!!cardId}
                              >
                                Gerar
                              </Button>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Identificador único da carteirinha
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="issueDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data de Emissão</FormLabel>
                          <FormControl>
                            <DatePicker
                              selected={field.value}
                              onSelect={field.onChange}
                              locale={ptBR}
                              disabled={!!cardId}
                              iconLeft={<Calendar className="h-4 w-4" />}
                            />
                          </FormControl>
                          <FormDescription>
                            Data de emissão da carteirinha
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data de Validade</FormLabel>
                          <FormControl>
                            <DatePicker
                              selected={field.value}
                              onSelect={field.onChange}
                              locale={ptBR}
                              disabled={(date) => date < form.watch('issueDate')}
                              iconLeft={<Calendar className="h-4 w-4" />}
                            />
                          </FormControl>
                          <FormDescription>
                            Data de validade da carteirinha
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações (opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Adicione informações adicionais se necessário" 
                            className="resize-none min-h-[80px]" 
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Observações internas sobre a carteirinha
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="photo" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Foto e Personalização</CardTitle>
                <CardDescription>
                  Adicione uma foto do associado e personalize a carteirinha
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <FormField
                      control={form.control}
                      name="photo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Foto do Associado</FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              <div className="border rounded-md p-4 flex flex-col items-center justify-center">
                                {photoPreview ? (
                                  <div className="relative w-40 h-40 my-2">
                                    <img 
                                      src={photoPreview} 
                                      alt="Foto do Associado" 
                                      className="w-full h-full object-cover rounded-md" 
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                      onClick={() => {
                                        setPhotoPreview(null);
                                        field.onChange('');
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="w-40 h-40 bg-muted rounded-md flex items-center justify-center mb-4">
                                    <User className="h-16 w-16 text-muted-foreground" />
                                  </div>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  id="photo-upload"
                                  className="hidden"
                                  onChange={handlePhotoUpload}
                                />
                                <label htmlFor="photo-upload">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="cursor-pointer"
                                    asChild
                                  >
                                    <span>Selecionar Foto</span>
                                  </Button>
                                </label>
                              </div>
                              <FormDescription>
                                A foto do associado será exibida na carteirinha digital
                              </FormDescription>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Prévia da Carteirinha</h3>
                    <div className="relative w-full h-56 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg overflow-hidden shadow-lg">
                      <div className="absolute top-0 left-0 w-full h-full p-4 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          {settings?.organizationLogoUrl ? (
                            <img
                              src={settings.organizationLogoUrl}
                              alt="Logo da Organização"
                              className="h-8 object-contain"
                            />
                          ) : (
                            <div className="text-white font-bold">ASSOCIAÇÃO</div>
                          )}
                          <div className="bg-white/90 p-1 rounded text-blue-800 text-xs font-bold">
                            {form.watch('cardNumber') || 'ASC000000000'}
                          </div>
                        </div>
                        
                        <div className="flex">
                          <div className="mr-3">
                            {photoPreview ? (
                              <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white">
                                <img 
                                  src={photoPreview} 
                                  alt="Foto do Associado" 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                                <User className="h-8 w-8 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="text-white">
                            <h3 className="font-bold text-base">
                              {selectedBeneficiary?.name || 'Nome do Associado'}
                            </h3>
                            <p className="text-xs opacity-90">
                              CPF: {selectedBeneficiary?.cpf || '000.000.000-00'}
                            </p>
                            <div className="text-xs mt-1 opacity-80">
                              Validade: {form.watch('expiryDate') ? format(form.watch('expiryDate'), 'dd/MM/yyyy') : '--/--/----'}
                            </div>
                            <div className="mt-2">
                              <Badge variant="outline" className="bg-white/10 text-white border-white/30 text-xs">
                                Associado
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-center items-center">
                          <div className="bg-white p-2 rounded-md">
                            <QrCode className="h-7 w-7 text-blue-800" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Prévia ilustrativa - a aparência final pode variar de acordo com as configurações
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="physical" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Carteirinha Física</CardTitle>
                <CardDescription>
                  Opções para solicitar a emissão de uma carteirinha física
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="digitalOnly"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Carteirinha Digital</FormLabel>
                          <FormDescription>
                            Emitir apenas versão digital (padrão)
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (checked) {
                                // Se digital apenas, desativa solicitação física
                                form.setValue('physicalCardRequested', false);
                              }
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Separator className="my-2" />
                  
                  {settings?.physicalCardsEnabled ? (
                    <FormField
                      control={form.control}
                      name="physicalCardRequested"
                      render={({ field }) => (
                        <FormItem className={`flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm ${
                          form.watch('digitalOnly') ? 'opacity-50' : ''
                        }`}>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <FormLabel>Solicitar Carteirinha Física</FormLabel>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div>
                                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Valor: R$ {settings?.physicalCardPrice?.toFixed(2) || '25,00'}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <FormDescription>
                              Solicitar impressão e entrega da carteirinha física
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                if (form.watch('digitalOnly') && checked) {
                                  toast({
                                    title: "Configuração inválida",
                                    description: "Desative a opção 'Carteirinha Digital' primeiro para solicitar uma física",
                                    variant: "destructive",
                                  });
                                } else {
                                  field.onChange(checked);
                                  if (checked) {
                                    // Se solicitou física, assegura que não é digital only
                                    form.setValue('digitalOnly', false);
                                  }
                                }
                              }}
                              disabled={form.watch('digitalOnly')}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ) : (
                    <div className="rounded-lg border p-4 bg-amber-50 border-amber-200">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-amber-800">Carteirinhas físicas indisponíveis</h4>
                          <p className="text-sm text-amber-700 mt-1">
                            A emissão de carteirinhas físicas está temporariamente indisponível.
                            Para mais informações, contate o administrador do sistema.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {form.watch('physicalCardRequested') && (
                    <div className="rounded-lg border p-4 bg-blue-50 border-blue-200 mt-4">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-800">Informações sobre carteirinha física</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Ao solicitar uma carteirinha física, será cobrado o valor de 
                            <strong> R$ {settings?.physicalCardPrice?.toFixed(2) || '25,00'}</strong> por carteirinha.
                            A carteirinha será enviada para o endereço cadastrado no perfil do associado.
                          </p>
                          <p className="text-sm text-blue-700 mt-2">
                            Tempo estimado de produção e entrega: <strong>7 a 14 dias úteis</strong>.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (existingCard) {
                form.reset({
                  beneficiaryId: existingCard.beneficiaryId,
                  cardNumber: existingCard.cardNumber,
                  issueDate: new Date(existingCard.issueDate),
                  expiryDate: new Date(existingCard.expiryDate),
                  digitalOnly: existingCard.digitalOnly,
                  physicalCardRequested: existingCard.physicalCardStatus !== null,
                  notes: existingCard.notes || '',
                  photo: existingCard.photo || ''
                });
              } else {
                form.reset({
                  beneficiaryId: 0,
                  cardNumber: '',
                  issueDate: new Date(),
                  expiryDate: addYears(new Date(), 1),
                  digitalOnly: true,
                  physicalCardRequested: false,
                  notes: '',
                  photo: ''
                });
                setSelectedBeneficiary(null);
                setPhotoPreview(null);
              }
            }}
          >
            Resetar
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
              cardId ? 'Atualizar Carteirinha' : 'Emitir Carteirinha'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}