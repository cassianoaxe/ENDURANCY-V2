import React, { ReactNode, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Beaker,
  Clock,
  FileSpreadsheet,
  FlaskConical,
  Home,
  LayoutDashboard,
  ListChecks,
  School,
  Settings,
  TestTube,
  Wrench,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

type HplcMenuItem = {
  icon: React.ElementType;
  title: string;
  href: string;
  description?: string;
  submenu?: HplcMenuItem[];
};

// Definição dos itens de menu do HPLC
const hplcMenuItems: HplcMenuItem[] = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    href: "/laboratory/hplc/dashboard",
    description: "Visão geral do módulo HPLC",
  },
  {
    icon: FlaskConical,
    title: "Equipamentos",
    href: "/laboratory/hplc/equipments",
    description: "Gerenciar equipamentos HPLC",
  },
  {
    icon: Wrench,
    title: "Manutenções",
    href: "/laboratory/hplc/maintenances",
    description: "Agendar e monitorar manutenções",
  },
  {
    icon: TestTube,
    title: "Consumíveis",
    href: "/laboratory/hplc/consumables",
    description: "Gerenciar consumíveis e estoque",
  },
  {
    icon: Beaker,
    title: "Corridas",
    href: "/laboratory/hplc/runs",
    description: "Registrar e monitorar corridas",
  },
  {
    icon: FileSpreadsheet,
    title: "Procedimentos",
    href: "/laboratory/hplc/procedures",
    description: "Documentação e procedimentos operacionais",
  },
  {
    icon: ListChecks,
    title: "Validações",
    href: "/laboratory/hplc/validations",
    description: "Validação de métodos analíticos",
  },
  {
    icon: School,
    title: "Treinamentos",
    href: "/laboratory/hplc/trainings",
    description: "Gestão de treinamentos",
  },
];

interface HplcLayoutProps {
  children: ReactNode;
}

export default function HplcLayout({ children }: HplcLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Consulta para obter dados do perfil do laboratório (se necessário)
  const { data: laboratoryProfile } = useQuery({
    queryKey: ["/api/laboratory/profile"],
    enabled: !!user,
  });

  const SidebarMenuItem = ({ item }: { item: HplcMenuItem }) => {
    const isActive = location === item.href;
    console.log(`Renderizando item de menu: ${item.title}, href: ${item.href}, isActive: ${isActive}`);
    
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault(); // Impedir comportamento padrão do link
      console.log(`Clicou em: ${item.title}, navegando para: ${item.href}`);
      
      // Navegação manual usando window.history e disparo de evento personalizado
      window.history.pushState({}, '', item.href);
      
      // Disparar tanto evento popstate quanto navegação customizada
      window.dispatchEvent(new Event('popstate'));
      window.dispatchEvent(new CustomEvent('navigation', { detail: { path: item.href } }));
      
      // Forçar atualização do DOM adicionando classe temporária
      document.body.classList.add('navigating');
      setTimeout(() => {
        document.body.classList.remove('navigating');
      }, 10);
    };
    
    return (
      <li>
        <a href={item.href} onClick={handleClick}>
          <Button
            variant={isActive ? "default" : "ghost"}
            className="w-full justify-start"
          >
            <item.icon className="h-5 w-5 mr-2" />
            <span>{item.title}</span>
          </Button>
        </a>
      </li>
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Cabeçalho principal */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex flex-1 items-center gap-4">
          {/* Logo */}
          <a 
            href="/laboratory/dashboard"
            onClick={(e) => {
              e.preventDefault();
              console.log('Clicou no logo para voltar ao lab principal');
              window.history.pushState({}, '', '/laboratory/dashboard');
              
              // Disparar tanto evento popstate quanto navegação customizada
              window.dispatchEvent(new Event('popstate'));
              window.dispatchEvent(new CustomEvent('navigation', { detail: { path: '/laboratory/dashboard' } }));
              
              // Forçar atualização do DOM adicionando classe temporária
              document.body.classList.add('navigating');
              setTimeout(() => {
                document.body.classList.remove('navigating');
              }, 10);
            }}
          >
            <Button variant="ghost" className="p-0">
              <div className="flex items-center gap-2 font-semibold">
                <Beaker className="h-6 w-6 text-primary" />
                <span className="hidden md:inline-block">Portal HPLC</span>
              </div>
            </Button>
          </a>

          {/* Navegação principal (visível apenas em telas grandes) */}
          <nav className="hidden md:flex flex-1">
            <NavigationMenu>
              <NavigationMenuList>
                {/* Link para voltar ao portal de laboratório */}
                <NavigationMenuItem>
                  <a
                    href="/laboratory/dashboard"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('Menu principal: Clicou em Laboratório');
                      window.history.pushState({}, '', '/laboratory/dashboard');
                      window.dispatchEvent(new Event('popstate'));
                    }}
                  >
                    <NavigationMenuLink
                      className={cn(
                        "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                      )}
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Laboratório
                    </NavigationMenuLink>
                  </a>
                </NavigationMenuItem>

                {/* Menu HPLC */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>HPLC</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {hplcMenuItems.map((item) => (
                        <li key={item.href}>
                          <a 
                            href={item.href}
                            onClick={(e) => {
                              e.preventDefault();
                              console.log(`Menu principal: Clicou em ${item.title}`);
                              window.history.pushState({}, '', item.href);
                              window.dispatchEvent(new Event('popstate'));
                            }}
                          >
                            <NavigationMenuLink
                              className={cn(
                                "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                location === item.href
                                  ? "bg-accent text-accent-foreground"
                                  : ""
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <item.icon className="h-4 w-4" />
                                <div className="text-sm font-medium leading-none">
                                  {item.title}
                                </div>
                              </div>
                              {item.description && (
                                <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                  {item.description}
                                </p>
                              )}
                            </NavigationMenuLink>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
        </div>

        {/* Área do usuário */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            {/* Dropdown do usuário */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    {user?.profilePhoto ? (
                      <AvatarImage
                        src={user.profilePhoto}
                        alt={user?.name || ""}
                      />
                    ) : (
                      <AvatarFallback>
                        {user?.name
                          ? user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .substring(0, 2)
                          : "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                {user && (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link href="/profile">
                        <span className="w-full cursor-pointer">Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-500 focus:text-red-500"
                      onClick={() => logout()}
                    >
                      Sair
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Barra lateral de navegação (visível apenas em telas médias e grandes) */}
        <aside className="hidden w-64 flex-shrink-0 border-r md:block">
          <div className="flex h-full flex-col gap-2 p-4">
            <h2 className="text-lg font-semibold">Gestão HPLC</h2>
            <Clock className="text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
            <Separator className="my-2" />

            {/* Menu lateral */}
            <nav>
              <ul className="flex flex-col gap-1">
                {hplcMenuItems.map((item) => (
                  <SidebarMenuItem key={item.href} item={item} />
                ))}
              </ul>
            </nav>

            <div className="mt-auto">
              <a
                href="/laboratory/dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Clicou em Voltar ao Laboratório');
                  window.history.pushState({}, '', '/laboratory/dashboard');
                  window.dispatchEvent(new Event('popstate'));
                }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Voltar ao Laboratório
                  </div>
                </Button>
              </a>
            </div>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}