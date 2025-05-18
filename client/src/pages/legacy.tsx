import React from 'react';
import { ArrowLeft, Clock, Award, Database, Users, Activity, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const LegacyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
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
      <section className="py-16 px-4 bg-blue-800 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold mb-6">Legacy</h1>
          <p className="text-xl mb-8 leading-relaxed">
            Nosso sistema fundacional que nos trouxe até aqui (2018-2025)
          </p>
          <div className="flex justify-center space-x-4">
            <div className="flex items-center">
              <Clock className="h-6 w-6 mr-2 text-blue-300" />
              <span>7 anos de operação</span>
            </div>
            <div className="flex items-center">
              <Database className="h-6 w-6 mr-2 text-blue-300" />
              <span>+1 milhão de pedidos</span>
            </div>
            <div className="flex items-center">
              <Activity className="h-6 w-6 mr-2 text-blue-300" />
              <span>99.9% de disponibilidade</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold mb-4 text-blue-800">Um Tributo ao Sistema Legacy</h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              O Legacy nos trouxe até aqui, nos somos gratos ao Legacy e sua dureza de sustentar mais de um milhão 
              de pedidos e mais de meio bilhão em reais movimentados junto com os parceiros de pagamentos. 
              O Legacy nunca ficou mais de 5 minutos fora do ar em todo esse tempo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="p-6 shadow-md">
              <h3 className="text-xl font-bold mb-3 text-blue-700 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-red-500" />
                Nossa Jornada Compartilhada
              </h3>
              <p className="mb-4">
                Muitos desafios houveram devido às constantes atualizações de versões e aprimoramentos, 
                desenvolvimentos, mas chegou a hora de deixar o legado ali onde ele deve ficar, no registro 
                da memória, no legado que os nossos fundadores deixaram para nossa causa!
              </p>
              <p>
                Honremos quem nos honrou até aqui. Obrigado Legacy por tudo.
              </p>
            </Card>
            
            <Card className="p-6 shadow-md">
              <h3 className="text-xl font-bold mb-3 text-blue-700 flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-500" />
                Conquistas Marcantes
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mt-1 mr-2">✓</span>
                  <span>Processou mais de <strong>1 milhão de pedidos</strong> com segurança</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mt-1 mr-2">✓</span>
                  <span>Movimentou mais de <strong>meio bilhão de reais</strong> em transações</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mt-1 mr-2">✓</span>
                  <span>Manteve <strong>99.9% de disponibilidade</strong> durante 7 anos</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mt-1 mr-2">✓</span>
                  <span>Nunca ficou mais de <strong>5 minutos fora do ar</strong></span>
                </li>
              </ul>
            </Card>
          </div>

          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-4 text-center text-blue-800">Tela do Sistema Legacy</h3>
            <div className="relative rounded-lg overflow-hidden shadow-xl border border-gray-200">
              <div className="absolute inset-0 bg-blue-800/30 backdrop-blur-sm flex items-center justify-center">
                <p className="text-white font-bold text-lg px-6 py-4 bg-blue-900/70 rounded-lg">
                  Imagem com dados sensíveis protegidos
                </p>
              </div>
              <img 
                src="/legacy-screenshot.jpg" 
                alt="Captura de tela do sistema Legacy (dados sensíveis ocultados)" 
                className="w-full h-auto" 
              />
            </div>
            <p className="text-center text-gray-500 mt-2 text-sm">
              Captura de tela do painel de controle do sistema Legacy (2018-2025) - dados sensíveis ofuscados
            </p>
          </div>

          <div className="bg-blue-50 p-8 rounded-lg shadow-inner mb-12">
            <h3 className="text-2xl font-bold mb-4 text-center text-blue-800">Seguimos em Frente</h3>
            <p className="text-lg text-gray-700 text-center mb-6">
              O sistema Endurancy nasce dos aprendizados do Legacy, para construir o futuro com a mesma 
              dedicação e excelência, mas com tecnologias modernas e novos horizontes.
            </p>
            <div className="flex justify-center">
              <Button 
                size="lg"
                className="bg-blue-700 hover:bg-blue-800 text-white"
                onClick={() => window.location.href = "/roadmap"}
              >
                Conheça o Futuro no Roadmap
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-800">
            Palavras dos Nossos Fundadores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 shadow-md">
              <p className="italic text-gray-700 mb-4">
                "O Legacy foi o alicerce que possibilitou nosso crescimento exponencial. Sem ele, 
                não teríamos chegado até aqui. É com gratidão que honramos sua história enquanto 
                avançamos para o futuro."
              </p>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-700" />
                </div>
                <div className="ml-3">
                  <p className="font-bold text-blue-900">Equipe de Fundadores</p>
                  <p className="text-sm text-gray-600">2018</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 shadow-md">
              <p className="italic text-gray-700 mb-4">
                "Cada linha de código do Legacy carrega nossa missão e valores. Agora, com o Endurancy, 
                levamos esse legado adiante, construindo sobre uma base sólida para atender às necessidades 
                do amanhã."
              </p>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                  <Award className="h-5 w-5 text-blue-700" />
                </div>
                <div className="ml-3">
                  <p className="font-bold text-blue-900">Diretoria Executiva</p>
                  <p className="text-sm text-gray-600">2025</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-blue-100 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="border-t border-blue-800 mt-6 pt-6 text-center text-blue-400">
            <p>&copy; {new Date().getFullYear()} Endurancy. Todos os direitos reservados.</p>
            <p className="mt-2 text-sm">
              <a href="/" className="text-blue-300 hover:text-white">Voltar para a página inicial</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LegacyPage;