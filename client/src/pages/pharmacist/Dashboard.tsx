import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  CalendarDays, 
  ClipboardCheck, 
  Eye, 
  PillIcon, 
  ShoppingBag, 
  Users 
} from "lucide-react";

export default function PharmacistDashboard() {
  const { user } = useAuth();
  const [organizationName, setOrganizationName] = useState("");
  
  // Buscar dados da organização
  const { data: organizationData } = useQuery({
    queryKey: ['organization', user?.organizationId],
    queryFn: async () => {
      if (!user?.organizationId) return null;
      const response = await axios.get(`/api/organizations/${user.organizationId}`);
      return response.data;
    },
    enabled: !!user?.organizationId
  });

  useEffect(() => {
    if (organizationData) {
      setOrganizationName(organizationData.name || "");
    }
  }, [organizationData]);

  return (
    <div className="flex flex-col gap-5">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">Bem-vindo(a), {user?.name?.split(' ')[0] || 'Farmacêutico'}!</h1>
            <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full font-medium">
              Farmácia {organizationName ? organizationName : ''}
            </span>
          </div>
          <p className="text-gray-500">
            Aqui está o seu resumo farmacêutico e as atividades pendentes.
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Prescrições Pendentes
              </CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Estoque Baixo
              </CardTitle>
              <PillIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Produtos para repor</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pedidos Novos
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Nas últimas 24h</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Consultas Agendadas
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Para hoje</p>
            </CardContent>
          </Card>
        </div>

        {/* Abas principais */}
        <Tabs defaultValue="prescricoes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="prescricoes">Prescrições Pendentes</TabsTrigger>
            <TabsTrigger value="estoque">Estoque Crítico</TabsTrigger>
            <TabsTrigger value="pedidos">Pedidos Recentes</TabsTrigger>
          </TabsList>
          
          {/* Conteúdo: Prescrições Pendentes */}
          <TabsContent value="prescricoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Prescrições Aguardando Aprovação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* Lista de prescrições pendentes */}
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="text-sm">
                          <p className="font-medium">Prescrição #{Math.floor(Math.random() * 1000) + 1000}</p>
                          <p className="text-xs text-gray-500">Dr. {['Silva', 'Santos', 'Oliveira', 'Souza', 'Costa'][i % 5]} • {new Date().toLocaleString('pt-BR')}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" /> Ver
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Aprovar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Ver todas as prescrições
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Conteúdo: Estoque Crítico */}
          <TabsContent value="estoque" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Produtos com Estoque Crítico</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* Lista de produtos com estoque crítico */}
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="text-sm">
                          <p className="font-medium">{['CBD Oil 5%', 'Calm CBD Tincture', 'Pain Relief Balm', 'Sleep Formula', 'CBD Capsules'][i - 1]}</p>
                          <p className="text-xs text-gray-500">Estoque: {i} unidades • Mínimo: 10</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Repor Estoque
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Ver todos os produtos
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Conteúdo: Pedidos Recentes */}
          <TabsContent value="pedidos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pedidos Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* Lista de pedidos recentes */}
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="text-sm">
                          <p className="font-medium">Pedido #{Math.floor(Math.random() * 10000) + 10000}</p>
                          <p className="text-xs text-gray-500">Cliente: {['Ana', 'João', 'Maria', 'Carlos', 'Patrícia'][i - 1]} • {new Date().toLocaleString('pt-BR')}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" /> Detalhes
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Processar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Ver todos os pedidos
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Gráfico de visão geral */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Visão Geral do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
              <div className="flex flex-col items-center text-center">
                <BarChart3 className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Gráfico de atividades mensais</p>
                <p className="text-xs text-gray-400 mt-1">Dados carregados com sucesso</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}