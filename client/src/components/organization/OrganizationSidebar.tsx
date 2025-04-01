import React from 'react';
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, Users, ShoppingCart, Calendar, FileText, PieChart, 
  Settings, HelpCircle, Leaf, Package, Building2, CreditCard, BellRing,
  ExternalLink, BookOpen, Sprout
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  external?: boolean;
  badge?: string | number;
}

function SidebarItem({ 
  icon, 
  label, 
  href, 
  active = false, 
  external = false,
  badge 
}: SidebarItemProps) {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
          active ? "bg-muted font-medium text-primary" : "text-muted-foreground"
        )}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {icon}
        <span>{label}</span>
        {external && <ExternalLink className="ml-auto h-4 w-4" />}
        {badge && (
          <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            {badge}
          </span>
        )}
      </a>
    </Link>
  );
}

export default function OrganizationSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  // Definir módulos ativos (em um cenário real, isso viria da API)
  const activeModules = [
    { id: 1, name: 'Dashboard', href: '/organization/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 2, name: 'Associados', href: '/organization/associados', icon: <Users className="h-4 w-4" /> },
    { id: 3, name: 'Vendas', href: '/organization/vendas', icon: <ShoppingCart className="h-4 w-4" /> },
    { id: 4, name: 'Cultivo', href: '/organization/cultivo', icon: <Leaf className="h-4 w-4" /> },
    { id: 5, name: 'Financeiro', href: '/organization/financeiro', icon: <CreditCard className="h-4 w-4" /> },
    { id: 6, name: 'Relatórios', href: '/organization/relatorios', icon: <PieChart className="h-4 w-4" /> },
  ];

  // Lista de módulos adicionais
  const configOptions = [
    { name: 'Meu Plano', href: '/organization/meu-plano', icon: <Package className="h-4 w-4" /> },
    { name: 'Configurações', href: '/organization/configuracoes', icon: <Settings className="h-4 w-4" /> },
    { name: 'Chamados', href: '/organization/chamados', icon: <HelpCircle className="h-4 w-4" /> },
    { name: 'Notificações', href: '/organization/notificacoes', icon: <BellRing className="h-4 w-4" /> },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col bg-card border-r p-4 h-screen overflow-y-auto sticky top-0">
      <div className="flex items-center gap-2 px-2 mb-4">
        <Sprout className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">Endurancy</h1>
      </div>
      
      <div className="px-3 py-2">
        <h3 className="mb-2 text-sm font-medium">Organização</h3>
        <div className="text-sm font-semibold mb-1">
          {user?.name || "Minha Organização"}
        </div>
        <div className="text-xs text-muted-foreground">
          {user?.email}
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <nav className="flex-1 space-y-2 px-2">
        <h3 className="mb-2 text-xs font-medium text-muted-foreground">MÓDULOS</h3>
        {activeModules.map((module) => (
          <SidebarItem
            key={module.id}
            icon={module.icon}
            label={module.name}
            href={module.href}
            active={location === module.href}
          />
        ))}
        
        <Separator className="my-4" />
        
        <h3 className="mb-2 text-xs font-medium text-muted-foreground">CONFIGURAÇÕES</h3>
        {configOptions.map((option, index) => (
          <SidebarItem
            key={index}
            icon={option.icon}
            label={option.name}
            href={option.href}
            active={location === option.href}
            badge={option.name === 'Notificações' ? 3 : undefined}
          />
        ))}
      </nav>
      
      <div className="pt-4 pb-2">
        <div className="px-3 py-2 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-1">Precisa de ajuda?</h4>
          <p className="text-xs text-muted-foreground mb-2">
            Acesse nossa documentação para dúvidas comuns.
          </p>
          <Button variant="outline" className="w-full text-xs h-8" asChild>
            <Link href="/docs">
              <BookOpen className="mr-2 h-3 w-3" />
              Documentação
            </Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}