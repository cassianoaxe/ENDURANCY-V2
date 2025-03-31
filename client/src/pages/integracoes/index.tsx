import React, { useState } from "react";
import { Link } from "wouter";
import {
  MessageSquare,
  CreditCard,
  Truck,
  BarChart4,
  Brain,
  Github,
  Search,
  ExternalLink,
  Users,
  Layout,
  Zap,
  Shuffle,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Definição das categorias de integração
interface IntegrationCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
}

// Definição da estrutura de integração
interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  categoryId: string;
  isActive: boolean;
  isPopular: boolean;
  url: string;
  docsUrl: string;
}

// Categorias disponíveis
const categories: IntegrationCategory[] = [
  {
    id: "todos",
    name: "Todos",
    icon: Layout,
    description: "Todas as integrações disponíveis na plataforma"
  },
  {
    id: "pagamentos",
    name: "Pagamentos",
    icon: CreditCard,
    description: "Processamento de pagamentos e gestão financeira"
  },
  {
    id: "comunicacao",
    name: "Comunicação",
    icon: MessageSquare,
    description: "Canais de comunicação com clientes e pacientes"
  },
  {
    id: "logistica",
    name: "Logística",
    icon: Truck,
    description: "Entrega, frete e gerenciamento de envios"
  },
  {
    id: "financeiro",
    name: "Gestão Financeira",
    icon: BarChart4,
    description: "Contabilidade, impostos e gestão financeira"
  },
  {
    id: "ia",
    name: "Inteligência Artificial",
    icon: Brain,
    description: "Recursos de IA para automação e insights"
  },
  {
    id: "crm",
    name: "CRM",
    icon: Users,
    description: "Gestão de relacionamento com clientes"
  },
  {
    id: "desenvolvimento",
    name: "Desenvolvimento",
    icon: Github,
    description: "Ferramentas para desenvolvedores e APIs"
  }
];

// Lista de integrações disponíveis
const integrations: Integration[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "Envie mensagens automáticas e notificações via WhatsApp para pacientes e clientes",
    icon: MessageSquare,
    categoryId: "comunicacao",
    isActive: true,
    isPopular: true,
    url: "/integracoes/comunicacao/whatsapp",
    docsUrl: "/documentacao/integracoes/whatsapp"
  },
  {
    id: "asaas",
    name: "Asaas",
    description: "Processe pagamentos via cartão, boleto, e PIX e gerencie cobranças recorrentes",
    icon: CreditCard,
    categoryId: "pagamentos",
    isActive: true,
    isPopular: true,
    url: "/integracoes/pagamentos/asaas",
    docsUrl: "/documentacao/integracoes/asaas"
  },
  {
    id: "zoop",
    name: "Zoop",
    description: "Plataforma de pagamentos com taxas competitivas e múltiplas opções",
    icon: CreditCard,
    categoryId: "pagamentos",
    isActive: true,
    isPopular: true,
    url: "/integracoes/pagamentos/zoop",
    docsUrl: "/documentacao/integracoes/zoop"
  },
  {
    id: "melhor-envio",
    name: "Melhor Envio",
    description: "Calcule fretes e gerencie envios com as principais transportadoras",
    icon: Truck,
    categoryId: "logistica",
    isActive: false,
    isPopular: true,
    url: "/integracoes/logistica/melhor-envio",
    docsUrl: "/documentacao/integracoes/melhor-envio"
  },
  {
    id: "azul-cargo",
    name: "Azul Cargo",
    description: "Integração direta com a Azul Cargo para envios aéreos rápidos",
    icon: Truck,
    categoryId: "logistica",
    isActive: false,
    isPopular: false,
    url: "/integracoes/logistica/azul-cargo",
    docsUrl: "/documentacao/integracoes/azul-cargo"
  },
  {
    id: "correios",
    name: "Correios",
    description: "Integração com os Correios para cálculo de frete e rastreamento",
    icon: Truck,
    categoryId: "logistica",
    isActive: false,
    isPopular: false,
    url: "/integracoes/logistica/correios",
    docsUrl: "/documentacao/integracoes/correios"
  },
  {
    id: "contaazul",
    name: "Conta Azul",
    description: "Sincronize dados financeiros com o Conta Azul para gestão contábil",
    icon: BarChart4,
    categoryId: "financeiro",
    isActive: false,
    isPopular: true,
    url: "/integracoes/financeiro/contaazul",
    docsUrl: "/documentacao/integracoes/contaazul"
  },
  {
    id: "telegram",
    name: "Telegram",
    description: "Envie mensagens e notificações via Telegram para seus clientes",
    icon: MessageSquare,
    categoryId: "comunicacao",
    isActive: false,
    isPopular: false,
    url: "/integracoes/comunicacao/telegram",
    docsUrl: "/documentacao/integracoes/telegram"
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    description: "Utilize o ChatGPT para automação de atendimento e análise de dados",
    icon: Brain,
    categoryId: "ia",
    isActive: false,
    isPopular: true,
    url: "/integracoes/ia/chatgpt",
    docsUrl: "/documentacao/integracoes/chatgpt"
  },
  {
    id: "claude",
    name: "Claude (Anthropic)",
    description: "Assistente de IA avançado para análises complexas e automação",
    icon: Brain,
    categoryId: "ia",
    isActive: false,
    isPopular: false,
    url: "/integracoes/ia/claude",
    docsUrl: "/documentacao/integracoes/claude"
  },
  {
    id: "kentro",
    name: "Kentro",
    description: "Plataforma de CRM especializada para gestão de relacionamento",
    icon: Users,
    categoryId: "crm",
    isActive: false,
    isPopular: false,
    url: "/integracoes/crm/kentro",
    docsUrl: "/documentacao/integracoes/kentro"
  },
  {
    id: "github",
    name: "GitHub",
    description: "Integração com GitHub para sincronização de código e issues",
    icon: Github,
    categoryId: "desenvolvimento",
    isActive: false,
    isPopular: false,
    url: "/integracoes/desenvolvimento/github",
    docsUrl: "/documentacao/integracoes/github"
  }
];

// Componente de card de integração
const IntegrationCard = ({ integration }: { integration: Integration }) => {
  const IconComponent = integration.icon;
  
  return (
    <Card className="overflow-hidden border hover:border-primary/50 transition-all hover:shadow-md">
      <Link href={integration.url}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <div className={`p-2 rounded-md ${integration.isActive ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                <IconComponent className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold">{integration.name}</h3>
                {integration.isPopular && (
                  <Badge variant="secondary" className="mt-1 bg-violet-100 text-violet-800 hover:bg-violet-100">
                    Popular
                  </Badge>
                )}
              </div>
            </div>
            <div>
              {integration.isActive ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  Ativo
                </Badge>
              ) : (
                <Badge variant="outline" className="border-gray-200 text-gray-500">
                  Inativo
                </Badge>
              )}
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            {integration.description}
          </p>
          <div className="flex justify-between items-center">
            <Button variant="outline" size="sm" asChild>
              <Link href={integration.url}>
                Configurar
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-gray-500">
              <Link href={integration.docsUrl}>
                <span className="flex items-center">
                  Documentação
                  <ExternalLink className="ml-1 h-3 w-3" />
                </span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

// Página principal de integrações
export default function Integracoes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("todos");
  
  // Filtragem de integrações com base na pesquisa e categoria selecionada
  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "todos" || integration.categoryId === activeCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Organizar integrações: primeiro as ativas, depois por popularidade
  const sortedIntegrations = [...filteredIntegrations].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    if (a.isPopular !== b.isPopular) return a.isPopular ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  
  // Obter a categoria atual
  const currentCategory = categories.find(category => category.id === activeCategory);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrações</h1>
          <p className="text-gray-500 mt-1">
            Conecte sua organização a diversos serviços externos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Shuffle className="mr-2 h-4 w-4" />
            Sincronizar Integrações
          </Button>
          <Button>
            <Sparkles className="mr-2 h-4 w-4" />
            Solicitar Nova Integração
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Pesquisar integrações..."
            className="pl-9 pr-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex-1">
          <Tabs defaultValue="todos" value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="w-full h-auto flex flex-wrap overflow-x-auto">
              {categories.map(category => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="flex items-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <category.icon className="h-4 w-4 mr-2" />
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {currentCategory && (
        <div className="mb-8 flex items-center p-4 rounded-md bg-blue-50 text-blue-800">
          <currentCategory.icon className="h-5 w-5 mr-3" />
          <div>
            <h2 className="font-semibold">{currentCategory.name}</h2>
            <p className="text-sm">{currentCategory.description}</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedIntegrations.length > 0 ? (
          sortedIntegrations.map(integration => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))
        ) : (
          <div className="col-span-3 py-16 flex flex-col items-center justify-center">
            <div className="p-4 rounded-full bg-gray-100">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium">Nenhuma integração encontrada</h3>
            <p className="text-gray-500 text-center max-w-md mt-2">
              Não encontramos integrações correspondentes aos critérios de busca. Tente outros termos ou categorias.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("todos");
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}