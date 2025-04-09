import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Pill,
  ClipboardCheck,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react';

export function PharmacistSidebar() {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);
  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  // Toggle sidebar collapse
  const toggleCollapse = () => setCollapsed(!collapsed);

  // Logout function
  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      toast({
        title: 'Erro ao sair',
        description: 'Não foi possível fazer logout. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  // Define navigation links
  const navItems = [
    {
      name: 'Dashboard',
      path: '/pharmacist/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: 'Prescrições',
      path: '/pharmacist/prescriptions',
      icon: <ClipboardCheck className="h-5 w-5" />,
    },
    {
      name: 'Produtos',
      path: '/pharmacist/products',
      icon: <Pill className="h-5 w-5" />,
    },
    {
      name: 'Pacientes',
      path: '/pharmacist/patients',
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: 'Configurações',
      path: '/pharmacist/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <>
      {/* Mobile menu button - shown on small screens */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 left-4 md:hidden z-50"
        onClick={toggleCollapse}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          collapsed ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full bg-background border-r">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b">
            <Link href="/pharmacist/dashboard">
              <div className="flex items-center space-x-2 cursor-pointer">
                <Pill className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">PharmPortal</span>
              </div>
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleCollapse} className="md:flex hidden">
              {collapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* User info */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-primary-foreground rounded-full h-10 w-10 flex items-center justify-center">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <p className="font-medium">{user?.name || 'Usuário'}</p>
                <p className="text-xs text-muted-foreground">Farmacêutico</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="px-2 space-y-1">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={location === item.path ? 'secondary' : 'ghost'}
                    className={`w-full justify-start ${
                      location === item.path ? 'bg-secondary' : ''
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Button>
                </Link>
              ))}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Dark overlay for mobile - only visible when sidebar is open on mobile */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleCollapse}
        ></div>
      )}
    </>
  );
}