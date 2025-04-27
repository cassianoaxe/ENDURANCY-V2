import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  FlaskConical, 
  Microscope, 
  FileText, 
  Users, 
  Settings, 
  ChevronDown, 
  ChevronRight, 
  ListChecks, 
  Layers, 
  Beaker
} from 'lucide-react';
import { Link, useLocation } from 'wouter';

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive: boolean;
  onClick?: () => void;
}

// Componente para link da barra lateral
const SidebarLink: React.FC<SidebarLinkProps> = ({ 
  href, 
  icon, 
  children, 
  isActive,
  onClick 
}) => {
  return (
    <Link href={href}>
      <a 
        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-blue-600 ${
          isActive 
            ? 'bg-blue-50 text-blue-600' 
            : 'text-gray-700 hover:bg-blue-50'
        }`}
        onClick={onClick}
      >
        {icon}
        <span>{children}</span>
      </a>
    </Link>
  );
};

// Interface para menu colapsável
interface CollapsibleMenuProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

// Componente para menu colapsável
const CollapsibleMenu: React.FC<CollapsibleMenuProps> = ({
  title,
  icon,
  children,
  isOpen,
  onToggle
}) => {
  return (
    <div className="space-y-1">
      <button
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span>{title}</span>
        </div>
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {isOpen && (
        <div className="ml-6 space-y-1 border-l border-gray-200 pl-3">
          {children}
        </div>
      )}
    </div>
  );
};

export default function LaboratorySidebar() {
  const [location] = useLocation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    samples: false,
    tests: false,
    equipment: false
  });

  // Toggle para menu colapsável
  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  // Verificar se a rota atual corresponde ao link
  const isActive = (path: string) => {
    return location === path || location.startsWith(`${path}/`);
  };

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 bg-white h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <FlaskConical className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="font-semibold text-lg">Portal Laboratório</h2>
            <p className="text-xs text-gray-500">Dall Solutions</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1 py-2">
          <SidebarLink 
            href="/laboratory/dashboard" 
            icon={<BarChart className="h-5 w-5" />}
            isActive={isActive('/laboratory/dashboard')}
          >
            Dashboard
          </SidebarLink>

          <CollapsibleMenu
            title="Amostras"
            icon={<Beaker className="h-5 w-5" />}
            isOpen={openMenus.samples}
            onToggle={() => toggleMenu('samples')}
          >
            <SidebarLink 
              href="/laboratory/samples" 
              icon={<ListChecks className="h-5 w-5" />}
              isActive={isActive('/laboratory/samples')}
            >
              Todas as Amostras
            </SidebarLink>
            <SidebarLink 
              href="/laboratory/samples/new" 
              icon={<FileText className="h-5 w-5" />}
              isActive={isActive('/laboratory/samples/new')}
            >
              Nova Amostra
            </SidebarLink>
          </CollapsibleMenu>

          <CollapsibleMenu
            title="Testes"
            icon={<Microscope className="h-5 w-5" />}
            isOpen={openMenus.tests}
            onToggle={() => toggleMenu('tests')}
          >
            <SidebarLink 
              href="/laboratory/tests" 
              icon={<ListChecks className="h-5 w-5" />}
              isActive={isActive('/laboratory/tests')}
            >
              Todos os Testes
            </SidebarLink>
            <SidebarLink 
              href="/laboratory/tests/pending" 
              icon={<FileText className="h-5 w-5" />}
              isActive={isActive('/laboratory/tests/pending')}
            >
              Pendentes
            </SidebarLink>
            <SidebarLink 
              href="/laboratory/tests/completed" 
              icon={<FileText className="h-5 w-5" />}
              isActive={isActive('/laboratory/tests/completed')}
            >
              Concluídos
            </SidebarLink>
          </CollapsibleMenu>

          <CollapsibleMenu
            title="Equipamentos"
            icon={<Layers className="h-5 w-5" />}
            isOpen={openMenus.equipment}
            onToggle={() => toggleMenu('equipment')}
          >
            <SidebarLink 
              href="/laboratory/equipment" 
              icon={<ListChecks className="h-5 w-5" />}
              isActive={isActive('/laboratory/equipment')}
            >
              Todos Equipamentos
            </SidebarLink>
            <SidebarLink 
              href="/laboratory/equipment/maintenance" 
              icon={<FileText className="h-5 w-5" />}
              isActive={isActive('/laboratory/equipment/maintenance')}
            >
              Manutenções
            </SidebarLink>
          </CollapsibleMenu>

          <SidebarLink 
            href="/laboratory/reports" 
            icon={<FileText className="h-5 w-5" />}
            isActive={isActive('/laboratory/reports')}
          >
            Relatórios
          </SidebarLink>

          <SidebarLink 
            href="/laboratory/clients" 
            icon={<Users className="h-5 w-5" />}
            isActive={isActive('/laboratory/clients')}
          >
            Clientes
          </SidebarLink>

          <SidebarLink 
            href="/laboratory/settings" 
            icon={<Settings className="h-5 w-5" />}
            isActive={isActive('/laboratory/settings')}
          >
            Configurações
          </SidebarLink>
        </div>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
              DS
            </div>
            <div>
              <p className="text-sm font-medium">Dall Laboratory</p>
              <p className="text-xs text-gray-500">Usuário: Lab Admin</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              fetch('/api/auth/laboratory/logout', {
                method: 'POST',
                credentials: 'include'
              }).then(() => {
                window.location.href = '/laboratory';
              });
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </Button>
        </div>
      </div>
    </aside>
  );
}