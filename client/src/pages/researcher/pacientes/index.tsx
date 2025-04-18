import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import ResearcherLayout from '@/components/layout/researcher/ResearcherLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  Users,
  Clock,
  Calendar,
  FileText,
  BarChart2,
  ChevronRight,
  PlusCircle,
  Download,
  CheckCircle2,
  XCircle,
  ClipboardList,
  UserPlus,
  ListFilter,
  Activity,
  UserCircle,
  User,
  CircleHelp,
  AlertCircle,
  Info,
  FileBarChart,
  FileSpreadsheet,
  ArrowUpDown,
  Check,
  Mail,
  Phone,
  CalendarDays
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
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface Paciente {
  id: string;
  nome: string;
  idade: number;
  genero: string;
  diagnostico: string;
  statusPesquisa: 'ativo' | 'concluido' | 'excluido' | 'pendente';
  dataCadastro: Date;
  dataUltimoContato?: Date;
  estudosAssociados: string[];
  condicoesRelacionadas: string[];
  email?: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
}

interface GrupoPacientes {
  nome: string;
  descricao: string;
  qtdPacientes: number;
  diagnosticoPrincipal: string;
  estudoAssociado?: string;
  dataCriacao: Date;
}

interface EstatisticaPacientes {
  categoria: string;
  quantidade: number;
  percentual: number;
  cor: string;
}

export default function BancoPacientes() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [grupos, setGrupos] = useState<GrupoPacientes[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticaPacientes[]>([]);
  const [filtro, setFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [diagnosticoFiltro, setDiagnosticoFiltro] = useState('todos');
  const [ordenacao, setOrdenacao] = useState({ campo: 'dataCadastro', direcao: 'desc' });

  useEffect(() => {
    // Simulação de carregamento para demonstração
    const timer = setTimeout(() => {
      // Dados de exemplo para demonstração
      setPacientes([
        {
          id: 'PAC-2025-001',
          nome: 'Ana Silva',
          idade: 34,
          genero: 'Feminino',
          diagnostico: 'Epilepsia Refratária',
          statusPesquisa: 'ativo',
          dataCadastro: new Date(2025, 0, 15),
          dataUltimoContato: new Date(2025, 3, 10),
          estudosAssociados: ['EST-2025-001'],
          condicoesRelacionadas: ['Ansiedade', 'Insônia'],
          email: 'ana.silva@exemplo.com',
          telefone: '(11) 98765-4321',
          cidade: 'São Paulo',
          estado: 'SP'
        },
        {
          id: 'PAC-2025-002',
          nome: 'Carlos Oliveira',
          idade: 45,
          genero: 'Masculino',
          diagnostico: 'Dor Crônica Neuropática',
          statusPesquisa: 'ativo',
          dataCadastro: new Date(2025, 0, 20),
          dataUltimoContato: new Date(2025, 3, 8),
          estudosAssociados: ['EST-2025-002', 'EST-2024-023'],
          condicoesRelacionadas: ['Lesão Medular', 'Depressão'],
          email: 'carlos.oliveira@exemplo.com',
          telefone: '(21) 98765-1234',
          cidade: 'Rio de Janeiro',
          estado: 'RJ'
        },
        {
          id: 'PAC-2025-003',
          nome: 'Mariana Santos',
          idade: 28,
          genero: 'Feminino',
          diagnostico: 'Ansiedade Severa',
          statusPesquisa: 'ativo',
          dataCadastro: new Date(2025, 1, 5),
          dataUltimoContato: new Date(2025, 3, 12),
          estudosAssociados: ['EST-2025-003'],
          condicoesRelacionadas: ['Insônia', 'Stress Pós-Traumático'],
          email: 'mariana.santos@exemplo.com',
          telefone: '(11) 91234-5678',
          cidade: 'São Paulo',
          estado: 'SP'
        },
        {
          id: 'PAC-2025-004',
          nome: 'Pedro Costa',
          idade: 52,
          genero: 'Masculino',
          diagnostico: 'Esclerose Múltipla',
          statusPesquisa: 'concluido',
          dataCadastro: new Date(2024, 10, 10),
          dataUltimoContato: new Date(2025, 2, 25),
          estudosAssociados: ['EST-2024-015'],
          condicoesRelacionadas: ['Dor Neuropática', 'Fadiga Crônica'],
          email: 'pedro.costa@exemplo.com',
          telefone: '(31) 98888-7777',
          cidade: 'Belo Horizonte',
          estado: 'MG'
        },
        {
          id: 'PAC-2024-125',
          nome: 'Lúcia Ferreira',
          idade: 40,
          genero: 'Feminino',
          diagnostico: 'Fibromialgia',
          statusPesquisa: 'concluido',
          dataCadastro: new Date(2024, 8, 15),
          dataUltimoContato: new Date(2025, 1, 20),
          estudosAssociados: ['EST-2024-023'],
          condicoesRelacionadas: ['Depressão', 'Síndrome do Intestino Irritável'],
          email: 'lucia.ferreira@exemplo.com',
          telefone: '(41) 99999-8888',
          cidade: 'Curitiba',
          estado: 'PR'
        },
        {
          id: 'PAC-2025-005',
          nome: 'Roberto Almeida',
          idade: 61,
          genero: 'Masculino',
          diagnostico: 'Parkinson',
          statusPesquisa: 'ativo',
          dataCadastro: new Date(2025, 1, 25),
          dataUltimoContato: new Date(2025, 3, 5),
          estudosAssociados: ['EST-2025-001'],
          condicoesRelacionadas: ['Rigidez Muscular', 'Tremores'],
          email: 'roberto.almeida@exemplo.com',
          telefone: '(11) 97777-6666',
          cidade: 'Campinas',
          estado: 'SP'
        },
        {
          id: 'PAC-2025-006',
          nome: 'Fernanda Lima',
          idade: 31,
          genero: 'Feminino',
          diagnostico: 'Insônia Crônica',
          statusPesquisa: 'pendente',
          dataCadastro: new Date(2025, 2, 10),
          estudosAssociados: [],
          condicoesRelacionadas: ['Ansiedade', 'Estresse'],
          email: 'fernanda.lima@exemplo.com',
          telefone: '(21) 96666-5555',
          cidade: 'Niterói',
          estado: 'RJ'
        },
        {
          id: 'PAC-2024-098',
          nome: 'José Silva',
          idade: 47,
          genero: 'Masculino',
          diagnostico: 'Dor Crônica Lombar',
          statusPesquisa: 'excluido',
          dataCadastro: new Date(2024, 7, 20),
          dataUltimoContato: new Date(2024, 11, 15),
          estudosAssociados: ['EST-2024-023'],
          condicoesRelacionadas: ['Hérnia de Disco', 'Insônia'],
          email: 'jose.silva@exemplo.com',
          telefone: '(51) 95555-4444',
          cidade: 'Porto Alegre',
          estado: 'RS'
        }
      ]);

      setGrupos([
        {
          nome: 'Epilepsia Refratária',
          descricao: 'Pacientes com epilepsia que não respondem a tratamentos convencionais',
          qtdPacientes: 24,
          diagnosticoPrincipal: 'Epilepsia Refratária',
          estudoAssociado: 'EST-2025-001',
          dataCriacao: new Date(2025, 0, 15)
        },
        {
          nome: 'Dor Neuropática',
          descricao: 'Grupo de pacientes com dor neuropática de diversas etiologias',
          qtdPacientes: 35,
          diagnosticoPrincipal: 'Dor Crônica',
          estudoAssociado: 'EST-2024-023',
          dataCriacao: new Date(2024, 10, 20)
        },
        {
          nome: 'Transtornos de Ansiedade',
          descricao: 'Pacientes com diferentes graus de transtornos de ansiedade',
          qtdPacientes: 28,
          diagnosticoPrincipal: 'Ansiedade',
          estudoAssociado: 'EST-2025-003',
          dataCriacao: new Date(2025, 1, 5)
        },
        {
          nome: 'Distúrbios do Sono',
          descricao: 'Grupo de pacientes com insônia e outros distúrbios do sono',
          qtdPacientes: 19,
          diagnosticoPrincipal: 'Insônia',
          estudoAssociado: 'EST-2025-002',
          dataCriacao: new Date(2025, 1, 10)
        },
        {
          nome: 'Doenças Neurodegenerativas',
          descricao: 'Pacientes com Parkinson, Alzheimer e outras doenças neurodegenerativas',
          qtdPacientes: 15,
          diagnosticoPrincipal: 'Doenças Neurodegenerativas',
          estudoAssociado: 'EST-2025-001',
          dataCriacao: new Date(2025, 2, 1)
        }
      ]);

      setEstatisticas([
        { categoria: 'Epilepsia', quantidade: 24, percentual: 20, cor: '#4CAF50' },
        { categoria: 'Dor Crônica', quantidade: 35, percentual: 29, cor: '#2196F3' },
        { categoria: 'Ansiedade', quantidade: 28, percentual: 23, cor: '#FFC107' },
        { categoria: 'Insônia', quantidade: 19, percentual: 16, cor: '#9C27B0' },
        { categoria: 'Outras', quantidade: 15, percentual: 12, cor: '#607D8B' }
      ]);

      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, JSX.Element> = {
      'ativo': <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Ativo</Badge>,
      'concluido': <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Concluído</Badge>,
      'excluido': <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Excluído</Badge>,
      'pendente': <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pendente</Badge>,
    };
    
    return statusMap[status] || <Badge>Desconhecido</Badge>;
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

  const pacientesFiltrados = pacientes.filter(paciente => {
    // Filtro de busca
    const termoBusca = filtro.toLowerCase();
    const correspondeAoBuscar = 
      paciente.nome.toLowerCase().includes(termoBusca) ||
      paciente.id.toLowerCase().includes(termoBusca) ||
      paciente.diagnostico.toLowerCase().includes(termoBusca) ||
      paciente.cidade?.toLowerCase().includes(termoBusca) ||
      paciente.estado?.toLowerCase().includes(termoBusca);
    
    // Filtro por status
    const correspondeStatus = statusFiltro === 'todos' || paciente.statusPesquisa === statusFiltro;
    
    // Filtro por diagnóstico
    const correspondeDiagnostico = diagnosticoFiltro === 'todos' || 
      paciente.diagnostico.toLowerCase().includes(diagnosticoFiltro.toLowerCase()) ||
      paciente.condicoesRelacionadas.some(c => c.toLowerCase().includes(diagnosticoFiltro.toLowerCase()));
    
    return correspondeAoBuscar && correspondeStatus && correspondeDiagnostico;
  }).sort((a, b) => {
    const campoOrdenacao = ordenacao.campo;
    
    // Tratar campos de data separadamente
    if (campoOrdenacao === 'dataCadastro' || campoOrdenacao === 'dataUltimoContato') {
      const dataA = a[campoOrdenacao as keyof Paciente] as Date | undefined;
      const dataB = b[campoOrdenacao as keyof Paciente] as Date | undefined;
      
      // Se uma das datas for undefined, colocá-la por último
      if (!dataA) return ordenacao.direcao === 'asc' ? 1 : -1;
      if (!dataB) return ordenacao.direcao === 'asc' ? -1 : 1;
      
      return ordenacao.direcao === 'asc' 
        ? dataA.getTime() - dataB.getTime() 
        : dataB.getTime() - dataA.getTime();
    }
    
    // Para outros campos (string, number), comparar normalmente
    const valorA = String(a[campoOrdenacao as keyof Paciente] || '');
    const valorB = String(b[campoOrdenacao as keyof Paciente] || '');
    
    return ordenacao.direcao === 'asc'
      ? valorA.localeCompare(valorB)
      : valorB.localeCompare(valorA);
  });

  const diagnosticos = Array.from(
    new Set([
      ...pacientes.map(p => p.diagnostico),
      ...pacientes.flatMap(p => p.condicoesRelacionadas)
    ])
  ).sort();

  return (
    <ResearcherLayout>
      <div className="container p-4 mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Banco de Pacientes</h1>
              <p className="text-gray-500 mt-1">Gerenciamento de pacientes para estudos e pesquisas</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => toast({ title: "Exportando dados", description: "Os dados serão exportados em CSV" })}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Dados
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => toast({ title: "Novo paciente", description: "Formulário para cadastro de paciente em desenvolvimento" })}>
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Paciente
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Lista de Pacientes</CardTitle>
                  <CardDescription>
                    Pacientes cadastrados em pesquisas clínicas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
                    <div className="relative max-w-md">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input 
                        placeholder="Buscar pacientes..." 
                        className="pl-10" 
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2">
                        <select 
                          value={statusFiltro}
                          onChange={(e) => setStatusFiltro(e.target.value)}
                          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="todos">Todos os status</option>
                          <option value="ativo">Ativos</option>
                          <option value="concluido">Concluídos</option>
                          <option value="pendente">Pendentes</option>
                          <option value="excluido">Excluídos</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <select 
                          value={diagnosticoFiltro}
                          onChange={(e) => setDiagnosticoFiltro(e.target.value)}
                          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="todos">Todos os diagnósticos</option>
                          {diagnosticos.map(diagnostico => (
                            <option key={diagnostico} value={diagnostico.toLowerCase()}>
                              {diagnostico}
                            </option>
                          ))}
                        </select>
                      </div>
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
                  ) : pacientesFiltrados.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead 
                              className="cursor-pointer hover:bg-muted"
                              onClick={() => handleOrdenacao('nome')}
                            >
                              <div className="flex items-center">
                                Paciente
                                {ordenacao.campo === 'nome' && (
                                  <ArrowUpDown className={`ml-1 h-3 w-3 ${ordenacao.direcao === 'desc' ? 'transform rotate-180' : ''}`} />
                                )}
                              </div>
                            </TableHead>
                            <TableHead 
                              className="cursor-pointer hover:bg-muted"
                              onClick={() => handleOrdenacao('diagnostico')}
                            >
                              <div className="flex items-center">
                                Diagnóstico
                                {ordenacao.campo === 'diagnostico' && (
                                  <ArrowUpDown className={`ml-1 h-3 w-3 ${ordenacao.direcao === 'desc' ? 'transform rotate-180' : ''}`} />
                                )}
                              </div>
                            </TableHead>
                            <TableHead 
                              className="cursor-pointer hover:bg-muted"
                              onClick={() => handleOrdenacao('dataCadastro')}
                            >
                              <div className="flex items-center">
                                Data 
                                {ordenacao.campo === 'dataCadastro' && (
                                  <ArrowUpDown className={`ml-1 h-3 w-3 ${ordenacao.direcao === 'desc' ? 'transform rotate-180' : ''}`} />
                                )}
                              </div>
                            </TableHead>
                            <TableHead 
                              className="cursor-pointer hover:bg-muted"
                              onClick={() => handleOrdenacao('statusPesquisa')}
                            >
                              <div className="flex items-center">
                                Status
                                {ordenacao.campo === 'statusPesquisa' && (
                                  <ArrowUpDown className={`ml-1 h-3 w-3 ${ordenacao.direcao === 'desc' ? 'transform rotate-180' : ''}`} />
                                )}
                              </div>
                            </TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pacientesFiltrados.map((paciente) => (
                            <TableRow 
                              key={paciente.id}
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => setLocation(`/researcher/pacientes/${paciente.id}`)}
                            >
                              <TableCell>
                                <div>
                                  <p className="font-medium">{paciente.nome}</p>
                                  <div className="flex items-center text-xs text-gray-500">
                                    <p>{paciente.id}</p>
                                    <span className="mx-1">•</span>
                                    <p>{paciente.idade} anos</p>
                                    <span className="mx-1">•</span>
                                    <p>{paciente.genero}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p>{paciente.diagnostico}</p>
                                  {paciente.condicoesRelacionadas.length > 0 && (
                                    <p className="text-xs text-gray-500">
                                      {paciente.condicoesRelacionadas.slice(0, 2).join(', ')}
                                      {paciente.condicoesRelacionadas.length > 2 && ' +'}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="flex items-center text-xs">
                                    <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                                    {formatarData(paciente.dataCadastro)}
                                  </div>
                                  {paciente.dataUltimoContato && (
                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                      <Clock className="h-3 w-3 text-gray-400 mr-1" />
                                      Último contato: {formatarData(paciente.dataUltimoContato)}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{getStatusBadge(paciente.statusPesquisa)}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                      <ChevronRight className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      setLocation(`/researcher/pacientes/${paciente.id}`);
                                    }}>
                                      <User className="h-4 w-4 mr-2" />
                                      Ver perfil
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      toast({ title: "Histórico", description: `Visualizando histórico de ${paciente.nome}` });
                                    }}>
                                      <ClipboardList className="h-4 w-4 mr-2" />
                                      Histórico
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      toast({ title: "Enviar mensagem", description: `Enviando mensagem para ${paciente.nome}` });
                                    }}>
                                      <Mail className="h-4 w-4 mr-2" />
                                      Enviar mensagem
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
                      <UserCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-gray-700 font-medium mb-1">Nenhum paciente encontrado</h3>
                      <p className="text-gray-500 text-sm mb-4">
                        Não foram encontrados pacientes com os critérios selecionados
                      </p>
                      <Button 
                        onClick={() => {
                          setFiltro('');
                          setStatusFiltro('todos');
                          setDiagnosticoFiltro('todos');
                        }}
                      >
                        Limpar filtros
                      </Button>
                    </div>
                  )}
                </CardContent>
                {!isLoading && pacientesFiltrados.length > 0 && (
                  <CardFooter className="pt-0 flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      Mostrando {pacientesFiltrados.length} de {pacientes.length} pacientes
                    </p>
                    <Button variant="outline" size="sm" onClick={() => toast({ title: "Carregando mais", description: "Carregando mais resultados..." })}>
                      Ver mais pacientes
                    </Button>
                  </CardFooter>
                )}
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Grupos de Pacientes</CardTitle>
                  <CardDescription>
                    Agrupamentos de pacientes por condições ou estudos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="border rounded-lg p-4 animate-pulse">
                          <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                          <div className="flex justify-between">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : grupos.length > 0 ? (
                    <div className="space-y-4">
                      {grupos.map((grupo) => (
                        <div 
                          key={grupo.nome} 
                          className="border rounded-md p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => setLocation(`/researcher/pacientes/grupos/${encodeURIComponent(grupo.nome)}`)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium text-lg">{grupo.nome}</h3>
                              <p className="text-sm text-gray-600">{grupo.descricao}</p>
                            </div>
                            <Badge>{grupo.qtdPacientes} pacientes</Badge>
                          </div>
                          
                          <div className="flex flex-wrap justify-between text-sm text-gray-500 pt-2">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                <span>{grupo.diagnosticoPrincipal}</span>
                              </div>
                              {grupo.estudoAssociado && (
                                <>
                                  <span>•</span>
                                  <div className="flex items-center">
                                    <FileText className="h-4 w-4 mr-1" />
                                    <span>{grupo.estudoAssociado}</span>
                                  </div>
                                </>
                              )}
                            </div>
                            
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>Criado em {formatarData(grupo.dataCriacao)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex justify-center mt-4">
                        <Button 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => toast({ title: "Novo grupo", description: "Funcionalidade em desenvolvimento" })}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Criar novo grupo
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-gray-700 font-medium mb-1">Nenhum grupo criado</h3>
                      <p className="text-gray-500 text-sm mb-4">
                        Você ainda não criou grupos de pacientes para suas pesquisas
                      </p>
                      <Button 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => toast({ title: "Novo grupo", description: "Funcionalidade em desenvolvimento" })}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Criar primeiro grupo
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Estatísticas</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="space-y-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium text-sm mb-2">Distribuição por diagnóstico principal</p>
                        <div className="space-y-2">
                          {estatisticas.map((estatistica) => (
                            <div key={estatistica.categoria}>
                              <div className="flex justify-between text-xs mb-1">
                                <span>{estatistica.categoria}</span>
                                <span>{estatistica.quantidade} ({estatistica.percentual}%)</span>
                              </div>
                              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full" 
                                  style={{ 
                                    width: `${estatistica.percentual}%`,
                                    backgroundColor: estatistica.cor
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <p className="font-medium text-sm mb-3">Sumário de pacientes</p>
                        <div className="grid grid-cols-2 gap-3">
                          <Card className="p-3">
                            <div className="flex flex-col items-center">
                              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-50 text-green-700 mb-1">
                                <CheckCircle2 className="h-5 w-5" />
                              </div>
                              <p className="text-lg font-bold">{pacientes.filter(p => p.statusPesquisa === 'ativo').length}</p>
                              <p className="text-xs text-gray-500">Ativos</p>
                            </div>
                          </Card>
                          
                          <Card className="p-3">
                            <div className="flex flex-col items-center">
                              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-50 text-blue-700 mb-1">
                                <Check className="h-5 w-5" />
                              </div>
                              <p className="text-lg font-bold">{pacientes.filter(p => p.statusPesquisa === 'concluido').length}</p>
                              <p className="text-xs text-gray-500">Concluídos</p>
                            </div>
                          </Card>
                          
                          <Card className="p-3">
                            <div className="flex flex-col items-center">
                              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-50 text-amber-700 mb-1">
                                <CircleHelp className="h-5 w-5" />
                              </div>
                              <p className="text-lg font-bold">{pacientes.filter(p => p.statusPesquisa === 'pendente').length}</p>
                              <p className="text-xs text-gray-500">Pendentes</p>
                            </div>
                          </Card>
                          
                          <Card className="p-3">
                            <div className="flex flex-col items-center">
                              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-red-50 text-red-700 mb-1">
                                <XCircle className="h-5 w-5" />
                              </div>
                              <p className="text-lg font-bold">{pacientes.filter(p => p.statusPesquisa === 'excluido').length}</p>
                              <p className="text-xs text-gray-500">Excluídos</p>
                            </div>
                          </Card>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Estudos relacionados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border rounded-md p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-blue-500 mr-2" />
                        <div>
                          <p className="font-medium text-sm">EST-2025-001</p>
                          <p className="text-xs text-gray-500">Epilepsia Refratária</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Ativo</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between border rounded-md p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-blue-500 mr-2" />
                        <div>
                          <p className="font-medium text-sm">EST-2025-002</p>
                          <p className="text-xs text-gray-500">Canabinoides e Sono</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Ativo</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between border rounded-md p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-blue-500 mr-2" />
                        <div>
                          <p className="font-medium text-sm">EST-2024-023</p>
                          <p className="text-xs text-gray-500">THC/CBD em Dor Crônica</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Concluído</Badge>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => setLocation('/researcher/catalogo')}>
                    Ver todos os estudos
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Ferramentas de análise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="border rounded-md p-3 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => toast({ title: "Análise demográfica", description: "Ferramenta em desenvolvimento" })}>
                      <div className="flex items-center">
                        <BarChart2 className="h-4 w-4 text-purple-500 mr-2" />
                        <p className="font-medium text-sm">Análise Demográfica</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Perfil demográfico dos pacientes</p>
                    </div>
                    
                    <div className="border rounded-md p-3 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => toast({ title: "Relatórios cruzados", description: "Ferramenta em desenvolvimento" })}>
                      <div className="flex items-center">
                        <FileBarChart className="h-4 w-4 text-green-500 mr-2" />
                        <p className="font-medium text-sm">Relatórios Cruzados</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Análise de dados relacionando múltiplas variáveis</p>
                    </div>
                    
                    <div className="border rounded-md p-3 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => toast({ title: "Exportar dados", description: "Ferramenta em desenvolvimento" })}>
                      <div className="flex items-center">
                        <FileSpreadsheet className="h-4 w-4 text-amber-500 mr-2" />
                        <p className="font-medium text-sm">Exportar Tabelas</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Gerar planilhas avançadas para análise</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Lembretes e tarefas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="border rounded-md p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">Contatar 3 pacientes pendentes</p>
                          <p className="text-xs text-gray-500 mt-1">Estudo Epilepsia Refratária</p>
                        </div>
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Hoje</Badge>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">Entrevistar novos candidatos</p>
                          <p className="text-xs text-gray-500 mt-1">Grupo Dor Neuropática</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">3 dias</Badge>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">Atualizar dados demográficos</p>
                          <p className="text-xs text-gray-500 mt-1">Todos os estudos ativos</p>
                        </div>
                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">1 semana</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => toast({ title: "Gerenciar lembretes", description: "Funcionalidade em desenvolvimento" })}>
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Ver todos os lembretes
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ResearcherLayout>
  );
}