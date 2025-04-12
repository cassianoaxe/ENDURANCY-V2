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
  BellIcon
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
    icon: <FlaskConicalIcon className="mr-2 h-4 w-4" />,
    label: "HPLC",
    path: "/laboratory/hplc/dashboard",
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

  React.useEffect(() => {
    // Definir o item de menu ativo com base na URL atual
    const path = window.location.pathname;
    setActiveMenuItem(path);
  }, []);

  const handleMenuItemClick = (path: string) => {
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
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => handleMenuItemClick(item.path)}
                    >
                      <Button
                        variant={activeMenuItem === item.path ? "default" : "ghost"}
                        className="w-full justify-start"
                      >
                        {item.icon}
                        {item.label}
                      </Button>
                    </Link>
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
                <DropdownMenuItem>
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
              <Link key={item.path} href={item.path}>
                <Button
                  variant={activeMenuItem === item.path ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveMenuItem(item.path)}
                >
                  {item.icon}
                  {item.label}
                </Button>
              </Link>
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