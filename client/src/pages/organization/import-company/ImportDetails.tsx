import React from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Home,
  Loader2,
  Package,
  PackageCheck,
  Truck,
  User,
  AlertCircle
} from 'lucide-react';

import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Status das importações
enum ImportStatus {
  PENDING_SUBMISSION = 'pending_submission',
  SUBMITTED_TO_ANVISA = 'submitted_to_anvisa',
  ANVISA_APPROVED = 'anvisa_approved',
  PREPARING_SHIPMENT = 'preparing_shipment',
  SHIPPED = 'shipped',
  IN_CUSTOMS = 'in_customs',
  CLEARED_CUSTOMS = 'cleared_customs',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  ANVISA_REJECTED = 'anvisa_rejected'
}

// Mapeamento de status para labels em português
const importStatusLabels: Record<ImportStatus, string> = {
  [ImportStatus.PENDING_SUBMISSION]: 'Pendente de Submissão',
  [ImportStatus.SUBMITTED_TO_ANVISA]: 'Enviado para ANVISA',
  [ImportStatus.ANVISA_APPROVED]: 'Aprovado pela ANVISA',
  [ImportStatus.PREPARING_SHIPMENT]: 'Preparando Envio (EUA)',
  [ImportStatus.SHIPPED]: 'Enviado',
  [ImportStatus.IN_CUSTOMS]: 'Em Liberação Alfandegária',
  [ImportStatus.CLEARED_CUSTOMS]: 'Liberado pela Alfândega',
  [ImportStatus.OUT_FOR_DELIVERY]: 'Em Rota de Entrega',
  [ImportStatus.DELIVERED]: 'Entregue',
  [ImportStatus.ANVISA_REJECTED]: 'Rejeitado pela ANVISA'
};

// Mapeamento de status para cores
const importStatusColors: Record<ImportStatus, string> = {
  [ImportStatus.PENDING_SUBMISSION]: 'bg-gray-100 text-gray-800',
  [ImportStatus.SUBMITTED_TO_ANVISA]: 'bg-blue-100 text-blue-800',
  [ImportStatus.ANVISA_APPROVED]: 'bg-green-100 text-green-800',
  [ImportStatus.PREPARING_SHIPMENT]: 'bg-amber-100 text-amber-800',
  [ImportStatus.SHIPPED]: 'bg-purple-100 text-purple-800',
  [ImportStatus.IN_CUSTOMS]: 'bg-orange-100 text-orange-800',
  [ImportStatus.CLEARED_CUSTOMS]: 'bg-teal-100 text-teal-800',
  [ImportStatus.OUT_FOR_DELIVERY]: 'bg-indigo-100 text-indigo-800',
  [ImportStatus.DELIVERED]: 'bg-emerald-100 text-emerald-800',
  [ImportStatus.ANVISA_REJECTED]: 'bg-red-100 text-red-800'
};

// Mapeamento de status para ícones
const importStatusIcons: Record<ImportStatus, React.ReactNode> = {
  [ImportStatus.PENDING_SUBMISSION]: <FileText className="h-4 w-4" />,
  [ImportStatus.SUBMITTED_TO_ANVISA]: <Clock className="h-4 w-4" />,
  [ImportStatus.ANVISA_APPROVED]: <CheckCircle2 className="h-4 w-4" />,
  [ImportStatus.PREPARING_SHIPMENT]: <Package className="h-4 w-4" />,
  [ImportStatus.SHIPPED]: <Truck className="h-4 w-4" />,
  [ImportStatus.IN_CUSTOMS]: <AlertCircle className="h-4 w-4" />,
  [ImportStatus.CLEARED_CUSTOMS]: <PackageCheck className="h-4 w-4" />,
  [ImportStatus.OUT_FOR_DELIVERY]: <Truck className="h-4 w-4" />,
  [ImportStatus.DELIVERED]: <Home className="h-4 w-4" />,
  [ImportStatus.ANVISA_REJECTED]: <AlertCircle className="h-4 w-4" />
};

// Status steps do processo de importação
const importSteps = [
  { status: ImportStatus.PENDING_SUBMISSION, label: 'Pendente de Submissão', icon: <FileText className="h-4 w-4" /> },
  { status: ImportStatus.SUBMITTED_TO_ANVISA, label: 'Enviado para ANVISA', icon: <Clock className="h-4 w-4" /> },
  { status: ImportStatus.ANVISA_APPROVED, label: 'Aprovado pela ANVISA', icon: <CheckCircle2 className="h-4 w-4" /> },
  { status: ImportStatus.PREPARING_SHIPMENT, label: 'Preparando Envio (EUA)', icon: <Package className="h-4 w-4" /> },
  { status: ImportStatus.SHIPPED, label: 'Enviado', icon: <Truck className="h-4 w-4" /> },
  { status: ImportStatus.IN_CUSTOMS, label: 'Em Liberação Alfandegária', icon: <AlertCircle className="h-4 w-4" /> },
  { status: ImportStatus.CLEARED_CUSTOMS, label: 'Liberado pela Alfândega', icon: <PackageCheck className="h-4 w-4" /> },
  { status: ImportStatus.OUT_FOR_DELIVERY, label: 'Em Rota de Entrega', icon: <Truck className="h-4 w-4" /> },
  { status: ImportStatus.DELIVERED, label: 'Entregue', icon: <Home className="h-4 w-4" /> },
];

// Interface para pedidos de importação
interface ImportOrder {
  id: number;
  patientName: string;
  patientId: number;
  status: ImportStatus;
  productName: string;
  createdAt: string;
  updatedAt: string;
  anvisaSubmissionDate?: string;
  anvisaApprovalDate?: string;
  shippingDate?: string;
  deliveryDate?: string;
  trackingNumber?: string;
  notes?: string;
  patientEmail?: string;
  patientPhone?: string;
  patientAddress?: string;
  patientCity?: string;
  patientState?: string;
  patientZipCode?: string;
  doctorName?: string;
  doctorCrm?: string;
  medicalCondition?: string;
  productConcentration?: string;
  productQuantity?: string;
  productManufacturer?: string;
  documents?: {
    prescription?: string;
    medicalReport?: string;
    idDocument?: string;
    anvisaAuthorization?: string;
  };
  statusHistory?: {
    status: ImportStatus;
    date: string;
    notes?: string;
  }[];
}

// Componente para exibir o histórico de status
const StatusTimeline = ({ statusHistory, currentStatus }: { statusHistory: ImportOrder['statusHistory'], currentStatus: ImportStatus }) => {
  // Função para verificar se um status já foi concluído
  const isCompleted = (status: ImportStatus) => {
    if (status === currentStatus) return true;
    
    const statusIndex = importSteps.findIndex(step => step.status === status);
    const currentStatusIndex = importSteps.findIndex(step => step.status === currentStatus);
    
    return statusIndex < currentStatusIndex;
  };
  
  return (
    <div className="space-y-4 mt-4">
      {importSteps.map((step, index) => {
        const statusHistoryItem = statusHistory?.find(item => item.status === step.status);
        const completed = isCompleted(step.status);
        const isCurrent = step.status === currentStatus;
        
        return (
          <div key={index} className={`flex items-start gap-3 ${completed ? '' : 'opacity-50'}`}>
            <div className={`mt-1 ${isCurrent ? 'bg-primary' : completed ? 'bg-primary/70' : 'bg-gray-200'} rounded-full p-1.5`}>
              {completed ? (
                <Check className="h-3 w-3 text-white" />
              ) : (
                <div className="h-3 w-3" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{step.label}</span>
              {statusHistoryItem && (
                <span className="text-xs text-gray-500">
                  {statusHistoryItem.date ? format(parseISO(statusHistoryItem.date), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'N/A'}
                </span>
              )}
              {statusHistoryItem?.notes && (
                <p className="text-xs text-gray-600 mt-1">{statusHistoryItem.notes}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Componente principal de detalhes da importação
export default function ImportDetailsPage() {
  const { id } = useParams();
  const importId = id ? parseInt(id) : 0;
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = React.useState('overview');
  
  // Consulta para buscar detalhes do pedido de importação
  /*
  const { data: importOrder, isLoading, isError } = useQuery<ImportOrder>({
    queryKey: ['import-order', importId],
    // A consulta real deve ser implementada no backend
  });
  */
  
  // Dados mockados para visualização
  const mockOrder: ImportOrder = {
    id: 1003,
    patientName: "Ana Oliveira",
    patientId: 3,
    status: ImportStatus.ANVISA_APPROVED,
    productName: "CBD Capsules 25mg x 30",
    createdAt: "2025-04-05T11:20:00Z",
    updatedAt: "2025-04-18T15:45:00Z",
    anvisaSubmissionDate: "2025-04-07T10:30:00Z",
    anvisaApprovalDate: "2025-04-18T15:45:00Z",
    patientEmail: "ana.oliveira@email.com",
    patientPhone: "(11) 98765-4321",
    patientAddress: "Rua das Flores, 123, Apto 45",
    patientCity: "São Paulo",
    patientState: "SP",
    patientZipCode: "01234-567",
    doctorName: "Dr. Carlos Mendes",
    doctorCrm: "CRM/SP 12345",
    medicalCondition: "Epilepsia refratária com crises parciais complexas",
    productConcentration: "25mg por cápsula",
    productQuantity: "30 cápsulas",
    productManufacturer: "CBD Therapeutics Inc.",
    documents: {
      prescription: "prescription_1003.pdf",
      medicalReport: "medical_report_1003.pdf",
      idDocument: "id_document_1003.pdf",
      anvisaAuthorization: "anvisa_auth_1003.pdf"
    },
    statusHistory: [
      {
        status: ImportStatus.PENDING_SUBMISSION,
        date: "2025-04-05T11:20:00Z",
        notes: "Pedido criado no sistema"
      },
      {
        status: ImportStatus.SUBMITTED_TO_ANVISA,
        date: "2025-04-07T10:30:00Z",
        notes: "Documentação enviada para análise da ANVISA"
      },
      {
        status: ImportStatus.ANVISA_APPROVED,
        date: "2025-04-18T15:45:00Z",
        notes: "Autorização de importação concedida pela ANVISA"
      }
    ]
  };

  // Utilizando dados mockados
  const importOrder = mockOrder;
  const isLoading = false;
  const isError = false;
  
  // Calcular progresso com base no status
  const getProgressPercentage = (status: ImportStatus): number => {
    if (status === ImportStatus.ANVISA_REJECTED) {
      return 0;
    }
    
    const steps = importSteps.filter(step => step.status !== ImportStatus.ANVISA_REJECTED);
    const currentStepIndex = steps.findIndex(step => step.status === status);
    
    return Math.round(((currentStepIndex + 1) / steps.length) * 100);
  };
  
  // Se estiver carregando, mostrar estado de carregamento
  if (isLoading) {
    return (
      <OrganizationLayout>
        <div className="container mx-auto py-8 flex justify-center items-center min-h-[500px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </OrganizationLayout>
    );
  }
  
  // Se ocorreu um erro ou o pedido não foi encontrado
  if (isError || !importOrder) {
    return (
      <OrganizationLayout>
        <div className="container mx-auto py-8">
          <div className="mb-6 flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/organization/import-company')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Pedido não encontrado</h1>
          </div>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>
              Não foi possível encontrar o pedido de importação solicitado. 
              Por favor, verifique o número do pedido ou tente novamente mais tarde.
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={() => navigate('/organization/import-company')} 
            className="mt-4"
          >
            Voltar para Dashboard
          </Button>
        </div>
      </OrganizationLayout>
    );
  }
  
  return (
    <OrganizationLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/organization/import-company')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              Pedido #{importOrder.id} - {importOrder.patientName}
            </h1>
            <p className="text-gray-500">
              {format(parseISO(importOrder.createdAt), 'dd MMMM yyyy, HH:mm', { locale: ptBR })}
            </p>
          </div>
        </div>
        
        {/* Card de Status */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Status do Pedido</CardTitle>
              <Badge className={importStatusColors[importOrder.status]}>
                {importStatusIcons[importOrder.status]}
                <span className="ml-1">{importStatusLabels[importOrder.status]}</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1 text-xs">
                  <span>Progresso</span>
                  <span>{getProgressPercentage(importOrder.status)}%</span>
                </div>
                <Progress value={getProgressPercentage(importOrder.status)} className="h-2" />
              </div>
              
              {importOrder.status === ImportStatus.ANVISA_REJECTED && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Pedido Rejeitado pela ANVISA</AlertTitle>
                  <AlertDescription>
                    {importOrder.notes || "O pedido foi rejeitado pela ANVISA. Entre em contato para mais informações."}
                  </AlertDescription>
                </Alert>
              )}
              
              {importOrder.trackingNumber && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Código de Rastreio</p>
                      <p className="text-lg font-bold">{importOrder.trackingNumber}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Rastrear Encomenda
                    </Button>
                  </div>
                </div>
              )}
              
              {importOrder.status === ImportStatus.ANVISA_APPROVED && (
                <Alert className="mt-4">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Pedido Aprovado pela ANVISA</AlertTitle>
                  <AlertDescription>
                    Seu pedido foi aprovado pela ANVISA em {
                      format(parseISO(importOrder.anvisaApprovalDate || new Date().toISOString()), 
                      'dd/MM/yyyy', { locale: ptBR })
                    }. 
                    A próxima etapa é a preparação do envio nos Estados Unidos.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          {(importOrder.status === ImportStatus.ANVISA_APPROVED || 
            importOrder.status === ImportStatus.PENDING_SUBMISSION) && (
            <CardFooter className="pt-0">
              <div className="flex justify-end w-full">
                {importOrder.status === ImportStatus.PENDING_SUBMISSION && (
                  <Button size="sm">
                    Submeter à ANVISA
                  </Button>
                )}
                {importOrder.status === ImportStatus.ANVISA_APPROVED && (
                  <Button size="sm">
                    Iniciar Envio
                  </Button>
                )}
              </div>
            </CardFooter>
          )}
        </Card>
        
        {/* Informações detalhadas */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Pedido</CardTitle>
            <CardDescription>
              Informações completas sobre o pedido de importação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-1 md:grid-cols-4 mb-6">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="patient">Dados do Paciente</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
              </TabsList>
              
              {/* Aba de Visão Geral */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">Detalhes do Produto</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="font-medium">{importOrder.productName}</p>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                        <div>
                          <p className="text-gray-500">Concentração</p>
                          <p>{importOrder.productConcentration || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Quantidade</p>
                          <p>{importOrder.productQuantity || "N/A"}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-500">Fabricante</p>
                          <p>{importOrder.productManufacturer || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">Dados Médicos</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="font-medium">{importOrder.doctorName || "N/A"}</p>
                      <p className="text-sm">{importOrder.doctorCrm || "N/A"}</p>
                      <div className="mt-2">
                        <p className="text-gray-500 text-sm">Condição Médica</p>
                        <p className="text-sm">{importOrder.medicalCondition || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Cronograma do Pedido</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Data da Solicitação</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="h-3.5 w-3.5 text-gray-600" />
                          <p>{format(parseISO(importOrder.createdAt), 'dd/MM/yyyy', { locale: ptBR })}</p>
                        </div>
                      </div>
                      
                      {importOrder.anvisaSubmissionDate && (
                        <div>
                          <p className="text-gray-500">Envio para ANVISA</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="h-3.5 w-3.5 text-gray-600" />
                            <p>{format(parseISO(importOrder.anvisaSubmissionDate), 'dd/MM/yyyy', { locale: ptBR })}</p>
                          </div>
                        </div>
                      )}
                      
                      {importOrder.anvisaApprovalDate && (
                        <div>
                          <p className="text-gray-500">Aprovação ANVISA</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="h-3.5 w-3.5 text-gray-600" />
                            <p>{format(parseISO(importOrder.anvisaApprovalDate), 'dd/MM/yyyy', { locale: ptBR })}</p>
                          </div>
                        </div>
                      )}
                      
                      {importOrder.shippingDate && (
                        <div>
                          <p className="text-gray-500">Data de Envio</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="h-3.5 w-3.5 text-gray-600" />
                            <p>{format(parseISO(importOrder.shippingDate), 'dd/MM/yyyy', { locale: ptBR })}</p>
                          </div>
                        </div>
                      )}
                      
                      {importOrder.deliveryDate && (
                        <div>
                          <p className="text-gray-500">Data de Entrega</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="h-3.5 w-3.5 text-gray-600" />
                            <p>{format(parseISO(importOrder.deliveryDate), 'dd/MM/yyyy', { locale: ptBR })}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Aba de Dados do Paciente */}
              <TabsContent value="patient" className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-4">Dados Pessoais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Nome Completo</p>
                      <p className="font-medium">{importOrder.patientName}</p>
                    </div>
                    
                    {importOrder.patientEmail && (
                      <div>
                        <p className="text-gray-500">E-mail</p>
                        <p>{importOrder.patientEmail}</p>
                      </div>
                    )}
                    
                    {importOrder.patientPhone && (
                      <div>
                        <p className="text-gray-500">Telefone</p>
                        <p>{importOrder.patientPhone}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {(importOrder.patientAddress || importOrder.patientCity || 
                  importOrder.patientState || importOrder.patientZipCode) && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-4">Endereço de Entrega</h3>
                    <div className="space-y-2 text-sm">
                      {importOrder.patientAddress && (
                        <div>
                          <p className="text-gray-500">Endereço</p>
                          <p>{importOrder.patientAddress}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {importOrder.patientCity && (
                          <div>
                            <p className="text-gray-500">Cidade</p>
                            <p>{importOrder.patientCity}</p>
                          </div>
                        )}
                        
                        {importOrder.patientState && (
                          <div>
                            <p className="text-gray-500">Estado</p>
                            <p>{importOrder.patientState}</p>
                          </div>
                        )}
                        
                        {importOrder.patientZipCode && (
                          <div>
                            <p className="text-gray-500">CEP</p>
                            <p>{importOrder.patientZipCode}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              {/* Aba de Documentos */}
              <TabsContent value="documents" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {importOrder.documents?.prescription && (
                    <div className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="font-medium">Prescrição Médica</span>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Documento submetido em {format(parseISO(importOrder.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  )}
                  
                  {importOrder.documents?.medicalReport && (
                    <div className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="font-medium">Laudo/Relatório Médico</span>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Documento submetido em {format(parseISO(importOrder.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  )}
                  
                  {importOrder.documents?.idDocument && (
                    <div className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="font-medium">Documento de Identificação</span>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Documento submetido em {format(parseISO(importOrder.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  )}
                  
                  {importOrder.documents?.anvisaAuthorization && (
                    <div className="border rounded-md p-4 bg-green-50">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Autorização ANVISA</span>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Documento recebido em {
                          importOrder.anvisaApprovalDate ? 
                          format(parseISO(importOrder.anvisaApprovalDate), 'dd/MM/yyyy', { locale: ptBR }) : 
                          "N/A"
                        }
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Link para ANVISA */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-start gap-2">
                    <ExternalLink className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <a 
                        href="https://www.gov.br/pt-br/servicos/solicitar-autorizacao-para-importacao-excepcional-de-produtos-a-base-de-canabidiol" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary font-medium hover:underline"
                      >
                        Portal de Solicitação de Autorização para Importação Excepcional (ANVISA)
                      </a>
                      <p className="text-sm text-gray-500 mt-1">
                        Link oficial do governo para consulta do status da solicitação de autorização para importação de produtos à base de canabidiol
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Aba de Histórico */}
              <TabsContent value="history" className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-4">Histórico de Status</h3>
                  {importOrder.statusHistory && importOrder.statusHistory.length > 0 ? (
                    <StatusTimeline 
                      statusHistory={importOrder.statusHistory} 
                      currentStatus={importOrder.status} 
                    />
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Nenhum histórico de status disponível.
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </OrganizationLayout>
  );
}