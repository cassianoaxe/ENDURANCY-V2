import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Truck,
  Package2,
  ClipboardList,
  Wallet,
  Bell,
  MessageSquare,
  LogOut,
  ChevronDown,
  BarChart3,
  Settings,
  HelpCircle,
  Menu,
  User,
  Home,
  ShoppingBag
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SupplierLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
}

export default function SupplierLayout({ children, activeTab = "overview" }: SupplierLayoutProps) {
  // Obter o caminho atual para marcar o item de menu ativo
  const currentPath = window.location.pathname;
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar dados do fornecedor autenticado
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Adicionar logs para diagnóstico
        console.log("Buscando dados do fornecedor...");
        
        const response = await fetch("/api/suppliers/me");
        console.log("Resposta da API:", response.status, response.statusText);
        
        if (!response.ok) {
          // Se não estiver autenticado, redirecionar para o login
          if (response.status === 401 || response.status === 400) {
            console.log("Não autenticado ou erro de ID. Redirecionando para login.");
            window.location.href = "/supplier/login";
            return;
          }
          throw new Error(`Erro ao buscar dados: ${response.status} - ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log("Dados recebidos da API:", result);
        
        if (result.success && result.data) {
          setUserData(result.data);
          console.log("Dados do fornecedor definidos com sucesso:", result.data);
        } else {
          console.error("Dados inválidos recebidos da API:", result);
          throw new Error("Dados inválidos do fornecedor");
        }
      } catch (error) {
        console.error("Erro ao buscar dados do fornecedor:", error);
        
        // Mostrar mensagem amigável com detalhes do erro
        toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description: `Ocorreu um problema ao buscar seus dados. Por favor, faça login novamente. Detalhes: ${error.message || "Erro desconhecido"}`
        });
        
        // Aguardar antes de redirecionar para dar tempo do usuário ver a mensagem
        setTimeout(() => {
          window.location.href = "/supplier/login";
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [toast]);

  const navigation = [
    { name: "Visão Geral", href: "/supplier/dashboard", icon: Home, current: activeTab === "overview" },
    { name: "CMarket", href: "/supplier/cmarket", icon: ShoppingBag, current: activeTab === "cmarket" || currentPath.includes('cmarket') },
    { name: "Pedidos", href: "/supplier/orders", icon: ClipboardList, current: activeTab === "orders" },
    { name: "Produtos", href: "/supplier/products", icon: Package2, current: activeTab === "products" },
    { name: "Financeiro", href: "/supplier/finance", icon: Wallet, current: activeTab === "finance" },
    { name: "Analytics", href: "/supplier/analytics", icon: BarChart3, current: activeTab === "analytics" },
    { name: "Configurações", href: "/supplier/settings", icon: Settings, current: activeTab === "settings" },
  ];

  // Configurar informações do usuário
  const userInfo = {
    name: userData?.name || "Fornecedor",
    initials: userData?.name ? userData.name.substring(0, 2).toUpperCase() : "FO",
    avatar: userData?.profilePhoto || "",
    unreadNotifications: 3, // Valores temporários para notificações
    unreadMessages: 2,      // Valores temporários para mensagens
  };

  // Função para lidar com o clique em itens do menu que ainda não estão implementados
  const handleUnimplementedClick = (name: string) => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: `A funcionalidade "${name}" ainda está sendo implementada.`,
    });
  };

  // Função para lidar com o logout
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/suppliers/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        toast({
          title: "Logout realizado",
          description: "Você foi desconectado com sucesso.",
        });
        window.location.href = "/supplier/login";
      } else {
        throw new Error("Erro ao fazer logout");
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({
        variant: "destructive",
        title: "Erro ao realizar logout",
        description: "Ocorreu um erro ao tentar sair do sistema.",
      });
      // Em caso de erro, ainda redirecionamos para a página de login
      window.location.href = "/supplier/login";
    }
  };

  // Adicionar tela de carregamento enquanto os dados não estão prontos
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-semibold text-red-800">Carregando Portal do Fornecedor...</h2>
        <p className="text-gray-500 mt-2">Verificando suas credenciais e carregando seus dados.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Barra superior */}
      <header className="bg-gradient-to-r from-red-800 to-red-600 text-white border-b">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="text-white h-9 w-9 hover:bg-red-700/20">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="border-b pt-4 pb-3 px-4 flex items-center">
                  <Truck className="h-6 w-6 mr-2" />
                  <span className="font-bold text-lg">Portal do Fornecedor</span>
                </div>
                <nav className="pt-5">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = item.href;
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center px-4 py-3 text-sm ${item.current ? "bg-red-50 text-red-800 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                      <item.icon className={`mr-3 h-5 w-5 ${item.current ? "text-red-600" : "text-gray-500"}`} />
                      {item.name}
                    </a>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <div 
              className="flex items-center cursor-pointer" 
              onClick={() => window.location.href = "/supplier/dashboard"}
            >
              <Truck className="h-8 w-8 text-white mr-2" />
              <span className="font-bold text-xl">Portal do Fornecedor</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              className="text-white hover:text-white hover:bg-red-700/20"
              onClick={() => window.location.href = "/"}
            >
              <Home className="h-5 w-5 mr-2" />
              <span className="hidden md:inline">Voltar para Home</span>
            </Button>
            
            <div className="hidden md:flex">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:text-white hover:bg-red-700/20 relative"
                onClick={() => handleUnimplementedClick("Notificações")}
              >
                <Bell className="h-5 w-5" />
                {userInfo.unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-500 p-0 text-center text-[10px] font-bold text-white">
                    {userInfo.unreadNotifications}
                  </Badge>
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:text-white hover:bg-red-700/20 relative"
                onClick={() => handleUnimplementedClick("Mensagens")}
              >
                <MessageSquare className="h-5 w-5" />
                {userInfo.unreadMessages > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-500 p-0 text-center text-[10px] font-bold text-white">
                    {userInfo.unreadMessages}
                  </Badge>
                )}
              </Button>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 rounded-full text-white ring-1 ring-white/20 hover:bg-red-700/20 hover:text-white">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
                    <AvatarFallback className="bg-red-100 text-red-800 font-semibold text-sm">
                      {userInfo.initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleUnimplementedClick("Perfil")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUnimplementedClick("Mensagens")}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Mensagens</span>
                  {userInfo.unreadMessages > 0 && (
                    <Badge className="ml-auto bg-amber-500">{userInfo.unreadMessages}</Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUnimplementedClick("Notificações")}>
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notificações</span>
                  {userInfo.unreadNotifications > 0 && (
                    <Badge className="ml-auto bg-amber-500">{userInfo.unreadNotifications}</Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUnimplementedClick("Configurações")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUnimplementedClick("Ajuda")}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Ajuda & Suporte</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <div className="flex flex-1">
        {/* Navegação lateral (visível apenas em telas maiores) */}
        <aside className="hidden lg:flex flex-col w-64 border-r bg-white">
          <nav className="flex-1 pt-5">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = item.href;
                }}
                className={`flex items-center px-4 py-3 text-sm ${item.current ? "bg-red-50 text-red-800 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${item.current ? "text-red-600" : "text-gray-500"}`} />
                {item.name}
              </a>
            ))}
          </nav>
          
          <div className="p-4 border-t">
            <Button 
              variant="outline"
              className="w-full justify-start text-red-700 border-red-200 hover:bg-red-50 hover:text-red-800"
              onClick={() => handleUnimplementedClick("Central de Ajuda")}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Central de Ajuda
            </Button>
          </div>
        </aside>

        {/* Conteúdo da página */}
        <main className="flex-1 min-w-0 overflow-auto">
          <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}