import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Users, 
  Search, 
  MoreVertical, 
  Plus, 
  Edit, 
  Trash, 
  UserPlus,
  UserCheck,
  X,
  FilePlus,
  Printer,
  Download
} from "lucide-react";

// Esquema de validação para o formulário de paciente
const patientFormSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }).optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  cpf: z.string().min(11, { message: "CPF deve ter 11 dígitos" }).max(14),
  dateOfBirth: z.string(),
  gender: z.string(),
  address: z.string().optional().or(z.literal("")),
  emergencyContact: z.string().optional().or(z.literal("")),
  healthInsurance: z.string().optional().or(z.literal("")),
  healthInsuranceNumber: z.string().optional().or(z.literal("")),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

interface Patient {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  cpf: string;
  dateOfBirth: string;
  gender: string;
  address?: string;
  emergencyContact?: string;
  healthInsurance?: string;
  healthInsuranceNumber?: string;
  createdAt: string;
}

export default function GerenciarPacientes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Carregar dados dos pacientes
  const { data: patients, isLoading, error } = useQuery<Patient[]>({
    queryKey: ['/api/patients'],
    enabled: !!user?.organizationId,
  });

  // Formulário para adicionar/editar paciente
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      cpf: "",
      dateOfBirth: "",
      gender: "",
      address: "",
      emergencyContact: "",
      healthInsurance: "",
      healthInsuranceNumber: "",
    },
  });

  // Mutation para adicionar paciente
  const addPatientMutation = useMutation({
    mutationFn: (data: PatientFormValues) => {
      return apiRequest('/api/patients', {
        method: 'POST',
        data: {
          ...data,
          organizationId: user?.organizationId,
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Paciente adicionado",
        description: "O paciente foi adicionado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar paciente",
        description: error.message || "Ocorreu um erro ao adicionar o paciente.",
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar paciente
  const updatePatientMutation = useMutation({
    mutationFn: (data: PatientFormValues & { id: number }) => {
      const { id, ...rest } = data;
      return apiRequest(`/api/patients/${id}`, {
        method: 'PUT',
        data: rest
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      setIsEditDialogOpen(false);
      form.reset();
      toast({
        title: "Paciente atualizado",
        description: "Os dados do paciente foram atualizados com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar paciente",
        description: error.message || "Ocorreu um erro ao atualizar os dados do paciente.",
        variant: "destructive",
      });
    },
  });

  // Mutation para excluir paciente
  const deletePatientMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/patients/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Paciente excluído",
        description: "O paciente foi excluído com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir paciente",
        description: error.message || "Ocorreu um erro ao excluir o paciente.",
        variant: "destructive",
      });
    },
  });

  // Função para lidar com o envio do formulário de adição
  const onSubmitAdd = (data: PatientFormValues) => {
    addPatientMutation.mutate(data);
  };

  // Função para lidar com o envio do formulário de edição
  const onSubmitEdit = (data: PatientFormValues) => {
    if (selectedPatient) {
      updatePatientMutation.mutate({ ...data, id: selectedPatient.id });
    }
  };

  // Função para abrir o modal de edição com os dados do paciente
  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    
    // Formatação da data para o formato yyyy-MM-dd para o input
    const dateOfBirth = new Date(patient.dateOfBirth);
    const formattedDate = dateOfBirth.toISOString().split('T')[0];
    
    form.reset({
      name: patient.name,
      email: patient.email || "",
      phone: patient.phone || "",
      cpf: patient.cpf,
      dateOfBirth: formattedDate,
      gender: patient.gender,
      address: patient.address || "",
      emergencyContact: patient.emergencyContact || "",
      healthInsurance: patient.healthInsurance || "",
      healthInsuranceNumber: patient.healthInsuranceNumber || "",
    });
    
    setIsEditDialogOpen(true);
  };

  // Função para abrir o modal de exclusão
  const handleDeletePatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDeleteDialogOpen(true);
  };

  // Filtrar pacientes com base no termo de busca
  const filteredPatients = patients?.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (patient.phone && patient.phone.includes(searchTerm)) ||
    patient.cpf.includes(searchTerm)
  ) || [];

  // Exportar dados dos pacientes para CSV
  const exportToCSV = () => {
    if (!patients || patients.length === 0) return;
    
    const headers = ['Nome', 'Email', 'Telefone', 'CPF', 'Data de Nascimento', 'Gênero', 'Endereço', 'Contato de Emergência', 'Plano de Saúde', 'Número do Plano'];
    
    const csvData = patients.map(patient => [
      patient.name,
      patient.email || '',
      patient.phone || '',
      patient.cpf,
      new Date(patient.dateOfBirth).toLocaleDateString('pt-BR'),
      patient.gender,
      patient.address || '',
      patient.emergencyContact || '',
      patient.healthInsurance || '',
      patient.healthInsuranceNumber || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pacientes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <OrganizationLayout>
      <div className="container py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gerenciar Pacientes</h1>
            <p className="text-muted-foreground">
              Gerencie os pacientes cadastrados em sua organização.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar pacientes..."
                className="pl-8 w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <FilePlus className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar CSV
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir Lista
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => {
              form.reset({
                name: "",
                email: "",
                phone: "",
                cpf: "",
                dateOfBirth: "",
                gender: "",
                address: "",
                emergencyContact: "",
                healthInsurance: "",
                healthInsuranceNumber: "",
              });
              setIsAddDialogOpen(true);
            }}>
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Paciente
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">
              Lista de Pacientes
            </CardTitle>
            <CardDescription>
              Total de {filteredPatients.length} pacientes encontrados.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center py-8 text-destructive">
                Erro ao carregar os pacientes. Por favor, tente novamente.
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-3" />
                {searchTerm ? (
                  <>
                    <h3 className="text-lg font-medium">Nenhum paciente encontrado</h3>
                    <p className="text-muted-foreground">
                      Não encontramos pacientes com o termo "{searchTerm}".
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium">Nenhum paciente cadastrado</h3>
                    <p className="text-muted-foreground">
                      Comece adicionando seu primeiro paciente.
                    </p>
                    <Button 
                      variant="default" 
                      className="mt-4"
                      onClick={() => setIsAddDialogOpen(true)}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Novo Paciente
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Nome</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Data de Nascimento</TableHead>
                      <TableHead>Gênero</TableHead>
                      <TableHead>Plano de Saúde</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.name}</TableCell>
                        <TableCell>{patient.cpf}</TableCell>
                        <TableCell>
                          {patient.email && <div>{patient.email}</div>}
                          {patient.phone && <div className="text-muted-foreground">{patient.phone}</div>}
                        </TableCell>
                        <TableCell>{new Date(patient.dateOfBirth).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{patient.gender}</TableCell>
                        <TableCell>
                          {patient.healthInsurance ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                              {patient.healthInsurance}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">Não informado</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEditPatient(patient)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar paciente
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive" 
                                onClick={() => handleDeletePatient(patient)}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Excluir paciente
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Modal para adicionar paciente */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Paciente</DialogTitle>
            <DialogDescription>
              Preencha os dados do paciente abaixo. Campos com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitAdd)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="000.000.000-00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gênero *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o gênero" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="feminino">Feminino</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                          <SelectItem value="nao_informado">Prefiro não informar</SelectItem>
                        </SelectContent>
                      </Select>
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
                        <Input {...field} type="email" placeholder="email@exemplo.com" />
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
                        <Input {...field} placeholder="(00) 00000-0000" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Endereço completo" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contato de Emergência</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome e telefone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="healthInsurance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plano de Saúde</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nome do plano" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="healthInsuranceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número do Plano</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Número da carteirinha" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={addPatientMutation.isPending}
                >
                  {addPatientMutation.isPending && (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  )}
                  Adicionar Paciente
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal para editar paciente */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Paciente</DialogTitle>
            <DialogDescription>
              Atualize os dados do paciente abaixo. Campos com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="000.000.000-00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gênero *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o gênero" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="feminino">Feminino</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                          <SelectItem value="nao_informado">Prefiro não informar</SelectItem>
                        </SelectContent>
                      </Select>
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
                        <Input {...field} type="email" placeholder="email@exemplo.com" />
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
                        <Input {...field} placeholder="(00) 00000-0000" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Endereço completo" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contato de Emergência</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome e telefone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="healthInsurance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plano de Saúde</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nome do plano" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="healthInsuranceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número do Plano</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Número da carteirinha" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
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
                  disabled={updatePatientMutation.isPending}
                >
                  {updatePatientMutation.isPending && (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  )}
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal para confirmar exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o paciente <strong>{selectedPatient?.name}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedPatient && deletePatientMutation.mutate(selectedPatient.id)}
              disabled={deletePatientMutation.isPending}
            >
              {deletePatientMutation.isPending && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
              )}
              Excluir Paciente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OrganizationLayout>
  );
}