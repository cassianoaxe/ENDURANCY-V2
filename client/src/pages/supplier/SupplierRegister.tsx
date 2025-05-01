import React, { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Loader2, 
  Truck, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  FileText,
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// Definir o schema para o formulário de registro
const brazilianStates = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", 
  "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"
];

const supplierSchema = z.object({
  // Dados básicos
  name: z.string().min(3, { message: "Nome deve ter no mínimo 3 caracteres" }),
  tradingName: z.string().min(3, { message: "Nome fantasia deve ter no mínimo 3 caracteres" }),
  cnpj: z.string().min(14, { message: "CNPJ inválido" }).max(18),
  phone: z.string().min(10, { message: "Telefone inválido" }),
  email: z.string().email({ message: "Email inválido" }),
  website: z.string().url({ message: "URL inválida" }).optional().or(z.literal("")),
  description: z.string().min(20, { message: "Descrição deve ter no mínimo 20 caracteres" }),
  
  // Endereço
  address: z.string().min(5, { message: "Endereço deve ter no mínimo 5 caracteres" }),
  addressNumber: z.string().min(1, { message: "Número é obrigatório" }),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, { message: "Bairro deve ter no mínimo 2 caracteres" }),
  city: z.string().min(2, { message: "Cidade deve ter no mínimo 2 caracteres" }),
  state: z.enum(brazilianStates as [string, ...string[]], {
    message: "Estado inválido",
  }),
  zipCode: z.string().min(8, { message: "CEP inválido" }).max(9),
  
  // Acesso
  username: z.string().min(3, { message: "Nome de usuário deve ter no mínimo 3 caracteres" }),
  password: z.string().min(8, { message: "Senha deve ter no mínimo 8 caracteres" }),
  passwordConfirm: z.string().min(8, { message: "Confirme sua senha" }),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "As senhas não conferem",
  path: ["passwordConfirm"],
});

export default function SupplierRegister() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("info");
  const [registrationStep, setRegistrationStep] = useState(1);
  const [registrationProgress, setRegistrationProgress] = useState(25);

  // Criar o formulário com react-hook-form e validation com zod
  const form = useForm<z.infer<typeof supplierSchema>>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      tradingName: "",
      cnpj: "",
      phone: "",
      email: "",
      website: "",
      description: "",
      address: "",
      addressNumber: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "SP",
      zipCode: "",
      username: "",
      password: "",
      passwordConfirm: "",
    },
  });

  // Mutação para o registro de fornecedor
  const registerMutation = useMutation({
    mutationFn: async (data: z.infer<typeof supplierSchema>) => {
      const response = await apiRequest("POST", "/api/suppliers/register", {
        // Dados básicos
        name: data.name,
        tradingName: data.tradingName,
        cnpj: data.cnpj,
        phone: data.phone,
        email: data.email,
        website: data.website || null,
        description: data.description,
        
        // Endereço completo
        address: `${data.address}, ${data.addressNumber}${data.complement ? `, ${data.complement}` : ""}, ${data.neighborhood}`,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        
        // Dados de acesso
        username: data.username,
        password: data.password,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha no cadastro");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Cadastro realizado com sucesso",
        description: "Seu cadastro foi enviado e está em análise pela nossa equipe.",
      });
      setLocation("/supplier/register-success");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Avançar para o próximo passo
  const advanceStep = () => {
    if (registrationStep === 1) {
      // Validar campos do passo 1
      const result = form.trigger(['name', 'tradingName', 'cnpj', 'email', 'phone', 'description']);
      result.then(isValid => {
        if (isValid) {
          setRegistrationStep(2);
          setActiveTab("address");
          setRegistrationProgress(50);
        }
      });
    } else if (registrationStep === 2) {
      // Validar campos do passo 2
      const result = form.trigger(['address', 'addressNumber', 'neighborhood', 'city', 'state', 'zipCode']);
      result.then(isValid => {
        if (isValid) {
          setRegistrationStep(3);
          setActiveTab("access");
          setRegistrationProgress(75);
        }
      });
    } else if (registrationStep === 3) {
      // Validar campos do passo 3
      const result = form.trigger(['username', 'password', 'passwordConfirm']);
      result.then(isValid => {
        if (isValid) {
          setRegistrationStep(4);
          setActiveTab("confirm");
          setRegistrationProgress(100);
        }
      });
    }
  };

  // Voltar para o passo anterior
  const backStep = () => {
    if (registrationStep === 2) {
      setRegistrationStep(1);
      setActiveTab("info");
      setRegistrationProgress(25);
    } else if (registrationStep === 3) {
      setRegistrationStep(2);
      setActiveTab("address");
      setRegistrationProgress(50);
    } else if (registrationStep === 4) {
      setRegistrationStep(3);
      setActiveTab("access");
      setRegistrationProgress(75);
    }
  };

  // Função para submeter o formulário
  const onSubmit = (data: z.infer<typeof supplierSchema>) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex flex-col">
      {/* Cabeçalho */}
      <header className="bg-gradient-to-r from-red-800 to-red-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Truck className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Portal do Fornecedor</h1>
          </div>
          <nav>
            <Button variant="ghost" className="text-white hover:text-white hover:bg-red-700" onClick={() => setLocation("/supplier/login")}>
              Voltar para Login
            </Button>
          </nav>
        </div>
      </header>

      {/* Progresso do cadastro */}
      <div className="bg-white shadow-sm border-b border-red-100 px-4 py-2">
        <div className="container mx-auto">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Etapa {registrationStep} de 4</span>
              <span>{registrationProgress}% concluído</span>
            </div>
            <Progress value={registrationProgress} className="h-2 bg-red-100" indicatorClassName="bg-red-700" />
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="flex-grow container mx-auto py-8 px-4">
        <Card className="w-full max-w-3xl mx-auto shadow-lg border-red-100">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-red-800">Cadastro de Fornecedor</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para se cadastrar como fornecedor na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="info" disabled={registrationStep !== 1}>Informações</TabsTrigger>
                <TabsTrigger value="address" disabled={registrationStep < 2}>Endereço</TabsTrigger>
                <TabsTrigger value="access" disabled={registrationStep < 3}>Acesso</TabsTrigger>
                <TabsTrigger value="confirm" disabled={registrationStep < 4}>Confirmação</TabsTrigger>
              </TabsList>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Passo 1: Informações Básicas */}
                  <TabsContent value="info" className="space-y-4">
                    <Alert className="bg-red-50 border-red-200">
                      <Info className="h-4 w-4 text-red-800" />
                      <AlertTitle className="text-red-800">Importante</AlertTitle>
                      <AlertDescription>
                        Informe os dados exatos que constam no Cadastro Nacional de Pessoa Jurídica (CNPJ)
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Razão Social</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Razão Social da empresa" className="pl-9" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tradingName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Fantasia</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome Fantasia da empresa" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="cnpj"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CNPJ</FormLabel>
                            <FormControl>
                              <Input placeholder="00.000.000/0000-00" {...field} />
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
                              <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="(00) 00000-0000" className="pl-9" {...field} />
                              </div>
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
                            <FormLabel>Email Comercial</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="email@empresa.com.br" className="pl-9" {...field} />
                              </div>
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
                            <FormLabel>Website (opcional)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="https://www.empresa.com.br" className="pl-9" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição da Empresa</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva brevemente sua empresa, áreas de atuação e principais produtos/serviços" 
                              className="h-32 resize-none"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                          <FormDescription>
                            Mínimo de 20 caracteres
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  {/* Passo 2: Endereço */}
                  <TabsContent value="address" className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Logradouro</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input placeholder="Rua, Avenida, etc." className="pl-9" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="addressNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número</FormLabel>
                            <FormControl>
                              <Input placeholder="123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="complement"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Complemento (opcional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Sala, Andar, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                    </div>

                    <div className="grid grid-cols-3 gap-4">
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

                      <FormField
                        control={form.control}
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
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {brazilianStates.map((state) => (
                                  <SelectItem key={state} value={state}>
                                    {state}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  {/* Passo 3: Dados de Acesso */}
                  <TabsContent value="access" className="space-y-4">
                    <Alert className="bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-800" />
                      <AlertTitle className="text-red-800">Atenção</AlertTitle>
                      <AlertDescription>
                        Estas serão suas credenciais para acessar o Portal do Fornecedor.
                        Escolha um nome de usuário e senha seguros.
                      </AlertDescription>
                    </Alert>

                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome de Usuário</FormLabel>
                          <FormControl>
                            <Input placeholder="nome.usuario" {...field} />
                          </FormControl>
                          <FormDescription>
                            Seu nome de usuário único para acessar a plataforma
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Senha</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="********" {...field} />
                            </FormControl>
                            <FormDescription>
                              Mínimo de 8 caracteres
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="passwordConfirm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirme a Senha</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="********" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  {/* Passo 4: Confirmação */}
                  <TabsContent value="confirm" className="space-y-6">
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-700">Quase lá!</AlertTitle>
                      <AlertDescription className="text-green-600">
                        Revise seus dados antes de finalizar o cadastro
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-lg text-red-800">Dados da Empresa</h3>
                        <Separator className="my-2" />
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div className="grid grid-cols-2">
                            <dt className="font-medium">Razão Social:</dt>
                            <dd>{form.watch("name")}</dd>
                          </div>
                          <div className="grid grid-cols-2">
                            <dt className="font-medium">Nome Fantasia:</dt>
                            <dd>{form.watch("tradingName")}</dd>
                          </div>
                          <div className="grid grid-cols-2">
                            <dt className="font-medium">CNPJ:</dt>
                            <dd>{form.watch("cnpj")}</dd>
                          </div>
                          <div className="grid grid-cols-2">
                            <dt className="font-medium">Telefone:</dt>
                            <dd>{form.watch("phone")}</dd>
                          </div>
                          <div className="grid grid-cols-2">
                            <dt className="font-medium">Email:</dt>
                            <dd>{form.watch("email")}</dd>
                          </div>
                          {form.watch("website") && (
                            <div className="grid grid-cols-2">
                              <dt className="font-medium">Website:</dt>
                              <dd>{form.watch("website")}</dd>
                            </div>
                          )}
                        </dl>
                      </div>

                      <div>
                        <h3 className="font-medium text-lg text-red-800">Endereço</h3>
                        <Separator className="my-2" />
                        <p className="text-sm">
                          {form.watch("address")}, {form.watch("addressNumber")}
                          {form.watch("complement") && `, ${form.watch("complement")}`}<br />
                          {form.watch("neighborhood")}, {form.watch("city")} - {form.watch("state")}<br />
                          CEP: {form.watch("zipCode")}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-medium text-lg text-red-800">Dados de Acesso</h3>
                        <Separator className="my-2" />
                        <p className="text-sm">
                          <span className="font-medium">Nome de usuário:</span> {form.watch("username")}<br />
                          <span className="font-medium">Senha:</span> ********
                        </p>
                      </div>
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertTitle className="text-blue-700">Processo de verificação</AlertTitle>
                      <AlertDescription className="text-blue-600">
                        Após enviar o cadastro, nossa equipe fará a verificação dos dados informados.
                        Você receberá um email quando seu cadastro for aprovado.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>

                  {/* Botões de navegação */}
                  <div className="flex justify-between pt-4">
                    {registrationStep > 1 ? (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={backStep}
                        className="border-red-200 hover:bg-red-50"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                      </Button>
                    ) : (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setLocation("/supplier/login")}
                        className="border-red-200 hover:bg-red-50"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Cancelar
                      </Button>
                    )}

                    {registrationStep < 4 ? (
                      <Button 
                        type="button" 
                        onClick={advanceStep}
                        className="bg-red-700 hover:bg-red-800"
                      >
                        Continuar
                      </Button>
                    ) : (
                      <Button 
                        type="submit" 
                        className="bg-red-700 hover:bg-red-800"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          "Finalizar Cadastro"
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* Rodapé */}
      <footer className="bg-red-900 text-white p-4">
        <div className="container mx-auto text-center">
          <p className="text-sm">© 2025 Portal do Fornecedor - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}