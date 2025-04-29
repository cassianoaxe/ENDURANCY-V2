import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, Filter, Plus, MoreVertical, 
  Pencil, Trash2, Eye, Target, 
  Download, Calendar, Users, BarChart
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Campaign {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'planned' | 'cancelled';
  goalAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  beneficiariesCount: number;
  volunteersCount: number;
  image?: string;
}

export default function CampaignsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Fetch campaigns data
  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ['/api/social/campaigns'],
    retry: false,
    enabled: true,
  });

  // Filter and sort campaigns based on search term and filters
  const filteredCampaigns = campaigns?.filter(campaign => 
    (campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === 'all' || campaign.status === filterStatus)
  ).sort((a, b) => {
    // Active campaigns first, then planned, then completed, then cancelled
    const statusOrder = { active: 0, planned: 1, completed: 2, cancelled: 3 };
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    
    // If same status, sort by end date (closest end date first for active campaigns)
    if (a.status === 'active') {
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    }
    
    // Otherwise sort by start date (most recent first)
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  }) || [];

  // Pagination logic
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const paginatedCampaigns = filteredCampaigns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-500">Ativa</Badge>
      case 'completed':
        return <Badge className="bg-blue-500">Concluída</Badge>
      case 'planned':
        return <Badge className="bg-yellow-500">Planejada</Badge>
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelada</Badge>
      default:
        return <Badge>Desconhecido</Badge>
    }
  };

  const calculateProgress = (current: number, goal: number) => {
    if (goal <= 0) return 0;
    const progress = (current / goal) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  return (
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Campanhas</h1>
            <p className="text-muted-foreground">
              Gerencie as campanhas de arrecadação e divulgação
            </p>
          </div>
          <Button onClick={() => window.location.href = "/organization/social/campanhas/nova"}>
            <Target className="mr-2 h-4 w-4" />
            Nova Campanha
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Filtros e Busca</CardTitle>
            <CardDescription>
              Use os filtros abaixo para encontrar campanhas específicas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por título ou descrição..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-[200px]">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="active">Ativas</SelectItem>
                    <SelectItem value="planned">Planejadas</SelectItem>
                    <SelectItem value="completed">Concluídas</SelectItem>
                    <SelectItem value="cancelled">Canceladas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtros Avançados
              </Button>
            </div>
          </CardContent>
        </Card>

        <div>
          {isLoading ? (
            <div className="w-full py-10 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">Nenhuma campanha encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterStatus !== 'all' ? "Tente ajustar seus filtros" : "Você ainda não criou nenhuma campanha"}
                </p>
                <Button onClick={() => window.location.href = "/organization/social/campanhas/nova"}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Campanha
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {paginatedCampaigns.map((campaign) => (
                  <Card key={campaign.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    {campaign.image && (
                      <div className="h-40 w-full overflow-hidden">
                        <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{campaign.title}</CardTitle>
                        {getStatusBadge(campaign.status)}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {campaign.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2 space-y-3">
                      {campaign.goalAmount > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Meta: {formatCurrency(campaign.goalAmount)}</span>
                            <span>
                              {Math.round(calculateProgress(campaign.currentAmount, campaign.goalAmount))}%
                            </span>
                          </div>
                          <Progress 
                            value={calculateProgress(campaign.currentAmount, campaign.goalAmount)} 
                            className="h-2"
                          />
                          <div className="text-sm">
                            Arrecadado: {formatCurrency(campaign.currentAmount)}
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                        <div className="flex flex-col items-center justify-center p-2 bg-muted rounded-md">
                          <Calendar className="h-4 w-4 mb-1" />
                          <span className="font-medium">{formatDate(campaign.startDate)}</span>
                          <span className="text-xs text-muted-foreground">Início</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 bg-muted rounded-md">
                          <Calendar className="h-4 w-4 mb-1" />
                          <span className="font-medium">{formatDate(campaign.endDate)}</span>
                          <span className="text-xs text-muted-foreground">Término</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 bg-muted rounded-md">
                          <Users className="h-4 w-4 mb-1" />
                          <span className="font-medium">{campaign.beneficiariesCount}</span>
                          <span className="text-xs text-muted-foreground">Beneficiários</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <div className="flex justify-between w-full">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = `/organization/social/campanhas/${campaign.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detalhes
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Abrir menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.location.href = `/organization/social/campanhas/${campaign.id}/editar`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.location.href = `/organization/social/campanhas/${campaign.id}/relatorio`}>
                              <BarChart className="mr-2 h-4 w-4" />
                              Relatório
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              <div className="flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <PaginationItem key={i}>
                          <PaginationLink 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(pageNumber);
                            }}
                            isActive={currentPage === pageNumber}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </div>
      </div>
  );
}