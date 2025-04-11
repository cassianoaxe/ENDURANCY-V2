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
  BarChart3, BarChart4, Layers, ArrowRightLeft, FileBarChart, HeartHandshake, Shapes,
  UserPlus, UserCog, Target, GraduationCap, Video, CircleDollarSign, Home, Map,
  HandCoins, Bell, Calendar, Radio, Headphones, Phone, X, CalendarCheck, 
  Stethoscope
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
  const [scrollPosition, setScrollPosition] = useState(0);
  
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
  
  // Gerenciar posição de rolagem e expandedMenu
  useEffect(() => {
    // Verifica se existe uma configuração de menu expandido no localStorage
    const savedExpandedMenu = localStorage.getItem('expandedSubmenu');
    if (savedExpandedMenu) {
      setExpandedMenu(savedExpandedMenu);
    }
    
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
    enabled: !!user?.organizationId,
  });

  // Function to navigate to a path, ensuring session is maintained
  const navigateTo = (path: string, keepSubmenuOpen = false) => {
    // Primeiro verifica se o usuário está autenticado
    if (!user) {
      console.log("Tentando navegar sem autenticação. Redirecionando para login");
      window.location.href = '/login';
      return;
    }
    
    // Se for necessário manter o submenu aberto, salvamos o estado atual
    const currentSubmenu = keepSubmenuOpen ? expandedMenu : null;
    
    // Se autenticado, usa o método de navegação mais seguro
    try {
      console.log(`Navegando para: ${path}`);
      window.history.pushState({submenu: currentSubmenu}, '', path);
      
      // Nós disparamos o evento popstate e restauramos o estado do menu logo em seguida
      window.dispatchEvent(new Event('popstate'));
      
      // Se houver um submenu aberto e queremos mantê-lo aberto, restauramos após a navegação
      if (keepSubmenuOpen && currentSubmenu) {
        console.log("Mantendo submenu aberto após navegação:", currentSubmenu);
        setTimeout(() => setExpandedMenu(currentSubmenu), 50);
      }
    } catch (error) {
      console.error("Erro na navegação:", error);
      // Fallback para método mais direto em caso de erro
      window.location.href = path;
    }
  };

  // Use localStorage para persistir o estado do menu entre navegações
  const [expandedMenu, setExpandedMenu] = useState<string | null>(() => {
    // Carrega o submenu aberto do localStorage na inicialização
    try {
      const savedMenu = localStorage.getItem('expandedSubmenu');
      return savedMenu || null;
    } catch (e) {
      return null;
    }
  });
  
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
      title: "Portal Farmácia",
      path: "/organization/farmacia",
      active: currentPath === "/organization/farmacia" || 
              currentPath.startsWith("/organization/farmacia/"),
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
          title: "Vendas",
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
          title: "Estoque Distribuição",
          path: "/organization/producao-industrial/estoque-distribuicao",
          active: currentPath === "/organization/producao-industrial/estoque-distribuicao",
          icon: <PackagePlus size={16} />
        }
      ]
    }
  ];
  
  // Módulos para gerenciamento de médicos (para uso dos colaboradores)
  const doctorManagementModules = [
    {
      title: "Gerenciamento Médico",
      path: "/organization/doctor-management",
      active: currentPath === "/organization/doctor-management" || 
              currentPath.startsWith("/organization/doctor-management/"),
      icon: <Stethoscope size={18} />,
      isSubmenu: true,
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
    }
  ];
  
  // Módulos do portal médico (para acesso dos médicos)
  const medicalModules = [
    {
      title: "Portal Médico",
      path: "/organization/medical-portal",
      active: currentPath === "/organization/medical-portal" || 
              currentPath.startsWith("/organization/medical-portal/"),
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
    }
  ];
  
  // Módulos do portal da farmácia (movido para módulos premium)
  const pharmacyModules = [];
  
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
                  <Building className="h-6 w-6 text-primary mr-2" />
                )}
                <span className="text-sm font-semibold truncate" style={{ maxWidth: "150px" }}>
                  {organization?.name || "Endurancy"}
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
              <Building className="h-6 w-6 text-primary" />
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
        
        {/* Gerenciamento de Médicos (se aplicável) */}
        {(user?.role === "admin" || user?.role === "org_admin") && (
          <div className="mb-4">
            {collapsed ? null : (
              <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Gerenciamento Médico
              </h3>
            )}
            
            {doctorManagementModules.map((item, index) => (
              <SidebarMenuItem
                key={`doctor-management-${index}`}
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