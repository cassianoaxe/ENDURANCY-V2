import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Clock, 
  FileText, 
  PlusCircle, 
  Search, 
  SlidersHorizontal,
  Calendar,
  Building,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

// Tender interface
interface Tender {
  id: number;
  title: string;
  description: string;
  status: 'draft' | 'open' | 'closed' | 'awarded' | 'cancelled';
  type: 'open' | 'selective' | 'direct';
  budget?: number;
  organizationId: number;
  organizationName: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  categories: string[];
  proposalCount: number;
}

// Sample tenders data for UI display
const sampleTenders: Tender[] = [
  {
    id: 1,
    title: "Aquisição de reagentes para análise de canabinóides",
    description: "Fornecimento de reagentes analíticos para cromatografia e análise de canabinóides em laboratório",
    status: 'open',
    type: 'open',
    budget: 15000,
    organizationId: 1,
    organizationName: "Hempmeds",
    startDate: "2025-04-20",
    endDate: "2025-05-20",
    createdAt: "2025-04-20",
    categories: ["Laboratório", "Reagentes", "Análise"],
    proposalCount: 3
  },
  {
    id: 2,
    title: "Contratação de transporte especializado para produtos controlados",
    description: "Serviço de transporte especializado para produtos controlados com rastreamento e segurança",
    status: 'open',
    type: 'selective',
    budget: 25000,
    organizationId: 1,
    organizationName: "Hempmeds",
    startDate: "2025-04-25",
    endDate: "2025-05-25",
    createdAt: "2025-04-25",
    categories: ["Logística", "Transporte", "Segurança"],
    proposalCount: 2
  },
  {
    id: 3,
    title: "Aquisição de equipamentos para cultivo indoor",
    description: "Compra de equipamentos para cultivo indoor controlado, incluindo sistemas de iluminação, ventilação e irrigação",
    status: 'closed',
    type: 'open',
    budget: 95000,
    organizationId: 1,
    organizationName: "Hempmeds",
    startDate: "2025-03-15",
    endDate: "2025-04-15",
    createdAt: "2025-03-15",
    categories: ["Cultivo", "Equipamentos", "Iluminação"],
    proposalCount: 8
  },
  {
    id: 4,
    title: "Fornecimento de embalagens especiais para produtos medicinais",
    description: "Fornecimento contínuo de embalagens especiais com proteção contra luz e umidade para produtos medicinais",
    status: 'awarded',
    type: 'open',
    budget: 35000,
    organizationId: 1,
    organizationName: "Hempmeds",
    startDate: "2025-03-01",
    endDate: "2025-04-01",
    createdAt: "2025-03-01",
    categories: ["Embalagens", "Produtos Médicos"],
    proposalCount: 5
  },
  {
    id: 5,
    title: "Sistema de monitoramento e segurança para instalações de cultivo",
    description: "Instalação de sistema de monitoramento 24h e segurança para instalações de cultivo controlado",
    status: 'draft',
    type: 'selective',
    budget: 45000,
    organizationId: 1,
    organizationName: "Hempmeds",
    startDate: "2025-05-01", 
    endDate: "2025-06-01",
    createdAt: "2025-04-15",
    categories: ["Segurança", "Monitoramento", "Cultivo"],
    proposalCount: 0
  },
  {
    id: 6,
    title: "Consultoria especializada em regulação de cannabis medicinal",
    description: "Serviços de consultoria para adequação às normas regulatórias para medicamentos à base de cannabis",
    status: 'open',
    type: 'direct',
    budget: 30000,
    organizationId: 1,
    organizationName: "Hempmeds",
    startDate: "2025-04-10",
    endDate: "2025-05-10",
    createdAt: "2025-04-10",
    categories: ["Consultoria", "Regulatório", "Cannabis Medicinal"],
    proposalCount: 1
  },
  {
    id: 7,
    title: "Fornecimento de insumos para extração supercrítica",
    description: "Fornecimento de insumos e materiais para processo de extração supercrítica de canabinóides",
    status: 'cancelled',
    type: 'open',
    budget: 55000,
    organizationId: 1,
    organizationName: "Hempmeds",
    startDate: "2025-02-01",
    endDate: "2025-03-01",
    createdAt: "2025-02-01",
    categories: ["Insumos", "Extração", "Produção"],
    proposalCount: 4
  }
];

// Status badge component
const StatusBadge: React.FC<{ status: Tender['status'] }> = ({ status }) => {
  switch (status) {
    case 'draft':
      return <Badge variant="outline" className="bg-gray-100 text-gray-800">Rascunho</Badge>;
    case 'open':
      return <Badge className="bg-green-100 text-green-800 border-green-300">Aberta</Badge>;
    case 'closed':
      return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Fechada</Badge>;
    case 'awarded':
      return <Badge className="bg-purple-100 text-purple-800 border-purple-300">Concluída</Badge>;
    case 'cancelled':
      return <Badge className="bg-red-100 text-red-800 border-red-300">Cancelada</Badge>;
    default:
      return <Badge variant="outline">-</Badge>;
  }
};

// Tender card component
const TenderCard: React.FC<{ tender: Tender }> = ({ tender }) => {
  // Format date to DD/MM/YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Calculate days remaining
  const daysRemaining = () => {
    const today = new Date();
    const endDate = new Date(tender.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">{tender.title}</CardTitle>
          <StatusBadge status={tender.status} />
        </div>
        <CardDescription className="flex items-center mt-1">
          <Building className="h-4 w-4 mr-1" />
          {tender.organizationName}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {tender.description}
        </p>

        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Início: {formatDate(tender.startDate)}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>Fim: {formatDate(tender.endDate)}</span>
          </div>
          {tender.budget && (
            <div className="flex items-center text-muted-foreground">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>Orçamento: R$ {tender.budget.toLocaleString('pt-BR')}</span>
            </div>
          )}
          <div className="flex items-center text-muted-foreground">
            <ClipboardList className="h-4 w-4 mr-1" />
            <span>Propostas: {tender.proposalCount}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {tender.categories.map((category) => (
            <Badge key={category} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
              {category}
            </Badge>
          ))}
        </div>

        {tender.status === 'open' && (
          <div className="flex items-center text-sm font-medium text-orange-600">
            <Timer className="h-4 w-4 mr-1" />
            <span>{daysRemaining()} dias restantes</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-3 flex justify-between bg-gray-50">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/organization/suppliers/tenders/${tender.id}`}>
            <FileText className="h-4 w-4 mr-1" />
            Detalhes
          </Link>
        </Button>
        
        {tender.status === 'open' && (
          <Button size="sm" className="bg-red-600 hover:bg-red-700" asChild>
            <Link href={`/organization/suppliers/tenders/${tender.id}/proposal`}>
              Enviar Proposta
            </Link>
          </Button>
        )}
        
        {tender.status === 'draft' && (
          <Button size="sm" className="bg-red-600 hover:bg-red-700" asChild>
            <Link href={`/organization/suppliers/tenders/${tender.id}/edit`}>
              Publicar
            </Link>
          </Button>
        )}
        
        {tender.status === 'closed' && (
          <Button size="sm" variant="outline" className="text-blue-600 border-blue-200" asChild>
            <Link href={`/organization/suppliers/tenders/${tender.id}/proposals`}>
              Ver Propostas
            </Link>
          </Button>
        )}
        
        {tender.status === 'awarded' && (
          <Button size="sm" variant="outline" className="text-purple-600 border-purple-200" asChild>
            <Link href={`/organization/suppliers/tenders/${tender.id}/award`}>
              Ver Vencedor
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

// Render table row for tender in list view
const TenderRow: React.FC<{ tender: Tender }> = ({ tender }) => {
  // Format date to DD/MM/YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{tender.title}</div>
        <div className="text-sm text-muted-foreground line-clamp-1">{tender.description}</div>
      </TableCell>
      <TableCell>
        <StatusBadge status={tender.status} />
      </TableCell>
      <TableCell>{formatDate(tender.startDate)}</TableCell>
      <TableCell>{formatDate(tender.endDate)}</TableCell>
      <TableCell>{tender.budget ? `R$ ${tender.budget.toLocaleString('pt-BR')}` : '-'}</TableCell>
      <TableCell>{tender.proposalCount}</TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/organization/suppliers/tenders/${tender.id}`}>
              Detalhes
            </Link>
          </Button>
          
          {tender.status === 'open' && (
            <Button size="sm" className="bg-red-600 hover:bg-red-700" asChild>
              <Link href={`/organization/suppliers/tenders/${tender.id}/proposal`}>
                Proposta
              </Link>
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

// Main Tenders Component
export default function SupplierTenders() {
  // In a real implementation, fetch tenders from API
  const { data: tenders, isLoading } = useQuery({
    queryKey: ["/api/suppliers/tenders"],
    queryFn: () => Promise.resolve(sampleTenders), // Using mock data for demo
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState('endDate');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  
  // Filter and sort tenders
  const filteredTenders = React.useMemo(() => {
    if (!tenders) return [];
    
    return tenders.filter(tender => {
      // Filter by search query
      if (searchQuery && !tender.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by status
      if (statusFilter !== 'all' && tender.status !== statusFilter) {
        return false;
      }
      
      return true;
    });
  }, [tenders, searchQuery, statusFilter]);

  // Sort filtered tenders
  const sortedTenders = React.useMemo(() => {
    if (!filteredTenders) return [];
    
    return [...filteredTenders].sort((a, b) => {
      switch (sortOrder) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'budget':
          return (b.budget || 0) - (a.budget || 0);
        case 'startDate':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case 'endDate':
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        case 'proposals':
          return b.proposalCount - a.proposalCount;
        default:
          return 0;
      }
    });
  }, [filteredTenders, sortOrder]);

  // Pagination
  const itemsPerPage = viewMode === 'card' ? 9 : 10;
  const totalPages = Math.ceil(sortedTenders.length / itemsPerPage);
  const currentItems = sortedTenders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortOrder]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center mb-4">
        <Button asChild variant="ghost" className="mr-2">
          <Link href="/organization/suppliers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Licitações</h1>
          <p className="text-muted-foreground">
            Gerencie e participe de licitações para fornecimento de produtos e serviços
          </p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 sm:items-center">
        <div className="relative sm:max-w-xs w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar licitações..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="open">Aberta</SelectItem>
              <SelectItem value="closed">Fechada</SelectItem>
              <SelectItem value="awarded">Concluída</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[180px]">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="endDate">Data de Término</SelectItem>
              <SelectItem value="startDate">Data de Início</SelectItem>
              <SelectItem value="title">Título</SelectItem>
              <SelectItem value="budget">Orçamento</SelectItem>
              <SelectItem value="proposals">Nº de Propostas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex sm:ml-auto space-x-2">
          <Tabs 
            value={viewMode} 
            onValueChange={(value) => setViewMode(value as 'card' | 'table')}
            className="w-[200px]"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="card">Cartões</TabsTrigger>
              <TabsTrigger value="table">Tabela</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button className="bg-red-600 hover:bg-red-700" asChild>
            <Link href="/organization/suppliers/tenders/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Licitação
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Results summary */}
      <div className="text-sm text-gray-500">
        Mostrando {currentItems.length} de {filteredTenders.length} licitações
      </div>
      
      {/* Tenders display - Card view */}
      {viewMode === 'card' && (
        <>
          {currentItems.length === 0 ? (
            <Card className="p-8 text-center">
              <CardTitle className="mb-2">Nenhuma licitação encontrada</CardTitle>
              <CardDescription>
                Tente ajustar seus filtros ou termos de busca.
              </CardDescription>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentItems.map((tender) => (
                <TenderCard key={tender.id} tender={tender} />
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Tenders display - Table view */}
      {viewMode === 'table' && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Início</TableHead>
                  <TableHead>Data Fim</TableHead>
                  <TableHead>Orçamento</TableHead>
                  <TableHead>Propostas</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <AlertCircle className="h-6 w-6 text-gray-400" />
                        <p className="text-lg font-medium">Nenhuma licitação encontrada</p>
                        <p className="text-sm text-gray-500">Tente ajustar seus filtros ou termos de busca.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((tender) => (
                    <TenderRow key={tender.id} tender={tender} />
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => setCurrentPage(page)}
                  className={page === currentPage ? 'bg-red-600 text-white hover:bg-red-700' : ''}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}