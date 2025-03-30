import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Check, 
  AlertCircle, 
  ArrowLeft, 
  ShoppingCart, 
  Leaf, 
  BarChart3, 
  Heart,
  Briefcase, 
  Scale, 
  Eye, 
  Brain, 
  Download, 
  Settings, 
  LineChart,
  ClipboardList,
  ArrowUpRight,
  Clock,
  Plus,
  DollarSign,
  Building,
  Package
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Module, ModulePlan } from '@/../../shared/schema';
import { useToast } from '@/hooks/use-toast';

// Mapeamento de tipos de módulos para seus ícones correspondentes
const moduleIcons: Record<string, any> = {
  compras: ShoppingCart,
  cultivo: Leaf,
  producao: BarChart3,
  crm: Heart,
  rh: Briefcase,
  juridico: Scale,
  social: Heart,
  transparencia: Eye,
  ia: Brain
};

// Dados para os módulos específicos
const moduleSpecificData: Record<string, any> = {
  cultivo: {
    longDescription: "O módulo de cultivo permite o gerenciamento completo do ciclo de cultivo de cannabis medicinal, desde o plantio até a colheita.",
    features: [
      "Gestão de plantas e lotes",
      "Rastreamento de crescimento",
      "Controle de estoque de plantas",
      "Gestão de strains",
      "Transferências internas"
    ],
    stats: {
      activeOrgs: 3,
      totalOrgs: 5,
      monthlyRevenue: 2897,
      avgPrice: 965.67,
      trackedPlants: 783,
      plantGrowth: 12,
      activeBatches: 42,
      batchGrowth: 3
    }
  },
  compras: {
    longDescription: "O módulo de compras oferece um sistema completo para gerenciamento de fornecedores, compras e estoque de materiais.",
    features: [
      "Gestão de fornecedores",
      "Ordens de compra",
      "Recebimento de materiais",
      "Controle de estoque",
      "Histórico de transações"
    ],
    stats: {
      activeOrgs: 5,
      totalOrgs: 8,
      monthlyRevenue: 3450,
      avgPrice: 1150.00,
      activePurchaseOrders: 24,
      poGrowth: 8,
      suppliers: 37,
      supplierGrowth: 5
    }
  },
  producao: {
    longDescription: "O módulo de Produção oferece ferramentas completas para controle de qualidade, gestão de fornecedores, matérias-primas e processos de produção, garantindo rastreabilidade e conformidade regulatória.",
    features: [
      "Controle de qualidade",
      "Gestão de fornecedores",
      "Controle de matérias-primas",
      "Ordens de produção",
      "Rastreabilidade"
    ],
    subtitle: "Controle de produção e qualidade",
    stats: {
      activeOrgs: 12,
      totalActiveOrgs: 12,
      monthlyRevenue: 28750,
      adoptionRate: 27,
      growthRate: 5,
      activeProductions: 18,
      productionGrowth: 5,
      products: 45,
      productGrowth: 7
    },
    recentOrgs: [
      {
        name: "MediCannabis Farma", 
        plan: "Plano Profissional",
        status: "Ativo"
      }
    ]
  },
};

// Componente para exibir estatísticas em cards
const StatCard = ({ title, value, description, icon: Icon, trend = null, trendValue = null }) => (
  <Card className="overflow-hidden">
    <CardContent className="p-6">
      <div className="flex flex-col">
        <div className="text-sm text-muted-foreground mb-1">{title}</div>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <h3 className="text-2xl font-bold">{value}</h3>
          {trend && (
            <span className={`text-xs rounded px-1.5 py-0.5 font-medium flex items-center gap-1
              ${trend === 'up' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
              {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowUpRight size={12} className="rotate-180" />}
              {trendValue}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </CardContent>
  </Card>
);

export default function Modules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [plans, setPlans] = useState<ModulePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [activeTab, setActiveTab] = useState('visao-geral');
  const { toast } = useToast();
  
  // Obter o ID do módulo da URL se existir
  const currentPath = window.location.pathname;
  const moduleIdMatch = currentPath.match(/^\/modules\/(\d+)$/);
  const moduleIdFromUrl = moduleIdMatch ? parseInt(moduleIdMatch[1]) : null;
  
  useEffect(() => {
    fetchModules();
  }, []);
  
  useEffect(() => {
    if (selectedModule) {
      fetchModulePlans(selectedModule.id);
    }
  }, [selectedModule]);
  
  async function fetchModules() {
    try {
      setLoading(true);
      const response = await apiRequest('GET', '/api/modules');
      const data = await response.json();
      setModules(data);
      
      if (moduleIdFromUrl) {
        // Se temos um ID na URL, selecionar esse módulo específico
        const moduleFromUrl = data.find((m: Module) => m.id === moduleIdFromUrl);
        if (moduleFromUrl) {
          setSelectedModule(moduleFromUrl);
        } else {
          // Se o módulo não for encontrado, selecionar o primeiro
          if (data.length > 0) {
            setSelectedModule(data[0]);
          }
          // Redirecionar para a página de módulos principal
          window.history.pushState({}, '', '/modules');
        }
      } else if (data.length > 0 && currentPath === '/modules') {
        // Na página principal de módulos, não pré-selecionamos nenhum módulo
        setSelectedModule(null);
      }
    } catch (error) {
      console.error('Erro ao carregar módulos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os módulos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }
  
  async function fetchModulePlans(moduleId: number) {
    try {
      setLoadingPlans(true);
      const response = await apiRequest('GET', `/api/modules/${moduleId}/plans`);
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os planos do módulo',
        variant: 'destructive',
      });
    } finally {
      setLoadingPlans(false);
    }
  }
  
  function navigateToModule(moduleId: number) {
    window.history.pushState({}, '', `/modules/${moduleId}`);
    const module = modules.find(m => m.id === moduleId);
    if (module) {
      setSelectedModule(module);
    }
    // Disparar evento para que outros componentes saibam que a URL mudou
    window.dispatchEvent(new Event('popstate'));
  }
  
  function backToModulesList() {
    window.history.pushState({}, '', '/modules');
    setSelectedModule(null);
    // Disparar evento para que outros componentes saibam que a URL mudou
    window.dispatchEvent(new Event('popstate'));
  }
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }
  
  // Se um módulo estiver selecionado (através da URL), mostrar a visão detalhada do módulo
  if (selectedModule) {
    const ModuleIcon = moduleIcons[selectedModule.type.toLowerCase()] || AlertCircle;
    
    // Obter dados específicos do módulo por tipo, ou usar dados padrão
    const moduleData = moduleSpecificData[selectedModule.type.toLowerCase()] || {
      longDescription: selectedModule.description,
      features: ["Funcionalidade 1", "Funcionalidade 2", "Funcionalidade 3"],
      stats: {
        activeOrgs: 0,
        totalOrgs: 0,
        monthlyRevenue: 0,
        avgPrice: 0
      }
    };
    
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <div className="flex flex-col space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-md bg-yellow-50 flex items-center justify-center">
                  <ModuleIcon className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Módulo {selectedModule.name.split(' ').slice(1).join(' ')}</h1>
                  <p className="text-muted-foreground">
                    {moduleData.subtitle || `Controle de ${selectedModule.type.toLowerCase()} e qualidade`}
                  </p>
                </div>
              </div>
              
              <Button className="gap-2 bg-gray-900 text-white hover:bg-gray-800">
                <Plus size={16} />
                Adicionar a Organização
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-sm">Organizações com o Módulo</p>
                    <h3 className="text-3xl font-bold">{moduleData.stats.activeOrgs || 12}</h3>
                    <div className="flex items-center text-blue-500 gap-2">
                      <DollarSign className="h-4 w-4" />
                      <p className="text-sm">{moduleData.stats.activeOrgs || 12} organizações ativas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-sm">Receita Mensal</p>
                    <h3 className="text-3xl font-bold">R$ {moduleData.stats.monthlyRevenue.toLocaleString() || '28.750'}</h3>
                    <div className="flex items-center text-green-500 gap-2">
                      <DollarSign className="h-4 w-4" />
                      <p className="text-sm">Faturamento recorrente</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-sm">Taxa de Adoção</p>
                    <h3 className="text-3xl font-bold">27%</h3>
                    <div className="flex items-center text-purple-500 gap-2">
                      <ArrowUpRight className="h-4 w-4" />
                      <p className="text-sm">Crescimento de 5% este mês</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-muted/30 p-0 border-b">
                <TabsTrigger 
                  value="visao-geral" 
                  className="data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none py-2.5 border-b-2 border-transparent data-[state=active]:border-primary text-gray-700 hover:text-gray-900"
                >
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger 
                  value="organizacoes" 
                  className="data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none py-2.5 border-b-2 border-transparent data-[state=active]:border-primary text-gray-700 hover:text-gray-900"
                >
                  Organizações
                </TabsTrigger>
                <TabsTrigger 
                  value="precos-planos" 
                  className="data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none py-2.5 border-b-2 border-transparent data-[state=active]:border-primary text-gray-700 hover:text-gray-900"
                >
                  Planos e Preços
                </TabsTrigger>
                <TabsTrigger 
                  value="configuracoes" 
                  className="data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none py-2.5 border-b-2 border-transparent data-[state=active]:border-primary text-gray-700 hover:text-gray-900"
                >
                  Configurações
                </TabsTrigger>
              </TabsList>

              <TabsContent value="visao-geral" className="mt-0">
                {selectedModule.type.toLowerCase() === 'producao' ? (
                  <Card className="mb-8">
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-4">Sobre o Módulo</h2>
                      <p className="mb-6">
                        O módulo de Produção oferece ferramentas completas para controle de qualidade, gestão de fornecedores, matérias-primas e processos de produção, garantindo rastreabilidade e conformidade regulatória.
                      </p>
                      
                      <h3 className="text-xl font-medium mb-3">Recursos Principais</h3>
                      <ul className="space-y-2">
                        {moduleData.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="mb-8">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                          <h2 className="text-xl font-bold mb-3">Informações do Módulo</h2>
                          <p className="text-sm text-muted-foreground mb-4">
                            Detalhes sobre o módulo de {selectedModule.type.toLowerCase()} e suas funcionalidades
                          </p>

                          <p className="mb-4">{moduleData.longDescription}</p>

                          <h3 className="font-semibold mb-3">Principais Funcionalidades:</h3>
                          <ul className="space-y-1">
                            {moduleData.features.map((feature, index) => (
                              <li key={index} className="flex items-start">
                                <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h2 className="text-xl font-bold mb-3">Estatísticas</h2>
                          
                          <div className="space-y-4">
                            <div className="flex justify-between border-b pb-2">
                              <span className="text-muted-foreground">Organizações ativas:</span>
                              <span className="font-medium">
                                {moduleData.stats.activeOrgs} / {moduleData.stats.totalOrgs}
                              </span>
                            </div>
                            
                            <div className="flex justify-between border-b pb-2">
                              <span className="text-muted-foreground">Receita mensal:</span>
                              <span className="font-medium">
                                R$ {moduleData.stats.monthlyRevenue}
                              </span>
                            </div>
                            
                            <div className="flex justify-between pb-2">
                              <span className="text-muted-foreground">Preço médio:</span>
                              <span className="font-medium">
                                R$ {moduleData.stats.avgPrice}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <StatCard 
                    title="Organizações Ativas" 
                    value={moduleData.stats.activeOrgs}
                    description="Total de organizações utilizando o módulo" 
                    icon={Building}
                    trend="up"
                    trendValue="60%"
                  />
                  
                  <StatCard 
                    title="Receita Mensal" 
                    value={`R$ ${moduleData.stats.monthlyRevenue}`}
                    description="Receita total gerada pelo módulo" 
                    icon={DollarSign}
                  />
                  
                  {selectedModule.type.toLowerCase() === 'cultivo' && (
                    <>
                      <StatCard 
                        title="Plantas Rastreadas" 
                        value={moduleData.stats.trackedPlants}
                        description="Total de plantas no sistema" 
                        icon={Leaf}
                        trend="up"
                        trendValue={`+${moduleData.stats.plantGrowth}% este mês`}
                      />
                      
                      <StatCard 
                        title="Lotes Ativos" 
                        value={moduleData.stats.activeBatches}
                        description="Lotes em andamento" 
                        icon={ClipboardList}
                        trend="up"
                        trendValue={`+${moduleData.stats.batchGrowth} esta semana`}
                      />
                    </>
                  )}
                  
                  {selectedModule.type.toLowerCase() === 'compras' && (
                    <>
                      <StatCard 
                        title="Ordens de Compra" 
                        value={moduleData.stats.activePurchaseOrders}
                        description="Ordens ativas no momento" 
                        icon={ShoppingCart}
                        trend="up"
                        trendValue={`+${moduleData.stats.poGrowth} este mês`}
                      />
                      
                      <StatCard 
                        title="Fornecedores" 
                        value={moduleData.stats.suppliers}
                        description="Total de fornecedores cadastrados" 
                        icon={Building}
                        trend="up"
                        trendValue={`+${moduleData.stats.supplierGrowth} este mês`}
                      />
                    </>
                  )}
                  
                  {selectedModule.type.toLowerCase() === 'producao' && (
                    <>
                      <StatCard 
                        title="Produções Ativas" 
                        value={moduleData.stats.activeProductions}
                        description="Produções em andamento" 
                        icon={BarChart3}
                        trend="up"
                        trendValue={`+${moduleData.stats.productionGrowth} este mês`}
                      />
                      
                      <StatCard 
                        title="Produtos" 
                        value={moduleData.stats.products}
                        description="Total de produtos cadastrados" 
                        icon={BarChart3}
                        trend="up"
                        trendValue={`+${moduleData.stats.productGrowth} este mês`}
                      />
                    </>
                  )}
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Organizações Recentes</CardTitle>
                    <CardDescription>
                      Organizações que começaram a usar este módulo recentemente
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedModule.type.toLowerCase() === 'producao' ? (
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-yellow-100 text-yellow-800 font-semibold">
                              ME
                            </div>
                            <div>
                              <h4 className="font-semibold">MediCannabis Farma</h4>
                              <p className="text-sm text-muted-foreground">Plano Profissional</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">3 dias atrás</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <Building className="h-8 w-8 text-primary" />
                              <div>
                                <h4 className="font-semibold">Green Medical</h4>
                                <p className="text-sm text-muted-foreground">Plano Profissional</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">3 dias atrás</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <Building className="h-8 w-8 text-primary" />
                              <div>
                                <h4 className="font-semibold">Cultivar Brasil</h4>
                                <p className="text-sm text-muted-foreground">Plano Empresarial</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">1 semana atrás</span>
                            </div>
                          </div>
                        </>
                      )}
                      
                      <Button variant="outline" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Ver todas as organizações
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="organizacoes" className="mt-0">
                {selectedModule.type.toLowerCase() === 'producao' ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold">Organizações com o Módulo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-yellow-100 text-yellow-800 font-semibold">
                              ME
                            </div>
                            <div>
                              <h4 className="font-medium">MediCannabis Farma</h4>
                              <p className="text-sm text-muted-foreground">Plano Profissional</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">Ativo</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Organizações utilizando este módulo</CardTitle>
                      <CardDescription>
                        Total de {moduleData.stats.activeOrgs} organizações ativas de {moduleData.stats.totalOrgs} cadastradas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <div className="flex items-center justify-between p-4 bg-muted/30">
                          <div className="font-medium">Nome</div>
                          <div className="font-medium">Plano</div>
                          <div className="font-medium">Status</div>
                          <div className="font-medium">Data de ativação</div>
                          <div className="font-medium">Ações</div>
                        </div>
                        <div className="divide-y">
                          <div className="flex items-center justify-between p-4">
                            <div>Green Medical</div>
                            <div>Profissional</div>
                            <div><Badge className="bg-green-500 hover:bg-green-500/80">Ativo</Badge></div>
                            <div>15/03/2025</div>
                            <Button variant="ghost" size="sm">Detalhes</Button>
                          </div>
                          <div className="flex items-center justify-between p-4">
                            <div>Cultivar Brasil</div>
                            <div>Empresarial</div>
                            <div><Badge className="bg-green-500 hover:bg-green-500/80">Ativo</Badge></div>
                            <div>22/03/2025</div>
                            <Button variant="ghost" size="sm">Detalhes</Button>
                          </div>
                          <div className="flex items-center justify-between p-4">
                            <div>Instituto Verde</div>
                            <div>Básico</div>
                            <div><Badge className="bg-green-500 hover:bg-green-500/80">Ativo</Badge></div>
                            <div>28/02/2025</div>
                            <Button variant="ghost" size="sm">Detalhes</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="precos-planos" className="mt-0">
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {loadingPlans ? (
                      <div className="col-span-3 flex items-center justify-center h-40">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    ) : (
                      <>
                        {plans.map((plan) => (
                          <Card key={plan.id} className={plan.isPopular ? 'border-primary' : ''}>
                            {plan.isPopular && (
                              <div className="absolute top-0 right-0">
                                <Badge className="m-2 bg-primary hover:bg-primary">Mais popular</Badge>
                              </div>
                            )}
                            <CardHeader>
                              <CardTitle>{plan.name}</CardTitle>
                              <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="mb-4">
                                <span className="text-3xl font-bold">R$ {plan.price}</span>
                                <span className="text-muted-foreground">/{plan.billingCycle === 'monthly' ? 'mês' : 'ano'}</span>
                              </div>
                              <ul className="space-y-2">
                                {plan.features.map((feature, index) => (
                                  <li key={index} className="flex items-start">
                                    <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                              <div className="mt-4">
                                <Badge variant="outline" className="w-full justify-center py-1">
                                  Até {plan.maxUsers} usuários
                                </Badge>
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Button className="w-full" variant={plan.isPopular ? 'default' : 'outline'}>
                                Editar plano
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}

                        {plans.length === 0 && (
                          <div className="col-span-3 flex flex-col items-center justify-center p-6 border rounded-lg">
                            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-center text-muted-foreground">
                              Nenhum plano disponível para este módulo no momento.
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Histórico de Preços</CardTitle>
                      <CardDescription>
                        Acompanhe as alterações de preços dos planos deste módulo
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        <LineChart className="mr-2 h-5 w-5" />
                        Gráfico de histórico de preços será exibido aqui
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="configuracoes" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configurações do Módulo</CardTitle>
                      <CardDescription>
                        Personalize as configurações deste módulo
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between border-b pb-2">
                          <span>Disponível para novas organizações</span>
                          <Badge className="bg-green-500 hover:bg-green-500/80">Ativo</Badge>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span>Requer aprovação</span>
                          <Badge className="bg-green-500 hover:bg-green-500/80">Sim</Badge>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span>Documentação requerida</span>
                          <Badge variant="outline">Opcional</Badge>
                        </div>
                        <div className="flex justify-between pb-2">
                          <span>Versão</span>
                          <span className="font-medium">2.3.1</span>
                        </div>
                        <Button className="w-full mt-4">
                          <Settings className="mr-2 h-4 w-4" />
                          Editar Configurações
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Integrações</CardTitle>
                      <CardDescription>
                        Gerenciar integrações com outros sistemas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                          <div className="flex items-center gap-2">
                            <Building className="h-5 w-5 text-primary" />
                            <span>ERP Empresarial</span>
                          </div>
                          <Badge className="bg-green-500 hover:bg-green-500/80">Conectado</Badge>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-primary" />
                            <span>Sistema de Compras</span>
                          </div>
                          <Badge variant="outline">Desconectado</Badge>
                        </div>
                        <div className="flex justify-between items-center pb-2">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            <span>Business Intelligence</span>
                          </div>
                          <Badge className="bg-green-500 hover:bg-green-500/80">Conectado</Badge>
                        </div>
                        <Button variant="outline" className="w-full mt-4">
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar Integração
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Caso contrário, mostrar a lista de módulos
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Módulos do Sistema</h1>
            <p className="text-muted-foreground">
              Selecione um módulo para ver mais detalhes e planos disponíveis
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {modules.map((module) => {
              const ModuleIcon = moduleIcons[module.type.toLowerCase()] || AlertCircle;
              
              return (
                <div 
                  key={module.id}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigateToModule(module.id)}
                >
                  <div className="flex gap-4 items-start">
                    <ModuleIcon className="h-10 w-10 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{module.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{module.description}</p>
                      <div className="flex gap-2">
                        <Badge variant="outline">{module.type}</Badge>
                        {module.isActive ? (
                          <Badge className="bg-green-500 hover:bg-green-500/80">Ativo</Badge>
                        ) : (
                          <Badge variant="destructive">Inativo</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}