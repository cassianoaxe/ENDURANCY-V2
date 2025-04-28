import React, { useState, useEffect } from 'react';
import {
  CircleDollarSign,
  FileText,
  Plus,
  Trash2,
  Edit,
  Send,
  Mail,
  CreditCard,
  CheckCircle,
  Filter,
  Download,
  Search,
  ArrowUpDown,
  Eye,
  Receipt,
  Calendar,
  User,
  BarChart,
  ArrowRight,
  FileCheck,
  DollarSign,
  Link as LinkIcon,
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Interfaces
interface Invoice {
  id: number;
  invoiceNumber: string;
  clientId: number;
  clientName: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'canceled';
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paymentLink?: string;
  items: InvoiceItem[];
  paymentMethod?: string;
  notes?: string;
}

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  sampleId?: string;
  testType?: string;
}

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  documentType: 'cpf' | 'cnpj';
  documentNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  contactPerson?: string;
  status: 'active' | 'inactive';
}

interface PaymentLink {
  id: number;
  invoiceId: number;
  clientName: string;
  amount: number;
  description: string;
  url: string;
  expirationDate: string;
  status: 'active' | 'paid' | 'expired' | 'canceled';
  createdAt: string;
}

interface TestSample {
  id: number;
  sampleId: string;
  clientId: number;
  clientName: string;
  testType: string;
  receivedDate: string;
  completedDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'approved';
  price: number;
  invoiced: boolean;
  invoiceId?: number;
}

interface FinancialSummary {
  totalRevenue: number;
  pendingPayments: number;
  overduePayments: number;
  paidInvoices: number;
  invoicesThisMonth: number;
  revenueTrend: {
    month: string;
    revenue: number;
  }[];
  clientRevenue: {
    clientName: string;
    revenue: number;
  }[];
  serviceCategoryRevenue: {
    category: string;
    revenue: number;
  }[];
}

export default function LaboratoryFinanceiro() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('summary');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [testSamples, setTestSamples] = useState<TestSample[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    // Simulando carregamento de dados
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

    const mockClients = [
      {
        id: 1,
        name: 'Laboratório MedCanna',
        email: 'contato@medcanna.com.br',
        phone: '(11) 3456-7890',
        documentType: 'cnpj' as const,
        documentNumber: '12.345.678/0001-90',
        address: 'Av. Paulista, 1000',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
        contactPerson: 'Maria Silva',
        status: 'active' as const
      },
      {
        id: 2,
        name: 'CannaPharma Brasil',
        email: 'financeiro@cannapharma.com.br',
        phone: '(21) 2345-6789',
        documentType: 'cnpj' as const,
        documentNumber: '23.456.789/0001-01',
        address: 'Rua Voluntários da Pátria, 500',
        city: 'Rio de Janeiro',
        state: 'RJ',
        zipCode: '22270-010',
        contactPerson: 'João Pereira',
        status: 'active' as const
      },
      {
        id: 3,
        name: 'Associação Esperança',
        email: 'contato@esperanca.org',
        phone: '(31) 3456-7891',
        documentType: 'cnpj' as const,
        documentNumber: '34.567.890/0001-12',
        address: 'Av. Amazonas, 200',
        city: 'Belo Horizonte',
        state: 'MG',
        zipCode: '30180-001',
        contactPerson: 'Ana Ferreira',
        status: 'active' as const
      },
      {
        id: 4,
        name: 'HempMed Brasil',
        email: 'contato@hempmed.com.br',
        phone: '(41) 4567-8901',
        documentType: 'cnpj' as const,
        documentNumber: '45.678.901/0001-23',
        address: 'Av. Cândido de Abreu, 300',
        city: 'Curitiba',
        state: 'PR',
        zipCode: '80530-000',
        contactPerson: 'Roberto Santos',
        status: 'active' as const
      },
      {
        id: 5,
        name: 'Farmácia de Manipulação Vida',
        email: 'contato@farmaciavida.com.br',
        phone: '(51) 5678-9012',
        documentType: 'cnpj' as const,
        documentNumber: '56.789.012/0001-34',
        address: 'Rua dos Andradas, 400',
        city: 'Porto Alegre',
        state: 'RS',
        zipCode: '90020-010',
        contactPerson: 'Juliana Oliveira',
        status: 'inactive' as const
      }
    ];

    const mockPaymentLinks = [
      {
        id: 1,
        invoiceId: 2,
        clientName: 'CannaPharma Brasil',
        amount: 4200.00,
        description: 'Fatura INV-2025-002 - Análises laboratoriais',
        url: 'https://pagamento.com/link-exemplo-1',
        expirationDate: '2025-05-05',
        status: 'active' as const,
        createdAt: '2025-04-05'
      },
      {
        id: 2,
        invoiceId: 3,
        clientName: 'Associação Esperança',
        amount: 1890.00,
        description: 'Fatura INV-2025-003 - Análises de estabilidade',
        url: 'https://pagamento.com/link-exemplo-2',
        expirationDate: '2025-04-10',
        status: 'expired' as const,
        createdAt: '2025-03-10'
      },
      {
        id: 3,
        invoiceId: 0, // Link direto sem fatura
        clientName: 'Universidade Federal',
        amount: 1200.00,
        description: 'Treinamento HPLC avançado',
        url: 'https://pagamento.com/link-exemplo-3',
        expirationDate: '2025-05-15',
        status: 'active' as const,
        createdAt: '2025-04-15'
      }
    ];

    const mockTestSamples = [
      {
        id: 1,
        sampleId: 'AM-2025-001',
        clientId: 2,
        clientName: 'CannaPharma Brasil',
        testType: 'HPLC - Análise de CBD',
        receivedDate: '2025-04-20',
        status: 'completed' as const,
        price: 350.00,
        invoiced: false
      },
      {
        id: 2,
        sampleId: 'AM-2025-002',
        clientId: 2,
        clientName: 'CannaPharma Brasil',
        testType: 'HPLC - Análise de THC',
        receivedDate: '2025-04-20',
        status: 'completed' as const,
        price: 350.00,
        invoiced: false
      },
      {
        id: 3,
        sampleId: 'AM-2025-003',
        clientId: 2,
        clientName: 'CannaPharma Brasil',
        testType: 'Terpenos',
        receivedDate: '2025-04-20',
        status: 'in_progress' as const,
        price: 450.00,
        invoiced: false
      },
      {
        id: 4,
        sampleId: 'AM-2025-004',
        clientId: 3,
        clientName: 'Associação Esperança',
        testType: 'Análise completa',
        receivedDate: '2025-04-18',
        completedDate: '2025-04-22',
        status: 'approved' as const,
        price: 1200.00,
        invoiced: true,
        invoiceId: 3
      },
      {
        id: 5,
        sampleId: 'AM-2025-005',
        clientId: 1,
        clientName: 'Laboratório MedCanna',
        testType: 'Metais pesados',
        receivedDate: '2025-04-25',
        status: 'pending' as const,
        price: 600.00,
        invoiced: false
      }
    ];

    // Garantindo a tipagem correta ao definir os estados
    setInvoices(mockInvoices as Invoice[]);
    setClients(mockClients as Client[]);
    setPaymentLinks(mockPaymentLinks as PaymentLink[]);
    setTestSamples(mockTestSamples as TestSample[]);
    setFinancialSummary(mockFinancialSummary);
  };

  // Handlers
  const viewInvoice = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setDialogOpen(true);
  };

  const addSampleToInvoice = (sample: TestSample) => {
    // Criar uma nova fatura ou adicionar a uma existente
    if (currentInvoice) {
      // Adicionar à fatura atual
      const newItem: InvoiceItem = {
        id: Math.max(0, ...currentInvoice.items.map(item => item.id)) + 1,
        description: `${sample.testType} - ${sample.sampleId}`,
        quantity: 1,
        unitPrice: sample.price,
        total: sample.price,
        sampleId: sample.sampleId,
        testType: sample.testType
      };

      setCurrentInvoice({
        ...currentInvoice,
        items: [...currentInvoice.items, newItem],
        totalAmount: currentInvoice.totalAmount + sample.price
      });
    } else {
      // Criar nova fatura
      const today = new Date();
      const dueDate = new Date();
      dueDate.setDate(today.getDate() + 30); // Vencimento em 30 dias

      const newInvoiceObj: Invoice = {
        id: Math.max(0, ...invoices.map(inv => inv.id)) + 1,
        invoiceNumber: `INV-${today.getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
        clientId: sample.clientId,
        clientName: sample.clientName,
        status: 'draft',
        issueDate: today.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        totalAmount: sample.price,
        items: [
          {
            id: 1,
            description: `${sample.testType} - ${sample.sampleId}`,
            quantity: 1,
            unitPrice: sample.price,
            total: sample.price,
            sampleId: sample.sampleId,
            testType: sample.testType
          }
        ]
      };

      setInvoices([...invoices, newInvoiceObj]);
      setCurrentInvoice(newInvoiceObj);
      setDialogOpen(true);
    }
  };

  const sendInvoice = (invoice: Invoice) => {
    // Aqui seria a lógica para enviar a fatura por email
    // Por enquanto apenas atualiza o status
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoice.id ? { ...inv, status: 'sent' as const } : inv
    );
    setInvoices(updatedInvoices);
    
    toast({
      title: "Fatura enviada",
      description: `Fatura ${invoice.invoiceNumber} enviada com sucesso para ${invoice.clientName}`,
    });

    setDialogOpen(false);
  };

  const generatePaymentLink = (invoice: Invoice) => {
    // Gerar link de pagamento
    const today = new Date();
    const expirationDate = new Date(invoice.dueDate);
    
    const paymentLinkObj: PaymentLink = {
      id: Math.max(0, ...paymentLinks.map(link => link.id)) + 1,
      invoiceId: invoice.id,
      clientName: invoice.clientName,
      amount: invoice.totalAmount,
      description: `Fatura ${invoice.invoiceNumber} - Serviços laboratoriais`,
      url: `https://pagamento.com/link-${Math.random().toString(36).substring(2, 10)}`,
      expirationDate: expirationDate.toISOString().split('T')[0],
      status: 'active',
      createdAt: today.toISOString().split('T')[0]
    };

    const updatedInvoices = invoices.map(inv => 
      inv.id === invoice.id ? { ...inv, paymentLink: paymentLinkObj.url } : inv
    );

    setInvoices(updatedInvoices);
    setPaymentLinks([...paymentLinks, paymentLinkObj]);

    toast({
      title: "Link de pagamento gerado",
      description: `Link para fatura ${invoice.invoiceNumber} gerado com sucesso`,
    });
  };

  const markAsPaid = (invoice: Invoice) => {
    // Marcar fatura como paga
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoice.id ? { ...inv, status: 'paid' as const } : inv
    );
    setInvoices(updatedInvoices);

    // Atualizar links de pagamento associados
    const updatedLinks = paymentLinks.map(link => 
      link.invoiceId === invoice.id ? { ...link, status: 'paid' as const } : link
    );
    setPaymentLinks(updatedLinks);

    toast({
      title: "Fatura paga",
      description: `Fatura ${invoice.invoiceNumber} marcada como paga`,
    });

    setDialogOpen(false);
  };

  const editClient = (client: Client) => {
    setCurrentClient(client);
    // Abrir diálogo de edição
  };

  // Filtrar faturas
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento Financeiro</h1>
          <p className="text-gray-600 mt-1">
            Gerencie faturas, pagamentos e análise financeira do laboratório
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Fatura
          </Button>
        </div>
      </div>

      <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">
            <BarChart className="h-4 w-4 mr-2" />
            Resumo
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <FileText className="h-4 w-4 mr-2" />
            Faturas
          </TabsTrigger>
          <TabsTrigger value="payment-links">
            <LinkIcon className="h-4 w-4 mr-2" />
            Links de Pagamento
          </TabsTrigger>
          <TabsTrigger value="pending-tests">
            <FileCheck className="h-4 w-4 mr-2" />
            Testes a Faturar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          {financialSummary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Faturamento Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {financialSummary.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {financialSummary.paidInvoices} faturas pagas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Pagamentos Pendentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {financialSummary.pendingPayments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {financialSummary.invoicesThisMonth} faturas este mês
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Pagamentos em Atraso
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    R$ {financialSummary.overduePayments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {invoices.filter(inv => inv.status === 'overdue').length} faturas em atraso
                  </p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Tendência de Faturamento</CardTitle>
                  <CardDescription>Últimos 6 meses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] w-full">
                    {/* Aqui seria um gráfico de linha */}
                    <div className="flex h-full items-end space-x-2">
                      {financialSummary.revenueTrend.map((item, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div 
                            className="bg-blue-600 w-12 rounded-t-md" 
                            style={{ 
                              height: `${(item.revenue / Math.max(...financialSummary.revenueTrend.map(i => i.revenue))) * 170}px` 
                            }}
                          ></div>
                          <div className="text-xs mt-2">{item.month}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Clientes</CardTitle>
                  <CardDescription>Por faturamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {financialSummary.clientRevenue.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>{item.clientName.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{item.clientName}</span>
                        </div>
                        <span className="text-sm">
                          R$ {item.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="invoices">
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
            
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Fatura
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
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
                            <MoreVerticalIcon className="h-4 w-4" />
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
        </TabsContent>

        <TabsContent value="payment-links">
          <div className="flex justify-between items-center my-4">
            <div className="relative w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Buscar links de pagamento..."
                className="pl-8"
              />
            </div>
            
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Link
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Criação</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentLinks.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">{link.description}</TableCell>
                    <TableCell>{link.clientName}</TableCell>
                    <TableCell>
                      R$ {link.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>{new Date(link.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{new Date(link.expirationDate).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          link.status === 'paid' && "bg-green-50 text-green-700 border-green-200",
                          link.status === 'active' && "bg-blue-50 text-blue-700 border-blue-200",
                          link.status === 'expired' && "bg-amber-50 text-amber-700 border-amber-200",
                          link.status === 'canceled' && "bg-gray-50 text-gray-700 border-gray-200 line-through"
                        )}
                      >
                        {
                          link.status === 'paid' ? 'Pago' :
                          link.status === 'active' ? 'Ativo' :
                          link.status === 'expired' ? 'Expirado' :
                          'Cancelado'
                        }
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreVerticalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Reenviar Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <LinkIcon className="mr-2 h-4 w-4" />
                            Copiar Link
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="pending-tests">
          <div className="flex justify-between items-center my-4">
            <div className="relative w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Buscar amostras..."
                className="pl-8"
              />
            </div>
            
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Gerar Faturas
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Amostra</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo de Teste</TableHead>
                  <TableHead>Recebida em</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testSamples
                  .filter(sample => !sample.invoiced && 
                          (sample.status === 'completed' || sample.status === 'approved'))
                  .map((sample) => (
                    <TableRow key={sample.id}>
                      <TableCell className="font-medium">{sample.sampleId}</TableCell>
                      <TableCell>{sample.clientName}</TableCell>
                      <TableCell>{sample.testType}</TableCell>
                      <TableCell>{new Date(sample.receivedDate).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            sample.status === 'approved' && "bg-green-50 text-green-700 border-green-200",
                            sample.status === 'completed' && "bg-blue-50 text-blue-700 border-blue-200",
                            sample.status === 'in_progress' && "bg-amber-50 text-amber-700 border-amber-200",
                            sample.status === 'pending' && "bg-gray-50 text-gray-700 border-gray-200"
                          )}
                        >
                          {
                            sample.status === 'approved' ? 'Aprovado' :
                            sample.status === 'completed' ? 'Concluído' :
                            sample.status === 'in_progress' ? 'Em Progresso' :
                            'Pendente'
                          }
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        R$ {sample.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          className="h-8 px-2"
                          onClick={() => addSampleToInvoice(sample)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Faturar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog para visualizar fatura */}
      {currentInvoice && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center justify-between">
                <span>Fatura #{currentInvoice.invoiceNumber}</span>
                <Badge
                  variant="outline"
                  className={cn(
                    currentInvoice.status === 'paid' && "bg-green-50 text-green-700 border-green-200",
                    currentInvoice.status === 'sent' && "bg-blue-50 text-blue-700 border-blue-200",
                    currentInvoice.status === 'draft' && "bg-gray-50 text-gray-700 border-gray-200",
                    currentInvoice.status === 'overdue' && "bg-red-50 text-red-700 border-red-200",
                    currentInvoice.status === 'canceled' && "bg-gray-50 text-gray-700 border-gray-200 line-through"
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
              </DialogTitle>
              <DialogDescription>
                Detalhes da fatura para {currentInvoice.clientName}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-semibold mb-1">Cliente</h4>
                <p className="text-sm">{currentInvoice.clientName}</p>
                <p className="text-sm">{clients.find(c => c.id === currentInvoice.clientId)?.email}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1">Datas</h4>
                <p className="text-sm">Emissão: {new Date(currentInvoice.issueDate).toLocaleDateString('pt-BR')}</p>
                <p className="text-sm">Vencimento: {new Date(currentInvoice.dueDate).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden mb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead className="text-right">Preço Unit.</TableHead>
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

            <div className="flex justify-between items-start mb-4">
              <div className="w-1/2">
                {currentInvoice.notes && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Observações</h4>
                    <p className="text-sm">{currentInvoice.notes}</p>
                  </div>
                )}
              </div>
              <div className="w-1/2 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Subtotal:</span>
                  <span>
                    R$ {currentInvoice.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>
                    R$ {currentInvoice.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              {currentInvoice.status !== 'paid' && currentInvoice.status !== 'canceled' && (
                <>
                  <Button variant="outline" onClick={() => sendInvoice(currentInvoice)}>
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar por Email
                  </Button>
                  {!currentInvoice.paymentLink && (
                    <Button variant="outline" onClick={() => generatePaymentLink(currentInvoice)}>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Gerar Link de Pagamento
                    </Button>
                  )}
                  <Button onClick={() => markAsPaid(currentInvoice)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar como Paga
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Mock data para o resumo financeiro
const mockFinancialSummary: FinancialSummary = {
  totalRevenue: 24850.00,
  pendingPayments: 6090.00,
  overduePayments: 1890.00,
  paidInvoices: 15,
  invoicesThisMonth: 8,
  revenueTrend: [
    { month: 'Nov', revenue: 12500 },
    { month: 'Dez', revenue: 18750 },
    { month: 'Jan', revenue: 15000 },
    { month: 'Fev', revenue: 21000 },
    { month: 'Mar', revenue: 19500 },
    { month: 'Abr', revenue: 24850 },
  ],
  clientRevenue: [
    { clientName: 'Laboratório MedCanna', revenue: 8500 },
    { clientName: 'CannaPharma Brasil', revenue: 6200 },
    { clientName: 'HempMed Brasil', revenue: 4750 },
    { clientName: 'Associação Esperança', revenue: 3500 },
    { clientName: 'Farmácia de Manipulação Vida', revenue: 1900 },
  ],
  serviceCategoryRevenue: [
    { category: 'HPLC', revenue: 12500 },
    { category: 'Terpenos', revenue: 4800 },
    { category: 'Metais Pesados', revenue: 3600 },
    { category: 'Microbiologia', revenue: 2450 },
    { category: 'Outros', revenue: 1500 },
  ]
};

// Componente de ícone que faltava
function MoreVerticalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}