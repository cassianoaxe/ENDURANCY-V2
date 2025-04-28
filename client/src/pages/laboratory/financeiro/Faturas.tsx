import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Search, Plus, Eye, Send, Link as LinkIcon, CheckCircle, MoreVertical, FileText, Download, Printer, X, CreditCard } from 'lucide-react';

// Tipos
interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  sampleId?: string;
  testType?: string;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  clientId: number;
  clientName: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'canceled';
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  items: InvoiceItem[];
  notes?: string;
  paymentMethod?: string;
  paymentDate?: string;
  paymentLink?: string;
}

export default function FinanceiroFaturas() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    // Carregar dados das faturas
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock data para demonstração
    const mockInvoices = [
      {
        id: 1,
        invoiceNumber: 'INV-2025-001',
        clientId: 1,
        clientName: 'Laboratório MedCanna',
        status: 'paid' as const,
        issueDate: '2025-04-01',
        dueDate: '2025-04-15',
        totalAmount: 2850.00,
        items: [
          { id: 1, description: 'Análise de potência CBD', quantity: 3, unitPrice: 350, total: 1050, sampleId: 'CBD-001', testType: 'HPLC' },
          { id: 2, description: 'Análise de terpenos', quantity: 2, unitPrice: 450, total: 900, sampleId: 'CBD-002', testType: 'GCMS' },
          { id: 3, description: 'Análise de contaminantes', quantity: 3, unitPrice: 300, total: 900, sampleId: 'CBD-003', testType: 'LCMS' }
        ],
        paymentMethod: 'Transferência bancária'
      },
      {
        id: 2,
        invoiceNumber: 'INV-2025-002',
        clientId: 2,
        clientName: 'CannaPharma Brasil',
        status: 'sent' as const,
        issueDate: '2025-04-05',
        dueDate: '2025-05-05',
        totalAmount: 4200.00,
        paymentLink: 'https://pagamento.com/link-exemplo-1',
        items: [
          { id: 4, description: 'Análise completa - óleo CBD', quantity: 2, unitPrice: 1200, total: 2400, sampleId: 'CP-001', testType: 'HPLC+GCMS' },
          { id: 5, description: 'Análise de metais pesados', quantity: 3, unitPrice: 600, total: 1800, sampleId: 'CP-002', testType: 'ICP-MS' }
        ]
      },
      {
        id: 3,
        invoiceNumber: 'INV-2025-003',
        clientId: 3,
        clientName: 'Associação Esperança',
        status: 'overdue' as const,
        issueDate: '2025-03-10',
        dueDate: '2025-04-10',
        totalAmount: 1890.00,
        paymentLink: 'https://pagamento.com/link-exemplo-2',
        items: [
          { id: 6, description: 'Análise de estabilidade', quantity: 3, unitPrice: 630, total: 1890, sampleId: 'AE-001', testType: 'Cromatografia' }
        ]
      },
      {
        id: 4,
        invoiceNumber: 'INV-2025-004',
        clientId: 4,
        clientName: 'HempMed Brasil',
        status: 'draft' as const,
        issueDate: '2025-04-20',
        dueDate: '2025-05-20',
        totalAmount: 3450.00,
        items: [
          { id: 7, description: 'Análise de THC residual', quantity: 5, unitPrice: 450, total: 2250, sampleId: 'HM-001', testType: 'HPLC' },
          { id: 8, description: 'Análise microbiológica', quantity: 3, unitPrice: 400, total: 1200, sampleId: 'HM-002', testType: 'Microbiologia' }
        ]
      },
      {
        id: 5,
        invoiceNumber: 'INV-2025-005',
        clientId: 5,
        clientName: 'Farmácia de Manipulação Vida',
        status: 'canceled' as const,
        issueDate: '2025-03-25',
        dueDate: '2025-04-25',
        totalAmount: 750.00,
        items: [
          { id: 9, description: 'Validação de metodologia', quantity: 1, unitPrice: 750, total: 750, sampleId: 'FM-001', testType: 'Validação' }
        ],
        notes: 'Cancelado a pedido do cliente'
      }
    ];

    setInvoices(mockInvoices);
  };

  // Funções para gerenciar as faturas
  const viewInvoice = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setDialogOpen(true);
  };

  const sendInvoice = (invoice: Invoice) => {
    // Aqui seria a lógica para enviar a fatura por email
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoice.id ? { ...inv, status: 'sent' as const } : inv
    );
    setInvoices(updatedInvoices);
    
    toast({
      title: "Fatura enviada",
      description: `A fatura ${invoice.invoiceNumber} foi enviada para ${invoice.clientName}`,
    });
  };

  const markAsPaid = (invoice: Invoice) => {
    // Aqui seria a lógica para marcar como paga
    const today = new Date().toISOString().split('T')[0];
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoice.id ? { 
        ...inv, 
        status: 'paid' as const,
        paymentDate: today
      } : inv
    );
    setInvoices(updatedInvoices);
    
    toast({
      title: "Pagamento registrado",
      description: `A fatura ${invoice.invoiceNumber} foi marcada como paga`,
    });
  };

  const generatePaymentLink = (invoice: Invoice) => {
    // Gerar link de pagamento
    const paymentLinkUrl = `https://pagamento.com/fatura-${invoice.id}-${Date.now()}`;
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoice.id ? { ...inv, paymentLink: paymentLinkUrl } : inv
    );
    setInvoices(updatedInvoices);
    
    toast({
      title: "Link de pagamento gerado",
      description: "O link foi gerado e pode ser compartilhado com o cliente",
    });
  };

  // Filtrar as faturas
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Faturas</h1>
          <p className="text-gray-500">Gerencie todas as faturas de seus clientes</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Fatura
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between my-4">
        <div className="flex w-full sm:w-auto gap-2">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Buscar faturas..."
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
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="sent">Enviada</SelectItem>
              <SelectItem value="paid">Paga</SelectItem>
              <SelectItem value="overdue">Atrasada</SelectItem>
              <SelectItem value="canceled">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-lg font-medium text-blue-800">Faturas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <Table>
              <TableHeader className="bg-blue-50">
                <TableRow>
                  <TableHead className="w-[120px]">Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="w-[100px]">Emissão</TableHead>
                  <TableHead className="w-[100px]">Vencimento</TableHead>
                  <TableHead className="w-[120px] text-right">Valor</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[120px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.clientName}</TableCell>
                    <TableCell>{new Date(invoice.issueDate).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{new Date(invoice.dueDate).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      R$ {invoice.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          invoice.status === 'paid' && "bg-green-50 text-green-700 border-green-200",
                          invoice.status === 'sent' && "bg-blue-50 text-blue-700 border-blue-200",
                          invoice.status === 'draft' && "bg-gray-50 text-gray-700 border-gray-200",
                          invoice.status === 'overdue' && "bg-red-50 text-red-700 border-red-200",
                          invoice.status === 'canceled' && "bg-gray-50 text-gray-700 border-gray-200 line-through"
                        )}
                      >
                        {
                          invoice.status === 'paid' ? 'Paga' :
                          invoice.status === 'sent' ? 'Enviada' :
                          invoice.status === 'draft' ? 'Rascunho' :
                          invoice.status === 'overdue' ? 'Atrasada' :
                          'Cancelada'
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
                          <DropdownMenuItem onClick={() => viewInvoice(invoice)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </DropdownMenuItem>
                          {invoice.status !== 'paid' && invoice.status !== 'canceled' && (
                            <>
                              <DropdownMenuItem onClick={() => sendInvoice(invoice)}>
                                <Send className="mr-2 h-4 w-4" />
                                Enviar
                              </DropdownMenuItem>
                              {!invoice.paymentLink && (
                                <DropdownMenuItem onClick={() => generatePaymentLink(invoice)}>
                                  <LinkIcon className="mr-2 h-4 w-4" />
                                  Gerar Link
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => markAsPaid(invoice)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Marcar como Paga
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para visualizar fatura */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Fatura {currentInvoice?.invoiceNumber}</DialogTitle>
          </DialogHeader>
          {currentInvoice && (
            <div className="mt-4">
              <div className="flex justify-between mb-6">
                <div>
                  <h3 className="font-semibold">Cliente</h3>
                  <p>{currentInvoice.clientName}</p>
                </div>
                <div className="text-right">
                  <h3 className="font-semibold">Status</h3>
                  <Badge 
                    variant="outline"
                    className={cn(
                      currentInvoice.status === 'paid' && "bg-green-50 text-green-700 border-green-200",
                      currentInvoice.status === 'sent' && "bg-blue-50 text-blue-700 border-blue-200",
                      currentInvoice.status === 'draft' && "bg-gray-50 text-gray-700 border-gray-200",
                      currentInvoice.status === 'overdue' && "bg-red-50 text-red-700 border-red-200"
                    )}
                  >
                    {
                      currentInvoice.status === 'paid' ? 'Paga' :
                      currentInvoice.status === 'sent' ? 'Enviada' :
                      currentInvoice.status === 'draft' ? 'Rascunho' :
                      currentInvoice.status === 'overdue' ? 'Atrasada' :
                      'Cancelada'
                    }
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-semibold">Data de Emissão</h3>
                  <p>{new Date(currentInvoice.issueDate).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Data de Vencimento</h3>
                  <p>{new Date(currentInvoice.dueDate).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden mb-6">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Valor Unitário</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentInvoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right">
                          R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end mb-6">
                <div className="w-64">
                  <div className="flex justify-between py-2 border-t">
                    <span className="font-semibold">Total:</span>
                    <span className="font-semibold">
                      R$ {currentInvoice.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {currentInvoice.notes && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Observações</h3>
                  <p className="text-gray-600">{currentInvoice.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Fechar
                </Button>
                
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                
                <Button variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
                
                {currentInvoice.status !== 'paid' && currentInvoice.status !== 'canceled' && (
                  <>
                    <Button variant="outline" onClick={() => markAsPaid(currentInvoice)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como Paga
                    </Button>
                    
                    {!currentInvoice.paymentLink && (
                      <Button variant="outline" onClick={() => generatePaymentLink(currentInvoice)}>
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Gerar Link
                      </Button>
                    )}
                    
                    <Button onClick={() => sendInvoice(currentInvoice)}>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}