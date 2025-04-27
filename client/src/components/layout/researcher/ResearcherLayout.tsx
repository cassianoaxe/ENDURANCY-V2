import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  Microscope, 
  LogOut,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ResearcherNav } from "./ResearcherNav";

interface ResearcherLayoutProps {
  children: ReactNode;
}

export default function ResearcherLayout({ children }: ResearcherLayoutProps) {
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
      // Usar window.location para navegação simplificada
      window.location.href = '/login';
    } catch (error) {
      toast({
        title: "Erro ao sair",
        description: "Não foi possível finalizar sua sessão. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Menu foi migrado para o componente ResearcherNav

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="px-4 py-6">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-md bg-sky-700 flex items-center justify-center text-white">
            <Microscope className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Portal do Pesquisador</h2>
            <div className="flex items-center">
              <p className="text-xs text-gray-500">Endurancy</p>
              <span className="ml-1 px-1 py-0.5 text-[0.6rem] font-medium bg-blue-100 text-blue-700 rounded">Beta</span>
              <p className="text-xs text-gray-500 ml-1">Scientific Research</p>
            </div>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1 overflow-auto py-2">
        <ResearcherNav />
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