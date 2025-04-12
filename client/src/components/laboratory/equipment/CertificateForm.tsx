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
import { cn } from '@/lib/utils';

// Definindo o schema de validação
const certificateFormSchema = z.object({
  status: z.string().min(1, { message: 'O status é obrigatório' }),
  certificateNumber: z.string().min(1, { message: 'O número do certificado é obrigatório' }),
  type: z.string().min(1, { message: 'O tipo de certificado é obrigatório' }),
  issuedBy: z.string().min(1, { message: 'A empresa emissora é obrigatória' }),
  issuedDate: z.date({ required_error: 'A data de emissão é obrigatória' }),
  expiryDate: z.date().nullable().optional(),
  attachmentUrl: z.string().optional(),
  notes: z.string().optional(),
});

// Tipo para os valores do formulário
type CertificateFormValues = z.infer<typeof certificateFormSchema>;

// Interface do componente
interface CertificateFormProps {
  onSubmit: (data: CertificateFormValues) => void;
  isLoading: boolean;
  initialData?: any;
}

export function CertificateForm({ onSubmit, isLoading, initialData }: CertificateFormProps) {
  // Configuração do formulário
  const form = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateFormSchema),
    defaultValues: {
      status: initialData?.status || 'valid',
      certificateNumber: initialData?.certificateNumber || '',
      type: initialData?.type || '',
      issuedBy: initialData?.issuedBy || '',
      issuedDate: initialData?.issuedDate ? new Date(initialData.issuedDate) : new Date(),
      expiryDate: initialData?.expiryDate ? new Date(initialData.expiryDate) : null,
      attachmentUrl: initialData?.attachmentUrl || '',
      notes: initialData?.notes || '',
    },
  });

  // Função de envio do formulário
  const handleSubmit = (data: CertificateFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status do Certificado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="valid">Válido</SelectItem>
                    <SelectItem value="expired">Expirado</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="revoked">Revogado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tipo de Certificado */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Certificado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="calibration">Calibração</SelectItem>
                    <SelectItem value="qualification">Qualificação</SelectItem>
                    <SelectItem value="validation">Validação</SelectItem>
                    <SelectItem value="compliance">Conformidade</SelectItem>
                    <SelectItem value="iso">ISO</SelectItem>
                    <SelectItem value="safety">Segurança</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Número do Certificado */}
          <FormField
            control={form.control}
            name="certificateNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número do Certificado</FormLabel>
                <FormControl>
                  <Input placeholder="Número ou código do certificado" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Emitido Por */}
          <FormField
            control={form.control}
            name="issuedBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emitido Por</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da empresa/entidade emissora" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Data de Emissão */}
          <FormField
            control={form.control}
            name="issuedDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Emissão</FormLabel>
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
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Data de Expiração */}
          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Expiração</FormLabel>
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
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Deixe em branco se o certificado não tiver data de expiração
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* URL do Anexo */}
          <FormField
            control={form.control}
            name="attachmentUrl"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>URL do Documento</FormLabel>
                <FormControl>
                  <Input placeholder="Link para o documento do certificado" {...field} />
                </FormControl>
                <FormDescription>
                  Link ou referência ao documento do certificado (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Observações */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Observações adicionais sobre o certificado" 
                    {...field} 
                    className="resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : initialData ? 'Atualizar Certificado' : 'Adicionar Certificado'}
          </Button>
        </div>
      </form>
    </Form>
  );
}