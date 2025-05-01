import React from "react";
import { useLocation } from "wouter";
import { 
  Loader2, 
  Truck, 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  FileText, 
  Settings,
  Bell,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SupplierLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
}

export default function SupplierLayout({ children, activeTab = "overview" }: SupplierLayoutProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Mock de dados do usuário logado
  const user = {
    id: 1,
    name: "Empresa Exemplo LTDA",
    email: "contato@empresa.com.br",
    avatar: null,
    role: "supplier",
  };

  // Mock de notificações
  const notificationsCount = 2;

  // Função para fazer logout
  const handleLogout = () => {
    toast({
      title: "Logout realizado",
      description: "Você saiu do Portal do Fornecedor com sucesso",
    });
    setLocation("/supplier/login");
  };

  // Definir o tab ativo com base na URL
  const getActiveTab = () => {
    if (location.includes("/supplier/products")) return "products";
    if (location.includes("/supplier/orders")) return "orders";
    if (location.includes("/supplier/clients")) return "clients";
    if (location.includes("/supplier/tenders")) return "tenders";
    if (location.includes("/supplier/settings")) return "settings";
    return activeTab;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex flex-col">
      {/* Cabeçalho */}
      <header className="bg-gradient-to-r from-red-800 to-red-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Truck className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Portal do Fornecedor</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Notificações */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative p-2 text-white hover:bg-red-700">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-4 w-4 bg-yellow-400 text-xs text-black rounded-full flex items-center justify-center">
                    {notificationsCount}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-4 text-center text-gray-500">
                  Carregando notificações...
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Perfil do usuário */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative p-0 h-10 overflow-hidden text-white hover:bg-red-700">
                  <Avatar className="h-8 w-8 border border-white/50">
                    <AvatarImage src={user.avatar || ""} />
                    <AvatarFallback className="bg-red-500 text-white">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="ml-2 hidden md:inline-block">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/supplier/profile")}>
                  Perfil da Empresa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/supplier/settings")}>
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Navegação */}
      <div className="bg-white border-b border-red-100 shadow-sm">
        <div className="container mx-auto">
          <nav className="flex overflow-x-auto">
            <Button
              variant="ghost"
              className={`h-14 px-4 rounded-none ${
                getActiveTab() === "overview"
                  ? "border-b-2 border-red-700 text-red-800"
                  : "text-gray-600 hover:text-red-800"
              }`}
              onClick={() => setLocation("/supplier/dashboard")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Visão Geral
            </Button>
            
            <Button
              variant="ghost"
              className={`h-14 px-4 rounded-none ${
                getActiveTab() === "products"
                  ? "border-b-2 border-red-700 text-red-800"
                  : "text-gray-600 hover:text-red-800"
              }`}
              onClick={() => setLocation("/supplier/products")}
            >
              <Package className="h-4 w-4 mr-2" />
              Produtos
            </Button>
            
            <Button
              variant="ghost"
              className={`h-14 px-4 rounded-none ${
                getActiveTab() === "orders"
                  ? "border-b-2 border-red-700 text-red-800"
                  : "text-gray-600 hover:text-red-800"
              }`}
              onClick={() => setLocation("/supplier/orders")}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Pedidos
            </Button>
            
            <Button
              variant="ghost"
              className={`h-14 px-4 rounded-none ${
                getActiveTab() === "clients"
                  ? "border-b-2 border-red-700 text-red-800"
                  : "text-gray-600 hover:text-red-800"
              }`}
              onClick={() => setLocation("/supplier/clients")}
            >
              <Users className="h-4 w-4 mr-2" />
              Clientes
            </Button>
            
            <Button
              variant="ghost"
              className={`h-14 px-4 rounded-none ${
                getActiveTab() === "tenders"
                  ? "border-b-2 border-red-700 text-red-800"
                  : "text-gray-600 hover:text-red-800"
              }`}
              onClick={() => setLocation("/supplier/tenders")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Licitações
            </Button>
            
            <Button
              variant="ghost"
              className={`h-14 px-4 rounded-none ${
                getActiveTab() === "settings"
                  ? "border-b-2 border-red-700 text-red-800"
                  : "text-gray-600 hover:text-red-800"
              }`}
              onClick={() => setLocation("/supplier/settings")}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </nav>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Rodapé */}
      <footer className="bg-red-900 text-white p-4">
        <div className="container mx-auto text-center">
          <p className="text-sm">© 2025 Portal do Fornecedor - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}