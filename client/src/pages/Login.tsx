import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Loader2, User, Eye, ArrowRight, Building, Leaf, 
  Beaker, Stethoscope, Pill, UserCircle, PanelTopInactive 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import { useLocation } from 'wouter';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

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
type UserRole = 'admin' | 'org_admin' | 'doctor' | 'patient' | 'pharmacist' | 'laboratory';

// Interface para informações de tipo de usuário
interface UserTypeInfo {
  label: string;
  icon: React.ReactNode;
  description: string;
  credentials: {
    username: string;
    password: string;
  };
  color: string;
}

export default function Login() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [userType, setUserType] = useState<UserRole>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [orgCode, setOrgCode] = useState<string | null>(null);
  const [isOrgLogin, setIsOrgLogin] = useState(false);
  const [location, navigate] = useLocation();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  
  // Extrair código da organização da URL, se houver
  useEffect(() => {
    // Verifica se URL está no formato /login/ORG-123-ABC
    const matches = location.match(/\/login\/([^/]+)/);
    if (matches && matches[1]) {
      setOrgCode(matches[1]);
      setIsOrgLogin(true);
      setUserType('org_admin'); // Se tiver um código de organização, presumimos login como admin da organização
    }
    
    // Verifica se há parâmetro de status na URL
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    if (status === 'registered') {
      setRegistrationSuccess(true);
      setUserType('org_admin'); // Se veio do registro, presumimos login como admin da organização
    }
  }, [location]);

  // Mapping de tipos de usuário para informações detalhadas
  const userTypeInfo: Record<UserRole, UserTypeInfo> = {
    admin: {
      label: 'Comply',
      icon: <PanelTopInactive className="h-5 w-5" />,
      description: 'Acesse como administrador do sistema',
      credentials: {
        username: 'admin@comply.com',
        password: 'admin123'
      },
      color: 'bg-indigo-50 text-indigo-700 border-indigo-100'
    },
    org_admin: {
      label: 'Organização',
      icon: <Building className="h-5 w-5" />,
      description: 'Acesse como gestor de organização',
      credentials: {
        username: 'admin@organizacao.com',
        password: 'org123'
      },
      color: 'bg-blue-50 text-blue-700 border-blue-100'
    },
    doctor: {
      label: 'Médico',
      icon: <Stethoscope className="h-5 w-5" />,
      description: 'Acesse como profissional médico',
      credentials: {
        username: 'medico@endurancy.com',
        password: 'medico123'
      },
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100'
    },
    pharmacist: {
      label: 'Farmacêutico',
      icon: <Pill className="h-5 w-5" />,
      description: 'Acesse como farmacêutico',
      credentials: {
        username: 'farmaceutico@endurancy.com',
        password: 'farmacia123'
      },
      color: 'bg-orange-50 text-orange-700 border-orange-100'
    },
    laboratory: {
      label: 'Laboratório',
      icon: <Beaker className="h-5 w-5" />,
      description: 'Acesse como laboratório',
      credentials: {
        username: 'admin@laboratorio.com',
        password: 'lab123'
      },
      color: 'bg-purple-50 text-purple-700 border-purple-100'
    },
    patient: {
      label: 'Paciente',
      icon: <UserCircle className="h-5 w-5" />,
      description: 'Acesse como paciente',
      credentials: {
        username: 'paciente@email.com',
        password: 'paciente123'
      },
      color: 'bg-rose-50 text-rose-700 border-rose-100'
    }
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
      // Ajuste para tipos de usuário específicos
      let loginType = userType;
      // Farmacêutico temporariamente usando "doctor"
      if (userType === 'pharmacist') {
        loginType = 'doctor'; 
      }
      
      // Se é um login específico para organização, incluir o código no login
      if (isOrgLogin && orgCode) {
        await login(data.username, data.password, loginType, orgCode);
      } else {
        // Login normal
        await login(data.username, data.password, loginType);
      }
      
      // Redirecionamentos baseados no tipo de usuário
      if (userType === 'pharmacist') {
        window.history.pushState({}, '', '/pharmacist/dashboard');
        window.dispatchEvent(new Event('popstate'));
      } else if (userType === 'laboratory') {
        window.history.pushState({}, '', '/laboratory/dashboard');
        window.dispatchEvent(new Event('popstate'));
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
    const currentCredentials = userTypeInfo[userType].credentials;
    form.setValue('username', currentCredentials.username);
    form.setValue('password', currentCredentials.password);
  }

  return (
    <div className="flex min-h-screen">
      {/* Painel esquerdo - só aparece em telas médias e grandes */}
      <div className="hidden md:block w-1/2 bg-gradient-to-br from-[#e6f7e6] to-[#4CAF50]/10 p-8">
        <div className="h-full flex flex-col">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <Leaf className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Endurancy</h1>
          </div>
          
          <div className="flex-grow flex flex-col justify-center max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Plataforma de controle completa para cannabis medicinal
            </h2>
            <p className="text-gray-600 mb-8">
              Gerencie todo o processo, desde a prescrição médica até a análise laboratorial 
              e dispensação do medicamento, com controle total e em conformidade com a legislação.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mt-0.5">
                  <Stethoscope className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Portal Médico</h3>
                  <p className="text-sm text-gray-600">Gestão de pacientes e prescrições seguras</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mt-0.5">
                  <Beaker className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Portal Laboratorial</h3>
                  <p className="text-sm text-gray-600">Análise e controle de qualidade com HPLC</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mt-0.5">
                  <Pill className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Portal de Farmácia</h3>
                  <p className="text-sm text-gray-600">Dispensação segura e rastreabilidade completa</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-auto">
            <p className="text-sm text-gray-500">© 2025 Endurancy. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
      
      {/* Painel direito com login */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo só aparece em telas pequenas */}
          <div className="md:hidden text-center mb-8">
            <div className="w-16 h-16 bg-[#e6f7e6] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Leaf className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Endurancy</h1>
            <p className="text-gray-500 mt-1">Plataforma de Controle e Regulação</p>
          </div>
          
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <h2 className="text-xl font-bold text-gray-800">Acesso ao Sistema</h2>
              {isOrgLogin && orgCode ? (
                <div className="mt-2">
                  <p className="text-gray-500 text-sm">Faça login na organização</p>
                  <div className="mt-2 px-4 py-2 bg-gray-100 rounded-md flex items-center justify-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-700">{orgCode}</span>
                  </div>
                </div>
              ) : registrationSuccess ? (
                <div className="mt-2">
                  <div className="mt-1 px-4 py-3 bg-green-50 text-green-800 rounded-md border border-green-100">
                    <p className="text-sm font-medium">Organização registrada com sucesso!</p>
                    <p className="text-xs mt-1">Verifique seu email para acessar as informações de login.</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Selecione o tipo de acesso e entre na plataforma</p>
              )}
            </CardHeader>
            
            <Tabs 
              defaultValue={isOrgLogin ? "org_admin" : "admin"} 
              className="w-full" 
              onValueChange={(value) => setUserType(value as UserRole)}
            >
              {!isOrgLogin && (
                <div className="px-6">
                  <TabsList className="flex w-full gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                    {Object.entries(userTypeInfo).map(([role, info]) => (
                      <TabsTrigger
                        key={role}
                        value={role}
                        className={cn(
                          "min-w-[120px] h-20 flex flex-col items-center justify-center gap-1.5 rounded-xl",
                          "data-[state=active]:bg-gray-50 data-[state=active]:border-gray-200",
                          "border border-transparent hover:border-gray-200 px-2"
                        )}
                      >
                        <div 
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            role === userType ? 'bg-[#4CAF50]/20 text-[#4CAF50]' : 'bg-gray-100 text-gray-500'
                          )}
                        >
                          {info.icon}
                        </div>
                        <span className="text-xs font-medium">{info.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              )}
              
              <CardContent className="px-6 pt-6">
                <div className="mb-6">
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium",
                      userTypeInfo[userType].color
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      {userTypeInfo[userType].icon}
                      {userTypeInfo[userType].label}
                    </span>
                  </Badge>
                  <p className="text-sm text-gray-500 mt-2">{userTypeInfo[userType].description}</p>
                </div>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Email ou Usuário</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input 
                                placeholder={userTypeInfo[userType].credentials.username} 
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
                
                {/* Bloco de credenciais de demonstração em versão colapsável */}
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setShowCredentials(!showCredentials)}
                    className="w-full flex items-center justify-between py-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <span className="font-medium">Credenciais de demonstração</span>
                    <span className="text-xs">{showCredentials ? 'Ocultar' : 'Mostrar'}</span>
                  </button>
                  
                  {showCredentials && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200 text-xs">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-500">Email:</span>
                        <span className="font-medium">{userTypeInfo[userType].credentials.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Senha:</span>
                        <span className="font-medium">{userTypeInfo[userType].credentials.password}</span>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={fillDemoCredentials}
                        className="mt-3 text-xs h-8 w-full"
                      >
                        Preencher automaticamente
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Tabs>
            
            <CardFooter className="flex-col items-center gap-4 pt-2 pb-6">
              <Separator className="w-full" />
              
              <div className="flex flex-col items-center gap-4 w-full pt-2">
                <a 
                  href="/forgot-password" 
                  className="text-sm text-[#4CAF50] hover:underline"
                >
                  Esqueceu sua senha?
                </a>
                
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Nova organização?</span>
                  <a 
                    href="/organization-registration" 
                    className="text-sm font-medium text-[#4CAF50] hover:underline flex items-center"
                  >
                    Cadastre-se aqui <Building className="h-4 w-4 ml-1" />
                  </a>
                </div>
              </div>
            </CardFooter>
          </Card>
          
          {/* Copyright só aparece em telas pequenas */}
          <div className="md:hidden text-xs text-center text-gray-500 mt-6">
            © 2025 Endurancy. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </div>
  );
}