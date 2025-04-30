import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  FileText, 
  Mail, 
  Settings, 
  Users, 
  Check, 
  X, 
  Copy, 
  LucideIcon,
  Building2,
  Users2,
  Landmark,
  Building,
  School, 
  MoveRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Tipo para organização
interface OrganizationType {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  fields: string[];
  formTemplateId: number | null;
  emailTemplateId: number | null;
  requiresApproval: boolean;
  hasSubdomain: boolean;
  status: 'active' | 'disabled';
}

export default function OrganizationTypesConfig() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTab, setCurrentTab] = useState('todos');
  const [editingType, setEditingType] = useState<OrganizationType | null>(null);
  
  // Dados de exemplo para os tipos de organização
  const [orgTypes, setOrgTypes] = useState<OrganizationType[]>([
    {
      id: 1,
      name: 'Associação',
      slug: 'associacao',
      description: 'Organizações sem fins lucrativos que representam pacientes',
      icon: 'Users2',
      fields: ['name', 'email', 'document', 'phone', 'address', 'mission', 'members', 'legalRepresentative'],
      formTemplateId: 1,
      emailTemplateId: 1,
      requiresApproval: true,
      hasSubdomain: true,
      status: 'active'
    },
    {
      id: 2,
      name: 'Empresa',
      slug: 'empresa',
      description: 'Organizações com fins lucrativos',
      icon: 'Building2',
      fields: ['name', 'email', 'document', 'phone', 'address', 'website', 'industry', 'foundedAt'],
      formTemplateId: 2,
      emailTemplateId: 2,
      requiresApproval: true,
      hasSubdomain: true,
      status: 'active'
    },
    {
      id: 3,
      name: 'Clínica',
      slug: 'clinica',
      description: 'Centros de atendimento médico',
      icon: 'Building',
      fields: ['name', 'email', 'document', 'phone', 'address', 'specialties', 'responsibleDoctor', 'crmNumber'],
      formTemplateId: 3,
      emailTemplateId: 1,
      requiresApproval: true,
      hasSubdomain: true,
      status: 'active'
    },
    {
      id: 4,
      name: 'Universidade',
      slug: 'universidade',
      description: 'Instituições de ensino e pesquisa',
      icon: 'School',
      fields: ['name', 'email', 'document', 'phone', 'address', 'researchAreas', 'coordinator', 'department'],
      formTemplateId: 4,
      emailTemplateId: 1,
      requiresApproval: true,
      hasSubdomain: true,
      status: 'active'
    },
    {
      id: 5,
      name: 'Órgão Governamental',
      slug: 'orgao-governamental',
      description: 'Instituições públicas e órgãos governamentais',
      icon: 'Landmark',
      fields: ['name', 'email', 'document', 'phone', 'address', 'sector', 'responsibleName', 'responsiblePosition'],
      formTemplateId: null,
      emailTemplateId: null,
      requiresApproval: true,
      hasSubdomain: true,
      status: 'disabled'
    }
  ]);

  // Estados para o formulário de edição/criação
  const [formData, setFormData] = useState<Partial<OrganizationType>>({
    name: '',
    slug: '',
    description: '',
    icon: 'Building2',
    fields: [],
    formTemplateId: null,
    emailTemplateId: null,
    requiresApproval: true,
    hasSubdomain: true,
    status: 'active'
  });

  // Filtrar tipos de organização
  const filteredTypes = orgTypes.filter(type => {
    if (currentTab === 'ativos' && type.status !== 'active') return false;
    if (currentTab === 'desativados' && type.status !== 'disabled') return false;
    
    if (searchTerm) {
      return (
        type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return true;
  });

  // Funções de manipulação
  const handleOpenDialog = (type?: OrganizationType) => {
    if (type) {
      setEditingType(type);
      setFormData({ ...type });
    } else {
      setEditingType(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        icon: 'Building2',
        fields: [],
        formTemplateId: null,
        emailTemplateId: null,
        requiresApproval: true,
        hasSubdomain: true,
        status: 'active'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingType(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleStatusChange = (id: number, status: 'active' | 'disabled') => {
    setOrgTypes(prevTypes => 
      prevTypes.map(type => 
        type.id === id ? { ...type, status } : type
      )
    );
    
    toast({
      title: status === 'active' ? 'Tipo ativado' : 'Tipo desativado',
      description: `O tipo de organização foi ${status === 'active' ? 'ativado' : 'desativado'} com sucesso.`,
      variant: status === 'active' ? 'default' : 'destructive',
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.slug) {
      toast({
        title: 'Dados incompletos',
        description: 'Por favor, preencha pelo menos o nome e o slug do tipo de organização.',
        variant: 'destructive',
      });
      return;
    }
    
    if (editingType) {
      // Editar tipo existente
      setOrgTypes(prevTypes => 
        prevTypes.map(type => 
          type.id === editingType.id ? { ...type, ...formData as OrganizationType } : type
        )
      );
      
      toast({
        title: 'Tipo atualizado',
        description: `O tipo "${formData.name}" foi atualizado com sucesso.`,
      });
    } else {
      // Criar novo tipo
      const newType: OrganizationType = {
        ...formData as OrganizationType,
        id: Math.max(0, ...orgTypes.map(t => t.id)) + 1,
      };
      
      setOrgTypes(prev => [...prev, newType]);
      
      toast({
        title: 'Tipo criado',
        description: `O tipo "${formData.name}" foi criado com sucesso.`,
      });
    }
    
    handleCloseDialog();
  };

  const handleDeleteType = (id: number) => {
    setOrgTypes(prevTypes => prevTypes.filter(type => type.id !== id));
    
    toast({
      title: 'Tipo excluído',
      description: 'O tipo de organização foi excluído permanentemente.',
      variant: 'destructive',
    });
  };

  const generateSlug = () => {
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-');
      
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleDuplicate = (type: OrganizationType) => {
    const newType: OrganizationType = {
      ...type,
      id: Math.max(0, ...orgTypes.map(t => t.id)) + 1,
      name: `${type.name} (Cópia)`,
      slug: `${type.slug}-copia`,
    };
    
    setOrgTypes(prev => [...prev, newType]);
    
    toast({
      title: 'Tipo duplicado',
      description: `Uma cópia do tipo "${type.name}" foi criada.`,
    });
  };

  // Função para renderizar o ícone baseado no nome do ícone
  const renderIcon = (iconName: string) => {
    const iconMap: Record<string, LucideIcon> = {
      Building2,
      Users2,
      Landmark,
      Building,
      School
    };
    
    const Icon = iconMap[iconName] || Building2;
    return <Icon className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Tipos de Organização</h2>
          <p className="text-muted-foreground">
            Configure os diferentes tipos de organização disponíveis no cadastro
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-1.5">
          <Plus className="h-4 w-4" /> Novo Tipo
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative w-1/3">
          <Input
            type="text"
            placeholder="Buscar tipos de organização..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
        </div>
      </div>

      <Tabs defaultValue="todos" onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="ativos">Ativos</TabsTrigger>
          <TabsTrigger value="desativados">Desativados</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Form. / Email</TableHead>
                <TableHead>Sub-domínio</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Nenhum tipo de organização encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-1.5 rounded-md">
                          {renderIcon(type.icon)}
                        </div>
                        <div>
                          <div>{type.name}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {type.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm">
                        {type.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={type.formTemplateId ? "outline" : "secondary"} className="font-normal">
                          <FileText className="h-3 w-3 mr-1" /> 
                          {type.formTemplateId ? 'Configurado' : 'Não configurado'}
                        </Badge>
                        <Badge variant={type.emailTemplateId ? "outline" : "secondary"} className="font-normal">
                          <Mail className="h-3 w-3 mr-1" /> 
                          {type.emailTemplateId ? 'Configurado' : 'Não configurado'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {type.hasSubdomain ? (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          Ativado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground">
                          Desativado
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {type.status === 'active' ? (
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                          <Check className="h-3 w-3 mr-1" /> Ativo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                          <X className="h-3 w-3 mr-1" /> Desativado
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(type)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDuplicate(type)}>
                              <Copy className="h-4 w-4 mr-2" /> Duplicar
                            </DropdownMenuItem>
                            {type.status === 'active' ? (
                              <DropdownMenuItem onClick={() => handleStatusChange(type.id, 'disabled')}>
                                <X className="h-4 w-4 mr-2" /> Desativar
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleStatusChange(type.id, 'active')}>
                                <Check className="h-4 w-4 mr-2" /> Ativar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteType(type.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog para criar/editar tipos */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingType ? `Editar "${editingType.name}"` : 'Criar Novo Tipo de Organização'}
            </DialogTitle>
            <DialogDescription>
              Configure as propriedades para este tipo de organização. As alterações afetarão o cadastro e a navegação no sistema.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                onBlur={generateSlug}
                className="col-span-3"
                placeholder="Ex: Associação"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="slug" className="text-right">
                Slug
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug || ''}
                  onChange={handleInputChange}
                  className="flex-1"
                  placeholder="Ex: associacao"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={generateSlug}
                  title="Gerar slug do nome"
                >
                  <MoveRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Ex: Organizações sem fins lucrativos que representam pacientes"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">
                Ícone
              </Label>
              <div className="col-span-3 grid grid-cols-5 gap-2">
                {['Building2', 'Users2', 'Landmark', 'Building', 'School'].map((iconName) => (
                  <Button
                    key={iconName}
                    type="button"
                    variant={formData.icon === iconName ? "default" : "outline"}
                    className="aspect-square p-2 flex items-center justify-center"
                    onClick={() => setFormData(prev => ({ ...prev, icon: iconName }))}
                  >
                    {renderIcon(iconName)}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Configurações
              </Label>
              <div className="col-span-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="requiresApproval">Requer aprovação</Label>
                    <p className="text-[0.8rem] text-muted-foreground">
                      Organizações deste tipo precisam ser aprovadas manualmente
                    </p>
                  </div>
                  <Switch
                    id="requiresApproval"
                    checked={formData.requiresApproval}
                    onCheckedChange={(checked) => handleSwitchChange('requiresApproval', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="hasSubdomain">Sub-domínio</Label>
                    <p className="text-[0.8rem] text-muted-foreground">
                      Permite criar sub-domínio personalizado para organizações deste tipo
                    </p>
                  </div>
                  <Switch
                    id="hasSubdomain"
                    checked={formData.hasSubdomain}
                    onCheckedChange={(checked) => handleSwitchChange('hasSubdomain', checked)}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}