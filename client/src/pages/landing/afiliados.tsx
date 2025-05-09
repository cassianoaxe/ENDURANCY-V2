import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Trophy, 
  Gift, 
  DollarSign, 
  CheckCircle, 
  TrendingUp, 
  Star, 
  Zap,
  BarChart2,
  Award,
  Clock,
  Repeat
} from "lucide-react";

const LandingAfiliadosPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary/10 to-background"></div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
          <Badge variant="outline" className="mb-4">Programa Exclusivo</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Programa de Afiliados ComplySoft
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mb-10">
            Indique, cresça e seja recompensado. Um programa de três níveis que beneficia associações, 
            empresas e usuários da nossa plataforma SaaS.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="px-8">
              Comece Agora
            </Button>
            <Button size="lg" variant="outline">
              Saiba Mais
            </Button>
          </div>
        </div>
      </section>

      {/* Three Tiers Section */}
      <section className="py-20 container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Três Níveis de Afiliação</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Nossa plataforma oferece programas específicos para cada perfil de usuário
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-primary/20 hover:border-primary transition-colors">
            <CardHeader>
              <div className="mb-2 bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Associações</CardTitle>
              <CardDescription>
                Programa para associações de pacientes e coletivos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Membros que indicam novos membros acumulam pontos que podem ser utilizados dentro da própria associação.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Descontos em anuidades</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Benefícios exclusivos para membros</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Acesso a eventos especiais</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Ver Detalhes</Button>
            </CardFooter>
          </Card>

          <Card className="border-primary/20 hover:border-primary transition-colors">
            <CardHeader>
              <div className="mb-2 bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Empresas</CardTitle>
              <CardDescription>
                Programa para empresas e fornecedores parceiros
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Clientes que indicam novos clientes ganham pontos para utilizar nos produtos da empresa.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Descontos em produtos</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Acesso a produtos exclusivos</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Frete grátis em compras</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Ver Detalhes</Button>
            </CardFooter>
          </Card>

          <Card className="border-primary/20 hover:border-primary transition-colors">
            <CardHeader>
              <div className="mb-2 bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                <BarChart2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>ComplyPay</CardTitle>
              <CardDescription>
                Programa para usuários da plataforma SaaS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Clientes SaaS que indicam novos assinantes ganham pontos para reduzir taxas de assinatura.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Descontos em mensalidades</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Acesso a módulos premium</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Suporte prioritário</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Ver Detalhes</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Como Funciona</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Nosso programa de afiliados é simples, transparente e recompensador
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  1
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Indique</h3>
              <p className="text-muted-foreground">
                Compartilhe seu link único de indicação ou convide diretamente clientes e parceiros.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  2
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Acompanhe</h3>
              <p className="text-muted-foreground">
                Monitore suas indicações e veja os pontos acumulando em seu painel personalizado.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Gift className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Ganhe</h3>
              <p className="text-muted-foreground">
                Resgate seus pontos por descontos, recursos premium e benefícios exclusivos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Tabs */}
      <section className="py-20 container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Benefícios Por Perfil</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Escolha o programa que melhor se adapta ao seu perfil e comece a acumular benefícios
          </p>
        </div>

        <Tabs defaultValue="associations" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="associations">Associações</TabsTrigger>
            <TabsTrigger value="companies">Empresas</TabsTrigger>
            <TabsTrigger value="saas">ComplyPay SaaS</TabsTrigger>
          </TabsList>
          
          <TabsContent value="associations" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Pontos para a Comunidade</h3>
                    <p className="text-muted-foreground">
                      Os pontos podem ser utilizados para beneficiar toda a associação, como eventos comunitários e iniciativas sociais.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Renovações Facilitadas</h3>
                    <p className="text-muted-foreground">
                      Membros com indicações ativas podem ter descontos significativos em renovações de anuidade.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Recursos Exclusivos</h3>
                    <p className="text-muted-foreground">
                      Acesso a ferramentas e módulos exclusivos para melhorar a gestão da associação.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Reconhecimento</h3>
                    <p className="text-muted-foreground">
                      Programa de reconhecimento para os membros mais ativos com benefícios especiais.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="companies" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Descontos Crescentes</h3>
                    <p className="text-muted-foreground">
                      Quanto mais indicações, maiores os descontos em produtos e serviços da empresa.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Produtos Premium</h3>
                    <p className="text-muted-foreground">
                      Acesso antecipado a lançamentos de produtos e edições limitadas exclusivas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Rede de Contatos</h3>
                    <p className="text-muted-foreground">
                      Participação em uma rede exclusiva de empresas parceiras com oportunidades de negócios.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <Repeat className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Programa de Fidelidade</h3>
                    <p className="text-muted-foreground">
                      Sistema de recompensas cumulativas para clientes recorrentes e suas indicações.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="saas" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Descontos em Assinaturas</h3>
                    <p className="text-muted-foreground">
                      Reduza o valor de sua assinatura mensal com cada nova indicação ativa.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Recursos Avançados</h3>
                    <p className="text-muted-foreground">
                      Desbloqueie funcionalidades premium sem custos adicionais através de indicações.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Suporte Prioritário</h3>
                    <p className="text-muted-foreground">
                      Atendimento exclusivo e prioridade no suporte técnico para afiliados ativos.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <BarChart2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Consultoria Personalizada</h3>
                    <p className="text-muted-foreground">
                      Sessões de consultoria para maximizar o uso da plataforma em seu negócio.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para Começar?</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Junte-se ao nosso programa de afiliados e comece a colher os benefícios hoje mesmo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8">
              Cadastre-se Agora
            </Button>
            <Button size="lg" variant="outline">
              Fale com um Consultor
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingAfiliadosPage;