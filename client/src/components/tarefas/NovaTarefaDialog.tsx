import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { StatusTarefa, PrioridadeTarefa } from '@shared/schema-tarefas';

const novaTarefaSchema = z.object({
  titulo: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  descricao: z.string().optional(),
  status: z.string().min(1, "Selecione o status da tarefa"),
  prioridade: z.string().min(1, "Selecione a prioridade da tarefa"),
  dataVencimento: z.date().optional()
});

type NovaTarefaFormData = z.infer<typeof novaTarefaSchema>;

interface NovaTarefaDialogProps {
  children?: React.ReactNode;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onTarefaCreated?: (tarefa: NovaTarefaFormData) => void;
}

export default function NovaTarefaDialog({
  children,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onTarefaCreated
}: NovaTarefaDialogProps) {
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
  } = useForm<NovaTarefaFormData>({
    resolver: zodResolver(novaTarefaSchema),
    defaultValues: {
      titulo: '',
      descricao: '',
      status: StatusTarefa.TODO,
      prioridade: PrioridadeTarefa.MEDIUM,
      dataVencimento: undefined
    },
  });

  const onSubmit = async (data: NovaTarefaFormData) => {
    try {
      // Aqui seria feita a integração com a API
      console.log("Dados da tarefa:", data);
      
      // Simular um atraso na requisição
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Tarefa criada com sucesso",
        description: "A nova tarefa foi adicionada ao sistema"
      });
      
      if (onTarefaCreated) {
        onTarefaCreated(data);
      }
      
      reset();
      setOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar tarefa",
        description: "Ocorreu um erro ao adicionar a tarefa. Tente novamente."
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || children || (
          <Button variant="default">Nova Tarefa</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="titulo">Título da Tarefa</Label>
              <Input
                id="titulo"
                placeholder="Digite o título da tarefa"
                {...register("titulo")}
              />
              {errors.titulo && (
                <p className="text-sm text-red-500">{errors.titulo.message}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva os detalhes da tarefa"
                rows={3}
                {...register("descricao")}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={StatusTarefa.BACKLOG}>Backlog</SelectItem>
                        <SelectItem value={StatusTarefa.TODO}>A Fazer</SelectItem>
                        <SelectItem value={StatusTarefa.IN_PROGRESS}>Em Progresso</SelectItem>
                        <SelectItem value={StatusTarefa.REVIEW}>Revisão</SelectItem>
                        <SelectItem value={StatusTarefa.DONE}>Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="text-sm text-red-500">{errors.status.message}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="prioridade">Prioridade</Label>
                <Controller
                  name="prioridade"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger id="prioridade">
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PrioridadeTarefa.LOW}>Baixa</SelectItem>
                        <SelectItem value={PrioridadeTarefa.MEDIUM}>Média</SelectItem>
                        <SelectItem value={PrioridadeTarefa.HIGH}>Alta</SelectItem>
                        <SelectItem value={PrioridadeTarefa.URGENT}>Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.prioridade && (
                  <p className="text-sm text-red-500">{errors.prioridade.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="dataVencimento">Data de Vencimento</Label>
              <Controller
                name="dataVencimento"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione a data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar Tarefa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}