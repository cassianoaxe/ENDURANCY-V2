import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { 
  AlertCircle, 
  ChevronLeft, 
  Beaker, 
  TestTube, 
  ClipboardList,
  CalendarClock,
  Building,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  Send
} from "lucide-react";

// Labels amigáveis para status
const STATUS_LABELS = {
  pending: "Pendente",
  received: "Recebida",
  in_progress: "Em Análise",
  completed: "Concluída",
  approved: "Aprovada",
  rejected: "Rejeitada",
  canceled: "Cancelada",
};

// Cores para badges de status
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  received: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  in_progress: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  completed: "bg-green-100 text-green-800 hover:bg-green-200",
  approved: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
  rejected: "bg-red-100 text-red-800 hover:bg-red-200",
  canceled: "bg-gray-100 text-gray-800 hover:bg-gray-200",
};

// Rótulos amigáveis para tipos de teste
const TEST_TYPE_LABELS = {
  cannabinoid_profile: "Perfil de Canabinóides",
  terpene_profile: "Perfil de Terpenos",
  heavy_metals: "Metais Pesados",
  pesticides: "Pesticidas",
  microbials: "Microbiológicos",
  residual_solvents: "Solventes Residuais",
  mycotoxins: "Micotoxinas",
  water_activity: "Atividade da Água",
  moisture_content: "Teor de Umidade",
  foreign_matter: "Matéria Estranha",
  visual_inspection: "Inspeção Visual",
  full_panel: "Painel Completo",
};

// Tipos de amostra
const SAMPLE_TYPES = {
  flower: "Flor",
  concentrate: "Concentrado",
  extract: "Extrato",
  edible: "Comestível",
  topical: "Tópico",
  tincture: "Tintura", 
  oil: "Óleo",
  raw_material: "Matéria-prima",
  in_process: "Em processamento",
  finished_product: "Produto Final",
  other: "Outro",
};

export default function SampleDetail() {
  const params = useParams<{ id: string }>();
  const sampleId = parseInt(params.id);
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  // Estado para valores de formulário
  const [statusUpdateForm, setStatusUpdateForm] = React.useState({
    status: "",
    notes: "",
  });
  
  const [testForm, setTestForm] = React.useState({
    testType: "cannabinoid_profile",
    notes: "",
  });
  
  // Fetch sample data
  const { 
    data: sampleData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: [`/api/laboratory/samples/${sampleId}`],
    enabled: !isNaN(sampleId),
  });
  
  // Mutation para atualizar o status da amostra
  const updateStatusMutation = useMutation({
    mutationFn: async (data: { status: string; notes?: string }) => {
      const response = await fetch(`/api/laboratory/samples/${sampleId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Falha ao atualizar status");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status atualizado",
        description: "O status da amostra foi atualizado com sucesso.",
      });
      // Atualizar os dados da amostra
      queryClient.invalidateQueries({ queryKey: [`/api/laboratory/samples/${sampleId}`] });
      
      // Limpar formulário
      setStatusUpdateForm({
        status: "",
        notes: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar status",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao atualizar o status da amostra.",
        variant: "destructive",
      });
    },
  });
  
  // Mutation para adicionar um novo teste
  const addTestMutation = useMutation({
    mutationFn: async (data: { testType: string; notes?: string }) => {
      const response = await fetch(`/api/laboratory/samples/${sampleId}/tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Falha ao adicionar teste");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Teste adicionado",
        description: "O teste foi adicionado com sucesso à amostra.",
      });
      // Atualizar os dados da amostra
      queryClient.invalidateQueries({ queryKey: [`/api/laboratory/samples/${sampleId}`] });
      
      // Limpar formulário
      setTestForm({
        testType: "cannabinoid_profile",
        notes: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar teste",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao adicionar o teste à amostra.",
        variant: "destructive",
      });
    },
  });
  
  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Handlers para atualização de status
  const handleStatusChange = (value: string) => {
    setStatusUpdateForm({
      ...statusUpdateForm,
      status: value,
    });
  };
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setStatusUpdateForm({
      ...statusUpdateForm,
      notes: e.target.value,
    });
  };
  
  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusUpdateForm.status) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um status para continuar.",
        variant: "destructive",
      });
      return;
    }
    
    updateStatusMutation.mutate({
      status: statusUpdateForm.status,
      notes: statusUpdateForm.notes,
    });
  };
  
  // Handlers para adição de teste
  const handleTestTypeChange = (value: string) => {
    setTestForm({
      ...testForm,
      testType: value,
    });
  };
  
  const handleTestNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTestForm({
      ...testForm,
      notes: e.target.value,
    });
  };
  
  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testForm.testType) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um tipo de teste para continuar.",
        variant: "destructive",
      });
      return;
    }
    
    addTestMutation.mutate({
      testType: testForm.testType,
      notes: testForm.notes,
    });
  };
  
  // Estados de carregamento e erro
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-medium mb-2">Carregando detalhes da amostra...</h2>
          <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !sampleData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">Erro ao carregar amostra</h2>
          <p className="text-gray-500 mb-4">
            Ocorreu um erro ao buscar os detalhes da amostra. A amostra pode não existir ou você não tem permissão para acessá-la.
          </p>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 justify-center">
            <Button variant="outline" onClick={() => navigate("/laboratory/samples")}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar para amostras
            </Button>
            <Button onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { sample, tests } = sampleData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/laboratory/samples")}
            className="mb-2"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Voltar para amostras
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Amostra {sample.code}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={STATUS_COLORS[sample.status] || "bg-gray-100"}>
              {STATUS_LABELS[sample.status as keyof typeof STATUS_LABELS] || sample.status}
            </Badge>
            <p className="text-muted-foreground">
              {SAMPLE_TYPES[sample.sample_type as keyof typeof SAMPLE_TYPES] || sample.sample_type}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      <Separator />

      {/* Informações gerais da amostra */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="h-5 w-5 text-primary" />
              Detalhes da Amostra
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Código</h3>
                <p>{sample.code}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Número do Lote</h3>
                <p>{sample.batch_number || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Tipo de Amostra</h3>
                <p>{SAMPLE_TYPES[sample.sample_type as keyof typeof SAMPLE_TYPES] || sample.sample_type}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <Badge className={`${STATUS_COLORS[sample.status] || "bg-gray-100"} mt-1`}>
                  {STATUS_LABELS[sample.status as keyof typeof STATUS_LABELS] || sample.status}
                </Badge>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Organização</h3>
              <div className="flex items-start gap-2">
                <Building className="h-4 w-4 text-gray-400 mt-0.5" />
                <p>{sample.organization_name || "N/A"}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Criado por</h3>
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-gray-400 mt-0.5" />
                <p>{sample.created_by_name || "N/A"}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Data de envio</h3>
                <div className="flex items-start gap-2">
                  <CalendarClock className="h-4 w-4 text-gray-400 mt-0.5" />
                  <p>{formatDate(sample.created_at)}</p>
                </div>
              </div>
              
              {sample.received_date && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Data de recebimento</h3>
                  <div className="flex items-start gap-2">
                    <CalendarClock className="h-4 w-4 text-gray-400 mt-0.5" />
                    <p>{formatDate(sample.received_date)}</p>
                  </div>
                </div>
              )}
              
              {sample.completed_date && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Data de conclusão</h3>
                  <div className="flex items-start gap-2">
                    <CalendarClock className="h-4 w-4 text-gray-400 mt-0.5" />
                    <p>{formatDate(sample.completed_date)}</p>
                  </div>
                </div>
              )}
            </div>
            
            {sample.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Observações</h3>
                  <p className="text-sm text-gray-600">{sample.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Card para atualizar status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Atualizar Status
            </CardTitle>
            <CardDescription>
              Altere o status atual da amostra e adicione observações se necessário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Status atual: 
                  <Badge className={`${STATUS_COLORS[sample.status] || "bg-gray-100"} ml-2`}>
                    {STATUS_LABELS[sample.status as keyof typeof STATUS_LABELS] || sample.status}
                  </Badge>
                </label>
                
                <Select onValueChange={handleStatusChange} value={statusUpdateForm.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o novo status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Observações</label>
                <Textarea 
                  placeholder="Adicione observações sobre a mudança de status..."
                  value={statusUpdateForm.notes}
                  onChange={handleNotesChange}
                  rows={4}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Atualizar Status
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Testes da amostra */}
      <Tabs defaultValue="tests" className="w-full">
        <TabsList className="grid grid-cols-2 max-w-[400px]">
          <TabsTrigger value="tests" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Testes ({tests?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="new_test" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Adicionar Teste
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tests" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Testes da Amostra</CardTitle>
              <CardDescription>
                Lista de todos os testes associados a esta amostra
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tests && tests.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Técnico</TableHead>
                        <TableHead>Data de Início</TableHead>
                        <TableHead>Data de Resultado</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tests.map((test: any) => (
                        <TableRow key={test.id}>
                          <TableCell>
                            {TEST_TYPE_LABELS[test.test_type as keyof typeof TEST_TYPE_LABELS] || test.test_type}
                          </TableCell>
                          <TableCell>
                            <Badge className={STATUS_COLORS[test.status] || "bg-gray-100"}>
                              {STATUS_LABELS[test.status as keyof typeof STATUS_LABELS] || test.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{test.technician_name || "N/A"}</TableCell>
                          <TableCell>{test.created_at ? formatDate(test.created_at) : "N/A"}</TableCell>
                          <TableCell>{test.result_date ? formatDate(test.result_date) : "N/A"}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => navigate(`/laboratory/tests/${test.id}`)}
                            >
                              Ver detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <TestTube className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum teste encontrado</h3>
                  <p className="text-gray-500 mb-6">
                    Esta amostra ainda não possui testes registrados.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="new_test" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Novo Teste</CardTitle>
              <CardDescription>
                Registre um novo teste para esta amostra
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTestSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Teste</label>
                  <Select onValueChange={handleTestTypeChange} value={testForm.testType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de teste" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TEST_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Observações</label>
                  <Textarea 
                    placeholder="Adicione instruções ou detalhes sobre o teste..."
                    value={testForm.notes}
                    onChange={handleTestNotesChange}
                    rows={4}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={addTestMutation.isPending}
                >
                  {addTestMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Adicionando...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Adicionar Teste
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}