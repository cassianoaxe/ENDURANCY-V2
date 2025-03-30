import React, { useState, useEffect } from "react";
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
  Layers,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  Heart,
  Briefcase,
  Scale,
  Eye,
  Brain,
  BarChart3
} from "lucide-react";

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: BarChart2, label: "Analytics", path: "/analytics" },
  { icon: FileText, label: "Registro de Atividades", path: "/activity-log" },
  { icon: Database, label: "Backups", path: "/backups" },
  { icon: AlertTriangle, label: "Emergências", path: "/emergencies" },
  { icon: Package, label: "Planos", path: "/plans" },
  { icon: Building2, label: "Organizações", path: "/organizations" },
  { icon: InboxIcon, label: "Solicitações", path: "/requests" },
  { icon: Wallet, label: "Financeiro", path: "/financial" },
  { icon: Mail, label: "Templates de Email", path: "/email-templates" },
  { icon: Users, label: "Administradores", path: "/administrators" },
  { 
    icon: Layers, 
    label: "Módulos", 
    path: "/modules",
    expandable: true,
    subItems: [
      { icon: ShoppingCart, label: "Módulo Compras", path: "/modules/1", type: "compras" },
      { icon: Leaf, label: "Cultivo", path: "/modules/2", type: "cultivo" },
      { icon: BarChart3, label: "Produção", path: "/modules/3", type: "producao" },
      { icon: Heart, label: "CRM", path: "/modules/4", type: "crm" },
      { icon: Briefcase, label: "RH", path: "/modules/5", type: "rh" },
      { icon: Scale, label: "Jurídico", path: "/modules/6", type: "juridico" },
      { icon: Heart, label: "Social", path: "/modules/7", type: "social" },
      { icon: Eye, label: "Transparência", path: "/modules/8", type: "transparencia" },
      { icon: Brain, label: "Inteligência Artificial", path: "/modules/9", type: "ia" }
    ]
  },
  { icon: Settings, label: "Configurações", path: "/settings" }
];

export default function Sidebar() {
  // Estado para armazenar o caminho atual
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  // Estado para controlar quais menus estão expandidos
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  // Atualizar o caminho atual quando a URL mudar
  useEffect(() => {
    const handleNavigation = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  // Função para expandir ou recolher um menu
  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label) 
        : [...prev, label]
    );
  };

  // Manipulador de navegação personalizado
  const handleNavigation = (event: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    event.preventDefault();
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    // Despachar um evento personalizado para notificar o AppContent sobre a mudança de caminho
    window.dispatchEvent(new Event('popstate'));
  };

  // Verificar se um item ou subitem está ativo com base no caminho atual
  const isItemActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  // Verificar se um módulo específico está ativo
  const isModuleActive = (modulePath: string) => currentPath === modulePath;

  return (
    <div className="w-[240px] h-screen bg-white border-r fixed left-0 top-0 overflow-y-auto">
      <div className="p-4 border-b">
        <a 
          href="/" 
          onClick={(e) => handleNavigation(e, '/')}
          className="flex items-center gap-2 text-xl font-semibold"
        >
          <Leaf className="h-6 w-6 text-green-600" />
          <span>Endurancy</span>
        </a>
      </div>
      <nav className="flex flex-col p-4 gap-1 mt-2 sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.path);
          const isExpanded = expandedMenus.includes(item.label);
          
          // Se este for um item expandível e estiver expandido ou tiver um subitem ativo,
          // queremos mostrá-lo como ativo
          const showAsActive = isActive || 
            (item.expandable && item.subItems?.some(subItem => isModuleActive(subItem.path)));
          
          return (
            <React.Fragment key={item.path}>
              {item.expandable ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`flex items-center justify-between w-full px-4 py-2 rounded-lg transition-colors text-sm
                      ${showAsActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                  
                  {/* Subitems with animation */}
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="pl-7 mt-1 border-l border-gray-200 ml-4">
                      {item.subItems?.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const isSubActive = isModuleActive(subItem.path);
                        
                        return (
                          <a
                            key={subItem.path}
                            href={subItem.path}
                            onClick={(e) => handleNavigation(e, subItem.path)}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm
                              ${isSubActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
                          >
                            <SubIcon size={16} />
                            <span>{subItem.label}</span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <a 
                  href={item.path}
                  onClick={(e) => handleNavigation(e, item.path)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm
                    ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </a>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
}