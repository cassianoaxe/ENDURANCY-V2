import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  UserCog,
  Users,
  Plus,
  Edit,
  Trash2,
  Shield,
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
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { UserGroup, Module } from "@shared/schema";

export default function UserGroups() {
  // Estado para filtrar grupos
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    isDefault: false,
  });
  
  // Session user info - Usando um valor fixo para o organizationId por enquanto
  // Isso será atualizado para usar o contexto de autenticação posteriormente
  const organizationId = 1; // TODO: Pegar do contexto
  
  const { toast } = useToast();
  
  // Buscar grupos de usuários
  const { data: userGroups, isLoading: loadingGroups } = useQuery<UserGroup[]>({
    queryKey: ['/api/user-groups', organizationId],
    queryFn: async () => {
      const res = await fetch(`/api/user-groups?organizationId=${organizationId}`);
      if (!res.ok) throw new Error("Erro ao carregar grupos");
      return res.json();
    }
  });
  
  // Buscar módulos disponíveis
  const { data: modules } = useQuery<Module[]>({
    queryKey: ['/api/modules'],
    queryFn: async () => {
      const res = await fetch('/api/modules');
      if (!res.ok) throw new Error("Erro ao carregar módulos");
      return res.json();
    }
  });
  
  // Mutação para criar um novo grupo
  const createGroupMutation = useMutation({
    mutationFn: async (groupData: any) => {
      const res = await apiRequest("POST", "/api/user-groups", {
        ...groupData,
        organizationId
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-groups', organizationId] });
      toast({
        title: "Grupo criado com sucesso",
        description: "O novo grupo de usuários foi criado.",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar grupo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutação para atualizar um grupo
  const updateGroupMutation = useMutation({
    mutationFn: async (groupData: any) => {
      const res = await apiRequest("PUT", `/api/user-groups/${groupData.id}`, groupData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-groups', organizationId] });
      toast({
        title: "Grupo atualizado com sucesso",
        description: "As informações do grupo foram atualizadas.",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar grupo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutação para excluir um grupo
  const deleteGroupMutation = useMutation({
    mutationFn: async (groupId: number) => {
      await apiRequest("DELETE", `/api/user-groups/${groupId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-groups', organizationId] });
      toast({
        title: "Grupo excluído com sucesso",
        description: "O grupo foi excluído permanentemente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir grupo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutação para atualizar permissões de um grupo
  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ groupId, modulePermissions }: any) => {
      const res = await apiRequest("POST", `/api/user-groups/${groupId}/permissions`, { 
        permissions: modulePermissions 
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Permissões atualizadas",
        description: "As permissões do grupo foram atualizadas com sucesso.",
      });
      setIsPermissionsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar permissões",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Resetar formulário
  const resetForm = () => {
    setNewGroup({
      name: "",
      description: "",
      isDefault: false,
    });
    setSelectedGroup(null);
  };
  
  // Abrir diálogo de edição
  const openEditDialog = (group: UserGroup) => {
    setSelectedGroup(group);
    setNewGroup({
      name: group.name,
      description: group.description || "",
      isDefault: group.isDefault || false,
    });
    setIsCreateDialogOpen(true);
  };
  
  // Abrir diálogo de permissões
  const openPermissionsDialog = (group: UserGroup) => {
    setSelectedGroup(group);
    setIsPermissionsDialogOpen(true);
  };
  
  // Salvar grupo (criar ou atualizar)
  const saveGroup = () => {
    if (selectedGroup) {
      updateGroupMutation.mutate({
        id: selectedGroup.id,
        ...newGroup,
      });
    } else {
      createGroupMutation.mutate(newGroup);
    }
  };
  
  // Confirmar exclusão de grupo
  const confirmDeleteGroup = (groupId: number) => {
    if (window.confirm("Tem certeza que deseja excluir este grupo? Esta ação não pode ser desfeita.")) {
      deleteGroupMutation.mutate(groupId);
    }
  };
  
  // Filtrar grupos pelo termo de busca
  const filteredGroups = userGroups?.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Estado para o formulário de permissões
  const [modulePermissions, setModulePermissions] = useState<Array<{
    moduleId: number;
    permissionType: "view" | "edit" | "create" | "delete" | "approve" | "full_access";
  }>>([]);
  
  // Carregar permissões existentes quando um grupo é selecionado
  useQuery({
    queryKey: ['/api/user-groups/permissions', selectedGroup?.id],
    queryFn: async () => {
      if (!selectedGroup) return [];
      const res = await fetch(`/api/user-groups/${selectedGroup.id}/permissions`);
      if (!res.ok) throw new Error("Erro ao carregar permissões");
      const data = await res.json();
      setModulePermissions(data);
      return data;
    },
    enabled: !!selectedGroup && isPermissionsDialogOpen
  });
  
  // Atualizar uma permissão específica
  const updateModulePermission = (moduleId: number, permissionType: "view" | "edit" | "create" | "delete" | "approve" | "full_access") => {
    const existingIndex = modulePermissions.findIndex(p => p.moduleId === moduleId);
    
    // Se já existe uma permissão para esse módulo, atualiza
    if (existingIndex >= 0) {
      const updatedPermissions = [...modulePermissions];
      updatedPermissions[existingIndex] = { moduleId, permissionType };
      setModulePermissions(updatedPermissions);
    } else {
      // Se não existe, adiciona uma nova
      setModulePermissions([...modulePermissions, { moduleId, permissionType }]);
    }
  };
  
  // Salvar permissões
  const savePermissions = () => {
    if (selectedGroup) {
      updatePermissionsMutation.mutate({
        groupId: selectedGroup.id,
        modulePermissions
      });
    }
  };
  
  // Verificar se um módulo tem uma permissão específica
  const hasPermission = (moduleId: number, permissionType: string) => {
    const permission = modulePermissions.find(p => p.moduleId === moduleId);
    return permission?.permissionType === permissionType;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#e6f7e6] rounded-lg">
            <UserCog className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Grupos de Usuários</h1>
            <p className="text-gray-600">
              Gerencie grupos de usuários e suas permissões de acesso aos módulos do sistema.
            </p>
          </div>
        </div>
        <Button 
          onClick={() => {
            resetForm();
            setIsCreateDialogOpen(true);
          }}
          className="add-group-button"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Grupo
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Grupos</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userGroups?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Gerenciando acesso controlado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Grupos Padrão</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userGroups?.filter(group => group.isDefault).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Aplicados automaticamente a novos usuários
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Módulos Gerenciados</CardTitle>
            <Shield className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modules?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Módulos disponíveis para configuração
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Grupos</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input 
                placeholder="Buscar grupos..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            {loadingGroups ? (
              <p className="text-center py-4">Carregando...</p>
            ) : filteredGroups && filteredGroups.length > 0 ? (
              <table className="w-full text-sm text-left user-groups-table">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Nome</th>
                    <th className="px-6 py-3">Descrição</th>
                    <th className="px-6 py-3">Padrão</th>
                    <th className="px-6 py-3">Criado em</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGroups.map((group) => (
                    <tr key={group.id} className="bg-white border-b">
                      <td className="px-6 py-4 font-medium">{group.name}</td>
                      <td className="px-6 py-4">{group.description || "-"}</td>
                      <td className="px-6 py-4">
                        {group.isDefault ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Sim
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                            Não
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'N/A'}
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
                            <DropdownMenuItem onClick={() => openEditDialog(group)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openPermissionsDialog(group)}>
                              <Shield className="mr-2 h-4 w-4" />
                              Permissões
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => confirmDeleteGroup(group.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">Nenhum grupo encontrado.</p>
                <Button 
                  variant="link" 
                  onClick={() => {
                    resetForm();
                    setIsCreateDialogOpen(true);
                  }}
                >
                  Criar o primeiro grupo
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog para criar/editar um grupo */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedGroup ? "Editar Grupo" : "Criar Novo Grupo"}</DialogTitle>
            <DialogDescription>
              Configure as informações básicas do grupo de usuários.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Grupo *</Label>
              <Input
                id="name"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                placeholder="Ex: Gerentes, Administradores, etc."
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                placeholder="Descreva o propósito deste grupo de usuários"
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={newGroup.isDefault}
                onCheckedChange={(checked) => 
                  setNewGroup({ ...newGroup, isDefault: checked as boolean })
                }
              />
              <Label htmlFor="isDefault" className="cursor-pointer">
                Definir como grupo padrão para novos usuários
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveGroup} disabled={!newGroup.name.trim()}>
              {selectedGroup ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para gerenciar permissões */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Permissões: {selectedGroup?.name}</DialogTitle>
            <DialogDescription>
              Configure quais módulos este grupo pode acessar e quais operações pode realizar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto">
            {modules ? (
              modules.map((module) => (
                <div key={module.id} className="border p-4 rounded-lg">
                  <div className="font-medium mb-2">{module.name}</div>
                  <div className="text-xs text-gray-500 mb-3">{module.description}</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`view-${module.id}`}
                        checked={hasPermission(module.id, "view")}
                        onCheckedChange={(checked) => {
                          if (checked) updateModulePermission(module.id, "view");
                        }}
                      />
                      <Label htmlFor={`view-${module.id}`} className="cursor-pointer">Visualizar</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${module.id}`}
                        checked={hasPermission(module.id, "edit")}
                        onCheckedChange={(checked) => {
                          if (checked) updateModulePermission(module.id, "edit");
                        }}
                      />
                      <Label htmlFor={`edit-${module.id}`} className="cursor-pointer">Editar</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`create-${module.id}`}
                        checked={hasPermission(module.id, "create")}
                        onCheckedChange={(checked) => {
                          if (checked) updateModulePermission(module.id, "create");
                        }}
                      />
                      <Label htmlFor={`create-${module.id}`} className="cursor-pointer">Criar</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`delete-${module.id}`}
                        checked={hasPermission(module.id, "delete")}
                        onCheckedChange={(checked) => {
                          if (checked) updateModulePermission(module.id, "delete");
                        }}
                      />
                      <Label htmlFor={`delete-${module.id}`} className="cursor-pointer">Excluir</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`approve-${module.id}`}
                        checked={hasPermission(module.id, "approve")}
                        onCheckedChange={(checked) => {
                          if (checked) updateModulePermission(module.id, "approve");
                        }}
                      />
                      <Label htmlFor={`approve-${module.id}`} className="cursor-pointer">Aprovar</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`full-${module.id}`}
                        checked={hasPermission(module.id, "full_access")}
                        onCheckedChange={(checked) => {
                          if (checked) updateModulePermission(module.id, "full_access");
                        }}
                      />
                      <Label htmlFor={`full-${module.id}`} className="cursor-pointer">Acesso Total</Label>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-4">Carregando módulos...</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={savePermissions}>
              Salvar Permissões
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}