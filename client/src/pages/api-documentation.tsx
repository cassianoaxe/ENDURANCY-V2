import React from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Code, 
  Zap, 
  Shield, 
  Globe, 
  Database, 
  Cpu, 
  Network, 
  FileText, 
  ExternalLink,
  CheckCircle,
  ArrowRight,
  Download,
  Copy,
  Book,
  Puzzle,
  Users,
  Building,
  Smartphone,
  Monitor,
  Cloud,
  Lock
} from "lucide-react";

const ApiDocumentationPage = () => {
  const integrationApps = [
    {
      name: "WhatsApp Business",
      description: "Integração completa com WhatsApp para notificações e comunicação",
      status: "Ativo",
      category: "Comunicação",
      icon: <Smartphone className="h-6 w-6" />,
      endpoints: 3
    },
    {
      name: "Sistema Financeiro",
      description: "Conecte seu ERP ou sistema contábil",
      status: "Ativo", 
      category: "Financeiro",
      icon: <Database className="h-6 w-6" />,
      endpoints: 12
    },
    {
      name: "Portal de Laboratórios",
      description: "Integração com equipamentos e sistemas LIMS",
      status: "Ativo",
      category: "Laboratório",
      icon: <Monitor className="h-6 w-6" />,
      endpoints: 8
    },
    {
      name: "ANVISA Connect",
      description: "Integração direta com sistemas regulatórios",
      status: "Beta",
      category: "Regulatório",
      icon: <Shield className="h-6 w-6" />,
      endpoints: 5
    },
    {
      name: "Mobile App SDK",
      description: "SDK para desenvolvimento de apps móveis",
      status: "Ativo",
      category: "Mobile",
      icon: <Smartphone className="h-6 w-6" />,
      endpoints: 15
    },
    {
      name: "Cloud Storage",
      description: "Integração com AWS, Google Cloud e Azure",
      status: "Ativo",
      category: "Infraestrutura",
      icon: <Cloud className="h-6 w-6" />,
      endpoints: 6
    }
  ];

  const apiFeatures = [
    {
      title: "RESTful API",
      description: "API REST completa com padrões modernos",
      icon: <Globe className="h-8 w-8 text-white" />,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Autenticação Segura",
      description: "OAuth 2.0, JWT e API Keys",
      icon: <Lock className="h-8 w-8 text-white" />,
      gradient: "from-green-500 to-emerald-500"
    },
    {
      title: "Rate Limiting",
      description: "Controle de taxa e throttling inteligente",
      icon: <Zap className="h-8 w-8 text-white" />,
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      title: "Webhooks",
      description: "Notificações em tempo real para eventos",
      icon: <Network className="h-8 w-8 text-white" />,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "SDKs Múltiplos",
      description: "JavaScript, Python, PHP, .NET e mais",
      icon: <Code className="h-8 w-8 text-white" />,
      gradient: "from-red-500 to-rose-500"
    },
    {
      title: "Monitoramento",
      description: "Analytics e métricas em tempo real",
      icon: <Cpu className="h-8 w-8 text-white" />,
      gradient: "from-indigo-500 to-purple-500"
    }
  ];

  const quickStartCode = `// Inicialização do SDK Endurancy
import { EndurancyAPI } from '@endurancy/sdk';

const api = new EndurancyAPI({
  apiKey: 'sua_api_key_aqui',
  environment: 'production' // ou 'sandbox'
});

// Exemplo: Buscar dados de organização
const organization = await api.organizations.get('org_id');

// Exemplo: Criar um novo ticket
const ticket = await api.tickets.create({
  title: 'Problema no sistema',
  description: 'Descrição detalhada...',
  priority: 'high',
  module: 'patrimonio'
});

// Exemplo: Configurar webhook
api.webhooks.subscribe('ticket.created', {
  url: 'https://seu-site.com/webhook',
  events: ['created', 'updated', 'resolved']
});`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 border-b border-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-pink-600/90"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12">
            <div className="text-center relative z-10">
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-full shadow-xl animate-pulse">
                  <Code className="h-16 w-16 text-white" />
                </div>
              </div>
              <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                API Endurancy
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-2">
                Conecte seu sistema ao ecossistema Endurancy com nossa API robusta e flexível. 
              </p>
              <p className="text-lg text-purple-200 max-w-2xl mx-auto">
                Integre facilmente módulos de gestão, laboratório, patrimônio e muito mais.
              </p>
              <div className="mt-10 flex justify-center space-x-6">
                <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0 shadow-xl transform hover:scale-105 transition-all duration-200">
                  <Book className="h-5 w-5 mr-2" />
                  Começar Agora
                </Button>
                <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-purple-600 shadow-xl transform hover:scale-105 transition-all duration-200">
                  <Download className="h-5 w-5 mr-2" />
                  Download SDK
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Características da API */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Por que escolher nossa API?
            </h2>
            <p className="text-lg text-gray-600">
              Desenvolvida para alta performance, segurança e facilidade de uso
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {apiFeatures.map((feature, index) => (
              <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
                <div className={`bg-gradient-to-br ${feature.gradient} p-6`}>
                  <CardHeader className="text-center p-0">
                    <div className="flex justify-center mb-4">
                      <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                        {feature.icon}
                      </div>
                    </div>
                    <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                  </CardHeader>
                </div>
                <CardContent className="p-6 bg-white">
                  <p className="text-gray-600 text-center">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Start */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-xl shadow-2xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-cyan-600/20"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="bg-white/20 p-3 rounded-full mr-4">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">Quick Start</h2>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-white">Primeiros Passos</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-emerald-300 mr-3 mt-0.5" />
                      <div>
                        <p className="font-medium text-white">1. Obtenha sua API Key</p>
                        <p className="text-sm text-emerald-100">Registre-se e gere suas credenciais de acesso</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-emerald-300 mr-3 mt-0.5" />
                      <div>
                        <p className="font-medium text-white">2. Instale o SDK</p>
                        <p className="text-sm text-emerald-100">npm install @endurancy/sdk</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-emerald-300 mr-3 mt-0.5" />
                      <div>
                        <p className="font-medium text-white">3. Faça sua primeira chamada</p>
                        <p className="text-sm text-emerald-100">Configure e teste a integração</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <Button className="w-full bg-white text-teal-600 hover:bg-gray-100" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Ver Documentação Completa
                    </Button>
                    <Button className="w-full bg-white text-teal-600 hover:bg-gray-100" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Playground de API
                    </Button>
                  </div>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-medium">Exemplo de Código</h4>
                  <Button size="sm" variant="ghost" className="text-white hover:bg-gray-800">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                  <pre className="text-green-400 text-sm overflow-x-auto">
                    <code>{quickStartCode}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Apps Integrados */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ecossistema de Integrações
            </h2>
            <p className="text-lg text-gray-600">
              Conheça as aplicações que já se conectam com nossa plataforma
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrationApps.map((app, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        {app.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{app.name}</CardTitle>
                        <Badge 
                          variant={app.status === 'Ativo' ? 'default' : 'secondary'}
                          className="mt-1"
                        >
                          {app.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{app.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {app.endpoints} endpoints
                    </span>
                    <Badge variant="outline">{app.category}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Links de Recursos */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Recursos para Desenvolvedores</h2>
              <p className="text-blue-100 text-lg">
                Tudo que você precisa para integrar com sucesso
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/10 rounded-lg p-6 text-center">
                <Book className="h-8 w-8 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Documentação</h3>
                <p className="text-sm text-blue-100 mb-4">Guias completos e referência da API</p>
                <Button variant="secondary" size="sm" className="w-full">
                  Acessar
                </Button>
              </div>
              
              <div className="bg-white/10 rounded-lg p-6 text-center">
                <Puzzle className="h-8 w-8 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">SDKs</h3>
                <p className="text-sm text-blue-100 mb-4">Bibliotecas para diferentes linguagens</p>
                <Button variant="secondary" size="sm" className="w-full">
                  Download
                </Button>
              </div>
              
              <div className="bg-white/10 rounded-lg p-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Comunidade</h3>
                <p className="text-sm text-blue-100 mb-4">Fórum de desenvolvedores e suporte</p>
                <Button variant="secondary" size="sm" className="w-full">
                  Participar
                </Button>
              </div>
              
              <div className="bg-white/10 rounded-lg p-6 text-center">
                <Building className="h-8 w-8 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Partner Program</h3>
                <p className="text-sm text-blue-100 mb-4">Torne-se um parceiro oficial</p>
                <Button variant="secondary" size="sm" className="w-full">
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="text-center bg-white rounded-xl shadow-lg p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Pronto para começar?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de desenvolvedores que já estão construindo soluções incríveis 
            com a API Endurancy.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Code className="h-5 w-5 mr-2" />
              Começar Desenvolvimento
            </Button>
            <Button variant="outline" size="lg">
              <Users className="h-5 w-5 mr-2" />
              Falar com Especialista
            </Button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">API Endurancy</h3>
              <p className="text-gray-400">
                Plataforma de integração para o ecossistema de gestão empresarial.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Documentação</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Guia de Início</a></li>
                <li><a href="#" className="hover:text-white">Referência da API</a></li>
                <li><a href="#" className="hover:text-white">Webhooks</a></li>
                <li><a href="#" className="hover:text-white">Autenticação</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">SDKs</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">JavaScript</a></li>
                <li><a href="#" className="hover:text-white">Python</a></li>
                <li><a href="#" className="hover:text-white">PHP</a></li>
                <li><a href="#" className="hover:text-white">.NET</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Fórum</a></li>
                <li><a href="#" className="hover:text-white">Status da API</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
                <li><a href="#" className="hover:text-white">Termos de Uso</a></li>
              </ul>
            </div>
          </div>
          <Separator className="my-8 bg-gray-700" />
          <div className="text-center text-gray-400">
            <p>&copy; 2025 Endurancy API. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ApiDocumentationPage;