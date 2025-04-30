import { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'org_admin' | 'association_admin' | 'company_admin' | 'doctor' | 'dentist' | 'vet' | 'patient' | 'pharmacist' | 'laboratory' | 'researcher';
  name: string;
  email: string;
  organizationId: number | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userRole: string | null;
  login: (username: string, password: string, userType?: 'admin' | 'org_admin' | 'association_admin' | 'company_admin' | 'doctor' | 'dentist' | 'vet' | 'patient' | 'pharmacist' | 'laboratory' | 'researcher', orgCode?: string) => Promise<void>;
  logout: () => void;
  checkAuthentication?: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated on mount
  useEffect(() => {
    let isMounted = true;
    
    const checkAuthStatus = async () => {
      try {
        console.log("Verificando status de autenticação...");
        
        // Tentar apenas 1 vez para evitar rate limiting
        let attempts = 0;
        const maxAttempts = 1;
        
        while (attempts < maxAttempts) {
          attempts++;
          console.log(`Tentativa ${attempts}/${maxAttempts} de verificar autenticação`);
          
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout
            
            const response = await fetch('/api/auth/me', {
              credentials: 'include', // Incluir cookies na requisição
              headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              },
              cache: 'no-cache', // Prevent browser caching
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            // Verificar se a resposta contém HTML (possível redirecionamento)
            const contentType = response.headers.get('content-type');
            const isHtmlResponse = contentType && contentType.includes('text/html');
            
            if (isHtmlResponse) {
              console.warn("Recebida resposta HTML ao invés de JSON. Possível redirecionamento ou erro de sessão");
              
              if (response.status === 429) {
                // Rate limiting, aguardar e tentar novamente
                console.log("Rate limiting detectado (429). Aguardando para nova tentativa...");
                if (attempts < maxAttempts) {
                  // Esperar tempo progressivo entre tentativas: 2s, 4s, 8s...
                  await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
                  continue;
                }
              }
            }
            
            if (response.ok) {
              const userData = await response.json();
              console.log("Usuário autenticado:", userData);
              if (isMounted) setUser(userData);
              break; // Sair do loop em caso de sucesso
            } else {
              console.log("Usuário não autenticado. Status:", response.status);
              
              if (response.status === 429) {
                // Rate limiting, aguardar e tentar novamente
                console.log("Rate limiting detectado (429). Aguardando para nova tentativa...");
                if (attempts < maxAttempts) {
                  // Esperar tempo progressivo entre tentativas
                  await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
                  continue;
                }
              }
              
              let errorText = '';
              try {
                errorText = await response.text();
              } catch (e) {
                errorText = 'Não foi possível obter detalhes do erro';
              }
              console.log("Erro de autenticação:", errorText);
              break; // Sair do loop se o erro não for 429
            }
          } catch (innerError: any) {
            if (innerError.name === 'AbortError') {
              console.error('Requisição abortada por timeout');
              if (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
                continue;
              }
            } else if (attempts < maxAttempts) {
              console.warn(`Erro na tentativa ${attempts}, tentando novamente...`, innerError);
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
              continue;
            }
            
            console.error(`Todas as ${maxAttempts} tentativas falharam`, innerError);
            throw innerError;
          }
        }
      } catch (error) {
        console.error('Failed to check authentication status', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    checkAuthStatus();
    
    // Cleanup para evitar memory leaks
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (username: string, password: string, userType?: 'admin' | 'org_admin' | 'association_admin' | 'company_admin' | 'doctor' | 'dentist' | 'vet' | 'patient' | 'pharmacist' | 'laboratory' | 'researcher', orgCode?: string) => {
    setIsLoading(true);
    try {
      // Construir o corpo da requisição com base nos parâmetros disponíveis
      let requestBody: any = { password };
      
      // Verificar se a entrada parece um email
      const isEmail = username.includes('@');
      
      // Verificar se estamos tentando login em uma empresa importadora
      const isImportCompany = localStorage.getItem('userType') === 'import_company' || 
        document.documentElement.classList.contains('importadora-theme') ||
        username.toLowerCase().includes('importadora');

      if (isImportCompany) {
        console.log("Detectado tentativa de login como importadora");
        // Definir flag diretamente para redirecionamento imediato
        localStorage.setItem('userType', 'import_company');
        // Definindo direct_import_company evita a passagem pelo dashboard geral
        localStorage.setItem('direct_import_company', 'true');
      }
      
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
      
      // Implementar um mecanismo de timeout para a requisição
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos de timeout
      
      // Reduzir para apenas 1 tentativa para evitar rate limiting
      let attempts = 0;
      const maxAttempts = 1;
      
      while (attempts < maxAttempts) {
        attempts++;
        console.log(`Tentativa de login ${attempts}/${maxAttempts}`);
        
        try {
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
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          // Verificar se a resposta contém HTML (possível redirecionamento)
          const contentType = response.headers.get('content-type');
          const isHtmlResponse = contentType && contentType.includes('text/html');
          
          if (isHtmlResponse) {
            console.warn("Recebida resposta HTML ao invés de JSON. Possível redirecionamento ou erro de sessão");
            
            if (response.status === 429) {
              // Rate limiting, aguardar e tentar novamente
              console.log("Rate limiting detectado (429). Aguardando para nova tentativa...");
              if (attempts < maxAttempts) {
                // Esperar tempo progressivo entre tentativas: 2s, 4s, 8s...
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
                continue;
              } else {
                throw new Error("Muitas requisições. Por favor, aguarde alguns instantes e tente novamente.");
              }
            }
            
            if (response.status === 401 || response.status === 403) {
              throw new Error("Credenciais inválidas. Verifique seu e-mail e senha.");
            }
            
            throw new Error(`Resposta inesperada do servidor (${response.status})`);
          }
          
          if (!response.ok) {
            // Tenta obter mensagem de erro do JSON
            let errorMessage = `Erro ${response.status}: ${response.statusText}`;
            try {
              const errorData = await response.json();
              if (errorData.message) {
                errorMessage = errorData.message;
              } else if (errorData.error) {
                errorMessage = typeof errorData.error === 'string' 
                  ? errorData.error 
                  : errorData.error.message || errorMessage;
              }
            } catch {
              // Não conseguiu parsear JSON, tenta obter texto simples
              try {
                const errorText = await response.text();
                if (errorText && errorText.length < 200) { // Se for um texto curto
                  errorMessage = errorText;
                }
              } catch {
                // Ignora se não conseguir obter texto
              }
            }
            
            // Tratamento específico para rate limiting
            if (response.status === 429) {
              console.log("Rate limiting detectado (429). Aguardando para nova tentativa...");
              if (attempts < maxAttempts) {
                // Esperar tempo progressivo entre tentativas
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
                continue;
              } else {
                throw new Error("Muitas requisições. Por favor, aguarde alguns instantes e tente novamente.");
              }
            }
            
            throw new Error(errorMessage);
          }

          // Processa a resposta bem-sucedida
          const userData = await response.json();
          console.log("Login bem-sucedido. Dados do usuário:", userData);
          
          // Definir o estado do usuário
          setUser(userData);
          
          // Adicionar um cookie local para ajudar a manter o estado após o redirecionamento
          document.cookie = `auth_redirect=true; path=/; max-age=60; SameSite=Lax`;
          
          // Vamos dar um tempo curto para o estado ser atualizado e o cookie ser definido
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Redirecionar com base no papel do usuário
          // Usando window.location.href para redirecionamento mais confiável
          console.log(`Login bem-sucedido como ${userData.role}, preparando redirecionamento...`);
          
          // Retorna sem redirecionamento para permitir que a página de login faça isso
          return;
          
        } catch (fetchError: any) {
          if (fetchError.name === 'AbortError') {
            console.error('Requisição de login abortada por timeout');
            throw new Error('Tempo limite de conexão excedido. Verifique sua conexão com a internet.');
          }
          
          if (attempts >= maxAttempts) {
            console.error(`Todas as ${maxAttempts} tentativas de login falharam:`, fetchError);
            throw fetchError;
          } else {
            console.warn(`Tentativa ${attempts} falhou, tentando novamente...`, fetchError);
            // Aumentar o tempo de espera entre tentativas: 1s, 2s, 4s...
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts - 1) * 1000));
          }
        }
      }
      
      // Se chegou aqui, todas as tentativas falharam
      throw new Error('Falha ao realizar login após múltiplas tentativas');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log("Iniciando logout");
    
    // Primeiro, definir o usuário como null para atualizar a UI imediatamente
    setUser(null);
    
    // Redirecionar para a página de login de forma simples e direta
    window.location.href = '/login';
    
    // Fazer a chamada para logout no servidor após o redirecionamento já ter iniciado
    // pois não precisamos esperar a resposta para fazer o redirecionamento
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      credentials: 'include', // Importante para acessar e limpar cookies
      cache: 'no-cache'
    }).catch(error => {
      console.error('Logout error:', error);
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
    userRole: user?.role || null,
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