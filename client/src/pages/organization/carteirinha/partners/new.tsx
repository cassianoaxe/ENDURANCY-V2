import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowLeft, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Schema para validação do formulário
const partnerFormSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cnpj: z.string().min(14, "CNPJ inválido").max(18, "CNPJ inválido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  contactPerson: z.string().optional(),
  category: z.enum(["health", "pharmacy", "food", "education", "services", "retail", "other"]),
  address: z.string().min(5, "Endereço inválido"),
  city: z.string().min(2, "Cidade inválida"),
  state: z.string().min(2, "Estado inválido"),
  zipCode: z.string().min(8, "CEP inválido").max(9, "CEP inválido"),
  website: z.string().url("Website inválido").optional().or(z.literal("")),
  description: z.string().min(10, "Descreva o parceiro em pelo menos 10 caracteres")
});

type PartnerFormValues = z.infer<typeof partnerFormSchema>;

export default function NewPartnerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  
  // Inicializar o formulário com valores padrão
  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      name: "",
      cnpj: "",
      email: "",
      phone: "",
      contactPerson: "",
      category: "other",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      website: "",
      description: ""
    }
  });
  
  // Mutation para criar um novo parceiro
  const createPartnerMutation = useMutation({
    mutationFn: async (data: PartnerFormValues) => {
      const response = await fetch("/api/carteirinha/partners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro ao criar parceiro" }));
        throw new Error(errorData.message || "Erro ao criar parceiro");
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidar cache de parceiros para recarregar a lista
      queryClient.invalidateQueries({
        queryKey: ['/api/carteirinha/partners']
      });
      
      // Mostrar toast de sucesso
      toast({
        title: "Parceiro criado com sucesso",
        description: "O parceiro foi adicionado ao clube de benefícios.",
        variant: "default"
      });
      
      // Redirecionar para a lista de parceiros
      navigate("/organization/carteirinha/partners");
    },
    onError: (error) => {
      // Mostrar toast de erro
      toast({
        title: "Erro ao criar parceiro",
        description: error.message || "Ocorreu um erro ao criar o parceiro. Tente novamente.",
        variant: "destructive"
      });
    }
  });
  
  // Handler de submit do formulário
  const onSubmit = (data: PartnerFormValues) => {
    // Adicionar id da organização antes de enviar
    const partnerData = {
      ...data,
      organizationId: user?.organizationId,
      status: "pending" // Novo parceiro começa como pendente
    };
    
    createPartnerMutation.mutate(partnerData);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/organization/carteirinha/partners")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold">Novo Parceiro</h2>
            <p className="text-muted-foreground">
              Adicione um novo parceiro ao clube de benefícios
            </p>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Informações do Parceiro</CardTitle>
          <CardDescription>
            Preencha os dados do estabelecimento parceiro. Todos os campos marcados com * são obrigatórios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Estabelecimento *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Farmácia São João" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ *</FormLabel>
                      <FormControl>
                        <Input placeholder="XX.XXX.XXX/XXXX-XX" {...field} />
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
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input placeholder="contato@empresa.com.br" {...field} />
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
                      <FormLabel>Telefone *</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pessoa de Contato</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do responsável" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria *</FormLabel>
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
                          <SelectItem value="retail">Comércio</SelectItem>
                          <SelectItem value="other">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Endereço</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço *</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, número, complemento" {...field} />
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
                        <FormLabel>CEP *</FormLabel>
                        <FormControl>
                          <Input placeholder="00000-000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade *</FormLabel>
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
                        <FormLabel>Estado *</FormLabel>
                        <FormControl>
                          <Input placeholder="UF" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informações Adicionais</h3>
                
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://www.empresa.com.br" {...field} />
                        </FormControl>
                        <FormDescription>
                          Deixe em branco se o parceiro não possuir website
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva o estabelecimento parceiro e os tipos de serviços/produtos oferecidos" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <CardFooter className="flex justify-between px-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/organization/carteirinha/partners")}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createPartnerMutation.isPending}
                >
                  {createPartnerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Parceiro
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}