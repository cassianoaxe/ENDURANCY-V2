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
  ArrowLeft,
  CreditCard,
  CircleDollarSign,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Download,
  Plus,
  Wallet,
  Receipt,
  FileText,
  ArrowUpRight,
  Banknote,
  Landmark,
  QrCode,
  Rotate3D,
  CreditCardIcon,
  Copy,
  Clipboard,
  Search,
  Loader2
} from 'lucide-react';

// Interfaces
interface CartaoCredito {
  id: string;
  ultimos4Digitos: string;
  bandeira: string;
  nomeNoCartao: string;
  expiracao: string;
  padrao: boolean;
}

interface Pagamento {
  id: string;
  tipo: 'cartao' | 'boleto' | 'pix';
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'estornado';
  valor: number;
  data: string;
  pedidoId: string;
  numeroPedido: string;
  detalhes: {
    cartao?: {
      ultimos4Digitos: string;
      bandeira: string;
    };
    boleto?: {
      codigoBarras: string;
      dataVencimento: string;
      linkBoleto: string;
    };
    pix?: {
      chave: string;
      qrCode: string;
      copiaCola: string;
      expiracao: string;
    };
  };
}

interface Assinatura {
  id: string;
  plano: string;
  valor: number;
  status: 'ativa' | 'inativa' | 'cancelada';
  dataInicio: string;
  proximoFaturamento: string;
  metodoPagamento: {
    tipo: 'cartao' | 'boleto';
    detalhes: string;
  };
}

const PagamentosPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [cartoes, setCartoes] = useState<CartaoCredito[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [tipoHistoricoAtivo, setTipoHistoricoAtivo] = useState<string>('todos');
  const [mostrarFormularioCartao, setMostrarFormularioCartao] = useState(false);
  const [novoCartao, setNovoCartao] = useState({
    numero: '',
    nomeNoCartao: '',
    expiracao: '',
    cvv: '',
    padrao: false
  });
  
  // Verificar se o usuário está logado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log("Usuário não autenticado. Redirecionando para o login...");
      window.location.href = '/patient/login';
    }
  }, [authLoading, isAuthenticated]);
  
  // Carregar dados de pagamentos
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Em um ambiente real, faria chamadas API:
        // const cartoesResponse = await axios.get('/api/patient/pagamentos/cartoes');
        // const pagamentosResponse = await axios.get('/api/patient/pagamentos/historico');
        // const assinaturasResponse = await axios.get('/api/patient/pagamentos/assinaturas');
        // setCartoes(cartoesResponse.data);
        // setPagamentos(pagamentosResponse.data);
        // setAssinaturas(assinaturasResponse.data);
        
        // Dados de exemplo para demonstração
        const cartoesExemplo: CartaoCredito[] = [
          {
            id: '1',
            ultimos4Digitos: '4242',
            bandeira: 'Visa',
            nomeNoCartao: 'JOAO SILVA',
            expiracao: '12/28',
            padrao: true
          },
          {
            id: '2',
            ultimos4Digitos: '5555',
            bandeira: 'Mastercard',
            nomeNoCartao: 'JOAO SILVA',
            expiracao: '08/26',
            padrao: false
          }
        ];
        
        const pagamentosExemplo: Pagamento[] = [
          {
            id: '1',
            tipo: 'cartao',
            status: 'aprovado',
            valor: 259.90,
            data: '2024-05-20',
            pedidoId: '1',
            numeroPedido: 'PED-200524-001',
            detalhes: {
              cartao: {
                ultimos4Digitos: '4242',
                bandeira: 'Visa'
              }
            }
          },
          {
            id: '2',
            tipo: 'boleto',
            status: 'aprovado',
            valor: 129.90,
            data: '2024-04-19',
            pedidoId: '2',
            numeroPedido: 'PED-200419-002',
            detalhes: {
              boleto: {
                codigoBarras: '34191.79001 01043.510047 91020.150008 9 91330026000',
                dataVencimento: '2024-04-21',
                linkBoleto: '#'
              }
            }
          },
          {
            id: '3',
            tipo: 'pix',
            status: 'aprovado',
            valor: 89.90,
            data: '2024-05-10',
            pedidoId: '3',
            numeroPedido: 'PED-200510-003',
            detalhes: {
              pix: {
                chave: 'cbd-store@example.com',
                qrCode: '#',
                copiaCola: '00020126580014br.gov.bcb.pix01151234567890123454',
                expiracao: '2024-05-10T12:30:00'
              }
            }
          },
          {
            id: '4',
            tipo: 'cartao',
            status: 'pendente',
            valor: 149.90,
            data: '2024-05-24',
            pedidoId: '4',
            numeroPedido: 'PED-240524-004',
            detalhes: {
              cartao: {
                ultimos4Digitos: '5555',
                bandeira: 'Mastercard'
              }
            }
          }
        ];
        
        const assinaturasExemplo: Assinatura[] = [
          {
            id: '1',
            plano: 'Plano Mensal CBD Premium',
            valor: 79.90,
            status: 'ativa',
            dataInicio: '2024-03-15',
            proximoFaturamento: '2024-06-15',
            metodoPagamento: {
              tipo: 'cartao',
              detalhes: 'Visa terminado em 4242'
            }
          }
        ];
        
        setCartoes(cartoesExemplo);
        setPagamentos(pagamentosExemplo);
        setAssinaturas(assinaturasExemplo);
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados de pagamentos:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível recuperar suas informações de pagamento. Tente novamente mais tarde.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  // Filtrar pagamentos por tipo
  const getPagamentosFiltrados = () => {
    if (tipoHistoricoAtivo === 'todos') {
      return pagamentos;
    }
    return pagamentos.filter(pagamento => pagamento.tipo === tipoHistoricoAtivo);
  };
  
  // Formatar data para dd/mm/yyyy
  const formatarData = (dataString: string): string => {
    const data = new Date(dataString);
    return `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
  };
  
  // Obter cor e texto para o status de pagamento
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'aprovado':
        return {
          label: 'Aprovado',
          color: 'bg-green-100 text-green-800'
        };
      case 'pendente':
        return {
          label: 'Pendente',
          color: 'bg-yellow-100 text-yellow-800'
        };
      case 'rejeitado':
        return {
          label: 'Recusado',
          color: 'bg-red-100 text-red-800'
        };
      case 'estornado':
        return {
          label: 'Estornado',
          color: 'bg-purple-100 text-purple-800'
        };
      case 'ativa':
        return {
          label: 'Ativa',
          color: 'bg-green-100 text-green-800'
        };
      case 'inativa':
        return {
          label: 'Inativa',
          color: 'bg-gray-100 text-gray-800'
        };
      case 'cancelada':
        return {
          label: 'Cancelada',
          color: 'bg-red-100 text-red-800'
        };
      default:
        return {
          label: 'Desconhecido',
          color: 'bg-gray-100 text-gray-800'
        };
    }
  };
  
  // Obter ícone para o tipo de pagamento
  const getPagamentoIcon = (tipo: string) => {
    switch (tipo) {
      case 'cartao':
        return <CreditCardIcon className="h-5 w-5 text-blue-500" />;
      case 'boleto':
        return <Receipt className="h-5 w-5 text-gray-500" />;
      case 'pix':
        return <QrCode className="h-5 w-5 text-green-500" />;
      default:
        return <CircleDollarSign className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Obter nome do tipo de pagamento
  const getPagamentoNome = (tipo: string) => {
    switch (tipo) {
      case 'cartao':
        return 'Cartão de Crédito';
      case 'boleto':
        return 'Boleto Bancário';
      case 'pix':
        return 'PIX';
      default:
        return 'Pagamento';
    }
  };
  
  // Função para adicionar um novo cartão
  const adicionarNovoCartao = () => {
    // Validação básica
    if (!novoCartao.numero || !novoCartao.nomeNoCartao || !novoCartao.expiracao || !novoCartao.cvv) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos do cartão.",
        variant: "destructive"
      });
      return;
    }
    
    // Validar número do cartão (formato simples)
    if (!/^\d{16}$/.test(novoCartao.numero.replace(/\s/g, ''))) {
      toast({
        title: "Número de cartão inválido",
        description: "O número do cartão deve conter 16 dígitos.",
        variant: "destructive"
      });
      return;
    }
    
    // Validar data de expiração (formato MM/YY)
    if (!/^\d{2}\/\d{2}$/.test(novoCartao.expiracao)) {
      toast({
        title: "Data de expiração inválida",
        description: "Use o formato MM/AA (ex: 12/28).",
        variant: "destructive"
      });
      return;
    }
    
    // Validar CVV
    if (!/^\d{3,4}$/.test(novoCartao.cvv)) {
      toast({
        title: "Código de segurança inválido",
        description: "O código de segurança deve ter 3 ou 4 dígitos.",
        variant: "destructive"
      });
      return;
    }
    
    // Em um ambiente real, faria uma chamada API para salvar o cartão
    // await axios.post('/api/patient/pagamentos/cartoes', novoCartao);
    
    // Simulação de adição de cartão
    const ultimosDigitos = novoCartao.numero.slice(-4);
    const bandeira = novoCartao.numero.startsWith('4') ? 'Visa' : 
                     novoCartao.numero.startsWith('5') ? 'Mastercard' : 
                     'Outra';
    
    const novoCartaoSalvo: CartaoCredito = {
      id: (cartoes.length + 1).toString(),
      ultimos4Digitos: ultimosDigitos,
      bandeira,
      nomeNoCartao: novoCartao.nomeNoCartao.toUpperCase(),
      expiracao: novoCartao.expiracao,
      padrao: novoCartao.padrao
    };
    
    // Se o novo cartão for definido como padrão, atualizar os outros cartões
    if (novoCartao.padrao) {
      setCartoes(cartoesAtuais => 
        cartoesAtuais.map(cartao => ({
          ...cartao,
          padrao: false
        }))
      );
    }
    
    // Adicionar o novo cartão à lista
    setCartoes(cartoesAtuais => [...cartoesAtuais, novoCartaoSalvo]);
    
    // Limpar formulário e fechar
    setNovoCartao({
      numero: '',
      nomeNoCartao: '',
      expiracao: '',
      cvv: '',
      padrao: false
    });
    setMostrarFormularioCartao(false);
    
    toast({
      title: "Cartão adicionado com sucesso",
      description: `Cartão ${bandeira} terminado em ${ultimosDigitos} foi adicionado.`,
    });
  };
  
  // Função para definir um cartão como padrão
  const definirCartaoPadrao = (cartaoId: string) => {
    setCartoes(cartoesAtuais => 
      cartoesAtuais.map(cartao => ({
        ...cartao,
        padrao: cartao.id === cartaoId
      }))
    );
    
    toast({
      title: "Cartão padrão atualizado",
      description: "Seu cartão padrão foi atualizado com sucesso.",
    });
  };
  
  // Função para remover um cartão
  const removerCartao = (cartaoId: string) => {
    const cartaoParaRemover = cartoes.find(c => c.id === cartaoId);
    
    if (!cartaoParaRemover) {
      return;
    }
    
    // Verificar se é o cartão padrão
    if (cartaoParaRemover.padrao && cartoes.length > 1) {
      toast({
        title: "Operação não permitida",
        description: "Não é possível remover o cartão padrão. Defina outro cartão como padrão primeiro.",
        variant: "destructive"
      });
      return;
    }
    
    // Em um ambiente real, faria uma chamada API para remover o cartão
    // await axios.delete(`/api/patient/pagamentos/cartoes/${cartaoId}`);
    
    // Remover o cartão da lista
    setCartoes(cartoesAtuais => cartoesAtuais.filter(cartao => cartao.id !== cartaoId));
    
    toast({
      title: "Cartão removido",
      description: `Cartão terminado em ${cartaoParaRemover.ultimos4Digitos} foi removido.`,
    });
  };
  
  // Função para cancelar uma assinatura
  const cancelarAssinatura = (assinaturaId: string) => {
    // Em um ambiente real, faria uma chamada API para cancelar a assinatura
    // await axios.post(`/api/patient/pagamentos/assinaturas/${assinaturaId}/cancelar`);
    
    // Atualizar a assinatura na lista
    setAssinaturas(assinaturasAtuais => 
      assinaturasAtuais.map(assinatura => 
        assinatura.id === assinaturaId 
          ? { ...assinatura, status: 'cancelada' } 
          : assinatura
      )
    );
    
    toast({
      title: "Assinatura cancelada",
      description: "Sua assinatura foi cancelada com sucesso.",
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-3 text-lg">Carregando informações de pagamento...</span>
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
              Meus Pagamentos
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie seus métodos de pagamento, veja assinaturas e histórico de pagamentos
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Métodos de Pagamento */}
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Métodos de Pagamento</CardTitle>
                  <CardDescription>
                    Seus cartões e métodos de pagamento salvos
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setMostrarFormularioCartao(!mostrarFormularioCartao)}
                  variant="outline"
                  size="sm"
                >
                  {mostrarFormularioCartao ? (
                    'Cancelar'
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar cartão
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                {mostrarFormularioCartao ? (
                  <div className="border rounded-lg p-4 mb-4">
                    <h3 className="font-medium mb-3">Novo Cartão de Crédito</h3>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="numero-cartao" className="block text-sm font-medium mb-1">
                          Número do Cartão
                        </label>
                        <Input
                          id="numero-cartao"
                          placeholder="1234 5678 9012 3456"
                          value={novoCartao.numero}
                          onChange={(e) => setNovoCartao({...novoCartao, numero: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="nome-cartao" className="block text-sm font-medium mb-1">
                          Nome no Cartão
                        </label>
                        <Input
                          id="nome-cartao"
                          placeholder="Como aparece no cartão"
                          value={novoCartao.nomeNoCartao}
                          onChange={(e) => setNovoCartao({...novoCartao, nomeNoCartao: e.target.value})}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="expiracao" className="block text-sm font-medium mb-1">
                            Data de Expiração
                          </label>
                          <Input
                            id="expiracao"
                            placeholder="MM/AA"
                            value={novoCartao.expiracao}
                            onChange={(e) => setNovoCartao({...novoCartao, expiracao: e.target.value})}
                          />
                        </div>
                        <div>
                          <label htmlFor="cvv" className="block text-sm font-medium mb-1">
                            Código de Segurança (CVV)
                          </label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            type="password"
                            maxLength={4}
                            value={novoCartao.cvv}
                            onChange={(e) => setNovoCartao({...novoCartao, cvv: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="cartao-padrao"
                          checked={novoCartao.padrao}
                          onChange={(e) => setNovoCartao({...novoCartao, padrao: e.target.checked})}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="cartao-padrao" className="text-sm">
                          Definir como cartão padrão
                        </label>
                      </div>
                      
                      <Button onClick={adicionarNovoCartao} className="w-full">
                        Salvar Cartão
                      </Button>
                    </div>
                  </div>
                ) : null}
                
                {cartoes.length === 0 ? (
                  <div className="text-center py-6">
                    <CreditCard className="h-12 w-12 mx-auto text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">
                      Nenhum método de pagamento
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Adicione um cartão de crédito para facilitar suas compras.
                    </p>
                    <div className="mt-4">
                      <Button onClick={() => setMostrarFormularioCartao(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar cartão
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cartoes.map((cartao) => (
                      <div 
                        key={cartao.id}
                        className={`border p-4 rounded-lg relative ${cartao.padrao ? 'border-primary bg-primary/5' : ''}`}
                      >
                        {cartao.padrao && (
                          <Badge className="absolute top-2 right-2 bg-primary">
                            Padrão
                          </Badge>
                        )}
                        
                        <div className="flex items-center mb-2">
                          {cartao.bandeira === 'Visa' ? (
                            <div className="h-8 w-12 bg-blue-100 rounded flex items-center justify-center text-xs font-bold text-blue-800">
                              VISA
                            </div>
                          ) : cartao.bandeira === 'Mastercard' ? (
                            <div className="h-8 w-12 bg-red-100 rounded flex items-center justify-center text-xs font-bold text-red-800">
                              MC
                            </div>
                          ) : (
                            <div className="h-8 w-12 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-800">
                              CARD
                            </div>
                          )}
                          <div className="ml-3">
                            <div className="font-medium">{cartao.bandeira}</div>
                            <div className="text-sm text-gray-500">•••• {cartao.ultimos4Digitos}</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 text-sm">
                          <div>
                            <span className="text-gray-500">Titular:</span> {cartao.nomeNoCartao}
                          </div>
                          <div>
                            <span className="text-gray-500">Exp:</span> {cartao.expiracao}
                          </div>
                        </div>
                        
                        <div className="mt-3 flex justify-end space-x-2">
                          {!cartao.padrao && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => definirCartaoPadrao(cartao.id)}
                            >
                              Definir como padrão
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removerCartao(cartao.id)}
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Assinaturas */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Rotate3D className="mr-2 h-5 w-5" />
                  Assinaturas Ativas
                </CardTitle>
                <CardDescription>
                  Gerencie suas assinaturas e planos recorrentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assinaturas.length === 0 ? (
                  <div className="text-center py-6">
                    <Calendar className="h-12 w-12 mx-auto text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">
                      Nenhuma assinatura ativa
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Você não possui nenhuma assinatura ou plano recorrente.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assinaturas.map((assinatura) => (
                      <div 
                        key={assinatura.id}
                        className="border p-4 rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{assinatura.plano}</h3>
                            <p className="text-sm text-gray-500">
                              Início em {formatarData(assinatura.dataInicio)}
                            </p>
                          </div>
                          <Badge className={getStatusInfo(assinatura.status).color}>
                            {getStatusInfo(assinatura.status).label}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="text-sm">
                            <span className="text-gray-500">Valor Mensal:</span> R$ {assinatura.valor.toFixed(2)}
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Próx. Cobrança:</span> {formatarData(assinatura.proximoFaturamento)}
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm mb-3">
                          <CreditCard className="h-4 w-4 mr-1 text-gray-500" />
                          <span>{assinatura.metodoPagamento.detalhes}</span>
                        </div>
                        
                        {assinatura.status === 'ativa' && (
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => cancelarAssinatura(assinatura.id)}
                            >
                              Cancelar Assinatura
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            {/* Histórico de Pagamentos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Receipt className="mr-2 h-5 w-5" />
                  Histórico de Pagamentos
                </CardTitle>
                <CardDescription>
                  Seus pagamentos recentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TabsList className="w-full mb-4">
                  <TabsTrigger 
                    value="todos" 
                    className="flex-1"
                    onClick={() => setTipoHistoricoAtivo('todos')}
                    data-state={tipoHistoricoAtivo === 'todos' ? 'active' : ''}
                  >
                    Todos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="cartao" 
                    className="flex-1"
                    onClick={() => setTipoHistoricoAtivo('cartao')}
                    data-state={tipoHistoricoAtivo === 'cartao' ? 'active' : ''}
                  >
                    Cartão
                  </TabsTrigger>
                  <TabsTrigger 
                    value="boleto" 
                    className="flex-1"
                    onClick={() => setTipoHistoricoAtivo('boleto')}
                    data-state={tipoHistoricoAtivo === 'boleto' ? 'active' : ''}
                  >
                    Boleto
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pix" 
                    className="flex-1"
                    onClick={() => setTipoHistoricoAtivo('pix')}
                    data-state={tipoHistoricoAtivo === 'pix' ? 'active' : ''}
                  >
                    PIX
                  </TabsTrigger>
                </TabsList>
                
                {getPagamentosFiltrados().length === 0 ? (
                  <div className="text-center py-6">
                    <FileText className="h-12 w-12 mx-auto text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">
                      Nenhum pagamento encontrado
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Não há histórico de pagamentos para os filtros selecionados.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getPagamentosFiltrados().map((pagamento) => (
                      <div 
                        key={pagamento.id}
                        className="border p-3 rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center">
                            {getPagamentoIcon(pagamento.tipo)}
                            <span className="ml-2 font-medium">
                              {getPagamentoNome(pagamento.tipo)}
                            </span>
                          </div>
                          <Badge className={getStatusInfo(pagamento.status).color}>
                            {getStatusInfo(pagamento.status).label}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-500 mb-1">
                          {formatarData(pagamento.data)} • Pedido {pagamento.numeroPedido}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="font-medium">
                            R$ {pagamento.valor.toFixed(2)}
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLocation(`/patient/pedidos/rastreamento`)}
                            className="text-primary hover:text-primary/90"
                          >
                            Ver pedido
                            <ArrowUpRight className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                        
                        {/* Detalhes específicos baseados no tipo de pagamento */}
                        {pagamento.tipo === 'cartao' && pagamento.detalhes.cartao && (
                          <div className="mt-2 text-xs text-gray-500">
                            {pagamento.detalhes.cartao.bandeira} •••• {pagamento.detalhes.cartao.ultimos4Digitos}
                          </div>
                        )}
                        
                        {pagamento.tipo === 'boleto' && pagamento.detalhes.boleto && (
                          <div className="mt-2 flex">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => window.open(pagamento.detalhes.boleto?.linkBoleto, '_blank')}
                              className="text-xs"
                            >
                              <Download className="mr-1 h-3 w-3" />
                              2ª via do boleto
                            </Button>
                          </div>
                        )}
                        
                        {pagamento.tipo === 'pix' && pagamento.detalhes.pix && pagamento.status === 'pendente' && (
                          <div className="mt-2 flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs flex-1"
                            >
                              <QrCode className="mr-1 h-3 w-3" />
                              Ver QR Code
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs flex-1"
                              onClick={() => {
                                navigator.clipboard.writeText(pagamento.detalhes.pix?.copiaCola || '');
                                toast({
                                  title: "Código PIX copiado",
                                  description: "O código PIX foi copiado para a área de transferência.",
                                });
                              }}
                            >
                              <Copy className="mr-1 h-3 w-3" />
                              Copiar código
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              {getPagamentosFiltrados().length > 0 && (
                <CardFooter className="px-4 py-3 border-t text-center">
                  <Button 
                    variant="link" 
                    onClick={() => setLocation('/patient/pagamentos/historico')}
                  >
                    Ver histórico completo
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagamentosPage;