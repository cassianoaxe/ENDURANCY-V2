import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define o tipo de usuário
interface User {
  id: number;
  username: string;
  role: 'admin' | 'org_admin' | 'doctor' | 'patient';
  name: string;
  email: string;
  organizationId: number | null;
}

// Contexto de autenticação
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, userType?: 'admin' | 'org_admin' | 'doctor' | 'patient', orgCode?: string) => Promise<void>;
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
    try {
      const res = await apiRequest('GET', '/api/auth/me');
      
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        // Guarda informação no localStorage para uso em componentes que não têm acesso ao contexto
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setUser(null);
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  // Função de login
  const login = async (username: string, password: string, userType?: 'admin' | 'org_admin' | 'doctor' | 'patient', orgCode?: string) => {
    try {
      // Determina o endpoint com base no tipo de usuário
      const endpoint = userType === 'doctor' || userType === 'patient' 
        ? '/api/auth/org-login'
        : '/api/auth/login';
      
      const data = {
        username, 
        password,
        ...(userType && { role: userType }),
        ...(orgCode && { orgCode })
      };
      
      const res = await apiRequest('POST', endpoint, data);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Falha ao realizar login');
      }
      
      const userData = await res.json();
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
      await apiRequest('POST', '/api/auth/logout');
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