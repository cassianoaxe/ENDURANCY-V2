import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

import OrganizationLayout from '@/components/layout/OrganizationLayout';
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, Info, Loader2, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Schema de validação para o formulário
const importRequestSchema = z.object({
  // Informações do paciente
  patientName: z.string().min(3, "Nome completo é obrigatório"),
  patientEmail: z.string().email("Email inválido"),
  patientPhone: z.string().min(10, "Telefone inválido"),
  patientCpf: z.string().min(11, "CPF inválido").max(14),
  patientBirthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  patientAddress: z.string().min(5, "Endereço é obrigatório"),
  patientCity: z.string().min(2, "Cidade é obrigatória"),
  patientState: z.string().min(2, "Estado é obrigatório"),
  patientZipCode: z.string().min(8, "CEP inválido").max(9),
  
  // Informações médicas
  doctorName: z.string().min(3, "Nome do médico é obrigatório"),
  doctorCrm: z.string().min(5, "CRM inválido"),
  doctorState: z.string().min(2, "Estado do CRM é obrigatório"),
  medicalCondition: z.string().min(3, "Condição médica é obrigatória"),
  prescriptionDate: z.string().min(1, "Data da prescrição é obrigatória"),
  
  // Informações do produto
  productName: z.string().min(3, "Nome do produto é obrigatório"),
  productConcentration: z.string().min(1, "Concentração é obrigatória"),
  productQuantity: z.string().min(1, "Quantidade é obrigatória"),
  productManufacturer: z.string().min(3, "Fabricante é obrigatório"),
  
  // Termos e condições
  termsAndConditions: z.boolean().refine(val => val === true, {
    message: "Você deve aceitar os termos e condições",
  }),
  anvisaConsent: z.boolean().refine(val => val === true, {
    message: "Você deve autorizar o envio de informações à ANVISA",
  }),
  privacyPolicy: z.boolean().refine(val => val === true, {
    message: "Você deve aceitar a política de privacidade",
  }),
  
  // Arquivos (na implementação real, estes seriam integrados com upload de arquivos)
  hasPrescription: z.boolean().optional(),
  hasIdDocument: z.boolean().optional(),
  hasMedicalReport: z.boolean().optional(),
});

type ImportRequestFormValues = z.infer<typeof importRequestSchema>;

export default function NewImportRequestPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState("patient-info");
  
  // Configuração do formulário
  const form = useForm<ImportRequestFormValues>({
    resolver: zodResolver(importRequestSchema),
    defaultValues: {
      patientName: "",
      patientEmail: "",
      patientPhone: "",
      patientCpf: "",
      patientBirthDate: "",
      patientAddress: "",
      patientCity: "",
      patientState: "",
      patientZipCode: "",
      
      doctorName: "",
      doctorCrm: "",
      doctorState: "",
      medicalCondition: "",
      prescriptionDate: "",
      
      productName: "",
      productConcentration: "",
      productQuantity: "",
      productManufacturer: "",
      
      termsAndConditions: false,
      anvisaConsent: false,
      privacyPolicy: false,
      
      hasPrescription: false,
      hasIdDocument: false,
      hasMedicalReport: false,
    },
  });
  
  // Mutation para criar um novo pedido de importação
  const createImportRequestMutation = useMutation({
    mutationFn: async (data: ImportRequestFormValues) => {
      const response = await apiRequest('POST', '/api/import-requests', data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar pedido de importação');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidar a consulta para atualizar a lista de pedidos
      queryClient.invalidateQueries({ queryKey: ['import-orders'] });
      
      // Mostrar mensagem de sucesso
      toast({
        title: "Pedido de importação criado",
        description: "Seu pedido foi registrado com sucesso e será processado em breve.",
      });
      
      // Redirecionar para a página de dashboard
      navigate('/organization/import-company');
    },
    onError: (error) => {
      // Mostrar mensagem de erro
      toast({
        title: "Erro ao criar pedido",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Função para submeter o formulário
  function onSubmit(values: ImportRequestFormValues) {
    createImportRequestMutation.mutate(values);
  }
  
  // Função para avançar para a próxima etapa
  const nextTab = () => {
    if (activeTab === "patient-info") {
      // Validar os campos da etapa atual
      form.trigger([
        "patientName", 
        "patientEmail", 
        "patientPhone", 
        "patientCpf", 
        "patientBirthDate", 
        "patientAddress", 
        "patientCity", 
        "patientState", 
        "patientZipCode"
      ] as const).then(isValid => {
        if (isValid) {
          setActiveTab("medical-info");
        }
      });
    } else if (activeTab === "medical-info") {
      form.trigger([
        "doctorName", 
        "doctorCrm", 
        "doctorState", 
        "medicalCondition", 
        "prescriptionDate"
      ] as const).then(isValid => {
        if (isValid) {
          setActiveTab("product-info");
        }
      });
    } else if (activeTab === "product-info") {
      form.trigger([
        "productName", 
        "productConcentration", 
        "productQuantity", 
        "productManufacturer"
      ] as const).then(isValid => {
        if (isValid) {
          setActiveTab("documents");
        }
      });
    } else if (activeTab === "documents") {
      setActiveTab("terms");
    }
  };
  
  // Função para voltar para a etapa anterior
  const prevTab = () => {
    if (activeTab === "medical-info") {
      setActiveTab("patient-info");
    } else if (activeTab === "product-info") {
      setActiveTab("medical-info");
    } else if (activeTab === "documents") {
      setActiveTab("product-info");
    } else if (activeTab === "terms") {
      setActiveTab("documents");
    }
  };
  
  // Lista de estados brasileiros
  const brazilianStates = [
    { value: "AC", label: "Acre" },
    { value: "AL", label: "Alagoas" },
    { value: "AP", label: "Amapá" },
    { value: "AM", label: "Amazonas" },
    { value: "BA", label: "Bahia" },
    { value: "CE", label: "Ceará" },
    { value: "DF", label: "Distrito Federal" },
    { value: "ES", label: "Espírito Santo" },
    { value: "GO", label: "Goiás" },
    { value: "MA", label: "Maranhão" },
    { value: "MT", label: "Mato Grosso" },
    { value: "MS", label: "Mato Grosso do Sul" },
    { value: "MG", label: "Minas Gerais" },
    { value: "PA", label: "Pará" },
    { value: "PB", label: "Paraíba" },
    { value: "PR", label: "Paraná" },
    { value: "PE", label: "Pernambuco" },
    { value: "PI", label: "Piauí" },
    { value: "RJ", label: "Rio de Janeiro" },
    { value: "RN", label: "Rio Grande do Norte" },
    { value: "RS", label: "Rio Grande do Sul" },
    { value: "RO", label: "Rondônia" },
    { value: "RR", label: "Roraima" },
    { value: "SC", label: "Santa Catarina" },
    { value: "SP", label: "São Paulo" },
    { value: "SE", label: "Sergipe" },
    { value: "TO", label: "Tocantins" }
  ];
  
  return (
    <OrganizationLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/organization/import-company')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Novo Pedido de Importação</h1>
        </div>
        
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Processo de Importação via RDC 660</AlertTitle>
          <AlertDescription>
            Este formulário coletará todas as informações necessárias para solicitar a autorização 
            excepcional de importação de produtos à base de canabidiol junto à ANVISA. 
            Após o preenchimento completo, estas informações serão enviadas para processamento.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>Formulário de Solicitação de Importação</CardTitle>
            <CardDescription>
              Preencha todos os campos obrigatórios com informações precisas para evitar atrasos no processo de aprovação
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-5 mb-8">
                    <TabsTrigger value="patient-info">Dados do Paciente</TabsTrigger>
                    <TabsTrigger value="medical-info">Dados Médicos</TabsTrigger>
                    <TabsTrigger value="product-info">Produto</TabsTrigger>
                    <TabsTrigger value="documents">Documentos</TabsTrigger>
                    <TabsTrigger value="terms">Termos</TabsTrigger>
                  </TabsList>
                  
                  {/* Aba de Informações do Paciente */}
                  <TabsContent value="patient-info" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="patientName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome completo do paciente" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="patientEmail"
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
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="patientPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input placeholder="(11) 98765-4321" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="patientCpf"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CPF</FormLabel>
                            <FormControl>
                              <Input placeholder="123.456.789-00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="patientBirthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Nascimento</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Separator className="my-4" />
                    
                    <FormField
                      control={form.control}
                      name="patientAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input placeholder="Rua, Número, Complemento" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="patientCity"
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
                        control={form.control}
                        name="patientState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o estado" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {brazilianStates.map((state) => (
                                  <SelectItem key={state.value} value={state.value}>
                                    {state.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="patientZipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input placeholder="12345-678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  {/* Aba de Informações Médicas */}
                  <TabsContent value="medical-info" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="doctorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Médico</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome completo do médico" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="doctorCrm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CRM</FormLabel>
                            <FormControl>
                              <Input placeholder="Número do CRM" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="doctorState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado do CRM</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o estado" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {brazilianStates.map((state) => (
                                  <SelectItem key={state.value} value={state.value}>
                                    {state.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="medicalCondition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condição Médica</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva a condição médica ou diagnóstico do paciente" 
                              {...field} 
                              className="min-h-[100px]"
                            />
                          </FormControl>
                          <FormDescription>
                            Forneça detalhes sobre a condição médica que justifica o uso de canabidiol
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="prescriptionDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data da Prescrição</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  {/* Aba de Informações do Produto */}
                  <TabsContent value="product-info" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="productName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Produto</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: CBD Oil, Epidiolex, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="productConcentration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Concentração</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 100mg/ml, 300mg/30ml" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="productQuantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantidade</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 1 frasco, 30 cápsulas" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="productManufacturer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fabricante</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do fabricante" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Alert className="mt-4">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Informação Importante</AlertTitle>
                      <AlertDescription>
                        Certifique-se de que o produto solicitado está em conformidade com as 
                        regulamentações da ANVISA para importação de produtos à base de canabidiol.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                  
                  {/* Aba de Documentos */}
                  <TabsContent value="documents" className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-md mb-4">
                      <h3 className="font-medium mb-2">Documentos Necessários</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Para processar sua solicitação, precisamos dos seguintes documentos. 
                        Por favor, anexe-os em formato PDF ou JPG.
                      </p>
                      
                      <div className="space-y-4">
                        <div className="border rounded-md p-4">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              <span className="font-medium">Prescrição Médica</span>
                            </div>
                            <Button variant="outline" size="sm">
                              <Upload className="h-4 w-4 mr-2" />
                              Upload
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">
                            Prescrição médica com assinatura e carimbo do médico, contendo dados 
                            do paciente, CID da doença, nome do produto, posologia e quantidade.
                          </p>
                          <FormField
                            control={form.control}
                            name="hasPrescription"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 mt-2">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value} 
                                    onCheckedChange={field.onChange} 
                                  />
                                </FormControl>
                                <FormLabel className="text-xs">
                                  Confirmo que anexei a prescrição médica
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="border rounded-md p-4">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              <span className="font-medium">Documento de Identificação</span>
                            </div>
                            <Button variant="outline" size="sm">
                              <Upload className="h-4 w-4 mr-2" />
                              Upload
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">
                            RG, CNH ou outro documento de identificação válido do paciente.
                          </p>
                          <FormField
                            control={form.control}
                            name="hasIdDocument"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 mt-2">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value} 
                                    onCheckedChange={field.onChange} 
                                  />
                                </FormControl>
                                <FormLabel className="text-xs">
                                  Confirmo que anexei o documento de identificação
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="border rounded-md p-4">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              <span className="font-medium">Laudo/Relatório Médico</span>
                            </div>
                            <Button variant="outline" size="sm">
                              <Upload className="h-4 w-4 mr-2" />
                              Upload
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">
                            Laudo ou relatório médico detalhando a condição de saúde e 
                            justificativa para uso do produto à base de canabidiol.
                          </p>
                          <FormField
                            control={form.control}
                            name="hasMedicalReport"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 mt-2">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value} 
                                    onCheckedChange={field.onChange} 
                                  />
                                </FormControl>
                                <FormLabel className="text-xs">
                                  Confirmo que anexei o laudo/relatório médico
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Importante</AlertTitle>
                      <AlertDescription>
                        Todos os documentos serão enviados à ANVISA como parte do processo de 
                        autorização. Certifique-se de que estão legíveis e completos para evitar 
                        atrasos na aprovação.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                  
                  {/* Aba de Termos e Condições */}
                  <TabsContent value="terms" className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="font-medium mb-2">Termos e Condições</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Por favor, leia atentamente e aceite os termos abaixo para prosseguir 
                        com a solicitação de importação.
                      </p>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="termsAndConditions"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Termos e Condições do Serviço
                                </FormLabel>
                                <FormDescription>
                                  Declaro que li e concordo com os{" "}
                                  <a
                                    href="#"
                                    className="text-primary underline"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      // Aqui você abriria um modal ou redirecionar para os termos
                                    }}
                                  >
                                    termos e condições
                                  </a>{" "}
                                  do serviço de importação.
                                </FormDescription>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="anvisaConsent"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Autorização para ANVISA
                                </FormLabel>
                                <FormDescription>
                                  Autorizo o envio das minhas informações à ANVISA para 
                                  processamento da autorização excepcional de importação, conforme 
                                  exigido pela RDC 660/2022.
                                </FormDescription>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="privacyPolicy"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Política de Privacidade
                                </FormLabel>
                                <FormDescription>
                                  Concordo com a{" "}
                                  <a
                                    href="#"
                                    className="text-primary underline"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      // Aqui você abriria um modal ou redirecionar para a política
                                    }}
                                  >
                                    política de privacidade
                                  </a>{" "}
                                  da empresa e autorizo o processamento dos meus dados para o 
                                  processo de importação.
                                </FormDescription>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Informação Importante</AlertTitle>
                      <AlertDescription>
                        Ao enviar este formulário, você iniciará o processo de solicitação de 
                        autorização para importação junto à ANVISA. Após a aprovação, a empresa 
                        providenciará a importação e entrega do produto solicitado.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-between">
                  {activeTab !== "patient-info" && (
                    <Button type="button" variant="outline" onClick={prevTab}>
                      Voltar
                    </Button>
                  )}
                  
                  {activeTab !== "terms" ? (
                    <Button type="button" onClick={nextTab} className="ml-auto">
                      Próximo
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      className="ml-auto"
                      disabled={createImportRequestMutation.isPending}
                    >
                      {createImportRequestMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : "Enviar Solicitação"}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </OrganizationLayout>
  );
}