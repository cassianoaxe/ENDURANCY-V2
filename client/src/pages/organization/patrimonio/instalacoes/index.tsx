'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'wouter';
import {
  Building,
  MoreHorizontal,
  PlusCircle,
  Search,
  Filter,
  FileEdit,
  Trash2,
  Eye,
  ArrowLeft,
  Map,
  Home,
  ImageIcon,
  File,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type InstalacaoStatus = 'Ativo' | 'Em Reforma' | 'Inativo' | 'Em Construção';

// Tipo para representar uma instalação
interface Instalacao {
  id: number;
  nome: string;
  tipo: string;
  status: InstalacaoStatus;
  endereco: string;
  cidade: string;
  estado: string;
  metrosQuadrados: number;
  valorAquisicao?: number;
  dataAquisicao?: string;
  images?: string[];
}

// Componente para exibir o status com cor apropriada
const StatusBadge = ({ status }: { status: InstalacaoStatus }) => {
  const statusStyles = {
    'Ativo': 'bg-green-100 text-green-800 hover:bg-green-200',
    'Em Reforma': 'bg-amber-100 text-amber-800 hover:bg-amber-200',
    'Inativo': 'bg-red-100 text-red-800 hover:bg-red-200',
    'Em Construção': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  };

  return (
    <Badge className={statusStyles[status] || ''} variant="outline">
      {status}
    </Badge>
  );
};

export default function InstalacoesListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InstalacaoStatus | 'Todos'>('Todos');

  // Buscar instalações do servidor
  const {
    data: instalacoes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/patrimonio/instalacoes'],
  });

  // Filtragem de instalações
  const filteredInstalacoes = React.useMemo(() => {
    if (!instalacoes) return [];

    return instalacoes.filter((instalacao: Instalacao) => {
      const matchesSearch = searchTerm === '' || 
        instalacao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instalacao.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instalacao.cidade.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'Todos' || instalacao.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [instalacoes, searchTerm, statusFilter]);

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        heading="Instalações"
        text="Gerencie as instalações e locais físicos da sua organização."
      >
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/organization/patrimonio/instalacoes/nova">
              <PlusCircle className="mr-2 h-4 w-4" /> Nova Instalação
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/organization/patrimonio">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Link>
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="lista" className="mt-6">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="lista">Lista</TabsTrigger>
          <TabsTrigger value="mapa">Mapa</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lista" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Instalações Cadastradas</CardTitle>
              <CardDescription>
                Visualize todas as instalações, prédios, laboratórios e locais físicos da sua organização.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar por nome, tipo ou cidade..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex gap-2">
                      <Filter className="h-4 w-4" /> Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setStatusFilter('Todos')}>
                      Todos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('Ativo')}>
                      Ativos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('Em Reforma')}>
                      Em Reforma
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('Em Construção')}>
                      Em Construção
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('Inativo')}>
                      Inativos
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <p>Erro ao carregar instalações. Por favor, tente novamente mais tarde.</p>
                </div>
              ) : filteredInstalacoes.length === 0 ? (
                <div className="text-center py-8">
                  <Building className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium">Nenhuma instalação encontrada</h3>
                  {searchTerm || statusFilter !== 'Todos' ? (
                    <p className="text-muted-foreground mt-1">
                      Tente ajustar os filtros de busca
                    </p>
                  ) : (
                    <p className="text-muted-foreground mt-1">
                      Comece adicionando sua primeira instalação
                    </p>
                  )}
                  <Button className="mt-4" asChild>
                    <Link to="/organization/patrimonio/instalacoes/nova">
                      <PlusCircle className="mr-2 h-4 w-4" /> Nova Instalação
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Localização</TableHead>
                        <TableHead>Tamanho</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInstalacoes.map((instalacao: Instalacao) => (
                        <TableRow key={instalacao.id}>
                          <TableCell className="font-medium">{instalacao.nome}</TableCell>
                          <TableCell>{instalacao.tipo}</TableCell>
                          <TableCell>
                            {instalacao.cidade}/{instalacao.estado}
                          </TableCell>
                          <TableCell>{instalacao.metrosQuadrados} m²</TableCell>
                          <TableCell>
                            <StatusBadge status={instalacao.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Abrir menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link to={`/organization/patrimonio/instalacoes/${instalacao.id}`}>
                                    <Eye className="mr-2 h-4 w-4" /> Visualizar
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/organization/patrimonio/instalacoes/${instalacao.id}/editar`}>
                                    <FileEdit className="mr-2 h-4 w-4" /> Editar
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/organization/patrimonio/instalacoes/${instalacao.id}/fotos`}>
                                    <ImageIcon className="mr-2 h-4 w-4" /> Fotos
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/organization/patrimonio/instalacoes/${instalacao.id}/documentos`}>
                                    <File className="mr-2 h-4 w-4" /> Documentos
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" /> Excluir
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

              <div className="mt-4 text-sm text-muted-foreground">
                {filteredInstalacoes.length > 0 && (
                  <p>
                    Mostrando {filteredInstalacoes.length} {filteredInstalacoes.length === 1 ? 'instalação' : 'instalações'}
                    {statusFilter !== 'Todos' ? ` com status "${statusFilter}"` : ''}
                    {searchTerm ? ` para a busca "${searchTerm}"` : ''}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mapa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mapa de Instalações</CardTitle>
              <CardDescription>Visualize a localização geográfica de suas instalações</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="border rounded-md h-[400px] flex items-center justify-center bg-muted/30">
                <div className="text-center">
                  <Map className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium">Mapa em desenvolvimento</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                    O mapa interativo para visualização geográfica das instalações estará disponível em breve.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}