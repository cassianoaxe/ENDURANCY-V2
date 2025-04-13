'use client';

import React, { useEffect } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Package, Search, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Validação do formulário de item de estoque
const formSchema = z.object({
  // Dados básicos
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  codigo: z.string().min(3, "Código deve ter pelo menos 3 caracteres"),
  descricao: z.string().optional(),
  categoria: z.string().min(1, "Selecione uma categoria"),
  unidade: z.string().min(1, "Selecione uma unidade"),
  
  // Quantidades
  quantidadeAtual: z.coerce.number().nonnegative("Quantidade deve ser maior ou igual a zero"),
  quantidadeMinima: z.coerce.number().nonnegative("Quantidade mínima deve ser maior ou igual a zero"),
  quantidadeIdeal: z.coerce.number().nonnegative("Quantidade ideal deve ser maior ou igual a zero"),
  
  // Detalhes adicionais
  localizacao: z.string().optional(),
  lote: z.string().optional(),
  dataValidade: z.date().optional(),
  valorUnitario: z.string().optional(),
  fornecedorId: z.string().optional(),
  temAlerta: z.boolean().default(false),
  observacoes: z.string().optional()
});

type NovoItemEstoqueDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoriaInicial?: string | null;
};

export function NovoItemEstoqueDialog({ 
  open, 
  onOpenChange,
  categoriaInicial 
}: NovoItemEstoqueDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      codigo: "",
      descricao: "",
      categoria: categoriaInicial || "",
      unidade: "",
      quantidadeAtual: 0,
      quantidadeMinima: 0,
      quantidadeIdeal: 0,
      localizacao: "",
      lote: "",
      valorUnitario: "",
      fornecedorId: "",
      temAlerta: false,
      observacoes: ""
    }
  });

  // Atualiza a categoria selecionada quando a prop muda
  useEffect(() => {
    if (categoriaInicial) {
      form.setValue("categoria", categoriaInicial);
    }
  }, [categoriaInicial, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Item de estoque cadastrado:", values);
    
    // Limpar formulário e fechar dialog
    form.reset();
    onOpenChange(false);
  }

  // Lista mockada de fornecedores para seleção
  const fornecedores = [
    { id: "1", nome: "CannabTech Distribuidora" },
    { id: "2", nome: "Insumos Farmacêuticos SA" },
    { id: "3", nome: "Insumos Naturais Ltda" },
    { id: "4", nome: "GlassPack Embalagens" },
    { id: "5", nome: "LabelPrint Rótulos" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Novo Item de Estoque
          </DialogTitle>
          <DialogDescription>
            Cadastre um novo item para controle de estoque
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Item*</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Álcool Isopropílico 99%" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="codigo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código*</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: MP-ISO-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descrição detalhada do item"
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria*</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="materia_prima_ativos">Matéria Prima - Ativos</SelectItem>
                          <SelectItem value="materia_prima_excipientes">Matéria Prima - Excipientes</SelectItem>
                          <SelectItem value="embalagens">Embalagens</SelectItem>
                          <SelectItem value="rotulos">Rótulos</SelectItem>
                          <SelectItem value="produto_acabado">Produto Acabado</SelectItem>
                          <SelectItem value="produto_quarentena">Produto em Quarentena</SelectItem>
                          <SelectItem value="material_laboratorio">Material de Laboratório</SelectItem>
                          <SelectItem value="material_escritorio">Material de Escritório</SelectItem>
                          <SelectItem value="equipamentos">Equipamentos</SelectItem>
                          <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidade de Medida*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma unidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="un">Unidade (un)</SelectItem>
                          <SelectItem value="cx">Caixa (cx)</SelectItem>
                          <SelectItem value="kg">Quilograma (kg)</SelectItem>
                          <SelectItem value="g">Grama (g)</SelectItem>
                          <SelectItem value="l">Litro (l)</SelectItem>
                          <SelectItem value="ml">Mililitro (ml)</SelectItem>
                          <SelectItem value="frasco">Frasco</SelectItem>
                          <SelectItem value="ampola">Ampola</SelectItem>
                          <SelectItem value="pct">Pacote (pct)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="quantidadeAtual"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade Atual*</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantidadeMinima"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade Mínima*</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantidadeIdeal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade Ideal*</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="localizacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localização no Estoque</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Prateleira A3, Setor 2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lote"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lote</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: LOT20230615" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dataValidade"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Validade</FormLabel>
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
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>Data de validade do produto</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valorUnitario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Unitário</FormLabel>
                      <FormControl>
                        <Input placeholder="R$ 0,00" {...field} />
                      </FormControl>
                      <FormDescription>Preço médio ou de referência</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="fornecedorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor Preferencial</FormLabel>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="pl-8">
                            <SelectValue placeholder="Selecione um fornecedor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fornecedores.map(fornecedor => (
                            <SelectItem key={fornecedor.id} value={fornecedor.id}>
                              {fornecedor.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormDescription>Fornecedor padrão para este item</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="temAlerta"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        Alerta para estoque mínimo
                      </FormLabel>
                      <FormDescription>
                        Receber alertas quando o item atingir quantidade mínima
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observações adicionais sobre o item"
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="gap-2">
                <Package className="h-4 w-4" /> Cadastrar Item
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}