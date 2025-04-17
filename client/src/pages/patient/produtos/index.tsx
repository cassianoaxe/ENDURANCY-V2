'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import PatientLayout from '@/components/layout/PatientLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  ShoppingBag,
  Filter,
  Star,
  Tag,
  ThumbsUp,
  Leaf,
  Droplet,
  Pill,
  Plus,
  MessageSquare,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Tipos para os produtos
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  image: string;
  rating: number;
  ratingCount: number;
  categories: string[];
  tags: string[];
  stock: 'disponível' | 'baixo estoque' | 'indisponível';
  thc: number;
  cbd: number;
  type: 'óleo' | 'flor' | 'extrato' | 'comestível' | 'acessório';
  brand: string;
  dosage: string;
}

// Tipo para o carrinho
interface CartItem {
  product: Product;
  quantity: number;
}

const ProdutosPage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [sortOption, setSortOption] = useState('relevância');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  
  // Mock function para navegar para o produto
  const navigateToProduto = (id: string) => {
    window.location.href = `/patient/produtos/${id}`;
  };
  
  // Mock function para navegar para o checkout
  const navigateToCheckout = () => {
    window.location.href = '/patient/checkout';
  };
  
  // Simular produtos da API
  useEffect(() => {
    // Produtos simulados
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Óleo de CBD 5%',
        description: 'Óleo de CBD premium com 5% de concentração. Extraído com CO2 supercrítico, garantindo pureza e eficácia máximas.',
        price: 250.00,
        image: '/products/cbd-oil-5.jpg',
        rating: 4.7,
        ratingCount: 128,
        categories: ['óleo', 'cbd'],
        tags: ['sem-thc', 'espectro-amplo'],
        stock: 'disponível',
        thc: 0,
        cbd: 5,
        type: 'óleo',
        brand: 'MediCann',
        dosage: '1-2 gotas, 2-3x ao dia'
      },
      {
        id: '2',
        name: 'Óleo Full Spectrum 10:1 (CBD:THC)',
        description: 'Óleo de espectro completo com proporção de 10:1 de CBD para THC. Proporciona o efeito entourage para maior eficácia terapêutica.',
        price: 320.00,
        image: '/products/full-spectrum-10-1.jpg',
        rating: 4.9,
        ratingCount: 93,
        categories: ['óleo', 'espectro-completo'],
        tags: ['efeito-entourage', 'alta-potência'],
        stock: 'disponível',
        thc: 0.3,
        cbd: 3,
        type: 'óleo',
        brand: 'CannaPure',
        dosage: '0.5-1ml, 1-2x ao dia'
      },
      {
        id: '3',
        name: 'Extrato de Cannabis 20:1 (CBD:THC)',
        description: 'Extrato concentrado com proporção de 20:1. Ideal para dores crônicas e condições inflamatórias graves.',
        price: 380.00,
        discountPrice: 342.00,
        image: '/products/extract-20-1.jpg',
        rating: 4.8,
        ratingCount: 64,
        categories: ['extrato', 'alta-potência'],
        tags: ['concentrado', 'anti-inflamatório'],
        stock: 'baixo estoque',
        thc: 1,
        cbd: 20,
        type: 'extrato',
        brand: 'MediCann',
        dosage: '0.1-0.3ml, 1-2x ao dia'
      },
      {
        id: '4',
        name: 'Vaporizador de Ervas Secas',
        description: 'Vaporizador de alta qualidade para ervas secas. Temperatura controlada para extração otimizada de canabinoides.',
        price: 550.00,
        image: '/products/vaporizer.jpg',
        rating: 4.5,
        ratingCount: 38,
        categories: ['acessório', 'vaporização'],
        tags: ['reutilizável', 'portátil'],
        stock: 'disponível',
        thc: 0,
        cbd: 0,
        type: 'acessório',
        brand: 'VapeTech',
        dosage: 'N/A'
      },
      {
        id: '5',
        name: 'Cápsulas de CBD 10mg',
        description: 'Cápsulas com dose precisa de 10mg de CBD isolado. Fácil de administrar e com efeitos consistentes.',
        price: 180.00,
        image: '/products/cbd-capsules.jpg',
        rating: 4.2,
        ratingCount: 45,
        categories: ['cápsula', 'cbd'],
        tags: ['dose-precisa', 'fácil-uso'],
        stock: 'disponível',
        thc: 0,
        cbd: 10,
        type: 'óleo',
        brand: 'CannaPure',
        dosage: '1-2 cápsulas, 1-2x ao dia'
      },
      {
        id: '6',
        name: 'Pomada Tópica CBD + Arnica',
        description: 'Pomada tópica com CBD e extrato de Arnica para dores musculares e inflamações localizadas.',
        price: 120.00,
        image: '/products/topical-cream.jpg',
        rating: 4.6,
        ratingCount: 72,
        categories: ['tópico', 'cbd'],
        tags: ['uso-local', 'anti-inflamatório'],
        stock: 'disponível',
        thc: 0,
        cbd: 2,
        type: 'extrato',
        brand: 'NatureCure',
        dosage: 'Aplicar na área afetada 2-3x ao dia'
      }
    ];
    
    // Aplicar filtros
    let filteredProducts = [...mockProducts];
    
    // Filtrar por categoria
    if (activeTab !== 'todos') {
      filteredProducts = filteredProducts.filter(
        product => product.type === activeTab || product.categories.includes(activeTab)
      );
    }
    
    // Filtrar por termo de busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredProducts = filteredProducts.filter(
        product => 
          product.name.toLowerCase().includes(query) || 
          product.description.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query) ||
          product.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Filtrar por marca
    if (filterBrand && filterBrand !== 'all') {
      filteredProducts = filteredProducts.filter(
        product => product.brand === filterBrand
      );
    }
    
    // Ordenar produtos
    switch (sortOption) {
      case 'preço-crescente':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'preço-decrescente':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'avaliação':
        filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
      case 'relevância':
      default:
        // Já está ordenado por relevância no mock
        break;
    }
    
    setProducts(filteredProducts);
  }, [activeTab, searchQuery, filterCategory, filterBrand, sortOption]);

  // Adicionar produto ao carrinho
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      // Verificar se o produto já está no carrinho
      const existingItem = prevCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Atualizar quantidade
        return prevCart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // Adicionar novo item
        return [...prevCart, { product, quantity: 1 }];
      }
    });
    
    toast({
      title: "Produto adicionado ao carrinho",
      description: `${product.name} foi adicionado ao seu carrinho.`
    });
  };
  
  // Remover item do carrinho
  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    
    toast({
      title: "Produto removido",
      description: "O item foi removido do seu carrinho."
    });
  };
  
  // Alterar quantidade no carrinho
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity } 
          : item
      )
    );
  };
  
  // Calcular total do carrinho
  const cartTotal = cart.reduce(
    (total, item) => total + (item.product.discountPrice || item.product.price) * item.quantity, 
    0
  );
  
  // Exibir preço formatado
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };
  
  // Marcas únicas para filtro
  const brandOptions = Array.from(new Set(
    products.map(product => product.brand)
  ));
  
  return (
    <PatientLayout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Produtos</h1>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              className="relative"
              onClick={() => setShowCart(!showCart)}
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Carrinho
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </Badge>
              )}
            </Button>
            
            <Button 
              variant="default"
              onClick={() => navigateToCheckout()}
              disabled={cart.length === 0}
            >
              Finalizar Pedido
            </Button>
          </div>
        </div>
        
        {/* Carrinho deslizante */}
        {showCart && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Seu Carrinho</span>
                <Button variant="ghost" size="sm" onClick={() => setShowCart(false)}>Fechar</Button>
              </CardTitle>
              <CardDescription>
                {cart.length === 0 ? 'Seu carrinho está vazio' : `${cart.length} item(s) no carrinho`}
              </CardDescription>
            </CardHeader>
            
            {cart.length > 0 ? (
              <>
                <CardContent className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between border-b pb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md"></div>
                        <div>
                          <h4 className="font-medium">{item.product.name}</h4>
                          <p className="text-sm text-gray-500">{formatPrice(item.product.discountPrice || item.product.price)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 rounded-r-none"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <div className="h-8 w-10 flex items-center justify-center border-y">
                            {item.quantity}
                          </div>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 rounded-l-none"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 h-8 w-8"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          &times;
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div>
                    <p className="text-lg font-medium">Total: {formatPrice(cartTotal)}</p>
                    <p className="text-sm text-gray-500">Entrega e impostos calculados no checkout</p>
                  </div>
                  <Button onClick={() => navigateToCheckout()}>
                    Finalizar Pedido
                  </Button>
                </CardFooter>
              </>
            ) : (
              <CardContent className="text-center py-8">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-lg font-medium mb-2">Seu carrinho está vazio</p>
                <p className="text-gray-500 max-w-md mx-auto mb-4">
                  Explore nossos produtos e adicione itens ao seu carrinho para prosseguir com a compra.
                </p>
                <Button variant="outline" onClick={() => setShowCart(false)}>
                  Continuar Comprando
                </Button>
              </CardContent>
            )}
          </Card>
        )}
        
        {/* Barra de pesquisa e filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="md:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Pesquisar produtos..." 
                className="pl-10" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Select value={filterBrand} onValueChange={setFilterBrand}>
              <SelectTrigger>
                <SelectValue placeholder="Marca" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as marcas</SelectItem>
                {brandOptions.map((brand) => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevância">Relevância</SelectItem>
                <SelectItem value="preço-crescente">Menor Preço</SelectItem>
                <SelectItem value="preço-decrescente">Maior Preço</SelectItem>
                <SelectItem value="avaliação">Avaliação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Categorias em tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mb-8"
        >
          <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-md border">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="óleo">Óleos</TabsTrigger>
            <TabsTrigger value="extrato">Extratos</TabsTrigger>
            <TabsTrigger value="flor">Flores</TabsTrigger>
            <TabsTrigger value="comestível">Comestíveis</TabsTrigger>
            <TabsTrigger value="acessório">Acessórios</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Lista de produtos */}
        <div>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div 
                    className="h-48 bg-gray-200 cursor-pointer" 
                    onClick={() => navigateToProduto(product.id)}
                  >
                    {/* Aqui entraria a imagem real */}
                  </div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle 
                          className="text-lg cursor-pointer hover:text-primary"
                          onClick={() => navigateToProduto(product.id)}
                        >
                          {product.name}
                        </CardTitle>
                        <CardDescription>{product.brand}</CardDescription>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                        <span>{product.rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {product.type === 'óleo' || product.type === 'extrato' ? (
                        <>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                            <Droplet className="h-3 w-3 mr-1" />
                            CBD: {product.cbd}%
                          </Badge>
                          
                          {product.thc > 0 && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                              <Leaf className="h-3 w-3 mr-1" />
                              THC: {product.thc}%
                            </Badge>
                          )}
                        </>
                      ) : (
                        <Badge variant="outline">
                          {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                        </Badge>
                      )}
                      
                      <Badge variant="outline" className={
                        product.stock === 'disponível' ? 'bg-green-50 text-green-700 hover:bg-green-50' :
                        product.stock === 'baixo estoque' ? 'bg-amber-50 text-amber-700 hover:bg-amber-50' :
                        'bg-red-50 text-red-700 hover:bg-red-50'
                      }>
                        {product.stock.charAt(0).toUpperCase() + product.stock.slice(1)}
                      </Badge>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between items-center pt-2">
                    <div>
                      {product.discountPrice ? (
                        <div>
                          <span className="text-gray-400 line-through text-sm">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-xl font-medium ml-2">
                            {formatPrice(product.discountPrice)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xl font-medium">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                    
                    <Button 
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 'indisponível'}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Não conseguimos encontrar produtos que correspondam aos seus critérios de pesquisa.
                Tente mudar os filtros ou redefinir sua pesquisa.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setFilterBrand('');
                  setFilterCategory('');
                  setActiveTab('todos');
                  setSortOption('relevância');
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>
        
        {/* Informações adicionais */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Prescrição Necessária
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Alguns produtos podem exigir prescrição médica válida. 
                Certifique-se de que sua prescrição esteja atualizada antes de fazer um pedido.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/patient/prescricoes'}>
                Gerenciar Prescrições
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ThumbsUp className="h-5 w-5 mr-2" />
                Garantia de Qualidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Todos os nossos produtos são testados em laboratório e seguem 
                rigorosos padrões de qualidade. Relatórios de análise disponíveis sob solicitação.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Ver Certificações
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Precisa de Ajuda?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Nossa equipe está disponível para responder suas dúvidas sobre 
                produtos, dosagem, efeitos e compatibilidade com seu tratamento.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/patient/suporte'}>
                Falar com Especialista
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </PatientLayout>
  );
};

export default ProdutosPage;