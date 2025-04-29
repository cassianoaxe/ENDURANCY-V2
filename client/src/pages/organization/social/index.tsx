import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { OrganizationLayout } from "@/components/layout/OrganizationLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, Users, UserPlus, HandCoins, Target, Receipt, 
  ArrowUpRight, ArrowDownRight, Calendar, HeartHandshake,
  Info, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SocialDashboard() {
  const [stats, setStats] = useState({
    beneficiariesCount: 0,
    donationsTotal: 0,
    expensesTotal: 0,
    campaignsCount: 0,
    volunteersCount: 0,
    upcomingEvents: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data
  const { data, error, isLoading: queryLoading } = useQuery({
    queryKey: ['/api/social/dashboard'],
    // Temporary: add retry false until backend is implemented
    retry: false,
    enabled: true,
  });

  useEffect(() => {
    // Temporary: set mock data until backend is implemented
    setTimeout(() => {
      setStats({
        beneficiariesCount: 142,
        donationsTotal: 35750.25,
        expensesTotal: 28450.75,
        campaignsCount: 3,
        volunteersCount: 28,
        upcomingEvents: 2
      });
      setIsLoading(false);
    }, 800);
  }, []);

  return (
    <OrganizationLayout>
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Módulo Social</h1>
          <Button variant="outline" className="gap-2">
            <Calendar size={16} />
            Eventos
          </Button>
        </div>
        
        <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
          <HeartHandshake className="h-4 w-4 text-red-500" />
          <AlertTitle>Módulo Social para Associações</AlertTitle>
          <AlertDescription>
            Este módulo permite a gestão completa de beneficiários, doações, despesas e campanhas para sua associação.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Beneficiários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-3/4 bg-muted animate-pulse rounded"></div>
              ) : (
                <div className="text-2xl font-bold">{stats.beneficiariesCount}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Pessoas beneficiadas pelas ações
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doações Recebidas</CardTitle>
              <HandCoins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-3/4 bg-muted animate-pulse rounded"></div>
              ) : (
                <div className="text-2xl font-bold">
                  R$ {stats.donationsTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              )}
              <div className="flex items-center pt-1">
                <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">
                  +12.5% desde o mês passado
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-3/4 bg-muted animate-pulse rounded"></div>
              ) : (
                <div className="text-2xl font-bold">
                  R$ {stats.expensesTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              )}
              <div className="flex items-center pt-1">
                <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                <span className="text-xs text-red-500">
                  +5.2% desde o mês passado
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="beneficiaries">Beneficiários</TabsTrigger>
            <TabsTrigger value="donations">Doações</TabsTrigger>
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Fluxo Financeiro</CardTitle>
                  <CardDescription>
                    Visualize as doações recebidas e despesas realizadas
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <div className="h-full w-full flex items-center justify-center bg-muted/20 rounded-md">
                    <BarChart3 className="h-12 w-12 text-muted" />
                    <span className="ml-2 text-muted">Gráfico de fluxo financeiro</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Dados Recentes</CardTitle>
                  <CardDescription>
                    Últimas atividades do módulo social
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoading ? (
                      Array(3).fill(0).map((_, i) => (
                        <div key={i} className="flex flex-col space-y-2">
                          <div className="h-4 w-3/4 bg-muted animate-pulse rounded"></div>
                          <div className="h-3 w-1/2 bg-muted animate-pulse rounded"></div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-center justify-between border-b pb-2">
                          <div>
                            <p className="font-medium">Nova doação recebida</p>
                            <p className="text-sm text-muted-foreground">R$ 2.500,00 - Maria Silva</p>
                          </div>
                          <div className="text-sm text-muted-foreground">Hoje</div>
                        </div>
                        <div className="flex items-center justify-between border-b pb-2">
                          <div>
                            <p className="font-medium">Novo beneficiário cadastrado</p>
                            <p className="text-sm text-muted-foreground">João Costa - São Paulo</p>
                          </div>
                          <div className="text-sm text-muted-foreground">Ontem</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Campanha criada</p>
                            <p className="text-sm text-muted-foreground">Campanha de Inverno 2025</p>
                          </div>
                          <div className="text-sm text-muted-foreground">3 dias atrás</div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full" disabled={isLoading}>
                    Ver todas as atividades
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-8 w-3/4 bg-muted animate-pulse rounded"></div>
                  ) : (
                    <div className="text-2xl font-bold">{stats.campaignsCount}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Campanhas em andamento
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Voluntários</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-8 w-3/4 bg-muted animate-pulse rounded"></div>
                  ) : (
                    <div className="text-2xl font-bold">{stats.volunteersCount}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Pessoas voluntárias cadastradas
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-8 w-3/4 bg-muted animate-pulse rounded"></div>
                  ) : (
                    <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Eventos programados 
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="beneficiaries" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Beneficiários</CardTitle>
                <CardDescription>
                  Gerenciamento de pessoas beneficiadas pela associação
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full flex flex-col items-center justify-center bg-muted/20 rounded-md">
                  <Users className="h-12 w-12 text-muted mb-4" />
                  <span className="text-muted">Dados de beneficiários serão exibidos aqui</span>
                  <Button className="mt-4" variant="outline" onClick={() => window.location.href="/organization/social/beneficiarios"}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Ver todos os beneficiários
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="donations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Doações</CardTitle>
                <CardDescription>
                  Histórico e detalhamento de doações recebidas
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full flex flex-col items-center justify-center bg-muted/20 rounded-md">
                  <HandCoins className="h-12 w-12 text-muted mb-4" />
                  <span className="text-muted">Dados de doações serão exibidos aqui</span>
                  <Button className="mt-4" variant="outline" onClick={() => window.location.href="/organization/social/doacoes"}>
                    Ver todas as doações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="campaigns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Campanhas</CardTitle>
                <CardDescription>
                  Campanhas de arrecadação e divulgação
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full flex flex-col items-center justify-center bg-muted/20 rounded-md">
                  <Target className="h-12 w-12 text-muted mb-4" />
                  <span className="text-muted">Dados de campanhas serão exibidos aqui</span>
                  <Button className="mt-4" variant="outline" onClick={() => window.location.href="/organization/social/campanhas"}>
                    Ver todas as campanhas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
}