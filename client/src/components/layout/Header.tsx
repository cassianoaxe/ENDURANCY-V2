import React, { useEffect, useState } from "react";
import { Sun, Moon, User, LogOut, Leaf, Home, BarChart } from "lucide-react";
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
    queryFn: async () => {
      if (!user?.organizationId) return null;
      try {
        console.log("Header: carregando organização", user.organizationId, "com timestamp:", Date.now());
        // Adicionar um parâmetro de consulta aleatório para evitar cache do navegador
        const timestamp = Date.now();
        const response = await fetch(`/api/organizations/${user.organizationId}?_=${timestamp}`, {
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
          cache: 'no-store'
        });
        if (!response.ok) throw new Error('Falha ao carregar organização');
        return await response.json();
      } catch (error) {
        console.error('Erro ao buscar organização:', error);
        return null;
      }
    },
    enabled: !!user?.organizationId,
    // Configurar para sempre buscar dados frescos
    staleTime: 0, // Sempre considerar dados obsoletos
    cacheTime: 0, // Não manter em cache
    refetchInterval: 5000, // Recarregar a cada 5 segundos
    refetchOnWindowFocus: true, // Recarregar quando o usuário voltar para a janela
    refetchOnMount: true, // Recarregar sempre que o componente montar
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
    
    // Mapear papel do usuário para o caminho correspondente
    const rolePaths: Record<string, string> = {
      'admin': '/admin/dashboard',
      'org_admin': '/organization/dashboard',
      'association_admin': '/organization/dashboard',
      'company_admin': '/organization/dashboard',
      'doctor': '/doctor/dashboard',
      'dentist': '/doctor/dashboard',
      'vet': '/doctor/dashboard',
      'patient': '/patient/dashboard',
      'pharmacist': '/pharmacist/dashboard',
      'laboratory': '/laboratory/dashboard',
      'researcher': '/researcher/dashboard'
    };
    
    // Usar o caminho mapeado ou o caminho padrão
    return rolePaths[user.role] || '/';
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
          {/* Botão de atalho para Envio BI (MapaBI em tela cheia) */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mr-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 border-blue-200 dark:border-blue-800 font-medium flex items-center gap-1.5"
                  onClick={() => window.location.href = '/expedicao/mapa-fullscreen'}
                >
                  <BarChart className="h-4 w-4" />
                  <span>Envio BI</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Envio BI</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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