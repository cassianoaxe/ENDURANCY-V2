'use client';

import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Package,
  ArrowLeft,
  Search,
  Truck,
  CircleCheck,
  Circle,
  CheckCircle2,
  Clock,
  Map,
  Home,
  AlertCircle,
  CalendarClock,
  Clipboard,
  ClipboardCheck,
  Box,
  Loader2
} from 'lucide-react';
import {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineIcon,
  TimelineBody,
  TimelineContent,
} from '@/components/ui/timeline';

// Interfaces
interface Endereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

interface Produto {
  id: number;
  nome: string;
  quantidade: number;
  preco: number;
  imagem: string;
}

interface EventoRastreio {
  data: string;
  hora: string;
  descricao: string;
  local: string;
  status: 'pendente' | 'em_transito' | 'entregue' | 'problema';
}

interface Pedido {
  id: string;
  numeroPedido: string;
  dataPedido: string;
  status: 'processando' | 'aprovado' | 'enviado' | 'entregue' | 'cancelado';
  valorTotal: number;
  formaPagamento: string;
  codigoRastreio: string;
  transportadora: string;
  previsaoEntrega: string;
  endereco: Endereco;
  produtos: Produto[];
  eventos: EventoRastreio[];
}

const RastreamentoPedidosPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidoAtivo, setPedidoAtivo] = useState<string | null>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [tipoFiltro, setTipoFiltro] = useState('em_andamento');
  
  // Verificar se o usuário está logado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log("Usuário não autenticado. Redirecionando para o login...");
      window.location.href = '/patient/login';
    }
  }, [authLoading, isAuthenticated]);
  
  // Carregar pedidos do usuário
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        // Em um ambiente real, faria a chamada API:
        // const response = await axios.get('/api/patient/pedidos');
        // setPedidos(response.data);
        
        // Dados de exemplo para demonstração
        const pedidosExemplo: Pedido[] = [
          {
            id: '1',
            numeroPedido: 'PED-200524-001',
            dataPedido: '2024-05-20',
            status: 'enviado',
            valorTotal: 259.90,
            formaPagamento: 'Cartão de Crédito',
            codigoRastreio: 'BR235678910SP',
            transportadora: 'Correios',
            previsaoEntrega: '2024-05-26',
            endereco: {
              cep: '01310-200',
              logradouro: 'Av. Paulista',
              numero: '1500',
              complemento: 'Apto 502',
              bairro: 'Bela Vista',
              cidade: 'São Paulo',
              estado: 'SP'
            },
            produtos: [
              {
                id: 4,
                nome: 'CBD Full Spectrum Oil 10%',
                quantidade: 1,
                preco: 259.90,
                imagem: 'https://via.placeholder.com/80x80.png?text=CBD+Oil'
              }
            ],
            eventos: [
              {
                data: '2024-05-20',
                hora: '09:15',
                descricao: 'Pedido recebido',
                local: 'Sistema interno',
                status: 'pendente'
              },
              {
                data: '2024-05-20',
                hora: '13:45',
                descricao: 'Pagamento aprovado',
                local: 'Sistema de pagamentos',
                status: 'pendente'
              },
              {
                data: '2024-05-21',
                hora: '10:22',
                descricao: 'Pedido em preparação',
                local: 'Centro de distribuição',
                status: 'pendente'
              },
              {
                data: '2024-05-22',
                hora: '15:30',
                descricao: 'Objeto postado',
                local: 'São Paulo/SP',
                status: 'em_transito'
              },
              {
                data: '2024-05-23',
                hora: '07:45',
                descricao: 'Objeto em trânsito',
                local: 'Centro de distribuição - São Paulo/SP',
                status: 'em_transito'
              },
              {
                data: '2024-05-24',
                hora: '08:10',
                descricao: 'Objeto saiu para entrega',
                local: 'São Paulo/SP',
                status: 'em_transito'
              }
            ]
          },
          {
            id: '2',
            numeroPedido: 'PED-200419-002',
            dataPedido: '2024-04-19',
            status: 'entregue',
            valorTotal: 129.90,
            formaPagamento: 'Boleto Bancário',
            codigoRastreio: 'BR987654321SP',
            transportadora: 'Correios',
            previsaoEntrega: '2024-04-25',
            endereco: {
              cep: '01310-200',
              logradouro: 'Av. Paulista',
              numero: '1500',
              complemento: 'Apto 502',
              bairro: 'Bela Vista',
              cidade: 'São Paulo',
              estado: 'SP'
            },
            produtos: [
              {
                id: 2,
                nome: 'CBD Gummies',
                quantidade: 1,
                preco: 129.90,
                imagem: 'https://via.placeholder.com/80x80.png?text=Gummies'
              }
            ],
            eventos: [
              {
                data: '2024-04-19',
                hora: '14:30',
                descricao: 'Pedido recebido',
                local: 'Sistema interno',
                status: 'pendente'
              },
              {
                data: '2024-04-20',
                hora: '09:45',
                descricao: 'Pagamento aprovado',
                local: 'Sistema de pagamentos',
                status: 'pendente'
              },
              {
                data: '2024-04-20',
                hora: '15:22',
                descricao: 'Pedido em preparação',
                local: 'Centro de distribuição',
                status: 'pendente'
              },
              {
                data: '2024-04-21',
                hora: '11:05',
                descricao: 'Objeto postado',
                local: 'São Paulo/SP',
                status: 'em_transito'
              },
              {
                data: '2024-04-22',
                hora: '08:30',
                descricao: 'Objeto em trânsito',
                local: 'Centro de distribuição - São Paulo/SP',
                status: 'em_transito'
              },
              {
                data: '2024-04-23',
                hora: '09:15',
                descricao: 'Objeto saiu para entrega',
                local: 'São Paulo/SP',
                status: 'em_transito'
              },
              {
                data: '2024-04-23',
                hora: '15:40',
                descricao: 'Objeto entregue ao destinatário',
                local: 'São Paulo/SP',
                status: 'entregue'
              }
            ]
          },
          {
            id: '3',
            numeroPedido: 'PED-200510-003',
            dataPedido: '2024-05-10',
            status: 'aprovado',
            valorTotal: 89.90,
            formaPagamento: 'Pix',
            codigoRastreio: '',
            transportadora: '',
            previsaoEntrega: '2024-05-18',
            endereco: {
              cep: '01310-200',
              logradouro: 'Av. Paulista',
              numero: '1500',
              complemento: 'Apto 502',
              bairro: 'Bela Vista',
              cidade: 'São Paulo',
              estado: 'SP'
            },
            produtos: [
              {
                id: 3,
                nome: 'Bálsamo CBD',
                quantidade: 1,
                preco: 89.90,
                imagem: 'https://via.placeholder.com/80x80.png?text=Balsamo'
              }
            ],
            eventos: [
              {
                data: '2024-05-10',
                hora: '10:15',
                descricao: 'Pedido recebido',
                local: 'Sistema interno',
                status: 'pendente'
              },
              {
                data: '2024-05-10',
                hora: '10:20',
                descricao: 'Pagamento aprovado',
                local: 'Sistema de pagamentos',
                status: 'pendente'
              },
              {
                data: '2024-05-11',
                hora: '09:00',
                descricao: 'Pedido em preparação',
                local: 'Centro de distribuição',
                status: 'pendente'
              }
            ]
          }
        ];
        
        setPedidos(pedidosExemplo);
        // Se houver pedidos, selecionar o primeiro como ativo por padrão
        if (pedidosExemplo.length > 0) {
          setPedidoAtivo(pedidosExemplo[0].id);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
        toast({
          title: "Erro ao carregar pedidos",
          description: "Não foi possível recuperar seus pedidos. Tente novamente mais tarde.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };
    
    fetchPedidos();
  }, [toast]);
  
  // Função para buscar pedido por código de rastreio ou número do pedido
  const buscarPedido = async () => {
    if (!termoBusca.trim()) {
      toast({
        title: "Campo vazio",
        description: "Digite o código de rastreio ou número do pedido.",
        variant: "destructive"
      });
      return;
    }
    
    setBuscando(true);
    
    try {
      // Em um ambiente real, faria a chamada API:
      // const response = await axios.get(`/api/patient/pedidos/buscar?termo=${termoBusca}`);
      // const resultados = response.data;
      
      // Simulação de busca
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar se o termo corresponde a algum pedido existente
      const pedidoEncontrado = pedidos.find(
        p => p.numeroPedido.toLowerCase().includes(termoBusca.toLowerCase()) || 
             p.codigoRastreio.toLowerCase().includes(termoBusca.toLowerCase())
      );
      
      if (pedidoEncontrado) {
        // Selecionar o pedido encontrado
        setPedidoAtivo(pedidoEncontrado.id);
        toast({
          title: "Pedido encontrado",
          description: `Mostrando detalhes do pedido ${pedidoEncontrado.numeroPedido}`,
        });
        
        // Verificar se o tipo de filtro é compatível com o status do pedido
        const statusParaFiltro = {
          'processando': 'em_andamento',
          'aprovado': 'em_andamento',
          'enviado': 'em_andamento',
          'entregue': 'entregues',
          'cancelado': 'cancelados'
        };
        
        const filtroIdeal = statusParaFiltro[pedidoEncontrado.status] || 'em_andamento';
        if (tipoFiltro !== filtroIdeal) {
          setTipoFiltro(filtroIdeal);
        }
      } else {
        toast({
          title: "Pedido não encontrado",
          description: "Nenhum pedido encontrado com o termo informado.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao buscar pedido:", error);
      toast({
        title: "Erro na busca",
        description: "Ocorreu um erro ao buscar o pedido. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setBuscando(false);
      setTermoBusca('');
    }
  };
  
  // Função para obter os pedidos filtrados pelo tipo
  const getPedidosFiltrados = (): Pedido[] => {
    switch (tipoFiltro) {
      case 'em_andamento':
        return pedidos.filter(p => ['processando', 'aprovado', 'enviado'].includes(p.status));
      case 'entregues':
        return pedidos.filter(p => p.status === 'entregue');
      case 'cancelados':
        return pedidos.filter(p => p.status === 'cancelado');
      default:
        return pedidos;
    }
  };
  
  // Formatar data para dd/mm/yyyy
  const formatarData = (dataString: string): string => {
    const data = new Date(dataString);
    return `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
  };
  
  // Obter badge do status do pedido
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processando':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Processando</Badge>;
      case 'aprovado':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Aprovado</Badge>;
      case 'enviado':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Enviado</Badge>;
      case 'entregue':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Entregue</Badge>;
      case 'cancelado':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };
  
  // Obter o pedido ativo
  const pedidoSelecionado = pedidoAtivo ? pedidos.find(p => p.id === pedidoAtivo) : null;
  
  // Pedidos filtrados
  const pedidosFiltrados = getPedidosFiltrados();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-3 text-lg">Carregando pedidos...</span>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho da página */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setLocation('/patient/dashboard')}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Rastreamento de Pedidos
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Acompanhe o status e a localização dos seus pedidos
          </p>
        </div>
        
        {/* Barra de busca */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Buscar por código de rastreio ou número do pedido" 
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && buscarPedido()}
                />
              </div>
              <Button 
                onClick={buscarPedido}
                disabled={buscando}
              >
                {buscando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  'Buscar'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Tabs e lista de pedidos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Meus Pedidos</CardTitle>
                <CardDescription>
                  Selecione um pedido para ver detalhes
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <TabsList className="w-full mb-4">
                  <TabsTrigger 
                    value="em_andamento" 
                    className="flex-1"
                    onClick={() => setTipoFiltro('em_andamento')}
                    data-state={tipoFiltro === 'em_andamento' ? 'active' : ''}
                  >
                    Em Andamento
                  </TabsTrigger>
                  <TabsTrigger 
                    value="entregues" 
                    className="flex-1"
                    onClick={() => setTipoFiltro('entregues')}
                    data-state={tipoFiltro === 'entregues' ? 'active' : ''}
                  >
                    Entregues
                  </TabsTrigger>
                  <TabsTrigger 
                    value="cancelados" 
                    className="flex-1"
                    onClick={() => setTipoFiltro('cancelados')}
                    data-state={tipoFiltro === 'cancelados' ? 'active' : ''}
                  >
                    Cancelados
                  </TabsTrigger>
                </TabsList>
                
                {pedidosFiltrados.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">
                      Nenhum pedido encontrado
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Não existem pedidos {tipoFiltro === 'em_andamento' ? 'em andamento' : 
                                        tipoFiltro === 'entregues' ? 'entregues' : 'cancelados'}.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pedidosFiltrados.map((pedido) => (
                      <div 
                        key={pedido.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors
                          ${pedidoAtivo === pedido.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                        onClick={() => setPedidoAtivo(pedido.id)}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="font-medium">{pedido.numeroPedido}</div>
                          {getStatusBadge(pedido.status)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Data: {formatarData(pedido.dataPedido)}
                        </div>
                        <div className="text-sm flex justify-between mt-1">
                          <span>R$ {pedido.valorTotal.toFixed(2)}</span>
                          {pedido.codigoRastreio && (
                            <span className="text-primary truncate max-w-[140px]" title={pedido.codigoRastreio}>
                              {pedido.codigoRastreio}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            {/* Detalhes do pedido selecionado */}
            {pedidoSelecionado ? (
              <div className="space-y-6">
                {/* Card de informações do pedido */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Pedido {pedidoSelecionado.numeroPedido}
                      </CardTitle>
                      {getStatusBadge(pedidoSelecionado.status)}
                    </div>
                    <CardDescription>
                      Realizado em {formatarData(pedidoSelecionado.dataPedido)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Informações do Pedido</h4>
                        <ul className="space-y-1">
                          <li className="text-sm">
                            <span className="font-medium">Valor Total:</span> R$ {pedidoSelecionado.valorTotal.toFixed(2)}
                          </li>
                          <li className="text-sm">
                            <span className="font-medium">Forma de Pagamento:</span> {pedidoSelecionado.formaPagamento}
                          </li>
                          {pedidoSelecionado.codigoRastreio && (
                            <li className="text-sm">
                              <span className="font-medium">Código de Rastreio:</span> {pedidoSelecionado.codigoRastreio}
                            </li>
                          )}
                          {pedidoSelecionado.transportadora && (
                            <li className="text-sm">
                              <span className="font-medium">Transportadora:</span> {pedidoSelecionado.transportadora}
                            </li>
                          )}
                          {pedidoSelecionado.previsaoEntrega && (
                            <li className="text-sm">
                              <span className="font-medium">Previsão de Entrega:</span> {formatarData(pedidoSelecionado.previsaoEntrega)}
                            </li>
                          )}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Endereço de Entrega</h4>
                        <address className="text-sm not-italic">
                          {pedidoSelecionado.endereco.logradouro}, {pedidoSelecionado.endereco.numero}
                          {pedidoSelecionado.endereco.complemento && <>, {pedidoSelecionado.endereco.complemento}</>}<br />
                          {pedidoSelecionado.endereco.bairro}<br />
                          {pedidoSelecionado.endereco.cidade} - {pedidoSelecionado.endereco.estado}<br />
                          CEP: {pedidoSelecionado.endereco.cep}
                        </address>
                      </div>
                    </div>
                    
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Produtos</h4>
                    <div className="space-y-2">
                      {pedidoSelecionado.produtos.map((produto) => (
                        <div key={produto.id} className="flex items-center border-b pb-2">
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border">
                            <img 
                              src={produto.imagem} 
                              alt={produto.nome}
                              className="h-full w-full object-cover object-center"
                            />
                          </div>
                          <div className="ml-4 flex-1">
                            <h3 className="text-sm font-medium">{produto.nome}</h3>
                            <p className="text-xs text-gray-500">Quantidade: {produto.quantidade}</p>
                          </div>
                          <div className="text-sm font-medium">
                            R$ {(produto.preco * produto.quantidade).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Card de rastreamento */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg">
                      <Truck className="mr-2 h-5 w-5" />
                      Rastreamento do Pedido
                    </CardTitle>
                    {pedidoSelecionado.status === 'enviado' || pedidoSelecionado.status === 'entregue' ? (
                      <CardDescription>
                        Acompanhe o progresso da entrega do seu pedido
                      </CardDescription>
                    ) : (
                      <CardDescription>
                        O rastreamento estará disponível quando o pedido for enviado
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {pedidoSelecionado.eventos.length > 0 ? (
                      <Timeline className="my-4">
                        {pedidoSelecionado.eventos.map((evento, index) => (
                          <TimelineItem key={index}>
                            {index < pedidoSelecionado.eventos.length - 1 && (
                              <TimelineConnector className={
                                evento.status === 'entregue' ? 'bg-green-200' : 
                                evento.status === 'em_transito' ? 'bg-blue-200' : 
                                evento.status === 'problema' ? 'bg-red-200' : 'bg-gray-200'
                              } />
                            )}
                            <TimelineHeader>
                              <TimelineIcon className={
                                evento.status === 'entregue' ? 'bg-green-100 text-green-700 border-green-200' : 
                                evento.status === 'em_transito' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                                evento.status === 'problema' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                              }>
                                {evento.status === 'entregue' ? <CheckCircle2 className="h-4 w-4" /> : 
                                 evento.status === 'em_transito' ? <Truck className="h-4 w-4" /> : 
                                 evento.status === 'problema' ? <AlertCircle className="h-4 w-4" /> : 
                                 <Circle className="h-4 w-4" />}
                              </TimelineIcon>
                              <TimelineContent>
                                <TimelineBody>
                                  <p className="text-sm font-medium">{evento.descricao}</p>
                                  <p className="text-xs text-gray-500">
                                    {formatarData(evento.data)} às {evento.hora} • {evento.local}
                                  </p>
                                </TimelineBody>
                              </TimelineContent>
                            </TimelineHeader>
                          </TimelineItem>
                        ))}
                      </Timeline>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 mx-auto text-gray-300" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">
                          Aguardando processamento
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          O pedido ainda está sendo processado. Atualizações de rastreamento aparecerão aqui quando o pedido for enviado.
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    {pedidoSelecionado.codigoRastreio && (
                      <>
                        {pedidoSelecionado.transportadora === 'Correios' ? (
                          <a 
                            href={`https://rastreamento.correios.com.br/app/index.php?objeto=${pedidoSelecionado.codigoRastreio}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            Rastrear no site dos Correios
                          </a>
                        ) : (
                          <span className="text-sm text-gray-500">
                            Rastreamento disponível pelo código: {pedidoSelecionado.codigoRastreio}
                          </span>
                        )}
                      </>
                    )}
                  </CardFooter>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-2">
                    Selecione um pedido
                  </h3>
                  <p className="text-gray-500 text-center max-w-md">
                    Selecione um pedido da lista à esquerda para visualizar seus detalhes e informações de rastreamento.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RastreamentoPedidosPage;