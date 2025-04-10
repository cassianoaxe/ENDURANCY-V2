import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

// Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, User, BookOpen, LucideIcon, Stethoscope } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileText, Pill } from 'lucide-react';

// Definir o esquema de validação
const doctorRegistrationSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  doctorType: z.enum(['general', 'dentist', 'veterinarian'], {
    required_error: 'Selecione o tipo de médico',
  }),
  specialization: z.string().min(1, 'Especialização é obrigatória'),
  crm: z.string().min(1, 'CRM/CRO/CRMV é obrigatório'),
  crmState: z.string().min(1, 'Estado do registro é obrigatório'),
  bio: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type DoctorRegistrationFormValues = z.infer<typeof doctorRegistrationSchema>;

interface DoctorTypeInfo {
  value: 'general' | 'dentist' | 'veterinarian';
  label: string;
  description: string;
  icon: LucideIcon;
  registryName: string;
}

const doctorTypes: DoctorTypeInfo[] = [
  {
    value: 'general',
    label: 'Médico',
    description: 'Prescritor de cannabis medicinal (CRM)',
    icon: Stethoscope,
    registryName: 'CRM'
  },
  {
    value: 'dentist',
    label: 'Dentista',
    description: 'Prescritor de cannabis medicinal (CRO)',
    icon: FileText,
    registryName: 'CRO'
  },
  {
    value: 'veterinarian',
    label: 'Veterinário',
    description: 'Prescritor de cannabis medicinal (CRMV)',
    icon: Pill,
    registryName: 'CRMV'
  }
];

const brazilianStates = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

// Componente principal
export default function DoctorRegistration() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctorType, setSelectedDoctorType] = useState<'general' | 'dentist' | 'veterinarian'>('general');
  const [, navigate] = useLocation();
  
  // Pegar a organizationId da URL (path ou query param)
  const urlParams = new URLSearchParams(window.location.search);
  const organizationId = urlParams.get('organizationId') || window.location.pathname.split('/').pop();
  const [organizationName, setOrganizationName] = useState<string>('');
  
  // Buscar informações da organização
  useEffect(() => {
    async function fetchOrganizationName() {
      if (!organizationId || isNaN(Number(organizationId))) {
        setError("ID da organização inválido. Verifique o link de convite.");
        return;
      }
      
      try {
        const response = await fetch(`/api/organizations/${organizationId}/name`);
        if (!response.ok) {
          throw new Error("Não foi possível encontrar a organização");
        }
        
        const data = await response.json();
        setOrganizationName(data.name);
      } catch (err) {
        console.error("Erro ao buscar nome da organização:", err);
        setError("Organização não encontrada. Verifique o link de convite.");
      }
    }
    
    fetchOrganizationName();
  }, [organizationId]);

  const form = useForm<DoctorRegistrationFormValues>({
    resolver: zodResolver(doctorRegistrationSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      doctorType: 'general',
      specialization: '',
      crm: '',
      crmState: '',
      bio: '',
      termsAccepted: false,
    },
  });

  const onSubmit = async (data: DoctorRegistrationFormValues) => {
    if (!organizationId || isNaN(Number(organizationId))) {
      setError("ID da organização inválido. Verifique o link de convite.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiRequest("/api/register-doctor", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          organizationId: Number(organizationId)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao registrar médico");
      }

      toast({
        title: "Registro realizado com sucesso!",
        description: "Seu cadastro foi enviado e está aguardando aprovação.",
      });

      // Redireciona para o login após um registro bem-sucedido
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Erro ao processar seu cadastro. Tente novamente.");
      toast({
        variant: "destructive",
        title: "Erro no registro",
        description: err.message || "Ocorreu um erro ao processar seu cadastro. Por favor, tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Atualiza o tipo de registro conforme seleção do tipo de médico
  const selectedType = doctorTypes.find(type => type.value === selectedDoctorType);
  const registryName = selectedType ? selectedType.registryName : 'CRM';

  return (
    <div>
      <div className="container max-w-3xl py-8 px-4 md:px-6">
        <Card className="border-border/40 shadow-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Cadastro de Prescritor</CardTitle>
            </div>
            <CardDescription>
              {organizationName ? 
                `Preencha o formulário abaixo para se cadastrar como prescritor de cannabis medicinal na organização "${organizationName}".` : 
                'Preencha o formulário abaixo para se cadastrar como prescritor de cannabis medicinal.'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informações Pessoais</h3>
                  
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
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="doctor@exemplo.com" {...field} />
                        </FormControl>
                        <FormDescription>Este será seu nome de usuário para login.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Senha</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informações Profissionais</h3>
                  
                  <FormField
                    control={form.control}
                    name="doctorType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Prescritor</FormLabel>
                        <FormControl>
                          <div className="grid md:grid-cols-3 gap-3">
                            {doctorTypes.map((type) => {
                              const Icon = type.icon;
                              return (
                                <div 
                                  key={type.value}
                                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                                    field.value === type.value 
                                      ? 'border-primary bg-primary/5 text-primary' 
                                      : 'hover:bg-muted'
                                  }`}
                                  onClick={() => {
                                    field.onChange(type.value);
                                    setSelectedDoctorType(type.value);
                                  }}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <Icon className="h-4 w-4" />
                                    <h4 className="font-medium">{type.label}</h4>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{type.description}</p>
                                </div>
                              );
                            })}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Especialização</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Neurologia, Psiquiatria, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="crm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{registryName}</FormLabel>
                          <FormControl>
                            <Input placeholder={`Número do ${registryName}`} {...field} />
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
                          <FormLabel>Estado do {registryName}</FormLabel>
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
                              {brazilianStates.map((state) => (
                                <SelectItem key={state.value} value={state.value}>
                                  {state.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biografia (opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva brevemente sua formação e experiência profissional"
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          As informações públicas serão exibidas no seu perfil para pacientes.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Separator />
                
                <FormField
                  control={form.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Concordo com os termos de uso e política de privacidade
                        </FormLabel>
                        <FormDescription>
                          Ao se cadastrar, você concorda com os nossos{" "}
                          <a 
                            href="/terms" 
                            className="text-primary underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Termos de Uso
                          </a>{" "}
                          e{" "}
                          <a 
                            href="/privacy" 
                            className="text-primary underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Política de Privacidade
                          </a>.
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Processando..." : "Cadastrar"}
                </Button>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex justify-center border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <a href="/login" className="text-primary underline">
                Faça login
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}