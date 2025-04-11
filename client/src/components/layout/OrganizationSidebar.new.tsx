import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, Users, Package, ClipboardList, 
  Receipt, Settings, MessageSquare, BellRing, 
  CalendarDays, FileText, BookOpen, HelpCircle, 
  Menu, ChevronLeft, ChevronDown, LogOut, Leaf, Loader2,
  Brain, Truck, ShoppingCart, CreditCard, DollarSign,
  Landmark, HeartPulse, BadgeHelp, Users2, Briefcase,
  Scale, LineChart, MessageCircle, Building, TestTube,
  Clipboard, FileClock, Share2, Send, Network, 
  Plane, Mailbox, Wallet, Bot, Puzzle, CreditCard as CreditCardIcon,
  PackageOpen, BadgePercent, Printer, QrCode, Box, Pill,
  Factory, ShieldCheck, Microscope, FileSearch, Beaker, Droplet,
  PackageCheck, Tag, PackagePlus, Scissors, ScrollText, Library, Check, Ban,
  BarChart4, Layers, ArrowRightLeft, FileBarChart, HeartHandshake, Shapes,
  UserPlus, Target, GraduationCap, Video, CircleDollarSign, Home, Map,
  HandCoins, Bell, Calendar, Radio, Headphones, Phone, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Organization } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarMenuItem } from "./SidebarMenuItem";

export default function OrganizationSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  // Listen for path changes
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  
  // Carregar dados da organização se o usuário estiver autenticado e tiver um organizationId
  const { data: organization, isLoading: isOrgLoading } = useQuery({
    queryKey: ['/api/organizations', user?.organizationId],
    enabled: !!user?.organizationId,
  });

  // Function to navigate to a path, ensuring session is maintained
  const navigateTo = (path: string) => {
    // Primeiro verifica se o usuário está autenticado
    if (!user) {
      console.log("Tentando navegar sem autenticação. Redirecionando para login");
      window.location.href = '/login';
      return;
    }
    
    // Se autenticado, usa o método de navegação mais seguro
    try {
      console.log(`Navegando para: ${path}`);
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    } catch (error) {
      console.error("Erro na navegação:", error);
      // Fallback para método mais direto em caso de erro
      window.location.href = path;
    }
  };

  // Estado para controlar os submenus expandidos
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  
  // Função para alternar a exibição de um submenu
  const toggleSubmenu = (menuTitle: string, event: React.MouseEvent) => {
    event.stopPropagation();
    console.log("Toggle submenu:", menuTitle, "Current expanded:", expandedMenu);
    if (expandedMenu === menuTitle) {
      setExpandedMenu(null);
      console.log("Fechando submenu:", menuTitle);
    } else {
      setExpandedMenu(menuTitle);
      console.log("Abrindo submenu:", menuTitle);
    }
  };
  
  // Função para fechar um submenu específico
  const closeSubmenu = (event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedMenu(null);
    console.log("Fechando todos os submenus");
  };
  
  // Função para forçar a abertura do submenu sem fechá-lo
  const openSubmenu = (menuTitle: string) => {
    console.log("Forçando abertura de submenu:", menuTitle);
    setExpandedMenu(menuTitle);
  };
  
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
      title: "Financeiro",
      path: "/organization/financial",
      active: currentPath === "/organization/financial",
      icon: <DollarSign size={18} />
    },
    {
      title: "ComplyPay",
      path: "/organization/complypay",
      active: currentPath === "/organization/complypay",
      icon: <Wallet size={18} />
    },
    {
      title: "Vendas",
      path: "/organization/vendas",
      active: currentPath === "/organization/vendas" || 
              currentPath === "/organization/sales" ||
              currentPath === "/organization/gerenciar-produtos" ||
              currentPath === "/organization/dashboard-vendas" || 
              currentPath === "/organization/relatorio-vendas" ||
              currentPath === "/organization/pedidos" || 
              currentPath === "/organization/produtos" || 
              currentPath === "/organization/promocoes" || 
              currentPath === "/organization/rastreamento",
      icon: <ShoppingCart size={18} />,
      isSubmenu: true,
      subItems: [
        {
          title: "Dashboard Vendas",
          path: "/organization/dashboard-vendas",
          active: currentPath === "/organization/dashboard-vendas",
          icon: <LayoutDashboard size={16} />
        },
        {
          title: "Pedidos",
          path: "/organization/pedidos",
          active: currentPath === "/organization/pedidos",
          icon: <PackageOpen size={16} />
        },
        {
          title: "Produtos",
          path: "/organization/produtos",
          active: currentPath === "/organization/produtos",
          icon: <Package size={16} />
        },
        {
          title: "Promoções",
          path: "/organization/promocoes",
          active: currentPath === "/organization/promocoes",
          icon: <BadgePercent size={16} />
        },
        {
          title: "Rastreamento",
          path: "/organization/rastreamento",
          active: currentPath === "/organization/rastreamento",
          icon: <Truck size={16} />
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
          title: "Preparação de Pedidos",
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
        }
      ]
    },
    {
      title: "ChatGPT AI",
      path: "/organization/ai",
      active: currentPath === "/organization/ai",
      icon: <Bot size={18} />
    }
  ];
  
  // Configurações da organização
  const configModule = {
    title: "Configurações",
    path: "/organization/settings",
    active: currentPath === "/organization/settings" || currentPath.startsWith("/organization/settings") || 
            currentPath.startsWith("/organization/integrations"),
    icon: <Settings size={18} />
  };
  
  // Módulos pagos (disponíveis conforme o plano ou add-ons)
  const premiumModules = [
    {
      title: "Tarefas",
      path: "/organization/tasks",
      active: currentPath === "/organization/tasks",
      icon: <FileClock size={18} />,
      isSubmenu: true,
      subItems: [
        {
          title: "Todas as Tarefas",
          path: "/organization/tasks",
          active: currentPath === "/organization/tasks",
          icon: <FileClock size={16} />
        },
        {
          title: "Criar Nova Tarefa",
          path: "/organization/tasks/create",
          active: currentPath === "/organization/tasks/create",
          icon: <ClipboardList size={16} />
        }
      ]
    },
    {
      title: "Social",
      path: "/organization/social",
      active: currentPath === "/organization/social",
      icon: <Users2 size={18} />,
      isSubmenu: true,
      subItems: [
        {
          title: "Feed Social",
          path: "/organization/social",
          active: currentPath === "/organization/social",
          icon: <MessageCircle size={16} />
        },
        {
          title: "Comunidade",
          path: "/organization/social/community",
          active: currentPath === "/organization/social/community",
          icon: <Users2 size={16} />
        },
        {
          title: "Mensagens",
          path: "/organization/social/messages",
          active: currentPath === "/organization/social/messages",
          icon: <MessageSquare size={16} />
        }
      ]
    },
    {
      title: "Cultivo",
      path: "/organization/cultivation",
      active: currentPath === "/organization/cultivation",
      icon: <Leaf size={18} />,
      isSubmenu: true,
      subItems: [
        {
          title: "Dashboard Cultivo",
          path: "/organization/cultivation",
          active: currentPath === "/organization/cultivation",
          icon: <LayoutDashboard size={16} />
        },
        {
          title: "Plantio",
          path: "/organization/cultivation/plantio",
          active: currentPath === "/organization/cultivation/plantio",
          icon: <Leaf size={16} />
        },
        {
          title: "Colheita",
          path: "/organization/cultivation/colheita",
          active: currentPath === "/organization/cultivation/colheita",
          icon: <Scissors size={16} />
        },
        {
          title: "Análises",
          path: "/organization/cultivation/analises",
          active: currentPath === "/organization/cultivation/analises",
          icon: <LineChart size={16} />
        },
        {
          title: "Estoque",
          path: "/organization/cultivation/estoque",
          active: currentPath === "/organization/cultivation/estoque",
          icon: <Package size={16} />
        }
      ]
    },
    {
      title: "Compras e Estoque",
      path: "/organization/purchases-inventory",
      active: currentPath === "/organization/purchases-inventory" || currentPath.startsWith("/organization/purchases-inventory/"),
      icon: <ShoppingCart size={18} />,
      isSubmenu: true,
      subItems: [
        {
          title: "Dashboard Compras",
          path: "/organization/purchases-inventory",
          active: currentPath === "/organization/purchases-inventory" && !currentPath.includes("/organization/purchases-inventory/"),
          icon: <LayoutDashboard size={16} />
        },
        {
          title: "Fornecedores",
          path: "/organization/purchases-inventory/fornecedores",
          active: currentPath === "/organization/purchases-inventory/fornecedores",
          icon: <Truck size={16} />
        },
        {
          title: "Ordens de Compra",
          path: "/organization/purchases-inventory/ordens",
          active: currentPath === "/organization/purchases-inventory/ordens",
          icon: <ScrollText size={16} />
        },
        {
          title: "Catálogo de Produtos",
          path: "/organization/purchases-inventory/catalogo",
          active: currentPath === "/organization/purchases-inventory/catalogo",
          icon: <Library size={16} />
        },
        {
          title: "Estoque",
          path: "/organization/purchases-inventory/estoque",
          active: currentPath === "/organization/purchases-inventory/estoque",
          icon: <Package size={16} />
        }
      ]
    },
    {
      title: "Jurídico",
      path: "/organization/legal",
      active: currentPath === "/organization/legal" || currentPath.startsWith("/organization/legal/"),
      icon: <Scale size={18} />,
      isSubmenu: true,
      subItems: [
        {
          title: "Dashboard Jurídico",
          path: "/organization/legal",
          active: currentPath === "/organization/legal" && !currentPath.includes("/organization/legal/"),
          icon: <LayoutDashboard size={16} />
        },
        {
          title: "Contratos",
          path: "/organization/legal/contratos",
          active: currentPath === "/organization/legal/contratos",
          icon: <FileText size={16} />
        },
        {
          title: "Compliance",
          path: "/organization/legal/compliance",
          active: currentPath === "/organization/legal/compliance",
          icon: <Check size={16} />
        },
        {
          title: "Regulação",
          path: "/organization/legal/regulacao",
          active: currentPath === "/organization/legal/regulacao",
          icon: <Ban size={16} />
        },
        {
          title: "Processos",
          path: "/organization/legal/processos",
          active: currentPath === "/organization/legal/processos",
          icon: <FileBarChart size={16} />
        }
      ]
    },
    {
      title: "RH",
      path: "/organization/hr",
      active: currentPath === "/organization/hr" || currentPath.startsWith("/organization/hr/"),
      icon: <Briefcase size={18} />,
      isSubmenu: true,
      subItems: [
        {
          title: "Dashboard RH",
          path: "/organization/hr",
          active: currentPath === "/organization/hr" && !currentPath.includes("/organization/hr/"),
          icon: <LayoutDashboard size={16} />
        },
        {
          title: "Funcionários",
          path: "/organization/hr/funcionarios",
          active: currentPath === "/organization/hr/funcionarios",
          icon: <Users size={16} />
        },
        {
          title: "Contratações",
          path: "/organization/hr/contratacoes",
          active: currentPath === "/organization/hr/contratacoes",
          icon: <UserPlus size={16} />
        },
        {
          title: "Folha de Pagamento",
          path: "/organization/hr/folha-pagamento",
          active: currentPath === "/organization/hr/folha-pagamento",
          icon: <DollarSign size={16} />
        },
        {
          title: "Treinamentos",
          path: "/organization/hr/treinamentos",
          active: currentPath === "/organization/hr/treinamentos",
          icon: <GraduationCap size={16} />
        }
      ]
    },
    {
      title: "Pesquisa Científica",
      path: "/organization/research",
      active: currentPath === "/organization/research" || currentPath.startsWith("/organization/research/"),
      icon: <Microscope size={18} />,
      isSubmenu: true,
      subItems: [
        {
          title: "Dashboard Pesquisa",
          path: "/organization/research",
          active: currentPath === "/organization/research" && !currentPath.includes("/organization/research/"),
          icon: <LayoutDashboard size={16} />
        },
        {
          title: "Experimentos",
          path: "/organization/research/experimentos",
          active: currentPath === "/organization/research/experimentos",
          icon: <TestTube size={16} />
        },
        {
          title: "Resultados",
          path: "/organization/research/resultados",
          active: currentPath === "/organization/research/resultados",
          icon: <LineChart size={16} />
        },
        {
          title: "Publicações",
          path: "/organization/research/publicacoes",
          active: currentPath === "/organization/research/publicacoes",
          icon: <BookOpen size={16} />
        }
      ]
    },
    {
      title: "Grupo Produção Industrial",
      path: "/organization/producao-industrial",
      active: currentPath === "/organization/producao-industrial" || 
              currentPath.startsWith("/organization/producao-industrial"),
      icon: <Factory size={18} />,
      isSubmenu: true,
      subItems: [
        {
          title: "Dashboard Produção",
          path: "/organization/producao-industrial",
          active: currentPath === "/organization/producao-industrial" && !currentPath.includes("/organization/producao-industrial/"),
          icon: <LayoutDashboard size={16} />
        },
        {
          title: "Garantia da Qualidade",
          path: "/organization/producao-industrial/garantia-qualidade",
          active: currentPath === "/organization/producao-industrial/garantia-qualidade",
          icon: <ShieldCheck size={16} />
        },
        {
          title: "Controle de Qualidade",
          path: "/organization/producao-industrial/controle-qualidade",
          active: currentPath === "/organization/producao-industrial/controle-qualidade",
          icon: <Microscope size={16} />
        },
        {
          title: "Trilha de Auditoria",
          path: "/organization/producao-industrial/trilha-auditoria",
          active: currentPath === "/organization/producao-industrial/trilha-auditoria",
          icon: <FileSearch size={16} />
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
          title: "Estoque para Distribuição",
          path: "/organization/producao-industrial/estoque-distribuicao",
          active: currentPath === "/organization/producao-industrial/estoque-distribuicao",
          icon: <PackagePlus size={16} />
        }
      ]
    }
  ];
  
  // Menus do portal médico
  const medicalModules = [
    {
      title: "Portal Médico",
      path: "/organization/medical-portal",
      active: currentPath === "/organization/medical-portal" || 
              currentPath.startsWith("/organization/medical-portal"),
      icon: <HeartPulse size={18} />,
      isSubmenu: true,
      subItems: [
        {
          title: "Dashboard Médico",
          path: "/organization/medical-portal",
          active: currentPath === "/organization/medical-portal" && !currentPath.includes("/organization/medical-portal/"),
          icon: <LayoutDashboard size={16} />
        },
        {
          title: "Pacientes",
          path: "/organization/medical-portal/pacientes",
          active: currentPath === "/organization/medical-portal/pacientes",
          icon: <Users size={16} />
        },
        {
          title: "Prescrições",
          path: "/organization/medical-portal/prescriptions",
          active: currentPath === "/organization/medical-portal/prescriptions",
          icon: <FileText size={16} />
        },
        {
          title: "Documentos",
          path: "/organization/medical-portal/documents",
          active: currentPath === "/organization/medical-portal/documents",
          icon: <FileText size={16} />
        },
        {
          title: "Agenda",
          path: "/organization/medical-portal/agenda",
          active: currentPath === "/organization/medical-portal/agenda",
          icon: <CalendarDays size={16} />
        },
        {
          title: "Finanças",
          path: "/organization/medical-portal/financas",
          active: currentPath === "/organization/medical-portal/financas",
          icon: <DollarSign size={16} />
        }
      ]
    }
  ];
  
  // Menus da farmácia
  const pharmacyModules = [
    {
      title: "Farmácia",
      path: "/organization/farmacia",
      active: currentPath === "/organization/farmacia" || 
              currentPath.startsWith("/organization/farmacia"),
      icon: <Pill size={18} />,
      isSubmenu: true,
      subItems: [
        {
          title: "Dashboard Farmácia",
          path: "/organization/farmacia",
          active: currentPath === "/organization/farmacia" && !currentPath.includes("/organization/farmacia/"),
          icon: <LayoutDashboard size={16} />
        },
        {
          title: "Prescrições",
          path: "/organization/farmacia/prescriptions",
          active: currentPath === "/organization/farmacia/prescriptions",
          icon: <ScrollText size={16} />
        },
        {
          title: "Estoque",
          path: "/organization/farmacia/estoque",
          active: currentPath === "/organization/farmacia/estoque",
          icon: <Package size={16} />
        },
        {
          title: "Vendas",
          path: "/organization/farmacia/vendas",
          active: currentPath === "/organization/farmacia/vendas",
          icon: <ShoppingCart size={16} />
        },
        {
          title: "Relatórios",
          path: "/organization/farmacia/relatorios",
          active: currentPath === "/organization/farmacia/relatorios",
          icon: <BarChart4 size={16} />
        },
        {
          title: "Farmacêuticos",
          path: "/organization/farmacia/farmaceuticos",
          active: currentPath === "/organization/farmacia/farmaceuticos",
          icon: <Users size={16} />
        }
      ]
    }
  ];
  
  // Todos os módulos
  const allModules = [
    ...freeModules,
    ...medicalModules,
    ...pharmacyModules,
    ...premiumModules, 
    configModule
  ];
  
  // Get avatar initials from organization name or user name
  const getAvatarInitials = () => {
    if (organization?.name) {
      return organization.name.substring(0, 2).toUpperCase();
    } else if (user?.name) {
      return user.name.substring(0, 2).toUpperCase();
    }
    return "OR";
  };

  return (
    <div 
      className={cn(
        "flex flex-col h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        {!collapsed && (
          <div className="flex items-center space-x-2 overflow-hidden">
            <Avatar className="h-8 w-8">
              <AvatarImage src={organization?.logoUrl || "/logo-placeholder.png"} />
              <AvatarFallback>{getAvatarInitials()}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate dark:text-white">
                {isOrgLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  organization?.name || "Organização"
                )}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.role === "admin" ? "Administrador" : 
                 user?.role === "org_admin" ? "Admin da Organização" : 
                 user?.role === "doctor" ? "Médico" : 
                 user?.role === "patient" ? "Paciente" : 
                 user?.role === "manager" ? "Gerente" : 
                 user?.role === "pharmacist" ? "Farmacêutico" : 
                 "Funcionário"}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
        >
          {collapsed ? <ChevronLeft size={16} /> : <Menu size={16} />}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2 scrollbar-hide">
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
        
        {/* Portal Médico (se aplicável) */}
        {(user?.role === "doctor" || user?.role === "admin" || user?.role === "org_admin") && (
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
        
        {/* Portal Farmácia (se aplicável) */}
        {(user?.role === "pharmacist" || user?.role === "admin" || user?.role === "org_admin") && (
          <div className="mb-4">
            {collapsed ? null : (
              <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Portal Farmácia
              </h3>
            )}
            
            {pharmacyModules.map((item, index) => (
              <SidebarMenuItem
                key={`pharmacy-${index}`}
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
        
        {/* Seção de módulos premium */}
        <div className="mb-4">
          {collapsed ? null : (
            <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Módulos Premium
            </h3>
          )}
          
          {premiumModules.map((item, index) => (
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