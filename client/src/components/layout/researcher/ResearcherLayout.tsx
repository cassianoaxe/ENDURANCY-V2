import { useState, ReactNode } from "react";
import { Link, useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  LayoutDashboard, 
  Menu, 
  Microscope, 
  FlaskConical, 
  Building, 
  Calendar, 
  BookOpen, 
  Settings,
  FileSearch,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface ResearcherLayoutProps {
  children: ReactNode;
}

export default function ResearcherLayout({ children }: ResearcherLayoutProps) {
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const firstName = user?.name?.split(' ')[0] || 'Pesquisador';
  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
    : 'PR';

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      toast({
        title: "Erro ao sair",
        description: "Não foi possível finalizar sua sessão. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const sidebarItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/researcher/dashboard",
      badge: null,
    },
    {
      title: "Estudos Científicos",
      icon: <FileSearch className="h-5 w-5" />,
      href: "/researcher/estudos",
      badge: null,
    },
    {
      title: "Plantas e Cepas",
      icon: <FlaskConical className="h-5 w-5" />,
      href: "/researcher/plantas",
      badge: null,
    },
    {
      title: "Organizações",
      icon: <Building className="h-5 w-5" />,
      href: "/researcher/organizacoes",
      badge: null,
    },
    {
      title: "Publicações",
      icon: <BookOpen className="h-5 w-5" />,
      href: "/researcher/publicacoes",
      badge: null,
    },
    {
      title: "Eventos",
      icon: <Calendar className="h-5 w-5" />,
      href: "/researcher/eventos",
      badge: <Badge className="ml-auto bg-blue-100 text-blue-700 hover:bg-blue-100">Novo</Badge>,
    },
    {
      title: "Laboratório",
      icon: <Microscope className="h-5 w-5" />,
      href: "/researcher/laboratorio",
      badge: null,
    },
    {
      title: "Documentos",
      icon: <FileText className="h-5 w-5" />,
      href: "/researcher/documentos",
      badge: null,
    },
    {
      title: "Configurações",
      icon: <Settings className="h-5 w-5" />,
      href: "/researcher/configuracoes",
      badge: null,
    },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="px-4 py-6">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-md bg-sky-700 flex items-center justify-center text-white">
            <Microscope className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Portal do Pesquisador</h2>
            <p className="text-xs text-gray-500">Endurancy Scientific Research</p>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {sidebarItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900",
                  location === item.href
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "hover:bg-gray-100"
                )}
              >
                {item.icon}
                <span>{item.title}</span>
                {item.badge}
              </a>
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="mt-auto p-4">
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <Avatar>
            <AvatarFallback className="bg-sky-100 text-sky-700">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium text-gray-700">
                {firstName}
              </span>
              <Badge variant="outline" className="ml-auto">
                Pesquisador
              </Badge>
            </div>
            <span className="text-xs text-gray-500 truncate">
              {user?.email || user?.username}
            </span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-gray-900"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sair</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar para desktop */}
      <div className="hidden lg:block w-64 flex-shrink-0 border-r bg-white">
        <SidebarContent />
      </div>

      {/* Sidebar móvel */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6 lg:px-8">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
          </Sheet>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:flex"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="sr-only">Sair</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sair</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Separator orientation="vertical" className="hidden md:block h-8" />
            <div className="hidden md:flex items-center gap-2">
              <Avatar>
                <AvatarFallback className="bg-sky-100 text-sky-700">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">{firstName}</p>
                <p className="text-xs text-gray-500">Pesquisador</p>
              </div>
            </div>
          </div>
        </header>
        
        {/* Conteúdo principal */}
        <div className="h-[calc(100vh-4rem)]">{children}</div>
      </main>
    </div>
  );
}