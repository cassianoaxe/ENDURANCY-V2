"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plug, 
  MessageSquare, 
  Send, 
  Mailbox, 
  Plane, 
  CreditCard, 
  Brain, 
  Truck, 
  Check, 
  ArrowRight 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

// Simulação de dados para integração
const integrations = [
  {
    id: "complychat",
    name: "COMPLYCHAT",
    category: "Comunicação",
    description: "Integração com canal de chat para comunicação interna e externa",
    icon: <MessageSquare size={24} className="text-primary" />,
    link: "/organization/settings/integracoes/complychat",
    active: true,
    about: "ComplyChat é a solução de comunicação integrada ao sistema. Permite comunicação segura e compliant com pacientes, médicos e colaboradores.",
    features: [
      "Chat em tempo real",
      "Histórico completo de conversas",
      "Compartilhamento de documentos",
      "Templates de mensagens",
      "Notificações automáticas"
    ]
  },
  {
    id: "whatsapp",
    name: "WHATSAPP",
    category: "Comunicação",
    description: "Envie mensagens automáticas e notificações para pacientes e clientes",
    icon: <MessageSquare size={24} className="text-primary" />,
    link: "/organization/settings/integracoes/whatsapp",
    active: false,
    about: "Conecte o WhatsApp Business API à sua conta para enviar notificações automáticas, lembretes de consulta e informações importantes para pacientes e clientes.",
    features: [
      "Envio de mensagens automáticas",
      "Notificações de consultas e eventos",
      "Campanhas personalizadas",
      "Atendimento via WhatsApp",
      "Relatórios de entrega"
    ]
  },
  {
    id: "melhor-envio",
    name: "MELHOR ENVIO",
    category: "Logística",
    description: "Calcule fretes e gerencie envios com as principais transportadoras",
    icon: <Send size={24} className="text-primary" />,
    link: "/organization/settings/integracoes/melhor-envio",
    active: false,
    about: "Melhor Envio permite calcular fretes e contratar serviços de entrega com as principais transportadoras do Brasil, tudo integrado ao seu sistema.",
    features: [
      "Cálculo automático de fretes",
      "Comparativo entre transportadoras",
      "Geração de etiquetas",
      "Rastreamento de entregas",
      "Dashboard de envios"
    ]
  },
  {
    id: "azul-cargo",
    name: "AZUL CARGO",
    category: "Logística",
    description: "Integração direta com a Azul Cargo para envios aéreos rápidos",
    icon: <Plane size={24} className="text-primary" />,
    link: "/organization/settings/integracoes/azul-cargo", 
    active: false,
    about: "Integração com a Azul Cargo para envios aéreos rápidos e seguros para todo o Brasil, ideal para produtos que necessitam de entrega expressa.",
    features: [
      "Cotações em tempo real",
      "Agendamento de coletas",
      "Rastreamento aéreo",
      "Atendimento prioritário",
      "Cobertura nacional"
    ]
  },
  {
    id: "correios",
    name: "CORREIOS",
    category: "Logística",
    description: "Integração com os Correios para cálculo de fretes e rastreamento",
    icon: <Mailbox size={24} className="text-primary" />,
    link: "/organization/settings/integracoes/correios",
    active: false,
    about: "Conecte-se diretamente aos serviços dos Correios para cálculo de fretes, geração de etiquetas e rastreamento de encomendas em todo o território nacional.",
    features: [
      "Cálculo de fretes SEDEX e PAC",
      "Rastreamento integrado",
      "Geração de etiquetas",
      "Aviso de recebimento",
      "Relatórios de postagem"
    ]
  },
  {
    id: "asaas",
    name: "ASAAS",
    category: "Pagamentos",
    description: "Integração com Asaas para gerenciamento de cobranças e pagamentos",
    icon: <CreditCard size={24} className="text-primary" />,
    link: "/organization/settings/integracoes/asaas", 
    active: false,
    about: "Asaas é uma plataforma completa para gerenciamento de cobranças e recebimentos, com suporte a boletos, cartões, Pix e mais.",
    features: [
      "Cobrança via boleto, cartão e Pix",
      "Assinaturas recorrentes",
      "Split de pagamentos",
      "Antecipação de recebíveis",
      "Conciliação automática"
    ]
  },
  {
    id: "zoop",
    name: "ZOOP",
    category: "Pagamentos",
    description: "Processamento de pagamentos com cartão, boleto e Pix",
    icon: <CreditCard size={24} className="text-primary" />,
    link: "/organization/settings/integracoes/zoop", 
    active: false,
    about: "Zoop é uma plataforma completa de pagamentos que permite processar transações com cartão, boleto, Pix e outros meios de pagamento.",
    features: [
      "Gateway de pagamentos completo",
      "Tokenização de cartões",
      "Split de pagamentos",
      "Pagamentos recorrentes",
      "API flexível"
    ]
  },
  {
    id: "chatgpt",
    name: "CHATGPT",
    category: "Inteligência Artificial",
    description: "Assistente virtual para atendimento e sugestões",
    icon: <Brain size={24} className="text-primary" />,
    link: "/organization/settings/integracoes/chatgpt", 
    active: false,
    about: "Integre o poder do ChatGPT da OpenAI para criar assistentes virtuais, gerar conteúdo, analisar dados e automatizar processos.",
    features: [
      "Assistente virtual para clientes",
      "Análise de documentos",
      "Sugestões inteligentes",
      "Geração de relatórios",
      "Treinamento personalizado"
    ]
  },
  {
    id: "claude",
    name: "CLAUDE",
    category: "Inteligência Artificial",
    description: "Assistência avançada para análise de documentos e conteúdo",
    icon: <Brain size={24} className="text-primary" />,
    link: "/organization/settings/integracoes/claude", 
    active: false,
    about: "Claude da Anthropic é um assistente AI avançado com foco em segurança e ética, ideal para análise de documentos complexos e geração de conteúdo especializado.",
    features: [
      "Análise profunda de documentos",
      "Sumarização inteligente",
      "Respostas com citação de fontes",
      "Processamento de documentos médicos",
      "Geração de conteúdo especializado"
    ]
  },
  {
    id: "kentro",
    name: "KENTRO CRM",
    category: "CRM",
    description: "Gestão completa de relacionamento com clientes e pacientes",
    icon: <Truck size={24} className="text-primary" />,
    link: "/organization/settings/integracoes/kentro", 
    active: false,
    about: "Kentro CRM oferece uma solução completa para gestão de relacionamento com clientes, pacientes e parceiros, com foco na jornada completa.",
    features: [
      "Gestão de leads e oportunidades",
      "Jornada do cliente",
      "Automação de marketing",
      "Pesquisas de satisfação",
      "Relatórios e insights"
    ]
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

export default function IntegracoesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [apiKey, setApiKey] = useState("");
  
  // Buscar configurações salvas de integrações (simulado)
  const { data: savedIntegrations, isLoading } = useQuery({
    queryKey: ['/api/organizations/integrations'],
    enabled: !!user?.organizationId,
  });
  
  // Função para ativar/desativar integração
  const toggleIntegration = (integrationId: string, status: boolean) => {
    toast({
      title: status ? "Integração ativada" : "Integração desativada",
      description: `A integração ${integrationId.toUpperCase()} foi ${status ? 'ativada' : 'desativada'} com sucesso.`,
    });
  };
  
  // Função para salvar configurações de integração
  const saveIntegrationSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações da integração foram salvas com sucesso.",
    });
  };

  return (
    <div className="container p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Integrações</h1>
          <p className="text-muted-foreground">Gerencie todas as integrações disponíveis para sua organização</p>
        </div>
      </div>
      
      {selectedIntegration ? (
        // Visualização de integração específica
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2"
              onClick={() => setSelectedIntegration(null)}
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Voltar para todas as integrações
            </Button>
            
            <Switch 
              checked={selectedIntegration.active} 
              onCheckedChange={(checked) => toggleIntegration(selectedIntegration.id, checked)}
            />
          </div>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                {selectedIntegration.icon}
                <div>
                  <CardTitle className="text-xl font-bold">{selectedIntegration.name}</CardTitle>
                  <CardDescription>{selectedIntegration.category}</CardDescription>
                </div>
              </div>
              <Badge 
                variant={selectedIntegration.active ? "outline" : "secondary"}
                className={selectedIntegration.active ? "bg-green-50 text-green-700" : ""}
              >
                {selectedIntegration.active ? "Ativo" : "Inativo"}
              </Badge>
            </CardHeader>
            
            <CardContent className="pt-6">
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="settings">Configurações</TabsTrigger>
                  <TabsTrigger value="logs">Registros</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <p className="text-gray-600">{selectedIntegration.about}</p>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Recursos</h3>
                    <ul className="space-y-2">
                      {selectedIntegration.features.map((feature: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-500 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Alert className="mt-6 bg-blue-50 border-blue-200">
                    <Plug className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800">Integração disponível</AlertTitle>
                    <AlertDescription className="text-blue-700">
                      Esta integração está disponível para sua organização. Configure-a na aba Configurações.
                    </AlertDescription>
                  </Alert>
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-4">
                  <div className="space-y-4">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="api-key">Chave de API</Label>
                        <Input 
                          id="api-key" 
                          value={apiKey} 
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="Insira sua chave de API" 
                        />
                        <p className="text-xs text-gray-500">
                          Encontre sua chave de API no painel do desenvolvedor de {selectedIntegration.name}.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="webhook">URL de Webhook</Label>
                        <div className="flex gap-2">
                          <Input 
                            id="webhook" 
                            value={`https://api.endurancy.com.br/webhooks/${selectedIntegration.id}/${user?.organizationId}`} 
                            readOnly 
                          />
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              navigator.clipboard.writeText(`https://api.endurancy.com.br/webhooks/${selectedIntegration.id}/${user?.organizationId}`);
                              toast({
                                title: "URL copiada",
                                description: "URL de webhook copiada para a área de transferência."
                              });
                            }}
                          >
                            Copiar
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Configure esta URL no painel do desenvolvedor de {selectedIntegration.name} para receber eventos.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Configurações adicionais</h4>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="automate-notifications" className="text-sm font-medium">Notificações automáticas</Label>
                            <p className="text-xs text-gray-500">Enviar notificações automáticas</p>
                          </div>
                          <Switch id="automate-notifications" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="data-sync" className="text-sm font-medium">Sincronização de dados</Label>
                            <p className="text-xs text-gray-500">Sincronizar dados automaticamente</p>
                          </div>
                          <Switch id="data-sync" defaultChecked />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                      <Button onClick={saveIntegrationSettings}>Salvar configurações</Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="logs" className="space-y-4">
                  <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">15 Abr 2025 - 14:32:15</p>
                        <p className="text-xs text-gray-500">Sincronização realizada com sucesso</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">15 Abr 2025 - 12:15:40</p>
                        <p className="text-xs text-gray-500">API conectada e autenticada</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">15 Abr 2025 - 10:05:22</p>
                        <p className="text-xs text-gray-500">Webhook configurado com sucesso</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">15 Abr 2025 - 09:30:18</p>
                        <p className="text-xs text-gray-500">Integração ativada</p>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className="border-t p-4 flex justify-between">
              <Button variant="outline" onClick={() => setSelectedIntegration(null)}>Voltar</Button>
              {!selectedIntegration.active ? (
                <Button onClick={() => toggleIntegration(selectedIntegration.id, true)}>Ativar Integração</Button>
              ) : (
                <Button variant="destructive" onClick={() => toggleIntegration(selectedIntegration.id, false)}>Desativar</Button>
              )}
            </CardFooter>
          </Card>
        </div>
      ) : (
        // Lista de todas as integrações
        <div className="space-y-8">
          {Object.entries(groupedIntegrations).map(([category, categoryIntegrations]) => (
            <div key={category} className="space-y-4">
              <h3 className="text-lg font-medium">{category}</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoryIntegrations.map((integration) => (
                  <Card 
                    key={integration.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedIntegration(integration)}
                  >
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
                      <p className="text-sm text-gray-600">{integration.description}</p>
                    </CardContent>
                    
                    <CardFooter className="border-t px-6 py-4">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIntegration(integration);
                        }}
                      >
                        Configurar
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}