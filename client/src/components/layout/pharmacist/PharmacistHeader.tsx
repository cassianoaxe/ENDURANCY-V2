import { useAuth } from "@/contexts/AuthContext";
import { Bell, Search, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";

export default function PharmacistHeader() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">
      {/* Left section - Search */}
      <div className="flex items-center w-full max-w-xs">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="w-full pl-8 bg-gray-50 border-gray-200"
          />
        </div>
      </div>

      {/* Right section - Notifications, Messages, Profile */}
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
        </Button>

        <Button variant="ghost" size="icon">
          <MessageSquare className="h-5 w-5 text-gray-600" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={""}
                  alt={user?.name || "Avatar"}
                />
                <AvatarFallback className="bg-green-100 text-green-800">
                  {user?.name ? getInitials(user.name) : "FP"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate("/pharmacist/perfil")}
              className="cursor-pointer"
            >
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate("/pharmacist/configuracoes")}
              className="cursor-pointer"
            >
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer text-red-600"
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}