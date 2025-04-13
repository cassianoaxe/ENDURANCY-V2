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

const novaSolicitacaoSchema = z.object({
  descricao: z.string().min(5, "A descrição deve ter pelo menos 5 caracteres"),
  departamento: z.string().min(1, "Selecione um departamento"),
  urgencia: z.string().min(1, "Selecione um nível de urgência"),
  observacoes: z.string().optional(),
  itens: z.array(z.object({
    nome: z.string().min(2, "O nome do item deve ter pelo menos 2 caracteres"),
    quantidade: z.number().min(1, "A quantidade deve ser maior que zero"),
    unidade: z.string().min(1, "Selecione uma unidade"),
  })).min(1, "Adicione pelo menos um item"),
});

type NovaSolicitacaoFormData = z.infer<typeof novaSolicitacaoSchema>;

type ItemSolicitacao = {
  nome: string;
  quantidade: number;
  unidade: string;
};

interface NovaSolicitacaoDialogProps {
  children?: React.ReactNode;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSolicitacaoCreated?: (solicitacao: NovaSolicitacaoFormData) => void;
}

export default function NovaSolicitacaoDialog({
  children,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSolicitacaoCreated
}: NovaSolicitacaoDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = setControlledOpen || setUncontrolledOpen;
  const [items, setItems] = React.useState<ItemSolicitacao[]>([]);
  const [currentItem, setCurrentItem] = React.useState<ItemSolicitacao>({
    nome: '',
    quantidade: 1,
    unidade: '',
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<NovaSolicitacaoFormData>({
    resolver: zodResolver(novaSolicitacaoSchema),
    defaultValues: {
      descricao: '',
      departamento: '',
      urgencia: '',
      observacoes: '',
      itens: [],
    },
  });

  const addItem = () => {
    if (currentItem.nome && currentItem.quantidade > 0 && currentItem.unidade) {
      setItems([...items, { ...currentItem }]);
      setCurrentItem({
        nome: '',
        quantidade: 1,
        unidade: '',
      });
    } else {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar item",
        description: "Preencha todos os campos do item corretamente",
      });
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: NovaSolicitacaoFormData) => {
    try {
      // Aqui seria feita a integração com a API
      console.log("Dados da solicitação:", { ...data, itens: items });
      
      // Simular um atraso na requisição
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Solicitação criada com sucesso",
        description: "Sua solicitação de compra foi registrada",
      });
      
      if (onSolicitacaoCreated) {
        onSolicitacaoCreated({ ...data, itens: items });
      }
      
      reset();
      setItems([]);
      setOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar solicitação",
        description: "Ocorreu um erro ao registrar sua solicitação. Tente novamente.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || children || (
          <Button variant="default">Nova Solicitação</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nova Solicitação de Compra</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição da Solicitação</Label>
              <Input
                id="descricao"
                placeholder="Descreva o objetivo desta solicitação"
                {...register("descricao")}
              />
              {errors.descricao && (
                <p className="text-sm text-red-500">{errors.descricao.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="departamento">Departamento</Label>
                <Controller
                  name="departamento"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger id="departamento">
                        <SelectValue placeholder="Selecione o departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="producao">Produção</SelectItem>
                        <SelectItem value="administrativo">Administrativo</SelectItem>
                        <SelectItem value="vendas">Vendas</SelectItem>
                        <SelectItem value="suprimentos">Suprimentos</SelectItem>
                        <SelectItem value="laboratorio">Laboratório</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.departamento && (
                  <p className="text-sm text-red-500">{errors.departamento.message}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="urgencia">Urgência</Label>
                <Controller
                  name="urgencia"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger id="urgencia">
                        <SelectValue placeholder="Selecione a urgência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="critica">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.urgencia && (
                  <p className="text-sm text-red-500">{errors.urgencia.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Informações adicionais sobre esta solicitação"
                {...register("observacoes")}
              />
            </div>
            
            <div className="border rounded-md p-4 space-y-4">
              <h3 className="font-medium">Itens da Solicitação</h3>
              
              <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 items-end">
                <div>
                  <Label htmlFor="nome-item">Nome do Item</Label>
                  <Input
                    id="nome-item"
                    value={currentItem.nome}
                    onChange={(e) => setCurrentItem({ ...currentItem, nome: e.target.value })}
                    placeholder="Ex: Reagente HCl"
                  />
                </div>
                <div>
                  <Label htmlFor="quantidade-item">Quantidade</Label>
                  <Input
                    id="quantidade-item"
                    type="number"
                    min="1"
                    value={currentItem.quantidade}
                    onChange={(e) => setCurrentItem({ ...currentItem, quantidade: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label htmlFor="unidade-item">Unidade</Label>
                  <Select
                    value={currentItem.unidade}
                    onValueChange={(value) => setCurrentItem({ ...currentItem, unidade: value })}
                  >
                    <SelectTrigger id="unidade-item">
                      <SelectValue placeholder="Un." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="un">Unidade</SelectItem>
                      <SelectItem value="cx">Caixa</SelectItem>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="l">Litro</SelectItem>
                      <SelectItem value="ml">mL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" onClick={addItem} className="mb-0.5">
                  Adicionar
                </Button>
              </div>
              
              {items.length > 0 ? (
                <div className="border rounded-md divide-y">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2">
                      <div className="flex-1">
                        <span className="font-medium">{item.nome}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          {item.quantidade} {item.unidade}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-gray-500">
                  Nenhum item adicionado
                </div>
              )}
              
              {errors.itens && (
                <p className="text-sm text-red-500">{errors.itens.message}</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || items.length === 0}>
              {isSubmitting ? "Enviando..." : "Criar Solicitação"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}