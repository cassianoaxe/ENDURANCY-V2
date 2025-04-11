import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
  AlertCircle, 
  BadgeAlert, 
  Bell, 
  Edit, 
  Key, 
  Mail, 
  MoreHorizontal, 
  Plus, 
  Search, 
  ShieldAlert, 
  Trash, 
  User, 
  UserCog,
  UserPlus
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface StaffUser {
  id: number;
  name: string;
  email: string;
  role: string;
  position: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
  profilePhoto?: string;
  phoneNumber?: string;
}

export default function PharmacistConfiguracoes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('staff');
  const [searchTerm, setSearchTerm] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    position: 'caixa', // Default position
    phoneNumber: '',
    password: '',
    sendInvite: true
  });

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

  // Buscar membros da equipe
  const { data: staffMembers = [], isLoading: isLoadingStaff } = useQuery({
    queryKey: ['pharmacy-staff', user?.organizationId],
    queryFn: async () => {
      if (!user?.organizationId) return [];
      
      // TODO: Implementar API real
      // Dados simulados de funcionários
      const mockData: StaffUser[] = [
        {
          id: 1,
          name: "Maria Silva",
          email: "maria.silva@farmacia.com",
          role: "employee",
          position: "caixa",
          status: "active",
          lastLogin: "2025-04-10T14:30:00",
          phoneNumber: "(11) 98765-4321"
        },
        {
          id: 2,
          name: "João Santos",
          email: "joao.santos@farmacia.com",
          role: "employee",
          position: "estoquista",
          status: "active",
          lastLogin: "2025-04-08T09:15:00"
        },
        {
          id: 3,
          name: "Ana Oliveira",
          email: "ana.oliveira@farmacia.com",
          role: "employee",
          position: "secretaria",
          status: "active",
          lastLogin: "2025-04-09T16:45:00",
          phoneNumber: "(11) 91234-5678"
        }
      ];
      
      return mockData;
    },
    enabled: !!user?.organizationId
  });

  // Adicionar novo membro da equipe
  const addUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      // TODO: Implementar API real
      console.log('Adicionando novo usuário:', userData);
      return { ...userData, id: Date.now() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-staff'] });
      setIsUserFormOpen(false);
      resetUserForm();
      toast({
        title: "Usuário adicionado",
        description: "O novo usuário foi adicionado com sucesso",
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error('Erro ao adicionar usuário:', error);
      toast({
        title: "Erro ao adicionar usuário",
        description: "Verifique os dados e tente novamente",
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  // Atualizar membro da equipe
  const updateUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      // TODO: Implementar API real
      console.log('Atualizando usuário:', userData);
      return userData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-staff'] });
      setIsUserFormOpen(false);
      resetUserForm();
      toast({
        title: "Usuário atualizado",
        description: "As informações do usuário foram atualizadas com sucesso",
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: "Erro ao atualizar usuário",
        description: "Verifique os dados e tente novamente",
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  // Excluir membro da equipe
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      // TODO: Implementar API real
      console.log('Excluindo usuário:', userId);
      return { userId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-staff'] });
      setIsDeleteConfirmOpen(false);
      setSelectedUser(null);
      toast({
        title: "Usuário removido",
        description: "O usuário foi removido com sucesso",
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error('Erro ao remover usuário:', error);
      toast({
        title: "Erro ao remover usuário",
        description: "Ocorreu um erro ao tentar remover o usuário",
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  // Atualizar nome da organização quando os dados forem carregados
  useState(() => {
    if (organizationData) {
      setOrganizationName(organizationData.name || "");
    }
  });

  const resetUserForm = () => {
    setUserForm({
      name: '',
      email: '',
      position: 'caixa',
      phoneNumber: '',
      password: '',
      sendInvite: true
    });
  };

  const handleOpenUserForm = (user?: StaffUser) => {
    if (user) {
      setUserForm({
        name: user.name,
        email: user.email,
        position: user.position,
        phoneNumber: user.phoneNumber || '',
        password: '',
        sendInvite: false
      });
      setSelectedUser(user);
    } else {
      resetUserForm();
      setSelectedUser(null);
    }
    setIsUserFormOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserForm({
      ...userForm,
      [name]: value,
    });
  };

  const handleSwitchChange = (checked: boolean) => {
    setUserForm({
      ...userForm,
      sendInvite: checked,
    });
  };

  const handlePositionChange = (value: string) => {
    setUserForm({
      ...userForm,
      position: value,
    });
  };

  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    const userData = {
      ...userForm,
      role: 'employee',
      organizationId: user?.organizationId,
    };
    
    if (selectedUser) {
      updateUserMutation.mutate({ ...userData, id: selectedUser.id });
    } else {
      addUserMutation.mutate(userData);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  const openDeleteConfirmation = (user: StaffUser) => {
    setSelectedUser(user);
    setIsDeleteConfirmOpen(true);
  };

  const getPositionLabel = (position: string) => {
    switch (position) {
      case 'caixa': return 'Caixa';
      case 'estoquista': return 'Estoquista';
      case 'secretaria': return 'Secretário(a)';
      default: return 'Funcionário';
    }
  };

  const getPositionBadge = (position: string) => {
    switch (position) {
      case 'caixa':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Caixa</Badge>;
      case 'estoquista':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Estoquista</Badge>;
      case 'secretaria':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Secretário(a)</Badge>;
      default:
        return <Badge variant="outline">Funcionário</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredStaff = staffMembers.filter((member: StaffUser) => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      member.name.toLowerCase().includes(search) ||
      member.email.toLowerCase().includes(search) ||
      getPositionLabel(member.position).toLowerCase().includes(search)
    );
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-gray-500">
          Gerencie as configurações da farmácia e usuários • Farmácia {organizationName}
        </p>
      </div>
      
      {/* Tabs */}
      <Card>
        <CardHeader className="pb-0">
          <h2 className="text-xl font-bold">Configurações da Farmácia</h2>
        </CardHeader>
        
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="staff" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Equipe
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notificações
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                Segurança
              </TabsTrigger>
            </TabsList>
          
            {/* Tab: Gerenciamento de Equipe */}
            <TabsContent value="staff" className="mt-4">
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, email ou função..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Button onClick={() => handleOpenUserForm()} className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Adicionar
                </Button>
              </div>
              
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Funcionário</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Último Acesso</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingStaff ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6">
                          Carregando membros da equipe...
                        </TableCell>
                      </TableRow>
                    ) : filteredStaff.length > 0 ? (
                      filteredStaff.map((member: StaffUser) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={member.profilePhoto ? `/uploads/${member.profilePhoto}` : undefined} />
                                <AvatarFallback>
                                  {member.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{member.name}</div>
                                <div className="text-sm text-muted-foreground">{member.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getPositionBadge(member.position)}
                          </TableCell>
                          <TableCell>
                            {member.status === 'active' ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Ativo</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Inativo</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {member.lastLogin ? formatDate(member.lastLogin) : 'Nunca acessou'}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleOpenUserForm(member)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openDeleteConfirmation(member)}>
                                  <Trash className="h-4 w-4 mr-2" />
                                  Remover
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Reenviar convite
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Key className="h-4 w-4 mr-2" />
                                  Resetar senha
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6">
                          Nenhum funcionário encontrado com os critérios de busca.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                <BadgeAlert className="h-4 w-4" />
                <AlertTitle>Sobre os Níveis de Acesso</AlertTitle>
                <AlertDescription className="text-blue-700">
                  <p className="mb-2">Cada função tem um nível de acesso diferente ao sistema:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li><span className="font-medium">Caixa:</span> Acesso ao módulo de vendas e caixa.</li>
                    <li><span className="font-medium">Estoquista:</span> Acesso ao controle de estoque e pedidos.</li>
                    <li><span className="font-medium">Secretário(a):</span> Acesso à agenda, pacientes e prescrições.</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
          
          {/* Tab: Notificações */}
          <TabsContent value="notifications" className="mt-0">
            <div className="space-y-5">
              <div className="grid gap-5">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="email-notifications" className="flex flex-col">
                    <span>Notificações por Email</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      Receba notificações importantes por email
                    </span>
                  </Label>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="stock-alerts" className="flex flex-col">
                    <span>Alertas de Estoque Baixo</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      Receba alertas quando produtos estiverem com estoque baixo
                    </span>
                  </Label>
                  <Switch id="stock-alerts" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="prescription-notifications" className="flex flex-col">
                    <span>Notificações de Prescrições</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      Seja notificado sobre novas prescrições médicas
                    </span>
                  </Label>
                  <Switch id="prescription-notifications" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="order-updates" className="flex flex-col">
                    <span>Atualizações de Pedidos</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      Receba atualizações sobre o status de pedidos
                    </span>
                  </Label>
                  <Switch id="order-updates" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="marketing-notifications" className="flex flex-col">
                    <span>Notificações de Marketing</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      Novidades sobre produtos e ofertas
                    </span>
                  </Label>
                  <Switch id="marketing-notifications" />
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-4">Frequência de Resumos</h3>
                
                <div className="grid gap-5">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="daily-summary" className="flex flex-col">
                      <span>Resumo Diário</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Receba um resumo das atividades ao final do dia
                      </span>
                    </Label>
                    <Switch id="daily-summary" />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="weekly-summary" className="flex flex-col">
                      <span>Resumo Semanal</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Receba um resumo das atividades da semana
                      </span>
                    </Label>
                    <Switch id="weekly-summary" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="monthly-summary" className="flex flex-col">
                      <span>Resumo Mensal</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Receba um resumo das atividades do mês
                      </span>
                    </Label>
                    <Switch id="monthly-summary" defaultChecked />
                  </div>
                </div>
              </div>
              
              <Button className="w-full">Salvar Preferências</Button>
            </div>
          </TabsContent>
          
          {/* Tab: Segurança */}
          <TabsContent value="security" className="mt-0">
            <div className="space-y-5">
              <div className="grid gap-5">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="two-factor-auth" className="flex flex-col">
                    <span>Autenticação de Dois Fatores</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      Adicione uma camada extra de segurança à sua conta
                    </span>
                  </Label>
                  <Switch id="two-factor-auth" />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="session-timeout" className="flex flex-col">
                    <span>Tempo Limite de Sessão</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      Encerrar sessão automaticamente após período de inatividade
                    </span>
                  </Label>
                  <Switch id="session-timeout" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="failed-login-alerts" className="flex flex-col">
                    <span>Alertas de Tentativas de Login</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      Receba alertas sobre tentativas de login malsucedidas
                    </span>
                  </Label>
                  <Switch id="failed-login-alerts" defaultChecked />
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-4">Privacidade</h3>
                
                <div className="grid gap-5">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="data-sharing" className="flex flex-col">
                      <span>Compartilhamento de Dados</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Permitir compartilhamento de dados para melhorias no sistema
                      </span>
                    </Label>
                    <Switch id="data-sharing" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="activity-tracking" className="flex flex-col">
                      <span>Rastreamento de Atividades</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Permitir rastreamento de atividades para fins de segurança
                      </span>
                    </Label>
                    <Switch id="activity-tracking" defaultChecked />
                  </div>
                </div>
              </div>
              
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Área de Risco</AlertTitle>
                <AlertDescription className="text-red-700">
                  As configurações abaixo podem afetar permanentemente sua conta e dados.
                  Proceda com cautela.
                </AlertDescription>
              </Alert>
              
              <div className="pt-4">
                <Button variant="destructive" className="w-full">
                  Redefinir Configurações de Segurança
                </Button>
              </div>
            </div>
          </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Dialog: Adicionar/Editar Usuário */}
      <Dialog open={isUserFormOpen} onOpenChange={setIsUserFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</DialogTitle>
            <DialogDescription>
              {selectedUser 
                ? 'Edite as informações do usuário da equipe' 
                : 'Adicione um novo membro à equipe da farmácia'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitUser}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={userForm.name}
                  onChange={handleInputChange}
                  placeholder="Nome completo"
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={userForm.email}
                  onChange={handleInputChange}
                  placeholder="email@exemplo.com"
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="position" className="text-right">
                  Função
                </Label>
                <Select
                  value={userForm.position}
                  onValueChange={handlePositionChange}
                >
                  <SelectTrigger id="position" className="col-span-3">
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="caixa">Caixa</SelectItem>
                    <SelectItem value="estoquista">Estoquista</SelectItem>
                    <SelectItem value="secretaria">Secretário(a)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phoneNumber" className="text-right">
                  Telefone
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={userForm.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                  className="col-span-3"
                />
              </div>
              
              {!selectedUser && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Senha Inicial
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={userForm.password}
                    onChange={handleInputChange}
                    placeholder="Senha inicial (opcional)"
                    className="col-span-3"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <div></div>
                <div className="col-span-3 flex items-center space-x-2">
                  <Switch
                    id="sendInvite"
                    checked={userForm.sendInvite}
                    onCheckedChange={handleSwitchChange}
                  />
                  <Label htmlFor="sendInvite">
                    {selectedUser 
                      ? 'Enviar notificação sobre alterações' 
                      : 'Enviar email de convite'}
                  </Label>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsUserFormOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={addUserMutation.isPending || updateUserMutation.isPending}
              >
                {(addUserMutation.isPending || updateUserMutation.isPending) 
                  ? 'Salvando...' 
                  : selectedUser ? 'Salvar Alterações' : 'Adicionar Usuário'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog: Confirmar Exclusão */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja remover este usuário? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="py-4">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedUser.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                </div>
              </div>
              
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700">
                  O usuário perderá todo o acesso ao sistema e suas permissões serão revogadas.
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? 'Removendo...' : 'Confirmar Exclusão'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}