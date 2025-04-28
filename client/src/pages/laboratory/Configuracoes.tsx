import React, { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Save, Trash2, UploadCloud, Wrench } from 'lucide-react';

// Tipos de dados
interface AnalyticalMethod {
  id: number;
  code: string;
  name: string;
  testType: string;
  equipment: string;
  version: string;
  status: 'active' | 'inactive' | 'in_development' | 'deprecated';
  lastUpdated: string;
}

interface Equipment {
  id: number;
  name: string;
  model: string;
  serialNumber: string;
  manufacturer: string;
  lastCalibration: string;
  nextCalibration: string;
  status: 'operational' | 'maintenance' | 'calibration' | 'out_of_service';
}

interface LabUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'analyst' | 'technician' | 'manager' | 'viewer';
  status: 'active' | 'inactive';
  lastActive: string;
}

// Componente principal
export default function LaboratoryConfiguracoes() {
  const [activeTab, setActiveTab] = useState('general');
  const [labSettings, setLabSettings] = useState({
    labName: 'LabAnalytics Dall Solutions',
    licenseNumber: 'LAB-PR-20254',
    address: 'Rua das Análises, 1010 - Curitiba, PR',
    phone: '(41) 3333-4444',
    email: 'contato@labanaliticsdall.com.br',
    director: 'Dr. Roberto Dall',
    autoBackups: true,
    emailNotifications: true,
    resultApprovalWorkflow: true,
    allowClientAccess: false,
    defaultSamplePrefix: 'LAB-PR',
    defaultReportPrefix: 'REL',
    retentionPeriod: '5'
  });

  const [analyticalMethods, setAnalyticalMethods] = useState(mockMethods);
  const [equipments, setEquipments] = useState(mockEquipments);
  const [labUsers, setLabUsers] = useState(mockUsers);

  const [showNewMethodDialog, setShowNewMethodDialog] = useState(false);
  const [showNewEquipmentDialog, setShowNewEquipmentDialog] = useState(false);
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);

  // Funções de manipulação de eventos
  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLabSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleChange = (name: string, checked: boolean) => {
    setLabSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const saveSettings = () => {
    // Na implementação real, isso seria uma chamada à API para salvar as configurações
    console.log('Configurações salvas:', labSettings);
    alert('Configurações salvas com sucesso!');
  };

  // Função para traduzir o status do método
  const translateMethodStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'active': 'Ativo',
      'inactive': 'Inativo',
      'in_development': 'Em Desenvolvimento',
      'deprecated': 'Descontinuado'
    };
    return statusMap[status] || status;
  };

  // Função para obter a cor do status do método
  const getMethodStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'active': 'bg-green-500 hover:bg-green-600',
      'inactive': 'bg-gray-500 hover:bg-gray-600',
      'in_development': 'bg-blue-500 hover:bg-blue-600',
      'deprecated': 'bg-red-500 hover:bg-red-600'
    };
    return colorMap[status] || 'bg-gray-500 hover:bg-gray-600';
  };

  // Função para traduzir o status do equipamento
  const translateEquipmentStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'operational': 'Operacional',
      'maintenance': 'Em Manutenção',
      'calibration': 'Em Calibração',
      'out_of_service': 'Fora de Serviço'
    };
    return statusMap[status] || status;
  };

  // Função para obter a cor do status do equipamento
  const getEquipmentStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'operational': 'bg-green-500 hover:bg-green-600',
      'maintenance': 'bg-orange-500 hover:bg-orange-600',
      'calibration': 'bg-blue-500 hover:bg-blue-600',
      'out_of_service': 'bg-red-500 hover:bg-red-600'
    };
    return colorMap[status] || 'bg-gray-500 hover:bg-gray-600';
  };

  // Função para traduzir o papel do usuário
  const translateUserRole = (role: string) => {
    const roleMap: Record<string, string> = {
      'admin': 'Administrador',
      'manager': 'Gerente',
      'analyst': 'Analista',
      'technician': 'Técnico',
      'viewer': 'Visualizador'
    };
    return roleMap[role] || role;
  };

  // Função para obter a cor do papel do usuário
  const getUserRoleColor = (role: string) => {
    const colorMap: Record<string, string> = {
      'admin': 'bg-purple-500 hover:bg-purple-600',
      'manager': 'bg-blue-500 hover:bg-blue-600',
      'analyst': 'bg-green-500 hover:bg-green-600',
      'technician': 'bg-yellow-500 hover:bg-yellow-600',
      'viewer': 'bg-gray-500 hover:bg-gray-600'
    };
    return colorMap[role] || 'bg-gray-500 hover:bg-gray-600';
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configurações do Laboratório</h1>
        <div>
          <Button onClick={saveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="methods">Métodos Analíticos</TabsTrigger>
          <TabsTrigger value="equipment">Equipamentos</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="integration">Integrações</TabsTrigger>
        </TabsList>

        {/* Aba de Configurações Gerais */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Laboratório</CardTitle>
              <CardDescription>
                Informações básicas sobre o laboratório
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="labName">Nome do Laboratório</Label>
                  <Input 
                    id="labName" 
                    name="labName" 
                    value={labSettings.labName} 
                    onChange={handleSettingsChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Número de Licença/Registro</Label>
                  <Input 
                    id="licenseNumber" 
                    name="licenseNumber" 
                    value={labSettings.licenseNumber} 
                    onChange={handleSettingsChange} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input 
                  id="address" 
                  name="address" 
                  value={labSettings.address} 
                  onChange={handleSettingsChange} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    value={labSettings.phone} 
                    onChange={handleSettingsChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    value={labSettings.email} 
                    onChange={handleSettingsChange} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="director">Diretor Técnico</Label>
                <Input 
                  id="director" 
                  name="director" 
                  value={labSettings.director} 
                  onChange={handleSettingsChange} 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferências do Sistema</CardTitle>
              <CardDescription>
                Configure como o sistema de laboratório funciona
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Backups Automáticos</Label>
                      <p className="text-sm text-gray-500">Realizar backups diários automaticamente</p>
                    </div>
                    <Switch 
                      checked={labSettings.autoBackups} 
                      onCheckedChange={(checked) => handleToggleChange('autoBackups', checked)} 
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificações por Email</Label>
                      <p className="text-sm text-gray-500">Enviar emails sobre atualizações e resultados</p>
                    </div>
                    <Switch 
                      checked={labSettings.emailNotifications} 
                      onCheckedChange={(checked) => handleToggleChange('emailNotifications', checked)} 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Fluxo de Aprovação</Label>
                      <p className="text-sm text-gray-500">Requer aprovação para resultados finais</p>
                    </div>
                    <Switch 
                      checked={labSettings.resultApprovalWorkflow} 
                      onCheckedChange={(checked) => handleToggleChange('resultApprovalWorkflow', checked)} 
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Acesso de Clientes</Label>
                      <p className="text-sm text-gray-500">Permitir que clientes vejam seus resultados</p>
                    </div>
                    <Switch 
                      checked={labSettings.allowClientAccess} 
                      onCheckedChange={(checked) => handleToggleChange('allowClientAccess', checked)} 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-4">Configurações de Nomenclatura</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultSamplePrefix">Prefixo de Amostras</Label>
                    <Input 
                      id="defaultSamplePrefix" 
                      name="defaultSamplePrefix" 
                      value={labSettings.defaultSamplePrefix} 
                      onChange={handleSettingsChange} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultReportPrefix">Prefixo de Relatórios</Label>
                    <Input 
                      id="defaultReportPrefix" 
                      name="defaultReportPrefix" 
                      value={labSettings.defaultReportPrefix} 
                      onChange={handleSettingsChange} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retentionPeriod">Período de Retenção (anos)</Label>
                    <Select 
                      value={labSettings.retentionPeriod} 
                      onValueChange={(value) => handleSettingsChange({ target: { name: 'retentionPeriod', value } } as any)}
                    >
                      <SelectTrigger id="retentionPeriod">
                        <SelectValue placeholder="Selecione um período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 ano</SelectItem>
                        <SelectItem value="2">2 anos</SelectItem>
                        <SelectItem value="3">3 anos</SelectItem>
                        <SelectItem value="5">5 anos</SelectItem>
                        <SelectItem value="7">7 anos</SelectItem>
                        <SelectItem value="10">10 anos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Métodos Analíticos */}
        <TabsContent value="methods" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Métodos Analíticos</CardTitle>
                <CardDescription>
                  Gerencie os métodos e protocolos analíticos utilizados no laboratório
                </CardDescription>
              </div>
              <Button onClick={() => setShowNewMethodDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Método
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden md:table-cell">Tipo de Teste</TableHead>
                    <TableHead className="hidden lg:table-cell">Equipamento</TableHead>
                    <TableHead className="hidden lg:table-cell">Versão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyticalMethods.map((method) => (
                    <TableRow key={method.id}>
                      <TableCell className="font-medium">{method.code}</TableCell>
                      <TableCell>{method.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{method.testType}</TableCell>
                      <TableCell className="hidden lg:table-cell">{method.equipment}</TableCell>
                      <TableCell className="hidden lg:table-cell">{method.version}</TableCell>
                      <TableCell>
                        <Badge className={getMethodStatusColor(method.status)}>
                          {translateMethodStatus(method.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">Editar</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Equipamentos */}
        <TabsContent value="equipment" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Equipamentos de Laboratório</CardTitle>
                <CardDescription>
                  Gerencie os equipamentos utilizados nas análises
                </CardDescription>
              </div>
              <Button onClick={() => setShowNewEquipmentDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Equipamento
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead className="hidden md:table-cell">Fabricante</TableHead>
                    <TableHead className="hidden lg:table-cell">Última Calibração</TableHead>
                    <TableHead className="hidden lg:table-cell">Próxima Calibração</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipments.map((equipment) => (
                    <TableRow key={equipment.id}>
                      <TableCell className="font-medium">{equipment.name}</TableCell>
                      <TableCell>{equipment.model}</TableCell>
                      <TableCell className="hidden md:table-cell">{equipment.manufacturer}</TableCell>
                      <TableCell className="hidden lg:table-cell">{equipment.lastCalibration}</TableCell>
                      <TableCell className="hidden lg:table-cell">{equipment.nextCalibration}</TableCell>
                      <TableCell>
                        <Badge className={getEquipmentStatusColor(equipment.status)}>
                          {translateEquipmentStatus(equipment.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm">
                            <Wrench className="h-4 w-4 mr-1" />
                            Manutenção
                          </Button>
                          <Button variant="outline" size="sm">Editar</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Usuários */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Usuários do Laboratório</CardTitle>
                <CardDescription>
                  Gerencie os usuários que têm acesso ao sistema
                </CardDescription>
              </div>
              <Button onClick={() => setShowNewUserDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Último Acesso</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {labUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={getUserRoleColor(user.role)}>
                          {translateUserRole(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {user.status === 'active' ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800">Ativo</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{user.lastActive}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">Editar</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Integrações */}
        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integrações com Sistemas Externos</CardTitle>
              <CardDescription>
                Configure as integrações com outros sistemas e APIs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 border rounded-md">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium">Endurancy</h3>
                      <p className="text-sm text-gray-500">
                        Integração com o sistema principal da Endurancy
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>URL da API</Label>
                      <Input value="https://api.endurancy.com.br/v1" />
                    </div>
                    <div className="space-y-2">
                      <Label>Chave da API</Label>
                      <Input type="password" value="••••••••••••••••••••••" />
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-md">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium">Sistema de Prescrições</h3>
                      <p className="text-sm text-gray-500">
                        Integração com o sistema de prescrições médicas
                      </p>
                    </div>
                    <Switch checked={false} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-50">
                    <div className="space-y-2">
                      <Label>URL da API</Label>
                      <Input disabled value="https://api.prescricoes.com.br/v2" />
                    </div>
                    <div className="space-y-2">
                      <Label>Chave da API</Label>
                      <Input disabled type="password" />
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-md">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium">Exportação de Laudos</h3>
                      <p className="text-sm text-gray-500">
                        Configuração para envio automático de laudos para clientes
                      </p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Método de Envio</Label>
                        <Select defaultValue="email">
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um método" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">E-mail</SelectItem>
                            <SelectItem value="api">API</SelectItem>
                            <SelectItem value="ftp">FTP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Formato do Arquivo</Label>
                        <Select defaultValue="pdf">
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um formato" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="xml">XML</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Frequência</Label>
                        <Select defaultValue="immediate">
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma frequência" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Imediata</SelectItem>
                            <SelectItem value="daily">Diária</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Incluir Anexos</Label>
                        <p className="text-sm text-gray-500">Enviar gráficos e dados brutos junto com o laudo</p>
                      </div>
                      <Switch checked={true} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <UploadCloud className="h-4 w-4 mr-2" />
                Testar Conexões
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo para adicionar novo método analítico */}
      <Dialog open={showNewMethodDialog} onOpenChange={setShowNewMethodDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Método Analítico</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do novo método analítico.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="methodCode">Código</Label>
                <Input id="methodCode" placeholder="Ex: MET-CAN-008" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="methodName">Nome</Label>
                <Input id="methodName" placeholder="Nome do método analítico" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="methodType">Tipo de Teste</Label>
                  <Input id="methodType" placeholder="Ex: Potência" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="methodEquipment">Equipamento</Label>
                  <Select>
                    <SelectTrigger id="methodEquipment">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipments.map(equipment => (
                        <SelectItem key={equipment.id} value={equipment.name}>
                          {equipment.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="methodVersion">Versão</Label>
                  <Input id="methodVersion" placeholder="Ex: 1.0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="methodStatus">Status</Label>
                  <Select defaultValue="in_development">
                    <SelectTrigger id="methodStatus">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="in_development">Em Desenvolvimento</SelectItem>
                      <SelectItem value="deprecated">Descontinuado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowNewMethodDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">Adicionar Método</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo para adicionar novo equipamento */}
      <Dialog open={showNewEquipmentDialog} onOpenChange={setShowNewEquipmentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Equipamento</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do novo equipamento.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equipmentName">Nome</Label>
                <Input id="equipmentName" placeholder="Ex: HPLC-03" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipmentModel">Modelo</Label>
                <Input id="equipmentModel" placeholder="Modelo do equipamento" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="equipmentSerialNumber">Número de Série</Label>
                  <Input id="equipmentSerialNumber" placeholder="Ex: SN12345678" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="equipmentManufacturer">Fabricante</Label>
                  <Input id="equipmentManufacturer" placeholder="Ex: Agilent" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="equipmentLastCalibration">Última Calibração</Label>
                  <Input id="equipmentLastCalibration" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="equipmentNextCalibration">Próxima Calibração</Label>
                  <Input id="equipmentNextCalibration" type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipmentStatus">Status</Label>
                <Select defaultValue="operational">
                  <SelectTrigger id="equipmentStatus">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operacional</SelectItem>
                    <SelectItem value="maintenance">Em Manutenção</SelectItem>
                    <SelectItem value="calibration">Em Calibração</SelectItem>
                    <SelectItem value="out_of_service">Fora de Serviço</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowNewEquipmentDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">Adicionar Equipamento</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo para adicionar novo usuário */}
      <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do novo usuário do laboratório.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userName">Nome</Label>
                <Input id="userName" placeholder="Nome completo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userEmail">E-mail</Label>
                <Input id="userEmail" type="email" placeholder="email@exemplo.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userRole">Função</Label>
                  <Select defaultValue="analyst">
                    <SelectTrigger id="userRole">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="manager">Gerente</SelectItem>
                      <SelectItem value="analyst">Analista</SelectItem>
                      <SelectItem value="technician">Técnico</SelectItem>
                      <SelectItem value="viewer">Visualizador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userStatus">Status</Label>
                  <Select defaultValue="active">
                    <SelectTrigger id="userStatus">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowNewUserDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">Adicionar Usuário</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Dados fictícios para desenvolvimento
const mockMethods: AnalyticalMethod[] = [
  {
    id: 1,
    code: 'MET-CAN-001',
    name: 'Análise de Canabinoides por HPLC',
    testType: 'Perfil de Canabinoides',
    equipment: 'HPLC-01',
    version: '2.1',
    status: 'active',
    lastUpdated: '2025-01-15'
  },
  {
    id: 2,
    code: 'MET-TER-001',
    name: 'Análise de Terpenos por GC-MS',
    testType: 'Perfil de Terpenos',
    equipment: 'GC-MS-01',
    version: '1.3',
    status: 'active',
    lastUpdated: '2025-02-10'
  },
  {
    id: 3,
    code: 'MET-HM-001',
    name: 'Determinação de Metais Pesados por ICP-MS',
    testType: 'Metais Pesados',
    equipment: 'ICP-MS-01',
    version: '1.0',
    status: 'active',
    lastUpdated: '2025-03-05'
  },
  {
    id: 4,
    code: 'MET-MIC-001',
    name: 'Análise Microbiológica',
    testType: 'Microbianos',
    equipment: 'Diversos',
    version: '2.0',
    status: 'active',
    lastUpdated: '2025-01-20'
  },
  {
    id: 5,
    code: 'MET-PES-001',
    name: 'Detecção de Pesticidas por LC-MS/MS',
    testType: 'Pesticidas',
    equipment: 'LC-MS-01',
    version: '1.2',
    status: 'in_development',
    lastUpdated: '2025-03-20'
  },
  {
    id: 6,
    code: 'MET-SOL-001',
    name: 'Análise de Solventes Residuais',
    testType: 'Solventes Residuais',
    equipment: 'GC-MS-02',
    version: '1.1',
    status: 'active',
    lastUpdated: '2025-02-25'
  },
  {
    id: 7,
    code: 'MET-CAN-002',
    name: 'Análise Rápida de Canabinoides',
    testType: 'Potência',
    equipment: 'HPLC-02',
    version: '1.0',
    status: 'deprecated',
    lastUpdated: '2024-10-10'
  }
];

const mockEquipments: Equipment[] = [
  {
    id: 1,
    name: 'HPLC-01',
    model: 'Agilent 1260 Infinity II',
    serialNumber: 'SGAHS87456',
    manufacturer: 'Agilent Technologies',
    lastCalibration: '2025-03-15',
    nextCalibration: '2025-09-15',
    status: 'operational'
  },
  {
    id: 2,
    name: 'GC-MS-01',
    model: 'Shimadzu GCMS-QP2020 NX',
    serialNumber: 'JH52645789',
    manufacturer: 'Shimadzu',
    lastCalibration: '2025-02-20',
    nextCalibration: '2025-08-20',
    status: 'operational'
  },
  {
    id: 3,
    name: 'ICP-MS-01',
    model: 'Thermo Scientific iCAP RQ',
    serialNumber: 'ICP87632145',
    manufacturer: 'Thermo Fisher Scientific',
    lastCalibration: '2025-01-10',
    nextCalibration: '2025-07-10',
    status: 'maintenance'
  },
  {
    id: 4,
    name: 'LC-MS-01',
    model: 'Waters Xevo TQ-S',
    serialNumber: 'LC98761234',
    manufacturer: 'Waters Corporation',
    lastCalibration: '2025-04-05',
    nextCalibration: '2025-10-05',
    status: 'operational'
  },
  {
    id: 5,
    name: 'HPLC-02',
    model: 'Agilent 1290 Infinity II',
    serialNumber: 'SGHJ87235',
    manufacturer: 'Agilent Technologies',
    lastCalibration: '2025-03-25',
    nextCalibration: '2025-09-25',
    status: 'calibration'
  },
  {
    id: 6,
    name: 'Balança Analítica',
    model: 'Mettler Toledo XPE205',
    serialNumber: 'BL21354687',
    manufacturer: 'Mettler Toledo',
    lastCalibration: '2025-04-10',
    nextCalibration: '2025-05-10',
    status: 'operational'
  },
  {
    id: 7,
    name: 'Incubadora',
    model: 'Thermo Scientific Heratherm',
    serialNumber: 'IN54687233',
    manufacturer: 'Thermo Fisher Scientific',
    lastCalibration: '2025-02-15',
    nextCalibration: '2025-08-15',
    status: 'operational'
  }
];

const mockUsers: LabUser[] = [
  {
    id: 1,
    name: 'Ana Silva',
    email: 'ana.silva@labanalytics.com.br',
    role: 'admin',
    status: 'active',
    lastActive: '2025-04-27'
  },
  {
    id: 2,
    name: 'Carlos Mendes',
    email: 'carlos.mendes@labanalytics.com.br',
    role: 'manager',
    status: 'active',
    lastActive: '2025-04-26'
  },
  {
    id: 3,
    name: 'Pedro Alves',
    email: 'pedro.alves@labanalytics.com.br',
    role: 'analyst',
    status: 'active',
    lastActive: '2025-04-25'
  },
  {
    id: 4,
    name: 'Mariana Costa',
    email: 'mariana.costa@labanalytics.com.br',
    role: 'analyst',
    status: 'active',
    lastActive: '2025-04-27'
  },
  {
    id: 5,
    name: 'Juliana Ferreira',
    email: 'juliana.ferreira@labanalytics.com.br',
    role: 'technician',
    status: 'active',
    lastActive: '2025-04-24'
  },
  {
    id: 6,
    name: 'Roberto Santos',
    email: 'roberto.santos@labanalytics.com.br',
    role: 'technician',
    status: 'inactive',
    lastActive: '2025-03-15'
  },
  {
    id: 7,
    name: 'Renata Oliveira',
    email: 'renata.oliveira@clientelab.com.br',
    role: 'viewer',
    status: 'active',
    lastActive: '2025-04-20'
  }
];