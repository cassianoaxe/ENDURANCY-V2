'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email({
    message: 'Por favor, forneça um email válido',
  }),
  password: z.string().min(6, {
    message: 'A senha deve ter pelo menos 6 caracteres',
  }),
  rememberMe: z.boolean().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function PatientLogin() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginValues) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          userType: 'patient',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao fazer login');
      }

      toast({
        title: 'Login bem-sucedido',
        description: 'Redirecionando para o portal do paciente...',
      });

      // Redirecionar para a página de produtos
      window.location.href = '/patient/produtos';
    } catch (error) {
      console.error('Erro de login:', error);
      toast({
        variant: 'destructive',
        title: 'Erro de login',
        description: error instanceof Error ? error.message : 'Usuário ou senha incorretos',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-white p-4">
      <div className="w-full max-w-md">
        <Card className="border shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-12 w-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMxMGIzODEiLz48cGF0aCBkPSJNMjkuNTMxMyA1NS4xMTQ2QzI3LjEwMjQgNTUuMTE0NiAyNS4wMDczIDU0LjU3NzMgMjMuMjQ2MSA1My41MDI3QzIxLjUwMiA1Mi40MSAxOS44ODI2IDUwLjc0OTggMTguMzg4NCA0OC41MjJMMjQuMTU1IDQ0LjYyNEMyNS4xMTM2IDQ2LjE5NTMgMjYuMDcyMiA0Ny4zNTI1IDI3LjAzMDkgNDguMDk1NkMyOC4wMDc2IDQ4LjgzODcgMjkuMDMxMyA0OS4yMTAzIDMwLjEwMjEgNDkuMjEwM0MzMS4xNzI5IDQ5LjIxMDMgMzIuMDM3NSA0OC45MTk2IDMyLjY5NiA0OC4zMzgzQzMzLjM1NDQgNDcuNzM5IDMzLjY4MzYgNDYuOTQzNSAzMy42ODM2IDQ1Ljk1MTlDMzMuNjgzNiA0NS4wNDI0IDMzLjMyNiA0NC4yMDU0IDMyLjYxMDYgNDMuNDQwM0MzMS45MTMzIDQyLjY3NTIgMzAuNDY5MiA0MS44MjgyIDI4LjI3ODMgNDAuODk5MkMyNS4yODgzIDM5LjY2NDQgMjMuMDEyIDM4LjE5NjggMjEuNDQ5NCAzNi40OTY0QzE5Ljg4NjggMzQuNzk2MSAxOS4xMDU1IDMyLjY5NzQgMTkuMTA1NSAzMC4yMDAzQzE5LjEwNTUgMjguNDI3OCAxOS41Njc0IDI2Ljg1MTMgMjAuNDkxMiAyNS40NzA5QzIxLjQzMjggMjQuMDkwNCAyMi43MzA5IDIzLjAyOTggMjQuMzg1NiAyMi4yODkzQzI2LjA1ODQgMjEuNTMxIDI3Ljk1NzYgMjEuMTUxOSAzMC4wODM0IDIxLjE1MTlDMzIuMDkxNiAyMS4xNTE5IDMzLjk2NTcgMjEuNTA2OCAzNS43MDU3IDIyLjIxNjVDMzcuNDYzOSAyMi45MjYzIDM4Ljk5MDggMjMuODgxOCA0MC4yODYzIDI1LjA4MzFMMzUuNjgzIDI5Ljc1MjZDMzQuOTA3NiAyOC44MDcgMzQuMDU4OCAyOC4wNzk1IDMzLjEzNjkgMjcuNTY5OUMzMi4yMzMgMjcuMDYwMyAzMS4yMzA0IDI2LjgwNTUgMzAuMTI5IDI2LjgwNTVDMjkuMjQzMiAyNi44MDU1IDI4LjQ5MzkgMjcuMDQ3OSAyNy44ODE0IDI3LjUzMjdDMjcuMjY4OSAyOC4wMTc1IDI2Ljk2MjYgMjguNjUyNiAyNi45NjI2IDI5LjQzODFDMjYuOTYyNiAzMC4wOTIzIDI3LjIwOTkgMzAuNjk3OCAyNy43MDQ2IDMxLjI1NDZDMjguMTk5MyAzMS44MTEzIDI5LjE1MTggMzIuNDA4IDMwLjU2MTkgMzMuMDQ0OEMzMi4xMjQ1IDMzLjc0NjIgMzMuMzk1IDM0LjQwNjQgMzQuMzczNiAzNS4wMjUzQzM1LjM1MjEgMzUuNjQ0MSAzNi4xNzEgMzYuMzQ5OCAzNi44MzAyIDM3LjE0MjJDMzcuNDg5NSAzNy45MTY5IDM3Ljk5NDIgMzguODA4MiAzOC4zNDM5IDM5LjgxNjlDMzguNjkzNiA0MC44MDgxIDM4Ljg2ODQgNDEuOTEwOSAzOC44Njg0IDQzLjEyNTFDMzguODY4NCA0NS41NTM4IDM4LjAwMDkgNDcuNjA2NyAzNi4yNjU5IDQ5LjI4MzZDMzQuNTMwOSA1MC45NjA1IDMyLjI5NTQgNTIuMDU0IDI5LjU1OTcgNTIuNTY0NEMyOS4wMjE0IDUzLjUzMDcgMjguNjk4MiA1NC4zNjM0IDI5LjUzMTMgNTUuMTE0NloiIGZpbGw9IndoaXRlIi8+PHBhdGggZD0iTTQyLjk5OSA1Ny4xNVY1NC40NDQ4TDY0LjQ1MzEgMjEuODM5OEg2OS45NDI1TDQ4LjQ4ODQgNTQuNDQ0OEg2Ny4wOTI4VjQwLjczMzlINzMuNjM3VjU0LjQ0NDhIODAuMTgxMlY2MEg3My42MzdWNjcuOTk5OEg2Ny4wOTI4VjYwSDQyLjk5OVY1Ny4xNVoiIGZpbGw9IndoaXRlIi8+PC9zdmc+";
                }}
              />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Portal do Paciente</CardTitle>
            <CardDescription className="text-center">
              Entre com seu email e senha para acessar
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="seu.email@exemplo.com"
                            className="pl-10"
                            {...field}
                            disabled={isLoading}
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
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="********"
                            className="pl-10"
                            {...field}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="rememberMe"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                        <label
                          htmlFor="rememberMe"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Lembrar-me
                        </label>
                      </div>
                    )}
                  />
                  <a
                    href="/forgot-password"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Esqueceu a senha?
                  </a>
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex flex-col items-center gap-4">
            <div className="text-center text-sm">
              Não tem uma conta?{" "}
              <a
                href="/patient-registration"
                className="font-medium text-primary hover:underline"
              >
                Registre-se
              </a>
            </div>
            
            <a
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Voltar para a página inicial
            </a>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}