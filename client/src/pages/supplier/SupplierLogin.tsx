import React, { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Truck, LockIcon, UserIcon, AlertCircle, FileText, ShoppingBag, Users, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Definir o schema para o formulário de login
const loginSchema = z.object({
  username: z.string().min(1, { message: "Email ou CNPJ é obrigatório" }),
  password: z.string().min(1, { message: "Senha é obrigatória" }),
});

export default function SupplierLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Criar o formulário com react-hook-form e validation com zod
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Mutação para o login
  const loginMutation = useMutation({
    mutationFn: async (data: z.infer<typeof loginSchema>) => {
      setIsLoggingIn(true);
      const response = await apiRequest("POST", "/api/suppliers/auth/login", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha no login");
      }
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao Portal do Fornecedor",
      });
      setIsLoggingIn(false);
      setLocation("/supplier/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
      setIsLoggingIn(false);
    },
  });

  // Função para submeter o formulário
  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
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
        <div className="w-full max-w-7xl grid md:grid-cols-2 gap-8 items-center">
          {/* Coluna de Login */}
          <Card className="w-full max-w-md mx-auto shadow-xl border-red-100">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center text-red-800">Login do Fornecedor</CardTitle>
              <CardDescription className="text-center">
                Acesse sua conta para gerenciar seus produtos e vendas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email ou CNPJ</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="Seu email ou CNPJ" 
                              className="pl-9" 
                              {...field} 
                            />
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
                            <LockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="password" 
                              placeholder="Sua senha" 
                              className="pl-9" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-red-700 hover:bg-red-800"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? (
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
              <div className="mt-4 text-center">
                <a 
                  href="#" 
                  className="text-sm text-red-700 hover:text-red-800"
                  onClick={(e) => {
                    e.preventDefault();
                    toast({
                      title: "Recuperação de senha",
                      description: "Enviamos um email com instruções para recuperar sua senha.",
                    });
                  }}
                >
                  Esqueceu sua senha?
                </a>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Separator />
              <Button 
                variant="outline" 
                className="w-full border-red-200 hover:bg-red-50"
                onClick={() => setLocation("/supplier/register")}
              >
                Cadastrar-se como Fornecedor
              </Button>
            </CardFooter>
          </Card>

          {/* Coluna de Informações */}
          <div className="hidden md:flex flex-col space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-red-800">
                Amplie seus negócios no Portal do Fornecedor
              </h2>
              <p className="text-gray-600">
                Conecte-se com organizações e venda seus produtos em uma plataforma especializada.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-white p-4 rounded-lg shadow-md border border-red-100">
                  <ShoppingBag className="h-8 w-8 text-red-700 mb-2" />
                  <h3 className="font-semibold text-lg">Cadastre Produtos</h3>
                  <p className="text-sm text-gray-500">
                    Organize seu catálogo e faça upload de imagens dos seus produtos
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-md border border-red-100">
                  <FileText className="h-8 w-8 text-red-700 mb-2" />
                  <h3 className="font-semibold text-lg">Participe de Licitações</h3>
                  <p className="text-sm text-gray-500">
                    Acesse oportunidades de negócios em pregões e licitações
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-md border border-red-100">
                  <Truck className="h-8 w-8 text-red-700 mb-2" />
                  <h3 className="font-semibold text-lg">Gerencie Pedidos</h3>
                  <p className="text-sm text-gray-500">
                    Acompanhe e gerencie pedidos e entregas em tempo real
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-md border border-red-100">
                  <Users className="h-8 w-8 text-red-700 mb-2" />
                  <h3 className="font-semibold text-lg">Amplie sua Rede</h3>
                  <p className="text-sm text-gray-500">
                    Conecte-se com organizações e aumente sua carteira de clientes
                  </p>
                </div>
              </div>
            </div>
            
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-800" />
              <AlertTitle className="text-red-800">Atenção</AlertTitle>
              <AlertDescription>
                Para se cadastrar como fornecedor, você precisará informar seu CNPJ e documentos
                comerciais para verificação.
              </AlertDescription>
            </Alert>
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