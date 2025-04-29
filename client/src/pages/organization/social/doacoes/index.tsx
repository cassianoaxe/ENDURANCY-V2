import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { OrganizationLayout } from "@/components/layout/OrganizationLayout";
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
  Pencil, Trash2, Eye, HandCoins, Download
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Donation {
  id: number;
  donorName: string;
  type: 'financial' | 'material' | 'service';
  amount: number;
  description: string;
  date: string;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'cancelled';
  receiptUrl?: string;
  campaignId?: number;
  campaignName?: string;
}

export default function DonationsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<string>('all');
  
  // Fetch donations data
  const { data: donations, isLoading, error } = useQuery({
    queryKey: ['/api/social/donations'],
    retry: false,
    enabled: true,
  });

  // Filter and sort donations based on search term and filter
  const filteredDonations = donations?.filter(donation => 
    (donation.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (donation.campaignName && donation.campaignName.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (filterType === 'all' || donation.type === filterType)
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];

  // Pagination logic
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);
  const paginatedDonations = filteredDonations.slice(
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
      case 'completed':
        return <Badge className="bg-green-500">Confirmada</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500">Pendente</Badge>
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelada</Badge>
      default:
        return <Badge>Desconhecido</Badge>
    }
  };

  const getDonationType = (type: string) => {
    switch(type) {
      case 'financial':
        return 'Financeira';
      case 'material':
        return 'Material';
      case 'service':
        return 'Serviço';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <OrganizationLayout>
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Doações</h1>
            <p className="text-muted-foreground">
              Gerencie as doações recebidas pela associação
            </p>
          </div>
          <Button onClick={() => window.location.href = "/organization/social/doacoes/nova"}>
            <HandCoins className="mr-2 h-4 w-4" />
            Nova Doação
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Filtros e Busca</CardTitle>
            <CardDescription>
              Use os filtros abaixo para encontrar doações específicas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por doador, descrição ou campanha..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-[200px]">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de Doação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="financial">Financeira</SelectItem>
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="service">Serviço</SelectItem>
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

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <CardTitle>Lista de Doações</CardTitle>
                <CardDescription>
                  {filteredDonations.length} doações encontradas
                </CardDescription>
              </div>
              <Button variant="outline" className="mt-2 md:mt-0" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="w-full py-10 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : filteredDonations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <HandCoins className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">Nenhuma doação encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterType !== 'all' ? "Tente ajustar seus filtros" : "Você ainda não registrou nenhuma doação"}
                </p>
                <Button onClick={() => window.location.href = "/organization/social/doacoes/nova"}>
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Doação
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Doador</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor / Descrição</TableHead>
                      <TableHead className="hidden md:table-cell">Campanha</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedDonations.map((donation) => (
                      <TableRow key={donation.id}>
                        <TableCell>{formatDate(donation.date)}</TableCell>
                        <TableCell className="font-medium">{donation.donorName}</TableCell>
                        <TableCell>{getDonationType(donation.type)}</TableCell>
                        <TableCell>
                          {donation.type === 'financial' ? (
                            <span className="font-medium">{formatCurrency(donation.amount)}</span>
                          ) : (
                            <span className="text-sm">{donation.description}</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {donation.campaignName || "—"}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(donation.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => window.location.href = `/organization/social/doacoes/${donation.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.location.href = `/organization/social/doacoes/${donation.id}/editar`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              {donation.receiptUrl && (
                                <DropdownMenuItem onClick={() => window.open(donation.receiptUrl, '_blank')}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Baixar Recibo
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          {filteredDonations.length > 0 && (
            <CardFooter>
              <div className="w-full flex justify-center">
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
            </CardFooter>
          )}
        </Card>
      </div>
    </OrganizationLayout>
  );
}