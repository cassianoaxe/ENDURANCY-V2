import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import ResearcherLayout from '@/components/layout/researcher/ResearcherLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Search,
  Filter,
  PlusCircle,
  Calendar,
  Clock,
  Users,
  FileText,
  ChevronRight,
  Download,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  FileBarChart,
  Microscope,
  ArrowUpDown,
  Beaker,
  FlaskConical,
  Brain,
  Activity,
  Clipboard,
  BarChart,
  FileEdit,
  MoreVertical,
  Check,
  X
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Estudo {
  id: string;
  titulo: string;
  descricao: string;
  investigadorPrincipal: string;
  instituicao: string;
  status: 'ativo' | 'concluido' | 'cancelado' | 'planejado';
  dataInicio: Date;
  dataConclusao?: Date;
  tags: string[];
  participantes: number;
  objetivo: string;
  tipo: 'clinico' | 'pre-clinico' | 'observacional';
  fase?: 'I' | 'II' | 'III' | 'IV' | 'piloto';
  progresso: number;
  ultimaAtualizacao: Date;
}

interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  estudoId: string;
  estudoTitulo: string;
  prazo: Date;
  status: 'pendente' | 'concluida' | 'atrasada';
  prioridade: 'baixa' | 'media' | 'alta';
  responsavel?: string;
}

export default function EstudosPesquisa() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [estudos, setEstudos] = useState<Estudo[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [filtro, setFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [ordenacao, setOrdenacao] = useState({ campo: 'dataInicio', direcao: 'desc' });

  useEffect(() => {
    // Simulação de carregamento para demonstração
    const timer = setTimeout(() => {
      // Dados de exemplo para demonstração
      setEstudos([
        {
          id: 'EST-2025-001',
          titulo: 'Eficácia do CBD em Epilepsia Refratária',
          descricao: 'Estudo clínico randomizado sobre os efeitos do canabidiol em pacientes com epilepsia refratária em tratamento convencional.',
          investigadorPrincipal: 'Dra. Ana Ribeiro',
          instituicao: 'Universidade de São Paulo',
          status: 'ativo',
          dataInicio: new Date(2025, 0, 15),
          tags: ['CBD', 'Epilepsia', 'Clínico', 'Neurologia'],
          participantes: 120,
          objetivo: 'Avaliar a eficácia e segurança do canabidiol como tratamento adjuvante em pacientes com epilepsia refratária a medicamentos convencionais.',
          tipo: 'clinico',
          fase: 'III',
          progresso: 45,
          ultimaAtualizacao: new Date(2025, 3, 10)
        },
        {
          id: 'EST-2025-002',
          titulo: 'Canabinoides e Qualidade do Sono',
          descricao: 'Avaliação dos efeitos de diferentes formulações de canabinoides na qualidade do sono em pacientes com insônia crônica.',
          investigadorPrincipal: 'Dr. Carlos Mendes',
          instituicao: 'Instituto de Neurociências',
          status: 'ativo',
          dataInicio: new Date(2025, 1, 10),
          tags: ['Canabinoides', 'Sono', 'Clínico', 'Insônia'],
          participantes: 85,
          objetivo: 'Comparar a eficácia de diferentes proporções de CBD/THC na melhoria da qualidade do sono e na redução do tempo de latência para dormir.',
          tipo: 'clinico',
          fase: 'II',
          progresso: 30,
          ultimaAtualizacao: new Date(2025, 3, 5)
        },
        {
          id: 'EST-2024-023',
          titulo: 'Uso de THC/CBD em Dor Crônica',
          descricao: 'Estudo sobre a eficácia de formulação de THC/CBD em pacientes com dor crônica neuropática de diversas etiologias.',
          investigadorPrincipal: 'Dra. Luciana Costa',
          instituicao: 'Hospital Albert Einstein',
          status: 'concluido',
          dataInicio: new Date(2024, 4, 20),
          dataConclusao: new Date(2025, 2, 10),
          tags: ['THC', 'CBD', 'Dor', 'Clínico', 'Neurologia'],
          participantes: 145,
          objetivo: 'Avaliar a efetividade e segurança da combinação THC/CBD no manejo da dor crônica neuropática refratária a tratamentos convencionais.',
          tipo: 'clinico',
          fase: 'III',
          progresso: 100,
          ultimaAtualizacao: new Date(2025, 2, 10)
        },
        {
          id: 'EST-2025-003',
          titulo: 'Canabinoides no Tratamento da Ansiedade',
          descricao: 'Investigação dos efeitos ansiolíticos dos canabinoides em pacientes diagnosticados com transtornos de ansiedade.',
          investigadorPrincipal: 'Dr. Marcelo Souza',
          instituicao: 'UNIFESP',
          status: 'ativo',
          dataInicio: new Date(2025, 2, 5),
          tags: ['Canabinoides', 'Ansiedade', 'Psiquiatria', 'Clínico'],
          participantes: 90,
          objetivo: 'Investigar os efeitos ansiolíticos do CBD em pacientes com transtorno de ansiedade generalizada através de escalas validadas e biomarcadores.',
          tipo: 'clinico',
          fase: 'II',
          progresso: 20,
          ultimaAtualizacao: new Date(2025, 3, 8)
        },
        {
          id: 'EST-2025-004',
          titulo: 'Modelo Animal para Epilepsia e CBD',
          descricao: 'Estudo pré-clínico sobre o mecanismo de ação do CBD em modelo animal de epilepsia induzida por pentilentetrazol.',
          investigadorPrincipal: 'Dr. André Santos',
          instituicao: 'USP-Ribeirão Preto',
          status: 'ativo',
          dataInicio: new Date(2025, 1, 20),
          tags: ['CBD', 'Epilepsia', 'Pré-clínico', 'Neurofarmacologia'],
          participantes: 0,
          objetivo: 'Elucidar o mecanismo de ação anticonvulsivante do CBD utilizando modelo animal de epilepsia induzida por PTZ em ratos Wistar.',
          tipo: 'pre-clinico',
          progresso: 60,
          ultimaAtualizacao: new Date(2025, 3, 2)
        },
        {
          id: 'EST-2025-005',
          titulo: 'Efeitos Neuroprotetores dos Terpenos',
          descricao: 'Avaliação dos efeitos neuroprotetores de terpenos isolados da cannabis em modelo celular de neurodegeneração.',
          investigadorPrincipal: 'Dra. Carla Mendonça',
          instituicao: 'UFRJ',
          status: 'planejado',
          dataInicio: new Date(2025, 6, 15),
          tags: ['Terpenos', 'Neuroproteção', 'Pré-clínico', 'Cultura Celular'],
          participantes: 0,
          objetivo: 'Avaliar o potencial neuroprotetor de terpenos específicos em cultura de células neuronais submetidas a estresse oxidativo.',
          tipo: 'pre-clinico',
          progresso: 0,
          ultimaAtualizacao: new Date(2025, 3, 1)
        }
      ]);

      setTarefas([
        {
          id: 'TAR-2025-045',
          titulo: 'Recrutamento de 20 novos participantes',
          descricao: 'Recrutar 20 novos participantes para o estudo de epilepsia refratária',
          estudoId: 'EST-2025-001',
          estudoTitulo: 'Eficácia do CBD em Epilepsia Refratária',
          prazo: new Date(2025, 4, 15),
          status: 'pendente',
          prioridade: 'alta',
          responsavel: 'Dra. Ana Ribeiro'
        },
        {
          id: 'TAR-2025-046',
          titulo: 'Análise de dados intermediários',
          descricao: 'Análise estatística dos dados coletados até o presente momento',
          estudoId: 'EST-2025-002',
          estudoTitulo: 'Canabinoides e Qualidade do Sono',
          prazo: new Date(2025, 4, 20),
          status: 'pendente',
          prioridade: 'media',
          responsavel: 'Dr. Carlos Mendes'
        },
        {
          id: 'TAR-2025-047',
          titulo: 'Relatório final para o comitê de ética',
          descricao: 'Preparação do relatório final do estudo para submissão ao comitê de ética',
          estudoId: 'EST-2024-023',
          estudoTitulo: 'Uso de THC/CBD em Dor Crônica',
          prazo: new Date(2025, 3, 30),
          status: 'atrasada',
          prioridade: 'alta',
          responsavel: 'Dra. Luciana Costa'
        },
        {
          id: 'TAR-2025-048',
          titulo: 'Calibração dos equipamentos de laboratório',
          descricao: 'Calibração e validação dos equipamentos de análise',
          estudoId: 'EST-2025-004',
          estudoTitulo: 'Modelo Animal para Epilepsia e CBD',
          prazo: new Date(2025, 3, 25),
          status: 'concluida',
          prioridade: 'media',
          responsavel: 'Dr. André Santos'
        },
        {
          id: 'TAR-2025-049',
          titulo: 'Preparação de formulários de consentimento',
          descricao: 'Atualização dos formulários de consentimento informado',
          estudoId: 'EST-2025-003',
          estudoTitulo: 'Canabinoides no Tratamento da Ansiedade',
          prazo: new Date(2025, 3, 18),
          status: 'pendente',
          prioridade: 'baixa',
          responsavel: 'Dr. Marcelo Souza'
        },
        {
          id: 'TAR-2025-050',
          titulo: 'Protocolo experimental para o estudo de terpenos',
          descricao: 'Finalização do protocolo experimental detalhado',
          estudoId: 'EST-2025-005',
          estudoTitulo: 'Efeitos Neuroprotetores dos Terpenos',
          prazo: new Date(2025, 5, 10),
          status: 'pendente',
          prioridade: 'media',
          responsavel: 'Dra. Carla Mendonça'
        }
      ]);

      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, JSX.Element> = {
      'ativo': <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Ativo</Badge>,
      'concluido': <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Concluído</Badge>,
      'cancelado': <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Cancelado</Badge>,
      'planejado': <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Planejado</Badge>,
    };
    
    return statusMap[status] || <Badge>Desconhecido</Badge>;
  };

  const getTarefaStatusBadge = (status: string) => {
    const statusMap: Record<string, JSX.Element> = {
      'pendente': <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pendente</Badge>,
      'concluida': <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Concluída</Badge>,
      'atrasada': <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Atrasada</Badge>,
    };
    
    return statusMap[status] || <Badge>Desconhecido</Badge>;
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const prioridadeMap: Record<string, JSX.Element> = {
      'baixa': <Badge variant="outline" className="border-green-200 text-green-700">Baixa</Badge>,
      'media': <Badge variant="outline" className="border-amber-200 text-amber-700">Média</Badge>,
      'alta': <Badge variant="outline" className="border-red-200 text-red-700">Alta</Badge>,
    };
    
    return prioridadeMap[prioridade] || <Badge variant="outline">Desconhecida</Badge>;
  };

  const getTipoIcon = (tipo: string) => {
    const iconMap: Record<string, JSX.Element> = {
      'clinico': <Clipboard className="h-5 w-5 text-purple-500" />,
      'pre-clinico': <FlaskConical className="h-5 w-5 text-blue-500" />,
      'observacional': <FileText className="h-5 w-5 text-green-500" />,
    };
    
    return iconMap[tipo] || <Clipboard className="h-5 w-5 text-gray-500" />;
  };

  const formatarData = (data: Date | undefined) => {
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

  const estudosFiltrados = estudos.filter(estudo => {
    // Filtro de busca
    const termoBusca = filtro.toLowerCase();
    const correspondeAoBuscar = 
      estudo.titulo.toLowerCase().includes(termoBusca) ||
      estudo.descricao.toLowerCase().includes(termoBusca) ||
      estudo.investigadorPrincipal.toLowerCase().includes(termoBusca) ||
      estudo.instituicao.toLowerCase().includes(termoBusca) ||
      estudo.id.toLowerCase().includes(termoBusca);
    
    // Filtro por status
    const correspondeStatus = statusFiltro === 'todos' || estudo.status === statusFiltro;
    
    // Filtro por tipo
    const correspondeTipo = tipoFiltro === 'todos' || estudo.tipo === tipoFiltro;
    
    return correspondeAoBuscar && correspondeStatus && correspondeTipo;
  }).sort((a, b) => {
    const campoOrdenacao = ordenacao.campo;
    
    // Tratar campos de data separadamente
    if (campoOrdenacao === 'dataInicio' || campoOrdenacao === 'dataConclusao' || campoOrdenacao === 'ultimaAtualizacao') {
      const dataA = a[campoOrdenacao as keyof Estudo] as Date | undefined;
      const dataB = b[campoOrdenacao as keyof Estudo] as Date | undefined;
      
      // Se uma das datas for undefined, colocá-la por último
      if (!dataA) return ordenacao.direcao === 'asc' ? 1 : -1;
      if (!dataB) return ordenacao.direcao === 'asc' ? -1 : 1;
      
      return ordenacao.direcao === 'asc' 
        ? dataA.getTime() - dataB.getTime() 
        : dataB.getTime() - dataA.getTime();
    }
    
    // Para campos numéricos
    if (campoOrdenacao === 'participantes' || campoOrdenacao === 'progresso') {
      const valorA = a[campoOrdenacao as keyof Estudo] as number;
      const valorB = b[campoOrdenacao as keyof Estudo] as number;
      
      return ordenacao.direcao === 'asc' ? valorA - valorB : valorB - valorA;
    }
    
    // Para outros campos (string), comparar normalmente
    const valorA = String(a[campoOrdenacao as keyof Estudo] || '');
    const valorB = String(b[campoOrdenacao as keyof Estudo] || '');
    
    return ordenacao.direcao === 'asc'
      ? valorA.localeCompare(valorB)
      : valorB.localeCompare(valorA);
  });

  const tarefasProximas = tarefas
    .filter(tarefa => tarefa.status !== 'concluida')
    .sort((a, b) => a.prazo.getTime() - b.prazo.getTime())
    .slice(0, 5);

  return (
    <ResearcherLayout>
      <div className="container p-4 mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Estudos e Pesquisas</h1>
              <p className="text-gray-500 mt-1">Gerenciamento de seus estudos e protocolos de pesquisa</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => toast({ title: "Exportando estudos", description: "Os dados serão exportados em CSV" })}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Dados
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setLocation('/researcher/estudos/novo')}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Novo Estudo
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Seus Estudos</CardTitle>
                  <CardDescription>
                    Estudos clínicos, pré-clínicos e observacionais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
                    <div className="relative max-w-md">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input 
                        placeholder="Buscar estudos..." 
                        className="pl-10" 
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <select 
                        value={statusFiltro}
                        onChange={(e) => setStatusFiltro(e.target.value)}
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      >
                        <option value="todos">Todos os status</option>
                        <option value="ativo">Ativos</option>
                        <option value="concluido">Concluídos</option>
                        <option value="planejado">Planejados</option>
                        <option value="cancelado">Cancelados</option>
                      </select>
                      
                      <select 
                        value={tipoFiltro}
                        onChange={(e) => setTipoFiltro(e.target.value)}
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      >
                        <option value="todos">Todos os tipos</option>
                        <option value="clinico">Clínico</option>
                        <option value="pre-clinico">Pré-clínico</option>
                        <option value="observacional">Observacional</option>
                      </select>
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border rounded-lg p-4 animate-pulse">
                          <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                          <div className="flex justify-between">
                            <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : estudosFiltrados.length > 0 ? (
                    <div className="space-y-4">
                      {estudosFiltrados.map((estudo) => (
                        <Card 
                          key={estudo.id} 
                          className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setLocation(`/researcher/estudos/${estudo.id}`)}
                        >
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-start gap-3">
                                <div className="mt-1">
                                  {getTipoIcon(estudo.tipo)}
                                </div>
                                <div>
                                  <h3 className="font-medium text-lg">{estudo.titulo}</h3>
                                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">{estudo.descricao}</p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                {getStatusBadge(estudo.status)}
                                <p className="text-xs text-gray-500">ID: {estudo.id}</p>
                              </div>
                            </div>
                            
                            <div className="mt-3">
                              <div className="flex justify-between text-sm text-gray-500 mb-1">
                                <span>Progresso</span>
                                <span>{estudo.progresso}%</span>
                              </div>
                              <Progress value={estudo.progresso} className="h-2" />
                            </div>
                            
                            <div className="flex flex-wrap gap-1 mt-3">
                              {estudo.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                            
                            <div className="flex flex-wrap justify-between text-sm text-gray-500 mt-3">
                              <div className="flex items-center gap-4 mb-2 md:mb-0">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  <span>
                                    {formatarData(estudo.dataInicio)}
                                    {estudo.dataConclusao && ` - ${formatarData(estudo.dataConclusao)}`}
                                  </span>
                                </div>
                                
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  <span>{estudo.participantes} participantes</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center">
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  <span>Atualizado: {formatarData(estudo.ultimaAtualizacao)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 px-4 py-2 flex justify-between items-center border-t">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">{estudo.investigadorPrincipal}</span>
                              <span className="mx-2">•</span>
                              <span>{estudo.instituicao}</span>
                            </p>
                            
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
                                  setLocation(`/researcher/estudos/${estudo.id}`);
                                }}>
                                  <FileText className="h-4 w-4 mr-2" />
                                  Ver detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  setLocation(`/researcher/estudos/${estudo.id}/editar`);
                                }}>
                                  <FileEdit className="h-4 w-4 mr-2" />
                                  Editar estudo
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  toast({ title: "Relatório gerado", description: `Relatório para ${estudo.id} exportado com sucesso` });
                                }}>
                                  <FileBarChart className="h-4 w-4 mr-2" />
                                  Gerar relatório
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-gray-700 font-medium mb-1">Nenhum estudo encontrado</h3>
                      <p className="text-gray-500 text-sm mb-4">
                        Não foram encontrados estudos com os critérios selecionados
                      </p>
                      <Button 
                        onClick={() => {
                          setFiltro('');
                          setStatusFiltro('todos');
                          setTipoFiltro('todos');
                        }}
                      >
                        Limpar filtros
                      </Button>
                    </div>
                  )}
                </CardContent>
                {!isLoading && estudosFiltrados.length > 0 && (
                  <CardFooter className="pt-0 flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      Mostrando {estudosFiltrados.length} de {estudos.length} estudos
                    </p>
                    <Button variant="outline" size="sm" onClick={() => toast({ title: "Carregando mais", description: "Carregando mais resultados..." })}>
                      Ver mais estudos
                    </Button>
                  </CardFooter>
                )}
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Estatísticas e Desempenho</CardTitle>
                  <CardDescription>
                    Visão geral do desempenho de seus estudos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="p-4">
                      <div className="flex flex-col items-center text-center">
                        <div className="flex items-center justify-center rounded-full w-12 h-12 bg-green-50 text-green-700 mb-2">
                          <Clipboard className="h-6 w-6" />
                        </div>
                        <p className="text-3xl font-bold">{estudos.filter(e => e.status === 'ativo').length}</p>
                        <p className="text-sm text-gray-500">Estudos Ativos</p>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex flex-col items-center text-center">
                        <div className="flex items-center justify-center rounded-full w-12 h-12 bg-blue-50 text-blue-700 mb-2">
                          <Users className="h-6 w-6" />
                        </div>
                        <p className="text-3xl font-bold">{estudos.reduce((acc, e) => acc + e.participantes, 0)}</p>
                        <p className="text-sm text-gray-500">Participantes Totais</p>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex flex-col items-center text-center">
                        <div className="flex items-center justify-center rounded-full w-12 h-12 bg-purple-50 text-purple-700 mb-2">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <p className="text-3xl font-bold">{estudos.filter(e => e.status === 'concluido').length}</p>
                        <p className="text-sm text-gray-500">Estudos Concluídos</p>
                      </div>
                    </Card>
                  </div>
                  
                  <div className="text-center py-6 border rounded-md bg-gray-50">
                    <BarChart className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Visualizações estatísticas em desenvolvimento</p>
                    <p className="text-xs text-gray-400 mt-1">Gráficos interativos estarão disponíveis em breve</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Tarefas Próximas</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="border rounded-md p-3 animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-4/5 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/5"></div>
                        </div>
                      ))}
                    </div>
                  ) : tarefasProximas.length > 0 ? (
                    <div className="space-y-3">
                      {tarefasProximas.map(tarefa => (
                        <div key={tarefa.id} className="border rounded-md p-3 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <p className="font-medium text-sm">{tarefa.titulo}</p>
                              <p className="text-xs text-gray-500">{tarefa.estudoTitulo}</p>
                            </div>
                            {getTarefaStatusBadge(tarefa.status)}
                          </div>
                          
                          <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                            <div className="flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              <span>Prazo: {formatarData(tarefa.prazo)}</span>
                            </div>
                            {getPrioridadeBadge(tarefa.prioridade)}
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex justify-center mt-2">
                        <Button variant="ghost" size="sm" className="w-full" onClick={() => setLocation('/researcher/tarefas')}>
                          Ver todas as tarefas
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <CheckCircle2 className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                      <p className="text-gray-500 font-medium">Nenhuma tarefa pendente</p>
                      <p className="text-xs text-gray-400 mt-1">Você não tem tarefas pendentes no momento</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Visão Geral por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-md p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Clipboard className="h-5 w-5 text-purple-500" />
                        <div>
                          <p className="font-medium">Estudos Clínicos</p>
                          <p className="text-xs text-gray-500">Estudos envolvendo participantes humanos</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Total</span>
                          <span className="font-medium">{estudos.filter(e => e.tipo === 'clinico').length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Ativos</span>
                          <span className="font-medium">{estudos.filter(e => e.tipo === 'clinico' && e.status === 'ativo').length}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <FlaskConical className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">Estudos Pré-clínicos</p>
                          <p className="text-xs text-gray-500">Experimentos laboratoriais e modelos animais</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Total</span>
                          <span className="font-medium">{estudos.filter(e => e.tipo === 'pre-clinico').length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Ativos</span>
                          <span className="font-medium">{estudos.filter(e => e.tipo === 'pre-clinico' && e.status === 'ativo').length}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">Estudos Observacionais</p>
                          <p className="text-xs text-gray-500">Coleta de dados sem intervenção</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Total</span>
                          <span className="font-medium">{estudos.filter(e => e.tipo === 'observacional').length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Ativos</span>
                          <span className="font-medium">{estudos.filter(e => e.tipo === 'observacional' && e.status === 'ativo').length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" onClick={() => setLocation('/researcher/estudos/novo')}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Iniciar novo estudo
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start" onClick={() => setLocation('/researcher/protocolos')}>
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Gerenciar protocolos
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: "Relatório", description: "Gerando relatório completo..." })}>
                      <FileBarChart className="h-4 w-4 mr-2" />
                      Exportar relatório completo
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start" onClick={() => setLocation('/researcher/colaboracoes')}>
                      <Users className="h-4 w-4 mr-2" />
                      Convidar colaboradores
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