import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, Users, Package, ClipboardList, 
  Receipt, Settings, MessageSquare, BellRing, 
  CalendarDays, FileText, BookOpen, HelpCircle, 
  Menu, ChevronLeft, LogOut, Leaf
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrganizationSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const currentPath = window.location.pathname;

  // Function to navigate to a path
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  // Menu items structure (from the screenshot)
  const menuItems = [
    {
      title: "ONBOARDING",
      path: "/organization/onboarding",
      active: currentPath === "/organization/onboarding"
    },
    {
      title: "VISÃO GERAL",
      path: "/organization/dashboard",
      active: currentPath === "/organization/dashboard",
      isActive: true
    },
    {
      title: "TAREFAS",
      path: "/organization/tasks",
      active: currentPath === "/organization/tasks"
    },
    {
      title: "ASSOCIADOS",
      path: "/organization/associates",
      active: currentPath === "/organization/associates"
    },
    {
      title: "SOCIAL",
      path: "/organization/social",
      active: currentPath === "/organization/social"
    },
    {
      title: "CULTIVO",
      path: "/organization/cultivation",
      active: currentPath === "/organization/cultivation"
    },
    {
      title: "PRODUÇÃO",
      path: "/organization/production",
      active: currentPath === "/organization/production"
    },
    {
      title: "EDUCAÇÃO DO PACIENTE",
      path: "/organization/patient-education",
      active: currentPath === "/organization/patient-education"
    },
    {
      title: "FINANCEIRO",
      path: "/organization/financial",
      active: currentPath === "/organization/financial"
    },
    {
      title: "COMPLYPAY",
      path: "/organization/complypay",
      active: currentPath === "/organization/complypay"
    },
    {
      title: "COMUNICAÇÃO",
      path: "/organization/communication",
      active: currentPath === "/organization/communication"
    },
    {
      title: "COMPRAS E ESTOQUE",
      path: "/organization/purchases-inventory",
      active: currentPath === "/organization/purchases-inventory"
    },
    {
      title: "VENDAS",
      path: "/organization/sales",
      active: currentPath === "/organization/sales"
    },
    {
      title: "EXPEDIÇÃO",
      path: "/organization/expedition",
      active: currentPath === "/organization/expedition"
    },
    {
      title: "DISPENSÁRIO",
      path: "/organization/dispensary",
      active: currentPath === "/organization/dispensary"
    },
    {
      title: "JURÍDICO",
      path: "/organization/legal",
      active: currentPath === "/organization/legal"
    },
    {
      title: "TRANSPARÊNCIA",
      path: "/organization/transparency",
      active: currentPath === "/organization/transparency"
    },
    {
      title: "RH",
      path: "/organization/hr",
      active: currentPath === "/organization/hr"
    },
    {
      title: "PATRIMÔNIO",
      path: "/organization/assets",
      active: currentPath === "/organization/assets"
    },
    {
      title: "PESQUISA CIENTÍFICA",
      path: "/organization/research",
      active: currentPath === "/organization/research"
    }
  ];

  return (
    <aside className={cn(
      "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
      collapsed ? "w-[78px]" : "w-[280px]"
    )}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-[#e6f7e6] flex items-center justify-center">
              <Leaf className="h-5 w-5 text-green-600" />
            </div>
            <span className="font-semibold text-lg">Endurancy</span>
          </div>
        )}
        {collapsed && (
          <div className="h-8 w-8 rounded-md bg-[#e6f7e6] flex items-center justify-center mx-auto">
            <Leaf className="h-5 w-5 text-green-600" />
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className={cn("text-gray-500 hover:text-gray-700 hover:bg-gray-100",
            collapsed && "mx-auto"
          )}
        >
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      {/* User Info */}
      <div className={cn(
        "border-b border-gray-200 py-4 px-4",
        collapsed ? "flex justify-center" : ""
      )}>
        {!collapsed ? (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                {user?.name.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="font-medium text-sm truncate">{user?.name || 'Usuário'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || 'usuário@exemplo.com'}</p>
              </div>
            </div>
            <div className="px-1 mt-2">
              <div className="text-xs text-gray-500 mb-1">Plano Atual</div>
              <div className="bg-green-50 text-green-700 text-xs rounded-full px-2 py-1 font-medium inline-flex">
                Plano Premium
              </div>
            </div>
          </div>
        ) : (
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
            {user?.name.charAt(0) || 'U'}
          </div>
        )}
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-2">
        <nav className="space-y-1">
          {menuItems.map((item, index) => (
            <div key={index} className={cn(
              "relative",
              item.isActive && "bg-green-50"
            )}>
              {!collapsed && (
                <div 
                  className={cn(
                    "flex items-center justify-between px-4 py-3 cursor-pointer group",
                    item.isActive ? "text-green-600 font-medium" : "text-gray-600 hover:bg-gray-50"
                  )}
                  onClick={() => navigateTo(item.path)}
                >
                  <span className={cn(
                    "text-sm",
                    item.isActive && "font-semibold"
                  )}>
                    {item.title}
                  </span>
                  <ChevronLeft 
                    size={16} 
                    className={cn(
                      "transform transition-transform duration-200",
                      item.isActive ? "rotate-90 text-green-600" : "-rotate-90 text-gray-400 group-hover:text-gray-600"
                    )} 
                  />
                </div>
              )}
              {collapsed && (
                <div 
                  className={cn(
                    "flex items-center justify-center p-2 cursor-pointer",
                    item.isActive ? "text-green-600 bg-green-50" : "text-gray-500 hover:bg-gray-50"
                  )}
                  onClick={() => navigateTo(item.path)}
                  title={item.title}
                >
                  <LayoutDashboard size={18} />
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="border-t border-gray-200 p-4">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start font-normal text-gray-600 hover:bg-gray-100 hover:text-red-600", 
            collapsed ? "h-10 w-10 p-0 mx-auto" : "h-10 px-3"
          )}
          onClick={logout}
        >
          <LogOut size={20} className={cn(
            "text-red-500",
            collapsed ? "mx-auto" : "mr-3"
          )} />
          {!collapsed && <span>Sair</span>}
        </Button>
      </div>
    </aside>
  );
}