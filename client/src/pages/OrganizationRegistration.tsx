import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InsertOrganization } from '@shared/schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
import { 
  Building2, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Image, 
  Upload
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { OrganizationCompletionModal } from '@/components/organization/OrganizationCompletionModal';

// Tipo do plano conforme retornado pela API
interface Plan {
  id: number;
  name: string;
  description: string;
  tier: string;
  price: number;
  featuredLabel?: string;
  features: string[];
  maxRecords?: number;
  availability?: 'available' | 'limited' | 'comingSoon';
}

// Extensão do schema de inserção para formulário
const formSchema = z.object({
  type: z.string().min(1, 'Selecione o tipo da organização'),
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  cnpj: z.string().min(14, 'CNPJ deve ter ao menos 14 caracteres'),
  website: z.string().optional(),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido'),
  address: z.string().min(5, 'Endereço deve ter ao menos 5 caracteres'),
  city: z.string().min(2, 'Cidade inválida'),
  state: z.string().min(2, 'Estado inválido'),
  adminName: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  adminCpf: z.string().min(11, 'CPF inválido'),
  bankName: z.string().optional(),
  bankBranch: z.string().optional(),
  bankAccount: z.string().optional(),
  planId: z.number().min(1, 'Selecione um plano'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirme sua senha'),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'Você precisa aceitar os termos',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export default function OrganizationRegistration() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Estado para controlar o passo atual do formulário
  const [step, setStep] = useState<number>(1);
  
  // Estados para gestão de arquivos
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentFileName, setDocumentFileName] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoFileName, setLogoFileName] = useState<string | null>(null);
  
  // Estados para o modal de conclusão
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [newOrganization, setNewOrganization] = useState<any>(null);
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  
  // Estados para controle de UI e resumo
  const [showPlanSelection, setShowPlanSelection] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [formDataSummary, setFormDataSummary] = useState<any>(null);
  
  // Consulta para obter os planos disponíveis
  const { data: plans } = useQuery<Plan[]>({
    queryKey: ['/api/public/plans'],
    queryFn: async () => {
      const response = await fetch('/api/public/plans');
      const plansData = await response.json();
      console.log("Planos obtidos da API pública:", plansData);
      return plansData;
    },
  });

  // Inicialização do formulário
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: '',
      name: '',
      cnpj: '',
      website: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      adminName: '',
      adminCpf: '',
      bankName: '',
      bankBranch: '',
      bankAccount: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
      planId: 0,
    }
  });
  // Mutação para criar organização
  const createOrganization = useMutation({
    mutationFn: async (data: InsertOrganization & { document: File, logo?: File }) => {
      const formData = new FormData();
      // Adicionar documento principal
      formData.append('document', data.document);
      
      // Adicionar logomarca se disponível
      if (data.logo) {
        formData.append('logo', data.logo);
      }
      
      // Adicionar os demais campos
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'document' && key !== 'logo') {
          formData.append(key, String(value));
        }
      });

      const response = await fetch('/api/organizations', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create organization');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/organizations'] });
      
      // Salvar o ID da organização recém-criada
      setOrganizationId(data.id);
      // Exibir toast de sucesso na criação da organização
      toast({
        title: "Registro concluído com sucesso!",
        description: "Verifique seu email para receber o link de pagamento.",
        className: "border-green-200 bg-green-50",
      });
      
      // Determinar como proceder com base no tipo de usuário
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser && currentUser.role === 'admin') {
        // Se for admin, redirecionar para a área de solicitações
        navigate('/requests');
      } else {
        // Preparar os dados da organização para o modal de conclusão
        const values = form.getValues();
        const planData = plans?.find(p => p.id === parseInt(String(values.planId)));
        
        // Construir o objeto de organização para o modal
        const orgData = {
          id: data.id,
          name: values.name,
          type: values.type,
          cnpj: values.cnpj,
          email: values.email,
          phone: values.phone,
          adminName: values.adminName,
          createdAt: new Date(),
          planName: planData?.name || "Plano Selecionado"
        };
        
        // Armazenar os dados da nova organização e exibir o modal
        setNewOrganization(orgData);
        setShowCompletionModal(true);
      }
    },
    onError: (error) => {
      console.error("Error creating organization:", error);
      toast({
        title: "Erro ao criar organização",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      });
    },
  });
  // Função para avançar para o próximo passo

  const nextStep = async () => {
    const fields = getFieldsForStep(step);
    const currentStepValid = await form.trigger(fields);
    
    console.log(`Tentando avançar do passo ${step}. Campos válidos: ${currentStepValid}`);
    console.log("Campos para validação:", fields);
    
    // Verificar se o passo atual é válido
    if (currentStepValid && step < 5) {
      // Se estiver no passo 4, preparar o resumo dos dados antes de ir para a confirmação
      if (step === 4) {
        const formData = form.getValues();
        console.log("Dados do formulário no passo 4:", formData);
        
        // Buscar mais detalhes do plano selecionado
        const selectedPlanData = plans?.find(p => p.id === parseInt(String(formData.planId)));
        
        // Definir limites com base no tier do plano
        let userLimit = 0;
        let patientLimit = 0;

        // Determinar limites baseados no tier
        switch (selectedPlanData?.tier) {
          case 'free':
            userLimit = 5;
            patientLimit = 20;
            break;
          case 'seed':
            userLimit = 20;
            patientLimit = 100; 
            break;
          case 'grow':
            userLimit = 50;
            patientLimit = 300;
            break;
          case 'pro':
            userLimit = 100;
            patientLimit = 1000;
            break;
          default:
            userLimit = selectedPlanData?.maxRecords || 0;
            patientLimit = selectedPlanData?.maxRecords ? selectedPlanData.maxRecords * 5 : 0;
        }
        
        console.log('Plano selecionado:', selectedPlanData);

        
        setFormDataSummary({
          ...formData,
          planName: selectedPlanData?.name || '',
          planPrice: selectedPlanData?.price || '',
          planDescription: selectedPlanData?.description || '',
          planFeatures: selectedPlanData?.features || [],
          planUserLimit: userLimit,
          planPatientLimit: patientLimit,
          // Adicionar informação de módulos baseado no tier do plano
          planModules: getTierModules(selectedPlanData?.tier || ''),
          documentName: selectedFile?.name || '',
          logoName: logoFile?.name || null,
        });
      }
      // Sempre prosseguir para o próximo passo
      console.log(`Avançando para o passo ${step + 1}`);
      setStep(prev => prev + 1);
    } else {
      if (!currentStepValid) {
        console.log("Falha na validação. Erros:", form.formState.errors);
      }
    }
  };

  // Função para voltar ao passo anterior
  const prevStep = () => {
    if (step > 1) setStep(prev => prev - 1);
    
    // Reset plan selection state when going back from step 3
    if (step === 3) {
      setShowPlanSelection(false);
    }
  };
  // Função para selecionar um plano
  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    form.setValue('planId', plan.id);
    setShowPlanSelection(false);
  };

  // Função para submeter a organização
  const submitOrganization = () => {
    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Por favor, faça upload do documento necessário.",
        variant: "destructive",
      });
      return;
    }

    if (!form.getValues('termsAccepted')) {
      toast({
        title: "Erro",
        description: "Você precisa aceitar os termos de uso.",
        variant: "destructive",
      });
      return;
    }

    // Criar organização com os dados do formulário e documentos
    const formData = form.getValues();
    // Adicionar logo se estiver disponível
    if (logoFile) {
      createOrganization.mutate({ ...formData, document: selectedFile, logo: logoFile } as any);
    } else {
      createOrganization.mutate({ ...formData, document: selectedFile } as any);
    }
  };

  // Função chamada ao submeter o formulário
  const onSubmit = async (data: InsertOrganization) => {
    // As organizações começam com status pending até que o pagamento seja confirmado
    submitOrganization();
  };

  // Obtém os campos a serem validados para cada passo
  const getFieldsForStep = (step: number): (keyof z.infer<typeof formSchema>)[] => {
    switch (step) {
      case 1: 
        return ['type', 'cnpj', 'website', 'phone', 'email', 'adminCpf', 'adminName', 'password', 'confirmPassword'];
      case 2:
        return ['name', 'address', 'city', 'state', 'bankName', 'bankBranch', 'bankAccount'];
      case 3:
        return ['planId'];
      case 4:
        return ['termsAccepted'];
      default:
        return [];
    }
  };

  // Obtém módulos disponíveis baseado no tier do plano
  const getTierModules = (tier: string): { name: string, included: boolean }[] => {
    const baseFreeModules = [
      { name: 'Controle de Pacientes (Limitado)', included: true },
      { name: 'Gestão de Associados', included: true },
      { name: 'Dashboard Básico', included: true },
    ];
    
    const seedModules = [
      ...baseFreeModules,
      { name: 'Prescrições Digitais', included: true },
      { name: 'Controle de Estoque Básico', included: true },
      { name: 'Relatórios Simples', included: true },
    ];
    
    const growModules = [
      ...seedModules,
      { name: 'Gestão Financeira', included: true },
      { name: 'Agendamento Online', included: true },
      { name: 'Portal do Paciente', included: true },
      { name: 'Notificações Automáticas', included: true },
    ];
    
    const proModules = [
      ...growModules,
      { name: 'Telemedicina Integrada', included: true },
      { name: 'Análise Avançada de Dados', included: true },
      { name: 'Integração com Laboratórios', included: true },
      { name: 'Suporte Prioritário', included: true },
      { name: 'API Completa', included: true },
    ];
    
    switch (tier) {
      case 'free':
        return [
          ...baseFreeModules,
          { name: 'Prescrições Digitais', included: false },
          { name: 'Controle de Estoque', included: false },
          { name: 'Gestão Financeira', included: false },
          { name: 'Telemedicina', included: false },
        ];
      case 'seed':
        return [
          ...seedModules,
          { name: 'Gestão Financeira', included: false },
          { name: 'Agendamento Online', included: false },
          { name: 'Telemedicina', included: false },
        ];
      case 'grow':
        return [
          ...growModules,
          { name: 'Telemedicina Integrada', included: false },
          { name: 'Análise Avançada de Dados', included: false },
          { name: 'API Completa', included: false },
        ];
      case 'pro':
        return proModules;
      default:
        return baseFreeModules;
    }
  };

  // Funções de manipulação do modal
  const handleCloseModal = () => {
    setShowCompletionModal(false);
    // Redirecionar diretamente para a página de login
    window.location.href = '/login';
  };

  const handleViewDashboard = () => {
    setShowCompletionModal(false);
    window.location.href = '/login';
  };

  // Função para renderizar o conteúdo baseado no passo atual
  const renderStepContent = () => {
    console.log(`Renderizando conteúdo para o passo ${step}`);
    
    switch(Number(step)) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Insira as informações básicas da organização</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Organização*</FormLabel>
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
                          <SelectItem value="Empresa">Empresa</SelectItem>
                          <SelectItem value="Associação">Associação</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adminName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Administrador*</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome completo" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ*</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="XX.XXX.XXX/XXXX-XX" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://www.exemplo.com" />
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
                      <FormLabel>Telefone*</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="(XX) XXXXX-XXXX" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email do Administrador*</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="exemplo@dominio.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adminCpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF do Administrador*</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="XXX.XXX.XXX-XX" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Senha*</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Confirmar Senha*</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setSelectedFile(file);
                        if (file) {
                          setDocumentFileName(file.name);
                        } else {
                          setDocumentFileName(null);
                        }
                      }}
                      className="hidden"
                      id="document-upload"
                      accept=".pdf,.doc,.docx"
                    />
                    <label
                      htmlFor="document-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="h-8 w-8 text-primary" />
                      <span className="text-blue-600 hover:text-blue-800 font-medium">
                        {form.watch('type') === 'Empresa' ? 'Upload do Contrato Social*' : 'Upload do Estatuto*'}
                      </span>
                      <span className="text-xs text-gray-500">Formatos aceitos: PDF, DOC, DOCX</span>
                    </label>
                    {selectedFile && (
                      <div className="mt-3 flex items-center justify-center gap-2 text-green-600 bg-green-50 p-2 rounded">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{selectedFile.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Dados da Organização</CardTitle>
              <CardDescription>Insira os dados de identificação da organização</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>Nome da Organização*</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome completo da organização" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>Endereço*</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Rua, número, bairro" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade*</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="col-span-1 md:col-span-2 mt-4 mb-4">
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        
                        // Validar o arquivo antes de definir
                        if (file) {
                          // Verificar se o tamanho do arquivo é aceitável (limite de 2MB)
                          if (file.size > 2 * 1024 * 1024) {
                            toast({
                              title: "Arquivo muito grande",
                              description: "O tamanho máximo permitido é 2MB. Por favor, escolha um arquivo menor.",
                              variant: "destructive",
                            });
                            return;
                          }
                          
                          // Verificar se o tipo do arquivo é uma imagem
                          if (!file.type.startsWith('image/')) {
                            toast({
                              title: "Tipo de arquivo inválido",
                              description: "Por favor, envie apenas arquivos de imagem (JPG, PNG, GIF).",
                              variant: "destructive",
                            });
                            return;
                          }
                          
                          console.log("Logo selecionado:", file.name, "Tipo:", file.type, "Tamanho:", Math.round(file.size / 1024), "KB");
                          
                          setLogoFile(file);
                          setLogoFileName(file.name);
                        } else {
                          setLogoFile(null);
                          setLogoFileName(null);
                        }
                      }}
                      className="hidden"
                      id="logo-upload"
                      accept="image/*"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Image className="h-8 w-8 text-primary" />
                      <span className="text-blue-600 hover:text-blue-800 font-medium">
                        Upload da Logomarca
                      </span>
                      <span className="text-xs text-gray-500">Formatos aceitos: PNG, JPG, GIF (máx. 2MB)</span>
                    </label>
                    {logoFile && (
                      <div className="mt-3 flex items-center justify-center gap-2 text-green-600 bg-green-50 p-2 rounded">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{logoFile.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banco</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome do banco" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="bankBranch"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Agência</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="0000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bankAccount"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Conta</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="00000-0" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Escolha de Plano</CardTitle>
              <CardDescription>Selecione o plano mais adequado para sua organização</CardDescription>
            </CardHeader>
            <CardContent>
              {!showPlanSelection ? (
                <>
                  {selectedPlan ? (
                    <div className="mb-6">
                      <div className="p-4 border rounded-lg mb-4 relative">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{selectedPlan.name}</h3>
                            <p className="text-gray-600">{selectedPlan.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{selectedPlan.price === 0 ? 'Gratuito' : `R$ ${selectedPlan.price}/mês`}</p>
                            {selectedPlan.featuredLabel && (
                              <span className="bg-primary text-white px-2 py-1 rounded-full text-xs font-semibold">
                                {selectedPlan.featuredLabel}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Recursos do plano:</h4>
                          <ul className="space-y-1">
                            {selectedPlan.features.map((feature, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4"
                          onClick={() => setShowPlanSelection(true)}
                        >
                          Alterar plano
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <Alert className="mb-4">
                        <AlertTitle>Escolha um plano</AlertTitle>
                        <AlertDescription>
                          Selecione o plano mais adequado para sua organização. É possível mudar de plano a qualquer momento.
                        </AlertDescription>
                      </Alert>
                      
                      <Button 
                        variant="default" 
                        onClick={() => setShowPlanSelection(true)}
                        className="w-full"
                      >
                        Ver opções de planos
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-6">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowPlanSelection(false)}
                    className="mb-2"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Voltar
                  </Button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plans?.map((plan) => (
                      <div 
                        key={plan.id} 
                        className={`border rounded-lg p-4 ${
                          plan.featuredLabel ? 'border-primary ring-2 ring-primary/10' : ''
                        } relative hover:shadow-md transition-shadow cursor-pointer`}
                        onClick={() => handlePlanSelect(plan)}
                      >
                        {plan.featuredLabel && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                            {plan.featuredLabel}
                          </div>
                        )}
                        
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-semibold">{plan.name}</h3>
                          <p className="text-2xl font-bold mt-2">
                            {plan.price === 0 ? 'Gratuito' : `R$ ${plan.price}/mês`}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div className="space-y-2">
                          <ul className="space-y-2">
                            {plan.features.map((feature, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <Button 
                          className="w-full mt-4" 
                          variant={plan.featuredLabel ? "default" : "outline"}
                          onClick={() => handlePlanSelect(plan)}
                        >
                          Selecionar
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Termos e Condições</CardTitle>
              <CardDescription>Leia e aceite os termos antes de prosseguir</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80 rounded border p-4 mb-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Termos de Serviço</h3>
                  <p>
                    Bem-vindo à nossa plataforma. Ao se registrar, você concorda com os seguintes termos e condições:
                  </p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">1. Aceitação dos Termos</h4>
                    <p className="text-sm text-gray-600">
                      Ao acessar ou usar nosso serviço, você concorda em cumprir estes Termos de Serviço e todas as leis e regulamentos aplicáveis. Se você não concordar com qualquer parte destes termos, não poderá usar nosso serviço.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">2. Uso da Plataforma</h4>
                    <p className="text-sm text-gray-600">
                      Nossa plataforma foi projetada para auxiliar na gestão de organizações de saúde e associações. O uso da plataforma para atividades ilegais, fraudulentas ou não autorizadas é estritamente proibido.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">3. Privacidade e Proteção de Dados</h4>
                    <p className="text-sm text-gray-600">
                      Estamos comprometidos com a proteção de seus dados pessoais e seguimos todas as leis aplicáveis, incluindo a LGPD (Lei Geral de Proteção de Dados). Para mais detalhes, consulte nossa Política de Privacidade.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">4. Responsabilidades do Usuário</h4>
                    <p className="text-sm text-gray-600">
                      Você é responsável por manter a confidencialidade de sua conta e senha. Você concorda em notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">5. Pagamentos e Assinaturas</h4>
                    <p className="text-sm text-gray-600">
                      Ao escolher um plano pago, você concorda em pagar todos os valores devidos pela assinatura. Os pagamentos são processados através de nossos parceiros de pagamento seguro. As assinaturas são renovadas automaticamente, a menos que você cancele antes do próximo ciclo de cobrança.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">6. Cancelamento e Reembolsos</h4>
                    <p className="text-sm text-gray-600">
                      Você pode cancelar sua assinatura a qualquer momento através da plataforma. Os reembolsos são concedidos de acordo com nossa política de reembolso, que pode variar dependendo do plano e das circunstâncias.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">7. Alterações nos Termos</h4>
                    <p className="text-sm text-gray-600">
                      Reservamo-nos o direito de modificar ou substituir estes termos a qualquer momento. Alterações significativas serão notificadas com antecedência.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">8. Limitação de Responsabilidade</h4>
                    <p className="text-sm text-gray-600">
                      Em nenhum caso seremos responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo perda de lucros, dados ou uso, resultantes do uso ou incapacidade de usar o serviço.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">9. Lei Aplicável</h4>
                    <p className="text-sm text-gray-600">
                      Estes termos são regidos e interpretados de acordo com as leis do Brasil, sem consideração a conflitos de princípios legais.
                    </p>
                  </div>
                </div>
              </ScrollArea>
              
              <FormField
                control={form.control}
                name="termsAccepted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium leading-none cursor-pointer">
                        Aceito os termos e condições
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Declaro que li e concordo com os termos de serviço e políticas de privacidade.
                      </p>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        );
      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Confirmação</CardTitle>
              <CardDescription>Verifique os dados informados e confirme o registro</CardDescription>
            </CardHeader>
            <CardContent>
              {formDataSummary && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Dados da Organização</h3>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between py-1 border-b">
                          <span className="font-medium">Nome:</span>
                          <span>{formDataSummary.name}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="font-medium">Tipo:</span>
                          <span>{formDataSummary.type}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="font-medium">CNPJ:</span>
                          <span>{formDataSummary.cnpj}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="font-medium">Email:</span>
                          <span>{formDataSummary.email}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="font-medium">Telefone:</span>
                          <span>{formDataSummary.phone}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="font-medium">Endereço:</span>
                          <span>{formDataSummary.address}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="font-medium">Cidade/Estado:</span>
                          <span>{formDataSummary.city}/{formDataSummary.state}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="font-medium">Administrador:</span>
                          <span>{formDataSummary.adminName}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span className="font-medium">Documento:</span>
                          <span>{formDataSummary.documentName}</span>
                        </div>
                        {formDataSummary.logoName && (
                          <div className="flex justify-between py-1 border-b">
                            <span className="font-medium">Logo:</span>
                            <span>{formDataSummary.logoName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Detalhes do Plano</h3>
                      
                      <div className="p-4 border rounded-lg mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-lg">{formDataSummary.planName}</h4>
                          <span className="text-xl font-bold">
                            {formDataSummary.planPrice === 0 
                              ? 'Gratuito' 
                              : `R$ ${formDataSummary.planPrice}/mês`}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4">
                          {formDataSummary.planDescription}
                        </p>
                        
                        <div className="space-y-1 mb-4">
                          <div className="text-sm font-medium">Recursos incluídos:</div>
                          <ul className="space-y-1">
                            {formDataSummary.planFeatures?.map((feature: string, index: number) => (
                              <li key={index} className="text-sm flex items-center gap-2">
                                <Check className="h-3 w-3 text-green-500" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Limite de usuários:</span>
                            <span className="ml-2">{formDataSummary.planUserLimit}</span>
                          </div>
                          <div>
                            <span className="font-medium">Limite de pacientes:</span>
                            <span className="ml-2">{formDataSummary.planPatientLimit}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Módulos do plano:</h4>
                        <div className="space-y-1">
                          {formDataSummary.planModules?.map((module: any, index: number) => (
                            <div key={index} className="flex items-center justify-between py-1 border-b">
                              <span>{module.name}</span>
                              {module.included ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <span className="text-xs text-gray-500">Não incluído</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertTitle>Pagamento via link por email</AlertTitle>
                    <AlertDescription>
                      Após a confirmação, enviaremos um link de pagamento para o email informado. 
                      As funcionalidades ficarão disponíveis após a confirmação do pagamento.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Modal de conclusão com QR code */}
      {showCompletionModal && newOrganization && (
        <OrganizationCompletionModal
          organization={newOrganization}
          onClose={handleCloseModal}
          onViewDashboard={handleViewDashboard}
        />
      )}
      
      {/* A página consiste no formulário de registro */}
      <>
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => window.location.href = '/organizations'}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Nova Organização</h1>
            <p className="text-gray-600">Preencha os dados para registrar uma nova organização.</p>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 mb-8">
          {['Informações Básicas', 'Dados da Organização', 'Escolha de Plano', 'Termos e Condições', 'Confirmação'].map((label, index) => (
            <div key={index} className="relative">
              <div
                className={`h-2 w-full rounded-full ${
                  step > index+1 ? 'bg-green-500' : 
                  step === index+1 ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
              <span className="text-xs mt-1 block">{label}</span>
              {step > index+1 && (
                <Check size={16} className="absolute -top-1 -right-1 text-green-500 bg-white rounded-full" />
              )}
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Usando a função renderStepContent para mostrar o conteúdo baseado no passo atual */}
            {renderStepContent()}
            
            <div className="flex justify-between mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
              >
                Voltar
              </Button>

              {step < 5 ? (
                <Button 
                  type="button" 
                  onClick={nextStep}
                >
                  Próximo
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={createOrganization.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {createOrganization.isPending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processando...
                    </>
                  ) : (
                    <>
                      Confirmar Registro
                      <Check className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </>
    </div>
  );
}