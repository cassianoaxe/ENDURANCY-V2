import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
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
  Pencil, Trash2, Eye, Users, UserPlus,
  Calendar, MapPin, Phone, Mail, FileText,
  Download, Upload, FileSpreadsheet
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import BeneficiarioModal from '@/components/social/BeneficiarioModal';
import ImportBeneficiariosModal from '@/components/social/ImportBeneficiariosModal';

interface Beneficiary {
  id: number;
  name: string;
  documentId: string;
  status: 'active' | 'inactive';
  birthDate: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  dependents: number;
  entryDate: string;
  notes: string;
  income: number;
  familySize: number;
  needsCategory: string[];
  supportHistory: {
    date: string;
    description: string;
    amount?: number;
    type: string;
  }[];
  avatar?: string;
}

export default function BeneficiariesList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterNeedCategory, setFilterNeedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [_, setLocation] = useLocation();
  
  // Fetch beneficiaries data
  const { data: beneficiaries, isLoading, error } = useQuery({
    queryKey: ['/api/social/beneficiaries'],
    retry: false,
    enabled: true,
  });

  // All unique need categories across beneficiaries
  const allNeedCategories = [...new Set(Array.isArray(beneficiaries) ? beneficiaries.flatMap(b => b.needsCategory) : [])].sort();

  // Filter and sort beneficiaries based on search term and filters
  const filteredBeneficiaries = Array.isArray(beneficiaries) ? beneficiaries.filter(beneficiary => 
    (beneficiary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beneficiary.documentId.includes(searchTerm) ||
    beneficiary.phone.includes(searchTerm) ||
    beneficiary.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === 'all' || beneficiary.status === filterStatus) &&
    (filterNeedCategory === 'all' || beneficiary.needsCategory.includes(filterNeedCategory))
  ).sort((a, b) => {
    // Sort by status first (active then inactive)
    if (a.status !== b.status) {
      return a.status === 'active' ? -1 : 1;
    }
    
    // Then by name (alphabetically)
    return a.name.localeCompare(b.name);
  }) : [];

  // Pagination logic
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredBeneficiaries.length / itemsPerPage);
  const paginatedBeneficiaries = filteredBeneficiaries.slice(
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
      case 'active':
        return <Badge className="bg-green-500">Ativo</Badge>
      case 'inactive':
        return <Badge className="bg-red-500">Inativo</Badge>
      default:
        return <Badge>Desconhecido</Badge>
    }
  };

  const needsCategoryMap = {
    'food': 'Alimentação',
    'health': 'Saúde',
    'education': 'Educação',
    'housing': 'Moradia',
    'clothing': 'Vestuário',
    'transportation': 'Transporte',
    'financial': 'Financeira',
    'legal': 'Jurídica',
    'psychological': 'Psicológica',
    'other': 'Outras'
  };

  const getCategoryLabel = (category: string) => {
    return needsCategoryMap[category as keyof typeof needsCategoryMap] || category;
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Beneficiários</h1>
          <p className="text-muted-foreground">
            Gerencie os beneficiários atendidos pela associação
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Importar Lista
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Beneficiário
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Filtros e Busca</CardTitle>
          <CardDescription>
            Use os filtros abaixo para encontrar beneficiários específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nome, documento, telefone ou email..."
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
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-[250px]">
              <Select value={filterNeedCategory} onValueChange={setFilterNeedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria de Necessidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {Object.entries(needsCategoryMap).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
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
              <CardTitle>Lista de Beneficiários</CardTitle>
              <CardDescription>
                {filteredBeneficiaries.length} beneficiários encontrados
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <Button variant="outline" size="sm" className="gap-1">
                <FileText className="h-4 w-4" />
                Exportar
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                Colunas
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="w-full py-10 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredBeneficiaries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">Nenhum beneficiário encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterStatus !== 'all' || filterNeedCategory !== 'all' ? 
                  "Tente ajustar seus filtros" : 
                  "Você ainda não cadastrou nenhum beneficiário"}
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Beneficiário
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden md:table-cell">Documento</TableHead>
                    <TableHead className="hidden lg:table-cell">Contato</TableHead>
                    <TableHead className="hidden lg:table-cell">Entrada</TableHead>
                    <TableHead className="hidden md:table-cell">Necessidades</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBeneficiaries.map((beneficiary) => (
                    <TableRow key={beneficiary.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar>
                            {beneficiary.avatar ? (
                              <AvatarImage src={beneficiary.avatar} alt={beneficiary.name} />
                            ) : null}
                            <AvatarFallback>{getInitials(beneficiary.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{beneficiary.name}</div>
                            <div className="text-sm text-muted-foreground md:hidden">
                              {beneficiary.documentId}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {beneficiary.documentId}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center text-sm">
                            <Phone className="mr-2 h-3 w-3" />
                            {beneficiary.phone}
                          </div>
                          {beneficiary.email && (
                            <div className="flex items-center text-sm">
                              <Mail className="mr-2 h-3 w-3" />
                              {beneficiary.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-3 w-3" />
                          {formatDate(beneficiary.entryDate)}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {beneficiary.needsCategory.slice(0, 2).map((category, i) => (
                            <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {getCategoryLabel(category)}
                            </Badge>
                          ))}
                          {beneficiary.needsCategory.length > 2 && (
                            <Badge variant="outline" className="bg-muted text-muted-foreground">
                              +{beneficiary.needsCategory.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(beneficiary.status)}
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
                            <DropdownMenuItem onClick={() => setLocation(`/organization/social/beneficiarios/${beneficiary.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setLocation(`/organization/social/beneficiarios/${beneficiary.id}/editar`)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setLocation(`/organization/social/beneficiarios/${beneficiary.id}/historico`)}>
                              <FileText className="mr-2 h-4 w-4" />
                              Histórico
                            </DropdownMenuItem>
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
        {filteredBeneficiaries.length > 0 && (
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
                          isActive={pageNumber === currentPage}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
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
      
      {/* Modal para cadastro de beneficiários */}
      <BeneficiarioModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
      
      {/* Modal para importação em lote de beneficiários */}
      <ImportBeneficiariosModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
      />
    </div>
  );
}