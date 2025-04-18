import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import ResearcherLayout from '@/components/layout/researcher/ResearcherLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Search,
  FileText,
  Calendar,
  ArrowLeft,
  Download,
  Filter,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
}

export default function ResultadosLaboratorio() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [ordenacao, setOrdenacao] = useState({ campo: 'dataAnalise', direcao: 'desc' });

  useEffect(() => {
    // Simulação de carregamento para demonstração
    const timer = setTimeout(() => {
      // Dados de exemplo para demonstração
      setResultados([
        {
          id: 'RES-2025-067',
          amostraId: 'AM-2025-041',
          amostraNome: 'Cannabis Sativa Strain A - Lote 001',
          tipo: 'Teor de Canabinoides',
          status: 'concluido',
          dataAnalise: new Date(2025, 3, 11),
          equipamento: 'HPLC-001',
          analista: 'Dr. Carlos Mendes',
          metodo: 'USP <467>',
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
          analista: 'Dra. Maria Silva',
          metodo: 'Headspace GC-MS',
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
          analista: 'Dr. Carlos Mendes',
          metodo: 'USP <467>',
          resultados: {
            CBD: 20.3,
            THC: 0.1,
            CBG: 0.4,
            CBN: 0.05,
          }
        },
        {
          id: 'RES-2025-064',
          amostraId: 'AM-2025-039',
          amostraNome: 'Extrato de CBD 20% - Lote XR2',
          tipo: 'Metais Pesados',
          status: 'concluido',
          dataAnalise: new Date(2025, 3, 7),
          equipamento: 'ICP-001',
          analista: 'Dra. Ana Ribeiro',
          metodo: 'ICP-MS USP <233>',
          resultados: {
            'Arsênico': 0.01,
            'Chumbo': 0.02,
            'Cádmio': 0.00,
            'Mercúrio': 0.00,
          }
        },
        {
          id: 'RES-2025-063',
          amostraId: 'AM-2025-039',
          amostraNome: 'Extrato de CBD 20% - Lote XR2',
          tipo: 'Microbiológico',
          status: 'concluido',
          dataAnalise: new Date(2025, 3, 8),
          equipamento: 'MICRO-002',
          analista: 'Dr. Jorge Ferreira',
          metodo: 'USP <61> e <62>',
          resultados: {
            'Contagem Total': 10,
            'Bolores e Leveduras': 0,
            'E. Coli': 0,
            'Salmonella': 0,
          }
        }
      ]);

      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, JSX.Element> = {
      'concluido': <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Concluído</Badge>,
      'em_andamento': <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Em andamento</Badge>,
      'pendente': <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pendente</Badge>,
      'cancelado': <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Cancelado</Badge>,
    };
    
    return statusMap[status] || <Badge>Desconhecido</Badge>;
  };

  const formatarData = (data: Date) => {
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

  const resultadosFiltrados = resultados
    .filter(resultado => {
      // Filtro de busca
      const termoBusca = filtro.toLowerCase();
      const correspondeAoBuscar = 
        resultado.id.toLowerCase().includes(termoBusca) ||
        resultado.amostraId.toLowerCase().includes(termoBusca) ||
        resultado.amostraNome.toLowerCase().includes(termoBusca) ||
        resultado.tipo.toLowerCase().includes(termoBusca) ||
        (resultado.analista && resultado.analista.toLowerCase().includes(termoBusca));
      
      // Filtro por tipo
      const correspondeTipo = tipoFiltro === 'todos' || resultado.status === tipoFiltro;
      
      return correspondeAoBuscar && correspondeTipo;
    })
    .sort((a, b) => {
      const campoOrdenacao = ordenacao.campo;
      
      // Tratar campos de data separadamente
      if (campoOrdenacao === 'dataAnalise') {
        const dataA = a.dataAnalise?.getTime() || 0;
        const dataB = b.dataAnalise?.getTime() || 0;
        
        return ordenacao.direcao === 'asc' ? dataA - dataB : dataB - dataA;
      }
      
      // Para outros campos, comparar como strings
      const valorA = String(a[campoOrdenacao as keyof Resultado] || '');
      const valorB = String(b[campoOrdenacao as keyof Resultado] || '');
      
      if (ordenacao.direcao === 'asc') {
        return valorA.localeCompare(valorB);
      } else {
        return valorB.localeCompare(valorA);
      }
    });

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
                  onClick={() => setLocation('/researcher/laboratorio')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Resultados das Análises</h1>
              </div>
              <p className="text-gray-500 mt-1 ml-10">Consulte todos os resultados de análises laboratoriais</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => toast({ title: "Exportando resultados", description: "Os resultados serão exportados em CSV" })}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Dados
              </Button>
            </div>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Histórico de Resultados</CardTitle>
              <CardDescription>
                Lista completa dos resultados de análises laboratoriais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
                <div className="relative max-w-md">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input 
                    placeholder="Buscar resultados..." 
                    className="pl-10" 
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="tipoFiltro">Status:</Label>
                  <select 
                    id="tipoFiltro" 
                    value={tipoFiltro}
                    onChange={(e) => setTipoFiltro(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="todos">Todos os status</option>
                    <option value="concluido">Concluídos</option>
                    <option value="em_andamento">Em andamento</option>
                    <option value="pendente">Pendentes</option>
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
              ) : resultadosFiltrados.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead 
                          className="cursor-pointer hover:bg-muted"
                          onClick={() => handleOrdenacao('id')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>ID</span>
                            {ordenacao.campo === 'id' && (
                              <ChevronDown 
                                className={`h-4 w-4 ${ordenacao.direcao === 'desc' ? 'transform rotate-180' : ''}`} 
                              />
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted"
                          onClick={() => handleOrdenacao('amostraNome')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Amostra</span>
                            {ordenacao.campo === 'amostraNome' && (
                              <ChevronDown 
                                className={`h-4 w-4 ${ordenacao.direcao === 'desc' ? 'transform rotate-180' : ''}`} 
                              />
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted"
                          onClick={() => handleOrdenacao('tipo')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Tipo</span>
                            {ordenacao.campo === 'tipo' && (
                              <ChevronDown 
                                className={`h-4 w-4 ${ordenacao.direcao === 'desc' ? 'transform rotate-180' : ''}`} 
                              />
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted"
                          onClick={() => handleOrdenacao('dataAnalise')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Data</span>
                            {ordenacao.campo === 'dataAnalise' && (
                              <ChevronDown 
                                className={`h-4 w-4 ${ordenacao.direcao === 'desc' ? 'transform rotate-180' : ''}`} 
                              />
                            )}
                          </div>
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resultadosFiltrados.map((resultado) => (
                        <TableRow 
                          key={resultado.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => setLocation(`/researcher/laboratorio/resultados/${resultado.id}`)}
                        >
                          <TableCell className="font-medium">{resultado.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{resultado.amostraNome}</p>
                              <p className="text-xs text-gray-500">{resultado.amostraId}</p>
                            </div>
                          </TableCell>
                          <TableCell>{resultado.tipo}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                              {formatarData(resultado.dataAnalise)}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(resultado.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toast({ 
                                    title: "Relatório gerado", 
                                    description: `Relatório para ${resultado.id} baixado com sucesso` 
                                  });
                                }}
                              >
                                <FileText className="h-4 w-4 text-gray-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-gray-700 font-medium mb-1">Nenhum resultado encontrado</h3>
                  <p className="text-gray-500 text-sm">
                    Não foram encontrados resultados com os critérios selecionados.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ResearcherLayout>
  );
}