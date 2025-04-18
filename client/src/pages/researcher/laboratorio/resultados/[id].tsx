import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import ResearcherLayout from '@/components/layout/researcher/ResearcherLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Download,
  FileText,
  Calendar,
  Microscope,
  User,
  Beaker,
  FileBarChart2,
  ChevronRight,
  Check,
  FileCog
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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
  resultados: ResultadoItem | null;
  analista?: string;
  metodo?: string;
  sop?: string;
  lote?: string;
  observacoes?: string;
  dataEntrada?: Date;
  dataConclusao?: Date;
}

export default function DetalhesResultado({ params }: { params: { id: string } }) {
  const { id } = params;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  useEffect(() => {
    // Simulação de carregamento para demonstração
    const timer = setTimeout(() => {
      // Dados de exemplo para demonstração
      const resultadoExemplo: Resultado = {
        id: 'RES-2025-067',
        amostraId: 'AM-2025-041',
        amostraNome: 'Cannabis Sativa Strain A - Lote 001',
        tipo: 'Teor de Canabinoides',
        status: 'concluido',
        dataAnalise: new Date(2025, 3, 11),
        dataEntrada: new Date(2025, 3, 10),
        dataConclusao: new Date(2025, 3, 11),
        equipamento: 'HPLC-001',
        analista: 'Dr. Carlos Mendes',
        metodo: 'USP <467>',
        sop: 'SOP-HPLC-001-v2',
        lote: 'LCB-2025-041',
        observacoes: 'Análise realizada em conformidade com protocolos estabelecidos. Amostra apresentou perfil de canabinoides dentro das especificações esperadas para a variedade.',
        resultados: {
          CBD: 18.5,
          THC: 0.2,
          CBG: 0.8,
          CBN: 0.1,
          CBDA: 0.5,
          THCA: 0.1,
          CBC: 0.3,
          THCV: 0.05,
        }
      };

      setResultado(resultadoExemplo);
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [id]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, JSX.Element> = {
      'concluido': <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Concluído</Badge>,
      'em_andamento': <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Em andamento</Badge>,
      'pendente': <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pendente</Badge>,
      'cancelado': <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Cancelado</Badge>,
    };
    
    return statusMap[status] || <Badge>Desconhecido</Badge>;
  };

  const formatarData = (data: Date | undefined) => {
    if (!data) return 'N/A';
    return data.toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <ResearcherLayout>
        <div className="container p-4 mx-auto">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => setLocation('/researcher/laboratorio/resultados')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Carregando resultado...</h1>
            </div>
            <div className="space-y-4">
              <div className="border rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
              <div className="border rounded-lg p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ResearcherLayout>
    );
  }

  if (!resultado) {
    return (
      <ResearcherLayout>
        <div className="container p-4 mx-auto">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => setLocation('/researcher/laboratorio/resultados')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Resultado não encontrado</h1>
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-gray-700 font-medium mb-1">Resultado não encontrado</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    O resultado que você está procurando não foi encontrado ou não existe.
                  </p>
                  <Button 
                    onClick={() => setLocation('/researcher/laboratorio/resultados')}
                  >
                    Voltar para a lista
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ResearcherLayout>
    );
  }

  return (
    <ResearcherLayout>
      <div className="container p-4 mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => setLocation('/researcher/laboratorio/resultados')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Resultado de Análise</h1>
              </div>
              <p className="text-gray-500 mt-1 ml-10">Visualizando detalhes de {resultado.id}</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => toast({ title: "Exportando relatório", description: "O relatório PDF será gerado para download" })}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => toast({ title: "Compartilhamento", description: "Opções de compartilhamento abertas" })}>
                <FileText className="h-4 w-4 mr-2" />
                Compartilhar Resultado
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">Resultado {resultado.id}</CardTitle>
                    {getStatusBadge(resultado.status)}
                  </div>
                  <CardDescription>
                    {resultado.tipo} - {resultado.amostraNome}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="resultados" className="w-full">
                    <TabsList className="w-full md:w-auto justify-start">
                      <TabsTrigger value="resultados" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                        <FileBarChart2 className="h-4 w-4 mr-2" />
                        Resultados
                      </TabsTrigger>
                      <TabsTrigger value="metodos" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                        <FileCog className="h-4 w-4 mr-2" />
                        Metodologia
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="resultados" className="mt-4">
                      {resultado.resultados ? (
                        <div>
                          <h3 className="font-medium text-gray-700 mb-3">Valores quantificados:</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {Object.entries(resultado.resultados).map(([key, value]) => (
                              <div key={key} className="bg-gray-50 border rounded-md p-3">
                                <p className="text-xs text-gray-500">{key}</p>
                                <p className="text-lg font-medium">{typeof value === 'number' ? value.toFixed(2) : String(value)}%</p>
                              </div>
                            ))}
                          </div>
                          
                          {resultado.observacoes && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <h3 className="text-sm font-medium text-gray-700 mb-2">Observações técnicas:</h3>
                              <p className="text-sm text-gray-600">{resultado.observacoes}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6 border rounded-md bg-gray-50">
                          <FileBarChart2 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">Resultados ainda não disponíveis</p>
                          <p className="text-xs text-gray-400 mt-1">Análise em andamento</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="metodos" className="mt-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border rounded-md p-3">
                            <p className="text-xs text-gray-500 mb-1">Método de análise</p>
                            <p className="font-medium">{resultado.metodo || 'Não especificado'}</p>
                          </div>
                          <div className="border rounded-md p-3">
                            <p className="text-xs text-gray-500 mb-1">Procedimento operacional</p>
                            <p className="font-medium">{resultado.sop || 'Não especificado'}</p>
                          </div>
                          
                          <div className="border rounded-md p-3">
                            <p className="text-xs text-gray-500 mb-1">Lote da amostra</p>
                            <p className="font-medium">{resultado.lote || 'Não especificado'}</p>
                          </div>
                          <div className="border rounded-md p-3">
                            <p className="text-xs text-gray-500 mb-1">Equipamento utilizado</p>
                            <p className="font-medium">{resultado.equipamento || 'Não especificado'}</p>
                          </div>
                        </div>
                        
                        <div className="border rounded-md p-4 mt-4">
                          <h3 className="font-medium text-gray-700 mb-2">Etapas do processo analítico:</h3>
                          <ol className="space-y-2 ml-5 list-decimal text-sm text-gray-600">
                            <li>Preparação e homogeneização da amostra</li>
                            <li>Extração com solvente específico para canabinoides</li>
                            <li>Filtração e diluição da amostra</li>
                            <li>Análise cromatográfica utilizando método validado</li>
                            <li>Processamento dos dados usando software calibrado</li>
                            <li>Cálculo das concentrações com base nas curvas de calibração</li>
                            <li>Validação dos resultados pelo analista responsável</li>
                          </ol>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="pt-2 flex justify-end gap-4 text-xs text-gray-500 border-t">
                  <div className="flex items-center">
                    <Check className="h-3 w-3 text-green-500 mr-1" />
                    Verificado e aprovado
                  </div>
                  <div>
                    Última atualização: {formatarData(resultado.dataConclusao)}
                  </div>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Visualizações e Gráficos</CardTitle>
                  <CardDescription>
                    Representações visuais dos resultados analíticos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6 border rounded-md bg-gray-50">
                    <FileBarChart2 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Gráficos interativos em desenvolvimento</p>
                    <p className="text-xs text-gray-400 mt-1">Esta funcionalidade estará disponível em breve</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Informações da Análise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Data da análise</p>
                        <p className="font-medium">{formatarData(resultado.dataAnalise)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Microscope className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Equipamento</p>
                        <p className="font-medium">{resultado.equipamento}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Analista responsável</p>
                        <p className="font-medium">{resultado.analista || 'Não especificado'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Beaker className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Tipo de análise</p>
                        <p className="font-medium">{resultado.tipo}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Cronograma</p>
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Recebimento:</span>
                          <span className="font-medium">{formatarData(resultado.dataEntrada)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Análise:</span>
                          <span className="font-medium">{formatarData(resultado.dataAnalise)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Conclusão:</span>
                          <span className="font-medium">{formatarData(resultado.dataConclusao)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Documentos Relacionados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border rounded-md p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-blue-500 mr-2" />
                        <div>
                          <p className="font-medium text-sm">Relatório Completo</p>
                          <p className="text-xs text-gray-500">PDF - 2.4MB</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                    
                    <div className="flex items-center justify-between border rounded-md p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-green-500 mr-2" />
                        <div>
                          <p className="font-medium text-sm">Certificado de Análise</p>
                          <p className="text-xs text-gray-500">PDF - 1.1MB</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                    
                    <div className="flex items-center justify-between border rounded-md p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-amber-500 mr-2" />
                        <div>
                          <p className="font-medium text-sm">Dados Brutos</p>
                          <p className="text-xs text-gray-500">CSV - 0.8MB</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Amostra Relacionada</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md p-3 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setLocation(`/researcher/laboratorio/amostras/${resultado.amostraId}`)}>
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium">{resultado.amostraNome}</p>
                      <Badge variant="outline" className="ml-2">{resultado.amostraId}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">Lote: {resultado.lote || 'N/A'}</p>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm">
                        Ver detalhes
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
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