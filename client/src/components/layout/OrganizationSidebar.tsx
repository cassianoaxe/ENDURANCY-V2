import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, Users, Package, ClipboardList, 
  Receipt, Settings, MessageSquare, BellRing, 
  CalendarDays, FileText, BookOpen, HelpCircle, 
  Menu, ChevronLeft, LogOut
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

  // Menu items structure
  const menuItems = [
    {
      title: "Principal",
      items: [
        {
          name: "Dashboard",
          icon: LayoutDashboard,
          path: "/organization/dashboard",
          active: currentPath === "/organization/dashboard"
        },
        {
          name: "Pacientes",
          icon: Users,
          path: "/organization/patients",
          active: currentPath === "/organization/patients"
        },
        {
          name: "Produtos",
          icon: Package,
          path: "/organization/products",
          active: currentPath === "/organization/products"
        }
      ]
    },
    {
      title: "Gestão",
      items: [
        {
          name: "Prescrições",
          icon: ClipboardList,
          path: "/organization/prescriptions",
          active: currentPath === "/organization/prescriptions"
        },
        {
          name: "Pedidos",
          icon: Receipt,
          path: "/organization/orders",
          active: currentPath === "/organization/orders"
        },
        {
          name: "Agenda",
          icon: CalendarDays,
          path: "/organization/calendar",
          active: currentPath === "/organization/calendar"
        }
      ]
    },
    {
      title: "Comunicação",
      items: [
        {
          name: "Mensagens",
          icon: MessageSquare,
          path: "/organization/messages",
          active: currentPath === "/organization/messages"
        },
        {
          name: "Notificações",
          icon: BellRing,
          path: "/organization/notifications",
          active: currentPath === "/organization/notifications",
          badge: 3
        }
      ]
    },
    {
      title: "Documentação",
      items: [
        {
          name: "Documentos",
          icon: FileText,
          path: "/organization/documents",
          active: currentPath === "/organization/documents"
        },
        {
          name: "Biblioteca",
          icon: BookOpen,
          path: "/organization/library",
          active: currentPath === "/organization/library"
        }
      ]
    },
    {
      title: "Suporte",
      items: [
        {
          name: "Ajuda",
          icon: HelpCircle,
          path: "/organization/help",
          active: currentPath === "/organization/help"
        },
        {
          name: "Configurações",
          icon: Settings,
          path: "/organization/settings",
          active: currentPath === "/organization/settings"
        }
      ]
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
            <div className="h-8 w-8 rounded-md bg-green-600 flex items-center justify-center text-white font-bold">
              E
            </div>
            <span className="font-semibold text-lg">Endurancy</span>
          </div>
        )}
        {collapsed && (
          <div className="h-8 w-8 rounded-md bg-green-600 flex items-center justify-center text-white font-bold mx-auto">
            E
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
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-6">
          {menuItems.map((section, index) => (
            <div key={index}>
              {!collapsed && (
                <h3 className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start font-normal text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                        item.active && "bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800",
                        collapsed ? "h-10 w-10 p-0 mx-auto" : "h-10 px-3"
                      )}
                      onClick={() => navigateTo(item.path)}
                    >
                      <item.icon size={20} className={cn(
                        collapsed ? "mx-auto" : "mr-3"
                      )} />
                      {!collapsed && (
                        <span className="flex-1 text-left">
                          {item.name}
                        </span>
                      )}
                      {!collapsed && item.badge && (
                        <span className="ml-auto bg-green-100 text-green-800 text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
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