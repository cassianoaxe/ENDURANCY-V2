"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Settings as SettingsIcon, 
  Globe, 
  Bell, 
  Key, 
  Mail, 
  Info, 
  Plug, 
  CreditCard, 
  MessageSquare,
  Brain,
  Truck,
  Link as Link2,
  Send,
  Mailbox,
  Plane
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import OrganizationLayout from "@/components/layout/OrganizationLayout";

export default function OrganizationSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const organizationId = user?.organizationId;
  
  // Estado para aba selecionada atualmente
  const [activeTab, setActiveTab] = useState("information");

  // Integrations data for the organization
  const integrations = [
    {
      id: "complychat",
      name: "COMPLYCHAT",
      category: "Comunicação",
      description: "Integração com canal de chat para comunicação interna e externa",
      icon: <MessageSquare size={24} className="text-primary" />,
      href: "/organization/integrations/complychat",
      active: true
    },
    {
      id: "whatsapp",
      name: "WHATSAPP",
      category: "Comunicação",
      description: "Envie mensagens automáticas e notificações para pacientes e clientes",
      icon: <MessageSquare size={24} className="text-primary" />,
      href: "/organization/integrations/whatsapp",
      active: false
    },
    {
      id: "melhor-envio",
      name: "MELHOR ENVIO",
      category: "Logística",
      description: "Calcule fretes e gerencie envios com as principais transportadoras",
      icon: <Send size={24} className="text-primary" />,
      href: "/organization/integrations/melhor-envio",
      active: false
    },
    {
      id: "azul-cargo",
      name: "AZUL CARGO",
      category: "Logística",
      description: "Integração direta com a Azul Cargo para envios aéreos rápidos",
      icon: <Plane size={24} className="text-primary" />,
      href: "/organization/integrations/azul-cargo", 
      active: false
    },
    {
      id: "correios",
      name: "CORREIOS",
      category: "Logística",
      description: "Integração com os Correios para cálculo de fretes e rastreamento",
      icon: <Mailbox size={24} className="text-primary" />,
      href: "/organization/integrations/correios",
      active: false
    }
  ];
  
  // Agrupar integrações por categoria
  const groupedIntegrations = integrations.reduce((acc: Record<string, any[]>, integration) => {
    const category = integration.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(integration);
    return acc;
  }, {});

  return (
    <OrganizationLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Configurações da Organização</h1>
        <p className="text-gray-600 mb-8">Configure preferências e integrações para sua organização.</p>

        <Tabs defaultValue="information" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="information">Informações</TabsTrigger>
            <TabsTrigger value="preferences">Preferências</TabsTrigger>
            <TabsTrigger value="integrations">Integrações</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
          </TabsList>

          <TabsContent value="information">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Organização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-gray-500">
                  Aqui você pode visualizar as informações básicas de sua organização.
                  Para alterá-las, entre em contato com o suporte.
                </p>
                
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">Verificação Pendente</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    Alguns documentos da sua organização ainda precisam ser validados. Acesse a seção "Documentos" para enviá-los.
                  </AlertDescription>
                </Alert>
                
                {/* Aqui poderíamos exibir informações da organização, como:
                   - Nome
                   - CNPJ/CPF
                   - Endereço
                   - Telefone
                   - Email
                   - Site
                   etc. */}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferências</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Aqui poderíamos colocar configurações de:
                   - Tema/Cores
                   - Fuso horário
                   - Formatos de data/número
                   - Idioma
                   etc. */}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plug className="h-5 w-5 mr-2" />
                  Integrações
                </CardTitle>
                <p className="text-sm text-gray-500 mt-2">
                  Configure integrações com serviços externos para aumentar a produtividade da sua organização.
                </p>
              </CardHeader>
              <CardContent className="space-y-8">
                {Object.entries(groupedIntegrations).map(([category, categoryIntegrations]) => (
                  <div key={category} className="space-y-4">
                    <h3 className="text-lg font-medium">{category}</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {categoryIntegrations.map((integration) => (
                        <Card key={integration.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center">
                                {integration.icon}
                                <div className="ml-3">
                                  <h4 className="font-medium">{integration.name}</h4>
                                  <p className="text-xs text-gray-500">{category}</p>
                                </div>
                              </div>
                              <Badge 
                                variant={integration.active ? "outline" : "secondary"}
                                className={integration.active ? "bg-green-50 text-green-700" : ""}
                              >
                                {integration.active ? "Ativo" : "Inativo"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
                            <div className="flex justify-end">
                              <Button 
                                variant="outline" 
                                size="sm"
                                asChild
                              >
                                <Link href={integration.href}>Configurar</Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Usuários e Permissões</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Aqui poderíamos colocar:
                   - Lista de usuários
                   - Atribuição de papéis
                   - Permissões específicas
                   etc. */}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Aqui poderíamos colocar configurações de:
                   - Preferências de notificações por email
                   - Preferências de notificações no sistema
                   - Alertas e lembretes
                   etc. */}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OrganizationLayout>
  );
}