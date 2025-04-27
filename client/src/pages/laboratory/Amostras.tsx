import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Archive, 
  CheckCircle2, 
  ChevronRight, 
  Download, 
  Filter, 
  FlaskConical, 
  MoreHorizontal, 
  Plus, 
  Printer, 
  Search, 
  SlidersHorizontal 
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import LaboratoryLayout from '@/components/layout/laboratory/LaboratoryLayout';

// Tipo para as amostras
interface Sample {
  id: number;
  code: string;
  status: string;
  type: string;
  clientName: string;
  receivedDate: string;
  priority: 'high' | 'medium' | 'low';
  testTypes: string[];
  dueDate: string;
  assignedTo?: string;
}

export default function LaboratoryAmostras() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showNewSampleDialog, setShowNewSampleDialog] = useState(false);
  const { toast } = useToast();

  // Buscar amostras da API
  useEffect(() => {
    const fetchSamples = async () => {
      try {
        setIsLoading(true);
        // Na implementação real, isso seria uma chamada à API
        // const response = await apiRequest('/api/laboratory/samples');
        // if (response.ok) {
        //   const data = await response.json();
        //   setSamples(data);
        // }
        
        // Simulação com dados fictícios para desenvolvimento
        setTimeout(() => {
          setSamples(mockSamples);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Erro ao buscar amostras:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as amostras.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    fetchSamples();
  }, [toast]);

  // Filtragem de amostras com base na busca e filtros
  const filteredSamples = samples.filter(sample => {
    // Filtro de busca
    const matchesSearch = 
      searchQuery === '' || 
      sample.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sample.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro de status
    const matchesStatus = 
      selectedStatus === 'all' || 
      sample.status === selectedStatus;
    
    // Filtro de prioridade
    const matchesPriority = 
      selectedPriority === 'all' || 
      sample.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Função para traduzir o status
  const translateStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'registered': 'Registrada',
      'collected': 'Coletada',
      'received': 'Recebida',
      'in_progress': 'Em Análise',
      'pending_approval': 'Aguardando Aprovação',
      'completed': 'Concluída',
      'rejected': 'Rejeitada',
      'archived': 'Arquivada'
    };
    return statusMap[status] || status;
  };

  // Função para traduzir o tipo da amostra
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

  // Função para traduzir o tipo de teste
  const translateTestType = (type: string) => {
    const testTypeMap: Record<string, string> = {
      'cannabinoid_profile': 'Perfil de Canabinoides',
      'terpenes': 'Terpenos',
      'pesticides': 'Pesticidas',
      'heavy_metals': 'Metais Pesados',
      'microbials': 'Microbianos',
      'residual_solvents': 'Solventes Residuais',
      'potency': 'Potência'
    };
    return testTypeMap[type] || type;
  };

  // Função para obter a cor do status
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'registered': 'bg-gray-400 hover:bg-gray-500',
      'collected': 'bg-blue-400 hover:bg-blue-500',
      'received': 'bg-blue-500 hover:bg-blue-600',
      'in_progress': 'bg-yellow-500 hover:bg-yellow-600',
      'pending_approval': 'bg-orange-500 hover:bg-orange-600',
      'completed': 'bg-green-500 hover:bg-green-600',
      'rejected': 'bg-red-500 hover:bg-red-600',
      'archived': 'bg-purple-500 hover:bg-purple-600'
    };
    return colorMap[status] || 'bg-gray-500 hover:bg-gray-600';
  };

  // Função para traduzir a prioridade
  const translatePriority = (priority: string) => {
    const priorityMap: Record<string, string> = {
      'high': 'Alta',
      'medium': 'Média',
      'low': 'Baixa'
    };
    return priorityMap[priority] || priority;
  };

  // Função para obter a cor da prioridade
  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, string> = {
      'high': 'text-red-500',
      'medium': 'text-yellow-500',
      'low': 'text-green-500'
    };
    return colorMap[priority] || '';
  };

  // Função para simular o envio do formulário de nova amostra
  const handleNewSampleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui seria implementada a lógica para enviar a nova amostra para a API
    
    toast({
      title: 'Amostra Registrada',
      description: 'A nova amostra foi registrada com sucesso.',
    });
    
    setShowNewSampleDialog(false);
  };

  // Renderização condicional para carregamento
  if (isLoading) {
    return (
      <LaboratoryLayout>
        <div className="flex justify-center items-center h-[calc(100vh-150px)]">
          <div className="flex flex-col items-center">
            <FlaskConical className="h-12 w-12 animate-pulse text-blue-500 mb-2" />
            <p className="text-lg text-gray-600">Carregando amostras...</p>
          </div>
        </div>
      </LaboratoryLayout>
    );
  }

  return (
    <LaboratoryLayout>
      <div className="space-y-4 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gerenciamento de Amostras</h1>
          <div>
            <Button onClick={() => setShowNewSampleDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Amostra
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Amostras</CardTitle>
            <CardDescription>
              Gerencie todas as amostras de laboratório
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
                      <SelectItem value="registered">Registrada</SelectItem>
                      <SelectItem value="collected">Coletada</SelectItem>
                      <SelectItem value="received">Recebida</SelectItem>
                      <SelectItem value="in_progress">Em Análise</SelectItem>
                      <SelectItem value="pending_approval">Aguardando Aprovação</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                      <SelectItem value="rejected">Rejeitada</SelectItem>
                      <SelectItem value="archived">Arquivada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="h-4 w-4 text-gray-400" />
                  <Select
                    value={selectedPriority}
                    onValueChange={setSelectedPriority}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Prioridades</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Tipo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="hidden md:table-cell">Recebimento</TableHead>
                    <TableHead className="hidden lg:table-cell">Prioridade</TableHead>
                    <TableHead className="hidden lg:table-cell">Prazo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSamples.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        Nenhuma amostra encontrada com os filtros atuais.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSamples.map((sample) => (
                      <TableRow key={sample.id}>
                        <TableCell className="font-medium">{sample.code}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(sample.status)}`}>
                            {translateStatus(sample.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {translateSampleType(sample.type)}
                        </TableCell>
                        <TableCell>{sample.clientName}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {new Date(sample.receivedDate).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className={`hidden lg:table-cell ${getPriorityColor(sample.priority)}`}>
                          {translatePriority(sample.priority)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {new Date(sample.dueDate).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
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
              Mostrando {filteredSamples.length} de {samples.length} amostras
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Diálogo para cadastro de nova amostra */}
      <Dialog open={showNewSampleDialog} onOpenChange={setShowNewSampleDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Registrar Nova Amostra</DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo para registrar uma nova amostra para análise.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleNewSampleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Cliente</Label>
                  <Select defaultValue="client1">
                    <SelectTrigger id="clientName">
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client1">Associação MedCanna</SelectItem>
                      <SelectItem value="client2">Cultivador CBD Brasil</SelectItem>
                      <SelectItem value="client3">Farmácia Medigreen</SelectItem>
                      <SelectItem value="client4">Importadora CanaTrade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sampleType">Tipo de Amostra</Label>
                  <Select defaultValue="plant">
                    <SelectTrigger id="sampleType">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plant">Planta/Flor</SelectItem>
                      <SelectItem value="oil">Óleo</SelectItem>
                      <SelectItem value="extract">Extrato</SelectItem>
                      <SelectItem value="consumable">Produto Final</SelectItem>
                      <SelectItem value="topical">Tópico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batchNumber">Número do Lote</Label>
                  <Input id="batchNumber" placeholder="Ex: LOT-2025-042" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Testes Solicitados</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="test1" className="rounded" />
                    <Label htmlFor="test1">Perfil de Canabinoides</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="test2" className="rounded" />
                    <Label htmlFor="test2">Terpenos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="test3" className="rounded" />
                    <Label htmlFor="test3">Pesticidas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="test4" className="rounded" />
                    <Label htmlFor="test4">Metais Pesados</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="test5" className="rounded" />
                    <Label htmlFor="test5">Microbianos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="test6" className="rounded" />
                    <Label htmlFor="test6">Solventes Residuais</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <textarea 
                  id="notes" 
                  className="w-full min-h-[100px] rounded-md border border-input p-2"
                  placeholder="Informações adicionais sobre a amostra..."
                ></textarea>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowNewSampleDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">Registrar Amostra</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </LaboratoryLayout>
  );
}

// Dados fictícios para desenvolvimento
const mockSamples: Sample[] = [
  {
    id: 1,
    code: 'LAB-001-25',
    status: 'in_progress',
    type: 'plant',
    clientName: 'Associação MedCanna',
    receivedDate: '2025-04-22',
    priority: 'high',
    testTypes: ['cannabinoid_profile', 'terpenes'],
    dueDate: '2025-04-29',
    assignedTo: 'Ana Silva'
  },
  {
    id: 2,
    code: 'LAB-002-25',
    status: 'received',
    type: 'oil',
    clientName: 'Farmácia Medigreen',
    receivedDate: '2025-04-23',
    priority: 'medium',
    testTypes: ['cannabinoid_profile', 'heavy_metals', 'pesticides'],
    dueDate: '2025-04-30'
  },
  {
    id: 3,
    code: 'LAB-003-25',
    status: 'completed',
    type: 'extract',
    clientName: 'CBD Brasil Cultivo',
    receivedDate: '2025-04-18',
    priority: 'medium',
    testTypes: ['cannabinoid_profile', 'terpenes', 'residual_solvents'],
    dueDate: '2025-04-25',
    assignedTo: 'Carlos Mendes'
  },
  {
    id: 4,
    code: 'LAB-004-25',
    status: 'pending_approval',
    type: 'consumable',
    clientName: 'Vida Verde Produtos',
    receivedDate: '2025-04-20',
    priority: 'low',
    testTypes: ['cannabinoid_profile', 'microbials'],
    dueDate: '2025-04-27',
    assignedTo: 'Mariana Costa'
  },
  {
    id: 5,
    code: 'LAB-005-25',
    status: 'rejected',
    type: 'plant',
    clientName: 'Associação MedCanna',
    receivedDate: '2025-04-19',
    priority: 'high',
    testTypes: ['cannabinoid_profile', 'terpenes', 'pesticides'],
    dueDate: '2025-04-26'
  },
  {
    id: 6,
    code: 'LAB-006-25',
    status: 'registered',
    type: 'oil',
    clientName: 'Importadora CanaTrade',
    receivedDate: '2025-04-24',
    priority: 'high',
    testTypes: ['cannabinoid_profile', 'heavy_metals', 'pesticides', 'microbials'],
    dueDate: '2025-05-01'
  },
  {
    id: 7,
    code: 'LAB-007-25',
    status: 'archived',
    type: 'consumable',
    clientName: 'CBD Brasil Cultivo',
    receivedDate: '2025-03-10',
    priority: 'low',
    testTypes: ['cannabinoid_profile'],
    dueDate: '2025-03-17'
  },
  {
    id: 8,
    code: 'LAB-008-25',
    status: 'in_progress',
    type: 'extract',
    clientName: 'Farmácia Medigreen',
    receivedDate: '2025-04-21',
    priority: 'medium',
    testTypes: ['cannabinoid_profile', 'terpenes', 'residual_solvents'],
    dueDate: '2025-04-28',
    assignedTo: 'Pedro Alves'
  },
  {
    id: 9,
    code: 'LAB-009-25',
    status: 'collected',
    type: 'topical',
    clientName: 'Vida Verde Produtos',
    receivedDate: '2025-04-25',
    priority: 'low',
    testTypes: ['cannabinoid_profile', 'microbials'],
    dueDate: '2025-05-02'
  },
  {
    id: 10,
    code: 'LAB-010-25',
    status: 'completed',
    type: 'plant',
    clientName: 'Importadora CanaTrade',
    receivedDate: '2025-04-15',
    priority: 'high',
    testTypes: ['cannabinoid_profile', 'terpenes', 'pesticides', 'heavy_metals'],
    dueDate: '2025-04-22',
    assignedTo: 'Juliana Ferreira'
  }
];