import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Upload, 
  Database, 
  AlertCircle, 
  Check, 
  RefreshCw, 
  XCircle,
  FileJson,
  FileSpreadsheet,
  FileText,
  Users,
  Briefcase,
  CalendarClock,
  Activity,
  Building2,
  MonitorPlay,
  BrainCircuit,
  Sparkles,
  Target,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  FolderTree,
  FileBarChart,
  Package,
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

// Tipos de dados para organização
interface Organization {
  id: number;
  name: string;
  status: string;
}

// Tipos de dados que podem ser importados
const importTypes = [
  { id: 'organizations', label: 'Organizações', icon: Building2 },
  { id: 'users', label: 'Usuários', icon: Users },
  { id: 'doctors', label: 'Médicos', icon: Briefcase },
  { id: 'patients', label: 'Pacientes', icon: Users },
  { id: 'appointments', label: 'Consultas', icon: CalendarClock },
  { id: 'plants', label: 'Plantas', icon: Activity },
  { id: 'financial_transactions', label: 'Transações Financeiras', icon: DollarSign },
  { id: 'financial_categories', label: 'Categorias Financeiras', icon: FolderTree },
  { id: 'cost_centers', label: 'Centros de Custo', icon: Target },
  { id: 'financial_reports', label: 'Relatórios Financeiros', icon: FileBarChart },
  { id: 'products', label: 'Produtos', icon: Package },
];

export default function DataImport() {
  const [activeTab, setActiveTab] = useState('file-upload');
  const [selectedImportType, setSelectedImportType] = useState('');
  const [selectedOrganizationId, setSelectedOrganizationId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [jsonData, setJsonData] = useState('');
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [importResult, setImportResult] = useState<{
    totalRecords: number;
    successCount: number;
    errorCount: number;
    errors: Array<{ line: number; message: string }>;
  }>({
    totalRecords: 0,
    successCount: 0,
    errorCount: 0,
    errors: [],
  });
  const [aiAnalysisEnabled, setAiAnalysisEnabled] = useState(true);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    recommendations: Array<string>;
    dataSummary: string;
    detectedIssues: Array<{
      severity: 'low' | 'medium' | 'high';
      description: string;
      suggestion: string;
    }>;
    autoCorrections: number;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  
  // Buscar organizações para o seletor
  const { data: organizations, isLoading: isLoadingOrganizations } = useQuery<Organization[]>({
    queryKey: ['/api/organizations'],
    queryFn: async () => {
      return await apiRequest('/api/organizations', {
        method: 'GET'
      });
    }
  });

  // Manipulador de upload de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Para arquivos JSON, pré-visualizar o conteúdo
      if (selectedFile.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const json = JSON.parse(event.target?.result as string);
            setJsonData(JSON.stringify(json, null, 2));
          } catch (error) {
            setJsonData('Erro ao analisar o arquivo JSON');
          }
        };
        reader.readAsText(selectedFile);
      } else {
        setJsonData('');
      }
    }
  };

  // Analisar dados com IA
  const analyzeDataWithAI = async () => {
    if (!file && !jsonData && !apiEndpoint) {
      toast({
        title: "Dados não encontrados",
        description: "Por favor, forneça dados para análise através de upload de arquivo, entrada JSON ou API.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAiAnalysisResult(null);

    try {
      // Preparar os dados para envio
      const formData = new FormData();
      
      if (activeTab === 'file-upload' && file) {
        formData.append('file', file);
        formData.append('type', selectedImportType);
      } else if (activeTab === 'api-import') {
        formData.append('apiEndpoint', apiEndpoint);
        formData.append('type', selectedImportType);
      } else if (activeTab === 'json-input') {
        formData.append('jsonData', jsonData);
        formData.append('type', selectedImportType);
      }

      // Processar análise
      // Simulação: Normalmente chamaria o backend
      setTimeout(() => {
        // Dados simulados para demonstração
        const mockAnalysisResult = {
          recommendations: selectedImportType === 'products' ? [
            "Recomendamos padronizar as categorias de produtos",
            "Considere adicionar códigos SKU únicos para cada produto",
            "Verificamos inconsistências nos valores de preço em alguns produtos",
            "Faltam imagens para 32 produtos - considere adicionar"
          ] : [
            "Recomendamos adicionar validação para CPF em registros de pacientes",
            "Considere normalizar os nomes de campos para melhor compatibilidade",
            "Encontramos possíveis duplicidades em 12 registros"
          ],
          dataSummary: `Analisamos ${selectedImportType === 'patients' ? '3.245 registros de pacientes' : 
                         selectedImportType === 'organizations' ? '42 registros de organizações' : 
                         selectedImportType === 'doctors' ? '187 registros de médicos' :
                         selectedImportType === 'products' ? '478 registros de produtos' :
                         '953 registros'} e identificamos algumas oportunidades de melhoria.`,
          detectedIssues: selectedImportType === 'products' ? [
            {
              severity: 'high' as const,
              description: "Códigos de produto duplicados em 7 registros",
              suggestion: "Verifique e corrija os códigos SKU para garantir unicidade"
            },
            {
              severity: 'medium' as const,
              description: "Preços negativos ou zerados em 3 produtos",
              suggestion: "Verifique e corrija os valores de preço antes da importação"
            },
            {
              severity: 'low' as const,
              description: "Categorias indefinidas em 12 produtos",
              suggestion: "Defina categorias apropriadas para facilitar a navegação no catálogo"
            }
          ] : [
            {
              severity: 'high' as const,
              description: "CPFs inválidos detectados em 18 registros",
              suggestion: "Aplique validação de CPF padrão antes da importação"
            },
            {
              severity: 'medium' as const,
              description: "Campos de nome incompletos em 5 registros",
              suggestion: "Verifique e complete os dados ausentes"
            },
            {
              severity: 'low' as const,
              description: "Datas em formato inconsistente",
              suggestion: "Padronize para formato ISO 8601 (YYYY-MM-DD)"
            }
          ],
          autoCorrections: 14
        };
        
        setAiAnalysisResult(mockAnalysisResult);
        setIsAnalyzing(false);
        
        toast({
          title: "Análise concluída",
          description: "Nossa IA encontrou oportunidades de melhoria nos seus dados",
        });
      }, 2500);
      
    } catch (error: any) {
      setIsAnalyzing(false);
      
      toast({
        title: "Erro na análise",
        description: error.message || "Não foi possível analisar os dados",
        variant: "destructive",
      });
    }
  };

  // Simular processamento de importação
  const processImport = async () => {
    if (!selectedImportType) {
      toast({
        title: "Erro",
        description: "Selecione um tipo de importação",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedOrganizationId) {
      toast({
        title: "Erro",
        description: "Selecione uma organização de destino para a importação",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === 'file-upload' && !file) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo para importar",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === 'api-import' && !apiEndpoint) {
      toast({
        title: "Erro",
        description: "Informe o endpoint da API",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === 'json-input' && !jsonData) {
      toast({
        title: "Erro",
        description: "Insira os dados JSON",
        variant: "destructive",
      });
      return;
    }

    // Se a análise AI estiver habilitada e não foi executada, pergunte ao usuário
    if (aiAnalysisEnabled && !aiAnalysisResult && !isAnalyzing) {
      const shouldAnalyze = window.confirm(
        "Você habilitou a análise de IA mas ainda não analisou os dados. Deseja analisar os dados antes de importar?"
      );
      
      if (shouldAnalyze) {
        await analyzeDataWithAI();
        return;
      }
    }

    // Inicio da importação
    setImportStatus('processing');
    setImportProgress(0);

    try {
      const formData = new FormData();
      
      // Adiciona o ID da organização de destino
      formData.append('organizationId', selectedOrganizationId);
      
      if (activeTab === 'file-upload' && file) {
        formData.append('file', file);
        formData.append('type', selectedImportType);
      } else if (activeTab === 'api-import') {
        formData.append('apiEndpoint', apiEndpoint);
        formData.append('type', selectedImportType);
      } else if (activeTab === 'json-input') {
        formData.append('jsonData', jsonData);
        formData.append('type', selectedImportType);
      }

      // Adicionar os resultados da análise IA, se disponíveis
      if (aiAnalysisEnabled && aiAnalysisResult) {
        formData.append('aiAnalysis', JSON.stringify(aiAnalysisResult));
        formData.append('applyAutoCorrections', 'true');
      }

      // Simular processamento com progresso
      const intervalId = setInterval(() => {
        setImportProgress((prev) => {
          if (prev >= 95) {
            clearInterval(intervalId);
            return prev;
          }
          return prev + Math.floor(Math.random() * 10);
        });
      }, 500);

      // Chamar API de importação
      const result = await apiRequest('/api/admin/import', {
        method: 'POST',
        data: formData
      });

      clearInterval(intervalId);
      setImportProgress(100);
      setImportStatus('success');
      setImportResult(result);

      toast({
        title: "Importação concluída",
        description: `${result.successCount} registros importados com sucesso, ${result.errorCount} erros`,
      });
    } catch (error: any) {
      setImportStatus('error');
      setImportProgress(0);
      
      toast({
        title: "Erro na importação",
        description: error.message || "Ocorreu um erro durante a importação",
        variant: "destructive",
      });
    }
  };

  const renderImportStatus = () => {
    if (importStatus === 'idle') return null;

    return (
      <div className="mb-8">
        {importStatus === 'processing' && (
          <div className="space-y-2">
            <div className="flex items-center">
              <RefreshCw className="h-5 w-5 text-blue-500 mr-2 animate-spin" />
              <span>Processando importação...</span>
            </div>
            <Progress value={importProgress} className="h-2" />
            <p className="text-sm text-gray-500">Aguarde enquanto processamos seus dados. Isso pode levar alguns minutos para grandes volumes de dados.</p>
          </div>
        )}

        {importStatus === 'success' && (
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-500" />
            <AlertTitle>Importação concluída com sucesso</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-2">
                <div className="flex space-x-4">
                  <div>
                    <Badge variant="outline" className="bg-gray-100">Total: {importResult.totalRecords}</Badge>
                  </div>
                  <div>
                    <Badge variant="outline" className="bg-green-100 text-green-800">Sucesso: {importResult.successCount}</Badge>
                  </div>
                  <div>
                    <Badge variant="outline" className="bg-red-100 text-red-800">Erros: {importResult.errorCount}</Badge>
                  </div>
                </div>
                
                {importResult.errorCount > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium">Detalhes dos erros:</p>
                    <div className="mt-1 max-h-40 overflow-y-auto bg-gray-50 p-2 rounded text-sm">
                      {importResult.errors.map((error, index) => (
                        <div key={index} className="py-1 border-b border-gray-200 last:border-0">
                          <span className="font-medium">Linha {error.line}:</span> {error.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {importStatus === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro na importação</AlertTitle>
            <AlertDescription>
              Ocorreu um erro durante o processo de importação. Por favor, verifique o formato dos dados e tente novamente.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Importação de Dados</h1>
          <p className="text-gray-500 mt-1">
            Ferramenta administrativa para importação de dados da plataforma antiga
          </p>
        </div>
      </div>

      {renderImportStatus()}
      
      {/* Exibir resultados da análise de IA */}
      {isAnalyzing && (
        <div className="mb-8">
          <Card className="w-full bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <BrainCircuit className="h-5 w-5 text-blue-500 animate-pulse" />
                <h3 className="text-lg font-medium text-blue-800">Analisando seus dados...</h3>
              </div>
              <Progress value={45} className="h-2 mt-4" />
              <p className="text-sm text-blue-700 mt-2">
                Nossa IA está processando seus dados. Isso pode levar alguns segundos.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
      
      {aiAnalysisResult && !isAnalyzing && (
        <div className="mb-8">
          <Card className="w-full overflow-hidden">
            <CardHeader className="bg-indigo-50 border-b border-indigo-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                  <CardTitle className="text-indigo-800">Análise de IA Concluída</CardTitle>
                </div>
                <Badge variant="outline" className="bg-indigo-100 text-indigo-800">
                  {aiAnalysisResult.autoCorrections} Correções Automáticas
                </Badge>
              </div>
              <CardDescription className="text-indigo-700">
                {aiAnalysisResult.dataSummary}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6 space-y-6">
              {/* Recomendações */}
              <div>
                <h4 className="text-base font-medium mb-2 flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  Recomendações
                </h4>
                <ul className="space-y-1.5 pl-6 list-disc text-sm">
                  {aiAnalysisResult.recommendations.map((rec, i) => (
                    <li key={i} className="text-gray-700">{rec}</li>
                  ))}
                </ul>
              </div>
              
              {/* Problemas detectados */}
              <div>
                <h4 className="text-base font-medium mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                  Problemas Detectados
                </h4>
                <div className="space-y-3">
                  {aiAnalysisResult.detectedIssues.map((issue, i) => (
                    <div key={i} className={`p-3 rounded-md ${
                      issue.severity === 'high' ? 'bg-red-50 border border-red-100' :
                      issue.severity === 'medium' ? 'bg-amber-50 border border-amber-100' :
                      'bg-blue-50 border border-blue-100'
                    }`}>
                      <div className="flex items-start">
                        <div className={`rounded-full p-1 mr-2 ${
                          issue.severity === 'high' ? 'bg-red-100 text-red-500' :
                          issue.severity === 'medium' ? 'bg-amber-100 text-amber-500' :
                          'bg-blue-100 text-blue-500'
                        }`}>
                          <AlertCircle className="h-4 w-4" />
                        </div>
                        <div>
                          <p className={`font-medium ${
                            issue.severity === 'high' ? 'text-red-700' :
                            issue.severity === 'medium' ? 'text-amber-700' :
                            'text-blue-700'
                          }`}>{issue.description}</p>
                          <p className="text-sm mt-1 text-gray-600">
                            <span className="font-medium">Sugestão:</span> {issue.suggestion}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="bg-gray-50 border-t px-6 py-4">
              <div className="flex justify-between items-center w-full">
                <Button variant="outline" onClick={() => setAiAnalysisResult(null)}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Descartar Análise
                </Button>
                <Button onClick={processImport}>
                  <Upload className="h-4 w-4 mr-2" />
                  Continuar com Importação
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Configuração da Importação</CardTitle>
          <CardDescription>
            Escolha o tipo de dados e o método de importação que deseja utilizar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="import-type">Tipo de Dados</Label>
            <Select 
              value={selectedImportType} 
              onValueChange={setSelectedImportType}
            >
              <SelectTrigger id="import-type" className="w-full">
                <SelectValue placeholder="Selecione o tipo de dado" />
              </SelectTrigger>
              <SelectContent>
                {importTypes.map(type => (
                  <SelectItem key={type.id} value={type.id} className="flex items-center">
                    <div className="flex items-center">
                      {React.createElement(type.icon, { className: "h-4 w-4 mr-2" })}
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Seletor de Organização de Destino */}
          <div className="space-y-2">
            <Label htmlFor="target-organization" className="flex items-center">
              <Target className="h-4 w-4 mr-2 text-indigo-600" />
              Organização de Destino
              <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-800 text-xs">Obrigatório</Badge>
            </Label>
            <Select 
              value={selectedOrganizationId} 
              onValueChange={setSelectedOrganizationId}
              disabled={isLoadingOrganizations}
            >
              <SelectTrigger id="target-organization" className="w-full">
                <SelectValue placeholder={isLoadingOrganizations ? "Carregando organizações..." : "Selecione a organização de destino"} />
              </SelectTrigger>
              <SelectContent>
                {organizations && organizations.map(org => (
                  <SelectItem key={org.id} value={org.id.toString()}>
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{org.name}</span>
                      {org.status !== 'active' && (
                        <Badge variant="outline" className="ml-2 bg-red-50 text-red-800 text-xs">
                          {org.status}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
                {(!organizations || organizations.length === 0) && !isLoadingOrganizations && (
                  <div className="p-2 text-center text-sm text-gray-500">
                    Nenhuma organização encontrada
                  </div>
                )}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Esta é a organização para onde os dados serão importados. Este passo é essencial para migrar corretamente os clientes do sistema legado para o Endurancy.
            </p>
          </div>

          <Tabs defaultValue="file-upload" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="file-upload" className="flex items-center">
                <Upload className="h-4 w-4 mr-2" />
                <span>Upload de Arquivo</span>
              </TabsTrigger>
              <TabsTrigger value="api-import" className="flex items-center">
                <Database className="h-4 w-4 mr-2" />
                <span>Importar de API</span>
              </TabsTrigger>
              <TabsTrigger value="json-input" className="flex items-center">
                <FileJson className="h-4 w-4 mr-2" />
                <span>Entrada JSON</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="file-upload" className="space-y-4 pt-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Formatos suportados</AlertTitle>
                <AlertDescription>
                  <p className="text-sm">
                    Suportamos arquivos CSV, Excel (.xlsx, .xls) e JSON para importação. Certifique-se de que os dados estão formatados corretamente. 
                    <a href="#" className="text-primary underline ml-1">Ver exemplos.</a>
                  </p>
                </AlertDescription>
              </Alert>
              
              <div className="grid gap-4">
                <Label htmlFor="file">Arquivo</Label>
                <Input 
                  id="file" 
                  type="file" 
                  accept=".csv,.xlsx,.xls,.json" 
                  onChange={handleFileChange}
                />
                
                {file && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center mb-2">
                      {file.type.includes('sheet') ? (
                        <FileSpreadsheet className="h-5 w-5 text-green-500 mr-2" />
                      ) : file.type.includes('json') ? (
                        <FileJson className="h-5 w-5 text-amber-500 mr-2" />
                      ) : (
                        <FileText className="h-5 w-5 text-blue-500 mr-2" />
                      )}
                      <span className="font-medium">{file.name}</span>
                      <span className="ml-2 text-sm text-gray-500">({(file.size / 1024).toFixed(2)} KB)</span>
                    </div>
                    
                    {jsonData && (
                      <div className="mt-4">
                        <Label>Prévia de dados JSON:</Label>
                        <div className="mt-1 max-h-60 overflow-y-auto bg-gray-800 text-gray-100 p-4 rounded text-sm font-mono">
                          <pre>{jsonData}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="api-import" className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="api-endpoint">URL da API</Label>
                  <Input 
                    id="api-endpoint" 
                    placeholder="https://api.plataformaantiga.com/export/data" 
                    value={apiEndpoint}
                    onChange={(e) => setApiEndpoint(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Informe a URL da API da plataforma antiga que fornecerá os dados.
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="api-auth" className="mb-1 block">Autenticação (opcional)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input id="api-auth-user" placeholder="Usuário" />
                    <Input id="api-auth-pass" type="password" placeholder="Senha" />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="json-input" className="space-y-4 pt-4">
              <div className="grid gap-4">
                <Label htmlFor="json-data">Dados JSON</Label>
                <Textarea 
                  id="json-data" 
                  placeholder='[{"id": 1, "name": "Exemplo"}, ...]' 
                  className="font-mono h-64"
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Atenção</h4>
                <p className="text-sm text-amber-700">
                  A importação de dados é um processo irreversível. Certifique-se de que os dados estão corretos e de que você tem um backup do banco de dados antes de prosseguir.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
            <div className="flex items-start">
              <BrainCircuit className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Análise com Inteligência Artificial</h4>
                <p className="text-sm text-blue-700 mb-2">
                  Nossa IA pode analisar seus dados antes da importação para detectar problemas, sugerir correções e otimizar o processo.
                </p>
                <div className="flex items-center mt-1">
                  <Switch
                    id="ai-analysis"
                    checked={aiAnalysisEnabled}
                    onCheckedChange={setAiAnalysisEnabled}
                  />
                  <Label htmlFor="ai-analysis" className="ml-2">
                    {aiAnalysisEnabled ? "Ativado" : "Desativado"}
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => {
            setFile(null);
            setApiEndpoint('');
            setJsonData('');
            setImportStatus('idle');
            setSelectedImportType('');
          }}>
            <XCircle className="h-4 w-4 mr-2" />
            Limpar
          </Button>
          <div className="flex space-x-2">
            {aiAnalysisEnabled && (
              <Button 
                variant="outline" 
                onClick={analyzeDataWithAI} 
                disabled={isAnalyzing || !selectedImportType || (activeTab === 'file-upload' && !file) || (activeTab === 'api-import' && !apiEndpoint) || (activeTab === 'json-input' && !jsonData)}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                {isAnalyzing ? (
                  <>
                    <BrainCircuit className="h-4 w-4 mr-2 animate-pulse" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <BrainCircuit className="h-4 w-4 mr-2" />
                    Analisar com IA
                  </>
                )}
              </Button>
            )}
            
            <Button 
              onClick={processImport} 
              disabled={importStatus === 'processing' || isAnalyzing}
            >
              {importStatus === 'processing' ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Iniciar Importação
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      <Card className="w-full mt-8">
        <CardHeader>
          <CardTitle>Histórico de Importações</CardTitle>
          <CardDescription>
            Últimas importações realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left rtl:text-right">
              <thead className="text-xs uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Data</th>
                  <th scope="col" className="px-6 py-3">Tipo</th>
                  <th scope="col" className="px-6 py-3">Usuário</th>
                  <th scope="col" className="px-6 py-3">Método</th>
                  <th scope="col" className="px-6 py-3">Registros</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white border-b">
                  <td className="px-6 py-4">30/03/2025 14:32</td>
                  <td className="px-6 py-4">Pacientes</td>
                  <td className="px-6 py-4">admin@comply.com</td>
                  <td className="px-6 py-4">Upload CSV</td>
                  <td className="px-6 py-4">1,245</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Check className="h-3 w-3 mr-1" />
                      Concluído
                    </span>
                  </td>
                </tr>
                <tr className="bg-white border-b">
                  <td className="px-6 py-4">29/03/2025 10:15</td>
                  <td className="px-6 py-4">Organizações</td>
                  <td className="px-6 py-4">admin@comply.com</td>
                  <td className="px-6 py-4">API</td>
                  <td className="px-6 py-4">42</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Check className="h-3 w-3 mr-1" />
                      Concluído
                    </span>
                  </td>
                </tr>
                <tr className="bg-white">
                  <td className="px-6 py-4">28/03/2025 16:47</td>
                  <td className="px-6 py-4">Consultas</td>
                  <td className="px-6 py-4">admin@comply.com</td>
                  <td className="px-6 py-4">Upload Excel</td>
                  <td className="px-6 py-4">867</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Parcial
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}