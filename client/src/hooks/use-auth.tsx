import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define o tipo de usuário
interface User {
  id: number;
  username: string;
  role: 'admin' | 'org_admin' | 'doctor' | 'patient' | 'manager' | 'employee';
  name: string;
  email: string;
  organizationId: number | null;
  profilePhoto?: string | null;
  phoneNumber?: string | null;
  bio?: string | null;
  lastPasswordChange?: Date | null;
  createdAt?: Date;
}

// Contexto de autenticação
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, userType?: 'admin' | 'org_admin' | 'doctor' | 'patient' | 'manager' | 'employee', orgCode?: string) => Promise<void>;
  logout: () => void;
}

// Cria o contexto
export const AuthContext = createContext<AuthContextType | null>(null);

// Provider do contexto
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Verifica se o usuário está autenticado ao carregar
  useEffect(() => {
    checkAuth();
  }, []);

  // Função para verificar autenticação do usuário
  const checkAuth = async () => {
    setIsLoading(true);
    let isMounted = true; // Flag para verificar se o componente ainda está montado
    
    try {
      console.log("Verificando autenticação...");
      
      // Implementar retry com backoff para contornar rate limiting
      const maxRetries = 3;
      let attempts = 0;
      let success = false;
      
      while (attempts < maxRetries && !success) {
        attempts++;
        
        try {
          console.log(`Tentando verificar autenticação (tentativa ${attempts}/${maxRetries})...`);
          
          const userData = await apiRequest('/api/auth/me', {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
          
          console.log("Autenticação verificada com sucesso:", userData);
          
          if (isMounted) {
            setUser(userData);
            // Guarda informação no localStorage para uso em componentes que não têm acesso ao contexto
            localStorage.setItem('user', JSON.stringify(userData));
          }
          
          success = true;
        } catch (error: any) {
          console.error(`Erro na tentativa ${attempts}:`, error);
          
          // Se for erro 429 (rate limiting), tentar novamente após um atraso
          if (error.message && error.message.includes('Muitas requisições')) {
            const delayMs = Math.pow(2, attempts) * 1000; // Backoff exponencial: 2s, 4s, 8s...
            console.log(`Rate limiting detectado, aguardando ${delayMs}ms antes da próxima tentativa...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
          } else {
            // Se não for rate limiting, não há necessidade de tentar novamente
            throw error;
          }
        }
      }
      
      if (!success) {
        console.error(`Todas as ${maxRetries} tentativas falharam`);
        throw new Error('Falha ao verificar autenticação após múltiplas tentativas');
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      
      if (isMounted) {
        setUser(null);
        localStorage.removeItem('user');
      }
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
    
    // Cleanup para evitar memory leaks
    return () => {
      isMounted = false;
    };
  };

  // Função de login
  const login = async (username: string, password: string, userType?: 'admin' | 'org_admin' | 'doctor' | 'patient' | 'manager' | 'employee', orgCode?: string) => {
    try {
      // Determina o endpoint com base no tipo de usuário
      const endpoint = userType === 'doctor' || userType === 'patient' 
        ? '/api/auth/org-login'
        : '/api/auth/login';
      
      const response = await apiRequest(endpoint, {
        method: 'POST',
        data: {
          username, 
          password,
          ...(userType && { userType: userType }),
          ...(orgCode && { orgCode })
        }
      });
      
      // Verifica se a resposta inclui a URL de redirecionamento
      const userData = response.redirectUrl 
        ? { ...response, redirectUrl: response.redirectUrl } 
        : response;
        
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast({
        title: 'Login realizado com sucesso',
        description: `Bem-vindo, ${userData.name || userData.username}!`,
      });
      
    } catch (error: any) {
      toast({
        title: 'Erro no login',
        description: error.message || 'Verifique suas credenciais e tente novamente.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Função de logout
  const logout = async () => {
    try {
      await apiRequest('/api/auth/logout', {
        method: 'POST'
      });
      setUser(null);
      localStorage.removeItem('user');
      
      toast({
        title: 'Logout realizado',
        description: 'Você foi desconectado com sucesso.',
      });
      
      // Redirecionar para a página de login
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro ao realizar logout:', error);
      toast({
        title: 'Erro ao sair',
        description: 'Não foi possível realizar o logout corretamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook para uso do contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}