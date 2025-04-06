import { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'org_admin' | 'doctor' | 'patient';
  name: string;
  email: string;
  organizationId: number | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, userType?: 'admin' | 'org_admin' | 'doctor' | 'patient', orgCode?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log("Verificando status de autenticação...");
        const response = await fetch('/api/auth/me', {
          credentials: 'include', // Incluir cookies na requisição
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          cache: 'no-cache' // Prevent browser caching
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log("Usuário autenticado:", userData);
          setUser(userData);
        } else {
          console.log("Usuário não autenticado. Status:", response.status);
          const errorText = await response.text();
          console.log("Erro de autenticação:", errorText);
        }
      } catch (error) {
        console.error('Failed to check authentication status', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string, userType?: 'admin' | 'org_admin' | 'doctor' | 'patient', orgCode?: string) => {
    setIsLoading(true);
    try {
      // Construir o corpo da requisição com base nos parâmetros disponíveis
      let requestBody: any = { username, password };
      
      // Adicionar tipo de usuário se disponível
      if (userType) {
        requestBody.userType = userType;
      }
      
      // Adicionar código da organização se disponível
      if (orgCode) {
        requestBody.orgCode = orgCode;
      }
      
      console.log("Tentando login com:", { username, userType, hasOrgCode: !!orgCode });
        
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'include', // Importante para salvar o cookie de sessão
        cache: 'no-cache', // Prevent caching
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Login falhou: ${response.status} - ${errorText}`);
        throw new Error('Login failed');
      }

      const userData = await response.json();
      console.log("Login bem-sucedido. Dados do usuário:", userData);
      setUser(userData);
      
      // Redirecionar com base no papel do usuário
      let redirectPath = '/dashboard';
      
      if (userData.role === 'admin') {
        redirectPath = '/dashboard';
        console.log("Redirecionando admin para o dashboard administrativo");
      } else if (userData.role === 'org_admin') {
        redirectPath = '/organization/dashboard';
        console.log("Redirecionando org_admin para o dashboard da organização");
      } else if (userData.role === 'doctor') {
        redirectPath = '/doctor/dashboard';
      } else if (userData.role === 'patient') {
        redirectPath = '/patient/dashboard';
      }
      
      console.log(`Login bem-sucedido como ${userData.role}, redirecionando para ${redirectPath}`);
      
      // Use window.history instead of wouter
      window.history.pushState({}, '', redirectPath);
      // Dispatch a custom event to notify about path change
      window.dispatchEvent(new Event('popstate'));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      console.log("Iniciando logout");
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'include', // Importante para acessar e limpar cookies
        cache: 'no-cache'
      });
      console.log("Logout completo no servidor");
      setUser(null);
      
      // Sempre redirecionar para a página de login após logout
      window.history.pushState({}, '', '/login');
      // Dispatch a custom event to notify about path change
      window.dispatchEvent(new Event('popstate'));
      // Recarregar a página para garantir um estado limpo
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}