import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FlaskConical, Microscope, ChevronRight, CheckCircle, Medal, 
  Beaker, BarChart3, ClipboardCheck, Users, Building, 
  List, Calendar, FileText, Settings, AlertTriangle,
  ScanLine, Database, BarChart2, Shield
} from 'lucide-react';
import { useLocation } from 'wouter';

// Interface para os recursos do sistema
interface FeatureItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Interface para os módulos do sistema
interface ModuleItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

// Interface para os planos de assinatura
interface PricingPlan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  isContact?: boolean;
}

// Componente para seção de recursos
const FeatureCard = ({ icon, title, description }: FeatureItem) => {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

// Componente para módulos do sistema
const ModuleCard = ({ 
  icon, 
  title, 
  description, 
  features,
  onClick
}: { 
  icon: React.ReactNode, 
  title: string, 
  description: string, 
  features: string[],
  onClick: () => void
}) => {
  return (
    <div className="p-6 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-all duration-300 h-full flex flex-col">
      <div className="flex items-start mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
          <div className="text-blue-600">{icon}</div>
        </div>
        <h3 className="text-xl font-bold text-blue-800">{title}</h3>
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      <ul className="space-y-2 mb-6 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckCircle className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button 
        className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white"
        onClick={onClick}
      >
        Saiba mais
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

// Componente para os planos de assinatura
const PricingCard = ({ plan, onSelectPlan }: { plan: PricingPlan, onSelectPlan: (plan: string) => void }) => {
  return (
    <div className={`p-6 rounded-xl border ${
      plan.highlighted 
        ? 'border-blue-300 bg-blue-50 shadow-lg' 
        : 'border-gray-200 bg-white'
    } h-full flex flex-col`}>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
      <div className="mb-4">
        {plan.isContact ? (
          <p className="text-2xl font-bold text-blue-600">Entre em contato</p>
        ) : (
          <p className="text-2xl font-bold text-blue-600">
            R$ {plan.price}<span className="text-sm text-gray-500 font-normal">/mês</span>
          </p>
        )}
      </div>
      <p className="text-gray-600 mb-6">{plan.description}</p>
      <ul className="space-y-3 mb-8 flex-grow">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckCircle className={`h-5 w-5 mr-2 ${
              plan.highlighted ? 'text-blue-600' : 'text-gray-500'
            } flex-shrink-0 mt-0.5`} />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <Button 
        className={`w-full ${
          plan.highlighted
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
        }`}
        onClick={() => onSelectPlan(plan.id)}
      >
        {plan.isContact ? 'Fale Conosco' : 'Adquirir Plano'}
      </Button>
    </div>
  );
};

export default function LaboratoryLandingPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');

  // Principais recursos do sistema
  const features: FeatureItem[] = [
    {
      title: "Gestão de Amostras",
      description: "Controle completo do fluxo de recebimento, processamento e análise de amostras.",
      icon: <Beaker className="h-6 w-6" />
    },
    {
      title: "Análises Avançadas",
      description: "Suporte para diversos tipos de análises com fluxos de trabalho personalizados.",
      icon: <Microscope className="h-6 w-6" />
    },
    {
      title: "Relatórios Detalhados",
      description: "Geração de laudos e relatórios customizáveis com a identidade visual do laboratório.",
      icon: <FileText className="h-6 w-6" />
    },
    {
      title: "Gestão de Equipamentos",
      description: "Controle de manutenção, calibração e validação de todos os equipamentos.",
      icon: <ScanLine className="h-6 w-6" />
    },
    {
      title: "Controle de Qualidade",
      description: "Ferramentas para monitoramento e garantia da qualidade em todos os processos.",
      icon: <ClipboardCheck className="h-6 w-6" />
    },
    {
      title: "Dashboards Analíticos",
      description: "Visualização em tempo real de métricas e indicadores de performance.",
      icon: <BarChart3 className="h-6 w-6" />
    },
    {
      title: "Gestão de Equipes",
      description: "Controle de acesso, atribuição de tarefas e monitoramento de produtividade.",
      icon: <Users className="h-6 w-6" />
    },
    {
      title: "Segurança e Compliance",
      description: "Conformidade com normas regulatórias e segurança de dados avançada.",
      icon: <Shield className="h-6 w-6" />
    }
  ];

  // Módulos do sistema
  const modules: ModuleItem[] = [
    {
      id: "sample_management",
      title: "Gestão de Amostras",
      description: "Controle completo do ciclo de vida das amostras de laboratório.",
      icon: <Beaker className="h-6 w-6" />,
      features: [
        "Registro e rastreamento de amostras",
        "Etiquetagem com código de barras/QR",
        "Controle de prazos e alertas",
        "Integração com equipamentos analíticos"
      ]
    },
    {
      id: "equipment_management",
      title: "Gestão de Equipamentos",
      description: "Administração completa dos equipamentos do laboratório.",
      icon: <ScanLine className="h-6 w-6" />,
      features: [
        "Cadastro detalhado de equipamentos",
        "Controle de manutenções preventivas",
        "Gestão de calibrações e validações",
        "Histórico completo de cada equipamento"
      ]
    },
    {
      id: "quality_control",
      title: "Controle de Qualidade",
      description: "Ferramentas para garantia da qualidade nas análises.",
      icon: <ClipboardCheck className="h-6 w-6" />,
      features: [
        "Monitoramento de controles internos",
        "Registro de não-conformidades",
        "Ações corretivas e preventivas",
        "Auditorias internas automatizadas"
      ]
    },
    {
      id: "reports_analytics",
      title: "Relatórios e Analytics",
      description: "Geração de laudos e análise de dados avançada.",
      icon: <BarChart2 className="h-6 w-6" />,
      features: [
        "Templates personalizáveis de laudos",
        "Assinatura digital de responsáveis",
        "Dashboards de performance",
        "Exportação em múltiplos formatos"
      ]
    },
    {
      id: "team_management",
      title: "Gestão de Equipes",
      description: "Administração completa do pessoal do laboratório.",
      icon: <Users className="h-6 w-6" />,
      features: [
        "Controle de permissões por perfil",
        "Atribuição de responsabilidades",
        "Monitoramento de produtividade",
        "Gestão de escalas e plantões"
      ]
    },
    {
      id: "lab_inventory",
      title: "Estoque e Reagentes",
      description: "Controle de insumos e reagentes do laboratório.",
      icon: <Database className="h-6 w-6" />,
      features: [
        "Controle de estoque em tempo real",
        "Gestão de validade de reagentes",
        "Alertas de níveis mínimos",
        "Rastreabilidade de lotes"
      ]
    }
  ];

  // Planos de assinatura
  const pricingPlans: PricingPlan[] = [
    {
      id: "basic",
      name: "Plano Básico",
      price: "997",
      description: "Ideal para laboratórios pequenos com até 5 usuários e volume baixo de análises.",
      features: [
        "Gestão de amostras e análises",
        "Emissão de laudos básicos",
        "1 tipo de análise especializada",
        "Suporte por e-mail",
        "Até 5 usuários",
        "Armazenamento de 10GB"
      ]
    },
    {
      id: "standard",
      name: "Plano Profissional",
      price: "1.997",
      description: "Perfeito para laboratórios médios com até 15 usuários e necessidades avançadas.",
      features: [
        "Todos os recursos do plano Básico",
        "Gestão de equipamentos",
        "3 tipos de análises especializadas",
        "Integração com equipamentos",
        "Suporte prioritário",
        "Até 15 usuários",
        "Armazenamento de 30GB"
      ],
      highlighted: true
    },
    {
      id: "enterprise",
      name: "Plano Enterprise",
      price: "3.997",
      description: "Solução completa para laboratórios de grande porte com necessidades específicas.",
      features: [
        "Todos os recursos do plano Profissional",
        "Módulos personalizados",
        "Análises ilimitadas",
        "APIs para integração com sistemas existentes",
        "Suporte 24/7",
        "Usuários ilimitados",
        "Armazenamento de 100GB"
      ]
    },
    {
      id: "custom",
      name: "Plano Personalizado",
      price: "",
      description: "Solução sob medida para redes de laboratórios com necessidades específicas.",
      features: [
        "Módulos customizados para seu negócio",
        "Desenvolvimento de funcionalidades exclusivas",
        "Integração com sistemas legados",
        "Infraestrutura dedicada",
        "Gerente de contas exclusivo",
        "Treinamento personalizado",
        "Suporte premium com SLA garantido"
      ],
      isContact: true
    }
  ];

  // Handler para navegação de módulos
  const handleModuleClick = (moduleId: string) => {
    console.log(`Interesse no módulo: ${moduleId}`);
    // Aqui poderíamos navegar para uma página específica do módulo
    // ou abrir um modal com mais informações
    setLocation(`/contact?interest=lab_module_${moduleId}`);
  };

  // Handler para seleção de plano
  const handleSelectPlan = (planId: string) => {
    console.log(`Plano selecionado: ${planId}`);
    // Redirecionamento para página de contato ou checkout
    setLocation(`/contact?plan=${planId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <FlaskConical className="h-8 w-8 text-blue-600 mr-2" />
            <span className="text-xl font-bold text-gray-900">LabAnalysis</span>
            <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">Beta</span>
          </div>
          <div className="hidden md:flex space-x-6">
            <a href="#features" className="text-gray-600 hover:text-blue-600">Recursos</a>
            <a href="#modules" className="text-gray-600 hover:text-blue-600">Módulos</a>
            <a href="#pricing" className="text-gray-600 hover:text-blue-600">Planos</a>
            <a href="#clients" className="text-gray-600 hover:text-blue-600">Clientes</a>
          </div>
          <div className="flex space-x-4">
            <Button
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
              onClick={() => setLocation('/login')}
            >
              Entrar
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setLocation('/contact')}
            >
              Agendar Demonstração
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-500 to-blue-700 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Plataforma Completa para Gestão de Laboratórios de Análises
              </h1>
              <p className="text-xl text-blue-100">
                Otimize os processos de seu laboratório com uma solução completa e integrada. 
                Da recepção de amostras à entrega de resultados, tudo em uma única plataforma.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6"
                  onClick={() => setLocation('/demo')}
                >
                  Solicitar Demonstração
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-blue-600 text-lg px-8 py-6"
                  onClick={() => document.getElementById('features')?.scrollIntoView({behavior: 'smooth'})}
                >
                  Conhecer Recursos
                </Button>
              </div>
              <div className="flex items-center space-x-2 text-blue-100">
                <Building className="h-5 w-5" />
                <span>Cliente destacado: <strong>Dall Solutions - Paraná</strong></span>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-full h-full bg-blue-300 rounded-xl opacity-20"></div>
                <div className="relative bg-white rounded-xl overflow-hidden shadow-2xl">
                  <img 
                    src="/laboratory-dashboard.png" 
                    alt="Dashboard do Laboratório" 
                    className="w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://via.placeholder.com/800x600?text=Dashboard+do+Laboratório";
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Recursos Principais
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nossa plataforma oferece funcionalidades completas para atender todos os aspectos da gestão de laboratórios de análises.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index} 
                icon={feature.icon} 
                title={feature.title} 
                description={feature.description} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* Info Tabs Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <Tabs defaultValue="overview" className="w-full" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="benefits">Benefícios</TabsTrigger>
                <TabsTrigger value="technology">Tecnologia</TabsTrigger>
              </TabsList>
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <TabsContent value="overview" className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900">Conheça o LabAnalysis</h3>
                  <p className="text-gray-600">
                    O LabAnalysis é uma plataforma completa para gestão de laboratórios de análises, desenvolvida para atender às necessidades específicas deste setor. 
                    Com uma interface intuitiva e recursos avançados, nossa solução permite que você se concentre no que realmente importa: a qualidade de suas análises.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Solução Completa</h4>
                        <p className="text-gray-600 text-sm">Integração total entre recepção de amostras, análises e entrega de resultados.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Controle de Qualidade</h4>
                        <p className="text-gray-600 text-sm">Ferramentas para garantir a precisão e confiabilidade de seus resultados.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Rastreabilidade Total</h4>
                        <p className="text-gray-600 text-sm">Acompanhe todo o histórico de cada amostra e análise realizada.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Personalização</h4>
                        <p className="text-gray-600 text-sm">Adapte o sistema às necessidades específicas do seu laboratório.</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="benefits" className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900">Benefícios do LabAnalysis</h3>
                  <p className="text-gray-600">
                    Nossa plataforma foi desenvolvida para trazer benefícios tangíveis para seu laboratório, melhorando a eficiência operacional e a qualidade dos serviços prestados.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="flex items-start">
                      <Medal className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Aumento de Produtividade</h4>
                        <p className="text-gray-600 text-sm">Redução de 40% no tempo de processamento de amostras e geração de laudos.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Medal className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Redução de Erros</h4>
                        <p className="text-gray-600 text-sm">Diminuição de 65% nos erros operacionais com validações automatizadas.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Medal className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Satisfação do Cliente</h4>
                        <p className="text-gray-600 text-sm">Aumento de 90% na satisfação com entrega mais rápida e laudos de qualidade.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Medal className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Retorno sobre Investimento</h4>
                        <p className="text-gray-600 text-sm">ROI médio de 300% no primeiro ano com redução de custos operacionais.</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="technology" className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900">Tecnologia de Ponta</h3>
                  <p className="text-gray-600">
                    O LabAnalysis utiliza tecnologias modernas e seguras, garantindo estabilidade, performance e segurança para seus dados e operações.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="flex items-start">
                      <Shield className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Segurança Avançada</h4>
                        <p className="text-gray-600 text-sm">Criptografia de ponta a ponta e conformidade com normas de proteção de dados.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Shield className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Infraestrutura Robusta</h4>
                        <p className="text-gray-600 text-sm">Disponibilidade de 99,9% com backups automáticos e redundância geográfica.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Shield className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Integrações Avançadas</h4>
                        <p className="text-gray-600 text-sm">APIs RESTful para integração com equipamentos e sistemas existentes.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Shield className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Tecnologia Responsiva</h4>
                        <p className="text-gray-600 text-sm">Interface adaptável para acesso via desktop, tablet ou smartphone.</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Módulos do Sistema
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conheça os módulos especializados que compõem a plataforma LabAnalysis.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((module) => (
              <ModuleCard 
                key={module.id}
                icon={module.icon}
                title={module.title}
                description={module.description}
                features={module.features}
                onClick={() => handleModuleClick(module.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Planos e Preços
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Escolha o plano ideal para o seu laboratório. Todos incluem suporte técnico e atualizações regulares.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => (
              <PricingCard 
                key={plan.id}
                plan={plan}
                onSelectPlan={handleSelectPlan}
              />
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Não encontrou um plano adequado para o seu laboratório?
            </p>
            <Button
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
              onClick={() => setLocation('/contact?custom=true')}
            >
              Entre em contato para um plano personalizado
            </Button>
          </div>
        </div>
      </section>

      {/* Client Section */}
      <section id="clients" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Clientes que Confiam em Nós
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conheça alguns dos laboratórios que já utilizam nossa plataforma.
            </p>
          </div>
          
          {/* Client Card */}
          <div className="max-w-4xl mx-auto bg-blue-50 rounded-xl overflow-hidden shadow-lg">
            <div className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-md">
                  <Building className="h-16 w-16 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Dall Solutions</h3>
                  <p className="text-gray-700 mb-4">Paraná, Brasil</p>
                  <div className="flex space-x-2 mb-4">
                    <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm">Análises Clínicas</span>
                    <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm">Microbiologia</span>
                    <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm">Toxicologia</span>
                  </div>
                  <p className="text-gray-600 italic border-l-4 border-blue-300 pl-4">
                    "A implementação do LabAnalysis transformou completamente nossos processos. Conseguimos reduzir o tempo de entrega de resultados em 60% e melhorar significativamente nossa precisão analítica."
                  </p>
                  <p className="text-gray-800 font-semibold mt-2">
                    - Diretor de Operações, Dall Solutions
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setLocation('/case-studies')}
            >
              Ver Todos os Cases de Sucesso
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Pronto para Transformar seu Laboratório?
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Agende uma demonstração gratuita e veja como o LabAnalysis pode otimizar os processos do seu laboratório.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Button
              className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6"
              onClick={() => setLocation('/demo')}
            >
              Agendar Demonstração
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-blue-700 text-lg px-8 py-6"
              onClick={() => setLocation('/contact')}
            >
              Falar com um Especialista
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <FlaskConical className="h-8 w-8 text-blue-400 mr-2" />
                <span className="text-xl font-bold text-white">LabAnalysis</span>
              </div>
              <p className="mb-4">
                Plataforma completa para gestão de laboratórios de análises.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Recursos</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white">Principais Recursos</a></li>
                <li><a href="#modules" className="hover:text-white">Módulos do Sistema</a></li>
                <li><a href="#" className="hover:text-white">Roadmap</a></li>
                <li><a href="#" className="hover:text-white">Atualizações</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Carreiras</a></li>
                <li><a href="#clients" className="hover:text-white">Clientes</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white">Documentação</a></li>
                <li><a href="#" className="hover:text-white">Status do Sistema</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p>© 2025 LabAnalysis. Todos os direitos reservados.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white">Termos de Serviço</a>
              <a href="#" className="hover:text-white">Política de Privacidade</a>
              <a href="#" className="hover:text-white">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}