import React, { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutGrid,
  Users,
  Sprout,
  PackageOpen,
  Flower,
  Store,
  CreditCard,
  Mail,
  Building2,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  PackageCheck,
  Puzzle,
  ListChecks,
  Home,
  Leaf,
  BookOpen,
  PlusCircle,
  Calendar,
  Search,
  AlertCircle,
  BellRing,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { OrganizationBadge } from "@/components/organization/OrganizationBadge";
import { Organization, Module } from "@shared/schema";

export default function OrgSidebar({ openMobile, setOpenMobile }: { openMobile: boolean, setOpenMobile: (open: boolean) => void }) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [location] = useLocation();

  // Obter organização do usuário atual
  const { data: organization } = useQuery<Organization>({
    queryKey: ["/api/organization/current"],
    enabled: user?.role === "org_admin" && !!user?.organizationId
  });

  // Obter módulos ativos para esta organização
  const { data: activeModules = [] } = useQuery<Module[]>({
    queryKey: ["/api/modules/active"],
    enabled: !!user?.organizationId
  });

  // Verificar se cada módulo está ativo
  const isModuleActive = (moduleType: string) => {
    return activeModules.some((module) => module.type === moduleType);
  };

  // Link ativo
  const isActive = (path: string) => {
    return location === path;
  };

  // Determinar qual dos módulos básicos está ativo
  const hasHealthModule = isModuleActive("saude");
  const hasCultivationModule = isModuleActive("cultivo");
  const hasProductionModule = isModuleActive("producao");

  // Funções para gerenciar sessão/navegação
  const closeMenu = () => {
    setOpenMobile(false);
  };

  const goTo = (path: string) => {
    navigate(path);
    closeMenu();
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 bg-background shadow-sm border-r z-30 transition-all duration-300 flex flex-col",
        sidebarExpanded ? "w-64" : "w-20",
        openMobile ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      {/* Cabeçalho da Sidebar */}
      <div className="p-4 flex items-center border-b justify-between">
        <div className="flex items-center gap-3">
          <OrganizationBadge 
            name={organization?.name || "Org"} 
            tier={organization?.planTier || "free"} 
            compact={!sidebarExpanded} 
          />
          {sidebarExpanded && (
            <span className="text-sm font-medium truncate max-w-[140px]">
              {organization?.name || "Minha Organização"}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex"
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
        >
          {sidebarExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </Button>
      </div>

      {/* Links de navegação */}
      <div className="flex-1 overflow-y-auto pb-10">
        <nav className="py-2 px-1 space-y-1">
          {/* Dashboard */}
          <Button
            variant={isActive("/") || isActive("/dashboard") ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              !sidebarExpanded && "justify-center px-0"
            )}
            onClick={() => goTo("/")}
          >
            <LayoutGrid
              size={18}
              className={cn("mr-2", !sidebarExpanded && "mr-0")}
            />
            {sidebarExpanded && <span>Dashboard</span>}
          </Button>

          {/* Home */}
          <Button
            variant={isActive("/organization/dashboard") ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              !sidebarExpanded && "justify-center px-0"
            )}
            onClick={() => goTo("/organization/dashboard")}
          >
            <Home
              size={18}
              className={cn("mr-2", !sidebarExpanded && "mr-0")}
            />
            {sidebarExpanded && <span>Home</span>}
          </Button>

          {/* Módulos Adquiridos */}
          {sidebarExpanded ? (
            <div className="px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground">
                MÓDULOS ATIVOS
              </p>
            </div>
          ) : (
            <div className="my-2 px-2">
              <div className="h-px bg-border" />
            </div>
          )}

          {/* Módulo de Onboarding */}
          <Button
            variant={isActive("/organization/onboarding") ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              !sidebarExpanded && "justify-center px-0"
            )}
            onClick={() => goTo("/organization/onboarding")}
          >
            <ListChecks
              size={18}
              className={cn("mr-2", !sidebarExpanded && "mr-0")}
            />
            {sidebarExpanded && <span>Onboarding</span>}
          </Button>

          {/* Módulo de Associados */}
          <Button
            variant={isActive("/organization/users") ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              !sidebarExpanded && "justify-center px-0"
            )}
            onClick={() => goTo("/organization/users")}
          >
            <Users
              size={18}
              className={cn("mr-2", !sidebarExpanded && "mr-0")}
            />
            {sidebarExpanded && <span>Associados</span>}
          </Button>

          {/* Módulo de Cultivo (só mostrar se estiver ativo) */}
          {hasCultivationModule && (
            <Button
              variant={isActive("/organization/cultivation") ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                !sidebarExpanded && "justify-center px-0"
              )}
              onClick={() => goTo("/organization/cultivation")}
            >
              <Sprout
                size={18}
                className={cn("mr-2", !sidebarExpanded && "mr-0")}
              />
              {sidebarExpanded && <span>Cultivo</span>}
            </Button>
          )}

          {/* Módulo de Produção (só mostrar se estiver ativo) */}
          {hasProductionModule && (
            <Button
              variant={isActive("/organization/production") ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                !sidebarExpanded && "justify-center px-0"
              )}
              onClick={() => goTo("/organization/production")}
            >
              <PackageOpen
                size={18}
                className={cn("mr-2", !sidebarExpanded && "mr-0")}
              />
              {sidebarExpanded && <span>Produção</span>}
            </Button>
          )}

          {/* Módulo de Saúde (só mostrar se estiver ativo) */}
          {hasHealthModule && (
            <Button
              variant={isActive("/organization/health") ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                !sidebarExpanded && "justify-center px-0"
              )}
              onClick={() => goTo("/organization/health")}
            >
              <Leaf
                size={18}
                className={cn("mr-2", !sidebarExpanded && "mr-0")}
              />
              {sidebarExpanded && <span>Saúde</span>}
            </Button>
          )}

          {/* Módulo de Vendas */}
          <Button
            variant={isActive("/organization/sales") ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              !sidebarExpanded && "justify-center px-0"
            )}
            onClick={() => goTo("/organization/sales")}
          >
            <Store
              size={18}
              className={cn("mr-2", !sidebarExpanded && "mr-0")}
            />
            {sidebarExpanded && <span>Vendas</span>}
          </Button>

          {/* Módulo Financeiro */}
          <Button
            variant={isActive("/organization/financial") ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              !sidebarExpanded && "justify-center px-0"
            )}
            onClick={() => goTo("/organization/financial")}
          >
            <CreditCard
              size={18}
              className={cn("mr-2", !sidebarExpanded && "mr-0")}
            />
            {sidebarExpanded && <span>Financeiro</span>}
          </Button>

          {/* Informações sobre Plano */}
          {sidebarExpanded ? (
            <div className="px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground">
                PLANO & MÓDULOS
              </p>
            </div>
          ) : (
            <div className="my-2 px-2">
              <div className="h-px bg-border" />
            </div>
          )}

          {/* Meu Plano */}
          <Button
            variant={isActive("/profile?tab=plan") ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              !sidebarExpanded && "justify-center px-0"
            )}
            onClick={() => {
              window.history.pushState({}, '', '/profile?tab=plan');
              window.dispatchEvent(new Event('popstate'));
              closeMenu();
            }}
          >
            <PackageCheck
              size={18}
              className={cn("mr-2", !sidebarExpanded && "mr-0")}
            />
            {sidebarExpanded && <span>Meu Plano</span>}
          </Button>

          {/* Módulos Disponíveis */}
          <Button
            variant={isActive("/organization/modules") ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              !sidebarExpanded && "justify-center px-0"
            )}
            onClick={() => goTo("/organization/modules")}
          >
            <Puzzle
              size={18}
              className={cn("mr-2", !sidebarExpanded && "mr-0")}
            />
            {sidebarExpanded && <span>Módulos Disponíveis</span>}
          </Button>

          {/* Minhas Solicitações */}
          <Button
            variant={isActive("/organization/requests") ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              !sidebarExpanded && "justify-center px-0"
            )}
            onClick={() => goTo("/organization/requests")}
          >
            <AlertCircle
              size={18}
              className={cn("mr-2", !sidebarExpanded && "mr-0")}
            />
            {sidebarExpanded && <span>Minhas Solicitações</span>}
          </Button>

          {/* Seção de Suporte */}
          {sidebarExpanded ? (
            <div className="px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground">
                SUPORTE
              </p>
            </div>
          ) : (
            <div className="my-2 px-2">
              <div className="h-px bg-border" />
            </div>
          )}

          {/* Documentação */}
          <Button
            variant={isActive("/organization/documentation") ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              !sidebarExpanded && "justify-center px-0"
            )}
            onClick={() => goTo("/organization/documentation")}
          >
            <BookOpen
              size={18}
              className={cn("mr-2", !sidebarExpanded && "mr-0")}
            />
            {sidebarExpanded && <span>Documentação</span>}
          </Button>

          {/* Suporte */}
          <Button
            variant={isActive("/organization/support") ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              !sidebarExpanded && "justify-center px-0"
            )}
            onClick={() => goTo("/organization/support")}
          >
            <HelpCircle
              size={18}
              className={cn("mr-2", !sidebarExpanded && "mr-0")}
            />
            {sidebarExpanded && <span>Suporte</span>}
          </Button>
        </nav>
      </div>

      {/* Rodapé da Sidebar */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <ThemeToggle />
          {sidebarExpanded && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => goTo("/tickets/new")}
            >
              <PlusCircle size={14} className="mr-1" />
              Novo Chamado
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}