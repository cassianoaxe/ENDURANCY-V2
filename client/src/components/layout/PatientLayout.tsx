import React from 'react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Bell, Home, LogOut, Package, FileText, CreditCard, ShoppingCart, User, Settings, LifeBuoy, GitBranch } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface PatientLayoutProps {
  children: React.ReactNode;
}

const PatientLayout: React.FC<PatientLayoutProps> = ({ children }) => {
  const { toast } = useToast();
  const { logout } = useAuth();
  
  // Função para navegar para uma rota específica
  const navigateTo = (path: string) => {
    window.location.href = path;
  };
  
  // Função para deslogar o usuário - implementação direta via fetch
  const handleLogout = async () => {
    try {
      // Chamar diretamente a API de logout
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        toast({
          title: "Logout realizado",
          description: "Você saiu da sua conta com sucesso.",
        });
        
        // Redirecionar para a página inicial
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      } else {
        throw new Error('Falha ao fazer logout');
      }
    } catch (error) {
      console.error('Erro ao realizar logout:', error);
      toast({
        title: "Erro ao realizar logout",
        description: "Ocorreu um erro ao tentar sair. Tente novamente.",
        variant: "destructive"
      } as any);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                  </svg>
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => navigateTo('/patient/dashboard')}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Início
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => navigateTo('/patient/produtos')}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Produtos
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => navigateTo('/patient/prescricoes/nova')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Prescrições
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => navigateTo('/patient/pedidos/rastreamento')}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Pedidos
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => navigateTo('/patient/pagamentos')}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pagamentos
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => navigateTo('/patient/afiliados')}
                  >
                    <GitBranch className="mr-2 h-4 w-4" />
                    Programa de Afiliados
                  </Button>
                  <Separator />
                  <Button 
                    variant="ghost" 
                    className="justify-start"
                    onClick={() => navigateTo('/patient/profile')}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="justify-start"
                    onClick={() => navigateTo('/patient/settings')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="justify-start"
                    onClick={() => navigateTo('/patient/suporte')}
                  >
                    <LifeBuoy className="mr-2 h-4 w-4" />
                    Suporte
                  </Button>
                  <Button variant="destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
            
            <Button
              variant="link"
              className="font-bold text-xl"
              onClick={() => navigateTo('/patient/dashboard')}
            >
              MediFlora
            </Button>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Button
              variant="ghost"
              className="text-sm font-medium transition-colors"
              onClick={() => navigateTo('/patient/dashboard')}
            >
              Início
            </Button>
            <Button
              variant="ghost"
              className="text-sm font-medium transition-colors"
              onClick={() => navigateTo('/patient/produtos')}
            >
              Produtos
            </Button>
            <Button
              variant="ghost"
              className="text-sm font-medium transition-colors"
              onClick={() => navigateTo('/patient/prescricoes/nova')}
            >
              Prescrições
            </Button>
            <Button
              variant="ghost"
              className="text-sm font-medium transition-colors"
              onClick={() => navigateTo('/patient/pedidos/rastreamento')}
            >
              Pedidos
            </Button>
            <Button
              variant="ghost"
              className="text-sm font-medium transition-colors"
              onClick={() => navigateTo('/patient/pagamentos')}
            >
              Pagamentos
            </Button>
            <Button
              variant="ghost"
              className="text-sm font-medium transition-colors"
              onClick={() => navigateTo('/patient/afiliados')}
            >
              Afiliados
            </Button>
          </nav>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notificações</span>
            </Button>
            <ModeToggle />
            
            {/* Menu de usuário com dropdown */}
            <div className="relative">
              <Avatar 
                className="cursor-pointer" 
                onClick={() => document.getElementById('userMenu')?.classList.toggle('hidden')}
              >
                <AvatarImage src="" alt="Usuário" />
                <AvatarFallback>PA</AvatarFallback>
              </Avatar>
              
              <div 
                id="userMenu" 
                className="absolute hidden right-0 mt-2 w-56 rounded-md shadow-lg bg-background border border-border z-50"
              >
                <div className="py-1 rounded-md bg-background">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium">Paciente</p>
                    <p className="text-xs text-muted-foreground truncate">paciente@email.com</p>
                  </div>
                  
                  <a 
                    href="/patient/profile" 
                    className="block px-4 py-2 text-sm hover:bg-accent cursor-pointer"
                  >
                    Meu Perfil
                  </a>
                  
                  <a 
                    href="/patient/settings" 
                    className="block px-4 py-2 text-sm hover:bg-accent cursor-pointer"
                  >
                    Configurações
                  </a>
                  <a 
                    href="/patient/afiliados" 
                    className="block px-4 py-2 text-sm hover:bg-accent cursor-pointer"
                  >
                    Programa de Afiliados
                  </a>
                  
                  <div className="border-t mt-1"></div>
                  
                  <div 
                    onClick={handleLogout}
                    className="block px-4 py-2 text-sm text-red-500 hover:bg-accent cursor-pointer"
                  >
                    Sair da conta
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col md:flex-row justify-between items-center md:h-16">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} MediFlora. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Button variant="link" size="sm" className="text-xs text-gray-500">
              Política de Privacidade
            </Button>
            <Button variant="link" size="sm" className="text-xs text-gray-500">
              Termos de Uso
            </Button>
            <Button variant="link" size="sm" className="text-xs text-gray-500">
              Suporte
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PatientLayout;