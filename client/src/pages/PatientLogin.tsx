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
  cpf: z.string().min(11, { message: 'CPF deve ter pelo menos 11 dígitos' }).max(14, { message: 'CPF inválido' }),
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
      cpf: '',
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
        
        console.log("Login bem-sucedido, redirecionando para dashboard...");
        
        // Forçar atualização da página para garantir que o estado de autenticação seja reconhecido
        setTimeout(() => {
          // Redirecionamento para o dashboard de pacientes usando /login que já está funcionando
          // Depois o sistema redirecionará para a página correta baseado no papel do usuário
          window.location.href = '/login';
        }, 500);
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
    console.log('==========================================================');
    console.log('[DEBUG] INÍCIO DO FLUXO DE REGISTRO - FRONTEND');
    console.log('==========================================================');
    
    setIsLoading(true);
    try {
      // Verificar parâmetros
      console.log('Valores do formulário:', values);
      console.log('ID da Organização:', organizationId);
      
      const requestData: any = {
        name: values.name,
        email: values.email,
        password: values.password,
        cpf: values.cpf,
      };
      
      // Incluir ID da organização se existir
      if (organizationId) {
        requestData.organizationId = organizationId;
        console.log('Adicionando organizationId ao request:', organizationId);
      } else {
        console.log('Nenhum organizationId fornecido');
      }
      
      console.log('Enviando solicitação de registro:', JSON.stringify(requestData));
      
      // Executa a requisição com catch específico para qualquer erro de rede
      let response;
      try {
        response = await axios.post('/api/auth/patient/register', requestData);
        console.log('Resposta do servidor (raw):', response);
        console.log('Resposta do servidor (status):', response.status);
        console.log('Resposta do servidor (data):', JSON.stringify(response.data));
      } catch (networkError: any) {
        console.error('ERRO DE REDE:', networkError);
        if (networkError.response) {
          console.error('Resposta de erro:', networkError.response.status, networkError.response.data);
        }
        throw networkError; // Re-lançar para ser capturado pelo catch externo
      }

      // Aceitar status 200 ou 201 como sucesso
      console.log('Verificando resposta do servidor:', response);
      console.log('Tipo de response.data:', typeof response.data);
      console.log('response.data completo:', response.data);
      console.log('response.data.success existe?', response.data && 'success' in response.data);
      console.log('response.data.success valor:', response.data && response.data.success);
      
      if (response && (response.status === 200 || response.status === 201)) {
        console.log('Registro bem-sucedido pelo status HTTP, tentando login automático');
        toast({
          title: 'Registro realizado com sucesso',
          description: 'Realizando login automático...',
          variant: 'default',
        });
        
        // Realizar login automático com os dados do registro
        try {
          // Prepara os dados de login
          const loginData = {
            email: values.email,
            password: values.password
          };
          
          if (organizationId) {
            // @ts-ignore
            loginData.organizationId = organizationId;
          }
          
          // Tenta fazer login automaticamente
          const loginResponse = await axios.post('/api/auth/patient/login', loginData);
          
          if (loginResponse.data.success) {
            console.log("Login automático bem-sucedido, redirecionando para dashboard...");
            
            // Forçar atualização da página para garantir que o estado de autenticação seja reconhecido
            setTimeout(() => {
              // Redirecionamento para o dashboard usando /login que já está funcionando
              // Depois o sistema redirecionará para a página correta baseado no papel do usuário
              window.location.href = '/login';
            }, 500);
          } else {
            // Se o login automático falhar, volta para a aba de login
            console.log("Login automático falhou, exibindo aba de login");
            setActiveTab('login');
            loginForm.setValue('email', values.email);
          }
        } catch (loginError) {
          console.error("Erro ao tentar realizar login automático:", loginError);
          // Em caso de erro, exibe a aba de login normal
          setActiveTab('login');
          // Preencher automaticamente o email no formulário de login
          loginForm.setValue('email', values.email);
        }
      } else {
        console.error('Resposta não indicou sucesso:', response?.data);
        throw new Error('Resposta do servidor não indicou sucesso');
      }
    } catch (error: any) {
      console.error('ERRO CAPTURADO NO CATCH PRINCIPAL:', error);
      let errorMessage = 'Não foi possível criar sua conta. Por favor, tente novamente mais tarde.';
      
      // Tentar extrair mensagem de erro mais específica
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
        console.log('Mensagem de erro extraída da resposta:', errorMessage);
      }
      
      toast({
        title: 'Erro ao registrar',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      console.log('Finalizando fluxo de registro (finally block)');
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
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="000.000.000-00" 
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
          <CardFooter className="flex flex-col space-y-2">
            <p className="text-xs text-center w-full text-gray-500">
              Ao acessar, você concorda com nossos termos de serviço e política de privacidade.
            </p>
            <div className="text-xs text-center text-gray-400 w-full">
              <a href="/sitemap" className="hover:text-gray-600 hover:underline">Sitemap</a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default PatientLogin;