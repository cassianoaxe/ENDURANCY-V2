import React, { useState } from 'react';
import { useLocation } from 'wouter';
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
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  Search, 
  ArrowRight, 
  Check, 
  X, 
  Settings, 
  RefreshCw 
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type StatusIntegracao = 'ativa' | 'inativa' | 'configuracao-pendente';
type TipoIntegracao = 'contabilidade' | 'erp' | 'crm' | 'ecommerce' | 'marketing';

type Integracao = {
  id: string;
  nome: string;
  descricao: string;
  tipo: TipoIntegracao;
  logoUrl: string;
  status: StatusIntegracao;
  dataCriacao?: string;
  configuracaoUrl?: string;
};

const getStatusColor = (status: StatusIntegracao) => {
  switch (status) {
    case 'ativa':
      return 'bg-green-100 text-green-800';
    case 'inativa':
      return 'bg-gray-100 text-gray-800';
    case 'configuracao-pendente':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

const getStatusText = (status: StatusIntegracao) => {
  switch (status) {
    case 'ativa':
      return 'Ativa';
    case 'inativa':
      return 'Inativa';
    case 'configuracao-pendente':
      return 'Configuração Pendente';
    default:
      return status;
  }
};

const getStatusIcon = (status: StatusIntegracao) => {
  switch (status) {
    case 'ativa':
      return <Check className="h-4 w-4 text-green-600" />;
    case 'inativa':
      return <X className="h-4 w-4 text-gray-600" />;
    case 'configuracao-pendente':
      return <Settings className="h-4 w-4 text-yellow-600" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

const getTipoIcon = (tipo: TipoIntegracao) => {
  switch (tipo) {
    default:
      return <Code className="w-5 h-5" />;
  }
};

const getTipoText = (tipo: TipoIntegracao) => {
  switch (tipo) {
    case 'contabilidade':
      return 'Contabilidade';
    case 'erp':
      return 'ERP';
    case 'crm':
      return 'CRM';
    case 'ecommerce':
      return 'E-commerce';
    case 'marketing':
      return 'Marketing';
    default:
      return tipo;
  }
};

const integracoes: Integracao[] = [
  {
    id: 'contaazul',
    nome: 'ContaAzul',
    descricao: 'Envie suas faturas e transações diretamente para o ContaAzul',
    tipo: 'contabilidade',
    logoUrl: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/contaazul.svg',
    status: 'ativa',
    dataCriacao: '2025-03-15',
    configuracaoUrl: '/organization/integracoes/contaazul',
  },
  {
    id: 'nfse',
    nome: 'Emissor NFSe',
    descricao: 'Integração para emissão automática de notas fiscais de serviço',
    tipo: 'contabilidade',
    logoUrl: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/nfse.svg',
    status: 'configuracao-pendente',
    configuracaoUrl: '/organization/integracoes/nfse',
  },
  {
    id: 'nfe',
    nome: 'Emissor NFe',
    descricao: 'Integração para emissão automática de notas fiscais eletrônicas',
    tipo: 'contabilidade',
    logoUrl: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/nfe.svg',
    status: 'inativa',
    configuracaoUrl: '/organization/integracoes/nfe',
  },
  {
    id: 'ecommerce-woo',
    nome: 'WooCommerce',
    descricao: 'Integre sua loja online com o sistema de pagamentos',
    tipo: 'ecommerce',
    logoUrl: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/woo.svg',
    status: 'inativa',
    configuracaoUrl: '/organization/integracoes/woocommerce',
  },
  {
    id: 'ecommerce-shopify',
    nome: 'Shopify',
    descricao: 'Conecte sua loja Shopify com nosso gateway de pagamentos',
    tipo: 'ecommerce',
    logoUrl: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/shopify.svg',
    status: 'inativa',
    configuracaoUrl: '/organization/integracoes/shopify',
  },
  {
    id: 'mailchimp',
    nome: 'Mailchimp',
    descricao: 'Integração para automação de emails de cobrança e notificações',
    tipo: 'marketing',
    logoUrl: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/mailchimp.svg',
    status: 'inativa',
    configuracaoUrl: '/organization/integracoes/mailchimp',
  },
  {
    id: 'pipefy',
    nome: 'Pipefy',
    descricao: 'Automatize seu funil de vendas com integração de pagamentos',
    tipo: 'crm',
    logoUrl: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/pipefy.svg',
    status: 'inativa',
    configuracaoUrl: '/organization/integracoes/pipefy',
  },
  {
    id: 'magento',
    nome: 'Magento',
    descricao: 'Integração para e-commerce de médio e grande porte',
    tipo: 'ecommerce',
    logoUrl: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/magento.svg',
    status: 'inativa',
    configuracaoUrl: '/organization/integracoes/magento',
  },
  {
    id: 'totvs',
    nome: 'TOTVS',
    descricao: 'Integração com um dos principais ERPs do mercado',
    tipo: 'erp',
    logoUrl: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/totvs.svg',
    status: 'inativa',
    configuracaoUrl: '/organization/integracoes/totvs',
  },
  {
    id: 'rdstation',
    nome: 'RD Station',
    descricao: 'Integre suas campanhas de marketing com pagamentos',
    tipo: 'marketing',
    logoUrl: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/rdstation.svg',
    status: 'inativa',
    configuracaoUrl: '/organization/integracoes/rdstation',
  }
];

export default function ComplyPayIntegracoes() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [activeTab, setActiveTab] = useState('todas');

  // Filtrar integrações com base nos critérios
  const filteredIntegracoes = integracoes.filter(integracao => {
    const matchesSearch = integracao.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           integracao.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = tipoFilter === 'todos' || integracao.tipo === tipoFilter;
    const matchesStatus = statusFilter === 'todos' || integracao.status === statusFilter;
    
    const matchesTab = activeTab === 'todas' || 
                      (activeTab === 'ativas' && integracao.status === 'ativa') ||
                      (activeTab === 'pendentes' && integracao.status === 'configuracao-pendente') ||
                      (activeTab === 'inativas' && integracao.status === 'inativa');

    return matchesSearch && matchesTipo && matchesStatus && matchesTab;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrações</h1>
        <p className="text-muted-foreground">Conecte sua organização com outros sistemas e serviços</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Utilize os filtros abaixo para encontrar integrações específicas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="contabilidade">Contabilidade</SelectItem>
                  <SelectItem value="erp">ERP</SelectItem>
                  <SelectItem value="crm">CRM</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="inativa">Inativa</SelectItem>
                  <SelectItem value="configuracao-pendente">Configuração Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Pesquisar</label>
              <div className="flex">
                <Input 
                  placeholder="Buscar integração..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-r-none"
                />
                <Button variant="outline" className="rounded-l-none">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="todas" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="todas">Todas ({integracoes.length})</TabsTrigger>
          <TabsTrigger value="ativas">
            Ativas ({integracoes.filter(i => i.status === 'ativa').length})
          </TabsTrigger>
          <TabsTrigger value="pendentes">
            Pendentes ({integracoes.filter(i => i.status === 'configuracao-pendente').length})
          </TabsTrigger>
          <TabsTrigger value="inativas">
            Inativas ({integracoes.filter(i => i.status === 'inativa').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredIntegracoes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="mb-2">Nenhuma integração encontrada com os filtros aplicados.</p>
                <Button 
                  variant="link" 
                  onClick={() => {
                    setSearchTerm('');
                    setTipoFilter('todos');
                    setStatusFilter('todos');
                  }}
                >
                  Limpar filtros
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredIntegracoes.map((integracao) => (
                <Card key={integracao.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                          {integracao.logoUrl ? (
                            <img 
                              src={integracao.logoUrl} 
                              alt={integracao.nome} 
                              className="w-5 h-5"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement?.appendChild(
                                  document.createTextNode(integracao.nome.substring(0, 2).toUpperCase())
                                );
                              }}
                            />
                          ) : (
                            <span>{integracao.nome.substring(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <CardTitle className="text-lg">{integracao.nome}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(integracao.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(integracao.status)}
                          {getStatusText(integracao.status)}
                        </span>
                      </Badge>
                    </div>
                    <div className="mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {getTipoText(integracao.tipo)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{integracao.descricao}</p>
                  </CardContent>
                  <CardFooter className="pt-1 flex justify-between">
                    {integracao.status === 'ativa' ? (
                      <Button variant="outline" size="sm" className="gap-1">
                        <RefreshCw className="h-3.5 w-3.5" />
                        Sincronizar
                      </Button>
                    ) : null}
                    <Button 
                      size="sm" 
                      className="gap-1 ml-auto"
                      variant={integracao.status === 'ativa' ? 'outline' : 'default'}
                      onClick={() => {
                        if (integracao.configuracaoUrl) {
                          navigate(integracao.configuracaoUrl);
                        }
                      }}
                    >
                      {integracao.status === 'ativa' ? 'Configurar' : 'Ativar'}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Code(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M7 8l-4 4l4 4"></path>
      <path d="M17 8l4 4l-4 4"></path>
      <path d="M14 4l-4 16"></path>
    </svg>
  );
}