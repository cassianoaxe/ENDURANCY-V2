import React, { useState } from 'react';
import OrganizationLayout from '@/components/layout/OrganizationLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  GraduationCap, BookOpen, BarChart3, Clock, ArrowRight, 
  FileText, Leaf, Users, PackageSearch, DollarSign, Scale, 
  CheckCircle2, ArrowUpRight, ClipboardList, Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

const OnboardingOverview = () => {
  const modules = [
    {
      title: "Começando",
      description: "Introdução à plataforma e conceitos básicos",
      icon: GraduationCap,
      duration: "10 min",
      progress: 0,
      path: "/organization/onboarding/GettingStarted"
    },
    {
      title: "Módulo Cultivo",
      description: "Gestão completa do processo de cultivo",
      icon: Leaf,
      duration: "25 min",
      progress: 0,
      path: "/organization/onboarding/Cultivation"
    },
    {
      title: "Módulo Produção",
      description: "Controle do processo produtivo",
      icon: PackageSearch,
      duration: "30 min",
      progress: 0,
      path: "/organization/onboarding/Production"
    },
    {
      title: "Dispensário",
      description: "Gerenciamento de dispensário e ponto de venda",
      icon: PackageSearch,
      duration: "20 min",
      progress: 0
    },
    {
      title: "Gestão de Pacientes/Associados",
      description: "Administração de pacientes, clientes ou associados",
      icon: Users,
      duration: "15 min",
      progress: 0
    },
    {
      title: "Módulo Financeiro",
      description: "Controle financeiro e gestão contábil",
      icon: DollarSign,
      duration: "25 min",
      progress: 0
    },
    {
      title: "Módulo Jurídico",
      description: "Gerenciamento legal e compliance",
      icon: Scale,
      duration: "20 min",
      progress: 0
    },
    {
      title: "Gestão de Tarefas",
      description: "Organização e acompanhamento de tarefas",
      icon: ClipboardList,
      duration: "15 min",
      progress: 0
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Onboarding</h1>
          <p className="text-gray-500">Aprenda a utilizar todos os recursos da plataforma</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium">Total: 3h 20min</span>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Guia Completo (PDF)</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                  <module.icon size={20} />
                </div>
                <div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <CardDescription className="mt-1">{module.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="flex items-center justify-between mb-2 text-sm">
                <div className="flex items-center gap-1 text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>{module.duration}</span>
                </div>
                <span className="text-gray-500">{module.progress}% completo</span>
              </div>
              <Progress value={module.progress} className="h-1.5 mb-4" />
            </CardContent>
            <CardFooter className="p-0">
              <Button 
                variant="ghost" 
                className="w-full rounded-none h-12 text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2"
                onClick={() => {
                  if (module.path) window.location.href = module.path;
                }}
              >
                Começar <ArrowRight size={16} />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

const Tutorials = () => {
  const moduleCategories = [
    { id: "intro", name: "Módulo de Introdução", active: true },
    { id: "cultivation", name: "Módulo de Cultivo", active: false },
    { id: "management", name: "Módulo de Gestão", active: false },
  ];

  const tutorials = [
    {
      id: 1,
      title: "Introdução à Plataforma",
      description: "Visão geral das funcionalidades e módulos",
      duration: "10 min",
      category: "intro",
    },
    {
      id: 2,
      title: "Fundamentos do Cultivo",
      description: "Aprenda a gerenciar o ciclo completo de cultivo",
      duration: "15 min",
      category: "intro",
    },
    {
      id: 3,
      title: "Controle de Qualidade na Produção",
      description: "Processos de garantia de qualidade na produção",
      duration: "20 min",
      category: "intro",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tutoriais</h1>
          <p className="text-gray-500">Acesse tutoriais detalhados para cada módulo da plataforma</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input placeholder="Buscar tutoriais..." className="pl-9" />
        </div>
      </div>

      <div className="flex gap-2 border-b pb-2">
        {moduleCategories.map((category) => (
          <Button 
            key={category.id}
            variant={category.active ? "default" : "ghost"} 
            className={cn("gap-2", category.active ? "bg-black text-white" : "text-gray-600")}
          >
            <FileText className="h-4 w-4" />
            {category.name}
          </Button>
        ))}
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-500" />
            <h2 className="text-xl font-bold">Módulo de Introdução</h2>
          </div>
          <p className="text-gray-500">Este módulo abrange os conceitos básicos da plataforma.</p>
          <div className="flex items-center gap-2 text-sm mt-1">
            <div className="font-medium">70%</div>
            <Progress value={70} className="h-2 w-28" />
            <div className="text-gray-500">0/3 tutoriais</div>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {tutorials.map((tutorial) => (
            <Card key={tutorial.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4 items-start h-full">
                  <div className="flex-1 space-y-3">
                    <h3 className="font-bold">{tutorial.title}</h3>
                    <p className="text-sm text-gray-500">{tutorial.description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-auto pt-3">
                      <Clock className="h-4 w-4" />
                      <span>{tutorial.duration}</span>
                    </div>
                  </div>
                  <Button variant="secondary" className="bg-black text-white hover:bg-gray-800">
                    <span>Iniciar</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const MyProgress = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const recentActivities = [
    {
      id: 1,
      title: "Fundamentos do Cultivo",
      module: "Módulo Cultivo",
      status: "Concluído",
      date: "528 dias atrás",
      completed: true,
    },
    {
      id: 2,
      title: "Controle de Qualidade",
      module: "Módulo Produção",
      status: "Iniciado",
      date: "530 dias atrás",
      completed: false,
    },
    {
      id: 3,
      title: "Introdução ao Dispensário",
      module: "Dispensário",
      status: "Concluído",
      date: "532 dias atrás",
      completed: true,
    },
  ];

  const recommendations = [
    {
      id: 1,
      title: "Gestão da Qualidade na Produção",
      module: "Módulo Produção",
      duration: "12 min",
    },
    {
      id: 2,
      title: "Rastreamento de Lotes",
      module: "Módulo Cultivo",
      duration: "5 min",
    },
    {
      id: 3,
      title: "Gestão de Estoque no Dispensário",
      module: "Dispensário",
      duration: "8 min",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meu Progresso</h1>
          <p className="text-gray-500">Acompanhe seu progresso nos treinamentos</p>
        </div>
        <Button className="bg-black text-white hover:bg-gray-800 flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          <span>Continuar Aprendendo</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-50 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="modules" className="data-[state=active]:bg-white">
            Módulos
          </TabsTrigger>
          <TabsTrigger value="certificates" className="data-[state=active]:bg-white">
            Certificados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-gray-500 text-sm mb-1">Progresso Geral</h3>
                <div className="text-4xl font-bold mb-1">33%</div>
                <div className="text-xs text-gray-500 mb-2">12/36 tutoriais</div>
                <Progress value={33} className="h-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-gray-500 text-sm mb-1">Módulos Concluídos</h3>
                <div className="text-4xl font-bold mb-1">2</div>
                <div className="text-xs text-gray-500 mb-1">de 8 módulos</div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>25% concluído</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-gray-500 text-sm mb-1">Tempo Médio</h3>
                <div className="text-4xl font-bold mb-1">8.5</div>
                <div className="text-xs text-gray-500 mb-1">minutos por tutorial</div>
                <div className="flex items-center gap-1 text-sm text-blue-600">
                  <Clock className="h-4 w-4" />
                  <span>Bom ritmo de aprendizado</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-gray-500 text-sm mb-1">Certificados</h3>
                <div className="text-4xl font-bold mb-1">1</div>
                <div className="text-xs text-gray-500 mb-1">conquistados</div>
                <div className="flex items-center gap-1 text-sm text-amber-600">
                  <GraduationCap className="h-4 w-4" />
                  <span>7 disponíveis para conquistar</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start justify-between p-4 border-b last:border-0">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "rounded-full w-10 h-10 flex items-center justify-center",
                          activity.completed ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                        )}>
                          {activity.completed ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <BookOpen className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{activity.title}</h3>
                          <p className="text-sm text-gray-500">{activity.module}</p>
                          <div className={cn(
                            "text-xs px-2 py-0.5 rounded-full inline-block mt-1",
                            activity.completed ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                          )}>
                            {activity.status}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">{activity.date}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recomendado para Você</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {recommendations.map((recommendation) => (
                    <div key={recommendation.id} className="flex flex-col p-4 border-b last:border-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium">{recommendation.title}</h3>
                        <ArrowUpRight className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">{recommendation.module}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Clock className="h-4 w-4" />
                        <span>{recommendation.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="modules">
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <h3 className="font-medium mb-2">Vista dos Módulos</h3>
            <p className="text-gray-500 text-sm">Veja informações detalhadas sobre seu progresso em cada módulo</p>
          </div>
        </TabsContent>

        <TabsContent value="certificates">
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <h3 className="font-medium mb-2">Seus Certificados</h3>
            <p className="text-gray-500 text-sm">Visualize e baixe seus certificados de conclusão</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default function Onboarding() {
  const [activeTab, setActiveTab] = useState("overview");

  const menuItems = [
    {
      id: "overview",
      name: "Visão Geral",
      icon: GraduationCap
    },
    {
      id: "tutorials",
      name: "Tutoriais",
      icon: BookOpen
    },
    {
      id: "progress",
      name: "Meu Progresso",
      icon: BarChart3
    }
  ];

  return (
    <OrganizationLayout>
      <div className="container px-6 py-4">
        <div className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="w-full bg-transparent p-0 space-x-8">
              {menuItems.map((item) => (
                <TabsTrigger 
                  key={item.id}
                  value={item.id} 
                  className="flex items-center gap-2 border-b-2 rounded-none px-1 py-2 text-base border-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="overview" className="pt-4">
              <OnboardingOverview />
            </TabsContent>
            
            <TabsContent value="tutorials" className="pt-4">
              <Tutorials />
            </TabsContent>
            
            <TabsContent value="progress" className="pt-4">
              <MyProgress />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </OrganizationLayout>
  );
}