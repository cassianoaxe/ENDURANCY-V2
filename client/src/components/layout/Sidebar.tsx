import React from "react";
import {
  Home,
  BarChart2,
  FileText,
  Database,
  AlertTriangle,
  Package,
  Building2,
  InboxIcon,
  Wallet,
  Mail,
  Users,
  Settings,
  Leaf,
  Blocks,
  Link,
  DollarSign,
  CreditCard,
  BarChart,
  Calendar,
  UserRound,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Clock,
  ArrowUp,
  ArrowDown,
  Brain,
  TicketIcon,
  MessageSquareText
} from "lucide-react";

// Interface para itens de menu e submenu
interface MenuItem {
  icon: React.FC<any>;
  label: string;
  path?: string;
  submenu?: MenuItem[];
  isExpanded?: boolean;
}

const menuItems: MenuItem[] = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: BarChart2, label: "Analytics", path: "/analytics" },
  { icon: FileText, label: "Registro de Atividades", path: "/activity-log" },
  { icon: Database, label: "Backups", path: "/backups" },
  { icon: AlertTriangle, label: "Emergências", path: "/emergencies" },
  { icon: Package, label: "Planos", path: "/plans" },
  { 
    icon: Blocks, 
    label: "Módulos", 
    submenu: [
      { icon: Blocks, label: "Lista de Módulos", path: "/modules" },
      { icon: Package, label: "Módulos por Organização", path: "/organization-modules" }
    ]
  },
  { icon: Building2, label: "Organizações", path: "/organizations" },
  { icon: InboxIcon, label: "Solicitações", path: "/requests" },
  { 
    icon: TicketIcon, 
    label: "Tickets de Suporte", 
    submenu: [
      { icon: TicketIcon, label: "Lista de Tickets", path: "/tickets" },
      { icon: MessageSquareText, label: "Criar Novo Ticket", path: "/tickets/new" }
    ]
  },
  { 
    icon: Wallet, 
    label: "Financeiro", 
    submenu: [
      { icon: DollarSign, label: "Dashboard Financeiro", path: "/financial" },
      { icon: ArrowUp, label: "Contas a Pagar", path: "/financial/payables" },
      { icon: ArrowDown, label: "Contas a Receber", path: "/financial/receivables" },
      { icon: BarChart, label: "DRE", path: "/financial/reports" },
      { icon: Clock, label: "Fluxo de Caixa", path: "/financial/cashflow" },
      { icon: Calendar, label: "Calendário Financeiro", path: "/financial/calendar" },
      { icon: CreditCard, label: "Conciliação Bancária", path: "/financial/bankreconciliation" },
      { icon: Brain, label: "Análise com IA", path: "/financial/aianalysis" },
      { icon: Settings, label: "Configurações", path: "/financial/settings" }
    ]
  },
  { icon: Mail, label: "Templates de Email", path: "/email-templates" },
  { icon: Users, label: "Administradores", path: "/administrators" },
  { icon: Settings, label: "Configurações", path: "/settings" },
  { icon: Link, label: "Lista de URLs", path: "/routes-list" }
];

export default function Sidebar() {
  // Get current path for active state
  const [currentPath, setCurrentPath] = React.useState(window.location.pathname);
  // Estado para controle dos menus expandidos
  const [expandedMenus, setExpandedMenus] = React.useState<{[key: string]: boolean}>({
    "Módulos": false,
    "Tickets de Suporte": false,
    "Financeiro": true // Começar com o menu financeiro expandido por padrão
  });
  
  // Controla se a sidebar está colapsada/retraída
  const [collapsed, setCollapsed] = React.useState(false);

  // Update current path when URL changes
  React.useEffect(() => {
    const handleNavigation = () => {
      setCurrentPath(window.location.pathname);
      
      // Auto-expand submenu if current path matches
      menuItems.forEach(item => {
        if (item.submenu) {
          const hasActiveChild = item.submenu.some(subItem => subItem.path === window.location.pathname);
          if (hasActiveChild) {
            setExpandedMenus(prev => ({ ...prev, [item.label]: true }));
          }
        }
      });
    };

    // Chame imediatamente para configurar o estado inicial
    handleNavigation();

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  // Toggle menu expansion
  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  // Custom navigation handler that updates the URL without page reload
  const handleNavigation = (event: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    event.preventDefault();
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    // Dispatch a custom event to notify AppContent about path change
    window.dispatchEvent(new Event('popstate'));
  };

  // Check if a menu item should be displayed as active
  const isMenuActive = (item: MenuItem): boolean => {
    if (item.path) {
      return item.path === currentPath;
    }
    
    if (item.submenu) {
      return item.submenu.some(subItem => 
        (subItem.path === currentPath) || 
        (currentPath.startsWith(subItem.path || ''))
      );
    }
    
    return false;
  };

  return (
    <div className={`${collapsed ? 'w-[70px]' : 'w-[260px]'} h-screen bg-white border-r fixed left-0 top-0 transition-all duration-300 overflow-auto`}>
      <div className="p-4 border-b flex justify-between items-center">
        <a 
          href="/" 
          onClick={(e) => handleNavigation(e, '/')}
          className="flex items-center gap-2"
        >
          <Leaf className="h-6 w-6 text-green-600" />
          {!collapsed && <span className="text-xl font-semibold">Endurancy</span>}
        </a>
        
        {/* Botão de retrair/expandir a sidebar */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-gray-700"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      
      <nav className={`flex flex-col p-2 gap-1 mt-2 sidebar-nav ${collapsed ? 'px-2' : 'px-4'}`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = isMenuActive(item);
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isExpanded = hasSubmenu && expandedMenus[item.label];
          
          return (
            <div key={item.label} className="flex flex-col">
              {/* Menu principal */}
              {item.path ? (
                // Item sem submenu
                <a 
                  href={item.path}
                  onClick={(e) => handleNavigation(e, item.path || '/')}
                  className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-2 rounded-lg transition-colors text-sm 
                    ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                </a>
              ) : (
                // Item com submenu
                <button 
                  onClick={() => toggleMenu(item.label)}
                  className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-2 rounded-lg transition-colors text-sm 
                    ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                  {!collapsed && hasSubmenu && (
                    isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                  )}
                </button>
              )}
              
              {/* Submenu */}
              {!collapsed && hasSubmenu && isExpanded && (
                <div className="pl-9 pr-2 py-1 flex flex-col gap-1">
                  {item.submenu?.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const isSubActive = subItem.path === currentPath;
                    
                    return (
                      <a 
                        key={subItem.path} 
                        href={subItem.path}
                        onClick={(e) => handleNavigation(e, subItem.path || '/')}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm 
                          ${isSubActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        <SubIcon size={16} />
                        <span>{subItem.label}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}