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
  Pencil, Trash2, Eye, Receipt, Download, 
  FileText, CircleDollarSign
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Expense {
  id: number;
  description: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
  payee: string;
  status: 'paid' | 'pending' | 'cancelled';
  receiptUrl?: string;
  campaignId?: number;
  campaignName?: string;
}

export default function ExpensesList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Fetch expenses data
  const { data: expenses, isLoading, error } = useQuery({
    queryKey: ['/api/social/expenses'],
    retry: false,
    enabled: true,
  });

  // Filter and sort expenses based on search term and filters
  const filteredExpenses = expenses?.filter(expense => 
    (expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.payee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (expense.campaignName && expense.campaignName.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (filterCategory === 'all' || expense.category === filterCategory) &&
    (filterStatus === 'all' || expense.status === filterStatus)
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];

  // Pagination logic
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const paginatedExpenses = filteredExpenses.slice(
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
      case 'paid':
        return <Badge className="bg-green-500">Pago</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500">Pendente</Badge>
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelado</Badge>
      default:
        return <Badge>Desconhecido</Badge>
    }
  };

  // Expense categories for filter dropdown
  const categories = [
    { id: 'administrativo', name: 'Administrativo' },
    { id: 'materiais', name: 'Materiais' },
    { id: 'servicos', name: 'Serviços' },
    { id: 'impostos', name: 'Impostos e Taxas' },
    { id: 'beneficiarios', name: 'Assistência a Beneficiários' },
    { id: 'eventos', name: 'Eventos' },
    { id: 'salarios', name: 'Salários' },
    { id: 'infraestrutura', name: 'Infraestrutura' },
    { id: 'marketing', name: 'Marketing e Divulgação' },
    { id: 'outros', name: 'Outros' },
  ];

  return (
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Despesas</h1>
            <p className="text-muted-foreground">
              Gerencie as despesas da associação
            </p>
          </div>
          <Button onClick={() => window.location.href = "/organization/social/despesas/nova"}>
            <CircleDollarSign className="mr-2 h-4 w-4" />
            Nova Despesa
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Filtros e Busca</CardTitle>
            <CardDescription>
              Use os filtros abaixo para encontrar despesas específicas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por descrição, pagador ou campanha..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-[200px]">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Categorias</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-[200px]">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
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
                <CardTitle>Lista de Despesas</CardTitle>
                <CardDescription>
                  {filteredExpenses.length} despesas encontradas
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
            ) : filteredExpenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">Nenhuma despesa encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' ? "Tente ajustar seus filtros" : "Você ainda não registrou nenhuma despesa"}
                </p>
                <Button onClick={() => window.location.href = "/organization/social/despesas/nova"}>
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Despesa
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead className="hidden md:table-cell">Pagador</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{formatDate(expense.date)}</TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {expense.description}
                          {expense.campaignName && (
                            <div className="text-xs text-muted-foreground">
                              Campanha: {expense.campaignName}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {categories.find(c => c.id === expense.category)?.name || expense.category}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {expense.payee}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(expense.status)}
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
                              <DropdownMenuItem onClick={() => window.location.href = `/organization/social/despesas/${expense.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.location.href = `/organization/social/despesas/${expense.id}/editar`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              {expense.receiptUrl && (
                                <DropdownMenuItem onClick={() => window.open(expense.receiptUrl, '_blank')}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Ver Comprovante
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
          {filteredExpenses.length > 0 && (
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