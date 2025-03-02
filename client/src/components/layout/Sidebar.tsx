"use client";
import { Link, useLocation } from "wouter";
import {
  Home,
  BarChart2,
  FileText,
  Database,
  AlertTriangle,
  Package,
  Building2,
  InboxIcon,
  Wallet,
  Mail,
  Users,
  Settings
} from "lucide-react";

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: BarChart2, label: "Analytics", path: "/analytics" },
  { icon: FileText, label: "Registro de Atividades", path: "/registro-de-atividades" },
  { icon: Database, label: "Backups", path: "/backups" },
  { icon: AlertTriangle, label: "Emergências", path: "/emergencias" },
  { icon: Package, label: "Planos", path: "/planos" },
  { icon: Building2, label: "Organizações", path: "/organizacoes" },
  { icon: InboxIcon, label: "Solicitações", path: "/solicitacoes" },
  { icon: Wallet, label: "Financeiro", path: "/financeiro" },
  { icon: Mail, label: "Templates de Email", path: "/templates-de-email" },
  { icon: Users, label: "Administradores", path: "/administradores" },
  { icon: Settings, label: "Configurações", path: "/configuracoes" }
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-[240px] h-screen bg-white border-r fixed left-0 top-0 pt-16">
      <nav className="flex flex-col p-4 gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm
                ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}