import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PharmacistLayout from '@/components/layout/pharmacist/PharmacistLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote,
  ShoppingBag,
  CircleDollarSign,
  Receipt
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
  const [organizationName, setOrganizationName] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit' | 'debit' | 'pix'>('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [change, setChange] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerDocument, setCustomerDocument] = useState('');
  const [registerOpen, setRegisterOpen] = useState(false);
  const [initialCash, setInitialCash] = useState('');
  
  // Buscar dados da organização
  const { data: organizationData } = useQuery({
    queryKey: ['organization', user?.organizationId],
    queryFn: async () => {
      if (!user?.organizationId) return null;
      const response = await axios.get(`/api/organizations/${user.organizationId}`);
      return response.data;
    },
    enabled: !!user?.organizationId
  });

  // Buscar produtos da organização
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', user?.organizationId],
    queryFn: async () => {
      if (!user?.organizationId) return [];
      const response = await axios.get(`/api/organizations/${user.organizationId}/products`);
      return response.data;
    },
    enabled: !!user?.organizationId
  });

  useEffect(() => {
    if (organizationData) {
      setOrganizationName(organizationData.name || "");
    }
  }, [organizationData]);

  useEffect(() => {
    if (productsData && searchTerm) {
      const filtered = productsData.filter((product: Product) => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(productsData || []);
    }
  }, [searchTerm, productsData]);

  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    setTotalAmount(newTotal);
  }, [cart]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const addToCart = (product: Product) => {
    // Verificar se já existe no carrinho
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      // Se já existe, aumentar a quantidade
      const updatedCart = cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCart(updatedCart);
    } else {
      // Se não existe, adicionar novo item
      setCart([...cart, { product, quantity: 1 }]);
    }
    
    toast({
      title: "Produto adicionado",
      description: `${product.name} adicionado ao carrinho`,
      duration: 2000,
    });
  };

  const updateQuantity = (productId: number, action: 'increase' | 'decrease') => {
    const updatedCart = cart.map(item => {
      if (item.product.id === productId) {
        let newQuantity = item.quantity;
        
        if (action === 'increase') {
          newQuantity += 1;
        } else if (action === 'decrease' && newQuantity > 1) {
          newQuantity -= 1;
        }
        
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    setCart(updatedCart);
  };

  const removeFromCart = (productId: number) => {
    const updatedCart = cart.filter(item => item.product.id !== productId);
    setCart(updatedCart);
    
    toast({
      title: "Produto removido",
      description: "Item removido do carrinho",
      duration: 2000,
    });
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setCustomerDocument('');
    
    toast({
      title: "Carrinho limpo",
      description: "Todos os itens foram removidos",
      duration: 2000,
    });
  };

  const openPaymentDialog = () => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos antes de finalizar a venda",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    setPaymentDialogOpen(true);
    setAmountPaid(totalAmount.toFixed(2));
    calculateChange(totalAmount, parseFloat(totalAmount.toFixed(2)));
  };

  const calculateChange = (total: number, paid: number) => {
    const changeAmount = paid - total;
    setChange(changeAmount >= 0 ? changeAmount : 0);
  };

  const handleAmountPaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmountPaid(value);
    
    const paidAmount = parseFloat(value) || 0;
    calculateChange(totalAmount, paidAmount);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleCompletePayment = async () => {
    // Aqui implementaríamos a lógica para registrar a venda
    try {
      // Exemplo de payload para o backend
      const saleData = {
        organizationId: user?.organizationId,
        items: cart.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.price,
          subtotal: item.product.price * item.quantity
        })),
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        amountPaid: parseFloat(amountPaid),
        change: change,
        customerName: customerName || 'Cliente não identificado',
        customerDocument: customerDocument || '',
        cashierId: user?.id,
        cashierName: user?.name
      };
      
      // Chamada API (comentada até implementarmos a rota)
      // const response = await axios.post('/api/pharmacist/sales', saleData);
      
      // Simulando sucesso (remover quando API estiver pronta)
      toast({
        title: "Venda concluída com sucesso!",
        description: `Total: ${formatCurrency(totalAmount)} • Troco: ${formatCurrency(change)}`,
        duration: 3000,
      });
      
      // Fechar diálogo e limpar carrinho
      setPaymentDialogOpen(false);
      clearCart();
      
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast({
        title: "Erro ao processar pagamento",
        description: "Tente novamente ou contate o suporte",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleOpenRegister = () => {
    setRegisterOpen(true);
  };

  const handleStartShift = () => {
    // Aqui implementaríamos a abertura do caixa
    const initialAmount = parseFloat(initialCash) || 0;
    
    toast({
      title: "Caixa aberto com sucesso!",
      description: `Valor inicial: ${formatCurrency(initialAmount)}`,
      duration: 3000,
    });
    
    setRegisterOpen(false);
  };

  return (
    <PharmacistLayout>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Caixa</h1>
              <p className="text-gray-500">
                Sistema de ponto de venda • Farmácia {organizationName}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleOpenRegister} variant="outline" className="flex items-center gap-2">
                <CircleDollarSign className="h-4 w-4" />
                Abrir Caixa
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Relatório
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Produtos e Busca */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Produtos</CardTitle>
                <div className="relative w-full">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produtos por nome..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
              </CardHeader>
              <CardContent className="h-[calc(100vh-320px)] overflow-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <p>Carregando produtos...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <ShoppingBag className="h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-gray-500">
                      {searchTerm 
                        ? "Nenhum produto encontrado com esse termo de busca." 
                        : "Nenhum produto disponível no estoque."}
                    </p>
                    {searchTerm && (
                      <Button 
                        variant="link" 
                        onClick={() => setSearchTerm('')}
                        className="mt-2"
                      >
                        Limpar busca
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product: Product) => (
                      <div 
                        key={product.id} 
                        className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => addToCart(product)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium truncate" title={product.name}>
                            {product.name}
                          </div>
                          <Badge 
                            variant={product.stockQuantity > 10 ? "outline" : "destructive"}
                            className="text-xs whitespace-nowrap"
                          >
                            Estoque: {product.stockQuantity}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 mb-2 line-clamp-2" title={product.description}>
                          {product.description || "Sem descrição"}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-lg">
                            {formatCurrency(product.price)}
                          </span>
                          <Button 
                            size="sm" 
                            className="h-8 gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                          >
                            <Plus className="h-4 w-4" /> Adicionar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Carrinho */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Carrinho 
                    <Badge variant="outline">{cart.length}</Badge>
                  </CardTitle>
                  {cart.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearCart}
                      className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Limpar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow overflow-auto">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <ShoppingCart className="h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-gray-500">Seu carrinho está vazio</p>
                    <p className="text-sm text-gray-400">
                      Adicione produtos para iniciar uma venda
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Nome do Cliente (opcional)</Label>
                      <Input 
                        id="customerName"
                        placeholder="Nome do cliente"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerDocument">CPF/CNPJ (opcional)</Label>
                      <Input 
                        id="customerDocument"
                        placeholder="CPF ou CNPJ"
                        value={customerDocument}
                        onChange={(e) => setCustomerDocument(e.target.value)}
                      />
                    </div>
                    <Separator />
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead className="text-right">Qtd</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cart.map((item) => (
                          <TableRow key={item.product.id}>
                            <TableCell className="font-medium">
                              <div className="truncate max-w-[150px]" title={item.product.name}>
                                {item.product.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatCurrency(item.product.price)} cada
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => updateQuantity(item.product.id, 'decrease')}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => updateQuantity(item.product.id, 'increase')}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.product.price * item.quantity)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => removeFromCart(item.product.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col border-t pt-4">
                <div className="w-full space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Subtotal:</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                  <Button 
                    className="w-full mt-2" 
                    size="lg" 
                    onClick={openPaymentDialog}
                    disabled={cart.length === 0}
                  >
                    Finalizar Venda
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Diálogo de pagamento */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Finalizar Venda</DialogTitle>
            <DialogDescription>
              Selecione a forma de pagamento e informe o valor recebido.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total a pagar:</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            
            <div className="space-y-2">
              <Label>Forma de Pagamento</Label>
              <RadioGroup 
                value={paymentMethod} 
                onValueChange={(value) => setPaymentMethod(value as 'cash' | 'credit' | 'debit' | 'pix')}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex items-center">
                    <Banknote className="h-4 w-4 mr-2" /> Dinheiro
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="credit" id="credit" />
                  <Label htmlFor="credit" className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" /> Cartão de Crédito
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="debit" id="debit" />
                  <Label htmlFor="debit" className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" /> Cartão de Débito
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pix" id="pix" />
                  <Label htmlFor="pix" className="flex items-center">
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2.25V21.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2.25 12H21.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 7L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 7L7 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    PIX
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {paymentMethod === 'cash' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="amountPaid">Valor Recebido</Label>
                  <Input
                    id="amountPaid"
                    type="number"
                    min={totalAmount}
                    step="0.01"
                    value={amountPaid}
                    onChange={handleAmountPaidChange}
                  />
                </div>
                
                <div className="p-3 bg-green-50 rounded-md">
                  <div className="flex justify-between items-center text-green-800">
                    <span className="font-medium">Troco:</span>
                    <span className="font-bold">{formatCurrency(change)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCompletePayment}>
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de abertura de caixa */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Abertura de Caixa</DialogTitle>
            <DialogDescription>
              Informe o valor inicial do caixa para iniciar o turno.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="initialCash">Valor Inicial (R$)</Label>
              <Input
                id="initialCash"
                type="number"
                min="0"
                step="0.01"
                value={initialCash}
                onChange={(e) => setInitialCash(e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegisterOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleStartShift}>
              Abrir Caixa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PharmacistLayout>
  );
}