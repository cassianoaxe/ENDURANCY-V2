import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Calendar,
  User,
  Pill,
  FileText,
  Filter
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Prescription {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  instructions: string;
  diagnosis: string;
  observations?: string;
  rejectionReason?: string;
  items: PrescriptionItem[];
}

interface PrescriptionItem {
  id: number;
  prescriptionId: number;
  productId: number;
  productName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
}

// Interface para médicos com aprovação automática
interface DoctorWithAutoApprove {
  id: number;
  name: string;
  specialization: string;
  crm: string;
  hasAutoApproval: boolean;
}

// Componente para gerenciar médicos com aprovação automática
function DoctorAutoApproveManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
  
  // Buscar médicos associados a esta organização
  const { data: doctors, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ['doctors', 'auto-approve', user?.organizationId],
    queryFn: async () => {
      if (!user?.organizationId) return [];
      const response = await axios.get(`/api/pharmacist/doctors/auto-approve`);
      return response.data;
    },
    enabled: !!user?.organizationId
  });

  // Mutação para atualizar status de aprovação automática
  const toggleAutoApproveMutation = useMutation({
    mutationFn: async (data: { doctorId: number, hasAutoApproval: boolean }) => {
      return axios.post(`/api/pharmacist/doctors/${data.doctorId}/auto-approve`, {
        hasAutoApproval: data.hasAutoApproval
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors', 'auto-approve'] });
      toast({
        title: "Configuração atualizada",
        description: "As permissões do médico foram atualizadas com sucesso",
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar permissões:', error);
      toast({
        title: "Erro ao atualizar permissões",
        description: "Tente novamente ou contate o suporte",
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  const handleToggleAutoApprove = (doctor: DoctorWithAutoApprove) => {
    toggleAutoApproveMutation.mutate({
      doctorId: doctor.id,
      hasAutoApproval: !doctor.hasAutoApproval
    });
  };

  const filteredDoctors = () => {
    if (!doctors) return [];
    
    if (!doctorSearchTerm) return doctors;
    
    const searchTermLower = doctorSearchTerm.toLowerCase();
    return doctors.filter((doctor: DoctorWithAutoApprove) => 
      doctor.name.toLowerCase().includes(searchTermLower) ||
      doctor.crm.toLowerCase().includes(searchTermLower) ||
      doctor.specialization.toLowerCase().includes(searchTermLower)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium">Aprovação Automática de Prescrições</h3>
          <p className="text-sm text-gray-500">
            Determine quais médicos terão suas prescrições aprovadas automaticamente
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar médicos..."
            className="pl-8"
            value={doctorSearchTerm}
            onChange={(e) => setDoctorSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoadingDoctors ? (
        <div className="flex items-center justify-center py-10">
          <p>Carregando médicos...</p>
        </div>
      ) : filteredDoctors().length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <User className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-500">Nenhum médico encontrado</p>
          {doctorSearchTerm && (
            <Button 
              variant="link" 
              onClick={() => setDoctorSearchTerm('')}
              className="mt-2"
            >
              Limpar filtro
            </Button>
          )}
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Médico</TableHead>
                <TableHead>CRM</TableHead>
                <TableHead>Especialidade</TableHead>
                <TableHead>Aprovação Automática</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDoctors().map((doctor: DoctorWithAutoApprove) => (
                <TableRow key={doctor.id}>
                  <TableCell className="font-medium">{doctor.name}</TableCell>
                  <TableCell>{doctor.crm}</TableCell>
                  <TableCell>{doctor.specialization}</TableCell>
                  <TableCell>
                    {doctor.hasAutoApproval ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                        Ativada
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100">
                        Desativada
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={doctor.hasAutoApproval ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleAutoApprove(doctor)}
                      disabled={toggleAutoApproveMutation.isPending}
                      className={doctor.hasAutoApproval ? "bg-red-600 hover:bg-red-700" : "text-green-600 hover:text-green-700"}
                    >
                      {doctor.hasAutoApproval ? (
                        <>
                          <XCircle className="h-4 w-4 mr-1" /> Desativar
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" /> Ativar
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Como funciona a aprovação automática</h4>
        <p className="text-sm text-blue-700">
          Quando ativada, todas as prescrições criadas por este médico serão automaticamente aprovadas
          assim que inseridas no sistema, sem necessidade de revisão manual. Use esta função apenas para
          médicos de confiança.
        </p>
      </div>
    </div>
  );
}

export default function PharmacistPrescricoes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [observations, setObservations] = useState('');

  // Buscar prescrições
  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ['prescriptions', user?.organizationId],
    queryFn: async () => {
      if (!user?.organizationId) return [];
      const response = await axios.get(`/api/pharmacist/prescriptions`);
      return response.data;
    },
    enabled: !!user?.organizationId
  });

  // Mutação para aprovar prescrição
  const approveMutation = useMutation({
    mutationFn: async (data: { prescriptionId: number, observations: string }) => {
      return axios.post(`/api/pharmacist/prescriptions/${data.prescriptionId}/approve`, {
        observations: data.observations
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      setApproveDialogOpen(false);
      setSelectedPrescription(null);
      toast({
        title: "Prescrição aprovada com sucesso",
        description: "O paciente já pode visualizar e adquirir os medicamentos",
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error('Erro ao aprovar prescrição:', error);
      toast({
        title: "Erro ao aprovar prescrição",
        description: "Tente novamente ou contate o suporte",
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  // Mutação para rejeitar prescrição
  const rejectMutation = useMutation({
    mutationFn: async (data: { prescriptionId: number, rejectionReason: string }) => {
      return axios.post(`/api/pharmacist/prescriptions/${data.prescriptionId}/reject`, {
        rejectionReason: data.rejectionReason
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      setRejectDialogOpen(false);
      setSelectedPrescription(null);
      setRejectionReason('');
      toast({
        title: "Prescrição rejeitada",
        description: "O médico será notificado sobre a rejeição",
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error('Erro ao rejeitar prescrição:', error);
      toast({
        title: "Erro ao rejeitar prescrição",
        description: "Tente novamente ou contate o suporte",
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setViewDialogOpen(true);
    
    // Preencher observações se já existirem
    if (prescription.observations) {
      setObservations(prescription.observations);
    } else {
      setObservations('');
    }
  };

  const handleApproveDialog = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setApproveDialogOpen(true);
    
    // Preencher observações se já existirem
    if (prescription.observations) {
      setObservations(prescription.observations);
    } else {
      setObservations('');
    }
  };

  const handleRejectDialog = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setRejectDialogOpen(true);
    setRejectionReason('');
  };

  const handleApprovePrescription = () => {
    if (!selectedPrescription) return;
    
    approveMutation.mutate({
      prescriptionId: selectedPrescription.id,
      observations: observations
    });
  };

  const handleRejectPrescription = () => {
    if (!selectedPrescription || !rejectionReason.trim()) {
      toast({
        title: "Motivo da rejeição necessário",
        description: "Por favor, informe o motivo da rejeição",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    rejectMutation.mutate({
      prescriptionId: selectedPrescription.id,
      rejectionReason: rejectionReason
    });
  };

  const filterPrescriptions = () => {
    if (!prescriptions) return [];
    
    return prescriptions.filter((prescription: Prescription) => {
      // Filtro por status
      if (statusFilter !== 'all' && prescription.status !== statusFilter) {
        return false;
      }
      
      // Filtro por texto de busca
      if (searchTerm) {
        const searchTermLower = searchTerm.toLowerCase();
        return (
          prescription.patientName.toLowerCase().includes(searchTermLower) ||
          prescription.doctorName.toLowerCase().includes(searchTermLower) ||
          prescription.id.toString().includes(searchTermLower)
        );
      }
      
      return true;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Aprovada</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejeitada</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Prescrições Médicas</h1>
          <p className="text-gray-500">
            Gerencie e aprove prescrições médicas
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <CardTitle>Prescrições</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por paciente ou médico..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-44">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filtrar por status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="approved">Aprovadas</SelectItem>
                    <SelectItem value="rejected">Rejeitadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="list" className="space-y-4">
              <TabsList>
                <TabsTrigger value="list">Lista</TabsTrigger>
                <TabsTrigger value="grid">Grade</TabsTrigger>
                <TabsTrigger value="auto-approve">Aprovação Automática</TabsTrigger>
              </TabsList>
              
              <TabsContent value="list">
                {isLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <p>Carregando prescrições...</p>
                  </div>
                ) : filterPrescriptions().length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <FileText className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">Nenhuma prescrição encontrada</p>
                    {(searchTerm || statusFilter !== 'all') && (
                      <Button 
                        variant="link" 
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                        }}
                        className="mt-2"
                      >
                        Limpar filtros
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Paciente</TableHead>
                          <TableHead>Médico</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterPrescriptions().map((prescription: Prescription) => (
                          <TableRow key={prescription.id}>
                            <TableCell className="font-medium">#{prescription.id}</TableCell>
                            <TableCell>{prescription.patientName}</TableCell>
                            <TableCell>Dr. {prescription.doctorName}</TableCell>
                            <TableCell>{formatDate(prescription.createdAt)}</TableCell>
                            <TableCell>{getStatusBadge(prescription.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewPrescription(prescription)}
                                >
                                  <Eye className="h-4 w-4 mr-1" /> Visualizar
                                </Button>
                                
                                {prescription.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                      onClick={() => handleApproveDialog(prescription)}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" /> Aprovar
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-500 border-red-300 hover:bg-red-50"
                                      onClick={() => handleRejectDialog(prescription)}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" /> Rejeitar
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="grid">
                {isLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <p>Carregando prescrições...</p>
                  </div>
                ) : filterPrescriptions().length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <FileText className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">Nenhuma prescrição encontrada</p>
                    {(searchTerm || statusFilter !== 'all') && (
                      <Button 
                        variant="link" 
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                        }}
                        className="mt-2"
                      >
                        Limpar filtros
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filterPrescriptions().map((prescription: Prescription) => (
                      <Card key={prescription.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">Prescrição #{prescription.id}</CardTitle>
                              <p className="text-sm text-gray-500">
                                {formatDate(prescription.createdAt)}
                              </p>
                            </div>
                            {getStatusBadge(prescription.status)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">
                                <span className="font-medium">Paciente:</span> {prescription.patientName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">
                                <span className="font-medium">Médico:</span> Dr. {prescription.doctorName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Pill className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">
                                <span className="font-medium">Itens:</span> {prescription.items?.length || 0} medicamentos
                              </span>
                            </div>
                            
                            <div className="pt-2 flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto"
                                onClick={() => handleViewPrescription(prescription)}
                              >
                                <Eye className="h-4 w-4 mr-1" /> Visualizar
                              </Button>
                              
                              {prescription.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                                    onClick={() => handleApproveDialog(prescription)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" /> Aprovar
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full sm:w-auto text-red-500 border-red-300 hover:bg-red-50"
                                    onClick={() => handleRejectDialog(prescription)}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" /> Rejeitar
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="auto-approve">
                <DoctorAutoApproveManager />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de visualização da prescrição */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Prescrição #{selectedPrescription?.id}</DialogTitle>
            <DialogDescription>
              Prescrição médica completa com histórico e medicamentos
            </DialogDescription>
          </DialogHeader>
          
          {selectedPrescription && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" /> Informações do Paciente
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="font-medium">{selectedPrescription.patientName}</p>
                    <p className="text-sm text-gray-500">ID: {selectedPrescription.patientId}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" /> Médico Responsável
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="font-medium">Dr. {selectedPrescription.doctorName}</p>
                    <p className="text-sm text-gray-500">ID: {selectedPrescription.doctorId}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Data da Prescrição
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p>{formatDate(selectedPrescription.createdAt)}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Status Atual
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedPrescription.status)}
                      {selectedPrescription.status === 'rejected' && (
                        <span className="text-sm text-red-500">
                          (Motivo: {selectedPrescription.rejectionReason})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Diagnóstico</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p>{selectedPrescription.diagnosis || "Nenhum diagnóstico informado"}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Instruções</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p>{selectedPrescription.instructions || "Nenhuma instrução específica"}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Pill className="h-4 w-4" /> Medicamentos
                </h3>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicamento</TableHead>
                        <TableHead>Dosagem</TableHead>
                        <TableHead>Frequência</TableHead>
                        <TableHead>Duração</TableHead>
                        <TableHead>Quantidade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPrescription.items?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell>{item.dosage}</TableCell>
                          <TableCell>{item.frequency}</TableCell>
                          <TableCell>{item.duration}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de aprovação da prescrição */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar Prescrição</DialogTitle>
            <DialogDescription>
              Adicione observações adicionais para o paciente (opcional)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                placeholder="Adicione instruções adicionais ao paciente..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleApprovePrescription} 
              className="bg-green-600 hover:bg-green-700"
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? "Processando..." : "Confirmar Aprovação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de rejeição da prescrição */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Prescrição</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição para o médico
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="rejectReason" className="text-red-500">Motivo da Rejeição *</Label>
              <Textarea
                id="rejectReason"
                placeholder="Explique o motivo pelo qual esta prescrição está sendo rejeitada..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={5}
                className={rejectionReason.trim() === '' ? 'border-red-300' : ''}
                required
              />
              {rejectionReason.trim() === '' && (
                <p className="text-sm text-red-500">O motivo da rejeição é obrigatório</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleRejectPrescription} 
              variant="destructive"
              disabled={rejectMutation.isPending || rejectionReason.trim() === ''}
            >
              {rejectMutation.isPending ? "Processando..." : "Confirmar Rejeição"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
