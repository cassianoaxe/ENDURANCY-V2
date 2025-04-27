import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Calendar,
  ClipboardCheck,
  PillIcon,
  Settings,
  LayoutDashboard,
  FileText,
  UserSquare2,
  BookOpen,
  HelpCircle,
  ClipboardList,
  ShoppingBag,
  Package,
  CircleDollarSign,
  LineChart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type MenuItem = {
  icon: any;
  label: string;
  path: string;
  isSubmenu?: boolean;
  subItems?: MenuItem[];
};

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/pharmacist/dashboard" },
  { icon: Calendar, label: "Agenda", path: "/pharmacist/agenda" },
  { icon: ClipboardCheck, label: "Aprovar Prescrições", path: "/pharmacist/prescricoes" },
  { icon: CircleDollarSign, label: "Caixa", path: "/pharmacist/caixa" },
  { icon: LineChart, label: "Financeiro", path: "/pharmacist/financeiro" },
  { icon: PillIcon, label: "Estoque", path: "/pharmacist/estoque" },
  { icon: Package, label: "Produtos", path: "/pharmacist/produtos" },
  { icon: ShoppingBag, label: "Pedidos", path: "/pharmacist/pedidos" },
  { icon: Users, label: "Pacientes", path: "/pharmacist/pacientes" },
  { icon: FileText, label: "Relatórios", path: "/pharmacist/relatorios" },
  { icon: UserSquare2, label: "Meu Perfil", path: "/pharmacist/perfil" },
  { icon: Settings, label: "Configurações", path: "/pharmacist/configuracoes" },
  { icon: HelpCircle, label: "Ajuda e Suporte", path: "/pharmacist/ajuda" }
];

export default function PharmacistSidebar() {
  // Get current path for active state
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [collapsed, setCollapsed] = useState(false);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [organizationName, setOrganizationName] = useState("");

  // Buscar dados da organização
  const { data: organizationData } = useQuery({
    queryKey: ['organization', user?.organizationId],
    queryFn: async () => {
      if (!user?.organizationId) return null;
      const response = await axios.get(`/api/organizations/${user.organizationId}`);
      return response.data;
    },
    enabled: !!user?.organizationId
  });

  useEffect(() => {
    if (organizationData) {
      setOrganizationName(organizationData.name || "");
    }
  }, [organizationData]);

  useEffect(() => {
    // Update current path when location changes
    const updatePath = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', updatePath);
    return () => window.removeEventListener('popstate', updatePath);
  }, []);

  const handleClick = (path: string) => {
    // Usar window.history.pushState para garantir que o evento popstate seja acionado
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
    setCurrentPath(path);
  };

  return (
    <div className={cn(
      "h-full bg-white border-r flex flex-col transition-all duration-300",
      collapsed ? "w-[60px]" : "w-[260px]"
    )}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        {!collapsed && (
          <div className="flex flex-col">
            <div className="flex items-center">
              <PillIcon className="h-6 w-6 text-green-600 mr-2" />
              <span className="font-semibold text-lg">Farmácia {organizationName ? organizationName : ''}</span>
            </div>
            <div className="flex items-center ml-8">
              <span className="text-xs text-gray-500">Endurancy</span>
              <span className="ml-1 px-1 py-0.5 text-[0.6rem] font-medium bg-blue-100 text-blue-700 rounded">Beta</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center w-full">
            <PillIcon className="h-6 w-6 text-green-600" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={collapsed ? "ml-0" : "ml-auto"}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
      
      <Separator />
      
      {/* Profile quick info */}
      {!collapsed && (
        <div className="p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-700 font-medium">
                {user?.name?.charAt(0) || "F"}
              </span>
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name || "Farmacêutico"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || "farmaceutico@endurancy.com"}</p>
            </div>
          </div>
        </div>
      )}
      
      <Separator />
      
      {/* Menu */}
      <div className="flex-1 overflow-y-auto py-2">
        <nav className="flex flex-col gap-1 px-2">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant={currentPath === item.path ? "secondary" : "ghost"}
              className={cn(
                "justify-start h-10",
                currentPath === item.path && "bg-green-50 text-green-800 hover:bg-green-100",
                collapsed && "px-2"
              )}
              onClick={() => handleClick(item.path)}
            >
              <item.icon className={cn("h-5 w-5", currentPath === item.path ? "text-green-600" : "text-gray-500")} />
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </Button>
          ))}
        </nav>
      </div>
      
      {/* Footer */}
      <div className="p-4">
        {!collapsed && (
          <div className="text-xs text-center text-gray-500">
            <div className="flex items-center justify-center">
              <p>Endurancy</p>
              <span className="ml-1 px-1 py-0.5 text-[0.6rem] font-medium bg-blue-100 text-blue-700 rounded">Beta</span>
              <p className="ml-1">&copy; {new Date().getFullYear()}</p>
            </div>
            <p>Versão 1.0</p>
          </div>
        )}
      </div>
    </div>
  );
}