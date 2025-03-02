"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Users, ArrowUpRight, Settings } from "lucide-react";

export default function Plans() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Planos</h1>
      <p className="text-gray-600 mb-8">Gerencie os planos e assinaturas disponíveis na plataforma.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Planos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              +1 novo plano este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assinantes Ativos</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +23 desde o último mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% desde o último mês
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Planos Disponíveis</CardTitle>
            <Button>
              <Settings className="mr-2 h-4 w-4" />
              Configurar Planos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {['Basic', 'Pro', 'Enterprise'].map((plan) => (
              <div key={plan} className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">{plan}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Descrição do plano e seus benefícios principais.
                </p>
                <div className="mb-4">
                  <span className="text-2xl font-bold">R$ 99</span>
                  <span className="text-gray-600">/mês</span>
                </div>
                <Button className="w-full" variant="outline">
                  Editar Plano
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
