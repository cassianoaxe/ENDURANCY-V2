import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Beaker as BeakerIcon, EyeIcon, EyeOffIcon, FlaskConical, Key, Lock, Mail, Shield } from 'lucide-react';

// Schema para validação do formulário
const formSchema = z.object({
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('Digite um e-mail válido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória'),
  rememberMe: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function LaboratoryLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  // Inicializar o hook do formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Função para realizar o login
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // Enviar requisição para a API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          userType: 'laboratory'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao realizar login');
      }

      // Login bem-sucedido
      toast({
        title: 'Login realizado com sucesso',
        description: 'Redirecionando para o painel do laboratório...',
      });

      // Redirecionar para o dashboard do laboratório
      window.location.href = '/laboratory/dashboard';
    } catch (error: any) {
      console.error('Erro no login:', error);
      setError(error.message || 'Ocorreu um erro durante o login. Tente novamente.');
      toast({
        title: 'Erro de login',
        description: error.message || 'Credenciais inválidas. Verifique seu e-mail e senha.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Alternar visibilidade da senha
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <header className="p-4 md:p-6 flex justify-between items-center">
        <div className="flex items-center">
          <FlaskConical className="h-8 w-8 text-blue-600 mr-2" />
          <span className="text-xl font-bold text-blue-700">LabAnalytics</span>
          <span className="text-xs bg-blue-200 text-blue-800 px-2 rounded ml-2">BETA</span>
        </div>
        <div>
          <Button variant="outline" onClick={() => window.location.href = '/laboratory'}>
            Voltar ao Início
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          <div className="flex flex-col justify-center space-y-6 order-2 md:order-1">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-blue-800">
                Portal do Laboratório
              </h1>
              <p className="text-gray-600 md:text-lg">
                Acesse o sistema de gerenciamento de análises e amostras do seu laboratório.
              </p>
            </div>

            <div className="space-y-4 text-gray-600">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <BeakerIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-800">Gestão Completa de Amostras</h3>
                  <p className="text-sm">Controle todo o fluxo de trabalho desde o recebimento até o laudo final.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-800">Segurança e Rastreabilidade</h3>
                  <p className="text-sm">Registro completo de atividades e validação de resultados com múltiplas aprovações.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Lock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-800">Acesso Restrito e Seguro</h3>
                  <p className="text-sm">Proteção de dados sensíveis com controle de acesso baseado em funções.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <Card className="border-blue-200 shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Login do Laboratório</CardTitle>
                <CardDescription className="text-center">
                  Entre com suas credenciais para acessar o sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input 
                                placeholder="seu.email@laboratorio.com"
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
                              <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input 
                                type={showPassword ? "text" : "password"}
                                placeholder="Sua senha segura"
                                className="pl-9"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1 h-8 w-8 p-0"
                                onClick={togglePasswordVisibility}
                              >
                                {showPassword ? (
                                  <EyeOffIcon className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <EyeIcon className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-between mt-2">
                      <FormField
                        control={form.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-sm cursor-pointer">
                              Lembrar-me
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      <Button
                        variant="link"
                        className="text-sm text-blue-600 hover:text-blue-800 p-0"
                        type="button"
                      >
                        Esqueci minha senha
                      </Button>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Entrando...' : 'Entrar'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <div className="text-sm text-center text-gray-500">
                  Acesso exclusivo para laboratórios parceiros.
                </div>
                <div className="text-xs text-center text-gray-400">
                  LabAnalytics © 2025 - Plataforma desenvolvida por Endurancy
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}