import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EcosystemLogo } from "@/components/ecosystem-logo";
import { EcosystemGraph } from "@/components/ecosystem-graph";
import { EcosystemGraphV2 } from "@/components/ecosystem-graph-v2";
import { 
  Leaf, ShieldCheck, Users, BookOpen, Pill, 
  ArrowRight, CheckCircle, Medal, Globe, 
  Building, Lock, HeartPulse, Info, Briefcase,
  FileText, Scale, ShoppingCart, DollarSign,
  PersonStanding, FlaskConical, Boxes, Network,
  MessageSquare, ClipboardList, HardHat, BellRing,
  FileSearch, Import, ExternalLink, BrainCircuit,
  Sparkles, Calendar, MapPin
} from 'lucide-react';

// Definição de tipos para módulos do sistema
type ModuleColor = "green" | "blue" | "purple" | "amber" | "red";

// Interface para os módulos do sistema
interface ModuleItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: ModuleColor;
  features: string[];
  fullDescription: string;
}

// Interface para os portais do sistema
interface PortalItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: ModuleColor;
  gradientStart: string;
  gradientEnd: string;
}

// Componente de Módulo com efeito hover
const ModuleCard = ({ 
  icon, 
  title, 
  description, 
  features, 
  color = "green",
  onClick
}: { 
  icon: React.ReactNode, 
  title: string, 
  description: string, 
  features: string[],
  color?: ModuleColor,
  onClick: () => void
}) => {
  const colorClasses = {
    green: {
      bg: "bg-green-50 hover:bg-green-100",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      titleColor: "text-green-800",
      border: "border-green-200",
      button: "bg-green-600 hover:bg-green-700",
      shadow: "shadow-green-200/50"
    },
    blue: {
      bg: "bg-blue-50 hover:bg-blue-100",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      titleColor: "text-blue-800",
      border: "border-blue-200",
      button: "bg-blue-600 hover:bg-blue-700",
      shadow: "shadow-blue-200/50"
    },
    purple: {
      bg: "bg-purple-50 hover:bg-purple-100",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      titleColor: "text-purple-800",
      border: "border-purple-200",
      button: "bg-purple-600 hover:bg-purple-700",
      shadow: "shadow-purple-200/50"
    },
    amber: {
      bg: "bg-amber-50 hover:bg-amber-100",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      titleColor: "text-amber-800",
      border: "border-amber-200",
      button: "bg-amber-600 hover:bg-amber-700",
      shadow: "shadow-amber-200/50"
    },
    red: {
      bg: "bg-red-50 hover:bg-red-100",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      titleColor: "text-red-800",
      border: "border-red-200",
      button: "bg-red-600 hover:bg-red-700",
      shadow: "shadow-red-200/50"
    }
  };

  const colors = colorClasses[color];

  return (
    <div 
      className={`p-6 rounded-xl border ${colors.border} ${colors.bg} transition-all duration-300 
      hover:shadow-xl ${colors.shadow} h-full flex flex-col`}
    >
      <div className="flex items-start mb-4">
        <div className={`w-12 h-12 ${colors.iconBg} rounded-full flex items-center justify-center mr-4`}>
          <div className={colors.iconColor}>{icon}</div>
        </div>
        <h3 className={`text-xl font-bold ${colors.titleColor}`}>{title}</h3>
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      <ul className="space-y-2 mb-6 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckCircle className={`h-5 w-5 mr-2 ${colors.iconColor} flex-shrink-0 mt-0.5`} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button 
        className={`mt-auto w-full ${colors.button} text-white`}
        onClick={onClick}
      >
        Saiba mais
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

// Componente de Portal com visual diferente
const PortalCard = ({ 
  icon, 
  title, 
  description, 
  color = "green",
  onClick,
  gradientStart,
  gradientEnd
}: { 
  icon: React.ReactNode, 
  title: string, 
  description: string,
  color?: ModuleColor,
  onClick: () => void,
  gradientStart: string,
  gradientEnd: string
}) => {
  return (
    <div 
      className={`relative overflow-hidden rounded-xl cursor-pointer transform transition-all duration-300 hover:scale-105 group`}
      onClick={onClick}
    >
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${gradientStart} ${gradientEnd} opacity-90`}
      />
      <div className="relative p-8 flex flex-col items-center text-center h-full z-10">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 group-hover:bg-white/30 transition-all duration-300">
          <div className="text-white">{icon}</div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
        <p className="text-white/90">{description}</p>
        <div className="mt-6 bg-white/20 backdrop-blur-sm py-2 px-4 rounded-full group-hover:bg-white/30 transition-all duration-300">
          <span className="text-white flex items-center">
            Acessar Portal
            <ArrowRight className="ml-2 h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  );
};

// Componente de Feature card com animação
const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  color = "green"
}: { 
  icon: React.ReactNode, 
  title: string, 
  description: string, 
  color?: ModuleColor 
}) => {
  const colorClasses = {
    green: {
      bg: "bg-green-50 group-hover:bg-green-100",
      iconBg: "bg-green-100 group-hover:bg-green-200",
      iconColor: "text-green-600",
      titleColor: "text-green-800",
      border: "border-green-200"
    },
    blue: {
      bg: "bg-blue-50 group-hover:bg-blue-100",
      iconBg: "bg-blue-100 group-hover:bg-blue-200",
      iconColor: "text-blue-600",
      titleColor: "text-blue-800",
      border: "border-blue-200"
    },
    purple: {
      bg: "bg-purple-50 group-hover:bg-purple-100",
      iconBg: "bg-purple-100 group-hover:bg-purple-200",
      iconColor: "text-purple-600",
      titleColor: "text-purple-800",
      border: "border-purple-200"
    },
    amber: {
      bg: "bg-amber-50 group-hover:bg-amber-100",
      iconBg: "bg-amber-100 group-hover:bg-amber-200",
      iconColor: "text-amber-600",
      titleColor: "text-amber-800",
      border: "border-amber-200"
    },
    red: {
      bg: "bg-red-50 group-hover:bg-red-100",
      iconBg: "bg-red-100 group-hover:bg-red-200",
      iconColor: "text-red-600",
      titleColor: "text-red-800",
      border: "border-red-200"
    }
  };

  const colors = colorClasses[color];

  return (
    <div className={`p-6 rounded-xl border ${colors.border} ${colors.bg} transition-all duration-300 group`}>
      <div className={`w-14 h-14 ${colors.iconBg} rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110`}>
        <div className={colors.iconColor}>{icon}</div>
      </div>
      <h3 className={`text-xl font-bold ${colors.titleColor} mb-2`}>{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

// Módulos do sistema para exibição na landing page
const modules: ModuleItem[] = [
  {
    id: "rh",
    title: "Módulo RH",
    description: "Gestão completa de recursos humanos para sua empresa.",
    icon: <Users className="h-6 w-6" />,
    color: "blue",
    features: [
      "Gestão de colaboradores",
      "Controle de férias e licenças",
      "Avaliações de desempenho",
      "Folha de pagamento integrada"
    ],
    fullDescription: "O módulo de Recursos Humanos permite a gestão completa do capital humano da organização, desde a contratação até o desligamento. Oferece funcionalidades para controle de ponto, gestão de férias, licenças, avaliações de desempenho e geração de folha de pagamento integrada com o módulo financeiro."
  },
  {
    id: "juridico",
    title: "Módulo Jurídico",
    description: "Controle jurídico e compliance para sua organização.",
    icon: <Scale className="h-6 w-6" />,
    color: "purple",
    features: [
      "Gestão de contratos",
      "Controle de processos",
      "Alertas de vencimentos",
      "Compliance regulatório"
    ],
    fullDescription: "O módulo Jurídico oferece ferramentas para gerenciamento de contratos, processos judiciais e administrativos, além de controle de vencimentos e renovações. Garante que sua organização esteja em conformidade com as legislações e regulamentações do setor medicinal cannabidiol."
  },
  {
    id: "transparencia",
    title: "Módulo Transparência",
    description: "Prestação de contas e transparência para associações.",
    icon: <FileSearch className="h-6 w-6" />,
    color: "green",
    features: [
      "Portal de transparência",
      "Publicação de documentos",
      "Rastreabilidade de recursos",
      "Relatórios financeiros"
    ],
    fullDescription: "O módulo de Transparência permite que associações e organizações publiquem informações sobre sua gestão, garantindo transparência para membros e autoridades. Inclui publicação de demonstrações financeiras, atas de reuniões, certificações e relatórios de atividades."
  },
  {
    id: "importacao",
    title: "Módulo Importação",
    description: "Gerenciamento completo de processos de importação RDC 660.",
    icon: <Import className="h-6 w-6" />,
    color: "amber",
    features: [
      "Cadastro de processos",
      "Integração com ANVISA",
      "Rastreamento de remessas",
      "Gestão documental"
    ],
    fullDescription: "O módulo de Importação foi desenvolvido especialmente para empresas importadoras de produtos cannabidiol, seguindo os requisitos da RDC 660. Permite o acompanhamento de todo o fluxo de importação, desde o pedido inicial até a entrega ao cliente, com integração aos sistemas da ANVISA."
  },
  {
    id: "comunicacao",
    title: "Módulo Comunicação",
    description: "Canais de comunicação integrados com pacientes e parceiros.",
    icon: <MessageSquare className="h-6 w-6" />,
    color: "blue",
    features: [
      "Chat integrado",
      "Notificações automáticas",
      "Envio de comunicados",
      "Integração com WhatsApp"
    ],
    fullDescription: "O módulo de Comunicação facilita a interação entre todos os agentes do ecossistema. Oferece chat interno, sistema de notificações, envio de comunicados e integração com canais externos como WhatsApp e e-mail, garantindo uma comunicação eficiente e segura."
  },
  {
    id: "compras",
    title: "Módulo Compras e Estoque",
    description: "Controle total de aquisições e gestão de inventário.",
    icon: <ShoppingCart className="h-6 w-6" />,
    color: "purple",
    features: [
      "Gestão de fornecedores",
      "Controle de estoque",
      "Cotações automatizadas",
      "Rastreabilidade de lotes"
    ],
    fullDescription: "O módulo de Compras e Estoque permite o gerenciamento completo da cadeia de suprimentos, desde a cotação e compra até o recebimento e distribuição interna. Oferece controle avançado de estoque, rastreabilidade de lotes e gestão de validades de produtos."
  },
  {
    id: "financeiro",
    title: "Módulo Financeiro",
    description: "Gestão financeira completa para sua organização.",
    icon: <DollarSign className="h-6 w-6" />,
    color: "green",
    features: [
      "Contas a pagar e receber",
      "Conciliação bancária",
      "Fluxo de caixa",
      "Relatórios gerenciais"
    ],
    fullDescription: "O módulo Financeiro oferece ferramentas para controle completo das finanças da organização. Permite gerenciar contas a pagar e receber, realizar conciliação bancária, acompanhar o fluxo de caixa e gerar relatórios gerenciais para tomada de decisão."
  },
  {
    id: "cultivo",
    title: "Módulo Cultivo",
    description: "Gestão completa de cultivo de cannabis medicinal.",
    icon: <Leaf className="h-6 w-6" />,
    color: "green",
    features: [
      "Controle de plantio",
      "Monitoramento ambiental",
      "Rastreabilidade de plantas",
      "Gestão de nutrientes"
    ],
    fullDescription: "O módulo de Cultivo foi desenvolvido para atender às necessidades específicas de organizações que cultivam cannabis medicinal. Permite o controle completo do ciclo de cultivo, desde o plantio até a colheita, com rastreabilidade total e monitoramento de condições ambientais."
  },
  {
    id: "producao",
    title: "Módulo Produção Industrial",
    description: "Controle de produção de medicamentos e produtos derivados.",
    icon: <FlaskConical className="h-6 w-6" />,
    color: "amber",
    features: [
      "Controle de lotes",
      "Rastreabilidade",
      "Controle de qualidade",
      "Gestão de fórmulas"
    ],
    fullDescription: "O módulo de Produção Industrial permite o gerenciamento completo de processos produtivos, desde a extração até a fabricação de produtos finais. Inclui controle de qualidade, gestão de lotes, rastreabilidade e conformidade com normas sanitárias."
  },
  {
    id: "patrimonio",
    title: "Módulo Patrimônio",
    description: "Gestão completa de ativos e patrimônio da organização.",
    icon: <HardHat className="h-6 w-6" />,
    color: "blue",
    features: [
      "Controle de ativos",
      "Depreciação automática",
      "Manutenções preventivas",
      "Inventário patrimonial"
    ],
    fullDescription: "O módulo de Patrimônio permite o controle completo dos ativos da organização, com registro, avaliação, depreciação e baixa de bens. Inclui gestão de manutenções preventivas e corretivas, além de inventário periódico para controle patrimonial."
  },
  {
    id: "tarefas",
    title: "Módulo Tarefas",
    description: "Gestão de projetos e atividades para equipes.",
    icon: <ClipboardList className="h-6 w-6" />,
    color: "purple",
    features: [
      "Gestão de projetos",
      "Kanban integrado",
      "Atribuição de tarefas",
      "Acompanhamento de prazos"
    ],
    fullDescription: "O módulo de Tarefas oferece ferramentas para organização e acompanhamento de projetos e atividades. Inclui quadros Kanban, atribuição de responsáveis, definição de prazos e prioridades, além de integrações com calendário e notificações."
  },
  {
    id: "pesquisa",
    title: "Módulo Pesquisa Científica",
    description: "Ferramentas para pesquisa e desenvolvimento científico.",
    icon: <BrainCircuit className="h-6 w-6" />,
    color: "red",
    features: [
      "Coleta de dados",
      "Análise estatística",
      "Gestão de estudos",
      "Publicação de resultados"
    ],
    fullDescription: "O módulo de Pesquisa Científica foi desenvolvido para instituições que realizam pesquisas com cannabis medicinal. Oferece ferramentas para coleta e análise de dados, gestão de estudos clínicos, integração com equipamentos laboratoriais e publicação de resultados."
  },
  {
    id: "labanalytics",
    title: "LabAnalytics",
    description: "Gestão completa para laboratórios de análises.",
    icon: <FlaskConical className="h-6 w-6" />,
    color: "blue",
    features: [
      "Rastreamento de amostras",
      "Análises de canabinóides",
      "Gestão de equipamentos HPLC",
      "Integração com Endurancy"
    ],
    fullDescription: "O LabAnalytics é uma solução completa para laboratórios de análises, especialmente focada em testes de canabinóides e terpenos. Integra-se ao ecossistema Endurancy, permitindo o envio de amostras diretamente do sistema principal para análise, com resultados automaticamente sincronizados. Inclui gestão de equipamentos HPLC, controle de qualidade e emissão de laudos profissionais."
  }
];

// Portais do sistema
const portals: PortalItem[] = [
  {
    id: "paciente",
    title: "Portal do Paciente",
    description: "Acesso a prescrições, histórico de tratamentos e compra de produtos.",
    icon: <Users className="h-8 w-8" />,
    color: "green",
    gradientStart: "from-green-400",
    gradientEnd: "to-green-600"
  },
  {
    id: "farmacia",
    title: "Portal da Farmácia",
    description: "Gestão de dispensação, estoque e vendas de medicamentos.",
    icon: <Pill className="h-8 w-8" />,
    color: "purple",
    gradientStart: "from-purple-400",
    gradientEnd: "to-purple-600"
  },
  {
    id: "medico",
    title: "Portal do Médico",
    description: "Prescrição, acompanhamento e gestão de pacientes.",
    icon: <HeartPulse className="h-8 w-8" />,
    color: "blue",
    gradientStart: "from-blue-400",
    gradientEnd: "to-blue-600"
  }
];

// Componente principal da Landing Page
const NewLandingPage = () => {
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("todos");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Detectar rolagem para mostrar botão de voltar ao topo
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Função para rolar suavemente até o topo
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Função para navegar para seção específica
  const navigateToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filtra os módulos com base na aba ativa
  const getFilteredModules = () => {
    if (activeTab === "todos") return modules;
    
    const categoryMap: Record<string, string[]> = {
      "gestao": ["rh", "juridico", "financeiro", "tarefas", "patrimonio"],
      "producao": ["cultivo", "producao"],
      "comercial": ["compras", "comunicacao", "importacao"],
      "portais": ["paciente", "farmacia", "medico"],
      "compliance": ["transparencia", "pesquisa"]
    };
    
    return modules.filter(module => categoryMap[activeTab]?.includes(module.id));
  };

  // Renderiza detalhes de um módulo específico
  const renderModuleDetails = () => {
    if (!currentModule) return null;
    
    const module = modules.find(m => m.id === currentModule);
    if (!module) return null;
    
    // Mapeamento de cores para classes Tailwind
    type ColorClassMap = {
      [key in ModuleColor]: {
        bg100: string;
        text600: string;
        text800: string;
        text500: string;
        btnBg: string;
      }
    };

    const colorMap: ColorClassMap = {
      green: {
        bg100: "bg-green-100",
        text600: "text-green-600",
        text800: "text-green-800",
        text500: "text-green-500",
        btnBg: "bg-green-600 hover:bg-green-700"
      },
      blue: {
        bg100: "bg-blue-100",
        text600: "text-blue-600",
        text800: "text-blue-800",
        text500: "text-blue-500",
        btnBg: "bg-blue-600 hover:bg-blue-700"
      },
      purple: {
        bg100: "bg-purple-100",
        text600: "text-purple-600",
        text800: "text-purple-800",
        text500: "text-purple-500",
        btnBg: "bg-purple-600 hover:bg-purple-700"
      },
      amber: {
        bg100: "bg-amber-100",
        text600: "text-amber-600",
        text800: "text-amber-800",
        text500: "text-amber-500",
        btnBg: "bg-amber-600 hover:bg-amber-700"
      },
      red: {
        bg100: "bg-red-100",
        text600: "text-red-600",
        text800: "text-red-800",
        text500: "text-red-500",
        btnBg: "bg-red-600 hover:bg-red-700"
      }
    };
    
    const colors = colorMap[module.color];
    
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center mb-6">
              <div className={`w-12 h-12 ${colors.bg100} rounded-full flex items-center justify-center mr-4`}>
                <div className={colors.text600}>{module.icon}</div>
              </div>
              <h2 className={`text-2xl font-bold ${colors.text800}`}>{module.title}</h2>
            </div>
            
            <p className="text-gray-700 mb-6">{module.fullDescription}</p>
            
            <h3 className="text-lg font-semibold mb-3">Funcionalidades:</h3>
            <ul className="space-y-3 mb-6">
              {module.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className={`h-5 w-5 mr-2 ${colors.text500} flex-shrink-0 mt-0.5`} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <div className="flex justify-end gap-3 mt-8">
              <Button 
                variant="outline" 
                onClick={() => setCurrentModule(null)}
              >
                Fechar
              </Button>
              <Button 
                className={colors.btnBg}
                onClick={() => {
                  window.location.href = "/organization-registration";
                }}
              >
                Experimentar Módulo
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white relative">
      {/* Modal de detalhes do módulo */}
      {renderModuleDetails()}
      
      {/* Botão de voltar ao topo */}
      {showScrollTop && (
        <button 
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-green-600 text-white p-3 rounded-full shadow-lg z-40 hover:bg-green-700 transition-all"
          aria-label="Voltar ao topo"
        >
          <ArrowRight className="h-6 w-6 transform rotate-270" />
        </button>
      )}

      {/* Header/Navigation */}
      <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Leaf className="h-8 w-8 text-green-600" />
            <div className="ml-2 flex items-center">
              <span className="text-xl font-bold text-green-800">Endurancy</span>
              <span className="ml-1.5 px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">Beta</span>
            </div>
          </div>
          <nav className="hidden lg:flex space-x-8">
            <a href="#ecossistema" className="text-green-700 hover:text-green-500 font-medium">Ecossistema</a>
            <a href="#modulos" className="text-green-700 hover:text-green-500 font-medium">Módulos</a>
            <a href="#portais" className="text-green-700 hover:text-green-500 font-medium">Portais</a>
            <a href="#beneficios" className="text-green-700 hover:text-green-500 font-medium">Benefícios</a>
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

      {/* Hero Section com animação */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern-bg.svg')] opacity-5"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="order-2 lg:order-1">
              <h1 className="text-4xl md:text-5xl font-bold text-green-800 leading-tight mb-4">
                O Ecossistema Completo para o Setor Medicinal Cannabidiol
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Uma plataforma integrada que conecta médicos, farmacêuticos, pesquisadores, associações 
                e pacientes com foco na gestão eficiente, conformidade regulatória e excelência operacional.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white py-6 px-8 text-lg group transition-all"
                  onClick={() => window.location.href = "/organization-registration"}
                >
                  Comece Agora
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  className="border-green-600 text-green-600 hover:bg-green-50 py-6 px-8 text-lg"
                  onClick={() => navigateToSection("modulos")}
                >
                  Explorar Módulos
                </Button>
              </div>
              
              {/* Estatísticas */}
              <div className="grid grid-cols-3 gap-4 mt-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-700">+10</div>
                  <div className="text-sm text-gray-600">Módulos Integrados</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-700">+50</div>
                  <div className="text-sm text-gray-600">Organizações</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-700">+5000</div>
                  <div className="text-sm text-gray-600">Usuários Ativos</div>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="w-full max-w-xl bg-white p-8 rounded-xl shadow-xl border border-green-100 transition-all">
                <div className="relative aspect-square">
                  <EcosystemGraphV2 />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ecossistema Integrado */}
      <section id="ecossistema" className="py-20 px-4 bg-gradient-to-b from-white to-green-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-green-800 mb-4">Nosso Ecossistema Integrado</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Uma rede interconectada que facilita o fluxo de informações e processos entre 
              todos os agentes do setor medicinal cannabidiol.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-green-100">
              <div className="grid grid-cols-3 gap-4">
                {/* Primeira linha */}
                <div className="bg-blue-100 rounded-xl p-4 text-center">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <span className="text-blue-800 font-medium text-sm">Pacientes</span>
                </div>
                <div className="bg-green-100 rounded-xl p-4 text-center">
                  <Leaf className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <span className="text-green-800 font-medium text-sm">Cultivo</span>
                </div>
                <div className="bg-purple-100 rounded-xl p-4 text-center">
                  <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <span className="text-purple-800 font-medium text-sm">Relatórios</span>
                </div>
                
                {/* Segunda linha */}
                <div className="bg-red-100 rounded-xl p-4 text-center">
                  <HeartPulse className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <span className="text-red-800 font-medium text-sm">Médicos</span>
                </div>
                <div className="col-span-1 row-span-1 bg-green-600 rounded-xl p-4 text-center flex flex-col items-center justify-center">
                  <Leaf className="h-10 w-10 text-white mx-auto mb-1" />
                  <span className="text-white font-bold text-sm">Endurancy</span>
                </div>
                <div className="bg-amber-100 rounded-xl p-4 text-center">
                  <FlaskConical className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                  <span className="text-amber-800 font-medium text-sm">Produção</span>
                </div>
                
                {/* Terceira linha */}
                <div className="bg-indigo-100 rounded-xl p-4 text-center">
                  <ShieldCheck className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                  <span className="text-indigo-800 font-medium text-sm">Compliance</span>
                </div>
                <div className="bg-pink-100 rounded-xl p-4 text-center">
                  <Pill className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                  <span className="text-pink-800 font-medium text-sm">Farmácia</span>
                </div>
                <div className="bg-blue-100 rounded-xl p-4 text-center">
                  <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <span className="text-blue-800 font-medium text-sm">Financeiro</span>
                </div>
              </div>
              
              {/* Conexões entre os elementos */}
              <div className="mt-4 flex justify-center">
                <div className="bg-green-100 rounded-full px-4 py-2 text-sm text-green-800 flex items-center">
                  <Network className="h-4 w-4 mr-2 text-green-600" />
                  Todos conectados na mesma plataforma
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-green-800 mb-6">Todos Conectados em Uma Única Plataforma</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <Network className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-green-700 mb-1">Interoperabilidade Total</h4>
                    <p className="text-gray-600">
                      Todos os módulos e portais se comunicam em tempo real, eliminando silos de informação
                      e garantindo que dados importantes estejam disponíveis onde e quando necessários.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <Lock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-green-700 mb-1">Segurança e Privacidade</h4>
                    <p className="text-gray-600">
                      Controle granular de permissões garantindo que cada usuário tenha acesso apenas
                      às informações necessárias para sua função, em conformidade com a LGPD.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <ShieldCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-green-700 mb-1">Conformidade Regulatória</h4>
                    <p className="text-gray-600">
                      Atualizações constantes para garantir conformidade com as regulamentações
                      do setor, incluindo RDC 660 e outras normas da ANVISA.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Módulos Section com seletores */}
      <section id="modulos" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-600 text-sm font-medium mb-4">
              Módulos Completos
            </div>
            <h2 className="text-4xl font-bold text-green-800 mb-4">Módulos Especializados</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              Personalize sua experiência com nossos módulos integrados para atender às necessidades 
              específicas do seu negócio. Todos os módulos se comunicam entre si em tempo real.
            </p>
            
            <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto">
              <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-8 bg-green-50/80 p-1">
                <TabsTrigger value="todos" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Todos</TabsTrigger>
                <TabsTrigger value="gestao" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Gestão</TabsTrigger>
                <TabsTrigger value="producao" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">Produção</TabsTrigger>
                <TabsTrigger value="comercial" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Comercial</TabsTrigger>
                <TabsTrigger value="compliance" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Compliance</TabsTrigger>
                <TabsTrigger value="portais" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Portais</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {getFilteredModules().map((module) => (
              <ModuleCard 
                key={module.id}
                icon={module.icon}
                title={module.title}
                description={module.description}
                features={module.features}
                color={module.color}
                onClick={() => setCurrentModule(module.id)}
              />
            ))}
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-xl border border-green-100 mt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                <BrainCircuit className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-800 mb-2">Módulos Inteligentes e Interconectados</h3>
                <p className="text-gray-600">
                  Todos os módulos da plataforma Endurancy foram projetados para trabalhar em conjunto,
                  compartilhando dados e processos de forma segura e eficiente. A modularidade permite
                  que você comece com o que precisa agora e expanda conforme seu negócio cresce.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Button 
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  onClick={() => window.location.href = "/organization-registration"}
                >
                  Experimentar Agora
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portais Section com visual diferente */}
      <section id="portais" className="py-20 px-4 bg-gradient-to-b from-green-50 to-white relative overflow-hidden">
        {/* Background elements decorativos */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-200 rounded-full opacity-20 -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full opacity-20 translate-y-1/3 -translate-x-1/3 blur-3xl"></div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-600 text-sm font-medium mb-4">
              Acesso Otimizado
            </div>
            <h2 className="text-4xl font-bold text-green-800 mb-4">Portais Especializados</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Interfaces dedicadas para cada perfil de usuário, garantindo experiências 
              otimizadas para diferentes necessidades e fluxos de trabalho.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {portals.map((portal) => (
              <PortalCard 
                key={portal.id}
                icon={portal.icon}
                title={portal.title}
                description={portal.description}
                color={portal.color}
                onClick={() => window.location.href = "/login"}
                gradientStart={portal.gradientStart}
                gradientEnd={portal.gradientEnd}
              />
            ))}
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-green-800 mb-4">Fluxo de Trabalho Integrado</h3>
                <p className="text-gray-600 mb-6">
                  Nossos portais especializados funcionam em sincronia, permitindo que médicos, farmacêuticos e 
                  pacientes interajam de forma eficiente e segura. Toda informação é compartilhada em tempo real 
                  entre os portais autorizados, eliminando a necessidade de múltiplos cadastros e reduzindo erros.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <ShieldCheck className="h-5 w-5 mr-2 text-green-500" />
                    <span className="text-sm">Segurança de ponta a ponta</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-green-500" />
                    <span className="text-sm">Controle de acesso granular</span>
                  </div>
                  <div className="flex items-center">
                    <Network className="h-5 w-5 mr-2 text-green-500" />
                    <span className="text-sm">Integração perfeita</span>
                  </div>
                  <div className="flex items-center">
                    <BellRing className="h-5 w-5 mr-2 text-green-500" />
                    <span className="text-sm">Notificações em tempo real</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-xl">
                <div className="relative">
                  <div className="flex justify-between mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <HeartPulse className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                      <Pill className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                  
                  <div className="h-0.5 bg-gradient-to-r from-green-300 to-purple-300 my-6"></div>
                  
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <Network className="h-48 w-48 text-green-800" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios Section */}
      {/* Seção LabAnalytics */}
      <section className="py-20 px-4 bg-blue-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex items-center mb-4">
                <FlaskConical className="h-10 w-10 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-blue-800">LabAnalytics</h2>
              </div>
              <p className="text-lg text-gray-700 mb-6">
                Uma solução completa para laboratórios de análises, especialmente focada em testes de canabinóides e terpenos. 
                Já utilizada pela Dall Solutions, nossa primeira parceira no Paraná.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Gestão completa de amostras e análises</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Controle de equipamentos HPLC e manutenções</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Integração com o ecossistema Endurancy</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Receba amostras e envie resultados automaticamente</span>
                </div>
              </div>
              
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white group transition-all"
                onClick={() => window.location.href = "/laboratory"}
              >
                Conheça o LabAnalytics
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -top-6 -left-6 bg-white px-4 py-2 rounded-lg shadow-md border border-blue-100 z-10">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-800">Dall Solutions</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Primeiro cliente</div>
                </div>
                
                <img 
                  src="/dashboard-image.png"
                  alt="Dashboard do LabAnalytics"
                  className="rounded-lg shadow-xl border-4 border-white"
                />
                
                <div className="absolute -bottom-5 -right-5 bg-green-50 px-4 py-2 rounded-lg shadow-md border border-green-100 z-10">
                  <div className="flex items-center">
                    <Leaf className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-800">Integrado ao Endurancy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section id="beneficios" className="py-20 px-4 bg-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-100 rounded-full opacity-30"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-100 rounded-full opacity-30"></div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-600 text-sm font-medium mb-4">
              Resultados Comprovados
            </div>
            <h2 className="text-4xl font-bold text-green-800 mb-4">Benefícios da Plataforma</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Descubra como a Endurancy pode transformar os processos da sua organização 
              e trazer resultados significativos para seu negócio.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <FeatureCard 
              icon={<DollarSign className="h-6 w-6" />}
              title="Redução de Custos"
              description="Otimize processos e reduza despesas operacionais com nossa plataforma integrada."
              color="green"
            />
            
            <FeatureCard 
              icon={<ShieldCheck className="h-6 w-6" />}
              title="Conformidade Garantida"
              description="Mantenha-se atualizado com todas as regulamentações do setor de cannabis medicinal."
              color="blue"
            />
            
            <FeatureCard 
              icon={<Users className="h-6 w-6" />}
              title="Satisfação do Paciente"
              description="Ofereça uma experiência superior aos seus pacientes com nosso portal dedicado."
              color="purple"
            />
            
            <FeatureCard 
              icon={<BellRing className="h-6 w-6" />}
              title="Notificações Inteligentes"
              description="Receba alertas sobre eventos importantes e nunca perca prazos críticos."
              color="amber"
            />
            
            <FeatureCard 
              icon={<Boxes className="h-6 w-6" />}
              title="Gestão Eficiente"
              description="Controle todos os aspectos da sua operação em uma única plataforma intuitiva."
              color="red"
            />
            
            <FeatureCard 
              icon={<ExternalLink className="h-6 w-6" />}
              title="Integração Flexível"
              description="Conecte-se facilmente com outros sistemas e ferramentas que sua organização já utiliza."
              color="green"
            />
          </div>
          
          {/* Success metrics */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 shadow-sm">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-green-800">Resultados Reais</h3>
              <p className="text-gray-600">
                Veja o que nossas organizações parceiras estão conseguindo com a Endurancy:
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100">
                <div className="text-3xl font-bold text-green-700 mb-2">35%</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Redução nos custos operacionais</h4>
                <p className="text-gray-600 text-sm">
                  Automação de processos e eliminação de tarefas manuais repetitivas resultam em 
                  economia significativa.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-100">
                <div className="text-3xl font-bold text-blue-700 mb-2">50%</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Mais rapidez nos atendimentos</h4>
                <p className="text-gray-600 text-sm">
                  Pacientes são atendidos com mais agilidade devido aos fluxos de trabalho otimizados 
                  e integração entre módulos.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-100">
                <div className="text-3xl font-bold text-purple-700 mb-2">99%</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Conformidade regulatória</h4>
                <p className="text-gray-600 text-sm">
                  Nossa plataforma garante o cumprimento das normas da ANVISA e outras 
                  regulamentações do setor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="py-20 px-4 bg-gradient-to-b from-white to-green-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-300 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-300 rounded-full opacity-10 blur-3xl"></div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-600 text-sm font-medium mb-4">
              Planos para Todas as Necessidades
            </div>
            <h2 className="text-4xl font-bold text-green-800 mb-4">Planos Flexíveis</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
              Escolha o plano ideal para o tamanho e as necessidades do seu negócio.
            </p>
            
            <div className="max-w-2xl mx-auto bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-xl font-bold mb-2 flex items-center">
                    <Medal className="mr-2 h-5 w-5" />
                    OFERTA BETA EXCLUSIVA
                  </h3>
                  <p className="text-blue-100">
                    Acesso gratuito a todos os recursos por 1 ano completo
                  </p>
                </div>
                <Button 
                  className="bg-white text-blue-700 hover:bg-blue-50 font-bold"
                  onClick={() => window.location.href = "/organization-registration"}
                >
                  Aproveitar Agora
                </Button>
              </div>
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
      <section className="py-20 px-4 bg-gradient-to-r from-green-700 to-green-900 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-green-600 rounded-full opacity-20"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-green-600 rounded-full opacity-20"></div>
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-600/30 text-green-100 text-sm font-medium mb-4">
            Comece sua transformação digital
          </div>
          <h2 className="text-4xl font-bold mb-6">Pronto para transformar seu negócio?</h2>
          <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
            Junte-se às empresas que estão otimizando seus processos e aumentando seus resultados 
            com a plataforma Endurancy.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              className="bg-white text-green-800 hover:bg-green-100 py-6 px-8 text-lg group"
              onClick={() => window.location.href = "/organization-registration"}
            >
              Começar Gratuitamente
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-green-800 py-6 px-8 text-lg"
              onClick={() => window.location.href = "/login"}
            >
              Fazer Login
            </Button>
          </div>
          
          <div className="mt-12 pt-12 border-t border-green-600 flex flex-wrap justify-center gap-8">
            <div className="flex items-center">
              <Lock className="h-6 w-6 text-green-300 mr-2" />
              <span>Proteção de dados LGPD</span>
            </div>
            <div className="flex items-center">
              <ShieldCheck className="h-6 w-6 text-green-300 mr-2" />
              <span>Ambiente seguro</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-300 mr-2" />
              <span>Suporte especializado</span>
            </div>
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
              <h4 className="font-medium text-white mb-4">Produto</h4>
              <ul className="space-y-2">
                <li><a href="#modulos" className="text-green-300 hover:text-white">Módulos</a></li>
                <li><a href="#portais" className="text-green-300 hover:text-white">Portais</a></li>
                <li><a href="#precos" className="text-green-300 hover:text-white">Preços</a></li>
                <li><a href="/roadmap" className="text-green-300 hover:text-white flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  <span>Roadmap 2025-2027</span>
                </a></li>
                <li><a href="/sitemap" className="text-green-300 hover:text-white">Mapa do Site</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-white mb-4">Empresa</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-green-300 hover:text-white">Sobre nós</a></li>
                <li><a href="#" className="text-green-300 hover:text-white">Contato</a></li>
                <li><a href="#" className="text-green-300 hover:text-white">Carreiras</a></li>
                <li><a href="#" className="text-green-300 hover:text-white">Imprensa</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-green-300 hover:text-white">Termos de Uso</a></li>
                <li><a href="#" className="text-green-300 hover:text-white">Privacidade</a></li>
                <li><a href="#" className="text-green-300 hover:text-white">Cookies</a></li>
                <li><a href="#" className="text-green-300 hover:text-white">Conformidade</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-green-800 mt-12 pt-8 text-center text-green-400 text-sm">
            <p>&copy; 2025 Endurancy. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NewLandingPage;