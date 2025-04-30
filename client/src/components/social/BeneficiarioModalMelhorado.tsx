import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Check, FileText, Clipboard } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { ProgressStatus } from "@/components/ui/progress-status";
import { CompletionModal } from "@/components/ui/completion-modal";

// Esquema de validação para o formulário
const formSchema = z.object({
  name: z.string().min(3, { message: 'Nome é obrigatório e deve ter pelo menos 3 caracteres' }),
  cpf: z.string().min(11, { message: 'CPF inválido' }),
  rg: z.string().optional().or(z.literal('')),
  email: z.string().email({ message: 'E-mail inválido' }).min(1, { message: 'E-mail é obrigatório' }),
  phone: z.string().min(10, { message: 'Telefone inválido' }).min(1, { message: 'Telefone é obrigatório' }),
  address: z.string().min(1, { message: 'Endereço é obrigatório' }),
  addressNumber: z.string().optional().or(z.literal('')),
  addressComplement: z.string().optional().or(z.literal('')),
  neighborhood: z.string().min(1, { message: 'Bairro é obrigatório' }),
  city: z.string().min(2, { message: 'Cidade é obrigatória' }),
  state: z.string().min(2, { message: 'Estado é obrigatório' }),
  zipCode: z.string().min(1, { message: 'CEP é obrigatório' }),
  birthDate: z.string().min(1, { message: 'Data de nascimento é obrigatória' }),
  gender: z.string().optional().or(z.literal('')),
  occupation: z.string().optional().or(z.literal('')),
  monthlyIncome: z.string().optional().or(z.literal('')),
  familyMembers: z.string().optional().or(z.literal('')),
  needsCategory: z.array(z.string()).default([]),
  exemptionType: z.enum(['exemption_25', 'exemption_50', 'exemption_75', 'exemption_100']).default('exemption_25'),
  exemptionValue: z.string().default('25'),
  educationLevel: z.string().optional().or(z.literal('')),
  housingType: z.string().optional().or(z.literal('')),
  hasHealthInsurance: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
  // Novos campos para associações
  membershipType: z.enum(['regular', 'premium', 'lifetime', 'temporary']).optional(),
});

type FormData = z.infer<typeof formSchema>;

// Categorias de necessidades disponíveis
const needsCategoryOptions = [
  { id: 'medical', label: 'Médica' },
  { id: 'medication', label: 'Medicamentos' },
  { id: 'psychological', label: 'Psicológica' },
  { id: 'financial', label: 'Financeira' },
  { id: 'legal', label: 'Jurídica' },
  { id: 'educational', label: 'Educacional' },
  { id: 'housing', label: 'Moradia' },
  { id: 'food', label: 'Alimentação' },
  { id: 'clothing', label: 'Vestuário' },
  { id: 'transportation', label: 'Transporte' },
];

interface BeneficiarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BeneficiarioModalMelhorado({ open, onOpenChange }: BeneficiarioModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [registrationStep, setRegistrationStep] = useState<'form' | 'processing' | 'completed'>('form');
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [beneficiarioId, setBeneficiarioId] = useState<string | null>(null);
  
  // Initialize form with default values
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      cpf: '',
      rg: '',
      email: '',
      phone: '',
      address: '',
      addressNumber: '',
      addressComplement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      birthDate: '',
      gender: '',
      occupation: '',
      monthlyIncome: '',
      familyMembers: '',
      needsCategory: [],
      exemptionType: 'exemption_25',
      exemptionValue: '25',
      educationLevel: '',
      housingType: '',
      hasHealthInsurance: '',
      notes: '',
      status: 'active',
      membershipType: 'regular',
    }
  });

  // Create mutation for form submission
  const createBeneficiary = useMutation({
    mutationFn: async (data: FormData) => {
      // Simular progresso
      setRegistrationStep('processing');
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setProgressPercentage(Math.min(progress, 90)); // Limitado a 90% até completar
        if (progress >= 90) clearInterval(interval);
      }, 500);

      // Requisição real
      const response = await apiRequest('/api/social/beneficiaries', {
        method: 'POST',
        data
      });
      
      // Limpar o intervalo e definir 100%
      clearInterval(interval);
      setProgressPercentage(100);
      
      // Aguardar um momento para mostrar 100% antes de mostrar o modal de conclusão
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return response;
    },
    onSuccess: (response: any) => {
      const id = response?.data?.id || 'novo-beneficiario';
      setBeneficiarioId(id);
      
      // Atualizar a UI para mostrar conclusão
      setRegistrationStep('completed');
      setShowCompletionModal(true);
      
      // Atualizar a lista de beneficiários
      queryClient.invalidateQueries({ queryKey: ['/api/social/beneficiaries'] });
    },
    onError: (error: any) => {
      setRegistrationStep('form');
      const errorMessage = error.response?.data?.message || error.message || 'Ocorreu um erro ao cadastrar o beneficiário';
      toast({
        title: 'Erro no cadastro',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createBeneficiary.mutate(data);
  };

  const handleCompletionClose = () => {
    setShowCompletionModal(false);
    form.reset();
    onOpenChange(false);
  };

  // Regras, direitos e deveres do associado
  const membershipRules = {
    regular: {
      rights: [
        "Direito a participar das assembleias",
        "Acesso a benefícios médicos básicos",
        "Participação em eventos da associação"
      ],
      duties: [
        "Manter os dados cadastrais atualizados",
        "Pagamento da contribuição mensal",
        "Respeitar as normas da associação"
      ]
    },
    premium: {
      rights: [
        "Todos os benefícios do plano regular",
        "Prioridade em consultas e agendamentos",
        "Acesso a especialistas exclusivos",
        "Descontos em serviços parceiros"
      ],
      duties: [
        "Manter os dados cadastrais atualizados",
        "Pagamento da contribuição premium",
        "Participar de ao menos uma assembleia anual"
      ]
    }
  };

  // Determinar qual conjunto de regras mostrar com base no tipo de associação
  const membershipType = form.watch('membershipType') || 'regular';
  const currentRules = membershipType === 'premium' ? membershipRules.premium : membershipRules.regular;

  return (
    <>
      <Dialog open={open} onOpenChange={(state) => {
        if (!createBeneficiary.isPending) {
          onOpenChange(state);
          if (!state) {
            setRegistrationStep('form');
            setProgressPercentage(0);
          }
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-xl">
              {registrationStep === 'form' && "Cadastrar Novo Beneficiário"}
              {registrationStep === 'processing' && "Processando Cadastro"}
              {registrationStep === 'completed' && "Cadastro Finalizado"}
            </DialogTitle>
            <DialogDescription>
              {registrationStep === 'form' && "Preencha o formulário com os dados do beneficiário"}
              {registrationStep === 'processing' && "Por favor, aguarde enquanto processamos o cadastro"}
              {registrationStep === 'completed' && "O cadastro foi concluído com sucesso!"}
            </DialogDescription>
          </DialogHeader>
          
          {registrationStep === 'processing' && (
            <div className="p-6">
              <ProgressStatus 
                status="processing" 
                progress={progressPercentage}
                message="Aguarde um momento. Não vai demorar."
              />
            </div>
          )}
          
          {registrationStep === 'completed' && (
            <div className="p-6">
              <ProgressStatus 
                status="completed" 
                progress={100}
                message="Cadastro concluído com sucesso!"
              />
            </div>
          )}
          
          {registrationStep === 'form' && (
            <>
              <ScrollArea className="flex-grow px-6">
                <Form {...form}>
                  <form id="beneficiario-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                    <Tabs defaultValue="pessoal" className="w-full">
                      <TabsList className="grid grid-cols-5 mb-4">
                        <TabsTrigger value="pessoal">Dados Pessoais</TabsTrigger>
                        <TabsTrigger value="endereco">Endereço</TabsTrigger>
                        <TabsTrigger value="socio">Socioeconômico</TabsTrigger>
                        <TabsTrigger value="necessidades">Necessidades</TabsTrigger>
                        <TabsTrigger value="associacao">Associação</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="pessoal" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome Completo*</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nome do beneficiário" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="cpf"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CPF*</FormLabel>
                                <FormControl>
                                  <Input placeholder="000.000.000-00" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="rg"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>RG</FormLabel>
                                <FormControl>
                                  <Input placeholder="Número do RG" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>E-mail</FormLabel>
                                <FormControl>
                                  <Input placeholder="email@exemplo.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Telefone</FormLabel>
                                <FormControl>
                                  <Input placeholder="(00) 00000-0000" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="birthDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Data de Nascimento*</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Gênero</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="masculino">Masculino</SelectItem>
                                    <SelectItem value="feminino">Feminino</SelectItem>
                                    <SelectItem value="outro">Outro</SelectItem>
                                    <SelectItem value="prefiro_nao_informar">Prefiro não informar</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Status*</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="active">Ativo</SelectItem>
                                    <SelectItem value="inactive">Inativo</SelectItem>
                                    <SelectItem value="pending">Pendente</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="endereco" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem className="col-span-1 md:col-span-2">
                                <FormLabel>Endereço*</FormLabel>
                                <FormControl>
                                  <Input placeholder="Rua/Logradouro" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="addressNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Número</FormLabel>
                                <FormControl>
                                  <Input placeholder="Número" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="addressComplement"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Complemento</FormLabel>
                              <FormControl>
                                <Input placeholder="Apto, bloco, casa, etc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="neighborhood"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bairro</FormLabel>
                                <FormControl>
                                  <Input placeholder="Bairro" {...field} />
                                </FormControl>
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
                                  <Input placeholder="00000-000" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cidade*</FormLabel>
                                <FormControl>
                                  <Input placeholder="Cidade" {...field} />
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
                                <FormLabel>Estado*</FormLabel>
                                <FormControl>
                                  <Input placeholder="UF" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="socio" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="occupation"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Profissão</FormLabel>
                                <FormControl>
                                  <Input placeholder="Profissão" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="monthlyIncome"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Renda Mensal</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="0,00" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="familyMembers"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Membros na Família</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="0" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="exemptionType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo de Isenção</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="exemption_25">25% de desconto</SelectItem>
                                    <SelectItem value="exemption_50">50% de desconto</SelectItem>
                                    <SelectItem value="exemption_75">75% de desconto</SelectItem>
                                    <SelectItem value="exemption_100">100% de desconto</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="exemptionValue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Valor da Isenção (%)</FormLabel>
                                <FormControl>
                                  <Input type="number" min="0" max="100" placeholder="0" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="educationLevel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Escolaridade</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="nenhuma">Nenhuma</SelectItem>
                                    <SelectItem value="fundamental_incompleto">Fundamental Incompleto</SelectItem>
                                    <SelectItem value="fundamental_completo">Fundamental Completo</SelectItem>
                                    <SelectItem value="medio_incompleto">Médio Incompleto</SelectItem>
                                    <SelectItem value="medio_completo">Médio Completo</SelectItem>
                                    <SelectItem value="superior_incompleto">Superior Incompleto</SelectItem>
                                    <SelectItem value="superior_completo">Superior Completo</SelectItem>
                                    <SelectItem value="pos_graduacao">Pós-Graduação</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="housingType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo de Moradia</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="propria">Própria</SelectItem>
                                    <SelectItem value="alugada">Alugada</SelectItem>
                                    <SelectItem value="cedida">Cedida</SelectItem>
                                    <SelectItem value="financiada">Financiada</SelectItem>
                                    <SelectItem value="sem_teto">Sem moradia fixa</SelectItem>
                                    <SelectItem value="outro">Outro</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="hasHealthInsurance"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Possui Plano de Saúde</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="sim">Sim</SelectItem>
                                    <SelectItem value="nao">Não</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="necessidades" className="space-y-4">
                        <FormField
                          control={form.control}
                          name="needsCategory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Categorias de Necessidades</FormLabel>
                              <FormDescription>
                                Selecione as categorias de necessidades do beneficiário
                              </FormDescription>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                                {needsCategoryOptions.map((option) => (
                                  <FormItem
                                    key={option.id}
                                    className="flex flex-row items-start space-x-3 space-y-0 p-2 border rounded-md"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(option.id)}
                                        onCheckedChange={(checked) => {
                                          const updatedValue = checked
                                            ? [...field.value, option.id]
                                            : field.value?.filter((value) => value !== option.id);
                                          field.onChange(updatedValue);
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      {option.label}
                                    </FormLabel>
                                  </FormItem>
                                ))}
                              </div>
                              <FormMessage />
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
                                  placeholder="Informações adicionais sobre o beneficiário..."
                                  className="min-h-[120px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                      
                      {/* Nova aba para informações de associação */}
                      <TabsContent value="associacao" className="space-y-6">
                        <div className="bg-muted/30 p-4 rounded-md mb-4">
                          <h3 className="text-lg font-medium mb-2">Informações de Associado</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Configure detalhes da associação como tipo de membro e período de associação.
                            Estes dados serão utilizados para a emissão da carteirinha do associado.
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <FormField
                              control={form.control}
                              name="membershipType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tipo de Associação</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tipo" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="regular">Regular</SelectItem>
                                      <SelectItem value="premium">Premium</SelectItem>
                                      <SelectItem value="lifetime">Vitalício</SelectItem>
                                      <SelectItem value="temporary">Temporário</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>
                                    Tipo de associação determina os benefícios e contribuições
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Data de Início</label>
                                <Input type="date" defaultValue={new Date().toISOString().substring(0, 10)} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Data de Término</label>
                                <Input type="date" />
                                <p className="text-xs text-muted-foreground">Deixe em branco para associação sem prazo</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4 bg-slate-50 p-4 rounded-md">
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold flex items-center gap-2">
                                <Clipboard className="h-4 w-4" />
                                Direitos e Deveres do Associado
                              </h4>
                              
                              <div className="space-y-3 text-sm">
                                <div>
                                  <h5 className="font-medium">Direitos:</h5>
                                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                    {currentRules.rights.map((right, index) => (
                                      <li key={index}>{right}</li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div>
                                  <h5 className="font-medium">Deveres:</h5>
                                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                    {currentRules.duties.map((duty, index) => (
                                      <li key={index}>{duty}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </form>
                </Form>
              </ScrollArea>
              
              <DialogFooter className="px-6 py-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  form="beneficiario-form"
                  disabled={createBeneficiary.isPending}
                  className="gap-2"
                >
                  {createBeneficiary.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Salvar Beneficiário
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
          
          {registrationStep === 'completed' && (
            <DialogFooter className="px-6 py-4 border-t">
              <Button
                variant="default"
                onClick={() => {
                  setShowCompletionModal(true);
                }}
              >
                <Check className="h-4 w-4 mr-2" />
                Ver Resumo
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Modal de conclusão com QR Code */}
      <CompletionModal
        open={showCompletionModal}
        onOpenChange={setShowCompletionModal}
        title="Cadastro Concluído com Sucesso!"
        description="O beneficiário foi cadastrado no sistema e já pode acessar os benefícios disponíveis."
        qrCodeData={`beneficiario-id:${beneficiarioId}`}
        leftContent={
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Informações Cadastrais</h3>
              <ul className="space-y-1">
                <li className="text-sm flex justify-between">
                  <span className="text-muted-foreground">Nome:</span>
                  <span className="font-medium">{form.getValues().name}</span>
                </li>
                <li className="text-sm flex justify-between">
                  <span className="text-muted-foreground">CPF:</span>
                  <span className="font-medium">{form.getValues().cpf}</span>
                </li>
                <li className="text-sm flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium">
                    {form.getValues().status === 'active' ? 'Ativo' : 
                     form.getValues().status === 'pending' ? 'Pendente' : 'Inativo'}
                  </span>
                </li>
                <li className="text-sm flex justify-between">
                  <span className="text-muted-foreground">Associação:</span>
                  <span className="font-medium">
                    {form.getValues().membershipType === 'regular' ? 'Regular' : 
                     form.getValues().membershipType === 'premium' ? 'Premium' : 
                     form.getValues().membershipType === 'lifetime' ? 'Vitalício' : 'Temporário'}
                  </span>
                </li>
              </ul>
            </div>
            
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Use o código QR ao lado para validar as informações do associado ou 
                para adicionar rapidamente em sistemas integrados.
              </p>
            </div>
          </div>
        }
        rightContent={
          <div className="text-center space-y-2">
            <h3 className="font-medium">Carteirinha de Associado</h3>
            <p className="text-xs text-muted-foreground mb-2">
              Escaneie para acessar os dados completos
            </p>
          </div>
        }
        primaryButtonText="Concluir"
        secondaryButtonText="Imprimir Comprovante"
        onPrimaryButtonClick={handleCompletionClose}
        onSecondaryButtonClick={() => {
          // Lógica para impressão aqui
          window.print();
        }}
        footerContent={
          <p className="text-xs text-muted-foreground w-full text-center">
            Este cadastro foi realizado em {new Date().toLocaleDateString()} às {new Date().toLocaleTimeString()}
          </p>
        }
      />
    </>
  );
}