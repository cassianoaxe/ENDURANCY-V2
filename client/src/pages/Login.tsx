import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, User, Eye, Info, ArrowRight, Building, Code, Leaf } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import { useLocation } from 'wouter';

const loginSchema = z.object({
  username: z.string().min(1, 'O email é obrigatório'),
  password: z.string().min(1, 'A senha é obrigatória'),
  orgCode: z.string().optional(),
});

// Esquema para login direto em organização específica
const orgLoginSchema = z.object({
  username: z.string().min(1, 'O email é obrigatório'),
  password: z.string().min(1, 'A senha é obrigatória'),
  orgCode: z.string().min(1, 'O código da organização é obrigatório'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type OrgLoginFormData = z.infer<typeof orgLoginSchema>;
type UserRole = 'admin' | 'org_admin' | 'doctor' | 'patient';

export default function Login() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [userType, setUserType] = useState<UserRole>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [orgCode, setOrgCode] = useState<string | null>(null);
  const [isOrgLogin, setIsOrgLogin] = useState(false);
  const [location] = useLocation();
  
  // Extrair código da organização da URL, se houver
  useEffect(() => {
    // Verifica se URL está no formato /login/ORG-123-ABC
    const matches = location.match(/\/login\/([^/]+)/);
    if (matches && matches[1]) {
      setOrgCode(matches[1]);
      setIsOrgLogin(true);
      setUserType('org_admin'); // Se tiver um código de organização, presumimos login como administrador da organização
    }
  }, [location]);

  // Mapping de tipos de usuário para rótulos em português
  const userTypeLabels = {
    admin: 'Comply',
    org_admin: 'Organização',
    doctor: 'Médico',
    patient: 'Paciente'
  };

  const form = useForm<LoginFormData>({
    resolver: zodResolver(isOrgLogin ? orgLoginSchema : loginSchema),
    defaultValues: {
      username: '',
      password: '',
      ...(orgCode ? { orgCode } : {}), // Incluir orgCode nos valores padrão se disponível
    },
  });
  
  // Atualizar o formulário quando o código da organização mudar
  useEffect(() => {
    if (orgCode) {
      form.setValue('orgCode', orgCode);
    }
  }, [orgCode, form]);

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true);
    try {
      // Se é um login específico para organização, incluir o código no login
      if (isOrgLogin && orgCode) {
        await login(data.username, data.password, userType, orgCode);
      } else {
        // Login normal
        await login(data.username, data.password, userType);
      }
      
      toast({
        title: 'Login bem-sucedido',
        description: 'Bem-vindo de volta!',
        variant: 'default',
      });
    } catch (error) {
      console.error('Login falhou:', error);
      toast({
        title: 'Falha no login',
        description: 'Email ou senha inválidos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function fillDemoCredentials() {
    // Definir credenciais específicas conforme o tipo de usuário selecionado
    switch (userType) {
      case 'admin':
        form.setValue('username', 'admin@comply.com');
        form.setValue('password', 'admin123');
        break;
      case 'org_admin':
        form.setValue('username', 'admin@organizacao.com');
        form.setValue('password', 'org123');
        break;
      case 'doctor':
        form.setValue('username', 'medico@endurancy.com');
        form.setValue('password', 'medico123');
        break;
      case 'patient':
        form.setValue('username', 'paciente@email.com');
        form.setValue('password', 'paciente123');
        break;
      default:
        form.setValue('username', 'admin@comply.com');
        form.setValue('password', 'admin123');
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f2f7f2]">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#e6f7e6] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Leaf className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Endurancy</h1>
        <p className="text-gray-500 mt-1">Plataforma de Controle e Regulação</p>
      </div>
      
      <Card className="w-full max-w-md shadow-lg border-0">
        <div className="text-center p-6 pb-2">
          <h2 className="text-xl font-bold text-gray-800">Acesso ao Sistema</h2>
          {isOrgLogin && orgCode ? (
            <div className="mt-2">
              <p className="text-gray-500 text-sm">Faça login na organização</p>
              <div className="mt-2 px-4 py-2 bg-gray-100 rounded-md flex items-center justify-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">{orgCode}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm mt-1">Faça login para acessar a plataforma</p>
          )}
        </div>
        
        <Tabs 
          defaultValue={isOrgLogin ? "org_admin" : "admin"} 
          className="w-full" 
          onValueChange={(value) => setUserType(value as UserRole)}
        >
          {!isOrgLogin && (
            <div className="px-6">
              <TabsList className="grid grid-cols-4 h-12 rounded-md bg-gray-100">
                <TabsTrigger 
                  value="admin" 
                  className={cn(
                    "rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-800",
                    "data-[state=active]:shadow-sm font-medium"
                  )}
                >
                  Comply
                </TabsTrigger>
                <TabsTrigger 
                  value="org_admin" 
                  className={cn(
                    "rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-800",
                    "data-[state=active]:shadow-sm font-medium"
                  )}
                >
                  Organização
                </TabsTrigger>
                <TabsTrigger 
                  value="doctor" 
                  className={cn(
                    "rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-800",
                    "data-[state=active]:shadow-sm font-medium"
                  )}
                >
                  Médico
                </TabsTrigger>
                <TabsTrigger 
                  value="patient" 
                  className={cn(
                    "rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-800",
                    "data-[state=active]:shadow-sm font-medium"
                  )}
                >
                  Paciente
                </TabsTrigger>
              </TabsList>
            </div>
          )}
          
          {Object.entries(userTypeLabels).map(([role, label]) => (
            <TabsContent key={role} value={role} className="mt-6">
              <CardContent className="px-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input 
                                placeholder={
                                  role === 'admin' ? 'admin@comply.com' :
                                  role === 'org_admin' ? 'admin@organizacao.com' :
                                  role === 'doctor' ? 'medico@endurancy.com' :
                                  'paciente@email.com'
                                } 
                                className="pl-10 h-12 bg-white" 
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
                          <FormLabel className="text-gray-700">Senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute right-3 top-3 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                                <Eye className="h-4 w-4 text-gray-400" />
                              </div>
                              <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                className="pr-10 h-12 bg-white" 
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
                      className="w-full h-12 bg-[#4CAF50] hover:bg-[#43a047] text-white flex items-center justify-center gap-2"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Processando...
                        </>
                      ) : (
                        <>
                          Entrar <ArrowRight className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
                
                {/* Bloco de credenciais de demonstração */}
                <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-100">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Credenciais de demonstração:</p>
                      {role === 'admin' && (
                        <>
                          <p className="text-xs text-blue-600 mt-1">Email: admin@comply.com</p>
                          <p className="text-xs text-blue-600">Senha: admin123</p>
                        </>
                      )}
                      {role === 'org_admin' && (
                        <>
                          <p className="text-xs text-blue-600 mt-1">Email: admin@organizacao.com</p>
                          <p className="text-xs text-blue-600">Senha: org123</p>
                        </>
                      )}
                      {role === 'doctor' && (
                        <>
                          <p className="text-xs text-blue-600 mt-1">Email: medico@endurancy.com</p>
                          <p className="text-xs text-blue-600">Senha: medico123</p>
                        </>
                      )}
                      {role === 'patient' && (
                        <>
                          <p className="text-xs text-blue-600 mt-1">Email: paciente@email.com</p>
                          <p className="text-xs text-blue-600">Senha: paciente123</p>
                        </>
                      )}
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={fillDemoCredentials}
                        className="mt-2 text-xs h-8 border-blue-200 text-blue-700 hover:bg-blue-100 w-full"
                      >
                        Preencher automaticamente
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </TabsContent>
          ))}
        </Tabs>
        
        <CardFooter className="px-6 pb-6 pt-2 flex flex-col items-center gap-3">
          <a href="#" className="text-sm text-[#4CAF50] hover:underline">
            Esqueceu sua senha?
          </a>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Nova organização?</span>
            <a href="/organization-registration" className="text-sm font-medium text-[#4CAF50] hover:underline flex items-center">
              Cadastre-se aqui <Building className="h-4 w-4 ml-1" />
            </a>
          </div>
        </CardFooter>
        
        <div className="text-xs text-center text-gray-500 pb-4">
          © 2024 Endurancy. Todos os direitos reservados.
        </div>
      </Card>
    </div>
  );
}