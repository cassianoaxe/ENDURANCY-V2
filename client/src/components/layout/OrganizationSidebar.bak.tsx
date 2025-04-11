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
  const toggleSubmenu = (menuTitle: string) => {
    console.log("Toggle submenu:", menuTitle, "Current expanded:", expandedMenu);
    if (expandedMenu === menuTitle) {
      setExpandedMenu(null);
      console.log("Fechando submenu:", menuTitle);
    } else {
      setExpandedMenu(menuTitle);
      console.log("Abrindo submenu:", menuTitle);
    }
  };
  
  // Módulos básicos necessários
  const basicModules = [
    {
      title: "VISÃO GERAL",
      path: "/organization/dashboard",
      active: currentPath === "/organization/dashboard",
      icon: <LayoutDashboard size={18} />
    },
    {
      title: "CADASTROS",
      path: "/organization/cadastros",
      active: currentPath === "/organization/cadastros",
      icon: <Users size={18} />
    }
  ];
  
  // Módulos premium com submenu
  const premiumModules = [
    {
      title: "CULTIVO",
      path: "/organization/cultivation",
      active: currentPath === "/organization/cultivation" || currentPath.startsWith("/organization/cultivation/"),
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
        }
      ]
    },
    {
      title: "PRODUÇÃO INDUSTRIAL",
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
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">BÁSICO</p>
            </div>
          )}
          
          {basicModules.map((item, index) => (
            <div key={`basic-${index}`} className={cn(
              "relative",
              item.active && "bg-green-50 dark:bg-green-900/30"
            )}>
              {!collapsed ? (
                <div 
                  className={cn(
                    "flex items-center justify-between px-4 py-2 cursor-pointer group",
                    item.active 
                      ? "text-green-600 dark:text-green-400 font-medium" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                  onClick={() => navigateTo(item.path)}
                >
                  <div className="flex items-center gap-2">
                    {React.cloneElement(item.icon, { 
                      className: item.active 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-gray-500 dark:text-gray-400" 
                    })}
                    <span className={cn(item.active && "font-semibold")}>
                      {item.title}
                    </span>
                  </div>
                </div>
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
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">PREMIUM</p>
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
                    onClick={() => {
                      console.log('Clicando em item premium:', item.title, 'isSubmenu:', !!item.isSubmenu);
                      if (item.isSubmenu) {
                        toggleSubmenu(item.title);
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
                      <span className={cn(item.active && "font-semibold")}>
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
          {!collapsed && <span>Sair</span>}
        </Button>
      </div>
    </aside>
  );
}