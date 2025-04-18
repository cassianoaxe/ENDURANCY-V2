import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import ResearcherLayout from '@/components/layout/researcher/ResearcherLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Filter,
  PlusCircle,
  FileText,
  Clock,
  Download,
  ClipboardList,
  FileEdit,
  MoreVertical,
  Share2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Users,
  ArrowUpDown,
  Calendar,
  Copy,
  Clipboard
} from 'lucide-react';
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
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface Protocolo {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  versao: string;
  status: 'ativo' | 'rascunho' | 'arquivado' | 'revisao';
  dataCriacao: Date;
  dataAtualizacao: Date;
  autor: string;
  estudosAssociados: number;
  tags: string[];
}

export default function Protocolos() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [protocolos, setProtocolos] = useState<Protocolo[]>([]);
  const [filtro, setFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [ordenacao, setOrdenacao] = useState({ campo: 'dataAtualizacao', direcao: 'desc' });

  useEffect(() => {
    // Simulação de carregamento para demonstração
    const timer = setTimeout(() => {
      // Dados de exemplo para demonstração
      setProtocolos([
        {
          id: 'PROT-2025-001',
          titulo: 'Protocolo Clínico para Avaliação de CBD em Epilepsia',
          descricao: 'Protocolo detalhado para ensaios clínicos avaliando a eficácia do CBD em pacientes com epilepsia refratária',
          tipo: 'Clínico',
          versao: '2.1',
          status: 'ativo',
          dataCriacao: new Date(2024, 11, 15),
          dataAtualizacao: new Date(2025, 2, 10),
          autor: 'Dra. Ana Ribeiro',
          estudosAssociados: 3,
          tags: ['Epilepsia', 'CBD', 'Clínico', 'Randomizado']
        },
        {
          id: 'PROT-2025-002',
          titulo: 'Protocolo de Extração e Análise de Canabinoides',
          descricao: 'Metodologia padronizada para extração, purificação e análise quantitativa de canabinoides em amostras vegetais',
          tipo: 'Laboratorial',
          versao: '1.3',
          status: 'ativo',
          dataCriacao: new Date(2025, 0, 20),
          dataAtualizacao: new Date(2025, 2, 5),
          autor: 'Dr. Carlos Mendes',
          estudosAssociados: 5,
          tags: ['HPLC', 'Extração', 'Laboratorial', 'Análise']
        },
        {
          id: 'PROT-2025-003',
          titulo: 'Avaliação de Segurança de Formulações de THC/CBD',
          descricao: 'Protocolo para monitoramento e avaliação de segurança em estudos utilizando formulações combinadas de THC/CBD',
          tipo: 'Segurança',
          versao: '1.0',
          status: 'revisao',
          dataCriacao: new Date(2025, 1, 10),
          dataAtualizacao: new Date(2025, 3, 2),
          autor: 'Dra. Luciana Costa',
          estudosAssociados: 2,
          tags: ['Segurança', 'THC', 'CBD', 'Efeitos Adversos']
        },
        {
          id: 'PROT-2024-008',
          titulo: 'Protocolo para Estudos Pré-clínicos com Modelos Animais',
          descricao: 'Diretrizes éticas e metodológicas para estudos pré-clínicos utilizando modelos animais para pesquisa com canabinoides',
          tipo: 'Pré-clínico',
          versao: '3.2',
          status: 'ativo',
          dataCriacao: new Date(2024, 5, 5),
          dataAtualizacao: new Date(2025, 1, 15),
          autor: 'Dr. André Santos',
          estudosAssociados: 4,
          tags: ['Pré-clínico', 'Modelos Animais', 'Ética', 'Neurociência']
        },
        {
          id: 'PROT-2025-004',
          titulo: 'Formulário de Consentimento para Estudos com Canabinoides',
          descricao: 'Modelo padronizado de formulário de consentimento livre e esclarecido para participantes de estudos com canabinoides',
          tipo: 'Ético',
          versao: '1.1',
          status: 'rascunho',
          dataCriacao: new Date(2025, 2, 18),
          dataAtualizacao: new Date(2025, 2, 18),
          autor: 'Dr. Marcelo Souza',
          estudosAssociados: 0,
          tags: ['Ética', 'Consentimento', 'Documentação']
        },
        {
          id: 'PROT-2024-005',
          titulo: 'Protocolo de Análise Estatística para Ensaios Clínicos',
          descricao: 'Metodologia para análise estatística de dados em ensaios clínicos com canabinoides, incluindo tamanho amostral e endpoints',
          tipo: 'Estatística',
          versao: '2.0',
          status: 'arquivado',
          dataCriacao: new Date(2024, 3, 10),
          dataAtualizacao: new Date(2024, 10, 22),
          autor: 'Dra. Carla Mendonça',
          estudosAssociados: 2,
          tags: ['Estatística', 'Análise de Dados', 'Ensaios Clínicos']
        }
      ]);

      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, JSX.Element> = {
      'ativo': <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Ativo</Badge>,
      'rascunho': <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Rascunho</Badge>,
      'arquivado': <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Arquivado</Badge>,
      'revisao': <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Em Revisão</Badge>,
    };
    
    return statusMap[status] || <Badge>Desconhecido</Badge>;
  };

  const formatarData = (data: Date) => {
    if (!data) return 'N/A';
    return data.toLocaleDateString('pt-BR');
  };

  const handleOrdenacao = (campo: string) => {
    if (ordenacao.campo === campo) {
      setOrdenacao({
        campo,
        direcao: ordenacao.direcao === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setOrdenacao({
        campo,
        direcao: 'asc'
      });
    }
  };

  const protocolosFiltrados = protocolos.filter(protocolo => {
    // Filtro de busca
    const termoBusca = filtro.toLowerCase();
    const correspondeAoBuscar = 
      protocolo.titulo.toLowerCase().includes(termoBusca) ||
      protocolo.descricao.toLowerCase().includes(termoBusca) ||
      protocolo.autor.toLowerCase().includes(termoBusca) ||
      protocolo.id.toLowerCase().includes(termoBusca) ||
      protocolo.tags.some(tag => tag.toLowerCase().includes(termoBusca));
    
    // Filtro por tipo
    const correspondeTipo = tipoFiltro === 'todos' || protocolo.tipo.toLowerCase() === tipoFiltro.toLowerCase();
    
    // Filtro por status
    const correspondeStatus = statusFiltro === 'todos' || protocolo.status === statusFiltro;
    
    return correspondeAoBuscar && correspondeTipo && correspondeStatus;
  }).sort((a, b) => {
    const campoOrdenacao = ordenacao.campo;
    
    // Tratar campos de data separadamente
    if (campoOrdenacao === 'dataCriacao' || campoOrdenacao === 'dataAtualizacao') {
      const dataA = a[campoOrdenacao].getTime();
      const dataB = b[campoOrdenacao].getTime();
      
      return ordenacao.direcao === 'asc' ? dataA - dataB : dataB - dataA;
    }
    
    // Para campos numéricos
    if (campoOrdenacao === 'estudosAssociados') {
      return ordenacao.direcao === 'asc' 
        ? a[campoOrdenacao] - b[campoOrdenacao] 
        : b[campoOrdenacao] - a[campoOrdenacao];
    }
    
    // Para outros campos (string), comparar normalmente
    const valorA = String(a[campoOrdenacao as keyof Protocolo] || '');
    const valorB = String(b[campoOrdenacao as keyof Protocolo] || '');
    
    return ordenacao.direcao === 'asc'
      ? valorA.localeCompare(valorB)
      : valorB.localeCompare(valorA);
  });

  const tiposUnicos = Array.from(new Set(protocolos.map(p => p.tipo))).sort();

  return (
    <ResearcherLayout>
      <div className="container p-4 mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Protocolos de Pesquisa</h1>
              <p className="text-gray-500 mt-1">Gerenciamento de protocolos e metodologias de pesquisa</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => toast({ title: "Exportando protocolos", description: "Os protocolos serão exportados em ZIP" })}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setLocation('/researcher/protocolos/novo')}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Novo Protocolo
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Todos os Protocolos</CardTitle>
                  <CardDescription>
                    Protocolos metodológicos, clínicos e laboratoriais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
                    <div className="relative max-w-md">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input 
                        placeholder="Buscar protocolos..." 
                        className="pl-10" 
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2">
                        <select 
                          value={tipoFiltro}
                          onChange={(e) => setTipoFiltro(e.target.value)}
                          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="todos">Todos os tipos</option>
                          {tiposUnicos.map(tipo => (
                            <option key={tipo} value={tipo.toLowerCase()}>
                              {tipo}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <select 
                          value={statusFiltro}
                          onChange={(e) => setStatusFiltro(e.target.value)}
                          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="todos">Todos os status</option>
                          <option value="ativo">Ativos</option>
                          <option value="rascunho">Rascunhos</option>
                          <option value="revisao">Em Revisão</option>
                          <option value="arquivado">Arquivados</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border rounded-lg p-4 animate-pulse">
                          <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                          <div className="flex justify-between">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : protocolosFiltrados.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead 
                              className="cursor-pointer hover:bg-muted"
                              onClick={() => handleOrdenacao('titulo')}
                            >
                              <div className="flex items-center">
                                Protocolo
                                {ordenacao.campo === 'titulo' && (
                                  <ArrowUpDown className={`ml-1 h-3 w-3 ${ordenacao.direcao === 'desc' ? 'transform rotate-180' : ''}`} />
                                )}
                              </div>
                            </TableHead>
                            <TableHead 
                              className="cursor-pointer hover:bg-muted"
                              onClick={() => handleOrdenacao('tipo')}
                            >
                              <div className="flex items-center">
                                Tipo
                                {ordenacao.campo === 'tipo' && (
                                  <ArrowUpDown className={`ml-1 h-3 w-3 ${ordenacao.direcao === 'desc' ? 'transform rotate-180' : ''}`} />
                                )}
                              </div>
                            </TableHead>
                            <TableHead 
                              className="cursor-pointer hover:bg-muted"
                              onClick={() => handleOrdenacao('dataAtualizacao')}
                            >
                              <div className="flex items-center">
                                Atualização
                                {ordenacao.campo === 'dataAtualizacao' && (
                                  <ArrowUpDown className={`ml-1 h-3 w-3 ${ordenacao.direcao === 'desc' ? 'transform rotate-180' : ''}`} />
                                )}
                              </div>
                            </TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {protocolosFiltrados.map((protocolo) => (
                            <TableRow 
                              key={protocolo.id}
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => setLocation(`/researcher/protocolos/${protocolo.id}`)}
                            >
                              <TableCell>
                                <div>
                                  <p className="font-medium">{protocolo.titulo}</p>
                                  <div className="flex text-xs text-gray-500">
                                    <p>{protocolo.id}</p>
                                    <span className="mx-1">•</span>
                                    <p>v{protocolo.versao}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{protocolo.tipo}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center text-sm">
                                  <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                                  {formatarData(protocolo.dataAtualizacao)}
                                </div>
                              </TableCell>
                              <TableCell>{getStatusBadge(protocolo.status)}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      setLocation(`/researcher/protocolos/${protocolo.id}`);
                                    }}>
                                      <FileText className="h-4 w-4 mr-2" />
                                      Ver protocolo
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      setLocation(`/researcher/protocolos/${protocolo.id}/editar`);
                                    }}>
                                      <FileEdit className="h-4 w-4 mr-2" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      toast({ title: "Protocolo duplicado", description: `Uma cópia de ${protocolo.id} foi criada` });
                                    }}>
                                      <Copy className="h-4 w-4 mr-2" />
                                      Duplicar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      toast({ title: "Protocolo compartilhado", description: `${protocolo.id} foi compartilhado` });
                                    }}>
                                      <Share2 className="h-4 w-4 mr-2" />
                                      Compartilhar
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      toast({ 
                                        title: "Protocolo arquivado", 
                                        description: `${protocolo.id} foi movido para arquivos`,
                                        variant: "destructive" 
                                      });
                                    }}>
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Arquivar
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-gray-700 font-medium mb-1">Nenhum protocolo encontrado</h3>
                      <p className="text-gray-500 text-sm mb-4">
                        Não foram encontrados protocolos com os critérios selecionados
                      </p>
                      <Button 
                        onClick={() => {
                          setFiltro('');
                          setTipoFiltro('todos');
                          setStatusFiltro('todos');
                        }}
                      >
                        Limpar filtros
                      </Button>
                    </div>
                  )}
                </CardContent>
                {!isLoading && protocolosFiltrados.length > 0 && (
                  <CardFooter className="pt-0 flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      Mostrando {protocolosFiltrados.length} de {protocolos.length} protocolos
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setLocation('/researcher/protocolos/novo')}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Criar protocolo
                    </Button>
                  </CardFooter>
                )}
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Protocolos Recentes</CardTitle>
                  <CardDescription>
                    Protocolos recentemente atualizados ou criados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border rounded-lg p-3 animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {protocolos
                        .sort((a, b) => b.dataAtualizacao.getTime() - a.dataAtualizacao.getTime())
                        .slice(0, 5)
                        .map((protocolo) => (
                          <div 
                            key={protocolo.id} 
                            className="border rounded-md p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => setLocation(`/researcher/protocolos/${protocolo.id}`)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{protocolo.titulo}</p>
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>Atualizado em {formatarData(protocolo.dataAtualizacao)}</span>
                                </div>
                              </div>
                              {getStatusBadge(protocolo.status)}
                            </div>
                            
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                              <div className="flex items-center text-xs text-gray-500">
                                <Badge variant="outline" className="mr-2">{protocolo.tipo}</Badge>
                                <span>v{protocolo.versao}</span>
                              </div>
                              
                              <Button variant="ghost" size="sm" className="h-7 px-2">
                                <FileText className="h-3.5 w-3.5 mr-1" />
                                <span className="text-xs">Ver detalhes</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Resumo de Protocolos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Card className="p-3">
                        <div className="flex flex-col items-center text-center">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-50 text-green-700 mb-1">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                          <p className="text-lg font-bold">{protocolos.filter(p => p.status === 'ativo').length}</p>
                          <p className="text-xs text-gray-500">Ativos</p>
                        </div>
                      </Card>
                      
                      <Card className="p-3">
                        <div className="flex flex-col items-center text-center">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-50 text-blue-700 mb-1">
                            <AlertCircle className="h-5 w-5" />
                          </div>
                          <p className="text-lg font-bold">{protocolos.filter(p => p.status === 'revisao').length}</p>
                          <p className="text-xs text-gray-500">Em Revisão</p>
                        </div>
                      </Card>
                      
                      <Card className="p-3">
                        <div className="flex flex-col items-center text-center">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-50 text-amber-700 mb-1">
                            <HelpCircle className="h-5 w-5" />
                          </div>
                          <p className="text-lg font-bold">{protocolos.filter(p => p.status === 'rascunho').length}</p>
                          <p className="text-xs text-gray-500">Rascunhos</p>
                        </div>
                      </Card>
                      
                      <Card className="p-3">
                        <div className="flex flex-col items-center text-center">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-50 text-gray-700 mb-1">
                            <ClipboardList className="h-5 w-5" />
                          </div>
                          <p className="text-lg font-bold">{protocolos.length}</p>
                          <p className="text-xs text-gray-500">Total</p>
                        </div>
                      </Card>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <p className="font-medium text-sm mb-3">Por tipo de protocolo</p>
                      <div className="space-y-2">
                        {tiposUnicos.map(tipo => {
                          const count = protocolos.filter(p => p.tipo === tipo).length;
                          const percentage = Math.round((count / protocolos.length) * 100);
                          
                          return (
                            <div key={tipo}>
                              <div className="flex justify-between text-sm mb-1">
                                <span>{tipo}</span>
                                <span>{count} ({percentage}%)</span>
                              </div>
                              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Protocolos mais Utilizados</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border rounded-lg p-3 animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {protocolos
                        .filter(p => p.status === 'ativo')
                        .sort((a, b) => b.estudosAssociados - a.estudosAssociados)
                        .slice(0, 5)
                        .map((protocolo, index) => (
                          <div 
                            key={protocolo.id} 
                            className="border rounded-md p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => setLocation(`/researcher/protocolos/${protocolo.id}`)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-start gap-3">
                                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-gray-500 mt-0.5 text-xs font-medium">
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-medium">{protocolo.titulo}</p>
                                  <Badge variant="outline" className="mt-1">{protocolo.tipo}</Badge>
                                </div>
                              </div>
                              <div className="flex items-center text-sm">
                                <Users className="h-4 w-4 text-gray-400 mr-1" />
                                <span>{protocolo.estudosAssociados}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" onClick={() => setLocation('/researcher/protocolos/novo')}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Criar novo protocolo
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start" onClick={() => setLocation('/researcher/protocolos/modelos')}>
                      <Clipboard className="h-4 w-4 mr-2" />
                      Biblioteca de modelos
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: "Importar", description: "Importando protocolo de arquivo..." })}>
                      <Download className="h-4 w-4 mr-2" />
                      Importar protocolo
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: "Compartilhar", description: "Compartilhando protocolo com colaboradores..." })}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartilhar com colaboradores
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ResearcherLayout>
  );
}