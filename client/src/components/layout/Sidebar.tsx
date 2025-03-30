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
  Link
} from "lucide-react";

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: BarChart2, label: "Analytics", path: "/analytics" },
  { icon: FileText, label: "Registro de Atividades", path: "/activity-log" },
  { icon: Database, label: "Backups", path: "/backups" },
  { icon: AlertTriangle, label: "Emergências", path: "/emergencies" },
  { icon: Package, label: "Planos", path: "/plans" },
  { icon: Blocks, label: "Módulos", path: "/modules" },
  { icon: Package, label: "Módulos por Organização", path: "/organization-modules" },
  { icon: Building2, label: "Organizações", path: "/organizations" },
  { icon: InboxIcon, label: "Solicitações", path: "/requests" },
  { icon: Wallet, label: "Financeiro", path: "/financial" },
  { icon: Mail, label: "Templates de Email", path: "/email-templates" },
  { icon: Users, label: "Administradores", path: "/administrators" },
  { icon: Settings, label: "Configurações", path: "/settings" },
  { icon: Link, label: "Lista de URLs", path: "/routes-list" }
];

export default function Sidebar() {
  // Get current path for active state
  const [currentPath, setCurrentPath] = React.useState(window.location.pathname);

  // Update current path when URL changes
  React.useEffect(() => {
    const handleNavigation = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  // Custom navigation handler that updates the URL without page reload
  const handleNavigation = (event: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    event.preventDefault();
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    // Dispatch a custom event to notify AppContent about path change
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <div className="w-[240px] h-screen bg-white border-r fixed left-0 top-0">
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
          const isActive = currentPath === item.path;
          return (
            <a 
              key={item.path} 
              href={item.path}
              onClick={(e) => handleNavigation(e, item.path)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm
                ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}