'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

// Definindo o schema de validação
const maintenanceFormSchema = z.object({
  description: z.string().min(1, { message: 'A descrição é obrigatória' }),
  maintenanceType: z.string().min(1, { message: 'O tipo de manutenção é obrigatório' }),
  scheduledDate: z.date({ required_error: 'A data agendada é obrigatória' }),
  completionDate: z.date().nullable().optional(),
  performedBy: z.string().optional(),
  cost: z.coerce.number().nonnegative().optional(),
  status: z.string().min(1, { message: 'O status é obrigatório' }),
  serviceProvider: z.string().optional(),
  notes: z.string().optional(),
  followUpRequired: z.boolean().default(false),
  followUpDate: z.date().nullable().optional(),
  documents: z.string().optional(),
});

// Tipo para os valores do formulário
type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

// Interface do componente
interface MaintenanceFormProps {
  onSubmit: (data: MaintenanceFormValues) => void;
  isLoading: boolean;
  initialData?: any;
}

export function MaintenanceForm({ onSubmit, isLoading, initialData }: MaintenanceFormProps) {
  const [followUpRequired, setFollowUpRequired] = useState(initialData?.followUpRequired || false);

  // Configuração do formulário
  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      description: initialData?.description || '',
      maintenanceType: initialData?.maintenanceType || '',
      scheduledDate: initialData?.scheduledDate ? new Date(initialData.scheduledDate) : new Date(),
      completionDate: initialData?.completionDate ? new Date(initialData.completionDate) : null,
      performedBy: initialData?.performedBy || '',
      cost: initialData?.cost || 0,
      status: initialData?.status || 'scheduled',
      serviceProvider: initialData?.serviceProvider || '',
      notes: initialData?.notes || '',
      followUpRequired: initialData?.followUpRequired || false,
      followUpDate: initialData?.followUpDate ? new Date(initialData.followUpDate) : null,
      documents: initialData?.documents || '',
    },
  });

  // Função de envio do formulário
  const handleSubmit = (data: MaintenanceFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Descrição */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descrição detalhada da manutenção" 
                    {...field} 
                    className="resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tipo de Manutenção */}
          <FormField
            control={form.control}
            name="maintenanceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Manutenção</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="preventive">Preventiva</SelectItem>
                    <SelectItem value="corrective">Corretiva</SelectItem>
                    <SelectItem value="calibration">Calibração</SelectItem>
                    <SelectItem value="validation">Validação</SelectItem>
                    <SelectItem value="inspection">Inspeção</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="scheduled">Agendada</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="canceled">Cancelada</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Data Agendada */}
          <FormField
            control={form.control}
            name="scheduledDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data Agendada</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
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
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Data de Conclusão */}
          <FormField
            control={form.control}
            name="completionDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Conclusão</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
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
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Opcional. Preencha após a conclusão da manutenção.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Realizado Por */}
          <FormField
            control={form.control}
            name="performedBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Realizado Por</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do técnico/responsável" {...field} />
                </FormControl>
                <FormDescription>
                  Nome do técnico ou responsável pela manutenção
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Prestador de Serviço */}
          <FormField
            control={form.control}
            name="serviceProvider"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prestador de Serviço</FormLabel>
                <FormControl>
                  <Input placeholder="Empresa prestadora do serviço" {...field} />
                </FormControl>
                <FormDescription>
                  Nome da empresa prestadora do serviço (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Custo */}
          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custo (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    step="0.01" 
                    min="0" 
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>Valor gasto com a manutenção (opcional)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Documentos */}
          <FormField
            control={form.control}
            name="documents"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Documentos</FormLabel>
                <FormControl>
                  <Input placeholder="Links ou referências a documentos" {...field} />
                </FormControl>
                <FormDescription>
                  Links ou referências a documentos relacionados
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Requer Acompanhamento */}
          <FormField
            control={form.control}
            name="followUpRequired"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Requer Acompanhamento</FormLabel>
                  <FormDescription>
                    Indica se esta manutenção requer acompanhamento posterior
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      setFollowUpRequired(checked);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Data de Acompanhamento */}
          {followUpRequired && (
            <FormField
              control={form.control}
              name="followUpDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Acompanhamento</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
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
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) => date <= new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Data para acompanhamento após a manutenção
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Observações */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Observações adicionais sobre a manutenção" 
                    {...field} 
                    className="resize-none"
                  />
                </FormControl>
                <FormDescription>
                  Informações adicionais relevantes sobre a manutenção
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : initialData ? 'Atualizar Manutenção' : 'Adicionar Manutenção'}
          </Button>
        </div>
      </form>
    </Form>
  );
}