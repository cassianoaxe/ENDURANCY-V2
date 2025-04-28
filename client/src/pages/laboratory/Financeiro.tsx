import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Calendar,
  CalendarIcon,
  Check,
  CircleDollarSign,
  ClipboardCheck,
  Clock,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  FilterX,
  Link,
  ListFilter,
  Mail,
  MoreHorizontal,
  PieChart,
  Plus,
  Receipt,
  Search,
  Send,
  Share2,
  Tag,
  Trash2,
  Users,
  Wallet
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Tipos de dados
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

// Componente principal
export default function LaboratoryFinanceiro() {
  // Estado para os diferentes conjuntos de dados
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [pendingSamples, setPendingSamples] = useState<TestSample[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  
  // Estados para filtragem e ordenação
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [clientFilter, setClientFilter] = useState('all');
  
  // Estados para modais e diálogos
  const [showCreateInvoiceDialog, setShowCreateInvoiceDialog] = useState(false);
  const [showSendInvoiceDialog, setShowSendInvoiceDialog] = useState(false);
  const [showViewInvoiceDialog, setShowViewInvoiceDialog] = useState(false);
  const [showCreatePaymentLinkDialog, setShowCreatePaymentLinkDialog] = useState(false);
  const [showClientDialog, setShowClientDialog] = useState(false);
  
  // Estado para rastrear o item selecionado
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedSamples, setSelectedSamples] = useState<TestSample[]>([]);
  
  // Estados para criar nova fatura
  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({
    items: [],
    status: 'draft',
    issueDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(new Date().setDate(new Date().getDate() + 30)), 'yyyy-MM-dd'),
    totalAmount: 0
  });
  
  // Estado para abas ativas
  const [activeTab, setActiveTab] = useState('invoices');
  const [invoiceTab, setInvoiceTab] = useState('all');
  
  // Hooks
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  // Carregar dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Na implementação real, isso seria uma chamada à API
        // Simulação com dados fictícios para desenvolvimento
        setTimeout(() => {
          setInvoices(mockInvoices);
          setClients(mockClients);
          setPaymentLinks(mockPaymentLinks);
          setPendingSamples(mockPendingSamples);
          setFinancialSummary(mockFinancialSummary);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados financeiros.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  // Filtrar faturas com base nos filtros selecionados
  const filteredInvoices = invoices.filter(invoice => {
    // Filtro de busca por número da fatura ou nome do cliente
    const matchesSearch = 
      searchQuery === '' || 
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro por status
    const matchesStatus = 
      statusFilter === 'all' || 
      invoice.status === statusFilter;
    
    // Filtro por cliente
    const matchesClient = 
      clientFilter === 'all' || 
      invoice.clientId.toString() === clientFilter;
    
    // Filtro por data
    const matchesDate = 
      !dateFilter || 
      format(new Date(invoice.issueDate), 'yyyy-MM-dd') === format(dateFilter, 'yyyy-MM-dd');
    
    // Filtros por aba
    if (invoiceTab === 'pending') {
      return matchesSearch && matchesClient && matchesDate && (invoice.status === 'sent' || invoice.status === 'overdue');
    } else if (invoiceTab === 'paid') {
      return matchesSearch && matchesClient && matchesDate && invoice.status === 'paid';
    } else if (invoiceTab === 'draft') {
      return matchesSearch && matchesClient && matchesDate && invoice.status === 'draft';
    }
    
    return matchesSearch && matchesStatus && matchesClient && matchesDate;
  });
  
  // Filtrar amostras pendentes de faturamento
  const filteredPendingSamples = pendingSamples.filter(sample => {
    // Filtro de busca por ID da amostra ou nome do cliente
    const matchesSearch = 
      searchQuery === '' || 
      sample.sampleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sample.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro por cliente
    const matchesClient = 
      clientFilter === 'all' || 
      sample.clientId.toString() === clientFilter;
    
    // Apenas mostrar amostras não faturadas
    return matchesSearch && matchesClient && !sample.invoiced;
  });
  
  // Função para visualizar uma fatura
  const viewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowViewInvoiceDialog(true);
  };
  
  // Função para criar uma nova fatura
  const createInvoice = () => {
    // Reset do estado da nova fatura
    setNewInvoice({
      items: [],
      status: 'draft',
      issueDate: format(new Date(), 'yyyy-MM-dd'),
      dueDate: format(new Date(new Date().setDate(new Date().getDate() + 30)), 'yyyy-MM-dd'),
      totalAmount: 0
    });
    
    // Limpa amostras selecionadas
    setSelectedSamples([]);
    
    // Abre o diálogo
    setShowCreateInvoiceDialog(true);
  };
  
  // Função para adicionar uma amostra à nova fatura
  const addSampleToInvoice = (sample: TestSample) => {
    // Verifica se a amostra já foi selecionada
    if (selectedSamples.some(s => s.id === sample.id)) {
      // Remove a amostra das selecionadas
      setSelectedSamples(selectedSamples.filter(s => s.id !== sample.id));
      
      // Remove o item da fatura
      const updatedItems = newInvoice.items?.filter(item => item.sampleId !== sample.sampleId) || [];
      
      // Recalcula o valor total
      const totalAmount = updatedItems.reduce((sum, item) => sum + item.total, 0);
      
      setNewInvoice({
        ...newInvoice,
        items: updatedItems,
        totalAmount
      });
    } else {
      // Adiciona a amostra às selecionadas
      setSelectedSamples([...selectedSamples, sample]);
      
      // Cria um novo item para a fatura
      const newItem: InvoiceItem = {
        id: Date.now(), // Temporário até o backend gerar um ID real
        description: `Análise de ${sample.testType} - Amostra ${sample.sampleId}`,
        quantity: 1,
        unitPrice: sample.price,
        total: sample.price,
        sampleId: sample.sampleId,
        testType: sample.testType
      };
      
      // Adiciona o item à fatura
      const updatedItems = [...(newInvoice.items || []), newItem];
      
      // Recalcula o valor total
      const totalAmount = updatedItems.reduce((sum, item) => sum + item.total, 0);
      
      setNewInvoice({
        ...newInvoice,
        items: updatedItems,
        totalAmount
      });
    }
  };
  
  // Função para remover um item da fatura
  const removeInvoiceItem = (itemId: number) => {
    // Remove o item da fatura
    const updatedItems = newInvoice.items?.filter(item => item.id !== itemId) || [];
    
    // Se o item tinha um sampleId, remove a amostra das selecionadas
    if (newInvoice.items) {
      const item = newInvoice.items.find(i => i.id === itemId);
      if (item?.sampleId) {
        setSelectedSamples(selectedSamples.filter(s => s.sampleId !== item.sampleId));
      }
    }
    
    // Recalcula o valor total
    const totalAmount = updatedItems.reduce((sum, item) => sum + item.total, 0);
    
    setNewInvoice({
      ...newInvoice,
      items: updatedItems,
      totalAmount
    });
  };
  
  // Função para salvar a fatura
  const saveInvoice = () => {
    // Validação básica
    if (!newInvoice.clientId) {
      toast({
        title: 'Erro',
        description: 'Selecione um cliente para a fatura.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!newInvoice.items || newInvoice.items.length === 0) {
      toast({
        title: 'Erro',
        description: 'Adicione pelo menos um item à fatura.',
        variant: 'destructive',
      });
      return;
    }
    
    // Na implementação real, isso seria uma chamada à API para salvar a fatura
    // Simulação para desenvolvimento
    const selectedClient = clients.find(c => c.id === newInvoice.clientId);
    
    if (!selectedClient) {
      toast({
        title: 'Erro',
        description: 'Cliente não encontrado.',
        variant: 'destructive',
      });
      return;
    }
    
    const newInvoiceObj: Invoice = {
      id: Date.now(), // Temporário até o backend gerar um ID real
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      status: 'draft',
      issueDate: newInvoice.issueDate || format(new Date(), 'yyyy-MM-dd'),
      dueDate: newInvoice.dueDate || format(new Date(new Date().setDate(new Date().getDate() + 30)), 'yyyy-MM-dd'),
      totalAmount: newInvoice.totalAmount || 0,
      items: newInvoice.items || [],
      notes: newInvoice.notes
    };
    
    // Adiciona a nova fatura à lista
    setInvoices([...invoices, newInvoiceObj]);
    
    // Marca as amostras como faturadas
    const updatedSamples = pendingSamples.map(sample => 
      selectedSamples.some(s => s.id === sample.id) 
        ? { ...sample, invoiced: true, invoiceId: newInvoiceObj.id } 
        : sample
    );
    setPendingSamples(updatedSamples);
    
    // Fecha o diálogo
    setShowCreateInvoiceDialog(false);
    
    // Notifica o usuário
    toast({
      title: 'Fatura criada',
      description: `Fatura ${newInvoiceObj.invoiceNumber} criada com sucesso.`,
    });
  };
  
  // Função para enviar a fatura por email
  const sendInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowSendInvoiceDialog(true);
  };
  
  // Função para confirmar o envio da fatura
  const confirmSendInvoice = () => {
    if (!selectedInvoice) return;
    
    // Na implementação real, isso seria uma chamada à API para enviar a fatura por email
    // Simulação para desenvolvimento
    const updatedInvoices = invoices.map(invoice => 
      invoice.id === selectedInvoice.id 
        ? { ...invoice, status: 'sent' } 
        : invoice
    );
    
    setInvoices(updatedInvoices);
    setShowSendInvoiceDialog(false);
    
    // Notifica o usuário
    toast({
      title: 'Fatura enviada',
      description: `Fatura ${selectedInvoice.invoiceNumber} enviada por email com sucesso.`,
    });
  };
  
  // Função para gerar link de pagamento
  const generatePaymentLink = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowCreatePaymentLinkDialog(true);
  };
  
  // Função para confirmar a criação do link de pagamento
  const confirmCreatePaymentLink = () => {
    if (!selectedInvoice) return;
    
    // Na implementação real, isso seria uma chamada à API para gerar o link de pagamento
    // Simulação para desenvolvimento
    const paymentLinkObj: PaymentLink = {
      id: Date.now(), // Temporário até o backend gerar um ID real
      invoiceId: selectedInvoice.id,
      clientName: selectedInvoice.clientName,
      amount: selectedInvoice.totalAmount,
      description: `Pagamento da fatura ${selectedInvoice.invoiceNumber}`,
      url: `https://pay.labanaliticsdall.com.br/${selectedInvoice.invoiceNumber}`,
      expirationDate: format(new Date(new Date().setDate(new Date().getDate() + 15)), 'yyyy-MM-dd'),
      status: 'active',
      createdAt: format(new Date(), 'yyyy-MM-dd')
    };
    
    // Adiciona o link de pagamento à lista
    setPaymentLinks([...paymentLinks, paymentLinkObj]);
    
    // Atualiza a fatura com o link de pagamento
    const updatedInvoices = invoices.map(invoice => 
      invoice.id === selectedInvoice.id 
        ? { ...invoice, paymentLink: paymentLinkObj.url } 
        : invoice
    );
    
    setInvoices(updatedInvoices);
    setShowCreatePaymentLinkDialog(false);
    
    // Notifica o usuário
    toast({
      title: 'Link de pagamento gerado',
      description: `Link de pagamento para a fatura ${selectedInvoice.invoiceNumber} gerado com sucesso.`,
    });
  };
  
  // Função para marcar fatura como paga
  const markAsPaid = (invoice: Invoice) => {
    // Na implementação real, isso seria uma chamada à API para atualizar o status da fatura
    // Simulação para desenvolvimento
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoice.id 
        ? { ...inv, status: 'paid' } 
        : inv
    );
    
    setInvoices(updatedInvoices);
    
    // Atualiza o status do link de pagamento, se existir
    if (invoice.paymentLink) {
      const updatedPaymentLinks = paymentLinks.map(link => 
        link.invoiceId === invoice.id 
          ? { ...link, status: 'paid' } 
          : link
      );
      
      setPaymentLinks(updatedPaymentLinks);
    }
    
    // Notifica o usuário
    toast({
      title: 'Fatura paga',
      description: `Fatura ${invoice.invoiceNumber} marcada como paga.`,
    });
  };
  
  // Função para criar um novo cliente
  const createClient = () => {
    setSelectedClient(null);
    setShowClientDialog(true);
  };
  
  // Função para editar um cliente existente
  const editClient = (client: Client) => {
    setSelectedClient(client);
    setShowClientDialog(true);
  };
  
  // Função para salvar cliente (novo ou editado)
  const saveClient = (clientData: Partial<Client>) => {
    // Validação básica
    if (!clientData.name || !clientData.email || !clientData.documentNumber) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }
    
    // Na implementação real, isso seria uma chamada à API para salvar o cliente
    // Simulação para desenvolvimento
    if (selectedClient) {
      // Atualizando cliente existente
      const updatedClients = clients.map(client => 
        client.id === selectedClient.id 
          ? { ...client, ...clientData } 
          : client
      );
      
      setClients(updatedClients);
      
      toast({
        title: 'Cliente atualizado',
        description: `Cliente ${clientData.name} atualizado com sucesso.`,
      });
    } else {
      // Criando novo cliente
      const newClient: Client = {
        id: Date.now(), // Temporário até o backend gerar um ID real
        name: clientData.name || '',
        email: clientData.email || '',
        phone: clientData.phone || '',
        documentType: clientData.documentType || 'cpf',
        documentNumber: clientData.documentNumber || '',
        address: clientData.address || '',
        city: clientData.city || '',
        state: clientData.state || '',
        zipCode: clientData.zipCode || '',
        contactPerson: clientData.contactPerson,
        status: 'active'
      };
      
      setClients([...clients, newClient]);
      
      toast({
        title: 'Cliente criado',
        description: `Cliente ${newClient.name} criado com sucesso.`,
      });
    }
    
    // Fecha o diálogo
    setShowClientDialog(false);
  };
  
  // Função para obter a cor do status da fatura
  const getInvoiceStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'draft': 'bg-gray-500 hover:bg-gray-600',
      'sent': 'bg-blue-500 hover:bg-blue-600',
      'paid': 'bg-green-500 hover:bg-green-600',
      'overdue': 'bg-red-500 hover:bg-red-600',
      'canceled': 'bg-slate-500 hover:bg-slate-600'
    };
    return colorMap[status] || 'bg-gray-500 hover:bg-gray-600';
  };
  
  // Função para traduzir o status da fatura
  const translateInvoiceStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'draft': 'Rascunho',
      'sent': 'Enviada',
      'paid': 'Paga',
      'overdue': 'Vencida',
      'canceled': 'Cancelada'
    };
    return statusMap[status] || status;
  };
  
  // Função para formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  // Função para formatar datas
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy');
  };
  
  // Renderização do estado de carregamento
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-150px)]">
        <div className="flex flex-col items-center">
          <CircleDollarSign className="h-12 w-12 animate-pulse text-blue-500 mb-2" />
          <p className="text-lg text-gray-600">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestão Financeira</h1>
        <div className="flex space-x-2">
          <Button onClick={createInvoice}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Fatura
          </Button>
        </div>
      </div>
      
      {/* Resumo financeiro */}
      {financialSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Receita Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(financialSummary.totalRevenue)}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pagamentos Pendentes</p>
                  <p className="text-2xl font-bold">{formatCurrency(financialSummary.pendingPayments)}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pagamentos Vencidos</p>
                  <p className="text-2xl font-bold">{formatCurrency(financialSummary.overduePayments)}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Tag className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Faturas Pagas</p>
                  <p className="text-2xl font-bold">{financialSummary.paidInvoices}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <ClipboardCheck className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Abas principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="invoices">
            <Receipt className="h-4 w-4 mr-2" />
            Faturas
          </TabsTrigger>
          <TabsTrigger value="clients">
            <Users className="h-4 w-4 mr-2" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="payment-links">
            <Link className="h-4 w-4 mr-2" />
            Links de Pagamento
          </TabsTrigger>
          <TabsTrigger value="reports">
            <PieChart className="h-4 w-4 mr-2" />
            Relatórios
          </TabsTrigger>
        </TabsList>
        
        {/* Conteúdo da aba de Faturas */}
        <TabsContent value="invoices" className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle>Faturas</CardTitle>
                <Tabs value={invoiceTab} onValueChange={setInvoiceTab} className="w-full md:w-auto">
                  <TabsList>
                    <TabsTrigger value="all">Todas</TabsTrigger>
                    <TabsTrigger value="pending">Pendentes</TabsTrigger>
                    <TabsTrigger value="paid">Pagas</TabsTrigger>
                    <TabsTrigger value="draft">Rascunhos</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="border-b p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por número ou cliente..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          {dateFilter ? format(dateFilter, 'dd/MM/yyyy') : 'Filtrar por data'}
                          {dateFilter && (
                            <FilterX 
                              className="h-4 w-4 text-gray-400 hover:text-gray-500 cursor-pointer" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setDateFilter(undefined);
                              }}
                            />
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={dateFilter}
                          onSelect={setDateFilter}
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <div className="flex items-center gap-2">
                          <ListFilter className="h-4 w-4 text-gray-400" />
                          <SelectValue placeholder="Filtrar por status" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="draft">Rascunho</SelectItem>
                        <SelectItem value="sent">Enviada</SelectItem>
                        <SelectItem value="paid">Paga</SelectItem>
                        <SelectItem value="overdue">Vencida</SelectItem>
                        <SelectItem value="canceled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={clientFilter} onValueChange={setClientFilter}>
                      <SelectTrigger className="w-[180px]">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <SelectValue placeholder="Filtrar por cliente" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os clientes</SelectItem>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Fatura</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Data Emissão</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          Nenhuma fatura encontrada com os filtros atuais.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInvoices.map((invoice) => (
                        <TableRow key={invoice.id} className="cursor-pointer hover:bg-gray-50" onClick={() => viewInvoice(invoice)}>
                          <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                          <TableCell>{invoice.clientName}</TableCell>
                          <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                          <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(invoice.totalAmount)}</TableCell>
                          <TableCell>
                            <Badge className={getInvoiceStatusColor(invoice.status)}>
                              {translateInvoiceStatus(invoice.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => viewInvoice(invoice)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Visualizar
                                  </DropdownMenuItem>
                                  
                                  {invoice.status === 'draft' && (
                                    <DropdownMenuItem onClick={() => sendInvoice(invoice)}>
                                      <Send className="h-4 w-4 mr-2" />
                                      Enviar
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {(invoice.status === 'sent' || invoice.status === 'overdue') && !invoice.paymentLink && (
                                    <DropdownMenuItem onClick={() => generatePaymentLink(invoice)}>
                                      <Link className="h-4 w-4 mr-2" />
                                      Gerar Link de Pagamento
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                                    <DropdownMenuItem onClick={() => markAsPaid(invoice)}>
                                      <Check className="h-4 w-4 mr-2" />
                                      Marcar como Paga
                                    </DropdownMenuItem>
                                  )}
                                  
                                  <DropdownMenuSeparator />
                                  
                                  <DropdownMenuItem>
                                    <Download className="h-4 w-4 mr-2" />
                                    Baixar PDF
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between py-3">
              <p className="text-sm text-gray-500">
                Mostrando {filteredInvoices.length} de {invoices.length} faturas
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Conteúdo da aba de Clientes */}
        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Clientes</CardTitle>
                <CardDescription>
                  Gerenciamento de clientes e suas informações financeiras
                </CardDescription>
              </div>
              <Button onClick={createClient}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Cliente
              </Button>
            </CardHeader>
            
            <CardContent className="px-0">
              <div className="px-4 pb-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome, email ou documento..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="hidden md:table-cell">Documento</TableHead>
                      <TableHead className="hidden lg:table-cell">Telefone</TableHead>
                      <TableHead className="hidden lg:table-cell">Cidade/UF</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell className="hidden md:table-cell">{client.documentNumber}</TableCell>
                        <TableCell className="hidden lg:table-cell">{client.phone}</TableCell>
                        <TableCell className="hidden lg:table-cell">{client.city}/{client.state}</TableCell>
                        <TableCell>
                          {client.status === 'active' ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800">Ativo</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-800">Inativo</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => editClient(client)}>
                              Editar
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setClientFilter(client.id.toString());
                                setActiveTab('invoices');
                              }}
                            >
                              Ver Faturas
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Conteúdo da aba de Links de Pagamento */}
        <TabsContent value="payment-links" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Links de Pagamento</CardTitle>
              <CardDescription>
                Gerenciamento de links de pagamento enviados aos clientes
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-0">
              <div className="px-4 pb-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por cliente ou descrição..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead className="hidden md:table-cell">Descrição</TableHead>
                      <TableHead className="hidden lg:table-cell">Data de Criação</TableHead>
                      <TableHead className="hidden lg:table-cell">Expira em</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentLinks.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell className="font-medium">{link.clientName}</TableCell>
                        <TableCell>{formatCurrency(link.amount)}</TableCell>
                        <TableCell className="hidden md:table-cell">{link.description}</TableCell>
                        <TableCell className="hidden lg:table-cell">{formatDate(link.createdAt)}</TableCell>
                        <TableCell className="hidden lg:table-cell">{formatDate(link.expirationDate)}</TableCell>
                        <TableCell>
                          <Badge className={
                            link.status === 'active' ? 'bg-blue-500 hover:bg-blue-600' :
                            link.status === 'paid' ? 'bg-green-500 hover:bg-green-600' :
                            link.status === 'expired' ? 'bg-amber-500 hover:bg-amber-600' :
                            'bg-gray-500 hover:bg-gray-600'
                          }>
                            {
                              link.status === 'active' ? 'Ativo' :
                              link.status === 'paid' ? 'Pago' :
                              link.status === 'expired' ? 'Expirado' :
                              link.status === 'canceled' ? 'Cancelado' :
                              link.status
                            }
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" className="flex items-center gap-1">
                              <Copy className="h-4 w-4" />
                              Copiar Link
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="flex items-center gap-1"
                              onClick={() => {
                                // Abre o link em uma nova aba
                                window.open(link.url, '_blank');
                              }}
                            >
                              <ExternalLink className="h-4 w-4" />
                              Abrir
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Conteúdo da aba de Relatórios */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Financeiros</CardTitle>
                <CardDescription>
                  Acesse os relatórios financeiros do laboratório
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Demonstrativo Mensal</h4>
                        <p className="text-sm text-gray-500">Resumo financeiro do mês atual</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Baixar
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Faturamento por Cliente</h4>
                        <p className="text-sm text-gray-500">Análise de receita por cliente</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Baixar
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                        <FileText className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Faturamento por Serviço</h4>
                        <p className="text-sm text-gray-500">Análise de receita por tipo de serviço</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Baixar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Envio de Faturamento</CardTitle>
                <CardDescription>
                  Envie o faturamento mensal para seus clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mr-4">
                        <Calendar className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Faturamento Mensal</h4>
                        <p className="text-sm text-gray-500">Gerar e enviar faturas de {format(new Date(), 'MMMM/yyyy', { locale: ptBR })}</p>
                      </div>
                    </div>
                    <Button>
                      <Send className="h-4 w-4 mr-1" />
                      Gerar
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Opções de Agendamento</h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch id="auto-invoice" />
                        <Label htmlFor="auto-invoice">Faturamento automático mensal</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch id="reminder-emails" />
                        <Label htmlFor="reminder-emails">Enviar lembretes de pagamento</Label>
                      </div>
                      
                      <div>
                        <Label>Dia de faturamento mensal</Label>
                        <Select defaultValue="1">
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Selecione o dia" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 28 }, (_, i) => (
                              <SelectItem key={i + 1} value={(i + 1).toString()}>
                                Dia {i + 1}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Análise de Pagamentos</CardTitle>
              <CardDescription>
                Visualize o status dos pagamentos de clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Tendência de Receita</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Gráfico de tendência de receita mensal</p>
                  {/* Em uma implementação real, aqui estaria um gráfico feito com biblioteca como Recharts */}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Top Clientes por Receita</h3>
                  <ul className="space-y-2">
                    {financialSummary?.clientRevenue.slice(0, 5).map((item, index) => (
                      <li key={index} className="flex items-center justify-between p-2 border-b">
                        <span>{item.clientName}</span>
                        <span className="font-semibold">{formatCurrency(item.revenue)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Receita por Categoria de Serviço</h3>
                  <ul className="space-y-2">
                    {financialSummary?.serviceCategoryRevenue.map((item, index) => (
                      <li key={index} className="flex items-center justify-between p-2 border-b">
                        <span>{item.category}</span>
                        <span className="font-semibold">{formatCurrency(item.revenue)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Diálogo para criar nova fatura */}
      <Dialog open={showCreateInvoiceDialog} onOpenChange={setShowCreateInvoiceDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Criar Nova Fatura</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar uma nova fatura.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client">Cliente</Label>
              <Select 
                value={newInvoice.clientId?.toString() || ""}
                onValueChange={(value) => setNewInvoice({
                  ...newInvoice,
                  clientId: parseInt(value)
                })}
              >
                <SelectTrigger id="client">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="invoiceDate">Data de Emissão</Label>
              <Input 
                id="invoiceDate" 
                type="date" 
                value={newInvoice.issueDate}
                onChange={(e) => setNewInvoice({
                  ...newInvoice,
                  issueDate: e.target.value
                })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">Data de Vencimento</Label>
              <Input 
                id="dueDate" 
                type="date" 
                value={newInvoice.dueDate}
                onChange={(e) => setNewInvoice({
                  ...newInvoice,
                  dueDate: e.target.value
                })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea 
                id="notes" 
                placeholder="Observações adicionais para a fatura"
                value={newInvoice.notes || ''}
                onChange={(e) => setNewInvoice({
                  ...newInvoice,
                  notes: e.target.value
                })}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Itens da Fatura</h3>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Amostras
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96">
                  <div className="space-y-4">
                    <h4 className="font-medium">Amostras Pendentes</h4>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {filteredPendingSamples.length === 0 ? (
                        <p className="text-sm text-gray-500">Nenhuma amostra pendente para faturamento.</p>
                      ) : (
                        filteredPendingSamples.map((sample) => (
                          <div 
                            key={sample.id} 
                            className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                              selectedSamples.some(s => s.id === sample.id) 
                                ? 'bg-blue-50 border border-blue-200' 
                                : 'border hover:bg-gray-50'
                            }`}
                            onClick={() => addSampleToInvoice(sample)}
                          >
                            <div className="flex items-center">
                              <Checkbox 
                                checked={selectedSamples.some(s => s.id === sample.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    addSampleToInvoice(sample);
                                  } else {
                                    const item = newInvoice.items?.find(i => i.sampleId === sample.sampleId);
                                    if (item) {
                                      removeInvoiceItem(item.id);
                                    }
                                  }
                                }}
                                className="mr-2"
                              />
                              <div>
                                <p className="font-medium">{sample.sampleId}</p>
                                <p className="text-xs text-gray-500">{sample.clientName}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(sample.price)}</p>
                              <p className="text-xs text-gray-500">{sample.testType}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-[100px] text-right">Qtd</TableHead>
                    <TableHead className="w-[120px] text-right">Preço Unit.</TableHead>
                    <TableHead className="w-[120px] text-right">Total</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newInvoice.items && newInvoice.items.length > 0 ? (
                    newInvoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeInvoiceItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Nenhum item adicionado à fatura.
                      </TableCell>
                    </TableRow>
                  )}
                  
                  {/* Linha de total */}
                  {newInvoice.items && newInvoice.items.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">
                        Total da Fatura:
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(newInvoice.totalAmount || 0)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreateInvoiceDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={saveInvoice}>
              Salvar Fatura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para visualizar fatura */}
      {selectedInvoice && (
        <Dialog open={showViewInvoiceDialog} onOpenChange={setShowViewInvoiceDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Fatura #{selectedInvoice.invoiceNumber}</span>
                <Badge className={getInvoiceStatusColor(selectedInvoice.status)}>
                  {translateInvoiceStatus(selectedInvoice.status)}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Detalhes da fatura
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Cliente</h3>
                <p className="font-medium">{selectedInvoice.clientName}</p>
                
                {/* Na implementação real, buscaríamos os dados completos do cliente */}
                <p className="text-sm text-gray-600 mt-2">
                  {clients.find(c => c.id === selectedInvoice.clientId)?.address || 'Endereço do cliente'}
                </p>
                <p className="text-sm text-gray-600">
                  {clients.find(c => c.id === selectedInvoice.clientId)?.city || 'Cidade'}/{clients.find(c => c.id === selectedInvoice.clientId)?.state || 'Estado'}
                </p>
              </div>
              
              <div className="space-y-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Data de Emissão</h3>
                  <p>{formatDate(selectedInvoice.issueDate)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Data de Vencimento</h3>
                  <p>{formatDate(selectedInvoice.dueDate)}</p>
                </div>
                
                {selectedInvoice.paymentLink && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Link de Pagamento</h3>
                    <div className="flex items-center">
                      <a 
                        href={selectedInvoice.paymentLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        {selectedInvoice.paymentLink.substring(0, 30)}...
                        <ExternalLink className="h-3.5 w-3.5 ml-1" />
                      </a>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 ml-1"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedInvoice.paymentLink || '');
                          toast({
                            title: 'Link copiado',
                            description: 'Link de pagamento copiado para a área de transferência.',
                          });
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-[80px] text-right">Qtd</TableHead>
                    <TableHead className="w-[120px] text-right">Preço Unit.</TableHead>
                    <TableHead className="w-[120px] text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedInvoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Linha de total */}
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium">
                      Total da Fatura:
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(selectedInvoice.totalAmount)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            {selectedInvoice.notes && (
              <div className="border rounded-md p-3 mt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Observações</h3>
                <p className="text-sm">{selectedInvoice.notes}</p>
              </div>
            )}
            
            <DialogFooter className="gap-2">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setShowViewInvoiceDialog(false)}>
                  Fechar
                </Button>
                
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar PDF
                </Button>
                
                {selectedInvoice.status === 'draft' && (
                  <Button onClick={() => {
                    setShowViewInvoiceDialog(false);
                    sendInvoice(selectedInvoice);
                  }}>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar por E-mail
                  </Button>
                )}
                
                {(selectedInvoice.status === 'sent' || selectedInvoice.status === 'overdue') && !selectedInvoice.paymentLink && (
                  <Button onClick={() => {
                    setShowViewInvoiceDialog(false);
                    generatePaymentLink(selectedInvoice);
                  }}>
                    <Link className="h-4 w-4 mr-2" />
                    Gerar Link de Pagamento
                  </Button>
                )}
                
                {(selectedInvoice.status === 'sent' || selectedInvoice.status === 'overdue') && (
                  <Button variant="default" onClick={() => {
                    markAsPaid(selectedInvoice);
                    setShowViewInvoiceDialog(false);
                  }}>
                    <Check className="h-4 w-4 mr-2" />
                    Marcar como Paga
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Diálogo para enviar fatura por email */}
      {selectedInvoice && (
        <Dialog open={showSendInvoiceDialog} onOpenChange={setShowSendInvoiceDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Enviar Fatura por E-mail</DialogTitle>
              <DialogDescription>
                Envie a fatura #{selectedInvoice.invoiceNumber} para o cliente {selectedInvoice.clientName}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailTo">Para</Label>
                <Input 
                  id="emailTo" 
                  value={clients.find(c => c.id === selectedInvoice.clientId)?.email || ''} 
                  readOnly 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailSubject">Assunto</Label>
                <Input 
                  id="emailSubject" 
                  value={`Fatura ${selectedInvoice.invoiceNumber} - LabAnalytics Dall Solutions`} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailMessage">Mensagem</Label>
                <Textarea 
                  id="emailMessage" 
                  rows={5}
                  value={`Prezado(a) Cliente,

Segue em anexo a fatura ${selectedInvoice.invoiceNumber} no valor de ${formatCurrency(selectedInvoice.totalAmount)} com vencimento em ${formatDate(selectedInvoice.dueDate)}.

Caso prefira pagar online, visite nosso portal de clientes ou aguarde o link de pagamento.

Atenciosamente,
Equipe LabAnalytics Dall Solutions`} 
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="includePaymentLink" />
                <Label htmlFor="includePaymentLink">Gerar e incluir link de pagamento</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="includePdf" defaultChecked />
                <Label htmlFor="includePdf">Anexar PDF da fatura</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSendInvoiceDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmSendInvoice}>
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Diálogo para criar link de pagamento */}
      {selectedInvoice && (
        <Dialog open={showCreatePaymentLinkDialog} onOpenChange={setShowCreatePaymentLinkDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Gerar Link de Pagamento</DialogTitle>
              <DialogDescription>
                Crie um link de pagamento para a fatura #{selectedInvoice.invoiceNumber}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="text-sm text-gray-500">Valor</p>
                  <p className="text-xl font-bold">{formatCurrency(selectedInvoice.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vencimento</p>
                  <p className="font-medium">{formatDate(selectedInvoice.dueDate)}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentLinkExpiration">Data de Expiração do Link</Label>
                <Input 
                  id="paymentLinkExpiration" 
                  type="date" 
                  defaultValue={format(new Date(new Date().setDate(new Date().getDate() + 15)), 'yyyy-MM-dd')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentLinkDescription">Descrição</Label>
                <Input 
                  id="paymentLinkDescription" 
                  defaultValue={`Pagamento da fatura ${selectedInvoice.invoiceNumber}`} 
                />
              </div>
              
              <Accordion type="single" collapsible>
                <AccordionItem value="payment-options">
                  <AccordionTrigger>Opções de Pagamento</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="allowCreditCard" defaultChecked />
                        <Label htmlFor="allowCreditCard">Cartão de Crédito</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="allowBoleto" defaultChecked />
                        <Label htmlFor="allowBoleto">Boleto Bancário</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="allowPix" defaultChecked />
                        <Label htmlFor="allowPix">PIX</Label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="sendEmailWithLink" />
                <Label htmlFor="sendEmailWithLink">Enviar link por e-mail</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreatePaymentLinkDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmCreatePaymentLink}>
                <Link className="h-4 w-4 mr-2" />
                Gerar Link
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Diálogo para cliente */}
      <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedClient ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
            <DialogDescription>
              {selectedClient 
                ? `Edite as informações do cliente ${selectedClient.name}.` 
                : 'Preencha as informações para criar um novo cliente.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome/Razão Social *</Label>
              <Input 
                id="clientName" 
                placeholder="Nome completo ou razão social"
                defaultValue={selectedClient?.name || ''}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clientEmail">E-mail *</Label>
              <Input 
                id="clientEmail" 
                type="email" 
                placeholder="email@exemplo.com"
                defaultValue={selectedClient?.email || ''}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clientPhone">Telefone</Label>
              <Input 
                id="clientPhone" 
                placeholder="(00) 00000-0000"
                defaultValue={selectedClient?.phone || ''}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clientContactPerson">Pessoa de Contato</Label>
              <Input 
                id="clientContactPerson" 
                placeholder="Nome do contato"
                defaultValue={selectedClient?.contactPerson || ''}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clientDocumentType">Tipo de Documento *</Label>
              <Select defaultValue={selectedClient?.documentType || 'cpf'}>
                <SelectTrigger id="clientDocumentType">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpf">CPF</SelectItem>
                  <SelectItem value="cnpj">CNPJ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clientDocumentNumber">Número do Documento *</Label>
              <Input 
                id="clientDocumentNumber" 
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                defaultValue={selectedClient?.documentNumber || ''}
              />
            </div>
            
            <div className="col-span-1 md:col-span-2 space-y-2">
              <Label htmlFor="clientAddress">Endereço</Label>
              <Input 
                id="clientAddress" 
                placeholder="Rua, número, complemento"
                defaultValue={selectedClient?.address || ''}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clientCity">Cidade</Label>
              <Input 
                id="clientCity" 
                placeholder="Cidade"
                defaultValue={selectedClient?.city || ''}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientState">Estado</Label>
                <Select defaultValue={selectedClient?.state || ''}>
                  <SelectTrigger id="clientState">
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientZipCode">CEP</Label>
                <Input 
                  id="clientZipCode" 
                  placeholder="00000-000"
                  defaultValue={selectedClient?.zipCode || ''}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClientDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => saveClient({
              name: (document.getElementById('clientName') as HTMLInputElement)?.value,
              email: (document.getElementById('clientEmail') as HTMLInputElement)?.value,
              phone: (document.getElementById('clientPhone') as HTMLInputElement)?.value,
              contactPerson: (document.getElementById('clientContactPerson') as HTMLInputElement)?.value,
              documentType: (document.querySelector('[id^="clientDocumentType"]') as HTMLSelectElement)?.value as 'cpf' | 'cnpj',
              documentNumber: (document.getElementById('clientDocumentNumber') as HTMLInputElement)?.value,
              address: (document.getElementById('clientAddress') as HTMLInputElement)?.value,
              city: (document.getElementById('clientCity') as HTMLInputElement)?.value,
              state: (document.querySelector('[id^="clientState"]') as HTMLSelectElement)?.value,
              zipCode: (document.getElementById('clientZipCode') as HTMLInputElement)?.value,
            })}>
              {selectedClient ? 'Atualizar Cliente' : 'Criar Cliente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Dados fictícios para desenvolvimento
const mockInvoices: Invoice[] = [
  {
    id: 1,
    invoiceNumber: 'INV-2025-0001',
    clientId: 1,
    clientName: 'Associação Brasileira de Apoio Cannabis Esperança',
    status: 'paid',
    issueDate: '2025-03-10',
    dueDate: '2025-04-10',
    totalAmount: 5200.00,
    items: [
      {
        id: 1,
        description: 'Análise de Perfil de Canabinoides - Amostra LAB-2025-0001',
        quantity: 1,
        unitPrice: 1500.00,
        total: 1500.00,
        sampleId: 'LAB-2025-0001',
        testType: 'Perfil de Canabinoides'
      },
      {
        id: 2,
        description: 'Análise de Metais Pesados - Amostra LAB-2025-0008',
        quantity: 1,
        unitPrice: 1200.00,
        total: 1200.00,
        sampleId: 'LAB-2025-0008',
        testType: 'Metais Pesados'
      },
      {
        id: 3,
        description: 'Análise Microbiológica - Amostra LAB-2025-0015',
        quantity: 1,
        unitPrice: 950.00,
        total: 950.00,
        sampleId: 'LAB-2025-0015',
        testType: 'Microbiológica'
      },
      {
        id: 4,
        description: 'Análise de Terpenos - Amostra LAB-2025-0022',
        quantity: 1,
        unitPrice: 1550.00,
        total: 1550.00,
        sampleId: 'LAB-2025-0022',
        testType: 'Perfil de Terpenos'
      }
    ],
    paymentMethod: 'credit_card',
    notes: 'Pagamento recebido em 05/04/2025.'
  },
  {
    id: 2,
    invoiceNumber: 'INV-2025-0002',
    clientId: 2,
    clientName: 'PharmaCann Indústria Farmacêutica',
    status: 'sent',
    issueDate: '2025-04-15',
    dueDate: '2025-05-15',
    totalAmount: 8750.00,
    paymentLink: 'https://pay.labanaliticsdall.com.br/INV-2025-0002',
    items: [
      {
        id: 5,
        description: 'Análise de Perfil de Canabinoides - Lote PCN-2025-042',
        quantity: 3,
        unitPrice: 1500.00,
        total: 4500.00
      },
      {
        id: 6,
        description: 'Análise de Solventes Residuais - Lote PCN-2025-042',
        quantity: 3,
        unitPrice: 850.00,
        total: 2550.00
      },
      {
        id: 7,
        description: 'Análise de Pesticidas - Lote PCN-2025-042',
        quantity: 1,
        unitPrice: 1700.00,
        total: 1700.00
      }
    ]
  },
  {
    id: 3,
    invoiceNumber: 'INV-2025-0003',
    clientId: 3,
    clientName: 'Clínica Integrada de Dor',
    status: 'overdue',
    issueDate: '2025-03-20',
    dueDate: '2025-04-20',
    totalAmount: 2450.00,
    items: [
      {
        id: 8,
        description: 'Análise de Potência - Amostra LAB-2025-0042',
        quantity: 1,
        unitPrice: 1200.00,
        total: 1200.00,
        sampleId: 'LAB-2025-0042',
        testType: 'Potência'
      },
      {
        id: 9,
        description: 'Análise Microbiológica - Amostra LAB-2025-0043',
        quantity: 1,
        unitPrice: 950.00,
        total: 950.00,
        sampleId: 'LAB-2025-0043',
        testType: 'Microbiológica'
      },
      {
        id: 10,
        description: 'Taxa de Urgência',
        quantity: 1,
        unitPrice: 300.00,
        total: 300.00
      }
    ]
  },
  {
    id: 4,
    invoiceNumber: 'INV-2025-0004',
    clientId: 4,
    clientName: 'Universidade Federal de São Paulo',
    status: 'draft',
    issueDate: '2025-04-25',
    dueDate: '2025-05-25',
    totalAmount: 3600.00,
    items: [
      {
        id: 11,
        description: 'Análise de Canabinoides - Projeto de Pesquisa UNIFESP-CBD-25',
        quantity: 2,
        unitPrice: 1500.00,
        total: 3000.00
      },
      {
        id: 12,
        description: 'Preparação de Amostras',
        quantity: 2,
        unitPrice: 300.00,
        total: 600.00
      }
    ],
    notes: 'Fatura relacionada ao projeto de pesquisa UNIFESP-CBD-25. Aguardando aprovação do departamento financeiro.'
  },
  {
    id: 5,
    invoiceNumber: 'INV-2025-0005',
    clientId: 5,
    clientName: 'Grupo de Apoio a Pacientes Neurológicos',
    status: 'paid',
    issueDate: '2025-02-10',
    dueDate: '2025-03-10',
    totalAmount: 4250.00,
    items: [
      {
        id: 13,
        description: 'Análise de Perfil de Canabinoides - Amostras Múltiplas',
        quantity: 3,
        unitPrice: 1200.00,
        total: 3600.00
      },
      {
        id: 14,
        description: 'Relatório Técnico Detalhado',
        quantity: 1,
        unitPrice: 650.00,
        total: 650.00
      }
    ],
    paymentMethod: 'bank_transfer',
    notes: 'Desconto de 10% aplicado para organização sem fins lucrativos.'
  }
];

const mockClients: Client[] = [
  {
    id: 1,
    name: 'Associação Brasileira de Apoio Cannabis Esperança',
    email: 'financeiro@abrace.org.br',
    phone: '(83) 3214-5678',
    documentType: 'cnpj',
    documentNumber: '05.235.782/0001-10',
    address: 'Rua das Flores, 123',
    city: 'João Pessoa',
    state: 'PB',
    zipCode: '58000-000',
    contactPerson: 'Maria Silva',
    status: 'active'
  },
  {
    id: 2,
    name: 'PharmaCann Indústria Farmacêutica',
    email: 'contato@pharmacann.com.br',
    phone: '(11) 3456-7890',
    documentType: 'cnpj',
    documentNumber: '12.345.678/0001-90',
    address: 'Av. Paulista, 1500, Sala 205',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310-200',
    contactPerson: 'Carlos Mendes',
    status: 'active'
  },
  {
    id: 3,
    name: 'Clínica Integrada de Dor',
    email: 'contato@clinicador.com.br',
    phone: '(41) 3333-2222',
    documentType: 'cnpj',
    documentNumber: '23.456.789/0001-12',
    address: 'Rua Padre Anchieta, 500',
    city: 'Curitiba',
    state: 'PR',
    zipCode: '80020-060',
    contactPerson: 'Dra. Patrícia Almeida',
    status: 'active'
  },
  {
    id: 4,
    name: 'Universidade Federal de São Paulo',
    email: 'projetos@unifesp.br',
    phone: '(11) 5576-4000',
    documentType: 'cnpj',
    documentNumber: '10.876.543/0001-98',
    address: 'Rua Sena Madureira, 1500',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '04021-001',
    contactPerson: 'Prof. Ricardo Santos',
    status: 'active'
  },
  {
    id: 5,
    name: 'Grupo de Apoio a Pacientes Neurológicos',
    email: 'contato@gapneurologico.org.br',
    phone: '(51) 3222-1111',
    documentType: 'cnpj',
    documentNumber: '08.765.432/0001-76',
    address: 'Av. Ipiranga, 1200',
    city: 'Porto Alegre',
    state: 'RS',
    zipCode: '90160-093',
    contactPerson: 'Ana Paula Costa',
    status: 'active'
  }
];

const mockPaymentLinks: PaymentLink[] = [
  {
    id: 1,
    invoiceId: 2,
    clientName: 'PharmaCann Indústria Farmacêutica',
    amount: 8750.00,
    description: 'Pagamento da fatura INV-2025-0002',
    url: 'https://pay.labanaliticsdall.com.br/INV-2025-0002',
    expirationDate: '2025-05-15',
    status: 'active',
    createdAt: '2025-04-15'
  },
  {
    id: 2,
    invoiceId: 1,
    clientName: 'Associação Brasileira de Apoio Cannabis Esperança',
    amount: 5200.00,
    description: 'Pagamento da fatura INV-2025-0001',
    url: 'https://pay.labanaliticsdall.com.br/INV-2025-0001',
    expirationDate: '2025-04-10',
    status: 'paid',
    createdAt: '2025-03-10'
  }
];

const mockPendingSamples: TestSample[] = [
  {
    id: 1,
    sampleId: 'LAB-2025-0050',
    clientId: 1,
    clientName: 'Associação Brasileira de Apoio Cannabis Esperança',
    testType: 'Perfil de Canabinoides',
    receivedDate: '2025-04-18',
    completedDate: '2025-04-24',
    status: 'completed',
    price: 1500.00,
    invoiced: false
  },
  {
    id: 2,
    sampleId: 'LAB-2025-0051',
    clientId: 1,
    clientName: 'Associação Brasileira de Apoio Cannabis Esperança',
    testType: 'Metais Pesados',
    receivedDate: '2025-04-18',
    completedDate: '2025-04-25',
    status: 'completed',
    price: 1200.00,
    invoiced: false
  },
  {
    id: 3,
    sampleId: 'LAB-2025-0055',
    clientId: 2,
    clientName: 'PharmaCann Indústria Farmacêutica',
    testType: 'Perfil Completo',
    receivedDate: '2025-04-20',
    completedDate: '2025-04-26',
    status: 'approved',
    price: 2800.00,
    invoiced: false
  },
  {
    id: 4,
    sampleId: 'LAB-2025-0060',
    clientId: 3,
    clientName: 'Clínica Integrada de Dor',
    testType: 'Análise Microbiológica',
    receivedDate: '2025-04-22',
    status: 'in_progress',
    price: 950.00,
    invoiced: false
  },
  {
    id: 5,
    sampleId: 'LAB-2025-0065',
    clientId: 5,
    clientName: 'Grupo de Apoio a Pacientes Neurológicos',
    testType: 'Perfil de Terpenos',
    receivedDate: '2025-04-24',
    status: 'pending',
    price: 1550.00,
    invoiced: false
  }
];

const mockFinancialSummary: FinancialSummary = {
  totalRevenue: 42500.00,
  pendingPayments: 11200.00,
  overduePayments: 2450.00,
  paidInvoices: 2,
  invoicesThisMonth: 3,
  revenueTrend: [
    { month: 'Jan', revenue: 8500.00 },
    { month: 'Fev', revenue: 12500.00 },
    { month: 'Mar', revenue: 9800.00 },
    { month: 'Abr', revenue: 11700.00 }
  ],
  clientRevenue: [
    { clientName: 'PharmaCann Indústria Farmacêutica', revenue: 15200.00 },
    { clientName: 'Associação Brasileira de Apoio Cannabis Esperança', revenue: 9450.00 },
    { clientName: 'Grupo de Apoio a Pacientes Neurológicos', revenue: 8300.00 },
    { clientName: 'Universidade Federal de São Paulo', revenue: 5600.00 },
    { clientName: 'Clínica Integrada de Dor', revenue: 3950.00 }
  ],
  serviceCategoryRevenue: [
    { category: 'Perfil de Canabinoides', revenue: 18500.00 },
    { category: 'Metais Pesados', revenue: 7200.00 },
    { category: 'Microbiológica', revenue: 5800.00 },
    { category: 'Terpenos', revenue: 4800.00 },
    { category: 'Pesticidas', revenue: 4100.00 },
    { category: 'Outros', revenue: 2100.00 }
  ]
};