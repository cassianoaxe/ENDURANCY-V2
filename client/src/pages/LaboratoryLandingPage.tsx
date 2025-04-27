import React, { useState } from 'react';
import { useLocation, useNavigate } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle2, Flask, Microscope } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';

// Componente principal da página de destino do portal de laboratório
export default function LaboratoryLandingPage() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('login');
  
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Estados para formulário de login
  const [loginFormData, setLoginFormData] = useState({
    username: '',
    password: ''
  });
  
  // Estados para formulário de registro
  const [registerFormData, setRegisterFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    laboratoryName: '',
    contactEmail: '',
    contactPhone: '',
    licenseNumber: ''
  });
  
  // Manipulador de mudança para formulário de login
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setLoginError(null);
  };
  
  // Manipulador de mudança para formulário de registro
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setRegisterError(null);
  };
  
  // Manipulador de envio para formulário de login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    
    try {
      const response = await apiRequest('POST', '/api/auth/laboratory/login', loginFormData);
      
      if (response.ok) {
        // Login bem-sucedido, redirecionar para o dashboard do laboratório
        window.location.href = '/laboratory/dashboard';
      } else {
        const errorData = await response.json();
        setLoginError(errorData.message || 'Falha ao fazer login. Verifique suas credenciais.');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setLoginError('Erro de conexão. Por favor, tente novamente.');
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  // Manipulador de envio para formulário de registro
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    setRegisterError(null);
    setRegisterSuccess(null);
    
    // Validações básicas
    if (registerFormData.password !== registerFormData.confirmPassword) {
      setRegisterError('As senhas não coincidem.');
      setIsRegistering(false);
      return;
    }
    
    if (!registerFormData.laboratoryName.trim()) {
      setRegisterError('O nome do laboratório é obrigatório.');
      setIsRegistering(false);
      return;
    }
    
    try {
      const response = await apiRequest('POST', '/api/laboratory/register', {
        username: registerFormData.username,
        password: registerFormData.password,
        name: registerFormData.laboratoryName,
        email: registerFormData.contactEmail,
        phone: registerFormData.contactPhone,
        licenseNumber: registerFormData.licenseNumber
      });
      
      if (response.ok) {
        // Registro bem-sucedido
        setRegisterSuccess('Registro concluído com sucesso! Sua conta será revisada e ativada em breve.');
        // Limpar formulário
        setRegisterFormData({
          username: '',
          password: '',
          confirmPassword: '',
          laboratoryName: '',
          contactEmail: '',
          contactPhone: '',
          licenseNumber: ''
        });
        // Mudar para a aba de login após um pequeno atraso
        setTimeout(() => {
          setActiveTab('login');
        }, 3000);
      } else {
        const errorData = await response.json();
        setRegisterError(errorData.message || 'Falha ao criar conta. Verifique os dados e tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao registrar:', error);
      setRegisterError('Erro de conexão. Por favor, tente novamente.');
    } finally {
      setIsRegistering(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col">
      {/* Cabeçalho */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Flask className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Portal de Laboratório</h1>
              <p className="text-sm text-gray-500">powered by Dall Solutions</p>
            </div>
          </div>
          <div>
            <Button variant="ghost" onClick={() => window.location.href = '/'}>
              Voltar para Endurancy
            </Button>
          </div>
        </div>
      </header>
      
      {/* Conteúdo principal */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Seção de informações */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Plataforma Completa para Laboratórios de Análises
              </h2>
              <p className="text-lg text-gray-600">
                Gerencie amostras, equipamentos, testes e resultados com eficiência e precisão. 
                Uma solução completa para laboratórios de todos os portes.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Microscope className="h-5 w-5 mr-2 text-blue-500" />
                    Gestão de Amostras
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Controle completo do ciclo de vida das amostras, desde o recebimento até a emissão de resultados.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-blue-500" />
                    Resultados Detalhados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Registre resultados detalhados de canabinoides, terpenos e muito mais com análises completas.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Flask className="h-5 w-5 mr-2 text-blue-500" />
                    Equipamentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Controle a manutenção, calibração e validação de todos os equipamentos do laboratório.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-blue-500" />
                    Relatórios e Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Painéis analíticos e relatórios detalhados para acompanhar a performance do laboratório.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Exclusivo para a Dall Solutions</h3>
              <p className="text-gray-600">
                Esta plataforma foi desenvolvida para atender às necessidades específicas dos laboratórios de análise do Paraná,
                com foco na qualidade, rastreabilidade e conformidade regulatória.
              </p>
            </div>
          </div>
          
          {/* Seção de login/cadastro */}
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Cadastre-se</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card className="border-blue-200">
                  <CardHeader>
                    <CardTitle>Acesso ao Portal de Laboratório</CardTitle>
                    <CardDescription>
                      Entre com suas credenciais para acessar o painel do laboratório
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      {loginError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Erro</AlertTitle>
                          <AlertDescription>{loginError}</AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="username">Email ou Username</Label>
                        <Input 
                          id="username" 
                          name="username" 
                          type="text" 
                          required
                          value={loginFormData.username}
                          onChange={handleLoginChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="password">Senha</Label>
                          <a 
                            href="#" 
                            className="text-sm text-blue-600 hover:underline"
                            onClick={(e) => {
                              e.preventDefault();
                              alert('Entre em contato com o suporte para recuperar sua senha');
                            }}
                          >
                            Esqueceu a senha?
                          </a>
                        </div>
                        <Input 
                          id="password" 
                          name="password" 
                          type="password" 
                          required
                          value={loginFormData.password}
                          onChange={handleLoginChange}
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={isLoggingIn}
                      >
                        {isLoggingIn ? 'Entrando...' : 'Entrar'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card className="border-blue-200">
                  <CardHeader>
                    <CardTitle>Cadastre seu Laboratório</CardTitle>
                    <CardDescription>
                      Preencha os dados para solicitar acesso à plataforma
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                      {registerError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Erro</AlertTitle>
                          <AlertDescription>{registerError}</AlertDescription>
                        </Alert>
                      )}
                      
                      {registerSuccess && (
                        <Alert className="bg-green-50 border-green-200 text-green-800">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <AlertTitle>Sucesso</AlertTitle>
                          <AlertDescription>{registerSuccess}</AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="space-y-4">
                        <Separator className="my-2" />
                        <h3 className="text-md font-medium">Informações da Conta</h3>
                        
                        <div className="space-y-2">
                          <Label htmlFor="register-username">Email de Acesso</Label>
                          <Input 
                            id="register-username" 
                            name="username" 
                            type="email" 
                            required
                            value={registerFormData.username}
                            onChange={handleRegisterChange}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="register-password">Senha</Label>
                            <Input 
                              id="register-password" 
                              name="password" 
                              type="password" 
                              required
                              value={registerFormData.password}
                              onChange={handleRegisterChange}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirmar Senha</Label>
                            <Input 
                              id="confirm-password" 
                              name="confirmPassword" 
                              type="password" 
                              required
                              value={registerFormData.confirmPassword}
                              onChange={handleRegisterChange}
                            />
                          </div>
                        </div>
                        
                        <Separator className="my-2" />
                        <h3 className="text-md font-medium">Informações do Laboratório</h3>
                        
                        <div className="space-y-2">
                          <Label htmlFor="laboratory-name">Nome do Laboratório</Label>
                          <Input 
                            id="laboratory-name" 
                            name="laboratoryName" 
                            type="text" 
                            required
                            value={registerFormData.laboratoryName}
                            onChange={handleRegisterChange}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="contact-email">Email de Contato</Label>
                            <Input 
                              id="contact-email" 
                              name="contactEmail" 
                              type="email" 
                              value={registerFormData.contactEmail}
                              onChange={handleRegisterChange}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="contact-phone">Telefone de Contato</Label>
                            <Input 
                              id="contact-phone" 
                              name="contactPhone" 
                              type="tel" 
                              value={registerFormData.contactPhone}
                              onChange={handleRegisterChange}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="license-number">Número de Licença (opcional)</Label>
                          <Input 
                            id="license-number" 
                            name="licenseNumber" 
                            type="text" 
                            value={registerFormData.licenseNumber}
                            onChange={handleRegisterChange}
                          />
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
                        disabled={isRegistering}
                      >
                        {isRegistering ? 'Cadastrando...' : 'Solicitar Cadastro'}
                      </Button>
                    </form>
                  </CardContent>
                  <CardFooter className="flex justify-center text-sm text-gray-500">
                    Seu cadastro passará por análise antes da aprovação.
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      {/* Rodapé */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Flask className="h-5 w-5 text-blue-600" />
              <span className="text-gray-600 font-medium">Dall Solutions © {new Date().getFullYear()}</span>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-blue-600 text-sm">Termos de Uso</a>
              <a href="#" className="text-gray-500 hover:text-blue-600 text-sm">Política de Privacidade</a>
              <a href="#" className="text-gray-500 hover:text-blue-600 text-sm">Suporte</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}