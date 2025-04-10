import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';
import { useParams } from 'wouter';
import { apiRequest } from '@lib/queryClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Printer, FileText, ReceiptText, Banknote, ShoppingBag } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PharmacistLayout from '@/components/layout/pharmacist/PharmacistLayout';

// Schema para emissão de documento fiscal
const documentEmissionSchema = z.object({
  type: z.enum(['nfce', 'cupom_fiscal']),
  customerName: z.string().optional(),
  customerDocument: z.string().optional(),
  paymentMethod: z.enum(['dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'outro']),
  documentItems: z.array(z.object({
    id: z.number(),
    description: z.string(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    totalPrice: z.number().min(0),
  })).min(1, "Pelo menos um item deve ser adicionado"),
  totalAmount: z.number().min(0.01),
});

type DocumentEmissionValues = z.infer<typeof documentEmissionSchema>;

const ModuloFiscal = () => {
  const [activeTab, setActiveTab] = useState('emissao');
  const [isEmissionDialogOpen, setIsEmissionDialogOpen] = useState(false);
  const { organizationId } = useParams<{ organizationId: string }>();

  // Obtém as configurações fiscais da organização
  const { data: fiscalConfig, isLoading } = useQuery({
    queryKey: ['/api/fiscal/config', organizationId],
    queryFn: async () => {
      try {
        const response = await apiRequest(`/api/fiscal/config/${organizationId}`, {
          method: 'GET',
        });
        return response;
      } catch (error) {
        console.error('Erro ao buscar configurações fiscais:', error);
        return null;
      }
    },
    enabled: !!organizationId,
  });

  // Obtém os documentos fiscais emitidos
  const { data: fiscalDocuments, isLoading: isLoadingDocuments } = useQuery({
    queryKey: ['/api/fiscal/documents', organizationId],
    queryFn: async () => {
      try {
        const response = await apiRequest(`/api/fiscal/documents/${organizationId}`, {
          method: 'GET',
        });
        return response || [];
      } catch (error) {
        console.error('Erro ao buscar documentos fiscais:', error);
        return [];
      }
    },
    enabled: !!organizationId,
  });

  // Mock para simular dados de pedidos
  const mockOrderData = {
    id: 12345,
    customerName: "Cliente da Farmácia",
    items: [
      { id: 1, description: "Medicamento A", quantity: 2, unitPrice: 45.90, totalPrice: 91.80 },
      { id: 2, description: "Medicamento B", quantity: 1, unitPrice: 28.50, totalPrice: 28.50 },
    ],
    totalAmount: 120.30,
  };

  // Formulário de emissão de documento fiscal
  const form = useForm<DocumentEmissionValues>({
    resolver: zodResolver(documentEmissionSchema),
    defaultValues: {
      type: 'cupom_fiscal',
      customerName: mockOrderData.customerName,
      customerDocument: '',
      paymentMethod: 'dinheiro',
      documentItems: mockOrderData.items,
      totalAmount: mockOrderData.totalAmount,
    },
  });

  // Mutação para emitir documento fiscal
  const emitDocumentMutation = useMutation({
    mutationFn: async (data: DocumentEmissionValues) => {
      return apiRequest(`/api/fiscal/documents`, {
        method: 'POST',
        data: {
          ...data,
          organizationId: parseInt(organizationId || '0'),
          orderId: mockOrderData.id,
        },
      });
    },
    onSuccess: () => {
      toast({
        title: 'Documento fiscal emitido',
        description: `${form.getValues('type') === 'nfce' ? 'NFC-e' : 'Cupom Fiscal'} emitido com sucesso.`,
        variant: 'default',
      });
      setIsEmissionDialogOpen(false);
    },
    onError: (error) => {
      console.error('Erro ao emitir documento fiscal:', error);
      toast({
        title: 'Erro ao emitir documento',
        description: 'Ocorreu um erro ao emitir o documento fiscal. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Função para emitir documento fiscal
  const onEmitDocument = (data: DocumentEmissionValues) => {
    emitDocumentMutation.mutate(data);
  };

  return (
    <PharmacistLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Módulo Fiscal</h1>
          <Button onClick={() => setIsEmissionDialogOpen(true)}>
            <ReceiptText className="h-4 w-4 mr-2" /> Emitir Documento
          </Button>
        </div>

        <div className="grid gap-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="emissao" className="flex items-center gap-2">
                <ReceiptText className="h-4 w-4" /> Emissão
              </TabsTrigger>
              <TabsTrigger value="historico" className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> Histórico
              </TabsTrigger>
              <TabsTrigger value="impressora" className="flex items-center gap-2">
                <Printer className="h-4 w-4" /> Impressora
              </TabsTrigger>
            </TabsList>

            {/* Aba de Emissão */}
            <TabsContent value="emissao">
              <Card>
                <CardHeader>
                  <CardTitle>Emissão de Documentos Fiscais</CardTitle>
                  <CardDescription>
                    Emita notas fiscais eletrônicas (NFC-e) e cupons fiscais para suas vendas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert className="mb-4">
                    <AlertTitle className="flex items-center gap-2">
                      <Printer className="h-5 w-5" />
                      <span>Impressora configurada</span>
                    </AlertTitle>
                    <AlertDescription>
                      {fiscalConfig?.printerModel 
                        ? `Sua impressora está configurada como ${fiscalConfig.printerModel} na porta ${fiscalConfig.printerPort}.`
                        : "Nenhuma impressora fiscal configurada. Entre em contato com o administrador."
                      }
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-md">Cupom Fiscal</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Emita um cupom fiscal para vendas no balcão de forma rápida e simples.
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          onClick={() => {
                            form.setValue('type', 'cupom_fiscal');
                            setIsEmissionDialogOpen(true);
                          }}
                        >
                          <ReceiptText className="h-4 w-4 mr-2" /> Emitir Cupom
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-md">Nota Fiscal Eletrônica (NFC-e)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Emita uma NFC-e completa para vendas que exigem identificação do cliente.
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            form.setValue('type', 'nfce');
                            setIsEmissionDialogOpen(true);
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" /> Emitir NFC-e
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Últimas Vendas</h3>
                    <div className="rounded-md border">
                      <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                          <thead>
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                              <th className="h-12 px-4 text-left align-middle font-medium">Pedido</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Cliente</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Valor</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                              <th className="h-12 px-4 text-right align-middle font-medium">Documento</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                              <td className="p-4 align-middle">#{mockOrderData.id}</td>
                              <td className="p-4 align-middle">{mockOrderData.customerName}</td>
                              <td className="p-4 align-middle">R$ {mockOrderData.totalAmount.toFixed(2)}</td>
                              <td className="p-4 align-middle">
                                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                  Finalizado
                                </span>
                              </td>
                              <td className="p-4 align-middle text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => setIsEmissionDialogOpen(true)}>
                                    <ReceiptText className="h-4 w-4 mr-2" /> Emitir
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba de Histórico */}
            <TabsContent value="historico">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Documentos Fiscais</CardTitle>
                  <CardDescription>
                    Visualize e reimprima documentos fiscais emitidos.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Label htmlFor="search-document">Buscar documento</Label>
                        <Input id="search-document" placeholder="Número, cliente ou data..." />
                      </div>
                      <Button className="mt-7">Buscar</Button>
                    </div>

                    <div className="rounded-md border mt-4">
                      <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                          <thead>
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                              <th className="h-12 px-4 text-left align-middle font-medium">Número</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Tipo</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Cliente</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Data</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Valor</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                              <th className="h-12 px-4 text-right align-middle font-medium">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {isLoadingDocuments ? (
                              <tr>
                                <td colSpan={7} className="p-4 text-center">Carregando documentos...</td>
                              </tr>
                            ) : (fiscalDocuments && fiscalDocuments.length > 0) ? (
                              // Exibiria documentos reais aqui, mas usaremos um mock por enquanto
                              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <td className="p-4 align-middle">000001</td>
                                <td className="p-4 align-middle">Cupom Fiscal</td>
                                <td className="p-4 align-middle">Cliente da Farmácia</td>
                                <td className="p-4 align-middle">10/04/2025</td>
                                <td className="p-4 align-middle">R$ 120,30</td>
                                <td className="p-4 align-middle">
                                  <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                    Emitido
                                  </span>
                                </td>
                                <td className="p-4 align-middle text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <Printer className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              <tr>
                                <td colSpan={7} className="p-4 text-center">Nenhum documento fiscal encontrado.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba de Impressora */}
            <TabsContent value="impressora">
              <Card>
                <CardHeader>
                  <CardTitle>Configuração da Impressora</CardTitle>
                  <CardDescription>
                    Gerencie sua impressora fiscal e realize testes de impressão.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-6">
                    <AlertTitle className="flex items-center gap-2">
                      <Printer className="h-5 w-5" />
                      <span>Status da Impressora</span>
                    </AlertTitle>
                    <AlertDescription>
                      {fiscalConfig?.printerModel 
                        ? <span className="text-green-600">Impressora fiscal {fiscalConfig.printerModel} está configurada e pronta para uso.</span>
                        : <span className="text-amber-600">Nenhuma impressora fiscal configurada. Entre em contato com o administrador.</span>
                      }
                    </AlertDescription>
                  </Alert>

                  <div className="grid gap-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="text-lg font-medium">Informações da Impressora</h3>
                          <div className="mt-2 space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="font-medium">Modelo:</div>
                              <div className="capitalize">{fiscalConfig?.printerModel || 'Não configurado'}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="font-medium">Porta:</div>
                              <div>{fiscalConfig?.printerPort || 'Não configurado'}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="font-medium">Tipo:</div>
                              <div>Impressora Fiscal</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="font-medium">Status:</div>
                              <div className="text-green-600">Pronta</div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium">Operações</h3>
                          <div className="mt-2 grid grid-cols-2 gap-4">
                            <Button variant="outline">
                              <Printer className="h-4 w-4 mr-2" /> Testar Conexão
                            </Button>
                            <Button variant="outline">
                              <ReceiptText className="h-4 w-4 mr-2" /> Imprimir Teste
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1">
                        <img 
                          src="/placeholder-printer.png" 
                          alt="Impressora fiscal Bematech" 
                          className="rounded-md border p-2 max-w-[200px] mx-auto"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_18d0fbdb2c3%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3A%22Helvetica%20Neue%22%2C%20Helvetica%2C%20Arial%2C%20sans-serif%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_18d0fbdb2c3%22%3E%3Crect%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%23f8f9fa%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2273.234375%22%20y%3D%22104.65%22%3EImpressora%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                          }}
                        />
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div>
                      <h3 className="text-lg font-medium mb-4">Funções Adicionais</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline" className="justify-start">
                          <Banknote className="h-4 w-4 mr-2" /> Abrir Gaveta de Dinheiro
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <ShoppingBag className="h-4 w-4 mr-2" /> Relatório de Vendas do Dia
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <p className="text-sm text-muted-foreground">
                    As configurações de impressora são gerenciadas pelo administrador do sistema.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modal de Emissão de Documento Fiscal */}
      <Dialog open={isEmissionDialogOpen} onOpenChange={setIsEmissionDialogOpen}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {form.watch('type') === 'nfce' ? 'Emitir Nota Fiscal de Consumidor (NFC-e)' : 'Emitir Cupom Fiscal'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados para emissão do documento fiscal para esta venda.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEmitDocument)} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Documento</FormLabel>
                        <FormControl>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cupom_fiscal">Cupom Fiscal</SelectItem>
                              <SelectItem value="nfce">NFC-e</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
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
                        <FormControl>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dinheiro">Dinheiro</SelectItem>
                              <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                              <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                              <SelectItem value="pix">PIX</SelectItem>
                              <SelectItem value="outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch('type') === 'nfce' && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Cliente</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <Separator className="my-4" />
                
                <div>
                  <h3 className="font-medium mb-2">Itens do Documento</h3>
                  <div className="rounded-md border">
                    <div className="relative w-full overflow-auto">
                      <table className="w-full caption-bottom text-sm">
                        <thead>
                          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-10 px-4 text-left align-middle font-medium">Descrição</th>
                            <th className="h-10 px-4 text-right align-middle font-medium">Qtd</th>
                            <th className="h-10 px-4 text-right align-middle font-medium">Valor Un.</th>
                            <th className="h-10 px-4 text-right align-middle font-medium">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockOrderData.items.map((item, index) => (
                            <tr key={index} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                              <td className="p-3 align-middle">{item.description}</td>
                              <td className="p-3 align-middle text-right">{item.quantity}</td>
                              <td className="p-3 align-middle text-right">R$ {item.unitPrice.toFixed(2)}</td>
                              <td className="p-3 align-middle text-right">R$ {item.totalPrice.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={3} className="p-3 align-middle text-right font-medium">
                              Total:
                            </td>
                            <td className="p-3 align-middle text-right font-medium">
                              R$ {mockOrderData.totalAmount.toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEmissionDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={emitDocumentMutation.isPending}>
                  {emitDocumentMutation.isPending ? 'Emitindo...' : 'Emitir e Imprimir'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </PharmacistLayout>
  );
};

export default ModuloFiscal;