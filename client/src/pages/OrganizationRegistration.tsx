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
import { ChevronLeft, ChevronRight, Check, FileText, Upload, Save, AlertCircle, CreditCard } from "lucide-react";
import { z } from "zod";
import PlanSelection from "@/components/features/PlanSelection";
import { PaymentFormWrapper } from "@/components/features/PaymentForm";
import { confirmPayment } from "@/lib/stripeClient";

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
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [registrationComplete, setRegistrationComplete] = useState(false);

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
      plan: '',
    }
  });

  const createOrganization = useMutation({
    mutationFn: async (data: InsertOrganization & { document: File }) => {
      const formData = new FormData();
      formData.append('document', data.document);
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'document') {
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
      
      // If registrationComplete is true, it means the user has already paid
      if (paymentIntentId && registrationComplete) {
        confirmPaymentAndFinish(paymentIntentId, data.id);
      } else {
        toast({
          title: "Organização criada com sucesso!",
          description: "Aguarde a aprovação da administração.",
        });
        navigate('/organizations');
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

  // Mutation for confirming payment
  const confirmPaymentMutation = useMutation({
    mutationFn: async ({ paymentIntentId, organizationId }: { paymentIntentId: string; organizationId: number }) => {
      return confirmPayment(paymentIntentId, organizationId);
    },
    onSuccess: () => {
      toast({
        title: "Pagamento confirmado!",
        description: "Sua organização foi ativada com sucesso.",
      });
      navigate('/organizations');
    },
    onError: () => {
      toast({
        title: "Erro ao confirmar pagamento",
        description: "Por favor, entre em contato com o suporte.",
        variant: "destructive",
      });
    }
  });

  const confirmPaymentAndFinish = (paymentIntentId: string, organizationId: number) => {
    confirmPaymentMutation.mutate({ paymentIntentId, organizationId });
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    setPaymentIntentId(paymentIntentId);
    setRegistrationComplete(true);
    setShowPaymentForm(false);
    
    // If the organization has already been created, confirm the payment
    if (organizationId) {
      confirmPaymentAndFinish(paymentIntentId, organizationId);
    } else {
      // Otherwise, we'll need to create the organization first, and then confirm the payment
      // This will be handled in the onSuccess of createOrganization
      submitOrganization();
    }
  };

  const nextStep = async () => {
    const fields = getFieldsForStep(step);
    const currentStepValid = await form.trigger(fields);
    if (currentStepValid && step < 4) setStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(prev => prev - 1);
    
    // Reset plan selection and payment form state when going back from step 3
    if (step === 3) {
      setShowPlanSelection(false);
      setShowPaymentForm(false);
    }
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    form.setValue('plan', plan.name); // Set the plan name in the form
    setShowPlanSelection(false);
    setShowPaymentForm(true);
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

    createOrganization.mutate({ ...form.getValues(), document: selectedFile });
  };

  const onSubmit = async (data: InsertOrganization) => {
    submitOrganization();
  };

  const getFieldsForStep = (step: number): (keyof InsertOrganization)[] => {
    switch (step) {
      case 1: 
        return ['type', 'cnpj', 'website', 'phone', 'email', 'adminCpf', 'adminName', 'password', 'confirmPassword'];
      case 2:
        return ['name', 'address', 'city', 'state'];
      case 3:
        return ['plan', 'bankName', 'bankBranch', 'bankAccount'];
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

      <div className="grid grid-cols-4 gap-2 mb-8">
        {['Informações Básicas', 'Dados da Organização', 'Plano e Dados Bancários', 'Termos e Condições'].map((label, index) => (
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
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
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
                </div>
              </CardContent>
            </Card>
          ) : null}

          {Number(step) === 3 ? (
            <div>
              {/* Show plan selection first */}
              {!showPlanSelection && !showPaymentForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Plano e Dados Bancários</CardTitle>
                    <CardDescription>Informe os dados bancários e selecione um plano</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="col-span-1 md:col-span-2">
                        <h3 className="text-lg font-medium mb-4">Dados Bancários</h3>
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

                    <div className="flex flex-col gap-4 items-center mt-8">
                      <Button
                        variant="outline"
                        onClick={() => setShowPlanSelection(true)}
                        className="w-full max-w-md flex items-center justify-center gap-2"
                      >
                        <CreditCard className="h-4 w-4" />
                        Selecionar Plano e Pagar
                      </Button>
                      
                      {paymentIntentId && (
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded w-full max-w-md">
                          <Check className="h-4 w-4" />
                          <span className="text-sm">Pagamento confirmado!</span>
                        </div>
                      )}
                      
                      {/* Hidden form field to store the plan value */}
                      <FormField
                        control={form.control}
                        name="plan"
                        render={({ field }) => (
                          <FormItem className="hidden">
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      {/* No planId field needed */}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Plan Selection Component */}
              {showPlanSelection && !showPaymentForm && (
                <div>
                  <PlanSelection 
                    onPlanSelected={(plan) => {
                      setSelectedPlan(plan);
                      // Update the form with the selected plan info
                      form.setValue('plan', plan.name);
                      setShowPlanSelection(false);
                      setShowPaymentForm(true);
                    }}
                    onBack={() => setShowPlanSelection(false)}
                  />
                </div>
              )}
              
              {/* Payment Form */}
              {showPaymentForm && selectedPlan && (
                <div>
                  <PaymentFormWrapper
                    planId={selectedPlan.id}
                    selectedPlan={selectedPlan}
                    onPaymentSuccess={(paymentId) => {
                      setPaymentIntentId(paymentId);
                      // We no longer store payment status in the database
                      setShowPaymentForm(false);
                      toast({
                        title: "Pagamento confirmado!",
                        description: "Seu pagamento foi processado com sucesso.",
                      });
                    }}
                    onBack={() => {
                      setShowPaymentForm(false);
                      setShowPlanSelection(true);
                    }}
                  />
                </div>
              )}
              
              {/* Banking information - Show only if not selecting a plan or making a payment */}
              {!showPlanSelection && !showPaymentForm && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Dados Bancários</CardTitle>
                    <CardDescription>Informações para reembolso/estorno quando necessário</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Banco*</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Nome do Banco" />
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
                              <Input {...field} placeholder="Número da Agência" />
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
                              <Input {...field} placeholder="Número da Conta" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
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
            
            {step < 4 ? (
              <Button 
                type="button" 
                onClick={nextStep}
                className="ml-auto flex items-center gap-2"
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
          
          {selectedFile === null && Number(step) === 1 ? (
            <div className="flex items-center gap-2 text-amber-600 mt-4 p-2 bg-amber-50 rounded border border-amber-200">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Lembre-se de fazer o upload do documento da organização.</span>
            </div>
          ) : null}
        </form>
      </Form>
    </div>
  );
}
