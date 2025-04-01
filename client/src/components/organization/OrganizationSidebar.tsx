import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Users, 
  Settings, 
  CreditCard, 
  Box, 
  FileText, 
  BarChart3, 
  LifeBuoy, 
  Calendar, 
  ShoppingCart,
  MessageSquare,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const OrganizationSidebar = () => {
  const [location] = useLocation();
  const { user } = useAuth();
  const [organizationName, setOrganizationName] = useState<string>("Minha Organização");

  // Busca o nome da organização usando o organizationId do usuário
  useEffect(() => {
    if (user?.organizationId) {
      // Aqui você poderia fazer uma chamada para buscar o nome da organização
      // Por enquanto, vamos usar um nome genérico
      setOrganizationName("Organização #" + user.organizationId);
    }
  }, [user]);

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/organization/profile", label: "Perfil da Organização", icon: Settings },
    { href: "/organization/members", label: "Membros", icon: Users },
    { href: "/organization/meu-plano", label: "Meu Plano", icon: CreditCard },
    { href: "/organization/products", label: "Produtos", icon: Box },
    { href: "/organization/documents", label: "Documentos", icon: FileText },
    { href: "/organization/reports", label: "Relatórios", icon: BarChart3 },
    { href: "/organization/help", label: "Ajuda", icon: LifeBuoy },
    { href: "/organization/calendar", label: "Calendário", icon: Calendar },
    { href: "/organization/orders", label: "Pedidos", icon: ShoppingCart },
    { href: "/organization/discussions", label: "Discussões", icon: MessageSquare },
    { href: "/organization/modules", label: "Módulos", icon: Layers },
  ];

  const isActive = (href: string) => {
    return location === href;
  };

  return (
    <aside className="w-60 fixed left-0 top-0 bottom-0 bg-gray-900 text-white z-20">
      <div className="h-16 flex items-center px-4 border-b border-gray-800">
        <span className="text-xl font-bold">Endurancy</span>
      </div>
      
      <div className="p-4">
        <p className="text-sm text-gray-400 mb-2">Organização:</p>
        <div className="overflow-hidden text-ellipsis whitespace-nowrap font-medium">
          {organizationName}
        </div>
      </div>

      <nav className="px-2 mt-4">
        <ul className="space-y-1.5">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <a
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-primary text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    )}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default OrganizationSidebar;