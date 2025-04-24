import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  Package,
  Calendar,
  AlertCircle,
  Users,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  PackageCheck,
  Truck,
  Home
} from 'lucide-react';

import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// Status das importações
enum ImportStatus {
  PENDING_SUBMISSION = 'pending_submission',
  SUBMITTED_TO_ANVISA = 'submitted_to_anvisa',
  ANVISA_APPROVED = 'anvisa_approved',
  PREPARING_SHIPMENT = 'preparing_shipment',
  SHIPPED = 'shipped',
  IN_CUSTOMS = 'in_customs',
  CLEARED_CUSTOMS = 'cleared_customs',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  ANVISA_REJECTED = 'anvisa_rejected'
}

// Mapeamento de status para labels em português
const importStatusLabels: Record<ImportStatus, string> = {
  [ImportStatus.PENDING_SUBMISSION]: 'Pendente de Submissão',
  [ImportStatus.SUBMITTED_TO_ANVISA]: 'Enviado para ANVISA',
  [ImportStatus.ANVISA_APPROVED]: 'Aprovado pela ANVISA',
  [ImportStatus.PREPARING_SHIPMENT]: 'Preparando Envio (EUA)',
  [ImportStatus.SHIPPED]: 'Enviado',
  [ImportStatus.IN_CUSTOMS]: 'Em Liberação Alfandegária',
  [ImportStatus.CLEARED_CUSTOMS]: 'Liberado pela Alfândega',
  [ImportStatus.OUT_FOR_DELIVERY]: 'Em Rota de Entrega',
  [ImportStatus.DELIVERED]: 'Entregue',
  [ImportStatus.ANVISA_REJECTED]: 'Rejeitado pela ANVISA'
};

// Mapeamento de status para cores
const importStatusColors: Record<ImportStatus, string> = {
  [ImportStatus.PENDING_SUBMISSION]: 'bg-gray-100 text-gray-800',
  [ImportStatus.SUBMITTED_TO_ANVISA]: 'bg-blue-100 text-blue-800',
  [ImportStatus.ANVISA_APPROVED]: 'bg-green-100 text-green-800',
  [ImportStatus.PREPARING_SHIPMENT]: 'bg-amber-100 text-amber-800',
  [ImportStatus.SHIPPED]: 'bg-purple-100 text-purple-800',
  [ImportStatus.IN_CUSTOMS]: 'bg-orange-100 text-orange-800',
  [ImportStatus.CLEARED_CUSTOMS]: 'bg-teal-100 text-teal-800',
  [ImportStatus.OUT_FOR_DELIVERY]: 'bg-indigo-100 text-indigo-800',
  [ImportStatus.DELIVERED]: 'bg-emerald-100 text-emerald-800',
  [ImportStatus.ANVISA_REJECTED]: 'bg-red-100 text-red-800'
};

// Mapeamento de status para ícones
const importStatusIcons: Record<ImportStatus, React.ReactNode> = {
  [ImportStatus.PENDING_SUBMISSION]: <FileText className="h-4 w-4" />,
  [ImportStatus.SUBMITTED_TO_ANVISA]: <Clock className="h-4 w-4" />,
  [ImportStatus.ANVISA_APPROVED]: <CheckCircle2 className="h-4 w-4" />,
  [ImportStatus.PREPARING_SHIPMENT]: <Package className="h-4 w-4" />,
  [ImportStatus.SHIPPED]: <Truck className="h-4 w-4" />,
  [ImportStatus.IN_CUSTOMS]: <AlertCircle className="h-4 w-4" />,
  [ImportStatus.CLEARED_CUSTOMS]: <PackageCheck className="h-4 w-4" />,
  [ImportStatus.OUT_FOR_DELIVERY]: <Truck className="h-4 w-4" />,
  [ImportStatus.DELIVERED]: <Home className="h-4 w-4" />,
  [ImportStatus.ANVISA_REJECTED]: <AlertCircle className="h-4 w-4" />
};

// Interface para pedidos de importação
interface ImportOrder {
  id: number;
  patientName: string;
  patientId: number;
  status: ImportStatus;
  productName: string;
  createdAt: string;
  updatedAt: string;
  anvisaSubmissionDate?: string;
  anvisaApprovalDate?: string;
  shippingDate?: string;
  deliveryDate?: string;
  trackingNumber?: string;
  notes?: string;
}

// Interface para o componente StatCard
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  className?: string;
}

// Componente para mostrar estatísticas do dashboard
const StatCard = ({ title, value, icon, description, className = '' }: StatCardProps) => (
  <Card className={className}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="bg-primary/10 p-2 rounded-full">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

// Componente para card de pedido de importação
const ImportOrderCard = ({ order }: { order: ImportOrder }) => {
  // Calcular progresso com base no status
  const getProgressPercentage = (status: ImportStatus): number => {
    const statuses = Object.values(ImportStatus);
    if (status === ImportStatus.ANVISA_REJECTED) {
      return 0;
    }
    const index = statuses.indexOf(status);
    return Math.round((index / (statuses.length - 2)) * 100); // -2 para ignorar o ANVISA_REJECTED
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">#{order.id} - {order.patientName}</CardTitle>
            <CardDescription>{order.productName}</CardDescription>
          </div>
          <Badge className={importStatusColors[order.status]}>
            {importStatusIcons[order.status]}
            <span className="ml-1">{importStatusLabels[order.status]}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1 text-xs">
              <span>Progresso</span>
              <span>{getProgressPercentage(order.status)}%</span>
            </div>
            <Progress value={getProgressPercentage(order.status)} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Data de Solicitação</p>
              <p>{new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
            {order.anvisaSubmissionDate && (
              <div>
                <p className="text-muted-foreground text-xs">Enviado para ANVISA</p>
                <p>{new Date(order.anvisaSubmissionDate).toLocaleDateString('pt-BR')}</p>
              </div>
            )}
            {order.trackingNumber && (
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs">Código de Rastreio</p>
                <p className="font-medium">{order.trackingNumber}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex justify-between w-full">
          <Button variant="outline" size="sm">Ver Detalhes</Button>
          {order.status === ImportStatus.PENDING_SUBMISSION && (
            <Button size="sm">Submeter à ANVISA</Button>
          )}
          {order.status === ImportStatus.ANVISA_APPROVED && (
            <Button size="sm">Iniciar Envio</Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

// Componente principal do Dashboard
export default function ImportCompanyDashboard() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Mock data para visualização
  const mockOrders: ImportOrder[] = [
    {
      id: 1001,
      patientName: "Maria Silva",
      patientId: 1,
      status: ImportStatus.PENDING_SUBMISSION,
      productName: "CBD Oil 1000mg/30ml",
      createdAt: "2025-04-15T10:00:00Z",
      updatedAt: "2025-04-15T10:00:00Z"
    },
    {
      id: 1002,
      patientName: "João Santos",
      patientId: 2,
      status: ImportStatus.SUBMITTED_TO_ANVISA,
      productName: "CBD Oil 2000mg/30ml",
      createdAt: "2025-04-10T14:30:00Z",
      updatedAt: "2025-04-12T09:15:00Z",
      anvisaSubmissionDate: "2025-04-12T09:15:00Z"
    },
    {
      id: 1003,
      patientName: "Ana Oliveira",
      patientId: 3,
      status: ImportStatus.ANVISA_APPROVED,
      productName: "CBD Capsules 25mg x 30",
      createdAt: "2025-04-05T11:20:00Z",
      updatedAt: "2025-04-18T15:45:00Z",
      anvisaSubmissionDate: "2025-04-07T10:30:00Z",
      anvisaApprovalDate: "2025-04-18T15:45:00Z"
    },
    {
      id: 1004,
      patientName: "Carlos Pereira",
      patientId: 4,
      status: ImportStatus.SHIPPED,
      productName: "CBD Oil 1500mg/30ml",
      createdAt: "2025-03-28T09:45:00Z",
      updatedAt: "2025-04-17T16:20:00Z",
      anvisaSubmissionDate: "2025-03-30T11:10:00Z",
      anvisaApprovalDate: "2025-04-10T14:25:00Z",
      shippingDate: "2025-04-17T16:20:00Z",
      trackingNumber: "US123456789BR"
    },
    {
      id: 1005,
      patientName: "Fernanda Lima",
      patientId: 5,
      status: ImportStatus.DELIVERED,
      productName: "CBD Tincture 3000mg/30ml",
      createdAt: "2025-03-15T13:30:00Z",
      updatedAt: "2025-04-12T10:15:00Z",
      anvisaSubmissionDate: "2025-03-17T09:20:00Z",
      anvisaApprovalDate: "2025-03-25T14:30:00Z",
      shippingDate: "2025-03-28T11:45:00Z",
      deliveryDate: "2025-04-12T10:15:00Z",
      trackingNumber: "US987654321BR"
    },
    {
      id: 1006,
      patientName: "Roberto Alves",
      patientId: 6,
      status: ImportStatus.ANVISA_REJECTED,
      productName: "CBD Oil 5000mg/50ml",
      createdAt: "2025-04-01T16:15:00Z",
      updatedAt: "2025-04-18T11:30:00Z",
      anvisaSubmissionDate: "2025-04-03T10:45:00Z",
      notes: "Documentação médica insuficiente. É necessário relatório médico mais detalhado."
    }
  ];
  
  // Em um ambiente real, você usaria a consulta abaixo em vez dos dados mockados
  /*
  const { data: importOrders = [], isLoading } = useQuery<ImportOrder[]>({
    queryKey: ['import-orders'],
    // A consulta real deve ser implementada no backend
  });
  */
  
  // Usando dados mockados para demonstração
  const importOrders = mockOrders;
  
  // Dados para estatísticas do dashboard
  const stats = {
    totalOrders: importOrders.length,
    pendingAnvisa: importOrders.filter(order => order.status === ImportStatus.SUBMITTED_TO_ANVISA).length,
    inTransit: importOrders.filter(order => 
      [ImportStatus.SHIPPED, ImportStatus.IN_CUSTOMS, ImportStatus.CLEARED_CUSTOMS, ImportStatus.OUT_FOR_DELIVERY].includes(order.status)
    ).length,
    delivered: importOrders.filter(order => order.status === ImportStatus.DELIVERED).length
  };
  
  // Filtrar pedidos com base na aba selecionada
  const getFilteredOrders = () => {
    switch(activeTab) {
      case 'pending':
        return importOrders.filter(order => 
          [ImportStatus.PENDING_SUBMISSION, ImportStatus.SUBMITTED_TO_ANVISA].includes(order.status)
        );
      case 'approved':
        return importOrders.filter(order => order.status === ImportStatus.ANVISA_APPROVED);
      case 'in-transit':
        return importOrders.filter(order => 
          [ImportStatus.PREPARING_SHIPMENT, ImportStatus.SHIPPED, ImportStatus.IN_CUSTOMS, 
           ImportStatus.CLEARED_CUSTOMS, ImportStatus.OUT_FOR_DELIVERY].includes(order.status)
        );
      case 'delivered':
        return importOrders.filter(order => order.status === ImportStatus.DELIVERED);
      case 'rejected':
        return importOrders.filter(order => order.status === ImportStatus.ANVISA_REJECTED);
      default:
        return importOrders;
    }
  };
  
  const filteredOrders = getFilteredOrders();
  
  return (
    <OrganizationLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard de Importação</h1>
          <Button>Novo Pedido de Importação</Button>
        </div>
        
        {/* Cards com estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total de Pedidos" 
            value={stats.totalOrders}
            description="Total de pedidos de importação" 
            icon={<Package className="h-4 w-4 text-primary" />}
          />
          <StatCard 
            title="Aguardando ANVISA" 
            value={stats.pendingAnvisa}
            description="Pedidos em análise pela ANVISA" 
            icon={<Clock className="h-4 w-4 text-primary" />}
          />
          <StatCard 
            title="Em Trânsito" 
            value={stats.inTransit}
            description="Pedidos em trânsito internacional" 
            icon={<Truck className="h-4 w-4 text-primary" />}
          />
          <StatCard 
            title="Entregues" 
            value={stats.delivered}
            description="Pedidos entregues ao paciente" 
            icon={<CheckCircle2 className="h-4 w-4 text-primary" />}
          />
        </div>
        
        {/* Guia para visualização de pedidos */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos de Importação</CardTitle>
            <CardDescription>
              Gerencie pedidos de importação de medicamentos CBD via RDC 660
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-6">
                <TabsTrigger value="overview">Todos</TabsTrigger>
                <TabsTrigger value="pending">Pendentes</TabsTrigger>
                <TabsTrigger value="approved">Aprovados</TabsTrigger>
                <TabsTrigger value="in-transit">Em Trânsito</TabsTrigger>
                <TabsTrigger value="delivered">Entregues</TabsTrigger>
                <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <div className="bg-gray-50 p-6 rounded-md text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum pedido encontrado</h3>
                    <p className="text-gray-500">
                      Não há pedidos de importação nesta categoria.
                    </p>
                  </div>
                ) : (
                  <div>
                    {filteredOrders.map((order) => (
                      <ImportOrderCard key={order.id} order={order} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Seção de Links Úteis */}
        <Card>
          <CardHeader>
            <CardTitle>Links Úteis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <a 
                    href="https://www.gov.br/pt-br/servicos/solicitar-autorizacao-para-importacao-excepcional-de-produtos-a-base-de-canabidiol" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary font-medium hover:underline"
                  >
                    Portal de Solicitação de Autorização para Importação Excepcional (ANVISA)
                  </a>
                  <p className="text-sm text-muted-foreground">
                    Link oficial do governo para solicitação de autorização para importação de produtos à base de canabidiol
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <a 
                    href="https://www.gov.br/anvisa/pt-br/assuntos/medicamentos/controlados/importacao-de-canabidiol" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary font-medium hover:underline"
                  >
                    Informações sobre Importação de Canabidiol (ANVISA)
                  </a>
                  <p className="text-sm text-muted-foreground">
                    Orientações e informações da ANVISA sobre o processo de importação de produtos à base de canabidiol
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <a 
                    href="https://www.in.gov.br/en/web/dou/-/resolucao-de-diretoria-colegiada-rdc-n-660-de-30-de-marco-de-2022-389909119" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary font-medium hover:underline"
                  >
                    Resolução de Diretoria Colegiada - RDC Nº 660
                  </a>
                  <p className="text-sm text-muted-foreground">
                    Texto completo da RDC 660 que regulamenta a importação excepcional de produtos à base de canabidiol
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </OrganizationLayout>
  );
}