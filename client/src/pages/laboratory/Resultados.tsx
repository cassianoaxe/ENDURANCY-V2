import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  BarChart,
  ChevronRight,
  CheckCircle2,
  Download,
  Eye,
  FileCheck,
  FileText,
  Filter,
  FlaskConical,
  LineChart,
  Microscope,
  Pencil,
  Search,
  Share2,
  SlidersHorizontal
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import LaboratoryLayout from '@/components/layout/laboratory/LaboratoryLayout';

// Definição dos tipos
interface AnalysisResult {
  id: number;
  sampleCode: string;
  sampleType: string;
  testType: string;
  clientName: string;
  analysisDate: string;
  status: 'draft' | 'in_review' | 'approved' | 'published';
  results: {
    [key: string]: {
      value: number;
      unit: string;
    };
  };
  technician: string;
  reviewedBy?: string;
}

interface CannabinoidResult {
  name: string;
  abbreviation: string;
  percentage: number;
  concentration: number;
}

export default function LaboratoryResultados() {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTestType, setSelectedTestType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('results');
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const { toast } = useToast();

  // Buscar resultados
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        // Na implementação real, isso seria uma chamada à API
        // const response = await apiRequest('/api/laboratory/results');
        // if (response.ok) {
        //   const data = await response.json();
        //   setResults(data);
        // }
        
        // Simulação com dados fictícios para desenvolvimento
        setTimeout(() => {
          setResults(mockResults);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Erro ao buscar resultados:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os resultados analíticos.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [toast]);

  // Filtragem de resultados
  const filteredResults = results.filter(result => {
    // Filtro de busca
    const matchesSearch = 
      searchQuery === '' || 
      result.sampleCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro de status
    const matchesStatus = 
      selectedStatus === 'all' || 
      result.status === selectedStatus;
    
    // Filtro de tipo de teste
    const matchesTestType = 
      selectedTestType === 'all' || 
      result.testType === selectedTestType;
    
    return matchesSearch && matchesStatus && matchesTestType;
  });

  // Funções auxiliares para tradução
  const translateStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'draft': 'Rascunho',
      'in_review': 'Em Revisão',
      'approved': 'Aprovado',
      'published': 'Publicado'
    };
    return statusMap[status] || status;
  };

  const translateTestType = (type: string) => {
    const typeMap: Record<string, string> = {
      'cannabinoid_profile': 'Perfil de Canabinoides',
      'terpene_profile': 'Perfil de Terpenos',
      'pesticides': 'Pesticidas',
      'heavy_metals': 'Metais Pesados',
      'microbials': 'Microbianos',
      'residual_solvents': 'Solventes Residuais',
      'potency': 'Potência'
    };
    return typeMap[type] || type;
  };

  const translateSampleType = (type: string) => {
    const typeMap: Record<string, string> = {
      'plant': 'Planta',
      'oil': 'Óleo',
      'extract': 'Extrato',
      'consumable': 'Produto Final',
      'topical': 'Tópico'
    };
    return typeMap[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'draft': 'bg-gray-500 hover:bg-gray-600',
      'in_review': 'bg-yellow-500 hover:bg-yellow-600',
      'approved': 'bg-green-500 hover:bg-green-600',
      'published': 'bg-blue-500 hover:bg-blue-600'
    };
    return colorMap[status] || 'bg-gray-500 hover:bg-gray-600';
  };

  // Função para visualizar um resultado específico
  const viewResult = (result: AnalysisResult) => {
    setSelectedResult(result);
    setShowResultDialog(true);
  };

  // Função para publicar um resultado
  const publishResult = (resultId: number) => {
    // Simulação da publicação
    toast({
      title: 'Resultado Publicado',
      description: 'O resultado analítico foi publicado com sucesso.',
    });
  };

  // Renderização condicional para carregamento
  if (isLoading) {
    return (
      <LaboratoryLayout>
        <div className="flex justify-center items-center h-[calc(100vh-150px)]">
          <div className="flex flex-col items-center">
            <FlaskConical className="h-12 w-12 animate-pulse text-blue-500 mb-2" />
            <p className="text-lg text-gray-600">Carregando resultados analíticos...</p>
          </div>
        </div>
      </LaboratoryLayout>
    );
  }

  return (
    <LaboratoryLayout>
      <div className="space-y-4 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Resultados Analíticos</h1>
          <div>
            <Button>
              <FileCheck className="h-4 w-4 mr-2" />
              Inserir Novo Resultado
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="results">Resultados</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="certificates">Certificados</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Resultados Analíticos</CardTitle>
                <CardDescription>
                  Gerencie os resultados de todas as análises realizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                  <div className="relative w-full md:w-auto flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por código ou cliente..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-gray-400" />
                      <Select
                        value={selectedStatus}
                        onValueChange={setSelectedStatus}
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os Status</SelectItem>
                          <SelectItem value="draft">Rascunho</SelectItem>
                          <SelectItem value="in_review">Em Revisão</SelectItem>
                          <SelectItem value="approved">Aprovado</SelectItem>
                          <SelectItem value="published">Publicado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <SlidersHorizontal className="h-4 w-4 text-gray-400" />
                      <Select
                        value={selectedTestType}
                        onValueChange={setSelectedTestType}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Tipo de Teste" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os Tipos</SelectItem>
                          <SelectItem value="cannabinoid_profile">Canabinoides</SelectItem>
                          <SelectItem value="terpene_profile">Terpenos</SelectItem>
                          <SelectItem value="pesticides">Pesticidas</SelectItem>
                          <SelectItem value="heavy_metals">Metais Pesados</SelectItem>
                          <SelectItem value="microbials">Microbianos</SelectItem>
                          <SelectItem value="residual_solvents">Solventes Residuais</SelectItem>
                          <SelectItem value="potency">Potência</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código da Amostra</TableHead>
                        <TableHead>Tipo de Teste</TableHead>
                        <TableHead className="hidden md:table-cell">Cliente</TableHead>
                        <TableHead className="hidden lg:table-cell">Data da Análise</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Responsável</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredResults.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            Nenhum resultado encontrado com os filtros atuais.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredResults.map((result) => (
                          <TableRow key={result.id}>
                            <TableCell className="font-medium">{result.sampleCode}</TableCell>
                            <TableCell>{translateTestType(result.testType)}</TableCell>
                            <TableCell className="hidden md:table-cell">{result.clientName}</TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {new Date(result.analysisDate).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(result.status)}`}>
                                {translateStatus(result.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{result.technician}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => viewResult(result)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                {result.status === 'approved' && (
                                  <Button variant="ghost" size="icon" onClick={() => publishResult(result.id)}>
                                    <Share2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-500">
                  Mostrando {filteredResults.length} de {results.length} resultados
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Lista
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Analíticos</CardTitle>
                <CardDescription>
                  Acesse e crie relatórios baseados nos resultados de análises
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <LineChart className="h-4 w-4 mr-2 text-blue-500" />
                          Canabinoides por Cliente
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-gray-500">Análise comparativa dos níveis de canabinoides por cliente</p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="ghost" size="sm" className="ml-auto">Acessar</Button>
                      </CardFooter>
                    </Card>

                    <Card className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <BarChart className="h-4 w-4 mr-2 text-green-500" />
                          Tendências Temporais
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-gray-500">Evolução dos resultados analíticos ao longo do tempo</p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="ghost" size="sm" className="ml-auto">Acessar</Button>
                      </CardFooter>
                    </Card>

                    <Card className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-purple-500" />
                          Conformidade Regulatória
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-gray-500">Relatórios de conformidade com limites regulatórios</p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="ghost" size="sm" className="ml-auto">Acessar</Button>
                      </CardFooter>
                    </Card>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <h3 className="font-medium">Relatórios Recentes</h3>
                    <Button variant="outline" size="sm">Todos os Relatórios</Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 border rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-blue-500" />
                        <div>
                          <div className="font-medium">Relatório Mensal de Canabinoides - Abril 2025</div>
                          <div className="text-sm text-gray-500">Gerado em 26/04/2025</div>
                        </div>
                      </div>
                      <Button size="sm">Visualizar</Button>
                    </div>

                    <div className="flex justify-between items-center p-3 border rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-green-500" />
                        <div>
                          <div className="font-medium">Comparativo Trimestral - Q1 2025</div>
                          <div className="text-sm text-gray-500">Gerado em 15/04/2025</div>
                        </div>
                      </div>
                      <Button size="sm">Visualizar</Button>
                    </div>

                    <div className="flex justify-between items-center p-3 border rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-purple-500" />
                        <div>
                          <div className="font-medium">Análise de Tendências - Terpenos</div>
                          <div className="text-sm text-gray-500">Gerado em 20/04/2025</div>
                        </div>
                      </div>
                      <Button size="sm">Visualizar</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Certificados de Análise</CardTitle>
                <CardDescription>
                  Gerencie e emita certificados oficiais para as análises realizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                    <div className="relative w-full md:w-auto flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar certificados..."
                        className="pl-8"
                      />
                    </div>

                    <Button>
                      <FileCheck className="h-4 w-4 mr-2" />
                      Novo Certificado
                    </Button>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nº Certificado</TableHead>
                          <TableHead>Amostra</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead className="hidden md:table-cell">Data de Emissão</TableHead>
                          <TableHead className="hidden lg:table-cell">Validade</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">CERT-001-25</TableCell>
                          <TableCell>LAB-003-25</TableCell>
                          <TableCell>CBD Brasil Cultivo</TableCell>
                          <TableCell className="hidden md:table-cell">25/04/2025</TableCell>
                          <TableCell className="hidden lg:table-cell">25/04/2026</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm">Visualizar</Button>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">CERT-002-25</TableCell>
                          <TableCell>LAB-010-25</TableCell>
                          <TableCell>Importadora CanaTrade</TableCell>
                          <TableCell className="hidden md:table-cell">23/04/2025</TableCell>
                          <TableCell className="hidden lg:table-cell">23/04/2026</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm">Visualizar</Button>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">CERT-003-25</TableCell>
                          <TableCell>LAB-004-25</TableCell>
                          <TableCell>Vida Verde Produtos</TableCell>
                          <TableCell className="hidden md:table-cell">22/04/2025</TableCell>
                          <TableCell className="hidden lg:table-cell">22/04/2026</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm">Visualizar</Button>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Diálogo para visualização de resultados */}
      {selectedResult && (
        <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Resultado da Análise</DialogTitle>
              <DialogDescription>
                Detalhes do resultado analítico para a amostra {selectedResult.sampleCode}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Código da Amostra</p>
                  <p className="font-medium">{selectedResult.sampleCode}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Tipo de Amostra</p>
                  <p className="font-medium">{translateSampleType(selectedResult.sampleType)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Tipo de Teste</p>
                  <p className="font-medium">{translateTestType(selectedResult.testType)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Cliente</p>
                  <p className="font-medium">{selectedResult.clientName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Data da Análise</p>
                  <p className="font-medium">{new Date(selectedResult.analysisDate).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge className={`${getStatusColor(selectedResult.status)}`}>
                    {translateStatus(selectedResult.status)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Realizado por</p>
                  <p className="font-medium">{selectedResult.technician}</p>
                </div>
                {selectedResult.reviewedBy && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Revisado por</p>
                    <p className="font-medium">{selectedResult.reviewedBy}</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-lg mb-3">Resultados Detalhados</h3>
                
                {selectedResult.testType === 'cannabinoid_profile' && (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Canabinoide</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Abreviação</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentual (%)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concentração (mg/g)</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedResult.testType === 'cannabinoid_profile' && cannabinoidResults.map((cb, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">{cb.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{cb.abbreviation}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{cb.percentage.toFixed(2)}%</td>
                              <td className="px-6 py-4 whitespace-nowrap">{cb.concentration.toFixed(2)} mg/g</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="pt-4">
                      <h4 className="font-medium mb-2">Distribuição de Canabinoides</h4>
                      <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
                        <p className="text-gray-500">[Gráfico de distribuição de canabinoides]</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedResult.testType === 'terpene_profile' && (
                  <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
                    <p className="text-gray-500">[Gráfico de perfil de terpenos]</p>
                  </div>
                )}

                {selectedResult.testType === 'heavy_metals' && (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metal</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resultado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidade</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Limite</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">Arsênico (As)</td>
                        <td className="px-6 py-4 whitespace-nowrap">0.05</td>
                        <td className="px-6 py-4 whitespace-nowrap">ppm</td>
                        <td className="px-6 py-4 whitespace-nowrap">0.2</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className="bg-green-500">Aprovado</Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">Cádmio (Cd)</td>
                        <td className="px-6 py-4 whitespace-nowrap">0.02</td>
                        <td className="px-6 py-4 whitespace-nowrap">ppm</td>
                        <td className="px-6 py-4 whitespace-nowrap">0.2</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className="bg-green-500">Aprovado</Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">Chumbo (Pb)</td>
                        <td className="px-6 py-4 whitespace-nowrap">0.10</td>
                        <td className="px-6 py-4 whitespace-nowrap">ppm</td>
                        <td className="px-6 py-4 whitespace-nowrap">0.5</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className="bg-green-500">Aprovado</Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">Mercúrio (Hg)</td>
                        <td className="px-6 py-4 whitespace-nowrap">0.01</td>
                        <td className="px-6 py-4 whitespace-nowrap">ppm</td>
                        <td className="px-6 py-4 whitespace-nowrap">0.1</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className="bg-green-500">Aprovado</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-lg mb-3">Observações</h3>
                <p className="text-gray-700">
                  Análise realizada conforme metodologia interna LAB-M-001, baseada nas diretrizes AOAC 2018.11.
                  Os resultados se aplicam exclusivamente à amostra analisada.
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
              
              {selectedResult.status === 'draft' && (
                <Button>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar Resultado
                </Button>
              )}
              
              {selectedResult.status === 'in_review' && (
                <Button>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Aprovar
                </Button>
              )}
              
              {selectedResult.status === 'approved' && (
                <Button>
                  <Share2 className="h-4 w-4 mr-2" />
                  Publicar
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </LaboratoryLayout>
  );
}

// Dados fictícios para desenvolvimento
const mockResults: AnalysisResult[] = [
  {
    id: 1,
    sampleCode: 'LAB-001-25',
    sampleType: 'plant',
    testType: 'cannabinoid_profile',
    clientName: 'Associação MedCanna',
    analysisDate: '2025-04-25',
    status: 'approved',
    results: {
      THC: { value: 0.3, unit: '%' },
      CBD: { value: 15.2, unit: '%' },
      CBG: { value: 1.2, unit: '%' }
    },
    technician: 'Ana Silva',
    reviewedBy: 'Carlos Mendes'
  },
  {
    id: 2,
    sampleCode: 'LAB-002-25',
    sampleType: 'oil',
    testType: 'cannabinoid_profile',
    clientName: 'Farmácia Medigreen',
    analysisDate: '2025-04-24',
    status: 'in_review',
    results: {
      THC: { value: 0.1, unit: '%' },
      CBD: { value: 10.5, unit: '%' }
    },
    technician: 'Pedro Alves'
  },
  {
    id: 3,
    sampleCode: 'LAB-003-25',
    sampleType: 'extract',
    testType: 'terpene_profile',
    clientName: 'CBD Brasil Cultivo',
    analysisDate: '2025-04-22',
    status: 'published',
    results: {
      Myrcene: { value: 0.5, unit: '%' },
      Limonene: { value: 0.3, unit: '%' },
      Pinene: { value: 0.2, unit: '%' }
    },
    technician: 'Mariana Costa',
    reviewedBy: 'Carlos Mendes'
  },
  {
    id: 4,
    sampleCode: 'LAB-004-25',
    sampleType: 'consumable',
    testType: 'heavy_metals',
    clientName: 'Vida Verde Produtos',
    analysisDate: '2025-04-21',
    status: 'draft',
    results: {
      Lead: { value: 0.01, unit: 'ppm' },
      Mercury: { value: 0.005, unit: 'ppm' },
      Arsenic: { value: 0.01, unit: 'ppm' },
      Cadmium: { value: 0.02, unit: 'ppm' }
    },
    technician: 'Pedro Alves'
  },
  {
    id: 5,
    sampleCode: 'LAB-005-25',
    sampleType: 'plant',
    testType: 'pesticides',
    clientName: 'Associação MedCanna',
    analysisDate: '2025-04-20',
    status: 'approved',
    results: {
      Pesticide1: { value: 0.001, unit: 'ppm' },
      Pesticide2: { value: 0.0, unit: 'ppm' }
    },
    technician: 'Ana Silva',
    reviewedBy: 'Carlos Mendes'
  },
  {
    id: 6,
    sampleCode: 'LAB-006-25',
    sampleType: 'oil',
    testType: 'residual_solvents',
    clientName: 'Importadora CanaTrade',
    analysisDate: '2025-04-19',
    status: 'published',
    results: {
      Ethanol: { value: 50, unit: 'ppm' },
      Butane: { value: 0, unit: 'ppm' }
    },
    technician: 'Juliana Ferreira',
    reviewedBy: 'Ana Silva'
  },
  {
    id: 7,
    sampleCode: 'LAB-007-25',
    sampleType: 'consumable',
    testType: 'microbials',
    clientName: 'CBD Brasil Cultivo',
    analysisDate: '2025-04-18',
    status: 'in_review',
    results: {
      TotalYeastMold: { value: 10, unit: 'CFU/g' },
      TotalAerobicCount: { value: 100, unit: 'CFU/g' },
      EColi: { value: 0, unit: 'CFU/g' }
    },
    technician: 'Pedro Alves'
  },
  {
    id: 8,
    sampleCode: 'LAB-008-25',
    sampleType: 'extract',
    testType: 'potency',
    clientName: 'Farmácia Medigreen',
    analysisDate: '2025-04-17',
    status: 'draft',
    results: {
      THC: { value: 0.2, unit: '%' },
      CBD: { value: 25.5, unit: '%' }
    },
    technician: 'Mariana Costa'
  },
  {
    id: 9,
    sampleCode: 'LAB-009-25',
    sampleType: 'topical',
    testType: 'cannabinoid_profile',
    clientName: 'Vida Verde Produtos',
    analysisDate: '2025-04-16',
    status: 'published',
    results: {
      THC: { value: 0.05, unit: '%' },
      CBD: { value: 2.5, unit: '%' },
      CBG: { value: 0.1, unit: '%' }
    },
    technician: 'Ana Silva',
    reviewedBy: 'Carlos Mendes'
  },
  {
    id: 10,
    sampleCode: 'LAB-010-25',
    sampleType: 'plant',
    testType: 'cannabinoid_profile',
    clientName: 'Importadora CanaTrade',
    analysisDate: '2025-04-15',
    status: 'approved',
    results: {
      THC: { value: 0.15, unit: '%' },
      CBD: { value: 18.7, unit: '%' },
      CBG: { value: 0.8, unit: '%' },
      CBC: { value: 0.3, unit: '%' }
    },
    technician: 'Juliana Ferreira',
    reviewedBy: 'Ana Silva'
  }
];

// Dados para detalhamento do perfil de canabinoides
const cannabinoidResults: CannabinoidResult[] = [
  { name: 'Canabidiol', abbreviation: 'CBD', percentage: 15.2, concentration: 152 },
  { name: 'Canabidiol Ácido', abbreviation: 'CBDA', percentage: 0.8, concentration: 8 },
  { name: 'Canabinol', abbreviation: 'CBN', percentage: 0.1, concentration: 1 },
  { name: 'Tetrahidrocanabinol', abbreviation: 'THC', percentage: 0.2, concentration: 2 },
  { name: 'Tetrahidrocanabinol Ácido', abbreviation: 'THCA', percentage: 0.1, concentration: 1 },
  { name: 'Canabicromeno', abbreviation: 'CBC', percentage: 0.5, concentration: 5 },
  { name: 'Canabigerol', abbreviation: 'CBG', percentage: 1.2, concentration: 12 },
  { name: 'Canabigerol Ácido', abbreviation: 'CBGA', percentage: 0.3, concentration: 3 },
  { name: 'Total de Canabinoides', abbreviation: 'Total', percentage: 18.4, concentration: 184 }
];