import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Calendar,
  ClipboardCheck,
  Stethoscope,
  Settings,
  LayoutDashboard,
  FileText,
  ClipboardList,
  UserSquare2,
  BookOpen,
  Building
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
  { icon: LayoutDashboard, label: "Dashboard", path: "/doctor/dashboard" },
  { icon: Calendar, label: "Agenda", path: "/doctor/agenda" },
  { icon: Users, label: "Pacientes", path: "/doctor/pacientes" },
  { icon: ClipboardList, label: "Prontuários", path: "/doctor/prontuarios" },
  { icon: ClipboardCheck, label: "Prescrições", path: "/doctor/prescricoes" },
  { icon: Stethoscope, label: "Consultas", path: "/doctor/consultas" },
  { icon: FileText, label: "Relatórios", path: "/doctor/relatorios" },
  { icon: UserSquare2, label: "Meu Perfil", path: "/doctor/perfil" },
  { icon: BookOpen, label: "Biblioteca", path: "/doctor/biblioteca" },
  { icon: Settings, label: "Configurações", path: "/doctor/configuracoes" }
];

export default function DoctorSidebar() {
  // Get current path for active state
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [collapsed, setCollapsed] = useState(false);
  const [, navigate] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const handlePathChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePathChange);
    
    return () => {
      window.removeEventListener('popstate', handlePathChange);
    };
  }, []);

  const handleNavigation = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    navigate(path);
  };

  const renderMenuItem = (item: MenuItem) => {
    const isActive = currentPath === item.path || 
                    (item.subItems && item.subItems.some(subitem => currentPath === subitem.path));
    
    const IconComponent = item.icon;
    
    return (
      <div key={item.path} className="mb-1">
        <a
          href={item.path}
          onClick={(e) => handleNavigation(e, item.path)}
          className={cn(
            "flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors",
            isActive 
              ? "bg-primary/10 text-primary" 
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          )}
        >
          <IconComponent className={cn("h-5 w-5 mr-2", collapsed ? "mr-0" : "mr-2")} />
          {!collapsed && <span>{item.label}</span>}
        </a>
      </div>
    );
  };

  return (
    <div className={`${collapsed ? 'w-[70px]' : 'w-[240px]'} h-screen bg-white border-r fixed left-0 top-0 transition-all duration-300 overflow-auto`}>
      <div className="p-4 border-b flex justify-between items-center">
        <a 
          href="/doctor/dashboard" 
          onClick={(e) => handleNavigation(e, '/doctor/dashboard')}
          className="flex items-center gap-2"
        >
          <Stethoscope className="h-6 w-6 text-primary" />
          {!collapsed && <span className="text-xl font-semibold">Portal Médico</span>}
        </a>
        
        {/* Botão de retrair/expandir a sidebar */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-gray-700"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      
      <div className="p-4 border-b">
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user?.name || "Dr(a). Nome"}</span>
            <span className="text-xs text-gray-500">Médico(a)</span>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
              {user?.name?.[0]?.toUpperCase() || "M"}
            </div>
          </div>
        )}
      </div>

      <Separator />
      
      <nav className={`flex flex-col p-2 gap-1 mt-2 sidebar-nav ${collapsed ? 'px-2' : 'px-3'}`}>
        {menuItems.map((item) => renderMenuItem(item))}
      </nav>
    </div>
  );
}