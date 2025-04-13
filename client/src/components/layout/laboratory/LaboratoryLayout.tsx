import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { 
  BeakerIcon, 
  HomeIcon, 
  FlaskConicalIcon, 
  ListFilterIcon, 
  FileTextIcon, 
  SettingsIcon,
  UsersIcon,
  LogOutIcon,
  BellIcon,
  ChevronRight
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";

const menuItems = [
  {
    icon: <HomeIcon className="mr-2 h-4 w-4" />,
    label: "Dashboard",
    path: "/laboratory/dashboard",
  },
  {
    icon: <BeakerIcon className="mr-2 h-4 w-4" />,
    label: "Amostras",
    path: "/laboratory/samples",
  },
  {
    icon: <FlaskConicalIcon className="mr-2 h-4 w-4" />,
    label: "Testes",
    path: "/laboratory/tests",
  },
  {
    icon: <SettingsIcon className="mr-2 h-4 w-4" />,
    label: "Equipamentos",
    path: "/laboratory/equipment",
  },
  {
    icon: <FlaskConicalIcon className="mr-2 h-4 w-4" />,
    label: "HPLC",
    path: "/laboratory/hplc",
    submenu: [
      {
        icon: <HomeIcon className="mr-2 h-4 w-4" />,
        label: "Dashboard",
        path: "/laboratory/hplc/dashboard",
      },
      {
        icon: <BeakerIcon className="mr-2 h-4 w-4" />,
        label: "Equipamentos",
        path: "/laboratory/hplc/equipments",
      },
      {
        icon: <SettingsIcon className="mr-2 h-4 w-4" />,
        label: "Manutenções",
        path: "/laboratory/hplc/maintenances",
      },
      {
        icon: <FlaskConicalIcon className="mr-2 h-4 w-4" />,
        label: "Consumíveis",
        path: "/laboratory/hplc/consumables", 
      },
      {
        icon: <FileTextIcon className="mr-2 h-4 w-4" />,
        label: "Corridas",
        path: "/laboratory/hplc/runs",
      },
      {
        icon: <FileTextIcon className="mr-2 h-4 w-4" />,
        label: "Procedimentos",
        path: "/laboratory/hplc/procedures",
      },
      {
        icon: <FileTextIcon className="mr-2 h-4 w-4" />,
        label: "Validações",
        path: "/laboratory/hplc/validations",
      },
      {
        icon: <UsersIcon className="mr-2 h-4 w-4" />,
        label: "Treinamentos",
        path: "/laboratory/hplc/trainings",
      },
    ]
  },
  {
    icon: <FileTextIcon className="mr-2 h-4 w-4" />,
    label: "Relatórios",
    path: "/laboratory/reports",
  },
  {
    icon: <UsersIcon className="mr-2 h-4 w-4" />,
    label: "Equipe",
    path: "/laboratory/team",
  },
  {
    icon: <SettingsIcon className="mr-2 h-4 w-4" />,
    label: "Configurações",
    path: "/laboratory/settings",
  },
];

export default function LaboratoryLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [activeMenuItem, setActiveMenuItem] = React.useState("/laboratory/dashboard");
  const [expandedMenu, setExpandedMenu] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Definir o item de menu ativo com base na URL atual
    const path = window.location.pathname;
    console.log('LaboratoryLayout: URL atual:', path);
    setActiveMenuItem(path);
    
    // Adicionar listener para eventos de navegação
    const handleNavigation = () => {
      const newPath = window.location.pathname;
      console.log('LaboratoryLayout: Atualização da navegação para:', newPath);
      setActiveMenuItem(newPath);
    };
    
    // Escutar eventos regulares de navegação
    window.addEventListener('popstate', handleNavigation);
    
    // Escutar eventos personalizados de navegação
    window.addEventListener('navigation', (e: any) => {
      console.log('LaboratoryLayout: Evento de navegação customizado:', e.detail?.path);
      if (e.detail?.path) {
        setActiveMenuItem(e.detail.path);
      }
    });
    
    return () => {
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('navigation', handleNavigation as EventListener);
    };
  }, []);

  const handleMenuItemClick = (path: string, hasSubmenu = false) => {
    if (hasSubmenu) {
      // Se o item tem submenu, expande/colapsa em vez de navegar
      setExpandedMenu(expandedMenu === path ? null : path);
      return;
    }
    
    setActiveMenuItem(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      queryClient.clear();
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado do portal do laboratório.",
      });
      // Redirecionar para a página de login
      window.history.pushState({}, "", "/login");
      window.dispatchEvent(new Event("popstate"));
    } catch (error) {
      toast({
        title: "Erro ao realizar logout",
        description: "Ocorreu um erro ao desconectar. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Navbar superior para dispositivos móveis */}
      <header className="bg-white shadow-sm py-3 px-4 sticky top-0 z-10 lg:hidden">
        <div className="flex justify-between items-center">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <ListFilterIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[80%] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle>Portal do Laboratório</SheetTitle>
                <SheetDescription>
                  Gerencie amostras, resultados e relatórios
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <div className="flex items-center gap-4 py-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user?.profilePhoto || ""} alt={user?.name} />
                    <AvatarFallback>
                      {user?.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{user?.name}</h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Separator className="my-2" />
                <nav className="flex flex-col gap-1 mt-4">
                  {menuItems.map((item) => (
                    <div key={item.path}>
                      <a
                        href={item.path}
                        onClick={(e) => {
                          e.preventDefault();
                          
                          // Verificar se o item tem submenu
                          if (item.submenu) {
                            console.log(`Menu móvel com submenu: ${item.label}, expandindo/contraindo`);
                            handleMenuItemClick(item.path, true);
                            return;
                          }
                          
                          console.log(`Menu móvel: Clicando no item ${item.label}, navegando para: ${item.path}`);
                          handleMenuItemClick(item.path);
                          
                          // Navegação manual
                          window.history.pushState({}, '', item.path);
                          
                          // Disparar eventos para garantir atualização de componentes
                          window.dispatchEvent(new Event('popstate'));
                          window.dispatchEvent(new CustomEvent('navigation', { 
                            detail: { path: item.path } 
                          }));
                          
                          // Forçar atualização do DOM
                          document.body.classList.add('navigating');
                          setTimeout(() => {
                            document.body.classList.remove('navigating');
                          }, 10);
                        }}
                      >
                        <Button
                          variant={activeMenuItem === item.path || (item.submenu && activeMenuItem.startsWith(item.path)) ? "default" : "ghost"}
                          className="w-full justify-start"
                        >
                          {item.icon}
                          {item.label}
                          {item.submenu && (
                            <ChevronRight className={`ml-auto h-4 w-4 shrink-0 transition-transform ${expandedMenu === item.path ? 'rotate-90' : ''}`} />
                          )}
                        </Button>
                      </a>
                      
                      {/* Renderizar submenu mobile se existir e estiver expandido */}
                      {item.submenu && expandedMenu === item.path && (
                        <div className="pl-6 mt-1 space-y-1">
                          {item.submenu.map((subItem) => (
                            <a
                              key={subItem.path}
                              href={subItem.path}
                              onClick={(e) => {
                                e.preventDefault();
                                console.log(`Clicando no subitem de menu mobile: ${subItem.label}, navegando para: ${subItem.path}`);
                                setActiveMenuItem(subItem.path);
                                setIsMobileMenuOpen(false);
                                
                                // Navegação manual
                                window.history.pushState({}, '', subItem.path);
                                
                                // Disparar eventos para garantir atualização de componentes
                                window.dispatchEvent(new Event('popstate'));
                                window.dispatchEvent(new CustomEvent('navigation', { 
                                  detail: { path: subItem.path } 
                                }));
                                
                                // Forçar atualização do DOM
                                document.body.classList.add('navigating');
                                setTimeout(() => {
                                  document.body.classList.remove('navigating');
                                }, 10);
                              }}
                            >
                              <Button
                                variant={activeMenuItem === subItem.path ? "default" : "ghost"}
                                size="sm"
                                className="w-full justify-start"
                              >
                                {subItem.icon}
                                {subItem.label}
                              </Button>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    Sair
                  </Button>
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center">
            <BeakerIcon className="h-6 w-6 text-green-600 mr-2" />
            <span className="font-semibold text-lg">LabSystem</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="relative">
              <BellIcon className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                3
              </Badge>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src={user?.profilePhoto || ""} alt={user?.name} />
                  <AvatarFallback>
                    {user?.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    console.log('Clicando em Configurações no dropdown, navegando para: /laboratory/settings');
                    setActiveMenuItem('/laboratory/settings');
                    
                    // Navegação manual
                    window.history.pushState({}, '', '/laboratory/settings');
                    
                    // Disparar eventos para garantir atualização de componentes
                    window.dispatchEvent(new Event('popstate'));
                    window.dispatchEvent(new CustomEvent('navigation', { 
                      detail: { path: '/laboratory/settings' } 
                    }));
                    
                    // Forçar atualização do DOM
                    document.body.classList.add('navigating');
                    setTimeout(() => {
                      document.body.classList.remove('navigating');
                    }, 10);
                  }}
                >
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Layout para desktop */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar para desktop */}
        <aside className="hidden lg:flex lg:w-64 flex-col bg-white border-r border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center">
            <BeakerIcon className="h-6 w-6 text-green-600 mr-2" />
            <span className="font-semibold text-lg">Portal do Laboratório</span>
          </div>
          
          <div className="flex flex-col p-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user?.profilePhoto || ""} alt={user?.name} />
                <AvatarFallback>
                  {user?.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{user?.name}</h3>
                <p className="text-sm text-muted-foreground truncate max-w-[150px]">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
          
          {/* Menu de navegação */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <div key={item.path}>
                <a 
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    
                    // Verificar se o item tem submenu
                    if (item.submenu) {
                      console.log(`Menu com submenu: ${item.label}, expandindo/contraindo`);
                      handleMenuItemClick(item.path, true);
                      return;
                    }
                    
                    console.log(`Clicando no item de menu: ${item.label}, navegando para: ${item.path}`);
                    setActiveMenuItem(item.path);
                    
                    // Navegação manual
                    window.history.pushState({}, '', item.path);
                    
                    // Disparar eventos para garantir atualização de componentes
                    window.dispatchEvent(new Event('popstate'));
                    window.dispatchEvent(new CustomEvent('navigation', { 
                      detail: { path: item.path } 
                    }));
                    
                    // Forçar atualização do DOM
                    document.body.classList.add('navigating');
                    setTimeout(() => {
                      document.body.classList.remove('navigating');
                    }, 10);
                  }}
                >
                  <Button
                    variant={activeMenuItem === item.path || (item.submenu && activeMenuItem.startsWith(item.path)) ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    {item.icon}
                    {item.label}
                    {item.submenu && (
                      <ChevronRight className={`ml-auto h-4 w-4 shrink-0 transition-transform ${expandedMenu === item.path ? 'rotate-90' : ''}`} />
                    )}
                  </Button>
                </a>
                
                {/* Renderizar submenu se existir e estiver expandido */}
                {item.submenu && expandedMenu === item.path && (
                  <div className="pl-6 mt-1 space-y-1">
                    {item.submenu.map((subItem) => (
                      <a
                        key={subItem.path}
                        href={subItem.path}
                        onClick={(e) => {
                          e.preventDefault();
                          console.log(`Clicando no subitem de menu: ${subItem.label}, navegando para: ${subItem.path}`);
                          setActiveMenuItem(subItem.path);
                          
                          // Navegação manual
                          window.history.pushState({}, '', subItem.path);
                          
                          // Disparar eventos para garantir atualização de componentes
                          window.dispatchEvent(new Event('popstate'));
                          window.dispatchEvent(new CustomEvent('navigation', { 
                            detail: { path: subItem.path } 
                          }));
                          
                          // Forçar atualização do DOM
                          document.body.classList.add('navigating');
                          setTimeout(() => {
                            document.body.classList.remove('navigating');
                          }, 10);
                        }}
                      >
                        <Button
                          variant={activeMenuItem === subItem.path ? "default" : "ghost"}
                          size="sm"
                          className="w-full justify-start"
                        >
                          {subItem.icon}
                          {subItem.label}
                        </Button>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          
          {/* Botão de logout no final da sidebar */}
          <div className="p-4 border-t border-gray-200">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOutIcon className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}