import React, { useState } from 'react';
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, ChevronRight, Globe, HelpCircle, InfoIcon, Loader2, Upload, User } from "lucide-react";
import { Steps } from "@/components/ui/steps";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

// Esquema de validação
const patientSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  documentType: z.enum(["cpf", "passport"]),
  documentNumber: z.string().min(1, "Número do documento é obrigatório"),
  hasConsentForm: z.boolean().refine(val => val === true, "O termo de consentimento deve ser aceito"),
});

const medicationSchema = z.object({
  product: z.string().min(1, "Produto é obrigatório"),
  quantity: z.string().min(1, "Quantidade é obrigatória"),
  concentration: z.string().min(1, "Concentração é obrigatória"),
  dosage: z.string().min(1, "Dosagem é obrigatória"),
  prescriptionDate: z.string().min(1, "Data da prescrição é obrigatória"),
  prescriptionFile: z.any().optional(),
  medicalReportFile: z.any().optional(),
  prescribingDoctor: z.string().min(1, "Nome do médico prescritor é obrigatório"),
  doctorCRM: z.string().min(1, "CRM do médico é obrigatório"),
  medicalJustification: z.string().min(1, "Justificativa médica é obrigatória"),
  patientCondition: z.string().min(1, "Condição do paciente é obrigatória"),
});

// Lista de produtos à base de cannabis disponíveis
const cannabisProducts = [
  { id: "cbd_oil_500", name: "CBD Oil 500mg", concentration: "500mg", type: "Óleo" },
  { id: "cbd_oil_1000", name: "CBD Oil 1000mg", concentration: "1000mg", type: "Óleo" },
  { id: "cbd_oil_1500", name: "CBD Oil 1500mg", concentration: "1500mg", type: "Óleo" },
  { id: "cbd_capsules_25", name: "CBD Capsules 25mg", concentration: "25mg", type: "Cápsulas" },
  { id: "cbd_capsules_50", name: "CBD Capsules 50mg", concentration: "50mg", type: "Cápsulas" },
  { id: "full_spectrum", name: "Full Spectrum Tincture", concentration: "750mg", type: "Tintura" },
  { id: "cbd_isolate", name: "CBD Isolate Powder", concentration: "1g", type: "Isolado" },
  { id: "thc_cbd_1_1", name: "THC:CBD 1:1 Oil", concentration: "600mg", type: "Óleo" },
  { id: "thc_cbd_1_20", name: "THC:CBD 1:20 Oil", concentration: "600mg", type: "Óleo" },
  { id: "cbd_cream", name: "CBD Topical Cream", concentration: "250mg", type: "Tópico" },
];

// Lista de condições médicas comuns para tratamento com cannabis
const medicalConditions = [
  "Epilepsia refratária",
  "Dor crônica",
  "Esclerose múltipla",
  "Doença de Parkinson",
  "Autismo",
  "Ansiedade",
  "Insônia",
  "Câncer (tratamento paliativo)",
  "Síndrome de Tourette",
  "Doença de Alzheimer",
  "Fibromialgia",
  "Outro (especificar)"
];

export default function NewImportRequest() {
  const [step, setStep] = useState(0);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const patientForm = useForm<z.infer<typeof patientSchema>>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      documentType: "cpf",
      documentNumber: "",
      hasConsentForm: false,
    },
  });
  
  const medicationForm = useForm<z.infer<typeof medicationSchema>>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      product: "",
      quantity: "",
      concentration: "",
      dosage: "",
      prescriptionDate: "",
      prescribingDoctor: "",
      doctorCRM: "",
      medicalJustification: "",
      patientCondition: "",
    },
  });

  const handlePatientSubmit = async (data: z.infer<typeof patientSchema>) => {
    console.log("Dados do paciente:", data);
    // Avança para o próximo passo
    setStep(1);
  };

  const handleMedicationSubmit = async (data: z.infer<typeof medicationSchema>) => {
    console.log("Dados da medicação:", data);
    setIsSubmitting(true);

    try {
      // Em um caso real, enviaria ambos os dados (patientForm.getValues() e data) para a API
      // Simula um delay para mostrar o loading
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Pedido enviado com sucesso!",
        description: "O pedido de importação foi registrado e será analisado.",
        variant: "default",
      });
      
      // Redireciona para a lista de pedidos após o envio
      navigate("/organization/import-company");
    } catch (error) {
      toast({
        title: "Erro ao enviar pedido",
        description: "Ocorreu um erro ao processar seu pedido. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviousStep = () => {
    setStep(0);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">Novo Pedido de Importação</h1>
      <p className="text-muted-foreground">
        Preencha os dados para solicitar a importação de medicamentos à base de Cannabis via RDC 660
      </p>
      
      <Steps 
        steps={[
          { label: "Dados do Paciente", description: "Informações pessoais" },
          { label: "Dados da Medicação", description: "Detalhes do produto e prescrição" },
        ]} 
        currentStep={step}
      />
      
      <Card className="mt-8">
        {step === 0 ? (
          <>
            <CardHeader>
              <div className="flex items-center">
                <User className="h-5 w-5 text-blue-600 mr-2" />
                <CardTitle>Dados do Paciente</CardTitle>
              </div>
              <CardDescription>
                Informações do paciente que necessita da medicação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...patientForm}>
                <form onSubmit={patientForm.handleSubmit(handlePatientSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={patientForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome completo do paciente</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={patientForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="email@exemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={patientForm.control}
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
                    <FormField
                      control={patientForm.control}
                      name="documentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de documento</FormLabel>
                          <FormControl>
                            <RadioGroup 
                              onValueChange={field.onChange} 
                              value={field.value}
                              className="flex space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="cpf" id="cpf" />
                                <Label htmlFor="cpf">CPF</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="passport" id="passport" />
                                <Label htmlFor="passport">Passaporte</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={patientForm.control}
                      name="documentNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número do documento</FormLabel>
                          <FormControl>
                            <Input placeholder={patientForm.watch("documentType") === "cpf" ? "000.000.000-00" : "AB123456"} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={patientForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Endereço completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Rua, número, bairro, complemento" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={patientForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Cidade" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={patientForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Input placeholder="Estado" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <FormField
                    control={patientForm.control}
                    name="hasConsentForm"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <Switch 
                              checked={field.value} 
                              onCheckedChange={field.onChange} 
                            />
                          </FormControl>
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              O paciente concorda com os termos de importação
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              O paciente foi informado e concorda com o processo de importação de medicamentos à base de Cannabis via RDC 660/ANVISA.
                            </p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      Próximo
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <div className="flex items-center">
                <Globe className="h-5 w-5 text-blue-600 mr-2" />
                <CardTitle>Dados da Medicação</CardTitle>
              </div>
              <CardDescription>
                Informações sobre a medicação a ser importada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...medicationForm}>
                <form onSubmit={medicationForm.handleSubmit(handleMedicationSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={medicationForm.control}
                      name="product"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Produto</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o produto" />
                              </SelectTrigger>
                              <SelectContent>
                                {cannabisProducts.map(product => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name} ({product.concentration} - {product.type})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={medicationForm.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 3 frascos" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={medicationForm.control}
                      name="concentration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Concentração</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 100mg/ml" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={medicationForm.control}
                      name="dosage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Posologia</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 1ml, 2x ao dia" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={medicationForm.control}
                      name="prescriptionDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data da prescrição</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={medicationForm.control}
                      name="prescriptionFile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prescrição médica (PDF)</FormLabel>
                          <div className="flex items-center">
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <Input 
                                  type="file" 
                                  accept=".pdf" 
                                  onChange={(e) => field.onChange(e.target.files?.[0])}
                                />
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <InfoIcon className="h-4 w-4 text-blue-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="w-80">
                                        A prescrição médica deve estar em formato PDF, com data, nome do paciente, 
                                        assinatura e carimbo do médico, CRM e especificações do medicamento.
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={medicationForm.control}
                      name="medicalReportFile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Laudo médico (PDF)</FormLabel>
                          <div className="flex items-center">
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <Input 
                                  type="file" 
                                  accept=".pdf" 
                                  onChange={(e) => field.onChange(e.target.files?.[0])}
                                />
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <InfoIcon className="h-4 w-4 text-blue-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="w-80">
                                        O laudo médico deve conter o diagnóstico, histórico do paciente, 
                                        justificativa para uso da medicação à base de Cannabis e estar 
                                        assinado pelo médico responsável.
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={medicationForm.control}
                      name="prescribingDoctor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Médico prescritor</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome completo do médico" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={medicationForm.control}
                      name="doctorCRM"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CRM do médico</FormLabel>
                          <FormControl>
                            <Input placeholder="Número do CRM/UF" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={medicationForm.control}
                      name="patientCondition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condição do paciente</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Condição médica" />
                              </SelectTrigger>
                              <SelectContent>
                                {medicalConditions.map(condition => (
                                  <SelectItem key={condition} value={condition}>
                                    {condition}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={medicationForm.control}
                      name="medicalJustification"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>
                            Justificativa médica 
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <HelpCircle className="inline-block h-3.5 w-3.5 ml-1 text-blue-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-80">
                                    Descreva a justificativa médica para uso da medicação à base de Cannabis.
                                    Informe tratamentos anteriores que não foram eficazes, benefícios esperados e
                                    por que esta medicação específica é necessária para o paciente.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva a justificativa médica para uso do medicamento à base de Cannabis..." 
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
                    <div className="flex items-start">
                      <InfoIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800">Importante</h4>
                        <p className="text-sm text-blue-700">
                          Todos os documentos serão enviados à ANVISA para análise e aprovação da importação.
                          O processo leva em média 15 dias úteis para ser aprovado. Após aprovação, a medicação 
                          será importada e entregue no endereço informado.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handlePreviousStep}
                    >
                      Voltar
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Enviar Pedido
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}