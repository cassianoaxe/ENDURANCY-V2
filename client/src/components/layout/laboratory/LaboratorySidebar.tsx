import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Archive,
  BarChart2,
  Brain,
  ChevronDown,
  ClipboardList,
  Database,
  FileCheck,
  FlaskConical,
  Home,
  LayoutDashboard,
  LineChart,
  Microscope,
  Plus,
  Settings,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  premium?: boolean;
  href?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  active = false,
  premium = false,
  href,
  onClick,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleClick = () => {
    if (children) {
      setIsOpen(!isOpen);
    } else if (onClick) {
      onClick();
    } else if (href) {
      window.location.href = href;
    }
  };

  return (
    <div>
      <Button
        variant="ghost"
        className={cn(
          "relative w-full justify-start gap-3 pl-3 pr-2 py-2 h-10 rounded-md text-left font-normal text-gray-600",
          active && !children && "bg-blue-50 text-blue-700",
          children && isOpen && "bg-gray-100"
        )}
        onClick={handleClick}
      >
        <span className="flex items-center gap-3">
          {icon}
          <span>{label}</span>
        </span>
        
        {premium && (
          <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-medium text-blue-600">
            PRO
          </span>
        )}
        
        {children && (
          <ChevronDown
            className={cn(
              "ml-auto h-4 w-4 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        )}
      </Button>
      
      {children && isOpen && (
        <div className="ml-4 mt-1 pl-2 border-l border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};

const LaboratorySidebar: React.FC = () => {
  // Determinar página atual
  const currentPath = window.location.pathname;

  return (
    <div className="flex flex-col w-64 bg-white border-r min-h-screen p-4 overflow-y-auto">
      <div className="flex items-center mb-6 pl-2">
        <FlaskConical className="h-6 w-6 text-blue-600 mr-2" />
        <h1 className="text-xl font-bold text-blue-800">LabAnalytics</h1>
      </div>
      
      <nav className="space-y-1 flex-1">
        <SidebarItem
          icon={<Home className="h-5 w-5" />}
          label="Dashboard"
          active={currentPath === '/laboratory'}
          href="/laboratory"
        />
        
        <SidebarItem
          icon={<ClipboardList className="h-5 w-5" />}
          label="Amostras"
          active={currentPath.includes('/laboratory/amostras')}
          href="/laboratory/amostras"
        >
          <SidebarItem
            icon={<Plus className="h-4 w-4" />}
            label="Nova Amostra"
            href="/laboratory/amostras/nova"
          />
          <SidebarItem
            icon={<Archive className="h-4 w-4" />}
            label="Histórico"
            href="/laboratory/amostras/historico"
          />
        </SidebarItem>
        
        <SidebarItem
          icon={<Database className="h-5 w-5" />}
          label="Resultados"
          active={currentPath.includes('/laboratory/resultados')}
          href="/laboratory/resultados"
        >
          <SidebarItem
            icon={<FileCheck className="h-4 w-4" />}
            label="Certificados"
            href="/laboratory/resultados/certificados"
          />
          <SidebarItem
            icon={<BarChart2 className="h-4 w-4" />}
            label="Relatórios"
            href="/laboratory/resultados/relatorios"
          />
        </SidebarItem>
        
        <SidebarItem
          icon={<Microscope className="h-5 w-5" />}
          label="Análises"
          active={currentPath.includes('/laboratory/analises')}
          href="/laboratory/analises"
        >
          <SidebarItem
            icon={<FileCheck className="h-4 w-4" />}
            label="Canabinoides"
            href="/laboratory/analises/canabinoides"
          />
          <SidebarItem
            icon={<FileCheck className="h-4 w-4" />}
            label="Terpenos"
            href="/laboratory/analises/terpenos"
          />
          <SidebarItem
            icon={<FileCheck className="h-4 w-4" />}
            label="Contaminantes"
            href="/laboratory/analises/contaminantes"
          />
        </SidebarItem>
        
        <SidebarItem
          icon={<LineChart className="h-5 w-5" />}
          label="Estatísticas"
          active={currentPath.includes('/laboratory/estatisticas')}
          href="/laboratory/estatisticas"
        />
        
        <SidebarItem
          icon={<LayoutDashboard className="h-5 w-5" />}
          label="Operações"
          active={currentPath.includes('/laboratory/operacoes')}
          href="/laboratory/operacoes"
        >
          <SidebarItem
            icon={<Users className="h-4 w-4" />}
            label="Equipe"
            href="/laboratory/operacoes/equipe"
          />
          <SidebarItem
            icon={<Archive className="h-4 w-4" />}
            label="Inventário"
            href="/laboratory/operacoes/inventario"
          />
        </SidebarItem>

        <SidebarItem
          icon={<Brain className="h-5 w-5" />}
          label="Assistente AI"
          active={currentPath.includes('/laboratory/ai-assistant')}
          href="/laboratory/ai-assistant"
          premium
        />
        
        <SidebarItem
          icon={<Settings className="h-5 w-5" />}
          label="Configurações"
          active={currentPath.includes('/laboratory/configuracoes')}
          href="/laboratory/configuracoes"
        />
      </nav>
      
      <div className="pt-4 mt-4 border-t border-gray-200">
        <div className="px-3 py-2">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Status do Laboratório
          </div>
          <div className="mt-2 flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="ml-2 text-sm text-gray-600">Operacional</span>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Último sincronismo: 27/04/2025
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaboratorySidebar;