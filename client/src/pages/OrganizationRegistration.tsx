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
import { ChevronLeft, ChevronRight, Check, FileText, Upload, Save, AlertCircle, CreditCard, Image } from "lucide-react";
import { z } from "zod";
import PlanSelection from "@/components/features/PlanSelection";
// Removida importação do componente PaymentFormWrapper
// Removida importação de confirmPlanPayment pois não é mais necessária

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
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
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

  // Fetch available plans
  const { data: plans } = useQuery<Plan[]>({
    queryKey: ['/api/plans'],
    refetchOnWindowFocus: false,
  });

  const form = useForm<InsertOrganization>({
    resolver: zodResolver(insertOrganizationSchema),
    defaultValues: {
      type: 'Empresa',
      status: 'pending',
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
      setOrganizationId(data.id);
      
      toast({
        title: "Organização criada com sucesso!",
        description: "Aguarde a aprovação da administração.",
      });
      
      // Se o usuário atual for admin, redirecionar para a página de solicitações
      // caso contrário, redirecionar para a página de confirmação
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser && currentUser.role === 'admin') {
        navigate('/requests');
      } else {
        navigate('/organization-confirmation');
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

  // Removida toda a lógica de pagamento, pois não é mais necessária

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
        
        setFormDataSummary({
          ...formData,
          planName: selectedPlanData?.name || '',
          planPrice: selectedPlanData?.price || '',
          planDescription: selectedPlanData?.description || '',
          planFeatures: selectedPlanData?.features || [],
          planUserLimit: selectedPlanData?.maxUsers || 0,
          planPatientLimit: selectedPlanData?.maxPatients || 0,
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
      createOrganization.mutate({ ...formData, document: selectedFile, logo: logoFile });
    } else {
      createOrganization.mutate({ ...formData, document: selectedFile });
    }
    
    toast({
      title: "Solicitação enviada",
      description: "Sua solicitação de registro foi enviada com sucesso e está em análise.",
    });
  };

  const onSubmit = async (data: InsertOrganization) => {
    // Todas as organizações começam com status pending para revisão de documentação
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
                          setLogoFile(file);
                          if (file) {
                            setLogoFileName(file.name);
                          } else {
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
                        <FormLabel>Nome do Banco*</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Banco do Brasil" />
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
                          <Input {...field} placeholder="0001" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bankAccount"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel>Conta*</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="123456-7" />
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
            <div>
              {/* Sempre mostrar a seleção de plano primeiro */}
              <Card>
                <CardHeader>
                  <CardTitle>Selecione um Plano</CardTitle>
                  <CardDescription>Escolha o plano mais adequado para sua organização</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    {/* Formulário escondido para o valor do plano */}
                    <FormField
                      control={form.control}
                      name="planId"
                      render={({ field }) => (
                        <FormItem className="hidden">
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    {/* Componente de seleção de plano sempre visível */}
                    <PlanSelection 
                      onPlanSelected={(plan) => {
                        setSelectedPlan(plan);
                        // Atualizar o formulário com o plano selecionado
                        form.setValue('planId', plan.id);
                        
                        // Se for admin, NUNCA mostrar pagamento
                        const isAdmin = JSON.parse(localStorage.getItem('user') || '{}')?.role === 'admin';
                        toast({
                          title: "Plano selecionado",
                          description: "Você selecionou o plano " + plan.name,
                        });
                      }}
                      onBack={() => {
                        // Voltar ao passo anterior no fluxo
                        setStep(step - 1);
                      }}
                    />
                  </div>
                  
                  {/* Mensagem de plano selecionado */}
                  {selectedPlan && (
                    <div className="flex flex-col items-center mt-4">
                      <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 p-3 rounded w-full max-w-md">
                        <Check className="h-5 w-5" />
                        <span>Plano selecionado com sucesso!</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Mensagem de seleção de plano com sucesso */}
              {selectedPlan && (
                <div className="flex flex-col items-center mt-4">
                  <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 p-3 rounded w-full max-w-md">
                    <Check className="h-5 w-5" />
                    <span>Plano selecionado com sucesso: {selectedPlan.name}</span>
                  </div>
                  <Button 
                    className="mt-4" 
                    onClick={() => nextStep()}
                  >
                    Continuar <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          ) : null}
          
          {Number(step) === 4 ? (
            <Card>
              <CardHeader>
                <CardTitle>Termos de Uso</CardTitle>
                <CardDescription>Leia e aceite os termos para finalizar o registro</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4">
                  <div className="h-60 overflow-y-auto text-sm text-gray-600 mb-4 p-4 bg-gray-50 rounded">
                    <h4 className="font-semibold mb-2">Termos e Condições de Uso da Plataforma Endurancy</h4>
                    <p className="mb-3">Ao utilizar a plataforma Endurancy, você concorda com os seguintes termos:</p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>A organização declara que todas as informações fornecidas são verdadeiras e precisas.</li>
                      <li>A Endurancy reserva-se o direito de verificar as informações fornecidas e solicitar documentação adicional quando necessário.</li>
                      <li>O uso da plataforma está sujeito às leis e regulamentações aplicáveis.</li>
                      <li>A organização concorda em manter a confidencialidade das credenciais de acesso.</li>
                      <li>A Endurancy não se responsabiliza por qualquer uso indevido da plataforma.</li>
                      <li>Estes termos podem ser atualizados periodicamente, e é responsabilidade da organização manter-se informada sobre essas alterações.</li>
                    </ol>
                  </div>
                  <FormField
                    control={form.control}
                    name="termsAccepted"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-medium">
                          Li e aceito os termos de uso*
                        </FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ) : null}
          
          <div className="flex justify-between mt-6">
            {step > 1 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
            )}
            
            {step < 5 ? (
              <Button 
                type="button" 
                onClick={nextStep}
                className="ml-auto flex items-center gap-2"
                // Desabilita o botão Próximo no passo 1 se não houver upload de documento
                disabled={step === 1 && !selectedFile}
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!form.watch('termsAccepted') || createOrganization.isPending}
                className="ml-auto flex items-center gap-2"
              >
                {createOrganization.isPending ? (
                  <>
                    Enviando...
                    <span className="animate-spin ml-1">⏳</span>
                  </>
                ) : (
                  <>
                    Finalizar Registro
                    <Save className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
          
          {/* Mensagem de confirmação de upload do documento */}
          {Number(step) === 1 ? (
            <div className={`flex items-center gap-2 mt-4 p-2 rounded border ${
              selectedFile === null 
                ? 'text-amber-600 bg-amber-50 border-amber-200' 
                : 'text-green-600 bg-green-50 border-green-200'
            }`}>
              {selectedFile === null ? (
                <>
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">O upload do documento da organização é obrigatório para continuar.</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span className="text-sm">Documento enviado com sucesso! Você já pode continuar.</span>
                </>
              )}
            </div>
          ) : null}
          
          {/* Página de confirmação/resumo */}
          {Number(step) === 5 && formDataSummary ? (
            <Card>
              <CardHeader>
                <CardTitle>Confirmação dos Dados</CardTitle>
                <CardDescription>Revise as informações antes de finalizar o registro</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Dados da Organização</h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="font-medium">Tipo:</div>
                        <div>{formDataSummary.type}</div>
                        <div className="font-medium">Nome:</div>
                        <div>{formDataSummary.name}</div>
                        <div className="font-medium">CNPJ:</div>
                        <div>{formDataSummary.cnpj}</div>
                        <div className="font-medium">Endereço:</div>
                        <div>{formDataSummary.address}</div>
                        <div className="font-medium">Cidade/Estado:</div>
                        <div>{formDataSummary.city}/{formDataSummary.state}</div>
                        <div className="font-medium">Telefone:</div>
                        <div>{formDataSummary.phone}</div>
                        <div className="font-medium">Website:</div>
                        <div>{formDataSummary.website || 'Não informado'}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Dados Bancários</h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="font-medium">Banco:</div>
                        <div>{formDataSummary.bankName}</div>
                        <div className="font-medium">Agência:</div>
                        <div>{formDataSummary.bankBranch}</div>
                        <div className="font-medium">Conta:</div>
                        <div>{formDataSummary.bankAccount}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Administrador</h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="font-medium">Nome:</div>
                        <div>{formDataSummary.adminName}</div>
                        <div className="font-medium">CPF:</div>
                        <div>{formDataSummary.adminCpf}</div>
                        <div className="font-medium">Email:</div>
                        <div>{formDataSummary.email}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Plano Selecionado</h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="font-medium">Plano:</div>
                        <div>{formDataSummary.planName || 'Não selecionado'}</div>
                        <div className="font-medium">Valor:</div>
                        <div>
                          {formDataSummary.planPrice 
                            ? `R$ ${typeof formDataSummary.planPrice === 'number' 
                                ? formDataSummary.planPrice.toFixed(2) 
                                : formDataSummary.planPrice}/mês`
                            : 'Não disponível'}
                        </div>
                      </div>
                      
                      {/* Informações detalhadas do plano */}
                      <div className="mt-4">
                        <div className="text-sm">
                          <div className="font-medium mb-1">Descrição:</div>
                          <div className="text-gray-700">{formDataSummary.planDescription || 'Sem descrição disponível'}</div>
                        </div>
                        
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Limite de usuários:</span>
                            <span>{formDataSummary.planUserLimit || '0'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Limite de pacientes:</span>
                            <span>{formDataSummary.planPatientLimit || '0'}</span>
                          </div>
                        </div>
                        
                        {Array.isArray(formDataSummary.planFeatures) && formDataSummary.planFeatures.length > 0 && (
                          <div className="mt-3">
                            <div className="font-medium text-sm mb-1">Recursos incluídos:</div>
                            <ul className="text-xs space-y-1 list-disc list-inside">
                              {formDataSummary.planFeatures.map((feature, index) => (
                                <li key={index} className="text-gray-700">{feature}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Arquivos</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span>{formDataSummary.documentName || 'Documento enviado'}</span>
                        </div>
                        {formDataSummary.logoName && (
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span>{formDataSummary.logoName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Próximos passos</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Após a finalização do registro, sua solicitação será analisada pela nossa equipe. 
                        Você receberá um e-mail de confirmação quando sua organização for aprovada.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </form>
      </Form>
    </div>
  );
}
