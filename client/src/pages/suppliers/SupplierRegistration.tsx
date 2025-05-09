import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Building2, 
  Upload,
  CheckCircle,
  Save,
  CreditCard,
  AtSign,
  Phone,
  MapPin
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import * as z from 'zod';
import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Schema para validação do formulário
const supplierFormSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter no mínimo 3 caracteres" }),
  tradingName: z.string().optional(),
  cnpj: z.string().min(14, { message: "CNPJ inválido" }).max(18),
  stateRegistration: z.string().optional(),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().min(10, { message: "Telefone inválido" }).max(15).optional(),
  address: z.string().min(5, { message: "Endereço deve ter no mínimo 5 caracteres" }).optional(),
  city: z.string().min(2, { message: "Cidade inválida" }).optional(),
  state: z.string().min(2, { message: "Estado inválido" }).max(2).optional(),
  zipCode: z.string().min(8, { message: "CEP inválido" }).max(9).optional(),
  contactName: z.string().min(3, { message: "Nome do contato deve ter no mínimo 3 caracteres" }).optional(),
  contactEmail: z.string().email({ message: "Email do contato inválido" }).optional(),
  contactPhone: z.string().min(10, { message: "Telefone do contato inválido" }).max(15).optional(),
  website: z.string().url({ message: "URL inválida" }).optional().or(z.literal('')),
  description: z.string().max(500, { message: "A descrição não pode exceder 500 caracteres" }).optional(),
});

type SupplierFormValues = z.infer<typeof supplierFormSchema>;

// Formatação de CNPJ
function formatCNPJ(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
}

// Formatação de telefone
function formatPhone(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
}

// Formatação de CEP
function formatCEP(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1');
}

export default function SupplierRegistration() {
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Formulário
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: '',
      tradingName: '',
      cnpj: '',
      stateRegistration: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      website: '',
      description: '',
    },
  });
  
  // Mutação para criar fornecedor
  const createSupplierMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest('POST', '/api/suppliers', null, {
        method: 'POST',
        body: data,
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Fornecedor criado com sucesso",
        description: "Você será redirecionado para o painel do fornecedor.",
        variant: "default",
      });
      
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers/my-supplier'] });
      
      // Redirecionar para o dashboard
      setTimeout(() => {
        setLocation('/suppliers/dashboard');
      }, 1500);
    },
    onError: (error: any) => {
      console.error("Erro ao criar fornecedor:", error);
      toast({
        title: "Erro ao criar fornecedor",
        description: error.message || "Ocorreu um erro ao criar o fornecedor. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Handler para envio do formulário
  const onSubmit = (values: SupplierFormValues) => {
    const formData = new FormData();
    
    // Adicionar campos de texto
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value);
      }
    });
    
    // Adicionar logo se existir
    if (selectedLogo) {
      formData.append('logo', selectedLogo);
    }
    
    // Enviar dados
    createSupplierMutation.mutate(formData);
  };
  
  // Handler para seleção de logo
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedLogo(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handler para remover logo
  const handleRemoveLogo = () => {
    setSelectedLogo(null);
    setLogoPreview(null);
  };
  
  return (
    <OrganizationLayout activeModule="fornecedores">
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Cadastro de Fornecedor</h1>
            <p className="text-muted-foreground">Preencha o formulário para se cadastrar como fornecedor</p>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Informações do Fornecedor</CardTitle>
                  <CardDescription>
                    Preencha as informações básicas do fornecedor
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Razão Social *</FormLabel>
                          <FormControl>
                            <Input placeholder="Razão Social" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="tradingName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Fantasia</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome Fantasia" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cnpj"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNPJ *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="00.000.000/0000-00" 
                              {...field} 
                              value={formatCNPJ(field.value)}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="stateRegistration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inscrição Estadual</FormLabel>
                          <FormControl>
                            <Input placeholder="Inscrição Estadual" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <AtSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-8" placeholder="email@empresa.com.br" {...field} />
                            </div>
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
                            <div className="relative">
                              <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input 
                                className="pl-8" 
                                placeholder="(00) 00000-0000" 
                                {...field} 
                                value={formatPhone(field.value || '')}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://www.seusite.com.br" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição da empresa</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva brevemente sua empresa e os produtos/serviços oferecidos" 
                            className="resize-none h-24"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Máximo de 500 caracteres
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Logo da Empresa</CardTitle>
                    <CardDescription>
                      Envie a logo da sua empresa
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                      {logoPreview ? (
                        <div className="space-y-4 w-full">
                          <div className="relative w-full h-40 bg-muted rounded-md overflow-hidden">
                            <img 
                              src={logoPreview} 
                              alt="Preview" 
                              className="w-full h-full object-contain" 
                            />
                          </div>
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full"
                            onClick={handleRemoveLogo}
                          >
                            Remover Logo
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-center text-muted-foreground mb-2">
                            Clique para enviar ou arraste a logo aqui
                          </p>
                          <p className="text-xs text-center text-muted-foreground">
                            SVG, PNG ou JPG (máx. 2MB)
                          </p>
                          <input 
                            type="file" 
                            accept=".svg,.png,.jpg,.jpeg" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                            onChange={handleLogoChange}
                          />
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Informações de Contato</CardTitle>
                    <CardDescription>
                      Informações da pessoa responsável
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Contato</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do responsável" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email do Contato</FormLabel>
                          <FormControl>
                            <Input placeholder="email@contato.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone do Contato</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="(00) 00000-0000" 
                              {...field} 
                              value={formatPhone(field.value || '')}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Endereço</CardTitle>
                <CardDescription>
                  Informe o endereço do fornecedor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-8" placeholder="Rua, número, complemento" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Cidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input placeholder="UF" maxLength={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="00000-000" 
                            {...field} 
                            value={formatCEP(field.value || '')}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between items-center">
              <Button type="button" variant="outline" onClick={() => setLocation('/suppliers')}>
                Cancelar
              </Button>
              
              <Button 
                type="submit" 
                disabled={createSupplierMutation.isPending}
                className="gap-2"
              >
                {createSupplierMutation.isPending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Cadastrar Fornecedor
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </OrganizationLayout>
  );
}