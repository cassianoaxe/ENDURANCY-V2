import React from 'react';
import { Button } from "@/components/ui/button";
import { EcosystemLogo } from "@/components/ecosystem-logo";
import { EcosystemGraph } from "@/components/ecosystem-graph";
import { EcosystemGraphV2 } from "@/components/ecosystem-graph-v2";
import { 
  Leaf, ShieldCheck, Users, BookOpen, Pill, 
  ArrowRight, CheckCircle, Medal, Globe, 
  Building, Lock, HeartPulse, Info,
  Calendar, MapPin
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Navigation */}
      <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Leaf className="h-8 w-8 text-green-600" />
            <div className="ml-2 flex items-center">
              <span className="text-xl font-bold text-green-800">Endurancy</span>
              <span className="ml-1.5 px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">Beta</span>
            </div>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#plataforma" className="text-green-700 hover:text-green-500 font-medium">Plataforma</a>
            <a href="#modulos" className="text-green-700 hover:text-green-500 font-medium">Módulos</a>
            <a href="#recursos" className="text-green-700 hover:text-green-500 font-medium">Recursos</a>
            <a href="#precos" className="text-green-700 hover:text-green-500 font-medium">Preços</a>
            <a href="/roadmap" className="text-green-700 hover:text-green-500 font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Roadmap</span>
            </a>
          </nav>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              className="border-green-600 text-green-600 hover:bg-green-50"
              onClick={() => window.location.href = "/login"}
            >
              Entrar
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => window.location.href = "/organization-registration"}
            >
              Cadastre-se
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-green-800 leading-tight mb-4">
                Gestão Completa para o Setor Medicinal Cannabidiol
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Plataforma integrada para médicos, farmacêuticos e pacientes com foco na gestão financeira e conformidade regulatória.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white py-6 px-8 text-lg"
                  onClick={() => window.location.href = "/organization-registration"}
                >
                  Comece Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  className="border-green-600 text-green-600 hover:bg-green-50 py-6 px-8 text-lg"
                  onClick={() => window.location.href = "/sitemap"}
                >
                  Explorar Recursos
                </Button>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-xl bg-white p-6 border border-green-100">
              <div className="flex flex-col items-center">
                <h3 className="text-xl font-semibold text-green-800 mb-2">Nosso Ecossistema Integrado</h3>
                <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
                  Uma plataforma completa que conecta todos os agentes do setor em um único sistema
                </p>
                <div className="w-full aspect-square max-w-xl mx-auto">
                  <EcosystemGraphV2 />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="plataforma" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-green-800 mb-4">Uma Plataforma Completa</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Solução integrada para toda a cadeia do setor medicinal cannabidiol, desde o cultivo até a dispensação ao paciente.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-green-50 p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-3">Portal do Paciente</h3>
              <p className="text-gray-600">
                Acesso a prescrições médicas, histórico de tratamentos e compra de produtos aprovados.
              </p>
            </div>
            
            <div className="bg-green-50 p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <HeartPulse className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-3">Portal do Médico</h3>
              <p className="text-gray-600">
                Gestão de pacientes, criação de prescrições e acompanhamento de tratamentos.
              </p>
            </div>
            
            <div className="bg-green-50 p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Pill className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-3">Portal da Farmácia</h3>
              <p className="text-gray-600">
                Aprovação de prescrições, gestão de estoque e vendas no balcão com controle financeiro.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modulos" className="py-20 px-4 bg-green-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-green-800 mb-4">Módulos Especializados</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Personalize sua experiência com nossos módulos integrados para atender às necessidades específicas do seu negócio.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
                <Leaf className="h-5 w-5 mr-2 text-green-600" />
                Módulo de Cultivo
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Controle de ciclos de crescimento</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Rastreabilidade de plantas</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Controle de nutrientes e fertilizantes</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Monitoramento de ambiente</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                Módulo Fiscal
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Emissão de notas fiscais</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Controle de impostos</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Relatórios financeiros</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Integração com impressoras fiscais</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
                <Building className="h-5 w-5 mr-2 text-green-600" />
                Módulo de Gestão
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Dashboard administrativo</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Controle de usuários e permissões</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Análise de desempenho</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Relatórios gerenciais</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
                <Globe className="h-5 w-5 mr-2 text-green-600" />
                Módulo de Vendas
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Gestão de pedidos online</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Controle de estoque</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Processamento de pagamentos</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Rastreamento de entregas</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="recursos" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-green-800 mb-4">Recursos Principais</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Nossa plataforma é projetada com recursos avançados para otimizar suas operações.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="border border-green-100 p-6 rounded-lg hover:shadow-md transition-shadow">
              <ShieldCheck className="h-10 w-10 text-green-600 mb-4" />
              <h3 className="text-xl font-medium text-green-800 mb-2">Conformidade Regulatória</h3>
              <p className="text-gray-600">
                Sistema em conformidade com as regulamentações da ANVISA para o setor de cannabis medicinal.
              </p>
            </div>
            
            <div className="border border-green-100 p-6 rounded-lg hover:shadow-md transition-shadow">
              <Lock className="h-10 w-10 text-green-600 mb-4" />
              <h3 className="text-xl font-medium text-green-800 mb-2">Segurança Avançada</h3>
              <p className="text-gray-600">
                Criptografia de dados e controle de acesso baseado em funções para proteger informações sensíveis.
              </p>
            </div>
            
            <div className="border border-green-100 p-6 rounded-lg hover:shadow-md transition-shadow">
              <Medal className="h-10 w-10 text-green-600 mb-4" />
              <h3 className="text-xl font-medium text-green-800 mb-2">Suporte Premium</h3>
              <p className="text-gray-600">
                Suporte técnico especializado e consultoria em processos para maximizar seus resultados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precos" className="py-20 px-4 bg-green-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-green-800 mb-4">Planos Flexíveis</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-3">
              Escolha o plano ideal para o tamanho e as necessidades do seu negócio.
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
              <span className="mr-2 font-medium">OFERTA BETA:</span> 
              <span>Acesso gratuito a todos os recursos por 1 ano</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6 mb-10">
            {/* Plano Grátis */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-dashed border-green-300">
              <div className="p-6 border-b border-green-100 bg-green-50/50">
                <h3 className="text-xl font-semibold text-green-800 mb-2">Grátis</h3>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-4xl font-bold text-green-700">R$0</span>
                  <span className="text-gray-500 mb-1">/mês</span>
                </div>
                <p className="text-gray-600">Experimente nossa plataforma.</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Módulos Base</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>1 usuário</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Módulo ComplyPay</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Suporte comunitário</span>
                  </li>
                </ul>
                <Button 
                  className="w-full mt-6 bg-green-600 hover:bg-green-700"
                  onClick={() => window.location.href = "/organization-registration"}
                >
                  Começar Agora
                </Button>
              </div>
            </div>
            
            {/* Plano Seed */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-green-100">
                <h3 className="text-xl font-semibold text-green-800 mb-2">Seed</h3>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-4xl font-bold text-green-700">R$499</span>
                  <span className="text-gray-500 mb-1">/mês</span>
                </div>
                <p className="text-gray-600">Para empresas em fase inicial.</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>2 módulos à sua escolha</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Até 3 usuários</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Módulo ComplyPay</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Suporte por email</span>
                  </li>
                </ul>
                <Button 
                  className="w-full mt-6 bg-green-600 hover:bg-green-700"
                  onClick={() => window.location.href = "/organization-registration"}
                >
                  Comece Grátis
                </Button>
              </div>
            </div>
            {/* Plano Grow */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden relative transform scale-105 z-10">
              <div className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold py-1 px-3 rounded-bl-lg">
                MAIS POPULAR
              </div>
              <div className="p-6 border-b border-green-100 bg-green-50">
                <h3 className="text-xl font-semibold text-green-800 mb-2">Grow</h3>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-4xl font-bold text-green-700">R$999</span>
                  <span className="text-gray-500 mb-1">/mês</span>
                </div>
                <p className="text-gray-600">Para empresas em crescimento.</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>5 módulos à sua escolha</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Até 10 usuários</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Módulo ComplyPay</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Suporte prioritário</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Relatórios avançados</span>
                  </li>
                </ul>
                <Button 
                  className="w-full mt-6 bg-green-600 hover:bg-green-700"
                  onClick={() => window.location.href = "/organization-registration"}
                >
                  Escolher Plano
                </Button>
              </div>
            </div>
            {/* Plano Enterprise */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-green-100">
                <h3 className="text-xl font-semibold text-green-800 mb-2">Enterprise</h3>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-4xl font-bold text-green-700">R$1999</span>
                  <span className="text-gray-500 mb-1">/mês</span>
                </div>
                <p className="text-gray-600">Para grandes operações.</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Todos os módulos incluídos</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Usuários ilimitados</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Módulo ComplyPay</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Suporte 24/7</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Personalização avançada</span>
                  </li>
                </ul>
                <Button 
                  className="w-full mt-6 bg-green-600 hover:bg-green-700"
                  onClick={() => window.location.href = "/organization-registration"}
                >
                  Contate Vendas
                </Button>
              </div>
            </div>
          </div>
          {/* Mensagem informativa sobre o período beta */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-blue-100">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Info className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Plataforma em fase Beta</h4>
                <p className="text-gray-600 mb-3">
                  Durante o período Beta, todos os usuários terão acesso gratuito a todos os recursos 
                  da plataforma por um período de 12 meses, independentemente do plano escolhido.
                </p>
                <p className="text-gray-600">
                  Após o período Beta, você poderá escolher o plano que melhor se adapta às suas necessidades, 
                  mantendo todas as funcionalidades e dados já existentes na plataforma.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-green-800 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Pronto para transformar seu negócio?</h2>
          <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
            Junte-se às empresas que estão otimizando seus processos e aumentando seus resultados com a plataforma Endurancy.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              className="bg-white text-green-800 hover:bg-green-100 py-6 px-8 text-lg"
              onClick={() => window.location.href = "/organization-registration"}
            >
              Começar Agora
            </Button>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-green-700 py-6 px-8 text-lg"
              onClick={() => window.location.href = "/login"}
            >
              Fazer Login
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-900 text-green-100 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Leaf className="h-6 w-6 text-green-300" />
                <div className="ml-2 flex items-center">
                  <span className="text-xl font-bold text-white">Endurancy</span>
                  <span className="ml-1.5 px-1.5 py-0.5 text-xs font-medium bg-white/20 text-white rounded">Beta</span>
                </div>
              </div>
              <p className="text-green-300 mb-4">
                Plataforma completa para o setor medicinal cannabidiol.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-4">Empresa</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-green-300 hover:text-white">Sobre nós</a></li>
                <li><a href="#" className="text-green-300 hover:text-white">Contato</a></li>
                <li><a href="#" className="text-green-300 hover:text-white">Carreiras</a></li>
                <li><a href="#" className="text-green-300 hover:text-white">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-4">Recursos</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-green-300 hover:text-white">Documentação</a></li>
                <li><a href="#" className="text-green-300 hover:text-white">Guias</a></li>
                <li><a href="#" className="text-green-300 hover:text-white">Webinars</a></li>
                <li><a href="#" className="text-green-300 hover:text-white">Tutoriais</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-green-300 hover:text-white">Termos de Serviço</a></li>
                <li><a href="#" className="text-green-300 hover:text-white">Política de Privacidade</a></li>
                <li><a href="#" className="text-green-300 hover:text-white">Política de Cookies</a></li>
                <li><a href="#" className="text-green-300 hover:text-white">Regulamentações</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-green-800 mt-12 pt-6 text-center text-green-400">
            <div className="mb-4 flex justify-center space-x-6">
              <a href="/roadmap" className="text-green-300 hover:text-white flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Roadmap 2025-2027</span>
              </a>
              <a href="/sitemap" className="text-green-300 hover:text-white flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>Mapa do Site</span>
              </a>
            </div>
            <p>&copy; {new Date().getFullYear()} Endurancy <span className="inline-block px-1 py-0.5 text-[0.6rem] font-medium bg-green-200 text-green-800 rounded">Beta</span>. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;