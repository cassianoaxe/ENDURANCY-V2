import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, User, Eye, ArrowRight, Leaf } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type UserRole = 'admin' | 'org_admin' | 'doctor' | 'patient' | 'pharmacist' | 'laboratory' | 'researcher';

const formSchema = z.object({
  username: z.string().min(1, 'Usuário ou email é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export default function FastLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<UserRole>('org_admin');
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...values,
          userType
        }),
      });

      if (!response.ok) {
        throw new Error('Credenciais inválidas');
      }

      const data = await response.json();
      const loggedInUserType = data.role || userType;
      
      let redirectUrl = '/dashboard';
      
      if (loggedInUserType === 'org_admin') {
        redirectUrl = '/organization/dashboard';
      } else if (loggedInUserType === 'pharmacist') {
        redirectUrl = '/pharmacist/dashboard';
      } else if (loggedInUserType === 'laboratory') {
        redirectUrl = '/laboratory/dashboard';
      } else if (loggedInUserType === 'researcher') {
        redirectUrl = '/researcher/dashboard';
      } else if (loggedInUserType === 'doctor') {
        redirectUrl = '/doctor/dashboard';
      } else if (loggedInUserType === 'patient') {
        redirectUrl = '/patient/dashboard';
      }
      
      // Redirecionamento simples sem recarregar a página
      window.location.href = redirectUrl;
      
    } catch (error: any) {
      console.error('Login falhou:', error);
      toast({
        title: 'Falha no login',
        description: error.message || 'Credenciais inválidas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Área de login (versão simplificada) */}
      <div className="w-full flex items-center justify-center p-4 md:p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo central */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#e6f7e6] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Leaf className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Endurancy</h1>
            <p className="text-gray-500 mt-1">Plataforma de Controle e Regulação</p>
          </div>
          
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <h2 className="text-xl font-bold text-gray-800">Acesso ao Sistema</h2>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="org_admin" className="w-full" 
                onValueChange={(value) => setUserType(value as UserRole)}
              >
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="org_admin">Organização</TabsTrigger>
                  <TabsTrigger value="doctor">Médico</TabsTrigger>
                  <TabsTrigger value="pharmacist">Farmácia</TabsTrigger>
                </TabsList>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email ou Usuário</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="seu.email@exemplo.com" 
                                {...field} 
                                className="pl-9" 
                                disabled={isLoading}
                              />
                              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
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
                                placeholder="Digite sua senha" 
                                type={showPassword ? "text" : "password"} 
                                {...field} 
                                className="pl-9" 
                                disabled={isLoading}
                              />
                              <button 
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        <>
                          Entrar
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </Tabs>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 border-t pt-4">
              <div className="text-xs text-center text-muted-foreground">
                © 2025 Endurancy. Todos os direitos reservados.
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}