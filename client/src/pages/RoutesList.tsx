import React from 'react';
import { 
  Home, 
  BarChart2, 
  FileText, 
  Database, 
  AlertTriangle, 
  Package, 
  Building2, 
  Inbox, 
  Wallet, 
  Mail, 
  Users, 
  Settings, 
  Link, 
  Blocks, 
  ArrowUpRight,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

// Defina as categorias de rotas
type RouteCategory = 
  | 'admin'
  | 'organization'
  | 'financial'
  | 'modules'
  | 'settings'
  | 'reports'
  | 'users';

// Interface para informações de rota
interface RouteInfo {
  path: string;
  name: string;
  description: string;
  category: RouteCategory;
  icon: React.ReactNode;
}

// Lista de todas as rotas da aplicação
const routes: RouteInfo[] = [
  // Rotas administrativas
  {
    path: '/',
    name: 'Dashboard',
    description: 'Visão geral do sistema com métricas e indicadores principais',
    category: 'admin',
    icon: <Home className="h-5 w-5" />
  },
  {
    path: '/analytics',
    name: 'Analytics',
    description: 'Análise detalhada de métricas, tendências e estatísticas do sistema',
    category: 'reports',
    icon: <BarChart2 className="h-5 w-5" />
  },
  {
    path: '/activity-log',
    name: 'Registro de Atividades',
    description: 'Histórico detalhado de todas as ações realizadas no sistema',
    category: 'reports',
    icon: <FileText className="h-5 w-5" />
  },
  {
    path: '/backups',
    name: 'Backups',
    description: 'Gerenciamento de backups do sistema e dados',
    category: 'settings',
    icon: <Database className="h-5 w-5" />
  },
  {
    path: '/emergencies',
    name: 'Emergências',
    description: 'Gerenciamento de situações críticas e emergenciais',
    category: 'admin',
    icon: <AlertTriangle className="h-5 w-5" />
  },
  
  // Rotas de planos e módulos
  {
    path: '/plans',
    name: 'Planos',
    description: 'Gerenciamento dos planos oferecidos na plataforma',
    category: 'financial',
    icon: <Package className="h-5 w-5" />
  },
  {
    path: '/modules',
    name: 'Módulos',
    description: 'Gerenciamento de módulos e funcionalidades do sistema',
    category: 'modules',
    icon: <Blocks className="h-5 w-5" />
  },
  {
    path: '/modules-table',
    name: 'Tabela de Módulos',
    description: 'Visualização em tabela de todos os módulos disponíveis',
    category: 'modules',
    icon: <Blocks className="h-5 w-5" />
  },
  {
    path: '/organization-modules',
    name: 'Módulos por Organização',
    description: 'Gerenciamento de módulos atribuídos às organizações',
    category: 'modules',
    icon: <Package className="h-5 w-5" />
  },
  
  // Rotas de organizações
  {
    path: '/organizations',
    name: 'Organizações',
    description: 'Listagem e gerenciamento de todas as organizações',
    category: 'organization',
    icon: <Building2 className="h-5 w-5" />
  },
  {
    path: '/organization-registration',
    name: 'Registro de Organização',
    description: 'Formulário para cadastro de novas organizações',
    category: 'organization',
    icon: <Building2 className="h-5 w-5" />
  },
  {
    path: '/sales',
    name: 'Vendas',
    description: 'Gerenciamento de vendas e contratos',
    category: 'organization',
    icon: <DollarSign className="h-5 w-5" />
  },
  
  // Rotas financeiras
  {
    path: '/financial',
    name: 'Financeiro',
    description: 'Gerenciamento de transações financeiras e pagamentos',
    category: 'financial',
    icon: <Wallet className="h-5 w-5" />
  },
  
  // Rotas de configurações
  {
    path: '/email-templates',
    name: 'Templates de Email',
    description: 'Gerenciamento de modelos de email enviados pelo sistema',
    category: 'settings',
    icon: <Mail className="h-5 w-5" />
  },
  {
    path: '/administrators',
    name: 'Administradores',
    description: 'Gerenciamento de usuários com acesso administrativo',
    category: 'users',
    icon: <Users className="h-5 w-5" />
  },
  {
    path: '/settings',
    name: 'Configurações',
    description: 'Configurações gerais do sistema',
    category: 'settings',
    icon: <Settings className="h-5 w-5" />
  },
  {
    path: '/routes-list',
    name: 'Lista de URLs',
    description: 'Listagem de todas as rotas e URLs disponíveis na aplicação',
    category: 'settings',
    icon: <Link className="h-5 w-5" />
  }
];

export default function RoutesList() {
  // Função para navegar para uma rota
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  // Agrupar rotas por categoria
  const routesByCategory = routes.reduce<Record<RouteCategory, RouteInfo[]>>((acc, route) => {
    if (!acc[route.category]) {
      acc[route.category] = [];
    }
    acc[route.category].push(route);
    return acc;
  }, {} as Record<RouteCategory, RouteInfo[]>);

  // Mapeamento de categorias para nomes em português
  const categoryNames: Record<RouteCategory, string> = {
    admin: 'Administração',
    organization: 'Organizações',
    financial: 'Financeiro',
    modules: 'Módulos',
    settings: 'Configurações',
    reports: 'Relatórios',
    users: 'Usuários'
  };

  // Cores das badges por categoria
  const categoryColors: Record<RouteCategory, string> = {
    admin: 'bg-blue-100 text-blue-800',
    organization: 'bg-green-100 text-green-800',
    financial: 'bg-purple-100 text-purple-800',
    modules: 'bg-amber-100 text-amber-800',
    reports: 'bg-sky-100 text-sky-800',
    settings: 'bg-slate-100 text-slate-800',
    users: 'bg-rose-100 text-rose-800'
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lista de URLs</h1>
          <p className="text-muted-foreground mt-2">
            Explore e acesse todas as rotas disponíveis na plataforma Endurancy
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            {Object.keys(routesByCategory).map((category) => (
              <TabsTrigger key={category} value={category}>
                {categoryNames[category as RouteCategory]}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {routes.map((route) => (
                <RouteCard 
                  key={route.path} 
                  route={route} 
                  categoryColors={categoryColors}
                  categoryNames={categoryNames}
                  onNavigate={navigateTo}
                />
              ))}
            </div>
          </TabsContent>

          {Object.entries(routesByCategory).map(([category, routes]) => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {routes.map((route) => (
                  <RouteCard 
                    key={route.path} 
                    route={route} 
                    categoryColors={categoryColors}
                    categoryNames={categoryNames}
                    onNavigate={navigateTo}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

// Componente de Card para uma rota
interface RouteCardProps {
  route: RouteInfo;
  categoryColors: Record<RouteCategory, string>;
  categoryNames: Record<RouteCategory, string>;
  onNavigate: (path: string) => void;
}

function RouteCard({ route, categoryColors, categoryNames, onNavigate }: RouteCardProps) {
  return (
    <Card className="border border-gray-200 hover:border-gray-300 transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {route.icon}
            <CardTitle className="text-lg">{route.name}</CardTitle>
          </div>
          <Badge className={categoryColors[route.category]}>
            {categoryNames[route.category]}
          </Badge>
        </div>
        <CardDescription className="mt-2">{route.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <code className="bg-gray-100 p-1 px-2 rounded text-sm">{route.path}</code>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-1" 
            onClick={() => onNavigate(route.path)}
          >
            Acessar
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}