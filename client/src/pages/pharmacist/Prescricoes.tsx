import { useState } from "react";
import PharmacistLayout from "@/components/layout/pharmacist/PharmacistLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  AlertCircle, 
  Check, 
  CheckCircle, 
  ChevronDown,
  ClipboardCheck, 
  FileText, 
  PillIcon, 
  Search, 
  X 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Dados de exemplo para mockup
const mockPrescriptions = [
  {
    id: "PR-38271",
    patientName: "Maria Oliveira",
    patientId: "PT-29384",
    doctorName: "Dr. Carlos Santos",
    doctorId: "DR-10293",
    date: "2025-04-09T14:30:00",
    status: "pending",
    items: [
      { id: 1, name: "CBD Oil 5%", dosage: "10ml, 2x por dia", duration: "30 dias" },
      { id: 2, name: "Calm CBD Tincture", dosage: "5 gotas, à noite", duration: "15 dias" }
    ],
    notes: "Paciente relatando dores crônicas e ansiedade",
    priority: "medium"
  },
  {
    id: "PR-38272",
    patientName: "João Silva",
    patientId: "PT-19384",
    doctorName: "Dra. Ana Costa",
    doctorId: "DR-20394",
    date: "2025-04-09T10:15:00",
    status: "pending",
    items: [
      { id: 1, name: "Pain Relief Balm", dosage: "Aplicar na área afetada 3x ao dia", duration: "15 dias" }
    ],
    notes: "Paciente com dor lombar intensa",
    priority: "high"
  },
  {
    id: "PR-38273",
    patientName: "Antônio Pereira",
    patientId: "PT-38294",
    doctorName: "Dr. Fernando Mendes",
    doctorId: "DR-39201",
    date: "2025-04-08T16:45:00",
    status: "pending",
    items: [
      { id: 1, name: "CBD Capsules", dosage: "1 cápsula, 1x ao dia", duration: "60 dias" },
      { id: 2, name: "Sleep Formula", dosage: "1 cápsula, 30min antes de dormir", duration: "30 dias" }
    ],
    notes: "Paciente com insônia e dores nas articulações",
    priority: "medium"
  },
  {
    id: "PR-38274",
    patientName: "Luisa Ferreira",
    patientId: "PT-48293",
    doctorName: "Dra. Patrícia Lima",
    doctorId: "DR-48293",
    date: "2025-04-08T09:30:00",
    status: "pending",
    items: [
      { id: 1, name: "CBD Oil 10%", dosage: "5ml, 3x por dia", duration: "30 dias" }
    ],
    notes: "Paciente com epilepsia refratária",
    priority: "high"
  },
  {
    id: "PR-38275",
    patientName: "Roberto Alves",
    patientId: "PT-58293",
    doctorName: "Dr. Marcelo Souza",
    doctorId: "DR-58293",
    date: "2025-04-07T11:20:00",
    status: "pending",
    items: [
      { id: 1, name: "Anti-inflammatory Gel", dosage: "Aplicar na área afetada 2x ao dia", duration: "15 dias" },
      { id: 2, name: "Muscle Relaxant Drops", dosage: "20 gotas, 2x ao dia", duration: "10 dias" }
    ],
    notes: "Paciente com lesão esportiva",
    priority: "low"
  }
];

// Componente para prescrições já aprovadas
const ApprovedPrescriptions = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar prescrições aprovadas..."
              className="pl-9 w-full"
            />
          </div>
          <Select defaultValue="this-week">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="this-week">Esta semana</SelectItem>
              <SelectItem value="this-month">Este mês</SelectItem>
              <SelectItem value="last-month">Mês passado</SelectItem>
              <SelectItem value="all">Todos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="rounded-md border">
        <div className="bg-gray-50 p-3 text-sm font-medium flex items-center">
          <span className="flex-1">Prescrição</span>
          <span className="flex-1">Paciente</span>
          <span className="flex-1">Médico</span>
          <span className="flex-1">Data</span>
          <span className="flex-1">Status</span>
          <span className="w-24 text-right">Ações</span>
        </div>
        
        <div className="divide-y">
          {[...mockPrescriptions.slice(0, 2)].map(prescription => ({
            ...prescription,
            status: "approved",
            approvedDate: "2025-04-10T09:15:00"
          })).map(prescription => (
            <div key={prescription.id} className="p-3 flex items-center text-sm">
              <span className="flex-1 font-medium">{prescription.id}</span>
              <span className="flex-1">{prescription.patientName}</span>
              <span className="flex-1">{prescription.doctorName}</span>
              <span className="flex-1">{new Date(prescription.date).toLocaleDateString('pt-BR')}</span>
              <span className="flex-1">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200 px-2 py-0.5">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Aprovada
                </Badge>
              </span>
              <span className="w-24 text-right">
                <Button variant="ghost" size="sm">
                  <FileText className="h-4 w-4" />
                  <span className="sr-only">Ver detalhes</span>
                </Button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function PharmacistPrescricoes() {
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApprove = () => {
    // Lógica de aprovação seria implementada aqui
    console.log("Aprovando prescrição:", selectedPrescription?.id);
    setIsApprovalDialogOpen(false);
    // Atualizar estado/recarregar dados...
  };

  const handleReject = () => {
    // Lógica de rejeição seria implementada aqui
    console.log("Rejeitando prescrição:", selectedPrescription?.id, "Motivo:", rejectionReason);
    setIsRejectionDialogOpen(false);
    setRejectionReason("");
    // Atualizar estado/recarregar dados...
  };

  return (
    <PharmacistLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Prescrições</h1>
          <p className="text-muted-foreground">
            Visualize, aprove e gerencie prescrições médicas
          </p>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="relative">
              Pendentes
              <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">
                {mockPrescriptions.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="approved">Aprovadas</TabsTrigger>
            <TabsTrigger value="rejected">Rejeitadas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Prescrições Aguardando Aprovação</CardTitle>
                <CardDescription>
                  Revise e aprove prescrições emitidas por médicos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <div className="relative w-80">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Buscar prescrições..."
                        className="pl-9 w-full"
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-1">
                          Filtrar
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem>Prioridade Alta</DropdownMenuItem>
                        <DropdownMenuItem>Prioridade Média</DropdownMenuItem>
                        <DropdownMenuItem>Prioridade Baixa</DropdownMenuItem>
                        <DropdownMenuItem>Todos</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div>
                    <Select defaultValue="newest">
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Ordenar por" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Mais recentes</SelectItem>
                        <SelectItem value="oldest">Mais antigas</SelectItem>
                        <SelectItem value="priority">Prioridade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {mockPrescriptions.map(prescription => (
                    <Card key={prescription.id} className="overflow-hidden">
                      <div className={`h-1.5 w-full ${
                        prescription.priority === 'high' ? 'bg-red-500' : 
                        prescription.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-medium text-lg flex items-center gap-2">
                              <ClipboardCheck className="h-5 w-5 text-gray-500" />
                              {prescription.id}
                              {prescription.priority === 'high' && (
                                <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Prioridade Alta
                                </Badge>
                              )}
                            </h3>
                            <p className="text-muted-foreground text-sm mt-1">
                              Emitida em {new Date(prescription.date).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                              onClick={() => {
                                setSelectedPrescription(prescription);
                                setIsRejectionDialogOpen(true);
                              }}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Rejeitar
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                setSelectedPrescription(prescription);
                                setIsApprovalDialogOpen(true);
                              }}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-6">
                          <div>
                            <h4 className="text-sm font-medium mb-1">Paciente</h4>
                            <p className="text-sm">{prescription.patientName}</p>
                            <p className="text-xs text-gray-500">{prescription.patientId}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1">Médico</h4>
                            <p className="text-sm">{prescription.doctorName}</p>
                            <p className="text-xs text-gray-500">{prescription.doctorId}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1">Observações</h4>
                            <p className="text-sm line-clamp-2">{prescription.notes}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 bg-gray-50 rounded-md p-3">
                          <h4 className="text-sm font-medium mb-2">Medicamentos Prescritos</h4>
                          <ul className="space-y-2">
                            {prescription.items.map(item => (
                              <li key={item.id} className="flex items-start gap-2">
                                <PillIcon className="h-4 w-4 text-gray-500 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium">{item.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {item.dosage} • Duração: {item.duration}
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="approved">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Prescrições Aprovadas</CardTitle>
                <CardDescription>
                  Prescrições que você já revisou e aprovou
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ApprovedPrescriptions />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="rejected">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Prescrições Rejeitadas</CardTitle>
                <CardDescription>
                  Prescrições que você rejeitou por alguma razão
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600">Nenhuma prescrição rejeitada</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Quando você rejeitar prescrições, elas aparecerão aqui.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Diálogo de Aprovação */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Aprovação</DialogTitle>
            <DialogDescription>
              Você está prestes a aprovar a prescrição {selectedPrescription?.id} emitida pelo 
              {selectedPrescription?.doctorName}. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-green-50 p-3 rounded-md flex items-start gap-2 text-sm">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-800 font-medium">Todos os medicamentos prescritos estão disponíveis</p>
              <p className="text-green-700">Os {selectedPrescription?.items?.length || 0} itens estão em estoque e prontos para dispensação.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove}>
              Confirmar Aprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de Rejeição */}
      <Dialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Prescrição</DialogTitle>
            <DialogDescription>
              Por favor, explique o motivo da rejeição da prescrição {selectedPrescription?.id}. 
              Esta informação será enviada ao médico que a emitiu.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="rejection-reason" className="text-sm font-medium">
                Motivo da Rejeição
              </label>
              <Textarea
                id="rejection-reason"
                placeholder="Ex: Dosagem incorreta, medicamento indisponível..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700" 
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              Rejeitar Prescrição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PharmacistLayout>
  );
}