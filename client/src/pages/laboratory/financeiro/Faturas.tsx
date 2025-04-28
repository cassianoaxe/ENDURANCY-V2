import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Search, Filter, Plus, Calendar, ArrowUpDown } from 'lucide-react';
import LaboratoryLayout from '@/components/layout/laboratory/LaboratoryLayout';

// Tipos de dados para as faturas
interface Fatura {
  id: number;
  numero: string;
  cliente: string;
  dataEmissao: string;
  dataVencimento: string;
  valor: number;
  status: 'paga' | 'pendente' | 'atrasada' | 'cancelada';
}

// Dados simulados para demonstração
const faturasMock: Fatura[] = [
  {
    id: 1,
    numero: 'FAT-2025-0001',
    cliente: 'Dall Solutions',
    dataEmissao: '2025-04-01',
    dataVencimento: '2025-05-01',
    valor: 1500.00,
    status: 'pendente'
  },
  {
    id: 2,
    numero: 'FAT-2025-0002',
    cliente: 'Farmácia Vida Verde',
    dataEmissao: '2025-04-05',
    dataVencimento: '2025-05-05',
    valor: 2750.50,
    status: 'paga'
  },
  {
    id: 3,
    numero: 'FAT-2025-0003',
    cliente: 'Associação Esperança',
    dataEmissao: '2025-04-10',
    dataVencimento: '2025-05-10',
    valor: 1230.75,
    status: 'paga'
  },
  {
    id: 4,
    numero: 'FAT-2025-0004',
    cliente: 'Instituto Cannabis Brasil',
    dataEmissao: '2025-03-15',
    dataVencimento: '2025-04-15',
    valor: 3200.00,
    status: 'atrasada'
  },
  {
    id: 5,
    numero: 'FAT-2025-0005',
    cliente: 'Distribuidora Medicinal',
    dataEmissao: '2025-04-20',
    dataVencimento: '2025-05-20',
    valor: 950.25,
    status: 'pendente'
  },
  {
    id: 6,
    numero: 'FAT-2025-0006',
    cliente: 'CannaTech Solutions',
    dataEmissao: '2025-03-25',
    dataVencimento: '2025-04-25',
    valor: 4500.00,
    status: 'atrasada'
  },
  {
    id: 7,
    numero: 'FAT-2025-0007',
    cliente: 'Farmácia Bem Estar',
    dataEmissao: '2025-04-01',
    dataVencimento: '2025-05-01',
    valor: 1875.50,
    status: 'pendente'
  },
  {
    id: 8,
    numero: 'FAT-2025-0008',
    cliente: 'Centro de Pesquisa Cannábica',
    dataEmissao: '2025-04-01',
    dataVencimento: '2025-05-01',
    valor: 6250.00,
    status: 'paga'
  },
];

// Componente para o status da fatura com cores diferentes
const StatusBadge = ({ status }: { status: Fatura['status'] }) => {
  const styles = {
    paga: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paga' },
    pendente: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Pendente' },
    atrasada: { bg: 'bg-red-100', text: 'text-red-800', label: 'Atrasada' },
    cancelada: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelada' },
  };

  const style = styles[status];
  
  return (
    <Badge variant="outline" className={`${style.bg} ${style.text} border-0`}>
      {style.label}
    </Badge>
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

export default function FinanceiroFaturas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtrar faturas
  const filteredFaturas = faturasMock.filter(fatura => {
    const matchesSearch = 
      fatura.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fatura.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || fatura.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFaturas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFaturas.length / itemsPerPage);

  return (
    <LaboratoryLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Faturas</h1>
          <div className="flex space-x-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Download size={16} />
              Exportar
            </Button>
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus size={16} />
              Nova Fatura
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 my-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Buscar por número ou cliente..."
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
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="paga">Paga</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="atrasada">Atrasada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-40">Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-center">Data Emissão</TableHead>
                  <TableHead className="text-center">Data Vencimento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((fatura) => (
                    <TableRow key={fatura.id}>
                      <TableCell className="font-medium">{fatura.numero}</TableCell>
                      <TableCell>{fatura.cliente}</TableCell>
                      <TableCell className="text-center">{formatDate(fatura.dataEmissao)}</TableCell>
                      <TableCell className="text-center">{formatDate(fatura.dataVencimento)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(fatura.valor)}</TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={fatura.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <FileText size={16} />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Download size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Nenhuma fatura encontrada com os filtros aplicados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {filteredFaturas.length > 0 && (
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Exibindo {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredFaturas.length)} de {filteredFaturas.length} faturas
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
      </div>
    </LaboratoryLayout>
  );
}