import React from "react";
import { Sun, User, LogOut, Leaf } from "lucide-react";
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

export default function Header() {
  const { user, logout } = useAuth();
  const [currentPath, setCurrentPath] = React.useState(window.location.pathname);
  const isOrgPath = currentPath.startsWith('/organization');
  
  // Carregar dados da organização se o usuário estiver autenticado e tiver um organizationId
  const { data: organization, isLoading: isOrgLoading } = useQuery<Organization>({
    queryKey: ['/api/organizations', user?.organizationId],
    enabled: !!user?.organizationId && isOrgPath,
  });

  // Update current path when URL changes
  React.useEffect(() => {
    const handleNavigation = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  const getBreadcrumbs = () => {
    const parts = currentPath.split('/').filter(Boolean);
    return ['Início', ...parts].map((part) => 
      part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')
    );
  };

  return (
    <header className="h-16 fixed top-0 right-0 left-[240px] bg-white border-b z-20">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {isOrgPath && !isOrgLoading && organization?.logo ? (
            <Avatar className="h-5 w-5 rounded-md mr-1">
              <AvatarImage src={organization.logo} alt={organization.name || "Organização"} />
              <AvatarFallback className="rounded-md bg-[#e6f7e6]">
                <Leaf className="h-3 w-3 text-green-600" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <Leaf className="h-4 w-4 text-green-600 mr-1" />
          )}
          {getBreadcrumbs().map((crumb, index, array) => (
            <div key={index} className="flex items-center">
              <span>{crumb}</span>
              {index < array.length - 1 && (
                <span className="mx-2">/</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Sun className="h-5 w-5" />
          </Button>
          <NotificationsPopover />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="user-profile">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuItem 
                onClick={() => {
                  const isOrgPath = window.location.pathname.startsWith('/organization');
                  const profilePath = isOrgPath ? '/organization/profile' : '/profile';
                  window.history.pushState({}, '', profilePath);
                  window.dispatchEvent(new Event('popstate'));
                }}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={logout} 
                className="text-red-600 cursor-pointer"
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