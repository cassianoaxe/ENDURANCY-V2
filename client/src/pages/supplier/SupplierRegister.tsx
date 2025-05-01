import React, { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Truck, Mail, Phone, Building, User, LoaderCircle, ArrowLeft, FileCheck, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Definir schema de validação
const formSchema = z.object({
  companyName: z.string().min(3, "O nome da empresa deve ter pelo menos 3 caracteres"),
  tradingName: z.string().min(2, "O nome fantasia deve ter pelo menos 2 caracteres"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  email: z.string().email("Digite um e-mail válido"),
  phone: z.string().min(10, "Telefone inválido"),
  contactName: z.string().min(3, "O nome do contato deve ter pelo menos 3 caracteres"),
  address: z.object({
    street: z.string().min(3, "Endereço inválido"),
    number: z.string().min(1, "Número inválido"),
    complement: z.string().optional(),
    neighborhood: z.string().min(2, "Bairro inválido"),
    city: z.string().min(2, "Cidade inválida"),
    state: z.string().min(2, "Estado inválido"),
    zipCode: z.string().min(8, "CEP inválido"),
  }),
  category: z.string().min(1, "Selecione uma categoria"),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  website: z.string().url("URL inválida").or(z.literal("")),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "Você deve aceitar os termos de uso" }),
  }),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "A confirmação de senha deve ter pelo menos 6 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não conferem",
  path: ["confirmPassword"],
});

// Tipagem para os dados do formulário
type FormValues = z.infer<typeof formSchema>;

export default function SupplierRegister() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("company");

  // Inicialização do formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      tradingName: "",
      cnpj: "",
      email: "",
      phone: "",
      contactName: "",
      address: {
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
      },
      category: "",
      description: "",
      website: "",
      acceptTerms: false,
      password: "",
      confirmPassword: "",
    },
  });

  // Função para lidar com o envio do formulário
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    
    try {
      // Simulação de registro bem-sucedido para demonstração
      setTimeout(() => {
        toast({
          title: "Registro realizado com sucesso",
          description: "Sua conta de fornecedor foi criada.",
        });
        
        setLocation("/supplier/register-success");
        setIsLoading(false);
      }, 1500);
      
      // Implementação futura de chamada real de API
      /*
      const response = await apiRequest("POST", "/api/suppliers/register", data);
      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Registro realizado com sucesso",
          description: "Sua conta de fornecedor foi criada.",
        });
        
        setLocation("/supplier/register-success");
      } else {
        toast({
          title: "Erro ao registrar",
          description: result.message || "Não foi possível completar o registro",
          variant: "destructive",
        });
      }
      */
    } catch (error) {
      toast({
        title: "Erro ao registrar",
        description: "Ocorreu um erro ao processar sua solicitação",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para navegar entre as abas do formulário
  const goToNextTab = () => {
    if (activeTab === "company") {
      // Validar campos da aba atual antes de prosseguir
      const companyFields = ["companyName", "tradingName", "cnpj", "email", "phone", "contactName", "category"];
      
      const isValid = companyFields.every(field => {
        const fieldState = form.getFieldState(field as any);
        if (fieldState.invalid && fieldState.isDirty) return false;
        
        // Validar manualmente se o campo não foi tocado
        form.trigger(field as any);
        return !form.getFieldState(field as any).invalid;
      });
      
      if (isValid) {
        setActiveTab("address");
      } else {
        toast({
          title: "Campos inválidos",
          description: "Por favor, preencha todos os campos obrigatórios corretamente.",
          variant: "destructive",
        });
      }
    } else if (activeTab === "address") {
      // Validar campos de endereço
      const addressFields = ["address.street", "address.number", "address.neighborhood", "address.city", "address.state", "address.zipCode"];
      
      const isValid = addressFields.every(field => {
        const fieldState = form.getFieldState(field as any);
        if (fieldState.invalid && fieldState.isDirty) return false;
        
        // Validar manualmente se o campo não foi tocado
        form.trigger(field as any);
        return !form.getFieldState(field as any).invalid;
      });
      
      if (isValid) {
        setActiveTab("account");
      } else {
        toast({
          title: "Campos inválidos",
          description: "Por favor, preencha todos os campos obrigatórios corretamente.",
          variant: "destructive",
        });
      }
    }
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
            <Button variant="ghost" className="text-white hover:text-white hover:bg-red-700" onClick={() => setLocation("/")}>
              Voltar para Home
            </Button>
          </nav>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-6xl bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start mb-8 gap-4">
              <Button 
                variant="outline" 
                className="flex items-center text-red-800"
                onClick={() => setLocation("/supplier/login")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para o login
              </Button>

              <div>
                <h2 className="text-2xl font-bold text-gray-800">Cadastro de Fornecedor</h2>
                <p className="text-gray-600">Preencha o formulário para se cadastrar como fornecedor</p>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="company" disabled={isLoading}>Dados da Empresa</TabsTrigger>
                    <TabsTrigger value="address" disabled={isLoading}>Endereço</TabsTrigger>
                    <TabsTrigger value="account" disabled={isLoading}>Conta e Acesso</TabsTrigger>
                  </TabsList>

                  {/* Aba 1: Dados da Empresa */}
                  <TabsContent value="company" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Razão Social *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="Nome da empresa conforme registro"
                                  className="pl-10"
                                  {...field}
                                  disabled={isLoading}
                                />
                                <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                            <FormLabel>Nome Fantasia *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="Nome comercial da empresa"
                                  className="pl-10"
                                  {...field}
                                  disabled={isLoading}
                                />
                                <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              </div>
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
                            <FormLabel>CNPJ *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="00.000.000/0000-00"
                                  className="pl-10"
                                  {...field}
                                  disabled={isLoading}
                                />
                                <FileCheck className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoria de Produtos *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="cannabis">Produtos de Cannabis</SelectItem>
                                <SelectItem value="supplements">Suplementos</SelectItem>
                                <SelectItem value="equipment">Equipamentos</SelectItem>
                                <SelectItem value="laboratory">Insumos de Laboratório</SelectItem>
                                <SelectItem value="cultivation">Insumos para Cultivo</SelectItem>
                                <SelectItem value="other">Outros</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Responsável *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="Nome completo do responsável"
                                  className="pl-10"
                                  {...field}
                                  disabled={isLoading}
                                />
                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              </div>
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
                            <FormLabel>E-mail *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="email@empresa.com"
                                  type="email"
                                  className="pl-10"
                                  {...field}
                                  disabled={isLoading}
                                />
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              </div>
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
                            <FormLabel>Telefone *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="(00) 00000-0000"
                                  className="pl-10"
                                  {...field}
                                  disabled={isLoading}
                                />
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="https://www.seusite.com.br"
                                  className="pl-10"
                                  {...field}
                                  disabled={isLoading}
                                />
                                <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Campo opcional
                            </FormDescription>
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
                          <FormLabel>Descrição da Empresa *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva brevemente sua empresa e produtos"
                              className="min-h-[100px]"
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormDescription>
                            Mínimo de 10 caracteres
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end">
                      <Button 
                        type="button" 
                        className="bg-red-700 hover:bg-red-800"
                        disabled={isLoading}
                        onClick={goToNextTab}
                      >
                        Próximo
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Aba 2: Endereço */}
                  <TabsContent value="address" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="address.street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rua/Avenida *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="Nome da rua ou avenida"
                                  className="pl-10"
                                  {...field}
                                  disabled={isLoading}
                                />
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="address.number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="123"
                                  {...field}
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="address.complement"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Complemento</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Sala, Andar, etc."
                                  {...field}
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="address.neighborhood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bairro *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nome do bairro"
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CEP *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="00000-000"
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nome da cidade"
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o estado" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="AC">Acre</SelectItem>
                                <SelectItem value="AL">Alagoas</SelectItem>
                                <SelectItem value="AP">Amapá</SelectItem>
                                <SelectItem value="AM">Amazonas</SelectItem>
                                <SelectItem value="BA">Bahia</SelectItem>
                                <SelectItem value="CE">Ceará</SelectItem>
                                <SelectItem value="DF">Distrito Federal</SelectItem>
                                <SelectItem value="ES">Espírito Santo</SelectItem>
                                <SelectItem value="GO">Goiás</SelectItem>
                                <SelectItem value="MA">Maranhão</SelectItem>
                                <SelectItem value="MT">Mato Grosso</SelectItem>
                                <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                                <SelectItem value="MG">Minas Gerais</SelectItem>
                                <SelectItem value="PA">Pará</SelectItem>
                                <SelectItem value="PB">Paraíba</SelectItem>
                                <SelectItem value="PR">Paraná</SelectItem>
                                <SelectItem value="PE">Pernambuco</SelectItem>
                                <SelectItem value="PI">Piauí</SelectItem>
                                <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                                <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                                <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                                <SelectItem value="RO">Rondônia</SelectItem>
                                <SelectItem value="RR">Roraima</SelectItem>
                                <SelectItem value="SC">Santa Catarina</SelectItem>
                                <SelectItem value="SP">São Paulo</SelectItem>
                                <SelectItem value="SE">Sergipe</SelectItem>
                                <SelectItem value="TO">Tocantins</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setActiveTab("company")}
                        disabled={isLoading}
                      >
                        Voltar
                      </Button>
                      <Button 
                        type="button" 
                        className="bg-red-700 hover:bg-red-800"
                        disabled={isLoading}
                        onClick={goToNextTab}
                      >
                        Próximo
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Aba 3: Conta e Acesso */}
                  <TabsContent value="account" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Senha *</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Mínimo de 6 caracteres"
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormDescription>
                              Use uma senha segura com pelo menos 6 caracteres
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirmar Senha *</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Repita sua senha"
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="acceptTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Eu aceito os termos de uso e políticas de privacidade *
                            </FormLabel>
                            <FormDescription>
                              Ao se cadastrar, você concorda com nossos <a href="#" className="text-red-700 hover:text-red-900 underline">Termos de Uso</a> e <a href="#" className="text-red-700 hover:text-red-900 underline">Política de Privacidade</a>.
                            </FormDescription>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-between mt-8">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setActiveTab("address")}
                        disabled={isLoading}
                      >
                        Voltar
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-red-700 hover:bg-red-800"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          "Finalizar Cadastro"
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </form>
            </Form>
          </div>
        </div>
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