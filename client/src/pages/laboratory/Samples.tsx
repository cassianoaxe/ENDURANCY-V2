import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Search, Filter, Beaker, Plus, RefreshCw } from "lucide-react";

// Labels amigáveis para status
const STATUS_LABELS = {
  pending: "Pendente",
  received: "Recebida",
  in_progress: "Em Análise",
  completed: "Concluída",
  approved: "Aprovada",
  rejected: "Rejeitada",
  canceled: "Cancelada",
};

// Cores para badges de status
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  received: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  in_progress: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  completed: "bg-green-100 text-green-800 hover:bg-green-200",
  approved: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
  rejected: "bg-red-100 text-red-800 hover:bg-red-200",
  canceled: "bg-gray-100 text-gray-800 hover:bg-gray-200",
};

// Tipos de amostra
const SAMPLE_TYPES = {
  flower: "Flor",
  concentrate: "Concentrado",
  extract: "Extrato",
  edible: "Comestível",
  topical: "Tópico",
  tincture: "Tintura",
  oil: "Óleo",
  raw_material: "Matéria-prima",
  in_process: "Em processamento",
  finished_product: "Produto Final",
  other: "Outro",
};

interface SampleSearchParams {
  page: number;
  limit: number;
  status: string | null;
  sampleType: string | null;
  search: string;
}

export default function LaboratorySamples() {
  const [, setLocation] = useLocation();

  // Estado para parâmetros de busca e filtros
  const [searchParams, setSearchParams] = React.useState<SampleSearchParams>({
    page: 1,
    limit: 10,
    status: null,
    sampleType: null,
    search: "",
  });

  // Estado para o valor atual do campo de busca antes de submeter
  const [searchInputValue, setSearchInputValue] = React.useState("");

  // Buscar dados das amostras com base nos filtros e paginação
  const { 
    data: samplesData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: [
      '/api/laboratory/samples', 
      searchParams.page, 
      searchParams.limit, 
      searchParams.status, 
      searchParams.sampleType, 
      searchParams.search
    ],
  });

  // Manipuladores de eventos para filtros e paginação
  const handleStatusChange = (value: string) => {
    setSearchParams({
      ...searchParams,
      status: value === "all" ? null : value,
      page: 1, // Resetar para a primeira página quando mudar o filtro
    });
  };

  const handleTypeChange = (value: string) => {
    setSearchParams({
      ...searchParams,
      sampleType: value === "all" ? null : value,
      page: 1,
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({
      ...searchParams,
      search: searchInputValue,
      page: 1,
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({
      ...searchParams,
      page: newPage,
    });
  };

  // Função para renderizar os controles de paginação
  const renderPagination = () => {
    if (!samplesData || !samplesData.pagination) return null;

    const { page, totalPages } = samplesData.pagination;
    
    // Determinar quais páginas mostrar
    const pageNumbers: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // Se houver 7 ou menos páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Sempre incluir primeira página
      pageNumbers.push(1);
      
      // Se a página atual estiver próxima do início
      if (page <= 3) {
        pageNumbers.push(2, 3, 4, '...', totalPages);
      } 
      // Se a página atual estiver próxima do fim
      else if (page >= totalPages - 2) {
        pageNumbers.push('...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } 
      // Se a página atual estiver no meio
      else {
        pageNumbers.push('...', page - 1, page, page + 1, '...', totalPages);
      }
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => page > 1 && handlePageChange(page - 1)}
              className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {pageNumbers.map((pageNum, index) => (
            typeof pageNum === 'string' ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  onClick={() => handlePageChange(pageNum)}
                  isActive={page === pageNum}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            )
          ))}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => page < totalPages && handlePageChange(page + 1)}
              className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Estado de carregamento
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-medium mb-2">Carregando amostras...</h2>
          <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">Erro ao carregar amostras</h2>
          <p className="text-gray-500 mb-4">
            Ocorreu um erro ao buscar as amostras. Por favor, tente novamente mais tarde.
          </p>
          <Button 
            onClick={() => refetch()}
            variant="outline"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Amostras</h1>
          <p className="text-muted-foreground">
            Gerencie e monitore as amostras enviadas para análise
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Amostra
          </Button>
        </div>
      </div>

      <Separator />

      {/* Filtros e busca */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
          <CardDescription>
            Filtre as amostras por status, tipo ou busque por código
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                onValueChange={handleStatusChange}
                defaultValue="all"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Amostra</label>
              <Select
                onValueChange={handleTypeChange}
                defaultValue="all"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {Object.entries(SAMPLE_TYPES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input 
                  placeholder="Código, lote ou organização..."
                  value={searchInputValue}
                  onChange={(e) => setSearchInputValue(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" variant="secondary">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de amostras */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Amostras</CardTitle>
            {samplesData?.pagination && (
              <div className="text-sm text-muted-foreground">
                Mostrando {samplesData.data.length} de {samplesData.pagination.totalCount} amostras
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {samplesData?.data && samplesData.data.length > 0 ? (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Organização</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data de Envio</TableHead>
                      <TableHead>Testes</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {samplesData.data.map((sample: any) => (
                      <TableRow key={sample.id}>
                        <TableCell className="font-medium">{sample.code}</TableCell>
                        <TableCell>
                          {SAMPLE_TYPES[sample.sample_type as keyof typeof SAMPLE_TYPES] || sample.sample_type}
                        </TableCell>
                        <TableCell>{sample.organization_name || "N/A"}</TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[sample.status] || "bg-gray-100"}>
                            {STATUS_LABELS[sample.status as keyof typeof STATUS_LABELS] || sample.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(sample.created_at)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {sample.tests_count || 0} testes
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setLocation(`/laboratory/samples/${sample.id}`)}
                          >
                            Ver detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-center mt-6">
                {renderPagination()}
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <Beaker className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhuma amostra encontrada</h3>
              <p className="text-gray-500 mb-6">
                Não foram encontradas amostras com os filtros aplicados.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchParams({
                    page: 1,
                    limit: 10,
                    status: null,
                    sampleType: null,
                    search: "",
                  });
                  setSearchInputValue("");
                }}
              >
                <Filter className="mr-2 h-4 w-4" />
                Limpar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}