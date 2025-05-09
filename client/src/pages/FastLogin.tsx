import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Building, Leaf } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  username: z.string().min(1, 'Email é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function FastLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormData) {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.username,
          password: data.password,
          userType: 'org_admin'
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Email ou senha inválidos');
      }
      
      const userData = await response.json();
      console.log("Login bem-sucedido:", userData);
      
      // Redirecionamento simples e direto
      window.location.replace('/organization/dashboard');
      
    } catch (error) {
      console.error('Login falhou:', error);
      toast({
        title: 'Falha no login',
        description: error instanceof Error ? error.message : 'Erro ao fazer login',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-full flex items-center justify-center p-4">
        <Card className="w-full max-w-md border shadow-sm">
          <CardHeader className="space-y-2 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-12 h-12 bg-[#e6f7e6] rounded-xl flex items-center justify-center">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-gray-800">Endurancy</h2>
              <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">Beta</span>
            </div>
            <p className="text-sm text-gray-500">Faça login para acessar o sistema</p>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="seu@email.com" {...field} />
                      </FormControl>
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
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>Entrar</>
                  )}
                </Button>
                
                <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
                  <div className="p-1 rounded bg-blue-50">
                    <Building className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-sm text-left">
                    <p className="font-medium">Usuário de teste</p>
                    <p className="text-xs text-gray-500">Email: abraceesperanca@gmail.com</p>
                    <p className="text-xs text-gray-500">Senha: abraceesperanca123</p>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}