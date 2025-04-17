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
import { 
  Search, Filter, ShoppingBag, ShoppingCart, Tag, 
  ChevronRight, Star, Pill, X, ChevronDown
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

// Interface para os produtos
interface Produto {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  preco: number;
  concentracao: string;
  formato: string;
  imagem: string;
  estoque: number;
  destaque: boolean;
  requerPrescricao: boolean;
  avaliacoes: {
    media: number;
    total: number;
  };
}

// Interface para o carrinho
interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
}

const ProdutosPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [ordenacao, setOrdenacao] = useState('relevancia');
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [mostraPrescricaoAviso, setMostraPrescricaoAviso] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  
  // Verificar se o usuário está logado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log("Usuário não autenticado. Redirecionando para o login...");
      window.location.href = '/patient/login';
    }
  }, [authLoading, isAuthenticated]);
  
  // Carregar produtos ao iniciar
  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        // Em um ambiente real, faria a chamada API:
        // const response = await axios.get('/api/patient/produtos');
        // setProdutos(response.data);
        
        // Produtos de exemplo para demonstração
        const produtosExemplo: Produto[] = [
          {
            id: 1,
            nome: "CBD Oil 5%",
            descricao: "Óleo de CBD 5% para tratamento de ansiedade e dores crônicas.",
            categoria: "Óleos",
            preco: 199.90,
            concentracao: "5% (1500mg)",
            formato: "Óleo",
            imagem: "https://via.placeholder.com/300x300.png?text=CBD+Oil+5%",
            estoque: 25,
            destaque: true,
            requerPrescricao: true,
            avaliacoes: { media: 4.8, total: 156 }
          },
          {
            id: 2,
            nome: "CBD Gummies",
            descricao: "Gomas de CBD para um consumo prático e discreto.",
            categoria: "Comestíveis",
            preco: 129.90,
            concentracao: "25mg / goma",
            formato: "Goma",
            imagem: "https://via.placeholder.com/300x300.png?text=CBD+Gummies",
            estoque: 42,
            destaque: true,
            requerPrescricao: true,
            avaliacoes: { media: 4.6, total: 89 }
          },
          {
            id: 3,
            nome: "Bálsamo CBD",
            descricao: "Bálsamo de uso tópico para tratamento localizado de dores musculares.",
            categoria: "Tópicos",
            preco: 89.90,
            concentracao: "300mg",
            formato: "Creme",
            imagem: "https://via.placeholder.com/300x300.png?text=Balsamo+CBD",
            estoque: 18,
            destaque: false,
            requerPrescricao: false,
            avaliacoes: { media: 4.3, total: 67 }
          },
          {
            id: 4,
            nome: "CBD Full Spectrum Oil",
            descricao: "Óleo full spectrum com efeito entourage para maior eficácia.",
            categoria: "Óleos",
            preco: 259.90,
            concentracao: "10% (3000mg)",
            formato: "Óleo",
            imagem: "https://via.placeholder.com/300x300.png?text=CBD+Full+Spectrum",
            estoque: 13,
            destaque: true,
            requerPrescricao: true,
            avaliacoes: { media: 4.9, total: 203 }
          },
          {
            id: 5,
            nome: "Cápsulas de CBD",
            descricao: "Cápsulas práticas e fáceis de consumir com dosagem padronizada.",
            categoria: "Cápsulas",
            preco: 149.90,
            concentracao: "50mg / cápsula",
            formato: "Cápsula",
            imagem: "https://via.placeholder.com/300x300.png?text=Capsulas+CBD",
            estoque: 30,
            destaque: false,
            requerPrescricao: true,
            avaliacoes: { media: 4.5, total: 112 }
          },
          {
            id: 6,
            nome: "Spray Oral CBD",
            descricao: "Spray sublingual para absorção rápida e eficiente.",
            categoria: "Sprays",
            preco: 179.90,
            concentracao: "3% (900mg)",
            formato: "Spray",
            imagem: "https://via.placeholder.com/300x300.png?text=Spray+CBD",
            estoque: 22,
            destaque: false,
            requerPrescricao: true,
            avaliacoes: { media: 4.4, total: 78 }
          }
        ];

        setProdutos(produtosExemplo);
        setProdutosFiltrados(produtosExemplo);
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        toast({
          title: "Erro ao carregar produtos",
          description: "Não foi possível recuperar a lista de produtos. Tente novamente mais tarde.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    fetchProdutos();
  }, [toast]);

  // Recarregar produtos filtrados quando os filtros ou busca mudarem
  useEffect(() => {
    let resultado = [...produtos];
    
    // Filtrar por termo de busca
    if (termoBusca.trim() !== '') {
      const termo = termoBusca.toLowerCase();
      resultado = resultado.filter(produto => 
        produto.nome.toLowerCase().includes(termo) || 
        produto.descricao.toLowerCase().includes(termo) ||
        produto.categoria.toLowerCase().includes(termo)
      );
    }
    
    // Filtrar por categoria
    if (categoriaFiltro !== '') {
      resultado = resultado.filter(produto => produto.categoria === categoriaFiltro);
    }
    
    // Ordenar resultados
    switch (ordenacao) {
      case 'preco-asc':
        resultado.sort((a, b) => a.preco - b.preco);
        break;
      case 'preco-desc':
        resultado.sort((a, b) => b.preco - a.preco);
        break;
      case 'avaliacao':
        resultado.sort((a, b) => b.avaliacoes.media - a.avaliacoes.media);
        break;
      case 'relevancia':
      default:
        // Produtos em destaque primeiro, depois por avaliação
        resultado.sort((a, b) => {
          if (a.destaque && !b.destaque) return -1;
          if (!a.destaque && b.destaque) return 1;
          return b.avaliacoes.media - a.avaliacoes.media;
        });
        break;
    }
    
    setProdutosFiltrados(resultado);
  }, [produtos, termoBusca, categoriaFiltro, ordenacao]);

  // Função para adicionar produto ao carrinho
  const adicionarAoCarrinho = (produto: Produto) => {
    // Verificar se o produto requer prescrição
    if (produto.requerPrescricao) {
      // Verificar se o usuário tem uma prescrição ativa para este produto
      // Aqui seria feita a verificação real com uma chamada API
      const temPrescricaoAtiva = false; // Simulando que não tem prescrição para demonstração
      
      if (!temPrescricaoAtiva) {
        setProdutoSelecionado(produto);
        setMostraPrescricaoAviso(true);
        return;
      }
    }
    
    // Se não requer prescrição ou já tem uma prescrição válida, adiciona ao carrinho
    setCarrinho(carrinhoAtual => {
      // Verificar se o produto já está no carrinho
      const itemExistente = carrinhoAtual.find(item => item.produto.id === produto.id);
      
      if (itemExistente) {
        // Aumentar a quantidade se já estiver no carrinho
        return carrinhoAtual.map(item => 
          item.produto.id === produto.id 
            ? { ...item, quantidade: item.quantidade + 1 } 
            : item
        );
      } else {
        // Adicionar novo item ao carrinho
        return [...carrinhoAtual, { produto, quantidade: 1 }];
      }
    });
    
    toast({
      title: "Produto adicionado",
      description: `${produto.nome} foi adicionado ao carrinho.`,
    });
  };
  
  // Função para remover produto do carrinho
  const removerDoCarrinho = (produtoId: number) => {
    setCarrinho(carrinhoAtual => carrinhoAtual.filter(item => item.produto.id !== produtoId));
    
    toast({
      title: "Produto removido",
      description: "O produto foi removido do carrinho.",
    });
  };
  
  // Função para alterar quantidade do produto no carrinho
  const alterarQuantidade = (produtoId: number, delta: number) => {
    setCarrinho(carrinhoAtual => {
      return carrinhoAtual.map(item => {
        if (item.produto.id === produtoId) {
          const novaQuantidade = Math.max(1, item.quantidade + delta); // Mínimo de 1
          return { ...item, quantidade: novaQuantidade };
        }
        return item;
      });
    });
  };
  
  // Calcular o total do carrinho
  const totalCarrinho = carrinho.reduce((total, item) => {
    return total + (item.produto.preco * item.quantidade);
  }, 0);
  
  // Função para finalizar o pedido
  const finalizarPedido = () => {
    // Verificar se há itens no carrinho
    if (carrinho.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar o pedido.",
        variant: "destructive"
      });
      return;
    }
    
    // Verificar se todos os produtos que requerem prescrição têm prescrições válidas
    const produtosComPrescricao = carrinho.filter(item => item.produto.requerPrescricao);
    
    if (produtosComPrescricao.length > 0) {
      // Aqui seria feita a verificação real com uma chamada API
      const temTodasPrescricoes = false; // Simulando que não tem todas as prescrições para demonstração
      
      if (!temTodasPrescricoes) {
        toast({
          title: "Prescrição necessária",
          description: "Alguns produtos no carrinho necessitam de prescrição médica. Envie suas prescrições antes de finalizar o pedido.",
          variant: "destructive"
        });
        
        // Redirecionar para a página de prescrições
        setLocation('/patient/prescricoes/nova');
        return;
      }
    }
    
    // Processar o pedido (em um app real, seria uma chamada API)
    // ...
    
    // Simular sucesso
    toast({
      title: "Pedido realizado com sucesso",
      description: "Seu pedido foi criado e está sendo processado.",
    });
    
    // Limpar o carrinho
    setCarrinho([]);
    
    // Redirecionar para a página de finalização
    setLocation('/patient/pedidos/confirmacao');
  };
  
  // Extrair categorias únicas para o filtro
  const categorias = Array.from(new Set(produtos.map(produto => produto.categoria)));
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-3 text-lg">Carregando produtos...</span>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho da página */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Produtos</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Explore nossa linha de produtos terapêuticos
          </p>
        </div>
        
        {/* Barra de busca e filtros */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input 
              placeholder="Buscar produtos..." 
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div>
            <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Categoria" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as categorias</SelectItem>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select value={ordenacao} onValueChange={setOrdenacao}>
              <SelectTrigger>
                <div className="flex items-center">
                  <ChevronDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Ordenar por" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevancia">Relevância</SelectItem>
                <SelectItem value="preco-asc">Menor preço</SelectItem>
                <SelectItem value="preco-desc">Maior preço</SelectItem>
                <SelectItem value="avaliacao">Melhor avaliação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Mensagem quando não há produtos */}
        {produtosFiltrados.length === 0 && (
          <div className="text-center py-10 border rounded-lg bg-white dark:bg-gray-800">
            <ShoppingBag className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Nenhum produto encontrado</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Tente ajustar seus filtros ou termo de busca.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => {
                  setTermoBusca('');
                  setCategoriaFiltro('');
                  setOrdenacao('relevancia');
                }}
              >
                Limpar filtros
              </Button>
            </div>
          </div>
        )}
        
        {/* Grid de produtos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {produtosFiltrados.map((produto) => (
            <Card key={produto.id} className="overflow-hidden">
              <img 
                src={produto.imagem} 
                alt={produto.nome}
                className="w-full h-48 object-cover object-center"
              />
              
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{produto.nome}</CardTitle>
                    <CardDescription className="line-clamp-2">{produto.descricao}</CardDescription>
                  </div>
                  <Badge 
                    variant={produto.requerPrescricao ? "destructive" : "outline"}
                    className="ml-2 shrink-0"
                  >
                    {produto.requerPrescricao ? 'Prescrição' : 'Venda livre'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-2 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Pill className="h-4 w-4 mr-1 text-gray-500" />
                    <span className="text-sm text-gray-500">{produto.concentracao}</span>
                  </div>
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-1 text-gray-500" />
                    <span className="text-sm text-gray-500">{produto.categoria}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1 text-sm font-medium">{produto.avaliacoes.media.toFixed(1)}</span>
                    <span className="ml-1 text-sm text-gray-500">({produto.avaliacoes.total})</span>
                  </div>
                  <div>
                    <span className="font-bold text-lg">R$ {produto.preco.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-0">
                <Button 
                  onClick={() => adicionarAoCarrinho(produto)}
                  className="w-full"
                  disabled={produto.estoque === 0}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {produto.estoque > 0 ? 'Adicionar ao carrinho' : 'Indisponível'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {/* Sheet do aviso de prescrição */}
        {produtoSelecionado && (
          <Sheet open={mostraPrescricaoAviso} onOpenChange={setMostraPrescricaoAviso}>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Prescrição Necessária</SheetTitle>
                <SheetDescription>
                  O produto <strong>{produtoSelecionado.nome}</strong> requer prescrição médica.
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <p className="mb-4">
                  Para adquirir este produto, é necessário enviar uma prescrição médica válida pelo seu médico.
                </p>
                <p className="mb-4">
                  Você pode fazer isso na seção de prescrições do seu painel.
                </p>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline">Continuar Comprando</Button>
                </SheetClose>
                <Button 
                  onClick={() => {
                    setMostraPrescricaoAviso(false);
                    setLocation('/patient/prescricoes/nova');
                  }}
                >
                  Enviar Prescrição
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        )}
        
        {/* Fixed Cart */}
        {carrinho.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t p-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2 text-primary" />
                  <span className="font-medium">{carrinho.length} {carrinho.length === 1 ? 'produto' : 'produtos'} no carrinho</span>
                  <span className="mx-2">•</span>
                  <span className="font-bold">Total: R$ {totalCarrinho.toFixed(2)}</span>
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={() => setLocation('/patient/carrinho')}>
                    Ver Carrinho
                  </Button>
                  <Button onClick={finalizarPedido}>
                    Finalizar Pedido <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProdutosPage;