import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

// Definir schemas de validação
const loginSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(1, { message: 'Senha é obrigatória' }),
  remember: z.boolean().optional(),
});

const registerSchema = z.object({
  name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
  terms: z.boolean().refine(val => val === true, {
    message: 'Você deve aceitar os termos e condições',
  }),
});

// Tipos inferidos dos schemas
type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

interface PatientLoginProps {
  organizationId?: string;
}

const PatientLogin = ({ organizationId }: PatientLoginProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [organization, setOrganization] = useState<{
    id: number;
    name: string;
    type: string;
    logo: string;
  } | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Buscar informações sobre a organização se o ID for fornecido
  useEffect(() => {
    const fetchOrganizationInfo = async () => {
      if (organizationId) {
        try {
          console.log('Buscando informações para organização ID:', organizationId);
          const response = await axios.get(`/api/organizations/${organizationId}/info`);
          console.log('Resposta da API:', response.data);
          
          if (response.data && response.data.name) {
            console.log('Organização encontrada:', response.data.name);
            setOrganization(response.data);
          }
        } catch (error) {
          console.error('Erro ao buscar informações da organização:', error);
          toast({
            title: 'Erro',
            description: 'Não foi possível carregar os dados da clínica',
            variant: 'destructive',
          });
        }
      } else {
        console.log('Nenhum ID de organização fornecido');
      }
    };
    
    fetchOrganizationInfo();
  }, [organizationId, toast]);
  
  // Configuração do formulário de login
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  // Configuração do formulário de registro
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      terms: false,
    },
  });

  // Função para lidar com o login
  const onLoginSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const requestData: any = {
        email: values.email,
        password: values.password,
      };
      
      // Incluir ID da organização se existir
      if (organizationId) {
        requestData.organizationId = organizationId;
      }
      
      const response = await axios.post('/api/auth/patient/login', requestData);

      if (response.data.success) {
        toast({
          title: 'Login realizado com sucesso',
          description: 'Você será redirecionado para o dashboard.',
          variant: 'default',
        });
        // Redirecionamento para o dashboard de pacientes
        setLocation('/patient/dashboard');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast({
        title: 'Erro ao fazer login',
        description: 'Email ou senha incorretos. Por favor, tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para lidar com o registro
  const onRegisterSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const requestData: any = {
        name: values.name,
        email: values.email,
        password: values.password,
      };
      
      // Incluir ID da organização se existir
      if (organizationId) {
        requestData.organizationId = organizationId;
      }
      
      console.log('Enviando solicitação de registro:', requestData);
      
      const response = await axios.post('/api/auth/patient/register', requestData);
      console.log('Resposta do servidor:', response.status, response.data);

      // Aceitar status 200 ou 201 como sucesso
      if (response.data && response.data.success) {
        toast({
          title: 'Registro realizado com sucesso',
          description: 'Você pode fazer login agora.',
          variant: 'default',
        });
        setActiveTab('login');
        // Preencher automaticamente o email no formulário de login
        loginForm.setValue('email', values.email);
      } else {
        console.error('Resposta sem success=true:', response.data);
        throw new Error('Resposta do servidor não indicou sucesso');
      }
    } catch (error: any) {
      console.error('Erro ao registrar:', error);
      let errorMessage = 'Não foi possível criar sua conta. Por favor, tente novamente mais tarde.';
      
      // Tentar extrair mensagem de erro mais específica
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: 'Erro ao registrar',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Portal do Paciente
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Acesse seu tratamento e histórico médico
          </p>
          {organization && (
            <div className="mt-4 flex flex-col items-center space-y-2">
              {organization.logo && (
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-green-500 shadow-md">
                  <img 
                    src={organization.logo} 
                    alt={`Logo ${organization.name}`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Se a imagem não carregar, exibir as iniciais
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const initialsDiv = document.createElement('div');
                        initialsDiv.className = 'w-full h-full flex items-center justify-center bg-green-100 text-green-800 text-xl font-bold';
                        initialsDiv.textContent = organization.name.split(' ').map(word => word[0]).join('');
                        parent.appendChild(initialsDiv);
                      }
                    }}
                  />
                </div>
              )}
              <div className="p-2 rounded-md bg-green-50 dark:bg-green-900 w-full">
                <p className="text-md font-medium text-green-800 dark:text-green-300">
                  {organization.name}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {organization.type}
                </p>
              </div>
            </div>
          )}
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">
              {organization ? `Portal do Paciente - ${organization.name}` : 'Portal do Paciente'}
            </CardTitle>
            <CardDescription>
              {organization ? `Acesse informações específicas do seu tratamento em ${organization.name}` : 'Acesse informações sobre seu tratamento e histórico médico'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue="login" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Criar Conta</TabsTrigger>
              </TabsList>
              
              {/* Formulário de Login */}
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="seu@email.com" 
                              type="email"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="••••••••" 
                              type="password" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-center justify-between">
                      <FormField
                        control={loginForm.control}
                        name="remember"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Lembrar-me</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <Button variant="link" className="p-0 h-auto font-normal">
                        Esqueceu a senha?
                      </Button>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Entrando...' : 'Entrar'}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              {/* Formulário de Registro */}
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Maria Oliveira" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="seu@email.com" 
                              type="email"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="••••••••" 
                              type="password" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="terms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Concordo com os{' '}
                              <Button variant="link" className="p-0 h-auto font-normal">
                                termos e condições
                              </Button>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Criando conta...' : 'Criar conta'}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-center w-full text-gray-500">
              Ao acessar, você concorda com nossos termos de serviço e política de privacidade.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default PatientLogin;