import React, { useEffect, useState } from "react";
import { Sun, Moon, User, LogOut, Stethoscope, Home, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function DoctorHeader() {
  const { user, logout } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [, navigate] = useLocation();
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Nova prescrição aprovada", message: "Sua prescrição para João Silva foi aprovada", time: "Agora mesmo", isUnread: true },
    { id: 2, title: "Consulta agendada", message: "Você tem uma consulta com Maria Santos às 14:30", time: "30 min atrás", isUnread: true },
    { id: 3, title: "Lembrete de consulta", message: "Lembrete para a consulta com Carlos Ferreira amanhã às 10:00", time: "2 horas atrás", isUnread: false },
    { id: 4, title: "Prescrição recusada", message: "Sua prescrição para Ana Oliveira precisa de revisão", time: "1 dia atrás", isUnread: false },
  ]);
  
  // Verificar se o tema é escuro ao carregar a página
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  // Função para alternar o tema
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    // Aplicar o tema
    document.documentElement.classList.toggle('dark', newTheme);
    
    // Salvar a preferência no localStorage
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // Update current path when URL changes
  useEffect(() => {
    const handleNavigation = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  const getPageTitle = () => {
    const path = currentPath;
    if (path.includes('/doctor/dashboard')) return 'Dashboard';
    if (path.includes('/doctor/agenda')) return 'Agenda';
    if (path.includes('/doctor/pacientes')) return 'Pacientes';
    if (path.includes('/doctor/prontuarios')) return 'Prontuários';
    if (path.includes('/doctor/prescricoes')) return 'Prescrições';
    if (path.includes('/doctor/afiliacao')) return 'Afiliações';
    if (path.includes('/doctor/consultas')) return 'Consultas';
    if (path.includes('/doctor/relatorios')) return 'Relatórios';
    if (path.includes('/doctor/perfil')) return 'Meu Perfil';
    if (path.includes('/doctor/biblioteca')) return 'Biblioteca';
    if (path.includes('/doctor/configuracoes')) return 'Configurações';
    return 'Portal Médico';
  };

  // Marcar notificações como lidas
  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map(notification => 
        notification.id === id 
          ? { ...notification, isUnread: false } 
          : notification
      )
    );
  };

  // Contagem de notificações não lidas
  const unreadCount = notifications.filter(n => n.isUnread).length;

  return (
    <header className="h-16 bg-white shadow-sm dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-20 flex items-center justify-between px-6">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
      </div>

      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar pacientes, prescrições..."
            className="pl-9 bg-gray-50"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Botão de alternar tema */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleTheme}
                className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Alternar tema {isDarkMode ? 'claro' : 'escuro'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Notificações */}
        <Popover>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notificações</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <PopoverContent className="w-[350px] p-0" align="end">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h4 className="font-medium">Notificações</h4>
              <Button variant="ghost" size="sm">Marcar tudo como lido</Button>
            </div>
            <ScrollArea className="h-[300px]">
              {notifications.length > 0 ? (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${notification.isUnread ? 'bg-blue-50/50' : ''}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h5 className="font-medium text-sm">{notification.title}</h5>
                        {notification.isUnread && (
                          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                            Nova
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <p>Nenhuma notificação</p>
                </div>
              )}
            </ScrollArea>
            <Separator />
            <div className="p-2 text-center">
              <Button variant="ghost" size="sm" className="w-full text-sm">
                Ver todas as notificações
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Menu do usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.name?.[0]?.toUpperCase() || "M"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name || "Dr(a). Nome"}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/doctor/perfil')}>
              <User className="mr-2 h-4 w-4" />
              <span>Meu Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={logout} 
              className="text-red-600 dark:text-red-400"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}