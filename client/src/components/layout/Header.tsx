import React, { useEffect, useState } from "react";
import { Sun, Moon, User, LogOut, Leaf, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import NotificationsPopover from "@/components/features/NotificationsPopover";
import { useQuery } from "@tanstack/react-query";
import { Organization } from "@shared/schema";
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

export default function Header() {
  const { user, logout } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const isOrgPath = currentPath.startsWith('/organization');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Carregar dados da organização se o usuário estiver autenticado e tiver um organizationId
  const { data: organization, isLoading: isOrgLoading } = useQuery<Organization>({
    queryKey: ['/api/organizations', user?.organizationId],
    enabled: !!user?.organizationId && isOrgPath,
  });

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

  // Função para navegar para um caminho
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  // Update current path when URL changes
  useEffect(() => {
    const handleNavigation = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  const getBreadcrumbs = () => {
    const parts = currentPath.split('/').filter(Boolean);
    
    // Filtrar partes do caminho para ocultar IDs numéricos
    return ['Início', ...parts].map((part, index) => {
      // Verificar se a parte é um número (ID) e vir depois de "organization" 
      if (/^\d+$/.test(part) && parts[index-1] === 'organization') {
        // Ocultar completamente o ID no breadcrumb
        return null;
      }
      
      // Formatar o texto (primeira letra maiúscula e substituir hifens por espaços)
      return part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
    }).filter(Boolean); // Remover elementos nulos
  };

  // Determinar o caminho HOME com base no tipo de usuário
  const getHomePath = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'org_admin':
        return '/organization/dashboard';
      case 'doctor':
        return '/doctor/dashboard';
      case 'patient':
        return '/patient/dashboard';
      case 'manager':
        return '/manager/dashboard';
      case 'employee':
        return '/employee/dashboard';
      default:
        return '/';
    }
  };

  return (
    <header className="h-16 fixed top-0 right-0 left-[240px] bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-20">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          {/* Botão HOME */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="mr-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => navigateTo(getHomePath())}
                >
                  <Home className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ir para Home</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {isOrgPath && !isOrgLoading && organization?.logo ? (
            <Avatar className="h-5 w-5 rounded-md mr-1">
              <AvatarImage src={organization.logo} alt={organization.name || "Organização"} />
              <AvatarFallback className="rounded-md bg-[#e6f7e6] dark:bg-[#1f3b1f]">
                <Leaf className="h-3 w-3 text-green-600 dark:text-green-400" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <Leaf className="h-4 w-4 text-green-600 dark:text-green-400 mr-1" />
          )}
          
          {/* Breadcrumbs navegáveis */}
          {getBreadcrumbs().map((crumb, index, array) => (
            <div key={index} className="flex items-center">
              {index === 0 ? (
                <button 
                  onClick={() => navigateTo(getHomePath())}
                  className="hover:text-green-600 dark:hover:text-green-400 hover:underline cursor-pointer"
                >
                  {crumb}
                </button>
              ) : (
                <span>{crumb}</span>
              )}
              {index < array.length - 1 && (
                <span className="mx-2">/</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
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

          <NotificationsPopover />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="user-profile">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
              <DropdownMenuLabel className="dark:text-gray-200">Minha Conta</DropdownMenuLabel>
              <DropdownMenuItem 
                onClick={() => {
                  const isOrgPath = window.location.pathname.startsWith('/organization');
                  const profilePath = isOrgPath ? '/organization/profile' : '/profile';
                  navigateTo(profilePath);
                }}
                className="cursor-pointer dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator className="dark:border-gray-700" />
              <DropdownMenuItem 
                onClick={logout} 
                className="text-red-600 dark:text-red-400 cursor-pointer dark:hover:bg-gray-700"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}