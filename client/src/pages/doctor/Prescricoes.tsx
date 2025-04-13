import React, { useState, useEffect } from 'react';
// DoctorLayout é fornecido pelo App.tsx
import { 
  ClipboardCheck, 
  Search, 
  Plus, 
  Filter,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Building,
  Loader2
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interfaces para tipos de dados
interface DoctorOrganization {
  id: number;
  doctorId: number;
  organizationId: number;
  organizationName: string;
  status: string;
  isDefault: boolean;
  createdAt: string;
  address?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  website?: string;
}

interface Patient {
  id: number;
  name: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  phone: string | null;
  cpf: string;
  address: string | null;
  organizationId: number;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  category: string | null;
  sku: string;
  stock: number;
  image: string | null;
  organizationId: number;
}

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
  notes: string | null;
  approvedById: number | null;
  approvalDate: string | null;
  createdAt: string;
}

// Função auxiliar para formatação de data
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return dateString || 'Data indisponível';
  }
}

export default function DoctorPrescricoes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrg, setSelectedOrg] = useState<number | null>(null);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    dosage: '',
    instructions: '',
    duration: '',
    notes: ''
  });
  
  // Buscar organizações do médico
  const { 
    data: doctorOrganizations, 
    isLoading: orgLoading,
    error: orgError
  } = useQuery<DoctorOrganization[]>({ 
    queryKey: ['/api/doctor/organizations'],
    enabled: !!user
  });

  // Definir a organização selecionada quando os dados são carregados
  useEffect(() => {
    if (doctorOrganizations && Array.isArray(doctorOrganizations) && doctorOrganizations.length > 0) {
      // Usar a organização padrão ou a primeira ativa
      const defaultOrg = doctorOrganizations.find((org: DoctorOrganization) => org.isDefault) || 
                         doctorOrganizations.find((org: DoctorOrganization) => org.status === 'active');
      
      if (defaultOrg) {
        setSelectedOrg(defaultOrg.organizationId);
      }
    }
  }, [doctorOrganizations]);
  
  // Lidar com erro ao buscar organizações
  useEffect(() => {
    if (orgError) {
      console.error("Erro ao buscar organizações:", orgError);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas organizações. Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  }, [orgError, toast]);
  
  // Buscar prescrições do médico para a organização selecionada
  const { 
    data: prescriptionsData, 
    isLoading: prescriptionsLoading,
    error: prescriptionsError
  } = useQuery<Prescription[]>({ 
    queryKey: ['/api/doctor/prescriptions', selectedOrg, activeTab],
    enabled: !!selectedOrg && !!user,
    queryFn: async () => {
      const statusFilter = activeTab !== 'all' ? activeTab : '';
      const response = await fetch(`/api/doctor/prescriptions?organizationId=${selectedOrg}${statusFilter ? `&status=${statusFilter}` : ''}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar prescrições');
      }
      return response.json();
    }
  });
  
  // Lidar com erro ao buscar prescrições
  useEffect(() => {
    if (prescriptionsError) {
      console.error("Erro ao buscar prescrições:", prescriptionsError);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas prescrições. Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  }, [prescriptionsError, toast]);
  
  // Buscar pacientes da organização selecionada
  const { 
    data: patientsData, 
    isLoading: patientsLoading
  } = useQuery<Patient[]>({
    queryKey: ['/api/patients', selectedOrg],
    enabled: !!selectedOrg && !!user,
    queryFn: async () => {
      const response = await fetch(`/api/patients?organizationId=${selectedOrg}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar pacientes');
      }
      return response.json();
    }
  });
  
  // Buscar produtos da organização selecionada
  const { 
    data: productsData, 
    isLoading: productsLoading
  } = useQuery<Product[]>({
    queryKey: ['/api/doctor/organizations', selectedOrg, 'products'],
    enabled: !!selectedOrg && !!user,
    queryFn: async () => {
      if (!selectedOrg) return [];
      const response = await fetch(`/api/doctor/organizations/${selectedOrg}/products`);
      if (!response.ok) {
        throw new Error('Falha ao buscar produtos');
      }
      return response.json();
    }
  });
  
  // Filtrar prescrições com base na pesquisa
  const filteredPrescriptions = React.useMemo(() => {
    if (!prescriptionsData) return [];
    
    return prescriptionsData.filter((prescription: Prescription) => {
      // Filtro por texto de pesquisa
      return searchQuery === '' || 
        prescription.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prescription.productName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [prescriptionsData, searchQuery]);

  // Resetar campos do formulário ao abrir o diálogo de criação
  const openCreateDialog = () => {
    setNewPrescription({
      dosage: '',
      instructions: '',
      duration: '',
      notes: ''
    });
    setSelectedPatient('');
    setSelectedProduct('');
    setIsCreateDialogOpen(true);
  };

  // Enviar nova prescrição
  const handleSubmitPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOrg || !selectedPatient || !selectedProduct) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const prescriptionData = {
        patientId: parseInt(selectedPatient),
        organizationId: selectedOrg,
        productId: parseInt(selectedProduct),
        ...newPrescription
      };
      
      const response = await fetch('/api/doctor/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(prescriptionData)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao criar prescrição');
      }
      
      const result = await response.json();
      
      // Notificar sucesso
      toast({
        title: "Sucesso!",
        description: "Prescrição criada com sucesso.",
        variant: "default"
      });
      
      // Fechar o diálogo após enviar
      setIsCreateDialogOpen(false);
      
      // Atualizar a lista de prescrições
      queryClient.invalidateQueries({ queryKey: ['/api/doctor/prescriptions'] });
    } catch (error) {
      console.error('Erro ao criar prescrição:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a prescrição. Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  };

  return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <p className="text-gray-500 text-sm">Gerencie prescrições médicas e produtos</p>
          
          <div className="flex items-center mt-4 sm:mt-0 gap-2">
            {!orgLoading && doctorOrganizations && doctorOrganizations.length > 0 ? (
              <Select 
                value={selectedOrg?.toString() || ""} 
                onValueChange={(value) => setSelectedOrg(parseInt(value))}
              >
                <SelectTrigger className="w-[180px] sm:w-[220px]">
                  <SelectValue placeholder="Selecionar organização" />
                </SelectTrigger>
                <SelectContent>
                  {doctorOrganizations.map((org: DoctorOrganization) => (
                    <SelectItem key={org.id} value={org.organizationId.toString()}>
                      {org.organizationName} {org.isDefault && "(Padrão)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="w-[180px] sm:w-[220px] h-10 bg-gray-100 animate-pulse rounded-md"></div>
            )}
            
            <Button 
              onClick={openCreateDialog} 
              className="flex items-center gap-1"
              disabled={!selectedOrg || orgLoading}
            >
              <Plus className="h-4 w-4" />
              <span>Nova prescrição</span>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-lg">Lista de Prescrições</CardTitle>
              <div className="flex w-full sm:w-auto items-center gap-2">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Buscar prescrição..."
                    className="pl-8 w-full sm:w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
            <div className="px-4 border-b">
              <TabsList className="w-full justify-start rounded-none border-b-0 bg-transparent p-0">
                <TabsTrigger 
                  value="all" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Todas
                </TabsTrigger>
                <TabsTrigger 
                  value="pending" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Pendentes
                </TabsTrigger>
                <TabsTrigger 
                  value="approved" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Aprovadas
                </TabsTrigger>
                <TabsTrigger 
                  value="rejected" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Rejeitadas
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="p-0">
              <div className="divide-y">
                {/* Estado de carregamento */}
                {(orgLoading || prescriptionsLoading) && (
                  <div className="py-16 flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-3" />
                    <p className="text-gray-500">Carregando prescrições...</p>
                  </div>
                )}
                
                {/* Nenhuma organização */}
                {!orgLoading && (!doctorOrganizations || doctorOrganizations.length === 0) && (
                  <div className="py-16 flex flex-col items-center justify-center">
                    <p className="text-gray-500 mb-2">Você não possui organizações ativas.</p>
                    <p className="text-gray-500">Associe-se a uma organização para criar prescrições.</p>
                  </div>
                )}
                
                {/* Dados carregados com sucesso */}
                {!orgLoading && !prescriptionsLoading && selectedOrg && filteredPrescriptions && filteredPrescriptions.length > 0 && (
                  filteredPrescriptions.map((prescription: Prescription) => (
                    <div key={prescription.id} className="p-4 hover:bg-gray-50">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-3 sm:mb-0">
                          <div className="flex items-center mb-1">
                            <h3 className="font-medium">{prescription.patientName}</h3>
                            <Badge 
                              className={`ml-2 ${
                                prescription.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                prescription.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {prescription.status === 'approved' ? 'Aprovada' : 
                               prescription.status === 'rejected' ? 'Rejeitada' : 
                               'Pendente'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Produto:</span> {prescription.productName}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Dosagem:</span> {prescription.dosage}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Instruções:</span> {prescription.instructions}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{formatDate(prescription.createdAt)}</span>
                            <Building className="h-3 w-3 ml-3 mr-1" />
                            <span>{prescription.organizationName}</span>
                          </div>
                          {prescription.notes && (
                            <p className="text-xs text-gray-500 mt-1 italic">
                              Nota: {prescription.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="gap-1">
                            <FileText className="h-4 w-4" />
                            <span className="hidden sm:inline">Detalhes</span>
                          </Button>
                          {prescription.status === 'rejected' && (
                            <Button size="sm" className="gap-1">
                              <ClipboardCheck className="h-4 w-4" />
                              <span className="hidden sm:inline">Ajustar</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {/* Nenhuma prescrição encontrada */}
                {!orgLoading && !prescriptionsLoading && selectedOrg && filteredPrescriptions && filteredPrescriptions.length === 0 && (
                  <div className="py-8 text-center text-gray-500">
                    <ClipboardCheck className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>Nenhuma prescrição encontrada</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="pending" className="p-0">
              {/* O conteúdo é filtrado dinamicamente na query */}
            </TabsContent>
            
            <TabsContent value="approved" className="p-0">
              {/* O conteúdo é filtrado dinamicamente na query */}
            </TabsContent>
            
            <TabsContent value="rejected" className="p-0">
              {/* O conteúdo é filtrado dinamicamente na query */}
            </TabsContent>
          </Tabs>
        </Card>

        {/* Diálogo para criar nova prescrição */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nova Prescrição</DialogTitle>
              <DialogDescription>
                Crie uma nova prescrição para um paciente da {
                  doctorOrganizations?.find((org: DoctorOrganization) => org.organizationId === selectedOrg)?.organizationName
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmitPrescription}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="patient">Paciente</Label>
                  <Select 
                    value={selectedPatient} 
                    onValueChange={setSelectedPatient}
                    required
                  >
                    <SelectTrigger id="patient">
                      <SelectValue placeholder="Selecionar paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patientsData?.map((patient: Patient) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="product">Produto</Label>
                  <Select 
                    value={selectedProduct} 
                    onValueChange={setSelectedProduct}
                    required
                  >
                    <SelectTrigger id="product">
                      <SelectValue placeholder="Selecionar produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {productsData?.map((product: Product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name} - {product.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="dosage">Dosagem</Label>
                  <Input
                    id="dosage"
                    value={newPrescription.dosage}
                    onChange={(e) => setNewPrescription({...newPrescription, dosage: e.target.value})}
                    placeholder="Ex: 0.5ml, 2x ao dia"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="instructions">Instruções</Label>
                  <Textarea
                    id="instructions"
                    value={newPrescription.instructions}
                    onChange={(e) => setNewPrescription({...newPrescription, instructions: e.target.value})}
                    placeholder="Instruções de uso"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duração</Label>
                  <Input
                    id="duration"
                    value={newPrescription.duration}
                    onChange={(e) => setNewPrescription({...newPrescription, duration: e.target.value})}
                    placeholder="Ex: 30 dias, 3 meses, etc."
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="notes">Observações adicionais</Label>
                  <Textarea
                    id="notes"
                    value={newPrescription.notes}
                    onChange={(e) => setNewPrescription({...newPrescription, notes: e.target.value})}
                    placeholder="Observações para o farmacêutico (opcional)"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Enviar prescrição</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
  );
}