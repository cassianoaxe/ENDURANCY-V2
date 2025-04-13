'use client';

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, Building, User, Mail, Phone, MapPin, Globe } from "lucide-react";

// Validação do formulário de fornecedor
const formSchema = z.object({
  // Dados básicos
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  razaoSocial: z.string().min(3, "Razão social deve ter pelo menos 3 caracteres"),
  cnpj: z.string().min(14, "CNPJ deve ter 14 números").max(18, "CNPJ inválido"),
  tipo: z.string().min(1, "Selecione um tipo de fornecedor"),
  
  // Contato
  contatoNome: z.string().min(3, "Nome do contato deve ter pelo menos 3 caracteres"),
  contatoEmail: z.string().email("Email inválido"),
  contatoTelefone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  
  // Endereço
  endereco: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  cidade: z.string().min(2, "Cidade deve ter pelo menos 2 caracteres"),
  estado: z.string().length(2, "Estado deve ter 2 caracteres"),
  cep: z.string().min(8, "CEP deve ter 8 dígitos").max(9, "CEP inválido"),
  
  // Observações
  observacoes: z.string().optional()
});

type NovoFornecedorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function NovoFornecedorDialog({ open, onOpenChange }: NovoFornecedorDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      razaoSocial: "",
      cnpj: "",
      tipo: "",
      contatoNome: "",
      contatoEmail: "",
      contatoTelefone: "",
      website: "",
      endereco: "",
      cidade: "",
      estado: "",
      cep: "",
      observacoes: ""
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Fornecedor cadastrado:", values);
    
    // Limpar formulário e fechar dialog
    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Novo Fornecedor
          </DialogTitle>
          <DialogDescription>
            Preencha os dados para cadastrar um novo fornecedor
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="dados_basicos" className="space-y-6">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="dados_basicos" className="gap-2">
                  <Building className="h-4 w-4" />
                  <span className="hidden sm:inline">Dados Básicos</span>
                </TabsTrigger>
                <TabsTrigger value="contato" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Contato</span>
                </TabsTrigger>
                <TabsTrigger value="endereco" className="gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">Endereço</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dados_basicos" className="space-y-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Fantasia*</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome comercial do fornecedor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="razaoSocial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razão Social*</FormLabel>
                      <FormControl>
                        <Input placeholder="Razão social completa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNPJ*</FormLabel>
                        <FormControl>
                          <Input placeholder="00.000.000/0000-00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Fornecedor*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="distribuidor">Distribuidor</SelectItem>
                            <SelectItem value="fabricante">Fabricante</SelectItem>
                            <SelectItem value="prestador_servico">Prestador de Serviço</SelectItem>
                            <SelectItem value="representante">Representante</SelectItem>
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
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observações adicionais sobre o fornecedor"
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Qualquer informação adicional relevante.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="contato" className="space-y-4">
                <FormField
                  control={form.control}
                  name="contatoNome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Nome do Contato*
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da pessoa de contato" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contatoEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email de Contato*
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="email@fornecedor.com.br" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contatoTelefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Telefone de Contato*
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" {...field} />
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
                      <FormLabel className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Website
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.fornecedor.com.br" {...field} />
                      </FormControl>
                      <FormDescription>Site da empresa (opcional)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="endereco" className="space-y-4">
                <FormField
                  control={form.control}
                  name="endereco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Endereço*
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Logradouro, número e complemento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-2 md:col-span-2">
                    <FormField
                      control={form.control}
                      name="cidade"
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
                  </div>

                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado*</FormLabel>
                          <FormControl>
                            <Input placeholder="UF" maxLength={2} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP*</FormLabel>
                          <FormControl>
                            <Input placeholder="00000-000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="gap-2">
                <Truck className="h-4 w-4" /> Cadastrar Fornecedor
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}