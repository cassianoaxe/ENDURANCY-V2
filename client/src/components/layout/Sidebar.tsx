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
  Star,
  StarOff,
  History,
  Lightbulb,
  Bookmark,
  Info
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

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
      { icon: Clock, label: "Fluxo de Caixa", path: "/financial/cashflow" },
      { icon: Calendar, label: "Calendário Financeiro", path: "/financial/calendar" },
      { icon: CreditCard, label: "Conciliação Bancária", path: "/financial/bankreconciliation" },
      { icon: Brain, label: "Análise com IA", path: "/financial/aianalysis" },
      { icon: Settings, label: "Configurações", path: "/financial/settings" }
    ]
  },
  { 
    icon: Plug, 
    label: "Integrações", 
    submenu: [
      { icon: CreditCard, label: "Pagamentos", 
        submenu: [
          { icon: CreditCard, label: "Asaas", path: "/integracoes/pagamentos/asaas" },
          { icon: CreditCard, label: "Zoop", path: "/integracoes/pagamentos/zoop" }
        ]
      },
      { icon: Truck, label: "Logística", 
        submenu: [
          { icon: Truck, label: "Melhor Envio", path: "/integracoes/logistica/melhor-envio" },
          { icon: Truck, label: "Azul", path: "/integracoes/logistica/azul-cargo" },
          { icon: Truck, label: "Correios", path: "/integracoes/logistica/correios" }
        ]
      },
      { icon: ReceiptText, label: "Financeiro", 
        submenu: [
          { icon: ReceiptText, label: "Conta Azul", path: "/integracoes/financeiro/conta-azul" }
        ]
      },
      { icon: MessageSquare, label: "Comunicação", 
        submenu: [
          { icon: MessageSquare, label: "WhatsApp", path: "/integracoes/comunicacao/whatsapp" }
        ]
      },
      { icon: Users, label: "CRM", 
        submenu: [
          { icon: Users, label: "Kentro", path: "/integracoes/crm/kentro" }
        ]
      },
      { icon: Brain, label: "Inteligência Artificial", 
        submenu: [
          { icon: Bot, label: "ChatGPT", path: "/integracoes/ia/chatgpt" },
          { icon: Bot, label: "Claude", path: "/integracoes/ia/claude" }
        ]
      },
      { icon: GitBranch, label: "Desenvolvimento", 
        submenu: [
          { icon: GitBranch, label: "GitHub", path: "/integracoes/desenvolvimento/github" }
        ]
      },
      { icon: Link, label: "Todas Integrações", path: "/integracoes" }
    ]
  },
  { icon: Mail, label: "Templates de Email", path: "/email-templates" },
  { icon: Users, label: "Administradores", path: "/administrators" },
  { icon: Upload, label: "Importação de Dados", path: "/data-import" },
  { icon: Settings, label: "Configurações", path: "/settings" },
  { icon: Link, label: "Lista de URLs", path: "/routes-list" },
  { icon: BookOpen, label: "Documentação", path: "/documentation" }
];

// Interface para rastrear histórico de navegação
interface NavHistory {
  path: string;
  label: string;
  timestamp: number;
  count: number;
}

export default function Sidebar() {
  // Hook para acessar dados do usuário autenticado
  const { user } = useAuth();
  
  // Get current path for active state
  const [currentPath, setCurrentPath] = React.useState(window.location.pathname);
  
  // Estado para controle dos menus expandidos
  const [expandedMenus, setExpandedMenus] = React.useState<{[key: string]: boolean}>(() => {
    // Carregar do localStorage se disponível
    const savedExpandedMenus = localStorage.getItem('endurancy_expanded_menus');
    return savedExpandedMenus ? JSON.parse(savedExpandedMenus) : {
      "Módulos": false,
      "Tickets de Suporte": false,
      "Financeiro": true, // Começar com o menu financeiro expandido por padrão
      "Integrações": false
    };
  });
  
  // Controla se a sidebar está colapsada/retraída
  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    // Carregar do localStorage se disponível
    const savedCollapsed = localStorage.getItem('endurancy_sidebar_collapsed');
    return savedCollapsed ? JSON.parse(savedCollapsed) : false;
  });
  
  // Estado para rastrear itens acessados recentemente
  const [recentItems, setRecentItems] = React.useState<NavHistory[]>(() => {
    const savedItems = localStorage.getItem('endurancy_recent_items');
    return savedItems ? JSON.parse(savedItems) : [];
  });
  
  // Estado para marcadores favoritos
  const [favorites, setFavorites] = React.useState<string[]>(() => {
    const savedFavorites = localStorage.getItem('endurancy_favorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });
  
  // Estado para exibir dicas contextuais
  const [showTip, setShowTip] = React.useState<boolean>(true);
  
  // Gerar dica contextual baseada no papel do usuário e navegação recente
  const contextualTip = React.useMemo(() => {
    if (!user) return null;
    
    const userRole = user.role;
    const tips = {
      admin: [
        "Você pode gerenciar todas as organizações na página Organizações.",
        "Confira as solicitações de novas organizações na seção Solicitações.",
        "Monitore a saúde do sistema no Dashboard de Analytics.",
        "Configure as integrações globais na seção Integrações."
      ],
      org_admin: [
        "Adicione novos membros à sua organização na seção Usuários.",
        "Gerencie os módulos ativos para sua organização em Módulos.",
        "Visualize sua assinatura atual na página Meu Plano.",
        "Configure as integrações específicas da sua organização em Integrações."
      ],
      doctor: [
        "Crie novos registros de pacientes na seção Pacientes.",
        "Acompanhe suas consultas no Calendário.",
        "Gerencie seus atendimentos na Dashboard."
      ],
      patient: [
        "Acesse suas consultas agendadas na seção Consultas.",
        "Atualize seu perfil médico em Meu Perfil.",
        "Veja seu histórico de tratamentos na Dashboard."
      ]
    };
    
    // Seleciona uma dica aleatória baseada no papel do usuário
    const roleTips = tips[userRole] || tips.admin;
    const randomIndex = Math.floor(Math.random() * roleTips.length);
    return roleTips[randomIndex];
  }, [user]);

  // Salvar o estado de colapso no localStorage quando mudar
  React.useEffect(() => {
    localStorage.setItem('endurancy_sidebar_collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  // Salvar expansão de menus no localStorage quando mudar
  React.useEffect(() => {
    localStorage.setItem('endurancy_expanded_menus', JSON.stringify(expandedMenus));
  }, [expandedMenus]);

  // Salvar itens recentes no localStorage quando mudar
  React.useEffect(() => {
    localStorage.setItem('endurancy_recent_items', JSON.stringify(recentItems));
  }, [recentItems]);

  // Salvar favoritos no localStorage quando mudar
  React.useEffect(() => {
    localStorage.setItem('endurancy_favorites', JSON.stringify(favorites));
  }, [favorites]);

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
      
      // Registrar o item no histórico de navegação
      registerNavigation(window.location.pathname);
    };

    // Chame imediatamente para configurar o estado inicial
    handleNavigation();

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, [currentPath]);
  
  // Função para registrar um item no histórico de navegação
  const registerNavigation = (path: string) => {
    // Encontrar o item de menu correspondente ao path
    let menuItem: MenuItem | undefined;
    
    const findMenuItem = (items: MenuItem[]): MenuItem | undefined => {
      for (const item of items) {
        if (item.path === path) {
          return item;
        }
        if (item.submenu) {
          const found = findMenuItem(item.submenu);
          if (found) return found;
        }
      }
      return undefined;
    };
    
    menuItem = findMenuItem(menuItems);
    
    if (!menuItem || !menuItem.path) return; // Não registrar se não encontrar o item
    
    setRecentItems(prev => {
      const now = Date.now();
      const existingItemIndex = prev.findIndex(item => item.path === path);
      
      if (existingItemIndex >= 0) {
        // Atualizar item existente
        const updatedItems = [...prev];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          timestamp: now,
          count: updatedItems[existingItemIndex].count + 1
        };
        
        // Reordenar com os mais recentes no topo
        return updatedItems.sort((a, b) => b.timestamp - a.timestamp);
      } else {
        // Adicionar novo item
        const newItems = [
          { 
            path, 
            label: menuItem?.label || path, 
            timestamp: now,
            count: 1
          }, 
          ...prev
        ];
        
        // Manter apenas os 10 mais recentes
        return newItems.slice(0, 10);
      }
    });
  };

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

  // Função para adicionar ou remover um item dos favoritos
  const toggleFavorite = (path: string) => {
    if (favorites.includes(path)) {
      setFavorites(prev => prev.filter(p => p !== path));
    } else {
      setFavorites(prev => [...prev, path]);
    }
  };

  // Encontrar um item de menu pelo path
  const findMenuItemByPath = (path: string): MenuItem | undefined => {
    const findItem = (items: MenuItem[]): MenuItem | undefined => {
      for (const item of items) {
        if (item.path === path) {
          return item;
        }
        if (item.submenu) {
          const found = findItem(item.submenu);
          if (found) return found;
        }
      }
      return undefined;
    };
    
    return findItem(menuItems);
  };

  // Renderizar um item de menu recente ou favorito
  const renderSmartMenuItem = (path: string, label: string, count?: number) => {
    const menuItem = findMenuItemByPath(path);
    if (!menuItem) return null;
    
    const Icon = menuItem.icon;
    const isActive = path === currentPath || 
      (path && currentPath.startsWith(path));
      
    return (
      <div className="flex items-center gap-2 group" key={path}>
        <a 
          href={path}
          onClick={(e) => handleNavigation(e, path)}
          className={`flex items-center gap-3 flex-1 px-3 py-2 rounded-lg transition-colors text-sm
            ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <Icon size={16} />
          <span>{label}</span>
          {count !== undefined && (
            <span className="ml-auto text-xs text-gray-400">{count}</span>
          )}
        </a>
        
        {/* Estrela para favoritar/desfavoritar */}
        {!collapsed && (
          <button 
            onClick={() => toggleFavorite(path)}
            className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            {favorites.includes(path) ? (
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
            ) : (
              <StarOff size={14} />
            )}
          </button>
        )}
      </div>
    );
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
      
      {/* Dica contextual baseada no papel do usuário */}
      {!collapsed && contextualTip && showTip && (
        <div className="mx-4 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-700 relative">
          <div className="flex items-start gap-2">
            <Lightbulb size={16} className="text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p>{contextualTip}</p>
            </div>
            <button 
              onClick={() => setShowTip(false)} 
              className="absolute top-2 right-2 text-blue-400 hover:text-blue-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Favoritos */}
      {!collapsed && favorites.length > 0 && (
        <div className="mt-3 px-4">
          <div className="flex items-center mb-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Favoritos</h3>
            <div className="flex-grow border-t border-gray-200 ml-2"></div>
          </div>
          <div className="space-y-1 mb-3">
            {favorites.map(path => {
              const menuItem = findMenuItemByPath(path);
              return menuItem && renderSmartMenuItem(path, menuItem.label);
            })}
          </div>
        </div>
      )}
      
      {/* Recentes */}
      {!collapsed && recentItems.length > 0 && (
        <div className="mt-2 px-4">
          <div className="flex items-center mb-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Recentes</h3>
            <div className="flex-grow border-t border-gray-200 ml-2"></div>
          </div>
          <div className="space-y-1 mb-3">
            {recentItems.slice(0, 5).map(item => 
              renderSmartMenuItem(item.path, item.label, item.count)
            )}
          </div>
        </div>
      )}
      
      {/* Menu principal */}
      <nav className={`flex flex-col p-2 gap-1 mt-2 sidebar-nav ${collapsed ? 'px-2' : 'px-4'}`}>
        {menuItems.map((item) => renderMenuItem(item))}
      </nav>
    </div>
  );
}