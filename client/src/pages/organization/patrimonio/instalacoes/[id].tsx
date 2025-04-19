'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams, Link } from 'wouter';
import {
  ArrowLeft,
  Building,
  FileEdit,
  MapPin,
  Calendar,
  SquareStack,
  Landmark,
  Home,
  Clock,
  Package,
  ImageIcon,
  File,
  AlertTriangle,
} from 'lucide-react';

interface InstallationDetailsProps {
  params: {
    id: string;
  };
}

export default function InstallationDetailsPage() {
  // Get the installation ID from the URL
  const params = useParams();
  const installationId = params.id;

  // Fetch installation details
  const {
    data: installation,
    isLoading,
    error,
  } = useQuery({
    queryKey: [`/api/patrimonio/instalacoes/${installationId}`],
  });

  // Fetch assets associated with this installation
  const {
    data: assets,
    isLoading: isLoadingAssets,
  } = useQuery({
    queryKey: [`/api/patrimonio/ativos`, { instalacaoId: installationId }],
  });

  // Format date in PT-BR format
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Format currency in BRL
  const formatCurrency = (value: number) => {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'Ativo': 'bg-green-100 text-green-800',
      'Em Reforma': 'bg-amber-100 text-amber-800',
      'Inativo': 'bg-red-100 text-red-800',
      'Em Construção': 'bg-blue-100 text-blue-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        heading={isLoading ? <Skeleton className="h-8 w-64" /> : installation?.nome || 'Detalhes da Instalação'}
        text={isLoading ? <Skeleton className="h-5 w-96" /> : `${installation?.tipo || ''} • ${installation?.cidade || ''}, ${installation?.estado || ''}`}
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" asChild>
            <Link to="/organization/patrimonio/instalacoes">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/organization/patrimonio/instalacoes/${installationId}/editar`}>
              <FileEdit className="mr-2 h-4 w-4" /> Editar Instalação
            </Link>
          </Button>
        </div>
      </PageHeader>

      {isLoading ? (
        <div className="mt-6 grid grid-cols-1 gap-6">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      ) : error ? (
        <Card className="mt-6 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-600 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" /> Erro ao carregar dados
            </CardTitle>
            <CardDescription>
              Não foi possível carregar os detalhes da instalação. Tente novamente mais tarde.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link to="/organization/patrimonio/instalacoes">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Tabs defaultValue="detalhes" className="mt-6">
          <TabsList className="grid w-full md:w-[600px] grid-cols-3">
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            <TabsTrigger value="ativos">Ativos ({isLoadingAssets ? '...' : assets?.length || 0})</TabsTrigger>
            <TabsTrigger value="fotos">Fotos e Documentos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="detalhes" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="mr-2 h-5 w-5" /> Informações Básicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Nome da Instalação</h3>
                    <p className="text-lg font-medium">{installation?.nome}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Tipo de Instalação</h3>
                    <p>{installation?.tipo}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                    <Badge className={getStatusColor(installation?.status)}>
                      {installation?.status}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Data de Aquisição</h3>
                    <p className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      {formatDate(installation?.dataAquisicao)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" /> Localização
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Endereço</h3>
                    <p>{installation?.endereco}</p>
                  </div>
                  
                  {installation?.complemento && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Complemento</h3>
                      <p>{installation.complemento}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Bairro</h3>
                    <p>{installation?.bairro}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Cidade</h3>
                      <p>{installation?.cidade}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Estado</h3>
                      <p>{installation?.estado}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">CEP</h3>
                    <p>{installation?.cep}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <SquareStack className="mr-2 h-5 w-5" /> Dimensões e Valor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Tamanho</h3>
                    <p className="text-lg font-medium">{installation?.metrosQuadrados} m²</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Valor de Aquisição</h3>
                    <p className="text-lg font-medium">
                      {formatCurrency(installation?.valorAquisicao)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {installation?.dataAquisicao ? `Em ${formatDate(installation.dataAquisicao)}` : ''}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Landmark className="mr-2 h-5 w-5" /> Informações Adicionais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Observações</h3>
                    <p className="text-sm text-justify">
                      {installation?.observacoes || 'Nenhuma observação registrada.'}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Ativos nesta instalação</h3>
                    <p className="text-lg font-medium">{isLoadingAssets ? <Skeleton className="h-6 w-16" /> : assets?.length || 0} ativos</p>
                    {!isLoadingAssets && assets?.length > 0 && (
                      <Button variant="link" className="px-0" asChild>
                        <Link to="#ativos">
                          Ver detalhes dos ativos
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="ativos" className="space-y-6 mt-6" id="ativos">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" /> Ativos nesta Instalação
                </CardTitle>
                <CardDescription>
                  Equipamentos e bens alocados neste local
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAssets ? (
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : assets?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Nenhum ativo cadastrado</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Esta instalação ainda não possui nenhum equipamento ou bem alocado.
                    </p>
                    <Button asChild>
                      <Link to="/organization/patrimonio/ativos/novo">
                        Cadastrar Novo Ativo
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assets?.map((asset: any) => (
                      <Card key={asset.id} className="overflow-hidden">
                        <div className="flex flex-col sm:flex-row">
                          {asset.image && (
                            <div className="w-full sm:w-1/4 max-w-[150px]">
                              <img
                                src={asset.image}
                                alt={asset.nome}
                                className="object-cover h-full w-full"
                              />
                            </div>
                          )}
                          <div className="p-4 flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{asset.nome}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {asset.tipo} • Código: {asset.codigo || 'N/A'}
                                </p>
                              </div>
                              <Badge className={getStatusColor(asset.status)}>
                                {asset.status}
                              </Badge>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Valor Atual:</span> {formatCurrency(asset.valorAtual)}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Aquisição:</span> {formatDate(asset.dataAquisicao)}
                              </div>
                            </div>
                            <div className="mt-3 flex justify-end">
                              <Button size="sm" variant="outline" asChild>
                                <Link to={`/organization/patrimonio/ativos/${asset.id}`}>
                                  Ver Detalhes
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link to="/organization/patrimonio/ativos/novo">
                    Cadastrar Novo Ativo
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="fotos" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ImageIcon className="mr-2 h-5 w-5" /> Fotos
                  </CardTitle>
                  <CardDescription>
                    Imagens da instalação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {installation?.images && installation.images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {installation.images.map((image: string, index: number) => (
                        <div key={index} className="aspect-square rounded-md overflow-hidden">
                          <img
                            src={image}
                            alt={`Foto ${index + 1} de ${installation.nome}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <ImageIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                      <h3 className="text-lg font-medium">Nenhuma foto cadastrada</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Adicione fotos para melhor visualização da instalação.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button asChild>
                    <Link to={`/organization/patrimonio/instalacoes/${installationId}/fotos`}>
                      Gerenciar Fotos
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <File className="mr-2 h-5 w-5" /> Documentos
                  </CardTitle>
                  <CardDescription>
                    Documentos relacionados à instalação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {installation?.documents && installation.documents.length > 0 ? (
                    <div className="space-y-3">
                      {installation.documents.map((doc: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center">
                            <File className="h-5 w-5 mr-2 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.type} • {formatDate(doc.date)}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">Visualizar</Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <File className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                      <h3 className="text-lg font-medium">Nenhum documento cadastrado</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Adicione documentos como contratos, escrituras, plantas, etc.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button asChild>
                    <Link to={`/organization/patrimonio/instalacoes/${installationId}/documentos`}>
                      Gerenciar Documentos
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}