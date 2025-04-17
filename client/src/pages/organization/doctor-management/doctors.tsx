import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertCircle, 
  ArrowLeft, 
  Check, 
  CheckCheck, 
  Eye, 
  Filter, 
  Loader2, 
  MoreHorizontal, 
  PencilLine, 
  RefreshCw, 
  Search, 
  Stethoscope, 
  Trash2, 
  UserPlus, 
  XCircle 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Interfaces para Médicos
interface Doctor {
  id: number;
  name: string;
  email: string;
  cpf: string;
  crm: string;
  crmState: string;
  specialty: string;
  phone: string | null;
  profilePhoto: string | null;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  userId?: number;
  joinedAt: string;
  totalPatients: number;
  totalPrescriptions: number;
  bio?: string | null;
  address?: string | null;
}

// Esquema para validação do formulário de médico
const doctorFormSchema = z.object({
  name: z.string().min(3, { message: "O nome precisa ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  cpf: z.string().min(11, { message: "CPF inválido" }),
  crm: z.string().min(4, { message: "CRM inválido" }),
  crmState: z.string().min(2, { message: "Estado do CRM inválido" }),
  specialty: z.string().min(2, { message: "Especialidade inválida" }),
  phone: z.string().optional(),
  status: z.enum(["active", "inactive", "pending", "suspended"]),
  bio: z.string().optional().nullable(),
  address: z.string().optional().nullable()
});

function DoctorManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [specialtyFilter, setSpecialtyFilter] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isNewDoctorDialogOpen, setIsNewDoctorDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  // Buscar médicos
  const { data: doctors, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ['/api/organization/doctors'],
  });

  // Buscar especialidades (para o filtro)
  const { data: specialties, isLoading: isLoadingSpecialties } = useQuery({
    queryKey: ['/api/organization/doctor-specialties'],
  });

  // Formulário para adicionar/editar médico
  const form = useForm<z.infer<typeof doctorFormSchema>>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      name: "",
      email: "",
      cpf: "",
      crm: "",
      crmState: "",
      specialty: "",
      phone: "",
      status: "pending",
      bio: "",
      address: ""
    }
  });

  // Resetar o formulário quando o médico selecionado mudar
  React.useEffect(() => {
    if (selectedDoctor) {
      form.reset({
        name: selectedDoctor.name,
        email: selectedDoctor.email,
        cpf: selectedDoctor.cpf,
        crm: selectedDoctor.crm,
        crmState: selectedDoctor.crmState,
        specialty: selectedDoctor.specialty,
        phone: selectedDoctor.phone || "",
        status: selectedDoctor.status,
        bio: selectedDoctor.bio || "",
        address: selectedDoctor.address || ""
      });
    } else {
      form.reset({
        name: "",
        email: "",
        cpf: "",
        crm: "",
        crmState: "",
        specialty: "",
        phone: "",
        status: "pending",
        bio: "",
        address: ""
      });
    }
  }, [selectedDoctor, form]);

  // Mutação para adicionar médico
  const addDoctorMutation = useMutation({
    mutationFn: async (data: z.infer<typeof doctorFormSchema>) => {
      return await apiRequest('/api/organization/doctors', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Médico cadastrado",
        description: "O médico foi cadastrado com sucesso.",
      });
      setIsNewDoctorDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/organization/doctors'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao cadastrar médico",
        description: "Ocorreu um erro ao cadastrar o médico. Tente novamente.",
        variant: "destructive",
      });
      console.error("Erro ao cadastrar médico:", error);
    }
  });

  // Mutação para atualizar médico
  const updateDoctorMutation = useMutation({
    mutationFn: async (data: z.infer<typeof doctorFormSchema> & { id: number }) => {
      return await apiRequest(`/api/organization/doctors/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Médico atualizado",
        description: "As informações do médico foram atualizadas com sucesso.",
      });
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/organization/doctors'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar médico",
        description: "Ocorreu um erro ao atualizar o médico. Tente novamente.",
        variant: "destructive",
      });
      console.error("Erro ao atualizar médico:", error);
    }
  });

  // Mutação para excluir médico
  const deleteDoctorMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/organization/doctors/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: "Médico removido",
        description: "O médico foi removido com sucesso.",
      });
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/organization/doctors'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover médico",
        description: "Ocorreu um erro ao remover o médico. Tente novamente.",
        variant: "destructive",
      });
      console.error("Erro ao remover médico:", error);
    }
  });

  // Função para lidar com a adição de um novo médico
  const handleAddDoctor = (values: z.infer<typeof doctorFormSchema>) => {
    addDoctorMutation.mutate(values);
  };

  // Função para lidar com a atualização de um médico
  const handleUpdateDoctor = (values: z.infer<typeof doctorFormSchema>) => {
    if (!selectedDoctor) return;
    updateDoctorMutation.mutate({ ...values, id: selectedDoctor.id });
  };

  // Função para lidar com a exclusão de um médico
  const handleDeleteDoctor = () => {
    if (!selectedDoctor) return;
    deleteDoctorMutation.mutate(selectedDoctor.id);
  };

  // Filtragem de médicos
  const filteredDoctors = React.useMemo(() => {
    if (!doctors) return [];
    
    let filtered = [...doctors];
    
    // Filtrar por status
    if (statusFilter) {
      filtered = filtered.filter(doctor => doctor.status === statusFilter);
    }
    
    // Filtrar por especialidade
    if (specialtyFilter) {
      filtered = filtered.filter(doctor => 
        doctor.specialty.toLowerCase() === specialtyFilter.toLowerCase()
      );
    }
    
    // Filtrar por busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doctor => 
        doctor.name.toLowerCase().includes(query) ||
        doctor.email.toLowerCase().includes(query) ||
        doctor.crm.toLowerCase().includes(query) ||
        doctor.crmState.toLowerCase().includes(query) ||
        doctor.specialty.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [doctors, searchQuery, statusFilter, specialtyFilter]);

  // Extrair lista única de especialidades dos médicos para o filtro
  const availableSpecialties = React.useMemo(() => {
    if (!doctors) return [];
    
    const specialtiesSet = new Set(doctors.map(doctor => doctor.specialty));
    return Array.from(specialtiesSet).sort();
  }, [doctors]);

  if (isLoadingDoctors) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/organization/doctor-management")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Médicos Cadastrados</h1>
            <p className="text-muted-foreground">
              Gerencie o cadastro de médicos na plataforma
            </p>
          </div>
        </div>
        
        <Button onClick={() => {
          setSelectedDoctor(null);
          setIsNewDoctorDialogOpen(true);
        }}>
          <UserPlus className="h-4 w-4 mr-2" />
          Cadastrar Médico
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, e-mail, CRM ou especialidade"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter || ""} onValueChange={(value) => setStatusFilter(value || null)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="suspended">Suspenso</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={specialtyFilter || ""} onValueChange={(value) => setSpecialtyFilter(value || null)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por especialidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as especialidades</SelectItem>
              {availableSpecialties.map((specialty) => (
                <SelectItem key={specialty} value={specialty}>
                  {specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => {
            setSearchQuery("");
            setStatusFilter(null);
            setSpecialtyFilter(null);
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Especialidade</TableHead>
                <TableHead>CRM</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prescrições</TableHead>
                <TableHead>Pacientes</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDoctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={doctor.profilePhoto || undefined} />
                        <AvatarFallback>
                          {doctor.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{doctor.name}</p>
                        <p className="text-xs text-muted-foreground">{doctor.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{doctor.specialty}</TableCell>
                  <TableCell>{doctor.crm}/{doctor.crmState}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        doctor.status === 'active' ? 'outline' : 
                        doctor.status === 'pending' ? 'secondary' : 
                        doctor.status === 'suspended' ? 'destructive' : 'default'
                      }
                      className={
                        doctor.status === 'active' 
                          ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300' 
                          : doctor.status === 'pending'
                          ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                          : doctor.status === 'suspended'
                          ? 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300'
                          : 'bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                      }
                    >
                      {doctor.status === 'active' ? 'Ativo' : 
                       doctor.status === 'pending' ? 'Pendente' : 
                       doctor.status === 'suspended' ? 'Suspenso' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>{doctor.totalPrescriptions}</TableCell>
                  <TableCell>{doctor.totalPatients}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Ações</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => {
                          setSelectedDoctor(doctor);
                          setIsViewDialogOpen(true);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedDoctor(doctor);
                          setIsEditDialogOpen(true);
                        }}>
                          <PencilLine className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedDoctor(doctor);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredDoctors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    {searchQuery || statusFilter || specialtyFilter ? (
                      <div>
                        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p>Nenhum médico encontrado com os filtros aplicados</p>
                        <Button 
                          variant="link" 
                          onClick={() => {
                            setSearchQuery("");
                            setStatusFilter(null);
                            setSpecialtyFilter(null);
                          }}
                          className="mt-2"
                        >
                          Limpar filtros
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p>Não há médicos cadastrados</p>
                        <Button 
                          variant="link" 
                          onClick={() => {
                            setSelectedDoctor(null);
                            setIsNewDoctorDialogOpen(true);
                          }}
                          className="mt-2"
                        >
                          Cadastrar um médico
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between py-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredDoctors.length} de {doctors?.length || 0} médicos
          </p>
        </CardFooter>
      </Card>

      {/* Dialog para adicionar um novo médico */}
      <Dialog open={isNewDoctorDialogOpen} onOpenChange={setIsNewDoctorDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Médico</DialogTitle>
            <DialogDescription>
              Preencha os dados do médico para cadastrá-lo na plataforma.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddDoctor)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. Nome Completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="medico@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input placeholder="000.000.000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="crm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CRM</FormLabel>
                      <FormControl>
                        <Input placeholder="00000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="crmState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado do CRM</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AC">AC</SelectItem>
                          <SelectItem value="AL">AL</SelectItem>
                          <SelectItem value="AP">AP</SelectItem>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="BA">BA</SelectItem>
                          <SelectItem value="CE">CE</SelectItem>
                          <SelectItem value="DF">DF</SelectItem>
                          <SelectItem value="ES">ES</SelectItem>
                          <SelectItem value="GO">GO</SelectItem>
                          <SelectItem value="MA">MA</SelectItem>
                          <SelectItem value="MT">MT</SelectItem>
                          <SelectItem value="MS">MS</SelectItem>
                          <SelectItem value="MG">MG</SelectItem>
                          <SelectItem value="PA">PA</SelectItem>
                          <SelectItem value="PB">PB</SelectItem>
                          <SelectItem value="PR">PR</SelectItem>
                          <SelectItem value="PE">PE</SelectItem>
                          <SelectItem value="PI">PI</SelectItem>
                          <SelectItem value="RJ">RJ</SelectItem>
                          <SelectItem value="RN">RN</SelectItem>
                          <SelectItem value="RS">RS</SelectItem>
                          <SelectItem value="RO">RO</SelectItem>
                          <SelectItem value="RR">RR</SelectItem>
                          <SelectItem value="SC">SC</SelectItem>
                          <SelectItem value="SP">SP</SelectItem>
                          <SelectItem value="SE">SE</SelectItem>
                          <SelectItem value="TO">TO</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="specialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especialidade</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a especialidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Clínica Médica">Clínica Médica</SelectItem>
                        <SelectItem value="Neurologia">Neurologia</SelectItem>
                        <SelectItem value="Psiquiatria">Psiquiatria</SelectItem>
                        <SelectItem value="Pediatria">Pediatria</SelectItem>
                        <SelectItem value="Ortopedia">Ortopedia</SelectItem>
                        <SelectItem value="Ginecologia">Ginecologia</SelectItem>
                        <SelectItem value="Endocrinologia">Endocrinologia</SelectItem>
                        <SelectItem value="Dermatologia">Dermatologia</SelectItem>
                        <SelectItem value="Cardiologia">Cardiologia</SelectItem>
                        <SelectItem value="Oncologia">Oncologia</SelectItem>
                        <SelectItem value="Urologia">Urologia</SelectItem>
                        <SelectItem value="Reumatologia">Reumatologia</SelectItem>
                        <SelectItem value="Oftalmologia">Oftalmologia</SelectItem>
                        <SelectItem value="Medicina da Família">Medicina da Família</SelectItem>
                        <SelectItem value="Geriatria">Geriatria</SelectItem>
                        <SelectItem value="Neurocirurgia">Neurocirurgia</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="suspended">Suspenso</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biografia</FormLabel>
                    <FormControl>
                      <Input placeholder="Breve biografia profissional" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço do consultório</FormLabel>
                    <FormControl>
                      <Input placeholder="Endereço completo" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsNewDoctorDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={addDoctorMutation.isPending}
                >
                  {addDoctorMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Cadastrar Médico
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar um médico */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Médico</DialogTitle>
            <DialogDescription>
              Atualize os dados do médico conforme necessário.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateDoctor)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. Nome Completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="medico@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input placeholder="000.000.000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="crm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CRM</FormLabel>
                      <FormControl>
                        <Input placeholder="00000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="crmState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado do CRM</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AC">AC</SelectItem>
                          <SelectItem value="AL">AL</SelectItem>
                          <SelectItem value="AP">AP</SelectItem>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="BA">BA</SelectItem>
                          <SelectItem value="CE">CE</SelectItem>
                          <SelectItem value="DF">DF</SelectItem>
                          <SelectItem value="ES">ES</SelectItem>
                          <SelectItem value="GO">GO</SelectItem>
                          <SelectItem value="MA">MA</SelectItem>
                          <SelectItem value="MT">MT</SelectItem>
                          <SelectItem value="MS">MS</SelectItem>
                          <SelectItem value="MG">MG</SelectItem>
                          <SelectItem value="PA">PA</SelectItem>
                          <SelectItem value="PB">PB</SelectItem>
                          <SelectItem value="PR">PR</SelectItem>
                          <SelectItem value="PE">PE</SelectItem>
                          <SelectItem value="PI">PI</SelectItem>
                          <SelectItem value="RJ">RJ</SelectItem>
                          <SelectItem value="RN">RN</SelectItem>
                          <SelectItem value="RS">RS</SelectItem>
                          <SelectItem value="RO">RO</SelectItem>
                          <SelectItem value="RR">RR</SelectItem>
                          <SelectItem value="SC">SC</SelectItem>
                          <SelectItem value="SP">SP</SelectItem>
                          <SelectItem value="SE">SE</SelectItem>
                          <SelectItem value="TO">TO</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="specialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especialidade</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a especialidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Clínica Médica">Clínica Médica</SelectItem>
                        <SelectItem value="Neurologia">Neurologia</SelectItem>
                        <SelectItem value="Psiquiatria">Psiquiatria</SelectItem>
                        <SelectItem value="Pediatria">Pediatria</SelectItem>
                        <SelectItem value="Ortopedia">Ortopedia</SelectItem>
                        <SelectItem value="Ginecologia">Ginecologia</SelectItem>
                        <SelectItem value="Endocrinologia">Endocrinologia</SelectItem>
                        <SelectItem value="Dermatologia">Dermatologia</SelectItem>
                        <SelectItem value="Cardiologia">Cardiologia</SelectItem>
                        <SelectItem value="Oncologia">Oncologia</SelectItem>
                        <SelectItem value="Urologia">Urologia</SelectItem>
                        <SelectItem value="Reumatologia">Reumatologia</SelectItem>
                        <SelectItem value="Oftalmologia">Oftalmologia</SelectItem>
                        <SelectItem value="Medicina da Família">Medicina da Família</SelectItem>
                        <SelectItem value="Geriatria">Geriatria</SelectItem>
                        <SelectItem value="Neurocirurgia">Neurocirurgia</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="suspended">Suspenso</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biografia</FormLabel>
                    <FormControl>
                      <Input placeholder="Breve biografia profissional" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço do consultório</FormLabel>
                    <FormControl>
                      <Input placeholder="Endereço completo" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={updateDoctorMutation.isPending}
                >
                  {updateDoctorMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog para visualizar detalhes do médico */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Médico</DialogTitle>
            <DialogDescription>
              Informações completas do cadastro do médico.
            </DialogDescription>
          </DialogHeader>
          {selectedDoctor && (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={selectedDoctor.profilePhoto || undefined} />
                  <AvatarFallback className="text-2xl">
                    {selectedDoctor.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-xl font-semibold">{selectedDoctor.name}</h3>
                  <p className="text-muted-foreground">{selectedDoctor.specialty}</p>
                  <Badge 
                    variant={
                      selectedDoctor.status === 'active' ? 'outline' : 
                      selectedDoctor.status === 'pending' ? 'secondary' : 
                      selectedDoctor.status === 'suspended' ? 'destructive' : 'default'
                    }
                    className={
                      selectedDoctor.status === 'active' 
                        ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300 mt-2' 
                        : selectedDoctor.status === 'pending'
                        ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 mt-2'
                        : selectedDoctor.status === 'suspended'
                        ? 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300 mt-2'
                        : 'bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300 mt-2'
                    }
                  >
                    {selectedDoctor.status === 'active' ? 'Ativo' : 
                     selectedDoctor.status === 'pending' ? 'Pendente' : 
                     selectedDoctor.status === 'suspended' ? 'Suspenso' : 'Inativo'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{selectedDoctor.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                  <p>{selectedDoctor.phone || "Não informado"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CPF</p>
                  <p>{selectedDoctor.cpf}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CRM</p>
                  <p>{selectedDoctor.crm}/{selectedDoctor.crmState}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Registrado em</p>
                  <p>{new Date(selectedDoctor.joinedAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Pacientes</p>
                  <p>{selectedDoctor.totalPatients}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Endereço do Consultório</p>
                <p>{selectedDoctor.address || "Não informado"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Biografia</p>
                <p>{selectedDoctor.bio || "Não informada"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-center">
                      <p className="text-xl font-bold">{selectedDoctor.totalPrescriptions}</p>
                      <p className="text-sm text-muted-foreground">Prescrições</p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-center">
                      <p className="text-xl font-bold">{selectedDoctor.totalPatients}</p>
                      <p className="text-sm text-muted-foreground">Pacientes</p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Fechar
                </Button>
                <Button onClick={() => {
                  setIsViewDialogOpen(false);
                  setIsEditDialogOpen(true);
                }}>
                  <PencilLine className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmação de exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover este médico? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          {selectedDoctor && (
            <div className="py-4">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedDoctor.profilePhoto || undefined} />
                  <AvatarFallback>
                    {selectedDoctor.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedDoctor.name}</p>
                  <p className="text-sm text-muted-foreground">
                    CRM: {selectedDoctor.crm}/{selectedDoctor.crmState}
                  </p>
                </div>
              </div>
              {selectedDoctor.totalPrescriptions > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 p-3 rounded-md mb-4 text-sm">
                  <AlertCircle className="h-4 w-4 inline mr-2" />
                  Este médico possui {selectedDoctor.totalPrescriptions} prescrições registradas.
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteDoctor}
              disabled={deleteDoctorMutation.isPending}
            >
              {deleteDoctorMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removendo...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remover Médico
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function DoctorManagementPageWrapper() {
  return (
    <OrganizationLayout>
      <DoctorManagementPage />
    </OrganizationLayout>
  );
}