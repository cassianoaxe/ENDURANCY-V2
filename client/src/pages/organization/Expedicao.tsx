import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import OrganizationLayout from "@/components/layout/OrganizationLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Truck, 
  ArrowRight, 
  BarChart4, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  FileText, 
  Printer, 
  QrCode, 
  Box,
  CalendarCheck, 
  AlertTriangle,
  MapPin,
  ListChecks
} from "lucide-react";

export default function Expedicao() {
  const { user } = useAuth();

  // Função para navegação entre páginas
  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
  };

  return (
    <OrganizationLayout>
      <div className="container py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard de Expedição</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe o status de pedidos, malotes e entregas
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Pedidos Hoje</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-3xl font-bold">24</span>
                  <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-full flex items-center">
                    <ArrowRight className="h-3 w-3 rotate-45 mr-1" />
                    12% em relação a ontem
                  </span>
                </div>
                <div className="mt-4 text-amber-600 text-xs">
                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                  5 pedidos urgentes
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Pedidos Aguardando</span>
                <div className="mt-1">
                  <span className="text-3xl font-bold">18</span>
                </div>
                <div className="flex justify-between mt-4 text-xs">
                  <span className="text-blue-600 font-medium">
                    <Clock className="h-3 w-3 inline mr-1" />
                    12 em preparação
                  </span>
                  <span className="text-amber-600 font-medium">
                    <CheckCircle2 className="h-3 w-3 inline mr-1" />
                    6 em revisão
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Malotes Enviados</span>
                <div className="mt-1">
                  <span className="text-3xl font-bold">4</span>
                </div>
                <div className="mt-4 text-blue-600 text-xs">
                  <Box className="h-3 w-3 inline mr-1" />
                  45 pedidos processados
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Taxa de Entrega</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-3xl font-bold">97%</span>
                  <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-full flex items-center">
                    <ArrowRight className="h-3 w-3 rotate-45 mr-1" />
                    2% em relação ao mês anterior
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full mt-3">
                  <div className="h-2 bg-green-500 rounded-full" style={{ width: "97%" }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs e gráficos */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="packages">Malotes</TabsTrigger>
            <TabsTrigger value="tracking">Rastreamento</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Desempenho Semanal */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium">Desempenho Semanal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative h-[300px] w-full">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-full flex flex-col">
                        {/* Simulação de um gráfico de barras */}
                        <div className="flex-1 flex items-end justify-between gap-1 px-2">
                          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, i) => (
                            <div key={day} className="flex flex-col items-center gap-1 w-full">
                              <div className="relative w-full">
                                <div 
                                  className="w-full bg-blue-500 rounded-t"
                                  style={{ 
                                    height: `${[60, 75, 82, 100, 65, 40, 20][i]}%`,
                                  }}
                                ></div>
                                <div 
                                  className="w-full bg-green-400 rounded-t absolute bottom-0 left-0"
                                  style={{ 
                                    height: `${[50, 55, 65, 80, 50, 30, 10][i]}%`,
                                    zIndex: 1
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500">{day}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex items-center justify-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                            <span className="text-xs text-gray-500">Pedidos</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-400 rounded"></div>
                            <span className="text-xs text-gray-500">Entregas</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status de Pedidos */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium">Status de Pedidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Em preparação</span>
                        <span className="text-sm font-medium">8 pedidos</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full">
                        <div className="h-2 bg-amber-400 rounded-full" style={{ width: "30%" }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Em revisão</span>
                        <span className="text-sm font-medium">4 pedidos</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full">
                        <div className="h-2 bg-blue-500 rounded-full" style={{ width: "15%" }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Documentação</span>
                        <span className="text-sm font-medium">6 pedidos</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full">
                        <div className="h-2 bg-purple-500 rounded-full" style={{ width: "22%" }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Aguardando despacho</span>
                        <span className="text-sm font-medium">9 pedidos</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full">
                        <div className="h-2 bg-green-500 rounded-full" style={{ width: "33%" }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pedidos Prioritários */}
              <Card>
                <CardHeader className="pb-3 flex justify-between items-center">
                  <CardTitle className="text-lg font-medium">Pedidos Prioritários</CardTitle>
                  <Button variant="outline" size="sm">Ver todos</Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div className="flex items-center">
                          <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">PED-123{i}5</div>
                            <div className="text-xs text-muted-foreground">
                              {i === 1 ? "Aguardando documentação" : 
                               i === 2 ? "Em preparação" : 
                               "Em revisão"}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full font-medium">
                          Urgente
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Rastreios Recentes */}
              <Card>
                <CardHeader className="pb-3 flex justify-between items-center">
                  <CardTitle className="text-lg font-medium">Rastreios Recentes</CardTitle>
                  <Button variant="outline" size="sm">Atualizar rastreios</Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div className="flex items-center">
                          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <Truck className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">LE{i}234567890BR</div>
                            <div className="text-xs text-muted-foreground">
                              {i === 1 ? "Em trânsito - São Paulo, SP" : 
                               i === 2 ? "Saiu para entrega" : 
                               "Entregue - 12:45"}
                            </div>
                          </div>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                          i === 1 ? "bg-blue-50 text-blue-700" : 
                          i === 2 ? "bg-amber-50 text-amber-700" : 
                          "bg-green-50 text-green-700"
                        }`}>
                          {i === 1 ? "Em trânsito" : 
                           i === 2 ? "Em entrega" : 
                           "Entregue"}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="orders">
            <div className="text-center py-6">
              <p className="text-muted-foreground">Conteúdo da aba Pedidos</p>
            </div>
          </TabsContent>
          
          <TabsContent value="packages">
            <div className="text-center py-6">
              <p className="text-muted-foreground">Conteúdo da aba Malotes</p>
            </div>
          </TabsContent>
          
          <TabsContent value="tracking">
            <div className="text-center py-6">
              <p className="text-muted-foreground">Conteúdo da aba Rastreamento</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Módulos de Expedição */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Módulos de Expedição</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[
              { title: "Dashboard Expedição", icon: <BarChart4 size={20} />, path: "/organization/expedicao" },
              { title: "Mapa BI", icon: <MapPin size={20} />, path: "/organization/expedicao/mapa-bi" },
              { title: "Preparação de Pedidos", icon: <ListChecks size={20} />, path: "/organization/expedicao/pedidos" },
              { title: "Etiquetas", icon: <Printer size={20} />, path: "/organization/expedicao/etiquetas" },
              { title: "Leitura de Códigos", icon: <QrCode size={20} />, path: "/organization/expedicao/codigos" },
              { title: "Documentação", icon: <FileText size={20} />, path: "/organization/expedicao/documentacao" },
              { title: "Junção de Pedidos", icon: <Box size={20} />, path: "/organization/expedicao/juncao" },
              { title: "Registro de Malotes", icon: <Package size={20} />, path: "/organization/expedicao/malotes" },
              { title: "Atualização de Rastreios", icon: <Truck size={20} />, path: "/organization/expedicao/rastreios" },
              { title: "Estoque da Expedição", icon: <Package size={20} />, path: "/organization/expedicao/estoque" }
            ].map((module, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigateTo(module.path)}
              >
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center mb-3">
                    {React.cloneElement(module.icon, { className: "text-green-600" })}
                  </div>
                  <h3 className="text-sm font-medium">{module.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </OrganizationLayout>
  );
}