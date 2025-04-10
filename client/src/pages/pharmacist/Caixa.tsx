import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PharmacistLayout from '@/components/layout/pharmacist/PharmacistLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Search, 
  Plus,
  Minus,
  Trash2,
  Receipt,
  ShoppingCart,
  CreditCard,
  Wallet,
  BanknoteIcon,
  QrCode,
  CircleDollarSign,
  ArrowRightCircle
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface Product {
  id: number;
  name: string;
  price: number;
  stockQuantity: number;
  image?: string;
  description?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface PaymentInfo {
  method: 'cash' | 'credit' | 'debit' | 'pix';
  amountPaid: number;
  change: number;
}

export default function PharmacistCaixa() {
  const { user } = useAuth();
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [organizationName, setOrganizationName] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit' | 'debit' | 'pix'>('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [customer, setCustomer] = useState('');
  const [registerStatus, setRegisterStatus] = useState<'closed' | 'open'>('closed');
  const [registerAmount, setRegisterAmount] = useState(0);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [initialAmount, setInitialAmount] = useState('');

  // Dados da organização
  const { data: organizationData } = useQuery({
    queryKey: ['organization', user?.organizationId],
    queryFn: async () => {
      if (!user?.organizationId) return null;
      const response = await axios.get(`/api/organizations/${user.organizationId}`);
      return response.data;
    },
    enabled: !!user?.organizationId
  });

  // Buscar produtos
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', user?.organizationId],
    queryFn: async () => {
      if (!user?.organizationId) return [];
      const response = await axios.get(`/api/organizations/${user.organizationId}/products`);
      return response.data;
    },
    enabled: !!user?.organizationId
  });

  // Mutação para registrar venda
  const createSaleMutation = useMutation({
    mutationFn: async (data: any) => {
      return axios.post(`/api/pharmacist/sales`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Venda registrada com sucesso",
        description: "Os produtos foram atualizados no estoque",
        duration: 3000,
      });
      // Resetar o carrinho após a venda
      setCart([]);
      setPaymentInfo(null);
      setIsReceiptDialogOpen(false);
      setCustomer('');
      setAmountPaid('');
    },
    onError: (error) => {
      console.error('Erro ao registrar venda:', error);
      toast({
        title: "Erro ao registrar venda",
        description: "Verifique o estoque dos produtos ou tente novamente mais tarde",
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  useEffect(() => {
    if (organizationData) {
      setOrganizationName(organizationData.name || "");
    }
  }, [organizationData]);

  useEffect(() => {
    if (productsData) {
      if (searchTerm.trim() === '') {
        setFilteredProducts([]);
      } else {
        const searchTermLower = searchTerm.toLowerCase();
        const filtered = productsData.filter((product: Product) => 
          product.name.toLowerCase().includes(searchTermLower) ||
          (product.description && product.description.toLowerCase().includes(searchTermLower))
        );
        setFilteredProducts(filtered.slice(0, 10)); // Limitar a 10 resultados
      }
    }
  }, [searchTerm, productsData]);

  // Função para limpar a pesquisa e focar no campo
  const clearSearch = () => {
    setSearchTerm('');
    setFilteredProducts([]);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Calcular o total do carrinho
  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  // Adicionar produto ao carrinho
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      // Verificar se o produto já está no carrinho
      const existingItem = prevCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Se o produto já estiver no carrinho, incrementar a quantidade
        return prevCart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // Se não, adicionar como novo item
        return [...prevCart, { product, quantity: 1 }];
      }
    });
    
    clearSearch();
    toast({
      title: "Produto adicionado",
      description: `${product.name} foi adicionado ao carrinho`,
      duration: 2000,
    });
  };

  // Remover produto do carrinho
  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  // Aumentar quantidade de um produto
  const increaseQuantity = (productId: number) => {
    setCart(prevCart => 
      prevCart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      )
    );
  };

  // Diminuir quantidade de um produto
  const decreaseQuantity = (productId: number) => {
    setCart(prevCart => 
      prevCart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: Math.max(1, item.quantity - 1) } 
          : item
      )
    );
  };

  // Finalizar a venda
  const finalizeSale = () => {
    const total = calculateTotal();
    
    if (paymentMethod === 'cash') {
      const amountPaidValue = parseFloat(amountPaid.replace(',', '.'));
      
      if (isNaN(amountPaidValue) || amountPaidValue < total) {
        toast({
          title: "Valor insuficiente",
          description: "O valor pago deve ser maior ou igual ao total da compra",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
      
      const change = amountPaidValue - total;
      
      setPaymentInfo({
        method: paymentMethod,
        amountPaid: amountPaidValue,
        change: change
      });
    } else {
      // Para outros métodos, não há troco
      setPaymentInfo({
        method: paymentMethod,
        amountPaid: total,
        change: 0
      });
    }
    
    setIsPaymentDialogOpen(false);
    setIsReceiptDialogOpen(true);
  };

  // Processar a venda após confirmação
  const processSale = () => {
    if (!paymentInfo) return;
    
    const saleData = {
      organizationId: user?.organizationId,
      items: cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.price
      })),
      total: calculateTotal(),
      paymentMethod: paymentInfo.method,
      customerName: customer || 'Cliente não identificado',
      registerAmount: registerAmount
    };
    
    createSaleMutation.mutate(saleData);
  };

  // Abrir o caixa
  const openRegister = () => {
    const amount = parseFloat(initialAmount.replace(',', '.'));
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Valor inválido",
        description: "Informe um valor inicial válido para o caixa",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    setRegisterStatus('open');
    setRegisterAmount(amount);
    setIsRegisterDialogOpen(false);
    
    toast({
      title: "Caixa aberto",
      description: `Caixa iniciado com valor de ${formatCurrency(amount)}`,
      duration: 3000,
    });
  };

  // Fechar o caixa
  const closeRegister = () => {
    // No futuro, implementar relatório de fechamento
    setRegisterStatus('closed');
    setRegisterAmount(0);
    
    toast({
      title: "Caixa fechado",
      description: "O caixa foi fechado com sucesso",
      duration: 3000,
    });
  };

  // Formatar valor monetário
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <PharmacistLayout>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Caixa</h1>
            <p className="text-gray-500">Registro de vendas e pagamentos • Farmácia {organizationName}</p>
          </div>
          
          {registerStatus === 'closed' ? (
            <Button 
              className="flex items-center gap-2"
              onClick={() => setIsRegisterDialogOpen(true)}
            >
              <CircleDollarSign className="h-4 w-4" />
              Abrir Caixa
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={closeRegister}
            >
              <ArrowRightCircle className="h-4 w-4" />
              Fechar Caixa
            </Button>
          )}
        </div>
        
        {registerStatus === 'closed' ? (
          <div className="grid place-items-center h-[calc(100vh-220px)]">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle>Caixa Fechado</CardTitle>
                <CardDescription>
                  O caixa precisa ser aberto para registrar vendas
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center">
                <Button 
                  size="lg" 
                  onClick={() => setIsRegisterDialogOpen(true)}
                  className="w-full"
                >
                  Abrir Caixa
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Painel de Produtos */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <CardTitle>Adicionar Produtos</CardTitle>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      ref={searchInputRef}
                      placeholder="Buscar produtos..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredProducts.length > 0 && (
                    filteredProducts.map((product: Product) => (
                      <Card key={product.id} className="cursor-pointer hover:bg-gray-50" onClick={() => addToCart(product)}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium truncate">{product.name}</h3>
                            <Plus className="h-4 w-4 text-gray-500" />
                          </div>
                          <div className="flex justify-between items-center">
                            <Badge variant="outline" className="bg-gray-50">
                              Estoque: {product.stockQuantity}
                            </Badge>
                            <span className="font-semibold text-green-600">
                              {formatCurrency(product.price)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                  
                  {searchTerm.trim() !== '' && filteredProducts.length === 0 && !isLoadingProducts && (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">Nenhum produto encontrado com "{searchTerm}"</p>
                    </div>
                  )}
                  
                  {searchTerm.trim() === '' && (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">Digite o nome do produto para buscar</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Carrinho */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" /> Carrinho
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                {cart.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <p className="text-gray-500">Carrinho vazio</p>
                    <p className="text-sm text-gray-400 mt-1">Busque e adicione produtos para iniciar uma venda</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="px-4 max-h-[40vh] overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.product.id} className="py-2 flex flex-col">
                          <div className="flex items-center justify-between">
                            <div className="w-full">
                              <p className="font-medium truncate">{item.product.name}</p>
                              <div className="flex justify-between items-center mt-1">
                                <div className="flex items-center gap-1">
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-5 w-5"
                                    onClick={() => decreaseQuantity(item.product.id)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-8 text-center">{item.quantity}</span>
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-5 w-5"
                                    onClick={() => increaseQuantity(item.product.id)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="text-sm font-medium">
                                  {formatCurrency(item.product.price * item.quantity)}
                                </div>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 ml-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removeFromCart(item.product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <Separator className="mt-2" />
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t mt-2 pt-4 px-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-500">Subtotal</span>
                        <span>{formatCurrency(calculateTotal())}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span className="text-green-600">{formatCurrency(calculateTotal())}</span>
                      </div>
                      
                      <Button 
                        className="w-full mt-4" 
                        size="lg"
                        disabled={cart.length === 0}
                        onClick={() => setIsPaymentDialogOpen(true)}
                      >
                        Finalizar Venda
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full mt-2"
                        disabled={cart.length === 0}
                        onClick={() => setCart([])}
                      >
                        Limpar Carrinho
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* Diálogo de Pagamento */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Finalizar Venda</DialogTitle>
            <DialogDescription>
              Selecione a forma de pagamento e informe os dados necessários.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="customer">Nome do Cliente (opcional)</Label>
              <Input
                id="customer"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="Digite o nome do cliente"
              />
            </div>
            
            <div>
              <Label>Forma de Pagamento</Label>
              <Tabs 
                value={paymentMethod} 
                onValueChange={(value) => setPaymentMethod(value as 'cash' | 'credit' | 'debit' | 'pix')}
                className="mt-2"
              >
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="cash" className="flex flex-col items-center gap-1 py-2">
                    <BanknoteIcon className="h-4 w-4" />
                    <span className="text-xs">Dinheiro</span>
                  </TabsTrigger>
                  <TabsTrigger value="credit" className="flex flex-col items-center gap-1 py-2">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-xs">Crédito</span>
                  </TabsTrigger>
                  <TabsTrigger value="debit" className="flex flex-col items-center gap-1 py-2">
                    <Wallet className="h-4 w-4" />
                    <span className="text-xs">Débito</span>
                  </TabsTrigger>
                  <TabsTrigger value="pix" className="flex flex-col items-center gap-1 py-2">
                    <QrCode className="h-4 w-4" />
                    <span className="text-xs">PIX</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="cash" className="mt-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="amount">Valor Recebido</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                        <Input
                          id="amount"
                          placeholder="0,00"
                          className="pl-9"
                          value={amountPaid}
                          onChange={(e) => setAmountPaid(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="p-3 rounded-md bg-gray-50">
                      <div className="flex justify-between">
                        <span>Total da Compra:</span>
                        <span className="font-medium">{formatCurrency(calculateTotal())}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Valor Recebido:</span>
                        <span className="font-medium">
                          {amountPaid ? formatCurrency(parseFloat(amountPaid.replace(',', '.'))) : 'R$ 0,00'}
                        </span>
                      </div>
                      
                      {amountPaid && !isNaN(parseFloat(amountPaid.replace(',', '.'))) && 
                        parseFloat(amountPaid.replace(',', '.')) >= calculateTotal() && (
                        <div className="flex justify-between mt-1 border-t pt-1">
                          <span>Troco:</span>
                          <span className="font-semibold">
                            {formatCurrency(parseFloat(amountPaid.replace(',', '.')) - calculateTotal())}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="credit" className="mt-4">
                  <div className="p-3 rounded-md bg-gray-50">
                    <div className="flex justify-between">
                      <span>Total a pagar:</span>
                      <span className="font-semibold">{formatCurrency(calculateTotal())}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Instrua o cliente a inserir ou aproximar o cartão de crédito na máquina de cartão.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="debit" className="mt-4">
                  <div className="p-3 rounded-md bg-gray-50">
                    <div className="flex justify-between">
                      <span>Total a pagar:</span>
                      <span className="font-semibold">{formatCurrency(calculateTotal())}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Instrua o cliente a inserir ou aproximar o cartão de débito na máquina de cartão.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="pix" className="mt-4">
                  <div className="p-3 rounded-md bg-gray-50">
                    <div className="flex justify-between">
                      <span>Total a pagar:</span>
                      <span className="font-semibold">{formatCurrency(calculateTotal())}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Escaneie o QR code PIX e aguarde a confirmação do pagamento.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={finalizeSale}>
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de Recibo/Comprovante */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" /> Comprovante
            </DialogTitle>
            <DialogDescription>
              Confirme os detalhes da venda para finalizar.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-center mb-4">
                <h3 className="font-bold text-lg">Farmácia {organizationName}</h3>
                <p className="text-sm text-gray-500">Comprovante de Venda</p>
                <p className="text-xs text-gray-500">
                  {new Date().toLocaleDateString('pt-BR')} - {new Date().toLocaleTimeString('pt-BR')}
                </p>
              </div>
              
              <div className="border-t border-b py-2 my-3">
                <p className="text-sm">Cliente: {customer || 'Cliente não identificado'}</p>
                <p className="text-sm">Atendente: {user?.name || 'Farmacêutico'}</p>
              </div>
              
              <div className="my-3">
                <h4 className="font-medium mb-2">Itens</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item) => (
                      <TableRow key={item.product.id}>
                        <TableCell className="py-1">
                          <div className="text-sm truncate max-w-[160px]">
                            {item.product.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-1">{item.quantity}</TableCell>
                        <TableCell className="text-right py-1">{formatCurrency(item.product.price)}</TableCell>
                        <TableCell className="text-right py-1 font-medium">{formatCurrency(item.product.price * item.quantity)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-4 border-t pt-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
                <div className="flex justify-between font-bold mt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Forma de pagamento:</span>
                    <span>
                      {paymentInfo?.method === 'cash' && 'Dinheiro'}
                      {paymentInfo?.method === 'credit' && 'Cartão de Crédito'}
                      {paymentInfo?.method === 'debit' && 'Cartão de Débito'}
                      {paymentInfo?.method === 'pix' && 'PIX'}
                    </span>
                  </div>
                  
                  {paymentInfo?.method === 'cash' && (
                    <>
                      <div className="flex justify-between text-sm mt-1">
                        <span>Valor recebido:</span>
                        <span>{formatCurrency(paymentInfo.amountPaid)}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span>Troco:</span>
                        <span>{formatCurrency(paymentInfo.change)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReceiptDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={processSale}
              disabled={createSaleMutation.isPending}
            >
              {createSaleMutation.isPending ? "Processando..." : "Finalizar Venda"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para Abrir Caixa */}
      <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Abrir Caixa</DialogTitle>
            <DialogDescription>
              Informe o valor inicial do caixa para começar a registrar vendas.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="initial-amount">Valor Inicial do Caixa (R$)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                  <Input
                    id="initial-amount"
                    placeholder="0,00"
                    className="pl-9"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="p-3 rounded-md bg-blue-50 text-blue-800">
                <p className="text-sm">
                  <strong>Importante:</strong> O valor inicial deve representar o dinheiro 
                  físico disponível na gaveta do caixa no início do expediente.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRegisterDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={openRegister}>
              Abrir Caixa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PharmacistLayout>
  );
}