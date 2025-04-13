'use client';

import React, { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Calendar } from "@/components/ui/calendar";
import { X, User } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z.object({
  nome: z.string().min(3, "Nome da escala deve ter pelo menos 3 caracteres"),
  departamento: z.string().min(1, "Selecione um departamento"),
  dataInicio: z.date({ required_error: "Data de início é obrigatória" }),
  dataFim: z.date({ required_error: "Data de fim é obrigatória" }),
  tipoEscala: z.string().min(1, "Selecione um tipo de escala"),
  observacoes: z.string().optional(),
});

type NovaEscalaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function NovaEscalaDialog({ open, onOpenChange }: NovaEscalaDialogProps) {
  const [colaboradoresSelecionados, setColaboradoresSelecionados] = useState<string[]>([]);
  
  // Lista mock de colaboradores
  const colaboradores = [
    { id: "CO1", nome: "Maria Silva", iniciais: "MS", departamento: "Produção" },
    { id: "CO2", nome: "Carlos Oliveira", iniciais: "CO", departamento: "Qualidade" },
    { id: "CO3", nome: "Pedro Santos", iniciais: "PS", departamento: "Cultivo" },
    { id: "CO4", nome: "Ana Souza", iniciais: "AS", departamento: "Marketing" },
    { id: "CO5", nome: "Roberto Lima", iniciais: "RL", departamento: "P&D" },
    { id: "CO6", nome: "Juliana Costa", iniciais: "JC", departamento: "Produção" },
    { id: "CO7", nome: "Marcos Ferreira", iniciais: "MF", departamento: "Qualidade" },
    { id: "CO8", nome: "Lucia Mendes", iniciais: "LM", departamento: "Cultivo" },
  ];
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      departamento: "",
      dataInicio: new Date(),
      dataFim: new Date(new Date().setDate(new Date().getDate() + 30)),
      tipoEscala: "",
      observacoes: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (colaboradoresSelecionados.length === 0) {
      alert("Selecione pelo menos um colaborador para a escala.");
      return;
    }
    
    const formData = {
      ...values,
      colaboradores: colaboradoresSelecionados,
    };
    
    console.log(formData);
    // Aqui você implementaria a lógica para adicionar a escala
    onOpenChange(false);
  }

  const toggleColaborador = (id: string) => {
    setColaboradoresSelecionados(prev => 
      prev.includes(id)
        ? prev.filter(coId => coId !== id)
        : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Nova Escala de Trabalho</DialogTitle>
          <DialogDescription>
            Configure uma nova escala de trabalho para seus colaboradores.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Escala *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Escala de Julho 2023 - Produção" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="departamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um departamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Produção">Produção</SelectItem>
                        <SelectItem value="Qualidade">Qualidade</SelectItem>
                        <SelectItem value="Cultivo">Cultivo</SelectItem>
                        <SelectItem value="Geral">Geral</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tipoEscala"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Escala *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Semanal">Semanal</SelectItem>
                        <SelectItem value="Quinzenal">Quinzenal</SelectItem>
                        <SelectItem value="Mensal">Mensal</SelectItem>
                        <SelectItem value="Plantão">Plantão</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dataInicio"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Início *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dataFim"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Fim *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                      placeholder="Observações sobre a escala" 
                      {...field} 
                      rows={2}
                    />
                  </FormControl>
                  <FormDescription>Opcional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator className="my-4" />
            
            <div>
              <FormLabel className="block mb-2">Colaboradores da Escala *</FormLabel>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {colaboradoresSelecionados.length > 0 ? (
                  colaboradoresSelecionados.map(id => {
                    const colaborador = colaboradores.find(c => c.id === id);
                    return (
                      <div 
                        key={id}
                        className="flex items-center gap-1 bg-primary/10 text-primary text-sm rounded-full py-1 px-3"
                      >
                        <span className="font-medium">{colaborador?.iniciais}</span>
                        <button
                          type="button"
                          onClick={() => toggleColaborador(id)}
                          className="text-primary/70 hover:text-primary"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-muted-foreground">Nenhum colaborador selecionado</div>
                )}
              </div>
              
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Selecione os Colaboradores:
                  </h4>
                  <ScrollArea className="h-48 rounded-md border">
                    <div className="p-4 space-y-3">
                      {colaboradores.map((colaborador) => (
                        <div 
                          key={colaborador.id} 
                          className="flex items-center space-x-2"
                        >
                          <Checkbox 
                            id={`colaborador-${colaborador.id}`} 
                            checked={colaboradoresSelecionados.includes(colaborador.id)}
                            onCheckedChange={() => toggleColaborador(colaborador.id)}
                          />
                          <label
                            htmlFor={`colaborador-${colaborador.id}`}
                            className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {colaborador.iniciais}
                              </AvatarFallback>
                            </Avatar>
                            <span>{colaborador.nome}</span>
                            <span className="text-xs text-muted-foreground">
                              ({colaborador.departamento})
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Criar Escala</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}