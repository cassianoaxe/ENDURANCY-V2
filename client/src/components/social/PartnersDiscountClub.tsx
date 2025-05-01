import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Store, Map, ExternalLink, Eye, Edit, Plus, Trash2, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "wouter";

// Status para parceiros
const statusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800"
};

// Categorias para parceiros
const categoryLabels = {
  health: "Saúde",
  pharmacy: "Farmácia",
  food: "Alimentação",
  education: "Educação",
  services: "Serviços",
  retail: "Varejo",
  other: "Outros"
};

const categoryColors = {
  health: "bg-blue-100 text-blue-800",
  pharmacy: "bg-green-100 text-green-800",
  food: "bg-orange-100 text-orange-800",
  education: "bg-purple-100 text-purple-800",
  services: "bg-indigo-100 text-indigo-800",
  retail: "bg-pink-100 text-pink-800",
  other: "bg-gray-100 text-gray-800"
};

// Interface para parceiros
interface Partner {
  id: number;
  organizationId: number;
  name: string;
  category: 'health' | 'pharmacy' | 'food' | 'education' | 'services' | 'retail' | 'other';
  status: 'active' | 'inactive' | 'pending';
  description: string;
  address: string;
  city: string;
  state: string;
  logoUrl?: string;
  website?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  benefits?: Benefit[];
}

// Interface para benefícios
interface Benefit {
  id: number;
  partnerId: number;
  title: string;
  description: string;
  discountType: string;
  discountValue: number;
  validFrom: string;
  validUntil?: string;
}

export function PartnersDiscountClub() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  // Buscar parceiros
  const { data: partners, isLoading: isLoadingPartners } = useQuery({
    queryKey: ['/api/social/partners'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/social/partners');
        if (!response.ok) throw new Error('Falha ao carregar parceiros');
        return await response.json();
      } catch (error) {
        console.error('Erro ao buscar parceiros:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os parceiros",
          variant: "destructive",
        });
        return [];
      }
    }
  });

  // Mockup de dados enquanto não temos a API real
  const mockPartners: Partner[] = [
    {
      id: 1,
      organizationId: 1,
      name: "Farmácia Saúde Vital",
      category: 'pharmacy',
      status: 'active',
      description: "Rede de farmácias com produtos naturais e medicamentos para saúde e bem-estar.",
      address: "Av. Paulista, 1000",
      city: "São Paulo",
      state: "SP",
      logoUrl: "https://via.placeholder.com/150",
      website: "https://saudevital.com.br",
      contractStartDate: "2023-01-01T00:00:00Z",
      contractEndDate: "2024-01-01T00:00:00Z",
      benefits: [
        {
          id: 1,
          partnerId: 1,
          title: "15% de desconto em todos os produtos",
          description: "Desconto válido para todos os associados mediante apresentação da carteirinha",
          discountType: "percentage",
          discountValue: 15,
          validFrom: "2023-01-01T00:00:00Z",
          validUntil: "2024-01-01T00:00:00Z"
        }
      ]
    },
    {
      id: 2,
      organizationId: 1,
      name: "Clínica Bem Estar",
      category: 'health',
      status: 'active',
      description: "Clínica especializada em terapias alternativas e tratamentos com cannabis medicinal.",
      address: "Rua Augusta, 500",
      city: "São Paulo",
      state: "SP",
      logoUrl: "https://via.placeholder.com/150",
      contractStartDate: "2023-02-15T00:00:00Z",
      benefits: [
        {
          id: 2,
          partnerId: 2,
          title: "20% de desconto em consultas",
          description: "Desconto válido para consultas iniciais",
          discountType: "percentage",
          discountValue: 20,
          validFrom: "2023-02-15T00:00:00Z"
        },
        {
          id: 3,
          partnerId: 2,
          title: "10% de desconto em terapias",
          description: "Desconto válido para todas as terapias oferecidas pela clínica",
          discountType: "percentage",
          discountValue: 10,
          validFrom: "2023-02-15T00:00:00Z"
        }
      ]
    },
    {
      id: 3,
      organizationId: 1,
      name: "Restaurante Natureza",
      category: 'food',
      status: 'pending',
      description: "Restaurante vegetariano com opções veganas e produtos orgânicos.",
      address: "Rua Oscar Freire, 200",
      city: "São Paulo",
      state: "SP",
      website: "https://restaurantenatureza.com.br",
      contractStartDate: "2023-03-10T00:00:00Z",
      benefits: [
        {
          id: 4,
          partnerId: 3,
          title: "10% de desconto no cardápio",
          description: "Desconto válido para almoço e jantar, exceto bebidas alcoólicas",
          discountType: "percentage",
          discountValue: 10,
          validFrom: "2023-03-10T00:00:00Z"
        }
      ]
    }
  ];
  
  // Escolher os dados reais ou o mockup
  const displayPartners = partners || mockPartners;
  
  // Filtrar parceiros
  let filteredPartners = displayPartners;
  
  // Filtrar por status
  if (activeTab !== 'all') {
    filteredPartners = filteredPartners.filter(partner => partner.status === activeTab);
  }
  
  // Filtrar por categoria
  if (categoryFilter) {
    filteredPartners = filteredPartners.filter(partner => partner.category === categoryFilter);
  }
  
  // Filtrar por termo de busca
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    filteredPartners = filteredPartners.filter(partner => 
      partner.name.toLowerCase().includes(term) || 
      partner.description.toLowerCase().includes(term) ||
      partner.city.toLowerCase().includes(term)
    );
  }

  // Agrupar por categoria para visualização em cards
  const partnersByCategory = filteredPartners.reduce((acc, partner) => {
    if (!acc[partner.category]) {
      acc[partner.category] = [];
    }
    acc[partner.category].push(partner);
    return acc;
  }, {} as Record<string, Partner[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Parceiros</h2>
          <p className="text-muted-foreground">
            Gerencie os parceiros do clube de benefícios
          </p>
        </div>
        <Link href="/social/partners/new">
          <Button>
            <Store className="mr-2 h-4 w-4" />
            Novo Parceiro
          </Button>
        </Link>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total de Parceiros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{displayPartners.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Parceiros Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {displayPartners.filter(partner => partner.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Benefícios Oferecidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {displayPartners.reduce((total, partner) => total + (partner.benefits?.length || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar parceiros..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as categorias</SelectItem>
            <SelectItem value="health">Saúde</SelectItem>
            <SelectItem value="pharmacy">Farmácia</SelectItem>
            <SelectItem value="food">Alimentação</SelectItem>
            <SelectItem value="education">Educação</SelectItem>
            <SelectItem value="services">Serviços</SelectItem>
            <SelectItem value="retail">Varejo</SelectItem>
            <SelectItem value="other">Outros</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="active">Ativos</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="inactive">Inativos</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {isLoadingPartners ? (
            <div className="flex justify-center p-8">
              <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : filteredPartners.length === 0 ? (
            <div className="text-center p-8 border rounded-lg bg-muted/20">
              <p className="text-muted-foreground">Nenhum parceiro encontrado com estes filtros.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Exibir parceiros em formato de lista */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Benefícios</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPartners.map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell className="font-medium">{partner.name}</TableCell>
                        <TableCell>
                          <Badge className={categoryColors[partner.category] || "bg-gray-100"}>
                            {categoryLabels[partner.category] || "Outros"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[partner.status] || "bg-gray-100"}>
                            {partner.status === 'active' && 'Ativo'}
                            {partner.status === 'inactive' && 'Inativo'}
                            {partner.status === 'pending' && 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell>{partner.city}/{partner.state}</TableCell>
                        <TableCell>
                          {partner.benefits?.length || 0} benefícios
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/social/partners/${partner.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/social/partners/edit/${partner.id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/social/partners/${partner.id}/benefit/new`}>
                              <Button variant="outline" size="sm">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </Link>
                            {partner.website && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(partner.website, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Exibir parceiros em formato de cards, agrupados por categoria */}
              <div className="space-y-6">
                {Object.entries(partnersByCategory).map(([category, partners]) => (
                  <div key={category} className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <span className={`inline-block w-3 h-3 rounded-full mr-2 ${categoryColors[category as keyof typeof categoryColors]?.replace('text-', 'bg-')}`}></span>
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {partners.map(partner => (
                        <Card key={partner.id} className="overflow-hidden">
                          <div className="h-32 bg-muted flex items-center justify-center relative">
                            {partner.logoUrl ? (
                              <img 
                                src={partner.logoUrl} 
                                alt={`Logo de ${partner.name}`} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Store className="h-12 w-12 text-muted-foreground" />
                            )}
                            <Badge 
                              className={`absolute top-2 right-2 ${statusColors[partner.status]}`}
                            >
                              {partner.status === 'active' && 'Ativo'}
                              {partner.status === 'inactive' && 'Inativo'}
                              {partner.status === 'pending' && 'Pendente'}
                            </Badge>
                          </div>
                          
                          <CardHeader>
                            <CardTitle>{partner.name}</CardTitle>
                            <CardDescription className="flex items-center">
                              <Map className="h-3 w-3 mr-1" />
                              {partner.city}/{partner.state}
                            </CardDescription>
                          </CardHeader>
                          
                          <CardContent>
                            <p className="text-sm line-clamp-2 mb-4">{partner.description}</p>
                            
                            {partner.benefits && partner.benefits.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-sm font-semibold">Benefícios:</p>
                                <ul className="space-y-1">
                                  {partner.benefits.map(benefit => (
                                    <li key={benefit.id} className="text-sm flex items-start">
                                      <Percent className="h-3 w-3 mr-1 mt-1 text-primary" />
                                      <span>{benefit.title}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </CardContent>
                          
                          <CardFooter className="flex justify-between">
                            <Link href={`/social/partners/${partner.id}`}>
                              <Button variant="outline" size="sm">
                                Ver detalhes
                              </Button>
                            </Link>
                            
                            <div className="flex gap-2">
                              <Link href={`/social/partners/edit/${partner.id}`}>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              
                              {partner.website && (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => window.open(partner.website, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}