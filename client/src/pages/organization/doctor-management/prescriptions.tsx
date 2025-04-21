import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
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

interface PrescriptionProduct {
  id: number;
  name: string;
  dosage: string;
  instructions: string;
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
  products: PrescriptionProduct[];
  documentUrl?: string;
}

interface PrescriptionPaginatedResponse {
  items: Prescription[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

function PrescritionsDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterDoctor, setFilterDoctor] = useState<string>("all");
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  
  // Buscar prescrições
  const {
    data: prescriptions,
    isLoading: isPrescriptionsLoading,
    refetch: refetchPrescriptions
  } = useQuery<PrescriptionPaginatedResponse>({
    queryKey: ['/api/organization/doctor-management/prescriptions', activeTab, currentPage, searchQuery, filterDoctor],
  });

  // Buscar médicos
  const { data: doctors, isLoading: isDoctorsLoading } = useQuery<Doctor[]>({
    queryKey: ['/api/organization/doctors'],
  });

  // Mutação para aprovar prescrição
  const approvePrescriptionMutation = useMutation({
    mutationFn: async (prescriptionId: number) => {
      const response = await fetch(`/api/organization/doctor-management/prescriptions/${prescriptionId}/approve`, {
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
      queryClient.invalidateQueries({ queryKey: ['/api/organization/doctor-management/prescriptions'] });
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
      const response = await fetch(`/api/organization/doctor-management/prescriptions/${prescriptionId}/reject`, {
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
      queryClient.invalidateQueries({ queryKey: ['/api/organization/doctor-management/prescriptions'] });
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
            Gerencie prescrições médicas e acompanhe o status de aprovação
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
              placeholder="Buscar por paciente..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={filterDoctor} onValueChange={setFilterDoctor}>
            <SelectTrigger className="w-full md:w-[180px]">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{filterDoctor === "all" ? "Todos os médicos" : "Médico: " + filterDoctor}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os médicos</SelectItem>
              {(doctors || []).map((doctor: Doctor) => (
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
                {(prescriptions?.items?.length ?? 0) > 0 ? (
                  (prescriptions?.items || []).map((prescription: Prescription) => (
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

        {(prescriptions?.totalPages ?? 0) > 1 && (
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
                
                {Array.from({ length: prescriptions?.totalPages ?? 0 }).map((_, i) => (
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
                      if (currentPage < (prescriptions?.totalPages ?? 0)) setCurrentPage(currentPage + 1);
                    }}
                    className={currentPage === (prescriptions?.totalPages ?? 0) ? "pointer-events-none opacity-50" : ""}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div>{getStatusBadge(selectedPrescription.status)}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Data de Emissão</p>
                    <p className="font-medium">{formatDate(selectedPrescription.createdAt)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Médico Responsável</p>
                    <p className="font-medium">{selectedPrescription.doctorName}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Paciente</p>
                    <p className="font-medium">{selectedPrescription.patientName}</p>
                  </div>
                  
                  {selectedPrescription.status !== 'pending' && (
                    <>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Revisado por</p>
                        <p className="font-medium">{selectedPrescription.reviewedBy || 'Não informado'}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Data da Revisão</p>
                        <p className="font-medium">
                          {selectedPrescription.reviewedAt 
                            ? formatDate(selectedPrescription.reviewedAt)
                            : 'Não informado'}
                        </p>
                      </div>
                      
                      {selectedPrescription.status === 'rejected' && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Motivo da Rejeição</p>
                          <p className="font-medium">{selectedPrescription.rejectReason || 'Não informado'}</p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Produtos Prescritos</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {selectedPrescription.products.map((product, index) => (
                      <div key={product.id} className="p-3 border rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">{product.name}</div>
                          <Badge variant="outline" className="text-xs">{`Item ${index + 1}`}</Badge>
                        </div>
                        <div className="mt-2 space-y-1 text-sm">
                          <div className="flex gap-1">
                            <span className="text-muted-foreground">Dosagem:</span>
                            <span>{product.dosage}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground">Instruções:</span>
                            <span className="bg-gray-50 p-2 rounded text-xs">{product.instructions}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {selectedPrescription.products.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-6">
                        <ClipboardCheck className="h-8 w-8 text-gray-300 mb-2" />
                        <p className="text-muted-foreground text-center">Nenhum produto prescrito</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <DialogFooter className="gap-2 flex-row-reverse sm:flex-row sm:justify-end">
            {selectedPrescription?.status === 'pending' && (
              <>
                <Button 
                  className="gap-1"
                  onClick={() => approvePrescriptionMutation.mutate(selectedPrescription.id)}
                  disabled={approvePrescriptionMutation.isPending}
                >
                  {approvePrescriptionMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Aprovar Prescrição
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-1 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setIsRejectModalOpen(true);
                  }}
                >
                  Rejeitar Prescrição
                </Button>
              </>
            )}
            <Button 
              variant="outline" 
              onClick={() => setIsViewModalOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Rejeição de Prescrição */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Rejeitar Prescrição #{selectedPrescription?.id}
            </DialogTitle>
            <DialogDescription>
              Informe o motivo para a rejeição desta prescrição.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="reason" className="block text-sm font-medium">
                Motivo da Rejeição <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason"
                rows={4}
                placeholder="Descreva o motivo da rejeição..."
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsRejectModalOpen(false);
                setRejectReason("");
              }}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              className="gap-1"
              onClick={() => {
                if (!rejectReason.trim()) {
                  toast({
                    title: "Erro ao rejeitar",
                    description: "Informe o motivo da rejeição",
                    variant: "destructive",
                  });
                  return;
                }
                
                if (selectedPrescription) {
                  rejectPrescriptionMutation.mutate({
                    prescriptionId: selectedPrescription.id,
                    reason: rejectReason,
                  });
                }
              }}
              disabled={rejectPrescriptionMutation.isPending}
            >
              {rejectPrescriptionMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PrescriptionsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <PrescritionsDashboard />
    </div>
  );
}