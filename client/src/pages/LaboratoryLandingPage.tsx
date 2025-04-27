import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { FlaskConical, ArrowRight, CheckCircle2, LogIn, Search, BarChart, Eye, Lock, Shield, LineChart, Beaker, Building2 } from 'lucide-react';

export default function LaboratoryLandingPage() {
  const [activeTab, setActiveTab] = useState<string>('login');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [registerPassword, setRegisterPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [labName, setLabName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest({
        method: 'POST',
        url: '/api/auth/laboratory/login',
        data: { username, password }
      });

      if (response.ok) {
        window.location.href = '/laboratory/dashboard';
      } else {
        const errorData = await response.json();
        toast({
          title: 'Erro de autenticação',
          description: errorData.message || 'Credenciais inválidas. Por favor, tente novamente.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao tentar fazer login. Por favor, tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerPassword !== confirmPassword) {
      toast({
        title: 'Erro de validação',
        description: 'As senhas não coincidem. Por favor, verifique e tente novamente.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRequest({
        method: 'POST',
        url: '/api/auth/laboratory/register',
        data: { 
          username, 
          password: registerPassword, 
          email,
          labName
        }
      });

      if (response.ok) {
        toast({
          title: 'Cadastro realizado com sucesso!',
          description: 'Seu laboratório foi cadastrado. Agora você pode fazer login.',
          variant: 'default',
        });
        
        // Limpar campos de registro e mudar para a aba de login
        setEmail('');
        setRegisterPassword('');
        setConfirmPassword('');
        setLabName('');
        setActiveTab('login');
      } else {
        const errorData = await response.json();
        toast({
          title: 'Erro no cadastro',
          description: errorData.message || 'Não foi possível completar o cadastro. Por favor, tente novamente.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao registrar:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao tentar realizar o cadastro. Por favor, tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FlaskConical className="h-8 w-8" />
            <span className="text-2xl font-bold">LabAnalytics Portal</span>
          </div>
          <div className="hidden md:flex space-x-4">
            <a href="#features" className="hover:text-blue-200 transition-colors">Recursos</a>
            <a href="#customers" className="hover:text-blue-200 transition-colors">Clientes</a>
            <a href="#pricing" className="hover:text-blue-200 transition-colors">Planos</a>
            <a href="#about" className="hover:text-blue-200 transition-colors">Sobre</a>
            <Button 
              variant="outline" 
              className="bg-white text-blue-600 hover:bg-blue-100"
              onClick={() => window.scrollTo({top: document.querySelector('#auth-section')?.getBoundingClientRect().top, behavior: 'smooth'})}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Acessar
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
              Simplifique a gestão do seu laboratório
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Plataforma completa para laboratórios de análises, trazendo eficiência para cada etapa do seu fluxo de trabalho.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button 
                className="bg-white text-blue-600 hover:bg-blue-50"
                size="lg"
                onClick={() => window.scrollTo({top: document.querySelector('#auth-section')?.getBoundingClientRect().top, behavior: 'smooth'})}
              >
                Comece agora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-blue-700"
                size="lg"
                onClick={() => window.scrollTo({top: document.querySelector('#features')?.getBoundingClientRect().top, behavior: 'smooth'})}
              >
                Conheça os recursos
              </Button>
            </div>
            <div className="mt-10 flex items-center text-sm">
              <CheckCircle2 className="h-5 w-5 text-blue-300 mr-2" />
              <span>Usado por <span className="font-bold">especialistas em análises de canabinóides</span></span>
            </div>
          </div>
          <div className="lg:w-1/2 flex justify-center">
            <img 
              src="/dashboard-image.png"
              alt="Dashboard do LabAnalytics"
              className="max-w-full h-auto rounded-lg shadow-2xl border-4 border-white border-opacity-20"
            />
          </div>
        </div>
      </section>

      {/* Featured Client Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="text-blue-600 font-semibold">DESTAQUE</span>
            <h2 className="text-3xl font-bold mt-2 mb-4">Conheça nosso primeiro cliente</h2>
            <p className="text-gray-600">
              A Dall Solutions é a primeira organização a utilizar o LabAnalytics Portal, trazendo eficiência e qualidade para suas análises de canabinóides.
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-8 flex flex-col md:flex-row items-center">
            <div className="mb-6 md:mb-0 md:mr-10 flex-shrink-0">
              <div className="bg-white p-4 rounded-full shadow-md">
                <Building2 className="h-24 w-24 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-blue-800 mb-3">Dall Solutions</h3>
              <p className="text-gray-700 mb-4">
                Líder em análises laboratoriais no Paraná, a Dall Solutions foi a primeira empresa a adotar nossa plataforma, modernizando seus processos de análise e aumentando significativamente a produtividade do laboratório.
              </p>
              <div className="flex items-center text-blue-600 font-medium mt-4">
                <span className="mr-5">Paraná, Brasil</span>
                <span className="mr-5">•</span>
                <span>Especialistas em análises de canabinóides</span>
              </div>
              <div className="mt-6">
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mr-2">
                  Análises de CBD
                </span>
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mr-2">
                  Testes de Terpenos
                </span>
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Controle de Qualidade
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold">RECURSOS</span>
            <h2 className="text-3xl font-bold mt-2 mb-4">Tudo que você precisa para seu laboratório</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nossa plataforma oferece ferramentas completas para a gestão eficiente do seu laboratório de análises, desde o recebimento de amostras até a emissão de relatórios.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Search className="h-10 w-10 text-blue-600 mb-3" />
                <CardTitle>Rastreamento de Amostras</CardTitle>
                <CardDescription>
                  Acompanhe o progresso de cada amostra recebida, desde a entrada até o relatório final.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    Códigos de barras e QR codes para amostras
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    Histórico completo de cada amostra
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    Alertas de amostras com prazo próximo
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart className="h-10 w-10 text-blue-600 mb-3" />
                <CardTitle>Análises Especializadas</CardTitle>
                <CardDescription>
                  Gerencie análises específicas para canabinóides com precisão e eficiência.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    Perfil de canabinóides detalhado
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    Análise de terpenos completa
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    Testes de contaminantes e metais pesados
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Eye className="h-10 w-10 text-blue-600 mb-3" />
                <CardTitle>Monitoramento de Equipamentos</CardTitle>
                <CardDescription>
                  Acompanhe o estado dos seus equipamentos e programe manutenções preventivas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    Calendário de manutenções e calibrações
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    Histórico de uso de cada equipamento
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    Alertas preditivos de falhas
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <LineChart className="h-10 w-10 text-blue-600 mb-3" />
                <CardTitle>Relatórios Personalizados</CardTitle>
                <CardDescription>
                  Crie relatórios detalhados para seus clientes com resultados precisos e claros.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    Templates personalizáveis
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    Gráficos interativos e comparativos
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    Exportação em PDF e Excel
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Lock className="h-10 w-10 text-blue-600 mb-3" />
                <CardTitle>Segurança e Conformidade</CardTitle>
                <CardDescription>
                  Garanta a segurança dos seus dados e a conformidade com regulamentações.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    Conformidade com GLP e ISO 17025
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    Controle de acesso granular
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    Auditoria completa de alterações
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-blue-600 mb-3" />
                <CardTitle>Gestão da Qualidade</CardTitle>
                <CardDescription>
                  Controle processos com ferramentas de gestão da qualidade integradas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    Procedimentos operacionais padrão (POPs)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    Desvios e ações corretivas
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    Validação de métodos analíticos
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold">PLANOS</span>
            <h2 className="text-3xl font-bold mt-2 mb-4">Escolha o plano ideal para seu laboratório</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nós temos planos para laboratórios de todos os tamanhos. Escolha a opção que melhor atende às suas necessidades.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
            <Card className="border-t-4 border-gray-200">
              <CardHeader>
                <CardTitle>Básico</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-bold">R$499</span>
                  <span className="text-gray-600">/mês</span>
                </div>
                <CardDescription>Para laboratórios pequenos</CardDescription>
              </CardHeader>
              <CardContent className="border-t border-gray-100 pt-6">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Até 100 amostras por mês</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>3 usuários incluídos</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Rastreamento de amostras</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Relatórios básicos</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Suporte por email</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Selecionar</Button>
              </CardFooter>
            </Card>

            <Card className="border-t-4 border-blue-600 shadow-lg relative">
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 rounded-bl-lg text-sm font-medium">
                Popular
              </div>
              <CardHeader>
                <CardTitle>Profissional</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-bold">R$999</span>
                  <span className="text-gray-600">/mês</span>
                </div>
                <CardDescription>Para laboratórios médios</CardDescription>
              </CardHeader>
              <CardContent className="border-t border-gray-100 pt-6">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Até 500 amostras por mês</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>10 usuários incluídos</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Todas as funcionalidades do plano Básico</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Controle de equipamentos</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Relatórios avançados</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Suporte telefônico 8/5</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Selecionar</Button>
              </CardFooter>
            </Card>

            <Card className="border-t-4 border-gray-200">
              <CardHeader>
                <CardTitle>Empresarial</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-bold">R$1999</span>
                  <span className="text-gray-600">/mês</span>
                </div>
                <CardDescription>Para laboratórios grandes</CardDescription>
              </CardHeader>
              <CardContent className="border-t border-gray-100 pt-6">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Amostras ilimitadas</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Usuários ilimitados</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Todas as funcionalidades do plano Profissional</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>API para integração com outros sistemas</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Recursos de IA para análise preditiva</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Suporte 24/7 com SLA garantido</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Selecionar</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Auth Section */}
      <section id="auth-section" className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
            <div className="bg-blue-600 p-8 md:p-12 rounded-lg text-white">
              <h2 className="text-3xl font-bold mb-6">Sua jornada começa aqui</h2>
              <p className="text-xl mb-8 text-blue-100">
                Junte-se às principais organizações que já transformaram a maneira como gerenciam seus laboratórios.
              </p>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-blue-500 p-2 rounded-full mr-4">
                    <Beaker className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Melhor Controle de Qualidade</h3>
                    <p className="text-blue-100">Reduza erros e aumente a precisão das suas análises com ferramentas especializadas.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-500 p-2 rounded-full mr-4">
                    <BarChart className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Aumente sua Produtividade</h3>
                    <p className="text-blue-100">Reduza o tempo gasto em tarefas administrativas e foque no que realmente importa.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-500 p-2 rounded-full mr-4">
                    <LineChart className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Dados Acessíveis</h3>
                    <p className="text-blue-100">Tome decisões fundamentadas com base em métricas de desempenho do seu laboratório.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Cadastro</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <div className="space-y-5 mt-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold">Acesse sua conta</h3>
                      <p className="text-gray-500 text-sm mt-1">Entre com suas credenciais para acessar o portal</p>
                    </div>
                    
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Usuário</Label>
                        <Input 
                          id="username" 
                          type="text" 
                          placeholder="Seu nome de usuário" 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="password">Senha</Label>
                          <a href="#" className="text-sm text-blue-600 hover:underline">Esqueceu a senha?</a>
                        </div>
                        <Input 
                          id="password" 
                          type="password" 
                          placeholder="Sua senha" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="remember" />
                        <label
                          htmlFor="remember"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Lembrar de mim
                        </label>
                      </div>
                      
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Entrando..." : "Entrar"}
                      </Button>
                    </form>
                  </div>
                </TabsContent>
                
                <TabsContent value="register">
                  <div className="space-y-5 mt-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold">Crie sua conta</h3>
                      <p className="text-gray-500 text-sm mt-1">Preencha os dados do seu laboratório</p>
                    </div>
                    
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="labName">Nome do Laboratório</Label>
                        <Input 
                          id="labName" 
                          type="text" 
                          placeholder="Nome do seu laboratório" 
                          value={labName}
                          onChange={(e) => setLabName(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="registerUsername">Nome de Usuário</Label>
                        <Input 
                          id="registerUsername" 
                          type="text" 
                          placeholder="Escolha um nome de usuário" 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="Seu email corporativo" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="registerPassword">Senha</Label>
                        <Input 
                          id="registerPassword" 
                          type="password" 
                          placeholder="Crie uma senha forte" 
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirme a Senha</Label>
                        <Input 
                          id="confirmPassword" 
                          type="password" 
                          placeholder="Confirme sua senha" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="terms" required />
                        <label
                          htmlFor="terms"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Concordo com os <a href="#" className="text-blue-600 hover:underline">Termos de Serviço</a> e <a href="#" className="text-blue-600 hover:underline">Política de Privacidade</a>
                        </label>
                      </div>
                      
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Criando conta..." : "Criar conta"}
                      </Button>
                    </form>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FlaskConical className="h-6 w-6" />
                <span className="text-xl font-bold">LabAnalytics Portal</span>
              </div>
              <p className="text-blue-300 mb-4">
                Plataforma completa para gestão de laboratórios de análises.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-blue-300 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
                  </svg>
                </a>
                <a href="#" className="text-blue-300 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.045 10.045 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.923 4.923 0 001.522 6.574 4.92 4.92 0 01-2.23-.618v.06a4.923 4.923 0 003.95 4.827 4.968 4.968 0 01-2.224.084 4.93 4.93 0 004.6 3.42A9.88 9.88 0 010 19.54a13.94 13.94 0 007.548 2.212c9.057 0 14.01-7.503 14.01-14.01 0-.214-.005-.428-.014-.639A10.007 10.007 0 0024 4.59z"></path>
                  </svg>
                </a>
                <a href="#" className="text-blue-300 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.98 0a6.9 6.9 0 0 1 5.08 1.98A6.94 6.94 0 0 1 24 7.02v9.96c0 2.08-.68 3.87-1.98 5.13A7.14 7.14 0 0 1 16.94 24H7.06a7.06 7.06 0 0 1-5.03-1.89A6.96 6.96 0 0 1 0 16.94V7.02C0 2.8 2.8 0 7.02 0h9.96zm.05 2.23H7.06c-1.45 0-2.7.43-3.53 1.25a4.82 4.82 0 0 0-1.3 3.54v9.92c0 1.5.43 2.7 1.3 3.58a5 5 0 0 0 3.53 1.25h9.88a5 5 0 0 0 3.53-1.25 4.73 4.73 0 0 0 1.4-3.54V7.02c0-1.45-.47-2.7-1.3-3.54a4.47 4.47 0 0 0-3.54-1.25zM12 5.76c3.39 0 6.2 2.8 6.2 6.2a6.2 6.2 0 0 1-12.4 0 6.2 6.2 0 0 1 6.2-6.2zm0 2.22a3.99 3.99 0 0 0-3.97 3.97A3.99 3.99 0 0 0 12 15.92a3.99 3.99 0 0 0 3.97-3.97A3.99 3.99 0 0 0 12 7.98zm6.44-3.77a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8z" />
                  </svg>
                </a>
                <a href="#" className="text-blue-300 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Recursos</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-blue-300 hover:text-white transition-colors">Rastreamento de Amostras</a></li>
                <li><a href="#" className="text-blue-300 hover:text-white transition-colors">Análises de Canabinóides</a></li>
                <li><a href="#" className="text-blue-300 hover:text-white transition-colors">Gestão de Equipamentos</a></li>
                <li><a href="#" className="text-blue-300 hover:text-white transition-colors">Relatórios Personalizados</a></li>
                <li><a href="#" className="text-blue-300 hover:text-white transition-colors">Segurança e Conformidade</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Empresa</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-blue-300 hover:text-white transition-colors">Sobre nós</a></li>
                <li><a href="#" className="text-blue-300 hover:text-white transition-colors">Equipe</a></li>
                <li><a href="#" className="text-blue-300 hover:text-white transition-colors">Carreiras</a></li>
                <li><a href="#" className="text-blue-300 hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="text-blue-300 hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Contato</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-blue-300">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M10 4a1 1 0 00-1 1v4.586l-2.707 2.707a1 1 0 101.414 1.414l3-3A1 1 0 0011 10V5a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Segunda a Sexta, 8h às 18h</span>
                </li>
                <li className="flex items-center text-blue-300">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>Rua das Análises, 123, Curitiba, PR</span>
                </li>
                <li className="flex items-center text-blue-300">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span>contato@labanalytics.com.br</span>
                </li>
                <li className="flex items-center text-blue-300">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span>+55 (41) 3333-4444</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-blue-800 pt-8 mt-8 text-center text-blue-400 text-sm">
            <p>© 2025 LabAnalytics Portal. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}