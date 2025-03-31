import React, { useState } from 'react';
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
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Tipos de dados que podem ser importados
const importTypes = [
  { id: 'organizations', label: 'Organizações', icon: Building2 },
  { id: 'users', label: 'Usuários', icon: Users },
  { id: 'doctors', label: 'Médicos', icon: Briefcase },
  { id: 'patients', label: 'Pacientes', icon: Users },
  { id: 'appointments', label: 'Consultas', icon: CalendarClock },
  { id: 'plants', label: 'Plantas', icon: Activity },
  { id: 'modules', label: 'Módulos', icon: MonitorPlay },
];

export default function DataImport() {
  const [activeTab, setActiveTab] = useState('file-upload');
  const [selectedImportType, setSelectedImportType] = useState('');
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
  const { toast } = useToast();

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

    // Inicio da importação
    setImportStatus('processing');
    setImportProgress(0);

    try {
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
      const response = await apiRequest('POST', '/api/admin/import', formData);
      const result = await response.json();

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
          <Button onClick={processImport} disabled={importStatus === 'processing'}>
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