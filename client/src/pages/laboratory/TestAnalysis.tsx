import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  FileCheck, 
  FileText, 
  FlaskConical, 
  Info, 
  LineChart, 
  PieChart, 
  Share2, 
  Shield, 
  ThumbsUp, 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LaboratoryLayout from '@/components/layout/laboratory/LaboratoryLayout';

// Types
interface AnalysisResult {
  id: string;
  sampleCode: string;
  testType: string;
  status: 'complete' | 'pending' | 'in_progress' | 'rejected';
  date: string;
  technician: string;
  reviewer?: string;
  reviewDate?: string;
  results: Record<string, TestResultValue>;
  limits?: Record<string, TestResultLimit>;
  notes?: string;
  equipmentUsed: string[];
  methodsUsed: string[];
  controlSample?: boolean;
  batchId?: string;
}

interface TestResultValue {
  value: number;
  unit: string;
  uncertainty?: number;
  status?: 'normal' | 'warning' | 'critical';
}

interface TestResultLimit {
  min?: number;
  max?: number;
  unit: string;
}

// Mock Data - In a real app, this would come from an API
const mockAnalysisData: AnalysisResult = {
  id: 'TEST-12345',
  sampleCode: 'SAMPLE-001-25',
  testType: 'cannabinoid_profile',
  status: 'complete',
  date: '2025-04-20',
  technician: 'Ana Silva',
  reviewer: 'Carlos Mendes',
  reviewDate: '2025-04-22',
  results: {
    'THC': { value: 0.25, unit: '%', uncertainty: 0.02, status: 'normal' },
    'CBD': { value: 15.8, unit: '%', uncertainty: 0.3, status: 'normal' },
    'CBG': { value: 1.2, unit: '%', uncertainty: 0.05, status: 'normal' },
    'CBN': { value: 0.1, unit: '%', uncertainty: 0.01, status: 'normal' },
    'CBC': { value: 0.5, unit: '%', uncertainty: 0.03, status: 'normal' },
    'THCA': { value: 0.1, unit: '%', uncertainty: 0.01, status: 'normal' },
    'CBDA': { value: 0.8, unit: '%', uncertainty: 0.04, status: 'normal' },
    'CBGA': { value: 0.3, unit: '%', uncertainty: 0.02, status: 'normal' }
  },
  limits: {
    'THC': { max: 0.3, unit: '%' },
    'CBD': { min: 5.0, unit: '%' }
  },
  notes: 'Amostra apresentou excelente perfil de canabinoides, com alta concentração de CBD conforme esperado para esta variedade. Todos os parâmetros estão dentro dos limites estabelecidos.',
  equipmentUsed: ['HPLC-01', 'Balança Analítica'],
  methodsUsed: ['MET-CAN-001 v2.1', 'Preparação de Amostra PRA-001 v1.0'],
  controlSample: true,
  batchId: 'BATCH-2025-042'
};

// Component for detailed test analysis view
export default function TestAnalysis() {
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('results');
  const { toast } = useToast();

  // Fetch data
  useEffect(() => {
    // In a real application, this would be an API call
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Simulating API call with timeout
        setTimeout(() => {
          setAnalysisData(mockAnalysisData);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching analysis data:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados de análise.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Generate a PDF report
  const generateReport = () => {
    toast({
      title: 'Relatório gerado',
      description: 'O relatório completo foi gerado e está pronto para download.',
    });
  };

  // Share results with client
  const shareResults = () => {
    toast({
      title: 'Resultados compartilhados',
      description: 'Os resultados foram compartilhados com o cliente por email.',
    });
  };

  // Approve results (if in review)
  const approveResults = () => {
    toast({
      title: 'Resultados aprovados',
      description: 'Os resultados foram aprovados e estão prontos para publicação.',
    });
  };

  // Function to determine status color
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'complete': 'bg-green-500 hover:bg-green-600',
      'pending': 'bg-yellow-500 hover:bg-yellow-600',
      'in_progress': 'bg-blue-500 hover:bg-blue-600',
      'rejected': 'bg-red-500 hover:bg-red-600'
    };
    return statusMap[status] || 'bg-gray-500 hover:bg-gray-600';
  };

  // Function to translate status
  const translateStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'complete': 'Completo',
      'pending': 'Pendente',
      'in_progress': 'Em Progresso',
      'rejected': 'Rejeitado'
    };
    return statusMap[status] || status;
  };

  // Loading state
  if (isLoading) {
    return (
      <LaboratoryLayout>
        <div className="flex justify-center items-center h-[calc(100vh-150px)]">
          <div className="flex flex-col items-center">
            <FlaskConical className="h-12 w-12 animate-pulse text-blue-500 mb-2" />
            <p className="text-lg text-gray-600">Carregando dados de análise...</p>
          </div>
        </div>
      </LaboratoryLayout>
    );
  }

  // Error state
  if (!analysisData) {
    return (
      <LaboratoryLayout>
        <div className="p-6">
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Não foi possível carregar os dados de análise. Por favor, tente novamente mais tarde.
            </AlertDescription>
          </Alert>
          <Button className="mt-4" onClick={() => window.history.back()}>
            Voltar
          </Button>
        </div>
      </LaboratoryLayout>
    );
  }

  return (
    <LaboratoryLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <FlaskConical className="mr-2 h-6 w-6 text-blue-600" />
              Análise Detalhada
            </h1>
            <p className="text-gray-500">
              {analysisData.testType === 'cannabinoid_profile' 
                ? 'Perfil de Canabinoides' 
                : analysisData.testType}
              {' - '}
              Amostra {analysisData.sampleCode}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge className={getStatusColor(analysisData.status)}>
              {translateStatus(analysisData.status)}
            </Badge>
            
            <Button variant="outline" size="sm" onClick={generateReport}>
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            
            <Button variant="outline" size="sm" onClick={shareResults}>
              <Share2 className="mr-2 h-4 w-4" />
              Compartilhar
            </Button>
            
            {analysisData.status === 'pending' && (
              <Button size="sm" onClick={approveResults}>
                <ThumbsUp className="mr-2 h-4 w-4" />
                Aprovar
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full md:w-auto">
            <TabsTrigger value="results">Resultados</TabsTrigger>
            <TabsTrigger value="metadata">Metadados</TabsTrigger>
            <TabsTrigger value="visualization">Visualização</TabsTrigger>
          </TabsList>
          
          {/* Results Tab */}
          <TabsContent value="results" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resultados da Análise</CardTitle>
                <CardDescription>
                  Resultados detalhados da análise realizada em {new Date(analysisData.date).toLocaleDateString('pt-BR')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left border-b">Componente</th>
                        <th className="px-4 py-2 text-left border-b">Resultado</th>
                        <th className="px-4 py-2 text-left border-b">Unidade</th>
                        <th className="px-4 py-2 text-left border-b">Incerteza</th>
                        <th className="px-4 py-2 text-left border-b">Limites</th>
                        <th className="px-4 py-2 text-left border-b">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(analysisData.results).map(([component, result]) => (
                        <tr key={component} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{component}</td>
                          <td className="px-4 py-3">{result.value.toFixed(2)}</td>
                          <td className="px-4 py-3">{result.unit}</td>
                          <td className="px-4 py-3">
                            {result.uncertainty 
                              ? `± ${result.uncertainty.toFixed(2)} ${result.unit}` 
                              : '-'}
                          </td>
                          <td className="px-4 py-3">
                            {analysisData.limits && analysisData.limits[component] 
                              ? <>
                                  {analysisData.limits[component].min && `Min: ${analysisData.limits[component].min} ${analysisData.limits[component].unit}`}
                                  {analysisData.limits[component].min && analysisData.limits[component].max && ' / '}
                                  {analysisData.limits[component].max && `Max: ${analysisData.limits[component].max} ${analysisData.limits[component].unit}`}
                                </>
                              : '-'}
                          </td>
                          <td className="px-4 py-3">
                            {result.status === 'normal' && (
                              <Badge className="bg-green-500">Conforme</Badge>
                            )}
                            {result.status === 'warning' && (
                              <Badge className="bg-yellow-500">Alerta</Badge>
                            )}
                            {result.status === 'critical' && (
                              <Badge className="bg-red-500">Crítico</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {analysisData.notes && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
                    <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Observações
                    </h3>
                    <p className="text-gray-700">{analysisData.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Metadata Tab */}
          <TabsContent value="metadata" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Análise</CardTitle>
                <CardDescription>
                  Metadados e informações de rastreabilidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">ID da Análise</h3>
                      <p className="text-lg">{analysisData.id}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Código da Amostra</h3>
                      <p className="text-lg">{analysisData.sampleCode}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Tipo de Teste</h3>
                      <p className="text-lg">
                        {analysisData.testType === 'cannabinoid_profile' 
                          ? 'Perfil de Canabinoides' 
                          : analysisData.testType}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Data da Análise</h3>
                      <p className="text-lg">{new Date(analysisData.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    {analysisData.batchId && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">ID do Lote</h3>
                        <p className="text-lg">{analysisData.batchId}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Técnico Responsável</h3>
                      <p className="text-lg">{analysisData.technician}</p>
                    </div>
                    {analysisData.reviewer && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Revisor</h3>
                        <p className="text-lg">{analysisData.reviewer}</p>
                      </div>
                    )}
                    {analysisData.reviewDate && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Data da Revisão</h3>
                        <p className="text-lg">{new Date(analysisData.reviewDate).toLocaleDateString('pt-BR')}</p>
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <Badge className={getStatusColor(analysisData.status)}>
                        {translateStatus(analysisData.status)}
                      </Badge>
                    </div>
                    {analysisData.controlSample !== undefined && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Amostra de Controle</h3>
                        <p className="text-lg">{analysisData.controlSample ? 'Sim' : 'Não'}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-8 space-y-4">
                  <div>
                    <h3 className="text-md font-medium border-b pb-2">Equipamentos Utilizados</h3>
                    <ul className="mt-2 pl-5 list-disc">
                      {analysisData.equipmentUsed.map((equipment, index) => (
                        <li key={index} className="py-1">{equipment}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium border-b pb-2">Métodos Analíticos</h3>
                    <ul className="mt-2 pl-5 list-disc">
                      {analysisData.methodsUsed.map((method, index) => (
                        <li key={index} className="py-1">{method}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center p-4 bg-green-50 rounded-md border border-green-200">
                  <Shield className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-green-800">Verificação de Integridade</h3>
                    <p className="text-green-700 text-sm">
                      Esta análise foi validada digitalmente e registrada com tecnologia de verificação de integridade.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Visualization Tab */}
          <TabsContent value="visualization" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Visualização Gráfica</CardTitle>
                <CardDescription>
                  Visualização dos resultados em formato gráfico
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <LineChart className="h-5 w-5 mr-2 text-blue-600" />
                    Concentração de Canabinoides
                  </h3>
                  <div className="h-64 bg-gray-50 border rounded-md flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <PieChart className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                      <p>Gráfico de barras mostrando a concentração de cada canabinoide</p>
                      <p className="text-sm text-gray-400">(Visualização seria renderizada aqui em um ambiente de produção)</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <LineChart className="h-5 w-5 mr-2 text-green-600" />
                    Comparação com Limites
                  </h3>
                  <div className="h-64 bg-gray-50 border rounded-md flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <LineChart className="h-8 w-8 mx-auto mb-2 text-green-400" />
                      <p>Gráfico comparativo entre resultados e limites regulatórios</p>
                      <p className="text-sm text-gray-400">(Visualização seria renderizada aqui em um ambiente de produção)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Exportar Gráficos
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={() => window.history.back()}>
            Voltar
          </Button>
          
          <div className="space-x-2">
            <Button variant="outline">
              <FileCheck className="mr-2 h-4 w-4" />
              Gerar Certificado
            </Button>
            
            <Button>
              <Share2 className="mr-2 h-4 w-4" />
              Compartilhar com Cliente
            </Button>
          </div>
        </div>
      </div>
    </LaboratoryLayout>
  );
}