import React, { useState } from 'react';
import { Link } from 'wouter';
import { CMarketHeader } from '@/components/supplier/CMarketHeader';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Beaker, 
  TestTube, 
  Microscope, 
  BookOpen, 
  ShieldAlert, 
  Truck,
  Star,
  ChevronRight
} from 'lucide-react';

// Dados de exemplo para produtos
const featuredProducts = [
  {
    id: 1,
    name: 'Frasco Coletor 1,300ml Aspiramax Omron',
    price: 114,
    installmentPrice: 19,
    image: '/images/lab-beaker.jpg',
    rating: 4.8,
    reviews: 25,
    freeShipping: true,
  },
  {
    id: 2,
    name: 'Kit 5 Unid. Copo De Bécker Forma Baixa Em Vidro De 1000ml',
    price: 90,
    installmentPrice: 15,
    image: '/images/lab-beaker-kit.jpg',
    rating: 5.0,
    reviews: 2,
    freeShipping: true,
  },
  {
    id: 3,
    name: 'Laboratório De Química Show Da Luna 24 Experiências',
    price: 77.97,
    installmentPrice: null,
    image: '/images/lab-kit.jpg',
    rating: 4.7,
    reviews: 60,
    freeShipping: true,
    discount: '40% OFF',
    originalPrice: 129.95,
  },
  {
    id: 4,
    name: 'Becker Plastico 1000ml Graduado Polipropileno',
    price: 49.90,
    installmentPrice: 8.32,
    image: '/images/plastic-beaker.jpg',
    rating: 4.5,
    reviews: 18,
    freeShipping: true,
  }
];

// Dados de exemplo para editais de compra
const purchaseAnnouncements = [
  {
    id: 101,
    title: 'Compra de 2000 frascos de reagentes químicos',
    organization: 'Associação Médica Brasileira',
    deadline: '15/05/2025',
    budget: 'R$ 15.000,00',
    status: 'Aberto para propostas'
  },
  {
    id: 102,
    title: 'Aquisição de equipamentos de laboratório',
    organization: 'Instituto de Pesquisa ABC',
    deadline: '22/05/2025',
    budget: 'R$ 50.000,00',
    status: 'Aberto para propostas'
  },
  {
    id: 103,
    title: 'Compra de material para análise cromatográfica',
    organization: 'Centro de Pesquisas XYZ',
    deadline: '10/05/2025',
    budget: 'R$ 8.500,00',
    status: 'Aberto para propostas'
  }
];

// Componente para exibir um produto
const ProductCard: React.FC<{product: typeof featuredProducts[0]}> = ({ product }) => {
  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="aspect-square bg-gray-100 rounded-md mb-3 overflow-hidden flex items-center justify-center">
          {/* Placeholder para imagem do produto */}
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Beaker className="h-16 w-16" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm line-clamp-2 min-h-[40px]">{product.name}</h3>
          
          <div className="flex items-baseline">
            {product.discount && (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-1 rounded mr-1">
                {product.discount}
              </span>
            )}
            <div className="flex items-baseline">
              <span className="text-xl font-medium">R$ {product.price.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
          
          {product.installmentPrice && (
            <div className="text-xs text-gray-500">
              em 6x R$ {product.installmentPrice.toFixed(2).replace('.', ',')} sem juros
            </div>
          )}
          
          {product.originalPrice && (
            <div className="text-xs text-gray-500 line-through">
              R$ {product.originalPrice.toFixed(2).replace('.', ',')}
            </div>
          )}
          
          {product.freeShipping && (
            <div className="text-xs text-green-600 font-medium">
              Frete grátis
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <div className="flex items-center">
          <div className="flex items-center">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs ml-1">{product.rating}</span>
          </div>
          <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
        </div>
      </CardFooter>
    </Card>
  );
};

// Componente para exibir um edital de compra
const PurchaseAnnouncementCard: React.FC<{announcement: typeof purchaseAnnouncements[0]}> = ({ announcement }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <h3 className="font-medium text-base mb-2">{announcement.title}</h3>
        <div className="space-y-1 text-sm">
          <div><span className="text-gray-500">Organização:</span> {announcement.organization}</div>
          <div><span className="text-gray-500">Prazo:</span> {announcement.deadline}</div>
          <div><span className="text-gray-500">Orçamento:</span> {announcement.budget}</div>
          <div className="mt-2">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
              {announcement.status}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button variant="outline" size="sm" className="w-full">
          Ver detalhes
        </Button>
      </CardFooter>
    </Card>
  );
};

// Página principal do CMarket
const CMarketHomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <CMarketHeader />
      
      <main className="container mx-auto py-6 px-4">
        {/* Banner principal */}
        <section className="mb-8">
          <Carousel className="w-full">
            <CarouselContent>
              <CarouselItem>
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg h-[180px] md:h-[250px] flex items-center justify-center p-6 text-white">
                  <div className="max-w-xl text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">Bem-vindo ao CMarket</h2>
                    <p className="text-white/90 mb-4">Seu marketplace especializado em equipamentos e insumos para laboratórios</p>
                    <Button className="bg-white text-blue-600 hover:bg-white/90">
                      Explorar agora
                    </Button>
                  </div>
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg h-[180px] md:h-[250px] flex items-center justify-center p-6 text-white">
                  <div className="max-w-xl text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">Editais de Compra</h2>
                    <p className="text-white/90 mb-4">Participe de processos de compra de organizações e associações</p>
                    <Button className="bg-white text-green-600 hover:bg-white/90">
                      Ver editais abertos
                    </Button>
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </section>
        
        {/* Categorias em destaque */}
        <section className="mb-8">
          <h2 className="text-xl font-medium mb-4">Categorias em destaque</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: <Beaker className="h-8 w-8" />, name: 'Vidrarias', path: '/supplier/cmarket/vidrarias' },
              { icon: <TestTube className="h-8 w-8" />, name: 'Reagentes', path: '/supplier/cmarket/reagentes' },
              { icon: <Microscope className="h-8 w-8" />, name: 'Equipamentos', path: '/supplier/cmarket/equipamentos' },
              { icon: <BookOpen className="h-8 w-8" />, name: 'Livros Técnicos', path: '/supplier/cmarket/livros' },
              { icon: <ShieldAlert className="h-8 w-8" />, name: 'EPIs', path: '/supplier/cmarket/epis' },
              { icon: <Truck className="h-8 w-8" />, name: 'Ver mais', path: '/supplier/cmarket/categories' },
            ].map((category, index) => (
              <Link key={index} href={category.path}>
                <a className="bg-white hover:bg-gray-50 border rounded-lg p-4 flex flex-col items-center justify-center text-center transition-colors">
                  <div className="text-blue-600 mb-2">{category.icon}</div>
                  <span className="text-sm font-medium">{category.name}</span>
                </a>
              </Link>
            ))}
          </div>
        </section>
        
        {/* Tabs para produtos e editais */}
        <section className="mb-8">
          <Tabs defaultValue="produtos" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="produtos">Produtos em Destaque</TabsTrigger>
              <TabsTrigger value="editais">Editais de Compra</TabsTrigger>
            </TabsList>
            
            <TabsContent value="produtos">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {featuredProducts.map(product => (
                  <Link key={product.id} href={`/supplier/cmarket/product/${product.id}`}>
                    <a>
                      <ProductCard product={product} />
                    </a>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-6">
                <Button variant="outline">
                  Ver mais produtos <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="editais">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {purchaseAnnouncements.map(announcement => (
                  <Link key={announcement.id} href={`/supplier/cmarket/announcement/${announcement.id}`}>
                    <a>
                      <PurchaseAnnouncementCard announcement={announcement} />
                    </a>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-6">
                <Button variant="outline">
                  Ver todos os editais <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </section>
        
        {/* Como funciona */}
        <section className="mb-8 bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-medium mb-4 text-center">Como funciona o CMarket</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="font-medium mb-2">Anuncie ou Busque</h3>
              <p className="text-sm text-gray-600">Crie anúncios de produtos ou encontre o que precisa. Organizações também podem criar editais de compra.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="font-medium mb-2">Negocie com Segurança</h3>
              <p className="text-sm text-gray-600">Utilize nosso sistema de mensagens para negociar e esclarecer detalhes antes da compra.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="font-medium mb-2">Compre e Venda</h3>
              <p className="text-sm text-gray-600">Finalize a compra com pagamento seguro ou envie sua proposta para editais de compra.</p>
            </div>
          </div>
        </section>
      </main>
      
      {/* Rodapé */}
      <footer className="bg-gray-100 border-t py-8 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-medium mb-3">Sobre o CMarket</h3>
              <p className="text-sm text-gray-600">
                Marketplace especializado em equipamentos e insumos para laboratórios, 
                desenvolvido para facilitar a conexão entre organizações, associações e fornecedores.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Links Úteis</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-blue-600">Como funciona</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600">Termos de uso</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600">Política de privacidade</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Contato</h3>
              <ul className="space-y-2 text-sm">
                <li className="text-gray-600">Email: contato@cmarket.com.br</li>
                <li className="text-gray-600">Telefone: (11) 3456-7890</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-4 md:mb-0">
              &copy; 2025 CMarket. Todos os direitos reservados.
            </p>
            <div className="flex space-x-4">
              {/* Ícones de redes sociais aqui */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CMarketHomePage;