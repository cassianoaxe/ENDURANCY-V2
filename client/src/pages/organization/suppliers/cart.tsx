import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShoppingCart, Trash2, ChevronLeft, CreditCard, AlertCircle, CheckCircle, Home, Package, ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

// Componente para o carrinho de compras
export default function CartPage() {
  const [activeTab, setActiveTab] = useState("cart");
  const [isCheckoutProcessing, setIsCheckoutProcessing] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Brasil",
  });
  const [billingAddress, setBillingAddress] = useState({
    sameAsShipping: true,
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Brasil",
  });
  
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  // Simulando um carrinho no estado local (em produção, usar localStorage ou state global)
  const [cart, setCart] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("supplierCart");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return { supplierId: null, items: [] };
        }
      }
    }
    return { supplierId: null, items: [] };
  });

  // Persistir carrinho no localStorage
  useEffect(() => {
    localStorage.setItem("supplierCart", JSON.stringify(cart));
  }, [cart]);

  // Buscar detalhes do fornecedor se houver itens no carrinho
  const { data: supplierData, isLoading: isLoadingSupplier } = useQuery({
    queryKey: [`/api/suppliers/${cart.supplierId}`],
    enabled: !!cart.supplierId,
  });

  // Buscar detalhes completos dos produtos no carrinho
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['/api/suppliers/products', { ids: cart.items.map(item => item.productId).join(',') }],
    enabled: cart.items.length > 0,
  });

  // Processar pedido
  const createOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      const response = await apiRequest("POST", "/api/suppliers/orders", orderData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar o pedido");
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Avançar para o pagamento
      setActiveTab("payment");
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers/orders'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar pedido",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Processar pagamento
  const processPaymentMutation = useMutation({
    mutationFn: async ({ orderId, paymentData }) => {
      setIsCheckoutProcessing(true);
      const response = await apiRequest("POST", `/api/suppliers/orders/${orderId}/payment`, paymentData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao processar pagamento");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setIsCheckoutProcessing(false);
      setIsPaymentComplete(true);
      // Limpar carrinho após pagamento bem-sucedido
      setCart({ supplierId: null, items: [] });
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers/orders'] });
      
      setTimeout(() => {
        setLocation("/organization/suppliers/orders");
      }, 3000);
    },
    onError: (error) => {
      setIsCheckoutProcessing(false);
      toast({
        title: "Erro ao processar pagamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Cálculos do carrinho
  const cartItems = cart.items.map(item => {
    const productDetails = productsData?.data?.find(p => p.id === item.productId) || {
      name: "Carregando...",
      price: 0,
      featuredImage: null
    };
    
    return {
      ...item,
      name: productDetails.name,
      price: productDetails.price || 0,
      image: productDetails.featuredImage,
      subtotal: (productDetails.price || 0) * item.quantity
    };
  });

  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const cartTax = 0; // Implementar cálculo de impostos se necessário
  const cartShipping = 0; // Implementar cálculo de frete se necessário
  const cartTotal = cartSubtotal + cartTax + cartShipping;

  // Manipuladores do carrinho
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCart(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    }));
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      const newItems = prev.items.filter(item => item.productId !== productId);
      return {
        ...prev,
        items: newItems,
        supplierId: newItems.length > 0 ? prev.supplierId : null
      };
    });
  };

  const handleCheckout = () => {
    // Validar endereço de entrega
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      toast({
        title: "Endereço incompleto",
        description: "Por favor, preencha os campos obrigatórios do endereço de entrega.",
        variant: "destructive",
      });
      return;
    }

    // Criar pedido
    const orderData = {
      supplierId: cart.supplierId,
      items: cart.items,
      shippingAddress,
      billingAddress: billingAddress.sameAsShipping ? shippingAddress : billingAddress,
    };

    createOrderMutation.mutate(orderData);
  };

  const handlePayment = () => {
    if (!createOrderMutation.data?.data?.id) {
      toast({
        title: "Erro no pedido",
        description: "Não foi possível encontrar informações do pedido para pagamento.",
        variant: "destructive",
      });
      return;
    }

    // Processar pagamento
    processPaymentMutation.mutate({
      orderId: createOrderMutation.data.data.id,
      paymentData: {
        paymentMethod,
        // Aqui incluiríamos dados do cartão ou boleto, etc.
      }
    });
  };

  // Verificar se o carrinho está vazio
  const isCartEmpty = cart.items.length === 0;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Carrinho de Compras</h1>
          <p className="text-muted-foreground">
            Revise seus itens e finalize a compra
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/organization/suppliers/products">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Continuar Comprando
          </Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cart" disabled={activeTab !== "cart"}>Carrinho</TabsTrigger>
          <TabsTrigger value="shipping" disabled={isCartEmpty || activeTab === "payment" || isPaymentComplete}>Endereço</TabsTrigger>
          <TabsTrigger value="payment" disabled={activeTab !== "payment" || isPaymentComplete}>Pagamento</TabsTrigger>
        </TabsList>
        
        {/* Conteúdo do Carrinho */}
        <TabsContent value="cart" className="space-y-4">
          {isCartEmpty ? (
            <Card>
              <CardHeader>
                <CardTitle>Seu carrinho está vazio</CardTitle>
                <CardDescription>
                  Você ainda não adicionou nenhum produto ao seu carrinho.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center py-8">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground mb-4">
                  Explore nosso catálogo de produtos e adicione itens ao seu carrinho.
                </p>
                <Button asChild>
                  <Link href="/organization/suppliers/products">
                    Ver Catálogo de Produtos
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : isLoadingProducts || isLoadingSupplier ? (
            <Card>
              <CardContent className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Itens no Carrinho</CardTitle>
                  <CardDescription>
                    {supplierData?.data?.name ? `Produtos de ${supplierData.data.name}` : 'Seus produtos selecionados'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Produto</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead className="text-right">Preço</TableHead>
                        <TableHead className="text-center">Quantidade</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cartItems.map((item) => (
                        <TableRow key={item.productId}>
                          <TableCell>
                            <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                              {item.image ? (
                                <img 
                                  src={item.image} 
                                  alt={item.name} 
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <Package className="h-8 w-8 text-gray-400" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-right">R$ {parseFloat(item.price).toFixed(2)}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-r-none"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                -
                              </Button>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                                className="h-8 w-14 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-l-none"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            R$ {parseFloat(item.subtotal).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCart(item.productId)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <div className="flex flex-col space-y-1.5 w-full items-end">
                    <div className="flex justify-between w-full md:w-1/3">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>R$ {cartSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between w-full md:w-1/3">
                      <span className="text-muted-foreground">Impostos:</span>
                      <span>R$ {cartTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between w-full md:w-1/3">
                      <span className="text-muted-foreground">Frete:</span>
                      <span>R$ {cartShipping.toFixed(2)}</span>
                    </div>
                    <Separator className="my-2 w-full md:w-1/3" />
                    <div className="flex justify-between w-full md:w-1/3 font-bold">
                      <span>Total:</span>
                      <span>R$ {cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-end w-full">
                    <Button 
                      size="lg" 
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => setActiveTab("shipping")}
                    >
                      Avançar para Endereço
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </>
          )}
        </TabsContent>
        
        {/* Endereço de Entrega */}
        <TabsContent value="shipping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Endereço de Entrega</CardTitle>
              <CardDescription>
                Informe para onde os produtos devem ser entregues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Rua/Avenida *</Label>
                  <Input 
                    id="street" 
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="number">Número *</Label>
                    <Input 
                      id="number" 
                      value={shippingAddress.number}
                      onChange={(e) => setShippingAddress({...shippingAddress, number: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="complement">Complemento</Label>
                    <Input 
                      id="complement" 
                      value={shippingAddress.complement}
                      onChange={(e) => setShippingAddress({...shippingAddress, complement: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro *</Label>
                  <Input 
                    id="neighborhood" 
                    value={shippingAddress.neighborhood}
                    onChange={(e) => setShippingAddress({...shippingAddress, neighborhood: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP *</Label>
                  <Input 
                    id="zipCode" 
                    value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input 
                    id="city" 
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado *</Label>
                  <Input 
                    id="state" 
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instructions">Instruções de entrega</Label>
                <Textarea 
                  id="instructions" 
                  placeholder="Informações adicionais para entrega (opcional)"
                />
              </div>
              
              <div className="space-y-2 pt-4">
                <Label className="text-base">Endereço de Cobrança</Label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="sameAsShipping" 
                    checked={billingAddress.sameAsShipping}
                    onChange={(e) => setBillingAddress({...billingAddress, sameAsShipping: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="sameAsShipping" className="text-sm font-normal">
                    Mesmo endereço de entrega
                  </Label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("cart")}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Voltar para o Carrinho
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700"
                onClick={handleCheckout}
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    Finalizar Pedido
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Pagamento */}
        <TabsContent value="payment" className="space-y-4">
          {isPaymentComplete ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-green-600">Pagamento Confirmado!</CardTitle>
                <CardDescription className="text-center">
                  Seu pedido foi processado com sucesso.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center py-8">
                <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
                <p className="text-center mb-6">
                  Obrigado pela sua compra! Seu pedido foi confirmado e está sendo processado.
                </p>
                <p className="text-center text-sm text-muted-foreground mb-4">
                  Você será redirecionado para a página de pedidos em instantes...
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Pagamento</CardTitle>
                <CardDescription>
                  Escolha a forma de pagamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup 
                  value={paymentMethod} 
                  onValueChange={setPaymentMethod}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2 border rounded-md p-4">
                    <RadioGroupItem value="credit_card" id="payment_cc" />
                    <Label htmlFor="payment_cc" className="flex-1 cursor-pointer">
                      <div className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>Cartão de Crédito</span>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-md p-4">
                    <RadioGroupItem value="boleto" id="payment_boleto" />
                    <Label htmlFor="payment_boleto" className="flex-1 cursor-pointer">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>Boleto Bancário</span>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-md p-4">
                    <RadioGroupItem value="pix" id="payment_pix" />
                    <Label htmlFor="payment_pix" className="flex-1 cursor-pointer">
                      <div className="flex items-center">
                        <span className="inline-block w-5 h-5 mr-2 text-center font-bold text-muted-foreground">P</span>
                        <span>PIX</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
                
                {paymentMethod === 'credit_card' && (
                  <div className="border rounded-md p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="card_number">Número do Cartão</Label>
                        <Input id="card_number" placeholder="0000 0000 0000 0000" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Validade</Label>
                          <Input id="expiry" placeholder="MM/AA" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input id="cvv" placeholder="000" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card_name">Nome no Cartão</Label>
                      <Input id="card_name" placeholder="Nome como aparece no cartão" />
                    </div>
                  </div>
                )}
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Simulação de pagamento</AlertTitle>
                  <AlertDescription>
                    Este é um ambiente de teste. Nenhum pagamento real será processado.
                  </AlertDescription>
                </Alert>
                
                <div className="border rounded-md p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Total do Pedido:</span>
                    <span className="font-bold">
                      R$ {cartTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="flex justify-between w-full">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("shipping")}
                    disabled={isCheckoutProcessing}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                  <Button 
                    className="bg-red-600 hover:bg-red-700"
                    onClick={handlePayment}
                    disabled={isCheckoutProcessing}
                  >
                    {isCheckoutProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando Pagamento...
                      </>
                    ) : (
                      <>
                        Finalizar Compra
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}