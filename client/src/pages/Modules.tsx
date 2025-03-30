import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, AlertCircle, ArrowLeft, ShoppingCart, Leaf, BarChart3, Heart, 
        Briefcase, Scale, Eye, Brain } from 'lucide-react';
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

export default function Modules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [plans, setPlans] = useState<ModulePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);
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
    
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <div className="flex flex-col space-y-6">
            <Button 
              variant="ghost" 
              className="w-fit flex items-center gap-2 mb-4"
              onClick={backToModulesList}
            >
              <ArrowLeft size={16} />
              Voltar para lista de módulos
            </Button>
            
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <ModuleIcon className="h-12 w-12 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">{selectedModule.name}</h1>
                <p className="text-muted-foreground">
                  {selectedModule.description}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="outline" className="px-3 py-1">
                {selectedModule.type}
              </Badge>
              {selectedModule.isActive ? (
                <Badge className="bg-green-500 hover:bg-green-500/80 px-3 py-1">Ativo</Badge>
              ) : (
                <Badge variant="destructive" className="px-3 py-1">Inativo</Badge>
              )}
            </div>
            
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Planos disponíveis</h3>
              
              {loadingPlans ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                          Escolher plano
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
                </div>
              )}
            </div>
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