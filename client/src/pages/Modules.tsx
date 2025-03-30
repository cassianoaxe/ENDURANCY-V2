import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Module, ModulePlan } from '@/../../shared/schema';
import { useToast } from '@/hooks/use-toast';

export default function Modules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [plans, setPlans] = useState<ModulePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const { toast } = useToast();
  
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
      
      // Selecionar o primeiro módulo automaticamente se houver
      if (data.length > 0) {
        setSelectedModule(data[0]);
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
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Módulos do Sistema</h1>
            <p className="text-muted-foreground">
              Explore os módulos disponíveis e seus respectivos planos de assinatura
            </p>
          </div>
          
          <Tabs defaultValue={selectedModule?.type} onValueChange={(value) => {
            const module = modules.find(m => m.type === value);
            if (module) setSelectedModule(module);
          }}>
            <div className="border rounded-lg p-1 mb-6">
              <TabsList className="w-full grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {modules.map((module) => (
                  <TabsTrigger key={module.id} value={module.type}>
                    {module.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            {modules.map((module) => (
              <TabsContent key={module.id} value={module.type}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h2 className="text-2xl font-bold">{module.name}</h2>
                      <p className="mt-2 text-muted-foreground">{module.description}</p>
                      
                      <div className="mt-4">
                        <Badge variant="outline" className="mr-2">
                          {module.type}
                        </Badge>
                        {module.isActive ? (
                          <Badge className="bg-green-500 hover:bg-green-500/80">Ativo</Badge>
                        ) : (
                          <Badge variant="destructive">Inativo</Badge>
                        )}
                      </div>
                    </div>
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
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}