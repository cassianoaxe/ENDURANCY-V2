import React, { useState, useEffect } from 'react';
import { Bell, ChevronLeft, ChevronRight, Menu, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import LaboratorySidebar from './LaboratorySidebar';
import { useToast } from '@/hooks/use-toast';
import LaboratoryThemeProvider from '@/pages/laboratory-theme';

// Importar estilos específicos para o laboratório
import '@/styles/laboratory.css';

interface LaboratoryLayoutProps {
  children: React.ReactNode;
}

export default function LaboratoryLayout({ children }: LaboratoryLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast({
        title: 'Pesquisa iniciada',
        description: `Buscando por "${searchQuery}"...`,
      });
      // Aqui você implementaria a pesquisa real
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/laboratory-login';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <LaboratoryThemeProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50 laboratory-app">
        {/* Sidebar */}
        <div className={cn(
          "h-full transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "w-[60px]" : "w-[240px]"
        )}>
          <LaboratorySidebar isCollapsed={sidebarCollapsed} />
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          {/* Header */}
          <header className="border-b bg-white px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="text-gray-500 hover:text-blue-600"
              >
                {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </Button>

              <div className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu size={20} />
                </Button>
              </div>

              <form onSubmit={handleSearchSubmit} className="hidden md:flex relative">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Pesquisar..."
                    className="h-9 rounded-md border border-input bg-transparent pl-8 pr-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </div>

            <div className="flex items-center space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell size={20} />
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-[300px] overflow-auto p-2">
                    <div className="flex items-start gap-4 rounded-lg p-2 hover:bg-gray-100">
                      <div className="rounded-full bg-blue-100 p-2">
                        <User size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Nova solicitação de análise</p>
                        <p className="text-xs text-gray-700">MedCanna enviou 3 amostras para análise</p>
                        <p className="text-xs text-gray-700">10 minutos atrás</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 rounded-lg p-2 hover:bg-gray-100">
                      <div className="rounded-full bg-yellow-100 p-2">
                        <Bell size={16} className="text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Calibração requerida</p>
                        <p className="text-xs text-gray-700">HPLC-01 precisa de calibração em 3 dias</p>
                        <p className="text-xs text-gray-700">1 hora atrás</p>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <Button variant="outline" size="sm" className="w-full">
                      Ver todas as notificações
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="/avatar-lab.png" alt="Avatar" />
                      <AvatarFallback className="bg-blue-100 text-blue-800">LA</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => window.location.href = '/laboratory/configuracoes'}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configurações</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main content area */}
          <main className="flex-1 overflow-auto bg-gray-50 text-gray-900">
            {children}
          </main>
        </div>
      </div>
    </LaboratoryThemeProvider>
  );
}

// Componentes adicionais para o layout
function Settings(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function LogOut(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}