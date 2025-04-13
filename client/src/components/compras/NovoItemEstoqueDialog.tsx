import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

const novoItemEstoqueSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  codigo: z.string().min(2, "O código deve ter pelo menos 2 caracteres"),
  categoria: z.string().min(1, "Selecione uma categoria"),
  unidade: z.string().min(1, "Selecione uma unidade de medida"),
  quantidade: z.number().min(0, "A quantidade não pode ser negativa"),
  valorUnitario: z.number().min(0, "O valor unitário não pode ser negativo"),
  estoqueMinimo: z.number().min(0, "O estoque mínimo não pode ser negativo"),
  estoqueMaximo: z.number().min(0, "O estoque máximo não pode ser negativo"),
  localizacao: z.string().optional(),
  fornecedor: z.string().optional(),
  descricao: z.string().optional(),
});

type NovoItemEstoqueFormData = z.infer<typeof novoItemEstoqueSchema>;

interface NovoItemEstoqueDialogProps {
  children?: React.ReactNode;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  categoriaInicial?: string | null;
  onItemCreated?: (item: NovoItemEstoqueFormData) => void;
}

export default function NovoItemEstoqueDialog({
  children,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  categoriaInicial,
  onItemCreated
}: NovoItemEstoqueDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = setControlledOpen || setUncontrolledOpen;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<NovoItemEstoqueFormData>({
    resolver: zodResolver(novoItemEstoqueSchema),
    defaultValues: {
      nome: '',
      codigo: '',
      categoria: '',
      unidade: '',
      quantidade: 0,
      valorUnitario: 0,
      estoqueMinimo: 0,
      estoqueMaximo: 0,
      localizacao: '',
      fornecedor: '',
      descricao: '',
    },
  });

  const onSubmit = async (data: NovoItemEstoqueFormData) => {
    try {
      // Aqui seria feita a integração com a API
      console.log("Dados do item de estoque:", data);
      
      // Simular um atraso na requisição
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Item cadastrado com sucesso",
        description: "Novo item foi adicionado ao estoque",
      });
      
      if (onItemCreated) {
        onItemCreated(data);
      }
      
      reset();
      setOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar item",
        description: "Ocorreu um erro ao adicionar o item ao estoque. Tente novamente.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || children || (
          <Button variant="default">Novo Item de Estoque</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Adicionar Item ao Estoque</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome do Item</Label>
              <Input
                id="nome"
                placeholder="Nome completo do item"
                {...register("nome")}
              />
              {errors.nome && (
                <p className="text-sm text-red-500">{errors.nome.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  placeholder="Código de identificação"
                  {...register("codigo")}
                />
                {errors.codigo && (
                  <p className="text-sm text-red-500">{errors.codigo.message}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Controller
                  name="categoria"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger id="categoria">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reagentes">Reagentes</SelectItem>
                        <SelectItem value="materiais">Materiais de Laboratório</SelectItem>
                        <SelectItem value="equipamentos">Equipamentos</SelectItem>
                        <SelectItem value="embalagens">Embalagens</SelectItem>
                        <SelectItem value="materia_prima">Matéria-Prima</SelectItem>
                        <SelectItem value="produtos_acabados">Produtos Acabados</SelectItem>
                        <SelectItem value="escritorio">Material de Escritório</SelectItem>
                        <SelectItem value="limpeza">Material de Limpeza</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoria && (
                  <p className="text-sm text-red-500">{errors.categoria.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="unidade">Unidade de Medida</Label>
                <Controller
                  name="unidade"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger id="unidade">
                        <SelectValue placeholder="Selecione a unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="un">Unidade</SelectItem>
                        <SelectItem value="cx">Caixa</SelectItem>
                        <SelectItem value="kg">Kg</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="l">Litro</SelectItem>
                        <SelectItem value="ml">mL</SelectItem>
                        <SelectItem value="pc">Pacote</SelectItem>
                        <SelectItem value="fr">Frasco</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.unidade && (
                  <p className="text-sm text-red-500">{errors.unidade.message}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="quantidade">Quantidade Inicial</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("quantidade", { valueAsNumber: true })}
                />
                {errors.quantidade && (
                  <p className="text-sm text-red-500">{errors.quantidade.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="valorUnitario">Valor Unitário (R$)</Label>
                <Input
                  id="valorUnitario"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("valorUnitario", { valueAsNumber: true })}
                />
                {errors.valorUnitario && (
                  <p className="text-sm text-red-500">{errors.valorUnitario.message}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
                <Input
                  id="estoqueMinimo"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("estoqueMinimo", { valueAsNumber: true })}
                />
                {errors.estoqueMinimo && (
                  <p className="text-sm text-red-500">{errors.estoqueMinimo.message}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="estoqueMaximo">Estoque Máximo</Label>
                <Input
                  id="estoqueMaximo"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("estoqueMaximo", { valueAsNumber: true })}
                />
                {errors.estoqueMaximo && (
                  <p className="text-sm text-red-500">{errors.estoqueMaximo.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="localizacao">Localização no Estoque</Label>
                <Input
                  id="localizacao"
                  placeholder="Ex: Prateleira A, Gaveta 3"
                  {...register("localizacao")}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="fornecedor">Fornecedor Principal</Label>
                <Input
                  id="fornecedor"
                  placeholder="Nome do fornecedor principal"
                  {...register("fornecedor")}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição/Observações</Label>
              <Textarea
                id="descricao"
                placeholder="Informações adicionais sobre o item"
                {...register("descricao")}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Cadastrar Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}