import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Download, Search, Filter, Plus, Receipt, CreditCard } from 'lucide-react';
import LaboratoryLayout from '@/components/layout/laboratory/LaboratoryLayout';

// Tipos de dados para os pagamentos
interface Pagamento {
  id: number;
  cliente: string;
  referencia: string;
  dataPagamento: string;
  valor: number;
  metodo: 'pix' | 'credito' | 'boleto' | 'transferencia';
  status: 'confirmado' | 'pendente' | 'rejeitado';
  numeroFatura?: string;
}

// Dados simulados para demonstração
const pagamentosMock: Pagamento[] = [
  {
    id: 1,
    cliente: 'Dall Solutions',
    referencia: 'PAG-2025-0001',
    dataPagamento: '2025-04-01',
    valor: 1500.00,
    metodo: 'pix',
    status: 'confirmado',
    numeroFatura: 'FAT-2025-0001'
  },
  {
    id: 2,
    cliente: 'Farmácia Vida Verde',
    referencia: 'PAG-2025-0002',
    dataPagamento: '2025-04-05',
    valor: 2750.50,
    metodo: 'boleto',
    status: 'confirmado',
    numeroFatura: 'FAT-2025-0002'
  },
  {
    id: 3,
    cliente: 'Associação Esperança',
    referencia: 'PAG-2025-0003',
    dataPagamento: '2025-04-10',
    valor: 1230.75,
    metodo: 'credito',
    status: 'confirmado',
    numeroFatura: 'FAT-2025-0003'
  },
  {
    id: 4,
    cliente: 'Instituto Cannabis Brasil',
    referencia: 'PAG-2025-0004',
    dataPagamento: '2025-04-15',
    valor: 3200.00,
    metodo: 'transferencia',
    status: 'pendente',
    numeroFatura: 'FAT-2025-0004'
  },
  {
    id: 5,
    cliente: 'Distribuidora Medicinal',
    referencia: 'PAG-2025-0005',
    dataPagamento: '2025-04-20',
    valor: 950.25,
    metodo: 'pix',
    status: 'pendente',
    numeroFatura: 'FAT-2025-0005'
  },
  {
    id: 6,
    cliente: 'CannaTech Solutions',
    referencia: 'PAG-2025-0006',
    dataPagamento: '2025-03-25',
    valor: 4500.00,
    metodo: 'boleto',
    status: 'rejeitado',
    numeroFatura: 'FAT-2025-0006'
  },
  {
    id: 7,
    cliente: 'Farmácia Bem Estar',
    referencia: 'PAG-2025-0007',
    dataPagamento: '2025-04-01',
    valor: 1875.50,
    metodo: 'pix',
    status: 'confirmado',
    numeroFatura: 'FAT-2025-0007'
  },
  {
    id: 8,
    cliente: 'Centro de Pesquisa Cannábica',
    referencia: 'PAG-2025-0008',
    dataPagamento: '2025-04-01',
    valor: 6250.00,
    metodo: 'credito',
    status: 'confirmado',
    numeroFatura: 'FAT-2025-0008'
  },
];

// Componente para o status do pagamento com cores diferentes
const StatusBadge = ({ status }: { status: Pagamento['status'] }) => {
  const styles = {
    confirmado: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmado' },
    pendente: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendente' },
    rejeitado: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejeitado' },
  };

  const style = styles[status];
  
  return (
    <Badge variant="outline" className={`${style.bg} ${style.text} border-0`}>
      {style.label}
    </Badge>
  );
};

// Componente para o método de pagamento
const MetodoPagamento = ({ metodo }: { metodo: Pagamento['metodo'] }) => {
  const methods = {
    pix: { label: 'PIX', icon: <Receipt size={14} className="mr-1" /> },
    credito: { label: 'Cartão de Crédito', icon: <CreditCard size={14} className="mr-1" /> },
    boleto: { label: 'Boleto', icon: <Receipt size={14} className="mr-1" /> },
    transferencia: { label: 'Transferência', icon: <Receipt size={14} className="mr-1" /> },
  };

  const method = methods[metodo];
  
  return (
    <div className="flex items-center">
      {method.icon}
      <span>{method.label}</span>
    </div>
  );
};

// Formatar valores monetários
const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

// Formatar datas
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

export default function FinanceiroPagamentos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTab, setCurrentTab] = useState('todos');
  const itemsPerPage = 5;

  // Filtrar pagamentos com base na tab atual
  const filteredByTab = currentTab === 'todos' 
    ? pagamentosMock 
    : pagamentosMock.filter(pagamento => pagamento.status === currentTab);

  // Filtrar pagamentos com base na busca e filtro de status
  const filteredPagamentos = filteredByTab.filter(pagamento => {
    const matchesSearch = 
      pagamento.referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pagamento.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pagamento.numeroFatura && pagamento.numeroFatura.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === '' || pagamento.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPagamentos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPagamentos.length / itemsPerPage);

  // Stats
  const totalConfirmados = pagamentosMock.filter(p => p.status === 'confirmado').reduce((acc, curr) => acc + curr.valor, 0);
  const totalPendentes = pagamentosMock.filter(p => p.status === 'pendente').reduce((acc, curr) => acc + curr.valor, 0);
  const totalRejeitados = pagamentosMock.filter(p => p.status === 'rejeitado').reduce((acc, curr) => acc + curr.valor, 0);

  return (
    <LaboratoryLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Pagamentos</h1>
          <div className="flex space-x-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Download size={16} />
              Exportar
            </Button>
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus size={16} />
              Registrar Pagamento
            </Button>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pagamentos Confirmados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalConfirmados)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {pagamentosMock.filter(p => p.status === 'confirmado').length} transações
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pagamentos Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(totalPendentes)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {pagamentosMock.filter(p => p.status === 'pendente').length} transações
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pagamentos Rejeitados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalRejeitados)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {pagamentosMock.filter(p => p.status === 'rejeitado').length} transações
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="todos" value={currentTab} onValueChange={setCurrentTab}>
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="confirmado">Confirmados</TabsTrigger>
            <TabsTrigger value="pendente">Pendentes</TabsTrigger>
            <TabsTrigger value="rejeitado">Rejeitados</TabsTrigger>
          </TabsList>
          
          <TabsContent value={currentTab}>
            <div className="flex flex-col md:flex-row gap-4 my-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Buscar por referência, cliente ou fatura..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-52">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Filter size={16} />
                      <SelectValue placeholder="Filtrar por método" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os métodos</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="w-40">Referência</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Fatura</TableHead>
                      <TableHead className="text-center">Data</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.length > 0 ? (
                      currentItems.map((pagamento) => (
                        <TableRow key={pagamento.id}>
                          <TableCell className="font-medium">{pagamento.referencia}</TableCell>
                          <TableCell>{pagamento.cliente}</TableCell>
                          <TableCell>{pagamento.numeroFatura || '-'}</TableCell>
                          <TableCell className="text-center">{formatDate(pagamento.dataPagamento)}</TableCell>
                          <TableCell><MetodoPagamento metodo={pagamento.metodo} /></TableCell>
                          <TableCell className="text-right">{formatCurrency(pagamento.valor)}</TableCell>
                          <TableCell className="text-center">
                            <StatusBadge status={pagamento.status} />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          Nenhum pagamento encontrado com os filtros aplicados.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {filteredPagamentos.length > 0 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Exibindo {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredPagamentos.length)} de {filteredPagamentos.length} pagamentos
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <PaginationItem key={page}>
                        <PaginationLink 
                          isActive={page === currentPage}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </LaboratoryLayout>
  );
}