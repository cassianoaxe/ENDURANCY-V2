import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { Loader2, UserPlus, ArrowLeft, Save } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Esquema de validação para o formulário
const formSchema = z.object({
  name: z.string().min(3, { message: 'Nome é obrigatório e deve ter pelo menos 3 caracteres' }),
  cpf: z.string().min(11, { message: 'CPF inválido' }),
  rg: z.string().optional().or(z.literal('')),
  email: z.string().email({ message: 'E-mail inválido' }).min(1, { message: 'E-mail é obrigatório' }),
  phone: z.string().min(10, { message: 'Telefone inválido' }).min(1, { message: 'Telefone é obrigatório' }),
  address: z.string().min(1, { message: 'Endereço é obrigatório' }),
  addressNumber: z.string().optional().or(z.literal('')),
  addressComplement: z.string().optional().or(z.literal('')),
  neighborhood: z.string().min(1, { message: 'Bairro é obrigatório' }),
  city: z.string().min(2, { message: 'Cidade é obrigatória' }),
  state: z.string().min(2, { message: 'Estado é obrigatório' }),
  zipCode: z.string().min(1, { message: 'CEP é obrigatório' }),
  birthDate: z.string().min(1, { message: 'Data de nascimento é obrigatória' }),
  gender: z.string().optional().or(z.literal('')),
  occupation: z.string().optional().or(z.literal('')),
  monthlyIncome: z.string().optional().or(z.literal('')),
  familyMembers: z.string().optional().or(z.literal('')),
  needsCategory: z.array(z.string()).default([]),
  exemptionType: z.enum(['exemption_25', 'exemption_50', 'exemption_75', 'exemption_100']).default('exemption_25'),
  exemptionValue: z.string().default('25'),
  educationLevel: z.string().optional().or(z.literal('')),
  housingType: z.string().optional().or(z.literal('')),
  hasHealthInsurance: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
});

type FormData = z.infer<typeof formSchema>;

// Categorias de necessidades disponíveis
const needsCategoryOptions = [
  { id: 'medical', label: 'Médica' },
  { id: 'medication', label: 'Medicamentos' },
  { id: 'psychological', label: 'Psicológica' },
  { id: 'financial', label: 'Financeira' },
  { id: 'legal', label: 'Jurídica' },
  { id: 'educational', label: 'Educacional' },
  { id: 'housing', label: 'Moradia' },
  { id: 'food', label: 'Alimentação' },
  { id: 'clothing', label: 'Vestuário' },
  { id: 'transportation', label: 'Transporte' },
];

export default function NewBeneficiary() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [_, setLocation] = useLocation();
  
  // Initialize form with default values
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      cpf: '',
      rg: '',
      email: '',
      phone: '',
      address: '',
      addressNumber: '',
      addressComplement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      birthDate: '',
      gender: '',
      occupation: '',
      monthlyIncome: '',
      familyMembers: '',
      needsCategory: [],
      exemptionType: 'exemption_25',
      exemptionValue: '25',
      educationLevel: '',
      housingType: '',
      hasHealthInsurance: '',
      notes: '',
      status: 'active',
    }
  });

  // Create mutation for form submission
  const createBeneficiary = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest('/api/social/beneficiaries', {
        method: 'POST',
        data
      });
    },
    onSuccess: () => {
      toast({
        title: 'Beneficiário cadastrado',
        description: 'Cadastro realizado com sucesso!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/social/beneficiaries'] });
      setTimeout(() => {
        setLocation('/organization/social/beneficiarios');
      }, 1500);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Ocorreu um erro ao cadastrar o beneficiário';
      toast({
        title: 'Erro no cadastro',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createBeneficiary.mutate(data);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation('/organization/social/beneficiarios')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Novo Beneficiário</h1>
            <p className="text-muted-foreground">
              Cadastre uma nova pessoa beneficiária na associação
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Dados básicos do beneficiário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo*</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do beneficiário" {...field} />
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
                      <FormLabel>CPF*</FormLabel>
                      <FormControl>
                        <Input placeholder="000.000.000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RG</FormLabel>
                      <FormControl>
                        <Input placeholder="Número do RG" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input placeholder="email@exemplo.com" {...field} />
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento*</FormLabel>
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
                      <FormLabel>Gênero</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="feminino">Feminino</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                          <SelectItem value="prefiro_nao_informar">Prefiro não informar</SelectItem>
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
                      <FormLabel>Status*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="inactive">Inativo</SelectItem>
                          <SelectItem value="pending">Pendente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
              <CardDescription>
                Localização do beneficiário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>Endereço*</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua/Logradouro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="addressNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input placeholder="Número" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="addressComplement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complemento</FormLabel>
                    <FormControl>
                      <Input placeholder="Apto, bloco, casa, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Bairro" {...field} />
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
                        <Input placeholder="00000-000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade*</FormLabel>
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
                      <FormLabel>Estado*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Situação Socioeconômica</CardTitle>
              <CardDescription>
                Dados complementares para avaliação socioeconômica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ocupação/Profissão</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Autônomo, Aposentado, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthlyIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Renda Mensal (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0,00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="familyMembers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Membros na Família</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="educationLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Escolaridade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="nenhuma">Nenhuma</SelectItem>
                          <SelectItem value="fundamental_incompleto">Fundamental Incompleto</SelectItem>
                          <SelectItem value="fundamental_completo">Fundamental Completo</SelectItem>
                          <SelectItem value="medio_incompleto">Médio Incompleto</SelectItem>
                          <SelectItem value="medio_completo">Médio Completo</SelectItem>
                          <SelectItem value="superior_incompleto">Superior Incompleto</SelectItem>
                          <SelectItem value="superior_completo">Superior Completo</SelectItem>
                          <SelectItem value="pos_graduacao">Pós-Graduação</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="housingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Moradia</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="propria">Própria</SelectItem>
                          <SelectItem value="alugada">Alugada</SelectItem>
                          <SelectItem value="cedida">Cedida</SelectItem>
                          <SelectItem value="financiada">Financiada</SelectItem>
                          <SelectItem value="sem_teto">Sem moradia fixa</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
                
              <FormField
                control={form.control}
                name="hasHealthInsurance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Possui Plano de Saúde?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sim">Sim</SelectItem>
                        <SelectItem value="nao">Não</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="exemptionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Isenção</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="exemption_25">Isenção de 25%</SelectItem>
                        <SelectItem value="exemption_50">Isenção de 50%</SelectItem>
                        <SelectItem value="exemption_75">Isenção de 75%</SelectItem>
                        <SelectItem value="exemption_100">Isenção de 100%</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Necessidades e Observações</CardTitle>
              <CardDescription>
                Categorias de necessidades e informações adicionais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="needsCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categorias de Necessidades</FormLabel>
                    <FormDescription>
                      Selecione as categorias de necessidades do beneficiário
                    </FormDescription>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                      {needsCategoryOptions.map((option) => (
                        <FormItem
                          key={option.id}
                          className="flex flex-row items-start space-x-3 space-y-0 p-2 border rounded-md"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option.id)}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...field.value, option.id]
                                  : field.value?.filter((value) => value !== option.id);
                                field.onChange(updatedValue);
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {option.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Informações adicionais sobre o beneficiário..."
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/organization/social/beneficiarios')}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={createBeneficiary.isPending}
                className="gap-2"
              >
                {createBeneficiary.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar Beneficiário
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}