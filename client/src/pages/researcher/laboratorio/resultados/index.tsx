import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  ChevronRight,
  FileText,
  Download,
  Microscope,
  ClipboardList,
  CalendarDays,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function ResultadosList() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);

  // Exemplo de dados para simulação
  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => {
      // Carregar dados da API
      fetch('/api/laboratorio/resultados')
        .then(res => {
          if (!res.ok) {
            throw new Error('Erro ao carregar resultados');
          }
          return res.json();
        })
        .then(data => {
          setResultados(data || []);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Erro ao carregar resultados:', error);
          // Dados de exemplo fallback
          setResultados([
            {
              id: 'RES-2025-067',
              amostraId: 'AM-2025-041',
              amostraNome: 'Cannabis Sativa Strain A - Lote 001',
              tipo: 'Teor de Canabinoides',
              status: 'concluido',
              dataAnalise: new Date(2025, 3, 11).toISOString(),
              equipamento: 'HPLC-001',
              equipamentoNome: 'HPLC Agilent 1260 Infinity II',
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
              dataAnalise: new Date(2025, 3, 12).toISOString(),
              equipamento: 'GC-003',
              equipamentoNome: 'GC-MS Shimadzu GCMS-QP2020 NX',
              resultados: null
            },
            {
              id: 'RES-2025-065',
              amostraId: 'AM-2025-039',
              amostraNome: 'Extrato de CBD 20% - Lote XR2',
              tipo: 'Teor de Canabinoides',
              status: 'concluido',
              dataAnalise: new Date(2025, 3, 9).toISOString(),
              equipamento: 'HPLC-001',
              equipamentoNome: 'HPLC Agilent 1260 Infinity II',
              resultados: {
                CBD: 20.3,
                THC: 0.1,
                CBG: 0.4,
                CBN: 0.05,
              }
            }
          ]);
          setIsLoading(false);
          toast({
            title: "Aviso",
            description: "Usando dados de demonstração",
            variant: "default"
          });
        });
    }, 1000);

    return () => clearTimeout(timer);
  }, [toast]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, JSX.Element> = {
      'concluido': <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Concluído</Badge>,
      'em_andamento': <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Em andamento</Badge>,
      'pendente': <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pendente</Badge>,
      'cancelado': <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Cancelado</Badge>,
    };
    
    return statusMap[status] || <Badge>Desconhecido</Badge>;
  };

  const formatarData = (dataString: string) => {
    if (!dataString) return 'N/A';
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  const renderResultadosPreview = (resultados: any) => {
    if (!resultados) return null;
    
    return (
      <div className="grid grid-cols-2 gap-2 text-xs mt-1">
        {Object.entries(resultados).map(([key, value]) => (
          <div key={key} className="bg-gray-50 p-1 rounded flex justify-between">
            <span className="font-medium">{key}:</span>
            <span>{value}%</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container p-4 mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Resultados</h1>
            <p className="text-gray-500 mt-1">Resultados de análises laboratoriais</p>
          </div>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => setLocation('/researcher/laboratorio')}>
                <ChevronRight className="h-4 w-4 mr-2" />
                Voltar para Laboratório
              </Button>
            </div>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Lista de Resultados</CardTitle>
              <CardDescription>
                Resultados de análises de todas as amostras
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
                    .filter(resultado => 
                      filtro === '' || 
                      resultado.amostraNome.toLowerCase().includes(filtro.toLowerCase()) ||
                      resultado.id.toLowerCase().includes(filtro.toLowerCase()) ||
                      resultado.tipo.toLowerCase().includes(filtro.toLowerCase())
                    )
                    .map((resultado) => (
                      <div 
                        key={resultado.id} 
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setLocation(`/researcher/laboratorio/resultados/${resultado.id}`)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900 flex items-center">
                              {resultado.tipo}
                            </h3>
                            <p className="text-sm text-gray-500 mb-1">
                              {resultado.id} • Amostra: {resultado.amostraNome}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            {getStatusBadge(resultado.status)}
                            <span className="text-xs text-gray-500 mt-1">
                              Análise em {formatarData(resultado.dataAnalise)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Microscope className="h-4 w-4 text-purple-600" />
                            <span className="text-gray-600">{resultado.equipamentoNome}</span>
                          </div>
                          
                          {resultado.status === 'concluido' && renderResultadosPreview(resultado.resultados)}
                          
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center gap-1 text-sm">
                              {resultado.status === 'concluido' ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Clock className="h-4 w-4 text-amber-600" />
                              )}
                              <span className={resultado.status === 'concluido' ? 'text-green-600' : 'text-amber-600'}>
                                {resultado.status === 'concluido' ? 'Concluído' : 'Em andamento'}
                              </span>
                            </div>
                            
                            {resultado.status === 'concluido' && (
                              <Button size="sm" variant="outline" className="h-8 px-2 text-blue-600 border-blue-200">
                                <Download className="h-3 w-3 mr-1" />
                                Baixar PDF
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-gray-700 font-medium mb-1">Nenhum resultado encontrado</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Não existem resultados de análises disponíveis no momento
                  </p>
                  <Button variant="outline" onClick={() => setLocation('/researcher/laboratorio/amostras')}>
                    Ver amostras
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  );
}