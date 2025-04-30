import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { insertOrganizationSchema, type InsertOrganization, type Plan } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Check, FileText, Upload, Save, AlertCircle, AlertTriangle, Mail, Image } from "lucide-react";
import { z } from "zod";
import PlanSelection from "../components/features/PlanSelection";
import { apiRequest } from "@/lib/queryClient";

export default function OrganizationRegistration() {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Navigation function
  const navigate = (path: string) => {
    window.location.href = path;
  };
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  
  // Estado para armazenar o nome do arquivo do estatuto/contrato
  const [documentFileName, setDocumentFileName] = useState<string | null>(null);
  
  // Estado para armazenar a logomarca da organização
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoFileName, setLogoFileName] = useState<string | null>(null);
  
  // Estado para armazenar os dados após a validação
  const [formDataSummary, setFormDataSummary] = useState<any>({
    planName: '',
    planPrice: '',
    planDescription: '',
    planFeatures: [],
    planUserLimit: 0,
    planPatientLimit: 0,
    planModules: [],
    documentName: '',
    logoName: null,
  });
  
  // Função para obter os módulos baseados no tier do plano
  const getTierModules = (tier: string): string[] => {
    switch (tier) {
      case 'free':
        return ['Básico', 'CRM'];
      case 'seed':
        return ['Básico', 'CRM', 'Financeiro', 'Agenda'];
      case 'grow':
        return ['Básico', 'CRM', 'Financeiro', 'Agenda', 'Analytics', 'Vendas'];
      case 'pro':
        return [
          'Básico', 'CRM', 'Financeiro', 'Agenda', 'Analytics', 
          'Vendas', 'RH', 'Produção', 'Complypay', 'Suporte'
        ];
      default:
        return ['Módulo básico'];
    }
  };

  // Fetch available plans (planos públicos sem autenticação)
  const { data: plans } = useQuery<Plan[]>({
    queryKey: ['/api/public/plans'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/public/plans');
        if (!response.ok) {
          throw new Error('Falha ao buscar planos');
        }
        const plansData = await response.json();
        console.log("Planos obtidos da API pública:", plansData);
        return plansData;
      } catch (error) {
        console.error("Erro ao buscar planos públicos:", error);
        toast({
          title: "Erro ao obter planos disponíveis",
          description: "Não foi possível carregar os planos. Por favor, tente novamente mais tarde.",
          variant: "destructive"
        });
        return [];
      }
    },
    refetchOnWindowFocus: false,
  });

  const form = useForm<InsertOrganization>({
    resolver: zodResolver(insertOrganizationSchema),
    defaultValues: {
      type: 'Empresa',
      status: 'pending', // Começa como pendente até que o pagamento seja confirmado
      termsAccepted: false,
      adminName: '',
      website: '',
      planId: 0,
    }
  });

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
      
      // Exibir toast de sucesso na criação da organização e redirecionar
      toast({
        title: "Registro concluído com sucesso!",
        description: "Verifique seu email para receber o link de pagamento. IMPORTANTE: Se não encontrar, verifique também sua pasta de SPAM ou Lixo Eletrônico!",
        className: "border-green-200 bg-green-50",
      });
      
      // Redirecionar para a tela de confirmação dedicada ou admin panel
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser && currentUser.role === 'admin') {
        navigate('/requests');
      } else {
        // Redirecionar para a página de confirmação com params para dados personalizados
        navigate(`/registro-confirmado?email=${encodeURIComponent(values.email)}&orgName=${encodeURIComponent(values.name)}&planName=${encodeURIComponent(selectedPlan?.name || 'selecionado')}`);
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

  // Nenhuma integração direta com pagamento
  // A cobrança será enviada por email com link de pagamento após aprovação do cadastro

  const nextStep = async () => {
    const fields = getFieldsForStep(step);
    const currentStepValid = await form.trigger(fields);
    
    // Verificar se o passo atual é válido
    if (currentStepValid && step < 5) {
      // Se estiver no passo 4, preparar o resumo dos dados antes de ir para a confirmação
      if (step === 4) {
        const formData = form.getValues();
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
        
        console.log('Plano selecionado:', selectedPlanData); // Debugging
        
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
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(prev => prev - 1);
    
    // Reset plan selection state when going back from step 3
    if (step === 3) {
      setShowPlanSelection(false);
    }
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    form.setValue('planId', plan.id); // Set the plan ID in the form
    setShowPlanSelection(false);
  };

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
    
    // Não mostrar toast aqui, pois já há um toast na função onSuccess da mutação
  };

  const onSubmit = async (data: InsertOrganization) => {
    // As organizações começam com status pending até que o pagamento seja confirmado
    submitOrganization();
  };

  const getFieldsForStep = (step: number): (keyof InsertOrganization)[] => {
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* A página consiste apenas no formulário de registro */}
      {(
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
              {Number(step) === 1 ? (
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
                              <Input {...field} placeholder="CASSIANO RICARDO TEIXEIRA GOMES" />
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
                              <Input {...field} placeholder="37.206.081/0001-24" />
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
                              <Input {...field} placeholder="83981321486" />
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
                              <Input {...field} type="email" placeholder="cassianoaxe@gmail.com" />
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
              ) : null}

              {Number(step) === 2 ? (
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
                              <Input {...field} placeholder="CASSIANO RICARDO TEIXEIRA GOMES" />
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
                              <Input {...field} placeholder="Rua joaquim martins da silva" />
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
                                
                                // Verificar se o tipo de arquivo é permitido
                                const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
                                if (!allowedTypes.includes(file.type)) {
                                  toast({
                                    title: "Formato não suportado",
                                    description: "Por favor, envie uma imagem nos formatos JPG, PNG ou SVG.",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                
                                // Se passou nas validações, definir o arquivo
                                setLogoFile(file);
                                setLogoFileName(file.name);
                                console.log("Logo selecionado:", file.name, "Tipo:", file.type, "Tamanho:", Math.round(file.size / 1024), "KB");
                              } else {
                                setLogoFile(null);
                                setLogoFileName(null);
                              }
                            }}
                            className="hidden"
                            id="logo-upload"
                            accept=".jpg,.jpeg,.png,.svg"
                          />
                          <label
                            htmlFor="logo-upload"
                            className="cursor-pointer flex flex-col items-center gap-2"
                          >
                            <Upload className="h-8 w-8 text-primary" />
                            <span className="text-blue-600 hover:text-blue-800 font-medium">
                              Upload da Logomarca
                            </span>
                            <span className="text-xs text-gray-500">Formatos aceitos: JPG, PNG, SVG</span>
                          </label>
                          {logoFile && (
                            <div className="mt-3 flex items-center justify-center gap-2 text-green-600 bg-green-50 p-2 rounded">
                              <FileText className="h-4 w-4" />
                              <span className="text-sm">{logoFile.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="col-span-1 md:col-span-2 mt-6 mb-2">
                        <h3 className="text-lg font-medium">Dados Bancários</h3>
                        <p className="text-sm text-gray-500">Informações para reembolso/estorno quando necessário</p>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Banco*</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Nome do banco" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="bankBranch"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Agência*</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Número da agência" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="bankAccount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Conta*</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Número da conta" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {Number(step) === 3 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Escolha de Plano</CardTitle>
                    <CardDescription>
                      Selecione o plano mais adequado para sua organização
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {showPlanSelection ? (
                      <PlanSelection
                        plans={plans || []}
                        onSelectPlan={handlePlanSelect}
                        onClose={() => setShowPlanSelection(false)}
                      />
                    ) : (
                      <>
                        <div className="mb-4">
                          {selectedPlan ? (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium text-lg">{selectedPlan.name}</h3>
                                  <div className="text-sm text-gray-600 mt-1">{selectedPlan.description}</div>
                                  <div className="mt-2 font-medium text-primary">
                                    {selectedPlan.price === '0' ? 
                                      'Gratuito' : 
                                      `R$ ${selectedPlan.price}/mês`
                                    }
                                  </div>
                                  <div className="mt-2">
                                    <span className="text-sm text-gray-700 font-medium">Recursos incluídos:</span>
                                    <ul className="text-sm text-gray-600 mt-1 list-disc pl-5 space-y-1">
                                      {selectedPlan.features?.map((feature, index) => (
                                        <li key={index}>{feature}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setShowPlanSelection(true)}
                                >
                                  Alterar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                              <h3 className="text-lg font-medium mb-2">Nenhum plano selecionado</h3>
                              <p className="text-gray-500 mb-4">
                                Escolha um plano para continuar o processo de registro
                              </p>
                              <Button 
                                onClick={() => setShowPlanSelection(true)}
                              >
                                Escolher Plano
                              </Button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : null}

              {Number(step) === 4 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Termos e Condições</CardTitle>
                    <CardDescription>
                      Leia e aceite os termos de uso para finalizar o registro
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 h-60 overflow-y-auto">
                      <h3 className="font-medium text-lg mb-2">Termos de Uso e Política de Privacidade</h3>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        Ao utilizar nossos serviços, você concorda com os seguintes termos:
                      </p>
                      
                      <h4 className="font-medium text-base mt-4 mb-1">1. Uso da Plataforma</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        A plataforma destina-se exclusivamente para gerenciamento de organizações e suas atividades relacionadas.
                        Você concorda em não utilizar a plataforma para qualquer finalidade ilegal ou não autorizada.
                      </p>
                      
                      <h4 className="font-medium text-base mt-4 mb-1">2. Privacidade de Dados</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Respeitamos sua privacidade e protegemos seus dados pessoais. Ao utilizar nossa plataforma,
                        você concorda com nossa Política de Privacidade quanto à coleta, uso e proteção de informações.
                      </p>
                      
                      <h4 className="font-medium text-base mt-4 mb-1">3. Responsabilidades</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Você é responsável por manter a confidencialidade de sua conta e senha. A organização é 
                        responsável por todas as atividades realizadas em sua conta.
                      </p>
                      
                      <h4 className="font-medium text-base mt-4 mb-1">4. Limitação de Responsabilidade</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Em nenhuma circunstância seremos responsáveis por danos indiretos, incidentais, especiais, 
                        consequenciais ou punitivos decorrentes do uso da plataforma.
                      </p>
                      
                      <h4 className="font-medium text-base mt-4 mb-1">5. Modificações dos Serviços</h4>
                      <p className="text-sm text-gray-600">
                        Reservamo-nos o direito de modificar ou descontinuar, temporária ou permanentemente, 
                        a plataforma ou qualquer serviço a ela relacionado, com ou sem aviso prévio.
                      </p>
                    </div>
                    
                    <div className="mb-6">
                      <FormField
                        control={form.control}
                        name="termsAccepted"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Eu li e aceito os Termos de Uso e Política de Privacidade
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {Number(step) === 5 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Confirmar Informações</CardTitle>
                    <CardDescription>
                      Verifique se todos os dados estão corretos antes de finalizar
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Dados da Organização</h3>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <p className="font-medium">{formDataSummary.name}</p>
                            <p className="text-sm text-gray-600 mt-1">{formDataSummary.type} • CNPJ: {formDataSummary.cnpj}</p>
                            <p className="text-sm text-gray-600 mt-1">{formDataSummary.address}</p>
                            <p className="text-sm text-gray-600 mt-1">{formDataSummary.city}, {formDataSummary.state}</p>
                            {formDataSummary.website && (
                              <p className="text-sm text-gray-600 mt-1">Website: {formDataSummary.website}</p>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Dados do Administrador</h3>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <p className="font-medium">{formDataSummary.adminName}</p>
                            <p className="text-sm text-gray-600 mt-1">CPF: {formDataSummary.adminCpf}</p>
                            <p className="text-sm text-gray-600 mt-1">Email: {formDataSummary.email}</p>
                            <p className="text-sm text-gray-600 mt-1">Telefone: {formDataSummary.phone}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Dados Bancários</h3>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <p className="font-medium">{formDataSummary.bankName}</p>
                            <p className="text-sm text-gray-600 mt-1">Agência: {formDataSummary.bankBranch}</p>
                            <p className="text-sm text-gray-600 mt-1">Conta: {formDataSummary.bankAccount}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Plano Selecionado</h3>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <p className="font-medium">{formDataSummary.planName}</p>
                            <p className="text-sm text-blue-600 font-medium mt-1">
                              {formDataSummary.planPrice === '0' ? 'Gratuito' : `R$ ${formDataSummary.planPrice}/mês`}
                            </p>
                            <div className="mt-2">
                              <p className="text-xs text-gray-500">Módulos incluídos:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {formDataSummary.planModules.map((module: string, idx: number) => (
                                  <span 
                                    key={idx} 
                                    className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full"
                                  >
                                    {module}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Documentos Anexados</h3>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{formDataSummary.documentName}</span>
                          </div>
                          {formDataSummary.logoName && (
                            <div className="flex items-center gap-2 mt-2">
                              <Image className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{formDataSummary.logoName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Button 
                        onClick={submitOrganization}
                        disabled={createOrganization.isPending}
                        className="w-full"
                      >
                        {createOrganization.isPending ? (
                          <span className="flex items-center gap-2">
                            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                            Processando...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            Finalizar Registro
                          </span>
                        )}
                      </Button>
                      
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-800">Próximos passos</h4>
                            <p className="text-sm text-blue-700 mt-1">
                              Após a finalização do cadastro, sua solicitação será processada e você receberá
                              <strong> um email com o link de pagamento</strong> para o plano selecionado.
                            </p>
                            <div className="mt-3 text-xs text-blue-600">
                              <a href="/privacidade" className="underline hover:text-blue-800">Política de Privacidade</a>
                              {" • "}
                              <a href="/termos" className="underline hover:text-blue-800">Termos de Uso</a>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-yellow-800">Importante</h4>
                            <p className="text-sm text-yellow-700 mt-1">
                              <strong>Verifique sua caixa de entrada e pasta de SPAM</strong> para receber o link de pagamento.
                              Sua conta será ativada automaticamente após a confirmação do pagamento.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                        <div className="flex items-start gap-2">
                          <Mail className="h-5 w-5 text-amber-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-amber-800">Verificação de Email</h4>
                            <p className="text-sm text-amber-700 mt-1">
                              <strong className="block text-amber-800">⚠️ IMPORTANTE: Verifique também sua pasta de SPAM ou Lixo Eletrônico!</strong>
                              Muitos provedores de email classificam mensagens automáticas como SPAM. Se não encontrar nosso email, por favor verifique estas pastas.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {Number(step) < 5 && (
                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={prevStep}
                    disabled={step === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </Button>
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    disabled={step === 3 && !selectedPlan}
                  >
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </>
      )}
    </div>
  );
}