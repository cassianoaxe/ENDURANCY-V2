import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  Send,
  Search,
  Check,
  X,
  Mail
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Esquema de validação para convite de médico
const inviteFormSchema = z.object({
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  specialty: z.string().min(1, "Especialidade é obrigatória"),
  crm: z.string().min(1, "CRM é obrigatório"),
  crmState: z.string().min(1, "Estado do CRM é obrigatório"),
  message: z.string().optional(),
});

// Tipo de status de afiliação
type AffiliationStatus = "pending" | "active" | "denied" | "expired";

// Interface para convites de afiliação
interface AffiliationInvite {
  id: number;
  doctorName: string;
  doctorEmail: string;
  specialty: string;
  crm: string;
  crmState: string;
  status: AffiliationStatus;
  createdAt: string;
  expiresAt: string;
  respondedAt?: string;
}

// Interface para médicos afiliados
interface AffiliatedDoctor {
  id: number;
  name: string;
  email: string;
  specialty: string;
  crm: string;
  crmState: string;
  status: "active" | "suspended";
  profilePhoto: string | null;
  affiliatedSince: string;
  lastActivity?: string;
}

function DoctorAffiliationPage() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("convites");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const { toast } = useToast();

  // Buscar convites de afiliação
  const { data: invites, isLoading: isLoadingInvites } = useQuery({
    queryKey: ['/api/organization/doctor-management/affiliation/invites'],
  });

  // Buscar médicos afiliados
  const { data: affiliatedDoctors, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ['/api/organization/doctor-management/affiliation/doctors'],
  });

  // Formulário de convite
  const form = useForm<z.infer<typeof inviteFormSchema>>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      name: "",
      specialty: "Clínica Geral", // Valor padrão para evitar erros com Select.Item
      crm: "",
      crmState: "SP", // Valor padrão para evitar erros com Select.Item
      message: ""
    },
  });

  // Mutação para enviar convite
  const sendInviteMutation = useMutation({
    mutationFn: async (data: z.infer<typeof inviteFormSchema>) => {
      const response = await fetch('/api/organization/doctor-management/affiliation/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao enviar convite');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organization/doctor-management/affiliation/invites'] });
      toast({
        title: 'Convite enviado com sucesso',
        description: 'O médico receberá um email com instruções para aceitar o convite',
        variant: 'default',
      });
      setIsInviteOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao enviar convite',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutação para cancelar convite
  const cancelInviteMutation = useMutation({
    mutationFn: async (inviteId: number) => {
      const response = await fetch(`/api/organization/doctor-management/affiliation/invite/${inviteId}/cancel`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao cancelar convite');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organization/doctor-management/affiliation/invites'] });
      toast({
        title: 'Convite cancelado',
        description: 'O convite foi cancelado com sucesso',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao cancelar convite',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutação para remover afiliação
  const removeAffiliationMutation = useMutation({
    mutationFn: async (doctorId: number) => {
      const response = await fetch(`/api/organization/doctor-management/affiliation/doctors/${doctorId}/remove`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao remover afiliação');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organization/doctor-management/affiliation/doctors'] });
      toast({
        title: 'Afiliação removida',
        description: 'O médico foi desafiliado da organização',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao remover afiliação',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutação para reenviar convite
  const resendInviteMutation = useMutation({
    mutationFn: async (inviteId: number) => {
      const response = await fetch(`/api/organization/doctor-management/affiliation/invite/${inviteId}/resend`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao reenviar convite');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organization/doctor-management/affiliation/invites'] });
      toast({
        title: 'Convite reenviado',
        description: 'O convite foi reenviado para o email do médico',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao reenviar convite',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = (values: z.infer<typeof inviteFormSchema>) => {
    sendInviteMutation.mutate(values);
  };

  // Filtragem de convites com base no termo de busca
  const filteredInvites = invites?.filter((invite: AffiliationInvite) => 
    invite.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    invite.doctorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invite.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  // Filtragem de médicos afiliados com base no termo de busca
  const filteredDoctors = affiliatedDoctors?.filter((doctor: AffiliatedDoctor) => 
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Helper para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Helper para verificar se um convite está expirado
  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  // Estado para o modal de confirmação
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    action: () => {},
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Afiliação de Médicos</h1>
          <p className="text-muted-foreground">
            Gerencie convites e médicos afiliados à sua organização
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Convidar Médico
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Convidar Médico</DialogTitle>
                <DialogDescription>
                  Envie um convite para um médico se afiliar à sua organização. O médico receberá um email com instruções para aceitar o convite.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Dr. João Silva" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="col-span-2">
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
                    </div>

                    <FormField
                      control={form.control}
                      name="specialty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Especialidade</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecionar especialidade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Especialidades</SelectLabel>
                                <SelectItem value="Cardiologia">Cardiologia</SelectItem>
                                <SelectItem value="Neurologia">Neurologia</SelectItem>
                                <SelectItem value="Psiquiatria">Psiquiatria</SelectItem>
                                <SelectItem value="Dermatologia">Dermatologia</SelectItem>
                                <SelectItem value="Oftalmologia">Oftalmologia</SelectItem>
                                <SelectItem value="Ortopedia">Ortopedia</SelectItem>
                                <SelectItem value="Pediatria">Pediatria</SelectItem>
                                <SelectItem value="Clínica Geral">Clínica Geral</SelectItem>
                                <SelectItem value="Ginecologia">Ginecologia</SelectItem>
                                <SelectItem value="Endocrinologia">Endocrinologia</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-2">
                      <FormField
                        control={form.control}
                        name="crm"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>CRM</FormLabel>
                            <FormControl>
                              <Input placeholder="123456" {...field} />
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
                            <FormLabel>UF</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="UF" />
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

                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mensagem (opcional)</FormLabel>
                            <FormControl>
                              <textarea 
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Mensagem personalizada para o convite..." 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={sendInviteMutation.isPending}
                    >
                      {sendInviteMutation.isPending ? (
                        <>Enviando...</>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Enviar Convite
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Tabs defaultValue="convites" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="convites">
              <UserPlus className="h-4 w-4 mr-2" />
              Convites
            </TabsTrigger>
            <TabsTrigger value="afiliados">
              <UserCheck className="h-4 w-4 mr-2" />
              Médicos Afiliados
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center mt-4 mb-2">
            <Search className="h-4 w-4 mr-2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou especialidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <TabsContent value="convites" className="space-y-4">
            {isLoadingInvites ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredInvites.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <Mail className="h-10 w-10 text-muted-foreground opacity-40 mb-3" />
                  <p className="text-lg font-medium">Nenhum convite encontrado</p>
                  <p className="text-muted-foreground text-center mt-1">
                    {searchTerm ? 
                      "Tente ajustar os termos de busca ou" : 
                      "Você ainda não enviou convites para médicos ou"
                    }
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setIsInviteOpen(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Criar novo convite
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredInvites.map((invite: AffiliationInvite) => (
                  <Card key={invite.id} className={isExpired(invite.expiresAt) && invite.status === 'pending' ? 'border-muted bg-muted/20' : ''}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{invite.doctorName}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <Mail className="h-3 w-3 mr-1" /> 
                            {invite.doctorEmail}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            invite.status === 'pending' 
                              ? isExpired(invite.expiresAt) 
                                ? 'outline' 
                                : 'secondary'
                              : invite.status === 'active' 
                                ? 'default' 
                                : 'destructive'
                          }
                          className="ml-2"
                        >
                          {invite.status === 'pending' ? (
                            isExpired(invite.expiresAt) ? 'Expirado' : 'Pendente'
                          ) : invite.status === 'active' ? (
                            'Aceito'
                          ) : invite.status === 'denied' ? (
                            'Recusado'
                          ) : (
                            'Expirado'
                          )}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Especialidade:</span>
                          <p>{invite.specialty}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">CRM:</span>
                          <p>{invite.crm} / {invite.crmState}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Enviado em:</span>
                          <p>{formatDate(invite.createdAt)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            {invite.status === 'pending' && !isExpired(invite.expiresAt) ? 'Expira em:' : 
                             invite.status === 'pending' && isExpired(invite.expiresAt) ? 'Expirou em:' :
                             invite.status === 'active' ? 'Aceito em:' :
                             invite.status === 'denied' ? 'Recusado em:' : 'Expirou em:'}
                          </span>
                          <p>
                            {invite.status === 'pending' ? 
                              formatDate(invite.expiresAt) :
                              formatDate(invite.respondedAt || invite.expiresAt)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      {invite.status === 'pending' && !isExpired(invite.expiresAt) ? (
                        <div className="flex space-x-2 w-full">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => resendInviteMutation.mutate(invite.id)}
                            disabled={resendInviteMutation.isPending}
                          >
                            <Send className="h-3.5 w-3.5 mr-1" />
                            Reenviar
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => {
                              setConfirmationModal({
                                isOpen: true,
                                title: 'Cancelar convite',
                                description: `Tem certeza que deseja cancelar o convite para ${invite.doctorName}?`,
                                action: () => {
                                  cancelInviteMutation.mutate(invite.id);
                                  setConfirmationModal(prev => ({ ...prev, isOpen: false }));
                                }
                              });
                            }}
                            disabled={cancelInviteMutation.isPending}
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      ) : invite.status === 'pending' && isExpired(invite.expiresAt) ? (
                        <div className="w-full">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => resendInviteMutation.mutate(invite.id)}
                            disabled={resendInviteMutation.isPending}
                          >
                            <Send className="h-3.5 w-3.5 mr-1" />
                            Reenviar convite
                          </Button>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground w-full text-center">
                          {invite.status === 'active' ? 
                            'Médico afiliado à organização' : 
                            'Convite não pode mais ser processado'}
                        </p>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="afiliados" className="space-y-4">
            {isLoadingDoctors ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredDoctors.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <UserX className="h-10 w-10 text-muted-foreground opacity-40 mb-3" />
                  <p className="text-lg font-medium">Nenhum médico afiliado encontrado</p>
                  <p className="text-muted-foreground text-center mt-1">
                    {searchTerm ? 
                      "Tente ajustar os termos de busca ou" : 
                      "Sua organização ainda não possui médicos afiliados ou"
                    }
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setIsInviteOpen(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Convidar médico
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDoctors.map((doctor: AffiliatedDoctor) => (
                  <Card key={doctor.id} className={doctor.status === 'suspended' ? 'border-muted bg-muted/20' : ''}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12 border">
                          <AvatarImage src={doctor.profilePhoto || undefined} alt={doctor.name} />
                          <AvatarFallback>{doctor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{doctor.name}</CardTitle>
                            <Badge
                              variant={doctor.status === 'active' ? 'default' : 'destructive'}
                              className="ml-2"
                            >
                              {doctor.status === 'active' ? 'Ativo' : 'Suspenso'}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center mt-1">
                            <Mail className="h-3 w-3 mr-1" /> 
                            {doctor.email}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Especialidade:</span>
                          <p>{doctor.specialty}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">CRM:</span>
                          <p>{doctor.crm} / {doctor.crmState}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Afiliado desde:</span>
                          <p>{formatDate(doctor.affiliatedSince)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Última atividade:</span>
                          <p>{doctor.lastActivity ? formatDate(doctor.lastActivity) : 'Não disponível'}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <div className="flex space-x-2 w-full">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => navigate(`/organization/doctor-management/doctors/perfil/${doctor.id}`)}
                        >
                          Ver Perfil
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setConfirmationModal({
                              isOpen: true,
                              title: 'Remover afiliação',
                              description: `Tem certeza que deseja remover ${doctor.name} da sua organização? Esta ação não pode ser desfeita.`,
                              action: () => {
                                removeAffiliationMutation.mutate(doctor.id);
                                setConfirmationModal(prev => ({ ...prev, isOpen: false }));
                              }
                            });
                          }}
                          disabled={removeAffiliationMutation.isPending}
                        >
                          <UserX className="h-3.5 w-3.5 mr-1" />
                          Remover
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de confirmação */}
      <Dialog 
        open={confirmationModal.isOpen} 
        onOpenChange={(open) => setConfirmationModal(prev => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{confirmationModal.title}</DialogTitle>
            <DialogDescription>
              {confirmationModal.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={confirmationModal.action}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function DoctorAffiliationPageWrapper() {
  return (
    <OrganizationLayout>
      <DoctorAffiliationPage />
    </OrganizationLayout>
  );
}