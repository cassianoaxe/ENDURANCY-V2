import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import ResearcherLayout from '@/components/layout/researcher/ResearcherLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Users,
  Search,
  Plus,
  Microscope,
  FileText,
  AlertCircle,
  Download,
  ChevronRight,
  CalendarClock,
  PlusCircle,
  CheckCircle2,
  XCircle,
  CircleAlertIcon,
  Filter,
  HeartPulse,
  Brain,
  ActivitySquare,
  BookOpen,
  FileBarChart2
} from 'lucide-react';

export default function ResearcherLaboratorio() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [visualizacao, setVisualizacao] = useState('todas');
  const [estudos, setEstudos] = useState<any[]>([]);
  const [participantes, setParticipantes] = useState<any[]>([]);
  const [resultados, setResultados] = useState<any[]>([]);

  // Dados de exemplo para simulação - serão substituídos por dados reais
  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => {
      setEstudos([
        {
          id: 'EST-2025-001',
          titulo: 'Eficácia e segurança de produtos à base de Cannabis em pacientes com dor crônica',
          tipo: 'Observacional Prospectivo',
          status: 'em_andamento',
          dataInicio: new Date(2025, 2, 15),
          participantes: 758,
          doenca: 'Dor crônica',
          responsavel: 'Dra. Maria Silva'
        },
        {
          id: 'EST-2025-002',
          titulo: 'Uso de Cannabis medicinal no tratamento da ansiedade - Estudo de Mundo Real',
          tipo: 'Observacional Retrospectivo',
          status: 'rascunho',
          dataInicio: null,
          participantes: 0,
          doenca: 'Transtornos de Ansiedade',
          responsavel: 'Dr. João Santos'
        },
        {
          id: 'EST-2024-015',
          titulo: 'Avaliação do uso de Cannabis medicinal em pacientes com epilepsia refratária',
          tipo: 'Observacional Prospectivo',
          status: 'concluido',
          dataInicio: new Date(2024, 8, 10),
          dataFim: new Date(2025, 2, 10),
          participantes: 325,
          doenca: 'Epilepsia Refratária',
          responsavel: 'Dra. Ana Costa'
        }
      ]);

      setParticipantes([
        {
          id: 'PAC-45678',
          nome: 'José da Silva (anonimizado)',
          idade: 52,
          genero: 'Masculino',
          cidade: 'São Paulo, SP',
          diagnostico: 'Dor crônica neuropática',
          cid: 'G89.4',
          dataInclusao: new Date(2025, 2, 18),
          estudo: 'EST-2025-001',
          status: 'ativo'
        },
        {
          id: 'PAC-45679',
          nome: 'Maria Oliveira (anonimizado)',
          idade: 45,
          genero: 'Feminino',
          cidade: 'Rio de Janeiro, RJ',
          diagnostico: 'Fibromialgia',
          cid: 'M79.7',
          dataInclusao: new Date(2025, 2, 20),
          estudo: 'EST-2025-001',
          status: 'ativo'
        },
        {
          id: 'PAC-45680',
          nome: 'Carlos Souza (anonimizado)',
          idade: 38,
          genero: 'Masculino',
          cidade: 'Belo Horizonte, MG',
          diagnostico: 'Ansiedade generalizada',
          cid: 'F41.1',
          dataInclusao: new Date(2025, 2, 19),
          estudo: 'EST-2025-001',
          status: 'pendente'
        }
      ]);

      setResultados([
        {
          id: 'RES-2025-001',
          estudo: 'EST-2024-015',
          titulo: 'Resultados preliminares - Epilepsia refratária',
          tipo: 'Preliminar',
          dataCriacao: new Date(2024, 11, 15),
          amostras: 212,
          metricas: {
            eficaciaPercebida: 7.8,
            reducaoConvulsoes: '68%',
            efeitosColaterais: '23%',
            reducaoOutrosMedicamentos: '52%'
          }
        },
        {
          id: 'RES-2025-002',
          estudo: 'EST-2024-015',
          titulo: 'Relatório Final - Epilepsia refratária',
          tipo: 'Final',
          dataCriacao: new Date(2025, 2, 15),
          amostras: 325,
          metricas: {
            eficaciaPercebida: 7.5,
            reducaoConvulsoes: '65%',
            efeitosColaterais: '18%',
            reducaoOutrosMedicamentos: '58%'
          }
        },
        {
          id: 'RES-2025-003',
          estudo: 'EST-2025-001',
          titulo: 'Monitoramento mensal - Dor Crônica',
          tipo: 'Parcial',
          dataCriacao: new Date(2025, 3, 1),
          amostras: 348,
          metricas: {
            eficaciaPercebida: 6.9,
            reducaoDor: '62%',
            efeitosColaterais: '14%',
            reducaoOutrosMedicamentos: '47%'
          }
        }
      ]);

      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, JSX.Element> = {
      'em_andamento': <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Em andamento</Badge>,
      'concluido': <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Concluído</Badge>,
      'rascunho': <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Rascunho</Badge>,
      'pausado': <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pausado</Badge>,
      'cancelado': <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Cancelado</Badge>,
      'ativo': <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Ativo</Badge>,
      'pendente': <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pendente</Badge>,
      'inativo': <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Inativo</Badge>,
    };
    
    return statusMap[status] || <Badge>Desconhecido</Badge>;
  };

  const formatarData = (data: Date | null) => {
    if (!data) return 'N/A';
    return data.toLocaleDateString('pt-BR');
  };

  return (
    <ResearcherLayout>
      <div className="container p-4 mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Laboratório de Pesquisa Clínica</h1>
              <p className="text-gray-500 mt-1">Estudos de mundo real, participantes e resultados de pesquisas</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setLocation('/researcher/estudos/novo')} className="bg-green-600 hover:bg-green-700">
                <PlusCircle className="h-4 w-4 mr-2" />
                Novo Estudo
              </Button>
              <Button variant="outline" onClick={() => setLocation('/researcher/laboratorio/relatorios')}>
                <FileBarChart2 className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="estudos" className="w-full">
            <TabsList className="w-full md:w-auto justify-start">
              <TabsTrigger value="estudos" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                <FileText className="h-4 w-4 mr-2" />
                Estudos
              </TabsTrigger>
              <TabsTrigger value="participantes" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                <Users className="h-4 w-4 mr-2" />
                Participantes
              </TabsTrigger>
              <TabsTrigger value="resultados" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                <FileBarChart2 className="h-4 w-4 mr-2" />
                Resultados
              </TabsTrigger>
            </TabsList>
            
            {/* Painel de Estudos */}
            <TabsContent value="estudos" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Estudos de Mundo Real</CardTitle>
                  <CardDescription>
                    Gerencie estudos clínicos observacionais com grandes grupos de pacientes
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
                      <Label htmlFor="visualizacao">Visualizar:</Label>
                      <select 
                        id="visualizacao" 
                        value={visualizacao}
                        onChange={(e) => setVisualizacao(e.target.value)}
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      >
                        <option value="todas">Todos os estudos</option>
                        <option value="em_andamento">Em andamento</option>
                        <option value="concluido">Concluídos</option>
                        <option value="rascunho">Rascunhos</option>
                      </select>
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border rounded-lg p-4 animate-pulse">
                          <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                          <div className="flex justify-between">
                            <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : estudos.length > 0 ? (
                    <div className="space-y-4">
                      {estudos
                        .filter(estudo => 
                          (visualizacao === 'todas' || estudo.status === visualizacao) &&
                          (filtro === '' || 
                            estudo.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
                            estudo.id.toLowerCase().includes(filtro.toLowerCase()) ||
                            estudo.doenca.toLowerCase().includes(filtro.toLowerCase()))
                        )
                        .map((estudo) => (
                          <div 
                            key={estudo.id} 
                            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => setLocation(`/researcher/estudos/${estudo.id}`)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium text-gray-900 flex items-center">
                                  {estudo.titulo}
                                  {estudo.status === 'em_andamento' && (
                                    <CircleAlertIcon className="h-4 w-4 text-blue-500 ml-2" />
                                  )}
                                </h3>
                                <p className="text-sm text-gray-500 mb-1">
                                  {estudo.id} • {estudo.tipo}
                                </p>
                              </div>
                              <div className="flex flex-col items-end">
                                {getStatusBadge(estudo.status)}
                                <span className="text-xs text-gray-500 mt-1">
                                  {estudo.status === 'rascunho' 
                                    ? 'Não iniciado' 
                                    : `Iniciado em ${formatarData(estudo.dataInicio)}`}
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 my-2">
                              <div className="flex items-center text-gray-600 text-sm">
                                <HeartPulse className="h-4 w-4 mr-1 text-rose-500" />
                                <span>Doença: {estudo.doenca}</span>
                              </div>
                              <div className="flex items-center text-gray-600 text-sm">
                                <Users className="h-4 w-4 mr-1 text-blue-500" />
                                <span>Participantes: {estudo.participantes}</span>
                              </div>
                              <div className="flex items-center text-gray-600 text-sm">
                                <ActivitySquare className="h-4 w-4 mr-1 text-emerald-500" />
                                <span>Resp.: {estudo.responsavel}</span>
                              </div>
                            </div>
                            
                            <div className="flex justify-between mt-3 text-sm">
                              {estudo.status === 'em_andamento' && (
                                <Button 
                                  variant="outline" 
                                  className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs h-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setLocation(`/researcher/estudos/${estudo.id}/questionarios`);
                                  }}
                                >
                                  Gerenciar questionários
                                </Button>
                              )}
                              {estudo.status === 'concluido' && (
                                <Button 
                                  variant="outline" 
                                  className="text-green-600 border-green-200 hover:bg-green-50 text-xs h-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setLocation(`/researcher/estudos/${estudo.id}/relatorios`);
                                  }}
                                >
                                  Ver relatórios
                                </Button>
                              )}
                              <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-gray-700 font-medium mb-1">Nenhum estudo encontrado</h3>
                      <p className="text-gray-500 text-sm mb-4">
                        Você ainda não tem estudos cadastrados
                      </p>
                      <Button onClick={() => setLocation('/researcher/estudos/novo')}>
                        Criar primeiro estudo
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Painel de Participantes */}
            <TabsContent value="participantes" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Participantes da Pesquisa</CardTitle>
                  <CardDescription>
                    Gerencie participantes dos estudos clínicos de mundo real
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative max-w-md mb-4">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <Input 
                      placeholder="Buscar participantes..." 
                      className="pl-10" 
                      value={filtro}
                      onChange={(e) => setFiltro(e.target.value)}
                    />
                  </div>
                  
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border rounded-lg p-4 animate-pulse">
                          <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                          <div className="flex justify-between">
                            <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : participantes.length > 0 ? (
                    <div className="space-y-4">
                      {participantes
                        .filter(p => 
                          filtro === '' || 
                          p.nome.toLowerCase().includes(filtro.toLowerCase()) ||
                          p.id.toLowerCase().includes(filtro.toLowerCase()) ||
                          p.diagnostico.toLowerCase().includes(filtro.toLowerCase()) ||
                          p.cid.toLowerCase().includes(filtro.toLowerCase())
                        )
                        .map((p) => (
                          <div 
                            key={p.id} 
                            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => setLocation(`/researcher/participantes/${p.id}`)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium text-gray-900">{p.nome}</h3>
                                <p className="text-sm text-gray-500 mb-1">
                                  {p.id} • {p.idade} anos, {p.genero}
                                </p>
                              </div>
                              <div className="flex flex-col items-end">
                                {getStatusBadge(p.status)}
                                <span className="text-xs text-gray-500 mt-1">
                                  Incluído em {formatarData(p.dataInclusao)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 my-2">
                              <div className="flex items-start text-gray-600 text-sm">
                                <Brain className="h-4 w-4 mr-1 text-violet-500 mt-0.5" />
                                <div>
                                  <span className="block">Diagnóstico: {p.diagnostico}</span>
                                  <span className="text-xs text-gray-500">CID: {p.cid}</span>
                                </div>
                              </div>
                              <div className="flex items-center text-gray-600 text-sm">
                                <span className="ml-5">Localização: {p.cidade}</span>
                              </div>
                            </div>
                            
                            <div className="flex justify-between mt-3 text-sm">
                              <div className="text-xs text-blue-600">
                                Estudo: {p.estudo}
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs h-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLocation(`/researcher/participantes/${p.id}/questionarios`);
                                }}
                              >
                                Ver questionários
                              </Button>
                            </div>
                          </div>
                        ))}
                      
                      <Button 
                        variant="outline" 
                        className="w-full mt-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => setLocation('/researcher/participantes')}
                      >
                        Ver todos os participantes
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-gray-700 font-medium mb-1">Nenhum participante encontrado</h3>
                      <p className="text-gray-500 text-sm mb-4">
                        Ainda não há participantes cadastrados nos estudos
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Painel de Resultados */}
            <TabsContent value="resultados" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Resultados de Estudos</CardTitle>
                  <CardDescription>
                    Acesse relatórios e resultados dos estudos de mundo real (RWE)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative max-w-md mb-4">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <Input 
                      placeholder="Buscar resultados..." 
                      className="pl-10" 
                      value={filtro}
                      onChange={(e) => setFiltro(e.target.value)}
                    />
                  </div>
                  
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border rounded-lg p-4 animate-pulse">
                          <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                          <div className="flex justify-between">
                            <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : resultados.length > 0 ? (
                    <div className="space-y-4">
                      {resultados
                        .filter(res => 
                          filtro === '' || 
                          res.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
                          res.id.toLowerCase().includes(filtro.toLowerCase()) ||
                          res.estudo.toLowerCase().includes(filtro.toLowerCase())
                        )
                        .map((res) => (
                          <div 
                            key={res.id} 
                            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => setLocation(`/researcher/resultados/${res.id}`)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium text-gray-900">{res.titulo}</h3>
                                <p className="text-sm text-gray-500 mb-1">
                                  {res.id} • Estudo: {res.estudo}
                                </p>
                              </div>
                              <div className="flex flex-col items-end">
                                <Badge className={`
                                  ${res.tipo === 'Final' ? 'bg-green-100 text-green-700' : 
                                    res.tipo === 'Preliminar' ? 'bg-blue-100 text-blue-700' : 
                                    'bg-amber-100 text-amber-700'}
                                  hover:bg-opacity-90
                                `}>
                                  Relatório {res.tipo}
                                </Badge>
                                <span className="text-xs text-gray-500 mt-1">
                                  Gerado em {formatarData(res.dataCriacao)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="my-3 pt-2 border-t">
                              <p className="text-xs font-medium text-gray-500 mb-2">Resultados principais:</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {Object.entries(res.metricas).map(([key, value]) => (
                                  <div key={key} className="bg-gray-50 p-2 rounded border">
                                    <p className="text-xs font-medium">{
                                      key === 'eficaciaPercebida' ? 'Eficácia percebida' :
                                      key === 'reducaoConvulsoes' ? 'Redução convulsões' :
                                      key === 'reducaoDor' ? 'Redução da dor' :
                                      key === 'efeitosColaterais' ? 'Efeitos colaterais' :
                                      key === 'reducaoOutrosMedicamentos' ? 'Redução outros medicamentos' :
                                      key
                                    }</p>
                                    <p className="text-sm">{value}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center mt-3">
                              <span className="text-sm text-gray-600">
                                <Users className="h-4 w-4 inline mr-1" />
                                Tamanho da amostra: <b>{res.amostras}</b> participantes
                              </span>
                              
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-blue-600 border-blue-200" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toast({
                                    title: "Relatório baixado",
                                    description: `O relatório ${res.id} foi baixado com sucesso.`,
                                  });
                                }}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Baixar PDF
                              </Button>
                            </div>
                          </div>
                        ))}
                      
                      <Button 
                        variant="outline" 
                        className="w-full mt-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => setLocation('/researcher/resultados')}
                      >
                        Ver todos os resultados
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileBarChart2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-gray-700 font-medium mb-1">Nenhum resultado encontrado</h3>
                      <p className="text-gray-500 text-sm mb-4">
                        Ainda não há resultados disponíveis para seus estudos
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                Informações sobre Pesquisa de Mundo Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium">Real World Evidence (RWE):</span> são dados clínicos obtidos fora do ambiente controlado de ensaios clínicos tradicionais, refletindo o uso de tratamentos na prática médica cotidiana.
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Grandes bancos de dados:</span> Para obter resultados significativos, recomenda-se grupos com mais de 700 participantes, permitindo análises estatísticas robustas.
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Relatórios e dashboards:</span> Todos os dados são processados e apresentados em relatórios detalhados e painéis interativos para facilitar a interpretação dos resultados.
                </p>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setLocation('/researcher/documentos/metodologia')}>
                <BookOpen className="h-4 w-4 mr-2" />
                Acessar Guia Metodológico
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </ResearcherLayout>
  );
}