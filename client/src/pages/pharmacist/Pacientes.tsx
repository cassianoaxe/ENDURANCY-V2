import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Search, 
  UserPlus, 
  Filter, 
  Eye, 
  PlusSquare, 
  UserRound, 
  Clock,
  Pill,
  FileText,
  CalendarCheck
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  lastVisit?: string;
  status: 'active' | 'inactive';
  prescriptions?: number;
  notes?: string;
}

export default function PharmacistPacientes() {
  const { user } = useAuth();
  const [organizationName, setOrganizationName] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState<string>('todos');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  
  // Buscar dados da organização
  const { data: organizationData } = useQuery({
    queryKey: ['organization', user?.organizationId],
    queryFn: async () => {
      if (!user?.organizationId) return null;
      const response = await axios.get(`/api/organizations/${user.organizationId}`);
      return response.data;
    },
    enabled: !!user?.organizationId
  });

  useEffect(() => {
    if (organizationData) {
      setOrganizationName(organizationData.name || "");
    }
  }, [organizationData]);

  // Dados fictícios de pacientes para demonstração
  const mockPatients: Patient[] = [
    {
      id: 1,
      name: 'Ana Silva',
      email: 'ana.silva@email.com',
      phone: '(11) 98765-4321',
      dateOfBirth: '1985-04-12',
      gender: 'Feminino',
      address: 'Rua das Flores, 123 - São Paulo, SP',
      lastVisit: '2025-04-02',
      status: 'active',
      prescriptions: 3,
      notes: 'Paciente com hipertensão, faz uso contínuo de Losartana.'
    },
    {
      id: 2,
      name: 'João Oliveira',
      email: 'joao.oliveira@email.com',
      phone: '(11) 91234-5678',
      dateOfBirth: '1978-07-22',
      gender: 'Masculino',
      address: 'Av. Paulista, 1000 - São Paulo, SP',
      lastVisit: '2025-03-20',
      status: 'active',
      prescriptions: 2,
      notes: 'Paciente diabético, necessita monitoramento regular da glicemia.'
    },
    {
      id: 3,
      name: 'Maria Souza',
      email: 'maria.souza@email.com',
      phone: '(11) 97890-1234',
      dateOfBirth: '1992-01-15',
      gender: 'Feminino',
      address: 'Rua Augusta, 500 - São Paulo, SP',
      lastVisit: '2025-04-05',
      status: 'active',
      prescriptions: 1,
      notes: 'Paciente com asma, utiliza bombinha regularmente.'
    },
    {
      id: 4,
      name: 'Pedro Santos',
      email: 'pedro.santos@email.com',
      phone: '(11) 95678-9012',
      dateOfBirth: '1965-12-03',
      gender: 'Masculino',
      address: 'Rua dos Pinheiros, 300 - São Paulo, SP',
      lastVisit: '2025-03-10',
      status: 'inactive',
      prescriptions: 4,
      notes: 'Paciente com colesterol alto, em tratamento com estatinas.'
    },
    {
      id: 5,
      name: 'Juliana Ferreira',
      email: 'juliana.ferreira@email.com',
      phone: '(11) 93456-7890',
      dateOfBirth: '1988-09-28',
      gender: 'Feminino',
      address: 'Alameda Santos, 700 - São Paulo, SP',
      lastVisit: '2025-04-08',
      status: 'active',
      prescriptions: 2,
      notes: 'Paciente com enxaqueca crônica, acompanhamento regular.'
    }
  ];

  // Filtragem de pacientes
  const filteredPatients = mockPatients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    
    let matchesTab = true;
    if (selectedTab === 'recentes') {
      const lastVisitDate = patient.lastVisit ? new Date(patient.lastVisit) : null;
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      matchesTab = lastVisitDate ? lastVisitDate >= oneWeekAgo : false;
    }
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const viewPatientDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsPatientDialogOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pacientes</h1>
            <p className="text-gray-500">Gerenciamento de pacientes • Farmácia {organizationName}</p>
          </div>
          
          <Button className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Novo Paciente
          </Button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockPatients.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Pacientes cadastrados
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockPatients.filter(p => p.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Pacientes em acompanhamento
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Visitas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockPatients.filter(p => {
                  if (!p.lastVisit) return false;
                  const lastVisit = new Date(p.lastVisit);
                  const oneWeekAgo = new Date();
                  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                  return lastVisit >= oneWeekAgo;
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Nos últimos 7 dias
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Novas Prescrições</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                12
              </div>
              <p className="text-xs text-muted-foreground">
                Prescrições no mês
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Search and Filter */}
        <Card>
          <CardHeader className="pb-3">
            <Tabs defaultValue="todos" onValueChange={setSelectedTab}>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <TabsList>
                  <TabsTrigger value="todos">Todos os Pacientes</TabsTrigger>
                  <TabsTrigger value="recentes">Visitas Recentes</TabsTrigger>
                </TabsList>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar pacientes..."
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
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="inactive">Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <TabsContent value="todos">
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>Idade</TableHead>
                        <TableHead>Última Visita</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map(patient => (
                          <TableRow key={patient.id}>
                            <TableCell className="font-medium">{patient.name}</TableCell>
                            <TableCell>
                              <div className="text-sm">{patient.email}</div>
                              <div className="text-xs text-muted-foreground">{patient.phone}</div>
                            </TableCell>
                            <TableCell>{calculateAge(patient.dateOfBirth)} anos</TableCell>
                            <TableCell>
                              {patient.lastVisit ? formatDate(patient.lastVisit) : 'Sem visitas'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={patient.status === 'active' ? 'outline' : 'secondary'} className={
                                patient.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : ''
                              }>
                                {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-blue-600 hover:text-blue-700" 
                                onClick={() => viewPatientDetails(patient)}
                              >
                                <Eye className="h-4 w-4 mr-1" /> Detalhes
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-green-600 hover:text-green-700"
                              >
                                <PlusSquare className="h-4 w-4 mr-1" /> Atendimento
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                            Nenhum paciente encontrado com os filtros aplicados
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="recentes">
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Data da Visita</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Prescrições</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map(patient => (
                          <TableRow key={patient.id}>
                            <TableCell className="font-medium">{patient.name}</TableCell>
                            <TableCell>{patient.lastVisit ? formatDate(patient.lastVisit) : '-'}</TableCell>
                            <TableCell>Dispensação de medicamentos</TableCell>
                            <TableCell>{patient.prescriptions || 0}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-blue-600 hover:text-blue-700"
                                onClick={() => viewPatientDetails(patient)}
                              >
                                <Eye className="h-4 w-4 mr-1" /> Detalhes
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-green-600 hover:text-green-700"
                              >
                                <FileText className="h-4 w-4 mr-1" /> Prescrições
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                            Nenhuma visita recente encontrada
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
      
      {/* Patient Details Dialog */}
      <Dialog open={isPatientDialogOpen} onOpenChange={setIsPatientDialogOpen}>
        <DialogContent className="sm:max-w-[650px]">
          {selectedPatient && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">Ficha do Paciente</DialogTitle>
                <DialogDescription>
                  Informações detalhadas do paciente
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <UserRound className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedPatient.name}</h3>
                    <p className="text-gray-500">{calculateAge(selectedPatient.dateOfBirth)} anos • {selectedPatient.gender}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant={selectedPatient.status === 'active' ? 'outline' : 'secondary'} className={
                        selectedPatient.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : ''
                      }>
                        {selectedPatient.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Última visita: {selectedPatient.lastVisit ? formatDate(selectedPatient.lastVisit) : 'Nunca'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Contato</h4>
                      <p className="text-sm">{selectedPatient.email}</p>
                      <p className="text-sm">{selectedPatient.phone}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Endereço</h4>
                      <p className="text-sm">{selectedPatient.address}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Data de nascimento</h4>
                      <p className="text-sm">{formatDate(selectedPatient.dateOfBirth)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Observações</h4>
                      <p className="text-sm">{selectedPatient.notes || 'Sem observações registradas'}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Estatísticas</h4>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div className="p-2 bg-gray-50 rounded-md text-center">
                          <div className="flex flex-col items-center">
                            <Pill className="h-4 w-4 text-gray-500 mb-1" />
                            <span className="text-lg font-medium">{selectedPatient.prescriptions || 0}</span>
                            <span className="text-xs text-gray-500">Prescrições</span>
                          </div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-md text-center">
                          <div className="flex flex-col items-center">
                            <FileText className="h-4 w-4 text-gray-500 mb-1" />
                            <span className="text-lg font-medium">2</span>
                            <span className="text-xs text-gray-500">Documentos</span>
                          </div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-md text-center">
                          <div className="flex flex-col items-center">
                            <CalendarCheck className="h-4 w-4 text-gray-500 mb-1" />
                            <span className="text-lg font-medium">4</span>
                            <span className="text-xs text-gray-500">Visitas</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPatientDialogOpen(false)}>
                  Fechar
                </Button>
                <Button className="flex items-center gap-2">
                  <PlusSquare className="h-4 w-4" /> Novo Atendimento
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}