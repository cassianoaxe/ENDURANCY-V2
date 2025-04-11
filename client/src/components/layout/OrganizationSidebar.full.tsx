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
  HandCoins, Bell, Calendar, Radio, Headphones, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Organization } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  // Function to navigate to a path
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
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
      icon: <TestTube size={18} />,
      isSubmenu: true,
      subItems: [
        {
          title: "Dashboard Pesquisa",
          path: "/organization/research",
          active: currentPath === "/organization/research" && !currentPath.includes("/organization/research/"),
          icon: <LayoutDashboard size={16} />
        },
        {
          title: "Projetos",
          path: "/organization/research/projetos",
          active: currentPath === "/organization/research/projetos",
          icon: <Clipboard size={16} />
        },
        {
          title: "Resultados",
          path: "/organization/research/resultados",
          active: currentPath === "/organization/research/resultados",
          icon: <BarChart4 size={16} />
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
      title: "Produção Industrial",
      path: "/organization/producao-industrial",
      active: currentPath === "/organization/producao-industrial" || currentPath.startsWith("/organization/producao-industrial/"),
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

  return (
    <aside className={cn(
      "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen transition-all duration-300",
      collapsed ? "w-[78px]" : "w-[280px]"
    )}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-gray-200 dark:border-gray-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xl">Endurancy</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-full"
        >
          <Menu size={20} />
        </Button>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-2">
        <nav className="space-y-1">
          {/* Módulos Básicos */}
          {!collapsed && (
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Módulos Incluídos</p>
            </div>
          )}
          
          {freeModules.map((item, index) => (
            <div key={`free-${index}`} className={cn(
              "relative",
              item.active && "bg-green-50 dark:bg-green-900/30"
            )}>
              {!collapsed ? (
                <>
                  <div 
                    className={cn(
                      "flex items-center justify-between px-4 py-2 cursor-pointer group",
                      item.active 
                        ? "text-green-600 dark:text-green-400 font-medium" 
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                    onClick={(e) => {
                      if (item.isSubmenu) {
                        toggleSubmenu(item.title, e);
                      } else {
                        navigateTo(item.path);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {React.cloneElement(item.icon, { 
                        className: item.active 
                          ? "text-green-600 dark:text-green-400" 
                          : "text-gray-500 dark:text-gray-400" 
                      })}
                      <span className={cn(
                        "text-sm", // Menor tamanho de fonte
                        item.active && "font-medium" // Médio em vez de semibold
                      )}>
                        {item.title}
                      </span>
                    </div>
                    {item.isSubmenu && (
                      <ChevronDown
                        size={16}
                        className={cn(
                          "transition-transform duration-200",
                          expandedMenu === item.title ? "transform rotate-180" : "",
                          item.active
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400"
                        )}
                      />
                    )}
                  </div>
                  
                  {/* Renderização condicional do submenu */}
                  {item.isSubmenu && expandedMenu === item.title && (
                    <div className="pl-7 space-y-1 mt-1 mb-1 bg-gray-50 dark:bg-gray-800/30 py-1">
                      {item.subItems?.map((subItem, subIndex) => (
                        <div
                          key={`free-subitem-${subIndex}`}
                          className={cn(
                            "flex items-center px-4 py-2 text-sm cursor-pointer rounded-md",
                            subItem.active
                              ? "text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20"
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          )}
                          onClick={() => navigateTo(subItem.path)}
                        >
                          <div className="flex items-center gap-2">
                            {React.cloneElement(subItem.icon, {
                              className: subItem.active
                                ? "text-green-600 dark:text-green-400"
                                : "text-gray-500 dark:text-gray-400",
                              size: 16
                            })}
                            <span className={cn(subItem.active && "font-medium")}>
                              {subItem.title}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div
                  className={cn(
                    "flex items-center justify-center p-2 cursor-pointer",
                    item.active ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                  onClick={() => navigateTo(item.path)}
                  title={item.title}
                >
                  {React.cloneElement(item.icon, { size: 20 })}
                </div>
              )}
            </div>
          ))}
          
          {/* Módulos Premium */}
          {!collapsed && (
            <div className="px-4 py-2 mt-6">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Módulos Premium</p>
            </div>
          )}
          
          {premiumModules.map((item, index) => (
            <div key={`premium-${index}`} className={cn(
              "relative",
              item.active && "bg-green-50 dark:bg-green-900/30"
            )}>
              {!collapsed ? (
                <>
                  <div 
                    className={cn(
                      "flex items-center justify-between px-4 py-2 cursor-pointer group",
                      item.active 
                        ? "text-green-600 dark:text-green-400 font-medium" 
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                    onClick={(e) => {
                      console.log('Clicando em item premium:', item.title, 'isSubmenu:', !!item.isSubmenu);
                      if (item.isSubmenu) {
                        toggleSubmenu(item.title, e);
                      } else {
                        navigateTo(item.path);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {React.cloneElement(item.icon, { 
                        className: item.active 
                          ? "text-green-600 dark:text-green-400" 
                          : "text-gray-500 dark:text-gray-400" 
                      })}
                      <span className={cn(
                        "text-sm", // Menor tamanho de fonte
                        item.active && "font-medium" // Médio em vez de semibold
                      )}>
                        {item.title}
                      </span>
                    </div>
                    {item.isSubmenu && (
                      <ChevronDown
                        size={16}
                        className={cn(
                          "transition-transform duration-200",
                          expandedMenu === item.title ? "transform rotate-180" : "",
                          item.active
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400"
                        )}
                      />
                    )}
                  </div>
                  
                  {/* Renderização condicional do submenu */}
                  {item.isSubmenu && expandedMenu === item.title && (
                    <div className="pl-7 space-y-1 mt-1 mb-1 bg-gray-50 dark:bg-gray-800/30 py-1">
                      {item.subItems?.map((subItem, subIndex) => (
                        <div
                          key={`subitem-${subIndex}`}
                          className={cn(
                            "flex items-center px-4 py-2 text-sm cursor-pointer rounded-md",
                            subItem.active
                              ? "text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20"
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          )}
                          onClick={() => {
                            console.log('Clicando em subitem:', subItem.title);
                            navigateTo(subItem.path);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {React.cloneElement(subItem.icon, {
                              className: subItem.active
                                ? "text-green-600 dark:text-green-400"
                                : "text-gray-500 dark:text-gray-400",
                              size: 16
                            })}
                            <span className={cn(subItem.active && "font-medium")}>
                              {subItem.title}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div
                  className={cn(
                    "flex items-center justify-center p-2 cursor-pointer",
                    item.active ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                  onClick={() => navigateTo(item.path)}
                  title={item.title}
                >
                  {React.cloneElement(item.icon, { size: 20 })}
                </div>
              )}
            </div>
          ))}
          
          {/* Configurações */}
          {!collapsed && (
            <div className="px-4 py-2 mt-6">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Configurações</p>
            </div>
          )}
          
          <div className={cn(
            "relative",
            configModule.active && "bg-green-50 dark:bg-green-900/30"
          )}>
            {!collapsed ? (
              <div 
                className={cn(
                  "flex items-center px-4 py-2 cursor-pointer",
                  configModule.active 
                    ? "text-green-600 dark:text-green-400 font-medium" 
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
                onClick={() => navigateTo(configModule.path)}
              >
                <div className="flex items-center gap-2">
                  {React.cloneElement(configModule.icon, { 
                    className: configModule.active 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-gray-500 dark:text-gray-400" 
                  })}
                  <span className={cn(
                    "text-sm", // Menor tamanho de fonte
                    configModule.active && "font-medium" // Médio em vez de semibold
                  )}>
                    {configModule.title}
                  </span>
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  "flex items-center justify-center p-2 cursor-pointer",
                  configModule.active ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                )}
                onClick={() => navigateTo(configModule.path)}
                title={configModule.title}
              >
                {React.cloneElement(configModule.icon, { size: 20 })}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Logout Button */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start font-normal text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-600 dark:hover:text-red-400", 
            collapsed ? "h-10 w-10 p-0 mx-auto" : "h-10 px-3"
          )}
          onClick={logout}
        >
          <LogOut size={20} className={cn(
            "text-red-500 dark:text-red-400",
            collapsed ? "mx-auto" : "mr-3"
          )} />
          {!collapsed && <span className="text-sm">Sair</span>}
        </Button>
      </div>
    </aside>
  );
}