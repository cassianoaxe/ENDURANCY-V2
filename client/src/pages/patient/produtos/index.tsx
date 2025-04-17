import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingBasket, ShoppingCart } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import PatientLayout from '@/components/layout/PatientLayout';

// Interface para o produto
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  availability: 'Em estoque' | 'Poucas unidades' | 'Indisponível';
  concentration: string;
  volume: string;
}

// Lista de produtos de exemplo
const demoProducts: Product[] = [
  {
    id: '1',
    name: 'Full Spectrum 3000mg',
    description: 'Óleo de CBD de espectro completo, com todos os canabinoides, terpenos e flavonóides presentes na planta.',
    price: 289.99,
    imageUrl: 'https://placehold.co/300x300',
    category: 'Óleos',
    availability: 'Em estoque',
    concentration: '3000mg (100mg/ml)',
    volume: '30ml'
  },
  {
    id: '2',
    name: 'Broad Spectrum 1500mg',
    description: 'Óleo de CBD com amplo espectro de canabinoides, sem THC, ideal para uso diurno.',
    price: 179.99,
    imageUrl: 'https://placehold.co/300x300',
    category: 'Óleos',
    availability: 'Poucas unidades',
    concentration: '1500mg (50mg/ml)',
    volume: '30ml'
  },
  {
    id: '3',
    name: 'Isolado CBD 1000mg',
    description: 'Óleo com CBD isolado, 99,9% puro, sem outros canabinóides.',
    price: 149.99,
    imageUrl: 'https://placehold.co/300x300',
    category: 'Óleos',
    availability: 'Em estoque',
    concentration: '1000mg (33.3mg/ml)',
    volume: '30ml'
  },
  {
    id: '4',
    name: 'Pomada CBD 500mg',
    description: 'Pomada tópica com CBD para alívio localizado e rápida absorção.',
    price: 99.99,
    imageUrl: 'https://placehold.co/300x300',
    category: 'Tópicos',
    availability: 'Em estoque',
    concentration: '500mg',
    volume: '60g'
  },
  {
    id: '5',
    name: 'Cápsulas CBD 750mg',
    description: 'Cápsulas de CBD de liberação prolongada, para uso diário.',
    price: 129.99,
    imageUrl: 'https://placehold.co/300x300',
    category: 'Cápsulas',
    availability: 'Indisponível',
    concentration: '25mg por cápsula',
    volume: '30 cápsulas'
  },
  {
    id: '6',
    name: 'Spray Sublingual 500mg',
    description: 'Spray de absorção rápida para uso sublingual, sabor menta.',
    price: 89.99,
    imageUrl: 'https://placehold.co/300x300',
    category: 'Sprays',
    availability: 'Em estoque',
    concentration: '500mg (16.7mg/ml)',
    volume: '30ml'
  }
];

// Componente para o cartão de produto
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="relative overflow-hidden h-48 rounded-md mb-2">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="object-cover w-full h-full transform transition-transform hover:scale-105"
          />
        </div>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{product.name}</CardTitle>
          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={
            product.availability === 'Em estoque' ? 'bg-green-500 hover:bg-green-600' : 
            product.availability === 'Poucas unidades' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-red-500 hover:bg-red-600'
          }>
            {product.availability}
          </Badge>
          <Badge variant="outline">{product.category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="py-0 flex-grow">
        <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
        <div className="mt-2 text-sm">
          <p><strong>Concentração:</strong> {product.concentration}</p>
          <p><strong>Volume:</strong> {product.volume}</p>
        </div>
      </CardContent>
      <CardFooter className="pt-4 flex flex-col">
        <div className="w-full flex items-center justify-between mb-2">
          <span className="text-xl font-bold">R$ {product.price.toFixed(2)}</span>
          <span className="text-sm text-gray-500">(R$ {(product.price / 3).toFixed(2)} em 3x)</span>
        </div>
        <div className="w-full flex gap-2">
          <Button 
            variant="default" 
            className="w-full" 
            disabled={product.availability === 'Indisponível'}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Comprar
          </Button>
          <Button 
            variant="outline" 
            className="w-1/3"
            disabled={product.availability === 'Indisponível'}
          >
            <ShoppingBasket className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

// Componente para a página de produtos
const ProdutosPage: React.FC = () => {
  // Estado para categoria ativa
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
  
  // Lista de categorias únicas
  const categories = Array.from(new Set(demoProducts.map(product => product.category)));
  
  // Filtrar produtos baseado na categoria selecionada
  const filteredProducts = activeCategory 
    ? demoProducts.filter(product => product.category === activeCategory)
    : demoProducts;
  
  return (
    <PatientLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Produtos disponíveis</h1>
          <Button variant="outline">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Meu carrinho (0)
          </Button>
        </div>
        
        <div className="flex overflow-x-auto pb-2 mb-6 space-x-2">
          <Button 
            variant={activeCategory === null ? "default" : "outline"} 
            onClick={() => setActiveCategory(null)}
            className="whitespace-nowrap"
          >
            Todos os produtos
          </Button>
          {categories.map((category) => (
            <Button 
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              onClick={() => setActiveCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        <Separator className="my-8" />
        
        <div className="bg-muted/50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Informações importantes</h2>
          <div className="space-y-2 text-sm">
            <p>• Todos os produtos contêm CBD e outros canabinoides para uso medicinal</p>
            <p>• São necessárias prescrições médicas válidas para compra de produtos</p>
            <p>• Verifique seus receituários disponíveis na seção "Minhas Prescrições"</p>
            <p>• Consulte seu médico para recomendações específicas</p>
            <p>• Os preços incluem impostos e podem variar conforme a região</p>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
};

export default ProdutosPage;