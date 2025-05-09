import React, { useState } from 'react';
import { useLocation, Link } from "wouter";
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle, 
  ChevronRight,
  ClipboardCheck,
  Clock,
  Download,
  FileCheck,
  FileSearch,
  FileUp,
  Loader2,
  MailIcon,
  Phone,
  Plane,
  Send,
  UserCircle,
} from 'lucide-react';

// Dados de exemplo para o pedido de importação
const mockImportRequest = {
  id: 1,
  patientName: 'João Silva',
  patientEmail: 'joao.silva@email.com',
  patientPhone: '(11) 98765-4321',
  patientAddress: 'Rua das Flores, 123, Jardim Primavera, São Paulo, SP',
  documentType: 'cpf',
  documentNumber: '123.456.789-00',
  status: 'aprovado',
  product: 'CBD Oil 1000mg',
  quantity: '3 frascos',
  concentration: '1000mg/30ml',
  dosage: '1ml, 2x ao dia',
  prescriptionDate: new Date(2024, 3, 10),
  prescribingDoctor: 'Dra. Amanda Oliveira',
  doctorCRM: 'CRM/SP 123456',
  medicalJustification: 'Paciente com epilepsia refratária, sem resposta adequada aos tratamentos convencionais. Indicação de canabidiol para controle das crises convulsivas baseada em evidências científicas recentes.',
  patientCondition: 'Epilepsia refratária',
  anvisaSubmissionDate: new Date(2024, 3, 12),
  anvisaApprovalDate: new Date(2024, 3, 20),
  trackingCode: 'BR1234567890US',
  expectedDeliveryDate: new Date(2024, 4, 10),
  progress: 90,
  timeline: [
    { date: new Date(2024, 3, 10), description: 'Pedido recebido', status: 'completed' },
    { date: new Date(2024, 3, 12), description: 'Documentação enviada à ANVISA', status: 'completed' },
    { date: new Date(2024, 3, 20), description: 'Aprovação ANVISA recebida', status: 'completed' },
    { date: new Date(2024, 3, 25), description: 'Pedido enviado ao fornecedor nos EUA', status: 'completed' },
    { date: new Date(2024, 4, 3), description: 'Produto em trânsito internacional', status: 'current' },
    { date: new Date(2024, 4, 10), description: 'Entrega prevista', status: 'pending' },
  ],
  updates: [
    { 
      id: 1, 
      date: new Date(2024, 3, 12), 
      author: 'Sistema', 
      content: 'Documentação enviada à ANVISA para análise. O processo leva em média 7 dias úteis.' 
    },
    { 
      id: 2, 
      date: new Date(2024, 3, 20), 
      author: 'Maria Santos', 
      content: 'Aprovação da ANVISA recebida! Iniciaremos o processo de importação com nosso fornecedor nos EUA.' 
    },
    { 
      id: 3, 
      date: new Date(2024, 3, 25), 
      author: 'Pedro Oliveira', 
      content: 'Pedido enviado ao fornecedor. A produção leva cerca de 5 dias úteis antes do envio.' 
    },
    { 
      id: 4, 
      date: new Date(2024, 4, 3), 
      author: 'Sistema', 
      content: 'Produto enviado! Rastreio: BR1234567890US. Acompanhe o status pelo site dos Correios.' 
    }
  ],
  documents: [
    { name: 'Prescrição Médica.pdf', type: 'pdf', size: '420 KB', date: new Date(2024, 3, 10) },
    { name: 'Laudo Médico.pdf', type: 'pdf', size: '1.2 MB', date: new Date(2024, 3, 10) },
    { name: 'Formulário RDC 660.pdf', type: 'pdf', size: '350 KB', date: new Date(2024, 3, 12) },
    { name: 'Autorização ANVISA.pdf', type: 'pdf', size: '580 KB', date: new Date(2024, 3, 20) },
  ]
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'em_analise':
      return <FileSearch className="h-5 w-5 text-blue-500" />;
    case 'enviado_anvisa':
      return <FileUp className="h-5 w-5 text-indigo-500" />;
    case 'aprovado':
      return <FileCheck className="h-5 w-5 text-green-500" />;
    case 'rejeitado':
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case 'em_transito':
      return <Plane className="h-5 w-5 text-orange-500" />;
    case 'entregue':
      return <CheckCircle className="h-5 w-5 text-purple-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'em_analise':
      return 'Em Análise';
    case 'enviado_anvisa':
      return 'Enviado para ANVISA';
    case 'aprovado':
      return 'Aprovado';
    case 'rejeitado':
      return 'Rejeitado';
    case 'em_transito':
      return 'Em Trânsito';
    case 'entregue':
      return 'Entregue';
    default:
      return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'em_analise':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'enviado_anvisa':
      return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    case 'aprovado':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'rejeitado':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'em_transito':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'entregue':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export default function ImportDetails() {
  const [_, params] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('details');
  const [newUpdate, setNewUpdate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Extrair o ID da rota
  const id = params.split('/').pop();

  // Simulamos uma consulta de dados
  const { data: importRequest, isLoading } = useQuery({
    queryKey: [`/api/import-requests/${id}`],
    queryFn: async () => {
      // Em um cenário real, buscaríamos do backend
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(mockImportRequest);
        }, 500);
      });
    }
  });

  const handleAddUpdate = async () => {
    if (!newUpdate.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Em um cenário real, enviaríamos para o backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Atualização adicionada",
        description: "O paciente será notificado sobre esta atualização.",
      });
      
      setNewUpdate('');
    } catch (error) {
      toast({
        title: "Erro ao adicionar atualização",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!importRequest) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link to="/organization/import-company">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para a lista
            </Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Pedido não encontrado</h2>
          <p className="text-muted-foreground">
            O pedido de importação que você está procurando não existe ou foi removido.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="outline" size="sm" asChild className="mr-4">
            <Link to="/organization/import-company">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para a lista
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-blue-700">Detalhes do Pedido #{importRequest.id}</h1>
            <div className="flex items-center mt-1">
              <Badge className={getStatusColor(importRequest.status)} variant="outline">
                {getStatusIcon(importRequest.status)}
                <span className="ml-1">{getStatusText(importRequest.status)}</span>
              </Badge>
              <span className="ml-2 text-sm text-muted-foreground">
                Solicitado em {format(importRequest.prescriptionDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-3 lg:col-span-2">
          <Tabs defaultValue="details" className="space-y-4" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
              <TabsTrigger value="updates">Atualizações</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center">
                    <UserCircle className="h-5 w-5 text-blue-600 mr-2" />
                    <CardTitle>Dados do Paciente</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Nome</p>
                      <p>{importRequest.patientName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Documento</p>
                      <p>{importRequest.documentType === 'cpf' ? 'CPF' : 'Passaporte'}: {importRequest.documentNumber}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <div className="flex items-center">
                        <MailIcon className="h-4 w-4 text-muted-foreground mr-1" />
                        <p>{importRequest.patientEmail}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-muted-foreground mr-1" />
                        <p>{importRequest.patientPhone}</p>
                      </div>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Endereço</p>
                      <p>{importRequest.patientAddress}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center">
                    <FileCheck className="h-5 w-5 text-blue-600 mr-2" />
                    <CardTitle>Dados da Medicação</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Produto</p>
                      <p>{importRequest.product}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Quantidade</p>
                      <p>{importRequest.quantity}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Concentração</p>
                      <p>{importRequest.concentration}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Posologia</p>
                      <p>{importRequest.dosage}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Médico Prescritor</p>
                      <p>{importRequest.prescribingDoctor}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">CRM</p>
                      <p>{importRequest.doctorCRM}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Data da Prescrição</p>
                      <p>{format(importRequest.prescriptionDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Condição do Paciente</p>
                      <p>{importRequest.patientCondition}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Justificativa Médica</p>
                      <p className="text-sm">{importRequest.medicalJustification}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center">
                    <ClipboardCheck className="h-5 w-5 text-blue-600 mr-2" />
                    <CardTitle>Detalhes da Importação</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Data de Envio à ANVISA</p>
                      <p>{format(importRequest.anvisaSubmissionDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Data de Aprovação ANVISA</p>
                      <p>{format(importRequest.anvisaApprovalDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Código de Rastreio</p>
                      <p>{importRequest.trackingCode}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Entrega Prevista</p>
                      <p>{format(importRequest.expectedDeliveryDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Progresso</p>
                      <div className="space-y-2">
                        <Progress value={importRequest.progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Solicitação</span>
                          <span>Análise ANVISA</span>
                          <span>Importação</span>
                          <span>Em trânsito</span>
                          <span>Entrega</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Linha do Tempo</CardTitle>
                  <CardDescription>
                    Acompanhe o histórico e status do pedido
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-3">
                    {importRequest.timeline.map((item, index) => (
                      <li className="mb-10 ml-6" key={index}>
                        <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 
                          ${item.status === 'completed' 
                            ? 'bg-green-500' 
                            : item.status === 'current'
                              ? 'bg-blue-500' 
                              : 'bg-gray-200 dark:bg-gray-700'}`}>
                          {item.status === 'completed' ? (
                            <CheckCircle className="w-3.5 h-3.5 text-white" />
                          ) : item.status === 'current' ? (
                            <Clock className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <span className="w-3.5 h-3.5"></span>
                          )}
                        </span>
                        <h3 className={`flex items-center mb-1 text-lg font-semibold
                          ${item.status === 'completed' 
                            ? 'text-gray-900 dark:text-white' 
                            : item.status === 'current'
                              ? 'text-blue-600 dark:text-blue-500' 
                              : 'text-gray-500 dark:text-gray-400'}`}>
                          {item.description}
                          {item.status === 'current' && (
                            <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 ml-3">
                              Atual
                            </span>
                          )}
                        </h3>
                        <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                          {format(item.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </time>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="updates" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Atualizações do Pedido</CardTitle>
                  <CardDescription>
                    Histórico de comunicações e atualizações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {importRequest.updates.map((update) => (
                      <div key={update.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarFallback>{update.author.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{update.author}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(update.date, "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm">{update.content}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2">Adicionar nova atualização</h3>
                    <div className="flex gap-3">
                      <textarea 
                        className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                        placeholder="Digite uma atualização para o paciente..."
                        value={newUpdate}
                        onChange={(e) => setNewUpdate(e.target.value)}
                      />
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700" 
                        onClick={handleAddUpdate}
                        disabled={isSubmitting || !newUpdate.trim()}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Enviar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Documentos</CardTitle>
                  <CardDescription>
                    Documentos relacionados ao pedido de importação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {importRequest.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center">
                          <div className="p-2 rounded-md bg-blue-50 text-blue-600 mr-3">
                            <FileCheck className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <span>{doc.type.toUpperCase()}</span>
                              <span className="mx-2">•</span>
                              <span>{doc.size}</span>
                              <span className="mx-2">•</span>
                              <span>{format(doc.date, "dd MMM yyyy", { locale: ptBR })}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Baixar
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="col-span-3 lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Próximas Etapas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {importRequest.status === 'em_analise' && (
                  <>
                    <div className="flex items-start space-x-2">
                      <ChevronRight className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Enviar à ANVISA</p>
                        <p className="text-sm text-muted-foreground">
                          Enviar documentação para análise da ANVISA
                        </p>
                      </div>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <FileUp className="mr-2 h-4 w-4" />
                      Enviar à ANVISA
                    </Button>
                  </>
                )}
                
                {importRequest.status === 'enviado_anvisa' && (
                  <>
                    <div className="flex items-start space-x-2">
                      <ChevronRight className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Acompanhar Análise ANVISA</p>
                        <p className="text-sm text-muted-foreground">
                          Verificar status no portal da ANVISA
                        </p>
                      </div>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <FileSearch className="mr-2 h-4 w-4" />
                      Verificar Status ANVISA
                    </Button>
                  </>
                )}
                
                {importRequest.status === 'aprovado' && (
                  <>
                    <div className="flex items-start space-x-2">
                      <ChevronRight className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Iniciar Importação</p>
                        <p className="text-sm text-muted-foreground">
                          Iniciar processo de importação junto ao fornecedor
                        </p>
                      </div>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Plane className="mr-2 h-4 w-4" />
                      Prosseguir com Importação
                    </Button>
                  </>
                )}
                
                {importRequest.status === 'em_transito' && (
                  <>
                    <div className="flex items-start space-x-2">
                      <ChevronRight className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Acompanhar Envio</p>
                        <p className="text-sm text-muted-foreground">
                          Rastrear encomenda e verificar status
                        </p>
                      </div>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Plane className="mr-2 h-4 w-4" />
                      Rastrear Encomenda
                    </Button>
                  </>
                )}
                
                {importRequest.status === 'entregue' && (
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Pedido Concluído</p>
                      <p className="text-sm text-muted-foreground">
                        Produto entregue ao paciente com sucesso!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ANVISA</p>
                  <p className="text-sm">Link RDC 660: <a href="https://www.gov.br/anvisa/pt-br/assuntos/medicamentos/controlados/importacao-de-canabidiol-para-pessoa-fisica" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Portal ANVISA</a></p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rastreamento</p>
                  <p className="text-sm">Rastreie o pedido: <a href={`https://rastreamento.correios.com.br/app/index.php?objeto=${importRequest.trackingCode}`} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Correios</a></p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contato</p>
                  <p className="text-sm">Suporte: <a href="mailto:suporte@empresa.com" className="text-blue-600 hover:underline">suporte@empresa.com</a></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}