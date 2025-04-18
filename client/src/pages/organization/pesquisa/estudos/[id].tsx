import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  Clock, 
  Calendar, 
  Users, 
  Building, 
  FileText, 
  ClipboardList, 
  Edit, 
  Download, 
  Eye, 
  Trash, 
  CheckCircle2,
  AlertCircle,
  Bookmark
} from "lucide-react";

// Interfaces
interface ParticipantePesquisa {
  id: number;
  pacienteId: number;
  pacienteNome: string;
  dataEntrada: string;
  dataSaida: string | null;
  consentimentoAssinado: boolean;
}

interface Protocolo {
  id: number;
  codigo: string;
  titulo: string;
  autor: string;
  versao: string;
  data: string;
  status: string;
}

interface Colaboracao {
  id: number;
  instituicao: string;
  descricao: string;
  tipo: string;
  status: string;
  dataInicio: string;
  dataTermino: string | null;
}

interface Publicacao {
  id: number;
  titulo: string;
  autores: string;
  revista: string;
  doi: string;
  dataPublicacao: string;
  status: string;
}

interface DetalhePesquisa {
  id: number;
  titulo: string;
  descricao: string;
  tipo: string;
  areaId: number;
  areaNome: string;
  status: string;
  dataInicio: string;
  dataPrevistaFim: string;
  dataConclusao: string | null;
  pesquisadorPrincipalId: number | null;
  protocolo: string | null;
  createdAt: string;
  updatedAt: string;
  aprovadaPorId: number | null;
  dataAprovacao: string | null;
  observacoes: string | null;
  participantes: ParticipantePesquisa[];
  protocolos: Protocolo[];
  colaboracoes: Colaboracao[];
  publicacoes: Publicacao[];
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

// Componente para formatação de datas
const DataFormatada = ({ data, fallback = "-" }) => {
  if (!data) return <span>{fallback}</span>;
  return <span>{new Date(data).toLocaleDateString('pt-BR')}</span>;
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

// Componente principal
export default function DetalhesEstudo({ params }) {
  const { id } = params;
  const { toast } = useToast();
  
  // Carregar detalhes da pesquisa
  const { data, isLoading, error } = useQuery<DetalhePesquisa>({
    queryKey: [`/api/pesquisa/pesquisas/${id}`],
    retry: 1,
  });

  // Mostrar mensagem de erro se a query falhar
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível obter os detalhes da pesquisa.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/organization/pesquisa/estudos">
              <ChevronLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Link>
          </Button>
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-1/4 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-6">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <h3 className="text-xl font-semibold mb-4">Pesquisa não encontrada</h3>
        <p className="text-muted-foreground mb-6">
          A pesquisa que você está procurando não existe ou foi removida.
        </p>
        <Button asChild>
          <Link href="/organization/pesquisa/estudos">
            <a>Voltar para a lista de pesquisas</a>
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navegação e cabeçalho */}
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/organization/pesquisa">Pesquisa Científica</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/organization/pesquisa/estudos">Estudos</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{data.titulo}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight">{data.titulo}</h2>
              <StatusBadge status={data.status} />
            </div>
            <p className="text-muted-foreground mt-1">
              {data.areaNome} • {tiposPesquisa[data.tipo] || data.tipo}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/organization/pesquisa/estudos/${id}/participantes`}>
                <a className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Participantes</span>
                </a>
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/organization/pesquisa/estudos/${id}/protocolos`}>
                <a className="flex items-center gap-1">
                  <ClipboardList className="h-4 w-4" />
                  <span>Protocolos</span>
                </a>
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/organization/pesquisa/estudos/${id}/editar`}>
                <a className="flex items-center gap-1">
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </a>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <Tabs defaultValue="detalhes">
        <TabsList className="mb-4">
          <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          <TabsTrigger value="participantes">Participantes</TabsTrigger>
          <TabsTrigger value="protocolos">Protocolos</TabsTrigger>
          <TabsTrigger value="colaboracoes">Colaborações</TabsTrigger>
          <TabsTrigger value="publicacoes">Publicações</TabsTrigger>
        </TabsList>

        <TabsContent value="detalhes">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Pesquisa</CardTitle>
              <CardDescription>
                Detalhes e informações sobre o estudo científico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Descrição */}
              <div>
                <h4 className="text-sm font-medium mb-2">Descrição</h4>
                <p className="text-sm">{data.descricao}</p>
              </div>

              {/* Datas e informações gerais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <h4 className="text-sm font-medium mb-2">Informações Gerais</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm border-b pb-1">
                      <span className="text-muted-foreground">Área de Conhecimento</span>
                      <span>{data.areaNome}</span>
                    </div>
                    <div className="flex justify-between text-sm border-b pb-1">
                      <span className="text-muted-foreground">Tipo de Estudo</span>
                      <span>{tiposPesquisa[data.tipo] || data.tipo}</span>
                    </div>
                    <div className="flex justify-between text-sm border-b pb-1">
                      <span className="text-muted-foreground">Status Atual</span>
                      <StatusBadge status={data.status} />
                    </div>
                    <div className="flex justify-between text-sm border-b pb-1">
                      <span className="text-muted-foreground">Protocolo</span>
                      <span>{data.protocolo || "Não definido"}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Cronograma</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm border-b pb-1">
                      <span className="text-muted-foreground">Data de Início</span>
                      <DataFormatada data={data.dataInicio} />
                    </div>
                    <div className="flex justify-between text-sm border-b pb-1">
                      <span className="text-muted-foreground">Previsão de Término</span>
                      <DataFormatada data={data.dataPrevistaFim} />
                    </div>
                    <div className="flex justify-between text-sm border-b pb-1">
                      <span className="text-muted-foreground">Data de Conclusão</span>
                      <DataFormatada data={data.dataConclusao} fallback="Em andamento" />
                    </div>
                    <div className="flex justify-between text-sm border-b pb-1">
                      <span className="text-muted-foreground">Data de Aprovação</span>
                      <DataFormatada data={data.dataAprovacao} fallback="Não aprovada" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Observações */}
              {data.observacoes && (
                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-2">Observações</h4>
                  <p className="text-sm">{data.observacoes}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/organization/pesquisa/estudos">
                  <a>Voltar para lista</a>
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/organization/pesquisa/estudos/${id}/editar`}>
                  <a>Editar pesquisa</a>
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="participantes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Participantes do Estudo</CardTitle>
                <CardDescription>
                  Pacientes participando desta pesquisa
                </CardDescription>
              </div>
              <Button size="sm" asChild>
                <Link href={`/organization/pesquisa/estudos/${id}/participantes/adicionar`}>
                  <a>Adicionar participante</a>
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {data.participantes.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    Esta pesquisa ainda não possui participantes.
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href={`/organization/pesquisa/estudos/${id}/participantes/adicionar`}>
                      <a>Adicionar participante</a>
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Data de Entrada</TableHead>
                        <TableHead>Data de Saída</TableHead>
                        <TableHead>Consentimento</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.participantes.map((participante) => (
                        <TableRow key={participante.id}>
                          <TableCell className="font-medium">
                            {participante.pacienteNome}
                          </TableCell>
                          <TableCell>
                            <DataFormatada data={participante.dataEntrada} />
                          </TableCell>
                          <TableCell>
                            <DataFormatada data={participante.dataSaida} fallback="-" />
                          </TableCell>
                          <TableCell>
                            {participante.consentimentoAssinado ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Assinado
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Pendente
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/organization/pesquisa/participantes/${participante.pacienteId}`}>
                                <a>Detalhes</a>
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protocolos">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Protocolos</CardTitle>
                <CardDescription>
                  Protocolos de pesquisa e documentação
                </CardDescription>
              </div>
              <Button size="sm" asChild>
                <Link href={`/organization/pesquisa/estudos/${id}/protocolos/novo`}>
                  <a>Novo protocolo</a>
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {data.protocolos.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    Nenhum protocolo associado a esta pesquisa.
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href={`/organization/pesquisa/estudos/${id}/protocolos/novo`}>
                      <a>Adicionar protocolo</a>
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Autor</TableHead>
                        <TableHead>Versão</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.protocolos.map((protocolo) => (
                        <TableRow key={protocolo.id}>
                          <TableCell className="font-medium">
                            {protocolo.codigo}
                          </TableCell>
                          <TableCell>{protocolo.titulo}</TableCell>
                          <TableCell>{protocolo.autor}</TableCell>
                          <TableCell>{protocolo.versao}</TableCell>
                          <TableCell>
                            <DataFormatada data={protocolo.data} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={protocolo.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/organization/pesquisa/protocolos/${protocolo.id}`}>
                                <a>Visualizar</a>
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colaboracoes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Colaborações</CardTitle>
                <CardDescription>
                  Instituições e entidades colaboradoras desta pesquisa
                </CardDescription>
              </div>
              <Button size="sm" asChild>
                <Link href={`/organization/pesquisa/colaboracoes/nova?pesquisaId=${id}`}>
                  <a>Nova colaboração</a>
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {data.colaboracoes.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    Nenhuma colaboração registrada para esta pesquisa.
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href={`/organization/pesquisa/colaboracoes/nova?pesquisaId=${id}`}>
                      <a>Adicionar colaboração</a>
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Instituição</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Início</TableHead>
                        <TableHead>Término</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.colaboracoes.map((colaboracao) => (
                        <TableRow key={colaboracao.id}>
                          <TableCell className="font-medium">
                            {colaboracao.instituicao}
                          </TableCell>
                          <TableCell>{colaboracao.tipo}</TableCell>
                          <TableCell>
                            <DataFormatada data={colaboracao.dataInicio} />
                          </TableCell>
                          <TableCell>
                            <DataFormatada data={colaboracao.dataTermino} fallback="Em andamento" />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={colaboracao.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/organization/pesquisa/colaboracoes/${colaboracao.id}`}>
                                <a>Detalhes</a>
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publicacoes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Publicações</CardTitle>
                <CardDescription>
                  Artigos, resumos e outras publicações derivadas desta pesquisa
                </CardDescription>
              </div>
              <Button size="sm" asChild>
                <Link href={`/organization/pesquisa/publicacoes/nova?pesquisaId=${id}`}>
                  <a>Nova publicação</a>
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {data.publicacoes.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    Nenhuma publicação associada a esta pesquisa.
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href={`/organization/pesquisa/publicacoes/nova?pesquisaId=${id}`}>
                      <a>Adicionar publicação</a>
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Autores</TableHead>
                        <TableHead>Revista/Fonte</TableHead>
                        <TableHead>DOI</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.publicacoes.map((publicacao) => (
                        <TableRow key={publicacao.id}>
                          <TableCell className="font-medium">
                            {publicacao.titulo}
                          </TableCell>
                          <TableCell>{publicacao.autores}</TableCell>
                          <TableCell>{publicacao.revista}</TableCell>
                          <TableCell>{publicacao.doi || "-"}</TableCell>
                          <TableCell>
                            <DataFormatada data={publicacao.dataPublicacao} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={publicacao.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/organization/pesquisa/publicacoes/${publicacao.id}`}>
                                <a>Visualizar</a>
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}