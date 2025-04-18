import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Beaker,
  Search,
  PlusCircle,
  CheckCircle2,
  CalendarClock,
  ChevronRight,
  CircleAlertIcon,
  Filter,
} from 'lucide-react';

export default function AmostrasList() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [visualizacao, setVisualizacao] = useState('todas');
  const [amostras, setAmostras] = useState<any[]>([]);

  // Exemplo de dados para simulação
  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => {
      // Carregar dados da API
      fetch('/api/laboratorio/amostras')
        .then(res => {
          if (!res.ok) {
            throw new Error('Erro ao carregar amostras');
          }
          return res.json();
        })
        .then(data => {
          setAmostras(data || []);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Erro ao carregar amostras:', error);
          // Dados de exemplo fallback
          setAmostras([
            {
              id: 'AM-2025-041',
              nome: 'Cannabis Sativa Strain A - Lote 001',
              tipo: 'Flor',
              status: 'em_analise',
              dataEnvio: new Date(2025, 3, 10).toISOString(),
              resultadosPendentes: 2,
              resultadosConcluidos: 1,
              observacoes: 'Amostra com alta concentração esperada de CBD'
            },
            {
              id: 'AM-2025-039',
              nome: 'Extrato de CBD 20% - Lote XR2',
              tipo: 'Extrato',
              status: 'concluida',
              dataEnvio: new Date(2025, 3, 8).toISOString(),
              resultadosPendentes: 0,
              resultadosConcluidos: 3,
              observacoes: 'Extrato utilizado para pesquisa de eficácia terapêutica'
            },
            {
              id: 'AM-2025-038',
              nome: 'Óleo Full Spectrum - Lote 2025-05',
              tipo: 'Óleo',
              status: 'aguardando',
              dataEnvio: new Date(2025, 3, 6).toISOString(),
              resultadosPendentes: 3,
              resultadosConcluidos: 0,
              observacoes: 'Aguardando disponibilidade do laboratório'
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
      'em_analise': <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Em análise</Badge>,
      'concluida': <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Concluída</Badge>,
      'aguardando': <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Aguardando</Badge>,
      'cancelada': <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Cancelada</Badge>,
    };
    
    return statusMap[status] || <Badge>Desconhecido</Badge>;
  };

  const formatarData = (dataString: string) => {
    if (!dataString) return 'N/A';
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="container p-4 mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Amostras</h1>
            <p className="text-gray-500 mt-1">Gerencie amostras enviadas para análise laboratorial</p>
          </div>
            
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setLocation('/researcher/laboratorio/amostras/nova')} className="bg-green-600 hover:bg-green-700">
                <PlusCircle className="h-4 w-4 mr-2" />
                Nova Amostra
              </Button>
              <Button variant="outline" onClick={() => setLocation('/researcher/laboratorio')}>
                <ChevronRight className="h-4 w-4 mr-2" />
                Voltar para Laboratório
              </Button>
            </div>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Amostras para Análise</CardTitle>
              <CardDescription>
                Visualização e gerenciamento de todas as amostras enviadas para análise
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
                          <div className="flex items-center gap-4">
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
        </div>
      </div>
  );
}