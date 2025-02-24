"use client";
import { Link, useLocation } from "wouter";
import { 
  Home, Users, ShoppingBag, FolderOpen, 
  MessageSquare, Shield, Settings
} from "lucide-react";

const menuItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Users, label: "Associates", path: "/associates" },
  { icon: Users, label: "Non-Associates", path: "/non-associates" },
  { icon: ShoppingBag, label: "Collections", path: "/collections" },
  { icon: MessageSquare, label: "Consultations", path: "/consultations" },
  { icon: Shield, label: "Quality Guarantee", path: "/quality" },
  { icon: Settings, label: "Settings", path: "/settings" }
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-[200px] h-screen bg-gray-900 text-white fixed left-0 top-0 pt-16">
      <nav className="flex flex-col p-4 gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                ${isActive ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
