import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, Clock, FileText, Package, MessageSquare, ShoppingBag, FileEdit, 
  CalendarClock, Phone, Home, Mail, Globe, MapPin, Bell, Upload, File, 
  FilePlus, FileCheck, Trash2, AlertCircle, Download, Loader2
} from 'lucide-react';
import { PatientQuickActions } from '@/components/dashboard/QuickActions';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Prescription {
  id: number;
  medicamento: string;
  dosagem: string;
  medico: string;
  validade: string;
  status: 'ativa' | 'inativa' | 'expirada';
}

interface Appointment {
  id: number;
  medico: string;
  tipo: string;
  data: string;
  horario: string;
  modalidade: 'presencial' | 'telemedicina';
}

interface Subscription {
  id: number;
  nome: string;
  valor: number;
  vencimento: string;
  pagamento: string;
  status: 'pago' | 'pendente' | 'atrasado';
}

interface PatientDocument {
  id: number;
  fileName: string;
  originalName: string;
  type: string;
  category: 'identity' | 'medical' | 'prescription' | 'insurance' | 'other';
  uploadDate: string;
  size: number;
  status: 'pending' | 'approved' | 'rejected';
  url: string;
}

const PatientDashboard = () => {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('visao-geral');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPrescription, setCurrentPrescription] = useState<Prescription | null>(null);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [organizationInfo, setOrganizationInfo] = useState<{
    name: string; 
    id: number; 
    status: string;
    type?: string;
    email?: string;
    phone?: string;
    website?: string;
    city?: string;
    state?: string;
    plan?: any;
  } | null>(null);
  const [treatmentStatus, setTreatmentStatus] = useState({
    months: 0,
    activeMedications: 0,
    nextAppointmentDays: 0,
    pendingOrders: 0
  });
  
  // Estados para gerenciamento de documentos
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [documentToDelete, setDocumentToDelete] = useState<PatientDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Verificar se o usuário está logado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log("Usuário não autenticado. Redirecionando para o login...");
      window.location.href = '/patient/login';
    }
  }, [authLoading, isAuthenticated]);

  // Função para carregar documentos do paciente
  const fetchDocuments = async () => {
    try {
      // Em produção, esta chamada seria para uma API real
      // const response = await axios.get('/api/patient/documents');
      // setDocuments(response.data);
      
      // Simular dados para demonstração
      const mockDocuments: PatientDocument[] = [
        {
          id: 1,
          fileName: 'doc-12345.pdf',
          originalName: 'Laudo Médico - Dr. Silva.pdf',
          type: 'application/pdf',
          category: 'medical',
          uploadDate: new Date(2024, 0, 15).toISOString(),
          size: 1024576, // 1MB
          status: 'approved',
          url: '/uploads/documents/doc-12345.pdf',
        },
        {
          id: 2,
          fileName: 'doc-67890.jpg',
          originalName: 'CartãoSUS.jpg',
          type: 'image/jpeg',
          category: 'identity',
          uploadDate: new Date(2024, 1, 3).toISOString(),
          size: 512000, // 500KB
          status: 'approved',
          url: '/uploads/documents/doc-67890.jpg',
        },
        {
          id: 3,
          fileName: 'doc-24680.pdf',
          originalName: 'Prescrição - CBD Oil.pdf',
          type: 'application/pdf',
          category: 'prescription',
          uploadDate: new Date(2024, 2, 20).toISOString(),
          size: 307200, // 300KB
          status: 'pending',
          url: '/uploads/documents/doc-24680.pdf',
        }
      ];
      
      setDocuments(mockDocuments);
      console.log('Documentos carregados:', mockDocuments);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      toast({
        title: "Erro ao carregar documentos",
        description: "Não foi possível carregar seus documentos. Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  };
  
  // Função para enviar um documento
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !selectedCategory) {
      toast({
        title: "Erro no upload",
        description: "Selecione um arquivo e uma categoria para o documento.",
        variant: "destructive"
      });
      return;
    }
    
    const file = files[0];
    
    // Verifica o tamanho do arquivo (limite de 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 5MB.",
        variant: "destructive"
      });
      return;
    }
    
    // Verifica os tipos de arquivo permitidos
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de arquivo não permitido",
        description: "Apenas arquivos PDF, JPEG e PNG são aceitos.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simular progresso de upload
      const simulateProgress = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.floor(Math.random() * 10) + 5;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
          }
          setUploadProgress(progress);
        }, 300);
        
        return interval;
      };
      
      const progressInterval = simulateProgress();
      
      // Simulação de upload
      await new Promise(resolve => setTimeout(resolve, 2500));
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Em produção, aqui teríamos o upload real para a API:
      /*
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', selectedCategory);
      
      const response = await axios.post('/api/patient/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      const newDocument = response.data;
      */
      
      // Criar um novo documento simulado para demonstração
      const newDocument: PatientDocument = {
        id: documents.length + 1,
        fileName: `doc-${Date.now()}.${file.name.split('.').pop()}`,
        originalName: file.name,
        type: file.type,
        category: selectedCategory as 'identity' | 'medical' | 'prescription' | 'insurance' | 'other',
        uploadDate: new Date().toISOString(),
        size: file.size,
        status: 'pending',
        url: URL.createObjectURL(file), // Criar URL temporária para demonstração
      };
      
      // Atualizar a lista de documentos
      setDocuments([...documents, newDocument]);
      
      // Limpar a seleção
      setSelectedCategory('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast({
        title: "Upload realizado com sucesso",
        description: "Seu documento foi enviado e está aguardando aprovação.",
      });
    } catch (error) {
      console.error('Erro no upload do arquivo:', error);
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro ao enviar o arquivo. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  // Função para excluir um documento
  const handleDeleteDocument = async (documentId: number) => {
    try {
      // Em produção, aqui teríamos a chamada para a API:
      // await axios.delete(`/api/patient/documents/${documentId}`);
      
      // Simular exclusão para demonstração
      const updatedDocuments = documents.filter(doc => doc.id !== documentId);
      setDocuments(updatedDocuments);
      
      toast({
        title: "Documento excluído",
        description: "O documento foi excluído com sucesso.",
      });
      
      setDocumentToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o documento. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  // Formatação do tamanho do arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  // Carregar dados do paciente e da organização vinculada
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simular pequeno atraso para mostrar estado de carregamento
        await new Promise(resolve => setTimeout(resolve, 800));

        // Carregar informações da organização se o paciente estiver vinculado a uma
        if (user?.organizationId) {
          try {
            // Chamar a API para obter informações da organização
            const response = await axios.get(`/api/organizations/${user.organizationId}/info`);
            if (response.data) {
              setOrganizationInfo(response.data);
              console.log('Informações da organização carregadas:', response.data);
            }
          } catch (orgError) {
            console.error('Erro ao carregar informações da organização:', orgError);
          }
        }

        // Simular dados médicos e de tratamento
        // Em um ambiente real, estes dados viriam de APIs específicas para o paciente autenticado
        setCurrentPrescription({
          id: 1,
          medicamento: 'CBD Oil 5%',
          dosagem: '20mg 2x daily',
          medico: 'Dr. João Mendes',
          validade: '2024-05-19',
          status: 'ativa'
        });

        setNextAppointment({
          id: 1,
          medico: 'Dr. João Mendes',
          tipo: 'Follow-up',
          data: '2023-08-15',
          horario: '14:30',
          modalidade: 'telemedicina'
        });

        setSubscription({
          id: 1,
          nome: 'Anuidade 2024',
          valor: 120.00,
          vencimento: '2024-03-15',
          pagamento: '2024-03-10',
          status: 'pago'
        });

        setTreatmentStatus({
          months: 6,
          activeMedications: 2,
          nextAppointmentDays: 3,
          pendingOrders: 1
        });
        
        // Carregar documentos do paciente
        await fetchDocuments();

        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  // Função para verificar se uma data já passou
  const isExpired = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date < today;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-3 text-lg">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900 w-10 h-10 rounded-full flex items-center justify-center mr-3">
              <span className="text-green-600 dark:text-green-400 font-semibold text-lg">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Portal do Paciente</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.name || 'Paciente'} • {organizationInfo?.name || 'Organização de Saúde'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="outline" onClick={() => logout()}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Card com informações da clínica/organização */}
        {organizationInfo && (
          <Card className="mb-8">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Sua Clínica</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">{organizationInfo.name}</h3>
                  <p className="text-sm text-gray-500">{organizationInfo.type || 'Organização de Saúde'}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    {organizationInfo.email && (
                      <p className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{organizationInfo.email}</span>
                      </p>
                    )}
                    {organizationInfo.phone && (
                      <p className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{organizationInfo.phone}</span>
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    {organizationInfo.website && (
                      <p className="flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{organizationInfo.website}</span>
                      </p>
                    )}
                    {organizationInfo.city && organizationInfo.state && (
                      <p className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{organizationInfo.city}, {organizationInfo.state}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* 3-column grid with cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Prescrição Atual */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Prescrição Atual</CardTitle>
            </CardHeader>
            <CardContent>
              {currentPrescription ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">{currentPrescription.medicamento}</h3>
                    <p className="text-sm text-gray-500">{currentPrescription.dosagem}</p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="flex justify-between">
                      <span className="text-gray-500">Médico:</span>
                      <span>{currentPrescription.medico}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500">Válido até:</span>
                      <span>{formatDate(currentPrescription.validade)}</span>
                    </p>
                  </div>
                  <Badge 
                    className={
                      currentPrescription.status === 'ativa' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                        : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                    }
                  >
                    {currentPrescription.status === 'ativa' ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma prescrição ativa encontrada.</p>
              )}
            </CardContent>
          </Card>

          {/* Próxima Consulta */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Próxima Consulta</CardTitle>
            </CardHeader>
            <CardContent>
              {nextAppointment ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">{nextAppointment.medico}</h3>
                    <p className="text-sm text-gray-500">{nextAppointment.tipo}</p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>Data: {formatDate(nextAppointment.data)}</span>
                    </p>
                    <p className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span>Horário: {nextAppointment.horario}</span>
                    </p>
                  </div>
                  <Badge 
                    className={
                      nextAppointment.modalidade === 'telemedicina'
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                        : 'bg-purple-100 text-purple-800 hover:bg-purple-100'
                    }
                  >
                    {nextAppointment.modalidade === 'telemedicina' ? 'Telemedicina' : 'Presencial'}
                  </Badge>
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma consulta agendada.</p>
              )}
            </CardContent>
          </Card>

          {/* Status da Anuidade */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Status da Anuidade</CardTitle>
            </CardHeader>
            <CardContent>
              {subscription ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">{subscription.nome}</h3>
                    <p className="text-xl font-medium">R$ {subscription.valor.toFixed(2).replace('.', ',')}</p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="flex justify-between">
                      <span className="text-gray-500">Vencimento:</span>
                      <span>{formatDate(subscription.vencimento)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500">Pago em:</span>
                      <span>{formatDate(subscription.pagamento)}</span>
                    </p>
                  </div>
                  <Badge 
                    className={
                      subscription.status === 'pago' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                        : subscription.status === 'pendente'
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                          : 'bg-red-100 text-red-800 hover:bg-red-100'
                    }
                  >
                    {subscription.status === 'pago' ? 'Pago' : 
                     subscription.status === 'pendente' ? 'Pendente' : 'Atrasado'}
                  </Badge>
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma informação de anuidade encontrada.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Seção de ações rápidas */}
        <div className="mb-8">
          <PatientQuickActions 
            onAction={(action) => {
              switch (action) {
                case 'novo-pedido':
                  setLocation('/patient/produtos');
                  break;
                case 'enviar-prescricao':
                  setLocation('/patient/prescricoes/nova');
                  break;
                case 'rastrear-pedido':
                  setLocation('/patient/pedidos/rastreamento');
                  break;
                case 'meus-pagamentos':
                  setLocation('/patient/pagamentos');
                  break;
                default:
                  console.log('Ação não implementada:', action);
                  // Feedback para ações não implementadas
                  toast({
                    title: "Funcionalidade em desenvolvimento",
                    description: "Esta funcionalidade estará disponível em breve.",
                    variant: "default"
                  });
              }
            }} 
          />
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-md border">
            <TabsTrigger value="visao-geral" className="rounded-sm">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="produtos" className="rounded-sm">
              Produtos
            </TabsTrigger>
            <TabsTrigger value="meus-pedidos" className="rounded-sm">
              Meus Pedidos
            </TabsTrigger>
            <TabsTrigger value="prescricoes" className="rounded-sm">
              Prescrições
            </TabsTrigger>
            <TabsTrigger value="documentos" className="rounded-sm">
              Documentos
            </TabsTrigger>
            <TabsTrigger value="mensagens" className="rounded-sm">
              Mensagens
            </TabsTrigger>
          </TabsList>
          
          {/* Conteúdo da Aba de Documentos */}
          <TabsContent value="documentos" className="mt-4">
            <div className="space-y-6">
              {/* Upload de Documentos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Upload className="mr-2 h-5 w-5" />
                    Enviar Novo Documento
                  </CardTitle>
                  <CardDescription>
                    Envie documentos relacionados ao seu tratamento ou identificação.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Seleção de Categoria */}
                      <div className="space-y-2">
                        <Label htmlFor="document-category">Categoria do Documento</Label>
                        <Select
                          value={selectedCategory}
                          onValueChange={setSelectedCategory}
                          disabled={isUploading}
                        >
                          <SelectTrigger id="document-category">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="identity">Identificação (RG, CPF, CNH)</SelectItem>
                            <SelectItem value="medical">Laudos e Exames Médicos</SelectItem>
                            <SelectItem value="prescription">Prescrições Médicas</SelectItem>
                            <SelectItem value="insurance">Cartão de Convênio/Plano</SelectItem>
                            <SelectItem value="other">Outros Documentos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Input de Arquivo */}
                      <div className="space-y-2">
                        <Label htmlFor="document-file">Arquivo (PDF, JPG, PNG - Max 5MB)</Label>
                        <Input
                          id="document-file"
                          type="file"
                          ref={fileInputRef}
                          disabled={isUploading}
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileUpload}
                          className="cursor-pointer"
                        />
                      </div>
                    </div>
                    
                    {/* Barra de Progresso */}
                    {isUploading && (
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span className="text-sm">Enviando arquivo...</span>
                          <span className="ml-auto text-sm font-medium">{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Lista de Documentos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <File className="mr-2 h-5 w-5" />
                    Meus Documentos
                  </CardTitle>
                  <CardDescription>
                    Visualize e gerencie os documentos que você enviou.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {documents.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Tamanho</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents.map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell className="font-medium">{doc.originalName}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {doc.category === 'identity' && 'Identificação'}
                                {doc.category === 'medical' && 'Laudos/Exames'}
                                {doc.category === 'prescription' && 'Prescrição'}
                                {doc.category === 'insurance' && 'Convênio'}
                                {doc.category === 'other' && 'Outros'}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(doc.uploadDate)}</TableCell>
                            <TableCell>
                              <Badge 
                                className={
                                  doc.status === 'approved' 
                                    ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                    : doc.status === 'pending'
                                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                                      : 'bg-red-100 text-red-800 hover:bg-red-100'
                                }
                              >
                                {doc.status === 'approved' ? 'Aprovado' : 
                                 doc.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatFileSize(doc.size)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end items-center space-x-2">
                                {/* Visualizar documento */}
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => window.open(doc.url, '_blank')}
                                >
                                  <FileCheck className="h-4 w-4" />
                                </Button>
                                
                                {/* Download documento */}
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = doc.url;
                                    link.setAttribute('download', doc.originalName);
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                
                                {/* Excluir documento */}
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Excluir documento</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja excluir o documento "{doc.originalName}"? Esta ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDeleteDocument(doc.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Excluir
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-6">
                      <div className="mb-4 flex justify-center">
                        <FileText className="h-12 w-12 text-gray-300" />
                      </div>
                      <p className="mb-2 text-lg font-medium">Nenhum documento encontrado</p>
                      <p className="text-sm text-gray-500">
                        Você ainda não enviou nenhum documento. Use o formulário acima para enviar seus documentos.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Conteúdo da Aba de Visão Geral (padrão) */}
          <TabsContent value="visao-geral" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informações de Tratamento */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações de Tratamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="text-gray-600">Consultas realizadas:</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="text-gray-600">Prescrições ativas:</span>
                      <span className="font-medium">{treatmentStatus.activeMedications}</span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="text-gray-600">Próxima consulta:</span>
                      <span className="font-medium">
                        {nextAppointment 
                          ? `${formatDate(nextAppointment.data)} - ${nextAppointment.horario}`
                          : 'Nenhuma agendada'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Tempo de tratamento:</span>
                      <span className="font-medium">{treatmentStatus.months} meses</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status do Tratamento */}
              <Card>
                <CardHeader>
                  <CardTitle>Status do Tratamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center text-rose-600">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="mr-2"
                      >
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                        <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"></path>
                      </svg>
                      <span>Acompanhamento ativo - {treatmentStatus.months} meses</span>
                    </div>
                    
                    <div className="flex items-center text-blue-600">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="mr-2"
                      >
                        <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path>
                        <path d="m8.5 8.5 7 7"></path>
                      </svg>
                      <span>{treatmentStatus.activeMedications} medicações ativas</span>
                    </div>
                    
                    <div className="flex items-center text-emerald-600">
                      <Calendar className="mr-2 h-5 w-5" />
                      <span>Próxima consulta em {treatmentStatus.nextAppointmentDays} dias</span>
                    </div>
                    
                    <div className="flex items-center text-purple-600">
                      <Package className="mr-2 h-5 w-5" />
                      <span>{treatmentStatus.pendingOrders} pedido em trânsito</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PatientDashboard;