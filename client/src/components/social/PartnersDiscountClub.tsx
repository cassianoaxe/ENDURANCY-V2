import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { 
  Building, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Edit, 
  Eye, 
  FilePlus, 
  Heart, 
  PenSquare, 
  Plus, 
  RefreshCw, 
  ShoppingBag, 
  Star,
  Pill,
  GraduationCap,
  Coffee,
  Briefcase,
  ShoppingCart,
  MoreHorizontal
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface PartnersDiscountClubProps {
  organizationId: number;
}

export function PartnersDiscountClub({ organizationId }: PartnersDiscountClubProps) {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState('partners');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>('active');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Buscar parceiros com filtros e paginação
  const {
    data: partnersData,
    isLoading: isLoadingPartners,
    refetch: refetchPartners
  } = useQuery({
    queryKey: [
      '/api/social/partners', 
      { status: statusFilter, category: categoryFilter, query: searchQuery, page: currentPage, limit: pageSize }
    ],
    refetchOnWindowFocus: false,
  });

  // Buscar benefícios ativos (para a aba de benefícios)
  const {
    data: activeBenefits,
    isLoading: isLoadingBenefits,
    refetch: refetchBenefits
  } = useQuery({
    queryKey: [
      '/api/social/partners/benefits/active',
      { category: categoryFilter }
    ],
    refetchOnWindowFocus: false,
  });

  // Renderizar ícone da categoria
  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case 'health':
        return <Heart className="h-4 w-4" />;
      case 'pharmacy':
        return <Pill className="h-4 w-4" />;
      case 'food':
        return <Coffee className="h-4 w-4" />;
      case 'education':
        return <GraduationCap className="h-4 w-4" />;
      case 'services':
        return <Briefcase className="h-4 w-4" />;
      case 'retail':
        return <ShoppingCart className="h-4 w-4" />;
      default:
        return <ShoppingBag className="h-4 w-4" />;
    }
  };

  // Renderizar nome da categoria
  const getCategoryName = (category: string) => {
    const categories = {
      'health': 'Saúde',
      'pharmacy': 'Farmácia',
      'food': 'Alimentação',
      'education': 'Educação',
      'services': 'Serviços',
      'retail': 'Varejo',
      'other': 'Outros'
    };
    return categories[category] || category;
  };

  // Renderizar status do parceiro como badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Ativo</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Inativo</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Renderizar o valor do desconto
  const renderDiscountValue = (discountType: string, discountValue: number) => {
    if (discountType === 'percentage') {
      return `${discountValue}%`;
    } else if (discountType === 'fixed_value') {
      return `R$ ${discountValue.toFixed(2)}`;
    } else if (discountType === 'free_item') {
      return 'Item grátis';
    }
    return discountValue;
  };

  // Extrair dados dos parceiros e da paginação
  const partners = partnersData || [];
  const pagination = partnersData?.pagination || { total: 0, page: 1, limit: pageSize, totalPages: 1 };

  // Calcular intervalo de itens exibidos
  const startItem = (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Clube de Descontos</CardTitle>
              <CardDescription>
                Gerencie parceiros e benefícios do clube de descontos para seus associados
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/social/partners/benefits'}
              >
                <Heart className="mr-2 h-4 w-4" />
                Benefícios
              </Button>
              <Button onClick={() => window.location.href = '/social/partners/new'}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Parceiro
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <Tabs defaultValue={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-[400px]">
              <TabsTrigger value="partners">
                <Building className="w-4 h-4 mr-2" />
                Parceiros
              </TabsTrigger>
              <TabsTrigger value="benefits">
                <Heart className="w-4 h-4 mr-2" />
                Benefícios Ativos
              </TabsTrigger>
            </TabsList>

            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Buscar por nome ou CNPJ"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80"
                />
                
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as categorias</SelectItem>
                    <SelectItem value="health">Saúde</SelectItem>
                    <SelectItem value="pharmacy">Farmácia</SelectItem>
                    <SelectItem value="food">Alimentação</SelectItem>
                    <SelectItem value="education">Educação</SelectItem>
                    <SelectItem value="services">Serviços</SelectItem>
                    <SelectItem value="retail">Varejo</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
                
                {currentTab === 'partners' && (
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os status</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="inactive">Inativos</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                
                <Button variant="outline" onClick={() => {
                  if (currentTab === 'partners') {
                    refetchPartners();
                  } else {
                    refetchBenefits();
                  }
                }}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Aba de Parceiros */}
            <TabsContent value="partners" className="mt-6">
              {isLoadingPartners ? (
                <div className="py-8 text-center">Carregando parceiros...</div>
              ) : partners.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">Nenhum parceiro encontrado com os filtros atuais.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => window.location.href = '/social/partners/new'}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Cadastrar novo parceiro
                  </Button>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Cidade/UF</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {partners.map((partner) => (
                        <TableRow key={partner.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              {partner.logoUrl ? (
                                <img 
                                  src={partner.logoUrl} 
                                  alt={partner.name}
                                  className="h-8 w-8 mr-2 rounded-md object-cover"
                                />
                              ) : (
                                <div className="h-8 w-8 mr-2 bg-muted rounded-md flex items-center justify-center">
                                  <Building className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                              {partner.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {renderCategoryIcon(partner.category)}
                              <span className="ml-2">{getCategoryName(partner.category)}</span>
                            </div>
                          </TableCell>
                          <TableCell>{partner.city}/{partner.state}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-xs">{partner.contactPerson}</span>
                              <span className="text-xs text-muted-foreground">{partner.phone}</span>
                            </div>
                          </TableCell>
                          <TableCell>{renderStatusBadge(partner.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button 
                                key="view" 
                                variant="ghost" 
                                size="icon"
                                onClick={() => window.location.href = `/social/partners/${partner.id}`}
                              >
                                <Eye size={16} />
                              </Button>
                              <Button 
                                key="edit" 
                                variant="ghost" 
                                size="icon"
                                onClick={() => window.location.href = `/social/partners/${partner.id}/edit`}
                              >
                                <Edit size={16} />
                              </Button>
                              <Button 
                                key="addBenefit" 
                                variant="ghost" 
                                size="icon"
                                onClick={() => window.location.href = `/social/partners/${partner.id}/benefits/new`}
                              >
                                <FilePlus size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <CardFooter className="flex justify-between items-center border-t p-4 mt-4">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {startItem} a {endItem} de {pagination.total} parceiros
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">
                        Página {pagination.page} de {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                        disabled={currentPage === pagination.totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </>
              )}
            </TabsContent>

            {/* Aba de Benefícios */}
            <TabsContent value="benefits" className="mt-6">
              {isLoadingBenefits ? (
                <div className="py-8 text-center">Carregando benefícios...</div>
              ) : !activeBenefits || activeBenefits.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">Nenhum benefício ativo encontrado com os filtros atuais.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => window.location.href = '/social/partners'}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar novo benefício
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeBenefits.map((item) => (
                    <Card key={item.benefit.id} className="overflow-hidden">
                      <div className="h-3" style={{ backgroundColor: getColorByCategory(item.partner.category) }} />
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-base">{item.benefit.title}</CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              {renderCategoryIcon(item.partner.category)}
                              <span className="ml-2">{getCategoryName(item.partner.category)}</span>
                            </CardDescription>
                          </div>
                          <div className="flex flex-col items-end">
                            <Badge variant="secondary" className="font-semibold text-sm">
                              {renderDiscountValue(item.benefit.discountType, item.benefit.discountValue)}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2 pb-2">
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <Building className="h-3 w-3 mr-1" />
                          <span>{item.partner.name}</span>
                        </div>
                        <p className="text-sm line-clamp-2">{item.benefit.description}</p>
                      </CardContent>
                      <CardFooter className="flex justify-between p-4 pt-2 border-t text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {item.benefit.validUntil ? (
                            <span>Válido até {format(new Date(item.benefit.validUntil), 'dd/MM/yyyy')}</span>
                          ) : (
                            <span>Sem data de expiração</span>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => 
                          window.location.href = `/social/partners/${item.partner.id}/benefits/${item.benefit.id}`
                        }>
                          <Eye className="h-3 w-3 mr-1" />
                          Detalhes
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
}

// Função para obter cor com base na categoria
function getColorByCategory(category: string): string {
  const colors = {
    'health': '#16a34a', // green-600
    'pharmacy': '#0ea5e9', // sky-500
    'food': '#f59e0b', // amber-500
    'education': '#8b5cf6', // violet-500
    'services': '#0891b2', // cyan-600
    'retail': '#f43f5e', // rose-500
    'other': '#6b7280', // gray-500
  };
  return colors[category] || colors.other;
}