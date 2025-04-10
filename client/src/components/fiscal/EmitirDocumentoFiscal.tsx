import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Printer, Receipt, FileText } from 'lucide-react';
import { apiRequest } from '../../lib/queryClient';

// Esquema de validação para emissão de documento fiscal
const documentoFiscalSchema = z.object({
  type: z.enum(['cupom_fiscal', 'nfce', 'nfe', 'nfse'], {
    required_error: 'Selecione o tipo de documento',
  }),
  customerName: z.string().optional(),
  customerDocument: z.string().optional(),
  includeCustomerInfo: z.boolean().default(false),
  paymentMethod: z.enum(['dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'outro'], {
    required_error: 'Selecione a forma de pagamento',
  }),
});

type DocumentoFiscalFormValues = z.infer<typeof documentoFiscalSchema>;

interface EmitirDocumentoFiscalProps {
  orderId: number;
  orderItems: any[];
  orderTotal: number;
  organizationId: number;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onSuccess?: (data: any) => void;
}

export default function EmitirDocumentoFiscal({
  orderId,
  orderItems,
  orderTotal,
  organizationId,
  disabled = false,
  variant = 'default',
  size = 'default',
  className = '',
  onSuccess
}: EmitirDocumentoFiscalProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<DocumentoFiscalFormValues>({
    resolver: zodResolver(documentoFiscalSchema),
    defaultValues: {
      type: 'cupom_fiscal',
      customerName: '',
      customerDocument: '',
      includeCustomerInfo: false,
      paymentMethod: 'dinheiro',
    },
  });
  
  const includeCustomerInfo = form.watch('includeCustomerInfo');
  
  const emitirDocumentoMutation = useMutation({
    mutationFn: async (data: DocumentoFiscalFormValues) => {
      // Formatar os itens para o formato esperado pela API
      const fiscalItems = orderItems.map(item => ({
        id: item.id || item.productId,
        code: item.code || item.id.toString() || item.productId.toString(),
        description: item.name || item.productName || item.description,
        quantity: item.quantity,
        unitPrice: item.price || item.unitPrice,
        totalPrice: (item.quantity * (item.price || item.unitPrice)),
        unitOfMeasure: 'UN',
        ncm: '00000000', // Código NCM padrão
        cfop: '5102',    // CFOP padrão para venda
        taxAmount: 0,    // Imposto (a ser calculado em implementação real)
      }));
      
      const documentData = {
        type: data.type,
        organizationId,
        customerName: data.includeCustomerInfo ? data.customerName : 'Consumidor Final',
        customerDocument: data.includeCustomerInfo ? data.customerDocument : null,
        orderId,
        totalAmount: orderTotal,
        paymentMethod: data.paymentMethod,
        items: fiscalItems,
        status: 'emitida',
      };
      
      return apiRequest('/api/fiscal/documents', 'POST', documentData);
    },
    onSuccess: (data) => {
      toast({
        title: 'Documento fiscal emitido com sucesso',
        description: `O documento fiscal foi emitido e enviado para impressão.`,
      });
      
      setOpen(false);
      
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error: any) => {
      console.error('Erro ao emitir documento fiscal:', error);
      toast({
        title: 'Erro ao emitir documento fiscal',
        description: error.message || 'Ocorreu um erro ao tentar emitir o documento fiscal. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
  
  function onSubmit(data: DocumentoFiscalFormValues) {
    emitirDocumentoMutation.mutate(data);
  }
  
  const getDocumentoLabel = (tipo: string) => {
    switch(tipo) {
      case 'cupom_fiscal': return 'Cupom Fiscal';
      case 'nfce': return 'NFC-e (Nota Fiscal de Consumidor Eletrônica)';
      case 'nfe': return 'NF-e (Nota Fiscal Eletrônica)';
      case 'nfse': return 'NFS-e (Nota Fiscal de Serviço Eletrônica)';
      default: return 'Documento Fiscal';
    }
  };
  
  const getFormaPagamentoLabel = (forma: string) => {
    switch(forma) {
      case 'dinheiro': return 'Dinheiro';
      case 'cartao_credito': return 'Cartão de Crédito';
      case 'cartao_debito': return 'Cartão de Débito';
      case 'pix': return 'PIX';
      case 'outro': return 'Outro';
      default: return 'Forma de Pagamento';
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={className}
          disabled={disabled}
        >
          <Receipt className="mr-2 h-4 w-4" /> 
          Emitir Documento Fiscal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Emitir Documento Fiscal</DialogTitle>
          <DialogDescription>
            Preencha as informações para emitir o documento fiscal para este pedido.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Documento</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cupom_fiscal">Cupom Fiscal</SelectItem>
                      <SelectItem value="nfce">NFC-e (Nota Fiscal de Consumidor Eletrônica)</SelectItem>
                      <SelectItem value="nfe">NF-e (Nota Fiscal Eletrônica)</SelectItem>
                      <SelectItem value="nfse">NFS-e (Nota Fiscal de Serviço Eletrônica)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Selecione o tipo de documento fiscal a ser emitido.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de Pagamento</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a forma de pagamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                      <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Como o cliente pagou por este pedido.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="includeCustomerInfo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Incluir dados do cliente no documento
                    </FormLabel>
                    <FormDescription>
                      Se marcado, o documento será emitido com os dados do cliente.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            {includeCustomerInfo && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Cliente</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do cliente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="customerDocument"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF/CNPJ</FormLabel>
                      <FormControl>
                        <Input placeholder="CPF ou CNPJ do cliente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                disabled={emitirDocumentoMutation.isPending}
              >
                {emitirDocumentoMutation.isPending ? (
                  <>Emitindo documento...</>
                ) : (
                  <>
                    <Printer className="mr-2 h-4 w-4" />
                    Emitir e Imprimir
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}