import { ReactNode } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FileSearch,
  Database,
  Activity,
  BarChart,
  Users,
  Clipboard,
  Building,
  FilePlus,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NavItemProps {
  title: string;
  href: string;
  icon: ReactNode;
  badge?: ReactNode;
  currentPath: string;
}

export function NavItem({ title, href, icon, badge, currentPath }: NavItemProps) {
  const [, navigate] = useLocation();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Use window.location.href para navegação mais direta
    window.location.href = href;
  };
  
  return (
    <a 
      href={href}
      onClick={handleClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 cursor-pointer",
        currentPath === href
          ? "bg-gray-100 text-gray-900 font-medium"
          : "hover:bg-gray-100"
      )}
    >
      {icon}
      <span>{title}</span>
      {badge}
    </a>
  );
}

export function ResearcherNav() {
  const [location] = useLocation();
  
  const navItems = [
    {
      title: "Dashboard Pesquisa",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/researcher/dashboard",
    },
    {
      title: "Catálogo de Pesquisas",
      icon: <FileSearch className="h-5 w-5" />,
      href: "/researcher/catalogo",
    },
    {
      title: "Banco de Pacientes",
      icon: <Database className="h-5 w-5" />,
      href: "/researcher/pacientes",
    },
    {
      title: "Doenças e Condições",
      icon: <Activity className="h-5 w-5" />,
      href: "/researcher/doencas",
    },
    {
      title: "Laboratório",
      icon: <FileText className="h-5 w-5" />, 
      href: "/researcher/laboratorio",
    },
    {
      title: "Estudos",
      icon: <FileText className="h-5 w-5" />,
      href: "/researcher/estudos",
    },
    {
      title: "Protocolos",
      icon: <Clipboard className="h-5 w-5" />,
      href: "/researcher/protocolos",
    },
    {
      title: "Colaborações",
      icon: <Building className="h-5 w-5" />,
      href: "/researcher/colaboracoes",
    },
    {
      title: "Estatísticas",
      icon: <BarChart className="h-5 w-5" />,
      href: "/researcher/estatisticas",
    },
    {
      title: "Grupos de Pesquisa",
      icon: <Users className="h-5 w-5" />,
      href: "/researcher/grupos",
    },
    {
      title: "Nova Pesquisa",
      icon: <FilePlus className="h-5 w-5" />,
      href: "/researcher/nova-pesquisa",
    },
  ];
  
  return (
    <nav className="grid gap-1 px-2">
      {navItems.map((item) => (
        <NavItem
          key={item.href}
          currentPath={location}
          {...item}
        />
      ))}
    </nav>
  );
}