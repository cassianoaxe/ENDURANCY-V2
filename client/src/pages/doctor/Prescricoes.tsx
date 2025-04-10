import React, { useState } from 'react';
import DoctorLayout from '@/components/layout/doctor/DoctorLayout';
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
  Building
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

// Dados simulados das organizações vinculadas ao médico
const doctorOrganizations = [
  {
    id: 1,
    name: "Green Leaf Farmácia",
    isDefault: true,
    status: "active"
  },
  {
    id: 2,
    name: "MediCanna Dispensário",
    isDefault: false,
    status: "active"
  }
];

// Dados simulados de pacientes por organização
const patientsByOrg = {
  1: [
    { id: 101, name: "João Silva", age: 45, condition: "Dor crônica" },
    { id: 102, name: "Maria Souza", age: 38, condition: "Ansiedade" },
    { id: 103, name: "Carlos Ferreira", age: 52, condition: "Insônia" }
  ],
  2: [
    { id: 201, name: "Ana Oliveira", age: 29, condition: "Epilepsia" },
    { id: 202, name: "Roberto Santos", age: 61, condition: "Artrite" }
  ]
};

// Dados simulados de produtos por organização
const productsByOrg = {
  1: [
    { id: 1001, name: "CBD Oil 5%", description: "Óleo de CBD de amplo espectro", concentration: "500mg/10ml" },
    { id: 1002, name: "Tincture THC/CBD 1:1", description: "Tintura balanceada", concentration: "300mg/30ml" },
    { id: 1003, name: "Flor de Cannabis Indica", description: "Flor seca para vaporização", concentration: "THC 18%" }
  ],
  2: [
    { id: 2001, name: "Óleo de CBD Isolado", description: "Óleo de CBD puro", concentration: "1000mg/30ml" },
    { id: 2002, name: "Cápsulas de CBD", description: "Cápsulas de uso oral", concentration: "25mg/unidade" }
  ]
};

// Prescrições do médico
const prescriptions = [
  {
    id: 1,
    patientName: "João Silva",
    patientId: 101,
    organizationName: "Green Leaf Farmácia",
    organizationId: 1,
    product: "CBD Oil 5%",
    productId: 1001,
    dosage: "0.5ml, 2x ao dia",
    instructions: "Administrar via sublingual, manter por 60 segundos",
    createdAt: "20/04/2025",
    status: "pending",
    notes: ""
  },
  {
    id: 2,
    patientName: "Maria Souza",
    patientId: 102,
    organizationName: "Green Leaf Farmácia",
    organizationId: 1,
    product: "Tincture THC/CBD 1:1",
    productId: 1002,
    dosage: "0.3ml, antes de dormir",
    instructions: "Administrar via sublingual",
    createdAt: "18/04/2025",
    status: "approved",
    notes: "Aprovado pelo Dr. Farmacêutico João"
  },
  {
    id: 3,
    patientName: "Ana Oliveira",
    patientId: 201,
    organizationName: "MediCanna Dispensário",
    organizationId: 2,
    product: "Óleo de CBD Isolado",
    productId: 2001,
    dosage: "1ml, 2x ao dia",
    instructions: "Usar depois das refeições",
    createdAt: "15/04/2025",
    status: "rejected",
    notes: "Sugerindo ajuste de dosagem para 0.5ml"
  }
];

export default function DoctorPrescricoes() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrg, setSelectedOrg] = useState(doctorOrganizations[0].id);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    dosage: '',
    instructions: '',
    duration: '',
    notes: ''
  });
  
  // Filtrar prescrições com base na pesquisa e na aba ativa
  const filteredPrescriptions = prescriptions.filter(prescription => {
    // Filtro por texto de pesquisa
    const matchesSearch = searchQuery === '' || 
                          prescription.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prescription.product.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro por aba
    const matchesTab = activeTab === 'all' || 
                       (activeTab === 'pending' && prescription.status === 'pending') ||
                       (activeTab === 'approved' && prescription.status === 'approved') ||
                       (activeTab === 'rejected' && prescription.status === 'rejected');
    
    // Filtro por organização
    const matchesOrg = prescription.organizationId === selectedOrg;
    
    return matchesSearch && matchesTab && matchesOrg;
  });

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
  const handleSubmitPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Aqui você adicionaria a lógica para enviar a prescrição para o backend
    console.log("Nova prescrição:", {
      doctorId: user?.id,
      patientId: selectedPatient,
      organizationId: selectedOrg,
      productId: selectedProduct,
      ...newPrescription
    });
    
    // Fechar o diálogo após enviar
    setIsCreateDialogOpen(false);
  };

  return (
    <DoctorLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <p className="text-gray-500 text-sm">Gerencie prescrições médicas e produtos</p>
          
          <div className="flex items-center mt-4 sm:mt-0 gap-2">
            <Select 
              value={selectedOrg.toString()} 
              onValueChange={(value) => setSelectedOrg(parseInt(value))}
            >
              <SelectTrigger className="w-[180px] sm:w-[220px]">
                <SelectValue placeholder="Selecionar organização" />
              </SelectTrigger>
              <SelectContent>
                {doctorOrganizations.map(org => (
                  <SelectItem key={org.id} value={org.id.toString()}>
                    {org.name} {org.isDefault && "(Padrão)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={openCreateDialog} className="flex items-center gap-1">
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
                {filteredPrescriptions.length > 0 ? (
                  filteredPrescriptions.map((prescription) => (
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
                            <span className="font-medium">Produto:</span> {prescription.product}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Dosagem:</span> {prescription.dosage}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Instruções:</span> {prescription.instructions}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{prescription.createdAt}</span>
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
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <ClipboardCheck className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>Nenhuma prescrição encontrada</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="pending" className="p-0">
              {/* O conteúdo é filtrado dinamicamente */}
            </TabsContent>
            
            <TabsContent value="approved" className="p-0">
              {/* O conteúdo é filtrado dinamicamente */}
            </TabsContent>
            
            <TabsContent value="rejected" className="p-0">
              {/* O conteúdo é filtrado dinamicamente */}
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
                  doctorOrganizations.find(org => org.id === selectedOrg)?.name
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
                      {patientsByOrg[selectedOrg]?.map(patient => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.name} ({patient.age} anos) - {patient.condition}
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
                      {productsByOrg[selectedOrg]?.map(product => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name} - {product.concentration}
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
    </DoctorLayout>
  );
}