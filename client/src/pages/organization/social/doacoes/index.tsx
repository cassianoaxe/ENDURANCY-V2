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
  Pencil, Trash2, Eye, Heart, Calendar,
  Download, Check, Banknote, CreditCard, Mail
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Donation {
  id: number;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  amount: number;
  date: string;
  method: 'pix' | 'credit_card' | 'bank_transfer' | 'cash' | 'other';
  status: 'completed' | 'pending' | 'cancelled';
  campaignId?: number;
  campaignName?: string;
  receiptUrl?: string;
  isAnonymous: boolean;
  isRecurring: boolean;
  frequency?: 'monthly' | 'quarterly' | 'biannually' | 'annually';
  notes?: string;
  acknowledgmentSent: boolean;
}

export default function DonationsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterCampaign, setFilterCampaign] = useState<string>('all');
  
  // Fetch donations data
  const { data: donations, isLoading, error } = useQuery({
    queryKey: ['/api/social/donations'],
    retry: false,
    enabled: true,
  });

  // Fetch campaigns for filter
  const { data: campaigns } = useQuery({
    queryKey: ['/api/social/campaigns'],
    retry: false,
    enabled: true,
  });

  // Filter and sort donations based on search term and filters
  const filteredDonations = donations?.filter(donation => 
    (donation.isAnonymous ? "Doação anônima".includes(searchTerm.toLowerCase()) : donation.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (donation.donorEmail && donation.donorEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (donation.donorPhone && donation.donorPhone.includes(searchTerm)) ||
    (donation.campaignName && donation.campaignName.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (filterStatus === 'all' || donation.status === filterStatus) &&
    (filterMethod === 'all' || donation.method === filterMethod) &&
    (filterCampaign === 'all' || (filterCampaign === 'none' && !donation.campaignId) || 
     (donation.campaignId?.toString() === filterCampaign))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];

  // Pagination logic
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);
  const paginatedDonations = filteredDonations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate total amount
  const totalAmount = filteredDonations.reduce((sum, donation) => 
    donation.status === 'completed' ? sum + donation.amount : sum, 0
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed':
        return <Badge className="bg-green-500">Concluída</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500">Pendente</Badge>
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelada</Badge>
      default:
        return <Badge>Desconhecido</Badge>
    }
  };

  const getMethodIcon = (method: string) => {
    switch(method) {
      case 'pix':
        return <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="mr-2">
          <path d="M9.5,4.5L7.4,6.6L5.2,4.5L2,7.7L4.2,9.9L2,12.1L5.2,15.3L7.4,13.1L9.5,15.3l3.2-3.2l-2.1-2.1l2.1-2.1 L9.5,4.5z M14.5,4.5l-3.2,3.2l2.1,2.1l-2.1,2.1l3.2,3.2l2.1-2.1l2.1,2.1l3.2-3.2l-2.1-2.1l2.1-2.1l-3.2-3.2l-2.1,2.1L14.5,4.5z"/>
        </svg>
      case 'credit_card':
        return <CreditCard className="mr-2 h-4 w-4" />
      case 'bank_transfer':
        return <Banknote className="mr-2 h-4 w-4" />
      case 'cash':
        return <Banknote className="mr-2 h-4 w-4" />
      default:
        return <Heart className="mr-2 h-4 w-4" />
    }
  };

  const methodLabels = {
    'pix': 'PIX',
    'credit_card': 'Cartão de Crédito',
    'bank_transfer': 'Transferência',
    'cash': 'Dinheiro',
    'other': 'Outro'
  };

  return (
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Doações</h1>
            <p className="text-muted-foreground">
              Gerencie as doações recebidas pela associação
            </p>
          </div>
          <Button onClick={() => window.location.href = "/organization/social/doacoes/nova"}>
            <Heart className="mr-2 h-4 w-4" />
            Registrar Doação
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Doações</CardTitle>
              <CardDescription className="text-2xl font-bold">
                {formatCurrency(totalAmount)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {filteredDonations.filter(d => d.status === 'completed').length} doações no período
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Doações Recorrentes</CardTitle>
              <CardDescription className="text-2xl font-bold">
                {filteredDonations.filter(d => d.isRecurring).length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Doadores com contribuições periódicas
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Agradecimentos</CardTitle>
              <CardDescription className="text-2xl font-bold">
                {filteredDonations.filter(d => !d.acknowledgmentSent && d.status === 'completed').length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Doações pendentes de agradecimento
              </p>
            </CardContent>
          </Card>
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
                  placeholder="Buscar por doador, email ou campanha..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-[180px]">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="completed">Concluídas</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="cancelled">Canceladas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-[180px]">
                <Select value={filterMethod} onValueChange={setFilterMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Métodos</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                    <SelectItem value="bank_transfer">Transferência</SelectItem>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-[220px]">
                <Select value={filterCampaign} onValueChange={setFilterCampaign}>
                  <SelectTrigger>
                    <SelectValue placeholder="Campanha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Campanhas</SelectItem>
                    <SelectItem value="none">Sem Campanha</SelectItem>
                    {(campaigns || []).map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id.toString()}>
                        {campaign.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <CardTitle>Lista de Doações</CardTitle>
                <CardDescription>
                  {filteredDonations.length} doações encontradas - {formatCurrency(totalAmount)}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 mt-2 md:mt-0">
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="w-full py-10 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : filteredDonations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">Nenhuma doação encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterStatus !== 'all' || filterMethod !== 'all' || filterCampaign !== 'all' ? 
                    "Tente ajustar seus filtros" : 
                    "Você ainda não registrou nenhuma doação"}
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
                      <TableHead className="hidden md:table-cell">Valor</TableHead>
                      <TableHead className="hidden md:table-cell">Método</TableHead>
                      <TableHead className="hidden lg:table-cell">Campanha</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedDonations.map((donation) => (
                      <TableRow key={donation.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{formatDate(donation.date)}</span>
                            {donation.isRecurring && (
                              <Badge variant="outline" className="mt-1 w-fit">Recorrente</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              {!donation.isAnonymous && donation.donorName ? (
                                <AvatarFallback>{getInitials(donation.donorName)}</AvatarFallback>
                              ) : (
                                <AvatarFallback>AN</AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {donation.isAnonymous ? "Doação anônima" : donation.donorName}
                              </div>
                              <div className="text-xs text-muted-foreground hidden md:block">
                                {donation.donorEmail || (donation.donorPhone || "")}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell font-medium">
                          {formatCurrency(donation.amount)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center">
                            {getMethodIcon(donation.method)}
                            <span>{methodLabels[donation.method as keyof typeof methodLabels]}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {donation.campaignName ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {donation.campaignName}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
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
                                  Comprovante
                                </DropdownMenuItem>
                              )}
                              {!donation.acknowledgmentSent && !donation.isAnonymous && donation.donorEmail && (
                                <DropdownMenuItem>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Enviar agradecimento
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
  );
}