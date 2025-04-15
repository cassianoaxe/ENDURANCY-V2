import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { 
  Link, 
  ArrowUpRight, 
  Check, 
  X, 
  ExternalLink, 
  Globe, 
  FileText, 
  Calculator, 
  BarChart,
  Settings,
  PlusCircle
} from 'lucide-react';

// Tipos para as integrações
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

// Dados de exemplo para integrações
const integracoesExemplo: Integracao[] = [
  {
    id: 'int-001',
    nome: 'ContaAzul',
    descricao: 'Integração com o sistema de contabilidade ContaAzul',
    tipo: 'contabilidade',
    logoUrl: '/logos/contaazul.png',
    status: 'ativa',
    dataCriacao: '2025-01-15',
    configuracaoUrl: '/configuracao/contaazul',
  },
  {
    id: 'int-002',
    nome: 'Conta Simples',
    descricao: 'Sincronização com plataforma financeira Conta Simples',
    tipo: 'contabilidade',
    logoUrl: '/logos/contasimples.png',
    status: 'configuracao-pendente',
    configuracaoUrl: '/configuracao/contasimples',
  },
  {
    id: 'int-003',
    nome: 'WooCommerce',
    descricao: 'Plugin de integração para WooCommerce',
    tipo: 'ecommerce',
    logoUrl: '/logos/woocommerce.png',
    status: 'inativa',
    configuracaoUrl: '/configuracao/woocommerce',
  },
  {
    id: 'int-004',
    nome: 'Nuvem Shop',
    descricao: 'Integrando pagamentos com a plataforma Nuvem Shop',
    tipo: 'ecommerce',
    logoUrl: '/logos/nuvemshop.png',
    status: 'ativa',
    dataCriacao: '2025-02-20',
    configuracaoUrl: '/configuracao/nuvemshop',
  },
  {
    id: 'int-005',
    nome: 'Pipedrive',
    descricao: 'Sincronização de dados com CRM Pipedrive',
    tipo: 'crm',
    logoUrl: '/logos/pipedrive.png',
    status: 'inativa',
    configuracaoUrl: '/configuracao/pipedrive',
  },
  {
    id: 'int-006',
    nome: 'HubSpot',
    descricao: 'Integração com HubSpot CRM e Marketing',
    tipo: 'crm',
    logoUrl: '/logos/hubspot.png',
    status: 'configuracao-pendente',
    configuracaoUrl: '/configuracao/hubspot',
  },
];

// Função para obter cor do status
const getStatusColor = (status: StatusIntegracao) => {
  switch (status) {
    case 'ativa':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'inativa':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    case 'configuracao-pendente':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
};

// Função para obter texto do status
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

// Função para obter ícone do status
const getStatusIcon = (status: StatusIntegracao) => {
  switch (status) {
    case 'ativa':
      return <Check className="h-4 w-4 text-green-600" />;
    case 'inativa':
      return <X className="h-4 w-4 text-gray-600" />;
    case 'configuracao-pendente':
      return <Settings className="h-4 w-4 text-yellow-600" />;
    default:
      return null;
  }
};

// Função para obter ícone do tipo
const getTipoIcon = (tipo: TipoIntegracao) => {
  switch (tipo) {
    case 'contabilidade':
      return <Calculator className="h-5 w-5" />;
    case 'erp':
      return <FileText className="h-5 w-5" />;
    case 'crm':
      return <BarChart className="h-5 w-5" />;
    case 'ecommerce':
      return <Globe className="h-5 w-5" />;
    case 'marketing':
      return <ArrowUpRight className="h-5 w-5" />;
    default:
      return null;
  }
};

// Função para obter texto do tipo
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

export default function ComplyPayIntegracoes() {
  const [activeTab, setActiveTab] = useState('todas');
  const { toast } = useToast();

  // No futuro, podemos usar React Query para buscar dados reais da API
  const { data: integracoesData, isLoading } = useQuery({
    queryKey: ['/api/complypay/integracoes'],
    enabled: false, // Desabilitado temporariamente pois estamos usando dados de exemplo
  });

  // Filtrar integrações baseado na aba selecionada
  const integracoesFiltradas = activeTab === 'todas' 
    ? integracoesExemplo 
    : integracoesExemplo.filter(integracao => integracao.tipo === activeTab);

  const handleAtivarIntegracao = (id: string, nome: string) => {
    toast({
      title: "Integração ativada",
      description: `A integração com ${nome} foi ativada com sucesso`,
    });
  };

  const handleDesativarIntegracao = (id: string, nome: string) => {
    toast({
      title: "Integração desativada",
      description: `A integração com ${nome} foi desativada`,
    });
  };

  const handleConfigIntegracao = (id: string, nome: string) => {
    toast({
      title: "Configurar integração",
      description: `Abrindo configurações da integração com ${nome}`,
    });
  };

  const handleAdicionarIntegracao = () => {
    toast({
      title: "Adicionar nova integração",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <CardTitle>Integrações</CardTitle>
              <CardDescription className="mt-1">
                Conecte o ComplyPay com seus sistemas e aplicativos favoritos
              </CardDescription>
            </div>
            <Button className="mt-4 md:mt-0" onClick={handleAdicionarIntegracao}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Integração
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="todas" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="w-full md:w-auto grid grid-cols-3 md:grid-cols-6">
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="contabilidade">Contabilidade</TabsTrigger>
              <TabsTrigger value="erp">ERP</TabsTrigger>
              <TabsTrigger value="crm">CRM</TabsTrigger>
              <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
              <TabsTrigger value="marketing">Marketing</TabsTrigger>
            </TabsList>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integracoesFiltradas.map((integracao) => (
                <Card key={integracao.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center space-x-2">
                      <div className="bg-gray-100 p-2 rounded-full">
                        {getTipoIcon(integracao.tipo)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{integracao.nome}</CardTitle>
                        <CardDescription className="text-xs">{getTipoText(integracao.tipo)}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(integracao.status)}>
                      {getStatusText(integracao.status)}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <p className="text-sm text-muted-foreground">{integracao.descricao}</p>
                  </CardContent>
                  <CardFooter className="p-4 flex justify-between items-center border-t bg-gray-50">
                    {integracao.status === 'ativa' ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDesativarIntegracao(integracao.id, integracao.nome)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Desativar
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleAtivarIntegracao(integracao.id, integracao.nome)}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Ativar
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleConfigIntegracao(integracao.id, integracao.nome)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Configurar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {integracoesFiltradas.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="rounded-full bg-gray-100 p-3 mb-4">
                  <Link className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium mb-2">Nenhuma integração encontrada</h3>
                <p className="text-muted-foreground max-w-md">
                  Não há integrações disponíveis para esta categoria. Clique em "Nova Integração" para adicionar.
                </p>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Documentação de API</CardTitle>
          <CardDescription>
            Recursos para desenvolvedores integrarem com a API do ComplyPay
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="rounded-full bg-gray-100 p-3 mb-3 mt-3">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="font-medium mb-2">Documentação</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Guias detalhados e referência completa da API
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Acessar Docs
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="rounded-full bg-gray-100 p-3 mb-3 mt-3">
                  <Code className="h-5 w-5" />
                </div>
                <h3 className="font-medium mb-2">SDKs</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Bibliotecas para PHP, Node.js, Python e mais
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ver SDKs
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="rounded-full bg-gray-100 p-3 mb-3 mt-3">
                  <Globe className="h-5 w-5" />
                </div>
                <h3 className="font-medium mb-2">API Explorer</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Teste endpoints da API em ambiente interativo
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Explorar API
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para o ícone de Code
function Code(props: React.SVGProps<SVGSVGElement>) {
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
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}