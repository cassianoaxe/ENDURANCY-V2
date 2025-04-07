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
import { Package, Users, Truck, ArrowRight, BarChart4, Clock } from "lucide-react";

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
          <h1 className="text-2xl font-bold tracking-tight">Expedição</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie processos de expedição, pacientes e produtos.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Card Gerenciar Pacientes */}
          <Card className="overflow-hidden border-2 hover:border-green-500 transition-all duration-300 hover:shadow-md">
            <CardHeader className="bg-gray-50 dark:bg-gray-800 pb-2 flex flex-row items-center gap-2">
              <Users className="h-6 w-6 text-green-600" />
              <div>
                <CardTitle>Gerenciar Pacientes</CardTitle>
                <CardDescription>
                  Cadastre e gerencie informações dos pacientes
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    73
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-500">
                    Pacientes Ativos
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    12
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-500">
                    Novos este mês
                  </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    25
                  </div>
                  <div className="text-sm text-amber-700 dark:text-amber-500">
                    Aguardando Expedição
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Gerencie cadastros de pacientes, histórico médico e informações de contato. 
                Tenha acesso rápido aos dados para expedição de produtos.
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                  Cadastro completo de pacientes
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                  Histórico de prescrições e pedidos
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                  Acompanhamento de tratamentos
                </li>
              </ul>
            </CardContent>
            <CardFooter className="bg-gray-50 dark:bg-gray-800 pt-2">
              <Button 
                className="w-full" 
                onClick={() => navigateTo("/organization/gerenciar-pacientes")}
              >
                <Users className="mr-2 h-4 w-4" />
                Gerenciar Pacientes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Card Gerenciar Produtos */}
          <Card className="overflow-hidden border-2 hover:border-green-500 transition-all duration-300 hover:shadow-md">
            <CardHeader className="bg-gray-50 dark:bg-gray-800 pb-2 flex flex-row items-center gap-2">
              <Package className="h-6 w-6 text-green-600" />
              <div>
                <CardTitle>Gerenciar Produtos</CardTitle>
                <CardDescription>
                  Cadastre e gerencie o catálogo de produtos
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    56
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-500">
                    Produtos Ativos
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    8
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-500">
                    Categorias
                  </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    5
                  </div>
                  <div className="text-sm text-amber-700 dark:text-amber-500">
                    Estoque Baixo
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Gerencie o catálogo de produtos, controle de estoque e informações de preços.
                Tenha visibilidade completa para gerenciar seu inventário.
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                  Cadastro detalhado de produtos
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                  Controle de estoque e alertas
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                  Categorização e organização
                </li>
              </ul>
            </CardContent>
            <CardFooter className="bg-gray-50 dark:bg-gray-800 pt-2">
              <Button 
                className="w-full" 
                variant="secondary"
                onClick={() => navigateTo("/organization/gerenciar-produtos")}
              >
                <Package className="mr-2 h-4 w-4" />
                Gerenciar Produtos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Seção de Atividades Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Atividades Recentes de Expedição
            </CardTitle>
            <CardDescription>
              Últimas atualizações e atividades do módulo de Expedição
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                    i % 3 === 0 ? "bg-green-500" :
                    i % 3 === 1 ? "bg-blue-500" :
                    "bg-amber-500"
                  }`}>
                    {i % 3 === 0 ? <Truck size={14} /> :
                     i % 3 === 1 ? <Package size={14} /> :
                     <Users size={14} />
                    }
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {i % 3 === 0 
                        ? 'Pedido #' + (1000+i) + ' expedido para Paciente ' + i
                        : i % 3 === 1 
                        ? 'Estoque atualizado: Produto ' + i + ' - ' + (10 + i) + ' unidades'
                        : 'Cadastro atualizado: Paciente ' + i
                      }
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        {(30-i*4)} minutos atrás
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cards informativos */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Status de Expedição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Pedidos em Fila</span>
                    <span>12/30</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Em Expedição</span>
                    <span>8/20</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Concluídos Hoje</span>
                    <span>16/40</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Estatísticas de Entrega</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-800">98%</div>
                  <div className="text-xs text-gray-500">Entregues no Prazo</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-800">24h</div>
                  <div className="text-xs text-gray-500">Tempo Médio</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-800">128</div>
                  <div className="text-xs text-gray-500">Entregas este mês</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-800">4.9</div>
                  <div className="text-xs text-gray-500">Avaliação Média</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Eficiência de Expedição</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-[180px] flex items-center justify-center bg-gray-50 rounded">
                <BarChart4 className="h-full w-full text-gray-300" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </OrganizationLayout>
  );
}