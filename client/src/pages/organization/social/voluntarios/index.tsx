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
  Pencil, Trash2, Eye, Users, UserPlus,
  Phone, Mail, Calendar, Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Volunteer {
  id: number;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  availability: string[];
  status: 'active' | 'inactive';
  joinDate: string;
  totalHours: number;
  avatar?: string;
}

export default function VolunteersList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSkill, setFilterSkill] = useState<string>('all');
  
  // Fetch volunteers data
  const { data: volunteers, isLoading, error } = useQuery({
    queryKey: ['/api/social/volunteers'],
    retry: false,
    enabled: true,
  });

  // All unique skills across volunteers
  const allSkills = [...new Set(volunteers?.flatMap(v => v.skills) || [])].sort();
  
  // Filter and sort volunteers based on search term and filters
  const filteredVolunteers = volunteers?.filter(volunteer => 
    (volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    volunteer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    volunteer.phone.includes(searchTerm)) &&
    (filterStatus === 'all' || volunteer.status === filterStatus) &&
    (filterSkill === 'all' || volunteer.skills.includes(filterSkill))
  ).sort((a, b) => {
    // Sort by status first (active then inactive)
    if (a.status !== b.status) {
      return a.status === 'active' ? -1 : 1;
    }
    
    // Then by total hours (descending)
    if (a.totalHours !== b.totalHours) {
      return b.totalHours - a.totalHours;
    }
    
    // Then by name (alphabetically)
    return a.name.localeCompare(b.name);
  }) || [];

  // Pagination logic
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredVolunteers.length / itemsPerPage);
  const paginatedVolunteers = filteredVolunteers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
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

  return (
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Voluntários</h1>
            <p className="text-muted-foreground">
              Gerencie os voluntários da associação
            </p>
          </div>
          <Button onClick={() => window.location.href = "/organization/social/voluntarios/novo"}>
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Voluntário
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Filtros e Busca</CardTitle>
            <CardDescription>
              Use os filtros abaixo para encontrar voluntários específicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nome, email ou telefone..."
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
                <Select value={filterSkill} onValueChange={setFilterSkill}>
                  <SelectTrigger>
                    <SelectValue placeholder="Habilidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Habilidades</SelectItem>
                    {allSkills.map(skill => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
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
                <CardTitle>Lista de Voluntários</CardTitle>
                <CardDescription>
                  {filteredVolunteers.length} voluntários encontrados
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="w-full py-10 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : filteredVolunteers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">Nenhum voluntário encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterStatus !== 'all' || filterSkill !== 'all' ? 
                    "Tente ajustar seus filtros" : 
                    "Você ainda não cadastrou nenhum voluntário"}
                </p>
                <Button onClick={() => window.location.href = "/organization/social/voluntarios/novo"}>
                  <Plus className="mr-2 h-4 w-4" />
                  Cadastrar Voluntário
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="hidden md:table-cell">Contato</TableHead>
                      <TableHead className="hidden lg:table-cell">Habilidades</TableHead>
                      <TableHead className="hidden md:table-cell">Desde</TableHead>
                      <TableHead>Horas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedVolunteers.map((volunteer) => (
                      <TableRow key={volunteer.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar>
                              {volunteer.avatar ? (
                                <AvatarImage src={volunteer.avatar} alt={volunteer.name} />
                              ) : null}
                              <AvatarFallback>{getInitials(volunteer.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{volunteer.name}</div>
                              <div className="text-sm text-muted-foreground md:hidden">
                                {volunteer.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center text-sm">
                              <Mail className="mr-2 h-3 w-3" />
                              {volunteer.email}
                            </div>
                            <div className="flex items-center text-sm">
                              <Phone className="mr-2 h-3 w-3" />
                              {volunteer.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {volunteer.skills.slice(0, 3).map((skill, i) => (
                              <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {skill}
                              </Badge>
                            ))}
                            {volunteer.skills.length > 3 && (
                              <Badge variant="outline" className="bg-muted text-muted-foreground">
                                +{volunteer.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center text-sm">
                            <Calendar className="mr-2 h-3 w-3" />
                            {formatDate(volunteer.joinDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-3 w-3" />
                            <span className="font-medium">{volunteer.totalHours}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(volunteer.status)}
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
                              <DropdownMenuItem onClick={() => window.location.href = `/organization/social/voluntarios/${volunteer.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.location.href = `/organization/social/voluntarios/${volunteer.id}/editar`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.location.href = `/organization/social/voluntarios/${volunteer.id}/horas`}>
                                <Clock className="mr-2 h-4 w-4" />
                                Registrar horas
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
          {filteredVolunteers.length > 0 && (
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