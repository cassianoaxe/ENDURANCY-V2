import React, { ReactNode } from 'react';
import LaboratorySidebar from './LaboratorySidebar';
import { BellIcon, FlaskConical, MenuIcon, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface LaboratoryLayoutProps {
  children: ReactNode;
}

const LaboratoryLayout: React.FC<LaboratoryLayoutProps> = ({ children }) => {
  // Na implementação real, isso deveria vir de um estado global de autenticação
  const userData = {
    name: 'Ana Silva',
    role: 'admin',
    avatar: '/avatars/ana-silva.jpg',
  };

  // Função para fazer logout
  const handleLogout = () => {
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Barra lateral para desktop */}
      <div className="hidden md:flex">
        <LaboratorySidebar />
      </div>

      {/* Barra lateral responsiva para mobile */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden absolute left-3 top-3 z-10">
            <MenuIcon className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <LaboratorySidebar />
        </SheetContent>
      </Sheet>

      {/* Área principal de conteúdo */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Barra superior */}
        <header className="bg-white border-b h-16 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center">
            <FlaskConical className="h-6 w-6 text-blue-600 mr-2" />
            <h1 className="text-xl font-semibold tracking-tight text-blue-800">LabAnalytics Portal</h1>
            <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-300">
              Beta
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-gray-500">
              <BellIcon className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center px-2 gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userData.avatar} alt={userData.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {userData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-medium">{userData.name}</span>
                    <span className="text-xs text-gray-500">{userData.role === 'admin' ? 'Administrador' : 'Usuário'}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FlaskConical className="mr-2 h-4 w-4" />
                  <span>Status do Laboratório</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Área de conteúdo principal com rolagem */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default LaboratoryLayout;