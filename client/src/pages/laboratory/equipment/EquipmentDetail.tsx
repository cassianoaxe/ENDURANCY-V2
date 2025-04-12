'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ArrowLeft, 
  Calendar, 
  FileText, 
  Settings, 
  Clipboard, 
  ClipboardCheck, 
  Wrench, 
  AlertTriangle, 
  ChevronDown,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import LaboratoryLayout from '@/components/layout/laboratory/LaboratoryLayout';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { MaintenanceForm } from '@/components/laboratory/equipment/MaintenanceForm';
import { CertificateForm } from '@/components/laboratory/equipment/CertificateForm';

// Função auxiliar para formatar datas
const formatDate = (date: string | null | undefined) => {
  if (!date) return '—';
  return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
};

// Função auxiliar para status de equipamento
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'operational':
      return <Badge className="bg-green-500">Operacional</Badge>;
    case 'maintenance':
      return <Badge className="bg-yellow-500">Em Manutenção</Badge>;
    case 'out_of_service':
      return <Badge className="bg-red-500">Fora de Serviço</Badge>;
    case 'pending_validation':
      return <Badge className="bg-blue-500">Aguardando Validação</Badge>;
    default:
      return <Badge className="bg-gray-500">Indeterminado</Badge>;
  }
};

// Função auxiliar para status de manutenção
const getMaintenanceStatusBadge = (status: string) => {
  switch (status) {
    case 'scheduled':
      return <Badge className="bg-blue-500">Agendada</Badge>;
    case 'in_progress':
      return <Badge className="bg-yellow-500">Em Andamento</Badge>;
    case 'completed':
      return <Badge className="bg-green-500">Concluída</Badge>;
    case 'cancelled':
      return <Badge className="bg-red-500">Cancelada</Badge>;
    default:
      return <Badge className="bg-gray-500">Indeterminado</Badge>;
  }
};

// Função auxiliar para tipo de manutenção
const getMaintenanceTypeBadge = (type: string) => {
  switch (type) {
    case 'preventive':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Preventiva</Badge>;
    case 'corrective':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Corretiva</Badge>;
    case 'calibration':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Calibração</Badge>;
    case 'validation':
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Validação</Badge>;
    default:
      return <Badge variant="outline">Outro</Badge>;
  }
};

// Função auxiliar para status de certificado
const getCertificateStatusBadge = (status: string) => {
  switch (status) {
    case 'valid':
      return <Badge className="bg-green-500">Válido</Badge>;
    case 'expired':
      return <Badge className="bg-red-500">Expirado</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-500">Pendente</Badge>;
    default:
      return <Badge className="bg-gray-500">Indeterminado</Badge>;
  }
};

export default function EquipmentDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  
  // States para modais
  const [isMaintenanceFormOpen, setIsMaintenanceFormOpen] = useState(false);
  const [isCertificateFormOpen, setIsCertificateFormOpen] = useState(false);
  const [isDeleteMaintenanceOpen, setIsDeleteMaintenanceOpen] = useState(false);
  const [isDeleteCertificateOpen, setIsDeleteCertificateOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);

  // Buscar detalhes do equipamento
  const { 
    data: equipmentData, 
    isLoading: isLoadingEquipment, 
    error: equipmentError 
  } = useQuery({
    queryKey: [`/api/laboratory/equipments/${id}`],
    retry: 1,
  });

  // Mutação para adicionar manutenção
  const addMaintenanceMutation = useMutation({
    mutationFn: (newMaintenance: any) => {
      return apiRequest(`/api/laboratory/equipments/${id}/maintenances`, {
        method: 'POST',
        data: newMaintenance,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Manutenção registrada com sucesso',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/laboratory/equipments/${id}`] });
      setIsMaintenanceFormOpen(false);
    },
    onError: (error) => {
      console.error('Erro ao registrar manutenção:', error);
      toast({
        title: 'Erro ao registrar manutenção',
        description: 'Ocorreu um erro ao registrar a manutenção. Por favor, tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Mutação para excluir manutenção
  const deleteMaintenanceMutation = useMutation({
    mutationFn: (maintenanceId: number) => {
      return apiRequest(`/api/laboratory/maintenances/${maintenanceId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Manutenção excluída com sucesso',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/laboratory/equipments/${id}`] });
      setIsDeleteMaintenanceOpen(false);
    },
    onError: (error) => {
      console.error('Erro ao excluir manutenção:', error);
      toast({
        title: 'Erro ao excluir manutenção',
        description: 'Ocorreu um erro ao excluir a manutenção. Por favor, tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Mutação para adicionar certificado
  const addCertificateMutation = useMutation({
    mutationFn: (newCertificate: any) => {
      return apiRequest(`/api/laboratory/equipments/${id}/certificates`, {
        method: 'POST',
        data: newCertificate,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Certificado registrado com sucesso',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/laboratory/equipments/${id}`] });
      setIsCertificateFormOpen(false);
    },
    onError: (error) => {
      console.error('Erro ao registrar certificado:', error);
      toast({
        title: 'Erro ao registrar certificado',
        description: 'Ocorreu um erro ao registrar o certificado. Por favor, tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Mutação para excluir certificado
  const deleteCertificateMutation = useMutation({
    mutationFn: (certificateId: number) => {
      return apiRequest(`/api/laboratory/certificates/${certificateId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Certificado excluído com sucesso',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/laboratory/equipments/${id}`] });
      setIsDeleteCertificateOpen(false);
    },
    onError: (error) => {
      console.error('Erro ao excluir certificado:', error);
      toast({
        title: 'Erro ao excluir certificado',
        description: 'Ocorreu um erro ao excluir o certificado. Por favor, tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Handlers
  const handleAddMaintenance = (formData: any) => {
    addMaintenanceMutation.mutate({
      ...formData,
      equipmentId: parseInt(id as string),
    });
  };

  const handleDeleteMaintenance = (maintenance: any) => {
    setSelectedMaintenance(maintenance);
    setIsDeleteMaintenanceOpen(true);
  };

  const confirmDeleteMaintenance = () => {
    if (selectedMaintenance) {
      deleteMaintenanceMutation.mutate(selectedMaintenance.id);
    }
  };

  const handleAddCertificate = (formData: any) => {
    addCertificateMutation.mutate({
      ...formData,
      equipmentId: parseInt(id as string),
    });
  };

  const handleDeleteCertificate = (certificate: any) => {
    setSelectedCertificate(certificate);
    setIsDeleteCertificateOpen(true);
  };

  const confirmDeleteCertificate = () => {
    if (selectedCertificate) {
      deleteCertificateMutation.mutate(selectedCertificate.id);
    }
  };

  // Verificar estado de carregamento
  if (isLoadingEquipment) {
    return (
      <LaboratoryLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" onClick={() => navigate('/laboratory/equipment')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Skeleton className="h-8 w-[300px]" />
          </div>
          <Skeleton className="h-[500px] w-full rounded-lg" />
        </div>
      </LaboratoryLayout>
    );
  }

  // Verificar erros
  if (equipmentError) {
    return (
      <LaboratoryLayout>
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => navigate('/laboratory/equipment')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar os detalhes do equipamento. Por favor, tente novamente mais tarde.
            </AlertDescription>
          </Alert>
        </div>
      </LaboratoryLayout>
    );
  }

  const equipment = equipmentData?.equipment;
  const maintenances = equipmentData?.maintenances || [];
  const certificates = equipmentData?.certificates || [];

  // Verificar se há manutenções ou calibrações em breve
  const hasPendingMaintenance = equipment?.nextMaintenanceDate && 
    new Date(equipment.nextMaintenanceDate) < new Date(new Date().setMonth(new Date().getMonth() + 1));
  
  const hasPendingCalibration = equipment?.nextCalibrationDate && 
    new Date(equipment.nextCalibrationDate) < new Date(new Date().setMonth(new Date().getMonth() + 1));

  // Verificar se há certificados a expirar
  const expiringCertificates = certificates.filter((cert: any) => {
    return cert.expiryDate && new Date(cert.expiryDate) < new Date(new Date().setMonth(new Date().getMonth() + 1));
  });

  return (
    <LaboratoryLayout>
      <div className="space-y-6">
        {/* Botão de voltar e título */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/laboratory/equipment')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">{equipment?.name}</h1>
          {getStatusBadge(equipment?.status)}
        </div>

        {/* Alertas para manutenções e calibrações pendentes */}
        {(hasPendingMaintenance || hasPendingCalibration || expiringCertificates.length > 0) && (
          <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <h3 className="font-medium">Atenção!</h3>
              <ul className="list-disc pl-4 mt-1">
                {hasPendingMaintenance && (
                  <li>Este equipamento necessita de manutenção em breve ({formatDate(equipment?.nextMaintenanceDate)}).</li>
                )}
                {hasPendingCalibration && (
                  <li>Este equipamento necessita de calibração em breve ({formatDate(equipment?.nextCalibrationDate)}).</li>
                )}
                {expiringCertificates.length > 0 && (
                  <li>{expiringCertificates.length} certificado(s) expirando em breve.</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Abas de conteúdo */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="maintenances">
              Manutenções
              {maintenances.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {maintenances.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="certificates">
              Certificados
              {certificates.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {certificates.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Conteúdo da aba Visão Geral */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5 text-gray-500" />
                    Informações Gerais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Modelo</p>
                      <p>{equipment?.model || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Número de Série</p>
                      <p>{equipment?.serialNumber || '—'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Fabricante</p>
                      <p>{equipment?.manufacturer || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Localização</p>
                      <p>{equipment?.location || '—'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Data de Aquisição</p>
                      <p>{formatDate(equipment?.acquisitionDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Data de Instalação</p>
                      <p>{formatDate(equipment?.installationDate)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-gray-500" />
                    Manutenção e Calibração
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Última Manutenção</p>
                      <p>{formatDate(equipment?.lastMaintenanceDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Próxima Manutenção</p>
                      <p className={hasPendingMaintenance ? "text-yellow-600 font-medium" : ""}>
                        {formatDate(equipment?.nextMaintenanceDate)}
                        {hasPendingMaintenance && (
                          <span className="ml-2 inline-block">
                            <AlertTriangle className="h-4 w-4 inline" />
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Última Calibração</p>
                      <p>{formatDate(equipment?.lastCalibrationDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Próxima Calibração</p>
                      <p className={hasPendingCalibration ? "text-yellow-600 font-medium" : ""}>
                        {formatDate(equipment?.nextCalibrationDate)}
                        {hasPendingCalibration && (
                          <span className="ml-2 inline-block">
                            <AlertTriangle className="h-4 w-4 inline" />
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Freq. de Manutenção</p>
                      <p>{equipment?.maintenanceFrequency ? `${equipment.maintenanceFrequency} dias` : '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Freq. de Calibração</p>
                      <p>{equipment?.calibrationFrequency ? `${equipment.calibrationFrequency} dias` : '—'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Observações e documentos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-gray-500" />
                  Informações Adicionais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Observações</h3>
                  <div className="p-3 bg-gray-50 rounded-md">
                    {equipment?.notes ? (
                      <p className="whitespace-pre-line">{equipment.notes}</p>
                    ) : (
                      <p className="text-gray-400 italic">Nenhuma observação registrada.</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Documentos</h3>
                  <div className="p-3 bg-gray-50 rounded-md">
                    {equipment?.documents ? (
                      <p className="whitespace-pre-line">{equipment.documents}</p>
                    ) : (
                      <p className="text-gray-400 italic">Nenhum documento registrado.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resumo das últimas manutenções */}
            {maintenances.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wrench className="mr-2 h-5 w-5 text-gray-500" />
                    Manutenções Recentes
                  </CardTitle>
                  <CardDescription>
                    As últimas 3 manutenções realizadas neste equipamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Realizado por</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {maintenances.slice(0, 3).map((maintenance: any) => (
                        <TableRow key={maintenance.id}>
                          <TableCell>{formatDate(maintenance.completionDate || maintenance.scheduledDate)}</TableCell>
                          <TableCell>{getMaintenanceTypeBadge(maintenance.maintenanceType)}</TableCell>
                          <TableCell>{getMaintenanceStatusBadge(maintenance.status)}</TableCell>
                          <TableCell>{maintenance.performedBy || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-2 text-center">
                    <Button 
                      variant="link" 
                      onClick={() => setActiveTab('maintenances')}
                    >
                      Ver todas as manutenções
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Conteúdo da aba Manutenções */}
          <TabsContent value="maintenances" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Histórico de Manutenções</h2>
              <Dialog open={isMaintenanceFormOpen} onOpenChange={setIsMaintenanceFormOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Manutenção
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Registrar Nova Manutenção</DialogTitle>
                  </DialogHeader>
                  <MaintenanceForm 
                    onSubmit={handleAddMaintenance} 
                    isLoading={addMaintenanceMutation.isPending} 
                  />
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="pt-6">
                {maintenances.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data Agendada</TableHead>
                        <TableHead>Data Concluída</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Realizado por</TableHead>
                        <TableHead>Custo</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {maintenances.map((maintenance: any) => (
                        <TableRow key={maintenance.id}>
                          <TableCell>{formatDate(maintenance.scheduledDate)}</TableCell>
                          <TableCell>{formatDate(maintenance.completionDate)}</TableCell>
                          <TableCell>{getMaintenanceTypeBadge(maintenance.maintenanceType)}</TableCell>
                          <TableCell>{getMaintenanceStatusBadge(maintenance.status)}</TableCell>
                          <TableCell>{maintenance.performedBy || '—'}</TableCell>
                          <TableCell>
                            {maintenance.cost ? `R$ ${parseFloat(maintenance.cost).toFixed(2)}`.replace('.', ',') : '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleDeleteMaintenance(maintenance)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <ClipboardCheck className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-semibold mb-2">Nenhuma manutenção registrada</p>
                    <p className="text-gray-500 mb-6">Registre manutenções para manter o histórico deste equipamento.</p>
                    <Button onClick={() => setIsMaintenanceFormOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Registrar Manutenção
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detalhes de manutenções */}
            {maintenances.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes das Manutenções</CardTitle>
                  <CardDescription>
                    Informações detalhadas sobre cada manutenção
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {maintenances.map((maintenance: any, index: number) => (
                      <AccordionItem key={maintenance.id} value={`item-${index}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center">
                            <span className="font-medium">{formatDate(maintenance.scheduledDate)}</span>
                            <span className="ml-4">{getMaintenanceTypeBadge(maintenance.maintenanceType)}</span>
                            <span className="ml-4">{getMaintenanceStatusBadge(maintenance.status)}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 p-2">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-500">Descrição</p>
                                <p>{maintenance.description || '—'}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Prestador de Serviço</p>
                                <p>{maintenance.serviceProvider || '—'}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-500">Peças Substituídas</p>
                                <p>{maintenance.partReplaced || '—'}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Custo</p>
                                <p>
                                  {maintenance.cost 
                                    ? `R$ ${parseFloat(maintenance.cost).toFixed(2)}`.replace('.', ',') 
                                    : '—'}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Observações</p>
                              <p className="whitespace-pre-line">{maintenance.notes || '—'}</p>
                            </div>
                            {maintenance.followUpRequired && (
                              <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                                <p className="text-sm font-medium text-blue-700">Acompanhamento Necessário</p>
                                <p className="text-blue-700">
                                  Data de Acompanhamento: {formatDate(maintenance.followUpDate)}
                                </p>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Conteúdo da aba Certificados */}
          <TabsContent value="certificates" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Certificados e Validações</h2>
              <Dialog open={isCertificateFormOpen} onOpenChange={setIsCertificateFormOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Certificado
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Registrar Novo Certificado</DialogTitle>
                  </DialogHeader>
                  <CertificateForm 
                    onSubmit={handleAddCertificate} 
                    isLoading={addCertificateMutation.isPending} 
                  />
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="pt-6">
                {certificates.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Número</TableHead>
                        <TableHead>Emissor</TableHead>
                        <TableHead>Data de Emissão</TableHead>
                        <TableHead>Data de Expiração</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {certificates.map((certificate: any) => (
                        <TableRow key={certificate.id}>
                          <TableCell>{certificate.certificateType}</TableCell>
                          <TableCell>{certificate.certificateNumber}</TableCell>
                          <TableCell>{certificate.issuedBy}</TableCell>
                          <TableCell>{formatDate(certificate.issueDate)}</TableCell>
                          <TableCell>
                            {formatDate(certificate.expiryDate)}
                            {certificate.expiryDate && new Date(certificate.expiryDate) < new Date(new Date().setMonth(new Date().getMonth() + 1)) && (
                              <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-200">
                                Expira em breve
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{getCertificateStatusBadge(certificate.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleDeleteCertificate(certificate)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Clipboard className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-semibold mb-2">Nenhum certificado registrado</p>
                    <p className="text-gray-500 mb-6">Registre certificados para manter o histórico de conformidade deste equipamento.</p>
                    <Button onClick={() => setIsCertificateFormOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Registrar Certificado
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detalhes de certificados */}
            {certificates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes dos Certificados</CardTitle>
                  <CardDescription>
                    Informações detalhadas sobre cada certificado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {certificates.map((certificate: any, index: number) => (
                      <AccordionItem key={certificate.id} value={`certificate-${index}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center">
                            <span className="font-medium">{certificate.certificateType}</span>
                            <span className="ml-4">#{certificate.certificateNumber}</span>
                            <span className="ml-4">{getCertificateStatusBadge(certificate.status)}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 p-2">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-500">Emissor</p>
                                <p>{certificate.issuedBy || '—'}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Responsável</p>
                                <p>{certificate.authorizedBy || '—'}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-500">Data de Emissão</p>
                                <p>{formatDate(certificate.issueDate)}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Data de Expiração</p>
                                <p className={
                                  certificate.expiryDate && new Date(certificate.expiryDate) < new Date(new Date().setMonth(new Date().getMonth() + 1))
                                    ? "text-yellow-600 font-medium"
                                    : ""
                                }>
                                  {formatDate(certificate.expiryDate)}
                                  {certificate.expiryDate && new Date(certificate.expiryDate) < new Date() && (
                                    <Badge variant="outline" className="ml-2 bg-red-100 text-red-800 border-red-200">
                                      Expirado
                                    </Badge>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Observações</p>
                              <p className="whitespace-pre-line">{certificate.notes || '—'}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Documentos Anexos</p>
                              <p>{certificate.documents || '—'}</p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Dialog para excluir manutenção */}
        <Dialog open={isDeleteMaintenanceOpen} onOpenChange={setIsDeleteMaintenanceOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Tem certeza que deseja excluir este registro de manutenção?</p>
              <p className="text-sm text-gray-500 mt-2">
                Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDeleteMaintenanceOpen(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDeleteMaintenance} 
                disabled={deleteMaintenanceMutation.isPending}
              >
                {deleteMaintenanceMutation.isPending ? 'Excluindo...' : 'Excluir'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog para excluir certificado */}
        <Dialog open={isDeleteCertificateOpen} onOpenChange={setIsDeleteCertificateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Tem certeza que deseja excluir este certificado?</p>
              <p className="text-sm text-gray-500 mt-2">
                Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDeleteCertificateOpen(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDeleteCertificate} 
                disabled={deleteCertificateMutation.isPending}
              >
                {deleteCertificateMutation.isPending ? 'Excluindo...' : 'Excluir'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </LaboratoryLayout>
  );
}