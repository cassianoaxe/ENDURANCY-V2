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
import { Label } from "@/components/ui/label";
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
  FlaskConical,
  Send
} from "lucide-react";

// Labels amigáveis para status
const STATUS_LABELS = {
  pending: "Pendente",
  in_progress: "Em Análise",
  completed: "Concluído",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

// Cores para badges de status
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  in_progress: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  completed: "bg-green-100 text-green-800 hover:bg-green-200",
  approved: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
  rejected: "bg-red-100 text-red-800 hover:bg-red-200",
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

// Canabinoides comuns
const CANNABINOIDS = [
  { id: "thc", name: "THC", description: "Tetrahidrocanabinol" },
  { id: "thca", name: "THCA", description: "Ácido Tetrahidrocanabinólico" },
  { id: "d9Thc", name: "Δ9-THC", description: "Delta-9-Tetrahidrocanabinol" },
  { id: "d8Thc", name: "Δ8-THC", description: "Delta-8-Tetrahidrocanabinol" },
  { id: "thcv", name: "THCV", description: "Tetrahidrocanabivarina" },
  { id: "cbd", name: "CBD", description: "Canabidiol" },
  { id: "cbda", name: "CBDA", description: "Ácido Canabidiólico" },
  { id: "cbg", name: "CBG", description: "Canabigerol" },
  { id: "cbga", name: "CBGA", description: "Ácido Canabigerólico" },
  { id: "cbn", name: "CBN", description: "Canabinol" },
  { id: "cbc", name: "CBC", description: "Canabicromeno" },
  { id: "totalCannabinoids", name: "Total de Canabinóides", description: "Soma de todos os canabinóides" },
  { id: "totalThc", name: "THC Total", description: "Soma de todas as formas de THC" },
  { id: "totalCbd", name: "CBD Total", description: "Soma de todas as formas de CBD" },
];

// Terpenos comuns
const COMMON_TERPENES = [
  "Limoneno",
  "Mirceno",
  "Pineno",
  "Linalol",
  "Cariofileno",
  "Humuleno",
  "Terpinoleno",
  "Ocimeno",
  "Terpineol",
  "Valenceno",
];

export default function TestDetail() {
  const params = useParams<{ id: string }>();
  const testId = parseInt(params.id);
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  // Estados para formulários de resultados
  const [resultForm, setResultForm] = React.useState({
    status: "",
    notes: "",
    // Campos para perfil de canabinóides
    cannabinoidValues: {} as Record<string, number>,
    // Campos para perfil de terpenos
    terpeneValues: {} as Record<string, number>,
    totalTerpenes: 0,
    // Campos genéricos para outros tipos de testes
    resultData: {} as Record<string, any>,
  });
  
  // Estado para controlar a adição de novos terpenos
  const [newTerpene, setNewTerpene] = React.useState("");
  const [terpeneList, setTerpeneList] = React.useState<string[]>([...COMMON_TERPENES]);
  
  // Fetch test data
  const { 
    data: testData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: [`/api/laboratory/tests/${testId}`],
    enabled: !isNaN(testId),
    onSuccess: (data) => {
      // Preencher o formulário com os dados existentes (se houver)
      if (data && data.test) {
        const { test, results } = data;
        
        // Definir o status inicial
        setResultForm(prev => ({
          ...prev,
          status: test.status || "",
          notes: test.notes || "",
        }));
        
        // Se for um teste de canabinóides e tiver resultados
        if (test.test_type === 'cannabinoid_profile' && results) {
          const cannabinoidValues: Record<string, number> = {};
          
          // Mapear cada canabinoide do resultado para o formulário
          CANNABINOIDS.forEach(cannabinoid => {
            if (results[cannabinoid.id] !== undefined) {
              cannabinoidValues[cannabinoid.id] = results[cannabinoid.id];
            }
          });
          
          setResultForm(prev => ({
            ...prev,
            cannabinoidValues,
          }));
        }
        
        // Se for um teste de terpenos e tiver resultados
        if (test.test_type === 'terpene_profile' && results) {
          if (results.resultData) {
            // Adicionar terpenos personalizados à lista
            const customTerpenes = Object.keys(results.resultData).filter(
              terpene => !COMMON_TERPENES.includes(terpene)
            );
            
            if (customTerpenes.length > 0) {
              setTerpeneList([...COMMON_TERPENES, ...customTerpenes]);
            }
            
            setResultForm(prev => ({
              ...prev,
              terpeneValues: results.resultData || {},
              totalTerpenes: results.totalTerpenes || 0,
            }));
          }
        }
        
        // Para outros tipos de teste, usar resultData genérico
        if (test.test_type !== 'cannabinoid_profile' && test.test_type !== 'terpene_profile' && test.result_data) {
          setResultForm(prev => ({
            ...prev,
            resultData: test.result_data || {},
          }));
        }
      }
    }
  });
  
  // Mutation para atualizar os resultados do teste
  const updateResultsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/laboratory/tests/${testId}/results`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Falha ao atualizar resultados");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Resultados atualizados",
        description: "Os resultados do teste foram atualizados com sucesso.",
      });
      
      // Atualizar os dados do teste
      queryClient.invalidateQueries({ queryKey: [`/api/laboratory/tests/${testId}`] });
      
      // Opcional: Atualizar também os dados da amostra associada
      if (testData?.test?.sample_id) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/laboratory/samples/${testData.test.sample_id}`] 
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar resultados",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao atualizar os resultados do teste.",
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
  
  // Handlers para atualização de resultados genéricos
  const handleStatusChange = (value: string) => {
    setResultForm(prev => ({
      ...prev,
      status: value
    }));
  };
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResultForm(prev => ({
      ...prev,
      notes: e.target.value
    }));
  };
  
  // Handlers para canabinóides
  const handleCannabinoidChange = (id: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    
    setResultForm(prev => ({
      ...prev,
      cannabinoidValues: {
        ...prev.cannabinoidValues,
        [id]: numValue
      }
    }));
  };
  
  // Handlers para terpenos
  const handleTerpeneChange = (name: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    
    setResultForm(prev => ({
      ...prev,
      terpeneValues: {
        ...prev.terpeneValues,
        [name]: numValue
      }
    }));
  };
  
  const handleTotalTerpenesChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    
    setResultForm(prev => ({
      ...prev,
      totalTerpenes: numValue
    }));
  };
  
  const handleAddTerpene = () => {
    if (newTerpene && !terpeneList.includes(newTerpene)) {
      setTerpeneList(prev => [...prev, newTerpene]);
      setNewTerpene("");
    }
  };
  
  // Handler para campos de resultado genéricos
  const handleResultDataChange = (field: string, value: string) => {
    setResultForm(prev => ({
      ...prev,
      resultData: {
        ...prev.resultData,
        [field]: value
      }
    }));
  };
  
  // Handler para submissão do formulário de resultados
  const handleSubmitResults = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resultForm.status) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um status para os resultados.",
        variant: "destructive",
      });
      return;
    }
    
    const testType = testData?.test?.test_type;
    
    let requestData: any = {
      status: resultForm.status,
      notes: resultForm.notes
    };
    
    // Campos específicos para cada tipo de teste
    if (testType === 'cannabinoid_profile') {
      // Adicionar todos os valores de canabinóides
      requestData = {
        ...requestData,
        ...resultForm.cannabinoidValues
      };
    } else if (testType === 'terpene_profile') {
      // Para terpenos, enviar o objeto de valores e o total
      requestData.resultData = resultForm.terpeneValues;
      requestData.totalTerpenes = resultForm.totalTerpenes;
    } else {
      // Para outros tipos de teste, enviar o objeto resultData genérico
      requestData.resultData = resultForm.resultData;
    }
    
    updateResultsMutation.mutate(requestData);
  };
  
  // Estados de carregamento e erro
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-medium mb-2">Carregando detalhes do teste...</h2>
          <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !testData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">Erro ao carregar teste</h2>
          <p className="text-gray-500 mb-4">
            Ocorreu um erro ao buscar os detalhes do teste. O teste pode não existir ou você não tem permissão para acessá-lo.
          </p>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 justify-center">
            <Button 
              variant="outline" 
              onClick={() => navigate("/laboratory/samples")}
            >
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

  const { test, sample, results } = testData;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate(`/laboratory/samples/${test.sample_id}`)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Voltar para amostra
            </Button>
            {sample && (
              <Badge className={STATUS_COLORS[sample.status] || "bg-gray-100"}>
                Amostra: {STATUS_LABELS[sample.status as keyof typeof STATUS_LABELS] || sample.status}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {TEST_TYPE_LABELS[test.test_type as keyof typeof TEST_TYPE_LABELS] || test.test_type}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={STATUS_COLORS[test.status] || "bg-gray-100"}>
              {STATUS_LABELS[test.status as keyof typeof STATUS_LABELS] || test.status}
            </Badge>
            <p className="text-muted-foreground">
              {sample ? `Amostra: ${sample.code}` : ""}
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

      {/* Detalhes do teste */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-primary" />
              Informações do Teste
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Tipo de Teste</h3>
                <p>{TEST_TYPE_LABELS[test.test_type as keyof typeof TEST_TYPE_LABELS] || test.test_type}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <Badge className={`${STATUS_COLORS[test.status] || "bg-gray-100"} mt-1`}>
                  {STATUS_LABELS[test.status as keyof typeof STATUS_LABELS] || test.status}
                </Badge>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Técnico Responsável</h3>
                <p>{test.technician_name || "N/A"}</p>
              </div>
              
              {test.approved_by_name && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Aprovado por</h3>
                  <p>{test.approved_by_name}</p>
                </div>
              )}
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Data de Início</h3>
                <p>{formatDate(test.created_at)}</p>
              </div>
              
              {test.result_date && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Data do Resultado</h3>
                  <p>{formatDate(test.result_date)}</p>
                </div>
              )}
              
              {test.approval_date && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Data de Aprovação</h3>
                  <p>{formatDate(test.approval_date)}</p>
                </div>
              )}
            </div>
            
            {test.method && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Método</h3>
                  <p>{test.method}</p>
                </div>
              </>
            )}
            
            {test.equipment && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Equipamento</h3>
                <p>{test.equipment}</p>
              </div>
            )}
            
            {test.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Observações</h3>
                  <p className="text-sm text-gray-600">{test.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="h-5 w-5 text-primary" />
              Detalhes da Amostra
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sample ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Código</h3>
                    <p>{sample.code}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Número do Lote</h3>
                    <p>{sample.batch_number || "N/A"}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Organização</h3>
                  <p>{sample.organization_name || "N/A"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Data de Recebimento</h3>
                  <p>{sample.received_date ? formatDate(sample.received_date) : "Não recebida"}</p>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate(`/laboratory/samples/${sample.id}`)}
                >
                  <Beaker className="mr-2 h-4 w-4" />
                  Ver detalhes completos da amostra
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <AlertCircle className="h-10 w-10 text-orange-500 mb-4" />
                <p className="text-gray-500 text-center">
                  Não foi possível carregar os detalhes da amostra associada a este teste.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Formulário para atualizar resultados */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados do Teste</CardTitle>
          <CardDescription>
            Registre ou atualize os resultados deste teste
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitResults} className="space-y-6">
            {/* Campo de status - comum a todos os testes */}
            <div className="space-y-2">
              <Label htmlFor="test-status">Status do Teste</Label>
              <Select 
                value={resultForm.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger id="test-status">
                  <SelectValue placeholder="Selecione o status" />
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

            {/* Campos específicos para cada tipo de teste */}
            {test.test_type === 'cannabinoid_profile' && (
              <div className="space-y-4 border rounded-md p-4 bg-gray-50">
                <h3 className="text-md font-medium">Perfil de Canabinóides</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Insira as porcentagens (%) de cada canabinoide detectado na amostra
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CANNABINOIDS.map(cannabinoid => (
                    <div key={cannabinoid.id} className="space-y-1">
                      <Label htmlFor={`cannabinoid-${cannabinoid.id}`}>
                        {cannabinoid.name}
                        <span className="ml-1 text-xs text-gray-500">({cannabinoid.description})</span>
                      </Label>
                      <div className="flex items-center">
                        <Input 
                          id={`cannabinoid-${cannabinoid.id}`}
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="0.00"
                          value={resultForm.cannabinoidValues[cannabinoid.id] || ""}
                          onChange={(e) => handleCannabinoidChange(cannabinoid.id, e.target.value)}
                        />
                        <span className="ml-2">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {test.test_type === 'terpene_profile' && (
              <div className="space-y-4 border rounded-md p-4 bg-gray-50">
                <h3 className="text-md font-medium">Perfil de Terpenos</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Insira as porcentagens (%) de cada terpeno detectado na amostra
                </p>
                
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <Label htmlFor="new-terpene">Adicionar Terpeno</Label>
                    <div className="flex gap-2 mt-1">
                      <Input 
                        id="new-terpene"
                        placeholder="Nome do terpeno"
                        value={newTerpene}
                        onChange={(e) => setNewTerpene(e.target.value)}
                      />
                      <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={handleAddTerpene}
                        disabled={!newTerpene}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <Label htmlFor="total-terpenes">Total de Terpenos (%)</Label>
                    <div className="flex items-center mt-1">
                      <Input 
                        id="total-terpenes"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="0.00"
                        value={resultForm.totalTerpenes || ""}
                        onChange={(e) => handleTotalTerpenesChange(e.target.value)}
                      />
                      <span className="ml-2">%</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {terpeneList.map(terpene => (
                    <div key={terpene} className="space-y-1">
                      <Label htmlFor={`terpene-${terpene}`}>
                        {terpene}
                      </Label>
                      <div className="flex items-center">
                        <Input 
                          id={`terpene-${terpene}`}
                          type="number"
                          min="0"
                          max="100"
                          step="0.001"
                          placeholder="0.000"
                          value={resultForm.terpeneValues[terpene] || ""}
                          onChange={(e) => handleTerpeneChange(terpene, e.target.value)}
                        />
                        <span className="ml-2">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {test.test_type !== 'cannabinoid_profile' && test.test_type !== 'terpene_profile' && (
              <div className="space-y-4 border rounded-md p-4 bg-gray-50">
                <h3 className="text-md font-medium">Resultados Gerais</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Insira os resultados relevantes para este tipo de teste
                </p>
                
                {/* Campos genéricos para outros tipos de teste */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="result-concentration">Concentração</Label>
                      <Input 
                        id="result-concentration"
                        placeholder="Concentração ou valor principal"
                        value={resultForm.resultData.concentration || ""}
                        onChange={(e) => handleResultDataChange('concentration', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="result-unit">Unidade</Label>
                      <Input 
                        id="result-unit"
                        placeholder="Unidade de medida"
                        value={resultForm.resultData.unit || ""}
                        onChange={(e) => handleResultDataChange('unit', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="result-method">Método de Análise</Label>
                    <Input 
                      id="result-method"
                      placeholder="Método utilizado na análise"
                      value={resultForm.resultData.method || ""}
                      onChange={(e) => handleResultDataChange('method', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="result-equipment">Equipamento</Label>
                    <Input 
                      id="result-equipment"
                      placeholder="Equipamento utilizado"
                      value={resultForm.resultData.equipment || ""}
                      onChange={(e) => handleResultDataChange('equipment', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="result-interpretation">Interpretação</Label>
                    <Textarea 
                      id="result-interpretation"
                      placeholder="Interpretação dos resultados"
                      value={resultForm.resultData.interpretation || ""}
                      onChange={(e) => handleResultDataChange('interpretation', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Campo de notas - comum a todos os testes */}
            <div className="space-y-2">
              <Label htmlFor="test-notes">Observações</Label>
              <Textarea 
                id="test-notes"
                placeholder="Observações sobre os resultados ou o processo de teste..."
                value={resultForm.notes}
                onChange={handleNotesChange}
                rows={4}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={updateResultsMutation.isPending}
            >
              {updateResultsMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Salvar Resultados
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}