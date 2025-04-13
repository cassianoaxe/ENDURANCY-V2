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

const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/;

const novoFornecedorSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  cnpj: z.string().regex(cnpjRegex, "CNPJ inválido"),
  tipo: z.string().min(1, "Selecione um tipo de fornecedor"),
  telefone: z.string().min(10, "Telefone inválido"),
  email: z.string().email("Email inválido"),
  endereco: z.string().min(10, "O endereço deve ter pelo menos 10 caracteres"),
  contato: z.string().min(3, "O nome do contato deve ter pelo menos 3 caracteres"),
  descricao: z.string().optional(),
  site: z.string().url("URL inválida").optional().or(z.literal('')),
  prazoEntrega: z.number().min(1, "O prazo de entrega deve ser maior que zero"),
  condicaoPagamento: z.string().min(1, "Selecione uma condição de pagamento"),
});

type NovoFornecedorFormData = z.infer<typeof novoFornecedorSchema>;

interface NovoFornecedorDialogProps {
  children?: React.ReactNode;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onFornecedorCreated?: (fornecedor: NovoFornecedorFormData) => void;
}

export default function NovoFornecedorDialog({
  children,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onFornecedorCreated
}: NovoFornecedorDialogProps) {
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
  } = useForm<NovoFornecedorFormData>({
    resolver: zodResolver(novoFornecedorSchema),
    defaultValues: {
      nome: '',
      cnpj: '',
      tipo: '',
      telefone: '',
      email: '',
      endereco: '',
      contato: '',
      descricao: '',
      site: '',
      prazoEntrega: 7,
      condicaoPagamento: '',
    },
  });

  const onSubmit = async (data: NovoFornecedorFormData) => {
    try {
      // Aqui seria feita a integração com a API
      console.log("Dados do fornecedor:", data);
      
      // Simular um atraso na requisição
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Fornecedor cadastrado com sucesso",
        description: "Novo fornecedor foi adicionado ao sistema",
      });
      
      if (onFornecedorCreated) {
        onFornecedorCreated(data);
      }
      
      reset();
      setOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar fornecedor",
        description: "Ocorreu um erro ao registrar o fornecedor. Tente novamente.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || children || (
          <Button variant="default">Novo Fornecedor</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Novo Fornecedor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome da Empresa</Label>
              <Input
                id="nome"
                placeholder="Razão social completa"
                {...register("nome")}
              />
              {errors.nome && (
                <p className="text-sm text-red-500">{errors.nome.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  placeholder="00.000.000/0000-00"
                  {...register("cnpj")}
                />
                {errors.cnpj && (
                  <p className="text-sm text-red-500">{errors.cnpj.message}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="tipo">Tipo de Fornecedor</Label>
                <Controller
                  name="tipo"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger id="tipo">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="produtos">Produtos</SelectItem>
                        <SelectItem value="servicos">Serviços</SelectItem>
                        <SelectItem value="insumos">Insumos</SelectItem>
                        <SelectItem value="equipamentos">Equipamentos</SelectItem>
                        <SelectItem value="logistica">Logística</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.tipo && (
                  <p className="text-sm text-red-500">{errors.tipo.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  placeholder="(00) 00000-0000"
                  {...register("telefone")}
                />
                {errors.telefone && (
                  <p className="text-sm text-red-500">{errors.telefone.message}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contato@empresa.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="endereco">Endereço Completo</Label>
              <Textarea
                id="endereco"
                placeholder="Rua, número, bairro, cidade, estado, CEP"
                {...register("endereco")}
              />
              {errors.endereco && (
                <p className="text-sm text-red-500">{errors.endereco.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contato">Nome do Contato</Label>
                <Input
                  id="contato"
                  placeholder="Pessoa responsável pelo contato"
                  {...register("contato")}
                />
                {errors.contato && (
                  <p className="text-sm text-red-500">{errors.contato.message}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="site">Site</Label>
                <Input
                  id="site"
                  placeholder="https://www.empresa.com"
                  {...register("site")}
                />
                {errors.site && (
                  <p className="text-sm text-red-500">{errors.site.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="prazoEntrega">Prazo de Entrega (dias)</Label>
                <Input
                  id="prazoEntrega"
                  type="number"
                  min="1"
                  {...register("prazoEntrega", { valueAsNumber: true })}
                />
                {errors.prazoEntrega && (
                  <p className="text-sm text-red-500">{errors.prazoEntrega.message}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="condicaoPagamento">Condição de Pagamento</Label>
                <Controller
                  name="condicaoPagamento"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger id="condicaoPagamento">
                        <SelectValue placeholder="Selecione a condição" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a_vista">À vista</SelectItem>
                        <SelectItem value="15dias">15 dias</SelectItem>
                        <SelectItem value="30dias">30 dias</SelectItem>
                        <SelectItem value="45dias">45 dias</SelectItem>
                        <SelectItem value="60dias">60 dias</SelectItem>
                        <SelectItem value="parcelado">Parcelado</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.condicaoPagamento && (
                  <p className="text-sm text-red-500">{errors.condicaoPagamento.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição/Observações</Label>
              <Textarea
                id="descricao"
                placeholder="Informações adicionais sobre o fornecedor"
                {...register("descricao")}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Cadastrar Fornecedor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}