import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { CMarketHeader } from '@/components/supplier/CMarketHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, User, Users, Tag, Clock, ArrowUpRight, Building } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Announcement {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'closed';
  createdAt: string;
  viewCount: number;
  budget: number | null;
  expirationDate: string | null;
  category: {
    id: number;
    name: string;
  } | null;
  organization: {
    id: number;
    name: string;
    logo: string | null;
  };
}

interface Category {
  id: number;
  name: string;
}

const CMarketPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('open');

  // Carregar categorias
  const { data: categories, isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ['/api/cmarket/categories'],
  });

  // Carregar anúncios
  const { data: announcementsData, isLoading: loadingAnnouncements } = useQuery({
    queryKey: ['/api/cmarket/announcements', {
      page: 1,
      limit: 12,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      search: searchQuery || undefined,
      status: activeTab !== 'all' ? activeTab : undefined
    }],
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleStatusChange = (status: string) => {
    setActiveTab(status);
  };

  // Extrair os dados de anúncios do resultado
  const announcements = announcementsData?.data || [];
  const pagination = announcementsData?.pagination;
  
  // Renderizar cards de anúncios
  const renderAnnouncementCards = () => {
    if (loadingAnnouncements) {
      return Array(6).fill(0).map((_, index) => (
        <Card key={`skeleton-${index}`} className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full" />
          </CardContent>
          <CardFooter>
            <div className="flex justify-between w-full">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </CardFooter>
        </Card>
      ));
    }
    
    if (announcements.length === 0) {
      return (
        <div className="col-span-full py-12 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum anúncio encontrado</h3>
          <p className="text-gray-500">
            Não há anúncios de compra disponíveis com os filtros selecionados.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => {
            setSearchQuery('');
            setSelectedCategory('all');
            setActiveTab('open');
          }}>
            Limpar filtros
          </Button>
        </div>
      );
    }
    
    return announcements.map((item: any) => {
      const announcement = item.announcement;
      const organization = item.organization;
      
      // Calcular o tempo decorrido desde a criação
      const timeAgo = formatDistanceToNow(new Date(announcement.createdAt), {
        addSuffix: true,
        locale: ptBR
      });
      
      // Definir a cor do status
      const statusColor = announcement.status === 'open' ? 'green' : 'gray';
      
      return (
        <Link key={announcement.id} href={`/supplier/cmarket/announcement/${announcement.id}`}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={organization.logo || ''} alt={organization.name} />
                  <AvatarFallback>
                    <Building size={16} />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{organization.name}</span>
              </div>
              <h3 className="text-lg font-bold line-clamp-1">{announcement.title}</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  <Clock size={12} />
                  {timeAgo}
                </Badge>
                {announcement.categoryId && (
                  <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                    <Tag size={12} />
                    {announcement.category?.name || 'Categoria'}
                  </Badge>
                )}
                <Badge variant={statusColor === 'green' ? 'success' : 'secondary'} className="text-xs">
                  {announcement.status === 'open' ? 'Aberto' : 'Fechado'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm line-clamp-3">{announcement.description}</p>
              
              {announcement.budget && (
                <div className="mt-3 bg-gray-50 p-2 rounded-md">
                  <span className="text-sm font-medium">Orçamento estimado:</span>
                  <span className="text-sm text-green-600 font-semibold ml-2">
                    R$ {announcement.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <div className="w-full flex justify-between items-center">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Users size={14} />
                  <span>{announcement.proposalCount || 0} propostas</span>
                </div>
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  Ver detalhes
                  <ArrowUpRight size={14} />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </Link>
      );
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <CMarketHeader 
        onSearch={handleSearch}
        onCategoryChange={handleCategoryChange}
        onStatusChange={handleStatusChange}
        categories={categories || []}
      />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Marketplace de Fornecedores</h1>
            <p className="text-gray-500 mt-1">
              Encontre ou publique anúncios de compra para conectar sua organização a fornecedores.
            </p>
          </div>
          
          <Link href="/supplier/cmarket/announcement/new">
            <Button className="mt-4 md:mt-0">Publicar Anúncio</Button>
          </Link>
        </div>
        
        <Tabs 
          defaultValue="open" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <TabsList>
            <TabsTrigger value="open">Anúncios Abertos</TabsTrigger>
            <TabsTrigger value="closed">Anúncios Fechados</TabsTrigger>
            <TabsTrigger value="all">Todos</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderAnnouncementCards()}
        </div>
        
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                disabled={pagination.page <= 1}
                // onClick={() => setPage(page - 1)}
              >
                Anterior
              </Button>
              <span className="text-sm text-gray-500">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <Button 
                variant="outline" 
                disabled={pagination.page >= pagination.totalPages}
                // onClick={() => setPage(page + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CMarketPage;