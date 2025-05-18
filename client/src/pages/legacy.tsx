import React from 'react';
import { ArrowLeft, Clock, Award, Database, Users, Activity, Heart, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const LegacyPage = () => {
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
      <section className="py-16 px-4 bg-green-800 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center mb-4">
            <Leaf className="h-10 w-10 text-green-300 mr-3" />
            <h1 className="text-5xl font-bold">Sistema Legacy</h1>
          </div>
          <p className="text-xl mb-8 leading-relaxed">
            O sistema que revolucionou a gestão de pacientes no Brasil (2018-2025)
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="flex items-center bg-green-700/50 px-4 py-2 rounded-lg">
              <Clock className="h-6 w-6 mr-2 text-green-300" />
              <span>7 anos de operação</span>
            </div>
            <div className="flex items-center bg-green-700/50 px-4 py-2 rounded-lg">
              <Database className="h-6 w-6 mr-2 text-green-300" />
              <span>+1 milhão de pedidos</span>
            </div>
            <div className="flex items-center bg-green-700/50 px-4 py-2 rounded-lg">
              <Activity className="h-6 w-6 mr-2 text-green-300" />
              <span>99.9% de disponibilidade</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold mb-4 text-green-800">Um Tributo ao Sistema Legacy</h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              O Legacy nos trouxe até aqui, nos somos gratos ao Legacy e sua dureza de sustentar mais de um milhão 
              de pedidos e mais de meio bilhão em reais movimentados junto com os parceiros de pagamentos. 
              O Legacy nunca ficou mais de 5 minutos fora do ar em todo esse tempo.
            </p>
          </div>

          {/* Dashboard Showcase */}
          <div className="mb-16 transform perspective-1000">
            <div className="relative rounded-lg overflow-hidden shadow-2xl border border-green-200 transform transition-transform duration-700 hover:rotate-y-10 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-tr from-green-900/70 via-transparent to-transparent pointer-events-none"></div>
              
              {/* Dashboard UI Mockup com cores que correspondem à imagem que você enviou */}
              <div className="bg-gray-900 text-white p-4">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center mr-2">
                    <Leaf className="h-4 w-4 text-white" />
                  </div>
                  <div className="font-bold">Dashboard do Sistema</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-black rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <div className="bg-green-800 p-1 rounded mr-2">
                        <Leaf className="h-4 w-4 text-green-300" />
                      </div>
                      <span className="text-xs text-gray-400">TOTAL DE PLANTAS</span>
                    </div>
                    <div className="font-bold text-xl">52184 TOTAL</div>
                    <div className="text-xs text-gray-400 flex justify-between">
                      <span>2765 VEGETATIVO</span>
                      <span>2012 FLORAÇÃO</span>
                    </div>
                  </div>
                  
                  <div className="bg-black rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <div className="bg-blue-800 p-1 rounded mr-2">
                        <Database className="h-4 w-4 text-blue-300" />
                      </div>
                      <span className="text-xs text-gray-400">TOTAL DE CLONES</span>
                    </div>
                    <div className="font-bold text-xl">52155 TOTAL</div>
                    <div className="text-xs text-gray-400 flex justify-between">
                      <span>0 MÊS ATUAL</span>
                      <span>85 MÊS PASSADO</span>
                    </div>
                  </div>
                  
                  <div className="bg-black rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <div className="bg-green-800 p-1 rounded mr-2">
                        <Heart className="h-4 w-4 text-green-300" />
                      </div>
                      <span className="text-xs text-gray-400">TOTAL DE COLHEITAS</span>
                    </div>
                    <div className="font-bold text-xl">50965 TOTAL</div>
                    <div className="text-xs text-gray-400 flex justify-between">
                      <span>185 MÊS ATUAL</span>
                      <span>0 MÊS PASSADO</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-black rounded-lg p-3 mb-4">
                  <div className="flex items-center mb-2">
                    <div className="bg-green-800 p-1 rounded mr-2">
                      <Leaf className="h-4 w-4 text-green-300" />
                    </div>
                    <span className="text-xs text-gray-400">TOTAL DE PLANTAS POR CATEGORIA</span>
                  </div>
                  <div className="font-bold text-xl">52184 TOTAL</div>
                  <div className="flex justify-between mt-2">
                    <div className="h-2 w-1/3 bg-orange-500 rounded-l"></div>
                    <div className="h-2 w-1/3 bg-green-500"></div>
                    <div className="h-2 w-1/3 bg-blue-500 rounded-r"></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>16235 (LARANJA)</span>
                    <span>33503 (VERDE)</span>
                    <span>2446 (AZUL)</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-400 rounded-lg p-2 text-xs">
                    <div className="font-bold">TESTE</div>
                    <div className="text-lg font-bold">64 TOTAL</div>
                    <div className="flex justify-between text-xs">
                      <span>9 VEGETATIVO</span>
                      <span>0 FLORAÇÃO</span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-500 rounded-lg p-2 text-xs">
                    <div className="font-bold">CHARLOTTE ANGEL</div>
                    <div className="text-lg font-bold">1281 TOTAL</div>
                    <div className="flex justify-between text-xs">
                      <span>26 VEGETATIVO</span>
                      <span>0 FLORAÇÃO</span>
                    </div>
                  </div>
                  
                  <div className="bg-green-500 rounded-lg p-2 text-xs">
                    <div className="font-bold">CALYX</div>
                    <div className="text-lg font-bold">1 TOTAL</div>
                    <div className="flex justify-between text-xs">
                      <span>0 VEGETATIVO</span>
                      <span>0 FLORAÇÃO</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-5">
              <div className="bg-green-100 text-green-900 px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center">
                <Award className="h-4 w-4 mr-2" />
                Dashboard do sistema que processou mais de 1 milhão de pedidos
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="p-6 shadow-md border-l-4 border-green-500">
              <h3 className="text-xl font-bold mb-3 text-green-700 flex items-center">
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
            
            <Card className="p-6 shadow-md border-l-4 border-green-500">
              <h3 className="text-xl font-bold mb-3 text-green-700 flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-500" />
                Conquistas Marcantes
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mt-1 mr-2">✓</span>
                  <span>Processou mais de <strong>1 milhão de pedidos</strong> com segurança</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mt-1 mr-2">✓</span>
                  <span>Movimentou mais de <strong>meio bilhão de reais</strong> em transações</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mt-1 mr-2">✓</span>
                  <span>Manteve <strong>99.9% de disponibilidade</strong> durante 7 anos</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mt-1 mr-2">✓</span>
                  <span>Nunca ficou mais de <strong>5 minutos fora do ar</strong></span>
                </li>
              </ul>
            </Card>
          </div>

          <div className="bg-green-50 p-8 rounded-lg shadow-inner mb-12">
            <h3 className="text-2xl font-bold mb-4 text-center text-green-800">Seguimos em Frente</h3>
            <p className="text-lg text-gray-700 text-center mb-6">
              O sistema Endurancy nasce dos aprendizados do Legacy, para construir o futuro com a mesma 
              dedicação e excelência, mas com tecnologias modernas e novos horizontes.
            </p>
            <div className="flex justify-center">
              <Button 
                size="lg"
                className="bg-green-700 hover:bg-green-800 text-white"
                onClick={() => window.location.href = "/roadmap"}
              >
                Conheça o Futuro no Roadmap
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-green-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-8 text-center text-green-800">
            Palavras dos Nossos Fundadores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 shadow-md border-t-4 border-green-500">
              <p className="italic text-gray-700 mb-4">
                "O Legacy foi o alicerce que possibilitou nosso crescimento exponencial. Sem ele, 
                não teríamos chegado até aqui. É com gratidão que honramos sua história enquanto 
                avançamos para o futuro."
              </p>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-700" />
                </div>
                <div className="ml-3">
                  <p className="font-bold text-green-900">Equipe de Fundadores</p>
                  <p className="text-sm text-gray-600">2018</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 shadow-md border-t-4 border-green-500">
              <p className="italic text-gray-700 mb-4">
                "Cada linha de código do Legacy carrega nossa missão e valores. Agora, com o Endurancy, 
                levamos esse legado adiante, construindo sobre uma base sólida para atender às necessidades 
                do amanhã."
              </p>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center">
                  <Award className="h-5 w-5 text-green-700" />
                </div>
                <div className="ml-3">
                  <p className="font-bold text-green-900">Diretoria Executiva</p>
                  <p className="text-sm text-gray-600">2025</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-900 text-green-100 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
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

export default LegacyPage;