"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, PhoneCall, Timer, Bell } from "lucide-react";

export default function Emergencies() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Emergências</h1>
          <p className="text-gray-600">Monitore e gerencie situações de emergência.</p>
        </div>
        <Button variant="destructive">
          <AlertTriangle className="mr-2 h-4 w-4" />
          Acionar Emergência
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status Atual</CardTitle>
            <Bell className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Normal</div>
            <p className="text-xs text-muted-foreground">
              Nenhuma emergência ativa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Última Emergência</CardTitle>
            <Timer className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15 dias atrás</div>
            <p className="text-xs text-muted-foreground">
              Resolvida em 45 minutos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Contatos de Emergência</CardTitle>
            <PhoneCall className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 disponíveis</div>
            <p className="text-xs text-muted-foreground">
              Última verificação: hoje
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Protocolos de Emergência</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((protocol) => (
              <div key={protocol} className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Protocolo {protocol}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Descrição do protocolo de emergência e passos a serem seguidos.
                </p>
                <Button variant="outline" size="sm">Ver Detalhes</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
