import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clipboard, Copy, Download, Search, Filter, Link2, Plus, Share2, ExternalLink, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import LaboratoryLayout from '@/components/layout/laboratory/LaboratoryLayout';

// Tipos de dados para os links de pagamento
interface LinkPagamento {
  id: number;
  nome: string;
  descricao: string;
  url: string;
  valor: number;
  dataCriacao: string;
  dataExpiracao: string | null;
  status: 'ativo' | 'expirado' | 'pago' | 'cancelado';
  cliente?: string;
  acessos: number;
  usos: number;
}

// Dados simulados para demonstração
const linksMock: LinkPagamento[] = [
  {
    id: 1,
    nome: 'Análise de Canabinoides',
    descricao: 'Análise completa de canabinoides para Dall Solutions',
    url: 'https://pagamento.labanalytics.com/a1b2c3',
    valor: 1500.00,
    dataCriacao: '2025-04-01',
    dataExpiracao: '2025-05-01',
    status: 'ativo',
    cliente: 'Dall Solutions',
    acessos: 8,
    usos: 0
  },
  {
    id: 2,
    nome: 'Pacote Análises Farmacêuticas',
    descricao: 'Pacote completo para Farmácia Vida Verde',
    url: 'https://pagamento.labanalytics.com/d4e5f6',
    valor: 2750.50,
    dataCriacao: '2025-04-05',
    dataExpiracao: '2025-05-05',
    status: 'pago',
    cliente: 'Farmácia Vida Verde',
    acessos: 5,
    usos: 1
  },
  {
    id: 3,
    nome: 'Laudo de Estabilidade',
    descricao: 'Análise de estabilidade para produtos da Associação Esperança',
    url: 'https://pagamento.labanalytics.com/g7h8i9',
    valor: 1230.75,
    dataCriacao: '2025-04-10',
    dataExpiracao: null,
    status: 'ativo',
    cliente: 'Associação Esperança',
    acessos: 12,
    usos: 0
  },
  {
    id: 4,
    nome: 'Análise Microbiológica',
    descricao: 'Análise microbiológica completa para Instituto Cannabis Brasil',
    url: 'https://pagamento.labanalytics.com/j1k2l3',
    valor: 3200.00,
    dataCriacao: '2025-03-15',
    dataExpiracao: '2025-04-15',
    status: 'expirado',
    cliente: 'Instituto Cannabis Brasil',
    acessos: 3,
    usos: 0
  },
  {
    id: 5,
    nome: 'Teste de Metais Pesados',
    descricao: 'Análise de metais pesados para Distribuidora Medicinal',
    url: 'https://pagamento.labanalytics.com/m4n5o6',
    valor: 950.25,
    dataCriacao: '2025-04-20',
    dataExpiracao: '2025-05-20',
    status: 'ativo',
    cliente: 'Distribuidora Medicinal',
    acessos: 7,
    usos: 0
  },
  {
    id: 6,
    nome: 'Pacote Análises Premium',
    descricao: 'Pacote de análises avançadas para CannaTech Solutions',
    url: 'https://pagamento.labanalytics.com/p7q8r9',
    valor: 4500.00,
    dataCriacao: '2025-03-25',
    dataExpiracao: '2025-04-25',
    status: 'cancelado',
    cliente: 'CannaTech Solutions',
    acessos: 0,
    usos: 0
  },
  {
    id: 7,
    nome: 'Análise de Resíduos',
    descricao: 'Análise de resíduos de solventes para Farmácia Bem Estar',
    url: 'https://pagamento.labanalytics.com/s1t2u3',
    valor: 1875.50,
    dataCriacao: '2025-04-01',
    dataExpiracao: '2025-06-01',
    status: 'ativo',
    cliente: 'Farmácia Bem Estar',
    acessos: 4,
    usos: 0
  },
  {
    id: 8,
    nome: 'Link público análises',
    descricao: 'Link para qualquer cliente - análises gerais',
    url: 'https://pagamento.labanalytics.com/v4w5x6',
    valor: 1250.00,
    dataCriacao: '2025-04-01',
    dataExpiracao: null,
    status: 'ativo',
    acessos: 25,
    usos: 3
  },
];

// Componente para o status do link de pagamento com cores diferentes
const StatusBadge = ({ status }: { status: LinkPagamento['status'] }) => {
  const styles = {
    ativo: { bg: 'bg-green-100', text: 'text-green-800', label: 'Ativo' },
    expirado: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Expirado' },
    pago: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Pago' },
    cancelado: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' },
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
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Sem expiração';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

// Truncar URL
const truncateUrl = (url: string) => {
  if (url.length > 30) {
    return url.substring(0, 30) + '...';
  }
  return url;
};

export default function FinanceiroLinks() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTab, setCurrentTab] = useState('todos');
  const itemsPerPage = 5;

  // Filtrar links com base na tab atual
  const filteredByTab = currentTab === 'todos' 
    ? linksMock 
    : linksMock.filter(link => link.status === currentTab);

  // Filtrar links com base na busca e filtro de status
  const filteredLinks = filteredByTab.filter(link => {
    const matchesSearch = 
      link.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (link.cliente && link.cliente.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === '' || link.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLinks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLinks.length / itemsPerPage);

  // Stats
  const totalAtivos = linksMock.filter(l => l.status === 'ativo').length;
  const totalUsados = linksMock.reduce((acc, curr) => acc + curr.usos, 0);
  const totalValor = linksMock.filter(l => l.status === 'ativo').reduce((acc, curr) => acc + curr.valor, 0);

  // Função para copiar link para a área de transferência
  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link copiado!",
        description: "Link de pagamento copiado para a área de transferência.",
      });
    }).catch((err) => {
      toast({
        title: "Erro ao copiar link",
        description: "Não foi possível copiar o link. Tente novamente.",
        variant: "destructive",
      });
      console.error('Erro ao copiar: ', err);
    });
  };

  return (
    <LaboratoryLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Links de Pagamento</h1>
          <div className="flex space-x-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Download size={16} />
              Exportar
            </Button>
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus size={16} />
              Novo Link
            </Button>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Links Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {totalAtivos}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                No valor total de {formatCurrency(totalValor)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total de Usos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalUsados}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Pagamentos recebidos por link
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Valor Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(totalValor / Math.max(totalAtivos, 1))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Por link de pagamento
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="todos" value={currentTab} onValueChange={setCurrentTab}>
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="ativo">Ativos</TabsTrigger>
            <TabsTrigger value="pago">Pagos</TabsTrigger>
            <TabsTrigger value="expirado">Expirados</TabsTrigger>
            <TabsTrigger value="cancelado">Cancelados</TabsTrigger>
          </TabsList>
          
          <TabsContent value={currentTab}>
            <div className="flex flex-col md:flex-row gap-4 my-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Buscar por nome, descrição ou cliente..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="w-40">Nome</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="hidden md:table-cell">Link</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-center hidden md:table-cell">Expiração</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.length > 0 ? (
                      currentItems.map((link) => (
                        <TableRow key={link.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div>{link.nome}</div>
                              <div className="text-xs text-gray-500">{link.descricao.substring(0, 30)}{link.descricao.length > 30 ? '...' : ''}</div>
                            </div>
                          </TableCell>
                          <TableCell>{link.cliente || 'Público'}</TableCell>
                          <TableCell className="hidden md:table-cell text-gray-500 text-sm">
                            <div className="flex items-center">
                              <Link2 size={14} className="mr-1" />
                              {truncateUrl(link.url)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(link.valor)}</TableCell>
                          <TableCell className="text-center hidden md:table-cell">{formatDate(link.dataExpiracao)}</TableCell>
                          <TableCell className="text-center">
                            <StatusBadge status={link.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => copyLink(link.url)}
                                title="Copiar link"
                              >
                                <Copy size={16} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                title="Abrir link"
                                onClick={() => window.open(link.url, '_blank')}
                              >
                                <ExternalLink size={16} />
                              </Button>
                              {link.status === 'ativo' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  title="Compartilhar"
                                >
                                  <Share2 size={16} />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          Nenhum link de pagamento encontrado com os filtros aplicados.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {filteredLinks.length > 0 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Exibindo {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredLinks.length)} de {filteredLinks.length} links
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