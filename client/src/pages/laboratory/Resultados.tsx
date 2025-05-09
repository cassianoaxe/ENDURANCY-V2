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
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Calendar,
  Check,
  Clock,
  Download,
  Eye,
  Filter,
  FlaskConical,
  Search,
  Microscope,
  PenLine,
  Plus,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
// Layout gerenciado pelo App.tsx

// Tipos de dados
interface TestResult {
  id: number;
  sampleId: string;
  testName: string;
  client: string;
  requestDate: string;
  completedDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'approved' | 'rejected';
  analyst: string;
  priority: 'normal' | 'high' | 'urgent';
  resultData?: ResultData;
}

interface ResultData {
  parameters: TestParameter[];
  notes?: string;
  attachments?: string[];
}

interface TestParameter {
  name: string;
  value: string | number;
  unit: string;
  referenceRange?: string;
  status?: 'normal' | 'low' | 'high' | 'invalid';
}

// Componente principal
export default function LaboratoryResultados() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const { toast } = useToast();

  // Buscar resultados
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        // Na implementação real, isso seria uma chamada à API
        // const response = await fetch('/api/laboratory/results');
        // const data = await response.json();
        // setResults(data);
        
        // Simulação com dados fictícios para desenvolvimento
        setTimeout(() => {
          setResults(mockResults);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Erro ao buscar resultados:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar a lista de resultados.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [toast]);

  // Filtrar resultados
  const filteredResults = results.filter(result => {
    // Filtro de busca por ID de amostra, cliente ou teste
    const matchesSearch = 
      searchQuery === '' || 
      result.sampleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.testName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro por status
    const matchesStatus = 
      selectedStatus === 'all' || 
      result.status === selectedStatus;
    
    // Filtro por prioridade
    const matchesPriority = 
      selectedPriority === 'all' || 
      result.priority === selectedPriority;
    
    // Filtros de tab
    if (activeTab === 'pending') {
      return matchesSearch && matchesPriority && (result.status === 'pending' || result.status === 'in_progress');
    } else if (activeTab === 'completed') {
      return matchesSearch && matchesPriority && (result.status === 'completed' || result.status === 'approved' || result.status === 'rejected');
    }
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Função para visualizar resultado
  const viewResult = (result: TestResult) => {
    setSelectedResult(result);
    setShowResultDialog(true);
  };

  // Função para aprovar resultado
  const approveResult = (result: TestResult) => {
    setSelectedResult(result);
    setShowApproveDialog(true);
  };

  // Função para confirmar aprovação
  const confirmApproval = (approve: boolean) => {
    if (!selectedResult) return;
    
    const newStatus = approve ? 'approved' : 'rejected';
    const updatedResults = results.map(r => 
      r.id === selectedResult.id ? { ...r, status: newStatus } : r
    );
    
    setResults(updatedResults);
    setShowApproveDialog(false);
    
    toast({
      title: approve ? 'Resultado Aprovado' : 'Resultado Rejeitado',
      description: `O resultado para a amostra ${selectedResult.sampleId} foi ${approve ? 'aprovado' : 'rejeitado'}.`,
      variant: approve ? 'default' : 'destructive',
    });
  };

  // Função para traduzir status do resultado
  const translateResultStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Pendente',
      'in_progress': 'Em Andamento',
      'completed': 'Concluído',
      'approved': 'Aprovado',
      'rejected': 'Rejeitado'
    };
    return statusMap[status] || status;
  };

  // Função para traduzir prioridade
  const translatePriority = (priority: string) => {
    const priorityMap: Record<string, string> = {
      'normal': 'Normal',
      'high': 'Alta',
      'urgent': 'Urgente'
    };
    return priorityMap[priority] || priority;
  };

  // Função para obter a cor do status
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'pending': 'bg-yellow-500 hover:bg-yellow-600',
      'in_progress': 'bg-blue-500 hover:bg-blue-600',
      'completed': 'bg-orange-500 hover:bg-orange-600',
      'approved': 'bg-green-500 hover:bg-green-600',
      'rejected': 'bg-red-500 hover:bg-red-600'
    };
    return colorMap[status] || 'bg-gray-500 hover:bg-gray-600';
  };

  // Função para obter a cor da prioridade
  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, string> = {
      'normal': 'bg-green-100 text-green-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    };
    return colorMap[priority] || 'bg-gray-100 text-gray-800';
  };

  // Função para obter a cor do status de parâmetro
  const getParameterStatusColor = (status?: string) => {
    if (!status) return 'text-gray-700';
    
    const colorMap: Record<string, string> = {
      'normal': 'text-green-700',
      'low': 'text-amber-700',
      'high': 'text-red-700',
      'invalid': 'text-gray-500'
    };
    return colorMap[status] || 'text-gray-700';
  };

  // Renderização do estado de carregamento
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-150px)]">
        <div className="flex flex-col items-center">
          <FlaskConical className="h-12 w-12 animate-pulse text-blue-500 mb-2" />
          <p className="text-lg text-gray-600">Carregando resultados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Resultados de Análises</h1>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Gerenciamento de Resultados</CardTitle>
          <CardDescription>
            Gerencie os resultados de análises do laboratório
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="completed">Concluídos</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full md:w-auto flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por amostra, cliente ou teste..."
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
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="rejected">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select
                  value={selectedPriority}
                  onValueChange={setSelectedPriority}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Prioridades</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amostra</TableHead>
                  <TableHead>Análise</TableHead>
                  <TableHead className="hidden md:table-cell">Cliente</TableHead>
                  <TableHead className="hidden lg:table-cell">Analista</TableHead>
                  <TableHead className="hidden lg:table-cell">Data</TableHead>
                  <TableHead>Status</TableHead>
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
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          {result.sampleId}
                          <Badge className={`w-fit mt-1 ${getPriorityColor(result.priority)}`} variant="outline">
                            {translatePriority(result.priority)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{result.testName}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {result.client}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {result.analyst}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-gray-400" />
                          {new Date(result.requestDate).toLocaleDateString('pt-BR')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(result.status)}>
                          {translateResultStatus(result.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => viewResult(result)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {result.status === 'completed' && (
                            <Button variant="ghost" size="icon" onClick={() => approveResult(result)}>
                              <Check className="h-4 w-4" />
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
        </CardFooter>
      </Card>

      {/* Diálogo para visualizar resultado */}
      {selectedResult && (
        <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center">
                <Microscope className="h-5 w-5 mr-2 text-blue-600" />
                Resultado de Análise - {selectedResult.sampleId}
                <Badge className={`ml-2 ${getStatusColor(selectedResult.status)}`}>
                  {translateResultStatus(selectedResult.status)}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                {selectedResult.testName} - Cliente: {selectedResult.client}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-500">Analista</div>
                <div className="font-medium">{selectedResult.analyst}</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-gray-500">Data do Pedido</div>
                <div className="font-medium">{new Date(selectedResult.requestDate).toLocaleDateString('pt-BR')}</div>
              </div>
              
              {selectedResult.completedDate && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Data de Conclusão</div>
                  <div className="font-medium">{new Date(selectedResult.completedDate).toLocaleDateString('pt-BR')}</div>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="text-sm text-gray-500">Prioridade</div>
                <Badge className={getPriorityColor(selectedResult.priority)} variant="outline">
                  {translatePriority(selectedResult.priority)}
                </Badge>
              </div>
            </div>
            
            {selectedResult.resultData && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Resultados da Análise</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="px-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Parâmetro</TableHead>
                          <TableHead className="text-right">Resultado</TableHead>
                          <TableHead className="text-right">Unidade</TableHead>
                          <TableHead className="text-right">Referência</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedResult.resultData.parameters.map((param, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{param.name}</TableCell>
                            <TableCell className={`text-right font-medium ${getParameterStatusColor(param.status)}`}>
                              {param.value}
                            </TableCell>
                            <TableCell className="text-right">{param.unit}</TableCell>
                            <TableCell className="text-right text-gray-500">
                              {param.referenceRange || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {selectedResult.resultData.notes && (
                    <div className="px-6 py-4 border-t">
                      <div className="text-sm font-medium mb-2">Observações</div>
                      <p className="text-sm text-gray-600">{selectedResult.resultData.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowResultDialog(false)}>
                Fechar
              </Button>
              {selectedResult.status === 'completed' && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => approveResult(selectedResult)}>
                    Aprovar/Rejeitar
                  </Button>
                  <Button variant="default">
                    <PenLine className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Diálogo para aprovar/rejeitar resultado */}
      {selectedResult && (
        <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Aprovar ou Rejeitar Resultado</DialogTitle>
              <DialogDescription>
                Amostra: {selectedResult.sampleId} - {selectedResult.testName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <p className="mb-4">Confirme a aprovação ou rejeição do resultado. Esta ação não pode ser desfeita.</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <Check className="h-5 w-5 text-green-500 inline-block mr-2" />
                    <span className="font-medium">Aprovar</span>
                  </div>
                  <Button onClick={() => confirmApproval(true)}>Aprovar</Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <X className="h-5 w-5 text-red-500 inline-block mr-2" />
                    <span className="font-medium">Rejeitar</span>
                  </div>
                  <Button variant="outline" onClick={() => confirmApproval(false)}>Rejeitar</Button>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                Cancelar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Dados fictícios para desenvolvimento
const mockResults: TestResult[] = [
  {
    id: 1,
    sampleId: 'LAB-2025-0001',
    testName: 'Perfil de Canabinoides',
    client: 'Associação Brasileira de Apoio Cannabis Esperança',
    requestDate: '2025-04-20',
    completedDate: '2025-04-25',
    status: 'approved',
    analyst: 'Ana Silva',
    priority: 'normal',
    resultData: {
      parameters: [
        { name: 'CBD', value: '15.2', unit: '%', referenceRange: '10.0-20.0', status: 'normal' },
        { name: 'THC', value: '0.27', unit: '%', referenceRange: '<0.3', status: 'normal' },
        { name: 'CBG', value: '1.4', unit: '%', referenceRange: '0.5-2.0', status: 'normal' },
        { name: 'CBC', value: '0.8', unit: '%', referenceRange: '0.1-1.0', status: 'normal' },
        { name: 'CBN', value: '0.05', unit: '%', referenceRange: '<0.1', status: 'normal' }
      ],
      notes: 'Amostra em conformidade com os padrões regulatórios para produtos CBD.'
    }
  },
  {
    id: 2,
    sampleId: 'LAB-2025-0002',
    testName: 'Análise de Metais Pesados',
    client: 'PharmaCann Indústria Farmacêutica',
    requestDate: '2025-04-22',
    status: 'in_progress',
    analyst: 'Carlos Mendes',
    priority: 'high'
  },
  {
    id: 3,
    sampleId: 'LAB-2025-0003',
    testName: 'Análise Microbiológica',
    client: 'Clínica Integrada de Dor',
    requestDate: '2025-04-18',
    completedDate: '2025-04-24',
    status: 'completed',
    analyst: 'Mariana Costa',
    priority: 'normal',
    resultData: {
      parameters: [
        { name: 'Contagem total de aeróbios', value: '100', unit: 'UFC/g', referenceRange: '<1000', status: 'normal' },
        { name: 'Leveduras e Bolores', value: '10', unit: 'UFC/g', referenceRange: '<100', status: 'normal' },
        { name: 'E. coli', value: 'Ausente', unit: '', referenceRange: 'Ausente', status: 'normal' },
        { name: 'Salmonella spp.', value: 'Ausente', unit: '', referenceRange: 'Ausente', status: 'normal' }
      ]
    }
  },
  {
    id: 4,
    sampleId: 'LAB-2025-0004',
    testName: 'Solventes Residuais',
    client: 'Universidade Federal de São Paulo',
    requestDate: '2025-04-23',
    status: 'pending',
    analyst: 'Pedro Alves',
    priority: 'normal'
  },
  {
    id: 5,
    sampleId: 'LAB-2025-0005',
    testName: 'Perfil de Terpenos',
    client: 'Grupo de Apoio a Pacientes Neurológicos',
    requestDate: '2025-04-15',
    completedDate: '2025-04-20',
    status: 'approved',
    analyst: 'Ana Silva',
    priority: 'normal',
    resultData: {
      parameters: [
        { name: 'β-Mirceno', value: '0.35', unit: '%', referenceRange: '0.1-0.5', status: 'normal' },
        { name: 'α-Pineno', value: '0.15', unit: '%', referenceRange: '0.05-0.2', status: 'normal' },
        { name: 'Limoneno', value: '0.40', unit: '%', referenceRange: '0.2-0.6', status: 'normal' },
        { name: 'Linalol', value: '0.10', unit: '%', referenceRange: '0.05-0.15', status: 'normal' },
        { name: 'β-Cariofileno', value: '0.30', unit: '%', referenceRange: '0.1-0.4', status: 'normal' }
      ]
    }
  },
  {
    id: 6,
    sampleId: 'LAB-2025-0006',
    testName: 'Pesticidas',
    client: 'PharmaCann Indústria Farmacêutica',
    requestDate: '2025-04-24',
    status: 'pending',
    analyst: 'Carlos Mendes',
    priority: 'urgent'
  },
  {
    id: 7,
    sampleId: 'LAB-2025-0007',
    testName: 'Perfil de Canabinoides',
    client: 'Dr. Paulo Ribeiro',
    requestDate: '2025-04-19',
    completedDate: '2025-04-26',
    status: 'rejected',
    analyst: 'Mariana Costa',
    priority: 'high',
    resultData: {
      parameters: [
        { name: 'CBD', value: '8.2', unit: '%', referenceRange: '10.0-20.0', status: 'low' },
        { name: 'THC', value: '0.42', unit: '%', referenceRange: '<0.3', status: 'high' },
        { name: 'CBG', value: '1.1', unit: '%', referenceRange: '0.5-2.0', status: 'normal' },
        { name: 'CBC', value: '0.7', unit: '%', referenceRange: '0.1-1.0', status: 'normal' },
        { name: 'CBN', value: '0.12', unit: '%', referenceRange: '<0.1', status: 'high' }
      ],
      notes: 'Amostra com níveis de THC acima do permitido pela legislação. Recomenda-se reavaliação da amostra.'
    }
  }
];