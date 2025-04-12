import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Download, 
  FileText, 
  Filter, 
  Beaker, 
  Loader2, 
  MoreHorizontal,
  Plus,
  Search,
  TestTube,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mapear cores para status
const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  received: "bg-blue-100 text-blue-800 border-blue-200",
  in_progress: "bg-indigo-100 text-indigo-800 border-indigo-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  canceled: "bg-gray-100 text-gray-800 border-gray-200",
};

// Mapear ícones para status
const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-4 h-4" />,
  received: <Beaker className="w-4 h-4" />,
  in_progress: <Loader2 className="w-4 h-4" />,
  completed: <TestTube className="w-4 h-4" />,
  approved: <CheckCircle2 className="w-4 h-4" />,
  rejected: <XCircle className="w-4 h-4" />,
  canceled: <AlertTriangle className="w-4 h-4" />,
};

// Tradução dos status para português
const statusLabels: Record<string, string> = {
  pending: "Pendente",
  received: "Recebido",
  in_progress: "Em Análise",
  completed: "Concluído",
  approved: "Aprovado",
  rejected: "Rejeitado",
  canceled: "Cancelado",
};

// Tradução dos tipos de amostra
const sampleTypeLabels: Record<string, string> = {
  flower: "Flor",
  concentrate: "Concentrado",
  extract: "Extrato",
  edible: "Comestível",
  topical: "Tópico",
  tincture: "Tintura",
  oil: "Óleo",
  raw_material: "Matéria-prima",
  in_process: "Em processo",
  finished_product: "Produto final",
  other: "Outro",
};

export default function LaboratorySamples() {
  // Estados para filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Buscar amostras com filtros aplicados
  const { data: samplesData, isLoading } = useQuery({
    queryKey: ['/api/laboratory/samples', statusFilter, typeFilter, searchQuery],
    queryFn: async () => {
      let url = '/api/laboratory/samples?';
      if (statusFilter) url += `status=${statusFilter}&`;
      if (typeFilter) url += `sampleType=${typeFilter}&`;
      if (searchQuery) url += `trackingNumber=${searchQuery}&`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Erro ao buscar amostras');
      return response.json();
    },
  });

  // Calcular a paginação
  const samples = samplesData || [];
  const totalPages = Math.ceil(samples.length / itemsPerPage);
  const paginatedSamples = samples.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Amostras</h1>
          <p className="text-gray-500 mt-1">
            Gerencie e acompanhe todas as amostras do laboratório
          </p>
        </div>
        <Link href="/laboratory/samples/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Amostra
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Filter className="mr-2 h-5 w-5 text-gray-500" />
            Filtros e Pesquisa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Pesquisar por código de rastreio..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="received">Recebido</SelectItem>
                <SelectItem value="in_progress">Em Análise</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
                <SelectItem value="canceled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Amostra" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                <SelectItem value="flower">Flor</SelectItem>
                <SelectItem value="concentrate">Concentrado</SelectItem>
                <SelectItem value="extract">Extrato</SelectItem>
                <SelectItem value="oil">Óleo</SelectItem>
                <SelectItem value="edible">Comestível</SelectItem>
                <SelectItem value="topical">Tópico</SelectItem>
                <SelectItem value="raw_material">Matéria-prima</SelectItem>
                <SelectItem value="finished_product">Produto final</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de amostras */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton />
          ) : samples.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Beaker className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Nenhuma amostra encontrada</h3>
              <p className="mt-1 text-sm text-gray-500 max-w-md">
                Não encontramos nenhuma amostra com os filtros aplicados. Tente ajustar seus critérios de pesquisa ou adicione uma nova amostra.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/laboratory/samples/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Amostra
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Código</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Organização</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data de Recebimento</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSamples.map((sample) => (
                      <TableRow key={sample.id}>
                        <TableCell className="font-mono text-xs">
                          {sample.trackingNumber}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{sample.productName}</div>
                          {sample.batchNumber && (
                            <div className="text-xs text-gray-500">
                              Lote: {sample.batchNumber}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{sample.organizationName}</TableCell>
                        <TableCell>
                          <span className="capitalize">
                            {sampleTypeLabels[sample.sampleType] || sample.sampleType}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={`flex items-center gap-1 ${statusColors[sample.status]} border`}
                            variant="outline"
                          >
                            {statusIcons[sample.status]}
                            <span>{statusLabels[sample.status] || sample.status}</span>
                          </Badge>
                          {sample.priority && (
                            <Badge className="mt-1 bg-red-100 text-red-800 border-red-200" variant="outline">
                              Prioridade
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {sample.receivedAt ? (
                            new Date(sample.receivedAt).toLocaleDateString('pt-BR')
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/laboratory/samples/${sample.id}`}>
                                <FileText className="h-4 w-4" />
                                <span className="sr-only">Ver detalhes</span>
                              </Link>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Mais opções</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/laboratory/samples/${sample.id}`}>
                                    Ver detalhes
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/laboratory/samples/${sample.id}/tests`}>
                                    Ver testes
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/laboratory/samples/${sample.id}/results`}>
                                    Resultados
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/laboratory/samples/${sample.id}/report`}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Baixar relatório
                                  </Link>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="p-4 border-t">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            isActive={page === currentPage}
                            onClick={() => setCurrentPage(page)}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
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

function TableSkeleton() {
  return (
    <div className="p-4">
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4">
            <Skeleton className="h-10 w-[10%]" />
            <Skeleton className="h-10 w-[20%]" />
            <Skeleton className="h-10 w-[20%]" />
            <Skeleton className="h-10 w-[10%]" />
            <Skeleton className="h-10 w-[10%]" />
            <Skeleton className="h-10 w-[15%]" />
            <Skeleton className="h-10 w-[15%]" />
          </div>
        ))}
      </div>
    </div>
  );
}