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
  MessageSquareText,
  BookOpen,
  Upload,
  Plug,
  MessageSquare,
  Truck,
  ReceiptText,
  GitBranch,
  Bot,
  LucideIcon,
  LogOut,
  User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";


// Interface para itens de menu e submenu
interface MenuItem {
  icon: React.FC<any>;
  label: string;
  path?: string;
  submenu?: MenuItem[];
  isExpanded?: boolean;
}

const menuItems: MenuItem[] = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: BarChart2, label: "Analytics", path: "/analytics" },
  { icon: FileText, label: "Registro de Atividades", path: "/activity-log" },
  { icon: Database, label: "Backups", path: "/backups" },
  { icon: AlertTriangle, label: "Emergências", path: "/emergencies" },
  { icon: Package, label: "Planos", path: "/plans" },
  { 
    icon: Blocks, 
    label: "Módulos", 
    submenu: [
      { icon: Blocks, label: "Visão Geral", path: "/modules" },
      { icon: Package, label: "Módulos em Tabela", path: "/modules-table" },
      { icon: BarChart, label: "Vendas e Assinaturas", path: "/module-subscription-sales" }
    ]
  },
  { 
    icon: Building2, 
    label: "Cadastro", 
    submenu: [
      { icon: Building2, label: "Cadastros", path: "/cadastro" },
      { icon: UserRound, label: "Pré-cadastros", path: "/pre-cadastros" }
    ]
  },
  { 
    icon: TicketIcon, 
    label: "Tickets de Suporte", 
    submenu: [
      { icon: BarChart2, label: "Dashboard de Suporte", path: "/support-dashboard" },
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
      { icon: Clock, label: "Fluxo de Caixa", path: "/financial/cashflow" }
    ]
  },
  { icon: Mail, label: "Templates de Email", path: "/email-templates" },
  { icon: Users, label: "Administradores", path: "/administrators" },
  { icon: Upload, label: "Importação de Dados", path: "/data-import" },
  { icon: GitBranch, label: "Programa de Afiliados", path: "/afiliados" },
  { icon: Settings, label: "Configurações", path: "/settings" },
  { icon: Link, label: "Lista de URLs", path: "/routes-list" },
  { icon: BookOpen, label: "Documentação", path: "/documentation" }
];

export default function Sidebar() {
  // Obter contexto de autenticação
  const { user, logout } = useAuth();
  const { toast } = useToast();
  // Get current path for active state
  const [currentPath, setCurrentPath] = React.useState(window.location.pathname);
  // Estado para controle dos menus expandidos
  const [expandedMenus, setExpandedMenus] = React.useState<{[key: string]: boolean}>({
    "Dashboard": true,
    "Módulos": false, // Menu fechado por padrão
    "Planos": true,
    "Organizações": true,
    "Cadastro": true, // Expandido para facilitar acesso aos pré-cadastros
    "Tickets de Suporte": false, // Menu fechado por padrão
    "Financeiro": false, // Menu fechado por padrão
    "Integrações": true,
    "Sistema": true
  });
  
  // Controla se a sidebar está colapsada/retraída
  const [collapsed, setCollapsed] = React.useState(false); // false = expandida por padrão
  
  // Função para realizar logout
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logout realizado com sucesso",
        description: "Você saiu da sua conta",
      });
      // Redirecionamento após logout
      window.location.href = '/login';
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      } as any);
    }
  };

  // Update current path when URL changes
  React.useEffect(() => {
    const handleNavigation = () => {
      setCurrentPath(window.location.pathname);
      
      // Auto-expand parent menus if current path matches any submenu path
      const expandParentMenus = () => {
        // Função para verificar e expandir um menu baseado no path atual
        const checkAndExpandMenu = (items: MenuItem[], parentLabel?: string) => {
          for (const item of items) {
            if (item.path === currentPath && parentLabel) {
              // Se este item é o atual e tem um parent, expande o parent
              setExpandedMenus(prev => ({ ...prev, [parentLabel]: true }));
              return true;
            }
            
            if (item.submenu) {
              // Se este item tem submenu, cheque se o path atual está nele
              if (item.submenu.some(sub => sub.path === currentPath)) {
                // Se o path atual está no submenu direto, expande este menu
                if (item.label) {
                  setExpandedMenus(prev => ({ ...prev, [item.label]: true }));
                }
                if (parentLabel) {
                  setExpandedMenus(prev => ({ ...prev, [parentLabel]: true }));
                }
                return true;
              }
              
              // Verifica recursivamente nos submenus aninhados
              const found = checkAndExpandMenu(item.submenu, item.label);
              if (found && parentLabel) {
                setExpandedMenus(prev => ({ ...prev, [parentLabel]: true }));
                return true;
              }
            }
          }
          return false;
        };
        
        checkAndExpandMenu(menuItems);
      };
      
      expandParentMenus();
    };

    // Chame imediatamente para configurar o estado inicial
    handleNavigation();

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, [currentPath]);

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
      return item.path === currentPath || currentPath.startsWith(item.path);
    }
    
    if (item.submenu) {
      return item.submenu.some(subItem => {
        if (subItem.path && (subItem.path === currentPath || currentPath.startsWith(subItem.path))) {
          return true;
        }
        
        // Verificar submenus aninhados
        if (subItem.submenu) {
          return subItem.submenu.some(deepSubItem => 
            deepSubItem.path === currentPath || 
            (deepSubItem.path && currentPath.startsWith(deepSubItem.path))
          );
        }
        
        return false;
      });
    }
    
    return false;
  };

  // Renderizar item com submenu aninhado
  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const Icon = item.icon;
    const isActive = isMenuActive(item);
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isExpanded = hasSubmenu && expandedMenus[item.label];
    const isNested = level > 0;
    
    return (
      <div key={item.label + level} className="flex flex-col">
        {/* Menu principal ou submenu */}
        {item.path ? (
          // Item sem submenu
          <a 
            href={item.path}
            onClick={(e) => handleNavigation(e, item.path || '/')}
            className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-2 rounded-lg transition-colors text-sm 
              ${isNested ? 'ml-' + (level * 4) : ''}
              ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <div className="flex items-center gap-3">
              <Icon size={isNested ? 16 : 18} />
              {!collapsed && <span>{item.label}</span>}
            </div>
          </a>
        ) : (
          // Item com submenu
          <button 
            onClick={() => toggleMenu(item.label)}
            className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-2 rounded-lg transition-colors text-sm 
              ${isNested ? 'ml-' + (level * 4) : ''}
              ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <div className="flex items-center gap-3">
              <Icon size={isNested ? 16 : 18} />
              {!collapsed && <span>{item.label}</span>}
            </div>
            {!collapsed && hasSubmenu && (
              isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
            )}
          </button>
        )}
        
        {/* Renderizar submenu */}
        {!collapsed && hasSubmenu && isExpanded && (
          <div className={`pl-${isNested ? (level * 2) : 9} pr-2 py-1 flex flex-col gap-1`}>
            {item.submenu?.map((subItem) => {
              // Se o subitem também tiver submenu, renderiza recursivamente
              if (subItem.submenu && subItem.submenu.length > 0) {
                return renderMenuItem(subItem, level + 1);
              }
              
              // Renderiza um link normal se não tiver submenu
              const SubIcon = subItem.icon;
              const isSubActive = subItem.path === currentPath || 
                (subItem.path && currentPath.startsWith(subItem.path));
              
              return (
                <a 
                  key={subItem.path || subItem.label} 
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
  };

  return (
    <div className={`${collapsed ? 'w-[70px]' : 'w-[260px]'} h-screen bg-white border-r fixed left-0 top-0 transition-all duration-300 overflow-auto flex flex-col`}>
      <div className="p-4 border-b flex justify-between items-center">
        <a 
          href="/" 
          onClick={(e) => handleNavigation(e, '/')}
          className="flex items-center gap-2"
        >
          <Leaf className="h-6 w-6 text-green-600" />
          {!collapsed && (
            <div className="flex items-center">
              <span className="text-xl font-semibold">Endurancy</span>
              <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">Beta</span>
            </div>
          )}
        </a>
        
        {/* Botão de retrair/expandir a sidebar */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-gray-700"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      <nav className={`flex flex-col p-2 gap-1 mt-2 sidebar-nav ${collapsed ? 'px-2' : 'px-4'} overflow-y-auto flex-grow`}>
        {menuItems.map((item) => renderMenuItem(item))}
      </nav>
      
      {/* Seção do perfil do usuário */}
      {user && (
        <div className="mt-auto border-t border-gray-200 p-4">
          {!collapsed ? (
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user?.name ? user.name.substring(0, 2).toUpperCase() : "A"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium truncate" style={{ maxWidth: "120px" }}>
                    {user?.name || "Administrador"}
                  </p>
                  <p className="text-xs text-gray-500 truncate" style={{ maxWidth: "120px" }}>
                    {user?.email || ""}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-md p-1.5 bg-gray-100 text-gray-500 hover:bg-gray-200 focus:outline-none"
                title="Sair"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex justify-center rounded-md p-1.5 bg-gray-100 text-gray-500 hover:bg-gray-200 focus:outline-none"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      )}

    </div>
  );
}