import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Prescription {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  organizationId: number;
  organizationName: string;
  productId: number;
  productName: string;
  dosage: string;
  instructions: string;
  duration: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  approvedById?: number;
  approvalDate?: string;
  createdAt: string;
}

interface PrescriptionListProps {
  onViewDetails?: (prescription: Prescription) => void;
}

export function PrescriptionList({ onViewDetails }: PrescriptionListProps) {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [organizationFilter, setOrganizationFilter] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  
  // Fetch all user's organizations
  const { data: organizations, isLoading: isLoadingOrgs } = useQuery({ 
    queryKey: ['/api/doctor/organizations'],
    enabled: true,
  });
  
  // Fetch prescriptions with filters
  const prescriptionsQuery = useQuery({
    queryKey: ['/api/doctor/prescriptions', organizationFilter, statusFilter, searchTerm],
    queryFn: async () => {
      let url = '/api/doctor/prescriptions';
      const params = new URLSearchParams();
      
      if (organizationFilter) {
        params.append('organizationId', organizationFilter.toString());
      }
      
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      return await apiRequest(url);
    },
    enabled: true,
  });
  
  // Function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Aprovada</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejeitada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Filter prescriptions by search term
  const filteredPrescriptions = searchTerm && prescriptionsQuery.data
    ? prescriptionsQuery.data.filter((prescription: Prescription) => 
        prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.productName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : prescriptionsQuery.data;
  
  // For viewing prescription details
  const handleViewDetails = (prescription: Prescription) => {
    if (onViewDetails) {
      onViewDetails(prescription);
    } else {
      setSelectedPrescription(prescription);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Minhas Prescrições</CardTitle>
        <CardDescription>Gerenciamento de prescrições médicas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por paciente ou produto..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full sm:w-[180px]">
              <Label htmlFor="status-filter" className="sr-only">Filtrar por Status</Label>
              <Select onValueChange={(value) => setStatusFilter(value || null)} defaultValue="">
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="approved">Aprovada</SelectItem>
                  <SelectItem value="rejected">Rejeitada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-[220px]">
              <Label htmlFor="org-filter" className="sr-only">Filtrar por Organização</Label>
              <Select onValueChange={(value) => setOrganizationFilter(parseInt(value) || null)} defaultValue="">
                <SelectTrigger id="org-filter">
                  <SelectValue placeholder="Organização" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as organizações</SelectItem>
                  {organizations?.map((org: any) => (
                    <SelectItem key={org.id} value={org.id.toString()}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {prescriptionsQuery.isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : prescriptionsQuery.isError ? (
          <div className="p-4 border rounded-md bg-red-50 text-red-800">
            Erro ao carregar prescrições. Por favor, tente novamente.
          </div>
        ) : filteredPrescriptions?.length === 0 ? (
          <div className="p-4 border rounded-md text-center">
            Nenhuma prescrição encontrada.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Organização</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrescriptions?.map((prescription: Prescription) => (
                  <TableRow key={prescription.id}>
                    <TableCell className="font-medium">{prescription.id}</TableCell>
                    <TableCell>{prescription.patientName}</TableCell>
                    <TableCell>{prescription.organizationName}</TableCell>
                    <TableCell>{prescription.productName}</TableCell>
                    <TableCell>{getStatusBadge(prescription.status)}</TableCell>
                    <TableCell>{format(new Date(prescription.createdAt), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewDetails(prescription)}
                      >
                        Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Prescription Details Dialog */}
        <Dialog open={!!selectedPrescription} onOpenChange={(open) => !open && setSelectedPrescription(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detalhes da Prescrição #{selectedPrescription?.id}</DialogTitle>
              <DialogDescription>
                Criada em {selectedPrescription && format(new Date(selectedPrescription.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </DialogDescription>
            </DialogHeader>
            
            {selectedPrescription && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                    <div className="mt-1">{getStatusBadge(selectedPrescription.status)}</div>
                  </div>
                  
                  {selectedPrescription.approvalDate && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Data de aprovação/rejeição</h4>
                      <p>{format(new Date(selectedPrescription.approvalDate), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium">Informações do Paciente</h4>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Nome</p>
                      <p>{selectedPrescription.patientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ID</p>
                      <p>{selectedPrescription.patientId}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium">Detalhes da Prescrição</h4>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Produto</p>
                      <p>{selectedPrescription.productName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dosagem</p>
                      <p>{selectedPrescription.dosage}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Instruções</p>
                      <p>{selectedPrescription.instructions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duração</p>
                      <p>{selectedPrescription.duration}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Organização</p>
                      <p>{selectedPrescription.organizationName}</p>
                    </div>
                  </div>
                </div>
                
                {selectedPrescription.notes && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium">Observações</h4>
                    <p className="mt-2 whitespace-pre-line">{selectedPrescription.notes}</p>
                  </div>
                )}
                
                <div className="flex justify-end mt-6">
                  <Button variant="outline" onClick={() => setSelectedPrescription(null)}>
                    Fechar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}