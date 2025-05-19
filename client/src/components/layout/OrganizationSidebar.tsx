import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { 
  // Layout e navegação
  LayoutDashboard, Menu, ChevronLeft, ChevronDown,
  
  // Ícones para usuários e dados
  Users, User, UserPlus, UserCog, Users2,
  
  // Ícones financeiros
  CreditCard, DollarSign, CircleDollarSign, HandCoins, Wallet,
  ArrowUp, ArrowDown, ArrowRightLeft, LineChart,
  
  // Ícones de compras, produtos e logística
  Package, PackageOpen, PackageCheck, PackagePlus, ShoppingCart, ShoppingBag, Truck,

  
  // Ícones de documentos
  Clipboard, ClipboardList, FileText, FileClock, FileSearch, FileBarChart, BookOpen, FilePlus,
  
  // Ícones de notificações e comunicação
  BellRing, Bell, MessageSquare, MessageCircle, Send,
  
  // Ícones de calendário e tempo
  CalendarDays, Calendar, CalendarCheck, CalendarRange,
  
  // Ícones médicos
  Pill, HeartPulse, Stethoscope, TestTube, Microscope,
  // Ícones para carteirinha
  UserSquare, Store,

  // Ícones de indústria e negócios
  Factory, ShieldCheck, Building, Building2, Landmark, Scale, Briefcase,
  
  // Ícones de análise e gráficos
  BarChart, BarChart2, BarChart3, BarChart4,
  
  // Ícones de UI
  Settings, LogOut, HelpCircle, Loader2, Check, Ban, X, Receipt,
  // Ícones de tecnologia
  Cpu, 
  
  // Ícones de natureza
  Leaf, Brain, Beaker, Droplet, FlaskConical,
  
  // Ícones de ferramentas
  Wrench, Calculator,
  
  // Ícones diversos
  Sparkles, BadgeHelp, Tag, RefreshCw, Network, Home, Map,
  Shapes, Target, GraduationCap, Video, Radio, Headphones, Phone,
  BadgePercent, Printer, Box, Trash2, Puzzle, Bot, 
  Plane, Mailbox, Share2, Scissors, ScrollText, Library, Layers, HeartHandshake,
  Globe, FileCheck, AlertTriangle, FileUp,
  
  // Aliases
  CreditCard as CreditCardIcon,
  QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Organization } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarMenuItem } from "./SidebarMenuItem";

export default function OrganizationSidebar() {
  // Classe CSS para o tema da organização
  const sidebarClassNames = cn(
    "organization-sidebar fixed top-0 bottom-0 left-0 z-40 w-64 h-screen transition-transform bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-800 overflow-hidden flex flex-col",
  );
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Listen for path changes
  useEffect(() => {
    const handleNavigation = () => {
      const path = window.location.pathname;
      console.log("Atualizando path na navegação:", path);
      setCurrentPath(path);
      
      try {
        // Verifica se há um estado de menu a ser restaurado
        // @ts-ignore
        const stateSubmenu = window.history.state?.submenu;
        if (stateSubmenu) {
          console.log("Restaurando estado de submenu:", stateSubmenu);
          setExpandedMenu(stateSubmenu);
        }
      } catch (error) {
        console.error("Erro ao restaurar estado do menu:", error);
      }
    };
    
    // Capturamos tanto popstate quanto nosso evento personalizado de navegação
    window.addEventListener('popstate', handleNavigation);
    window.addEventListener('navigation', handleNavigation);
    
    return () => {
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('navigation', handleNavigation);
    };
  }, []);
  
  // Gerenciar posição de rolagem e expandedMenu
  useEffect(() => {
    // Para garantir que menus sempre iniciem fechados, removemos qualquer estado salvo
    // Isso corrige o problema de menus como Financeiro e Tickets abrirem automaticamente
    localStorage.removeItem('expandedSubmenu');
    setExpandedMenu(null);
    
    // Restaura a posição de rolagem da sidebar, se houver
    const scrollContainer = document.querySelector('.custom-scrollbar');
    const savedScrollPos = localStorage.getItem('sidebarScrollPos');
    
    if (scrollContainer && savedScrollPos) {
      setTimeout(() => {
        scrollContainer.scrollTop = parseInt(savedScrollPos, 10);
        
        // Procura pelo elemento que foi clicado por último e garante que ele esteja visível
        const lastClickedItem = document.querySelector('[data-last-clicked="true"]');
        if (lastClickedItem) {
          lastClickedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          // Remove o atributo após a utilização
          lastClickedItem.removeAttribute('data-last-clicked');
        }
      }, 100); // Pequeno delay para garantir que os elementos foram renderizados
    }
  }, []);
  
  // Carregar dados da organização se o usuário estiver autenticado e tiver um organizationId
  const { data: organization, isLoading: isOrgLoading } = useQuery({
    queryKey: ['/api/organizations', user?.organizationId],
    queryFn: async () => {
      if (!user?.organizationId) return null;
      try {
        console.log("Sidebar: carregando organização", user.organizationId, "com timestamp:", Date.now());
        // Adicionar um parâmetro de consulta aleatório para evitar cache do navegador
        const timestamp = Date.now();
        const response = await fetch(`/api/organizations/${user.organizationId}?_=${timestamp}`, {
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
          cache: 'no-store'
        });
        if (!response.ok) throw new Error('Falha ao carregar organização');
        return await response.json();
      } catch (error) {
        console.error('Erro ao buscar organização:', error);
        return null;
      }
    },
    enabled: !!user?.organizationId,
    // Configurar para sempre buscar dados frescos
    staleTime: 0, // Sempre considerar dados obsoletos
    cacheTime: 0, // Não manter em cache
    refetchInterval: 5000, // Recarregar a cada 5 segundos
    refetchOnWindowFocus: true, // Recarregar quando o usuário voltar para a janela
    refetchOnMount: true, // Recarregar sempre que o componente montar
  });
  
  // Verifica se a organização é do tipo importadora
  const isImportCompany = organization?.type === 'import_company' || 
                          currentPath.includes('/organization/import-company');
                          
  // Aplicar classe CSS com base no tipo de organização
  useEffect(() => {
    const sidebarElement = document.querySelector('.organization-sidebar');
    if (sidebarElement) {
      if (isImportCompany) {
        sidebarElement.classList.add('import-company-theme');
        document.documentElement.classList.add('import-company-theme');
      } else {
        sidebarElement.classList.remove('import-company-theme');
        document.documentElement.classList.remove('import-company-theme');
      }
    }
    
    return () => {
      document.documentElement.classList.remove('import-company-theme');
    };
  }, [isImportCompany, currentPath]);

  // Function to navigate to a path, ensuring session is maintained
  const navigateTo = (path: string, keepSubmenuOpen = false) => {
    // Primeiro verifica se o usuário está autenticado
    if (!user) {
      console.log("Tentando navegar sem autenticação. Redirecionando para login");
      window.location.href = '/login';
      return;
    }
    
    // Prevenir navegação para a mesma rota para evitar duplicação
    if (path === currentPath) {
      console.log(`Já estamos na rota ${path}, evitando navegação redundante`);
      return;
    }
    
    // Se for necessário manter o submenu aberto, salvamos o estado atual
    const currentSubmenu = keepSubmenuOpen ? expandedMenu : null;
    
    // Se autenticado, usa o método de navegação mais seguro
    try {
      console.log(`Navegando para: ${path}, mantendo submenu: ${keepSubmenuOpen}`);
      
      // Atualizamos o estado do currentPath antes da navegação para evitar loops
      setCurrentPath(path);
      
      // Atualizamos o histórico
      window.history.pushState({submenu: currentSubmenu}, '', path);
      
      // Nós disparamos o evento navigation em vez de popstate para maior controle
      window.dispatchEvent(new Event('navigation'));
      
      // Se houver um submenu aberto e queremos mantê-lo aberto, restauramos após a navegação
      if (keepSubmenuOpen && currentSubmenu) {
        console.log("Mantendo submenu aberto após navegação:", currentSubmenu);
        localStorage.setItem('expandedSubmenu', currentSubmenu);
        setExpandedMenu(currentSubmenu);
      }
    } catch (error) {
      console.error("Erro na navegação:", error);
      // Fallback para método mais direto em caso de erro
      window.location.href = path;
    }
  };

  // Use estado para controlar qual menu está expandido
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  
  // Função para alternar a exibição de um submenu
  const toggleSubmenu = (menuTitle: string, event: React.MouseEvent) => {
    event.stopPropagation();
    console.log("Toggle submenu:", menuTitle, "Current expanded:", expandedMenu);
    if (expandedMenu === menuTitle) {
      setExpandedMenu(null);
      localStorage.removeItem('expandedSubmenu');
      console.log("Fechando submenu:", menuTitle);
    } else {
      setExpandedMenu(menuTitle);
      localStorage.setItem('expandedSubmenu', menuTitle);
      console.log("Abrindo submenu:", menuTitle);
    }
  };
  
  // Função para fechar um submenu específico
  const closeSubmenu = (event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedMenu(null);
    localStorage.removeItem('expandedSubmenu');
    console.log("Fechando todos os submenus");
  };
  
  // Função para forçar a abertura do submenu sem fechá-lo
  const openSubmenu = (menuTitle: string) => {
    console.log("Forçando abertura de submenu:", menuTitle);
    setExpandedMenu(menuTitle);
    localStorage.setItem('expandedSubmenu', menuTitle);
  };
  
  // Todos os módulos específicos para diferentes papéis
  const medicalModules: any[] = [];
  const pharmacyModules: any[] = [];
  
  // Módulo específico de Importação
  const importModules = [
    {
      title: "Importação",
      path: "/organization/import-company",
      active: currentPath === "/organization/import-company" || 
              currentPath.startsWith("/organization/import-company/"),
      icon: <Globe size={18} className="text-blue-500" />,
      isSubmenu: true,
      subItems: [
        {
          title: "Dashboard Importação",
          path: "/organization/import-company",
          active: currentPath === "/organization/import-company" && !currentPath.includes("/organization/import-company/"),
          icon: <LayoutDashboard size={16} className="text-blue-500" />
        },
        {
          title: "Novo Pedido",
          path: "/organization/import-company/novo-pedido",
          active: currentPath === "/organization/import-company/novo-pedido",
          icon: <FilePlus size={16} className="text-blue-500" />
        },
        {
          title: "Pedidos em Análise",
          path: "/organization/import-company/pedidos-analise",
          active: currentPath === "/organization/import-company/pedidos-analise",
          icon: <FileSearch size={16} className="text-blue-500" />
        },
        {
          title: "Enviados para ANVISA",
          path: "/organization/import-company/anvisa",
          active: currentPath === "/organization/import-company/anvisa",
          icon: <FileUp size={16} className="text-blue-500" />
        },
        {
          title: "Aprovados",
          path: "/organization/import-company/aprovados",
          active: currentPath === "/organization/import-company/aprovados",
          icon: <FileCheck size={16} className="text-blue-500" />
        },
        {
          title: "Rejeitados",
          path: "/organization/import-company/rejeitados",
          active: currentPath === "/organization/import-company/rejeitados",
          icon: <AlertTriangle size={16} className="text-blue-500" />
        },
        {
          title: "Em Trânsito",
          path: "/organization/import-company/transito",
          active: currentPath === "/organization/import-company/transito",
          icon: <Plane size={16} className="text-blue-500" />
        },
        {
          title: "Entregues",
          path: "/organization/import-company/entregues",
          active: currentPath === "/organization/import-company/entregues",
          icon: <Check size={16} className="text-blue-500" />
        }
      ]
    }
  ];
  
  // Módulos obrigatórios (incluídos no freemium e em todos os planos)
  const freeModules = [
    {
      title: "Meu Plano",
      path: "/organization/meu-plano",
      active: currentPath === "/organization/meu-plano",
      icon: <Puzzle size={18} />
    },
    {
      title: "Onboarding",
      path: "/organization/onboarding",
      active: currentPath === "/organization/onboarding",
      icon: <Clipboard size={18} />
    },
    {
      title: "Visão Geral",
      path: "/organization/dashboard",
      active: currentPath === "/organization/dashboard",
      isActive: true,
      icon: <LayoutDashboard size={18} />
    },
    {
      title: "Cadastros",
      path: "/organization/cadastros",
      active: currentPath === "/organization/cadastros" || 
              currentPath === "/organization/gerenciar-pacientes",
      icon: <Users size={18} />
    },
    {
      title: "Programa de Afiliados",
      path: "/organization/afiliados",
      active: currentPath === "/organization/afiliados" || 
              currentPath.startsWith("/organization/afiliados/"),
      icon: <Share2 size={18} className="text-blue-500" />,
      isSubmenu: true,
      subItems: [
        {
          title: "Dashboard Afiliados",
          path: "/organization/afiliados",
          active: currentPath === "/organization/afiliados" && !currentPath.includes("/organization/afiliados/configuracoes"),
          icon: <BarChart3 size={16} className="text-blue-500" />
        },
        {
          title: "Configurações",
          path: "/organization/afiliados/configuracoes",
          active: currentPath === "/organization/afiliados/configuracoes",
          icon: <Settings size={16} className="text-blue-500" />
        }
      ]
    },
    {
      title: "Expedição",
      path: "/organization/expedicao",
      active: currentPath === "/organization/expedicao" || 
              currentPath === "/organization/expedition" || 
              currentPath === "/organization/producao" ||
              currentPath.startsWith("/organization/expedicao/"),
      icon: <Truck size={18} />,
      isSubmenu: true,
      subItems: [
        {
          title: "Dashboard Expedição",
          path: "/organization/expedicao",
          active: currentPath === "/organization/expedicao" && !currentPath.includes("/organization/expedicao/"),
          icon: <LayoutDashboard size={16} />
        },
        {
          title: "Preparação de Envios",
          path: "/organization/expedicao/pedidos",
          active: currentPath === "/organization/expedicao/pedidos",
          icon: <ClipboardList size={16} />
        },
        {
          title: "Etiquetas",
          path: "/organization/expedicao/etiquetas",
          active: currentPath === "/organization/expedicao/etiquetas",
          icon: <Printer size={16} />
        },
        {
          title: "Leitura de Códigos",
          path: "/organization/expedicao/codigos",
          active: currentPath === "/organization/expedicao/codigos",
          icon: <FileText size={16} />
        },
        {
          title: "Documentação",
          path: "/organization/expedicao/documentacao",
          active: currentPath === "/organization/expedicao/documentacao",
          icon: <FileText size={16} />
        },
        {
          title: "Mapa BI",
          path: "/organization/expedicao/mapa-bi",
          active: currentPath === "/organization/expedicao/mapa-bi",
          icon: <BarChart3 size={16} />
        }
      ]
    },
    {
      title: "Módulo Social",
      path: "/organization/social",
      active: currentPath === "/organization/social" || 
              currentPath.startsWith("/organization/social/"),
      icon: <HeartHandshake size={18} className="text-red-500" />,
      isSubmenu: true,
      subItems: [
        {
          title: "Dashboard Social",
          path: "/organization/social",
          active: currentPath === "/organization/social",
          icon: <LayoutDashboard size={16} className="text-red-500" />
        },
        {
          title: "Beneficiários",
          path: "/organization/social/beneficiarios",
          active: currentPath === "/organization/social/beneficiarios",
          icon: <Users2 size={16} className="text-red-500" />
        },
        {
          title: "Doações",
          path: "/organization/social/doacoes",
          active: currentPath === "/organization/social/doacoes",
          icon: <HandCoins size={16} className="text-red-500" />
        },
        {
          title: "Despesas",
          path: "/organization/social/despesas",
          active: currentPath === "/organization/social/despesas",
          icon: <Receipt size={16} className="text-red-500" />
        },
        {
          title: "Campanhas",
          path: "/organization/social/campanhas",
          active: currentPath === "/organization/social/campanhas",
          icon: <Target size={16} className="text-red-500" />
        },
        {
          title: "Voluntários",
          path: "/organization/social/voluntarios",
          active: currentPath === "/organization/social/voluntarios",
          icon: <Users size={16} className="text-red-500" />
        },
        {
          title: "Configurações",
          path: "/organization/social/configuracoes",
          active: currentPath === "/organization/social/configuracoes",
          icon: <Settings size={16} className="text-red-500" />
        }
      ]
    },
    
    {
      title: "Inteligência Artificial",
      path: "/organization/ai",
      active: currentPath === "/organization/ai" || 
              currentPath.startsWith("/organization/ai/"),
      icon: <Cpu size={18} />,
      isSubmenu: true,
      subItems: [
        {
          title: "Dashboard IA",
          path: "/organization/ai",
          active: currentPath === "/organization/ai" && !currentPath.includes("/organization/ai/"),
          icon: <LayoutDashboard size={16} />
        },
        {
          title: "Assistente",
          path: "/organization/ai/assistant",
          active: currentPath === "/organization/ai/assistant",
          icon: <MessageSquare size={16} />
        },
        {
          title: "Análises",
          path: "/organization/ai/analysis",
          active: currentPath === "/organization/ai/analysis",
          icon: <BarChart3 size={16} />
        },
        {
          title: "Configurações",
          path: "/organization/ai/settings",
          active: currentPath === "/organization/ai/settings",
          icon: <Settings size={16} />
        }
      ]
    },

    {
      title: "Financeiro",
      path: "/organization/financeiro",
      active: currentPath === "/organization/financeiro" || 
              currentPath === "/organization/financeiro/contas-a-pagar" ||
              currentPath === "/organization/financeiro/contas-a-receber" ||
              currentPath === "/organization/financeiro/dre" ||
              currentPath === "/organization/financeiro/orcamento" ||
              currentPath === "/organization/financeiro/fluxo-de-caixa" ||
              currentPath === "/organization/financeiro/calendario" ||
              currentPath === "/organization/financeiro/conciliacao" ||
              currentPath === "/organization/financeiro/analise" ||
              currentPath === "/organization/financeiro/analise-ia" ||
              currentPath === "/organization/financeiro/configuracao",
      icon: <DollarSign size={18} />,
      isSubmenu: true,
      subItems: [
        {
          title: "Dashboard Financeiro",
          path: "/organization/financeiro",
          active: currentPath === "/organization/financeiro" && !currentPath.includes("/organization/financeiro/"),
          icon: <LayoutDashboard size={16} />
        },
        {
          title: "Contas a Pagar",
          path: "/organization/financeiro/contas-a-pagar",
          active: currentPath === "/organization/financeiro/contas-a-pagar",
          icon: <ArrowUp size={16} />
        },
        {
          title: "Contas a Receber",
          path: "/organization/financeiro/contas-a-receber",
          active: currentPath === "/organization/financeiro/contas-a-receber",
          icon: <ArrowDown size={16} />
        },
        {
          title: "DRE",
          path: "/organization/financeiro/dre",
          active: currentPath === "/organization/financeiro/dre",
          icon: <FileBarChart size={16} />
        },
        {
          title: "Orçamento",
          path: "/organization/financeiro/orcamento",
          active: currentPath === "/organization/financeiro/orcamento",
          icon: <BarChart size={16} />
        },
        {
          title: "Fluxo de Caixa",
          path: "/organization/financeiro/fluxo-de-caixa",
          active: currentPath === "/organization/financeiro/fluxo-de-caixa",
          icon: <LineChart size={16} />
        },
        {
          title: "Calendário Financeiro",
          path: "/organization/financeiro/calendario",
          active: currentPath === "/organization/financeiro/calendario",
          icon: <CalendarRange size={16} />
        },
        {
          title: "Conciliação Bancária",
          path: "/organization/financeiro/conciliacao",
          active: currentPath === "/organization/financeiro/conciliacao",
          icon: <Building2 size={16} />
        },
        {
          title: "Análise Financeira",
          path: "/organization/financeiro/analise",
          active: currentPath === "/organization/financeiro/analise",
          icon: <BarChart2 size={16} />
        },
        {
          title: "Análise com IA",
          path: "/organization/financeiro/analise-ia",
          active: currentPath === "/organization/financeiro/analise-ia",
          icon: <Sparkles size={16} />
        },
        {
          title: "Configurações",
          path: "/organization/financeiro/configuracao",
          active: currentPath === "/organization/financeiro/configuracao",
          icon: <Settings size={16} />
        }
      ]
    },
    {
      title: "ComplyPay",
      path: "/organization/complypay",
      active: currentPath === "/organization/complypay" || 
              currentPath === "/organization/complypay/dashboard" ||
              currentPath === "/organization/complypay/faturas" ||
              currentPath === "/organization/complypay/transacoes" ||
              currentPath === "/organization/complypay/assinaturas" ||
              currentPath === "/organization/complypay/configuracoes",
      icon: <CreditCardIcon size={18} />,
      isSubmenu: true,
      subItems: [
        {
          title: "Dashboard",
          path: "/organization/complypay",
          active: currentPath === "/organization/complypay" || currentPath === "/organization/complypay/dashboard",
          icon: <LayoutDashboard size={16} />
        },
        {
          title: "Faturas",
          path: "/organization/complypay/faturas",
          active: currentPath === "/organization/complypay/faturas",
          icon: <FileText size={16} />
        },
        {
          title: "Transações",
          path: "/organization/complypay/transacoes",
          active: currentPath === "/organization/complypay/transacoes",
          icon: <ArrowRightLeft size={16} />
        },
        {
          title: "Assinaturas",
          path: "/organization/complypay/assinaturas",
          active: currentPath === "/organization/complypay/assinaturas",
          icon: <RefreshCw size={16} />
        },
        {
          title: "Configurações",
          path: "/organization/complypay/configuracoes",
          active: currentPath === "/organization/complypay/configuracoes",
          icon: <Settings size={16} />
        }
      ]
    },
    {
      title: "Vendas Online",
      path: "/organization/vendas",
      active: currentPath === "/organization/vendas" || 
              currentPath.startsWith("/organization/vendas/") ||
              currentPath.startsWith("/organization/pedidos/"),
      icon: <ShoppingCart size={18} />,
      isSubmenu: true,
      subItems: [
        {
          title: "Dashboard Vendas",
          path: "/organization/vendas/dashboard",
          active: currentPath === "/organization/vendas" || currentPath === "/organization/vendas/dashboard",
          icon: <LayoutDashboard size={16} />
        },
        {
          title: "Pedidos de Venda",
          path: "/organization/vendas/pedidos",
          active: currentPath === "/organization/vendas/pedidos" || 
                 currentPath === "/organization/pedidos/pacientes" || 
                 currentPath === "/organization/pedidos",
          icon: <PackageOpen size={16} />
        },
        {
          title: "Produtos",
          path: "/organization/vendas/produtos",
          active: currentPath === "/organization/vendas/produtos",
          icon: <Package size={16} />
        },
        {
          title: "Promoções",
          path: "/organization/vendas/promocoes",
          active: currentPath === "/organization/vendas/promocoes",
          icon: <BadgePercent size={16} />
        },
        {
          title: "Rastreamento",
          path: "/organization/vendas/rastreamento",
          active: currentPath === "/organization/vendas/rastreamento",
          icon: <Truck size={16} />
        }
      ]
    },
    {
      title: "Comunicação",
      path: "/organization/comunicacao",
      active: currentPath === "/organization/comunicacao" || 
              currentPath.startsWith("/organization/comunicacao/"),
      icon: <MessageCircle size={18} />,
      isSubmenu: true,
      subItems: [
        {
          title: "Módulo Comunicação",
          path: "/organization/comunicacao",
          active: currentPath === "/organization/comunicacao" && !currentPath.includes("/organization/comunicacao/"),
          icon: <MessageCircle size={16} />
        },
        {
          title: "Calendário",
          path: "/organization/comunicacao/calendario",
          active: currentPath === "/organization/comunicacao/calendario",
          icon: <CalendarDays size={16} />
        },
        {
          title: "Campanhas de Email",
          path: "/organization/comunicacao/campanhas",
          active: currentPath === "/organization/comunicacao/campanhas",
          icon: <Send size={16} />
        },
        {
          title: "Notificações",
          path: "/organization/comunicacao/notificacoes",
          active: currentPath === "/organization/comunicacao/notificacoes",
          icon: <Bell size={16} />
        },
        {
          title: "Arquivos e Mídias",
          path: "/organization/comunicacao/arquivos",
          active: currentPath === "/organization/comunicacao/arquivos",
          icon: <FileText size={16} />
        },
        {
          title: "Credenciais",
          path: "/organization/comunicacao/credenciais",
          active: currentPath === "/organization/comunicacao/credenciais",
          icon: <ShieldCheck size={16} />
        }
      ]
    },
    
    {
      title: "Carteirinha",
      path: "/organization/carteirinha/membership-cards",
      active: currentPath === "/organization/carteirinha/membership-cards" || 
              currentPath.startsWith("/organization/carteirinha/membership-cards/") ||
              currentPath.startsWith("/organization/carteirinha/partners"),
      icon: <CreditCardIcon size={18} />,
      isSubmenu: true,
      subItems: [
        {
          title: "Carteirinhas",
          path: "/organization/carteirinha/membership-cards",
          active: currentPath === "/organization/carteirinha/membership-cards" && !currentPath.includes("/organization/carteirinha/membership-cards/"),
          icon: <CreditCardIcon size={16} />
        },
        {
          title: "Nova Carteirinha",
          path: "/organization/carteirinha/membership-cards/new",
          active: currentPath === "/organization/carteirinha/membership-cards/new",
          icon: <UserSquare size={16} />
        },
        {
          title: "Parceiros",
          path: "/organization/carteirinha/partners",
          active: currentPath === "/organization/carteirinha/partners" && !currentPath.includes("/organization/carteirinha/partners/"),
          icon: <Store size={16} />
        },
        {
          title: "Novo Parceiro",
          path: "/organization/carteirinha/partners/new",
          active: currentPath === "/organization/carteirinha/partners/new",
          icon: <UserPlus size={16} />
        },
        {
          title: "Configurações",
          path: "/organization/carteirinha/settings",
          active: currentPath === "/organization/carteirinha/settings",
          icon: <Settings size={16} />
        }
      ]
    },
    
    {
      title: "Integrações",
      path: "/organization/integracoes",
      active: currentPath === "/organization/integracoes" || 
              currentPath.startsWith("/organization/integracoes/"),
      icon: <Puzzle size={18} />
    },
    

    
    // Adiciona o módulo de importação como módulo base para importadoras
    ...(isImportCompany ? importModules : [])
  ];
  
  // Configurações da organização - Agora apenas usando a página de perfil
  const configModule = {
    title: "Perfil da Organização",
    path: "/organization/profile",
    active: currentPath === "/organization/profile",
    icon: <User size={18} />
  };
  
  // Módulos pagos (disponíveis conforme o plano ou add-ons)
  const premiumModules = [
    {
      title: "Inteligência Artificial",
      path: "/organization/ai",
      active: currentPath === "/organization/ai" || 
              currentPath.startsWith("/organization/ai/"),
      icon: <Sparkles size={18} />,
      isSubmenu: true,
      badge: {
        text: "Premium",
        variant: "premium"
      },
      subItems: [
        {
          title: "Dashboard IA",
          path: "/organization/ai",
          active: currentPath === "/organization/ai" && !currentPath.includes("/organization/ai/"),
          icon: <LayoutDashboard size={16} />
        },
        {
          title: "Assistente IA",
          path: "/organization/ai/assistant",
          active: currentPath === "/organization/ai/assistant",
          icon: <Bot size={16} />
        },
        {
          title: "Configurações IA",
          path: "/organization/ai/settings",
          active: currentPath === "/organization/ai/settings",
          icon: <Settings size={16} />
        }
      ]
    },
    {
      title: "Cultivo",
      path: "/organization/cultivation",
      active: currentPath === "/organization/cultivation" || 
              currentPath.startsWith("/organization/cultivation/"),
      icon: <Leaf size={18} />,
      isSubmenu: true,
      badge: {
        text: "Premium",
        variant: "premium"
      },
      subItems: [
        {
          title: "Dashboard Cultivo",
          path: "/organization/cultivation",
          active: currentPath === "/organization/cultivation" && 
                  !currentPath.includes("/organization/cultivation/"),
          icon: <LayoutDashboard size={16} />
        },
        {
          title: "Plantas",
          path: "/organization/cultivation/plantas",
          active: currentPath === "/organization/cultivation/plantas" ||
                  currentPath === "/organization/cultivation/plantio" ||
                  currentPath === "/organization/cultivation/colheita",
          icon: <Leaf size={16} />,
          isSubmenu: true,
          subItems: [
            {
              title: "Visão Geral",
              path: "/organization/cultivation/plantas",
              active: currentPath === "/organization/cultivation/plantas",
              icon: <LayoutDashboard size={16} />
            },
            {
              title: "Plantio",
              path: "/organization/cultivation/plantio",
              active: currentPath === "/organization/cultivation/plantio",
              icon: <Leaf size={16} />
            },
            {
              title: "Mudança de Fase",
              path: "/organization/cultivation/mudanca-fase",
              active: currentPath === "/organization/cultivation/mudanca-fase",
              icon: <RefreshCw size={16} />
            },
            {
              title: "Cadastro de Lotes",
              path: "/organization/cultivation/lotes",
              active: currentPath === "/organization/cultivation/lotes",
              icon: <Tag size={16} />
            },
            {
              title: "Colheita",
              path: "/organization/cultivation/colheita",
              active: currentPath === "/organization/cultivation/colheita",
              icon: <Scissors size={16} />
            }
          ]
        },
        {
          title: "Transferências",
          path: "/organization/cultivation/transferencias",
          active: currentPath === "/organization/cultivation/transferencias",
          icon: <ArrowRightLeft size={16} />
        },
        {
          title: "Estoque",
          path: "/organization/cultivation/estoque",
          active: currentPath === "/organization/cultivation/estoque",
          icon: <Package size={16} />
        },
        {
          title: "AuditLog",
          path: "/organization/cultivation/auditlog",
          active: currentPath === "/organization/cultivation/auditlog",
          icon: <FileText size={16} />
        },
        {
          title: "Testes",
          path: "/organization/cultivation/testes",
          active: currentPath === "/organization/cultivation/testes",
          icon: <FlaskConical size={16} />
        },
        {
          title: "Estufas",
          path: "/organization/cultivation/estufas",
          active: currentPath === "/organization/cultivation/estufas",
          icon: <Building2 size={16} />
        },
        {
          title: "Configuração",
          path: "/organization/cultivation/configuracao",
          active: currentPath === "/organization/cultivation/configuracao",
          icon: <Settings size={16} />,
          isSubmenu: true,
          subItems: [
            {
              title: "Strains",
              path: "/organization/cultivation/configuracao/strains",
              active: currentPath === "/organization/cultivation/configuracao/strains",
              icon: <Beaker size={16} />
            },
            {
              title: "Tipos",
              path: "/organization/cultivation/configuracao/tipos",
              active: currentPath === "/organization/cultivation/configuracao/tipos",
              icon: <Shapes size={16} />
            }
          ]
        }
      ]
    },
    {
      title: "Transparência",
      path: "/organization/transparencia/gerenciar",
      active: currentPath === "/organization/transparencia/gerenciar" ||
              currentPath.startsWith("/organization/transparencia/"),
      icon: <FileSearch size={18} />,
      badge: {
        text: "Premium",
        variant: "premium"
      }
    },
    {
      title: "Tarefas",
      path: "/organization/tarefas",
      active: currentPath === "/organization/tarefas" || 
              currentPath.startsWith("/organization/tarefas/"),
      icon: <FileClock size={18} />,
      isSubmenu: true,
      badge: {
        text: "Premium",
        variant: "premium"
      },
      subItems: [
        {
          title: "Dashboard Tarefas",
          path: "/organization/tarefas",
          active: currentPath === "/organization/tarefas" && !currentPath.includes("/organization/tarefas/"),
          icon: <LayoutDashboard size={16} />
        },
        {
          title: "Quadro Kanban",
          path: "/organization/tarefas/quadro",
          active: currentPath === "/organization/tarefas/quadro",
          icon: <Layers size={16} />
        },
        {
          title: "Minhas Tarefas",
          path: "/organization/tarefas/minhas-tarefas",
          active: currentPath === "/organization/tarefas/minhas-tarefas",
          icon: <ClipboardList size={16} />
        },
        {
          title: "Configurações",
          path: "/organization/tarefas/configuracoes",
          active: currentPath === "/organization/tarefas/configuracoes",
          icon: <Settings size={16} />
        }
      ]
    },
    {
      title: "RH",
      path: "/organization/rh",
      active: currentPath === "/organization/rh" || 
              currentPath.startsWith("/organization/rh/"),
      icon: <Users size={18} />,
      isSubmenu: true,
      badge: {
        text: "Premium",
        variant: "premium"
      },
      subItems: [
        {
          title: "Dashboard RH",
          path: "/organization/rh",
          active: currentPath === "/organization/rh" && !currentPath.includes("/organization/rh/"),
          icon: <LayoutDashboard size={16} />
        },
        {
          title: "Colaboradores",
          path: "/organization/rh/colaboradores",
          active: currentPath === "/organization/rh/colaboradores",
          icon: <Users size={16} />
        },
        {
          title: "Documentos RH",
          path: "/organization/rh/documentos",
          active: currentPath === "/organization/rh/documentos",
          icon: <FileText size={16} />
        },
        {
          title: "Escalas de Trabalho",
          path: "/organization/rh/escalas",
          active: currentPath === "/organization/rh/escalas",
          icon: <Calendar size={16} />
        }
      ]
    },
    {
      title: "JURÍDICO",
      path: "/organization/juridico",
      active: currentPath === "/organization/juridico" || 
              currentPath.startsWith("/organization/juridico/"),
      icon: <Scale size={18} />,
      isSubmenu: true,
      badge: {
        text: "Premium",
        variant: "premium"
      },
      subItems: [
        {
          title: "Dashboard Jurídico",
          path: "/organization/juridico",
          active: currentPath === "/organization/juridico" && !currentPath.includes("/organization/juridico/"),
          icon: <LayoutDashboard size={16} />
        },
        {
          title: "Ações Judiciais",
          path: "/organization/juridico/acoes-judiciais",
          active: currentPath === "/organization/juridico/acoes-judiciais",
          icon: <FileText size={16} />
        },
        {
          title: "Documentos Jurídicos",
          path: "/organization/juridico/documentos",
          active: currentPath === "/organization/juridico/documentos",
          icon: <FileText size={16} />
        },
        {
          title: "Compliance",
          path: "/organization/juridico/compliance",
          active: currentPath === "/organization/juridico/compliance",
          icon: <ShieldCheck size={16} />
        }
      ]
    },
    {
      title: "Portal Farmácia",
      path: "/organization/farmacia",
      active: currentPath === "/organization/farmacia" || 
              currentPath.startsWith("/organization/farmacia/"),
      icon: <Pill size={18} />,
      isSubmenu: true,
      badge: {
        text: "Premium",
        variant: "premium"
      },
      subItems: [
        {
          title: "Dashboard Farmácia",
          path: "/organization/farmacia",
          active: currentPath === "/organization/farmacia" && !currentPath.includes("/organization/farmacia/"),
          icon: <LayoutDashboard size={16} />
        },
        {
          title: "Prescrições Pendentes",
          path: "/organization/farmacia/prescricoes-pendentes",
          active: currentPath === "/organization/farmacia/prescricoes-pendentes",
          icon: <Clipboard size={16} />
        },
        {
          title: "Produtos",
          path: "/organization/farmacia/produtos",
          active: currentPath === "/organization/farmacia/produtos",
          icon: <Package size={16} />
        },
        {
          title: "Vendas da Farmácia",
          path: "/organization/farmacia/vendas",
          active: currentPath === "/organization/farmacia/vendas",
          icon: <ShoppingCart size={16} />
        },
        {
          title: "Farmacêuticos",
          path: "/organization/farmacia/farmaceuticos",
          active: currentPath === "/organization/farmacia/farmaceuticos",
          icon: <Users size={16} />
        }
      ]
    },
    {
      title: "Produção Industrial",
      path: "/organization/producao-industrial",
      active: currentPath === "/organization/producao-industrial" || 
              currentPath.startsWith("/organization/producao-industrial/"),
      icon: <Factory size={18} />,
      isSubmenu: true,
      badge: {
        text: "Premium",
        variant: "premium"
      },
      subItems: [
        {
          title: "Dashboard Produção",
          path: "/organization/producao-industrial",
          active: currentPath === "/organization/producao-industrial" && 
                  !currentPath.includes("/organization/producao-industrial/"),
          icon: <LayoutDashboard size={16} />
        },
        {
          title: "Controle de Qualidade",
          path: "/organization/producao-industrial/controle-qualidade",
          active: currentPath === "/organization/producao-industrial/controle-qualidade",
          icon: <Microscope size={16} />
        },
        {
          title: "Garantia de Qualidade",
          path: "/organization/producao-industrial/garantia-qualidade",
          active: currentPath === "/organization/producao-industrial/garantia-qualidade",
          icon: <ShieldCheck size={16} />
        },
        {
          title: "Estoque",
          path: "/organization/producao-industrial/estoque",
          active: currentPath === "/organization/producao-industrial/estoque",
          icon: <PackageOpen size={16} />
        },
        {
          title: "Movimentações",
          path: "/organization/producao-industrial/movimentacoes",
          active: currentPath === "/organization/producao-industrial/movimentacoes",
          icon: <ArrowRightLeft size={16} />
        },
        {
          title: "Ordens de Produção",
          path: "/organization/producao-industrial/ordens-producao",
          active: currentPath === "/organization/producao-industrial/ordens-producao",
          icon: <ClipboardList size={16} />
        },
        {
          title: "Descartes",
          path: "/organization/producao-industrial/descartes",
          active: currentPath === "/organization/producao-industrial/descartes",
          icon: <Trash2 size={16} />
        },
        {
          title: "Rastreabilidade",
          path: "/organization/producao-industrial/rastreabilidade",
          active: currentPath === "/organization/producao-industrial/rastreabilidade",
          icon: <FileSearch size={16} />
        },
        {
          title: "Catálogo de Produtos",
          path: "/organization/producao-industrial/catalogo-produtos",
          active: currentPath === "/organization/producao-industrial/catalogo-produtos",
          icon: <BookOpen size={16} />
        },
        {
          title: "Extração",
          path: "/organization/producao-industrial/extracao",
          active: currentPath === "/organization/producao-industrial/extracao",
          icon: <Beaker size={16} />
        },
        {
          title: "Diluição",
          path: "/organization/producao-industrial/diluicao",
          active: currentPath === "/organization/producao-industrial/diluicao",
          icon: <Droplet size={16} />
        },
        {
          title: "Envase",
          path: "/organization/producao-industrial/envase",
          active: currentPath === "/organization/producao-industrial/envase",
          icon: <PackageCheck size={16} />
        },
        {
          title: "Rotulagem",
          path: "/organization/producao-industrial/rotulagem",
          active: currentPath === "/organization/producao-industrial/rotulagem",
          icon: <Tag size={16} />
        },
        {
          title: "Estoque Distribuição",
          path: "/organization/producao-industrial/estoque-distribuicao",
          active: currentPath === "/organization/producao-industrial/estoque-distribuicao",
          icon: <PackagePlus size={16} />
        }
      ]
    }
  ];
  
  // Módulos Enterprise (disponíveis apenas no plano Enterprise)
  const enterpriseModules = [
    {
      title: "Portal do Fornecedor",
      path: "/organization/suppliers",
      active: currentPath === "/organization/suppliers" || 
              currentPath.startsWith("/organization/suppliers/"),
      icon: <Store size={18} className="text-red-500" />,
      isSubmenu: true,
      badge: {
        text: "Enterprise",
        variant: "enterprise"
      },
      subItems: [
        {
          title: "Dashboard",
          path: "/organization/suppliers",
          active: currentPath === "/organization/suppliers" && !currentPath.includes("/organization/suppliers/"),
          icon: <LayoutDashboard size={16} />
        },
        {
          title: "Cadastrar Fornecedor",
          path: "/organization/suppliers/register",
          active: currentPath === "/organization/suppliers/register",
          icon: <UserPlus size={16} />
        },
        {
          title: "Catálogo de Produtos",
          path: "/organization/suppliers/products",
          active: currentPath === "/organization/suppliers/products",
          icon: <ShoppingCart size={16} />
        },
        {
          title: "Licitações",
          path: "/organization/suppliers/tenders",
          active: currentPath === "/organization/suppliers/tenders",
          icon: <FileText size={16} />
        },
        {
          title: "Pedidos",
          path: "/organization/suppliers/orders",
          active: currentPath === "/organization/suppliers/orders",
          icon: <Package size={16} />
        },
        {
          title: "Carrinho de Compras",
          path: "/organization/suppliers/cart",
          active: currentPath === "/organization/suppliers/cart",
          icon: <ShoppingBag size={16} className="text-red-500" />
        },
      ]
    },
    {
      title: "Compras e Estoque",
      path: "/organization/compras",
      active: currentPath === "/organization/compras" || 
              currentPath.startsWith("/organization/compras/"),
      icon: <ShoppingCart size={18} />,
      isSubmenu: true,
      badge: {
        text: "Enterprise",
        variant: "enterprise"
      },
      subItems: [
        {
          title: "Dashboard Compras",
          path: "/organization/compras",
          active: currentPath === "/organization/compras" && !currentPath.includes("/organization/compras/"),
          icon: <LayoutDashboard size={16} />
        },
        {
          title: "Solicitações",
          path: "/organization/compras/solicitacoes",
          active: currentPath === "/organization/compras/solicitacoes",
          icon: <ClipboardList size={16} />
        },
        {
          title: "Pedidos de Compra",
          path: "/organization/compras/pedidos",
          active: currentPath === "/organization/compras/pedidos",
          icon: <PackageCheck size={16} />
        },
        {
          title: "Fornecedores",
          path: "/organization/compras/fornecedores",
          active: currentPath === "/organization/compras/fornecedores",
          icon: <Truck size={16} />
        },
        {
          title: "Estoque",
          path: "/organization/compras/estoque",
          active: currentPath === "/organization/compras/estoque",
          icon: <Package size={16} />
        },
        {
          title: "Acessar Patrimônio",
          path: "/organization/patrimonio",
          active: currentPath === "/organization/patrimonio" || 
                 currentPath.startsWith("/organization/patrimonio/"),
          icon: <Building2 size={16} />
        }
      ]
    },
    {
      title: "Patrimônio",
      path: "/organization/patrimonio",
      active: currentPath.startsWith("/organization/patrimonio"),
      icon: <Building2 size={18} />,
      isSubmenu: true,
      badge: {
        text: "Enterprise",
        variant: "enterprise"
      },
      subItems: [
        {
          title: "Dashboard",
          path: "/organization/patrimonio",
          active: currentPath === "/organization/patrimonio" && !currentPath.includes("/organization/patrimonio/"),
          icon: <LayoutDashboard size={16} />
        },
        {
          title: "Ativos",
          path: "/organization/patrimonio/ativos",
          active: currentPath === "/organization/patrimonio/ativos" || currentPath === "/organization/patrimonio/ativos/novo",
          icon: <Package size={16} />
        },
        {
          title: "Instalações",
          path: "/organization/patrimonio/instalacoes",
          active: currentPath === "/organization/patrimonio/instalacoes",
          icon: <Building size={16} />
        },
        {
          title: "Manutenções",
          path: "/organization/patrimonio/manutencoes",
          active: currentPath === "/organization/patrimonio/manutencoes",
          icon: <Wrench size={16} />
        },
        {
          title: "Depreciação",
          path: "/organization/patrimonio/depreciacao",
          active: currentPath === "/organization/patrimonio/depreciacao",
          icon: <Calculator size={16} />
        }
      ]
    },
    {
      title: "Portal Médico",
      path: "/organization/medical-portal",
      active: currentPath === "/organization/medical-portal" || 
              currentPath.startsWith("/organization/medical-portal/"),
      icon: <HeartPulse size={18} />,
      isSubmenu: true,
      badge: {
        text: "Enterprise",
        variant: "enterprise"
      },
      subItems: [
        {
          title: "Dashboard Médico",
          path: "/organization/medical-portal",
          active: currentPath === "/organization/medical-portal" && !currentPath.includes("/organization/medical-portal/"),
          icon: <LayoutDashboard size={16} />
        },
        {
          title: "Pacientes",
          path: "/organization/medical-portal/patients",
          active: currentPath === "/organization/medical-portal/patients",
          icon: <Users size={16} />
        },
        {
          title: "Prescrições",
          path: "/organization/medical-portal/prescriptions",
          active: currentPath === "/organization/medical-portal/prescriptions",
          icon: <FileText size={16} />
        },
        {
          title: "Agenda",
          path: "/organization/medical-portal/agenda",
          active: currentPath === "/organization/medical-portal/agenda",
          icon: <CalendarDays size={16} />
        },
        {
          title: "Configurações",
          path: "/organization/medical-portal/settings",
          active: currentPath === "/organization/medical-portal/settings",
          icon: <Settings size={16} />
        }
      ]
    },
    {
      title: "Gerenciamento Médico",
      path: "/organization/doctor-management",
      active: currentPath === "/organization/doctor-management" || 
              currentPath.startsWith("/organization/doctor-management/"),
      icon: <Stethoscope size={18} />,
      isSubmenu: true,
      badge: {
        text: "Enterprise",
        variant: "enterprise"
      },
      subItems: [
        {
          title: "Dashboard",
          path: "/organization/doctor-management",
          active: currentPath === "/organization/doctor-management" && !currentPath.includes("/organization/doctor-management/"),
          icon: <LayoutDashboard size={16} />
        },
        {
          title: "Médicos",
          path: "/organization/doctor-management/doctors",
          active: currentPath === "/organization/doctor-management/doctors",
          icon: <UserCog size={16} />
        },
        {
          title: "Prescrições",
          path: "/organization/doctor-management/prescriptions",
          active: currentPath === "/organization/doctor-management/prescriptions",
          icon: <FileText size={16} />
        },
        {
          title: "Agendamentos",
          path: "/organization/doctor-management/appointments",
          active: currentPath === "/organization/doctor-management/appointments",
          icon: <CalendarCheck size={16} />
        },
        {
          title: "Documentos",
          path: "/organization/doctor-management/documents",
          active: currentPath === "/organization/doctor-management/documents",
          icon: <FileText size={16} />
        },
        {
          title: "Educação Médica",
          path: "/organization/doctor-management/education",
          active: currentPath === "/organization/doctor-management/education",
          icon: <GraduationCap size={16} />
        },
        {
          title: "Estatísticas",
          path: "/organization/doctor-management/statistics",
          active: currentPath === "/organization/doctor-management/statistics",
          icon: <BarChart3 size={16} />
        },
        {
          title: "Afiliação",
          path: "/organization/doctor-management/afiliacao",
          active: currentPath === "/organization/doctor-management/afiliacao",
          icon: <Users size={16} />
        }
      ]
    },
    {
      title: "Inteligência Artificial",
      path: "/organization/ai",
      active: currentPath === "/organization/ai" || 
              currentPath.startsWith("/organization/ai/"),
      icon: <Cpu size={18} />,
      isSubmenu: true,
      subItems: [
        {
          title: "Dashboard IA",
          path: "/organization/ai",
          active: currentPath === "/organization/ai" && !currentPath.includes("/organization/ai/"),
          icon: <LayoutDashboard size={16} />
        },
        {
          title: "Assistente",
          path: "/organization/ai/assistant",
          active: currentPath === "/organization/ai/assistant",
          icon: <MessageSquare size={16} />
        },
        {
          title: "Análises",
          path: "/organization/ai/analysis",
          active: currentPath === "/organization/ai/analysis",
          icon: <BarChart3 size={16} />
        },
        {
          title: "Configurações",
          path: "/organization/ai/settings",
          active: currentPath === "/organization/ai/settings",
          icon: <Settings size={16} />
        }
      ]
    },
    {
      title: "Pesquisa Científica",
      path: "/organization/pesquisa",
      active: currentPath === "/organization/pesquisa" || 
              currentPath.startsWith("/organization/pesquisa/"),
      icon: <FlaskConical size={18} />,
      isSubmenu: true,
      badge: {
        text: "Enterprise",
        variant: "enterprise"
      },
      subItems: [
        {
          title: "Dashboard Pesquisa",
          path: "/organization/pesquisa",
          active: currentPath === "/organization/pesquisa" && !currentPath.includes("/organization/pesquisa/"),
          icon: <LayoutDashboard size={16} />
        },
        {
          title: "Estudos",
          path: "/organization/pesquisa/estudos",
          active: currentPath === "/organization/pesquisa/estudos" || 
                  currentPath.includes("/organization/pesquisa/estudos/") &&
                  !currentPath.includes("/organization/pesquisa/estudos/novo"),
          icon: <ClipboardList size={16} />
        },
        {
          title: "Novo Estudo",
          path: "/organization/pesquisa/estudos/novo",
          active: currentPath === "/organization/pesquisa/estudos/novo",
          icon: <FilePlus size={16} />
        },
        {
          title: "Publicações",
          path: "/organization/pesquisa/publicacoes",
          active: currentPath === "/organization/pesquisa/publicacoes" ||
                  currentPath.includes("/organization/pesquisa/publicacoes/"),
          icon: <BookOpen size={16} />
        },
        {
          title: "Colaborações",
          path: "/organization/pesquisa/colaboracoes",
          active: currentPath === "/organization/pesquisa/colaboracoes" ||
                  currentPath.includes("/organization/pesquisa/colaboracoes/"),
          icon: <Users size={16} />
        }
      ]
    }
  ];
  
  // Definir arrays vazios para módulos que não foram declarados ainda
  const financialModules = [];
  const communicationModules = [];
  const purchaseStockModules = [];
  const hrModules = [];
  const legalModules = [];
  const salesModules = [];
  const patrimonioModules = [];
  const taskModules = [];
  
  // Todos os módulos pagos disponíveis
  const paidModules = [
    ...premiumModules,
    ...enterpriseModules,
    ...importModules,
    ...pharmacyModules
  ];
  
  // Filtragem de módulos baseada no tipo de organização
  const filteredPaidModules = paidModules.filter(module => {
    if (isImportCompany && module && module.title) {
      // Remove módulos não relevantes para importadoras
      return !module.title.includes("Cultivo") && 
             !module.title.includes("Produção Industrial") && 
             !module.title.includes("Transparência") &&
             !module.title.includes("Portal") &&
             !module.title.includes("Anuidade");
    }
    return true;
  });
  
  return (
    <div className={cn(
      "flex flex-col h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300",
      collapsed ? "w-16" : "w-56 lg:w-64"
    )}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        {!collapsed ? (
          <div className="flex items-center truncate">
            {isOrgLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            ) : (
              <>
                {organization?.logoUrl ? (
                  <img 
                    src={organization.logoUrl} 
                    alt={organization?.name || "Logo"} 
                    className="h-8 w-8 rounded mr-2"
                  />
                ) : (
                  <Leaf className="h-6 w-6 text-green-600 dark:text-green-400 mr-2" />
                )}
                <span className="text-sm font-semibold truncate" style={{ maxWidth: "150px" }}>
                  {organization?.name || user?.organizationId ? (
                    // Se temos a organização ou seu ID, mostramos o nome ou "Minha Organização"
                    <span>{organization?.name || (
                      // Para o caso de hempmeds com ID 32
                      user?.organizationId === 32 ? 'hempmeds' : 'Minha Organização'
                    )}</span>
                  ) : (
                    <div className="flex items-center">
                      <span>Endurancy</span>
                      <span className="ml-1 px-1 py-0.5 text-[0.6rem] font-medium bg-blue-100 text-blue-700 rounded">Beta</span>
                    </div>
                  )}
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="mx-auto">
            {user?.role === "doctor" || user?.role === "pharmacist" || user?.role === "admin" || user?.role === "manager" ? (
              <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">
                  {user.role === "doctor" ? "M" : user.role === "pharmacist" ? "F" : "A"}
                </span>
              </div>
            ) : (
              <Leaf className="h-6 w-6 text-green-600 dark:text-green-400" />
            )}
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
          title={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? <ChevronLeft size={16} /> : <Menu size={16} />}
        </button>
      </div>
      
      <div className="flex-1 overflow-hidden py-2">
        <div 
          className="h-full overflow-y-auto custom-scrollbar" 
          style={{ maxHeight: "calc(100vh - 200px)", scrollBehavior: "smooth" }}
          onScroll={(e) => {
            // Salva a posição atual de rolagem
            const scrollPos = e.currentTarget.scrollTop;
            setScrollPosition(scrollPos);
            localStorage.setItem('sidebarScrollPos', scrollPos.toString());
          }}>
        {/* Seção de módulos gratuitos */}
        <div className="mb-4">
          {collapsed ? null : (
            <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Módulos Base
            </h3>
          )}
          
          {freeModules.map((item, index) => (
            <SidebarMenuItem
              key={`free-${index}`}
              item={item}
              expandedMenu={expandedMenu}
              toggleSubmenu={toggleSubmenu}
              closeSubmenu={closeSubmenu}
              navigateTo={navigateTo}
              openSubmenu={openSubmenu}
              collapsed={collapsed}
            />
          ))}
        </div>
        
        {/* Gerenciamento Médico foi movido para módulos Enterprise */}
        
        {/* Portal Médico (apenas para médicos) */}
        {(user?.role === "doctor") && (
          <div className="mb-4">
            {collapsed ? null : (
              <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Portal Médico
              </h3>
            )}
            
            {medicalModules.map((item, index) => (
              <SidebarMenuItem
                key={`medical-${index}`}
                item={item}
                expandedMenu={expandedMenu}
                toggleSubmenu={toggleSubmenu}
                closeSubmenu={closeSubmenu}
                navigateTo={navigateTo}
                openSubmenu={openSubmenu}
                collapsed={collapsed}
              />
            ))}
          </div>
        )}
        
        {/* Portal Farmácia foi movido para os módulos premium */}
        
        {/* Seção de módulos premium */}
        <div className="mb-4">
          {collapsed ? null : (
            <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Módulos Premium
            </h3>
          )}
          {/* Módulo de importação movido para módulos base */}
          
          {/* Módulos premium filtrados - remove módulos não relevantes para importadoras */}
          {premiumModules
            .filter(item => !isImportCompany || 
              (item && item.title && 
               !item.title.includes("Cultivo") && 
               !item.title.includes("Produção Industrial") && 
               !item.title.includes("Transparência") && 
               !item.title.includes("Portal") &&
               !item.title.includes("Anuidade")))
            .map((item, index) => (
              <SidebarMenuItem
                key={`premium-${index}`}
                item={item}
                expandedMenu={expandedMenu}
                toggleSubmenu={toggleSubmenu}
                closeSubmenu={closeSubmenu}
                navigateTo={navigateTo}
                openSubmenu={openSubmenu}
                collapsed={collapsed}
              />
            ))}
        </div>
        
        {/* Seção de módulos enterprise */}
        <div className="mb-4">
          {collapsed ? null : (
            <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Módulos Enterprise
            </h3>
          )}
          {/* Módulos enterprise filtrados - remove módulos não relevantes para importadoras */}
          {enterpriseModules
            .filter(item => !isImportCompany || 
              (item && item.title && 
               !item.title.includes("Cultivo") && 
               !item.title.includes("Produção Industrial") && 
               !item.title.includes("Transparência") &&
               !item.title.includes("Portal") &&
               !item.title.includes("Anuidade")))
            .map((item, index) => (
              <SidebarMenuItem
                key={`enterprise-${index}`}
                item={item}
                expandedMenu={expandedMenu}
                toggleSubmenu={toggleSubmenu}
                closeSubmenu={closeSubmenu}
                navigateTo={navigateTo}
                openSubmenu={openSubmenu}
                collapsed={collapsed}
              />
            ))}
        </div>
        
        {/* Configurações */}
        <div className="mb-4">
          {collapsed ? null : (
            <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Configurações
            </h3>
          )}
          
          <SidebarMenuItem
            item={configModule}
            expandedMenu={expandedMenu}
            toggleSubmenu={toggleSubmenu}
            closeSubmenu={closeSubmenu}
            navigateTo={navigateTo}
            openSubmenu={openSubmenu}
            collapsed={collapsed}
          />
        </div>
        </div>
      </div>
      
      {/* Rodapé do sidebar */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        {!collapsed ? (
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profilePhoto || ""} />
                <AvatarFallback>{user?.name ? user.name.substring(0, 2).toUpperCase() : "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium dark:text-white truncate" style={{ maxWidth: "120px" }}>
                  {user?.name || "Usuário"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate" style={{ maxWidth: "120px" }}>
                  {user?.email || ""}
                </p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="rounded-md p-1.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => logout()}
            className="w-full flex justify-center rounded-md p-1.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </div>
  );
}