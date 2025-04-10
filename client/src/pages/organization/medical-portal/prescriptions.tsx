import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  FileText,
  Loader2,
  Search,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Download,
  ClipboardCheck,
  Calendar,
  Clock,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Tipos
interface Doctor {
  id: number;
  name: string;
  specialization: string;
  crm: string;
}

interface Patient {
  id: number;
  name: string;
  dateOfBirth: string;
  cpf: string;
}

interface Prescription {
  id: number;
  doctorId: number;
  doctorName: string;
  patientId: number;
  patientName: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  rejectReason?: string;
  products: {
    id: number;
    name: string;
    dosage: string;
    instructions: string;
  }[];
  documentUrl?: string;
}

function PrescritionsDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterDoctor, setFilterDoctor] = useState<string>("");
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  
  // Buscar prescrições
  const {
    data: prescriptions,
    isLoading: isPrescriptionsLoading,
    refetch: refetchPrescriptions
  } = useQuery({
    queryKey: ['/api/organization/medical-portal/prescriptions', activeTab, currentPage, searchQuery, filterDoctor],
  });

  // Buscar médicos
  const { data: doctors, isLoading: isDoctorsLoading } = useQuery({
    queryKey: ['/api/organization/doctors'],
  });

  // Mutação para aprovar prescrição
  const approvePrescriptionMutation = useMutation({
    mutationFn: async (prescriptionId: number) => {
      const response = await fetch(`/api/organization/medical-portal/prescriptions/${prescriptionId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Falha ao aprovar prescrição');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organization/medical-portal/prescriptions'] });
      toast({
        title: "Prescrição aprovada",
        description: "A prescrição foi aprovada com sucesso",
        variant: "default",
      });
      setIsViewModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao aprovar prescrição",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutação para rejeitar prescrição
  const [rejectReason, setRejectReason] = useState<string>("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  
  const rejectPrescriptionMutation = useMutation({
    mutationFn: async ({ prescriptionId, reason }: { prescriptionId: number, reason: string }) => {
      const response = await fetch(`/api/organization/medical-portal/prescriptions/${prescriptionId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao rejeitar prescrição');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organization/medical-portal/prescriptions'] });
      toast({
        title: "Prescrição rejeitada",
        description: "A prescrição foi rejeitada com sucesso",
        variant: "default",
      });
      setIsRejectModalOpen(false);
      setIsViewModalOpen(false);
      setRejectReason("");
    },
    onError: (error) => {
      toast({
        title: "Erro ao rejeitar prescrição",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "HH:mm", { locale: ptBR });
  };

  if (isPrescriptionsLoading || isDoctorsLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Prescrições</h1>
          <p className="text-muted-foreground">
            Gerencie prescrições médicas e aprovações para farmacêuticos
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-1.5"
            onClick={() => refetchPrescriptions()}
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          <Button className="gap-1.5">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="pending" className="flex gap-2">
              <AlertCircle className="h-4 w-4" />
              Pendentes
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex gap-2">
              <CheckCircle className="h-4 w-4" />
              Aprovadas
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex gap-2">
              <XCircle className="h-4 w-4" />
              Rejeitadas
            </TabsTrigger>
            <TabsTrigger value="all" className="flex gap-2">
              <FileText className="h-4 w-4" />
              Todas
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative w-full md:w-[240px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por paciente ou médico..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={filterDoctor} onValueChange={setFilterDoctor}>
            <SelectTrigger className="w-full md:w-[180px]">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{filterDoctor ? "Médico: " + filterDoctor : "Filtrar por médico"}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os médicos</SelectItem>
              {doctors?.map((doctor: Doctor) => (
                <SelectItem key={doctor.id} value={doctor.id.toString()}>
                  {doctor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Médico</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescriptions?.items?.length > 0 ? (
                  prescriptions.items.map((prescription: Prescription) => (
                    <TableRow key={prescription.id}>
                      <TableCell className="font-medium">{prescription.id}</TableCell>
                      <TableCell>{prescription.doctorName}</TableCell>
                      <TableCell>{prescription.patientName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3.5 w-3.5 text-gray-500" />
                          {formatDate(prescription.createdAt)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTime(prescription.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(prescription.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedPrescription(prescription);
                              setIsViewModalOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {prescription.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => {
                                  setSelectedPrescription(prescription);
                                  approvePrescriptionMutation.mutate(prescription.id);
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => {
                                  setSelectedPrescription(prescription);
                                  setIsRejectModalOpen(true);
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-10 w-10 text-gray-300" />
                        <p className="text-muted-foreground">
                          {activeTab === "pending"
                            ? "Não há prescrições pendentes"
                            : activeTab === "approved"
                            ? "Não há prescrições aprovadas"
                            : activeTab === "rejected"
                            ? "Não há prescrições rejeitadas"
                            : "Não há prescrições disponíveis"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {prescriptions?.totalPages > 1 && (
          <CardFooter className="flex justify-center py-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: prescriptions.totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(i + 1);
                      }}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < prescriptions.totalPages) setCurrentPage(currentPage + 1);
                    }}
                    className={currentPage === prescriptions.totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        )}
      </Card>

      {/* Modal de Visualização de Prescrição */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalhes da Prescrição #{selectedPrescription?.id}
            </DialogTitle>
            <DialogDescription>
              Visualize todos os detalhes e produtos desta prescrição médica
            </DialogDescription>
          </DialogHeader>
          
          {selectedPrescription && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Informações Gerais</h3>
                  
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium text-gray-500">Status:</span>{" "}
                      {getStatusBadge(selectedPrescription.status)}
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-medium text-gray-500">Data de Criação:</span>{" "}
                      {formatDate(selectedPrescription.createdAt)} às {formatTime(selectedPrescription.createdAt)}
                    </div>
                    
                    {selectedPrescription.reviewedAt && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-500">Data de Revisão:</span>{" "}
                        {formatDate(selectedPrescription.reviewedAt)} às {formatTime(selectedPrescription.reviewedAt)}
                      </div>
                    )}
                    
                    {selectedPrescription.reviewedBy && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-500">Revisado por:</span>{" "}
                        {selectedPrescription.reviewedBy}
                      </div>
                    )}
                    
                    {selectedPrescription.rejectReason && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-500">Motivo da Rejeição:</span>{" "}
                        <span className="text-red-600">{selectedPrescription.rejectReason}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Médico & Paciente</h3>
                  
                  <div className="p-3 bg-blue-50 rounded-lg space-y-2">
                    <div className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Médico:</span>{" "}
                      <span>{selectedPrescription.doctorName}</span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg space-y-2">
                    <div className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Paciente:</span>{" "}
                      <span>{selectedPrescription.patientName}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Produtos Prescritos</h3>
                
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome do Produto</TableHead>
                        <TableHead>Dosagem</TableHead>
                        <TableHead>Instruções</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPrescription.products.map((product, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.dosage}</TableCell>
                          <TableCell>{product.instructions}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              {selectedPrescription.documentUrl && (
                <div className="space-y-4">
                  <h3 className="font-medium">Documento Anexo</h3>
                  
                  <div className="border rounded-lg p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span>Prescrição_{selectedPrescription.id}.pdf</span>
                    </div>
                    
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedPrescription.documentUrl} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </a>
                    </Button>
                  </div>
                </div>
              )}
              
              {selectedPrescription.status === 'pending' && (
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsRejectModalOpen(true)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeitar
                  </Button>
                  <Button 
                    onClick={() => approvePrescriptionMutation.mutate(selectedPrescription.id)}
                    disabled={approvePrescriptionMutation.isPending}
                  >
                    {approvePrescriptionMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processando
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aprovar Prescrição
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Rejeição */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Prescrição</DialogTitle>
            <DialogDescription>
              Por favor, forneça o motivo da rejeição desta prescrição.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="reject-reason" className="text-sm font-medium">
                Motivo da Rejeição
              </label>
              <Input
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ex: Dosagem incorreta, informações incompletas, etc."
                className="w-full"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRejectModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (!rejectReason.trim()) {
                  toast({
                    title: "Motivo obrigatório",
                    description: "Por favor, forneça o motivo da rejeição.",
                    variant: "destructive",
                  });
                  return;
                }
                
                if (selectedPrescription) {
                  rejectPrescriptionMutation.mutate({
                    prescriptionId: selectedPrescription.id,
                    reason: rejectReason
                  });
                }
              }}
              disabled={rejectPrescriptionMutation.isPending}
            >
              {rejectPrescriptionMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeitar Prescrição
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PrescriptionsPage() {
  return (
    <OrganizationLayout>
      <PrescritionsDashboard />
    </OrganizationLayout>
  );
}