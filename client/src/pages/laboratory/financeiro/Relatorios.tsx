import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Download, FilePieChart, Filter, PieChart, BarChart4, FileDown, Clock, Calendar, LineChart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
// import { DatePickerWithRange } from '@/components/ui/date-range-picker';
// O componente DatePickerWithRange será implementado posteriormente
import LaboratoryLayout from '@/components/layout/laboratory/LaboratoryLayout';

// Tipos de dados para os relatórios
interface Relatorio {
  id: number;
  nome: string;
  descricao: string;
  tipo: 'financeiro' | 'clientes' | 'amostras' | 'pagamentos';
  formato: 'pdf' | 'excel' | 'csv';
  ultimaGeracao: string | null;
  status: 'pronto' | 'gerando' | 'agendado' | 'erro';
  progresso?: number;
}

// Dados simulados para demonstração
const relatoriosMock: Relatorio[] = [
  {
    id: 1,
    nome: 'Relatório Financeiro Mensal',
    descricao: 'Resumo de todas as transações financeiras do mês',
    tipo: 'financeiro',
    formato: 'pdf',
    ultimaGeracao: '2025-04-01',
    status: 'pronto'
  },
  {
    id: 2,
    nome: 'Análise de Clientes',
    descricao: 'Análise detalhada de todos os clientes e seus pedidos',
    tipo: 'clientes',
    formato: 'excel',
    ultimaGeracao: '2025-04-05',
    status: 'pronto'
  },
  {
    id: 3,
    nome: 'Relatório de Amostras Processadas',
    descricao: 'Detalhamento das amostras processadas no período',
    tipo: 'amostras',
    formato: 'excel',
    ultimaGeracao: '2025-04-10',
    status: 'pronto'
  },
  {
    id: 4,
    nome: 'Relatório de Pagamentos Pendentes',
    descricao: 'Lista de todos os pagamentos pendentes de clientes',
    tipo: 'pagamentos',
    formato: 'pdf',
    ultimaGeracao: null,
    status: 'gerando',
    progresso: 45
  },
  {
    id: 5,
    nome: 'Demonstrativo de Resultados',
    descricao: 'Demonstrativo completo de resultados financeiros',
    tipo: 'financeiro',
    formato: 'pdf',
    ultimaGeracao: null,
    status: 'agendado'
  },
  {
    id: 6,
    nome: 'Exportação de Dados de Clientes',
    descricao: 'Exportação completa de dados de clientes',
    tipo: 'clientes',
    formato: 'csv',
    ultimaGeracao: '2025-03-25',
    status: 'pronto'
  },
  {
    id: 7,
    nome: 'Relatório de Faturamento por Cliente',
    descricao: 'Análise de faturamento discriminado por cliente',
    tipo: 'financeiro',
    formato: 'excel',
    ultimaGeracao: '2025-04-15',
    status: 'pronto'
  },
  {
    id: 8,
    nome: 'Relatório de Erros de Processamento',
    descricao: 'Relatório de erros ocorridos durante processamento de amostras',
    tipo: 'amostras',
    formato: 'pdf',
    ultimaGeracao: '2025-04-12',
    status: 'erro'
  }
];

// Ícones para os tipos de relatórios
const TipoRelatorioIcon = ({ tipo }: { tipo: Relatorio['tipo'] }) => {
  const iconMap = {
    financeiro: <PieChart className="h-5 w-5 text-blue-600" />,
    clientes: <BarChart4 className="h-5 w-5 text-green-600" />,
    amostras: <FilePieChart className="h-5 w-5 text-purple-600" />,
    pagamentos: <LineChart className="h-5 w-5 text-amber-600" />
  };

  return iconMap[tipo];
};

// Componente para o formato do relatório
const FormatoRelatorio = ({ formato }: { formato: Relatorio['formato'] }) => {
  const formatoMap = {
    pdf: { label: 'PDF', className: 'text-red-600' },
    excel: { label: 'Excel', className: 'text-green-600' },
    csv: { label: 'CSV', className: 'text-blue-600' }
  };

  const format = formatoMap[formato];
  
  return (
    <span className={`font-medium ${format.className}`}>
      {format.label}
    </span>
  );
};

// Componente para o status do relatório
const StatusRelatorio = ({ relatorio }: { relatorio: Relatorio }) => {
  const { status, progresso } = relatorio;
  
  if (status === 'pronto') {
    return (
      <div className="flex items-center text-green-600">
        <FileDown className="h-4 w-4 mr-1" />
        <span>Pronto para download</span>
      </div>
    );
  }
  
  if (status === 'gerando') {
    return (
      <div className="space-y-1">
        <div className="flex items-center text-amber-600">
          <Clock className="h-4 w-4 mr-1" />
          <span>Gerando ({progresso}%)</span>
        </div>
        <Progress value={progresso} className="h-1" />
      </div>
    );
  }
  
  if (status === 'agendado') {
    return (
      <div className="flex items-center text-blue-600">
        <Calendar className="h-4 w-4 mr-1" />
        <span>Agendado</span>
      </div>
    );
  }
  
  if (status === 'erro') {
    return (
      <div className="flex items-center text-red-600">
        <AlertCircle className="h-4 w-4 mr-1" />
        <span>Erro ao gerar</span>
      </div>
    );
  }
  
  return null;
};

// Formatar datas
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Nunca gerado';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

export default function FinanceiroRelatorios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('');
  const [currentTab, setCurrentTab] = useState('todos');
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState({ from: new Date(), to: new Date() });

  // Filtrar relatórios com base na tab atual
  const filteredByTab = currentTab === 'todos' 
    ? relatoriosMock 
    : relatoriosMock.filter(relatorio => relatorio.status === currentTab);

  // Filtrar relatórios com base na busca e filtro de tipo
  const filteredRelatorios = filteredByTab.filter(relatorio => {
    const matchesSearch = 
      relatorio.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      relatorio.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = tipoFilter === '' || relatorio.tipo === tipoFilter;
    
    return matchesSearch && matchesTipo;
  });

  // Função para gerar relatório
  const gerarRelatorio = (relatorio: Relatorio) => {
    toast({
      title: "Gerando relatório",
      description: `Iniciando geração do relatório "${relatorio.nome}"`,
    });
    
    // Simulação de geração (em produção, isso seria uma chamada de API)
    setTimeout(() => {
      toast({
        title: "Relatório gerado com sucesso",
        description: `O relatório "${relatorio.nome}" está pronto para download.`,
      });
    }, 3000);
  };

  // Função para fazer download de relatório
  const downloadRelatorio = (relatorio: Relatorio) => {
    toast({
      title: "Download iniciado",
      description: `O download do relatório "${relatorio.nome}" foi iniciado.`,
    });
    
    // Simulação de download (em produção, isso chamaria uma API)
  };

  return (
    <LaboratoryLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Relatórios Financeiros</h1>
        </div>

        {/* Cards de ações rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-blue-800">Relatório Mensal</CardTitle>
              <CardDescription>Resumo financeiro completo</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <PieChart className="h-10 w-10 text-blue-600 mb-2" />
              <p className="text-sm text-blue-700">
                Gere um relatório completo com todas as transações financeiras do mês atual.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                onClick={() => gerarRelatorio(relatoriosMock[0])}
              >
                Gerar Relatório
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-green-800">Análise de Clientes</CardTitle>
              <CardDescription>Dados de todos os clientes</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <BarChart4 className="h-10 w-10 text-green-600 mb-2" />
              <p className="text-sm text-green-700">
                Obtenha insights detalhados sobre a atividade de todos os clientes do laboratório.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => gerarRelatorio(relatoriosMock[1])}
              >
                Gerar Relatório
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-purple-800">Amostras Processadas</CardTitle>
              <CardDescription>Resumo de todas as amostras</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <FilePieChart className="h-10 w-10 text-purple-600 mb-2" />
              <p className="text-sm text-purple-700">
                Visualize estatísticas detalhadas de todas as amostras processadas recentemente.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => gerarRelatorio(relatoriosMock[2])}
              >
                Gerar Relatório
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-amber-800">Pagamentos Pendentes</CardTitle>
              <CardDescription>Lista de pagamentos não recebidos</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <LineChart className="h-10 w-10 text-amber-600 mb-2" />
              <p className="text-sm text-amber-700">
                Acompanhe todos os pagamentos pendentes e faturas em aberto atualmente.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-amber-600 hover:bg-amber-700"
                onClick={() => gerarRelatorio(relatoriosMock[3])}
              >
                Gerar Relatório
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Relatório personalizado */}
        <Card>
          <CardHeader>
            <CardTitle>Relatório Personalizado</CardTitle>
            <CardDescription>
              Gere relatórios específicos para um período e tipo de dado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Período</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="date" className="w-full" placeholder="Data inicial" />
                  <Input type="date" className="w-full" placeholder="Data final" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Relatório</label>
                <Select defaultValue="financeiro">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="clientes">Clientes</SelectItem>
                    <SelectItem value="amostras">Amostras</SelectItem>
                    <SelectItem value="pagamentos">Pagamentos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Formato</label>
                <Select defaultValue="pdf">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700">
              Gerar Relatório Personalizado
            </Button>
          </CardContent>
        </Card>
        
        {/* Histórico de Relatórios */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Relatórios</CardTitle>
            <CardDescription>
              Consulte e faça download dos relatórios anteriores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="todos" value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="pronto">Prontos</TabsTrigger>
                <TabsTrigger value="gerando">Em processamento</TabsTrigger>
                <TabsTrigger value="agendado">Agendados</TabsTrigger>
                <TabsTrigger value="erro">Com erro</TabsTrigger>
              </TabsList>
              
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-grow">
                  <Input
                    placeholder="Buscar por nome ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-64">
                  <Select value={tipoFilter} onValueChange={setTipoFilter}>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Filtrar por tipo" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os tipos</SelectItem>
                      <SelectItem value="financeiro">Financeiro</SelectItem>
                      <SelectItem value="clientes">Clientes</SelectItem>
                      <SelectItem value="amostras">Amostras</SelectItem>
                      <SelectItem value="pagamentos">Pagamentos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <TabsContent value={currentTab}>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead className="hidden md:table-cell">Formato</TableHead>
                        <TableHead className="hidden md:table-cell">Última Geração</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRelatorios.length > 0 ? (
                        filteredRelatorios.map((relatorio) => (
                          <TableRow key={relatorio.id}>
                            <TableCell>
                              <TipoRelatorioIcon tipo={relatorio.tipo} />
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{relatorio.nome}</div>
                                <div className="text-xs text-gray-500 mt-1">{relatorio.descricao}</div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <FormatoRelatorio formato={relatorio.formato} />
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{formatDate(relatorio.ultimaGeracao)}</TableCell>
                            <TableCell>
                              <StatusRelatorio relatorio={relatorio} />
                            </TableCell>
                            <TableCell className="text-right">
                              {relatorio.status === 'pronto' ? (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-blue-600"
                                  onClick={() => downloadRelatorio(relatorio)}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                              ) : relatorio.status === 'erro' ? (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() => gerarRelatorio(relatorio)}
                                >
                                  Tentar Novamente
                                </Button>
                              ) : relatorio.status === 'agendado' ? (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-blue-600"
                                  onClick={() => gerarRelatorio(relatorio)}
                                >
                                  Gerar Agora
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  disabled
                                >
                                  Aguarde...
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            Nenhum relatório encontrado com os filtros aplicados.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </LaboratoryLayout>
  );
}