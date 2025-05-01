import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Wallet, 
  CreditCard, 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  ArrowUpRight, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Eye,
  BanknoteIcon,
  ReceiptIcon,
  CircleDollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Layout do fornecedor
import SupplierLayout from "@/components/layout/supplier/SupplierLayout";

// Tipo de transação
interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: string;
  type: string;
  orderId?: string;
  invoice?: string;
  paymentMethod?: string;
}

export default function SupplierFinance() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);

  // Dados simulados para o financeiro
  const financeData = {
    balance: 15750.50,
    pendingAmount: 2340.80,
    totalSales: 45320.75,
    withdrawn: 27500.00,
    monthlyIncrease: 12.5,
    transactions: [
      {
        id: "TR-85471",
        date: "2025-05-01",
        description: "Pagamento do pedido #ORD-8547",
        amount: 1289.90,
        status: "completed",
        type: "income",
        orderId: "ORD-8547",
        invoice: "NF-78945",
        paymentMethod: "credit_card"
      },
      {
        id: "TR-85461",
        date: "2025-04-30",
        description: "Pagamento do pedido #ORD-8546",
        amount: 2450.00,
        status: "completed",
        type: "income",
        orderId: "ORD-8546",
        invoice: "NF-78944",
        paymentMethod: "credit_card"
      },
      {
        id: "TR-85351",
        date: "2025-04-28",
        description: "Pagamento do pedido #ORD-8535",
        amount: 890.50,
        status: "completed",
        type: "income",
        orderId: "ORD-8535",
        invoice: "NF-78943",
        paymentMethod: "credit_card"
      },
      {
        id: "TR-85201",
        date: "2025-04-25",
        description: "Pagamento do pedido #ORD-8520",
        amount: 3200.00,
        status: "completed",
        type: "income",
        orderId: "ORD-8520",
        invoice: "NF-78942",
        paymentMethod: "pix"
      },
      {
        id: "TR-85151",
        date: "2025-04-23",
        description: "Pagamento do pedido #ORD-8515",
        amount: 1750.00,
        status: "refunded",
        type: "expense",
        orderId: "ORD-8515",
        invoice: "NF-78941",
        paymentMethod: "credit_card"
      },
      {
        id: "TR-85031",
        date: "2025-04-20",
        description: "Pagamento do pedido #ORD-8503",
        amount: 920.75,
        status: "pending",
        type: "income",
        orderId: "ORD-8503",
        paymentMethod: "boleto"
      },
      {
        id: "TR-84901",
        date: "2025-04-18",
        description: "Pagamento do pedido #ORD-8490",
        amount: 1340.25,
        status: "completed",
        type: "income",
        orderId: "ORD-8490",
        invoice: "NF-78940",
        paymentMethod: "credit_card"
      },
      {
        id: "TR-84751",
        date: "2025-04-15",
        description: "Pagamento do pedido #ORD-8475",
        amount: 4200.00,
        status: "completed",
        type: "income",
        orderId: "ORD-8475",
        invoice: "NF-78939",
        paymentMethod: "pix"
      },
      {
        id: "TR-84601",
        date: "2025-04-12",
        description: "Pagamento do pedido #ORD-8460",
        amount: 780.50,
        status: "completed",
        type: "income",
        orderId: "ORD-8460",
        invoice: "NF-78938",
        paymentMethod: "credit_card"
      },
      {
        id: "TR-84451",
        date: "2025-04-10",
        description: "Pagamento do pedido #ORD-8445",
        amount: 3600.25,
        status: "completed",
        type: "income",
        orderId: "ORD-8445",
        invoice: "NF-78937",
        paymentMethod: "credit_card"
      },
      {
        id: "TR-SAQUE-01",
        date: "2025-04-05",
        description: "Saque para conta bancária",
        amount: 12500.00,
        status: "completed",
        type: "withdrawal"
      },
      {
        id: "TR-TAXA-01",
        date: "2025-04-05",
        description: "Taxa de processamento",
        amount: 125.00,
        status: "completed",
        type: "fee"
      },
      {
        id: "TR-SAQUE-02",
        date: "2025-03-20",
        description: "Saque para conta bancária",
        amount: 15000.00,
        status: "completed",
        type: "withdrawal"
      },
      {
        id: "TR-TAXA-02",
        date: "2025-03-20",
        description: "Taxa de processamento",
        amount: 150.00,
        status: "completed",
        type: "fee"
      }
    ]
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-50 text-green-700 border-green-200";
      case "pending": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "refunded": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Função para obter texto do status
  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Concluído";
      case "pending": return "Pendente";
      case "refunded": return "Reembolsado";
      default: return status;
    }
  };

  // Função para obter informações do tipo de transação
  const getTransactionTypeInfo = (type: string) => {
    switch (type) {
      case "income":
        return {
          text: "Receita",
          color: "text-green-600",
          background: "bg-green-50",
          icon: <TrendingUp className="h-4 w-4 text-green-600" />
        };
      case "expense":
        return {
          text: "Despesa",
          color: "text-red-600",
          background: "bg-red-50",
          icon: <TrendingDown className="h-4 w-4 text-red-600" />
        };
      case "withdrawal":
        return {
          text: "Saque",
          color: "text-blue-600",
          background: "bg-blue-50",
          icon: <BanknoteIcon className="h-4 w-4 text-blue-600" />
        };
      case "fee":
        return {
          text: "Taxa",
          color: "text-orange-600",
          background: "bg-orange-50",
          icon: <CircleDollarSign className="h-4 w-4 text-orange-600" />
        };
      default:
        return {
          text: type,
          color: "text-gray-600",
          background: "bg-gray-50",
          icon: <CreditCard className="h-4 w-4 text-gray-600" />
        };
    }
  };

  // Função para filtrar transações por data
  const filterTransactionsByDate = (transactions: Transaction[], dateFilter: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const thisYearStart = new Date(now.getFullYear(), 0, 1);
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      
      switch (dateFilter) {
        case "today":
          return transactionDate.getTime() >= today.getTime() && 
                 transactionDate.getTime() < new Date(today).setDate(today.getDate() + 1);
        case "yesterday":
          return transactionDate.getTime() >= yesterday.getTime() && 
                 transactionDate.getTime() < today.getTime();
        case "week":
          return transactionDate.getTime() >= thisWeekStart.getTime();
        case "month":
          return transactionDate.getTime() >= thisMonthStart.getTime();
        case "year":
          return transactionDate.getTime() >= thisYearStart.getTime();
        default:
          return true; // "all"
      }
    });
  };

  // Filtragem de transações
  const filteredTransactions = financeData.transactions.filter(transaction => {
    // Filtragem por tipo
    if (filter !== "all" && transaction.type !== filter) {
      return false;
    }
    
    // Busca por descrição ou ID
    if (searchQuery && !transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(transaction.orderId && transaction.orderId.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    
    return true;
  });

  // Filtragem por data
  const dateFilteredTransactions = filterTransactionsByDate(filteredTransactions, dateFilter);

  // Ordenação de transações (por data, mais recentes primeiro)
  const sortedTransactions = [...dateFilteredTransactions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Cálculos de saldo
  const currentBalance = financeData.balance;
  const totalAvailable = financeData.balance - financeData.pendingAmount;

  // Função para visualizar detalhes da transação
  const viewTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetails(true);
  };

  // Função para baixar comprovante
  const downloadReceipt = (transactionId: string) => {
    toast({
      title: "Comprovante baixado",
      description: `O comprovante da transação ${transactionId} foi baixado com sucesso.`,
    });
  };

  // Função para baixar nota fiscal
  const downloadInvoice = (invoice: string) => {
    toast({
      title: "Nota fiscal baixada",
      description: `A nota fiscal ${invoice} foi baixada com sucesso.`,
    });
  };

  // Função para solicitar saque
  const requestWithdrawal = () => {
    toast({
      title: "Solicitação de saque",
      description: "Sua solicitação de saque foi enviada e está sendo processada.",
    });
  };

  return (
    <SupplierLayout activeTab="finance">
      <div className="pb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Financeiro</h1>
        <p className="text-muted-foreground mb-8">Gerencie seus pagamentos, transações e saldo disponível.</p>
        
        {/* Cards de resumo */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Saldo Disponível
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ {totalAvailable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  Saldo total: R$ {financeData.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                  onClick={requestWithdrawal}
                >
                  Sacar
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pagamentos Pendentes
              </CardTitle>
              <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">R$ {financeData.pendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Pagamentos em processo de liberação
              </p>
              <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: `${(financeData.pendingAmount / financeData.totalSales) * 100}%` }} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vendas Totais
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {financeData.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                <p className="text-xs text-green-600">
                  +{financeData.monthlyIncrease}% em relação ao mês anterior
                </p>
              </div>
              <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-[75%]" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Valor Sacado
              </CardTitle>
              <BanknoteIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {financeData.withdrawn.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Total sacado para sua conta bancária
              </p>
              <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600" style={{ width: `${(financeData.withdrawn / financeData.totalSales) * 100}%` }} />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Filtros e busca */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Buscar transações por descrição ou ID" 
              className="pl-10"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Tipo de Transação</SelectLabel>
                  <SelectItem value="all">Todas as Transações</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                  <SelectItem value="withdrawal">Saques</SelectItem>
                  <SelectItem value="fee">Taxas</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por data" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Período</SelectLabel>
                  <SelectItem value="all">Todo o período</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="yesterday">Ontem</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mês</SelectItem>
                  <SelectItem value="year">Este ano</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Abas de categorias */}
        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setFilter("all")}>
              Todas
              <Badge className="ml-2 bg-gray-200 text-gray-700">{financeData.transactions.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="income" onClick={() => setFilter("income")}>
              Receitas
              <Badge className="ml-2 bg-green-100 text-green-700">{financeData.transactions.filter(t => t.type === "income").length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="expense" onClick={() => setFilter("expense")}>
              Despesas
              <Badge className="ml-2 bg-red-100 text-red-700">{financeData.transactions.filter(t => t.type === "expense").length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="withdrawal" onClick={() => setFilter("withdrawal")}>
              Saques
              <Badge className="ml-2 bg-blue-100 text-blue-700">{financeData.transactions.filter(t => t.type === "withdrawal").length}</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Tabela de Transações */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Histórico de Transações</CardTitle>
            <CardDescription>
              Mostrando {sortedTransactions.length} de {financeData.transactions.length} transações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">ID</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTransactions.length > 0 ? (
                  sortedTransactions.map((transaction) => {
                    const typeInfo = getTransactionTypeInfo(transaction.type);
                    return (
                      <TableRow key={transaction.id} className="cursor-pointer hover:bg-muted/50" onClick={() => viewTransactionDetails(transaction)}>
                        <TableCell className="font-medium">{transaction.id}</TableCell>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.background} ${typeInfo.color}`}>
                            {typeInfo.icon}
                            <span className="ml-1">{typeInfo.text}</span>
                          </div>
                        </TableCell>
                        <TableCell className={`text-right font-medium ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                          {transaction.type === "income" ? "+" : "-"}
                          R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Badge className={`rounded-full px-3 py-1 text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                              {getStatusText(transaction.status)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); viewTransactionDetails(transaction); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      Nenhuma transação encontrada com os filtros atuais.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Detalhes da Transação */}
      {selectedTransaction && (
        <Dialog open={showTransactionDetails} onOpenChange={setShowTransactionDetails}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalhes da Transação</DialogTitle>
              <DialogDescription>
                Informações detalhadas sobre a transação {selectedTransaction.id}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getTransactionTypeInfo(selectedTransaction.type).background} ${getTransactionTypeInfo(selectedTransaction.type).color}`}>
                  {getTransactionTypeInfo(selectedTransaction.type).icon}
                  <span className="ml-2">{getTransactionTypeInfo(selectedTransaction.type).text}</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Valor</div>
                <div className={`text-2xl font-bold ${selectedTransaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                  {selectedTransaction.type === "income" ? "+" : "-"}
                  R$ {selectedTransaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">ID da Transação</Label>
                  <div className="font-medium">{selectedTransaction.id}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Data</Label>
                  <div className="font-medium">{formatDate(selectedTransaction.date)}</div>
                </div>
              </div>
              
              <div>
                <Label className="text-xs text-gray-500">Descrição</Label>
                <div className="font-medium">{selectedTransaction.description}</div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Status</Label>
                  <div>
                    <Badge className={`mt-1 rounded-full px-3 py-1 text-xs font-medium border ${getStatusColor(selectedTransaction.status)}`}>
                      {getStatusText(selectedTransaction.status)}
                    </Badge>
                  </div>
                </div>
                
                {selectedTransaction.orderId && (
                  <div>
                    <Label className="text-xs text-gray-500">ID do Pedido</Label>
                    <div className="font-medium">{selectedTransaction.orderId}</div>
                  </div>
                )}
              </div>
              
              {selectedTransaction.paymentMethod && (
                <div>
                  <Label className="text-xs text-gray-500">Método de Pagamento</Label>
                  <div className="font-medium capitalize">
                    {selectedTransaction.paymentMethod === "credit_card" 
                      ? "Cartão de Crédito" 
                      : selectedTransaction.paymentMethod === "boleto" 
                        ? "Boleto Bancário" 
                        : selectedTransaction.paymentMethod}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setShowTransactionDetails(false)}>
                Fechar
              </Button>
              
              <div className="flex gap-2">
                {(selectedTransaction.type === "income" || selectedTransaction.type === "expense") && (
                  <Button 
                    variant="outline" 
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                    onClick={() => downloadReceipt(selectedTransaction.id)}
                  >
                    <ReceiptIcon className="mr-2 h-4 w-4" />
                    Comprovante
                  </Button>
                )}
                
                {selectedTransaction.invoice && (
                  <Button 
                    variant="outline"
                    className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                    onClick={() => downloadInvoice(selectedTransaction.invoice!)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Nota Fiscal
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </SupplierLayout>
  );
}