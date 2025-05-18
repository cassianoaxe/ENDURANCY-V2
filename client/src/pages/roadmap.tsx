import React from 'react';
import { ArrowLeft, Calendar, Check, ChevronRight, Clock, Sparkles, Star, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const RoadmapPage = () => {
  const roadmapData = [
    {
      period: 'Q4 2025 (Atual)',
      title: 'Lançamento do Portal do Fornecedor',
      description: 'Lançamento do nosso marketplace B2B para fornecedores de equipamentos laboratoriais e insumos de cultivo.',
      features: [
        'Marketplace B2B integrado',
        'Gestão de produtos e estoque',
        'Perfil personalizado para fornecedores',
        'Dashboard de análise de vendas',
        'Integração com sistema de pagamentos'
      ],
      status: 'inProgress',
      highlight: true
    },
    {
      period: 'Q1 2026',
      title: 'Aprimoramento do Módulo de Cultivo',
      description: 'Novas funcionalidades e melhorias no módulo de cultivo para atender as crescentes demandas do setor.',
      features: [
        'Monitoramento avançado de ciclos de cultivo',
        'Alertas e notificações em tempo real',
        'Controle de qualidade integrado',
        'Rastreabilidade aprimorada',
        'Análise preditiva de colheitas'
      ],
      status: 'planned'
    },
    {
      period: 'Q2 2026',
      title: 'Expansão do Sistema de Pesquisa Científica',
      description: 'Investimento em recursos para pesquisadores com ferramentas especializadas para estudos clínicos.',
      features: [
        'Banco de dados de literatura científica',
        'Ferramentas de análise estatística',
        'Colaboração entre pesquisadores',
        'Gestão de protocolos de pesquisa',
        'Integração com laboratórios parceiros'
      ],
      status: 'planned'
    },
    {
      period: 'Q3 2026',
      title: 'Lançamento do Portal Internacional',
      description: 'Expansão da plataforma para atender mercados internacionais com suporte multilíngue.',
      features: [
        'Suporte para múltiplos idiomas',
        'Conformidade com regulamentações internacionais',
        'Adaptação para diferentes moedas',
        'Logística internacional integrada',
        'Parcerias com entidades globais'
      ],
      status: 'planned'
    },
    {
      period: 'Q4 2026',
      title: 'Ecossistema de Aplicativos de Terceiros',
      description: 'Abertura da plataforma para integração com aplicativos de terceiros através de APIs públicas.',
      features: [
        'Marketplace de aplicativos',
        'APIs públicas documentadas',
        'SDK para desenvolvedores',
        'Programas de parceria',
        'Comunidade de desenvolvedores'
      ],
      status: 'planned'
    },
    {
      period: '2027',
      title: 'Inteligência Artificial Avançada',
      description: 'Implementação de recursos avançados de IA para otimização de processos em toda a plataforma.',
      features: [
        'Assistente virtual para usuários',
        'Previsão de demanda e tendências',
        'Otimização automática de cultivo',
        'Diagnóstico assistido por IA',
        'Personalização avançada da experiência do usuário'
      ],
      status: 'future'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              className="mr-2"
              onClick={() => window.location.href = "/"}
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Voltar
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              className="border-green-600 text-green-600 hover:bg-green-50"
              onClick={() => window.location.href = "/login"}
            >
              Entrar
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => window.location.href = "/organization-registration"}
            >
              Cadastre-se
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 bg-green-900 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center">
            <Badge variant="secondary" className="mb-4 bg-green-700 text-white hover:bg-green-700">
              <Calendar className="mr-1 h-3.5 w-3.5" />
              <span>Roadmap 2025-2027</span>
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              O Futuro da Plataforma Endurancy
            </h1>
            <p className="text-lg text-green-100 max-w-3xl mx-auto mb-8">
              Conheça nossa visão e planejamento para os próximos anos. Estamos construindo
              a plataforma mais completa para o setor medicinal cannabidiol no Brasil.
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-green-700 text-white rounded-full">
              <Sparkles className="h-5 w-5 mr-2 text-yellow-300" />
              <span className="font-medium">Apresentação especial na Expocannabis 2025</span>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8">
            {roadmapData.map((item, index) => (
              <Card 
                key={index} 
                className={`p-6 relative overflow-hidden ${
                  item.highlight ? 'border-green-500 shadow-lg' : ''
                }`}
              >
                {item.highlight && (
                  <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
                    <div className="absolute transform rotate-45 bg-green-500 text-white font-medium py-1 text-xs text-center w-28 top-5 right-[-20px]">
                      Atual
                    </div>
                  </div>
                )}
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex-shrink-0 w-full md:w-48">
                    <Badge variant={
                      item.status === 'inProgress' ? 'default' :
                      item.status === 'planned' ? 'outline' : 'secondary'
                    } className="mb-2">
                      {item.status === 'inProgress' && <Clock className="mr-1 h-3.5 w-3.5" />}
                      {item.status === 'planned' && <Calendar className="mr-1 h-3.5 w-3.5" />}
                      {item.status === 'future' && <Star className="mr-1 h-3.5 w-3.5" />}
                      <span>
                        {item.status === 'inProgress' ? 'Em andamento' :
                         item.status === 'planned' ? 'Planejado' : 'Visão futura'}
                      </span>
                    </Badge>
                    <h3 className="text-base font-semibold text-muted-foreground">{item.period}</h3>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-2 flex items-center">
                      {item.title}
                      {item.status === 'inProgress' && (
                        <Badge variant="default" className="ml-2 bg-green-500">Novo</Badge>
                      )}
                    </h2>
                    <p className="text-muted-foreground mb-4">{item.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {item.features.map((feature, i) => (
                        <div key={i} className="flex items-start">
                          <div className={`flex-shrink-0 rounded-full p-1 mt-0.5 ${
                            item.status === 'inProgress' ? 'bg-green-100 text-green-600' :
                            item.status === 'planned' ? 'bg-blue-100 text-blue-500' : 
                            'bg-purple-100 text-purple-500'
                          }`}>
                            <Check className="h-3 w-3" />
                          </div>
                          <span className="ml-2 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-900 to-green-800 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6">
              <Trophy className="h-12 w-12 text-yellow-400" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Faça Parte desta Jornada</h2>
            <p className="text-lg text-green-100 max-w-3xl mx-auto mb-8">
              Junte-se a nós no desenvolvimento da mais completa plataforma para o setor medicinal cannabidiol.
              Sua contribuição e feedback são essenciais para construirmos um produto que atenda às reais necessidades do mercado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="bg-white text-green-900 hover:bg-green-100"
                onClick={() => window.location.href = "/organization-registration"}
              >
                Cadastre-se Agora
                <ChevronRight className="ml-1 h-5 w-5" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-green-800"
                onClick={() => window.location.href = "/login"}
              >
                Acesse a Plataforma
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-900 text-green-100 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="border-t border-green-800 mt-6 pt-6 text-center text-green-400">
            <p>&copy; {new Date().getFullYear()} Endurancy. Todos os direitos reservados.</p>
            <p className="mt-2 text-sm">
              <a href="/" className="text-green-300 hover:text-white">Voltar para a página inicial</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RoadmapPage;