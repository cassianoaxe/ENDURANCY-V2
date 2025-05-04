import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Truck, Mail, Lock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Definir schema de validação
const formSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
  password: z.string().min(1, "A senha é obrigatória"),
  rememberMe: z.boolean().optional(),
});

// Tipagem para os dados do formulário
type FormValues = z.infer<typeof formSchema>;

export default function SupplierLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Verificar se o usuário já está autenticado
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log("Verificando status de autenticação...");
        console.log("Tentativa 1/1 de verificar autenticação");
        const userData = await apiRequest("/api/auth/me");
        if (userData && userData.id) {
          console.log("Usuário autenticado:", userData);
          // Se o usuário já estiver autenticado como supplier, redirecionar para o CMarket
          if (userData.role === "supplier") {
            console.log("Verificando papel do usuário para redirecionamento correto:", userData.role);
            console.log("Usuário precisa ser redirecionado para o CMarket");
            console.log("Redirecionando para /supplier/cmarket");
            console.log("Redirecionamento de login em andamento, não interferir");
            setLocation("/supplier/cmarket");
          }
        }
      } catch (error) {
        console.log("Usuário não autenticado. Status:", error.status || 401);
        console.error("Erro de autenticação:", error.message);
      }
    };

    checkAuthStatus();
  }, [setLocation]);

  // Inicialização do formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Função para lidar com o envio do formulário
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    
    try {
      // Preparar dados para o login
      const loginData = {
        email: data.email,
        password: data.password
      };
      
      // Usar a nova API específica para fornecedores
      const response = await fetch("/api/suppliers/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log("Login bem sucedido:", result.data);
        
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao Portal do Fornecedor",
        });
        
        // Redireciona para o CMarket (marketplace do fornecedor)
        setLocation("/supplier/cmarket");
      } else {
        throw new Error(result.error || "Erro ao fazer login");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Credenciais inválidas",
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
            <Button variant="ghost" className="text-white hover:text-white hover:bg-red-700" onClick={() => window.location.href = "/"}>
              Voltar para Home
            </Button>
          </nav>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
          {/* Seção de Login */}
          <Card className="w-full shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Acesso ao Portal</CardTitle>
              <CardDescription className="text-center">
                Entre com suas credenciais para acessar o portal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        <div className="flex items-center justify-between">
                          <FormLabel>Senha</FormLabel>
                          <a 
                            className="text-xs text-red-700 hover:text-red-900"
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              toast({
                                title: "Recuperação de senha",
                                description: "Funcionalidade em desenvolvimento",
                              });
                            }}
                          >
                            Esqueceu a senha?
                          </a>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Sua senha"
                              type="password"
                              className="pl-10"
                              {...field}
                              disabled={isLoading}
                            />
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                              checked={field.value}
                              onChange={field.onChange}
                              disabled={isLoading}
                            />
                            <label htmlFor="rememberMe" className="text-sm font-medium text-gray-700">
                              Lembrar de mim
                            </label>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-red-700 hover:bg-red-800"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm text-gray-500">
                Não tem uma conta?{" "}
                <a 
                  className="text-red-700 hover:text-red-900 font-medium"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setLocation("/supplier/register");
                  }}
                >
                  Cadastre-se agora
                </a>
              </div>
            </CardFooter>
          </Card>

          {/* Seção de Informações */}
          <div className="hidden md:flex flex-col space-y-6 text-center md:text-left">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Portal do Fornecedor</h2>
              <p className="text-gray-600">
                Tenha acesso a todas as funcionalidades exclusivas para fornecedores da plataforma.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="rounded-lg bg-white p-4 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-2">Vantagens para Fornecedores</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-800 mr-2">✓</span>
                    <span>Conecte-se diretamente com organizações de saúde</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-800 mr-2">✓</span>
                    <span>Gerencie catálogo de produtos e estoque</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-800 mr-2">✓</span>
                    <span>Acompanhe pedidos e pagamentos em tempo real</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-800 mr-2">✓</span>
                    <span>Participe de licitações e cotações</span>
                  </li>
                </ul>
              </div>
              
              <div className="rounded-lg bg-gradient-to-br from-red-600 to-red-800 p-4 text-white shadow-lg">
                <h3 className="font-semibold mb-2">Novo no Portal?</h3>
                <p className="text-sm mb-4">
                  Cadastre-se agora e comece a expandir seus negócios com acesso a novas oportunidades.
                </p>
                <Button 
                  className="bg-white text-red-800 hover:bg-gray-100 w-full"
                  onClick={() => setLocation("/supplier/register")}
                >
                  Cadastrar como Fornecedor
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