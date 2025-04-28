import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Beaker,
  ChevronDown,
  ClipboardList,
  Cog,
  FileText,
  FlaskConical,
  Gauge,
  Home,
  Laptop,
  LayoutDashboard,
  Microscope,
  Settings,
  Users,
  TestTube, // Usando TestTube no lugar de Vial
  CircleDollarSign,
  Receipt,
  CreditCard,
  BarChart4,
  Link as LinkIcon,
} from 'lucide-react';

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  isCollapsed?: boolean;
  isExternal?: boolean;
  badge?: React.ReactNode;
}

const SidebarLink = ({
  href,
  icon,
  label,
  isActive,
  isCollapsed,
  isExternal,
  badge,
}: SidebarLinkProps) => {
  const content = (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
        isActive
          ? 'bg-blue-100 text-blue-900'
          : 'text-gray-500 hover:bg-blue-50 hover:text-blue-700'
      )}
    >
      <div className="text-lg">{icon}</div>
      {!isCollapsed && (
        <div className="flex flex-1 items-center justify-between">
          <span>{label}</span>
          {badge && <span>{badge}</span>}
        </div>
      )}
    </div>
  );

  // Render content with or without tooltip
  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <a href={href} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined}>
              {content}
            </a>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-normal">
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <a href={href} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined}>
      {content}
    </a>
  );
};

interface SidebarSectionProps {
  title?: string;
  children: React.ReactNode;
  isCollapsed?: boolean;
  defaultOpen?: boolean;
}

const SidebarSection = ({ title, children, isCollapsed, defaultOpen = false }: SidebarSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // If collapsed, render without expandable section
  if (isCollapsed) {
    return <div className="mt-2">{children}</div>;
  }

  // If no title, render without expandable section
  if (!title) {
    return <div className="mt-2">{children}</div>;
  }

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-gray-600 hover:text-blue-700"
      >
        {title}
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>
      <div className={cn("mt-1 space-y-1", !isOpen && "hidden")}>{children}</div>
    </div>
  );
};

interface LaboratorySidebarProps {
  isCollapsed?: boolean;
}

export default function LaboratorySidebar({ isCollapsed = false }: LaboratorySidebarProps) {
  // Get current path to determine active link
  const currentPath = window.location.pathname;

  return (
    <div
      className={cn(
        "flex h-full flex-col gap-2 border-r bg-white p-2",
        isCollapsed ? "w-[60px]" : "w-[240px]"
      )}
    >
      <div className="flex h-14 items-center justify-center border-b px-2">
        {isCollapsed ? (
          <FlaskConical className="h-6 w-6 text-blue-600" />
        ) : (
          <div className="flex items-center">
            <FlaskConical className="h-6 w-6 text-blue-600 mr-2" />
            <span className="text-lg font-bold text-blue-700">LabAnalytics</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded ml-1">BETA</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <div className="flex flex-col gap-1 px-2">
          <SidebarLink
            href="/laboratory/dashboard"
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            isActive={currentPath === '/laboratory/dashboard'}
            isCollapsed={isCollapsed}
          />

          <SidebarSection 
            title="Amostras & Testes" 
            isCollapsed={isCollapsed}
            defaultOpen={
              currentPath.includes('/laboratory/amostras') || 
              currentPath.includes('/laboratory/resultados') ||
              currentPath.includes('/laboratory/test-analysis')
            }
          >
            <SidebarLink
              href="/laboratory/amostras"
              icon={<TestTube size={20} />}
              label="Amostras"
              isActive={currentPath === '/laboratory/amostras'}
              isCollapsed={isCollapsed}
            />
            <SidebarLink
              href="/laboratory/resultados"
              icon={<FileText size={20} />}
              label="Resultados"
              isActive={currentPath === '/laboratory/resultados'}
              isCollapsed={isCollapsed}
            />
            <SidebarLink
              href="/laboratory/test-analysis"
              icon={<ClipboardList size={20} />}
              label="Análise de Teste"
              isActive={currentPath === '/laboratory/test-analysis'}
              isCollapsed={isCollapsed}
            />
          </SidebarSection>

          <SidebarSection 
            title="Gerenciamento" 
            isCollapsed={isCollapsed}
            defaultOpen={
              currentPath.includes('/laboratory/clientes') || 
              currentPath.includes('/laboratory/equipamentos')
            }
          >
            <SidebarLink
              href="/laboratory/clientes"
              icon={<Users size={20} />}
              label="Clientes"
              isActive={currentPath === '/laboratory/clientes'}
              isCollapsed={isCollapsed}
            />
            <SidebarLink
              href="/laboratory/equipamentos"
              icon={<Microscope size={20} />}
              label="Equipamentos"
              isActive={currentPath === '/laboratory/equipamentos'}
              isCollapsed={isCollapsed}
            />
          </SidebarSection>
          
          <SidebarSection 
            title="Financeiro" 
            isCollapsed={isCollapsed}
            defaultOpen={currentPath.includes('/laboratory/financeiro')}
          >
            <SidebarLink
              href="/laboratory/financeiro"
              icon={<CircleDollarSign size={20} />}
              label="Dashboard"
              isActive={currentPath === '/laboratory/financeiro'}
              isCollapsed={isCollapsed}
            />
            <SidebarLink
              href="/laboratory/financeiro/faturas"
              icon={<Receipt size={20} />}
              label="Faturas"
              isActive={currentPath === '/laboratory/financeiro/faturas'}
              isCollapsed={isCollapsed}
            />
            <SidebarLink
              href="/laboratory/financeiro/pagamentos"
              icon={<CreditCard size={20} />}
              label="Pagamentos"
              isActive={currentPath === '/laboratory/financeiro/pagamentos'}
              isCollapsed={isCollapsed}
            />
            <SidebarLink
              href="/laboratory/financeiro/relatorios"
              icon={<BarChart4 size={20} />}
              label="Relatórios"
              isActive={currentPath === '/laboratory/financeiro/relatorios'}
              isCollapsed={isCollapsed}
            />
            <SidebarLink
              href="/laboratory/financeiro/links"
              icon={<LinkIcon size={20} />}
              label="Links de Pagamento"
              isActive={currentPath === '/laboratory/financeiro/links'}
              isCollapsed={isCollapsed}
            />
          </SidebarSection>

          <SidebarSection 
            title="HPLC" 
            isCollapsed={isCollapsed}
            defaultOpen={currentPath.includes('/laboratory/hplc')}
          >
            <SidebarLink
              href="/laboratory/hplc/dashboard"
              icon={<Gauge size={20} />}
              label="Dashboard HPLC"
              isActive={currentPath === '/laboratory/hplc/dashboard'}
              isCollapsed={isCollapsed}
            />
            <SidebarLink
              href="/laboratory/hplc/equipments"
              icon={<Laptop size={20} />}
              label="Equipamentos HPLC"
              isActive={currentPath === '/laboratory/hplc/equipments'}
              isCollapsed={isCollapsed}
            />
            <SidebarLink
              href="/laboratory/hplc/runs"
              icon={<Beaker size={20} />}
              label="Corridas"
              isActive={currentPath === '/laboratory/hplc/runs'}
              isCollapsed={isCollapsed}
            />
          </SidebarSection>
        </div>
      </div>

      <div className="mt-auto border-t pt-2">
        <SidebarLink
          href="/laboratory/configuracoes"
          icon={<Settings size={20} />}
          label="Configurações"
          isActive={currentPath === '/laboratory/configuracoes'}
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          href="/api/auth/logout"
          icon={<Cog size={20} />}
          label="Sair"
          isCollapsed={isCollapsed}
        />
      </div>
    </div>
  );
}