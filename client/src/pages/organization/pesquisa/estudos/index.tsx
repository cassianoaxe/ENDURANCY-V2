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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronLeft,
  ChevronDown,
  FileText,
  Eye,
  Edit,
  Trash,
  FilePlus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bookmark,
  Search,
  FilterX,
} from "lucide-react";

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

// Componente de status para pesquisa
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
    icon: Clock
  };
  
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Badge>
  );
};

// Componente para formatação de datas
const DataFormatada = ({ data }) => {
  if (!data) return <span>-</span>;
  
  return (
    <span>
      {new Date(data).toLocaleDateString('pt-BR')}
    </span>
  );
};

// Mapeamento de tipos de pesquisa
const tiposPesquisa = {
  clinico_randomizado: "Clínico Randomizado",
  observacional_prospectivo: "Observacional Prospectivo",
  observacional_retrospectivo: "Observacional Retrospectivo",
  revisao_sistematica: "Revisão Sistemática",
  translacional: "Translacional",
  outro: "Outro"
};

export default function ListaPesquisas() {
  const { toast } = useToast();
  const [filtro, setFiltro] = React.useState("");
  const [statusFiltro, setStatusFiltro] = React.useState("");
  const [pagina, setPagina] = React.useState(1);
  const itensPorPagina = 10;
  
  const { data, isLoading, error } = useQuery<Pesquisa[]>({
    queryKey: ['/api/pesquisa/pesquisas'],
    staleTime: 60 * 1000, // 1 minuto
    retry: 1,
  });

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível obter as pesquisas científicas.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Filtrar e paginar pesquisas
  const pesquisasFiltradas = React.useMemo(() => {
    if (!data) return [];
    
    return data.filter((pesquisa) => {
      const matchTexto = filtro === "" || 
        pesquisa.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
        pesquisa.descricao.toLowerCase().includes(filtro.toLowerCase()) ||
        pesquisa.areaNome.toLowerCase().includes(filtro.toLowerCase());
      
      const matchStatus = statusFiltro === "" || 
        pesquisa.status === statusFiltro;
      
      return matchTexto && matchStatus;
    });
  }, [data, filtro, statusFiltro]);
  
  const pesquisasPaginadas = React.useMemo(() => {
    const inicio = (pagina - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    return pesquisasFiltradas.slice(inicio, fim);
  }, [pesquisasFiltradas, pagina]);
  
  const totalPaginas = React.useMemo(() => {
    return Math.ceil(pesquisasFiltradas.length / itensPorPagina);
  }, [pesquisasFiltradas]);

  // Limpar filtros
  const limparFiltros = () => {
    setFiltro("");
    setStatusFiltro("");
    setPagina(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Estudos Científicos</h2>
            <p className="text-muted-foreground">
              Gerencie seus estudos e pesquisas científicas
            </p>
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Lista de Pesquisas</CardTitle>
                <CardDescription>
                  Pesquisas científicas cadastradas
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-10 w-44" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Área</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Início</TableHead>
                    <TableHead>Previsão Término</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navegação e cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/organization/pesquisa">
                <a className="flex items-center gap-1">
                  <ChevronLeft className="h-4 w-4" />
                  <span>Voltar</span>
                </a>
              </Link>
            </Button>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Estudos Científicos</h2>
          <p className="text-muted-foreground">
            Gerencie seus estudos e pesquisas científicas
          </p>
        </div>
        <Button asChild>
          <Link href="/organization/pesquisa/estudos/novo">
            <a className="flex items-center gap-1">
              <FilePlus className="h-4 w-4" />
              <span>Nova Pesquisa</span>
            </a>
          </Link>
        </Button>
      </div>

      {/* Lista de pesquisas */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Lista de Pesquisas</CardTitle>
              <CardDescription>
                {pesquisasFiltradas.length} {pesquisasFiltradas.length === 1 ? 'pesquisa encontrada' : 'pesquisas encontradas'}
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar pesquisas..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="pl-8 w-full sm:w-[250px]"
                />
              </div>
              
              <Select
                value={statusFiltro}
                onValueChange={setStatusFiltro}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="em_analise">Em Análise</SelectItem>
                  <SelectItem value="aprovada">Aprovada</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="suspensa">Suspensa</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                </SelectContent>
              </Select>
              
              {(filtro || statusFiltro) && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={limparFiltros}
                  title="Limpar filtros"
                >
                  <FilterX className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {pesquisasFiltradas.length === 0 ? (
            <div className="text-center py-6">
              <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {filtro || statusFiltro 
                  ? "Nenhuma pesquisa corresponde aos filtros aplicados." 
                  : "Nenhuma pesquisa científica cadastrada ainda."}
              </p>
              {filtro || statusFiltro ? (
                <Button variant="outline" className="mt-4" onClick={limparFiltros}>
                  Limpar filtros
                </Button>
              ) : (
                <Button className="mt-4" asChild>
                  <Link href="/organization/pesquisa/estudos/novo">
                    <a>Criar nova pesquisa</a>
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead className="hidden md:table-cell">Área</TableHead>
                      <TableHead className="hidden md:table-cell">Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Data Início</TableHead>
                      <TableHead className="hidden lg:table-cell">Previsão Término</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pesquisasPaginadas.map((pesquisa) => (
                      <TableRow key={pesquisa.id}>
                        <TableCell className="font-medium">
                          <Link href={`/organization/pesquisa/estudos/${pesquisa.id}`}>
                            <a className="hover:underline">{pesquisa.titulo}</a>
                          </Link>
                          <div className="md:hidden text-xs text-muted-foreground mt-1">
                            {pesquisa.areaNome} • {tiposPesquisa[pesquisa.tipo] || pesquisa.tipo}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{pesquisa.areaNome}</TableCell>
                        <TableCell className="hidden md:table-cell">{tiposPesquisa[pesquisa.tipo] || pesquisa.tipo}</TableCell>
                        <TableCell>
                          <StatusBadge status={pesquisa.status} />
                          <div className="md:hidden text-xs mt-1">
                            <DataFormatada data={pesquisa.dataInicio} />
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <DataFormatada data={pesquisa.dataInicio} />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <DataFormatada data={pesquisa.dataPrevistaFim} />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/organization/pesquisa/estudos/${pesquisa.id}`}>
                                  <a className="flex items-center cursor-pointer">
                                    <Eye className="mr-2 h-4 w-4" />
                                    <span>Detalhes</span>
                                  </a>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/organization/pesquisa/estudos/${pesquisa.id}/editar`}>
                                  <a className="flex items-center cursor-pointer">
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Editar</span>
                                  </a>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive" 
                                onSelect={(e) => {
                                  e.preventDefault();
                                  // Confirmar exclusão
                                  if (window.confirm(`Tem certeza que deseja excluir a pesquisa "${pesquisa.titulo}"?`)) {
                                    // Implementar lógica de exclusão
                                    toast({
                                      title: "Funcionalidade em implementação",
                                      description: "A exclusão de pesquisas estará disponível em breve.",
                                    });
                                  }
                                }}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Excluir</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Paginação */}
              {totalPaginas > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            if (pagina > 1) setPagina(pagina - 1);
                          }}
                          className={pagina <= 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPaginas }).map((_, i) => {
                        // Para simplicidade, mostrar apenas algumas páginas
                        if (
                          i === 0 || // Primeira página
                          i === totalPaginas - 1 || // Última página
                          (i >= pagina - 2 && i <= pagina) || // Algumas páginas antes da atual
                          (i >= pagina && i <= pagina + 1) // Algumas páginas depois da atual
                        ) {
                          return (
                            <PaginationItem key={i}>
                              <PaginationLink 
                                href="#" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  setPagina(i + 1);
                                }}
                                isActive={pagina === i + 1}
                              >
                                {i + 1}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (
                          (i === 1 && pagina > 3) || // Elipse após a primeira página
                          (i === totalPaginas - 2 && pagina < totalPaginas - 3) // Elipse antes da última página
                        ) {
                          return (
                            <PaginationItem key={i}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            if (pagina < totalPaginas) setPagina(pagina + 1);
                          }}
                          className={pagina >= totalPaginas ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}