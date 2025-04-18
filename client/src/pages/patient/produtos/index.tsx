'use client';

import React, { useState, useEffect } from 'react';
import PatientLayout from '@/components/layout/PatientLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Search, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';

// Definições de tipos
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  requiresPrescription: boolean;
}

// Componente principal
export default function ProdutosPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [cart, setCart] = useState<{productId: number, quantity: number}[]>([]);
  
  // Consulta de produtos
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['/api/products'],
    refetchOnWindowFocus: false,
  });
  
  // Adicionar produto ao carrinho
  const addToCart = (productId: number) => {
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
      // Se o produto já estiver no carrinho, apenas atualize a quantidade
      setCart(cart.map(item => 
        item.productId === productId 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      // Caso contrário, adicione um novo item
      setCart([...cart, { productId, quantity: 1 }]);
    }
    
    toast({
      title: 'Produto adicionado ao carrinho',
      description: 'O produto foi adicionado ao seu carrinho de compras.',
    });
  };
  
  // Produtos filtrados e ordenados
  const filteredProducts = React.useMemo(() => {
    let result = [...(Array.isArray(products) ? products : [])];
    
    // Filtrar por termo de pesquisa
    if (searchTerm) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por categoria
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Ordenar
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
    }
    
    return result;
  }, [products, searchTerm, selectedCategory, sortBy]);
  
  // Categorias disponíveis
  const categories = React.useMemo(() => {
    const allCategories = Array.isArray(products) 
      ? products.map(product => product.category)
      : [];
    // Extrair categorias únicas manualmente para evitar problemas de compatibilidade
    const uniqueCategories: string[] = [];
    allCategories.forEach(category => {
      if (!uniqueCategories.includes(category)) {
        uniqueCategories.push(category);
      }
    });
    return ['all', ...uniqueCategories];
  }, [products]);
  
  const goToCheckout = () => {
    // Salvar carrinho no localStorage para uso na página de checkout
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Navegar para a página de checkout
    window.location.href = '/patient/checkout';
  };
  
  // Dados mockados para teste (simulando a resposta da API enquanto estamos desenvolvendo)
  const mockProducts: Product[] = [
    {
      id: 1,
      name: "Óleo CBD Serenity 500mg",
      description: "Óleo Canabidiol Full Spectrum para equilíbrio e bem-estar",
      price: 180.0,
      imageUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjNjZCQjZBIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzY2QkI2QSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjZmZmIj5DQkQgT2lsPC90ZXh0Pjwvc3ZnPg==",
      category: "Óleos",
      stock: 25,
      requiresPrescription: true
    },
    {
      id: 2,
      name: "Creme Tópico Relief 150mg",
      description: "Creme terapêutico com canabinoides para dores musculares",
      price: 120.0,
      imageUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjNDJBNUY1Ij48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzQyQTVGNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjIiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjZmZmIj5SZWxpZWYgQ3JlYW08L3RleHQ+PC9zdmc+",
      category: "Tópicos",
      stock: 18,
      requiresPrescription: false
    },
    {
      id: 3,
      name: "Cápsulas Sleep Plus 300mg",
      description: "Suplemento para qualidade do sono com CBD e melatonina",
      price: 150.0,
      imageUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjQUI0N0JDIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0FCNDdCQyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjIiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjZmZmIj5TbGVlcCBDYXBzdWxlczwvdGV4dD48L3N2Zz4=",
      category: "Cápsulas",
      stock: 12,
      requiresPrescription: true
    },
    {
      id: 4,
      name: "Spray Sublingual Focus 250mg",
      description: "Spray CBD para concentração e clareza mental",
      price: 135.0,
      imageUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkY3MDQzIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0ZGNzA0MyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjZmZmIj5Gb2N1cyBTcHJheTwvdGV4dD48L3N2Zz4=",
      category: "Sprays",
      stock: 9,
      requiresPrescription: true
    },
    {
      id: 5,
      name: "Gummies Relax 100mg",
      description: "Gomas de CBD para redução de ansiedade e stress",
      price: 90.0,
      imageUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRUM0MDdBIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0VDNDA3QSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjZmZmIj5SZWxheCBHdW1taWVzPC90ZXh0Pjwvc3ZnPg==",
      category: "Comestíveis",
      stock: 30,
      requiresPrescription: false
    },
    {
      id: 6,
      name: "Óleo Pet Care 250mg",
      description: "Óleo CBD especial para saúde e bem-estar de animais de estimação",
      price: 110.0,
      imageUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMjZBNjlBIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzI2QTY5QSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjZmZmIj5QZXQgQ0JEIE9pbDwvdGV4dD48L3N2Zz4=",
      category: "Pet",
      stock: 15,
      requiresPrescription: false
    }
  ];
  
  // Usar produtos mockados enquanto a API não está disponível
  const displayProducts = filteredProducts.length > 0 ? filteredProducts : mockProducts;
  
  return (
    <PatientLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Produtos</h1>
            <p className="text-gray-500 mt-1">Encontre produtos de qualidade para seu tratamento</p>
          </div>
          <Button onClick={goToCheckout} className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <span>Carrinho ({cart.reduce((acc, item) => acc + item.quantity, 0)})</span>
          </Button>
        </div>
        
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar produtos..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {categories.filter(cat => cat !== 'all').map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nome (A-Z)</SelectItem>
              <SelectItem value="price-asc">Preço (menor para maior)</SelectItem>
              <SelectItem value="price-desc">Preço (maior para menor)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Tabs defaultValue="grid" className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="grid">Visualização em Grid</TabsTrigger>
            <TabsTrigger value="list">Visualização em Lista</TabsTrigger>
          </TabsList>
          
          <TabsContent value="grid">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-square relative bg-gray-100">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="object-cover w-full h-full"
                    />
                    {product.requiresPrescription && (
                      <Badge className="absolute top-2 right-2 bg-blue-600">Necessita Prescrição</Badge>
                    )}
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">R$ {product.price.toFixed(2)}</span>
                      <Badge variant="outline">{product.category}</Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      className="w-full" 
                      onClick={() => addToCart(product.id)}
                      disabled={product.stock === 0}
                    >
                      {product.stock > 0 ? 'Adicionar ao Carrinho' : 'Esgotado'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="list">
            <div className="space-y-4">
              {displayProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/4 aspect-video md:aspect-square bg-gray-100">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex flex-col h-full justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-xl mb-2">{product.name}</CardTitle>
                            {product.requiresPrescription && (
                              <Badge className="bg-blue-600">Necessita Prescrição</Badge>
                            )}
                          </div>
                          <CardDescription className="mb-4">{product.description}</CardDescription>
                          <div className="flex items-center gap-2 mb-4">
                            <Badge variant="outline">{product.category}</Badge>
                            <span className="text-sm text-gray-500">
                              {product.stock > 0 ? `${product.stock} em estoque` : 'Esgotado'}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold">R$ {product.price.toFixed(2)}</span>
                          <Button 
                            onClick={() => addToCart(product.id)}
                            disabled={product.stock === 0}
                          >
                            {product.stock > 0 ? 'Adicionar ao Carrinho' : 'Esgotado'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PatientLayout>
  );
}