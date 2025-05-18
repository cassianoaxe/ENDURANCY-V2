import { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'org_admin' | 'association_admin' | 'company_admin' | 'doctor' | 'dentist' | 'vet' | 'patient' | 'pharmacist' | 'laboratory' | 'researcher' | 'supplier';
  name: string;
  email: string;
  organizationId: number | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, userType?: 'admin' | 'org_admin' | 'association_admin' | 'company_admin' | 'doctor' | 'dentist' | 'vet' | 'patient' | 'pharmacist' | 'laboratory' | 'researcher' | 'supplier', orgCode?: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated on mount
  useEffect(() => {
    let isMounted = true;
    
    // Verificar no localStorage se já temos um cache recente da sessão 
    // para evitar chamadas API desnecessárias
    const cachedSession = localStorage.getItem('auth_session');
    const sessionTimestamp = localStorage.getItem('auth_session_time');
    const SESSION_MAX_AGE = 15 * 60 * 1000; // 15 minutos em ms
    
    const hasValidCache = cachedSession && sessionTimestamp && 
      (Date.now() - parseInt(sessionTimestamp)) < SESSION_MAX_AGE;
    
    const checkAuthStatus = async () => {
      try {
        // Se temos um cache válido da sessão, usamos para evitar uma chamada API
        if (hasValidCache) {
          try {
            const userData = JSON.parse(cachedSession);
            if (userData?.id) {
              if (isMounted) {
                console.log("Usando sessão em cache para evitar rate limiting");
                setUser(userData);
                setIsLoading(false);
                return;
              }
            }
          } catch (e) {
            console.warn("Erro ao parsear cache da sessão:", e);
            // Continua com a verificação normal se o cache for inválido
          }
        }
      
        console.log("Verificando status de autenticação...");
        
        // Uma única tentativa para evitar rate limiting
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos de timeout
          
          const response = await fetch('/api/auth/me', {
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-store'
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const userData = await response.json();
            console.log("Usuário autenticado:", userData);
            
            if (isMounted) {
              setUser(userData);
              
              // Salvar sessão no localStorage para evitar chamadas futuras
              localStorage.setItem('auth_session', JSON.stringify(userData));
              localStorage.setItem('auth_session_time', Date.now().toString());
            }
          } else {
            console.log("Usuário não autenticado. Status:", response.status);
            
            // Limpar cache da sessão se não estiver autenticado
            localStorage.removeItem('auth_session');
            localStorage.removeItem('auth_session_time');
          }
        } catch (error: any) {
          console.error('Erro ao verificar autenticação:', error);
          
          // Se o erro foi timeout e temos um cache, usamos o cache mesmo expirado
          if (error.name === 'AbortError' && cachedSession) {
            try {
              console.warn("Usando cache expirado devido a timeout na verificação");
              const userData = JSON.parse(cachedSession);
              if (userData?.id && isMounted) {
                setUser(userData);
              }
            } catch (e) {
              console.error("Erro ao usar cache de fallback:", e);
            }
          }
        }
      } catch (error) {
        console.error('Falha ao verificar autenticação:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    // Iniciar verificação com um pequeno atraso para permitir que
    // outras partes da aplicação inicializem primeiro
    const timerId = setTimeout(checkAuthStatus, 100);
    
    // Cleanup
    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, []);
  // Função de login simplificada
  const login = async (username: string, password: string, userType?: 'admin' | 'org_admin' | 'association_admin' | 'company_admin' | 'doctor' | 'dentist' | 'vet' | 'patient' | 'pharmacist' | 'laboratory' | 'researcher' | 'supplier', orgCode?: string) => {
    setIsLoading(true);
    try {
      // Preparar dados de login
      const isEmail = username.includes('@');
      const isImportCompany = localStorage.getItem('userType') === 'import_company' || 
        document.documentElement.classList.contains('importadora-theme') ||
        username.toLowerCase().includes('importadora');

      if (isImportCompany) {
        console.log("Iniciando login como importadora");
        localStorage.setItem('userType', 'import_company');
        localStorage.setItem('direct_import_company', 'true');
      }
      
      // Construir payload com dados mínimos necessários
      const requestBody = {
        password,
        ...(isEmail ? { email: username } : { username }),
        ...(userType ? { userType } : {}),
        ...(orgCode ? { orgCode } : {})
      };
      
      console.log(`Iniciando tentativa de login para usuário: ${username}, tipo: ${userType || 'admin'}`);
      
      // Usar AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          let errorMsg = `Erro ${response.status}: ${response.statusText}`;
          
          // Tentar extrair mensagem de erro mais detalhada
          if (response.headers.get('content-type')?.includes('application/json')) {
            const errorData = await response.json();
            errorMsg = errorData.message || errorData.error || errorMsg;
          }
          
          throw new Error(errorMsg);
        }

        // Login bem-sucedido
        const userData = await response.json();
        console.log("Login bem-sucedido. Dados do usuário:", userData);
        
        // Atualizar estado e cache local
        setUser(userData);
        localStorage.setItem('auth_session', JSON.stringify(userData));
        localStorage.setItem('auth_session_time', Date.now().toString());
        
        // Permitir tempo para o estado ser atualizado
        await new Promise(resolve => setTimeout(resolve, 50));
        
        return;
      } catch (fetchError: any) {
        if (fetchError.name === 'AbortError') {
          throw new Error('Tempo limite de conexão excedido. Verifique sua conexão.');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log("Iniciando logout");
    
    // Limpar dados de autenticação no localStorage
    localStorage.removeItem('auth_session');
    localStorage.removeItem('auth_session_time');
    
    // Atualizar estado imediatamente
    setUser(null);
    
    // Realizar logout no servidor
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    }).catch(error => {
      console.error('Erro no logout:', error);
    }).finally(() => {
      // Verificar papel do usuário para redirecionamento correto
      console.log("Redirecionando para /login");
      window.location.href = '/login';
    });
  };

  // Método para verificar se o usuário está autenticado (útil para testes e debugging)
  const checkAuthentication = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) return false;
      
      const userData = await response.json();
      return !!userData?.id;
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return false;
    }
  };
  
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuthentication
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