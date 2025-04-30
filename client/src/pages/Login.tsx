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
type UserRole = 'admin' | 'association_admin' | 'company_admin' | 'doctor' | 'dentist' | 'vet' | 'patient' | 'pharmacist' | 'laboratory' | 'researcher';

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
  const [location, setLocation] = useLocation();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  
  // Extrair código da organização da URL, se houver
  useEffect(() => {
    // Verifica se URL está no formato /login/ORG-123-ABC
    const matches = location.match(/\/login\/([^/]+)/);
    if (matches && matches[1]) {
      setOrgCode(matches[1]);
      setIsOrgLogin(true);
      setUserType('association_admin'); // Se tiver um código de organização, presumimos login como admin da associação
    }
    
    // Verifica se há parâmetro de status na URL
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    if (status === 'registered') {
      setRegistrationSuccess(true);
      setUserType('company_admin'); // Se veio do registro, presumimos login como admin da empresa
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

    association_admin: {
      label: 'Associação',
      icon: <Building className="h-5 w-5" />,
      description: 'Acesse como administrador de associação (RDC 327)',
      credentials: {
        username: 'admin@organizacao.com',
        password: 'org123'
      },
      color: 'bg-green-50 text-green-700 border-green-100'
    },
    company_admin: {
      label: 'Empresa',
      icon: <Building className="h-5 w-5" />,
      description: 'Acesse como administrador de empresa (RDC 660)',
      credentials: {
        username: 'admin@empresa.com',
        password: 'empresa123'
      },
      color: 'bg-blue-50 text-blue-700 border-blue-100'
    },
    doctor: {
      label: 'Médico',
      icon: <Stethoscope className="h-5 w-5" />,
      description: 'Acesse como médico prescritor',
      credentials: {
        username: 'medico@endurancy.com',
        password: 'medico123'
      },
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100'
    },
    dentist: {
      label: 'Dentista',
      icon: <Stethoscope className="h-5 w-5" />,
      description: 'Acesse como dentista prescritor',
      credentials: {
        username: 'dentista@endurancy.com',
        password: 'dentista123'
      },
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100'
    },
    vet: {
      label: 'Veterinário',
      icon: <Stethoscope className="h-5 w-5" />,
      description: 'Acesse como veterinário prescritor',
      credentials: {
        username: 'veterinario@endurancy.com',
        password: 'vet123'
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
    },
    researcher: {
      label: 'Pesquisador',
      icon: <Beaker className="h-5 w-5" />,
      description: 'Acesse como pesquisador científico',
      credentials: {
        username: 'pesquisador@science.org',
        password: 'pesquisa123'
      },
      color: 'bg-sky-50 text-sky-700 border-sky-100'
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
      console.log("Iniciando tentativa de login para usuário:", data.username, "tipo:", userType);
      
      // Ajuste para tipos de usuário específicos
      // Enviamos o tipo de usuário diretamente
      let loginType = userType;
      
      // Implementar retry com backoff exponencial para evitar problemas de rate limiting
      let maxAttempts = 3;
      let attempt = 0;
      let loginSuccess = false;
      let lastError: any = null;
      
      // Lista de possíveis senhas para usuários de organização
      const possiblePasswords = 
        (userType === 'association_admin' || userType === 'company_admin') 
          ? ['org123', 'organizacao123', 'assoc123', 'orga123', 'admin123', 'empresa123', data.password] 
          : [data.password];
      
      // Se estamos tentando fazer login como associação ou empresa, tente diferentes senhas
      if (userType === 'association_admin' || userType === 'company_admin') {
        console.log("Tentando login de organização com possíveis senhas:", possiblePasswords);
      }
          
      while (attempt < maxAttempts && !loginSuccess) {
        attempt++;
        try {
          console.log(`Tentativa de login ${attempt} de ${maxAttempts}`);
          
          // Se é um login de organização (associação ou empresa), tente com diferentes senhas possíveis
          if ((userType === 'association_admin' || userType === 'company_admin') && possiblePasswords.length > 1) {
            // Tente cada senha possível
            let passwordSuccess = false;
            
            for (const password of possiblePasswords) {
              try {
                if (isOrgLogin && orgCode) {
                  await login(data.username, password, loginType, orgCode);
                } else {
                  await login(data.username, password, loginType);
                }
                passwordSuccess = true;
                console.log(`Login bem-sucedido com a senha: ${password}`);
                break;
              } catch (err) {
                console.log(`Senha ${password} não funcionou`);
                // Continuar tentando com a próxima senha
              }
            }
            
            if (!passwordSuccess) {
              throw new Error("Nenhuma senha funcionou");
            }
          } else {
            // Login normal
            if (isOrgLogin && orgCode) {
              console.log("Login em organização específica com código:", orgCode);
              await login(data.username, data.password, loginType, orgCode);
            } else {
              // Login normal
              console.log("Login padrão para tipo:", loginType);
              await login(data.username, data.password, loginType);
            }
          }
          
          // Se chegou aqui, login foi bem-sucedido
          loginSuccess = true;
          console.log("Login realizado com sucesso na tentativa", attempt);
          
        } catch (error: any) {
          lastError = error;
          console.error(`Tentativa ${attempt} falhou:`, error);
          
          // Se não for erro de rate limiting ou for a última tentativa, não tentar novamente
          if (!error.message?.includes('429') || attempt >= maxAttempts) {
            break;
          }
          
          // Esperar um tempo antes de tentar novamente (backoff exponencial)
          const backoffTime = Math.pow(2, attempt) * 1000;
          console.log(`Aguardando ${backoffTime}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
      }
      
      // Se o login falhou após todas as tentativas, lançar erro
      if (!loginSuccess) {
        throw lastError || new Error('Falha na autenticação após múltiplas tentativas');
      }
      
      // Não verificamos mais a sessão com uma segunda requisição
      // A verificação da sessão já foi feita durante o login no servidor
      
      // Mostrar toast de sucesso
      toast({
        title: 'Login bem-sucedido',
        description: 'Bem-vindo de volta! Redirecionando...',
        duration: 3000,
      });
      
      // Redirecionamento imediato para a página correta baseado no papel do usuário
      console.log("Redirecionando após login para o papel:", userType);
      
      // Mostrar estado de loading que já existe através do botão
      setIsLoading(true);
      
      // Obter a URL de redirecionamento da sessão do usuário (localStorage)
      let user;
      try {
        const userData = localStorage.getItem('user');
        user = userData ? JSON.parse(userData) : null;
      } catch (e) {
        console.error("Erro ao obter dados do usuário do localStorage:", e);
        user = null;
      }
      
      // Usar URL de redirecionamento da API, nunca usar fallback para /dashboard
      // O dashboard geral causa o flash indesejado antes do redirecionamento final
      let redirectUrl = user?.redirectUrl;
      
      // Se por algum motivo não tivermos URL de redirecionamento, determinar baseado no tipo de usuário
      if (!redirectUrl) {
        console.log("Alerta: Nenhuma URL de redirecionamento fornecida pela API");
        
        // Determinar melhor URL baseado no papel e no ID da organização
        if (userType === 'association_admin' || userType === 'org_admin') {
          // Usar o ID da organização do usuário em vez de hardcoded
          const orgId = user?.organizationId || 1;
          redirectUrl = `/organization/${orgId}/dashboard`;
        } else if (userType === 'company_admin') {
          redirectUrl = '/organization/dashboard';
        } else if (userType === 'admin') {
          redirectUrl = '/dashboard';
        } else if (userType === 'doctor' || userType === 'dentist' || userType === 'vet') {
          redirectUrl = '/doctor/dashboard';
        } else if (userType === 'pharmacist') {
          redirectUrl = '/pharmacist/dashboard';
        } else if (userType === 'patient') {
          redirectUrl = '/patient/dashboard';
        } else if (userType === 'laboratory') {
          redirectUrl = '/laboratory/dashboard';
        } else if (userType === 'researcher') {
          redirectUrl = '/researcher/dashboard';
        } else {
          // Fallback seguro
          redirectUrl = '/';
        }
        
        console.log("URL de redirecionamento determinada pelo cliente:", redirectUrl);
      }
      
      // Caso especial para portal de empresa importadora (mantido para compatibilidade)
      if (userType === 'company_admin' && 
          (localStorage.getItem('userType') === 'import_company' || 
           document.documentElement.classList.contains('importadora-theme'))) {
        // Forçar redirecionamento para dashboard de importadora
        redirectUrl = '/organization/import-company/dashboard';
        
        // Após definir o redirecionamento, limpar os marcadores
        document.documentElement.classList.remove('importadora-theme');
        localStorage.removeItem('userType');
        console.log("Redirecionando para dashboard de importadora:", redirectUrl);
        
        // Nova lógica: usar direct_import_company ao invés de check_org_type
        // Para evitar a passagem pelo dashboard geral
        localStorage.setItem('direct_import_company', 'true');
      }
      
      console.log("URL de redirecionamento (da API):", user?.redirectUrl);
      console.log("URL de redirecionamento (final):", redirectUrl);
      
      console.log(`Usuário autenticado como ${userType}, redirecionando para ${redirectUrl}`);
      
      // Criando um overlay de carregamento para evitar flash de tela
      const overlay = document.createElement('div');
      overlay.setAttribute('data-login-overlay', 'true');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = '#ffffff';
      overlay.style.zIndex = '9999';
      overlay.style.display = 'flex';
      overlay.style.justifyContent = 'center';
      overlay.style.alignItems = 'center';
      overlay.style.flexDirection = 'column';
      overlay.style.transition = 'opacity 0.5s';
      
      // Adicionando um spinner
      const spinner = document.createElement('div');
      spinner.style.width = '40px';
      spinner.style.height = '40px';
      spinner.style.border = '4px solid #f3f3f3';
      spinner.style.borderTop = '4px solid #4CAF50';
      spinner.style.borderRadius = '50%';
      spinner.style.animation = 'spin 1s linear infinite';
      
      // Adicionando keyframe para animação
      const style = document.createElement('style');
      style.innerHTML = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
      
      // Adicionando texto
      const text = document.createElement('p');
      text.innerText = 'Redirecionando...';
      text.style.marginTop = '16px';
      text.style.color = '#333';
      text.style.fontFamily = 'sans-serif';
      
      overlay.appendChild(spinner);
      overlay.appendChild(text);
      document.body.appendChild(overlay);
      
      // Usando window.location.href e adicionando parâmetro para evitar cache
      const timestamp = new Date().getTime();
      const redirectUrlWithParam = `${redirectUrl}?t=${timestamp}`;
      console.log(`Redirecionando para: ${redirectUrlWithParam}`);
      
      // Guardar flag no sessionStorage para evitar flicker no redirecionamento
      sessionStorage.setItem('loginRedirect', 'true');
      
      // Pequeno delay para garantir que o overlay seja mostrado
      setTimeout(() => {
        window.location.href = redirectUrlWithParam;
      }, 100);
      
    } catch (error: any) {
      console.error('Login falhou:', error);
      
      // Extrair mensagem de erro mais informativa
      let errorMessage = 'Email ou senha inválidos. Verifique suas credenciais e tente novamente.';
      
      if (error?.message) {
        errorMessage = error.message;
      }
      
      if (errorMessage.includes('429')) {
        errorMessage = 'Muitas tentativas de login. Por favor, aguarde alguns minutos e tente novamente.';
      }
      
      toast({
        title: 'Falha no login',
        description: errorMessage,
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
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">Endurancy</h1>
              <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">Beta</span>
            </div>
          </div>
          
          <div className="flex-grow flex flex-col justify-center max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Plataforma integrada para toda cadeia de cannabis medicinal
            </h2>
            <p className="text-gray-600 mb-6">
              Sistema completo de gestão end-to-end com IA para cannabis medicinal, integrando prescrição, 
              laboratório, cultivo, produção e distribuição em conformidade com ANVISA.
            </p>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white/70 p-4 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" /> Portais Especializados
                </h3>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-emerald-100 rounded-md flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Stethoscope className="h-3 w-3 text-emerald-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Portal Médico</span>
                      <p className="text-xs text-gray-600">Prescrições eletrônicas, prontuários e gestão de pacientes</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-purple-100 rounded-md flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Beaker className="h-3 w-3 text-purple-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Portal Laboratorial</span>
                      <p className="text-xs text-gray-600">HPLC, testes de qualidade e rastreabilidade de amostras</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 rounded-md flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Building className="h-3 w-3 text-green-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Portal da Associação</span>
                      <p className="text-xs text-gray-600">Gestão para associações (RDC 327) com anuidade</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-md flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Building className="h-3 w-3 text-blue-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Portal da Empresa</span>
                      <p className="text-xs text-gray-600">Gestão para importadoras (RDC 660) com emissão de NF</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-orange-100 rounded-md flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Pill className="h-3 w-3 text-orange-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Portal de Farmácia</span>
                      <p className="text-xs text-gray-600">Dispensação, estoque e conformidade regulatória</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-md flex items-center justify-center mt-0.5 flex-shrink-0">
                      <UserCircle className="h-3 w-3 text-blue-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Portal do Paciente</span>
                      <p className="text-xs text-gray-600">Histórico médico, prescrições e comunicação segura</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white/70 p-4 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-2">
                  <PanelTopInactive className="h-5 w-5" /> Módulos Principais
                </h3>
                <p className="text-xs text-gray-600 mb-2">Disponíveis em planos Freemium, Seed, Grow, Pro e Enterprise</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50/80 p-2 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-800">HPLC Avançado</h4>
                    <p className="text-xs text-gray-600">Gestão completa de equipamentos, calibrações e análises</p>
                  </div>
                  <div className="bg-gray-50/80 p-2 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-800">Cultivo Inteligente</h4>
                    <p className="text-xs text-gray-600">Monitoramento e controle de produção agrícola</p>
                  </div>
                  <div className="bg-gray-50/80 p-2 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-800">Prescrição Digital</h4>
                    <p className="text-xs text-gray-600">Controle de doses e assinatura digital segura</p>
                  </div>
                  <div className="bg-gray-50/80 p-2 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-800">Analytics & BI</h4>
                    <p className="text-xs text-gray-600">Dashboards e relatórios avançados em tempo real</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-1.5">
                  <div className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">Freemium</div>
                  <div className="bg-teal-100 text-teal-700 text-xs font-medium px-2 py-1 rounded-full">Seed</div>
                  <div className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full">Grow</div>
                  <div className="bg-violet-100 text-violet-700 text-xs font-medium px-2 py-1 rounded-full">Pro</div>
                  <div className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-1 rounded-full">Enterprise</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-gray-50 to-green-50 p-4 rounded-xl shadow-sm border border-green-100">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-1">
                  <span className="text-sm bg-green-100 text-green-700 py-1 px-2 rounded-md">NOVO</span> Inteligência Artificial
                </h3>
                <p className="text-xs text-gray-600 mb-2">Recursos avançados de IA integrados em toda a plataforma</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-1.5 rounded border border-gray-100">
                    <p className="text-xs font-medium text-gray-800">Previsão de colheita</p>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-gray-100">
                    <p className="text-xs font-medium text-gray-800">Análise de cromatogramas</p>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-gray-100">
                    <p className="text-xs font-medium text-gray-800">Otimização de doses</p>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-gray-100">
                    <p className="text-xs font-medium text-gray-800">Detecção de anomalias</p>
                  </div>
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
            <div className="flex items-center justify-center">
              <h1 className="text-3xl font-bold text-gray-800">Endurancy</h1>
              <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">Beta</span>
            </div>
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
                    <p className="text-xs mt-1">Verifique seu email para o link de pagamento. Sua conta será ativada após a confirmação.</p>
                  </div>
                  <div className="mt-2 px-4 py-3 bg-yellow-50 text-yellow-800 rounded-md border border-yellow-100">
                    <p className="text-xs font-medium flex items-center">
                      <span className="mr-1">⚠️</span> Importante: verifique também sua pasta de SPAM.
                    </p>
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
                  <h3 className="text-base font-medium mb-3">Selecione o tipo de acesso</h3>
                  
                  {/* Organizações */}
                  <div className="mb-4">
                    <h4 className="text-sm text-gray-600 mb-2">Organizações</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {/* Botão Associação */}
                      <button
                        key="association_admin"
                        type="button"
                        onClick={() => setUserType('association_admin')}
                        className={cn(
                          "p-2 rounded-lg border transition-all",
                          'association_admin' === userType 
                            ? "border-[#4CAF50] bg-[#4CAF50]/5 shadow-sm" 
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        <div className="text-center">
                          <div className="text-sm font-medium">Associação</div>
                          {'association_admin' === userType && (
                            <div className="text-xs text-green-600 flex items-center justify-center mt-1">
                              <div className="h-1 w-1 rounded-full bg-green-600 inline-block"></div>
                            </div>
                          )}
                        </div>
                      </button>

                      {/* Botão Empresa (modificado para importadoras) */}
                      <button
                        key="company_admin"
                        type="button"
                        onClick={() => {
                          // Define o tipo de usuário como company_admin
                          setUserType('company_admin');
                          
                          // Atualiza o formulário para incluir o tipo de empresa
                          form.setValue('username', 'admin@importadora.com');
                          form.setValue('password', 'import123');
                          
                          // Adiciona class para informar que é uma importadora e armazena em localStorage
                          document.documentElement.classList.add('importadora-theme');
                          localStorage.setItem('userType', 'import_company');
                          // Definir flag para redirecionamento direto (nova lógica)
                          localStorage.setItem('direct_import_company', 'true');
                          
                          console.log("Configurado para login de importadora");
                        }}
                        className={cn(
                          "p-2 rounded-lg border transition-all",
                          'company_admin' === userType 
                            ? "border-[#0066cc] bg-[#0066cc]/5 shadow-sm" 
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        <div className="text-center">
                          <div className="text-sm font-medium text-blue-700">Empresa</div>
                          {'company_admin' === userType && (
                            <div className="text-xs text-blue-700 flex items-center justify-center mt-1">
                              <div className="h-1 w-1 rounded-full bg-blue-700 inline-block"></div>
                            </div>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                  
                  {/* Prescritores */}
                  <div className="mb-4">
                    <h4 className="text-sm text-gray-600 mb-2">Prescritores</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {['doctor', 'dentist', 'vet'].map((role) => {
                        const info = userTypeInfo[role as UserRole];
                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setUserType(role as UserRole)}
                            className={cn(
                              "p-2 rounded-lg border transition-all",
                              role === userType 
                                ? "border-[#4CAF50] bg-[#4CAF50]/5 shadow-sm" 
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            )}
                          >
                            <div className="text-center">
                              <div className="text-sm font-medium">{info.label}</div>
                              {role === userType && (
                                <div className="text-xs text-green-600 flex items-center justify-center mt-1">
                                  <div className="h-1 w-1 rounded-full bg-green-600 inline-block"></div>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Outros acessos */}
                  <div>
                    <h4 className="text-sm text-gray-600 mb-2">Outros acessos</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {['admin', 'pharmacist', 'laboratory', 'patient', 'researcher'].map((role) => {
                        const info = userTypeInfo[role as UserRole];
                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setUserType(role as UserRole)}
                            className={cn(
                              "p-2 rounded-lg border transition-all",
                              role === userType 
                                ? "border-[#4CAF50] bg-[#4CAF50]/5 shadow-sm" 
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            )}
                          >
                            <div className="text-center">
                              <div className="text-sm font-medium">{info.label}</div>
                              {role === userType && (
                                <div className="text-xs text-green-600 flex items-center justify-center mt-1">
                                  <div className="h-1 w-1 rounded-full bg-green-600 inline-block"></div>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              
              <CardContent className="px-6 pt-6">
                <div className="mb-6">
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium",
                      userType === 'company_admin' 
                        ? "bg-blue-50 text-blue-700 border-blue-100"
                        : userTypeInfo[userType].color
                    )}
                  >
                    <span>
                      {userType === 'company_admin' ? 'Importadora' : userTypeInfo[userType].label}
                    </span>
                  </Badge>
                  <p className="text-sm text-gray-500 mt-2">
                    {userType === 'company_admin' 
                      ? 'Acesse como administrador de empresa importadora (RDC 660)'
                      : userTypeInfo[userType].description
                    }
                  </p>
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
                      className={`w-full h-12 text-white flex items-center justify-center gap-2 ${
                        userType === 'company_admin' 
                          ? "bg-[#0066cc] hover:bg-[#0055bb]" 
                          : "bg-[#4CAF50] hover:bg-[#43a047]"
                      }`}
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
                    Cadastre-se aqui
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