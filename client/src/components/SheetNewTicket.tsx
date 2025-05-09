import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Define o schema para validação do formulário
const newTicketSchema = z.object({
  title: z.string()
    .min(5, { message: "O título deve ter pelo menos 5 caracteres" })
    .max(100, { message: "O título deve ter no máximo 100 caracteres" }),
  description: z.string()
    .min(10, { message: "A descrição deve ter pelo menos 10 caracteres" })
    .max(5000, { message: "A descrição deve ter no máximo 5000 caracteres" }),
  category: z.enum([
    'bug', 'melhoria', 'duvida', 'financeiro', 'acesso', 
    'seguranca', 'performance', 'desenvolvimento', 'outros'
  ], { 
    required_error: "Selecione uma categoria" 
  }),
  priority: z.enum(['baixa', 'media', 'alta', 'critica'], { 
    required_error: "Selecione uma prioridade" 
  }),
});

// Define o tipo baseado no schema
type NewTicketFormValues = z.infer<typeof newTicketSchema>;

// Define as props do componente
interface SheetNewTicketProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTicketCreated: () => void;
}

// Mapeia as categorias para exibição
const categoryLabels: Record<string, string> = {
  'bug': 'Bug',
  'melhoria': 'Melhoria',
  'duvida': 'Dúvida',
  'financeiro': 'Financeiro',
  'acesso': 'Acesso',
  'seguranca': 'Segurança',
  'performance': 'Performance',
  'desenvolvimento': 'Desenvolvimento',
  'outros': 'Outros'
};

// Mapeia as prioridades para exibição
const priorityLabels: Record<string, string> = {
  'baixa': 'Baixa',
  'media': 'Média',
  'alta': 'Alta',
  'critica': 'Crítica'
};

export function SheetNewTicket({ open, onOpenChange, onTicketCreated }: SheetNewTicketProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Configura o formulário com react-hook-form
  const form = useForm<NewTicketFormValues>({
    resolver: zodResolver(newTicketSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'duvida',
      priority: 'media',
    },
  });
  
  // Configuração da mutação para criar um novo ticket
  const createTicketMutation = useMutation({
    mutationFn: async (data: NewTicketFormValues) => {
      const payload = {
        ...data,
        organizationId: user?.organizationId,
      };
      
      const response = await apiRequest('/api/tickets', {
        method: 'POST',
        data: payload
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar ticket');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalida a consulta para forçar uma nova chamada
      queryClient.invalidateQueries({ queryKey: ['organization-tickets'] });
      
      // Notifica o componente pai
      onTicketCreated();
      
      // Reseta o formulário
      form.reset();
    },
  });
  
  // Função para submeter o formulário
  function onSubmit(values: NewTicketFormValues) {
    createTicketMutation.mutate(values);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Novo Ticket de Suporte</SheetTitle>
          <SheetDescription>
            Crie um novo ticket para reportar problemas ou solicitar suporte.
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Resumo do seu problema ou solicitação" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Um título claro e conciso.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          {Object.entries(categoryLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        A categoria ajuda a direcionar seu ticket.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma prioridade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(priorityLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Use crítica apenas para problemas urgentes.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva em detalhes o problema ou solicitação..." 
                        className="min-h-[150px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Forneça detalhes sobre o problema, passos para reproduzi-lo, e qualquer outra informação relevante.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createTicketMutation.isPending}
                >
                  {createTicketMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : 'Criar Ticket'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}