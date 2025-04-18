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
  Plus,
  BookOpen,
  Clock,
  Users,
  ListFilter,
  FileText,
  Database,
  BarChart,
  ChevronRight,
  PlusCircle,
  LinkIcon,
  Download,
  Microscope,
  Heart,
  Brain,
  HeartPulse,
  Activity
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';

interface Doenca {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  gravidade: 'leve' | 'moderada' | 'grave' | 'terminal';
  estudosRelacionados: number;
  pacientesRegistrados: number;
  ultimaAtualizacao: Date;
  iconeTipo?: 'cerebral' | 'cardiaco' | 'pulmonar' | 'outro';
}

interface PesquisadorEnvolvido {
  id: string;
  nome: string;
  instituicao: string;
  cargo: string;
  avatar?: string;
  estudos: number;
}

export default function DoencasCondicoes() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [doencas, setDoencas] = useState<Doenca[]>([]);
  const [pesquisadores, setPesquisadores] = useState<PesquisadorEnvolvido[]>([]);
  const [filtro, setFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');

  useEffect(() => {
    // Simulação de carregamento para demonstração
    const timer = setTimeout(() => {
      // Dados de exemplo para demonstração
      setDoencas([
        {
          id: 'DOE-001',
          nome: 'Epilepsia Refratária',
          descricao: 'Condição neurológica caracterizada por convulsões recorrentes que não respondem adequadamente aos tratamentos convencionais.',
          categoria: 'Neurológica',
          gravidade: 'moderada',
          estudosRelacionados: 8,
          pacientesRegistrados: 124,
          ultimaAtualizacao: new Date(2025, 3, 15),
          iconeTipo: 'cerebral'
        },
        {
          id: 'DOE-002',
          nome: 'Dor Crônica Neuropática',
          descricao: 'Dor persistente causada por lesão ou disfunção do sistema nervoso, frequentemente resistente a analgésicos convencionais.',
          categoria: 'Dor',
          gravidade: 'moderada',
          estudosRelacionados: 12,
          pacientesRegistrados: 203,
          ultimaAtualizacao: new Date(2025, 3, 10)
        },
        {
          id: 'DOE-003',
          nome: 'Esclerose Múltipla',
          descricao: 'Doença autoimune que afeta o sistema nervoso central, causando inflamação e degeneração da mielina.',
          categoria: 'Autoimune',
          gravidade: 'grave',
          estudosRelacionados: 15,
          pacientesRegistrados: 187,
          ultimaAtualizacao: new Date(2025, 3, 12),
          iconeTipo: 'cerebral'
        },
        {
          id: 'DOE-004',
          nome: 'Doença de Parkinson',
          descricao: 'Distúrbio neurodegenerativo progressivo que afeta o movimento, causando tremores, rigidez e dificuldades motoras.',
          categoria: 'Neurológica',
          gravidade: 'grave',
          estudosRelacionados: 10,
          pacientesRegistrados: 156,
          ultimaAtualizacao: new Date(2025, 3, 5),
          iconeTipo: 'cerebral'
        },
        {
          id: 'DOE-005',
          nome: 'Ansiedade Severa',
          descricao: 'Transtorno de ansiedade caracterizado por preocupação excessiva, tensão muscular e sintomas físicos que afetam significativamente a qualidade de vida.',
          categoria: 'Psiquiátrica',
          gravidade: 'moderada',
          estudosRelacionados: 6,
          pacientesRegistrados: 245,
          ultimaAtualizacao: new Date(2025, 3, 8),
          iconeTipo: 'cerebral'
        },
        {
          id: 'DOE-006',
          nome: 'Fibromialgia',
          descricao: 'Síndrome caracterizada por dor musculoesquelética generalizada, fadiga, distúrbios do sono e problemas cognitivos.',
          categoria: 'Dor',
          gravidade: 'moderada',
          estudosRelacionados: 9,
          pacientesRegistrados: 178,
          ultimaAtualizacao: new Date(2025, 3, 7)
        },
        {
          id: 'DOE-007',
          nome: 'Insônia Crônica',
          descricao: 'Distúrbio persistente do sono caracterizado por dificuldade em iniciar ou manter o sono, com impacto significativo no funcionamento diurno.',
          categoria: 'Sono',
          gravidade: 'leve',
          estudosRelacionados: 5,
          pacientesRegistrados: 312,
          ultimaAtualizacao: new Date(2025, 3, 3)
        },
        {
          id: 'DOE-008',
          nome: 'Síndrome do Intestino Irritável',
          descricao: 'Distúrbio funcional do trato gastrointestinal caracterizado por dor abdominal recorrente, alterações nos hábitos intestinais e desconforto.',
          categoria: 'Gastrointestinal',
          gravidade: 'leve',
          estudosRelacionados: 4,
          pacientesRegistrados: 197,
          ultimaAtualizacao: new Date(2025, 3, 2)
        }
      ]);

      setPesquisadores([
        {
          id: 'PESQ-001',
          nome: 'Dra. Ana Ribeiro',
          instituicao: 'Universidade de São Paulo',
          cargo: 'Neurologista Pesquisadora',
          estudos: 12,
          avatar: 'https://randomuser.me/api/portraits/women/45.jpg'
        },
        {
          id: 'PESQ-002',
          nome: 'Dr. Carlos Mendes',
          instituicao: 'Instituto de Neurociências',
          cargo: 'Neurocientista',
          estudos: 8,
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
        },
        {
          id: 'PESQ-003',
          nome: 'Dra. Luciana Costa',
          instituicao: 'Hospital Albert Einstein',
          cargo: 'Especialista em Dor',
          estudos: 15,
          avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
        },
        {
          id: 'PESQ-004',
          nome: 'Dr. Marcelo Souza',
          instituicao: 'UNIFESP',
          cargo: 'Psiquiatra Pesquisador',
          estudos: 9,
          avatar: 'https://randomuser.me/api/portraits/men/55.jpg'
        }
      ]);

      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const getGravidadeBadge = (gravidade: string) => {
    const gravidadeMap: Record<string, JSX.Element> = {
      'leve': <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Leve</Badge>,
      'moderada': <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Moderada</Badge>,
      'grave': <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Grave</Badge>,
      'terminal': <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Terminal</Badge>,
    };
    
    return gravidadeMap[gravidade] || <Badge>Desconhecido</Badge>;
  };

  const getIconeDoenca = (tipo?: string) => {
    const iconMap: Record<string, JSX.Element> = {
      'cerebral': <Brain className="h-6 w-6 text-blue-500" />,
      'cardiaco': <Heart className="h-6 w-6 text-red-500" />,
      'pulmonar': <Activity className="h-6 w-6 text-purple-500" />,
    };
    
    return tipo && iconMap[tipo] ? iconMap[tipo] : <HeartPulse className="h-6 w-6 text-indigo-500" />;
  };

  const formatarData = (data: Date) => {
    if (!data) return 'N/A';
    return data.toLocaleDateString('pt-BR');
  };

  const doencasFiltradas = doencas.filter(doenca => {
    // Filtro de busca
    const termoBusca = filtro.toLowerCase();
    const correspondeAoBuscar = 
      doenca.nome.toLowerCase().includes(termoBusca) ||
      doenca.descricao.toLowerCase().includes(termoBusca) ||
      doenca.categoria.toLowerCase().includes(termoBusca);
    
    // Filtro por categoria
    const correspondeCategoria = categoriaFiltro === 'todas' || doenca.categoria.toLowerCase() === categoriaFiltro.toLowerCase();
    
    return correspondeAoBuscar && correspondeCategoria;
  });

  const categorias = Array.from(new Set(doencas.map(d => d.categoria))).sort();

  return (
    <ResearcherLayout>
      <div className="container p-4 mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Doenças e Condições Médicas</h1>
              <p className="text-gray-500 mt-1">Base de conhecimento e pesquisa sobre condições médicas</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => toast({ title: "Exportando dados", description: "Os dados serão exportados em CSV" })}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Dados
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => toast({ title: "Adicionar nova condição", description: "Funcionalidade em desenvolvimento" })}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Nova Condição
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Catálogo de Doenças e Condições</CardTitle>
                  <CardDescription>
                    Base de dados de condições médicas para pesquisa com canabinoioides
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
                    <div className="relative max-w-md">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input 
                        placeholder="Buscar doenças e condições..." 
                        className="pl-10" 
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <select 
                        value={categoriaFiltro}
                        onChange={(e) => setCategoriaFiltro(e.target.value)}
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      >
                        <option value="todas">Todas as categorias</option>
                        {categorias.map(categoria => (
                          <option key={categoria} value={categoria.toLowerCase()}>
                            {categoria}
                          </option>
                        ))}
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
                  ) : doencasFiltradas.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {doencasFiltradas.map((doenca) => (
                        <Card 
                          key={doenca.id} 
                          className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setLocation(`/researcher/doencas/${doenca.id}`)}
                        >
                          <div className="flex p-4">
                            <div className="mr-4">
                              {getIconeDoenca(doenca.iconeTipo)}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h3 className="font-medium text-lg">{doenca.nome}</h3>
                                {getGravidadeBadge(doenca.gravidade)}
                              </div>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{doenca.descricao}</p>
                            </div>
                          </div>
                          <div className="bg-gray-50 px-4 py-2 flex justify-between items-center border-t">
                            <div className="flex items-center text-sm text-gray-500">
                              <FileText className="h-3.5 w-3.5 mr-1" />
                              <span>{doenca.estudosRelacionados} estudos</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Users className="h-3.5 w-3.5 mr-1" />
                              <span>{doenca.pacientesRegistrados} pacientes</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              <span title={formatarData(doenca.ultimaAtualizacao)}>
                                {new Date().getFullYear() === doenca.ultimaAtualizacao.getFullYear() ? 
                                  formatarData(doenca.ultimaAtualizacao).split('/').slice(0, 2).join('/') :
                                  formatarData(doenca.ultimaAtualizacao)
                                }
                              </span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-gray-700 font-medium mb-1">Nenhuma condição encontrada</h3>
                      <p className="text-gray-500 text-sm mb-4">
                        Não foram encontradas condições médicas com os critérios selecionados
                      </p>
                      <Button 
                        onClick={() => {
                          setFiltro('');
                          setCategoriaFiltro('todas');
                        }}
                      >
                        Limpar filtros
                      </Button>
                    </div>
                  )}
                </CardContent>
                {!isLoading && doencasFiltradas.length > 0 && (
                  <CardFooter className="pt-0 flex justify-center">
                    <Button variant="outline" size="sm" onClick={() => toast({ title: "Carregando mais", description: "Carregando mais resultados..." })}>
                      Ver mais condições
                    </Button>
                  </CardFooter>
                )}
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Estatísticas de Pesquisa</CardTitle>
                  <CardDescription>
                    Análise de dados sobre estudos e resultados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6 border rounded-md bg-gray-50">
                    <BarChart className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Visualizações estatísticas em desenvolvimento</p>
                    <p className="text-xs text-gray-400 mt-1">Esta funcionalidade estará disponível em breve</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    <div className="flex items-center">
                      <Microscope className="h-5 w-5 text-green-600 mr-2" />
                      Áreas de Pesquisa
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex items-center">
                        <Brain className="h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <p className="font-medium">Neurológicas</p>
                          <p className="text-xs text-gray-500">23 condições catalogadas</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex items-center">
                        <Activity className="h-5 w-5 text-purple-500 mr-3" />
                        <div>
                          <p className="font-medium">Dor Crônica</p>
                          <p className="text-xs text-gray-500">18 condições catalogadas</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex items-center">
                        <HeartPulse className="h-5 w-5 text-red-500 mr-3" />
                        <div>
                          <p className="font-medium">Autoimunes</p>
                          <p className="text-xs text-gray-500">15 condições catalogadas</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex items-center">
                        <Brain className="h-5 w-5 text-amber-500 mr-3" />
                        <div>
                          <p className="font-medium">Psiquiátricas</p>
                          <p className="text-xs text-gray-500">12 condições catalogadas</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="w-full mt-4">
                    Ver todas as áreas
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Pesquisadores Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pesquisadores.map((pesquisador) => (
                      <div key={pesquisador.id} className="flex items-center gap-3 pb-3 border-b last:border-0 last:pb-0">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                          {pesquisador.avatar ? (
                            <img src={pesquisador.avatar} alt={pesquisador.nome} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary">
                              {pesquisador.nome.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{pesquisador.nome}</p>
                              <p className="text-xs text-gray-500">{pesquisador.cargo}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {pesquisador.estudos} estudos
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{pesquisador.instituicao}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Recursos Úteis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center border rounded-md p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                      <Database className="h-4 w-4 text-blue-500 mr-2" />
                      <div>
                        <p className="font-medium text-sm">Base de Conhecimento Médico</p>
                        <p className="text-xs text-gray-500">Literatura e publicações</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center border rounded-md p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                      <LinkIcon className="h-4 w-4 text-green-500 mr-2" />
                      <div>
                        <p className="font-medium text-sm">Associações de Pacientes</p>
                        <p className="text-xs text-gray-500">Grupos de apoio e contatos</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center border rounded-md p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                      <FileText className="h-4 w-4 text-amber-500 mr-2" />
                      <div>
                        <p className="font-medium text-sm">Protocolos de Pesquisa</p>
                        <p className="text-xs text-gray-500">Modelos e referências</p>
                      </div>
                    </div>
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