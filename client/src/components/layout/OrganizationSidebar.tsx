import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, Users, Package, ClipboardList, 
  Receipt, Settings, MessageSquare, BellRing, 
  CalendarDays, FileText, BookOpen, HelpCircle, 
  Menu, ChevronLeft, LogOut, Leaf, Loader2,
  Brain, Truck, ShoppingCart, CreditCard, DollarSign,
  Landmark, HeartPulse, BadgeHelp, Users2, Briefcase,
  Scale, LineChart, MessageCircle, Building, TestTube,
  Clipboard, FileClock, Share2, Send, Network, 
  Plane, Mailbox, Wallet, Bot, Puzzle, CreditCard as CreditCardIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Organization } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function OrganizationSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const currentPath = window.location.pathname;
  
  // Carregar dados da organização se o usuário estiver autenticado e tiver um organizationId
  const { data: organization, isLoading: isOrgLoading } = useQuery<Organization>({
    queryKey: ['/api/organizations', user?.organizationId],
    enabled: !!user?.organizationId,
  });

  // Function to navigate to a path
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  // Módulos obrigatórios (incluídos no freemium e em todos os planos)
  const freeModules = [
    {
      title: "MEU PLANO",
      path: "/organization/meu-plano",
      active: currentPath === "/organization/meu-plano",
      icon: <Puzzle size={18} />
    },
    {
      title: "ONBOARDING",
      path: "/organization/onboarding",
      active: currentPath === "/organization/onboarding",
      icon: <Clipboard size={18} />
    },
    {
      title: "VISÃO GERAL",
      path: "/organization/dashboard",
      active: currentPath === "/organization/dashboard",
      isActive: true,
      icon: <LayoutDashboard size={18} />
    },
    {
      title: "CADASTROS",
      path: "/organization/cadastros",
      active: currentPath === "/organization/cadastros",
      icon: <Users size={18} />
    },
    {
      title: "FINANCEIRO",
      path: "/organization/financial",
      active: currentPath === "/organization/financial",
      icon: <DollarSign size={18} />
    },
    {
      title: "COMPLYPAY",
      path: "/organization/complypay",
      active: currentPath === "/organization/complypay",
      icon: <Wallet size={18} />
    },
    {
      title: "VENDAS",
      path: "/organization/sales",
      active: currentPath === "/organization/sales",
      icon: <ShoppingCart size={18} />
    },
    {
      title: "EXPEDIÇÃO",
      path: "/organization/expedition",
      active: currentPath === "/organization/expedition",
      icon: <Truck size={18} />
    },
    {
      title: "CHATGPT AI",
      path: "/organization/ai",
      active: currentPath === "/organization/ai",
      icon: <Bot size={18} />
    }
  ];
  
  // Configurações da organização
  const configModule = {
    title: "CONFIGURAÇÕES",
    path: "/organization/settings",
    active: currentPath === "/organization/settings" || currentPath.startsWith("/organization/settings") || 
            currentPath.startsWith("/organization/integrations"),
    icon: <Settings size={18} />
  };
  
  // Lista vazia para evitar erros (não usada mais)
  const integrationModules: any[] = [];

  // Módulos pagos (disponíveis conforme o plano ou add-ons)
  const premiumModules = [
    {
      title: "TAREFAS",
      path: "/organization/tasks",
      active: currentPath === "/organization/tasks",
      icon: <FileClock size={18} />
    },
    {
      title: "SOCIAL",
      path: "/organization/social",
      active: currentPath === "/organization/social",
      icon: <Users2 size={18} />
    },
    {
      title: "CULTIVO",
      path: "/organization/cultivation",
      active: currentPath === "/organization/cultivation",
      icon: <Leaf size={18} />
    },
    {
      title: "PRODUÇÃO",
      path: "/organization/production",
      active: currentPath === "/organization/production",
      icon: <Package size={18} />
    },
    {
      title: "COMPRAS E ESTOQUE",
      path: "/organization/purchases-inventory",
      active: currentPath === "/organization/purchases-inventory",
      icon: <ShoppingCart size={18} />
    },
    {
      title: "JURÍDICO",
      path: "/organization/legal",
      active: currentPath === "/organization/legal",
      icon: <Scale size={18} />
    },
    {
      title: "RH",
      path: "/organization/hr",
      active: currentPath === "/organization/hr",
      icon: <Briefcase size={18} />
    },
    {
      title: "PESQUISA CIENTÍFICA",
      path: "/organization/research",
      active: currentPath === "/organization/research",
      icon: <TestTube size={18} />
    },
    {
      title: "CRM",
      path: "/organization/crm",
      active: currentPath === "/organization/crm",
      icon: <Users size={18} />
    },
    {
      title: "EDUCAÇÃO DO PACIENTE",
      path: "/organization/patient-education",
      active: currentPath === "/organization/patient-education",
      icon: <BookOpen size={18} />
    },
    {
      title: "PATRIMÔNIO",
      path: "/organization/assets",
      active: currentPath === "/organization/assets",
      icon: <Building size={18} />
    },
    {
      title: "COMUNICAÇÃO",
      path: "/organization/communication",
      active: currentPath === "/organization/communication",
      icon: <MessageCircle size={18} />
    },
    {
      title: "PORTAL MÉDICO",
      path: "/organization/medical-portal",
      active: currentPath === "/organization/medical-portal",
      icon: <HeartPulse size={18} />
    }
  ];

  return (
    <aside className={cn(
      "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300",
      collapsed ? "w-[78px]" : "w-[280px]"
    )}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-gray-200 dark:border-gray-800">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            {isOrgLoading ? (
              <div className="h-8 w-8 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400 dark:text-gray-500" />
              </div>
            ) : organization?.logo ? (
              <Avatar className="h-8 w-8 rounded-md">
                <AvatarImage src={organization.logo} alt={organization.name} />
                <AvatarFallback className="rounded-md bg-[#e6f7e6] dark:bg-[#1f3b1f]">
                  <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-8 w-8 rounded-md bg-[#e6f7e6] dark:bg-[#1f3b1f] flex items-center justify-center">
                <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            )}
            <span className="font-semibold text-lg dark:text-white">{organization?.name || "Endurancy"}</span>
          </div>
        ) : (
          isOrgLoading ? (
            <div className="h-8 w-8 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400 dark:text-gray-500" />
            </div>
          ) : organization?.logo ? (
            <Avatar className="h-8 w-8 rounded-md mx-auto">
              <AvatarImage src={organization.logo} alt={organization.name} />
              <AvatarFallback className="rounded-md bg-[#e6f7e6] dark:bg-[#1f3b1f]">
                <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-8 w-8 rounded-md bg-[#e6f7e6] dark:bg-[#1f3b1f] flex items-center justify-center mx-auto">
              <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          )
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className={cn("text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
            collapsed && "mx-auto"
          )}
        >
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      {/* User Info */}
      <div className={cn(
        "border-b border-gray-200 dark:border-gray-800 py-4 px-4",
        collapsed ? "flex justify-center" : ""
      )}>
        {!collapsed ? (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-medium">
                {user?.name.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="font-medium text-sm truncate dark:text-white">{user?.name || 'Usuário'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || 'usuário@exemplo.com'}</p>
              </div>
            </div>
            <div className="px-1 mt-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Plano Atual</div>
              <div className={`text-xs rounded-full px-2 py-1 font-medium inline-flex ${
                organization?.planTier === 'pro' ? 'bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300' :
                organization?.planTier === 'grow' ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300' :
                organization?.planTier === 'seed' ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300' :
                'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}>
                {organization?.planTier === 'pro' ? 'Plano Pro' :
                  organization?.planTier === 'grow' ? 'Plano Grow' :
                  organization?.planTier === 'seed' ? 'Plano Seed' :
                  organization?.planTier === 'free' ? 'Plano Free' :
                  isOrgLoading ? 'Carregando...' : 'Não Definido'}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-medium">
            {user?.name.charAt(0) || 'U'}
          </div>
        )}
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-2">
        <nav className="space-y-1">
          {/* Módulos Obrigatórios */}
          {!collapsed && (
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">MÓDULOS INCLUÍDOS</p>
            </div>
          )}
          
          {freeModules.map((item, index) => (
            <div key={`free-${index}`} className={cn(
              "relative",
              item.active && "bg-green-50 dark:bg-green-900/30"
            )}>
              {!collapsed && (
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
                    <span className={cn(
                      "text-sm flex items-center gap-2",
                      item.active && "font-semibold"
                    )}>
                      {React.cloneElement(item.icon, { 
                        className: item.active 
                          ? "text-green-600 dark:text-green-400" 
                          : "text-gray-500 dark:text-gray-400" 
                      })}
                      {item.title}
                    </span>
                  </div>
                  <ChevronLeft 
                    size={16} 
                    className={cn(
                      "transform transition-transform duration-200",
                      item.active 
                        ? "rotate-90 text-green-600 dark:text-green-400" 
                        : "-rotate-90 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                    )} 
                  />
                </div>
              )}
              {collapsed && (
                <div 
                  className={cn(
                    "flex items-center justify-center p-2 cursor-pointer",
                    item.active 
                      ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30" 
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                  onClick={() => navigateTo(item.path)}
                  title={item.title}
                >
                  {item.icon}
                </div>
              )}
            </div>
          ))}

          {/* Separador */}
          <div className="my-2 border-t border-gray-200 dark:border-gray-800"></div>
          
          {/* Configurações */}
          {!collapsed && (
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">SISTEMA</p>
            </div>
          )}
          
          {/* Item de configurações */}
          <div className={cn(
            "relative",
            configModule.active && "bg-green-50 dark:bg-green-900/30"
          )}>
            {!collapsed && (
              <div 
                className={cn(
                  "flex items-center justify-between px-4 py-2 cursor-pointer group",
                  configModule.active 
                    ? "text-green-600 dark:text-green-400 font-medium" 
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
                onClick={() => navigateTo(configModule.path)}
              >
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-sm flex items-center gap-2",
                    configModule.active && "font-semibold"
                  )}>
                    {React.cloneElement(configModule.icon, { 
                      className: configModule.active 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-gray-500 dark:text-gray-400" 
                    })}
                    {configModule.title}
                  </span>
                </div>
                <ChevronLeft 
                  size={16} 
                  className={cn(
                    "transform transition-transform duration-200",
                    configModule.active 
                      ? "rotate-90 text-green-600 dark:text-green-400" 
                      : "-rotate-90 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                  )} 
                />
              </div>
            )}
            {collapsed && (
              <div 
                className={cn(
                  "flex items-center justify-center p-2 cursor-pointer",
                  configModule.active 
                    ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30" 
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
                onClick={() => navigateTo(configModule.path)}
                title={configModule.title}
              >
                {configModule.icon}
              </div>
            )}
          </div>
          
          {/* Separador */}
          <div className="my-2 border-t border-gray-200 dark:border-gray-800"></div>
          
          {/* Módulos Pagos */}
          {!collapsed && (
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">MÓDULOS ADD-ONS</p>
            </div>
          )}
          
          {premiumModules.map((item, index) => (
            <div key={`premium-${index}`} className={cn(
              "relative",
              item.active && "bg-green-50 dark:bg-green-900/30"
            )}>
              {!collapsed && (
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
                    <span className={cn(
                      "text-sm flex items-center gap-2",
                      item.active && "font-semibold"
                    )}>
                      {React.cloneElement(item.icon, { 
                        className: item.active 
                          ? "text-green-600 dark:text-green-400" 
                          : "text-gray-500 dark:text-gray-400" 
                      })}
                      {item.title}
                    </span>
                  </div>
                  <ChevronLeft 
                    size={16} 
                    className={cn(
                      "transform transition-transform duration-200",
                      item.active 
                        ? "rotate-90 text-green-600 dark:text-green-400" 
                        : "-rotate-90 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                    )} 
                  />
                </div>
              )}
              {collapsed && (
                <div 
                  className={cn(
                    "flex items-center justify-center p-2 cursor-pointer",
                    item.active 
                      ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30" 
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                  onClick={() => navigateTo(item.path)}
                  title={item.title}
                >
                  {item.icon}
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