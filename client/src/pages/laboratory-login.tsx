import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FlaskConical, Info, Key, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function LaboratoryLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulação de login - em produção, seria uma chamada à API
      setTimeout(() => {
        // Redirecionar para o dashboard do laboratório após login bem-sucedido
        window.location.href = '/laboratory';
      }, 1500);

    } catch (error) {
      toast({
        title: 'Erro ao fazer login',
        description: 'Verifique suas credenciais e tente novamente.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para recuperação de senha
    toast({
      title: 'Email enviado',
      description: 'Instruções para redefinir sua senha foram enviadas para seu email.',
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Painel Esquerdo - Formulário de Login */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center mb-8">
            <FlaskConical className="h-10 w-10 text-blue-600 mr-2" />
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-blue-800">LabAnalytics</h2>
              <p className="text-sm text-gray-500">Portal de Laboratório de Análises</p>
            </div>
            <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-300">
              Beta
            </Badge>
          </div>

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="forgot">Esqueci a senha</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Acesso ao Portal</CardTitle>
                  <CardDescription>
                    Entre com suas credenciais para acessar o sistema de laboratório
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Email ou usuário</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="username"
                          placeholder="usuario@labanalytics.com.br"
                          className="pl-9"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Senha</Label>
                      </div>
                      <div className="relative">
                        <Key className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-9"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="remember" 
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <label
                        htmlFor="remember"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Lembrar de mim
                      </label>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Entrando...' : 'Entrar'}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex flex-col items-start">
                  <div className="text-sm text-gray-500">
                    Parte do ecossistema Endurancy
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="forgot">
              <Card>
                <CardHeader>
                  <CardTitle>Recuperação de Senha</CardTitle>
                  <CardDescription>
                    Informe seu email para receber instruções de recuperação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-recovery">Email</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="email-recovery"
                          type="email"
                          placeholder="usuario@labanalytics.com.br"
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>

                    <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Você receberá um email com um link para redefinir sua senha.
                      </AlertDescription>
                    </Alert>

                    <Button type="submit" className="w-full">
                      Recuperar senha
                    </Button>
                  </form>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="link" 
                    className="px-0" 
                    onClick={() => setActiveTab('login')}
                  >
                    Voltar para o login
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">
                  Precisa de ajuda?
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-4">
              <Button variant="outline" size="sm" className="text-xs">
                Suporte Técnico
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                Documentação
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Painel Direito - Imagem/Informações */}
      <div className="hidden lg:block relative w-0 flex-1 bg-gradient-to-br from-blue-500 to-blue-700">
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <div className="max-w-xl">
            <h2 className="text-4xl font-bold text-white mb-6">
              LabAnalytics Portal
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Plataforma completa para gestão e análise de laboratórios de pesquisa em canabinoides
            </p>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-white bg-opacity-10 text-blue-100">
                  <FlaskConical className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-medium text-white">Gestão de Análises</h3>
                  <p className="mt-1 text-blue-200">
                    Controle completo das análises de canabinoides, terpenos e contaminantes
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-white bg-opacity-10 text-blue-100">
                  <BarChart className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-medium text-white">Relatórios Avançados</h3>
                  <p className="mt-1 text-blue-200">
                    Geração de certificados e relatórios detalhados para seus clientes
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-white bg-opacity-10 text-blue-100">
                  <Brain className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-medium text-white">Assistência por IA</h3>
                  <p className="mt-1 text-blue-200">
                    Assistente de IA para análise de resultados e recomendações de qualidade
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 flex items-center">
              <div className="flex -space-x-2">
                <img
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                  src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.5&w=96&h=96&q=80"
                  alt=""
                />
                <img
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.5&w=96&h=96&q=80"
                  alt=""
                />
                <img
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.5&w=96&h=96&q=80"
                  alt=""
                />
              </div>
              <div className="ml-4 text-blue-100">
                <p className="text-base">Junte-se a mais de 30 laboratórios que já utilizam nossa plataforma</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Import do ícone que estava faltando
import { BarChart, Brain } from 'lucide-react';