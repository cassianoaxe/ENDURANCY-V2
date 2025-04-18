import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import ResearcherLayout from '@/components/layout/researcher/ResearcherLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Search,
  Filter,
  Beaker,
  ArrowLeft,
  PlusCircle,
  Calendar,
  ChevronRight,
  CalendarClock,
  CheckCircle2,
  XCircle,
  CircleAlertIcon,
  Download
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Amostra {
  id: string;
  nome: string;
  tipo: string;
  status: string;
  dataEnvio: Date;
  resultadosPendentes: number;
  resultadosConcluidos: number;
  observacoes: string;
  lote?: string;
  origem?: string;
  responsavel?: string;
}

export default function AmostrasLaboratorio() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [visualizacao, setVisualizacao] = useState('todas');
  const [ordenacao, setOrdenacao] = useState({ campo: 'dataEnvio', direcao: 'desc' });
  const [amostras, setAmostras] = useState<Amostra[]>([]);

  useEffect(() => {
    // Simulação de carregamento para demonstração
    const timer = setTimeout(() => {
      // Dados de exemplo para demonstração
      setAmostras([
        {
          id: 'AM-2025-041',
          nome: 'Cannabis Sativa Strain A - Lote 001',
          tipo: 'Flor',
          status: 'em_analise',
          dataEnvio: new Date(2025, 3, 10),
          resultadosPendentes: 2,
          resultadosConcluidos: 1,
          observacoes: 'Amostra com alta concentração esperada de CBD',
          lote: 'LSA-2025-001',
          origem: 'Cultivo Interno',
          responsavel: 'Dra. Maria Silva'
        },
        {
          id: 'AM-2025-039',
          nome: 'Extrato de CBD 20% - Lote XR2',
          tipo: 'Extrato',
          status: 'concluida',
          dataEnvio: new Date(2025, 3, 8),
          resultadosPendentes: 0,
          resultadosConcluidos: 3,
          observacoes: 'Extrato utilizado para pesquisa de eficácia terapêutica',
          lote: 'EXT-2025-XR2',
          origem: 'Produção',
          responsavel: 'Dr. Carlos Mendes'
        },
        {
          id: 'AM-2025-038',
          nome: 'Óleo Full Spectrum - Lote 2025-05',
          tipo: 'Óleo',
          status: 'aguardando',
          dataEnvio: new Date(2025, 3, 6),
          resultadosPendentes: 3,
          resultadosConcluidos: 0,
          observacoes: 'Aguardando disponibilidade do laboratório',
          lote: 'OFS-2025-05',
          origem: 'Produção',
          responsavel: 'Dr. Carlos Mendes'
        },
        {
          id: 'AM-2025-037',
          nome: 'Cannabis Indica Strain B - Lote 002',
          tipo: 'Flor',
          status: 'concluida',
          dataEnvio: new Date(2025, 3, 5),
          resultadosPendentes: 0,
          resultadosConcluidos: 2,
          observacoes: 'Análise completa com resultados dentro do esperado',
          lote: 'LIB-2025-002',
          origem: 'Cultivo Interno',
          responsavel: 'Dra. Ana Ribeiro'
        },
        {
          id: 'AM-2025-036',
          nome: 'Tinturas CBD - Lote 2025-T12',
          tipo: 'Tintura',
          status: 'concluida',
          dataEnvio: new Date(2025, 3, 4),
          resultadosPendentes: 0,
          resultadosConcluidos: 3,
          observacoes: 'Análise de estabilidade da formulação',
          lote: 'TIN-2025-T12',
          origem: 'Produção',
          responsavel: 'Dr. Jorge Ferreira'
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

  const amostrasFiltradas = amostras
    .filter(amostra => {
      // Filtro de busca
      const termoBusca = filtro.toLowerCase();
      const correspondeAoBuscar = 
        amostra.id.toLowerCase().includes(termoBusca) ||
        amostra.nome.toLowerCase().includes(termoBusca) ||
        amostra.tipo.toLowerCase().includes(termoBusca) ||
        (amostra.lote && amostra.lote.toLowerCase().includes(termoBusca)) ||
        (amostra.responsavel && amostra.responsavel.toLowerCase().includes(termoBusca));
      
      // Filtro por tipo
      const correspondeTipo = visualizacao === 'todas' || amostra.status === visualizacao;
      
      return correspondeAoBuscar && correspondeTipo;
    })
    .sort((a, b) => {
      const campoOrdenacao = ordenacao.campo;
      
      // Tratar campos de data separadamente
      if (campoOrdenacao === 'dataEnvio') {
        const dataA = a.dataEnvio?.getTime() || 0;
        const dataB = b.dataEnvio?.getTime() || 0;
        
        return ordenacao.direcao === 'asc' ? dataA - dataB : dataB - dataA;
      }
      
      // Para outros campos, comparar como strings
      const valorA = String(a[campoOrdenacao as keyof Amostra] || '');
      const valorB = String(b[campoOrdenacao as keyof Amostra] || '');
      
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
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Amostras Laboratoriais</h1>
              </div>
              <p className="text-gray-500 mt-1 ml-10">Gerenciamento de amostras para análises</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setLocation('/researcher/laboratorio/amostras/nova')}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Nova Amostra
              </Button>
              <Button variant="outline" onClick={() => toast({ title: "Exportando amostras", description: "Os dados serão exportados em CSV" })}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
          
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
              ) : amostrasFiltradas.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead 
                          className="cursor-pointer hover:bg-muted"
                          onClick={() => handleOrdenacao('id')}
                        >
                          ID
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted"
                          onClick={() => handleOrdenacao('nome')}
                        >
                          Amostra
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted"
                          onClick={() => handleOrdenacao('tipo')}
                        >
                          Tipo
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted"
                          onClick={() => handleOrdenacao('dataEnvio')}
                        >
                          Data de Envio
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Resultados</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {amostrasFiltradas.map((amostra) => (
                        <TableRow 
                          key={amostra.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => setLocation(`/researcher/laboratorio/amostras/${amostra.id}`)}
                        >
                          <TableCell className="font-medium">{amostra.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{amostra.nome}</p>
                              <p className="text-xs text-gray-500">{amostra.lote || '-'}</p>
                            </div>
                          </TableCell>
                          <TableCell>{amostra.tipo}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                              {formatarData(amostra.dataEnvio)}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(amostra.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center text-green-600">
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                <span className="text-xs">{amostra.resultadosConcluidos}</span>
                              </div>
                              <div className="flex items-center text-amber-600">
                                <CalendarClock className="h-4 w-4 mr-1" />
                                <span className="text-xs">{amostra.resultadosPendentes}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLocation(`/researcher/laboratorio/amostras/${amostra.id}`);
                              }}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Beaker className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-gray-700 font-medium mb-1">Nenhuma amostra encontrada</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Não foram encontradas amostras com os critérios selecionados
                  </p>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => setLocation('/researcher/laboratorio/amostras/nova')}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Registrar Nova Amostra
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ResearcherLayout>
  );
}