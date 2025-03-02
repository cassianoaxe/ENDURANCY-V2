"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Globe, Bell, Key } from "lucide-react";

export default function Settings() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      <p className="text-gray-600 mb-8">Configure as preferências gerais do sistema.</p>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informações da Plataforma</h3>
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium">Nome da Plataforma</label>
                    <Input defaultValue="Endurancy" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">URL</label>
                    <Input defaultValue="https://endurancy.com" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Configurações Regionais</h3>
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium">Fuso Horário</label>
                    <Input defaultValue="America/Sao_Paulo" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Formato de Data</label>
                    <Input defaultValue="DD/MM/YYYY" />
                  </div>
                </div>
              </div>

              <Button>Salvar Alterações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tab contents would be similar */}
      </Tabs>
    </div>
  );
}
