import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  AlertCircle,
  Calendar,
  Download,
  Edit,
  Eye,
  Filter,
  Microscope,
  Plus,
  Search,
  Wrench
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Interfaces
interface Equipment {
  id: number;
  name: string;
  type: string;
  model: string;
  serialNumber: string;
  manufacturer: string;
  acquisitionDate: string;
  lastCalibration: string;
  nextCalibration: string;
  lastMaintenance: string;
  nextMaintenance: string;
  location: string;
  status: 'operational' | 'maintenance' | 'calibration' | 'out_of_service' | 'repair';
  responsible: string;
  notes?: string;
}

interface MaintenanceRecord {
  id: number;
  equipmentId: number;
  date: string;
  type: 'calibration' | 'preventive' | 'corrective' | 'validation';
  description: string;
  technician: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'canceled';
  cost?: number;
  nextDate?: string;
  attachments?: string[];
  notes?: string;
}

export default function EquipamentosPage() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showNewEquipmentDialog, setShowNewEquipmentDialog] = useState(false);
  const [showEquipmentDetailDialog, setShowEquipmentDetailDialog] = useState(false);
  const [showNewMaintenanceDialog, setShowNewMaintenanceDialog] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  // Carregar dados
  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        setIsLoading(true);
        // Na implementação real, isso seria uma chamada à API
        // const response = await fetch('/api/laboratory/equipments');
        // const data = await response.json();
        // setEquipments(data);
        
        // Simulação com dados fictícios para desenvolvimento
        setTimeout(() => {
          setEquipments(mockEquipments);
          setMaintenanceRecords(mockMaintenanceRecords);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Erro ao buscar equipamentos:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar a lista de equipamentos.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    fetchEquipments();
  }, [toast]);

  // Filtrar equipamentos
  const filteredEquipments = equipments.filter(equipment => {
    // Filtro de busca por nome, modelo ou número de série
    const matchesSearch = 
      searchQuery === '' || 
      equipment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro por tipo
    const matchesType = 
      selectedType === 'all' || 
      equipment.type === selectedType;
    
    // Filtro por status
    const matchesStatus = 
      selectedStatus === 'all' || 
      equipment.status === selectedStatus;
    
    // Filtro por tab
    if (activeTab === 'maintenance') {
      // Considerar equipamentos que precisam de manutenção nos próximos 30 dias
      const nextMaintenanceDate = new Date(equipment.nextMaintenance);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return matchesSearch && matchesType && matchesStatus && nextMaintenanceDate <= thirtyDaysFromNow;
    } else if (activeTab === 'calibration') {
      // Considerar equipamentos que precisam de calibração nos próximos 30 dias
      const nextCalibrationDate = new Date(equipment.nextCalibration);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return matchesSearch && matchesType && matchesStatus && nextCalibrationDate <= thirtyDaysFromNow;
    }
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Filtrar registros de manutenção para o equipamento selecionado
  const equipmentMaintenanceRecords = selectedEquipment 
    ? maintenanceRecords.filter(record => record.equipmentId === selectedEquipment.id)
    : [];

  // Função para visualizar detalhes do equipamento
  const viewEquipmentDetails = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setShowEquipmentDetailDialog(true);
  };

  // Função para adicionar novo equipamento
  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Equipamento Adicionado',
      description: 'O novo equipamento foi registrado com sucesso.',
    });
    setShowNewEquipmentDialog(false);
  };

  // Função para adicionar novo registro de manutenção
  const handleAddMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Manutenção Agendada',
      description: 'O novo registro de manutenção foi adicionado com sucesso.',
    });
    setShowNewMaintenanceDialog(false);
  };

  // Função para calcular status de alerta com base nas datas
  const getMaintenanceAlertStatus = (nextDate: string) => {
    const today = new Date();
    const dateToCheck = new Date(nextDate);
    const diffTime = dateToCheck.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'overdue';
    } else if (diffDays <= 7) {
      return 'critical';
    } else if (diffDays <= 30) {
      return 'warning';
    } else {
      return 'normal';
    }
  };

  // Função para traduzir o tipo de equipamento
  const translateEquipmentType = (type: string) => {
    const typeMap: Record<string, string> = {
      'hplc': 'HPLC',
      'gc': 'Cromatógrafo de Gás',
      'spectrometer': 'Espectrômetro',
      'scale': 'Balança',
      'microscope': 'Microscópio',
      'centrifuge': 'Centrífuga',
      'other': 'Outro'
    };
    return typeMap[type] || type;
  };

  // Função para traduzir o status do equipamento
  const translateEquipmentStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'operational': 'Operacional',
      'maintenance': 'Em Manutenção',
      'calibration': 'Em Calibração',
      'out_of_service': 'Fora de Serviço',
      'repair': 'Em Reparo'
    };
    return statusMap[status] || status;
  };

  // Função para obter a cor do status
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'operational': 'bg-green-500 hover:bg-green-600',
      'maintenance': 'bg-yellow-500 hover:bg-yellow-600',
      'calibration': 'bg-blue-500 hover:bg-blue-600',
      'out_of_service': 'bg-red-500 hover:bg-red-600',
      'repair': 'bg-orange-500 hover:bg-orange-600'
    };
    return colorMap[status] || 'bg-gray-500 hover:bg-gray-600';
  };

  // Função para obter a cor do alerta de manutenção
  const getAlertColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'overdue': 'bg-red-500 hover:bg-red-600',
      'critical': 'bg-orange-500 hover:bg-orange-600',
      'warning': 'bg-yellow-500 hover:bg-yellow-600',
      'normal': 'bg-green-500 hover:bg-green-600'
    };
    return colorMap[status] || 'bg-blue-500 hover:bg-blue-600';
  };

  // Função para traduzir o tipo de manutenção
  const translateMaintenanceType = (type: string) => {
    const typeMap: Record<string, string> = {
      'calibration': 'Calibração',
      'preventive': 'Preventiva',
      'corrective': 'Corretiva',
      'validation': 'Validação'
    };
    return typeMap[type] || type;
  };

  // Função para traduzir o status da manutenção
  const translateMaintenanceStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'scheduled': 'Agendada',
      'in_progress': 'Em Andamento',
      'completed': 'Concluída',
      'canceled': 'Cancelada'
    };
    return statusMap[status] || status;
  };

  // Renderização do estado de carregamento
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-150px)]">
        <div className="flex flex-col items-center">
          <Microscope className="h-12 w-12 animate-pulse text-blue-500 mb-2" />
          <p className="text-lg text-gray-600">Carregando equipamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerenciamento de Equipamentos</h1>
        <Button onClick={() => setShowNewEquipmentDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Equipamento
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Equipamentos do Laboratório</CardTitle>
          <CardDescription>
            Gerencie os equipamentos, calibrações e manutenções
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="maintenance">Próximas Manutenções</TabsTrigger>
              <TabsTrigger value="calibration">Próximas Calibrações</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full md:w-auto flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou modelo..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select
                  value={selectedType}
                  onValueChange={setSelectedType}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="hplc">HPLC</SelectItem>
                    <SelectItem value="gc">Cromatógrafo de Gás</SelectItem>
                    <SelectItem value="spectrometer">Espectrômetro</SelectItem>
                    <SelectItem value="scale">Balança</SelectItem>
                    <SelectItem value="microscope">Microscópio</SelectItem>
                    <SelectItem value="centrifuge">Centrífuga</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="operational">Operacional</SelectItem>
                    <SelectItem value="maintenance">Em Manutenção</SelectItem>
                    <SelectItem value="calibration">Em Calibração</SelectItem>
                    <SelectItem value="out_of_service">Fora de Serviço</SelectItem>
                    <SelectItem value="repair">Em Reparo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="hidden md:table-cell">Modelo</TableHead>
                  <TableHead className="hidden lg:table-cell">Próx. Manutenção</TableHead>
                  <TableHead className="hidden lg:table-cell">Próx. Calibração</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Nenhum equipamento encontrado com os filtros atuais.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEquipments.map((equipment) => {
                    const maintenanceAlertStatus = getMaintenanceAlertStatus(equipment.nextMaintenance);
                    const calibrationAlertStatus = getMaintenanceAlertStatus(equipment.nextCalibration);
                    
                    return (
                      <TableRow key={equipment.id}>
                        <TableCell className="font-medium">
                          {equipment.name}
                        </TableCell>
                        <TableCell>{translateEquipmentType(equipment.type)}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div>
                            {equipment.model}
                            <div className="text-xs text-gray-500">
                              SN: {equipment.serialNumber}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center">
                            <Badge 
                              className={getAlertColor(maintenanceAlertStatus)}
                              variant="outline"
                            >
                              {new Date(equipment.nextMaintenance).toLocaleDateString('pt-BR')}
                            </Badge>
                            {maintenanceAlertStatus === 'overdue' && (
                              <AlertCircle className="h-4 w-4 ml-1 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center">
                            <Badge 
                              className={getAlertColor(calibrationAlertStatus)}
                              variant="outline"
                            >
                              {new Date(equipment.nextCalibration).toLocaleDateString('pt-BR')}
                            </Badge>
                            {calibrationAlertStatus === 'overdue' && (
                              <AlertCircle className="h-4 w-4 ml-1 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(equipment.status)}>
                            {translateEquipmentStatus(equipment.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => viewEquipmentDetails(equipment)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            Mostrando {filteredEquipments.length} de {equipments.length} equipamentos
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar Lista
          </Button>
        </CardFooter>
      </Card>

      {/* Card de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Equipamentos Operacionais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {equipments.filter(e => e.status === 'operational').length}
            </div>
            <div className="text-sm text-gray-500">
              de {equipments.length} equipamentos
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Manutenções Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {equipments.filter(e => {
                const nextMaintenanceDate = new Date(e.nextMaintenance);
                const today = new Date();
                return nextMaintenanceDate <= today;
              }).length}
            </div>
            <div className="text-sm text-gray-500">
              equipamentos precisam de atenção
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Próximas Calibrações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {equipments.filter(e => {
                const nextCalibrationDate = new Date(e.nextCalibration);
                const thirtyDaysFromNow = new Date();
                thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                return nextCalibrationDate <= thirtyDaysFromNow;
              }).length}
            </div>
            <div className="text-sm text-gray-500">
              nos próximos 30 dias
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diálogo para adicionar novo equipamento */}
      <Dialog open={showNewEquipmentDialog} onOpenChange={setShowNewEquipmentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Equipamento</DialogTitle>
            <DialogDescription>
              Preencha os dados para registrar um novo equipamento no sistema
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddEquipment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="equipmentName">Nome do Equipamento</Label>
              <Input id="equipmentName" placeholder="Ex: HPLC-01" required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equipmentType">Tipo</Label>
                <Select defaultValue="hplc">
                  <SelectTrigger id="equipmentType">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hplc">HPLC</SelectItem>
                    <SelectItem value="gc">Cromatógrafo de Gás</SelectItem>
                    <SelectItem value="spectrometer">Espectrômetro</SelectItem>
                    <SelectItem value="scale">Balança</SelectItem>
                    <SelectItem value="microscope">Microscópio</SelectItem>
                    <SelectItem value="centrifuge">Centrífuga</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="equipmentStatus">Status Inicial</Label>
                <Select defaultValue="operational">
                  <SelectTrigger id="equipmentStatus">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operacional</SelectItem>
                    <SelectItem value="maintenance">Em Manutenção</SelectItem>
                    <SelectItem value="calibration">Em Calibração</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="equipmentModel">Modelo</Label>
              <Input id="equipmentModel" placeholder="Ex: Agilent 1260 Infinity II" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="equipmentSerialNumber">Número de Série</Label>
              <Input id="equipmentSerialNumber" placeholder="Ex: SN-12345678" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="equipmentManufacturer">Fabricante</Label>
              <Input id="equipmentManufacturer" placeholder="Ex: Agilent Technologies" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="acquisitionDate">Data de Aquisição</Label>
                <Input id="acquisitionDate" type="date" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="responsiblePerson">Responsável</Label>
                <Input id="responsiblePerson" placeholder="Nome do responsável" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="equipmentLocation">Localização</Label>
              <Input id="equipmentLocation" placeholder="Ex: Sala 101 - Análises" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="equipmentNotes">Observações</Label>
              <Input id="equipmentNotes" placeholder="Informações adicionais" />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowNewEquipmentDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">Adicionar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de detalhes do equipamento */}
      {selectedEquipment && (
        <Dialog open={showEquipmentDetailDialog} onOpenChange={setShowEquipmentDetailDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center">
                <Microscope className="h-5 w-5 mr-2 text-blue-600" />
                {selectedEquipment.name}
                <Badge className={`ml-2 ${getStatusColor(selectedEquipment.status)}`}>
                  {translateEquipmentStatus(selectedEquipment.status)}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                {translateEquipmentType(selectedEquipment.type)} • {selectedEquipment.model}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informações do Equipamento */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Informações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-500">Modelo</div>
                      <div className="font-medium">{selectedEquipment.model}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Número de Série</div>
                      <div className="font-medium">{selectedEquipment.serialNumber}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Fabricante</div>
                      <div className="font-medium">{selectedEquipment.manufacturer}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Data de Aquisição</div>
                      <div className="font-medium">{new Date(selectedEquipment.acquisitionDate).toLocaleDateString('pt-BR')}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Localização</div>
                      <div className="font-medium">{selectedEquipment.location}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Responsável</div>
                      <div className="font-medium">{selectedEquipment.responsible}</div>
                    </div>
                  </div>
                  
                  {selectedEquipment.notes && (
                    <div className="mt-3 text-sm">
                      <div className="text-gray-500">Observações</div>
                      <div className="font-medium">{selectedEquipment.notes}</div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Informações
                  </Button>
                </CardFooter>
              </Card>

              {/* Próximas Manutenções e Calibrações */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Manutenção e Calibração</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Última Manutenção</div>
                      <div className="font-medium">
                        {new Date(selectedEquipment.lastMaintenance).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Próxima Manutenção</div>
                      <Badge
                        className={getAlertColor(getMaintenanceAlertStatus(selectedEquipment.nextMaintenance))}
                        variant="outline"
                      >
                        {new Date(selectedEquipment.nextMaintenance).toLocaleDateString('pt-BR')}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Última Calibração</div>
                      <div className="font-medium">
                        {new Date(selectedEquipment.lastCalibration).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Próxima Calibração</div>
                      <Badge
                        className={getAlertColor(getMaintenanceAlertStatus(selectedEquipment.nextCalibration))}
                        variant="outline"
                      >
                        {new Date(selectedEquipment.nextCalibration).toLocaleDateString('pt-BR')}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-2" 
                    onClick={() => {
                      setShowNewMaintenanceDialog(true);
                      setShowEquipmentDetailDialog(false);
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar Manutenção/Calibração
                  </Button>
                </CardContent>
              </Card>

              {/* Histórico de Manutenções */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Histórico de Manutenções e Calibrações</CardTitle>
                </CardHeader>
                <CardContent>
                  {equipmentMaintenanceRecords.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Nenhum registro de manutenção encontrado para este equipamento.
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Técnico</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {equipmentMaintenanceRecords.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell>{new Date(record.date).toLocaleDateString('pt-BR')}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {translateMaintenanceType(record.type)}
                                </Badge>
                              </TableCell>
                              <TableCell>{record.description}</TableCell>
                              <TableCell>{record.technician}</TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    record.status === 'completed'
                                      ? 'bg-green-100 text-green-800'
                                      : record.status === 'in_progress'
                                      ? 'bg-blue-100 text-blue-800'
                                      : record.status === 'scheduled'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }
                                >
                                  {translateMaintenanceStatus(record.status)}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEquipmentDetailDialog(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Diálogo para agendar manutenção */}
      <Dialog open={showNewMaintenanceDialog} onOpenChange={setShowNewMaintenanceDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agendar Manutenção ou Calibração</DialogTitle>
            <DialogDescription>
              {selectedEquipment ? `Equipamento: ${selectedEquipment.name}` : 'Selecione um equipamento e preencha os dados'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddMaintenance} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maintenanceType">Tipo de Serviço</Label>
              <Select defaultValue="preventive">
                <SelectTrigger id="maintenanceType">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventive">Manutenção Preventiva</SelectItem>
                  <SelectItem value="corrective">Manutenção Corretiva</SelectItem>
                  <SelectItem value="calibration">Calibração</SelectItem>
                  <SelectItem value="validation">Validação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maintenanceDate">Data Agendada</Label>
                <Input id="maintenanceDate" type="date" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maintenanceTechnician">Técnico Responsável</Label>
                <Input id="maintenanceTechnician" placeholder="Nome do técnico" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maintenanceDescription">Descrição do Serviço</Label>
              <Input id="maintenanceDescription" placeholder="Descreva o serviço a ser realizado" required />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowNewMaintenanceDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">Agendar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Dados fictícios para desenvolvimento
const mockEquipments: Equipment[] = [
  {
    id: 1,
    name: 'HPLC-01',
    type: 'hplc',
    model: 'Agilent 1260 Infinity II',
    serialNumber: 'SGAHS87456',
    manufacturer: 'Agilent Technologies',
    acquisitionDate: '2023-05-15',
    lastCalibration: '2025-03-15',
    nextCalibration: '2025-09-15',
    lastMaintenance: '2025-02-10',
    nextMaintenance: '2025-05-10',
    location: 'Sala 101 - Área de Análises',
    status: 'operational',
    responsible: 'Ana Silva',
    notes: 'Equipamento principal para análise de canabinoides.'
  },
  {
    id: 2,
    name: 'GC-MS-01',
    type: 'gc',
    model: 'Shimadzu GCMS-QP2020 NX',
    serialNumber: 'JH52645789',
    manufacturer: 'Shimadzu',
    acquisitionDate: '2023-08-20',
    lastCalibration: '2025-02-20',
    nextCalibration: '2025-08-20',
    lastMaintenance: '2025-03-05',
    nextMaintenance: '2025-06-05',
    location: 'Sala 102 - Área de Análises',
    status: 'operational',
    responsible: 'Carlos Mendes'
  },
  {
    id: 3,
    name: 'Balança Analítica',
    type: 'scale',
    model: 'Mettler Toledo XPE205',
    serialNumber: 'BL21354687',
    manufacturer: 'Mettler Toledo',
    acquisitionDate: '2024-01-10',
    lastCalibration: '2025-04-10',
    nextCalibration: '2025-05-10',
    lastMaintenance: '2025-04-10',
    nextMaintenance: '2025-07-10',
    location: 'Sala 101 - Área de Preparo',
    status: 'operational',
    responsible: 'Mariana Costa'
  },
  {
    id: 4,
    name: 'Microscópio Óptico',
    type: 'microscope',
    model: 'Zeiss Axio Scope.A1',
    serialNumber: 'MS78945612',
    manufacturer: 'Zeiss',
    acquisitionDate: '2023-11-15',
    lastCalibration: '2025-02-15',
    nextCalibration: '2025-08-15',
    lastMaintenance: '2025-02-15',
    nextMaintenance: '2025-08-15',
    location: 'Sala 103 - Laboratório de Microbiologia',
    status: 'maintenance',
    responsible: 'Pedro Alves',
    notes: 'Em manutenção preventiva programada.'
  },
  {
    id: 5,
    name: 'Centrífuga',
    type: 'centrifuge',
    model: 'Eppendorf 5430R',
    serialNumber: 'CF45678912',
    manufacturer: 'Eppendorf',
    acquisitionDate: '2024-03-05',
    lastCalibration: '2025-03-05',
    nextCalibration: '2025-09-05',
    lastMaintenance: '2025-03-05',
    nextMaintenance: '2025-09-05',
    location: 'Sala 101 - Área de Preparo',
    status: 'operational',
    responsible: 'Mariana Costa'
  },
  {
    id: 6,
    name: 'ICP-MS',
    type: 'spectrometer',
    model: 'Thermo Scientific iCAP RQ',
    serialNumber: 'ICP87632145',
    manufacturer: 'Thermo Fisher Scientific',
    acquisitionDate: '2023-10-01',
    lastCalibration: '2025-01-10',
    nextCalibration: '2025-07-10',
    lastMaintenance: '2025-01-10',
    nextMaintenance: '2025-04-10',
    location: 'Sala 104 - Análises Elementares',
    status: 'out_of_service',
    responsible: 'Carlos Mendes',
    notes: 'Fora de serviço aguardando peça de reposição.'
  },
  {
    id: 7,
    name: 'HPLC-02',
    type: 'hplc',
    model: 'Agilent 1290 Infinity II',
    serialNumber: 'SGHJ87235',
    manufacturer: 'Agilent Technologies',
    acquisitionDate: '2024-02-15',
    lastCalibration: '2025-03-25',
    nextCalibration: '2025-09-25',
    lastMaintenance: '2025-03-25',
    nextMaintenance: '2025-09-25',
    location: 'Sala 101 - Área de Análises',
    status: 'calibration',
    responsible: 'Ana Silva'
  }
];

// Dados fictícios de registros de manutenção
const mockMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: 1,
    equipmentId: 1,
    date: '2025-02-10',
    type: 'preventive',
    description: 'Manutenção preventiva semestral',
    technician: 'Técnico Agilent',
    status: 'completed',
    cost: 800,
    nextDate: '2025-08-10'
  },
  {
    id: 2,
    equipmentId: 1,
    date: '2024-08-15',
    type: 'calibration',
    description: 'Calibração completa do sistema',
    technician: 'Técnico Agilent',
    status: 'completed',
    cost: 1200,
    nextDate: '2025-02-15'
  },
  {
    id: 3,
    equipmentId: 2,
    date: '2025-03-05',
    type: 'preventive',
    description: 'Verificação e limpeza do sistema',
    technician: 'Técnico Shimadzu',
    status: 'completed',
    cost: 600
  },
  {
    id: 4,
    equipmentId: 3,
    date: '2025-04-10',
    type: 'calibration',
    description: 'Calibração de rotina',
    technician: 'Técnico Mettler',
    status: 'completed',
    cost: 400,
    nextDate: '2025-10-10'
  },
  {
    id: 5,
    equipmentId: 4,
    date: '2025-04-22',
    type: 'corrective',
    description: 'Substituição de lente com defeito',
    technician: 'Técnico Zeiss',
    status: 'in_progress'
  },
  {
    id: 6,
    equipmentId: 1,
    date: '2025-05-15',
    type: 'preventive',
    description: 'Manutenção preventiva programada',
    technician: 'Técnico Agilent',
    status: 'scheduled',
    nextDate: '2025-11-15'
  }
];