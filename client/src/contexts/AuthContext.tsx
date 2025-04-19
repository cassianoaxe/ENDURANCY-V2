import { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'org_admin' | 'doctor' | 'patient' | 'pharmacist' | 'laboratory' | 'researcher';
  name: string;
  email: string;
  organizationId: number | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, userType?: 'admin' | 'org_admin' | 'doctor' | 'patient' | 'pharmacist' | 'laboratory' | 'researcher', orgCode?: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create context with default values
const defaultContextValue: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => { throw new Error('Not implemented'); },
  logout: async () => { throw new Error('Not implemented'); }
};

const AuthContext = createContext<AuthContextType>(defaultContextValue);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Verifica primeiro se há dados em localStorage para reduzir chamadas à API
        const cachedAuth = localStorage.getItem('auth_data');
        
        if (cachedAuth) {
          try {
            const authData = JSON.parse(cachedAuth);
            const cacheTime = authData.timestamp || 0;
            const currentTime = Date.now();
            const cacheAge = currentTime - cacheTime;
            
            // Cache válido por 2 minutos (120000 ms)
            if (cacheAge < 120000 && authData.user) {
              console.log("Usando dados de autenticação em cache");
              setUser(authData.user);
              setIsLoading(false);
              return;
            }
          } catch (e) {
            // Se houver erro ao ler o cache, ignora e continua com a requisição
            console.log("Erro ao ler cache, fazendo requisição");
            localStorage.removeItem('auth_data');
          }
        }
        
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
          
          // Armazena os dados em cache com timestamp
          localStorage.setItem('auth_data', JSON.stringify({
            user: userData,
            timestamp: Date.now()
          }));
        } else {
          console.log("Usuário não autenticado. Status:", response.status);
          const errorText = await response.text();
          console.log("Erro de autenticação:", errorText);
          localStorage.removeItem('auth_data');
        }
      } catch (error) {
        console.error('Failed to check authentication status', error);
        localStorage.removeItem('auth_data');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string, userType?: 'admin' | 'org_admin' | 'doctor' | 'patient' | 'pharmacist' | 'laboratory' | 'researcher', orgCode?: string) => {
    setIsLoading(true);
    try {
      // Construir o corpo da requisição com base nos parâmetros disponíveis
      let requestBody: any = { password };
      
      // Verificar se a entrada parece um email
      const isEmail = username.includes('@');
      
      // Se parece um email, enviar como 'email', caso contrário como 'username'
      if (isEmail) {
        requestBody.email = username;
      } else {
        requestBody.username = username;
      }
      
      // Adicionar tipo de usuário se disponível
      if (userType) {
        requestBody.userType = userType;
      }
      
      // Adicionar código da organização se disponível
      if (orgCode) {
        requestBody.orgCode = orgCode;
      }
      
      console.log("Tentando login com:", { 
        ...(isEmail ? { email: username } : { username }),
        userType, 
        hasOrgCode: !!orgCode 
      });
        
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
      
      // Armazenar dados no cache
      localStorage.setItem('auth_data', JSON.stringify({
        user: userData,
        timestamp: Date.now()
      }));
      
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
      } else if (userData.role === 'pharmacist') {
        redirectPath = '/pharmacist/dashboard';
      } else if (userData.role === 'laboratory') {
        redirectPath = '/laboratory/dashboard';
        console.log("Redirecionando laboratório para o dashboard do laboratório");
      } else if (userData.role === 'researcher') {
        redirectPath = '/researcher/dashboard';
        console.log("Redirecionando pesquisador para o dashboard do pesquisador");
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
      // Limpar o cache de autenticação
      localStorage.removeItem('auth_data');
      
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

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}