import React, { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Bell, Settings, LogOut, Menu, X, Beaker, TestTube, Database, ListChecks, BarChart3, UsersRound, Home } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    name: "Dashboard",
    icon: <Home size={20} />,
    href: "/laboratory/dashboard",
  },
  {
    name: "Amostras",
    icon: <Beaker size={20} />,
    href: "/laboratory/samples",
  },
  {
    name: "Testes",
    icon: <TestTube size={20} />,
    href: "/laboratory/tests",
  },
  {
    name: "Resultados",
    icon: <Database size={20} />,
    href: "/laboratory/results",
  },
  {
    name: "Controle de Qualidade",
    icon: <ListChecks size={20} />,
    href: "/laboratory/quality",
  },
  {
    name: "Relatórios",
    icon: <BarChart3 size={20} />,
    href: "/laboratory/reports",
  },
  {
    name: "Técnicos",
    icon: <UsersRound size={20} />,
    href: "/laboratory/technicians",
  },
];

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  profilePhoto?: string;
}

export default function LaboratoryLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [location] = useLocation();
  const { toast } = useToast();

  const { data: userData, isLoading } = useQuery<User>({
    queryKey: ['/api/auth/me'],
  });

  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ['/api/notifications'],
    enabled: !!userData,
  });

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        window.location.href = '/login';
      } else {
        toast({
          title: 'Erro ao sair',
          description: 'Não foi possível desconectar. Tente novamente.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: 'Erro ao sair',
        description: 'Ocorreu um erro ao tentar desconectar.',
        variant: 'destructive',
      });
    }
  };

  // Efetuar verificações de atualizações de sistema a cada 5 minutos
  useEffect(() => {
    // Simulação de verificação de atualizações
    const checkForUpdates = () => {
      // Lógica para verificar atualizações do sistema
      console.log("Verificando atualizações do sistema laboratorial...");
    };

    checkForUpdates();
    const interval = setInterval(checkForUpdates, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar para desktop (sempre visível) e mobile (pode ser aberta/fechada) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:relative lg:translate-x-0" // No desktop, sempre visível
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link href="/laboratory/dashboard">
            <div className="flex items-center cursor-pointer">
              <Beaker className="h-6 w-6 text-emerald-600" />
              <span className="ml-2 text-lg font-semibold">Portal Laboratório</span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </Button>
        </div>

        <div className="flex-1 px-4 py-4 overflow-y-auto">
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    location === item.href
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <span className="mr-3 text-emerald-500">{item.icon}</span>
                  {item.name}
                </a>
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="mt-2">
            <p className="text-xs text-gray-500">
              Portal Laboratório v1.0.2
            </p>
            <details className="mt-1">
              <summary className="text-xs text-emerald-600 cursor-pointer">
                Changelog
              </summary>
              <div className="mt-2 text-xs text-gray-600">
                <p className="mb-1 font-medium">v1.0.2 (12 Abr, 2024)</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Melhorias no módulo de rastreamento de amostras</li>
                  <li>Correção de bugs no fluxo de aprovação</li>
                </ul>
                <p className="mt-2 mb-1 font-medium">v1.0.1 (5 Abr, 2024)</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Relatórios de canabinoides adicionados</li>
                  <li>Integração com sistema de notificações</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </aside>

      {/* Sobreposição escura quando o sidebar está aberto no mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Conteúdo principal */}
      <main className="relative flex-1 overflow-y-auto">
        {/* Cabeçalho */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={20} />
          </Button>

          <div className="flex items-center ml-auto space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell size={20} />
                  {unreadNotifications > 0 && (
                    <Badge
                      className="absolute -top-1 -right-1 px-1.5 min-w-[18px] h-4 bg-red-500"
                    >
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="py-2 px-3 text-sm text-gray-500">
                    Nenhuma notificação.
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <DropdownMenuItem key={notification.id} className="cursor-pointer">
                      <div className="flex flex-col space-y-1">
                        <p className={cn("text-sm", !notification.read && "font-medium")}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {notification.message}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
                <DropdownMenuSeparator />
                <Link href="/laboratory/notifications">
                  <DropdownMenuItem className="cursor-pointer text-emerald-600">
                    Ver todas
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none">
                  {isLoading ? (
                    <Skeleton className="w-8 h-8 rounded-full" />
                  ) : (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={userData?.profilePhoto} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700">
                        {userData?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isLoading ? (
                  <div className="p-2">
                    <Skeleton className="w-full h-5 mb-2" />
                    <Skeleton className="w-3/4 h-4" />
                  </div>
                ) : (
                  <>
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span>{userData?.name || "Usuário"}</span>
                        <span className="text-xs text-gray-500">{userData?.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/laboratory/profile">
                      <DropdownMenuItem className="cursor-pointer">
                        <div className="flex items-center">
                          <Settings size={16} className="mr-2" />
                          <span>Configurações</span>
                        </div>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <div className="flex items-center text-red-600">
                        <LogOut size={16} className="mr-2" />
                        <span>Sair</span>
                      </div>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}