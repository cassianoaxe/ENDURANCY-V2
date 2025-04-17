import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  Wallet,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Download,
  AlertCircle,
  Filter,
  Calendar,
  Copy,
  Receipt,
  PlusCircle,
  XCircle,
  Share2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import PatientLayout from '@/components/layout/PatientLayout';

// Interfaces
interface PaymentMethod {
  id: string;
  type: 'credit' | 'pix' | 'boleto';
  label: string;
  info: string;
  default?: boolean;
  expiryDate?: string;
  icon: React.ReactNode;
}

interface Transaction {
  id: string;
  description: string;
  date: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  orderNumber?: string;
  paymentMethod: 'credit' | 'pix' | 'boleto';
}

interface Invoice {
  id: string;
  orderNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

// Mock data
const paymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'credit',
    label: 'Cartão de crédito principal',
    info: 'Mastercard •••• 4589',
    default: true,
    expiryDate: '12/2027',
    icon: <CreditCard className="h-5 w-5" />
  },
  {
    id: '2',
    type: 'credit',
    label: 'Cartão secundário',
    info: 'Visa •••• 1234',
    expiryDate: '05/2026',
    icon: <CreditCard className="h-5 w-5" />
  },
  {
    id: '3',
    type: 'pix',
    label: 'PIX',
    info: 'CPF: •••.123.456-••',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.6666 2.66669L14.3333 5.33335L11.6666 8.00002" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1.66663 13.3334V9.33335C1.66663 8.27234 2.07901 7.25472 2.81294 6.52079C3.54687 5.78686 4.5645 5.37335 5.62536 5.37335H14.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  },
  {
    id: '4',
    type: 'boleto',
    label: 'Boleto Bancário',
    info: 'Gerar novo código',
    icon: <Receipt className="h-5 w-5" />
  }
];

const transactions: Transaction[] = [
  {
    id: '1',
    description: 'Compra de medicamentos',
    date: '16/04/2025',
    amount: 289.99,
    status: 'completed',
    orderNumber: 'PED-001-2025',
    paymentMethod: 'credit'
  },
  {
    id: '2',
    description: 'Compra de óleo CBD 1500mg',
    date: '10/04/2025',
    amount: 179.99,
    status: 'completed',
    orderNumber: 'PED-002-2025',
    paymentMethod: 'pix'
  },
  {
    id: '3',
    description: 'Compra de produtos variados',
    date: '15/04/2025',
    amount: 239.98,
    status: 'pending',
    orderNumber: 'PED-003-2025',
    paymentMethod: 'boleto'
  },
  {
    id: '4',
    description: 'Tentativa de compra - cartão recusado',
    date: '14/04/2025',
    amount: 99.99,
    status: 'failed',
    paymentMethod: 'credit'
  }
];

const invoices: Invoice[] = [
  {
    id: '1',
    orderNumber: 'PED-001-2025',
    date: '05/04/2025',
    dueDate: '05/04/2025',
    amount: 489.97,
    status: 'paid',
    items: [
      { name: 'Full Spectrum 3000mg', quantity: 1, price: 289.99 },
      { name: 'Pomada CBD 500mg', quantity: 2, price: 99.99 }
    ]
  },
  {
    id: '2',
    orderNumber: 'PED-002-2025',
    date: '10/04/2025',
    dueDate: '10/04/2025',
    amount: 179.99,
    status: 'paid',
    items: [
      { name: 'Broad Spectrum 1500mg', quantity: 1, price: 179.99 }
    ]
  },
  {
    id: '3',
    orderNumber: 'PED-003-2025',
    date: '15/04/2025',
    dueDate: '20/04/2025',
    amount: 239.98,
    status: 'pending',
    items: [
      { name: 'Isolado CBD 1000mg', quantity: 1, price: 149.99 },
      { name: 'Spray Sublingual 500mg', quantity: 1, price: 89.99 }
    ]
  }
];

// Componente para o card de método de pagamento
const PaymentMethodCard: React.FC<{ method: PaymentMethod, onRemove: () => void }> = ({ method, onRemove }) => {
  return (
    <Card className={`relative ${method.default ? 'border-primary' : ''}`}>
      {method.default && (
        <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3">
          <Badge className="bg-primary text-primary-foreground">
            Padrão
          </Badge>
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              {method.icon}
            </div>
            <div>
              <CardTitle className="text-base">{method.label}</CardTitle>
              <CardDescription>{method.info}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-0">
        {method.expiryDate && (
          <div className="text-sm text-muted-foreground">
            Validade: {method.expiryDate}
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-between pt-4">
        {!method.default ? (
          <Button variant="outline" size="sm">
            Definir como padrão
          </Button>
        ) : (
          <div></div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {method.type !== 'boleto' && method.type !== 'pix' && (
              <DropdownMenuItem>Editar</DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onRemove} className="text-destructive">
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
};

// Componente para a página de pagamentos
const PagamentosPage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("methods");
  const [paymentMethodsList, setPaymentMethodsList] = useState<PaymentMethod[]>(paymentMethods);

  // Função para remover um método de pagamento
  const handleRemovePaymentMethod = (id: string) => {
    toast({
      title: "Método de pagamento removido",
      description: "O método de pagamento foi removido com sucesso.",
    });
    setPaymentMethodsList(paymentMethodsList.filter(method => method.id !== id));
  };

  const handleAddPaymentMethod = () => {
    toast({
      title: "Adicionar método de pagamento",
      description: "Funcionalidade não implementada neste protótipo.",
    });
  };

  // Função para copiar código de boleto
  const handleCopyCode = () => {
    toast({
      title: "Código copiado!",
      description: "O código foi copiado para a área de transferência.",
    });
  };

  // Função para baixar comprovante
  const handleDownloadReceipt = (id: string) => {
    toast({
      title: "Download iniciado",
      description: "O comprovante está sendo baixado.",
    });
  };

  // Função para compartilhar comprovante
  const handleShareReceipt = (id: string) => {
    toast({
      title: "Compartilhar comprovante",
      description: "Funcionalidade não implementada neste protótipo.",
    });
  };

  // Status das transações com ícones e cores
  const getTransactionStatusInfo = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return { icon: <CheckCircle2 className="h-4 w-4" />, label: 'Concluído', color: 'bg-green-500' };
      case 'pending':
        return { icon: <Clock className="h-4 w-4" />, label: 'Pendente', color: 'bg-yellow-500' };
      case 'failed':
        return { icon: <XCircle className="h-4 w-4" />, label: 'Falhou', color: 'bg-red-500' };
    }
  };

  // Status das faturas com ícones e cores
  const getInvoiceStatusInfo = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return { icon: <CheckCircle2 className="h-4 w-4" />, label: 'Pago', color: 'bg-green-500' };
      case 'pending':
        return { icon: <Clock className="h-4 w-4" />, label: 'Pendente', color: 'bg-yellow-500' };
      case 'overdue':
        return { icon: <AlertCircle className="h-4 w-4" />, label: 'Atrasado', color: 'bg-red-500' };
    }
  };

  // Renderiza ícone pelo tipo de pagamento
  const getPaymentMethodIcon = (method: Transaction['paymentMethod']) => {
    switch (method) {
      case 'credit':
        return <CreditCard className="h-4 w-4" />;
      case 'pix':
        return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.6666 2.66669L14.3333 5.33335L11.6666 8.00002" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M1.66663 13.3334V9.33335C1.66663 8.27234 2.07901 7.25472 2.81294 6.52079C3.54687 5.78686 4.5645 5.37335 5.62536 5.37335H14.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>;
      case 'boleto':
        return <Receipt className="h-4 w-4" />;
    }
  };

  return (
    <PatientLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Pagamentos</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="methods">Métodos de Pagamento</TabsTrigger>
            <TabsTrigger value="transactions">Histórico de Transações</TabsTrigger>
            <TabsTrigger value="invoices">Faturas</TabsTrigger>
          </TabsList>
          
          {/* Métodos de Pagamento */}
          <TabsContent value="methods">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {paymentMethodsList.map((method) => (
                <PaymentMethodCard 
                  key={method.id} 
                  method={method} 
                  onRemove={() => handleRemovePaymentMethod(method.id)} 
                />
              ))}
              
              <Card className="flex flex-col items-center justify-center h-full min-h-[160px] border-dashed cursor-pointer hover:bg-muted/50 transition-colors" onClick={handleAddPaymentMethod}>
                <div className="p-6 text-center">
                  <PlusCircle className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                  <h3 className="font-medium">Adicionar novo método de pagamento</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Cartão de crédito, PIX ou boleto
                  </p>
                </div>
              </Card>
            </div>
            
            {/* Pagamento pendente */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Pagamento Pendente</h2>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Pedido PED-003-2025</CardTitle>
                      <CardDescription>Aguardando pagamento via boleto</CardDescription>
                    </div>
                    <Badge className="bg-yellow-500">Pendente</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Valor total</p>
                        <p className="text-lg font-bold">R$ 239,98</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Vencimento</p>
                        <p className="font-medium">20/04/2025</p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-muted rounded-md">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Código de barras</span>
                        <Button variant="ghost" size="icon" onClick={handleCopyCode}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm font-mono">23790.12345 67890.101112 13141.516171 8 19202122</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={handleCopyCode}>
                    Copiar código
                  </Button>
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Baixar boleto
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* Histórico de Transações */}
          <TabsContent value="transactions">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Histórico de Transações</h2>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtrar
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Forma de pagamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => {
                    const statusInfo = getTransactionStatusInfo(transaction.status);
                    
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          {transaction.description}
                          {transaction.orderNumber && (
                            <div className="text-xs text-muted-foreground">
                              Pedido: {transaction.orderNumber}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {getPaymentMethodIcon(transaction.paymentMethod)}
                            <span className="ml-2">
                              {transaction.paymentMethod === 'credit' && 'Cartão de crédito'}
                              {transaction.paymentMethod === 'pix' && 'PIX'}
                              {transaction.paymentMethod === 'boleto' && 'Boleto'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusInfo.color} text-white flex w-fit items-center`}>
                            {statusInfo.icon}
                            <span className="ml-1">{statusInfo.label}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          R$ {transaction.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {transaction.status === 'completed' && (
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDownloadReceipt(transaction.id)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleShareReceipt(transaction.id)}
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {transaction.status === 'failed' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-xs"
                            >
                              Detalhes
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          {/* Faturas */}
          <TabsContent value="invoices">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Faturas</h2>
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Filtrar por data
              </Button>
            </div>
            
            <div className="space-y-4">
              {invoices.map((invoice) => {
                const statusInfo = getInvoiceStatusInfo(invoice.status);
                
                return (
                  <Card key={invoice.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            Pedido {invoice.orderNumber}
                          </CardTitle>
                          <CardDescription>
                            Emitido em {invoice.date}
                          </CardDescription>
                        </div>
                        <Badge className={`${statusInfo.color} text-white flex items-center`}>
                          {statusInfo.icon}
                          <span className="ml-1">{statusInfo.label}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Valor total:</span>
                          <span className="font-bold">R$ {invoice.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Data de vencimento:</span>
                          <span>{invoice.dueDate}</span>
                        </div>
                        <Separator />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Itens:</p>
                          {invoice.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.name}</span>
                              <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      {invoice.status === 'pending' ? (
                        <Button>Pagar agora</Button>
                      ) : (
                        <Button variant="outline" onClick={() => handleDownloadReceipt(invoice.id)}>
                          <Download className="mr-2 h-4 w-4" />
                          Baixar comprovante
                        </Button>
                      )}
                      <Button variant="ghost" onClick={() => handleShareReceipt(invoice.id)}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Compartilhar
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PatientLayout>
  );
};

export default PagamentosPage;