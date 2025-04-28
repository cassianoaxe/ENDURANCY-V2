import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Search, Plus, Download, Printer, MoreVertical, FileText, Eye, Calendar, CheckCircle, CreditCard, DollarSign, Receipt } from 'lucide-react';

// Tipos
interface Payment {
  id: number;
  invoiceId?: number;
  invoiceNumber?: string;
  clientName: string;
  amount: number;
  paymentMethod: 'credit_card' | 'bank_transfer' | 'pix' | 'cash' | 'other';
  paymentDate: string;
  status: 'confirmed' | 'pending' | 'failed' | 'refunded';
  notes?: string;
  receiptUrl?: string;
}

export default function FinanceiroPagamentos() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Form states para registrar novo pagamento
  const [newPaymentClientName, setNewPaymentClientName] = useState('');
  const [newPaymentInvoiceNumber, setNewPaymentInvoiceNumber] = useState('');
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState('pix');
  const [newPaymentDate, setNewPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [newPaymentNotes, setNewPaymentNotes] = useState('');

  useEffect(() => {
    // Carregar dados
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock data para demonstração
    const mockPayments = [
      {
        id: 1,
        invoiceId: 1,
        invoiceNumber: 'INV-2025-001',
        clientName: 'Laboratório MedCanna',
        amount: 2850.00,
        paymentMethod: 'bank_transfer' as const,
        paymentDate: '2025-04-12',
        status: 'confirmed' as const,
        notes: 'Pagamento recebido via transferência bancária',
        receiptUrl: 'https://example.com/receipts/receipt-1.pdf'
      },
      {
        id: 2,
        invoiceId: 4,
        invoiceNumber: 'INV-2025-004',
        clientName: 'HempMed Brasil',
        amount: 1500.00,
        paymentMethod: 'pix' as const,
        paymentDate: '2025-04-25',
        status: 'pending' as const,
        notes: 'Pagamento parcial da fatura'
      },
      {
        id: 3,
        clientName: 'Universidade Federal',
        amount: 1200.00,
        paymentMethod: 'credit_card' as const,
        paymentDate: '2025-04-18',
        status: 'confirmed' as const,
        notes: 'Pagamento de treinamento',
        receiptUrl: 'https://example.com/receipts/receipt-3.pdf'
      },
      {
        id: 4,
        invoiceId: 3,
        invoiceNumber: 'INV-2025-003',
        clientName: 'Associação Esperança',
        amount: 1890.00,
        paymentMethod: 'pix' as const,
        paymentDate: '2025-04-20',
        status: 'confirmed' as const,
        receiptUrl: 'https://example.com/receipts/receipt-4.pdf'
      },
      {
        id: 5,
        clientName: 'Centro de Pesquisa Canábica',
        amount: 3500.00,
        paymentMethod: 'bank_transfer' as const,
        paymentDate: '2025-04-05',
        status: 'refunded' as const,
        notes: 'Reembolso integral por cancelamento'
      }
    ];

    setPayments(mockPayments);
  };

  // Funções para gerenciar pagamentos
  const viewPayment = (payment: Payment) => {
    setCurrentPayment(payment);
    setViewDialogOpen(true);
  };

  const createNewPayment = () => {
    // Validação básica
    if (!newPaymentClientName || !newPaymentAmount || !newPaymentMethod || !newPaymentDate) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(newPaymentAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Valor inválido",
        description: "O valor deve ser um número positivo",
        variant: "destructive",
      });
      return;
    }

    const newPayment: Payment = {
      id: Math.max(0, ...payments.map(payment => payment.id)) + 1,
      clientName: newPaymentClientName,
      amount,
      paymentMethod: newPaymentMethod as any,
      paymentDate: newPaymentDate,
      status: 'confirmed',
      notes: newPaymentNotes,
    };

    if (newPaymentInvoiceNumber) {
      newPayment.invoiceNumber = newPaymentInvoiceNumber;
      // Aqui poderia buscar o ID da fatura pelo número
      newPayment.invoiceId = 999; // ID fictício
    }

    setPayments([...payments, newPayment]);
    resetNewPaymentForm();
    setCreateDialogOpen(false);
    
    toast({
      title: "Pagamento registrado",
      description: "O pagamento foi registrado com sucesso",
    });
  };

  const resetNewPaymentForm = () => {
    setNewPaymentClientName('');
    setNewPaymentInvoiceNumber('');
    setNewPaymentAmount('');
    setNewPaymentMethod('pix');
    setNewPaymentDate(new Date().toISOString().split('T')[0]);
    setNewPaymentNotes('');
  };

  // Filtros
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.invoiceNumber && payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (payment.notes && payment.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Função para exibir o ícone do método de pagamento
  const renderPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard className="h-4 w-4" />;
      case 'bank_transfer':
        return <DollarSign className="h-4 w-4" />;
      case 'pix':
        return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 4C18.8 4 16.9 5.6 16.9 5.6L11.9 10.7L7.1 5.9C7.1 5.9 5.8 4 3 4C0.2 4 0 6.3 0 6.3C0 8.8 2.1 10.8 2.1 10.8L11.8 20.3L21.6 10.7C21.6 10.7 24 8.6 24 6.1C24 6.1 23.2 4 21 4Z" fill="currentColor" />
        </svg>;
      case 'cash':
        return <Receipt className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'credit_card': return 'Cartão de Crédito';
      case 'bank_transfer': return 'Transferência Bancária';
      case 'pix': return 'PIX';
      case 'cash': return 'Dinheiro';
      default: return 'Outro';
    }
  };

  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pagamentos</h1>
          <p className="text-gray-500">Registre e acompanhe todos os pagamentos recebidos</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Registrar Pagamento
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between my-4">
        <div className="flex w-full sm:w-auto gap-2">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Buscar pagamentos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="confirmed">Confirmados</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="failed">Falha</SelectItem>
              <SelectItem value="refunded">Estornados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-lg font-medium text-blue-800">Histórico de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-blue-50">
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fatura</TableHead>
                <TableHead className="text-center">Método</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{new Date(payment.paymentDate).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="font-medium">{payment.clientName}</TableCell>
                  <TableCell>{payment.invoiceNumber || "-"}</TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center justify-center p-1.5 bg-gray-100 rounded-md">
                      {renderPaymentMethodIcon(payment.paymentMethod)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        payment.status === 'confirmed' && "bg-green-50 text-green-700 border-green-200",
                        payment.status === 'pending' && "bg-yellow-50 text-yellow-700 border-yellow-200",
                        payment.status === 'failed' && "bg-red-50 text-red-700 border-red-200",
                        payment.status === 'refunded' && "bg-gray-50 text-gray-700 border-gray-200"
                      )}
                    >
                      {
                        payment.status === 'confirmed' ? 'Confirmado' :
                        payment.status === 'pending' ? 'Pendente' :
                        payment.status === 'failed' ? 'Falha' :
                        'Estornado'
                      }
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewPayment(payment)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        {payment.status === 'confirmed' && payment.receiptUrl && (
                          <DropdownMenuItem onClick={() => window.open(payment.receiptUrl, '_blank')}>
                            <Download className="mr-2 h-4 w-4" />
                            Baixar Comprovante
                          </DropdownMenuItem>
                        )}
                        {payment.invoiceId && (
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            Ver Fatura
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog para visualizar detalhes do pagamento */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Pagamento</DialogTitle>
          </DialogHeader>
          {currentPayment && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-500">Data</div>
                  <div>{new Date(currentPayment.paymentDate).toLocaleDateString('pt-BR')}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-500">Status</div>
                  <Badge
                    variant="outline"
                    className={cn(
                      currentPayment.status === 'confirmed' && "bg-green-50 text-green-700 border-green-200",
                      currentPayment.status === 'pending' && "bg-yellow-50 text-yellow-700 border-yellow-200",
                      currentPayment.status === 'failed' && "bg-red-50 text-red-700 border-red-200",
                      currentPayment.status === 'refunded' && "bg-gray-50 text-gray-700 border-gray-200"
                    )}
                  >
                    {
                      currentPayment.status === 'confirmed' ? 'Confirmado' :
                      currentPayment.status === 'pending' ? 'Pendente' :
                      currentPayment.status === 'failed' ? 'Falha' :
                      'Estornado'
                    }
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-semibold text-gray-500">Cliente</div>
                  <div>{currentPayment.clientName}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-500">Valor</div>
                  <div>R$ {currentPayment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-500">Método de Pagamento</div>
                  <div className="flex items-center gap-2">
                    {renderPaymentMethodIcon(currentPayment.paymentMethod)}
                    <span>{getPaymentMethodName(currentPayment.paymentMethod)}</span>
                  </div>
                </div>
                {currentPayment.invoiceNumber && (
                  <div>
                    <div className="text-sm font-semibold text-gray-500">Fatura</div>
                    <div>{currentPayment.invoiceNumber}</div>
                  </div>
                )}
              </div>

              {currentPayment.notes && (
                <div>
                  <div className="text-sm font-semibold text-gray-500">Observações</div>
                  <div className="text-gray-700">{currentPayment.notes}</div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                {currentPayment.receiptUrl && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(currentPayment.receiptUrl, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Comprovante
                  </Button>
                )}
                {currentPayment.invoiceId && (
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Ver Fatura
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para criar novo pagamento */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Registrar Novo Pagamento</DialogTitle>
            <DialogDescription>
              Preencha as informações para registrar um novo pagamento
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientName" className="text-right">
                Cliente
              </Label>
              <Input
                id="clientName"
                value={newPaymentClientName}
                onChange={(e) => setNewPaymentClientName(e.target.value)}
                className="col-span-3"
                placeholder="Nome do cliente"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="invoiceNumber" className="text-right">
                Fatura (opcional)
              </Label>
              <Input
                id="invoiceNumber"
                value={newPaymentInvoiceNumber}
                onChange={(e) => setNewPaymentInvoiceNumber(e.target.value)}
                className="col-span-3"
                placeholder="Número da fatura"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Valor (R$)
              </Label>
              <Input
                id="amount"
                value={newPaymentAmount}
                onChange={(e) => setNewPaymentAmount(e.target.value)}
                className="col-span-3"
                placeholder="0,00"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentMethod" className="text-right">
                Método
              </Label>
              <Select value={newPaymentMethod} onValueChange={setNewPaymentMethod}>
                <SelectTrigger id="paymentMethod" className="col-span-3">
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                  <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentDate" className="text-right">
                Data
              </Label>
              <Input
                id="paymentDate"
                type="date"
                value={newPaymentDate}
                onChange={(e) => setNewPaymentDate(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right pt-2">
                Observações
              </Label>
              <Textarea
                id="notes"
                value={newPaymentNotes}
                onChange={(e) => setNewPaymentNotes(e.target.value)}
                className="col-span-3"
                placeholder="Informações adicionais sobre o pagamento"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={createNewPayment}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Registrar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}