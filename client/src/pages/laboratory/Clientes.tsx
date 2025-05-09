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
  DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Building,
  Clock,
  Download,
  Eye,
  Filter,
  FlaskConical,
  Plus,
  Search,
  UserPlus,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
// Layout gerenciado pelo App.tsx

// Tipos
interface LaboratoryClient {
  id: number;
  name: string;
  type: 'company' | 'association' | 'clinic' | 'research' | 'individual';
  email: string;
  phone: string;
  contactPerson: string;
  status: 'active' | 'inactive' | 'pending';
  lastOrder?: string;
  totalOrders: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  registrationDate: string;
  notes?: string;
}

// Componente principal
export default function LaboratoryClientes() {
  const [clients, setClients] = useState<LaboratoryClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const [showClientDetailDialog, setShowClientDetailDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<LaboratoryClient | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  // Buscar clientes
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        // Na implementação real, isso seria uma chamada à API
        // const response = await fetch('/api/laboratory/clients');
        // const data = await response.json();
        // setClients(data);
        
        // Simulação com dados fictícios para desenvolvimento
        setTimeout(() => {
          setClients(mockClients);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar a lista de clientes.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [toast]);

  // Filtragem de clientes
  const filteredClients = clients.filter(client => {
    // Filtro de busca pelo nome ou email
    const matchesSearch = 
      searchQuery === '' || 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro por status
    const matchesStatus = 
      selectedStatus === 'all' || 
      client.status === selectedStatus;
    
    // Filtro por tipo
    const matchesType = 
      selectedType === 'all' || 
      client.type === selectedType;
    
    // Filtro por tab
    if (activeTab === 'recent') {
      // Considerar cliente recente se tiver feito pedido nos últimos 30 dias
      if (!client.lastOrder) return false;
      const lastOrderDate = new Date(client.lastOrder);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return matchesSearch && matchesStatus && matchesType && lastOrderDate >= thirtyDaysAgo;
    }
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Função para traduzir tipo de cliente
  const translateClientType = (type: string) => {
    const typeMap: Record<string, string> = {
      'company': 'Empresa',
      'association': 'Associação',
      'clinic': 'Clínica',
      'research': 'Pesquisa',
      'individual': 'Individual'
    };
    return typeMap[type] || type;
  };

  // Função para traduzir status do cliente
  const translateClientStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'active': 'Ativo',
      'inactive': 'Inativo',
      'pending': 'Pendente'
    };
    return statusMap[status] || status;
  };

  // Função para obter a cor do status
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'active': 'bg-green-500 hover:bg-green-600',
      'inactive': 'bg-gray-500 hover:bg-gray-600',
      'pending': 'bg-yellow-500 hover:bg-yellow-600'
    };
    return colorMap[status] || 'bg-blue-500 hover:bg-blue-600';
  };

  // Função para visualizar detalhes do cliente
  const viewClientDetails = (client: LaboratoryClient) => {
    setSelectedClient(client);
    setShowClientDetailDialog(true);
  };

  // Função para adicionar novo cliente
  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Cliente Adicionado',
      description: 'O novo cliente foi registrado com sucesso.',
    });
    setShowNewClientDialog(false);
  };

  // Renderização do estado de carregamento
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-150px)]">
        <div className="flex flex-col items-center">
          <FlaskConical className="h-12 w-12 animate-pulse text-blue-500 mb-2" />
          <p className="text-lg text-gray-600">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerenciamento de Clientes</h1>
        <Button onClick={() => setShowNewClientDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Clientes</CardTitle>
          <CardDescription>
            Gerencie os clientes do laboratório e suas solicitações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="recent">Recentes</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full md:w-auto flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou email..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-gray-400" />
                <Select
                  value={selectedType}
                  onValueChange={setSelectedType}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="company">Empresa</SelectItem>
                    <SelectItem value="association">Associação</SelectItem>
                    <SelectItem value="clinic">Clínica</SelectItem>
                    <SelectItem value="research">Pesquisa</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
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
                  <TableHead className="hidden md:table-cell">Contato</TableHead>
                  <TableHead className="hidden lg:table-cell">Último Pedido</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Nenhum cliente encontrado com os filtros atuais.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">
                        <div>
                          {client.name}
                          <div className="text-sm text-gray-500">
                            {client.totalOrders} {client.totalOrders === 1 ? 'pedido' : 'pedidos'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{translateClientType(client.type)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div>
                          {client.contactPerson}
                          <div className="text-sm text-gray-500">
                            {client.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {client.lastOrder ? (
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1 text-gray-400" />
                            {new Date(client.lastOrder).toLocaleDateString('pt-BR')}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(client.status)}>
                          {translateClientStatus(client.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => viewClientDetails(client)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            Mostrando {filteredClients.length} de {clients.length} clientes
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar Lista
          </Button>
        </CardFooter>
      </Card>

      {/* Diálogo para adicionar novo cliente */}
      <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Cliente</DialogTitle>
            <DialogDescription>
              Preencha os dados para registrar um novo cliente no sistema
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddClient} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome do Cliente</Label>
              <Input id="clientName" placeholder="Nome da empresa ou instituição" required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientType">Tipo de Cliente</Label>
                <Select defaultValue="company">
                  <SelectTrigger id="clientType">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company">Empresa</SelectItem>
                    <SelectItem value="association">Associação</SelectItem>
                    <SelectItem value="clinic">Clínica</SelectItem>
                    <SelectItem value="research">Pesquisa</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientStatus">Status</Label>
                <Select defaultValue="active">
                  <SelectTrigger id="clientStatus">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Pessoa de Contato</Label>
              <Input id="contactPerson" placeholder="Nome do contato principal" required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@exemplo.com" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" placeholder="(00) 00000-0000" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" placeholder="Endereço completo" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" placeholder="Cidade" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input id="state" placeholder="Estado" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">País</Label>
                <Input id="country" placeholder="País" defaultValue="Brasil" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="postalCode">CEP</Label>
                <Input id="postalCode" placeholder="00000-000" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <textarea 
                id="notes" 
                className="w-full min-h-[80px] rounded-md border border-input p-2"
                placeholder="Informações adicionais sobre o cliente"
              ></textarea>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="notifications" />
              <Label htmlFor="notifications">Enviar notificações para este cliente</Label>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowNewClientDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">Adicionar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de detalhes do cliente */}
      {selectedClient && (
        <Dialog open={showClientDetailDialog} onOpenChange={setShowClientDetailDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                {selectedClient.name}
                <Badge className={`ml-2 ${getStatusColor(selectedClient.status)}`}>
                  {translateClientStatus(selectedClient.status)}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                {translateClientType(selectedClient.type)} • Desde {new Date(selectedClient.registrationDate).toLocaleDateString('pt-BR')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informações de Contato */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Informações de Contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div>
                      <div className="text-gray-500">Contato Principal</div>
                      <div className="font-medium">{selectedClient.contactPerson}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Email</div>
                      <div className="font-medium">{selectedClient.email}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Telefone</div>
                      <div className="font-medium">{selectedClient.phone}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Endereço */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Endereço</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {selectedClient.address}
                    <br />
                    {selectedClient.city}, {selectedClient.state}
                    <br />
                    {selectedClient.postalCode}
                    <br />
                    {selectedClient.country}
                  </p>
                </CardContent>
              </Card>

              {/* Detalhes e Histórico */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Detalhes e Histórico</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-gray-500 text-sm mb-1">Total de Pedidos</div>
                      <div className="text-2xl font-bold">{selectedClient.totalOrders}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-gray-500 text-sm mb-1">Último Pedido</div>
                      <div className="text-xl font-medium">
                        {selectedClient.lastOrder ? (
                          new Date(selectedClient.lastOrder).toLocaleDateString('pt-BR')
                        ) : (
                          <span className="text-gray-400">Nenhum</span>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-gray-500 text-sm mb-1">Cliente Desde</div>
                      <div className="text-xl font-medium">
                        {new Date(selectedClient.registrationDate).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  
                  {selectedClient.notes && (
                    <div className="mt-4">
                      <div className="text-gray-500 text-sm mb-1">Observações</div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        {selectedClient.notes}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Ver histórico completo de pedidos
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowClientDetailDialog(false)}>
                Fechar
              </Button>
              <Button variant="default">
                Criar Nova Amostra
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Dados fictícios para desenvolvimento
const mockClients: LaboratoryClient[] = [
  {
    id: 1,
    name: 'Associação Brasileira de Apoio Cannabis Esperança',
    type: 'association',
    email: 'contato@abrace.org.br',
    phone: '(83) 3031-3030',
    contactPerson: 'Ricardo Peixoto',
    status: 'active',
    lastOrder: '2025-04-15',
    totalOrders: 18,
    address: 'Rua João Pessoa, 123',
    city: 'João Pessoa',
    state: 'PB',
    country: 'Brasil',
    postalCode: '58000-000',
    registrationDate: '2023-05-15',
    notes: 'Associação com foco em pesquisa e desenvolvimento de produtos terapêuticos.'
  },
  {
    id: 2,
    name: 'Universidade Federal de São Paulo',
    type: 'research',
    email: 'lab.pesquisa@unifesp.edu.br',
    phone: '(11) 3091-1234',
    contactPerson: 'Dra. Carolina Silva',
    status: 'active',
    lastOrder: '2025-04-02',
    totalOrders: 7,
    address: 'Av. Prof. Lineu Prestes, 748',
    city: 'São Paulo',
    state: 'SP',
    country: 'Brasil',
    postalCode: '05508-000',
    registrationDate: '2023-08-20'
  },
  {
    id: 3,
    name: 'Clínica Integrada de Dor',
    type: 'clinic',
    email: 'atendimento@clinicador.com.br',
    phone: '(21) 2224-5678',
    contactPerson: 'Dr. Roberto Mendes',
    status: 'inactive',
    lastOrder: '2024-12-10',
    totalOrders: 4,
    address: 'Rua Visconde de Pirajá, 547',
    city: 'Rio de Janeiro',
    state: 'RJ',
    country: 'Brasil',
    postalCode: '22410-003',
    registrationDate: '2024-01-10'
  },
  {
    id: 4,
    name: 'PharmaCann Indústria Farmacêutica',
    type: 'company',
    email: 'qualidade@pharmacann.com.br',
    phone: '(19) 3521-8900',
    contactPerson: 'André Gomes',
    status: 'active',
    lastOrder: '2025-03-25',
    totalOrders: 12,
    address: 'Rodovia Anhanguera Km 129',
    city: 'Campinas',
    state: 'SP',
    country: 'Brasil',
    postalCode: '13100-000',
    registrationDate: '2023-06-05'
  },
  {
    id: 5,
    name: 'Grupo de Apoio a Pacientes Neurológicos',
    type: 'association',
    email: 'contato@gapneuro.org.br',
    phone: '(31) 3335-4567',
    contactPerson: 'Marcelo Ferreira',
    status: 'active',
    lastOrder: '2025-04-10',
    totalOrders: 9,
    address: 'Av. Afonso Pena, 3456',
    city: 'Belo Horizonte',
    state: 'MG',
    country: 'Brasil',
    postalCode: '30130-009',
    registrationDate: '2023-09-15'
  },
  {
    id: 6,
    name: 'Dr. Paulo Ribeiro',
    type: 'individual',
    email: 'dr.paulo.ribeiro@gmail.com',
    phone: '(51) 99876-5432',
    contactPerson: 'Dr. Paulo Ribeiro',
    status: 'pending',
    totalOrders: 1,
    address: 'Rua dos Andradas, 1234',
    city: 'Porto Alegre',
    state: 'RS',
    country: 'Brasil',
    postalCode: '90020-008',
    registrationDate: '2025-03-01'
  },
  {
    id: 7,
    name: 'Instituto de Pesquisas Médicas do Cerrado',
    type: 'research',
    email: 'pesquisa@ipmc.edu.br',
    phone: '(62) 3521-1000',
    contactPerson: 'Dra. Fernanda Lima',
    status: 'active',
    lastOrder: '2025-03-05',
    totalOrders: 5,
    address: 'Campus Universitário, s/n',
    city: 'Goiânia',
    state: 'GO',
    country: 'Brasil',
    postalCode: '74690-900',
    registrationDate: '2024-01-15'
  }
];