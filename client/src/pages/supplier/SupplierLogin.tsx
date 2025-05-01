import React, { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Eye, EyeOff, Truck, Mail, Key, ChevronRight, LoaderCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Definir schema de validação
const formSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  remember: z.boolean().optional(),
});

// Tipagem para os dados do formulário
type FormValues = z.infer<typeof formSchema>;

export default function SupplierLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Inicialização do formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  // Função para lidar com o envio do formulário
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    
    try {
      // Simulação de login bem-sucedido para demonstração
      setTimeout(() => {
        toast({
          title: "Login realizado com sucesso",
          description: "Redirecionando para o dashboard...",
        });
        
        setLocation("/supplier/dashboard");
        setIsLoading(false);
      }, 1500);
      
      // Implementação futura de chamada real de API
      /*
      const response = await apiRequest("POST", "/api/suppliers/login", data);
      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Login realizado com sucesso",
          description: "Redirecionando para o dashboard...",
        });
        
        setLocation("/supplier/dashboard");
      } else {
        toast({
          title: "Erro ao fazer login",
          description: result.message || "Credenciais inválidas",
          variant: "destructive",
        });
      }
      */
    } catch (error) {
      toast({
        title: "Erro ao fazer login",
        description: "Ocorreu um erro ao processar sua solicitação",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
        <div className="w-full max-w-6xl flex flex-col lg:flex-row bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Seção de Login (Lado Esquerdo) */}
          <div className="w-full lg:w-1/2 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Acesso ao Portal</h2>
              <p className="text-gray-600">Conecte-se para acessar sua área de fornecedor</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="seu@email.com"
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Sua senha"
                            type={showPassword ? "text" : "password"}
                            className="pl-10 pr-10"
                            {...field}
                            disabled={isLoading}
                          />
                          <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Button
                            type="button"
                            variant="ghost"
                            className="absolute right-0 top-0 h-10 w-10 p-0 text-gray-400"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="remember"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                            id="remember"
                          />
                        </FormControl>
                        <label
                          htmlFor="remember"
                          className="text-sm text-gray-600 cursor-pointer"
                        >
                          Lembrar-me
                        </label>
                      </FormItem>
                    )}
                  />

                  <a
                    href="#"
                    className="text-sm text-red-700 hover:text-red-900"
                    onClick={(e) => {
                      e.preventDefault();
                      toast({
                        title: "Recuperação de senha",
                        description: "Esta funcionalidade estará disponível em breve.",
                      });
                    }}
                  >
                    Esqueceu a senha?
                  </a>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-red-700 hover:bg-red-800"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      Entrar
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Não tem uma conta? <br />
                <Button 
                  variant="link" 
                  className="p-0 text-red-700 hover:text-red-900"
                  onClick={() => setLocation("/supplier/register")}
                  disabled={isLoading}
                >
                  Cadastre-se como fornecedor
                </Button>
              </p>
            </div>
          </div>

          {/* Banner Informativo (Lado Direito) */}
          <div className="w-full lg:w-1/2 bg-gradient-to-br from-red-700 to-red-900 text-white p-8 hidden lg:block">
            <div className="h-full flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-6">Portal do Fornecedor</h2>
                <p className="text-lg mb-8">
                  Acesse sua plataforma exclusiva para gerenciar vendas, pedidos e sua relação com nossos clientes.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-red-600 p-2 rounded-md flex-shrink-0">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Gestão de Pedidos</h3>
                      <p className="text-red-200">Acompanhe seus pedidos em tempo real, do processamento à entrega.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-red-600 p-2 rounded-md flex-shrink-0">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Catálogo de Produtos</h3>
                      <p className="text-red-200">Gerencie seu catálogo, preços e disponibilidade de estoque com facilidade.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-red-600 p-2 rounded-md flex-shrink-0">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Relatórios e Análises</h3>
                      <p className="text-red-200">Acompanhe seu desempenho com dashboards e estatísticas detalhadas.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-red-800"
                  onClick={() => setLocation("/supplier/register")}
                >
                  Ainda não é fornecedor? Cadastre-se
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
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