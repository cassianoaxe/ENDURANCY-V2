import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Building, 
  FileText, 
  Image, 
  Mail, 
  MapPin, 
  Phone, 
  Save, 
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

// Máscara para CNPJ: XX.XXX.XXX/XXXX-XX
function formatCnpj(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .substring(0, 18);
}

// Máscara para telefone: (XX) XXXXX-XXXX
function formatPhone(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d)(\d{4})$/, '$1-$2')
    .substring(0, 15);
}

// Máscara para CEP: XXXXX-XXX
function formatZipCode(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{5})(\d)/, '$1-$2')
    .substring(0, 9);
}

// Definir o esquema de validação
const formSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres' }),
  cnpj: z.string().min(14, { message: 'CNPJ inválido' }),
  category: z.string().min(1, { message: 'Selecione uma categoria' }),
  email: z.string().email({ message: 'E-mail inválido' }),
  phone: z.string().min(10, { message: 'Telefone inválido' }),
  contactPerson: z.string().min(1, { message: 'Informe o nome do contato' }),
  
  address: z.string().min(1, { message: 'Endereço obrigatório' }),
  city: z.string().min(1, { message: 'Cidade obrigatória' }),
  state: z.string().min(2, { message: 'Estado obrigatório' }),
  zipCode: z.string().min(8, { message: 'CEP inválido' }),
  
  website: z.string().url({ message: 'URL inválida' }).optional().or(z.literal('')),
  description: z.string().min(10, { message: 'Descrição muito curta' }),
  
  contractStartDate: z.string().optional(),
  contractEndDate: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PartnerFormProps {
  organizationId: number;
  partner?: any; // Para modo de edição
  onSuccess?: () => void;
}

export function PartnerForm({ organizationId, partner, onSuccess }: PartnerFormProps) {
  const { toast } = useToast();
  const isEditMode = !!partner;
  
  // Estados para arquivos carregados
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(partner?.logoUrl || null);
  
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(partner?.bannerUrl || null);
  
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [contractFileName, setContractFileName] = useState<string | null>(
    partner?.contractUrl ? 'Contrato atual' : null
  );

  // Formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: partner ? {
      name: partner.name,
      cnpj: partner.cnpj,
      category: partner.category,
      email: partner.email,
      phone: partner.phone,
      contactPerson: partner.contactPerson || '',
      address: partner.address,
      city: partner.city,
      state: partner.state,
      zipCode: partner.zipCode,
      website: partner.website || '',
      description: partner.description,
      contractStartDate: partner.contractStartDate ? new Date(partner.contractStartDate).toISOString().slice(0, 10) : '',
      contractEndDate: partner.contractEndDate ? new Date(partner.contractEndDate).toISOString().slice(0, 10) : '',
      notes: partner.notes || '',
    } : {
      name: '',
      cnpj: '',
      category: '',
      email: '',
      phone: '',
      contactPerson: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      website: '',
      description: '',
      contractStartDate: '',
      contractEndDate: '',
      notes: '',
    },
  });

  // Mutação para criar/atualizar parceiro
  const partnerMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const url = isEditMode 
        ? `/api/social/partners/${partner.id}` 
        : '/api/social/partners';
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: data,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ao ${isEditMode ? 'atualizar' : 'criar'} parceiro`);
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: `Parceiro ${isEditMode ? 'atualizado' : 'cadastrado'} com sucesso!`,
        description: isEditMode 
          ? 'As informações do parceiro foram atualizadas.' 
          : 'O parceiro foi adicionado ao clube de descontos.',
      });
      
      // Invalidar queries para forçar a atualização dos dados
      queryClient.invalidateQueries({ queryKey: ['/api/social/partners'] });
      
      // Redirecionar ou executar callback de sucesso
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = `/social/partners/${data.partner.id}`;
      }
    },
    onError: (error: Error) => {
      toast({
        title: `Erro ao ${isEditMode ? 'atualizar' : 'cadastrar'} parceiro`,
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Manipuladores para uploads de arquivos
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Verificar tamanho e tipo
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'O logo deve ter no máximo 5MB',
          variant: 'destructive',
        });
        return;
      }
      
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
        toast({
          title: 'Formato inválido',
          description: 'O logo deve ser nos formatos JPEG, JPG, PNG ou GIF',
          variant: 'destructive',
        });
        return;
      }
      
      setLogoFile(file);
      
      // Exibir preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Verificar tamanho e tipo
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'O banner deve ter no máximo 5MB',
          variant: 'destructive',
        });
        return;
      }
      
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
        toast({
          title: 'Formato inválido',
          description: 'O banner deve ser nos formatos JPEG, JPG, PNG ou GIF',
          variant: 'destructive',
        });
        return;
      }
      
      setBannerFile(file);
      
      // Exibir preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContractChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Verificar tamanho e tipo
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'O contrato deve ter no máximo 10MB',
          variant: 'destructive',
        });
        return;
      }
      
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Formato inválido',
          description: 'O contrato deve estar no formato PDF',
          variant: 'destructive',
        });
        return;
      }
      
      setContractFile(file);
      setContractFileName(file.name);
    }
  };

  // Enviar formulário
  const onSubmit = (values: FormValues) => {
    const formData = new FormData();
    
    // Adicionar campos do formulário
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value.toString());
      }
    });
    
    // Adicionar arquivos, se selecionados
    if (logoFile) {
      formData.append('logoFile', logoFile);
    }
    
    if (bannerFile) {
      formData.append('bannerFile', bannerFile);
    }
    
    if (contractFile) {
      formData.append('contractFile', contractFile);
    }
    
    // Enviar para a API
    partnerMutation.mutate(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? 'Editar Parceiro' : 'Novo Parceiro'}</CardTitle>
            <CardDescription>
              {isEditMode 
                ? 'Atualize as informações do parceiro no clube de descontos' 
                : 'Adicione um novo parceiro ao clube de descontos para seus associados'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informações básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Informações Básicas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Nome comercial do parceiro
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* CNPJ */}
                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={formatCnpj(field.value)}
                          onChange={(e) => field.onChange(formatCnpj(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        CNPJ da empresa parceira
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Categoria */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="health">Saúde</SelectItem>
                          <SelectItem value="pharmacy">Farmácia</SelectItem>
                          <SelectItem value="food">Alimentação</SelectItem>
                          <SelectItem value="education">Educação</SelectItem>
                          <SelectItem value="services">Serviços</SelectItem>
                          <SelectItem value="retail">Varejo</SelectItem>
                          <SelectItem value="other">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Setor de atuação do parceiro
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Website */}
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        URL do site da empresa (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* E-mail */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormDescription>
                        E-mail comercial para contato
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Telefone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={formatPhone(field.value)}
                          onChange={(e) => field.onChange(formatPhone(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Número de telefone para contato
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Pessoa de contato */}
                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pessoa de Contato</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Nome da pessoa responsável pelo contato
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Endereço
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Endereço */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Endereço completo (rua e número)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* CEP */}
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={formatZipCode(field.value)}
                          onChange={(e) => field.onChange(formatZipCode(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cidade */}
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Estado */}
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
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
                          <SelectItem value="AC">Acre</SelectItem>
                          <SelectItem value="AL">Alagoas</SelectItem>
                          <SelectItem value="AP">Amapá</SelectItem>
                          <SelectItem value="AM">Amazonas</SelectItem>
                          <SelectItem value="BA">Bahia</SelectItem>
                          <SelectItem value="CE">Ceará</SelectItem>
                          <SelectItem value="DF">Distrito Federal</SelectItem>
                          <SelectItem value="ES">Espírito Santo</SelectItem>
                          <SelectItem value="GO">Goiás</SelectItem>
                          <SelectItem value="MA">Maranhão</SelectItem>
                          <SelectItem value="MT">Mato Grosso</SelectItem>
                          <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                          <SelectItem value="MG">Minas Gerais</SelectItem>
                          <SelectItem value="PA">Pará</SelectItem>
                          <SelectItem value="PB">Paraíba</SelectItem>
                          <SelectItem value="PR">Paraná</SelectItem>
                          <SelectItem value="PE">Pernambuco</SelectItem>
                          <SelectItem value="PI">Piauí</SelectItem>
                          <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                          <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                          <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                          <SelectItem value="RO">Rondônia</SelectItem>
                          <SelectItem value="RR">Roraima</SelectItem>
                          <SelectItem value="SC">Santa Catarina</SelectItem>
                          <SelectItem value="SP">São Paulo</SelectItem>
                          <SelectItem value="SE">Sergipe</SelectItem>
                          <SelectItem value="TO">Tocantins</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Descrição */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Descrição</h3>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição do Parceiro</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} />
                    </FormControl>
                    <FormDescription>
                      Descreva os produtos/serviços oferecidos e outras informações relevantes
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Arquivos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Image className="h-5 w-5 mr-2" />
                Arquivos
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo */}
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Logo da Empresa</label>
                    <div className="flex items-center space-x-2">
                      <label 
                        htmlFor="logo" 
                        className="cursor-pointer bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md flex items-center"
                      >
                        <Image className="w-4 h-4 mr-2" />
                        {logoFile ? 'Alterar Logo' : 'Selecionar Logo'}
                      </label>
                      <span className="text-sm text-muted-foreground">
                        {logoFile ? logoFile.name : 'Nenhum arquivo selecionado'}
                      </span>
                    </div>
                    <Input
                      id="logo"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground">
                      Formatos: JPEG, JPG, PNG, GIF (máx. 5MB)
                    </p>
                  </div>
                  
                  {logoPreview && (
                    <div className="mt-2">
                      <div className="border rounded-md p-2 w-32 h-32 flex items-center justify-center">
                        <img 
                          src={logoPreview} 
                          alt="Preview do logo" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Banner */}
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Banner/Imagem</label>
                    <div className="flex items-center space-x-2">
                      <label 
                        htmlFor="banner" 
                        className="cursor-pointer bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md flex items-center"
                      >
                        <Image className="w-4 h-4 mr-2" />
                        {bannerFile ? 'Alterar Banner' : 'Selecionar Banner'}
                      </label>
                      <span className="text-sm text-muted-foreground">
                        {bannerFile ? bannerFile.name : 'Nenhum arquivo selecionado'}
                      </span>
                    </div>
                    <Input
                      id="banner"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      onChange={handleBannerChange}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground">
                      Formatos: JPEG, JPG, PNG, GIF (máx. 5MB)
                    </p>
                  </div>
                  
                  {bannerPreview && (
                    <div className="mt-2">
                      <div className="border rounded-md p-2 h-32 flex items-center justify-center">
                        <img 
                          src={bannerPreview} 
                          alt="Preview do banner" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Contrato */}
              <div className="space-y-1 mt-4">
                <label className="text-sm font-medium">Contrato (PDF)</label>
                <div className="flex items-center space-x-2">
                  <label 
                    htmlFor="contract" 
                    className="cursor-pointer bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md flex items-center"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {contractFile ? 'Alterar Contrato' : 'Selecionar Contrato'}
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {contractFileName || 'Nenhum arquivo selecionado'}
                  </span>
                </div>
                <Input
                  id="contract"
                  type="file"
                  accept="application/pdf"
                  onChange={handleContractChange}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">
                  Formato: PDF (máx. 10MB)
                </p>
              </div>
            </div>

            <Separator />

            {/* Contrato */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Informações de Contrato
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Data de início */}
                <FormField
                  control={form.control}
                  name="contractStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Início</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Data de início da parceria (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Data de término */}
                <FormField
                  control={form.control}
                  name="contractEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Término</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Data de término da parceria (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Observações */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                    <FormDescription>
                      Observações adicionais sobre o parceiro ou contrato (opcional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button 
              type="submit" 
              disabled={partnerMutation.isPending}
            >
              {partnerMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 rounded-full border-2 border-primary border-t-transparent" />
                  {isEditMode ? 'Atualizando...' : 'Cadastrando...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditMode ? 'Atualizar Parceiro' : 'Cadastrar Parceiro'}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}