import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Filter, Grid, List, PlusCircle, Search, ShoppingCart, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// Define product interface
interface Product {
  id: number;
  name: string;
  supplierId: number;
  supplierName: string;
  price: number;
  compareAtPrice?: number;
  rating?: number;
  imageUrl?: string;
  description?: string;
  status: 'draft' | 'active' | 'out_of_stock' | 'discontinued';
  categories: string[];
}

// Sample product data (would come from API in real implementation)
const sampleProducts: Product[] = [
  {
    id: 1,
    name: "Óleo CBD Full Spectrum 1000mg",
    supplierId: 1,
    supplierName: "MedSupply Brasil",
    price: 349.90,
    compareAtPrice: 399.90,
    rating: 4.8,
    imageUrl: "https://via.placeholder.com/200x200.png?text=CBD+Oil",
    description: "Óleo premium com amplo espectro de canabinóides para tratamentos terapêuticos.",
    status: 'active',
    categories: ['Óleos', 'CBD', 'Premium']
  },
  {
    id: 2,
    name: "Kit de Análise de Solo Completo",
    supplierId: 2,
    supplierName: "LabTech Solutions",
    price: 780.50,
    rating: 4.5,
    imageUrl: "https://via.placeholder.com/200x200.png?text=Soil+Kit",
    description: "Kit completo para análise de pH, nutrientes e composição do solo para cultivo.",
    status: 'active',
    categories: ['Laboratório', 'Análise', 'Solo']
  },
  {
    id: 3,
    name: "Sementes de Cânhamo Industrial",
    supplierId: 3,
    supplierName: "AgroSeed Supply",
    price: 129.90,
    compareAtPrice: 159.90,
    rating: 4.6,
    imageUrl: "https://via.placeholder.com/200x200.png?text=Hemp+Seeds",
    description: "Sementes certificadas de cânhamo industrial com baixo THC para cultivo legal.",
    status: 'active',
    categories: ['Sementes', 'Cultivo', 'Cânhamo']
  },
  {
    id: 4,
    name: "Extrator de Óleos Vegetais",
    supplierId: 4,
    supplierName: "TechCare Equipamentos",
    price: 2459.00,
    rating: 4.9,
    imageUrl: "https://via.placeholder.com/200x200.png?text=Extractor",
    description: "Máquina extratora de óleos essenciais e canabinóides de alta eficiência para laboratórios e produção.",
    status: 'active',
    categories: ['Equipamentos', 'Extração', 'Laboratório']
  },
  {
    id: 5,
    name: "Bálsamo CBD para Articulações",
    supplierId: 1,
    supplierName: "MedSupply Brasil",
    price: 89.90,
    rating: 4.7,
    imageUrl: "https://via.placeholder.com/200x200.png?text=CBD+Balm",
    description: "Bálsamo tópico com CBD para alívio de dores articulares e musculares.",
    status: 'active',
    categories: ['Tópicos', 'CBD', 'Dor']
  },
  {
    id: 6,
    name: "Pipetas de Precisão (Kit)",
    supplierId: 2,
    supplierName: "LabTech Solutions",
    price: 379.90,
    compareAtPrice: 429.90,
    rating: 4.4,
    imageUrl: "https://via.placeholder.com/200x200.png?text=Pipettes",
    description: "Kit com pipetas de precisão para laboratórios e análises clínicas.",
    status: 'active',
    categories: ['Laboratório', 'Equipamentos', 'Precisão']
  },
  {
    id: 7,
    name: "Nutrientes Orgânicos para Cultivo",
    supplierId: 5,
    supplierName: "OrganicGrow",
    price: 199.90,
    rating: 4.6,
    imageUrl: "https://via.placeholder.com/200x200.png?text=Nutrients",
    description: "Kit completo de nutrientes orgânicos para cultivo de cannabis medicinal.",
    status: 'active',
    categories: ['Cultivo', 'Orgânico', 'Nutrientes']
  },
  {
    id: 8,
    name: "Armário de Secagem Controlada",
    supplierId: 4,
    supplierName: "TechCare Equipamentos",
    price: 3899.00,
    compareAtPrice: 4299.00,
    rating: 4.8,
    imageUrl: "https://via.placeholder.com/200x200.png?text=Drying+Cabinet",
    description: "Armário profissional para secagem controlada de plantas e flores com monitoramento de umidade.",
    status: 'active',
    categories: ['Equipamentos', 'Secagem', 'Produção']
  }
];

// Product Card Component
const ProductCard: React.FC<{ product: Product; viewType: 'grid' | 'list' }> = ({ product, viewType }) => {
  return viewType === 'grid' ? (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md h-full flex flex-col">
      <div className="relative aspect-square bg-gray-100">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="object-cover w-full h-full" 
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-500">
            Sem imagem
          </div>
        )}
        {product.compareAtPrice && (
          <Badge className="absolute top-2 right-2 bg-red-600">
            {Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF
          </Badge>
        )}
      </div>
      <CardHeader className="p-4 pb-0 flex-grow">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">{product.supplierName}</span>
          {product.rating && (
            <span className="flex items-center text-xs">
              <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {product.rating}
            </span>
          )}
        </div>
        <CardTitle className="text-base truncate">{product.name}</CardTitle>
        <CardDescription className="text-xs mt-1 line-clamp-2">
          {product.description}
        </CardDescription>
        <div className="mt-2 space-x-1">
          {product.categories.map((category, i) => (
            <Badge key={i} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
              {category}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardFooter className="p-4 flex items-center justify-between mt-auto">
        <div className="flex flex-col">
          <span className="text-lg font-bold text-red-700">
            R$ {product.price.toFixed(2)}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs text-gray-500 line-through">
              R$ {product.compareAtPrice.toFixed(2)}
            </span>
          )}
        </div>
        <Button size="sm" className="bg-red-600 hover:bg-red-700">
          <ShoppingCart className="h-4 w-4 mr-1" />
          Comprar
        </Button>
      </CardFooter>
    </Card>
  ) : (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="flex">
        <div className="relative w-40 h-40 bg-gray-100 flex-shrink-0">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="object-cover w-full h-full" 
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-500">
              Sem imagem
            </div>
          )}
          {product.compareAtPrice && (
            <Badge className="absolute top-2 right-2 bg-red-600">
              {Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF
            </Badge>
          )}
        </div>
        <div className="flex-grow p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">{product.supplierName}</span>
            {product.rating && (
              <span className="flex items-center text-xs">
                <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {product.rating}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-lg">{product.name}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
          <div className="mt-2 space-x-1">
            {product.categories.map((category, i) => (
              <Badge key={i} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                {category}
              </Badge>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-red-700">
                R$ {product.price.toFixed(2)}
              </span>
              {product.compareAtPrice && (
                <span className="text-xs text-gray-500 line-through">
                  R$ {product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>
            <Button className="bg-red-600 hover:bg-red-700">
              <ShoppingCart className="h-4 w-4 mr-1" />
              Comprar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Filter sidebar components
const FilterSidebar: React.FC<{ 
  onFilterChange: (filters: any) => void, 
  filters: any,
  categories: string[] 
}> = ({ onFilterChange, filters, categories }) => {
  const handlePriceChange = (value: number[]) => {
    onFilterChange({ ...filters, priceRange: value });
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    let newCategories = [...filters.categories];
    
    if (checked) {
      newCategories.push(category);
    } else {
      newCategories = newCategories.filter(c => c !== category);
    }
    
    onFilterChange({ ...filters, categories: newCategories });
  };

  const handleRatingChange = (rating: number, checked: boolean) => {
    let newRatings = [...filters.ratings];
    
    if (checked) {
      newRatings.push(rating);
    } else {
      newRatings = newRatings.filter(r => r !== rating);
    }
    
    onFilterChange({ ...filters, ratings: newRatings });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-lg mb-3">Preço</h3>
        <div className="px-2">
          <Slider
            defaultValue={[0, 5000]}
            max={5000}
            step={100}
            value={filters.priceRange}
            onValueChange={handlePriceChange}
            className="mt-6"
          />
          <div className="flex justify-between text-sm mt-2">
            <span>R$ {filters.priceRange[0]}</span>
            <span>R$ {filters.priceRange[1]}</span>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="font-medium text-lg mb-3">Categorias</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div className="flex items-center space-x-2" key={category}>
              <Checkbox 
                id={`category-${category}`} 
                checked={filters.categories.includes(category)}
                onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
              />
              <Label htmlFor={`category-${category}`}>{category}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="font-medium text-lg mb-3">Avaliação</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div className="flex items-center space-x-2" key={rating}>
              <Checkbox 
                id={`rating-${rating}`} 
                checked={filters.ratings.includes(rating)}
                onCheckedChange={(checked) => handleRatingChange(rating, checked as boolean)}
              />
              <Label htmlFor={`rating-${rating}`} className="flex items-center">
                {Array(5).fill(0).map((_, i) => (
                  <svg 
                    key={i}
                    className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-1">{rating}+ estrelas</span>
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Marketplace Component
export default function SupplierProducts() {
  // In a real implementation, fetch products from API
  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/suppliers/products"],
    queryFn: () => Promise.resolve(sampleProducts), // Using mock data for demo
  });

  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('relevance');
  const [filters, setFilters] = useState({
    priceRange: [0, 5000],
    categories: [],
    ratings: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  
  // Get unique categories from products
  const categories = React.useMemo(() => {
    if (!products) return [];
    const allCategories = products.flatMap(product => product.categories);
    return [...new Set(allCategories)].sort();
  }, [products]);

  // Filter products based on filters and search
  const filteredProducts = React.useMemo(() => {
    if (!products) return [];
    
    return products.filter(product => {
      // Filter by search query
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by price range
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }
      
      // Filter by categories
      if (filters.categories.length > 0 && 
          !product.categories.some(category => filters.categories.includes(category))) {
        return false;
      }
      
      // Filter by rating
      if (filters.ratings.length > 0) {
        if (!product.rating) return false;
        const productRatingRounded = Math.floor(product.rating);
        if (!filters.ratings.some(rating => productRatingRounded >= rating)) {
          return false;
        }
      }
      
      return true;
    });
  }, [products, searchQuery, filters]);

  // Sort filtered products
  const sortedProducts = React.useMemo(() => {
    if (!filteredProducts) return [];
    
    return [...filteredProducts].sort((a, b) => {
      switch (sortOrder) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0; // relevance, maintain order
      }
    });
  }, [filteredProducts, sortOrder]);

  // Pagination
  const productsPerPage = 12;
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const currentProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters, sortOrder]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button asChild variant="ghost" className="mr-2">
          <Link href="/organization/suppliers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo de Produtos</h1>
          <p className="text-muted-foreground">
            Explore e compre produtos dos fornecedores cadastrados
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filter Sidebar - Desktop */}
        <div className="hidden md:block">
          <Card className="sticky top-24">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2 text-red-600" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <FilterSidebar 
                onFilterChange={setFilters} 
                filters={filters} 
                categories={categories} 
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Filter Sidebar - Mobile */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden mb-4 w-full flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription>
                Refine sua busca com os filtros disponíveis
              </SheetDescription>
            </SheetHeader>
            <div className="py-4">
              <FilterSidebar 
                onFilterChange={setFilters} 
                filters={filters} 
                categories={categories} 
              />
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Main Content */}
        <div className="md:col-span-3 space-y-6">
          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar produtos..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 ml-auto">
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-[180px]">
                  <Sliders className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevância</SelectItem>
                  <SelectItem value="price-asc">Menor Preço</SelectItem>
                  <SelectItem value="price-desc">Maior Preço</SelectItem>
                  <SelectItem value="name-asc">Nome (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
                  <SelectItem value="rating">Melhor Avaliação</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex border rounded-md">
                <Button
                  variant={viewType === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  className={viewType === 'grid' ? 'bg-red-600' : ''}
                  onClick={() => setViewType('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewType === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  className={viewType === 'list' ? 'bg-red-600' : ''}
                  onClick={() => setViewType('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Results Summary */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Mostrando {currentProducts.length} de {filteredProducts.length} produtos
            </p>
            <Button asChild className="bg-red-600 hover:bg-red-700">
              <Link href="/organization/suppliers/products/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Cadastrar Produto
              </Link>
            </Button>
          </div>
          
          {/* Applied Filters */}
          {(filters.categories.length > 0 || filters.ratings.length > 0 || 
            (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000)) && (
            <div className="flex flex-wrap gap-2 py-2">
              {filters.categories.map(category => (
                <Badge key={category} variant="secondary" className="flex items-center gap-1">
                  {category}
                  <button
                    onClick={() => {
                      const newCategories = filters.categories.filter(c => c !== category);
                      setFilters({ ...filters, categories: newCategories });
                    }}
                    className="ml-1 rounded-full w-4 h-4 inline-flex items-center justify-center bg-gray-200 text-gray-600 hover:bg-gray-300"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              
              {filters.ratings.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.ratings.join(', ')}+ estrelas
                  <button
                    onClick={() => setFilters({ ...filters, ratings: [] })}
                    className="ml-1 rounded-full w-4 h-4 inline-flex items-center justify-center bg-gray-200 text-gray-600 hover:bg-gray-300"
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {(filters.priceRange[0] > 0 || filters.priceRange[1] < 5000) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  R${filters.priceRange[0]} - R${filters.priceRange[1]}
                  <button
                    onClick={() => setFilters({ ...filters, priceRange: [0, 5000] })}
                    className="ml-1 rounded-full w-4 h-4 inline-flex items-center justify-center bg-gray-200 text-gray-600 hover:bg-gray-300"
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              <Button
                variant="link"
                className="text-red-600 h-auto p-0"
                onClick={() => setFilters({ categories: [], ratings: [], priceRange: [0, 5000] })}
              >
                Limpar todos
              </Button>
            </div>
          )}
          
          {/* Products Grid/List */}
          {currentProducts.length === 0 ? (
            <Card className="p-8 text-center">
              <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-500">
                Tente ajustar seus filtros ou termos de busca.
              </p>
            </Card>
          ) : viewType === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentProducts.map((product) => (
                <ProductCard key={product.id} product={product} viewType="grid" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {currentProducts.map((product) => (
                <ProductCard key={product.id} product={product} viewType="list" />
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                      className={page === currentPage ? 'bg-red-600 text-white hover:bg-red-700' : ''}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </div>
  );
}