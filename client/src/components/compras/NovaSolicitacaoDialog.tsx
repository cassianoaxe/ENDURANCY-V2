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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Package, Plus, Trash, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z.object({
  descricao: z.string().min(3, "A descrição deve ter pelo menos 3 caracteres"),
  setor: z.string().min(1, "Selecione um setor"),
  urgencia: z.string().min(1, "Selecione o nível de urgência"),
  justificativa: z.string().min(10, "A justificativa deve ter pelo menos 10 caracteres"),
  observacoes: z.string().optional()
});

const itemSchema = z.object({
  descricao: z.string().min(3, "A descrição do item deve ter pelo menos 3 caracteres"),
  quantidade: z.coerce.number().positive("A quantidade deve ser maior que zero"),
  unidade: z.string().min(1, "Selecione uma unidade"),
  valorEstimado: z.string().optional()
});

type NovaSolicitacaoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function NovaSolicitacaoDialog({ open, onOpenChange }: NovaSolicitacaoDialogProps) {
  const [items, setItems] = useState<any[]>([]);
  const [itemAtual, setItemAtual] = useState<z.infer<typeof itemSchema>>({
    descricao: "",
    quantidade: 1,
    unidade: "",
    valorEstimado: ""
  });
  const [itemErros, setItemErros] = useState<Record<string, string>>({});

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      descricao: "",
      setor: "",
      urgencia: "media",
      justificativa: "",
      observacoes: ""
    }
  });

  const resetItemForm = () => {
    setItemAtual({
      descricao: "",
      quantidade: 1,
      unidade: "",
      valorEstimado: ""
    });
    setItemErros({});
  };

  const validarItem = (item: z.infer<typeof itemSchema>) => {
    try {
      itemSchema.parse(item);
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        const erros: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path) {
            erros[err.path[0]] = err.message;
          }
        });
        return erros;
      }
      return { geral: "Erro ao validar item" };
    }
  };

  const adicionarItem = () => {
    const erros = validarItem(itemAtual);
    if (Object.keys(erros).length === 0) {
      setItems([...items, { ...itemAtual, id: Date.now() }]);
      resetItemForm();
    } else {
      setItemErros(erros);
    }
  };

  const removerItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (items.length === 0) {
      alert("Adicione pelo menos um item à solicitação");
      return;
    }
    
    const solicitacaoCompleta = {
      ...values,
      items
    };
    
    console.log("Solicitação enviada:", solicitacaoCompleta);
    
    // Limpar formulário
    form.reset();
    setItems([]);
    
    // Fechar dialog
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Nova Solicitação de Compra
          </DialogTitle>
          <DialogDescription>
            Preencha os dados para criar uma nova solicitação de compra
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição da Solicitação*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Materiais para laboratório" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="setor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Setor Solicitante*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um setor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="laboratorio">Laboratório</SelectItem>
                          <SelectItem value="producao">Produção</SelectItem>
                          <SelectItem value="qualidade">Controle de Qualidade</SelectItem>
                          <SelectItem value="administrativo">Administrativo</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="ti">TI</SelectItem>
                          <SelectItem value="comercial">Comercial</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="urgencia"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Nível de Urgência*</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="baixa" />
                            </FormControl>
                            <FormLabel className="font-normal text-green-600">Baixa</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="media" />
                            </FormControl>
                            <FormLabel className="font-normal text-blue-600">Média</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="alta" />
                            </FormControl>
                            <FormLabel className="font-normal text-red-600">Alta</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="justificativa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Justificativa*</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Justifique a necessidade desta solicitação"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Itens da Solicitação</h3>
              
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Descrição do Item*</label>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar ou descrever o item"
                          className="pl-8"
                          value={itemAtual.descricao}
                          onChange={(e) => setItemAtual({ ...itemAtual, descricao: e.target.value })}
                        />
                      </div>
                      {itemErros.descricao && (
                        <p className="text-sm font-medium text-destructive">{itemErros.descricao}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Quantidade*</label>
                        <Input
                          type="number"
                          min="1"
                          value={itemAtual.quantidade}
                          onChange={(e) => setItemAtual({ ...itemAtual, quantidade: parseInt(e.target.value) || 0 })}
                        />
                        {itemErros.quantidade && (
                          <p className="text-sm font-medium text-destructive">{itemErros.quantidade}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Unidade*</label>
                        <Select
                          value={itemAtual.unidade}
                          onValueChange={(value) => setItemAtual({ ...itemAtual, unidade: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="un">Unidade (un)</SelectItem>
                            <SelectItem value="cx">Caixa (cx)</SelectItem>
                            <SelectItem value="kg">Quilograma (kg)</SelectItem>
                            <SelectItem value="g">Grama (g)</SelectItem>
                            <SelectItem value="l">Litro (l)</SelectItem>
                            <SelectItem value="ml">Mililitro (ml)</SelectItem>
                            <SelectItem value="pct">Pacote (pct)</SelectItem>
                          </SelectContent>
                        </Select>
                        {itemErros.unidade && (
                          <p className="text-sm font-medium text-destructive">{itemErros.unidade}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Valor Estimado (opcional)</label>
                      <Input
                        placeholder="R$ 0,00"
                        value={itemAtual.valorEstimado}
                        onChange={(e) => setItemAtual({ ...itemAtual, valorEstimado: e.target.value })}
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={adicionarItem}
                        className="gap-2 w-full"
                      >
                        <Plus className="h-4 w-4" /> Adicionar Item
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {items.length > 0 && (
                <Card>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[200px]">
                      <table className="w-full">
                        <thead className="bg-muted/50 sticky top-0">
                          <tr>
                            <th className="text-left p-3 text-sm font-medium">Descrição</th>
                            <th className="text-right p-3 text-sm font-medium">Qtd</th>
                            <th className="text-left p-3 text-sm font-medium">Un</th>
                            <th className="text-right p-3 text-sm font-medium">Valor Est.</th>
                            <th className="text-center p-3 text-sm font-medium w-16">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item) => (
                            <tr key={item.id} className="border-t">
                              <td className="p-3 text-sm">{item.descricao}</td>
                              <td className="p-3 text-sm text-right">{item.quantidade}</td>
                              <td className="p-3 text-sm">{item.unidade}</td>
                              <td className="p-3 text-sm text-right">{item.valorEstimado || '-'}</td>
                              <td className="p-3 text-sm text-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removerItem(item.id)}
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações adicionais (opcional)"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Qualquer informação adicional relevante para a solicitação.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="gap-2">
                <Package className="h-4 w-4" /> Enviar Solicitação
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}