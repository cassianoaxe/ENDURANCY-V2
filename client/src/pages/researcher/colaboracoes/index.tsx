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
  UserPlus,
  Users,
  Building,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  GraduationCap,
  FileText,
  MoreVertical,
  Share2,
  Briefcase,
  RefreshCw
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

interface Colaborador {
  id: string;
  nome: string;
  email: string;
  instituicao: string;
  cargo: string;
  especialidade: string;
  estudosCompartilhados: number;
  publicacoesCompartilhadas: number;
  status: 'ativo' | 'pendente' | 'inativo';
  avatar?: string;
  dataUltimaAtividade?: Date;
}

interface Instituicao {
  id: string;
  nome: string;
  tipo: string;
  cidade: string;
  estado: string;
  pais: string;
  colaboradores: number;
  estudosCompartilhados: number;
  status: 'ativa' | 'pendente' | 'inativa';
  logo?: string;
}

export default function Colaboracoes() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [filtro, setFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [abaSelecionada, setAbaSelecionada] = useState('colaboradores');

  useEffect(() => {
    // Simulação de carregamento para demonstração
    const timer = setTimeout(() => {
      // Dados de exemplo para demonstração
      setColaboradores([
        {
          id: 'COL-001',
          nome: 'Dra. Ana Ribeiro',
          email: 'ana.ribeiro@usp.br',
          instituicao: 'Universidade de São Paulo',
          cargo: 'Pesquisadora Sênior',
          especialidade: 'Neurologia',
          estudosCompartilhados: 3,
          publicacoesCompartilhadas: 2,
          status: 'ativo',
          avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
          dataUltimaAtividade: new Date(2025, 3, 15)
        },
        {
          id: 'COL-002',
          nome: 'Dr. Carlos Mendes',
          email: 'carlos.mendes@neurociencias.org',
          instituicao: 'Instituto de Neurociências',
          cargo: 'Neurocientista',
          especialidade: 'Farmacologia',
          estudosCompartilhados: 2,
          publicacoesCompartilhadas: 1,
          status: 'ativo',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          dataUltimaAtividade: new Date(2025, 3, 12)
        },
        {
          id: 'COL-003',
          nome: 'Dra. Luciana Costa',
          email: 'luciana.costa@einstein.br',
          instituicao: 'Hospital Albert Einstein',
          cargo: 'Médica Especialista',
          especialidade: 'Dor Crônica',
          estudosCompartilhados: 1,
          publicacoesCompartilhadas: 3,
          status: 'ativo',
          avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
          dataUltimaAtividade: new Date(2025, 3, 10)
        },
        {
          id: 'COL-004',
          nome: 'Prof. Roberto Oliveira',
          email: 'roberto.oliveira@unifesp.edu.br',
          instituicao: 'UNIFESP',
          cargo: 'Professor',
          especialidade: 'Oncologia',
          estudosCompartilhados: 0,
          publicacoesCompartilhadas: 1,
          status: 'pendente',
          avatar: 'https://randomuser.me/api/portraits/men/76.jpg'
        },
        {
          id: 'COL-005',
          nome: 'Dr. André Santos',
          email: 'andre.santos@usp.br',
          instituicao: 'USP-Ribeirão Preto',
          cargo: 'Pesquisador',
          especialidade: 'Neurociências',
          estudosCompartilhados: 2,
          publicacoesCompartilhadas: 0,
          status: 'ativo',
          avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
          dataUltimaAtividade: new Date(2025, 3, 5)
        },
        {
          id: 'COL-006',
          nome: 'Dra. Maria Silva',
          email: 'maria.silva@ufrj.br',
          instituicao: 'UFRJ',
          cargo: 'Professora Associada',
          especialidade: 'Psiquiatria',
          estudosCompartilhados: 1,
          publicacoesCompartilhadas: 1,
          status: 'inativo',
          avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
          dataUltimaAtividade: new Date(2025, 2, 20)
        }
      ]);

      setInstituicoes([
        {
          id: 'INST-001',
          nome: 'Universidade de São Paulo',
          tipo: 'Universidade',
          cidade: 'São Paulo',
          estado: 'SP',
          pais: 'Brasil',
          colaboradores: 2,
          estudosCompartilhados: 4,
          status: 'ativa',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/USP_signature.svg/320px-USP_signature.svg.png'
        },
        {
          id: 'INST-002',
          nome: 'Hospital Albert Einstein',
          tipo: 'Hospital',
          cidade: 'São Paulo',
          estado: 'SP',
          pais: 'Brasil',
          colaboradores: 1,
          estudosCompartilhados: 1,
          status: 'ativa',
          logo: 'https://upload.wikimedia.org/wikipedia/pt/4/40/Logo_HIAE.JPG'
        },
        {
          id: 'INST-003',
          nome: 'UNIFESP',
          tipo: 'Universidade',
          cidade: 'São Paulo',
          estado: 'SP',
          pais: 'Brasil',
          colaboradores: 1,
          estudosCompartilhados: 0,
          status: 'pendente'
        },
        {
          id: 'INST-004',
          nome: 'Instituto de Neurociências',
          tipo: 'Instituto de Pesquisa',
          cidade: 'São Paulo',
          estado: 'SP',
          pais: 'Brasil',
          colaboradores: 1,
          estudosCompartilhados: 2,
          status: 'ativa'
        },
        {
          id: 'INST-005',
          nome: 'UFRJ',
          tipo: 'Universidade',
          cidade: 'Rio de Janeiro',
          estado: 'RJ',
          pais: 'Brasil',
          colaboradores: 1,
          estudosCompartilhados: 1,
          status: 'inativa'
        }
      ]);

      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, JSX.Element> = {
      'ativo': <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Ativo</Badge>,
      'pendente': <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pendente</Badge>,
      'inativo': <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Inativo</Badge>,
    };
    
    return statusMap[status] || <Badge>Desconhecido</Badge>;
  };

  const getInstituicaoStatusBadge = (status: string) => {
    const statusMap: Record<string, JSX.Element> = {
      'ativa': <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Ativa</Badge>,
      'pendente': <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pendente</Badge>,
      'inativa': <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Inativa</Badge>,
    };
    
    return statusMap[status] || <Badge>Desconhecido</Badge>;
  };

  const formatarData = (data: Date | undefined) => {
    if (!data) return 'N/A';
    return data.toLocaleDateString('pt-BR');
  };

  const colaboradoresFiltrados = colaboradores.filter(colaborador => {
    // Filtro de busca
    const termoBusca = filtro.toLowerCase();
    const correspondeAoBuscar = 
      colaborador.nome.toLowerCase().includes(termoBusca) ||
      colaborador.email.toLowerCase().includes(termoBusca) ||
      colaborador.instituicao.toLowerCase().includes(termoBusca) ||
      colaborador.especialidade.toLowerCase().includes(termoBusca);
    
    // Filtro por status
    const correspondeStatus = statusFiltro === 'todos' || colaborador.status === statusFiltro;
    
    return correspondeAoBuscar && correspondeStatus;
  });

  const instituicoesFiltradas = instituicoes.filter(instituicao => {
    // Filtro de busca
    const termoBusca = filtro.toLowerCase();
    const correspondeAoBuscar = 
      instituicao.nome.toLowerCase().includes(termoBusca) ||
      instituicao.tipo.toLowerCase().includes(termoBusca) ||
      instituicao.cidade.toLowerCase().includes(termoBusca) ||
      instituicao.estado.toLowerCase().includes(termoBusca);
    
    // Filtro por status
    const correspondeStatus = statusFiltro === 'todos' || instituicao.status === statusFiltro;
    
    return correspondeAoBuscar && correspondeStatus;
  });

  return (
    <ResearcherLayout>
      <div className="container p-4 mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Colaborações</h1>
              <p className="text-gray-500 mt-1">Gerenciamento de colaboradores e instituições parceiras</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => toast({ title: "Atualizando conexões", description: "Buscando novas conexões..." })}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => toast({ title: "Enviar convite", description: "Interface de convite será aberta" })}>
                <UserPlus className="h-4 w-4 mr-2" />
                Convidar Colaborador
              </Button>
            </div>
          </div>
          
          <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada} className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="colaboradores" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                <Users className="h-4 w-4 mr-2" />
                Colaboradores
              </TabsTrigger>
              <TabsTrigger value="instituicoes" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                <Building className="h-4 w-4 mr-2" />
                Instituições
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="colaboradores">
              <div className="flex flex-col gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Colaboradores</CardTitle>
                    <CardDescription>
                      Pesquisadores e profissionais com colaborações ativas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
                      <div className="relative max-w-md">
                        <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                        <Input 
                          placeholder="Buscar colaboradores..." 
                          className="pl-10" 
                          value={filtro}
                          onChange={(e) => setFiltro(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <select 
                          value={statusFiltro}
                          onChange={(e) => setStatusFiltro(e.target.value)}
                          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="todos">Todos os status</option>
                          <option value="ativo">Ativos</option>
                          <option value="pendente">Pendentes</option>
                          <option value="inativo">Inativos</option>
                        </select>
                      </div>
                    </div>
                    
                    {isLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="border rounded-lg p-4 animate-pulse">
                            <div className="flex gap-3">
                              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                              <div className="flex-1">
                                <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3 mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : colaboradoresFiltrados.length > 0 ? (
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="w-[300px]">Colaborador</TableHead>
                              <TableHead>Especialidade</TableHead>
                              <TableHead>Instituição</TableHead>
                              <TableHead>Estudos</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {colaboradoresFiltrados.map((colaborador) => (
                              <TableRow key={colaborador.id}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                      {colaborador.avatar ? (
                                        <img src={colaborador.avatar} alt={colaborador.nome} className="h-full w-full object-cover" />
                                      ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-green-100 text-green-700">
                                          {colaborador.nome.charAt(0)}
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-medium">{colaborador.nome}</p>
                                      <div className="flex items-center text-xs text-gray-500">
                                        <Mail className="h-3 w-3 mr-1" />
                                        <span>{colaborador.email}</span>
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <GraduationCap className="h-4 w-4 text-gray-400 mr-1" />
                                    <div>
                                      <p>{colaborador.especialidade}</p>
                                      <p className="text-xs text-gray-500">{colaborador.cargo}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Building className="h-4 w-4 text-gray-400 mr-1" />
                                    <span>{colaborador.instituicao}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">{colaborador.estudosCompartilhados} estudos</Badge>
                                    <Badge variant="outline">{colaborador.publicacoesCompartilhadas} publicações</Badge>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(colaborador.status)}
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                      <DropdownMenuItem onClick={() => toast({ 
                                        title: "Perfil", 
                                        description: `Visualizando perfil de ${colaborador.nome}` 
                                      })}>
                                        <Users className="h-4 w-4 mr-2" />
                                        Ver perfil
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => toast({ 
                                        title: "Mensagem", 
                                        description: `Enviando mensagem para ${colaborador.nome}` 
                                      })}>
                                        <Mail className="h-4 w-4 mr-2" />
                                        Enviar mensagem
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => toast({ 
                                        title: "Compartilhar estudo", 
                                        description: `Compartilhando estudo com ${colaborador.nome}` 
                                      })}>
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Compartilhar estudo
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
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-gray-700 font-medium mb-1">Nenhum colaborador encontrado</h3>
                        <p className="text-gray-500 text-sm mb-4">
                          Não foram encontrados colaboradores com os critérios selecionados
                        </p>
                        <Button 
                          onClick={() => {
                            setFiltro('');
                            setStatusFiltro('todos');
                          }}
                        >
                          Limpar filtros
                        </Button>
                      </div>
                    )}
                  </CardContent>
                  {!isLoading && colaboradoresFiltrados.length > 0 && (
                    <CardFooter className="pt-0 flex justify-between items-center">
                      <p className="text-sm text-gray-500">
                        Mostrando {colaboradoresFiltrados.length} de {colaboradores.length} colaboradores
                      </p>
                      <Button variant="outline" size="sm" onClick={() => toast({ title: "Convite", description: "Convidando novo colaborador..." })}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Convidar novo
                      </Button>
                    </CardFooter>
                  )}
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Convites Pendentes</CardTitle>
                    <CardDescription>
                      Pesquisadores convidados aguardando resposta
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-3">
                        {[1, 2].map((i) => (
                          <div key={i} className="border rounded-lg p-4 animate-pulse">
                            <div className="flex justify-between">
                              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                              <div className="h-5 bg-gray-200 rounded w-1/6"></div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        ))}
                      </div>
                    ) : colaboradores.filter(c => c.status === 'pendente').length > 0 ? (
                      <div className="space-y-3">
                        {colaboradores.filter(c => c.status === 'pendente').map((colaborador) => (
                          <div key={colaborador.id} className="border rounded-md p-3 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                {colaborador.avatar ? (
                                  <img src={colaborador.avatar} alt={colaborador.nome} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-amber-100 text-amber-700">
                                    {colaborador.nome.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{colaborador.nome}</p>
                                <div className="flex items-center text-xs text-gray-500">
                                  <Building className="h-3 w-3 mr-1" />
                                  <span>{colaborador.instituicao}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" className="h-8 w-8" onClick={() => toast({ 
                                title: "Lembrete enviado", 
                                description: `Lembrete enviado para ${colaborador.nome}` 
                              })}>
                                <Clock className="h-4 w-4 text-amber-600" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 w-8" onClick={() => toast({ 
                                title: "Convite cancelado", 
                                description: `Convite para ${colaborador.nome} foi cancelado` 
                              })}>
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <CheckCircle2 className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                        <p className="text-gray-500 font-medium">Nenhum convite pendente</p>
                        <p className="text-xs text-gray-400 mt-1">Todos os convites foram respondidos</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="instituicoes">
              <div className="flex flex-col gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Instituições Parceiras</CardTitle>
                    <CardDescription>
                      Universidades, hospitais e centros de pesquisa colaboradores
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
                      <div className="relative max-w-md">
                        <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                        <Input 
                          placeholder="Buscar instituições..." 
                          className="pl-10" 
                          value={filtro}
                          onChange={(e) => setFiltro(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <select 
                          value={statusFiltro}
                          onChange={(e) => setStatusFiltro(e.target.value)}
                          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="todos">Todos os status</option>
                          <option value="ativa">Ativas</option>
                          <option value="pendente">Pendentes</option>
                          <option value="inativa">Inativas</option>
                        </select>
                      </div>
                    </div>
                    
                    {isLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="border rounded-lg p-4 animate-pulse">
                            <div className="flex gap-3">
                              <div className="h-12 w-12 bg-gray-200 rounded"></div>
                              <div className="flex-1">
                                <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3 mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : instituicoesFiltradas.length > 0 ? (
                      <div className="space-y-4">
                        {instituicoesFiltradas.map((instituicao) => (
                          <div key={instituicao.id} className="border rounded-md p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                                  {instituicao.logo ? (
                                    <img src={instituicao.logo} alt={instituicao.nome} className="w-full h-full object-contain" />
                                  ) : (
                                    <Building className="h-6 w-6 text-gray-400" />
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-medium text-lg">{instituicao.nome}</h3>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Briefcase className="h-3.5 w-3.5 mr-1" />
                                    <span>{instituicao.tipo}</span>
                                    <span className="mx-2">•</span>
                                    <span>{instituicao.cidade}, {instituicao.estado}</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                {getInstituicaoStatusBadge(instituicao.status)}
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-6 mt-4 text-sm">
                              <div>
                                <p className="text-gray-500">Colaboradores</p>
                                <p className="font-medium">{instituicao.colaboradores}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Estudos compartilhados</p>
                                <p className="font-medium">{instituicao.estudosCompartilhados}</p>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                              <Button variant="outline" size="sm" onClick={(e) => {
                                e.stopPropagation();
                                toast({ 
                                  title: "Detalhes", 
                                  description: `Visualizando detalhes de ${instituicao.nome}` 
                                });
                              }}>
                                <Building className="h-4 w-4 mr-2" />
                                Ver detalhes
                              </Button>
                              
                              <Button variant="outline" size="sm" onClick={(e) => {
                                e.stopPropagation();
                                toast({ 
                                  title: "Colaboradores", 
                                  description: `Visualizando colaboradores de ${instituicao.nome}` 
                                });
                              }}>
                                <Users className="h-4 w-4 mr-2" />
                                Ver colaboradores
                              </Button>
                              
                              <Button variant="outline" size="sm" onClick={(e) => {
                                e.stopPropagation();
                                toast({ 
                                  title: "Estudos", 
                                  description: `Visualizando estudos de ${instituicao.nome}` 
                                });
                              }}>
                                <FileText className="h-4 w-4 mr-2" />
                                Ver estudos
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Building className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-gray-700 font-medium mb-1">Nenhuma instituição encontrada</h3>
                        <p className="text-gray-500 text-sm mb-4">
                          Não foram encontradas instituições com os critérios selecionados
                        </p>
                        <Button 
                          onClick={() => {
                            setFiltro('');
                            setStatusFiltro('todos');
                          }}
                        >
                          Limpar filtros
                        </Button>
                      </div>
                    )}
                  </CardContent>
                  {!isLoading && instituicoesFiltradas.length > 0 && (
                    <CardFooter className="pt-0 flex justify-between items-center">
                      <p className="text-sm text-gray-500">
                        Mostrando {instituicoesFiltradas.length} de {instituicoes.length} instituições
                      </p>
                      <Button variant="outline" size="sm" onClick={() => toast({ title: "Nova instituição", description: "Adicionando nova instituição..." })}>
                        <Building className="h-4 w-4 mr-2" />
                        Adicionar instituição
                      </Button>
                    </CardFooter>
                  )}
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Estatísticas de Colaboração</CardTitle>
                    <CardDescription>
                      Dados sobre suas colaborações institucionais
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-4">
                        <div className="flex flex-col items-center text-center">
                          <div className="flex items-center justify-center rounded-full w-12 h-12 bg-blue-50 text-blue-700 mb-2">
                            <Building className="h-6 w-6" />
                          </div>
                          <p className="text-3xl font-bold">{instituicoes.filter(i => i.status === 'ativa').length}</p>
                          <p className="text-sm text-gray-500">Instituições Ativas</p>
                        </div>
                      </Card>
                      
                      <Card className="p-4">
                        <div className="flex flex-col items-center text-center">
                          <div className="flex items-center justify-center rounded-full w-12 h-12 bg-green-50 text-green-700 mb-2">
                            <Users className="h-6 w-6" />
                          </div>
                          <p className="text-3xl font-bold">{colaboradores.filter(c => c.status === 'ativo').length}</p>
                          <p className="text-sm text-gray-500">Colaboradores Ativos</p>
                        </div>
                      </Card>
                      
                      <Card className="p-4">
                        <div className="flex flex-col items-center text-center">
                          <div className="flex items-center justify-center rounded-full w-12 h-12 bg-purple-50 text-purple-700 mb-2">
                            <FileText className="h-6 w-6" />
                          </div>
                          <p className="text-3xl font-bold">{instituicoes.reduce((acc, i) => acc + i.estudosCompartilhados, 0)}</p>
                          <p className="text-sm text-gray-500">Estudos Compartilhados</p>
                        </div>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ResearcherLayout>
  );
}