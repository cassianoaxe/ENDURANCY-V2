import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Beaker,
  Search,
  Plus,
  Microscope,
  FlaskConical,
  FileText,
  AlertCircle,
  Download,
  ChevronRight,
  CalendarClock,
  PlusCircle,
  CheckCircle2,
  XCircle,
  CircleAlertIcon,
  ChevronDown,
  Filter
} from 'lucide-react';

export default function ResearcherLaboratorio() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [visualizacao, setVisualizacao] = useState('todas');
  interface Amostra {
    id: string;
    nome: string;
    tipo: string;
    status: string;
    dataEnvio: Date;
    resultadosPendentes: number;
    resultadosConcluidos: number;
    observacoes: string;
  }
  
  interface Equipamento {
    id: string;
    nome: string;
    modelo: string;
    tipo: string;
    status: string;
    proximaManutencao: Date | null;
    ultimaCalibracao: Date;
    responsavel: string;
  }
  
  interface ResultadoItem {
    [key: string]: number;
  }
  
  interface Resultado {
    id: string;
    amostraId: string;
    amostraNome: string;
    tipo: string;
    status: string;
    dataAnalise: Date;
    equipamento: string;
    resultados: ResultadoItem;
  }
  
  const [amostras, setAmostras] = useState<Amostra[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [resultados, setResultados] = useState<Resultado[]>([]);

  // Exemplo de dados para simulação
  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => {
      // Dados de exemplo
      setAmostras([
        {
          id: 'AM-2025-041',
          nome: 'Cannabis Sativa Strain A - Lote 001',
          tipo: 'Flor',
          status: 'em_analise',
          dataEnvio: new Date(2025, 3, 10),
          resultadosPendentes: 2,
          resultadosConcluidos: 1,
          observacoes: 'Amostra com alta concentração esperada de CBD'
        },
        {
          id: 'AM-2025-039',
          nome: 'Extrato de CBD 20% - Lote XR2',
          tipo: 'Extrato',
          status: 'concluida',
          dataEnvio: new Date(2025, 3, 8),
          resultadosPendentes: 0,
          resultadosConcluidos: 3,
          observacoes: 'Extrato utilizado para pesquisa de eficácia terapêutica'
        },
        {
          id: 'AM-2025-038',
          nome: 'Óleo Full Spectrum - Lote 2025-05',
          tipo: 'Óleo',
          status: 'aguardando',
          dataEnvio: new Date(2025, 3, 6),
          resultadosPendentes: 3,
          resultadosConcluidos: 0,
          observacoes: 'Aguardando disponibilidade do laboratório'
        }
      ]);

      setEquipamentos([
        {
          id: 'HPLC-001',
          nome: 'HPLC Agilent 1260 Infinity II',
          tipo: 'HPLC',
          status: 'disponivel',
          proximaManutencao: new Date(2025, 5, 15),
          ultimaCalibracao: new Date(2025, 2, 15),
          responsavel: 'Lab Central - São Paulo'
        },
        {
          id: 'GC-003',
          nome: 'GC-MS Shimadzu GCMS-QP2020 NX',
          tipo: 'GC-MS',
          status: 'em_uso',
          proximaManutencao: new Date(2025, 6, 10),
          ultimaCalibracao: new Date(2025, 3, 5),
          responsavel: 'Lab Central - São Paulo'
        },
        {
          id: 'UPLC-002',
          nome: 'UPLC Waters Acquity',
          tipo: 'UPLC',
          status: 'manutencao',
          proximaManutencao: null,
          ultimaCalibracao: new Date(2025, 1, 10),
          responsavel: 'Lab Satélite - Rio de Janeiro'
        }
      ]);

      setResultados([
        {
          id: 'RES-2025-067',
          amostraId: 'AM-2025-041',
          amostraNome: 'Cannabis Sativa Strain A - Lote 001',
          tipo: 'Teor de Canabinoides',
          status: 'concluido',
          dataAnalise: new Date(2025, 3, 11),
          equipamento: 'HPLC-001',
          resultados: {
            CBD: 18.5,
            THC: 0.2,
            CBG: 0.8,
            CBN: 0.1,
          }
        },
        {
          id: 'RES-2025-066',
          amostraId: 'AM-2025-041',
          amostraNome: 'Cannabis Sativa Strain A - Lote 001',
          tipo: 'Perfil Terpênico',
          status: 'em_andamento',
          dataAnalise: new Date(2025, 3, 12),
          equipamento: 'GC-003',
          resultados: null
        },
        {
          id: 'RES-2025-065',
          amostraId: 'AM-2025-039',
          amostraNome: 'Extrato de CBD 20% - Lote XR2',
          tipo: 'Teor de Canabinoides',
          status: 'concluido',
          dataAnalise: new Date(2025, 3, 9),
          equipamento: 'HPLC-001',
          resultados: {
            CBD: 20.3,
            THC: 0.1,
            CBG: 0.4,
            CBN: 0.05,
          }
        }
      ]);

      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, JSX.Element> = {
      'em_analise': <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Em análise</Badge>,
      'concluida': <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Concluída</Badge>,
      'aguardando': <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Aguardando</Badge>,
      'cancelada': <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Cancelada</Badge>,
      'disponivel': <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Disponível</Badge>,
      'em_uso': <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Em uso</Badge>,
      'manutencao': <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Em manutenção</Badge>,
      'indisponivel': <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Indisponível</Badge>,
      'concluido': <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Concluído</Badge>,
      'em_andamento': <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Em andamento</Badge>,
      'pendente': <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pendente</Badge>,
    };
    
    return statusMap[status] || <Badge>Desconhecido</Badge>;
  };

  const formatarData = (data: Date) => {
    if (!data) return 'N/A';
    return data.toLocaleDateString('pt-BR');
  };

  return (
      <div className="container p-4 mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Laboratório</h1>
              <p className="text-gray-500 mt-1">Gerencie amostras, análises e resultados laboratoriais</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setLocation('/researcher/laboratorio/amostras/nova')} className="bg-green-600 hover:bg-green-700">
                <PlusCircle className="h-4 w-4 mr-2" />
                Nova Amostra
              </Button>
              <Button variant="outline" onClick={() => setLocation('/researcher/laboratorio/resultados')}>
                <FileText className="h-4 w-4 mr-2" />
                Ver Resultados
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="amostras" className="w-full">
            <TabsList className="w-full md:w-auto justify-start">
              <TabsTrigger value="amostras" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                <Beaker className="h-4 w-4 mr-2" />
                Amostras
              </TabsTrigger>
              <TabsTrigger value="equipamentos" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                <Microscope className="h-4 w-4 mr-2" />
                Equipamentos
              </TabsTrigger>
              <TabsTrigger value="resultados" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                <FileText className="h-4 w-4 mr-2" />
                Resultados
              </TabsTrigger>
            </TabsList>
            
            {/* Painel de Amostras */}
            <TabsContent value="amostras" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Amostras para Análise</CardTitle>
                  <CardDescription>
                    Gerencie as amostras enviadas para análise laboratorial
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
                    <div className="relative max-w-md">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input 
                        placeholder="Buscar amostras..." 
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
                        <option value="todas">Todas as amostras</option>
                        <option value="em_analise">Em análise</option>
                        <option value="concluida">Concluídas</option>
                        <option value="aguardando">Aguardando</option>
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
                  ) : amostras.length > 0 ? (
                    <div className="space-y-4">
                      {amostras
                        .filter(amostra => 
                          (visualizacao === 'todas' || amostra.status === visualizacao) &&
                          (filtro === '' || 
                            amostra.nome.toLowerCase().includes(filtro.toLowerCase()) ||
                            amostra.id.toLowerCase().includes(filtro.toLowerCase()))
                        )
                        .map((amostra) => (
                          <div 
                            key={amostra.id} 
                            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => setLocation(`/researcher/laboratorio/amostras/${amostra.id}`)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium text-gray-900 flex items-center">
                                  {amostra.nome}
                                  {amostra.status === 'em_analise' && (
                                    <CircleAlertIcon className="h-4 w-4 text-blue-500 ml-2" />
                                  )}
                                </h3>
                                <p className="text-sm text-gray-500 mb-1">
                                  {amostra.id} • {amostra.tipo}
                                </p>
                              </div>
                              <div className="flex flex-col items-end">
                                {getStatusBadge(amostra.status)}
                                <span className="text-xs text-gray-500 mt-1">
                                  Enviada em {formatarData(amostra.dataEnvio)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex justify-between mt-3 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center text-green-600">
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  <span>{amostra.resultadosConcluidos} concluídos</span>
                                </div>
                                <div className="flex items-center text-amber-600">
                                  <CalendarClock className="h-4 w-4 mr-1" />
                                  <span>{amostra.resultadosPendentes} pendentes</span>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        ))}
                      
                      <Button 
                        variant="outline" 
                        className="w-full mt-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => setLocation('/researcher/laboratorio/amostras')}
                      >
                        Ver todas as amostras
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Beaker className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-gray-700 font-medium mb-1">Nenhuma amostra encontrada</h3>
                      <p className="text-gray-500 text-sm mb-4">
                        Você ainda não tem amostras enviadas para análise
                      </p>
                      <Button onClick={() => setLocation('/researcher/laboratorio/amostras/nova')}>
                        Enviar primeira amostra
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Painel de Equipamentos */}
            <TabsContent value="equipamentos" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Equipamentos Laboratoriais</CardTitle>
                  <CardDescription>
                    Verifique disponibilidade e detalhes dos equipamentos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative max-w-md mb-4">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <Input 
                      placeholder="Buscar equipamentos..." 
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
                  ) : equipamentos.length > 0 ? (
                    <div className="space-y-4">
                      {equipamentos
                        .filter(equip => 
                          filtro === '' || 
                          equip.nome.toLowerCase().includes(filtro.toLowerCase()) ||
                          equip.id.toLowerCase().includes(filtro.toLowerCase()) ||
                          equip.tipo.toLowerCase().includes(filtro.toLowerCase())
                        )
                        .map((equip) => (
                          <div 
                            key={equip.id} 
                            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => setLocation(`/researcher/laboratorio/equipamentos/${equip.id}`)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium text-gray-900">{equip.nome}</h3>
                                <p className="text-sm text-gray-500 mb-1">
                                  {equip.id} • {equip.tipo}
                                </p>
                              </div>
                              <div>
                                {getStatusBadge(equip.status)}
                              </div>
                            </div>
                            
                            <div className="flex justify-between mt-3 text-sm">
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
                                <div>
                                  <span className="text-xs font-medium">Responsável:</span>
                                  <p>{equip.responsavel}</p>
                                </div>
                                <div>
                                  <span className="text-xs font-medium">Última calibração:</span>
                                  <p>{formatarData(equip.ultimaCalibracao)}</p>
                                </div>
                                {equip.proximaManutencao && (
                                  <div className="col-span-2">
                                    <span className="text-xs font-medium">Próxima manutenção:</span>
                                    <p>{formatarData(equip.proximaManutencao)}</p>
                                  </div>
                                )}
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400 self-center" />
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Microscope className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-gray-700 font-medium mb-1">Nenhum equipamento encontrado</h3>
                      <p className="text-gray-500 text-sm mb-4">
                        Não há equipamentos laboratoriais disponíveis
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
                  <CardTitle className="text-xl">Resultados de Análises</CardTitle>
                  <CardDescription>
                    Visualize e baixe relatórios e resultados de análises
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
                          res.amostraNome.toLowerCase().includes(filtro.toLowerCase()) ||
                          res.id.toLowerCase().includes(filtro.toLowerCase()) ||
                          res.tipo.toLowerCase().includes(filtro.toLowerCase())
                        )
                        .map((res) => (
                          <div 
                            key={res.id} 
                            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => setLocation(`/researcher/laboratorio/resultados/${res.id}`)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium text-gray-900">{res.tipo}</h3>
                                <p className="text-sm text-gray-500 mb-1">
                                  {res.id} • Amostra: {res.amostraNome}
                                </p>
                              </div>
                              <div className="flex flex-col items-end">
                                {getStatusBadge(res.status)}
                                <span className="text-xs text-gray-500 mt-1">
                                  Análise em {formatarData(res.dataAnalise)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex justify-between mt-3">
                              <div className="text-sm text-gray-600">
                                <span className="text-xs font-medium">Equipamento:</span>
                                <p>{res.equipamento}</p>
                              </div>
                              
                              {res.status === 'concluido' ? (
                                <Button variant="outline" size="sm" className="text-blue-600 border-blue-200" onClick={(e) => {
                                  e.stopPropagation();
                                  toast({
                                    title: "Relatório baixado",
                                    description: `O relatório ${res.id} foi baixado com sucesso.`,
                                  });
                                }}>
                                  <Download className="h-4 w-4 mr-1" />
                                  Baixar Relatório
                                </Button>
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-400 self-center" />
                              )}
                            </div>
                            
                            {res.status === 'concluido' && res.resultados && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-xs font-medium text-gray-500 mb-2">Resumo dos resultados:</p>
                                <div className="grid grid-cols-4 gap-2">
                                  {res.resultados && Object.entries(res.resultados).map(([key, value]) => (
                                    <div key={key} className="bg-gray-50 p-2 rounded border">
                                      <p className="text-xs font-medium">{key}</p>
                                      <p className="text-sm">{typeof value === 'number' ? value.toFixed(1) : '0'}%</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      
                      <Button 
                        variant="outline" 
                        className="w-full mt-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => setLocation('/researcher/laboratorio/resultados')}
                      >
                        Ver todos os resultados
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-gray-700 font-medium mb-1">Nenhum resultado encontrado</h3>
                      <p className="text-gray-500 text-sm mb-4">
                        Você ainda não tem resultados de análises
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
                Informações Importantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium">Envio de amostras:</span> Amostras físicas devem ser enviadas para o laboratório central com pelo menos 48h de antecedência da análise programada.
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Preparação das amostras:</span> Certifique-se de seguir os protocolos de amostragem disponíveis na seção de documentos para garantir resultados precisos.
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Resultados e relatórios:</span> Os relatórios completos ficam disponíveis em até 72h após a conclusão da análise e podem ser baixados diretamente da plataforma.
                </p>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setLocation('/researcher/documentos/laboratorio')}>
                <FileText className="h-4 w-4 mr-2" />
                Acessar Protocolos de Laboratório
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
  );
}