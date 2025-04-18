import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { ChevronDown, Search, Filter, MoreVertical, FileText, Users, Calendar, Edit, Trash, Download, Eye, Clock, CheckCircle2, AlertCircle, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Interfaces
interface Pesquisa {
  id: number;
  titulo: string;
  descricao: string;
  tipo: string;
  areaId: number;
  areaNome: string;
  status: string;
  dataInicio: string;
  dataPrevistaFim: string;
  pesquisadorPrincipalId: number;
  createdAt: string;
  updatedAt: string;
}

// Componente para exibir o status da pesquisa
const StatusBadge = ({ status }) => {
  const statusConfig = {
    em_andamento: { label: "Em andamento", variant: "default", icon: Clock },
    aprovada: { label: "Aprovada", variant: "success", icon: CheckCircle2 },
    concluida: { label: "Concluída", variant: "secondary", icon: CheckCircle2 },
    suspensa: { label: "Suspensa", variant: "destructive", icon: AlertCircle },
    em_analise: { label: "Em análise", variant: "warning", icon: Clock },
    rascunho: { label: "Rascunho", variant: "outline", icon: Bookmark },
  };

  const config = statusConfig[status] || { 
    label: status.replace('_', ' '), 
    variant: "default",
    icon: Bookmark
  };
  
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Badge>
  );
};

// Componente para exibir o tipo de pesquisa
const TipoPesquisa = ({ tipo }) => {
  const tipoMap = {
    clinico_randomizado: "Clínico Randomizado",
    observacional_prospectivo: "Observacional Prospectivo",
    observacional_retrospectivo: "Observacional Retrospectivo",
    revisao_sistematica: "Revisão Sistemática",
    translacional: "Translacional",
    outro: "Outro"
  };

  return tipoMap[tipo] || tipo.replace('_', ' ');
};

// Componente de ações para cada linha da tabela
const AcoesPesquisa = ({ pesquisa }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/organization/pesquisa/estudos/${pesquisa.id}`}>
            <a className="flex items-center">
              <Eye className="mr-2 h-4 w-4" />
              <span>Visualizar detalhes</span>
            </a>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/organization/pesquisa/estudos/${pesquisa.id}/editar`}>
            <a className="flex items-center">
              <Edit className="mr-2 h-4 w-4" />
              <span>Editar pesquisa</span>
            </a>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/organization/pesquisa/estudos/${pesquisa.id}/participantes`}>
            <a className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              <span>Gerenciar participantes</span>
            </a>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/organization/pesquisa/estudos/${pesquisa.id}/protocolos`}>
            <a className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              <span>Protocolos</span>
            </a>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/organization/pesquisa/estudos/${pesquisa.id}/agenda`}>
            <a className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <span>Agenda</span>
            </a>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">
          <Trash className="mr-2 h-4 w-4" />
          <span>Excluir</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Componente principal
export default function ListaPesquisas() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Estados para filtros e paginação
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('todos');
  const [areaFilter, setAreaFilter] = React.useState('todas');
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  // Carregar pesquisas com parâmetros de filtro
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/pesquisa/pesquisas', searchTerm, statusFilter, areaFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (statusFilter !== 'todos') params.append('status', statusFilter);
      if (areaFilter !== 'todas') params.append('area', areaFilter);
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`/api/pesquisa/pesquisas${queryString}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar pesquisas');
      }
      
      return response.json();
    },
  });

  // Carregar áreas de conhecimento para o filtro
  const { data: areasData } = useQuery({
    queryKey: ['/api/pesquisa/areas'],
    queryFn: async () => {
      const response = await fetch('/api/pesquisa/areas');
      if (!response.ok) {
        throw new Error('Erro ao carregar áreas de conhecimento');
      }
      return response.json();
    },
  });

  // Mostrar mensagem de erro se a query falhar
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível obter a lista de pesquisas.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Paginação
  const totalPages = data ? Math.ceil(data.length / itemsPerPage) : 0;
  const paginatedData = data ? data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ) : [];

  // Handlers para filtros
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleAreaChange = (value) => {
    setAreaFilter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Conteúdo para estado de carregamento
  const renderLoadingState = () => (
    <div className="space-y-3">
      {Array(5).fill(0).map((_, index) => (
        <div key={index} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Estudos Científicos</h2>
          <p className="text-muted-foreground">
            Gerencie todas as pesquisas e estudos científicos da organização
          </p>
        </div>
        <Button asChild>
          <Link href="/organization/pesquisa/estudos/novo">
            <a>Novo estudo</a>
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lista de Pesquisas</CardTitle>
          <CardDescription>
            Visualize e gerencie estudos científicos em andamento e concluídos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar pesquisas..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="em_andamento">Em andamento</SelectItem>
                  <SelectItem value="aprovada">Aprovada</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="suspensa">Suspensa</SelectItem>
                  <SelectItem value="em_analise">Em análise</SelectItem>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                </SelectContent>
              </Select>

              <Select value={areaFilter} onValueChange={handleAreaChange}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as áreas</SelectItem>
                  {areasData?.map((area) => (
                    <SelectItem key={area.id} value={area.id.toString()}>
                      {area.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabela de pesquisas */}
          {isLoading ? (
            renderLoadingState()
          ) : data?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhuma pesquisa encontrada. Comece criando uma nova pesquisa.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/organization/pesquisa/estudos/novo">
                  <a>Criar nova pesquisa</a>
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Título</TableHead>
                      <TableHead>Área</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data de início</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((pesquisa) => (
                      <TableRow key={pesquisa.id}>
                        <TableCell className="font-medium">
                          <Link href={`/organization/pesquisa/estudos/${pesquisa.id}`}>
                            <a className="hover:text-primary transition-colors">
                              {pesquisa.titulo}
                            </a>
                          </Link>
                        </TableCell>
                        <TableCell>{pesquisa.areaNome}</TableCell>
                        <TableCell>
                          <TipoPesquisa tipo={pesquisa.tipo} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={pesquisa.status} />
                        </TableCell>
                        <TableCell>
                          {pesquisa.dataInicio 
                            ? new Date(pesquisa.dataInicio).toLocaleDateString('pt-BR')
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <AcoesPesquisa pesquisa={pesquisa} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}