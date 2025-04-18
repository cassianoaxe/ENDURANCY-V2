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
  BookOpen,
  Clock,
  Users,
  FileText,
  Database,
  BarChart,
  ChevronRight,
  PlusCircle,
  Microscope,
  Download,
  Calendar,
  Tag,
  BookMarked,
  Bookmark,
  FileSearch,
  Star,
  School,
  GraduationCap,
  Building,
  User,
  Eye,
  Share2,
  ExternalLink
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  visualizacoes: number;
  downloads: number;
}

interface PesquisaDestaque {
  id: string;
  titulo: string;
  resumo: string;
  autores: string[];
  instituicao: string;
  dataCriacao: Date;
  citacoes: number;
  tags: string[];
  imagem?: string;
}

interface EventoCientifico {
  id: string;
  nome: string;
  tipo: string;
  dataInicio: Date;
  dataFim: Date;
  local: string;
  online: boolean;
  site?: string;
  descricao: string;
}

interface JournalData {
  nome: string;
  fatorImpacto: number;
  publicacoesRecentes: number;
}

export default function CatalogoPesquisas() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [estudos, setEstudos] = useState<Estudo[]>([]);
  const [destaques, setDestaques] = useState<PesquisaDestaque[]>([]);
  const [eventos, setEventos] = useState<EventoCientifico[]>([]);
  const [journals, setJournals] = useState<JournalData[]>([]);
  const [filtro, setFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [tagsSelecionadas, setTagsSelecionadas] = useState<string[]>([]);
  const [tagsSugeridas, setTagsSugeridas] = useState<string[]>([
    'CBD', 'THC', 'Canabinoides', 'Epilepsia', 'Dor', 'Neurologia',
    'Psiquiatria', 'Oncologia', 'Clínico', 'Observacional', 'Pré-clínico'
  ]);

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
          participantes: 120,
          tags: ['CBD', 'Epilepsia', 'Clínico', 'Neurologia'],
          visualizacoes: 1256,
          downloads: 325
        },
        {
          id: 'EST-2025-002',
          titulo: 'Canabinoides e Qualidade do Sono',
          descricao: 'Avaliação dos efeitos de diferentes formulações de canabinoides na qualidade do sono em pacientes com insônia crônica.',
          investigadorPrincipal: 'Dr. Carlos Mendes',
          instituicao: 'Instituto de Neurociências',
          status: 'ativo',
          dataInicio: new Date(2025, 1, 10),
          participantes: 85,
          tags: ['Canabinoides', 'Sono', 'Clínico', 'Insônia'],
          visualizacoes: 892,
          downloads: 156
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
          participantes: 145,
          tags: ['THC', 'CBD', 'Dor', 'Clínico', 'Neurologia'],
          visualizacoes: 1823,
          downloads: 527
        },
        {
          id: 'EST-2025-003',
          titulo: 'Canabinoides no Tratamento da Ansiedade',
          descricao: 'Investigação dos efeitos ansiolíticos dos canabinoides em pacientes diagnosticados com transtornos de ansiedade.',
          investigadorPrincipal: 'Dr. Marcelo Souza',
          instituicao: 'UNIFESP',
          status: 'ativo',
          dataInicio: new Date(2025, 2, 5),
          participantes: 90,
          tags: ['Canabinoides', 'Ansiedade', 'Psiquiatria', 'Clínico'],
          visualizacoes: 765,
          downloads: 124
        },
        {
          id: 'EST-2025-004',
          titulo: 'Modelo Animal para Epilepsia e CBD',
          descricao: 'Estudo pré-clínico sobre o mecanismo de ação do CBD em modelo animal de epilepsia induzida por pentilentetrazol.',
          investigadorPrincipal: 'Dr. André Santos',
          instituicao: 'USP-Ribeirão Preto',
          status: 'ativo',
          dataInicio: new Date(2025, 1, 20),
          participantes: 0,
          tags: ['CBD', 'Epilepsia', 'Pré-clínico', 'Neurofarmacologia'],
          visualizacoes: 432,
          downloads: 89
        },
        {
          id: 'EST-2024-015',
          titulo: 'Farmacocinética de Canabinoides Inalados',
          descricao: 'Avaliação da farmacocinética de diferentes métodos de administração inalatória de canabinoides.',
          investigadorPrincipal: 'Dra. Fernanda Lima',
          instituicao: 'UFRJ',
          status: 'concluido',
          dataInicio: new Date(2024, 2, 10),
          dataConclusao: new Date(2024, 11, 15),
          participantes: 60,
          tags: ['Canabinoides', 'Farmacocinética', 'Clínico', 'Métodos de Administração'],
          visualizacoes: 654,
          downloads: 213
        }
      ]);

      setDestaques([
        {
          id: 'PUB-2025-005',
          titulo: 'Canabidiol como Tratamento Adjuvante na Epilepsia: Análise de 3 Anos de Acompanhamento',
          resumo: 'Este estudo apresenta os resultados de 3 anos de acompanhamento de pacientes com epilepsia refratária tratados com canabidiol como terapia adjuvante.',
          autores: ['Ana Ribeiro', 'Carlos Mendes', 'Maria Silva'],
          instituicao: 'Universidade de São Paulo',
          dataCriacao: new Date(2025, 2, 10),
          citacoes: 23,
          tags: ['CBD', 'Epilepsia', 'Longo prazo', 'Terapia adjuvante'],
          imagem: 'https://images.unsplash.com/photo-1582560475093-ba66accbc7f9?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3'
        },
        {
          id: 'PUB-2024-128',
          titulo: 'Perfil de Segurança do THC/CBD em Pacientes Oncológicos',
          resumo: 'Análise do perfil de segurança e eficácia de formulação padronizada de THC/CBD em pacientes oncológicos para tratamento de náuseas e dor.',
          autores: ['Luciana Costa', 'Roberto Oliveira'],
          instituicao: 'Hospital Albert Einstein',
          dataCriacao: new Date(2024, 11, 5),
          citacoes: 18,
          tags: ['THC', 'CBD', 'Oncologia', 'Segurança', 'Efeitos adversos'],
          imagem: 'https://images.unsplash.com/photo-1631549916768-45e2c2b73dd3?q=80&w=2788&auto=format&fit=crop&ixlib=rb-4.0.3'
        }
      ]);

      setEventos([
        {
          id: 'EVT-2025-001',
          nome: 'Simpósio Internacional de Canabinoides na Medicina',
          tipo: 'Simpósio',
          dataInicio: new Date(2025, 5, 15),
          dataFim: new Date(2025, 5, 17),
          local: 'São Paulo, Brasil',
          online: true,
          site: 'https://example.com/simposio2025',
          descricao: 'Evento internacional reunindo especialistas em pesquisa e aplicação clínica de canabinoides.'
        },
        {
          id: 'EVT-2025-002',
          nome: 'Workshop Avanços em Métodos de Extração de Canabinoides',
          tipo: 'Workshop',
          dataInicio: new Date(2025, 7, 10),
          dataFim: new Date(2025, 7, 12),
          local: 'Rio de Janeiro, Brasil',
          online: false,
          descricao: 'Treinamento intensivo em métodos avançados de extração e análise de canabinoides.'
        },
        {
          id: 'EVT-2025-003',
          nome: 'Congresso Brasileiro de Neurologia',
          tipo: 'Congresso',
          dataInicio: new Date(2025, 9, 25),
          dataFim: new Date(2025, 9, 28),
          local: 'Florianópolis, Brasil',
          online: true,
          site: 'https://example.com/neurologia2025',
          descricao: 'Congresso nacional com sessão especial sobre canabinoides em neurologia.'
        }
      ]);

      setJournals([
        { nome: 'Cannabis and Cannabinoid Research', fatorImpacto: 6.2, publicacoesRecentes: 42 },
        { nome: 'Journal of Cannabis Research', fatorImpacto: 4.8, publicacoesRecentes: 36 },
        { nome: 'Medical Cannabis and Cannabinoids', fatorImpacto: 3.9, publicacoesRecentes: 28 },
        { nome: 'Journal of Ethnopharmacology', fatorImpacto: 5.7, publicacoesRecentes: 24 },
        { nome: 'Frontiers in Pharmacology', fatorImpacto: 5.8, publicacoesRecentes: 19 }
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

  const formatarData = (data: Date | undefined) => {
    if (!data) return 'N/A';
    return data.toLocaleDateString('pt-BR');
  };

  const toggleTag = (tag: string) => {
    if (tagsSelecionadas.includes(tag)) {
      setTagsSelecionadas(tagsSelecionadas.filter(t => t !== tag));
    } else {
      setTagsSelecionadas([...tagsSelecionadas, tag]);
    }
  };

  const estudosFiltrados = estudos.filter(estudo => {
    // Filtro de busca
    const termoBusca = filtro.toLowerCase();
    const correspondeAoBuscar = 
      estudo.titulo.toLowerCase().includes(termoBusca) ||
      estudo.descricao.toLowerCase().includes(termoBusca) ||
      estudo.investigadorPrincipal.toLowerCase().includes(termoBusca) ||
      estudo.instituicao.toLowerCase().includes(termoBusca);
    
    // Filtro por status
    const correspondeStatus = statusFiltro === 'todos' || estudo.status === statusFiltro;
    
    // Filtro por tags
    const correspondeTags = tagsSelecionadas.length === 0 || 
      tagsSelecionadas.every(tag => estudo.tags.includes(tag));
    
    return correspondeAoBuscar && correspondeStatus && correspondeTags;
  });

  const proximosEventos = eventos
    .filter(evento => evento.dataInicio > new Date())
    .sort((a, b) => a.dataInicio.getTime() - b.dataInicio.getTime());

  return (
    <ResearcherLayout>
      <div className="container p-4 mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Catálogo de Pesquisas Científicas</h1>
              <p className="text-gray-500 mt-1">Explore estudos, publicações e recursos para sua pesquisa</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => toast({ title: "Exportando estudos", description: "Os estudos serão exportados em CSV" })}>
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
                  <CardTitle className="text-xl">Pesquisas em Destaque</CardTitle>
                  <CardDescription>
                    Publicações relevantes na área de canabinoides medicinais
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-2 gap-0 divide-x divide-y">
                    {destaques.map((destaque, index) => (
                      <div 
                        key={destaque.id} 
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${index % 2 === 0 ? 'rounded-bl-md' : 'rounded-br-md'}`}
                        onClick={() => setLocation(`/researcher/publicacoes/${destaque.id}`)}
                      >
                        <div className="flex flex-col h-full">
                          <div className="mb-3">
                            <h3 className="font-medium text-lg line-clamp-2">{destaque.titulo}</h3>
                            <p className="text-sm text-gray-500 line-clamp-3 mt-2">{destaque.resumo}</p>
                          </div>
                          
                          <div className="mt-auto">
                            <div className="flex flex-wrap gap-1 mb-3">
                              {destaque.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                              ))}
                              {destaque.tags.length > 3 && <span className="text-xs text-gray-500">+{destaque.tags.length - 3}</span>}
                            </div>
                            
                            <div className="flex justify-between items-center text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <GraduationCap className="h-3.5 w-3.5" />
                                <span>{destaque.autores[0]} et al.</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5" />
                                <span>{destaque.citacoes} citações</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Tabs defaultValue="estudos" className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="estudos" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                    <BookOpen className="h-4 w-4 mr-2 md:mr-0 lg:mr-2" />
                    <span className="hidden md:inline-block lg:inline-block">Estudos</span>
                  </TabsTrigger>
                  <TabsTrigger value="eventos" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                    <Calendar className="h-4 w-4 mr-2 md:mr-0 lg:mr-2" />
                    <span className="hidden md:inline-block lg:inline-block">Eventos</span>
                  </TabsTrigger>
                  <TabsTrigger value="journals" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                    <BookMarked className="h-4 w-4 mr-2 md:mr-0 lg:mr-2" />
                    <span className="hidden md:inline-block lg:inline-block">Journals</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="estudos" className="mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Estudos e Pesquisas</CardTitle>
                      <CardDescription>
                        Estudos em andamento, concluídos e planejados
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
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4 text-gray-500" />
                          <select 
                            value={statusFiltro}
                            onChange={(e) => setStatusFiltro(e.target.value)}
                            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          >
                            <option value="todos">Todos os status</option>
                            <option value="ativo">Ativos</option>
                            <option value="concluido">Concluídos</option>
                            <option value="planejado">Planejados</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <p className="text-sm text-gray-500 mr-1">Tags:</p>
                        {tagsSugeridas.slice(0, 8).map(tag => (
                          <Badge 
                            key={tag}
                            variant={tagsSelecionadas.includes(tag) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleTag(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                        <Button variant="ghost" size="sm">
                          + Mais tags
                        </Button>
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
                                  <h3 className="font-medium text-lg line-clamp-1">{estudo.titulo}</h3>
                                  {getStatusBadge(estudo.status)}
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{estudo.descricao}</p>
                                
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {estudo.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                  ))}
                                </div>
                                
                                <div className="flex flex-wrap justify-between text-sm text-gray-500">
                                  <div className="flex items-center gap-2 mb-2 md:mb-0">
                                    <div className="flex items-center">
                                      <User className="h-4 w-4 mr-1" />
                                      <span>{estudo.investigadorPrincipal}</span>
                                    </div>
                                    <span>•</span>
                                    <div className="flex items-center">
                                      <Building className="h-4 w-4 mr-1" />
                                      <span>{estudo.instituicao}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-3">
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
                                </div>
                              </div>
                              
                              <div className="bg-gray-50 px-4 py-2 flex justify-between items-center border-t">
                                <div className="flex items-center text-sm text-gray-500">
                                  <Eye className="h-3.5 w-3.5 mr-1" />
                                  <span>{estudo.visualizacoes.toLocaleString()} visualizações</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <FileText className="h-3.5 w-3.5 mr-1" />
                                  <span>{estudo.downloads.toLocaleString()} downloads</span>
                                </div>
                                <div>
                                  <Button variant="ghost" size="sm">
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileSearch className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <h3 className="text-gray-700 font-medium mb-1">Nenhum estudo encontrado</h3>
                          <p className="text-gray-500 text-sm mb-4">
                            Não foram encontrados estudos com os critérios selecionados
                          </p>
                          <Button 
                            onClick={() => {
                              setFiltro('');
                              setStatusFiltro('todos');
                              setTagsSelecionadas([]);
                            }}
                          >
                            Limpar filtros
                          </Button>
                        </div>
                      )}
                    </CardContent>
                    {!isLoading && estudosFiltrados.length > 0 && (
                      <CardFooter className="pt-0 flex justify-center">
                        <Button variant="outline" size="sm" onClick={() => toast({ title: "Carregando mais", description: "Carregando mais resultados..." })}>
                          Ver mais estudos
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                </TabsContent>
                
                <TabsContent value="eventos" className="mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Eventos Científicos</CardTitle>
                      <CardDescription>
                        Próximos eventos e congressos relevantes para pesquisadores
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
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : proximosEventos.length > 0 ? (
                        <div className="space-y-4">
                          {proximosEventos.map((evento) => (
                            <div key={evento.id} className="border rounded-md p-4 hover:bg-gray-50 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium text-lg">{evento.nome}</h3>
                                <Badge variant="outline">{evento.tipo}</Badge>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-3">{evento.descricao}</p>
                              
                              <div className="flex flex-wrap justify-between text-sm text-gray-500">
                                <div className="flex items-center gap-3 mb-2 md:mb-0">
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    <span>
                                      {formatarData(evento.dataInicio)}
                                      {evento.dataFim && ` a ${formatarData(evento.dataFim)}`}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <Building className="h-4 w-4 mr-1" />
                                    <span>{evento.local}</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {evento.online && (
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                      Online
                                    </Badge>
                                  )}
                                  
                                  {evento.site && (
                                    <Button size="sm" variant="outline" className="h-8" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(evento.site, '_blank');
                                      }}
                                    >
                                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                      Site oficial
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          <div className="flex justify-center mt-4">
                            <Button 
                              variant="outline"
                              onClick={() => toast({ title: "Lembrete configurado", description: "Você receberá notificações sobre eventos" })}
                            >
                              Ver todos os eventos
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <h3 className="text-gray-700 font-medium mb-1">Nenhum evento próximo</h3>
                          <p className="text-gray-500 text-sm">
                            Não há eventos científicos agendados para o próximo período
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="journals" className="mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Journals e Publicações</CardTitle>
                      <CardDescription>
                        Principais periódicos na área de canabinoides medicinais
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="border rounded-lg p-4 animate-pulse">
                              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                              <div className="flex justify-between">
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : journals.length > 0 ? (
                        <div className="space-y-3">
                          {journals.map((journal, index) => (
                            <div key={index} className="border rounded-md p-3 hover:bg-gray-50 transition-colors">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">{journal.nome}</h3>
                                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                    <div className="flex items-center">
                                      <Star className="h-3.5 w-3.5 mr-1 text-amber-500" />
                                      <span>Fator de Impacto: {journal.fatorImpacto.toFixed(1)}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <FileText className="h-3.5 w-3.5 mr-1" />
                                      <span>{journal.publicacoesRecentes} publicações recentes</span>
                                    </div>
                                  </div>
                                </div>
                                <Button size="sm" variant="ghost">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          
                          <div className="flex justify-center mt-4">
                            <Button variant="outline">
                              Ver todos os periódicos
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <BookMarked className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <h3 className="text-gray-700 font-medium mb-1">Nenhum journal disponível</h3>
                          <p className="text-gray-500 text-sm">
                            Não foi possível carregar a lista de periódicos
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Meu Progresso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1.5 text-sm">
                        <span className="font-medium">Estudos conduzidos</span>
                        <span className="text-gray-500">3/5</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1.5 text-sm">
                        <span className="font-medium">Publicações</span>
                        <span className="text-gray-500">2/10</span>
                      </div>
                      <Progress value={20} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1.5 text-sm">
                        <span className="font-medium">Revisões por pares</span>
                        <span className="text-gray-500">8/15</span>
                      </div>
                      <Progress value={53} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1.5 text-sm">
                        <span className="font-medium">Eventos participados</span>
                        <span className="text-gray-500">4/8</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-sm">Próximos prazos</h4>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">Ver todos</Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="border rounded p-2 flex justify-between items-center text-sm">
                          <div>
                            <p className="font-medium">Envio de resumo para congresso</p>
                            <p className="text-xs text-gray-500">Simpósio Internacional</p>
                          </div>
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">5 dias</Badge>
                        </div>
                        
                        <div className="border rounded p-2 flex justify-between items-center text-sm">
                          <div>
                            <p className="font-medium">Relatório parcial - CBD em Epilepsia</p>
                            <p className="text-xs text-gray-500">Estudo EST-2025-001</p>
                          </div>
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">2 dias</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Colaborações em destaque</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 pb-3 border-b">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        <img src="https://randomuser.me/api/portraits/women/45.jpg" alt="Dra. Ana Ribeiro" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Dra. Ana Ribeiro</p>
                            <p className="text-xs text-gray-500">Universidade de São Paulo</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">Epilepsia</Badge>
                          <Badge variant="outline" className="text-xs">Neurologia</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 pb-3 border-b">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Dr. Carlos Mendes" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Dr. Carlos Mendes</p>
                            <p className="text-xs text-gray-500">Instituto de Neurociências</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">Sono</Badge>
                          <Badge variant="outline" className="text-xs">Farmacocinética</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Dra. Luciana Costa" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Dra. Luciana Costa</p>
                            <p className="text-xs text-gray-500">Hospital Albert Einstein</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">Dor</Badge>
                          <Badge variant="outline" className="text-xs">Oncologia</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    <Users className="h-4 w-4 mr-2" />
                    Encontrar colaboradores
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Recursos recomendados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="border rounded-md p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                      <h4 className="font-medium">Guia de Protocolos Clínicos</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Documento atualizado com diretrizes para estudos clínicos com canabinoides
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">PDF</Badge>
                        <FileText className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                      <h4 className="font-medium">Banco de Dados de Canabinoides</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Base de dados com perfis químicos e propriedades farmacológicas
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">API</Badge>
                        <Database className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                      <h4 className="font-medium">Modelos de Consentimento Informado</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Templates atualizados e aprovados por comitês de ética
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">DOCX</Badge>
                        <FileText className="h-4 w-4 text-gray-400" />
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