import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, PlusCircle, ShoppingBag, Store, TrendingUp, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";

// Supplier stats component for dashboard
const SupplierStats: React.FC = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-red-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fornecedores Cadastrados</CardTitle>
          <Store className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">28</div>
          <p className="text-xs text-muted-foreground">
            +5 no último mês
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-red-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Produtos Catalogados</CardTitle>
          <ShoppingBag className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">184</div>
          <p className="text-xs text-muted-foreground">
            +32 no último mês
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-red-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Licitações Ativas</CardTitle>
          <UserCheck className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">7</div>
          <p className="text-xs text-muted-foreground">
            3 encerram nesta semana
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-red-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Volume de Compras</CardTitle>
          <TrendingUp className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ 54.200</div>
          <p className="text-xs text-muted-foreground">
            +12% em relação ao mês anterior
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// Recent activities component
const RecentActivities: React.FC = () => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
        <CardDescription>
          Últimas interações com fornecedores e produtos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { date: "02/05/2025", event: "Fornecedor Biotech registrado na plataforma", type: "registration" },
            { date: "30/04/2025", event: "Licitação #385 para material de laboratório publicada", type: "tender" },
            { date: "28/04/2025", event: "Pedido #582 confirmado - Reagentes analíticos", type: "order" },
            { date: "25/04/2025", event: "15 novos produtos adicionados ao catálogo", type: "product" },
            { date: "22/04/2025", event: "Avaliação de fornecedor MedSupply concluída", type: "review" },
          ].map((activity, i) => (
            <div key={i} className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.event}</p>
                <p className="text-xs text-muted-foreground">{activity.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Supplier list component 
const TopSuppliers: React.FC = () => {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Principais Fornecedores</CardTitle>
        <CardDescription>
          Fornecedores com melhor avaliação e volume de negócios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[
            { name: "MedSupply Brasil", rating: 4.9, transactions: 24, volume: "R$ 12.850" },
            { name: "LabTech Solutions", rating: 4.8, transactions: 18, volume: "R$ 9.740" },
            { name: "PharmaProdutos", rating: 4.7, transactions: 15, volume: "R$ 7.320" },
            { name: "BioReagentes", rating: 4.6, transactions: 11, volume: "R$ 6.450" },
            { name: "TechCare Equipamentos", rating: 4.5, transactions: 8, volume: "R$ 5.780" },
          ].map((supplier, i) => (
            <div key={i} className="flex items-center justify-between p-2 border-b last:border-0">
              <div>
                <h4 className="font-medium">{supplier.name}</h4>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span className="flex items-center">
                    {Array(5).fill(0).map((_, i) => (
                      <svg 
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(supplier.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-1">{supplier.rating}</span>
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-red-600">{supplier.volume}</div>
                <div className="text-xs text-muted-foreground">{supplier.transactions} transações</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Supplier Dashboard
export default function SupplierPortalDashboard() {
  // Fetch supplier overview data
  const { data: supplierOverview, isLoading } = useQuery({
    queryKey: ["/api/suppliers/overview"],
    // Using default fetcher from queryClient
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portal do Fornecedor</h1>
          <p className="text-muted-foreground">
            Gerencie seus fornecedores, produtos e licitações em um só lugar
          </p>
        </div>
        <div className="flex space-x-2">
          <Button asChild className="bg-red-600 hover:bg-red-700">
            <Link href="/organization/suppliers/register">
              <PlusCircle className="mr-2 h-4 w-4" />
              Cadastrar Fornecedor
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
            <Link href="/organization/suppliers/tenders/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Licitação
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-red-50 text-red-900">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="tenders">Licitações</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <SupplierStats />
          
          <div className="grid gap-4 md:grid-cols-3">
            <TopSuppliers />
            <RecentActivities />
          </div>
        </TabsContent>
        
        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <CardTitle>Fornecedores Cadastrados</CardTitle>
              <CardDescription>
                Gerencie todos os fornecedores registrados na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Implemente listagem de fornecedores aqui. Veja mais detalhes na página específica.
                <Button asChild variant="link" className="text-red-600 p-0 ml-2">
                  <Link href="/organization/suppliers/all">
                    Ver todos os fornecedores
                  </Link>
                </Button>
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Catálogo de Produtos</CardTitle>
              <CardDescription>
                Explore todos os produtos disponíveis no marketplace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Implemente catálogo de produtos aqui. Veja mais detalhes na página específica.
                <Button asChild variant="link" className="text-red-600 p-0 ml-2">
                  <Link href="/organization/suppliers/products">
                    Ver catálogo completo
                  </Link>
                </Button>
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tenders">
          <Card>
            <CardHeader>
              <CardTitle>Licitações Ativas</CardTitle>
              <CardDescription>
                Gerencie licitações e veja propostas recebidas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Implemente gestão de licitações aqui. Veja mais detalhes na página específica.
                <Button asChild variant="link" className="text-red-600 p-0 ml-2">
                  <Link href="/organization/suppliers/tenders">
                    Ver todas as licitações
                  </Link>
                </Button>
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos</CardTitle>
              <CardDescription>
                Acompanhe os pedidos realizados aos fornecedores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Implemente gestão de pedidos aqui. Veja mais detalhes na página específica.
                <Button asChild variant="link" className="text-red-600 p-0 ml-2">
                  <Link href="/organization/suppliers/orders">
                    Ver todos os pedidos
                  </Link>
                </Button>
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}