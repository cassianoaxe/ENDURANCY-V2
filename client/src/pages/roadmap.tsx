import React from 'react';
import { ArrowLeft, Calendar, Check, ChevronRight, Clock, Sparkles, Star, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const RoadmapPage = () => {
  const roadmapData = [
    {
      period: 'Maio 2025',
      title: 'Fase 1 – Validação da Ideia e Planejamento',
      description: 'Estabelecimento das bases do projeto com pesquisa, planejamento e estruturação legal.',
      features: [
        'Pesquisa com médicos e pacientes sobre necessidades e preferências',
        'Definição do escopo mínimo viável (MVP)',
        'Planejamento estratégico e técnico',
        'Estruturação legal e jurídica da operação (LGPD, Termos)'
      ],
      status: 'completed',
      highlight: false
    },
    {
      period: 'Maio-Junho 2025',
      title: 'Fase 2 – Design e Prototipagem',
      description: 'Desenvolvimento da interface e experiência do usuário para todos os stakeholders do sistema.',
      features: [
        'Criação dos fluxos de usuário (ORGANIZAÇÕES, PACIENTE, MÉDICOS, FORNECEDORES)',
        'Protótipo navegável (mobile-pwa) com principais telas para ambiente de paciente',
        'Testes de usabilidade com gestores'
      ],
      status: 'completed',
      highlight: false
    },
    {
      period: 'Junho-Julho 2025',
      title: 'Fase 3 – Desenvolvimento do MVP',
      description: 'Implementação das funcionalidades essenciais e integrações com sistemas externos.',
      features: [
        'Cadastro e autenticação de gestores, médicos, fornecedores e pacientes',
        'Sistema de Laboratório integrando com END',
        'Módulo de agendamento de médicos integrado',
        'Integração com prescrição via Memed',
        'Integração com plataforma de pagamentos (Asaas/Zoop)'
      ],
      status: 'inProgress',
      highlight: true
    },
    {
      period: 'Julho 2025',
      title: 'Fase 4 – Segurança, Testes e Conformidade',
      description: 'Garantia da segurança e conformidade com regulamentações aplicáveis ao setor médico.',
      features: [
        'Implementação de autenticação segura (2FA, criptografia)',
        'Testes de stress, usabilidade e fluxo real',
        'Ajustes para conformidade com LGPD e CFM',
        'Política de privacidade, termos de uso e auditoria'
      ],
      status: 'planned'
    },
    {
      period: 'Agosto 2025',
      title: 'Fase 5 – Lançamento Beta Controlado',
      description: 'Abertura do sistema para um grupo seleto de usuários para testes e refinamentos.',
      features: [
        'Abertura para os betatesters parceiros convidados',
        'Monitoramento de KPIs, falhas e feedbacks em tempo real',
        'Suporte técnico e onboarding personalizado'
      ],
      status: 'planned'
    },
    {
      period: 'Setembro-Outubro 2025',
      title: 'Fase 6 – Lançamento Oficial e Expansão',
      description: 'Disponibilização do sistema para o mercado em geral com estratégia de marketing estruturada.',
      features: [
        'Abertura nacional com marketing estruturado',
        'Parcerias com clínicas e associações',
        'Lançamento do app na Expocannabis',
        'Módulos avançados seguem sendo liberados'
      ],
      status: 'planned'
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
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => window.location.href = "/pre-cadastro"}
            >
              Pré-cadastro
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
              Conheça nossa visão e planejamento para os próximos meses. Estamos construindo
              a plataforma mais completa de gerenciamento logístico e de afiliados no Brasil.
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
              Junte-se a nós no desenvolvimento da mais completa plataforma de gerenciamento logístico e de afiliados no Brasil.
              Sua contribuição e feedback são essenciais para construirmos um produto que atenda às reais necessidades do mercado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="bg-white text-green-900 hover:bg-green-100"
                onClick={() => window.location.href = "/pre-cadastro"}
              >
                Faça seu Pré-cadastro
                <ChevronRight className="ml-1 h-5 w-5" />
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