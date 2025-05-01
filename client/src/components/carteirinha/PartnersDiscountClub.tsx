import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  AlertCircle,
  BadgePercent,
  Building,
  DollarSign,
  ExternalLink,
  Gift,
  Loader2,
  MapPin,
  Percent,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  Store,
  Tag,
  Utensils,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';

// Define o tipo de dados do benefício
interface PartnerBenefit {
  id: number;
  partnerId: number;
  title: string;
  description: string;
  discountType: 'percentage' | 'value' | 'freebie';
  discountValue: number;
  minPurchaseValue?: number;
  validFrom?: string;
  validUntil?: string;
  isActive: boolean;
  termsAndConditions?: string;
  code?: string;
}

// Define o tipo de dados do parceiro
interface Partner {
  id: number;
  organizationId: number;
  name: string;
  type: string;
  description: string;
  logoUrl?: string;
  websiteUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  discountRange?: string;
  isActive: boolean;
  createdAt: string;
  benefits?: PartnerBenefit[];
}

export function PartnersDiscountClub() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Carregar parceiros
  const { data: partners, isLoading, error } = useQuery({
    queryKey: ['/api/carteirinha/partners'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/carteirinha/partners');
        if (!response.ok) throw new Error('Falha ao carregar parceiros');
        
        return await response.json();
      } catch (error) {
        console.error('Erro ao buscar parceiros:', error);
        throw new Error('Falha ao carregar parceiros');
      }
    }
  });
  
  // Função para filtrar parceiros com base na pesquisa
  const filterPartners = (partners: Partner[]) => {
    if (!searchTerm) return partners;
    
    const searchLower = searchTerm.toLowerCase();
    return partners.filter(partner => 
      partner.name.toLowerCase().includes(searchLower) ||
      partner.type.toLowerCase().includes(searchLower) ||
      partner.description.toLowerCase().includes(searchLower) ||
      partner.city?.toLowerCase().includes(searchLower) ||
      partner.state?.toLowerCase().includes(searchLower)
    );
  };
  
  // Função para filtrar parceiros com base na categoria
  const filterPartnersByCategory = (partners: Partner[]) => {
    if (activeCategory === 'all') return partners;
    return partners.filter(partner => partner.type === activeCategory);
  };
  
  // Função para obter a contagem de parceiros por categoria
  const getCategoryCounts = (partners: Partner[] = []) => {
    const counts = {
      all: partners.length,
      commerce: 0,
      service: 0,
      health: 0,
      education: 0,
      food: 0,
      entertainment: 0,
      other: 0,
    };
    
    partners.forEach(partner => {
      if (counts.hasOwnProperty(partner.type)) {
        counts[partner.type] += 1;
      } else {
        counts.other += 1;
      }
    });
    
    return counts;
  };
  
  // Função para renderizar o ícone do tipo de parceiro
  const renderPartnerTypeIcon = (type: string) => {
    switch (type) {
      case 'commerce':
        return <ShoppingBag className="h-5 w-5 text-blue-500" />;
      case 'service':
        return <Building className="h-5 w-5 text-purple-500" />;
      case 'health':
        return <Building className="h-5 w-5 text-red-500" />;
      case 'education':
        return <Building className="h-5 w-5 text-green-500" />;
      case 'food':
        return <Utensils className="h-5 w-5 text-amber-500" />;
      case 'entertainment':
        return <Building className="h-5 w-5 text-pink-500" />;
      default:
        return <Store className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Função para renderizar o nome do tipo de parceiro
  const renderPartnerTypeName = (type: string) => {
    switch (type) {
      case 'commerce':
        return 'Comércio';
      case 'service':
        return 'Serviço';
      case 'health':
        return 'Saúde';
      case 'education':
        return 'Educação';
      case 'food':
        return 'Alimentação';
      case 'entertainment':
        return 'Entretenimento';
      default:
        return 'Outro';
    }
  };
  
  // Função para renderizar o ícone do tipo de desconto
  const renderDiscountTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="h-4 w-4 text-green-500" />;
      case 'value':
        return <DollarSign className="h-4 w-4 text-blue-500" />;
      case 'freebie':
        return <Gift className="h-4 w-4 text-purple-500" />;
      default:
        return <BadgePercent className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Função para formatar o valor do desconto
  const formatDiscountValue = (benefit: PartnerBenefit) => {
    switch (benefit.discountType) {
      case 'percentage':
        return `${benefit.discountValue}%`;
      case 'value':
        return `R$ ${benefit.discountValue.toFixed(2)}`;
      case 'freebie':
        return 'Brinde';
      default:
        return '';
    }
  };
  
  // Processar parceiros para exibição
  let filteredPartners: Partner[] = [];
  let categoryCounts = { all: 0, commerce: 0, service: 0, health: 0, education: 0, food: 0, entertainment: 0, other: 0 };
  
  if (partners) {
    filteredPartners = filterPartnersByCategory(filterPartners(partners));
    categoryCounts = getCategoryCounts(partners);
  }
  
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Clube de Benefícios</h2>
          <div className="flex items-center space-x-2">
            <Link href="/organization/carteirinha/partners/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Parceiro
              </Button>
            </Link>
          </div>
        </div>
        
        <Card className="border-red-300 bg-red-50">
          <CardHeader className="pb-2">
            <div className="flex">
              <AlertCircle className="text-red-500 mr-2" />
              <CardTitle className="text-red-800">Erro ao carregar parceiros</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">Ocorreu um erro ao carregar os dados dos parceiros. Por favor, tente novamente mais tarde.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Clube de Benefícios</h2>
          <p className="text-muted-foreground">
            Gerencie parceiros e descontos para o programa de benefícios
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/organization/carteirinha/partners/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Parceiro
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs 
            defaultValue="all" 
            value={activeCategory}
            onValueChange={setActiveCategory}
            className="w-full"
          >
            <TabsList className="mb-2">
              <TabsTrigger value="all" className="flex items-center">
                <Store className="mr-2 h-4 w-4" />
                <span>Todos</span>
                <Badge variant="secondary" className="ml-2">{categoryCounts.all}</Badge>
              </TabsTrigger>
              <TabsTrigger value="commerce">
                <ShoppingBag className="mr-2 h-4 w-4" />
                <span>Comércio</span>
                <Badge variant="secondary" className="ml-2">{categoryCounts.commerce}</Badge>
              </TabsTrigger>
              <TabsTrigger value="service">
                <Building className="mr-2 h-4 w-4" />
                <span>Serviços</span>
                <Badge variant="secondary" className="ml-2">{categoryCounts.service}</Badge>
              </TabsTrigger>
              <TabsTrigger value="health">
                <Building className="mr-2 h-4 w-4" />
                <span>Saúde</span>
                <Badge variant="secondary" className="ml-2">{categoryCounts.health}</Badge>
              </TabsTrigger>
              <TabsTrigger value="food">
                <Utensils className="mr-2 h-4 w-4" />
                <span>Alimentação</span>
                <Badge variant="secondary" className="ml-2">{categoryCounts.food}</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar parceiros..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando parceiros...</span>
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="py-8 text-center">
            <Store className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Nenhum parceiro encontrado</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchTerm || activeCategory !== 'all'
                ? "Nenhum parceiro corresponde aos critérios de pesquisa."
                : "Você ainda não cadastrou nenhum parceiro no clube de benefícios."}
            </p>
            {!searchTerm && activeCategory === 'all' && (
              <Button className="mt-4" asChild>
                <Link href="/organization/carteirinha/partners/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Novo Parceiro
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPartners.map(partner => (
              <Card key={partner.id} className={!partner.isActive ? "opacity-70" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      {partner.logoUrl ? (
                        <div className="h-10 w-10 rounded-md overflow-hidden border flex items-center justify-center bg-white">
                          <img 
                            src={partner.logoUrl} 
                            alt={`Logo ${partner.name}`} 
                            className="max-h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/40x40?text=Logo';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-md overflow-hidden border flex items-center justify-center bg-gray-100">
                          <Store className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-base font-bold">{partner.name}</CardTitle>
                        <div className="flex items-center text-xs text-muted-foreground">
                          {renderPartnerTypeIcon(partner.type)}
                          <span className="ml-1">{renderPartnerTypeName(partner.type)}</span>
                          {!partner.isActive && (
                            <Badge variant="outline" className="ml-2 border-red-300 text-red-600">
                              Inativo
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Link href={`/organization/carteirinha/partners/${partner.id}/benefit/new`}>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/organization/carteirinha/partners/${partner.id}`}>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <Tag className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {partner.description}
                  </p>
                  
                  {partner.address && (
                    <div className="flex items-start mt-2 text-sm">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {partner.address}
                        {partner.city && `, ${partner.city}`}
                        {partner.state && ` - ${partner.state}`}
                      </span>
                    </div>
                  )}
                  
                  {partner.contactPhone && (
                    <div className="flex items-center mt-1 text-sm">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">{partner.contactPhone}</span>
                    </div>
                  )}
                  
                  {partner.websiteUrl && (
                    <div className="mt-2">
                      <a 
                        href={partner.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Visitar site
                      </a>
                    </div>
                  )}
                  
                  {partner.benefits && partner.benefits.length > 0 ? (
                    <div className="mt-3">
                      <Accordion type="single" collapsible>
                        <AccordionItem value="benefits">
                          <AccordionTrigger className="text-sm font-medium py-2">
                            Benefícios ({partner.benefits.length})
                          </AccordionTrigger>
                          <AccordionContent>
                            <ScrollArea className="h-40">
                              <div className="space-y-2">
                                {partner.benefits.map(benefit => (
                                  <Card key={benefit.id} className="p-2">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <div className="flex items-center">
                                          {renderDiscountTypeIcon(benefit.discountType)}
                                          <span className="ml-1 font-medium">{benefit.title}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{formatDiscountValue(benefit)}</p>
                                      </div>
                                      <HoverCard>
                                        <HoverCardTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <BadgePercent className="h-4 w-4" />
                                          </Button>
                                        </HoverCardTrigger>
                                        <HoverCardContent>
                                          <div className="space-y-2">
                                            <h4 className="font-medium">{benefit.title}</h4>
                                            <p className="text-sm">{benefit.description}</p>
                                            {benefit.minPurchaseValue && (
                                              <p className="text-xs text-muted-foreground">
                                                Valor mínimo: R$ {benefit.minPurchaseValue.toFixed(2)}
                                              </p>
                                            )}
                                            {benefit.code && (
                                              <div className="mt-2 bg-muted p-1 rounded text-sm font-mono text-center">
                                                {benefit.code}
                                              </div>
                                            )}
                                          </div>
                                        </HoverCardContent>
                                      </HoverCard>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            </ScrollArea>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  ) : (
                    <div className="mt-3 py-2 text-center border rounded-md">
                      <p className="text-sm text-muted-foreground">Nenhum benefício cadastrado</p>
                      <Link 
                        href={`/organization/carteirinha/partners/${partner.id}/benefit/new`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Adicionar benefício
                      </Link>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Link href={`/organization/carteirinha/partners/${partner.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      Gerenciar Parceiro
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}