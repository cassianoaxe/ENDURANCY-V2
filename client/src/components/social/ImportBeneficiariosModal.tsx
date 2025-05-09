import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  AlertCircle, 
  Download, 
  FileSpreadsheet, 
  Upload, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ImportBeneficiariosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ImportBeneficiariosModal({ open, onOpenChange }: ImportBeneficiariosModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importStatus, setImportStatus] = useState<'idle' | 'validating' | 'processing' | 'success' | 'error'>('idle');
  const [results, setResults] = useState<{
    total: number;
    success: number;
    errors: Array<{ row: number; message: string }>;
  }>({ total: 0, success: 0, errors: [] });

  // Função para criar o modelo de Excel para download
  const downloadTemplate = () => {
    // Define os cabeçalhos das colunas do Excel
    const headers = [
      'Nome*', 
      'CPF*', 
      'RG', 
      'Email', 
      'Telefone', 
      'Data de Nascimento*', 
      'Gênero',
      'Endereço*', 
      'Número', 
      'Complemento', 
      'Bairro', 
      'CEP', 
      'Cidade*', 
      'Estado*',
      'Profissão', 
      'Renda Familiar', 
      'Situação Habitacional',
      'Categorias de Necessidades (separar por vírgula)'
    ];

    // Criar um exemplo de linha para ilustrar o formato
    const exampleRow = [
      'João da Silva',
      '123.456.789-00',
      '1234567',
      'joao@exemplo.com',
      '(11) 98765-4321',
      '15/05/1980',
      'masculino',
      'Rua das Flores',
      '123',
      'Apto 101',
      'Centro',
      '12345-678',
      'São Paulo',
      'SP',
      'Engenheiro',
      '5000',
      'própria',
      'medicamentos,consultas,exames'
    ];

    // Criar workbook e worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);

    // Adicionar informações sobre os campos obrigatórios
    const infoSheet = XLSX.utils.aoa_to_sheet([
      ['Instruções para preenchimento do modelo:'],
      ['1. Os campos marcados com * são obrigatórios'],
      ['2. O formato da data de nascimento deve ser DD/MM/AAAA'],
      ['3. O campo CPF deve ser único para cada beneficiário'],
      ['4. As categorias de necessidades podem ser: medicamentos, consultas, exames, acompanhamento, outros'],
      ['5. Não altere os cabeçalhos das colunas'],
      ['6. Para o campo Gênero, use: masculino, feminino, outro, prefiro_nao_informar'],
      ['7. Para Situação Habitacional, use: própria, alugada, cedida, irregular, outros']
    ]);

    // Adicionar as planilhas ao workbook
    XLSX.utils.book_append_sheet(wb, ws, "Beneficiários");
    XLSX.utils.book_append_sheet(wb, infoSheet, "Instruções");

    // Exportar como arquivo XLSX
    XLSX.writeFile(wb, "modelo_importacao_beneficiarios.xlsx");
  };

  // Função para processar o arquivo Excel
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setImportStatus('idle');
      setResults({ total: 0, success: 0, errors: [] });
      setUploadProgress(0);
    }
  };

  // Mutation para enviar os dados de importação para o servidor
  const importMutation = useMutation({
    mutationFn: async (data: any[]) => {
      return await apiRequest('/api/social/beneficiaries/batch-import', {
        method: 'POST',
        data: { beneficiaries: data }
      });
    },
    onSuccess: (response: any) => {
      setImportStatus('success');
      setResults({
        total: response.total || 0,
        success: response.success || 0,
        errors: response.errors || []
      });
      
      if (response.success > 0) {
        queryClient.invalidateQueries({ queryKey: ['/api/social/beneficiaries'] });
        
        toast({
          title: 'Importação concluída',
          description: `${response.success} de ${response.total} beneficiários importados com sucesso.`,
        });
      }
    },
    onError: (error: any) => {
      setImportStatus('error');
      toast({
        title: 'Erro na importação',
        description: error.message || 'Ocorreu um erro ao processar a importação.',
        variant: 'destructive',
      });
    }
  });

  // Função para processar e validar o arquivo antes de enviar
  const processFile = async () => {
    if (!file) return;

    try {
      setImportStatus('validating');
      setUploadProgress(20);

      // Ler o arquivo Excel
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });

          // Pegar a primeira planilha
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Converter para JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            throw new Error('Arquivo não contém dados suficientes. Verifique se o arquivo está preenchido corretamente.');
          }

          // Pegar os cabeçalhos (primeira linha)
          const headers = jsonData[0] as string[];
          
          // Validar os cabeçalhos esperados
          const requiredHeaders = ['Nome*', 'CPF*', 'Data de Nascimento*', 'Endereço*', 'Cidade*', 'Estado*'];
          const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
          
          if (missingHeaders.length > 0) {
            throw new Error(`Cabeçalhos obrigatórios ausentes: ${missingHeaders.join(', ')}. Baixe o modelo correto e tente novamente.`);
          }

          setUploadProgress(50);
          setImportStatus('processing');

          // Mapear os dados para o formato esperado pela API
          const beneficiaries = [];
          
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            if (row.length === 0 || row.every(cell => !cell)) continue; // Pular linhas vazias
            
            // Mapear células para o formato adequado
            const mappedData: any = {};
            
            headers.forEach((header, index) => {
              const value = row[index];
              
              // Mapeamento de cabeçalhos para nomes de campos no banco
              switch (header) {
                case 'Nome*':
                  mappedData.name = value;
                  break;
                case 'CPF*':
                  mappedData.cpf = value;
                  break;
                case 'RG':
                  mappedData.rg = value;
                  break;
                case 'Email':
                  mappedData.email = value;
                  break;
                case 'Telefone':
                  mappedData.phone = value;
                  break;
                case 'Data de Nascimento*':
                  // Tentar converter data no formato DD/MM/AAAA para AAAA-MM-DD
                  if (value) {
                    if (typeof value === 'string' && value.includes('/')) {
                      const parts = value.split('/');
                      if (parts.length === 3) {
                        mappedData.birthDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                      } else {
                        mappedData.birthDate = value;
                      }
                    } else {
                      mappedData.birthDate = value;
                    }
                  }
                  break;
                case 'Gênero':
                  mappedData.gender = value;
                  break;
                case 'Endereço*':
                  mappedData.address = value;
                  break;
                case 'Número':
                  mappedData.addressNumber = value;
                  break;
                case 'Complemento':
                  mappedData.addressComplement = value;
                  break;
                case 'Bairro':
                  mappedData.neighborhood = value;
                  break;
                case 'CEP':
                  mappedData.zipCode = value;
                  break;
                case 'Cidade*':
                  mappedData.city = value;
                  break;
                case 'Estado*':
                  mappedData.state = value;
                  break;
                case 'Profissão':
                  mappedData.occupation = value;
                  break;
                case 'Renda Familiar':
                  mappedData.familyIncome = value ? Number(value) : undefined;
                  break;
                case 'Situação Habitacional':
                  mappedData.housingStatus = value;
                  break;
                case 'Categorias de Necessidades (separar por vírgula)':
                  if (value) {
                    mappedData.needsCategory = typeof value === 'string' 
                      ? value.split(',').map((c: string) => c.trim())
                      : [value];
                  }
                  break;
              }
            });
            
            // Adicionar status padrão como ativo
            mappedData.status = 'active';
            
            // Adicionar à lista de beneficiários
            beneficiaries.push(mappedData);
          }

          setUploadProgress(80);
          
          // Enviar os dados para o servidor
          await importMutation.mutateAsync(beneficiaries);
          
          setUploadProgress(100);
        } catch (error: any) {
          setImportStatus('error');
          toast({
            title: 'Erro ao processar arquivo',
            description: error.message || 'Ocorreu um erro ao processar o arquivo.',
            variant: 'destructive',
          });
        }
      };

      reader.onerror = () => {
        setImportStatus('error');
        toast({
          title: 'Erro na leitura do arquivo',
          description: 'Não foi possível ler o arquivo selecionado.',
          variant: 'destructive',
        });
      };

      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      setImportStatus('error');
      toast({
        title: 'Erro no processamento',
        description: error.message || 'Ocorreu um erro ao processar o arquivo.',
        variant: 'destructive',
      });
    }
  };

  // Resetar o estado do modal ao fechar
  const handleCloseModal = () => {
    setFile(null);
    setImportStatus('idle');
    setResults({ total: 0, success: 0, errors: [] });
    setUploadProgress(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseModal}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl">Importação de Beneficiários</DialogTitle>
          <DialogDescription>
            Importe múltiplos beneficiários de uma planilha Excel
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 flex-grow overflow-auto">
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={downloadTemplate}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" /> Baixar Modelo Excel
              </Button>
              
              <div className="text-sm text-muted-foreground">
                Baixe o modelo, preencha os dados e faça o upload
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="flex items-center gap-2"
                  disabled={importStatus === 'validating' || importStatus === 'processing'}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Selecionar Arquivo
                </Button>
                <Input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={importStatus === 'validating' || importStatus === 'processing'}
                />
                
                {file && (
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                  </div>
                )}
              </div>
              
              {file && importStatus === 'idle' && (
                <Button 
                  onClick={processFile}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" /> Iniciar Importação
                </Button>
              )}
              
              {(importStatus === 'validating' || importStatus === 'processing') && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>
                      {importStatus === 'validating' ? 'Validando arquivo...' : 'Processando importação...'}
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}
              
              {importStatus === 'success' && (
                <Alert variant="default" className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle>Importação concluída</AlertTitle>
                  <AlertDescription>
                    {results.success} de {results.total} beneficiários foram importados com sucesso.
                    {results.errors.length > 0 && (
                      <div className="mt-2">
                        {results.errors.length} registros apresentaram erros.
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              
              {importStatus === 'error' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro na importação</AlertTitle>
                  <AlertDescription>
                    Ocorreu um erro ao processar o arquivo. Verifique se o formato está correto e tente novamente.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            {importStatus === 'success' && results.errors.length > 0 && (
              <div className="border rounded-md p-4 max-h-[300px] overflow-auto">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Erros na importação
                </h3>
                <ul className="text-sm space-y-1">
                  {results.errors.map((error, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="font-medium">Linha {error.row + 1}:</span> {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-muted/50 flex justify-end">
          <Button variant="outline" onClick={handleCloseModal}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}