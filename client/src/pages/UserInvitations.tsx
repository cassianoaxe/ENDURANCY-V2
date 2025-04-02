import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Mail,
  UserPlus,
  Clock,
  RefreshCw,
  Ban,
  CheckCircle,
  MoreHorizontal
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { UserInvitation, UserGroup } from "@shared/schema";

export default function UserInvitations() {
  // Estado para filtrar convites
  const [searchTerm, setSearchTerm] = useState("");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [newInvitation, setNewInvitation] = useState({
    email: "",
    role: "org_admin",
    groupId: "none",
  });
  
  // Session user info - Usando um valor fixo para o organizationId e userId por enquanto
  // Isso será atualizado para usar o contexto de autenticação posteriormente
  const organizationId = 1; // TODO: Pegar do contexto
  const userId = 1; // TODO: Pegar do contexto
  
  const { toast } = useToast();
  
  // Buscar convites de usuários
  const { data: userInvitations, isLoading: loadingInvitations } = useQuery<UserInvitation[]>({
    queryKey: ['/api/user-invitations', organizationId],
    queryFn: async () => {
      const res = await fetch(`/api/user-invitations?organizationId=${organizationId}`);
      if (!res.ok) throw new Error("Erro ao carregar convites");
      return res.json();
    }
  });
  
  // Buscar grupos de usuários
  const { data: userGroups } = useQuery<UserGroup[]>({
    queryKey: ['/api/user-groups', organizationId],
    queryFn: async () => {
      const res = await fetch(`/api/user-groups?organizationId=${organizationId}`);
      if (!res.ok) throw new Error("Erro ao carregar grupos");
      return res.json();
    }
  });
  
  // Mutação para criar um novo convite
  const createInvitationMutation = useMutation({
    mutationFn: async (invitationData: any) => {
      const res = await apiRequest("POST", "/api/user-invitations", {
        ...invitationData,
        organizationId,
        invitedBy: userId
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-invitations', organizationId] });
      toast({
        title: "Convite enviado com sucesso",
        description: "Um e-mail foi enviado para o usuário com as instruções de acesso.",
      });
      setIsInviteDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao enviar convite",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutação para reenviar um convite
  const resendInvitationMutation = useMutation({
    mutationFn: async (invitationId: number) => {
      const res = await apiRequest("POST", `/api/user-invitations/${invitationId}/resend`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-invitations', organizationId] });
      toast({
        title: "Convite reenviado",
        description: "O convite foi reenviado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao reenviar convite",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutação para cancelar um convite
  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: number) => {
      await apiRequest("PUT", `/api/user-invitations/${invitationId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-invitations', organizationId] });
      toast({
        title: "Convite cancelado",
        description: "O convite foi cancelado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao cancelar convite",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Resetar formulário
  const resetForm = () => {
    setNewInvitation({
      email: "",
      role: "org_admin",
      groupId: "none",
    });
  };
  
  // Enviar convite
  const sendInvitation = () => {
    createInvitationMutation.mutate({
      email: newInvitation.email,
      role: newInvitation.role,
      groupId: newInvitation.groupId && newInvitation.groupId !== "none" ? parseInt(newInvitation.groupId) : null,
    });
  };
  
  // Filtrar convites pelo termo de busca
  const filteredInvitations = userInvitations?.filter(invitation => 
    invitation.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Verificar se um convite está expirado
  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };
  
  // Obter nome do grupo
  const getGroupName = (groupId: number | null) => {
    if (!groupId || !userGroups) return "Nenhum";
    const group = userGroups.find(g => g.id === groupId);
    return group?.name || "Desconhecido";
  };
  
  // Formatação do status do convite
  const formatStatus = (status: string, expiresAt: string) => {
    if (status === "accepted") return "Aceito";
    if (status === "expired" || isExpired(expiresAt)) return "Expirado";
    return "Pendente";
  };
  
  // Cores e estilos para os status
  const getStatusStyles = (status: string, expiresAt: string) => {
    const formattedStatus = formatStatus(status, expiresAt);
    
    if (formattedStatus === "Aceito") return "bg-green-100 text-green-800";
    if (formattedStatus === "Expirado") return "bg-red-100 text-red-800";
    return "bg-yellow-100 text-yellow-800";
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#e6f7e6] rounded-lg">
            <Mail className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Convites de Usuários</h1>
            <p className="text-gray-600">
              Convide novos usuários para sua organização e acompanhe o status dos convites enviados.
            </p>
          </div>
        </div>
        <Button 
          onClick={() => {
            resetForm();
            setIsInviteDialogOpen(true);
          }}
          className="add-invitation-button"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Convidar Usuário
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Convites</CardTitle>
            <Mail className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userInvitations?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Convites enviados recentemente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Convites Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userInvitations?.filter(inv => 
                inv.status === "pending" && !isExpired(inv.expiresAt)
              ).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando resposta do usuário
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Convites Aceitos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userInvitations?.filter(inv => inv.status === "accepted").length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Usuários incorporados ao sistema
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Convites</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input 
                placeholder="Buscar e-mail..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            {loadingInvitations ? (
              <p className="text-center py-4">Carregando...</p>
            ) : filteredInvitations && filteredInvitations.length > 0 ? (
              <table className="w-full text-sm text-left invitations-table">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">E-mail</th>
                    <th className="px-6 py-3">Perfil</th>
                    <th className="px-6 py-3">Grupo</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Enviado em</th>
                    <th className="px-6 py-3">Expira em</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvitations.map((invitation) => (
                    <tr key={invitation.id} className="bg-white border-b">
                      <td className="px-6 py-4 font-medium">{invitation.email}</td>
                      <td className="px-6 py-4">{invitation.role}</td>
                      <td className="px-6 py-4">{getGroupName(invitation.groupId)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyles(invitation.status, invitation.expiresAt)}`}>
                          {formatStatus(invitation.status, invitation.expiresAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {invitation.createdAt ? new Date(invitation.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        {invitation.expiresAt ? new Date(invitation.expiresAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {invitation.status === "pending" && !isExpired(invitation.expiresAt) && (
                              <DropdownMenuItem onClick={() => resendInvitationMutation.mutate(invitation.id)}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Reenviar
                              </DropdownMenuItem>
                            )}
                            {invitation.status === "pending" && (
                              <DropdownMenuItem 
                                onClick={() => cancelInvitationMutation.mutate(invitation.id)}
                                className="text-red-600"
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Cancelar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">Nenhum convite encontrado.</p>
                <Button 
                  variant="link" 
                  onClick={() => {
                    resetForm();
                    setIsInviteDialogOpen(true);
                  }}
                >
                  Enviar o primeiro convite
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog para enviar um convite */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Convidar Novo Usuário</DialogTitle>
            <DialogDescription>
              Envie um convite por e-mail para adicionar um novo usuário à organização.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail do usuário *</Label>
              <Input
                id="email"
                type="email"
                value={newInvitation.email}
                onChange={(e) => setNewInvitation({ ...newInvitation, email: e.target.value })}
                placeholder="exemplo@email.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Perfil de acesso *</Label>
              <Select 
                value={newInvitation.role}
                onValueChange={(value) => setNewInvitation({ ...newInvitation, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="org_admin">Administrador da Organização</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="doctor">Médico</SelectItem>
                  <SelectItem value="employee">Funcionário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="group">Grupo de usuários</Label>
              <Select 
                value={newInvitation.groupId}
                onValueChange={(value) => setNewInvitation({ ...newInvitation, groupId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um grupo (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {userGroups?.map(group => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                O grupo determina quais permissões de acesso o usuário terá.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={sendInvitation} 
              disabled={!newInvitation.email.trim() || !newInvitation.role}
            >
              Enviar Convite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}