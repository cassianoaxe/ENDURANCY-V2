'use client';

import React, { useState } from 'react';
import { 
  Pill, 
  Home,
  Calendar, 
  Users, 
  ClipboardList, 
  FileText, 
  Package2, 
  LayoutGrid, 
  HelpCircle, 
  Settings, 
  BookOpen,
  LogOut,
  BarChart,
  Activity,
  MessagesSquare
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/pharmacist', icon: Home },
  { name: 'Agenda', href: '/pharmacist/agenda', icon: Calendar },
  { name: 'Pacientes', href: '/pharmacist/pacientes', icon: Users },
  { name: 'Prescrições', href: '/pharmacist/prescricoes', icon: ClipboardList },
  { name: 'Documentos', href: '/pharmacist/documentos', icon: FileText },
  { name: 'Produtos', href: '/pharmacist/produtos', icon: Package2 },
  { name: 'Relatórios', href: '/pharmacist/relatorios', icon: BarChart },
  { name: 'Mensagens', href: '/pharmacist/mensagens', icon: MessagesSquare },
  { name: 'Biblioteca', href: '/pharmacist/biblioteca', icon: BookOpen },
  { name: 'Configurações', href: '/pharmacist/configuracoes', icon: Settings },
  { name: 'Ajuda', href: '/pharmacist/ajuda', icon: HelpCircle },
];

export default function PharmacistLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Função para lidar com o logout
  const handleLogout = () => {
    // Implementação temporária - redirecionamento para login
    window.location.href = '/login';
    // Quando o AuthContext for atualizado com logoutMutation, usar:
    // logoutMutation.mutate();
  };

  // Iniciais do usuário para o avatar
  const getUserInitials = () => {
    if (!user || !user.name) return 'F';
    return user.name.charAt(0).toUpperCase();
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Barra lateral de navegação */}
      <aside className="hidden md:flex flex-col w-16 border-r bg-card shadow-sm">
        <div className="flex flex-col items-center py-4">
          <Link href="/pharmacist">
            <Avatar className="h-9 w-9 bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer">
              <AvatarFallback className="text-primary font-bold">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
        <Separator />
        <nav className="flex flex-col items-center gap-4 py-4 flex-1">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={cn(
                    "w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors",
                    isActive && "bg-primary/10 text-primary"
                  )}
                  title={item.name}
                >
                  <IconComponent size={20} />
                </button>
              </Link>
            );
          })}
        </nav>
        <div className="py-4 flex flex-col items-center">
          <button
            onClick={handleLogout}
            className="w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col">
        {/* Cabeçalho */}
        <header className="h-16 border-b flex items-center justify-between px-6">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </Button>
            <Avatar className="h-8 w-8 bg-primary/10 border cursor-pointer">
              <AvatarFallback className="text-primary font-bold">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Área de conteúdo principal */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}