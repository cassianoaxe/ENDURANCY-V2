'use client';

import React, { useState, useEffect } from 'react';
import PatientLayout from '@/components/layout/PatientLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ShoppingBag, CreditCard, Landmark, QrCode, Truck, MapPin, ArrowLeft, 
  Clock, Calendar, AlertCircle, Check, Loader2, Package, Home
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Interface para o carrinho
interface CartItem {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  image?: string;
}

// Interface para endereço
interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault?: boolean;
}

const CheckoutPage: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [step, setStep] = useState(1);
  
  // Estado para os itens do carrinho
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  // Estado para o checkout
  const [checkout, setCheckout] = useState({
    // Seção de entrega
    deliveryMethod: 'standard', // 'standard', 'express', 'pickup'
    selectedAddressId: '1', // índice do endereço selecionado
    
    // Seção de pagamento
    paymentMethod: 'credit', // 'credit', 'pix', 'bankslip'
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
    installments: '1',
    saveCard: false,
    
    // Cupons e observações
    couponCode: '',
    orderNotes: '',
    
    // Termos
    termsAccepted: false
  });
  
  // Endereços cadastrados
  const [addresses, setAddresses] = useState<Address[]>([
    {
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apto 101',
      neighborhood: 'Jardim Primavera',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      isDefault: true
    },
    {
      street: 'Av. Paulista',
      number: '1000',
      complement: 'Sala 210',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      isDefault: false
    }
  ]);
  
  // Prescrições ativas
  const [prescriptions, setPrescriptions] = useState([
    {
      id: '1',
      doctor: 'Dr. Antônio Silva',
      date: '2023-06-01',
      expiryDate: '2023-12-01',
      status: 'ativa'
    },
    {
      id: '2',
      doctor: 'Dra. Maria Oliveira',
      date: '2023-06-15',
      expiryDate: '2023-12-15',
      status: 'ativa'
    }
  ]);
  
  // Cartões salvos
  const [savedCards, setSavedCards] = useState([
    {
      id: '1',
      lastDigits: '1234',
      type: 'Visa',
      expiryDate: '12/25'
    },
    {
      id: '2',
      lastDigits: '5678',
      type: 'Mastercard',
      expiryDate: '10/26'
    }
  ]);
  
  // Simular carregamento de itens do carrinho
  useEffect(() => {
    // Simulação de carrinho salvo no localStorage
    // Em uma aplicação real, isso viria de um contexto ou do backend
    const mockCartItems: CartItem[] = [
      {
        id: '1',
        name: 'Óleo de CBD 5%',
        price: 250,
        quantity: 1,
        image: '/images/cbd-oil.jpg'
      },
      {
        id: '3',
        name: 'Extrato de Cannabis 20:1 (CBD:THC)',
        price: 380,
        discountPrice: 342,
        quantity: 1,
        image: '/images/cbd-extract.jpg'
      }
    ];
    
    setCartItems(mockCartItems);
  }, []);
  
  // Função de formatação de preço
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };
  
  // Calcular subtotal
  const subtotal = cartItems.reduce(
    (total, item) => total + (item.discountPrice || item.price) * item.quantity, 
    0
  );
  
  // Calcular valores de envio
  const getShippingCost = () => {
    switch (checkout.deliveryMethod) {
      case 'express':
        return 30.00;
      case 'pickup':
        return 0;
      case 'standard':
      default:
        return 15.00;
    }
  };
  
  // Aplicar desconto do cupom (simulado)
  const getCouponDiscount = () => {
    if (checkout.couponCode.toUpperCase() === 'WELCOME10') {
      return subtotal * 0.1; // 10% de desconto
    }
    return 0;
  };
  
  // Calcular total
  const total = subtotal + getShippingCost() - getCouponDiscount();
  
  // Verificar cupom
  const checkCoupon = () => {
    if (checkout.couponCode) {
      if (checkout.couponCode.toUpperCase() === 'WELCOME10') {
        toast({
          title: "Cupom aplicado!",
          description: "Desconto de 10% aplicado ao seu pedido.",
        });
      } else {
        toast({
          title: "Cupom inválido",
          description: "O código informado não é válido ou está expirado.",
          variant: "destructive"
        });
        setCheckout({...checkout, couponCode: ''});
      }
    }
  };
  
  // Função para atualizar os campos do checkout
  const updateCheckout = (field: string, value: string | boolean) => {
    setCheckout(prev => ({ ...prev, [field]: value }));
  };
  
  // Função para continuar para a próxima etapa
  const nextStep = () => {
    if (step === 1) {
      // Validar método de entrega e endereço
      if (checkout.deliveryMethod && (checkout.deliveryMethod === 'pickup' || checkout.selectedAddressId)) {
        setStep(2);
      } else {
        toast({
          title: "Informações incompletas",
          description: "Por favor, selecione um método de entrega e endereço.",
          variant: "destructive"
        });
      }
    } else if (step === 2) {
      // Validar método de pagamento
      if (checkout.paymentMethod === 'credit') {
        // Validar informações do cartão
        if (!checkout.cardNumber || !checkout.cardholderName || !checkout.expiryDate || !checkout.cvv) {
          toast({
            title: "Informações incompletas",
            description: "Por favor, preencha todos os dados do cartão.",
            variant: "destructive"
          });
          return;
        }
      }
      setStep(3);
    }
  };
  
  // Função para voltar uma etapa
  const prevStep = () => {
    setStep(step - 1);
  };
  
  // Função para concluir o pedido
  const finalizeOrder = () => {
    if (!checkout.termsAccepted) {
      toast({
        title: "Termos não aceitos",
        description: "Por favor, aceite os termos e condições para concluir o pedido.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulação de envio do pedido
    setTimeout(() => {
      setIsSubmitting(false);
      setOrderComplete(true);
      setOrderId("PED" + Math.floor(10000 + Math.random() * 90000)); // ID aleatório
      
      toast({
        title: "Pedido realizado com sucesso!",
        description: "Você receberá uma confirmação por e-mail.",
      });
    }, 2000);
  };
  
  // Função para retornar à página de produtos
  const backToProducts = () => {
    window.location.href = '/patient/produtos';
  };
  
  // Função para ir à página de rastreamento
  const goToTracking = () => {
    window.location.href = `/patient/pedidos/rastreamento?id=${orderId}`;
  };
  
  // Renderizar conteúdo da página
  return (
    <PatientLayout>
      <div className="container py-8">
        {orderComplete ? (
          // Confirmação de pedido
          <Card className="max-w-3xl mx-auto">
            <CardHeader className="text-center border-b pb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Pedido Realizado com Sucesso!</CardTitle>
              <CardDescription className="text-lg">
                Obrigado por sua compra. Seu pedido #{orderId} foi confirmado.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-1">
                <h3 className="font-medium">Detalhes do Pedido:</h3>
                <p className="text-sm text-gray-600">
                  Você receberá um e-mail de confirmação em breve com todos os detalhes do seu pedido.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Data do pedido:</span>
                  <span className="text-sm">{new Date().toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Método de pagamento:</span>
                  <span className="text-sm">
                    {checkout.paymentMethod === 'credit' ? 'Cartão de Crédito' : 
                     checkout.paymentMethod === 'pix' ? 'PIX' : 'Boleto Bancário'}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Entrega estimada:</span>
                  <span className="text-sm">
                    {checkout.deliveryMethod === 'express' ? '1-2 dias úteis' : 
                     checkout.deliveryMethod === 'pickup' ? 'Retirada na loja' : '5-7 dias úteis'}
                  </span>
                </div>
              </div>
              
              {/* Resumo dos itens */}
              <div className="space-y-3">
                <h3 className="font-medium">Resumo do Pedido:</h3>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div className="flex items-center">
                        <span className="text-sm font-medium">{item.quantity}x</span>
                        <span className="ml-2">{item.name}</span>
                      </div>
                      <span>
                        {formatPrice((item.discountPrice || item.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Frete</span>
                    <span>{formatPrice(getShippingCost())}</span>
                  </div>
                  
                  {getCouponDiscount() > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Desconto (Cupom: {checkout.couponCode})</span>
                      <span className="text-green-600">-{formatPrice(getCouponDiscount())}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-300">O que acontece agora?</h4>
                    <p className="text-sm text-blue-800/70 dark:text-blue-300/70 mt-1">
                      Nossa equipe verificará seu pedido e enviará para preparação. Você receberá notificações sobre o status de seu pedido. Você pode acompanhar seu pedido a qualquer momento na página de rastreamento.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={backToProducts}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Ver Mais Produtos
              </Button>
              <Button onClick={goToTracking}>
                <Package className="mr-2 h-4 w-4" />
                Rastrear Pedido
              </Button>
            </CardFooter>
          </Card>
        ) : (
          // Formulário de checkout
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Checkout</h1>
                <Button 
                  variant="ghost" 
                  className="flex items-center text-sm" 
                  onClick={backToProducts}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Voltar para produtos
                </Button>
              </div>
              
              {/* Etapas do Checkout */}
              <div className="relative">
                <div className="flex items-center justify-between text-sm">
                  <div className={`flex flex-col items-center ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                      {step > 1 ? <Check className="h-5 w-5" /> : "1"}
                    </div>
                    <span className="mt-1 text-xs sm:text-sm">Entrega</span>
                  </div>
                  
                  <div className={`flex flex-col items-center ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                      {step > 2 ? <Check className="h-5 w-5" /> : "2"}
                    </div>
                    <span className="mt-1 text-xs sm:text-sm">Pagamento</span>
                  </div>
                  
                  <div className={`flex flex-col items-center ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                      <span>3</span>
                    </div>
                    <span className="mt-1 text-xs sm:text-sm">Confirmação</span>
                  </div>
                </div>
                
                {/* Linha de progresso */}
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10">
                  <div 
                    className="h-full bg-primary transition-all duration-300" 
                    style={{ width: `${((step - 1) / 2) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Formulário da Etapa Atual */}
              <Card>
                {step === 1 && (
                  /* Etapa 1: Informações de Entrega */
                  <>
                    <CardHeader>
                      <CardTitle>Informações de Entrega</CardTitle>
                      <CardDescription>
                        Escolha o método de entrega e informe seu endereço
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {/* Método de Entrega */}
                      <div>
                        <h3 className="text-lg font-medium mb-3">Método de Entrega</h3>
                        <RadioGroup 
                          value={checkout.deliveryMethod} 
                          onValueChange={(value) => updateCheckout('deliveryMethod', value)}
                          className="space-y-3"
                        >
                          <div className={`flex items-center space-x-3 border rounded-lg p-4 ${checkout.deliveryMethod === 'standard' ? 'border-primary' : 'border-gray-200 dark:border-gray-700'}`}>
                            <RadioGroupItem value="standard" id="standard" />
                            <div className="flex-1">
                              <Label htmlFor="standard" className="flex items-center text-base font-medium">
                                <Truck className="h-5 w-5 mr-2 text-gray-500" />
                                Entrega Padrão
                              </Label>
                              <p className="text-sm text-gray-500 mt-1">
                                5-7 dias úteis - {formatPrice(15)}
                              </p>
                            </div>
                          </div>
                          
                          <div className={`flex items-center space-x-3 border rounded-lg p-4 ${checkout.deliveryMethod === 'express' ? 'border-primary' : 'border-gray-200 dark:border-gray-700'}`}>
                            <RadioGroupItem value="express" id="express" />
                            <div className="flex-1">
                              <Label htmlFor="express" className="flex items-center text-base font-medium">
                                <Clock className="h-5 w-5 mr-2 text-gray-500" />
                                Entrega Expressa
                              </Label>
                              <p className="text-sm text-gray-500 mt-1">
                                1-2 dias úteis - {formatPrice(30)}
                              </p>
                            </div>
                          </div>
                          
                          <div className={`flex items-center space-x-3 border rounded-lg p-4 ${checkout.deliveryMethod === 'pickup' ? 'border-primary' : 'border-gray-200 dark:border-gray-700'}`}>
                            <RadioGroupItem value="pickup" id="pickup" />
                            <div className="flex-1">
                              <Label htmlFor="pickup" className="flex items-center text-base font-medium">
                                <Home className="h-5 w-5 mr-2 text-gray-500" />
                                Retirada na Loja
                              </Label>
                              <p className="text-sm text-gray-500 mt-1">
                                Retire em nossa loja física - Gratuito
                              </p>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      {/* Endereço de Entrega */}
                      {checkout.deliveryMethod !== 'pickup' && (
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-medium">Endereço de Entrega</h3>
                            <Button variant="outline" size="sm">
                              + Novo Endereço
                            </Button>
                          </div>
                          
                          <RadioGroup 
                            value={checkout.selectedAddressId} 
                            onValueChange={(value) => updateCheckout('selectedAddressId', value)}
                            className="space-y-3"
                          >
                            {addresses.map((address, index) => (
                              <div 
                                key={index}
                                className={`flex items-center space-x-3 border rounded-lg p-4 ${checkout.selectedAddressId === index.toString() ? 'border-primary' : 'border-gray-200 dark:border-gray-700'}`}
                              >
                                <RadioGroupItem value={index.toString()} id={`address-${index}`} />
                                <div className="flex-1">
                                  <Label htmlFor={`address-${index}`} className="flex items-center text-base font-medium">
                                    <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                                    {address.isDefault && (
                                      <Badge variant="outline" className="mr-2">Principal</Badge>
                                    )}
                                    Endereço {index + 1}
                                  </Label>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {address.street}, {address.number}
                                    {address.complement ? `, ${address.complement}` : ''} - {address.neighborhood}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {address.city}, {address.state} - CEP {address.zipCode}
                                  </p>
                                </div>
                                <Button variant="ghost" size="sm">
                                  Editar
                                </Button>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      )}
                      
                      {/* Endereço de retirada */}
                      {checkout.deliveryMethod === 'pickup' && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                          <h4 className="font-medium mb-2">Loja Física</h4>
                          <p className="text-sm text-gray-600">Av. Paulista, 1500 - Bela Vista</p>
                          <p className="text-sm text-gray-600">São Paulo, SP - CEP 01310-100</p>
                          <p className="text-sm text-gray-600 mt-2">Horário de funcionamento: 09h às 18h (Seg. a Sex.)</p>
                        </div>
                      )}
                    </CardContent>
                  </>
                )}
                
                {step === 2 && (
                  /* Etapa 2: Informações de Pagamento */
                  <>
                    <CardHeader>
                      <CardTitle>Pagamento</CardTitle>
                      <CardDescription>
                        Escolha o método de pagamento e informe os dados
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {/* Método de Pagamento */}
                      <Tabs 
                        value={checkout.paymentMethod} 
                        onValueChange={(value) => updateCheckout('paymentMethod', value)}
                        className="w-full"
                      >
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="credit" className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Cartão
                          </TabsTrigger>
                          <TabsTrigger value="pix" className="flex items-center">
                            <QrCode className="h-4 w-4 mr-2" />
                            Pix
                          </TabsTrigger>
                          <TabsTrigger value="bankslip" className="flex items-center">
                            <Landmark className="h-4 w-4 mr-2" />
                            Boleto
                          </TabsTrigger>
                        </TabsList>
                        
                        {/* Opções de Cartão de Crédito */}
                        <TabsContent value="credit" className="mt-4 space-y-6">
                          {savedCards.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Cartões Salvos</h4>
                              <div className="space-y-2">
                                {savedCards.map((card) => (
                                  <div key={card.id} className="flex items-center justify-between border rounded-lg p-3">
                                    <div className="flex items-center">
                                      <CreditCard className="h-5 w-5 mr-2 text-gray-500" />
                                      <div>
                                        <p className="text-sm font-medium">{card.type} •••• {card.lastDigits}</p>
                                        <p className="text-xs text-gray-500">Exp: {card.expiryDate}</p>
                                      </div>
                                    </div>
                                    <Button size="sm" variant="outline">Usar</Button>
                                  </div>
                                ))}
                              </div>
                              <Separator className="my-4" />
                              <p className="text-sm mb-4">Ou adicione um novo cartão:</p>
                            </div>
                          )}
                          
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 gap-3">
                              <div className="space-y-1">
                                <Label htmlFor="cardNumber">Número do Cartão</Label>
                                <Input 
                                  id="cardNumber" 
                                  placeholder="0000 0000 0000 0000" 
                                  value={checkout.cardNumber}
                                  onChange={(e) => updateCheckout('cardNumber', e.target.value)}
                                />
                              </div>
                              
                              <div className="space-y-1">
                                <Label htmlFor="cardholderName">Nome do Titular</Label>
                                <Input 
                                  id="cardholderName" 
                                  placeholder="Como aparece no cartão" 
                                  value={checkout.cardholderName}
                                  onChange={(e) => updateCheckout('cardholderName', e.target.value)}
                                />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label htmlFor="expiryDate">Data de Validade</Label>
                                  <Input 
                                    id="expiryDate" 
                                    placeholder="MM/AA" 
                                    value={checkout.expiryDate}
                                    onChange={(e) => updateCheckout('expiryDate', e.target.value)}
                                  />
                                </div>
                                
                                <div className="space-y-1">
                                  <Label htmlFor="cvv">CVV</Label>
                                  <Input 
                                    id="cvv" 
                                    placeholder="123" 
                                    value={checkout.cvv}
                                    onChange={(e) => updateCheckout('cvv', e.target.value)}
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <Label htmlFor="installments">Parcelamento</Label>
                                <Select 
                                  value={checkout.installments} 
                                  onValueChange={(value) => updateCheckout('installments', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o número de parcelas" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1">À vista - {formatPrice(total)}</SelectItem>
                                    <SelectItem value="2">2x de {formatPrice(total / 2)} sem juros</SelectItem>
                                    <SelectItem value="3">3x de {formatPrice(total / 3)} sem juros</SelectItem>
                                    <SelectItem value="4">4x de {formatPrice(total / 4)} sem juros</SelectItem>
                                    <SelectItem value="5">5x de {formatPrice(total / 5)} sem juros</SelectItem>
                                    <SelectItem value="6">6x de {formatPrice(total / 6)} sem juros</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="flex items-center space-x-2 pt-2">
                                <Checkbox 
                                  id="saveCard" 
                                  checked={checkout.saveCard}
                                  onCheckedChange={(checked) => updateCheckout('saveCard', Boolean(checked))}
                                />
                                <Label htmlFor="saveCard" className="text-sm">
                                  Salvar este cartão para compras futuras
                                </Label>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                        
                        {/* Opções de PIX */}
                        <TabsContent value="pix" className="mt-4">
                          <div className="text-center space-y-4 py-6">
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mx-auto w-64 h-64 flex items-center justify-center">
                              <QrCode className="h-40 w-40 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-2">
                                Após finalizar o pedido, um QR code PIX será gerado para pagamento imediato.
                              </p>
                              <p className="text-sm font-medium">
                                Valor total: {formatPrice(total)}
                              </p>
                            </div>
                          </div>
                        </TabsContent>
                        
                        {/* Opções de Boleto */}
                        <TabsContent value="bankslip" className="mt-4">
                          <div className="text-center space-y-4 py-6">
                            <Landmark className="h-16 w-16 text-gray-400 mx-auto" />
                            <div>
                              <p className="text-sm text-gray-600">
                                Após finalizar o pedido, um boleto será gerado para pagamento em até 3 dias úteis.
                              </p>
                              <p className="text-sm text-gray-600 mt-2">
                                O processamento do pedido iniciará após a confirmação do pagamento.
                              </p>
                              <p className="text-sm font-medium mt-3">
                                Valor total: {formatPrice(total)}
                              </p>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                      
                      {/* Cupom de Desconto */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Cupom de Desconto</h4>
                        <div className="flex space-x-2">
                          <Input 
                            placeholder="Código do cupom" 
                            value={checkout.couponCode}
                            onChange={(e) => updateCheckout('couponCode', e.target.value)}
                          />
                          <Button variant="outline" onClick={checkCoupon}>Aplicar</Button>
                        </div>
                      </div>
                      
                      {/* Observações */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Observações do Pedido (opcional)</h4>
                        <Textarea 
                          placeholder="Instruções de entrega ou outras observações" 
                          value={checkout.orderNotes}
                          onChange={(e) => updateCheckout('orderNotes', e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </>
                )}
                
                {step === 3 && (
                  /* Etapa 3: Revisão e Confirmação */
                  <>
                    <CardHeader>
                      <CardTitle>Revisão do Pedido</CardTitle>
                      <CardDescription>
                        Verifique os detalhes e confirme seu pedido
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {/* Resumo do pedido */}
                      <Accordion type="single" collapsible defaultValue="items">
                        {/* Itens do Pedido */}
                        <AccordionItem value="items">
                          <AccordionTrigger>
                            <div className="flex items-center">
                              <ShoppingBag className="h-5 w-5 mr-2" />
                              <span>Itens do Pedido ({cartItems.length})</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3 pt-2">
                              {cartItems.map((item) => (
                                <div key={item.id} className="flex justify-between py-2 border-b last:border-0">
                                  <div className="flex-1">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-500">Quantidade: {item.quantity}</p>
                                  </div>
                                  <div className="text-right">
                                    {item.discountPrice ? (
                                      <>
                                        <p className="text-sm line-through text-gray-500">
                                          {formatPrice(item.price * item.quantity)}
                                        </p>
                                        <p className="font-medium">
                                          {formatPrice(item.discountPrice * item.quantity)}
                                        </p>
                                      </>
                                    ) : (
                                      <p className="font-medium">
                                        {formatPrice(item.price * item.quantity)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                        {/* Informações de Entrega */}
                        <AccordionItem value="delivery">
                          <AccordionTrigger>
                            <div className="flex items-center">
                              <Truck className="h-5 w-5 mr-2" />
                              <span>Informações de Entrega</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3 pt-2">
                              <div>
                                <p className="font-medium">Método de Entrega:</p>
                                <p className="text-sm text-gray-600">
                                  {checkout.deliveryMethod === 'standard' ? 'Entrega Padrão (5-7 dias úteis)' : 
                                   checkout.deliveryMethod === 'express' ? 'Entrega Expressa (1-2 dias úteis)' :
                                   'Retirada na Loja'}
                                </p>
                              </div>
                              
                              {checkout.deliveryMethod !== 'pickup' && (
                                <div>
                                  <p className="font-medium">Endereço de Entrega:</p>
                                  <div className="text-sm text-gray-600">
                                    {addresses.map((address, index) => {
                                      if (index.toString() === checkout.selectedAddressId) {
                                        return (
                                          <div key={index}>
                                            <p>{address.street}, {address.number}{address.complement ? `, ${address.complement}` : ''}</p>
                                            <p>{address.neighborhood} - {address.city}, {address.state}</p>
                                            <p>CEP: {address.zipCode}</p>
                                          </div>
                                        );
                                      }
                                      return null;
                                    })}
                                  </div>
                                </div>
                              )}
                              
                              {checkout.deliveryMethod === 'pickup' && (
                                <div>
                                  <p className="font-medium">Local de Retirada:</p>
                                  <p className="text-sm text-gray-600">Av. Paulista, 1500 - Bela Vista</p>
                                  <p className="text-sm text-gray-600">São Paulo, SP - CEP 01310-100</p>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                        {/* Informações de Pagamento */}
                        <AccordionItem value="payment">
                          <AccordionTrigger>
                            <div className="flex items-center">
                              <CreditCard className="h-5 w-5 mr-2" />
                              <span>Informações de Pagamento</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3 pt-2">
                              <div>
                                <p className="font-medium">Método de Pagamento:</p>
                                <p className="text-sm text-gray-600">
                                  {checkout.paymentMethod === 'credit' ? 'Cartão de Crédito' : 
                                   checkout.paymentMethod === 'pix' ? 'PIX' : 'Boleto Bancário'}
                                </p>
                              </div>
                              
                              {checkout.paymentMethod === 'credit' && (
                                <div>
                                  <p className="font-medium">Detalhes do Cartão:</p>
                                  <p className="text-sm text-gray-600">
                                    **** **** **** {checkout.cardNumber.slice(-4)}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {checkout.installments === '1' ? 'Pagamento à vista' : 
                                     `${checkout.installments}x de ${formatPrice(total / parseInt(checkout.installments))} sem juros`}
                                  </p>
                                </div>
                              )}
                              
                              {checkout.couponCode && getCouponDiscount() > 0 && (
                                <div>
                                  <p className="font-medium">Cupom Aplicado:</p>
                                  <p className="text-sm text-gray-600">
                                    {checkout.couponCode.toUpperCase()} - Desconto de {formatPrice(getCouponDiscount())}
                                  </p>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                      
                      {/* Prescrição Médica */}
                      <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-amber-800 dark:text-amber-300">Prescrição Médica</h4>
                            <p className="text-sm text-amber-800/70 dark:text-amber-300/70 mt-1">
                              Este pedido contém produtos que requerem prescrição médica. Nossa equipe verificará a validade da sua prescrição cadastrada antes de liberar o envio.
                            </p>
                            
                            <div className="mt-3 bg-white dark:bg-gray-800 rounded p-3">
                              <h5 className="text-sm font-medium">Prescrições Ativas:</h5>
                              <div className="mt-2 space-y-2">
                                {prescriptions.map((prescription) => (
                                  <div key={prescription.id} className="flex justify-between items-center text-sm">
                                    <div>
                                      <p>{prescription.doctor}</p>
                                      <p className="text-xs text-gray-500">
                                        Emitida em: {new Date(prescription.date).toLocaleDateString('pt-BR')}
                                      </p>
                                    </div>
                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                      Válida até {new Date(prescription.expiryDate).toLocaleDateString('pt-BR')}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Termos e Condições */}
                      <div className="space-y-2 pt-2">
                        <div className="flex items-start space-x-2">
                          <Checkbox 
                            id="terms" 
                            checked={checkout.termsAccepted}
                            onCheckedChange={(checked) => updateCheckout('termsAccepted', Boolean(checked))}
                            className="mt-1"
                          />
                          <div>
                            <Label htmlFor="terms" className="font-medium">
                              Termos e Condições *
                            </Label>
                            <p className="text-sm text-gray-600 mt-1">
                              Li e concordo com os <Button variant="link" className="p-0 h-auto text-sm">Termos de Uso</Button> e <Button variant="link" className="p-0 h-auto text-sm">Política de Privacidade</Button>. Confirmo que todas as informações fornecidas são verdadeiras e autorizo o processamento do meu pedido.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </>
                )}
                
                <CardFooter className="flex justify-between pt-6 border-t">
                  {step > 1 ? (
                    <Button variant="outline" onClick={prevStep}>
                      Voltar
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={backToProducts}>
                      Continuar Comprando
                    </Button>
                  )}
                  
                  {step < 3 ? (
                    <Button onClick={nextStep}>
                      Continuar
                    </Button>
                  ) : (
                    <Button 
                      onClick={finalizeOrder}
                      disabled={isSubmitting || !checkout.termsAccepted}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        'Finalizar Compra'
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
            
            {/* Resumo do Pedido (Coluna Direita) */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Resumo do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Itens no Carrinho */}
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between pb-3 border-b last:border-0 last:pb-0">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gray-100 rounded mr-3"></div>
                          <div>
                            <p className="text-sm font-medium truncate max-w-[140px]">{item.name}</p>
                            <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {item.discountPrice ? (
                            <>
                              <p className="text-xs text-gray-500 line-through">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                              <p className="text-sm font-medium">
                                {formatPrice(item.discountPrice * item.quantity)}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm font-medium">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Cálculos */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Subtotal</span>
                      <span className="text-sm">{formatPrice(subtotal)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm">Frete</span>
                      <span className="text-sm">{formatPrice(getShippingCost())}</span>
                    </div>
                    
                    {getCouponDiscount() > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">Desconto</span>
                        <span className="text-sm text-green-600">
                          -{formatPrice(getCouponDiscount())}
                        </span>
                      </div>
                    )}
                    
                    <Separator className="my-2" />
                    
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <p className="text-xs text-gray-500 w-full text-center">
                    {checkout.paymentMethod === 'credit' && checkout.installments !== '1' && (
                      <>Em até {checkout.installments}x de {formatPrice(total / parseInt(checkout.installments))} sem juros</>
                    )}
                  </p>
                </CardFooter>
              </Card>
              
              {/* Segurança e Suporte */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <CreditCard className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm font-medium">Pagamento Seguro</p>
                        <p className="text-xs text-gray-500">Suas informações financeiras são protegidas por criptografia de ponta.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Truck className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm font-medium">Entrega Rastreada</p>
                        <p className="text-xs text-gray-500">Acompanhe seu pedido em tempo real desde o envio até a entrega.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-purple-600 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm font-medium">Política de Devolução</p>
                        <p className="text-xs text-gray-500">30 dias para solicitação de devolução em caso de problemas.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Precisa de Ajuda? */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm font-medium mb-1">Precisa de ajuda?</p>
                <p className="text-xs text-gray-600 mb-3">Nossa equipe está disponível para tirar suas dúvidas.</p>
                <Button variant="outline" size="sm" className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Entrar em Contato
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PatientLayout>
  );
};

export default CheckoutPage;